/**
 * @fileoverview Unit test suite for js/rogue.js pure functional logic.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const rogueModule = require('../../js/rogue.js');

test('rogue pure: ROGUE_OUTCOME_IMPACTS maps all 4 standard outcomes to consequences', () => {
  assert.equal(typeof rogueModule.ROGUE_OUTCOME_IMPACTS, 'object');
  const outcomes = ['Imperium Victory', 'Chaos Victory', 'Xenos Victory', 'Contested'];

  outcomes.forEach(key => {
    const entry = rogueModule.ROGUE_OUTCOME_IMPACTS[key];
    assert.ok(entry, `Outcome '${key}' must exist in lookup table`);
    assert.ok(entry.planetaryImpact, `Outcome '${key}' must specify planetaryImpact`);
    assert.ok(entry.hegemonyImpact, `Outcome '${key}' must specify hegemonyImpact`);
  });
});

test('rogue pure: compileRogueDossier formats battle report with planetary and alliance consequences', () => {
  // Alpha conduit report
  const alphaReport = rogueModule.compileRogueDossier({
    channel: 'alpha',
    combatants: '144th Krieg Siege Regiment vs Death Guard 7th Plague Company',
    outcome: 'Imperium Victory',
    nominee: 'Lord of Contagion (Nurgle Terminator)',
    notes: 'Bitter trench engagement amidst the toxic mire.'
  });

  assert.ok(alphaReport.includes('+++ ROGUE SECTOR AUXILIARY BATTLE REPORT +++'));
  assert.ok(alphaReport.includes('THE EXILE // SANCTUARY OF ASH'));
  assert.ok(alphaReport.includes('144th Krieg Siege Regiment'));
  assert.ok(alphaReport.includes('Imperium Victory'));
  assert.ok(alphaReport.includes('+1 SPt to Gatebreakers'));
  assert.ok(alphaReport.includes('Lord of Contagion'));
  assert.ok(alphaReport.includes('Bitter trench engagement'));

  // Beta conduit report
  const betaReport = rogueModule.compileRogueDossier({
    channel: 'beta',
    combatants: 'Canoptek Swarm vs Orks',
    outcome: 'Chaos Victory',
    nominee: '',
    notes: 'Chaos daemons manifested unexpectedly.'
  });

  assert.ok(betaReport.includes('+++ TOMB-SHIP QUANTUM SURVEILLANCE // ROGUE SECTOR AUXILIARY BATTLE REPORT +++'));
  assert.ok(betaReport.includes('LORD COMMANDER JUNEBUG'));
  assert.ok(betaReport.includes('Canoptek Swarm vs Orks'));
  assert.ok(betaReport.includes('Chaos Victory'));
  assert.ok(betaReport.includes('+1 SPt to Desecrators'));
  assert.ok(!betaReport.includes('NOMINEE:'));
});
