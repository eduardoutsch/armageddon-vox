# 📦 Fires of Armageddon // Bundle: Tactical Stylesheet (Part 1: Tokens & Auspex Glow)

Sanctuary-Noctis design tokens, CRT scanlines, cathode pulse effects, and ambient glow (`css/style.css` lines 1 to 750).

## 📑 Table of Contents
- [css/style.css (Part 1: Design Tokens & Auspex Glow, Lines 1-750)](#file-cssstylecsspart1designtokensauspexglowlines1750)

---

## File: `css/style.css (Part 1: Design Tokens & Auspex Glow, Lines 1-750)` <a id="file-cssstylecsspart1designtokensauspexglowlines1750"></a>

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

  /* Unified Auspex Hololith Perimeter & Corner Glow Tokens */
  --side-glow-line: rgba(56, 189, 248, 0.70);
  --side-glow-bloom: rgba(14, 165, 233, 0.32);
  --side-glow-deep: rgba(2, 132, 199, 0.10);
  --corner-glow-core: rgba(56, 189, 248, 0.16);
  --corner-glow-bloom: rgba(14, 165, 233, 0.06);
  --corner-glow-deep: rgba(2, 132, 199, 0.02);

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
    radial-gradient(circle at 72% 78%, rgba(212, 163, 73, 0.07) 0%, transparent 48%);
  background-attachment: fixed;
  color: var(--text);
  margin: 0;
  padding: 0;
  line-height: 1.55;
  min-height: 100vh;
  letter-spacing: 0.2px;
}

/* ==========================================================================
   UNIFIED AUSPEX HOLOLITH PERIMETER & CORNER GLOW
   Subtle, organic cathode-cyan energy field:
   - body::before: 4 gentle ambient corner vignettes anchored behind nav (z-index 50)
   - body::after: Vertical razor-edge lateral side beams and blooms
   Harmonized color tokens and synchronized 7.5s breathing pulse ensure complete
   cohesion without washing over navigation tabs or obscuring text.
   ========================================================================== */
body::before {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 50;
  background:
    radial-gradient(ellipse 16vw 16vh at 0% 0%, var(--corner-glow-core) 0%, var(--corner-glow-bloom) 45%, var(--corner-glow-deep) 75%, transparent 100%),
    radial-gradient(ellipse 16vw 16vh at 100% 0%, var(--corner-glow-core) 0%, var(--corner-glow-bloom) 45%, var(--corner-glow-deep) 75%, transparent 100%),
    radial-gradient(ellipse 16vw 16vh at 0% 100%, var(--corner-glow-core) 0%, var(--corner-glow-bloom) 45%, var(--corner-glow-deep) 75%, transparent 100%),
    radial-gradient(ellipse 16vw 16vh at 100% 100%, var(--corner-glow-core) 0%, var(--corner-glow-bloom) 45%, var(--corner-glow-deep) 75%, transparent 100%);
  animation: voxCornerOrganicPulse 7.5s ease-in-out infinite alternate;
}

body::after {
  content: "";
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 9999;
  background:
    /* Left Vertical Razor-Edge Beam */
    linear-gradient(to right, var(--side-glow-line) 0px, var(--side-glow-bloom) 2px, transparent 18px),
    /* Left Lateral Diffusion Bloom */
    radial-gradient(ellipse 90px 75vh at 0% 50%, var(--side-glow-bloom) 0%, var(--side-glow-deep) 55%, transparent 100%),
    /* Right Vertical Razor-Edge Beam */
    linear-gradient(to left, var(--side-glow-line) 0px, var(--side-glow-bloom) 2px, transparent 18px),
    /* Right Lateral Diffusion Bloom */
    radial-gradient(ellipse 90px 75vh at 100% 50%, var(--side-glow-bloom) 0%, var(--side-glow-deep) 55%, transparent 100%);
  /* Softly tapers off at the top (under top nav) and bottom to protect center text */
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.40) 6%, black 14%, black 86%, rgba(0, 0, 0, 0.40) 94%, transparent 100%);
  mask-image: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.40) 6%, black 14%, black 86%, rgba(0, 0, 0, 0.40) 94%, transparent 100%);
  animation: voxLateralEdgePulse 7.5s ease-in-out infinite alternate;
}

@keyframes voxCornerOrganicPulse {
  0% {
    opacity: 0.35;
  }
  50% {
    opacity: 0.65;
  }
  100% {
    opacity: 0.45;
  }
}

@keyframes voxLateralEdgePulse {
  0% {
    opacity: 0.60;
    filter: drop-shadow(0 0 6px rgba(14, 165, 233, 0.35));
  }
  50% {
    opacity: 0.95;
    filter: drop-shadow(0 0 14px rgba(56, 189, 248, 0.55));
  }
  100% {
    opacity: 0.72;
    filter: drop-shadow(0 0 8px rgba(14, 165, 233, 0.40));
  }
}

/* Centering & Symmetry Utilities */
.text-center {
  text-align: center !important;
}

.flex-center {
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
}

.welcome-btn-row {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 16px;
  text-align: center;
}

.welcome-quick-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 12px;
  margin: 18px 0 10px 0;
  text-align: center;
}

.welcome-quick-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 16px 12px;
  background: linear-gradient(180deg, #1b1815 0%, #12100e 100%);
  border: 1px solid var(--border);
  border-top: 2px solid var(--gold);
  clip-path: var(--clip-card);
  text-decoration: none;
  color: var(--text);
  transition: all 0.2s ease;
}

.welcome-quick-card:hover {
  transform: translateY(-2px);
  border-color: var(--gold-bright);
  box-shadow: 0 8px 24px rgba(212, 163, 73, 0.2);
  color: #fff;
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
  max-width: 820px;
  margin: 0 auto;
  padding: 16px;
}

.vox-shell {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 16px 20px 48px 20px;
  box-sizing: border-box;
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
  padding: 10px 18px 10px 14px;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px 12px;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.85), inset 0 2px 14px rgba(0, 0, 0, 0.95);
}

.hud-actions {
  display: flex;
  gap: 6px;
  align-items: center;
  flex-shrink: 0;
}

.hud-actions .btn-sm {
  padding: 4px 8px;
  font-size: 0.72rem;
  letter-spacing: 0.4px;
  white-space: nowrap;
}

.solo-sp-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 0.7rem;
  font-weight: 800;
  background: rgba(59, 130, 246, 0.18);
  border: 1px solid var(--blue);
  color: #93c5fd;
  white-space: nowrap;
  letter-spacing: 0.4px;
}

@media (max-width: 740px) {
  .hud-stat:first-child {
    order: 1;
  }
  .hud-actions {
    order: 2;
    margin-left: auto;
  }
  .hud-stat:nth-child(2) {
    order: 3;
  }
  .hud-stat:nth-child(3) {
    order: 4;
  }
}

.hud-stat,
.hud-metric {
  display: flex;
  flex-direction: column;
}

.hud-val-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 2px;
}

.hud-val-row .mini-btn {
  width: 28px;
  height: 28px;
  font-size: 1rem;
}

.hud-val-row .mini-btn.strat-btn {
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: -0.5px;
  padding: 0;
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
````
