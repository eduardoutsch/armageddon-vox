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
const { hashString, mulberry32, seededShuffle, generateRandomCode } = require('../../js/rng.js');

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

test('generateRandomCode returns a string with valid prefix and 2-digit number', () => {
  const code = generateRandomCode();
  assert.match(code, /^[A-Z]+-\d{2}$/);
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
      value: ''
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
  querySelectorAll: () => [],
  addEventListener: () => {}
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
globalThis.document = {
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
});

test('vox-audio: transmitToVox stores pending payload in sessionStorage and routes seamlessly', () => {
  sessionStore.clear();
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
  assert.equal(typeof globalThis.window.VoxAudio.navigateSeamlessly, 'function');
  assert.equal(typeof globalThis.window.VoxAudio.transmitToVox, 'function');
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
  processSingleMessage,
  drainChannelQueue,
  runDualThreadCourier
} = require('../vox_bridge.js');

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

  // Null/empty input
  assert.equal(scrubArtifacts(''), '');
  assert.equal(scrubArtifacts(null), '');
  assert.equal(scrubArtifacts(undefined), '');
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

  // Verify new sealed Astropathic dispatch and clearance gate
  assert.ok(
    html.includes("Lord Commander Junebug's Sealed Astropathic Dispatch"),
    'Must include Lord Commander Junebug sealed dispatch title'
  );
  assert.ok(
    html.includes('Clearance Vermilion • Lord Commander Junebug • Restricted Dataslate'),
    'Must include Lord Commander Junebug clearance tag'
  );
  assert.ok(
    html.includes('The Voice in the Ash (Your Chronicler &amp; The Third Force)') ||
    html.includes('The Voice in the Ash (Your Chronicler & The Third Force)'),
    'Must include The Voice in the Ash narrative section'
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
  assert.ok(html.includes('Mode 4: Rosters'), 'welcome.html must explain Mode 4');
  assert.ok(html.includes('Mode 5: Briefings'), 'welcome.html must explain Mode 5');
  assert.ok(html.includes('Cogitator Audio'), 'welcome.html must explain audio features');
  assert.ok(html.includes('<link rel="stylesheet" href="../css/style.css">'), 'welcome.html must link to style.css');
  assert.ok(html.includes('<script src="../js/vox-audio.js"></script>'), 'welcome.html must link to vox-audio.js');
});

test('UI Boundary: index.html serves as the centered Field Codex home launchpad', () => {
  const html = readPage('index.html');
  assert.ok(html.includes('Sanctuary Field Codex &amp; Quickstart Manual') || html.includes('Sanctuary Field Codex & Quickstart Manual'));
  assert.ok(html.includes('welcome-quick-grid'), 'index.html must feature centered quick-launch command matrix');
  assert.ok(html.includes('welcome-btn-row'), 'index.html must feature centered action button rows');
  assert.ok(html.includes('pages/spawner.html'), 'index.html must link to Mode 1 spawner');
  assert.ok(html.includes('pages/pvp.html'), 'index.html must link to Mode 2 1v1 PvP');
  assert.ok(html.includes('pages/rogue.html'), 'index.html must link to Mode 3 Rogue AI');
  assert.ok(html.includes('pages/roster.html'), 'index.html must link to Mode 4 Rosters');
  assert.ok(html.includes('pages/briefing.html'), 'index.html must link to Mode 5 Briefings');
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
  briefing.showDossier('atlas', true);

  assert.equal(briefing.getBriefingState().activeDossier, 'atlas');
  assert.equal(mockElements.dossierAtlas.classList.contains('hidden'), false);
  assert.equal(mockElements.btnAtlas.classList.contains('active'), true);
  assert.equal(mockElements.dossierBeta.classList.contains('hidden'), true);
  assert.equal(mockElements.btnBeta.classList.contains('active'), false);

  const raw = localStorage.getItem(briefing.BRIEFING_STORAGE_KEY);
  const parsed = JSON.parse(raw);
  assert.equal(parsed.activeDossier, 'atlas');
});

test('briefing: unlockTab and lockTab manage clearance gates and persist states', () => {
  briefing.unlockTab('Beta', true);
  assert.equal(mockElements.gateBeta.classList.contains('hidden'), true);
  assert.equal(mockElements.contentBeta.classList.contains('hidden'), false);
  assert.equal(briefing.getBriefingState().unlockedBeta, true);

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

test('briefing: DOM includes read-only slider gauge, reckRow-1 highlight, and CURRENT_SHIP_SLIDER = -1', () => {
  // Check read-only styling
  assert.ok(briefingHtml.includes('pointer-events: none; /* Strictly non-interactable status gauge */'), 'Must define pointer-events none');
  assert.ok(briefingHtml.includes('aria-label="Current Shipboard Balance Gauge (Read-Only)"'), 'Must define read-only aria-label');
  
  // Check -1 active status node
  assert.ok(briefingHtml.includes('id="node-1" class="slider-node active-brig"'), 'Must render node-1 as active-brig');
  assert.ok(briefingHtml.includes('ACTIVE • Sweet Spot'), 'Must highlight ACTIVE sweet spot');

  // Check reckRow-1 highlight in Reckoning Table
  assert.ok(briefingHtml.includes('<tr id="reckRow-1" class="highlight-row">'), 'Must highlight reckRow-1');
  assert.ok(!briefingHtml.includes('<tr id="reckRow0" class="highlight-row">'), 'reckRow0 must not have highlight-row');

  // Check script locked campaign state
  assert.ok(briefingHtml.includes('const CURRENT_SHIP_SLIDER = -1;'), 'Must define locked CURRENT_SHIP_SLIDER = -1');
  assert.ok(briefingHtml.includes('selectSlider(CURRENT_SHIP_SLIDER);'), 'Must invoke selectSlider(CURRENT_SHIP_SLIDER)');
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
  vulturePts: { innerText: '3 SPts' },
  unboundResult: { innerHTML: '' }
};

globalThis.document = {
  getElementById: (id) => mockElements[id] || null
};

// Evaluate script in mock environment
const pvpEnv = {};
const fn = new Function('document', 'localStorage', 'console', `${pvpScriptCode}; return {
  HELLSCAPES,
  ANOMALIES,
  UNBOUND_UNITS,
  STORAGE_KEY_PVP,
  savePvpState,
  restorePvpState,
  renderHellscape,
  rollRandomHellscape,
  rollWarpAnomaly,
  updateVulture,
  rollUnboundAdversary
};`);

const pvp = fn(globalThis.document, globalThis.localStorage, console);

test('pvp: HELLSCAPES, ANOMALIES, and UNBOUND_UNITS contain valid crusade content', () => {
  assert.equal(pvp.HELLSCAPES.length, 6, 'Must define 6 Hellscape environments');
  assert.equal(pvp.ANOMALIES.length, 6, 'Must define 6 Warp Anomalies');
  assert.equal(pvp.UNBOUND_UNITS.length, 4, 'Must define 4 Unbound Adversary power levels');

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

test('pvp: updateVulture calculates 3 SPts base or 4 SPts with player kill bonus', () => {
  mockElements.vultureKillCheck.checked = false;
  pvp.updateVulture(true);
  assert.equal(mockElements.vulturePts.innerText, '3 SPts');

  mockElements.vultureKillCheck.checked = true;
  pvp.updateVulture(true);
  assert.equal(mockElements.vulturePts.innerText, '4 SPts');

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

test('pvp: rollUnboundAdversary picks an unbound unit and persists output', () => {
  pvp.rollUnboundAdversary();

  assert.ok(mockElements.unboundResult.innerHTML.includes('Power Level'));

  const raw = localStorage.getItem(pvp.STORAGE_KEY_PVP);
  const parsed = JSON.parse(raw);
  assert.ok(parsed.unboundHtml.includes('Power Level'));
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

test('pvp: restorePvpState faithfully reconstructs UI state from localStorage', () => {
  localStorage.setItem(pvp.STORAGE_KEY_PVP, JSON.stringify({
    hellscapeIdx: 5,
    warpIntensity: 'minor',
    anomalyHtml: '<span class="test-surge">Warp Fluke</span>',
    vultureKilled: true,
    unboundHtml: '<p>Daemonic Beast</p>'
  }));

  pvp.restorePvpState();

  assert.equal(String(mockElements.hellscapeSelect.value), '5');
  assert.equal(mockElements.warpIntensity.value, 'minor');
  assert.equal(mockElements.anomalyResultBox.innerHTML, '<span class="test-surge">Warp Fluke</span>');
  assert.equal(mockElements.vultureKillCheck.checked, true);
  assert.equal(mockElements.vulturePts.innerText, '4 SPts');
  assert.equal(mockElements.unboundResult.innerHTML, '<p>Daemonic Beast</p>');
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

const mockElements = {
  aiStep0: createMockAiStep(),
  aiStep1: createMockAiStep(),
  aiStep2: createMockAiStep()
};

globalThis.document = {
  getElementById: (id) => mockElements[id] || null
};

// Evaluate script in mock environment
const fn = new Function('document', 'localStorage', 'console', `${rogueScriptCode}; return {
  STORAGE_KEY_ROGUE,
  getCurrentAiStep: () => currentAiStep,
  setAiStep,
  nextAiStep,
  saveRogueState,
  restoreRogueState
};`);

const rogue = fn(globalThis.document, globalThis.localStorage, console);

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

// Load HORDE_FACTIONS from js/data.js
const dataJsCode = fs.readFileSync(DATA_JS_PATH, 'utf8');
const dataFn = new Function(`${dataJsCode}; return { HORDE_FACTIONS };`);
const { HORDE_FACTIONS } = dataFn();

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
  bracketFactionPicker: { value: 'Space Marines', innerHTML: '' },
  factionBracketDisplay: { innerHTML: '' }
};

const mockDocument = {
  getElementById: (id) => mockElements[id] || null
};

let transmittedChannel = null;
let transmittedPayload = null;

const mockWindow = {
  addEventListener: () => {},
  VoxAudio: {
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
  'HORDE_FACTIONS',
  'console',
  `${rosterScriptCode}; return {
    ROSTER_STATE_KEY,
    CUSTOM_POOL_STORAGE_KEY,
    HORDE_FACTION_SPAWN_TABLES,
    switchRosterTab,
    buildNemesisDossierString,
    updateNemesisPreview,
    transmitNemesisDossier,
    saveShelfBarracks,
    renderFactionBracketTable,
    saveRosterPageState,
    initRosterPage
  };`
);

const roster = evalFn(mockDocument, mockWindow, mockLocalStorage, HORDE_FACTIONS, console);

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

  roster.saveShelfBarracks();

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
  cruTabBtn1: { classList: createMockClassList() },
  cruTabBtn2: { classList: createMockClassList() },
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
  masterDossierPreviewBox: { textContent: '' }
};

const mockDocument = {
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
    WEAPON_MOD_TABLE,
    CRUSADE_RELIC_VAULT,
    BATTLE_SCAR_TABLE,
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
    attachRollToDossier,
    removeQueuedRoll,
    clearQueuedRolls,
    renderQueuedRolls,
    buildMasterDossierString,
    updateMasterDossierPreview,
    transmitMasterBattleDossier,
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
  questionInput: { value: '' }
};

const mockDocument = {
  getElementById: (id) => mockElements[id] || null,
  createElement: (tag) => {
    let _text = '';
    const el = {
      tagName: tag.toUpperCase(),
      className: '',
      style: {},
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
let mockRpcHandler = async (fnName, params) => {
  rpcCalls.push({ fnName, params });
  if (fnName === 'check_channel_seal') return true;
  if (fnName === 'unlock_or_seal_channel') return { ok: true };
  if (fnName === 'send_vox_message') return { ok: true };
  if (fnName === 'delete_vox_entry') return { ok: true };
  if (fnName === 'get_vox_terminal_data') return { ok: true, messages: mockMessages, interferences: mockInterferences };
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
    getSelectedChannel: () => selectedChannel,
    getActivePassphrase: () => activePassphrase,
    getShowAllOlderMessages: () => showAllOlderMessages,
    getShowAllOlderInterferences: () => showAllOlderInterferences
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
  (id) => {}
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



````
