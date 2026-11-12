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
