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
    'quickStratTargetSelect', 'quickStratDurationSelect', 'overwatchVerdictBox', 'tacticaIntrusionAlertBox', 'btnToggleOverwatchTts'
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
    assert.equal(stratRes.durationScope, 'PHASE', 'Quick Stratagem must default to PHASE durationScope');
    assert.equal(clientState.playerCp, 1);

    els.quickStratDurationSelect.value = 'ROUND';
    const roundStratRes = await overwatch.triggerQuickStratagem(1);
    assert.equal(roundStratRes.rejected, false);
    assert.equal(roundStratRes.durationScope, 'ROUND', 'Quick Stratagem with ROUND selected must set ROUND durationScope');
    assert.equal(clientState.playerCp, 0);

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

test('SPA router safety & Audio Gesture Unlock: replaces _foaUnlockAudio and _foaPttKeyDown/_foaPttKeyUp cleanly, unlocks suspended AudioContext on pointerdown, and falls back to HTML5 Audio Data-URI when AudioContext stays suspended', async () => {
  const overwatchCore = require(path.join(ROOT_DIR, 'js/tactica-overwatch-core.js'));
  Object.assign(globalThis, overwatchCore);

  const listeners = { pointerdown: new Set(), keydown: new Set(), keyup: new Set() };
  let removedPointerDown = 0;
  let removedKeyDown = 0;
  let removedKeyUp = 0;
  let recognitionInstances = 0;
  let resumeCalls = 0;
  let html5AudioSrc = '';
  let html5AudioVolume = 0;
  let html5AudioPlayed = false;

  class MockSuspendedAudioCtx {
    constructor() {
      this.state = 'suspended';
      this.currentTime = 0;
      this.destination = {};
    }
    async resume() {
      resumeCalls += 1;
      // Intentionally keep state === 'suspended' to verify HTML5 Audio fallback!
    }
  }

  class MockHtml5Audio {
    constructor(src) {
      html5AudioSrc = src;
      this.volume = 1;
    }
    async play() {
      html5AudioVolume = this.volume;
      html5AudioPlayed = true;
    }
  }

  class MockSpeechRecognition {
    constructor() {
      recognitionInstances += 1;
    }
    start() {}
    stop() {}
  }

  const pttPill = {
    classList: {
      _s: new Set(),
      add(c) { this._s.add(c); },
      remove(c) { this._s.delete(c); },
      contains(c) { return this._s.has(c); }
    },
    textContent: ''
  };

  globalThis.Audio = MockHtml5Audio;
  globalThis.document = {
    getElementById: (id) => (id === 'pttStatusPill' ? pttPill : null)
  };
  globalThis.window = {
    AudioContext: MockSuspendedAudioCtx,
    Audio: MockHtml5Audio,
    SpeechRecognition: MockSpeechRecognition,
    addEventListener(type, fn) {
      if (listeners[type]) listeners[type].add(fn);
    },
    removeEventListener(type, fn) {
      if (type === 'pointerdown' && listeners.pointerdown.delete(fn)) removedPointerDown += 1;
      if (type === 'keydown' && listeners.keydown.delete(fn)) removedKeyDown += 1;
      if (type === 'keyup' && listeners.keyup.delete(fn)) removedKeyUp += 1;
    }
  };
  globalThis.fetch = async () => ({
    ok: true,
    json: async () => ({
      ok: true,
      voice: 'en-GB-RyanNeural',
      audioBase64: 'RkFLRV9NUDM='
    })
  });

  const modPath = path.join(ROOT_DIR, 'js/tactica-overwatch.js');
  let overwatch = null;
  try {
    // Simulate navigating to tactica.html 3 times via vox-audio.js SPA router
    for (let i = 0; i < 3; i++) {
      delete require.cache[require.resolve(modPath)];
      overwatch = require(modPath);
    }

    assert.equal(typeof globalThis.window._foaUnlockAudio, 'function', 'Must bind window._foaUnlockAudio');
    assert.equal(typeof globalThis.window._foaPttKeyDown, 'function', 'Must store window._foaPttKeyDown');
    assert.equal(typeof globalThis.window._foaPttKeyUp, 'function', 'Must store window._foaPttKeyUp');
    assert.equal(removedPointerDown, 2, 'Must remove previous pointerdown unlock listener before re-binding');
    assert.equal(removedKeyDown, 4, 'Must remove previous _foaUnlockAudio + _foaPttKeyDown keydown listeners before re-binding');
    assert.equal(removedKeyUp, 2, 'Must remove previous keyup listener before re-binding');
    assert.equal(listeners.pointerdown.size, 1, 'Strictly 1 pointerdown listener must remain active');
    assert.equal(listeners.keydown.size, 2, 'Strictly 2 keydown listeners (_foaUnlockAudio + _foaPttKeyDown) must remain active');
    assert.equal(listeners.keyup.size, 1, 'Strictly 1 keyup listener must remain active');

    // User gesture pointerdown unlocks overwatchAudioCtx synchronously
    for (const fn of listeners.pointerdown) {
      fn({});
    }
    assert.equal(resumeCalls, 1, 'First pointerdown user gesture must call overwatchAudioCtx.resume()');

    // When overwatchAudioCtx stays suspended, speakOverwatchLine falls back to HTML5 Audio Data-URI at 0.6 volume
    const fallbackPlayed = await overwatch.speakOverwatchLine('Test HTML5 Audio fallback');
    assert.equal(fallbackPlayed, true);
    assert.equal(html5AudioPlayed, true);
    assert.equal(html5AudioVolume, 0.6);
    assert.equal(html5AudioSrc, 'data:audio/mpeg;base64,RkFLRV9NUDM=');

    for (const fn of listeners.keydown) {
      fn({ code: 'Space', preventDefault() {}, target: { tagName: 'BODY' } });
    }
    assert.equal(recognitionInstances, 1, 'Pressing [Space] once after SPA swaps must start strictly 1 SpeechRecognition');
    for (const fn of listeners.keyup) {
      fn({ code: 'Space' });
    }
  } finally {
    delete globalThis.Audio;
    delete globalThis.document;
    delete globalThis.window;
    delete globalThis.fetch;
  }
});
