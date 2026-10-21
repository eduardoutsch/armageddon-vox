# 📦 Fires of Armageddon // Bundle: Sanctuary-Noctis Tactical Stylesheet & Assets

Unified Tactical Stylesheet ("Sanctuary-Noctis Hybrid"), typography tokens, chamfered iron cards, Auspex CRT screens, and SVG icons (`css/style.css`, `assets/favicon.svg`).

## 📑 Table of Contents
- [css/style.css](#file-cssstylecss)
- [assets/favicon.svg](#file-assetsfaviconsvg)

---

## File: `css/style.css` <a id="file-cssstylecss"></a>

````css
/* ==========================================================================
   FIRES OF ARMAGEDDON // THE SANCTUARY OF ASH — UNIFIED TACTICAL STYLESHEET
   Aesthetic: "Sanctuary-Noctis Hybrid" (Gothic Cast-Iron + Recessed CRT Auspex)
   ========================================================================== */

@import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:ital,wght@0,500;0,600;0,700;1,500&family=Cinzel:wght@700;800;900&family=Share+Tech+Mono&display=swap');

:root {
  /* Soot, Cast Gunmetal & Oiled Iron Surfaces */
  --bg: #0b0a09;
  --surface: #151311;
  --surface-alt: #1c1916;
  --surface-hover: #25201c;
  --crt-bg: #060a08;

  /* Tarnished Iron & Brass Trim */
  --border: #3a3228;
  --border-bright: #6e5a3e;

  /* Vellum Parchment & Ash Dust Typography */
  --text: #e6dfd3;
  --muted: #9c9180;

  /* In-Universe Pigments */
  --red: #cc2936;         /* Inquisitorial Wax Crimson / Dried Brig Blood */
  --red-bright: #e63946;
  --gold: #d4a349;        /* Tarnished Reliquary Brass / Candle Tallow */
  --gold-bright: #f0c265;
  --purple: #9b51e0;      /* Warp-Bleed Amethyst / Choir-Vox Static */
  --blue: #3898a6;        /* Oxidized Hololith Verdigris / Cathode Cyan */
  --green: #10b981;       /* CRT Auspex Phosphor / Necron Gauss Emerald */

  /* Font Stacks */
  --font-gothic: 'Cinzel', Georgia, serif;
  --font-ui: 'Chakra Petch', system-ui, -apple-system, sans-serif;
  --font-mono: 'Share Tech Mono', 'Courier New', monospace;

  /* 45-Degree Chamfered Plasteel Silhouettes */
  --clip-card: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px));
  --clip-btn: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px));
}

* {
  box-sizing: border-box;
}

body {
  font-family: var(--font-ui);
  background-color: var(--bg);
  background-image:
    repeating-linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.18) 0px,
      rgba(0, 0, 0, 0.18) 1px,
      transparent 1px,
      transparent 4px
    ),
    radial-gradient(circle at 50% 0%, rgba(204, 41, 54, 0.14) 0%, transparent 58%),
    radial-gradient(circle at 88% 92%, rgba(212, 163, 73, 0.09) 0%, transparent 48%);
  background-attachment: fixed;
  color: var(--text);
  margin: 0;
  padding: 0;
  line-height: 1.55;
  min-height: 100vh;
  letter-spacing: 0.2px;
}

/* ==========================================================================
   1. TOP NAVIGATION BAR (.suite-nav) & VOX-CASTER MUSIC MODULE
   ========================================================================== */
.suite-nav {
  background: linear-gradient(180deg, #171411 0%, #0d0b0a 100%);
  border-bottom: 2px solid var(--border);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.85);
  padding: 8px 14px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  position: relative;
  z-index: 100;
}

.suite-link {
  text-decoration: none;
  font-family: var(--font-ui);
  font-size: 0.76rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 6px 12px;
  color: var(--muted);
  background: rgba(21, 19, 17, 0.75);
  border: 1px solid rgba(58, 50, 40, 0.7);
  clip-path: var(--clip-btn);
  transition: all 0.15s ease;
}

.suite-link:hover {
  color: var(--text);
  background: var(--surface-hover);
  border-color: var(--border-bright);
}

.suite-link.active {
  color: var(--gold-bright);
  background: linear-gradient(135deg, rgba(212, 163, 73, 0.2) 0%, rgba(204, 41, 54, 0.12) 100%);
  border-color: var(--gold);
  box-shadow: inset 0 0 10px rgba(212, 163, 73, 0.2);
}

/* Top-Nav Vox-Caster Music Controls */
.vox-caster-bar {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: 6px;
  padding-left: 8px;
  border-left: 1px dashed var(--border);
}

.vox-music-btn {
  font-family: var(--font-mono) !important;
  font-size: 0.72rem !important;
  font-weight: 700 !important;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  padding: 5px 10px !important;
  background: var(--crt-bg) !important;
  color: var(--muted) !important;
  border: 1px solid var(--border) !important;
  border-bottom: 2px solid #000 !important;
  clip-path: var(--clip-btn);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  box-shadow: inset 0 0 8px rgba(0, 0, 0, 0.9);
  transition: all 0.15s ease;
}

.vox-music-btn:hover {
  color: var(--text) !important;
  border-color: var(--gold) !important;
}

.vox-music-btn.playing {
  color: var(--green) !important;
  border-color: var(--green) !important;
  text-shadow: 0 0 6px rgba(16, 185, 129, 0.5);
  box-shadow: inset 0 0 10px rgba(16, 185, 129, 0.2), 0 0 8px rgba(16, 185, 129, 0.25);
}

.vox-eq {
  display: inline-flex;
  align-items: flex-end;
  gap: 2px;
  height: 10px;
}

.vox-eq span {
  width: 2px;
  height: 3px;
  background: currentColor;
  display: inline-block;
}

.vox-music-btn.playing .vox-eq span:nth-child(1) {
  animation: voxEqPulse 0.6s infinite ease-in-out alternate;
}
.vox-music-btn.playing .vox-eq span:nth-child(2) {
  animation: voxEqPulse 0.45s infinite ease-in-out alternate 0.15s;
}
.vox-music-btn.playing .vox-eq span:nth-child(3) {
  animation: voxEqPulse 0.75s infinite ease-in-out alternate 0.3s;
}

@keyframes voxEqPulse {
  0% { height: 2px; }
  100% { height: 10px; }
}

/* ==========================================================================
   2. SHELLS, CONTAINERS & HIGH GOTHIC TYPOGRAPHY
   ========================================================================== */
.app-shell {
  max-width: 720px;
  margin: 0 auto;
  padding: 16px;
}

.container,
.briefing-shell {
  max-width: 860px;
  margin: 0 auto;
  padding: 20px 16px 60px 16px;
}

h1, .hero-title, .vox-title {
  font-family: var(--font-gothic);
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 1.5px;
}

h2 {
  font-family: var(--font-gothic);
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: 0.8px;
  margin: 0 0 12px 0;
  color: var(--text);
  text-transform: uppercase;
}

h3 {
  font-family: var(--font-ui);
  font-size: 1.02rem;
  font-weight: 700;
  letter-spacing: 0.6px;
  margin: 0 0 8px 0;
  color: var(--gold);
  text-transform: uppercase;
}

p {
  margin: 0 0 10px 0;
  color: var(--text);
  font-size: 0.93rem;
}

ul {
  margin: 0 0 12px 0;
  padding-left: 20px;
  color: var(--text);
  font-size: 0.92rem;
}

li { margin-bottom: 8px; }
li strong { color: var(--gold-bright); }

code {
  font-family: var(--font-mono);
  background: var(--crt-bg);
  color: var(--green);
  padding: 2px 6px;
  border: 1px solid var(--border);
  font-size: 0.85em;
}

/* ==========================================================================
   3. CHAMFERED IRON CARDS & BRASS TACTICAL STITCHING
   ========================================================================== */
.hero-card,
.hero-banner,
.vox-header,
.clearance-gate {
  position: relative;
  background: linear-gradient(135deg, rgba(36, 28, 22, 0.96) 0%, rgba(18, 16, 14, 0.98) 100%);
  border: 1px solid var(--gold);
  border-top: 2px solid var(--gold-bright);
  border-bottom: 3px solid #050404;
  clip-path: var(--clip-card);
  padding: 26px 22px;
  margin-bottom: 22px;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.75), inset 0 0 24px rgba(0, 0, 0, 0.6);
  text-align: center;
}

/* Inner Dashed Relic-Brass Stitch Frame (matches assets/favicon.svg) */
.hero-card::before,
.hero-banner::before,
.vox-header::before,
.section-card::before,
.card::before {
  content: "";
  position: absolute;
  inset: 4px;
  border: 1px dashed rgba(212, 163, 73, 0.16);
  pointer-events: none;
}

.hero-eyebrow {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2px;
  color: var(--gold);
  background: rgba(212, 163, 73, 0.12);
  border: 1px solid rgba(212, 163, 73, 0.4);
  padding: 4px 12px;
  margin-bottom: 12px;
}

.hero-header {
  text-align: center;
  margin-bottom: 20px;
}

.hero-title,
.vox-title,
.hero-banner h1 {
  font-size: 1.75rem;
  margin: 0 0 8px 0;
  background: linear-gradient(135deg, #fff6e5 0%, var(--gold-bright) 55%, var(--red-bright) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 12px rgba(204, 41, 54, 0.25);
}

.hero-sub,
.hero-subtitle,
.hero-banner p {
  font-size: 0.92rem;
  color: var(--muted);
  max-width: 740px;
  margin: 0 auto 20px auto;
  line-height: 1.6;
}

.hero-banner p { margin-bottom: 0; }

.lore-quote,
.vox-quote {
  background: rgba(8, 7, 6, 0.8);
  border-left: 4px solid var(--gold);
  padding: 14px 18px;
  font-style: italic;
  color: var(--text);
  margin: 14px 0 18px 0;
  font-size: 0.94rem;
  text-align: left;
}

/* Standard Cards & Dossier Section Plates */
.card,
.section-card,
.char-card,
.score-card,
.sector-node,
.alliance-box {
  position: relative;
  background: linear-gradient(180deg, #181512 0%, #12100e 100%);
  border: 1px solid var(--border);
  border-left: 4px solid var(--purple);
  border-bottom: 2px solid #060504;
  clip-path: var(--clip-card);
  padding: 18px;
  margin-bottom: 14px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
}

.section-card {
  border-left: 4px solid var(--gold);
  padding: 24px;
  margin-bottom: 20px;
}

/* Misery Card: Industrial Bulkhead Hazard Stripes */
.card.misery {
  border-left: 5px solid var(--red);
  background:
    repeating-linear-gradient(
      -45deg,
      rgba(204, 41, 54, 0.06) 0px,
      rgba(204, 41, 54, 0.06) 10px,
      transparent 10px,
      transparent 20px
    ),
    linear-gradient(180deg, #1c1313 0%, #120d0d 100%);
}

.card.secondary, .card.gold, .char-card { border-left-color: var(--gold); }
.card.secret, .card.blue, .char-card.blue { border-left-color: var(--blue); }
.card.resupply, .card.green { border-left-color: var(--green); }
.card.spawn-zone { border-left-color: var(--green); }
.char-card.purple { border-left-color: var(--purple); }
.char-card.red { border-left-color: var(--red); }

.hero-box {
  background: var(--surface-alt);
  border: 1px solid var(--border);
  border-left: 4px solid var(--gold);
  clip-path: var(--clip-btn);
  padding: 14px 16px;
  margin-bottom: 12px;
  box-shadow: inset 0 0 12px rgba(0, 0, 0, 0.45);
}
.hero-box.purple { border-left-color: var(--purple); }
.hero-box.red { border-left-color: var(--red); }
.hero-box.blue { border-left-color: var(--blue); }
.hero-box.green { border-left-color: var(--green); }

/* ==========================================================================
   4. RECESSED CRT AUSPEX SCREENS (HUD, SEED INPUTS, CODES)
   ========================================================================== */
.seed-input,
.cm-code,
.hud-bar,
.deed-box,
.ai-step {
  background-color: var(--crt-bg);
  background-image: repeating-linear-gradient(
    0deg,
    rgba(16, 185, 129, 0.03) 0px,
    rgba(16, 185, 129, 0.03) 1px,
    transparent 1px,
    transparent 3px
  );
  border: 1px solid var(--border);
  box-shadow: inset 0 2px 12px rgba(0, 0, 0, 0.95);
}

.setup-grid {
  display: grid;
  gap: 16px;
  text-align: left;
  margin-top: 16px;
}

.setup-label {
  font-family: var(--font-mono);
  font-size: 0.76rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  color: var(--gold);
  margin-bottom: 6px;
  display: block;
  text-align: left;
}

.seed-row {
  display: flex;
  gap: 8px;
}

.seed-input {
  flex: 1;
  color: var(--green);
  padding: 12px 14px;
  font-size: 1.15rem;
  font-family: var(--font-mono);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-align: center;
  text-shadow: 0 0 8px rgba(16, 185, 129, 0.45);
}

.seed-input:focus {
  outline: none;
  border-color: var(--green);
  box-shadow: inset 0 2px 12px rgba(0, 0, 0, 0.95), 0 0 12px rgba(16, 185, 129, 0.35);
}

.hud-bar {
  position: sticky;
  top: 8px;
  z-index: 50;
  border: 1px solid var(--border-bright);
  border-top: 2px solid var(--gold);
  clip-path: var(--clip-card);
  padding: 10px 14px;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.85), inset 0 2px 14px rgba(0, 0, 0, 0.95);
}

.hud-stat,
.hud-metric {
  display: flex;
  flex-direction: column;
}

.hud-val-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 2px;
}

.hud-label {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--muted);
}

.hud-num {
  font-family: var(--font-mono);
  font-size: 1.35rem;
  font-weight: 800;
  min-width: 28px;
  text-align: center;
  text-shadow: 0 0 8px currentColor;
}

.hud-sub {
  font-size: 0.72rem;
  color: var(--muted);
}

.faction-reminder-bar {
  background: linear-gradient(90deg, rgba(212, 163, 73, 0.12) 0%, rgba(20, 23, 32, 0.95) 100%);
  border: 1px solid rgba(212, 163, 73, 0.35);
  border-left: 4px solid var(--gold);
  clip-path: var(--clip-card);
  padding: 10px 14px;
  margin-bottom: 14px;
  font-size: 0.84rem;
  text-align: left;
}

.faction-reminder-title {
  font-weight: 800;
  color: var(--gold);
  text-transform: uppercase;
  font-size: 0.76rem;
  letter-spacing: 0.8px;
  margin-bottom: 2px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* ==========================================================================
   5. MECHANICAL PUSH-PLATE BUTTONS & STAMPED MUNITORUM BADGES
   ========================================================================== */
button,
.gate-btn,
.terminal-link-btn {
  font-family: var(--font-ui);
  background: linear-gradient(180deg, #a13d45 0%, #7a1c24 100%);
  color: var(--text);
  border: 1px solid var(--border-bright);
  border-top: 1px solid rgba(255, 255, 255, 0.22);
  border-bottom: 3px solid #050404;
  clip-path: var(--clip-btn);
  padding: 10px 16px;
  font-size: 0.88rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  transition: transform 0.08s ease, filter 0.15s ease, box-shadow 0.15s ease;
  touch-action: manipulation;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
}

button:hover,
.gate-btn:hover,
.terminal-link-btn:hover {
  filter: brightness(1.14);
  border-color: var(--gold);
}

button:active,
.gate-btn:active,
.terminal-link-btn:active {
  transform: translateY(2px);
  border-bottom-width: 1px;
}

button:disabled {
  background: #24201c !important;
  color: #5e564d !important;
  border-color: #332d27 !important;
  cursor: not-allowed;
  transform: none;
}

.launch-btn {
  width: 100%;
  padding: 16px;
  font-size: 1.05rem;
  font-weight: 800;
  letter-spacing: 1.5px;
  background: linear-gradient(135deg, var(--red) 0%, #80151e 100%);
  color: #fff;
  border: 1px solid var(--gold);
  border-bottom: 4px solid #36070b;
  clip-path: var(--clip-card);
  margin-top: 8px;
  box-shadow: 0 8px 24px rgba(204, 41, 54, 0.35);
}

.btn-red { background: linear-gradient(180deg, var(--red) 0%, #8a1c24 100%); }
.btn-gold { background: linear-gradient(180deg, var(--gold-bright) 0%, #9e7329 100%); color: #120e0a; }
.btn-purple { background: linear-gradient(180deg, var(--purple) 0%, #632ea3 100%); color: #fff; }
.btn-blue { background: linear-gradient(180deg, var(--blue) 0%, #1d5f69 100%); color: #fff; }
.btn-green, button.btn-green { background: linear-gradient(180deg, #159e6d 0%, #0b6e4b 100%); color: #fff; }
.btn-outline { background: var(--surface-alt); border: 1px solid var(--border-bright); }
.btn-ghost { background: transparent; border: 1px solid var(--border); color: var(--muted); }
.btn-ghost:hover { color: var(--text); border-color: var(--muted); }
.btn-sm { padding: 6px 12px; font-size: 0.8rem; border-radius: 8px; }

.mini-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  font-family: var(--font-mono);
  font-size: 1.1rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--surface-alt);
  border: 1px solid var(--border-bright);
  border-bottom: 2px solid #000;
  clip-path: none;
  border-radius: 2px;
}

/* Stamped Metal Dog-Tag Badges */
.badge,
.section-tag,
.status-pill,
.sweet-spot-tag {
  display: inline-flex;
  align-items: center;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  padding: 4px 10px;
  border-radius: 2px;
  margin: 0 auto 10px auto;
  background: rgba(155, 81, 224, 0.16);
  color: #c896ff;
  border: 1px solid rgba(155, 81, 224, 0.45);
  box-shadow: 2px 2px 0px rgba(0, 0, 0, 0.75);
}

.badge.red, .section-tag.red {
  background: rgba(204, 41, 54, 0.2);
  color: #ff7582;
  border-color: rgba(204, 41, 54, 0.55);
}
.badge.gold, .section-tag.gold {
  background: rgba(212, 163, 73, 0.18);
  color: var(--gold-bright);
  border-color: rgba(212, 163, 73, 0.55);
}
.badge.blue, .section-tag.blue {
  background: rgba(56, 152, 166, 0.2);
  color: #6edbe8;
  border-color: rgba(56, 152, 166, 0.55);
}
.badge.green, .section-tag.green, .sweet-spot-tag {
  background: rgba(16, 185, 129, 0.18);
  color: #4ee8b2;
  border-color: rgba(16, 185, 129, 0.55);
}
.badge.purple, .section-tag.purple {
  background: rgba(155, 81, 224, 0.18);
  color: #c896ff;
  border-color: rgba(155, 81, 224, 0.55);
}

.pulse-dot {
  width: 8px;
  height: 8px;
  background-color: var(--red);
  border-radius: 50%;
  box-shadow: 0 0 8px var(--red);
  animation: pulse 1.8s infinite;
  display: inline-block;
  margin-right: 6px;
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.85); }
}

.reward-pill { color: var(--green); font-weight: 700; }
.punish-pill { color: var(--red); font-weight: 700; }

/* ==========================================================================
   6. CHOICE CARDS, ROUND BANNERS, TABLES & COLLAPSIBLES
   ========================================================================== */
.choice-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.choice-card {
  background: var(--surface-alt);
  border: 1px solid var(--border);
  clip-path: var(--clip-btn);
  padding: 12px;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;
}

.choice-card:hover {
  border-color: var(--border-bright);
  background: var(--surface-hover);
}

.choice-card.selected {
  border-color: var(--gold);
  background: rgba(212, 163, 73, 0.14);
  box-shadow: inset 0 0 12px rgba(212, 163, 73, 0.22);
}

.choice-card.selected-red {
  border-color: var(--red-bright);
  background: rgba(204, 41, 54, 0.16);
  box-shadow: inset 0 0 12px rgba(204, 41, 54, 0.25);
}

.choice-icon { font-size: 1.25rem; margin-bottom: 4px; display: block; }
.choice-title {
  font-weight: 700;
  font-size: 0.92rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
}
.choice-desc, .choice-sub {
  font-size: 0.75rem;
  color: var(--muted);
  line-height: 1.3;
}

.round-banner {
  background: linear-gradient(135deg, #211c17 0%, #14110f 100%);
  border: 1px solid var(--border-bright);
  border-left: 4px solid var(--gold);
  clip-path: var(--clip-card);
  padding: 16px;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  text-align: center;
}

.round-title, .round-banner h2 {
  font-family: var(--font-gothic);
  font-size: 1.3rem;
  font-weight: 800;
  margin: 0;
  color: var(--gold-bright);
}

.round-sub, .round-banner p {
  font-size: 0.82rem;
  color: var(--muted);
  margin: 2px 0 0 0;
}

details {
  background: var(--surface);
  border: 1px solid var(--border);
  clip-path: var(--clip-btn);
  padding: 12px 16px;
  margin-bottom: 12px;
}

summary {
  font-weight: 700;
  cursor: pointer;
  color: var(--gold);
  outline: none;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

.drawer-body {
  padding-top: 14px;
  margin-top: 10px;
  border-top: 1px solid var(--border);
}

table,
table.reckoning-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  font-size: 0.85rem;
}

th, td,
table.reckoning-table th,
table.reckoning-table td {
  border: 1px solid var(--border);
  padding: 8px 10px;
  text-align: left;
  vertical-align: top;
}

th,
table.reckoning-table th {
  background: #1f1b17;
  color: var(--gold);
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.8px;
  font-size: 0.74rem;
}

tr.active-row,
tr.highlight-row {
  background: rgba(204, 41, 54, 0.2);
  font-weight: bold;
}

.shop-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
  gap: 10px;
  margin-top: 12px;
}

.shop-item {
  background: var(--surface-alt);
  border: 1px solid var(--border);
  clip-path: var(--clip-btn);
  padding: 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.dice-bar {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 10px;
}

.dice-btn {
  background: var(--surface-alt);
  border: 1px solid var(--border-bright);
  padding: 10px;
  font-size: 0.84rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.cm-box {
  background: rgba(0, 0, 0, 0.55);
  border: 1px dashed var(--gold);
  padding: 14px;
  margin-top: 12px;
}

.cm-code {
  font-family: var(--font-mono);
  font-size: 0.82rem;
  color: var(--gold-bright);
  padding: 10px;
  word-break: break-all;
  margin: 8px 0;
  user-select: all;
}

.filter-bar {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 8px;
  margin-bottom: 12px;
}

.chip {
  background: var(--surface-alt);
  border: 1px solid var(--border);
  color: var(--muted);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  white-space: nowrap;
  cursor: pointer;
}
.chip.active {
  background: var(--gold);
  color: #120e0a;
  border-color: var(--gold-bright);
  font-weight: 700;
}

.rules-strip {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  margin: 20px 0;
}
.rule-tag {
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--border);
  color: #a5b0c2;
  font-size: 0.74rem;
  padding: 4px 10px;
  border-radius: 6px;
}
.rule-tag strong { color: var(--gold); }

input, select, textarea {
  background: var(--bg);
  color: var(--text);
  border: 1px solid var(--border);
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 0.9rem;
  outline: none;
  font-family: var(--font-ui);
}

.hidden { display: none !important; }

/* ==========================================================================
   7. BRIEFING, SHIP.MD SLIDER, ROSTER & ROGUE AI TRACKER CLASSES
   ========================================================================== */
.nav-pills,
.commander-switcher {
  display: flex;
  background: var(--surface);
  padding: 6px;
  border: 1px solid var(--border);
  clip-path: var(--clip-card);
  margin-bottom: 22px;
  gap: 6px;
  max-width: 860px;
  margin-left: auto;
  margin-right: auto;
}

.nav-pills button,
.commander-switcher button {
  flex: 1;
  background: transparent;
  color: var(--muted);
  border: 1px solid transparent;
  padding: 11px 8px;
  font-size: 0.82rem;
  font-family: var(--font-ui);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  clip-path: var(--clip-btn);
  box-shadow: none;
  cursor: pointer;
  transition: all 0.15s ease;
}

.nav-pills button:hover,
.commander-switcher button:hover {
  color: var(--text);
  background: var(--surface-hover);
  border-color: var(--border-bright);
}

.nav-pills button.active,
.commander-switcher button.active {
  background: linear-gradient(135deg, rgba(212, 163, 73, 0.2) 0%, rgba(28, 25, 22, 0.95) 100%);
  color: var(--gold-bright);
  border-color: var(--gold);
  box-shadow: inset 0 0 12px rgba(212, 163, 73, 0.2);
}

.vox-meta {
  font-family: var(--font-mono);
  font-size: 0.76rem;
  color: var(--gold);
  text-transform: uppercase;
  letter-spacing: 1.2px;
  margin-bottom: 12px;
  border-bottom: 1px dashed var(--border);
  padding-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.slider-track {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
  margin: 14px 0;
}

.slider-node {
  background: var(--crt-bg);
  border: 1px solid var(--border);
  clip-path: var(--clip-btn);
  padding: 10px 4px;
  cursor: pointer;
  text-align: center;
  transition: all 0.15s ease;
  color: var(--muted);
}

.slider-node:hover {
  border-color: var(--gold);
  color: var(--text);
}

.slider-node .val {
  font-family: var(--font-mono);
  font-size: 1.15rem;
  font-weight: 800;
  display: block;
}

.slider-node .lbl {
  font-size: 0.64rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.slider-node.active-brig {
  background: rgba(204, 41, 54, 0.22);
  border-color: var(--red-bright);
  color: #fff;
  box-shadow: 0 0 14px rgba(204, 41, 54, 0.35);
}

.slider-node.active-bal {
  background: rgba(56, 152, 166, 0.22);
  border-color: var(--blue);
  color: #fff;
  box-shadow: 0 0 14px rgba(56, 152, 166, 0.35);
}

.slider-node.active-sanctum {
  background: rgba(212, 163, 73, 0.22);
  border-color: var(--gold-bright);
  color: #fff;
  box-shadow: 0 0 14px rgba(212, 163, 73, 0.35);
}

.sector-grid,
.alliance-grid,
.scoreboard-bar,
.oob-grid,
.impact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
  margin-top: 14px;
}

.scoreboard-bar { margin-top: 0; margin-bottom: 24px; }

.sector-node,
.alliance-box,
.score-card {
  border-left: 1px solid var(--border);
  border-top: 3px solid var(--green);
}

.score-card { text-align: center; border-top-color: var(--gold); }
.sector-node.fog { border-top-color: #524c44; opacity: 0.85; }
.sector-node.hostile, .alliance-box.desecrator, .score-card.horde { border-top-color: var(--red); }
.alliance-box { border-top-color: var(--gold); }
.alliance-box.marauder, .score-card.beta { border-top-color: var(--purple); }

.alliance-title, .char-name, .score-name {
  font-family: var(--font-gothic);
  font-weight: 800;
  font-size: 1.04rem;
  color: var(--text);
  margin-bottom: 6px;
}

.score-title {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--muted);
}

.score-pts {
  font-family: var(--font-mono);
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--gold-bright);
}

.char-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 6px;
}

.char-meta {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--gold);
  font-weight: 700;
}

.deed-box {
  padding: 10px 12px;
  margin-top: 10px;
  font-size: 0.85rem;
  color: var(--text);
}

.oob-item,
.impact-box {
  background: var(--surface-alt);
  border: 1px solid var(--border);
  clip-path: var(--clip-btn);
  padding: 10px 12px;
  font-size: 0.85rem;
}

.ai-step {
  padding: 12px 14px;
  margin-bottom: 10px;
}

.ai-step.active-step {
  border-color: var(--green);
  box-shadow: inset 0 0 14px rgba(16, 185, 129, 0.2), 0 0 12px rgba(16, 185, 129, 0.2);
}

.ai-step-title {
  font-family: var(--font-mono);
  font-weight: 700;
  color: var(--green);
  margin-bottom: 4px;
  display: flex;
  justify-content: space-between;
}

.btn-row {
  display: flex;
  gap: 14px;
  margin-top: 24px;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.terminal-link-btn {
  flex: 1;
  display: block;
  text-align: center;
  text-decoration: none;
  padding: 15px;
  max-width: 480px;
  min-width: 260px;
}

.terminal-link-btn.alt {
  background: linear-gradient(135deg, #6e359c 0%, #431b66 100%);
}

/* ==========================================================================
   8. SECTOR ATLAS HOLOLITH MAP, HEGEMONY TRACKER & FULLSCREEN AUSPEX
   ========================================================================== */
.heg-race-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 14px 0 6px 0;
  background: var(--crt-bg);
  border: 1px solid var(--border);
  padding: 12px 14px;
  box-shadow: inset 0 2px 12px rgba(0, 0, 0, 0.95);
}

.heg-row {
  display: grid;
  grid-template-columns: 185px 1fr 68px;
  align-items: center;
  gap: 10px;
}

.heg-faction {
  font-family: var(--font-mono);
  font-size: 0.76rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

.heg-segments,
.heg-seg-track {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 5px;
}

.heg-seg {
  height: 12px;
  border-radius: 1px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.heg-seg.filled-gold, .heg-seg.active-alpha {
  background: linear-gradient(90deg, #b8862d, var(--gold-bright));
  border-color: #ffe082;
  box-shadow: 0 0 8px rgba(212, 163, 73, 0.6);
}

.heg-seg.filled-purple, .heg-seg.active-beta {
  background: linear-gradient(90deg, #6b2cf5, var(--purple));
  border-color: #d2b4ff;
  box-shadow: 0 0 8px rgba(155, 81, 224, 0.6);
}

.heg-seg.filled-red, .heg-seg.active-horde {
  background: linear-gradient(90deg, #9e1b24, var(--red-bright));
  border-color: #ff9aa2;
  box-shadow: 0 0 8px rgba(204, 41, 54, 0.6);
}

.heg-count {
  font-family: var(--font-mono);
  font-size: 0.76rem;
  font-weight: 700;
  text-align: right;
  color: var(--muted);
}

.hololith-map-wrap {
  background: radial-gradient(circle at 50% 50%, #0b1c14 0%, #050a08 75%, #020403 100%);
  border: 1px solid rgba(16, 185, 129, 0.45);
  clip-path: var(--clip-card);
  padding: 14px;
  margin-top: 12px;
  box-shadow: inset 0 0 40px rgba(16, 185, 129, 0.12), 0 10px 28px rgba(0, 0, 0, 0.8);
  position: relative;
  overflow: hidden;
}

.hololith-svg,
.sector-svg {
  width: 100%;
  height: auto;
  display: block;
  max-height: 440px;
}

.map-node-group { cursor: pointer; }
.map-node-group:hover .node-outer-ring {
  stroke-width: 2.8;
  filter: drop-shadow(0 0 8px currentColor);
}
.map-node-group.selected-node .node-select-ring,
.map-node-group.selected-node .node-selection-reticle {
  opacity: 1;
  animation: auspexPulse 2s infinite ease-in-out;
}
.node-select-ring,
.node-selection-reticle { opacity: 0; transition: opacity 0.2s; }

@keyframes auspexPulse {
  0%, 100% { r: 28px; stroke-opacity: 0.95; }
  50% { r: 33px; stroke-opacity: 0.35; }
}

.auspex-map-frame {
  position: relative;
  width: 100%;
  background: #040806;
  border: 1px solid rgba(16, 185, 129, 0.35);
  border-radius: 14px;
  padding: 10px;
  margin-top: 14px;
  box-shadow: inset 0 0 60px rgba(0, 0, 0, 0.95);
  transition: all 0.25s ease;
  overflow: hidden;
}

.auspex-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(5, 10, 8, 0.94);
  border-bottom: 1px solid rgba(16, 185, 129, 0.28);
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--green);
}

.auspex-tool-btns {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.auspex-btn,
.auspex-toolbar-btn {
  background: rgba(16, 185, 129, 0.12);
  color: #a7f3d0;
  border: 1px solid rgba(16, 185, 129, 0.4);
  padding: 5px 10px;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.auspex-btn:hover,
.auspex-toolbar-btn:hover {
  background: rgba(16, 185, 129, 0.25);
  color: #fff;
}

.auspex-btn.active-zoom,
.auspex-toolbar-btn.active {
  background: rgba(212, 163, 73, 0.22);
  color: var(--gold-bright);
  border-color: var(--gold);
}

.auspex-viewport,
.auspex-map-viewport {
  width: 100%;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  position: relative;
  border-radius: 8px;
}

.auspex-map-viewport svg {
  width: 100%;
  height: auto;
  min-width: 680px;
  display: block;
  margin: 0 auto;
  font-family: 'Segoe UI', Roboto, monospace;
  user-select: none;
  transition: width 0.2s ease;
}

/* Zoom levels for mobile & desktop inspection */
.auspex-map-viewport.zoom-1x svg { width: 100%; min-width: 720px; }
.auspex-map-viewport.zoom-15x svg { width: 155%; min-width: 1100px; }
.auspex-map-viewport.zoom-22x svg { width: 220%; min-width: 1550px; }

/* Fullscreen Auspex Interactive Telemetry HUD */
.auspex-fullscreen-hud {
  position: absolute;
  bottom: 12px;
  left: 16px;
  right: 16px;
  background: rgba(5, 12, 9, 0.94);
  border: 1px solid var(--green);
  border-radius: 10px;
  padding: 10px 14px;
  box-shadow: 0 10px 35px rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(8px);
  z-index: 100;
  transition: all 0.2s ease;
  max-height: calc(100dvh - 80px);
  overflow-y: auto;
}

.fs-hud-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.fs-hud-title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.fs-node-tag {
  font-family: var(--font-mono);
  font-size: 0.74rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 3px 8px;
  border-radius: 4px;
  background: rgba(16, 185, 129, 0.18);
  color: #86efac;
  border: 1px solid rgba(16, 185, 129, 0.35);
}

.fs-dominance-pill {
  display: inline-flex;
  align-items: center;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 4px;
  background: rgba(245, 176, 65, 0.14);
  color: #fde68a;
  border: 1px solid rgba(245, 176, 65, 0.35);
}

.fs-hud-pills {
  display: flex;
  gap: 5px;
  align-items: center;
  flex-wrap: wrap;
  margin-top: 8px;
  padding-top: 6px;
  border-top: 1px solid rgba(74, 222, 128, 0.15);
}

.fs-pill-btn {
  background: #0d1914;
  border: 1px solid #1f3a2e;
  color: #86efac;
  font-family: var(--font-mono);
  font-size: 0.76rem;
  font-weight: 700;
  padding: 4px 9px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.fs-pill-btn:hover,
.fs-pill-btn.active {
  background: var(--green);
  color: #050a08;
  border-color: var(--green);
}

.fs-hud-details {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(74, 222, 128, 0.2);
  transition: all 0.2s ease;
}

.fs-hud-details.hidden-details {
  display: none !important;
}

.fs-hud-rule-box {
  background: #09130e;
  border: 1px solid rgba(16, 185, 129, 0.35);
  border-radius: 6px;
  padding: 12px 16px;
  font-size: 0.98rem;
  line-height: 1.65;
  color: #ecfdf5;
  margin-bottom: 12px;
}

.fs-hud-rule-box strong {
  color: #6ee7b7;
  font-weight: 700;
}

.fs-hud-rule-box em {
  color: #d1fae5;
  font-style: normal;
}

.fs-hud-heg-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
}

.fs-heg-row {
  background: #08110c;
  border: 1px solid #182d21;
  border-radius: 6px;
  padding: 8px 12px;
}

.fs-heg-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 5px;
  color: #a7f3d0;
}

.fs-heg-bar {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
  height: 11px;
}

.auspex-map-frame:fullscreen,
.auspex-map-frame:-webkit-full-screen,
.auspex-map-frame.pseudo-fullscreen,
.auspex-map-frame.hololith-fullscreen {
  position: fixed !important;
  inset: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  max-width: none !important;
  z-index: 9999 !important;
  border-radius: 0 !important;
  background: radial-gradient(circle at 50% 45%, #091812 0%, #030605 80%) !important;
  display: flex !important;
  flex-direction: column !important;
  padding: 12px 16px !important;
  box-sizing: border-box !important;
}

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
