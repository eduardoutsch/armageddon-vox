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

test('rogue pure: compileRogueDossier handles Xenos Victory, Contested fallback, and Beta nominee label', () => {
  const xenosBeta = rogueModule.compileRogueDossier({
    channel: 'beta',
    combatants: 'Ork Speed Freeks vs Tyranid Vanguard',
    outcome: 'Xenos Victory',
    nominee: 'Deffkilla Wartrike',
    notes: 'Xenos scavengers overran the eastern supply depot.'
  });
  assert.ok(xenosBeta.includes('+1 SPt to Marauders'));
  assert.ok(xenosBeta.includes('• SPECIMEN TARGETING NOMINEE: Deffkilla Wartrike'));

  const contestedDefault = rogueModule.compileRogueDossier({
    outcome: 'Unrecognized Stalemate'
  });
  assert.ok(contestedDefault.includes('Auxiliary Forces (Unspecified Factions)'));
  assert.ok(contestedDefault.includes('Zero SPt shift (Contested)'));
});

test('rogue state & adapters: setAiStep, nextAiStep, saveRogueState, restoreRogueState, and resetRogueDossierForm', () => {
  const makeStepEl = () => ({
    classList: {
      active: false,
      toggle(cls, force) { this.active = !!force; }
    },
    querySelector: () => ({ innerText: '' })
  });

  const els = {
    aiStep0: makeStepEl(),
    aiStep1: makeStepEl(),
    aiStep2: makeStepEl(),
    rogueReportChannel: { value: 'beta' },
    rogueCombatants: { value: 'World Eaters vs Space Marines' },
    rogueOutcome: { value: 'Chaos Victory' },
    rogueNemesisNominee: { value: 'Eightbound Champion' },
    rogueNotes: { value: 'Brutal melee clash.' },
    rogueDossierPreviewBox: { textContent: '', classList: { toggle: () => {} } }
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
      transmitToVox: (chan, payload) => { transmitted = { chan, payload }; }
    }
  };

  rogueModule.setAiStep(0);
  assert.equal(rogueModule.getCurrentAiStep(), 0);
  assert.equal(els.aiStep0.classList.active, true);

  rogueModule.nextAiStep();
  assert.equal(rogueModule.getCurrentAiStep(), 1);
  assert.equal(els.aiStep1.classList.active, true);

  rogueModule.nextAiStep();
  assert.equal(rogueModule.getCurrentAiStep(), 2);

  rogueModule.nextAiStep();
  assert.equal(rogueModule.getCurrentAiStep(), 0, 'nextAiStep must wrap from 2 back to 0');

  rogueModule.transmitRogueDossier();
  assert.equal(transmitted.chan, 'beta');
  assert.ok(transmitted.payload.includes('World Eaters vs Space Marines'));

  rogueModule.resetRogueDossierForm();
  assert.equal(els.rogueReportChannel.value, 'alpha');
  assert.equal(els.rogueCombatants.value, '');
  assert.equal(els.rogueOutcome.value, 'Imperium Victory');
  assert.equal(els.rogueNemesisNominee.value, '');

  delete globalThis.localStorage;
  delete globalThis.document;
  delete globalThis.window;
});
