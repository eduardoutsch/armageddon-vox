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

