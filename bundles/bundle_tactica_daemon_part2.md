# 📦 Fires of Armageddon // Bundle: LCT Tactica Daemon & Scribe Server (Part 2: LCT Mat, Autopilot & Overwatch Routes)

HTTP endpoints for LCT dice-mat sequences, TTS board telemetry, Horde Autopilot wave/ingress/revert/toggle-los commands, and lazy-reconnecting 3D Vision LOS verification (`tactica_daemon.js` lines 611 to end).

## 📑 Table of Contents
- [tactica_daemon.js (Part 2: LCT Mat, Autopilot, LOS Toggle & Vision Routes, Lines 611-1500)](#file-tacticadaemonjspart2lctmatautopilotlostogglevisionrouteslines6111500)

---

## File: `tactica_daemon.js (Part 2: LCT Mat, Autopilot, LOS Toggle & Vision Routes, Lines 611-1500)` <a id="file-tacticadaemonjspart2lctmatautopilotlostogglevisionrouteslines6111500"></a>

````javascript
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
      let obstacles = Array.isArray(body.obstacles) ? body.obstacles : (liveState.boardTelemetry?.obstacles || []);
      let autoBlockedLosPairs = Array.isArray(body.autoBlockedLosPairs)
        ? body.autoBlockedLosPairs
        : (liveState.boardTelemetry?.autoBlockedLosPairs || []);

      if (Array.isArray(body.objects)) {
        const normalized = normalizeTtsBoardScan(body, {
          hordeFactionName: liveState.factionName,
          previousUnits: liveState.boardTelemetry?.units || [],
          guidRegistry: liveState.squadGuidRegistry || {}
        });
        units = normalized.units;
        objectives = normalized.objectives;
        obstacles = normalized.obstacles || [];
        autoBlockedLosPairs = normalized.autoBlockedLosPairs || [];
        liveState.squadGuidRegistry = normalized.guidRegistry || {};
        if (Array.isArray(normalized.shelfTemplates) && normalized.shelfTemplates.length > 0) {
          liveState.shelfTemplates = normalized.shelfTemplates;
        }
      } else if (Array.isArray(body.shelfTemplates)) {
        liveState.shelfTemplates = body.shelfTemplates;
      }

      liveState.boardTelemetry = { updatedAt: Date.now(), units, objectives, obstacles, autoBlockedLosPairs };

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
      const preMoveTelemetry = JSON.parse(JSON.stringify(liveState.boardTelemetry || { units: [], objectives: [], obstacles: [], autoBlockedLosPairs: [] }));
      const moveRes = planHordeMovementPhase(liveState.boardTelemetry, liveState, body);
      if (!liveState.phaseOriginSnapshots || typeof liveState.phaseOriginSnapshots !== 'object') {
        liveState.phaseOriginSnapshots = {};
      }
      moveRes.plans.forEach(p => {
        if (p.squadKey && !liveState.phaseOriginSnapshots[p.squadKey]) {
          liveState.phaseOriginSnapshots[p.squadKey] = {
            squadKey: p.squadKey,
            unitName: p.unitName,
            guids: p.guids || [],
            originPos: p.originPos || null,
            originModels: p.originModels || []
          };
        }
        if (Number.isFinite(Number(p.targetX)) && Number.isFinite(Number(p.targetZ)) && Array.isArray(liveState.boardTelemetry?.units)) {
          const unit = liveState.boardTelemetry.units.find(u => (u.squadKey || u.name) === p.squadKey);
          if (unit) {
            const dx = Number(p.targetX) - (Number(unit.pos?.x) || 0);
            const dz = Number(p.targetZ) - (Number(unit.pos?.z) || 0);
            unit.pos = { x: Number(p.targetX), y: Number(unit.pos?.y) || 1.1, z: Number(p.targetZ) };
            if (Array.isArray(unit.models)) {
              unit.models = unit.models.map(m => ({
                ...m,
                pos: {
                  x: Number(((Number(m.pos?.x) || 0) + dx).toFixed(2)),
                  y: Number(m.pos?.y) || 1.1,
                  z: Number(((Number(m.pos?.z) || 0) + dz).toFixed(2))
                }
              }));
            }
            unit.advancedThisTurn = Boolean(p.advanced);
          }
        }
      });

      const sightlines = previewMovementSightlines(preMoveTelemetry, liveState, moveRes.plans, {
        losBlockedPairs: liveState.losBlockedPairs || [],
        losAllowedPairs: liveState.losAllowedPairs || []
      });
      liveState.lastMovementPlans = moveRes.plans;
      liveState.lastMovementSightlines = sightlines;
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
      return sendJson(res, 200, {
        ok: true,
        plans: moveRes.plans,
        sightlines,
        phaseOriginSnapshots: liveState.phaseOriginSnapshots,
        ingressDrops,
        entry,
        queueLength: ttsCommandQueue.length
      });
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
      const plans = Array.isArray(liveState.lastMovementPlans) ? liveState.lastMovementPlans : [];
      const snapshots = liveState.phaseOriginSnapshots || {};
      const targetPlan = body.squadKey
        ? plans.find(p => p.squadKey === body.squadKey)
        : plans[Number(body.planIndex) || 0];
      const resolvedKey = body.squadKey || targetPlan?.squadKey;
      const originSource = (resolvedKey && snapshots[resolvedKey]) || targetPlan;
      const cmd = buildMoveRevertCommand(originSource);
      if (!cmd) return sendJson(res, 400, { ok: false, error: 'No stored origin snapshot' });

      if (targetPlan) {
        targetPlan.status = 'REVERTED';
      }
      restoreUnitOriginInTelemetry(resolvedKey, originSource);

      const sightlines = previewMovementSightlines(liveState.boardTelemetry, liveState, plans, {
        losBlockedPairs: liveState.losBlockedPairs || [],
        losAllowedPairs: liveState.losAllowedPairs || []
      });
      const assignments = selectHordeShootingTargets(liveState.boardTelemetry, liveState, {
        losBlockedPairs: liveState.losBlockedPairs || [],
        losAllowedPairs: liveState.losAllowedPairs || []
      });
      liveState.lastMovementSightlines = sightlines;
      liveState.lastShootingAssignments = assignments;

      cmdCounter += 1;
      ttsCommandQueue.push({ id: `lct_cmd_${Date.now()}_${cmdCounter}`, ...cmd });
      const entry = appendEvent({ type: 'MOVE_REVERT', summary: `Reverted ${cmd.unitName} to pre-move origin.` });
      return sendJson(res, 200, {
        ok: true,
        command: cmd,
        plans,
        sightlines,
        assignments,
        entry
      });
    }

    if (req.method === 'POST' && urlPath === '/autopilot/toggle-los') {
      const body = await readJsonBody(req);
      const pairKey = String(body.pairKey || '').trim();
      if (!pairKey) return sendJson(res, 400, { ok: false, error: 'Missing pairKey' });
      const isBlocked = body.blocked !== false;

      const blockedSet = new Set(liveState.losBlockedPairs || []);
      const allowedSet = new Set(liveState.losAllowedPairs || []);
      if (isBlocked) {
        blockedSet.add(pairKey);
        allowedSet.delete(pairKey);
      } else {
        blockedSet.delete(pairKey);
        allowedSet.add(pairKey);
      }
      liveState.losBlockedPairs = Array.from(blockedSet);
      liveState.losAllowedPairs = Array.from(allowedSet);

      const sightlines = previewMovementSightlines(liveState.boardTelemetry, liveState, liveState.lastMovementPlans || [], {
        losBlockedPairs: liveState.losBlockedPairs,
        losAllowedPairs: liveState.losAllowedPairs
      });
      const assignments = selectHordeShootingTargets(liveState.boardTelemetry, liveState, {
        losBlockedPairs: liveState.losBlockedPairs,
        losAllowedPairs: liveState.losAllowedPairs
      });
      liveState.lastMovementSightlines = sightlines;
      liveState.lastShootingAssignments = assignments;
      savePersistedState();

      return sendJson(res, 200, {
        ok: true,
        pairKey,
        blocked: isBlocked,
        losBlockedPairs: liveState.losBlockedPairs,
        losAllowedPairs: liveState.losAllowedPairs,
        sightlines,
        assignments
      });
    }

    if (req.method === 'POST' && urlPath === '/autopilot/toggle-cover') {
      const body = await readJsonBody(req);
      const pairKey = String(body.pairKey || '').trim();
      if (!pairKey) return sendJson(res, 400, { ok: false, error: 'Missing pairKey' });
      const hasCover = Boolean(body.hasCover);

      const grantedSet = new Set(liveState.coverGrantedPairs || []);
      const strippedSet = new Set(liveState.coverStrippedPairs || []);
      if (hasCover) {
        grantedSet.add(pairKey);
        strippedSet.delete(pairKey);
      } else {
        grantedSet.delete(pairKey);
        strippedSet.add(pairKey);
      }
      liveState.coverGrantedPairs = Array.from(grantedSet);
      liveState.coverStrippedPairs = Array.from(strippedSet);

      const sightlines = previewMovementSightlines(liveState.boardTelemetry, liveState, liveState.lastMovementPlans || [], {
        losBlockedPairs: liveState.losBlockedPairs || [],
        losAllowedPairs: liveState.losAllowedPairs || [],
        coverGrantedPairs: liveState.coverGrantedPairs,
        coverStrippedPairs: liveState.coverStrippedPairs
      });
      const assignments = selectHordeShootingTargets(liveState.boardTelemetry, liveState, {
        losBlockedPairs: liveState.losBlockedPairs || [],
        losAllowedPairs: liveState.losAllowedPairs || [],
        coverGrantedPairs: liveState.coverGrantedPairs,
        coverStrippedPairs: liveState.coverStrippedPairs
      });
      liveState.lastMovementSightlines = sightlines;
      liveState.lastShootingAssignments = assignments;
      savePersistedState();

      return sendJson(res, 200, {
        ok: true,
        pairKey,
        hasCover,
        coverGrantedPairs: liveState.coverGrantedPairs,
        coverStrippedPairs: liveState.coverStrippedPairs,
        sightlines,
        assignments
      });
    }

    if (req.method === 'POST' && urlPath === '/autopilot/select-shooting') {
      const body = await readJsonBody(req);
      liveState.phase = 'HORDE_SHOOTING';
      liveState.activePlayerBuffs = pruneExpiredPlayerBuffs(liveState.activePlayerBuffs, liveState.battleRound, liveState.phase);
      const mergedBlocked = Array.from(new Set([
        ...(liveState.losBlockedPairs || []),
        ...(body.losBlockedPairs || [])
      ]));
      const mergedAllowed = Array.from(new Set([
        ...(liveState.losAllowedPairs || []),
        ...(body.losAllowedPairs || [])
      ]));
      const assignments = selectHordeShootingTargets(liveState.boardTelemetry, liveState, {
        ...body,
        losBlockedPairs: mergedBlocked,
        losAllowedPairs: mergedAllowed
      });
      liveState.lastShootingAssignments = assignments;
      return sendJson(res, 200, { ok: true, assignments, losBlockedPairs: mergedBlocked, losAllowedPairs: mergedAllowed });
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
      const prompt = buildLosVerificationPrompt(liveState, body.transcript || body.query || '');
      const apiKey = options.geminiApiKey ?? env.GEMINI_API_KEY ?? '';
      const model = options.geminiModel || env.GEMINI_VISION_MODEL || 'gemini-2.5-flash';
      const fetchImpl = options.visionFetchFn || (apiKey && typeof fetch === 'function' ? fetch : null);

      let verdict = {
        losBlocked: false,
        revertSquadKey: null,
        blockedPairs: [],
        spokenReply: 'Local Auspex LOS mode: using 3D TTS wall raycasts & 2D terrain footprints (configure TACTICA_THREAD_URL or GEMINI_API_KEY in .env for live screen vision).'
      };
      let mode = 'local-auspex';

      if (typeof activeThreadQueryFn !== 'function' && typeof options.ensureThreadSession === 'function') {
        const ensured = await options.ensureThreadSession();
        if (typeof ensured === 'function') {
          activeThreadQueryFn = ensured;
        } else if (ensured && typeof ensured.queryThread === 'function') {
          activeThreadQueryFn = ensured.queryThread;
        }
      }

      const frameData = body.imageBase64 || body.imageDataUrl || '';
      if (typeof activeThreadQueryFn === 'function') {
        const rawText = await activeThreadQueryFn(prompt, frameData);
        if (rawText) {
          verdict = parseOverwatchVerdict(rawText);
          mode = 'gemini-thread';
        }
      } else if (fetchImpl) {
        const parts = [{ text: prompt }];
        if (frameData) {
          const cleanB64 = String(frameData).replace(/^data:image\/\w+;base64,/, '');
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
        const originSource = (liveState.phaseOriginSnapshots || {})[verdict.revertSquadKey] || targetPlan;
        const revCmd = buildMoveRevertCommand(originSource);
        if (revCmd) {
          if (targetPlan) targetPlan.status = 'REVERTED';
          restoreUnitOriginInTelemetry(verdict.revertSquadKey, originSource);
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
    } catch (err) {
      if (!res.headersSent) {
        return sendJson(res, 500, { ok: false, error: err?.message || 'Internal daemon error' });
      }
      res.end();
    }
  });

  return {
    server,
    tacticaThreadUrl,
    setThreadQueryFn(fn) {
      activeThreadQueryFn = fn;
    },
    start(port = (options.port !== undefined ? options.port : DEFAULT_PORT)) {
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
  let activeSession = null;
  let launchingPromise = null;
  let daemon = null;
  const profileDir = resolveTacticaProfileDir();
  const configuredUrl = resolveTacticaThreadUrl();

  const ensureThreadSession = async () => {
    if (activeSession) return activeSession;
    if (!isUsableGeminiThreadUrl(configuredUrl)) return null;
    if (launchingPromise) return launchingPromise;

    launchingPromise = launchTacticaBrowserSession(configuredUrl, {
      onClose: () => {
        activeSession = null;
        if (daemon) daemon.setThreadQueryFn(null);
        console.log('[TACTICA BROWSER] Chrome window closed — LCT HTTP Scribe remains online (will auto-relaunch on next LOS check).');
      }
    }).then((sess) => {
      activeSession = sess;
      if (sess && daemon) {
        daemon.setThreadQueryFn(sess.queryThread);
        console.log('++ TACTICA GEMINI REFEREE THREAD LOCKED & READY (Sign into Google once if prompted) ++');
      }
      return sess;
    }).catch((err) => {
      console.warn(`[TACTICA THREAD WARNING] Could not open chrome_tactica_profile window: ${err.message}`);
      return null;
    }).finally(() => {
      launchingPromise = null;
    });
    return launchingPromise;
  };

  daemon = createTacticaDaemon({ ensureThreadSession });

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
      await ensureThreadSession();
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
