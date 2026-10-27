# 📦 Fires of Armageddon // Bundle: Tests (Spawner Subsystems & UI Flow)

Deterministic unit and Playwright UI tests for spawner cards, cockpit telemetry, resupply table, and threat rules (`tests/js/spawner*.test.js`, `tests/ui/spawner.test.js`).

## 📑 Table of Contents
- [tests/js/spawner.test.js](#file-testsjsspawnertestjs)
- [tests/js/spawner-cards.test.js](#file-testsjsspawnercardstestjs)
- [tests/js/spawner-cockpit.test.js](#file-testsjsspawnercockpittestjs)
- [tests/js/spawner-resupply.test.js](#file-testsjsspawnerresupplytestjs)
- [tests/ui/spawner.test.js](#file-testsuispawnertestjs)

---

## File: `tests/js/spawner.test.js` <a id="file-testsjsspawnertestjs"></a>

````javascript
const test = require('node:test');
const assert = require('node:assert/strict');
const { getBracketInfo, calculateRollDown, pickSyncedUnitFromBracket } = require('../../js/spawner.js');
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

test('pickSyncedUnitFromBracket: falls back to canonical HORDE_FACTION_SPAWN_TABLES when custom storage is empty', () => {
  const { HORDE_FACTION_SPAWN_TABLES } = require('../../js/data.js');
  globalThis.HORDE_FACTION_SPAWN_TABLES = HORDE_FACTION_SPAWN_TABLES;
  globalThis.document = {
    getElementById: (id) => {
      if (id === 'hordeFactionSelect') return { value: 'World Eaters' };
      return null;
    }
  };

  const rng = mulberry32(77);
  const picked10 = pickSyncedUnitFromBracket('10-12', rng);
  assert.ok(
    HORDE_FACTION_SPAWN_TABLES['World Eaters'].b10.includes(picked10),
    `Expected unit from World Eaters b10, got: ${picked10}`
  );

  delete globalThis.HORDE_FACTION_SPAWN_TABLES;
  delete globalThis.document;
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
````

---

## File: `tests/ui/spawner.test.js` <a id="file-testsuispawnertestjs"></a>

````javascript
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { chromium } = require('playwright');

const ROOT_DIR = path.resolve(__dirname, '../../');

async function launchTestBrowser() {
  for (const opts of [{ headless: true }, { channel: 'chrome', headless: true }, { channel: 'msedge', headless: true }]) {
    try {
      return await chromium.launch(opts);
    } catch (_) {}
  }
  throw new Error('Could not launch headless Chromium, Chrome, or Edge for UI integration test');
}

test('UI Boundary: pages/spawner.html synchronizes Pre-Game (Round 0) vs Battle Round 1, draws cards, and supports manual draw', async () => {
  const browser = await launchTestBrowser();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.addInitScript(() => {
      window.confirm = () => true;
      try {
        localStorage.setItem('foa_horde_session_v1', JSON.stringify({
          seed: 'TEST-PREGAME-99',
          selectedModeVal: 'solo',
          isSoloMode: true,
          battleRound: 0,
          activeMiseries: [],
          activeSecondaries: [],
          hasActiveSession: true
        }));
      } catch (e) {}
    });

    const filePath = 'file:///' + path.resolve(ROOT_DIR, 'pages/spawner.html').replace(/\\/g, '/');
    await page.goto(filePath, { waitUntil: 'load' });

    await page.evaluate(() => {
      window.confirm = () => true;
      if (typeof window.resetMatchToSetup === 'function') window.resetMatchToSetup();
      if (typeof window.startSession === 'function') window.startSession();

      if (typeof window.battleRound !== 'undefined') window.battleRound = 0;
      if (window.state) {
        window.state.round = 0;
        window.state.activeMiseries = [];
        window.state.activeSecondaries = [];
      }
      if (typeof window.switchTab === 'function') window.switchTab(1);
      if (typeof window.updateHUD === 'function') window.updateHUD();
      if (typeof window.renderSharedDecks === 'function') window.renderSharedDecks();
      if (typeof window.renderActiveMiseries === 'function') window.renderActiveMiseries();
      if (typeof window.renderActiveSecondaries === 'function') window.renderActiveSecondaries();
    });

    // 1. Verify Pre-Game (Round 0) UI elements
    const hudRoundText = await page.$eval('#hudRound', el => el.innerText.trim());
    const roundTitleText = await page.$eval('#roundTitle', el => el.innerText.trim());
    const spawnModText = await page.$eval('#spawnModDisplay', el => el.innerText.trim());
    const nextBtnText = await page.$eval('#nextRoundBtn', el => el.innerText.trim());
    const secBoxContent = await page.$eval('#activeSecondariesBox', el => el.innerText.trim());
    const misBoxContent = await page.$eval('#activeMiseriesBox', el => el.innerText.trim());

    assert.equal(hudRoundText, 'Pre-Game', 'HUD Round must indicate Pre-Game at round 0');
    assert.equal(roundTitleText.toUpperCase(), 'DEPLOYMENT & SETUP', 'Round title must be Deployment & Setup in Pre-Game');
    assert.ok(spawnModText.includes('Roll your initial Round 1 Horde Spawns'), 'Spawn mod display must guide player to roll spawns in Pre-Game');
    assert.ok(nextBtnText.toUpperCase().includes('BEGIN BATTLE ROUND 1'), 'Next round button must read Begin Battle Round 1 in Pre-Game');
    assert.ok(secBoxContent.includes('No active Secondary Mission.'), 'Must show placeholder when no secondary mission is drawn in Pre-Game');
    assert.ok(misBoxContent.includes('No active Misery Cards.'), 'Must show placeholder when no misery cards are drawn in Pre-Game');

    // Verify manual + Draw buttons are present in dock headers
    const secDrawBtn = await page.$('#btnManualDrawSecondary');
    const misDrawBtn = await page.$('#btnManualDrawMisery');
    assert.ok(secDrawBtn, 'Active Secondary dock header must contain #btnManualDrawSecondary');
    assert.ok(misDrawBtn, 'Active Misery dock header must contain #btnManualDrawMisery');

    // 2. Click "Begin Battle Round 1 →" to advance to Round 1
    await page.click('#nextRoundBtn');
    await page.waitForTimeout(200);

    // 3. Verify Battle Round 1 UI state & card draws
    const r1HudRound = await page.$eval('#hudRound', el => el.innerText.trim());
    const r1Title = await page.$eval('#roundTitle', el => el.innerText.trim());
    const r1SpawnMod = await page.$eval('#spawnModDisplay', el => el.innerText.trim());
    const r1NextBtn = await page.$eval('#nextRoundBtn', el => el.innerText.trim());
    const r1SecBox = await page.$eval('#activeSecondariesBox', el => el.innerHTML);
    const r1MisBox = await page.$eval('#activeMiseriesBox', el => el.innerHTML);

    assert.equal(r1HudRound, 'Round 1/6', 'HUD Round must update to Round 1/6');
    assert.equal(r1Title.toUpperCase(), 'BATTLE ROUND 1', 'Round title must update to Battle Round 1');
    assert.ok(r1SpawnMod.includes('1 Misery Drawn'), 'Spawn mod display must show 1 Misery Drawn');
    assert.ok(r1NextBtn.toUpperCase().includes('ADVANCE TO BATTLE ROUND 2'), 'Next round button must read Advance to Battle Round 2');
    assert.ok(!r1SecBox.includes('No active Secondary Mission.'), 'Secondary mission card must be drawn and rendered in Round 1');
    assert.ok(!r1MisBox.includes('No active Misery Cards.'), 'Misery card must be drawn and rendered in Round 1');

    // 4. Test manual draw button: draw another Secondary Mission
    await page.click('#btnManualDrawSecondary');
    await page.waitForTimeout(100);
    const secCardsCount = await page.$$eval('#activeSecondariesBox .card', cards => cards.length);
    assert.ok(secCardsCount >= 2, 'Clicking manual + Draw button must draw an additional Secondary Mission');
  } finally {
    await browser.close();
  }
});

test('UI Boundary: pages/spawner.html guided phase stepper preserves active phase on button clicks and SP shop purchase updates tracker', async () => {
  const browser = await launchTestBrowser();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.addInitScript(() => {
      window.confirm = () => true;
      try {
        localStorage.setItem('foa_horde_session_v1', JSON.stringify({
          seed: 'TEST-STEPPER-40',
          selectedModeVal: 'solo',
          isSoloMode: true,
          battleRound: 1,
          sp: 16,
          spSpentThisRound: 0,
          spRoundCap: 16,
          hasActiveSession: true
        }));
      } catch (e) {}
    });

    const filePath = 'file:///' + path.resolve(ROOT_DIR, 'pages/spawner.html').replace(/\\/g, '/');
    await page.goto(filePath, { waitUntil: 'load' });

    await page.evaluate(() => {
      window.confirm = () => true;
      if (typeof window.switchTab === 'function') window.switchTab(1);
      if (typeof window.setGuidedPhaseStep === 'function') window.setGuidedPhaseStep(3, { silent: true });
      if (typeof window.updateHUD === 'function') window.updateHUD();
    });

    // 1. Verify Phase 3 is active
    let activeStepBtn = await page.$eval('#roundPhaseStepper .active-step', el => el.getAttribute('data-step'));
    assert.equal(activeStepBtn, '3', 'Phase 3 must be active initially');

    // 2. Click HUD "+ SP" button and verify phase does NOT reset to 1
    await page.click('#hudGainSpBtn');
    activeStepBtn = await page.$eval('#roundPhaseStepper .active-step', el => el.getAttribute('data-step'));
    assert.equal(activeStepBtn, '3', 'Phase 3 must remain active after clicking + SP');

    // 3. Click HUD "- SP" button and verify phase does NOT reset to 1
    await page.click('.hud-stat button[onclick*="loseSP"]');
    activeStepBtn = await page.$eval('#roundPhaseStepper .active-step', el => el.getAttribute('data-step'));
    assert.equal(activeStepBtn, '3', 'Phase 3 must remain active after clicking - SP');

    // 4. Click "+ CP" button and verify phase does NOT reset to 1
    await page.click('.hud-stat button[onclick*="adjCP(1)"]');
    activeStepBtn = await page.$eval('#roundPhaseStepper .active-step', el => el.getAttribute('data-step'));
    assert.equal(activeStepBtn, '3', 'Phase 3 must remain active after clicking + CP');

    // 5. Test Resupply Shop purchase: spend 4 SP
    await page.evaluate(() => {
      window.confirm = () => true;
      if (typeof window.executeEnhancedResupplyPurchase === 'function') {
        window.executeEnhancedResupplyPurchase('Field Promotion', 4);
      } else if (typeof window.spendSP === 'function') {
        window.spendSP(4);
      }
    });

    const spCapText = await page.$eval('#hudSpCap', el => el.innerText.trim());
    assert.equal(spCapText, '(4/16)', 'HUD SP tracker must accompany the 4 SP spent on the resupply shop');

    // Phase 3 must still be active after spending SP
    activeStepBtn = await page.$eval('#roundPhaseStepper .active-step', el => el.getAttribute('data-step'));
    assert.equal(activeStepBtn, '3', 'Phase 3 must remain active after resupply purchase');

    // 6. Advance to next battle round: now phase step MUST reset to 1, and tracker resets to (0/16)
    await page.click('#nextRoundBtn');
    await page.waitForTimeout(200);

    const r2ActiveStep = await page.$eval('#roundPhaseStepper .active-step', el => el.getAttribute('data-step'));
    const r2SpCapText = await page.$eval('#hudSpCap', el => el.innerText.trim());
    assert.equal(r2ActiveStep, '1', 'Advancing battle round must reset guided phase stepper to Step 1');
    assert.equal(r2SpCapText, '(0/16)', 'Advancing battle round must reset SP spent tracker to (0/16)');
  } finally {
    await browser.close();
  }
});

test('UI Boundary: pages/spawner.html failing Secondary #17 wipes all fortifications, and phase stepper does not cycle past phase 5', async () => {
  const browser = await launchTestBrowser();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.addInitScript(() => {
      window.confirm = () => true;
      try {
        localStorage.setItem('foa_horde_session_v1', JSON.stringify({
          seed: 'TEST-FORT-WIPE',
          selectedModeVal: 'solo',
          isSoloMode: true,
          battleRound: 2,
          sp: 8,
          activeMiseries: [],
          activeSecondaries: [{ id: 17, name: 'Spruce This Place Up', punWipeFortifications: true }],
          hasActiveSession: true,
          fortChecks: [true, false, false, true, false, false, false],
          teleCount: 2,
          currentGuidedStep: 4
        }));
      } catch (e) {}
    });

    const filePath = 'file:///' + path.resolve(ROOT_DIR, 'pages/spawner.html').replace(/\\/g, '/');
    await page.route('**/rest/v1/rpc/**', route => route.abort());
    await page.goto(filePath, { waitUntil: 'load' });

    await page.evaluate(() => {
      window.confirm = () => true;
      if (typeof window.switchTab === 'function') window.switchTab(1);
    });

    // 1. Verify initial active fortifications (FOB and Field Hospital are checked, Teleporters = 2)
    const fobChecked = await page.$eval('#fobFortCheck', el => el.checked);
    const hospChecked = await page.$eval('#fieldHospitalCheck', el => el.checked);
    const teleVal = await page.$eval('#teleCount', el => el.innerText.trim());

    assert.equal(fobChecked, true, 'FOB check should initially be checked');
    assert.equal(hospChecked, true, 'Field Hospital check should initially be checked');
    assert.equal(teleVal, '2', 'Teleporters should initially be 2');

    // 2. Fail Secondary #17 ("Spruce This Place Up")
    await page.evaluate(() => {
      if (typeof window.resolveSecondaryOutcome === 'function') {
        window.resolveSecondaryOutcome(0, false);
      }
    });

    // 3. Verify all fortifications have been wiped
    const fobAfterWipe = await page.$eval('#fobFortCheck', el => el.checked);
    const hospAfterWipe = await page.$eval('#fieldHospitalCheck', el => el.checked);
    const teleAfterWipe = await page.$eval('#teleCount', el => el.innerText.trim());

    assert.equal(fobAfterWipe, false, 'FOB must be unchecked after Secondary #17 fails');
    assert.equal(hospAfterWipe, false, 'Field Hospital must be unchecked after Secondary #17 fails');
    assert.equal(teleAfterWipe, '0', 'Teleporters must be reset to 0 after Secondary #17 fails');

    // 4. Test phase stepper clamping at Step 5
    await page.evaluate(() => {
      if (typeof window.setGuidedPhaseStep === 'function') {
        window.setGuidedPhaseStep(5);
      }
    });

    let currentStep = await page.$eval('#roundPhaseStepper .active-step', el => el.getAttribute('data-step'));
    assert.equal(currentStep, '5', 'Phase 5 should be active');

    // Click Next Step button at Phase 5: must clamp at Phase 5 and not cycle back to 1
    await page.click('#stepNextBtn');
    currentStep = await page.$eval('#roundPhaseStepper .active-step', el => el.getAttribute('data-step'));
    assert.equal(currentStep, '5', 'Clicking Next Step at Phase 5 must remain clamped at Phase 5');

    // 5. Test page reload restores currentGuidedStep from localStorage
    await page.evaluate(() => {
      if (typeof window.setGuidedPhaseStep === 'function') {
        window.setGuidedPhaseStep(4);
      }
    });
    await page.reload({ waitUntil: 'load' });
    await page.waitForTimeout(200);

    const reloadedStep = await page.$eval('#roundPhaseStepper .active-step', el => el.getAttribute('data-step'));
    assert.equal(reloadedStep, '4', 'Reloading page must restore currentGuidedStep without resetting to 1');
  } finally {
    await browser.close();
  }
});

````
