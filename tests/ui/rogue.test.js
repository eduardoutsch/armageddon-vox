const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '../../');
const ROGUE_HTML_PATH = path.join(ROOT_DIR, 'pages/rogue.html');

// Read rogue.html and extract script block
const rogueHtml = fs.readFileSync(ROGUE_HTML_PATH, 'utf8');
const scriptMatches = rogueHtml.match(/<script>([\s\S]*?)<\/script>/);
assert.ok(scriptMatches && scriptMatches[1], 'Must locate script tag inside pages/rogue.html');
const rogueScriptCode = scriptMatches[1];

// Set up mock DOM and localStorage environment
const storageStore = new Map();
globalThis.localStorage = {
  getItem: (k) => (storageStore.has(k) ? storageStore.get(k) : null),
  setItem: (k, v) => storageStore.set(k, String(v)),
  removeItem: (k) => storageStore.delete(k),
  clear: () => storageStore.clear()
};

function createMockAiStep() {
  const span = { innerText: '' };
  return {
    classList: {
      classes: new Set(),
      toggle(cls, cond) {
        if (cond) this.classes.add(cls);
        else this.classes.delete(cls);
      },
      contains(cls) { return this.classes.has(cls); }
    },
    querySelector: (sel) => (sel.includes('span:last-child') ? span : null),
    span
  };
}

let transmittedChannel = null;
let transmittedPayload = null;

globalThis.window = {
  addEventListener: () => {},
  removeEventListener: () => {},
  VoxAudio: {
    transmitToVox: (chan, payload) => {
      transmittedChannel = chan;
      transmittedPayload = payload;
    }
  }
};

const mockElements = {
  aiStep0: createMockAiStep(),
  aiStep1: createMockAiStep(),
  aiStep2: createMockAiStep(),
  rogueReportChannel: { value: 'alpha' },
  rogueCombatants: { value: 'Imperium (144th Krieg) vs Chaos (World Eaters)' },
  rogueOutcome: { value: 'Imperium Victory' },
  rogueNemesisNominee: { value: 'Vorgh the Flayed' },
  rogueNotes: { value: 'Fierce trench defense at Auxiliary Sector 9.' },
  rogueDossierPreviewBox: { textContent: '' }
};

globalThis.document = {
  getElementById: (id) => mockElements[id] || null
};

// Evaluate script in mock environment
const fn = new Function('document', 'localStorage', 'console', 'window', `${rogueScriptCode}; return {
  STORAGE_KEY_ROGUE,
  getCurrentAiStep: () => currentAiStep,
  setAiStep,
  nextAiStep,
  saveRogueState,
  restoreRogueState,
  buildRogueDossierString,
  updateRogueDossierPreview,
  transmitRogueDossier,
  resetRogueDossierForm: (typeof resetRogueDossierForm !== 'undefined' ? resetRogueDossierForm : undefined)
};`);

const rogue = fn(globalThis.document, globalThis.localStorage, console, globalThis.window);

test('rogue: setAiStep updates DOM classes, badge text, and persists state', () => {
  rogue.setAiStep(1, true);

  assert.equal(rogue.getCurrentAiStep(), 1);
  assert.equal(mockElements.aiStep1.classList.contains('active-step'), true);
  assert.equal(mockElements.aiStep0.classList.contains('active-step'), false);
  assert.equal(mockElements.aiStep2.classList.contains('active-step'), false);

  assert.equal(mockElements.aiStep1.span.innerText, '[Active]');
  assert.equal(mockElements.aiStep0.span.innerText, '');
  assert.equal(mockElements.aiStep2.span.innerText, '');

  const raw = localStorage.getItem(rogue.STORAGE_KEY_ROGUE);
  assert.ok(raw);
  const parsed = JSON.parse(raw);
  assert.equal(parsed.currentAiStep, 1);
});

test('rogue: nextAiStep cycles predictably through phases 0 -> 1 -> 2 -> 0', () => {
  rogue.setAiStep(0, false);
  assert.equal(rogue.getCurrentAiStep(), 0);

  rogue.nextAiStep();
  assert.equal(rogue.getCurrentAiStep(), 1);

  rogue.nextAiStep();
  assert.equal(rogue.getCurrentAiStep(), 2);

  rogue.nextAiStep();
  assert.equal(rogue.getCurrentAiStep(), 0);
});

test('rogue: saveRogueState ignores save when aiStep0 element is absent', () => {
  storageStore.clear();
  storageStore.set(rogue.STORAGE_KEY_ROGUE, JSON.stringify({ currentAiStep: 2, custom: true }));

  const origStep0 = mockElements.aiStep0;
  delete mockElements.aiStep0;

  rogue.saveRogueState();

  const after = JSON.parse(localStorage.getItem(rogue.STORAGE_KEY_ROGUE));
  assert.equal(after.custom, true, 'Must not overwrite stored state when aiStep0 is missing from DOM');

  // Restore mock
  mockElements.aiStep0 = origStep0;
});

test('rogue: restoreRogueState faithfully restores active phase from localStorage', () => {
  localStorage.setItem(rogue.STORAGE_KEY_ROGUE, JSON.stringify({ currentAiStep: 2 }));

  rogue.restoreRogueState();

  assert.equal(rogue.getCurrentAiStep(), 2);
  assert.equal(mockElements.aiStep2.classList.contains('active-step'), true);
  assert.equal(mockElements.aiStep2.span.innerText, '[Active]');
});

test('rogue: buildRogueDossierString compiles Mode 3 Rogue Sector Battle Dossier with planetary consequences', () => {
  mockElements.rogueReportChannel.value = 'alpha';
  mockElements.rogueCombatants.value = 'Imperium (144th Krieg) vs Chaos (World Eaters)';
  mockElements.rogueOutcome.value = 'Imperium Victory';
  mockElements.rogueNemesisNominee.value = 'Vorgh the Flayed';
  mockElements.rogueNotes.value = 'Fierce trench defense at Auxiliary Sector 9.';

  const str = rogue.buildRogueDossierString();
  assert.ok(str.includes('+++ ROGUE SECTOR AUXILIARY BATTLE REPORT +++'));
  assert.ok(str.includes('THE EXILE // SANCTUARY OF ASH'));
  assert.ok(str.includes('Imperium (144th Krieg) vs Chaos (World Eaters)'));
  assert.ok(str.includes('Imperium Victory'));
  assert.ok(str.includes('PLANETARY SHIFT: Stabilizes sector'));
  assert.ok(str.includes('ALLIANCE HEGEMONY IMPACT: +1 SPt to Gatebreakers'));
  assert.ok(str.includes('NEMESIS INDUCTION NOMINEE: Vorgh the Flayed'));
  assert.ok(str.includes('Fierce trench defense at Auxiliary Sector 9.'));
});

test('rogue: transmitRogueDossier triggers window.VoxAudio.transmitToVox with compiled payload', () => {
  transmittedChannel = null;
  transmittedPayload = null;
  mockElements.rogueReportChannel.value = 'beta';

  rogue.transmitRogueDossier();
  assert.equal(transmittedChannel, 'beta');
  assert.ok(transmittedPayload.includes('ROGUE SECTOR AUXILIARY BATTLE REPORT'));
  assert.ok(transmittedPayload.includes('LORD COMMANDER JUNEBUG'));
});

test('rogue: saveRogueState and restoreRogueState preserve and restore Rogue Dossier form fields', () => {
  mockElements.rogueCombatants.value = 'Custom Force Alpha vs Xenos';
  mockElements.rogueOutcome.value = 'Xenos Victory';
  mockElements.rogueNemesisNominee.value = 'Hive Tyrant Apex';
  mockElements.rogueNotes.value = 'Spore mines detonated early.';

  rogue.saveRogueState();
  
  // Wipe inputs
  mockElements.rogueCombatants.value = '';
  mockElements.rogueOutcome.value = '';
  mockElements.rogueNemesisNominee.value = '';
  mockElements.rogueNotes.value = '';

  rogue.restoreRogueState();
  assert.equal(mockElements.rogueCombatants.value, 'Custom Force Alpha vs Xenos');
  assert.equal(mockElements.rogueOutcome.value, 'Xenos Victory');
  assert.equal(mockElements.rogueNemesisNominee.value, 'Hive Tyrant Apex');
  assert.equal(mockElements.rogueNotes.value, 'Spore mines detonated early.');
});

test('rogue: resetRogueDossierForm resets all Rogue Sector report form fields and preview to clean defaults', () => {
  assert.ok(
    rogueHtml.includes('resetRogueDossierForm()'),
    'pages/rogue.html must include a button calling resetRogueDossierForm()'
  );
  assert.equal(typeof rogue.resetRogueDossierForm, 'function', 'resetRogueDossierForm must be defined');

  mockElements.rogueReportChannel.value = 'beta';
  mockElements.rogueCombatants.value = 'Orks vs Tyranids';
  mockElements.rogueOutcome.value = 'Xenos Victory';
  mockElements.rogueNemesisNominee.value = 'Gorgutz';
  mockElements.rogueNotes.value = 'Custom battle notes.';

  rogue.resetRogueDossierForm();

  assert.equal(mockElements.rogueReportChannel.value, 'alpha');
  assert.equal(mockElements.rogueCombatants.value, '');
  assert.equal(mockElements.rogueOutcome.value, 'Imperium Victory');
  assert.equal(mockElements.rogueNemesisNominee.value, '');
  assert.equal(mockElements.rogueNotes.value, '');
  assert.ok(mockElements.rogueDossierPreviewBox.textContent.includes('THE EXILE // SANCTUARY OF ASH'));
  assert.ok(mockElements.rogueDossierPreviewBox.textContent.includes('Auxiliary Forces (Unspecified Factions)'));
  assert.equal(mockElements.rogueDossierPreviewBox.textContent.includes('Gorgutz'), false);
});

