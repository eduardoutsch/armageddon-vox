# 📦 Fires of Armageddon // Complete Codebase Bundle

All project files compiled into a single document for Gemini / NotebookLM ingestion.

## 📑 Table of Contents
- [package.json](#file-packagejson)
- [wrangler.jsonc](#file-wranglerjsonc)
- [.gitignore](#file-gitignore)
- [README.md](#file-readmemd)
- [AGENTS.md](#file-agentsmd)
- [index.html](#file-indexhtml)
- [pages/briefing.html](#file-pagesbriefinghtml)
- [pages/pvp.html](#file-pagespvphtml)
- [pages/rogue.html](#file-pagesroguehtml)
- [pages/roster.html](#file-pagesrosterhtml)
- [assets/favicon.svg](#file-assetsfaviconsvg)
- [css/style.css](#file-cssstylecss)
- [js/data.js](#file-jsdatajs)
- [js/rng.js](#file-jsrngjs)
- [js/spawner.js](#file-jsspawnerjs)
- [js/app.js](#file-jsappjs)
- [tests/js/data.test.js](#file-testsjsdatatestjs)
- [tests/js/rng.test.js](#file-testsjsrngtestjs)
- [tests/js/spawner.test.js](#file-testsjsspawnertestjs)
- [tests/js/app.test.js](#file-testsjsapptestjs)
- [tests/ui/pages.test.js](#file-testsuipagestestjs)

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
- `codebase_bundle.md` — Unified master single-file bundle for AI and NotebookLM ingestion.

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

## VIII. Single-File Codebase Bundle Synchronization (`codebase_bundle.md`)
Any and all changes made to the codebase (files added, modified, renamed, or deleted) MUST immediately and continuously be reflected in `codebase_bundle.md`.
- `codebase_bundle.md` serves as the centralized, comprehensive ingestion artifact for Gemini Notebook and NotebookLM.
- The bundle MUST always maintain an up-to-date Table of Contents with working anchor links to every single project file.
- All code fences in the bundle MUST use quadruple backticks (` ````lang `) to prevent formatting conflicts with nested code blocks or Markdown documentation.
- No task, commit, or pull request is considered complete until `codebase_bundle.md` has been regenerated, verified, and kept in sync with the current repository state.

---
> **Note for Autonomous Agents**: You are strictly required to treat this document as the highest-priority directive when planning architecture, suggesting refactoring, or implementing new routines and features (including operations performed via Google Antigravity, OPSX, or autonomous workflows). **Whenever you create, modify, or delete any file in the repository, you MUST regenerate and synchronize `codebase_bundle.md` before concluding your turn.**
````

---

## File: `index.html` <a id="file-indexhtml"></a>

````html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fires of Armageddon // Horde Mode</title>
  <link rel="icon" type="image/svg+xml" href="assets/favicon.svg">
  <link rel="apple-touch-icon" href="assets/favicon.svg">
  <link rel="stylesheet" href="css/style.css">
</head>
<body>

  <!-- CAMPAIGN SUITE TOP NAVIGATION -->
  <nav class="suite-nav">
    <a href="index.html" class="suite-link active">🧟 Mode 1: Horde Command &amp; Spawner</a>
    <a href="pages/pvp.html" class="suite-link">⚔️ Mode 2: 1v1 Ash Wastes PvP</a>
    <a href="pages/rogue.html" class="suite-link">🎲 Mode 3: Rogue Sector &amp; AI Tracker</a>
    <a href="pages/roster.html" class="suite-link">🎖️ Rosters &amp; Nemesis Ledger</a>
    <a href="pages/briefing.html" class="suite-link">📜 Briefings, Ship &amp; Atlas</a>
  </nav>

<div class="app-shell">

  <!-- HOME SCREEN -->
  <div id="setupScreen" class="hero-card">
    <div class="hero-header">
      <div class="status-pill">
        <span class="pulse-dot"></span> Segmentum Solar • Vox-Link Online
      </div>
      <h1 class="hero-title">Fires of Armageddon</h1>
      <p class="hero-subtitle">Tactical Horde Command, Synced Faction &amp; Multi-Zone Spawner</p>

      <div class="lore-quote">
        "The empyric barriers around the Red Angel's Gate are fracturing. Synchronize your dataslates, lock in your covert directives, and hold the ash wastes until extraction."
      </div>
    </div>

    <!-- 1. ROOM CODE -->
    <label class="setup-label">1. Shared Room Code (Syncs Decks, Horde Faction &amp; Spawns)</label>
    <div class="seed-row">
      <input type="text" id="seedInput" class="seed-input" placeholder="e.g. HADES-1" value="HADES-1">
      <button type="button" class="dice-btn" onclick="generateRandomCode()">🎲 New Room</button>
    </div>

    <!-- 2. HORDE PRIMARY FACTION (SYNCED BY ROOM CODE) -->
    <label class="setup-label">2. Horde Primary Faction Rule (Section 7.5)</label>
    <select id="setupFactionMode" style="width:100%; padding:12px; font-weight:600; background:#0b0d13;">
      <option value="SYNC_ALL">🎲 Auto-Sync Random Faction from Room Code (All 23 Factions)</option>
      <option value="SYNC_CHAOS">🎲 Auto-Sync Random CHAOS Faction from Room Code</option>
      <option value="SYNC_XENOS">🎲 Auto-Sync Random XENOS Faction from Room Code</option>
      <option value="SYNC_IMPERIUM">🎲 Auto-Sync Random IMPERIUM Faction from Room Code</option>
      <optgroup label="Or Manually Lock a Specific Faction:">
        <option value="Space Marines">Space Marines (Transhuman Skills)</option>
        <option value="Adepta Sororitas">Adepta Sororitas (Martyrs and Miracles)</option>
        <option value="Adeptus Custodes">Adeptus Custodes (Best of the Best)</option>
        <option value="Adeptus Mechanicus">Adeptus Mechanicus (Third Try's the Charm)</option>
        <option value="Astra Militarum">Astra Militarum (Unanimous Orders)</option>
        <option value="Grey Knights">Grey Knights (Poor Hammers)</option>
        <option value="Imperial Agents">Imperial Agents (Fine, I'll Do It Myself)</option>
        <option value="Imperial Knights">Imperial Knights (Passive Ion Shields)</option>
        <option value="Chaos Space Marines">Chaos Space Marines (Wonton Slaughter)</option>
        <option value="Chaos Daemons">Chaos Daemons (Shadow Forms)</option>
        <option value="Chaos Knights">Chaos Knights (Different Theme)</option>
        <option value="Death Guard">Death Guard (Don't You Miss DR?)</option>
        <option value="Emperor's Children">Emperor's Children (Elegant Violence)</option>
        <option value="Thousand Sons">Thousand Sons (Psychic Storms)</option>
        <option value="World Eaters">World Eaters (Bloodthirsty)</option>
        <option value="Aeldari">Aeldari (Monomolecular Ammunition)</option>
        <option value="Drukhari">Drukhari (Monomolecular Edges)</option>
        <option value="Necrons">Necrons (We're So Back)</option>
        <option value="T'au Empire">T'au Empire (Glasses)</option>
        <option value="Orks">Orks (High Green Tide)</option>
        <option value="Leagues of Votann">Leagues of Votann (Grudge Game)</option>
        <option value="Tyranids">Tyranids (Neurons Activated)</option>
        <option value="Genestealer Cults">Genestealer Cults (Should Have Been 5+ FNP)</option>
      </optgroup>
    </select>

    <!-- 3. ENGAGEMENT PROTOCOL -->
    <label class="setup-label">3. Engagement Protocol</label>
    <div class="choice-grid">
      <div id="modeCardCoop" class="choice-card selected-red" onclick="selectMode('coop')">
        <span class="choice-icon">⚔️</span>
        <div class="choice-title">Co-op Strike Team</div>
        <div class="choice-sub">2 Players • Max 8 SP/Rnd • Full 34 Secret Deck</div>
      </div>
      <div id="modeCardSolo" class="choice-card" onclick="selectMode('solo')">
        <span class="choice-icon">🛡️</span>
        <div class="choice-title">Solo Last Stand</div>
        <div class="choice-sub">1 Player • Max 16 SP/Rnd • Blocks Multiplayer Secrets</div>
      </div>
    </div>

    <!-- 4. COMMANDER DESIGNATION -->
    <div id="playerRoleSection">
      <label class="setup-label">4. Commander Designation</label>
      <div class="choice-grid">
        <div id="roleCard1" class="choice-card selected" onclick="selectRole('1')">
          <span class="choice-icon">🦅</span>
          <div class="choice-title">Commander Alpha</div>
          <div class="choice-sub">Player 1 • Upper Deck Pool (No Duplicate Draws)</div>
        </div>
        <div id="roleCard2" class="choice-card" onclick="selectRole('2')">
          <span class="choice-icon">💀</span>
          <div class="choice-title">Commander Beta</div>
          <div class="choice-sub">Player 2 • Lower Deck Pool (No Duplicate Draws)</div>
        </div>
      </div>
    </div>

    <div class="rules-strip">
      <span class="rule-tag"><strong>Difficulty:</strong> Hard Mode</span>
      <span class="rule-tag"><strong>Spawn Zones:</strong> n + 1 (3 @ 1k / 5 @ 2k)</span>
      <span class="rule-tag"><strong>Duration:</strong> 6 Rounds (Final Stand)</span>
    </div>

    <button class="launch-btn" onclick="startSession()">
      Deploy to Battlefield →
    </button>
  </div>

  <!-- MAIN GAME INTERFACE -->
  <div id="gameScreen" class="hidden">

    <!-- STICKY TOP HUD -->
    <div class="hud-bar">
      <div class="hud-stat">
        <span class="hud-label" id="hudSessionInfo">HADES-1 • P1</span>
        <span class="hud-num" id="hudRound" style="color:var(--red);">Pre-Game</span>
      </div>

      <div class="hud-stat">
        <span class="hud-label">Supply (SP) <span id="hudSpCap" class="hud-sub">(0/8)</span></span>
        <div class="hud-val-row">
          <button class="mini-btn" onclick="loseSP(1)">−</button>
          <span class="hud-num" id="hudSp" style="color:var(--blue);">0</span>
          <button class="mini-btn" onclick="gainSP(1)">+</button>
        </div>
      </div>

      <div class="hud-stat">
        <span class="hud-label">Command (CP) <span id="hudStratTally" class="hud-sub">(0 Strats)</span></span>
        <div class="hud-val-row">
          <button class="mini-btn" onclick="spendCPForStrat()">−</button>
          <span class="hud-num" id="hudCp" style="color:var(--purple);">2</span>
          <button class="mini-btn" onclick="adjCP(1)">+</button>
        </div>
      </div>

      <button class="btn-ghost btn-sm" onclick="leaveSession()">Exit</button>
    </div>

    <!-- PERSISTENT SYNCED HORDE FACTION REMINDER BANNER -->
    <div class="faction-reminder-bar">
      <div class="faction-reminder-title">
        <span id="activeFactionBannerTitle">HORDE FACTION: CHAOS DAEMONS</span>
        <span style="font-size:0.7rem; color:var(--muted);">Synced to Room Code</span>
      </div>
      <div id="activeFactionBannerDesc" style="color:#e2e8f0;"></div>
    </div>

    <!-- 4 NAVIGATION TABS -->
    <div class="nav-pills">
      <button id="tabBtn1" class="active" onclick="switchTab(1)">1. Battle Round</button>
      <button id="tabBtn2" onclick="switchTab(2)">2. Secret Obj</button>
      <button id="tabBtn3" onclick="switchTab(3)">3. Resupply</button>
      <button id="tabBtn4" onclick="switchTab(4)">4. Spawner</button>
    </div>

    <!-- TAB 1: BATTLE ROUND -->
    <div id="tab1">
      <div class="round-banner">
        <h2 id="roundTitle">Deployment &amp; Setup</h2>
        <p id="spawnModDisplay">Open Tab 4 (Spawner) to roll Round 1 Horde Spawns!</p>
        <button class="btn-red" id="nextRoundBtn" onclick="advanceBattleRound()" style="width:100%; max-width:340px;">
          Begin Battle Round 1
        </button>
      </div>

      <div class="section-header">
        <h3>Active Secondary Mission</h3>
        <span id="secDeckCount" class="hud-sub"></span>
      </div>
      <div id="activeSecondariesBox"></div>

      <div class="section-header">
        <h3>Active Misery Cards</h3>
        <span id="misDeckCount" class="hud-sub"></span>
      </div>
      <div id="activeMiseriesBox"></div>

      <details>
        <summary>Manual Card Draws &amp; Punishment Triggers</summary>
        <div class="drawer-body">
          <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:12px;">
            <button class="btn-gold btn-sm" onclick="drawSecondary(false)">+1 Secondary (Tempt Fate)</button>
            <button class="btn-ghost btn-sm" onclick="replaceSecondary()">Replace Secondary (Advanced Tactics)</button>
            <button class="btn-red btn-sm" onclick="drawMisery(1)">+1 Misery Card</button>
            <button class="btn-red btn-sm" onclick="drawMisery(2)">+2 Misery Cards</button>
          </div>
          <div style="display:flex; gap:8px; align-items:center;">
            <select id="specificMiserySelect" style="flex:1; padding:8px;">
              <option value="6">#6 Stray Orbital Bombardment</option>
              <option value="13">#13 Pincer Maneuver</option>
              <option value="22">#22 Comms Jammed</option>
              <option value="31">#31 Debris Storm</option>
            </select>
            <button class="btn-ghost btn-sm" onclick="triggerSpecificMisery()">Trigger Specific</button>
          </div>
        </div>
      </details>
    </div>

    <!-- TAB 2: SECRET OBJECTIVE -->
    <div id="tab2" class="hidden">
      <div id="selectionArea" class="hidden">
        <div class="section-header">
          <h3 id="selectionPrompt">Select 1 Secret Objective to Keep</h3>
          <span id="secretPoolNotice" class="hud-sub"></span>
        </div>
        <div id="choicesList"></div>
      </div>

      <div id="lockedArea" class="hidden">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <span class="hud-label">Your Confidential Directive</span>
          <button class="btn-ghost btn-sm" onclick="togglePrivacy()" id="privacyBtn">Hide Screen</button>
        </div>

        <div id="PrivacyWrapper">
          <div id="activeCardBox"></div>
          <div style="text-align:center;">
            <div class="cm-code" id="cmCodeBox"></div>
            <p class="hud-sub" style="margin-top:6px;">Share this encrypted code with the Campaign Master to log your objective secretly.</p>
          </div>
        </div>

        <details>
          <summary>Redraw Secret Objective (Change of Plans / Comms)</summary>
          <div class="drawer-body" style="display:flex; flex-direction:column; gap:10px;">
            <button class="btn-blue" onclick="triggerChangeOfPlans()">
              Use "A Change of Plans" (Draw 2, Choose 1 or Keep)
            </button>
            <button class="btn-red" onclick="triggerOrbitalPunishment()">
              Failed "Establish Orbital Comms" (Draw 2, Force Random)
            </button>
          </div>
        </details>
      </div>
    </div>

    <!-- TAB 3: RESUPPLY SHOP -->
    <div id="tab3" class="hidden">
      <details style="margin-top:0; margin-bottom:16px;">
        <summary>Active Fortifications &amp; Field Markers</summary>
        <div class="drawer-body">
          <div class="fort-grid">
            <label class="fort-item"><span>FOB (+1 SP)</span><input type="checkbox"></label>
            <label class="fort-item"><span>Warp-Relic (3 MW)</span><input type="checkbox"></label>
            <label class="fort-item"><span>War Trench (+1S/AP)</span><input type="checkbox"></label>
            <label class="fort-item"><span>Field Hospital (3W)</span><input type="checkbox"></label>
            <label class="fort-item"><span>Jammer (-1 Spawn)</span><input type="checkbox" id="jammerCheck"></label>
            <label class="fort-item"><span>Ammo (Sustained 1)</span><input type="checkbox"></label>
            <label class="fort-item"><span>Shield (FNP 5+)</span><input type="checkbox"></label>
            <div class="fort-item">
              <span>Teleporters: <strong id="teleCount">0</strong>/3</span>
              <div>
                <button class="mini-btn" onclick="adjMarker('teleCount',-1,3)">−</button>
                <button class="mini-btn" onclick="adjMarker('teleCount',1,3)">+</button>
              </div>
            </div>
            <div class="fort-item">
              <span>Razor Wire: <strong id="wireCount">0</strong>/2</span>
              <div>
                <button class="mini-btn" onclick="adjMarker('wireCount',-1,2)">−</button>
                <button class="mini-btn" onclick="adjMarker('wireCount',1,2)">+</button>
              </div>
            </div>
            <div class="fort-item">
              <span>Mine Dmg: <strong id="mineCount">0</strong>/10</span>
              <div>
                <button class="mini-btn" onclick="adjMarker('mineCount',-1,10)">−</button>
                <button class="mini-btn" onclick="adjMarker('mineCount',1,10)">+</button>
              </div>
            </div>
          </div>
        </div>
      </details>

      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
        <span class="hud-label">Filter Resupply Options</span>
        <label style="font-size:0.8rem; color:var(--red); cursor:pointer;">
          <input type="checkbox" id="doubleCostToggle" onchange="renderResupplyTable()"> Seller's Market (2x Cost)
        </label>
      </div>

      <div class="filter-bar">
        <button class="chip active" onclick="setShopFilter('All', this)">All (26)</button>
        <button class="chip" onclick="setShopFilter('Fortify', this)">Fortify</button>
        <button class="chip" onclick="setShopFilter('Strike', this)">Strike</button>
        <button class="chip" onclick="setShopFilter('Supply', this)">Supply</button>
        <button class="chip" onclick="setShopFilter('Tactics', this)">Tactics</button>
        <button class="chip" onclick="setShopFilter('Spawn', this)">Spawn</button>
        <button class="chip" onclick="setShopFilter('Secondary', this)">Secondary</button>
      </div>

      <div id="resupplyList"></div>
    </div>

    <!-- TAB 4: AUTOMATED HORDE SPAWNER (n + 1 ZONES) -->
    <div id="tab4" class="hidden">
      <div class="round-banner" style="padding:16px;">
        <h2>Room-Synced Horde Spawner (n + 1 Zones)</h2>
        <p style="margin-bottom:12px;">Synchronized by Room Code • Rolls 2D6 + Hard Mode Round Mod + Active Modifiers</p>

        <div style="display:flex; flex-wrap:wrap; gap:10px; justify-content:center; margin-bottom:14px;">
          <select id="spawnZoneCountSelect">
            <option value="3">1,000 Pts (3 Spawn Zones)</option>
            <option value="5">2,000 Pts (5 Spawn Zones)</option>
          </select>
          <select id="hordeFactionSelect" onchange="manualChangeFaction()"></select>
        </div>

        <div style="display:flex; flex-wrap:wrap; gap:12px; justify-content:center; align-items:center; margin-bottom:14px; font-size:0.85rem;">
          <label>Extra Spawn Mod: <input type="number" id="extraSpawnMod" value="0" style="width:60px; padding:6px; text-align:center;"></label>
          <label><input type="checkbox" id="firstRollBonusCheck"> +6 1st Zone (Failed Dragon Slayer)</label>
          <label><input type="checkbox" id="baitTrapBonusCheck"> +12 1st Zone (Baiting the Trap)</label>
        </div>

        <button class="btn-green" onclick="rollAllSpawnZones()" style="width:100%; max-width:360px; padding:13px; font-size:1rem;">
          🎲 Roll Synced Spawns for Round <span id="spawnerBtnRound">1</span>
        </button>
      </div>

      <div class="section-header">
        <h3>Spawn Zone Results</h3>
        <span class="hud-sub">Unmodified 2 always spawns nothing</span>
      </div>
      <div id="spawnResultsContainer">
        <div class="card spawn-zone" style="opacity:0.65;">
          <p class="card-desc">Tap the green button above to generate synchronized brackets and units for each Spawn Zone.</p>
        </div>
      </div>

      <!-- CUSTOM COLLECTION POOL BUILDER -->
      <details>
        <summary>Customize Your Shelf Pool (Auto-Picks Models You Own)</summary>
        <div class="drawer-body" style="text-align:left;">
          <p class="hud-sub" style="margin-bottom:10px;">Enter the units you own for each bracket (comma-separated). Both players can paste the same list so unit names sync too!</p>
          <label class="hud-label">Bracket [3–4] (0–75 pts)</label>
          <input type="text" id="pool34" style="width:100%; margin-bottom:10px;" value="10 Hormagaunts, 10 Termagants, 10 Cultists, 3 Nurglings, 5 Barbgaunts">
          <label class="hud-label">Bracket [5–6] (76–150 pts)</label>
          <input type="text" id="pool56" style="width:100%; margin-bottom:10px;" value="10 Bloodletters, 10 Genestealers, 5 Chaos Terminators, 3 Tyranid Warriors, 10 Gargoyles">
          <label class="hud-label">Bracket [7–9] (151–300 pts)</label>
          <input type="text" id="pool79" style="width:100%; margin-bottom:10px;" value="1 Trygon, 1 Screamer-Killer, 1 Daemon Prince, 1 Chaos Predator, 6 Bloodcrushers">
          <label class="hud-label">Bracket [10+] (301–550 pts)</label>
          <input type="text" id="pool10" style="width:100%; margin-bottom:10px;" value="1 Bloodthirster, 1 Norn Emissary, 1 Great Unclean One, 1 Tyrannofex + Hive Tyrant">
          <button class="btn-blue btn-sm" onclick="saveCustomPool()">Save Shelf Pool to Browser</button>
        </div>
      </details>
    </div>

  </div>
</div>

  <script src="js/data.js"></script>
  <script src="js/rng.js"></script>
  <script src="js/spawner.js"></script>
  <script src="js/app.js"></script>
</body>
</html>
````

---

## File: `pages/briefing.html` <a id="file-pagesbriefinghtml"></a>

````html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fires of Armageddon // Briefings, Ship Slider &amp; Sector Atlas</title>
  <link rel="icon" type="image/svg+xml" href="../assets/favicon.svg">
  <link rel="apple-touch-icon" href="../assets/favicon.svg">
  <link rel="stylesheet" href="../css/style.css">
</head>
<body>

  <!-- CAMPAIGN SUITE TOP NAVIGATION -->
  <nav class="suite-nav">
    <a href="../index.html" class="suite-link">🧟 Mode 1: Horde Command &amp; Spawner</a>
    <a href="pvp.html" class="suite-link">⚔️ Mode 2: 1v1 Ash Wastes PvP</a>
    <a href="rogue.html" class="suite-link">🎲 Mode 3: Rogue Sector &amp; AI Tracker</a>
    <a href="roster.html" class="suite-link">🎖️ Rosters &amp; Nemesis Ledger</a>
    <a href="briefing.html" class="suite-link active">📜 Briefings, Ship &amp; Atlas</a>
  </nav>

<div class="app-shell">

  <!-- 4-TAB DOSSIER SWITCHER (DEFAULTS TO BETA PER UI BOUNDARY TESTS) -->
  <div class="nav-pills" style="margin-top:8px; margin-bottom:20px;">
    <button id="btnAlpha" onclick="showDossier('alpha')">🦅 Alpha &amp; Ship</button>
    <button id="btnBeta" class="active" onclick="showDossier('beta')">💀 Beta Briefing</button>
    <button id="btnAtlas" onclick="showDossier('atlas')">🗺️ Sector Atlas</button>
    <button id="btnRules" onclick="showDossier('rules')">⚡ Horde → Crusade Rules</button>
  </div>

  <!-- ================================================================= -->
  <!-- TAB 1: COMMANDER ALPHA (THE SANCTUARY OF ASH & SHIP.MD SLIDER)    -->
  <!-- ================================================================= -->
  <div id="dossierAlpha" class="hidden">

    <!-- CLEARANCE GATE ALPHA -->
    <div id="gateAlpha" class="hero-card" style="text-align:center; padding:36px 24px; border-color:rgba(245, 176, 65, 0.45);">
      <div class="status-pill" style="margin-bottom:12px;">Clearance Vermilion-Alpha • Restricted Dataslate</div>
      <h2 class="hero-title" style="font-size:1.6rem;">The Sanctuary of Ash // Command &amp; Ship Slider</h2>
      <p class="hero-subtitle" style="max-width:520px; margin:8px auto 22px auto;">
        Private operational ledger for <strong>Commander Alpha</strong> (Lower Decks &amp; Shipboard Control Slider). Unauthorized inspection by rival Warlords is prohibited.
      </p>
      <button class="launch-btn unlock-btn" style="max-width:340px; margin:0 auto;" onclick="unlockTab('Alpha')">
        🔓 Authenticate Commander Alpha
      </button>
    </div>

    <!-- UNLOCKED ALPHA CONTENT -->
    <div id="contentAlpha" class="hidden">
      <div style="display:flex; justify-content:flex-end; margin-bottom:10px;">
        <button class="btn-ghost btn-sm lock-toggle-btn" onclick="lockTab('Alpha')">🔒 Lock Alpha Dataslate</button>
      </div>

      <div class="hero-card" style="margin-bottom:20px;">
        <div class="status-pill">Registered Dossier • Commander Alpha • Alliance: Gatebreakers</div>
        <h1 class="hero-title" style="font-size:1.85rem; margin-top:8px;">The Sanctuary of Ash</h1>
        <div class="lore-quote">
          "Once, a Sororitas pilgrim vessel named <em>Divine Providence</em> was defiled when heretics slaughtered its crew and used it to bombard holy worlds. After its recapture, the Sororitas decreed it too tainted to exist—until a Krieg regiment, condemned for a 'failure' they did not commit, claimed it as their floating purgatory. The Krieg spent decades reforging it into a hybrid prison-monastery, scrubbing its halls with acid and ash from their own cremated dead. They renamed it <em>The Sanctuary of Ash</em>: a bitter joke, for there is no sanctuary here, only endless war."
        </div>
      </div>

      <!-- INTERACTIVE SHIP.MD BALANCE SLIDER (-3 TO +3) -->
      <div class="card" style="margin-bottom:20px; border-left:4px solid var(--gold);">
        <div class="section-header" style="margin-top:0;">
          <h3>SHIP.md // Shipboard Tug-of-War Slider (-3 to +3)</h3>
          <span class="hud-sub" id="shipSliderLabel">Current State: 0 (Balanced)</span>
        </div>
        <p class="card-desc" style="margin-bottom:14px;">
          Track the internal struggle between the <strong>Lower Decks</strong> (Commissar Dravik's Brig Wall Warrants &amp; Covert Directives) and the <strong>High Sanctum</strong> (Sororitas Wardens). Positions <strong>-1</strong> and <strong>+1</strong> are the tactical Sweet Spots; pushing to <strong>±2</strong> or <strong>±3</strong> triggers severe shipboard quicksand!
        </p>

        <div style="display:grid; grid-template-columns:repeat(7, 1fr); gap:6px; margin-bottom:16px;">
          <button type="button" class="chip" id="sliderBtn-3" onclick="selectSlider(-3)">-3 Abyss</button>
          <button type="button" class="chip" id="sliderBtn-2" onclick="selectSlider(-2)">-2 Mutiny</button>
          <button type="button" class="chip" id="sliderBtn-1" onclick="selectSlider(-1)">-1 Sweet Spot</button>
          <button type="button" class="chip active" id="sliderBtn0" onclick="selectSlider(0)">0 Balanced</button>
          <button type="button" class="chip" id="sliderBtn1" onclick="selectSlider(1)">+1 Sweet Spot</button>
          <button type="button" class="chip" id="sliderBtn2" onclick="selectSlider(2)">+2 Penance</button>
          <button type="button" class="chip" id="sliderBtn3" onclick="selectSlider(3)">+3 Tyranny</button>
        </div>

        <div id="sliderDetailBox" class="card" style="background:#0b0d13; margin-bottom:12px;"></div>

        <details>
          <summary style="cursor:pointer; font-weight:700; color:var(--gold);">7-Level Dynamic Phase Reckoning Table (If 3rd Alliance Wins Phase)</summary>
          <div class="drawer-body" style="font-size:0.88rem; line-height:1.55; margin-top:10px;">
            <p>If the Campaign Master's <strong>3rd Alliance</strong> wins the Campaign Phase, Segmentum Solar High Command audits <em>The Sanctuary of Ash</em> based on where your slider rests:</p>
            <ul>
              <li><strong>At -1 or +1 (The Sweet Spots):</strong> Your covert maneuvering masks the failure—no High Command penalty, and you claim the <strong>Phase-End Shipboard Cache (+1 RP or +100 pts Supply Limit)</strong>!</li>
              <li><strong>At 0 (Balanced Indecision):</strong> Neither deck takes the blame; lose 1 Supply Cache Token (or start next game with -1 CP).</li>
              <li><strong>At -2 or +2 (Factional Strife):</strong> Internal purges cost you <strong>1 RP</strong> (or 1 unit suffers a automatic Battle Scar).</li>
              <li><strong>At -3 (Lower Decks Abyss):</strong> High Sanctum unleashes <em>Saint Celestine &amp; Aestred Thurga</em> as hostile Executioners in your next battle!</li>
              <li><strong>At +3 (High Sanctum Tyranny):</strong> The Sororitas confiscate your Phase-End Cache (+1 RP) and brand <em>The Exile's</em> hull with an automatic Battle Scar on a failed Leadership test (-1)!</li>
            </ul>
          </div>
        </details>
      </div>

      <!-- ALPHA DRAMATIS PERSONAE & ACTIVE CRUSADE RULES -->
      <div class="card" style="margin-bottom:20px;">
        <h3 style="margin-top:0; color:var(--gold);">Command Echelon &amp; Regiment Rules (1,820 / 1,900 Pts)</h3>
        <ul>
          <li><strong>🎖️ Warlord: The Exile — Rogal Dorn Commander (<em>"Mercy's Delay"</em> • 265 pts | <em>Calm Under Fire</em>):</strong> Once a decorated Cadian officer who survived seven doomed last stands. <strong>Special Rule (<em>The Exile's Curse — "Mercy Delayed Again"</em>):</strong> Whenever <em>The Exile</em> survives a Horde Mode Round 6 Final Stand while 3+ friendly Krieg units were destroyed, he gains <strong>+1 bonus XP</strong>, and one destroyed Krieg Battleline squad that failed its Out of Action test may replace its Battle Scar with <strong>"Absolved in Ash"</strong> (<em>Feel No Pain 6+</em> within 6" of <em>The Exile</em>).</li>
          <li><strong>⚔️ Mighty Champion: Lord Marshal Dreir (100 pts | <em>Inspirational Champion</em> [+1 Crusade Pt]):</strong> Ignore all Battle Scars on the Bodyguard unit he leads (<em>Death Riders</em>), and select <strong>one additional unit</strong> to be <em>Marked for Greatness (+3 XP)</em> at the end of every battle!</li>
          <li><strong>💥 2x Leman Russ Vanquishers (<em>"The Shrine-Breakers"</em> • 145 pts each):</strong> Unofficial lower-deck legend born in Session 0 after detonating every Sororitas war-engine at the Golgotha Landing Site. <strong>Session 0 Legacy Perk:</strong> The first time either Vanquisher reaches <em>Blooded</em> (6 XP), it may re-roll its Weapon Modification or Battle Trait roll for free!</li>
          <li><strong>💀 The Unseen Jury (65 pts | <em>Stalwart's Honours</em>) &amp; Commissar Dravik, The Silent Judge (30 pts):</strong> Enforcers of the ship's blood-warrants.</li>
          <li><strong>🦅 Faction Crusade Blessing — Faith and Duty (Imperium):</strong> When Underdog, select 1 objective marker at start of battle; non-Battle-shocked models within range gain <strong>+1 OC</strong>.</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- ================================================================= -->
  <!-- TAB 2: COMMANDER BETA (JUNEBUG — DEFAULT VISIBLE TAB)             -->
  <!-- ================================================================= -->
  <div id="dossierBeta">

    <!-- CLEARANCE GATE BETA -->
    <div id="gateBeta" class="hero-card" style="text-align:center; padding:36px 24px; border-color:rgba(255, 71, 87, 0.45);">
      <div class="status-pill" style="margin-bottom:12px;">Clearance Vermilion-Beta • Restricted Dataslate</div>
      <h2 class="hero-title" style="font-size:1.6rem;">Commander Beta's Sealed Astropathic Dispatch</h2>
      <p class="hero-subtitle" style="max-width:520px; margin:8px auto 22px auto;">
        Encrypted Segmentum Solar High Command transmission routed exclusively to <strong>Commander Beta (JUNEBUG)</strong>.
      </p>
      <button class="launch-btn unlock-btn" style="max-width:340px; margin:0 auto;" onclick="unlockTab('Beta')">
        🔓 Authenticate &amp; Decrypt Dispatch
      </button>
    </div>

    <!-- UNLOCKED BETA CONTENT -->
    <div id="contentBeta" class="hidden">
      <div style="display:flex; justify-content:flex-end; margin-bottom:10px;">
        <button class="btn-ghost btn-sm lock-toggle-btn" onclick="lockTab('Beta')">🔒 Lock Beta Dataslate</button>
      </div>

      <div class="hero-card" style="margin-bottom:20px;">
        <div class="status-pill">Incoming Vox-Transmission // Recipient: Commander Beta</div>
        <h1 class="hero-title" style="font-size:1.85rem; margin-top:8px;">The Fires of Armageddon</h1>

        <div class="lore-quote" style="text-align:left; line-height:1.65;">
          <p style="margin-bottom:10px;">
            <em>"Hear me, my lord. The sky above Armageddon does not weep rain; it weeps ash, promethium soot, and the curdled blood of a dying reality.</em>
          </p>
          <p style="margin-bottom:10px;">
            <em>Atop the jagged basalt cliffs of the Crimson Mesa, the Red Angel’s Gate stands torn wide—a yawning wound in the Immaterium that pulses like a butchered heart. From its depths, the laughter of dark gods and the screech of warp-born horrors echo across the continent, drowning the ruined spires of Hives Hades and Thoraddis in madness.</em>
          </p>
          <p style="margin-bottom:10px;">
            <em>Down in the suffocating heat of the Golgotha Arbor-Basin, the petrified jungle still smolders from your first contact. Blackened tree trunks lie shattered across craters of vitrified mud, and the air remains thick with the stench of ozone, melted ceramite, and promethium smoke. It was a brutal, grinding crucible of point-blank artillery and burning steel. Even as stained-glass war-engines detonated in blinding fireballs across the clearing, your lines held through the inferno—until wings of white fire tore through the low, sulfuric clouds to butcher the enemy's rear guard and claim that blood-soaked mire by a razor's edge.</em>
          </p>
          <p style="margin-bottom:10px;">
            <em>Yet that clash in the forest was only an omen. High above the toxic cloud-banks, your flagship now hangs in the ash-choked void, its launch bays primed and its warriors awaiting the order to unleash your true Crusade host upon the world below.</em>
          </p>
          <p style="margin-bottom:10px;">
            <em>Who is it that answers your call in the dark, my lord? Do you return at the head of those same zealous Sisters, descending once more with bolter, flamer, and miracle to scour this world clean? Or was that first battle merely a prelude—and even now, does an entirely different warhost stir within your fleet's holds? Perhaps ancient vaults and forgotten relics call to you from beneath the ashes; perhaps your legions hunger for skulls, or wait in cold, inhuman silence to reclaim an empire of dust.</em>
          </p>
          <p style="margin-bottom:0;">
            <em>Whatever army you unleash, know that you do not drop into an empty warzone. A rival commander already fortifies the northern clearings, nursing the wounds of your first encounter—and in the uncharted fog beyond the trees, a <strong>Third Force</strong> is waking. We have no flagship in orbit. We answer to no imperial tithe. Whether we claw our way up from subterranean brood-tunnels, erupt from screaming tears in the Warp, or march out of the choking ash-storms, my legions will contest every inch of this dying world against you both. When you lock blades with your rival in the ashes, I will feast upon the aftermath. And when my hordes surround you in the dark, you will have to decide whether the commander standing beside you is your salvation... or your next victim."</em>
          </p>
        </div>
      </div>

      <!-- SECTION I: THE VOICE IN THE ASH -->
      <div class="card" style="margin-bottom:20px; border-left:4px solid var(--red);">
        <h2 style="margin-top:0; font-size:1.25rem;">The Voice in the Ash (Your Chronicler &amp; The Third Force)</h2>
        <p class="card-desc">
          Welcome to our <strong>Warhammer 40,000: Armageddon Crusade</strong>! While you and Commander Alpha track your unit cards on <strong>Administratum</strong>, I serve two roles simultaneously:
        </p>
        <ul style="font-size:0.92rem; line-height:1.6;">
          <li><strong>1. Impartial Chronicler &amp; Campaign Master:</strong> After every battle, I chronicle your Warlord's deeds, name your units' Battle Scars and Honours, manage the 8-Node Planetary Sector Atlas, and bestow thematic <strong>Mighty Champion</strong> abilities upon any <strong>Epic Hero</strong> in your roster.</li>
          <li><strong>2. Overlord of the Unseen Third Force (The Horde AI):</strong> Armageddon features <strong>three warring Alliances</strong>. Once you and Commander Alpha each claim your banner, <strong>I take direct command of the remaining 3rd Alliance</strong>—competing against you both for Sector Hegemony, Strategic Points, and Campaign Points across all 4 Campaign Phases!</li>
        </ul>
      </div>

      <!-- SECTION II: THE THREE BANNERS -->
      <div class="card" style="margin-bottom:20px; border-left:4px solid var(--gold);">
        <h2 style="margin-top:0; font-size:1.25rem;">Choose Your Banner: The Three Alliances of Armageddon</h2>
        <p class="card-desc" style="margin-bottom:12px;">
          Pledge your Crusade force to whichever cause aligns with your ambition—and whatever banner remains unchosen shall be claimed by the Third Force gathering in the fog:
        </p>
        <div class="choice-grid" style="grid-template-columns:repeat(auto-fit, minmax(210px, 1fr));">
          <div class="card" style="border-top:3px solid var(--gold); margin:0;">
            <div class="choice-title">🛡️ The Gatebreakers</div>
            <p class="card-desc" style="font-size:0.84rem; margin-top:6px;">
              Defenders of the Threshold. Sworn to hold the ancient ferrocrete bastions of the Imperator Line, purge the fallen hive cities, and shatter the black monoliths anchoring the Red Angel’s Gate.
            </p>
          </div>
          <div class="card" style="border-top:3px solid var(--red); margin:0;">
            <div class="choice-title">💀 The Desecrators</div>
            <p class="card-desc" style="font-size:0.84rem; margin-top:6px;">
              Heralds of the Red Angel. Those who look upon a burning world and desire only to feed the flames—slaying the champions of order and tearing the polar rift wide into a daemon world.
            </p>
          </div>
          <div class="card" style="border-top:3px solid var(--purple); margin:0;">
            <div class="choice-title">⚔️ The Marauders</div>
            <p class="card-desc" style="font-size:0.84rem; margin-top:6px;">
              Lords of the Endless Anarchy. Opportunistic warhosts, xenos raiders, and renegades who strike from hidden haunts to plunder <strong>Antiquity Relics</strong>, decapitate enemy commanders, and profit from endless war.
            </p>
          </div>
        </div>
      </div>

      <!-- SECTION III: HOW THE WAR UNFOLDS -->
      <div class="card" style="margin-bottom:20px; border-left:4px solid var(--blue);">
        <h2 style="margin-top:0; font-size:1.25rem;">How the War Unfolds Upon the Ashes</h2>
        <ul style="font-size:0.92rem; line-height:1.6;">
          <li><strong>⚔️ Mode 1 — Clash of Commanders (1v1 PvP):</strong> Wage head-to-head battles across Armageddon's <strong>Hellscapes</strong>, <strong>Warp Anomalies</strong>, and roaming <strong>Unbound Adversaries</strong>. Beware: every time you two fight each other, the Third Force creeps forward through the fog (+3 Vulture SPts and +1 Hegemony Point in an adjacent sector!).</li>
          <li><strong>🧟 Mode 2 — Breach Containment (Co-op Hard Mode Horde):</strong> Stand shoulder-to-shoulder inside a single perimeter against endless waves from <strong>n + 1 Spawn Zones</strong> through <strong>Battle Round 6 (The Final Stand)</strong>.
            <br><em>Whispers &amp; Betrayal in the Dark:</em> Before the horde hits your lines, our web terminal deals each commander a private <strong>Secret Objective</strong>. You are forbidden to show it and free to lie. Some directives demand heroism; others are covert <strong>Traitor Directives</strong> offering stolen Requisition Points, expanded Supply Limits, and ancient relics if you arrange an "accidental" artillery barrage on your partner's lines or ensure their warlord does not walk out of the breach alive...</li>
          <li><strong>🎲 Mode 3 — Rogue Sector Clashes &amp; Living Nemeses:</strong> Play off-roster games at any time to shift planetary Warp weather without risking your main Crusade units, while standout survivors and bosses across all modes are inducted into our <strong>Cross-Mode Nemesis Ledger</strong>!</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- ================================================================= -->
  <!-- TAB 3: 8-NODE SECTOR ATLAS & PARALLEL HEGEMONY TRACKER            -->
  <!-- ================================================================= -->
  <div id="dossierAtlas" class="hidden">
    <div class="hero-card" style="margin-bottom:20px;">
      <div class="status-pill">Segmentum Solar Cartography • Sub-Sector Armageddon Auspex</div>
      <h1 class="hero-title" style="font-size:1.75rem; margin-top:8px;">Armageddon Planetary Theatre Atlas</h1>
      <p class="hero-subtitle">
        Live orbital auspex projection of <strong>Armageddon Prime</strong>, the <strong>Equatorial Jungle</strong>, <strong>Armageddon Secundus</strong>, and <strong>The Fire Wastes</strong>. Tap any Sector Node (<strong>N0–N7</strong>) to inspect its canonical landmarks, battlefield rules, and <strong>3-Way Parallel Hegemony Race (0–8 HP)</strong>.
      </p>

      <!-- LORE-ACCURATE ARMAGEDDON TACTICAL AUSPEX SVG MAP (NODES 0 TO 7) -->
      <div style="background:#050a08; border:1px solid #1f3a2e; border-radius:14px; padding:10px; margin-top:14px; overflow-x:auto; box-shadow:inset 0 0 60px rgba(0,0,0,0.95);">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; padding:4px 8px 10px 8px; border-bottom:1px solid rgba(74, 222, 128, 0.2); margin-bottom:8px; font-family:monospace; font-size:0.75rem; color:#86efac;">
          <span>📡 AUSPEX TELEMETRY // 998.M41 — ERA OF THE RED ANGEL'S GATE</span>
          <div style="display:flex; gap:14px; flex-wrap:wrap;">
            <span><strong style="color:#10b981;">●</strong> Discovered Sector</span>
            <span><strong style="color:#f5b041;">▲</strong> Imperial / Contested Hive</span>
            <span><strong style="color:#a855f7;">◌</strong> Fog of War (?/8 HP)</span>
            <span><strong style="color:#ff4757;">✦</strong> Polar Rift</span>
          </div>
        </div>

        <svg id="armageddon-sector-map" viewBox="0 0 920 500" style="width:100%; height:auto; min-width:680px; display:block; font-family:'Segoe UI', Roboto, monospace; user-select:none;">
          <defs>
            <!-- Tactical Auspex Grid Pattern -->
            <pattern id="auspexGrid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(74, 222, 128, 0.07)" stroke-width="1"/>
              <path d="M 20 0 L 20 40 M 0 20 L 40 20" fill="none" stroke="rgba(74, 222, 128, 0.025)" stroke-width="0.5"/>
            </pattern>
            <!-- Equatorial Jungle Red Diagonal Threat Hatching (From Lore Map) -->
            <pattern id="jungleHazard" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="10" stroke="rgba(239, 68, 68, 0.28)" stroke-width="4"/>
            </pattern>
            <!-- Fire Wastes Crimson Rift Glow -->
            <radialGradient id="fireWastesGlow" cx="55%" cy="10%" r="45%">
              <stop offset="0%" stop-color="#ff4757" stop-opacity="0.35"/>
              <stop offset="55%" stop-color="#991b1b" stop-opacity="0.12"/>
              <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
            </radialGradient>
            <!-- Golgotha Jungle Bio-Glow -->
            <radialGradient id="jungleGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#10b981" stop-opacity="0.32"/>
              <stop offset="100%" stop-color="#10b981" stop-opacity="0"/>
            </radialGradient>
            <!-- Reusable Hive Spire Icon -->
            <g id="hiveIcon">
              <path d="M 0,-11 L 5,2 L 8,5 L -8,5 L -5,2 Z" fill="#0d1914" stroke="#86efac" stroke-width="1.2"/>
              <circle cx="0" cy="-1" r="2" fill="#86efac"/>
            </g>
            <!-- Reusable Ruined Hive Icon (Inverted Triangle) -->
            <g id="ruinIcon">
              <polygon points="-7,-6 7,-6 0,7" fill="#1f1216" stroke="#f87171" stroke-width="1.3"/>
              <text x="0" y="2" text-anchor="middle" fill="#f87171" font-size="8" font-weight="900">!</text>
            </g>
            <!-- Reusable Mechanicus Mine/Water Cog -->
            <g id="cogIcon">
              <circle cx="0" cy="0" r="5" fill="#091310" stroke="#9ca3af" stroke-width="1.5" stroke-dasharray="2,1.2"/>
              <circle cx="0" cy="0" r="2" fill="#9ca3af"/>
            </g>
          </defs>

          <!-- 1. DEEP TOXIC OCEAN BACKGROUND (Ocean of Fury, Boiling Sea, Tempest Ocean) -->
          <rect width="920" height="500" fill="#06100d"/>
          <rect width="920" height="500" fill="url(#auspexGrid)"/>
          <rect width="920" height="500" fill="url(#fireWastesGlow)"/>

          <!-- 2. CANONICAL CONTINENTAL LANDMASSES -->
          <!-- Northern Landmass: THE FIRE WASTES (Top Coast across The Boiling Sea) -->
          <path d="M 190,0 L 840,0 L 825,48 L 775,55 L 740,42 L 690,62 L 650,50 L 615,72 L 560,65 L 520,82 L 470,68 L 435,88 L 395,72 L 350,82 L 305,65 L 265,78 L 220,52 L 185,28 Z"
                fill="#271917" stroke="#5c3a33" stroke-width="1.5"/>
          <!-- Fire Wastes Ash Dunes & Crimson Mesa Crags -->
          <path d="M 320,25 L 340,12 L 360,25 M 480,35 L 505,15 L 530,35 M 540,45 L 565,20 L 590,45 M 660,30 L 685,12 L 710,30"
                fill="none" stroke="#7f4f45" stroke-width="1.5"/>

          <!-- Phoenix Island (In the Boiling Sea) -->
          <path d="M 555,105 L 585,98 L 605,112 L 590,126 L 560,124 L 545,114 Z"
                fill="#1f241d" stroke="#4b5e47" stroke-width="1.2"/>

          <!-- Main Continent: ARMAGEDDON PRIME (West) + EQUATORIAL JUNGLE (Center) + ARMAGEDDON SECUNDUS (East) -->
          <path d="M 275,105 L 315,95 L 345,112 L 330,132 L 365,125 L 395,142 L 420,168
                   L 465,165 L 505,172 L 545,158 L 585,165 L 620,145 L 665,150 L 705,128 L 755,135 L 795,115 L 845,105 L 920,100
                   L 920,385 L 875,375 L 845,350 L 810,362 L 780,335 L 735,345 L 690,330 L 645,342 L 605,322 L 570,330
                   L 535,305 L 495,315 L 460,338 L 430,335 L 415,305 L 385,285 L 345,298 L 310,282 L 280,295 L 255,272
                   L 215,278 L 195,258 L 235,245 L 185,232 L 165,212 L 215,205 L 175,188 L 195,168 L 240,175 L 210,148 L 235,132 L 270,140 L 255,118 Z"
                fill="#1d261f" stroke="#4b6352" stroke-width="1.8"/>

          <!-- Armageddon Prime Uplands & Ash-Plains (Western Contour Shading) -->
          <path d="M 235,145 L 325,135 L 385,155 L 410,210 L 385,275 L 295,278 L 225,255 Z"
                fill="#282d23" opacity="0.7"/>

          <!-- Armageddon Secundus Ash Wastes (Eastern Contour Shading) -->
          <path d="M 505,175 L 695,152 L 835,130 L 885,235 L 835,340 L 635,330 L 535,295 L 495,235 Z"
                fill="#2c2820" opacity="0.75"/>

          <!-- EQUATORIAL JUNGLE BIOME (Central Green Belt + Tactical Red Hazard Hatching) -->
          <path d="M 412,168 L 478,168 L 502,215 L 488,285 L 458,336 L 428,332 L 412,285 L 398,225 Z"
                fill="#112a1a" stroke="#22c55e" stroke-width="1" stroke-dasharray="3,2"/>
          <path d="M 418,175 L 472,175 L 492,218 L 480,282 L 455,330 L 432,326 L 418,280 L 406,225 Z"
                fill="url(#jungleHazard)"/>
          <circle cx="445" cy="245" r="58" fill="url(#jungleGlow)"/>

          <!-- Southern Landmass: THE DEADLANDS & NETHERIA PENINSULA (Bottom Frozen/Ash Coast) -->
          <path d="M 115,500 L 145,455 L 185,435 L 210,455 L 255,405 L 295,385 L 280,435 L 325,415 L 365,375 L 395,395 L 375,445
                   L 435,430 L 485,445 L 535,425 L 555,375 L 595,358 L 635,372 L 620,415 L 675,408 L 725,425 L 785,412 L 855,435 L 920,420 L 920,500 Z"
                fill="#171d1b" stroke="#3d4f49" stroke-width="1.5"/>

          <!-- 3. STEPPED TACTICAL AUSPEX SECTOR BOUNDARIES (From Official GW Auspex Map) -->
          <g fill="none" stroke="rgba(134, 239, 172, 0.22)" stroke-width="1.2">
            <polyline points="170,130 280,130 280,90 410,90 410,155 530,155 530,120 680,120 680,95 850,95"/>
            <polyline points="200,295 360,295 360,345 510,345 510,335 710,335 710,380 860,380"/>
            <polyline points="395,155 395,295"/>
            <polyline points="505,155 505,335"/>
            <polyline points="670,120 670,335"/>
          </g>

          <!-- 4. MOUNTAIN RANGES & RIVERS (Pallidus Mountains, Stygies River, Diablo Range) -->
          <g fill="none" stroke="#52525b" stroke-width="1.4" opacity="0.75">
            <!-- Mountains of Prime -->
            <path d="M 275,185 L 285,172 L 295,185 L 305,170 L 315,185 L 325,174 L 335,185"/>
            <path d="M 245,235 L 255,222 L 265,235 L 275,220 L 285,235"/>
            <!-- Mountains of Secundus (Pallidus & Hades Ridge) -->
            <path d="M 525,192 L 538,176 L 550,192 L 562,175 L 575,192 L 588,178 L 600,192"/>
            <path d="M 615,212 L 628,196 L 640,212 L 652,198 L 665,212"/>
          </g>
          <!-- Major Rivers (River Stygies & Boiling Sea Channels) -->
          <path d="M 390,142 Q 405,205 382,285" fill="none" stroke="#0ea5e9" stroke-width="1.8" opacity="0.45"/>
          <path d="M 545,190 Q 585,245 568,325" fill="none" stroke="#0ea5e9" stroke-width="1.8" opacity="0.45"/>

          <!-- 5. CANONICAL OCEAN, CONTINENT & LANDMARK LABELS -->
          <g fill="rgba(167, 243, 208, 0.45)" font-size="13" font-weight="700" letter-spacing="3">
            <text x="515" y="24" text-anchor="middle" fill="rgba(252, 165, 165, 0.75)" font-size="15">THE FIRE WASTES</text>
            <text x="445" y="96" text-anchor="middle">THE BOILING SEA</text>
            <text x="520" y="368" text-anchor="middle">THE TEMPEST OCEAN</text>
            <text x="505" y="482" text-anchor="middle" fill="rgba(156, 163, 175, 0.55)">THE DEADLANDS</text>
            <text x="88" y="295" text-anchor="middle" transform="rotate(-38 88 295)" font-size="11">THE OCEAN OF FURY</text>
          </g>

          <g fill="rgba(226, 232, 240, 0.55)" font-size="12" font-weight="800" letter-spacing="2">
            <text x="275" y="252" text-anchor="middle">ARMAGEDDON PRIME</text>
            <text x="695" y="232" text-anchor="middle">ARMAGEDDON SECUNDUS</text>
            <text x="445" y="204" text-anchor="middle" fill="#86efac" font-size="9.5" letter-spacing="1.2">EQUATORIAL JUNGLE</text>
            <text x="348" y="268" text-anchor="middle" fill="#9ca3af" font-size="8.5" letter-spacing="1">PLAINS OF ANTHRAND</text>
            <text x="580" y="108" text-anchor="middle" fill="#cbd5e1" font-size="8" letter-spacing="1">PHOENIX ISLAND</text>
            <text x="680" y="395" text-anchor="middle" fill="#9ca3af" font-size="8.5" letter-spacing="1">NETHERIA PENINSULA</text>
          </g>

          <!-- Background Canonical Hives & Mechanicus Sites (Non-Node Reference Landmarks) -->
          <use href="#hiveIcon" x="285" y="135"/>
          <text x="285" y="150" text-anchor="middle" fill="#86efac" font-size="6.5" opacity="0.8">HIVE TEMPESTORA</text>

          <use href="#hiveIcon" x="725" y="218"/>
          <text x="725" y="232" text-anchor="middle" fill="#86efac" font-size="6.5" opacity="0.8">HIVE ACHERON</text>

          <use href="#hiveIcon" x="725" y="295"/>
          <text x="725" y="309" text-anchor="middle" fill="#86efac" font-size="6.5" opacity="0.8">HIVE TARTARUS</text>

          <use href="#hiveIcon" x="795" y="145"/>
          <text x="795" y="159" text-anchor="middle" fill="#86efac" font-size="6.5" opacity="0.8">HIVE THORADDIS</text>

          <use href="#cogIcon" x="485" y="55"/>
          <use href="#cogIcon" x="575" y="120"/>
          <use href="#cogIcon" x="635" y="445"/>

          <!-- 6. AUSPEX COMPASS ROSE (Bottom-Left) & DEADLANDS SKULL WATERMARK -->
          <g transform="translate(135, 395)" opacity="0.55">
            <circle cx="0" cy="0" r="38" fill="none" stroke="#4ade80" stroke-width="1.5"/>
            <circle cx="0" cy="0" r="32" fill="none" stroke="#4ade80" stroke-width="0.8" stroke-dasharray="3,2"/>
            <circle cx="0" cy="0" r="22" fill="none" stroke="#4ade80" stroke-width="0.8"/>
            <ellipse cx="0" cy="0" rx="22" ry="9" fill="none" stroke="#4ade80" stroke-width="0.6" transform="rotate(-35)"/>
            <ellipse cx="0" cy="0" rx="9" ry="22" fill="none" stroke="#4ade80" stroke-width="0.6" transform="rotate(-35)"/>
            <polygon points="-28,-28 -18,-10 -10,-18" fill="#4ade80"/>
            <text x="-33" y="-32" fill="#4ade80" font-size="9" font-weight="800" transform="rotate(-45 -33 -32)">N</text>
          </g>

          <!-- Deadlands Skull Watermark -->
          <g transform="translate(455, 442)" opacity="0.16" fill="none" stroke="#86efac" stroke-width="2">
            <circle cx="0" cy="0" r="28"/>
            <path d="M -12,-6 C -12,-18 12,-18 12,-6 C 12,2 8,6 8,12 L -8,12 C -8,6 -12,2 -12,-6 Z" fill="#86efac"/>
            <circle cx="-5" cy="-4" r="3" fill="#06100d"/>
            <circle cx="5" cy="-4" r="3" fill="#06100d"/>
          </g>

          <!-- 7. TACTICAL TRANSIT CORRIDORS BETWEEN THE 8 CAMPAIGN NODES -->
          <g stroke-width="2.2" fill="none">
            <!-- Active Supply Corridors from Node 0 (Equatorial Jungle) -->
            <line x1="445" y1="245" x2="335" y2="195" stroke="#10b981" stroke-dasharray="5,4"/>
            <line x1="445" y1="245" x2="560" y2="230" stroke="#10b981" stroke-dasharray="5,4"/>
            <line x1="445" y1="245" x2="590" y2="435" stroke="rgba(74, 222, 128, 0.35)" stroke-dasharray="4,5"/>
            <!-- Deep Fog Corridors -->
            <line x1="335" y1="195" x2="210" y2="160" stroke="#3b2d54" stroke-dasharray="5,5"/>
            <line x1="335" y1="195" x2="555" y2="58" stroke="#4c1d24" stroke-dasharray="4,6"/>
            <line x1="210" y1="160" x2="555" y2="58" stroke="#4c1d24" stroke-dasharray="4,6"/>
            <line x1="560" y1="230" x2="650" y2="305" stroke="#3b2d54" stroke-dasharray="5,5"/>
            <line x1="560" y1="230" x2="695" y2="165" stroke="#3b2d54" stroke-dasharray="5,5"/>
            <line x1="650" y1="305" x2="590" y2="435" stroke="#3b2d54" stroke-dasharray="5,5"/>
            <line x1="650" y1="305" x2="695" y2="165" stroke="#3b2d54" stroke-dasharray="5,5"/>
            <line x1="695" y1="165" x2="555" y2="58" stroke="#7f1d1d" stroke-dasharray="5,4"/>
          </g>

          <!-- =============================================================== -->
          <!-- 8. INTERACTIVE CAMPAIGN SECTOR NODES (NODES 0 TO 7)             -->
          <!-- =============================================================== -->

          <!-- NODE 0: GOLGOTHA ARBOR-BASIN (EQUATORIAL JUNGLE — DISCOVERED) -->
          <g class="map-node-group atlas-node-group selected-node" data-node-id="0" onclick="selectAtlasNode(0)" style="cursor:pointer;">
            <circle cx="445" cy="245" r="31" class="node-selection-reticle" stroke="#f5b041" stroke-width="2" stroke-dasharray="4,3" fill="none"/>
            <circle cx="445" cy="245" r="24" fill="#0d2618" stroke="#10b981" stroke-width="3"/>
            <text x="445" y="242" text-anchor="middle" fill="#ffffff" font-size="10.5" font-weight="900">NODE 0</text>
            <text x="445" y="254" text-anchor="middle" fill="#f5b041" font-size="7.5" font-weight="800">A:1 • B:2 • H:1</text>
            <rect x="375" y="273" width="140" height="26" rx="4" fill="rgba(5, 12, 9, 0.88)" stroke="#10b981" stroke-width="1"/>
            <text x="445" y="285" text-anchor="middle" fill="#ecfdf5" font-size="8.5" font-weight="800">GOLGOTHA ARBOR-BASIN</text>
            <text x="445" y="295" text-anchor="middle" fill="#10b981" font-size="7" font-weight="700">[EQUATORIAL JUNGLE • ACTIVE]</text>
          </g>

          <!-- NODE 1: HIVE DEATH MIRE & PLAINS OF ANTHRAND (WEST ADJACENT) -->
          <g class="map-node-group atlas-node-group" data-node-id="1" onclick="selectAtlasNode(1)" style="cursor:pointer;">
            <circle cx="335" cy="195" r="28" class="node-selection-reticle" stroke="#f5b041" stroke-width="2" stroke-dasharray="4,3" fill="none"/>
            <circle cx="335" cy="195" r="21" fill="#151824" stroke="#f5b041" stroke-width="2" stroke-dasharray="4,2"/>
            <text x="335" y="192" text-anchor="middle" fill="#fde68a" font-size="10" font-weight="800">NODE 1</text>
            <text x="335" y="203" text-anchor="middle" fill="#c084fc" font-size="7.5" font-weight="700">[FOG • ?/8]</text>
            <rect x="275" y="220" width="120" height="24" rx="4" fill="rgba(10, 12, 18, 0.85)" stroke="#4b5563" stroke-width="1"/>
            <text x="335" y="231" text-anchor="middle" fill="#e2e8f0" font-size="8" font-weight="700">HIVE DEATH MIRE</text>
            <text x="335" y="240" text-anchor="middle" fill="#f5b041" font-size="6.8">[ANTHRAND FRONT]</text>
          </g>

          <!-- NODE 2: HIVE INFERNUS & STYGIES BRIDGES (EAST ADJACENT) -->
          <g class="map-node-group atlas-node-group" data-node-id="2" onclick="selectAtlasNode(2)" style="cursor:pointer;">
            <circle cx="560" cy="230" r="28" class="node-selection-reticle" stroke="#f5b041" stroke-width="2" stroke-dasharray="4,3" fill="none"/>
            <circle cx="560" cy="230" r="21" fill="#151824" stroke="#f5b041" stroke-width="2" stroke-dasharray="4,2"/>
            <text x="560" y="227" text-anchor="middle" fill="#fde68a" font-size="10" font-weight="800">NODE 2</text>
            <text x="560" y="238" text-anchor="middle" fill="#c084fc" font-size="7.5" font-weight="700">[FOG • ?/8]</text>
            <rect x="502" y="255" width="116" height="24" rx="4" fill="rgba(10, 12, 18, 0.85)" stroke="#4b5563" stroke-width="1"/>
            <text x="560" y="266" text-anchor="middle" fill="#e2e8f0" font-size="8" font-weight="700">HIVE INFERNUS</text>
            <text x="560" y="275" text-anchor="middle" fill="#f5b041" font-size="6.8">[SECUNDUS GATEWAY]</text>
          </g>

          <!-- NODE 3: HIVE VOLCANUS & PRIME UPLANDS (FAR WEST) -->
          <g class="map-node-group atlas-node-group" data-node-id="3" onclick="selectAtlasNode(3)" style="cursor:pointer;">
            <circle cx="210" cy="160" r="28" class="node-selection-reticle" stroke="#f5b041" stroke-width="2" stroke-dasharray="4,3" fill="none"/>
            <circle cx="210" cy="160" r="21" fill="#12151f" stroke="#7c3aed" stroke-width="2" stroke-dasharray="4,3"/>
            <text x="210" y="157" text-anchor="middle" fill="#c9d1d9" font-size="10" font-weight="800">NODE 3</text>
            <text x="210" y="168" text-anchor="middle" fill="#a855f7" font-size="7.5">[FOG • ?/8]</text>
            <rect x="150" y="185" width="120" height="24" rx="4" fill="rgba(10, 12, 18, 0.85)" stroke="#374151" stroke-width="1"/>
            <text x="210" y="196" text-anchor="middle" fill="#cbd5e1" font-size="8" font-weight="700">HIVE VOLCANUS</text>
            <text x="210" y="205" text-anchor="middle" fill="#9ca3af" font-size="6.8">[PRIME CALDERA]</text>
          </g>

          <!-- NODE 4: HIVE HELSREACH & TEMPEST DOCKS (SOUTHEAST) -->
          <g class="map-node-group atlas-node-group" data-node-id="4" onclick="selectAtlasNode(4)" style="cursor:pointer;">
            <circle cx="650" cy="305" r="28" class="node-selection-reticle" stroke="#f5b041" stroke-width="2" stroke-dasharray="4,3" fill="none"/>
            <circle cx="650" cy="305" r="21" fill="#12151f" stroke="#7c3aed" stroke-width="2" stroke-dasharray="4,3"/>
            <text x="650" y="302" text-anchor="middle" fill="#c9d1d9" font-size="10" font-weight="800">NODE 4</text>
            <text x="650" y="313" text-anchor="middle" fill="#a855f7" font-size="7.5">[FOG • ?/8]</text>
            <rect x="590" y="330" width="120" height="24" rx="4" fill="rgba(10, 12, 18, 0.85)" stroke="#374151" stroke-width="1"/>
            <text x="650" y="341" text-anchor="middle" fill="#cbd5e1" font-size="8" font-weight="700">HIVE HELSREACH</text>
            <text x="650" y="350" text-anchor="middle" fill="#9ca3af" font-size="6.8">[TEMPEST SHORE]</text>
          </g>

          <!-- NODE 5: NETHERIA PENINSULA & THE DEADLANDS (FAR SOUTH) -->
          <g class="map-node-group atlas-node-group" data-node-id="5" onclick="selectAtlasNode(5)" style="cursor:pointer;">
            <circle cx="590" cy="435" r="28" class="node-selection-reticle" stroke="#f5b041" stroke-width="2" stroke-dasharray="4,3" fill="none"/>
            <circle cx="590" cy="435" r="21" fill="#12151f" stroke="#7c3aed" stroke-width="2" stroke-dasharray="4,3"/>
            <text x="590" y="432" text-anchor="middle" fill="#c9d1d9" font-size="10" font-weight="800">NODE 5</text>
            <text x="590" y="443" text-anchor="middle" fill="#a855f7" font-size="7.5">[FOG • ?/8]</text>
            <rect x="525" y="460" width="130" height="24" rx="4" fill="rgba(10, 12, 18, 0.85)" stroke="#374151" stroke-width="1"/>
            <text x="590" y="471" text-anchor="middle" fill="#cbd5e1" font-size="8" font-weight="700">NETHERIA PENINSULA</text>
            <text x="590" y="480" text-anchor="middle" fill="#9ca3af" font-size="6.8">[DEADLANDS VAULTS]</text>
          </g>

          <!-- NODE 6: HIVE HADES RUINS & THORADDIS WASTES (NORTHEAST) -->
          <g class="map-node-group atlas-node-group" data-node-id="6" onclick="selectAtlasNode(6)" style="cursor:pointer;">
            <circle cx="695" cy="165" r="28" class="node-selection-reticle" stroke="#f5b041" stroke-width="2" stroke-dasharray="4,3" fill="none"/>
            <circle cx="695" cy="165" r="21" fill="#1a1218" stroke="#c084fc" stroke-width="2" stroke-dasharray="4,3"/>
            <use href="#ruinIcon" x="670" y="142"/>
            <text x="695" y="162" text-anchor="middle" fill="#f3e8ff" font-size="10" font-weight="800">NODE 6</text>
            <text x="695" y="173" text-anchor="middle" fill="#c084fc" font-size="7.5">[FOG • ?/8]</text>
            <rect x="630" y="190" width="130" height="24" rx="4" fill="rgba(18, 10, 16, 0.88)" stroke="#6b21a8" stroke-width="1"/>
            <text x="695" y="201" text-anchor="middle" fill="#e9d5ff" font-size="8" font-weight="700">HIVE HADES (RUINS)</text>
            <text x="695" y="210" text-anchor="middle" fill="#c084fc" font-size="6.8">[DIABLO ASH WASTES]</text>
          </g>

          <!-- NODE 7: THE FIRE WASTES & RED ANGEL'S GATE (FAR NORTH CITADEL) -->
          <g class="map-node-group atlas-node-group" data-node-id="7" onclick="selectAtlasNode(7)" style="cursor:pointer;">
            <circle cx="555" cy="58" r="31" class="node-selection-reticle" stroke="#f5b041" stroke-width="2" stroke-dasharray="4,3" fill="none"/>
            <circle cx="555" cy="58" r="23" fill="#280d12" stroke="#ff4757" stroke-width="2.5" stroke-dasharray="5,3"/>
            <text x="555" y="55" text-anchor="middle" fill="#fecdd3" font-size="10.5" font-weight="900">NODE 7</text>
            <text x="555" y="67" text-anchor="middle" fill="#ff4757" font-size="7.5" font-weight="800">[RIFT • ?/8]</text>
            <rect x="480" y="84" width="150" height="25" rx="4" fill="rgba(28, 8, 12, 0.9)" stroke="#ff4757" stroke-width="1.2"/>
            <text x="555" y="95" text-anchor="middle" fill="#ffe4e6" font-size="8.5" font-weight="800">RED ANGEL'S GATE</text>
            <text x="555" y="104" text-anchor="middle" fill="#ff4757" font-size="6.8" font-weight="700">[THE FIRE WASTES CITADEL]</text>
          </g>
        </svg>
      </div>
    </div>

    <!-- NODE INSPECTOR & PARALLEL 8-PIP HEGEMONY BARS -->
    <div id="atlas-node-inspector" class="card" style="margin-bottom:20px; border-left:4px solid var(--green);">
      <div class="section-header" style="margin-top:0;">
        <h3 id="inspectorNodeTitle">Sector Node 0: Equatorial Jungle // The Golgotha Arbor-Basin</h3>
        <span class="status-pill" id="inspectorNodeBadge">DISCOVERED • CONTESTED</span>
      </div>
      <p id="inspectorNodeLore" class="card-desc"></p>
      <div id="inspectorNodeRule" class="card" style="background:#0b0d13; margin:12px 0; font-size:0.88rem;"></div>

      <h4 style="margin:14px 0 8px 0; font-size:0.85rem; text-transform:uppercase; color:var(--gold);">
        Parallel Sector Hegemony Race (First to 8 HP Locks &amp; Conquers Sector)
      </h4>

      <div style="margin-bottom:10px;">
        <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:4px;">
          <span>🦅 Commander Alpha (Gatebreakers)</span>
          <strong id="heg-label-alpha">1 / 8 HP</strong>
        </div>
        <div id="heg-bar-alpha" style="display:grid; grid-template-columns:repeat(8, 1fr); gap:4px; height:12px;"></div>
      </div>

      <div style="margin-bottom:10px;">
        <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:4px;">
          <span>💀 Commander Beta (JUNEBUG)</span>
          <strong id="heg-label-beta">2 / 8 HP</strong>
        </div>
        <div id="heg-bar-beta" style="display:grid; grid-template-columns:repeat(8, 1fr); gap:4px; height:12px;"></div>
      </div>

      <div>
        <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:4px;">
          <span>👁️‍🗨️ 3rd Alliance Overlord (Horde AI)</span>
          <strong id="heg-label-horde">1 / 8 HP</strong>
        </div>
        <div id="heg-bar-horde" style="display:grid; grid-template-columns:repeat(8, 1fr); gap:4px; height:12px;"></div>
      </div>
    </div>
  </div>

  <!-- ================================================================= -->
  <!-- TAB 4: HORDE → CRUSADE ROSTER PROGRESSION RULES                   -->
  <!-- ================================================================= -->
  <div id="dossierRules" class="hidden">
    <div class="hero-card" style="margin-bottom:20px;">
      <div class="status-pill">Campaign Synergy Rules • Mode B → Administratum Roster</div>
      <h1 class="hero-title" style="font-size:1.75rem; margin-top:8px;">Spoils of Breach Containment</h1>
      <p class="hero-subtitle">
        Completing your confidential Secret Objective, extracting Fortifications, and banking leftover Supply Points in Horde Mode permanently strengthens your Crusade Order of Battle.
      </p>
    </div>

    <div class="card" style="margin-bottom:16px; border-left:4px solid var(--red);">
      <h3 style="margin-top:0; color:var(--red);">1. The Traitor's Bounty (Covert Betrayal Payout)</h3>
      <p class="card-desc">
        Completing a Secret Objective carrying the <strong>Traitor</strong> tag in Co-op Horde Mode requires orchestrating the downfall of your partner amidst the breach. Because of the extreme risk and the permanent grudge it creates, fulfilling a <strong>Traitor Directive</strong> awards a <strong>Double Spoils Payout</strong>:
      </p>
      <ul style="font-size:0.9rem; line-height:1.6;">
        <li><strong>Plundered Command Cache:</strong> Steal <strong>1 Requisition Point (RP)</strong> (or <strong>2 Strategic Points</strong>) directly from the betrayed Commander, <strong>AND</strong> expand your Crusade Force's <strong>Supply Limit by +200 pts</strong> for free.</li>
        <li><strong>Forbidden Spoils of Treachery:</strong> Bestow a free <strong>Battle Honour</strong> (or an Armageddon <strong>Antiquity Relic</strong> if a Character) upon your Warlord or the unit that executed the betrayal, <strong>plus +3 bonus XP</strong>.</li>
        <li><strong>Shipboard Shift (Alpha Only):</strong> Completing a Traitor directive shifts <em>The Sanctuary of Ash</em> Balance Slider <strong>1 step toward the Lower Decks (-1)</strong>.</li>
        <li><strong>The Grudge Consequence:</strong> In your next 1v1 PvP clash, the betrayed Commander automatically receives <strong>1 free Armageddon Crusade Blessing</strong> even if they are not the Underdog!</li>
      </ul>
    </div>

    <div class="card" style="margin-bottom:16px; border-left:4px solid var(--gold);">
      <h3 style="margin-top:0; color:var(--gold);">2. Standard Secret Objective Victor Bonuses</h3>
      <p class="card-desc">
        Completing any non-Traitor Secret Objective (and surviving Round 6 if required) awards <strong>+5 Strategic Points</strong>, <strong>+1 bonus RP (or +100 pts Supply Limit)</strong>, plus the reward matching your card's tag:
      </p>
      <ul style="font-size:0.9rem; line-height:1.6;">
        <li><strong>Action / Relic Directives:</strong> The unit that completed the Action earns a free <strong>Battle Trait</strong> or <strong>Weapon Modification</strong> (or a free <strong>Crusade Relic</strong> if a Character) without needing to rank up.</li>
        <li><strong>Kill / Combat Directives:</strong> Select <strong>one additional unit</strong> to be <em>Marked for Greatness (+3 XP)</em> at the end of the battle.</li>
        <li><strong>Support / Fortify / Extraction Directives:</strong> Claim a free <strong>Repair and Recuperate</strong> Requisition after the battle (heal 1 Battle Scar on any unit for 0 RP).</li>
      </ul>
    </div>

    <div class="card" style="margin-bottom:16px; border-left:4px solid var(--blue);">
      <h3 style="margin-top:0; color:var(--blue);">3. Field Promotions, Leftover SP &amp; Persistent Fortifications</h3>
      <ul style="font-size:0.9rem; line-height:1.6;">
        <li><strong>"A Name Earned" (1 SP) Discount:</strong> If a Character buys <em>A Name Earned</em> during Horde Mode, survives Round 6, and slays a Horde Character/Monster/Vehicle (or completes an Action), reduce the RP cost of making that Enhancement permanent via <em>Renowned Heroes</em> by <strong>1 RP</strong> (min 1 RP).</li>
        <li><strong>Recruiting Reinforcements:</strong> Any unit summoned via <em>Reinforcements Arrive (12 SP)</em> or <em>Field Promotion (X SP)</em> that survives Round 6 can be inducted directly into your Order of Battle starting with <strong>3 XP</strong>!</li>
        <li><strong>Leftover SP Salvage:</strong> Unspent SP after surviving Round 6 can be cashed in: <strong>2 SP</strong> = Orbital Auspex Recon Probe into an adjacent Fog-of-War Sector Node; <strong>3 SP</strong> = Bank a 1v1 <em>Supply Cache Token</em>; <strong>5 SP</strong> = +2 XP to a surviving unit; <strong>8 SP</strong> = +1 RP or +100 pts Supply Limit.</li>
        <li><strong>Extracted Fortifications:</strong> Still controlling a Fortified Objective at the end of Round 6 grants a sector bonus: <strong>Field Hospital</strong> (all destroyed units auto-pass Out of Action tests), <strong>Ammo Dump</strong> (free Weapon Mod or +2 XP), <strong>War Trench</strong> (+1 XP to surviving Infantry/Battleline), or <strong>FOB</strong> (+1 bonus SPt &amp; +1 Sector Hegemony Pip).</li>
      </ul>
    </div>
  </div>

  <div class="btn-row" style="display:flex; gap:12px; margin-top:20px; flex-wrap:wrap;">
    <a href="roster.html" class="terminal-link-btn alt">
      🎖️ View Dramatis Personae &amp; Nemesis Ledger →
    </a>
    <a href="../index.html" class="terminal-link-btn">
      ⚔️ Open Tactical Command Terminal →
    </a>
  </div>

</div>

<script>
const BRIEFING_STORAGE_KEY = 'foa_briefing_state_v1';
const STORAGE_KEY_BRIEFING = BRIEFING_STORAGE_KEY;

const SHIP_SLIDER_DATA = {
  "-3": {
    title: "-3 // Lower Decks Abyss (Full Mutiny & Heretical Unsealing)",
    desc: "<strong>Buff:</strong> Krieg Infantry gain <em>Sustained Hits 1</em> in melee &amp; <em>Feel No Pain 5+</em> within 6\" of <em>The Exile</em>.<br><strong>Quicksand Penalty:</strong> High Sanctum cuts orbital support (<em>Air Strike / Artillery Strike</em> cost +2 SP). If the 3rd Alliance wins the Phase, Saint Celestine &amp; Aestred Thurga deploy as hostile Executioners against you!"
  },
  "-2": {
    title: "-2 // Silent Insurrection (The Brig Bleeds)",
    desc: "<strong>Buff:</strong> Keep -1 buffs, plus Commissar Dravik's summary executions grant +1 SP in Horde Mode.<br><strong>Quicksand Penalty:</strong> High Sanctum locks the med-bays (<em>Field Hospital</em> costs +2 SP, and failed Out of Action tests suffer -1)."
  },
  "-1": {
    title: "-1 // Lower Decks Favored (★ THE ASH-HOLD SWEET SPOT ★)",
    desc: "<strong>Sweet Spot Buff:</strong> Your Krieg Battleline &amp; Combat Engineers gain <strong>Feel No Pain 6+</strong> while within 6\" of <em>The Exile</em>, and your first <em>Resupply / Reinforcements</em> purchase each battle costs <strong>-1 SP</strong>.<br><strong>Phase Vault:</strong> Unlocks the <strong>Phase-End Shipboard Cache (+1 bonus RP or +100 pts Supply Limit)</strong> with zero High Sanctum penalties!"
  },
  "0": {
    title: "0 // Balanced — Synchronized Broadsides",
    desc: "<strong>Status:</strong> Uneasy equilibrium between the Lower Decks and the High Sanctum. Standard Crusade and Horde Mode rules apply with no shipboard penalties or Sweet Spot bonuses."
  },
  "1": {
    title: "+1 // High Sanctum Favored (★ THE SANCTUM SWEET SPOT ★)",
    desc: "<strong>Sweet Spot Buff:</strong> Appeasing the Sororitas Wardens grants <em>The Exile's</em> unit <strong>re-roll 1s to Hit</strong> and reduces the SP cost of your first <em>Strike</em> or <em>Fortify</em> purchase each battle by <strong>1 SP</strong>.<br><strong>Phase Vault:</strong> Unlocks the <strong>Phase-End Shipboard Cache (+1 bonus RP or +100 pts Supply Limit)</strong>!"
  },
  "2": {
    title: "+2 // Strict Atonement (No Retreat for the Condemned)",
    desc: "<strong>Buff:</strong> Keep +1 buffs.<br><strong>Quicksand Penalty:</strong> Sororitas Arbites lock the hangars—you are <strong>locked out of Traitor Secret Objectives</strong>, cannot use <em>Emergency Evac (5 SP)</em>, and any unit that Falls Back suffers <strong>D3 Mortal Wounds</strong>!"
  },
  "3": {
    title: "+3 // Total High Sanctum Tyranny (The Martyr's Tithe)",
    desc: "<strong>Buff:</strong> Keep +1/+2 buffs, plus gain 1 free Miracle Die (valued at 5) once per battle for <em>The Exile</em>.<br><strong>Quicksand Penalty:</strong> The Sororitas confiscate your Phase-End Cache (+1 RP), and <em>The Exile</em> must pass a Leadership test (-1) after every battle or suffer an automatic Battle Scar (<em>Scorched by Purity Seals</em>)!"
  }
};

const ATLAS_NODES = {
  0: {
    title: "Sector Node 0: Equatorial Jungle // The Golgotha Arbor-Basin",
    badge: "DISCOVERED • CONTESTED ISTHMUS",
    lore: "Located in the dense, burning Equatorial Jungle belt bridging Armageddon Prime and Secundus near Cerbera Base. Blackened iron-wood trunks and the shattered stained-glass hulls of Session 0 Exorcists litter the central Landing Site.",
    rule: "<strong>Active Sector Rule (Canopy &amp; Wreckage):</strong> Forest terrain grants <strong>Stealth</strong> to Infantry wholly within it, and the central Landing Site objective grants <strong>Benefit of Cover</strong>. Ending a turn within 3\" of the center or Defender's home objective requires a Leadership test or inflicts <strong>1 Warp Counter</strong>.",
    alphaHP: 1,
    betaHP: 2,
    hordeHP: 1
  },
  1: {
    title: "Sector Node 1: Plains of Anthrand & Hive Death Mire [FOG OF WAR]",
    badge: "UNDISCOVERED • WESTERN FRONT (PRIME)",
    lore: "Just west of the Equatorial Jungle across the River Stygies. Acidic mire-swamps and the outer ferrocrete bastions of Hive Death Mire guard the approach into Armageddon Prime. Deploy here or spend 2 Leftover SP on an Auspex Probe to lift the fog.",
    rule: "<strong>Sector Telemetry:</strong> <em>[CLASSIFIED UNTIL RECONNOITERED]</em>",
    alphaHP: 0,
    betaHP: 0,
    hordeHP: null
  },
  2: {
    title: "Sector Node 2: Hive Infernus & Stygies Crossings [FOG OF WAR]",
    badge: "UNDISCOVERED • EASTERN FRONT (SECUNDUS)",
    lore: "The western gateway into Armageddon Secundus. Massive promethium pipelines and fortified highway bridges span the boiling sulfur channels at the foot of Hive Infernus.",
    rule: "<strong>Sector Telemetry:</strong> <em>[CLASSIFIED UNTIL RECONNOITERED]</em>",
    alphaHP: 0,
    betaHP: 0,
    hordeHP: null
  },
  3: {
    title: "Sector Node 3: Armageddon Prime // Hive Volcanus & Tempestora [FOG OF WAR]",
    badge: "UNDISCOVERED • VOLCANIC UPLANDS",
    lore: "The jagged western fjords and volcanic calderas of Armageddon Prime, flanked by the Ocean of Fury and the Boiling Sea. Heavy geothermal interference masks all 3rd Alliance movement.",
    rule: "<strong>Sector Telemetry:</strong> <em>[CLASSIFIED UNTIL RECONNOITERED]</em>",
    alphaHP: 0,
    betaHP: 0,
    hordeHP: null
  },
  4: {
    title: "Sector Node 4: Hive Helsreach & Tempest Ocean Docks [FOG OF WAR]",
    badge: "UNDISCOVERED • SOUTHERN INDUSTRIAL COAST",
    lore: "Sprawling coastal refineries, titan-drydocks, and ruined hab-blocks along the southern shore of Armageddon Secundus between Hive Helsreach and Hive Tartarus.",
    rule: "<strong>Sector Telemetry:</strong> <em>[CLASSIFIED UNTIL RECONNOITERED]</em>",
    alphaHP: 0,
    betaHP: 0,
    hordeHP: null
  },
  5: {
    title: "Sector Node 5: Netheria Peninsula & The Deadlands [FOG OF WAR]",
    badge: "UNDISCOVERED • SUB-POLAR WASTES",
    lore: "Across the toxic swells of the Tempest Ocean lie the frozen, silent Deadlands and the industrial outposts of the Netheria Peninsula—rumored to conceal ancient xenos and imperial vaults.",
    rule: "<strong>Sector Telemetry:</strong> <em>[CLASSIFIED UNTIL RECONNOITERED]</em>",
    alphaHP: 0,
    betaHP: 0,
    hordeHP: null
  },
  6: {
    title: "Sector Node 6: Ruins of Hive Hades & Hive Thoraddis [FOG OF WAR]",
    badge: "UNDISCOVERED • SHATTERED HIVE WASTES",
    lore: "The devastated northeastern plains of Armageddon Secundus. Amidst the radioactive glass of ruined Hive Hades and the besieged spires of Hive Thoraddis, violent warp-tremors echo through the ash.",
    rule: "<strong>Sector Telemetry:</strong> <em>[CLASSIFIED UNTIL RECONNOITERED]</em>",
    alphaHP: 0,
    betaHP: 0,
    hordeHP: null
  },
  7: {
    title: "Sector Node 7: The Fire Wastes & The Red Angel's Gate [FOG OF WAR]",
    badge: "UNDISCOVERED • NORTHERN POLAR CITADEL",
    lore: "Across the Boiling Sea and past Phoenix Island lies the scorched northern continent of the Fire Wastes—where the Crimson Mesa and the Red Angel's Gate bleed endless nightmare legions into reality.",
    rule: "<strong>Sector Telemetry:</strong> <em>[CLASSIFIED UNTIL RECONNOITERED]</em>",
    alphaHP: 0,
    betaHP: 0,
    hordeHP: null
  }
};

let briefingState = {
  activeDossier: 'beta',
  unlockedAlpha: false,
  unlockedBeta: false,
  shipSlider: 0,
  selectedNode: 0
};

function saveBriefingState() {
  try {
    localStorage.setItem(BRIEFING_STORAGE_KEY, JSON.stringify(briefingState));
  } catch (e) {
    console.warn('Could not save briefing state:', e);
  }
}

function restoreBriefingState() {
  try {
    const raw = localStorage.getItem(BRIEFING_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      briefingState = { ...briefingState, ...parsed };
    }
  } catch (e) {
    console.warn('Could not restore briefing state:', e);
  }

  // URL hash navigation takes precedence if a valid hash is specified
  const validTabs = ['alpha', 'beta', 'atlas', 'rules'];
  const hashTab = (window.location.hash || '').replace('#', '').toLowerCase();
  if (validTabs.includes(hashTab)) {
    briefingState.activeDossier = hashTab;
  }

  applyBriefingState();
}

function applyBriefingState() {
  showDossier(briefingState.activeDossier, false);
  if (briefingState.unlockedAlpha) unlockTab('Alpha', false);
  if (briefingState.unlockedBeta) unlockTab('Beta', false);
  selectSlider(briefingState.shipSlider, false);
  selectAtlasNode(briefingState.selectedNode, false);
}

function showDossier(which, persist = true) {
  briefingState.activeDossier = which;
  const map = {
    alpha: ['dossierAlpha', 'btnAlpha'],
    beta: ['dossierBeta', 'btnBeta'],
    atlas: ['dossierAtlas', 'btnAtlas'],
    rules: ['dossierRules', 'btnRules']
  };
  Object.keys(map).forEach(k => {
    const [divId, btnId] = map[k];
    const divEl = document.getElementById(divId);
    const btnEl = document.getElementById(btnId);
    if (divEl) divEl.classList.toggle('hidden', k !== which);
    if (btnEl) btnEl.classList.toggle('active', k === which);
  });
  if (persist) saveBriefingState();
}

function unlockTab(who, persist = true) {
  const gate = document.getElementById('gate' + who);
  const content = document.getElementById('content' + who);
  if (gate) gate.classList.add('hidden');
  if (content) content.classList.remove('hidden');
  if (who === 'Alpha') briefingState.unlockedAlpha = true;
  if (who === 'Beta') briefingState.unlockedBeta = true;
  if (persist) saveBriefingState();
}

function lockTab(who, persist = true) {
  const gate = document.getElementById('gate' + who);
  const content = document.getElementById('content' + who);
  if (gate) gate.classList.remove('hidden');
  if (content) content.classList.add('hidden');
  if (who === 'Alpha') briefingState.unlockedAlpha = false;
  if (who === 'Beta') briefingState.unlockedBeta = false;
  if (persist) saveBriefingState();
}

function selectSlider(val, persist = true) {
  const key = String(val);
  briefingState.shipSlider = Number(val);
  for (let i = -3; i <= 3; i++) {
    const btn = document.getElementById('sliderBtn' + i);
    if (btn) btn.classList.toggle('active', i === Number(val));
    const nodeEl = document.getElementById('node' + i);
    if (nodeEl) nodeEl.classList.toggle('active', i === Number(val));
  }
  const info = SHIP_SLIDER_DATA[key] || SHIP_SLIDER_DATA["0"];
  const label = document.getElementById('shipSliderLabel');
  const box = document.getElementById('sliderDetailBox');
  if (label) label.textContent = `Current State: ${info.title}`;
  if (box) box.innerHTML = `<div style="font-weight:800; color:var(--gold); margin-bottom:6px;">${info.title}</div><div style="font-size:0.88rem; line-height:1.55;">${info.desc}</div>`;
  if (persist) saveBriefingState();
}

function renderHegBar(containerId, count, activeClass) {
  const el = document.getElementById(containerId);
  if (!el) return;
  if (count === null) {
    el.innerHTML = Array.from({ length: 8 }, () =>
      `<div class="heg-seg unknown-fog" style="border-radius:3px; border:1px solid #6e40aa;"></div>`
    ).join('');
    return;
  }
  el.innerHTML = Array.from({ length: 8 }, (_, idx) => {
    const filled = idx < count;
    const bg = filled
      ? (activeClass === 'alpha' ? '#f5b041' : activeClass === 'beta' ? '#3b82f6' : '#ff4757')
      : '#161b22';
    return `<div class="heg-seg ${filled ? 'active-' + activeClass : ''}" style="background:${bg}; border-radius:3px; border:1px solid #262c40;"></div>`;
  }).join('');
}

function selectAtlasNode(nodeId, persist = true) {
  const n = ATLAS_NODES[nodeId] || ATLAS_NODES[0];
  briefingState.selectedNode = nodeId;

  document.querySelectorAll('#armageddon-sector-map .atlas-node-group, #armageddon-sector-map .map-node-group').forEach(el => {
    el.classList.toggle('selected-node', Number(el.getAttribute('data-node-id')) === nodeId);
  });

  const titleEl = document.getElementById('inspectorNodeTitle') || document.getElementById('insp-title');
  if (titleEl) titleEl.textContent = n.title;

  const badgeEl = document.getElementById('inspectorNodeBadge') || document.getElementById('insp-badge');
  if (badgeEl) badgeEl.textContent = n.badge;

  const loreEl = document.getElementById('inspectorNodeLore') || document.getElementById('insp-desc');
  if (loreEl) loreEl.textContent = n.lore;

  const ruleEl = document.getElementById('inspectorNodeRule') || document.getElementById('insp-rule');
  if (ruleEl) ruleEl.innerHTML = n.rule;

  const lblAlpha = document.getElementById('heg-label-alpha') || document.getElementById('heg-val-alpha');
  if (lblAlpha) lblAlpha.textContent = `${n.alphaHP} / 8 HP`;

  const lblBeta = document.getElementById('heg-label-beta') || document.getElementById('heg-val-beta');
  if (lblBeta) lblBeta.textContent = `${n.betaHP} / 8 HP`;

  const lblHorde = document.getElementById('heg-label-horde') || document.getElementById('heg-val-horde');
  if (lblHorde) {
    lblHorde.textContent = n.hordeHP === null ? `??? / 8 HP (Shrouded in Ash)` : `${n.hordeHP} / 8 HP`;
  }

  renderHegBar('heg-bar-alpha', n.alphaHP, 'alpha');
  renderHegBar('heg-bar-beta', n.betaHP, 'beta');
  renderHegBar('heg-bar-horde', n.hordeHP, 'horde');

  if (persist) saveBriefingState();
}

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', restoreBriefingState);
} else {
  restoreBriefingState();
}
</script>

</body>
</html>
````

---

## File: `pages/pvp.html` <a id="file-pagespvphtml"></a>

````html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fires of Armageddon // 1v1 Ash Wastes PvP</title>
  <link rel="icon" type="image/svg+xml" href="../assets/favicon.svg">
  <link rel="apple-touch-icon" href="../assets/favicon.svg">
  <style>
    :root {
      --bg: #0a0b10;
      --surface: #141720;
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
      background-image: radial-gradient(circle at 50% 0%, rgba(245, 176, 65, 0.12) 0%, transparent 55%);
      color: var(--text);
      margin: 0; padding: 0; line-height: 1.5;
    }
    .suite-nav {
      background: rgba(12, 14, 20, 0.95); border-bottom: 1px solid var(--border);
      padding: 8px 16px; display: flex; justify-content: center; gap: 8px; flex-wrap: wrap;
    }
    .suite-link {
      text-decoration: none; font-size: 0.78rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.8px; padding: 6px 12px; border-radius: 8px; color: var(--muted); border: 1px solid transparent;
    }
    .suite-link:hover { color: var(--text); background: var(--surface); }
    .suite-link.active {
      color: var(--gold); background: rgba(245, 176, 65, 0.12); border-color: rgba(245, 176, 65, 0.35);
    }
    .app-shell { max-width: 720px; margin: 0 auto; padding: 16px; }
    .hero-banner {
      background: linear-gradient(135deg, #221c14 0%, #141720 100%);
      border: 1px solid rgba(245, 176, 65, 0.35);
      border-radius: 18px; padding: 24px; text-align: center; margin-bottom: 20px;
    }
    .hero-banner h1 { margin: 0 0 6px 0; font-size: 1.6rem; text-transform: uppercase; color: var(--gold); }
    .hero-banner p { margin: 0; color: var(--muted); font-size: 0.9rem; }
    .card {
      background: var(--surface); border: 1px solid var(--border);
      border-left: 4px solid var(--gold); border-radius: 12px;
      padding: 18px; margin-bottom: 16px;
    }
    .card.red { border-left-color: var(--red); }
    .card.purple { border-left-color: var(--purple); }
    .badge {
      display: inline-block; font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
      padding: 3px 8px; border-radius: 6px; margin-bottom: 8px;
      background: rgba(245, 176, 65, 0.15); color: var(--gold);
    }
    .badge.red { background: rgba(255, 71, 87, 0.15); color: var(--red); }
    .badge.purple { background: rgba(157, 92, 255, 0.15); color: var(--purple); }
    h3 { margin: 0 0 8px 0; font-size: 1.1rem; }
    p { margin: 0 0 10px 0; color: #c9d1d9; font-size: 0.92rem; }
    button {
      background: var(--gold); color: #111; border: none; padding: 10px 16px;
      border-radius: 10px; font-size: 0.88rem; font-weight: 700; cursor: pointer;
    }
    button.btn-red { background: var(--red); color: #fff; }
    button.btn-purple { background: var(--purple); color: #fff; }
    select {
      background: var(--bg); color: var(--text); border: 1px solid var(--border);
      padding: 9px 12px; border-radius: 8px; font-size: 0.9rem;
    }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .stat-box {
      background: var(--bg); border: 1px solid var(--border); border-radius: 10px;
      padding: 12px; text-align: center;
    }
  </style>
</head>
<body>

  <nav class="suite-nav">
    <a href="../index.html" class="suite-link">🧟 Mode 1: Horde Command &amp; Spawner</a>
    <a href="pvp.html" class="suite-link active">⚔️ Mode 2: 1v1 Ash Wastes PvP</a>
    <a href="rogue.html" class="suite-link">🎲 Mode 3: Rogue Sector &amp; AI Tracker</a>
    <a href="roster.html" class="suite-link">🎖️ Rosters &amp; Nemesis Ledger</a>
    <a href="briefing.html" class="suite-link">📜 Briefings, Ship &amp; Atlas</a>
  </nav>

  <div class="app-shell">
    <div class="hero-banner">
      <h1>1v1 Ash Wastes Clash</h1>
      <p>Armageddon Crusade Mission Environment, Warp Anomalies &amp; Unbound Adversaries</p>
    </div>

    <!-- 1. HELLSCAPE GENERATOR -->
    <div class="card">
      <span class="badge">Planetary Environment • Hellscape</span>
      <h3>Active Armageddon Hellscape</h3>
      <div style="display:flex; gap:8px; margin-bottom:12px; flex-wrap:wrap;">
        <select id="hellscapeSelect" onchange="renderHellscape()" style="flex:1;">
          <option value="0">1 - Folded Space (Perilous Shortcuts)</option>
          <option value="1">2 - Fractured Realm (Empyric Fissures)</option>
          <option value="2">3 - Fading Reality (Phasing Cover &amp; Sight)</option>
          <option value="3">4 - Staggered Time (Odd/Even Round Objectives)</option>
          <option value="4">5 - Gravitic Nexus (Gravity Inversion Launch)</option>
          <option value="5">6 - Banishing Rifts (Daemon &amp; Warp Flux)</option>
        </select>
        <button onclick="rollRandomHellscape()">🎲 Roll D6</button>
      </div>
      <p id="hellscapeDesc" style="margin:0;"></p>
    </div>

    <!-- 2. WARP EVENT & ANOMALY TRACKER -->
    <div class="card purple">
      <span class="badge purple">Start of Battle Round • Warp Storm</span>
      <h3>Warp Event &amp; Anomaly Surge Roller</h3>
      <div style="display:flex; gap:8px; margin-bottom:12px; flex-wrap:wrap;">
        <select id="warpIntensity" onchange="savePvpState()">
          <option value="minor">Intensity: Minor (Surge on 5+)</option>
          <option value="major" selected>Intensity: Major (Surge on 4+)</option>
          <option value="catastrophic">Intensity: Catastrophic (Surge on 3+)</option>
        </select>
        <button class="btn-purple" onclick="rollWarpAnomaly()">⚡ Roll Battle Round Anomaly</button>
      </div>
      <div id="anomalyResultBox" class="stat-box" style="text-align:left;">
        <p style="margin:0;">Tap "Roll Battle Round Anomaly" at the start of each round to test for Warp Surges and Anomalies.</p>
      </div>
    </div>

    <!-- 3. UNBOUND ADVERSARIES (3RD ALLIANCE INTERFERENCE) -->
    <div class="card red">
      <span class="badge red">3rd Alliance Interference • Unbound Adversaries</span>
      <h3>Unbound Adversaries AI Turn &amp; Vulture Tracker</h3>
      <p>At the start of each Battle Round, Unbound Adversaries take their turn (Move → Shoot → Charge → Fight closest player unit). While you two fight, the Campaign Master's 3rd Alliance vultures <strong>3 Strategic Points</strong> (+1 extra SPt if Unbound Adversaries destroy at least 1 player unit!).</p>
      
      <div class="grid-2" style="margin-bottom:12px;">
        <div class="stat-box">
          <div style="font-size:0.75rem; color:var(--muted);">3RD ALLIANCE VULTURE PTS</div>
          <div id="vulturePts" style="font-size:1.5rem; font-weight:800; color:var(--red);">3 SPts</div>
          <label style="font-size:0.8rem; cursor:pointer;">
            <input type="checkbox" id="vultureKillCheck" onchange="updateVulture()"> Destroyed a Player Unit (+1)
          </label>
        </div>
        <div class="stat-box">
          <div style="font-size:0.75rem; color:var(--muted);">SPAWN UNBOUND THREAT</div>
          <button class="btn-red" style="margin-top:8px; width:100%;" onclick="rollUnboundAdversary()">🎲 Roll Adversary</button>
        </div>
      </div>
      <div id="unboundResult" class="stat-box" style="text-align:left;">
        <p style="margin:0;">Roll above to see which Unbound Adversary datasheet or Roaming Nemesis invades No Man's Land.</p>
      </div>
    </div>
  </div>

<script>
const HELLSCAPES = [
  "<strong>Folded Space:</strong> Units wholly within 3\" of a battlefield edge can use a <em>Perilous Shortcut</em> to teleport to the opposite battlefield edge (>9\" from enemies), rolling 1D6: on a 1, suffer D3 mortal wounds.",
  "<strong>Fractured Realm:</strong> Reality cracks across No Man's Land. Units advancing or charging across objective markers must roll 1D6: on a 1, suffer D3 mortal wounds; on a 6, gain +2\" to the move.",
  "<strong>Fading Reality:</strong> Ranged attacks targeting units more than 18\" away suffer -1 to Hit as silhouettes flicker between realspace and the warp.",
  "<strong>Staggered Time:</strong> Temporal echoes distort objectives. In Odd Battle Rounds, Northern/Eastern NML objectives grant bonus VP; in Even Battle Rounds, Southern/Western NML objectives grant bonus VP.",
  "<strong>Gravitic Nexus:</strong> Units starting their Movement phase within range of an objective marker may trigger Gravity Inversion—gaining FLY and +3\" Move for that phase.",
  "<strong>Banishing Rifts:</strong> Units with Warp Counters or the DAEMON keyword re-roll Wound rolls of 1 while within No Man's Land, but suffer 1 mortal wound on unmodified save rolls of 1."
];

const ANOMALIES = [
  "<strong>Blood Rain of Khorne:</strong> All melee weapons across the battlefield gain [SUSTAINED HITS 1] until the end of the battle round.",
  "<strong>Empyric Backlash:</strong> Each unit with a Warp Counter or PSYKER keyword suffers D3 mortal wounds, then gains a 5+ Invulnerable Save this round.",
  "<strong>Ash Storm Blindness:</strong> All units gain the Stealth ability against ranged attacks made from more than 12\" away this round.",
  "<strong>Rift Eruption:</strong> Spawn 1 Unbound Adversary unit within 6\" of the center of the battlefield (>9\" from player units).",
  "<strong> Choruses of Madness:</strong> All units must subtract 1 from Battle-shock and Leadership tests until the end of the battle round.",
  "<strong>Warp-Surge Empowerment:</strong> Characters add +1 to the Attacks and Strength characteristics of their melee weapons this round."
];

const UNBOUND_UNITS = [
  "<strong>Lesser Daemons (Power Level 1):</strong> 10-model Infantry squad (32mm bases) — M6\" T4 Sv5+ Inv4+ W1 | 2A WS3+ S4 AP-1 D1.",
  "<strong>Abominations (Power Level 2):</strong> 2–4 model Infantry/Beast unit (50mm bases) — M8\" T5 Sv4+ FNP5+ W4 | D6+2A WS4+ S5 AP-1 D2.",
  "<strong>Daemonic Beasts (Power Level 3):</strong> 3–6 model Mounted/Beast unit (75mm/90mm oval bases) — M10\" T6 Sv4+ Inv4+ W4 | 4A WS3+ S6 AP-2 D2 (Lance).",
  "<strong>Greater Daemon / Roaming Nemesis (Power Level 4):</strong> Monster/Walker (100mm+ base) OR an Inducted Campaign Nemesis Character from the Ledger!"
];

const STORAGE_KEY_PVP = 'foa_pvp_state_v1';

function savePvpState() {
  if (typeof localStorage === 'undefined') return;
  try {
    const data = {
      hellscapeIdx: parseInt(document.getElementById('hellscapeSelect').value, 10) || 0,
      warpIntensity: document.getElementById('warpIntensity').value || 'major',
      anomalyHtml: document.getElementById('anomalyResultBox').innerHTML,
      vultureKilled: document.getElementById('vultureKillCheck').checked,
      unboundHtml: document.getElementById('unboundResult').innerHTML
    };
    localStorage.setItem(STORAGE_KEY_PVP, JSON.stringify(data));
  } catch (e) {
    console.warn('Could not save pvp state:', e);
  }
}

function restorePvpState() {
  if (typeof localStorage === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PVP);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (!data) return;

    if (typeof data.hellscapeIdx === 'number') {
      const el = document.getElementById('hellscapeSelect');
      if (el) el.value = data.hellscapeIdx;
      renderHellscape(false);
    }
    if (data.warpIntensity) {
      const el = document.getElementById('warpIntensity');
      if (el) el.value = data.warpIntensity;
    }
    if (data.anomalyHtml) {
      const el = document.getElementById('anomalyResultBox');
      if (el) el.innerHTML = data.anomalyHtml;
    }
    if (typeof data.vultureKilled === 'boolean') {
      const el = document.getElementById('vultureKillCheck');
      if (el) el.checked = data.vultureKilled;
      updateVulture(false);
    }
    if (data.unboundHtml) {
      const el = document.getElementById('unboundResult');
      if (el) el.innerHTML = data.unboundHtml;
    }
  } catch (e) {
    console.warn('Could not restore pvp state:', e);
  }
}

function renderHellscape(shouldSave = true) {
  const idx = parseInt(document.getElementById('hellscapeSelect').value, 10);
  document.getElementById('hellscapeDesc').innerHTML = HELLSCAPES[idx];
  if (shouldSave) savePvpState();
}

function rollRandomHellscape() {
  const idx = Math.floor(Math.random() * HELLSCAPES.length);
  document.getElementById('hellscapeSelect').value = idx;
  renderHellscape(true);
}

function rollWarpAnomaly() {
  const intensity = document.getElementById('warpIntensity').value;
  const target = intensity === 'minor' ? 5 : (intensity === 'major' ? 4 : 3);
  const roll = Math.ceil(Math.random() * 6);
  const box = document.getElementById('anomalyResultBox');

  if (roll >= target) {
    const anom = ANOMALIES[Math.floor(Math.random() * ANOMALIES.length)];
    box.innerHTML = `<span class="badge purple">Rolled ${roll} (Needed ${target}+) • WARP SURGE!</span><p style="margin:0;">${anom}</p>`;
  } else {
    box.innerHTML = `<span class="badge">Rolled ${roll} (Needed ${target}+) • Reality Holds</span><p style="margin:0;">The empyric currents subside this round. No new Anomaly manifests.</p>`;
  }
  savePvpState();
}

function updateVulture(shouldSave = true) {
  const extra = document.getElementById('vultureKillCheck').checked ? 1 : 0;
  document.getElementById('vulturePts').innerText = `${3 + extra} SPts`;
  if (shouldSave) savePvpState();
}

function rollUnboundAdversary() {
  const pick = UNBOUND_UNITS[Math.floor(Math.random() * UNBOUND_UNITS.length)];
  document.getElementById('unboundResult').innerHTML = `<p style="margin:0;">${pick}</p>`;
  savePvpState();
}

renderHellscape(false);
restorePvpState();
</script>
</body>
</html>
````

---

## File: `pages/rogue.html` <a id="file-pagesroguehtml"></a>

````html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fires of Armageddon // Rogue Sector &amp; AI Tracker</title>
  <link rel="icon" type="image/svg+xml" href="../assets/favicon.svg">
  <link rel="apple-touch-icon" href="../assets/favicon.svg">
  <style>
    :root {
      --bg: #0a0b10;
      --surface: #141720;
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
      background-image: radial-gradient(circle at 50% 0%, rgba(157, 92, 255, 0.14) 0%, transparent 55%);
      color: var(--text);
      margin: 0; padding: 0; line-height: 1.5;
    }
    .suite-nav {
      background: rgba(12, 14, 20, 0.95); border-bottom: 1px solid var(--border);
      padding: 8px 16px; display: flex; justify-content: center; gap: 8px; flex-wrap: wrap;
    }
    .suite-link {
      text-decoration: none; font-size: 0.78rem; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.8px; padding: 6px 12px; border-radius: 8px; color: var(--muted); border: 1px solid transparent;
    }
    .suite-link:hover { color: var(--text); background: var(--surface); }
    .suite-link.active {
      color: var(--purple); background: rgba(157, 92, 255, 0.12); border-color: rgba(157, 92, 255, 0.35);
    }
    .app-shell { max-width: 720px; margin: 0 auto; padding: 16px; }
    .hero-banner {
      background: linear-gradient(135deg, #1d162b 0%, #141720 100%);
      border: 1px solid rgba(157, 92, 255, 0.35);
      border-radius: 18px; padding: 24px; text-align: center; margin-bottom: 20px;
    }
    .hero-banner h1 { margin: 0 0 6px 0; font-size: 1.6rem; text-transform: uppercase; color: var(--purple); }
    .hero-banner p { margin: 0; color: var(--muted); font-size: 0.9rem; }
    .card {
      background: var(--surface); border: 1px solid var(--border);
      border-left: 4px solid var(--purple); border-radius: 12px;
      padding: 18px; margin-bottom: 16px;
    }
    .card.gold { border-left-color: var(--gold); }
    .card.green { border-left-color: var(--green); }
    .badge {
      display: inline-block; font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
      padding: 3px 8px; border-radius: 6px; margin-bottom: 8px;
      background: rgba(157, 92, 255, 0.15); color: var(--purple);
    }
    .badge.gold { background: rgba(245, 176, 65, 0.15); color: var(--gold); }
    .badge.green { background: rgba(16, 185, 129, 0.15); color: var(--green); }
    h3 { margin: 0 0 8px 0; font-size: 1.1rem; }
    p { margin: 0 0 10px 0; color: #c9d1d9; font-size: 0.92rem; }
    button {
      background: var(--purple); color: #fff; border: none; padding: 10px 16px;
      border-radius: 10px; font-size: 0.88rem; font-weight: 700; cursor: pointer;
    }
    button.btn-green { background: var(--green); color: #fff; }
    .ai-step {
      background: var(--bg); border: 1px solid var(--border); border-radius: 10px;
      padding: 12px 14px; margin-bottom: 10px;
    }
    .ai-step.active-step {
      border-color: var(--green);
      box-shadow: 0 0 12px rgba(16, 185, 129, 0.2);
    }
    .ai-step-title { font-weight: 700; color: #fff; margin-bottom: 4px; display: flex; justify-content: space-between; }
    .impact-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin-top: 10px; }
    .impact-box { background: var(--bg); border: 1px solid var(--border); border-radius: 10px; padding: 12px; font-size: 0.85rem; }
  </style>
</head>
<body>

  <nav class="suite-nav">
    <a href="../index.html" class="suite-link">🧟 Mode 1: Horde Command &amp; Spawner</a>
    <a href="pvp.html" class="suite-link">⚔️ Mode 2: 1v1 Ash Wastes PvP</a>
    <a href="rogue.html" class="suite-link active">🎲 Mode 3: Rogue Sector &amp; AI Tracker</a>
    <a href="roster.html" class="suite-link">🎖️ Rosters &amp; Nemesis Ledger</a>
    <a href="briefing.html" class="suite-link">📜 Briefings, Ship &amp; Atlas</a>
  </nav>

  <div class="app-shell">
    <div class="hero-banner">
      <h1>AI Flowchart &amp; Rogue Sector Reference</h1>
      <p>Step-by-Step Horde / Unbound Adversary Pilot &amp; Off-Roster Planetary Shifts</p>
    </div>

    <!-- 1. INTERACTIVE AI PHASE TRACKER -->
    <div class="card green">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
        <span class="badge green">Autonomous AI • Step-by-Step Pilot</span>
        <button class="btn-green" onclick="nextAiStep()" style="padding:6px 12px; font-size:0.8rem;">Next AI Phase →</button>
      </div>
      <h3>Horde &amp; Unbound Adversary AI Sequencer</h3>

      <div id="aiStep0" class="ai-step active-step">
        <div class="ai-step-title"><span>1. Movement &amp; Ingress Phase</span><span>[Active]</span></div>
        <p style="margin:0; font-size:0.86rem;">
          • <strong>Closest Target:</strong> Move towards the closest Player unit (or closest Objective if tied). Never stay in a Spawn Zone unless stationary shooting is required.<br>
          • <strong>Scouts Bonus:</strong> Units with <em>Scouts</em> that spawned this turn (and did not ingress) add their Scouts distance to their Move characteristic!<br>
          • <strong>Advance Logic:</strong> Advance if all weapons are [ASSAULT], if eligible to shoot/charge after advancing, or if out of shooting/charge range.<br>
          • <strong>Deep Strike Ingress (R2–R4):</strong> Set up >8" from enemy models, as close to a player unit as possible, and outside range of objectives.
        </p>
      </div>

      <div id="aiStep1" class="ai-step">
        <div class="ai-step-title"><span>2. Shooting Phase Target Priority</span><span></span></div>
        <p style="margin:0; font-size:0.86rem;">
          Each model shoots the <strong>closest legal target</strong>, except for these priority overrides:<br>
          • <strong>[ANTI-X] / [X HUNTER]:</strong> Targets the closest visible unit with the matching <em>X</em> keyword.<br>
          • <strong>[PRECISION]:</strong> Targets the closest visible unit with a Leader or Support model.<br>
          • <strong>[MELTA]:</strong> Targets the closest visible non-INFANTRY, non-SWARM unit.
        </p>
      </div>

      <div id="aiStep2" class="ai-step">
        <div class="ai-step-title"><span>3. Charge &amp; Fight Phase</span><span></span></div>
        <p style="margin:0; font-size:0.86rem;">
          • <strong>Charges:</strong> Declare a charge against the closest reachable Player unit(s).<br>
          • <strong>Splitting Melee Attacks:</strong> Each model attacks the closest Player model's unit in range.<br>
          • <strong>Consolidation:</strong> AI units <em>always</em> make consolidation moves towards the closest Player unit or objective if able.
        </p>
      </div>
    </div>

    <!-- 2. ROGUE BATTLE PLANETARY IMPACT REFERENCE -->
    <div class="card">
      <span class="badge">Rogue Sector Battles • Zero Roster Bloat</span>
      <h3>Planetary Consequences Reference</h3>
      <p>Off-roster Rogue Battles leave your Administratum Crusade rosters 100% untouched. Simply report the winner (and any heroic model that earned a Nemesis induction!) to the Campaign Master in chat:</p>

      <div class="impact-grid">
        <div class="impact-box" style="border-top:3px solid var(--gold);">
          <strong style="color:var(--gold);">🛡️ Imperium Victory</strong><br>
          Stabilizes sector: Next main game Warp Intensity drops to <em>Minor</em> (or -1 to 1st R1 Horde Spawn Roll) + <strong>1 SPt to Gatebreakers</strong>.
        </div>
        <div class="impact-box" style="border-top:3px solid var(--red);">
          <strong style="color:var(--red);">💀 Chaos Victory</strong><br>
          Widens breach: Next main game Warp Intensity escalates to <em>Catastrophic</em> (or triggers <em>Banishing Rifts</em>) + <strong>1 SPt to Desecrators</strong>.
        </div>
        <div class="impact-box" style="border-top:3px solid var(--purple);">
          <strong style="color:var(--purple);">⚔️ Xenos Victory</strong><br>
          Plunders vaults: Triggers <em>Gravitic Nexus</em> or <em>Staggered Time</em> Hellscape next main match + <strong>1 SPt to Marauders</strong>.
        </div>
      </div>
    </div>

  </div>

<script>
const STORAGE_KEY_ROGUE = 'foa_rogue_state_v1';
let currentAiStep = 0;

function saveRogueState() {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_ROGUE, JSON.stringify({ currentAiStep }));
  } catch (e) {
    console.warn('Could not save rogue state:', e);
  }
}

function restoreRogueState() {
  if (typeof localStorage === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ROGUE);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (data && typeof data.currentAiStep === 'number') {
      setAiStep(data.currentAiStep, false);
    }
  } catch (e) {
    console.warn('Could not restore rogue state:', e);
  }
}

function setAiStep(step, shouldSave = true) {
  currentAiStep = step;
  [0, 1, 2].forEach(i => {
    const el = document.getElementById('aiStep' + i);
    if (el) {
      el.classList.toggle('active-step', i === currentAiStep);
      const span = el.querySelector('.ai-step-title span:last-child');
      if (span) span.innerText = (i === currentAiStep) ? '[Active]' : '';
    }
  });
  if (shouldSave) saveRogueState();
}

function nextAiStep() {
  setAiStep((currentAiStep + 1) % 3);
}

restoreRogueState();
</script>
</body>
</html>
````

---

## File: `pages/roster.html` <a id="file-pagesrosterhtml"></a>

````html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fires of Armageddon // Rosters &amp; Nemesis Ledger</title>
  <link rel="icon" type="image/svg+xml" href="../assets/favicon.svg">
  <link rel="apple-touch-icon" href="../assets/favicon.svg">
  <style>
    :root {
      --bg: #08090d;
      --surface: #12151f;
      --surface-alt: #181c29;
      --border: #262c40;
      --text: #eceff4;
      --muted: #8b92a5;
      --red: #ff4757;
      --gold: #f5b041;
      --purple: #9d5cff;
      --blue: #3b82f6;
      --green: #10b981;
    }
    * { box-sizing: border-box; }
    body {
      font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
      background-color: var(--bg);
      background-image:
        radial-gradient(circle at 50% 0%, rgba(245, 176, 65, 0.12) 0%, transparent 55%),
        radial-gradient(circle at 85% 90%, rgba(157, 92, 255, 0.1) 0%, transparent 45%);
      background-attachment: fixed;
      color: var(--text);
      margin: 0; padding: 0; line-height: 1.55; min-height: 100vh;
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
      color: var(--gold);
      background: rgba(245, 176, 65, 0.12);
      border-color: rgba(245, 176, 65, 0.35);
    }

    .container { max-width: 820px; margin: 0 auto; padding: 20px 16px 60px 16px; }

    .hero-banner {
      background: linear-gradient(135deg, #221c14 0%, #12151f 100%);
      border: 1px solid rgba(245, 176, 65, 0.35);
      border-radius: 18px; padding: 24px; text-align: center; margin-bottom: 20px;
    }
    .hero-banner h1 { margin: 0 0 6px 0; font-size: 1.65rem; text-transform: uppercase; color: var(--gold); }
    .hero-banner p { margin: 0; color: var(--muted); font-size: 0.9rem; }

    .scoreboard-bar {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 12px;
      margin-bottom: 24px;
    }
    .score-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-top: 3px solid var(--gold);
      border-radius: 12px;
      padding: 14px;
      text-align: center;
    }
    .score-card.beta { border-top-color: var(--purple); }
    .score-card.horde { border-top-color: var(--red); }
    .score-title { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.8px; color: var(--muted); }
    .score-name { font-size: 1.05rem; font-weight: 800; color: #fff; margin: 4px 0; }
    .score-pts { font-size: 1.25rem; font-weight: 800; color: var(--gold); }

    .section-card {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 16px; padding: 22px; margin-bottom: 22px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.35);
    }
    .badge {
      display: inline-block; font-size: 0.7rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 0.8px; padding: 3px 9px;
      border-radius: 6px; margin-bottom: 8px;
      background: rgba(245, 176, 65, 0.15); color: var(--gold);
    }
    .badge.red { background: rgba(255, 71, 87, 0.15); color: var(--red); }
    .badge.purple { background: rgba(157, 92, 255, 0.15); color: var(--purple); }

    h2 { margin: 0 0 12px 0; font-size: 1.3rem; color: #fff; }
    p { margin: 0 0 10px 0; color: #c9d1d9; font-size: 0.92rem; }

    .char-card {
      background: var(--surface-alt);
      border: 1px solid var(--border);
      border-left: 4px solid var(--gold);
      border-radius: 12px;
      padding: 16px;
      margin-bottom: 14px;
    }
    .char-card.purple { border-left-color: var(--purple); }
    .char-card.red { border-left-color: var(--red); }
    .char-card.blue { border-left-color: var(--blue); }

    .char-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 6px;
    }
    .char-name { font-size: 1.08rem; font-weight: 800; color: #fff; }
    .char-meta { font-size: 0.8rem; color: var(--gold); font-weight: 600; }
    .deed-box {
      background: rgba(8, 9, 13, 0.65);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 10px 12px;
      margin-top: 10px;
      font-size: 0.85rem;
      color: #d8dee9;
    }
    .oob-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 10px;
      margin-top: 12px;
    }
    .oob-item {
      background: var(--surface-alt);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 10px 12px;
      font-size: 0.85rem;
    }
  </style>
</head>
<body>

  <nav class="suite-nav">
    <a href="../index.html" class="suite-link">🧟 Mode 1: Horde Command &amp; Spawner</a>
    <a href="pvp.html" class="suite-link">⚔️ Mode 2: 1v1 Ash Wastes PvP</a>
    <a href="rogue.html" class="suite-link">🎲 Mode 3: Rogue Sector &amp; AI Tracker</a>
    <a href="roster.html" class="suite-link active">🎖️ Rosters &amp; Nemesis Ledger</a>
    <a href="briefing.html" class="suite-link">📜 Briefings, Ship &amp; Atlas</a>
  </nav>

  <div class="container">
    <div class="hero-banner">
      <h1>Orders of Battle &amp; Nemesis Ledger</h1>
      <p>Dramatis Personae, "Scars Are Stories" Chronicles &amp; Cross-Mode Boss Pool</p>
    </div>

    <!-- PHASE 1 GLOBAL SCOREBOARD -->
    <div class="scoreboard-bar">
      <div class="score-card">
        <div class="score-title">Commander Alpha • Gatebreakers</div>
        <div class="score-name">The Sanctuary of Ash</div>
        <div class="score-pts">0 SPts • 1 CPt <span style="font-size:0.75rem; color:var(--blue);">(Ship: 0)</span></div>
      </div>
      <div class="score-card beta">
        <div class="score-title">Commander Beta • JUNEBUG</div>
        <div class="score-name">High Sanctum / Pending</div>
        <div class="score-pts" style="color:var(--purple);">0 SPts • 0 CPts</div>
      </div>
      <div class="score-card horde">
        <div class="score-title">3rd Alliance • Origin Unknown</div>
        <div class="score-name">The Horde Overlord</div>
        <div class="score-pts" style="color:var(--red);">0 SPts • 0 CPts</div>
      </div>
    </div>

    <!-- 1. COMMANDER ALPHA DRAMATIS PERSONAE -->
    <div class="section-card">
      <span class="badge">Commander Alpha • Astra Militarum (1,790 / 1,900 Pts)</span>
      <h2>The Sanctuary of Ash — Dramatis Personae</h2>
      <p>Tracked on Administratum • 0 RP Remaining • +1 Crusade Point (Lord Marshal Dreir) • <em>Shipboard Slider Rules in Alpha's Briefing Tab</em></p>

      <div class="char-card">
        <div class="char-header">
          <span class="char-name">🎖️ The Exile — Rogal Dorn Commander (<em>"Mercy's Delay"</em>)</span>
          <span class="char-meta">Warlord • 265 Pts • Enhancement: Calm Under Fire</span>
        </div>
        <p style="margin:0;">Once a decorated Cadian Shock Officer who survived the Fall of Cadia and emerged unscathed from seven doomed last stands—declared "cursed" by his comrades and claimed by the Krieg as a living indictment. Commands a salvaged Rogal Dorn retrofitted with Krieg siege dozer blades and Sororitas purity seals that burn his skin when touched.</p>
        <div class="deed-box">
          <strong>• Special Rule (<em>"Mercy Delayed Again"</em>):</strong> Surviving a Horde Mode Round 6 Final Stand in which 3+ friendly Krieg units were destroyed grants <em>The Exile</em> <strong>+1 bonus XP</strong> and lets one destroyed Krieg Battleline unit swap a failed Out of Action Battle Scar for <strong>"Absolved in Ash"</strong> (<em>Feel No Pain 6+</em> within 6" of <em>The Exile</em>).<br>
          <strong>• Session 0 Deed (Sector Node 0 — Golgotha Arbor-Basin):</strong> Held the right forest flank during the Sororitas audit before <em>"Mercy's Delay"</em> was disabled in the closing salvos—dragged alive from the smoking wreckage once again.<br>
          <strong>• Narrative Honours &amp; Scars (<em>"Scars Are Stories"</em>):</strong> <em>None yet (0 XP • Battle-Ready).</em>
        </div>
      </div>

      <div class="char-card purple">
        <div class="char-header">
          <span class="char-name">⚔️ Lord Marshal Dreir — Epic Hero of Krieg</span>
          <span class="char-meta" style="color:var(--purple);">Epic Hero • 70 Pts • Inspirational Champion (+1 CrP)</span>
        </div>
        <p style="margin:0;">The unyielding cavalry spearhead of the penitentiary column, leading his Death Riders directly into the thickest empyric breaches of the ash wastes.</p>
        <div class="deed-box">
          <strong>• Mighty Champion Rule (<em>Inspirational Champion</em>):</strong> Ignore all Battle Scars on the Bodyguard unit Dreir leads, AND select <strong>one additional unit</strong> to be <em>Marked for Greatness (+3 XP)</em> at the end of every battle!<br>
          <strong>• Session 0 Deed (Golgotha Arbor-Basin):</strong> Led the cavalry charge into the Sororitas lines and fell in the crucible of fire before being recovered by the Krieg Quartermasters.
        </div>
      </div>

      <div class="char-card red">
        <div class="char-header">
          <span class="char-name">💥 2x Leman Russ Vanquishers — <em>"The Shrine-Breakers"</em></span>
          <span class="char-meta" style="color:var(--red);">Armored Tank Hunters • 145 Pts Each</span>
        </div>
        <p style="margin:0;">Recorded only by cold serial hull-numbers on High Sanctum manifests, speaking their nickname aloud on the upper decks is a flogging offense. Yet down by the corpse-starch vats of the Lower Decks, the troopers only ever call them <strong>"The Shrine-Breakers"</strong>—tapping their shovel-blades twice against their helmets whenever the long-barreled hulls rumble past.</p>
        <div class="deed-box">
          <strong>• Session 0 Deed (Golgotha Arbor-Basin):</strong> While 40 Kriegsmen brawled in the central forest clearing, these two Vanquishers calmly locked onto the gilded Sororitas reliquaries and blew <em>every single Sororitas war-machine</em> sky-high in catastrophic, chain-reaction fireballs—creating the permanent <em>Graveyard of Stained Glass</em> at Sector Node 0!<br>
          <strong>• Session 0 Legacy Perk:</strong> The first time either of the <em>Shrine-Breakers</em> reaches the <strong>Blooded</strong> rank (6 XP), it may re-roll its <em>Weapon Modification</em> or <em>Battle Trait</em> roll for free!
        </div>
      </div>

      <div class="char-card blue">
        <div class="char-header">
          <span class="char-name">💀 The Unseen Jury &amp; 🔫 Dravik, The Silent Judge</span>
          <span class="char-meta" style="color:var(--blue);">Krieg Command Squad (65 Pts • Stalwart's Honours) &amp; Commissar (30 Pts)</span>
        </div>
        <p style="margin:0;"><em>The Unseen Jury</em> enforces the Sororitas' will through sanctioned purges, leaving spent shell casings in neat rows like rosary beads. <em>Commissar Dravik</em> never raises his voice—executing overly zealous Kriegers with a single shot to the back of the skull for "wasting the Emperor's currency," guided by orders scrawled in blood on the walls of the ship's brig.</p>
      </div>

      <h3 style="font-size:0.95rem; color:var(--gold); margin:16px 0 8px 0; text-transform:uppercase;">Full Registered Order of Battle (13 Units • 1,820 Pts)</h3>
      <div class="oob-grid">
        <div class="oob-item"><strong>Stormlord (460 pts)</strong><br><span style="color:var(--muted);">Super-Heavy Fortress • Disgorged 40 Kriegsmen onto Node 0 Center in S0</span></div>
        <div class="oob-item"><strong>3x Death Korps of Krieg (130 pts ea)</strong><br><span style="color:var(--muted);">Battleline • Stole Left Forest Bunker in S0 via 8 OC</span></div>
        <div class="oob-item"><strong>1x Death Riders (70 pts)</strong><br><span style="color:var(--muted);">Mounted Spearhead • Led by Dreir (Scar-Immune)</span></div>
        <div class="oob-item"><strong>2x Scout Sentinels (55 pts ea)</strong><br><span style="color:var(--muted);">Forward Recon Walkers</span></div>
        <div class="oob-item"><strong>1x Ogryn Bodyguard (40 pts)</strong><br><span style="color:var(--muted);">Command Slab-Shield</span></div>
      </div>
    </div>

    <!-- 2. COMMANDER BETA & NEMESIS LEDGER -->
    <div class="section-card">
      <span class="badge red">3rd Alliance Boss Pool &amp; High Sanctum Wardens</span>
      <h2>Inducted Nemesis Ledger &amp; Commander Beta's Heroes</h2>
      <p>Slaying any inducted Nemesis on the battlefield grants the killer unit <strong>+2 bonus XP</strong> and scores <strong>+1 Strategic Point</strong> for your Alliance!</p>

      <div class="char-card red">
        <div class="char-header">
          <span class="char-name">🪽 Saint Celestine — <em>"The Ashen Seraph of the High Sanctum"</em></span>
          <span class="char-meta" style="color:var(--red);">Inducted Campaign Nemesis #1 • High Sanctum Warden</span>
        </div>
        <p style="margin:0;">After watching the Krieg <em>Shrine-Breakers</em> detonate every Sororitas war-engine in the forest clearing of Sector Node 1 during Session 0, Celestine descended from the ash-clouds directly into the Krieg rear deployment zone—slaughtering the rear guard, wiping out the Krieg officer corps, and stealing the Krieg home objective to clinch a 3-VP Sororitas victory!</p>
        <div class="deed-box">
          <strong>• Campaign Role:</strong> Serves as the NPC Warden of the High Sanctum (deploying against Commander Alpha if the Shipboard Slider hits <code>-3 Brig Abyss</code>)—or leads Commander Beta's Adepta Sororitas if Beta chooses to share <em>The Sanctuary of Ash</em>!
        </div>
      </div>

      <div class="char-card purple">
        <div class="char-header">
          <span class="char-name">🚩 Aestred Thurga &amp; Agathae Dolan — Keepers of the Penitentiary Ledger</span>
          <span class="char-meta" style="color:var(--purple);">High Sanctum Auditors • Adepta Sororitas</span>
        </div>
        <p style="margin:0;">Cut down a forward Krieg Scout Sentinel on the left flank in Round 1 of Session 0 with <em>Devastating Wounds</em> (generating a Miracle Die of 4), then weathered 11 point-blank Krieg shovel attacks without failing a single 3+ armor save—before having the forest bunker stolen out from under them by 4 Kriegsmen flexing 8 OC!</p>
      </div>
    </div>

  </div>
</body>
</html>
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
````

---

## File: `js/data.js` <a id="file-jsdatajs"></a>

````javascript
// 1. ALL 23 OFFICIAL SECTION 7.5 HORDE PRIMARY FACTION RULES
const HORDE_FACTIONS = [
  { name: "Space Marines", group: "Imperium", ruleTitle: "Transhuman Skills", desc: "Horde ADEPTUS ASTARTES units can re-roll hit rolls of 1." },
  { name: "Adepta Sororitas", group: "Imperium", ruleTitle: "Martyrs and Miracles", desc: "Starting in the fourth battle round, treat the first Horde Spawn Roll each round as an unmodified 12 instead of rolling 2D6." },
  { name: "Adeptus Custodes", group: "Imperium", ruleTitle: "Best of the Best of the Best", desc: "Horde ADEPTUS CUSTODES units’ melee attacks have [LETHAL HITS]." },
  { name: "Adeptus Mechanicus", group: "Imperium", ruleTitle: "Third Try’s the Charm", desc: "Horde ADEPTUS MECHANICUS units’ ranged attacks have +1 BS and [ASSAULT]." },
  { name: "Astra Militarum", group: "Imperium", ruleTitle: "Unanimous Orders", desc: "Horde ASTRA MILITARUM units’ ranged attacks have +1 BS while within 6\" of a friendly ASTRA MILITARUM OFFICER model." },
  { name: "Grey Knights", group: "Imperium", ruleTitle: "Poor Hammers", desc: "Horde GREY KNIGHTS units’ melee attacks against enemy VEHICLE or MONSTER units have -1 to hit rolls and +4 S." },
  { name: "Imperial Agents", group: "Imperium", ruleTitle: "Fine, I’ll Do It Myself", desc: "Horde IMPERIAL AGENTS attacks have +1 to hit vs CHAOS, re-roll hit/wound rolls of 1 vs IMPERIUM, and +1 to wound vs targets with neither keyword." },
  { name: "Imperial Knights", group: "Imperium", ruleTitle: "Passive Ion Shields", desc: "Horde IMPERIAL KNIGHTS models have Feel No Pain 6+." },
  { name: "Chaos Space Marines", group: "Chaos", ruleTitle: "Wonton Slaughter", desc: "Horde CHAOS SPACE MARINES units’ melee attacks have +1 A on turns that they charge." },
  { name: "Chaos Daemons", group: "Chaos", ruleTitle: "Shadow Forms", desc: "Ranged attacks against Horde LEGIONES DAEMONICA units have -1 to hit rolls unless the attacking model is within 12\"." },
  { name: "Chaos Knights", group: "Chaos", ruleTitle: "God I Wish We Had A Different Theme", desc: "Horde CHAOS KNIGHTS units’ attacks have +1 to hit rolls and +1 to wound rolls if the target is battle-shocked." },
  { name: "Death Guard", group: "Chaos", ruleTitle: "Don’t You Miss DR?", desc: "Enemy units within 6\" of Horde DEATH GUARD units have -1 T, and their attacks have -1 BS and -1 WS." },
  { name: "Emperor's Children", group: "Chaos", ruleTitle: "Elegant Violence", desc: "Each Horde EMPEROR’S CHILDREN unit is eligible to shoot and declare a charge in a turn in which it made an advance or fall-back move." },
  { name: "Thousand Sons", group: "Chaos", ruleTitle: "Psychic Storms", desc: "At the beginning of the Horde Shooting phase, each Player unit within 12\" of a Horde THOUSAND SONS unit suffers D3 mortal wounds." },
  { name: "World Eaters", group: "Chaos", ruleTitle: "Bloodthirsty", desc: "Horde WORLD EATERS units have +2\" M." },
  { name: "Aeldari", group: "Xenos", ruleTitle: "Monomolecular Ammunition", desc: "Horde AELDARI units’ ranged attacks have +1 AP." },
  { name: "Drukhari", group: "Xenos", ruleTitle: "Monomolecular Edges", desc: "Horde DRUKHARI units’ melee attacks have +1 AP." },
  { name: "Necrons", group: "Xenos", ruleTitle: "We’re So Back", desc: "Horde NECRON non-CHARACTER INFANTRY, BEAST, and SWARM models have Feel No Pain 5+." },
  { name: "T'au Empire", group: "Xenos", ruleTitle: "Glasses", desc: "When a Horde T’AU EMPIRE unit is selected to shoot, roll one D6: on a 4+, the unit's attacks have +1 BS." },
  { name: "Orks", group: "Xenos", ruleTitle: "High (Green) Tide", desc: "On the third battle round reveal one additional Misery card, add 1 to Spawn Rolls, and Horde ORKS models have +3\" M." },
  { name: "Leagues of Votann", group: "Xenos", ruleTitle: "Grudge Game", desc: "Whenever an unmarked unit destroys a Horde LEAGUES OF VOTANN unit, mark it. Horde VOTANN attacks against marked units have +1 to hit and +1 to wound." },
  { name: "Tyranids", group: "Xenos", ruleTitle: "Neurons Activated", desc: "Each time a Horde TYRANIDS unit makes a battle-shock roll, roll 3D6 instead of 2D6. Horde TYRANIDS units’ melee attacks have +1 S." },
  { name: "Genestealer Cults", group: "Xenos", ruleTitle: "Should Have Just Been A 5+ FNP", desc: "Whenever a Horde GSC INFANTRY or MOUNTED unit is destroyed, roll 1D6: on a 5+ set it aside and respawn an identical unit in any Spawn Zone at the start of the next battle round!" }
];

// 2. SECRET OBJECTIVES (1-34)
const OBJECTIVES = [
  { id: 1, code: "A9F", name: "1 - Forward Extraction", tags: "End of Game", desc: "End the game with at least one unit wholly within a Horde Spawn Zone." },
  { id: 2, code: "B4K", name: "2 - A Noble Sacrifice", tags: "Early Reveal", desc: "Reveal and complete at the end of your turn if there is at least one CHARACTER unit from your army within range of the Attacker’s Home Objective." },
  { id: 3, code: "C8M", name: "3 - Cleanse Sacred Ground", tags: "End of Game", desc: "End the game controlling at least one objective in No Man’s Land with no other players or Horde units within range of the objective." },
  { id: 4, code: "D2P", name: "4 - Take Research Subjects", tags: "Early Reveal", desc: "Reveal and complete after destroying an enemy unit in the Fight phase that was within the Defender’s deployment zone." },
  { id: 5, code: "E7Q", name: "5 - Recover the Lost Relic", tags: "Action, Early Reveal, Survival Required", desc: "Reveal in Shooting phase (Round 3+). Action: 1 CHARACTER wholly within 6\" of center; completes end of your Command phase. Must survive." },
  { id: 6, code: "F3R", name: "6 - Two Birds, One Stone", tags: "End of Game, Multiplayer, Traitor", desc: "End the game with at least one other player not surviving." },
  { id: 7, code: "G6T", name: "7 - Team Player", tags: "End of Game, Multiplayer", desc: "End the game with all players surviving." },
  { id: 8, code: "H1V", name: "8 - Majority Rules", tags: "End of Game, Multiplayer, Traitor", desc: "End the game with the most units of any player on the battlefield." },
  { id: 9, code: "J5W", name: "9 - VIP", tags: "End of Game", desc: "End the game with your Warlord’s unit wholly within No Man’s Land at starting strength." },
  { id: 10, code: "K9X", name: "10 - Rear Extraction", tags: "End of Game", desc: "End the game with all of your units wholly within the Defender’s deployment zone." },
  { id: 11, code: "L2Y", name: "11 - Show Off", tags: "Early Reveal / End of Game", desc: "Reveal and complete when you spend 15 or more Supply Points during a single Resupply Step." },
  { id: 12, code: "M8Z", name: "12 - Kill Confirmed", tags: "Early Reveal", desc: "Reveal and complete after a Horde CHARACTER model is destroyed while engaged with one of your CHARACTER units." },
  { id: 13, code: "N4B", name: "13 - Master Sculptor", tags: "Secret Tally, Early Reveal, Survival Required", desc: "Tally uses of Air Strike and Defensive Positions. Reveal and complete after 5th total tally. Must survive." },
  { id: 14, code: "P7C", name: "14 - Hand of Fate", tags: "End of Game", desc: "Succeed in at least 7 Secondary Missions by the end of the game." },
  { id: 15, code: "Q3D", name: "15 - Saboteur", tags: "Early Reveal, Multiplayer, Traitor, Survival Required", desc: "At end of Round 5, before resolving active Secondary Missions, reveal if at least one Secondary Mission failed this game. Must survive." },
  { id: 16, code: "R6F", name: "16 - Hold the Line", tags: "End of Game", desc: "End the game with no Horde units within the Defender’s deployment zone." },
  { id: 17, code: "S1G", name: "17 - Pure Spite", tags: "Early Reveal, Multiplayer, Traitor", desc: "Reveal and complete after another player’s Warlord is destroyed." },
  { id: 18, code: "T5H", name: "18 - Aspect of Change", tags: "End of Game", desc: "End the game with 2 units you spawned via Field Promotion on the battlefield." },
  { id: 19, code: "U9J", name: "19 - Benevolence", tags: "Secret Tally, Early Reveal, Multiplayer", desc: "Tally uses of Share Supplies you purchase. Reveal and complete after 5th tally." },
  { id: 20, code: "V2K", name: "20 - Tacticool", tags: "Secret Tally, Early Reveal, Survival Required", desc: "Tally times you use at least 1 CP on a stratagem. Reveal after 8th tally. Must survive." },
  { id: 21, code: "W8L", name: "21 - Camp Counselor", tags: "Secret Tally, Early Reveal, Multiplayer, Survival Required", desc: "Tally times you remove battle-shock from another player’s unit via Pizza Party. Reveal after 2nd tally. Must survive." },
  { id: 22, code: "X4M", name: "22 - Adornable", tags: "Secret Tally, Early Reveal, Survival Required", desc: "Tally objectives you fortify. Reveal after 3rd tally. Must survive." },
  { id: 23, code: "Y7N", name: "23 - Acceptable Collateral", tags: "Early Reveal, Multiplayer, Traitor, Survival Required", desc: "Reveal after destroying >=1 Horde model and >=1 other player's model with a single Artillery Strike. Must survive." },
  { id: 24, code: "Z3P", name: "24 - Action Hero", tags: "Action, Early Reveal", desc: "Reveal & complete after a CHARACTER you own completes any Secondary Mission action. OR reveal at start of Shooting phase (Round 3+) for Put on Sunglasses Action (1 CHARACTER wholly within 6\" of center; completes end of turn if no Horde within 8\")." },
  { id: 25, code: "A6Q", name: "25 - Triangulate Signal", tags: "Action, Early Reveal", desc: "Reveal in Shooting phase (Round 3+). Action: 3 units within range of 3 different objectives with no Horde in range. Completes end of turn if controlled." },
  { id: 26, code: "B1R", name: "26 - Destroy the Evidence", tags: "Action, Early Reveal, Multiplayer, Traitor", desc: "Reveal in Shooting phase (Round 3+). Action: 1 unit within range of an objective. Completes end of turn if controlled: Destroy unit & all units in range; units within 9\" (6\" terrain) take D6 MW; remove objective; next round add Debris Storm." },
  { id: 27, code: "C5S", name: "27 - Lancelot", tags: "Secret Tally, Early Reveal", desc: "Tally Horde MONSTER, VEHICLE, and CHARACTER models you destroy (10+ W = 2; TITANIC = 3). Reveal and complete after 4th tally." },
  { id: 28, code: "D9T", name: "28 - Chaos Incarnate", tags: "Secret Tally, Early Reveal, Multiplayer, Traitor", desc: "Tally Misery cards activated over the game. Reveal after 9th tally, even if removed. Complete if >=1 other player survives and you did not." },
  { id: 29, code: "E2U", name: "29 - Deus Ex Machina", tags: "Early Reveal, Multiplayer", desc: "Reveal after you are removed from the game. Spend saved Secondary Reward Cards, SP, and CP as though you were any surviving player. Complete after 13th tally of SP/CP spent while removed." },
  { id: 30, code: "F8V", name: "30 - Supervisor", tags: "Secret Tally, Early Reveal, Multiplayer, Traitor, Survival Required", desc: "Tally Horde units destroyed by yourself vs. all other players combined. Reveal when your tally is at least 4 less than other players. Must survive." },
  { id: 31, code: "G4W", name: "31 - All For One", tags: "Secret Tally, Early Reveal, Multiplayer, Traitor, Survival Required", desc: "Tally times another Player uses Share Supplies targeting you. Reveal after 5th tally. Must survive." },
  { id: 32, code: "H7X", name: "32 - Meatball Surgeon", tags: "Secret Tally, Early Reveal, Multiplayer", desc: "Tally wounds other players’ units heal from your uses of Patched Up. Reveal and complete after 12th tally." },
  { id: 33, code: "J3Y", name: "33 - Traffic Jam", tags: "Early Reveal, Traitor, Survival Required", desc: "Reveal and complete when a Horde unit is destroyed by the Horde Spawn Zone during Spawn The Horde step. Must survive." },
  { id: 34, code: "K6Z", name: "34 - Vainglorious", tags: "Secret Tally, Multiplayer, End of Game", desc: "Tally Horde units destroyed by yourself vs. each other player. End the game with 2 more marks on your tally than any other player’s." }
];

// 3. MISERY DECK (1-36)
const MISERIES = [
  { id: 1, name: "1 - Unnatural Stamina", desc: "Horde units are eligible to shoot and declare a charge in a turn in which they made an advance move." },
  { id: 2, name: "2 - Grudge Match", desc: "Horde unit attacks have +1 to hit rolls and +1 to wound rolls." },
  { id: 3, name: "3 - Rip and Tear", desc: "Horde unit attacks have +1 AP." },
  { id: 4, name: "4 - Blistering Speed", desc: "Do not roll advance or charge rolls for the Horde. Advance rolls are automatically 6 and charge rolls are automatically 12." },
  { id: 5, name: "5 - Untouchable", desc: "Horde models have a 4+ invulnerable save (or improve existing 4+ invulnerable save by 1)." },
  { id: 6, name: "6 - Stray Orbital Bombardment", desc: "Split battlefield into a 2x3 grid (1–6). Roll 1D6: each unit within the rolled area suffers 2D3 mortal wounds." },
  { id: 7, name: "7 - Unlucky Night", desc: "When making Spawn Rolls for the Horde, roll 3D6 and discard the lowest." },
  { id: 8, name: "8 - Death Denied", desc: "Each Horde unit heals 13 wounds." },
  { id: 9, name: "9 - Terrifying Shockwave", desc: "All Player battle-shock rolls automatically fail." },
  { id: 10, name: "10 - Planetquake", desc: "Select one terrain area wholly outside Attacker’s deployment zone at random. Air Strike (2D3 MW & remove terrain) activates on it." },
  { id: 11, name: "11 - Errant Explosion", desc: "Randomly select one objective in No Man’s Land and destroy it." },
  { id: 12, name: "12 - Nowhere is Safe", desc: "Destroy all objectives in the Defender’s deployment zone." },
  { id: 13, name: "13 - Pincer Maneuver", desc: "Spawn an extra Horde unit into strategic reserves with Deep Strike. Next Horde Movement phase it ingresses >3\" from Player units (in Player DZ if able, else NML)." },
  { id: 14, name: "14 - No Hard Feelings", desc: "Randomly select a player and set their SP to 0 (in Single Player, reveal 2 more Misery Cards instead)." },
  { id: 15, name: "15 - Bad Investment", desc: "Remove 5 SP from all players (minimum 0)." },
  { id: 16, name: "16 - Fair and Balanced", desc: "Horde unit attacks have [DEVASTATING WOUNDS]." },
  { id: 17, name: "17 - Unfettered Fury", desc: "Horde unit attacks have [SUSTAINED HITS 1] and [LETHAL HITS 1]." },
  { id: 18, name: "18 - A Worthless Sacrifice", desc: "Players discuss and secretly vote for a Player unit to be destroyed. If not unanimous, randomly select from units with >=1 vote." },
  { id: 19, name: "19 - Fog of War", desc: "Horde models have Stealth and are Hidden." },
  { id: 20, name: "20 - Lamentable Luck", desc: "Reveal 2 more Misery cards!" },
  { id: 21, name: "21 - Bunkers Busted", desc: "Remove all fortified markers from all objectives. Players cannot make Fortify purchases." },
  { id: 22, name: "22 - Comms Jammed", desc: "Players cannot use stratagems or spend CP. Players cannot make Supply, Spawn, or Strike purchases." },
  { id: 23, name: "23 - The Mind Killer", desc: "Player units must each make a battle-shock roll, then remove all Enhancements/Upgrades from battle-shocked units. No Tactics purchases." },
  { id: 24, name: "24 - Seller’s Market", desc: "The SP cost of all purchases is doubled." },
  { id: 25, name: "25 - Hotter Shots", desc: "Horde unit ranged attacks have [MELTA 1]." },
  { id: 26, name: "26 - Sinking Showboats", desc: "Horde unit ranged attacks have [PRECISION] and [IGNORE COVER]." },
  { id: 27, name: "27 - Chitinous Growths", desc: "Attacks that target Horde units have -1 S and -1 AP." },
  { id: 28, name: "28 - They Fly Now", desc: "Horde units have FLY and TOWERING. Ignore all terrain for visibility on Horde ranged attacks." },
  { id: 29, name: "29 - Fate’s Fetters", desc: "Remove 4 SP from player with most SP. Reveal 3 extra Secondary Missions (ignore limit this round). No Secondary purchases." },
  { id: 30, name: "30 - Aim for the Heads", desc: "When a Horde model is destroyed, roll D6: on 4+, after attacking unit finishes, it fights (in Fight phase) or shoots before being removed." },
  { id: 31, name: "31 - Debris Storm", desc: "Player units must re-roll unmodified hit rolls of 6." },
  { id: 32, name: "32 - Glowing Eyes", desc: "Each time a Horde model makes an attack, they may re-roll the hit roll." },
  { id: 33, name: "33 - Danger Close", desc: "Horde ranged attacks have [BLAST 1]. Horde melee attacks have [CLEAVE 1]." },
  { id: 34, name: "34 - Surging Power", desc: "Horde unit attacks have +1 S and [PSYCHIC]." },
  { id: 35, name: "35 - Experimental Ammunition", desc: "Player unit ranged attacks have +1 S, +1 AP, and [HAZARDOUS]." },
  { id: 36, name: "36 - Flash Flood", desc: "Player units have -2\" M (min 4\") and -2 to advance and charge rolls (min 1)." }
];

// 4. SECONDARY MISSIONS (1-24)
const SECONDARIES = [
  { id: 1, r1Skip: false, name: "1 - Secure Drop Zones", cond: "Randomly select 2 objectives in NML. Control them at end of round.", rew: "3 SP. 1 random player saves card (free Tactics purchase).", pun: "+1 Misery card." },
  { id: 2, r1Skip: false, name: "2 - Back To Basics", cond: "Tally X Horde units destroyed this round after reveal (X > 0).", rew: "(X + 1) SP.", pun: "+2 Misery cards." },
  { id: 3, r1Skip: false, name: "3 - Show No Fear", cond: "No Player units battle-shocked at end of battle round.", rew: "3 SP.", pun: "+2 Misery cards, +1 to Spawn Rolls." },
  { id: 4, r1Skip: false, name: "4 - Establish Orbital Comms", cond: "Action (Shooting): 1 INFANTRY/CHARACTER wholly within 6\" of center (Completes end of turn).", rew: "Unrevealed players use A Change of Plans.", pun: "Unrevealed players use A Change of Plans at random!" },
  { id: 5, r1Skip: false, name: "5 - Search for Supplies", cond: "Action (Shooting): 1 unit on non-home objective. End of turn if controlled, roll 4+ on D6.", rew: "3 SP. 1 random player saves card (free Supply purchase).", pun: "+2 Misery cards." },
  { id: 6, r1Skip: false, name: "6 - Clear the Evac Zone", cond: "No Horde units within Defender’s DZ at end of battle round.", rew: "3 SP.", pun: "Reinforcements Arrive is removed from Resupply Table." },
  { id: 7, r1Skip: false, name: "7 - Decapitation Strike", cond: "Destroy a Horde CHARACTER model, or have none exist at end of round.", rew: "2 SP, 2 CP.", pun: "+2 Misery cards." },
  { id: 8, r1Skip: false, name: "8 - Dragon Slayer", cond: "Destroy a Horde VEHICLE/MONSTER model or have none exist at end of round.", rew: "1 free Field Promotion to triggering player (or 2 SP).", pun: "+6 to first Spawn Roll." },
  { id: 9, r1Skip: false, name: "9 - Paint Targets", cond: "This round: No Player Fall Back moves, and no moves leaving range of objectives started in range of.", rew: "1 free Air Strike & 1 free Defensive Positions (random players).", pun: "Search & resolve Stray Orbital Bombardment immediately!" },
  { id: 10, r1Skip: false, name: "10 - Study Behaviors", cond: "Start of Player Movement: pick random Horde unit; it must not lose any wounds this round.", rew: "2 SP. 1 random player saves card (discard to nullify a Misery card).", pun: "+3 to Spawn Rolls." },
  { id: 11, r1Skip: true, name: "11 - Use It Or Lose It", cond: "Tally X SP spent this round after reveal; X must be >= 7.", rew: "Roll D6: 4+ gives X SP to random player; else 3 SP.", pun: "-3 SP, +1 Misery card." },
  { id: 12, r1Skip: false, name: "12 - Control the Battlefield", cond: "End of round: >=1 Player unit wholly in each table quarter and >6\" from center.", rew: "-1 to Spawn Rolls. 1 random player saves card (free Secondary purchase).", pun: "+1 Misery card, +1 to Spawn Rolls." },
  { id: 13, r1Skip: true, name: "13 - The Smell of Napalm", cond: "Make 2 Strike purchases this battle round.", rew: "2 SP, -1 to Spawn Rolls.", pun: "+1 Misery card, +1 to Spawn Rolls." },
  { id: 14, r1Skip: true, name: "14 - Marching on Stomachs", cond: "Make 2 Supply purchases this battle round.", rew: "1 SP. 1 random player saves card (-5 SP cost to Reinforcements Arrive).", pun: "+1 Misery card, each Horde unit heals 3 wounds." },
  { id: 15, r1Skip: false, name: "15 - Baiting the Trap", cond: "Action (Shooting): 1 unit wholly within 6\" of center (Completes end of turn).", rew: "2 SP, +12 first Spawn Roll, 1 free Deploy Minefield.", pun: "+2 Misery cards, +2 to Spawn Rolls." },
  { id: 16, r1Skip: false, name: "16 - Lead From the Front", cond: "Tally damage X (max 4) dealt to Horde by Player CHARACTERS (X > 0) and no fewer Player CHARACTERS alive at end of round.", rew: "X SP.", pun: "+1 Misery card, -1 to Player Battle-shock tests." },
  { id: 17, r1Skip: true, name: "17 - Spruce This Place Up", cond: "End of round: have at least 2 objectives fortified.", rew: "1 SP. 1 random player saves card (discard to nullify a Misery card).", pun: "+1 Misery card, Remove all Fortified Markers." },
  { id: 18, r1Skip: false, name: "18 - Calling Shots", cond: "End of Horde Movement: mark X (>=1) Horde units. Destroy all X marked units this round.", rew: "(X * 2) SP.", pun: "+X Misery cards, +X to Spawn Rolls." },
  { id: 19, r1Skip: true, name: "19 - Tactical Withdrawal", cond: "Action (Shooting): 1 unit wholly in NML and within 4\" of board edge -> enters reserves.", rew: "1 SP. Saving player gets up to 2 free Teleporters.", pun: "Next round add Pincer Maneuver to active Misery cards." },
  { id: 20, r1Skip: false, name: "20 - Insane Gambit", cond: "Scuttle Objective Action (Shooting): 1 unit on controlled objective -> remove objective.", rew: "4 SP. 1 random player saves card (free Fortify purchase).", pun: "+2 Misery cards." },
  { id: 21, r1Skip: true, name: "21 - Stabilize Warp Beacons", cond: "Action (Shooting): 3–4 units in different quarters >6\" from center. Roll D6 (+1 if 4) per unit: 1–2 destroys unit!", rew: "1 SP, 1 free Reinforcements Arrive to a completing player.", pun: "+2 Misery cards." },
  { id: 22, r1Skip: false, name: "22 - Confirm Kills", cond: "Mark all Horde units that lose wounds. No marked Horde units alive at end of round.", rew: "3 SP, -1 to Spawn Rolls.", pun: "+2 to Spawn Rolls." },
  { id: 23, r1Skip: false, name: "23 - Secure the LZ", cond: "Action (Shooting): 3 units wholly in Defender DZ and >6\" apart.", rew: "Next Resupply: first purchase for each player costs -3 SP.", pun: "+1 Misery card & add Comms Jammed next round." },
  { id: 24, r1Skip: true, name: "24 - VIP Delivery", cond: "Action (Shooting): 1 VEHICLE/MONSTER within 6\" of center.", rew: "3 SP.", pun: "+1 Misery card." }
];

// 5. RESUPPLY TABLE (7.1)
const RESUPPLIES = [
  { cost: 1, name: "A Name Earned", tags: "Tactics", desc: "Add an Enhancement to a Character or Upgrade to a unit." },
  { cost: 2, name: "Basic Tactics", tags: "Tactics", desc: "Gain 1 CP.", autoCP: 1 },
  { cost: 3, name: "Air Strike", tags: "Strike", desc: "Select terrain area: units inside take 2D3 MW, remove terrain." },
  { cost: 3, name: "Short Range Teleporter", tags: "Supply", desc: "Place 40mm Teleporter wholly within 3\" of unengaged unit (max 3)." },
  { cost: 3, name: "Forward Operating Base", tags: "Fortify", desc: "Fortify objective: gain +1 extra SP when controlling objectives." },
  { cost: 3, name: "Pizza Party", tags: "Tactics, Supply", desc: "Remove battle-shock from any player's unit." },
  { cost: 3, name: "Share Supplies", tags: "Tactics", desc: "Grant 2 SP to another player." },
  { cost: 3, name: "Supply Drop", tags: "Supply", desc: "Add new objective to NML >=6\" from edges/objs (max 6 objs)." },
  { cost: 4, name: "Experimental Defenses", tags: "Fortify", desc: "Fortify (Warp-Relic): Start of Player Fight phase, Horde within 6\" take 3 MW (engaged Players 1 MW)." },
  { cost: 4, name: "Defensive Positions", tags: "Supply, Fortify", desc: "Set up 9\"x9\" dense ruin >=3\" from terrain (1/turn limit)." },
  { cost: 4, name: "Deploy Razor Wire", tags: "Supply, Strike", desc: "Place 40mm marker within 3\" (max 2): D3 MW on move, -1\" M, -2 Adv/Charge." },
  { cost: 4, name: "Emergency Shovel Stash", tags: "Fortify", desc: "Fortify (War Trench): Friendly melee has +1 S and +1 AP wholly within range." },
  { cost: 4, name: "Field Hospital", tags: "Fortify", desc: "Fortify (MASH): End of Movement, Player units wholly within range heal 3 wounds." },
  { cost: 4, name: "Tempt Fate", tags: "Secondary", desc: "Reveal a 2nd Secondary Mission this round (1/turn limit)." },
  { cost: 5, name: "Activate Jamming Station", tags: "Fortify", desc: "Fortify: -1 to Horde Spawn Rolls while controlled." },
  { cost: 5, name: "Advanced Tactics", tags: "Secondary, Tactics", desc: "Remove 1 active Secondary Mission and reveal a new one (1/turn limit)." },
  { cost: 5, name: "Ammo Supplies", tags: "Fortify", desc: "Fortify (Ammo Dump): Friendly ranged has [SUSTAINED HITS 1] wholly within range." },
  { cost: 5, name: "Emergency Evac", tags: "Tactics", desc: "Place unengaged unit into strategic reserves; ingress next Movement phase." },
  { cost: 6, name: "Activate Shield Generator", tags: "Fortify", desc: "Fortify: Friendly units wholly within range get FNP 5+ vs outside ranged attacks." },
  { cost: 6, name: "Deploy Minefield", tags: "Supply, Strike", desc: "40mm marker in NML >6\" from enemies/objs (max 1): D6 MW on move (removes at 10 dmg)." },
  { cost: 8, name: "A Change of Plans", tags: "Tactics", desc: "Draw 2 Secret Objectives; pick 1 or keep original." },
  { cost: 8, name: "Artillery Strike", tags: "Strike", desc: "Marker >2\" from models. End of next Fight phase, roll D6 per model within 9\": 5+ deals 1 MW (3 MW Monster/Vehicle)." },
  { cost: 12, name: "Reinforcements Arrive", tags: "Spawn", desc: "Roll 2D6 and add a unit from your army's Spawning Table to strategic reserves." },
  { cost: 0, varCost: true, name: "Patched Up", tags: "Tactics", desc: "Pay X SP to heal X wounds on an unengaged Player unit (1/turn)." },
  { cost: 0, varCost: true, name: "Field Promotion", tags: "Spawn", desc: "Destroy unengaged unit, roll 1D6 + min bracket, pay X SP equal to roll to upgrade (1/turn)." },
  { cost: 0, varCost: true, name: "Deploy Fortification", tags: "Supply, Fortify", desc: "Pay X SP equal to min bracket for a FORTIFICATION with Deep Strike (1/turn)." }
];

// 6. HARD MODE ROUND PROGRESSION
const HARD_MODE_ROUNDS = [
  null,
  { misery: 1, spawnModNum: 0, spawnMod: "+0 to Spawn Rolls" },
  { misery: 1, spawnModNum: 1, spawnMod: "+1 to Spawn Rolls" },
  { misery: 2, spawnModNum: 2, spawnMod: "+2 to Spawn Rolls" },
  { misery: 2, spawnModNum: 3, spawnMod: "+3 to Spawn Rolls" },
  { misery: 3, spawnModNum: 3, spawnMod: "+3 to Spawn Rolls" },
  { misery: 3, spawnModNum: -99, spawnMod: "NO SPAWNS • Final Horde Onslaught!" }
];

// Dual export for Node.js test runner and browser global scope
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    HORDE_FACTIONS,
    OBJECTIVES,
    MISERIES,
    SECONDARIES,
    RESUPPLIES,
    HARD_MODE_ROUNDS
  };
}
````

---

## File: `js/rng.js` <a id="file-jsrngjs"></a>

````javascript
// PRNG & Seed Hashing Engine

/**
 * 32-bit FNV-1a hash algorithm for deterministic string-to-integer hashing.
 */
function hashString(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  }
  return h >>> 0;
}

/**
 * Mulberry32 32-bit Pseudo-Random Number Generator.
 * Returns a generator function yielding uniform floats in [0, 1).
 */
function mulberry32(a) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/**
 * Seeded Fisher-Yates shuffle that immutably returns a new shuffled array.
 */
function seededShuffle(arr, rng) {
  let copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Generates a thematic room code like HADES-42.
 */
function generateRandomCode() {
  const prefixes = ["HADES", "ASH", "GATE", "THOR", "VULK", "SKULL", "WARP", "IRON", "PYRE", "HIVE"];
  const p = prefixes[Math.floor(Math.random() * prefixes.length)];
  const n = Math.floor(10 + Math.random() * 90);
  const code = `${p}-${n}`;
  if (typeof document !== 'undefined') {
    const el = document.getElementById('seedInput');
    if (el) el.value = code;
  }
  return code;
}

// Dual export for Node.js test runner and browser global scope
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    hashString,
    mulberry32,
    seededShuffle,
    generateRandomCode
  };
}
````

---

## File: `js/spawner.js` <a id="file-jsspawnerjs"></a>

````javascript
// Spawner and Bracket Evaluation Engine

const DOWN_MAP = {
  '10+': '7-9',
  '7-9': '5-6',
  '5-6': '3-4'
};

const LABEL_MAP = {
  '7-9': { label: 'Bracket [7–9] (Rolled Down x2)', pts: '151–300 pts each' },
  '5-6': { label: 'Bracket [5–6] (Rolled Down x2)', pts: '76–150 pts each' },
  '3-4': { label: 'Bracket [3–4] (Rolled Down x2)', pts: '0–75 pts each' }
};

/**
 * Evaluates the spawn bracket from the 2D6 roll and modified total.
 * Rules: Unmodified 2 is always No Spawn. Modified <= 2 is No Spawn.
 */
function getBracketInfo(modRoll, unmodRoll) {
  if (unmodRoll === 2 || modRoll <= 2) {
    return { key: 'NONE', label: 'No Spawn (Roll of 2)', pts: '0 pts' };
  }
  if (modRoll <= 4) return { key: '3-4', label: 'Bracket [3–4]', pts: '0–75 pts' };
  if (modRoll <= 6) return { key: '5-6', label: 'Bracket [5–6]', pts: '76–150 pts' };
  if (modRoll <= 9) return { key: '7-9', label: 'Bracket [7–9]', pts: '151–300 pts' };
  return { key: '10+', label: 'Bracket [10+]', pts: '301–550 pts' };
}

/**
 * Calculates the next bracket down when a player triggers a Roll Down.
 * Returns null if the bracket cannot be rolled down (NONE or 3-4).
 */
function calculateRollDown(bracketKey) {
  const nextKey = DOWN_MAP[bracketKey];
  if (!nextKey) return null;
  return {
    nextKey,
    bracketLabel: LABEL_MAP[nextKey].label,
    pts: LABEL_MAP[nextKey].pts
  };
}

/**
 * Picks a unit from the shelf pool for a given bracket.
 */
function pickSyncedUnitFromBracket(bracketKey, rng, customPoolMap = null) {
  const idMap = { '3-4': 'pool34', '5-6': 'pool56', '7-9': 'pool79', '10+': 'pool10' };
  let raw = '';

  if (customPoolMap && customPoolMap[bracketKey] !== undefined) {
    raw = customPoolMap[bracketKey];
  } else if (typeof document !== 'undefined') {
    const el = document.getElementById(idMap[bracketKey]);
    raw = el ? (el.value || '') : '';
  }

  const list = raw.split(',').map(s => s.trim()).filter(Boolean);
  if (list.length === 0) return "Unit from Bracket [" + bracketKey + "]";
  return list[Math.floor(rng() * list.length)];
}

// Dual export for Node.js test runner and browser global scope
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DOWN_MAP,
    LABEL_MAP,
    getBracketInfo,
    calculateRollDown,
    pickSyncedUnitFromBracket
  };
}
````

---

## File: `js/app.js` <a id="file-jsappjs"></a>

````javascript
// Main UI and Session Controller for Fires of Armageddon

if (typeof require !== 'undefined') {
  if (typeof HORDE_FACTIONS === 'undefined') Object.assign(globalThis, require('./data.js'));
  if (typeof hashString === 'undefined') Object.assign(globalThis, require('./rng.js'));
  if (typeof getBracketInfo === 'undefined') Object.assign(globalThis, require('./spawner.js'));
}

let selectedModeVal = 'coop';
let selectedRoleVal = '1';
let activeHordeFaction = typeof HORDE_FACTIONS !== 'undefined' ? HORDE_FACTIONS[0] : null;

let personalSecretDeck = [];
let sharedMiseryDeck = [];
let sharedSecondaryDeck = [];
let activeCard = null;
let currentChoices = [];
let activeMiseries = [];
let activeSecondaries = [];
let battleRound = 0;
let isPrivacyHidden = false;
let isSoloMode = false;
let currentShopFilter = 'All';

let sp = 0;
let spGainedThisRound = 0;
let spRoundCap = 8;
let cp = 2;
let stratCount = 0;
let currentZoneSpawns = [];

const STORAGE_KEY_SESSION = 'foa_horde_session_v1';

function saveSessionState() {
  if (typeof localStorage === 'undefined') return;
  try {
    const gameScreen = document.getElementById('gameScreen');
    const isSessionActive = !!(gameScreen && !gameScreen.classList.contains('hidden'));
    const seed = (document.getElementById('seedInput')?.value || 'HADES-1').trim().toUpperCase();
    const setupFactionMode = document.getElementById('setupFactionMode')?.value || 'SYNC_ALL';

    const data = {
      hasActiveSession: isSessionActive,
      seed,
      selectedModeVal,
      selectedRoleVal,
      setupFactionMode,
      activeHordeFactionName: activeHordeFaction ? activeHordeFaction.name : null,
      battleRound,
      sp,
      spGainedThisRound,
      spRoundCap,
      cp,
      stratCount,
      activeCard,
      currentChoices,
      activeMiseries,
      activeSecondaries,
      personalSecretDeck,
      sharedMiseryDeck,
      sharedSecondaryDeck,
      currentZoneSpawns,
      isPrivacyHidden,
      currentShopFilter
    };
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save session state:', e);
  }
}

function restoreSessionState() {
  if (typeof localStorage === 'undefined') return false;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SESSION);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (!data) return false;

    // Restore setup inputs
    if (data.selectedModeVal) selectMode(data.selectedModeVal);
    if (data.selectedRoleVal) selectRole(data.selectedRoleVal);
    if (data.seed && document.getElementById('seedInput')) {
      document.getElementById('seedInput').value = data.seed;
    }
    if (data.setupFactionMode && document.getElementById('setupFactionMode')) {
      document.getElementById('setupFactionMode').value = data.setupFactionMode;
    }

    if (!data.hasActiveSession) return false;

    // Restore session variables
    isSoloMode = (data.selectedModeVal === 'solo');
    spRoundCap = data.spRoundCap || (isSoloMode ? 16 : 8);
    battleRound = data.battleRound || 0;
    sp = (typeof data.sp === 'number') ? data.sp : 0;
    spGainedThisRound = (typeof data.spGainedThisRound === 'number') ? data.spGainedThisRound : 0;
    cp = (typeof data.cp === 'number') ? data.cp : 2;
    stratCount = data.stratCount || 0;

    activeCard = data.activeCard || null;
    currentChoices = data.currentChoices || [];
    activeMiseries = data.activeMiseries || [];
    activeSecondaries = data.activeSecondaries || [];
    personalSecretDeck = data.personalSecretDeck || [];
    sharedMiseryDeck = data.sharedMiseryDeck || [];
    sharedSecondaryDeck = data.sharedSecondaryDeck || [];
    currentZoneSpawns = data.currentZoneSpawns || [];
    isPrivacyHidden = !!data.isPrivacyHidden;
    currentShopFilter = data.currentShopFilter || 'All';

    if (data.activeHordeFactionName && typeof HORDE_FACTIONS !== 'undefined') {
      activeHordeFaction = HORDE_FACTIONS.find(f => f.name === data.activeHordeFactionName) || HORDE_FACTIONS[0];
      const sel = document.getElementById('hordeFactionSelect');
      if (sel) sel.value = activeHordeFaction.name;
      renderFactionReminderBanner();
    }

    const setupScreen = document.getElementById('setupScreen');
    const gameScreen = document.getElementById('gameScreen');
    if (setupScreen) setupScreen.classList.add('hidden');
    if (gameScreen) gameScreen.classList.remove('hidden');

    const cfg = (typeof HARD_MODE_ROUNDS !== 'undefined' && HARD_MODE_ROUNDS[Math.min(battleRound, 6)]) ? HARD_MODE_ROUNDS[Math.min(battleRound, 6)] : { misery: 1, spawnMod: '2D6+0' };
    const roundTitle = document.getElementById('roundTitle');
    if (roundTitle) roundTitle.innerText = `Battle Round ${battleRound}`;
    const spawnModDisplay = document.getElementById('spawnModDisplay');
    if (spawnModDisplay) spawnModDisplay.innerText = `${cfg.misery} Misery Drawn • ${cfg.spawnMod}`;
    const nextRoundBtn = document.getElementById('nextRoundBtn');
    if (nextRoundBtn) {
      nextRoundBtn.innerText = battleRound < 6
        ? `Advance to Battle Round ${battleRound + 1}`
        : `Battle Round 6 Active (Final Stand)`;
    }

    if (activeCard) {
      const activeCardBox = document.getElementById('activeCardBox');
      if (activeCardBox) {
        activeCardBox.innerHTML = `
          <div class="card">
            <span class="badge">${activeCard.tags}</span>
            <h4 class="card-title">${activeCard.name}</h4>
            <p class="card-desc">${activeCard.desc}</p>
          </div>
        `;
      }
      const cmCodeBox = document.getElementById('cmCodeBox');
      if (cmCodeBox) cmCodeBox.innerText = `CM Verification Code: ${activeCard.code}`;
      const selectionArea = document.getElementById('selectionArea');
      if (selectionArea) selectionArea.classList.add('hidden');
      const lockedArea = document.getElementById('lockedArea');
      if (lockedArea) lockedArea.classList.remove('hidden');
    } else if (currentChoices && currentChoices.length > 0) {
      renderSecretChoices("Select 1 Initial Secret Objective");
    }

    updateHUD();
    renderSharedDecks();
    renderResupplyTable();
    if (currentZoneSpawns && currentZoneSpawns.length > 0) {
      renderSpawnZones();
    }
    loadCustomPool();

    return true;
  } catch (e) {
    console.error('Failed to restore session state:', e);
    return false;
  }
}

function clearSessionState() {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY_SESSION);
}

// Populate Spawner Faction Dropdown and restore session on load
if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
  window.addEventListener('DOMContentLoaded', () => {
    const sel = document.getElementById('hordeFactionSelect');
    if (sel && typeof HORDE_FACTIONS !== 'undefined') {
      sel.innerHTML = HORDE_FACTIONS.map(f => `<option value="${f.name}">${f.name} (${f.ruleTitle})</option>`).join('');
    }
    restoreSessionState();
  });
}

function selectMode(mode) {
  selectedModeVal = mode;
  document.getElementById('modeCardCoop').classList.toggle('selected-red', mode === 'coop');
  document.getElementById('modeCardSolo').classList.toggle('selected-red', mode === 'solo');
  document.getElementById('playerRoleSection').classList.toggle('hidden', mode === 'solo');
  saveSessionState();
}

function selectRole(role) {
  selectedRoleVal = role;
  document.getElementById('roleCard1').classList.toggle('selected', role === '1');
  document.getElementById('roleCard2').classList.toggle('selected', role === '2');
  saveSessionState();
}

function resolveRoomSyncedFaction(code) {
  const mode = document.getElementById('setupFactionMode').value;
  const rngFac = mulberry32(hashString(code + "_HORDE_FACTION"));

  if (mode.startsWith("SYNC_")) {
    let pool = HORDE_FACTIONS;
    if (mode === "SYNC_CHAOS") pool = HORDE_FACTIONS.filter(f => f.group === "Chaos");
    if (mode === "SYNC_XENOS") pool = HORDE_FACTIONS.filter(f => f.group === "Xenos");
    if (mode === "SYNC_IMPERIUM") pool = HORDE_FACTIONS.filter(f => f.group === "Imperium");
    const idx = Math.floor(rngFac() * pool.length);
    activeHordeFaction = pool[idx];
  } else {
    activeHordeFaction = HORDE_FACTIONS.find(f => f.name === mode) || HORDE_FACTIONS[0];
  }

  document.getElementById('hordeFactionSelect').value = activeHordeFaction.name;
  renderFactionReminderBanner();
  saveSessionState();
}

function manualChangeFaction() {
  const val = document.getElementById('hordeFactionSelect').value;
  activeHordeFaction = HORDE_FACTIONS.find(f => f.name === val) || HORDE_FACTIONS[0];
  renderFactionReminderBanner();
  saveSessionState();
}

function renderFactionReminderBanner() {
  document.getElementById('activeFactionBannerTitle').innerText = `HORDE FACTION: ${activeHordeFaction.name} — "${activeHordeFaction.ruleTitle}"`;
  document.getElementById('activeFactionBannerDesc').innerText = activeHordeFaction.desc;
}

function startSession() {
  const code = (document.getElementById('seedInput').value || 'HADES-1').trim().toUpperCase();
  const mode = selectedModeVal;
  const role = selectedRoleVal;

  isSoloMode = (mode === 'solo');
  spRoundCap = isSoloMode ? 16 : 8;

  // 1. Resolve Room-Synced Horde Faction
  resolveRoomSyncedFaction(code);

  // 2. Resolve Room-Synced Decks
  const rngSecret = mulberry32(hashString(code + "_SEC"));
  const rngMisery = mulberry32(hashString(code + "_MIS"));
  const rngSecond = mulberry32(hashString(code + "_MSN"));

  const validSecrets = isSoloMode
    ? OBJECTIVES.filter(o => !o.tags.includes("Multiplayer"))
    : OBJECTIVES;

  const shuffledSecrets = seededShuffle(validSecrets, rngSecret);

  if (isSoloMode) {
    personalSecretDeck = shuffledSecrets;
    document.getElementById('secretPoolNotice').innerText = `Solo Deck (${personalSecretDeck.length} valid cards; Multiplayer blocked)`;
  } else {
    personalSecretDeck = (role === "1") ? shuffledSecrets.slice(0, 17) : shuffledSecrets.slice(17, 34);
    document.getElementById('secretPoolNotice').innerText = `Co-op Split Pool (${personalSecretDeck.length} cards)`;
  }

  sharedMiseryDeck = seededShuffle(MISERIES, rngMisery);
  sharedSecondaryDeck = seededShuffle(SECONDARIES, rngSecond);

  battleRound = 0;
  activeCard = null;
  activeMiseries = [];
  activeSecondaries = [];
  sp = 0;
  spGainedThisRound = 0;
  cp = 2;
  stratCount = 0;

  loadCustomPool();

  document.getElementById('setupScreen').classList.add('hidden');
  document.getElementById('gameScreen').classList.remove('hidden');

  currentChoices = drawSecretCards(2);
  renderSecretChoices("Select 1 Initial Secret Objective");
  updateHUD();
  renderSharedDecks();
  renderResupplyTable();
  switchTab(2);
  saveSessionState();
}

function switchTab(tabNum) {
  [1, 2, 3, 4].forEach(n => {
    document.getElementById('tab' + n).classList.toggle('hidden', n !== tabNum);
    document.getElementById('tabBtn' + n).classList.toggle('active', n === tabNum);
  });
}

function updateHUD() {
  const code = (document.getElementById('seedInput').value || 'HADES-1').trim().toUpperCase();
  document.getElementById('hudSessionInfo').innerText = isSoloMode ? `${code} • SOLO` : `${code} • P${selectedRoleVal}`;
  document.getElementById('hudRound').innerText = battleRound === 0 ? "Pre-Game" : `Round ${battleRound}/6`;
  document.getElementById('hudSp').innerText = sp;
  document.getElementById('hudSpCap').innerText = `(${spGainedThisRound}/${spRoundCap})`;
  document.getElementById('hudCp').innerText = cp;
  document.getElementById('hudStratTally').innerText = `(${stratCount} Strats)`;
  document.getElementById('spawnerBtnRound').innerText = Math.max(1, battleRound);
  saveSessionState();
}

// --- SECRET OBJECTIVES ---
function drawSecretCards(count) {
  let drawn = [];
  for (let i = 0; i < count; i++) {
    if (personalSecretDeck.length === 0) break;
    drawn.push(personalSecretDeck.shift());
  }
  return drawn;
}

function renderSecretChoices(promptText) {
  document.getElementById('selectionPrompt').innerText = promptText;
  document.getElementById('selectionArea').classList.remove('hidden');
  document.getElementById('lockedArea').classList.add('hidden');

  const list = document.getElementById('choicesList');
  list.innerHTML = currentChoices.map((c, idx) => {
    const isCur = (activeCard && c.id === activeCard.id);
    return `
      <div class="card">
        <span class="badge ${isCur ? 'gold' : ''}">${isCur ? 'Current Objective' : c.tags}</span>
        <h4 class="card-title">${c.name}</h4>
        <p class="card-desc">${c.desc}</p>
        <button onclick="pickSecretCard(${idx})" style="margin-top:14px; width:100%;">
          ${isCur ? 'Keep Current Objective' : 'Confirm & Lock Objective'}
        </button>
      </div>
    `;
  }).join('');
}

function pickSecretCard(chosenIdx) {
  const chosen = currentChoices[chosenIdx];
  currentChoices.forEach((c, idx) => {
    if (idx !== chosenIdx) personalSecretDeck.push(c);
  });
  activeCard = chosen;
  currentChoices = [];
  document.getElementById('selectionArea').classList.add('hidden');
  document.getElementById('lockedArea').classList.remove('hidden');

  document.getElementById('activeCardBox').innerHTML = `
    <div class="card">
      <span class="badge">${activeCard.tags}</span>
      <h4 class="card-title">${activeCard.name}</h4>
      <p class="card-desc">${activeCard.desc}</p>
    </div>
  `;
  document.getElementById('cmCodeBox').innerText = `CM Verification Code: ${activeCard.code}`;
  saveSessionState();
}

function triggerChangeOfPlans() {
  const drawn = drawSecretCards(2);
  if (drawn.length === 0) return alert("No cards remaining in your Secret Objective deck!");
  currentChoices = activeCard ? [activeCard, ...drawn] : drawn;
  renderSecretChoices("Change of Plans: Pick 1 or Keep Current");
}

function triggerOrbitalPunishment() {
  if (!confirm("Failed 'Establish Orbital Comms'? This draws 2 cards and assigns one at random!")) return;
  const drawn = drawSecretCards(2);
  const pool = activeCard ? [activeCard, ...drawn] : drawn;
  const randIdx = Math.floor(Math.random() * pool.length);
  currentChoices = pool;
  pickSecretCard(randIdx);
  alert(`New Randomized Secret Objective: ${activeCard.name}`);
}

function togglePrivacy() {
  isPrivacyHidden = !isPrivacyHidden;
  document.getElementById('PrivacyWrapper').classList.toggle('hidden', isPrivacyHidden);
  document.getElementById('privacyBtn').innerText = isPrivacyHidden ? "Show Objective" : "Hide Screen";
}

// --- BATTLE ROUND, MISERY & SECONDARIES ---
function advanceBattleRound() {
  if (battleRound >= 6) {
    if (!confirm("Round 6 complete! Continue into Infinite Mode Round " + (battleRound + 1) + "?")) return;
  }
  battleRound++;
  spGainedThisRound = 0;

  const cfg = HARD_MODE_ROUNDS[Math.min(battleRound, 6)];
  document.getElementById('roundTitle').innerText = `Battle Round ${battleRound}`;
  document.getElementById('spawnModDisplay').innerText = `${cfg.misery} Misery Drawn • ${cfg.spawnMod}`;
  document.getElementById('nextRoundBtn').innerText = battleRound < 6
    ? `Advance to Battle Round ${battleRound + 1}`
    : `Battle Round 6 Active (Final Stand)`;

  activeMiseries = [];
  activeSecondaries = [];

  drawMisery(cfg.misery);
  // Orks Round 3 High (Green) Tide check
  if (battleRound === 3 && activeHordeFaction.name === 'Orks') {
    drawMisery(1);
  }

  if (battleRound <= 5) {
    drawSecondary(battleRound === 1);
  }

  updateHUD();
  renderSharedDecks();
}

function drawMisery(count) {
  for (let i = 0; i < count; i++) {
    if (sharedMiseryDeck.length === 0) {
      const code = (document.getElementById('seedInput').value || 'HADES-1').trim().toUpperCase();
      sharedMiseryDeck = seededShuffle(MISERIES, mulberry32(hashString(code + "_MIS_R" + battleRound)));
    }
    const card = sharedMiseryDeck.shift();
    activeMiseries.push(card);
    if (card.id === 20) drawMisery(2);
    if (card.id === 14 && isSoloMode) drawMisery(2);
  }
  renderSharedDecks();
}

function triggerSpecificMisery() {
  const id = parseInt(document.getElementById('specificMiserySelect').value, 10);
  const found = MISERIES.find(m => m.id === id);
  if (!found) return;
  sharedMiseryDeck = sharedMiseryDeck.filter(m => m.id !== id);
  activeMiseries.push(found);
  renderSharedDecks();
}

function drawSecondary(isRound1) {
  if (sharedSecondaryDeck.length === 0) {
    const code = (document.getElementById('seedInput').value || 'HADES-1').trim().toUpperCase();
    sharedSecondaryDeck = seededShuffle(SECONDARIES, mulberry32(hashString(code + "_MSN_R" + battleRound)));
  }
  let skipped = [];
  let chosen = null;
  while (sharedSecondaryDeck.length > 0) {
    let candidate = sharedSecondaryDeck.shift();
    if (isRound1 && candidate.r1Skip) {
      skipped.push(candidate);
    } else {
      chosen = candidate;
      break;
    }
  }
  sharedSecondaryDeck.push(...skipped);
  if (chosen) activeSecondaries.push(chosen);
  renderSharedDecks();
}

function replaceSecondary() {
  if (activeSecondaries.length === 0) return alert("No active Secondary Mission to replace!");
  activeSecondaries.pop();
  drawSecondary(battleRound === 1);
}

function renderSharedDecks() {
  document.getElementById('secDeckCount').innerText = `${sharedSecondaryDeck.length} in deck`;
  document.getElementById('misDeckCount').innerText = `${sharedMiseryDeck.length} in deck`;

  const secBox = document.getElementById('activeSecondariesBox');
  if (activeSecondaries.length === 0) {
    secBox.innerHTML = `<div class="card secondary" style="opacity:0.6;"><p class="card-desc">No active Secondary Mission.</p></div>`;
  } else {
    secBox.innerHTML = activeSecondaries.map(s => `
      <div class="card secondary">
        <span class="badge gold">Secondary Mission</span>
        <h4 class="card-title">${s.name}</h4>
        <p class="card-desc">${s.cond}</p>
        <div class="meta-row">
          <span class="reward-pill"><strong>Reward:</strong> ${s.rew}</span>
          <span class="punish-pill"><strong>Failure:</strong> ${s.pun}</span>
        </div>
      </div>
    `).join('');
  }

  const misBox = document.getElementById('activeMiseriesBox');
  if (activeMiseries.length === 0) {
    misBox.innerHTML = `<div class="card misery" style="opacity:0.6;"><p class="card-desc">No active Misery Cards.</p></div>`;
  } else {
    misBox.innerHTML = activeMiseries.map(m => `
      <div class="card misery">
        <span class="badge red">Misery Effect</span>
        <h4 class="card-title">${m.name}</h4>
        <p class="card-desc">${m.desc}</p>
      </div>
    `).join('');
  }
}

// --- TAB 4: ROOM-SYNCED HORDE SPAWNER ---
function saveCustomPool() {
  const pool = {
    b34: document.getElementById('pool34').value,
    b56: document.getElementById('pool56').value,
    b79: document.getElementById('pool79').value,
    b10: document.getElementById('pool10').value
  };
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('armageddon_horde_pool', JSON.stringify(pool));
  }
  if (typeof alert === 'function') alert("Custom Shelf Pool saved!");
}

function loadCustomPool() {
  if (typeof localStorage === 'undefined') return;
  const saved = localStorage.getItem('armageddon_horde_pool');
  if (!saved) return;
  try {
    const p = JSON.parse(saved);
    if (p.b34) document.getElementById('pool34').value = p.b34;
    if (p.b56) document.getElementById('pool56').value = p.b56;
    if (p.b79) document.getElementById('pool79').value = p.b79;
    if (p.b10) document.getElementById('pool10').value = p.b10;
  } catch (e) {}
}

function rollAllSpawnZones() {
  if (battleRound === 6) {
    return alert("Battle Round 6 (Hard Mode Final Stand): Do NOT roll Spawn Rolls in Round 6!");
  }
  const code = (document.getElementById('seedInput').value || 'HADES-1').trim().toUpperCase();
  const effRound = Math.max(1, battleRound);
  const numZones = parseInt(document.getElementById('spawnZoneCountSelect').value, 10);
  const fac = activeHordeFaction.name;
  const extraMod = parseInt(document.getElementById('extraSpawnMod').value, 10) || 0;
  const jammerActive = document.getElementById('jammerCheck').checked;
  const unluckyNightActive = activeMiseries.some(m => m.id === 7);
  const firstBonus6 = document.getElementById('firstRollBonusCheck').checked;
  const firstBonus12 = document.getElementById('baitTrapBonusCheck').checked;

  const rndIndex = Math.max(1, Math.min(effRound, 5));
  let baseRoundMod = HARD_MODE_ROUNDS[rndIndex].spawnModNum;
  if (effRound === 3 && fac === 'Orks') baseRoundMod += 1;

  currentZoneSpawns = [];

  for (let z = 1; z <= numZones; z++) {
    // Seeded RNG per Room + Round + Zone so both phones roll identical spawns!
    const rngZone = mulberry32(hashString(`${code}_SPAWN_R${effRound}_Z${z}`));
    let unmod = 0;
    let diceStr = "";

    if (z === 1 && effRound >= 4 && fac === 'Adepta Sororitas') {
      unmod = 12;
      diceStr = "Auto-12 (Martyrs & Miracles)";
    } else if (unluckyNightActive) {
      const d1 = Math.floor(rngZone() * 6) + 1;
      const d2 = Math.floor(rngZone() * 6) + 1;
      const d3 = Math.floor(rngZone() * 6) + 1;
      const sorted = [d1, d2, d3].sort((a,b) => b - a);
      unmod = sorted[0] + sorted[1];
      diceStr = `3D6 Drop Lowest (${d1},${d2},${d3} → ${unmod})`;
    } else {
      const d1 = Math.floor(rngZone() * 6) + 1;
      const d2 = Math.floor(rngZone() * 6) + 1;
      unmod = d1 + d2;
      diceStr = `2D6 (${d1}+${d2} = ${unmod})`;
    }

    let totalMod = baseRoundMod + extraMod + (jammerActive ? -1 : 0);
    if (z === 1 && firstBonus6) totalMod += 6;
    if (z === 1 && firstBonus12) totalMod += 12;

    const finalRoll = unmod + totalMod;
    const bInfo = getBracketInfo(finalRoll, unmod);
    const unitPicked = (bInfo.key === 'NONE') ? 'None' : pickSyncedUnitFromBracket(bInfo.key, rngZone);

    currentZoneSpawns.push({
      zone: z,
      diceStr,
      unmod,
      totalMod,
      finalRoll,
      bracketKey: bInfo.key,
      bracketLabel: bInfo.label,
      pts: bInfo.pts,
      units: [unitPicked]
    });
  }

  renderSpawnZones();
}

function rollDownZone(idx) {
  const z = currentZoneSpawns[idx];
  const rollDownResult = calculateRollDown(z.bracketKey);
  if (!rollDownResult) {
    return alert("Cannot roll down lower than Bracket [3–4]!");
  }

  const { nextKey, bracketLabel, pts } = rollDownResult;
  const code = (document.getElementById('seedInput').value || 'HADES-1').trim().toUpperCase();
  const rngDown = mulberry32(hashString(`${code}_ROLLDOWN_R${battleRound}_Z${z.zone}_${nextKey}`));

  const newCount = z.units.length * 2;
  let newUnits = [];
  for (let i = 0; i < newCount; i++) {
    newUnits.push(pickSyncedUnitFromBracket(nextKey, rngDown));
  }
  z.bracketKey = nextKey;
  z.bracketLabel = bracketLabel;
  z.pts = pts;
  z.units = newUnits;
  renderSpawnZones();
}

function renderSpawnZones() {
  const container = document.getElementById('spawnResultsContainer');
  container.innerHTML = currentZoneSpawns.map((z, idx) => `
    <div class="card spawn-zone">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap;">
        <span class="badge green">Spawn Zone ${z.zone} • ${z.bracketLabel} (${z.pts})</span>
        <span class="hud-sub">${z.diceStr} | Mod: ${z.totalMod >= 0 ? '+'+z.totalMod : z.totalMod} → <strong>Total: ${z.finalRoll}</strong></span>
      </div>
      <h4 class="card-title" style="margin-top:4px;">${z.units.join('  +  ')}</h4>
      ${(z.bracketKey !== 'NONE' && z.bracketKey !== '3-4') ? `
        <button class="btn-ghost btn-sm" style="margin-top:8px;" onclick="rollDownZone(${idx})">
          ⤵️ Roll Down (Spawn 2x Lower Bracket Units Instead)
        </button>
      ` : ''}
    </div>
  `).join('');
}

// --- SP, CP & RESUPPLY SHOP ---
function gainSP(amount) {
  const remainingCap = spRoundCap - spGainedThisRound;
  if (remainingCap <= 0) {
    if (!confirm(`Round cap of ${spRoundCap} SP reached! Add SP anyway?`)) return;
    sp += amount;
  } else {
    const actual = Math.min(amount, remainingCap);
    sp += actual;
    spGainedThisRound += actual;
  }
  updateHUD();
}

function loseSP(amount) {
  sp = Math.max(0, sp - amount);
  updateHUD();
}

function adjCP(delta) {
  cp = Math.max(0, cp + delta);
  updateHUD();
}

function spendCPForStrat() {
  if (cp <= 0) return alert("0 CP remaining!");
  cp--;
  stratCount++;
  updateHUD();
}

function adjMarker(id, delta, max) {
  const el = document.getElementById(id);
  let val = parseInt(el.innerText, 10) + delta;
  el.innerText = Math.max(0, Math.min(max, val));
}

function setShopFilter(tag, btnEl) {
  currentShopFilter = tag;
  document.querySelectorAll('.filter-bar .chip').forEach(b => b.classList.remove('active'));
  btnEl.classList.add('active');
  renderResupplyTable();
}

function buyResupply(idx) {
  const item = RESUPPLIES[idx];
  const isDoubled = document.getElementById('doubleCostToggle').checked;
  let finalCost = item.cost;

  if (item.varCost) {
    const input = prompt(`Enter X SP to spend on ${item.name}:`, "3");
    if (input === null) return;
    finalCost = parseInt(input, 10) || 0;
  }
  if (isDoubled) finalCost *= 2;

  if (sp < finalCost) {
    return alert(`Insufficient SP! Need ${finalCost} SP (You have ${sp} SP).`);
  }
  sp -= finalCost;
  if (item.autoCP) cp += item.autoCP;
  if (item.name === "A Change of Plans") {
    switchTab(2);
    triggerChangeOfPlans();
  } else if (item.name === "Tempt Fate") {
    drawSecondary(battleRound === 1);
    switchTab(1);
  } else if (item.name === "Advanced Tactics") {
    replaceSecondary();
    switchTab(1);
  }
  updateHUD();
}

function renderResupplyTable() {
  const isDoubled = document.getElementById('doubleCostToggle').checked;
  const container = document.getElementById('resupplyList');

  const filtered = RESUPPLIES.map((r, i) => ({ ...r, origIdx: i }))
    .filter(r => currentShopFilter === 'All' || r.tags.includes(currentShopFilter));

  container.innerHTML = filtered.map(r => {
    const dispCost = r.varCost ? (isDoubled ? "2X SP" : "X SP") : `${isDoubled ? r.cost * 2 : r.cost} SP`;
    return `
      <div class="card resupply">
        <div>
          <span class="badge blue" style="margin-bottom:4px;">${dispCost} • ${r.tags}</span>
          <h4 class="card-title" style="font-size:1rem;">${r.name}</h4>
          <p class="card-desc" style="font-size:0.86rem;">${r.desc}</p>
        </div>
        <button class="btn-blue btn-sm" onclick="buyResupply(${r.origIdx})">Buy</button>
      </div>
    `;
  }).join('');
}

function leaveSession() {
  if (typeof confirm === 'function' && !confirm("Exit current battle terminal?")) return;
  document.getElementById('gameScreen').classList.add('hidden');
  document.getElementById('setupScreen').classList.remove('hidden');
  saveSessionState();
}

// Dual export for Node.js test runner and browser environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    selectMode,
    selectRole,
    resolveRoomSyncedFaction,
    manualChangeFaction,
    renderFactionReminderBanner,
    startSession,
    updateHUD,
    gainSP,
    loseSP,
    adjCP,
    spendCPForStrat,
    buyResupply,
    leaveSession,
    saveSessionState,
    restoreSessionState,
    clearSessionState
  };
}
````

---

## File: `tests/js/data.test.js` <a id="file-testsjsdatatestjs"></a>

````javascript
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  HORDE_FACTIONS,
  OBJECTIVES,
  MISERIES,
  SECONDARIES,
  RESUPPLIES,
  HARD_MODE_ROUNDS
} = require('../../js/data.js');

test('HORDE_FACTIONS: contains all 23 official factions with valid schema', () => {
  assert.equal(HORDE_FACTIONS.length, 23);
  const validGroups = new Set(['Imperium', 'Chaos', 'Xenos']);

  HORDE_FACTIONS.forEach(f => {
    assert.ok(f.name && typeof f.name === 'string');
    assert.ok(validGroups.has(f.group), `Invalid group: ${f.group} for ${f.name}`);
    assert.ok(f.ruleTitle && typeof f.ruleTitle === 'string');
    assert.ok(f.desc && typeof f.desc === 'string');
  });
});

test('OBJECTIVES: contains 34 unique secret objectives with valid CM codes', () => {
  assert.equal(OBJECTIVES.length, 34);
  const ids = new Set();
  const codes = new Set();

  OBJECTIVES.forEach(o => {
    assert.ok(!ids.has(o.id), `Duplicate objective id: ${o.id}`);
    assert.ok(!codes.has(o.code), `Duplicate objective code: ${o.code}`);
    ids.add(o.id);
    codes.add(o.code);

    assert.ok(o.name && typeof o.name === 'string');
    assert.ok(o.tags && typeof o.tags === 'string');
    assert.ok(o.desc && typeof o.desc === 'string');
  });
});

test('MISERIES: contains 36 unique misery cards', () => {
  assert.equal(MISERIES.length, 36);
  const ids = new Set();

  MISERIES.forEach(m => {
    assert.ok(!ids.has(m.id), `Duplicate misery id: ${m.id}`);
    ids.add(m.id);
    assert.ok(m.name && typeof m.name === 'string');
    assert.ok(m.desc && typeof m.desc === 'string');
  });
});

test('SECONDARIES: contains 24 secondary missions with valid condition, reward, punishment', () => {
  assert.equal(SECONDARIES.length, 24);
  SECONDARIES.forEach(s => {
    assert.ok(s.id >= 1 && s.id <= 24);
    assert.ok(typeof s.r1Skip === 'boolean');
    assert.ok(s.name && typeof s.name === 'string');
    assert.ok(s.cond && typeof s.cond === 'string');
    assert.ok(s.rew && typeof s.rew === 'string');
    assert.ok(s.pun && typeof s.pun === 'string');
  });
});

test('RESUPPLIES: all cards have defined costs, names, and tags', () => {
  assert.ok(RESUPPLIES.length >= 25);
  RESUPPLIES.forEach(r => {
    assert.ok(typeof r.cost === 'number');
    assert.ok(r.name && typeof r.name === 'string');
    assert.ok(r.tags && typeof r.tags === 'string');
    assert.ok(r.desc && typeof r.desc === 'string');
  });
});

test('HARD_MODE_ROUNDS: correctly specifies 6 rounds with Round 6 Final Stand', () => {
  for (let r = 1; r <= 6; r++) {
    const roundCfg = HARD_MODE_ROUNDS[r];
    assert.ok(roundCfg, `Missing config for round ${r}`);
    assert.ok(typeof roundCfg.misery === 'number');
    assert.ok(typeof roundCfg.spawnModNum === 'number');
    assert.ok(roundCfg.spawnMod && typeof roundCfg.spawnMod === 'string');
  }
  // Round 6 has spawnModNum = -99 (Final Stand)
  assert.equal(HARD_MODE_ROUNDS[6].spawnModNum, -99);
});
````

---

## File: `tests/js/rng.test.js` <a id="file-testsjsrngtestjs"></a>

````javascript
const test = require('node:test');
const assert = require('node:assert/strict');
const { hashString, mulberry32, seededShuffle, generateRandomCode } = require('../../js/rng.js');

test('hashString should produce deterministic 32-bit uint', () => {
  const hash1 = hashString('HADES-1');
  const hash2 = hashString('HADES-1');
  assert.equal(hash1, hash2);
  assert.equal(typeof hash1, 'number');
  assert.ok(hash1 >= 0 && hash1 <= 4294967295);
});

test('hashString should differentiate distinct strings', () => {
  const hA = hashString('HADES-1_SEC');
  const hB = hashString('HADES-1_MIS');
  assert.notEqual(hA, hB);
});

test('mulberry32 should produce deterministic sequences for identical seeds', () => {
  const rng1 = mulberry32(12345);
  const rng2 = mulberry32(12345);

  const seq1 = [rng1(), rng1(), rng1(), rng1(), rng1()];
  const seq2 = [rng2(), rng2(), rng2(), rng2(), rng2()];

  assert.deepEqual(seq1, seq2);
});

test('mulberry32 generates numbers in [0, 1)', () => {
  const rng = mulberry32(99999);
  for (let i = 0; i < 500; i++) {
    const val = rng();
    assert.ok(val >= 0 && val < 1, `Value ${val} out of bounds [0, 1)`);
  }
});

test('seededShuffle preserves array elements without losing or duplicating items', () => {
  const original = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const rng = mulberry32(42);
  const shuffled = seededShuffle(original, rng);

  assert.equal(shuffled.length, original.length);
  assert.deepEqual([...shuffled].sort((a, b) => a - b), original);
  // Ensure immutability of the original array
  assert.deepEqual(original, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
});

test('seededShuffle is strictly reproducible across runs', () => {
  const deck = ['A', 'B', 'C', 'D', 'E', 'F'];
  const rng1 = mulberry32(hashString('ROOM_TEST_1'));
  const rng2 = mulberry32(hashString('ROOM_TEST_1'));

  const s1 = seededShuffle(deck, rng1);
  const s2 = seededShuffle(deck, rng2);

  assert.deepEqual(s1, s2);
});

test('generateRandomCode returns a string with valid prefix and 2-digit number', () => {
  const code = generateRandomCode();
  assert.match(code, /^[A-Z]+-\d{2}$/);
});
````

---

## File: `tests/js/spawner.test.js` <a id="file-testsjsspawnertestjs"></a>

````javascript
const test = require('node:test');
const assert = require('node:assert/strict');
const { getBracketInfo, calculateRollDown, pickSyncedUnitFromBracket } = require('../../js/spawner.js');
const { mulberry32 } = require('../../js/rng.js');

test('getBracketInfo: unmod 2 always results in No Spawn', () => {
  // Even if modified roll is high (e.g., +12 bonus), unmod 2 is No Spawn
  const result = getBracketInfo(14, 2);
  assert.equal(result.key, 'NONE');
  assert.equal(result.pts, '0 pts');
});

test('getBracketInfo: modified rolls <= 2 result in No Spawn', () => {
  const result = getBracketInfo(2, 3);
  assert.equal(result.key, 'NONE');
});

test('getBracketInfo: correctly categorizes all standard brackets', () => {
  assert.equal(getBracketInfo(3, 3).key, '3-4');
  assert.equal(getBracketInfo(4, 4).key, '3-4');
  assert.equal(getBracketInfo(5, 5).key, '5-6');
  assert.equal(getBracketInfo(6, 6).key, '5-6');
  assert.equal(getBracketInfo(7, 7).key, '7-9');
  assert.equal(getBracketInfo(8, 8).key, '7-9');
  assert.equal(getBracketInfo(9, 9).key, '7-9');
  assert.equal(getBracketInfo(10, 10).key, '10+');
  assert.equal(getBracketInfo(12, 12).key, '10+');
  assert.equal(getBracketInfo(16, 11).key, '10+');
});

test('calculateRollDown: cascades down correctly from 10+ down to 3-4', () => {
  const step1 = calculateRollDown('10+');
  assert.ok(step1);
  assert.equal(step1.nextKey, '7-9');

  const step2 = calculateRollDown('7-9');
  assert.ok(step2);
  assert.equal(step2.nextKey, '5-6');

  const step3 = calculateRollDown('5-6');
  assert.ok(step3);
  assert.equal(step3.nextKey, '3-4');

  const step4 = calculateRollDown('3-4');
  assert.equal(step4, null, 'Bracket 3-4 must not be able to roll down further');

  const noneStep = calculateRollDown('NONE');
  assert.equal(noneStep, null, 'NONE must not be able to roll down');
});

test('pickSyncedUnitFromBracket: picks from shelf pool and falls back gracefully', () => {
  const mockPool = {
    '3-4': 'Hormagaunts, Termagants, Cultists',
    '5-6': '',
    '7-9': 'Carnifex',
    '10+': 'Hive Tyrant'
  };

  const rng = mulberry32(100);
  const picked34 = pickSyncedUnitFromBracket('3-4', rng, mockPool);
  assert.ok(['Hormagaunts', 'Termagants', 'Cultists'].includes(picked34));

  const fallback = pickSyncedUnitFromBracket('5-6', rng, mockPool);
  assert.equal(fallback, 'Unit from Bracket [5-6]');

  const picked79 = pickSyncedUnitFromBracket('7-9', rng, mockPool);
  assert.equal(picked79, 'Carnifex');
});
````

---

## File: `tests/js/app.test.js` <a id="file-testsjsapptestjs"></a>

````javascript
const test = require('node:test');
const assert = require('node:assert/strict');

// Set up minimal mock DOM environment before loading app
const mockElements = {};
function getOrCreateElement(id) {
  if (!mockElements[id]) {
    mockElements[id] = {
      classList: {
        classes: new Set(),
        toggle(cls, condition) {
          if (condition === undefined) {
            if (this.classes.has(cls)) this.classes.delete(cls);
            else this.classes.add(cls);
          } else if (condition) {
            this.classes.add(cls);
          } else {
            this.classes.delete(cls);
          }
        },
        add(cls) { this.classes.add(cls); },
        remove(cls) { this.classes.delete(cls); },
        contains(cls) { return this.classes.has(cls); }
      },
      innerText: '',
      innerHTML: '',
      value: ''
    };
  }
  return mockElements[id];
}

const storageStore = new Map();
globalThis.localStorage = {
  getItem: (k) => (storageStore.has(k) ? storageStore.get(k) : null),
  setItem: (k, v) => storageStore.set(k, String(v)),
  removeItem: (k) => storageStore.delete(k),
  clear: () => storageStore.clear()
};

globalThis.document = {
  getElementById: (id) => getOrCreateElement(id),
  querySelectorAll: () => []
};
globalThis.window = {
  addEventListener: () => {}
};

const app = require('../../js/app.js');

test('app: selectMode toggles mode state and DOM classes', () => {
  app.selectMode('solo');
  const coopCard = document.getElementById('modeCardCoop');
  const soloCard = document.getElementById('modeCardSolo');
  const roleSec = document.getElementById('playerRoleSection');

  assert.equal(soloCard.classList.contains('selected-red'), true);
  assert.equal(coopCard.classList.contains('selected-red'), false);
  assert.equal(roleSec.classList.contains('hidden'), true);

  app.selectMode('coop');
  assert.equal(soloCard.classList.contains('selected-red'), false);
  assert.equal(coopCard.classList.contains('selected-red'), true);
  assert.equal(roleSec.classList.contains('hidden'), false);
});

test('app: selectRole toggles role state and DOM classes', () => {
  app.selectRole('2');
  const role1 = document.getElementById('roleCard1');
  const role2 = document.getElementById('roleCard2');

  assert.equal(role1.classList.contains('selected'), false);
  assert.equal(role2.classList.contains('selected'), true);

  app.selectRole('1');
  assert.equal(role1.classList.contains('selected'), true);
  assert.equal(role2.classList.contains('selected'), false);
});

test('app: resolveRoomSyncedFaction deterministically selects faction', () => {
  const setupMode = document.getElementById('setupFactionMode');
  setupMode.value = 'SYNC_CHAOS';

  app.resolveRoomSyncedFaction('ALPHA-01');
  const select = document.getElementById('hordeFactionSelect');
  assert.ok(select.value.length > 0);

  const bannerTitle = document.getElementById('activeFactionBannerTitle').innerText;
  assert.match(bannerTitle, /^HORDE FACTION:/);
});

test('app: startSession launches game screen from seed input', () => {
  const seedInput = document.getElementById('seedInput');
  seedInput.value = 'TERRA-99';
  document.getElementById('setupFactionMode').value = 'Orks';

  app.startSession();

  const gameScreen = document.getElementById('gameScreen');
  const setupScreen = document.getElementById('setupScreen');

  assert.equal(gameScreen.classList.contains('hidden'), false);
  assert.equal(setupScreen.classList.contains('hidden'), true);
});

test('app: session state persists to localStorage and can be restored across tab switches', () => {
  // 1. Verify startSession writes to localStorage
  const raw = localStorage.getItem('foa_horde_session_v1');
  assert.ok(raw, 'localStorage must contain foa_horde_session_v1 after startSession');

  const parsed = JSON.parse(raw);
  assert.equal(parsed.hasActiveSession, true);
  assert.equal(parsed.seed, 'TERRA-99');

  // 2. Mutate state with gainSP and adjCP
  app.gainSP(5);
  app.adjCP(1);

  const updatedRaw = localStorage.getItem('foa_horde_session_v1');
  const updatedParsed = JSON.parse(updatedRaw);
  assert.equal(updatedParsed.sp, 5);
  assert.equal(updatedParsed.cp, 3);

  // 3. Simulate reload or tab switch and restore
  document.getElementById('gameScreen').classList.add('hidden');
  document.getElementById('setupScreen').classList.remove('hidden');

  const restored = app.restoreSessionState();
  assert.equal(restored, true, 'restoreSessionState must return true when active session exists');
  assert.equal(document.getElementById('gameScreen').classList.contains('hidden'), false);
  assert.equal(document.getElementById('setupScreen').classList.contains('hidden'), true);

  // 4. Test leaveSession deactivates active session
  globalThis.confirm = () => true;
  app.leaveSession();
  const leftRaw = localStorage.getItem('foa_horde_session_v1');
  const leftParsed = JSON.parse(leftRaw);
  assert.equal(leftParsed.hasActiveSession, false);
});

````

---

## File: `tests/ui/pages.test.js` <a id="file-testsuipagestestjs"></a>

````javascript
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '../../');

function readPage(fileName) {
  return fs.readFileSync(path.join(ROOT_DIR, fileName), 'utf8');
}

test('UI Boundary: index.html has complete navigation, stylesheets, and modular scripts', () => {
  const html = readPage('index.html');

  assert.ok(html.includes('<nav class="suite-nav">'), 'Missing suite navigation bar');
  assert.ok(html.includes('href="pages/briefing.html" class="suite-link">📜 Briefings, Ship &amp; Atlas</a>'));
  assert.ok(html.includes('href="pages/pvp.html"'));
  assert.ok(html.includes('href="pages/rogue.html"'));
  assert.ok(html.includes('href="pages/roster.html"'));

  // Stylesheet
  assert.ok(html.includes('<link rel="stylesheet" href="css/style.css">'));

  // Modular script architecture
  assert.ok(html.includes('<script src="js/data.js"></script>'));
  assert.ok(html.includes('<script src="js/rng.js"></script>'));
  assert.ok(html.includes('<script src="js/spawner.js"></script>'));
  assert.ok(html.includes('<script src="js/app.js"></script>'));
});

test('UI Boundary: all subpages live in /pages and share unified navigation links', () => {
  const subpages = ['pvp.html', 'rogue.html', 'roster.html', 'briefing.html'];
  const expectedBriefingSnippet = 'href="briefing.html" class="suite-link';
  const expectedRootIndexSnippet = 'href="../index.html" class="suite-link';

  for (const page of subpages) {
    const rootPagePath = path.join(ROOT_DIR, page);
    assert.equal(fs.existsSync(rootPagePath), false, `${page} must not remain loose in repository root`);

    const html = readPage(path.join('pages', page));
    assert.ok(html.includes(expectedRootIndexSnippet), `pages/${page} must link back to ../index.html`);
    assert.ok(html.includes(expectedBriefingSnippet), `pages/${page} missing standard briefing suite-link`);
    assert.ok(
      html.includes('Briefings, Ship &amp; Atlas') || html.includes('Briefings, Ship & Atlas'),
      `pages/${page} navigation text must match Briefings, Ship & Atlas`
    );
  }

  const briefingHtml = readPage('pages/briefing.html');
  assert.ok(
    briefingHtml.includes('<link rel="stylesheet" href="../css/style.css">'),
    'pages/briefing.html must link to ../css/style.css'
  );
  assert.ok(
    briefingHtml.includes('href="../index.html" class="terminal-link-btn">'),
    'pages/briefing.html terminal button must link to ../index.html'
  );
});

test('All HTML pages link to assets/favicon.svg and apple-touch-icon in /assets', () => {
  const faviconSvgPath = path.join(ROOT_DIR, 'assets/favicon.svg');
  const faviconPngPath = path.join(ROOT_DIR, 'assets/favicon.png');
  assert.ok(fs.existsSync(faviconSvgPath), 'assets/favicon.svg must exist in /assets directory');
  assert.ok(fs.existsSync(faviconPngPath), 'assets/favicon.png must exist in /assets directory');
  assert.equal(fs.existsSync(path.join(ROOT_DIR, 'favicon.svg')), false, 'favicon.svg must not remain in root');
  assert.equal(fs.existsSync(path.join(ROOT_DIR, 'favicon.png')), false, 'favicon.png must not remain in root');

  const indexHtml = readPage('index.html');
  assert.match(
    indexHtml,
    /<link\s+rel="icon"\s+type="image\/svg\+xml"\s+href="assets\/favicon\.svg"\s*\/?>/i,
    'index.html must include <link rel="icon" type="image/svg+xml" href="assets/favicon.svg">'
  );
  assert.match(
    indexHtml,
    /<link\s+rel="apple-touch-icon"\s+href="assets\/favicon\.svg"\s*\/?>/i,
    'index.html must include <link rel="apple-touch-icon" href="assets/favicon.svg">'
  );

  const subpages = ['pages/briefing.html', 'pages/pvp.html', 'pages/rogue.html', 'pages/roster.html'];
  for (const page of subpages) {
    const html = readPage(page);
    assert.match(
      html,
      /<link\s+rel="icon"\s+type="image\/svg\+xml"\s+href="\.\.\/assets\/favicon\.svg"\s*\/?>/i,
      `${page} must include <link rel="icon" type="image/svg+xml" href="../assets/favicon.svg">`
    );
    assert.match(
      html,
      /<link\s+rel="apple-touch-icon"\s+href="\.\.\/assets\/favicon\.svg"\s*\/?>/i,
      `${page} must include <link rel="apple-touch-icon" href="../assets/favicon.svg">`
    );
  }
});

test('UI Boundary: pages/briefing.html defaults to Commander Beta dossier and includes immersive dispatch without Marauder spoiler', () => {
  const html = readPage('pages/briefing.html');

  // Verify tab switcher defaults to Beta
  assert.match(
    html,
    /<button\s+id="btnBeta"\s+class="active"/i,
    'pages/briefing.html must have #btnBeta active by default'
  );
  assert.doesNotMatch(
    html,
    /<button\s+id="btnAlpha"\s+class="active"/i,
    'pages/briefing.html must not have #btnAlpha active by default'
  );

  // Verify dossier containers default visibility
  assert.match(
    html,
    /<div\s+id="dossierAlpha"\s+class="hidden"/i,
    '#dossierAlpha must have class="hidden" by default'
  );
  assert.match(
    html,
    /<div\s+id="dossierBeta"(?!\s+class="hidden")/i,
    '#dossierBeta must be visible (not hidden) on load'
  );

  // Verify new sealed Astropathic dispatch and clearance gate
  assert.ok(
    html.includes("Commander Beta's Sealed Astropathic Dispatch"),
    'Must include Commander Beta sealed dispatch title'
  );
  assert.ok(
    html.includes('Clearance Vermilion-Beta • Restricted Dataslate'),
    'Must include Vermilion-Beta clearance tag'
  );
  assert.ok(
    html.includes('The Voice in the Ash (Your Chronicler &amp; The Third Force)') ||
    html.includes('The Voice in the Ash (Your Chronicler & The Third Force)'),
    'Must include The Voice in the Ash narrative section'
  );
  assert.ok(
    html.includes('unlock-btn') && html.includes("unlockTab('Beta')"),
    'Must include unlock button for Beta'
  );
  assert.ok(
    html.includes('lock-toggle-btn') && html.includes("lockTab('Beta')"),
    'Must include lock toggle button for Beta'
  );

  // Verify secret Marauder spoiler is NOT present
  assert.ok(
    !html.includes('and will switch to <strong>⚔️ Marauders</strong> if you claim Gatebreakers'),
    'Briefing must not reveal Alpha switching to Marauders if Beta chooses Gatebreakers'
  );
});

test('pages/briefing.html contains the 8-Node SVG Sector Map and 3-way Parallel Hegemony Race tracker', () => {
  const html = readPage('pages/briefing.html');

  assert.match(html, /id="armageddon-sector-map"/, 'pages/briefing.html must contain #armageddon-sector-map SVG');
  assert.match(html, /id="atlas-node-inspector"/, 'pages/briefing.html must contain #atlas-node-inspector panel');
  assert.match(html, /id="heg-bar-alpha"/, 'pages/briefing.html must contain Alpha parallel hegemony bar');
  assert.match(html, /id="heg-bar-beta"/, 'pages/briefing.html must contain Beta parallel hegemony bar');
  assert.match(html, /id="heg-bar-horde"/, 'pages/briefing.html must contain 3rd Alliance parallel hegemony bar');

  for (let i = 0; i <= 7; i++) {
    assert.match(
      html,
      new RegExp(`data-node-id="${i}"`),
      `SVG map in pages/briefing.html must include interactive node data-node-id="${i}"`
    );
  }
});

test('UI Boundary: pages integrate localStorage persistence so users can navigate tabs without resetting progress', () => {
  const briefingHtml = readPage('pages/briefing.html');
  assert.ok(briefingHtml.includes('foa_briefing_state_v1'), 'pages/briefing.html must persist state to foa_briefing_state_v1');
  assert.ok(briefingHtml.includes('saveBriefingState'), 'pages/briefing.html must have saveBriefingState');
  assert.ok(briefingHtml.includes('restoreBriefingState'), 'pages/briefing.html must have restoreBriefingState');

  const pvpHtml = readPage('pages/pvp.html');
  assert.ok(pvpHtml.includes('foa_pvp_state_v1'), 'pages/pvp.html must persist state to foa_pvp_state_v1');
  assert.ok(pvpHtml.includes('savePvpState'), 'pages/pvp.html must have savePvpState');
  assert.ok(pvpHtml.includes('restorePvpState'), 'pages/pvp.html must have restorePvpState');

  const rogueHtml = readPage('pages/rogue.html');
  assert.ok(rogueHtml.includes('foa_rogue_state_v1'), 'pages/rogue.html must persist state to foa_rogue_state_v1');
  assert.ok(rogueHtml.includes('saveRogueState'), 'pages/rogue.html must have saveRogueState');
  assert.ok(rogueHtml.includes('restoreRogueState'), 'pages/rogue.html must have restoreRogueState');

  const appJs = fs.readFileSync(path.join(ROOT_DIR, 'js/app.js'), 'utf8');
  assert.ok(appJs.includes('foa_horde_session_v1'), 'app.js must persist session to foa_horde_session_v1');
  assert.ok(appJs.includes('saveSessionState'), 'app.js must define saveSessionState');
  assert.ok(appJs.includes('restoreSessionState'), 'app.js must define restoreSessionState');
});

test('Documentation Boundary: breakdown bundle markdown files exist for each page and css/packages', () => {
  const bundlesDir = path.join(ROOT_DIR, 'bundles');
  assert.ok(fs.existsSync(bundlesDir), 'bundles/ directory must exist');

  const requiredBundles = [
    { file: 'bundle_index.md', check: 'index.html' },
    { file: 'bundle_briefing.md', check: 'pages/briefing.html' },
    { file: 'bundle_pvp.md', check: 'pages/pvp.html' },
    { file: 'bundle_rogue.md', check: 'pages/rogue.html' },
    { file: 'bundle_roster.md', check: 'pages/roster.html' },
    { file: 'bundle_css_packages.md', check: 'css/style.css' }
  ];

  for (const b of requiredBundles) {
    const bundlePath = path.join(bundlesDir, b.file);
    assert.ok(fs.existsSync(bundlePath), `${b.file} must exist in bundles/ directory`);
    const content = fs.readFileSync(bundlePath, 'utf8');
    assert.ok(content.length > 500, `${b.file} must not be empty`);
    assert.ok(content.includes(b.check), `${b.file} must contain its target file ${b.check}`);
    assert.equal(content.includes('\0'), false, `${b.file} must not contain null bytes`);
  }

  // Root bundle must also exist and be synchronized
  const rootBundlePath = path.join(ROOT_DIR, 'codebase_bundle.md');
  assert.ok(fs.existsSync(rootBundlePath), 'codebase_bundle.md must exist in root');
  const rootContent = fs.readFileSync(rootBundlePath, 'utf8');
  assert.equal(rootContent.includes('\0'), false, 'codebase_bundle.md must not contain null bytes');
});



````
