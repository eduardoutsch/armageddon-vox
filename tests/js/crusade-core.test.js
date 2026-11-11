/**
 * @fileoverview Unit tests for js/crusade-core.js pure Functional Core, ViewModel selectors,
 * declarative lookup tables, RNG-injectable upgrade/resource rollers, and DOM-free dossier compilers.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '../../');
const crusadeData = require(path.join(ROOT_DIR, 'js/crusade-data.js'));
const hordeStats = require(path.join(ROOT_DIR, 'js/horde-battle-stats.js'));
const core = require(path.join(ROOT_DIR, 'js/crusade-core.js'));

function makeSeqRng(floats) {
  let idx = 0;
  return () => {
    const val = floats[idx % floats.length];
    idx += 1;
    return val;
  };
}

test('Humble View Purity Guard: js/crusade-core.js has zero DOM, storage, timer, audio, or network calls', () => {
  const src = fs.readFileSync(path.join(ROOT_DIR, 'js/crusade-core.js'), 'utf8');
  for (const forbidden of ['document.', 'localStorage', 'sessionStorage', 'VoxAudio', 'setTimeout(', 'fetch(']) {
    assert.equal(src.includes(forbidden), false, `js/crusade-core.js must remain pure and free of ${forbidden}`);
  }
});

test('State Initialization & Hydration: createInitialCrusadeState and hydrateCrusadeState merge nested sub-states cleanly', () => {
  const initial = core.createInitialCrusadeState();
  assert.equal(initial.hordeSP, 1);
  assert.equal(initial.activeTab, 'board');
  assert.deepEqual(initial.logistics, { lexmechanicus: 1, materiel: 2, tithePool: 0, morale: 1 });
  assert.deepEqual(initial.tombSystems, { command: 1, reanimation: 1, translocation: 0 });
  assert.equal(initial.votann.goalProgress, 0);

  const hydrated = core.hydrateCrusadeState(initial, {
    activeTab: 'votann',
    alphaSP: 9,
    logistics: { lexmechanicus: 2, materiel: 2, tithePool: 0, morale: 0 },
    tombSystems: { command: 3 },
    votann: { rawMinerals: 50, rare: { energySources: 2 }, assets: { outpost1: 'Upgraded' } }
  });

  assert.equal(hydrated.activeTab, 'votann');
  assert.equal(hydrated.alphaSP, 9);
  assert.equal(hydrated.hordeSP, 1);
  assert.equal(hydrated.logistics.lexmechanicus, 2);
  assert.equal(hydrated.tombSystems.command, 3);
  assert.equal(hydrated.tombSystems.reanimation, 1);
  assert.equal(hydrated.votann.rawMinerals, 50);
  assert.equal(hydrated.votann.rare.energySources, 2);
  assert.equal(hydrated.votann.rare.rawMinerals, 0);
  assert.equal(hydrated.votann.assets.outpost1, 'Upgraded');
});

