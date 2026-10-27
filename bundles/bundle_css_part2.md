# 📦 Fires of Armageddon // Bundle: Tactical Stylesheet (Part 2: Navigation & Cards)

Header tabs, responsive navigation bars, layout grids, and 45-degree chamfered card plasteel silhouettes (`css/style.css` lines 751 to 1450).

## 📑 Table of Contents
- [css/style.css (Part 2: Navigation & Cards, Lines 751-1450)](#file-cssstylecsspart2navigationcardslines7511450)

---

## File: `css/style.css (Part 2: Navigation & Cards, Lines 751-1450)` <a id="file-cssstylecsspart2navigationcardslines7511450"></a>

````css
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

.grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.stat-box {
  background: var(--surface-alt);
  border: 1px solid var(--border);
  clip-path: var(--clip-btn);
  padding: 12px;
  text-align: center;
}

select {
  background: var(--crt-bg);
  color: var(--text);
  border: 1px solid var(--border);
  padding: 9px 12px;
  font-family: var(--font-ui);
  font-size: 0.9rem;
  clip-path: var(--clip-btn);
}
select:focus {
  outline: none;
  border-color: var(--gold);
}

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

/* Cloud Sync Status Pill (Live / Syncing / Offline) */
.cloud-sync-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  font-family: var(--font-mono);
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.6px;
  padding: 3px 8px;
  border-radius: 999px;
  background: rgba(16, 185, 129, 0.14);
  border: 1px solid rgba(16, 185, 129, 0.45);
  color: #6ee7b7;
  white-space: nowrap;
  flex-shrink: 0;
  line-height: 1.2;
  box-sizing: border-box;
  text-decoration: none;
  vertical-align: middle;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.cloud-sync-pill:hover {
  background: rgba(16, 185, 129, 0.22);
  border-color: rgba(16, 185, 129, 0.7);
}

.cloud-sync-pill.offline {
  background: rgba(255, 71, 87, 0.12);
  border-color: rgba(255, 71, 87, 0.45);
  color: #fca5a5;
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

/* ==========================================================================
   MODE 1 SPAWNER, RESUPPLY & TACTICAL INTERACTION COMPONENTS
   ========================================================================== */
.choice-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 16px;
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

@media (max-width: 600px) {
  .choice-grid {
    grid-template-columns: 1fr;
  }
}

.choice-card {
  background: #141210;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  padding: 14px 12px;
  text-align: left;
  cursor: pointer;
  transition: all 0.18s ease;
}

.choice-card:hover {
  border-color: var(--gold);
  transform: translateY(-1px);
}

.choice-card.selected {
  background: rgba(157, 92, 255, 0.12);
  border-color: var(--purple);
  box-shadow: 0 0 18px rgba(157, 92, 255, 0.2);
}

.choice-card.selected-red {
  background: rgba(204, 41, 54, 0.14);
  border-color: var(--red);
  box-shadow: 0 0 18px rgba(204, 41, 54, 0.2);
}

.choice-icon {
  font-size: 1.3rem;
  margin-bottom: 4px;
  display: block;
}

.choice-title {
  font-weight: 700;
  font-size: 0.95rem;
  color: #fff;
  margin-bottom: 2px;
}

.choice-sub {
  font-size: 0.76rem;
  color: var(--muted);
  line-height: 1.35;
}

.rules-strip {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
  margin: 18px 0;
}

.rule-tag {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border);
  color: #a5b0c2;
  font-size: 0.74rem;
  font-family: var(--font-mono);
  padding: 4px 10px;
  border-radius: 4px;
}

.rule-tag strong {
  color: var(--gold);
}

.round-banner {
  background: linear-gradient(180deg, #1a1714 0%, #100e0c 100%);
  border: 1px solid var(--border);
  border-top: 3px solid var(--red);
  clip-path: var(--clip-card);
  padding: 20px 18px;
  margin-bottom: 18px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
}

.round-banner h2 {
  font-size: 1.35rem;
  color: var(--gold-bright);
  margin: 0 0 6px 0;
  text-align: center;
}

.round-banner p {
  color: var(--text);
  font-size: 0.88rem;
  margin: 0 0 14px 0;
  text-align: center;
  max-width: 620px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin: 18px 0 10px 0;
  padding-bottom: 6px;
  border-bottom: 1px dashed var(--border);
}

.section-header h3 {
  margin: 0;
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: var(--gold);
}

.card-title {
  font-size: 1.12rem;
  font-weight: 800;
  color: #fff;
  margin: 6px 0 6px 0;
  letter-spacing: 0.5px;
}

.card-desc {
  font-size: 0.88rem;
  line-height: 1.5;
  color: #d1d5db;
  margin: 0 0 10px 0;
}

.card.resupply {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  border-left-color: var(--green);
}

.card.resupply > div {
  flex: 1;
}

.card.resupply .btn-blue {
  flex-shrink: 0;
}

.card.spawn-zone {
  border-left-color: var(--green);
}

.filter-bar {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding-bottom: 6px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.chip {
  background: var(--surface);
  border: 1px solid var(--border);
  color: var(--muted);
  padding: 6px 14px;
  border-radius: 20px;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s ease;
}

.chip:hover {
  color: var(--text);
  border-color: var(--gold);
}

.chip.active {
  background: rgba(212, 163, 73, 0.22);
  color: var(--gold-bright);
  border-color: var(--gold);
  box-shadow: 0 0 12px rgba(212, 163, 73, 0.25);
}

.fort-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 10px;
  font-size: 0.85rem;
}

.fort-item {
  background: var(--bg);
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-family: var(--font-mono);
  font-size: 0.82rem;
  color: var(--text);
}

.fort-item input[type="checkbox"] {
  accent-color: var(--gold);
  width: 16px;
  height: 16px;
  cursor: pointer;
}

details {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 0;
  margin-bottom: 16px;
  overflow: hidden;
}

summary {
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--gold);
  cursor: pointer;
  user-select: none;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.02);
  transition: all 0.15s ease;
}

summary:hover {
  color: var(--gold-bright);
````
