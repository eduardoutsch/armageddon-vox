# 📦 Fires of Armageddon // Bundle: Mode 5 - Crusade Command Stylesheet

Crusade tab styling, parchment containers, and narrative tree layouts (`css/crusade.css`).

## 📑 Table of Contents
- [css/crusade.css](#file-csscrusadecss)

---

## File: `css/crusade.css` <a id="file-csscrusadecss"></a>

````css
/**
 * Fires of Armageddon // Crusade Command & Quartermaster Stylesheet
 * Custom CSS for 3-Way Alliance Scoreboard, Random Upgrade Rollers,
 * Astra Militarum Logistics Allocator, Necron Tomb Awakening Matrix,
 * and Master Astropathic Dossier telemetry displays.
 */

.scoreboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 14px;
  margin-bottom: 20px;
}

.stat-card-centered {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.stat-card-centered .hud-val-row,
#tombMatrixGrid .hud-val-row,
#logisticsAllocatorGrid .hud-val-row {
  justify-content: center;
}

.choice-grid {
  align-items: end;
}

.choice-grid > div:not(.choice-card):not(.card) {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.choice-grid select,
.choice-grid input[type="text"] {
  height: 42px;
  box-sizing: border-box;
}

.alliance-score-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-top: 4px solid var(--gold);
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.4);
}

.alliance-score-card.beta-card { border-top-color: var(--blue); }
.alliance-score-card.horde-card { border-top-color: var(--red); }

.roller-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
}

.roller-card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  box-shadow: 0 8px 24px rgba(0,0,0,0.35);
}

.dice-result-box {
  background: #07090e;
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 12px 14px;
  margin: 12px 0;
  min-height: 92px;
  font-size: 0.88rem;
  line-height: 1.5;
}

.dice-pip-badge {
  display: inline-block;
  background: var(--gold);
  color: #000;
  font-family: monospace;
  font-weight: 900;
  font-size: 0.85rem;
  padding: 2px 8px;
  border-radius: 5px;
  margin-right: 6px;
}

.queued-item-pill {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  background: #0b0d13;
  border: 1px solid var(--border);
  border-left: 3px solid var(--gold);
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 8px;
  font-size: 0.85rem;
}

.master-dossier-preview {
  background: #030805;
  border: 1.5px dashed rgba(0, 255, 136, 0.45);
  border-radius: 10px;
  padding: 15px;
  font-family: 'Courier New', Consolas, monospace;
  font-size: 0.84rem;
  color: #66ffb8;
  text-shadow: 0 0 6px rgba(0, 255, 136, 0.35);
  white-space: pre-wrap;
  line-height: 1.52;
  margin: 14px 0;
}

.logistics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(205px, 1fr));
  gap: 14px;
  margin-top: 12px;
}

.logistics-card {
  background: #090b10;
  border: 1.5px solid var(--border);
  border-radius: 12px;
  padding: 14px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.logistics-card.state-surplus {
  border-color: var(--green);
  box-shadow: 0 0 14px rgba(46, 160, 67, 0.2);
}

.logistics-card.state-deficiency {
  border-color: var(--red);
  box-shadow: 0 0 14px rgba(255, 71, 87, 0.2);
}

/* ========================================================================= */
/* FACTION-LOCKED CRUSADE TABS (TOUR OF DUTY = MILITARUM, TOMB = NECRON)     */
/* ========================================================================= */
#cruTabBtn3.active,
body.theme-necron #cruTabBtn3.active {
  background: linear-gradient(135deg, rgba(212, 163, 73, 0.24) 0%, rgba(28, 25, 22, 0.96) 100%) !important;
  color: #f5c96a !important;
  border-color: #d4a349 !important;
  box-shadow: 0 0 14px rgba(212, 163, 73, 0.25), inset 0 0 12px rgba(212, 163, 73, 0.2) !important;
}

#cruTabBtn4.active,
body.theme-militarum #cruTabBtn4.active {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.28) 0%, rgba(4, 24, 18, 0.96) 100%) !important;
  color: #6ee7b7 !important;
  border-color: #10b981 !important;
  box-shadow: 0 0 16px rgba(16, 185, 129, 0.28), inset 0 0 12px rgba(16, 185, 129, 0.16) !important;
}

#cruTabTour,
body.theme-necron #cruTabTour {
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
  --green: #10b981;
  --blue: #3b82f6;
  --clip-card: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%);
}

body.theme-necron #cruTabTour .card {
  background: var(--surface);
  border-color: var(--border);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.03);
}

body.theme-necron #cruTabTour .launch-btn,
body.theme-necron #cruTabTour .btn-red {
  background: linear-gradient(180deg, #d83140 0%, #991a24 100%);
  border-color: #ef3e4a;
  color: #fff;
  box-shadow: 0 4px 18px rgba(204, 41, 54, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.2);
}
````
