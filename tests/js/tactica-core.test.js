/**
 * @fileoverview Unit tests for js/tactica-core.js pure match state, LCT dice-mat state machines & chronicle compiler.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  TACTICA_PHASES,
  PHASE_ORDER_INDEX,
  REACTION_WINDOW_DEFS,
  createInitialTacticaState,
  createPlayerStratagemBuff,
  pruneExpiredPlayerBuffs,
  resolvePlayerUnitDefensiveBuffs,
  selectTelemetryRowViewModels,
  formatChronicleEntry,
  detectPlayerReactionWindow,
  assignHordeWarlordIfEligible,
  createDefenseRollSequence,
  advanceDefenseRollSequence,
  createHordeAttackRollSequence,
  advanceHordeAttackRollSequence,
  compileTacticaPostMatchReport
} = require('../../js/tactica-core.js');

const ROOT_DIR = path.resolve(__dirname, '../../');

test('Zero-JS-RNG Guard: tactica modules contain zero Math.random() calls (all dice come from LCT TTS mat)', () => {
  for (const rel of [
    'js/tactica-core.js',
    'js/tts-telemetry-core.js',
    'js/horde-deepstrike-core.js',
    'js/horde-autopilot-core.js',
    'js/tactica-overwatch-core.js',
    'js/tactica-overwatch.js',
    'js/tactica.js',
    'tactica_daemon.js'
  ]) {
    const src = fs.readFileSync(path.join(ROOT_DIR, rel), 'utf8');
    assert.equal(src.includes('Math.random'), false, `${rel} must not use Math.random(); LCT mat rolls all dice`);
  }
});

test('detectPlayerReactionWindow: enforces CP, Battle Round, and Misery #22 Comms Jammed lockouts', () => {
  assert.ok(Array.isArray(TACTICA_PHASES) && TACTICA_PHASES.length === 7);
  assert.ok(REACTION_WINDOW_DEFS.START_OF_HORDE_SHOOTING);
  assert.equal(detectPlayerReactionWindow('UNKNOWN_TRIGGER', {}).open, false);

  const r2State = createInitialTacticaState({ battleRound: 2, playerCp: 2, activeMiseryIds: [] });
  assert.equal(detectPlayerReactionWindow('END_OF_HORDE_MOVEMENT', r2State).eligibleStratagems.length, 2);

  const r1State = createInitialTacticaState({ battleRound: 1, playerCp: 1, activeMiseryIds: [] });
  assert.equal(detectPlayerReactionWindow('END_OF_HORDE_MOVEMENT', r1State).eligibleStratagems[0].key, 'FIRE_OVERWATCH');
  assert.equal(detectPlayerReactionWindow('AFTER_HORDE_UNIT_FOUGHT', r1State).open, false);

  const zeroCp = createInitialTacticaState({ battleRound: 2, playerCp: 0, activeMiseryIds: [] });
  assert.equal(detectPlayerReactionWindow('START_OF_HORDE_SHOOTING', zeroCp).open, false);

  const jammed = createInitialTacticaState({ battleRound: 3, playerCp: 3, activeMiseryIds: [22] });
  assert.equal(detectPlayerReactionWindow('HORDE_CHARGE_DECLARED', jammed).open, false);
});

test('assignHordeWarlordIfEligible: locks the first spawned Horde CHARACTER and ignores later Characters', () => {
  const playerOnly = assignHordeWarlordIfEligible(null, [
    { guid: 'p1', name: 'Player Marshall', side: 'PLAYER', keywords: ['CHARACTER'] }
  ], 1);
  assert.equal(playerOnly.newlyAssigned, false);
  assert.equal(playerOnly.warlord, null);

  const res1 = assignHordeWarlordIfEligible(null, [
    { guid: 'u1', name: '10 Necron Warriors', side: 'HORDE', keywords: ['INFANTRY'] },
    { guid: 'u2', name: 'Overlord', side: 'HORDE', keywords: ['INFANTRY', 'CHARACTER'] }
  ], 2);
  assert.equal(res1.newlyAssigned, true);
  assert.equal(res1.warlord.name, 'Overlord');

  const res2 = assignHordeWarlordIfEligible(res1.warlord, [
    { guid: 'u3', name: 'Skorpekh Lord', side: 'HORDE', keywords: ['CHARACTER'] }
  ], 3);
  assert.equal(res2.newlyAssigned, false);
  assert.equal(res2.warlord.name, 'Overlord');
});

test('Defense LCT Sequence: chains SAVES -> FNP -> ON_DEATH -> GSC_RESPAWN strictly from settled LCT mat pips', () => {
  const state = createInitialTacticaState({ factionName: 'Necrons', activeMiseryIds: [30] });

  // 2-wound Infantry models (Save 4+, AP -1 -> 5+ Save, Necron 5+ FNP, Misery #30 4+ On-Death)
  let seq = createDefenseRollSequence({
    sequenceId: 'seq_def_1',
    unitName: 'Necron Immortals',
    defender: { save: 4, woundsPerModel: 2, keywords: ['INFANTRY'] },
    incomingAttack: { type: 'ranged', strength: 5, ap: -1, damage: 2 },
    options: { numWounds: 3, damagePerWound: 2, startingModels: 2 }
  }, state);

  assert.equal(seq.stage, 'SAVES');
  assert.equal(seq.nextCommand.action, 'LCT_MAT_ROLL');
  assert.equal(seq.nextCommand.count, 3);
  assert.equal(seq.nextCommand.threshold, 5);
  assert.throws(() => advanceDefenseRollSequence(seq, [5]), /Expected 3 dice/);

  // Stage 1 settled on LCT mat: [5 (pass), 2 (fail), 3 (fail)] -> 2 unsaved x 2 dmg = 4 FNP dice!
  seq = advanceDefenseRollSequence(seq, [5, 2, 3]);
  assert.equal(seq.stage, 'FNP');
  assert.equal(seq.nextCommand.count, 4);
  assert.equal(seq.nextCommand.threshold, 5);

  // Stage 2 settled on LCT mat: [5(shrug), 1(take), 6(shrug), 2(take)] -> 1 dmg + 1 dmg = 1 model slain!
  seq = advanceDefenseRollSequence(seq, [5, 1, 6, 2]);
  assert.equal(seq.stage, 'ON_DEATH');
  assert.equal(seq.outcome.modelsSlain, 1);
  assert.equal(seq.outcome.remainingModels, 1);
  assert.equal(seq.nextCommand.count, 1);
  assert.equal(seq.nextCommand.threshold, 4);

  // Stage 3 settled on LCT mat: [4] -> triggers Misery #30 shoot-on-death and completes!
  seq = advanceDefenseRollSequence(seq, [4]);
  assert.equal(seq.stage, 'COMPLETE');
  assert.equal(seq.nextCommand, null);
  assert.equal(seq.outcome.onDeathTriggers, 1);
  assert.equal(advanceDefenseRollSequence(seq, []).stage, 'COMPLETE');

  // GSC squad wipe chains into Stage 4 GSC_RESPAWN (5+)
  const gscState = createInitialTacticaState({ factionName: 'Genestealer Cults', activeMiseryIds: [] });
  let gscSeq = createDefenseRollSequence({
    sequenceId: 'seq_gsc',
    unitName: 'Neophyte Hybrids',
    defender: { save: 5, woundsPerModel: 1, keywords: ['INFANTRY'] },
    incomingAttack: { type: 'ranged', strength: 4, ap: -2, damage: 1 },
    options: { numWounds: 1, damagePerWound: 1, startingModels: 1 }
  }, gscState);
  gscSeq = advanceDefenseRollSequence(gscSeq, [1]); // Failed save -> wiped -> needs 1D6 GSC respawn
  assert.equal(gscSeq.stage, 'GSC_RESPAWN');
  assert.equal(gscSeq.nextCommand.count, 1);
  gscSeq = advanceDefenseRollSequence(gscSeq, [5]);
  assert.equal(gscSeq.stage, 'COMPLETE');
  assert.equal(gscSeq.outcome.gscRespawnTriggered, true);

  // Mortal wounds spill over models (with and without FNP) & 0-wound no-op
  assert.equal(createDefenseRollSequence({ options: { numWounds: 0 } }, state).stage, 'COMPLETE');
  let mwSeq = createDefenseRollSequence({
    unitName: 'Lychguard',
    defender: { save: 3, woundsPerModel: 2, keywords: ['INFANTRY'] },
    options: { numWounds: 2, damagePerWound: 2, startingModels: 2, mortalWounds: true }
  }, state);
  assert.equal(mwSeq.stage, 'FNP');
  mwSeq = advanceDefenseRollSequence(mwSeq, [1, 2, 5, 1]); // 3 unshrugged MW -> 1 slain, 1 left at 1W
  assert.equal(mwSeq.outcome.modelsSlain, 1);
  assert.equal(mwSeq.outcome.currentModelRemainingWounds, 1);

  const mwNoFnp = createDefenseRollSequence({
    unitName: 'Cultists',
    defender: { save: 6, woundsPerModel: 1 },
    options: { numWounds: 2, damagePerWound: 1, startingModels: 3, mortalWounds: true }
  }, createInitialTacticaState({ factionName: 'Chaos Space Marines' }));
  assert.equal(mwNoFnp.stage, 'COMPLETE');
  assert.equal(mwNoFnp.outcome.modelsSlain, 2);
});

test('Horde Attack LCT Sequence: chains HITS -> HIT_REROLLS -> WOUNDS with Lethal, Sustained & Devastating keywords', () => {
  const state = createInitialTacticaState({ factionName: 'Space Marines', activeMiseryIds: [16, 17] });
  // Space Marines re-roll 1s to Hit; Misery #16 [DEVASTATING WOUNDS]; Misery #17 [SUSTAINED HITS 1, LETHAL HITS 1]
  let atk = createHordeAttackRollSequence({
    sequenceId: 'seq_atk_1',
    attackerName: 'Intercessors',
    targetName: 'Krieg Infantry',
    target: { toughness: 3, keywords: ['INFANTRY'] },
    weapon: { type: 'ranged', attacks: 4, skill: 3, strength: 4, ap: -1, damage: 1, keywords: [] }
  }, state);

  assert.equal(atk.stage, 'HITS');
  assert.equal(atk.nextCommand.count, 4);

  // Roll [6 (Crit: 1 Lethal auto-wound + 1 Sustained normal hit), 4 (normal hit), 1 (reroll!), 2 (miss)]
  atk = advanceHordeAttackRollSequence(atk, [6, 4, 1, 2]);
  assert.equal(atk.stage, 'HIT_REROLLS');
  assert.equal(atk.nextCommand.count, 1, 'Only the unmodified 1 is re-rolled for Space Marines');

  // Re-roll the 1 -> rolls [5] (normal hit! Total normal hits needing wound roll = 1 Sustained + 1 [4] + 1 [5] = 3)
  atk = advanceHordeAttackRollSequence(atk, [5]);
  assert.equal(atk.stage, 'WOUNDS');
  assert.equal(atk.autoWounds, 1);
  assert.equal(atk.nextCommand.count, 3);
  assert.equal(atk.nextCommand.threshold, 3); // S4 vs T3 = 3+

  // Wound rolls on LCT mat: [6 (Devastating MW!), 3 (normal wound), 2 (fail)]
  atk = advanceHordeAttackRollSequence(atk, [6, 3, 2]);
  assert.equal(atk.stage, 'COMPLETE');
  assert.equal(atk.normalWounds, 2); // 1 Lethal auto-wound + 1 rolled [3]
  assert.equal(atk.devastatingMortalWounds, 1);

  // T'au Glasses check + Twin-Linked wound re-rolls
  const tauState = createInitialTacticaState({ factionName: "T'au Empire" });
  let tauAtk = createHordeAttackRollSequence({
    attackerName: 'Crisis Suits',
    target: { toughness: 4 },
    weapon: { type: 'ranged', attacks: 2, skill: 4, strength: 5, keywords: ['TWIN-LINKED'] }
  }, tauState);
  assert.equal(tauAtk.stage, 'TAU_GLASSES');
  tauAtk = advanceHordeAttackRollSequence(tauAtk, [5]); // Passes 4+ -> BS improves to 3+
  assert.equal(tauAtk.stage, 'HITS');
  assert.equal(tauAtk.nextCommand.threshold, 3);
  tauAtk = advanceHordeAttackRollSequence(tauAtk, [4, 2]); // 1 hit, 1 miss
  assert.equal(tauAtk.stage, 'WOUNDS');
  tauAtk = advanceHordeAttackRollSequence(tauAtk, [2]); // Failed wound -> Twin-Linked re-roll!
  assert.equal(tauAtk.stage, 'WOUND_REROLLS');
  tauAtk = advanceHordeAttackRollSequence(tauAtk, [5]);
  assert.equal(tauAtk.stage, 'COMPLETE');
  assert.equal(tauAtk.normalWounds, 1);
});

test('compileTacticaPostMatchReport: preserves full Round 1 through Round 6 history without truncation', () => {
  const state = createInitialTacticaState({
    roomCode: 'TARTARUS-09',
    factionName: 'World Eaters',
    battleRound: 6,
    hordeWarlord: { name: 'Lord Invocatus', roundSpawned: 2, alive: false }
  });
  const entries = [
    formatChronicleEntry({ seq: 1, battleRound: 0, phase: 'COMMAND_SPAWN', type: 'NOTE', summary: 'Fortifications placed.' }, state),
    formatChronicleEntry({ seq: 2, battleRound: 1, phase: 'COMMAND_SPAWN', type: 'SPAWN', summary: 'Zone 1 spawned 10 Berzerkers.' }, state),
    formatChronicleEntry({ seq: 3, battleRound: 6, phase: 'PLAYER_TURN', type: 'AUTO_DEFENDER', summary: 'Lord Invocatus slain!' }, state)
  ];
  const report = compileTacticaPostMatchReport(state, entries, { channel: 'alpha', outcome: 'Victory' });
  assert.ok(report.includes('[DEPLOYMENT & PRE-GAME]:') && report.includes('[BATTLE ROUND 1]') && report.includes('[BATTLE ROUND 6]'));
  assert.ok(report.includes('Lord Invocatus (Slain'));

  const emptyGamma = compileTacticaPostMatchReport(createInitialTacticaState(), [], { channel: 'gamma' });
  assert.ok(emptyGamma.includes('KÂHL HÂRKYN') && emptyGamma.includes('[NO TACTICAL EVENTS RECORDED IN CHRONICLE]'));
});

test('createPlayerStratagemBuff, pruneExpiredPlayerBuffs & resolvePlayerUnitDefensiveBuffs: enforces 99% single-phase expiration vs 1-round ("until next shooting phase") persistence', () => {
  assert.ok(PHASE_ORDER_INDEX && typeof PHASE_ORDER_INDEX.HORDE_SHOOTING === 'number');
  assert.equal(typeof createPlayerStratagemBuff, 'function');
  assert.equal(typeof pruneExpiredPlayerBuffs, 'function');
  assert.equal(typeof resolvePlayerUnitDefensiveBuffs, 'function');

  // 1. Default PHASE buff (Smokescreen popped during HORDE_MOVEMENT right before clicking 3. Shoot in Round 2)
  const smokePreShoot = createPlayerStratagemBuff({
    stratKey: 'SMOKESCREEN',
    stratName: 'Smokescreen',
    resolvedTarget: 'Einhyr Hearthguard',
    durationScope: 'PHASE',
    buff: { hitMod: -1, cover: true }
  }, { battleRound: 2, phase: 'HORDE_MOVEMENT' });
  assert.equal(smokePreShoot.durationScope, 'PHASE');
  assert.equal(smokePreShoot.activePhase, 'HORDE_SHOOTING');

  let buffs = [smokePreShoot];
  // Advancing into HORDE_SHOOTING activates it and applies -1 to Hit
  buffs = pruneExpiredPlayerBuffs(buffs, 2, 'HORDE_SHOOTING');
  assert.equal(buffs.length, 1);
  assert.equal(resolvePlayerUnitDefensiveBuffs('Einhyr Hearthguard', buffs, 2, 'HORDE_SHOOTING').hitMod, -1);

  // Advancing out of HORDE_SHOOTING into HORDE_CHARGE (or HORDE_FIGHT) in the SAME Round 2 immediately expires it!
  buffs = pruneExpiredPlayerBuffs(buffs, 2, 'HORDE_CHARGE');
  assert.equal(buffs.length, 0, 'PHASE-scoped Shooting buff must expire as soon as HORDE_SHOOTING ends');

  // 2. PHASE buff popped during HORDE_CHARGE (e.g., melee Void Armour / -1 to Hit for the upcoming Fight phase)
  const fightBuff = createPlayerStratagemBuff({
    stratKey: 'FACTION_CUSTOM',
    stratName: 'Reactive Ward',
    resolvedTarget: 'Einhyr Hearthguard',
    durationScope: 'PHASE',
    buff: { hitMod: -1, worsenAp: 1 }
  }, { battleRound: 2, phase: 'HORDE_CHARGE' });
  assert.equal(fightBuff.activePhase, 'HORDE_FIGHT');
  let meleeBuffs = pruneExpiredPlayerBuffs([fightBuff], 2, 'HORDE_FIGHT');
  assert.equal(meleeBuffs.length, 1, 'Fight-targeted PHASE buff popped in HORDE_CHARGE must survive into HORDE_FIGHT');
  assert.equal(resolvePlayerUnitDefensiveBuffs('Einhyr Hearthguard', meleeBuffs, 2, 'HORDE_FIGHT').worsenAp, 1);
  meleeBuffs = pruneExpiredPlayerBuffs(meleeBuffs, 2, 'PLAYER_TURN');
  assert.equal(meleeBuffs.length, 0, 'Fight PHASE buff must expire immediately when HORDE_FIGHT ends');

  // 3. ROUND buff popped during Horde half of Round 2 -> lasts all remaining phases of Round 2, expires at Round 3
  const fullRoundHorde = createPlayerStratagemBuff({
    stratKey: 'FACTION_CUSTOM',
    stratName: 'Cloud Of Ash',
    resolvedTarget: 'Hernkyn Pioneers',
    durationScope: 'ROUND',
    buff: { hitMod: -1 }
  }, { battleRound: 2, phase: 'HORDE_SHOOTING' });
  let roundBuffs = [fullRoundHorde];
  roundBuffs = pruneExpiredPlayerBuffs(roundBuffs, 2, 'HORDE_CHARGE');
  roundBuffs = pruneExpiredPlayerBuffs(roundBuffs, 2, 'HORDE_FIGHT');
  roundBuffs = pruneExpiredPlayerBuffs(roundBuffs, 2, 'PLAYER_TURN');
  assert.equal(roundBuffs.length, 1, 'ROUND buff popped in Round 2 Horde Shooting must persist across Fight and Player Turn of Round 2');
  assert.equal(resolvePlayerUnitDefensiveBuffs('Hernkyn Pioneers', roundBuffs, 2, 'HORDE_FIGHT').hitMod, -1);
  roundBuffs = pruneExpiredPlayerBuffs(roundBuffs, 3, 'COMMAND_SPAWN');
  assert.equal(roundBuffs.length, 0, 'ROUND buff popped in Round 2 Horde half must expire at start of Round 3');

  // 4. "Until your next shooting phase (1 round)" buff popped during PLAYER_TURN of Round 2:
  //    Must survive advancing into Round 3 across COMMAND_SPAWN -> HORDE_MOVEMENT -> HORDE_SHOOTING -> HORDE_FIGHT,
  //    and expire upon entering PLAYER_TURN of Round 3!
  const untilNextShoot = createPlayerStratagemBuff({
    stratKey: 'FACTION_CUSTOM',
    stratName: 'Suppressing Fire',
    resolvedTarget: 'Einhyr Hearthguard',
    durationScope: 'ROUND',
    buff: { hitMod: -1 }
  }, { battleRound: 2, phase: 'PLAYER_TURN' });
  let nextTurnBuffs = [untilNextShoot];
  nextTurnBuffs = pruneExpiredPlayerBuffs(nextTurnBuffs, 3, 'COMMAND_SPAWN');
  nextTurnBuffs = pruneExpiredPlayerBuffs(nextTurnBuffs, 3, 'HORDE_MOVEMENT');
  nextTurnBuffs = pruneExpiredPlayerBuffs(nextTurnBuffs, 3, 'HORDE_SHOOTING');
  assert.equal(nextTurnBuffs.length, 1, '"Until next shooting phase" buff from R2 PLAYER_TURN must survive into R3 HORDE_SHOOTING');
  assert.equal(resolvePlayerUnitDefensiveBuffs('Einhyr Hearthguard', nextTurnBuffs, 3, 'HORDE_SHOOTING').hitMod, -1);
  nextTurnBuffs = pruneExpiredPlayerBuffs(nextTurnBuffs, 3, 'HORDE_FIGHT');
  assert.equal(nextTurnBuffs.length, 1, 'Must also protect through R3 HORDE_FIGHT before Player Turn begins');
  nextTurnBuffs = pruneExpiredPlayerBuffs(nextTurnBuffs, 3, 'PLAYER_TURN');
  assert.equal(nextTurnBuffs.length, 0, 'Must expire once Round 3 reaches PLAYER_TURN ("your next turn / shooting phase")');
});

test('selectTelemetryRowViewModels: pure MVVM selector projects unit badges, save brackets, and Embarked Transport actions without DOM', () => {
  assert.equal(typeof selectTelemetryRowViewModels, 'function');
  assert.deepEqual(selectTelemetryRowViewModels(null), []);

  const vms = selectTelemetryRowViewModels([
    {
      squadKey: 'HORDE::Corvus Blackstar',
      name: 'Corvus Blackstar',
      side: 'HORDE',
      modelCount: 1,
      save: 3,
      closestObjective: { name: 'Obj 2', distanceInches: 4.5 },
      closestEnemy: { name: 'Hearthkyn Warriors #1', distanceInches: 9.2 },
      embarkedCargo: [
        { count: 5, templateName: 'Kill Team' },
        { count: 1, templateName: 'Watch Master' }
      ],
      embarkedSummary: '5x Kill Team + 1x Watch Master'
    },
    {
      squadKey: 'PLAYER::Hearthkyn Warriors #1',
      name: 'Hearthkyn Warriors #1',
      side: 'PLAYER',
      modelCount: 10,
      save: 4,
      invuln: 5,
      fnp: 6,
      embarkedCargo: []
    }
  ]);

  assert.equal(vms.length, 2);
  assert.equal(vms[0].side, 'HORDE');
  assert.equal(vms[0].sideBadgeClass, 'red');
  assert.equal(vms[0].statsBracketText, '[x1 • Sv 3+]');
  assert.equal(vms[0].hasEmbarkedCargo, true);
  assert.equal(vms[0].embarkedBadgeText, '🚌 Embarked: 5x Kill Team + 1x Watch Master');
  assert.equal(vms[0].canDisembark, true);
  assert.equal(vms[0].canLoadAutoDefender, true);

  assert.equal(vms[1].side, 'PLAYER');
  assert.equal(vms[1].sideBadgeClass, 'blue');
  assert.equal(vms[1].statsBracketText, '[x10 • Sv 4+/5++/FNP 6+]');
  assert.equal(vms[1].hasEmbarkedCargo, false);
  assert.equal(vms[1].canDisembark, false);
  assert.equal(vms[1].canLoadAutoDefender, false);
  assert.equal(vms[1].didIngressThisTurn, false);
  assert.equal(vms[1].deepStruckBadgeText, '');

  const dsVms = selectTelemetryRowViewModels([
    {
      squadKey: 'HORDE::Terminator Squad',
      name: 'Terminator Squad',
      side: 'HORDE',
      modelCount: 5,
      save: 2,
      invuln: 4,
      didIngressThisTurn: true
    }
  ]);
  assert.equal(dsVms[0].didIngressThisTurn, true);
  assert.equal(dsVms[0].deepStruckBadgeText, '🪂 Deep Struck');

  const { selectReservesBannerViewModel } = require('../../js/tactica-core.js');
  assert.equal(typeof selectReservesBannerViewModel, 'function');
  const idleBanner = selectReservesBannerViewModel([]);
  assert.equal(idleBanner.visible, false);
  assert.equal(idleBanner.step2ButtonText, '2. Move & LOS');

  const activeBanner = selectReservesBannerViewModel([
    { reserveId: 'r1', mode: 'STANDARD_DEEP_STRIKE', unitLabel: '5x Terminator Squad' },
    { reserveId: 'r2', mode: 'PINCER_MANEUVER', unitLabel: '10x Hormagaunts' }
  ]);
  assert.equal(activeBanner.visible, true);
  assert.equal(activeBanner.step2ButtonText, '2. Move & Ingress (2 🪂)');
  assert.ok(activeBanner.bannerText.includes('Holding in Deep Strike Reserves (Drops in Step 2):'));
  assert.ok(activeBanner.bannerText.includes('5x Terminator Squad (>8")'));
  assert.ok(activeBanner.bannerText.includes('10x Hormagaunts (>3" Pincer)'));

  const initSt = createInitialTacticaState({ hordeReserves: [{ reserveId: 'r1' }], shelfTemplates: [{ name: 'Terminators', hasDeepStrike: true }] });
  assert.equal(initSt.hordeReserves.length, 1);
  assert.equal(initSt.shelfTemplates.length, 1);
  assert.deepEqual(initSt.lastIngressDrops, []);
  assert.deepEqual(initSt.losAllowedPairs, []);
  assert.deepEqual(initSt.coverGrantedPairs, []);
  assert.deepEqual(initSt.coverStrippedPairs, []);
  assert.deepEqual(initSt.phaseOriginSnapshots, {});
  assert.deepEqual(initSt.lastMovementSightlines, []);

  // Verify 11th Ed Smokescreen ({ cover: true }) worsens Horde BS 3+ -> 4+ unless Misery #26 [IGNORE COVER] is active
  const smokeCoverBuff = createPlayerStratagemBuff({
    stratKey: 'SMOKESCREEN',
    stratName: 'Smokescreen',
    resolvedTarget: 'Sagitaur',
    durationScope: 'PHASE',
    buff: { cover: true }
  }, { battleRound: 2, phase: 'HORDE_SHOOTING' });
  const smokeState = createInitialTacticaState({
    battleRound: 2,
    phase: 'HORDE_SHOOTING',
    factionName: 'Imperial Knights',
    activeMiseryIds: [],
    activePlayerBuffs: [smokeCoverBuff]
  });
  const atkVsSmoke = createHordeAttackRollSequence({
    attackerName: 'Armiger Helverin',
    targetName: 'Sagitaur',
    target: { toughness: 9 },
    weapon: { type: 'ranged', attacks: 4, skill: 3, strength: 9, ap: -1, damage: 3, keywords: [] }
  }, smokeState);
  assert.equal(atkVsSmoke.nextCommand.threshold, 4, 'Smokescreen Benefit of Cover must worsen Horde BS 3+ to 4+');

  const atkVsSmokeMisery26 = createHordeAttackRollSequence({
    attackerName: 'Armiger Helverin',
    targetName: 'Sagitaur',
    target: { toughness: 9 },
    weapon: { type: 'ranged', attacks: 4, skill: 3, strength: 9, ap: -1, damage: 3, keywords: [] }
  }, { ...smokeState, activeMiseryIds: [26] });
  assert.equal(atkVsSmokeMisery26.nextCommand.threshold, 3, 'Misery #26 [IGNORE COVER] must strip Smokescreen Benefit of Cover back to 3+');

  // Verify selectTelemetryRowViewModels sets canUndoMove when phaseOriginSnapshots holds a stored round origin for a HORDE squad
  const undoVms = selectTelemetryRowViewModels(
    [
      { squadKey: 'HORDE::Armiger Warglaive', name: 'Armiger Warglaive', side: 'HORDE', modelCount: 1, save: 3 },
      { squadKey: 'HORDE::Unmoved Helverin', name: 'Unmoved Helverin', side: 'HORDE', modelCount: 1, save: 3 },
      { squadKey: 'PLAYER::Kapricus Defender', name: 'Kapricus Defender', side: 'PLAYER', modelCount: 1, save: 3 }
    ],
    {
      'HORDE::Armiger Warglaive': {
        squadKey: 'HORDE::Armiger Warglaive',
        unitName: 'Armiger Warglaive',
        originModels: [{ guid: 'arm-1', x: 0, y: 1.1, z: 16 }]
      }
    }
  );
  assert.equal(undoVms[0].canUndoMove, true, 'Horde squad with stored round origin snapshot must set canUndoMove = true');
  assert.equal(undoVms[1].canUndoMove, false, 'Horde squad without stored round origin snapshot must set canUndoMove = false');
  assert.equal(undoVms[2].canUndoMove, false, 'Player squad must never set canUndoMove = true');
});
