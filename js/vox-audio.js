/**
 * SANCTUARY OF ASH // VOX-CASTER AMBIENT PLAYLIST RANDOMIZER & TERMINAL SFX
 * Playlist: https://www.youtube.com/playlist?list=PL1PnO3JojeSmA_jPzjhuiKycUQ8BHHjek
 */
(function () {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const PLAYLIST_ID = 'PL1PnO3JojeSmA_jPzjhuiKycUQ8BHHjek';
  const STORAGE_KEY_MUSIC = 'soa_vox_music_enabled_v1';

  let ytPlayer = null;
  let ytReady = false;
  let isPlaying = false;
  let wantMusic = false;
  try {
    wantMusic = localStorage.getItem(STORAGE_KEY_MUSIC) === 'true';
  } catch (err) {
    console.warn('Could not read music preference from localStorage:', err);
  }

  // =========================================================================
  // PART 1: MECHANICAL SCI-FI BUTTON CLANK (WEB AUDIO SYNTH - ALWAYS ACTIVE)
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
   * Synthesizes a gritty Imperial cogitator relay click / mechanical clank.
   * @param {boolean} heavy - True for primary launch/gate buttons
   */
  function playTerminalClank(heavy = false) {
    const ctx = getAudioCtx();
    if (!ctx) return;

    const now = ctx.currentTime;

    // 1. Low metallic switch thud
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = heavy ? 'sawtooth' : 'triangle';
    osc.frequency.setValueAtTime(heavy ? 145 : 190, now);
    osc.frequency.exponentialRampToValueAtTime(38, now + (heavy ? 0.085 : 0.045));

    gain.gain.setValueAtTime(heavy ? 0.22 : 0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (heavy ? 0.09 : 0.05));

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + (heavy ? 0.095 : 0.055));

    // 2. High-frequency relay snap transient
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = 'square';
    clickOsc.frequency.setValueAtTime(heavy ? 920 : 1350, now);
    clickOsc.frequency.exponentialRampToValueAtTime(220, now + 0.018);

    clickGain.gain.setValueAtTime(0.06, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

    clickOsc.connect(clickGain);
    clickGain.connect(ctx.destination);
    clickOsc.start(now);
    clickOsc.stop(now + 0.022);
  }

  // Global listener for all interactive controls (independent of music toggle)
  document.addEventListener('click', (e) => {
    const target = e.target.closest(
      'button, .suite-link, .choice-card, .slider-node, .map-node-group, summary, .terminal-link-btn'
    );
    if (target) {
      const isHeavy = target.matches('.launch-btn, .gate-btn, .btn-red, .terminal-link-btn');
      playTerminalClank(isHeavy);
    }

    // If user previously turned music ON, resume playback on first interaction
    if (wantMusic && ytReady && !isPlaying && !e.target.closest('#voxMusicToggle')) {
      startRandomTrack();
    }
  });

  // =========================================================================
  // PART 2: TOP-NAV YOUTUBE PLAYLIST RANDOMIZER (MUSIC ONLY)
  // =========================================================================
  function injectNavToggle() {
    const nav = document.querySelector('.suite-nav');
    if (!nav || document.getElementById('voxMusicToggle')) return;

    const wrap = document.createElement('div');
    wrap.className = 'vox-caster-bar';
    wrap.innerHTML = `
      <button type="button" id="voxMusicToggle" class="vox-music-btn" title="Toggle 40K Ship Ambience Playlist">
        <span id="voxMusicIcon">🔇</span>
        <span id="voxMusicLabel">VOX-AMBIENCE: OFF</span>
        <span class="vox-eq"><span></span><span></span><span></span></span>
      </button>
      <button type="button" id="voxMusicSkip" class="vox-music-btn hidden" title="Randomize Next Ambient Track">
        ⏭️
      </button>
    `;
    nav.appendChild(wrap);

    // Hidden 1x1 container for the YouTube IFrame API player
    const ytHost = document.createElement('div');
    ytHost.id = 'soaHiddenYtPlayer';
    ytHost.style.cssText = 'position:fixed;bottom:-10px;right:-10px;width:1px;height:1px;opacity:0.01;pointer-events:none;z-index:-1;';
    document.body.appendChild(ytHost);

    document.getElementById('voxMusicToggle').addEventListener('click', toggleMusic);
    document.getElementById('voxMusicSkip').addEventListener('click', () => {
      if (ytReady) startRandomTrack();
    });

    updateMusicUI(false);
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
          event.target.setVolume(35); // Comfortable atmospheric background level
          event.target.setLoop(true);
          event.target.setShuffle(true);
          if (wantMusic) {
            startRandomTrack();
          }
        },
        onStateChange: (event) => {
          if (event.data === YT.PlayerState.PLAYING) {
            isPlaying = true;
            updateMusicUI(true);
          } else if (
            event.data === YT.PlayerState.PAUSED ||
            event.data === YT.PlayerState.ENDED
          ) {
            if (!wantMusic) {
              isPlaying = false;
              updateMusicUI(false);
            }
          }
        }
      }
    });
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
        // Fallback random index across the playlist if array isn't populated yet
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
        startRandomTrack();
      }
    } else {
      isPlaying = false;
      updateMusicUI(false);
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
