# 📦 Fires of Armageddon // Bundle: Tactical Stylesheet (Part 3: Spawner Cockpit & Modals)

Spawner cockpit controls, resupply item cards, modal dialogs, and threat indicators (`css/style.css` lines 1451 to 2150).

## 📑 Table of Contents
- [css/style.css (Part 3: Spawner Cockpit & Modals, Lines 1451-2150)](#file-cssstylecsspart3spawnercockpitmodalslines14512150)

---

## File: `css/style.css (Part 3: Spawner Cockpit & Modals, Lines 1451-2150)` <a id="file-cssstylecsspart3spawnercockpitmodalslines14512150"></a>

````css
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.02);
  transition: all 0.15s ease;
}

summary:hover {
  color: var(--gold-bright);
  background: rgba(212, 163, 73, 0.06);
}

details[open] > summary {
  border-bottom: 1px dashed var(--border);
  background: rgba(212, 163, 73, 0.08);
}

.drawer-body {
  padding: 14px 16px;
}

.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.reward-pill {
  background: rgba(16, 185, 129, 0.12);
  color: #6ee7b7;
  border: 1px solid rgba(16, 185, 129, 0.35);
  padding: 4px 10px;
  font-size: 0.78rem;
  border-radius: 4px;
}

.reward-pill strong {
  color: #a7f3d0;
}

.punish-pill {
  background: rgba(204, 41, 54, 0.12);
  color: #fca5a5;
  border: 1px solid rgba(204, 41, 54, 0.35);
  padding: 4px 10px;
  font-size: 0.78rem;
  border-radius: 4px;
}

.punish-pill strong {
  color: #f87171;
}

.cm-code {
  display: inline-block;
  background: var(--bg);
  border: 1px dashed var(--gold);
  color: var(--gold);
  padding: 8px 18px;
  border-radius: 6px;
  font-family: var(--font-mono);
  font-size: 0.95rem;
  font-weight: 700;
  letter-spacing: 1.5px;
  margin-top: 10px;
  text-align: center;
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
  user-select: none;
}

.slider-node {
  background: var(--surface-alt);
  border: 1.5px solid var(--border);
  border-radius: 10px;
  padding: 10px 4px;
  cursor: default;
  pointer-events: none; /* Strictly non-interactable status gauge */
  text-align: center;
  color: var(--muted);
  opacity: 0.45;
  transition: all 0.15s ease;
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
  font-size: 0.65rem;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.slider-node .sweet-spot-tag {
  font-size: 0.58rem;
  padding: 2px 4px;
  margin-top: 4px;
  display: inline-block;
  white-space: nowrap;
}

.slider-node.active-brig {
  background: rgba(255, 71, 87, 0.18);
  border-color: var(--red);
  color: #fff;
  box-shadow: 0 0 14px rgba(255, 71, 87, 0.35);
  opacity: 1;
  transform: translateY(-2px);
}

.slider-node.active-bal {
  background: rgba(59, 130, 246, 0.18);
  border-color: var(--blue);
  color: #fff;
  box-shadow: 0 0 14px rgba(59, 130, 246, 0.35);
  opacity: 1;
  transform: translateY(-2px);
}

.slider-node.active-sanctum {
  background: rgba(245, 176, 65, 0.18);
  border-color: var(--gold);
  color: #fff;
  box-shadow: 0 0 14px rgba(245, 176, 65, 0.35);
  opacity: 1;
  transform: translateY(-2px);
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
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  max-width: 100vw !important;
  max-height: 100vh !important;
  z-index: 999999 !important;
  margin: 0 !important;
  border: none !important;
  border-radius: 0 !important;
  clip-path: none !important;
  background: radial-gradient(circle at 50% 45%, #091812 0%, #030605 80%) !important;
  display: flex !important;
  flex-direction: column !important;
  padding: 10px 14px !important;
  box-sizing: border-box !important;
}

````
