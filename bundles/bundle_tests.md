# 📦 Fires of Armageddon // Bundle: Test Suites & Verification

Unit, boundary, integration, and UI verification test suites for all game modes, data schemas, RNG determinism, and page requirements (`tests/**/*.test.js`).

## 📑 Table of Contents
- [tests/js/data.test.js](#file-testsjsdatatestjs)
- [tests/js/rng.test.js](#file-testsjsrngtestjs)
- [tests/js/spawner.test.js](#file-testsjsspawnertestjs)
- [tests/js/app.test.js](#file-testsjsapptestjs)
- [tests/js/vox-audio.test.js](#file-testsjsvoxaudiotestjs)
- [tests/ui/pages.test.js](#file-testsuipagestestjs)

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
  assert.equal(getBracketInfo(10, 10).key, '10+');
  assert.equal(getBracketInfo(12, 12).key, '10+');
  assert.equal(getBracketInfo(16, 11).key, '10+');
});

test('calculateRollDown: cascades down correctly from 10+ down to 3-4', () => {
  const step1 = calculateRollDown('10+');
  assert.ok(step1);
  assert.equal(step1.nextKey, '7-9');

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
    '10+': 'Hive Tyrant'
  };

  const rng = mulberry32(100);
  const picked34 = pickSyncedUnitFromBracket('3-4', rng, mockPool);
  assert.ok(['Hormagaunts', 'Termagants', 'Cultists'].includes(picked34));

  const fallback = pickSyncedUnitFromBracket('5-6', rng, mockPool);
  assert.equal(fallback, 'Unit from Bracket [5-6]');

  const picked79 = pickSyncedUnitFromBracket('7-9', rng, mockPool);
  assert.equal(picked79, 'Carnifex');
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
  querySelectorAll: () => []
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

test('js/vox-audio.js exists and implements the 40K Vox-Caster ambient playlist and SFX synth', () => {
  assert.ok(fs.existsSync(VOX_AUDIO_PATH), 'js/vox-audio.js must exist');
  const code = fs.readFileSync(VOX_AUDIO_PATH, 'utf8');

  // Verify core constants and identifiers
  assert.ok(code.includes('PL1PnO3JojeSmA_jPzjhuiKycUQ8BHHjek'), 'Must configure the official YouTube playlist ID');
  assert.ok(code.includes('soa_vox_music_enabled_v1'), 'Must configure localStorage key for music state persistence');
  assert.ok(code.includes('soa_vox_track_index_v1'), 'Must persist track index for seamless tab switching');
  assert.ok(code.includes('soa_vox_track_time_v1'), 'Must persist track timestamp for seamless tab switching');

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

test('UI Boundary: index.html has complete navigation, stylesheets, and modular scripts', () => {
  const html = readPage('index.html');

  assert.ok(html.includes('<nav class="suite-nav">'), 'Missing suite navigation bar');
  assert.ok(html.includes('href="pages/briefing.html" class="suite-link">📜 Briefings, Ship &amp; Atlas</a>'));
  assert.ok(html.includes('href="pages/pvp.html"'));
  assert.ok(html.includes('href="pages/rogue.html"'));
  assert.ok(html.includes('href="pages/roster.html"'));

  // Stylesheet
  assert.ok(html.includes('<link rel="stylesheet" href="css/style.css">'));

  // Modular script architecture
  assert.ok(html.includes('<script src="js/data.js"></script>'));
  assert.ok(html.includes('<script src="js/rng.js"></script>'));
  assert.ok(html.includes('<script src="js/spawner.js"></script>'));
  assert.ok(html.includes('<script src="js/app.js"></script>'));
  assert.ok(html.includes('<script src="js/vox-audio.js"></script>'), 'index.html must link to js/vox-audio.js');
});

test('UI Boundary: all subpages live in /pages and share unified navigation links', () => {
  const subpages = ['pvp.html', 'rogue.html', 'roster.html', 'briefing.html', 'welcome.html'];
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

  const subpages = ['pages/briefing.html', 'pages/pvp.html', 'pages/rogue.html', 'pages/roster.html', 'pages/welcome.html'];
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
    html.includes("Commander Beta's Sealed Astropathic Dispatch"),
    'Must include Commander Beta sealed dispatch title'
  );
  assert.ok(
    html.includes('Clearance Vermilion-Beta • Restricted Dataslate'),
    'Must include Vermilion-Beta clearance tag'
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



````
