/**
 * @fileoverview Fires of Armageddon // In-Match Tactical Console Imperative Shell
 *
 * Humble View / Imperative Shell bridging Mode 1 Spawner `localStorage`,
 * `tactica_daemon.js` (LCT TTS dice-mat queue), offline settled-pip entry,
 * and optional post-match export to Astropathic Vox (zero local PRNG calls).
 */

(function (root, factory) {
  const exports = factory();
  if (typeof root !== 'undefined') Object.assign(root, exports);
  if (typeof module !== 'undefined' && module.exports) module.exports = exports;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {

  const DAEMON_URL = 'http://127.0.0.1:3030';
  let clientState = (typeof createInitialTacticaState === 'function')
    ? createInitialTacticaState()
    : { roomCode: 'HADES-1', battleRound: 1, phase: 'COMMAND_SPAWN', factionName: 'Chaos Daemons', playerCp: 2, playerSp: 0, activeMiseryIds: [] };
  let localChronicle = [];
  let daemonOnline = false;
  let lastCompiledReport = '';
  let activeTacticaMode = 'horde';
  let activeHordeStep = 1;

  /**
   * Switches between the 3 progressive Tactica panels (`'horde'`, `'player'`, `'export'`).
   *
   * @param {'horde'|'player'|'export'} [mode='horde'] - Active console mode.
   * @returns {string} Active mode key.
   */
  function switchTacticaMode(mode = 'horde') {
    const m = (mode === 'player' || mode === 'export') ? mode : 'horde';
    activeTacticaMode = m;
    if (typeof document === 'undefined') return m;

    const map = [
      { key: 'horde', panelId: 'tacticaModeHorde', btnId: 'btnTacticaModeHorde' },
      { key: 'player', panelId: 'tacticaModePlayer', btnId: 'btnTacticaModePlayer' },
      { key: 'export', panelId: 'tacticaModeExport', btnId: 'btnTacticaModeExport' }
    ];
    for (const item of map) {
      const panel = document.getElementById(item.panelId);
      const btn = document.getElementById(item.btnId);
      const isCurrent = item.key === m;
      if (panel) panel.classList.toggle('hidden', !isCurrent);
      if (btn) btn.classList.toggle('active', isCurrent);
    }
    return m;
  }

  /**
   * Selects the active Horde Turn sub-step (1: Spawn, 2: Move & LOS, 3: Shoot, 4: Charge & Consolidate),
   * revealing `#tacticaLosBar` strictly inside Step 2 and Step 3 where 3D LOS applies.
   *
   * @param {number} [step=1] - Sub-step index (1–4).
   * @returns {number} Clamped active step.
   */
  function setHordeTurnStep(step = 1) {
    const s = Math.max(1, Math.min(4, Number(step) || 1));
    activeHordeStep = s;
    if (typeof document === 'undefined') return s;

    for (let i = 1; i <= 4; i++) {
      const p = document.getElementById(`hordeStepPanel${i}`);
      const b = document.getElementById(`hordeStepBtn${i}`);
      if (p) p.classList.toggle('hidden', i !== s);
      if (b) b.classList.toggle('active', i === s);
    }
    const losBar = document.getElementById('tacticaLosBar');
    if (losBar) losBar.classList.toggle('hidden', s !== 2 && s !== 3);
    return s;
  }

  /**
   * Adjusts live Player Command Points from the Sticky Bar and syncs back to `foa_horde_session_v1`.
   *
   * @param {number} [delta=0] - Signed CP delta (`+1` or `-1`).
   * @returns {Promise<number>} Updated Player CP total.
   */
  async function adjustTacticaCp(delta = 0) {
    const nextCp = Math.max(0, (Number(clientState.playerCp) || 0) + (Number(delta) || 0));
    clientState.playerCp = nextCp;
    if (typeof localStorage !== 'undefined') {
      try {
        const raw = localStorage.getItem('foa_horde_session_v1');
        const sess = raw ? JSON.parse(raw) : {};
        sess.cp = nextCp;
        localStorage.setItem('foa_horde_session_v1', JSON.stringify(sess));
      } catch (e) {}
    }
    try {
      const res = await daemonRequest('/session/sync', 'POST', { playerCp: nextCp });
      daemonOnline = true;
      clientState = res.state;
    } catch (e) {}
    renderTacticaConsole();
    return clientState.playerCp;
  }

  async function daemonRequest(route, method = 'GET', body = null) {
    if (typeof fetch !== 'function') throw new Error('No fetch');
    const opts = { method, headers: {} };
    if (body !== null) {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }
    const res = await fetch(`${DAEMON_URL}${route}`, opts);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  function renderCompletedDefenseSummary(seq) {
    const box = document.getElementById('defResultBox');
    if (!box || !seq || seq.kind !== 'AUTO_DEFENDER') return;
    const prof = seq.defenseProfile;
    const out = seq.outcome;
    const matchedUnit = (clientState.boardTelemetry?.units || []).find(u => u.name === seq.unitName);
    const emergencyCargo = out.unitDestroyed && matchedUnit?.embarkedSummary ? matchedUnit.embarkedSummary : null;
    box.innerHTML = `
      <strong>${seq.unitName}</strong> • Save: <strong>${prof.saveTarget}+</strong> (${out.savesPassed}/${seq.numWounds} saved)
      ${prof.fnp ? ` • <strong>FNP ${prof.fnp}+</strong> (${out.fnpPassed} shrugged)` : ''}
      • Slain: <strong style="color:var(--red);">${out.modelsSlain}</strong> • Remaining: <strong>${out.remainingModels}</strong>
      ${out.onDeathTriggers > 0 ? `<br><span style="color:var(--gold);">⚡ Misery #30: ${out.onDeathTriggers} model(s) Shoot/Fight on Death!</span>` : ''}
      ${out.gscRespawnTriggered ? `<br><span style="color:var(--purple);">♻️ GSC 5+ Respawn Triggered!</span>` : ''}
      ${emergencyCargo ? `<br><span style="color:var(--gold);">🚌 Transport Destroyed! Disembark [${emergencyCargo}] within 3" (roll D6 per model: 1 = 1 MW).</span>` : ''}
    `;
  }

  /**
   * Idempotently projects explicit `clientState` and `localChronicle` onto the DOM.
   */
  function renderTacticaConsole() {
    if (typeof document === 'undefined') return;
    const badge = document.getElementById('tacticaDaemonBadge');
    if (badge) {
      badge.textContent = daemonOnline
        ? '🟢 LCT TACTICA DAEMON ONLINE (127.0.0.1:3030 • Disk Scribe & LCT Mat Ready)'
        : '🟡 OFFLINE TABLETOP MODE (Run `npm run tactica:daemon` for Automatic LCT Mat Polling)';
    }

    const setTxt = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = String(val);
    };
    setTxt('tacticaRoomLabel', clientState.roomCode || 'HADES-1');
    setTxt('tacticaFactionLabel', clientState.factionName || 'Chaos Daemons');
    setTxt('tacticaCpLabel', `${clientState.playerCp ?? 2} CP / ${clientState.playerSp ?? 0} SP`);
    setTxt('tacticaWarlordLabel', clientState.hordeWarlord ? clientState.hordeWarlord.name : 'None Designated');

    const pendingBox = document.getElementById('tacticaPendingRollBox');
    const pendingStrip = document.getElementById('tacticaPendingRollStrip');
    if (pendingBox) {
      const seq = clientState.pendingDiceSequence;
      const chgCmd = (!seq && clientState.pendingChargeDecl) ? clientState.pendingChargeDecl.lctCommand : null;
      const activeCmd = (seq && seq.nextCommand) ? seq.nextCommand : chgCmd;
      const stageLabel = seq ? seq.stage : 'CHARGE_ROLL';
      if (activeCmd) {
        pendingBox.classList.remove('hidden');
        if (pendingStrip) pendingStrip.classList.remove('hidden');
        pendingBox.innerHTML = `
          <div style="font-weight:800; color:var(--gold);">🎲 AWAITING LCT DICE MAT [${stageLabel}]: ${activeCmd.label}</div>
          <div style="font-size:0.8rem; color:var(--muted); margin-top:4px;">
            TTS LCT table rolls <strong>${activeCmd.count}D6</strong> automatically when connected, or open Offline Manual Pip Entry below.
          </div>
        `;
      } else {
        pendingBox.classList.add('hidden');
        if (pendingStrip) pendingStrip.classList.add('hidden');
        pendingBox.innerHTML = '';
      }
    }

    const reactBanner = document.getElementById('tacticaReactionBanner');
    if (reactBanner) {
      const win = clientState.pendingReactionWindow;
      if (win && win.open) {
        reactBanner.classList.remove('hidden');
        const btns = win.eligibleStratagems.map(s =>
          `<button type="button" class="btn-red btn-sm" onclick="resolveConsoleReaction('${s.key}', ${s.cpCost})">⚡ ${s.name} (-${s.cpCost} CP)</button>`
        ).join(' ');
        reactBanner.innerHTML = `
          <div style="font-weight:800; color:var(--gold); margin-bottom:6px;">⚡ PLAYER REACTION WINDOW: ${win.title} (${win.playerCp} CP)</div>
          <div style="display:flex; gap:8px; flex-wrap:wrap;">${btns} <button type="button" class="btn-ghost btn-sm" onclick="resolveConsoleReaction('PASS', 0)">Pass (Hold CP)</button></div>
        `;
      } else {
        reactBanner.classList.add('hidden');
        reactBanner.innerHTML = '';
      }
    }

    const resVm = typeof selectReservesBannerViewModel === 'function'
      ? selectReservesBannerViewModel(clientState.hordeReserves)
      : { visible: false, bannerHtml: '', step2ButtonText: '2. Move & LOS' };
    const resStrip = document.getElementById('tacticaReservesStrip');
    if (resStrip) {
      resStrip.classList.toggle('hidden', !resVm.visible);
      resStrip.innerHTML = resVm.visible ? resVm.bannerHtml : '';
    }
    const stepBtn2 = document.getElementById('hordeStepBtn2');
    if (stepBtn2) {
      stepBtn2.textContent = resVm.step2ButtonText;
      stepBtn2.style.borderColor = resVm.visible ? 'var(--purple)' : '';
    }

    const units = clientState.boardTelemetry?.units || [];
    setTxt('tacticaUnitCountSummary', `${units.length} Unit${units.length === 1 ? '' : 's'}`);

    const chipsBox = document.getElementById('tacticaHordeTargetChips');
    if (chipsBox) {
      const hordeUnits = units.map((u, idx) => ({ u, idx })).filter(x => x.u.side !== 'PLAYER');
      const curTarget = document.getElementById('defUnitName')?.value || '';
      chipsBox.innerHTML = hordeUnits.length === 0
        ? '<span style="font-size:0.8rem; color:var(--muted);">No scanned Horde targets yet — open Scanned Board Units below or Override Yellowscribe Stats.</span>'
        : hordeUnits.map(({ u, idx }) => {
          const isSel = u.name === curTarget;
          return `<button type="button" class="${isSel ? 'btn-red' : 'btn-ghost'} btn-sm" onclick="selectTelemetryUnitForDefense(${idx})">🎯 ${u.name} (x${u.modelCount || 1} • Sv ${u.save || 4}+)</button>`;
        }).join('');
    }

    const stratTargetSel = document.getElementById('quickStratTargetSelect');
    if (stratTargetSel) {
      const prevVal = stratTargetSel.value || '';
      const playerUnits = units.filter(u => u.side === 'PLAYER');
      stratTargetSel.innerHTML = '<option value="">(Any / Untargeted)</option>' +
        playerUnits.map(u => `<option value="${u.name}">${u.name}</option>`).join('');
      if (prevVal && playerUnits.some(u => u.name === prevVal)) stratTargetSel.value = prevVal;
    }

    const telBox = document.getElementById('tacticaTelemetryBox');
    if (telBox) {
      const rowVms = typeof selectTelemetryRowViewModels === 'function'
        ? selectTelemetryRowViewModels(units)
        : [];
      if (rowVms.length === 0) {
        telBox.innerHTML = '<div style="color:var(--muted); font-style:italic;">No LCT tabletop scan received yet. Click [📡 Scan LCT Board] on your TTS Beacon token or request a scan above.</div>';
      } else {
        telBox.innerHTML = rowVms.map(vm => `
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px; padding:6px 0; border-bottom:1px solid rgba(255,255,255,0.06); font-size:0.83rem;">
            <div>
              <span class="badge ${vm.sideBadgeClass}">${vm.side}</span> <strong>${vm.name}</strong> ${vm.statsBracketText}
              ${vm.didIngressThisTurn ? `<span class="badge purple" style="margin-left:4px;">${vm.deepStruckBadgeText}</span>` : ''}
              ${vm.hasEmbarkedCargo ? `<span class="badge gold" style="margin-left:4px;">${vm.embarkedBadgeText}</span>` : ''}
              <span style="color:#94a3b8;">${vm.proximityText}</span>
            </div>
            <div style="display:flex; gap:6px; flex-wrap:wrap;">
              <button type="button" class="btn-ghost btn-sm" onclick="toggleTelemetryUnitSide(${vm.index})">⇄ Flip Side</button>
              ${vm.canDisembark ? `<button type="button" class="btn-gold btn-sm" onclick="disembarkTelemetryTransport(${vm.index})">⏏️ Disembark (3")</button>` : ''}
              ${vm.canLoadAutoDefender ? `<button type="button" class="btn-ghost btn-sm" onclick="selectTelemetryUnitForDefense(${vm.index})">🎯 Load into Auto-Defender</button>` : ''}
            </div>
          </div>
        `).join('');
      }
    }

    const lastLog = localChronicle.length > 0 ? localChronicle[localChronicle.length - 1] : null;
    setTxt('tacticaLatestLogSummary', lastLog ? `R${lastLog.battleRound} • ${lastLog.type}` : 'Ready');

    const box = document.getElementById('tacticaChronicleBox');
    if (box) {
      box.innerHTML = localChronicle.length === 0
        ? '<div style="color:var(--muted); font-style:italic;">No match events logged yet.</div>'
        : localChronicle.slice(-40).map(e =>
          `<div style="padding:4px 0; border-bottom:1px solid rgba(255,255,255,0.06); font-size:0.83rem;">
            <strong style="color:var(--gold);">[R${e.battleRound} • ${e.phase}]</strong> <span style="color:#94a3b8;">(${e.type})</span> ${e.summary}
          </div>`
        ).join('');
    }

    if (typeof window !== 'undefined' && typeof window.syncOverwatchAlertsFromState === 'function') {
      window.syncOverwatchAlertsFromState();
    }
  }

  async function refreshDaemonState() {
    try {
      const data = await daemonRequest('/state', 'GET');
      daemonOnline = true;
      clientState = data.state;
      localChronicle = data.chronicle || [];
      const qEl = document.getElementById('tacticaQueueLabel');
      if (qEl) qEl.textContent = `${data.ttsQueueLength || 0} Queued`;
    } catch (e) {
      daemonOnline = false;
    }
    renderTacticaConsole();
    return daemonOnline;
  }

  function pruneClientBuffs() {
    if (typeof pruneExpiredPlayerBuffs === 'function') {
      clientState.activePlayerBuffs = pruneExpiredPlayerBuffs(
        clientState.activePlayerBuffs,
        clientState.battleRound,
        clientState.phase
      );
    }
  }

  /**
   * Synchronizes Room Code, Round, Faction, CP/SP, and active Misery cards from Mode 1 Spawner `localStorage`.
   */
  async function syncFromSpawnerStorage() {
    if (typeof localStorage === 'undefined') return false;
    try {
      const raw = localStorage.getItem('foa_horde_session_v1');
      if (raw) {
        const s = JSON.parse(raw);
        const nextRound = Math.max(1, Number(s.battleRound) || 1);
        const roundChanged = nextRound !== Number(clientState.battleRound);
        const patch = {
          roomCode: s.seed || clientState.roomCode,
          battleRound: nextRound,
          ...(roundChanged ? { phase: 'COMMAND_SPAWN' } : {}),
          factionName: s.activeHordeFactionName || clientState.factionName,
          playerCp: s.cp !== undefined ? Number(s.cp) : clientState.playerCp,
          playerSp: s.sp !== undefined ? Number(s.sp) : clientState.playerSp,
          activeMiseryIds: Array.isArray(s.activeMiseries) ? s.activeMiseries.map(m => m.id) : [],
          zoneSpawns: Array.isArray(s.currentZoneSpawns) ? s.currentZoneSpawns : []
        };
        Object.assign(clientState, patch);
        pruneClientBuffs();
        if (roundChanged) {
          patch.activePlayerBuffs = clientState.activePlayerBuffs;
        }
        try {
          const res = await daemonRequest('/session/sync', 'POST', patch);
          daemonOnline = true;
          clientState = res.state;
        } catch (err) {
          daemonOnline = false;
        }
      }
    } catch (e) {}
    renderTacticaConsole();
    return daemonOnline;
  }

  async function setConsolePhaseAndTrigger(phase, reactionTrigger = null) {
    const rndEl = typeof document !== 'undefined' ? document.getElementById('tacticaRoundSelect') : null;
    if (rndEl && rndEl.value) clientState.battleRound = Number(rndEl.value) || clientState.battleRound;
    clientState.phase = phase;
    pruneClientBuffs();
    const summary = `Entered ${phase} (Round ${clientState.battleRound}).`;

    try {
      const res = await daemonRequest('/chronicle/append', 'POST', {
        battleRound: clientState.battleRound,
        phase,
        type: 'PHASE',
        summary,
        reactionTrigger
      });
      daemonOnline = true;
      clientState.pendingReactionWindow = res.pendingReactionWindow;
      localChronicle.push(res.entry);
    } catch (e) {
      localChronicle.push(formatChronicleEntry({ battleRound: clientState.battleRound, phase, type: 'PHASE', summary }, clientState));
      if (reactionTrigger && typeof detectPlayerReactionWindow === 'function') {
        const win = detectPlayerReactionWindow(reactionTrigger, clientState);
        clientState.pendingReactionWindow = win.open ? win : null;
      }
    }
    renderTacticaConsole();
  }

  async function resolveConsoleReaction(choice, cpCost = 0) {
    const summary = choice === 'PASS' ? 'Player passed reaction window.' : `Player activated ${choice} (-${cpCost} CP).`;
    try {
      const res = await daemonRequest('/reaction/resolve', 'POST', { choice, cpCost, summary });
      clientState = res.state;
      localChronicle.push(res.entry);
    } catch (e) {
      clientState.playerCp = Math.max(0, (Number(clientState.playerCp) || 0) - cpCost);
      clientState.pendingReactionWindow = null;
      localChronicle.push(formatChronicleEntry({ type: 'REACTION', summary }, clientState));
    }
    renderTacticaConsole();
  }

  /**
   * Queues a multi-stage Horde Auto-Defender roll sequence onto the LCT TTS Dice Mat.
   */
  async function queueConsoleAutoDefender() {
    if (typeof document === 'undefined') return null;
    const payload = {
      unitName: (document.getElementById('defUnitName')?.value || 'Horde Squad').trim(),
      defender: {
        save: Number(document.getElementById('defSaveInput')?.value) || 4,
        invuln: Number(document.getElementById('defInvulnInput')?.value) || null,
        woundsPerModel: Number(document.getElementById('defWpmInput')?.value) || 1,
        keywords: (document.getElementById('defKeywordsInput')?.value || 'INFANTRY').split(',').map(s => s.trim()).filter(Boolean)
      },
      incomingAttack: {
        type: 'ranged',
        strength: 4,
        ap: Number(document.getElementById('defApInput')?.value) || 0,
        damage: Number(document.getElementById('defDmgInput')?.value) || 1
      },
      context: { inSpawnZone: Boolean(document.getElementById('defInSpawnCheck')?.checked) },
      options: {
        numWounds: Number(document.getElementById('defWoundsCountInput')?.value) || 1,
        damagePerWound: Number(document.getElementById('defDmgInput')?.value) || 1,
        startingModels: Number(document.getElementById('defModelsInput')?.value) || 10
      }
    };

    try {
      const res = await daemonRequest('/combat/defend-request', 'POST', payload);
      daemonOnline = true;
      clientState.pendingDiceSequence = res.sequence.stage === 'COMPLETE' ? null : res.sequence;
      if (res.entry) localChronicle.push(res.entry);
      if (res.sequence.stage === 'COMPLETE') renderCompletedDefenseSummary(res.sequence);
    } catch (e) {
      const seq = createDefenseRollSequence(payload, clientState);
      clientState.pendingDiceSequence = seq.stage === 'COMPLETE' ? null : seq;
      if (seq.stage === 'COMPLETE') renderCompletedDefenseSummary(seq);
    }
    renderTacticaConsole();
    return clientState.pendingDiceSequence;
  }

  /**
   * Advances the active LCT roll sequence using physical/tabletop settled pip values.
   */
  async function submitSettledMatPips() {
    const inp = document.getElementById('tacticaManualPipsInput');
    const raw = (inp?.value || '').trim();
    if (!raw || (!clientState.pendingDiceSequence && !clientState.pendingChargeDecl)) return null;
    const dice = raw.split(/[\s,]+/).map(Number).filter(n => n >= 1 && n <= 6);
    if (inp) inp.value = '';

    if (!clientState.pendingDiceSequence && clientState.pendingChargeDecl) {
      const decl = clientState.pendingChargeDecl;
      try {
        const res = await daemonRequest('/tts/dice-result', 'POST', { sequenceId: decl.sequenceId, dice });
        clientState.pendingChargeDecl = null;
        if (res.entry) localChronicle.push(res.entry);
      } catch (e) {
        const resolved = resolveHordeChargeRoll(decl, dice);
        clientState.pendingChargeDecl = null;
        localChronicle.push(formatChronicleEntry({
          type: 'HORDE_CHARGE',
          summary: `${resolved.attackerName} -> ${resolved.targetName} [LCT 2D6 = ${resolved.modifiedTotal}"]: ${resolved.succeeded ? 'CHARGE SUCCEEDED!' : 'Charge Failed.'}`
        }, clientState));
      }
      renderTacticaConsole();
      return null;
    }

    const activeSeq = clientState.pendingDiceSequence;
    try {
      const res = await daemonRequest('/tts/dice-result', 'POST', {
        rollId: activeSeq.nextCommand?.rollId,
        sequenceId: activeSeq.sequenceId,
        dice
      });
      clientState.pendingDiceSequence = res.sequence.stage === 'COMPLETE' ? null : res.sequence;
      if (res.entry) localChronicle.push(res.entry);
      if (res.sequence.stage === 'COMPLETE') renderCompletedDefenseSummary(res.sequence);
    } catch (e) {
      const updated = activeSeq.kind === 'AUTO_DEFENDER'
        ? advanceDefenseRollSequence(activeSeq, dice)
        : advanceHordeAttackRollSequence(activeSeq, dice);
      if (updated.stage === 'COMPLETE') {
        clientState.pendingDiceSequence = null;
        renderCompletedDefenseSummary(updated);
        localChronicle.push(formatChronicleEntry({
          type: updated.kind,
          summary: `${updated.unitName || updated.attackerName} [LCT Mat Settled] -> Slain: ${updated.outcome?.modelsSlain ?? 0}.`
        }, clientState));
      } else {
        clientState.pendingDiceSequence = updated;
      }
    }
    renderTacticaConsole();
    return clientState.pendingDiceSequence;
  }

  async function appendConsoleNote() {
    const inp = document.getElementById('tacticaNoteInput');
    const text = (inp?.value || '').trim();
    if (!text) return;
    if (inp) inp.value = '';
    try {
      const res = await daemonRequest('/chronicle/append', 'POST', { type: 'NOTE', summary: text });
      localChronicle.push(res.entry);
    } catch (e) {
      localChronicle.push(formatChronicleEntry({ type: 'NOTE', summary: text }, clientState));
    }
    renderTacticaConsole();
  }

  async function compileAndPreviewMatchReport() {
    const channel = document.getElementById('tacticaReportChannel')?.value || 'alpha';
    const outcome = document.getElementById('tacticaOutcomeInput')?.value || '';
    try {
      const res = await daemonRequest('/chronicle/compile', 'POST', { channel, outcome });
      lastCompiledReport = res.report;
    } catch (e) {
      lastCompiledReport = compileTacticaPostMatchReport(clientState, localChronicle, { channel, outcome });
    }
    const prev = document.getElementById('tacticaCompiledPreview');
    if (prev) prev.textContent = lastCompiledReport;
    return lastCompiledReport;
  }

  function sendCompiledReportToVox() {
    const channel = document.getElementById('tacticaReportChannel')?.value || 'alpha';
    if (!lastCompiledReport) {
      lastCompiledReport = compileTacticaPostMatchReport(clientState, localChronicle, { channel });
    }
    if (typeof window !== 'undefined' && window.VoxAudio && typeof window.VoxAudio.transmitToVox === 'function') {
      window.VoxAudio.transmitToVox(channel, lastCompiledReport);
    }
  }

  /**
   * Enqueues a `SCAN_BOARD` request onto the LCT daemon poll queue for the TTS Beacon token.
   */
  async function requestTtsBoardScan() {
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

