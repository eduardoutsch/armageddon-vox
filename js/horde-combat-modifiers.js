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
    'Orks': {
      ruleTitle: 'High (Green) Tide',
      moveMod: 3,
      round3ExtraMisery: 1,
      round3SpawnMod: 1
    },
    'Leagues of Votann': {
      ruleTitle: 'Grudge Game',
      marksKillerOnDestroy: true,
      vsGrudgeMarked: { hitMod: 1, woundMod: 1 }
    },
    'Tyranids': {
      ruleTitle: 'Neurons Activated',
      battleShockDice: '3D6',
      meleeStrengthMod: 1
    },
    'Genestealer Cults': {
      ruleTitle: 'Should Have Just Been A 5+ FNP',
      respawnOnDestroy: { threshold: 5, requireAnyKeyword: ['INFANTRY', 'MOUNTED'] }
    }
  };

  /**
   * Declarative lookup map for all 36 Official Misery Cards (IDs 1–36).
   */
  const MISERY_COMBAT_MODS = {
    1: { id: 1, name: 'Unnatural Stamina', canShootAfterAdvance: true, canChargeAfterAdvance: true },
    2: { id: 2, name: 'Grudge Match', hordeHitMod: 1, hordeWoundMod: 1 },
    3: { id: 3, name: 'Rip and Tear', hordeApImprove: 1 },
    4: { id: 4, name: 'Blistering Speed', autoAdvance: 6, autoCharge: 12 },
    5: { id: 5, name: 'Untouchable', grantInvuln4OrImprove4To3: true },
    6: { id: 6, name: 'Stray Orbital Bombardment', immediateAction: 'ORBITAL_GRID_2D3_MW' },
    7: { id: 7, name: 'Unlucky Night', spawner3d6DropLowest: true },
    8: { id: 8, name: 'Death Denied', immediateHealHordeWounds: 13 },
    9: { id: 9, name: 'Terrifying Shockwave', playerBattleShockAutoFail: true },
    10: { id: 10, name: 'Planetquake', immediateAction: 'RANDOM_TERRAIN_AIR_STRIKE' },
    11: { id: 11, name: 'Errant Explosion', immediateAction: 'DESTROY_NML_OBJECTIVE' },
    12: { id: 12, name: 'Nowhere is Safe', immediateAction: 'DESTROY_DEFENDER_DZ_OBJECTIVES' },
    13: { id: 13, name: 'Pincer Maneuver', extraDeepStrikeSpawnGt3Inches: true },
    14: { id: 14, name: 'No Hard Feelings', immediateAction: 'ZERO_RANDOM_PLAYER_SP_OR_SOLO_2_MISERY' },
    15: { id: 15, name: 'Bad Investment', immediateLoseSp: 5 },
    16: { id: 16, name: 'Fair and Balanced', hordeAttackKeywords: ['DEVASTATING WOUNDS'] },
    17: { id: 17, name: 'Unfettered Fury', hordeAttackKeywords: ['SUSTAINED HITS 1', 'LETHAL HITS 1'] },
    18: { id: 18, name: 'A Worthless Sacrifice', immediateAction: 'VOTE_DESTROY_PLAYER_UNIT' },
    19: { id: 19, name: 'Fog of War', hordeStealth: true, hordeHidden: true },
    20: { id: 20, name: 'Lamentable Luck', immediateDrawMisery: 2 },
    21: { id: 21, name: 'Bunkers Busted', wipeFortifications: true, lockoutTags: ['Fortify'] },
    22: { id: 22, name: 'Comms Jammed', playerStratagemsLocked: true, lockoutTags: ['Supply', 'Spawn', 'Strike'] },
    23: { id: 23, name: 'The Mind Killer', immediateAction: 'ALL_PLAYER_BATTLESHOCK_STRIP_UPGRADES', lockoutTags: ['Tactics'] },
    24: { id: 24, name: "Seller's Market", resupplyCostMultiplier: 2 },
    25: { id: 25, name: 'Hotter Shots', hordeRangedKeywords: ['MELTA 1'] },
    26: { id: 26, name: 'Sinking Showboats', hordeRangedKeywords: ['PRECISION', 'IGNORES COVER'], hordeRangedIgnoreCover: true },
    27: { id: 27, name: 'Chitinous Growths', incomingStrengthMod: -1, incomingApWorsen: 1 },
    28: { id: 28, name: 'They Fly Now', hordeUnitKeywords: ['FLY', 'TOWERING'], hordeIgnoreTerrainVisibility: true },
    29: { id: 29, name: "Fate's Fetters", immediateLoseHighestSp: 4, extraSecondaries: 3, lockoutTags: ['Secondary'] },
    30: { id: 30, name: 'Aim for the Heads', shootOrFightOnDeathThreshold: 4 },
    31: { id: 31, name: 'Debris Storm', playerForceRerollHitSixes: true },
    32: { id: 32, name: 'Glowing Eyes', hordeRerollAllHits: true },
    33: { id: 33, name: 'Danger Close', hordeRangedKeywords: ['BLAST 1'], hordeMeleeKeywords: ['CLEAVE 1'] },
    34: { id: 34, name: 'Surging Power', hordeStrengthMod: 1, hordeAttackKeywords: ['PSYCHIC'] },
    35: { id: 35, name: 'Experimental Ammunition', playerRangedStrengthMod: 1, playerRangedApImprove: 1, playerRangedKeywords: ['HAZARDOUS'] },
    36: { id: 36, name: 'Flash Flood', playerMoveMod: -2, playerMinMove: 4, playerAdvanceMod: -2, playerChargeMod: -2 }
  };

