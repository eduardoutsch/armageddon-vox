# 📦 Fires of Armageddon // Bundle: In-Match LCT Tactical Console Controller (Part 1: HUD, Poller & Telemetry)

Imperative Humble View controller bridging Mode 1 session storage, 1-retry daemon client, SPA-safe 2.5s auto-poller, reaction banners, and telemetry ViewModel rendering (`js/tactica.js` lines 1 to 680).

## 📑 Table of Contents
- [js/tactica.js (Part 1: HUD, Session Sync, Auto-Poller & Telemetry View, Lines 1-680)](#file-jstacticajspart1hudsessionsyncautopollertelemetryviewlines1680)

---

## File: `js/tactica.js (Part 1: HUD, Session Sync, Auto-Poller & Telemetry View, Lines 1-680)` <a id="file-jstacticajspart1hudsessionsyncautopollertelemetryviewlines1680"></a>

````javascript
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
  let hasHydratedChronicleSeq = false;
  let lastAnnouncedRollSeq = 0;

  /**
   * Forwards a concise tactical readout to `window.speakOverwatchLine` when Overwatch Auspex audio is loaded.
   *
   * @param {string} line - Spoken Auspex sentence.
   */
  function announceAuspex(line) {
    if (line && typeof window !== 'undefined' && typeof window.speakOverwatchLine === 'function') {
      window.speakOverwatchLine(line);
    }
  }

  function formatCompletedRollAnnouncement(seqOrCharge) {
    if (!seqOrCharge) return '';
    if (seqOrCharge.kind === 'AUTO_DEFENDER') {
      const slain = seqOrCharge.outcome?.modelsSlain ?? 0;
      const rem = seqOrCharge.outcome?.remainingModels ?? 0;
      return `${seqOrCharge.unitName} defense complete: ${slain} slain, ${rem} remaining.`;
    }
    if (seqOrCharge.kind === 'HORDE_ATTACK') {
      const nw = seqOrCharge.normalWounds ?? 0;
      const mw = seqOrCharge.devastatingMortalWounds ?? 0;
      return `${seqOrCharge.attackerName} into ${seqOrCharge.targetName}: ${nw} wounds${mw > 0 ? ` and ${mw} mortal wounds` : ''}.`;
    }
    if (seqOrCharge.succeeded !== undefined) {
      return `${seqOrCharge.attackerName} charge into ${seqOrCharge.targetName} ${seqOrCharge.succeeded ? 'succeeded' : 'failed'} with ${seqOrCharge.modifiedTotal} inches.`;
    }
    return '';
  }

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

  function escapeJsStr(val) {
    return String(val || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  }

  /**
   * Selects the active Horde Turn sub-step (1: Spawn, 2: Move & LOS, 3: Shoot, 4: Charge & Consolidate),
   * revealing `#tacticaLosBar` strictly inside Step 2 and Step 3 where 3D LOS applies, and restoring
   * active Step 2 / Step 3 Autopilot cards when navigating with `← Prev Step` / `Next Step →`.
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
    const prevBtn = document.getElementById('hordePrevStepBtn');
    const nextBtn = document.getElementById('hordeNextStepBtn');
    if (prevBtn) prevBtn.disabled = s <= 1;
    if (nextBtn) nextBtn.disabled = s >= 4;

    const losBar = document.getElementById('tacticaLosBar');
    if (losBar) losBar.classList.toggle('hidden', s !== 2 && s !== 3);

    if (s === 2 && ((clientState.lastMovementPlans || []).length > 0 || (clientState.lastIngressDrops || []).length > 0)) {
      renderAutopilotMovementAndIngress(clientState.lastMovementPlans || [], clientState.lastIngressDrops || [], clientState.lastMovementSightlines);
    } else if (s === 3 && (clientState.lastShootingAssignments || []).length > 0) {
      renderAutopilotShootingAssignments(clientState.lastShootingAssignments || []);
    }
    return s;
  }

  /**
   * Steps backward (`-1`) or forward (`+1`) between Horde Turn steps 1..4.
   *
   * @param {number} [delta=1] - Step delta (`-1` or `+1`).
   * @returns {number} Updated active step.
   */
  function stepHordeTurn(delta = 1) {
    return setHordeTurnStep(activeHordeStep + (Number(delta) || 0));
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
    let lastErr = null;
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const res = await fetch(`${DAEMON_URL}${route}`, opts);
        if (!res.ok) {
          const httpErr = new Error(`HTTP ${res.status}`);
          httpErr.status = res.status;
          if (res.status >= 400 && res.status < 500) throw httpErr;
          lastErr = httpErr;
          continue;
        }
        return res.json();
      } catch (err) {
        lastErr = err;
        if (err && err.status >= 400 && err.status < 500) throw err;
      }
    }
    throw lastErr || new Error('Daemon unreachable');
  }

  function stopTacticaAutoPoller() {
    if (typeof window !== 'undefined' && window._foaTacticaPollTimer) {
      clearInterval(window._foaTacticaPollTimer);
      window._foaTacticaPollTimer = null;
    }
  }

  function startTacticaAutoPoller(intervalMs = 2500) {
    stopTacticaAutoPoller();
    if (typeof setInterval !== 'function') return null;
    const ms = Math.max(500, Number(intervalMs) || 2500);
    const timer = setInterval(() => {
      if (typeof document !== 'undefined' && (document.getElementById('tacticaChronicleBox') || document.getElementById('tacticaDaemonBadge'))) {
        refreshDaemonState();
      }
    }, ms);
    if (timer && typeof timer.unref === 'function') timer.unref();
    if (typeof window !== 'undefined') {
      window._foaTacticaPollTimer = timer;
    }
    return timer;
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
        ? selectTelemetryRowViewModels(units, clientState.phaseOriginSnapshots || {})
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
              ${vm.canUndoMove ? `<button type="button" class="btn-ghost btn-sm" onclick="undoSquadMoveByKey('${escapeJsStr(vm.squadKey)}')">↩️ Undo Move</button>` : ''}
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
      const wasAwaitingRoll = Boolean(clientState.pendingDiceSequence || clientState.pendingChargeDecl);
      const data = await daemonRequest('/state', 'GET');
      daemonOnline = true;
      const nextChronicle = data.chronicle || [];
      const maxNextSeq = nextChronicle.reduce((mx, e) => Math.max(mx, Number(e?.seq) || 0), 0);

      if (!hasHydratedChronicleSeq && !wasAwaitingRoll) {
        hasHydratedChronicleSeq = true;
        lastAnnouncedRollSeq = maxNextSeq;
      } else {
        hasHydratedChronicleSeq = true;
        const settledRolls = nextChronicle.filter(e =>
          (Number(e?.seq) || 0) > lastAnnouncedRollSeq &&
          (
            e.type === 'AUTO_DEFENDER' ||
            e.type === 'HORDE_ATTACK' ||
            (e.type === 'HORDE_CHARGE' && /LCT 2D6|CHARGE SUCCEEDED|Charge Failed/i.test(String(e.summary || '')))
          )
        );
        lastAnnouncedRollSeq = Math.max(lastAnnouncedRollSeq, maxNextSeq);
        if (settledRolls.length > 0) {
          announceAuspex(settledRolls[settledRolls.length - 1].summary);
        }
      }

      clientState = data.state;
      localChronicle = nextChronicle;
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
          clientState.losBlockedPairs = [];
          clientState.losAllowedPairs = [];
          clientState.phaseOriginSnapshots = {};
          clientState.lastMovementPlans = [];
          clientState.lastMovementSightlines = [];
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
    if (rndEl && rndEl.value) {
      const nextRnd = Number(rndEl.value) || clientState.battleRound;
      if (nextRnd !== clientState.battleRound) {
        clientState.losBlockedPairs = [];
        clientState.losAllowedPairs = [];
        clientState.phaseOriginSnapshots = {};
        clientState.lastMovementPlans = [];
        clientState.lastMovementSightlines = [];
      }
      clientState.battleRound = nextRnd;
    }
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
      if (res.entry) {
        localChronicle.push(res.entry);
        lastAnnouncedRollSeq = Math.max(lastAnnouncedRollSeq, Number(res.entry.seq) || 0);
      }
      if (res.sequence.stage === 'COMPLETE') {
        renderCompletedDefenseSummary(res.sequence);
        announceAuspex(formatCompletedRollAnnouncement(res.sequence));
      }
    } catch (e) {
      const seq = createDefenseRollSequence(payload, clientState);
      clientState.pendingDiceSequence = seq.stage === 'COMPLETE' ? null : seq;
      if (seq.stage === 'COMPLETE') {
        renderCompletedDefenseSummary(seq);
        announceAuspex(formatCompletedRollAnnouncement(seq));
      }
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
        if (res.entry) {
          localChronicle.push(res.entry);
          lastAnnouncedRollSeq = Math.max(lastAnnouncedRollSeq, Number(res.entry.seq) || 0);
        }
        announceAuspex(res.chargeResult ? formatCompletedRollAnnouncement(res.chargeResult) : res.entry?.summary);
      } catch (e) {
        const resolved = resolveHordeChargeRoll(decl, dice);
        clientState.pendingChargeDecl = null;
        localChronicle.push(formatChronicleEntry({
          type: 'HORDE_CHARGE',
          summary: `${resolved.attackerName} -> ${resolved.targetName} [LCT 2D6 = ${resolved.modifiedTotal}"]: ${resolved.succeeded ? 'CHARGE SUCCEEDED!' : 'Charge Failed.'}`
        }, clientState));
        announceAuspex(formatCompletedRollAnnouncement(resolved));
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
      if (res.entry) {
        localChronicle.push(res.entry);
        lastAnnouncedRollSeq = Math.max(lastAnnouncedRollSeq, Number(res.entry.seq) || 0);
      }
      if (res.sequence.stage === 'COMPLETE') {
        renderCompletedDefenseSummary(res.sequence);
        announceAuspex(formatCompletedRollAnnouncement(res.sequence));
      }
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
        announceAuspex(formatCompletedRollAnnouncement(updated));
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
````
