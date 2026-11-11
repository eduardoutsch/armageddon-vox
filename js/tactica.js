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
    box.innerHTML = `
      <strong>${seq.unitName}</strong> • Save: <strong>${prof.saveTarget}+</strong> (${out.savesPassed}/${seq.numWounds} saved)
      ${prof.fnp ? ` • <strong>FNP ${prof.fnp}+</strong> (${out.fnpPassed} shrugged)` : ''}
      • Slain: <strong style="color:var(--red);">${out.modelsSlain}</strong> • Remaining: <strong>${out.remainingModels}</strong>
      ${out.onDeathTriggers > 0 ? `<br><span style="color:var(--gold);">⚡ Misery #30: ${out.onDeathTriggers} model(s) Shoot/Fight on Death!</span>` : ''}
      ${out.gscRespawnTriggered ? `<br><span style="color:var(--purple);">♻️ GSC 5+ Respawn Triggered!</span>` : ''}
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
    if (pendingBox) {
      const seq = clientState.pendingDiceSequence;
      const chgCmd = (!seq && clientState.pendingChargeDecl) ? clientState.pendingChargeDecl.lctCommand : null;
      const activeCmd = (seq && seq.nextCommand) ? seq.nextCommand : chgCmd;
      const stageLabel = seq ? seq.stage : 'CHARGE_ROLL';
      if (activeCmd) {
        pendingBox.classList.remove('hidden');
        pendingBox.innerHTML = `
          <div style="font-weight:800; color:var(--gold);">🎲 AWAITING LCT DICE MAT [${stageLabel}]: ${activeCmd.label}</div>
          <div style="font-size:0.8rem; color:var(--muted); margin-top:4px;">
            TTS LCT table rolls <strong>${activeCmd.count}D6</strong> automatically when connected, or enter settled mat pips below (comma-separated) if offline.
          </div>
        `;
      } else {
        pendingBox.classList.add('hidden');
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

    const telBox = document.getElementById('tacticaTelemetryBox');
    if (telBox) {
      const units = clientState.boardTelemetry?.units || [];
      if (units.length === 0) {
        telBox.innerHTML = '<div style="color:var(--muted); font-style:italic;">No LCT tabletop scan received yet. Click [📡 Scan LCT Board] on your TTS Beacon token or request a scan above.</div>';
      } else {
        telBox.innerHTML = units.map((u, idx) => {
          const nearObj = u.closestObjective ? `${u.closestObjective.name} (${u.closestObjective.distanceInches}")` : 'None';
          const nearEnemy = u.closestEnemy ? `${u.closestEnemy.name} (${u.closestEnemy.distanceInches}")` : 'None';
          const sideBadge = u.side === 'PLAYER' ? '<span class="badge blue">PLAYER</span>' : '<span class="badge red">HORDE</span>';
          const loadBtn = u.side !== 'PLAYER'
            ? `<button type="button" class="btn-ghost btn-sm" onclick="selectTelemetryUnitForDefense(${idx})">🎯 Load into Auto-Defender</button>`
            : '';
          return `
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px; padding:6px 0; border-bottom:1px solid rgba(255,255,255,0.06); font-size:0.83rem;">
              <div>
                ${sideBadge} <strong>${u.name}</strong> [x${u.modelCount || 1} • Sv ${u.save || 4}+${u.invuln ? `/${u.invuln}++` : ''}${u.fnp ? `/FNP ${u.fnp}+` : ''}]
                <span style="color:#94a3b8;">• Obj: ${nearObj} • Nearest Enemy: ${nearEnemy}</span>
              </div>
              ${loadBtn}
            </div>
          `;
        }).join('');
      }
    }

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

  /**
   * Synchronizes Room Code, Round, Faction, CP/SP, and active Misery cards from Mode 1 Spawner `localStorage`.
   */
  async function syncFromSpawnerStorage() {
    if (typeof localStorage === 'undefined') return false;
    try {
      const raw = localStorage.getItem('foa_horde_session_v1');
      if (raw) {
        const s = JSON.parse(raw);
        const patch = {
          roomCode: s.seed || clientState.roomCode,
          battleRound: Math.max(1, Number(s.battleRound) || 1),
          factionName: s.activeHordeFactionName || clientState.factionName,
          playerCp: s.cp !== undefined ? Number(s.cp) : clientState.playerCp,
          playerSp: s.sp !== undefined ? Number(s.sp) : clientState.playerSp,
          activeMiseryIds: Array.isArray(s.activeMiseries) ? s.activeMiseries.map(m => m.id) : [],
          zoneSpawns: Array.isArray(s.currentZoneSpawns) ? s.currentZoneSpawns : []
        };
        Object.assign(clientState, patch);
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
    const rndEl = document.getElementById('tacticaRoundSelect');
    if (rndEl && rndEl.value) clientState.battleRound = Number(rndEl.value) || clientState.battleRound;
    clientState.phase = phase;
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

