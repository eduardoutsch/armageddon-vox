# 📦 Fires of Armageddon // Bundle: In-Match LCT Tactical Console (View & Controller)

In-Match Tactical Console view and imperative UI controller bridging Mode 1 session storage and LCT dice-mat rolls (`pages/tactica.html`, `js/tactica.js`).

## 📑 Table of Contents
- [pages/tactica.html](#file-pagestacticahtml)
- [js/tactica.js](#file-jstacticajs)

---

## File: `pages/tactica.html` <a id="file-pagestacticahtml"></a>

````html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fires of Armageddon // In-Match LCT Tactical Console</title>
  <link rel="icon" type="image/svg+xml" href="../assets/favicon.svg">
  <link rel="apple-touch-icon" href="../assets/favicon.svg">
  <link rel="stylesheet" href="../css/style.css">
</head>
<body>

  <nav class="suite-nav">
    <a href="../index.html" class="suite-link">📖 Field Codex &amp; Guide</a>
    <a href="spawner.html" class="suite-link">🧟 Mode 1: Horde Command &amp; Spawner</a>
    <a href="pvp.html" class="suite-link">⚔️ Mode 2: 1v1 Ash Wastes PvP</a>
    <a href="rogue.html" class="suite-link">🎲 Mode 3: Rogue Sector &amp; AI Tracker</a>
    <a href="roster.html" class="suite-link">🎖️ Mode 4: Hostile Matrix &amp; Nemeses</a>
    <a href="crusade.html" class="suite-link">🏆 Mode 5: Crusade Quartermaster</a>
    <a href="briefing.html" class="suite-link">📜 Mode 6: Briefings, Ship &amp; Atlas</a>
    <a href="vox.html" class="suite-link">📡 Mode 7: Astropath Vox</a>
  </nav>

  <div class="app-shell">
    <div class="hero-banner">
      <div id="tacticaDaemonBadge" class="status-pill" style="margin-bottom:8px;">🟡 Checking LCT Tactica Daemon...</div>
      <h1>In-Match Tactical &amp; LCT Autopilot Console</h1>
      <p>100% LCT TTS Map Dice Roller Orchestration • Persistent Round 1–6 Scribe • Separate from Live Vox</p>
    </div>

    <!-- 1. LIVE SESSION & REACTION WINDOWS -->
    <div class="card green" style="margin-bottom:14px;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:10px;">
        <div>
          <strong>Room:</strong> <span id="tacticaRoomLabel">HADES-1</span> •
          <strong>Horde:</strong> <span id="tacticaFactionLabel" style="color:var(--gold);">Chaos Daemons</span> •
          <strong>Assets:</strong> <span id="tacticaCpLabel">2 CP / 0 SP</span> •
          <strong>Warlord:</strong> <span id="tacticaWarlordLabel">None Designated</span> •
          <strong>LCT Queue:</strong> <span id="tacticaQueueLabel">0 Queued</span>
        </div>
        <div style="display:flex; gap:6px;">
          <button type="button" class="btn-ghost btn-sm" onclick="refreshDaemonState()">📡 Poll LCT Daemon</button>
          <button type="button" class="btn-green btn-sm" onclick="syncFromSpawnerStorage()">🔄 Sync Mode 1 Session</button>
        </div>
      </div>

      <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
        <select id="tacticaRoundSelect" style="padding:6px 10px; background:#0b0d13;">
          <option value="1">Round 1</option><option value="2">Round 2</option><option value="3">Round 3</option>
          <option value="4">Round 4</option><option value="5">Round 5</option><option value="6">Round 6 (Final Stand)</option>
        </select>
        <select id="tacticaPhaseSelect" style="padding:6px 10px; background:#0b0d13;" onchange="setConsolePhaseAndTrigger(this.value)">
          <option value="COMMAND_SPAWN">1. Command &amp; Wave Spawns</option>
          <option value="HORDE_MOVEMENT">2. Horde Movement</option>
          <option value="HORDE_SHOOTING">3. Horde Shooting</option>
          <option value="HORDE_CHARGE">4. Horde Charges</option>
          <option value="HORDE_FIGHT">5. Horde Fight &amp; Consolidate</option>
          <option value="PLAYER_TURN">6. Player Turn</option>
          <option value="ROUND_END">7. End of Round</option>
        </select>
        <button type="button" class="btn-ghost btn-sm" onclick="setConsolePhaseAndTrigger('HORDE_MOVEMENT', 'END_OF_HORDE_MOVEMENT')">⏸️ End Horde Move (Overwatch)</button>
        <button type="button" class="btn-ghost btn-sm" onclick="setConsolePhaseAndTrigger('HORDE_CHARGE', 'HORDE_CHARGE_DECLARED')">⏸️ Charge Declared (Heroic)</button>
        <button type="button" class="btn-ghost btn-sm" onclick="setConsolePhaseAndTrigger('HORDE_FIGHT', 'AFTER_HORDE_UNIT_FOUGHT')">⏸️ Counter-Offensive</button>
      </div>

      <div id="tacticaReactionBanner" class="card hidden" style="margin-top:10px; border-left:4px solid var(--gold); background:rgba(245,176,65,0.1);"></div>
    </div>

    <!-- 1B. LIVE LCT ORBITAL AUSPEX TELEMETRY -->
    <div class="card" style="margin-bottom:14px;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:8px;">
        <h3 style="margin:0;">🛰️ LCT Orbital Auspex Telemetry (Exact Edge-to-Edge Inches)</h3>
        <button type="button" class="btn-ghost btn-sm" onclick="requestTtsBoardScan()">📡 Request LCT Board Scan</button>
      </div>
      <div id="tacticaTelemetryBox" style="max-height:200px; overflow-y:auto; background:#0b0d13; padding:10px; border-radius:8px; border:1px solid var(--border);"></div>
    </div>

    <!-- 1C. DETERMINISTIC HORDE AUTOPILOT DECK -->
    <div class="card" style="margin-bottom:14px;">
      <h3>🤖 Horde Turn Autopilot (Shelf Cloning • Pre-LOS Revert • Keyword Priority • 11th Ed Consolidation)</h3>
      <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:10px;">
        <button type="button" class="btn-green btn-sm" onclick="triggerAutopilotSpawnWaves()">🧟 1. Drop Wave Spawns</button>
        <button type="button" class="btn-ghost btn-sm" onclick="triggerAutopilotMovement()">🏃 2. Move Horde (Pre-LOS Preview)</button>
        <button type="button" class="btn-ghost btn-sm" onclick="setConsolePhaseAndTrigger('HORDE_MOVEMENT', 'END_OF_HORDE_MOVEMENT')">✅ Lock Moves &amp; Open Overwatch</button>
        <button type="button" class="btn-ghost btn-sm" onclick="triggerAutopilotShooting()">🎯 3. Compute Shooting Priority</button>
        <button type="button" class="btn-ghost btn-sm" onclick="triggerAutopilotCharges()">⚡ 4. Declare Charges (&le;12")</button>
        <button type="button" class="btn-ghost btn-sm" onclick="triggerAutopilotConsolidate()">⚔️ 5. 3" Consolidate</button>
      </div>
      <div id="tacticaAutopilotBox" style="background:#0b0d13; padding:10px; border-radius:8px; border:1px solid var(--border); font-size:0.84rem; color:var(--text);">
        Ready. Sync Mode 1 Session &amp; scan LCT board to pilot Horde waves automatically.
      </div>
    </div>

    <!-- 1D. LIVE SCREEN & MICROPHONE OVERWATCH REFEREE + 6+ INTRUSION WATCHER -->
    <div class="card" style="margin-bottom:14px;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:8px;">
        <h3 style="margin:0;">🎙️ Live Screen &amp; Mic Overwatch (3D Ruin LOS • Hands-Free Voice • 6+ Intrusions)</h3>
        <span id="overwatchScreenStatus" style="font-size:0.8rem; color:var(--muted);">📷 Screen Share: Disconnected</span>
      </div>
      <div id="tacticaIntrusionAlertBox" class="card hidden" style="margin-bottom:10px; border-left:4px solid var(--red); background:rgba(255,71,87,0.12);"></div>
      <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:8px;">
        <button type="button" class="btn-green btn-sm" onclick="toggleTtsScreenCapture()">🖥️ Share TTS Window</button>
        <button type="button" class="btn-red btn-sm" onclick="startPushToTalkMic()">🎙️ Push-to-Talk Mic</button>
        <button type="button" id="btnToggleOverwatchTts" class="btn-ghost btn-sm" onclick="toggleOverwatchVoiceOutput()">🔊 Voice Readout: ON</button>
      </div>
      <div style="display:flex; gap:8px;">
        <input id="overwatchQueryInput" placeholder="Voice/text command or 3D LOS check (e.g. 'Can Screamer-Killer see Krieg behind central ruin?')" style="flex:1; padding:8px; background:#0b0d13;">
        <button type="button" class="btn-ghost btn-sm" onclick="dispatchSpokenOrTypedCommand(document.getElementById('overwatchQueryInput').value)">👁️ Verify LOS / Run</button>
      </div>
      <div id="overwatchVerdictBox" style="margin-top:8px; font-size:0.84rem; color:var(--text);"></div>
    </div>

    <!-- 2. HORDE AUTO-DEFENDER (QUEUES SAVES & FNP ON LCT TTS DICE MAT) -->
    <div class="card" style="margin-bottom:14px;">
      <h3>🛡️ Horde Auto-Defender (Queues Saves, FNP &amp; On-Death onto LCT Dice Mat)</h3>
      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(120px, 1fr)); gap:8px; margin-bottom:10px;">
        <input id="defUnitName" placeholder="Unit" value="Necron Warriors" style="padding:8px; background:#0b0d13;">
        <input id="defSaveInput" type="number" placeholder="Save (4)" value="4" style="padding:8px; background:#0b0d13;">
        <input id="defInvulnInput" type="number" placeholder="Invuln (0=None)" value="0" style="padding:8px; background:#0b0d13;">
        <input id="defWpmInput" type="number" placeholder="Wounds/Model" value="1" style="padding:8px; background:#0b0d13;">
        <input id="defKeywordsInput" placeholder="Keywords" value="INFANTRY" style="padding:8px; background:#0b0d13;">
        <input id="defModelsInput" type="number" placeholder="Models Alive" value="10" style="padding:8px; background:#0b0d13;">
        <input id="defWoundsCountInput" type="number" placeholder="Incoming Wounds" value="4" style="padding:8px; background:#0b0d13;">
        <input id="defApInput" type="number" placeholder="AP (e.g. -1)" value="-1" style="padding:8px; background:#0b0d13;">
        <input id="defDmgInput" type="number" placeholder="Damage" value="1" style="padding:8px; background:#0b0d13;">
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
        <label style="display:inline-flex; align-items:center; gap:6px;"><input type="checkbox" id="defInSpawnCheck"> Unit in Spawn Zone (Cover + Hidden)</label>
        <button type="button" class="btn-red" onclick="queueConsoleAutoDefender()">🎲 Queue Roll on LCT TTS Dice Mat</button>
      </div>

      <div id="tacticaPendingRollBox" class="card hidden" style="margin-top:10px; border-left:4px solid var(--gold); background:rgba(245,176,65,0.08);"></div>
      <div style="display:flex; gap:8px; margin-top:8px;">
        <input id="tacticaManualPipsInput" placeholder="Offline fallback: enter settled LCT mat pips (e.g. 5, 2, 4, 6)" style="flex:1; padding:8px; background:#0b0d13;">
        <button type="button" class="btn-ghost btn-sm" onclick="submitSettledMatPips()">✓ Apply Settled Pips</button>
      </div>
      <div id="defResultBox" style="margin-top:10px; font-size:0.88rem; color:var(--text);"></div>
    </div>

    <!-- 3. PERSISTENT ROUND 1–6 BLACK-BOX CHRONICLE -->
    <div class="card" style="margin-bottom:14px;">
      <h3>📜 Persistent Match Chronicle (Round 1–6 Disk Scribe)</h3>
      <div id="tacticaChronicleBox" style="max-height:240px; overflow-y:auto; background:#0b0d13; padding:10px; border-radius:8px; border:1px solid var(--border); margin-bottom:8px;"></div>
      <div style="display:flex; gap:8px;">
        <input id="tacticaNoteInput" placeholder="Log tactical event, LOS ruling, or heroic moment..." style="flex:1; padding:8px; background:#0b0d13;">
        <button type="button" class="btn-ghost" onclick="appendConsoleNote()">+ Log Event</button>
      </div>
    </div>

    <!-- 4. OPTIONAL POST-MATCH EXPORT TO VOX -->
    <div class="card">
      <h3>📡 Optional Post-Match Chronicle Export</h3>
      <div style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:8px;">
        <select id="tacticaReportChannel" style="padding:8px; background:#0b0d13;">
          <option value="alpha">Conduit Alpha (The Exile)</option>
          <option value="beta">Conduit Beta (Lord Commander Junebug)</option>
          <option value="gamma">Conduit Gamma (Kâhl Hârkyn)</option>
        </select>
        <input id="tacticaOutcomeInput" placeholder="Outcome (e.g. Survived Round 6 Final Stand)" style="flex:1; padding:8px; background:#0b0d13;">
        <button type="button" class="btn-ghost" onclick="compileAndPreviewMatchReport()">📝 Compile Full R1–R6 Report</button>
      </div>
      <pre id="tacticaCompiledPreview" class="master-dossier-preview vox-preview-alpha" style="min-height:80px; white-space:pre-wrap;"></pre>
      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:10px;">
        <button type="button" class="launch-btn" style="flex:1; margin:0;" onclick="sendCompiledReportToVox()">📡 Queue Compiled Match File into Astropathic Vox →</button>
        <button type="button" class="btn-green" onclick="exportTacticaToCrusade()">🏆 Export Telemetry to Mode 5 Crusade →</button>
      </div>
      <div id="tacticaCrusadeExportNotice" class="hidden" style="margin-top:8px; font-size:0.84rem; color:var(--green);"></div>
    </div>
  </div>

  <script src="../js/spawner.js"></script>
  <script src="../js/horde-combat-modifiers.js"></script>
  <script src="../js/tts-telemetry-core.js"></script>
  <script src="../js/horde-autopilot-core.js"></script>
  <script src="../js/tactica-core.js"></script>
  <script src="../js/tactica.js"></script>
  <script src="../js/tactica-overwatch-core.js"></script>
  <script src="../js/tactica-overwatch.js"></script>
  <script src="../js/vox-audio.js"></script>
</body>
</html>

````

---

## File: `js/tactica.js` <a id="file-jstacticajs"></a>

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
    return u;
  }

  function setAutopilotHtml(html) {
    if (typeof document === 'undefined') return;
    const box = document.getElementById('tacticaAutopilotBox');
    if (box) box.innerHTML = html;
  }

  /**
   * 1. Clones off-board `HORDE_TEMPLATE` miniatures into active Mode 1 Spawn Zones.
   */
  async function triggerAutopilotSpawnWaves() {
    let plan;
    try {
      const res = await daemonRequest('/autopilot/spawn-waves', 'POST', { zoneSpawns: clientState.zoneSpawns });
      daemonOnline = true;
      plan = res;
      if (res.entry) localChronicle.push(res.entry);
    } catch (e) {
      plan = planWaveSpawnCommands(clientState.zoneSpawns);
      localChronicle.push(formatChronicleEntry({ type: 'SPAWN_WAVE', summary: plan.summary }, clientState));
    }
    setAutopilotHtml(`<strong>🧟 Wave Spawn Queue:</strong> ${plan.summary}`);
    renderTacticaConsole();
    return plan;
  }

  /**
   * 2. Computes deterministic Horde Movement & Advance vectors with one-click Pre-Overwatch LOS Revert buttons.
   */
  async function triggerAutopilotMovement() {
    clientState.phase = 'HORDE_MOVEMENT';
    let plans = [];
    try {
      const res = await daemonRequest('/autopilot/plan-movement', 'POST', {});
      daemonOnline = true;
      plans = res.plans || [];
      if (res.entry) localChronicle.push(res.entry);
    } catch (e) {
      const localRes = planHordeMovementPhase(clientState.boardTelemetry, clientState);
      plans = localRes.plans || [];
      localChronicle.push(formatChronicleEntry({
        type: 'HORDE_MOVE',
        summary: `Moved ${plans.length} Horde squad(s) — awaiting Pre-Overwatch LOS check.`
      }, clientState));
    }
    clientState.lastMovementPlans = plans;

    if (plans.length === 0) {
      setAutopilotHtml('<span style="color:var(--muted);">No eligible Horde movement vectors found on board.</span>');
    } else {
      setAutopilotHtml(plans.map((p, idx) => {
        if (p.status === 'ENGAGED_HOLD') {
          return `<div style="padding:4px 0;"><strong>${p.unitName}</strong> — Engaged (&le;2.0"): Holding melee contact.</div>`;
        }
        const advTag = p.advanced ? ' <span class="badge red">ADVANCED</span>' : '';
        return `
          <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; padding:4px 0; border-bottom:1px solid rgba(255,255,255,0.06);">
            <div>🏃 <strong>${p.unitName}</strong> &rarr; ${p.goalName} (${p.moveBudgetInches}" to X:${p.targetX}, Z:${p.targetZ})${advTag}</div>
            <button type="button" class="btn-ghost btn-sm" onclick="revertAutopilotSquadMove(${idx})">↩️ Revert Move (No LOS)</button>
          </div>
        `;
      }).join(''));
    }
    renderTacticaConsole();
    return plans;
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
    clientState.phase = 'HORDE_SHOOTING';
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
   * Queues a selected Horde weapon assignment onto the LCT TTS Dice Mat (`HITS` -> `WOUNDS`).
   */
  async function fireAutopilotWeaponOnMat(idx) {
    const asgn = (clientState.lastShootingAssignments || [])[idx];
    if (!asgn) return null;
    const units = clientState.boardTelemetry?.units || [];
    const attacker = units.find(u => (u.squadKey || u.name) === asgn.attackerKey) || { name: asgn.attackerName, keywords: [] };
    const payload = {
      attackerName: asgn.attackerName,
      targetName: asgn.targetName,
      attacker,
      target: asgn.target || { toughness: 4 },
      weapon: asgn.weapon
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
    clientState.phase = 'HORDE_CHARGE';
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
    clientState.phase = 'HORDE_FIGHT';
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
    syncFromSpawnerStorage().then(() => refreshDaemonState());
  }

  if (typeof window !== 'undefined') {
    Object.assign(window, {
      getTacticaClientState: () => clientState,
      getTacticaChronicle: () => localChronicle,
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
      triggerAutopilotSpawnWaves,
      triggerAutopilotMovement,
      revertAutopilotSquadMove,
      triggerAutopilotShooting,
      fireAutopilotWeaponOnMat,
      triggerAutopilotCharges,
      triggerAutopilotConsolidate,
      initTacticaPage
    });
    if (typeof window.addEventListener === 'function') {
      window.addEventListener('DOMContentLoaded', initTacticaPage);
      window.addEventListener('vox:page-swapped', () => {
        if (typeof document !== 'undefined' && document.getElementById('tacticaChronicleBox')) initTacticaPage();
      });
    }
  }

  return {
    getTacticaClientState: () => clientState,
    getTacticaChronicle: () => localChronicle,
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
    triggerAutopilotSpawnWaves,
    triggerAutopilotMovement,
    revertAutopilotSquadMove,
    triggerAutopilotShooting,
    fireAutopilotWeaponOnMat,
    triggerAutopilotCharges,
    triggerAutopilotConsolidate,
    initTacticaPage
  };
});

````
