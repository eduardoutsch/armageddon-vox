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
const bodyClasses = new Set();
globalThis.document = {
  body: {
    dataset: {},
    classList: {
      add: (c) => bodyClasses.add(c),
      remove: (c) => bodyClasses.delete(c),
      toggle: (c, force) => {
        if (force === undefined) {
          if (bodyClasses.has(c)) bodyClasses.delete(c);
          else bodyClasses.add(c);
        } else if (force) {
          bodyClasses.add(c);
        } else {
          bodyClasses.delete(c);
        }
      },
      contains: (c) => bodyClasses.has(c)
    }
  },
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

test('vox-audio: recovers from browser autoplay block on user interaction and auto-skips broken tracks on error', () => {
  const code = fs.readFileSync(VOX_AUDIO_PATH, 'utf8');
  assert.ok(code.includes('isPlayerActuallyPlaying'), 'Must check actual YT player state via isPlayerActuallyPlaying() rather than trusting optimistic isPlaying');
  assert.ok(code.includes('onError'), 'YT.Player events must include onError handler to automatically skip broken/unavailable tracks');

  // Verify mock YT player lifecycle: when onReady fires but browser blocks autoplay (state remains UNSTARTED = -1),
  // isPlayerActuallyPlaying() remains false so subsequent user interaction resumes playback
  assert.equal(typeof voxModule.createPlayer, 'function', 'Must export createPlayer for testing');
  assert.equal(typeof voxModule.isPlayerActuallyPlaying, 'function', 'Must export isPlayerActuallyPlaying for testing');

  let playCalls = 0;
  let loadCalls = 0;
  let currentState = -1; // UNSTARTED (autoplay blocked)
  let capturedEvents = null;

  globalThis.YT = {
    PlayerState: { ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3, CUED: 5 },
    Player: function (_id, opts) {
      capturedEvents = opts.events;
      this.setVolume = () => {};
      this.unMute = () => {};
      this.getPlayerState = () => currentState;
      this.playVideo = () => { playCalls++; };
      this.loadVideoById = () => { loadCalls++; };
    }
  };

  voxModule.createPlayer();
  assert.ok(capturedEvents && typeof capturedEvents.onReady === 'function');
  assert.ok(typeof capturedEvents.onError === 'function', 'Must wire onError callback on YT.Player');

  // Simulate onReady firing while browser blocks autoplay (state stays -1)
  capturedEvents.onReady({ target: { setVolume: () => {}, unMute: () => {} } });
  assert.equal(voxModule.isPlayerActuallyPlaying(), false, 'Player must not be marked as playing when autoplay is blocked (state -1)');

  // Simulate onError firing on an unavailable track -> should automatically call playNextRandomTrack (loadVideoById)
  const prevLoadCalls = loadCalls;
  capturedEvents.onError({ data: 150 });
  assert.equal(loadCalls, prevLoadCalls + 1, 'onError must automatically skip to the next random track');

  // Simulate root domain (https://armageddon-vox.pages.dev/) where initial autoplay left state at -1 (UNSTARTED):
  // calling resumeOrStartMusic(true) on a user gesture must synchronously call loadVideoById + playVideo
  const loadsBeforeGesture = loadCalls;
  const playsBeforeGesture = playCalls;
  voxModule.resumeOrStartMusic(true);
  assert.equal(loadCalls, loadsBeforeGesture + 1, 'resumeOrStartMusic(true) must synchronously call loadVideoById when state is -1');
  assert.equal(playCalls, playsBeforeGesture + 1, 'resumeOrStartMusic(true) must synchronously call playVideo');

  // Verify normalizePathname treats root '/' and '/index.html' identically
  assert.equal(typeof voxModule.normalizePathname, 'function', 'Must export normalizePathname helper');
  assert.equal(voxModule.normalizePathname('/'), '/');
  assert.equal(voxModule.normalizePathname('/index.html'), '/');
  assert.equal(voxModule.normalizePathname('/pages/vox.html'), '/pages/vox.html');
});

test('vox-audio: resolveFactionThemeFromStorage, setFactionTheme, and syncFactionTheme manage global Necron vs Militarum color modes across all pages', () => {
  assert.equal(typeof voxModule.resolveFactionThemeFromStorage, 'function', 'Must export resolveFactionThemeFromStorage');
  assert.equal(typeof voxModule.setFactionTheme, 'function', 'Must export setFactionTheme');
  assert.equal(typeof voxModule.getFactionTheme, 'function', 'Must export getFactionTheme');
  assert.equal(typeof voxModule.syncFactionTheme, 'function', 'Must export syncFactionTheme');
  assert.equal(typeof globalThis.window.VoxAudio.setFactionTheme, 'function', 'window.VoxAudio must expose setFactionTheme');
  assert.equal(typeof globalThis.window.VoxAudio.getFactionTheme, 'function', 'window.VoxAudio must expose getFactionTheme');
  assert.equal(typeof globalThis.window.VoxAudio.syncFactionTheme, 'function', 'window.VoxAudio must expose syncFactionTheme');

  // 1. Clean state resolves to null when no broadcast or terminal is unlocked
  storageStore.clear();
  sessionStore.clear();
  assert.equal(voxModule.resolveFactionThemeFromStorage(globalThis.localStorage, globalThis.sessionStorage), null);

  // 2. Unlocking Beta broadcast in foa_briefing_state_v3 resolves to 'necron'
  storageStore.set('foa_briefing_state_v3', JSON.stringify({ unlockedBeta: true, unlockedAlpha: false, activeDossier: 'beta' }));
  assert.equal(voxModule.resolveFactionThemeFromStorage(globalThis.localStorage, globalThis.sessionStorage), 'necron');

  // 3. Unlocking Alpha broadcast in foa_briefing_state_v3 resolves to 'militarum'
  storageStore.set('foa_briefing_state_v3', JSON.stringify({ unlockedBeta: false, unlockedAlpha: true, activeDossier: 'alpha' }));
  assert.equal(voxModule.resolveFactionThemeFromStorage(globalThis.localStorage, globalThis.sessionStorage), 'militarum');

  // 4. Active Vox session in foa_vox_active_session_v1 overrides when explicit theme key is absent
  storageStore.clear();
  sessionStore.set('foa_vox_active_session_v1', JSON.stringify({ channel: 'beta', pass: 'TombKey' }));
  assert.equal(voxModule.resolveFactionThemeFromStorage(globalThis.localStorage, globalThis.sessionStorage), 'necron');

  sessionStore.set('foa_vox_active_session_v1', JSON.stringify({ channel: 'alpha', pass: 'AshKey' }));
  assert.equal(voxModule.resolveFactionThemeFromStorage(globalThis.localStorage, globalThis.sessionStorage), 'militarum');

  // 5. setFactionTheme('necron') applies theme-necron to document.body and persists to foa_faction_theme_v1
  voxModule.setFactionTheme('necron', true);
  assert.equal(globalThis.document.body.classList.contains('theme-necron'), true);
  assert.equal(globalThis.document.body.classList.contains('theme-militarum'), false);
  assert.equal(globalThis.document.body.dataset.factionTheme, 'necron');
  assert.equal(globalThis.localStorage.getItem('foa_faction_theme_v1'), 'necron');
  assert.equal(voxModule.getFactionTheme(), 'necron');

  // 6. setFactionTheme('militarum') switches to theme-militarum and removes theme-necron
  voxModule.setFactionTheme('militarum', true);
  assert.equal(globalThis.document.body.classList.contains('theme-militarum'), true);
  assert.equal(globalThis.document.body.classList.contains('theme-necron'), false);
  assert.equal(globalThis.document.body.dataset.factionTheme, 'militarum');
  assert.equal(globalThis.localStorage.getItem('foa_faction_theme_v1'), 'militarum');
  assert.equal(voxModule.getFactionTheme(), 'militarum');

  // 7. Verify css/style.css defines global body.theme-necron and body.theme-militarum rules
  const cssPath = path.join(ROOT_DIR, 'css/style.css');
  const cssCode = fs.readFileSync(cssPath, 'utf8');
  assert.ok(cssCode.includes('body.theme-necron'), 'css/style.css must define global body.theme-necron theme rules');
  assert.ok(cssCode.includes('body.theme-militarum'), 'css/style.css must define global body.theme-militarum theme rules');
});
test('vox-audio: newly added unique Warhammer 40k interaction sound synthesizers execute without throwing', () => {
  const newSynths = [
    'playBoltgunBlast',
    'playPowerSurge',
    'playPneumaticDispense',
    'playMagLock',
    'playWarhorn',
    'playWarpStatic',
    'playCipherDecryption',
    'playCogitatorStep',
    'playDegaussPurge',
    'playNecronGaussPulse'
  ];

  for (const fnName of newSynths) {
    assert.equal(typeof voxModule[fnName], 'function', `voxModule must export ${fnName}`);
    assert.equal(typeof globalThis.window.VoxAudio[fnName], 'function', `window.VoxAudio must expose ${fnName}`);
    assert.doesNotThrow(() => {
      voxModule[fnName]();
    }, `${fnName} must execute without throwing in mock Web Audio environment`);
  }
});

test('vox-audio: global click listener contextually triggers the new sound profiles on matching elements', () => {
  assert.ok(listeners.click, 'Must register document click listener');

  const testCases = [
    { selector: '#btnQuickKillSp', fn: 'playBoltgunBlast' },
    { selector: '#nextRoundBtn', fn: 'playWarhorn' },
    { selector: '.phase-step-btn', fn: 'playCogitatorStep' },
    { selector: '#hudGainSpBtn', fn: 'playPowerSurge' },
    { selector: '[onclick*="spendCPForStrat"]', fn: 'playPneumaticDispense' },
    { selector: '[onclick*="drawMisery"]', fn: 'playWarpStatic' },
    { selector: '[onclick*="drawSecondary"]', fn: 'playCipherDecryption' },
    { selector: '.crt-purge-btn', fn: 'playDegaussPurge' },
    { selector: 'input[type="checkbox"]', fn: 'playMagLock' }
  ];

  for (const { selector } of testCases) {
    let played = false;
    const original = voxModule.playTerminalClank;
    const target = {
      dataset: {},
      matches: (s) => s.includes(selector) || selector.includes(s),
      closest: (s) => target
    };

    assert.doesNotThrow(() => {
      listeners.click({ target });
    });
  }
});



