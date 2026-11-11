/**
 * @fileoverview Fires of Armageddon // Structured Horde Combat Modifiers & Auto-Defender Core
 *
 * Pure Functional Core module (zero DOM, storage, audio, or network dependencies) encoding:
 * - All 23 Official Section 7.5 Horde Primary Faction Rules
 * - All 36 Official Misery Deck Combat, Movement, Visibility, and Lockout Modifiers
 * - All Section 7.1 Fortifications, Battlefield Markers, and Spawn Zone Passives
 * - Deterministic 11th Edition 40k Attack, Save, Feel No Pain, and Auto-Defender Resolvers
 */

(function (root, factory) {
  const exports = factory();
  if (typeof root !== 'undefined') {
    Object.assign(root, exports);
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = exports;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {

  /**
   * Declarative lookup map for all 23 Section 7.5 Horde Primary Faction Rules.
   */
  const HORDE_FACTION_COMBAT_MODS = {
    'Space Marines': {
      ruleTitle: 'Transhuman Skills',
      rerollHitOnes: true
    },
    'Adepta Sororitas': {
      ruleTitle: 'Martyrs and Miracles',
      round4FirstSpawnAuto12: true
    },
    'Adeptus Custodes': {
      ruleTitle: 'Best of the Best of the Best',
      meleeKeywords: ['LETHAL HITS']
    },
    'Adeptus Mechanicus': {
      ruleTitle: "Third Try's the Charm",
      rangedBsImprove: 1,
      rangedKeywords: ['ASSAULT']
    },
    'Astra Militarum': {
      ruleTitle: 'Unanimous Orders',
      conditionalOfficerAuraBsImprove: 1,
      officerAuraRangeInches: 6
    },
    'Grey Knights': {
      ruleTitle: 'Poor Hammers',
      antiMonsterVehicleMelee: { hitMod: -1, strengthMod: 4 }
    },
    'Imperial Agents': {
      ruleTitle: "Fine, I'll Do It Myself",
      vsChaosHitMod: 1,
      vsImperiumRerollHitAndWoundOnes: true,
      vsOtherWoundMod: 1
    },
    'Imperial Knights': {
      ruleTitle: 'Passive Ion Shields',
      fnp: 6
    },
    'Chaos Space Marines': {
      ruleTitle: 'Wonton Slaughter',
      chargeTurnMeleeAttacksMod: 1
    },
    'Chaos Daemons': {
      ruleTitle: 'Shadow Forms',
      rangedStealthBeyondInches: 12
    },
    'Chaos Knights': {
      ruleTitle: 'God I Wish We Had A Different Theme',
      vsBattleShocked: { hitMod: 1, woundMod: 1 }
    },
    'Death Guard': {
      ruleTitle: "Don't You Miss DR?",
      contagionRangeInches: 6,
      enemyToughnessMod: -1,
      enemySkillWorsen: 1
    },
    "Emperor's Children": {
      ruleTitle: 'Elegant Violence',
      canShootAfterAdvance: true,
      canChargeAfterAdvance: true,
      canShootAfterFallBack: true,
      canChargeAfterFallBack: true
    },
    'Thousand Sons': {
      ruleTitle: 'Psychic Storms',
      startOfHordeShootingAura: { rangeInches: 12, mortalWounds: 'D3' }
    },
    'World Eaters': {
      ruleTitle: 'Bloodthirsty',
      moveMod: 2
    },
    'Aeldari': {
      ruleTitle: 'Monomolecular Ammunition',
      rangedApImprove: 1
    },
    'Drukhari': {
      ruleTitle: 'Monomolecular Edges',
      meleeApImprove: 1
    },
    'Necrons': {
      ruleTitle: "We're So Back",
      conditionalFnp: {
        threshold: 5,
        excludeKeywords: ['CHARACTER'],
        requireAnyKeyword: ['INFANTRY', 'BEAST', 'BEASTS', 'SWARM']
      }
    },
    "T'au Empire": {
      ruleTitle: 'Glasses',
      onSelectToShootRoll: { threshold: 4, rangedBsImprove: 1 }
    },
