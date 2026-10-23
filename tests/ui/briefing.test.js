const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '../../');
const BRIEFING_HTML_PATH = path.join(ROOT_DIR, 'pages/briefing.html');

// Read briefing.html and extract script block
const briefingHtml = fs.readFileSync(BRIEFING_HTML_PATH, 'utf8');
const scriptMatches = briefingHtml.match(/<script>([\s\S]*?)<\/script>/);
assert.ok(scriptMatches && scriptMatches[1], 'Must locate script tag inside pages/briefing.html');
const briefingScriptCode = scriptMatches[1];

// Set up mock DOM and localStorage environment
const storageStore = new Map();
globalThis.localStorage = {
  getItem: (k) => (storageStore.has(k) ? storageStore.get(k) : null),
  setItem: (k, v) => storageStore.set(k, String(v)),
  removeItem: (k) => storageStore.delete(k),
  clear: () => storageStore.clear()
};

function createMockElement() {
  return {
    classList: {
      classes: new Set(),
      toggle(cls, cond) {
        if (cond === undefined) {
          if (this.classes.has(cls)) this.classes.delete(cls);
          else this.classes.add(cls);
          return this.classes.has(cls);
        }
        if (cond) this.classes.add(cls);
        else this.classes.delete(cls);
        return cond;
      },
      add(cls) { this.classes.add(cls); },
      remove(cls) { this.classes.delete(cls); },
      contains(cls) { return this.classes.has(cls); }
    },
    textContent: '',
    innerHTML: '',
    style: {}
  };
}

const mockElements = {
  dossierAlpha: createMockElement(),
  dossierBeta: createMockElement(),
  dossierAtlas: createMockElement(),
  dossierRules: createMockElement(),
  btnAlpha: createMockElement(),
  btnBeta: createMockElement(),
  btnAtlas: createMockElement(),
  btnRules: createMockElement(),
  gateAlpha: createMockElement(),
  contentAlpha: createMockElement(),
  gateBeta: createMockElement(),
  contentBeta: createMockElement(),
  shipSliderLabel: createMockElement(),
  sliderDetailBox: createMockElement(),
  auspexViewport: createMockElement(),
  auspexMapFrame: createMockElement(),
  fullscreenMapBtn: createMockElement(),
  fullscreenQuickHud: createMockElement(),
  fsHudDetails: createMockElement(),
  fsToggleDetailsBtn: createMockElement(),
  atlasInspectorName: createMockElement(),
  atlasInspectorDominance: createMockElement(),
  atlasInspectorReward: createMockElement(),
  fsHudName: createMockElement(),
  fsHudDominance: createMockElement(),
  fsHudRule: createMockElement(),
  hegBarAlpha: createMockElement(),
  hegBarBeta: createMockElement(),
  hegBarHorde: createMockElement(),
  fsHegBarAlpha: createMockElement(),
  fsHegBarBeta: createMockElement(),
  fsHegBarHorde: createMockElement()
};

for (let i = -3; i <= 3; i++) {
  mockElements['sliderBtn' + i] = createMockElement();
  mockElements['node' + i] = createMockElement();
  mockElements['reckRow' + i] = createMockElement();
}
['1', '15', '22'].forEach(k => {
  mockElements['zoomBtn' + k] = createMockElement();
});
for (let i = 0; i <= 7; i++) {
  mockElements['map-node-' + i] = createMockElement();
}

globalThis.document = {
  getElementById: (id) => mockElements[id] || null,
  querySelectorAll: () => []
};

globalThis.window = {
  location: { hash: '' },
  addEventListener: () => {}
};

// Evaluate script in mock environment
const fn = new Function('document', 'window', 'localStorage', 'console', `${briefingScriptCode}; return {
  BRIEFING_STORAGE_KEY,
  SHIP_SLIDER_DATA,
  ATLAS_NODES,
  getBriefingState: () => briefingState,
  saveBriefingState,
  restoreBriefingState,
  showDossier,
  unlockTab,
  lockTab,
  selectSlider,
  setAuspexZoom,
  toggleAuspexFullscreen,
  toggleFsHudDetails,
  getDominanceText,
  selectAtlasNode
};`);

const briefing = fn(globalThis.document, globalThis.window, globalThis.localStorage, console);

test('briefing: ATLAS_NODES and SHIP_SLIDER_DATA have complete schemas', () => {
  const nodeKeys = Object.keys(briefing.ATLAS_NODES);
  assert.equal(nodeKeys.length, 8, 'Sector Map must define 8 tactical nodes');
  assert.ok(briefing.SHIP_SLIDER_DATA['-3'] && briefing.SHIP_SLIDER_DATA['3'], 'Ship power slider must span from -3 to +3');

  nodeKeys.forEach((key) => {
    const n = briefing.ATLAS_NODES[key];
    assert.ok(n.title, `Node ${key} must have a title`);
    assert.ok(n.rule, `Node ${key} must have tactical rule / strategic intelligence`);
  });
});

test('briefing: showDossier switches active dossier and updates buttons', () => {
  briefing.showDossier('atlas', true);

  assert.equal(briefing.getBriefingState().activeDossier, 'atlas');
  assert.equal(mockElements.dossierAtlas.classList.contains('hidden'), false);
  assert.equal(mockElements.btnAtlas.classList.contains('active'), true);
  assert.equal(mockElements.dossierBeta.classList.contains('hidden'), true);
  assert.equal(mockElements.btnBeta.classList.contains('active'), false);

  const raw = localStorage.getItem(briefing.BRIEFING_STORAGE_KEY);
  const parsed = JSON.parse(raw);
  assert.equal(parsed.activeDossier, 'atlas');
});

test('briefing: unlockTab and lockTab manage clearance gates and persist states', () => {
  briefing.unlockTab('Beta', true);
  assert.equal(mockElements.gateBeta.classList.contains('hidden'), true);
  assert.equal(mockElements.contentBeta.classList.contains('hidden'), false);
  assert.equal(briefing.getBriefingState().unlockedBeta, true);

  briefing.lockTab('Beta', true);
  assert.equal(mockElements.gateBeta.classList.contains('hidden'), false);
  assert.equal(mockElements.contentBeta.classList.contains('hidden'), true);
  assert.equal(briefing.getBriefingState().unlockedBeta, false);
});

test('briefing: selectSlider updates active node and description', () => {
  briefing.selectSlider(2, true);

  assert.equal(briefing.getBriefingState().shipSlider, 2);
  assert.equal(mockElements['sliderBtn2'].classList.contains('active'), true);
  assert.equal(mockElements['sliderBtn0'].classList.contains('active'), false);
  assert.equal(mockElements['node2'].classList.contains('active-sanctum'), true);
  assert.equal(mockElements['reckRow2'].classList.contains('highlight-row'), true);
  assert.ok(mockElements.shipSliderLabel.textContent.includes('Current State:'));
});

test('briefing: setAuspexZoom toggles zoom levels (1x, 15x, 22x)', () => {
  briefing.setAuspexZoom('15x');
  assert.equal(mockElements.auspexViewport.classList.contains('zoom-15x'), true);
  assert.equal(mockElements.auspexViewport.classList.contains('zoom-1x'), false);
  assert.equal(mockElements.zoomBtn15.classList.contains('active'), true);
  assert.equal(mockElements.zoomBtn1.classList.contains('active'), false);

  briefing.setAuspexZoom('22x');
  assert.equal(mockElements.auspexViewport.classList.contains('zoom-22x'), true);
  assert.equal(mockElements.zoomBtn22.classList.contains('active'), true);
});

test('briefing: toggleAuspexFullscreen and toggleFsHudDetails toggle UI states', () => {
  mockElements.auspexMapFrame.classList.remove('hololith-fullscreen');
  briefing.toggleAuspexFullscreen();
  assert.equal(mockElements.auspexMapFrame.classList.contains('hololith-fullscreen'), true);
  assert.equal(mockElements.fullscreenMapBtn.textContent, '✕ Exit Fullscreen');

  mockElements.fsHudDetails.classList.remove('hidden-details');
  briefing.toggleFsHudDetails();
  assert.equal(mockElements.fsHudDetails.classList.contains('hidden-details'), true);
  assert.equal(mockElements.fsToggleDetailsBtn.textContent, '▾ Show Telemetry');
});

test('briefing: getDominanceText accurately computes hegemony status', () => {
  // Fog of war
  assert.ok(briefing.getDominanceText({ alphaHP: 0, betaHP: 0, hordeHP: null }).includes('Fog of War'));

  // Beta leading
  assert.ok(briefing.getDominanceText({ alphaHP: 2, betaHP: 5, hordeHP: 1 }).includes('Lord Commander Junebug Leading'));

  // Alpha leading
  assert.ok(briefing.getDominanceText({ alphaHP: 6, betaHP: 2, hordeHP: 1 }).includes('The Exile // Sanctuary of Ash Leading'));

  // Tied
  assert.ok(briefing.getDominanceText({ alphaHP: 3, betaHP: 3, hordeHP: 2 }).includes('Contested Stalemate'));
});

test('briefing: saveBriefingState guards against saving when not on briefing page', () => {
  storageStore.clear();
  storageStore.set(briefing.BRIEFING_STORAGE_KEY, JSON.stringify({ activeDossier: 'rules', custom: true }));

  const origBeta = mockElements.dossierBeta;
  delete mockElements.dossierBeta;

  briefing.saveBriefingState();

  const after = JSON.parse(localStorage.getItem(briefing.BRIEFING_STORAGE_KEY));
  assert.equal(after.custom, true, 'Must not overwrite state when dossierBeta is missing from DOM');

  mockElements.dossierBeta = origBeta;
});

test('briefing: restoreBriefingState restores all user choices from localStorage', () => {
  localStorage.setItem(briefing.BRIEFING_STORAGE_KEY, JSON.stringify({
    activeDossier: 'atlas',
    unlockedAlpha: false,
    unlockedBeta: true,
    shipSlider: -1,
    selectedNode: 3
  }));

  briefing.restoreBriefingState();

  assert.equal(briefing.getBriefingState().activeDossier, 'atlas');
  assert.equal(briefing.getBriefingState().unlockedBeta, true);
  assert.equal(briefing.getBriefingState().shipSlider, -1);
  assert.equal(briefing.getBriefingState().selectedNode, 3);
});

test('briefing: DOM includes read-only slider gauge, reckRow-1 highlight, and CURRENT_SHIP_SLIDER = -1', () => {
  // Check read-only styling
  assert.ok(
    /pointer-events:\s*none;/i.test(briefingHtml),
    'Must define pointer-events none'
  );
  assert.ok(briefingHtml.includes('aria-label="Current Shipboard Balance Gauge (Read-Only)"'), 'Must define read-only aria-label');
  
  // Check -1 active status node
  assert.ok(briefingHtml.includes('id="node-1" class="slider-node active-brig"'), 'Must render node-1 as active-brig');
  assert.ok(briefingHtml.includes('ACTIVE • Sweet Spot'), 'Must highlight ACTIVE sweet spot');

  // Check reckRow-1 highlight in Reckoning Table
  assert.ok(briefingHtml.includes('<tr id="reckRow-1" class="highlight-row">'), 'Must highlight reckRow-1');
  assert.ok(!briefingHtml.includes('<tr id="reckRow0" class="highlight-row">'), 'reckRow0 must not have highlight-row');

  // Check script locked campaign state
  assert.ok(briefingHtml.includes('const CURRENT_SHIP_SLIDER = -1;'), 'Must define locked CURRENT_SHIP_SLIDER = -1');
  assert.ok(briefingHtml.includes('selectSlider(CURRENT_SHIP_SLIDER);'), 'Must invoke selectSlider(CURRENT_SHIP_SLIDER)');
});

test('briefing: DOM includes telemetry grids, Session 0 prologue chronicle, and Flagship muster protocol', () => {
  // Alpha telemetry & lore
  assert.ok(
    /Deck 44: The Lower Decks &amp; Bay\s+04/.test(briefingHtml) ||
    briefingHtml.includes('Deck 44: The Lower Decks &amp; Bay 04'),
    'Must include Deck 44 telemetry'
  );
  assert.ok(
    /Brig Cell 09: The Bleeding\s+Bulkhead/.test(briefingHtml) ||
    briefingHtml.includes('Brig Cell 09: The Bleeding Bulkhead'),
    'Must include Brig Cell 09 telemetry'
  );
  assert.ok(
    /Deck 01: The High Sanctum\s+Spire/.test(briefingHtml) ||
    briefingHtml.includes('Deck 01: The High Sanctum Spire'),
    'Must include Deck 01 telemetry'
  );
  assert.ok(briefingHtml.includes('Campaign Chronicle Archive // Session 0 Prologue'), 'Must include Session 0 prologue archive');
  assert.ok(briefingHtml.includes('The Left Flank Heresy'), 'Must include chronicle pillar 1');
  assert.ok(
    /The Center Crucible &amp; Rise of/.test(briefingHtml) ||
    briefingHtml.includes('The Center Crucible &amp; Rise of'),
    'Must include chronicle pillar 2'
  );
  assert.ok(briefingHtml.includes('The Wrath of the Ashen Seraph'), 'Must include chronicle pillar 3');

  // Beta telemetry & muster protocol
  const normBriefingHtml = briefingHtml.replace(/\s+/g, ' ');
  assert.ok(normBriefingHtml.includes('Sector Node 0 Hegemony Lead (2 / 8 HP)'), 'Must include Beta Hegemony lead telemetry');
  assert.ok(normBriefingHtml.includes('Session 0 Legacy: Active Nemesis Echoes'), 'Must include Nemesis Echoes telemetry');
  assert.ok(
    normBriefingHtml.includes('Private Conduit &amp; Psychic Bleed Array') ||
    normBriefingHtml.includes('Private Conduit & Psychic Bleed Array'),
    'Must include private conduit telemetry'
  );
  assert.ok(
    normBriefingHtml.includes('Phase 1 Flagship Muster &amp; Registration Protocol') ||
    normBriefingHtml.includes('Phase 1 Flagship Muster & Registration Protocol'),
    'Must include Flagship Muster Protocol'
  );
});

