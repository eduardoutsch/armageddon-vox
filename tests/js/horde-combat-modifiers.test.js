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

  // 2. Grey Knights melee vs VEHICLE (-1 hit, +4 S)
  const gkMelee = resolveHordeAttackModifiers(
    {},
    { toughness: 10, keywords: ['VEHICLE'] },
    { type: 'melee', skill: 3, strength: 6, ap: -2, keywords: [] },
    { factionName: 'Grey Knights', activeMiseryIds: [] }
  );
  assert.equal(gkMelee.effectiveStrength, 10);
  assert.equal(gkMelee.woundTarget, 4);
  assert.equal(gkMelee.netHitMod, -1);

  // 3. Imperial Agents conditional target keywords (CHAOS vs IMPERIUM vs Xenos)
  const iaVsChaos = resolveHordeAttackModifiers(
    {},
    { toughness: 4, keywords: ['CHAOS', 'INFANTRY'] },
    { type: 'ranged', skill: 4, strength: 4, ap: 0 },
    { factionName: 'Imperial Agents', activeMiseryIds: [] }
  );
  assert.equal(iaVsChaos.netHitMod, 1);
  assert.equal(iaVsChaos.netWoundMod, 0);

  const iaVsImp = resolveHordeAttackModifiers(
    {},
    { toughness: 4, keywords: ['IMPERIUM', 'INFANTRY'] },
    { type: 'ranged', skill: 4, strength: 4, ap: 0 },
    { factionName: 'Imperial Agents', activeMiseryIds: [] }
  );
  assert.equal(iaVsImp.rerollHits, 'ONES');
  assert.equal(iaVsImp.rerollWounds, 'ONES');

  const iaVsXenos = resolveHordeAttackModifiers(
    {},
    { toughness: 4, keywords: ['NECRONS', 'INFANTRY'] },
    { type: 'ranged', skill: 4, strength: 4, ap: 0 },
    { factionName: 'Imperial Agents', activeMiseryIds: [] }
  );
  assert.equal(iaVsXenos.netWoundMod, 1);

  // 4. Death Guard (-1 T within 6") + Chaos Knights/Votann +1 cap check + Misery #16/#17/#25/#26/#32/#33/#34
  const loadedShot = resolveHordeAttackModifiers(
    {},
    { toughness: 5, keywords: ['INFANTRY'], battleShocked: true, hasGrudgeMark: true },
    { type: 'ranged', skill: 4, strength: 4, ap: -1, keywords: [] },
    { factionName: 'Leagues of Votann', activeMiseryIds: [2, 16, 17, 25, 26, 32, 33, 34] }
  );
  assert.equal(loadedShot.effectiveStrength, 5); // +1 S from Misery #34
  assert.equal(loadedShot.woundTarget, 4); // S5 vs T5
  assert.equal(loadedShot.netHitMod, 1, 'Stacked +2 Hit modifiers must clamp to +1');
  assert.equal(loadedShot.netWoundMod, 1, 'Stacked +2 Wound modifiers must clamp to +1');
  assert.equal(loadedShot.rerollHits, 'ALL');
  assert.equal(loadedShot.ignoreCover, true);
  for (const kw of ['DEVASTATING WOUNDS', 'SUSTAINED HITS 1', 'LETHAL HITS 1', 'MELTA 1', 'PRECISION', 'IGNORES COVER', 'BLAST 1', 'PSYCHIC']) {
    assert.ok(loadedShot.keywords.includes(kw), `Expected keyword ${kw}`);
  }

  const dgMelee = resolveHordeAttackModifiers(
    {},
    { toughness: 4, keywords: ['INFANTRY'] },
    { type: 'melee', skill: 3, strength: 4, ap: 0 },
    { factionName: 'Death Guard', activeMiseryIds: [33] },
    { within6OfDeathGuard: true }
  );
  assert.equal(dgMelee.effectiveTargetToughness, 3);
  assert.equal(dgMelee.woundTarget, 3); // S4 vs reduced T3
  assert.ok(dgMelee.keywords.includes('CLEAVE 1'));
});

test('resolveHordeDefenseProfile: resolves Necron/Knight FNP, Misery #5 Invuln, Misery #27, Cover, and Spawn Zone Stealth/Hidden', () => {
  // 1. Necron Warriors (non-CHARACTER INFANTRY) in Spawn Zone vs ranged AP -1 attack with Misery #5 & #27
  const necronDef = resolveHordeDefenseProfile(
    { save: 4, invuln: null, woundsPerModel: 1, keywords: ['INFANTRY'] },
    { type: 'ranged', strength: 5, ap: -1, damage: 1, distanceInches: 18, keywords: [] },
    { factionName: 'Necrons', activeMiseryIds: [5, 27] },
    { inSpawnZone: true }
  );
  assert.equal(necronDef.fnp, 5, 'Necron non-Character Infantry must get 5+ FNP');
  assert.equal(necronDef.effectiveAttackerStrength, 4, 'Misery #27 subtracts 1 Strength');
  assert.equal(necronDef.effectiveApPenetration, 0, 'Misery #27 worsens AP -1 to AP 0');
  assert.equal(necronDef.hasCover, true, 'Spawn Zone grants Benefit of Cover');
  assert.equal(necronDef.isHidden, true, 'Spawn Zone grants Hidden');
  assert.equal(necronDef.maxVisibleRangeInches, 15, '11th Ed Hidden caps visibility at 15"');
  assert.equal(necronDef.effectiveInvuln, 4, 'Misery #5 grants 4+ invuln');
  assert.equal(necronDef.saveTarget, 3, '4+ Save with Cover against effective AP 0 improves to 3+');

  // 2. Necron Overlord (CHARACTER) with existing 4+ Invuln under Misery #5 -> 3+ Invuln, no 5+ FNP
  const overlordDef = resolveHordeDefenseProfile(
    { save: 2, invuln: 4, woundsPerModel: 6, keywords: ['INFANTRY', 'CHARACTER'] },
    { type: 'melee', strength: 8, ap: -3, damage: 2, keywords: [] },
    { factionName: 'Necrons', activeMiseryIds: [5] }
  );
  assert.equal(overlordDef.fnp, null, 'Necron CHARACTER does not gain 5+ FNP');
  assert.equal(overlordDef.effectiveInvuln, 3, 'Existing 4+ Invuln improves to 3+ under Misery #5');
  assert.equal(overlordDef.saveTarget, 3);

  // 3. 3+ Save vs AP 0 with Cover stays 3+ (Core Rule), Chaos Daemons >12" imposes -1 Hit
  const daemonDef = resolveHordeDefenseProfile(
    { save: 3, invuln: 5, woundsPerModel: 2, keywords: ['LEGIONES DAEMONICA', 'INFANTRY'] },
    { type: 'ranged', strength: 4, ap: 0, damage: 1, distanceInches: 14, keywords: [] },
    { factionName: 'Chaos Daemons', activeMiseryIds: [] },
    { hasCover: true }
  );
  assert.equal(daemonDef.saveTarget, 3, '3+ Save cannot improve to 2+ from Cover against AP 0');
  assert.equal(daemonDef.incomingHitMod, -1, 'Chaos Daemons >12" away impose -1 to ranged Hit');
});

test('resolveAutoDefenderRolls: executes saves, multi-damage FNP shrugs, Misery #30 shoot-on-death, and GSC 5+ respawn', () => {
  const profile = resolveHordeDefenseProfile(
    { save: 4, invuln: null, woundsPerModel: 2, keywords: ['INFANTRY'] },
    { type: 'ranged', strength: 5, ap: -1, damage: 2, keywords: ['IGNORES COVER'] },
    { factionName: 'Necrons', activeMiseryIds: [30] }
  );
  // Save needed: 5+ (4+ with AP -1, no cover). FNP: 5+. Wounds per model: 2.
  const outcome = resolveAutoDefenderRolls(profile, {
    numWounds: 3,
    damagePerWound: 2,
    startingModels: 2,
    currentModelRemainingWounds: 2,
    preRolledSaves: [5, 2, 3],       // 1 saved (5+), 2 failed (2, 3) -> 2 unsaved wounds x 2 dmg = 4 dmg points
    preRolledFnps: [5, 2, 6, 1],     // 1st wound: [5(shrug), 2(take)] -> 1 dmg; 2nd wound: [6(shrug), 1(take)] -> 1 dmg => 1 model slain!
    preRolledOnDeath: [4]            // 4+ triggers Misery #30 shoot/fight on death!
  });

  assert.equal(outcome.savesPassed, 1);
  assert.equal(outcome.unsavedWounds, 2);
  assert.equal(outcome.fnpPassed, 2);
  assert.equal(outcome.finalDamageInflicted, 2);
  assert.equal(outcome.modelsSlain, 1);
  assert.equal(outcome.remainingModels, 1);
  assert.equal(outcome.unitDestroyed, false);
  assert.equal(outcome.onDeathTriggers, 1);

  // GSC squad wipe triggers 5+ respawn roll
  const gscProfile = resolveHordeDefenseProfile(
    { save: 5, woundsPerModel: 1, keywords: ['INFANTRY'] },
    { type: 'ranged', strength: 4, ap: -2, damage: 1 },
    { factionName: 'Genestealer Cults', activeMiseryIds: [] }
  );
  const gscWipe = resolveAutoDefenderRolls(gscProfile, {
    numWounds: 1,
    damagePerWound: 1,
    startingModels: 1,
    preRolledSaves: [1],
    preRolledRespawn: 5
  });
  assert.equal(gscWipe.unitDestroyed, true);
  assert.equal(gscWipe.gscRespawnTriggered, true);
});

test('resolvePlayerModifiers: aggregates Misery debuffs and active Fortification buffs', () => {
  const playerMods = resolvePlayerModifiers(
    {
      activeMiseryIds: [9, 22, 31, 35, 36],
      activeFortifications: ['FORT_TRENCH', 'FORT_AMMO', 'FORT_SHIELD']
    },
    { baseMove: 5, whollyWithinTrench: true, whollyWithinAmmo: true, whollyWithinShield: true, attackerOutsideShield: true }
  );

  assert.equal(playerMods.effectiveMove, 4, 'Misery #36 -2" Move clamps at minimum 4"');
  assert.equal(playerMods.advanceRollMod, -2);
  assert.equal(playerMods.chargeRollMod, -2);
  assert.equal(playerMods.stratagemsLocked, true);
  assert.equal(playerMods.battleShockAutoFail, true);
  assert.equal(playerMods.forceRerollHitSixes, true);
  assert.equal(playerMods.rangedStrengthMod, 1);
  assert.equal(playerMods.rangedApImprove, 1);
  assert.ok(playerMods.rangedKeywords.includes('HAZARDOUS') && playerMods.rangedKeywords.includes('SUSTAINED HITS 1'));
  assert.equal(playerMods.meleeStrengthMod, 1);
  assert.equal(playerMods.meleeApImprove, 1);
  assert.equal(playerMods.rangedDefenseFnp, 5);
});

test('Edge cases: Tau Glasses, Officer Aura, Custodes/CSM/Aeldari/Drukhari/Tyranids/Chaos Knights, Mortal Wounds, and activeMiseries objects', () => {
  // T'au Empire Glasses: unrolled vs passed
  const tauPending = resolveHordeAttackModifiers(
    {},
    { toughness: 4 },
    { type: 'ranged', skill: 4, strength: 5, ap: 0 },
    { factionName: "T'au Empire", activeMiseries: [{ id: 19 }] }
  );
  assert.equal(tauPending.requiresTauGlassesRoll, true);
  assert.equal(tauPending.effectiveSkill, 4);

  const tauPassed = resolveHordeAttackModifiers(
    {},
    { toughness: 4 },
    { type: 'ranged', skill: 4, strength: 5, ap: 0 },
    { factionName: "T'au Empire" },
    { tauGlassesPassed: true }
  );
  assert.equal(tauPassed.requiresTauGlassesRoll, false);
  assert.equal(tauPassed.effectiveSkill, 3);

  // Astra Militarum Officer Aura & Aeldari ranged AP
  const guardAura = resolveHordeAttackModifiers(
    {},
    { toughness: 4 },
    { type: 'ranged', skill: 4, strength: 3, ap: 0 },
    { factionName: 'Astra Militarum' },
    { within6OfFriendlyOfficer: true }
  );
  assert.equal(guardAura.effectiveSkill, 3);

  const aeldariShot = resolveHordeAttackModifiers(
    {},
    { toughness: 4 },
    { type: 'ranged', skill: 3, strength: 4, ap: -1 },
    { factionName: 'Aeldari' }
  );
  assert.equal(aeldariShot.apPenetration, 2);

  // Space Marines reroll 1s, Custodes Lethal Hits, CSM charge +1A, Drukhari melee AP, Tyranids +1S, Chaos Knights vs Battle-shocked
  const smShot = resolveHordeAttackModifiers({}, { toughness: 4 }, { type: 'ranged', skill: 3 }, { factionName: 'Space Marines' });
  assert.equal(smShot.rerollHits, 'ONES');

  const custodesMelee = resolveHordeAttackModifiers({}, { toughness: 4 }, { type: 'melee', skill: 2 }, { factionName: 'Adeptus Custodes' });
  assert.ok(custodesMelee.keywords.includes('LETHAL HITS'));

  const csmCharge = resolveHordeAttackModifiers({ chargedThisTurn: true }, { toughness: 4 }, { type: 'melee', skill: 3 }, { factionName: 'Chaos Space Marines' });
  assert.equal(csmCharge.attacksMod, 1);

  const drukhariMelee = resolveHordeAttackModifiers({}, { toughness: 4 }, { type: 'melee', skill: 3, ap: -1 }, { factionName: 'Drukhari' });
  assert.equal(drukhariMelee.apPenetration, 2);

  const nidsMelee = resolveHordeAttackModifiers({}, { toughness: 4 }, { type: 'melee', skill: 4, strength: 4 }, { factionName: 'Tyranids' });
  assert.equal(nidsMelee.effectiveStrength, 5);

  const ckVsShocked = resolveHordeAttackModifiers({}, { toughness: 4, battleShocked: true }, { type: 'ranged', skill: 3 }, { factionName: 'Chaos Knights' });
  assert.equal(ckVsShocked.netHitMod, 1);
  assert.equal(ckVsShocked.netWoundMod, 1);

  // Imperial Knights 6+ FNP, Misery #19 Fog of War + Gone to Ground 12" cap, and Mortal Wounds RNG path
  const knightDef = resolveHordeDefenseProfile(
    { save: 3, invuln: 5, woundsPerModel: 12, keywords: ['VEHICLE', 'TITANIC'] },
    { type: 'ranged', strength: 12, ap: -3 },
    { factionName: 'Imperial Knights', activeMiseries: [{ id: 19 }] },
    { isGoneToGround: true }
  );
  assert.equal(knightDef.fnp, 6);
  assert.equal(knightDef.hasStealth, true);
  assert.equal(knightDef.maxVisibleRangeInches, 12);

  const mwOutcome = resolveAutoDefenderRolls(knightDef, {
    numWounds: 2,
    damagePerWound: 1,
    mortalWounds: true,
    startingModels: 1,
    currentModelRemainingWounds: 12,
    rng: () => 0.95 // rolls 6s on FNP
  });
  assert.equal(mwOutcome.savesRolled.length, 0, 'Mortal wounds bypass normal saves');
  assert.equal(mwOutcome.fnpPassed, 2);
  assert.equal(mwOutcome.finalDamageInflicted, 0);

  // Target defensive Stratagem modifiers (Smokescreen -1 to Hit & Void Armour worsen AP by 1)
  const vsSmokescreen = resolveHordeAttackModifiers(
    {},
    { toughness: 5, hitMod: -1 },
    { type: 'ranged', skill: 3, strength: 7, ap: -1 },
    { factionName: 'Imperial Knights' }
  );
  assert.equal(vsSmokescreen.netHitMod, -1, 'Target Smokescreen hitMod -1 must apply -1 to Horde attack netHitMod');

  const vsSmokescreenPlusBonus = resolveHordeAttackModifiers(
    {},
    { toughness: 5, battleShocked: true, hitMod: -1 },
    { type: 'ranged', skill: 3, strength: 7, ap: -2, worsenAp: 0 },
    { factionName: 'Chaos Knights' },
    { targetHitMod: -1, targetWorsenAp: 1 }
  );
  assert.equal(vsSmokescreenPlusBonus.netHitMod, 0, '+1 Horde bonus and -1 Smokescreen must cancel to 0 without double-counting');
  assert.equal(vsSmokescreenPlusBonus.apPenetration, 1, 'Void Armour targetWorsenAp=1 must worsen AP -2 to AP -1');
});

