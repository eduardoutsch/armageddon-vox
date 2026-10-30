/**
 * @fileoverview Unit test suite for js/crusade-forge.js state reducers, logistics allocator, and tour dispatch compilers.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const crusadeData = require('../../js/crusade-data.js');
const crusadeForge = require('../../js/crusade-forge.js');

// Ensure global tables are accessible when testing crusade-forge in Node
Object.assign(globalThis, crusadeData);

test('crusade-forge: adjScore increments and clamps scoreboard values at zero', () => {
  crusadeForge.crusadeState.alphaSP = 0;
  crusadeForge.adjScore('alphaSP', 4);
  assert.equal(crusadeForge.crusadeState.alphaSP, 4);

  crusadeForge.adjScore('alphaSP', -10);
  assert.equal(crusadeForge.crusadeState.alphaSP, 0);
});

test('crusade-forge: adjLogisticsPt enforces [0..2] per-category bounds and total capacity (4 standard, 5 with Uplifting Primer)', () => {
  crusadeForge.crusadeState.upliftingPrimer = false;
  crusadeForge.crusadeState.logistics = {
    lexmechanicus: 1,
    materiel: 2,
    tithePool: 0,
    morale: 1
  };

  // Total is already 4/4, so adding +1 to tithePool must be rejected
  crusadeForge.adjLogisticsPt('tithePool', 1);
  assert.equal(crusadeForge.crusadeState.logistics.tithePool, 0);

  // Materiel is already at max per-category (2), so adding +1 even with capacity must be rejected
  crusadeForge.crusadeState.upliftingPrimer = true; // 5 max capacity
  crusadeForge.adjLogisticsPt('materiel', 1);
  assert.equal(crusadeForge.crusadeState.logistics.materiel, 2);

  // Now with 5 max capacity, tithePool can be incremented to 1
  crusadeForge.adjLogisticsPt('tithePool', 1);
  assert.equal(crusadeForge.crusadeState.logistics.tithePool, 1);

  // Cannot go below 0
  crusadeForge.adjLogisticsPt('tithePool', -1);
  crusadeForge.adjLogisticsPt('tithePool', -1);
  assert.equal(crusadeForge.crusadeState.logistics.tithePool, 0);
});

test('crusade-forge: buildLogisticsSummaryLine summarizes quotas, surplus, and deficiency categories', () => {
  crusadeForge.crusadeState.tourBattlesRem = 6;
  crusadeForge.crusadeState.tourWinsRem = 3;
  crusadeForge.crusadeState.commendationPts = 5;
  crusadeForge.crusadeState.logistics = {
    lexmechanicus: 2,
    materiel: 2,
    tithePool: 0,
    morale: 0
  };

  const summary = crusadeForge.buildLogisticsSummaryLine();
  assert.ok(summary.includes('Battles Rem: 6 | Wins Rem: 3 | Commendation Pts: 5'));
  assert.ok(summary.includes('Surplus: [Lexmechanicus, Materiel]'));
  assert.ok(summary.includes('Deficiency: [Tithe, Morale]'));
});

test('crusade-forge: compileTourDispatch handles Uplifting Primer 5-point header and optional notes', () => {
  const withPrimer = crusadeForge.compileTourDispatch({
    tourBattlesRem: 7,
    tourWinsRem: 4,
    commendationPts: 2,
    logistics: { lexmechanicus: 2, materiel: 2, tithePool: 1, morale: 0 },
    upliftingPrimer: true,
    notes: ''
  });
  assert.ok(withPrimer.includes('MUNITORUM LOGISTICS ALLOCATION (5 PTS): Lexmechanicus: 2 | Materiel: 2 | Tithe Pool: 1 | Morale: 0'));
  assert.ok(!withPrimer.includes('REGIMENTAL DEPLOYMENT DIRECTIVE:'));
});

test('crusade-forge: attachRollToDossier, removeQueuedRoll, and clearQueuedRolls manage dossier roll queue', () => {
  crusadeForge.clearQueuedRolls();
  assert.equal(crusadeForge.crusadeState.queuedRolls.length, 0);

  crusadeForge.lastRolledItem.trait = {
    category: 'Battle Trait (Infantry)',
    roll: 'D6 = 3',
    name: 'Ash-Waste Stalkers',
    desc: 'Stealth in Round 1'
  };

  crusadeForge.attachRollToDossier('trait');
  assert.equal(crusadeForge.crusadeState.queuedRolls.length, 1);
  assert.equal(crusadeForge.crusadeState.queuedRolls[0].name, 'Ash-Waste Stalkers');

  crusadeForge.removeQueuedRoll(0);
  assert.equal(crusadeForge.crusadeState.queuedRolls.length, 0);
});

test('crusade-forge: adjTourField increments and clamps Tour of Duty counters at zero', () => {
  crusadeForge.crusadeState.tourBattlesRem = 3;
  crusadeForge.adjTourField('tourBattlesRem', 2);
  assert.equal(crusadeForge.crusadeState.tourBattlesRem, 5);

  crusadeForge.adjTourField('tourBattlesRem', -10);
  assert.equal(crusadeForge.crusadeState.tourBattlesRem, 0);
});

test('crusade-forge: rollNewTourQuotas and rollVictoryCommendationPts generate bounded D6+4, D3+2, and +D3 rolls', () => {
  for (let i = 0; i < 15; i++) {
    crusadeForge.rollNewTourQuotas();
    assert.ok(crusadeForge.crusadeState.tourBattlesRem >= 5 && crusadeForge.crusadeState.tourBattlesRem <= 10);
    assert.ok(crusadeForge.crusadeState.tourWinsRem >= 3 && crusadeForge.crusadeState.tourWinsRem <= 5);
  }

  crusadeForge.crusadeState.commendationPts = 0;
  crusadeForge.rollVictoryCommendationPts();
  assert.ok(crusadeForge.crusadeState.commendationPts >= 1 && crusadeForge.crusadeState.commendationPts <= 3);
});

test('crusade-forge: rollRandomBattleTrait, rollRandomWeaponMod, rollRandomRelic, and rollRandomBattleScar populate lastRolledItem', () => {
  crusadeForge.lastRolledItem.trait = null;
  crusadeForge.lastRolledItem.weapon = null;
  crusadeForge.lastRolledItem.relic = null;
  crusadeForge.lastRolledItem.scar = null;

  crusadeForge.rollRandomBattleTrait();
  assert.ok(crusadeForge.lastRolledItem.trait && crusadeForge.lastRolledItem.trait.name);
  assert.ok(crusadeForge.lastRolledItem.trait.category.includes('Battle Trait'));

  crusadeForge.rollRandomWeaponMod();
  assert.ok(crusadeForge.lastRolledItem.weapon && crusadeForge.lastRolledItem.weapon.name.includes('+'));
  assert.equal(crusadeForge.lastRolledItem.weapon.category, 'Weapon Modification (2x D6)');

  crusadeForge.rollRandomRelic();
  assert.ok(crusadeForge.lastRolledItem.relic && crusadeForge.lastRolledItem.relic.name);
  assert.ok(crusadeForge.lastRolledItem.relic.category.includes('Crusade Relic'));

  crusadeForge.rollRandomBattleScar();
  assert.ok(crusadeForge.lastRolledItem.scar && crusadeForge.lastRolledItem.scar.name);
  assert.equal(crusadeForge.lastRolledItem.scar.category, 'Battle Scar');
});

test('crusade-forge: buildStartOfTourDossierString and transmitStartOfTourDossier dispatch to alpha conduit', () => {
  crusadeForge.crusadeState.tourBattlesRem = 8;
  crusadeForge.crusadeState.tourWinsRem = 4;
  crusadeForge.crusadeState.commendationPts = 3;
  crusadeForge.crusadeState.upliftingPrimer = false;
  crusadeForge.crusadeState.logistics = { lexmechanicus: 1, materiel: 1, tithePool: 1, morale: 1 };

  const built = crusadeForge.buildStartOfTourDossierString();
  assert.ok(built.includes('8 Battles Required // 4 Victories Required'));
  assert.ok(built.includes('MUNITORUM LOGISTICS ALLOCATION (4 PTS):'));
  assert.ok(built.includes('ACTIVE COMMENDATION TALLY: 3 CmP'));

  let sentChannel = null;
  let sentPayload = null;
  globalThis.window = {
    VoxAudio: {
      transmitToVox: (ch, msg) => {
        sentChannel = ch;
        sentPayload = msg;
      }
    }
  };

  crusadeForge.transmitStartOfTourDossier();
  assert.equal(sentChannel, 'alpha');
  assert.equal(sentPayload, built);
});

