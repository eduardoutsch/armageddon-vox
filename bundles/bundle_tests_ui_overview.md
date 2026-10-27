# 📦 Fires of Armageddon // Bundle: UI Tests (Briefing & PvP)

UI integration and boundary test suites for Mode 6 Briefing and Mode 2 PvP (`tests/ui/briefing.test.js`, `tests/ui/pvp.test.js`).

## 📑 Table of Contents
- [tests/ui/briefing.test.js](#file-testsuibriefingtestjs)
- [tests/ui/pvp.test.js](#file-testsuipvptestjs)

---

## File: `tests/ui/briefing.test.js` <a id="file-testsuibriefingtestjs"></a>

````javascript
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '../../');
const BRIEFING_HTML_PATH = path.join(ROOT_DIR, 'pages/briefing.html');
const BRIEFING_JS_PATH = path.join(ROOT_DIR, 'js/briefing.js');
const BRIEFING_CSS_PATH = path.join(ROOT_DIR, 'css/briefing.css');

// Read briefing.html, script, and style
const briefingHtml = fs.readFileSync(BRIEFING_HTML_PATH, 'utf8');
const briefingCss = fs.existsSync(BRIEFING_CSS_PATH) ? fs.readFileSync(BRIEFING_CSS_PATH, 'utf8') : '';
const scriptMatches = briefingHtml.match(/<script>([\s\S]*?)<\/script>/);
const briefingScriptCode = (scriptMatches && scriptMatches[1])
  ? scriptMatches[1]
  : (fs.existsSync(BRIEFING_JS_PATH) ? fs.readFileSync(BRIEFING_JS_PATH, 'utf8') : '');
assert.ok(briefingScriptCode, 'Must locate script code inside pages/briefing.html or js/briefing.js');

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
  dossierGamma: createMockElement(),
  dossierAtlas: createMockElement(),
  dossierRules: createMockElement(),
  btnAlpha: createMockElement(),
  btnBeta: createMockElement(),
  btnGamma: createMockElement(),
  btnAtlas: createMockElement(),
  btnRules: createMockElement(),
  gateAlpha: createMockElement(),
  contentAlpha: createMockElement(),
  gateBeta: createMockElement(),
  contentBeta: createMockElement(),
  gateGamma: createMockElement(),
  contentGamma: createMockElement(),
  cardBriefAlpha: createMockElement(),
  cardBriefBeta: createMockElement(),
  cardBriefGamma: createMockElement(),
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
  body: createMockElement(),
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
  briefing.showDossier('beta', false);
  assert.equal(globalThis.document.body.classList.contains('necron-briefing-active'), true, 'Must activate necron-briefing-active on body when Beta tab is active');

  briefing.showDossier('atlas', true);

  assert.equal(briefing.getBriefingState().activeDossier, 'atlas');
  assert.equal(globalThis.document.body.classList.contains('necron-briefing-active'), false, 'Must deactivate necron-briefing-active on body when leaving Beta tab');
  assert.equal(mockElements.dossierAtlas.classList.contains('hidden'), false);
  assert.equal(mockElements.btnAtlas.classList.contains('active'), true);
  assert.equal(mockElements.dossierBeta.classList.contains('hidden'), true);
  assert.equal(mockElements.btnBeta.classList.contains('active'), false);

  const raw = localStorage.getItem(briefing.BRIEFING_STORAGE_KEY);
  const parsed = JSON.parse(raw);
  assert.equal(parsed.activeDossier, 'atlas');
});

test('briefing: unlockTab and lockTab manage clearance gates, persist states, and activate global Necron or Militarum color mode', () => {
  briefing.unlockTab('Beta', true);
  assert.equal(mockElements.gateBeta.classList.contains('hidden'), true);
  assert.equal(mockElements.contentBeta.classList.contains('hidden'), false);
  assert.equal(briefing.getBriefingState().unlockedBeta, true);
  assert.equal(globalThis.document.body.classList.contains('theme-necron'), true, 'Unlocking Beta broadcast must activate global theme-necron');
  assert.equal(globalThis.document.body.classList.contains('theme-militarum'), false);
  assert.equal(localStorage.getItem('foa_faction_theme_v1'), 'necron', 'Unlocking Beta broadcast must persist necron theme mode');

  briefing.unlockTab('Alpha', true);
  assert.equal(mockElements.gateAlpha.classList.contains('hidden'), true);
  assert.equal(mockElements.contentAlpha.classList.contains('hidden'), false);
  assert.equal(briefing.getBriefingState().unlockedAlpha, true);
  assert.equal(globalThis.document.body.classList.contains('theme-militarum'), true, 'Unlocking Alpha broadcast must activate global theme-militarum');
  assert.equal(globalThis.document.body.classList.contains('theme-necron'), false);
  assert.equal(localStorage.getItem('foa_faction_theme_v1'), 'militarum', 'Unlocking Alpha broadcast must persist militarum theme mode');

  // Switching between unlocked broadcasts switches global faction color mode
  briefing.showDossier('beta', true);
  assert.equal(globalThis.document.body.classList.contains('theme-necron'), true, 'Viewing unlocked Beta dossier activates theme-necron');
  briefing.showDossier('alpha', true);
  assert.equal(globalThis.document.body.classList.contains('theme-militarum'), true, 'Viewing unlocked Alpha dossier activates theme-militarum');

  briefing.unlockTab('Gamma', true);
  assert.equal(mockElements.gateGamma.classList.contains('hidden'), true);
  assert.equal(mockElements.contentGamma.classList.contains('hidden'), false);
  assert.equal(briefing.getBriefingState().unlockedGamma, true);
  assert.equal(globalThis.document.body.classList.contains('theme-votann'), true, 'Unlocking Gamma broadcast must activate global theme-votann');
  assert.equal(globalThis.document.body.classList.contains('theme-necron'), false);
  assert.equal(globalThis.document.body.classList.contains('theme-militarum'), false);
  assert.equal(localStorage.getItem('foa_faction_theme_v1'), 'votann', 'Unlocking Gamma broadcast must persist votann theme mode');

  briefing.showDossier('gamma', true);
  assert.equal(globalThis.document.body.classList.contains('votann-briefing-active'), true, 'Viewing Gamma dossier activates votann-briefing-active');
  assert.equal(globalThis.document.body.classList.contains('necron-briefing-active'), false);
  assert.equal(globalThis.document.body.classList.contains('theme-votann'), true, 'Viewing unlocked Gamma dossier activates theme-votann');

  briefing.lockTab('Gamma', true);
  assert.equal(mockElements.gateGamma.classList.contains('hidden'), false);
  assert.equal(mockElements.contentGamma.classList.contains('hidden'), true);
  assert.equal(briefing.getBriefingState().unlockedGamma, false);

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

test('briefing: DOM includes read-only slider gauge, Operational Thresholds in Alpha, reckRow-1 highlight, and CURRENT_SHIP_SLIDER = -1', () => {
  // Check read-only styling
  assert.ok(
    /pointer-events:\s*none;/i.test(briefingHtml) || /pointer-events:\s*none;/i.test(briefingCss),
    'Must define pointer-events none'
  );
  assert.ok(briefingHtml.includes('aria-label="Current Shipboard Balance Gauge (Read-Only)"'), 'Must define read-only aria-label');
  
  // Check -1 active status node and Operational Threshold terminology (no "Sweet Spot")
  assert.ok(briefingHtml.includes('id="node-1" class="slider-node active-brig"'), 'Must render node-1 as active-brig');
  assert.ok(
    briefingHtml.includes('-1 (Lower Decks Ascendant — Tier I: Ash-Hold Surge)'),
    'Must include -1 (Lower Decks Ascendant — Tier I: Ash-Hold Surge)'
  );
  assert.ok(
    briefingHtml.replace(/\s+/g, ' ').includes('Optimal Operational Thresholds are <strong>-1</strong> and <strong>+1</strong> (Unlocking the Phase-End Shipboard Cache: +1 RP or +100 pts Supply Limit)') ||
    briefingHtml.replace(/\s+/g, ' ').includes('Optimal Operational Thresholds are -1 and +1 (Unlocking the Phase-End Shipboard Cache: +1 RP or +100 pts Supply Limit)'),
    'Must include Optimal Operational Thresholds are -1 and +1'
  );
  assert.equal(/Sweet Spot/i.test(briefingHtml), false, 'Must not contain legacy Sweet Spot phrasing');

  // Check reckRow-1 highlight in Reckoning Table
  assert.ok(briefingHtml.includes('<tr id="reckRow-1" class="highlight-row">'), 'Must highlight reckRow-1');
  assert.ok(!briefingHtml.includes('<tr id="reckRow0" class="highlight-row">'), 'reckRow0 must not have highlight-row');

  // Check script locked campaign state
  assert.ok(
    briefingHtml.includes('const CURRENT_SHIP_SLIDER = -1;') || briefingScriptCode.includes('CURRENT_SHIP_SLIDER = -1'),
    'Must define locked CURRENT_SHIP_SLIDER = -1'
  );
  assert.ok(
    briefingHtml.includes('selectSlider(CURRENT_SHIP_SLIDER);') || briefingScriptCode.includes('selectSlider(CURRENT_SHIP_SLIDER);'),
    'Must invoke selectSlider(CURRENT_SHIP_SLIDER)'
  );
});

test('briefing: DOM includes telemetry grids, Session 0 prologue chronicle, Beta Tomb-Ship Equilibrium Gauge, and Flagship muster protocol', () => {
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

  // Beta telemetry, Tomb-Ship Equilibrium Gauge, & muster protocol
  const normBriefingHtml = briefingHtml.replace(/\s+/g, ' ');
  assert.ok(normBriefingHtml.includes('Awakening of the Undying Dynasty'), 'Must include Awakening of the Undying Dynasty heading');
  assert.ok(normBriefingHtml.includes('Sector Node 0 Hegemony Lead (2 / 8 HP) &amp; Marauders +1 SPt'), 'Must include Beta Hegemony lead & Marauders +1 SPt telemetry');
  assert.ok(normBriefingHtml.includes('Roaming Star-God &amp; Orbiting Auditors'), 'Must include Roaming Star-God & Orbiting Auditors telemetry');
  assert.ok(
    normBriefingHtml.includes('Mirror-Image Tomb-Ship Terminal &amp; Psychic Bleed'),
    'Must include Mirror-Image Tomb-Ship Terminal & Psychic Bleed telemetry'
  );
  assert.ok(
    normBriefingHtml.includes('SHIP.md Part 2 // Tomb-Ship Engram &amp; Tesseract Equilibrium (-3 to +3)'),
    'Must include SHIP.md Part 2 // Tomb-Ship Engram & Tesseract Equilibrium (-3 to +3) heading'
  );
  assert.ok(
    normBriefingHtml.includes('id="betaNode-1" class="slider-node active-brig"'),
    'Must include betaNode-1 active-brig slider node'
  );
  assert.ok(
    normBriefingHtml.includes('-1 // Crimson Harvest Ascendant (★ TIER I: TESSERACT OVERCLOCK ★)'),
    'Must include Beta -1 // Crimson Harvest Ascendant detail title'
  );
  assert.ok(
    normBriefingHtml.includes('Tomb-Ship 7-State Breakdown &amp; Phase Reckoning Table (If 3rd Force Wins Phase)'),
    'Must include Beta Tomb-Ship 7-State Breakdown & Phase Reckoning Table'
  );
  assert.ok(
    normBriefingHtml.includes('our Tomb-Ship has risen openly into low equatorial orbit above the clearing') &&
    normBriefingHtml.includes('Quantum Shields drink the feeble targeting sweeps'),
    'Must include open orbital arrival and Quantum Shields in Beta Part 1 opening paragraph'
  );
  assert.ok(
    normBriefingHtml.includes('Knowing his defense lasers cannot pierce our Quantum Shielding'),
    'Must include Quantum Shielding parley rationale in Beta Part 1 closing paragraph'
  );
  assert.ok(
    normBriefingHtml.includes('Open-Frequency Orbital Parley (Geostationary Zenith-09)'),
    'Must include Open-Frequency Orbital Parley (Geostationary Zenith-09) in Beta Part 2'
  );
  assert.ok(
    normBriefingHtml.includes('Auditor: Logis-Prefect Vane • Ordo Xenos / Tactica Logis Cold Parley'),
    'Must include Ordo Xenos / Tactica Logis Cold Parley subheader in Beta Part 2'
  );
  assert.ok(
    normBriefingHtml.includes('Quantum-Shielded Necron capital hull is an exercise in wasted promethium') &&
    normBriefingHtml.includes('Consider this a formal Ordo Xenos and Tactica Logis parley, Regent of the Tomb.'),
    'Must include Vane Ordo Xenos and Tactica Logis parley quote in Beta Part 2'
  );
  assert.ok(
    normBriefingHtml.includes('Phase 1 Tomb-Ship Muster &amp; Dynastic Registration Protocol'),
    'Must include Phase 1 Tomb-Ship Muster & Dynastic Registration Protocol'
  );
});

test('briefing: #dossierBeta, #btnBeta, and body.necron-briefing-active include Necron Noctolith, Cartouche, Ankh & Gauss Emerald styling', () => {
  assert.ok(briefingHtml.includes('body.necron-briefing-active') || briefingCss.includes('body.necron-briefing-active'), 'Must style body.necron-briefing-active for full-page Tomb-Ship atmosphere');
  assert.ok(briefingHtml.includes('@keyframes necronGaussPulse') || briefingCss.includes('@keyframes necronGaussPulse'), 'Must define @keyframes necronGaussPulse animation');
  assert.ok(briefingHtml.includes('.necron-ankh-divider') || briefingCss.includes('.necron-ankh-divider'), 'Must define .necron-ankh-divider Royal Cartouche ornament');
  assert.ok(briefingHtml.includes('#btnBeta.active') || briefingCss.includes('#btnBeta.active'), 'Must style #btnBeta.active with Necron Gauss Emerald theme');
  assert.ok(briefingHtml.includes('#dossierBeta .hero-card') || briefingCss.includes('#dossierBeta .hero-card'), 'Must style #dossierBeta .hero-card with Noctolith Obsidian & Gauss Emerald');
  assert.ok(briefingHtml.includes('#dossierBeta .hero-title') || briefingCss.includes('#dossierBeta .hero-title'), 'Must style #dossierBeta .hero-title with Living Metal & Gauss Emerald gradient');
  assert.ok(briefingHtml.includes('#gateBeta .unlock-btn') || briefingCss.includes('#gateBeta .unlock-btn'), 'Must style #gateBeta .unlock-btn with Royal Engram emerald button');
  assert.ok(briefingHtml.includes('#dossierBeta .slider-node.active-brig') || briefingCss.includes('#dossierBeta .slider-node.active-brig'), 'Must style #dossierBeta .slider-node.active-brig with Gauss Overclock glow');
  assert.ok(briefingHtml.includes('#dossierBeta table.reckoning-table th') || briefingCss.includes('#dossierBeta table.reckoning-table th'), 'Must style #dossierBeta reckoning table headers with Tomb-Ship aesthetic');
  assert.ok(briefingHtml.includes('#dossierBeta tr.highlight-row') || briefingCss.includes('#dossierBeta tr.highlight-row'), 'Must style #dossierBeta highlight-row with Gauss Emerald highlight');
  assert.ok(briefingHtml.includes('#dossierBeta code') || briefingCss.includes('#dossierBeta code'), 'Must style #dossierBeta code as Engrammatic Hex-Glyph chips');
});

test('briefing: #dossierGamma and #cardBriefGamma render Votann Glôk-Vâr lore, Fane-Node Vôl-09, 900-Year Debt, and Needgaârd roster', () => {
  assert.ok(briefingHtml.includes('id="dossierGamma"'), 'Must contain #dossierGamma section');
  assert.ok(briefingHtml.includes('id="cardBriefGamma"'), 'Must contain #cardBriefGamma conduit card');
  assert.ok(briefingHtml.includes('The Ledger of Embers'), 'Must include The Ledger of Embers vessel');
  assert.ok(briefingHtml.includes('Glôk-Vâr'), 'Must include Glôk-Vâr vessel designation');
  assert.ok(briefingHtml.includes('Fane-Node Vôl-09') || briefingHtml.includes('Fane-Node'), 'Must include Fane-Node Vôl-09');
  assert.ok(briefingHtml.includes('900-Year Debt') || briefingHtml.includes('Hive Infernus'), 'Must include 900-Year Debt of Hive Infernus');
  assert.ok(briefingHtml.includes('Kâhl Hârkyn Grîmledger'), 'Must include Kâhl Hârkyn Grîmledger');
  assert.ok(briefingHtml.includes('Oathbound Speculator'), 'Must include Oathbound Speculator');
  assert.ok(briefingHtml.includes('Hernkyn Yaegirs'), 'Must include Hernkyn Yaegirs');
});

test('briefing: #dossierGamma, #btnGamma, and body.votann-briefing-active include Votann Deep Tectonic Basalt & Warm Hearth Amber styling', () => {
  assert.ok(briefingHtml.includes('body.votann-briefing-active') || briefingCss.includes('body.votann-briefing-active'), 'Must style body.votann-briefing-active for full-page Hearth atmosphere');
  assert.ok(briefingHtml.includes('@keyframes votannHearthPulse') || briefingCss.includes('@keyframes votannHearthPulse'), 'Must define @keyframes votannHearthPulse animation');
  assert.ok(briefingHtml.includes('#btnGamma.active') || briefingCss.includes('#btnGamma.active'), 'Must style #btnGamma.active with Votann Hearth Amber theme');
  assert.ok(briefingHtml.includes('#dossierGamma .hero-card') || briefingCss.includes('#dossierGamma .hero-card'), 'Must style #dossierGamma .hero-card with Tectonic Basalt & Hearth Amber');
  assert.ok(briefingHtml.includes('#dossierGamma .hero-title') || briefingCss.includes('#dossierGamma .hero-title'), 'Must style #dossierGamma .hero-title with Magna-Gold & Hearth Amber gradient');
  assert.ok(briefingHtml.includes('#gateGamma .unlock-btn') || briefingCss.includes('#gateGamma .unlock-btn'), 'Must style #gateGamma .unlock-btn with Votann Hearth button');
  assert.ok(briefingHtml.includes('#dossierGamma table.reckoning-table th') || briefingCss.includes('#dossierGamma table.reckoning-table th'), 'Must style #dossierGamma reckoning table headers with Black-Ledger aesthetic');
  assert.ok(briefingHtml.includes('#dossierGamma tr.highlight-row') || briefingCss.includes('#dossierGamma tr.highlight-row'), 'Must style #dossierGamma highlight-row with Hearth Amber highlight');
  assert.ok(briefingHtml.includes('#dossierGamma code') || briefingCss.includes('#dossierGamma code'), 'Must style #dossierGamma code as Black-Ledger chips');
});





````

---

## File: `tests/ui/pvp.test.js` <a id="file-testsuipvptestjs"></a>

````javascript
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '../../');
const PVP_HTML_PATH = path.join(ROOT_DIR, 'pages/pvp.html');
const PVP_JS_PATH = path.join(ROOT_DIR, 'js/pvp.js');

// Read pvp.html and extract script block or modular js/pvp.js
const pvpHtml = fs.readFileSync(PVP_HTML_PATH, 'utf8');
const scriptMatches = pvpHtml.match(/<script>([\s\S]*?)<\/script>/);
const pvpScriptCode = (scriptMatches && scriptMatches[1])
  ? scriptMatches[1]
  : (fs.existsSync(PVP_JS_PATH) ? fs.readFileSync(PVP_JS_PATH, 'utf8') : '');
assert.ok(pvpScriptCode, 'Must locate script code inside pages/pvp.html or js/pvp.js');

// Set up mock DOM and localStorage environment
const storageStore = new Map();
globalThis.localStorage = {
  getItem: (k) => (storageStore.has(k) ? storageStore.get(k) : null),
  setItem: (k, v) => storageStore.set(k, String(v)),
  removeItem: (k) => storageStore.delete(k),
  clear: () => storageStore.clear()
};

function makeClassList() {
  const classes = new Set();
  return {
    add: (...c) => c.forEach(x => classes.add(x)),
    remove: (...c) => c.forEach(x => classes.delete(x)),
    toggle: (c, force) => {
      if (force === undefined) {
        if (classes.has(c)) { classes.delete(c); return false; }
        else { classes.add(c); return true; }
      } else if (force) {
        classes.add(c); return true;
      } else {
        classes.delete(c); return false;
      }
    },
    contains: (c) => classes.has(c)
  };
}

const mockElements = {
  hellscapeSelect: { value: '0' },
  hellscapeDesc: { innerHTML: '', innerText: '' },
  warpIntensity: { value: 'major' },
  anomalyResultBox: { innerHTML: '' },
  vultureKillCheck: { checked: false },
  vulturePts: { innerText: '3 SPts', textContent: '3 SPts' },
  pvpReportSpBadge: { textContent: '3 SPts' },
  unboundResult: { innerHTML: '' },
  pvpReportChannel: { value: 'alpha' },
  pvpReportNotes: { value: '' },
  pvpVulturePreviewBox: { textContent: '', classList: makeClassList() }
};

globalThis.document = {
  getElementById: (id) => mockElements[id] || null
};

let transmittedChannel = null;
let transmittedPayload = null;
let warpSirenPlayed = 0;
let auspexLockPlayed = 0;

globalThis.window = {
  VoxAudio: {
    playWarpSiren: () => { warpSirenPlayed++; },
    playAuspexLock: () => { auspexLockPlayed++; },
    transmitToVox: (chan, payload) => {
      transmittedChannel = chan;
      transmittedPayload = payload;
    }
  }
};

// Evaluate script in mock environment
const fn = new Function('document', 'localStorage', 'console', 'window', `${pvpScriptCode}; return {
  HELLSCAPES,
  HELLSCAPE_NAMES,
  ANOMALIES,
  UNBOUND_UNITS,
  STORAGE_KEY_PVP,
  savePvpState,
  restorePvpState,
  renderHellscape,
  rollRandomHellscape,
  rollWarpAnomaly,
  updateVulture,
  rollUnboundAdversary,
  transmitUnboundPing,
  compilePvpVultureReport: (typeof compilePvpVultureReport !== 'undefined' ? compilePvpVultureReport : undefined),
  buildPvpVultureReportString,
  updatePvpVulturePreview,
  transmitPvpVultureReport,
  resetPvpVultureReportForm: (typeof resetPvpVultureReportForm !== 'undefined' ? resetPvpVultureReportForm : undefined)
};`);

const pvp = fn(globalThis.document, globalThis.localStorage, console, globalThis.window);

test('pvp: HELLSCAPES, ANOMALIES, and UNBOUND_UNITS contain valid crusade content', () => {
  assert.equal(pvp.HELLSCAPES.length, 6, 'Must define 6 Hellscape environments');
  assert.equal(pvp.HELLSCAPE_NAMES.length, 6, 'Must define 6 Hellscape names');
  assert.equal(pvp.ANOMALIES.length, 6, 'Must define 6 Warp Anomalies');
  assert.equal(pvp.UNBOUND_UNITS.length, 4, 'Must define 4 Unbound Adversary power levels');
  assert.ok(pvp.UNBOUND_UNITS[3].includes('CLASSIFIED APEX ANOMALY'), 'PL 4 must reference Classified Apex Anomaly');

  pvp.HELLSCAPES.forEach((h, idx) => {
    assert.equal(typeof h, 'string');
    assert.ok(h.includes('<strong>'), `Hellscape ${idx} must include bold rule title`);
  });
});

test('pvp: renderHellscape updates description and saves state to localStorage', () => {
  mockElements.hellscapeSelect.value = '2';
  pvp.renderHellscape(true);

  assert.equal(mockElements.hellscapeDesc.innerHTML, pvp.HELLSCAPES[2]);

  const raw = localStorage.getItem(pvp.STORAGE_KEY_PVP);
  assert.ok(raw);
  const parsed = JSON.parse(raw);
  assert.equal(parsed.hellscapeIdx, 2);
});

test('pvp: updateVulture calculates 3 SPts base or 4 SPts with player kill bonus and updates Vulture report preview', () => {
  mockElements.vultureKillCheck.checked = false;
  pvp.updateVulture(true);
  assert.equal(mockElements.vulturePts.innerText, '3 SPts');
  assert.equal(mockElements.pvpReportSpBadge.textContent, '3 SPts');
  assert.ok(mockElements.pvpVulturePreviewBox.textContent.includes('3 SPts'));

  mockElements.vultureKillCheck.checked = true;
  pvp.updateVulture(true);
  assert.equal(mockElements.vulturePts.innerText, '4 SPts');
  assert.equal(mockElements.pvpReportSpBadge.textContent, '4 SPts');
  assert.ok(mockElements.pvpVulturePreviewBox.textContent.includes('4 SPts'));

  const raw = localStorage.getItem(pvp.STORAGE_KEY_PVP);
  const parsed = JSON.parse(raw);
  assert.equal(parsed.vultureKilled, true);
});

test('pvp: rollWarpAnomaly triggers surges based on intensity thresholds', () => {
  mockElements.warpIntensity.value = 'major';
  pvp.rollWarpAnomaly();

  assert.ok(mockElements.anomalyResultBox.innerHTML.includes('Rolled'));

  const raw = localStorage.getItem(pvp.STORAGE_KEY_PVP);
  const parsed = JSON.parse(raw);
  assert.ok(parsed.anomalyHtml.includes('Rolled'));
});

test('pvp: rollUnboundAdversary picks an unbound unit, triggers SFX, renders ping buttons, and persists output', () => {
  warpSirenPlayed = 0;
  auspexLockPlayed = 0;

  pvp.rollUnboundAdversary();

  assert.ok(mockElements.unboundResult.innerHTML.includes('Power Level'));
  assert.ok(mockElements.unboundResult.innerHTML.includes('transmitUnboundPing'), 'Must include Vox ping button callbacks');
  assert.ok(mockElements.unboundResult.innerHTML.includes('text-align:center'), 'Ping banner must feature centered text alignment');
  assert.ok(mockElements.unboundResult.innerHTML.includes('justify-content:center'), 'Ping action buttons must be centered');
  assert.equal(warpSirenPlayed + auspexLockPlayed > 0, true, 'Must trigger either warp siren or auspex lock SFX');

  const raw = localStorage.getItem(pvp.STORAGE_KEY_PVP);
  const parsed = JSON.parse(raw);
  assert.ok(parsed.unboundHtml.includes('Power Level'));
});

test('pvp: transmitUnboundPing formats emergency apex payload for PL 4 and standard payload for PL 1-3', () => {
  transmittedChannel = null;
  transmittedPayload = null;
  mockElements.warpIntensity.value = 'catastrophic';

  // PL 4 Apex Anomaly Ping
  pvp.transmitUnboundPing(4, 'alpha');
  assert.equal(transmittedChannel, 'alpha');
  assert.ok(transmittedPayload.includes('EMERGENCY AUSPEX PING: POWER LEVEL 4 APEX ANOMALY DETECTED'));
  assert.ok(transmittedPayload.includes('Warp Intensity: CATASTROPHIC'));
  assert.ok(transmittedPayload.includes('Contextual 3-Tier PL 4 Manifestation Roll'));

  // PL 2 Standard Ping (Beta)
  transmittedChannel = null;
  transmittedPayload = null;
  pvp.transmitUnboundPing(2, 'beta');
  assert.equal(transmittedChannel, 'beta');
  assert.ok(transmittedPayload.includes('AUSPEX PING: POWER LEVEL 2 UNBOUND ADVERSARY DETECTED'));
  assert.ok(transmittedPayload.includes('Scan NEMESIS.md and identify the Power Level 2 Unbound Adversary'));
  assert.ok(transmittedPayload.includes('TOMB-SHIP QUANTUM AUSPEX [PHAERON JUNEBUG]'));

  // PL 2 Standard Ping (Alpha)
  transmittedChannel = null;
  transmittedPayload = null;
  pvp.transmitUnboundPing(2, 'alpha');
  assert.equal(transmittedChannel, 'alpha');
  assert.ok(transmittedPayload.includes('AUSPEX PING: POWER LEVEL 2 UNBOUND ADVERSARY DETECTED'));
  assert.ok(transmittedPayload.includes('roll/select our Power Level 2 Unbound Adversary'));
  assert.ok(transmittedPayload.includes('MUNITORUM AUSPEX RELAY [THE EXILE // 044TH KRIEG]'));
});

test('pvp: buildPvpVultureReportString and transmitPvpVultureReport compile and send Campaign Master 3rd Alliance SPts report separately from Unbound Adversary roller', () => {
  assert.ok(
    pvpHtml.includes('transmitPvpVultureReport()'),
    'pages/pvp.html must include a dedicated button calling transmitPvpVultureReport()'
  );
  assert.ok(
    pvpHtml.includes('rollUnboundAdversary()') && (pvpHtml.includes('transmitUnboundPing(') || pvpScriptCode.includes('transmitUnboundPing(')),
    'pages/pvp.html or js/pvp.js must keep rollUnboundAdversary() and transmitUnboundPing() separate'
  );

  // Case 1: Base 3 SPts (no unit destroyed), Alpha channel
  mockElements.hellscapeSelect.value = '4';
  mockElements.warpIntensity.value = 'catastrophic';
  mockElements.vultureKillCheck.checked = false;
  mockElements.pvpReportChannel.value = 'alpha';
  mockElements.pvpReportNotes.value = 'Unbound Daemons contested the central siphon.';

  pvp.updatePvpVulturePreview();
  const report3 = pvp.buildPvpVultureReportString();

  assert.equal(mockElements.pvpVulturePreviewBox.textContent, report3);
  assert.ok(report3.includes('+++ 1V1 ASH WASTES // 3RD ALLIANCE VULTURE SPTS REPORT +++'));
  assert.ok(report3.includes('THE EXILE // SANCTUARY OF ASH'));
  assert.ok(report3.includes('CAMPAIGN MASTER (3RD ALLIANCE) VULTURED SPTS: 3 SPts'));
  assert.ok(report3.includes('Base Vulture Presence (+3 SPts) [No Player Unit Destroyed] = 3 SPts'));
  assert.ok(report3.includes('Gravitic Nexus // Intensity: CATASTROPHIC'));
  assert.ok(report3.includes('Unbound Daemons contested the central siphon.'));

  transmittedChannel = null;
  transmittedPayload = null;
  pvp.transmitPvpVultureReport();
  assert.equal(transmittedChannel, 'alpha');
  assert.equal(transmittedPayload, report3);

  // Case 2: 4 SPts (Destroyed a Player Unit checked), Beta channel
  mockElements.vultureKillCheck.checked = true;
  mockElements.pvpReportChannel.value = 'beta';
  pvp.updatePvpVulturePreview();
  const report4 = pvp.buildPvpVultureReportString();

  assert.ok(report4.includes('LORD COMMANDER JUNEBUG'));
  assert.ok(report4.includes('CAMPAIGN MASTER (3RD ALLIANCE) VULTURED SPTS: 4 SPts'));
  assert.ok(report4.includes('Destroyed a Player Unit (+1 SPt) = 4 SPts'));

  transmittedChannel = null;
  transmittedPayload = null;
  pvp.transmitPvpVultureReport();
  assert.equal(transmittedChannel, 'beta');
  assert.equal(transmittedPayload, report4);
});

test('pvp: savePvpState ignores save when hellscapeSelect element is absent', () => {
  storageStore.clear();
  storageStore.set(pvp.STORAGE_KEY_PVP, JSON.stringify({ hellscapeIdx: 4, custom: true }));

  const origSelect = mockElements.hellscapeSelect;
  delete mockElements.hellscapeSelect;

  pvp.savePvpState();

  const after = JSON.parse(localStorage.getItem(pvp.STORAGE_KEY_PVP));
  assert.equal(after.custom, true, 'Must not overwrite stored state when hellscapeSelect is missing from DOM');

  // Restore mock
  mockElements.hellscapeSelect = origSelect;
});

test('pvp: restorePvpState faithfully reconstructs UI state and Vulture report fields from localStorage', () => {
  localStorage.setItem(pvp.STORAGE_KEY_PVP, JSON.stringify({
    hellscapeIdx: 5,
    warpIntensity: 'minor',
    anomalyHtml: '<span class="test-surge">Warp Fluke</span>',
    vultureKilled: true,
    unboundHtml: '<p>Daemonic Beast</p>',
    reportChannel: 'beta',
    reportNotes: 'Marauders claimed 4 SPts in Sector 5.'
  }));

  pvp.restorePvpState();

  assert.equal(String(mockElements.hellscapeSelect.value), '5');
  assert.equal(mockElements.warpIntensity.value, 'minor');
  assert.equal(mockElements.anomalyResultBox.innerHTML, '<span class="test-surge">Warp Fluke</span>');
  assert.equal(mockElements.vultureKillCheck.checked, true);
  assert.equal(mockElements.vulturePts.innerText, '4 SPts');
  assert.equal(mockElements.unboundResult.innerHTML, '<p>Daemonic Beast</p>');
  assert.equal(mockElements.pvpReportChannel.value, 'beta');
  assert.equal(mockElements.pvpReportNotes.value, 'Marauders claimed 4 SPts in Sector 5.');
  assert.ok(mockElements.pvpVulturePreviewBox.textContent.includes('4 SPts'));
});

test('pvp: resetPvpVultureReportForm resets Vulture SPts report fields, kill checkbox, and preview to clean defaults', () => {
  assert.ok(
    pvpHtml.includes('resetPvpVultureReportForm()'),
    'pages/pvp.html must include a button calling resetPvpVultureReportForm()'
  );
  assert.equal(typeof pvp.resetPvpVultureReportForm, 'function', 'resetPvpVultureReportForm must be defined');

  mockElements.pvpReportChannel.value = 'beta';
  mockElements.vultureKillCheck.checked = true;
  mockElements.pvpReportNotes.value = 'Custom vulture notes.';
  pvp.updateVulture(true);

  pvp.resetPvpVultureReportForm();

  assert.equal(mockElements.pvpReportChannel.value, 'alpha');
  assert.equal(mockElements.vultureKillCheck.checked, false);
  assert.equal(mockElements.pvpReportNotes.value, '');
  assert.equal(mockElements.vulturePts.innerText, '3 SPts');
  assert.equal(mockElements.pvpReportSpBadge.textContent, '3 SPts');
  assert.ok(mockElements.pvpVulturePreviewBox.textContent.includes('THE EXILE // SANCTUARY OF ASH'));
  assert.ok(mockElements.pvpVulturePreviewBox.textContent.includes('3 SPts'));
  assert.equal(mockElements.pvpVulturePreviewBox.textContent.includes('Custom vulture notes.'), false);
});

test('pvp: compilePvpVultureReport pure functional core formats Vulture SPts report from plain data without DOM dependency', () => {
  assert.equal(typeof pvp.compilePvpVultureReport, 'function', 'Must define pure compilePvpVultureReport function');
  const out = pvp.compilePvpVultureReport({
    channel: 'beta',
    killedUnit: true,
    hellscapeIdx: 2,
    warpIntensity: 'minor',
    notes: 'Scavengers looted the ridge.'
  });
  assert.ok(out.includes('LORD COMMANDER JUNEBUG'));
  assert.ok(out.includes('4 SPts'));
  assert.ok(out.includes('Fading Reality // Intensity: MINOR'));
  assert.ok(out.includes('Scavengers looted the ridge.'));
});
````
