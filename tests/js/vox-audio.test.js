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




