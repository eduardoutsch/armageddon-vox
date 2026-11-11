# 📦 Fires of Armageddon // Bundle: LCT Tactica Daemon & Scribe Server (Part 2: LCT Mat, Autopilot & Overwatch Routes)

HTTP endpoints for LCT dice-mat sequences, TTS board telemetry, Horde Autopilot wave/ingress/fallback/revert commands, and 3D Vision LOS verification (`tactica_daemon.js` lines 511 to end).

## 📑 Table of Contents
- [tactica_daemon.js (Part 2: LCT Mat, Autopilot & Vision LOS Routes, Lines 511-1100)](#file-tacticadaemonjspart2lctmatautopilotvisionlosrouteslines5111100)

---

## File: `tactica_daemon.js (Part 2: LCT Mat, Autopilot & Vision LOS Routes, Lines 511-1100)` <a id="file-tacticadaemonjspart2lctmatautopilotvisionlosrouteslines5111100"></a>

````javascript
      if (Array.isArray(body.hordeReserves)) liveState.hordeReserves = body.hordeReserves;
      if (Array.isArray(body.shelfTemplates)) liveState.shelfTemplates = body.shelfTemplates;
      if (Array.isArray(body.activePlayerBuffs)) liveState.activePlayerBuffs = body.activePlayerBuffs;
      savePersistedState();
      return sendJson(res, 200, { ok: true, state: liveState });
    }

    if (req.method === 'POST' && urlPath === '/chronicle/append') {
      const body = await readJsonBody(req);
      const roundOrPhaseChanged = body.battleRound !== undefined || Boolean(body.phase);
      if (body.battleRound !== undefined) liveState.battleRound = Number(body.battleRound);
      if (body.phase) liveState.phase = body.phase;
      if (roundOrPhaseChanged) {
        liveState.activePlayerBuffs = pruneExpiredPlayerBuffs(
          liveState.activePlayerBuffs,
          liveState.battleRound,
          liveState.phase
        );
      }
      const entry = appendEvent(body);
      if (body.reactionTrigger) {
        const win = detectPlayerReactionWindow(body.reactionTrigger, liveState);
        liveState.pendingReactionWindow = win.open ? win : null;
        savePersistedState();
      }
      return sendJson(res, 200, { ok: true, entry, pendingReactionWindow: liveState.pendingReactionWindow });
    }

    if (req.method === 'POST' && urlPath === '/reaction/resolve') {
      const body = await readJsonBody(req);
      const cpSpent = Math.max(0, Number(body.cpSpent) || 0);
      liveState.playerCp = Math.max(0, (Number(liveState.playerCp) || 0) - cpSpent);
      liveState.pendingReactionWindow = null;
      const entry = appendEvent({
        type: 'REACTION',
        summary: body.summary || `Player resolved reaction: ${body.choice || 'PASS'} (-${cpSpent} CP).`
      });
      return sendJson(res, 200, { ok: true, state: liveState, entry });
    }

    if (req.method === 'POST' && urlPath === '/combat/defend-request') {
      const body = await readJsonBody(req);
      cmdCounter += 1;
      const seq = createDefenseRollSequence({ ...body, sequenceId: `def_${Date.now()}_${cmdCounter}` }, liveState);
      if (seq.stage === 'COMPLETE') {
        liveState.pendingDiceSequence = null;
        const entry = logCompletedSequence(seq);
        return sendJson(res, 200, { ok: true, sequence: seq, entry });
      }
      liveState.pendingDiceSequence = seq;
      queueNextSequenceCommand(seq);
      savePersistedState();
      return sendJson(res, 200, { ok: true, sequence: seq, queueLength: ttsCommandQueue.length });
    }

    if (req.method === 'POST' && urlPath === '/combat/attack-request') {
      const body = await readJsonBody(req);
      cmdCounter += 1;
      const seq = createHordeAttackRollSequence({ ...body, sequenceId: `atk_${Date.now()}_${cmdCounter}` }, liveState);
      if (seq.stage === 'COMPLETE') {
        liveState.pendingDiceSequence = null;
        const entry = logCompletedSequence(seq);
        return sendJson(res, 200, { ok: true, sequence: seq, entry });
      }
      liveState.pendingDiceSequence = seq;
      queueNextSequenceCommand(seq);
      savePersistedState();
      return sendJson(res, 200, { ok: true, sequence: seq, queueLength: ttsCommandQueue.length });
    }

    if (req.method === 'POST' && urlPath === '/tts/dice-result') {
      const body = await readJsonBody(req);
      const dice = Array.isArray(body.dice) ? body.dice.map(Number) : [];
      liveState.lastDiceResult = { ...body, dice, receivedAt: Date.now() };

      const activeSeq = liveState.pendingDiceSequence;
      if (activeSeq && (!body.sequenceId || body.sequenceId === activeSeq.sequenceId)) {
        const updated = activeSeq.kind === 'AUTO_DEFENDER'
          ? advanceDefenseRollSequence(activeSeq, dice)
          : advanceHordeAttackRollSequence(activeSeq, dice);

        if (updated.stage === 'COMPLETE') {
          liveState.pendingDiceSequence = null;
          const entry = logCompletedSequence(updated);
          return sendJson(res, 200, { ok: true, sequence: updated, entry });
        }
        liveState.pendingDiceSequence = updated;
        queueNextSequenceCommand(updated);
        savePersistedState();
        return sendJson(res, 200, { ok: true, sequence: updated, queueLength: ttsCommandQueue.length });
      }

      if (liveState.pendingChargeDecl && (!body.sequenceId || body.sequenceId === liveState.pendingChargeDecl.sequenceId)) {
        const resolved = resolveHordeChargeRoll(liveState.pendingChargeDecl, dice);
        liveState.pendingChargeDecl = null;
        if (resolved.moveCommand) {
          cmdCounter += 1;
          ttsCommandQueue.push({ id: `lct_cmd_${Date.now()}_${cmdCounter}`, ...resolved.moveCommand });
        }
        const entry = appendEvent({
          type: 'HORDE_CHARGE',
          summary: `${resolved.attackerName} -> ${resolved.targetName} [LCT 2D6 = ${resolved.modifiedTotal}"]: ${resolved.succeeded ? 'CHARGE SUCCEEDED!' : 'Charge Failed.'}`
        });
        return sendJson(res, 200, { ok: true, chargeResult: resolved, entry });
      }

      const entry = appendEvent({
        type: 'TTS_DICE',
        summary: `LCT Mat Roll [${body.label || 'Check'}]: [${dice.join(', ')}]`
      });
      return sendJson(res, 200, { ok: true, sequence: null, entry });
    }

    if (req.method === 'POST' && urlPath === '/tts/enqueue') {
      const body = await readJsonBody(req);
      cmdCounter += 1;
      const cmd = { id: `lct_cmd_${Date.now()}_${cmdCounter}`, createdAt: Date.now(), ...body };
      ttsCommandQueue.push(cmd);
      return sendJson(res, 200, { ok: true, queued: cmd, queueLength: ttsCommandQueue.length });
    }

    if (req.method === 'POST' && urlPath === '/tts/set-side') {
      const body = await readJsonBody(req);
      const nextSide = String(body.side || 'PLAYER').toUpperCase() === 'HORDE' ? 'HORDE' : 'PLAYER';
      const guids = Array.isArray(body.guids) ? body.guids : [];
      const units = liveState.boardTelemetry?.units || [];
      units.forEach(u => {
        if (u.squadKey === body.squadKey || (guids.length > 0 && u.guids?.some(g => guids.includes(g)))) {
          u.side = nextSide;
          u.squadKey = `${nextSide}::${u.name}`;
        }
      });
      if (liveState.squadGuidRegistry && typeof liveState.squadGuidRegistry === 'object') {
        guids.forEach(g => {
          if (liveState.squadGuidRegistry[g]) {
            liveState.squadGuidRegistry[g].side = nextSide;
            liveState.squadGuidRegistry[g].squadKey = `${nextSide}::${liveState.squadGuidRegistry[g].name}`;
          }
        });
      }
      cmdCounter += 1;
      ttsCommandQueue.push({ id: `lct_cmd_${Date.now()}_${cmdCounter}`, action: 'SET_UNIT_SIDE', side: nextSide, guids });
      savePersistedState();
      return sendJson(res, 200, { ok: true, units });
    }

    if (req.method === 'POST' && urlPath === '/tts/telemetry') {
      const body = await readJsonBody(req);
      let units = Array.isArray(body.units) ? body.units : [];
      let objectives = Array.isArray(body.objectives) ? body.objectives : [];

      if (Array.isArray(body.objects)) {
        const normalized = normalizeTtsBoardScan(body, {
          hordeFactionName: liveState.factionName,
          previousUnits: liveState.boardTelemetry?.units || [],
          guidRegistry: liveState.squadGuidRegistry || {}
        });
        units = normalized.units;
        objectives = normalized.objectives;
        liveState.squadGuidRegistry = normalized.guidRegistry || {};
        if (Array.isArray(normalized.shelfTemplates) && normalized.shelfTemplates.length > 0) {
          liveState.shelfTemplates = normalized.shelfTemplates;
        }
      } else if (Array.isArray(body.shelfTemplates)) {
        liveState.shelfTemplates = body.shelfTemplates;
      }

      liveState.boardTelemetry = { updatedAt: Date.now(), units, objectives };

      const wlCheck = assignHordeWarlordIfEligible(liveState.hordeWarlord, units, liveState.battleRound);
      if (wlCheck.newlyAssigned) {
        liveState.hordeWarlord = wlCheck.warlord;
        appendEvent({ type: 'WARLORD', summary: `Designated ${wlCheck.warlord.name} as Horde Warlord!` });
      } else {
        savePersistedState();
      }
      return sendJson(res, 200, {
        ok: true,
        warlord: liveState.hordeWarlord,
        trackedUnits: units.length,
        objectives: objectives.length,
        units
      });
    }

    if (req.method === 'POST' && urlPath === '/autopilot/spawn-waves') {
      const body = await readJsonBody(req);
      liveState.phase = 'COMMAND_SPAWN';
      liveState.activePlayerBuffs = pruneExpiredPlayerBuffs(liveState.activePlayerBuffs, liveState.battleRound, liveState.phase);
      const resPlan = planWaveSpawnCommands(body.zoneSpawns || liveState.zoneSpawns, body.spawnZones || [], {
        battleRound: liveState.battleRound,
        shelfTemplates: body.shelfTemplates || liveState.shelfTemplates || []
      });
      liveState.hordeReserves = [...(liveState.hordeReserves || []), ...(resPlan.queuedReserves || [])];
      resPlan.commands.forEach(c => {
        cmdCounter += 1;
        ttsCommandQueue.push({ id: `lct_cmd_${Date.now()}_${cmdCounter}`, ...c });
      });
      const entry = appendEvent({ type: 'SPAWN_WAVE', summary: resPlan.summary });
      return sendJson(res, 200, { ok: true, ...resPlan, hordeReserves: liveState.hordeReserves, entry, queueLength: ttsCommandQueue.length });
    }

    if (req.method === 'POST' && urlPath === '/autopilot/disembark') {
      const body = await readJsonBody(req);
      const units = liveState.boardTelemetry?.units || [];
      const targetTransport = body.transportUnit ||
        units.find(u =>
          (body.squadKey && u.squadKey === body.squadKey) ||
          (body.transportGuid && u.guid === body.transportGuid)
        ) ||
        (Number.isInteger(body.unitIndex) ? units[body.unitIndex] : null);

      const cmd = buildDisembarkWaveCommand(targetTransport, body);
      if (!cmd) {
        return sendJson(res, 400, { ok: false, error: 'No embarked cargo to disembark' });
      }
      if (targetTransport && units.includes(targetTransport)) {
        targetTransport.embarkedCargo = [];
        targetTransport.embarkedSummary = null;
      }
      cmdCounter += 1;
      ttsCommandQueue.push({ id: `lct_cmd_${Date.now()}_${cmdCounter}`, ...cmd });
      const entry = appendEvent({ type: 'DISEMBARK', summary: cmd.summary });
      return sendJson(res, 200, { ok: true, command: cmd, units, entry, queueLength: ttsCommandQueue.length });
    }

    if (req.method === 'POST' && urlPath === '/autopilot/plan-movement') {
      const body = await readJsonBody(req);
      liveState.phase = 'HORDE_MOVEMENT';
      liveState.activePlayerBuffs = pruneExpiredPlayerBuffs(liveState.activePlayerBuffs, liveState.battleRound, liveState.phase);
      const moveRes = planHordeMovementPhase(liveState.boardTelemetry, liveState, body);
      liveState.lastMovementPlans = moveRes.plans;
      liveState.hordeReserves = [];
      moveRes.commands.forEach(c => {
        cmdCounter += 1;
        ttsCommandQueue.push({ id: `lct_cmd_${Date.now()}_${cmdCounter}`, ...c });
      });
      const ingressDrops = moveRes.ingressDrops || [];
      liveState.lastIngressDrops = ingressDrops;
      const ingressNote = ingressDrops.length > 0 ? ` + ${ingressDrops.length} Deep Strike Ingress drop(s)` : '';
      const entry = appendEvent({
        type: 'HORDE_MOVE',
        summary: `Moved ${moveRes.plans.length} Horde squad(s)${ingressNote} — awaiting Pre-Overwatch LOS check.`
      });
      return sendJson(res, 200, { ok: true, plans: moveRes.plans, ingressDrops, entry, queueLength: ttsCommandQueue.length });
    }

    if (req.method === 'POST' && urlPath === '/autopilot/fallback-ingress') {
      const body = await readJsonBody(req);
      const drops = liveState.lastIngressDrops || [];
      const targetDrop = drops.find(d => body.reserveId && d.reserveId === body.reserveId) || drops[Number(body.dropIndex) || 0];
      const cmd = buildIngressFallbackCommand(targetDrop);
      if (!cmd) return sendJson(res, 400, { ok: false, error: 'No stored Deep Strike ingress drop' });
      for (let i = ttsCommandQueue.length - 1; i >= 0; i--) {
        if (ttsCommandQueue[i].action === 'DEEP_STRIKE_DROP' && ttsCommandQueue[i].reserveId === cmd.reserveId) {
          ttsCommandQueue.splice(i, 1);
        }
      }
      if (targetDrop) {
        targetDrop.status = 'SCREENED_FALLBACK_SPAWN_ZONE';
        targetDrop.targetX = cmd.targetX;
        targetDrop.targetZ = cmd.targetZ;
      }
      cmdCounter += 1;
      ttsCommandQueue.push({ id: `lct_cmd_${Date.now()}_${cmdCounter}`, ...cmd });
      const entry = appendEvent({
        type: 'INGRESS_FALLBACK',
        summary: `Relocated ${cmd.unitLabel} to Spawn Zone ${cmd.zone} (3D terrain/ruin obstructed Deep Strike landing).`
      });
      return sendJson(res, 200, { ok: true, command: cmd, entry, queueLength: ttsCommandQueue.length });
    }

    if (req.method === 'POST' && urlPath === '/autopilot/revert-move') {
      const body = await readJsonBody(req);
      const plans = liveState.lastMovementPlans || [];
      const targetPlan = plans.find(p => p.squadKey === body.squadKey) || plans[Number(body.planIndex) || 0];
      const cmd = buildMoveRevertCommand(targetPlan);
      if (!cmd) return sendJson(res, 400, { ok: false, error: 'No stored origin snapshot' });
      cmdCounter += 1;
      ttsCommandQueue.push({ id: `lct_cmd_${Date.now()}_${cmdCounter}`, ...cmd });
      const entry = appendEvent({ type: 'MOVE_REVERT', summary: `Reverted ${cmd.unitName} to pre-move origin (No LOS).` });
      return sendJson(res, 200, { ok: true, command: cmd, entry });
    }

    if (req.method === 'POST' && urlPath === '/autopilot/select-shooting') {
      const body = await readJsonBody(req);
      liveState.phase = 'HORDE_SHOOTING';
      liveState.activePlayerBuffs = pruneExpiredPlayerBuffs(liveState.activePlayerBuffs, liveState.battleRound, liveState.phase);
      const mergedBlocked = Array.from(new Set([
        ...(liveState.losBlockedPairs || []),
        ...(body.losBlockedPairs || [])
      ]));
      const assignments = selectHordeShootingTargets(liveState.boardTelemetry, liveState, {
        ...body,
        losBlockedPairs: mergedBlocked
      });
      liveState.lastShootingAssignments = assignments;
      return sendJson(res, 200, { ok: true, assignments, losBlockedPairs: mergedBlocked });
    }

    if (req.method === 'POST' && urlPath === '/autopilot/declare-charges') {
      const body = await readJsonBody(req);
      liveState.phase = 'HORDE_CHARGE';
      liveState.activePlayerBuffs = pruneExpiredPlayerBuffs(liveState.activePlayerBuffs, liveState.battleRound, liveState.phase);
      const chg = planHordeCharges(liveState.boardTelemetry, liveState, body);
      const win = detectPlayerReactionWindow('HORDE_CHARGE_DECLARED', liveState);
      liveState.pendingReactionWindow = (chg.declarations.length > 0 && win.open) ? win : null;

      if (chg.declarations[0]) {
        const first = chg.declarations[0];
        if (first.moveCommand) {
          cmdCounter += 1;
          ttsCommandQueue.push({ id: `lct_cmd_${Date.now()}_${cmdCounter}`, ...first.moveCommand });
        } else if (first.lctCommand) {
          liveState.pendingChargeDecl = first;
          cmdCounter += 1;
          ttsCommandQueue.push({ id: `lct_cmd_${Date.now()}_${cmdCounter}`, ...first.lctCommand });
        }
      }
      const entry = appendEvent({
        type: 'HORDE_CHARGE',
        summary: `Declared ${chg.declarations.length} Horde charge(s).`
      });
      return sendJson(res, 200, { ok: true, declarations: chg.declarations, pendingReactionWindow: liveState.pendingReactionWindow, entry });
    }

    if (req.method === 'POST' && urlPath === '/autopilot/consolidate') {
      liveState.phase = 'HORDE_FIGHT';
      liveState.activePlayerBuffs = pruneExpiredPlayerBuffs(liveState.activePlayerBuffs, liveState.battleRound, liveState.phase);
      const units = liveState.boardTelemetry?.units || [];
      const objs = liveState.boardTelemetry?.objectives || [];
      const horde = units.filter(u => u.side !== 'PLAYER');
      const players = units.filter(u => u.side === 'PLAYER');
      const moves = horde.map(h => ({ unitName: h.name, ...planConsolidationMove(h, players, objs) }));
      moves.forEach(m => {
        if (m.moveCommand) {
          cmdCounter += 1;
          ttsCommandQueue.push({ id: `lct_cmd_${Date.now()}_${cmdCounter}`, ...m.moveCommand });
        }
      });
      const entry = appendEvent({ type: 'CONSOLIDATE', summary: `Resolved 3" Consolidation for ${moves.length} Horde unit(s).` });
      return sendJson(res, 200, { ok: true, moves, entry });
    }

    if (req.method === 'POST' && urlPath === '/overwatch/los-check') {
      const body = await readJsonBody(req);
      const prompt = buildLosVerificationPrompt(liveState, body.transcript || '');
      const apiKey = options.geminiApiKey ?? env.GEMINI_API_KEY ?? '';
      const model = options.geminiModel || env.GEMINI_VISION_MODEL || 'gemini-2.5-flash';
      const fetchImpl = options.visionFetchFn || (apiKey && typeof fetch === 'function' ? fetch : null);

      let verdict = {
        losBlocked: false,
        revertSquadKey: null,
        blockedPairs: [],
        spokenReply: 'Offline LOS mode: configure TACTICA_THREAD_URL (or GEMINI_API_KEY) in .env for automatic TTS screen vision, or click Revert Move manually.'
      };
      let mode = 'offline';

      if (typeof activeThreadQueryFn === 'function') {
        const rawText = await activeThreadQueryFn(prompt, body.imageBase64 || '');
        if (rawText) {
          verdict = parseOverwatchVerdict(rawText);
          mode = 'gemini-thread';
        }
      } else if (fetchImpl) {
        const parts = [{ text: prompt }];
        if (body.imageBase64) {
          const cleanB64 = String(body.imageBase64).replace(/^data:image\/\w+;base64,/, '');
          parts.push({ inline_data: { mime_type: body.mimeType || 'image/jpeg', data: cleanB64 } });
        }
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const gRes = await fetchImpl(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts }] })
        });
        if (gRes && gRes.ok) {
          const gJson = await gRes.json();
          const rawText = gJson?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          verdict = parseOverwatchVerdict(rawText);
          mode = 'gemini-vision';
        }
      }

      if (verdict.blockedPairs.length > 0) {
        liveState.losBlockedPairs = Array.from(new Set([...(liveState.losBlockedPairs || []), ...verdict.blockedPairs]));
      }

      let revertedCommand = null;
      if (verdict.losBlocked && verdict.revertSquadKey && body.autoRevert !== false) {
        const targetPlan = (liveState.lastMovementPlans || []).find(p => p.squadKey === verdict.revertSquadKey);
        const revCmd = buildMoveRevertCommand(targetPlan);
        if (revCmd) {
          cmdCounter += 1;
          revertedCommand = { id: `lct_cmd_${Date.now()}_${cmdCounter}`, ...revCmd };
          ttsCommandQueue.push(revertedCommand);
        }
      }

      const entry = appendEvent({
        type: 'OVERWATCH_LOS',
        summary: `${verdict.spokenReply}${revertedCommand ? ` [Auto-Reverted ${verdict.revertSquadKey}]` : ''}`
      });
      return sendJson(res, 200, { ok: true, mode, verdict, revertedCommand, entry });
    }

    if (req.method === 'POST' && urlPath === '/chronicle/compile') {
      const body = await readJsonBody(req);
      const entries = readChronicleFromDisk();
      const report = compileTacticaPostMatchReport(liveState, entries, body);
      return sendJson(res, 200, { ok: true, report, entryCount: entries.length });
    }

    return sendJson(res, 404, { ok: false, error: 'Not found' });
  });

  return {
    server,
    tacticaThreadUrl,
    setThreadQueryFn(fn) {
      activeThreadQueryFn = fn;
    },
    start(port = DEFAULT_PORT) {
      return new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(port, '127.0.0.1', () => resolve(server.address().port));
      });
    },
    stop() {
      return new Promise((resolve) => server.close(() => resolve()));
    }
  };
}

if (require.main === module) {
  const daemon = createTacticaDaemon();
  let activeSession = null;
  const profileDir = resolveTacticaProfileDir();

  const shutdownDaemon = async () => {
    if (activeSession) {
      const s = activeSession;
      activeSession = null;
      await s.close().catch(() => {});
    }
    await daemon.stop().catch(() => {});
    process.exit(0);
  };
  process.once('SIGINT', shutdownDaemon);
  process.once('SIGTERM', shutdownDaemon);
  process.once('SIGBREAK', shutdownDaemon);

  daemon.start(DEFAULT_PORT).then(async (port) => {
    console.log('----------------------------------------------------------------');
    console.log('[SYSTEM DIAGNOSTICS // LCT TACTICA DAEMON & SCRIBE]');
    console.log(` -> HTTP DAEMON       : http://127.0.0.1:${port}`);
    console.log(` -> BROWSER PROFILE   : ${path.basename(profileDir)} (ISOLATED from Vox chrome_vox_profile)`);
    if (isUsableGeminiThreadUrl(daemon.tacticaThreadUrl)) {
      console.log(` -> TACTICA_THREAD_URL: ${daemon.tacticaThreadUrl} (ISOLATED — ALPHA/BETA/GAMMA IGNORED)`);
    } else if (daemon.tacticaThreadUrl) {
      console.log(` -> TACTICA_THREAD_URL: ${daemon.tacticaThreadUrl} [PLACEHOLDER — replace YOUR_NEW_THREAD_ID_HERE in .env]`);
    } else {
      console.log(' -> TACTICA_THREAD_URL: NOT SET in .env (running in local LCT Scribe mode)');
    }
    console.log('----------------------------------------------------------------');

    if (isUsableGeminiThreadUrl(daemon.tacticaThreadUrl)) {
      activeSession = await launchTacticaBrowserSession(daemon.tacticaThreadUrl, {
        onClose: () => {
          activeSession = null;
          daemon.setThreadQueryFn(null);
          console.log('[TACTICA BROWSER] Chrome window closed — LCT HTTP Scribe remains online.');
        }
      }).catch((err) => {
        console.warn(`[TACTICA THREAD WARNING] Could not open chrome_tactica_profile window: ${err.message}`);
        return null;
      });
      if (activeSession) {
        daemon.setThreadQueryFn(activeSession.queryThread);
        console.log('++ TACTICA GEMINI REFEREE THREAD LOCKED & READY (Sign into Google once if prompted) ++');
      }
    }
    console.log(`+++ LCT TACTICA DAEMON & SCRIBE ONLINE [http://127.0.0.1:${port}] +++`);
  }).catch((err) => {
    console.error(`[TACTICA DAEMON PORT ERROR] Could not bind 127.0.0.1:${DEFAULT_PORT} (${err.code || err.message}). Is another tactica_daemon window already open?`);
    process.exitCode = 1;
  });
}

module.exports = {
  createTacticaDaemon,
  resolveTacticaThreadUrl,
  resolveTacticaProfileDir,
  isUsableGeminiThreadUrl,
  launchTacticaBrowserSession
};

````
