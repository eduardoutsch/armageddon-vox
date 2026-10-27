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

  /**
   * 20. Stray Orbital Bombardment / Lance Strike / Macro-Cannon Barrage
   * Screeching atmospheric descent, high-energy concussive detonation, and deep sub-bass seismic rumble.
   */
  function playOrbitalBombardment() {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    // 1. High-altitude atmospheric tearing whistle (screech descending rapidly)
    const whistle = ctx.createOscillator();
    const whistleGain = ctx.createGain();
    const whistleFilter = ctx.createBiquadFilter();
    whistle.type = 'sawtooth';
    whistle.frequency.setValueAtTime(2600, now);
    whistle.frequency.exponentialRampToValueAtTime(140, now + 0.35);

    whistleFilter.type = 'bandpass';
    whistleFilter.frequency.setValueAtTime(1800, now);
    whistleFilter.frequency.exponentialRampToValueAtTime(320, now + 0.35);
    whistleFilter.Q.value = 3.5;

    whistleGain.gain.setValueAtTime(0.01, now);
    whistleGain.gain.linearRampToValueAtTime(0.18, now + 0.08);
    whistleGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

    whistle.connect(whistleFilter);
    whistleFilter.connect(whistleGain);
    whistleGain.connect(ctx.destination);
    whistle.start(now);
    whistle.stop(now + 0.4);

    // 2. Concussive explosive noise burst (impact detonation)
    const impactTime = now + 0.28;
    const noiseBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.6), ctx.sampleRate);
    const noiseData = noiseBuffer.getChannelData(0);
    for (let i = 0; i < noiseData.length; i++) {
      noiseData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (ctx.sampleRate * 0.12));
    }
    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'lowpass';
    noiseFilter.frequency.setValueAtTime(450, impactTime);
    noiseFilter.frequency.exponentialRampToValueAtTime(80, impactTime + 0.5);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.001, impactTime);
    noiseGain.gain.linearRampToValueAtTime(0.32, impactTime + 0.02);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, impactTime + 0.58);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noiseSource.start(impactTime);
    noiseSource.stop(impactTime + 0.6);

    // 3. Sub-bass seismic reverberation rumble (planetary shockwave)
    const rumbleOsc = ctx.createOscillator();
    const rumbleGain = ctx.createGain();
    rumbleOsc.type = 'sine';
    rumbleOsc.frequency.setValueAtTime(58, impactTime);
    rumbleOsc.frequency.exponentialRampToValueAtTime(32, impactTime + 0.9);

    rumbleGain.gain.setValueAtTime(0.001, impactTime);
    rumbleGain.gain.linearRampToValueAtTime(0.35, impactTime + 0.05);
    rumbleGain.gain.exponentialRampToValueAtTime(0.001, impactTime + 0.95);

    rumbleOsc.connect(rumbleGain);
    rumbleGain.connect(ctx.destination);
    rumbleOsc.start(impactTime);
    rumbleOsc.stop(impactTime + 1.0);
  }

  /**
   * 21. Tactical Terminal Power On / Cathode Initialization
   * Two distinct soundscapes:
   * - Alpha: Imperial CRT cathode hum, heavy switch clunk, rising 15.75 kHz flyback whistle & high-voltage crackle.
   * - Beta: Necron Gauss resonance, dual dissonant crystalline sine wave phase sweep with chronomantic ring-modulation.
   *
   * @param {string} [channel='alpha'] - 'alpha' | 'beta'
   */
  function playTerminalPowerOn(channel = 'alpha') {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const isBeta = String(channel).toLowerCase() === 'beta';

    if (isBeta) {
      const oscA = ctx.createOscillator();
      const oscB = ctx.createOscillator();
      const gainA = ctx.createGain();
      const gainB = ctx.createGain();

      oscA.type = 'sine';
      oscB.type = 'triangle';
      oscA.frequency.setValueAtTime(180, now);
      oscA.frequency.exponentialRampToValueAtTime(540, now + 0.4);
      oscB.frequency.setValueAtTime(370, now);
      oscB.frequency.exponentialRampToValueAtTime(1110, now + 0.4);

      gainA.gain.setValueAtTime(0.001, now);
      gainA.gain.linearRampToValueAtTime(0.14, now + 0.06);
      gainA.gain.exponentialRampToValueAtTime(0.001, now + 0.48);

      gainB.gain.setValueAtTime(0.001, now);
      gainB.gain.linearRampToValueAtTime(0.1, now + 0.1);
      gainB.gain.exponentialRampToValueAtTime(0.001, now + 0.46);

      oscA.connect(gainA);
      oscB.connect(gainB);
      gainA.connect(ctx.destination);
      gainB.connect(ctx.destination);

      oscA.start(now);
      oscB.start(now);
      oscA.stop(now + 0.5);
      oscB.stop(now + 0.5);

      const ping = ctx.createOscillator();
      const pingGain = ctx.createGain();
      ping.type = 'sine';
      ping.frequency.setValueAtTime(1480, now + 0.2);
      ping.frequency.exponentialRampToValueAtTime(740, now + 0.45);
      pingGain.gain.setValueAtTime(0.001, now + 0.2);
      pingGain.gain.linearRampToValueAtTime(0.12, now + 0.23);
      pingGain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);
      ping.connect(pingGain);
      pingGain.connect(ctx.destination);
      ping.start(now + 0.2);
      ping.stop(now + 0.5);

    } else {
      const switchSnap = ctx.createOscillator();
      const switchGain = ctx.createGain();
      switchSnap.type = 'square';
      switchSnap.frequency.setValueAtTime(180, now);
      switchSnap.frequency.exponentialRampToValueAtTime(45, now + 0.03);
      switchGain.gain.setValueAtTime(0.16, now);
      switchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
      switchSnap.connect(switchGain);
      switchGain.connect(ctx.destination);
      switchSnap.start(now);
      switchSnap.stop(now + 0.04);

      const hum = ctx.createOscillator();
      const humGain = ctx.createGain();
      hum.type = 'sawtooth';
      hum.frequency.setValueAtTime(60, now + 0.02);
      hum.frequency.linearRampToValueAtTime(120, now + 0.45);
      humGain.gain.setValueAtTime(0.001, now + 0.02);
      humGain.gain.linearRampToValueAtTime(0.12, now + 0.12);
      humGain.gain.exponentialRampToValueAtTime(0.001, now + 0.52);
      hum.connect(humGain);
      humGain.connect(ctx.destination);
      hum.start(now + 0.02);
      hum.stop(now + 0.55);

      const flyback = ctx.createOscillator();
      const flybackGain = ctx.createGain();
      flyback.type = 'sine';
      flyback.frequency.setValueAtTime(3200, now + 0.05);
      flyback.frequency.exponentialRampToValueAtTime(15750, now + 0.4);
      flybackGain.gain.setValueAtTime(0.001, now + 0.05);
      flybackGain.gain.linearRampToValueAtTime(0.035, now + 0.2);
      flybackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.48);
      flyback.connect(flybackGain);
      flybackGain.connect(ctx.destination);
      flyback.start(now + 0.05);
      flyback.stop(now + 0.5);
    }
  }

  /**
   * 22. Tactical Terminal Power Off / System Shutdown
   * Two distinct soundscapes:
   * - Alpha: Imperial CRT raster spot collapse snap, power supply discharge & decaying coil drain.
   * - Beta: Necron Gauss dimensional phase-out, descending metallic dissonance & stasis fold.
   *
   * @param {string} [channel='alpha'] - 'alpha' | 'beta'
   */
  function playTerminalPowerOff(channel = 'alpha') {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const isBeta = String(channel).toLowerCase() === 'beta';

    if (isBeta) {
      const oscA = ctx.createOscillator();
      const oscB = ctx.createOscillator();
      const gain = ctx.createGain();

      oscA.type = 'sine';
      oscB.type = 'triangle';
      oscA.frequency.setValueAtTime(680, now);
      oscA.frequency.exponentialRampToValueAtTime(45, now + 0.42);
      oscB.frequency.setValueAtTime(340, now);
      oscB.frequency.exponentialRampToValueAtTime(32, now + 0.42);

      gain.gain.setValueAtTime(0.13, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      oscA.connect(gain);
      oscB.connect(gain);
      gain.connect(ctx.destination);

      oscA.start(now);
      oscB.start(now);
      oscA.stop(now + 0.48);
      oscB.stop(now + 0.48);

    } else {
      const collapseSnap = ctx.createOscillator();
      const snapGain = ctx.createGain();
      collapseSnap.type = 'triangle';
      collapseSnap.frequency.setValueAtTime(420, now);
      collapseSnap.frequency.exponentialRampToValueAtTime(30, now + 0.025);
      snapGain.gain.setValueAtTime(0.18, now);
      snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.028);
      collapseSnap.connect(snapGain);
      snapGain.connect(ctx.destination);
      collapseSnap.start(now);
      collapseSnap.stop(now + 0.03);

      const drain = ctx.createOscillator();
      const drainGain = ctx.createGain();
      drain.type = 'sawtooth';
      drain.frequency.setValueAtTime(140, now + 0.015);
      drain.frequency.exponentialRampToValueAtTime(24, now + 0.38);
      drainGain.gain.setValueAtTime(0.12, now + 0.015);
      drainGain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
      drain.connect(drainGain);
      drainGain.connect(ctx.destination);
      drain.start(now + 0.015);
      drain.stop(now + 0.45);
    }
  }

  /**
   * 23. Classified Briefing Dossier Decode / Cipher Teleprinter
   * Two distinct soundscapes:
   * - Alpha: Departmento Munitorum cipher teleprinter mechanical relay chatter and high-speed encryption warble.
   * - Beta: Necron Canoptek scarab crystalline arithmetic frequency chirps and resonant glyph deciphering.
   *
   * @param {string} [channel='alpha'] - 'alpha' | 'beta'
   */
  function playBriefingDecode(channel = 'alpha') {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const isBeta = String(channel).toLowerCase() === 'beta';

    if (isBeta) {
      const freqs = [784, 1046, 1318, 1568];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = now + idx * 0.055;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);
        osc.frequency.exponentialRampToValueAtTime(freq * 1.05, t + 0.08);

        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.09, t + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.18);
      });

    } else {
      for (let i = 0; i < 5; i++) {
        const click = ctx.createOscillator();
        const clickGain = ctx.createGain();
        const t = now + i * 0.032;

        click.type = (i % 2 === 0) ? 'square' : 'triangle';
        click.frequency.setValueAtTime(1400 + (i * 220), t);
        click.frequency.exponentialRampToValueAtTime(260, t + 0.016);

        clickGain.gain.setValueAtTime(0.001, t);
        clickGain.gain.linearRampToValueAtTime(0.08, t + 0.004);
        clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.022);

        click.connect(clickGain);
        clickGain.connect(ctx.destination);
        click.start(t);
        click.stop(t + 0.025);
      }

      const chirp = ctx.createOscillator();
      const chirpGain = ctx.createGain();
      chirp.type = 'sawtooth';
      chirp.frequency.setValueAtTime(2200, now + 0.16);
      chirp.frequency.exponentialRampToValueAtTime(3200, now + 0.22);
      chirp.frequency.exponentialRampToValueAtTime(1600, now + 0.28);

      chirpGain.gain.setValueAtTime(0.001, now + 0.16);
      chirpGain.gain.linearRampToValueAtTime(0.06, now + 0.18);
      chirpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      chirp.connect(chirpGain);
      chirpGain.connect(ctx.destination);
      chirp.start(now + 0.16);
      chirp.stop(now + 0.32);
    }
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
      } else if (target.matches('#btnQuickKillSp, [onclick*="awardHordeKillSP"]')) {
        playBoltgunBlast();
      } else if (target.matches('#nextRoundBtn, [onclick*="advanceBattleRound"]')) {
        playWarhorn();
      } else if (target.matches('.phase-step-btn, [onclick*="setGuidedPhaseStep"], [onclick*="stepGuidedPhase"]')) {
        playCogitatorStep();
      } else if (target.matches('#hudGainSpBtn, [onclick*="gainSP"], [onclick*="adjCP(1)"], [onclick*="awardCommandPhaseObjectiveSP"]')) {
        playPowerSurge();
      } else if (target.matches('[onclick*="loseSP"], [onclick*="spendCPForStrat"], [onclick*="buyResupply"], [onclick*="adjCP(-1)"]')) {
        playPneumaticDispense();
      } else if (target.matches('[onclick*="triggerOrbitalPunishment"], [onclick*="resolveOrbitalBombardmentRoll"], .orbital-btn, [data-sfx="orbital"]')) {
        playOrbitalBombardment();
      } else if (target.matches('[onclick*="drawMisery"], [onclick*="triggerSpecificMisery"], .btn-red[onclick*="Misery"]')) {
        playWarpStatic();
      } else if (target.matches('[onclick*="drawSecondary"], [onclick*="replaceSecondary"], [onclick*="triggerChangeOfPlans"]')) {
        playCipherDecryption();
      } else if (target.matches('.crt-purge-btn, [onclick*="purgeVoxEntry"], [onclick*="clearSpawnerResults"]')) {
        playDegaussPurge();
      } else if (target.matches('input[type="checkbox"], input[type="radio"], .fort-item input')) {
        playMagLock();
      } else if (target.closest('.theme-necron, .vox-preview-beta, #cardBeta') && (target.matches('.tomb-btn, .necron-btn') || target.closest('#cruTabTomb, #tabTomb'))) {
        playNecronGaussPulse();
      } else if (target.matches('.launch-btn, .gate-btn, .btn-red, .unlock-btn, .terminal-link-btn')) {
        playTerminalClank('heavy');
      } else if (
        target.matches('.auspex-btn, .auspex-toolbar-btn, .fs-pill-btn, .map-node-group, #zoomBtn1, #zoomBtn15, #zoomBtn22, #fullscreenMapBtn, #fsToggleDetailsBtn')
      ) {
        playTerminalClank('auspex');
      } else if (target.matches('.mini-btn, .slider-node, .dice-btn, [onclick*="roll"]')) {
        playTerminalClank('pneumatic');
      } else if (target.matches('.choice-card, summary, .score-card, .stat-box, .impact-box, .chip, .nav-pills button')) {
        playTerminalClank('card');
      } else {
        playTerminalClank('relay');
      }
    }

    handleUserGestureForMusic(e);
  });

  // Unlock audio immediately on pointerdown or touchstart anywhere on root page (e.g. https://armageddon-vox.pages.dev/)
  document.addEventListener('pointerdown', handleUserGestureForMusic);
  document.addEventListener('touchstart', handleUserGestureForMusic);

  // Global listener: plays CRT teletype click whenever player types in an input or textarea
  document.addEventListener('keydown', (e) => {
    handleUserGestureForMusic(e);
    const el = e.target;
    if (!el || !el.matches('input[type="text"], input[type="password"], textarea')) return;
    if (e.ctrlKey || e.metaKey || e.altKey || e.key === 'Shift' || e.key === 'Tab' || e.key === 'CapsLock') return;
    playTeletypeTick('type');
  });

  // =========================================================================
  // PART 2: TOP-NAV YOUTUBE AMBIENT PLAYLIST RANDOMIZER WITH CONTINUITY
  // =========================================================================
  let musicRecoveryTimer = null;

  function isPlayerActuallyPlaying() {
    if (!ytPlayer || !ytReady) return false;
    try {
      if (typeof ytPlayer.isMuted === 'function' && ytPlayer.isMuted()) {
        return false;
      }
      if (typeof ytPlayer.getPlayerState === 'function') {
        const state = ytPlayer.getPlayerState();
        // YT.PlayerState.PLAYING === 1, YT.PlayerState.BUFFERING === 3
        return state === 1 || state === 3;
      }
    } catch (e) {}
    return isPlaying;
  }

  function injectNavToggle() {
    const nav = document.querySelector('.suite-nav');
    if (!nav || document.getElementById('voxMusicToggle')) return;

    const wrap = document.createElement('div');
    wrap.className = 'vox-caster-bar';
    wrap.innerHTML = `
      <button type="button" id="voxMusicToggle" class="vox-music-btn" title="Toggle 40K Ship Ambience Playlist">
        <span id="voxMusicIcon">${wantMusic ? '🔊' : '🔇'}</span>
        <span id="voxMusicLabel">${wantMusic ? 'VOX-AMBIENCE: ON' : 'VOX-AMBIENCE: OFF'}</span>
        <span class="vox-eq"><span></span><span></span><span></span></span>
      </button>
      <button type="button" id="voxMusicSkip" class="vox-music-btn ${wantMusic ? '' : 'hidden'}" title="Randomize Next Ambient Track">
        ⏭️
      </button>
    `;
    nav.appendChild(wrap);

    const ytHost = document.createElement('div');
    ytHost.id = 'soaHiddenYtPlayer';
    ytHost.style.cssText = 'position:fixed;bottom:-10px;right:-10px;width:1px;height:1px;opacity:0.01;pointer-events:none;z-index:-1;';
    document.body.appendChild(ytHost);

    document.getElementById('voxMusicToggle').addEventListener('click', toggleMusic);
    document.getElementById('voxMusicSkip').addEventListener('click', () => {
      hasUserInteracted = true;
      playNextRandomTrack();
    });

    updateMusicUI(wantMusic);
    if (wantMusic) {
      loadYouTubeAPI();
    }
  }

  function updateMusicUI(active) {
    const btn = document.getElementById('voxMusicToggle');
    const icon = document.getElementById('voxMusicIcon');
    const lbl = document.getElementById('voxMusicLabel');
    const skip = document.getElementById('voxMusicSkip');
    if (!btn) return;

    btn.classList.toggle('playing', active);
    if (icon) icon.textContent = active ? '🔊' : '🔇';
    if (lbl) lbl.textContent = active ? 'VOX-AMBIENCE: ON' : 'VOX-AMBIENCE: OFF';
    if (skip) skip.classList.toggle('hidden', !active);
  }

  function loadYouTubeAPI() {
    if (window.YT && window.YT.Player) {
      createPlayer();
      return;
    }
    if (document.getElementById('soaYtApiScript')) return;

    const tag = document.createElement('script');
    tag.id = 'soaYtApiScript';
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);

    const prevReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = function () {
      if (typeof prevReady === 'function') prevReady();
      createPlayer();
    };
  }

  function getActiveTrackConfig() {
    let savedId = null;
    let savedTime = 0;
    try {
      savedId = localStorage.getItem(STORAGE_KEY_TRACK_ID);
      const timeVal = localStorage.getItem(STORAGE_KEY_TRACK_TIME);
      savedTime = timeVal ? Math.max(0, parseInt(timeVal, 10)) : 0;
    } catch (e) {}

    if (!savedId || !VOX_TRACK_IDS.includes(savedId)) {
      const randIdx = Math.floor(Math.random() * VOX_TRACK_IDS.length);
      savedId = VOX_TRACK_IDS[randIdx];
      savedTime = 0;
      try {
        localStorage.setItem(STORAGE_KEY_TRACK_ID, savedId);
        localStorage.setItem(STORAGE_KEY_TRACK_INDEX, String(randIdx));
        localStorage.setItem(STORAGE_KEY_TRACK_TIME, '0');
      } catch (e) {}
    }

    return { videoId: savedId, startSeconds: savedTime };
  }

  function createPlayer() {
    if (ytPlayer) return;

    const { videoId, startSeconds } = getActiveTrackConfig();
    const playerVars = {
      autoplay: wantMusic ? 1 : 0,
      start: startSeconds,
      loop: 1,
      controls: 0,
      disablekb: 1,
      modestbranding: 1,
      playsinline: 1,
      enablejsapi: 1
    };
    if (window.location && typeof window.location.origin === 'string' && /^https?:\/\//i.test(window.location.origin)) {
      playerVars.origin = window.location.origin;
    }

    ytPlayer = new YT.Player('soaHiddenYtPlayer', {
      height: '1',
      width: '1',
      videoId: videoId,
      playerVars: playerVars,
      events: {
        onReady: (event) => {
          ytReady = true;
          if (event && event.target) {
            if (typeof event.target.unMute === 'function') event.target.unMute();
            if (typeof event.target.setVolume === 'function') event.target.setVolume(35);
          }
          if (wantMusic) {
            resumeOrStartMusic(hasUserInteracted);
          }
        },
        onStateChange: (event) => {
          if (event.data === YT.PlayerState.PLAYING) {
            isPlaying = true;
            if (musicRecoveryTimer) {
              clearTimeout(musicRecoveryTimer);
              musicRecoveryTimer = null;
            }
            updateMusicUI(true);
            startTrackingProgress();
          } else if (event.data === YT.PlayerState.ENDED) {
            isPlaying = false;
            playNextRandomTrack();
          } else if (
            event.data === YT.PlayerState.PAUSED ||
            event.data === YT.PlayerState.CUED ||
            event.data === -1
          ) {
            isPlaying = false;
            stopTrackingProgress();
            if (!wantMusic) {
              updateMusicUI(false);
            }
          }
        },
        onError: () => {
          isPlaying = false;
          if (wantMusic) {
            playNextRandomTrack();
          }
        }
      }
    });
  }

  function startTrackingProgress() {
    if (progressInterval) clearInterval(progressInterval);
    progressInterval = setInterval(() => {
      if (!ytPlayer || !isPlaying) return;
      try {
        if (typeof ytPlayer.getCurrentTime === 'function') {
          const t = ytPlayer.getCurrentTime();
          if (typeof t === 'number' && t >= 0) {
            localStorage.setItem(STORAGE_KEY_TRACK_TIME, String(Math.floor(t)));
          }
        }
      } catch (e) {}
    }, 750);
  }

  function stopTrackingProgress() {
    if (progressInterval) {
      clearInterval(progressInterval);
      progressInterval = null;
    }
  }

  function saveCurrentPosition() {
    if (!ytPlayer) return;
    try {
      if (typeof ytPlayer.getCurrentTime === 'function') {
        const t = ytPlayer.getCurrentTime();
        if (typeof t === 'number' && t >= 0) {
          localStorage.setItem(STORAGE_KEY_TRACK_TIME, String(Math.floor(t)));
        }
      }
    } catch (e) {}
  }

  window.addEventListener('beforeunload', saveCurrentPosition);
  window.addEventListener('pagehide', saveCurrentPosition);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) saveCurrentPosition();
  });

  function resumeOrStartMusic(fromUserGesture = false) {
    if (!ytPlayer || !ytReady) return;
    try {
      if (typeof ytPlayer.unMute === 'function') {
        ytPlayer.unMute();
      }
      if (typeof ytPlayer.setVolume === 'function') {
        ytPlayer.setVolume(35);
      }

      if (isPlayerActuallyPlaying()) {
        isPlaying = true;
        updateMusicUI(true);
        startTrackingProgress();
        return;
      }

      let state = -1;
      if (typeof ytPlayer.getPlayerState === 'function') {
        try {
          state = ytPlayer.getPlayerState();
        } catch (e) {}
      }

      // When triggered from a user gesture and the player is still UNSTARTED (-1) or CUED (5)
      // (e.g. after initial root-page autoplay block on https://armageddon-vox.pages.dev/),
      // synchronously call loadVideoById inside the gesture call stack so playback starts immediately.
      if ((state === -1 || state === 5) && (fromUserGesture || hasUserInteracted) && typeof ytPlayer.loadVideoById === 'function') {
        const { videoId, startSeconds } = getActiveTrackConfig();
        ytPlayer.loadVideoById({
          videoId: videoId,
          startSeconds: startSeconds
        });
      }

      if (typeof ytPlayer.playVideo === 'function') {
        ytPlayer.playVideo();
      } else if (typeof ytPlayer.loadVideoById === 'function') {
        const { videoId, startSeconds } = getActiveTrackConfig();
        ytPlayer.loadVideoById({
          videoId: videoId,
          startSeconds: startSeconds
        });
      }

      updateMusicUI(true);

      if (musicRecoveryTimer) clearTimeout(musicRecoveryTimer);
      musicRecoveryTimer = setTimeout(() => {
        musicRecoveryTimer = null;
        if (!wantMusic || !ytReady || isPlayerActuallyPlaying()) return;
        if (fromUserGesture || hasUserInteracted) {
          playNextRandomTrack();
        } else if (ytPlayer && typeof ytPlayer.mute === 'function' && typeof ytPlayer.playVideo === 'function') {
          // If browser blocked unmuted autoplay on initial load before any user gesture,
          // pre-buffer muted so the very first pointerdown/click/keydown unmutes with zero delay.
          try {
            ytPlayer.mute();
            ytPlayer.playVideo();
          } catch (e) {}
        }
      }, 900);
    } catch (err) {
      console.warn('Vox-Caster resume exception, falling back to random:', err);
      playNextRandomTrack();
    }
  }

  function playNextRandomTrack() {
    if (!ytPlayer || !ytReady) return;
    try {
      const currentId = localStorage.getItem(STORAGE_KEY_TRACK_ID);
      const candidateList = VOX_TRACK_IDS.filter(id => id !== currentId);
      const pool = candidateList.length > 0 ? candidateList : VOX_TRACK_IDS;
      const nextIndex = Math.floor(Math.random() * pool.length);
      const nextId = pool[nextIndex];

      const fullListIndex = VOX_TRACK_IDS.indexOf(nextId);
      localStorage.setItem(STORAGE_KEY_TRACK_ID, nextId);
      localStorage.setItem(STORAGE_KEY_TRACK_INDEX, String(fullListIndex >= 0 ? fullListIndex : 0));
      localStorage.setItem(STORAGE_KEY_TRACK_TIME, '0');

      if (typeof ytPlayer.unMute === 'function') {
        ytPlayer.unMute();
      }
      if (typeof ytPlayer.loadVideoById === 'function') {
        ytPlayer.loadVideoById({
          videoId: nextId,
          startSeconds: 0
        });
      }
      if (typeof ytPlayer.playVideo === 'function') {
        ytPlayer.playVideo();
      }

      if (typeof ytPlayer.setVolume === 'function') {
        ytPlayer.setVolume(35);
      }
      updateMusicUI(true);
    } catch (err) {
      console.warn('Vox-Caster playlist randomizer warning:', err);
    }
  }

  function toggleMusic() {
    hasUserInteracted = true;
    // If user wanted music ON, but browser blocked initial autoplay on root load so nothing is playing yet,
    // clicking VOX-AMBIENCE starts the music immediately instead of toggling it OFF!
    if (wantMusic && ytReady && !isPlayerActuallyPlaying()) {
      resumeOrStartMusic(true);
      return;
    }

    wantMusic = !wantMusic;
    try {
      localStorage.setItem(STORAGE_KEY_MUSIC, String(wantMusic));
    } catch (err) {
      console.warn('Could not save music preference to localStorage:', err);
    }

    if (wantMusic) {
      if (!ytReady) {
        updateMusicUI(true);
        loadYouTubeAPI();
      } else {
        resumeOrStartMusic(true);
      }
    } else {
      isPlaying = false;
      updateMusicUI(false);
      stopTrackingProgress();
      if (ytPlayer && ytReady && typeof ytPlayer.pauseVideo === 'function') {
        ytPlayer.pauseVideo();
      }
    }
  }

  // =========================================================================
  // PART 3: SEAMLESS CLIENT-SIDE PAGE ROUTER (GAPLESS AUDIO ACROSS NAVIGATION)
  // =========================================================================
  let isNavigating = false;

  async function navigateSeamlessly(targetUrl, push = true) {
    if (isNavigating) return;
    isNavigating = true;

    try {
      if (typeof saveSessionState === 'function' && (document.getElementById('setupScreen') || document.getElementById('gameScreen'))) {
        try { saveSessionState(); } catch (e) {}
      }
      if (typeof saveBriefingState === 'function' && (document.getElementById('atlas-node-inspector') || document.getElementById('dossierBeta'))) {
        try { saveBriefingState(); } catch (e) {}
      }
      if (typeof savePvpState === 'function' && document.getElementById('hellscapeSelect')) {
        try { savePvpState(); } catch (e) {}
      }
      if (typeof saveRogueState === 'function' && document.getElementById('aiStep0')) {
        try { saveRogueState(); } catch (e) {}
      }
      saveCurrentPosition();

      const resp = await fetch(targetUrl);
      if (!resp.ok) {
        window.location.href = targetUrl;
        return;
      }
      const htmlText = await resp.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, 'text/html');

      if (doc.title) {
        document.title = doc.title;
      }

      const targetShellSelector = '.app-shell, .vox-shell, .briefing-shell, .container';
      const currentShell = document.querySelector(targetShellSelector);
      const newShell = doc.querySelector(targetShellSelector);

      if (currentShell && newShell) {
        currentShell.replaceWith(document.importNode(newShell, true));
      } else {
        window.location.href = targetUrl;
        return;
      }

      // Clean up previous seamless page-swapped styles
      document.querySelectorAll('style[data-seamless-style]').forEach(s => s.remove());

      // Inject any <style> tags from target page head or body
      const incomingStyles = doc.querySelectorAll('style');
      incomingStyles.forEach(s => {
        const styleEl = document.createElement('style');
        styleEl.setAttribute('data-seamless-style', 'true');
        styleEl.textContent = s.textContent;
        document.head.appendChild(styleEl);
      });

      const currentNav = document.querySelector('.suite-nav');
      const newNav = doc.querySelector('.suite-nav');
      if (currentNav && newNav) {
        const newLinks = newNav.querySelectorAll('.suite-link');
        const currentLinks = currentNav.querySelectorAll('.suite-link');
        currentLinks.forEach(l => l.remove());
        const voxBar = currentNav.querySelector('.vox-caster-bar');
        newLinks.forEach(l => {
          const imported = document.importNode(l, true);
          if (voxBar) {
            currentNav.insertBefore(imported, voxBar);
          } else {
            currentNav.appendChild(imported);
          }
        });
      }

      if (push && window.location.href !== targetUrl) {
        window.history.pushState({}, '', targetUrl);
      }

      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

      const externalScripts = Array.from(doc.querySelectorAll('script[src]'));
      for (const s of externalScripts) {
        const src = s.getAttribute('src');
        if (!src || src.includes('vox-audio.js')) continue;
        const resolvedSrc = new URL(src, targetUrl).href;
        if (!document.querySelector(`script[src="${resolvedSrc}"], script[src="${src}"]`)) {
          await new Promise((resolve) => {
            const scriptEl = document.createElement('script');
            scriptEl.src = resolvedSrc;
            scriptEl.onload = resolve;
            scriptEl.onerror = resolve;
            document.head.appendChild(scriptEl);
          });
        }
      }

      const inlineScripts = doc.querySelectorAll('script:not([src])');
      inlineScripts.forEach(s => {
        try {
          const scriptEl = document.createElement('script');
          // Replace top-level const and let with var so re-entrant seamless navigation
          // across pages or repeated visits never throws "Identifier has already been declared".
          const sanitized = s.textContent.replace(/(^|[\n\r;])\s*(const|let)\s+([a-zA-Z0-9_$]+)/g, '$1 var $3');
          scriptEl.textContent = sanitized;
          document.body.appendChild(scriptEl);
        } catch (scriptErr) {
          console.warn('Seamless inline script execution error:', scriptErr);
        }
      });

      if (document.getElementById('setupScreen') || document.getElementById('gameScreen')) {
        const hordeSel = document.getElementById('hordeFactionSelect');
        if (hordeSel && typeof HORDE_FACTIONS !== 'undefined') {
          hordeSel.innerHTML = HORDE_FACTIONS.map(f => `<option value="${f.name}">${f.name} (${f.ruleTitle})</option>`).join('');
        }
        if (typeof restoreSessionState === 'function') {
          restoreSessionState();
        }
      }
      if ((document.getElementById('atlas-node-inspector') || document.getElementById('dossierBeta')) && typeof restoreBriefingState === 'function') {
        restoreBriefingState();
      }
      if (document.getElementById('hellscapeSelect') && typeof restorePvpState === 'function') {
        restorePvpState();
      }
      if (document.getElementById('aiStep0') && typeof restoreRogueState === 'function') {
        restoreRogueState();
      }
      if (document.getElementById('rosTabNemesis') && typeof window.initRosterPage === 'function') {
        window.initRosterPage();
      }

      syncFactionTheme();

      document.dispatchEvent(new Event('DOMContentLoaded'));
      window.dispatchEvent(new Event('vox:page-swapped'));

    } catch (err) {
      console.warn('Seamless router fallback to standard navigation:', err);
      if (typeof window.location.replace === 'function') {
        window.location.replace(targetUrl);
      } else {
        window.location.href = targetUrl;
      }
    } finally {
      isNavigating = false;
    }
  }

  // =========================================================================
  // GLOBAL FACTION COLOR MODE SYNCHRONIZATION (NECRON VS MILITARUM)
  // =========================================================================
  const STORAGE_KEY_FACTION_THEME = 'foa_faction_theme_v1';

  /**
   * Pure functional core helper: Resolves the active global faction theme
   * ('necron' for Lord Commander Junebug / Beta, 'militarum' for The Exile / Alpha, or null)
   * from browser storage based on which broadcast or terminal conduit is unlocked.
   *
   * @param {Storage} [localStore] - localStorage-compatible store
   * @param {Storage} [sessionStore] - sessionStorage-compatible store
   * @returns {'necron' | 'militarum' | null} Resolved faction theme
   */
  function resolveFactionThemeFromStorage(localStore, sessionStore) {
    try {
      if (localStore && typeof localStore.getItem === 'function') {
        const explicit = localStore.getItem(STORAGE_KEY_FACTION_THEME);
        if (explicit === 'necron' || explicit === 'militarum' || explicit === 'votann') {
          return explicit;
        }
      }
    } catch (e) {}

    try {
      if (sessionStore && typeof sessionStore.getItem === 'function') {
        const rawVoxSession = sessionStore.getItem('foa_vox_active_session_v1');
        if (rawVoxSession) {
          const parsedVox = JSON.parse(rawVoxSession);
          if (parsedVox && parsedVox.channel === 'beta') return 'necron';
          if (parsedVox && parsedVox.channel === 'alpha') return 'militarum';
          if (parsedVox && parsedVox.channel === 'gamma') return 'votann';
        }
      }
    } catch (e) {}

    try {
      if (localStore && typeof localStore.getItem === 'function') {
        const rawBriefing = localStore.getItem('foa_briefing_state_v3');
        if (rawBriefing) {
          const parsedBriefing = JSON.parse(rawBriefing);
          if (parsedBriefing) {
            if (parsedBriefing.unlockedGamma && !parsedBriefing.unlockedAlpha && !parsedBriefing.unlockedBeta) return 'votann';
            if (parsedBriefing.unlockedBeta && !parsedBriefing.unlockedAlpha && !parsedBriefing.unlockedGamma) return 'necron';
            if (parsedBriefing.unlockedAlpha && !parsedBriefing.unlockedBeta && !parsedBriefing.unlockedGamma) return 'militarum';
            if (parsedBriefing.activeDossier === 'gamma' && parsedBriefing.unlockedGamma) return 'votann';
            if (parsedBriefing.activeDossier === 'beta' && parsedBriefing.unlockedBeta) return 'necron';
            if (parsedBriefing.activeDossier === 'alpha' && parsedBriefing.unlockedAlpha) return 'militarum';
          }
        }
      }
    } catch (e) {}

    return null;
  }

  /**
   * Applies the given faction theme ('necron', 'militarum', or 'votann') to document.body
   * and optionally persists it to localStorage across all pages.
   *
   * @param {'necron' | 'militarum' | 'votann' | null} theme - Target faction theme
   * @param {boolean} [persist=true] - Whether to persist in localStorage
   * @returns {'necron' | 'militarum' | 'votann' | null} Applied theme
   */
  function setFactionTheme(theme, persist = true) {
    const normalized = theme === 'necron' ? 'necron' : (theme === 'militarum' ? 'militarum' : (theme === 'votann' ? 'votann' : null));
    if (persist) {
      try {
        if (normalized) {
          localStorage.setItem(STORAGE_KEY_FACTION_THEME, normalized);
        } else {
          localStorage.removeItem(STORAGE_KEY_FACTION_THEME);
        }
      } catch (e) {}
    }

    if (document && document.body && document.body.classList) {
      document.body.classList.toggle('theme-necron', normalized === 'necron');
      document.body.classList.toggle('theme-militarum', normalized === 'militarum');
      document.body.classList.toggle('theme-votann', normalized === 'votann');
      if (document.body.dataset) {
        document.body.dataset.factionTheme = normalized || 'default';
      }
    }
    return normalized;
  }

  /**
   * Returns the currently active faction theme ('necron' | 'militarum' | null).
   *
   * @returns {'necron' | 'militarum' | null}
   */
  function getFactionTheme() {
    return resolveFactionThemeFromStorage(
      typeof localStorage !== 'undefined' ? localStorage : null,
      typeof sessionStorage !== 'undefined' ? sessionStorage : null
    );
  }

  /**
   * Synchronizes document.body classes with the unlocked broadcast/terminal theme in storage.
   *
   * @returns {'necron' | 'militarum' | null}
   */
  function syncFactionTheme() {
    const resolved = getFactionTheme();
    if (resolved) {
      setFactionTheme(resolved, false);
    }
    return resolved;
  }

  /**
   * Queues a compiled Dossier payload into sessionStorage, plays the Inquisitorial
   * Dossier Stamp SFX, and routes the user directly to pages/vox.html!
   */
  function transmitToVox(channel, payloadText) {
    playDossierStamp();
    try {
      sessionStorage.setItem(
        'foa_pending_vox_payload',
        JSON.stringify({
          channel: channel || 'alpha',
          text: payloadText,
          queuedAt: Date.now()
        })
      );
      // Strictly prevent terminal password bypass: purge any pre-existing active session auth
      sessionStorage.removeItem('foa_vox_active_session_v1');
    } catch (e) {}

    const inPagesDir = window.location.pathname.includes('/pages/');
    const targetPath = inPagesDir ? 'vox.html' : 'pages/vox.html';
    const fullUrl = new URL(targetPath, window.location.href).href;

    setTimeout(() => {
      navigateSeamlessly(fullUrl, true);
    }, 260);
  }

  // Expose public audio & routing API for Crusade Rollers, Dossiers, Spawner & CRT Terminal
  window.VoxAudio = {
    playClank: playTerminalClank,
    playTeletypeTick: playTeletypeTick,
    playDiceClatter: playDiceClatter,
    playForgeAnvil: playForgeAnvil,
    playRelicChoir: playRelicChoir,
    playScarHazard: playScarHazard,
    playDossierStamp: playDossierStamp,
    playWarpSiren: playWarpSiren,
    playAuspexLock: playAuspexLock,
    playCloudSyncChime: playCloudSyncChime,
    playBoltgunBlast: playBoltgunBlast,
    playPowerSurge: playPowerSurge,
    playPneumaticDispense: playPneumaticDispense,
    playMagLock: playMagLock,
    playWarhorn: playWarhorn,
    playWarpStatic: playWarpStatic,
    playCipherDecryption: playCipherDecryption,
    playCogitatorStep: playCogitatorStep,
    playDegaussPurge: playDegaussPurge,
    playNecronGaussPulse: playNecronGaussPulse,
    playOrbitalBombardment: playOrbitalBombardment,
    playTerminalPowerOn: playTerminalPowerOn,
    playTerminalPowerOff: playTerminalPowerOff,
    playBriefingDecode: playBriefingDecode,
    navigateSeamlessly: navigateSeamlessly,
    transmitToVox: transmitToVox,
    resolveFactionThemeFromStorage: resolveFactionThemeFromStorage,
    setFactionTheme: setFactionTheme,
    getFactionTheme: getFactionTheme,
    syncFactionTheme: syncFactionTheme
  };

  /**
   * Normalizes URL pathnames so root '/' and '/index.html' (on Cloudflare Pages / static hosts)
   * resolve to the same canonical path ('/').
   *
   * @param {string} pathname - URL pathname string
   * @returns {string} Canonical pathname
   */
  function normalizePathname(pathname) {
    const raw = String(pathname || '/');
    return raw.replace(/\/index\.html$/i, '/') || '/';
  }

  document.addEventListener('click', (e) => {
    if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;

    const link = e.target.closest('a[href]');
    if (!link) return;

    const hrefAttr = link.getAttribute('href');
    if (!hrefAttr || hrefAttr.startsWith('#') || hrefAttr.startsWith('javascript:') || hrefAttr.startsWith('mailto:')) return;
    if (link.target && link.target !== '_self') return;

    try {
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) return;

      if (normalizePathname(url.pathname) === normalizePathname(window.location.pathname) && url.search === window.location.search) {
        if (url.hash) return;
        e.preventDefault();
        return;
      }

      if (url.pathname.endsWith('.html') || url.pathname.endsWith('/') || !url.pathname.includes('.')) {
        e.preventDefault();
        navigateSeamlessly(url.href, true);
      }
    } catch (err) {}
  });

  window.addEventListener('popstate', () => {
    navigateSeamlessly(window.location.href, false);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      syncFactionTheme();
      injectNavToggle();
    });
  } else {
    syncFactionTheme();
    injectNavToggle();
  }

  // Dual export for Node.js test runner
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      PLAYLIST_ID,
      VOX_TRACK_IDS,
      STORAGE_KEY_FACTION_THEME,
      playTerminalClank,
      playTeletypeTick,
      playDiceClatter,
      playForgeAnvil,
      playRelicChoir,
      playScarHazard,
      playDossierStamp,
      playWarpSiren,
      playAuspexLock,
      playCloudSyncChime,
      playBoltgunBlast,
      playPowerSurge,
      playPneumaticDispense,
      playMagLock,
      playWarhorn,
      playWarpStatic,
      playCipherDecryption,
      playCogitatorStep,
      playDegaussPurge,
      playNecronGaussPulse,
      playOrbitalBombardment,
      playTerminalPowerOn,
      playTerminalPowerOff,
      playBriefingDecode,
      saveCurrentPosition,
      navigateSeamlessly,
      injectNavToggle,
      transmitToVox,
      createPlayer,
      isPlayerActuallyPlaying,
      resumeOrStartMusic,
      playNextRandomTrack,
      normalizePathname,
      resolveFactionThemeFromStorage,
      setFactionTheme,
      getFactionTheme,
      syncFactionTheme
    };
  }
})();