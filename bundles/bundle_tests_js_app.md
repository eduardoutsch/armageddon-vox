# 📦 Fires of Armageddon // Bundle: Unit Tests (App Engine Part 1: State, Economy & Pools)

Unit test suite for app engine state, session persistence, resource economy, and byFaction shelf pools (`tests/js/app.test.js` lines 1 to 519).

## 📑 Table of Contents
- [tests/js/app.test.js (Part 1: State, Economy & Pools, Lines 1-519)](#file-testsjsapptestjspart1stateeconomypoolslines1519)

---

## File: `tests/js/app.test.js (Part 1: State, Economy & Pools, Lines 1-519)` <a id="file-testsjsapptestjspart1stateeconomypoolslines1519"></a>

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
  document.getElementById('quickObjCountInput').value = '3';
  globalThis.window.lastClaimedCommandRound = app.battleRound;
  app.saveSessionState();

  const updatedRaw = localStorage.getItem('foa_horde_session_v1');
  const updatedParsed = JSON.parse(updatedRaw);
  assert.equal(updatedParsed.sp, 5);
  assert.equal(updatedParsed.cp, 3);
  assert.equal(updatedParsed.quickObjCount, 3);
  assert.equal(updatedParsed.lastClaimedCommandRound, app.battleRound);

  // 3. Simulate reload or tab switch and restore
  document.getElementById('gameScreen').classList.add('hidden');
  document.getElementById('setupScreen').classList.remove('hidden');
  document.getElementById('quickObjCountInput').value = '0';
  globalThis.window.lastClaimedCommandRound = 0;

  const restored = app.restoreSessionState();
  assert.equal(restored, true, 'restoreSessionState must return true when active session exists');
  assert.equal(document.getElementById('gameScreen').classList.contains('hidden'), false);
  assert.equal(document.getElementById('setupScreen').classList.contains('hidden'), true);
  assert.equal(document.getElementById('quickObjCountInput').value, 3);
  assert.equal(globalThis.window.lastClaimedCommandRound, app.battleRound);

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

  // Tab index > 3 falls back gracefully to Tab 1
  app.switchTab(4);
  assert.equal(document.getElementById('tab1').classList.contains('hidden'), false);
  assert.equal(document.getElementById('tabBtn1').classList.contains('active'), true);
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

  app.adjCP(5);
  assert.equal(String(document.getElementById('hudCp').innerText), '6');

  // 1 CP stratagem
  app.spendCPForStrat(1);
  assert.equal(String(document.getElementById('hudCp').innerText), '5');
  assert.ok(document.getElementById('hudStratTally').innerText.includes('1 Strats'));

  // 2 CP stratagem
  app.spendCPForStrat(2);
  assert.equal(String(document.getElementById('hudCp').innerText), '3');
  assert.ok(document.getElementById('hudStratTally').innerText.includes('2 Strats'));

  // 3 CP stratagem
  app.spendCPForStrat(3);
  assert.equal(String(document.getElementById('hudCp').innerText), '0');
  assert.ok(document.getElementById('hudStratTally').innerText.includes('3 Strats'));

  // Insufficient CP check
  let alertMsg = null;
  globalThis.alert = (m) => { alertMsg = m; };
  app.spendCPForStrat(2);
  assert.equal(String(document.getElementById('hudCp').innerText), '0');
  assert.ok(alertMsg && alertMsg.includes('0 CP'));

  // adjustCpDirect
  globalThis.prompt = () => '5';
  app.adjustCpDirect();
  assert.equal(String(document.getElementById('hudCp').innerText), '5');
});

test('app: spending SP in Resupply shop updates round spend tracker (hudSpCap) and deducts banked SP', () => {
  // Start from clean reset
  app.resetMatchToSetup();
  assert.equal(app.sp, 0);
  assert.equal(app.spSpentThisRound, 0);
  assert.equal(document.getElementById('hudSpCap').innerText, '(0/8)');

  // Gain 10 SP
  app.gainSP(10);
  assert.equal(app.sp, 10);
  assert.equal(app.spSpentThisRound, 0);
  assert.equal(document.getElementById('hudSpCap').innerText, '(0/8)');

  // Spend 4 SP in Resupply shop
  app.spendSP(4);
  assert.equal(app.sp, 6);
  assert.equal(app.spSpentThisRound, 4);
  assert.equal(document.getElementById('hudSpCap').innerText, '(4/8)');

  // Spend another 2 SP
  app.spendSP(2);
  assert.equal(app.sp, 4);
  assert.equal(app.spSpentThisRound, 6);
  assert.equal(document.getElementById('hudSpCap').innerText, '(6/8)');

  // Advance round -> spSpentThisRound resets to 0, banked SP stays at 4
  app.advanceBattleRound();
  assert.equal(app.sp, 4);
  assert.equal(app.spSpentThisRound, 0);
  assert.equal(document.getElementById('hudSpCap').innerText, '(0/8)');
});

test('app: reducing and gaining banked SP does not alter spSpentThisRound', () => {
  app.resetMatchToSetup();
  app.gainSP(5);
  app.spendSP(3);
  assert.equal(app.sp, 2);
  assert.equal(app.spSpentThisRound, 3);
  assert.equal(document.getElementById('hudSpCap').innerText, '(3/8)');

  // Adjust banked SP using - and + buttons (loseSP / gainSP)
  app.loseSP(1);
  assert.equal(app.sp, 1);
  assert.equal(app.spSpentThisRound, 3, 'Manual SP decrement must not change SP spent tally');
  assert.equal(document.getElementById('hudSpCap').innerText, '(3/8)');

  app.gainSP(2);
  assert.equal(app.sp, 3);
  assert.equal(app.spSpentThisRound, 3, 'Gaining SP must not alter SP spent tally');
  assert.equal(document.getElementById('hudSpCap').innerText, '(3/8)');
});

test('app: adjustSpRoundTally and adjustStratTally allow manual correction of tallies', () => {
  const origPrompt = globalThis.prompt;
  try {
    globalThis.prompt = () => '3';
    app.adjustSpRoundTally();
    assert.equal(app.spSpentThisRound, 3);
    assert.equal(document.getElementById('hudSpCap').innerText, '(3/8)');

    globalThis.prompt = () => '5';
    app.adjustStratTally();
    assert.equal(app.stratCount, 5);
    assert.ok(document.getElementById('hudStratTally').innerText.includes('5 Strats'));
  } finally {
    globalThis.prompt = origPrompt;
  }
});


test('app: saveCustomPool and loadCustomPool persist custom units to localStorage', () => {
  localStorage.removeItem('armageddon_horde_pool');
  localStorage.removeItem('foa_custom_shelf_pool_v1');
  const activeFac = app.activeHordeFaction ? app.activeHordeFaction.name : 'Orks';
  document.getElementById('hordeFactionSelect').value = activeFac;
  document.getElementById('pool34').value = '10 Termagants';
  document.getElementById('pool56').value = '5 Genestealers';
  document.getElementById('pool79').value = '1 Carnifex';
  document.getElementById('pool10').value = '1 Hive Tyrant';

  globalThis.alert = () => {};
  app.saveCustomPool();

  assert.equal(localStorage.getItem('armageddon_horde_pool'), null, 'Must not write legacy armageddon_horde_pool');
  const saved = JSON.parse(localStorage.getItem('foa_custom_shelf_pool_v1'));
  assert.equal(saved.b34, undefined, 'Must not spread flat root keys');
  assert.equal(saved.byFaction[activeFac].b34, '10 Termagants');
  assert.equal(saved.byFaction[activeFac].b10, '1 Hive Tyrant');

  // Clear inputs and reload
  document.getElementById('pool34').value = '';
  document.getElementById('pool10').value = '';
  app.loadCustomPool();

  assert.equal(document.getElementById('pool34').value, '10 Termagants');
  assert.equal(document.getElementById('pool10').value, '1 Hive Tyrant');
});

test('app: renderLiveSpawnerBracketTable renders table with cloud pool values and intrusion warning', () => {
  const activeFac = document.getElementById('hordeFactionSelect').value || 'Chaos Daemons';
  document.getElementById('hordeFactionSelect').value = activeFac;
  localStorage.setItem('foa_custom_shelf_pool_v1', JSON.stringify({
    byFaction: {
      [activeFac]: { b34: 'Test Chaff 10', b13: 'Test Greater Daemon' }
    }
  }));

  const windowEl = document.getElementById('liveSpawnerBracketWindow');
  app.renderLiveSpawnerBracketTable();

  assert.ok(windowEl.innerHTML.includes('Test Chaff 10'));
  assert.ok(windowEl.innerHTML.includes('Test Greater Daemon'));
  assert.ok(windowEl.innerHTML.includes('Warp-Breach Intrusion Check (6+ = Campaign Master Adversary/Nemesis!)'));
});

test('app: syncSpawnerPoolFromSupabase pulls cloud pool and updates localStorage and table', async () => {
  const origFetch = globalThis.fetch;
  const activeFac = document.getElementById('hordeFactionSelect').value || 'Chaos Daemons';
  document.getElementById('hordeFactionSelect').value = activeFac;
  globalThis.fetch = async (url) => {
    return {
      ok: true,
      json: async () => ({
        ok: true,
        horde_pool: {
          byFaction: {
            [activeFac]: {
              b34: 'Cloud Hormagaunts 20',
              b56: 'Cloud Bloodletters 10',
              b79: 'Cloud Trygon 1',
              b10: 'Cloud Bloodthirster 1',
              b13: 'Cloud Baneblade 1'
            }
          }
        }
      })
    };
  };

  await app.syncSpawnerPoolFromSupabase();

  const saved = JSON.parse(localStorage.getItem('foa_custom_shelf_pool_v1'));
  assert.equal(saved.b34, undefined, 'Must not spread flat root keys');
  assert.equal(saved.byFaction[activeFac].b34, 'Cloud Hormagaunts 20');
  assert.equal(saved.byFaction[activeFac].b10, 'Cloud Bloodthirster 1');

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
  assert.ok(transmittedPayload.includes('Mode 1 (Horde Command // Room: HADES-42 // Battle Round 3)'));
  assert.ok(transmittedPayload.includes('Spawn Zone 2 rolled Bracket [10–12] + [6+ WARP-BREACH INTRUSION] against Chaos Daemons!'));
  assert.ok(transmittedPayload.includes('TOMB-SHIP OMNICIDAL AUSPEX [PHAERON JUNEBUG]'));
  assert.ok(transmittedPayload.includes('REQUEST FOR TOMB-SHIP MASTER MATRIX'));

  // Test Alpha channel
  app.transmitHordeIntrusionPing(2, 'Bracket [10–12]', 'alpha');
  assert.equal(transmittedChan, 'alpha');
  assert.ok(transmittedPayload.includes('MUNITORUM PERIMETER AUGUR [THE EXILE // 044TH KRIEG]'));
  assert.ok(transmittedPayload.includes('REQUEST FOR CAMPAIGN MASTER'));
});

````
