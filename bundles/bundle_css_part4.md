# 📦 Fires of Armageddon // Bundle: Tactical Stylesheet (Part 4: Utilities & SVG Favicon)

Tactical utility classes, responsive media queries, and vector skull insignia (`css/style.css` lines 2151 to end, `assets/favicon.svg`).

## 📑 Table of Contents
- [css/style.css (Part 4: Utilities & Media Queries, Lines 2151-2800)](#file-cssstylecsspart4utilitiesmediaquerieslines21512800)
- [assets/favicon.svg](#file-assetsfaviconsvg)

---

## File: `css/style.css (Part 4: Utilities & Media Queries, Lines 2151-2800)` <a id="file-cssstylecsspart4utilitiesmediaquerieslines21512800"></a>

````css
.auspex-map-frame:fullscreen .auspex-map-viewport,
.auspex-map-frame:-webkit-full-screen .auspex-map-viewport,
.auspex-map-frame.pseudo-fullscreen .auspex-map-viewport,
.auspex-map-frame.hololith-fullscreen .auspex-map-viewport {
  flex: 1;
  display: flex;
  align-items: safe center;
  justify-content: safe center;
  overflow: auto;
  border: 1px solid rgba(16, 185, 129, 0.25);
  background: #06100d;
}

.auspex-map-frame:fullscreen .auspex-map-viewport.zoom-1x svg,
.auspex-map-frame:-webkit-full-screen .auspex-map-viewport.zoom-1x svg,
.auspex-map-frame.pseudo-fullscreen .auspex-map-viewport.zoom-1x svg,
.auspex-map-frame.hololith-fullscreen .auspex-map-viewport.zoom-1x svg {
  width: auto;
  height: 100%;
  max-height: calc(100dvh - 155px);
  max-width: 100%;
  min-width: 680px;
}

.auspex-map-frame.hololith-fullscreen .auspex-fullscreen-hud {
  position: relative !important;
  bottom: auto !important;
  left: auto !important;
  right: auto !important;
  width: 100% !important;
  margin-top: 8px !important;
  z-index: 100 !important;
}

@media (max-width: 640px) {
  .heg-row { grid-template-columns: 1fr; gap: 4px; }
  .heg-count { text-align: left; }
  .vox-caster-bar {
    width: 100%;
    justify-content: center;
    border-left: none;
    border-top: 1px dashed var(--border);
    padding-top: 6px;
    margin-left: 0;
  }
}

/* ========================================================================= */
/* MODE 7: ASTROPATHIC CRT MONITOR & PHOSPHOR TERMINAL STYLING              */
/* ========================================================================= */
.crt-monitor-frame {
  position: relative;
  background: #030704;
  border: 2px solid #1e3a29;
  border-radius: 14px;
  padding: 18px;
  min-height: 480px;
  height: min(580px, 68vh);
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
  background: rgba(3, 24, 14, 0.9);
  border: 1px solid rgba(0, 255, 136, 0.38);
  border-left: 4px solid #00ff88;
  border-radius: 8px;
  padding: 13px 16px;
  color: #66ffb8;
  text-shadow: 0 0 8px rgba(0, 255, 136, 0.48);
  font-size: 0.88rem;
  line-height: 1.62;
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
  background: rgba(20, 14, 4, 0.65);
  border: 1px dashed rgba(255, 176, 0, 0.3);
  border-radius: 6px;
  padding: 10px 14px;
  color: #ffb000;
  font-size: 0.82rem;
  font-style: italic;
  opacity: 0.95;
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

/* =========================================================================
   CARD SYNCED STATIC SHAKE & CRT PHOSPHOR TREMOR
   ========================================================================= */
@keyframes staticShake {
  0% {
    transform: translate(0, 0);
    filter: brightness(1);
  }
  15% {
    transform: translate(-2px, 1px) skewX(-0.6deg);
    filter: contrast(1.15) brightness(1.22) drop-shadow(0 0 6px rgba(16, 185, 129, 0.65));
  }
  30% {
    transform: translate(2px, -1px) skewX(0.6deg);
    filter: contrast(1.2) brightness(1.25) drop-shadow(0 0 7px rgba(245, 158, 11, 0.5));
  }
  45% {
    transform: translate(-1px, 2px);
    filter: contrast(1.1) brightness(1.18) drop-shadow(0 0 6px rgba(16, 185, 129, 0.6));
  }
  60% {
    transform: translate(1px, -1px);
    filter: contrast(1.2) brightness(1.24) drop-shadow(0 0 8px rgba(16, 185, 129, 0.7));
  }
  75% {
    transform: translate(-1px, -1px);
    filter: contrast(1.08) brightness(1.1);
  }
  90% {
    transform: translate(1px, 1px);
    filter: contrast(1.04) brightness(1.04);
  }
  100% {
    transform: translate(0, 0);
    filter: brightness(1);
  }
}

.card-synced-shake {
  animation: staticShake 0.48s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
  border-color: rgba(16, 185, 129, 0.85) !important;
  box-shadow: 0 0 12px rgba(16, 185, 129, 0.35), inset 0 0 8px rgba(16, 185, 129, 0.15) !important;
  will-change: transform, filter;
}

/* ==========================================================================
   GLOBAL FACTION COLOR MODES (UNLOCKED BROADCAST / CONDUIT THEME SYNC)
   - body.theme-necron    : Lord Commander Junebug (Awakening Tomb World)
   - body.theme-militarum : The Exile // Sanctuary of Ash (Astra Militarum)
   ========================================================================== */

body.theme-necron {
  --bg: #020806;
  --surface: #061410;
  --surface-alt: #040d0a;
  --surface-hover: #0a221b;
  --border: #114232;
  --border-bright: #10b981;
  --text: #d1fae5;
  --muted: #6ee7b7;
  --gold: #10b981;
  --gold-bright: #34d399;
  --gold-dim: rgba(16, 185, 129, 0.14);
  --red: #059669;
  --red-bright: #10b981;
  --red-dim: rgba(16, 185, 129, 0.18);
  --green: #34d399;
  --blue: #2dd4bf;
  --side-glow-line: rgba(16, 185, 129, 0.42);
  --side-glow-bloom: rgba(16, 185, 129, 0.14);
  --side-glow-deep: rgba(45, 212, 191, 0.08);
  --corner-glow-core: rgba(52, 211, 153, 0.16);
  --corner-glow-bloom: rgba(16, 185, 129, 0.09);
  --corner-glow-deep: rgba(6, 78, 59, 0.06);
  --clip-card: polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 16px 100%, 0 calc(100% - 16px));
  background-color: #020806;
  background-image:
    radial-gradient(ellipse at 50% 0%, rgba(16, 185, 129, 0.16) 0%, transparent 65%),
    radial-gradient(circle at 85% 20%, rgba(45, 212, 191, 0.08) 0%, transparent 45%),
    radial-gradient(circle at 15% 80%, rgba(16, 185, 129, 0.08) 0%, transparent 50%),
    linear-gradient(rgba(16, 185, 129, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(16, 185, 129, 0.035) 1px, transparent 1px);
  background-size: 100% 100%, 100% 100%, 100% 100%, 36px 36px, 36px 36px;
}

body.theme-necron .suite-nav {
  background: rgba(2, 10, 8, 0.96);
  border-bottom: 1px solid rgba(16, 185, 129, 0.45);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.9), 0 1px 12px rgba(16, 185, 129, 0.18);
}

body.theme-necron .suite-brand {
  color: #34d399;
  text-shadow: 0 0 10px rgba(16, 185, 129, 0.4);
}

body.theme-necron .suite-link.active {
  color: #ecfdf5;
  background: rgba(16, 185, 129, 0.16);
  border-color: #10b981;
  box-shadow: 0 0 12px rgba(16, 185, 129, 0.25), inset 0 0 8px rgba(16, 185, 129, 0.15);
}

body.theme-necron .hero-card,
body.theme-necron .card,
body.theme-necron .hud-bar,
body.theme-necron .round-banner {
  background:
    radial-gradient(ellipse at 50% 0%, rgba(16, 185, 129, 0.11) 0%, transparent 70%),
    linear-gradient(165deg, rgba(6, 20, 15, 0.96) 0%, rgba(3, 10, 8, 0.98) 55%, rgba(5, 16, 12, 0.96) 100%);
  border-color: rgba(16, 185, 129, 0.42);
  box-shadow:
    0 12px 34px rgba(0, 0, 0, 0.88),
    0 0 22px rgba(16, 185, 129, 0.12),
    inset 0 0 24px rgba(16, 185, 129, 0.05);
}

body.theme-necron .hero-title {
  background: linear-gradient(90deg, #ecfdf5 0%, #6ee7b7 45%, #10b981 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 22px rgba(16, 185, 129, 0.28);
}

body.theme-necron .status-pill {
  background: rgba(6, 38, 28, 0.85);
  border-color: rgba(16, 185, 129, 0.55);
  color: #6ee7b7;
  box-shadow: 0 0 12px rgba(16, 185, 129, 0.2);
}

body.theme-necron .status-pill .pulse-dot {
  background: #10b981;
  box-shadow: 0 0 8px #10b981;
}

body.theme-necron .nav-pills button.active,
body.theme-necron .commander-switcher button.active {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.28) 0%, rgba(4, 24, 18, 0.96) 100%);
  color: #6ee7b7;
  border-color: #10b981;
  box-shadow: 0 0 16px rgba(16, 185, 129, 0.28), inset 0 0 12px rgba(16, 185, 129, 0.16);
}

body.theme-necron .launch-btn,
body.theme-necron .btn-red {
  background: linear-gradient(180deg, rgba(6, 95, 70, 0.95) 0%, rgba(4, 47, 46, 0.98) 100%);
  border-color: #10b981;
  color: #ecfdf5;
  box-shadow: 0 0 18px rgba(16, 185, 129, 0.28), inset 0 1px 0 rgba(167, 243, 208, 0.3);
}

body.theme-necron .launch-btn:hover,
body.theme-necron .btn-red:hover {
  background: linear-gradient(180deg, rgba(16, 185, 129, 0.92) 0%, rgba(6, 95, 70, 0.98) 100%);
  border-color: #6ee7b7;
  color: #022c22;
  box-shadow: 0 0 26px rgba(16, 185, 129, 0.55);
}

body.theme-necron code {
  background: rgba(6, 48, 36, 0.68);
  border: 1px solid rgba(16, 185, 129, 0.42);
  color: #6ee7b7;
}

/* Necron Personal Terminal Overrides (pages/vox.html & global CRT widgets) */
body.theme-necron .crt-monitor-frame {
  background:
    radial-gradient(ellipse at 50% 0%, rgba(16, 185, 129, 0.14) 0%, rgba(2, 8, 6, 0.98) 72%),
    #020806;
  border-color: #10b981;
  box-shadow:
    inset 0 0 48px rgba(0, 0, 0, 0.96),
    inset 0 0 22px rgba(16, 185, 129, 0.14),
    0 0 28px rgba(16, 185, 129, 0.2);
}

body.theme-necron .crt-msg-card {
  background: linear-gradient(135deg, rgba(4, 24, 26, 0.92) 0%, rgba(2, 12, 14, 0.96) 100%);
  border: 1px solid rgba(45, 212, 191, 0.42);
  border-left: 3px solid #2dd4bf;
  color: #ccfbf1;
  text-shadow: 0 0 6px rgba(45, 212, 191, 0.35);
}

body.theme-necron .crt-msg-header {
  color: #5eead4;
  border-bottom-color: rgba(45, 212, 191, 0.32);
}

body.theme-necron .crt-reply-card {
  background: linear-gradient(135deg, rgba(4, 26, 18, 0.94) 0%, rgba(2, 12, 8, 0.98) 100%);
  border: 1px solid rgba(16, 185, 129, 0.52);
  border-left: 3px solid #10b981;
  color: #a7f3d0;
  text-shadow: 0 0 8px rgba(16, 185, 129, 0.42);
}

body.theme-necron .crt-reply-header {
  color: #34d399;
  border-bottom-color: rgba(16, 185, 129, 0.35);
}

body.theme-necron .crt-pending-line {
  background: rgba(4, 24, 18, 0.78);
  border-color: rgba(45, 212, 191, 0.45);
  color: #5eead4;
}

body.theme-necron .crt-input-textarea {
  background: #020907;
  color: #6ee7b7;
  text-shadow: 0 0 6px rgba(16, 185, 129, 0.4);
  border-color: rgba(16, 185, 129, 0.48);
}

body.theme-necron .crt-input-textarea:focus {
  border-color: #34d399;
  box-shadow: 0 0 16px rgba(16, 185, 129, 0.32);
}

body.theme-necron .queued-dossier-banner {
  background: rgba(6, 48, 36, 0.35);
  border-color: #10b981;
  color: #6ee7b7;
  text-shadow: 0 0 6px rgba(16, 185, 129, 0.35);
}

/* Astra Militarum // Sanctuary of Ash Global Color Mode */
body.theme-militarum {
  --bg: #0c0b09;
  --surface: #171512;
  --surface-alt: #12100d;
  --surface-hover: #24201a;
  --border: #3a3224;
  --border-bright: #d4a349;
  --text: #ece6d9;
  --muted: #a69b86;
  --gold: #d4a349;
  --gold-bright: #f5c96a;
  --gold-dim: rgba(212, 163, 73, 0.14);
  --red: #cc2936;
  --red-bright: #ef3e4a;
  --red-dim: rgba(204, 41, 54, 0.18);
  --side-glow-line: rgba(212, 163, 73, 0.38);
  --side-glow-bloom: rgba(212, 163, 73, 0.12);
  --side-glow-deep: rgba(204, 41, 54, 0.08);
  --corner-glow-core: rgba(212, 163, 73, 0.15);
  --corner-glow-bloom: rgba(204, 41, 54, 0.08);
  --corner-glow-deep: rgba(212, 163, 73, 0.05);
}

body.theme-militarum .suite-nav {
  background: rgba(14, 12, 10, 0.96);
  border-bottom: 1px solid rgba(212, 163, 73, 0.42);
}

/* Faction-Themed Auto-Vox Dossier Previews (Alpha = Militarum Amber/Gold | Beta = Necron Gauss Emerald) */
.vox-preview-alpha {
  background: #0d0a04 !important;
  border: 1.5px dashed rgba(245, 158, 11, 0.55) !important;
  color: #fbbf24 !important;
  text-shadow: 0 0 6px rgba(245, 158, 11, 0.3) !important;
}

.vox-preview-beta {
````

---

## File: `assets/favicon.svg` <a id="file-assetsfaviconsvg"></a>

````xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.6"/>
    </filter>
  </defs>

  <!-- Base Plate (Dark iron-clad shield) -->
  <rect x="16" y="16" width="480" height="480" rx="100" ry="100" fill="#18151c" stroke="#ff4757" stroke-width="16" />

  <!-- Tactical Stitch / Perimeter Border (Bronze dashed line) -->
  <rect x="36" y="36" width="440" height="440" rx="84" ry="84" fill="none" stroke="#a67c42" stroke-width="5" stroke-dasharray="16, 12" />

  <!-- Vox Activation Top Beacon -->
  <circle cx="256" cy="68" r="18" fill="#ff4757" />

  <!-- Lateral Sonic Broadcast Waves (Left) -->
  <!-- Outer deep red pulse -->
  <path d="M 80 155 C 60 215, 60 295, 80 355" fill="none" stroke="#7a242f" stroke-width="10" stroke-linecap="round" />
  <!-- Inner hot vox surge -->
  <path d="M 115 180 C 100 225, 100 285, 115 330" fill="none" stroke="#ff4757" stroke-width="16" stroke-linecap="round" />

  <!-- Lateral Sonic Broadcast Waves (Right) -->
  <!-- Inner hot vox surge -->
  <path d="M 397 180 C 412 225, 412 285, 397 330" fill="none" stroke="#ff4757" stroke-width="16" stroke-linecap="round" />
  <!-- Outer deep red pulse -->
  <path d="M 432 155 C 452 215, 452 295, 432 355" fill="none" stroke="#7a242f" stroke-width="10" stroke-linecap="round" />

  <!-- Central Armageddon Sanctified Skull -->
  <g id="skull" filter="url(#shadow)">
    <!-- Cranium and Brow -->
    <path d="M 172 250 
             C 160 200, 190 180, 256 180 
             C 322 180, 352 200, 340 250 
             C 334 275, 320 292, 305 315 
             L 305 375 
             C 305 382, 300 388, 292 388 
             L 220 388 
             C 212 388, 207 382, 207 375 
             L 207 315 
             C 192 292, 178 275, 172 250 Z" 
          fill="#f0b042" />

    <!-- Ocular Optics (Red sensor sockets) -->
    <circle cx="218" cy="254" r="18" fill="#ff4757" />
    <circle cx="294" cy="254" r="18" fill="#ff4757" />

    <!-- Nasal Cavity (Inverted triangle) -->
    <polygon points="256,274 246,306 266,306" fill="#18151c" />

    <!-- Mandible / Vox Grille (Mouth cutout) -->
    <rect x="214" y="324" width="84" height="46" rx="8" ry="8" fill="#18151c" />
  </g>

  <!-- Sub-Vox Directional Chevron -->
  <path d="M 194 425 L 256 458 L 318 425" fill="none" stroke="#ff4757" stroke-width="15" stroke-linecap="round" stroke-linejoin="round" />
</svg>
````
