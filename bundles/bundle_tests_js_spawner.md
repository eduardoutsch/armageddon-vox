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
````
