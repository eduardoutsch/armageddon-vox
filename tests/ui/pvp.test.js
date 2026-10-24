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
  vulturePts: { innerText: '3 SPts', textContent: '3 SPts' },
  pvpReportSpBadge: { textContent: '3 SPts' },
  unboundResult: { innerHTML: '' },
  pvpReportChannel: { value: 'alpha' },
  pvpReportNotes: { value: '' },
  pvpVulturePreviewBox: { textContent: '' }
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

  // PL 2 Standard Ping
  transmittedChannel = null;
  transmittedPayload = null;
  pvp.transmitUnboundPing(2, 'beta');
  assert.equal(transmittedChannel, 'beta');
  assert.ok(transmittedPayload.includes('AUSPEX PING: POWER LEVEL 2 UNBOUND ADVERSARY DETECTED'));
  assert.ok(transmittedPayload.includes('roll/select our Power Level 2 Unbound Adversary'));
});

test('pvp: buildPvpVultureReportString and transmitPvpVultureReport compile and send Campaign Master 3rd Alliance SPts report separately from Unbound Adversary roller', () => {
  assert.ok(
    pvpHtml.includes('transmitPvpVultureReport()'),
    'pages/pvp.html must include a dedicated button calling transmitPvpVultureReport()'
  );
  assert.ok(
    pvpHtml.includes('rollUnboundAdversary()') && pvpHtml.includes('transmitUnboundPing('),
    'pages/pvp.html must keep rollUnboundAdversary() and transmitUnboundPing() separate'
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
