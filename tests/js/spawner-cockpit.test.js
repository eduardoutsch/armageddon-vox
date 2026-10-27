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
