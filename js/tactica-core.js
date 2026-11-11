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

  /** Numeric progression lookup for phase-scoped and "until next turn" buff expiration. */
  const PHASE_ORDER_INDEX = {
    COMMAND_SPAWN: 0,
    HORDE_MOVEMENT: 1,
    HORDE_SHOOTING: 2,
    HORDE_CHARGE: 3,
    HORDE_FIGHT: 4,
    PLAYER_TURN: 5,
    ROUND_END: 6
  };

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
      activePlayerBuffs: Array.isArray(overrides.activePlayerBuffs) ? [...overrides.activePlayerBuffs] : [],
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

      if (seq.mortalWounds) {
        const unshrugged = dice.length - seq.outcome.fnpPassed;
        const alloc = applyDamagePacketsToModels([unshrugged], wpm, seq.startingModels, seq.startWounds, true);
        Object.assign(seq.outcome, alloc, { unitDestroyed: alloc.remainingModels <= 0 });
      } else {
        const packets = [];
        for (let w = 0; w < seq.outcome.unsavedWounds; w++) {
          const slice = dice.slice(w * seq.damagePerWound, (w + 1) * seq.damagePerWound);
          packets.push(slice.filter(d => d < prof.fnp).length);
        }
        const alloc = applyDamagePacketsToModels(packets, wpm, seq.startingModels, seq.startWounds, false);
        Object.assign(seq.outcome, alloc, { unitDestroyed: alloc.remainingModels <= 0 });
      }
      return finalizeOrAdvancePostDamageStage(seq);
    }

    if (seq.stage === 'ON_DEATH') {
      seq.didOnDeath = true;
      seq.outcome.onDeathRolls = dice;
      seq.outcome.onDeathTriggers = dice.filter(d => d >= prof.shootOrFightOnDeathThreshold).length;
      return finalizeOrAdvancePostDamageStage(seq);
    }

    if (seq.stage === 'GSC_RESPAWN') {
      seq.didRespawn = true;
      seq.outcome.gscRespawnRoll = dice[0];
      seq.outcome.gscRespawnTriggered = dice[0] >= prof.gscRespawnThreshold;
      return finalizeOrAdvancePostDamageStage(seq);
    }

    return seq;
  }

  /**
   * Constructs a normalized Player Stratagem buff descriptor with explicit `PHASE` (99% default,
   * lasting a single combat phase) vs `ROUND` ("for the round" / "until your next shooting phase")
   * lifecycle metadata.
   *
   * @param {object} [parsedStrat={}] - Parsed Stratagem intent + `resolvedTarget`.
   * @param {object} [state={}] - Current Tactica match state (`battleRound`, `phase`).
   * @returns {object}
   */
  function createPlayerStratagemBuff(parsedStrat = {}, state = {}) {
    const round = Math.max(1, Number(state.battleRound) || 1);
    const curPhase = TACTICA_PHASES.includes(state.phase) ? state.phase : 'COMMAND_SPAWN';
    const scope = String(parsedStrat.durationScope || 'PHASE').toUpperCase() === 'ROUND' ? 'ROUND' : 'PHASE';
    const rawBuff = parsedStrat.buff || {};
    const targetUnit = parsedStrat.resolvedTarget !== undefined ? parsedStrat.resolvedTarget : (parsedStrat.targetUnit || null);

    if (scope === 'ROUND') {
      const fromPlayerTurn = curPhase === 'PLAYER_TURN' || curPhase === 'ROUND_END';
      return {
        stratKey: parsedStrat.stratKey || 'FACTION_CUSTOM',
        stratName: parsedStrat.stratName || 'Stratagem',
        targetUnit,
        durationScope: 'ROUND',
        battleRound: round,
        createdPhase: curPhase,
        expiresRound: fromPlayerTurn ? round + 1 : round,
        expiresAtPhase: fromPlayerTurn ? 'PLAYER_TURN' : 'END_OF_ROUND',
        hitMod: Number(rawBuff.hitMod) || 0,
        worsenAp: Number(rawBuff.worsenAp) || 0,
        cover: Boolean(rawBuff.cover),
        invuln6: Boolean(rawBuff.invuln6)
      };
    }

    let activePhase = curPhase;
    if (parsedStrat.stratKey === 'SMOKESCREEN' || parsedStrat.stratKey === 'GO_TO_GROUND') {
      activePhase = 'HORDE_SHOOTING';
    } else if (curPhase === 'COMMAND_SPAWN' || curPhase === 'HORDE_MOVEMENT' || curPhase === 'HORDE_SHOOTING') {
      activePhase = 'HORDE_SHOOTING';
    } else if (curPhase === 'HORDE_CHARGE' || curPhase === 'HORDE_FIGHT') {
      activePhase = 'HORDE_FIGHT';
    }
    const curIdx = PHASE_ORDER_INDEX[curPhase] ?? 0;
    const activeIdx = PHASE_ORDER_INDEX[activePhase] ?? curIdx;

    return {
      stratKey: parsedStrat.stratKey || 'FACTION_CUSTOM',
      stratName: parsedStrat.stratName || 'Stratagem',
      targetUnit,
      durationScope: 'PHASE',
      battleRound: round,
      createdPhase: curPhase,
      activePhase,
      pendingUntilActivePhase: curIdx < activeIdx,
      hitMod: Number(rawBuff.hitMod) || 0,
      worsenAp: Number(rawBuff.worsenAp) || 0,
      cover: Boolean(rawBuff.cover),
      invuln6: Boolean(rawBuff.invuln6)
    };
  }

  /**
   * Pure lifecycle reducer: prunes expired `PHASE`-scoped buffs as soon as their single combat
   * phase ends, while keeping `ROUND`-scoped buffs active across the round (or until the Player's
   * next turn when declared during `PLAYER_TURN`).
   *
   * @param {Array<object>} [activePlayerBuffs=[]] - Active Player Stratagem buff list.
   * @param {number} [currentRound=1] - Current Battle Round.
   * @param {string} [currentPhase='COMMAND_SPAWN'] - Current phase key.
   * @returns {Array<object>}
   */
  function pruneExpiredPlayerBuffs(activePlayerBuffs = [], currentRound = 1, currentPhase = 'COMMAND_SPAWN') {
    if (!Array.isArray(activePlayerBuffs) || activePlayerBuffs.length === 0) return [];
    const rnd = Math.max(1, Number(currentRound) || 1);
    const phase = TACTICA_PHASES.includes(currentPhase) ? currentPhase : 'COMMAND_SPAWN';
    const curIdx = PHASE_ORDER_INDEX[phase] ?? 0;
    const kept = [];

    for (const b of activePlayerBuffs) {
      if (!b || typeof b !== 'object') continue;
      const scope = String(b.durationScope || 'PHASE').toUpperCase();

      if (scope === 'ROUND') {
        const startRnd = Math.max(1, Number(b.battleRound) || rnd);
        const expRnd = Math.max(startRnd, Number(b.expiresRound) || startRnd);
        if (rnd < startRnd || rnd > expRnd) continue;
        if (rnd === expRnd && b.expiresAtPhase && b.expiresAtPhase !== 'END_OF_ROUND') {
          const expIdx = PHASE_ORDER_INDEX[b.expiresAtPhase] ?? 5;
          if (curIdx >= expIdx) continue;
        }
        kept.push({ ...b });
        continue;
      }

      const buffRnd = Math.max(1, Number(b.battleRound) || rnd);
      if (rnd !== buffRnd) continue;
      const targetPhase = b.activePhase || 'HORDE_SHOOTING';
      const targetIdx = PHASE_ORDER_INDEX[targetPhase] ?? 2;

      if (phase === targetPhase) {
        kept.push({ ...b, pendingUntilActivePhase: false });
      } else if (b.pendingUntilActivePhase && curIdx < targetIdx) {
        kept.push({ ...b });
      }
    }
    return kept;
  }

  /**
   * Pure helper: aggregates active Player Stratagem defensive buffs (such as Smokescreen
   * `-1` to Hit, Go to Ground Cover/6++, or Void Armour AP worsen) matching a targeted Player squad
   * for the current Battle Round and Phase.
   *
   * @param {string} [targetName=''] - Targeted Player unit name.
   * @param {Array<object>} [activePlayerBuffs=[]] - Active Player Stratagem buff descriptors.
   * @param {number|null} [currentRound=null] - Current Battle Round.
   * @param {string|null} [currentPhase=null] - Current Phase key.
   * @returns {{hitMod: number, worsenAp: number, cover: boolean, invuln6: boolean}}
   */
  function resolvePlayerUnitDefensiveBuffs(targetName = '', activePlayerBuffs = [], currentRound = null, currentPhase = null) {
    const out = { hitMod: 0, worsenAp: 0, cover: false, invuln6: false };
    if (!Array.isArray(activePlayerBuffs) || activePlayerBuffs.length === 0) return out;
    const tNorm = String(targetName || '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();

    for (const b of activePlayerBuffs) {
      if (!b || typeof b !== 'object') continue;
      const scope = String(b.durationScope || 'PHASE').toUpperCase();

      if (scope === 'ROUND') {
        if (currentRound !== null) {
          const rnd = Number(currentRound);
          const startRnd = Number(b.battleRound ?? rnd);
          const expRnd = Number(b.expiresRound ?? startRnd);
          if (rnd < startRnd || rnd > expRnd) continue;
          if (currentPhase && rnd === expRnd && b.expiresAtPhase && b.expiresAtPhase !== 'END_OF_ROUND') {
            const curIdx = PHASE_ORDER_INDEX[currentPhase] ?? 0;
            const expIdx = PHASE_ORDER_INDEX[b.expiresAtPhase] ?? 5;
            if (curIdx >= expIdx) continue;
          }
        }
      } else {
        if (currentRound !== null && b.battleRound !== undefined && Number(b.battleRound) !== Number(currentRound)) {
          continue;
        }
        if (currentPhase && b.activePhase && b.activePhase !== currentPhase) {
          continue;
        }
      }

      if (b.targetUnit) {
        const bNorm = String(b.targetUnit).toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
        if (bNorm && tNorm && bNorm !== tNorm && !tNorm.includes(bNorm) && !bNorm.includes(tNorm)) {
          continue;
        }
      }
      out.hitMod += Number(b.hitMod) || 0;
      out.worsenAp += Number(b.worsenAp) || 0;
      if (b.cover) out.cover = true;
      if (b.invuln6) out.invuln6 = true;
    }
    return out;
  }

  /**
   * Initializes a deterministic multi-stage LCT dice-mat sequence for Horde Shooting/Melee Attacks.
   */
  function createHordeAttackRollSequence(request = {}, matchState = {}) {
    const sequenceId = request.sequenceId || `atk_${Number(matchState.seqCounter) || 0}`;
    const attackerName = String(request.attackerName || 'Horde Attacker').trim();
    const targetName = String(request.targetName || 'Player Unit').trim();
    const matSide = request.matSide || 'RED';
    const weapon = request.weapon || {};
    const rawContext = request.context || {};
    const stateBuff = resolvePlayerUnitDefensiveBuffs(
      targetName,
      matchState.activePlayerBuffs,
      matchState.battleRound ?? null,
      matchState.phase || null
    );
    const mergedContext = {
      ...rawContext,
      ...(rawContext.targetHitMod === undefined && request.target?.hitMod === undefined && stateBuff.hitMod !== 0
        ? { targetHitMod: stateBuff.hitMod }
        : {}),
      ...(rawContext.targetWorsenAp === undefined && request.target?.worsenAp === undefined && stateBuff.worsenAp !== 0
        ? { targetWorsenAp: stateBuff.worsenAp }
        : {})
    };
    const attackMods = combatCore.resolveHordeAttackModifiers(
      request.attacker || {},
      request.target || {},
      weapon,
      matchState,
      mergedContext
    );

    const totalAttacks = Math.max(0, (Number(weapon.attacks) || 1) + attackMods.attacksMod);
    const seq = {
      sequenceId,
      kind: 'HORDE_ATTACK',
      attackerName,
      targetName,
      matSide,
      attacker: request.attacker || {},
      target: request.target || {},
      weapon,
      context: request.context || {},
      matchStateSnapshot: { factionName: matchState.factionName, activeMiseryIds: matchState.activeMiseryIds || [] },
      attackMods,
      totalAttacks,
      stage: 'HITS',
      expectedDice: 0,
      hitsToWound: 0,
      autoWounds: 0,
      normalWounds: 0,
      devastatingMortalWounds: 0,
      nextCommand: null
    };

    if (totalAttacks === 0) {
      seq.stage = 'COMPLETE';
      return seq;
    }

    if (attackMods.requiresTauGlassesRoll) {
      seq.stage = 'TAU_GLASSES';
      seq.expectedDice = 1;
      seq.nextCommand = buildLctCommand(sequenceId, 'TAU_GLASSES', 1, 4, matSide, `${attackerName} — T'au Glasses Check (4+)`);
      return seq;
    }

    const hitThresh = clamp(attackMods.effectiveSkill - attackMods.netHitMod, 2, 6);
    seq.stage = 'HITS';
    seq.expectedDice = totalAttacks;
    seq.nextCommand = buildLctCommand(sequenceId, 'HITS', totalAttacks, hitThresh, matSide, `${attackerName} -> ${targetName} — ${totalAttacks}x Hits (${hitThresh}+)`);
    return seq;
  }

  function evaluateHitDiceBatch(dice, mods) {
    const kws = mods.keywords || [];
    const hasLethal = kws.includes('LETHAL HITS') || kws.includes('LETHAL HITS 1');
    const hasSustained = kws.includes('SUSTAINED HITS 1');
    let normalHits = 0;
    let autoWounds = 0;
    let ones = 0;
    let misses = 0;

    for (const d of dice) {
      if (d === 6) {
        if (hasLethal) autoWounds += 1;
        else normalHits += 1;
        if (hasSustained) normalHits += 1;
      } else if (d === 1) {
        ones += 1;
        misses += 1;
      } else if (d + mods.netHitMod >= mods.effectiveSkill) {
        normalHits += 1;
      } else {
        misses += 1;
      }
    }
    return { normalHits, autoWounds, ones, misses };
  }

  function evaluateWoundDiceBatch(dice, mods) {
    const hasDevastating = (mods.keywords || []).includes('DEVASTATING WOUNDS');
    let normalWounds = 0;
    let devastatingMortalWounds = 0;
    let ones = 0;
    let misses = 0;

    for (const d of dice) {
      if (d === 6) {
        if (hasDevastating) devastatingMortalWounds += 1;
        else normalWounds += 1;
      } else if (d === 1) {
        ones += 1;
        misses += 1;
      } else if (d + mods.netWoundMod >= mods.woundTarget) {
        normalWounds += 1;
      } else {
        misses += 1;
      }
    }
    return { normalWounds, devastatingMortalWounds, ones, misses };
  }

  /**
   * Advances a Horde Attack sequence using settled pips from LCT's TTS dice mat.
   */
  function advanceHordeAttackRollSequence(prevSeq, rawDice = []) {
    const seq = JSON.parse(JSON.stringify(prevSeq));
    if (seq.stage === 'COMPLETE') return seq;

    const dice = (Array.isArray(rawDice) ? rawDice : []).slice(0, seq.expectedDice).map(Number);
    if (dice.length < seq.expectedDice) {
      throw new Error(`Expected ${seq.expectedDice} dice from LCT mat for ${seq.stage}, got ${dice.length}`);
    }

    if (seq.stage === 'TAU_GLASSES') {
      seq.attackMods = combatCore.resolveHordeAttackModifiers(
        seq.attacker, seq.target, seq.weapon, seq.matchStateSnapshot,
        { ...seq.context, tauGlassesPassed: dice[0] >= 4 }
      );
      const hitThresh = clamp(seq.attackMods.effectiveSkill - seq.attackMods.netHitMod, 2, 6);
      seq.stage = 'HITS';
      seq.expectedDice = seq.totalAttacks;
      seq.nextCommand = buildLctCommand(seq.sequenceId, 'HITS', seq.totalAttacks, hitThresh, seq.matSide, `${seq.attackerName} — ${seq.totalAttacks}x Hits (${hitThresh}+)`);
      return seq;
    }

    if (seq.stage === 'HITS' || seq.stage === 'HIT_REROLLS') {
      const batch = evaluateHitDiceBatch(dice, seq.attackMods);
      seq.hitsToWound += batch.normalHits;
      seq.autoWounds += batch.autoWounds;

      if (seq.stage === 'HITS') {
        const rerollCount = seq.attackMods.rerollHits === 'ALL'
          ? batch.misses
          : (seq.attackMods.rerollHits === 'ONES' ? batch.ones : 0);
        if (rerollCount > 0) {
          const hitThresh = clamp(seq.attackMods.effectiveSkill - seq.attackMods.netHitMod, 2, 6);
          seq.stage = 'HIT_REROLLS';
          seq.expectedDice = rerollCount;
          seq.nextCommand = buildLctCommand(seq.sequenceId, 'HIT_REROLLS', rerollCount, hitThresh, seq.matSide, `${seq.attackerName} — ${rerollCount}x Hit Re-rolls (${hitThresh}+)`);
          return seq;
        }
      }

      seq.normalWounds += seq.autoWounds;
      if (seq.hitsToWound <= 0) {
        seq.stage = 'COMPLETE';
        seq.expectedDice = 0;
        seq.nextCommand = null;
        return seq;
      }

      const wndThresh = clamp(seq.attackMods.woundTarget - seq.attackMods.netWoundMod, 2, 6);
      seq.stage = 'WOUNDS';
      seq.expectedDice = seq.hitsToWound;
      seq.nextCommand = buildLctCommand(seq.sequenceId, 'WOUNDS', seq.hitsToWound, wndThresh, seq.matSide, `${seq.attackerName} — ${seq.hitsToWound}x Wounds (${wndThresh}+)`);
      return seq;
    }

    if (seq.stage === 'WOUNDS' || seq.stage === 'WOUND_REROLLS') {
      const batch = evaluateWoundDiceBatch(dice, seq.attackMods);
      seq.normalWounds += batch.normalWounds;
      seq.devastatingMortalWounds += batch.devastatingMortalWounds;

      if (seq.stage === 'WOUNDS') {
        const twinLinked = (seq.attackMods.keywords || []).includes('TWIN-LINKED');
        const rerollCount = twinLinked
          ? batch.misses
          : (seq.attackMods.rerollWounds === 'ONES' ? batch.ones : 0);
        if (rerollCount > 0) {
          const wndThresh = clamp(seq.attackMods.woundTarget - seq.attackMods.netWoundMod, 2, 6);
          seq.stage = 'WOUND_REROLLS';
          seq.expectedDice = rerollCount;
          seq.nextCommand = buildLctCommand(seq.sequenceId, 'WOUND_REROLLS', rerollCount, wndThresh, seq.matSide, `${seq.attackerName} — ${rerollCount}x Wound Re-rolls (${wndThresh}+)`);
          return seq;
        }
      }

      seq.stage = 'COMPLETE';
      seq.expectedDice = 0;
      seq.nextCommand = null;
      return seq;
    }

    return seq;
  }

  /**
   * Compiles the complete Round 1–6 After-Action Tactical Chronicle dossier for Astropathic Vox archival.
   */
  function compileTacticaPostMatchReport(state = {}, chronicleEntries = [], options = {}) {
    const chan = options.channel || 'alpha';
    const cmdr = chan === 'beta'
      ? 'LORD COMMANDER JUNEBUG // TOMB-SHIP QUANTUM INTERLINK'
      : (chan === 'gamma'
          ? 'KÂHL HÂRKYN // FANE-NODE VÔL-09 BLACK-LEDGER'
          : 'THE EXILE // SANCTUARY OF ASH');

    const outcome = (options.outcome || '').trim() || `Concluded at Battle Round ${state.battleRound || 1}`;
    const wl = state.hordeWarlord
      ? `${state.hordeWarlord.name} (${state.hordeWarlord.alive === false ? 'Slain' : 'Survived'} • Spawned R${state.hordeWarlord.roundSpawned || 1})`
      : 'None Spawned';

    const lines = [
      '+++ IN-MATCH TACTICAL BLACK-BOX CHRONICLE // AFTER-ACTION SUMMARY +++',
      `• REPORTING COMMANDER: ${cmdr}`,
      `• ROOM SEED & HORDE ADVERSARY: ${state.roomCode || 'HADES-1'} // ${state.factionName || 'Horde'}`,
      `• MATCH OUTCOME: ${outcome}`,
      `• HORDE WARLORD TELEMETRY: ${wl}`,
      `• FINAL DEFENDER RESERVES: ${state.playerSp || 0} SP • ${state.playerCp || 0} CP`,
      '------------------------------------------------'
    ];

    const grouped = new Map();
    for (const e of (chronicleEntries || [])) {
      if (!e || !e.summary) continue;
      const r = Number(e.battleRound) || 0;
      if (!grouped.has(r)) grouped.set(r, []);
      grouped.get(r).push(e);
    }

    const sortedRounds = Array.from(grouped.keys()).sort((a, b) => a - b);
    if (sortedRounds.length === 0) {
      lines.push('• [NO TACTICAL EVENTS RECORDED IN CHRONICLE]');
    } else {
      for (const r of sortedRounds) {
        lines.push(r === 0 ? '[DEPLOYMENT & PRE-GAME]:' : `[BATTLE ROUND ${r}]:`);
        for (const ev of grouped.get(r)) {
          lines.push(`  • [${ev.phase || 'PHASE'} // ${ev.type}] ${ev.summary}`);
        }
      }
    }

    lines.push(
      '------------------------------------------------',
      'REQUEST FOR CAMPAIGN MASTER: Archive this complete Round-by-Round Tactical Black-Box Chronicle into the campaign record (Pattern 2)!'
    );
    return lines.join('\n');
  }

  return {
    TACTICA_PHASES,
    PHASE_ORDER_INDEX,
    REACTION_WINDOW_DEFS,
    createInitialTacticaState,
    createPlayerStratagemBuff,
    pruneExpiredPlayerBuffs,
    formatChronicleEntry,
    detectPlayerReactionWindow,
    assignHordeWarlordIfEligible,
    createDefenseRollSequence,
    advanceDefenseRollSequence,
    resolvePlayerUnitDefensiveBuffs,
    createHordeAttackRollSequence,
    advanceHordeAttackRollSequence,
    compileTacticaPostMatchReport
  };
});

