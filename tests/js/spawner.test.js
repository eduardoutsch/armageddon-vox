const test = require('node:test');
const assert = require('node:assert/strict');
const { getBracketInfo, calculateRollDown, pickSyncedUnitFromBracket } = require('../../js/spawner.js');
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

test('pickSyncedUnitFromBracket: falls back to canonical HORDE_FACTION_SPAWN_TABLES when custom storage is empty', () => {
  const { HORDE_FACTION_SPAWN_TABLES } = require('../../js/data.js');
  globalThis.HORDE_FACTION_SPAWN_TABLES = HORDE_FACTION_SPAWN_TABLES;
  globalThis.document = {
    getElementById: (id) => {
      if (id === 'hordeFactionSelect') return { value: 'World Eaters' };
      return null;
    }
  };

  const rng = mulberry32(77);
  const picked10 = pickSyncedUnitFromBracket('10-12', rng);
  assert.ok(
    HORDE_FACTION_SPAWN_TABLES['World Eaters'].b10.includes(picked10),
    `Expected unit from World Eaters b10, got: ${picked10}`
  );

  delete globalThis.HORDE_FACTION_SPAWN_TABLES;
  delete globalThis.document;
});
