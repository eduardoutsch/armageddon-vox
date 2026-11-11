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

