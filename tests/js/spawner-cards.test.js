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
