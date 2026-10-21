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
    // Micro-pitch randomization (±6%) so repeated clicks never sound robotic
    const detune = 1 + (Math.random() * 0.12 - 0.06);

    if (profile === 'heavy' || profile === true) {
      // 1. Heavy blast-door clank
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

      // Sub-metallic resonance ring
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
      // 2. Auspex CRT scanner chirrup & phosphor pulse
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
      // 3. Pneumatic solenoid tap / valve pressure click
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
      // 4. Data-slate card mechanical latch
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

      // Micro snap
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
      // 5. Standard Imperial copper relay switch ('relay')
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

  // Global listener: contextually triggers sound profiles
  document.addEventListener('click', (e) => {
    const target = e.target.closest(
      'button, .suite-link, .choice-card, .slider-node, .map-node-group, summary, .terminal-link-btn, .fs-pill-btn, .mini-btn'
    );
    if (target) {
      if (target.matches('.launch-btn, .gate-btn, .btn-red, .unlock-btn, .terminal-link-btn')) {
        playTerminalClank('heavy');
      } else if (
        target.matches('.auspex-btn, .auspex-toolbar-btn, .fs-pill-btn, .map-node-group, #zoomBtn1, #zoomBtn15, #zoomBtn22, #fullscreenMapBtn, #fsToggleDetailsBtn')
      ) {
        playTerminalClank('auspex');
      } else if (target.matches('.mini-btn, .slider-node, .dice-btn')) {
        playTerminalClank('pneumatic');
      } else if (target.matches('.choice-card, summary, .score-card, .stat-box, .impact-box')) {
        playTerminalClank('card');
      } else {
        playTerminalClank('relay');
      }
    }

    // Auto-resume audio on first user gesture if browser blocked unmuted autoplay
    if (wantMusic && ytReady && !isPlaying && !e.target.closest('#voxMusicToggle')) {
      resumeOrStartMusic();
    }
  });

  // =========================================================================
  // PART 2: TOP-NAV YOUTUBE AMBIENT PLAYLIST RANDOMIZER WITH CONTINUITY
  // =========================================================================
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

    // Hidden container for YouTube IFrame API player
    const ytHost = document.createElement('div');
    ytHost.id = 'soaHiddenYtPlayer';
    ytHost.style.cssText = 'position:fixed;bottom:-10px;right:-10px;width:1px;height:1px;opacity:0.01;pointer-events:none;z-index:-1;';
    document.body.appendChild(ytHost);

    document.getElementById('voxMusicToggle').addEventListener('click', toggleMusic);
    document.getElementById('voxMusicSkip').addEventListener('click', () => {
      if (ytReady) startRandomTrack();
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

  function createPlayer() {
    if (ytPlayer) return;
    ytPlayer = new YT.Player('soaHiddenYtPlayer', {
      height: '1',
      width: '1',
      playerVars: {
        listType: 'playlist',
        list: PLAYLIST_ID,
        autoplay: wantMusic ? 1 : 0,
        loop: 1,
        controls: 0,
        disablekb: 1,
        modestbranding: 1,
        playsinline: 1
      },
      events: {
        onReady: (event) => {
          ytReady = true;
          event.target.setVolume(35);
          event.target.setLoop(true);
          event.target.setShuffle(true);
          if (wantMusic) {
            resumeOrStartMusic();
          }
        },
        onStateChange: (event) => {
          if (event.data === YT.PlayerState.PLAYING) {
            isPlaying = true;
            updateMusicUI(true);
            startTrackingProgress();
          } else if (
            event.data === YT.PlayerState.PAUSED ||
            event.data === YT.PlayerState.ENDED
          ) {
            if (!wantMusic) {
              isPlaying = false;
              updateMusicUI(false);
              stopTrackingProgress();
            }
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
          if (typeof t === 'number' && t > 0) {
            localStorage.setItem(STORAGE_KEY_TRACK_TIME, String(Math.floor(t)));
          }
        }
        if (typeof ytPlayer.getPlaylistIndex === 'function') {
          const idx = ytPlayer.getPlaylistIndex();
          if (typeof idx === 'number' && idx >= 0) {
            localStorage.setItem(STORAGE_KEY_TRACK_INDEX, String(idx));
          }
        }
      } catch (e) {}
    }, 1000);
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
        if (typeof t === 'number') localStorage.setItem(STORAGE_KEY_TRACK_TIME, String(Math.floor(t)));
      }
      if (typeof ytPlayer.getPlaylistIndex === 'function') {
        const idx = ytPlayer.getPlaylistIndex();
        if (typeof idx === 'number') localStorage.setItem(STORAGE_KEY_TRACK_INDEX, String(idx));
      }
    } catch (e) {}
  }

  window.addEventListener('beforeunload', saveCurrentPosition);

  function resumeOrStartMusic() {
    if (!ytPlayer || !ytReady) return;
    try {
      ytPlayer.setVolume(35);
      const savedIndex = localStorage.getItem(STORAGE_KEY_TRACK_INDEX);
      const savedTime = localStorage.getItem(STORAGE_KEY_TRACK_TIME);
      const idx = savedIndex !== null ? parseInt(savedIndex, 10) : -1;
      const sec = savedTime !== null ? parseInt(savedTime, 10) : 0;

      if (idx >= 0) {
        ytPlayer.playVideoAt(idx);
        if (sec > 5) {
          setTimeout(() => {
            try {
              if (ytPlayer && typeof ytPlayer.seekTo === 'function') {
                ytPlayer.seekTo(sec, true);
              }
            } catch (e) {}
          }, 450);
        }
      } else {
        startRandomTrack();
      }
      isPlaying = true;
      updateMusicUI(true);
    } catch (err) {
      console.warn('Vox-Caster resume exception, falling back to random:', err);
      startRandomTrack();
    }
  }

  function startRandomTrack() {
    if (!ytPlayer || !ytReady) return;
    try {
      ytPlayer.setShuffle(true);
      const playlist = ytPlayer.getPlaylist();
      if (Array.isArray(playlist) && playlist.length > 0) {
        const randIdx = Math.floor(Math.random() * playlist.length);
        ytPlayer.playVideoAt(randIdx);
      } else {
        const fallbackIdx = Math.floor(Math.random() * 20);
        ytPlayer.playVideoAt(fallbackIdx);
      }
      ytPlayer.setVolume(35);
      isPlaying = true;
      updateMusicUI(true);
    } catch (err) {
      console.warn('Vox-Caster playlist start warning:', err);
    }
  }

  function toggleMusic() {
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
        resumeOrStartMusic();
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

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectNavToggle);
  } else {
    injectNavToggle();
  }
})();
