const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '../../');
const PVP_HTML_PATH = path.join(ROOT_DIR, 'pages/pvp.html');

// Read pvp.html and extract script block
const pvpHtml = fs.readFileSync(PVP_HTML_PATH, 'utf8');
const scriptMatches = pvpHtml.match(/<script>([\s\S]*?)<\/script>/);
assert.ok(scriptMatches && scriptMatches[1], 'Must locate script tag inside pages/pvp.html');
const pvpScriptCode = scriptMatches[1];

// Set up mock DOM and localStorage environment
const storageStore = new Map();
globalThis.localStorage = {
  getItem: (k) => (storageStore.has(k) ? storageStore.get(k) : null),
  setItem: (k, v) => storageStore.set(k, String(v)),
  removeItem: (k) => storageStore.delete(k),
  clear: () => storageStore.clear()
};

const mockElements = {
  hellscapeSelect: { value: '0' },
  hellscapeDesc: { innerHTML: '', innerText: '' },
  warpIntensity: { value: 'major' },
  anomalyResultBox: { innerHTML: '' },
  vultureKillCheck: { checked: false },
  vulturePts: { innerText: '3 SPts' },
  unboundResult: { innerHTML: '' }
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
const pvpEnv = {};
const fn = new Function('document', 'localStorage', 'console', 'window', `${pvpScriptCode}; return {
  HELLSCAPES,
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
  transmitUnboundPing
};`);

const pvp = fn(globalThis.document, globalThis.localStorage, console, globalThis.window);

test('pvp: HELLSCAPES, ANOMALIES, and UNBOUND_UNITS contain valid crusade content', () => {
  assert.equal(pvp.HELLSCAPES.length, 6, 'Must define 6 Hellscape environments');
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

test('pvp: updateVulture calculates 3 SPts base or 4 SPts with player kill bonus', () => {
  mockElements.vultureKillCheck.checked = false;
  pvp.updateVulture(true);
  assert.equal(mockElements.vulturePts.innerText, '3 SPts');

  mockElements.vultureKillCheck.checked = true;
  pvp.updateVulture(true);
  assert.equal(mockElements.vulturePts.innerText, '4 SPts');

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

  // PL 2 Standard Ping
  transmittedChannel = null;
  transmittedPayload = null;
  pvp.transmitUnboundPing(2, 'beta');
  assert.equal(transmittedChannel, 'beta');
  assert.ok(transmittedPayload.includes('AUSPEX PING: POWER LEVEL 2 UNBOUND ADVERSARY DETECTED'));
  assert.ok(transmittedPayload.includes('roll/select our Power Level 2 Unbound Adversary'));
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

test('pvp: restorePvpState faithfully reconstructs UI state from localStorage', () => {
  localStorage.setItem(pvp.STORAGE_KEY_PVP, JSON.stringify({
    hellscapeIdx: 5,
    warpIntensity: 'minor',
    anomalyHtml: '<span class="test-surge">Warp Fluke</span>',
    vultureKilled: true,
    unboundHtml: '<p>Daemonic Beast</p>'
  }));

  pvp.restorePvpState();

  assert.equal(String(mockElements.hellscapeSelect.value), '5');
  assert.equal(mockElements.warpIntensity.value, 'minor');
  assert.equal(mockElements.anomalyResultBox.innerHTML, '<span class="test-surge">Warp Fluke</span>');
  assert.equal(mockElements.vultureKillCheck.checked, true);
  assert.equal(mockElements.vulturePts.innerText, '4 SPts');
  assert.equal(mockElements.unboundResult.innerHTML, '<p>Daemonic Beast</p>');
});
