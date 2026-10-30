/**
 * @fileoverview Unit test suite for js/briefing.js functional logic.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const briefingModule = require('../../js/briefing.js');

test('briefing pure: ATLAS_NODES defines all 8 sector nodes with required properties', () => {
  assert.equal(typeof briefingModule.ATLAS_NODES, 'object');
  const keys = Object.keys(briefingModule.ATLAS_NODES);
  assert.equal(keys.length, 8);

  for (let i = 0; i <= 7; i++) {
    const node = briefingModule.ATLAS_NODES[i];
    assert.ok(node, `Node ${i} must exist`);
    assert.ok(node.title, `Node ${i} must have title`);
    assert.ok(node.badge, `Node ${i} must have badge`);
    assert.ok(node.lore, `Node ${i} must have lore`);
    assert.ok(node.rule, `Node ${i} must have rule`);
    assert.equal(typeof node.alphaHP, 'number');
    assert.equal(typeof node.betaHP, 'number');
  }
});

test('briefing pure: SHIP_SLIDER_DATA spans from -3 to +3', () => {
  assert.equal(typeof briefingModule.SHIP_SLIDER_DATA, 'object');
  for (let i = -3; i <= 3; i++) {
    const entry = briefingModule.SHIP_SLIDER_DATA[String(i)];
    assert.ok(entry, `Slider level ${i} must exist`);
    assert.ok(entry.title, `Slider level ${i} must have title`);
    assert.ok(entry.desc, `Slider level ${i} must have desc`);
  }
});

test('briefing pure: getDominanceText returns correct narrative for various HP combinations', () => {
  assert.equal(briefingModule.getDominanceText(null), '');
  
  // Fog of war
  const fogNode = { alphaHP: 0, betaHP: 0, hordeHP: null };
  assert.ok(briefingModule.getDominanceText(fogNode).includes('Fog of War'));

  // Beta leading
  const betaLead = { alphaHP: 1, betaHP: 3, hordeHP: 0 };
  assert.ok(briefingModule.getDominanceText(betaLead).includes('Lord Commander Junebug Leading'));

  // Alpha leading
  const alphaLead = { alphaHP: 4, betaHP: 2, hordeHP: 1 };
  assert.ok(briefingModule.getDominanceText(alphaLead).includes('Sanctuary of Ash Leading'));

  // Horde leading
  const hordeLead = { alphaHP: 1, betaHP: 2, hordeHP: 5 };
  assert.ok(briefingModule.getDominanceText(hordeLead).includes('3rd Alliance Leading'));

  // Stalemate / tie
  const tieNode = { alphaHP: 2, betaHP: 2, hordeHP: 1 };
  assert.ok(briefingModule.getDominanceText(tieNode).includes('Contested Stalemate'));
});

test('briefing pure: CURRENT_SHIP_SLIDER is locked to -1', () => {
  assert.equal(briefingModule.CURRENT_SHIP_SLIDER, -1);
});

test('briefing pure: showDossier supports gamma and selectBriefingConduit routes correctly', () => {
  assert.equal(typeof briefingModule.showDossier, 'function');
  assert.equal(typeof briefingModule.selectBriefingConduit, 'function');
  briefingModule.showDossier('gamma', false);
  assert.equal(briefingModule.briefingState.activeDossier, 'gamma');
  briefingModule.selectBriefingConduit('beta');
  assert.equal(briefingModule.briefingState.activeDossier, 'beta');
  briefingModule.selectBriefingConduit('gamma');
  assert.equal(briefingModule.briefingState.activeDossier, 'gamma');
});

test('briefing pure: unlockTab and lockTab handle Gamma with dedicated gamma audio cues', () => {
  const audioCalls = [];
  globalThis.window = {
    VoxAudio: {
      playBriefingDecode: (ch) => audioCalls.push(`decode:${ch}`),
      playTerminalPowerOff: (ch) => audioCalls.push(`poweroff:${ch}`),
      setFactionTheme: () => {}
    }
  };

  briefingModule.unlockTab('Gamma', false);
  assert.equal(briefingModule.briefingState.unlockedGamma, true);
  assert.equal(audioCalls.includes('decode:gamma'), true, 'unlockTab(Gamma) must invoke playBriefingDecode("gamma")');
  assert.equal(audioCalls.includes('decode:alpha'), false, 'unlockTab(Gamma) must NOT invoke playBriefingDecode("alpha")');

  briefingModule.lockTab('Gamma', false);
  assert.equal(briefingModule.briefingState.unlockedGamma, false);
  assert.equal(audioCalls.includes('poweroff:gamma'), true, 'lockTab(Gamma) must invoke playTerminalPowerOff("gamma")');
  assert.equal(audioCalls.includes('poweroff:alpha'), false, 'lockTab(Gamma) must NOT invoke playTerminalPowerOff("alpha")');
});

test('briefing pure: selectSlider and selectAtlasNode update briefingState accurately', () => {
  for (let s = -3; s <= 3; s++) {
    briefingModule.selectSlider(s, false);
    assert.equal(briefingModule.briefingState.shipSlider, s);
  }

  for (let n = 0; n <= 7; n++) {
    briefingModule.selectAtlasNode(n, false);
    assert.equal(briefingModule.briefingState.selectedNode, n);
  }
});

test('briefing pure: restoreBriefingState honors URL hash and search query parameters over stored state', () => {
  const mockStorage = {};
  globalThis.localStorage = {
    getItem: (k) => mockStorage[k] || null,
    setItem: (k, v) => { mockStorage[k] = String(v); }
  };

  mockStorage[briefingModule.BRIEFING_STORAGE_KEY] = JSON.stringify({
    activeDossier: 'alpha',
    unlockedAlpha: true,
    shipSlider: 1,
    selectedNode: 4
  });

  // 1. URL hash #gamma takes precedence over stored 'alpha'
  globalThis.window = {
    location: { hash: '#gamma', search: '' },
    VoxAudio: { setFactionTheme: () => {} }
  };
  briefingModule.restoreBriefingState();
  assert.equal(briefingModule.briefingState.activeDossier, 'gamma');
  assert.equal(briefingModule.briefingState.unlockedAlpha, true);
  assert.equal(briefingModule.briefingState.selectedNode, 4);

  // 2. URL search ?tab=atlas takes precedence when hash is empty
  globalThis.window = {
    location: { hash: '', search: '?tab=atlas' },
    VoxAudio: { setFactionTheme: () => {} }
  };
  briefingModule.restoreBriefingState();
  assert.equal(briefingModule.briefingState.activeDossier, 'atlas');

  delete globalThis.localStorage;
});


