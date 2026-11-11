/**
 * @fileoverview Unit tests for js/horde-combat-modifiers.js pure combat rules & Auto-Defender math.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const { HORDE_FACTIONS } = require('../../js/data.js');
const {
  HORDE_FACTION_COMBAT_MODS,
  MISERY_COMBAT_MODS,
  FORTIFICATION_COMBAT_MODS,
  calculateWoundTarget,
  resolveHordeMovementProfile,
  resolveHordeAttackModifiers,
  resolveHordeDefenseProfile,
  resolveAutoDefenderRolls,
  resolvePlayerModifiers
} = require('../../js/horde-combat-modifiers.js');

test('Schema coverage: all 23 canonical HORDE_FACTIONS have structured combat modifier entries', () => {
  assert.equal(HORDE_FACTIONS.length, 23);
  for (const fac of HORDE_FACTIONS) {
    assert.ok(
      HORDE_FACTION_COMBAT_MODS[fac.name],
      `Missing HORDE_FACTION_COMBAT_MODS entry for faction: ${fac.name}`
    );
  }
  assert.ok(Object.keys(MISERY_COMBAT_MODS).length >= 36, 'Must define all 36 Misery card entries');
  assert.ok(FORTIFICATION_COMBAT_MODS.FORT_SHIELD, 'Must define Shield Generator modifier');
});

test('calculateWoundTarget: implements standard 40k Strength vs Toughness thresholds', () => {
  assert.equal(calculateWoundTarget(8, 4), 2);
  assert.equal(calculateWoundTarget(5, 4), 3);
  assert.equal(calculateWoundTarget(4, 4), 4);
  assert.equal(calculateWoundTarget(3, 4), 5);
  assert.equal(calculateWoundTarget(2, 4), 6);
  assert.equal(calculateWoundTarget(2, 5), 6);
});

test('resolveHordeMovementProfile: applies faction speed, Scouts on spawn, Razor Wire, and Misery #1/#4/#28', () => {
  // World Eaters (+2" M) + Scouts 6" on spawn turn without ingress
  const weMove = resolveHordeMovementProfile(
    { move: 6, scoutsInches: 6, keywords: ['INFANTRY'] },
    { factionName: 'World Eaters', activeMiseryIds: [] },
    { spawnedThisTurn: true, didIngress: false }
  );
  assert.equal(weMove.effectiveMove, 14);
  assert.equal(weMove.scoutsApplied, 6);

  // Orks (+3" M) slowed by Razor Wire (-1" M, min 5", -2 Adv/Charge) + Misery #1 & #4 & #28
  const orkMove = resolveHordeMovementProfile(
    { move: 6, scoutsInches: 6, keywords: ['INFANTRY'] },
    { factionName: 'Orks', activeMiseryIds: [1, 4, 28] },
    { spawnedThisTurn: true, didIngress: true, withinRazorWire: true }
  );
  assert.equal(orkMove.scoutsApplied, 0, 'Ingress units do not add Scouts distance');
  assert.equal(orkMove.effectiveMove, 8); // 6 + 3 (Orks) - 1 (Razor Wire)
  assert.equal(orkMove.canShootAfterAdvance, true);
  assert.equal(orkMove.canChargeAfterAdvance, true);
  assert.equal(orkMove.autoAdvance, 6);
  assert.equal(orkMove.autoCharge, 12);
  assert.equal(orkMove.advanceRollMod, -2);
  assert.equal(orkMove.chargeRollMod, -2);
  assert.equal(orkMove.ignoreTerrainVisibility, true);
  assert.ok(orkMove.keywords.includes('FLY') && orkMove.keywords.includes('TOWERING'));

  // Emperor's Children: Advance & Fall Back shoot/charge eligibility
  const ecMove = resolveHordeMovementProfile(
    { move: 6 },
    { factionName: "Emperor's Children", activeMiseryIds: [] }
  );
  assert.equal(ecMove.canShootAfterAdvance, true);
  assert.equal(ecMove.canChargeAfterAdvance, true);
  assert.equal(ecMove.canShootAfterFallBack, true);
  assert.equal(ecMove.canChargeAfterFallBack, true);
});

test('resolveHordeAttackModifiers: resolves BS improvements, conditional faction rules, Misery keywords, and +/-1 caps', () => {
  // 1. AdMech ranged (+1 BS & ASSAULT) + Misery #2 (+1 hit/+1 wound) + Misery #3 (+1 AP)
  const admechShot = resolveHordeAttackModifiers(
    {},
    { toughness: 4, keywords: ['INFANTRY'] },
    { type: 'ranged', skill: 4, strength: 4, ap: 0, keywords: [] },
    { factionName: 'Adeptus Mechanicus', activeMiseryIds: [2, 3] }
  );
  assert.equal(admechShot.effectiveSkill, 3, '+1 BS improves 4+ to 3+');
  assert.equal(admechShot.netHitMod, 1);
  assert.equal(admechShot.woundTarget, 4);
  assert.equal(admechShot.netWoundMod, 1);
  assert.equal(admechShot.apPenetration, 1);
  assert.equal(admechShot.apSigned, -1);
  assert.ok(admechShot.keywords.includes('ASSAULT'));

