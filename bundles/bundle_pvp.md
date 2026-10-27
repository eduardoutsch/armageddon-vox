# 📦 Fires of Armageddon // Bundle: Mode 2 - 1v1 Ash Wastes PvP

Complete source code for the 1v1 Ash Wastes PvP module, Hellscapes, Warp Storm Anomalies, and Unbound Adversaries (`pages/pvp.html`, `js/pvp.js`).

## 📑 Table of Contents
- [pages/pvp.html](#file-pagespvphtml)
- [js/pvp.js](#file-jspvpjs)

---

## File: `pages/pvp.html` <a id="file-pagespvphtml"></a>

````html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fires of Armageddon // 1v1 Ash Wastes PvP</title>
  <link rel="icon" type="image/svg+xml" href="../assets/favicon.svg">
  <link rel="apple-touch-icon" href="../assets/favicon.svg">
  <link rel="stylesheet" href="../css/style.css">
</head>
<body>

  <nav class="suite-nav">
    <a href="../index.html" class="suite-link">📖 Field Codex &amp; Guide</a>
    <a href="spawner.html" class="suite-link">🧟 Mode 1: Horde Command &amp; Spawner</a>
    <a href="pvp.html" class="suite-link active">⚔️ Mode 2: 1v1 Ash Wastes PvP</a>
    <a href="rogue.html" class="suite-link">🎲 Mode 3: Rogue Sector &amp; AI Tracker</a>
    <a href="roster.html" class="suite-link">🎖️ Mode 4: Hostile Matrix &amp; Nemeses</a>
    <a href="crusade.html" class="suite-link">🏆 Mode 5: Crusade Quartermaster</a>
    <a href="briefing.html" class="suite-link">📜 Mode 6: Briefings, Ship &amp; Atlas</a>
    <a href="vox.html" class="suite-link">📡 Mode 7: Astropath Vox</a>
  </nav>

  <div class="app-shell">
    <div class="hero-banner">
      <h1>1v1 Ash Wastes Clash</h1>
      <p>Armageddon Crusade Mission Environment, Warp Anomalies &amp; Unbound Adversaries</p>
    </div>

    <!-- 1. HELLSCAPE GENERATOR -->
    <div class="card">
      <span class="badge">Planetary Environment • Hellscape</span>
      <h3>Active Armageddon Hellscape</h3>
      <div style="display:flex; gap:8px; margin-bottom:12px; flex-wrap:wrap;">
        <select id="hellscapeSelect" onchange="renderHellscape()" style="flex:1;">
          <option value="0">1 - Folded Space (Perilous Shortcuts)</option>
          <option value="1">2 - Fractured Realm (Empyric Fissures)</option>
          <option value="2">3 - Fading Reality (Phasing Cover &amp; Sight)</option>
          <option value="3">4 - Staggered Time (Odd/Even Round Objectives)</option>
          <option value="4">5 - Gravitic Nexus (Gravity Inversion Launch)</option>
          <option value="5">6 - Banishing Rifts (Daemon &amp; Warp Flux)</option>
        </select>
        <button onclick="rollRandomHellscape()">🎲 Roll D6</button>
      </div>
      <p id="hellscapeDesc" style="margin:0;"></p>
    </div>

    <!-- 2. WARP EVENT & ANOMALY TRACKER -->
    <div class="card purple">
      <span class="badge purple">Start of Battle Round • Warp Storm</span>
      <h3>Warp Event &amp; Anomaly Surge Roller</h3>
      <div style="display:flex; gap:8px; margin-bottom:12px; flex-wrap:wrap;">
        <select id="warpIntensity" onchange="savePvpState()">
          <option value="minor">Intensity: Minor (Surge on 5+)</option>
          <option value="major" selected>Intensity: Major (Surge on 4+)</option>
          <option value="catastrophic">Intensity: Catastrophic (Surge on 3+)</option>
        </select>
        <button class="btn-purple" onclick="rollWarpAnomaly()">⚡ Roll Battle Round Anomaly</button>
      </div>
      <div id="anomalyResultBox" class="stat-box" style="text-align:left;">
        <p style="margin:0;">Tap "Roll Battle Round Anomaly" at the start of each round to test for Warp Surges and Anomalies.</p>
      </div>
    </div>

    <!-- 3. UNBOUND ADVERSARIES (3RD ALLIANCE INTERFERENCE) -->
    <div class="card red">
      <span class="badge red">3rd Alliance Interference • Campaign Master Manifestation Pool</span>
      <h3>Unbound Adversaries AI Turn &amp; Vulture Tracker</h3>
      <p>At the start of each Battle Round, Unbound Adversaries take their turn (Move → Shoot → Charge → Fight closest player unit)[cite: 5]. While you two fight, the Campaign Master's 3rd Alliance vultures <strong>3 Strategic Points</strong> (+1 extra SPt if Unbound Adversaries destroy at least 1 player unit!).</p>
      
      <div class="grid-2" style="margin-bottom:12px;">
        <div class="stat-box">
          <div style="font-size:0.75rem; color:var(--muted);">3RD ALLIANCE VULTURE PTS</div>
          <div id="vulturePts" style="font-size:1.5rem; font-weight:800; color:var(--red);">3 SPts</div>
          <label style="font-size:0.8rem; cursor:pointer;">
            <input type="checkbox" id="vultureKillCheck" onchange="updateVulture()"> Destroyed a Player Unit (+1)
          </label>
        </div>
        <div class="stat-box">
          <div style="font-size:0.75rem; color:var(--muted);">SPAWN UNBOUND THREAT (PL 1–4)</div>
          <button class="btn-red" data-sfx="custom" style="margin-top:8px; width:100%;" onclick="rollUnboundAdversary()">🎲 Roll Adversary</button>
        </div>
      </div>
      <div id="unboundResult" class="stat-box" style="text-align:left;">
        <p style="margin:0;">Roll above to determine the Unbound Adversary Power Level (PL 1–4), or ping the Campaign Master on the Vox to reveal who emerges from the ash-storm.</p>
      </div>
    </div>

    <!-- 4. CAMPAIGN MASTER 3RD ALLIANCE VULTURE SPTS MATCH REPORT (SEPARATE FROM ADVERSARY ROLLER) -->
    <div class="card gold" style="border-left:4px solid var(--gold);">
      <span class="badge gold">Post-Match Telemetry • Separate from Adversary Roller</span>
      <h3>3rd Alliance Vulture SPts Match Report</h3>
      <p>At the conclusion of your 1v1 Ash Wastes clash, transmit this dedicated report to inform the <strong>Campaign Master</strong> how many Strategic Points his <strong>3rd Alliance (Marauders)</strong> vultured during the match (<strong>3 SPts</strong> base for Unbound Adversary interference, or <strong>4 SPts</strong> if an Unbound Adversary destroyed at least 1 player unit above).</p>

      <div class="grid-2" style="margin-bottom:12px;">
        <div>
          <label style="display:block; font-size:0.75rem; color:var(--muted); font-weight:700; text-transform:uppercase; margin-bottom:4px;">Reporting Commander Conduit</label>
          <select id="pvpReportChannel" onchange="updatePvpVulturePreview()" style="width:100%;">
            <option value="alpha">The Exile // Sanctuary of Ash (Alpha Conduit)</option>
            <option value="beta">Lord Commander Junebug (Beta Conduit)</option>
          </select>
        </div>
        <div>
          <label style="display:block; font-size:0.75rem; color:var(--muted); font-weight:700; text-transform:uppercase; margin-bottom:4px;">Vulture Massacre Bonus (+1 SPt)</label>
          <div class="stat-box" style="padding:8px 12px; display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:0.82rem; color:var(--text);">Campaign Master Gain:</span>
            <strong id="pvpReportSpBadge" style="color:var(--gold); font-size:1.05rem;">3 SPts</strong>
          </div>
        </div>
      </div>

      <label style="display:block; font-size:0.75rem; color:var(--muted); font-weight:700; text-transform:uppercase; margin-bottom:4px;">Vulture Interference &amp; Match Notes (Optional)</label>
      <textarea id="pvpReportNotes" oninput="updatePvpVulturePreview()" placeholder="Note which units the Unbound Adversaries harassed or destroyed, or how the 3rd Alliance capitalized on the clash..." style="width:100%; min-height:60px; background:#0b0d13; color:var(--text); border:1px solid var(--border); border-radius:8px; padding:10px; font-family:inherit; margin-bottom:10px;"></textarea>

      <div id="pvpVulturePreviewBox" class="stat-box vox-preview-alpha" style="text-align:left; font-family:monospace; font-size:0.78rem; white-space:pre-wrap; line-height:1.45; color:var(--gold); margin-bottom:12px;"></div>

      <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center;">
        <button type="button" class="btn-gold" data-sfx="custom" style="flex:1; padding:12px; font-weight:800;" onclick="transmitPvpVultureReport()">
          📡 Transmit 3rd Alliance Vulture SPts Report →
        </button>
        <button type="button" class="btn-ghost" style="padding:12px 16px;" onclick="resetPvpVultureReportForm()">
          🔄 Reset PvP Report
        </button>
      </div>
    </div>
  </div>

<script src="../js/pvp.js"></script>
<script src="../js/vox-audio.js"></script>
</body>
</html>
````

---

## File: `js/pvp.js` <a id="file-jspvpjs"></a>

````javascript
/**
 * @fileoverview Fires of Armageddon // 1v1 Ash Wastes PvP Module
 * Planetary Environment (Hellscape Generator), Warp Anomalies, Unbound Adversaries,
 * and 3rd Alliance Vulture Strategic Points reporting.
 */

var HELLSCAPES = [
  "<strong>Folded Space:</strong> Units wholly within 3\" of a battlefield edge can use a <em>Perilous Shortcut</em> to teleport to the opposite battlefield edge (>9\" from enemies), rolling 1D6: on a 1, suffer D3 mortal wounds.",
  "<strong>Fractured Realm:</strong> Reality cracks across No Man's Land. Units advancing or charging across objective markers must roll 1D6: on a 1, suffer D3 mortal wounds; on a 6, gain +2\" to the move.",
  "<strong>Fading Reality:</strong> Ranged attacks targeting units more than 18\" away suffer -1 to Hit as silhouettes flicker between realspace and the warp.",
  "<strong>Staggered Time:</strong> Temporal echoes distort objectives. In Odd Battle Rounds, Northern/Eastern NML objectives grant bonus VP; in Even Battle Rounds, Southern/Western NML objectives grant bonus VP.",
  "<strong>Gravitic Nexus:</strong> Units starting their Movement phase within range of an objective marker may trigger Gravity Inversion—gaining FLY and +3\" Move for that phase.",
  "<strong>Banishing Rifts:</strong> Units with Warp Counters or the DAEMON keyword re-roll Wound rolls of 1 while within No Man's Land, but suffer 1 mortal wound on unmodified save rolls of 1."
];

var HELLSCAPE_NAMES = [
  "Folded Space",
  "Fractured Realm",
  "Fading Reality",
  "Staggered Time",
  "Gravitic Nexus",
  "Banishing Rifts"
];

var ANOMALIES = [
  "<strong>Blood Rain of Khorne:</strong> All melee weapons across the battlefield gain [SUSTAINED HITS 1] until the end of the battle round.",
  "<strong>Empyric Backlash:</strong> Each unit with a Warp Counter or PSYKER keyword suffers D3 mortal wounds, then gains a 5+ Invulnerable Save this round.",
  "<strong>Ash Storm Blindness:</strong> All units gain the Stealth ability against ranged attacks made from more than 12\" away this round.",
  "<strong>Rift Eruption:</strong> Spawn 1 Unbound Adversary unit within 6\" of the center of the battlefield (>9\" from player units).",
  "<strong>Choruses of Madness:</strong> All units must subtract 1 from Battle-shock and Leadership tests until the end of the battle round.",
  "<strong>Warp-Surge Empowerment:</strong> Characters add +1 to the Attacks and Strength characteristics of their melee weapons this round."
];

var UNBOUND_UNITS = [
  "<strong>Lesser Daemons (Power Level 1):</strong> 10-model Infantry squad (32mm bases) — M6\" T4 Sv5+ Inv4+ W1 | 2A WS3+ S4 AP-1 D1.",
  "<strong>Abominations (Power Level 2):</strong> 2–4 model Infantry/Beast unit (50mm bases) — M8\" T5 Sv4+ FNP5+ W4 | D6+2A WS4+ S5 AP-1 D2.",
  "<strong>Daemonic Beasts (Power Level 3):</strong> 3–6 model Mounted/Beast unit (75mm/90mm oval bases) — M10\" T6 Sv4+ Inv4+ W4 | 4A WS3+ S6 AP-2 D2 (Lance).",
  "<strong>Greater Daemon / Roaming Nemesis (Power Level 4):</strong> Monster/Walker (100mm+ base) OR [CLASSIFIED APEX ANOMALY — ROLL 1D6 ON LEGACY VAULT]!"
];

var STORAGE_KEY_PVP = 'foa_pvp_state_v1';

/**
 * Saves current 1v1 PvP UI state to browser localStorage.
 */
function savePvpState() {
  if (typeof localStorage === 'undefined') return;
  var select = typeof document !== 'undefined' ? document.getElementById('hellscapeSelect') : null;
  if (!select) return;
  try {
    var data = {
      hellscapeIdx: parseInt(select.value, 10) || 0,
      warpIntensity: (document.getElementById('warpIntensity') && document.getElementById('warpIntensity').value) || 'major',
      anomalyHtml: (document.getElementById('anomalyResultBox') && document.getElementById('anomalyResultBox').innerHTML) || '',
      vultureKilled: !!(document.getElementById('vultureKillCheck') && document.getElementById('vultureKillCheck').checked),
      unboundHtml: (document.getElementById('unboundResult') && document.getElementById('unboundResult').innerHTML) || '',
      reportChannel: (document.getElementById('pvpReportChannel') && document.getElementById('pvpReportChannel').value) || 'alpha',
      reportNotes: (document.getElementById('pvpReportNotes') && document.getElementById('pvpReportNotes').value) || ''
    };
    localStorage.setItem(STORAGE_KEY_PVP, JSON.stringify(data));
  } catch (e) {
    console.warn('Could not save pvp state:', e);
  }
}

/**
 * Restores 1v1 PvP UI state from browser localStorage.
 */
function restorePvpState() {
  if (typeof localStorage === 'undefined') return;
  try {
    var raw = localStorage.getItem(STORAGE_KEY_PVP);
    if (!raw) {
      updatePvpVulturePreview(false);
      return;
    }
    var data = JSON.parse(raw);
    if (!data) return;

    if (typeof data.hellscapeIdx === 'number') {
      var el = document.getElementById('hellscapeSelect');
      if (el) el.value = String(data.hellscapeIdx);
      renderHellscape(false);
    }
    if (data.warpIntensity) {
      var elWarp = document.getElementById('warpIntensity');
      if (elWarp) elWarp.value = data.warpIntensity;
    }
    if (data.anomalyHtml) {
      var elAnom = document.getElementById('anomalyResultBox');
      if (elAnom) elAnom.innerHTML = data.anomalyHtml;
    }
    if (typeof data.vultureKilled === 'boolean') {
      var elKill = document.getElementById('vultureKillCheck');
      if (elKill) elKill.checked = data.vultureKilled;
      updateVulture(false);
    }
    if (data.unboundHtml) {
      var elUnbound = document.getElementById('unboundResult');
      if (elUnbound) elUnbound.innerHTML = data.unboundHtml;
    }
    if (data.reportChannel) {
      var elChan = document.getElementById('pvpReportChannel');
      if (elChan) elChan.value = data.reportChannel;
    }
    if (typeof data.reportNotes === 'string') {
      var elNotes = document.getElementById('pvpReportNotes');
      if (elNotes) elNotes.value = data.reportNotes;
    }
    updatePvpVulturePreview(false);
  } catch (e) {
    console.warn('Could not restore pvp state:', e);
  }
}

/**
 * Renders the active Hellscape description.
 * @param {boolean} [shouldSave=true]
 */
function renderHellscape(shouldSave) {
  if (shouldSave === undefined) shouldSave = true;
  if (typeof document === 'undefined') return;
  var sel = document.getElementById('hellscapeSelect');
  var idx = (sel && parseInt(sel.value, 10)) || 0;
  var desc = document.getElementById('hellscapeDesc');
  if (desc) desc.innerHTML = HELLSCAPES[idx] || HELLSCAPES[0];
  updatePvpVulturePreview(false);
  if (shouldSave) savePvpState();
}

/**
 * Rolls a random D6 Hellscape environment.
 */
function rollRandomHellscape() {
  if (typeof document === 'undefined') return;
  var idx = Math.floor(Math.random() * HELLSCAPES.length);
  var sel = document.getElementById('hellscapeSelect');
  if (sel) sel.value = String(idx);
  renderHellscape(true);
}

/**
 * Rolls for a Battle Round Warp Anomaly surge based on selected intensity.
 */
function rollWarpAnomaly() {
  if (typeof document === 'undefined') return;
  var intensityEl = document.getElementById('warpIntensity');
  var intensity = intensityEl ? intensityEl.value : 'major';
  var target = intensity === 'minor' ? 5 : (intensity === 'major' ? 4 : 3);
  var roll = Math.ceil(Math.random() * 6);
  var box = document.getElementById('anomalyResultBox');
  if (!box) return;

  if (roll >= target) {
    var anom = ANOMALIES[Math.floor(Math.random() * ANOMALIES.length)];
    box.innerHTML = '<span class="badge purple">Rolled ' + roll + ' (Needed ' + target + '+) • WARP SURGE!</span><p style="margin:0;">' + anom + '</p>';
  } else {
    box.innerHTML = '<span class="badge">Rolled ' + roll + ' (Needed ' + target + '+) • Reality Holds</span><p style="margin:0;">The empyric currents subside this round. No new Anomaly manifests.</p>';
  }
  updatePvpVulturePreview(false);
  savePvpState();
}

/**
 * Updates the 3rd Alliance Vulture SPts tally display.
 * @param {boolean} [shouldSave=true]
 */
function updateVulture(shouldSave) {
  if (shouldSave === undefined) shouldSave = true;
  if (typeof document === 'undefined') return;
  var check = document.getElementById('vultureKillCheck');
  var extra = (check && check.checked) ? 1 : 0;
  var totalStr = (3 + extra) + ' SPts';
  var ptsEl = document.getElementById('vulturePts');
  if (ptsEl) {
    ptsEl.innerText = totalStr;
    ptsEl.textContent = totalStr;
  }
  var badgeEl = document.getElementById('pvpReportSpBadge');
  if (badgeEl) badgeEl.textContent = totalStr;
  updatePvpVulturePreview(false);
  if (shouldSave) savePvpState();
}

/**
 * Pure functional core: compiles the 1v1 Ash Wastes 3rd Alliance Vulture SPts
 * Match Report from a plain state object without touching the DOM.
 *
 * @param {object} [input={}] - Plain Vulture report parameters.
 * @returns {string} Formatted teletype report payload for Astropathic Vox transmission.
 */
function compilePvpVultureReport(input) {
  input = input || {};
  var chan = input.channel || 'alpha';
  var isBeta = chan === 'beta';
  var cmdr = isBeta
    ? 'LORD COMMANDER JUNEBUG // TOMB-SHIP COMMAND INTERLINK'
    : 'THE EXILE // SANCTUARY OF ASH';
  var killedUnit = !!input.killedUnit;
  var totalSp = killedUnit ? 4 : 3;
  var breakdown = killedUnit
    ? 'Base Vulture Presence (+3 SPts) + Destroyed a Player Unit (+1 SPt) = 4 SPts'
    : 'Base Vulture Presence (+3 SPts) [No Player Unit Destroyed] = 3 SPts';
  var hellscapeIdx = Number.isInteger(input.hellscapeIdx) ? input.hellscapeIdx : (parseInt(input.hellscapeIdx, 10) || 0);
  var hellscapeName = HELLSCAPE_NAMES[hellscapeIdx] || HELLSCAPE_NAMES[0];
  var intensity = String(input.warpIntensity || input.intensity || 'major').toUpperCase();
  var notes = (input.notes || '').trim() || (isBeta
    ? '1v1 Ash Wastes clash concluded. Reporting 3rd Alliance Vulture Strategic Points to Tomb-Ship Master Matrix.'
    : '1v1 Ash Wastes clash concluded. Reporting 3rd Alliance Vulture Strategic Points to Campaign Master.');

  var headerBanner = isBeta
    ? '+++ TOMB-SHIP SENSOR SWEEP // 1V1 ASH WASTES VULTURE SPTS REPORT +++'
    : '+++ 1V1 ASH WASTES // 3RD ALLIANCE VULTURE SPTS REPORT +++';

  var logLabel = isBeta
    ? '• CANOPTEK SENSOR & INTERFERENCE LOG:'
    : '• VULTURE INTERFERENCE LOG:';

  var requestLine = isBeta
    ? 'REQUEST FOR TOMB-SHIP MASTER MATRIX & CAMPAIGN MASTER: Please record +' + totalSp + ' Strategic Points for the 3rd Alliance (Marauders) Global Scoreboard from this 1v1 Ash Wastes clash and chronicle how the vermin scavengers exploited our dynastic engagement!'
    : 'REQUEST FOR CAMPAIGN MASTER: Please credit +' + totalSp + ' Strategic Points to the 3rd Alliance (Marauders) Global Scoreboard from this 1v1 Ash Wastes engagement and chronicle how your scavenging forces exploited our clash!';

  return [
    headerBanner,
    '• REPORTING COMMANDER: ' + cmdr,
    '• CAMPAIGN MASTER (3RD ALLIANCE) VULTURED SPTS: ' + totalSp + ' SPts',
    '• VULTURE SPTS BREAKDOWN: ' + breakdown,
    '• ACTIVE HELLSCAPE & WARP INTENSITY: ' + hellscapeName + ' // Intensity: ' + intensity,
    '------------------------------------------------',
    logLabel + ' "' + notes + '"',
    '------------------------------------------------',
    requestLine
  ].join('\n');
}

/**
 * Humble View (Dumb UI) input reader: extracts current 1v1 Vulture report
 * form fields from the DOM into a plain data object.
 *
 * @returns {object} Plain input snapshot for compilePvpVultureReport.
 */
function readPvpVultureFormInputs() {
  if (typeof document === 'undefined') return {};
  var chanEl = document.getElementById('pvpReportChannel');
  var killEl = document.getElementById('vultureKillCheck');
  var hellEl = document.getElementById('hellscapeSelect');
  var warpEl = document.getElementById('warpIntensity');
  var notesEl = document.getElementById('pvpReportNotes');

  return {
    channel: (chanEl && chanEl.value) || 'alpha',
    killedUnit: !!(killEl && killEl.checked),
    hellscapeIdx: parseInt(hellEl ? hellEl.value : '0', 10) || 0,
    warpIntensity: (warpEl && warpEl.value) || 'major',
    notes: (notesEl && notesEl.value) || ''
  };
}

/**
 * Thin DOM-to-Core adapter that reads current Vulture report inputs and delegates
 * formatting to the pure compilePvpVultureReport functional core.
 *
 * @returns {string} Formatted teletype report payload for Astropathic Vox transmission.
 */
function buildPvpVultureReportString() {
  return compilePvpVultureReport(readPvpVultureFormInputs());
}

/**
 * Updates the live teletype preview box for the Vulture report.
 * @param {boolean} [shouldSave=true]
 */
function updatePvpVulturePreview(shouldSave) {
  if (shouldSave === undefined) shouldSave = true;
  if (typeof document === 'undefined') return;
  var box = document.getElementById('pvpVulturePreviewBox');
  var chanEl = document.getElementById('pvpReportChannel');
  var chan = (chanEl && chanEl.value) || 'alpha';
  if (box) {
    box.textContent = buildPvpVultureReportString();
    if (box.classList && typeof box.classList.toggle === 'function') {
      box.classList.toggle('vox-preview-beta', chan === 'beta');
      box.classList.toggle('vox-preview-alpha', chan !== 'beta');
    }
  }
  if (shouldSave) savePvpState();
}

/**
 * Transmits the 1v1 Vulture report to Astropathic Vox.
 */
function transmitPvpVultureReport() {
  if (typeof document === 'undefined') return;
  var chanEl = document.getElementById('pvpReportChannel');
  var chan = (chanEl && chanEl.value) || 'alpha';
  var payload = buildPvpVultureReportString();
  if (typeof window !== 'undefined' && window.VoxAudio && typeof window.VoxAudio.transmitToVox === 'function') {
    window.VoxAudio.transmitToVox(chan, payload);
  }
}

/**
 * Resets all 1v1 Ash Wastes 3rd Alliance Vulture SPts report fields and kill checkbox
 * back to their clean default state, updating the live preview and localStorage.
 */
function resetPvpVultureReportForm() {
  if (typeof document === 'undefined') return;
  var chanEl = document.getElementById('pvpReportChannel');
  var killEl = document.getElementById('vultureKillCheck');
  var notesEl = document.getElementById('pvpReportNotes');

  if (chanEl) chanEl.value = 'alpha';
  if (killEl) killEl.checked = false;
  if (notesEl) notesEl.value = '';

  if (typeof window !== 'undefined' && window.VoxAudio && typeof window.VoxAudio.playClank === 'function') {
    window.VoxAudio.playClank('card');
  }
  updateVulture(true);
}

/**
 * Transmits an Auspex Ping for an Unbound Adversary or Apex Anomaly to Vox.
 * @param {number} pl - Power Level (1 to 4)
 * @param {string} channel - 'alpha' | 'beta'
 */
function transmitUnboundPing(pl, channel) {
  if (typeof document === 'undefined') return;
  var warpEl = document.getElementById('warpIntensity');
  var intensity = (warpEl && warpEl.value) || 'major';
  var isBeta = channel === 'beta';
  var payload = pl === 4
    ? (isBeta
        ? '+++ EMERGENCY AUSPEX PING: POWER LEVEL 4 APEX ANOMALY DETECTED +++\n• CONDUIT: TOMB-SHIP QUANTUM AUSPEX [PHAERON JUNEBUG]\n• MODE: Mode 2 (1v1 Ash Wastes PvP // Warp Intensity: ' + intensity.toUpperCase() + ')\n• TRIGGER: Sub-crustal sensors registered a Power Level 4 [CLASSIFIED APEX ANOMALY] tearing into realspace!\n• REQUEST FOR TOMB-SHIP MASTER MATRIX: Execute the Contextual 3-Tier PL 4 Manifestation Roll (NEMESIS.md) and identify which apex entity emerges into No Man\'s Land!'
        : '+++ EMERGENCY AUSPEX PING: POWER LEVEL 4 APEX ANOMALY DETECTED +++\n• CONDUIT: MUNITORUM AUSPEX RELAY [THE EXILE // 044TH KRIEG]\n• MODE: Mode 2 (1v1 Ash Wastes PvP // Warp Intensity: ' + intensity.toUpperCase() + ')\n• TRIGGER: Rolled Power Level 4 [CLASSIFIED APEX ANOMALY] on Unbound Adversary Table!\n• REQUEST FOR CAMPAIGN MASTER: Please execute the Contextual 3-Tier PL 4 Manifestation Roll (NEMESIS.md) and reveal which entity emerges into No Man\'s Land!')
    : (isBeta
        ? '+++ AUSPEX PING: POWER LEVEL ' + pl + ' UNBOUND ADVERSARY DETECTED +++\n• CONDUIT: TOMB-SHIP QUANTUM AUSPEX [PHAERON JUNEBUG]\n• MODE: Mode 2 (1v1 Ash Wastes PvP // Warp Intensity: ' + intensity.toUpperCase() + ')\n• TRIGGER: Rolled Power Level ' + pl + ' on Unbound Adversary Table.\n• REQUEST FOR TOMB-SHIP MASTER MATRIX: Scan NEMESIS.md and identify the Power Level ' + pl + ' Unbound Adversary (or Active Surface Nemesis) entering the sector!'
        : '+++ AUSPEX PING: POWER LEVEL ' + pl + ' UNBOUND ADVERSARY DETECTED +++\n• CONDUIT: MUNITORUM AUSPEX RELAY [THE EXILE // 044TH KRIEG]\n• MODE: Mode 2 (1v1 Ash Wastes PvP // Warp Intensity: ' + intensity.toUpperCase() + ')\n• TRIGGER: Rolled Power Level ' + pl + ' on Unbound Adversary Table.\n• REQUEST FOR CAMPAIGN MASTER: Please roll/select our Power Level ' + pl + ' Unbound Adversary (or Active Surface Nemesis) from NEMESIS.md!');

  if (typeof window !== 'undefined' && window.VoxAudio && typeof window.VoxAudio.transmitToVox === 'function') {
    window.VoxAudio.transmitToVox(channel, payload);
  }
}

/**
 * Rolls for a random Unbound Adversary or Apex Anomaly and renders prompt with ping actions.
 */
function rollUnboundAdversary() {
  if (typeof document === 'undefined') return;
  var idx = Math.floor(Math.random() * UNBOUND_UNITS.length);
  var pl = idx + 1;
  var baseDesc = UNBOUND_UNITS[idx];

  if (typeof window !== 'undefined' && window.VoxAudio) {
    if (pl === 4 && window.VoxAudio.playWarpSiren) window.VoxAudio.playWarpSiren();
    else if (window.VoxAudio.playAuspexLock) window.VoxAudio.playAuspexLock();
  }

  var pingBanner = pl === 4
    ? '<div style="margin-top:12px; padding:12px 14px; background:rgba(255,71,87,0.14); border:1px solid var(--red); border-radius:8px; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; gap:8px;">' +
         '<div style="color:var(--red); font-weight:900; font-family:monospace; font-size:0.84rem; text-align:center;">' +
           '⚠️ [POWER LEVEL 4: CLASSIFIED APEX ANOMALY — CAMPAIGN MASTER ROLL REQUIRED]' +
         '</div>' +
         '<div style="display:flex; gap:8px; flex-wrap:wrap; justify-content:center; align-items:center;">' +
           '<button type="button" class="btn-red btn-sm" onclick="transmitUnboundPing(4, \'alpha\')">🦅 Ping Vox (The Exile)</button>' +
           '<button type="button" class="btn-green btn-sm" onclick="transmitUnboundPing(4, \'beta\')">💀 Ping Tomb-Ship (Junebug)</button>' +
         '</div>' +
       '</div>'
    : '<div style="margin-top:12px; padding:10px 14px; background:rgba(0,0,0,0.28); border:1px solid rgba(255,255,255,0.08); border-radius:8px; display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; gap:8px;">' +
         '<span style="font-size:0.78rem; color:var(--muted); text-align:center;">Want the Campaign Master to roll the specific PL ' + pl + ' threat on Vox?</span>' +
         '<div style="display:flex; gap:8px; flex-wrap:wrap; justify-content:center; align-items:center;">' +
           '<button type="button" class="btn-ghost btn-sm" onclick="transmitUnboundPing(' + pl + ', \'alpha\')">🦅 Ping Vox (The Exile)</button>' +
           '<button type="button" class="btn-green btn-sm" onclick="transmitUnboundPing(' + pl + ', \'beta\')">💀 Ping Tomb-Ship (Junebug)</button>' +
         '</div>' +
       '</div>';

  var unboundEl = document.getElementById('unboundResult');
  if (unboundEl) unboundEl.innerHTML = '<p style="margin:0;">' + baseDesc + '</p>' + pingBanner;
  savePvpState();
}

if (typeof window !== 'undefined') {
  window.HELLSCAPES = HELLSCAPES;
  window.HELLSCAPE_NAMES = HELLSCAPE_NAMES;
  window.ANOMALIES = ANOMALIES;
  window.UNBOUND_UNITS = UNBOUND_UNITS;
  window.STORAGE_KEY_PVP = STORAGE_KEY_PVP;
  window.savePvpState = savePvpState;
  window.restorePvpState = restorePvpState;
  window.renderHellscape = renderHellscape;
  window.rollRandomHellscape = rollRandomHellscape;
  window.rollWarpAnomaly = rollWarpAnomaly;
  window.updateVulture = updateVulture;
  window.compilePvpVultureReport = compilePvpVultureReport;
  window.readPvpVultureFormInputs = readPvpVultureFormInputs;
  window.buildPvpVultureReportString = buildPvpVultureReportString;
  window.updatePvpVulturePreview = updatePvpVulturePreview;
  window.transmitPvpVultureReport = transmitPvpVultureReport;
  window.resetPvpVultureReportForm = resetPvpVultureReportForm;
  window.transmitUnboundPing = transmitUnboundPing;
  window.rollUnboundAdversary = rollUnboundAdversary;

  if (typeof document !== 'undefined') {
    renderHellscape(false);
    restorePvpState();
    updatePvpVulturePreview(false);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    HELLSCAPES: HELLSCAPES,
    HELLSCAPE_NAMES: HELLSCAPE_NAMES,
    ANOMALIES: ANOMALIES,
    UNBOUND_UNITS: UNBOUND_UNITS,
    STORAGE_KEY_PVP: STORAGE_KEY_PVP,
    savePvpState: savePvpState,
    restorePvpState: restorePvpState,
    renderHellscape: renderHellscape,
    rollRandomHellscape: rollRandomHellscape,
    rollWarpAnomaly: rollWarpAnomaly,
    updateVulture: updateVulture,
    compilePvpVultureReport: compilePvpVultureReport,
    readPvpVultureFormInputs: readPvpVultureFormInputs,
    buildPvpVultureReportString: buildPvpVultureReportString,
    updatePvpVulturePreview: updatePvpVulturePreview,
    transmitPvpVultureReport: transmitPvpVultureReport,
    resetPvpVultureReportForm: resetPvpVultureReportForm,
    transmitUnboundPing: transmitUnboundPing,
    rollUnboundAdversary: rollUnboundAdversary
  };
}
````
