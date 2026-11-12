/**
 * @fileoverview Unit tests for js/tactica.js telemetry side-flip adapter (`/tts/set-side`),
 * idempotent console rendering, and guard clauses.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '../../');

test('toggleTelemetryUnitSide: posts { squadKey, guids, side } to /tts/set-side when online and renders ⇄ Flip Side idempotently', async () => {
  const spawner = require(path.join(ROOT_DIR, 'js/spawner.js'));
  const combat = require(path.join(ROOT_DIR, 'js/horde-combat-modifiers.js'));
  const telemetry = require(path.join(ROOT_DIR, 'js/tts-telemetry-core.js'));
  const autopilot = require(path.join(ROOT_DIR, 'js/horde-autopilot-core.js'));
  const overwatchCore = require(path.join(ROOT_DIR, 'js/tactica-overwatch-core.js'));
  const core = require(path.join(ROOT_DIR, 'js/tactica-core.js'));
  Object.assign(globalThis, spawner, combat, telemetry, autopilot, overwatchCore, core);

  const els = {
    tacticaTelemetryBox: { innerHTML: '' },
    tacticaDaemonBadge: { textContent: '' }
  };
  const postedRequests = [];

  globalThis.document = { getElementById: (id) => els[id] || null };
  globalThis.window = { addEventListener: () => {} };
  globalThis.fetch = async (url, opts) => {
    const body = opts && opts.body ? JSON.parse(opts.body) : null;
    postedRequests.push({ url, method: opts?.method || 'GET', body });
    return {
      ok: true,
      json: async () => ({
        ok: true,
        units: [
          {
            squadKey: body.squadKey,
            guids: body.guids,
            name: 'Hearthkyn Warriors',
            side: body.side,
            modelCount: 10,
            save: 4
          }
        ]
      })
    };
  };

  try {
    delete require.cache[require.resolve(path.join(ROOT_DIR, 'js/tactica.js'))];
    const tactica = require(path.join(ROOT_DIR, 'js/tactica.js'));

    tactica.getTacticaClientState().boardTelemetry = {
      objectives: [],
      units: [
        {
          squadKey: 'HORDE::Hearthkyn Warriors',
          guids: ['vot-a', 'vot-b'],
          name: 'Hearthkyn Warriors',
          side: 'HORDE',
          modelCount: 10,
          save: 4
        }
      ]
    };

    assert.equal(typeof tactica.toggleTelemetryUnitSide, 'function');
    assert.equal(await tactica.toggleTelemetryUnitSide(99), null, 'Out-of-bounds index must return null safely');

    const updated = await tactica.toggleTelemetryUnitSide(0);
    assert.equal(updated.side, 'PLAYER');
    assert.equal(postedRequests.length, 1);
    assert.ok(postedRequests[0].url.endsWith('/tts/set-side'));
    assert.equal(postedRequests[0].method, 'POST');
    assert.deepEqual(postedRequests[0].body, {
      squadKey: 'HORDE::Hearthkyn Warriors',
      guids: ['vot-a', 'vot-b'],
      side: 'PLAYER'
    });

    assert.ok(els.tacticaTelemetryBox.innerHTML.includes('<span class="badge blue">PLAYER</span>'));
    assert.ok(els.tacticaTelemetryBox.innerHTML.includes('onclick="toggleTelemetryUnitSide(0)"'));
    assert.equal(
      els.tacticaTelemetryBox.innerHTML.includes('selectTelemetryUnitForDefense(0)'),
      false,
      'PLAYER units must hide the Horde Auto-Defender button'
    );
  } finally {
    delete globalThis.document;
    delete globalThis.window;
    delete globalThis.fetch;
  }
});

test('Part 4 Client Stability: daemonRequest retries once on transient failure and maintains SPA-safe 2.5s _foaTacticaPollTimer', async () => {
  const spawner = require(path.join(ROOT_DIR, 'js/spawner.js'));
  const combat = require(path.join(ROOT_DIR, 'js/horde-combat-modifiers.js'));
  const telemetry = require(path.join(ROOT_DIR, 'js/tts-telemetry-core.js'));
  const autopilot = require(path.join(ROOT_DIR, 'js/horde-autopilot-core.js'));
  const overwatchCore = require(path.join(ROOT_DIR, 'js/tactica-overwatch-core.js'));
  const core = require(path.join(ROOT_DIR, 'js/tactica-core.js'));
  Object.assign(globalThis, spawner, combat, telemetry, autopilot, overwatchCore, core);

  const els = {
    tacticaDaemonBadge: { textContent: '', style: {} },
    tacticaRoomLabel: { textContent: '' }
  };
  let fetchAttempts = 0;

  globalThis.document = { getElementById: (id) => els[id] || null };
  globalThis.window = { addEventListener: () => {} };
  globalThis.fetch = async () => {
    fetchAttempts++;
    if (fetchAttempts === 1) {
      throw new Error('Transient socket reset');
    }
    return {
      ok: true,
      json: async () => ({
        ok: true,
        state: { roomCode: 'RETRY-OK', battleRound: 1, phase: 'COMMAND_SPAWN' },
        chronicle: [],
        ttsQueueDepth: 0
      })
    };
  };

  try {
    delete require.cache[require.resolve(path.join(ROOT_DIR, 'js/tactica.js'))];
    const tactica = require(path.join(ROOT_DIR, 'js/tactica.js'));

    await tactica.refreshDaemonState();
    assert.equal(fetchAttempts, 2, 'daemonRequest must retry 1 time after transient failure');
    assert.equal(tactica.getTacticaClientState().roomCode, 'RETRY-OK');
    assert.ok(els.tacticaDaemonBadge.textContent.includes('ONLINE'));

    assert.equal(typeof tactica.startTacticaAutoPoller, 'function');
    assert.equal(typeof tactica.stopTacticaAutoPoller, 'function');
    const timer1 = tactica.startTacticaAutoPoller(2500);
    assert.ok(timer1 && globalThis.window._foaTacticaPollTimer === timer1);
    const timer2 = tactica.startTacticaAutoPoller(2500);
    assert.ok(globalThis.window._foaTacticaPollTimer === timer2, 'Re-starting poller must replace old SPA timer cleanly');
    tactica.stopTacticaAutoPoller();
    assert.equal(globalThis.window._foaTacticaPollTimer, null);
  } finally {
    if (globalThis.window && globalThis.window._foaTacticaPollTimer) {
      clearInterval(globalThis.window._foaTacticaPollTimer);
    }
    delete globalThis.document;
    delete globalThis.window;
    delete globalThis.fetch;
  }
});

test('announceAuspex Readouts: speaks phase actions (Spawn, Move, Shooting) and settled AUTO_DEFENDER, HORDE_ATTACK, and CHARGE_ROLL sequences', async () => {
  const spawner = require(path.join(ROOT_DIR, 'js/spawner.js'));
  const combat = require(path.join(ROOT_DIR, 'js/horde-combat-modifiers.js'));
  const telemetry = require(path.join(ROOT_DIR, 'js/tts-telemetry-core.js'));
  const deepStrike = require(path.join(ROOT_DIR, 'js/horde-deepstrike-core.js'));
  const autopilot = require(path.join(ROOT_DIR, 'js/horde-autopilot-core.js'));
  const overwatchCore = require(path.join(ROOT_DIR, 'js/tactica-overwatch-core.js'));
  const core = require(path.join(ROOT_DIR, 'js/tactica-core.js'));
  Object.assign(globalThis, spawner, combat, telemetry, deepStrike, autopilot, overwatchCore, core);

  const makeEl = (val = '') => ({
    value: val,
    checked: false,
    textContent: '',
    innerHTML: '',
    style: {},
    classList: {
      _s: new Set(),
      add(c) { this._s.add(c); },
      remove(c) { this._s.delete(c); },
      toggle(c, f) { if (f === undefined ? !this._s.has(c) : f) this._s.add(c); else this._s.delete(c); },
      contains(c) { return this._s.has(c); }
    }
  });
  const els = {
    tacticaAutopilotBox: makeEl(),
    tacticaPendingRollBox: makeEl(),
    tacticaManualPipsInput: makeEl(),
    defUnitName: makeEl('Necron Warriors'),
    defSaveInput: makeEl('4'),
    defInvulnInput: makeEl('0'),
    defWpmInput: makeEl('1'),
    defKeywordsInput: makeEl('INFANTRY'),
    defModelsInput: makeEl('5'),
    defWoundsCountInput: makeEl('1'),
    defApInput: makeEl('0'),
    defDmgInput: makeEl('1'),
    defInSpawnCheck: makeEl(),
    defResultBox: makeEl()
  };

  const spokenLines = [];
  let mockDaemonState = null;

  globalThis.document = { getElementById: (id) => els[id] || null };
  globalThis.window = {
    addEventListener: () => {},
    speakOverwatchLine: (line) => { spokenLines.push(line); }
  };
  globalThis.fetch = async (url) => {
    if (mockDaemonState && String(url).endsWith('/state')) {
      return {
        ok: true,
        json: async () => mockDaemonState
      };
    }
    throw new Error('Offline');
  };

  try {
    delete require.cache[require.resolve(path.join(ROOT_DIR, 'js/tactica.js'))];
    const tactica = require(path.join(ROOT_DIR, 'js/tactica.js'));
    const st = tactica.getTacticaClientState();
    st.battleRound = 1;
    st.zoneSpawns = [{ zone: 1, bracketKey: '5-6', units: ['10 Necron Warriors'] }];
    st.boardTelemetry = {
      objectives: [],
      obstacles: [],
      autoBlockedLosPairs: [],
      units: [
        {
          squadKey: 'HORDE::Necron Warriors',
          name: 'Necron Warriors',
          side: 'HORDE',
          modelCount: 10,
          move: 5,
          save: 4,
          pos: { x: 0, z: 10 },
          keywords: ['INFANTRY'],
          models: [{ guid: 'nw1', pos: { x: 0, y: 1.1, z: 10 }, radiusInches: 0.63 }],
          weapons: [{ name: 'Gauss flayer', type: 'ranged', rangeInches: 24, attacks: 2, skill: 4, strength: 4, ap: 0, damage: 1, keywords: [] }]
        },
        {
          squadKey: 'PLAYER::Hearthkyn Warriors',
          name: 'Hearthkyn Warriors',
          side: 'PLAYER',
          modelCount: 10,
          toughness: 5,
          save: 4,
          pos: { x: 0, z: 2 },
          keywords: ['INFANTRY'],
          models: [{ guid: 'hk1', pos: { x: 0, y: 1.1, z: 2 }, radiusInches: 0.55 }]
        }
      ]
    };

    // 1. Spawn Waves -> speaks plan.summary
    spokenLines.length = 0;
    const spawnPlan = await tactica.triggerAutopilotSpawnWaves();
    assert.equal(spokenLines.includes(spawnPlan.summary), true, 'triggerAutopilotSpawnWaves must announce plan.summary');

    // 2. Movement -> speaks "Horde movement complete. Verify sightlines before Overwatch."
    spokenLines.length = 0;
    await tactica.triggerAutopilotMovement();
    assert.equal(
      spokenLines.includes('Horde movement complete. Verify sightlines before Overwatch.'),
      true,
      'triggerAutopilotMovement must announce movement completion & sightline prompt'
    );

    // 3. Shooting -> speaks "${assignments.length} shooting targets locked."
    spokenLines.length = 0;
    const assignments = await tactica.triggerAutopilotShooting();
    assert.equal(
      spokenLines.includes(`${assignments.length} shooting targets locked.`),
      true,
      'triggerAutopilotShooting must announce locked target count'
    );

    // 4. AUTO_DEFENDER reaching COMPLETE -> speaks defense outcome
    spokenLines.length = 0;
    await tactica.queueConsoleAutoDefender();
    els.tacticaManualPipsInput.value = '5';
    await tactica.submitSettledMatPips();
    assert.ok(
      spokenLines.some(l => l.includes('Necron Warriors')),
      'Settled AUTO_DEFENDER sequence must announce defense outcome'
    );

    // 5. HORDE_ATTACK reaching COMPLETE -> speaks attack wound outcome
    spokenLines.length = 0;
    await tactica.fireAutopilotWeaponOnMat(0);
    els.tacticaManualPipsInput.value = '5, 2';
    await tactica.submitSettledMatPips(); // HITS -> WOUNDS
    els.tacticaManualPipsInput.value = '6';
    await tactica.submitSettledMatPips(); // WOUNDS -> COMPLETE
    assert.ok(
      spokenLines.some(l => l.includes('Necron Warriors') && l.includes('Hearthkyn Warriors')),
      'Settled HORDE_ATTACK sequence must announce wound outcome'
    );

    // 6. CHARGE_ROLL reaching COMPLETE (both manual pips & live LCT mat poll) -> speaks charge result
    spokenLines.length = 0;
    st.boardTelemetry.units[0].pos = { x: 0, z: 10 };
    st.boardTelemetry.units[0].models[0].pos = { x: 0, y: 1.1, z: 10 };
    st.boardTelemetry.units[0].advancedThisTurn = false;
    await tactica.triggerAutopilotCharges();
    els.tacticaManualPipsInput.value = '5, 5';
    await tactica.submitSettledMatPips();
    assert.ok(
      spokenLines.some(l => /charge/i.test(l) && l.includes('Necron Warriors')),
      'Settled manual CHARGE_ROLL must announce charge outcome'
    );

    // Also verify live LCT Dice Mat completion arriving via /state poll in refreshDaemonState()
    spokenLines.length = 0;
    st.pendingDiceSequence = { sequenceId: 'atk_live_1', kind: 'HORDE_ATTACK', stage: 'WOUNDS' };
    mockDaemonState = {
      ok: true,
      state: { ...st, pendingDiceSequence: null },
      chronicle: [
        { seq: 42, battleRound: 1, phase: 'HORDE_SHOOTING', type: 'HORDE_ATTACK', summary: 'Necron Warriors -> Hearthkyn Warriors [LCT Mat]: 2 Wounds (AP 0) + 0 Mortal Wounds.' }
      ],
      ttsQueueLength: 0
    };
    await tactica.refreshDaemonState();
    assert.ok(
      spokenLines.some(l => l.includes('2 Wounds')),
      'Live LCT Dice Mat completion arriving via /state poll must announce settled outcome'
    );
  } finally {
    delete globalThis.document;
    delete globalThis.window;
    delete globalThis.fetch;
  }
});
