# 📦 Fires of Armageddon // Bundle: In-Match LCT Tactical Console Controller (Part 2: Horde Autopilot &Ingress)

Horde Autopilot wave spawning, Deep Strike ingress & ruin-fallback actions, LOS revert, LCT dice-mat attack triggers, and SPA lifecycle (`js/tactica.js` lines 521 to end).

## 📑 Table of Contents
- [js/tactica.js (Part 2: Horde Autopilot, Ingress & SPA Lifecycle, Lines 521-1100)](#file-jstacticajspart2hordeautopilotingressspalifecyclelines5211100)

---

## File: `js/tactica.js (Part 2: Horde Autopilot, Ingress & SPA Lifecycle, Lines 521-1100)` <a id="file-jstacticajspart2hordeautopilotingressspalifecyclelines5211100"></a>

````javascript
    try {
      await daemonRequest('/tts/enqueue', 'POST', { action: 'SCAN_BOARD' });
      daemonOnline = true;
    } catch (e) {
      daemonOnline = false;
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
    return plan;
  }

  function renderAutopilotMovementAndIngress(plans = [], ingressDrops = []) {
    if (plans.length === 0 && ingressDrops.length === 0) {
      setAutopilotHtml('<span style="color:var(--muted);">No eligible Horde movement vectors found on board.</span>');
      return;
    }
    const moveRows = plans.map((p, idx) => {
      if (p.status === 'ENGAGED_HOLD') {
        return `<div style="padding:4px 0;"><strong>${p.unitName}</strong> — Engaged (&le;2.0"): Holding melee contact.</div>`;
      }
      if (p.status === 'INGRESSED_HOLD') {
        return `<div style="padding:4px 0;">🪂 <strong>${p.unitName}</strong> — Arrived from Deep Strike this turn: Holding position.</div>`;
      }
      const advTag = p.advanced ? ' <span class="badge red">ADVANCED</span>' : '';
      return `
        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; padding:4px 0; border-bottom:1px solid rgba(255,255,255,0.06);">
          <div>🏃 <strong>${p.unitName}</strong> &rarr; ${p.goalName} (${p.moveBudgetInches}" to X:${p.targetX}, Z:${p.targetZ})${advTag}</div>
          <button type="button" class="btn-ghost btn-sm" onclick="revertAutopilotSquadMove(${idx})">↩️ Revert Move (No LOS)</button>
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
   * 2. Computes deterministic Horde Movement, Deep Strike Ingress drops & Advance vectors with one-click Pre-Overwatch LOS Revert & Ruin-Fallback buttons.
   */
  async function triggerAutopilotMovement() {
    setHordeTurnStep(2);
    clientState.phase = 'HORDE_MOVEMENT';
    pruneClientBuffs();
    let plans = [];
    let ingressDrops = [];
    try {
      const res = await daemonRequest('/autopilot/plan-movement', 'POST', {});
      daemonOnline = true;
      plans = res.plans || [];
      ingressDrops = res.ingressDrops || [];
      clientState.hordeReserves = [];
      if (res.entry) localChronicle.push(res.entry);
    } catch (e) {
      const localRes = planHordeMovementPhase(clientState.boardTelemetry, clientState, {
        hordeReserves: clientState.hordeReserves || []
      });
      plans = localRes.plans || [];
      ingressDrops = localRes.ingressDrops || [];
      clientState.hordeReserves = [];
      const ingressNote = ingressDrops.length > 0 ? ` + ${ingressDrops.length} Deep Strike Ingress drop(s)` : '';
      localChronicle.push(formatChronicleEntry({
        type: 'HORDE_MOVE',
        summary: `Moved ${plans.length} Horde squad(s)${ingressNote} — awaiting Pre-Overwatch LOS check.`
      }, clientState));
    }
    clientState.lastMovementPlans = plans;
    clientState.lastIngressDrops = ingressDrops;
    renderAutopilotMovementAndIngress(plans, ingressDrops);
    renderTacticaConsole();
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
    renderAutopilotMovementAndIngress(clientState.lastMovementPlans || [], drops);
    renderTacticaConsole();
    return cmd;
  }

  /**
   * Reverts a planned Horde squad move back to its exact `(x, y, z)` origin before locking Movement for Overwatch.
   */
  async function revertAutopilotSquadMove(idx) {
    const plans = clientState.lastMovementPlans || [];
    const targetPlan = plans[idx];
    if (!targetPlan) return null;
    try {
      const res = await daemonRequest('/autopilot/revert-move', 'POST', { squadKey: targetPlan.squadKey, planIndex: idx });
      daemonOnline = true;
      if (res.entry) localChronicle.push(res.entry);
    } catch (e) {
      buildMoveRevertCommand(targetPlan);
      localChronicle.push(formatChronicleEntry({
        type: 'MOVE_REVERT',
        summary: `Reverted ${targetPlan.unitName} to pre-move origin (No LOS).`
      }, clientState));
    }
    setAutopilotHtml(`↩️ Reverted <strong>${targetPlan.unitName}</strong> to pre-move origin (No LOS).`);
    renderTacticaConsole();
    return targetPlan;
  }

  /**
   * 3. Computes Mode 3 Keyword-Driven Shooting Target Priority (`[ANTI-X]`, `[PRECISION]`, `[MELTA]`) & 11th Ed Hidden caps.
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
      assignments = selectHordeShootingTargets(clientState.boardTelemetry, clientState);
    }
    clientState.lastShootingAssignments = assignments;

    if (assignments.length === 0) {
      setAutopilotHtml('<span style="color:var(--muted);">No visible Player targets within Horde ranged weapon envelopes.</span>');
    } else {
      setAutopilotHtml(assignments.map((a, idx) => `
        <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; padding:4px 0; border-bottom:1px solid rgba(255,255,255,0.06);">
          <div>🎯 <strong>${a.attackerName}</strong> [${a.weapon.name}] &rarr; <strong>${a.targetName}</strong> (${a.distanceInches}")</div>
          <button type="button" class="btn-red btn-sm" onclick="fireAutopilotWeaponOnMat(${idx})">🎲 Roll Attack on LCT Mat</button>
        </div>
      `).join(''));
    }
    renderTacticaConsole();
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
      if (res.entry) localChronicle.push(res.entry);
    } catch (e) {
      const seq = createHordeAttackRollSequence(payload, clientState);
      clientState.pendingDiceSequence = seq.stage === 'COMPLETE' ? null : seq;
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
    syncFromSpawnerStorage().then(() => refreshDaemonState());
  }

  if (typeof window !== 'undefined') {
    Object.assign(window, {
      getTacticaClientState: () => clientState,
      getTacticaChronicle: () => localChronicle,
      switchTacticaMode,
      setHordeTurnStep,
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
        if (typeof document !== 'undefined' && document.getElementById('tacticaChronicleBox')) initTacticaPage();
      };
      window.addEventListener('DOMContentLoaded', window._foaTacticaInit);
      window.addEventListener('vox:page-swapped', window._foaTacticaSwapped);
    }
  }

  return {
    getTacticaClientState: () => clientState,
    getTacticaChronicle: () => localChronicle,
    switchTacticaMode,
    setHordeTurnStep,
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
    triggerAutopilotShooting,
    fireAutopilotWeaponOnMat,
    triggerAutopilotCharges,
    triggerAutopilotConsolidate,
    initTacticaPage
  };
});

````
