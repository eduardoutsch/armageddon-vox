# 📦 Fires of Armageddon // Bundle: Mode 7 - Astropathic CRT Vox-Terminal (Page)

Complete markup and CRT phosphor styling for Astropathic Vox-Terminal and Conduit Pass-Seal Security (`pages/vox.html`, `css/vox.css`).

## 📑 Table of Contents
- [pages/vox.html](#file-pagesvoxhtml)
- [css/vox.css](#file-cssvoxcss)

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
  <link rel="stylesheet" href="../css/vox.css">
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
      <div style="display:flex; justify-content:center; align-items:center; gap:10px; flex-wrap:wrap; margin-bottom:12px;">
        <div class="status-pill" id="sealStatusBadge" style="margin:0;">
          <span class="pulse-dot"></span> Checking Astropathic Seal...
        </div>
        <div class="status-pill server-status-pill online" id="serverStatusBadge" style="margin:0;">
          <span class="server-dot"></span> 🟢 ASTROPATHIC SERVER: ONLINE
        </div>
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
    <div class="choice-grid conduit-selector" style="margin-bottom:16px; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr));">
      <div class="choice-card conduit-card selected active" id="cardAlpha" onclick="selectConduit('alpha')">
        <span class="conduit-tag" style="display:block; font-size:0.7rem; font-weight:800; color:var(--gold); text-transform:uppercase; margin-bottom:2px;">CONDUIT ALPHA // SANCTUARY OF ASH</span>
        <span class="choice-icon">🦅</span>
        <div class="choice-title conduit-title" style="font-weight:800; font-size:1.05rem;">The Exile</div>
        <div class="choice-sub conduit-sub" style="font-size:0.78rem; color:var(--muted);">The Sanctuary of Ash // 044th Krieg</div>
      </div>

      <div class="choice-card conduit-card" id="cardBeta" onclick="selectConduit('beta')">
        <span class="conduit-tag" style="display:block; font-size:0.7rem; font-weight:800; color:var(--green); text-transform:uppercase; margin-bottom:2px;">CONDUIT BETA // ORBITAL TOMB-SHIP MATRIX</span>
        <span class="choice-icon">💀</span>
        <div class="choice-title conduit-title" style="font-weight:800; font-size:1.05rem;">Lord Commander Junebug</div>
        <div class="choice-sub conduit-sub" style="font-size:0.78rem; color:var(--muted);">Necron Awakening Phalanx • Sector Node 0</div>
      </div>

      <div class="choice-card conduit-card" id="cardGamma" onclick="selectConduit('gamma')">
        <span class="conduit-tag" style="display:block; font-size:0.7rem; font-weight:800; color:var(--gold); text-transform:uppercase; margin-bottom:2px;">CONDUIT GAMMA // SUB-CLOUD BLACK-LEDGER</span>
        <span class="choice-icon">⛏️</span>
        <div class="choice-title conduit-title" style="font-weight:800; font-size:1.05rem;">Kâhl Hârkyn</div>
        <div class="choice-sub conduit-sub" style="font-size:0.78rem; color:var(--muted);">The Ledger of Embers • Fane-Node Vôl-09 (Radio-Silent Solo)</div>
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
    <div id="voxTerminalTitle" class="round-banner" style="padding:10px 14px; margin-bottom:12px; font-family:monospace; font-size:0.85rem; font-weight:800; letter-spacing:1px; color:#00ff88; border-color:rgba(0,255,136,0.3); text-align:center;">
      +++ ASTROPATHIC CONDUIT: SEGMENTUM SOLAR HIGH COMMAND [DECK 44] +++
    </div>
    <div class="hud-bar" style="margin-bottom:14px;">
      <div style="display:flex; gap:18px; align-items:center; flex-wrap:wrap;">
        <div class="hud-stat">
          <span class="hud-label">LOCKED CONDUIT</span>
          <span class="hud-num" id="activeConduitLabel" style="color:#00ff88; font-size:0.95rem; text-shadow:0 0 6px rgba(0,255,136,0.4);">TERMINAL ALPHA</span>
        </div>
        <div class="hud-stat">
          <span class="hud-label">ASTROPATHIC SERVER</span>
          <span class="hud-num" id="terminalServerStatusLabel" style="color:#00ff88; font-size:0.9rem; text-shadow:0 0 6px rgba(0,255,136,0.35);">🟢 ONLINE (ACTIVE)</span>
        </div>
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
<script src="../js/vox.js"></script>
</body>
</html>
````

---

## File: `css/vox.css` <a id="file-cssvoxcss"></a>

````css
/**
 * Fires of Armageddon // Astropathic CRT Vox-Terminal Stylesheet
 * Custom styles for recessed Cathode-Ray (CRT) green/amber phosphor monitors,
 * scanlines, blinking block cursors, psychic interferences, and faction-locked
 * Necron Tomb-Ship / Astra Militarum Sanctuary CRT aesthetics.
 */

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

.crt-purge-btn {
  background: rgba(255, 71, 87, 0.1);
  border: 1px solid rgba(255, 71, 87, 0.4);
  color: #ff6b81;
  font-family: 'Courier New', monospace;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: 4px;
  cursor: pointer;
  margin-left: 10px;
  letter-spacing: 0.5px;
  transition: all 0.15s ease;
}
.crt-purge-btn:hover {
  background: rgba(255, 71, 87, 0.28);
  border-color: #ff4757;
  color: #fff;
  box-shadow: 0 0 8px rgba(255, 71, 87, 0.45);
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

/* Psychic Interferences (Crimson / Red Glitch Phosphor - Targeted Player Bleeds) */
.crt-intercept-card,
.crt-intercept-card.target-intercept {
  background: rgba(24, 6, 10, 0.88) !important;
  border: 1px dashed rgba(255, 71, 87, 0.55) !important;
  border-left: 4px solid #ff4757 !important;
  border-radius: 8px;
  padding: 13px 15px;
  color: #fda4af !important;
  text-shadow: 0 0 6px rgba(255, 71, 87, 0.45) !important;
  font-size: 0.88rem;
  line-height: 1.58;
  white-space: pre-wrap;
}

.censor-bar,
.crt-intercept-card.target-intercept .censor-bar {
  background: #ff4757 !important;
  color: #160407 !important;
  padding: 1px 6px;
  border-radius: 3px;
  font-weight: 900;
  letter-spacing: 0.6px;
  text-shadow: none;
  box-shadow: 0 0 8px rgba(255, 71, 87, 0.65) !important;
}

/* Rogue Sector Dual-Broadcast Interferences (Warp Amethyst / Purple CRT Phosphor - Sector-Wide for All Players) */
.crt-intercept-card.rogue-intercept,
.crt-intercept-card.sector-broadcast {
  background: rgba(18, 7, 30, 0.88) !important;
  border: 1px dashed rgba(168, 85, 247, 0.6) !important;
  border-left: 4px solid #a855f7 !important;
  color: #e9d5ff !important;
  text-shadow: 0 0 7px rgba(168, 85, 247, 0.5) !important;
}

.crt-intercept-card.rogue-intercept .censor-bar,
.crt-intercept-card.sector-broadcast .censor-bar {
  background: #a855f7 !important;
  color: #0f041d !important;
  box-shadow: 0 0 8px rgba(168, 85, 247, 0.7) !important;
}

.crt-intercept-card.rogue-intercept .crt-purge-btn,
.crt-intercept-card.sector-broadcast .crt-purge-btn {
  background: rgba(168, 85, 247, 0.12);
  border-color: rgba(168, 85, 247, 0.45);
  color: #d8b4fe;
}

.crt-intercept-card.rogue-intercept .crt-purge-btn:hover,
.crt-intercept-card.sector-broadcast .crt-purge-btn:hover {
  background: rgba(168, 85, 247, 0.3);
  border-color: #a855f7;
  color: #fff;
  box-shadow: 0 0 8px rgba(168, 85, 247, 0.5);
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

.server-status-pill {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-family: monospace;
  font-weight: 800;
  letter-spacing: 0.8px;
  transition: all 0.25s ease;
}
.server-status-pill.online {
  background: rgba(0, 255, 136, 0.12);
  border: 1px solid rgba(0, 255, 136, 0.45);
  color: #00ff88;
  box-shadow: 0 0 12px rgba(0, 255, 136, 0.18);
}
.server-status-pill.offline {
  background: rgba(255, 71, 87, 0.12);
  border: 1px solid rgba(255, 71, 87, 0.45);
  color: #ff4757;
  box-shadow: 0 0 12px rgba(255, 71, 87, 0.15);
}
.server-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  background: currentColor;
  box-shadow: 0 0 8px currentColor;
}

/* ========================================================================= */
/* NECRON TOMB-SHIP MASTER MATRIX PERSONAL TERMINAL (TERMINAL BETA)          */
/* ========================================================================= */
body.theme-necron #cardBeta.selected {
  background: linear-gradient(135deg, rgba(6, 48, 36, 0.72) 0%, rgba(3, 18, 14, 0.96) 100%);
  border-color: #10b981;
  box-shadow: 0 0 22px rgba(16, 185, 129, 0.35), inset 0 0 14px rgba(16, 185, 129, 0.16);
}

body.theme-necron #cardBeta.selected .choice-title {
  color: #6ee7b7;
  text-shadow: 0 0 10px rgba(16, 185, 129, 0.45);
}

body.theme-necron .crt-monitor-frame {
  background:
    radial-gradient(ellipse at 50% 0%, rgba(16, 185, 129, 0.15) 0%, rgba(2, 8, 6, 0.98) 72%),
    linear-gradient(rgba(16, 185, 129, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(16, 185, 129, 0.03) 1px, transparent 1px),
    #020806;
  background-size: 100% 100%, 28px 28px, 28px 28px, 100% 100%;
  border: 2px solid #10b981;
  clip-path: polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 18px 100%, 0 calc(100% - 18px));
  box-shadow:
    inset 0 0 48px rgba(0, 0, 0, 0.96),
    inset 0 0 24px rgba(16, 185, 129, 0.15),
    0 0 28px rgba(16, 185, 129, 0.22);
}

body.theme-necron .crt-monitor-frame::after {
  background: linear-gradient(
    rgba(16, 185, 129, 0) 50%,
    rgba(0, 12, 8, 0.38) 50%
  );
  background-size: 100% 4px;
}

body.theme-necron .crt-msg-card {
  background: linear-gradient(135deg, rgba(4, 24, 26, 0.92) 0%, rgba(2, 12, 14, 0.96) 100%);
  border: 1px solid rgba(45, 212, 191, 0.45);
  border-left: 3px solid #2dd4bf;
  color: #ccfbf1;
  text-shadow: 0 0 6px rgba(45, 212, 191, 0.38);
  clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%);
}

body.theme-necron .crt-msg-header {
  color: #5eead4;
  border-bottom: 1px dashed rgba(45, 212, 191, 0.35);
}

body.theme-necron .crt-reply-card {
  background: linear-gradient(135deg, rgba(4, 26, 18, 0.95) 0%, rgba(2, 12, 8, 0.98) 100%);
  border: 1px solid rgba(16, 185, 129, 0.55);
  border-left: 3px solid #10b981;
  color: #a7f3d0;
  text-shadow: 0 0 8px rgba(16, 185, 129, 0.45);
  clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px));
}

body.theme-necron .crt-reply-header {
  color: #34d399;
  border-bottom: 1px dashed rgba(16, 185, 129, 0.38);
}

body.theme-necron .crt-pending-line {
  background: rgba(4, 24, 18, 0.8);
  border: 1px dashed rgba(45, 212, 191, 0.48);
  color: #5eead4;
}

body.theme-necron .crt-input-textarea {
  background: #020907;
  color: #6ee7b7;
  text-shadow: 0 0 6px rgba(16, 185, 129, 0.4);
  border: 1.5px solid rgba(16, 185, 129, 0.48);
}

body.theme-necron .crt-input-textarea:focus {
  border-color: #34d399;
  box-shadow: 0 0 16px rgba(16, 185, 129, 0.32);
}

body.theme-necron #subWinDirect button.btn-red {
  background: linear-gradient(180deg, rgba(6, 95, 70, 0.95) 0%, rgba(4, 47, 46, 0.98) 100%);
  border-color: #10b981;
  color: #ecfdf5;
  box-shadow: 0 0 18px rgba(16, 185, 129, 0.32);
}

/* ========================================================================= */
/* ASTRA MILITARUM // SANCTUARY OF ASH PERSONAL TERMINAL (TERMINAL ALPHA)    */
/* ========================================================================= */
body.theme-militarum #cardAlpha.selected {
  border-color: var(--gold);
  box-shadow: 0 0 18px rgba(212, 163, 73, 0.25);
}

/* ===================================================================== */
/* VOTANN BLACK-LEDGER CRT TERMINAL STYLING (HEARTH AMBER / BASALT)      */
/* ===================================================================== */
body.theme-votann #cardGamma.selected,
body.theme-votann #cardGamma.active {
  background: linear-gradient(135deg, rgba(66, 32, 6, 0.76) 0%, rgba(26, 14, 3, 0.96) 100%);
  border-color: #f5b041;
  box-shadow: 0 0 22px rgba(245, 176, 65, 0.35), inset 0 0 14px rgba(245, 176, 65, 0.16);
}

body.theme-votann #cardGamma.selected .choice-title,
body.theme-votann #cardGamma.active .choice-title,
body.theme-votann #cardGamma .choice-title,
body.theme-votann #cardGamma .conduit-title {
  color: #fbbf24;
  text-shadow: 0 0 10px rgba(245, 176, 65, 0.45);
}

body.theme-votann #voxTerminalTitle {
  color: #f5b041;
  border-color: rgba(245, 176, 65, 0.35);
  background: rgba(30, 18, 5, 0.65);
  text-shadow: 0 0 10px rgba(245, 176, 65, 0.45);
}

body.theme-votann #activeConduitLabel {
  color: #fbbf24 !important;
  text-shadow: 0 0 8px rgba(245, 176, 65, 0.4) !important;
}

body.theme-votann #terminalServerStatusLabel {
  color: #f5b041 !important;
  text-shadow: 0 0 8px rgba(245, 176, 65, 0.35) !important;
}

body.theme-votann .nav-pills button.active {
  background: linear-gradient(135deg, rgba(245, 176, 65, 0.28) 0%, rgba(28, 16, 4, 0.95) 100%);
  color: #fde68a;
  border-color: #f5b041;
  box-shadow: inset 0 0 12px rgba(245, 176, 65, 0.25), 0 0 10px rgba(245, 176, 65, 0.2);
}

body.theme-votann .crt-monitor-frame {
  background:
    radial-gradient(ellipse at 50% 0%, rgba(245, 176, 65, 0.15) 0%, rgba(12, 8, 3, 0.98) 72%),
    linear-gradient(rgba(245, 176, 65, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(245, 176, 65, 0.03) 1px, transparent 1px),
    #090602;
  background-size: 100% 100%, 28px 28px, 28px 28px, 100% 100%;
  border: 2px solid #f5b041;
  clip-path: polygon(0 0, calc(100% - 18px) 0, 100% 18px, 100% 100%, 18px 100%, 0 calc(100% - 18px));
  box-shadow:
    inset 0 0 48px rgba(0, 0, 0, 0.96),
    inset 0 0 24px rgba(245, 176, 65, 0.15),
    0 0 28px rgba(245, 176, 65, 0.22);
}

body.theme-votann .crt-monitor-frame::after {
  background: linear-gradient(
    rgba(245, 176, 65, 0) 50%,
    rgba(26, 14, 3, 0.42) 50%
  );
  background-size: 100% 4px;
}

body.theme-votann .crt-msg-card {
  background: linear-gradient(135deg, rgba(38, 22, 6, 0.92) 0%, rgba(18, 10, 2, 0.96) 100%);
  border: 1px solid rgba(245, 176, 65, 0.45);
  border-left: 3px solid #f5b041;
  color: #fef3c7;
  text-shadow: 0 0 6px rgba(245, 176, 65, 0.38);
  clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%);
}

body.theme-votann .crt-msg-header {
  color: #fbbf24;
  border-bottom: 1px dashed rgba(245, 176, 65, 0.35);
}

body.theme-votann .crt-reply-card {
  background: linear-gradient(135deg, rgba(48, 26, 6, 0.95) 0%, rgba(20, 10, 2, 0.98) 100%);
  border: 1px solid rgba(251, 191, 36, 0.55);
  border-left: 3px solid #fbbf24;
  color: #fef9c3;
  text-shadow: 0 0 8px rgba(245, 176, 65, 0.45);
  clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px));
}

body.theme-votann .crt-reply-header {
  color: #fde68a;
  border-bottom: 1px dashed rgba(251, 191, 36, 0.38);
}

body.theme-votann .crt-pending-line {
  background: rgba(36, 20, 5, 0.82);
  border: 1px dashed rgba(245, 176, 65, 0.48);
  color: #fde68a;
}

body.theme-votann .crt-input-textarea {
  background: #090602;
  color: #fef3c7;
  text-shadow: 0 0 6px rgba(245, 176, 65, 0.35);
  border: 1.5px solid rgba(245, 176, 65, 0.48);
}

body.theme-votann .crt-input-textarea:focus {
  border-color: #fbbf24;
  box-shadow: 0 0 16px rgba(245, 176, 65, 0.32);
}

body.theme-votann #subWinDirect button.btn-red {
  background: linear-gradient(180deg, rgba(194, 65, 12, 0.95) 0%, rgba(124, 45, 18, 0.98) 100%);
  border-color: #f5b041;
  color: #fffbeb;
  box-shadow: 0 0 18px rgba(245, 176, 65, 0.32);
}

body.theme-votann .crt-older-btn {
  color: #fbbf24;
  border-color: rgba(245, 176, 65, 0.4);
  background: rgba(34, 18, 4, 0.75);
}

body.theme-votann .crt-older-btn:hover {
  background: rgba(245, 176, 65, 0.22);
  border-color: #f5b041;
  box-shadow: 0 0 10px rgba(245, 176, 65, 0.35);
}
````
