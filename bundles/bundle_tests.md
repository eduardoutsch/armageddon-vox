# 📦 Fires of Armageddon // Bundle: Test Suites & Verification

Unit, boundary, integration, and UI verification test suites for all game modes, data schemas, RNG determinism, and page requirements (`tests/**/*.test.js`).

## 📑 Table of Contents
- [tests/js/data.test.js](#file-testsjsdatatestjs)
- [tests/js/rng.test.js](#file-testsjsrngtestjs)
- [tests/js/spawner.test.js](#file-testsjsspawnertestjs)
- [tests/js/app.test.js](#file-testsjsapptestjs)
- [tests/js/vox-audio.test.js](#file-testsjsvoxaudiotestjs)
- [tests/vox_bridge.test.js](#file-testsvoxbridgetestjs)
- [tests/ui/pages.test.js](#file-testsuipagestestjs)
- [tests/ui/briefing.test.js](#file-testsuibriefingtestjs)
- [tests/ui/pvp.test.js](#file-testsuipvptestjs)
- [tests/ui/rogue.test.js](#file-testsuiroguetestjs)
- [tests/ui/roster.test.js](#file-testsuirostertestjs)
- [tests/ui/crusade.test.js](#file-testsuicrusadetestjs)
- [tests/ui/vox.test.js](#file-testsuivoxtestjs)

---

## File: `tests/js/data.test.js` <a id="file-testsjsdatatestjs"></a>

````javascript
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  HORDE_FACTIONS,
  OBJECTIVES,
  MISERIES,
  SECONDARIES,
  RESUPPLIES,
  HARD_MODE_ROUNDS
} = require('../../js/data.js');

test('HORDE_FACTIONS: contains all 23 official factions with valid schema', () => {
  assert.equal(HORDE_FACTIONS.length, 23);
  const validGroups = new Set(['Imperium', 'Chaos', 'Xenos']);

  HORDE_FACTIONS.forEach(f => {
    assert.ok(f.name && typeof f.name === 'string');
    assert.ok(validGroups.has(f.group), `Invalid group: ${f.group} for ${f.name}`);
    assert.ok(f.ruleTitle && typeof f.ruleTitle === 'string');
    assert.ok(f.desc && typeof f.desc === 'string');
  });
});

test('OBJECTIVES: contains 34 unique secret objectives with valid CM codes', () => {
  assert.equal(OBJECTIVES.length, 34);
  const ids = new Set();
  const codes = new Set();

  OBJECTIVES.forEach(o => {
    assert.ok(!ids.has(o.id), `Duplicate objective id: ${o.id}`);
    assert.ok(!codes.has(o.code), `Duplicate objective code: ${o.code}`);
    ids.add(o.id);
    codes.add(o.code);

    assert.ok(o.name && typeof o.name === 'string');
    assert.ok(o.tags && typeof o.tags === 'string');
    assert.ok(o.desc && typeof o.desc === 'string');
  });
});

test('MISERIES: contains 36 unique misery cards', () => {
  assert.equal(MISERIES.length, 36);
  const ids = new Set();

  MISERIES.forEach(m => {
    assert.ok(!ids.has(m.id), `Duplicate misery id: ${m.id}`);
    ids.add(m.id);
    assert.ok(m.name && typeof m.name === 'string');
    assert.ok(m.desc && typeof m.desc === 'string');
  });
});

test('SECONDARIES: contains 24 secondary missions with valid condition, reward, punishment', () => {
  assert.equal(SECONDARIES.length, 24);
  SECONDARIES.forEach(s => {
    assert.ok(s.id >= 1 && s.id <= 24);
    assert.ok(typeof s.r1Skip === 'boolean');
    assert.ok(s.name && typeof s.name === 'string');
    assert.ok(s.cond && typeof s.cond === 'string');
    assert.ok(s.rew && typeof s.rew === 'string');
    assert.ok(s.pun && typeof s.pun === 'string');
  });
});

test('RESUPPLIES: all cards have defined costs, names, and tags', () => {
  assert.ok(RESUPPLIES.length >= 25);
  RESUPPLIES.forEach(r => {
    assert.ok(typeof r.cost === 'number');
    assert.ok(r.name && typeof r.name === 'string');
    assert.ok(r.tags && typeof r.tags === 'string');
    assert.ok(r.desc && typeof r.desc === 'string');
  });
});

test('HARD_MODE_ROUNDS: correctly specifies 6 rounds with Round 6 Final Stand', () => {
  for (let r = 1; r <= 6; r++) {
    const roundCfg = HARD_MODE_ROUNDS[r];
    assert.ok(roundCfg, `Missing config for round ${r}`);
    assert.ok(typeof roundCfg.misery === 'number');
    assert.ok(typeof roundCfg.spawnModNum === 'number');
    assert.ok(roundCfg.spawnMod && typeof roundCfg.spawnMod === 'string');
  }
  // Round 6 has spawnModNum = -99 (Final Stand)
  assert.equal(HARD_MODE_ROUNDS[6].spawnModNum, -99);
});
````

---

## File: `tests/js/rng.test.js` <a id="file-testsjsrngtestjs"></a>

````javascript
const test = require('node:test');
const assert = require('node:assert/strict');
const { hashString, mulberry32, seededShuffle, generateRandomCode, ROOM_CODE_PREFIXES } = require('../../js/rng.js');

test('hashString should produce deterministic 32-bit uint', () => {
  const hash1 = hashString('HADES-1');
  const hash2 = hashString('HADES-1');
  assert.equal(hash1, hash2);
  assert.equal(typeof hash1, 'number');
  assert.ok(hash1 >= 0 && hash1 <= 4294967295);
});

test('hashString should differentiate distinct strings', () => {
  const hA = hashString('HADES-1_SEC');
  const hB = hashString('HADES-1_MIS');
  assert.notEqual(hA, hB);
});

test('mulberry32 should produce deterministic sequences for identical seeds', () => {
  const rng1 = mulberry32(12345);
  const rng2 = mulberry32(12345);

  const seq1 = [rng1(), rng1(), rng1(), rng1(), rng1()];
  const seq2 = [rng2(), rng2(), rng2(), rng2(), rng2()];

  assert.deepEqual(seq1, seq2);
});

test('mulberry32 generates numbers in [0, 1)', () => {
  const rng = mulberry32(99999);
  for (let i = 0; i < 500; i++) {
    const val = rng();
    assert.ok(val >= 0 && val < 1, `Value ${val} out of bounds [0, 1)`);
  }
});

test('seededShuffle preserves array elements without losing or duplicating items', () => {
  const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const rng = mulberry32(42);
  const shuffled = seededShuffle(original, rng);

  assert.equal(shuffled.length, original.length);
  assert.deepEqual([...shuffled].sort((a, b) => a - b), original);
  // Ensure immutability of the original array
  assert.deepEqual(original, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
});

test('seededShuffle is strictly reproducible across runs', () => {
  const deck = ['A', 'B', 'C', 'D', 'E', 'F'];
  const rng1 = mulberry32(hashString('ROOM_TEST_1'));
  const rng2 = mulberry32(hashString('ROOM_TEST_1'));

  const s1 = seededShuffle(deck, rng1);
  const s2 = seededShuffle(deck, rng2);

  assert.deepEqual(s1, s2);
});

test('generateRandomCode returns a string with valid prefix and 2-digit number from expanded ROOM_CODE_PREFIXES pool', () => {
  assert.ok(Array.isArray(ROOM_CODE_PREFIXES), 'Must export ROOM_CODE_PREFIXES array');
  assert.ok(ROOM_CODE_PREFIXES.length >= 40, `Expected at least 40 room prefixes, got ${ROOM_CODE_PREFIXES.length}`);

  const uniquePrefixes = new Set(ROOM_CODE_PREFIXES);
  assert.equal(uniquePrefixes.size, ROOM_CODE_PREFIXES.length, 'All room code prefixes must be unique');

  for (let i = 0; i < 50; i++) {
    const code = generateRandomCode();
    assert.match(code, /^[A-Z]+-\d{2}$/);
    const prefix = code.split('-')[0];
    assert.ok(uniquePrefixes.has(prefix), `Generated prefix ${prefix} must belong to ROOM_CODE_PREFIXES`);
  }
});

````

---

## File: `tests/js/spawner.test.js` <a id="file-testsjsspawnertestjs"></a>

````javascript
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
````

---

## File: `tests/js/app.test.js` <a id="file-testsjsapptestjs"></a>

````javascript
const test = require('node:test');
const assert = require('node:assert/strict');

// Set up minimal mock DOM environment before loading app
const mockElements = {};
function getOrCreateElement(id) {
  if (!mockElements[id]) {
    mockElements[id] = {
      classList: {
        classes: new Set(),
        toggle(cls, condition) {
          if (condition === undefined) {
            if (this.classes.has(cls)) this.classes.delete(cls);
            else this.classes.add(cls);
          } else if (condition) {
            this.classes.add(cls);
          } else {
            this.classes.delete(cls);
          }
        },
        add(cls) { this.classes.add(cls); },
        remove(cls) { this.classes.delete(cls); },
        contains(cls) { return this.classes.has(cls); }
      },
      innerText: '',
      innerHTML: '',
      textContent: '',
      value: '',
      style: {},
      querySelector: () => null,
      querySelectorAll: () => [],
      appendChild: (el) => el
    };
  }
  return mockElements[id];
}

const storageStore = new Map();
globalThis.localStorage = {
  getItem: (k) => (storageStore.has(k) ? storageStore.get(k) : null),
  setItem: (k, v) => storageStore.set(k, String(v)),
  removeItem: (k) => storageStore.delete(k),
  clear: () => storageStore.clear()
};

globalThis.document = {
  getElementById: (id) => getOrCreateElement(id),
  querySelector: (sel) => null,
  querySelectorAll: () => [],
  addEventListener: () => {},
  createElement: (tag) => ({
    className: '',
    innerHTML: '',
    textContent: '',
    style: {},
    appendChild: (el) => el,
    querySelector: () => null
  })
};
globalThis.window = {
  addEventListener: () => {}
};

const app = require('../../js/app.js');

test('app: selectMode toggles mode state and DOM classes', () => {
  app.selectMode('solo');
  const coopCard = document.getElementById('modeCardCoop');
  const soloCard = document.getElementById('modeCardSolo');
  const roleSec = document.getElementById('playerRoleSection');

  assert.equal(soloCard.classList.contains('selected-red'), true);
  assert.equal(coopCard.classList.contains('selected-red'), false);
  assert.equal(roleSec.classList.contains('hidden'), true);

  app.selectMode('coop');
  assert.equal(soloCard.classList.contains('selected-red'), false);
  assert.equal(coopCard.classList.contains('selected-red'), true);
  assert.equal(roleSec.classList.contains('hidden'), false);
});

test('app: selectRole toggles role state and DOM classes', () => {
  app.selectRole('2');
  const role1 = document.getElementById('roleCard1');
  const role2 = document.getElementById('roleCard2');

  assert.equal(role1.classList.contains('selected'), false);
  assert.equal(role2.classList.contains('selected'), true);

  app.selectRole('1');
  assert.equal(role1.classList.contains('selected'), true);
  assert.equal(role2.classList.contains('selected'), false);
});

test('app: resolveRoomSyncedFaction deterministically selects faction', () => {
  const setupMode = document.getElementById('setupFactionMode');
  setupMode.value = 'SYNC_CHAOS';

  app.resolveRoomSyncedFaction('ALPHA-01');
  const select = document.getElementById('hordeFactionSelect');
  assert.ok(select.value.length > 0);

  const bannerTitle = document.getElementById('activeFactionBannerTitle').innerText;
  assert.match(bannerTitle, /^HORDE FACTION:/);
});

test('app: onSetupFactionModeChanged switches faction immediately according to mode', () => {
  assert.equal(typeof app.onSetupFactionModeChanged, 'function', 'onSetupFactionModeChanged must be exported');

  const setupMode = document.getElementById('setupFactionMode');
  setupMode.value = 'SYNC_CHAOS';
  app.onSetupFactionModeChanged();

  const activeChaos = app.activeHordeFaction;
  assert.equal(activeChaos.group, 'Chaos', 'Selecting SYNC_CHAOS must resolve a Chaos faction');
  assert.notEqual(activeChaos.name, "T'au Empire", 'Chaos filter must never yield T\'au Empire');

  setupMode.value = 'SYNC_XENOS';
  app.onSetupFactionModeChanged();
  assert.equal(app.activeHordeFaction.group, 'Xenos', 'Selecting SYNC_XENOS must resolve a Xenos faction');

  setupMode.value = 'SYNC_IMPERIUM';
  app.onSetupFactionModeChanged();
  assert.equal(app.activeHordeFaction.group, 'Imperium', 'Selecting SYNC_IMPERIUM must resolve an Imperium faction');
});

test('app: startSession re-resolves faction if setupFactionMode changed even if roomCode matches', () => {
  // Simulate active session previously on T'au Empire with room code HADES-1
  document.getElementById('seedInput').value = 'HADES-1';
  document.getElementById('setupFactionMode').value = "T'au Empire";
  app.resolveRoomSyncedFaction('HADES-1');
  assert.equal(app.activeHordeFaction.name, "T'au Empire");

  // User changes setup dropdown to SYNC_CHAOS without changing room code
  document.getElementById('setupFactionMode').value = 'SYNC_CHAOS';

  app.startSession();

  const activeChaos = app.activeHordeFaction;
  assert.equal(activeChaos.group, 'Chaos', 'startSession must re-resolve faction if setupFactionMode changed');
  assert.notEqual(activeChaos.name, "T'au Empire");
});

test('app: startSession launches game screen from seed input', () => {
  const seedInput = document.getElementById('seedInput');
  seedInput.value = 'TERRA-99';
  document.getElementById('setupFactionMode').value = 'Orks';

  app.startSession();

  const gameScreen = document.getElementById('gameScreen');
  const setupScreen = document.getElementById('setupScreen');

  assert.equal(gameScreen.classList.contains('hidden'), false);
  assert.equal(setupScreen.classList.contains('hidden'), true);
});

test('app: session state persists to localStorage and can be restored across tab switches', () => {
  // 1. Verify startSession writes to localStorage
  const raw = localStorage.getItem('foa_horde_session_v1');
  assert.ok(raw, 'localStorage must contain foa_horde_session_v1 after startSession');

  const parsed = JSON.parse(raw);
  assert.equal(parsed.hasActiveSession, true);
  assert.equal(parsed.seed, 'TERRA-99');

  // 2. Mutate state with gainSP and adjCP
  app.gainSP(5);
  app.adjCP(1);

  const updatedRaw = localStorage.getItem('foa_horde_session_v1');
  const updatedParsed = JSON.parse(updatedRaw);
  assert.equal(updatedParsed.sp, 5);
  assert.equal(updatedParsed.cp, 3);

  // 3. Simulate reload or tab switch and restore
  document.getElementById('gameScreen').classList.add('hidden');
  document.getElementById('setupScreen').classList.remove('hidden');

  const restored = app.restoreSessionState();
  assert.equal(restored, true, 'restoreSessionState must return true when active session exists');
  assert.equal(document.getElementById('gameScreen').classList.contains('hidden'), false);
  assert.equal(document.getElementById('setupScreen').classList.contains('hidden'), true);

  // 4. Test leaveSession deactivates active session
  globalThis.confirm = () => true;
  app.leaveSession();
  const leftRaw = localStorage.getItem('foa_horde_session_v1');
  const leftParsed = JSON.parse(leftRaw);
  assert.equal(leftParsed.hasActiveSession, false);
});

test('app: saveSessionState ignores call when not on spawner page', () => {
  // If we are on another page (e.g. index.html) where setupScreen and gameScreen are absent
  const origGetElementById = document.getElementById;
  document.getElementById = (id) => {
    if (id === 'setupScreen' || id === 'gameScreen') return null;
    return origGetElementById(id);
  };

  localStorage.setItem('foa_horde_session_v1', JSON.stringify({ hasActiveSession: true, testValue: 123 }));
  app.saveSessionState();

  const after = JSON.parse(localStorage.getItem('foa_horde_session_v1'));
  assert.equal(after.testValue, 123, 'Must not overwrite session state when DOM elements are absent');

  // Restore mock
  document.getElementById = origGetElementById;
});

test('app: restoreSessionState restores activeTab, markers, and spawner settings', () => {
  document.getElementById('gameScreen').classList.remove('hidden');
  document.getElementById('setupScreen').classList.add('hidden');

  localStorage.setItem('foa_horde_session_v1', JSON.stringify({
    hasActiveSession: true,
    seed: 'WARP-7',
    selectedModeVal: 'coop',
    selectedRoleVal: '1',
    activeTab: 4,
    battleRound: 3,
    sp: 4,
    cp: 1,
    teleCount: 2,
    wireCount: 1,
    mineCount: 3,
    spawnZoneCount: '4',
    extraSpawnMod: '1',
    firstRollBonus: true,
    baitTrapBonus: false,
    doubleCost: true
  }));

  const res = app.restoreSessionState();
  assert.equal(res, true);
  assert.equal(String(document.getElementById('teleCount').innerText), '2');
  assert.equal(String(document.getElementById('wireCount').innerText), '1');
  assert.equal(String(document.getElementById('mineCount').innerText), '3');
});

test('app: adjMarker modifies counter within bounds and persists state', () => {
  const el = document.getElementById('teleCount');
  el.innerText = '1';

  // Increment within max 3
  app.adjMarker('teleCount', 1, 3);
  assert.equal(String(el.innerText), '2');

  // Increment past max 3
  app.adjMarker('teleCount', 5, 3);
  assert.equal(String(el.innerText), '3');

  // Decrement below min 0
  app.adjMarker('teleCount', -10, 3);
  assert.equal(String(el.innerText), '0');
});

test('app: switchTab activates specified tab and persists active tab index', () => {
  app.switchTab(3);

  assert.equal(document.getElementById('tab3').classList.contains('hidden'), false);
  assert.equal(document.getElementById('tabBtn3').classList.contains('active'), true);
  assert.equal(document.getElementById('tab1').classList.contains('hidden'), true);
  assert.equal(document.getElementById('tabBtn1').classList.contains('active'), false);

  const raw = localStorage.getItem('foa_horde_session_v1');
  const parsed = JSON.parse(raw);
  assert.equal(parsed.activeTab, 3);
});

test('app: togglePrivacy toggles privacy wrapper and button text', () => {
  const btn = document.getElementById('privacyBtn');
  const wrapper = document.getElementById('PrivacyWrapper');

  app.togglePrivacy();
  assert.equal(btn.innerText, 'Show Objective');
  assert.equal(wrapper.classList.contains('hidden'), true);

  app.togglePrivacy();
  assert.equal(btn.innerText, 'Hide Screen');
  assert.equal(wrapper.classList.contains('hidden'), false);
});

test('app: resource economy (SP & CP) functions update counters and tally', () => {
  // Reset SP & CP
  app.loseSP(100);
  assert.equal(String(document.getElementById('hudSp').innerText), '0');

  app.gainSP(4);
  assert.equal(String(document.getElementById('hudSp').innerText), '4');

  app.adjCP(3);
  assert.equal(String(document.getElementById('hudCp').innerText), '4');

  app.spendCPForStrat();
  assert.equal(String(document.getElementById('hudCp').innerText), '3');
  assert.ok(document.getElementById('hudStratTally').innerText.includes('1 Strats'));
});

test('app: saveCustomPool and loadCustomPool persist custom units to localStorage', () => {
  document.getElementById('pool34').value = '10 Termagants';
  document.getElementById('pool56').value = '5 Genestealers';
  document.getElementById('pool79').value = '1 Carnifex';
  document.getElementById('pool10').value = '1 Hive Tyrant';

  globalThis.alert = () => {};
  app.saveCustomPool();

  const saved = JSON.parse(localStorage.getItem('armageddon_horde_pool'));
  assert.equal(saved.b34, '10 Termagants');
  assert.equal(saved.b10, '1 Hive Tyrant');

  // Clear inputs and reload
  document.getElementById('pool34').value = '';
  document.getElementById('pool10').value = '';
  app.loadCustomPool();

  assert.equal(document.getElementById('pool34').value, '10 Termagants');
  assert.equal(document.getElementById('pool10').value, '1 Hive Tyrant');
});

test('app: renderLiveSpawnerBracketTable renders table with cloud pool values and intrusion warning', () => {
  localStorage.setItem('foa_custom_shelf_pool_v1', JSON.stringify({
    b34: 'Test Chaff 10',
    b10: 'Test Greater Daemon'
  }));

  const windowEl = document.getElementById('liveSpawnerBracketWindow');
  app.renderLiveSpawnerBracketTable();

  assert.ok(windowEl.innerHTML.includes('Test Chaff 10'));
  assert.ok(windowEl.innerHTML.includes('Test Greater Daemon'));
  assert.ok(windowEl.innerHTML.includes('Warp-Breach Intrusion Check (6+ = Campaign Master Adversary/Nemesis!)'));
});

test('app: syncSpawnerPoolFromSupabase pulls cloud pool and updates localStorage and table', async () => {
  const origFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    return {
      ok: true,
      json: async () => ({
        ok: true,
        horde_pool: {
          b34: 'Cloud Hormagaunts 20',
          b56: 'Cloud Bloodletters 10',
          b79: 'Cloud Trygon 1',
          b10: 'Cloud Bloodthirster 1',
          b13: 'Cloud Baneblade 1'
        }
      })
    };
  };

  await app.syncSpawnerPoolFromSupabase();

  const saved = JSON.parse(localStorage.getItem('foa_custom_shelf_pool_v1'));
  assert.equal(saved.b34, 'Cloud Hormagaunts 20');
  assert.equal(saved.b10, 'Cloud Bloodthirster 1');

  const windowEl = document.getElementById('liveSpawnerBracketWindow');
  assert.ok(windowEl.innerHTML.includes('Cloud Bloodthirster 1'));

  globalThis.fetch = origFetch;
});

test('app: transmitHordeIntrusionPing formats emergency intrusion payload and transmits via VoxAudio', () => {
  let transmittedChan = null;
  let transmittedPayload = null;

  globalThis.window.VoxAudio = {
    transmitToVox: (chan, payload) => {
      transmittedChan = chan;
      transmittedPayload = payload;
    }
  };

  document.getElementById('seedInput').value = 'HADES-42';
  document.getElementById('spawnerBtnRound').textContent = '3';
  document.getElementById('hordeFactionSelect').value = 'Chaos Daemons';

  app.transmitHordeIntrusionPing(2, 'Bracket [10–12]', 'beta');

  assert.equal(transmittedChan, 'beta');
  assert.ok(transmittedPayload.includes('EMERGENCY AUSPEX PING: HORDE WARP-BREACH INTRUSION DETECTED'));
  assert.ok(transmittedPayload.includes('Mode 1 (Horde Breach // Room: HADES-42 // Battle Round 3)'));
  assert.ok(transmittedPayload.includes('Spawn Zone 2 rolled Bracket [10–12] + [6+ WARP-BREACH INTRUSION]!'));
  assert.ok(transmittedPayload.includes('ACTIVE HORDE FACTION: Chaos Daemons'));
});

test('app: transmitHordeIntrusionPing formats distant intercept payload and transmits via VoxAudio', () => {
  let transmittedChan = null;
  let transmittedPayload = null;

  globalThis.window.VoxAudio = {
    transmitToVox: (chan, payload) => {
      transmittedChan = chan;
      transmittedPayload = payload;
    }
  };

  document.getElementById('seedInput').value = 'HADES-99';
  document.getElementById('spawnerBtnRound').textContent = '4';
  document.getElementById('hordeFactionSelect').value = 'World Eaters';

  app.transmitHordeIntrusionPing(3, 'Bracket [13+]', 'distant');

  assert.equal(transmittedChan, 'distant');
  assert.ok(transmittedPayload.includes('ORBITAL AUGUR ARRAY // DISTANT WARP-BREACH ADVERSARY DETECTED'));
  assert.ok(transmittedPayload.includes('Distant Sector Grid 3 // Orbital Augur Intercept (Neither Main Player Fielded)'));
  assert.ok(transmittedPayload.includes('Mode 1 (Distant Solo Horde Breach // Room: HADES-99 // Battle Round 4)'));
  assert.ok(transmittedPayload.includes('Distant Spawn Zone 3 rolled Bracket [13+] + [6+ WARP-BREACH INTRUSION]!'));
  assert.ok(transmittedPayload.includes('ACTIVE DISTANT ENEMY FACTION: World Eaters'));
  assert.ok(transmittedPayload.includes('broadcast the telemetry intercept to BOTH command networks'));
});

test('app: evaluateWarpBreachIntrusions inspects spawn cards and enforces >= 6 threshold (5 is clean wave, 6 triggers alert)', () => {
  const fs = require('node:fs');
  const path = require('node:path');
  const spawnerHtml = fs.readFileSync(path.resolve(__dirname, '../../pages/spawner.html'), 'utf8');
  assert.ok(
    spawnerHtml.includes('[10–12] &amp; [13+] Roll 1D6 Warp-Breach Intrusion (6+)'),
    'pages/spawner.html Tab 4 banner must state Roll 1D6 Warp-Breach Intrusion (6+)'
  );
  assert.ok(
    spawnerHtml.includes('Unmodified 2 = No Spawn • [10+] Rolls 1D6 Warp-Breach Intrusion (6+)'),
    'pages/spawner.html Tab 4 section header must state Rolls 1D6 Warp-Breach Intrusion (6+)'
  );

  const container = document.getElementById('spawnResultsContainer');
  let appended1 = null;
  let appended2 = null;

  const cardBig = {
    textContent: 'Spawn Zone 1 • Bracket [10–12] (301–550 pts)',
    style: {},
    querySelector: () => null,
    appendChild: (el) => { appended1 = el; }
  };
  const cardSmall = {
    textContent: 'Spawn Zone 2 • Bracket [3–4] (0–75 pts)',
    style: {},
    querySelector: () => null,
    appendChild: (el) => { appended2 = el; }
  };

  container.querySelectorAll = (selector) => {
    if (selector === '.spawn-zone') return [cardBig, cardSmall];
    return [];
  };

  const origMulberry = globalThis.mulberry32;
  // Roll D6 = 5 (0.75 * 6 = 4.5 -> floor 4 + 1 = 5): must NOT trigger intrusion alert when threshold is 6+
  globalThis.mulberry32 = () => () => 0.75;
  try {
    app.evaluateWarpBreachIntrusions();
    assert.ok(appended1, 'Bracket [10–12] must receive a badge');
    assert.equal(appended1.className, 'intrusion-badge-clean', 'D6 = 5 must be a clean wave (6+ required)');
    assert.ok(appended1.textContent.includes('Needed 6+'), 'Clean wave badge must state Needed 6+');
    assert.equal(appended2, null, 'Bracket [3–4] must not receive an intrusion check');
  } finally {
    globalThis.mulberry32 = origMulberry;
  }
});

test('app: evaluateWarpBreachIntrusions renders 6+ alert and third option button for distant intercept when D6 = 6', () => {
  const container = document.getElementById('spawnResultsContainer');
  let appendedAlert = null;
  const cardBig = {
    textContent: 'Spawn Zone 1 • Bracket [10–12] (301–550 pts)',
    style: {},
    querySelector: () => null,
    appendChild: (el) => { appendedAlert = el; }
  };

  container.querySelectorAll = (selector) => {
    if (selector === '.spawn-zone') return [cardBig];
    return [];
  };

  const origMulberry = globalThis.mulberry32;
  globalThis.mulberry32 = () => () => 0.99; // D6 = 6 (6+)

  try {
    app.evaluateWarpBreachIntrusions();
    assert.ok(appendedAlert, 'Must append warp-intrusion-alert');
    const html = appendedAlert.innerHTML;
    assert.ok(html.includes('D6 = 6 (6+)'), 'Alert badge must display D6 = 6 (6+)');
    assert.ok(html.includes("transmitHordeIntrusionPing(1, 'Bracket [10–12]', 'alpha')"), 'Must have Exile ping button');
    assert.ok(html.includes("transmitHordeIntrusionPing(1, 'Bracket [10–12]', 'beta')"), 'Must have Junebug ping button');
    assert.ok(html.includes("transmitHordeIntrusionPing(1, 'Bracket [10–12]', 'distant')"), 'Must have Distant Intercept ping button');
    assert.ok(html.includes('Ping Vox (Distant Intercept)'), 'Must have Distant Intercept button label');
  } finally {
    globalThis.mulberry32 = origMulberry;
  }
});

test('app: startSession clears currentZoneSpawns and resets spawnResultsContainer placeholder', () => {
  const container = document.getElementById('spawnResultsContainer');
  container.innerHTML = '<div class="card spawn-zone">Stale Chaos Daemons Roll</div>';

  app.startSession();

  assert.ok(container.innerHTML.includes('Tap the green button above'));
});

test('app: manualChangeFaction updates activeHordeFaction and clears stale spawn results', () => {
  const container = document.getElementById('spawnResultsContainer');
  container.innerHTML = '<div class="card spawn-zone">Old Faction Spawn Zone</div>';
  document.getElementById('hordeFactionSelect').value = 'World Eaters';

  app.manualChangeFaction();

  assert.ok(container.innerHTML.includes('Horde faction updated to World Eaters'));
  assert.equal(container.innerHTML.includes('Old Faction Spawn Zone'), false);
});

test('app: onChangeSpawnZoneCount clears spawns and prompts for fresh rolls', () => {
  const container = document.getElementById('spawnResultsContainer');
  container.innerHTML = '<div class="card spawn-zone">3 Zone Roll</div>';

  app.onChangeSpawnZoneCount();

  assert.ok(container.innerHTML.includes('Spawn zone count updated'));
});

test('app: clearSpawnerResults and resetMatchToSetup clear session data and spawner state', () => {
  const container = document.getElementById('spawnResultsContainer');
  container.innerHTML = '<div class="card spawn-zone">Zone 1</div>';

  app.clearSpawnerResults();
  assert.ok(container.innerHTML.includes('Tap the green button above'));

  // Test resetMatchToSetup returns to setupScreen
  globalThis.confirm = () => true;
  document.getElementById('setupScreen').classList.add('hidden');
  document.getElementById('gameScreen').classList.remove('hidden');

  app.resetMatchToSetup();

  assert.equal(document.getElementById('setupScreen').classList.contains('hidden'), false);
  assert.equal(document.getElementById('gameScreen').classList.contains('hidden'), true);
});

test('app: rollAllSpawnZones rolls configured number of zones without throwing and renders cards', () => {
  document.getElementById('seedInput').value = 'HADES-TEST';
  document.getElementById('spawnZoneCountSelect').value = '5';
  document.getElementById('hordeFactionSelect').value = 'World Eaters';
  document.getElementById('extraSpawnMod').value = '0';
  document.getElementById('jammerCheck').checked = false;
  document.getElementById('firstRollBonusCheck').checked = false;
  document.getElementById('baitTrapBonusCheck').checked = false;

  const container = document.getElementById('spawnResultsContainer');

  app.rollAllSpawnZones();

  assert.ok(container.innerHTML.includes('Spawn Zone 1'));
  assert.ok(container.innerHTML.includes('Spawn Zone 5'));
});

test('app: pushLiveSpawnerStateToCloud sends room state to Supabase save_shared_spawn_pools', async () => {
  let calledUrl = null;
  let sentBody = null;
  globalThis.fetch = async (url, opts) => {
    calledUrl = url;
    sentBody = JSON.parse(opts.body);
    return { ok: true, json: async () => ({ ok: true }) };
  };

  document.getElementById('seedInput').value = 'ROOM-XYZ';
  document.getElementById('setupScreen').classList.add('hidden');
  document.getElementById('gameScreen').classList.remove('hidden');

  const ok = await app.pushLiveSpawnerStateToCloud();
  assert.equal(ok, true);
  assert.ok(calledUrl.includes('save_shared_spawn_pools'));
  assert.ok(sentBody.p_nemesis_status);
  assert.ok(sentBody.p_nemesis_status.spawner_rooms['ROOM-XYZ']);
  assert.equal(sentBody.p_nemesis_status.spawner_rooms['ROOM-XYZ'].roomCode, 'ROOM-XYZ');
});

test('app: pollLiveSpawnerStateFromCloud synchronizes remote ally match actions while preserving private roles and CP', async () => {
  const remoteRoomState = {
    roomCode: 'ROOM-XYZ',
    hasActiveSession: true,
    battleRound: 3,
    activeHordeFactionName: 'Tyranids',
    spawnZoneCount: '3',
    currentZoneSpawns: ['Zone 1: Gaunts', 'Zone 2: Carnifex', 'Zone 3: Tyrant'],
    activeMiseries: [{ id: 6, title: 'Stray Bombardment' }],
    activeSecondaries: [{ id: 1, title: 'Defend Objective' }],
    wireCount: 2,
    mineCount: 5,
    updatedAt: Date.now() + 50000,
    lastSenderId: 'ally-device-123'
  };

  globalThis.fetch = async (url) => {
    return {
      ok: true,
      json: async () => ({
        ok: true,
        nemesis_status: {
          spawner_rooms: {
            'ROOM-XYZ': remoteRoomState
          }
        }
      })
    };
  };

  document.getElementById('seedInput').value = 'ROOM-XYZ';
  app.selectRole('2');
  const localRoleBefore = app.selectedRoleVal;
  const localCpBefore = app.cp;

  const synced = await app.pollLiveSpawnerStateFromCloud();
  assert.equal(synced, true);
  assert.equal(app.battleRound, 3, 'Battle round must update to match remote ally');
  assert.equal(app.activeHordeFaction.name, 'Tyranids', 'Horde faction must update to match remote ally');
  assert.equal(document.getElementById('wireCount').innerText, '2', 'Fortifications must sync');
  assert.equal(document.getElementById('mineCount').innerText, '5', 'Mine count must sync');

  // Private state must remain completely untouched
  assert.equal(app.selectedRoleVal, localRoleBefore, 'Personal role must not be overwritten');
  assert.equal(app.cp, localCpBefore, 'Personal CP must not be overwritten');
});

test('app: pollLiveSpawnerStateFromCloud ignores older or self-sent updates', async () => {
  const selfId = app.getClientDeviceId();
  const selfSentState = {
    roomCode: 'ROOM-XYZ',
    hasActiveSession: true,
    battleRound: 1,
    updatedAt: Date.now() - 10000,
    lastSenderId: selfId
  };

  globalThis.fetch = async () => ({
    ok: true,
    json: async () => ({
      ok: true,
      nemesis_status: {
        spawner_rooms: { 'ROOM-XYZ': selfSentState }
      }
    })
  });

  const synced = await app.pollLiveSpawnerStateFromCloud();
  assert.equal(synced, false, 'Should ignore self-sent or older updates');
});

test('app: triggerCardStaticShake adds card-synced-shake class to element and cleans up', () => {
  const classes = new Set();
  const mockCard = {
    classList: {
      add: (c) => classes.add(c),
      remove: (c) => classes.delete(c),
      contains: (c) => classes.has(c)
    },
    offsetWidth: 100
  };

  assert.equal(typeof app.triggerCardStaticShake, 'function', 'triggerCardStaticShake must be exported');
  app.triggerCardStaticShake(mockCard);
  assert.equal(mockCard.classList.contains('card-synced-shake'), true, 'card-synced-shake class must be added');
});

test('app: applyRemoteSharedState triggers static shake on specifically changed card elements', () => {
  const shakenElements = [];
  const makeShakable = (id) => {
    const el = getOrCreateElement(id);
    el.classList = {
      classes: new Set(),
      add(cls) {
        if (cls === 'card-synced-shake') shakenElements.push(id);
        this.classes.add(cls);
      },
      remove(cls) { this.classes.delete(cls); },
      contains(cls) { return this.classes.has(cls); }
    };
    return el;
  };

  const roundBanner = makeShakable('roundBannerTest');
  const zoneCard1 = makeShakable('zoneCardTest1');
  const zoneCard2 = makeShakable('zoneCardTest2');

  const origQuerySelector = globalThis.document.querySelector;
  const origQuerySelectorAll = globalThis.document.querySelectorAll;

  globalThis.document.querySelector = (sel) => {
    if (sel.includes('round-banner')) return roundBanner;
    return null;
  };
  globalThis.document.querySelectorAll = (sel) => {
    if (sel.includes('.spawn-zone')) return [zoneCard1, zoneCard2];
    return [];
  };

  try {
    app.applyRemoteSharedState({
      battleRound: 4,
      currentZoneSpawns: ['Zone 1: Orks Boyz', 'Zone 2: Meganobz']
    });

    assert.ok(shakenElements.includes('roundBannerTest'), 'Round banner must shake when battle round changes');
    assert.ok(shakenElements.includes('zoneCardTest1') || shakenElements.includes('zoneCardTest2'), 'Changed spawn zone cards must shake');
  } finally {
    globalThis.document.querySelector = origQuerySelector;
    globalThis.document.querySelectorAll = origQuerySelectorAll;
  }
});

test('app: pollLiveSpawnerStateFromCloud plays chime strictly once and does not repeat on duplicate polls', async () => {
  let chimeCount = 0;
  globalThis.window.VoxAudio = {
    playCloudSyncChime: () => { chimeCount++; }
  };

  const testState = {
    roomCode: 'HADES-CHIME',
    hasActiveSession: true,
    battleRound: 2,
    currentZoneSpawns: ['Zone 1: Gretchin'],
    updatedAt: Date.now() + 100000,
    lastSenderId: 'ally-sender-99'
  };

  globalThis.fetch = async () => ({
    ok: true,
    json: async () => ({
      ok: true,
      nemesis_status: {
        spawner_rooms: { 'HADES-CHIME': testState }
      }
    })
  });

  document.getElementById('seedInput').value = 'HADES-CHIME';

  // First poll with new data triggers single chime
  const sync1 = await app.pollLiveSpawnerStateFromCloud();
  assert.equal(sync1, true);
  assert.equal(chimeCount, 1, 'Chime should play exactly once on first reception of remote change');

  // Second poll with identical state should NOT replay chime
  const sync2 = await app.pollLiveSpawnerStateFromCloud();
  assert.equal(sync2, false, 'Identical or already-synced poll must not re-sync');
  assert.equal(chimeCount, 1, 'Chime must not repeat on subsequent poll of same state');
});

test('app: evaluateWarpBreachIntrusions plays warp siren only once for a given wave and does not repeat', () => {
  let sirenCount = 0;
  globalThis.window.VoxAudio = {
    playWarpSiren: () => { sirenCount++; }
  };

  const container = document.getElementById('spawnResultsContainer');
  const cardBig = {
    textContent: 'Spawn Zone 1 • Bracket [13+] (551+ pts)',
    style: {},
    querySelector: () => null,
    appendChild: () => {}
  };

  container.querySelectorAll = (selector) => {
    if (selector === '.spawn-zone') return [cardBig];
    return [];
  };

  // Force deterministic intrusion roll 6
  const origMulberry = globalThis.mulberry32;
  globalThis.mulberry32 = () => () => 0.99; // Math.floor(0.99 * 6) + 1 = 6

  try {
    app.evaluateWarpBreachIntrusions();
    const countAfterFirst = sirenCount;

    // Call evaluateWarpBreachIntrusions again (e.g. re-render or re-poll)
    app.evaluateWarpBreachIntrusions();
    assert.equal(sirenCount, countAfterFirst, 'Warp siren must not repeat on consecutive evaluations of the same wave');
  } finally {
    globalThis.mulberry32 = origMulberry;
  }
});

test('app: onRoomCodeChanged resets sync watermarks and pulls remote room state immediately', async () => {
  let fetchedUrl = null;
  const remoteState = {
    roomCode: 'PASTED-CODE',
    hasActiveSession: true,
    battleRound: 2,
    activeHordeFactionName: 'World Eaters',
    currentZoneSpawns: [{ zone: 1, units: ['Eightbound'] }],
    updatedAt: 12345, // even an older timestamp must be pulled when switching rooms
    lastSenderId: 'creator-device'
  };

  globalThis.fetch = async (url) => {
    fetchedUrl = url;
    return {
      ok: true,
      json: async () => ({
        ok: true,
        nemesis_status: {
          spawner_rooms: { 'PASTED-CODE': remoteState }
        }
      })
    };
  };

  document.getElementById('seedInput').value = 'PASTED-CODE';

  assert.equal(typeof app.onRoomCodeChanged, 'function', 'onRoomCodeChanged must be exported');
  const syncSuccess = await app.onRoomCodeChanged(true); // Immediate invocation
  assert.equal(syncSuccess, true, 'Must pull existing room state from cloud upon pasting room code');
  assert.equal(app.activeHordeFaction.name, 'World Eaters', 'Pasting code must adopt the room-synced horde faction');
  assert.equal(app.battleRound, 2, 'Pasting code must adopt the room-synced round');
  assert.equal(app.currentZoneSpawns.length, 1, 'Pasting code must adopt the room-synced spawn zones');
});

test('app: startSession preserves room-synced horde faction and spawns if already synced from cloud', () => {
  document.getElementById('seedInput').value = 'PASTED-CODE';
  app.startSession();
  assert.equal(app.activeHordeFaction.name, 'World Eaters', 'startSession must not overwrite room-synced faction');
  assert.equal(app.currentZoneSpawns.length, 1, 'startSession must not wipe existing room-synced spawns');
});





````

---

## File: `tests/js/vox-audio.test.js` <a id="file-testsjsvoxaudiotestjs"></a>

````javascript
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '../../');
const VOX_AUDIO_PATH = path.join(ROOT_DIR, 'js/vox-audio.js');

// Mock Web Audio Context
class MockAudioNode {
  constructor() {
    this.connectedTo = null;
  }
  connect(dest) {
    this.connectedTo = dest;
    return dest;
  }
}

class MockAudioParam {
  constructor(initial = 0) {
    this.value = initial;
    this.events = [];
  }
  setValueAtTime(val, time) {
    this.value = val;
    this.events.push({ type: 'set', val, time });
  }
  exponentialRampToValueAtTime(val, time) {
    this.value = val;
    this.events.push({ type: 'ramp', val, time });
  }
  linearRampToValueAtTime(val, time) {
    this.value = val;
    this.events.push({ type: 'linear', val, time });
  }
}

class MockOscillator extends MockAudioNode {
  constructor() {
    super();
    this.type = 'sine';
    this.frequency = new MockAudioParam(440);
    this.started = false;
    this.stopped = false;
  }
  start(time) {
    this.started = true;
    this.startTime = time;
  }
  stop(time) {
    this.stopped = true;
    this.stopTime = time;
  }
}

class MockGain extends MockAudioNode {
  constructor() {
    super();
    this.gain = new MockAudioParam(1);
  }
}

class MockAudioContext {
  constructor() {
    this.currentTime = 100.0;
    this.state = 'running';
    this.destination = new MockAudioNode();
    this.oscillators = [];
    this.gains = [];
  }
  createOscillator() {
    const osc = new MockOscillator();
    this.oscillators.push(osc);
    return osc;
  }
  createGain() {
    const g = new MockGain();
    this.gains.push(g);
    return g;
  }
  resume() {
    this.state = 'running';
  }
}

// Minimal mock DOM & Storage environment
const storageStore = new Map();
globalThis.localStorage = {
  getItem: (k) => (storageStore.has(k) ? storageStore.get(k) : null),
  setItem: (k, v) => storageStore.set(k, String(v)),
  removeItem: (k) => storageStore.delete(k),
  clear: () => storageStore.clear()
};

const sessionStore = new Map();
globalThis.sessionStorage = {
  getItem: (k) => (sessionStore.has(k) ? sessionStore.get(k) : null),
  setItem: (k, v) => sessionStore.set(k, String(v)),
  removeItem: (k) => sessionStore.delete(k),
  clear: () => sessionStore.clear()
};

globalThis.window = {
  AudioContext: MockAudioContext,
  addEventListener: () => {},
  location: { href: 'http://localhost/dealer/index.html', pathname: '/dealer/index.html' }
};

const listeners = {};
const bodyClasses = new Set();
globalThis.document = {
  body: {
    dataset: {},
    classList: {
      add: (c) => bodyClasses.add(c),
      remove: (c) => bodyClasses.delete(c),
      toggle: (c, force) => {
        if (force === undefined) {
          if (bodyClasses.has(c)) bodyClasses.delete(c);
          else bodyClasses.add(c);
        } else if (force) {
          bodyClasses.add(c);
        } else {
          bodyClasses.delete(c);
        }
      },
      contains: (c) => bodyClasses.has(c)
    }
  },
  addEventListener: (event, handler) => {
    listeners[event] = handler;
  },
  querySelector: () => null,
  getElementById: () => null,
  createElement: () => ({ setAttribute: () => {}, style: {} }),
  readyState: 'complete'
};

const voxModule = require('../../js/vox-audio.js');

test('js/vox-audio.js exists and implements the 40K Vox-Caster ambient playlist and SFX synth', () => {
  assert.ok(fs.existsSync(VOX_AUDIO_PATH), 'js/vox-audio.js must exist');
  const code = fs.readFileSync(VOX_AUDIO_PATH, 'utf8');

  // Verify core constants and identifiers
  assert.ok(code.includes('PL1PnO3JojeSmA_jPzjhuiKycUQ8BHHjek'), 'Must configure the official YouTube playlist ID');
  assert.ok(code.includes('soa_vox_music_enabled_v1'), 'Must configure localStorage key for music state persistence');
  assert.ok(code.includes('soa_vox_track_index_v1'), 'Must persist track index for seamless tab switching');
  assert.ok(code.includes('soa_vox_track_time_v1'), 'Must persist track timestamp for seamless tab switching');
  assert.ok(code.includes('soa_vox_track_id_v1'), 'Must persist exact video ID for true seamless track continuity');
  assert.ok(code.includes('VOX_TRACK_IDS'), 'Must define curated ambient 40K track array');
  assert.ok(code.includes('playNextRandomTrack'), 'Must implement 100% random track selection');

  // Verify Web Audio button clank synthesizer and sound variety
  assert.ok(code.includes('playTerminalClank') || code.includes('playTerminalSound'), 'Must define terminal sound synthesis');
  assert.ok(code.includes('AudioContext') || code.includes('webkitAudioContext'), 'Must instantiate Web AudioContext');
  assert.ok(code.includes('auspex'), 'Must include Auspex scanner chirp sound profile');
  assert.ok(code.includes('pneumatic'), 'Must include pneumatic solenoid sound profile');
  assert.ok(code.includes('card'), 'Must include tactical data-slate card sound profile');

  // Verify YouTube IFrame API integration
  assert.ok(code.includes('https://www.youtube.com/iframe_api'), 'Must dynamically load YouTube Iframe API');
  assert.ok(code.includes('voxMusicToggle'), 'Must create voxMusicToggle top-nav button');
  assert.ok(code.includes('voxMusicSkip'), 'Must create voxMusicSkip button');

  // Verify Seamless Client-Side Page Router (Gapless Audio)
  assert.ok(code.includes('navigateSeamlessly'), 'Must implement navigateSeamlessly for gapless audio across page switching');
  assert.ok(code.includes('popstate'), 'Must handle popstate events for browser back/forward navigation');
  assert.ok(code.includes('DOMParser'), 'Must parse fetched pages via DOMParser');
});

test('vox-audio: VOX_TRACK_IDS contains curated 11-char YouTube track IDs and valid playlist', () => {
  assert.ok(Array.isArray(voxModule.VOX_TRACK_IDS), 'VOX_TRACK_IDS must be an array');
  assert.ok(voxModule.VOX_TRACK_IDS.length >= 8, 'VOX_TRACK_IDS must include at least 8 curated ambient tracks');

  for (const id of voxModule.VOX_TRACK_IDS) {
    assert.equal(typeof id, 'string');
    assert.equal(id.length, 11, `Track ID '${id}' must be 11 characters long`);
  }

  assert.equal(voxModule.PLAYLIST_ID, 'PL1PnO3JojeSmA_jPzjhuiKycUQ8BHHjek');
});

test('vox-audio: playTerminalClank synthesizes distinct profiles via Web Audio API', () => {
  // 1. Heavy profile (Launch, Gate, Confirm)
  assert.doesNotThrow(() => {
    voxModule.playTerminalClank('heavy');
  });

  // 2. Auspex scanner profile (Map inspection, Zoom)
  assert.doesNotThrow(() => {
    voxModule.playTerminalClank('auspex');
  });

  // 3. Pneumatic solenoid profile (Dice, Counters)
  assert.doesNotThrow(() => {
    voxModule.playTerminalClank('pneumatic');
  });

  // 4. Tactical card profile (Objectives, Miseries)
  assert.doesNotThrow(() => {
    voxModule.playTerminalClank('card');
  });

  // 5. Default relay profile (Generic mechanical switch)
  assert.doesNotThrow(() => {
    voxModule.playTerminalClank('relay');
    voxModule.playTerminalClank('unknown');
  });
});

test('vox-audio: saveCurrentPosition safely persists audio telemetry to localStorage', () => {
  storageStore.clear();
  assert.doesNotThrow(() => {
    voxModule.saveCurrentPosition();
  });
  // Since ytPlayer is null in mock env, it handles absent player gracefully without throwing
  assert.equal(storageStore.has('soa_vox_music_enabled_v1'), false);
});

test('vox-audio: newly added Crusade & CRT sound synthesizers execute without throwing', () => {
  assert.doesNotThrow(() => {
    voxModule.playTeletypeTick('stream');
    voxModule.playTeletypeTick('redact');
  }, 'playTeletypeTick must execute smoothly');

  assert.doesNotThrow(() => {
    voxModule.playDiceClatter();
  }, 'playDiceClatter must execute smoothly');

  assert.doesNotThrow(() => {
    voxModule.playForgeAnvil();
  }, 'playForgeAnvil must execute smoothly');

  assert.doesNotThrow(() => {
    voxModule.playRelicChoir();
  }, 'playRelicChoir must execute smoothly');

  assert.doesNotThrow(() => {
    voxModule.playScarHazard();
  }, 'playScarHazard must execute smoothly');

  assert.doesNotThrow(() => {
    voxModule.playDossierStamp();
  }, 'playDossierStamp must execute smoothly');

  assert.doesNotThrow(() => {
    voxModule.playWarpSiren();
  }, 'playWarpSiren must execute smoothly');

  assert.doesNotThrow(() => {
    voxModule.playAuspexLock();
  }, 'playAuspexLock must execute smoothly');

  assert.doesNotThrow(() => {
    voxModule.playCloudSyncChime();
  }, 'playCloudSyncChime must execute smoothly');
});

test('vox-audio: transmitToVox stores pending payload in sessionStorage and routes seamlessly', () => {
  sessionStore.clear();
  sessionStore.set('foa_vox_active_session_v1', JSON.stringify({ channel: 'alpha', pass: 'OldSecretPass' }));
  const testPayload = '+++ TEST MASTER DOSSIER TRANSMISSION +++';

  assert.doesNotThrow(() => {
    voxModule.transmitToVox('beta', testPayload);
  });

  const storedRaw = sessionStore.get('foa_pending_vox_payload');
  assert.ok(storedRaw, 'transmitToVox must persist payload to foa_pending_vox_payload in sessionStorage');
  const parsed = JSON.parse(storedRaw);
  assert.equal(parsed.channel, 'beta');
  assert.equal(parsed.text, testPayload);
  assert.ok(typeof parsed.queuedAt === 'number');
  assert.equal(sessionStore.has('foa_vox_active_session_v1'), false, 'transmitToVox must clear active session auth to prevent password bypass');
});

test('vox-audio: window.VoxAudio exposes complete public API for all game modes', () => {
  assert.ok(globalThis.window.VoxAudio, 'window.VoxAudio must be defined on window object');
  assert.equal(typeof globalThis.window.VoxAudio.playClank, 'function');
  assert.equal(typeof globalThis.window.VoxAudio.playTeletypeTick, 'function');
  assert.equal(typeof globalThis.window.VoxAudio.playDiceClatter, 'function');
  assert.equal(typeof globalThis.window.VoxAudio.playForgeAnvil, 'function');
  assert.equal(typeof globalThis.window.VoxAudio.playRelicChoir, 'function');
  assert.equal(typeof globalThis.window.VoxAudio.playScarHazard, 'function');
  assert.equal(typeof globalThis.window.VoxAudio.playDossierStamp, 'function');
  assert.equal(typeof globalThis.window.VoxAudio.playWarpSiren, 'function');
  assert.equal(typeof globalThis.window.VoxAudio.playAuspexLock, 'function');
  assert.equal(typeof globalThis.window.VoxAudio.playCloudSyncChime, 'function');
  assert.equal(typeof globalThis.window.VoxAudio.navigateSeamlessly, 'function');
  assert.equal(typeof globalThis.window.VoxAudio.transmitToVox, 'function');
});

test('vox-audio: playCloudSyncChime throttles rapid calls to play strictly once', () => {
  const playedFirst = voxModule.playCloudSyncChime(true);
  assert.equal(playedFirst, true, 'First forced chime call must play');

  // Immediate second invocation should be throttled (single-shot guard)
  const playedSecond = voxModule.playCloudSyncChime();
  assert.equal(playedSecond, false, 'Immediate consecutive chime must be suppressed by single-shot throttle');
});

test('vox-audio: recovers from browser autoplay block on user interaction and auto-skips broken tracks on error', () => {
  const code = fs.readFileSync(VOX_AUDIO_PATH, 'utf8');
  assert.ok(code.includes('isPlayerActuallyPlaying'), 'Must check actual YT player state via isPlayerActuallyPlaying() rather than trusting optimistic isPlaying');
  assert.ok(code.includes('onError'), 'YT.Player events must include onError handler to automatically skip broken/unavailable tracks');

  // Verify mock YT player lifecycle: when onReady fires but browser blocks autoplay (state remains UNSTARTED = -1),
  // isPlayerActuallyPlaying() remains false so subsequent user interaction resumes playback
  assert.equal(typeof voxModule.createPlayer, 'function', 'Must export createPlayer for testing');
  assert.equal(typeof voxModule.isPlayerActuallyPlaying, 'function', 'Must export isPlayerActuallyPlaying for testing');

  let playCalls = 0;
  let loadCalls = 0;
  let currentState = -1; // UNSTARTED (autoplay blocked)
  let capturedEvents = null;

  globalThis.YT = {
    PlayerState: { ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3, CUED: 5 },
    Player: function (_id, opts) {
      capturedEvents = opts.events;
      this.setVolume = () => {};
      this.unMute = () => {};
      this.getPlayerState = () => currentState;
      this.playVideo = () => { playCalls++; };
      this.loadVideoById = () => { loadCalls++; };
    }
  };

  voxModule.createPlayer();
  assert.ok(capturedEvents && typeof capturedEvents.onReady === 'function');
  assert.ok(typeof capturedEvents.onError === 'function', 'Must wire onError callback on YT.Player');

  // Simulate onReady firing while browser blocks autoplay (state stays -1)
  capturedEvents.onReady({ target: { setVolume: () => {}, unMute: () => {} } });
  assert.equal(voxModule.isPlayerActuallyPlaying(), false, 'Player must not be marked as playing when autoplay is blocked (state -1)');

  // Simulate onError firing on an unavailable track -> should automatically call playNextRandomTrack (loadVideoById)
  const prevLoadCalls = loadCalls;
  capturedEvents.onError({ data: 150 });
  assert.equal(loadCalls, prevLoadCalls + 1, 'onError must automatically skip to the next random track');

  // Simulate root domain (https://armageddon-vox.pages.dev/) where initial autoplay left state at -1 (UNSTARTED):
  // calling resumeOrStartMusic(true) on a user gesture must synchronously call loadVideoById + playVideo
  const loadsBeforeGesture = loadCalls;
  const playsBeforeGesture = playCalls;
  voxModule.resumeOrStartMusic(true);
  assert.equal(loadCalls, loadsBeforeGesture + 1, 'resumeOrStartMusic(true) must synchronously call loadVideoById when state is -1');
  assert.equal(playCalls, playsBeforeGesture + 1, 'resumeOrStartMusic(true) must synchronously call playVideo');

  // Verify normalizePathname treats root '/' and '/index.html' identically
  assert.equal(typeof voxModule.normalizePathname, 'function', 'Must export normalizePathname helper');
  assert.equal(voxModule.normalizePathname('/'), '/');
  assert.equal(voxModule.normalizePathname('/index.html'), '/');
  assert.equal(voxModule.normalizePathname('/pages/vox.html'), '/pages/vox.html');
});

test('vox-audio: resolveFactionThemeFromStorage, setFactionTheme, and syncFactionTheme manage global Necron vs Militarum color modes across all pages', () => {
  assert.equal(typeof voxModule.resolveFactionThemeFromStorage, 'function', 'Must export resolveFactionThemeFromStorage');
  assert.equal(typeof voxModule.setFactionTheme, 'function', 'Must export setFactionTheme');
  assert.equal(typeof voxModule.getFactionTheme, 'function', 'Must export getFactionTheme');
  assert.equal(typeof voxModule.syncFactionTheme, 'function', 'Must export syncFactionTheme');
  assert.equal(typeof globalThis.window.VoxAudio.setFactionTheme, 'function', 'window.VoxAudio must expose setFactionTheme');
  assert.equal(typeof globalThis.window.VoxAudio.getFactionTheme, 'function', 'window.VoxAudio must expose getFactionTheme');
  assert.equal(typeof globalThis.window.VoxAudio.syncFactionTheme, 'function', 'window.VoxAudio must expose syncFactionTheme');

  // 1. Clean state resolves to null when no broadcast or terminal is unlocked
  storageStore.clear();
  sessionStore.clear();
  assert.equal(voxModule.resolveFactionThemeFromStorage(globalThis.localStorage, globalThis.sessionStorage), null);

  // 2. Unlocking Beta broadcast in foa_briefing_state_v3 resolves to 'necron'
  storageStore.set('foa_briefing_state_v3', JSON.stringify({ unlockedBeta: true, unlockedAlpha: false, activeDossier: 'beta' }));
  assert.equal(voxModule.resolveFactionThemeFromStorage(globalThis.localStorage, globalThis.sessionStorage), 'necron');

  // 3. Unlocking Alpha broadcast in foa_briefing_state_v3 resolves to 'militarum'
  storageStore.set('foa_briefing_state_v3', JSON.stringify({ unlockedBeta: false, unlockedAlpha: true, activeDossier: 'alpha' }));
  assert.equal(voxModule.resolveFactionThemeFromStorage(globalThis.localStorage, globalThis.sessionStorage), 'militarum');

  // 4. Active Vox session in foa_vox_active_session_v1 overrides when explicit theme key is absent
  storageStore.clear();
  sessionStore.set('foa_vox_active_session_v1', JSON.stringify({ channel: 'beta', pass: 'TombKey' }));
  assert.equal(voxModule.resolveFactionThemeFromStorage(globalThis.localStorage, globalThis.sessionStorage), 'necron');

  sessionStore.set('foa_vox_active_session_v1', JSON.stringify({ channel: 'alpha', pass: 'AshKey' }));
  assert.equal(voxModule.resolveFactionThemeFromStorage(globalThis.localStorage, globalThis.sessionStorage), 'militarum');

  // 5. setFactionTheme('necron') applies theme-necron to document.body and persists to foa_faction_theme_v1
  voxModule.setFactionTheme('necron', true);
  assert.equal(globalThis.document.body.classList.contains('theme-necron'), true);
  assert.equal(globalThis.document.body.classList.contains('theme-militarum'), false);
  assert.equal(globalThis.document.body.dataset.factionTheme, 'necron');
  assert.equal(globalThis.localStorage.getItem('foa_faction_theme_v1'), 'necron');
  assert.equal(voxModule.getFactionTheme(), 'necron');

  // 6. setFactionTheme('militarum') switches to theme-militarum and removes theme-necron
  voxModule.setFactionTheme('militarum', true);
  assert.equal(globalThis.document.body.classList.contains('theme-militarum'), true);
  assert.equal(globalThis.document.body.classList.contains('theme-necron'), false);
  assert.equal(globalThis.document.body.dataset.factionTheme, 'militarum');
  assert.equal(globalThis.localStorage.getItem('foa_faction_theme_v1'), 'militarum');
  assert.equal(voxModule.getFactionTheme(), 'militarum');

  // 7. Verify css/style.css defines global body.theme-necron and body.theme-militarum rules
  const cssPath = path.join(ROOT_DIR, 'css/style.css');
  const cssCode = fs.readFileSync(cssPath, 'utf8');
  assert.ok(cssCode.includes('body.theme-necron'), 'css/style.css must define global body.theme-necron theme rules');
  assert.ok(cssCode.includes('body.theme-militarum'), 'css/style.css must define global body.theme-militarum theme rules');
});







````

---

## File: `tests/vox_bridge.test.js` <a id="file-testsvoxbridgetestjs"></a>

````javascript
const test = require('node:test');
const assert = require('node:assert/strict');

const {
  resolveServiceKey,
  resolveThreadUrls,
  scrubArtifacts,
  extractCleanLastModelResponse,
  processSingleMessage,
  drainChannelQueue,
  runDualThreadCourier,
  publishServerHeartbeat
} = require('../vox_bridge.js');

function createMockPage({ onInsertText, evaluateResult } = {}) {
  return {
    url: () => 'https://gemini.google.com/test',
    evaluate: async (fn, arg) => {
      if (typeof evaluateResult === 'function') {
        return evaluateResult(fn, arg);
      }
      return evaluateResult || { count: 0, text: '' };
    },
    locator: (sel) => {
      const btn = {
        waitFor: async () => true,
        count: async () => 1,
        isEnabled: async () => true,
        click: async () => {}
      };
      return {
        first: () => btn,
        count: async () => 1
      };
    },
    bringToFront: async () => {},
    waitForTimeout: async () => {},
    keyboard: {
      press: async () => {},
      insertText: async (txt) => {
        if (onInsertText) onInsertText(txt);
      }
    }
  };
}

test('resolveServiceKey: resolves key correctly across standard and fallback env formats', () => {
  // Test primary standard keys
  assert.equal(
    resolveServiceKey({ SUPABASE_SERVICE_ROLE_KEY: '  valid_service_role_secret_key_123  ' }),
    'valid_service_role_secret_key_123'
  );
  assert.equal(
    resolveServiceKey({ SUPABASE_SECRET_KEY: 'sb_secret_alpha_bravo_charlie_key' }),
    'sb_secret_alpha_bravo_charlie_key'
  );
  assert.equal(
    resolveServiceKey({ SERVICE_ROLE_KEY: 'service_role_key_long_enough' }),
    'service_role_key_long_enough'
  );
  assert.equal(
    resolveServiceKey({ SUPABASE_KEY: 'supabase_generic_key_string' }),
    'supabase_generic_key_string'
  );
  assert.equal(
    resolveServiceKey({ SECRET_KEY: 'secret_key_generic_string' }),
    'secret_key_generic_string'
  );
  assert.equal(
    resolveServiceKey({ API_KEY: 'api_key_generic_long_string' }),
    'api_key_generic_long_string'
  );

  // Test sb_secret_ prefix scan fallback
  assert.equal(
    resolveServiceKey({ CUSTOM_VAR_NAME: 'sb_secret_random_prefix_found' }),
    'sb_secret_random_prefix_found'
  );

  // Test SUPABASE-named variable fallback that is not a URL
  assert.equal(
    resolveServiceKey({ MY_SUPABASE_TOKEN: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.token' }),
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.token'
  );

  // Must reject keys <= 10 characters
  assert.equal(resolveServiceKey({ SUPABASE_SERVICE_ROLE_KEY: 'short' }), '');

  // Must return empty string if no valid candidate exists
  assert.equal(resolveServiceKey({}), '');
  assert.equal(resolveServiceKey({ SUPABASE_URL: 'https://example.supabase.co' }), '');
});

test('scrubArtifacts: cleanly scrubs Notebook source citation chips and formats paragraph breaks', () => {
  // Strips citation chips and isolated line counters
  const inputWithChips = `
The cogitator awaits your command, Warden.
MD
+ 4
Transmit your tactical queries or dispatch Post-Battle Dossiers.
MD + 2
[cite: 1, 3]
+++ TRANSMISSION CONCLUDED +++
  `;

  const scrubbed = scrubArtifacts(inputWithChips);
  assert.equal(scrubbed.includes('MD'), false, 'Must scrub MD citation badges');
  assert.equal(scrubbed.includes('+ 4'), false, 'Must scrub + 4 citation lines');
  assert.equal(scrubbed.includes('+ 2'), false, 'Must scrub + 2 citation lines');
  assert.equal(scrubbed.includes('[cite:'), false, 'Must scrub [cite:] markers');
  assert.ok(scrubbed.includes('The cogitator awaits your command, Warden.'));
  assert.ok(scrubbed.includes('Transmit your tactical queries or dispatch Post-Battle Dossiers.'));
  assert.ok(scrubbed.includes('+++ TRANSMISSION CONCLUDED +++'));

  // Bullets formatting
  const bulletInput = 'Status report:• • Unit Alfa ready\n• Unit Beta advancing';
  const cleanBullets = scrubArtifacts(bulletInput);
  assert.ok(cleanBullets.includes('• Unit Alfa ready'));
  assert.ok(cleanBullets.includes('• Unit Beta advancing'));

  // Standalone code block and UI labels
  const uiLabelInput = 'Plaintext\n+++ VOX TRANSMISSION +++\n• \n\n Unit Gamma deployed\nCopy code\nCopiar código\nTexto simples';
  const cleanLabels = scrubArtifacts(uiLabelInput);
  assert.equal(cleanLabels.includes('Plaintext'), false, 'Must scrub Plaintext label');
  assert.equal(cleanLabels.includes('Copy code'), false, 'Must scrub Copy code label');
  assert.equal(cleanLabels.includes('Copiar código'), false, 'Must scrub Copiar código label');
  assert.equal(cleanLabels.includes('Texto simples'), false, 'Must scrub Texto simples label');
  assert.ok(cleanLabels.includes('• Unit Gamma deployed'), 'Must collapse hanging bullets onto single line');

  // Null/empty input
  assert.equal(scrubArtifacts(''), '');
  assert.equal(scrubArtifacts(null), '');
  assert.equal(scrubArtifacts(undefined), '');
});

test('extractCleanLastModelResponse: removes code-block headers and prevents <p> inside <li> from breaking bullets', async () => {
  class SimpleDomNode {
    constructor(tagName, text = '', className = '', attrs = {}) {
      this.tagName = tagName.toUpperCase();
      this._text = text;
      this.className = className;
      this.attrs = attrs;
      this.children = [];
      this.childNodes = text ? [text] : [];
      this.parentNode = null;
    }
    get textContent() {
      if (this.childNodes.length > 0) {
        return this.childNodes.map(c => (typeof c === 'string' ? c : c.textContent)).join('');
      }
      return this._text;
    }
    set textContent(v) {
      this._text = v;
      this.childNodes = [];
      this.children = [];
    }
    cloneNode(deep = true) {
      const cloned = new SimpleDomNode(this.tagName, this._text, this.className, { ...this.attrs });
      if (deep) {
        cloned.childNodes = this.childNodes.map(c => {
          if (typeof c === 'string') return c;
          const copy = c.cloneNode(true);
          copy.parentNode = cloned;
          return copy;
        });
        cloned.children = cloned.childNodes.filter(c => typeof c !== 'string');
      }
      return cloned;
    }
    remove() {
      if (this.parentNode) {
        this.parentNode.childNodes = this.parentNode.childNodes.filter(c => c !== this);
        this.parentNode.children = this.parentNode.children.filter(c => c !== this);
      }
    }
    replaceWith(...nodes) {
      if (this.parentNode) {
        const idx = this.parentNode.childNodes.indexOf(this);
        if (idx !== -1) {
          this.parentNode.childNodes.splice(idx, 1, ...nodes);
          nodes.forEach(n => {
            if (n && typeof n === 'object') n.parentNode = this.parentNode;
          });
          this.parentNode.children = this.parentNode.childNodes.filter(c => typeof c !== 'string');
        }
      }
    }
    prepend(...nodes) {
      nodes.slice().reverse().forEach(n => {
        this.childNodes.unshift(n);
        if (n && typeof n === 'object') {
          n.parentNode = this;
          this.children.unshift(n);
        }
      });
    }
    append(...nodes) {
      nodes.forEach(n => {
        this.childNodes.push(n);
        if (n && typeof n === 'object') {
          n.parentNode = this;
          this.children.push(n);
        }
      });
    }
    closest(tag) {
      let curr = this.parentNode;
      while (curr) {
        if (curr.tagName === tag.toUpperCase()) return curr;
        curr = curr.parentNode;
      }
      return null;
    }
    querySelectorAll(sel) {
      const results = [];
      const tokens = sel.split(',').map(s => s.trim().toLowerCase());
      const visit = (node) => {
        for (const child of node.children) {
          if (!child || typeof child !== 'object') continue;
          const tag = (child.tagName || '').toLowerCase();
          const cls = (child.className || '').toLowerCase();
          const match = tokens.some(t => {
            if (t.startsWith('.')) return cls.includes(t.slice(1));
            if (t.startsWith('button[')) return tag === 'button';
            return tag === t;
          });
          if (match) results.push(child);
          visit(child);
        }
      };
      visit(this);
      return results;
    }
  }

  const root = new SimpleDomNode('div');
  const codeHeader = new SimpleDomNode('div', 'Plaintext', 'code-block-decoration');
  codeHeader.parentNode = root;
  root.children.push(codeHeader);
  root.childNodes.push(codeHeader);

  const copyBtn = new SimpleDomNode('button', 'Copy code', '', { 'aria-label': 'Copy code' });
  copyBtn.parentNode = root;
  root.children.push(copyBtn);
  root.childNodes.push(copyBtn);

  const li = new SimpleDomNode('li');
  li.parentNode = root;
  const pInsideLi = new SimpleDomNode('p', 'Unit 1 deployed');
  pInsideLi.parentNode = li;
  li.children.push(pInsideLi);
  li.childNodes.push(pInsideLi);
  root.children.push(li);
  root.childNodes.push(li);

  const mockPage = {
    evaluate: async (fn, sel) => {
      const prevDoc = global.document;
      global.document = {
        querySelectorAll: (s) => (s === sel ? [root] : [])
      };
      try {
        return fn(sel);
      } finally {
        global.document = prevDoc;
      }
    }
  };

  const res = await extractCleanLastModelResponse(mockPage);
  assert.equal(res.count, 1);
  assert.equal(res.text.includes('Plaintext'), false, 'Code header must be removed');
  assert.equal(res.text.includes('Copy code'), false, 'Copy button must be removed');
  assert.ok(res.text.includes('• Unit 1 deployed'), 'Bullet must stay on same line without orphan newline');
  assert.equal(res.text.includes('• \n\n Unit 1 deployed'), false, 'Must not have orphan newline');
});

test('processSingleMessage: splits PASSIVE ASTROPATHIC CHOIR INTERCEPT variations and handles Plaintext headers', async () => {
  const fetchCalls = [];
  const mockFetch = async (url, opts) => {
    fetchCalls.push({ url, opts, body: JSON.parse(opts.body || '{}') });
    return { ok: true, status: 200, json: async () => ({}) };
  };

  const testMsg = {
    id: '44556677-intercept-msg',
    channel: 'alpha',
    sender: 'The Exile',
    question: 'Report astral choir bleed'
  };

  const mockPage = createMockPage();

  // Response with Plaintext header and PASSIVE ASTROPATHIC CHOIR INTERCEPT
  const responseWithAstropathicIntercept =
    'REF-ID: 44556677\n+++ ORBITAL DISPATCH +++\nDirect comms verified.\nPlaintext\n+++ PASSIVE ASTROPATHIC CHOIR INTERCEPT +++\nPsychic static from [REDACTED] detected.';

  const success = await processSingleMessage(testMsg, mockPage, {
    fetchFn: mockFetch,
    supabaseUrl: 'https://test.supabase.co',
    serviceKey: 'valid_test_secret_key_123',
    waitForReplyFn: async () => responseWithAstropathicIntercept,
    logFn: () => {}
  });

  assert.equal(success, true);
  const patchCall = fetchCalls.find(c => c.url.includes('/rest/v1/vox_messages?id=eq.44556677-intercept-msg'));
  assert.ok(patchCall, 'Must patch vox_messages');
  assert.ok(patchCall.body.reply.includes('Direct comms verified.'));
  assert.equal(patchCall.body.reply.includes('PASSIVE ASTROPATHIC CHOIR INTERCEPT'), false, 'Direct reply must have intercept stripped');

  const interceptCall = fetchCalls.find(c => c.url.includes('/rest/v1/vox_interferences'));
  assert.ok(interceptCall, 'Must post to vox_interferences');
  assert.ok(interceptCall.body.redacted_text.includes('PASSIVE ASTROPATHIC CHOIR INTERCEPT'));
  assert.equal(interceptCall.body.redacted_text.includes('Plaintext'), false, 'Intercept must have leading Plaintext label stripped');
});

test('processSingleMessage: triggers Pattern 5 intercept bleed prompt for EMERGENCY AUSPEX PING and UNBOUND ADVERSARY', async () => {
  const dispatchedPrompts = [];
  const mockPage = createMockPage({
    onInsertText: (txt) => { dispatchedPrompts.push(txt); }
  });

  const testMsg = {
    id: '99887766-unbound-ping',
    channel: 'alpha',
    sender: 'The Exile',
    question: '+++ EMERGENCY AUSPEX PING: UNBOUND ADVERSARY WARP-BREACH INTRUSION DETECTED +++'
  };

  await processSingleMessage(testMsg, mockPage, {
    fetchFn: async () => ({ ok: true, status: 200, json: async () => ({}) }),
    supabaseUrl: 'https://test.supabase.co',
    serviceKey: 'valid_test_secret_key_123',
    waitForReplyFn: async () => 'REF-ID: 99887766\n+++ COGITATOR READOUT +++\nIntrusion noted.',
    logFn: () => {}
  });

  const fullPrompt = dispatchedPrompts.join('\n');
  assert.ok(
    fullPrompt.includes('Pattern 5 intercept block'),
    'Unbound/Intrusion pings must trigger a Pattern 5 intercept bleed instruction in the prompt'
  );
});

test('processSingleMessage: triggers Pattern 5 intercept bleed prompt for START OF TOUR OF DUTY DISPATCH and 3RD ALLIANCE VULTURE SPTS REPORT', async () => {
  for (const header of [
    '+++ MUNITORUM FIELD REGULATION 884-ALPHA // START OF TOUR OF DUTY DISPATCH +++',
    '+++ 1V1 ASH WASTES // 3RD ALLIANCE VULTURE SPTS REPORT +++'
  ]) {
    const dispatchedPrompts = [];
    const mockPage = createMockPage({
      onInsertText: (txt) => { dispatchedPrompts.push(txt); }
    });

    const testMsg = {
      id: '11223344-dispatch-msg',
      channel: 'alpha',
      sender: 'The Exile',
      question: header
    };

    await processSingleMessage(testMsg, mockPage, {
      fetchFn: async () => ({ ok: true, status: 200, json: async () => ({}) }),
      supabaseUrl: 'https://test.supabase.co',
      serviceKey: 'valid_test_secret_key_123',
      waitForReplyFn: async () => 'REF-ID: 11223344\n+++ COGITATOR READOUT +++\nDispatch logged.',
      logFn: () => {}
    });

    const fullPrompt = dispatchedPrompts.join('\n');
    assert.ok(
      fullPrompt.includes('Pattern 5 intercept block'),
      `Report "${header}" must trigger a Pattern 5 intercept bleed instruction in the prompt`
    );
  }
});

test('processSingleMessage: uses mirror-image speaker routing (Alpha defaults to Vane unless ship query; Beta defaults to Tomb-Ship Master Matrix unless hailing Vane/Zenith-09)', async () => {
  const alphaPrompts = [];
  const alphaPage = createMockPage({
    onInsertText: (txt) => { alphaPrompts.push(txt); }
  });

  await processSingleMessage(
    {
      id: 'aaaa1111-ship-alpha',
      channel: 'alpha',
      sender: 'The Exile',
      question: 'Machine-Spirit, report hull integrity and Cell 09 status.'
    },
    alphaPage,
    {
      fetchFn: async () => ({ ok: true, status: 200, json: async () => ({}) }),
      supabaseUrl: 'https://test.supabase.co',
      serviceKey: 'valid_test_secret_key_123',
      waitForReplyFn: async () => 'REF-ID: aaaa1111\n+++ COGITATOR READOUT +++\nHull integrity at 42%.',
      logFn: () => {}
    }
  );

  const alphaFull = alphaPrompts.join('\n');
  assert.ok(
    alphaFull.includes('Pattern 4A Ashen Spirit cogitator readout, REF-ID: aaaa1111'),
    'Alpha ship query must use Pattern 4A Ashen Spirit cogitator readout'
  );

  // Beta default (no Vane/Zenith hail) -> Necron Tomb-Ship Autonomous Master Matrix & Cryptek Conclave
  const betaDefaultPrompts = [];
  const betaPage = createMockPage({
    onInsertText: (txt) => { betaDefaultPrompts.push(txt); }
  });

  await processSingleMessage(
    {
      id: 'bbbb2222-ship-beta',
      channel: 'beta',
      sender: 'Lord Commander Junebug',
      question: 'Report awakening matrix status and tesseract core telemetry.'
    },
    betaPage,
    {
      fetchFn: async () => ({ ok: true, status: 200, json: async () => ({}) }),
      supabaseUrl: 'https://test.supabase.co',
      serviceKey: 'valid_test_secret_key_123',
      waitForReplyFn: async () => 'REF-ID: bbbb2222\n+++ COGITATOR READOUT +++\nTomb-Ship Master Matrix nominal.',
      logFn: () => {}
    }
  );

  const betaDefaultFull = betaDefaultPrompts.join('\n');
  assert.ok(
    betaDefaultFull.includes("using AGENT.md, SHIP.md Part 2, NECRONS_CRUSADE.md, WORLD.md, and NEMESIS.md in this notebook"),
    'Beta default prompt must reference SHIP.md Part 2 and NECRONS_CRUSADE.md'
  );
  assert.ok(
    betaDefaultFull.includes("reply in-character as Commander Beta's (JUNEBUG's) Necron Tomb-Ship Autonomous Master Matrix & Cryptek Conclave"),
    'Beta default must reply as Necron Tomb-Ship Autonomous Master Matrix & Cryptek Conclave'
  );
  assert.ok(
    betaDefaultFull.includes('REF-ID: bbbb2222, knowing ONLY Beta\'s Tomb-Ship Equilibrium Index -1, Awakening Systems, and surface telemetry—NEVER reference The Sanctuary of Ash, Deck 44, or Ashen Spirit'),
    'Beta default must enforce Tomb-Ship isolation'
  );

  // Beta explicit Vane/Zenith-09 hail -> Logis-Prefect Vane at Geostationary Zenith-09
  const betaVanePrompts = [];
  const betaVanePage = createMockPage({
    onInsertText: (txt) => { betaVanePrompts.push(txt); }
  });

  await processSingleMessage(
    {
      id: 'cccc3333-vane-beta',
      channel: 'beta',
      sender: 'Lord Commander Junebug',
      question: '[TO: VANE] Auditor at Zenith-09, state the Imperial surface coordinates.'
    },
    betaVanePage,
    {
      fetchFn: async () => ({ ok: true, status: 200, json: async () => ({}) }),
      supabaseUrl: 'https://test.supabase.co',
      serviceKey: 'valid_test_secret_key_123',
      waitForReplyFn: async () => 'REF-ID: cccc3333\n+++ ORBITAL DISPATCH +++\nCoordinates logged.',
      logFn: () => {}
    }
  );

  const betaVaneFull = betaVanePrompts.join('\n');
  assert.ok(
    betaVaneFull.includes("reply in-character as Logis-Prefect Vane at Geostationary Zenith-09 (Pattern 1, REF-ID: cccc3333, orbital knowledge only—reacting with cold bureaucratic caution to JUNEBUG's hail across the open vox, and NEVER leaking Commander Alpha's Gatebreakers banner or internal ship state)"),
    'Beta explicit hail to Vane/Zenith-09 must route to Logis-Prefect Vane at Geostationary Zenith-09'
  );
});

test('processSingleMessage: triggers Pattern 5 intercept bleed for ROGUE SECTOR AUXILIARY BATTLE REPORT and broadcasts to BOTH alpha and beta channels', async () => {
  const dispatchedPrompts = [];
  const fetchCalls = [];
  const logged = [];

  const mockPage = createMockPage({
    onInsertText: (txt) => { dispatchedPrompts.push(txt); }
  });

  const mockFetch = async (url, opts) => {
    fetchCalls.push({ url, opts, body: JSON.parse(opts.body || '{}') });
    return { ok: true, status: 200, json: async () => ({}) };
  };

  const rogueMsg = {
    id: '55667788-rogue-report',
    channel: 'alpha',
    sender: 'The Exile',
    question: '+++ ROGUE SECTOR AUXILIARY BATTLE REPORT +++\n• BATTLE OUTCOME: Chaos Victory'
  };

  const success = await processSingleMessage(rogueMsg, mockPage, {
    fetchFn: mockFetch,
    supabaseUrl: 'https://test.supabase.co',
    serviceKey: 'valid_test_secret_key_123',
    waitForReplyFn: async () => '<DIRECT_REPLY>REF-ID: 55667788\n+++ ORBITAL DECREE +++\nRogue clash logged.</DIRECT_REPLY><INTERCEPT>Warp surge near [REDACTED] detected across the sector.</INTERCEPT>',
    logFn: (m) => logged.push(m)
  });

  assert.equal(success, true);
  const fullPrompt = dispatchedPrompts.join('\n');
  assert.ok(
    fullPrompt.includes('Pattern 5 intercept block'),
    'Rogue Sector report must trigger Pattern 5 intercept bleed instruction in the prompt'
  );

  const interceptCalls = fetchCalls.filter(c => c.url.includes('/rest/v1/vox_interferences'));
  assert.equal(interceptCalls.length, 2, 'Rogue Sector intercept must be broadcast to BOTH alpha and beta');
  assert.deepEqual(interceptCalls.map(c => c.body.target_channel), ['alpha', 'beta']);
  assert.equal(interceptCalls[0].body.origin_hint, 'ORBITAL AUGUR ARRAY // PARALLEL SECTOR EVENT');
  assert.equal(interceptCalls[1].body.origin_hint, 'ORBITAL AUGUR ARRAY // PARALLEL SECTOR EVENT');
  assert.ok(interceptCalls[0].body.redacted_text.includes('[REDACTED]'));
  assert.ok(logged.some(m => m.includes('ALPHA & BETA')));
});

test('processSingleMessage: triggers dual-channel intercept broadcast for ORBITAL AUGUR ARRAY / DISTANT SOLO HORDE report', async () => {
  const dispatchedPrompts = [];
  const fetchCalls = [];
  const logged = [];

  const mockPage = createMockPage({
    onInsertText: (txt) => { dispatchedPrompts.push(txt); }
  });

  const mockFetch = async (url, opts) => {
    fetchCalls.push({ url, opts, body: JSON.parse(opts.body || '{}') });
    return { ok: true, status: 200, json: async () => ({}) };
  };

  const augurMsg = {
    id: '77889900-augur-report',
    channel: 'alpha',
    sender: 'The Exile',
    question: '+++ MASTER POST-BATTLE DOSSIER // ORBITAL AUGUR TELEMETRY +++\n• ENGAGEMENT CLASSIFICATION: Mode 1: Distant Solo Horde Breach // Orbital Augur Telemetry\n• ENGAGED FORCES (IN THE DISTANCE): 019th Steel Legion Patrol (Neither Main Player Fielded)'
  };

  const success = await processSingleMessage(augurMsg, mockPage, {
    fetchFn: mockFetch,
    supabaseUrl: 'https://test.supabase.co',
    serviceKey: 'valid_test_secret_key_123',
    waitForReplyFn: async () => '<DIRECT_REPLY>REF-ID: 77889900\n+++ ORBITAL DECREE +++\nDistant solo horde battle logged.</DIRECT_REPLY><INTERCEPT>Distant breach signals near [REDACTED] confirmed by orbital scans.</INTERCEPT>',
    logFn: (m) => logged.push(m)
  });

  assert.equal(success, true);
  const fullPrompt = dispatchedPrompts.join('\n');
  assert.ok(
    fullPrompt.includes('Pattern 5 intercept block'),
    'Distant solo horde augur report must trigger Pattern 5 intercept bleed instruction in prompt'
  );

  const interceptCalls = fetchCalls.filter(c => c.url.includes('/rest/v1/vox_interferences'));
  assert.equal(interceptCalls.length, 2, 'Distant solo horde augur intercept must be broadcast to BOTH alpha and beta');
  assert.deepEqual(interceptCalls.map(c => c.body.target_channel), ['alpha', 'beta']);
  assert.equal(interceptCalls[0].body.origin_hint, 'ORBITAL AUGUR ARRAY // PARALLEL SECTOR EVENT');
  assert.equal(interceptCalls[1].body.origin_hint, 'ORBITAL AUGUR ARRAY // PARALLEL SECTOR EVENT');
  assert.ok(interceptCalls[0].body.redacted_text.includes('[REDACTED]'));
});

test('processSingleMessage: triggers dual-channel intercept broadcast for DISTANT WARP-BREACH ADVERSARY DETECTED ping', async () => {
  const dispatchedPrompts = [];
  const fetchCalls = [];
  const logged = [];

  const mockPage = createMockPage({
    onInsertText: (txt) => { dispatchedPrompts.push(txt); }
  });

  const mockFetch = async (url, opts) => {
    fetchCalls.push({ url, opts, body: JSON.parse(opts.body || '{}') });
    return { ok: true, status: 200, json: async () => ({}) };
  };

  const distantAdversaryMsg = {
    id: '11223344-distant-adversary',
    channel: 'alpha',
    sender: '🛰️ Orbital Augur Array // Distant Intercept',
    question: '+++ ORBITAL AUGUR ARRAY // DISTANT WARP-BREACH ADVERSARY DETECTED +++\n• THEATRE & SENSOR SWEEP: Distant Sector Grid 3 // Orbital Augur Intercept (Neither Main Player Fielded)\n• REMOTE SECTOR & BRACKET: Distant Spawn Zone 3 rolled Bracket [13+] + [5+ WARP-BREACH INTRUSION]!\n• ACTIVE DISTANT ENEMY FACTION: World Eaters'
  };

  const success = await processSingleMessage(distantAdversaryMsg, mockPage, {
    fetchFn: mockFetch,
    supabaseUrl: 'https://test.supabase.co',
    serviceKey: 'valid_test_secret_key_123',
    waitForReplyFn: async () => '<DIRECT_REPLY>REF-ID: 11223344\n+++ ORBITAL DECREE +++\nDistant Warp-breach adversary recorded in sector 3.</DIRECT_REPLY><INTERCEPT>Distant breach signals near [REDACTED] confirmed by orbital scans.</INTERCEPT>',
    logFn: (m) => logged.push(m)
  });

  assert.equal(success, true);
  const fullPrompt = dispatchedPrompts.join('\n');
  assert.ok(
    fullPrompt.includes('Pattern 5 intercept block'),
    'Distant warp-breach adversary ping must trigger Pattern 5 intercept bleed instruction in prompt'
  );

  const interceptCalls = fetchCalls.filter(c => c.url.includes('/rest/v1/vox_interferences'));
  assert.equal(interceptCalls.length, 2, 'Distant warp-breach adversary intercept must be broadcast to BOTH alpha and beta');
  assert.deepEqual(interceptCalls.map(c => c.body.target_channel), ['alpha', 'beta']);
  assert.equal(interceptCalls[0].body.origin_hint, 'ORBITAL AUGUR ARRAY // PARALLEL SECTOR EVENT');
  assert.equal(interceptCalls[1].body.origin_hint, 'ORBITAL AUGUR ARRAY // PARALLEL SECTOR EVENT');
  assert.ok(interceptCalls[0].body.redacted_text.includes('[REDACTED]'));
});

test('processSingleMessage: dispatches prompt, awaits response, and patches Supabase state', async () => {
  const dispatchedText = [];
  const clickedSelectors = [];

  const mockPage = {
    url: () => 'https://gemini.google.com/test',
    evaluate: async () => ({
      count: 0,
      text: ''
    }),
    locator: (sel) => {
      if (sel.includes('ql-editor') || sel.includes('textbox') || sel.includes('textarea')) {
        return {
          first: () => ({
            waitFor: async () => true,
            click: async () => {}
          })
        };
      }
      if (sel.includes('send-button')) {
        return {
          first: () => ({
            count: async () => 1,
            isEnabled: async () => true,
            click: async () => { clickedSelectors.push('send-button'); }
          })
        };
      }
      return {
        count: async () => 1
      };
    },
    bringToFront: async () => {},
    waitForTimeout: async () => {},
    keyboard: {
      press: async () => {},
      insertText: async (txt) => { dispatchedText.push(txt); }
    }
  };

  const fetchCalls = [];
  const mockFetch = async (url, opts) => {
    fetchCalls.push({ url, opts, body: JSON.parse(opts.body || '{}') });
    return {
      ok: true,
      status: 200,
      json: async () => ({})
    };
  };

  const testMsg = {
    id: '12345678-test-msg',
    channel: 'alpha',
    sender: 'The Exile',
    question: 'Report on sector casualties.'
  };

  const success = await processSingleMessage(testMsg, mockPage, {
    fetchFn: mockFetch,
    supabaseUrl: 'https://test.supabase.co',
    serviceKey: 'valid_test_secret_key_123',
    waitForReplyFn: async () => '<DIRECT_REPLY>REF-ID: 12345678\nOrders logged.</DIRECT_REPLY><INTERCEPT>Bleed at [REDACTED]</INTERCEPT>',
    logFn: () => {}
  });

  assert.equal(success, true, 'processSingleMessage must succeed with valid mock');
  assert.equal(dispatchedText.length > 0, true, 'Must insert prompt text into editor');

  // Verify Supabase PATCH call for vox_messages
  const patchCall = fetchCalls.find(c => c.url.includes('/rest/v1/vox_messages?id=eq.12345678-test-msg'));
  assert.ok(patchCall, 'Must issue PATCH to vox_messages endpoint');
  assert.ok(patchCall.body.reply.includes('Orders logged.'));
  assert.equal(patchCall.body.status, 'answered');

  // Verify Supabase POST call for vox_interferences
  const interceptCall = fetchCalls.find(c => c.url.includes('/rest/v1/vox_interferences'));
  assert.ok(interceptCall, 'Must issue POST to vox_interferences endpoint');
  assert.equal(interceptCall.body.target_channel, 'beta');
  assert.ok(interceptCall.body.redacted_text.includes('[REDACTED]'));
});

test('processSingleMessage: late-arrival catcher captures pre-existing response without re-typing prompt', async () => {
  const dispatchedText = [];
  const testMsg = {
    id: '87654321-late-arrival',
    channel: 'alpha',
    sender: 'The Exile',
    question: 'Report status'
  };

  const mockPage = {
    url: () => 'https://gemini.google.com/test',
    evaluate: async () => ({
      count: 1,
      text: '<DIRECT_REPLY>REF-ID: 87654321\n+++ STATUS NOMINAL +++\nImmediate report inscribed.</DIRECT_REPLY>'
    }),
    locator: () => ({
      first: () => ({
        waitFor: async () => true,
        click: async () => {}
      })
    }),
    bringToFront: async () => {},
    waitForTimeout: async () => {},
    keyboard: {
      press: async () => {},
      insertText: async (txt) => { dispatchedText.push(txt); }
    }
  };

  const fetchCalls = [];
  const mockFetch = async (url, opts) => {
    fetchCalls.push({ url, opts, body: JSON.parse(opts.body || '{}') });
    return {
      ok: true,
      status: 200,
      json: async () => ({})
    };
  };

  const logged = [];
  const success = await processSingleMessage(testMsg, mockPage, {
    fetchFn: mockFetch,
    supabaseUrl: 'https://test.supabase.co',
    serviceKey: 'valid_test_secret_key_123',
    logFn: (msg) => logged.push(msg)
  });

  assert.equal(success, true, 'processSingleMessage must succeed via late-arrival catcher');
  assert.equal(dispatchedText.length, 0, 'Must NOT re-type prompt when late reply is already present');
  assert.ok(logged.some(m => m.includes('LATE-ARRIVAL CAPTURED')), 'Must log late-arrival capture notice');

  const patchCall = fetchCalls.find(c => c.url.includes('/rest/v1/vox_messages?id=eq.87654321-late-arrival'));
  assert.ok(patchCall, 'Must patch Supabase with the late-arrival reply');
  assert.ok(patchCall.body.reply.includes('STATUS NOMINAL'));
  assert.equal(patchCall.body.status, 'answered');
});

test('drainChannelQueue: handles empty queue and missing service key gracefully', async () => {
  // Test missing service key
  const logged = [];
  await drainChannelQueue('alpha', {}, {
    serviceKey: '',
    logFn: (msg) => logged.push(msg)
  });
  assert.ok(logged.some(m => m.includes('SERVICE_KEY is missing')), 'Must warn when SERVICE_KEY is missing');

  // Test empty queue
  const mockEmptyFetch = async () => ({
    ok: true,
    json: async () => []
  });

  const emptyResult = await drainChannelQueue('alpha', {}, {
    fetchFn: mockEmptyFetch,
    supabaseUrl: 'https://test.supabase.co',
    serviceKey: 'valid_service_key_for_test',
    logFn: () => {}
  });

  assert.equal(emptyResult, 0, 'Drained message count must be 0 for empty queue');
});

test('resolveThreadUrls: resolves Alpha and Beta thread URLs cleanly and trims whitespace', () => {
  // Both defined and trimmed
  const urls = resolveThreadUrls({
    ALPHA_THREAD_URL: '  https://gemini.google.com/app/alpha123  ',
    BETA_THREAD_URL: '  https://gemini.google.com/app/beta456  '
  });
  assert.equal(urls.alphaThreadUrl, 'https://gemini.google.com/app/alpha123');
  assert.equal(urls.betaThreadUrl, 'https://gemini.google.com/app/beta456');

  // Missing or non-string
  const missing = resolveThreadUrls({});
  assert.equal(missing.alphaThreadUrl, '');
  assert.equal(missing.betaThreadUrl, '');

  const partial = resolveThreadUrls({ ALPHA_THREAD_URL: 'https://gemini.google.com/app/alpha123' });
  assert.equal(partial.alphaThreadUrl, 'https://gemini.google.com/app/alpha123');
  assert.equal(partial.betaThreadUrl, '');
});

test('runDualThreadCourier: safely returns false and logs fatal error when thread URLs are missing from env', async () => {
  const logged = [];
  const result = await runDualThreadCourier({
    env: { ALPHA_THREAD_URL: '' },
    logFn: (msg) => logged.push(msg)
  });
  assert.equal(result, false, 'runDualThreadCourier must exit early and return false');
  assert.ok(logged.some(m => m.includes('[FATAL ERROR] ALPHA_THREAD_URL and BETA_THREAD_URL must be defined in your .env file!')), 'Must log fatal error message');
});

test('publishServerHeartbeat: publishes online/offline vox_server_heartbeat to Supabase while preserving existing horde_pool and nemesis_status', async () => {
  assert.equal(typeof publishServerHeartbeat, 'function', 'publishServerHeartbeat must be exported from vox_bridge.js');

  const fetchCalls = [];
  const mockFetch = async (url, opts = {}) => {
    const body = opts.body ? JSON.parse(opts.body) : {};
    fetchCalls.push({ url, body });
    if (url.includes('get_shared_spawn_pools')) {
      return {
        ok: true,
        json: async () => ({
          ok: true,
          horde_pool: { b34: '10 Termagants' },
          nemesis_status: { nem1: 'roaming', spawner_rooms: { 'HADES-01': { battleRound: 2 } } }
        })
      };
    }
    if (url.includes('save_shared_spawn_pools')) {
      return {
        ok: true,
        json: async () => ({ ok: true })
      };
    }
    return { ok: false };
  };

  const okOnline = await publishServerHeartbeat('online', {
    fetchFn: mockFetch,
    supabaseUrl: 'https://test.supabase.co'
  });
  assert.equal(okOnline, true);

  const saveCall = fetchCalls.find(c => c.url.includes('save_shared_spawn_pools'));
  assert.ok(saveCall, 'Must call save_shared_spawn_pools');
  assert.deepEqual(saveCall.body.p_horde_pool, { b34: '10 Termagants' }, 'Must preserve existing horde_pool');
  assert.equal(saveCall.body.p_nemesis_status.nem1, 'roaming', 'Must preserve existing nemesis_status keys');
  assert.deepEqual(saveCall.body.p_nemesis_status.spawner_rooms, { 'HADES-01': { battleRound: 2 } });
  assert.equal(saveCall.body.p_nemesis_status.vox_server_heartbeat.status, 'online');
  assert.equal(typeof saveCall.body.p_nemesis_status.vox_server_heartbeat.updatedAt, 'number');
  assert.equal(saveCall.body.p_nemesis_status.vox_server_heartbeat.manualActive, undefined, 'Must not set manualActive bypass');

  fetchCalls.length = 0;
  const okOffline = await publishServerHeartbeat('offline', {
    fetchFn: mockFetch,
    supabaseUrl: 'https://test.supabase.co'
  });
  assert.equal(okOffline, true);
  const saveOfflineCall = fetchCalls.find(c => c.url.includes('save_shared_spawn_pools'));
  assert.equal(saveOfflineCall.body.p_nemesis_status.vox_server_heartbeat.status, 'offline');
});

````

---

## File: `tests/ui/pages.test.js` <a id="file-testsuipagestestjs"></a>

````javascript
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '../../');

function readPage(fileName) {
  return fs.readFileSync(path.join(ROOT_DIR, fileName), 'utf8');
}

test('UI Boundary: index.html is the home launchpad and pages/spawner.html houses Mode 1 modular scripts', () => {
  const indexHtml = readPage('index.html');

  assert.ok(indexHtml.includes('<nav class="suite-nav">'), 'Missing suite navigation bar in index.html');
  assert.ok(indexHtml.includes('href="pages/spawner.html" class="suite-link">🧟 Mode 1: Horde Command &amp; Spawner</a>'));
  assert.ok(indexHtml.includes('href="pages/pvp.html" class="suite-link">⚔️ Mode 2: 1v1 Ash Wastes PvP</a>'));
  assert.ok(indexHtml.includes('href="pages/rogue.html" class="suite-link">🎲 Mode 3: Rogue Sector &amp; AI Tracker</a>'));
  assert.ok(indexHtml.includes('href="pages/roster.html" class="suite-link">🎖️ Mode 4: Hostile Matrix &amp; Nemeses</a>'));
  assert.ok(indexHtml.includes('href="pages/crusade.html" class="suite-link">🏆 Mode 5: Crusade Quartermaster</a>'));
  assert.ok(indexHtml.includes('href="pages/briefing.html" class="suite-link">📜 Mode 6: Briefings, Ship &amp; Atlas</a>'));
  assert.ok(indexHtml.includes('href="pages/vox.html" class="suite-link">📡 Mode 7: Astropath Vox</a>'));

  // Stylesheet and Vox Audio in index.html
  assert.ok(indexHtml.includes('<link rel="stylesheet" href="css/style.css">'));
  assert.ok(indexHtml.includes('<script src="js/vox-audio.js"></script>'), 'index.html must link to js/vox-audio.js');

  // Mode 1 Spawner modular script architecture in pages/spawner.html
  const spawnerHtml = readPage('pages/spawner.html');
  assert.ok(spawnerHtml.includes('<script src="../js/data.js"></script>'));
  assert.ok(spawnerHtml.includes('<script src="../js/rng.js"></script>'));
  assert.ok(spawnerHtml.includes('<script src="../js/spawner.js"></script>'));
  assert.ok(spawnerHtml.includes('<script src="../js/app.js"></script>'));
  assert.ok(spawnerHtml.includes('<script src="../js/vox-audio.js"></script>'), 'spawner.html must link to js/vox-audio.js');
});

test('UI Boundary: all subpages live in /pages and share unified navigation links', () => {
  const subpages = ['spawner.html', 'pvp.html', 'rogue.html', 'roster.html', 'crusade.html', 'briefing.html', 'vox.html', 'welcome.html'];
  const expectedBriefingSnippet = 'href="briefing.html" class="suite-link';
  const expectedRootIndexSnippet = 'href="../index.html" class="suite-link';

  for (const page of subpages) {
    const rootPagePath = path.join(ROOT_DIR, page);
    assert.equal(fs.existsSync(rootPagePath), false, `${page} must not remain loose in repository root`);

    const html = readPage(path.join('pages', page));
    assert.ok(html.includes(expectedRootIndexSnippet), `pages/${page} must link back to ../index.html`);
    assert.ok(html.includes(expectedBriefingSnippet), `pages/${page} missing standard briefing suite-link`);
    assert.ok(
      html.includes('Briefings, Ship &amp; Atlas') || html.includes('Briefings, Ship & Atlas'),
      `pages/${page} navigation text must match Briefings, Ship & Atlas`
    );
    assert.ok(html.includes('<script src="../js/vox-audio.js"></script>'), `pages/${page} must link to ../js/vox-audio.js`);
    assert.ok(html.includes('<link rel="stylesheet" href="../css/style.css">'), `pages/${page} must link to ../css/style.css`);
  }

  const briefingHtml = readPage('pages/briefing.html');
  assert.ok(
    briefingHtml.includes('href="../index.html" class="terminal-link-btn">'),
    'pages/briefing.html terminal button must link to ../index.html'
  );
});

test('All HTML pages link to assets/favicon.svg and apple-touch-icon in /assets', () => {
  const faviconSvgPath = path.join(ROOT_DIR, 'assets/favicon.svg');
  const faviconPngPath = path.join(ROOT_DIR, 'assets/favicon.png');
  assert.ok(fs.existsSync(faviconSvgPath), 'assets/favicon.svg must exist in /assets directory');
  assert.ok(fs.existsSync(faviconPngPath), 'assets/favicon.png must exist in /assets directory');
  assert.equal(fs.existsSync(path.join(ROOT_DIR, 'favicon.svg')), false, 'favicon.svg must not remain in root');
  assert.equal(fs.existsSync(path.join(ROOT_DIR, 'favicon.png')), false, 'favicon.png must not remain in root');

  const indexHtml = readPage('index.html');
  assert.match(
    indexHtml,
    /<link\s+rel="icon"\s+type="image\/svg\+xml"\s+href="assets\/favicon\.svg"\s*\/?>/i,
    'index.html must include <link rel="icon" type="image/svg+xml" href="assets/favicon.svg">'
  );
  assert.match(
    indexHtml,
    /<link\s+rel="apple-touch-icon"\s+href="assets\/favicon\.svg"\s*\/?>/i,
    'index.html must include <link rel="apple-touch-icon" href="assets/favicon.svg">'
  );

  const subpages = ['pages/spawner.html', 'pages/briefing.html', 'pages/pvp.html', 'pages/rogue.html', 'pages/roster.html', 'pages/crusade.html', 'pages/vox.html', 'pages/welcome.html'];
  for (const page of subpages) {
    const html = readPage(page);
    assert.match(
      html,
      /<link\s+rel="icon"\s+type="image\/svg\+xml"\s+href="\.\.\/assets\/favicon\.svg"\s*\/?>/i,
      `${page} must include <link rel="icon" type="image/svg+xml" href="../assets/favicon.svg">`
    );
    assert.match(
      html,
      /<link\s+rel="apple-touch-icon"\s+href="\.\.\/assets\/favicon\.svg"\s*\/?>/i,
      `${page} must include <link rel="apple-touch-icon" href="../assets/favicon.svg">`
    );
  }
});

test('UI Boundary: pages/briefing.html defaults to Commander Beta dossier and includes immersive dispatch without Marauder spoiler', () => {
  const html = readPage('pages/briefing.html');

  // Verify tab switcher defaults to Beta
  assert.match(
    html,
    /<button\s+id="btnBeta"\s+class="active"/i,
    'pages/briefing.html must have #btnBeta active by default'
  );
  assert.doesNotMatch(
    html,
    /<button\s+id="btnAlpha"\s+class="active"/i,
    'pages/briefing.html must not have #btnAlpha active by default'
  );

  // Verify dossier containers default visibility
  assert.match(
    html,
    /<div\s+id="dossierAlpha"\s+class="hidden"/i,
    '#dossierAlpha must have class="hidden" by default'
  );
  assert.match(
    html,
    /<div\s+id="dossierBeta"(?!\s+class="hidden")/i,
    '#dossierBeta must be visible (not hidden) on load'
  );

  // Verify Royal Engram Seal clearance gate and Tomb-Ship Master Matrix / Intercepted Vox sections
  const normHtml = html.replace(/\s+/g, ' ');
  assert.ok(
    normHtml.includes('Tomb-Ship Autonomous Master Matrix &amp; Intercepted Vox'),
    'Must include Tomb-Ship Autonomous Master Matrix & Intercepted Vox title'
  );
  assert.ok(
    normHtml.includes('Royal Engram Seal • Lord Commander Junebug • Restricted Tomb-Ship Dataslate'),
    'Must include Lord Commander Junebug Royal Engram Seal clearance tag'
  );
  assert.ok(
    normHtml.includes('Open-Frequency Orbital Parley (Geostationary Zenith-09)'),
    'Must include Open-Frequency Orbital Parley (Geostationary Zenith-09) section'
  );
  assert.ok(
    html.includes('unlock-btn') && html.includes("unlockTab('Beta')"),
    'Must include unlock button for Beta'
  );
  assert.ok(
    html.includes('lock-toggle-btn') && html.includes("lockTab('Beta')"),
    'Must include lock toggle button for Beta'
  );

  // Verify secret Marauder spoiler is NOT present
  assert.ok(
    !html.includes('and will switch to <strong>⚔️ Marauders</strong> if you claim Gatebreakers'),
    'Briefing must not reveal Alpha switching to Marauders if Beta chooses Gatebreakers'
  );
  assert.ok(
    !html.includes('Commander Alpha (Gatebreakers)'),
    'Briefing must not reveal Alpha choosing Gatebreakers on public Atlas or non-Alpha sections'
  );
});

test('pages/briefing.html contains the 8-Node SVG Sector Map and 3-way Parallel Hegemony Race tracker', () => {
  const html = readPage('pages/briefing.html');

  assert.match(html, /id="armageddon-sector-map"/, 'pages/briefing.html must contain #armageddon-sector-map SVG');
  assert.match(html, /id="atlas-node-inspector"/, 'pages/briefing.html must contain #atlas-node-inspector panel');
  assert.match(html, /id="fullscreenQuickHud"/, 'pages/briefing.html must contain #fullscreenQuickHud telemetry panel');
  assert.match(html, /id="fsHudRule"/, 'pages/briefing.html must contain #fsHudRule strategic intelligence box');
  assert.match(html, /id="heg-bar-alpha"/, 'pages/briefing.html must contain Alpha parallel hegemony bar');
  assert.match(html, /id="heg-bar-beta"/, 'pages/briefing.html must contain Beta parallel hegemony bar');
  assert.match(html, /id="heg-bar-horde"/, 'pages/briefing.html must contain 3rd Alliance parallel hegemony bar');

  // Verify scoreboard in roster.html does not spoil Alpha alliance
  const rosterHtml = readPage('pages/roster.html');
  assert.ok(
    !rosterHtml.includes('Commander Alpha • Gatebreakers'),
    'Global scoreboard in roster.html must not spoil Commander Alpha alliance'
  );

  for (let i = 0; i <= 7; i++) {
    assert.match(
      html,
      new RegExp(`data-node-id="${i}"`),
      `SVG map in pages/briefing.html must include interactive node data-node-id="${i}"`
    );
  }
});

test('UI Boundary: pages integrate localStorage persistence so users can navigate tabs without resetting progress', () => {
  const briefingHtml = readPage('pages/briefing.html');
  assert.ok(briefingHtml.includes('foa_briefing_state_v1'), 'pages/briefing.html must persist state to foa_briefing_state_v1');
  assert.ok(briefingHtml.includes('saveBriefingState'), 'pages/briefing.html must have saveBriefingState');
  assert.ok(briefingHtml.includes('restoreBriefingState'), 'pages/briefing.html must have restoreBriefingState');

  const pvpHtml = readPage('pages/pvp.html');
  assert.ok(pvpHtml.includes('foa_pvp_state_v1'), 'pages/pvp.html must persist state to foa_pvp_state_v1');
  assert.ok(pvpHtml.includes('savePvpState'), 'pages/pvp.html must have savePvpState');
  assert.ok(pvpHtml.includes('restorePvpState'), 'pages/pvp.html must have restorePvpState');

  const rogueHtml = readPage('pages/rogue.html');
  assert.ok(rogueHtml.includes('foa_rogue_state_v1'), 'pages/rogue.html must persist state to foa_rogue_state_v1');
  assert.ok(rogueHtml.includes('saveRogueState'), 'pages/rogue.html must have saveRogueState');
  assert.ok(rogueHtml.includes('restoreRogueState'), 'pages/rogue.html must have restoreRogueState');

  const appJs = fs.readFileSync(path.join(ROOT_DIR, 'js/app.js'), 'utf8');
  assert.ok(appJs.includes('foa_horde_session_v1'), 'app.js must persist session to foa_horde_session_v1');
  assert.ok(appJs.includes('saveSessionState'), 'app.js must define saveSessionState');
  assert.ok(appJs.includes('restoreSessionState'), 'app.js must define restoreSessionState');
});

test('Documentation Boundary: breakdown bundle markdown files exist for each page, module, and package', () => {
  const bundlesDir = path.join(ROOT_DIR, 'bundles');
  assert.ok(fs.existsSync(bundlesDir), 'bundles/ directory must exist');

  const requiredBundles = [
    { file: 'bundle_index.md', check: 'index.html' },
    { file: 'bundle_javascript.md', check: 'js/vox-audio.js' },
    { file: 'bundle_tests.md', check: 'tests/ui/pages.test.js' },
    { file: 'bundle_briefing.md', check: 'pages/briefing.html' },
    { file: 'bundle_pvp.md', check: 'pages/pvp.html' },
    { file: 'bundle_rogue.md', check: 'pages/rogue.html' },
    { file: 'bundle_roster.md', check: 'pages/roster.html' },
    { file: 'bundle_crusade.md', check: 'pages/crusade.html' },
    { file: 'bundle_vox.md', check: 'pages/vox.html' },
    { file: 'bundle_welcome.md', check: 'pages/welcome.html' },
    { file: 'bundle_css.md', check: 'css/style.css' },
    { file: 'bundle_packages.md', check: 'package.json' }
  ];

  for (const b of requiredBundles) {
    const bundlePath = path.join(bundlesDir, b.file);
    assert.ok(fs.existsSync(bundlePath), `${b.file} must exist in bundles/ directory`);
    const content = fs.readFileSync(bundlePath, 'utf8');
    assert.ok(content.length > 500, `${b.file} must not be empty`);
    assert.ok(content.includes(b.check), `${b.file} must contain its target file ${b.check}`);
    assert.equal(content.includes('\0'), false, `${b.file} must not contain null bytes`);
  }

  // Deprecated bundle files must not exist
  assert.equal(
    fs.existsSync(path.join(bundlesDir, 'bundle_css_packages.md')),
    false,
    'bundle_css_packages.md is deprecated in favor of bundle_css.md and bundle_packages.md'
  );
  assert.equal(
    fs.existsSync(path.join(ROOT_DIR, 'codebase_bundle.md')),
    false,
    'codebase_bundle.md is deprecated; project exclusively uses modular bundles in /bundles/'
  );
});

test('UI Boundary: pages/welcome.html provides concise tutorials for all game modes and audio suite', () => {
  const html = readPage('pages/welcome.html');
  assert.ok(
    html.includes('Mode 1: Horde Command &amp; Automated Spawner') ||
    html.includes('Mode 1: Horde Command & Automated Spawner'),
    'welcome.html must explain Mode 1'
  );
  assert.ok(html.includes('Mode 2: 1v1 Ash Wastes PvP'), 'welcome.html must explain Mode 2');
  assert.ok(html.includes('Mode 3: Rogue Sector'), 'welcome.html must explain Mode 3');
  assert.ok(html.includes('Mode 4: Hostile Matrix'), 'welcome.html must explain Mode 4');
  assert.ok(html.includes('Mode 5: Crusade Quartermaster'), 'welcome.html must explain Mode 5');
  assert.ok(html.includes('Mode 6: Commander Briefings') || html.includes('Mode 6: Briefings'), 'welcome.html must explain Mode 6');
  assert.ok(html.includes('Mode 7: Astropathic CRT Vox-Sanctum') || html.includes('Mode 7: Astropath Vox'), 'welcome.html must explain Mode 7');
  assert.ok(html.includes('Vox-Caster Ambience'), 'welcome.html must explain audio features');
  assert.ok(html.includes('<link rel="stylesheet" href="../css/style.css">'), 'welcome.html must link to style.css');
  assert.ok(html.includes('<script src="../js/vox-audio.js"></script>'), 'welcome.html must link to vox-audio.js');
  assert.ok(html.includes('http-equiv="refresh"') && html.includes('url=../index.html'), 'welcome.html must redirect to index.html');
});

test('UI Boundary: index.html serves as the centered Field Codex home launchpad', () => {
  const html = readPage('index.html');
  assert.ok(html.includes('The Fires of Armageddon'), 'index.html must display campaign title');
  assert.ok(html.includes('New Commander Induction Protocol'), 'index.html must feature onboarding protocol');
  assert.ok(html.includes('welcome-btn-row'), 'index.html must feature centered action button rows');
  assert.ok(html.includes('pages/spawner.html'), 'index.html must link to Mode 1 spawner');
  assert.ok(html.includes('pages/pvp.html'), 'index.html must link to Mode 2 1v1 PvP');
  assert.ok(html.includes('pages/rogue.html'), 'index.html must link to Mode 3 Rogue AI');
  assert.ok(html.includes('pages/roster.html'), 'index.html must link to Mode 4 Hostile Matrix');
  assert.ok(html.includes('pages/crusade.html'), 'index.html must link to Mode 5 Crusade Quartermaster');
  assert.ok(html.includes('pages/briefing.html'), 'index.html must link to Mode 6 Briefings');
  assert.ok(html.includes('pages/vox.html'), 'index.html must link to Mode 7 Vox');
});

test('UI Script Boundary: HTML script sequences parse cleanly in shared scope without duplicate identifier declarations', () => {
  const vm = require('node:vm');
  const pages = [
    'index.html',
    'pages/spawner.html',
    'pages/pvp.html',
    'pages/rogue.html',
    'pages/roster.html',
    'pages/crusade.html',
    'pages/briefing.html',
    'pages/vox.html',
    'pages/welcome.html'
  ];

  for (const p of pages) {
    const html = readPage(p);
    const dir = path.dirname(path.join(ROOT_DIR, p));
    const scriptRegex = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
    let match;
    const scriptContents = [];

    while ((match = scriptRegex.exec(html)) !== null) {
      const attrs = match[1] || '';
      const inlineCode = match[2] || '';
      const srcMatch = attrs.match(/src=["']([^"']+)["']/i);
      if (srcMatch) {
        const srcPath = path.resolve(dir, srcMatch[1]);
        if (fs.existsSync(srcPath)) {
          scriptContents.push(fs.readFileSync(srcPath, 'utf8'));
        }
      } else if (inlineCode.trim()) {
        scriptContents.push(inlineCode);
      }
    }

    // Concatenate all scripts that run sequentially in this HTML page into a single lexical script block
    const concatenatedCode = scriptContents.join('\n;\n');
    assert.doesNotThrow(() => {
      new vm.Script(concatenatedCode, { filename: `${p}-concatenated-scripts.js` });
    }, `Scripts in ${p} must not contain top-level duplicate identifier declarations (e.g. const/let collisions)`);
  }
});

/**
 * Launches a headless Playwright browser, falling back to system Chrome or Edge
 * when the standalone Playwright Chromium binary is not installed locally.
 */
async function launchTestBrowser() {
  const { chromium } = require('playwright');
  for (const opts of [{ headless: true }, { channel: 'chrome', headless: true }, { channel: 'msedge', headless: true }]) {
    try {
      return await chromium.launch(opts);
    } catch (_) {}
  }
  throw new Error('Could not launch headless Chromium, Chrome, or Edge for UI integration test');
}

test('UI Browser Integration: all HTML pages load in headless browser with zero uncaught page errors', async () => {
  const browser = await launchTestBrowser();
  const page = await browser.newPage();

  const pages = [
    'index.html',
    'pages/spawner.html',
    'pages/pvp.html',
    'pages/rogue.html',
    'pages/roster.html',
    'pages/crusade.html',
    'pages/briefing.html',
    'pages/vox.html',
    'pages/welcome.html'
  ];

  try {
    for (const p of pages) {
      const pageErrors = [];
      const errorListener = (err) => pageErrors.push(err.message);
      page.on('pageerror', errorListener);

      const filePath = 'file:///' + path.resolve(ROOT_DIR, p).replace(/\\/g, '/');
      await page.goto(filePath, { waitUntil: 'load' });

      assert.equal(
        pageErrors.length,
        0,
        `Page ${p} threw uncaught browser errors on load: ${pageErrors.join(' | ')}`
      );

      page.off('pageerror', errorListener);
    }
  } finally {
    await browser.close();
  }
});

test('UI Boundary: pages/roster.html loads with live dossier preview, active tab 1, and interactive submenu navigation', async () => {
  const browser = await launchTestBrowser();
  const page = await browser.newPage();

  const filePath = 'file:///' + path.resolve(ROOT_DIR, 'pages/roster.html').replace(/\\/g, '/');

  try {
    const pageErrors = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));
    await page.goto(filePath, { waitUntil: 'load' });

    assert.equal(pageErrors.length, 0, `pages/roster.html must have zero browser page errors: ${pageErrors.join(' | ')}`);

    // 1. Initial preview text verification
    const initialPreview = await page.evaluate(() => document.getElementById('nemDossierPreview')?.textContent || '');
    assert.ok(initialPreview.length > 50, 'Preview box must contain initial dossier example text on load');
    assert.ok(initialPreview.includes('ORDO MALLEUS'), 'Preview must feature ORDO MALLEUS banner');
    assert.ok(initialPreview.includes('FILING COMMANDER'), 'Preview must feature filing commander field');

    // 2. Tab 1 is active by default
    const isTab1Active = await page.evaluate(() => document.getElementById('rosTabBtn1')?.classList.contains('active'));
    const isTabNemesisVisible = await page.evaluate(() => !document.getElementById('rosTabNemesis')?.classList.contains('hidden'));
    assert.equal(isTab1Active, true, 'Tab 1 button must be active by default');
    assert.equal(isTabNemesisVisible, true, 'Tab Nemesis panel must be visible by default');

    // 3. Switch to Tab 2 (Unbound Adversaries)
    await page.click('#rosTabBtn2');
    const isTab2Active = await page.evaluate(() => document.getElementById('rosTabBtn2')?.classList.contains('active'));
    const isTabUnboundVisible = await page.evaluate(() => !document.getElementById('rosTabUnbound')?.classList.contains('hidden'));
    const isTabNemesisHidden = await page.evaluate(() => document.getElementById('rosTabNemesis')?.classList.contains('hidden'));
    assert.equal(isTab2Active, true, 'Tab 2 button must become active after click');
    assert.equal(isTabUnboundVisible, true, 'Tab Unbound panel must become visible after clicking Tab 2');
    assert.equal(isTabNemesisHidden, true, 'Tab Nemesis panel must be hidden after switching to Tab 2');

    // 4. Switch to Tab 3 (Brackets & Cloud Pool)
    await page.click('#rosTabBtn3');
    const isTab3Active = await page.evaluate(() => document.getElementById('rosTabBtn3')?.classList.contains('active'));
    const isTabBracketsVisible = await page.evaluate(() => !document.getElementById('rosTabBrackets')?.classList.contains('hidden'));
    assert.equal(isTab3Active, true, 'Tab 3 button must become active after click');
    assert.equal(isTabBracketsVisible, true, 'Tab Brackets panel must become visible after clicking Tab 3');

    // 5. Switch back to Tab 1
    await page.click('#rosTabBtn1');
    const isTab1Restored = await page.evaluate(() => !document.getElementById('rosTabNemesis')?.classList.contains('hidden'));
    assert.equal(isTab1Restored, true, 'Tab 1 panel must restore visibility when clicked');

    // 6. Live update preview upon user input
    await page.fill('#nemReportUnit', 'Tyranids — Screamer-Killer Test Unit');
    await page.fill('#nemReportNotes', 'Weathered two melta shots and eliminated heavy infantry.');
    const updatedPreview = await page.evaluate(() => document.getElementById('nemDossierPreview')?.textContent || '');
    assert.ok(updatedPreview.includes('Tyranids — Screamer-Killer Test Unit'), 'Preview must update with entered unit');
    assert.ok(updatedPreview.includes('Weathered two melta shots'), 'Preview must update with entered notes');
  } finally {
    await browser.close();
  }
});

test('E2E Integration: seamless router supports multi-page navigation (vox -> roster -> vox -> roster) with zero syntax errors and responsive button interactions', async () => {
  const http = require('node:http');
  const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/') reqPath = '/index.html';
    const filePath = path.join(ROOT_DIR, reqPath);
    if (fs.existsSync(filePath)) {
      if (filePath.endsWith('.html')) res.setHeader('Content-Type', 'text/html');
      else if (filePath.endsWith('.js')) res.setHeader('Content-Type', 'application/javascript');
      else if (filePath.endsWith('.css')) res.setHeader('Content-Type', 'text/css');
      res.writeHead(200);
      res.end(fs.readFileSync(filePath));
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  });

  const port = await new Promise((resolve) => {
    server.listen(0, () => resolve(server.address().port));
  });

  let browser;
  const pageErrors = [];

  try {
    browser = await launchTestBrowser();
    const page = await browser.newPage();
    page.on('pageerror', (err) => pageErrors.push(err.message));

    // 1. Initial load on vox.html
    await page.goto(`http://localhost:${port}/pages/vox.html`);
    await page.waitForTimeout(300);

    // 2. Seamlessly navigate to roster.html
    const rosterLink = await page.$('a[href*="roster.html"]');
    assert.ok(rosterLink, 'Roster link must exist in navigation bar');
    await rosterLink.click();
    await page.waitForTimeout(400);

    // 3. Verify roster functions are defined and not aborted by syntax error
    const switchTabType = await page.evaluate(() => typeof window.switchRosterTab);
    assert.equal(switchTabType, 'function', 'window.switchRosterTab must be defined on window after seamless navigation');

    // 4. Click Tab 2 (Unbound Adversaries) and verify visibility
    await page.click('#rosTabBtn2');
    let isTab2Active = await page.evaluate(() => document.getElementById('rosTabBtn2')?.classList.contains('active'));
    let isTabUnboundVisible = await page.evaluate(() => !document.getElementById('rosTabUnbound')?.classList.contains('hidden'));
    assert.equal(isTab2Active, true, 'Tab 2 button must become active after click');
    assert.equal(isTabUnboundVisible, true, 'Tab Unbound panel must be visible');

    // 5. Click Tab 3 (Horde Brackets)
    await page.click('#rosTabBtn3');
    let isTabBracketsVisible = await page.evaluate(() => !document.getElementById('rosTabBrackets')?.classList.contains('hidden'));
    assert.equal(isTabBracketsVisible, true, 'Tab Brackets panel must be visible');

    // 6. Click Save Shelf Barracks button
    const saveBtn = await page.$('button[onclick="saveShelfBarracks()"]');
    assert.ok(saveBtn, 'Save Shelf Barracks button must exist');
    await saveBtn.click();

    // 7. Navigate back to vox.html
    const voxLink = await page.$('a[href*="vox.html"]');
    assert.ok(voxLink, 'Vox link must exist in navigation bar');
    await voxLink.click();
    await page.waitForTimeout(400);

    // 8. Re-visit roster.html to verify no re-declaration syntax collision
    const returnRosterLink = await page.$('a[href*="roster.html"]');
    await returnRosterLink.click();
    await page.waitForTimeout(400);

    // 9. Click Tab 2 again on re-visited roster
    await page.click('#rosTabBtn2');
    isTab2Active = await page.evaluate(() => document.getElementById('rosTabBtn2')?.classList.contains('active'));
    isTabUnboundVisible = await page.evaluate(() => !document.getElementById('rosTabUnbound')?.classList.contains('hidden'));
    assert.equal(isTab2Active, true, 'Tab 2 button must remain responsive on re-visited page');
    assert.equal(isTabUnboundVisible, true, 'Tab Unbound panel must be visible on re-visited page');

    // 10. Switch back to Tab 1
    await page.click('#rosTabBtn1');
    const isTabNemesisVisible = await page.evaluate(() => !document.getElementById('rosTabNemesis')?.classList.contains('hidden'));
    assert.equal(isTabNemesisVisible, true, 'Tab 1 panel must restore visibility on re-visited page');

    // Filter out potential 401 Supabase unauthenticated RPC noise
    const syntaxErrors = pageErrors.filter((e) => !e.includes('401'));
    assert.deepEqual(syntaxErrors, [], 'Must encounter 0 page errors or syntax errors during seamless navigation');
  } finally {
    if (browser) await browser.close();
    server.close();
  }
});

test('Documentation Boundary: README.md and bundles/README.md provide technical architecture deep-dives and explicit AI involvement disclosures', () => {
  const rootReadme = readPage('README.md');
  const bundlesReadme = readPage('bundles/README.md');

  // Root README technical sections & AI involvement disclosure
  assert.ok(rootReadme.includes('System Architecture'), 'README.md must include a System Architecture section');
  assert.ok(rootReadme.includes('AI Involvement & Human-AI Collaboration'), 'README.md must disclose AI involvement at runtime and development time');
  assert.ok(rootReadme.includes('Functional Core, Imperative Shell'), 'README.md must document the Functional Core / Dumb UI architecture');
  assert.ok(rootReadme.includes('mulberry32'), 'README.md must document the deterministic mulberry32 PRNG engine');
  assert.ok(rootReadme.includes('Web Audio API'), 'README.md must document the procedural Web Audio API synthesizer');
  assert.ok(rootReadme.includes('vox_server_heartbeat'), 'README.md must document the Supabase RPC & live server heartbeat architecture');

  // Bundles README technical context & AI ingestion explanation
  assert.ok(bundlesReadme.includes('AI Context-Window Partitioning'), 'bundles/README.md must explain the AI context-window partitioning architecture');
  assert.ok(bundlesReadme.includes('quadruple-backtick'), 'bundles/README.md must document the quadruple-backtick escaping mechanism');
});

test('UI Boundary: pages/spawner.html HUD bar keeps room info and cloud sync badge aligned on a single row without wrapping', () => {
  const spawnerHtml = readPage('pages/spawner.html');
  const css = readPage('css/style.css');

  // Verify .cloud-sync-pill is defined in global css with white-space: nowrap
  assert.ok(css.includes('.cloud-sync-pill'), 'css/style.css must define .cloud-sync-pill');
  assert.match(
    css,
    /\.cloud-sync-pill[\s\S]*?white-space:\s*nowrap;/,
    '.cloud-sync-pill must enforce white-space: nowrap to prevent broken multiline badges'
  );

  // Verify HUD bar session info row enforces nowrap and alignment
  assert.match(
    spawnerHtml,
    /<div[^>]*style="[^"]*display:\s*flex;[^"]*align-items:\s*center;[^"]*white-space:\s*nowrap;[^"]*"[^>]*>[\s\S]*?id="hudSessionInfo"[\s\S]*?id="spawnerSyncBadge"/,
    'HUD room info row must align hudSessionInfo and spawnerSyncBadge with white-space: nowrap'
  );

  // Verify hudRound has clean alignment
  assert.match(
    spawnerHtml,
    /id="hudRound"[^>]*style="[^"]*text-align:\s*left;/,
    '#hudRound must have text-align: left so round title aligns cleanly under room label'
  );
});






````

---

## File: `tests/ui/briefing.test.js` <a id="file-testsuibriefingtestjs"></a>

````javascript
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '../../');
const BRIEFING_HTML_PATH = path.join(ROOT_DIR, 'pages/briefing.html');

// Read briefing.html and extract script block
const briefingHtml = fs.readFileSync(BRIEFING_HTML_PATH, 'utf8');
const scriptMatches = briefingHtml.match(/<script>([\s\S]*?)<\/script>/);
assert.ok(scriptMatches && scriptMatches[1], 'Must locate script tag inside pages/briefing.html');
const briefingScriptCode = scriptMatches[1];

// Set up mock DOM and localStorage environment
const storageStore = new Map();
globalThis.localStorage = {
  getItem: (k) => (storageStore.has(k) ? storageStore.get(k) : null),
  setItem: (k, v) => storageStore.set(k, String(v)),
  removeItem: (k) => storageStore.delete(k),
  clear: () => storageStore.clear()
};

function createMockElement() {
  return {
    classList: {
      classes: new Set(),
      toggle(cls, cond) {
        if (cond === undefined) {
          if (this.classes.has(cls)) this.classes.delete(cls);
          else this.classes.add(cls);
          return this.classes.has(cls);
        }
        if (cond) this.classes.add(cls);
        else this.classes.delete(cls);
        return cond;
      },
      add(cls) { this.classes.add(cls); },
      remove(cls) { this.classes.delete(cls); },
      contains(cls) { return this.classes.has(cls); }
    },
    textContent: '',
    innerHTML: '',
    style: {}
  };
}

const mockElements = {
  dossierAlpha: createMockElement(),
  dossierBeta: createMockElement(),
  dossierAtlas: createMockElement(),
  dossierRules: createMockElement(),
  btnAlpha: createMockElement(),
  btnBeta: createMockElement(),
  btnAtlas: createMockElement(),
  btnRules: createMockElement(),
  gateAlpha: createMockElement(),
  contentAlpha: createMockElement(),
  gateBeta: createMockElement(),
  contentBeta: createMockElement(),
  shipSliderLabel: createMockElement(),
  sliderDetailBox: createMockElement(),
  auspexViewport: createMockElement(),
  auspexMapFrame: createMockElement(),
  fullscreenMapBtn: createMockElement(),
  fullscreenQuickHud: createMockElement(),
  fsHudDetails: createMockElement(),
  fsToggleDetailsBtn: createMockElement(),
  atlasInspectorName: createMockElement(),
  atlasInspectorDominance: createMockElement(),
  atlasInspectorReward: createMockElement(),
  fsHudName: createMockElement(),
  fsHudDominance: createMockElement(),
  fsHudRule: createMockElement(),
  hegBarAlpha: createMockElement(),
  hegBarBeta: createMockElement(),
  hegBarHorde: createMockElement(),
  fsHegBarAlpha: createMockElement(),
  fsHegBarBeta: createMockElement(),
  fsHegBarHorde: createMockElement()
};

for (let i = -3; i <= 3; i++) {
  mockElements['sliderBtn' + i] = createMockElement();
  mockElements['node' + i] = createMockElement();
  mockElements['reckRow' + i] = createMockElement();
}
['1', '15', '22'].forEach(k => {
  mockElements['zoomBtn' + k] = createMockElement();
});
for (let i = 0; i <= 7; i++) {
  mockElements['map-node-' + i] = createMockElement();
}

globalThis.document = {
  body: createMockElement(),
  getElementById: (id) => mockElements[id] || null,
  querySelectorAll: () => []
};

globalThis.window = {
  location: { hash: '' },
  addEventListener: () => {}
};

// Evaluate script in mock environment
const fn = new Function('document', 'window', 'localStorage', 'console', `${briefingScriptCode}; return {
  BRIEFING_STORAGE_KEY,
  SHIP_SLIDER_DATA,
  ATLAS_NODES,
  getBriefingState: () => briefingState,
  saveBriefingState,
  restoreBriefingState,
  showDossier,
  unlockTab,
  lockTab,
  selectSlider,
  setAuspexZoom,
  toggleAuspexFullscreen,
  toggleFsHudDetails,
  getDominanceText,
  selectAtlasNode
};`);

const briefing = fn(globalThis.document, globalThis.window, globalThis.localStorage, console);

test('briefing: ATLAS_NODES and SHIP_SLIDER_DATA have complete schemas', () => {
  const nodeKeys = Object.keys(briefing.ATLAS_NODES);
  assert.equal(nodeKeys.length, 8, 'Sector Map must define 8 tactical nodes');
  assert.ok(briefing.SHIP_SLIDER_DATA['-3'] && briefing.SHIP_SLIDER_DATA['3'], 'Ship power slider must span from -3 to +3');

  nodeKeys.forEach((key) => {
    const n = briefing.ATLAS_NODES[key];
    assert.ok(n.title, `Node ${key} must have a title`);
    assert.ok(n.rule, `Node ${key} must have tactical rule / strategic intelligence`);
  });
});

test('briefing: showDossier switches active dossier and updates buttons', () => {
  briefing.showDossier('beta', false);
  assert.equal(globalThis.document.body.classList.contains('necron-briefing-active'), true, 'Must activate necron-briefing-active on body when Beta tab is active');

  briefing.showDossier('atlas', true);

  assert.equal(briefing.getBriefingState().activeDossier, 'atlas');
  assert.equal(globalThis.document.body.classList.contains('necron-briefing-active'), false, 'Must deactivate necron-briefing-active on body when leaving Beta tab');
  assert.equal(mockElements.dossierAtlas.classList.contains('hidden'), false);
  assert.equal(mockElements.btnAtlas.classList.contains('active'), true);
  assert.equal(mockElements.dossierBeta.classList.contains('hidden'), true);
  assert.equal(mockElements.btnBeta.classList.contains('active'), false);

  const raw = localStorage.getItem(briefing.BRIEFING_STORAGE_KEY);
  const parsed = JSON.parse(raw);
  assert.equal(parsed.activeDossier, 'atlas');
});

test('briefing: unlockTab and lockTab manage clearance gates, persist states, and activate global Necron or Militarum color mode', () => {
  briefing.unlockTab('Beta', true);
  assert.equal(mockElements.gateBeta.classList.contains('hidden'), true);
  assert.equal(mockElements.contentBeta.classList.contains('hidden'), false);
  assert.equal(briefing.getBriefingState().unlockedBeta, true);
  assert.equal(globalThis.document.body.classList.contains('theme-necron'), true, 'Unlocking Beta broadcast must activate global theme-necron');
  assert.equal(globalThis.document.body.classList.contains('theme-militarum'), false);
  assert.equal(localStorage.getItem('foa_faction_theme_v1'), 'necron', 'Unlocking Beta broadcast must persist necron theme mode');

  briefing.unlockTab('Alpha', true);
  assert.equal(mockElements.gateAlpha.classList.contains('hidden'), true);
  assert.equal(mockElements.contentAlpha.classList.contains('hidden'), false);
  assert.equal(briefing.getBriefingState().unlockedAlpha, true);
  assert.equal(globalThis.document.body.classList.contains('theme-militarum'), true, 'Unlocking Alpha broadcast must activate global theme-militarum');
  assert.equal(globalThis.document.body.classList.contains('theme-necron'), false);
  assert.equal(localStorage.getItem('foa_faction_theme_v1'), 'militarum', 'Unlocking Alpha broadcast must persist militarum theme mode');

  // Switching between unlocked broadcasts switches global faction color mode
  briefing.showDossier('beta', true);
  assert.equal(globalThis.document.body.classList.contains('theme-necron'), true, 'Viewing unlocked Beta dossier activates theme-necron');
  briefing.showDossier('alpha', true);
  assert.equal(globalThis.document.body.classList.contains('theme-militarum'), true, 'Viewing unlocked Alpha dossier activates theme-militarum');

  briefing.lockTab('Beta', true);
  assert.equal(mockElements.gateBeta.classList.contains('hidden'), false);
  assert.equal(mockElements.contentBeta.classList.contains('hidden'), true);
  assert.equal(briefing.getBriefingState().unlockedBeta, false);
});

test('briefing: selectSlider updates active node and description', () => {
  briefing.selectSlider(2, true);

  assert.equal(briefing.getBriefingState().shipSlider, 2);
  assert.equal(mockElements['sliderBtn2'].classList.contains('active'), true);
  assert.equal(mockElements['sliderBtn0'].classList.contains('active'), false);
  assert.equal(mockElements['node2'].classList.contains('active-sanctum'), true);
  assert.equal(mockElements['reckRow2'].classList.contains('highlight-row'), true);
  assert.ok(mockElements.shipSliderLabel.textContent.includes('Current State:'));
});

test('briefing: setAuspexZoom toggles zoom levels (1x, 15x, 22x)', () => {
  briefing.setAuspexZoom('15x');
  assert.equal(mockElements.auspexViewport.classList.contains('zoom-15x'), true);
  assert.equal(mockElements.auspexViewport.classList.contains('zoom-1x'), false);
  assert.equal(mockElements.zoomBtn15.classList.contains('active'), true);
  assert.equal(mockElements.zoomBtn1.classList.contains('active'), false);

  briefing.setAuspexZoom('22x');
  assert.equal(mockElements.auspexViewport.classList.contains('zoom-22x'), true);
  assert.equal(mockElements.zoomBtn22.classList.contains('active'), true);
});

test('briefing: toggleAuspexFullscreen and toggleFsHudDetails toggle UI states', () => {
  mockElements.auspexMapFrame.classList.remove('hololith-fullscreen');
  briefing.toggleAuspexFullscreen();
  assert.equal(mockElements.auspexMapFrame.classList.contains('hololith-fullscreen'), true);
  assert.equal(mockElements.fullscreenMapBtn.textContent, '✕ Exit Fullscreen');

  mockElements.fsHudDetails.classList.remove('hidden-details');
  briefing.toggleFsHudDetails();
  assert.equal(mockElements.fsHudDetails.classList.contains('hidden-details'), true);
  assert.equal(mockElements.fsToggleDetailsBtn.textContent, '▾ Show Telemetry');
});

test('briefing: getDominanceText accurately computes hegemony status', () => {
  // Fog of war
  assert.ok(briefing.getDominanceText({ alphaHP: 0, betaHP: 0, hordeHP: null }).includes('Fog of War'));

  // Beta leading
  assert.ok(briefing.getDominanceText({ alphaHP: 2, betaHP: 5, hordeHP: 1 }).includes('Lord Commander Junebug Leading'));

  // Alpha leading
  assert.ok(briefing.getDominanceText({ alphaHP: 6, betaHP: 2, hordeHP: 1 }).includes('The Exile // Sanctuary of Ash Leading'));

  // Tied
  assert.ok(briefing.getDominanceText({ alphaHP: 3, betaHP: 3, hordeHP: 2 }).includes('Contested Stalemate'));
});

test('briefing: saveBriefingState guards against saving when not on briefing page', () => {
  storageStore.clear();
  storageStore.set(briefing.BRIEFING_STORAGE_KEY, JSON.stringify({ activeDossier: 'rules', custom: true }));

  const origBeta = mockElements.dossierBeta;
  delete mockElements.dossierBeta;

  briefing.saveBriefingState();

  const after = JSON.parse(localStorage.getItem(briefing.BRIEFING_STORAGE_KEY));
  assert.equal(after.custom, true, 'Must not overwrite state when dossierBeta is missing from DOM');

  mockElements.dossierBeta = origBeta;
});

test('briefing: restoreBriefingState restores all user choices from localStorage', () => {
  localStorage.setItem(briefing.BRIEFING_STORAGE_KEY, JSON.stringify({
    activeDossier: 'atlas',
    unlockedAlpha: false,
    unlockedBeta: true,
    shipSlider: -1,
    selectedNode: 3
  }));

  briefing.restoreBriefingState();

  assert.equal(briefing.getBriefingState().activeDossier, 'atlas');
  assert.equal(briefing.getBriefingState().unlockedBeta, true);
  assert.equal(briefing.getBriefingState().shipSlider, -1);
  assert.equal(briefing.getBriefingState().selectedNode, 3);
});

test('briefing: DOM includes read-only slider gauge, Operational Thresholds in Alpha, reckRow-1 highlight, and CURRENT_SHIP_SLIDER = -1', () => {
  // Check read-only styling
  assert.ok(
    /pointer-events:\s*none;/i.test(briefingHtml),
    'Must define pointer-events none'
  );
  assert.ok(briefingHtml.includes('aria-label="Current Shipboard Balance Gauge (Read-Only)"'), 'Must define read-only aria-label');
  
  // Check -1 active status node and Operational Threshold terminology (no "Sweet Spot")
  assert.ok(briefingHtml.includes('id="node-1" class="slider-node active-brig"'), 'Must render node-1 as active-brig');
  assert.ok(
    briefingHtml.includes('-1 (Lower Decks Ascendant — Tier I: Ash-Hold Surge)'),
    'Must include -1 (Lower Decks Ascendant — Tier I: Ash-Hold Surge)'
  );
  assert.ok(
    briefingHtml.replace(/\s+/g, ' ').includes('Optimal Operational Thresholds are <strong>-1</strong> and <strong>+1</strong> (Unlocking the Phase-End Shipboard Cache: +1 RP or +100 pts Supply Limit)') ||
    briefingHtml.replace(/\s+/g, ' ').includes('Optimal Operational Thresholds are -1 and +1 (Unlocking the Phase-End Shipboard Cache: +1 RP or +100 pts Supply Limit)'),
    'Must include Optimal Operational Thresholds are -1 and +1'
  );
  assert.equal(/Sweet Spot/i.test(briefingHtml), false, 'Must not contain legacy Sweet Spot phrasing');

  // Check reckRow-1 highlight in Reckoning Table
  assert.ok(briefingHtml.includes('<tr id="reckRow-1" class="highlight-row">'), 'Must highlight reckRow-1');
  assert.ok(!briefingHtml.includes('<tr id="reckRow0" class="highlight-row">'), 'reckRow0 must not have highlight-row');

  // Check script locked campaign state
  assert.ok(briefingHtml.includes('const CURRENT_SHIP_SLIDER = -1;'), 'Must define locked CURRENT_SHIP_SLIDER = -1');
  assert.ok(briefingHtml.includes('selectSlider(CURRENT_SHIP_SLIDER);'), 'Must invoke selectSlider(CURRENT_SHIP_SLIDER)');
});

test('briefing: DOM includes telemetry grids, Session 0 prologue chronicle, Beta Tomb-Ship Equilibrium Gauge, and Flagship muster protocol', () => {
  // Alpha telemetry & lore
  assert.ok(
    /Deck 44: The Lower Decks &amp; Bay\s+04/.test(briefingHtml) ||
    briefingHtml.includes('Deck 44: The Lower Decks &amp; Bay 04'),
    'Must include Deck 44 telemetry'
  );
  assert.ok(
    /Brig Cell 09: The Bleeding\s+Bulkhead/.test(briefingHtml) ||
    briefingHtml.includes('Brig Cell 09: The Bleeding Bulkhead'),
    'Must include Brig Cell 09 telemetry'
  );
  assert.ok(
    /Deck 01: The High Sanctum\s+Spire/.test(briefingHtml) ||
    briefingHtml.includes('Deck 01: The High Sanctum Spire'),
    'Must include Deck 01 telemetry'
  );
  assert.ok(briefingHtml.includes('Campaign Chronicle Archive // Session 0 Prologue'), 'Must include Session 0 prologue archive');
  assert.ok(briefingHtml.includes('The Left Flank Heresy'), 'Must include chronicle pillar 1');
  assert.ok(
    /The Center Crucible &amp; Rise of/.test(briefingHtml) ||
    briefingHtml.includes('The Center Crucible &amp; Rise of'),
    'Must include chronicle pillar 2'
  );
  assert.ok(briefingHtml.includes('The Wrath of the Ashen Seraph'), 'Must include chronicle pillar 3');

  // Beta telemetry, Tomb-Ship Equilibrium Gauge, & muster protocol
  const normBriefingHtml = briefingHtml.replace(/\s+/g, ' ');
  assert.ok(normBriefingHtml.includes('Awakening of the Undying Dynasty'), 'Must include Awakening of the Undying Dynasty heading');
  assert.ok(normBriefingHtml.includes('Sector Node 0 Hegemony Lead (2 / 8 HP) &amp; Marauders +1 SPt'), 'Must include Beta Hegemony lead & Marauders +1 SPt telemetry');
  assert.ok(normBriefingHtml.includes('Roaming Star-God &amp; Orbiting Auditors'), 'Must include Roaming Star-God & Orbiting Auditors telemetry');
  assert.ok(
    normBriefingHtml.includes('Mirror-Image Tomb-Ship Terminal &amp; Psychic Bleed'),
    'Must include Mirror-Image Tomb-Ship Terminal & Psychic Bleed telemetry'
  );
  assert.ok(
    normBriefingHtml.includes('SHIP.md Part 2 // Tomb-Ship Engram &amp; Tesseract Equilibrium (-3 to +3)'),
    'Must include SHIP.md Part 2 // Tomb-Ship Engram & Tesseract Equilibrium (-3 to +3) heading'
  );
  assert.ok(
    normBriefingHtml.includes('id="betaNode-1" class="slider-node active-brig"'),
    'Must include betaNode-1 active-brig slider node'
  );
  assert.ok(
    normBriefingHtml.includes('-1 // Crimson Harvest Ascendant (★ TIER I: TESSERACT OVERCLOCK ★)'),
    'Must include Beta -1 // Crimson Harvest Ascendant detail title'
  );
  assert.ok(
    normBriefingHtml.includes('Tomb-Ship 7-State Breakdown &amp; Phase Reckoning Table (If 3rd Force Wins Phase)'),
    'Must include Beta Tomb-Ship 7-State Breakdown & Phase Reckoning Table'
  );
  assert.ok(
    normBriefingHtml.includes('our Tomb-Ship has risen openly into low equatorial orbit above the clearing') &&
    normBriefingHtml.includes('Quantum Shields drink the feeble targeting sweeps'),
    'Must include open orbital arrival and Quantum Shields in Beta Part 1 opening paragraph'
  );
  assert.ok(
    normBriefingHtml.includes('Knowing his defense lasers cannot pierce our Quantum Shielding'),
    'Must include Quantum Shielding parley rationale in Beta Part 1 closing paragraph'
  );
  assert.ok(
    normBriefingHtml.includes('Open-Frequency Orbital Parley (Geostationary Zenith-09)'),
    'Must include Open-Frequency Orbital Parley (Geostationary Zenith-09) in Beta Part 2'
  );
  assert.ok(
    normBriefingHtml.includes('Auditor: Logis-Prefect Vane • Ordo Xenos / Tactica Logis Cold Parley'),
    'Must include Ordo Xenos / Tactica Logis Cold Parley subheader in Beta Part 2'
  );
  assert.ok(
    normBriefingHtml.includes('Quantum-Shielded Necron capital hull is an exercise in wasted promethium') &&
    normBriefingHtml.includes('Consider this a formal Ordo Xenos and Tactica Logis parley, Regent of the Tomb.'),
    'Must include Vane Ordo Xenos and Tactica Logis parley quote in Beta Part 2'
  );
  assert.ok(
    normBriefingHtml.includes('Phase 1 Tomb-Ship Muster &amp; Dynastic Registration Protocol'),
    'Must include Phase 1 Tomb-Ship Muster & Dynastic Registration Protocol'
  );
});

test('briefing: #dossierBeta, #btnBeta, and body.necron-briefing-active include Necron Noctolith, Cartouche, Ankh & Gauss Emerald styling', () => {
  assert.ok(briefingHtml.includes('body.necron-briefing-active'), 'Must style body.necron-briefing-active for full-page Tomb-Ship atmosphere');
  assert.ok(briefingHtml.includes('@keyframes necronGaussPulse'), 'Must define @keyframes necronGaussPulse animation');
  assert.ok(briefingHtml.includes('.necron-ankh-divider'), 'Must define .necron-ankh-divider Royal Cartouche ornament');
  assert.ok(briefingHtml.includes('#btnBeta.active'), 'Must style #btnBeta.active with Necron Gauss Emerald theme');
  assert.ok(briefingHtml.includes('#dossierBeta .hero-card'), 'Must style #dossierBeta .hero-card with Noctolith Obsidian & Gauss Emerald');
  assert.ok(briefingHtml.includes('#dossierBeta .hero-title'), 'Must style #dossierBeta .hero-title with Living Metal & Gauss Emerald gradient');
  assert.ok(briefingHtml.includes('#gateBeta .unlock-btn'), 'Must style #gateBeta .unlock-btn with Royal Engram emerald button');
  assert.ok(briefingHtml.includes('#dossierBeta .slider-node.active-brig'), 'Must style #dossierBeta .slider-node.active-brig with Gauss Overclock glow');
  assert.ok(briefingHtml.includes('#dossierBeta table.reckoning-table th'), 'Must style #dossierBeta reckoning table headers with Tomb-Ship aesthetic');
  assert.ok(briefingHtml.includes('#dossierBeta tr.highlight-row'), 'Must style #dossierBeta highlight-row with Gauss Emerald highlight');
  assert.ok(briefingHtml.includes('#dossierBeta code'), 'Must style #dossierBeta code as Engrammatic Hex-Glyph chips');
});





````

---

## File: `tests/ui/pvp.test.js` <a id="file-testsuipvptestjs"></a>

````javascript
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '../../');
const PVP_HTML_PATH = path.join(ROOT_DIR, 'pages/pvp.html');

// Read pvp.html and extract script block
const pvpHtml = fs.readFileSync(PVP_HTML_PATH, 'utf8');
const scriptMatches = pvpHtml.match(/<script>([\s\S]*?)<\/script>/);
assert.ok(scriptMatches && scriptMatches[1], 'Must locate script tag inside pages/pvp.html');
const pvpScriptCode = scriptMatches[1];

// Set up mock DOM and localStorage environment
const storageStore = new Map();
globalThis.localStorage = {
  getItem: (k) => (storageStore.has(k) ? storageStore.get(k) : null),
  setItem: (k, v) => storageStore.set(k, String(v)),
  removeItem: (k) => storageStore.delete(k),
  clear: () => storageStore.clear()
};

const mockElements = {
  hellscapeSelect: { value: '0' },
  hellscapeDesc: { innerHTML: '', innerText: '' },
  warpIntensity: { value: 'major' },
  anomalyResultBox: { innerHTML: '' },
  vultureKillCheck: { checked: false },
  vulturePts: { innerText: '3 SPts', textContent: '3 SPts' },
  pvpReportSpBadge: { textContent: '3 SPts' },
  unboundResult: { innerHTML: '' },
  pvpReportChannel: { value: 'alpha' },
  pvpReportNotes: { value: '' },
  pvpVulturePreviewBox: { textContent: '' }
};

globalThis.document = {
  getElementById: (id) => mockElements[id] || null
};

let transmittedChannel = null;
let transmittedPayload = null;
let warpSirenPlayed = 0;
let auspexLockPlayed = 0;

globalThis.window = {
  VoxAudio: {
    playWarpSiren: () => { warpSirenPlayed++; },
    playAuspexLock: () => { auspexLockPlayed++; },
    transmitToVox: (chan, payload) => {
      transmittedChannel = chan;
      transmittedPayload = payload;
    }
  }
};

// Evaluate script in mock environment
const fn = new Function('document', 'localStorage', 'console', 'window', `${pvpScriptCode}; return {
  HELLSCAPES,
  HELLSCAPE_NAMES,
  ANOMALIES,
  UNBOUND_UNITS,
  STORAGE_KEY_PVP,
  savePvpState,
  restorePvpState,
  renderHellscape,
  rollRandomHellscape,
  rollWarpAnomaly,
  updateVulture,
  rollUnboundAdversary,
  transmitUnboundPing,
  compilePvpVultureReport: (typeof compilePvpVultureReport !== 'undefined' ? compilePvpVultureReport : undefined),
  buildPvpVultureReportString,
  updatePvpVulturePreview,
  transmitPvpVultureReport,
  resetPvpVultureReportForm: (typeof resetPvpVultureReportForm !== 'undefined' ? resetPvpVultureReportForm : undefined)
};`);

const pvp = fn(globalThis.document, globalThis.localStorage, console, globalThis.window);

test('pvp: HELLSCAPES, ANOMALIES, and UNBOUND_UNITS contain valid crusade content', () => {
  assert.equal(pvp.HELLSCAPES.length, 6, 'Must define 6 Hellscape environments');
  assert.equal(pvp.HELLSCAPE_NAMES.length, 6, 'Must define 6 Hellscape names');
  assert.equal(pvp.ANOMALIES.length, 6, 'Must define 6 Warp Anomalies');
  assert.equal(pvp.UNBOUND_UNITS.length, 4, 'Must define 4 Unbound Adversary power levels');
  assert.ok(pvp.UNBOUND_UNITS[3].includes('CLASSIFIED APEX ANOMALY'), 'PL 4 must reference Classified Apex Anomaly');

  pvp.HELLSCAPES.forEach((h, idx) => {
    assert.equal(typeof h, 'string');
    assert.ok(h.includes('<strong>'), `Hellscape ${idx} must include bold rule title`);
  });
});

test('pvp: renderHellscape updates description and saves state to localStorage', () => {
  mockElements.hellscapeSelect.value = '2';
  pvp.renderHellscape(true);

  assert.equal(mockElements.hellscapeDesc.innerHTML, pvp.HELLSCAPES[2]);

  const raw = localStorage.getItem(pvp.STORAGE_KEY_PVP);
  assert.ok(raw);
  const parsed = JSON.parse(raw);
  assert.equal(parsed.hellscapeIdx, 2);
});

test('pvp: updateVulture calculates 3 SPts base or 4 SPts with player kill bonus and updates Vulture report preview', () => {
  mockElements.vultureKillCheck.checked = false;
  pvp.updateVulture(true);
  assert.equal(mockElements.vulturePts.innerText, '3 SPts');
  assert.equal(mockElements.pvpReportSpBadge.textContent, '3 SPts');
  assert.ok(mockElements.pvpVulturePreviewBox.textContent.includes('3 SPts'));

  mockElements.vultureKillCheck.checked = true;
  pvp.updateVulture(true);
  assert.equal(mockElements.vulturePts.innerText, '4 SPts');
  assert.equal(mockElements.pvpReportSpBadge.textContent, '4 SPts');
  assert.ok(mockElements.pvpVulturePreviewBox.textContent.includes('4 SPts'));

  const raw = localStorage.getItem(pvp.STORAGE_KEY_PVP);
  const parsed = JSON.parse(raw);
  assert.equal(parsed.vultureKilled, true);
});

test('pvp: rollWarpAnomaly triggers surges based on intensity thresholds', () => {
  mockElements.warpIntensity.value = 'major';
  pvp.rollWarpAnomaly();

  assert.ok(mockElements.anomalyResultBox.innerHTML.includes('Rolled'));

  const raw = localStorage.getItem(pvp.STORAGE_KEY_PVP);
  const parsed = JSON.parse(raw);
  assert.ok(parsed.anomalyHtml.includes('Rolled'));
});

test('pvp: rollUnboundAdversary picks an unbound unit, triggers SFX, renders ping buttons, and persists output', () => {
  warpSirenPlayed = 0;
  auspexLockPlayed = 0;

  pvp.rollUnboundAdversary();

  assert.ok(mockElements.unboundResult.innerHTML.includes('Power Level'));
  assert.ok(mockElements.unboundResult.innerHTML.includes('transmitUnboundPing'), 'Must include Vox ping button callbacks');
  assert.ok(mockElements.unboundResult.innerHTML.includes('text-align:center'), 'Ping banner must feature centered text alignment');
  assert.ok(mockElements.unboundResult.innerHTML.includes('justify-content:center'), 'Ping action buttons must be centered');
  assert.equal(warpSirenPlayed + auspexLockPlayed > 0, true, 'Must trigger either warp siren or auspex lock SFX');

  const raw = localStorage.getItem(pvp.STORAGE_KEY_PVP);
  const parsed = JSON.parse(raw);
  assert.ok(parsed.unboundHtml.includes('Power Level'));
});

test('pvp: transmitUnboundPing formats emergency apex payload for PL 4 and standard payload for PL 1-3', () => {
  transmittedChannel = null;
  transmittedPayload = null;
  mockElements.warpIntensity.value = 'catastrophic';

  // PL 4 Apex Anomaly Ping
  pvp.transmitUnboundPing(4, 'alpha');
  assert.equal(transmittedChannel, 'alpha');
  assert.ok(transmittedPayload.includes('EMERGENCY AUSPEX PING: POWER LEVEL 4 APEX ANOMALY DETECTED'));
  assert.ok(transmittedPayload.includes('Warp Intensity: CATASTROPHIC'));
  assert.ok(transmittedPayload.includes('Contextual 3-Tier PL 4 Manifestation Roll'));

  // PL 2 Standard Ping
  transmittedChannel = null;
  transmittedPayload = null;
  pvp.transmitUnboundPing(2, 'beta');
  assert.equal(transmittedChannel, 'beta');
  assert.ok(transmittedPayload.includes('AUSPEX PING: POWER LEVEL 2 UNBOUND ADVERSARY DETECTED'));
  assert.ok(transmittedPayload.includes('roll/select our Power Level 2 Unbound Adversary'));
});

test('pvp: buildPvpVultureReportString and transmitPvpVultureReport compile and send Campaign Master 3rd Alliance SPts report separately from Unbound Adversary roller', () => {
  assert.ok(
    pvpHtml.includes('transmitPvpVultureReport()'),
    'pages/pvp.html must include a dedicated button calling transmitPvpVultureReport()'
  );
  assert.ok(
    pvpHtml.includes('rollUnboundAdversary()') && pvpHtml.includes('transmitUnboundPing('),
    'pages/pvp.html must keep rollUnboundAdversary() and transmitUnboundPing() separate'
  );

  // Case 1: Base 3 SPts (no unit destroyed), Alpha channel
  mockElements.hellscapeSelect.value = '4';
  mockElements.warpIntensity.value = 'catastrophic';
  mockElements.vultureKillCheck.checked = false;
  mockElements.pvpReportChannel.value = 'alpha';
  mockElements.pvpReportNotes.value = 'Unbound Daemons contested the central siphon.';

  pvp.updatePvpVulturePreview();
  const report3 = pvp.buildPvpVultureReportString();

  assert.equal(mockElements.pvpVulturePreviewBox.textContent, report3);
  assert.ok(report3.includes('+++ 1V1 ASH WASTES // 3RD ALLIANCE VULTURE SPTS REPORT +++'));
  assert.ok(report3.includes('THE EXILE // SANCTUARY OF ASH'));
  assert.ok(report3.includes('CAMPAIGN MASTER (3RD ALLIANCE) VULTURED SPTS: 3 SPts'));
  assert.ok(report3.includes('Base Vulture Presence (+3 SPts) [No Player Unit Destroyed] = 3 SPts'));
  assert.ok(report3.includes('Gravitic Nexus // Intensity: CATASTROPHIC'));
  assert.ok(report3.includes('Unbound Daemons contested the central siphon.'));

  transmittedChannel = null;
  transmittedPayload = null;
  pvp.transmitPvpVultureReport();
  assert.equal(transmittedChannel, 'alpha');
  assert.equal(transmittedPayload, report3);

  // Case 2: 4 SPts (Destroyed a Player Unit checked), Beta channel
  mockElements.vultureKillCheck.checked = true;
  mockElements.pvpReportChannel.value = 'beta';
  pvp.updatePvpVulturePreview();
  const report4 = pvp.buildPvpVultureReportString();

  assert.ok(report4.includes('LORD COMMANDER JUNEBUG'));
  assert.ok(report4.includes('CAMPAIGN MASTER (3RD ALLIANCE) VULTURED SPTS: 4 SPts'));
  assert.ok(report4.includes('Destroyed a Player Unit (+1 SPt) = 4 SPts'));

  transmittedChannel = null;
  transmittedPayload = null;
  pvp.transmitPvpVultureReport();
  assert.equal(transmittedChannel, 'beta');
  assert.equal(transmittedPayload, report4);
});

test('pvp: savePvpState ignores save when hellscapeSelect element is absent', () => {
  storageStore.clear();
  storageStore.set(pvp.STORAGE_KEY_PVP, JSON.stringify({ hellscapeIdx: 4, custom: true }));

  const origSelect = mockElements.hellscapeSelect;
  delete mockElements.hellscapeSelect;

  pvp.savePvpState();

  const after = JSON.parse(localStorage.getItem(pvp.STORAGE_KEY_PVP));
  assert.equal(after.custom, true, 'Must not overwrite stored state when hellscapeSelect is missing from DOM');

  // Restore mock
  mockElements.hellscapeSelect = origSelect;
});

test('pvp: restorePvpState faithfully reconstructs UI state and Vulture report fields from localStorage', () => {
  localStorage.setItem(pvp.STORAGE_KEY_PVP, JSON.stringify({
    hellscapeIdx: 5,
    warpIntensity: 'minor',
    anomalyHtml: '<span class="test-surge">Warp Fluke</span>',
    vultureKilled: true,
    unboundHtml: '<p>Daemonic Beast</p>',
    reportChannel: 'beta',
    reportNotes: 'Marauders claimed 4 SPts in Sector 5.'
  }));

  pvp.restorePvpState();

  assert.equal(String(mockElements.hellscapeSelect.value), '5');
  assert.equal(mockElements.warpIntensity.value, 'minor');
  assert.equal(mockElements.anomalyResultBox.innerHTML, '<span class="test-surge">Warp Fluke</span>');
  assert.equal(mockElements.vultureKillCheck.checked, true);
  assert.equal(mockElements.vulturePts.innerText, '4 SPts');
  assert.equal(mockElements.unboundResult.innerHTML, '<p>Daemonic Beast</p>');
  assert.equal(mockElements.pvpReportChannel.value, 'beta');
  assert.equal(mockElements.pvpReportNotes.value, 'Marauders claimed 4 SPts in Sector 5.');
  assert.ok(mockElements.pvpVulturePreviewBox.textContent.includes('4 SPts'));
});

test('pvp: resetPvpVultureReportForm resets Vulture SPts report fields, kill checkbox, and preview to clean defaults', () => {
  assert.ok(
    pvpHtml.includes('resetPvpVultureReportForm()'),
    'pages/pvp.html must include a button calling resetPvpVultureReportForm()'
  );
  assert.equal(typeof pvp.resetPvpVultureReportForm, 'function', 'resetPvpVultureReportForm must be defined');

  mockElements.pvpReportChannel.value = 'beta';
  mockElements.vultureKillCheck.checked = true;
  mockElements.pvpReportNotes.value = 'Custom vulture notes.';
  pvp.updateVulture(true);

  pvp.resetPvpVultureReportForm();

  assert.equal(mockElements.pvpReportChannel.value, 'alpha');
  assert.equal(mockElements.vultureKillCheck.checked, false);
  assert.equal(mockElements.pvpReportNotes.value, '');
  assert.equal(mockElements.vulturePts.innerText, '3 SPts');
  assert.equal(mockElements.pvpReportSpBadge.textContent, '3 SPts');
  assert.ok(mockElements.pvpVulturePreviewBox.textContent.includes('THE EXILE // SANCTUARY OF ASH'));
  assert.ok(mockElements.pvpVulturePreviewBox.textContent.includes('3 SPts'));
  assert.equal(mockElements.pvpVulturePreviewBox.textContent.includes('Custom vulture notes.'), false);
});

test('pvp: compilePvpVultureReport pure functional core formats Vulture SPts report from plain data without DOM dependency', () => {
  assert.equal(typeof pvp.compilePvpVultureReport, 'function', 'Must define pure compilePvpVultureReport function');
  const out = pvp.compilePvpVultureReport({
    channel: 'beta',
    killedUnit: true,
    hellscapeIdx: 2,
    warpIntensity: 'minor',
    notes: 'Scavengers looted the ridge.'
  });
  assert.ok(out.includes('LORD COMMANDER JUNEBUG'));
  assert.ok(out.includes('4 SPts'));
  assert.ok(out.includes('Fading Reality // Intensity: MINOR'));
  assert.ok(out.includes('Scavengers looted the ridge.'));
});
````

---

## File: `tests/ui/rogue.test.js` <a id="file-testsuiroguetestjs"></a>

````javascript
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '../../');
const ROGUE_HTML_PATH = path.join(ROOT_DIR, 'pages/rogue.html');

// Read rogue.html and extract script block
const rogueHtml = fs.readFileSync(ROGUE_HTML_PATH, 'utf8');
const scriptMatches = rogueHtml.match(/<script>([\s\S]*?)<\/script>/);
assert.ok(scriptMatches && scriptMatches[1], 'Must locate script tag inside pages/rogue.html');
const rogueScriptCode = scriptMatches[1];

// Set up mock DOM and localStorage environment
const storageStore = new Map();
globalThis.localStorage = {
  getItem: (k) => (storageStore.has(k) ? storageStore.get(k) : null),
  setItem: (k, v) => storageStore.set(k, String(v)),
  removeItem: (k) => storageStore.delete(k),
  clear: () => storageStore.clear()
};

function createMockAiStep() {
  const span = { innerText: '' };
  return {
    classList: {
      classes: new Set(),
      toggle(cls, cond) {
        if (cond) this.classes.add(cls);
        else this.classes.delete(cls);
      },
      contains(cls) { return this.classes.has(cls); }
    },
    querySelector: (sel) => (sel.includes('span:last-child') ? span : null),
    span
  };
}

let transmittedChannel = null;
let transmittedPayload = null;

globalThis.window = {
  addEventListener: () => {},
  removeEventListener: () => {},
  VoxAudio: {
    transmitToVox: (chan, payload) => {
      transmittedChannel = chan;
      transmittedPayload = payload;
    }
  }
};

const mockElements = {
  aiStep0: createMockAiStep(),
  aiStep1: createMockAiStep(),
  aiStep2: createMockAiStep(),
  rogueReportChannel: { value: 'alpha' },
  rogueCombatants: { value: 'Imperium (144th Krieg) vs Chaos (World Eaters)' },
  rogueOutcome: { value: 'Imperium Victory' },
  rogueNemesisNominee: { value: 'Vorgh the Flayed' },
  rogueNotes: { value: 'Fierce trench defense at Auxiliary Sector 9.' },
  rogueDossierPreviewBox: { textContent: '' }
};

globalThis.document = {
  getElementById: (id) => mockElements[id] || null
};

// Evaluate script in mock environment
const fn = new Function('document', 'localStorage', 'console', 'window', `${rogueScriptCode}; return {
  STORAGE_KEY_ROGUE,
  ROGUE_OUTCOME_IMPACTS: (typeof ROGUE_OUTCOME_IMPACTS !== 'undefined' ? ROGUE_OUTCOME_IMPACTS : undefined),
  getCurrentAiStep: () => currentAiStep,
  setAiStep,
  nextAiStep,
  saveRogueState,
  restoreRogueState,
  compileRogueDossier: (typeof compileRogueDossier !== 'undefined' ? compileRogueDossier : undefined),
  buildRogueDossierString,
  updateRogueDossierPreview,
  transmitRogueDossier,
  resetRogueDossierForm: (typeof resetRogueDossierForm !== 'undefined' ? resetRogueDossierForm : undefined)
};`);

const rogue = fn(globalThis.document, globalThis.localStorage, console, globalThis.window);

test('rogue: setAiStep updates DOM classes, badge text, and persists state', () => {
  rogue.setAiStep(1, true);

  assert.equal(rogue.getCurrentAiStep(), 1);
  assert.equal(mockElements.aiStep1.classList.contains('active-step'), true);
  assert.equal(mockElements.aiStep0.classList.contains('active-step'), false);
  assert.equal(mockElements.aiStep2.classList.contains('active-step'), false);

  assert.equal(mockElements.aiStep1.span.innerText, '[Active]');
  assert.equal(mockElements.aiStep0.span.innerText, '');
  assert.equal(mockElements.aiStep2.span.innerText, '');

  const raw = localStorage.getItem(rogue.STORAGE_KEY_ROGUE);
  assert.ok(raw);
  const parsed = JSON.parse(raw);
  assert.equal(parsed.currentAiStep, 1);
});

test('rogue: nextAiStep cycles predictably through phases 0 -> 1 -> 2 -> 0', () => {
  rogue.setAiStep(0, false);
  assert.equal(rogue.getCurrentAiStep(), 0);

  rogue.nextAiStep();
  assert.equal(rogue.getCurrentAiStep(), 1);

  rogue.nextAiStep();
  assert.equal(rogue.getCurrentAiStep(), 2);

  rogue.nextAiStep();
  assert.equal(rogue.getCurrentAiStep(), 0);
});

test('rogue: saveRogueState ignores save when aiStep0 element is absent', () => {
  storageStore.clear();
  storageStore.set(rogue.STORAGE_KEY_ROGUE, JSON.stringify({ currentAiStep: 2, custom: true }));

  const origStep0 = mockElements.aiStep0;
  delete mockElements.aiStep0;

  rogue.saveRogueState();

  const after = JSON.parse(localStorage.getItem(rogue.STORAGE_KEY_ROGUE));
  assert.equal(after.custom, true, 'Must not overwrite stored state when aiStep0 is missing from DOM');

  // Restore mock
  mockElements.aiStep0 = origStep0;
});

test('rogue: restoreRogueState faithfully restores active phase from localStorage', () => {
  localStorage.setItem(rogue.STORAGE_KEY_ROGUE, JSON.stringify({ currentAiStep: 2 }));

  rogue.restoreRogueState();

  assert.equal(rogue.getCurrentAiStep(), 2);
  assert.equal(mockElements.aiStep2.classList.contains('active-step'), true);
  assert.equal(mockElements.aiStep2.span.innerText, '[Active]');
});

test('rogue: buildRogueDossierString compiles Mode 3 Rogue Sector Battle Dossier with planetary consequences', () => {
  mockElements.rogueReportChannel.value = 'alpha';
  mockElements.rogueCombatants.value = 'Imperium (144th Krieg) vs Chaos (World Eaters)';
  mockElements.rogueOutcome.value = 'Imperium Victory';
  mockElements.rogueNemesisNominee.value = 'Vorgh the Flayed';
  mockElements.rogueNotes.value = 'Fierce trench defense at Auxiliary Sector 9.';

  const str = rogue.buildRogueDossierString();
  assert.ok(str.includes('+++ ROGUE SECTOR AUXILIARY BATTLE REPORT +++'));
  assert.ok(str.includes('THE EXILE // SANCTUARY OF ASH'));
  assert.ok(str.includes('Imperium (144th Krieg) vs Chaos (World Eaters)'));
  assert.ok(str.includes('Imperium Victory'));
  assert.ok(str.includes('PLANETARY SHIFT: Stabilizes sector'));
  assert.ok(str.includes('ALLIANCE HEGEMONY IMPACT: +1 SPt to Gatebreakers'));
  assert.ok(str.includes('NEMESIS INDUCTION NOMINEE: Vorgh the Flayed'));
  assert.ok(str.includes('Fierce trench defense at Auxiliary Sector 9.'));
});

test('rogue: transmitRogueDossier triggers window.VoxAudio.transmitToVox with compiled payload', () => {
  transmittedChannel = null;
  transmittedPayload = null;
  mockElements.rogueReportChannel.value = 'beta';

  rogue.transmitRogueDossier();
  assert.equal(transmittedChannel, 'beta');
  assert.ok(transmittedPayload.includes('ROGUE SECTOR AUXILIARY BATTLE REPORT'));
  assert.ok(transmittedPayload.includes('LORD COMMANDER JUNEBUG'));
});

test('rogue: saveRogueState and restoreRogueState preserve and restore Rogue Dossier form fields', () => {
  mockElements.rogueCombatants.value = 'Custom Force Alpha vs Xenos';
  mockElements.rogueOutcome.value = 'Xenos Victory';
  mockElements.rogueNemesisNominee.value = 'Hive Tyrant Apex';
  mockElements.rogueNotes.value = 'Spore mines detonated early.';

  rogue.saveRogueState();
  
  // Wipe inputs
  mockElements.rogueCombatants.value = '';
  mockElements.rogueOutcome.value = '';
  mockElements.rogueNemesisNominee.value = '';
  mockElements.rogueNotes.value = '';

  rogue.restoreRogueState();
  assert.equal(mockElements.rogueCombatants.value, 'Custom Force Alpha vs Xenos');
  assert.equal(mockElements.rogueOutcome.value, 'Xenos Victory');
  assert.equal(mockElements.rogueNemesisNominee.value, 'Hive Tyrant Apex');
  assert.equal(mockElements.rogueNotes.value, 'Spore mines detonated early.');
});

test('rogue: resetRogueDossierForm resets all Rogue Sector report form fields and preview to clean defaults', () => {
  assert.ok(
    rogueHtml.includes('resetRogueDossierForm()'),
    'pages/rogue.html must include a button calling resetRogueDossierForm()'
  );
  assert.equal(typeof rogue.resetRogueDossierForm, 'function', 'resetRogueDossierForm must be defined');

  mockElements.rogueReportChannel.value = 'beta';
  mockElements.rogueCombatants.value = 'Orks vs Tyranids';
  mockElements.rogueOutcome.value = 'Xenos Victory';
  mockElements.rogueNemesisNominee.value = 'Gorgutz';
  mockElements.rogueNotes.value = 'Custom battle notes.';

  rogue.resetRogueDossierForm();

  assert.equal(mockElements.rogueReportChannel.value, 'alpha');
  assert.equal(mockElements.rogueCombatants.value, '');
  assert.equal(mockElements.rogueOutcome.value, 'Imperium Victory');
  assert.equal(mockElements.rogueNemesisNominee.value, '');
  assert.equal(mockElements.rogueNotes.value, '');
  assert.ok(mockElements.rogueDossierPreviewBox.textContent.includes('THE EXILE // SANCTUARY OF ASH'));
  assert.ok(mockElements.rogueDossierPreviewBox.textContent.includes('Auxiliary Forces (Unspecified Factions)'));
  assert.equal(mockElements.rogueDossierPreviewBox.textContent.includes('Gorgutz'), false);
});

test('rogue: compileRogueDossier pure functional core formats dossier from plain data and ROGUE_OUTCOME_IMPACTS lookup table without DOM dependency', () => {
  assert.ok(rogue.ROGUE_OUTCOME_IMPACTS, 'Must define declarative ROGUE_OUTCOME_IMPACTS lookup table');
  assert.equal(typeof rogue.compileRogueDossier, 'function', 'Must define pure compileRogueDossier function');

  const out = rogue.compileRogueDossier({
    channel: 'beta',
    combatants: 'Necrons vs World Eaters',
    outcome: 'Chaos Victory',
    nominee: '',
    notes: 'Blood rain flooded the valley.'
  });
  assert.ok(out.includes('• REPORTING COMMANDER: LORD COMMANDER JUNEBUG'));
  assert.ok(out.includes('• ALLIANCE HEGEMONY IMPACT: +1 SPt to Desecrators'));
  assert.equal(out.includes('NEMESIS INDUCTION NOMINEE'), false);
});

````

---

## File: `tests/ui/roster.test.js` <a id="file-testsuirostertestjs"></a>

````javascript
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '../../');
const ROSTER_HTML_PATH = path.join(ROOT_DIR, 'pages/roster.html');
const DATA_JS_PATH = path.join(ROOT_DIR, 'js/data.js');

// Load HORDE_FACTIONS and HORDE_FACTION_SPAWN_TABLES from js/data.js
const dataJsCode = fs.readFileSync(DATA_JS_PATH, 'utf8');
const dataFn = new Function(`${dataJsCode}; return { HORDE_FACTIONS, HORDE_FACTION_SPAWN_TABLES };`);
const { HORDE_FACTIONS, HORDE_FACTION_SPAWN_TABLES } = dataFn();

// Read roster.html and extract script block
const rosterHtml = fs.readFileSync(ROSTER_HTML_PATH, 'utf8');
const scriptMatches = rosterHtml.match(/<script>([\s\S]*?)<\/script>/);
assert.ok(scriptMatches && scriptMatches[1], 'Must locate script tag inside pages/roster.html');
const rosterScriptCode = scriptMatches[1];

// Set up mock DOM and localStorage environment
const storageStore = new Map();
const mockLocalStorage = {
  getItem: (k) => (storageStore.has(k) ? storageStore.get(k) : null),
  setItem: (k, v) => storageStore.set(k, String(v)),
  removeItem: (k) => storageStore.delete(k),
  clear: () => storageStore.clear()
};

function createMockClassList() {
  const classes = new Set();
  return {
    add: (c) => classes.add(c),
    remove: (c) => classes.delete(c),
    toggle: (c, force) => {
      if (force === undefined) {
        if (classes.has(c)) classes.delete(c);
        else classes.add(c);
      } else if (force) {
        classes.add(c);
      } else {
        classes.delete(c);
      }
    },
    contains: (c) => classes.has(c)
  };
}

const mockElements = {
  rosTabNemesis: { classList: createMockClassList() },
  rosTabUnbound: { classList: createMockClassList() },
  rosTabBrackets: { classList: createMockClassList() },
  rosTabBtn1: { classList: createMockClassList() },
  rosTabBtn2: { classList: createMockClassList() },
  rosTabBtn3: { classList: createMockClassList() },
  nemStatus1: { value: 'roaming' },
  nemStatus2: { value: 'roaming' },
  nemStatus3: { value: 'roaming' },
  toggleAllNemBtn: { textContent: '▴ Collapse All' },
  nemReportChannel: { value: 'alpha' },
  nemReportSector: { value: 'Mode 1: Horde Breach // Node 0 (Golgotha Arbor-Basin)' },
  nemReportUnit: { value: 'Tyranids — Screamer-Killer' },
  nemReportFeat: { value: 'Slain a Player Warlord / Character in combat' },
  nemReportNotes: { value: 'Survived two Vanquisher shots and wiped Krieg squad.' },
  nemDossierPreview: { textContent: '' },
  rosterPool34: { value: '10 Hormagaunts, 10 Termagants' },
  rosterPool56: { value: '10 Genestealers, 5 Chaos Terminators' },
  rosterPool79: { value: '1 Screamer-Killer, 1 Trygon' },
  rosterPool10: { value: '1 Norn Emissary, 1 Hive Tyrant' },
  rosterPool13: { value: '1 Hierophant Bio-Titan' },
  shelfSaveNotice: { classList: createMockClassList() },
  cloudSyncBadge: { textContent: '' },
  bracketFactionPicker: { value: 'Space Marines', innerHTML: '' },
  factionBracketDisplay: { innerHTML: '' },
  ttsUnitTypesBox: { innerHTML: '' },
  ttsUnitCount: { textContent: '' },
  ttsFactionName: { textContent: '' },
  ttsCopyNotice: { classList: createMockClassList() }
};

const mockNemesisCards = [{ open: true }, { open: true }, { open: true }];

const mockDocument = {
  getElementById: (id) => mockElements[id] || null,
  querySelectorAll: (sel) => (sel.includes('details.nemesis-card') ? mockNemesisCards : [])
};

let transmittedChannel = null;
let transmittedPayload = null;
let cloudSyncChimesPlayed = 0;

const mockWindow = {
  addEventListener: () => {},
  VoxAudio: {
    playCloudSyncChime: () => {
      cloudSyncChimesPlayed++;
    },
    transmitToVox: (chan, payload) => {
      transmittedChannel = chan;
      transmittedPayload = payload;
    }
  }
};

let enableCloudMock = false;
let lastFetchUrl = null;
let lastFetchBody = null;

const mockFetch = async (url, options = {}) => {
  lastFetchUrl = url;
  lastFetchBody = options.body ? JSON.parse(options.body) : null;

  if (!enableCloudMock) {
    return { ok: false };
  }

  if (url.includes('save_shared_spawn_pools')) {
    return {
      ok: true,
      json: async () => ({ ok: true })
    };
  }

  if (url.includes('get_shared_spawn_pools')) {
    return {
      ok: true,
      json: async () => ({
        ok: true,
        horde_pool: {
          b34: 'Cloud Gaunts 20',
          b56: 'Cloud Warriors 5',
          b79: 'Cloud Carnifex 2',
          b10: 'Cloud Tyrant 1',
          b13: 'Cloud Titan 1'
        },
        nemesis_status: {
          nem1: 'deployed',
          nem2: 'slain'
        }
      })
    };
  }

  return { ok: false };
};

// Evaluate script in mock environment
const evalFn = new Function(
  'document',
  'window',
  'localStorage',
  'HORDE_FACTIONS',
  'HORDE_FACTION_SPAWN_TABLES',
  'console',
  'fetch',
  `${rosterScriptCode}; return {
    ROSTER_STATE_KEY,
    CUSTOM_POOL_STORAGE_KEY,
    HORDE_FACTION_SPAWN_TABLES: (typeof HORDE_FACTION_SPAWN_TABLES !== 'undefined' ? HORDE_FACTION_SPAWN_TABLES : (window && window.HORDE_FACTION_SPAWN_TABLES)),
    switchRosterTab,
    buildNemesisDossierString,
    updateNemesisPreview,
    transmitNemesisDossier,
    saveShelfBarracks,
    syncPoolsToSupabaseCloud,
    pullSharedPoolsFromCloud,
    renderFactionBracketTable,
    saveRosterPageState,
    initRosterPage,
    getStoredPoolRoot,
    getFactionPoolFromStore,
    loadFactionInputs,
    onFactionPickerChange,
    resetNemesisDossierForm: (typeof resetNemesisDossierForm !== 'undefined' ? resetNemesisDossierForm : undefined),
    compileNemesisDossier: (typeof compileNemesisDossier !== 'undefined' ? compileNemesisDossier : undefined),
    extractUniqueUnitTypes: (typeof extractUniqueUnitTypes !== 'undefined' ? extractUniqueUnitTypes : undefined),
    formatTtsUnitList: (typeof formatTtsUnitList !== 'undefined' ? formatTtsUnitList : undefined),
    renderTtsUnitTypes: (typeof renderTtsUnitTypes !== 'undefined' ? renderTtsUnitTypes : undefined),
    copyTtsUnitTypesList: (typeof copyTtsUnitTypesList !== 'undefined' ? copyTtsUnitTypesList : undefined)
  };`
);

const roster = evalFn(mockDocument, mockWindow, mockLocalStorage, HORDE_FACTIONS, HORDE_FACTION_SPAWN_TABLES, console, mockFetch);

test('roster: runs cleanly in browser global scope alongside data.js without syntax errors and populates preview', () => {
  // Test sequential script execution in shared scope to verify no duplicate declarations
  const runner = new Function(
    'document',
    'window',
    'localStorage',
    'console',
    'fetch',
    `
    ${dataJsCode}
    ${rosterScriptCode}
    return {
      initRosterPage,
      updateNemesisPreview,
      switchRosterTab,
      buildNemesisDossierString
    };
    `
  );
  assert.doesNotThrow(() => {
    const res = runner(mockDocument, mockWindow, mockLocalStorage, console, mockFetch);
    assert.ok(res.switchRosterTab, 'switchRosterTab must be defined');
    res.initRosterPage();
    assert.ok(mockElements.nemDossierPreview.textContent.includes('ORDO MALLEUS'), 'Preview must have text');
  }, 'Must not throw SyntaxError when data.js and roster.html run together');
});

test('roster: HORDE_FACTION_SPAWN_TABLES contains valid threat brackets for factions', () => {
  assert.ok(roster.HORDE_FACTION_SPAWN_TABLES, 'Must define HORDE_FACTION_SPAWN_TABLES');
  const sm = roster.HORDE_FACTION_SPAWN_TABLES['Space Marines'];
  assert.ok(sm, 'Must define Space Marines table');
  assert.ok(Array.isArray(sm.b34) && sm.b34.length > 0, 'Space Marines must have bracket [3-4]');
  assert.ok(Array.isArray(sm.b56) && sm.b56.length > 0, 'Space Marines must have bracket [5-6]');
  assert.ok(Array.isArray(sm.b79) && sm.b79.length > 0, 'Space Marines must have bracket [7-9]');
  assert.ok(Array.isArray(sm.b10) && sm.b10.length > 0, 'Space Marines must have bracket [10+]');
  assert.ok(Array.isArray(sm.b13) && sm.b13.length > 0, 'Space Marines must have bracket [13+]');
});

test('roster: switchRosterTab toggles active tab and DOM visibility classes', () => {
  roster.switchRosterTab('unbound', false);
  assert.equal(mockElements.rosTabNemesis.classList.contains('hidden'), true);
  assert.equal(mockElements.rosTabUnbound.classList.contains('hidden'), false);
  assert.equal(mockElements.rosTabBrackets.classList.contains('hidden'), true);
  assert.equal(mockElements.rosTabBtn2.classList.contains('active'), true);
  assert.equal(mockElements.rosTabBtn1.classList.contains('active'), false);

  roster.switchRosterTab('brackets', false);
  assert.equal(mockElements.rosTabBrackets.classList.contains('hidden'), false);
  assert.equal(mockElements.rosTabBtn3.classList.contains('active'), true);

  roster.switchRosterTab('nemesis', false);
  assert.equal(mockElements.rosTabNemesis.classList.contains('hidden'), false);
  assert.equal(mockElements.rosTabBtn1.classList.contains('active'), true);
});

test('roster: buildNemesisDossierString formats Nemesis Induction Dossier for Campaign Master', () => {
  mockElements.nemReportChannel.value = 'alpha';
  mockElements.nemReportUnit.value = 'Tyranids — Screamer-Killer';
  mockElements.nemReportNotes.value = 'Survived two Vanquisher shots on 1 Wound and slaughtered Death Riders.';

  const str = roster.buildNemesisDossierString();
  assert.ok(str.includes('+++ ORDO MALLEUS // NEW NEMESIS INDUCTION DOSSIER +++'));
  assert.ok(str.includes('• FILING COMMANDER: THE EXILE // SANCTUARY OF ASH'));
  assert.ok(str.includes('• HOSTILE DATASHEET / FACTION: Tyranids — Screamer-Killer'));
  assert.ok(str.includes('slaughtered Death Riders'));

  mockElements.nemReportChannel.value = 'beta';
  const strBeta = roster.buildNemesisDossierString();
  assert.ok(strBeta.includes('• FILING COMMANDER: LORD COMMANDER JUNEBUG'));
});

test('roster: updateNemesisPreview populates preview box and saves state', () => {
  roster.updateNemesisPreview();
  assert.ok(mockElements.nemDossierPreview.textContent.includes('ORDO MALLEUS'));

  const rawState = mockLocalStorage.getItem(roster.ROSTER_STATE_KEY);
  assert.ok(rawState, 'Must persist roster state to localStorage');
  const state = JSON.parse(rawState);
  assert.equal(state.nemReportUnit, 'Tyranids — Screamer-Killer');
});

test('roster: transmitNemesisDossier triggers window.VoxAudio.transmitToVox with compiled payload', () => {
  transmittedChannel = null;
  transmittedPayload = null;
  mockElements.nemReportChannel.value = 'beta';

  roster.transmitNemesisDossier();
  assert.equal(transmittedChannel, 'beta');
  assert.ok(transmittedPayload.includes('LORD COMMANDER JUNEBUG'));
  assert.ok(transmittedPayload.includes('ORDO MALLEUS'));
});

test('roster: saveShelfBarracks persists custom pool to localStorage', () => {
  mockElements.rosterPool34.value = '20 Termagants';
  mockElements.rosterPool56.value = '5 Tyranid Warriors';
  mockElements.rosterPool79.value = '1 Maleceptor';
  mockElements.rosterPool10.value = '1 Tyrannofex';
  mockElements.rosterPool13.value = '1 Hierophant Bio-Titan';

  cloudSyncChimesPlayed = 0;
  roster.saveShelfBarracks();

  assert.equal(cloudSyncChimesPlayed, 1, 'saveShelfBarracks must play cloud sync chime');
  const saved = mockLocalStorage.getItem(roster.CUSTOM_POOL_STORAGE_KEY);
  assert.ok(saved, 'Must persist custom shelf pool to localStorage');
  const pool = JSON.parse(saved);
  assert.equal(pool.b34, '20 Termagants');
  assert.equal(pool.b56, '5 Tyranid Warriors');
  assert.equal(pool.b79, '1 Maleceptor');
  assert.equal(pool.b10, '1 Tyrannofex');
  assert.equal(pool.b13, '1 Hierophant Bio-Titan');
});

test('roster: renderFactionBracketTable displays faction rules and bracket units', () => {
  mockElements.bracketFactionPicker.value = 'Tyranids';
  roster.renderFactionBracketTable();

  assert.ok(mockElements.factionBracketDisplay.innerHTML.includes('Tyranids'));
  assert.ok(mockElements.factionBracketDisplay.innerHTML.includes('Neurons Activated'));
  assert.ok(mockElements.factionBracketDisplay.innerHTML.includes('10 Termagants'));
  assert.ok(mockElements.factionBracketDisplay.innerHTML.includes('Norn Emissary'));
});

test('roster: saveRosterPageState and initRosterPage preserve and restore form and tab state', () => {
  mockLocalStorage.clear();
  mockLocalStorage.setItem(roster.ROSTER_STATE_KEY, JSON.stringify({
    activeRosterTab: 'unbound',
    nemStatus1: 'slain',
    nemStatus2: 'deployed',
    nemReportChannel: 'beta',
    nemReportSector: 'Mode 2: 1v1 PvP // Unbound Adversary',
    nemReportUnit: 'Chaos Lord in Terminator Armour',
    nemReportFeat: 'Slain a Player Warlord / Character in combat',
    nemReportNotes: 'Struck down Commander Alpha in heroic intervention.'
  }));

  mockLocalStorage.setItem(roster.CUSTOM_POOL_STORAGE_KEY, JSON.stringify({
    b34: 'Custom Chaff A, B',
    b56: 'Custom Elites C',
    b79: 'Custom Heavy D',
    b10: 'Custom Super-Heavy E'
  }));

  roster.initRosterPage();

  assert.equal(mockElements.nemStatus1.value, 'slain');
  assert.equal(mockElements.nemStatus2.value, 'deployed');
  assert.equal(mockElements.nemReportChannel.value, 'beta');
  assert.equal(mockElements.nemReportUnit.value, 'Chaos Lord in Terminator Armour');
  assert.equal(mockElements.rosterPool34.value, 'Custom Chaff A, B');
  assert.equal(mockElements.rosterPool10.value, 'Custom Super-Heavy E');
});

test('roster: syncPoolsToSupabaseCloud sends pool payload to Supabase RPC and updates badge', async () => {
  enableCloudMock = true;
  lastFetchUrl = null;
  lastFetchBody = null;

  const testPool = {
    b34: '10 Hormagaunts',
    b56: '5 Terminators',
    b79: '1 Trygon',
    b10: '1 Norn Emissary',
    b13: '1 Bio-Titan'
  };

  const ok = await roster.syncPoolsToSupabaseCloud(testPool);
  assert.equal(ok, true);
  assert.ok(lastFetchUrl.includes('save_shared_spawn_pools'));
  assert.deepEqual(lastFetchBody.p_horde_pool, testPool);
  assert.ok(mockElements.cloudSyncBadge.textContent.includes('Cloud Pool Synced'));

  enableCloudMock = false;
});

test('roster: pullSharedPoolsFromCloud pulls pool and nemesis status from Supabase RPC', async () => {
  enableCloudMock = true;
  lastFetchUrl = null;

  cloudSyncChimesPlayed = 0;
  const ok = await roster.pullSharedPoolsFromCloud();
  assert.equal(ok, true);
  assert.equal(cloudSyncChimesPlayed, 1, 'pullSharedPoolsFromCloud must play cloud sync chime');
  assert.ok(lastFetchUrl.includes('get_shared_spawn_pools'));
  assert.equal(mockElements.rosterPool34.value, 'Cloud Gaunts 20');
  assert.equal(mockElements.rosterPool56.value, 'Cloud Warriors 5');
  assert.equal(mockElements.nemStatus1.value, 'deployed');
  assert.equal(mockElements.nemStatus2.value, 'slain');

  const savedPool = JSON.parse(mockLocalStorage.getItem(roster.CUSTOM_POOL_STORAGE_KEY));
  assert.equal(savedPool.b34, 'Cloud Gaunts 20');

  enableCloudMock = false;
});

test('roster: per-faction shelf pool storage preserves separate pools per faction', () => {
  mockLocalStorage.clear();
  mockElements.bracketFactionPicker.value = 'Tyranids';
  mockElements.rosterPool34.value = '10 Hormagaunts';
  mockElements.rosterPool56.value = '3 Warriors';
  mockElements.rosterPool79.value = '1 Carnifex';
  mockElements.rosterPool10.value = '1 Norn Emissary';
  mockElements.rosterPool13.value = '1 Hierophant';
  roster.saveShelfBarracks();

  // Switch to Orks
  mockElements.bracketFactionPicker.value = 'Orks';
  mockElements.rosterPool34.value = '10 Boyz';
  mockElements.rosterPool56.value = '5 Nobz';
  mockElements.rosterPool79.value = '1 Battlewagon';
  mockElements.rosterPool10.value = '1 Ghazghkull';
  mockElements.rosterPool13.value = '1 Stompa';
  roster.saveShelfBarracks();

  // Verify stored JSON has byFaction
  const root = roster.getStoredPoolRoot();
  assert.ok(root.byFaction);
  assert.equal(root.byFaction['Tyranids'].b34, '10 Hormagaunts');
  assert.equal(root.byFaction['Orks'].b34, '10 Boyz');

  // Switch faction picker back to Tyranids and trigger onFactionPickerChange
  mockElements.bracketFactionPicker.value = 'Tyranids';
  roster.onFactionPickerChange();
  assert.equal(mockElements.rosterPool34.value, '10 Hormagaunts');
  assert.equal(mockElements.rosterPool10.value, '1 Norn Emissary');

  // Switch to an unconfigured faction and verify empty values
  mockElements.bracketFactionPicker.value = 'Necrons';
  roster.onFactionPickerChange();
  assert.equal(mockElements.rosterPool34.value, '');
});

test('roster: Active Nemesis cards are collapsible windows sharing the same design pattern without an Expand All button', () => {
  // Verify Expand/Collapse All button is removed
  assert.ok(!rosterHtml.includes('id="toggleAllNemBtn"'), 'Must not include #toggleAllNemBtn Expand/Collapse All button');
  assert.ok(!rosterHtml.includes('toggleAllNemesisCards'), 'Must not include toggleAllNemesisCards handler');

  // Verify all 3 active nemeses are rendered as collapsible <details> windows
  const detailsMatches = rosterHtml.match(/<details\s+class="datasheet-card nemesis-card"/g) || [];
  assert.equal(detailsMatches.length, 3, 'Must render 3 collapsible <details class="datasheet-card nemesis-card"> windows');

  // Verify all 3 share the unified rule-tag header pattern (NEMESIS #01, NEMESIS #02, NEMESIS #03)
  assert.ok(rosterHtml.includes('NEMESIS #01 • SESSION 0 INDUCTION (PL 4)'), 'Must include NEMESIS #01 rule-tag');
  assert.ok(rosterHtml.includes('NEMESIS #02 • SESSION 0 INDUCTION (PL 3)'), 'Must include NEMESIS #02 rule-tag');
  assert.ok(rosterHtml.includes('NEMESIS #03 • ROGUE SECTOR APEX NEMESIS (PL 4)'), 'Must include NEMESIS #03 rule-tag');

  // Verify all 3 use the unified .locked-status-select dropdown (#nemStatus1, #nemStatus2, #nemStatus3)
  assert.match(rosterHtml, /<select\s+id="nemStatus1"\s+class="locked-status-select"/);
  assert.match(rosterHtml, /<select\s+id="nemStatus2"\s+class="locked-status-select"/);
  assert.match(rosterHtml, /<select\s+id="nemStatus3"\s+class="locked-status-select"/);

  // Verify Nemesis 3: C'tan Shard of the Void Dragon content and placement after Aestred Thurga
  const thurgaIdx = rosterHtml.indexOf('Aestred Thurga');
  const voidDragonIdx = rosterHtml.indexOf("C'tan Shard of the Void Dragon");
  assert.ok(thurgaIdx > -1, 'Must include Aestred Thurga card');
  assert.ok(voidDragonIdx > thurgaIdx, "C'tan Shard of the Void Dragon card must appear after Aestred Thurga's card");

  assert.ok(rosterHtml.includes('"The World-Eater of the Iron-Oxide Wastes"'), 'Must include Void Dragon title');
  assert.ok(rosterHtml.includes('Faction: Xenos / Necrons (Hypercrypt Phalanx)'), 'Must include unified Faction subtitle for Void Dragon');
  assert.ok(rosterHtml.includes('Tesseract Arc-Discharge'), 'Must include Void Dragon Boss Battle Trait');
  assert.ok(rosterHtml.includes('🎯 Bounty Payout: +3 XP to killer unit &amp; +1 Strategic Point'), 'Must include Bounty Payout');
});

test('roster: uses valid Supabase publishable anon key, aligns #cloudSyncBadge with .status-pill, and manual pull populates inputs & shows notice', async () => {
  assert.ok(
    rosterHtml.includes('sb_publishable_R3wXKsK7Gl54-8BNCauUNg_NIoosOOO'),
    'pages/roster.html must configure the valid Supabase publishable key'
  );
  assert.ok(
    !rosterHtml.includes('fc9652398N1BP1126h1-t0h22H2y519a119918b500'),
    'pages/roster.html must not contain the invalid placeholder JWT key'
  );

  // Verify hero header aligns status-pill and cloudSyncBadge on the same centered row without vertical offset
  assert.match(
    rosterHtml,
    /justify-content:\s*center;\s*align-items:\s*center;[^>]*>[\s\S]*?class="status-pill"\s+style="margin:0;"[\s\S]*?id="cloudSyncBadge"/,
    'Hero header must center and align .status-pill (margin:0) and #cloudSyncBadge on the same row'
  );

  // Test manual click on "Pull Latest from Cloud": pullSharedPoolsFromCloud(true)
  enableCloudMock = true;
  mockElements.shelfSaveNotice.classList.add('hidden');
  mockElements.bracketFactionPicker.value = 'Space Marines';

  const ok = await roster.pullSharedPoolsFromCloud(true);
  assert.equal(ok, true);
  assert.equal(
    mockElements.shelfSaveNotice.classList.contains('hidden'),
    false,
    'Manual pullSharedPoolsFromCloud(true) must un-hide #shelfSaveNotice for visual confirmation'
  );
  assert.ok(mockElements.cloudSyncBadge.textContent.includes('Cloud Pool Synced'));
  enableCloudMock = false;
});

test('roster: resetNemesisDossierForm resets all Nemesis Induction Dossier form fields and preview to clean defaults', () => {
  assert.ok(
    rosterHtml.includes('resetNemesisDossierForm()'),
    'pages/roster.html must include a button calling resetNemesisDossierForm()'
  );
  assert.equal(typeof roster.resetNemesisDossierForm, 'function', 'resetNemesisDossierForm must be defined');

  mockElements.nemReportChannel.value = 'beta';
  mockElements.nemReportSector.value = 'Mode 3: Rogue Sector Auxiliary Clash';
  mockElements.nemReportUnit.value = 'World Eaters — Eightbound';
  mockElements.nemReportFeat.value = 'Epic cinematic moment / Unbelievable dice streak';
  mockElements.nemReportNotes.value = 'Custom nemesis combat notes.';

  roster.resetNemesisDossierForm();

  assert.equal(mockElements.nemReportChannel.value, 'alpha');
  assert.equal(mockElements.nemReportSector.value, 'Mode 1: Horde Breach // Node 0 (Golgotha Arbor-Basin)');
  assert.equal(mockElements.nemReportUnit.value, '');
  assert.equal(mockElements.nemReportFeat.value, 'Slain a Player Warlord / Character in combat');
  assert.equal(mockElements.nemReportNotes.value, '');
  assert.ok(mockElements.nemDossierPreview.textContent.includes('THE EXILE // SANCTUARY OF ASH'));
  assert.ok(mockElements.nemDossierPreview.textContent.includes('[Unspecified Hostile Entity]'));
  assert.equal(mockElements.nemDossierPreview.textContent.includes('Eightbound'), false);
});

test('roster: compileNemesisDossier is a pure domain compiler separated from DOM reads (Dumb UI pattern)', () => {
  assert.equal(typeof roster.compileNemesisDossier, 'function', 'compileNemesisDossier must be defined as a pure function');

  const report = roster.compileNemesisDossier({
    channel: 'beta',
    sector: 'Mode 2: 1v1 Ash Wastes // Vulture Raid',
    unit: 'Orks — Deff Dread',
    feat: 'Destroyed a Titanic / Vehicle centerpiece unit',
    notes: 'Ripped a Rogal Dorn tank apart in melee.'
  });

  assert.ok(report.includes('+++ ORDO MALLEUS // NEW NEMESIS INDUCTION DOSSIER +++'));
  assert.ok(report.includes('• FILING COMMANDER: LORD COMMANDER JUNEBUG'));
  assert.ok(report.includes('• THEATRE & MODE: Mode 2: 1v1 Ash Wastes // Vulture Raid'));
  assert.ok(report.includes('• HOSTILE DATASHEET / FACTION: Orks — Deff Dread'));
  assert.ok(report.includes('• TRIGGERING FEAT: Destroyed a Titanic / Vehicle centerpiece unit'));
  assert.ok(report.includes('• EYE-WITNESS COMBAT LOG: "Ripped a Rogal Dorn tank apart in melee."'));
});

test('roster: extractUniqueUnitTypes correctly normalizes and deduplicates unit types from faction tables and custom pools', () => {
  assert.equal(typeof roster.extractUniqueUnitTypes, 'function', 'extractUniqueUnitTypes must be defined as a pure function');

  // Test Space Marines standard table
  const smTable = HORDE_FACTION_SPAWN_TABLES['Space Marines'];
  const smTypes = roster.extractUniqueUnitTypes(smTable);

  assert.ok(Array.isArray(smTypes), 'Must return an array of unit types');
  assert.ok(smTypes.includes('Bladeguard Veterans'), 'Must include Bladeguard Veterans');
  assert.equal(smTypes.includes('Bladeguard'), false, 'Must deduplicate shorthand Bladeguard into Bladeguard Veterans');
  assert.ok(smTypes.includes('Terminator Squad'), 'Must include Terminator Squad');
  assert.equal(smTypes.includes('Terminators'), false, 'Must deduplicate shorthand Terminators into Terminator Squad');
  assert.ok(smTypes.includes('Land Raider Redeemer'), 'Must split compound units like 1 Land Raider Redeemer + 6 Bladeguard');
  assert.ok(smTypes.includes('Captain'), 'Must extract Captain from 5 Terminator Squad + Captain');

  // Test custom shelf pool format (comma-separated strings)
  const customPool = {
    b34: '10 Cadian Shock Troops, 1 Scout Sentinel',
    b56: '1 Rogal Dorn Battle Tank',
    b79: '',
    b10: '1 Baneblade Super-Heavy Tank',
    b13: ''
  };
  const cTypes = roster.extractUniqueUnitTypes(customPool);
  assert.deepEqual(cTypes, [
    'Baneblade Super-Heavy Tank',
    'Cadian Shock Troops',
    'Rogal Dorn Battle Tank',
    'Scout Sentinel'
  ]);

  // Test null / empty
  assert.deepEqual(roster.extractUniqueUnitTypes(null), []);
  assert.deepEqual(roster.extractUniqueUnitTypes({}), []);
});

test('roster: formatTtsUnitList formats copyable Tabletop Simulator preparation checklist', () => {
  assert.equal(typeof roster.formatTtsUnitList, 'function', 'formatTtsUnitList must be defined');

  const formatted = roster.formatTtsUnitList('Space Marines', ['Bladeguard Veterans', 'Land Raider Redeemer']);
  assert.ok(formatted.includes('+++ TABLETOP SIMULATOR (TTS) PREPARATION // SPACE MARINES +++'));
  assert.ok(formatted.includes('Total Unique Unit Types Required: 2'));
  assert.ok(formatted.includes('[ ] Bladeguard Veterans'));
  assert.ok(formatted.includes('[ ] Land Raider Redeemer'));
});

test('roster: renderFactionBracketTable populates TTS unit types preview and count', () => {
  storageStore.clear();
  mockElements.bracketFactionPicker.value = 'Space Marines';
  roster.renderFactionBracketTable();

  assert.equal(mockElements.ttsFactionName.textContent, 'Space Marines');
  assert.ok(parseInt(mockElements.ttsUnitCount.textContent, 10) > 0, 'Must show positive unit count');
  assert.ok(mockElements.ttsUnitTypesBox.innerHTML.includes('Bladeguard Veterans'), 'Must render Bladeguard Veterans pill/tag');
});

test('roster: copyTtsUnitTypesList copies checklist to clipboard and flashes notice', () => {
  assert.ok(rosterHtml.includes('copyTtsUnitTypesList()'), 'pages/roster.html must have button calling copyTtsUnitTypesList()');
  assert.equal(typeof roster.copyTtsUnitTypesList, 'function', 'copyTtsUnitTypesList must be defined');

  let copiedText = null;
  mockWindow.navigator = {
    clipboard: {
      writeText: async (txt) => { copiedText = txt; }
    }
  };

  mockElements.bracketFactionPicker.value = 'Space Marines';
  roster.renderFactionBracketTable();
  roster.copyTtsUnitTypesList();

  assert.ok(copiedText && copiedText.includes('TABLETOP SIMULATOR (TTS) PREPARATION // SPACE MARINES'));
  assert.equal(mockElements.ttsCopyNotice.classList.contains('hidden'), false);
});

````

---

## File: `tests/ui/crusade.test.js` <a id="file-testsuicrusadetestjs"></a>

````javascript
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '../../');
const CRUSADE_HTML_PATH = path.join(ROOT_DIR, 'pages/crusade.html');

// Read crusade.html and extract script block
const crusadeHtml = fs.readFileSync(CRUSADE_HTML_PATH, 'utf8');
const scriptMatches = crusadeHtml.match(/<script>([\s\S]*?)<\/script>/);
assert.ok(scriptMatches && scriptMatches[1], 'Must locate script tag inside pages/crusade.html');
const crusadeScriptCode = scriptMatches[1];

// Set up mock DOM and localStorage environment
const storageStore = new Map();
const mockLocalStorage = {
  getItem: (k) => (storageStore.has(k) ? storageStore.get(k) : null),
  setItem: (k, v) => storageStore.set(k, String(v)),
  removeItem: (k) => storageStore.delete(k),
  clear: () => storageStore.clear()
};

function createMockClassList() {
  const classes = new Set();
  return {
    add: (c) => classes.add(c),
    remove: (c) => classes.delete(c),
    toggle: (c, force) => {
      if (force === undefined) {
        if (classes.has(c)) classes.delete(c);
        else classes.add(c);
      } else if (force) {
        classes.add(c);
      } else {
        classes.delete(c);
      }
    },
    contains: (c) => classes.has(c)
  };
}

const mockElements = {
  cruTabBoard: { classList: createMockClassList() },
  cruTabForge: { classList: createMockClassList() },
  cruTabTour: { classList: createMockClassList() },
  cruTabTomb: { classList: createMockClassList() },
  cruTabBtn1: { classList: createMockClassList() },
  cruTabBtn2: { classList: createMockClassList() },
  cruTabBtn3: { classList: createMockClassList() },
  cruTabBtn4: { classList: createMockClassList() },
  treeBtnGate: { classList: createMockClassList() },
  treeBtnDes: { classList: createMockClassList() },
  treeBtnMar: { classList: createMockClassList() },
  allianceTreeBox: { innerHTML: '' },
  alphaSP: { textContent: '0' },
  alphaCP: { textContent: '0' },
  alphaCacheCount: { textContent: '0' },
  betaSP: { textContent: '0' },
  betaCP: { textContent: '0' },
  betaCacheCount: { textContent: '0' },
  hordeSP: { textContent: '0' },
  hordeCP: { textContent: '0' },
  forgeSourcePool: { value: 'Armageddon' },
  rollerUnitName: { value: "Mercy's Delay" },
  rollerUnitContext: { value: 'Held the landing zone bunker against three swarm waves.' },
  traitUnitType: { value: 'Infantry' },
  traitResultBox: { innerHTML: '' },
  weaponResultBox: { innerHTML: '' },
  relicTierSelect: { value: 'Artificer' },
  relicResultBox: { innerHTML: '' },
  scarResultBox: { innerHTML: '' },
  dossierChannel: { value: 'alpha' },
  dossierDistantForce: { value: '' },
  dossierDistantForceRow: { style: { display: 'none' } },
  dossierModeNode: { value: 'Mode 1: Co-op Horde Breach // Node 0 (Golgotha Arbor-Basin)' },
  dossierOutcome: { value: 'Survived Round 6 Final Stand & Completed Secret Objective (+5 SPts)' },
  dossierSecretCode: { value: 'A9F' },
  dossierSecretTag: { value: 'Action / Relic Tag (Free Battle Trait, Weapon Mod, or Relic)' },
  dossierLeftoverSp: { value: '3 Leftover SP → Bank 1v1 Supply Cache Token' },
  dossierBattleNotes: { value: 'Krieg Vanquishers eliminated the enemy heavy armor in round 2.' },
  fortHosp: { checked: true },
  fortAmmo: { checked: false },
  fortTrench: { checked: true },
  fortFob: { checked: false },
  queuedCountLabel: { textContent: '0' },
  queuedRollsContainer: { innerHTML: '' },
  masterDossierPreviewBox: { textContent: '' },
  tourBattlesRem: { textContent: '0' },
  tourWinsRem: { textContent: '0' },
  commendationPts: { textContent: '0' },
  toursCompletedCount: { textContent: '0' },
  commRollNotice: { innerHTML: '' },
  upliftingPrimerToggle: { checked: false },
  logisticsAllocatedLabel: { textContent: '4 / 4' },
  logisticsAllocatorGrid: { innerHTML: '' },
  commendationSelect: { innerHTML: '', value: 'bastion' },
  commRecipientUnit: { value: '044th Krieg Regiment' },
  commendationPreviewBox: { innerHTML: '' },
  startTourNotes: { value: '' },
  startOfTourPreviewBox: { textContent: '' },
  tombAgendasCompleted: { textContent: '0' },
  tombAwakeningCycles: { textContent: '0' },
  tombMasterStatusVal: { textContent: '', style: {} },
  tombResetNotice: { innerHTML: '' },
  powerReservesToggle: { checked: false },
  tombMatrixAllocatedLabel: { textContent: '2 / 3' },
  tombMatrixGrid: { innerHTML: '' },
  necronVaultSelect: { innerHTML: '', value: 'viral_vectors' },
  necronRecipientUnit: { value: 'Hypercrypt Phalanx' },
  necronVaultPreviewBox: { innerHTML: '' },
  tombAwakeningNotes: { value: '' },
  tombAwakeningPreviewBox: { textContent: '' }
};

const mockDocument = {
  body: {
    dataset: {},
    classList: createMockClassList()
  },
  getElementById: (id) => mockElements[id] || null
};

let transmittedChannel = null;
let transmittedPayload = null;

const mockWindow = {
  addEventListener: () => {},
  VoxAudio: {
    playClank: () => {},
    playDiceClatter: () => {},
    playForgeAnvil: () => {},
    playRelicChoir: () => {},
    playScarHazard: () => {},
    playDossierStamp: () => {},
    transmitToVox: (chan, payload) => {
      transmittedChannel = chan;
      transmittedPayload = payload;
    }
  }
};

// Evaluate script in mock environment
const evalFn = new Function(
  'document',
  'window',
  'localStorage',
  'console',
  `${crusadeScriptCode}; return {
    CRUSADE_STATE_KEY,
    ALLIANCE_TREES,
    BATTLE_TRAIT_TABLES,
    ASTRA_MILITARUM_TRAIT_TABLES,
    NECRONS_TRAIT_TABLES,
    WEAPON_MOD_TABLE,
    CRUSADE_RELIC_VAULT,
    ASTRA_MILITARUM_RELIC_VAULT,
    NECRONS_RELIC_VAULT,
    BATTLE_SCAR_TABLE,
    NECRON_BATTLE_SCARS,
    NECRON_BATTLE_SCAR_TABLE,
    LOGISTICS_CATEGORIES,
    ASTRA_COMMENDATIONS_VAULT,
    TOMB_WORLD_SYSTEMS,
    NECRON_DYNASTIC_VAULT,
    getCrusadeState: () => crusadeState,
    lastRolledItem,
    switchCrusadeTab,
    adjScore,
    selectAllianceTree,
    rollRandomBattleTrait,
    rollRandomWeaponMod,
    rollRandomRelic,
    rollOutOfActionTest,
    rollRandomBattleScar,
    adjTourField,
    rollNewTourQuotas,
    rollVictoryCommendationPts,
    toggleUpliftingPrimer,
    adjLogisticsPt,
    renderLogisticsAllocator,
    populateCommendationVault,
    renderSelectedCommendationPreview,
    attachCommendationToDossier,
    adjTombField,
    rollMasterSystemReset,
    togglePowerReserves,
    adjTombSystemPt,
    renderTombAwakeningMatrix,
    populateNecronDynasticVault,
    renderSelectedNecronVaultPreview,
    attachNecronVaultToDossier,
    buildTombMatrixSummaryLine,
    compileTombAwakeningDossier,
    buildTombAwakeningDossierString,
    updateTombAwakeningPreview,
    transmitTombAwakeningDossier,
    resetTombAwakeningTab: (typeof resetTombAwakeningTab === 'function' ? resetTombAwakeningTab : null),
    attachRollToDossier,
    removeQueuedRoll,
    clearQueuedRolls,
    resetMasterDossierForm,
    renderQueuedRolls,
    buildLogisticsSummaryLine,
    compileMasterDossier,
    readMasterDossierFormInputs,
    updateDistantForceVisibility,
    buildMasterDossierString,
    updateMasterDossierPreview,
    transmitMasterBattleDossier,
    buildStartOfTourDossierString,
    updateStartOfTourPreview,
    transmitStartOfTourDossier,
    saveCrusadeState,
    initCrusadePage
  };`
);

const crusade = evalFn(mockDocument, mockWindow, mockLocalStorage, console);

test('crusade: ALLIANCE_TREES, tables, and vaults have complete schemas and 11th Ed crusade rules', () => {
  assert.ok(crusade.ALLIANCE_TREES.Gatebreakers, 'Must define Gatebreakers alliance tree');
  assert.ok(crusade.ALLIANCE_TREES.Desecrators, 'Must define Desecrators alliance tree');
  assert.ok(crusade.ALLIANCE_TREES.Marauders, 'Must define Marauders alliance tree');

  assert.equal(crusade.BATTLE_TRAIT_TABLES.Infantry.length, 6, 'Must define 6 Infantry traits');
  assert.equal(crusade.BATTLE_TRAIT_TABLES.Mounted.length, 6, 'Must define 6 Mounted traits');
  assert.equal(crusade.BATTLE_TRAIT_TABLES.MonsterVehicle.length, 6, 'Must define 6 Monster/Vehicle traits');
  assert.equal(crusade.BATTLE_TRAIT_TABLES.Character.length, 6, 'Must define 6 Character traits');

  assert.equal(crusade.WEAPON_MOD_TABLE.length, 6, 'Must define 6 Weapon Modifications');
  assert.ok(crusade.CRUSADE_RELIC_VAULT.Artificer.length > 0, 'Must define Artificer relics');
  assert.ok(crusade.CRUSADE_RELIC_VAULT.Antiquity.length > 0, 'Must define Antiquity relics');
  assert.ok(crusade.CRUSADE_RELIC_VAULT.Legendary.length > 0, 'Must define Legendary relics');

  assert.equal(crusade.BATTLE_SCAR_TABLE.length, 6, 'Must define 6 Battle Scars');
});

test('crusade: switchCrusadeTab switches tabs and persists state', () => {
  crusade.switchCrusadeTab('forge', false);
  assert.equal(mockElements.cruTabBoard.classList.contains('hidden'), true);
  assert.equal(mockElements.cruTabForge.classList.contains('hidden'), false);
  assert.equal(mockElements.cruTabBtn2.classList.contains('active'), true);
  assert.equal(mockElements.cruTabBtn1.classList.contains('active'), false);

  crusade.switchCrusadeTab('board', false);
  assert.equal(mockElements.cruTabBoard.classList.contains('hidden'), false);
  assert.equal(mockElements.cruTabForge.classList.contains('hidden'), true);
  assert.equal(mockElements.cruTabBtn1.classList.contains('active'), true);
});

test('crusade: Marauders (3rd Force) default hordeSP is 1 in crusadeState and HTML scoreboard', () => {
  assert.equal(crusade.getCrusadeState().hordeSP, 1, 'Default crusadeState.hordeSP must be 1');
  assert.match(
    crusadeHtml,
    /id="hordeSP"[^>]*>1</,
    'pages/crusade.html #hordeSP counter must default to 1'
  );
  assert.match(
    crusadeHtml,
    /id="hordeSP"[^>]*style="color:var\(--purple\);"/,
    'pages/crusade.html #hordeSP counter must use var(--purple) styling'
  );
});

test('crusade: adjScore modifies alliance Strategic & Campaign Points without going below 0', () => {
  crusade.adjScore('alphaSP', 5);
  assert.equal(crusade.getCrusadeState().alphaSP, 5);
  assert.equal(String(mockElements.alphaSP.textContent), '5');

  crusade.adjScore('alphaSP', -2);
  assert.equal(crusade.getCrusadeState().alphaSP, 3);
  assert.equal(String(mockElements.alphaSP.textContent), '3');

  // Should floor at 0
  crusade.adjScore('alphaSP', -10);
  assert.equal(crusade.getCrusadeState().alphaSP, 0);
  assert.equal(String(mockElements.alphaSP.textContent), '0');

  crusade.adjScore('betaCP', 2);
  assert.equal(crusade.getCrusadeState().betaCP, 2);
  assert.equal(String(mockElements.betaCP.textContent), '2');
});

test('crusade: selectAllianceTree renders branching phase goals, success and failure paths', () => {
  crusade.selectAllianceTree('Gatebreakers', false);
  assert.ok(mockElements.allianceTreeBox.innerHTML.includes('Stabilising the Front'));
  assert.ok(mockElements.allianceTreeBox.innerHTML.includes('Reclaim the Lost Hives'));
  assert.equal(mockElements.treeBtnGate.classList.contains('active'), true);

  crusade.selectAllianceTree('Desecrators', false);
  assert.ok(mockElements.allianceTreeBox.innerHTML.includes('Planetfall'));
  assert.equal(mockElements.treeBtnDes.classList.contains('active'), true);

  crusade.selectAllianceTree('Marauders', false);
  assert.ok(mockElements.allianceTreeBox.innerHTML.includes('Drawn to the Fight'));
  assert.equal(mockElements.treeBtnMar.classList.contains('active'), true);
});

test('crusade: upgrade rollers generate valid traits, weapon mods, relics, and scars', () => {
  // 1. Battle Trait
  mockElements.traitUnitType.value = 'Character';
  crusade.rollRandomBattleTrait();
  assert.ok(crusade.lastRolledItem.trait, 'Must store last rolled trait');
  assert.equal(crusade.lastRolledItem.trait.category, 'Battle Trait (Character)');
  assert.ok(crusade.lastRolledItem.trait.name);

  // 2. Weapon Mod
  crusade.rollRandomWeaponMod();
  assert.ok(crusade.lastRolledItem.weapon, 'Must store last rolled weapon mod');
  assert.ok(crusade.lastRolledItem.weapon.name.includes('+'));

  // 3. Relic
  mockElements.relicTierSelect.value = 'Legendary';
  crusade.rollRandomRelic();
  assert.ok(crusade.lastRolledItem.relic, 'Must store last rolled relic');
  assert.equal(crusade.lastRolledItem.relic.category, 'Crusade Relic (Legendary)');

  // 4. Battle Scar
  crusade.rollRandomBattleScar();
  assert.ok(crusade.lastRolledItem.scar, 'Must store last rolled scar');
  assert.equal(crusade.lastRolledItem.scar.category, 'Battle Scar');
});

test('crusade: attachRollToDossier queues rolled items and clearQueuedRolls resets list', () => {
  crusade.clearQueuedRolls();
  assert.equal(crusade.getCrusadeState().queuedRolls.length, 0);

  mockElements.rollerUnitName.value = 'Krieg Leman Russ #1';
  mockElements.rollerUnitContext.value = 'Survived 2 rounds under heavy fire.';
  crusade.attachRollToDossier('trait');

  assert.equal(crusade.getCrusadeState().queuedRolls.length, 1);
  assert.equal(crusade.getCrusadeState().queuedRolls[0].unit, 'Krieg Leman Russ #1');
  assert.equal(mockElements.queuedCountLabel.textContent, '1');

  // Attach another item
  mockElements.rollerUnitName.value = 'Watchmaster Dreir';
  mockElements.rollerUnitContext.value = 'Took devastating blow in melee.';
  crusade.attachRollToDossier('scar');
  assert.equal(crusade.getCrusadeState().queuedRolls.length, 2);

  // Remove first item
  crusade.removeQueuedRoll(0);
  assert.equal(crusade.getCrusadeState().queuedRolls.length, 1);
  assert.equal(crusade.getCrusadeState().queuedRolls[0].unit, 'Watchmaster Dreir');

  // Clear list
  crusade.clearQueuedRolls();
  assert.equal(crusade.getCrusadeState().queuedRolls.length, 0);
  assert.equal(mockElements.queuedCountLabel.textContent, '0');
});

test('crusade: buildMasterDossierString compiles comprehensive battle and unit progression dossier', () => {
  mockElements.dossierChannel.value = 'alpha';
  mockElements.dossierModeNode.value = 'Mode 1: Co-op Horde Breach // Node 0 (Golgotha Arbor-Basin)';
  mockElements.dossierOutcome.value = 'Survived Round 6 Final Stand & Completed Secret Objective (+5 SPts)';
  mockElements.dossierSecretCode.value = 'A9F';
  mockElements.dossierBattleNotes.value = 'Held the frontline and extracted with full supply cache.';

  crusade.clearQueuedRolls();
  mockElements.rollerUnitName.value = "Mercy's Delay";
  mockElements.rollerUnitContext.value = 'Held the center';
  crusade.attachRollToDossier('relic');

  const dossierStr = crusade.buildMasterDossierString();
  assert.ok(dossierStr.includes('+++ MASTER POST-BATTLE & UNIT PROGRESSION DOSSIER +++'));
  assert.ok(dossierStr.includes('THE EXILE // SANCTUARY OF ASH'));
  assert.ok(dossierStr.includes('Golgotha Arbor-Basin'));
  assert.ok(dossierStr.includes('SECRET OBJECTIVE CODE: [A9F]'));
  assert.ok(dossierStr.includes("Mercy's Delay"));
  assert.ok(dossierStr.includes('Held the frontline'));
});

test('crusade: does not duplicate Mode 3 Rogue Sector reporting (kept exclusively in pages/rogue.html)', () => {
  assert.ok(!crusadeHtml.includes('Mode 3: Rogue Sector Auxiliary Clash'), 'crusade.html must not include Mode 3 Rogue Sector option in dossierModeNode');
  assert.ok(!crusadeHtml.includes('Mode 3 Rogue Sector:'), 'crusade.html must not include Mode 3 Rogue Sector outcomes in dossierOutcome');

  mockElements.dossierChannel.value = 'alpha';
  mockElements.dossierModeNode.value = 'Mode 2: 1v1 Ash Wastes PvP // Node 0 (Golgotha Arbor-Basin)';
  mockElements.dossierOutcome.value = '1v1 PvP Victory & Achieved Phase Narrative Goal (+5 SPts)';
  mockElements.dossierBattleNotes.value = 'Secured the central ridge against rival vanguard.';

  const dossierStr = crusade.buildMasterDossierString();
  assert.ok(dossierStr.includes('+++ MASTER POST-BATTLE & UNIT PROGRESSION DOSSIER +++'));
  assert.ok(!dossierStr.includes('ROGUE SECTOR PLANETARY IMPACT'), 'Master Dossier in crusade.html must not include Rogue Sector planetary impact');
  assert.ok(dossierStr.includes('Pattern 2 Munitorum After-Action Audit'));
});

test('crusade: transmitMasterBattleDossier invokes window.VoxAudio.transmitToVox', () => {
  transmittedChannel = null;
  transmittedPayload = null;
  mockElements.dossierChannel.value = 'alpha';

  crusade.transmitMasterBattleDossier();
  assert.equal(transmittedChannel, 'alpha');
  assert.ok(transmittedPayload.includes('MASTER POST-BATTLE'));
  assert.ok(transmittedPayload.includes('SANCTUARY OF ASH'));
});

test('crusade: saveCrusadeState and initCrusadePage restore state across tab navigation', () => {
  mockLocalStorage.clear();
  mockLocalStorage.setItem(crusade.CRUSADE_STATE_KEY, JSON.stringify({
    activeTab: 'forge',
    selectedTree: 'Desecrators',
    alphaSP: 12,
    alphaCP: 4,
    betaSP: 9,
    betaCP: 3,
    hordeSP: 6,
    hordeCP: 2,
    queuedRolls: [
      { unit: 'Krieg Sentinel', context: 'Scouted forward', category: 'Battle Trait (Mounted)', name: 'Outriders', roll: 'D6 = 2', desc: 'Fast move' }
    ]
  }));

  crusade.initCrusadePage();

  assert.equal(crusade.getCrusadeState().alphaSP, 12);
  assert.equal(crusade.getCrusadeState().betaSP, 9);
  assert.equal(crusade.getCrusadeState().hordeSP, 6);
  assert.equal(mockElements.alphaSP.textContent, '12');
  assert.equal(mockElements.betaSP.textContent, '9');
  assert.equal(mockElements.hordeSP.textContent, '6');
  assert.equal(crusade.getCrusadeState().queuedRolls.length, 1);
  assert.equal(mockElements.queuedCountLabel.textContent, '1');
});

test('crusade: Astra Militarum codex tables, Munitorum logistics categories, and Commendations vault schemas', () => {
  // AM Codex Traits
  assert.equal(crusade.ASTRA_MILITARUM_TRAIT_TABLES.Infantry.length, 6, 'Must define 6 AM Infantry traits');
  assert.equal(crusade.ASTRA_MILITARUM_TRAIT_TABLES.Mounted.length, 6, 'Must define 6 AM Mounted traits');
  assert.equal(crusade.ASTRA_MILITARUM_TRAIT_TABLES.MonsterVehicle.length, 6, 'Must define 6 AM Monster/Vehicle traits');
  assert.equal(crusade.ASTRA_MILITARUM_TRAIT_TABLES.Character.length, 6, 'Must define 6 AM Character traits');

  // AM Codex Relics
  assert.ok(crusade.ASTRA_MILITARUM_RELIC_VAULT.Artificer.length > 0, 'Must define AM Artificer relics');
  assert.ok(crusade.ASTRA_MILITARUM_RELIC_VAULT.Antiquity.length > 0, 'Must define AM Antiquity relics');
  assert.ok(crusade.ASTRA_MILITARUM_RELIC_VAULT.Legendary.length > 0, 'Must define AM Legendary relics');

  // Munitorum Logistics Categories
  assert.equal(crusade.LOGISTICS_CATEGORIES.length, 4, 'Must define 4 Munitorum logistics categories');
  crusade.LOGISTICS_CATEGORIES.forEach(c => {
    assert.ok(c.key, 'Logistics category must have key');
    assert.ok(c.title, 'Logistics category must have title');
    assert.ok(c.surplus, 'Logistics category must have surplus rule');
    assert.ok(c.deficiency, 'Logistics category must have deficiency rule');
  });

  // Commendations Vault
  assert.ok(crusade.ASTRA_COMMENDATIONS_VAULT.length >= 15, 'Must define complete Commendations Vault');
  const personal = crusade.ASTRA_COMMENDATIONS_VAULT.filter(c => c.type.includes('Personal'));
  const regimental = crusade.ASTRA_COMMENDATIONS_VAULT.filter(c => c.type.includes('Regimental'));
  assert.ok(personal.length > 0, 'Must include Personal Commendations');
  assert.ok(regimental.length > 0, 'Must include Regimental Commendations');
});

test('crusade: switchCrusadeTab handles Tab 3 Tour of Duty & Logistics', () => {
  crusade.switchCrusadeTab('tour', false);
  assert.equal(mockElements.cruTabBoard.classList.contains('hidden'), true);
  assert.equal(mockElements.cruTabForge.classList.contains('hidden'), true);
  assert.equal(mockElements.cruTabTour.classList.contains('hidden'), false);
  assert.equal(mockElements.cruTabBtn3.classList.contains('active'), true);
  assert.equal(mockElements.cruTabBtn1.classList.contains('active'), false);
  assert.equal(mockElements.cruTabBtn2.classList.contains('active'), false);
});

test('crusade: adjTourField, rollNewTourQuotas, and rollVictoryCommendationPts manage quotas & commendation bank', () => {
  crusade.adjTourField('tourBattlesRem', 5);
  assert.equal(crusade.getCrusadeState().tourBattlesRem, 5);
  assert.equal(mockElements.tourBattlesRem.textContent, '5');

  crusade.adjTourField('tourBattlesRem', -2);
  assert.equal(crusade.getCrusadeState().tourBattlesRem, 3);
  assert.equal(mockElements.tourBattlesRem.textContent, '3');

  // Floor at 0
  crusade.adjTourField('tourBattlesRem', -10);
  assert.equal(crusade.getCrusadeState().tourBattlesRem, 0);
  assert.equal(mockElements.tourBattlesRem.textContent, '0');

  // Roll new quotas
  crusade.rollNewTourQuotas();
  assert.ok(crusade.getCrusadeState().tourBattlesRem >= 5 && crusade.getCrusadeState().tourBattlesRem <= 10);
  assert.ok(crusade.getCrusadeState().tourWinsRem >= 3 && crusade.getCrusadeState().tourWinsRem <= 5);

  // Roll victory commendation points
  const prevComm = crusade.getCrusadeState().commendationPts || 0;
  crusade.rollVictoryCommendationPts();
  assert.ok(crusade.getCrusadeState().commendationPts >= prevComm + 1);

  // Mark and Demark Tour Completed (+1 and -1)
  assert.ok(
    crusadeHtml.includes(`adjTourField('toursCompletedCount', 1)`),
    'pages/crusade.html must include Mark Tour Completed (+1) button'
  );
  assert.ok(
    crusadeHtml.includes(`adjTourField('toursCompletedCount', -1)`),
    'pages/crusade.html must include Demark Tour Completed (-1) button'
  );
  crusade.adjTourField('toursCompletedCount', 1);
  assert.equal(crusade.getCrusadeState().toursCompletedCount, 1);
  assert.equal(mockElements.toursCompletedCount.textContent, '1');
  crusade.adjTourField('toursCompletedCount', -1);
  assert.equal(crusade.getCrusadeState().toursCompletedCount, 0);
  assert.equal(mockElements.toursCompletedCount.textContent, '0');
});

test('crusade: Munitorum logistics point allocation enforces limits and toggles Uplifting Primers', () => {
  // Reset logistics
  crusade.getCrusadeState().upliftingPrimer = false;
  mockElements.upliftingPrimerToggle.checked = false;
  crusade.getCrusadeState().logistics = { lexmechanicus: 1, materiel: 2, tithePool: 0, morale: 1 };
  crusade.renderLogisticsAllocator();

  assert.equal(mockElements.logisticsAllocatedLabel.textContent, '4 / 4');

  // Attempt to increment when already at 4/4 total -> should not increase
  crusade.adjLogisticsPt('tithePool', 1);
  assert.equal(crusade.getCrusadeState().logistics.tithePool, 0, 'Cannot exceed 4 total points without Uplifting Primer');

  // Toggle Uplifting Primer -> expands total to 5
  mockElements.upliftingPrimerToggle.checked = true;
  crusade.toggleUpliftingPrimer();
  assert.equal(crusade.getCrusadeState().upliftingPrimer, true);
  assert.equal(mockElements.logisticsAllocatedLabel.textContent, '4 / 5');

  // Now we can increment tithePool
  crusade.adjLogisticsPt('tithePool', 1);
  assert.equal(crusade.getCrusadeState().logistics.tithePool, 1);
  assert.equal(mockElements.logisticsAllocatedLabel.textContent, '5 / 5');

  // Max 2 per category
  crusade.adjLogisticsPt('tithePool', 1);
  assert.equal(crusade.getCrusadeState().logistics.tithePool, 1, 'Cannot exceed total or per-category limit');

  // Min 0 per category
  crusade.adjLogisticsPt('tithePool', -1);
  assert.equal(crusade.getCrusadeState().logistics.tithePool, 0);
  crusade.adjLogisticsPt('tithePool', -1);
  assert.equal(crusade.getCrusadeState().logistics.tithePool, 0, 'Cannot drop below 0');
});

test('crusade: Astra Militarum commendation vault selection and attaching to dossier', () => {
  crusade.populateCommendationVault();
  assert.ok(mockElements.commendationSelect.innerHTML.includes('Bastion Honour'));
  assert.ok(mockElements.commendationSelect.innerHTML.includes('Veteran Crew'));

  mockElements.commendationSelect.value = 'auramite';
  crusade.renderSelectedCommendationPreview();
  assert.ok(mockElements.commendationPreviewBox.innerHTML.includes('Auramite Aquila'));

  mockElements.commRecipientUnit.value = "Mercy's Delay (Rogal Dorn)";
  const prevCount = crusade.getCrusadeState().queuedRolls.length;
  crusade.attachCommendationToDossier();

  assert.equal(crusade.getCrusadeState().queuedRolls.length, prevCount + 1);
  const lastItem = crusade.getCrusadeState().queuedRolls[crusade.getCrusadeState().queuedRolls.length - 1];
  assert.equal(lastItem.unit, "Mercy's Delay (Rogal Dorn)");
  assert.ok(lastItem.category.includes('Personal Commendation'));
  assert.equal(crusade.getCrusadeState().activeTab, 'forge');
});

test('crusade: buildLogisticsSummaryLine and inclusion in buildMasterDossierString for Alpha vs Beta', () => {
  crusade.getCrusadeState().tourBattlesRem = 4;
  crusade.getCrusadeState().tourWinsRem = 2;
  crusade.getCrusadeState().commendationPts = 7;
  crusade.getCrusadeState().logistics = { lexmechanicus: 2, materiel: 2, tithePool: 0, morale: 0 };

  const summary = crusade.buildLogisticsSummaryLine();
  assert.ok(summary.includes('Battles Rem: 4'));
  assert.ok(summary.includes('Wins Rem: 2'));
  assert.ok(summary.includes('Commendation Pts: 7'));
  assert.ok(summary.includes('Surplus: [Lexmechanicus, Materiel]'));
  assert.ok(summary.includes('Deficiency: [Tithe, Morale]'));

  // When dossierChannel is alpha, summary must be included
  mockElements.dossierChannel.value = 'alpha';
  const alphaDossier = crusade.buildMasterDossierString();
  assert.ok(alphaDossier.includes('TOUR OF DUTY & LOGISTICS TELEMETRY: Battles Rem: 4'));

  // When dossierChannel is beta, summary line must not be present
  mockElements.dossierChannel.value = 'beta';
  const betaDossier = crusade.buildMasterDossierString();
  assert.ok(!betaDossier.includes('TOUR OF DUTY & LOGISTICS TELEMETRY'));
});

test('crusade: saveCrusadeState and initCrusadePage restore Tour of Duty and Munitorum logistics state', () => {
  mockLocalStorage.clear();
  mockLocalStorage.setItem(crusade.CRUSADE_STATE_KEY, JSON.stringify({
    activeTab: 'tour',
    tourBattlesRem: 6,
    tourWinsRem: 3,
    commendationPts: 9,
    toursCompletedCount: 2,
    upliftingPrimer: true,
    logistics: { lexmechanicus: 2, materiel: 1, tithePool: 1, morale: 1 }
  }));

  crusade.initCrusadePage();

  assert.equal(crusade.getCrusadeState().activeTab, 'tour');
  assert.equal(crusade.getCrusadeState().tourBattlesRem, 6);
  assert.equal(crusade.getCrusadeState().tourWinsRem, 3);
  assert.equal(crusade.getCrusadeState().commendationPts, 9);
  assert.equal(crusade.getCrusadeState().toursCompletedCount, 2);
  assert.equal(crusade.getCrusadeState().upliftingPrimer, true);
  assert.equal(mockElements.tourBattlesRem.textContent, '6');
  assert.equal(mockElements.tourWinsRem.textContent, '3');
  assert.equal(mockElements.commendationPts.textContent, '9');
  assert.equal(mockElements.toursCompletedCount.textContent, '2');
});

test('crusade: resetMasterDossierForm resets all Crusade report form fields and queued rolls to clean defaults', () => {
  assert.ok(
    crusadeHtml.includes('resetMasterDossierForm()'),
    'pages/crusade.html must include a button calling resetMasterDossierForm()'
  );

  // Dirty up all fields and queue a roll
  mockElements.dossierChannel.value = 'beta';
  mockElements.dossierModeNode.value = 'Mode 2: 1v1 Ash Wastes PvP // Node 1 (Pyre-Silt Refinery)';
  mockElements.dossierOutcome.value = '1v1 PvP Defeat (+3 SPts)';
  mockElements.dossierSecretCode.value = 'Z99';
  mockElements.dossierSecretTag.value = 'Wargear / Cache Tag (+1 Supply Cache Token)';
  mockElements.fortHosp.checked = true;
  mockElements.fortAmmo.checked = true;
  mockElements.fortTrench.checked = true;
  mockElements.fortFob.checked = true;
  mockElements.dossierLeftoverSp.value = '3 Leftover SP → Bank 1v1 Supply Cache Token';
  mockElements.dossierBattleNotes.value = 'Custom battle report notes to be cleared.';
  mockElements.rollerUnitName.value = 'Test Unit';
  crusade.rollRandomBattleTrait();
  crusade.attachRollToDossier('trait');
  assert.ok(crusade.getCrusadeState().queuedRolls.length > 0);

  crusade.resetMasterDossierForm();

  assert.equal(mockElements.dossierChannel.value, 'alpha');
  assert.equal(mockElements.dossierSecretCode.value, '');
  assert.equal(mockElements.fortHosp.checked, false);
  assert.equal(mockElements.fortAmmo.checked, false);
  assert.equal(mockElements.fortTrench.checked, false);
  assert.equal(mockElements.fortFob.checked, false);
  assert.equal(mockElements.dossierLeftoverSp.value, '0 Leftover SP');
  assert.equal(mockElements.dossierBattleNotes.value, '');
  assert.equal(crusade.getCrusadeState().queuedRolls.length, 0);
  assert.equal(mockElements.queuedCountLabel.textContent, '0');
  assert.ok(mockElements.masterDossierPreviewBox.textContent.includes('None attached this battle.'));
});

test('crusade: buildStartOfTourDossierString and transmitStartOfTourDossier compile and transmit unique Start of Tour of Duty report', () => {
  assert.ok(
    crusadeHtml.includes('transmitStartOfTourDossier()'),
    'pages/crusade.html must include a button calling transmitStartOfTourDossier()'
  );

  crusade.getCrusadeState().tourBattlesRem = 8;
  crusade.getCrusadeState().tourWinsRem = 4;
  crusade.getCrusadeState().commendationPts = 2;
  crusade.getCrusadeState().toursCompletedCount = 1;
  crusade.getCrusadeState().upliftingPrimer = true;
  crusade.getCrusadeState().logistics = { lexmechanicus: 2, materiel: 2, tithePool: 1, morale: 0 };
  mockElements.startTourNotes.value = 'Deploying 044th Krieg armored column to Golgotha sector.';

  crusade.updateStartOfTourPreview();
  const report = crusade.buildStartOfTourDossierString();

  assert.equal(mockElements.startOfTourPreviewBox.textContent, report);
  assert.ok(report.includes('+++ MUNITORUM FIELD REGULATION 884-ALPHA // START OF TOUR OF DUTY DISPATCH +++'));
  assert.ok(report.includes('THE EXILE // SANCTUARY OF ASH'));
  assert.ok(report.includes('BATTLES REQUIRED QUOTA (D6+4): 8 Battles'));
  assert.ok(report.includes('VICTORIES REQUIRED QUOTA (D3+2): 4 Wins'));
  assert.ok(report.includes('PRIOR TOURS COMPLETED: 1'));
  assert.ok(report.includes('UPLIFTING PRIMERS REQUISITION (1 RP): ACTIVE (5 Total Logistics Pts)'));
  assert.ok(report.includes('Surplus: [Lexmechanicus, Materiel]'));
  assert.ok(report.includes('Deficiency: [Morale]'));
  assert.ok(report.includes('Deploying 044th Krieg armored column to Golgotha sector.'));

  transmittedChannel = null;
  transmittedPayload = null;
  crusade.transmitStartOfTourDossier();
  assert.equal(transmittedChannel, 'alpha');
  assert.equal(transmittedPayload, report);
});

test('crusade: compileMasterDossier and buildMasterDossierString format Distant Solo Horde Augur Intercept for off-roster force with zero SPt shifts', () => {
  mockElements.dossierChannel.value = 'augur_alpha';
  mockElements.dossierModeNode.value = 'Mode 1: Distant Solo Horde Breach // Orbital Augur Telemetry';
  mockElements.dossierDistantForce.value = '019th Steel Legion Patrol';
  mockElements.dossierOutcome.value = 'Survived Round 6 Final Stand & Completed Secret Objective (+5 SPts)';
  mockElements.dossierSecretCode.value = 'B77';
  mockElements.dossierSecretTag.value = 'Action / Relic Tag (Free Battle Trait, Weapon Mod, or Relic)';
  mockElements.dossierBattleNotes.value = 'Ventral augurs locked onto an intense swarm breach 40km north. Remote PDF held the perimeter.';

  crusade.clearQueuedRolls();
  mockElements.rollerUnitName.value = 'Sentinel Outrider Alpha-9';
  mockElements.rollerUnitContext.value = 'Kited the swarm behemoth across the sulfur dunes.';
  crusade.rollRandomBattleTrait();
  crusade.attachRollToDossier('trait');

  crusade.updateDistantForceVisibility();
  assert.equal(mockElements.dossierDistantForceRow.style.display, 'block');

  const dossierStr = crusade.buildMasterDossierString();
  assert.ok(dossierStr.includes('+++ MASTER POST-BATTLE DOSSIER // ORBITAL AUGUR TELEMETRY +++'));
  assert.ok(dossierStr.includes('ORBITAL AUGUR ARRAY (Relayed via THE EXILE // SANCTUARY OF ASH)'));
  assert.ok(dossierStr.includes('019th Steel Legion Patrol (Neither Main Player Fielded)'));
  assert.ok(dossierStr.includes('Mode 1: Distant Solo Horde Breach // Orbital Augur Telemetry'));
  assert.ok(dossierStr.includes('Zero Alliance SPt Shift (Off-Roster Narrative Telemetry)'));
  assert.ok(dossierStr.includes('Zero Quota Deduction (Neither Main Player Fielded)'));
  assert.ok(!dossierStr.includes('TOUR OF DUTY & LOGISTICS TELEMETRY: Battles Rem:'));
  assert.ok(dossierStr.includes('Sentinel Outrider Alpha-9'));
  assert.ok(dossierStr.includes('Ventral augurs locked onto an intense swarm breach'));
  assert.ok(dossierStr.includes('As neither main player participated, no Alliance SPts are shifted'));
});

test('crusade: compileMasterDossier supports Junebug augur_beta conduit and fallbacks for empty distant force', () => {
  mockElements.dossierChannel.value = 'augur_beta';
  mockElements.dossierModeNode.value = 'Mode 1: Distant Solo Horde Breach // Orbital Augur Telemetry';
  mockElements.dossierDistantForce.value = '';
  mockElements.dossierBattleNotes.value = 'Distant explosions recorded.';

  const dossierStr = crusade.buildMasterDossierString();
  assert.ok(dossierStr.includes('ORBITAL AUGUR ARRAY (Relayed via LORD COMMANDER JUNEBUG)'));
  assert.ok(dossierStr.includes('Unspecified Distant Auxiliary Detachment (Neither Main Player Fielded)'));
});

test('crusade: transmitMasterBattleDossier routes augur_alpha to alpha and augur_beta to beta with dual-channel intercept payload', () => {
  transmittedChannel = null;
  transmittedPayload = null;
  mockElements.dossierChannel.value = 'augur_alpha';
  mockElements.dossierModeNode.value = 'Mode 1: Distant Solo Horde Breach // Orbital Augur Telemetry';
  mockElements.dossierDistantForce.value = 'Iron Warriors 77th Cohort';

  crusade.transmitMasterBattleDossier();
  assert.equal(transmittedChannel, 'alpha', 'Must route to commanding player alpha CRT terminal');
  assert.ok(transmittedPayload.includes('ORBITAL AUGUR TELEMETRY'));

  mockElements.dossierChannel.value = 'augur_beta';
  crusade.transmitMasterBattleDossier();
  assert.equal(transmittedChannel, 'beta', 'Must route to commanding player beta CRT terminal');
  assert.ok(transmittedPayload.includes('LORD COMMANDER JUNEBUG'));
});

test('crusade: resetMasterDossierForm clears dossierDistantForce and resets distant force visibility', () => {
  mockElements.dossierChannel.value = 'augur_alpha';
  mockElements.dossierDistantForce.value = 'Test Distant Auxiliary';
  crusade.updateDistantForceVisibility();
  assert.equal(mockElements.dossierDistantForceRow.style.display, 'block');

  crusade.resetMasterDossierForm();
  assert.equal(mockElements.dossierChannel.value, 'alpha');
  assert.equal(mockElements.dossierDistantForce.value, '');
  assert.equal(mockElements.dossierDistantForceRow.style.display, 'none');
});

test('crusade: saveCrusadeState and initCrusadePage persist and restore distant force and augur channel', () => {
  mockLocalStorage.clear();
  mockLocalStorage.setItem(crusade.CRUSADE_STATE_KEY, JSON.stringify({
    activeTab: 'forge',
    dossierChannel: 'augur_alpha',
    dossierDistantForce: 'Salamanders 3rd Company Patrol'
  }));

  crusade.initCrusadePage();
  assert.equal(crusade.getCrusadeState().dossierChannel, 'augur_alpha');
  assert.equal(crusade.getCrusadeState().dossierDistantForce, 'Salamanders 3rd Company Patrol');
  assert.equal(mockElements.dossierChannel.value, 'augur_alpha');
  assert.equal(mockElements.dossierDistantForce.value, 'Salamanders 3rd Company Patrol');
  assert.equal(mockElements.dossierDistantForceRow.style.display, 'block');
});

test('crusade: #forgeSourcePool option label and BetaCodex Necron Battle Traits, Relics, and Battle Scars schemas', () => {
  // 1. Check HTML option label for BetaCodex
  assert.ok(
    crusadeHtml.includes('<option value="BetaCodex">💀 Necrons Codex (Commander Beta — Awakening Tomb World)</option>'),
    'pages/crusade.html must include the exact BetaCodex Necrons Codex option label inside #forgeSourcePool'
  );

  // 2. Check BATTLE_TRAIT_TABLES.BetaCodex and NECRONS_TRAIT_TABLES
  assert.ok(crusade.BATTLE_TRAIT_TABLES.BetaCodex, 'Must define BetaCodex inside BATTLE_TRAIT_TABLES');
  assert.equal(crusade.BATTLE_TRAIT_TABLES.BetaCodex.label, 'Necrons Codex (Dynastic Battle Traits)');
  assert.equal(crusade.BATTLE_TRAIT_TABLES.BetaCodex.tables['CHARACTER Units'].length, 6);
  assert.equal(crusade.BATTLE_TRAIT_TABLES.BetaCodex.tables['INFANTRY Units (Excluding CHARACTERS)'].length, 6);
  assert.equal(crusade.BATTLE_TRAIT_TABLES.BetaCodex.tables['VEHICLE & MOUNTED Units (Excluding CANOPTEK)'].length, 6);
  assert.equal(crusade.BATTLE_TRAIT_TABLES.BetaCodex.tables['CANOPTEK Units'].length, 3);

  assert.equal(crusade.NECRONS_TRAIT_TABLES.Character.length, 6);
  assert.equal(crusade.NECRONS_TRAIT_TABLES.Infantry.length, 6);
  assert.equal(crusade.NECRONS_TRAIT_TABLES.Mounted.length, 6);
  assert.equal(crusade.NECRONS_TRAIT_TABLES.MonsterVehicle.length, 6);
  assert.equal(crusade.NECRONS_TRAIT_TABLES.Canoptek.length, 3);

  // 3. Check CRUSADE_RELIC_VAULT.BetaCodex and NECRONS_RELIC_VAULT
  assert.ok(crusade.CRUSADE_RELIC_VAULT.BetaCodex, 'Must define BetaCodex inside CRUSADE_RELIC_VAULT');
  assert.equal(crusade.CRUSADE_RELIC_VAULT.BetaCodex.Artificer.length, 2);
  assert.equal(crusade.CRUSADE_RELIC_VAULT.BetaCodex.Antiquity.length, 2);
  assert.equal(crusade.CRUSADE_RELIC_VAULT.BetaCodex.Legendary.length, 1);

  assert.equal(crusade.NECRONS_RELIC_VAULT.Artificer.length, 2);
  assert.equal(crusade.NECRONS_RELIC_VAULT.Antiquity.length, 2);
  assert.equal(crusade.NECRONS_RELIC_VAULT.Legendary.length, 1);

  // 4. Check NECRON_BATTLE_SCARS and NECRON_BATTLE_SCAR_TABLE
  assert.equal(crusade.NECRON_BATTLE_SCARS.length, 4, 'Must define 4 Necron bespoke Battle Scars');
  assert.ok(crusade.NECRON_BATTLE_SCARS[0].includes('Creeping Madness'));
  assert.ok(crusade.NECRON_BATTLE_SCARS[1].includes('Mindless Reaper'));
  assert.ok(crusade.NECRON_BATTLE_SCARS[2].includes('Engrammatic Degradation'));
  assert.ok(crusade.NECRON_BATTLE_SCARS[3].includes('Depleted Transmaterial Reserves'));
  assert.equal(crusade.NECRON_BATTLE_SCAR_TABLE.length, 4);
});

test('crusade: Quartermaster rollers draw from BetaCodex Necron tables when forgeSourcePool is BetaCodex', () => {
  mockElements.forgeSourcePool.value = 'BetaCodex';

  // Roll Necron Character Trait
  mockElements.traitUnitType.value = 'Character';
  crusade.rollRandomBattleTrait();
  assert.ok(crusade.lastRolledItem.trait);
  const charNames = crusade.NECRONS_TRAIT_TABLES.Character.map((t) => t.name);
  assert.ok(charNames.includes(crusade.lastRolledItem.trait.name), 'Rolled trait must come from Necron Character table');

  // Roll Necron Canoptek Trait
  mockElements.traitUnitType.value = 'Canoptek';
  crusade.rollRandomBattleTrait();
  const canoptekNames = crusade.NECRONS_TRAIT_TABLES.Canoptek.map((t) => t.name);
  assert.ok(canoptekNames.includes(crusade.lastRolledItem.trait.name), 'Rolled trait must come from Necron Canoptek table');

  // Roll Necron Legendary Relic
  mockElements.relicTierSelect.value = 'Legendary';
  crusade.rollRandomRelic();
  assert.ok(crusade.lastRolledItem.relic.name.includes('Casket of Heshkefnet'), 'Must roll Casket of Heshkefnet for Necron Legendary Relic');

  // Roll Necron Bespoke Battle Scar
  crusade.rollRandomBattleScar();
  const scarNames = crusade.NECRON_BATTLE_SCAR_TABLE.map((s) => s.name);
  assert.ok(scarNames.includes(crusade.lastRolledItem.scar.name), 'Rolled scar must come from Necron Battle Scar table');

  // Restore pool
  mockElements.forgeSourcePool.value = 'Armageddon';
});

test('crusade: switchCrusadeTab handles Tab 4 Tomb World Awakening Matrix', () => {
  crusade.switchCrusadeTab('tomb', false);
  assert.equal(mockElements.cruTabBoard.classList.contains('hidden'), true);
  assert.equal(mockElements.cruTabForge.classList.contains('hidden'), true);
  assert.equal(mockElements.cruTabTour.classList.contains('hidden'), true);
  assert.equal(mockElements.cruTabTomb.classList.contains('hidden'), false);
  assert.equal(mockElements.cruTabBtn4.classList.contains('active'), true);
  assert.equal(mockElements.cruTabBtn1.classList.contains('active'), false);
  assert.equal(mockElements.cruTabBtn2.classList.contains('active'), false);
  assert.equal(mockElements.cruTabBtn3.classList.contains('active'), false);
});

test('crusade: Tomb World Awakening Matrix point allocation, Master System status, D3 reset, and Power Reserves requisition', () => {
  assert.equal(crusade.TOMB_WORLD_SYSTEMS.length, 3, 'Must define 3 Tomb World Awakening Systems');
  assert.ok(crusade.NECRON_DYNASTIC_VAULT.length >= 8, 'Must define Necron Dynastic Requisitions, Agendas & Master Protocols');

  // Reset Tomb World state
  crusade.getCrusadeState().powerReservesAllocated = false;
  mockElements.powerReservesToggle.checked = false;
  crusade.getCrusadeState().tombSystems = { command: 1, reanimation: 1, translocation: 0 };
  crusade.renderTombAwakeningMatrix();

  assert.equal(mockElements.tombMatrixAllocatedLabel.textContent, '2 / 3');
  assert.ok(mockElements.tombMasterStatusVal.textContent.includes('AWAKENING'));

  // Allocate 3rd point to translocation -> reaches 3 / 3 Master Systems Online
  crusade.adjTombSystemPt('translocation', 1);
  assert.equal(crusade.getCrusadeState().tombSystems.translocation, 1);
  assert.equal(mockElements.tombMatrixAllocatedLabel.textContent, '3 / 3');
  assert.ok(mockElements.tombMasterStatusVal.textContent.includes('MASTER ONLINE'));

  // Cannot exceed 3 total points without Power Reserves Allocated requisition
  crusade.adjTombSystemPt('command', 1);
  assert.equal(crusade.getCrusadeState().tombSystems.command, 1, 'Cannot exceed 3 total Awakening Points without Power Reserves');

  // Toggle Power Reserves Allocated (1 RP) -> expands capacity to 4
  mockElements.powerReservesToggle.checked = true;
  crusade.togglePowerReserves();
  assert.equal(crusade.getCrusadeState().powerReservesAllocated, true);
  assert.equal(mockElements.tombMatrixAllocatedLabel.textContent, '3 / 4');

  // Now we can allocate 1 more point
  crusade.adjTombSystemPt('command', 1);
  assert.equal(crusade.getCrusadeState().tombSystems.command, 2);
  assert.equal(mockElements.tombMatrixAllocatedLabel.textContent, '4 / 4');

  // Trigger Master System D3 Reset -> unassigns 1..3 Awakening Points and increments cycle counter
  const prevTotal = Object.values(crusade.getCrusadeState().tombSystems).reduce((a, b) => a + b, 0);
  crusade.rollMasterSystemReset();
  const nextTotal = Object.values(crusade.getCrusadeState().tombSystems).reduce((a, b) => a + b, 0);
  assert.ok(nextTotal < prevTotal && nextTotal >= 0, 'rollMasterSystemReset must deduct D3 Awakening Points');

  // Adjust Tomb counters (tombAgendasCompleted, tombAwakeningCycles)
  crusade.adjTombField('tombAgendasCompleted', 3);
  assert.equal(crusade.getCrusadeState().tombAgendasCompleted, 3);
  assert.equal(mockElements.tombAgendasCompleted.textContent, '3');
  crusade.adjTombField('tombAgendasCompleted', -10);
  assert.equal(crusade.getCrusadeState().tombAgendasCompleted, 0);
});

test('crusade: Necron Dynastic Vault selection, attachNecronVaultToDossier, and Tomb World Awakening Dispatch transmission', () => {
  crusade.populateNecronDynasticVault();
  assert.ok(mockElements.necronVaultSelect.innerHTML.includes('Viral Vectors'));
  assert.ok(mockElements.necronVaultSelect.innerHTML.includes('The Slow Decay of Self'));

  mockElements.necronVaultSelect.value = 'viral_vectors';
  crusade.renderSelectedNecronVaultPreview();
  assert.ok(mockElements.necronVaultPreviewBox.innerHTML.includes('Flayed Ones'));

  mockElements.necronRecipientUnit.value = 'Immortal Phalanx #2';
  const prevLen = crusade.getCrusadeState().queuedRolls.length;
  crusade.attachNecronVaultToDossier();
  assert.equal(crusade.getCrusadeState().queuedRolls.length, prevLen + 1);
  assert.equal(crusade.getCrusadeState().queuedRolls[crusade.getCrusadeState().queuedRolls.length - 1].unit, 'Immortal Phalanx #2');
  assert.equal(crusade.getCrusadeState().activeTab, 'forge');

  // Verify Tomb Matrix telemetry in Beta Master Dossier and Tomb Awakening Dispatch
  crusade.getCrusadeState().tombSystems = { command: 2, reanimation: 1, translocation: 0 };
  crusade.getCrusadeState().tombAgendasCompleted = 4;
  crusade.getCrusadeState().tombAwakeningCycles = 1;
  mockElements.tombAwakeningNotes.value = 'Cryptek Conclave routing power to Command and Reanimation nodes beneath Golgotha.';

  const summary = crusade.buildTombMatrixSummaryLine();
  assert.ok(summary.includes('Command: 2'));
  assert.ok(summary.includes('Reanimation: 1'));
  assert.ok(summary.includes('Translocation: 0'));
  assert.ok(summary.includes('MASTER ONLINE'));

  // Beta Master Battle Dossier includes Tomb World Awakening Matrix Telemetry
  mockElements.dossierChannel.value = 'beta';
  mockElements.dossierModeNode.value = 'Mode 1: Co-op Horde Breach // Node 0 (Golgotha Arbor-Basin)';
  const betaMaster = crusade.buildMasterDossierString();
  assert.ok(betaMaster.includes('TOMB WORLD AWAKENING MATRIX TELEMETRY:'));

  // Dedicated Tomb World Awakening Dispatch
  crusade.updateTombAwakeningPreview();
  const dispatch = crusade.buildTombAwakeningDossierString();
  assert.equal(mockElements.tombAwakeningPreviewBox.textContent, dispatch);
  assert.ok(dispatch.includes('+++ CRYPTEK CONCLAVE // TOMB WORLD AWAKENING MATRIX DISPATCH +++'));
  assert.ok(dispatch.includes('LORD COMMANDER JUNEBUG'));
  assert.ok(dispatch.includes('Cryptek Conclave routing power to Command and Reanimation nodes'));

  transmittedChannel = null;
  transmittedPayload = null;
  crusade.transmitTombAwakeningDossier();
  assert.equal(transmittedChannel, 'beta');
  assert.equal(transmittedPayload, dispatch);
});

test('crusade: resetTombAwakeningTab resets Tomb World Awakening tab state, centers stat cards & buttons, and keeps Tour of Duty tab in Militarum color', () => {
  // 1. Verify resetTombAwakeningTab button exists in HTML and function is exported
  assert.ok(
    crusadeHtml.includes('resetTombAwakeningTab()'),
    'pages/crusade.html must include a Reset button calling resetTombAwakeningTab() in #cruTabTomb'
  );
  assert.equal(typeof crusade.resetTombAwakeningTab, 'function', 'Must define resetTombAwakeningTab function');

  // Dirty up Tomb World Awakening state
  crusade.getCrusadeState().tombAgendasCompleted = 5;
  crusade.getCrusadeState().tombAwakeningCycles = 3;
  crusade.getCrusadeState().powerReservesAllocated = true;
  crusade.getCrusadeState().tombSystems = { command: 3, reanimation: 1, translocation: 0 };
  mockElements.powerReservesToggle.checked = true;
  mockElements.necronRecipientUnit.value = 'Doomsday Ark #1';
  mockElements.tombAwakeningNotes.value = 'Custom Cryptek notes to be reset.';
  mockElements.tombResetNotice.innerHTML = 'Master System Surge!';

  // Execute resetTombAwakeningTab()
  crusade.resetTombAwakeningTab();

  assert.equal(crusade.getCrusadeState().tombAgendasCompleted, 0);
  assert.equal(crusade.getCrusadeState().tombAwakeningCycles, 0);
  assert.equal(crusade.getCrusadeState().powerReservesAllocated, false);
  assert.deepEqual(crusade.getCrusadeState().tombSystems, { command: 0, reanimation: 0, translocation: 0 });
  assert.equal(mockElements.tombAgendasCompleted.textContent, '0');
  assert.equal(mockElements.tombAwakeningCycles.textContent, '0');
  assert.equal(mockElements.powerReservesToggle.checked, false);
  assert.equal(mockElements.necronRecipientUnit.value, '');
  assert.equal(mockElements.tombAwakeningNotes.value, '');
  assert.equal(mockElements.tombMatrixAllocatedLabel.textContent, '0 / 3');
  assert.ok(mockElements.tombMasterStatusVal.textContent.includes('DORMANT STASIS'));

  // 2. Verify centered stat cards and centered button rows in #cruTabTomb
  assert.ok(
    crusadeHtml.includes('stat-card-centered') && crusadeHtml.includes('justify-content:center'),
    'pages/crusade.html must center stat cards and button rows in Tomb World Awakening tab'
  );

  // 3. Verify Tour of Duty tab (#cruTabTour) always keeps Militarum color scheme (like vox.html)
  crusade.switchCrusadeTab('tomb', false);
  assert.equal(mockDocument.body.classList.contains('theme-necron'), true, 'Switching to Tomb World tab activates theme-necron');
  assert.equal(mockDocument.body.classList.contains('theme-militarum'), false);

  crusade.switchCrusadeTab('tour', false);
  assert.equal(mockDocument.body.classList.contains('theme-militarum'), true, 'Switching to Tour of Duty tab always activates Militarum color mode (theme-militarum)');
  assert.equal(mockDocument.body.classList.contains('theme-necron'), false, 'Switching to Tour of Duty tab removes theme-necron');
  assert.ok(
    crusadeHtml.includes('#cruTabTour') && crusadeHtml.includes('#cruTabBtn3.active'),
    'pages/crusade.html must include explicit Militarum color styling for #cruTabTour and #cruTabBtn3.active'
  );
});





````

---

## File: `tests/ui/vox.test.js` <a id="file-testsuivoxtestjs"></a>

````javascript
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '../../');
const VOX_HTML_PATH = path.join(ROOT_DIR, 'pages/vox.html');

// Read vox.html and extract script block
const voxHtml = fs.readFileSync(VOX_HTML_PATH, 'utf8');
const scriptMatches = voxHtml.match(/<script>([\s\S]*?)<\/script>/);
assert.ok(scriptMatches && scriptMatches[1], 'Must locate script tag inside pages/vox.html');
const voxScriptCode = scriptMatches[1];

// Set up mock DOM and sessionStorage environment
const sessionStore = new Map();
const mockSessionStorage = {
  getItem: (k) => (sessionStore.has(k) ? sessionStore.get(k) : null),
  setItem: (k, v) => sessionStore.set(k, String(v)),
  removeItem: (k) => sessionStore.delete(k),
  clear: () => sessionStore.clear()
};

function createMockClassList() {
  const classes = new Set();
  return {
    add: (c) => classes.add(c),
    remove: (c) => classes.delete(c),
    toggle: (c, force) => {
      if (force === undefined) {
        if (classes.has(c)) classes.delete(c);
        else classes.add(c);
      } else if (force) {
        classes.add(c);
      } else {
        classes.delete(c);
      }
    },
    contains: (c) => classes.has(c)
  };
}

function createMockBox() {
  const box = {
    _innerHTML: '',
    children: [],
    dataset: {},
    scrollTop: 0,
    scrollHeight: 100,
    get innerHTML() { return this._innerHTML; },
    set innerHTML(v) {
      this._innerHTML = v;
      if (v === '') this.children = [];
    },
    appendChild: (c) => { box.children.push(c); return c; }
  };
  return box;
}

const mockElements = {
  authScreen: { classList: createMockClassList() },
  terminalScreen: { classList: createMockClassList() },
  sealStatusBadge: { innerHTML: '', textContent: '' },
  sealSubtitle: { innerHTML: '', textContent: '' },
  passLabel: { textContent: '' },
  sealActionBtn: { textContent: '' },
  cardAlpha: { classList: createMockClassList() },
  cardBeta: { classList: createMockClassList() },
  passInput: { value: '' },
  authErrorMsg: { textContent: '', classList: createMockClassList() },
  activeConduitLabel: { textContent: '' },
  pendingDossierNotice: { classList: createMockClassList() },
  subWinDirect: { classList: createMockClassList() },
  subWinInterferences: { classList: createMockClassList() },
  winBtn1: { classList: createMockClassList() },
  winBtn2: { classList: createMockClassList() },
  directMessagesBox: createMockBox(),
  interferencesBox: createMockBox(),
  interferenceCountBadge: { textContent: '' },
  questionInput: { value: '' },
  serverStatusBadge: { innerHTML: '', textContent: '', classList: createMockClassList() },
  terminalServerStatusLabel: { textContent: '', style: {} }
};

const mockDocument = {
  body: {
    dataset: {},
    classList: createMockClassList()
  },
  getElementById: (id) => mockElements[id] || null,
  createElement: (tag) => {
    let _text = '';
    const el = {
      tagName: tag.toUpperCase(),
      className: '',
      style: {},
      dataset: {},
      get textContent() { return _text; },
      set textContent(v) { _text = v; this.innerHTML = v; },
      innerHTML: '',
      children: [],
      classList: createMockClassList(),
      appendChild: (c) => { el.children.push(c); return c; },
      querySelector: (sel) => {
        const dummy = {
          tagName: 'DIV',
          className: sel.replace('.', ''),
          style: {},
          dataset: {},
          textContent: '',
          innerHTML: '',
          appendChild: () => ({}),
          closest: () => ({ scrollTop: 0, scrollHeight: 100 })
        };
        el.children.push(dummy);
        return dummy;
      },
      closest: () => ({ scrollTop: 0, scrollHeight: 100 })
    };
    return el;
  }
};

let tickEvents = [];
let stampPlayed = false;

const mockWindow = {
  addEventListener: () => {},
  VoxAudio: {
    playTeletypeTick: (mode) => tickEvents.push(mode),
    playDossierStamp: () => { stampPlayed = true; },
    playScarHazard: () => {}
  }
};

// RPC mock results
const rpcCalls = [];
let mockMessages = [];
let mockInterferences = [];
let mockServerHeartbeat = { status: 'online', updatedAt: Date.now() };
let mockRpcHandler = async (fnName, params) => {
  rpcCalls.push({ fnName, params });
  if (fnName === 'check_channel_seal') return true;
  if (fnName === 'unlock_or_seal_channel') return { ok: true };
  if (fnName === 'send_vox_message') return { ok: true };
  if (fnName === 'delete_vox_entry') return { ok: true };
  if (fnName === 'get_vox_terminal_data') return { ok: true, messages: mockMessages, interferences: mockInterferences };
  if (fnName === 'get_shared_spawn_pools') {
    return {
      ok: true,
      horde_pool: {},
      nemesis_status: {
        vox_server_heartbeat: mockServerHeartbeat
      }
    };
  }
  return null;
};

// Evaluate script in mock environment
const evalFn = new Function(
  'document',
  'window',
  'sessionStorage',
  'fetch',
  'console',
  'setInterval',
  'clearInterval',
  'setTimeout',
  `${voxScriptCode}; return {
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    SEEN_IDS_STORAGE_KEY,
    SESSION_AUTH_KEY,
    checkPendingDossierBuffer,
    selectConduit,
    handleSealAction,
    flushPendingDossierIfAny,
    streamTextIntoElement,
    formatRedactedHtml,
    switchSubWindow,
    extractDynamicReplyCardMeta,
    formatTime,
    purgeVoxEntry,
    refreshTerminal,
    toggleOlderMessages,
    toggleOlderInterferences,
    lockTerminal,
    initVoxTerminalPage,
    getSelectedChannel: () => selectedChannel,
    getActivePassphrase: () => activePassphrase,
    getShowAllOlderMessages: () => showAllOlderMessages,
    getShowAllOlderInterferences: () => showAllOlderInterferences,
    isRogueSectorInterference: (typeof isRogueSectorInterference === 'function' ? isRogueSectorInterference : null),
    isVoxServerOnline: (typeof isVoxServerOnline === 'function' ? isVoxServerOnline : null),
    checkVoxServerStatus: (typeof checkVoxServerStatus === 'function' ? checkVoxServerStatus : null)
  };`
);

const vox = evalFn(
  mockDocument,
  mockWindow,
  mockSessionStorage,
  async (url, opts) => {
    const parts = url.split('/rpc/');
    const fnName = parts[1];
    const params = opts && opts.body ? JSON.parse(opts.body) : {};
    const res = await mockRpcHandler(fnName, params);
    return {
      ok: true,
      json: async () => res
    };
  },
  console,
  (fn, ms) => 1234,
  (id) => {},
  (fn, ms) => 5678
);

test('vox: checkPendingDossierBuffer detects pending dossier payload from sessionStorage', () => {
  sessionStore.clear();
  assert.equal(vox.checkPendingDossierBuffer(), null);
  assert.equal(mockElements.pendingDossierNotice.classList.contains('hidden'), true);

  const payload = {
    channel: 'beta',
    text: '+++ ORDO MALLEUS DOSSIER TRANSMISSION +++',
    queuedAt: Date.now()
  };
  sessionStore.set('foa_pending_vox_payload', JSON.stringify(payload));

  const detected = vox.checkPendingDossierBuffer();
  assert.ok(detected, 'Must detect pending dossier from sessionStorage');
  assert.equal(detected.channel, 'beta');
  assert.equal(detected.text, payload.text);
  assert.equal(mockElements.pendingDossierNotice.classList.contains('hidden'), false);
});

test('vox: checkPendingDossierBuffer formats target description for distant intercept payload', () => {
  sessionStore.clear();
  const payload = {
    channel: 'distant',
    text: '+++ ORBITAL AUGUR ARRAY // DISTANT WARP-BREACH ADVERSARY DETECTED +++',
    queuedAt: Date.now()
  };
  sessionStore.set('foa_pending_vox_payload', JSON.stringify(payload));

  const detected = vox.checkPendingDossierBuffer();
  assert.ok(detected, 'Must detect pending distant intercept dossier');
  assert.equal(detected.channel, 'distant');
  assert.ok(mockElements.pendingDossierNotice.innerHTML.includes('Distant Intercept // Orbital Augur Array'));
  assert.ok(mockElements.pendingDossierNotice.innerHTML.includes('Neither Main Player Fielded'));
});

test('vox: selectConduit toggles selected channel and updates UI elements', async () => {
  await vox.selectConduit('beta');
  assert.equal(vox.getSelectedChannel(), 'beta');
  assert.equal(mockElements.cardBeta.classList.contains('selected'), true);
  assert.equal(mockElements.cardAlpha.classList.contains('selected'), false);

  await vox.selectConduit('alpha');
  assert.equal(vox.getSelectedChannel(), 'alpha');
  assert.equal(mockElements.cardAlpha.classList.contains('selected'), true);
  assert.equal(mockElements.cardBeta.classList.contains('selected'), false);
});

test('vox: switchSubWindow toggles Direct vs Interferences monitors', () => {
  vox.switchSubWindow('interferences');
  assert.equal(mockElements.subWinDirect.classList.contains('hidden'), true);
  assert.equal(mockElements.subWinInterferences.classList.contains('hidden'), false);
  assert.equal(mockElements.winBtn2.classList.contains('active'), true);
  assert.equal(mockElements.winBtn1.classList.contains('active'), false);

  vox.switchSubWindow('direct');
  assert.equal(mockElements.subWinDirect.classList.contains('hidden'), false);
  assert.equal(mockElements.subWinInterferences.classList.contains('hidden'), true);
  assert.equal(mockElements.winBtn1.classList.contains('active'), true);
  assert.equal(mockElements.winBtn2.classList.contains('active'), false);
});

test('vox: formatRedactedHtml replaces [REDACTED] with styled censor-bar', () => {
  const input = 'Hostile intercepted near [REDACTED] hive node.';
  const output = vox.formatRedactedHtml(input);
  assert.ok(output.includes('<span class="censor-bar">▓▓REDACTED▓▓</span>'));
  assert.ok(!output.includes('[REDACTED]'));
});

test('vox: handleSealAction validates passphrase, authenticates, and unlocks terminal', async () => {
  mockElements.passInput.value = 'ab'; // Too short
  await vox.handleSealAction();
  assert.equal(mockElements.authErrorMsg.textContent, 'Passphrase must be at least 3 characters.');
  assert.equal(mockElements.authErrorMsg.classList.contains('hidden'), false);

  // Valid passphrase
  mockElements.passInput.value = 'VermilionKey99';
  await vox.handleSealAction();

  assert.equal(vox.getActivePassphrase(), 'VermilionKey99');
  assert.equal(mockElements.authScreen.classList.contains('hidden'), true);
  assert.equal(mockElements.terminalScreen.classList.contains('hidden'), false);

  const storedAuth = sessionStore.get(vox.SESSION_AUTH_KEY);
  assert.ok(storedAuth, 'Must store active session in sessionStorage');
  assert.equal(JSON.parse(storedAuth).pass, 'VermilionKey99');
});

test('vox: flushPendingDossierIfAny transmits queued payload and clears sessionStorage buffer', async () => {
  sessionStore.clear();
  const testPayload = {
    channel: 'alpha',
    text: '+++ COMPILER TRANSMISSION TO CAMPAIGN MASTER +++',
    queuedAt: Date.now()
  };
  sessionStore.set('foa_pending_vox_payload', JSON.stringify(testPayload));

  rpcCalls.length = 0;
  await vox.flushPendingDossierIfAny();

  assert.equal(sessionStore.has('foa_pending_vox_payload'), false, 'Must clear pending payload buffer');
  const sendCall = rpcCalls.find(c => c.fnName === 'send_vox_message');
  assert.ok(sendCall, 'Must invoke send_vox_message RPC endpoint');
  assert.equal(sendCall.params.p_channel, 'alpha');
  assert.equal(sendCall.params.p_question, testPayload.text);
});

test('vox: flushPendingDossierIfAny routes distant intercept with Orbital Augur Array sender', async () => {
  mockElements.passInput.value = 'VermilionKey99';
  await vox.handleSealAction();

  const testPayload = {
    channel: 'distant',
    text: '+++ ORBITAL AUGUR ARRAY // DISTANT WARP-BREACH ADVERSARY DETECTED +++\n• THEATRE & SENSOR SWEEP: Distant Sector Grid 2',
    queuedAt: Date.now()
  };
  sessionStore.set('foa_pending_vox_payload', JSON.stringify(testPayload));

  rpcCalls.length = 0;
  await vox.flushPendingDossierIfAny();

  assert.equal(sessionStore.has('foa_pending_vox_payload'), false, 'Must clear pending payload buffer');
  const sendCall = rpcCalls.find(c => c.fnName === 'send_vox_message');
  assert.ok(sendCall, 'Must invoke send_vox_message RPC endpoint');
  assert.equal(sendCall.params.p_sender, '🛰️ Orbital Augur Array // Distant Intercept');
  assert.ok(sendCall.params.p_question.includes('DISTANT WARP-BREACH ADVERSARY DETECTED'));
});

test('vox: lockTerminal clears passphrase and hides terminal screen', () => {
  vox.lockTerminal();
  assert.equal(vox.getActivePassphrase(), null);
  assert.equal(sessionStore.has(vox.SESSION_AUTH_KEY), false);
  assert.equal(mockElements.terminalScreen.classList.contains('hidden'), true);
  assert.equal(mockElements.authScreen.classList.contains('hidden'), false);
  assert.equal(vox.getShowAllOlderMessages(), false, 'Must reset showAllOlderMessages on lock');
});

test('vox: refreshTerminal shows only past 3 messages by default and toggles older messages on demand', async () => {
  // Authenticate first
  mockElements.passInput.value = 'VermilionKey99';
  await vox.handleSealAction();

  // Populate 5 mock messages
  mockMessages = [
    { id: 'm1', channel: 'alpha', sender: 'The Exile', question: 'Q1', reply: 'A1', status: 'answered' },
    { id: 'm2', channel: 'alpha', sender: 'The Exile', question: 'Q2', reply: 'A2', status: 'answered' },
    { id: 'm3', channel: 'alpha', sender: 'The Exile', question: 'Q3', reply: 'A3', status: 'answered' },
    { id: 'm4', channel: 'alpha', sender: 'The Exile', question: 'Q4', reply: 'A4', status: 'answered' },
    { id: 'm5', channel: 'alpha', sender: 'The Exile', question: 'Q5', reply: 'A5', status: 'answered' }
  ];

  // Refresh terminal with default settings
  await vox.refreshTerminal(false);

  // When more than 3 messages exist, children should include the toggle bar + 3 exchange wraps
  assert.equal(vox.getShowAllOlderMessages(), false);
  assert.equal(mockElements.directMessagesBox.children.length, 4, 'Must have 1 toggle bar + 3 message wraps');

  // Verify the toggle button text
  const toggleBar = mockElements.directMessagesBox.children[0];
  assert.ok(toggleBar.className.includes('crt-older-bar'));
  const olderBtn = toggleBar.children[0];
  assert.ok(olderBtn.textContent.includes('See Older Messages (2 older)'));

  // Toggle to expand all messages
  vox.toggleOlderMessages();
  await vox.refreshTerminal(false);

  assert.equal(vox.getShowAllOlderMessages(), true);
  // Now all 5 messages plus the toggle bar should be rendered (1 + 5 = 6)
  assert.equal(mockElements.directMessagesBox.children.length, 6, 'Must render all 5 messages + toggle bar');
  const expandedToggleBar = mockElements.directMessagesBox.children[0];
  assert.ok(expandedToggleBar.children[0].textContent.includes('Collapse to Recent 3 Messages'));

  // Toggle back to collapse
  vox.toggleOlderMessages();
  await vox.refreshTerminal(false);

  assert.equal(vox.getShowAllOlderMessages(), false);
  assert.equal(mockElements.directMessagesBox.children.length, 4, 'Must collapse back to 3 messages + toggle bar');
  const collapsedToggleBar = mockElements.directMessagesBox.children[0];
  assert.ok(collapsedToggleBar.children[0].textContent.includes('See Older Messages (2 older)'));
});

test('vox: refreshTerminal hides old interferences by default and toggles on demand', async () => {
  // Authenticate first
  mockElements.passInput.value = 'VermilionKey99';
  await vox.handleSealAction();

  // Populate 5 mock interferences
  mockInterferences = [
    { id: 'int1', origin_hint: 'SECTOR-1', redacted_text: 'Fragment [REDACTED] alpha', created_at: Date.now() - 50000 },
    { id: 'int2', origin_hint: 'SECTOR-2', redacted_text: 'Fragment [REDACTED] beta', created_at: Date.now() - 40000 },
    { id: 'int3 =', origin_hint: 'SECTOR-3', redacted_text: 'Fragment [REDACTED] gamma', created_at: Date.now() - 30000 },
    { id: 'int4', origin_hint: 'SECTOR-4', redacted_text: 'Fragment [REDACTED] delta', created_at: Date.now() - 20000 },
    { id: 'int5', origin_hint: 'SECTOR-5', redacted_text: 'Fragment [REDACTED] epsilon', created_at: Date.now() - 10000 }
  ];

  await vox.refreshTerminal(false);

  // When > 3 interferences exist, should have 1 toggle bar + 3 visible cards
  assert.equal(vox.getShowAllOlderInterferences(), false);
  assert.equal(mockElements.interferencesBox.children.length, 4, 'Must render 1 toggle bar + 3 most recent interferences');

  const intToggleBar = mockElements.interferencesBox.children[0];
  assert.ok(intToggleBar.className.includes('crt-older-bar'));
  assert.ok(intToggleBar.children[0].textContent.includes('See Older Interferences (2 older)'));

  // Toggle to expand all
  vox.toggleOlderInterferences();
  await vox.refreshTerminal(false);

  assert.equal(vox.getShowAllOlderInterferences(), true);
  assert.equal(mockElements.interferencesBox.children.length, 6, 'Must render all 5 interferences + toggle bar');
  const expandedBar = mockElements.interferencesBox.children[0];
  assert.ok(expandedBar.children[0].textContent.includes('Collapse to Recent 3 Psychic Bleeds'));

  // Toggle back to collapse / hide old interferences
  vox.toggleOlderInterferences();
  await vox.refreshTerminal(false);

  assert.equal(vox.getShowAllOlderInterferences(), false);
  assert.equal(mockElements.interferencesBox.children.length, 4, 'Must collapse back to 3 interferences + toggle bar');
});

test('vox: extractDynamicReplyCardMeta parses explicit titles, banner headers, mid-text keywords, and fallbacks', () => {
  const fallback = '++ CAMPAIGN MASTER // SEGMENTUM SOLAR COMMAND ++';

  // 1. Null / undefined / empty
  assert.deepEqual(vox.extractDynamicReplyCardMeta(null), { cardTitle: fallback, cleanBody: '' });
  assert.deepEqual(vox.extractDynamicReplyCardMeta(''), { cardTitle: fallback, cleanBody: '' });

  // 2. Explicit [CARD_TITLE: ...]
  const explicitRes = vox.extractDynamicReplyCardMeta('[CARD_TITLE: Logis-Prefect Vane]\n+++ HULL INTEGRITY: 100% +++');
  assert.equal(explicitRes.cardTitle, '++ LOGIS-PREFECT VANE ++');
  assert.equal(explicitRes.cleanBody, '+++ HULL INTEGRITY: 100% +++');

  // 3. Canonical +++ BANNER +++ on first line
  const bannerRes = vox.extractDynamicReplyCardMeta('+++ ASTROPATHIC CONDUIT: HIGH COMMAND +++\n\nRouting verified. State query.');
  assert.equal(bannerRes.cardTitle, '++ ASTROPATHIC CONDUIT: HIGH COMMAND ++');
  assert.equal(bannerRes.cleanBody, 'Routing verified. State query.');

  // 4. Canonical ++ BANNER ++ on first line
  const doublePlusRes = vox.extractDynamicReplyCardMeta('++ COGITATOR DECK-44 ++\n\nSystems operational.');
  assert.equal(doublePlusRes.cardTitle, '++ COGITATOR DECK-44 ++');
  assert.equal(doublePlusRes.cleanBody, 'Systems operational.');

  // 5. Mid-text fallback inference for Ashen Spirit / MU-TH-UR / Deck 44
  const midTextRes = vox.extractDynamicReplyCardMeta('The Ashen Spirit stirs beneath the bulkheads...');
  assert.equal(midTextRes.cardTitle, '++ ASHEN SPIRIT LOGIC CORE // DECK 44 COGITATOR ++');
  assert.equal(midTextRes.cleanBody, 'The Ashen Spirit stirs beneath the bulkheads...');

  // 6. Generic prose without banners
  const genericRes = vox.extractDynamicReplyCardMeta('Standard battlefield communique received.');
  assert.equal(genericRes.cardTitle, fallback);
  assert.equal(genericRes.cleanBody, 'Standard battlefield communique received.');
});

test('vox: refreshTerminal uses dynamic reply card title and avoids duplicating banner in body', async () => {
  mockElements.passInput.value = 'VermilionKey99';
  await vox.handleSealAction();

  mockMessages = [
    {
      id: 'm_dyn_1',
      channel: 'alpha',
      sender: 'The Exile',
      question: 'Status report',
      reply: '+++ ORBITAL LOGIS SCAN +++\nPerimeter is secure across Sector 0.',
      status: 'answered'
    }
  ];

  await vox.refreshTerminal(false);
  // Reset signature and refresh so seenToken causes immediate synchronous textContent assignment
  mockElements.directMessagesBox.dataset.sig = '';
  await vox.refreshTerminal(false);

  // Exchange wrap contains 1 player card + 1 reply card
  const exchangeWrap = mockElements.directMessagesBox.children[0];
  assert.equal(exchangeWrap.children.length, 2);

  const replyCard = exchangeWrap.children[1];
  assert.ok(replyCard.className.includes('crt-reply-card'));
  assert.ok(replyCard.innerHTML.includes('++ ORBITAL LOGIS SCAN ++'), 'Must render extracted dynamic title');
  assert.ok(!replyCard.innerHTML.includes('SEGMENTUM SOLAR COMMAND'), 'Must not use fallback title when banner is present');

  const rBody = replyCard.children[0];
  assert.ok(rBody.textContent.includes('Perimeter is secure across Sector 0.'));
  assert.ok(!rBody.textContent.includes('+++ ORBITAL LOGIS SCAN +++'), 'Must strip first header banner line from clean body');
});

test('vox: cards render [ ✕ PURGE ] button in meta bar for direct messages, replies, and interferences', async () => {
  mockElements.passInput.value = 'VermilionKey99';
  await vox.handleSealAction();

  mockMessages = [
    {
      id: 'm_purge_1',
      channel: 'alpha',
      sender: 'The Exile',
      question: 'Testing purge button visibility',
      reply: '+++ HIGH COMMAND +++\nOrders acknowledged.',
      status: 'answered',
      created_at: '2026-10-22T10:00:00Z',
      answered_at: '2026-10-22T10:01:00Z'
    }
  ];

  mockInterferences = [
    {
      id: 'int_purge_1',
      target_channel: 'alpha',
      origin_hint: 'RIVAL PSYCHIC ECHO',
      redacted_text: 'Secret warband moving toward [REDACTED]',
      created_at: '2026-10-22T10:05:00Z'
    }
  ];

  mockElements.directMessagesBox.dataset.sig = '';
  mockElements.interferencesBox.dataset.sig = '';
  await vox.refreshTerminal(false);

  const exchangeWrap = mockElements.directMessagesBox.children[0];
  assert.ok(exchangeWrap, 'Direct messages box must contain exchange wrap');
  const msgCard = exchangeWrap.children[0];
  assert.ok(msgCard.innerHTML.includes('crt-purge-btn'), 'Direct message must include crt-purge-btn');
  assert.ok(msgCard.innerHTML.includes("purgeVoxEntry('m_purge_1', 'message')"), 'Direct message card must wire onclick to purgeVoxEntry');
  assert.ok(msgCard.innerHTML.includes('✕ PURGE'), 'Must render purge button label');

  const replyCard = exchangeWrap.children[1];
  assert.ok(replyCard.innerHTML.includes('crt-purge-btn'), 'Reply card must include crt-purge-btn');
  assert.ok(replyCard.innerHTML.includes("purgeVoxEntry('m_purge_1', 'message')"), 'Reply card must wire onclick to purgeVoxEntry');

  const intCard = mockElements.interferencesBox.children[0];
  assert.ok(intCard, 'Interferences box must contain intercept card');
  assert.ok(intCard.innerHTML.includes('crt-purge-btn'), 'Interferences must include crt-purge-btn');
  assert.ok(intCard.innerHTML.includes("purgeVoxEntry('int_purge_1', 'interference')"), 'Interference card must wire onclick to purgeVoxEntry');
});

test('vox: purgeVoxEntry confirms, triggers SFX, calls delete_vox_entry RPC, and refreshes terminal', async () => {
  mockElements.passInput.value = 'VermilionKey99';
  await vox.handleSealAction();

  rpcCalls.length = 0;
  mockWindow.confirm = () => true;

  await vox.purgeVoxEntry('m_purge_1', 'message');

  const deleteRpc = rpcCalls.find(c => c.fnName === 'delete_vox_entry');
  assert.ok(deleteRpc, 'Must invoke delete_vox_entry RPC');
  assert.equal(deleteRpc.params.p_channel, 'alpha');
  assert.equal(deleteRpc.params.p_passphrase, 'VermilionKey99');
  assert.equal(deleteRpc.params.p_entry_id, 'm_purge_1');
  assert.equal(deleteRpc.params.p_entry_type, 'message');

  // Verify refusal / cancel in confirm prompt aborts RPC
  rpcCalls.length = 0;
  mockWindow.confirm = () => false;
  await vox.purgeVoxEntry('int_purge_2', 'interference');
  assert.equal(rpcCalls.some(c => c.fnName === 'delete_vox_entry'), false, 'Cancelled confirm must not trigger RPC');
});

test('vox: streamTextIntoElement uses elapsed-time teletype engine, sets dataset metadata, and finishes on click', () => {
  tickEvents = [];
  const targetEl = mockDocument.createElement('div');

  vox.streamTextIntoElement(targetEl, 'Commander Beta\'s transmission received.', false);

  assert.equal(targetEl.dataset.fullText, 'Commander Beta\'s transmission received.');
  assert.equal(targetEl.dataset.isRedacted, '0');
  assert.equal(targetEl.dataset.streaming, '1');
  assert.ok(tickEvents.includes('incoming'), 'Must trigger incoming teletype tick');
  assert.equal(typeof targetEl.onclick, 'function', 'Must attach onclick handler to finish streaming on click');

  // Clicking anywhere on the streaming element finishes it immediately
  targetEl.onclick();
  assert.equal(targetEl.dataset.streaming, '0');
  assert.equal(targetEl.textContent, 'Commander Beta\'s transmission received.');

  // Verify redacted mode and click-to-finish
  const redactedEl = mockDocument.createElement('div');
  vox.streamTextIntoElement(redactedEl, 'Target: [REDACTED]', true);
  assert.equal(redactedEl.dataset.isRedacted, '1');
  redactedEl.onclick();
  assert.equal(redactedEl.dataset.streaming, '0');
  assert.ok(redactedEl.innerHTML.includes('censor-bar'), 'Redacted stream finish must render censor-bar HTML');
});

test('vox: initVoxTerminalPage strictly enforces terminal password when pending payload is present, preventing password bypass', async () => {
  sessionStore.clear();
  vox.lockTerminal();

  // Simulate an active session from a previous unlock
  sessionStore.set(vox.SESSION_AUTH_KEY, JSON.stringify({ channel: 'beta', pass: 'PriorSecretPass' }));

  // Simulate a pending transmission queued from pvp, roster, crusade, or spawner
  const testPayload = {
    channel: 'beta',
    text: '+++ ORDO MALLEUS NEMESIS INDUCTION DOSSIER +++',
    queuedAt: Date.now()
  };
  sessionStore.set('foa_pending_vox_payload', JSON.stringify(testPayload));

  // Run initVoxTerminalPage
  await vox.initVoxTerminalPage();

  // Terminal MUST NOT be unlocked automatically
  assert.equal(mockElements.terminalScreen.classList.contains('hidden'), true, 'Terminal screen must remain hidden');
  assert.equal(mockElements.authScreen.classList.contains('hidden'), false, 'Auth screen must remain visible');
  assert.equal(vox.getActivePassphrase(), null, 'Active passphrase must remain null until explicitly authenticated');
  assert.equal(sessionStore.has(vox.SESSION_AUTH_KEY), false, 'Active session must be cleared to enforce password entry');
  assert.equal(vox.getSelectedChannel(), 'beta', 'Target channel must be matched from pending payload');
  assert.equal(mockElements.pendingDossierNotice.classList.contains('hidden'), false, 'Pending dossier banner must be shown');
  assert.equal(mockElements.passInput.value, '', 'Pass input must not be auto-filled');
});

test('vox: initVoxTerminalPage restores saved session only when no pending payload awaits authorization', async () => {
  sessionStore.clear();
  vox.lockTerminal();

  // Active session with NO pending payload
  sessionStore.set(vox.SESSION_AUTH_KEY, JSON.stringify({ channel: 'alpha', pass: 'VermilionKey99' }));

  await vox.initVoxTerminalPage();

  // Should restore session and unlock
  assert.equal(vox.getActivePassphrase(), 'VermilionKey99');
  assert.equal(mockElements.terminalScreen.classList.contains('hidden'), false);
  assert.equal(mockElements.authScreen.classList.contains('hidden'), true);
});

test('vox: renders Rogue Sector dual-channel interferences in a distinct color/class (.rogue-intercept) compared to rival player interferences', async () => {
  assert.equal(typeof vox.isRogueSectorInterference, 'function', 'Must define isRogueSectorInterference helper');
  assert.equal(vox.isRogueSectorInterference({ origin_hint: 'ORBITAL AUGUR ARRAY // PARALLEL SECTOR EVENT' }), true);
  assert.equal(vox.isRogueSectorInterference({ origin_hint: 'RIVAL WARHOST VOX-BLEED (LORD COMMANDER JUNEBUG)' }), false);

  mockElements.passInput.value = 'VermilionKey99';
  await vox.handleSealAction();

  mockInterferences = [
    {
      id: 'int_rival_1',
      target_channel: 'alpha',
      origin_hint: 'RIVAL WARHOST VOX-BLEED (LORD COMMANDER JUNEBUG)',
      redacted_text: 'Rival movement near [REDACTED]',
      created_at: '2026-10-24T14:00:00Z'
    },
    {
      id: 'int_rogue_1',
      target_channel: 'alpha',
      origin_hint: 'ORBITAL AUGUR ARRAY // PARALLEL SECTOR EVENT',
      redacted_text: 'Rogue sector clash near [REDACTED] shifted Warp weather',
      created_at: '2026-10-24T14:05:00Z'
    }
  ];

  mockElements.interferencesBox.dataset.sig = '';
  await vox.refreshTerminal(false);

  assert.equal(mockElements.interferencesBox.children.length, 2);
  const rivalCard = mockElements.interferencesBox.children[0];
  const rogueCard = mockElements.interferencesBox.children[1];

  assert.equal(rivalCard.className, 'crt-intercept-card', 'Rival player intercept must use standard crimson .crt-intercept-card');
  assert.ok(rivalCard.innerHTML.includes('#ff4757'), 'Rival player intercept header must use crimson color');

  assert.ok(rogueCard.className.includes('rogue-intercept'), 'Rogue Sector intercept must include .rogue-intercept class');
  assert.ok(!rogueCard.innerHTML.includes('#ff4757'), 'Rogue Sector intercept header must use a distinct non-crimson color');
  assert.ok(voxHtml.includes('.crt-intercept-card.rogue-intercept'), 'vox.html CSS must define .crt-intercept-card.rogue-intercept');
});

test('vox: displays live Astropathic Server Online/Offline status on both Auth and Terminal screens via checkVoxServerStatus', async () => {
  assert.ok(voxHtml.includes('id="serverStatusBadge"'), 'pages/vox.html must include #serverStatusBadge on authScreen');
  assert.ok(voxHtml.includes('id="terminalServerStatusLabel"'), 'pages/vox.html must include #terminalServerStatusLabel on terminalScreen');
  assert.equal(typeof vox.isVoxServerOnline, 'function', 'Must define isVoxServerOnline helper');
  assert.equal(typeof vox.checkVoxServerStatus, 'function', 'Must define checkVoxServerStatus function');

  const now = 1700000000000;
  // Fresh online heartbeat (10 seconds ago, within 25s window)
  assert.equal(vox.isVoxServerOnline({ status: 'online', updatedAt: now - 10000 }, now), true);
  // Stale heartbeat (30 seconds ago) must be offline even if legacy manualActive flag is true
  assert.equal(vox.isVoxServerOnline({ status: 'online', updatedAt: now - 30000, manualActive: true }, now), false);
  // Stale heartbeat (5 minutes ago)
  assert.equal(vox.isVoxServerOnline({ status: 'online', updatedAt: now - 300000 }, now), false);
  // Explicit offline heartbeat
  assert.equal(vox.isVoxServerOnline({ status: 'offline', updatedAt: now - 1000 }, now), false);

  // Test checkVoxServerStatus when server is ONLINE
  mockServerHeartbeat = { status: 'online', updatedAt: Date.now() };
  const onlineState = await vox.checkVoxServerStatus();
  assert.equal(onlineState, true);
  assert.equal(mockElements.serverStatusBadge.classList.contains('online'), true);
  assert.equal(mockElements.serverStatusBadge.classList.contains('offline'), false);
  assert.ok(mockElements.serverStatusBadge.innerHTML.includes('ONLINE'));
  assert.ok(mockElements.terminalServerStatusLabel.textContent.includes('ONLINE'));

  // Test checkVoxServerStatus when server is OFFLINE
  mockServerHeartbeat = { status: 'offline', updatedAt: Date.now() };
  const offlineState = await vox.checkVoxServerStatus();
  assert.equal(offlineState, false);
  assert.equal(mockElements.serverStatusBadge.classList.contains('offline'), true);
  assert.equal(mockElements.serverStatusBadge.classList.contains('online'), false);
  assert.ok(mockElements.serverStatusBadge.innerHTML.includes('OFFLINE'));
  assert.ok(mockElements.terminalServerStatusLabel.textContent.includes('OFFLINE'));
});

test('vox: selecting and unlocking Terminal Beta vs Terminal Alpha activates Necron vs Militarum personal terminal mode', async () => {
  await vox.selectConduit('beta');
  assert.equal(mockDocument.body.classList.contains('theme-necron'), true, 'Selecting Terminal Beta must activate theme-necron on body');
  assert.equal(mockDocument.body.classList.contains('theme-militarum'), false);

  mockElements.passInput.value = 'JunebugRoyalKey';
  await vox.handleSealAction();
  assert.equal(mockDocument.body.classList.contains('theme-necron'), true, 'Unlocking Terminal Beta must preserve theme-necron');
  assert.ok(mockElements.activeConduitLabel.textContent.includes('LORD COMMANDER JUNEBUG'));

  await vox.selectConduit('alpha');
  assert.equal(mockDocument.body.classList.contains('theme-militarum'), true, 'Selecting Terminal Alpha must activate theme-militarum on body');
  assert.equal(mockDocument.body.classList.contains('theme-necron'), false);

  mockElements.passInput.value = 'VermilionKey99';
  await vox.handleSealAction();
  assert.equal(mockDocument.body.classList.contains('theme-militarum'), true, 'Unlocking Terminal Alpha must preserve theme-militarum');

  // Verify pages/vox.html defines Necron personal terminal styling
  assert.ok(voxHtml.includes('body.theme-necron .crt-monitor-frame'), 'vox.html must style .crt-monitor-frame in Necron Tomb-Ship mode');
  assert.ok(voxHtml.includes('body.theme-necron .crt-msg-card'), 'vox.html must style .crt-msg-card in Necron Tomb-Ship mode');
  assert.ok(voxHtml.includes('body.theme-necron .crt-reply-card'), 'vox.html must style .crt-reply-card in Necron Tomb-Ship mode');
  assert.ok(voxHtml.includes('body.theme-necron .crt-input-textarea'), 'vox.html must style .crt-input-textarea in Necron Tomb-Ship mode');
});


````
