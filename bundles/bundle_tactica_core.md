# 📦 Fires of Armageddon // Bundle: In-Match LCT Tactical Functional Core

Pure Functional Core LCT dice-mat multi-stage state machines, reaction window detector, Horde Warlord tracker, Round 1–6 chronicle compiler, and unit tests (`js/tactica-core.js`, `tests/js/tactica-core.test.js`).

## 📑 Table of Contents
- [js/tactica-core.js](#file-jstacticacorejs)
- [tests/js/tactica-core.test.js](#file-testsjstacticacoretestjs)

---

## File: `js/tactica-core.js` <a id="file-jstacticacorejs"></a>

````javascript
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
   * Initializes a deterministic multi-stage LCT dice-mat sequence for Horde Shooting/Melee Attacks.
   */
  function createHordeAttackRollSequence(request = {}, matchState = {}) {
    const sequenceId = request.sequenceId || `atk_${Number(matchState.seqCounter) || 0}`;
    const attackerName = String(request.attackerName || 'Horde Attacker').trim();
    const targetName = String(request.targetName || 'Player Unit').trim();
    const matSide = request.matSide || 'RED';
    const weapon = request.weapon || {};
    const attackMods = combatCore.resolveHordeAttackModifiers(
      request.attacker || {},
      request.target || {},
      weapon,
      matchState,
      request.context || {}
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
  };
});

````

---

## File: `tests/js/tactica-core.test.js` <a id="file-testsjstacticacoretestjs"></a>

````javascript
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
````
