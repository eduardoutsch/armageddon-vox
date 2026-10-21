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

const mockElements = {
  aiStep0: createMockAiStep(),
  aiStep1: createMockAiStep(),
  aiStep2: createMockAiStep()
};

globalThis.document = {
  getElementById: (id) => mockElements[id] || null
};

// Evaluate script in mock environment
const fn = new Function('document', 'localStorage', 'console', `${rogueScriptCode}; return {
  STORAGE_KEY_ROGUE,
  getCurrentAiStep: () => currentAiStep,
  setAiStep,
  nextAiStep,
  saveRogueState,
  restoreRogueState
};`);

const rogue = fn(globalThis.document, globalThis.localStorage, console);

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
