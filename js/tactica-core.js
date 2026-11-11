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

  /**
   * Evaluates whether a Player reaction window should pause Horde execution,
   * checking available CP, minimum round rules, and Misery #22 (Comms Jammed).
   */
  function detectPlayerReactionWindow(triggerKey, state = {}) {
    const def = REACTION_WINDOW_DEFS[triggerKey];
    if (!def) return { open: false, reason: 'Unknown trigger window.' };

    const miseryIds = Array.isArray(state.activeMiseryIds) ? state.activeMiseryIds.map(Number) : [];
    if (miseryIds.includes(22)) {
      return { open: false, reason: 'Blocked by Misery #22 (Comms Jammed).' };
    }

    const cp = Number(state.playerCp) || 0;
    const round = Number(state.battleRound) || 1;
    if (cp <= 0) return { open: false, reason: '0 CP remaining.' };

    const eligible = def.options.filter(opt => opt.cpCost <= cp && (!opt.minRound || round >= opt.minRound));
    if (eligible.length === 0) return { open: false, reason: 'No eligible Stratagems for current CP/Round.' };

    return { open: true, triggerKey, title: def.title, playerCp: cp, eligibleStratagems: eligible };
  }

  /**
   * Designates the first spawned Horde CHARACTER as the Horde Warlord and preserves
   * that lock across subsequent waves (per Horde Mode Secondary / Warlord rules).
   */
  function assignHordeWarlordIfEligible(currentWarlord, units = [], currentRound = 1) {
    if (currentWarlord && currentWarlord.name) return { warlord: currentWarlord, newlyAssigned: false };
    if (!Array.isArray(units)) return { warlord: null, newlyAssigned: false };

    for (const u of units) {
      if (!u || String(u.side || 'HORDE').toUpperCase() === 'PLAYER') continue;
      const kws = Array.isArray(u.keywords) ? u.keywords.map(k => String(k).toUpperCase()) : [];
      if (u.isCharacter || kws.includes('CHARACTER')) {
        return {
          warlord: {
            guid: u.guid || u.id || null,
            name: String(u.name || 'Horde Character').trim(),
            roundSpawned: Number(currentRound) || 1,
            alive: u.alive !== false
          },
          newlyAssigned: true
        };
      }
    }
    return { warlord: null, newlyAssigned: false };
  }

  /**
   * Allocates resolved damage packets across multi-wound models, respecting non-spillover
   * for normal attacks and point-by-point spillover for Mortal Wounds.
   */
  function applyDamagePacketsToModels(packets, wpm, startModels, startWounds, spillOver = false) {
    let remainingModels = startModels;
    let currentWounds = startWounds;
    let modelsSlain = 0;
    let finalDamageInflicted = 0;

    for (const dmg of packets) {
      if (remainingModels <= 0 || dmg <= 0) continue;
      finalDamageInflicted += dmg;
      if (spillOver) {
        for (let p = 0; p < dmg && remainingModels > 0; p++) {
          if (currentWounds <= 1) {
            modelsSlain += 1;
            remainingModels -= 1;
            currentWounds = wpm;
          } else {
            currentWounds -= 1;
          }
        }
      } else if (dmg >= currentWounds) {
        modelsSlain += 1;
        remainingModels -= 1;
        currentWounds = wpm;
      } else {
        currentWounds -= dmg;
      }
    }
    return {
      modelsSlain,
      remainingModels: Math.max(0, remainingModels),
      currentModelRemainingWounds: remainingModels > 0 ? currentWounds : 0,
      finalDamageInflicted
    };
  }

  function finalizeOrAdvancePostDamageStage(seq) {
    const prof = seq.defenseProfile;
    const out = seq.outcome;

    if (!seq.didOnDeath && prof.shootOrFightOnDeathThreshold && out.modelsSlain > 0) {
      seq.stage = 'ON_DEATH';
      seq.expectedDice = out.modelsSlain;
      seq.nextCommand = buildLctCommand(
        seq.sequenceId,
        'ON_DEATH',
        out.modelsSlain,
        prof.shootOrFightOnDeathThreshold,
        seq.matSide,
        `${seq.unitName} — ${out.modelsSlain}x Misery #30 Shoot/Fight on Death (${prof.shootOrFightOnDeathThreshold}+)`
      );
      return seq;
    }

    if (!seq.didRespawn && out.unitDestroyed && prof.gscRespawnThreshold) {
      seq.stage = 'GSC_RESPAWN';
      seq.expectedDice = 1;
      seq.nextCommand = buildLctCommand(
        seq.sequenceId,
        'GSC_RESPAWN',
        1,
        prof.gscRespawnThreshold,
        seq.matSide,
        `${seq.unitName} — 1x GSC Cult Ambush Respawn (${prof.gscRespawnThreshold}+)`
      );
      return seq;
    }

    seq.stage = 'COMPLETE';
    seq.expectedDice = 0;
    seq.nextCommand = null;
    return seq;
  }

  /**
   * Initializes a deterministic multi-stage LCT dice-mat sequence for Horde Defense
   * (`SAVES` -> `FNP` -> `ON_DEATH` -> `GSC_RESPAWN` -> `COMPLETE`).
   */
  function createDefenseRollSequence(request = {}, matchState = {}) {
    const sequenceId = request.sequenceId || `def_${Number(matchState.seqCounter) || 0}`;
    const unitName = String(request.unitName || 'Horde Unit').trim();
    const matSide = request.matSide || 'RED';
    const opts = request.options || {};
    const numWounds = Math.max(0, Number(opts.numWounds) || 0);
    const damagePerWound = Math.max(1, Number(opts.damagePerWound) || 1);
    const mortalWounds = Boolean(opts.mortalWounds);

    const defenseProfile = combatCore.resolveHordeDefenseProfile(
      request.defender || {},
      request.incomingAttack || {},
      matchState,
      request.context || {}
    );

    const wpm = defenseProfile.woundsPerModel || 1;
    const startingModels = Math.max(1, Number(opts.startingModels) || 1);
    const startWounds = opts.currentModelRemainingWounds
      ? Math.min(wpm, Number(opts.currentModelRemainingWounds))
      : wpm;

    const seq = {
      sequenceId,
      kind: 'AUTO_DEFENDER',
      unitName,
      matSide,
      numWounds,
      damagePerWound,
      mortalWounds,
      startingModels,
      startWounds,
      defenseProfile,
      stage: 'SAVES',
      expectedDice: 0,
      didOnDeath: false,
      didRespawn: false,
      nextCommand: null,
      outcome: {
        savesRolled: [],
        savesPassed: 0,
        unsavedWounds: 0,
        fnpRolls: [],
        fnpPassed: 0,
        finalDamageInflicted: 0,
        modelsSlain: 0,
        remainingModels: startingModels,
        currentModelRemainingWounds: startWounds,
        unitDestroyed: false,
        onDeathRolls: [],
        onDeathTriggers: 0,
        gscRespawnRoll: null,
        gscRespawnTriggered: false
      }
    };

    if (numWounds === 0) {
      seq.stage = 'COMPLETE';
      return seq;
    }

    if (!mortalWounds) {
      seq.stage = 'SAVES';
      seq.expectedDice = numWounds;
      seq.nextCommand = buildLctCommand(
        sequenceId,
        'SAVES',
        numWounds,
        defenseProfile.saveTarget,
        matSide,
        `${unitName} — ${numWounds}x Saves (${defenseProfile.saveTarget}+)`
      );
      return seq;
    }

    seq.outcome.unsavedWounds = numWounds;
    if (defenseProfile.fnp) {
      const fnpCount = numWounds * damagePerWound;
      seq.stage = 'FNP';
      seq.expectedDice = fnpCount;
      seq.nextCommand = buildLctCommand(
        sequenceId,
        'FNP',
        fnpCount,
        defenseProfile.fnp,
        matSide,
        `${unitName} — ${fnpCount}x Feel No Pain (${defenseProfile.fnp}+)`
      );
      return seq;
    }

    const alloc = applyDamagePacketsToModels([numWounds * damagePerWound], wpm, startingModels, startWounds, true);
    Object.assign(seq.outcome, alloc, { unitDestroyed: alloc.remainingModels <= 0 });
    return finalizeOrAdvancePostDamageStage(seq);
  }

  /**
   * Advances a pending Defense sequence using actual pip values settled on LCT's TTS dice mat.
   */
  function advanceDefenseRollSequence(prevSeq, rawDice = []) {
    const seq = JSON.parse(JSON.stringify(prevSeq));
    if (seq.stage === 'COMPLETE') return seq;

    const dice = (Array.isArray(rawDice) ? rawDice : []).slice(0, seq.expectedDice).map(Number);
    if (dice.length < seq.expectedDice) {
      throw new Error(`Expected ${seq.expectedDice} dice from LCT mat for ${seq.stage}, got ${dice.length}`);
    }

    const prof = seq.defenseProfile;
    const wpm = prof.woundsPerModel || 1;

    if (seq.stage === 'SAVES') {
      seq.outcome.savesRolled = dice;
      const passed = dice.filter(d => d >= 2 && d >= prof.saveTarget).length;
      const unsaved = dice.length - passed;
      seq.outcome.savesPassed = passed;
      seq.outcome.unsavedWounds = unsaved;

      if (unsaved === 0) {
        seq.stage = 'COMPLETE';
        seq.expectedDice = 0;
        seq.nextCommand = null;
        return seq;
      }

      if (prof.fnp) {
        const fnpCount = unsaved * seq.damagePerWound;
        seq.stage = 'FNP';
        seq.expectedDice = fnpCount;
        seq.nextCommand = buildLctCommand(
          seq.sequenceId,
          'FNP',
          fnpCount,
          prof.fnp,
          seq.matSide,
          `${seq.unitName} — ${fnpCount}x Feel No Pain (${prof.fnp}+)`
        );
        return seq;
      }

      const packets = new Array(unsaved).fill(seq.damagePerWound);
      const alloc = applyDamagePacketsToModels(packets, wpm, seq.startingModels, seq.startWounds, false);
      Object.assign(seq.outcome, alloc, { unitDestroyed: alloc.remainingModels <= 0 });
      return finalizeOrAdvancePostDamageStage(seq);
    }

    if (seq.stage === 'FNP') {
      seq.outcome.fnpRolls = dice;
      seq.outcome.fnpPassed = dice.filter(d => d >= prof.fnp).length;

