# 📦 Fires of Armageddon // Bundle: Procedural Sound FX & Teletype Synth

CRT cathode chimes, forge anvil clanks, mechanical dice clatter, and teletype typewriter synthesizers (`js/vox-audio.js` lines 851 to end).

## 📑 Table of Contents
- [js/vox-audio.js (Part 2: Audio FX & Teletype Synth, Lines 851-1670)](#file-jsvoxaudiojspart2audiofxteletypesynthlines8511670)

---

## File: `js/vox-audio.js (Part 2: Audio FX & Teletype Synth, Lines 851-1670)` <a id="file-jsvoxaudiojspart2audiofxteletypesynthlines8511670"></a>

````javascript
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
        if (explicit === 'necron' || explicit === 'militarum') {
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
        }
      }
    } catch (e) {}

    try {
      if (localStore && typeof localStore.getItem === 'function') {
        const rawBriefing = localStore.getItem('foa_briefing_state_v3');
        if (rawBriefing) {
          const parsedBriefing = JSON.parse(rawBriefing);
          if (parsedBriefing) {
            if (parsedBriefing.unlockedBeta && !parsedBriefing.unlockedAlpha) return 'necron';
            if (parsedBriefing.unlockedAlpha && !parsedBriefing.unlockedBeta) return 'militarum';
            if (parsedBriefing.unlockedBeta && parsedBriefing.unlockedAlpha) {
              return parsedBriefing.activeDossier === 'alpha' ? 'militarum' : 'necron';
            }
          }
        }
      }
    } catch (e) {}

    return null;
  }

  /**
   * Applies the given faction theme ('necron' or 'militarum') to document.body
   * and optionally persists it to localStorage across all pages.
   *
   * @param {'necron' | 'militarum' | null} theme - Target faction theme
   * @param {boolean} [persist=true] - Whether to persist in localStorage
   * @returns {'necron' | 'militarum' | null} Applied theme
   */
  function setFactionTheme(theme, persist = true) {
    const normalized = theme === 'necron' ? 'necron' : (theme === 'militarum' ? 'militarum' : null);
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
````
