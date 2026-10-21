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
    // Micro-pitch randomization (+-6%) so repeated clicks never sound robotic
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
  if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
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
  }

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

  /**
   * Resolves the current track ID to play:
   * If a track ID is already saved in localStorage from a previous page or session,
   * reuse it for 100% seamless continuity. Otherwise, pick a 100% random track.
   */
  function getActiveTrackConfig() {
    let savedId = null;
    let savedTime = 0;
    try {
      savedId = localStorage.getItem(STORAGE_KEY_TRACK_ID);
      const timeVal = localStorage.getItem(STORAGE_KEY_TRACK_TIME);
      savedTime = timeVal ? Math.max(0, parseInt(timeVal, 10)) : 0;
    } catch (e) {}

    if (!savedId || !VOX_TRACK_IDS.includes(savedId)) {
      // 100% random initial selection
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

    ytPlayer = new YT.Player('soaHiddenYtPlayer', {
      height: '1',
      width: '1',
      videoId: videoId,
      playerVars: {
        autoplay: wantMusic ? 1 : 0,
        start: startSeconds,
        loop: 1,
        controls: 0,
        disablekb: 1,
        modestbranding: 1,
        playsinline: 1,
        enablejsapi: 1
      },
      events: {
        onReady: (event) => {
          ytReady = true;
          event.target.setVolume(35);
          if (wantMusic) {
            resumeOrStartMusic();
          }
        },
        onStateChange: (event) => {
          if (event.data === YT.PlayerState.PLAYING) {
            isPlaying = true;
            updateMusicUI(true);
            startTrackingProgress();
          } else if (event.data === YT.PlayerState.ENDED) {
            // Track naturally completed: pick a fresh 100% random track
            playNextRandomTrack();
          } else if (
            event.data === YT.PlayerState.PAUSED
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

  // Persist exact playback seconds across all page unload / visibility changes
  window.addEventListener('beforeunload', saveCurrentPosition);
  window.addEventListener('pagehide', saveCurrentPosition);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) saveCurrentPosition();
  });

  /**
   * Resumes playback of the persisted track at the exact saved second,
   * preserving seamless audio across navigation without re-shuffling or restarting.
   */
  function resumeOrStartMusic() {
    if (!ytPlayer || !ytReady) return;
    try {
      ytPlayer.setVolume(35);
      const { videoId, startSeconds } = getActiveTrackConfig();

      if (typeof ytPlayer.loadVideoById === 'function') {
        ytPlayer.loadVideoById({
          videoId: videoId,
          startSeconds: startSeconds
        });
      } else if (typeof ytPlayer.playVideo === 'function') {
        ytPlayer.playVideo();
      }

      isPlaying = true;
      updateMusicUI(true);
      startTrackingProgress();
    } catch (err) {
      console.warn('Vox-Caster resume exception, falling back to random:', err);
      playNextRandomTrack();
    }
  }

  /**
   * Selects a 100% truly random track from the 20-track ambient playlist,
   * avoiding repeating the currently active track if more than 1 track exists.
   */
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

      if (typeof ytPlayer.loadVideoById === 'function') {
        ytPlayer.loadVideoById({
          videoId: nextId,
          startSeconds: 0
        });
      }

      ytPlayer.setVolume(35);
      isPlaying = true;
      updateMusicUI(true);
      startTrackingProgress();
    } catch (err) {
      console.warn('Vox-Caster playlist randomizer warning:', err);
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

  // =========================================================================
  // PART 3: SEAMLESS CLIENT-SIDE PAGE ROUTER (GAPLESS AUDIO ACROSS NAVIGATION)
  // =========================================================================
  let isNavigating = false;

  async function navigateSeamlessly(targetUrl, push = true) {
    if (isNavigating) return;
    isNavigating = true;

    try {
      // 1. Save current page state before leaving
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

      // 2. Fetch destination page HTML
      const resp = await fetch(targetUrl);
      if (!resp.ok) {
        window.location.href = targetUrl;
        return;
      }
      const htmlText = await resp.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, 'text/html');

      // 3. Update Document Title
      if (doc.title) {
        document.title = doc.title;
      }

      // 4. Locate and swap main content shell
      const targetShellSelector = '.app-shell, .briefing-shell, .container';
      const currentShell = document.querySelector(targetShellSelector);
      const newShell = doc.querySelector(targetShellSelector);

      if (currentShell && newShell) {
        currentShell.replaceWith(document.importNode(newShell, true));
      } else {
        window.location.href = targetUrl;
        return;
      }

      // 5. Update suite navigation links and active state
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

      // 6. Update browser address bar / history
      if (push && window.location.href !== targetUrl) {
        window.history.pushState({}, '', targetUrl);
      }

      // 7. Instant scroll to top
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

      // 8. Dynamically load any missing external scripts
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

      // 9. Execute inline scripts from destination page
      const inlineScripts = doc.querySelectorAll('script:not([src])');
      inlineScripts.forEach(s => {
        const scriptEl = document.createElement('script');
        scriptEl.textContent = s.textContent;
        document.body.appendChild(scriptEl);
      });

      // 10. Re-trigger mode-specific setup routines
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

      // 11. Dispatch navigation events
      document.dispatchEvent(new Event('DOMContentLoaded'));
      window.dispatchEvent(new Event('vox:page-swapped'));

    } catch (err) {
      console.warn('Seamless router fallback to standard navigation:', err);
      window.location.href = targetUrl;
    } finally {
      isNavigating = false;
    }
  }

  // Intercept all internal navigation link clicks
  if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
    document.addEventListener('click', (e) => {
      // Only handle standard left clicks without modifier keys
      if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;

      const link = e.target.closest('a[href]');
      if (!link) return;

      const hrefAttr = link.getAttribute('href');
      if (!hrefAttr || hrefAttr.startsWith('#') || hrefAttr.startsWith('javascript:') || hrefAttr.startsWith('mailto:')) return;
      if (link.target && link.target !== '_self') return;

      try {
        const url = new URL(link.href, window.location.href);
        // Only intercept internal same-origin links
        if (url.origin !== window.location.origin) return;

        // If linking to the exact same page path and search, allow normal anchor behavior
        if (url.pathname === window.location.pathname && url.search === window.location.search) {
          if (url.hash) return;
          e.preventDefault();
          return;
        }

        // Check if it's an html page or directory root
        if (url.pathname.endsWith('.html') || url.pathname.endsWith('/') || !url.pathname.includes('.')) {
          e.preventDefault();
          navigateSeamlessly(url.href, true);
        }
      } catch (err) {
        // Allow default navigation if URL parsing fails
      }
    });
  }

  // Handle browser Back / Forward buttons
  if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
    window.addEventListener('popstate', () => {
      navigateSeamlessly(window.location.href, false);
    });
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading' && typeof document.addEventListener === 'function') {
      document.addEventListener('DOMContentLoaded', injectNavToggle);
    } else {
      injectNavToggle();
    }
  }

  // Dual export for Node.js test runner
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      PLAYLIST_ID,
      VOX_TRACK_IDS,
      playTerminalClank,
      saveCurrentPosition,
      navigateSeamlessly,
      injectNavToggle
    };
  }
})();

