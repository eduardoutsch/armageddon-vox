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
