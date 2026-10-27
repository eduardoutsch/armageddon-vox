# 📦 Fires of Armageddon // Bundle: Briefings Stylesheet

Auspex CRT styling, SVG sector atlas glow tokens, and responsive ship telemetry layout (`css/briefing.css`).

## 📑 Table of Contents
- [css/briefing.css](#file-cssbriefingcss)

---

## File: `css/briefing.css` <a id="file-cssbriefingcss"></a>

````css
/* =========================================================================
   FIRES OF ARMAGEDDON // BRIEFINGS, SHIP SLIDER & SECTOR ATLAS STYLES
   Modular styling for pages/briefing.html
   ========================================================================= */

/* SHIP.MD READ-ONLY STATUS GAUGE INSIDE ALPHA TAB */
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
  pointer-events: none;
  /* Strictly non-interactable status gauge */
  text-align: center;
  color: var(--muted);
  opacity: 0.45;
}

.slider-node .val {
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

.telemetry-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
  gap: 12px;
  margin-top: 12px;
}

.telemetry-box {
  background: #090b10;
  border: 1px solid var(--border);
  border-top: 2px solid var(--gold);
  border-radius: 10px;
  padding: 12px 14px;
  font-size: 0.84rem;
  line-height: 1.5;
}

.chronicle-pillar {
  background: #090b10;
  border: 1px solid var(--border);
  border-left: 3px solid var(--gold);
  border-radius: 10px;
  padding: 12px 14px;
  margin-bottom: 10px;
  font-size: 0.88rem;
  line-height: 1.55;
}

/* =========================================================================
   NECRON TOMB-SHIP THEME // LORD COMMANDER JUNEBUG (#btnBeta & #dossierBeta)
   Aesthetic: Noctolith Obsidian, Living Metal Silver, Octagonal Cartouche
              & Animated Gauss Emerald / Tesseract Conduits
   ========================================================================= */
@keyframes necronGaussPulse {
  0%, 100% {
    box-shadow: 0 0 16px rgba(16, 185, 129, 0.38), inset 0 0 10px rgba(52, 211, 153, 0.22);
  }
  50% {
    box-shadow: 0 0 26px rgba(52, 211, 153, 0.65), inset 0 0 18px rgba(16, 185, 129, 0.36);
  }
}

body.necron-briefing-active {
  --side-glow-line: rgba(16, 185, 129, 0.85);
  --side-glow-bloom: rgba(16, 185, 129, 0.38);
  --side-glow-deep: rgba(4, 120, 87, 0.14);
  --corner-glow-core: rgba(16, 185, 129, 0.24);
  --corner-glow-bloom: rgba(5, 150, 105, 0.10);
  --corner-glow-deep: rgba(6, 78, 59, 0.03);
  background-color: #030807;
  background-image:
    repeating-linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.28) 0px,
      rgba(0, 0, 0, 0.28) 1px,
      transparent 1px,
      transparent 4px
    ),
    linear-gradient(90deg, rgba(16, 185, 129, 0.035) 1px, transparent 1px),
    linear-gradient(0deg, rgba(16, 185, 129, 0.035) 1px, transparent 1px),
    radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.22) 0%, transparent 58%),
    radial-gradient(circle at 75% 80%, rgba(6, 182, 212, 0.09) 0%, transparent 50%);
  background-size: 100% 100%, 44px 44px, 44px 44px, 100% 100%, 100% 100%;
}

body.necron-briefing-active .suite-nav {
  background: linear-gradient(180deg, #05110e 0%, #020706 100%);
  border-bottom-color: rgba(16, 185, 129, 0.45);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.9), 0 1px 14px rgba(16, 185, 129, 0.15);
}

body.necron-briefing-active .suite-link {
  background: rgba(5, 18, 15, 0.8);
  border-color: rgba(16, 185, 129, 0.24);
}

body.necron-briefing-active .suite-link.active {
  color: #6ee7b7;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.26) 0%, rgba(4, 24, 19, 0.95) 100%);
  border-color: var(--green);
  box-shadow: inset 0 0 12px rgba(16, 185, 129, 0.25), 0 0 10px rgba(16, 185, 129, 0.2);
}

body.necron-briefing-active .nav-pills {
  background: #040d0b;
  border-color: rgba(16, 185, 129, 0.4);
  box-shadow: 0 0 24px rgba(16, 185, 129, 0.12), inset 0 0 16px rgba(0, 0, 0, 0.85);
}

body.necron-briefing-active .terminal-link-btn {
  background: linear-gradient(180deg, #064e3b 0%, #022c22 100%);
  border-color: rgba(52, 211, 153, 0.55);
  color: #ecfdf5;
  box-shadow: 0 4px 16px rgba(16, 185, 129, 0.22);
}

body.necron-briefing-active .terminal-link-btn:hover {
  border-color: #6ee7b7;
  box-shadow: 0 6px 20px rgba(16, 185, 129, 0.38);
}

#btnBeta:hover {
  color: #6ee7b7;
  border-color: rgba(16, 185, 129, 0.55);
  background: rgba(6, 26, 21, 0.75);
}

#btnBeta.active {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.28) 0%, rgba(4, 18, 15, 0.96) 100%);
  color: #6ee7b7;
  border-color: var(--green);
  box-shadow: inset 0 0 14px rgba(16, 185, 129, 0.28), 0 0 12px rgba(16, 185, 129, 0.2);
  text-shadow: 0 0 8px rgba(16, 185, 129, 0.45);
}

.necron-ankh-divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin: 4px auto 12px auto;
  max-width: 340px;
  color: #34d399;
  font-size: 1.05rem;
  letter-spacing: 3px;
  text-shadow: 0 0 10px rgba(16, 185, 129, 0.75);
  user-select: none;
}

.necron-ankh-divider span {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(52, 211, 153, 0.75), transparent);
  box-shadow: 0 0 6px rgba(16, 185, 129, 0.5);
}

#dossierBeta .hero-card {
  clip-path: polygon(16px 0, calc(100% - 16px) 0, 100% 16px, 100% calc(100% - 16px), calc(100% - 16px) 100%, 16px 100%, 0 calc(100% - 16px), 0 16px);
  background:
    radial-gradient(circle at 50% 0%, rgba(16, 185, 129, 0.20) 0%, transparent 62%),
    repeating-linear-gradient(
      -45deg,
      rgba(16, 185, 129, 0.028) 0px,
      rgba(16, 185, 129, 0.028) 1px,
      transparent 1px,
      transparent 14px
    ),
    linear-gradient(135deg, rgba(5, 20, 17, 0.98) 0%, rgba(3, 9, 11, 0.99) 100%);
  border: 1px solid rgba(16, 185, 129, 0.6);
  border-top: 2px solid #34d399;
  border-bottom: 3px solid #020806;
  box-shadow: 0 16px 42px rgba(0, 0, 0, 0.9), 0 0 28px rgba(16, 185, 129, 0.16), inset 0 0 32px rgba(16, 185, 129, 0.09);
}

#dossierBeta .hero-card::after {
  content: "";
  position: absolute;
  top: 0;
  left: 26%;
  width: 48%;
  height: 3px;
  background: linear-gradient(90deg, transparent, #34d399, #a7f3d0, #34d399, transparent);
  box-shadow: 0 0 16px #10b981;
  pointer-events: none;
}

#dossierBeta .hero-card::before,
#dossierBeta .card::before {
  border: 1px solid rgba(16, 185, 129, 0.22);
  box-shadow: inset 0 0 14px rgba(16, 185, 129, 0.05);
}

#dossierBeta .hero-title {
  background: linear-gradient(135deg, #ecfdf5 0%, #34d399 50%, #2dd4bf 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 18px rgba(16, 185, 129, 0.4);
  letter-spacing: 2px;
}

#dossierBeta .status-pill {
  background: rgba(16, 185, 129, 0.16);
  color: #6ee7b7;
  border: 1px solid rgba(52, 211, 153, 0.6);
  box-shadow: 0 0 14px rgba(16, 185, 129, 0.24), inset 0 0 8px rgba(16, 185, 129, 0.14);
}

#dossierBeta code {
  background: rgba(6, 78, 59, 0.38);
  color: #6ee7b7;
  border: 1px solid rgba(52, 211, 153, 0.48);
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.18);
}

#gateBeta .unlock-btn {
  background: linear-gradient(135deg, #10b981 0%, #047857 55%, #064e3b 100%);
  color: #ecfdf5;
  border: 1px solid #34d399;
  border-bottom: 4px solid #022c22;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.65);
  animation: necronGaussPulse 3.2s infinite ease-in-out;
}

#gateBeta .unlock-btn:hover {
  border-color: #a7f3d0;
  box-shadow: 0 10px 30px rgba(16, 185, 129, 0.55), inset 0 0 16px rgba(167, 243, 208, 0.35);
}

#dossierBeta .lock-toggle-btn {
  border-color: rgba(16, 185, 129, 0.48);
  color: #6ee7b7;
  background: rgba(5, 20, 17, 0.85);
}

#dossierBeta .lock-toggle-btn:hover {
  border-color: #34d399;
  color: #ecfdf5;
  box-shadow: 0 0 12px rgba(16, 185, 129, 0.28);
}

#dossierBeta .card {
  clip-path: polygon(14px 0, calc(100% - 14px) 0, 100% 14px, 100% calc(100% - 14px), calc(100% - 14px) 100%, 14px 100%, 0 calc(100% - 14px), 0 14px);
  background:
    linear-gradient(90deg, rgba(16, 185, 129, 0.02) 1px, transparent 1px),
    linear-gradient(0deg, rgba(16, 185, 129, 0.02) 1px, transparent 1px),
    linear-gradient(180deg, #061311 0%, #03090a 100%);
  background-size: 28px 28px, 28px 28px, 100% 100%;
  border-color: rgba(16, 185, 129, 0.32);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.82), inset 0 0 20px rgba(16, 185, 129, 0.06);
}

#dossierBeta .choice-grid .card {
  background: linear-gradient(180deg, #05100f 0%, #030809 100%) !important;
  border-color: rgba(16, 185, 129, 0.28);
}

#dossierBeta .section-header {
  border-bottom-color: rgba(16, 185, 129, 0.32);
}

#dossierBeta .section-header h3 {
  color: #34d399;
  text-shadow: 0 0 10px rgba(16, 185, 129, 0.28);
}

#dossierBeta .lore-quote {
  background:
    repeating-linear-gradient(
      0deg,
      rgba(16, 185, 129, 0.028) 0px,
      rgba(16, 185, 129, 0.028) 1px,
      transparent 1px,
      transparent 3px
    ),
    rgba(2, 9, 8, 0.94);
  border: 1px solid rgba(16, 185, 129, 0.26);
  border-left: 4px solid var(--green);
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.9);
}

#dossierBeta .telemetry-box {
  background: linear-gradient(180deg, #05110f 0%, #030809 100%);
  border-color: rgba(16, 185, 129, 0.28);
  box-shadow: inset 0 0 16px rgba(16, 185, 129, 0.07);
}

#dossierBeta .slider-node {
  background: #040c0b;
  border-color: rgba(16, 185, 129, 0.28);
  color: #64748b;
  opacity: 0.72;
}

#dossierBeta #betaNode-3,
#dossierBeta #betaNode-2 {
  background: linear-gradient(180deg, rgba(45, 10, 16, 0.78) 0%, rgba(12, 4, 6, 0.95) 100%);
  border-color: rgba(239, 68, 68, 0.42);
  color: #fca5a5;
}

#dossierBeta #betaNode0 {
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.82) 0%, rgba(7, 11, 20, 0.95) 100%);
  border-color: rgba(148, 163, 184, 0.38);
  color: #94a3b8;
}

#dossierBeta #betaNode1,
#dossierBeta #betaNode2,
#dossierBeta #betaNode3 {
  background: linear-gradient(180deg, rgba(6, 34, 38, 0.8) 0%, rgba(4, 12, 16, 0.95) 100%);
  border-color: rgba(45, 212, 191, 0.42);
  color: #5eead4;
}

#dossierBeta .slider-node.active-brig {
  background: linear-gradient(180deg, rgba(16, 185, 129, 0.32) 0%, rgba(6, 78, 59, 0.55) 100%);
  border-color: #34d399;
  color: #ecfdf5;
  opacity: 1;
  animation: necronGaussPulse 3s infinite ease-in-out;
}

#dossierBeta #betaSliderDetailBox {
  background: linear-gradient(135deg, rgba(4, 18, 15, 0.96) 0%, rgba(3, 9, 11, 0.98) 100%) !important;
  border: 1px solid rgba(16, 185, 129, 0.45);
  border-left: 4px solid var(--green);
}

#dossierBeta details {
  background: #040b0a;
  border-color: rgba(16, 185, 129, 0.35);
}

#dossierBeta details summary {
  background: rgba(16, 185, 129, 0.06);
  color: #34d399;
}

#dossierBeta details[open] > summary {
  border-bottom-color: rgba(16, 185, 129, 0.28);
  background: rgba(16, 185, 129, 0.12);
}

#dossierBeta .drawer-body {
  border-top-color: rgba(16, 185, 129, 0.25);
}

#dossierBeta table.reckoning-table th {
  background: #061714;
  color: #34d399;
  border-color: rgba(16, 185, 129, 0.32);
}

#dossierBeta table.reckoning-table td {
  border-color: rgba(16, 185, 129, 0.2);
}

#dossierBeta tr.highlight-row {
  background: rgba(16, 185, 129, 0.18);
  box-shadow: inset 3px 0 0 var(--green);
}

/* =========================================================================
   LEAGUES OF VOTANN // THE LEDGER OF EMBERS (#btnGamma & #dossierGamma)
   Aesthetic: Deep Tectonic Basalt, Magna-Gold & Warm Hearth Amber
   ========================================================================= */
@keyframes votannHearthPulse {
  0%, 100% {
    box-shadow: 0 0 16px rgba(245, 176, 65, 0.38), inset 0 0 10px rgba(251, 191, 36, 0.22);
  }
  50% {
    box-shadow: 0 0 26px rgba(251, 191, 36, 0.65), inset 0 0 18px rgba(245, 176, 65, 0.36);
  }
}

body.votann-briefing-active {
  --side-glow-line: rgba(245, 176, 65, 0.85);
  --side-glow-bloom: rgba(245, 176, 65, 0.38);
  --side-glow-deep: rgba(194, 65, 12, 0.14);
  --corner-glow-core: rgba(245, 176, 65, 0.24);
  --corner-glow-bloom: rgba(217, 119, 6, 0.10);
  --corner-glow-deep: rgba(124, 45, 18, 0.03);
  background-color: #090603;
  background-image:
    repeating-linear-gradient(
      0deg,
      rgba(0, 0, 0, 0.28) 0px,
      rgba(0, 0, 0, 0.28) 1px,
      transparent 1px,
      transparent 4px
    ),
    linear-gradient(90deg, rgba(245, 176, 65, 0.035) 1px, transparent 1px),
    linear-gradient(0deg, rgba(245, 176, 65, 0.035) 1px, transparent 1px),
    radial-gradient(circle at 50% 0%, rgba(245, 176, 65, 0.22) 0%, transparent 58%),
    radial-gradient(circle at 75% 80%, rgba(194, 65, 12, 0.09) 0%, transparent 50%);
  background-size: 100% 100%, 44px 44px, 44px 44px, 100% 100%, 100% 100%;
}

body.votann-briefing-active .suite-nav {
  background: linear-gradient(180deg, #160e05 0%, #080502 100%);
  border-bottom-color: rgba(245, 176, 65, 0.45);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.9), 0 1px 14px rgba(245, 176, 65, 0.15);
}

body.votann-briefing-active .suite-link {
  background: rgba(26, 16, 5, 0.8);
  border-color: rgba(245, 176, 65, 0.24);
}

body.votann-briefing-active .suite-link.active {
  color: #fde68a;
  background: linear-gradient(135deg, rgba(245, 176, 65, 0.26) 0%, rgba(38, 20, 4, 0.95) 100%);
  border-color: #f5b041;
  box-shadow: inset 0 0 12px rgba(245, 176, 65, 0.25), 0 0 10px rgba(245, 176, 65, 0.2);
}

body.votann-briefing-active .nav-pills {
  background: #0d0803;
  border-color: rgba(245, 176, 65, 0.4);
  box-shadow: 0 0 24px rgba(245, 176, 65, 0.12), inset 0 0 16px rgba(0, 0, 0, 0.85);
}

body.votann-briefing-active .terminal-link-btn {
  background: linear-gradient(180deg, #9a3412 0%, #431407 100%);
  border-color: rgba(251, 191, 36, 0.55);
  color: #fffbeb;
  box-shadow: 0 4px 16px rgba(245, 176, 65, 0.22);
}

body.votann-briefing-active .terminal-link-btn:hover {
  border-color: #fde68a;
  box-shadow: 0 6px 20px rgba(245, 176, 65, 0.38);
}

#cardBriefGamma.active {
  background: linear-gradient(135deg, rgba(66, 32, 6, 0.76) 0%, rgba(26, 14, 3, 0.96) 100%);
  border-color: #f5b041;
  box-shadow: 0 0 22px rgba(245, 176, 65, 0.35), inset 0 0 14px rgba(245, 176, 65, 0.16);
}

#cardBriefGamma.active .conduit-title {
  color: #fbbf24;
  text-shadow: 0 0 10px rgba(245, 176, 65, 0.45);
}

#btnGamma:hover {
  color: #fde68a;
  border-color: rgba(245, 176, 65, 0.55);
  background: rgba(38, 22, 6, 0.75);
}

#btnGamma.active {
  background: linear-gradient(135deg, rgba(245, 176, 65, 0.28) 0%, rgba(30, 16, 4, 0.96) 100%);
  color: #fde68a;
  border-color: #f5b041;
  box-shadow: inset 0 0 14px rgba(245, 176, 65, 0.28), 0 0 12px rgba(245, 176, 65, 0.2);
  text-shadow: 0 0 8px rgba(245, 176, 65, 0.45);
}

#dossierGamma .hero-card {
  clip-path: polygon(16px 0, calc(100% - 16px) 0, 100% 16px, 100% calc(100% - 16px), calc(100% - 16px) 100%, 16px 100%, 0 calc(100% - 16px), 0 16px);
  background:
    radial-gradient(circle at 50% 0%, rgba(245, 176, 65, 0.20) 0%, transparent 62%),
    repeating-linear-gradient(
      -45deg,
      rgba(245, 176, 65, 0.028) 0px,
      rgba(245, 176, 65, 0.028) 1px,
      transparent 1px,
      transparent 14px
    ),
    linear-gradient(135deg, rgba(28, 16, 5, 0.98) 0%, rgba(12, 7, 2, 0.99) 100%);
  border: 1px solid rgba(245, 176, 65, 0.6);
  border-top: 2px solid #fbbf24;
  border-bottom: 3px solid #050301;
  box-shadow: 0 16px 42px rgba(0, 0, 0, 0.9), 0 0 28px rgba(245, 176, 65, 0.16), inset 0 0 32px rgba(245, 176, 65, 0.09);
}

#dossierGamma .hero-card::after {
  content: "";
  position: absolute;
  top: 0;
  left: 26%;
  width: 48%;
  height: 3px;
  background: linear-gradient(90deg, transparent, #fbbf24, #fef08a, #fbbf24, transparent);
  box-shadow: 0 0 16px #f5b041;
  pointer-events: none;
}

#dossierGamma .hero-card::before,
#dossierGamma .card::before {
  border: 1px solid rgba(245, 176, 65, 0.22);
  box-shadow: inset 0 0 14px rgba(245, 176, 65, 0.05);
}

#dossierGamma .hero-title {
  background: linear-gradient(135deg, #fffbeb 0%, #fbbf24 50%, #ea580c 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 2px 18px rgba(245, 176, 65, 0.4);
  letter-spacing: 2px;
}

#dossierGamma .status-pill {
  background: rgba(245, 176, 65, 0.16);
  color: #fde68a;
  border: 1px solid rgba(251, 191, 36, 0.6);
  box-shadow: 0 0 14px rgba(245, 176, 65, 0.24), inset 0 0 8px rgba(245, 176, 65, 0.14);
}

#dossierGamma code {
  background: rgba(124, 45, 18, 0.38);
  color: #fde68a;
  border: 1px solid rgba(251, 191, 36, 0.48);
  box-shadow: 0 0 8px rgba(245, 176, 65, 0.18);
}

#gateGamma .unlock-btn {
  background: linear-gradient(135deg, #d97706 0%, #b45309 55%, #7c2d12 100%);
  color: #fffbeb;
  border: 1px solid #fbbf24;
  border-bottom: 4px solid #431407;
  text-shadow: 0 1px 6px rgba(0, 0, 0, 0.65);
  animation: votannHearthPulse 3.2s infinite ease-in-out;
}

#gateGamma .unlock-btn:hover {
  border-color: #fef08a;
  box-shadow: 0 10px 30px rgba(245, 176, 65, 0.55), inset 0 0 16px rgba(254, 240, 138, 0.35);
}

#dossierGamma .lock-toggle-btn {
  border-color: rgba(245, 176, 65, 0.48);
  color: #fde68a;
  background: rgba(28, 16, 5, 0.85);
}

#dossierGamma .lock-toggle-btn:hover {
  border-color: #fbbf24;
  color: #fffbeb;
  box-shadow: 0 0 12px rgba(245, 176, 65, 0.28);
}

#dossierGamma .card {
  clip-path: polygon(14px 0, calc(100% - 14px) 0, 100% 14px, 100% calc(100% - 14px), calc(100% - 14px) 100%, 14px 100%, 0 calc(100% - 14px), 0 14px);
  background:
    linear-gradient(90deg, rgba(245, 176, 65, 0.02) 1px, transparent 1px),
    linear-gradient(0deg, rgba(245, 176, 65, 0.02) 1px, transparent 1px),
    linear-gradient(180deg, #180e05 0%, #0d0702 100%);
  background-size: 28px 28px, 28px 28px, 100% 100%;
  border-color: rgba(245, 176, 65, 0.32);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.82), inset 0 0 20px rgba(245, 176, 65, 0.06);
}

#dossierGamma .section-header {
  border-bottom-color: rgba(245, 176, 65, 0.32);
}

#dossierGamma .section-header h3 {
  color: #fbbf24;
  text-shadow: 0 0 10px rgba(245, 176, 65, 0.28);
}

#dossierGamma .lore-quote {
  background:
    repeating-linear-gradient(
      0deg,
      rgba(245, 176, 65, 0.028) 0px,
      rgba(245, 176, 65, 0.028) 1px,
      transparent 1px,
      transparent 3px
    ),
    rgba(18, 10, 3, 0.94);
  border: 1px solid rgba(245, 176, 65, 0.26);
  border-left: 4px solid #f5b041;
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.9);
}

#dossierGamma .telemetry-box {
  background: linear-gradient(180deg, #180e05 0%, #0c0702 100%);
  border-color: rgba(245, 176, 65, 0.28);
  box-shadow: inset 0 0 16px rgba(245, 176, 65, 0.07);
}

#dossierGamma details {
  background: #100a03;
  border-color: rgba(245, 176, 65, 0.35);
}

#dossierGamma details summary {
  background: rgba(245, 176, 65, 0.06);
  color: #fbbf24;
}

#dossierGamma details[open] > summary {
  border-bottom-color: rgba(245, 176, 65, 0.28);
  background: rgba(245, 176, 65, 0.12);
}

#dossierGamma .drawer-body {
  border-top-color: rgba(245, 176, 65, 0.25);
}

#dossierGamma table.reckoning-table th {
  background: #201306;
  color: #fbbf24;
  border-color: rgba(245, 176, 65, 0.32);
}

#dossierGamma table.reckoning-table td {
  border-color: rgba(245, 176, 65, 0.2);
}

#dossierGamma tr.highlight-row {
  background: rgba(245, 176, 65, 0.18);
  box-shadow: inset 3px 0 0 #f5b041;
}
````
