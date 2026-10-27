# 📦 Fires of Armageddon // Bundle: Mode 3 - Rogue Sector & AI Tracker

Complete source code for the autonomous AI Turn Sequencer and Rogue Sector impact reference (`pages/rogue.html`, `css/rogue.css`, `js/rogue.js`).

## 📑 Table of Contents
- [pages/rogue.html](#file-pagesroguehtml)
- [css/rogue.css](#file-cssroguecss)
- [js/rogue.js](#file-jsroguejs)

---

## File: `pages/rogue.html` <a id="file-pagesroguehtml"></a>

````html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fires of Armageddon // Rogue Sector &amp; AI Tracker</title>
  <link rel="icon" type="image/svg+xml" href="../assets/favicon.svg">
  <link rel="apple-touch-icon" href="../assets/favicon.svg">
  <link rel="stylesheet" href="../css/style.css">
  <link rel="stylesheet" href="../css/rogue.css">
</head>
<body>

  <nav class="suite-nav">
    <a href="../index.html" class="suite-link">📖 Field Codex &amp; Guide</a>
    <a href="spawner.html" class="suite-link">🧟 Mode 1: Horde Command &amp; Spawner</a>
    <a href="pvp.html" class="suite-link">⚔️ Mode 2: 1v1 Ash Wastes PvP</a>
    <a href="rogue.html" class="suite-link active">🎲 Mode 3: Rogue Sector &amp; AI Tracker</a>
    <a href="roster.html" class="suite-link">🎖️ Mode 4: Hostile Matrix &amp; Nemeses</a>
    <a href="crusade.html" class="suite-link">🏆 Mode 5: Crusade Quartermaster</a>
    <a href="briefing.html" class="suite-link">📜 Mode 6: Briefings, Ship &amp; Atlas</a>
    <a href="vox.html" class="suite-link">📡 Mode 7: Astropath Vox</a>
  </nav>

  <div class="app-shell">
    <div class="hero-banner">
      <h1>AI Flowchart &amp; Rogue Sector Reference</h1>
      <p>Step-by-Step Horde / Unbound Adversary Pilot &amp; Off-Roster Planetary Shifts</p>
    </div>

    <!-- 1. INTERACTIVE AI PHASE TRACKER -->
    <div class="card green">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <span class="badge green">Autonomous AI • Step-by-Step Pilot</span>
        <button class="btn-green" onclick="nextAiStep()" style="padding:6px 12px; font-size:0.8rem;">Next AI Phase →</button>
      </div>
      <h3>Horde &amp; Unbound Adversary AI Sequencer</h3>

      <div id="aiStep0" class="ai-step active-step">
        <div class="ai-step-title"><span>1. Movement &amp; Ingress Phase</span><span>[Active]</span></div>
        <p style="margin:0; font-size:0.86rem;">
          • <strong>Closest Target:</strong> Move towards the closest Player unit (or closest Objective if tied). Never stay in a Spawn Zone unless stationary shooting is required.<br>
          • <strong>Scouts Bonus:</strong> Units with <em>Scouts</em> that spawned this turn (and did not ingress) add their Scouts distance to their Move characteristic!<br>
          • <strong>Advance Logic:</strong> Advance if all weapons are [ASSAULT], if eligible to shoot/charge after advancing, or if out of shooting/charge range.<br>
          • <strong>Deep Strike Ingress (R2–R4):</strong> Set up >8" from enemy models, as close to a player unit as possible, and outside range of objectives.
        </p>
      </div>

      <div id="aiStep1" class="ai-step">
        <div class="ai-step-title"><span>2. Shooting Phase Target Priority</span><span></span></div>
        <p style="margin:0; font-size:0.86rem;">
          Each model shoots the <strong>closest legal target</strong>, except for these priority overrides:<br>
          • <strong>[ANTI-X] / [X HUNTER]:</strong> Targets the closest visible unit with the matching <em>X</em> keyword.<br>
          • <strong>[PRECISION]:</strong> Targets the closest visible unit with a Leader or Support model.<br>
          • <strong>[MELTA]:</strong> Targets the closest visible non-INFANTRY, non-SWARM unit.
        </p>
      </div>

      <div id="aiStep2" class="ai-step">
        <div class="ai-step-title"><span>3. Charge &amp; Fight Phase</span><span></span></div>
        <p style="margin:0; font-size:0.86rem;">
          • <strong>Charges:</strong> Declare a charge against the closest reachable Player unit(s).<br>
          • <strong>Splitting Melee Attacks:</strong> Each model attacks the closest Player model's unit in range.<br>
          • <strong>Consolidation:</strong> AI units <em>always</em> make consolidation moves towards the closest Player unit or objective if able.
        </p>
      </div>
    </div>

    <!-- 2. ROGUE BATTLE PLANETARY IMPACT REFERENCE -->
    <div class="card">
      <span class="badge">Rogue Sector Battles • Zero Roster Bloat</span>
      <h3>Planetary Consequences Reference</h3>
      <p>Off-roster Rogue Battles leave your Administratum Crusade rosters 100% untouched. Simply report the winner (and any heroic model that earned a Nemesis induction!) to the Campaign Master in chat:</p>

      <div class="impact-grid">
        <div class="impact-box" style="border-top:3px solid var(--gold);">
          <strong style="color:var(--gold);">🛡️ Imperium Victory</strong><br>
          Stabilizes sector: Next main game Warp Intensity drops to <em>Minor</em> (or -1 to 1st R1 Horde Spawn Roll) + <strong>1 SPt to Gatebreakers</strong>.
        </div>
        <div class="impact-box" style="border-top:3px solid var(--red);">
          <strong style="color:var(--red);">💀 Chaos Victory</strong><br>
          Widens breach: Next main game Warp Intensity escalates to <em>Catastrophic</em> (or triggers <em>Banishing Rifts</em>) + <strong>1 SPt to Desecrators</strong>.
        </div>
        <div class="impact-box" style="border-top:3px solid var(--purple);">
          <strong style="color:var(--purple);">⚔️ Xenos Victory</strong><br>
          Plunders vaults: Triggers <em>Gravitic Nexus</em> or <em>Staggered Time</em> Hellscape next main match + <strong>1 SPt to Marauders</strong>.
        </div>
      </div>
    </div>

    <!-- 3. ROGUE SECTOR BATTLE REPORT & ASTROPATHIC VOX TRANSMITTER -->
    <div class="card" style="border-left:4px solid var(--gold);">
      <div class="section-header" style="margin-top:0;">
        <h3>3. Rogue Sector Battle Report &amp; Astropathic Vox Transmitter</h3>
        <span class="hud-sub">Transmit Off-Roster Planetary Shifts Directly to the Campaign Master</span>
      </div>

      <div class="choice-grid" style="margin-bottom:12px;">
        <div>
          <label class="hud-label" style="display:block; margin-bottom:4px;">Reporting Commander Conduit</label>
          <select id="rogueReportChannel" onchange="updateRogueDossierPreview()" style="width:100%; padding:10px;">
            <option value="alpha">🦅 The Exile // Sanctuary of Ash (Terminal Alpha)</option>
            <option value="beta">💀 Lord Commander Junebug (Terminal Beta)</option>
          </select>
        </div>
        <div>
          <label class="hud-label" style="display:block; margin-bottom:4px;">Sector Theatre &amp; Combatants</label>
          <input type="text" id="rogueCombatants" oninput="updateRogueDossierPreview()" placeholder="e.g. Imperium (144th Krieg) vs Chaos (World Eaters)" style="width:100%; padding:10px;">
        </div>
      </div>

      <div class="choice-grid" style="margin-bottom:12px;">
        <div>
          <label class="hud-label" style="display:block; margin-bottom:4px;">Rogue Battle Outcome</label>
          <select id="rogueOutcome" onchange="updateRogueDossierPreview()" style="width:100%; padding:10px;">
            <option value="Imperium Victory">🛡️ Imperium Victory (+1 SPt Gatebreakers • Warp Drops to Minor)</option>
            <option value="Chaos Victory">💀 Chaos Victory (+1 SPt Desecrators • Warp Escalates to Catastrophic)</option>
            <option value="Xenos Victory">⚔️ Xenos Victory (+1 SPt Marauders • Triggers Vault Plunder Hellscape)</option>
            <option value="Contested Draw">⚖️ Contested Draw / Stalemate (Zero Planetary Shift)</option>
          </select>
        </div>
        <div>
          <label class="hud-label" style="display:block; margin-bottom:4px;">Nemesis Induction Nominee (Optional)</label>
          <input type="text" id="rogueNemesisNominee" oninput="updateRogueDossierPreview()" placeholder="e.g. Khorne Champion 'Vorgh the Flayed' (Wiped squad solo)" style="width:100%; padding:10px;">
        </div>
      </div>

      <label class="hud-label" style="display:block; margin-bottom:4px;">Eye-Witness Combat Log / Highlights</label>
      <textarea id="rogueNotes" oninput="updateRogueDossierPreview()" placeholder="Describe key heroic moments, tragic unit wipes, or notable engagements during this auxiliary battle..." style="width:100%; min-height:70px; background:#0b0d13; color:var(--text); border:1px solid var(--border); border-radius:8px; padding:10px; font-family:inherit;"></textarea>

      <!-- LIVE DOSSIER PREVIEW -->
      <div class="master-dossier-preview vox-preview-alpha" id="rogueDossierPreviewBox" style="margin-top:10px;"></div>

      <div style="display:flex; gap:10px; flex-wrap:wrap; align-items:center; margin-top:12px;">
        <button type="button" class="launch-btn" style="flex:1; margin:0;" data-sfx="custom" onclick="transmitRogueDossier()">
          📡 Transmit Rogue Sector Report via Astropathic Vox →
        </button>
        <button type="button" class="btn-ghost" onclick="resetRogueDossierForm()">
          🔄 Reset Rogue Report
        </button>
      </div>
    </div>

  </div>

<script src="../js/rogue.js"></script>
<script src="../js/vox-audio.js"></script>
</body>
</html>
````

---

## File: `css/rogue.css` <a id="file-cssroguecss"></a>

````css
/* =========================================================================
   FIRES OF ARMAGEDDON // ROGUE SECTOR & AI TRACKER STYLES
   Modular styling for pages/rogue.html
   ========================================================================= */

.master-dossier-preview {
  background: #030805;
  border: 1.5px dashed rgba(0, 255, 136, 0.45);
  border-radius: 10px;
  padding: 15px;
  font-family: 'Courier New', Consolas, monospace;
  font-size: 0.84rem;
  color: #66ffb8;
  text-shadow: 0 0 6px rgba(0, 255, 136, 0.35);
  white-space: pre-wrap;
  line-height: 1.52;
  margin: 14px 0;
}
````

---

## File: `js/rogue.js` <a id="file-jsroguejs"></a>

````javascript
/**
 * @fileoverview Fires of Armageddon // Rogue Sector & AI Tracker Logic
 * Step-by-Step Horde / Unbound Adversary Phase Pilot &
 * Mode 3 Rogue Sector Auxiliary Battle Dossier compilation.
 */

var STORAGE_KEY_ROGUE = 'foa_rogue_state_v1';
var currentAiStep = 0;

/**
 * Declarative lookup table mapping Rogue Sector battle outcomes to their
 * planetary consequences and Alliance Hegemony Strategic Point shifts.
 */
var ROGUE_OUTCOME_IMPACTS = {
  'Imperium Victory': {
    planetaryImpact: 'Stabilizes sector: Next main game Warp Intensity drops to Minor (or -1 to 1st R1 Horde Spawn Roll)',
    hegemonyImpact: '+1 SPt to Gatebreakers'
  },
  'Chaos Victory': {
    planetaryImpact: 'Widens breach: Next main game Warp Intensity escalates to Catastrophic (or triggers Banishing Rifts)',
    hegemonyImpact: '+1 SPt to Desecrators'
  },
  'Xenos Victory': {
    planetaryImpact: 'Plunders vaults: Triggers Gravitic Nexus or Staggered Time Hellscape next main match',
    hegemonyImpact: '+1 SPt to Marauders'
  },
  'Contested': {
    planetaryImpact: 'Contested / Stalemate: Zero planetary shift on next main engagement',
    hegemonyImpact: 'Zero SPt shift (Contested)'
  }
};

/**
 * Pure functional core: compiles a Mode 3 Rogue Sector Battle Report string
 * from a plain state object without touching the DOM.
 *
 * @param {object} [input={}] - Plain Rogue Sector battle report parameters.
 * @returns {string} Formatted teletype dossier string.
 */
function compileRogueDossier(input) {
  input = input || {};
  var chan = input.channel || 'alpha';
  var isBeta = chan === 'beta';
  var cmdr = isBeta
    ? 'LORD COMMANDER JUNEBUG // TOMB-SHIP QUANTUM INTERCEPT'
    : 'THE EXILE // SANCTUARY OF ASH';

  var subHeader = isBeta
    ? '• TELEMETRY SOURCE: SUB-CRUSTAL DOLMEN & QUANTUM AUGUR ARRAY [NECRON DYNASTY]'
    : '• TELEMETRY SOURCE: MUNITORUM LONG-RANGE SEISMOGRAPH & AUGUR RELAY [ASTRA MILITARUM]';

  var requestLine = isBeta
    ? 'REQUEST FOR TOMB-SHIP MASTER MATRIX & CAMPAIGN MASTER: Please emit a Dual-Channel Black-Box Interstitial Recording (Pattern 2 + Pattern 5) logging this Rogue Sector battle\'s planetary shift on our next engagement, crediting the winning Alliance Hegemony SPt (+1 SPt), and indexing any nominated hostile specimen!'
    : 'REQUEST FOR CAMPAIGN MASTER: Please emit an Astropathic Vox Decree (Pattern 2 + Pattern 5) logging this Rogue Sector battle\'s planetary consequence on the next engagement, crediting the winning Alliance Hegemony SPt (+1 SPt), and reviewing any nominated hostile entity for induction into the Cross-Mode Nemesis Ledger!';

  var combatants = (input.combatants || '').trim() || 'Auxiliary Forces (Unspecified Factions)';
  var outcome = input.outcome || 'Imperium Victory';
  var nominee = (input.nominee || '').trim();
  var notes = (input.notes || '').trim() || 'Auxiliary clash concluded in the disputed zone. Awaiting Campaign Master chronicle.';

  var matchedKey = Object.keys(ROGUE_OUTCOME_IMPACTS).find(function(key) {
    return outcome.indexOf(key) !== -1;
  }) || 'Contested';
  var impact = ROGUE_OUTCOME_IMPACTS[matchedKey];
  var planetaryImpact = impact.planetaryImpact;
  var hegemonyImpact = impact.hegemonyImpact;

  var headerBanner = isBeta
    ? '+++ TOMB-SHIP QUANTUM SURVEILLANCE // ROGUE SECTOR AUXILIARY BATTLE REPORT +++'
    : '+++ ROGUE SECTOR AUXILIARY BATTLE REPORT +++';

  var logLabel = isBeta
    ? '• CANOPTEK SENSOR OVERVIEW & ENGRAMMATIC LOG:'
    : '• EYE-WITNESS COMBAT LOG:';

  var lines = [
    headerBanner,
    '• REPORTING COMMANDER: ' + cmdr,
    subHeader,
    '• THEATRE & COMBATANTS: ' + combatants,
    '• BATTLE OUTCOME: ' + outcome,
    '• PLANETARY SHIFT: ' + planetaryImpact,
    '• ALLIANCE HEGEMONY IMPACT: ' + hegemonyImpact
  ];

  if (nominee) {
    var nomLabel = isBeta ? '• SPECIMEN TARGETING NOMINEE:' : '• NEMESIS INDUCTION NOMINEE:';
    lines.push(nomLabel + ' ' + nominee);
  }

  lines.push(
    '------------------------------------------------',
    logLabel + ' "' + notes + '"',
    '------------------------------------------------',
    requestLine
  );

  return lines.join('\n');
}

/**
 * Humble View (Dumb UI) input reader: extracts current Rogue Sector form fields
 * from the DOM into a plain data object.
 *
 * @returns {object} Plain input snapshot for compileRogueDossier.
 */
function readRogueFormInputs() {
  if (typeof document === 'undefined') return {};
  var chanEl = document.getElementById('rogueReportChannel');
  var combEl = document.getElementById('rogueCombatants');
  var outEl = document.getElementById('rogueOutcome');
  var nomEl = document.getElementById('rogueNemesisNominee');
  var notesEl = document.getElementById('rogueNotes');

  return {
    channel: (chanEl && chanEl.value) || 'alpha',
    combatants: (combEl && combEl.value) || '',
    outcome: (outEl && outEl.value) || 'Imperium Victory',
    nominee: (nomEl && nomEl.value) || '',
    notes: (notesEl && notesEl.value) || ''
  };
}

/**
 * Thin DOM-to-Core adapter that reads current form inputs and delegates
 * formatting to the pure compileRogueDossier functional core.
 *
 * @returns {string} Formatted teletype dossier string.
 */
function buildRogueDossierString() {
  return compileRogueDossier(readRogueFormInputs());
}

/**
 * Updates the live teletype preview box for the Rogue Sector report.
 */
function updateRogueDossierPreview() {
  if (typeof document === 'undefined') return;
  var box = document.getElementById('rogueDossierPreviewBox');
  var chanEl = document.getElementById('rogueReportChannel');
  var chan = (chanEl && chanEl.value) || 'alpha';
  if (box) {
    box.textContent = buildRogueDossierString();
    if (box.classList && typeof box.classList.toggle === 'function') {
      box.classList.toggle('vox-preview-beta', chan === 'beta');
      box.classList.toggle('vox-preview-alpha', chan !== 'beta');
    }
  }
  saveRogueState();
}

/**
 * Transmits the Rogue Sector Battle Report to Astropathic Vox.
 */
function transmitRogueDossier() {
  if (typeof document === 'undefined') return;
  var chanEl = document.getElementById('rogueReportChannel');
  var chan = (chanEl && chanEl.value) || 'alpha';
  var payload = buildRogueDossierString();
  if (typeof window !== 'undefined' && window.VoxAudio && typeof window.VoxAudio.transmitToVox === 'function') {
    window.VoxAudio.transmitToVox(chan, payload);
  }
}

/**
 * Resets all Rogue Sector Battle Report form fields back to their clean default state
 * and refreshes the live dossier preview and persisted localStorage state.
 */
function resetRogueDossierForm() {
  if (typeof document === 'undefined') return;
  var chanEl = document.getElementById('rogueReportChannel');
  var combEl = document.getElementById('rogueCombatants');
  var outEl = document.getElementById('rogueOutcome');
  var nomEl = document.getElementById('rogueNemesisNominee');
  var notesEl = document.getElementById('rogueNotes');

  if (chanEl) chanEl.value = 'alpha';
  if (combEl) combEl.value = '';
  if (outEl) outEl.value = 'Imperium Victory';
  if (nomEl) nomEl.value = '';
  if (notesEl) notesEl.value = '';

  if (typeof window !== 'undefined' && window.VoxAudio && typeof window.VoxAudio.playClank === 'function') {
    window.VoxAudio.playClank('card');
  }
  updateRogueDossierPreview();
}

/**
 * Saves current Rogue Sector and AI Sequencer UI state to browser localStorage.
 */
function saveRogueState() {
  if (typeof localStorage === 'undefined') return;
  if (typeof document !== 'undefined' && !document.getElementById('aiStep0')) return;
  try {
    var chanEl = document.getElementById('rogueReportChannel');
    var combEl = document.getElementById('rogueCombatants');
    var outEl = document.getElementById('rogueOutcome');
    var nomEl = document.getElementById('rogueNemesisNominee');
    var notesEl = document.getElementById('rogueNotes');

    var data = {
      currentAiStep: currentAiStep,
      reportChannel: (chanEl && chanEl.value) || 'alpha',
      combatants: (combEl && combEl.value) || '',
      outcome: (outEl && outEl.value) || 'Imperium Victory',
      nemesisNominee: (nomEl && nomEl.value) || '',
      notes: (notesEl && notesEl.value) || ''
    };
    localStorage.setItem(STORAGE_KEY_ROGUE, JSON.stringify(data));
  } catch (e) {
    console.warn('Could not save rogue state:', e);
  }
}

/**
 * Restores Rogue Sector state from browser localStorage.
 */
function restoreRogueState() {
  if (typeof localStorage === 'undefined') return;
  try {
    var raw = localStorage.getItem(STORAGE_KEY_ROGUE);
    if (!raw) {
      updateRogueDossierPreview();
      return;
    }
    var data = JSON.parse(raw);
    if (data) {
      if (typeof data.currentAiStep === 'number') {
        setAiStep(data.currentAiStep, false);
      }
      var chanEl = document.getElementById('rogueReportChannel');
      if (data.reportChannel && chanEl) chanEl.value = data.reportChannel;
      var combEl = document.getElementById('rogueCombatants');
      if (data.combatants && combEl) combEl.value = data.combatants;
      var outEl = document.getElementById('rogueOutcome');
      if (data.outcome && outEl) outEl.value = data.outcome;
      var nomEl = document.getElementById('rogueNemesisNominee');
      if (data.nemesisNominee && nomEl) nomEl.value = data.nemesisNominee;
      var notesEl = document.getElementById('rogueNotes');
      if (data.notes && notesEl) notesEl.value = data.notes;
    }
    updateRogueDossierPreview();
  } catch (e) {
    console.warn('Could not restore rogue state:', e);
  }
}

/**
 * Sets the active AI Phase step index (0 = Movement, 1 = Shooting, 2 = Charge/Fight).
 * @param {number} step
 * @param {boolean} [shouldSave=true]
 */
function setAiStep(step, shouldSave) {
  if (shouldSave === undefined) shouldSave = true;
  currentAiStep = step;
  if (typeof document !== 'undefined') {
    [0, 1, 2].forEach(function(i) {
      var el = document.getElementById('aiStep' + i);
      if (el && el.classList) {
        el.classList.toggle('active-step', i === currentAiStep);
        var span = el.querySelector('.ai-step-title span:last-child');
        if (span) span.innerText = (i === currentAiStep) ? '[Active]' : '';
      }
    });
  }
  if (shouldSave) saveRogueState();
}

/**
 * Advances to the next AI Phase step cyclically.
 */
function nextAiStep() {
  setAiStep((currentAiStep + 1) % 3);
}

if (typeof window !== 'undefined') {
  window.STORAGE_KEY_ROGUE = STORAGE_KEY_ROGUE;
  window.ROGUE_OUTCOME_IMPACTS = ROGUE_OUTCOME_IMPACTS;
  window.compileRogueDossier = compileRogueDossier;
  window.readRogueFormInputs = readRogueFormInputs;
  window.buildRogueDossierString = buildRogueDossierString;
  window.updateRogueDossierPreview = updateRogueDossierPreview;
  window.transmitRogueDossier = transmitRogueDossier;
  window.resetRogueDossierForm = resetRogueDossierForm;
  window.saveRogueState = saveRogueState;
  window.restoreRogueState = restoreRogueState;
  window.setAiStep = setAiStep;
  window.nextAiStep = nextAiStep;

  if (typeof document !== 'undefined') {
    restoreRogueState();
  }

  if (typeof window.addEventListener === 'function') {
    window.addEventListener('DOMContentLoaded', restoreRogueState);
    window.addEventListener('vox:page-swapped', function() {
      if (document.getElementById('aiStep0')) restoreRogueState();
    });
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    STORAGE_KEY_ROGUE: STORAGE_KEY_ROGUE,
    ROGUE_OUTCOME_IMPACTS: ROGUE_OUTCOME_IMPACTS,
    compileRogueDossier: compileRogueDossier,
    readRogueFormInputs: readRogueFormInputs,
    buildRogueDossierString: buildRogueDossierString,
    updateRogueDossierPreview: updateRogueDossierPreview,
    transmitRogueDossier: transmitRogueDossier,
    resetRogueDossierForm: resetRogueDossierForm,
    saveRogueState: saveRogueState,
    restoreRogueState: restoreRogueState,
    setAiStep: setAiStep,
    nextAiStep: nextAiStep,
    getCurrentAiStep: function() { return currentAiStep; }
  };
}
````
