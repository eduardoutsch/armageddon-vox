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
  assert.ok(windowEl.innerHTML.includes('Warp-Breach Intrusion Check (5+ = Campaign Master Adversary/Nemesis!)'));
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
  assert.ok(transmittedPayload.includes('Spawn Zone 2 rolled Bracket [10–12] + [5+ WARP-BREACH INTRUSION]!'));
  assert.ok(transmittedPayload.includes('ACTIVE HORDE FACTION: Chaos Daemons'));
});

test('app: evaluateWarpBreachIntrusions inspects spawn cards and handles intrusion or clean wave', () => {
  let sirenTriggered = false;
  globalThis.window.VoxAudio = {
    playWarpSiren: () => { sirenTriggered = true; }
  };

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

  app.evaluateWarpBreachIntrusions();

  assert.ok(appended1, 'Bracket [10–12] must receive an intrusion alert or clean note');
  assert.equal(appended2, null, 'Bracket [3–4] must not receive an intrusion check');
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




