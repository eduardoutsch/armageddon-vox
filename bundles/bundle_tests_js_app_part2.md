# 📦 Fires of Armageddon // Bundle: Unit Tests (App Engine Part 2: Intrusions, Spawns & Cloud Sync)

Unit test suite for Warp-Breach intrusions, wave spawning, and real-time Supabase co-op synchronization (`tests/js/app.test.js` lines 520 to end).

## 📑 Table of Contents
- [tests/js/app.test.js (Part 2: Intrusions, Spawns & Cloud Sync, Lines 520-end)](#file-testsjsapptestjspart2intrusionsspawnscloudsynclines520end)

---

## File: `tests/js/app.test.js (Part 2: Intrusions, Spawns & Cloud Sync, Lines 520-end)` <a id="file-testsjsapptestjspart2intrusionsspawnscloudsynclines520end"></a>

````javascript
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
    'pages/spawner.html spawner header must state Roll 1D6 Warp-Breach Intrusion (6+)'
  );
  assert.ok(
    spawnerHtml.includes('Unmodified 2 = No Spawn • [10+] Rolls 1D6 Warp-Breach Intrusion (6+)'),
    'pages/spawner.html spawner header must state Rolls 1D6 Warp-Breach Intrusion (6+)'
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

test('app: rollAllSpawnZones generates fresh intrusionRoll values on repeat rolls in the same round', () => {
  document.getElementById('seedInput').value = 'HADES-INTRUSION';
  document.getElementById('spawnZoneCountSelect').value = '3';
  document.getElementById('hordeFactionSelect').value = 'World Eaters';
  document.getElementById('extraSpawnMod').value = '10'; // Force [13+] Big Bracket
  localStorage.setItem('foa_custom_shelf_pool_v1', JSON.stringify({
    byFaction: {
      'World Eaters': {
        b10: '1 Angron',
        b13: '1 Khorne Lord of Skulls'
      }
    }
  }));

  const seenIntrusionRolls = new Set();
  for (let i = 0; i < 20; i++) {
    app.rollAllSpawnZones();
    for (const z of app.currentZoneSpawns) {
      assert.ok(z.waveId, 'Zone spawn must include unique waveId');
      assert.ok(Array.isArray(z.parsedWave), 'Zone spawn must include parsedWave array');
      if (z.unmod === 2) {
        assert.equal(z.bracketKey, 'NONE');
        assert.equal(z.intrusionRoll, null);
      } else {
        assert.equal(typeof z.intrusionRoll, 'number', 'Big bracket must pre-roll numeric intrusionRoll');
        seenIntrusionRolls.add(z.intrusionRoll);
      }
    }
  }
  assert.ok(seenIntrusionRolls.size > 1, 'Re-rolling spawns in the same round must roll fresh 1D6 intrusion checks');

  // Verify rollDownZone clears intrusionRoll and re-parses wave on a [13+] zone
  const bigIdx = app.currentZoneSpawns.findIndex(z => z.bracketKey === '13+');
  if (bigIdx !== -1) {
    app.rollDownZone(bigIdx);
    const rolledDownZ = app.currentZoneSpawns[bigIdx];
    assert.equal(rolledDownZ.intrusionRoll, null, 'Rolled-down wave must clear intrusionRoll');
    assert.equal(rolledDownZ.units.length, 2);
    assert.equal(rolledDownZ.parsedWave.length, 2);
    assert.equal(rolledDownZ.parsedWave[0].templateName, 'Angron');
  }

  document.getElementById('extraSpawnMod').value = '0';
});

test('app: evaluateWarpBreachIntrusions routes [10-12] breaches to playUnboundBreachAlert and [13+] breaches to playWarpSiren', () => {
  let apexSirenCount = 0;
  let midBreachCount = 0;
  globalThis.window.VoxAudio = {
    playWarpSiren: () => { apexSirenCount++; },
    playUnboundBreachAlert: () => { midBreachCount++; }
  };

  const container = document.getElementById('spawnResultsContainer');
  const origQueryAll = container.querySelectorAll;
  const origMulberry = globalThis.mulberry32;
  globalThis.mulberry32 = () => () => 0.99; // Intrusion roll = 6

  try {
    // 1. [10-12] breach alone -> must play less-intense playUnboundBreachAlert, NOT playWarpSiren
    document.getElementById('seedInput').value = 'TIER-10-12-TEST';
    document.getElementById('spawnerBtnRound').textContent = '2';
    app.currentZoneSpawns.length = 0;
    app.currentZoneSpawns.push({
      zone: 1,
      waveId: 'w_mid_1',
      bracketKey: '10-12',
      bracketLabel: 'Bracket [10–12]',
      intrusionRoll: 6,
      units: ['1 Forgefiend']
    });
    container.querySelectorAll = (sel) => sel === '.spawn-zone' ? [{
      textContent: 'Spawn Zone 1 • Bracket [10–12] (301–550 pts)',
      style: {},
      querySelector: () => null,
      appendChild: () => {}
    }] : [];

    app.evaluateWarpBreachIntrusions();
    assert.equal(midBreachCount, 1, 'Bracket [10–12] 6+ breach must trigger playUnboundBreachAlert');
    assert.equal(apexSirenCount, 0, 'Bracket [10–12] 6+ breach must NOT trigger [13+] playWarpSiren');

    // 2. [13+] breach -> must trigger full [13+] playWarpSiren
    document.getElementById('seedInput').value = 'TIER-13-PLUS-TEST';
    app.currentZoneSpawns.length = 0;
    app.currentZoneSpawns.push({
      zone: 1,
      waveId: 'w_apex_1',
      bracketKey: '13+',
      bracketLabel: 'Bracket [13+]',
      intrusionRoll: 6,
      units: ['1 Khorne Lord of Skulls']
    });
    container.querySelectorAll = (sel) => sel === '.spawn-zone' ? [{
      textContent: 'Spawn Zone 1 • Bracket [13+] (551+ pts)',
      style: {},
      querySelector: () => null,
      appendChild: () => {}
    }] : [];

    app.evaluateWarpBreachIntrusions();
    assert.equal(apexSirenCount, 1, 'Bracket [13+] 6+ breach must trigger terrifying playWarpSiren');
    assert.equal(midBreachCount, 1, 'Bracket [13+] 6+ breach must not increment playUnboundBreachAlert');

    // 3. Simultaneous [10-12] + [13+] breaches in same wave -> [13+] playWarpSiren wins
    document.getElementById('seedInput').value = 'TIER-MIXED-TEST';
    app.currentZoneSpawns.length = 0;
    app.currentZoneSpawns.push(
      { zone: 1, waveId: 'w_mix_1', bracketKey: '10-12', bracketLabel: 'Bracket [10–12]', intrusionRoll: 6, units: ['1 Forgefiend'] },
      { zone: 2, waveId: 'w_mix_2', bracketKey: '13+', bracketLabel: 'Bracket [13+]', intrusionRoll: 6, units: ['1 Angron'] }
    );
    container.querySelectorAll = (sel) => sel === '.spawn-zone' ? [
      { textContent: 'Spawn Zone 1 • Bracket [10–12] (301–550 pts)', style: {}, querySelector: () => null, appendChild: () => {} },
      { textContent: 'Spawn Zone 2 • Bracket [13+] (551+ pts)', style: {}, querySelector: () => null, appendChild: () => {} }
    ] : [];

    app.evaluateWarpBreachIntrusions();
    assert.equal(apexSirenCount, 2, 'Mixed [10-12] + [13+] wave must escalate to playWarpSiren');
    assert.equal(midBreachCount, 1, 'Mixed wave must not play lower-tier alert when [13+] is present');
  } finally {
    container.querySelectorAll = origQueryAll;
    globalThis.mulberry32 = origMulberry;
  }
});

test('app: Unbound Adversary (.warp-intrusion-alert) persists in #spawnResultsContainer across page switches (restoreSessionState) and sibling rollDownZone', () => {
  let sirenDuringRestore = 0;
  globalThis.window.VoxAudio = {
    playWarpSiren: () => { sirenDuringRestore++; },
    playUnboundBreachAlert: () => { sirenDuringRestore++; }
  };

  let cockpitMirrored = 0;
  globalThis.window.mirrorSpawnerToCockpit = () => { cockpitMirrored++; };

  document.getElementById('seedInput').value = 'PERSIST-BREACH-77';
  app.startSession();
  app.currentZoneSpawns.length = 0;
  app.currentZoneSpawns.push(
    {
      zone: 1,
      waveId: 'persist_z1',
      bracketKey: '10-12',
      bracketLabel: 'Bracket [10–12]',
      pts: '301–550 pts',
      diceStr: '2D6 (5, 5)',
      totalMod: 1,
      finalRoll: 11,
      intrusionRoll: 6,
      units: ['1 Forgefiend']
    },
    {
      zone: 2,
      waveId: 'persist_z2',
      bracketKey: '13+',
      bracketLabel: 'Bracket [13+]',
      pts: '551+ pts',
      diceStr: '2D6 (6, 6)',
      totalMod: 1,
      finalRoll: 13,
      intrusionRoll: 3,
      units: ['1 Khorne Lord of Skulls']
    }
  );
  app.saveSessionState();

  // Simulate navigating away from spawner.html (wiping DOM container) and navigating back (restoreSessionState)
  const container = document.getElementById('spawnResultsContainer');
  container.innerHTML = '';
  sirenDuringRestore = 0;

  const restored = app.restoreSessionState();
  assert.equal(restored, true, 'restoreSessionState must succeed');
  assert.ok(
    container.innerHTML.includes('warp-intrusion-alert') &&
    container.innerHTML.includes('ADVERSARY / NEMESIS HIJACK!') &&
    container.innerHTML.includes('transmitHordeIntrusionPing'),
    'Restoring spawner.html after page switch must preserve .warp-intrusion-alert popup in #spawnResultsContainer'
  );
  assert.ok(
    container.innerHTML.includes('intrusion-badge-clean'),
    'Restoring spawner.html must also preserve clean intrusion check note for non-6+ big brackets'
  );
  assert.equal(sirenDuringRestore, 0, 'Silent session restore on page switch must not re-blast intrusion siren');
  assert.ok(cockpitMirrored >= 1, 'renderSpawnZones must also trigger mirrorSpawnerToCockpit when available');

  // Rolling down Zone 2 must NOT erase Zone 1's active .warp-intrusion-alert popup!
  app.rollDownZone(1);
  assert.ok(
    container.innerHTML.includes('warp-intrusion-alert') &&
    container.innerHTML.includes('Spawn Zone 1'),
    'rollDownZone on a sibling zone must preserve Zone 1 .warp-intrusion-alert popup'
  );

  delete globalThis.window.mirrorSpawnerToCockpit;
});






````
