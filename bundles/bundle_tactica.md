# 📦 Fires of Armageddon // Bundle: In-Match LCT Tactical Console (3-Mode Progressive View & UI Tests)

Sticky Command Bar, 3-mode progressive panels (Horde Turn, Attack Horde, End Match), collapsed bottom drawers, and boundary UI tests (`pages/tactica.html`, `tests/ui/tactica.test.js`).

## 📑 Table of Contents
- [pages/tactica.html](#file-pagestacticahtml)
- [tests/ui/tactica.test.js](#file-testsuitacticatestjs)

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
  <style>
    .tactica-sticky-bar {
      position: sticky;
      top: 0;
      z-index: 40;
      background: rgba(11, 13, 19, 0.96);
      backdrop-filter: blur(8px);
      border: 1px solid var(--border);
      border-bottom: 2px solid var(--gold);
      border-radius: 10px;
      padding: 10px 12px;
      margin-bottom: 12px;
    }
    .tactica-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #111520;
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 4px 8px;
      font-size: 0.8rem;
    }
    .ptt-pill {
      cursor: pointer;
      border-color: rgba(245, 176, 65, 0.45);
      color: var(--gold);
      font-weight: 700;
      transition: all 0.15s ease;
    }
    .ptt-pill.ptt-active {
      background: rgba(255, 71, 87, 0.22);
      border-color: var(--red);
      color: #fff;
      box-shadow: 0 0 12px rgba(255, 71, 87, 0.45);
    }
    .tactica-mode-tabs {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
      margin-bottom: 12px;
    }
    .tactica-mode-btn.active {
      border-color: var(--gold);
      background: rgba(245, 176, 65, 0.16);
      color: var(--gold);
      font-weight: 800;
    }
    .horde-step-btn.active {
      border-color: var(--green);
      background: rgba(46, 204, 113, 0.16);
      color: #fff;
      font-weight: 700;
    }
  </style>
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
    <!-- 1. STICKY COMMAND BAR -->
    <div class="tactica-sticky-bar">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
        <div style="display:flex; align-items:center; flex-wrap:wrap; gap:6px;">
          <a href="spawner.html" class="btn-ghost btn-sm" style="text-decoration:none;">🧟 &larr; Mode 1 Spawner</a>
          <span class="tactica-pill"><strong>Room:</strong> <span id="tacticaRoomLabel">HADES-1</span></span>
          <select id="tacticaRoundSelect" style="padding:4px 8px; background:#0b0d13; font-size:0.8rem;" onchange="setConsolePhaseAndTrigger(document.getElementById('tacticaPhaseSelect').value)">
            <option value="1">Round 1</option><option value="2">Round 2</option><option value="3">Round 3</option>
            <option value="4">Round 4</option><option value="5">Round 5</option><option value="6">Round 6 (Final Stand)</option>
          </select>
          <select id="tacticaPhaseSelect" class="hidden" onchange="setConsolePhaseAndTrigger(this.value)">
            <option value="COMMAND_SPAWN">1. Command &amp; Wave Spawns</option>
            <option value="HORDE_MOVEMENT">2. Horde Movement</option>
            <option value="HORDE_SHOOTING">3. Horde Shooting</option>
            <option value="HORDE_CHARGE">4. Horde Charges</option>
            <option value="HORDE_FIGHT">5. Horde Fight &amp; Consolidate</option>
            <option value="PLAYER_TURN">6. Player Turn</option>
            <option value="ROUND_END">7. End of Round</option>
          </select>
          <span class="tactica-pill"><strong>Horde:</strong> <span id="tacticaFactionLabel" style="color:var(--gold);">Chaos Daemons</span></span>
          <span class="tactica-pill">
            <button type="button" class="btn-ghost btn-sm" style="padding:1px 6px;" onclick="adjustTacticaCp(-1)">&minus;</button>
            <strong id="tacticaCpLabel">2 CP / 0 SP</strong>
            <button type="button" class="btn-ghost btn-sm" style="padding:1px 6px;" onclick="adjustTacticaCp(1)">+</button>
          </span>
        </div>

        <div style="display:flex; align-items:center; flex-wrap:wrap; gap:6px;">
          <span id="pttStatusPill" class="tactica-pill ptt-pill" onclick="startPushToTalkMic()">🎙️ Hold [SPACE] or [V] to Talk</span>
          <button type="button" class="btn-ghost btn-sm" onclick="toggleTtsScreenCapture()">🖥️ Share TTS <span id="overwatchScreenStatus" style="font-size:0.74rem; color:var(--muted);">📷 Off</span></button>
          <button type="button" id="btnToggleOverwatchTts" class="btn-ghost btn-sm" onclick="toggleOverwatchVoiceOutput()">🔊 Auspex Voice: ON</button>
          <button type="button" class="btn-green btn-sm" onclick="syncFromSpawnerStorage()">🔄 Sync</button>
          <button type="button" class="btn-ghost btn-sm" onclick="refreshDaemonState()">📡 Poll</button>
        </div>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-top:8px; font-size:0.76rem; color:var(--muted);">
        <div id="tacticaDaemonBadge">🟡 Checking LCT Tactica Daemon...</div>
        <div>
          Warlord: <strong id="tacticaWarlordLabel" style="color:var(--text);">None Designated</strong> •
          LCT Queue: <strong id="tacticaQueueLabel" style="color:var(--text);">0 Queued</strong>
        </div>
      </div>

      <!-- Compact [ ⚡ Stratagem ] Drawer in Sticky Bar -->
      <details id="tacticaQuickStratDrawer" style="margin-top:8px; border-top:1px solid rgba(255,255,255,0.08); padding-top:6px;">
        <summary style="cursor:pointer; font-size:0.8rem; color:var(--gold); font-weight:700;">⚡ Quick Player Stratagem (or Hold [SPACE]/[V] &amp; speak "Stratagem Void Armour on Hearthguard, 1 CP")</summary>
        <div style="display:flex; gap:6px; flex-wrap:wrap; align-items:center; margin-top:8px;">
          <select id="quickStratCategorySelect" style="padding:5px 8px; background:#0b0d13; font-size:0.8rem;" onchange="toggleQuickStratCategory()">
            <option value="FACTION">Faction Stratagem</option>
            <option value="CORE">11th Ed Core Stratagem</option>
          </select>
          <input id="quickStratNameInput" placeholder="Stratagem Name (e.g. Void Armour)" style="padding:5px 8px; background:#0b0d13; min-width:190px; flex:1;">
          <select id="quickStratCoreSelect" class="hidden" style="padding:5px 8px; background:#0b0d13; min-width:190px; flex:1;">
            <option value="Fire Overwatch">Fire Overwatch (1 CP)</option>
            <option value="Smokescreen">Smokescreen (1 CP)</option>
            <option value="Go to Ground">Go to Ground (1 CP)</option>
            <option value="Heroic Intervention">Heroic Intervention (1 CP)</option>
            <option value="Counter-Offensive">Counter-Offensive (2 CP)</option>
            <option value="Rapid Ingress">Rapid Ingress (1 CP • R2+)</option>
            <option value="Command Re-roll">Command Re-roll (1 CP)</option>
            <option value="Crushing Impact">Crushing Impact (1 CP)</option>
            <option value="Explosives">Explosives (1 CP)</option>
            <option value="Insane Bravery">Insane Bravery (1 CP)</option>
            <option value="Epic Challenge">Epic Challenge (1 CP)</option>
          </select>
          <span style="font-size:0.8rem; color:var(--muted);">on</span>
          <select id="quickStratTargetSelect" style="padding:5px 8px; background:#0b0d13; font-size:0.8rem;">
            <option value="">(Any / Untargeted)</option>
          </select>
          <select id="quickStratDurationSelect" style="padding:5px 8px; background:#0b0d13; font-size:0.8rem;" title="99% of Stratagems last 1 Phase; select 1 Round for buffs lasting until your next Shooting phase / turn">
            <option value="PHASE">This Phase</option>
            <option value="ROUND">1 Round (Until Next Turn)</option>
          </select>
          <button type="button" class="btn-ghost btn-sm" onclick="triggerQuickStratagem(0)">0 CP</button>
          <button type="button" class="btn-red btn-sm" onclick="triggerQuickStratagem(1)">1 CP</button>
          <button type="button" class="btn-red btn-sm" onclick="triggerQuickStratagem(2)">2 CP</button>
        </div>
      </details>

      <div id="tacticaReactionBanner" class="card hidden" style="margin-top:8px; border-left:4px solid var(--gold); background:rgba(245,176,65,0.1);"></div>
    </div>

    <!-- 2. CONTEXTUAL POP-UP STRIP (HIDDEN WHEN IDLE) -->
    <div id="tacticaIntrusionAlertBox" class="card hidden" style="margin-bottom:12px; border-left:4px solid var(--red); background:rgba(255,71,87,0.12);"></div>

    <div id="tacticaPendingRollStrip" class="card hidden" style="margin-bottom:12px; border-left:4px solid var(--gold); background:rgba(245,176,65,0.08);">
      <div id="tacticaPendingRollBox" class="hidden"></div>
      <details style="margin-top:8px;">
        <summary style="cursor:pointer; font-size:0.8rem; color:var(--muted);">Offline Manual Pip Entry</summary>
        <div style="display:flex; gap:8px; margin-top:6px;">
          <input id="tacticaManualPipsInput" placeholder="Enter settled LCT mat pips (e.g. 5, 2, 4, 6)" style="flex:1; padding:6px 8px; background:#0b0d13;">
          <button type="button" class="btn-ghost btn-sm" onclick="submitSettledMatPips()">✓ Apply Settled Pips</button>
        </div>
      </details>
    </div>

    <!-- 3. 3-TAB PROGRESSIVE MODE SWITCHER -->
    <div class="tactica-mode-tabs">
      <button type="button" id="btnTacticaModeHorde" class="btn-ghost tactica-mode-btn active" onclick="switchTacticaMode('horde')">🧟 1. Horde Turn</button>
      <button type="button" id="btnTacticaModePlayer" class="btn-ghost tactica-mode-btn" onclick="switchTacticaMode('player')">🛡️ 2. Your Turn — Attack Horde</button>
      <button type="button" id="btnTacticaModeExport" class="btn-ghost tactica-mode-btn" onclick="switchTacticaMode('export')">🏆 3. End Match &amp; Export</button>
    </div>

    <!-- PANEL 1: HORDE TURN (DEFAULT VISIBLE) -->
    <div id="tacticaModeHorde" class="card" style="margin-bottom:14px;">
      <div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:10px;">
        <button type="button" id="hordeStepBtn1" class="btn-ghost btn-sm horde-step-btn active" onclick="setHordeTurnStep(1)">1. Spawn</button>
        <button type="button" id="hordeStepBtn2" class="btn-ghost btn-sm horde-step-btn" onclick="setHordeTurnStep(2)">2. Move &amp; LOS</button>
        <button type="button" id="hordeStepBtn3" class="btn-ghost btn-sm horde-step-btn" onclick="setHordeTurnStep(3)">3. Shoot</button>
        <button type="button" id="hordeStepBtn4" class="btn-ghost btn-sm horde-step-btn" onclick="setHordeTurnStep(4)">4. Charge &amp; Consolidate</button>
      </div>

      <div id="hordeStepPanel1" style="margin-bottom:10px;">
        <button type="button" class="btn-green" onclick="triggerAutopilotSpawnWaves()">🧟 Drop Wave Spawns onto LCT Playmat</button>
      </div>

      <div id="hordeStepPanel2" class="hidden" style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:10px;">
        <button type="button" class="btn-green" onclick="triggerAutopilotMovement()">🏃 Move Horde (Pre-LOS Preview)</button>
        <button type="button" class="btn-ghost" onclick="setConsolePhaseAndTrigger('HORDE_MOVEMENT', 'END_OF_HORDE_MOVEMENT')">✅ Lock Moves &amp; Check Overwatch</button>
      </div>

      <div id="hordeStepPanel3" class="hidden" style="margin-bottom:10px;">
        <button type="button" class="btn-red" onclick="triggerAutopilotShooting()">🎯 Compute Shooting Target Priority</button>
      </div>

      <div id="hordeStepPanel4" class="hidden" style="display:flex; gap:8px; flex-wrap:wrap; margin-bottom:10px;">
        <button type="button" class="btn-red" onclick="triggerAutopilotCharges()">⚡ Declare Charges (&le;12")</button>
        <button type="button" class="btn-ghost" onclick="triggerAutopilotConsolidate()">⚔️ 3" Consolidate</button>
      </div>

      <div id="tacticaAutopilotBox" style="background:#0b0d13; padding:10px; border-radius:8px; border:1px solid var(--border); font-size:0.84rem; color:var(--text);">
        Ready. Sync Mode 1 Session &amp; scan LCT board to pilot Horde waves automatically.
      </div>

      <!-- Contextual 3D LOS Bar (Visible inside Step 2 Move & LOS and Step 3 Shoot) -->
      <div id="tacticaLosBar" class="hidden" style="margin-top:10px; padding-top:10px; border-top:1px solid var(--border);">
        <div style="display:flex; gap:8px;">
          <input id="overwatchQueryInput" placeholder="Ask 3D Ruin LOS or type command (e.g. 'Can Screamer-Killer see Krieg behind central ruin?')" style="flex:1; padding:8px; background:#0b0d13;">
          <button type="button" class="btn-ghost btn-sm" onclick="dispatchSpokenOrTypedCommand(document.getElementById('overwatchQueryInput').value)">👁️ Verify 3D LOS</button>
        </div>
        <div id="overwatchVerdictBox" style="margin-top:8px; font-size:0.84rem; color:var(--text);"></div>
      </div>
    </div>

    <!-- PANEL 2: YOUR TURN — ATTACK HORDE (HIDDEN UNTIL CLICKED) -->
    <div id="tacticaModePlayer" class="card hidden" style="margin-bottom:14px;">
      <h3 style="margin-top:0;">🛡️ Attack Horde — Auto-Defender Saves &amp; FNP</h3>
      <div id="tacticaHordeTargetChips" style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:10px;"></div>

      <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(140px, 1fr)); gap:8px; margin-bottom:10px;">
        <label style="font-size:0.8rem; color:var(--muted);">Incoming Wounds
          <input id="defWoundsCountInput" type="number" placeholder="Incoming Wounds" value="4" style="width:100%; margin-top:4px; padding:8px; background:#0b0d13;">
        </label>
        <label style="font-size:0.8rem; color:var(--muted);">Weapon AP (e.g. -1)
          <input id="defApInput" type="number" placeholder="AP (e.g. -1)" value="-1" style="width:100%; margin-top:4px; padding:8px; background:#0b0d13;">
        </label>
        <label style="font-size:0.8rem; color:var(--muted);">Damage per Wound
          <input id="defDmgInput" type="number" placeholder="Damage" value="1" style="width:100%; margin-top:4px; padding:8px; background:#0b0d13;">
        </label>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:8px;">
        <button type="button" class="btn-red" onclick="queueConsoleAutoDefender()">🎲 Queue Saves &amp; FNP on LCT Mat</button>
      </div>

      <details id="defStatsOverrideDrawer" style="margin-top:8px;">
        <summary style="cursor:pointer; font-size:0.82rem; color:var(--muted);">⚙️ Override Scanned Yellowscribe Stats</summary>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(120px, 1fr)); gap:8px; margin-top:8px;">
          <input id="defUnitName" placeholder="Unit" value="Necron Warriors" style="padding:8px; background:#0b0d13;">
          <input id="defSaveInput" type="number" placeholder="Save (4)" value="4" style="padding:8px; background:#0b0d13;">
          <input id="defInvulnInput" type="number" placeholder="Invuln (0=None)" value="0" style="padding:8px; background:#0b0d13;">
          <input id="defWpmInput" type="number" placeholder="Wounds/Model" value="1" style="padding:8px; background:#0b0d13;">
          <input id="defKeywordsInput" placeholder="Keywords" value="INFANTRY" style="padding:8px; background:#0b0d13;">
          <input id="defModelsInput" type="number" placeholder="Models Alive" value="10" style="padding:8px; background:#0b0d13;">
        </div>
        <label style="display:inline-flex; align-items:center; gap:6px; margin-top:8px; font-size:0.84rem;">
          <input type="checkbox" id="defInSpawnCheck"> Unit in Spawn Zone (Cover + Hidden)
        </label>
      </details>

      <div id="defResultBox" style="margin-top:10px; font-size:0.88rem; color:var(--text);"></div>
    </div>

    <!-- PANEL 3: END MATCH & EXPORT (HIDDEN UNTIL CLICKED) -->
    <div id="tacticaModeExport" class="card hidden" style="margin-bottom:14px;">
      <h3 style="margin-top:0;">🏆 End Match — Export Crusade Telemetry &amp; Vox Chronicle</h3>
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
        <button type="button" class="btn-green" onclick="exportTacticaToCrusade()">🏆 Export Telemetry to Mode 5 Crusade &rarr;</button>
        <button type="button" class="launch-btn" style="flex:1; margin:0;" onclick="sendCompiledReportToVox()">📡 Queue Chronicle to Vox &rarr;</button>
      </div>
      <div id="tacticaCrusadeExportNotice" class="hidden" style="margin-top:8px; font-size:0.84rem; color:var(--green);"></div>
    </div>

    <!-- 4. COLLAPSED UTILITY DRAWERS AT BOTTOM -->
    <details id="tacticaBoardDrawer" class="card" style="margin-bottom:10px;">
      <summary style="cursor:pointer; font-weight:700;">🛰️ Scanned Board Units &amp; Side-Flipper (<span id="tacticaUnitCountSummary">0 Units</span>)</summary>
      <div style="display:flex; justify-content:flex-end; margin:8px 0;">
        <button type="button" class="btn-ghost btn-sm" onclick="requestTtsBoardScan()">📡 Request LCT Board Scan</button>
      </div>
      <div id="tacticaTelemetryBox" style="max-height:220px; overflow-y:auto; background:#0b0d13; padding:10px; border-radius:8px; border:1px solid var(--border);"></div>
    </details>

    <details id="tacticaChronicleDrawer" class="card">
      <summary style="cursor:pointer; font-weight:700;">📜 Match Chronicle Scribe (<span id="tacticaLatestLogSummary">Ready</span>)</summary>
      <div id="tacticaChronicleBox" style="max-height:220px; overflow-y:auto; background:#0b0d13; padding:10px; border-radius:8px; border:1px solid var(--border); margin:8px 0;"></div>
      <div style="display:flex; gap:8px;">
        <input id="tacticaNoteInput" placeholder="Log tactical event, LOS ruling, or heroic moment..." style="flex:1; padding:8px; background:#0b0d13;">
        <button type="button" class="btn-ghost" onclick="appendConsoleNote()">+ Log Event</button>
      </div>
    </details>
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

## File: `tests/ui/tactica.test.js` <a id="file-testsuitacticatestjs"></a>

````javascript
/**
 * @fileoverview UI & boundary tests for pages/tactica.html and js/tactica.js LCT mat workflow.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '../../');

test('UI Boundary: pages/tactica.html shares suite navigation and steps LCT mat rolls without local RNG', async () => {
  const html = fs.readFileSync(path.join(ROOT_DIR, 'pages/tactica.html'), 'utf8');
  assert.ok(html.includes('href="../index.html" class="suite-link'), 'Must include root index suite-link');
  assert.ok(html.includes('href="briefing.html" class="suite-link'), 'Must include briefing suite-link');
  assert.ok(html.includes('href="spawner.html"'), 'Sticky bar must include href="spawner.html" return button');
  assert.ok(html.includes('id="pttStatusPill"'), 'Sticky bar must include #pttStatusPill');
  assert.ok(html.includes('id="tacticaModeHorde"') && html.includes('id="tacticaModePlayer"') && html.includes('id="tacticaModeExport"'), 'Must include 3-mode progressive panels');
  assert.ok(html.includes('id="quickStratDurationSelect"'), 'Quick Stratagem drawer must include phase vs round duration selector');
  assert.ok(html.includes('id="tacticaBoardDrawer"') && html.includes('id="tacticaChronicleDrawer"'), 'Must include collapsed bottom utility drawers');
  assert.ok(html.includes('<link rel="icon" type="image/svg+xml" href="../assets/favicon.svg">'), 'Must link favicon');
  assert.ok(html.includes('<script src="../js/spawner.js"></script>'), 'Must link spawner.js');
  assert.ok(html.includes('<script src="../js/tts-telemetry-core.js"></script>'), 'Must link tts-telemetry-core.js');
  assert.ok(html.includes('<script src="../js/horde-autopilot-core.js"></script>'), 'Must link horde-autopilot-core.js');
  assert.ok(html.includes('<script src="../js/tactica-core.js"></script>'), 'Must link tactica-core.js');
  assert.ok(html.includes('<script src="../js/tactica.js"></script>'), 'Must link tactica.js');
  assert.ok(html.includes('<script src="../js/tactica-overwatch-core.js"></script>'), 'Must link tactica-overwatch-core.js');
  assert.ok(html.includes('<script src="../js/tactica-overwatch.js"></script>'), 'Must link tactica-overwatch.js');
  assert.ok(html.includes('<script src="../js/vox-audio.js"></script>'), 'Must link vox-audio.js');

  const luaPath = path.join(ROOT_DIR, 'tts/lct_horde_bridge.lua');
  assert.ok(fs.existsSync(luaPath), 'tts/lct_horde_bridge.lua must exist');
  const luaSrc = fs.readFileSync(luaPath, 'utf8');
  assert.ok(luaSrc.includes('/tts/poll'), 'Lua beacon must poll /tts/poll');
  assert.ok(luaSrc.includes('/tts/telemetry'), 'Lua beacon must post to /tts/telemetry');
  assert.ok(luaSrc.includes('/tts/dice-result'), 'Lua beacon must post settled dice to /tts/dice-result');
  assert.ok(luaSrc.includes('SPAWN_WAVE') && luaSrc.includes('REVERT_MOVE') && luaSrc.includes('SPAWN_GHOST_RING'), 'Lua beacon must support SPAWN_WAVE, REVERT_MOVE & SPAWN_GHOST_RING');
  assert.ok(luaSrc.includes('self.setRotation({ x = 0, y = rot.y, z = 0 })'), 'Lua beacon must force upright rotation on load');
  assert.ok(luaSrc.includes('buildContextMenu') && luaSrc.includes('addContextMenuItem') && luaSrc.includes('tagSelectionAsTemplate'), 'Lua beacon must register right-click context menu items including HORDE_TEMPLATE');
  assert.ok(luaSrc.includes('detectPlaymatBounds') && luaSrc.includes('playmatBounds'), 'Lua beacon must auto-detect LCT 44"x60" playmat bounds');
  assert.ok(luaSrc.includes('SET_UNIT_SIDE') && luaSrc.includes('executeSetUnitSide'), 'Lua beacon must support browser-driven SET_UNIT_SIDE command');
  assert.ok(luaSrc.includes('linkSelectionAsSquad') && luaSrc.includes('SQUAD:WAVE_') && luaSrc.includes('colorTint'), 'Lua beacon must stamp SQUAD tags on waves/manual links and export colorTint');
  assert.ok(luaSrc.includes('DISEMBARK_CARGO') && luaSrc.includes('EMBARKED:'), 'Lua beacon must support EMBARKED cargo tags and DISEMBARK_CARGO 3" drop');

  const spawnerHtml = fs.readFileSync(path.join(ROOT_DIR, 'pages/spawner.html'), 'utf8');
  assert.ok(spawnerHtml.includes('tactica.html'), 'spawner.html must link to pages/tactica.html');

  const spawner = require(path.join(ROOT_DIR, 'js/spawner.js'));
  const combat = require(path.join(ROOT_DIR, 'js/horde-combat-modifiers.js'));
  const telemetry = require(path.join(ROOT_DIR, 'js/tts-telemetry-core.js'));
  const autopilot = require(path.join(ROOT_DIR, 'js/horde-autopilot-core.js'));
  const overwatchCore = require(path.join(ROOT_DIR, 'js/tactica-overwatch-core.js'));
  const core = require(path.join(ROOT_DIR, 'js/tactica-core.js'));
  Object.assign(globalThis, spawner, combat, telemetry, autopilot, overwatchCore, core);

  const store = new Map();
  store.set('foa_horde_session_v1', JSON.stringify({
    seed: 'ASHEN-11',
    battleRound: 2,
    activeHordeFactionName: 'Necrons',
    cp: 2,
    sp: 8,
    activeMiseries: []
  }));

  const els = {};
  const makeEl = (val = '') => ({
    value: val,
    checked: false,
    textContent: '',
    innerHTML: '',
    style: {},
    classList: {
      _s: new Set(),
      add(c) { this._s.add(c); },
      remove(c) { this._s.delete(c); },
      toggle(c, f) { if (f === undefined ? !this._s.has(c) : f) this._s.add(c); else this._s.delete(c); },
      contains(c) { return this._s.has(c); }
    }
  });

  [
    'tacticaDaemonBadge', 'tacticaRoomLabel', 'tacticaFactionLabel', 'tacticaRoundSelect',
    'tacticaPhaseSelect', 'tacticaCpLabel', 'tacticaWarlordLabel', 'tacticaQueueLabel',
    'tacticaTelemetryBox', 'tacticaAutopilotBox', 'tacticaReactionBanner', 'tacticaPendingRollBox', 'tacticaManualPipsInput',
    'tacticaChronicleBox', 'tacticaNoteInput', 'defUnitName', 'defSaveInput', 'defInvulnInput',
    'defWpmInput', 'defKeywordsInput', 'defModelsInput', 'defWoundsCountInput', 'defApInput',
    'defDmgInput', 'defInSpawnCheck', 'defResultBox', 'tacticaReportChannel',
    'tacticaOutcomeInput', 'tacticaCompiledPreview',
    'overwatchScreenStatus', 'tacticaIntrusionAlertBox', 'btnToggleOverwatchTts',
    'overwatchQueryInput', 'overwatchVerdictBox', 'tacticaCrusadeExportNotice',
    'pttStatusPill', 'tacticaModeHorde', 'tacticaModePlayer', 'tacticaModeExport',
    'btnTacticaModeHorde', 'btnTacticaModePlayer', 'btnTacticaModeExport',
    'hordeStepPanel1', 'hordeStepPanel2', 'hordeStepPanel3', 'hordeStepPanel4',
    'hordeStepBtn1', 'hordeStepBtn2', 'hordeStepBtn3', 'hordeStepBtn4',
    'tacticaLosBar', 'tacticaHordeTargetChips', 'tacticaUnitCountSummary',
    'tacticaLatestLogSummary', 'tacticaPendingRollStrip', 'quickStratTargetSelect',
    'quickStratNameInput', 'quickStratCategorySelect', 'quickStratCoreSelect', 'quickStratDurationSelect'
  ].forEach(id => { els[id] = makeEl(); });

  els.defUnitName.value = 'Necron Warriors';
  els.defSaveInput.value = '4';
  els.defWpmInput.value = '1';
  els.defKeywordsInput.value = 'INFANTRY';
  els.defModelsInput.value = '10';
  els.defWoundsCountInput.value = '2';
  els.defApInput.value = '0';
  els.defDmgInput.value = '1';
  els.tacticaReportChannel.value = 'alpha';
  els.tacticaRoundSelect.value = '2';

  let voxQueued = null;
  let tacticaApexSirens = 0;
  let tacticaMidAlerts = 0;
  globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v))
  };
  globalThis.document = { getElementById: (id) => els[id] || null };
  globalThis.window = {
    addEventListener: () => {},
    VoxAudio: {
      playClank: () => {},
      playWarpSiren: () => { tacticaApexSirens++; },
      playUnboundBreachAlert: () => { tacticaMidAlerts++; },
      transmitToVox: (chan, text) => { voxQueued = { chan, text }; }
    }
  };
  globalThis.fetch = async () => { throw new Error('Offline'); };

  const tactica = require(path.join(ROOT_DIR, 'js/tactica.js'));
  const overwatch = require(path.join(ROOT_DIR, 'js/tactica-overwatch.js'));
  await tactica.syncFromSpawnerStorage();
  await tactica.refreshDaemonState();
  assert.ok(els.tacticaDaemonBadge.textContent.includes('OFFLINE'));

  // Reaction window & manual note offline fallback
  await tactica.setConsolePhaseAndTrigger('HORDE_MOVEMENT', 'END_OF_HORDE_MOVEMENT');
  assert.equal(els.tacticaReactionBanner.classList.contains('hidden'), false);
  await tactica.resolveConsoleReaction('FIRE_OVERWATCH', 1);
  assert.equal(els.tacticaReactionBanner.classList.contains('hidden'), true);

  els.tacticaNoteInput.value = 'Krieg squad held Eastern Bastion.';
  await tactica.appendConsoleNote();
  assert.ok(els.tacticaChronicleBox.innerHTML.includes('Eastern Bastion'));

  // Queue Auto-Defender -> pauses awaiting 2D6 Saves on LCT mat (does NOT roll in JS!)
  await tactica.queueConsoleAutoDefender();
  assert.ok(els.tacticaPendingRollBox.innerHTML.includes('SAVES'), 'Must display pending SAVES stage for LCT mat');

  // Feed settled pips [2, 5] -> 1 fail triggers FNP stage (5+)
  els.tacticaManualPipsInput.value = '2, 5';
  await tactica.submitSettledMatPips();
  assert.ok(els.tacticaPendingRollBox.innerHTML.includes('FNP'), 'Must advance to FNP stage');

  // Feed settled FNP pip [6] -> shrugged! Sequence completes with 0 slain
  els.tacticaManualPipsInput.value = '6';
  await tactica.submitSettledMatPips();
  assert.ok(els.defResultBox.innerHTML.includes('Slain: <strong style="color:var(--red);">0</strong>'));

  await tactica.compileAndPreviewMatchReport();
  tactica.sendCompiledReportToVox();
  assert.ok(voxQueued && voxQueued.text.includes('ASHEN-11'));

  // One-click Orbital Auspex Telemetry -> Auto-Defender population & Autopilot Move + LOS Revert
  tactica.getTacticaClientState().boardTelemetry = {
    objectives: [],
    units: [
      {
        squadKey: 'HORDE::Skorpekh',
        name: 'Skorpekh Destroyers',
        side: 'HORDE',
        modelCount: 3,
        move: 8,
        save: 3,
        invuln: 0,
        woundsPerModel: 3,
        pos: { x: 0, z: 14 },
        keywords: ['INFANTRY'],
        weapons: [{ name: 'Gauss Blaster', type: 'ranged', rangeInches: 24, attacks: 2, skill: 3, strength: 5, ap: -2, damage: 2, keywords: [] }],
        inSpawnZone: true,
        models: [{ guid: 'sk1', pos: { x: 0, y: 1.1, z: 14 }, radiusInches: 0.98 }]
      },
      {
        squadKey: 'PLAYER::Cadians',
        name: 'Cadian Shock Troops',
        side: 'PLAYER',
        modelCount: 10,
        toughness: 3,
        pos: { x: 0, z: 4 },
        keywords: ['INFANTRY'],
        models: [{ guid: 'cd1', pos: { x: 0, y: 1.1, z: 4 }, radiusInches: 0.55 }]
      }
    ]
  };
  tactica.getTacticaClientState().zoneSpawns = [
    { zone: 1, bracketKey: '5-6', units: ['10 Necron Warriors'] }
  ];
  await tactica.requestTtsBoardScan();
  assert.ok(els.tacticaTelemetryBox.innerHTML.includes('Skorpekh Destroyers'));
  assert.ok(
    els.tacticaTelemetryBox.innerHTML.includes('onclick="toggleTelemetryUnitSide(0)"') &&
    els.tacticaTelemetryBox.innerHTML.includes('⇄ Flip Side'),
    'Each telemetry row must render a 1-click ⇄ Flip Side button'
  );
  tactica.selectTelemetryUnitForDefense(0);
  assert.equal(els.defUnitName.value, 'Skorpekh Destroyers');
  assert.equal(els.defInSpawnCheck.checked, true);

  // Flip unit side HORDE -> PLAYER and back PLAYER -> HORDE
  await tactica.toggleTelemetryUnitSide(0);
  assert.equal(tactica.getTacticaClientState().boardTelemetry.units[0].side, 'PLAYER');
  await tactica.toggleTelemetryUnitSide(0);
  assert.equal(tactica.getTacticaClientState().boardTelemetry.units[0].side, 'HORDE');

  await tactica.triggerAutopilotSpawnWaves();
  assert.ok(els.tacticaAutopilotBox.innerHTML.includes('Queued 1 Spawn Zone wave drop'));

  await tactica.triggerAutopilotMovement();
  assert.ok(els.tacticaAutopilotBox.innerHTML.includes('Revert Move (No LOS)'));
  await tactica.revertAutopilotSquadMove(0);
  assert.ok(els.tacticaAutopilotBox.innerHTML.includes('Reverted'));

  await tactica.triggerAutopilotShooting();
  assert.ok(els.tacticaAutopilotBox.innerHTML.includes('Roll Attack on LCT Mat'));
  await tactica.fireAutopilotWeaponOnMat(0);
  assert.ok(els.tacticaPendingRollBox.innerHTML.includes('HITS'));
  tactica.getTacticaClientState().pendingDiceSequence = null;

  await tactica.triggerAutopilotCharges();
  assert.ok(els.tacticaPendingRollBox.innerHTML.includes('CHARGE_ROLL'));
  els.tacticaManualPipsInput.value = '5, 6';
  await tactica.submitSettledMatPips();
  assert.equal(tactica.getTacticaClientState().pendingChargeDecl, null);

  await tactica.triggerAutopilotConsolidate();
  assert.ok(els.tacticaAutopilotBox.innerHTML.includes('Skorpekh Destroyers'));

  // Step 6 Overwatch voice command dispatch, 6+ Intrusion Vox ping & Mode 5 Crusade export
  await tactica.setConsolePhaseAndTrigger('HORDE_MOVEMENT', 'END_OF_HORDE_MOVEMENT');
  assert.equal(els.tacticaReactionBanner.classList.contains('hidden'), false);
  await overwatch.dispatchSpokenOrTypedCommand('Pass window and hold CP');
  assert.equal(els.tacticaReactionBanner.classList.contains('hidden'), true);

  tactica.getTacticaClientState().zoneSpawns = [
    { zone: 2, waveId: 't_mid_1', bracketKey: '10-12', bracketLabel: 'Bracket [10–12]', intrusionRoll: 6, units: ['3 Skorpekh Destroyers'] }
  ];
  overwatch.syncOverwatchAlertsFromState();
  assert.equal(els.tacticaIntrusionAlertBox.classList.contains('hidden'), false);
  assert.equal(tacticaMidAlerts, 1, 'Tactica [10-12] 6+ breach must play playUnboundBreachAlert');
  assert.equal(tacticaApexSirens, 0, 'Tactica [10-12] 6+ breach must NOT play [13+] playWarpSiren');

  tactica.getTacticaClientState().zoneSpawns = [
    { zone: 1, waveId: 't_apex_1', bracketKey: '13+', bracketLabel: 'Bracket [13+]', intrusionRoll: 6, units: ['1 Monolith'] }
  ];
  overwatch.syncOverwatchAlertsFromState();
  assert.equal(els.tacticaIntrusionAlertBox.classList.contains('hidden'), false);
  assert.equal(tacticaApexSirens, 1, 'Tactica [13+] 6+ breach must play terrifying playWarpSiren');
  assert.equal(tacticaMidAlerts, 1, 'Tactica [13+] 6+ breach must not increment playUnboundBreachAlert');
  overwatch.pingIntrusionFromTactica(1, 'Bracket [13+]', 'alpha');
  assert.ok(voxQueued && voxQueued.chan === 'alpha' && voxQueued.text.includes('EMERGENCY AUSPEX PING'));

  const crusadeSnap = overwatch.exportTacticaToCrusade();
  assert.ok(crusadeSnap && crusadeSnap.roomSeed === 'ASHEN-11');
  assert.ok(store.has('foa_horde_battle_stats_v1'), 'Must write foa_horde_battle_stats_v1 to localStorage');
  assert.equal(els.tacticaCrusadeExportNotice.classList.contains('hidden'), false);

  assert.equal(overwatch.toggleOverwatchVoiceOutput(), false);
  assert.equal(els.btnToggleOverwatchTts.textContent.includes('MUTE'), true);
  assert.equal(overwatch.startPushToTalkMic(), false);
  assert.equal(await overwatch.toggleTtsScreenCapture(), false);
  await overwatch.dispatchSpokenOrTypedCommand('Can Skorpekh see Cadians behind central ruin?');
  assert.ok(els.overwatchVerdictBox.innerHTML.includes('offline'));

  // 3-Mode Progressive Switcher & Guided 4-Step Horde Sub-Bar
  assert.equal(typeof tactica.switchTacticaMode, 'function');
  tactica.switchTacticaMode('player');
  assert.equal(els.tacticaModeHorde.classList.contains('hidden'), true, 'switchTacticaMode("player") must hide #tacticaModeHorde');
  assert.equal(els.tacticaModePlayer.classList.contains('hidden'), false, 'switchTacticaMode("player") must reveal #tacticaModePlayer');
  assert.equal(els.tacticaModeExport.classList.contains('hidden'), true);

  tactica.switchTacticaMode('export');
  assert.equal(els.tacticaModePlayer.classList.contains('hidden'), true);
  assert.equal(els.tacticaModeExport.classList.contains('hidden'), false);

  tactica.switchTacticaMode('horde');
  tactica.setHordeTurnStep(1);
  assert.equal(els.tacticaLosBar.classList.contains('hidden'), true, 'LOS bar stays tucked in Step 1 (Spawn)');
  tactica.setHordeTurnStep(2);
  assert.equal(els.tacticaLosBar.classList.contains('hidden'), false, 'LOS bar reveals in Step 2 (Move & LOS)');

  // Hold-[Space] / [V] Push-to-Talk Hotkey (ignores INPUT/TEXTAREA/SELECT)
  let spacePrevented = false;
  overwatch.handlePttKeyDown({ code: 'Space', preventDefault: () => { spacePrevented = true; }, target: { tagName: 'INPUT' } });
  assert.equal(spacePrevented, false, 'handlePttKeyDown must ignore editable INPUT targets');
  assert.equal(els.pttStatusPill.classList.contains('ptt-active'), false);

  overwatch.handlePttKeyDown({ code: 'Space', preventDefault: () => { spacePrevented = true; }, target: { tagName: 'BODY' } });
  assert.equal(spacePrevented, true, 'handlePttKeyDown must activate PTT on BODY');
  assert.equal(els.pttStatusPill.classList.contains('ptt-active'), true);
  overwatch.handlePttKeyUp({ code: 'Space' });
  assert.equal(els.pttStatusPill.classList.contains('ptt-active'), false);

  // Spoken Player Stratagem fuzzy-matching & Mode 1 session sync
  tactica.getTacticaClientState().playerCp = 3;
  tactica.getTacticaClientState().boardTelemetry.units.push({
    squadKey: 'PLAYER::Einhyr Hearthguard',
    name: 'Einhyr Hearthguard',
    side: 'PLAYER',
    modelCount: 5,
    save: 2
  });
  await overwatch.dispatchSpokenOrTypedCommand('Stratagem Void Armour on Hearthguard, one CP');
  assert.equal(tactica.getTacticaClientState().playerCp, 2, 'Vocal stratagem must deduct 1 CP');
  assert.ok(els.tacticaChronicleBox.innerHTML.includes('Void Armour on Einhyr Hearthguard'), 'Must fuzzy-match scanned PLAYER unit name into chronicle');
  const syncedSession = JSON.parse(store.get('foa_horde_session_v1'));
  assert.equal(syncedSession.cp, 2, 'Updated CP must deduct 1 CP into foa_horde_session_v1');
  assert.equal(syncedSession.stratCount, 1, '1+ CP Stratagem must increment stratCount for Secret #20');

  // Vocal Smokescreen (-1 to Hit, PHASE default) worsens Horde LCT Mat Hit threshold (3+ -> 4+)
  // during HORDE_SHOOTING, then expires immediately in the SAME Round when advancing to HORDE_CHARGE!
  tactica.getTacticaClientState().playerCp = 3;
  tactica.getTacticaClientState().boardTelemetry.units = [
    {
      squadKey: 'HORDE::Armiger Helverin',
      name: 'Armiger Helverin',
      side: 'HORDE',
      modelCount: 1,
      pos: { x: 0, z: 12 },
      models: [{ guid: 'helv1', pos: { x: 0, z: 12 }, radiusInches: 1.95 }],
      weapons: [{ name: 'Armiger autocannon', type: 'ranged', rangeInches: 48, attacks: 4, skill: 3, strength: 9, ap: -1, damage: 3, keywords: [] }]
    },
    {
      squadKey: 'PLAYER::Einhyr Hearthguard',
      name: 'Einhyr Hearthguard',
      side: 'PLAYER',
      modelCount: 5,
      toughness: 6,
      save: 2,
      pos: { x: 0, z: -4 },
      models: [{ guid: 'hg1', pos: { x: 0, z: -4 }, radiusInches: 0.78 }]
    }
  ];
  await tactica.setConsolePhaseAndTrigger('HORDE_MOVEMENT');
  await overwatch.dispatchSpokenOrTypedCommand('Smokescreen on Hearthguard - 1cp');
  await tactica.triggerAutopilotShooting();
  const smokeSeq = await tactica.fireAutopilotWeaponOnMat(0);
  assert.ok(smokeSeq && smokeSeq.nextCommand, 'Must queue LCT mat Hit roll for Armiger Helverin -> Einhyr Hearthguard');
  assert.equal(smokeSeq.nextCommand.threshold, 4, 'Smokescreen (-1 to Hit) must worsen Armiger Helverin BS 3+ to 4+ on LCT mat');
  tactica.getTacticaClientState().pendingDiceSequence = null;

  // Advancing to HORDE_CHARGE in the SAME Round 2 must expire PHASE-scoped Smokescreen immediately!
  await tactica.setConsolePhaseAndTrigger('HORDE_CHARGE');
  assert.equal(
    (tactica.getTacticaClientState().activePlayerBuffs || []).length,
    0,
    '99% PHASE-scoped Smokescreen must expire as soon as HORDE_SHOOTING ends (entering HORDE_CHARGE in same round)'
  );

  // Round-oriented ("until next shooting phase") -1 to Hit buff declared in Round 2 PLAYER_TURN
  // must survive into Round 3 HORDE_SHOOTING (4+) and expire when Round 3 reaches PLAYER_TURN!
  await tactica.setConsolePhaseAndTrigger('PLAYER_TURN');
  await overwatch.dispatchSpokenOrTypedCommand('Smokescreen on Hearthguard until next shooting phase - 1cp');
  assert.equal((tactica.getTacticaClientState().activePlayerBuffs || []).length, 1);

  els.tacticaRoundSelect.value = '3';
  await tactica.setConsolePhaseAndTrigger('COMMAND_SPAWN');
  assert.equal(
    (tactica.getTacticaClientState().activePlayerBuffs || []).length,
    1,
    'ROUND-scoped ("until next shooting phase") buff declared in R2 PLAYER_TURN must survive advancing into Round 3'
  );
  await tactica.triggerAutopilotShooting();
  const r3ProtectedSeq = await tactica.fireAutopilotWeaponOnMat(0);
  assert.equal(r3ProtectedSeq.nextCommand.threshold, 4, 'Round-scoped buff from R2 PLAYER_TURN must worsen R3 Horde Shooting from 3+ to 4+');
  tactica.getTacticaClientState().pendingDiceSequence = null;

  // Entering Round 3 PLAYER_TURN expires the "until next shooting phase" buff so subsequent shooting returns to 3+
  await tactica.setConsolePhaseAndTrigger('PLAYER_TURN');
  assert.equal(
    (tactica.getTacticaClientState().activePlayerBuffs || []).length,
    0,
    'ROUND-scoped ("until next shooting phase") buff must expire once Round 3 enters PLAYER_TURN'
  );
  await tactica.triggerAutopilotShooting();
  const freshRoundSeq = await tactica.fireAutopilotWeaponOnMat(0);
  assert.equal(freshRoundSeq.nextCommand.threshold, 3, 'After Round 3 PLAYER_TURN expires buff, BS 3+ must roll 3+ on LCT mat');
  tactica.getTacticaClientState().pendingDiceSequence = null;

  // MVVM Humble View: Embarked Transport badge + 1-click Disembark (3") action
  tactica.getTacticaClientState().boardTelemetry.units = [
    {
      squadKey: 'HORDE::Corvus Blackstar',
      guid: 'corvus-mvvm-1',
      name: 'Corvus Blackstar',
      side: 'HORDE',
      modelCount: 1,
      save: 3,
      pos: { x: 4, z: 14 },
      models: [{ guid: 'corvus-mvvm-1', pos: { x: 4, z: 14 }, radiusInches: 2.0 }],
      embarkedCargo: [
        { count: 5, templateName: 'Kill Team' },
        { count: 1, templateName: 'Watch Master' }
      ],
      embarkedSummary: '5x Kill Team + 1x Watch Master'
    }
  ];
  await tactica.refreshDaemonState();
  assert.ok(
    els.tacticaTelemetryBox.innerHTML.includes('🚌 Embarked: 5x Kill Team + 1x Watch Master'),
    'Humble View must render Embarked cargo summary from ViewModel'
  );
  assert.ok(
    els.tacticaTelemetryBox.innerHTML.includes('disembarkTelemetryTransport(0)'),
    'Humble View must expose 1-click Disembark button when canDisembark is true'
  );
  assert.equal(typeof tactica.disembarkTelemetryTransport, 'function');
  const disembarkRes = await tactica.disembarkTelemetryTransport(0);
  assert.ok(disembarkRes && disembarkRes.action === 'DISEMBARK_CARGO');
  assert.deepEqual(tactica.getTacticaClientState().boardTelemetry.units[0].embarkedCargo, []);
  assert.equal(
    els.tacticaTelemetryBox.innerHTML.includes('disembarkTelemetryTransport(0)'),
    false,
    'Disembark button must disappear once cargo has disembarked'
  );
  assert.ok(els.tacticaChronicleBox.innerHTML.includes('Disembarked 5x Kill Team + 1x Watch Master'));

  delete globalThis.localStorage;
  delete globalThis.document;
  delete globalThis.window;
  delete globalThis.fetch;
});

````
