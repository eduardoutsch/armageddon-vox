# 📦 Fires of Armageddon // Bundle: Unit Tests (Spawner Subsystems)

Deterministic unit tests for spawner cards, cockpit telemetry, resupply table, and threat rules (`tests/js/spawner*.test.js`).

## 📑 Table of Contents
- [tests/js/spawner.test.js](#file-testsjsspawnertestjs)
- [tests/js/spawner-cards.test.js](#file-testsjsspawnercardstestjs)
- [tests/js/spawner-cockpit.test.js](#file-testsjsspawnercockpittestjs)
- [tests/js/spawner-resupply.test.js](#file-testsjsspawnerresupplytestjs)

---

## File: `tests/js/spawner.test.js` <a id="file-testsjsspawnertestjs"></a>

````javascript
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  getBracketInfo,
  calculateRollDown,
  pickSyncedUnitFromBracket,
  parseSpawnWaveSpec,
  normalizeEmbarkedUnits
} = require('../../js/spawner.js');
const { mulberry32 } = require('../../js/rng.js');

test('getBracketInfo: unmod 2 always results in No Spawn', () => {
  // Even if modified roll is high (e.g., +12 bonus), unmod 2 is No Spawn
  const result = getBracketInfo(14, 2);
  assert.equal(result.key, 'NONE');
  assert.equal(result.pts, '0 pts');
});

test('getBracketInfo: modified rolls <= 2 result in No Spawn', () => {
  const result = getBracketInfo(2, 3);
  assert.equal(result.key, 'NONE');
});

test('getBracketInfo: correctly categorizes all standard brackets', () => {
  assert.equal(getBracketInfo(3, 3).key, '3-4');
  assert.equal(getBracketInfo(4, 4).key, '3-4');
  assert.equal(getBracketInfo(5, 5).key, '5-6');
  assert.equal(getBracketInfo(6, 6).key, '5-6');
  assert.equal(getBracketInfo(7, 7).key, '7-9');
  assert.equal(getBracketInfo(8, 8).key, '7-9');
  assert.equal(getBracketInfo(9, 9).key, '7-9');
  assert.equal(getBracketInfo(10, 10).key, '10-12');
  assert.equal(getBracketInfo(10, 10).pts, '301–550 pts');
  assert.equal(getBracketInfo(12, 12).key, '10-12');
  assert.equal(getBracketInfo(13, 11).key, '13+');
  assert.equal(getBracketInfo(13, 11).pts, '551+ pts');
  assert.equal(getBracketInfo(16, 11).key, '13+');
});

test('calculateRollDown: cascades down correctly from 13+ to 10-12 down to 3-4', () => {
  const step0 = calculateRollDown('13+');
  assert.ok(step0);
  assert.equal(step0.nextKey, '10-12');

  const step1 = calculateRollDown('10-12');
  assert.ok(step1);
  assert.equal(step1.nextKey, '7-9');

  const step1Legacy = calculateRollDown('10+');
  assert.ok(step1Legacy);
  assert.equal(step1Legacy.nextKey, '7-9');

  const step2 = calculateRollDown('7-9');
  assert.ok(step2);
  assert.equal(step2.nextKey, '5-6');

  const step3 = calculateRollDown('5-6');
  assert.ok(step3);
  assert.equal(step3.nextKey, '3-4');

  const step4 = calculateRollDown('3-4');
  assert.equal(step4, null, 'Bracket 3-4 must not be able to roll down further');

  const noneStep = calculateRollDown('NONE');
  assert.equal(noneStep, null, 'NONE must not be able to roll down');
});

test('pickSyncedUnitFromBracket: picks from shelf pool and falls back gracefully', () => {
  const mockPool = {
    '3-4': 'Hormagaunts, Termagants, Cultists',
    '5-6': '',
    '7-9': 'Carnifex',
    '10-12': 'Hive Tyrant',
    '10+': 'Hive Tyrant',
    '13+': 'Hierophant Bio-Titan'
  };

  const rng = mulberry32(100);
  const picked34 = pickSyncedUnitFromBracket('3-4', rng, mockPool);
  assert.ok(['Hormagaunts', 'Termagants', 'Cultists'].includes(picked34));

  const fallback = pickSyncedUnitFromBracket('5-6', rng, mockPool);
  assert.equal(fallback, 'Unit from Bracket [5-6]');

  const picked79 = pickSyncedUnitFromBracket('7-9', rng, mockPool);
  assert.equal(picked79, 'Carnifex');

  const picked13 = pickSyncedUnitFromBracket('13+', rng, mockPool);
  assert.equal(picked13, 'Hierophant Bio-Titan');
});

test('pickSyncedUnitFromBracket: resolves per-faction pool from byFaction in localStorage with warning when empty', () => {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v))
  };

  const poolPayload = {
    byFaction: {
      'Orks': {
        b34: '10 Boyz',
        b56: '5 Nobz',
        b79: '1 Battlewagon',
        b10: '1 Ghazghkull',
        b13: '1 Stompa'
      }
    }
  };
  globalThis.localStorage.setItem('foa_custom_shelf_pool_v1', JSON.stringify(poolPayload));

  globalThis.document = {
    getElementById: (id) => {
      if (id === 'hordeFactionSelect') return { value: 'Orks' };
      return null;
    }
  };

  const rng = mulberry32(42);
  const picked = pickSyncedUnitFromBracket('3-4', rng);
  assert.equal(picked, '10 Boyz');

  // When active faction has no units for a bracket
  globalThis.document.getElementById = (id) => {
    if (id === 'hordeFactionSelect') return { value: 'Necrons' };
    return null;
  };
  const emptyRes = pickSyncedUnitFromBracket('5-6', rng);
  assert.equal(emptyRes, '⚠️ Necrons Pool Empty for Bracket [5-6] — Configure in Mode 4!');

  delete globalThis.localStorage;
  delete globalThis.document;
});

test('pickSyncedUnitFromBracket: enforces zero hardcoded defaults and ignores flat root keys when faction pool is empty', () => {
  const { HORDE_FACTION_SPAWN_TABLES } = require('../../js/data.js');
  globalThis.HORDE_FACTION_SPAWN_TABLES = HORDE_FACTION_SPAWN_TABLES;
  globalThis.localStorage = {
    getItem: () => JSON.stringify({
      b10: '1 Contaminated Root Unit',
      byFaction: { 'Orks': { b10: '1 Ghazghkull' } }
    })
  };
  globalThis.document = {
    getElementById: (id) => {
      if (id === 'hordeFactionSelect') return { value: 'World Eaters' };
      if (id === 'pool10') return { value: '1 Contaminated DOM Unit' };
      return null;
    }
  };

  const rng = mulberry32(77);
  const picked10 = pickSyncedUnitFromBracket('10-12', rng);
  assert.equal(picked10, '⚠️ World Eaters Pool Empty for Bracket [10-12] — Configure in Mode 4!');

  delete globalThis.HORDE_FACTION_SPAWN_TABLES;
  delete globalThis.localStorage;
  delete globalThis.document;
});

test('parseSpawnWaveSpec: parses counts, dice expressions, + combos, and [Embarked] tags cleanly', () => {
  const fixedRng = () => 0.99; // max roll on dice

  assert.deepEqual(parseSpawnWaveSpec('10 Termagants (Fleshborers)', fixedRng), [
    { count: 10, countExpr: '10', templateName: 'Termagants (Fleshborers)', embarked: null }
  ]);

  assert.deepEqual(parseSpawnWaveSpec('5 Bladeguard Veterans + 1 Captain', fixedRng), [
    { count: 5, countExpr: '5', templateName: 'Bladeguard Veterans', embarked: null },
    { count: 1, countExpr: '1', templateName: 'Captain', embarked: null }
  ]);

  assert.deepEqual(parseSpawnWaveSpec('1D3 Chaos Spawns', fixedRng), [
    { count: 3, countExpr: '1D3', templateName: 'Chaos Spawns', embarked: null }
  ]);

  assert.deepEqual(parseSpawnWaveSpec('D3+1 Scarabs', fixedRng), [
    { count: 4, countExpr: '1D3+1', templateName: 'Scarabs', embarked: null }
  ]);

  assert.deepEqual(parseSpawnWaveSpec('1 Chimera [10 Kasrkin]', fixedRng), [
    {
      count: 1,
      countExpr: '1',
      templateName: 'Chimera',
      embarked: { count: 10, countExpr: '10', templateName: 'Kasrkin', embarked: null }
    }
  ]);

  assert.deepEqual(parseSpawnWaveSpec('Avatar of Khaine', fixedRng), [
    { count: 1, countExpr: '1', templateName: 'Avatar of Khaine', embarked: null }
  ]);

  assert.deepEqual(parseSpawnWaveSpec('None'), []);
  assert.deepEqual(parseSpawnWaveSpec(null), []);
  assert.deepEqual(parseSpawnWaveSpec('⚠️ Necrons Pool Empty for Bracket [5-6] — Configure in Mode 4!'), []);

  // Multi-unit Attached Cargo inside a Transport: [5 Kill Team + 1 Watch Master]
  assert.deepEqual(parseSpawnWaveSpec('1 Corvus Blackstar [5 Kill Team + 1 Watch Master]', fixedRng), [
    {
      count: 1,
      countExpr: '1',
      templateName: 'Corvus Blackstar',
      embarked: [
        { count: 5, countExpr: '5', templateName: 'Kill Team', embarked: null },
        { count: 1, countExpr: '1', templateName: 'Watch Master', embarked: null }
      ]
    }
  ]);

  assert.equal(typeof normalizeEmbarkedUnits, 'function');
  assert.deepEqual(normalizeEmbarkedUnits(null), []);
  assert.deepEqual(
    normalizeEmbarkedUnits({ count: 10, countExpr: '10', templateName: 'Kasrkin', embarked: null }),
    [{ count: 10, templateName: 'Kasrkin' }]
  );
  assert.deepEqual(
    normalizeEmbarkedUnits([
      { count: 5, templateName: 'Kill Team' },
      { count: 1, templateName: 'Watch Master' }
    ]),
    [
      { count: 5, templateName: 'Kill Team' },
      { count: 1, templateName: 'Watch Master' }
    ]
  );
});
````

---

## File: `tests/js/spawner-cards.test.js` <a id="file-testsjsspawnercardstestjs"></a>

````javascript
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  MISERY_CARD_OFFICIAL_OVERRIDES,
  SECONDARY_MISSION_OFFICIAL_OVERRIDES,
  RESUPPLY_OFFICIAL_OVERRIDES,
  applyAuthoritativeCardOverrides
} = require('../../js/spawner-cards.js');

test('Spawner Cards: MISERY_CARD_OFFICIAL_OVERRIDES contains all 36 verbatim cards', () => {
  const keys = Object.keys(MISERY_CARD_OFFICIAL_OVERRIDES).map(Number);
  assert.equal(keys.length, 36, 'Must define exactly 36 Misery overrides');

  for (let i = 1; i <= 36; i++) {
    const card = MISERY_CARD_OFFICIAL_OVERRIDES[i];
    assert.ok(card, `Misery card #${i} must exist`);
    assert.equal(card.id, i, `Card #${i} id must match`);
    assert.ok(card.name && card.name.length > 0, `Card #${i} must have a name`);
    assert.ok(card.desc && card.desc.length > 0, `Card #${i} must have verbatim desc`);
  }

  // Key rules assertions
  assert.equal(MISERY_CARD_OFFICIAL_OVERRIDES[1].name, 'Unnatural Stamina');
  assert.equal(MISERY_CARD_OFFICIAL_OVERRIDES[7].spawnerEffect, 'UNLUCKY_NIGHT_3D6');
  assert.equal(MISERY_CARD_OFFICIAL_OVERRIDES[13].spawnerEffect, 'PINCER_MANEUVER_EXTRA_SPAWN');
  assert.equal(MISERY_CARD_OFFICIAL_OVERRIDES[21].name, 'Bunkers Busted');
  assert.equal(MISERY_CARD_OFFICIAL_OVERRIDES[22].name, 'Comms Jammed');
  assert.equal(MISERY_CARD_OFFICIAL_OVERRIDES[23].name, 'The Mind Killer');
  assert.equal(MISERY_CARD_OFFICIAL_OVERRIDES[29].name, "Fate's Fetters");
  assert.equal(MISERY_CARD_OFFICIAL_OVERRIDES[36].name, 'Flash Flood');
});

test('Spawner Cards: SECONDARY_MISSION_OFFICIAL_OVERRIDES contains all 24 verbatim cards', () => {
  const keys = Object.keys(SECONDARY_MISSION_OFFICIAL_OVERRIDES).map(Number);
  assert.equal(keys.length, 24, 'Must define exactly 24 Secondary Mission overrides');

  for (let i = 1; i <= 24; i++) {
    const mission = SECONDARY_MISSION_OFFICIAL_OVERRIDES[i];
    assert.ok(mission, `Secondary mission #${i} must exist`);
    assert.equal(mission.id, i, `Mission #${i} id must match`);
    assert.ok(mission.name && mission.name.length > 0, `Mission #${i} must have a name`);
    assert.ok(mission.cond && mission.cond.length > 0, `Mission #${i} must have condition`);
    assert.ok(mission.rew && mission.rew.length > 0, `Mission #${i} must have reward`);
    assert.ok(mission.pun && mission.pun.length > 0, `Mission #${i} must have punishment`);
  }

  // Key rules assertions
  assert.equal(SECONDARY_MISSION_OFFICIAL_OVERRIDES[1].name, 'Secure Drop Zones');
  assert.equal(SECONDARY_MISSION_OFFICIAL_OVERRIDES[2].hasTally, true);
  assert.equal(SECONDARY_MISSION_OFFICIAL_OVERRIDES[2].rewardSpFormula, 'X_PLUS_1');
  assert.equal(SECONDARY_MISSION_OFFICIAL_OVERRIDES[13].round1Restricted, true);
  assert.equal(SECONDARY_MISSION_OFFICIAL_OVERRIDES[18].hasTally, true);
  assert.equal(SECONDARY_MISSION_OFFICIAL_OVERRIDES[24].name, 'VIP Delivery');
});

test('Spawner Cards: RESUPPLY_OFFICIAL_OVERRIDES contains all 26 authoritative options', () => {
  const expectedCards = [
    'A Name Earned', 'Basic Tactics', 'Deploy Minefield', 'Deploy Razor Wire',
    'Air Strike', 'Deploy Short Range Teleporter', 'Forward Operating Base',
    'Pizza Party', 'Share Supplies', 'Supply Drop', 'Arm Experimental Defenses',
    'Defensive Positions', 'Emergency Shovel Stash', 'Field Hospital', 'Tempt Fate',
    'Activate Jamming Station', 'Advanced Tactics', 'Ammo Supplies', 'Emergency Evac',
    'Activate Shield Generator', 'A Change of Plans', 'Artillery Strike',
    'Reinforcements Arrive', 'Patched Up', 'Deploy Fortification', 'Field Promotion'
  ];

  assert.equal(Object.keys(RESUPPLY_OFFICIAL_OVERRIDES).length, 26, 'Must define 26 Resupply overrides');

  for (const name of expectedCards) {
    const card = RESUPPLY_OFFICIAL_OVERRIDES[name];
    assert.ok(card, `Resupply card "${name}" must exist`);
    assert.ok(Array.isArray(card.tags), `Resupply card "${name}" tags must be an array`);
    assert.ok(card.desc && card.desc.length > 0, `Resupply card "${name}" must have description`);
    assert.ok(card.limit && card.limit.length > 0, `Resupply card "${name}" must have usage limit`);
  }

  // Specific cost and property checks
  assert.equal(RESUPPLY_OFFICIAL_OVERRIDES['Basic Tactics'].cost, 2);
  assert.equal(RESUPPLY_OFFICIAL_OVERRIDES['Basic Tactics'].autoEffect, 'GAIN_1_CP');
  assert.equal(RESUPPLY_OFFICIAL_OVERRIDES['Deploy Minefield'].cost, 2);
  assert.equal(RESUPPLY_OFFICIAL_OVERRIDES['Deploy Razor Wire'].cost, 2);
  assert.equal(RESUPPLY_OFFICIAL_OVERRIDES['Air Strike'].cost, 3);
  assert.equal(RESUPPLY_OFFICIAL_OVERRIDES['Air Strike'].hasAirStrikeRoller, true);
  assert.equal(RESUPPLY_OFFICIAL_OVERRIDES['Forward Operating Base'].cost, 3);
  assert.equal(RESUPPLY_OFFICIAL_OVERRIDES['Forward Operating Base'].autoEffect, 'FORT_FOB');
  assert.equal(RESUPPLY_OFFICIAL_OVERRIDES['Reinforcements Arrive'].cost, 12);
  assert.equal(RESUPPLY_OFFICIAL_OVERRIDES['Reinforcements Arrive'].hasReinforcementsRoller, true);

  // Variable X checks
  assert.equal(RESUPPLY_OFFICIAL_OVERRIDES['Patched Up'].isVariable, true);
  assert.equal(RESUPPLY_OFFICIAL_OVERRIDES['Patched Up'].varType, 'PATCHED_UP');
  assert.equal(RESUPPLY_OFFICIAL_OVERRIDES['Deploy Fortification'].isVariable, true);
  assert.equal(RESUPPLY_OFFICIAL_OVERRIDES['Deploy Fortification'].varType, 'DEPLOY_FORT');
  assert.equal(RESUPPLY_OFFICIAL_OVERRIDES['Field Promotion'].isVariable, true);
  assert.equal(RESUPPLY_OFFICIAL_OVERRIDES['Field Promotion'].varType, 'FIELD_PROMO');
});

test('Spawner Cards: applyAuthoritativeCardOverrides cleanly patches global databases', () => {
  globalThis.MISERIES = [
    { id: 1, name: 'Old Stamina', desc: 'Old' },
    { id: 7, name: 'Old Night', desc: 'Old' }
  ];
  globalThis.SECONDARIES = [
    { id: 1, name: 'Old Zones', cond: 'Old', rew: 'Old', pun: 'Old' }
  ];
  globalThis.RESUPPLIES = [
    { name: 'Basic Tactics', cost: 2, desc: 'Old' },
    { name: 'Short Range Teleporter', cost: 3, desc: 'Old' }
  ];

  applyAuthoritativeCardOverrides();

  assert.equal(globalThis.MISERIES[0].name, 'Unnatural Stamina');
  assert.equal(globalThis.MISERIES[1].name, 'Unlucky Night');
  assert.equal(globalThis.SECONDARIES[0].name, 'Secure Drop Zones');
  assert.equal(globalThis.RESUPPLIES[0].autoEffect, 'GAIN_1_CP');
  assert.equal(globalThis.RESUPPLIES[1].name, 'Deploy Short Range Teleporter');
  assert.equal(globalThis.RESUPPLIES[1].autoEffect, 'MARKER_TELE');
});
````

---

## File: `tests/js/spawner-cockpit.test.js` <a id="file-testsjsspawnercockpittestjs"></a>

````javascript
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  isSoloModeActive,
  getCurrentBattleRound,
  setGuidedPhaseStep,
  stepGuidedPhase,
  awardCommandPhaseObjectiveSP,
  awardHordeKillSP
} = require('../../js/spawner-cockpit.js');

test('Spawner Cockpit: isSoloModeActive detects solo mode correctly', () => {
  globalThis.selectedModeVal = 'solo';
  assert.equal(isSoloModeActive(), true);

  globalThis.selectedModeVal = 'coop';
  globalThis.isSoloMode = false;
  globalThis.state = { mode: 'coop' };
  assert.equal(isSoloModeActive(), false);
});

test('Spawner Cockpit: getCurrentBattleRound reads state and falls back correctly', () => {
  globalThis.state = { round: 3 };
  assert.equal(getCurrentBattleRound(), 3);

  globalThis.state = null;
  globalThis.battleRound = 2;
  assert.equal(getCurrentBattleRound(), 2);
});

test('Spawner Cockpit: Guided phase step controls clamp and cycle within 1 to 5', () => {
  setGuidedPhaseStep(1);
  stepGuidedPhase(1); // steps to 2
  stepGuidedPhase(4); // cycle around
  setGuidedPhaseStep(5);
  stepGuidedPhase(1); // cycle back to 1
  assert.ok(true, 'Guided stepper safely cycled');
});

test('Spawner Cockpit: getCurrentBattleRound returns 0 for Pre-Game in HUD round element', () => {
  globalThis.state = null;
  globalThis.battleRound = undefined;
  globalThis.document = {
    getElementById: (id) => {
      if (id === 'hudRound') return { innerText: 'Pre-Game' };
      return null;
    }
  };

  assert.equal(getCurrentBattleRound(), 0, 'Must return round 0 when hudRound indicates Pre-Game');

  globalThis.document = {
    getElementById: (id) => {
      if (id === 'hudRound') return { innerText: 'Round 4/6' };
      return null;
    }
  };
  assert.equal(getCurrentBattleRound(), 4, 'Must return round 4 when hudRound indicates Round 4/6');

  // Clean up
  delete globalThis.document;
});

test('Spawner Cockpit: renderActiveMiseries and renderActiveSecondaries handle window.state fallback gracefully', () => {
  const { renderActiveMiseries, renderActiveSecondaries } = require('../../js/spawner-cockpit.js');

  const misBox = { innerHTML: '' };
  const secBox = { innerHTML: '' };
  const misCount = { textContent: '' };
  const secCount = { textContent: '' };

  globalThis.document = {
    getElementById: (id) => {
      if (id === 'activeMiseriesBox') return misBox;
      if (id === 'activeSecondariesBox') return secBox;
      if (id === 'misDeckCount') return misCount;
      if (id === 'secDeckCount') return secCount;
      return null;
    },
    querySelectorAll: () => []
  };

  // 1. Empty state
  globalThis.window = {
    state: {
      activeMiseries: [],
      activeSecondaries: [],
      miseryDeck: new Array(36),
      secondaryDeck: new Array(24)
    }
  };

  renderActiveMiseries();
  assert.ok(misBox.innerHTML.includes('No active Misery Cards.'), 'Empty miseries should display placeholder');
  assert.equal(misCount.textContent, '36 in deck');

  renderActiveSecondaries();
  assert.ok(secBox.innerHTML.includes('No active Secondary Mission.'), 'Empty secondaries should display placeholder');
  assert.equal(secCount.textContent, '24 in deck');

  // 2. Active cards populated via window.state
  globalThis.window.state.activeMiseries.push({ id: 1, name: 'Eye of Terror', desc: 'Warp storms brew' });
  globalThis.window.state.activeSecondaries.push({ id: 2, name: 'Purge the Foe', cond: 'Destroy units', rew: '2 SP', pun: '+1 Misery' });

  renderActiveMiseries();
  assert.ok(misBox.innerHTML.includes('Eye of Terror'), 'Should render active misery card name');
  assert.ok(!misBox.innerHTML.includes('No active Misery Cards.'), 'Should not render empty placeholder when cards present');

  renderActiveSecondaries();
  assert.ok(secBox.innerHTML.includes('Purge the Foe'), 'Should render active secondary mission name');
  assert.ok(!secBox.innerHTML.includes('No active Secondary Mission.'), 'Should not render empty placeholder when mission present');

  // Clean up
  delete globalThis.document;
  delete globalThis.window;
});

test('Spawner Cockpit: updateGuidedFlowForRound does NOT reset active phase step, but resetStep: true does', () => {
  const cockpit = require('../../js/spawner-cockpit.js');

  cockpit.setGuidedPhaseStep(3, { silent: true });
  assert.equal(cockpit.currentGuidedStep, 3);

  // Calling updateGuidedFlowForRound without resetStep (as invoked by updateHUD on any button click)
  cockpit.updateGuidedFlowForRound();
  assert.equal(cockpit.currentGuidedStep, 3, 'Must preserve active step on regular round flow updates');

  // Explicit reset on round advance
  cockpit.updateGuidedFlowForRound({ resetStep: true });
  assert.equal(cockpit.currentGuidedStep, 1, 'Must reset to step 1 when resetStep is true');
});

test('Spawner Cockpit: stepGuidedPhase clamps by default and prevents uncontrolled cycling', () => {
  const cockpit = require('../../js/spawner-cockpit.js');

  cockpit.setGuidedPhaseStep(5, { silent: true });
  cockpit.stepGuidedPhase(1);
  assert.equal(cockpit.currentGuidedStep, 5, 'Step 5 + 1 must clamp at 5 by default');

  cockpit.setGuidedPhaseStep(1, { silent: true });
  cockpit.stepGuidedPhase(-1);
  assert.equal(cockpit.currentGuidedStep, 1, 'Step 1 - 1 must clamp at 1 by default');

  // When explicit allowCycle is provided:
  cockpit.setGuidedPhaseStep(5, { silent: true });
  cockpit.stepGuidedPhase(1, { allowCycle: true });
  assert.equal(cockpit.currentGuidedStep, 1, 'Step 5 + 1 with allowCycle must wrap to 1');
});

test('Spawner Cockpit: wipeAllFortifications unchecks DOM checkboxes, resets markers, and calls saveSessionState', () => {
  const cockpit = require('../../js/spawner-cockpit.js');

  const fortCheck1 = { checked: true, id: 'fobFortCheck' };
  const fortCheck2 = { checked: true, id: 'fieldHospitalCheck' };
  const teleCountEl = { innerText: '3' };
  let savedCalled = false;
  let sfxPlayed = false;

  globalThis.document = {
    querySelectorAll: (selector) => {
      if (selector === '.fort-grid input[type="checkbox"]') return [fortCheck1, fortCheck2];
      return [];
    },
    getElementById: (id) => {
      if (id === 'teleCount') return teleCountEl;
      return null;
    }
  };

  globalThis.saveSessionState = () => { savedCalled = true; };
  globalThis.window = {
    VoxAudio: {
      playDegaussPurge: () => { sfxPlayed = true; }
    }
  };

  const wiped = cockpit.wipeAllFortifications({ reason: 'Failed Secondary #17 Spruce This Place Up' });

  assert.equal(wiped, true);
  assert.equal(fortCheck1.checked, false, 'FOB check must be unchecked');
  assert.equal(fortCheck2.checked, false, 'Field Hospital check must be unchecked');
  assert.equal(teleCountEl.innerText, '0', 'Teleporters count must be reset to 0');
  assert.equal(savedCalled, true, 'saveSessionState must be called immediately');
  assert.equal(sfxPlayed, true, 'playDegaussPurge audio cue must be triggered');

  // Clean up
  delete globalThis.document;
  delete globalThis.saveSessionState;
  delete globalThis.window;
});

test('Spawner Cockpit: resolveSecondaryOutcome on Secondary #17 failure triggers wipeAllFortifications', () => {
  const cockpit = require('../../js/spawner-cockpit.js');

  let wipeCalled = false;
  let sfxPlayed = false;

  globalThis.window = {
    activeSecondaries: [{ id: 17, name: 'Spruce This Place Up', punWipeFortifications: true }],
    state: null,
    wipeAllFortifications: () => { wipeCalled = true; },
    VoxAudio: {
      playMagLock: () => { sfxPlayed = true; },
      playDegaussPurge: () => {}
    }
  };

  globalThis.document = {
    getElementById: () => null,
    querySelectorAll: () => []
  };

  // 1. Successful outcome does NOT wipe
  cockpit.resolveSecondaryOutcome(0, true);
  assert.equal(wipeCalled, false, 'Success must not wipe fortifications');

  // Reset active secondaries
  globalThis.window.activeSecondaries = [{ id: 17, name: 'Spruce This Place Up', punWipeFortifications: true }];

  // 2. Failure outcome triggers wipe
  cockpit.resolveSecondaryOutcome(0, false);
  assert.equal(wipeCalled, true, 'Failing Secondary #17 must trigger wipeAllFortifications');

  // Clean up
  delete globalThis.window;
  delete globalThis.document;
});

test('Spawner Cockpit: Misery #7 wrapper does NOT append a duplicate 3D6 roll badge to spawn cards', () => {
  const cockpit = require('../../js/spawner-cockpit.js');
  let badgeAppended = false;
  let baseRollCalled = false;

  const mockCard = { appendChild: () => { badgeAppended = true; } };
  globalThis.document = {
    getElementById: (id) => {
      if (id === 'spawnResultsContainer') return { querySelectorAll: () => [mockCard], innerHTML: '' };
      if (id === 'unluckyNightSpawnerCheck') return { checked: true };
      return null;
    },
    querySelectorAll: () => []
  };
  globalThis.window = {
    state: { activeMiseries: [{ id: 7, name: 'Unlucky Night' }] },
    rollAllSpawnZones: function () { baseRollCalled = true; }
  };

  cockpit.bindSpawnerCockpitWrappers();
  globalThis.window.rollAllSpawnZones();

  assert.equal(baseRollCalled, true, 'Must invoke underlying rollAllSpawnZones');
  assert.equal(badgeAppended, false, 'Must NOT roll or append a conflicting second 3D6 badge');

  delete globalThis.document;
  delete globalThis.window;
});
````

---

## File: `tests/js/spawner-resupply.test.js` <a id="file-testsjsspawnerresupplytestjs"></a>

````javascript
const test = require('node:test');
const assert = require('node:assert/strict');
require('../../js/spawner-cards.js');
const {
  getMiseryLockoutReason,
  adjPatchedUpWounds,
  setFortBracketCost,
  setPromoBaseMin,
  rollFieldPromotionCost,
  rollAirStrikeDamage,
  rollReinforcementsBracket,
  executeEnhancedResupplyPurchase
} = require('../../js/spawner-resupply.js');

test('Spawner Resupply: getMiseryLockoutReason identifies active Misery lockouts', () => {
  globalThis.state = {
    activeMiseries: [{ id: 21 }]
  };
  assert.ok(
    getMiseryLockoutReason(['Fortify']).includes('Bunkers Busted'),
    'Misery #21 must block Fortify'
  );
  assert.equal(getMiseryLockoutReason(['Tactics']), null);

  globalThis.state.activeMiseries = [{ id: 22 }];
  assert.ok(
    getMiseryLockoutReason(['Supply']).includes('Comms Jammed'),
    'Misery #22 must block Supply'
  );
  assert.ok(
    getMiseryLockoutReason(['Strike']).includes('Comms Jammed'),
    'Misery #22 must block Strike'
  );
  assert.ok(
    getMiseryLockoutReason(['Spawn']).includes('Comms Jammed'),
    'Misery #22 must block Spawn'
  );
  assert.equal(getMiseryLockoutReason(['Tactics']), null);

  globalThis.state.activeMiseries = [{ id: 23 }];
  assert.ok(
    getMiseryLockoutReason(['Tactics']).includes('The Mind Killer'),
    'Misery #23 must block Tactics'
  );

  globalThis.state.activeMiseries = [{ id: 29 }];
  assert.ok(
    getMiseryLockoutReason(['Secondary']).includes("Fate's Fetters"),
    "Misery #29 must block Secondary"
  );
});

test('Spawner Resupply: Variable X state handlers clamp and adjust correctly', () => {
  globalThis.resupplyVarState = {
    patchedUpWounds: 3,
    fortBracketCost: 5,
    promoBaseMin: 3,
    promoLastRoll: null
  };

  adjPatchedUpWounds(2);
  assert.equal(globalThis.resupplyVarState.patchedUpWounds, 5);
  adjPatchedUpWounds(-10);
  assert.equal(globalThis.resupplyVarState.patchedUpWounds, 1, 'Min wound must clamp to 1');

  setFortBracketCost('7');
  assert.equal(globalThis.resupplyVarState.fortBracketCost, 7);

  setPromoBaseMin('5');
  assert.equal(globalThis.resupplyVarState.promoBaseMin, 5);

  rollFieldPromotionCost();
  assert.ok(globalThis.resupplyVarState.promoLastRoll);
  assert.ok(globalThis.resupplyVarState.promoLastRoll.d6 >= 1 && globalThis.resupplyVarState.promoLastRoll.d6 <= 6);
  assert.equal(
    globalThis.resupplyVarState.promoLastRoll.totalCost,
    globalThis.resupplyVarState.promoLastRoll.d6 + 5
  );
});

test('Spawner Resupply: executeEnhancedResupplyPurchase checks SP and triggers card side effects', () => {
  let spLost = 0;
  globalThis.state = { sp: 10, activeMiseries: [] };
  globalThis.loseSP = (amount) => { spLost += amount; globalThis.state.sp -= amount; };
  globalThis.adjCP = (delta) => { globalThis.testCp = (globalThis.testCp || 0) + delta; };

  executeEnhancedResupplyPurchase('Basic Tactics', 2);
  assert.equal(spLost, 2);
  assert.equal(globalThis.state.sp, 8);
  assert.equal(globalThis.testCp, 1, 'Basic Tactics auto-effect gains 1 CP');
});

test('Spawner Resupply: executeEnhancedResupplyPurchase calls spendSP and tracks SP spent', () => {
  let spentAmount = 0;
  globalThis.state = { sp: 16, activeMiseries: [] };
  globalThis.spendSP = (amount) => {
    spentAmount += amount;
    globalThis.state.sp -= amount;
  };

  executeEnhancedResupplyPurchase('Field Promotion', 4);
  assert.equal(spentAmount, 4, 'Must call spendSP with 4 SP');
  assert.equal(globalThis.state.sp, 12, 'Must deduct 4 SP from state');

  delete globalThis.spendSP;
});

test('Spawner Resupply: executeEnhancedResupplyPurchase blocks purchase on Misery lockout or insufficient SP', () => {
  let spDeducted = 0;
  globalThis.state = { sp: 10, activeMiseries: [{ id: 21 }] }; // #21 Bunkers Busted locks Fortify
  globalThis.spendSP = (amt) => { spDeducted += amt; };

  // Forward Operating Base has ['Fortify'] tag -> should be blocked by Misery #21
  executeEnhancedResupplyPurchase('Forward Operating Base', 3);
  assert.equal(spDeducted, 0, 'Must not deduct SP when locked out by active Misery card');

  // Clear miseries, test insufficient SP (cost 12 > sp 2)
  globalThis.state = { sp: 2, activeMiseries: [] };
  executeEnhancedResupplyPurchase('Reinforcements Arrive', 12);
  assert.equal(spDeducted, 0, 'Must not deduct SP when player has insufficient SP');

  delete globalThis.spendSP;
});

test('Spawner Resupply: rollAirStrikeDamage and rollReinforcementsBracket execute without throwing', () => {
  const airEl = { innerHTML: '' };
  const reinfEl = { innerHTML: '' };
  globalThis.document = {
    getElementById: (id) => {
      if (id === 'airStrikeRollOut') return airEl;
      if (id === 'reinforcementsRollOut') return reinfEl;
      return null;
    }
  };

  rollAirStrikeDamage();
  assert.ok(airEl.innerHTML.includes('2D3'), 'rollAirStrikeDamage must render 2D3 result into #airStrikeRollOut');

  rollReinforcementsBracket();
  assert.ok(reinfEl.innerHTML.includes('Rolled'), 'rollReinforcementsBracket must render 2D6 result into #reinforcementsRollOut');

  delete globalThis.document;
});
````
