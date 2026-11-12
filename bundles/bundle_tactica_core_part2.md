# 📦 Fires of Armageddon // Bundle: In-Match LCT Tactical Functional Core (Part 2: Horde Attacks, Chronicle & ViewModels)

Pure Horde Attack LCT dice-mat sequence, Round 1–6 post-match chronicle compiler, and MVVM telemetry/reserves ViewModel selectors (`js/tactica-core.js` lines 501 to end).

## 📑 Table of Contents
- [js/tactica-core.js (Part 2: Horde Attacks, Chronicle & MVVM Selectors, Lines 501-1100)](#file-jstacticacorejspart2hordeattackschroniclemvvmselectorslines5011100)

---

## File: `js/tactica-core.js (Part 2: Horde Attacks, Chronicle & MVVM Selectors, Lines 501-1100)` <a id="file-jstacticacorejspart2hordeattackschroniclemvvmselectorslines5011100"></a>

````javascript
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

  /**
   * Pure MVVM ViewModel selector projecting normalized tabletop telemetry units into declarative,
   * display-ready row ViewModels for the Humble View (`js/tactica.js`) with zero DOM dependencies.
   *
   * @param {Array<object>} [units=[]] - Scanned tabletop units from `state.boardTelemetry.units`.
   * @returns {Array<object>} Declarative row ViewModels.
   */
  function selectTelemetryRowViewModels(units = [], phaseOriginSnapshots = {}) {
    if (!Array.isArray(units)) return [];
    const snapshots = (phaseOriginSnapshots && typeof phaseOriginSnapshots === 'object') ? phaseOriginSnapshots : {};
    return units.map((u, index) => {
      const isPlayer = String(u?.side || '').toUpperCase() === 'PLAYER';
      const squadKey = u?.squadKey || `${isPlayer ? 'PLAYER' : 'HORDE'}::${u?.name || 'Unit'}`;
      const savePart = `Sv ${u?.save || 4}+${u?.invuln ? `/${u.invuln}++` : ''}${u?.fnp ? `/FNP ${u.fnp}+` : ''}`;
      const modelCount = Number(u?.modelCount) || 1;
      const cargo = Array.isArray(u?.embarkedCargo) ? u.embarkedCargo : [];
      const embarkedSummary = u?.embarkedSummary || (cargo.length > 0
        ? cargo.map(c => `${Math.max(1, Number(c.count) || 1)}x ${c.templateName}`).join(' + ')
        : null);
      const nearObj = u?.closestObjective
        ? `${u.closestObjective.name} (${u.closestObjective.distanceInches}")`
        : 'None';
      const nearEnemy = u?.closestEnemy
        ? `${u.closestEnemy.name} (${u.closestEnemy.distanceInches}")`
        : 'None';
      const didIngress = Boolean(
        u?.didIngressThisTurn ||
        (Array.isArray(u?.tags) && u.tags.some(t => String(t).toUpperCase() === 'DEEP_STRUCK'))
      );

      return {
        index,
        squadKey,
        side: isPlayer ? 'PLAYER' : 'HORDE',
        sideBadgeClass: isPlayer ? 'blue' : 'red',
        name: u?.name || 'Unknown Unit',
        statsBracketText: `[x${modelCount} • ${savePart}]`,
        proximityText: `• Obj: ${nearObj} • Nearest Enemy: ${nearEnemy}`,
        didIngressThisTurn: didIngress,
        deepStruckBadgeText: didIngress ? '🪂 Deep Struck' : '',
        hasEmbarkedCargo: Boolean(embarkedSummary),
        embarkedBadgeText: embarkedSummary ? `🚌 Embarked: ${embarkedSummary}` : '',
        canDisembark: cargo.length > 0,
        canUndoMove: !isPlayer && Boolean(snapshots[squadKey]),
        canLoadAutoDefender: !isPlayer
      };
    });
  }

  /**
   * Pure MVVM ViewModel selector projecting `state.hordeReserves` onto `#tacticaReservesStrip`
   * and `#hordeStepBtn2` without DOM dependencies.
   *
   * @param {Array<object>} [hordeReserves=[]] - Queued Deep Strike / Pincer reserve descriptors.
   * @returns {{visible: boolean, count: number, bannerText: string, bannerHtml: string, step2ButtonText: string}}
   */
  function selectReservesBannerViewModel(hordeReserves = []) {
    if (!Array.isArray(hordeReserves) || hordeReserves.length === 0) {
      return {
        visible: false,
        count: 0,
        bannerText: '',
        bannerHtml: '',
        step2ButtonText: '2. Move & LOS'
      };
    }
    const itemsText = hordeReserves.map(r => {
      const distTag = r?.mode === 'PINCER_MANEUVER' ? '>3" Pincer' : '>8"';
      return `${r?.unitLabel || 'Horde Squad'} (${distTag})`;
    }).join(', ');
    const itemsHtml = hordeReserves.map(r => {
      const distTag = r?.mode === 'PINCER_MANEUVER' ? '&gt;3" Pincer' : '&gt;8"';
      return `${r?.unitLabel || 'Horde Squad'} (${distTag})`;
    }).join(' • ');
    return {
      visible: true,
      count: hordeReserves.length,
      bannerText: `🪂 Holding in Deep Strike Reserves (Drops in Step 2): ${itemsText}`,
      bannerHtml: `🪂 <strong>Holding in Deep Strike Reserves (Drops in Step 2):</strong> ${itemsHtml}`,
      step2ButtonText: `2. Move & Ingress (${hordeReserves.length} 🪂)`
    };
  }

  return {
    TACTICA_PHASES,
    PHASE_ORDER_INDEX,
    REACTION_WINDOW_DEFS,
    createInitialTacticaState,
    createPlayerStratagemBuff,
    pruneExpiredPlayerBuffs,
    selectTelemetryRowViewModels,
    selectReservesBannerViewModel,
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

````
