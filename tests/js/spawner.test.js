const test = require('node:test');
const assert = require('node:assert/strict');
const {
  getBracketInfo,
  calculateRollDown,
  pickSyncedUnitFromBracket,
  parseSpawnWaveSpec,
  normalizeEmbarkedUnits
} = require('../../js/spawner.js');
const { mulberry32 } = require('../../js/rng.js');

test('getBracketInfo: unmod 2 always results in No Spawn', () => {
  // Even if modified roll is high (e.g., +12 bonus), unmod 2 is No Spawn
  const result = getBracketInfo(14, 2);
  assert.equal(result.key, 'NONE');
  assert.equal(result.pts, '0 pts');
});

test('getBracketInfo: modified rolls <= 2 result in No Spawn', () => {
  const result = getBracketInfo(2, 3);
  assert.equal(result.key, 'NONE');
});

test('getBracketInfo: correctly categorizes all standard brackets', () => {
  assert.equal(getBracketInfo(3, 3).key, '3-4');
  assert.equal(getBracketInfo(4, 4).key, '3-4');
  assert.equal(getBracketInfo(5, 5).key, '5-6');
  assert.equal(getBracketInfo(6, 6).key, '5-6');
  assert.equal(getBracketInfo(7, 7).key, '7-9');
  assert.equal(getBracketInfo(8, 8).key, '7-9');
  assert.equal(getBracketInfo(9, 9).key, '7-9');
  assert.equal(getBracketInfo(10, 10).key, '10-12');
  assert.equal(getBracketInfo(10, 10).pts, '301–550 pts');
  assert.equal(getBracketInfo(12, 12).key, '10-12');
  assert.equal(getBracketInfo(13, 11).key, '13+');
  assert.equal(getBracketInfo(13, 11).pts, '551+ pts');
  assert.equal(getBracketInfo(16, 11).key, '13+');
});

test('calculateRollDown: cascades down correctly from 13+ to 10-12 down to 3-4', () => {
  const step0 = calculateRollDown('13+');
  assert.ok(step0);
  assert.equal(step0.nextKey, '10-12');

  const step1 = calculateRollDown('10-12');
  assert.ok(step1);
  assert.equal(step1.nextKey, '7-9');

  const step1Legacy = calculateRollDown('10+');
  assert.ok(step1Legacy);
  assert.equal(step1Legacy.nextKey, '7-9');

  const step2 = calculateRollDown('7-9');
  assert.ok(step2);
  assert.equal(step2.nextKey, '5-6');

  const step3 = calculateRollDown('5-6');
  assert.ok(step3);
  assert.equal(step3.nextKey, '3-4');

  const step4 = calculateRollDown('3-4');
  assert.equal(step4, null, 'Bracket 3-4 must not be able to roll down further');

  const noneStep = calculateRollDown('NONE');
  assert.equal(noneStep, null, 'NONE must not be able to roll down');
});

test('pickSyncedUnitFromBracket: picks from shelf pool and falls back gracefully', () => {
  const mockPool = {
    '3-4': 'Hormagaunts, Termagants, Cultists',
    '5-6': '',
    '7-9': 'Carnifex',
    '10-12': 'Hive Tyrant',
    '10+': 'Hive Tyrant',
    '13+': 'Hierophant Bio-Titan'
  };

  const rng = mulberry32(100);
  const picked34 = pickSyncedUnitFromBracket('3-4', rng, mockPool);
  assert.ok(['Hormagaunts', 'Termagants', 'Cultists'].includes(picked34));

  const fallback = pickSyncedUnitFromBracket('5-6', rng, mockPool);
  assert.equal(fallback, 'Unit from Bracket [5-6]');

  const picked79 = pickSyncedUnitFromBracket('7-9', rng, mockPool);
  assert.equal(picked79, 'Carnifex');

  const picked13 = pickSyncedUnitFromBracket('13+', rng, mockPool);
  assert.equal(picked13, 'Hierophant Bio-Titan');
});

test('pickSyncedUnitFromBracket: resolves per-faction pool from byFaction in localStorage with warning when empty', () => {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v))
  };

  const poolPayload = {
    byFaction: {
      'Orks': {
        b34: '10 Boyz',
        b56: '5 Nobz',
        b79: '1 Battlewagon',
        b10: '1 Ghazghkull',
        b13: '1 Stompa'
      }
    }
  };
  globalThis.localStorage.setItem('foa_custom_shelf_pool_v1', JSON.stringify(poolPayload));

  globalThis.document = {
    getElementById: (id) => {
      if (id === 'hordeFactionSelect') return { value: 'Orks' };
      return null;
    }
  };

  const rng = mulberry32(42);
  const picked = pickSyncedUnitFromBracket('3-4', rng);
  assert.equal(picked, '10 Boyz');

  // When active faction has no units for a bracket
  globalThis.document.getElementById = (id) => {
    if (id === 'hordeFactionSelect') return { value: 'Necrons' };
    return null;
  };
  const emptyRes = pickSyncedUnitFromBracket('5-6', rng);
  assert.equal(emptyRes, '⚠️ Necrons Pool Empty for Bracket [5-6] — Configure in Mode 4!');

  delete globalThis.localStorage;
  delete globalThis.document;
});

test('pickSyncedUnitFromBracket: enforces zero hardcoded defaults and ignores flat root keys when faction pool is empty', () => {
  const { HORDE_FACTION_SPAWN_TABLES } = require('../../js/data.js');
  globalThis.HORDE_FACTION_SPAWN_TABLES = HORDE_FACTION_SPAWN_TABLES;
  globalThis.localStorage = {
    getItem: () => JSON.stringify({
      b10: '1 Contaminated Root Unit',
      byFaction: { 'Orks': { b10: '1 Ghazghkull' } }
    })
  };
  globalThis.document = {
    getElementById: (id) => {
      if (id === 'hordeFactionSelect') return { value: 'World Eaters' };
      if (id === 'pool10') return { value: '1 Contaminated DOM Unit' };
      return null;
    }
  };

  const rng = mulberry32(77);
  const picked10 = pickSyncedUnitFromBracket('10-12', rng);
  assert.equal(picked10, '⚠️ World Eaters Pool Empty for Bracket [10-12] — Configure in Mode 4!');

  delete globalThis.HORDE_FACTION_SPAWN_TABLES;
  delete globalThis.localStorage;
  delete globalThis.document;
});

test('parseSpawnWaveSpec: parses counts, dice expressions, + combos, and [Embarked] tags cleanly', () => {
  const fixedRng = () => 0.99; // max roll on dice

  assert.deepEqual(parseSpawnWaveSpec('10 Termagants (Fleshborers)', fixedRng), [
    { count: 10, countExpr: '10', templateName: 'Termagants (Fleshborers)', embarked: null }
  ]);

  assert.deepEqual(parseSpawnWaveSpec('5 Bladeguard Veterans + 1 Captain', fixedRng), [
    { count: 5, countExpr: '5', templateName: 'Bladeguard Veterans', embarked: null },
    { count: 1, countExpr: '1', templateName: 'Captain', embarked: null }
  ]);

  assert.deepEqual(parseSpawnWaveSpec('1D3 Chaos Spawns', fixedRng), [
    { count: 3, countExpr: '1D3', templateName: 'Chaos Spawns', embarked: null }
  ]);

  assert.deepEqual(parseSpawnWaveSpec('D3+1 Scarabs', fixedRng), [
    { count: 4, countExpr: '1D3+1', templateName: 'Scarabs', embarked: null }
  ]);

  assert.deepEqual(parseSpawnWaveSpec('1 Chimera [10 Kasrkin]', fixedRng), [
    {
      count: 1,
      countExpr: '1',
      templateName: 'Chimera',
      embarked: { count: 10, countExpr: '10', templateName: 'Kasrkin', embarked: null }
    }
  ]);

  assert.deepEqual(parseSpawnWaveSpec('Avatar of Khaine', fixedRng), [
    { count: 1, countExpr: '1', templateName: 'Avatar of Khaine', embarked: null }
  ]);

  assert.deepEqual(parseSpawnWaveSpec('None'), []);
  assert.deepEqual(parseSpawnWaveSpec(null), []);
  assert.deepEqual(parseSpawnWaveSpec('⚠️ Necrons Pool Empty for Bracket [5-6] — Configure in Mode 4!'), []);

  // Multi-unit Attached Cargo inside a Transport: [5 Kill Team + 1 Watch Master]
  assert.deepEqual(parseSpawnWaveSpec('1 Corvus Blackstar [5 Kill Team + 1 Watch Master]', fixedRng), [
    {
      count: 1,
      countExpr: '1',
      templateName: 'Corvus Blackstar',
      embarked: [
        { count: 5, countExpr: '5', templateName: 'Kill Team', embarked: null },
        { count: 1, countExpr: '1', templateName: 'Watch Master', embarked: null }
      ]
    }
  ]);

  assert.equal(typeof normalizeEmbarkedUnits, 'function');
  assert.deepEqual(normalizeEmbarkedUnits(null), []);
  assert.deepEqual(
    normalizeEmbarkedUnits({ count: 10, countExpr: '10', templateName: 'Kasrkin', embarked: null }),
    [{ count: 10, templateName: 'Kasrkin' }]
  );
  assert.deepEqual(
    normalizeEmbarkedUnits([
      { count: 5, templateName: 'Kill Team' },
      { count: 1, templateName: 'Watch Master' }
    ]),
    [
      { count: 5, templateName: 'Kill Team' },
      { count: 1, templateName: 'Watch Master' }
    ]
  );
});
