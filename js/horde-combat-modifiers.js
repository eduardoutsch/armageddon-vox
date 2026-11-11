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

  /**
   * Declarative lookup map for Fortifications, Battlefield Markers, and Spawn Zone passives.
   */
  const FORTIFICATION_COMBAT_MODS = {
    SPAWN_ZONE: { name: 'Horde Spawn Zone', grantCover: true, grantHidden: true },
    FORT_FOB: { name: 'Forward Operating Base', commandPhaseExtraSp: 1 },
    FORT_WARP: { name: 'Warp-Relic Outpost', fightPhaseStartHordeMwWithin6: 3, engagedPlayerSplashMw: 1 },
    FORT_TRENCH: { name: 'War Trench', playerMeleeStrengthMod: 1, playerMeleeApImprove: 1 },
    FORT_HOSP: { name: 'Field Hospital', movementEndHealWounds: 3 },
    FORT_JAMMER: { name: 'Jamming Station', hordeSpawnRollMod: -1 },
    FORT_AMMO: { name: 'Ammo Dump', playerRangedKeywords: ['SUSTAINED HITS 1'] },
    FORT_SHIELD: { name: 'Shield Generator', playerVsOutsideRangedFnp: 5 },
    MARKER_MINE: { name: 'Minefield', triggerRangeInches: 6, mortalWounds: 'D6', removeAtDamageTally: 10 },
    MARKER_WIRE: { name: 'Razor Wire', triggerRangeInches: 2, mortalWounds: 'D3', moveMod: -1, minMove: 5, advanceMod: -2, chargeMod: -2 },
    MARKER_TELE: { name: 'Short Range Teleporter', interactRangeInches: 3, hordeDestroyRangeInches: 2 }
  };

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  function normalizeKeywords(list) {
    if (!Array.isArray(list)) return [];
    return list.map(k => String(k || '').trim().toUpperCase()).filter(Boolean);
  }

  function hasAnyKw(unitKws, targets) {
    return targets.some(t => unitKws.includes(t.toUpperCase()));
  }

  function normalizeApPenetration(ap) {
    if (ap === undefined || ap === null || ap === '') return 0;
    const n = Number(ap);
    if (Number.isNaN(n)) return 0;
    return Math.abs(Math.trunc(n));
  }

  function extractActiveMiseryMods(matchState = {}) {
    const ids = Array.isArray(matchState.activeMiseryIds)
      ? matchState.activeMiseryIds
      : (Array.isArray(matchState.activeMiseries) ? matchState.activeMiseries.map(m => m && m.id) : []);
    return ids.map(id => MISERY_COMBAT_MODS[Number(id)]).filter(Boolean);
  }

  /**
   * Standard Warhammer 40,000 Strength vs Toughness wound roll lookup (2+ to 6+).
   *
   * @param {number} strength - Effective weapon Strength.
   * @param {number} toughness - Effective target Toughness.
   * @returns {number} Minimum unmodified/modified D6 wound roll required (2–6).
   */
  function calculateWoundTarget(strength, toughness) {
    const s = Math.max(1, Number(strength) || 1);
    const t = Math.max(1, Number(toughness) || 1);
    if (s >= t * 2) return 2;
    if (s > t) return 3;
    if (s === t) return 4;
    if (s * 2 <= t) return 6;
    return 5;
  }

  /**
   * Resolves a Horde unit's effective movement, terrain keywords, and post-move eligibility.
   *
   * @param {object} [unit={}] - Horde unit datasheet characteristics (`move`, `scoutsInches`, `keywords`).
   * @param {object} [matchState={}] - Active Horde match state (`factionName`, `activeMiseryIds`/`activeMiseries`).
   * @param {object} [context={}] - Turn & board context (`spawnedThisTurn`, `didIngress`, `withinRazorWire`).
   * @returns {object} Deterministic movement profile for tabletop or TTS AI execution.
   */
  function resolveHordeMovementProfile(unit = {}, matchState = {}, context = {}) {
    const facMod = HORDE_FACTION_COMBAT_MODS[matchState.factionName] || {};
    const miseries = extractActiveMiseryMods(matchState);
    const kws = new Set(normalizeKeywords(unit.keywords));

    let baseMove = Number(unit.move) || 6;
    let effectiveMove = baseMove + (facMod.moveMod || 0);

    let scoutsApplied = 0;
    const scoutsDist = Number(unit.scoutsInches) || 0;
    if (scoutsDist > 0 && context.spawnedThisTurn && !context.didIngress) {
      scoutsApplied = scoutsDist;
      effectiveMove += scoutsDist;
    }

    let advanceRollMod = 0;
    let chargeRollMod = 0;
    if (context.withinRazorWire) {
      const wire = FORTIFICATION_COMBAT_MODS.MARKER_WIRE;
      effectiveMove = Math.max(wire.minMove, effectiveMove + wire.moveMod);
      advanceRollMod += wire.advanceMod;
      chargeRollMod += wire.chargeMod;
    }

    let canShootAfterAdvance = Boolean(facMod.canShootAfterAdvance);
    let canChargeAfterAdvance = Boolean(facMod.canChargeAfterAdvance);
    const canShootAfterFallBack = Boolean(facMod.canShootAfterFallBack);
    const canChargeAfterFallBack = Boolean(facMod.canChargeAfterFallBack);
    let autoAdvance = null;
    let autoCharge = null;
    let ignoreTerrainVisibility = false;

    for (const m of miseries) {
      if (m.canShootAfterAdvance) canShootAfterAdvance = true;
      if (m.canChargeAfterAdvance) canChargeAfterAdvance = true;
      if (typeof m.autoAdvance === 'number') autoAdvance = m.autoAdvance;
      if (typeof m.autoCharge === 'number') autoCharge = m.autoCharge;
      if (m.hordeIgnoreTerrainVisibility) ignoreTerrainVisibility = true;
      if (Array.isArray(m.hordeUnitKeywords)) {
        m.hordeUnitKeywords.forEach(kw => kws.add(kw.toUpperCase()));
      }
    }

    return {
      baseMove,
      effectiveMove: Math.max(1, effectiveMove),
      scoutsApplied,
      canShootAfterAdvance,
      canChargeAfterAdvance,
      canShootAfterFallBack,
      canChargeAfterFallBack,
      autoAdvance,
      autoCharge,
      advanceRollMod,
      chargeRollMod,
      ignoreTerrainVisibility,
      keywords: Array.from(kws)
    };
  }

  /**
   * Resolves all Hit, Wound, Strength, AP, Attack-count, and Keyword modifiers for a Horde attack.
   *
   * @param {object} [attacker={}] - Attacking Horde unit state (`chargedThisTurn`).
   * @param {object} [target={}] - Targeted Defender unit profile (`toughness`, `keywords`, `battleShocked`, `hasGrudgeMark`).
   * @param {object} [weapon={}] - Weapon profile (`type`, `skill`, `strength`, `ap`, `keywords`).
   * @param {object} [matchState={}] - Active Horde match state (`factionName`, `activeMiseryIds`/`activeMiseries`).
   * @param {object} [context={}] - Situational flags (`within6OfFriendlyOfficer`, `tauGlassesPassed`, `within6OfDeathGuard`).
   * @returns {object} Resolved offensive attack profile enforcing +/-1 Hit and Wound caps.
   */
  function resolveHordeAttackModifiers(attacker = {}, target = {}, weapon = {}, matchState = {}, context = {}) {
    const facMod = HORDE_FACTION_COMBAT_MODS[matchState.factionName] || {};
    const miseries = extractActiveMiseryMods(matchState);
    const isMelee = String(weapon.type || '').toLowerCase() === 'melee';
    const isRanged = !isMelee;
    const targetKws = normalizeKeywords(target.keywords);
    const weaponKws = new Set(normalizeKeywords(weapon.keywords));

    let skillImprove = 0;
    let rawHitMod = 0;
    let rawWoundMod = 0;
    let strengthMod = 0;
    let apImprove = 0;
    let attacksMod = 0;
    let rerollHits = 'NONE';
    let rerollWounds = 'NONE';
    let ignoreCover = weaponKws.has('IGNORES COVER') || weaponKws.has('IGNORE COVER');
    let requiresTauGlassesRoll = false;

    // 1. Faction rules
    if (facMod.rerollHitOnes) rerollHits = 'ONES';
    if (isMelee && Array.isArray(facMod.meleeKeywords)) {
      facMod.meleeKeywords.forEach(k => weaponKws.add(k.toUpperCase()));
    }
    if (isRanged && Array.isArray(facMod.rangedKeywords)) {
      facMod.rangedKeywords.forEach(k => weaponKws.add(k.toUpperCase()));
    }
    if (isRanged && facMod.rangedBsImprove) {
      skillImprove += facMod.rangedBsImprove;
    }
    if (isRanged && facMod.conditionalOfficerAuraBsImprove && context.within6OfFriendlyOfficer) {
      skillImprove += facMod.conditionalOfficerAuraBsImprove;
    }
    if (isRanged && facMod.onSelectToShootRoll) {
      if (context.tauGlassesPassed === true) {
        skillImprove += facMod.onSelectToShootRoll.rangedBsImprove;
      } else if (context.tauGlassesPassed === undefined) {
        requiresTauGlassesRoll = true;
      }
    }
    if (isMelee && facMod.antiMonsterVehicleMelee && hasAnyKw(targetKws, ['VEHICLE', 'MONSTER'])) {
      rawHitMod += facMod.antiMonsterVehicleMelee.hitMod;
      strengthMod += facMod.antiMonsterVehicleMelee.strengthMod;
    }
    if (facMod.vsChaosHitMod && hasAnyKw(targetKws, ['CHAOS'])) {
      rawHitMod += facMod.vsChaosHitMod;
    }
    if (facMod.vsImperiumRerollHitAndWoundOnes && hasAnyKw(targetKws, ['IMPERIUM'])) {
      rerollHits = 'ONES';
      rerollWounds = 'ONES';
    }
    if (facMod.vsOtherWoundMod && !hasAnyKw(targetKws, ['CHAOS', 'IMPERIUM'])) {
      rawWoundMod += facMod.vsOtherWoundMod;
    }
    if (isMelee && facMod.chargeTurnMeleeAttacksMod && (context.chargedThisTurn || attacker.chargedThisTurn)) {
      attacksMod += facMod.chargeTurnMeleeAttacksMod;
    }
    if (facMod.vsBattleShocked && (target.battleShocked || context.targetBattleShocked)) {
      rawHitMod += facMod.vsBattleShocked.hitMod;
      rawWoundMod += facMod.vsBattleShocked.woundMod;
    }
    if (isRanged && facMod.rangedApImprove) apImprove += facMod.rangedApImprove;
    if (isMelee && facMod.meleeApImprove) apImprove += facMod.meleeApImprove;
    if (facMod.vsGrudgeMarked && (target.hasGrudgeMark || context.targetHasGrudgeMark)) {
      rawHitMod += facMod.vsGrudgeMarked.hitMod;
      rawWoundMod += facMod.vsGrudgeMarked.woundMod;
    }
    if (isMelee && facMod.meleeStrengthMod) strengthMod += facMod.meleeStrengthMod;

    // 2. Misery cards
    for (const m of miseries) {
      if (m.hordeHitMod) rawHitMod += m.hordeHitMod;
      if (m.hordeWoundMod) rawWoundMod += m.hordeWoundMod;
      if (m.hordeApImprove) apImprove += m.hordeApImprove;
      if (m.hordeStrengthMod) strengthMod += m.hordeStrengthMod;
      if (m.hordeRerollAllHits) rerollHits = 'ALL';
      if (Array.isArray(m.hordeAttackKeywords)) {
        m.hordeAttackKeywords.forEach(k => weaponKws.add(k.toUpperCase()));
      }
      if (isRanged && Array.isArray(m.hordeRangedKeywords)) {
        m.hordeRangedKeywords.forEach(k => weaponKws.add(k.toUpperCase()));
      }
      if (isMelee && Array.isArray(m.hordeMeleeKeywords)) {
        m.hordeMeleeKeywords.forEach(k => weaponKws.add(k.toUpperCase()));
      }
      if (isRanged && m.hordeRangedIgnoreCover) ignoreCover = true;
    }

    const dgDebuff = (facMod.enemyToughnessMod && (context.within6OfDeathGuard ?? isMelee))
      ? facMod.enemyToughnessMod
      : 0;
    const effectiveTargetToughness = Math.max(1, (Number(target.toughness) || 4) + dgDebuff);
    const effectiveStrength = Math.max(1, (Number(weapon.strength) || 4) + strengthMod);
    const baseSkill = Number(weapon.skill) || 4;
    const effectiveSkill = clamp(baseSkill - skillImprove, 2, 6);
    const apPenetration = normalizeApPenetration(weapon.ap) + apImprove;

    return {
      effectiveSkill,
      rawHitMod,
      netHitMod: clamp(rawHitMod, -1, 1),
      rerollHits,
      effectiveStrength,
      effectiveTargetToughness,
      woundTarget: calculateWoundTarget(effectiveStrength, effectiveTargetToughness),
      rawWoundMod,
      netWoundMod: clamp(rawWoundMod, -1, 1),
      rerollWounds,
      apPenetration,
      apSigned: apPenetration === 0 ? 0 : -apPenetration,
      attacksMod,
      ignoreCover,
      requiresTauGlassesRoll,
      keywords: Array.from(weaponKws)
    };
  }

  /**
   * Resolves a Horde unit's defensive save, invulnerable save, Feel No Pain, visibility, and on-death hooks.
   *
   * @param {object} [defender={}] - Defending Horde unit datasheet (`save`, `invuln`, `fnp`, `woundsPerModel`, `keywords`).
   * @param {object} [incomingAttack={}] - Incoming player weapon (`type`, `strength`, `ap`, `damage`, `distanceInches`, `keywords`).
   * @param {object} [matchState={}] - Active Horde match state (`factionName`, `activeMiseryIds`/`activeMiseries`).
   * @param {object} [context={}] - Positional state (`inSpawnZone`, `hasCover`, `isHidden`, `isGoneToGround`).
   * @returns {object} Resolved defensive profile ready for `resolveAutoDefenderRolls`.
   */
  function resolveHordeDefenseProfile(defender = {}, incomingAttack = {}, matchState = {}, context = {}) {
    const facMod = HORDE_FACTION_COMBAT_MODS[matchState.factionName] || {};
    const miseries = extractActiveMiseryMods(matchState);
    const unitKws = normalizeKeywords(defender.keywords);
    const atkKws = normalizeKeywords(incomingAttack.keywords);
    const isRanged = String(incomingAttack.type || 'ranged').toLowerCase() !== 'melee';

    let incomingHitMod = 0;
    let attackerStrengthMod = 0;
    let apWorsen = 0;
    let hasCover = Boolean(context.hasCover || defender.hasCover);
    let isHidden = Boolean(context.isHidden || defender.isHidden);
    let hasStealth = Boolean(defender.hasStealth);

    // Spawn Zone Passive: Benefit of Cover + Hidden
    if (context.inSpawnZone || defender.inSpawnZone) {
      hasCover = true;
      isHidden = true;
    }

    // Chaos Daemons Shadow Forms (-1 ranged hit outside 12")
    const dist = Number(incomingAttack.distanceInches);
    if (isRanged && facMod.rangedStealthBeyondInches && !Number.isNaN(dist) && dist > facMod.rangedStealthBeyondInches) {
      incomingHitMod -= 1;
    }

    // Misery modifiers affecting defense
    let untouchableActive = false;
    let shootOrFightOnDeathThreshold = null;
    for (const m of miseries) {
      if (m.grantInvuln4OrImprove4To3) untouchableActive = true;
      if (m.hordeStealth) hasStealth = true;
      if (m.hordeHidden) isHidden = true;
      if (m.incomingStrengthMod) attackerStrengthMod += m.incomingStrengthMod;
      if (m.incomingApWorsen) apWorsen += m.incomingApWorsen;
      if (m.shootOrFightOnDeathThreshold) shootOrFightOnDeathThreshold = m.shootOrFightOnDeathThreshold;
    }

    if (isRanged && hasStealth) incomingHitMod -= 1;

    const ignoresCover = Boolean(
      incomingAttack.ignoreCover ||
      atkKws.includes('IGNORES COVER') ||
      atkKws.includes('IGNORE COVER')
    );
    const effectiveCover = isRanged && hasCover && !ignoresCover;

    const rawApPen = normalizeApPenetration(incomingAttack.ap);
    const effectiveApPenetration = Math.max(0, rawApPen - apWorsen);
    const effectiveAttackerStrength = Math.max(1, (Number(incomingAttack.strength) || 4) + attackerStrengthMod);

    // Armor Save calculation (Core Rule: 3+ or better Save does not improve vs AP 0 from Cover)
    const baseSave = Number(defender.save) || 6;
    const coverBonus = (effectiveCover && !(baseSave <= 3 && effectiveApPenetration === 0)) ? 1 : 0;
    const modifiedArmorSave = baseSave + effectiveApPenetration - coverBonus;

    // Invulnerable Save + Misery #5 (Untouchable)
    const baseInvuln = defender.invuln ? Number(defender.invuln) : null;
    let effectiveInvuln = baseInvuln;
    if (untouchableActive) {
      if (baseInvuln === 4) effectiveInvuln = 3;
      else if (!baseInvuln || baseInvuln > 4) effectiveInvuln = 4;
    }

    const bestSave = effectiveInvuln ? Math.min(modifiedArmorSave, effectiveInvuln) : modifiedArmorSave;
    const saveTarget = Math.max(2, bestSave);

    // Feel No Pain resolution (best of datasheet vs faction)
    const fnpCandidates = [];
    if (defender.fnp) fnpCandidates.push(Number(defender.fnp));
    if (facMod.fnp) fnpCandidates.push(facMod.fnp);
    if (facMod.conditionalFnp) {
      const cf = facMod.conditionalFnp;
      const excluded = hasAnyKw(unitKws, cf.excludeKeywords || []);
      const included = hasAnyKw(unitKws, cf.requireAnyKeyword || []);
      if (!excluded && included) fnpCandidates.push(cf.threshold);
    }
    const fnp = fnpCandidates.length > 0 ? Math.min(...fnpCandidates) : null;

    // GSC 5+ Respawn eligibility
    let gscRespawnThreshold = null;
    if (facMod.respawnOnDestroy && hasAnyKw(unitKws, facMod.respawnOnDestroy.requireAnyKeyword)) {
      gscRespawnThreshold = facMod.respawnOnDestroy.threshold;
    }

    // 11th Ed Hidden (15") / Gone to Ground (12") visibility cap
    let maxVisibleRangeInches = null;
    if (isRanged && isHidden) {
      maxVisibleRangeInches = context.isGoneToGround ? 12 : 15;
    }

    return {
      baseSave,
      modifiedArmorSave,
      effectiveInvuln,
      saveTarget,
      fnp,
      hasCover: effectiveCover,
      hasStealth,
      isHidden,
      maxVisibleRangeInches,
      incomingHitMod: clamp(incomingHitMod, -1, 1),
      effectiveAttackerStrength,
      effectiveApPenetration,
      woundsPerModel: Math.max(1, Number(defender.woundsPerModel) || 1),
      shootOrFightOnDeathThreshold,
      gscRespawnThreshold
    };
  }

  /**
   * Executes Auto-Defender dice resolution (saves, multi-damage allocation, FNP shrugs, on-death & respawn rolls).
   * Accepts either `rng` or explicit `preRolled*` arrays read directly from Tabletop Simulator dice mats.
   *
   * @param {object} defenseProfile - Output from `resolveHordeDefenseProfile`.
   * @param {object} [options={}] - Wound batch, model state, RNG, and optional pre-rolled dice arrays.
   * @returns {object} Detailed damage allocation, casualty, on-death, and respawn summary.
   */
  function resolveAutoDefenderRolls(defenseProfile, options = {}) {
    const rng = typeof options.rng === 'function' ? options.rng : Math.random;
    const rollD6 = () => Math.floor(rng() * 6) + 1;

    const numWounds = Math.max(0, Number(options.numWounds) || 0);
    const damagePerWound = Math.max(1, Number(options.damagePerWound) || 1);
    const isMortal = Boolean(options.mortalWounds);
    const wpm = defenseProfile.woundsPerModel || 1;
    let remainingModels = Math.max(1, Number(options.startingModels) || 1);
    let currentWounds = options.currentModelRemainingWounds
      ? Math.min(wpm, Number(options.currentModelRemainingWounds))
      : wpm;

    const savesRolled = [];
    let savesPassed = 0;
    let unsavedWounds = 0;

    if (isMortal) {
      unsavedWounds = numWounds;
    } else {
      for (let i = 0; i < numWounds; i++) {
        const d = Array.isArray(options.preRolledSaves) && options.preRolledSaves[i] !== undefined
          ? options.preRolledSaves[i]
          : rollD6();
        savesRolled.push(d);
        if (d >= 2 && d >= defenseProfile.saveTarget) {
          savesPassed += 1;
        } else {
          unsavedWounds += 1;
        }
      }
    }

    const fnpRolls = [];
    let fnpPassed = 0;
    let finalDamageInflicted = 0;
    let modelsSlain = 0;
    let fnpIdx = 0;

    for (let w = 0; w < unsavedWounds; w++) {
      if (remainingModels <= 0) break;
      let dmgLeft = damagePerWound;
      if (defenseProfile.fnp) {
        let afterFnp = 0;
        for (let p = 0; p < damagePerWound; p++) {
          const fd = Array.isArray(options.preRolledFnps) && options.preRolledFnps[fnpIdx] !== undefined
            ? options.preRolledFnps[fnpIdx]
            : rollD6();
          fnpIdx += 1;
          fnpRolls.push(fd);
          if (fd >= defenseProfile.fnp) fnpPassed += 1;
          else afterFnp += 1;
        }
        dmgLeft = afterFnp;
      }

      if (dmgLeft > 0) {
        finalDamageInflicted += dmgLeft;
        if (dmgLeft >= currentWounds) {
          modelsSlain += 1;
          remainingModels -= 1;
          currentWounds = wpm;
        } else {
          currentWounds -= dmgLeft;
        }
      }
    }

    // Misery #30: 4+ Shoot / Fight on Death per slain model
    const onDeathRolls = [];
    let onDeathTriggers = 0;
    if (defenseProfile.shootOrFightOnDeathThreshold && modelsSlain > 0) {
      for (let m = 0; m < modelsSlain; m++) {
        const od = Array.isArray(options.preRolledOnDeath) && options.preRolledOnDeath[m] !== undefined
          ? options.preRolledOnDeath[m]
          : rollD6();
        onDeathRolls.push(od);
        if (od >= defenseProfile.shootOrFightOnDeathThreshold) onDeathTriggers += 1;
      }
    }

    const unitDestroyed = remainingModels <= 0;
    let gscRespawnRoll = null;
    let gscRespawnTriggered = false;
    if (unitDestroyed && defenseProfile.gscRespawnThreshold) {
      gscRespawnRoll = typeof options.preRolledRespawn === 'number' ? options.preRolledRespawn : rollD6();
      gscRespawnTriggered = gscRespawnRoll >= defenseProfile.gscRespawnThreshold;
    }

    return {
      savesRolled,
      savesPassed,
      unsavedWounds,
      fnpRolls,
      fnpPassed,
      finalDamageInflicted,
      modelsSlain,
      remainingModels: Math.max(0, remainingModels),
      currentModelRemainingWounds: remainingModels > 0 ? currentWounds : 0,
      unitDestroyed,
      onDeathRolls,
      onDeathTriggers,
      gscRespawnRoll,
      gscRespawnTriggered
    };
  }

  /**
   * Aggregates active Misery debuffs and Fortification bonuses affecting a Player unit.
   *
   * @param {object} [matchState={}] - Active Horde match state (`activeMiseryIds`/`activeMiseries`, `activeFortifications`).
   * @param {object} [context={}] - Player unit base movement and fortification proximity flags.
   * @returns {object} Player unit combat and movement modifier summary.
   */
  function resolvePlayerModifiers(matchState = {}, context = {}) {
    const miseries = extractActiveMiseryMods(matchState);
    const forts = new Set(Array.isArray(matchState.activeFortifications) ? matchState.activeFortifications : []);

    let effectiveMove = Number(context.baseMove) || 6;
    let advanceRollMod = 0;
    let chargeRollMod = 0;
    let stratagemsLocked = false;
    let battleShockAutoFail = false;
    let forceRerollHitSixes = false;
    let rangedStrengthMod = 0;
    let rangedApImprove = 0;
    let meleeStrengthMod = 0;
    let meleeApImprove = 0;
    let rangedDefenseFnp = null;
    const rangedKeywords = new Set();

    for (const m of miseries) {
      if (m.playerMoveMod) {
        effectiveMove = Math.max(m.playerMinMove || 1, effectiveMove + m.playerMoveMod);
      }
      if (m.playerAdvanceMod) advanceRollMod += m.playerAdvanceMod;
      if (m.playerChargeMod) chargeRollMod += m.playerChargeMod;
      if (m.playerStratagemsLocked) stratagemsLocked = true;
      if (m.playerBattleShockAutoFail) battleShockAutoFail = true;
      if (m.playerForceRerollHitSixes) forceRerollHitSixes = true;
      if (m.playerRangedStrengthMod) rangedStrengthMod += m.playerRangedStrengthMod;
      if (m.playerRangedApImprove) rangedApImprove += m.playerRangedApImprove;
      if (Array.isArray(m.playerRangedKeywords)) {
        m.playerRangedKeywords.forEach(k => rangedKeywords.add(k.toUpperCase()));
      }
    }

    if (forts.has('FORT_TRENCH') && context.whollyWithinTrench) {
      meleeStrengthMod += FORTIFICATION_COMBAT_MODS.FORT_TRENCH.playerMeleeStrengthMod;
      meleeApImprove += FORTIFICATION_COMBAT_MODS.FORT_TRENCH.playerMeleeApImprove;
    }
    if (forts.has('FORT_AMMO') && context.whollyWithinAmmo) {
      FORTIFICATION_COMBAT_MODS.FORT_AMMO.playerRangedKeywords.forEach(k => rangedKeywords.add(k));
    }
    if (forts.has('FORT_SHIELD') && context.whollyWithinShield && context.attackerOutsideShield) {
      rangedDefenseFnp = FORTIFICATION_COMBAT_MODS.FORT_SHIELD.playerVsOutsideRangedFnp;
    }

    return {
      effectiveMove,
      advanceRollMod,
      chargeRollMod,
      stratagemsLocked,
      battleShockAutoFail,
      forceRerollHitSixes,
      rangedStrengthMod,
      rangedApImprove,
      rangedKeywords: Array.from(rangedKeywords),
      meleeStrengthMod,
      meleeApImprove,
      rangedDefenseFnp
    };
  }

  return {
    HORDE_FACTION_COMBAT_MODS,
    MISERY_COMBAT_MODS,
    FORTIFICATION_COMBAT_MODS,
    calculateWoundTarget,
    resolveHordeMovementProfile,
    resolveHordeAttackModifiers,
    resolveHordeDefenseProfile,
    resolveAutoDefenderRolls,
    resolvePlayerModifiers
  };
});

