# 📦 Fires of Armageddon // Bundle: Stylesheet, Configuration & Packages

Global typography, design system tokens, Cloudflare Pages config, project metadata, and engineering rules.

## 📑 Table of Contents
- [css/style.css](#file-cssstylecss)
- [package.json](#file-packagejson)
- [wrangler.jsonc](#file-wranglerjsonc)
- [assets/favicon.svg](#file-assetsfaviconsvg)
- [README.md](#file-readmemd)
- [AGENTS.md](#file-agentsmd)
- [.gitignore](#file-gitignore)

---

## File: `css/style.css` <a id="file-cssstylecss"></a>

````css
:root {
  --bg: #0a0b10;
  --surface: #141720;
  --surface-hover: #1c202e;
  --border: #262b3d;
  --text: #eceff4;
  --muted: #8b92a5;
  --purple: #9d5cff;
  --red: #ff4757;
  --gold: #f5b041;
  --blue: #3b82f6;
  --green: #10b981;
}
* { box-sizing: border-box; }
body {
  font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  background-color: var(--bg);
  background-image: 
    radial-gradient(circle at 50% 0%, rgba(255, 71, 87, 0.14) 0%, transparent 55%),
    radial-gradient(circle at 85% 90%, rgba(157, 92, 255, 0.1) 0%, transparent 45%);
  background-attachment: fixed;
  color: var(--text);
  margin: 0;
  padding: 0;
  line-height: 1.5;
  min-height: 100vh;
}
.suite-nav {
  background: rgba(12, 14, 20, 0.95);
  border-bottom: 1px solid var(--border);
  padding: 8px 16px;
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}
.suite-link {
  text-decoration: none;
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  padding: 6px 12px;
  border-radius: 8px;
  color: var(--muted);
  border: 1px solid transparent;
  transition: all 0.15s;
}
.suite-link:hover { color: var(--text); background: var(--surface); }
.suite-link.active {
  color: var(--red);
  background: rgba(255, 71, 87, 0.12);
  border-color: rgba(255, 71, 87, 0.35);
}

.app-shell { max-width: 720px; margin: 0 auto; padding: 16px; }

/* HOME SCREEN */
.hero-card {
  background: linear-gradient(180deg, rgba(24, 28, 40, 0.95) 0%, rgba(16, 19, 28, 0.98) 100%);
  border: 1px solid rgba(255, 71, 87, 0.3);
  border-radius: 20px;
  padding: 28px 22px;
  margin-top: 10px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.75), 0 0 30px rgba(255, 71, 87, 0.08);
  position: relative;
  overflow: hidden;
}
.hero-card::before {
  content: "";
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, var(--red), var(--gold), var(--red), transparent);
}
.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(255, 71, 87, 0.12);
  border: 1px solid rgba(255, 71, 87, 0.35);
  color: #ff8a93;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1.2px;
  padding: 5px 12px;
  border-radius: 99px;
  margin-bottom: 14px;
}
.pulse-dot {
  width: 8px; height: 8px;
  background-color: var(--red);
  border-radius: 50%;
  box-shadow: 0 0 8px var(--red);
  animation: pulse 1.8s infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.4; transform: scale(0.85); }
}
.hero-header { text-align: center; margin-bottom: 20px; }
.hero-title {
  font-size: 1.85rem; font-weight: 800; letter-spacing: 1px;
  text-transform: uppercase; margin: 0 0 6px 0;
  background: linear-gradient(135deg, #ffffff 0%, #ffb8b8 50%, #ff4757 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}
.hero-subtitle { color: var(--muted); font-size: 0.9rem; margin: 0 auto; max-width: 460px; }
.lore-quote {
  background: rgba(10, 11, 16, 0.65); border-left: 3px solid var(--gold);
  padding: 10px 14px; border-radius: 0 8px 8px 0;
  font-size: 0.82rem; font-style: italic; color: #b8c0d0;
  margin: 14px 0 18px 0; text-align: left;
}
.setup-label {
  display: block; text-align: left; font-size: 0.75rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 1px; color: var(--gold); margin: 16px 0 8px 0;
}
.seed-row { display: flex; gap: 8px; }
.seed-input {
  flex: 1; background: #0b0d13; color: #fff; border: 1px solid var(--border);
  padding: 13px 16px; border-radius: 12px; font-size: 1.1rem;
  font-family: monospace; font-weight: 700; letter-spacing: 2px;
  text-transform: uppercase; text-align: center; outline: none;
}
.dice-btn {
  background: #1e2333; border: 1px solid var(--border); color: var(--text);
  padding: 0 16px; border-radius: 12px; font-size: 0.85rem; white-space: nowrap;
}
.choice-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.choice-card {
  background: #0d1018; border: 1.5px solid var(--border); border-radius: 12px;
  padding: 13px 12px; text-align: left; cursor: pointer; transition: all 0.18s ease;
}
.choice-card.selected {
  background: rgba(157, 92, 255, 0.12); border-color: var(--purple);
  box-shadow: 0 0 18px rgba(157, 92, 255, 0.2);
}
.choice-card.selected-red {
  background: rgba(255, 71, 87, 0.12); border-color: var(--red);
  box-shadow: 0 0 18px rgba(255, 71, 87, 0.2);
}
.choice-icon { font-size: 1.25rem; margin-bottom: 4px; display: block; }
.choice-title { font-weight: 700; font-size: 0.95rem; color: #fff; margin-bottom: 2px; }
.choice-sub { font-size: 0.75rem; color: var(--muted); line-height: 1.3; }
.rules-strip { display: flex; justify-content: center; flex-wrap: wrap; gap: 8px; margin: 20px 0; }
.rule-tag {
  background: rgba(255,255,255,0.04); border: 1px solid var(--border);
  color: #a5b0c2; font-size: 0.74rem; padding: 4px 10px; border-radius: 6px;
}
.rule-tag strong { color: var(--gold); }
.launch-btn {
  width: 100%; padding: 16px; font-size: 1.05rem; text-transform: uppercase;
  letter-spacing: 1px; border-radius: 12px;
  background: linear-gradient(135deg, #ff4757 0%, #c01c2e 100%);
  box-shadow: 0 8px 24px rgba(255, 71, 87, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.15);
}

/* IN-GAME TERMINAL */
input, select, textarea {
  background: var(--bg); color: var(--text); border: 1px solid var(--border);
  padding: 10px 12px; border-radius: 10px; font-size: 0.9rem; outline: none;
}
button {
  background: var(--purple); color: #fff; border: none; padding: 11px 18px;
  border-radius: 10px; font-size: 0.9rem; font-weight: 600; cursor: pointer; transition: all 0.15s ease;
}
button:hover { filter: brightness(1.1); }
button.btn-red { background: var(--red); }
button.btn-blue { background: var(--blue); }
button.btn-gold { background: var(--gold); color: #111; }
button.btn-green { background: var(--green); }
button.btn-ghost { background: transparent; border: 1px solid var(--border); color: var(--muted); }
button.btn-ghost:hover { color: var(--text); border-color: var(--muted); }
button.btn-sm { padding: 6px 12px; font-size: 0.8rem; border-radius: 8px; }

.hud-bar {
  display: grid; grid-template-columns: 1.2fr 1fr 1fr auto; gap: 10px;
  background: var(--surface); border: 1px solid var(--border); border-radius: 14px;
  padding: 10px 14px; margin-bottom: 10px; align-items: center;
  position: sticky; top: 10px; z-index: 50; box-shadow: 0 8px 20px rgba(0,0,0,0.45);
}
.hud-stat { display: flex; flex-direction: column; }
.hud-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.8px; color: var(--muted); }
.hud-val-row { display: flex; align-items: center; gap: 8px; margin-top: 2px; }
.hud-num { font-size: 1.25rem; font-weight: 700; }
.hud-sub { font-size: 0.72rem; color: var(--muted); }
.mini-btn {
  background: var(--bg); border: 1px solid var(--border); color: var(--text);
  width: 26px; height: 26px; padding: 0; border-radius: 6px; font-size: 0.9rem;
  display: inline-flex; align-items: center; justify-content: center;
}

/* PERSISTENT HORDE FACTION REMINDER BANNER */
.faction-reminder-bar {
  background: linear-gradient(90deg, rgba(245, 176, 65, 0.12) 0%, rgba(20, 23, 32, 0.95) 100%);
  border: 1px solid rgba(245, 176, 65, 0.35);
  border-left: 4px solid var(--gold);
  border-radius: 10px;
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

.nav-pills {
  display: flex; background: var(--surface); padding: 5px;
  border-radius: 12px; border: 1px solid var(--border); margin-bottom: 20px; gap: 4px;
}
.nav-pills button {
  flex: 1; background: transparent; color: var(--muted);
  padding: 10px 6px; border-radius: 8px; font-size: 0.82rem;
}
.nav-pills button.active {
  background: var(--bg); color: var(--text); box-shadow: 0 2px 8px rgba(0,0,0,0.3);
}

.card {
  background: var(--surface); border: 1px solid var(--border);
  border-left: 4px solid var(--purple); border-radius: 12px;
  padding: 18px; margin-bottom: 14px;
}
.card.misery { border-left-color: var(--red); }
.card.secondary { border-left-color: var(--gold); }
.card.spawn-zone { border-left-color: var(--green); }
.card.resupply {
  border-left-color: var(--blue); padding: 14px 16px;
  display: flex; justify-content: space-between; align-items: center; gap: 14px;
}
.badge {
  display: inline-block; font-size: 0.7rem; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.6px; padding: 3px 8px;
  border-radius: 6px; margin-bottom: 8px;
  background: rgba(157, 92, 255, 0.15); color: var(--purple);
}
.badge.gold { background: rgba(245, 176, 65, 0.15); color: var(--gold); }
.badge.red { background: rgba(255, 71, 87, 0.15); color: var(--red); }
.badge.blue { background: rgba(59, 130, 246, 0.15); color: var(--blue); }
.badge.green { background: rgba(16, 185, 129, 0.15); color: var(--green); }

.card-title { font-size: 1.08rem; font-weight: 700; margin: 0 0 6px 0; color: var(--text); }
.card-desc { font-size: 0.92rem; color: #c9d1d9; margin: 0; }
.meta-row {
  display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px;
  padding-top: 10px; border-top: 1px solid var(--border); font-size: 0.85rem;
}
.reward-pill { color: var(--green); }
.punish-pill { color: var(--red); }

.round-banner {
  background: linear-gradient(135deg, #1b1626 0%, #161922 100%);
  border: 1px solid var(--border); border-radius: 14px;
  padding: 20px; text-align: center; margin-bottom: 20px;
}
.round-banner h2 { margin: 0 0 4px 0; font-size: 1.2rem; }
.round-banner p { margin: 0 0 14px 0; color: var(--gold); font-size: 0.9rem; }

details {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 12px; padding: 12px 16px; margin-top: 16px;
}
summary { font-weight: 600; font-size: 0.9rem; color: var(--muted); cursor: pointer; user-select: none; }
summary:hover { color: var(--text); }
.drawer-body { padding-top: 14px; margin-top: 10px; border-top: 1px solid var(--border); }

.filter-bar { display: flex; gap: 6px; overflow-x: auto; padding-bottom: 8px; margin-bottom: 12px; }
.chip {
  background: var(--surface); border: 1px solid var(--border); color: var(--muted);
  padding: 6px 12px; border-radius: 20px; font-size: 0.8rem; white-space: nowrap;
}
.chip.active { background: var(--blue); color: #fff; border-color: var(--blue); }

.fort-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 10px; font-size: 0.85rem; }
.fort-item {
  background: var(--bg); padding: 8px 10px; border-radius: 8px;
  border: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between;
}
.cm-code {
  display: inline-block; background: var(--bg); border: 1px dashed var(--gold);
  color: var(--gold); padding: 6px 14px; border-radius: 8px;
  font-family: monospace; font-size: 0.95rem; margin-top: 10px;
}
.section-header { display: flex; justify-content: space-between; align-items: center; margin: 18px 0 10px 0; }
.section-header h3 { margin: 0; font-size: 0.95rem; text-transform: uppercase; letter-spacing: 0.6px; color: var(--muted); }
.hidden { display: none !important; }

/* ==========================================================================
   SECTOR ATLAS HOLOLITH MAP & 3-WAY PARALLEL HEGEMONY TRACKER
   ========================================================================== */
.hololith-map-wrap {
  background: radial-gradient(circle at 50% 45%, #161b26 0%, #090b10 85%);
  border: 1px solid #30363d;
  border-radius: 10px;
  padding: 14px;
  margin-bottom: 18px;
  box-shadow: inset 0 0 40px rgba(0, 0, 0, 0.85), 0 4px 20px rgba(0, 0, 0, 0.5);
  position: relative;
  overflow: hidden;
}

.hololith-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px dashed rgba(245, 176, 65, 0.25);
  font-size: 0.78rem;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.hololith-legend {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  font-size: 0.75rem;
}

.legend-dot {
  display: inline-block;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  margin-right: 4px;
  vertical-align: middle;
}

.sector-svg {
  width: 100%;
  height: auto;
  max-height: 440px;
  display: block;
  user-select: none;
}

.map-supply-line {
  stroke: #30363d;
  stroke-width: 2.5;
  stroke-dasharray: 6 6;
  transition: stroke 0.25s ease;
}

.map-supply-line.active-line {
  stroke: rgba(245, 176, 65, 0.65);
  stroke-dasharray: none;
}

.map-node-group {
  cursor: pointer;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.map-node-group:hover .node-outer-ring {
  stroke-width: 3.5;
  filter: drop-shadow(0 0 8px rgba(245, 176, 65, 0.7));
}

.map-node-group.selected-node .node-selection-reticle {
  opacity: 1;
}

.node-selection-reticle {
  opacity: 0;
  stroke: #f5b041;
  stroke-width: 2;
  stroke-dasharray: 5 4;
  fill: none;
  transition: opacity 0.2s ease;
}

.liberation-inspector {
  background: rgba(22, 27, 34, 0.94);
  border: 1px solid #f5b041;
  border-radius: 8px;
  padding: 16px;
  margin-top: 12px;
}

.heg-race-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 12px 0;
  background: rgba(13, 17, 23, 0.75);
  padding: 10px 12px;
  border-radius: 6px;
  border: 1px solid #21262d;
}

.heg-row {
  display: grid;
  grid-template-columns: 175px 1fr 68px;
  align-items: center;
  gap: 10px;
  font-size: 0.8rem;
}

@media (max-width: 600px) {
  .heg-row {
    grid-template-columns: 1fr;
    gap: 4px;
  }
}

.heg-seg-track {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
  height: 12px;
}

.heg-seg {
  background: #161b22;
  border: 1px solid #30363d;
  border-radius: 2px;
  transition: all 0.2s ease;
}

.heg-seg.active-alpha {
  background: linear-gradient(90deg, #1f6feb, #58a6ff);
  border-color: #79c0ff;
  box-shadow: 0 0 6px rgba(88, 166, 255, 0.45);
}

.heg-seg.active-beta {
  background: linear-gradient(90deg, #b87d14, #f5b041);
  border-color: #ffd280;
  box-shadow: 0 0 6px rgba(245, 176, 65, 0.45);
}

.heg-seg.active-horde {
  background: linear-gradient(90deg, #a91d2a, #ff4757);
  border-color: #ff7b72;
  box-shadow: 0 0 6px rgba(255, 71, 87, 0.45);
}

.heg-seg.unknown-fog {
  background: repeating-linear-gradient(
    45deg,
    #161b22,
    #161b22 4px,
    #2d223b 4px,
    #2d223b 8px
  );
  border-color: #6e40aa;
  opacity: 0.75;
}

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

@media (max-width: 600px) {
  .grid-2 {
    grid-template-columns: 1fr;
  }
}

.rule-box {
  background: var(--surface-alt);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px 14px;
}

.terminal-link-btn {
  flex: 1;
  display: block;
  text-align: center;
  text-decoration: none;
  background: linear-gradient(135deg, #ff4757 0%, #b81929 100%);
  color: #fff;
  font-weight: 700;
  padding: 15px;
  border-radius: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 4px 16px rgba(255, 71, 87, 0.35);
  transition: transform 0.15s ease, filter 0.15s ease;
}
.terminal-link-btn:hover {
  filter: brightness(1.1);
  transform: translateY(-1px);
}
.terminal-link-btn.alt {
  background: linear-gradient(135deg, #9d5cff 0%, #6b2cf5 100%);
  box-shadow: 0 4px 16px rgba(157, 92, 255, 0.35);
}

.lock-toggle-btn {
  background: #262c40;
  color: #fff;
  border: 1px solid var(--border);
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
  transition: background 0.15s ease;
}
.lock-toggle-btn:hover {
  background: #343b54;
}

/* ==========================================================================
   FULLSCREEN HOLOLITH MODAL & MOBILE ZOOM CONTROLS
   ========================================================================== */
.auspex-map-frame {
  background: #050a08;
  border: 1px solid #1f3a2e;
  border-radius: 14px;
  padding: 10px;
  margin-top: 14px;
  box-shadow: inset 0 0 60px rgba(0, 0, 0, 0.95);
  transition: all 0.25s ease;
  position: relative;
}

.auspex-map-viewport {
  width: 100%;
  overflow: auto;
  -webkit-overflow-scrolling: touch;
  border-radius: 8px;
}

.auspex-map-viewport svg {
  width: 100%;
  height: auto;
  min-width: 680px;
  display: block;
  font-family: 'Segoe UI', Roboto, monospace;
  user-select: none;
  transition: width 0.2s ease;
}

/* Zoom levels for mobile & desktop inspection */
.auspex-map-viewport.zoom-1x svg { width: 100%; min-width: 720px; }
.auspex-map-viewport.zoom-15x svg { width: 155%; min-width: 1100px; }
.auspex-map-viewport.zoom-22x svg { width: 220%; min-width: 1550px; }

/* Fullscreen Theatre Mode */
.auspex-map-frame.hololith-fullscreen {
  position: fixed;
  inset: 0;
  z-index: 9999;
  margin: 0;
  border-radius: 0;
  border: 2px solid #10b981;
  background: #030706;
  display: flex;
  flex-direction: column;
  padding: 12px 16px;
  height: 100dvh;
  width: 100vw;
  box-sizing: border-box;
}

.auspex-map-frame.hololith-fullscreen .auspex-map-viewport {
  flex: 1;
  display: flex;
  align-items: safe center;
  justify-content: safe center;
  border: 1px solid rgba(16, 185, 129, 0.25);
  background: #06100d;
}

.auspex-map-frame.hololith-fullscreen .auspex-map-viewport.zoom-1x svg {
  width: auto;
  height: 100%;
  max-height: calc(100dvh - 155px);
  max-width: 100%;
  min-width: 680px;
}

.auspex-toolbar-btn {
  background: rgba(16, 185, 129, 0.14);
  border: 1px solid #10b981;
  color: #a7f3d0;
  font-family: monospace;
  font-size: 0.74rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.auspex-toolbar-btn:hover,
.auspex-toolbar-btn.active {
  background: #10b981;
  color: #04130d;
}

/* Briefing Shell & Bottom Navigation Constraints */
.briefing-shell {
  max-width: 1040px;
  margin: 0 auto;
  padding: 16px;
  width: 100%;
}

.btn-row {
  display: flex;
  gap: 14px;
  margin-top: 24px;
  flex-wrap: wrap;
  justify-content: center;
  width: 100%;
}

.btn-row .terminal-link-btn {
  max-width: 480px;
  min-width: 260px;
}

/* Fullscreen Auspex Interactive Telemetry HUD */
.auspex-fullscreen-hud {
  position: absolute;
  bottom: 12px;
  left: 16px;
  right: 16px;
  background: rgba(5, 12, 9, 0.94);
  border: 1px solid #10b981;
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
  font-family: monospace;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 2px 7px;
  border-radius: 4px;
  background: rgba(16, 185, 129, 0.18);
  color: #86efac;
  border: 1px solid rgba(16, 185, 129, 0.35);
}

.fs-dominance-pill {
  display: inline-flex;
  align-items: center;
  font-family: monospace;
  font-size: 0.74rem;
  font-weight: 700;
  padding: 2px 9px;
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
  font-family: monospace;
  font-size: 0.72rem;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.fs-pill-btn:hover,
.fs-pill-btn.active {
  background: #10b981;
  color: #050a08;
  border-color: #10b981;
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
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 0.82rem;
  line-height: 1.5;
  color: #d1fae5;
  margin-bottom: 10px;
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
  padding: 6px 10px;
}

.fs-heg-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.76rem;
  margin-bottom: 4px;
  color: #a7f3d0;
}

.fs-heg-bar {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 3px;
  height: 9px;
}
````

---

## File: `package.json` <a id="file-packagejson"></a>

````json
{
  "name": "fires-of-armageddon",
  "version": "1.0.0",
  "description": "Warhammer 40,000 Horde Mode Suite // Spawner, PvP Wastes, Rogue AI Sector & Rosters",
  "scripts": {
    "test": "node --test \"tests/**/*.test.js\"",
    "bundle": "node scripts/generate_bundles.js"
  },
  "keywords": [
    "warhammer-40k",
    "horde-mode",
    "tabletop-companion"
  ],
  "author": "",
  "license": "MIT"
}
````

---

## File: `wrangler.jsonc` <a id="file-wranglerjsonc"></a>

````json
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "armageddon-vox",
  "compatibility_date": "2026-10-19",
  "assets": {
    "directory": "."
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

---

## File: `README.md` <a id="file-readmemd"></a>

````markdown
# ⚔️ Fires of Armageddon // Warhammer 40,000 Horde Mode Suite

A web-based mission runner, dynamic spawner, and companion suite designed for cooperative and solo Warhammer 40k Horde Mode battles, 1v1 Ash Wastes PvP skirmishes, and narrative campaign tracking.

---

## 🎮 Game Modes & Features

- **🧟 Mode 1: Horde Command & Spawner (`index.html`)**  
  Automated horde spawning with seed-synchronized zone generation, wave escalation mechanics, misery card deck management, and faction-specific tactical rules.

- **⚔️ Mode 2: 1v1 Ash Wastes PvP (`pages/pvp.html`)**  
  Competitive wasteland skirmish rules, hazardous environmental effects, dynamic primary and secondary objectives.

- **🎲 Mode 3: Rogue Sector & AI Tracker (`pages/rogue.html`)**  
  Co-op and solo automated AI decision engine, behavioral priority trees, and target acquisition rules for non-player units.

- **🎖️ Rosters & Nemesis Ledger (`pages/roster.html`)**  
  Enemy roster configurations across threat brackets, nemesis tracking, loadout customization, and local persistence.

- **📜 Briefings, Ship & Atlas (`pages/briefing.html`)**  
  Interactive planetary atlas, narrative lore briefings, campaign progression logs, and orbital command support assets.

---

## 📂 Repository Structure

- `index.html` — Root entry point (Mode 1: Horde Command & Spawner).
- `pages/` — Suite HTML views (`briefing.html`, `pvp.html`, `rogue.html`, `roster.html`).
- `bundles/` — Modular Markdown ingestion bundles per page (`bundle_index.md`, `bundle_briefing.md`, etc.) and CSS/packages (`bundle_css_packages.md`).
- `assets/` — Static icons and vector assets (`favicon.svg`, `favicon.png`).
- `css/` — Shared application stylesheets (`style.css`).
- `js/` — Modular client-side logic (`data.js`, `rng.js`, `spawner.js`, `app.js`).
- `scripts/` — Utility generators (`generate_bundles.js`).
- `tests/` — Automated Node test suites mirroring `js/` (`tests/js/`) and UI boundary tests (`tests/ui/`).

---

## 🚀 Deployment & Hosting

Designed for static hosting on **Cloudflare Pages** (unlimited free bandwidth and automated builds from private Git repository) or any static web host.

---

## 💻 Tech Stack

- Zero-dependency client-side architecture (HTML5, Modern CSS, Vanilla JavaScript).
- Fully responsive and optimized for tablet and mobile play at the tabletop.
- Instant, deterministic seed generator for synchronized multi-player spawning.
````

---

## File: `AGENTS.md` <a id="file-agentsmd"></a>

````markdown
# Engineering Principles // AGENTS.md

To ensure that our codebase—whether written by human developers or autonomous AI agents (such as Google Antigravity, OPSX, and automated coding assistants)—remains cohesive, testable, maintainable, and simple, we adopt foundational, non-negotiable engineering principles.

These principles MUST guide any and all new implementations, refactoring, or modifications in this repository.

## I. Everything in English
The entire repository MUST **STRICTLY** be in English. This includes, but is not limited to: documentation, specifications, architecture notes, code comments, function names, class and module names, UI labels, test descriptions, and variable names. No foreign-language identifiers or comments are permitted.

## II. Independent Components (Feature-First & Modular Architecture)
Every feature MUST be built in a modular fashion.
- Components, modules, and utilities must be self-contained, independently testable, and clearly documented.
- Avoid creating empty wrapper classes, components, or functions that exist solely for superficial organizational purposes; every component must have a clear functional responsibility.
- Do not mix business rules or core state logic into monolithic UI files. Maintain a clean separation of concerns (e.g., pure logic, algorithms, and data structures separated from DOM rendering and user interaction).

## III. 100% Test Coverage Target
Any submitted change must strive for and target 100% test coverage (covering unit, integration, and UI component paths). This standard is non-negotiable.

## IV. Test-First Imperative (TDD)
Test-Driven Development (TDD) is **mandatory** and non-negotiable.
- ANY production logic or UI module MUST have a corresponding test suite file in the `tests/` directory, **strictly mirroring the directory structure of the source** (e.g., `js/<module>.js` MUST have `tests/js/<module>.test.js`, and UI/integration tests must live in `tests/ui/`).
- Tests MUST be written and executed first (and must initially fail) before starting any production code implementation.
- The Red-Green-Refactor cycle must be strictly followed for every new feature, rule addition, or logical unit introduced.

## V. Boundary and UI/Integration Tests First
Prioritize testing system boundaries, component interfaces, and integration flows before descending into irrelevant internal implementation details.
- Component, UI, and integration tests MUST be prioritized to validate realistic end-to-end user workflows.
- This guarantees the integrity of the user interface as a cohesive whole and ensures that visual, functional, and user-facing requirements are satisfied right from the start of development.

## VI. Simplicity and Anti-Abstraction
Code MUST be simple, declarative, and effortless to comprehend.
- Avoid premature abstractions, speculative generality, and "clever" code (unnecessary cognitive overhead).
- Follow the golden rule: *"A little duplication is far better than the wrong abstraction."*
- Concurrently, practice prudent DRY (Don't Repeat Yourself): avoid repetitive boilerplate when it can be abstracted in an obvious, simple manner for straightforward reuse.

## VII. Continuous and Comprehensive Documentation
Clean code does NOT substitute for thorough technical documentation.
- All implementations MUST be well-documented using structured docstrings / JSDoc blocks (`/** ... */`) across functions, classes, and modules, articulating *the why* (intent and architectural rationale) and not merely *the what* (the raw mechanical action).
- Every new module, capability, or architectural change MUST be reflected with improvements and updates in the relevant `README.md` and documentation files.
- Documentation is a living artifact and an inseparable part of delivering software value.

## VIII. Modular Codebase Bundles Synchronization (`/bundles/` Directory)
Any and all changes made to the codebase (files added, modified, renamed, or deleted) MUST immediately and continuously be reflected in the modular markdown bundles in `/bundles/` via `npm run bundle` / `node scripts/generate_bundles.js`.
- The `/bundles` directory provides modular, page-by-page and component-focused ingestion artifacts for Gemini Notebook and NotebookLM (`bundle_index.md`, `bundle_briefing.md`, `bundle_pvp.md`, `bundle_rogue.md`, `bundle_roster.md`, and `bundle_css_packages.md`).
- Each bundle maintains an up-to-date Table of Contents with working anchor links to its constituent project files.
- All code fences in each bundle MUST use quadruple backticks (` ````lang `) to prevent formatting conflicts with nested code blocks or Markdown documentation.
- No task, commit, or pull request is considered complete until all modular bundles in `/bundles/` have been regenerated, verified, and kept in sync with the current repository state.

---
> **Note for Autonomous Agents**: You are strictly required to treat this document as the highest-priority directive when planning architecture, suggesting refactoring, or implementing new routines and features (including operations performed via Google Antigravity, OPSX, or autonomous workflows). **Whenever you create, modify, or delete any file in the repository, you MUST regenerate and synchronize the modular `/bundles/` directory before concluding your turn.**
````

---

## File: `.gitignore` <a id="file-gitignore"></a>

````gitignore
# OS metadata
.DS_Store
Thumbs.db
desktop.ini

# Editor files
.vscode/
.idea/
*.swp
*.swo

# Node / Scratch
node_modules/
*.log
.wrangler/
````
