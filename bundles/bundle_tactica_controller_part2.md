# 📦 Fires of Armageddon // Bundle: In-Match LCT Tactical Console Controller (Part 2: Horde Autopilot, Sightlines & Undo)

Horde Autopilot wave spawning, Step 2 Projected Sightlines, persistent Undo Move, Step 3 LOS Re-Pick, LCT dice-mat attack triggers, and SPA lifecycle (`js/tactica.js` lines 681 to end).

## 📑 Table of Contents
- [js/tactica.js (Part 2: Horde Autopilot, Sightlines, Undo & SPA Lifecycle, Lines 681-1500)](#file-jstacticajspart2hordeautopilotsightlinesundospalifecyclelines6811500)

---

## File: `js/tactica.js (Part 2: Horde Autopilot, Sightlines, Undo & SPA Lifecycle, Lines 681-1500)` <a id="file-jstacticajspart2hordeautopilotsightlinesundospalifecyclelines6811500"></a>

````javascript
    }
    renderTacticaConsole();
  }

  /**
   * Populates the Horde Auto-Defender form inputs directly from a scanned Yellowscribe squad on the LCT table.
   */
  function selectTelemetryUnitForDefense(idx) {
    const units = clientState.boardTelemetry?.units || [];
    const u = units[idx];
    if (!u || typeof document === 'undefined') return null;

    const setVal = (id, v) => {
      const el = document.getElementById(id);
      if (el) el.value = String(v);
    };
    setVal('defUnitName', u.name || 'Horde Unit');
    setVal('defSaveInput', u.save || 4);
    setVal('defInvulnInput', u.invuln || 0);
    setVal('defWpmInput', u.woundsPerModel || 1);
    setVal('defKeywordsInput', Array.isArray(u.keywords) && u.keywords.length > 0 ? u.keywords.join(', ') : 'INFANTRY');
    setVal('defModelsInput', u.modelCount || 1);
    const spCheck = document.getElementById('defInSpawnCheck');
    if (spCheck) spCheck.checked = Boolean(u.inSpawnZone);
    renderTacticaConsole();
    return u;
  }

  /**
   * Flips a scanned squad's allegiance (`PLAYER` <-> `HORDE`) in both browser telemetry state and TTS tags
   * via `POST /tts/set-side`, falling back cleanly to local state updates when offline.
   *
   * @param {number} idx - Squad index inside `clientState.boardTelemetry.units`.
   * @returns {Promise<object|null>} Updated squad entry or `null` when out of bounds.
   */
  async function toggleTelemetryUnitSide(idx) {
    const units = clientState.boardTelemetry?.units || [];
    const u = units[idx];
    if (!u) return null;
    const nextSide = u.side === 'PLAYER' ? 'HORDE' : 'PLAYER';
    const payload = {
      squadKey: u.squadKey,
      guids: Array.isArray(u.guids) ? u.guids : (u.guid ? [u.guid] : []),
      side: nextSide
    };
    try {
      const res = await daemonRequest('/tts/set-side', 'POST', payload);
      daemonOnline = true;
      if (Array.isArray(res.units) && clientState.boardTelemetry) {
        clientState.boardTelemetry.units = res.units;
      } else {
        u.side = nextSide;
      }
    } catch (e) {
      daemonOnline = false;
      u.side = nextSide;
    }
    renderTacticaConsole();
    return (clientState.boardTelemetry?.units || [])[idx] || u;
  }

  /**
   * Forwards user intent to disembark all passenger units (`[10 Kasrkin]` or `[5 + Leader]`)
   * wholly within `3"` of a Transport miniature via `POST /autopilot/disembark` with offline fallback.
   *
   * @param {number} idx - Squad index inside `clientState.boardTelemetry.units`.
   * @returns {Promise<object|null>} Disembark command descriptor or `null` when invalid.
   */
  async function disembarkTelemetryTransport(idx) {
    const units = clientState.boardTelemetry?.units || [];
    const u = units[idx];
    if (!u || !Array.isArray(u.embarkedCargo) || u.embarkedCargo.length === 0) return null;

    let cmd = null;
    try {
      const res = await daemonRequest('/autopilot/disembark', 'POST', {
        squadKey: u.squadKey,
        transportGuid: u.guid,
        unitIndex: idx
      });
      daemonOnline = true;
      cmd = res.command;
      if (Array.isArray(res.units) && clientState.boardTelemetry) {
        clientState.boardTelemetry.units = res.units;
      } else {
        u.embarkedCargo = [];
        u.embarkedSummary = null;
      }
      if (res.entry) localChronicle.push(res.entry);
    } catch (e) {
      daemonOnline = false;
      cmd = typeof buildDisembarkWaveCommand === 'function' ? buildDisembarkWaveCommand(u) : null;
      if (!cmd) return null;
      u.embarkedCargo = [];
      u.embarkedSummary = null;
      localChronicle.push(formatChronicleEntry({ type: 'DISEMBARK', summary: cmd.summary }, clientState));
    }

    if (cmd) {
      setAutopilotHtml(`<strong>🚌 Transport Disembark:</strong> ${cmd.summary}`);
    }
    renderTacticaConsole();
    return cmd;
  }

  function setAutopilotHtml(html) {
    if (typeof document === 'undefined') return;
    const box = document.getElementById('tacticaAutopilotBox');
    if (box) box.innerHTML = html;
  }

  /**
   * 1. Clones off-board `HORDE_TEMPLATE` miniatures into active Mode 1 Spawn Zones (holding R2–R4 Deep Strike & Misery #13 waves in Reserves).
   */
  async function triggerAutopilotSpawnWaves() {
    setHordeTurnStep(1);
    clientState.phase = 'COMMAND_SPAWN';
    pruneClientBuffs();
    let plan;
    try {
      const res = await daemonRequest('/autopilot/spawn-waves', 'POST', {
        zoneSpawns: clientState.zoneSpawns,
        shelfTemplates: clientState.shelfTemplates
      });
      daemonOnline = true;
      plan = res;
      if (Array.isArray(res.hordeReserves)) {
        clientState.hordeReserves = res.hordeReserves;
      } else if (Array.isArray(res.queuedReserves)) {
        clientState.hordeReserves = [...(clientState.hordeReserves || []), ...res.queuedReserves];
      }
      if (res.entry) localChronicle.push(res.entry);
    } catch (e) {
      plan = planWaveSpawnCommands(clientState.zoneSpawns, [], {
        battleRound: clientState.battleRound,
        shelfTemplates: clientState.shelfTemplates || []
      });
      clientState.hordeReserves = [...(clientState.hordeReserves || []), ...(plan.queuedReserves || [])];
      localChronicle.push(formatChronicleEntry({ type: 'SPAWN_WAVE', summary: plan.summary }, clientState));
    }
    setAutopilotHtml(`<strong>🧟 Wave Spawn Queue:</strong> ${plan.summary}`);
    renderTacticaConsole();
    announceAuspex(plan.summary);
    return plan;
  }

  function restoreClientUnitOrigin(squadKey, snapshot) {
    if (!snapshot || !Array.isArray(clientState.boardTelemetry?.units)) return;
    const unit = clientState.boardTelemetry.units.find(u => (u.squadKey || u.name) === squadKey);
    if (!unit) return;
    if (snapshot.originPos) {
      unit.pos = {
        x: Number(snapshot.originPos.x) || 0,
        y: Number(snapshot.originPos.y) || 1.1,
        z: Number(snapshot.originPos.z) || 0
      };
    }
    if (Array.isArray(unit.models) && Array.isArray(snapshot.originModels)) {
      const byGuid = new Map(snapshot.originModels.map(m => [m.guid, m]));
      unit.models = unit.models.map((m, idx) => {
        const om = (m.guid && byGuid.get(m.guid)) || snapshot.originModels[idx];
        return om ? { ...m, pos: { x: Number(om.x) || 0, y: Number(om.y) || 1.1, z: Number(om.z) || 0 } } : m;
      });
    }
    unit.advancedThisTurn = false;
  }

  function renderSquadSightlinesHtml(squadSight) {
    if (!squadSight) return '';
    const clearList = Array.isArray(squadSight.clearTargets) ? squadSight.clearTargets : [];
    const blockedList = Array.isArray(squadSight.blockedTargets) ? squadSight.blockedTargets : [];
    if (clearList.length === 0 && blockedList.length === 0) return '';

    const clearChips = clearList.map(t => `
      <span style="display:inline-flex; align-items:center; gap:5px; background:rgba(34,197,94,0.12); border:1px solid rgba(34,197,94,0.35); border-radius:6px; padding:2px 6px; font-size:0.76rem;">
        🎯 ${t.targetName} (${t.distanceInches}") •
        <button type="button" class="btn-ghost btn-sm" style="padding:1px 5px; font-size:0.72rem;" onclick="blockShootingSightline('${escapeJsStr(t.pairKey)}')">🚫 No LOS</button>
      </span>
    `).join('');
    const blockedChips = blockedList.map(t => `
      <span style="display:inline-flex; align-items:center; gap:5px; background:rgba(239,68,68,0.12); border:1px solid rgba(239,68,68,0.35); border-radius:6px; padding:2px 6px; font-size:0.76rem; color:#fca5a5;">
        🧱 Blocked: ${t.targetName} •
        <button type="button" class="btn-ghost btn-sm" style="padding:1px 5px; font-size:0.72rem;" onclick="allowShootingSightline('${escapeJsStr(t.pairKey)}')">👁️ Allow LOS</button>
      </span>
    `).join('');

    return `<div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:5px;">${clearChips}${blockedChips}</div>`;
  }

  function renderAutopilotMovementAndIngress(plans = [], ingressDrops = [], sightlines = clientState.lastMovementSightlines) {
    if (plans.length === 0 && ingressDrops.length === 0) {
      setAutopilotHtml('<span style="color:var(--muted);">No eligible Horde movement vectors found on board.</span>');
      return;
    }
    const bySquad = (sightlines && sightlines.bySquad) ? sightlines.bySquad : {};
    const moveRows = plans.map((p, idx) => {
      const sightRow = renderSquadSightlinesHtml(bySquad[p.squadKey || p.unitName]);
      if (p.status === 'ENGAGED_HOLD') {
        return `<div style="padding:5px 0; border-bottom:1px solid rgba(255,255,255,0.06);"><strong>${p.unitName}</strong> — Engaged (&le;2.0"): Holding melee contact.${sightRow}</div>`;
      }
      if (p.status === 'INGRESSED_HOLD') {
        return `<div style="padding:5px 0; border-bottom:1px solid rgba(255,255,255,0.06);">🪂 <strong>${p.unitName}</strong> — Arrived from Deep Strike this turn: Holding position.${sightRow}</div>`;
      }
      if (p.status === 'REVERTED') {
        return `
          <div style="padding:6px 0; border-bottom:1px solid rgba(255,255,255,0.06);">
            <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
              <div>↩️ <strong>${p.unitName}</strong> — <span class="badge gold">REVERTED</span> Reverted to pre-move origin.</div>
            </div>
            ${sightRow}
          </div>
        `;
      }
      const advTag = p.advanced ? ' <span class="badge red">ADVANCED</span>' : '';
      return `
        <div style="padding:6px 0; border-bottom:1px solid rgba(255,255,255,0.06);">
          <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
            <div>🏃 <strong>${p.unitName}</strong> &rarr; ${p.goalName} (${p.moveBudgetInches}" to X:${p.targetX}, Z:${p.targetZ})${advTag}</div>
            <button type="button" class="btn-ghost btn-sm" onclick="revertAutopilotSquadMove(${idx})">↩️ Undo Move</button>
          </div>
          ${sightRow}
        </div>
      `;
    }).join('');
    const dropRows = ingressDrops.map((d, idx) => {
      if (d.status === 'SCREENED_FALLBACK_SPAWN_ZONE') {
        return `<div style="padding:4px 0; color:#fbbf24;">🪂 <strong>Deep Strike Ingress:</strong> ${d.unitLabel} &rarr; Spawn Zone ${d.fallbackZone || 1} Fallback (X:${d.targetX}, Z:${d.targetZ})</div>`;
      }
      const modeTag = d.mode === 'PINCER_MANEUVER' ? 'Pincer &gt;3"' : 'Deep Strike &gt;8"';
      return `
        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; padding:4px 0; border-bottom:1px solid rgba(255,255,255,0.06);">
          <div style="color:#e879f9;">🪂 <strong>Deep Strike Ingress (${modeTag}):</strong> ${d.unitLabel} @ (X:${d.targetX}, Z:${d.targetZ}) — ${d.closestEnemyDistanceInches}" from enemy</div>
          <button type="button" class="btn-ghost btn-sm" onclick="fallbackAutopilotIngressDrop(${idx})">↩️ Fallback to Spawn Zone</button>
        </div>
      `;
    }).join('');
    const hasBoardIngress = ingressDrops.some(d => d.status === 'DROPPED_ON_BOARD');
    const overwatchNote = hasBoardIngress
      ? '<div style="margin-top:6px; font-size:0.78rem; color:var(--gold);">⚡ <strong>Fire Overwatch (1 CP):</strong> Newly set-up Deep Strike / Pincer units are eligible Overwatch targets right after setup!</div>'
      : '';
    setAutopilotHtml(moveRows + dropRows + overwatchNote);
  }

  /**
   * 2. Computes deterministic Horde Movement, Deep Strike Ingress drops & Projected Shooting Sightlines
   * with persistent `phaseOriginSnapshots` and one-click `↩️ Undo Move` / `🚫 No LOS` / `👁️ Allow LOS` controls.
   */
  async function triggerAutopilotMovement() {
    setHordeTurnStep(2);
    clientState.phase = 'HORDE_MOVEMENT';
    pruneClientBuffs();
    let plans = [];
    let ingressDrops = [];
    let sightlines = null;
    try {
      const res = await daemonRequest('/autopilot/plan-movement', 'POST', {});
      daemonOnline = true;
      plans = res.plans || [];
      ingressDrops = res.ingressDrops || [];
      sightlines = res.sightlines || null;
      if (res.phaseOriginSnapshots) clientState.phaseOriginSnapshots = res.phaseOriginSnapshots;
      clientState.hordeReserves = [];
      if (res.entry) localChronicle.push(res.entry);
    } catch (e) {
      const preMoveTelemetry = JSON.parse(JSON.stringify(clientState.boardTelemetry || { units: [], objectives: [], obstacles: [], autoBlockedLosPairs: [] }));
      const localRes = planHordeMovementPhase(clientState.boardTelemetry, clientState, {
        hordeReserves: clientState.hordeReserves || []
      });
      plans = localRes.plans || [];
      ingressDrops = localRes.ingressDrops || [];
      if (!clientState.phaseOriginSnapshots || typeof clientState.phaseOriginSnapshots !== 'object') {
        clientState.phaseOriginSnapshots = {};
      }
      plans.forEach(p => {
        if (p.squadKey && !clientState.phaseOriginSnapshots[p.squadKey]) {
          clientState.phaseOriginSnapshots[p.squadKey] = {
            squadKey: p.squadKey,
            unitName: p.unitName,
            guids: p.guids || [],
            originPos: p.originPos || null,
            originModels: p.originModels || []
          };
        }
        if (Number.isFinite(Number(p.targetX)) && Number.isFinite(Number(p.targetZ)) && Array.isArray(clientState.boardTelemetry?.units)) {
          const unit = clientState.boardTelemetry.units.find(u => (u.squadKey || u.name) === p.squadKey);
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
      if (typeof previewMovementSightlines === 'function') {
        sightlines = previewMovementSightlines(preMoveTelemetry, clientState, plans, {
          losBlockedPairs: clientState.losBlockedPairs || [],
          losAllowedPairs: clientState.losAllowedPairs || []
        });
      }
      clientState.hordeReserves = [];
      const ingressNote = ingressDrops.length > 0 ? ` + ${ingressDrops.length} Deep Strike Ingress drop(s)` : '';
      localChronicle.push(formatChronicleEntry({
        type: 'HORDE_MOVE',
        summary: `Moved ${plans.length} Horde squad(s)${ingressNote} — awaiting Pre-Overwatch LOS check.`
      }, clientState));
    }
    clientState.lastMovementPlans = plans;
    clientState.lastIngressDrops = ingressDrops;
    clientState.lastMovementSightlines = sightlines;
    renderAutopilotMovementAndIngress(plans, ingressDrops, sightlines);
    renderTacticaConsole();
    announceAuspex('Horde movement complete. Verify sightlines before Overwatch.');
    return plans;
  }

  /**
   * Relocates a Deep Strike / Pincer ingress drop back to its rolled Spawn Zone if an unscanned 3D ruin blocks `(X, Z)`.
   */
  async function fallbackAutopilotIngressDrop(idx) {
    const drops = clientState.lastIngressDrops || [];
    const targetDrop = drops[idx];
    if (!targetDrop) return null;
    let cmd = null;
    try {
      const res = await daemonRequest('/autopilot/fallback-ingress', 'POST', { reserveId: targetDrop.reserveId, dropIndex: idx });
      daemonOnline = true;
      cmd = res.command || null;
      if (res.entry) localChronicle.push(res.entry);
    } catch (e) {
      cmd = typeof buildIngressFallbackCommand === 'function' ? buildIngressFallbackCommand(targetDrop) : null;
      if (!cmd) return null;
      localChronicle.push(formatChronicleEntry({
        type: 'INGRESS_FALLBACK',
        summary: `Relocated ${cmd.unitLabel} to Spawn Zone ${cmd.zone} (3D terrain/ruin obstructed Deep Strike landing).`
      }, clientState));
    }
    if (cmd) {
      targetDrop.status = 'SCREENED_FALLBACK_SPAWN_ZONE';
      targetDrop.targetX = cmd.targetX;
      targetDrop.targetZ = cmd.targetZ;
    }
    renderAutopilotMovementAndIngress(clientState.lastMovementPlans || [], drops, clientState.lastMovementSightlines);
    renderTacticaConsole();
    return cmd;
  }

  async function executeSquadUndoInternal(squadKey, planIndex, fallbackOrigin) {
    const plans = Array.isArray(clientState.lastMovementPlans) ? clientState.lastMovementPlans : [];
    const targetPlan = planIndex !== undefined && plans[planIndex]
      ? plans[planIndex]
      : plans.find(p => p.squadKey === squadKey);
    const originSource = (clientState.phaseOriginSnapshots || {})[squadKey] || fallbackOrigin || targetPlan;
    if (!originSource) return null;

    try {
      const payload = { squadKey: squadKey || originSource.squadKey };
      if (planIndex !== undefined) payload.planIndex = planIndex;
      const res = await daemonRequest('/autopilot/revert-move', 'POST', payload);
      daemonOnline = true;
      if (Array.isArray(res.plans)) clientState.lastMovementPlans = res.plans;
      else if (targetPlan) targetPlan.status = 'REVERTED';
      restoreClientUnitOrigin(squadKey || originSource.squadKey, originSource);
      if (res.sightlines) clientState.lastMovementSightlines = res.sightlines;
      if (Array.isArray(res.assignments)) clientState.lastShootingAssignments = res.assignments;
      if (res.entry) localChronicle.push(res.entry);
    } catch (e) {
      buildMoveRevertCommand(originSource);
      if (targetPlan) targetPlan.status = 'REVERTED';
      restoreClientUnitOrigin(squadKey || originSource.squadKey, originSource);
      if (typeof previewMovementSightlines === 'function') {
        clientState.lastMovementSightlines = previewMovementSightlines(
          clientState.boardTelemetry,
          clientState,
          clientState.lastMovementPlans || [],
          { losBlockedPairs: clientState.losBlockedPairs || [], losAllowedPairs: clientState.losAllowedPairs || [] }
        );
      }
      clientState.lastShootingAssignments = selectHordeShootingTargets(clientState.boardTelemetry, clientState, {
        losBlockedPairs: clientState.losBlockedPairs || [],
        losAllowedPairs: clientState.losAllowedPairs || []
      });
      localChronicle.push(formatChronicleEntry({
        type: 'MOVE_REVERT',
        summary: `Reverted ${originSource.unitName} to pre-move origin.`
      }, clientState));
    }

    if (activeHordeStep === 3) {
      renderAutopilotShootingAssignments(clientState.lastShootingAssignments || []);
    } else if (activeHordeStep === 2 || (clientState.lastMovementPlans || []).length > 0) {
      renderAutopilotMovementAndIngress(
        clientState.lastMovementPlans || [],
        clientState.lastIngressDrops || [],
        clientState.lastMovementSightlines
      );
    }
    renderTacticaConsole();
    return targetPlan || originSource;
  }

  /**
   * Marks a planned Horde squad move `REVERTED` in-place inside `#tacticaAutopilotBox`
   * while keeping all other moved units and buttons visible.
   */
  async function revertAutopilotSquadMove(idx) {
    const plans = clientState.lastMovementPlans || [];
    const targetPlan = plans[idx];
    if (!targetPlan) return null;
    return executeSquadUndoInternal(targetPlan.squadKey, idx, targetPlan);
  }

  /**
   * Undoes a Horde squad's move at any point during Movement, Shooting, or Charge using its stored round origin snapshot.
   */
  async function undoSquadMoveByKey(squadKey) {
    if (!squadKey) return null;
    const plans = clientState.lastMovementPlans || [];
    const planIdx = plans.findIndex(p => p.squadKey === squadKey);
    const snapshot = (clientState.phaseOriginSnapshots || {})[squadKey] || (planIdx >= 0 ? plans[planIdx] : null);
    if (!snapshot) return null;
    return executeSquadUndoInternal(squadKey, planIdx >= 0 ? planIdx : undefined, snapshot);
  }

  /**
   * Toggles manual `losBlockedPairs` / `losAllowedPairs` for the current round and immediately refreshes
   * Step 2 sightlines and Step 3 target assignments (re-picking the next legal visible target).
   */
  async function toggleShootingSightline(pairKey, blocked = true) {
    const cleanPair = String(pairKey || '').trim();
    if (!cleanPair) return null;
    const isBlocked = blocked !== false;

    try {
      const res = await daemonRequest('/autopilot/toggle-los', 'POST', { pairKey: cleanPair, blocked: isBlocked });
      daemonOnline = true;
      clientState.losBlockedPairs = res.losBlockedPairs || [];
      clientState.losAllowedPairs = res.losAllowedPairs || [];
      clientState.lastMovementSightlines = res.sightlines || null;
      clientState.lastShootingAssignments = res.assignments || [];
    } catch (e) {
      const bSet = new Set(clientState.losBlockedPairs || []);
      const aSet = new Set(clientState.losAllowedPairs || []);
      if (isBlocked) {
        bSet.add(cleanPair);
        aSet.delete(cleanPair);
      } else {
        bSet.delete(cleanPair);
        aSet.add(cleanPair);
      }
      clientState.losBlockedPairs = Array.from(bSet);
      clientState.losAllowedPairs = Array.from(aSet);
      if (typeof previewMovementSightlines === 'function') {
        clientState.lastMovementSightlines = previewMovementSightlines(
          clientState.boardTelemetry,
          clientState,
          clientState.lastMovementPlans || [],
          { losBlockedPairs: clientState.losBlockedPairs, losAllowedPairs: clientState.losAllowedPairs }
        );
      }
      clientState.lastShootingAssignments = selectHordeShootingTargets(clientState.boardTelemetry, clientState, {
        losBlockedPairs: clientState.losBlockedPairs,
        losAllowedPairs: clientState.losAllowedPairs
      });
    }

    if (activeHordeStep === 3) {
      renderAutopilotShootingAssignments(clientState.lastShootingAssignments || []);
    } else if (activeHordeStep === 2) {
      renderAutopilotMovementAndIngress(
        clientState.lastMovementPlans || [],
        clientState.lastIngressDrops || [],
        clientState.lastMovementSightlines
      );
    }
    renderTacticaConsole();
    return {
      pairKey: cleanPair,
      blocked: isBlocked,
      assignments: clientState.lastShootingAssignments,
      sightlines: clientState.lastMovementSightlines
    };
  }

  function blockShootingSightline(pairKey) {
    return toggleShootingSightline(pairKey, true);
  }

  function allowShootingSightline(pairKey) {
    return toggleShootingSightline(pairKey, false);
  }

  function renderAutopilotShootingAssignments(assignments = []) {
    if (!Array.isArray(assignments) || assignments.length === 0) {
      setAutopilotHtml('<span style="color:var(--muted);">No visible Player targets within Horde ranged weapon envelopes.</span>');
      return;
    }
    const snapshots = clientState.phaseOriginSnapshots || {};
    setAutopilotHtml(assignments.map((a, idx) => {
      const pairKey = a.pairKey || `${a.attackerKey}->${a.targetKey}`;
      const canUndo = Boolean(snapshots[a.attackerKey]) || (clientState.lastMovementPlans || []).some(p => p.squadKey === a.attackerKey && p.status !== 'REVERTED');
      return `
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; padding:6px 0; border-bottom:1px solid rgba(255,255,255,0.06);">
          <div>🎯 <strong>${a.attackerName}</strong> [${a.weapon.name}] &rarr; <strong>${a.targetName}</strong> (${a.distanceInches}")</div>
          <div style="display:flex; gap:6px; flex-wrap:wrap;">
            <button type="button" class="btn-ghost btn-sm" onclick="blockShootingSightline('${escapeJsStr(pairKey)}')">🚫 No LOS (Re-pick)</button>
            ${canUndo ? `<button type="button" class="btn-ghost btn-sm" onclick="undoSquadMoveByKey('${escapeJsStr(a.attackerKey)}')">↩️ Undo Move</button>` : ''}
            <button type="button" class="btn-red btn-sm" onclick="fireAutopilotWeaponOnMat(${idx})">🎲 Roll Attack on LCT Mat</button>
          </div>
        </div>
      `;
    }).join(''));
  }

  /**
   * 3. Computes Mode 3 Keyword-Driven Shooting Target Priority (`[ANTI-X]`, `[PRECISION]`, `[MELTA]`),
   * obstacle/raycast LOS filtering, and 11th Ed Hidden caps.
   */
  async function triggerAutopilotShooting() {
    setHordeTurnStep(3);
    clientState.phase = 'HORDE_SHOOTING';
    pruneClientBuffs();
    let assignments = [];
    try {
      const res = await daemonRequest('/autopilot/select-shooting', 'POST', {});
      daemonOnline = true;
      assignments = res.assignments || [];
    } catch (e) {
      assignments = selectHordeShootingTargets(clientState.boardTelemetry, clientState, {
        losBlockedPairs: clientState.losBlockedPairs || [],
        losAllowedPairs: clientState.losAllowedPairs || []
      });
    }
    clientState.lastShootingAssignments = assignments;
    renderAutopilotShootingAssignments(assignments);
    renderTacticaConsole();
    announceAuspex(`${assignments.length} shooting targets locked.`);
    return assignments;
  }

  /**
   * Queues a selected Horde weapon assignment onto the LCT TTS Dice Mat (`HITS` -> `WOUNDS`),
   * applying any active Player Stratagem defensive buffs (such as Smokescreen `-1` to Hit) for the target.
   */
  async function fireAutopilotWeaponOnMat(idx) {
    const asgn = (clientState.lastShootingAssignments || [])[idx];
    if (!asgn) return null;
    const units = clientState.boardTelemetry?.units || [];
    const attacker = units.find(u => (u.squadKey || u.name) === asgn.attackerKey) || { name: asgn.attackerName, keywords: [] };
    const unitBuff = typeof resolvePlayerUnitDefensiveBuffs === 'function'
      ? resolvePlayerUnitDefensiveBuffs(asgn.targetName, clientState.activePlayerBuffs, clientState.battleRound, clientState.phase)
      : { hitMod: 0, worsenAp: 0, cover: false, invuln6: false };
    const baseTarget = asgn.target || { toughness: 4 };
    const targetWithBuffs = {
      ...baseTarget,
      hitMod: (Number(baseTarget.hitMod) || 0) + unitBuff.hitMod,
      worsenAp: (Number(baseTarget.worsenAp) || 0) + unitBuff.worsenAp,
      hasCover: Boolean(baseTarget.hasCover || unitBuff.cover),
      invuln: unitBuff.invuln6 ? Math.min(Number(baseTarget.invuln) || 7, 6) : (baseTarget.invuln || null)
    };
    const payload = {
      attackerName: asgn.attackerName,
      targetName: asgn.targetName,
      attacker,
      target: targetWithBuffs,
      weapon: asgn.weapon,
      context: {
        targetHitMod: targetWithBuffs.hitMod,
        targetWorsenAp: targetWithBuffs.worsenAp,
        targetHasCover: targetWithBuffs.hasCover
      }
    };
    try {
      const res = await daemonRequest('/combat/attack-request', 'POST', payload);
      daemonOnline = true;
      clientState.pendingDiceSequence = res.sequence.stage === 'COMPLETE' ? null : res.sequence;
      if (res.entry) {
        localChronicle.push(res.entry);
        lastAnnouncedRollSeq = Math.max(lastAnnouncedRollSeq, Number(res.entry.seq) || 0);
      }
      if (res.sequence.stage === 'COMPLETE') {
        announceAuspex(formatCompletedRollAnnouncement(res.sequence));
      }
    } catch (e) {
      const seq = createHordeAttackRollSequence(payload, clientState);
      clientState.pendingDiceSequence = seq.stage === 'COMPLETE' ? null : seq;
      if (seq.stage === 'COMPLETE') {
        announceAuspex(formatCompletedRollAnnouncement(seq));
      }
    }
    renderTacticaConsole();
    return clientState.pendingDiceSequence;
  }

  /**
   * 4. Declares eligible Horde Charges (`<= 12"`), opens Heroic Intervention, and queues `2D6` on the LCT Mat.
   */
  async function triggerAutopilotCharges() {
    setHordeTurnStep(4);
    clientState.phase = 'HORDE_CHARGE';
    pruneClientBuffs();
    let declarations = [];
    try {
      const res = await daemonRequest('/autopilot/declare-charges', 'POST', {});
      daemonOnline = true;
      declarations = res.declarations || [];
      clientState.pendingReactionWindow = res.pendingReactionWindow;
      if (res.entry) localChronicle.push(res.entry);
    } catch (e) {
      const chg = planHordeCharges(clientState.boardTelemetry, clientState);
      declarations = chg.declarations || [];
      const win = detectPlayerReactionWindow('HORDE_CHARGE_DECLARED', clientState);
      clientState.pendingReactionWindow = (declarations.length > 0 && win.open) ? win : null;
      localChronicle.push(formatChronicleEntry({
        type: 'HORDE_CHARGE',
        summary: `Declared ${declarations.length} Horde charge(s).`
      }, clientState));
    }
    clientState.pendingChargeDecl = declarations[0]?.lctCommand ? declarations[0] : null;
    setAutopilotHtml(declarations.length === 0
      ? '<span style="color:var(--muted);">No Horde units within 12" Charge eligibility.</span>'
      : declarations.map(d => `<div>⚡ <strong>${d.attackerName}</strong> &rarr; <strong>${d.targetName}</strong> (${d.distanceInches}" edge-to-edge • ${d.autoSucceeded ? 'Auto-12" Charge!' : '2D6 Queued on LCT Mat'})</div>`).join(''));
    renderTacticaConsole();
    return declarations;
  }

  /**
   * 5. Executes 11th Edition 3-Tier `3"` Consolidation (`ONGOING` -> `ENGAGING` -> `OBJECTIVE` -> `HOLD`).
   */
  async function triggerAutopilotConsolidate() {
    setHordeTurnStep(4);
    clientState.phase = 'HORDE_FIGHT';
    pruneClientBuffs();
    let moves = [];
    try {
      const res = await daemonRequest('/autopilot/consolidate', 'POST', {});
      daemonOnline = true;
      moves = res.moves || [];
      if (res.entry) localChronicle.push(res.entry);
    } catch (e) {
      const units = clientState.boardTelemetry?.units || [];
      const objs = clientState.boardTelemetry?.objectives || [];
      const horde = units.filter(u => u.side !== 'PLAYER');
      const players = units.filter(u => u.side === 'PLAYER');
      moves = horde.map(h => ({ unitName: h.name, ...planConsolidationMove(h, players, objs) }));
      localChronicle.push(formatChronicleEntry({
        type: 'CONSOLIDATE',
        summary: `Resolved 3" Consolidation for ${moves.length} Horde unit(s).`
      }, clientState));
    }
    setAutopilotHtml(moves.length === 0
      ? '<span style="color:var(--muted);">No Horde units on board to consolidate.</span>'
      : moves.map(m => `<div>⚔️ <strong>${m.unitName}</strong>: [${m.mode}]${m.targetName ? ` &rarr; ${m.targetName}` : ''}</div>`).join(''));
    renderTacticaConsole();
    return moves;
  }

  function initTacticaPage() {
    switchTacticaMode(activeTacticaMode);
    setHordeTurnStep(activeHordeStep);
    startTacticaAutoPoller(2500);
    syncFromSpawnerStorage().then(() => refreshDaemonState());
  }

  if (typeof window !== 'undefined') {
    Object.assign(window, {
      getTacticaClientState: () => clientState,
      getTacticaChronicle: () => localChronicle,
      announceAuspex,
      switchTacticaMode,
      setHordeTurnStep,
      stepHordeTurn,
      startTacticaAutoPoller,
      stopTacticaAutoPoller,
      adjustTacticaCp,
      syncFromSpawnerStorage,
      refreshDaemonState,
      setConsolePhaseAndTrigger,
      resolveConsoleReaction,
      queueConsoleAutoDefender,
      submitSettledMatPips,
      appendConsoleNote,
      compileAndPreviewMatchReport,
      sendCompiledReportToVox,
      requestTtsBoardScan,
      selectTelemetryUnitForDefense,
      toggleTelemetryUnitSide,
      disembarkTelemetryTransport,
      triggerAutopilotSpawnWaves,
      triggerAutopilotMovement,
      fallbackAutopilotIngressDrop,
      revertAutopilotSquadMove,
      undoSquadMoveByKey,
      toggleShootingSightline,
      blockShootingSightline,
      allowShootingSightline,
      triggerAutopilotShooting,
      fireAutopilotWeaponOnMat,
      triggerAutopilotCharges,
      triggerAutopilotConsolidate,
      initTacticaPage
    });
    if (typeof window.addEventListener === 'function') {
      if (window._foaTacticaInit && typeof window.removeEventListener === 'function') {
        window.removeEventListener('DOMContentLoaded', window._foaTacticaInit);
      }
      if (window._foaTacticaSwapped && typeof window.removeEventListener === 'function') {
        window.removeEventListener('vox:page-swapped', window._foaTacticaSwapped);
      }
      window._foaTacticaInit = initTacticaPage;
      window._foaTacticaSwapped = () => {
        if (typeof document !== 'undefined' && document.getElementById('tacticaChronicleBox')) {
          initTacticaPage();
        } else {
          stopTacticaAutoPoller();
        }
      };
      window.addEventListener('DOMContentLoaded', window._foaTacticaInit);
      window.addEventListener('vox:page-swapped', window._foaTacticaSwapped);
    }
  }

  return {
    getTacticaClientState: () => clientState,
    getTacticaChronicle: () => localChronicle,
    announceAuspex,
    switchTacticaMode,
    setHordeTurnStep,
    stepHordeTurn,
    startTacticaAutoPoller,
    stopTacticaAutoPoller,
    adjustTacticaCp,
    refreshDaemonState,
    syncFromSpawnerStorage,
    setConsolePhaseAndTrigger,
    resolveConsoleReaction,
    queueConsoleAutoDefender,
    submitSettledMatPips,
    appendConsoleNote,
    compileAndPreviewMatchReport,
    sendCompiledReportToVox,
    requestTtsBoardScan,
    selectTelemetryUnitForDefense,
    toggleTelemetryUnitSide,
    disembarkTelemetryTransport,
    triggerAutopilotSpawnWaves,
    triggerAutopilotMovement,
    fallbackAutopilotIngressDrop,
    revertAutopilotSquadMove,
    undoSquadMoveByKey,
    toggleShootingSightline,
    blockShootingSightline,
    allowShootingSightline,
    triggerAutopilotShooting,
    fireAutopilotWeaponOnMat,
    triggerAutopilotCharges,
    triggerAutopilotConsolidate,
    initTacticaPage
  };
});

````
