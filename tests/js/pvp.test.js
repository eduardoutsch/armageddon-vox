/**
 * @fileoverview Unit test suite for js/pvp.js pure functional logic.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const pvpModule = require('../../js/pvp.js');

test('pvp pure: constants HELLSCAPES, ANOMALIES, UNBOUND_UNITS are populated and valid', () => {
  assert.equal(pvpModule.HELLSCAPES.length, 6);
  assert.equal(pvpModule.HELLSCAPE_NAMES.length, 6);
  assert.equal(pvpModule.ANOMALIES.length, 6);
  assert.equal(pvpModule.UNBOUND_UNITS.length, 4);

  pvpModule.HELLSCAPES.forEach(h => assert.ok(h.length > 20));
  pvpModule.ANOMALIES.forEach(a => assert.ok(a.length > 20));
  pvpModule.UNBOUND_UNITS.forEach(u => assert.ok(u.length > 20));
});

test('pvp pure: compilePvpVultureReport generates accurate reports for both Alpha and Beta conduits', () => {
  // Alpha conduit report
  const alphaReport = pvpModule.compilePvpVultureReport({
    channel: 'alpha',
    killedUnit: true,
    hellscapeIdx: 2,
    warpIntensity: 'major',
    notes: 'Encountered daemonic vanguard near eastern ridge.'
  });

  assert.ok(alphaReport.includes('+++ 1V1 ASH WASTES // 3RD ALLIANCE VULTURE SPTS REPORT +++'));
  assert.ok(alphaReport.includes('THE EXILE // SANCTUARY OF ASH'));
  assert.ok(alphaReport.includes('4 SPts'));
  assert.ok(alphaReport.includes('Fading Reality'));
  assert.ok(alphaReport.includes('Encountered daemonic vanguard'));

  // Beta conduit report
  const betaReport = pvpModule.compilePvpVultureReport({
    channel: 'beta',
    killedUnit: false,
    hellscapeIdx: 0,
    warpIntensity: 'minor',
    notes: 'Royal tomb sweeps detected minor scavengers.'
  });

  assert.ok(betaReport.includes('+++ TOMB-SHIP SENSOR SWEEP // 1V1 ASH WASTES VULTURE SPTS REPORT +++'));
  assert.ok(betaReport.includes('LORD COMMANDER JUNEBUG'));
  assert.ok(betaReport.includes('3 SPts'));
  assert.ok(betaReport.includes('Folded Space'));
  assert.ok(betaReport.includes('Royal tomb sweeps'));
});

test('pvp pure: compilePvpVultureReport handles empty/default inputs and out-of-bounds hellscape indices', () => {
  const defaultAlpha = pvpModule.compilePvpVultureReport();
  assert.ok(defaultAlpha.includes('THE EXILE // SANCTUARY OF ASH'));
  assert.ok(defaultAlpha.includes('3 SPts'));
  assert.ok(defaultAlpha.includes('Folded Space // Intensity: MAJOR'));
  assert.ok(defaultAlpha.includes('1v1 Ash Wastes clash concluded. Reporting 3rd Alliance Vulture Strategic Points to Campaign Master.'));

  const defaultBeta = pvpModule.compilePvpVultureReport({
    channel: 'beta',
    hellscapeIdx: 99,
    intensity: 'catastrophic'
  });
  assert.ok(defaultBeta.includes('LORD COMMANDER JUNEBUG'));
  assert.ok(defaultBeta.includes('Folded Space // Intensity: CATASTROPHIC'));
  assert.ok(defaultBeta.includes('Reporting 3rd Alliance Vulture Strategic Points to Tomb-Ship Master Matrix.'));
});

test('pvp boundary adapters: updateVulture, renderHellscape, rollWarpAnomaly, and transmitUnboundPing', () => {
  const els = {
    hellscapeSelect: { value: '1' },
    hellscapeDesc: { innerHTML: '' },
    warpIntensity: { value: 'catastrophic' },
    anomalyResultBox: { innerHTML: '' },
    vultureKillCheck: { checked: true },
    vulturePts: { innerText: '', textContent: '' },
    pvpReportSpBadge: { textContent: '' },
    pvpReportChannel: { value: 'beta' },
    pvpReportNotes: { value: 'Necron monoliths secured the ridge.' },
    pvpVulturePreviewBox: { textContent: '', classList: { toggle: () => {} } },
    unboundResult: { innerHTML: '' }
  };

  const store = {};
  globalThis.localStorage = {
    getItem: (k) => store[k] || null,
    setItem: (k, v) => { store[k] = String(v); }
  };
  globalThis.document = {
    getElementById: (id) => els[id] || null
  };

  let transmitted = null;
  globalThis.window = {
    VoxAudio: {
      playClank: () => {},
      playWarpSiren: () => {},
      playAuspexLock: () => {},
      transmitToVox: (chan, payload) => {
        transmitted = { chan, payload };
      }
    }
  };

  pvpModule.renderHellscape(true);
  assert.ok(els.hellscapeDesc.innerHTML.includes('Fractured Realm'));

  pvpModule.updateVulture(true);
  assert.equal(els.vulturePts.textContent, '4 SPts');
  assert.equal(els.pvpReportSpBadge.textContent, '4 SPts');

  pvpModule.rollWarpAnomaly();
  assert.ok(
    els.anomalyResultBox.innerHTML.includes('WARP SURGE!') ||
    els.anomalyResultBox.innerHTML.includes('Reality Holds')
  );

  pvpModule.rollUnboundAdversary();
  assert.ok(els.unboundResult.innerHTML.includes('transmitUnboundPing'));

  // Test PL 4 Apex Anomaly ping on Beta vs PL 2 on Alpha
  pvpModule.transmitUnboundPing(4, 'beta');
  assert.equal(transmitted.chan, 'beta');
  assert.ok(transmitted.payload.includes('POWER LEVEL 4 APEX ANOMALY DETECTED'));
  assert.ok(transmitted.payload.includes('PHAERON JUNEBUG'));

  pvpModule.transmitUnboundPing(2, 'alpha');
  assert.equal(transmitted.chan, 'alpha');
  assert.ok(transmitted.payload.includes('POWER LEVEL 2 UNBOUND ADVERSARY DETECTED'));
  assert.ok(transmitted.payload.includes('THE EXILE'));

  // Reset form
  pvpModule.resetPvpVultureReportForm();
  assert.equal(els.pvpReportChannel.value, 'alpha');
  assert.equal(els.vultureKillCheck.checked, false);
  assert.equal(els.pvpReportNotes.value, '');
  assert.equal(els.vulturePts.textContent, '3 SPts');

  delete globalThis.localStorage;
  delete globalThis.document;
  delete globalThis.window;
});
