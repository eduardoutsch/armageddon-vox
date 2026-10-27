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
