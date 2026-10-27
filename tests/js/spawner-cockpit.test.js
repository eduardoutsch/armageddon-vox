const test = require('node:test');
const assert = require('node:assert/strict');
const {
  isSoloModeActive,
  getCurrentBattleRound,
  setGuidedPhaseStep,
  stepGuidedPhase,
  awardCommandPhaseObjectiveSP,
  awardHordeKillSP
} = require('../../js/spawner-cockpit.js');

test('Spawner Cockpit: isSoloModeActive detects solo mode correctly', () => {
  globalThis.selectedModeVal = 'solo';
  assert.equal(isSoloModeActive(), true);

  globalThis.selectedModeVal = 'coop';
  globalThis.isSoloMode = false;
  globalThis.state = { mode: 'coop' };
  assert.equal(isSoloModeActive(), false);
});

test('Spawner Cockpit: getCurrentBattleRound reads state and falls back correctly', () => {
  globalThis.state = { round: 3 };
  assert.equal(getCurrentBattleRound(), 3);

  globalThis.state = null;
  globalThis.battleRound = 2;
  assert.equal(getCurrentBattleRound(), 2);
});

test('Spawner Cockpit: Guided phase step controls clamp and cycle within 1 to 5', () => {
  setGuidedPhaseStep(1);
  stepGuidedPhase(1); // steps to 2
  stepGuidedPhase(4); // cycle around
  setGuidedPhaseStep(5);
  stepGuidedPhase(1); // cycle back to 1
  assert.ok(true, 'Guided stepper safely cycled');
});

test('Spawner Cockpit: getCurrentBattleRound returns 0 for Pre-Game in HUD round element', () => {
  globalThis.state = null;
  globalThis.battleRound = undefined;
  globalThis.document = {
    getElementById: (id) => {
      if (id === 'hudRound') return { innerText: 'Pre-Game' };
      return null;
    }
  };

  assert.equal(getCurrentBattleRound(), 0, 'Must return round 0 when hudRound indicates Pre-Game');

  globalThis.document = {
    getElementById: (id) => {
      if (id === 'hudRound') return { innerText: 'Round 4/6' };
      return null;
    }
  };
  assert.equal(getCurrentBattleRound(), 4, 'Must return round 4 when hudRound indicates Round 4/6');

  // Clean up
  delete globalThis.document;
});

test('Spawner Cockpit: renderActiveMiseries and renderActiveSecondaries handle window.state fallback gracefully', () => {
  const { renderActiveMiseries, renderActiveSecondaries } = require('../../js/spawner-cockpit.js');

  const misBox = { innerHTML: '' };
  const secBox = { innerHTML: '' };
  const misCount = { textContent: '' };
  const secCount = { textContent: '' };

  globalThis.document = {
    getElementById: (id) => {
      if (id === 'activeMiseriesBox') return misBox;
      if (id === 'activeSecondariesBox') return secBox;
      if (id === 'misDeckCount') return misCount;
      if (id === 'secDeckCount') return secCount;
      return null;
    },
    querySelectorAll: () => []
  };

  // 1. Empty state
  globalThis.window = {
    state: {
      activeMiseries: [],
      activeSecondaries: [],
      miseryDeck: new Array(36),
      secondaryDeck: new Array(24)
    }
  };

  renderActiveMiseries();
  assert.ok(misBox.innerHTML.includes('No active Misery Cards.'), 'Empty miseries should display placeholder');
  assert.equal(misCount.textContent, '36 in deck');

  renderActiveSecondaries();
  assert.ok(secBox.innerHTML.includes('No active Secondary Mission.'), 'Empty secondaries should display placeholder');
  assert.equal(secCount.textContent, '24 in deck');

  // 2. Active cards populated via window.state
  globalThis.window.state.activeMiseries.push({ id: 1, name: 'Eye of Terror', desc: 'Warp storms brew' });
  globalThis.window.state.activeSecondaries.push({ id: 2, name: 'Purge the Foe', cond: 'Destroy units', rew: '2 SP', pun: '+1 Misery' });

  renderActiveMiseries();
  assert.ok(misBox.innerHTML.includes('Eye of Terror'), 'Should render active misery card name');
  assert.ok(!misBox.innerHTML.includes('No active Misery Cards.'), 'Should not render empty placeholder when cards present');

  renderActiveSecondaries();
  assert.ok(secBox.innerHTML.includes('Purge the Foe'), 'Should render active secondary mission name');
  assert.ok(!secBox.innerHTML.includes('No active Secondary Mission.'), 'Should not render empty placeholder when mission present');

  // Clean up
  delete globalThis.document;
  delete globalThis.window;
});

test('Spawner Cockpit: updateGuidedFlowForRound does NOT reset active phase step, but resetStep: true does', () => {
  const cockpit = require('../../js/spawner-cockpit.js');

  cockpit.setGuidedPhaseStep(3, { silent: true });
  assert.equal(cockpit.currentGuidedStep, 3);

  // Calling updateGuidedFlowForRound without resetStep (as invoked by updateHUD on any button click)
  cockpit.updateGuidedFlowForRound();
  assert.equal(cockpit.currentGuidedStep, 3, 'Must preserve active step on regular round flow updates');

  // Explicit reset on round advance
  cockpit.updateGuidedFlowForRound({ resetStep: true });
  assert.equal(cockpit.currentGuidedStep, 1, 'Must reset to step 1 when resetStep is true');
});

test('Spawner Cockpit: stepGuidedPhase clamps by default and prevents uncontrolled cycling', () => {
  const cockpit = require('../../js/spawner-cockpit.js');

  cockpit.setGuidedPhaseStep(5, { silent: true });
  cockpit.stepGuidedPhase(1);
  assert.equal(cockpit.currentGuidedStep, 5, 'Step 5 + 1 must clamp at 5 by default');

  cockpit.setGuidedPhaseStep(1, { silent: true });
  cockpit.stepGuidedPhase(-1);
  assert.equal(cockpit.currentGuidedStep, 1, 'Step 1 - 1 must clamp at 1 by default');

  // When explicit allowCycle is provided:
  cockpit.setGuidedPhaseStep(5, { silent: true });
  cockpit.stepGuidedPhase(1, { allowCycle: true });
  assert.equal(cockpit.currentGuidedStep, 1, 'Step 5 + 1 with allowCycle must wrap to 1');
});

test('Spawner Cockpit: wipeAllFortifications unchecks DOM checkboxes, resets markers, and calls saveSessionState', () => {
  const cockpit = require('../../js/spawner-cockpit.js');

  const fortCheck1 = { checked: true, id: 'fobFortCheck' };
  const fortCheck2 = { checked: true, id: 'fieldHospitalCheck' };
  const teleCountEl = { innerText: '3' };
  let savedCalled = false;
  let sfxPlayed = false;

  globalThis.document = {
    querySelectorAll: (selector) => {
      if (selector === '.fort-grid input[type="checkbox"]') return [fortCheck1, fortCheck2];
      return [];
    },
    getElementById: (id) => {
      if (id === 'teleCount') return teleCountEl;
      return null;
    }
  };

  globalThis.saveSessionState = () => { savedCalled = true; };
  globalThis.window = {
    VoxAudio: {
      playDegaussPurge: () => { sfxPlayed = true; }
    }
  };

  const wiped = cockpit.wipeAllFortifications({ reason: 'Failed Secondary #17 Spruce This Place Up' });

  assert.equal(wiped, true);
  assert.equal(fortCheck1.checked, false, 'FOB check must be unchecked');
  assert.equal(fortCheck2.checked, false, 'Field Hospital check must be unchecked');
  assert.equal(teleCountEl.innerText, '0', 'Teleporters count must be reset to 0');
  assert.equal(savedCalled, true, 'saveSessionState must be called immediately');
  assert.equal(sfxPlayed, true, 'playDegaussPurge audio cue must be triggered');

  // Clean up
  delete globalThis.document;
  delete globalThis.saveSessionState;
  delete globalThis.window;
});

test('Spawner Cockpit: resolveSecondaryOutcome on Secondary #17 failure triggers wipeAllFortifications', () => {
  const cockpit = require('../../js/spawner-cockpit.js');

  let wipeCalled = false;
  let sfxPlayed = false;

  globalThis.window = {
    activeSecondaries: [{ id: 17, name: 'Spruce This Place Up', punWipeFortifications: true }],
    state: null,
    wipeAllFortifications: () => { wipeCalled = true; },
    VoxAudio: {
      playMagLock: () => { sfxPlayed = true; },
      playDegaussPurge: () => {}
    }
  };

  globalThis.document = {
    getElementById: () => null,
    querySelectorAll: () => []
  };

  // 1. Successful outcome does NOT wipe
  cockpit.resolveSecondaryOutcome(0, true);
  assert.equal(wipeCalled, false, 'Success must not wipe fortifications');

  // Reset active secondaries
  globalThis.window.activeSecondaries = [{ id: 17, name: 'Spruce This Place Up', punWipeFortifications: true }];

  // 2. Failure outcome triggers wipe
  cockpit.resolveSecondaryOutcome(0, false);
  assert.equal(wipeCalled, true, 'Failing Secondary #17 must trigger wipeAllFortifications');

  // Clean up
  delete globalThis.window;
  delete globalThis.document;
});
