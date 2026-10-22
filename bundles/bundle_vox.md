# 📦 Fires of Armageddon // Bundle: Mode 7 - Astropathic CRT Vox-Terminal

Complete source code for the Astropathic CRT Vox-Terminal, Conduit Pass-Seal Security, Real-Time Teletype Audio Streaming, and Interferences Array (`pages/vox.html`).

## 📑 Table of Contents
- [pages/vox.html](#file-pagesvoxhtml)

---

## File: `pages/vox.html` <a id="file-pagesvoxhtml"></a>

````html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fires of Armageddon // Astropathic CRT Vox-Terminal</title>
  <link rel="icon" type="image/svg+xml" href="../assets/favicon.svg">
  <link rel="apple-touch-icon" href="../assets/favicon.svg">
  <link rel="stylesheet" href="../css/style.css">
  <style>
    /* ===================================================================== */
    /* RECESSED CATHODE-RAY (CRT) GREEN & AMBER PHOSPHOR MONITOR STYLING     */
    /* ===================================================================== */
    .vox-shell {
      max-width: 1200px;
      width: 100%;
      margin: 0 auto;
      padding: 16px 20px 48px 20px;
      box-sizing: border-box;
    }

    .crt-monitor-frame {
      position: relative;
      background: #030704;
      border: 2px solid #1e3a29;
      border-radius: 14px;
      padding: 18px;
      min-height: 480px;
      height: clamp(500px, 64vh, 720px);
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 14px;
      margin-bottom: 14px;
      box-shadow:
        inset 0 0 48px rgba(0, 0, 0, 0.95),
        inset 0 0 18px rgba(0, 255, 136, 0.08),
        0 8px 28px rgba(0, 0, 0, 0.75);
      font-family: 'Courier New', Consolas, monospace;
    }

    .crt-monitor-frame::-webkit-scrollbar {
      width: 8px;
    }
    .crt-monitor-frame::-webkit-scrollbar-track {
      background: rgba(3, 7, 4, 0.95);
      border-radius: 4px;
    }
    .crt-monitor-frame::-webkit-scrollbar-thumb {
      background: #1e3a29;
      border-radius: 4px;
      border: 1px solid rgba(0, 255, 136, 0.25);
    }
    .crt-monitor-frame::-webkit-scrollbar-thumb:hover {
      background: #00ff88;
    }

    /* Subtle Horizontal CRT Scanlines & Phosphor Vignette */
    .crt-monitor-frame::before {
      content: "";
      position: sticky;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      pointer-events: none;
      background: repeating-linear-gradient(
        0deg,
        rgba(0, 0, 0, 0.26) 0px,
        rgba(0, 0, 0, 0.26) 1px,
        transparent 1px,
        transparent 3px
      );
      z-index: 4;
    }

    /* Individual Exchange Container */
    .crt-exchange-wrap {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-bottom: 16px;
    }

    .crt-older-bar {
      text-align: center;
      margin-bottom: 14px;
      padding: 4px 0;
    }

    .crt-older-btn {
      font-family: monospace;
      font-size: 0.76rem;
      letter-spacing: 1px;
      color: #ffb000;
      border: 1px solid rgba(255, 176, 0, 0.4);
      background: rgba(26, 16, 4, 0.75);
      border-radius: 6px;
      padding: 6px 16px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .crt-older-btn:hover {
      background: rgba(255, 176, 0, 0.2);
      border-color: #ffb000;
      box-shadow: 0 0 10px rgba(255, 176, 0, 0.35);
    }

    /* Outgoing Player Transmission (Glowing CRT Amber Phosphor) */
    .crt-msg-card {
      background: rgba(26, 16, 4, 0.85);
      border: 1px solid rgba(255, 176, 0, 0.38);
      border-left: 4px solid #ffb000;
      border-radius: 8px;
      padding: 11px 15px;
      color: #ffcc4d;
      text-shadow: 0 0 6px rgba(255, 176, 0, 0.42);
      font-size: 0.88rem;
      line-height: 1.55;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .crt-msg-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.72rem;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: #ff9900;
      border-bottom: 1px dashed rgba(255, 176, 0, 0.28);
      padding-bottom: 5px;
      margin-bottom: 8px;
    }

    /* Incoming Campaign Master Dispatch (Glowing CRT Emerald Phosphor) */
    .crt-reply-card {
      background: rgba(3, 22, 12, 0.86);
      border: 1px solid rgba(0, 255, 136, 0.4);
      border-left: 4px solid #00ff88;
      border-radius: 8px;
      padding: 13px 15px;
      margin-top: 10px;
      color: #66ffb8;
      text-shadow: 0 0 8px rgba(0, 255, 136, 0.48);
      font-size: 0.9rem;
      line-height: 1.6;
      white-space: pre-wrap;
      word-break: break-word;
    }

    .crt-reply-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.72rem;
      letter-spacing: 1.1px;
      text-transform: uppercase;
      color: #00ff88;
      border-bottom: 1px dashed rgba(0, 255, 136, 0.3);
      padding-bottom: 5px;
      margin-bottom: 8px;
      font-weight: 800;
    }

    .crt-pending-line {
      margin-top: 10px;
      padding-top: 8px;
      border-top: 1px dashed rgba(255, 176, 0, 0.22);
      color: #ffb000;
      font-size: 0.78rem;
      font-style: italic;
      opacity: 0.9;
    }

    /* Blinking Phosphor Block Cursor */
    .crt-cursor {
      display: inline-block;
      width: 8px;
      height: 1em;
      background: currentColor;
      vertical-align: text-bottom;
      margin-left: 2px;
      box-shadow: 0 0 8px currentColor;
      animation: crtBlink 0.75s step-end infinite;
    }

    @keyframes crtBlink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }

    /* Psychic Interferences (Crimson & Amber Glitch Phosphor) */
    .crt-intercept-card {
      background: rgba(24, 6, 10, 0.85);
      border: 1px dashed rgba(255, 71, 87, 0.55);
      border-left: 4px solid #ff4757;
      border-radius: 8px;
      padding: 13px 15px;
      color: #fda4af;
      text-shadow: 0 0 6px rgba(255, 71, 87, 0.45);
      font-size: 0.88rem;
      line-height: 1.58;
      white-space: pre-wrap;
    }

    .censor-bar {
      background: #ff4757;
      color: #160407;
      padding: 1px 6px;
      border-radius: 3px;
      font-weight: 900;
      letter-spacing: 0.6px;
      text-shadow: none;
      box-shadow: 0 0 8px rgba(255, 71, 87, 0.65);
    }

    /* CRT Input Box */
    .crt-input-textarea {
      width: 100%;
      background: #030805;
      color: #ffcc4d;
      text-shadow: 0 0 5px rgba(255, 176, 0, 0.4);
      border: 1.5px solid #2b4c39;
      border-radius: 10px;
      padding: 12px 14px;
      font-family: 'Courier New', Consolas, monospace;
      font-size: 0.9rem;
      resize: vertical;
      min-height: 68px;
    }
    .crt-input-textarea:focus {
      outline: none;
      border-color: #ffb000;
      box-shadow: 0 0 12px rgba(255, 176, 0, 0.25);
    }

    .queued-dossier-banner {
      background: rgba(255, 176, 0, 0.14);
      border: 1.5px dashed #ffb000;
      color: #ffcc4d;
      text-shadow: 0 0 6px rgba(255, 176, 0, 0.4);
      padding: 12px 16px;
      border-radius: 10px;
      margin-bottom: 16px;
      font-family: 'Courier New', Consolas, monospace;
      font-size: 0.85rem;
      text-align: center;
    }

    /* ========================================================================= */
    /* RESPONSIVE IMPOSING DESKTOP COGITATOR & FLUID MOBILE VIEWPORTS            */
    /* ========================================================================= */
    @media (min-width: 1024px) {
      .vox-shell {
        max-width: 1200px;
        padding: 22px 28px 56px 28px;
      }
      .crt-monitor-frame {
        min-height: 560px;
        height: clamp(560px, 66vh, 780px);
        padding: 24px 28px;
        gap: 18px;
        border-width: 2.5px;
        border-radius: 16px;
        box-shadow:
          inset 0 0 56px rgba(0, 0, 0, 0.96),
          inset 0 0 24px rgba(0, 255, 136, 0.1),
          0 14px 44px rgba(0, 0, 0, 0.85);
      }
      .crt-msg-card {
        padding: 14px 20px;
        font-size: 0.94rem;
        line-height: 1.62;
        border-radius: 10px;
      }
      .crt-reply-card {
        padding: 16px 22px;
        font-size: 0.96rem;
        line-height: 1.68;
        border-radius: 10px;
      }
      .crt-msg-header,
      .crt-reply-header {
        font-size: 0.78rem;
        letter-spacing: 1.2px;
        padding-bottom: 7px;
        margin-bottom: 10px;
      }
      .crt-input-textarea {
        min-height: 82px;
        font-size: 0.95rem;
        padding: 14px 18px;
        border-radius: 12px;
      }
      #subWinDirect button.btn-red {
        min-width: 160px;
        font-size: 0.95rem;
        padding: 12px 20px;
      }
      .crt-older-btn {
        font-size: 0.82rem;
        padding: 8px 22px;
      }
    }

    @media (max-width: 640px) {
      .vox-shell {
        padding: 10px 8px 32px 8px;
      }
      .crt-monitor-frame {
        min-height: 380px;
        height: 56vh;
        padding: 12px 10px;
        gap: 10px;
        border-radius: 10px;
      }
      .crt-msg-card {
        padding: 10px 12px;
        font-size: 0.85rem;
        line-height: 1.5;
      }
      .crt-reply-card {
        padding: 12px 14px;
        font-size: 0.86rem;
        line-height: 1.52;
      }
      .crt-msg-header,
      .crt-reply-header {
        font-size: 0.7rem;
      }
      .hud-bar {
        padding: 8px 10px;
        flex-wrap: wrap;
        gap: 8px;
      }
      .crt-input-textarea {
        min-height: 60px;
        font-size: 0.86rem;
        padding: 10px;
      }
      #subWinDirect button.btn-red {
        min-width: 100px;
        font-size: 0.82rem;
        padding: 8px 12px;
      }
      .crt-older-btn {
        font-size: 0.74rem;
        padding: 6px 12px;
      }
    }
  </style>
</head>
<body>

  <!-- CAMPAIGN SUITE TOP NAVIGATION -->
  <nav class="suite-nav">
    <a href="../index.html" class="suite-link">📖 Field Codex &amp; Guide</a>
    <a href="spawner.html" class="suite-link">🧟 Mode 1: Horde Command &amp; Spawner</a>
    <a href="pvp.html" class="suite-link">⚔️ Mode 2: 1v1 Ash Wastes PvP</a>
    <a href="rogue.html" class="suite-link">🎲 Mode 3: Rogue Sector &amp; AI Tracker</a>
    <a href="roster.html" class="suite-link">🎖️ Mode 4: Hostile Matrix &amp; Nemeses</a>
    <a href="crusade.html" class="suite-link">🏆 Mode 5: Crusade Quartermaster</a>
    <a href="briefing.html" class="suite-link">📜 Mode 6: Briefings, Ship &amp; Atlas</a>
    <a href="vox.html" class="suite-link active">📡 Mode 7: Astropath Vox</a>
  </nav>

<div class="app-shell vox-shell">

  <!-- STEP 1: SELECT CONDUIT & AUTHENTICATE / SEAL -->
  <div id="authScreen" class="hero-card" style="max-width:780px; margin:0 auto 22px auto;">
    <div class="hero-header">
      <div class="status-pill" id="sealStatusBadge">
        <span class="pulse-dot"></span> Checking Astropathic Seal...
      </div>
      <h1 class="hero-title">Astropathic CRT Vox-Sanctum</h1>
      <p class="hero-subtitle" id="sealSubtitle">
        Encrypted Cathode-Ray Terminal • Direct Link to the Campaign Master
      </p>
    </div>

    <!-- BANNER SHOWN WHEN REDIRECTED FROM CRUSADE.HTML OR ROSTER.HTML WITH A COMPILED DOSSIER -->
    <div id="pendingDossierNotice" class="queued-dossier-banner hidden">
      📡 <strong>[1 ENCRYPTED DOSSIER QUEUED IN BUFFER]</strong><br>
      Authenticate your Vermilion Pass-Seal below to automatically transmit your compiled Dossier to the Campaign Master!
    </div>

    <label class="setup-label">1. Select Your Private Command Conduit</label>
    <div class="choice-grid" style="margin-bottom:16px;">
      <div id="cardAlpha" class="choice-card selected" onclick="selectConduit('alpha')">
        <span class="choice-icon">🦅</span>
        <div class="choice-title">Terminal Alpha</div>
        <div class="choice-sub">The Exile // Sanctuary of Ash</div>
      </div>
      <div id="cardBeta" class="choice-card" onclick="selectConduit('beta')">
        <span class="choice-icon">💀</span>
        <div class="choice-title">Terminal Beta</div>
        <div class="choice-sub">Lord Commander Junebug</div>
      </div>
    </div>

    <label class="setup-label" id="passLabel">2. Enter Secret Vermilion Pass-Seal</label>
    <div class="seed-row" style="max-width:440px; margin:0 auto 14px auto;">
      <input
        type="password"
        id="passInput"
        class="seed-input"
        placeholder="Enter private passphrase..."
        style="text-transform:none; letter-spacing:1px;"
        onkeydown="if(event.key==='Enter') handleSealAction()"
      >
    </div>

    <p id="authErrorMsg" style="color:var(--red); font-size:0.85rem; margin-bottom:12px;" class="hidden"></p>

    <button class="launch-btn" id="sealActionBtn" onclick="handleSealAction()" style="max-width:380px; margin:0 auto; display:block;">
      🔓 Authenticate Conduit
    </button>
  </div>

  <!-- STEP 2: UNLOCKED CRT TERMINAL -->
  <div id="terminalScreen" class="hidden">
    <div class="hud-bar" style="margin-bottom:14px;">
      <div class="hud-stat">
        <span class="hud-label">LOCKED CONDUIT</span>
        <span class="hud-num" id="activeConduitLabel" style="color:#00ff88; font-size:0.95rem; text-shadow:0 0 6px rgba(0,255,136,0.4);">TERMINAL ALPHA</span>
      </div>
      <div style="display:flex; gap:8px; align-items:center;">
        <button class="btn-ghost btn-sm" onclick="refreshTerminal(true)">🔄 Poll Warp</button>
        <button class="btn-red btn-sm" onclick="lockTerminal()">🔒 Sever Link</button>
      </div>
    </div>

    <!-- SUB-WINDOW SWITCHER -->
    <div class="nav-pills" style="margin-bottom:14px;">
      <button id="winBtn1" class="active" onclick="switchSubWindow('direct')">
        🔒 Direct Campaign Master Link
      </button>
      <button id="winBtn2" onclick="switchSubWindow('interferences')">
        ⚡ Interferences <span id="interferenceCountBadge" class="hud-sub"></span>
      </button>
    </div>

    <!-- SUB-WINDOW 1: DIRECT CAMPAIGN MASTER CRT MONITOR -->
    <div id="subWinDirect">
      <div id="directMessagesBox" class="crt-monitor-frame"></div>

      <div style="display:flex; gap:10px; align-items:stretch;">
        <textarea
          id="questionInput"
          class="crt-input-textarea"
          placeholder="Type transmission for the Campaign Master (or transmit a Master Battle / Nemesis Dossier from the Crusade & Roster tabs)..."
        ></textarea>
        <button class="btn-red" onclick="transmitQuestion()" style="min-width:130px; font-family:monospace; letter-spacing:1px;">
          📡 TRANSMIT
        </button>
      </div>
    </div>

    <!-- SUB-WINDOW 2: ASTROPATHIC INTERFERENCES CRT MONITOR -->
    <div id="subWinInterferences" class="hidden">
      <div class="round-banner" style="padding:12px 16px; margin-bottom:12px; text-align:left; border-color:rgba(255, 71, 87, 0.4);">
        <h3 style="margin:0 0 4px 0; color:var(--red); font-size:0.95rem; font-family:monospace;">
          ⚡ ASTROPATHIC CHOIR BLEED // PASSIVE INTERCEPT ARRAY
        </h3>
        <p style="margin:0; font-size:0.82rem; color:var(--muted);">
          When your rival Commander transmits high-priority battle reports, covert schemes, or relic discoveries through the Immaterium, psychic fragments occasionally bleed across your receiver...
        </p>
      </div>
      <div id="interferencesBox" class="crt-monitor-frame"></div>
    </div>
  </div>

</div>

<script src="../js/vox-audio.js"></script>
<script>
  // =========================================================================
  // SUPABASE CONFIGURATION (RLS-Protected RPC Endpoints)
  // =========================================================================
  const SUPABASE_URL = 'https://dsfvhjjalexqpbzqoaqb.supabase.co';
  const SUPABASE_ANON_KEY = 'sb_publishable_R3wXKsK7Gl54-8BNCauUNg_NIoosOOO';

  const SEEN_IDS_STORAGE_KEY = 'foa_vox_seen_ids_v1';
  const SESSION_AUTH_KEY = 'foa_vox_active_session_v1';

  let selectedChannel = 'alpha';
  let activePassphrase = null;
  let isChannelSealed = true;
  let pollTimer = null;
  let activeStreamTimers = [];
  let showAllOlderMessages = false;
  let showAllOlderInterferences = false;

  function toggleOlderMessages() {
    showAllOlderMessages = !showAllOlderMessages;
    const dBox = document.getElementById('directMessagesBox');
    if (dBox) dBox.dataset.sig = '';
    refreshTerminal(false);
  }

  function toggleOlderInterferences() {
    showAllOlderInterferences = !showAllOlderInterferences;
    const iBox = document.getElementById('interferencesBox');
    if (iBox) iBox.dataset.sig = '';
    refreshTerminal(false);
  }

  // Track which message & reply IDs have already animated so they only stream once
  let seenTokens = new Set();
  try {
    const rawSeen = sessionStorage.getItem(SEEN_IDS_STORAGE_KEY);
    if (rawSeen) {
      JSON.parse(rawSeen).forEach(k => seenTokens.add(k));
    }
  } catch (e) {}

  function markTokenSeen(token) {
    seenTokens.add(token);
    try {
      sessionStorage.setItem(SEEN_IDS_STORAGE_KEY, JSON.stringify(Array.from(seenTokens)));
    } catch (e) {}
  }

  async function rpcCall(fnName, params) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fnName}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify(params)
    });
    if (!res.ok) throw new Error(`Astropathic RPC fault (${res.status})`);
    return res.json();
  }

  function checkPendingDossierBuffer() {
    try {
      const raw = sessionStorage.getItem('foa_pending_vox_payload');
      const banner = document.getElementById('pendingDossierNotice');
      if (!raw) {
        if (banner) banner.classList.add('hidden');
        return null;
      }
      const parsed = JSON.parse(raw);
      if (banner) banner.classList.remove('hidden');
      if (parsed.channel && parsed.channel !== selectedChannel) {
        selectConduit(parsed.channel, false);
      }
      return parsed;
    } catch (e) {
      return null;
    }
  }

  async function selectConduit(chan, clearPendingCheck = false) {
    selectedChannel = chan;
    const cardA = document.getElementById('cardAlpha');
    const cardB = document.getElementById('cardBeta');
    const errEl = document.getElementById('authErrorMsg');
    if (cardA) cardA.classList.toggle('selected', chan === 'alpha');
    if (cardB) cardB.classList.toggle('selected', chan === 'beta');
    if (errEl) errEl.classList.add('hidden');

    try {
      isChannelSealed = await rpcCall('check_channel_seal', { p_channel: chan });
      const badge = document.getElementById('sealStatusBadge');
      const sub = document.getElementById('sealSubtitle');
      const label = document.getElementById('passLabel');
      const btn = document.getElementById('sealActionBtn');

      if (!isChannelSealed) {
        badge.innerHTML = `<span class="pulse-dot"></span> UNSEALED CONDUIT • FIRST-BOOT SETUP`;
        sub.textContent = `This conduit has not been sealed yet. Choose a permanent secret passphrase—once inscribed, it will lock this terminal exclusively to you!`;
        label.textContent = `2. Create Your Permanent Secret Passphrase`;
        btn.textContent = `🛡️ Inscribe Permanent Seal & Unlock`;
      } else {
        badge.innerHTML = `<span class="pulse-dot"></span> VERMILION SEAL ACTIVE • ENCRYPTED`;
        sub.textContent = `Conduit sealed to ${chan === 'alpha' ? 'The Exile // Sanctuary of Ash' : 'Lord Commander Junebug'}. Enter your secret passphrase to decrypt.`;
        label.textContent = `2. Enter Secret Vermilion Pass-Seal`;
        btn.textContent = `🔓 Authenticate & Decrypt Conduit`;
      }
    } catch (err) {
      document.getElementById('sealStatusBadge').textContent = '⚠️ Configure SUPABASE_URL in pages/vox.html';
    }
  }

  async function handleSealAction() {
    const passEl = document.getElementById('passInput');
    const pass = (passEl ? passEl.value : '').trim();
    const errEl = document.getElementById('authErrorMsg');

    if (pass.length < 3) {
      errEl.textContent = 'Passphrase must be at least 3 characters.';
      errEl.classList.remove('hidden');
      return;
    }

    try {
      const result = await rpcCall('unlock_or_seal_channel', {
        p_channel: selectedChannel,
        p_passphrase: pass
      });

      if (!result || !result.ok) {
        errEl.textContent = (result && result.error) || 'Access Denied: Invalid Vermilion Pass-Seal.';
        errEl.classList.remove('hidden');
        if (window.VoxAudio && typeof window.VoxAudio.playScarHazard === 'function') {
          window.VoxAudio.playScarHazard();
        }
        return;
      }

      activePassphrase = pass;
      try {
        sessionStorage.setItem(SESSION_AUTH_KEY, JSON.stringify({ channel: selectedChannel, pass }));
      } catch (e) {}

      if (passEl) passEl.value = '';
      errEl.classList.add('hidden');

      document.getElementById('authScreen').classList.add('hidden');
      document.getElementById('terminalScreen').classList.remove('hidden');
      document.getElementById('activeConduitLabel').textContent =
        selectedChannel === 'alpha' ? '🦅 THE EXILE // SANCTUARY OF ASH' : '💀 LORD COMMANDER JUNEBUG';

      // Check if a compiled Master Battle Dossier or Nemesis Dossier is waiting in sessionStorage!
      await flushPendingDossierIfAny();

      await refreshTerminal(false);
      if (pollTimer) clearInterval(pollTimer);
      pollTimer = setInterval(() => refreshTerminal(false), 7000);
    } catch (err) {
      errEl.textContent = 'Connection error: Verify Supabase URL & Anon Key.';
      errEl.classList.remove('hidden');
    }
  }

  async function flushPendingDossierIfAny() {
    try {
      const raw = sessionStorage.getItem('foa_pending_vox_payload');
      if (!raw) return;
      const queued = JSON.parse(raw);
      sessionStorage.removeItem('foa_pending_vox_payload');
      const notice = document.getElementById('pendingDossierNotice');
      if (notice) notice.classList.add('hidden');

      if (queued && queued.text && activePassphrase) {
        const senderName = selectedChannel === 'alpha'
          ? 'The Exile // Sanctuary of Ash'
          : 'Lord Commander Junebug';

        await rpcCall('send_vox_message', {
          p_channel: selectedChannel,
          p_passphrase: activePassphrase,
          p_sender: senderName,
          p_question: queued.text
        });
      }
    } catch (e) {
      console.warn('Queued dossier auto-dispatch warning:', e);
    }
  }

  function clearStreamTimers() {
    activeStreamTimers.forEach(id => clearInterval(id));
    activeStreamTimers = [];
  }

  /**
   * Streams text character-by-character into a target DOM node with a blinking
   * phosphor block cursor and CRT teletype sound ticks!
   */
  function streamTextIntoElement(targetEl, fullText, isRedactedMode = false, cursorLingerMs = 0) {
    targetEl.innerHTML = '';
    const textSpan = document.createElement('span');
    const cursorSpan = document.createElement('span');
    cursorSpan.className = 'crt-cursor';
    cursorSpan.textContent = ' ';
    targetEl.appendChild(textSpan);
    targetEl.appendChild(cursorSpan);

    let idx = 0;
    const total = fullText.length;
    // Fast enough to read comfortably, slow enough to feel like a live CRT teletype
    const stepSize = total > 650 ? 3 : total > 280 ? 2 : 1;

    const timer = setInterval(() => {
      if (idx >= total) {
        clearInterval(timer);
        if (isRedactedMode) {
          targetEl.innerHTML = formatRedactedHtml(fullText);
        } else {
          textSpan.textContent = fullText;
        }
        if (cursorLingerMs > 0) {
          const lingerTimer = setTimeout(() => {
            if (cursorSpan && cursorSpan.parentNode) {
              cursorSpan.remove();
            }
          }, cursorLingerMs);
          activeStreamTimers.push(lingerTimer);
        } else {
          if (cursorSpan && cursorSpan.parentNode) {
            cursorSpan.remove();
          }
        }
        return;
      }

      const nextIdx = Math.min(total, idx + stepSize);
      const slice = fullText.slice(0, nextIdx);
      textSpan.textContent = slice;

      // Play subtle teletype tick every few characters
      if (window.VoxAudio && typeof window.VoxAudio.playTeletypeTick === 'function') {
        const ch = fullText[idx];
        if (ch === '▓' || (isRedactedMode && ch === '[')) {
          window.VoxAudio.playTeletypeTick('redact');
        } else if (idx % 3 === 0 && ch !== ' ' && ch !== '\n') {
          window.VoxAudio.playTeletypeTick('stream');
        }
      }

      idx = nextIdx;
      const frame = targetEl.closest('.crt-monitor-frame');
      if (frame) frame.scrollTop = frame.scrollHeight;
    }, 18);

    activeStreamTimers.push(timer);
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }

  function formatRedactedHtml(raw) {
    return escapeHtml(raw).replace(
      /\[REDACTED\]/gi,
      '<span class="censor-bar">▓▓REDACTED▓▓</span>'
    );
  }

  /**
   * Dynamically extracts the speaker/card title from the first +++ ... +++ banner
   * (or [CARD_TITLE: ...]) of the Supabase reply, and strips that first line from
   * the body so the title appears cleanly at the top of the CRT card without repeating!
   */
  function extractDynamicReplyCardMeta(rawReply) {
    const fallbackTitle = '++ CAMPAIGN MASTER // SEGMENTUM SOLAR COMMAND ++';
    if (!rawReply || typeof rawReply !== 'string') {
      return { cardTitle: fallbackTitle, cleanBody: rawReply || '' };
    }

    const trimmed = rawReply.trim();

    // 1. Check for explicit [CARD_TITLE: ...] override if present
    const explicitMatch = trimmed.match(/^\[CARD_TITLE:\s*([^\]]+)\]\s*\n?/i);
    if (explicitMatch) {
      return {
        cardTitle: `++ ${explicitMatch[1].trim().toUpperCase()} ++`,
        cleanBody: trimmed.slice(explicitMatch[0].length).trim()
      };
    }

    // 2. Check if the first line is a canonical +++ HEADER BANNER +++
    const bannerMatch = trimmed.match(/^\+{2,}\s*([^\n+]+?)\s*\+{2,}[ \t]*\n+/);
    if (bannerMatch) {
      return {
        cardTitle: `++ ${bannerMatch[1].trim().toUpperCase()} ++`,
        cleanBody: trimmed.slice(bannerMatch[0].length).trim()
      };
    }

    // 3. Fallback inference if +++ banner was mid-text
    if (/ASHEN SPIRIT|MU-TH-UR|DECK 44/i.test(trimmed)) {
      return {
        cardTitle: '++ ASHEN SPIRIT LOGIC CORE // DECK 44 COGITATOR ++',
        cleanBody: trimmed
      };
    }

    return { cardTitle: fallbackTitle, cleanBody: trimmed };
  }

  async function refreshTerminal(forceScroll = false) {
    if (!activePassphrase) return;
    try {
      const data = await rpcCall('get_vox_terminal_data', {
        p_channel: selectedChannel,
        p_passphrase: activePassphrase
      });
      if (!data || !data.ok) return;

      const msgs = data.messages || [];
      const dBox = document.getElementById('directMessagesBox');

      if (msgs.length === 0) {
        dBox.innerHTML = `<p style="color:#00ff88; text-align:center; margin-top:45px; opacity:0.7;">++ NO TRANSMISSIONS LOGGED ON THIS FREQUENCY YET ++<span class="crt-cursor"></span></p>`;
      } else {
        // First time loading history: mark older messages as seen EXCEPT the very latest one so the latest always streams!
        if (seenTokens.size === 0 && msgs.length > 1) {
          for (let i = 0; i < msgs.length - 1; i++) {
            seenTokens.add(`q_${msgs[i].id}`);
            if (msgs[i].status === 'answered' && msgs[i].reply) {
              seenTokens.add(`r_${msgs[i].id}`);
            }
          }
        }

        const totalCount = msgs.length;
        const hasOlder = totalCount > 3;
        const visibleMsgs = (hasOlder && !showAllOlderMessages) ? msgs.slice(-3) : msgs;

        // Only rebuild DOM if a new message, new reply, or toggle state changed
        const stateSignature = `${showAllOlderMessages ? 'all' : 'recent'}_${visibleMsgs.map(m => `${m.id}:${m.status}`).join('|')}`;
        if (dBox.dataset.sig !== stateSignature) {
          clearStreamTimers();
          dBox.dataset.sig = stateSignature;
          dBox.innerHTML = '';

          // Render "See Older Messages" button if more than 3 messages exist
          if (hasOlder) {
            const olderBar = document.createElement('div');
            olderBar.className = 'crt-older-bar';

            const olderBtn = document.createElement('button');
            olderBtn.type = 'button';
            olderBtn.id = 'toggleOlderMsgsBtn';
            olderBtn.className = 'btn-ghost btn-sm crt-older-btn';
            olderBtn.textContent = showAllOlderMessages
              ? '🔼 Collapse to Recent 3 Messages'
              : `📜 See Older Messages (${totalCount - 3} older)`;
            olderBtn.onclick = toggleOlderMessages;

            olderBar.appendChild(olderBtn);
            dBox.appendChild(olderBar);
          }

          visibleMsgs.forEach(m => {
            const wrap = document.createElement('div');
            wrap.className = 'crt-exchange-wrap';

            // 1. Player Outgoing Message Card (Amber CRT Phosphor)
            const msgCard = document.createElement('div');
            msgCard.className = 'crt-msg-card';
            const timeStr = m.created_at ? new Date(m.created_at).toLocaleTimeString() : 'VOX-LOG';
            msgCard.innerHTML = `
              <div class="crt-msg-header">
                <strong>📡 ${escapeHtml(m.sender)}</strong>
                <span>${escapeHtml(timeStr)}</span>
              </div>
              <div class="crt-q-body"></div>
            `;
            const qBody = msgCard.querySelector('.crt-q-body');
            const qToken = `q_${m.id}`;

            if (!seenTokens.has(qToken)) {
              markTokenSeen(qToken);
              streamTextIntoElement(qBody, m.question || '', false);
            } else {
              qBody.textContent = m.question || '';
            }
            wrap.appendChild(msgCard);

            // 2. Campaign Master Reply Card (Emerald CRT Phosphor) or Pending Line
            if (m.status === 'answered' && m.reply) {
              const { cardTitle, cleanBody } = extractDynamicReplyCardMeta(m.reply);

              const repCard = document.createElement('div');
              repCard.className = 'crt-reply-card crt-msg-card reply';
              const ansTime = m.answered_at ? new Date(m.answered_at).toLocaleTimeString() : 'DECRYPTED';
              repCard.innerHTML = `
                <div class="crt-reply-header crt-msg-meta">
                  <span>${escapeHtml(cardTitle)}</span>
                  <span>${escapeHtml(ansTime)}</span>
                </div>
                <div class="crt-r-body crt-msg-body"></div>
              `;
              const rBody = repCard.querySelector('.crt-r-body');
              const rToken = `r_${m.id}`;

              if (!seenTokens.has(rToken)) {
                markTokenSeen(rToken);
                streamTextIntoElement(rBody, cleanBody, false, 2500);
              } else {
                rBody.textContent = cleanBody;
              }
              wrap.appendChild(repCard);
            } else {
              const pend = document.createElement('div');
              pend.className = 'crt-pending-line';
              pend.innerHTML = `⏳ Signal traversing the Immaterium... Awaiting Campaign Master decree <span class="crt-cursor"></span>`;
              wrap.appendChild(pend);
            }

            dBox.appendChild(wrap);
          });

          if (!showAllOlderMessages || forceScroll) {
            dBox.scrollTop = dBox.scrollHeight;
          }
        }
      }

      // Render Redacted Astropathic Interferences
      const ints = data.interferences || [];
      const iBox = document.getElementById('interferencesBox');
      const badge = document.getElementById('interferenceCountBadge');
      if (badge) badge.textContent = ints.length > 0 ? `(${ints.length})` : '';

      if (ints.length === 0) {
        iBox.innerHTML = `<p style="color:#fda4af; text-align:center; margin-top:45px; opacity:0.65;">++ NO PSYCHIC BLEED DETECTED IN THE IMMATERIUM ++</p>`;
      } else {
        const totalInts = ints.length;
        const hasOlderInts = totalInts > 3;
        const visibleInts = (hasOlderInts && !showAllOlderInterferences) ? ints.slice(-3) : ints;

        const intSig = `${showAllOlderInterferences ? 'all' : 'recent'}_${visibleInts.map(x => x.id).join('|')}`;
        if (iBox.dataset.sig !== intSig) {
          iBox.dataset.sig = intSig;
          iBox.innerHTML = '';

          // Render toggle button if more than 3 interferences exist
          if (hasOlderInts) {
            const olderBar = document.createElement('div');
            olderBar.className = 'crt-older-bar';

            const olderBtn = document.createElement('button');
            olderBtn.type = 'button';
            olderBtn.id = 'toggleOlderIntsBtn';
            olderBtn.className = 'btn-ghost btn-sm crt-older-btn';
            olderBtn.style.color = '#ff4757';
            olderBtn.style.borderColor = 'rgba(255, 71, 87, 0.45)';
            olderBtn.style.background = 'rgba(28, 8, 12, 0.8)';
            olderBtn.textContent = showAllOlderInterferences
              ? '🔼 Collapse to Recent 3 Psychic Bleeds'
              : `⚡ See Older Interferences (${totalInts - 3} older)`;
            olderBtn.onclick = toggleOlderInterferences;

            olderBar.appendChild(olderBtn);
            iBox.appendChild(olderBar);
          }

          visibleInts.forEach(ix => {
            const card = document.createElement('div');
            card.className = 'crt-intercept-card';
            const tStr = ix.created_at ? new Date(ix.created_at).toLocaleTimeString() : 'WARP-ECHO';
            card.innerHTML = `
              <div style="display:flex; justify-content:space-between; font-size:0.72rem; color:#ff4757; border-bottom:1px dashed rgba(255,71,87,0.3); padding-bottom:5px; margin-bottom:8px;">
                <strong>⚡ ${escapeHtml(ix.origin_hint || 'ASTROPATHIC BLEED')}</strong>
                <span>${escapeHtml(tStr)}</span>
              </div>
              <div class="crt-int-body"></div>
            `;
            const bodyEl = card.querySelector('.crt-int-body');
            const iToken = `int_${ix.id}`;
            if (!seenTokens.has(iToken)) {
              markTokenSeen(iToken);
              streamTextIntoElement(bodyEl, ix.redacted_text || '', true, 2000);
            } else {
              bodyEl.innerHTML = formatRedactedHtml(ix.redacted_text || '');
            }
            iBox.appendChild(card);
          });
        }
      }
    } catch (e) {}
  }

  async function transmitQuestion() {
    const input = document.getElementById('questionInput');
    const text = (input ? input.value : '').trim();
    if (!text || !activePassphrase) return;

    if (window.VoxAudio && typeof window.VoxAudio.playDossierStamp === 'function') {
      window.VoxAudio.playDossierStamp();
    }

    input.value = '';
    const senderName = selectedChannel === 'alpha'
      ? 'The Exile // Sanctuary of Ash'
      : 'Lord Commander Junebug';

    await rpcCall('send_vox_message', {
      p_channel: selectedChannel,
      p_passphrase: activePassphrase,
      p_sender: senderName,
      p_question: text
    });

    await refreshTerminal(true);
  }

  function switchSubWindow(which) {
    const isDirect = which === 'direct';
    document.getElementById('subWinDirect').classList.toggle('hidden', !isDirect);
    document.getElementById('subWinInterferences').classList.toggle('hidden', isDirect);
    document.getElementById('winBtn1').classList.toggle('active', isDirect);
    document.getElementById('winBtn2').classList.toggle('active', !isDirect);
  }

  function lockTerminal() {
    activePassphrase = null;
    showAllOlderMessages = false;
    showAllOlderInterferences = false;
    clearStreamTimers();
    if (pollTimer) clearInterval(pollTimer);
    try { sessionStorage.removeItem(SESSION_AUTH_KEY); } catch (e) {}
    document.getElementById('terminalScreen').classList.add('hidden');
    document.getElementById('authScreen').classList.remove('hidden');
    selectConduit(selectedChannel);
  }

  async function initVoxTerminalPage() {
    const pending = checkPendingDossierBuffer();

    // Auto-restore unlocked session within same browser tab if available
    try {
      const savedSession = sessionStorage.getItem(SESSION_AUTH_KEY);
      if (savedSession) {
        const parsed = JSON.parse(savedSession);
        const targetChan = (pending && pending.channel) ? pending.channel : parsed.channel;
        if (parsed.pass && targetChan === parsed.channel) {
          selectedChannel = parsed.channel;
          document.getElementById('passInput').value = parsed.pass;
          await handleSealAction();
          return;
        }
      }
    } catch (e) {}

    await selectConduit(pending && pending.channel ? pending.channel : 'alpha');
  }

  window.addEventListener('DOMContentLoaded', initVoxTerminalPage);
  window.addEventListener('vox:page-swapped', () => {
    if (document.getElementById('authScreen') && document.getElementById('directMessagesBox')) {
      initVoxTerminalPage();
    }
  });
</script>
</body>
</html>
````
