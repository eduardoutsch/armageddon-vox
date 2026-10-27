# 📦 Fires of Armageddon // Bundle: JavaScript Core Audio & Synth Engine

Web Audio API sound generation, procedural ambient drones, and Auspex channel oscillators (`js/vox-audio.js` lines 1 to 850).

## 📑 Table of Contents
- [js/vox-audio.js (Part 1: Web Audio Synth & Oscillators, Lines 1-850)](#file-jsvoxaudiojspart1webaudiosynthoscillatorslines1850)

---

## File: `js/vox-audio.js (Part 1: Web Audio Synth & Oscillators, Lines 1-850)` <a id="file-jsvoxaudiojspart1webaudiosynthoscillatorslines1850"></a>

````javascript
/**
 * SANCTUARY OF ASH // VOX-CASTER AMBIENT PLAYLIST RANDOMIZER & TERMINAL SFX
 * Playlist: https://www.youtube.com/playlist?list=PL1PnO3JojeSmA_jPzjhuiKycUQ8BHHjek
 */
(function () {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const PLAYLIST_ID = 'PL1PnO3JojeSmA_jPzjhuiKycUQ8BHHjek';
  const STORAGE_KEY_MUSIC = 'soa_vox_music_enabled_v1';
  const STORAGE_KEY_TRACK_INDEX = 'soa_vox_track_index_v1';
  const STORAGE_KEY_TRACK_TIME = 'soa_vox_track_time_v1';
  const STORAGE_KEY_TRACK_ID = 'soa_vox_track_id_v1';

  // Curated 20 ambient 40K soundscapes from the official Sanctuary playlist
  const VOX_TRACK_IDS = [
    '2QQerwk9ibs',
    'spnhLfHGHko',
    'BXjLjZCMYOk',
    'MOcBnBzZ2us',
    'CCQBh3XlsvQ',
    '7Z--CqggdC4',
    'YwKHbMxBzPY',
    'uHBH4zXThFI',
    'O6HcnAFhfb4',
    'XFRYg1vPc-Q',
    'tXoEite1JYo',
    'Zi2kgjDhmC0',
    'Pg19ptB8kCQ',
    'k3w4rYX1ERw',
    'k5xDyG72wHE',
    'KPObDVPb_XM',
    'VMs_p5EWri4',
    'vwJOJiOixHo',
    'Ej5LheTW5Jk',
    'isCFBRHtjFo'
  ];

  let ytPlayer = null;
  let ytReady = false;
  let isPlaying = false;
  let progressInterval = null;

  // Default to ON unless user explicitly disabled it ('false')
  let wantMusic = true;
  try {
    const stored = localStorage.getItem(STORAGE_KEY_MUSIC);
    wantMusic = stored === null ? true : stored === 'true';
  } catch (err) {
    console.warn('Could not read music preference from localStorage:', err);
  }

  // =========================================================================
  // PART 1: TACTICAL TERMINAL SFX SUITE (WEB AUDIO SYNTH - VARIETY)
  // =========================================================================
  let audioCtx = null;

  function getAudioCtx() {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) audioCtx = new Ctx();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  /**
   * Synthesizes thematic Imperial cogitator sound effects.
   * Profiles:
   *  - 'heavy': Hydraulic bulkhead / launch button impact
   *  - 'auspex': CRT scanner cathode pulse / reticle chirp
   *  - 'pneumatic': Solenoid click / numeric valve nudge
   *  - 'card': Tactile data-slate latch / parchment card flip
   *  - 'relay': Standard cogitator copper relay switch
   */
  function playTerminalClank(profile = 'relay') {
    const ctx = getAudioCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const detune = 1 + (Math.random() * 0.12 - 0.06);

    if (profile === 'heavy' || profile === true) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(145 * detune, now);
      osc.frequency.exponentialRampToValueAtTime(32, now + 0.09);

      gain.gain.setValueAtTime(0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.095);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);

      const ringOsc = ctx.createOscillator();
      const ringGain = ctx.createGain();
      ringOsc.type = 'triangle';
      ringOsc.frequency.setValueAtTime(480 * detune, now);
      ringOsc.frequency.exponentialRampToValueAtTime(120, now + 0.06);

      ringGain.gain.setValueAtTime(0.08, now);
      ringGain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);

      ringOsc.connect(ringGain);
      ringGain.connect(ctx.destination);
      ringOsc.start(now);
      ringOsc.stop(now + 0.07);

    } else if (profile === 'auspex') {
      const chirpOsc = ctx.createOscillator();
      const chirpGain = ctx.createGain();
      chirpOsc.type = 'sine';
      chirpOsc.frequency.setValueAtTime(1400 * detune, now);
      chirpOsc.frequency.exponentialRampToValueAtTime(2400 * detune, now + 0.022);
      chirpOsc.frequency.exponentialRampToValueAtTime(800 * detune, now + 0.045);

      chirpGain.gain.setValueAtTime(0.12, now);
      chirpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.048);

      chirpOsc.connect(chirpGain);
      chirpGain.connect(ctx.destination);
      chirpOsc.start(now);
      chirpOsc.stop(now + 0.05);

    } else if (profile === 'pneumatic') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(380 * detune, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.025);

      gain.gain.setValueAtTime(0.11, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.028);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.03);

    } else if (profile === 'card') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(190 * detune, now);
      osc.frequency.exponentialRampToValueAtTime(55, now + 0.04);

      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.042);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.045);

      const snap = ctx.createOscillator();
      const snapGain = ctx.createGain();
      snap.type = 'square';
      snap.frequency.setValueAtTime(780 * detune, now);
      snap.frequency.exponentialRampToValueAtTime(220, now + 0.015);

      snapGain.gain.setValueAtTime(0.05, now);
      snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.016);

      snap.connect(snapGain);
      snapGain.connect(ctx.destination);
      snap.start(now);
      snap.stop(now + 0.018);

    } else {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(210 * detune, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.04);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);

      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      clickOsc.type = 'square';
      clickOsc.frequency.setValueAtTime(1250 * detune, now);
      clickOsc.frequency.exponentialRampToValueAtTime(280, now + 0.018);

      clickGain.gain.setValueAtTime(0.06, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

      clickOsc.connect(clickGain);
      clickGain.connect(ctx.destination);
      clickOsc.start(now);
      clickOsc.stop(now + 0.022);
    }
  }

  /**
   * 1. CRT Teletype / Keyboard Typing Micro-Tick
   * @param {'type'|'stream'|'redact'|'incoming'} mode
   */
  function playTeletypeTick(mode = 'stream') {
    const ctx = getAudioCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const jitter = 1 + (Math.random() * 0.18 - 0.09);

    if (mode === 'redact') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160 * jitter, now);
      osc.frequency.linearRampToValueAtTime(75, now + 0.045);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.052);
      return;
    }

    const baseFreq = mode === 'type' ? 980 : 1320;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = mode === 'type' ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(baseFreq * jitter, now);
    osc.frequency.exponentialRampToValueAtTime(260, now + 0.012);

    gain.gain.setValueAtTime(mode === 'type' ? 0.065 : 0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.014);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.015);
  }

  /**
   * 2. Ceramite Dice Clatter (Cascading multi-bounce roll sound)
   */
  function playDiceClatter() {
    const ctx = getAudioCtx();
    if (!ctx) return;

    const offsets = [0, 0.045, 0.095, 0.155, 0.225, 0.305];
    offsets.forEach((offset, idx) => {
      const t = ctx.currentTime + offset;
      const pitch = (620 - idx * 55) * (0.92 + Math.random() * 0.16);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(pitch, t);
      osc.frequency.exponentialRampToValueAtTime(110, t + 0.028);

      const vol = Math.max(0.04, 0.16 - idx * 0.02);
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.032);
    });
  }

  /**
   * 3. Master-Artificer Forge Anvil Strike (For Battle Traits & Weapon Mods)
   */
  function playForgeAnvil() {
    const ctx = getAudioCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const impact = ctx.createOscillator();
    const impGain = ctx.createGain();
    impact.type = 'sawtooth';
    impact.frequency.setValueAtTime(240, now);
    impact.frequency.exponentialRampToValueAtTime(52, now + 0.11);
    impGain.gain.setValueAtTime(0.24, now);
    impGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    impact.connect(impGain);
    impGain.connect(ctx.destination);
    impact.start(now);
    impact.stop(now + 0.13);

    [587.33, 880, 1174.66].forEach((freq, i) => {
      const ring = ctx.createOscillator();
      const rGain = ctx.createGain();
      ring.type = 'sine';
      ring.frequency.setValueAtTime(freq, now);
      rGain.gain.setValueAtTime(0.11 / (i + 1), now);
      rGain.gain.exponentialRampToValueAtTime(0.0008, now + 0.48);
      ring.connect(rGain);
      rGain.connect(ctx.destination);
      ring.start(now);
      ring.stop(now + 0.5);
    });
  }

  /**
   * 4. Sacred Stasis-Reliquary Choir Chord (For Crusade Relics)
   */
  function playRelicChoir() {
    const ctx = getAudioCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const freqs = [220, 329.63, 440, 659.25];
    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = idx % 2 === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(f * 0.997, now);
      osc.frequency.linearRampToValueAtTime(f * 1.003, now + 0.75);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.075 / (idx * 0.5 + 1), now + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.85);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.88);
    });
  }

  /**
   * 5. Medicae / Auspex Scar Hazard Klaxon (For Out of Action Failures & Scars)
   */
  function playScarHazard() {
    const ctx = getAudioCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    [0, 0.16].forEach((offset, idx) => {
      const t = now + offset;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(idx === 0 ? 155 : 122, t);
      osc.frequency.linearRampToValueAtTime(idx === 0 ? 98 : 58, t + 0.14);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.16);
    });
  }

  /**
   * 6. Inquisitorial Dossier Wax-Seal Stamp & Astropathic Burst
   */
  function playDossierStamp() {
    const ctx = getAudioCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    [0, 0.08].forEach((offset, i) => {
      const t = now + offset;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(i === 0 ? 160 : 125, t);
      osc.frequency.exponentialRampToValueAtTime(34, t + 0.075);
      gain.gain.setValueAtTime(0.24, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.085);
    });

    [1480, 1920, 2480].forEach((freq, idx) => {
      const t = now + 0.16 + idx * 0.035;
      const chirp = ctx.createOscillator();
      const cGain = ctx.createGain();
      chirp.type = 'sine';
      chirp.frequency.setValueAtTime(freq, t);
      cGain.gain.setValueAtTime(0.08, t);
      cGain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
      chirp.connect(cGain);
      cGain.connect(ctx.destination);
      chirp.start(t);
      chirp.stop(t + 0.032);
    });
  }

  /**
   * 7. Warp-Breach Intrusion & PL 4 Classified Apex Anomaly Siren!
   *    (Sub-bass Geller-field failure rumble + dual-tritone Imperial void-klaxon)
   */
  function playWarpSiren() {
    const ctx = getAudioCtx();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Layer A: Deep Geller-field sub-bass rupture (110Hz -> 32Hz)
    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.type = 'sawtooth';
    sub.frequency.setValueAtTime(110, now);
    sub.frequency.exponentialRampToValueAtTime(32, now + 0.85);
    subGain.gain.setValueAtTime(0.26, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.88);
    sub.connect(subGain);
    subGain.connect(ctx.destination);
    sub.start(now);
    sub.stop(now + 0.9);

    // Layer B: Dual-pulse dissonant tritone Red Alert klaxon
    [0, 0.42].forEach((offset) => {
      const t = now + offset;
      [440, 622.25].forEach((baseFreq, i) => {
        const siren = ctx.createOscillator();
        const sGain = ctx.createGain();
        siren.type = i === 0 ? 'sawtooth' : 'square';
        siren.frequency.setValueAtTime(baseFreq * 0.85, t);
        siren.frequency.linearRampToValueAtTime(baseFreq * 1.35, t + 0.22);
        siren.frequency.linearRampToValueAtTime(baseFreq * 0.75, t + 0.38);

        sGain.gain.setValueAtTime(0.001, t);
        sGain.gain.linearRampToValueAtTime(i === 0 ? 0.14 : 0.08, t + 0.04);
        sGain.gain.exponentialRampToValueAtTime(0.001, t + 0.39);

        siren.connect(sGain);
        sGain.connect(ctx.destination);
        siren.start(t);
        siren.stop(t + 0.4);
      });
    });
  }

  /**
   * 8. Orbital Auspex Threat Lock (For PL 1-3 Unbound Adversaries & Anomaly Surges)
   */
  function playAuspexLock() {
    const ctx = getAudioCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const pings = [960, 1280, 1640, 2180];
    pings.forEach((freq, idx) => {
      const t = now + idx * 0.065;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.72, t + 0.05);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.055);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.058);
    });
  }

  /**
   * 9. Lexmechanicus Cloud Pool Sync Audio Cue (Single-Shot Soft Data Pulse)
   * Plays a subtle, non-intrusive high-tech datalink chirp strictly once.
   */
  let lastCloudSyncChimeTime = 0;
  function playCloudSyncChime(force = false) {
    const nowMs = Date.now();
    if (!force && nowMs - lastCloudSyncChimeTime < 1200) return false;
    lastCloudSyncChimeTime = nowMs;

    const ctx = getAudioCtx();
    if (!ctx) return false;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1046.5, now);

    gain.gain.setValueAtTime(0.045, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.075);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
    return true;
  }


  /**
   * 10. Heavy Bolter / Kinetic Kill Discharge
   * Synthesizes a punchy explosive round impact + mechanical shell casing ring.
   */
  function playBoltgunBlast() {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const detune = 1 + (Math.random() * 0.12 - 0.06);

    const punch = ctx.createOscillator();
    const punchGain = ctx.createGain();
    punch.type = 'sawtooth';
    punch.frequency.setValueAtTime(140 * detune, now);
    punch.frequency.exponentialRampToValueAtTime(28, now + 0.11);
    punchGain.gain.setValueAtTime(0.26, now);
    punchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    punch.connect(punchGain);
    punchGain.connect(ctx.destination);
    punch.start(now);
    punch.stop(now + 0.13);

    const crack = ctx.createOscillator();
    const crackGain = ctx.createGain();
    crack.type = 'square';
    crack.frequency.setValueAtTime(420 * detune, now);
    crack.frequency.exponentialRampToValueAtTime(70, now + 0.05);
    crackGain.gain.setValueAtTime(0.18, now);
    crackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);
    crack.connect(crackGain);
    crackGain.connect(ctx.destination);
    crack.start(now);
    crack.stop(now + 0.06);

    const ring = ctx.createOscillator();
    const ringGain = ctx.createGain();
    ring.type = 'sine';
    ring.frequency.setValueAtTime(1860 * detune, now + 0.04);
    ring.frequency.exponentialRampToValueAtTime(940, now + 0.16);
    ringGain.gain.setValueAtTime(0.001, now);
    ringGain.gain.setValueAtTime(0.06, now + 0.04);
    ringGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    ring.connect(ringGain);
    ringGain.connect(ctx.destination);
    ring.start(now + 0.04);
    ring.stop(now + 0.19);
  }

  /**
   * 11. Plasma Power Surge / Resource Gain Chime
   * Synthesizes an ascending tri-tone crystal harmonic for acquiring SP, CP, or Objectives.
   */
  function playPowerSurge() {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.5];

    freqs.forEach((freq, idx) => {
      const t = now + idx * 0.038;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.linearRampToValueAtTime(freq * 1.015, t + 0.12);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.11 / (idx * 0.3 + 1), t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.2);
    });
  }

  /**
   * 12. Munitorum Pneumatic Vault Dispenser / Purchase Clank
   * Synthesizes a heavy pneumatic pressure drop + industrial solenoid clamp for spending resources.
   */
  function playPneumaticDispense() {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    const hiss = ctx.createOscillator();
    const hissGain = ctx.createGain();
    hiss.type = 'sawtooth';
    hiss.frequency.setValueAtTime(1450, now);
    hiss.frequency.exponentialRampToValueAtTime(220, now + 0.045);
    hissGain.gain.setValueAtTime(0.09, now);
    hissGain.gain.exponentialRampToValueAtTime(0.001, now + 0.048);
    hiss.connect(hissGain);
    hissGain.connect(ctx.destination);
    hiss.start(now);
    hiss.stop(now + 0.05);

    const clank = ctx.createOscillator();
    const clankGain = ctx.createGain();
    clank.type = 'square';
    clank.frequency.setValueAtTime(260, now + 0.02);
    clank.frequency.exponentialRampToValueAtTime(55, now + 0.08);
    clankGain.gain.setValueAtTime(0.001, now);
    clankGain.gain.setValueAtTime(0.14, now + 0.02);
    clankGain.gain.exponentialRampToValueAtTime(0.001, now + 0.085);
    clank.connect(clankGain);
    clankGain.connect(ctx.destination);
    clank.start(now + 0.02);
    clank.stop(now + 0.09);
  }

  /**
   * 13. Magnetic Lock / Field Fortification Deploy Snap
   * Tactile double-click for checkboxes and marker toggles.
   */
  function playMagLock() {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    const latch = ctx.createOscillator();
    const latchGain = ctx.createGain();
    latch.type = 'square';
    latch.frequency.setValueAtTime(1180, now);
    latch.frequency.exponentialRampToValueAtTime(240, now + 0.014);
    latchGain.gain.setValueAtTime(0.07, now);
    latchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.016);
    latch.connect(latchGain);
    latchGain.connect(ctx.destination);
    latch.start(now);
    latch.stop(now + 0.018);

    const mag = ctx.createOscillator();
    const magGain = ctx.createGain();
    mag.type = 'triangle';
    mag.frequency.setValueAtTime(210, now + 0.025);
    mag.frequency.exponentialRampToValueAtTime(42, now + 0.065);
    magGain.gain.setValueAtTime(0.001, now);
    magGain.gain.setValueAtTime(0.13, now + 0.025);
    magGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
    mag.connect(magGain);
    magGain.connect(ctx.destination);
    mag.start(now + 0.025);
    mag.stop(now + 0.075);
  }

  /**
   * 14. Voidship Battle Warhorn / Round Advance Vox-Chime
   * Low Imperial brass drone announcing battle round transitions.
   */
  function playWarhorn() {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    const hornA = ctx.createOscillator();
    const gainA = ctx.createGain();
    hornA.type = 'sawtooth';
    hornA.frequency.setValueAtTime(110, now);
    hornA.frequency.linearRampToValueAtTime(108, now + 0.7);
    gainA.gain.setValueAtTime(0.001, now);
    gainA.gain.linearRampToValueAtTime(0.18, now + 0.08);
    gainA.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
    hornA.connect(gainA);
    gainA.connect(ctx.destination);
    hornA.start(now);
    hornA.stop(now + 0.8);

    const hornB = ctx.createOscillator();
    const gainB = ctx.createGain();
    hornB.type = 'triangle';
    hornB.frequency.setValueAtTime(164.8, now);
    hornB.frequency.linearRampToValueAtTime(162, now + 0.7);
    gainB.gain.setValueAtTime(0.001, now);
    gainB.gain.linearRampToValueAtTime(0.12, now + 0.1);
    gainB.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
    hornB.connect(gainB);
    gainB.connect(ctx.destination);
    hornB.start(now);
    hornB.stop(now + 0.8);
  }

  /**
   * 15. Warp Static & Empyric Dissonance
   * Eerie binaural psychic ripple when Misery cards are revealed.
   */
  function playWarpStatic() {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    [320, 326].forEach((f) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);
      osc.frequency.linearRampToValueAtTime(f * 0.94, now + 0.4);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.09, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    });

    const rasp = ctx.createOscillator();
    const raspGain = ctx.createGain();
    rasp.type = 'sawtooth';
    rasp.frequency.setValueAtTime(85, now);
    rasp.frequency.linearRampToValueAtTime(45, now + 0.35);
    raspGain.gain.setValueAtTime(0.001, now);
    raspGain.gain.linearRampToValueAtTime(0.08, now + 0.04);
    raspGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
    rasp.connect(raspGain);
    raspGain.connect(ctx.destination);
    rasp.start(now);
    rasp.stop(now + 0.4);
  }

  /**
   * 16. Dataslate Cipher Decryption Chatter
   * High-speed encrypted burst for Secondary Missions and Secret Objectives.
   */
  function playCipherDecryption() {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [1760, 2200, 1980, 2640];

    notes.forEach((pitch, i) => {
      const t = now + i * 0.024;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(pitch, t);
      osc.frequency.exponentialRampToValueAtTime(pitch * 0.65, t + 0.018);
      gain.gain.setValueAtTime(0.07, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.022);
    });
  }

  /**
   * 17. Cogitator Phase Stepper Detent
   * Tactile rotary click for match flow stepper and navigation tabs.
   */
  function playCogitatorStep() {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(740, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.024);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.026);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.028);
  }

  /**
   * 18. Magnetic Degauss & Incinerator Data Purge
   * Downward magnetic degaussing hum for clearing logs and purging records.
   */
  function playDegaussPurge() {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(32, now + 0.28);
    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.32);
  }

  /**
   * 19. Necron Gauss Disintegration Pulse
   * Eerie tachyon/chronomantic green energy hum for Tomb-Ship interactions.
   */
  function playNecronGaussPulse() {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    const beam = ctx.createOscillator();
    const beamGain = ctx.createGain();
    beam.type = 'sine';
    beam.frequency.setValueAtTime(220, now);
    beam.frequency.linearRampToValueAtTime(75, now + 0.24);
    beamGain.gain.setValueAtTime(0.001, now);
    beamGain.gain.linearRampToValueAtTime(0.15, now + 0.03);
    beamGain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
    beam.connect(beamGain);
    beamGain.connect(ctx.destination);
    beam.start(now);
    beam.stop(now + 0.28);

    const flutter = ctx.createOscillator();
    const flutterGain = ctx.createGain();
    flutter.type = 'triangle';
    flutter.frequency.setValueAtTime(880, now);
    flutter.frequency.exponentialRampToValueAtTime(280, now + 0.14);
    flutterGain.gain.setValueAtTime(0.06, now);
    flutterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    flutter.connect(flutterGain);
    flutterGain.connect(ctx.destination);
    flutter.start(now);
    flutter.stop(now + 0.16);
  }

  let hasUserInteracted = false;

  function handleUserGestureForMusic(e) {
    hasUserInteracted = true;
    if (!wantMusic) return;
    if (e && e.target && typeof e.target.closest === 'function' && e.target.closest('#voxMusicToggle, #voxMusicSkip')) {
      return;
    }
    if (!ytReady) {
      loadYouTubeAPI();
    } else if (!isPlayerActuallyPlaying()) {
      resumeOrStartMusic(true);
    }
  }

  // Global listener: contextually triggers sound profiles on clicks
  document.addEventListener('click', (e) => {
    const target = e.target.closest(
      'button, .suite-link, .choice-card, .slider-node, .map-node-group, summary, .terminal-link-btn, .fs-pill-btn, .mini-btn, .phase-step-btn, input[type="checkbox"], input[type="radio"], .chip, .nav-pills button'
    );
    if (target) {
      if (target.dataset && target.dataset.sfx === 'custom') {
        // Handled explicitly by upgrade roller / stamp / siren functions
````
