/**
 * @fileoverview Unit tests for js/tactica-core.js pure match state, LCT dice-mat state machines & chronicle compiler.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  TACTICA_PHASES,
  REACTION_WINDOW_DEFS,
  createInitialTacticaState,
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

