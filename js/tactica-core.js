/**
 * @fileoverview Fires of Armageddon // In-Match Tactical Console & LCT Dice-Mat Pure Core
 *
 * Pure Functional Core module (zero DOM, filesystem, network, or local PRNG dependencies):
 * - Multi-stage LCT (11th Ed FTC) TTS Dice Mat state machines for Horde Defense & Horde Attacks,
 *   ensuring every single die is physically rolled on the LCT mat and fed back via settled pips.
 * - Player Stratagem reaction-window detector (respecting CP, Battle Round & Misery #22 Comms Jammed).
 * - Automatic Horde Warlord designation & Round 1–6 After-Action Chronicle compiler.
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

  const combatCore = (typeof resolveHordeDefenseProfile === 'function')
    ? { resolveHordeDefenseProfile, resolveHordeAttackModifiers }
    : (typeof require === 'function' ? require('./horde-combat-modifiers.js') : {});

  /** Canonical Horde Mode phase progression across each Battle Round. */
  const TACTICA_PHASES = [
    'COMMAND_SPAWN',
    'HORDE_MOVEMENT',
    'HORDE_SHOOTING',
    'HORDE_CHARGE',
    'HORDE_FIGHT',
    'PLAYER_TURN',
    'ROUND_END'
  ];

  /** Declarative lookup table of out-of-phase Player Stratagem reaction windows. */
  const REACTION_WINDOW_DEFS = {
    END_OF_HORDE_MOVEMENT: {
      id: 'END_OF_HORDE_MOVEMENT',
      title: 'End of Horde Movement Phase',
      options: [
        { key: 'FIRE_OVERWATCH', name: 'Fire Overwatch (24", 6+ Snap Shots)', cpCost: 1 },
        { key: 'RAPID_INGRESS', name: 'Rapid Ingress (Reserves >9")', cpCost: 1, minRound: 2 }
      ]
    },
    START_OF_HORDE_SHOOTING: {
      id: 'START_OF_HORDE_SHOOTING',
      title: 'Start of Horde Shooting Phase',
      options: [
        { key: 'SMOKESCREEN', name: 'Smokescreen (SMOKE Unit Cover)', cpCost: 1 },
        { key: 'GO_TO_GROUND', name: 'Go to Ground (Infantry Cover/Invuln)', cpCost: 1 }
      ]
    },
    HORDE_CHARGE_DECLARED: {
      id: 'HORDE_CHARGE_DECLARED',
      title: 'Horde Charge Declared',
      options: [
        { key: 'HEROIC_INTERVENTION', name: 'Heroic Intervention (Within 6", Max 6" Roll)', cpCost: 1 }
      ]
    },
    AFTER_HORDE_UNIT_FOUGHT: {
      id: 'AFTER_HORDE_UNIT_FOUGHT',
      title: 'Fight Phase Alternation',
      options: [
        { key: 'COUNTER_OFFENSIVE', name: 'Counter-Offensive (Fight Next)', cpCost: 2 }
      ]
    }
  };

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  /**
   * Constructs a standardized LCT TTS Dice-Mat roll command descriptor.
   */
  function buildLctCommand(sequenceId, stage, count, threshold, matSide, label) {
    return {
      action: 'LCT_MAT_ROLL',
      rollId: `${sequenceId}:${stage}`,
      sequenceId,
      stage,
      matSide: matSide || 'RED',
      count,
      threshold,
      clearFirst: true,
      label
    };
  }

  /**
   * Creates a normalized, serializable In-Match Tactical Console state object.
   */
  function createInitialTacticaState(overrides = {}) {
    return {
      roomCode: String(overrides.roomCode || 'HADES-1').trim().toUpperCase(),
      battleRound: Number(overrides.battleRound) || 1,
      phase: TACTICA_PHASES.includes(overrides.phase) ? overrides.phase : 'COMMAND_SPAWN',
      factionName: overrides.factionName || 'Chaos Daemons',
      playerCp: overrides.playerCp !== undefined ? Number(overrides.playerCp) : 2,
      playerSp: overrides.playerSp !== undefined ? Number(overrides.playerSp) : 0,
      activeMiseryIds: Array.isArray(overrides.activeMiseryIds) ? [...overrides.activeMiseryIds] : [],
      activeFortifications: Array.isArray(overrides.activeFortifications) ? [...overrides.activeFortifications] : [],
      zoneSpawns: Array.isArray(overrides.zoneSpawns) ? [...overrides.zoneSpawns] : [],
      hordeWarlord: overrides.hordeWarlord || null,
      pendingReactionWindow: overrides.pendingReactionWindow || null,
      pendingDiceSequence: overrides.pendingDiceSequence || null,
      pendingChargeDecl: overrides.pendingChargeDecl || null,
      lastMovementPlans: Array.isArray(overrides.lastMovementPlans) ? [...overrides.lastMovementPlans] : [],
      lastShootingAssignments: Array.isArray(overrides.lastShootingAssignments) ? [...overrides.lastShootingAssignments] : [],
      losBlockedPairs: Array.isArray(overrides.losBlockedPairs) ? [...overrides.losBlockedPairs] : [],
      boardTelemetry: overrides.boardTelemetry || { updatedAt: null, units: [], objectives: [] },
      lastDiceResult: overrides.lastDiceResult || null,
      seqCounter: Number(overrides.seqCounter) || 0
    };
  }

  /**
   * Formats a raw match event into an append-only JSONL chronicle record.
   */
  function formatChronicleEntry(rawEvent = {}, state = {}) {
    const ts = rawEvent.timestamp || Date.now();
    const round = rawEvent.battleRound !== undefined ? Number(rawEvent.battleRound) : (Number(state.battleRound) || 1);
    return {
      seq: Number(rawEvent.seq) || ((Number(state.seqCounter) || 0) + 1),
      timestamp: ts,
      isoTime: new Date(ts).toISOString(),
      roomCode: rawEvent.roomCode || state.roomCode || 'HADES-1',
      battleRound: Math.max(0, round),
      phase: rawEvent.phase || state.phase || 'COMMAND_SPAWN',
      type: String(rawEvent.type || 'NOTE').toUpperCase(),
      summary: String(rawEvent.summary || '').trim(),
      details: rawEvent.details || null
    };
  }

