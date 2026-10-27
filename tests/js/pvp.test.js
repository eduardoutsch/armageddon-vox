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
