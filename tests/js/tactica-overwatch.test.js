/**
 * @fileoverview Unit tests for js/tactica-overwatch.js neural Auspex Web Audio playback,
 * visor comm-filter chain (260Hz–4200Hz @ 0.55 gain), sticky-bar quick Stratagems, and PTT guards.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '../../');

test('speakOverwatchLine & triggerQuickStratagem: plays decoded /audio/speak MP3 through 260Hz-4200Hz visor filter and routes quick Stratagems', async () => {
  const overwatchCore = require(path.join(ROOT_DIR, 'js/tactica-overwatch-core.js'));
  Object.assign(globalThis, overwatchCore);

  const createdFilters = [];
  const createdGains = [];
  let bufferStarted = false;
  let auspexChimes = 0;

  class MockOverwatchAudioCtx {
    constructor() {
      this.currentTime = 10;
      this.state = 'running';
      this.destination = {};
    }
    async decodeAudioData(buf) {
      return { byteLength: buf.byteLength };
    }
    createBufferSource() {
      return {
        buffer: null,
        connect() {},
        start() { bufferStarted = true; }
      };
    }
    createBiquadFilter() {
      const f = { type: 'lowpass', frequency: { val: 0, setValueAtTime(v) { this.val = v; } }, connect() {} };
      createdFilters.push(f);
      return f;
    }
    createGain() {
      const g = { gain: { val: 1, setValueAtTime(v) { this.val = v; } }, connect() {} };
      createdGains.push(g);
      return g;
    }
  }

  const els = {};
  const makeEl = (val = '') => ({
    value: val,
    textContent: '',
    innerHTML: '',
    classList: {
      _s: new Set(),
      add(c) { this._s.add(c); },
      remove(c) { this._s.delete(c); },
      toggle(c, f) { if (f === undefined ? !this._s.has(c) : f) this._s.add(c); else this._s.delete(c); },
      contains(c) { return this._s.has(c); }
    }
  });
  [
    'quickStratCategorySelect', 'quickStratNameInput', 'quickStratCoreSelect',
    'quickStratTargetSelect', 'overwatchVerdictBox', 'tacticaIntrusionAlertBox', 'btnToggleOverwatchTts'
  ].forEach(id => { els[id] = makeEl(); });

  const clientState = {
    battleRound: 2,
    playerCp: 2,
    activeMiseryIds: [],
    boardTelemetry: { units: [{ name: 'Einhyr Hearthguard', side: 'PLAYER' }] }
  };

  let requestedBody = null;
  globalThis.localStorage = { getItem: () => null, setItem: () => {} };
  globalThis.document = { getElementById: (id) => els[id] || null };
  globalThis.window = {
    AudioContext: MockOverwatchAudioCtx,
    addEventListener: () => {},
    getTacticaClientState: () => clientState,
    resolveConsoleReaction: async (choice, cost) => { clientState.playerCp -= cost; },
    VoxAudio: {
      getFactionTheme: () => 'votann',
      playClank: () => { auspexChimes += 1; }
    }
  };
  globalThis.fetch = async (_url, opts) => {
    requestedBody = JSON.parse(opts.body);
    return {
      ok: true,
      json: async () => ({
        ok: true,
        voice: 'en-GB-RyanNeural',
        audioBase64: Buffer.from('FAKE_MP3_BYTES').toString('base64')
      })
    };
  };

  delete require.cache[require.resolve(path.join(ROOT_DIR, 'js/tactica-overwatch.js'))];
  const overwatch = require(path.join(ROOT_DIR, 'js/tactica-overwatch.js'));

  try {
    const played = await overwatch.speakOverwatchLine('Void Armour active.');
    assert.equal(played, true);
    assert.equal(requestedBody.theme, 'votann');
    assert.equal(bufferStarted, true);
    assert.equal(createdFilters.length, 2);
    assert.equal(createdFilters[0].frequency.val, 260);
    assert.equal(createdFilters[1].frequency.val, 4200);
    assert.equal(createdGains[0].gain.val, 0.55);

    // Quick Stratagem sticky-bar helper + Misery #22 block
    els.quickStratCategorySelect.value = 'FACTION';
    overwatch.toggleQuickStratCategory();
    assert.equal(els.quickStratCoreSelect.classList.contains('hidden'), true);
    els.quickStratNameInput.value = 'Void Armour';
    els.quickStratTargetSelect.value = 'Hearthguard';
    const stratRes = await overwatch.triggerQuickStratagem(1);
    assert.equal(stratRes.rejected, false);
    assert.equal(stratRes.resolvedTarget, 'Einhyr Hearthguard');
    assert.equal(clientState.playerCp, 1);

    clientState.activeMiseryIds = [22];
    const blocked = await overwatch.triggerQuickStratagem(0);
    assert.equal(blocked.rejected, true, 'Misery #22 (Comms Jammed) must block Stratagems');

    // Offline fallback plays gentle auspex clank without throwing
    globalThis.fetch = async () => { throw new Error('Offline'); };
    const offlinePlayed = await overwatch.speakOverwatchLine('Offline test.');
    assert.equal(offlinePlayed, false);
    assert.ok(auspexChimes >= 1);
  } finally {
    delete globalThis.localStorage;
    delete globalThis.document;
    delete globalThis.window;
    delete globalThis.fetch;
  }
});
