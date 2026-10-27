# 📦 Fires of Armageddon // Bundle: Procedural Sound FX & Teletype Synth

CRT cathode chimes, forge anvil clanks, mechanical dice clatter, and teletype typewriter synthesizers (`js/vox-audio.js` lines 851 to end).

## 📑 Table of Contents
- [js/vox-audio.js (Part 2: Audio FX & Teletype Synth, Lines 851-1670)](#file-jsvoxaudiojspart2audiofxteletypesynthlines8511670)

---

## File: `js/vox-audio.js (Part 2: Audio FX & Teletype Synth, Lines 851-1670)` <a id="file-jsvoxaudiojspart2audiofxteletypesynthlines8511670"></a>

````javascript
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
````
