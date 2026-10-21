# 📦 Fires of Armageddon // Complete Codebase Bundle

All project files compiled into a single document for Gemini / NotebookLM ingestion.

## 📑 Table of Contents
- [package.json](#file-packagejson)
- [wrangler.jsonc](#file-wranglerjsonc)
- [.gitignore](#file-gitignore)
- [README.md](#file-readmemd)
- [AGENTS.md](#file-agentsmd)
- [index.html](#file-indexhtml)
- [briefing.html](#file-briefinghtml)
- [pvp.html](#file-pvphtml)
- [rogue.html](#file-roguehtml)
- [roster.html](#file-rosterhtml)
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
- [favicon.svg](#file-faviconsvg) *(Graphic Asset)*

---

## File: `package.json` <a id="file-packagejson"></a>

````json
{
  "name": "fires-of-armageddon",
  "version": "1.0.0",
  "description": "Warhammer 40,000 Horde Mode Suite // Spawner, PvP Wastes, Rogue AI Sector & Rosters",
  "scripts": {
    "test": "node --test \"tests/**/*.test.js\""
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

````text
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

- **⚔️ Mode 2: 1v1 Ash Wastes PvP (`pvp.html`)**  
  Competitive wasteland skirmish rules, hazardous environmental effects, dynamic primary and secondary objectives.

- **🎲 Mode 3: Rogue Sector & AI Tracker (`rogue.html`)**  
  Co-op and solo automated AI decision engine, behavioral priority trees, and target acquisition rules for non-player units.

- **🎖️ Rosters & Nemesis Ledger (`roster.html`)**  
  Enemy roster configurations across threat brackets, nemesis tracking, loadout customization, and local persistence.

- **📜 Briefings, Ship & Atlas (`briefing.html`)**  
  Interactive planetary atlas, narrative lore briefings, campaign progression logs, and orbital command support assets.

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
  <link rel="icon" type="image/svg+xml" href="favicon.svg">
  <link rel="apple-touch-icon" href="favicon.svg">
  <link rel="stylesheet" href="css/style.css">
</head>
<body>

  <!-- CAMPAIGN SUITE TOP NAVIGATION -->
  <nav class="suite-nav">
    <a href="index.html" class="suite-link active">🧟 Mode 1: Horde Command &amp; Spawner</a>
    <a href="pvp.html" class="suite-link">⚔️ Mode 2: 1v1 Ash Wastes PvP</a>
    <a href="rogue.html" class="suite-link">🎲 Mode 3: Rogue Sector &amp; AI Tracker</a>
    <a href="roster.html" class="suite-link">🎖️ Rosters &amp; Nemesis Ledger</a>
    <a href="briefing.html" class="suite-link">📜 Briefings, Ship &amp; Atlas</a>
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

## File: `briefing.html` <a id="file-briefinghtml"></a>

````html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fires of Armageddon // Briefings, Ship Slider &amp; Sector Atlas</title>
  <link rel="icon" type="image/svg+xml" href="favicon.svg">
  <link rel="apple-touch-icon" href="favicon.svg">
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
        radial-gradient(circle at 50% 0%, rgba(255, 71, 87, 0.14) 0%, transparent 55%),
        radial-gradient(circle at 90% 90%, rgba(245, 176, 65, 0.08) 0%, transparent 45%);
      background-attachment: fixed;
      color: var(--text);
      margin: 0; padding: 0; line-height: 1.6; min-height: 100vh;
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

    .container { max-width: 840px; margin: 0 auto; padding: 20px 16px 60px 16px; }

    .commander-switcher {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(175px, 1fr));
      background: var(--surface);
      padding: 6px;
      border-radius: 14px;
      border: 1px solid var(--border);
      margin-bottom: 22px;
      gap: 6px;
    }
    .commander-switcher button {
      background: transparent;
      color: var(--muted);
      border: 1px solid transparent;
      padding: 11px 8px;
      border-radius: 10px;
      font-size: 0.84rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.15s;
    }
    .commander-switcher button.active {
      background: linear-gradient(135deg, #241d30 0%, #181c29 100%);
      color: var(--gold);
      border-color: rgba(245, 176, 65, 0.35);
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
    }

    /* CLEARANCE GATE */
    .clearance-gate {
      background: linear-gradient(180deg, rgba(22, 26, 38, 0.96) 0%, rgba(12, 14, 20, 0.99) 100%);
      border: 1px solid rgba(255, 71, 87, 0.4);
      border-radius: 18px;
      padding: 36px 24px;
      text-align: center;
      margin-bottom: 22px;
      box-shadow: 0 16px 40px rgba(0,0,0,0.6);
    }
    .gate-btn {
      background: linear-gradient(135deg, #ff4757 0%, #b81929 100%);
      color: #fff;
      border: none;
      padding: 13px 26px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 0.95rem;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      cursor: pointer;
      margin-top: 12px;
    }

    .vox-header {
      background: linear-gradient(135deg, #1a1524 0%, #12151f 100%);
      border: 1px solid rgba(245, 176, 65, 0.35);
      border-radius: 18px; padding: 26px 24px; margin-bottom: 22px;
      box-shadow: 0 12px 32px rgba(0,0,0,0.5);
    }
    .vox-meta {
      font-family: monospace; font-size: 0.78rem; color: var(--gold);
      text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;
      border-bottom: 1px solid var(--border); padding-bottom: 10px;
      display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;
    }
    .vox-title {
      font-size: 1.75rem; font-weight: 800; text-transform: uppercase; margin: 0 0 12px 0;
      background: linear-gradient(135deg, #ffffff 0%, #ffd280 60%, #ff4757 100%);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }
    .vox-quote {
      background: rgba(8, 9, 13, 0.7); border-left: 4px solid var(--red);
      padding: 14px 18px; border-radius: 0 10px 10px 0;
      font-style: italic; color: #d8dee9; margin: 0; font-size: 0.94rem;
    }

    .section-card {
      background: var(--surface); border: 1px solid var(--border);
      border-radius: 16px; padding: 24px; margin-bottom: 20px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.35);
    }
    .section-tag {
      display: inline-block; font-size: 0.7rem; font-weight: 700;
      text-transform: uppercase; letter-spacing: 1px; padding: 3px 10px;
      border-radius: 6px; margin-bottom: 8px;
      background: rgba(157, 92, 255, 0.15); color: var(--purple);
    }
    .section-tag.gold { background: rgba(245, 176, 65, 0.15); color: var(--gold); }
    .section-tag.red { background: rgba(255, 71, 87, 0.15); color: var(--red); }
    .section-tag.blue { background: rgba(59, 130, 246, 0.15); color: var(--blue); }
    .section-tag.green { background: rgba(16, 185, 129, 0.15); color: var(--green); }

    h2 { font-size: 1.3rem; margin: 0 0 12px 0; color: #fff; }
    h3 { font-size: 1.05rem; margin: 18px 0 6px 0; color: var(--gold); }
    p { margin: 0 0 12px 0; color: #c9d1d9; font-size: 0.94rem; }
    ul { margin: 0 0 12px 0; padding-left: 20px; color: #c9d1d9; font-size: 0.93rem; }
    li { margin-bottom: 8px; }
    li strong { color: #fff; }

    .hero-box {
      background: var(--surface-alt); border: 1px solid var(--border);
      border-left: 4px solid var(--gold); border-radius: 10px;
      padding: 14px 16px; margin-bottom: 12px;
    }
    .hero-box.purple { border-left-color: var(--purple); }
    .hero-box.red { border-left-color: var(--red); }
    .hero-box.blue { border-left-color: var(--blue); }
    .hero-box.green { border-left-color: var(--green); }

    /* SHIP.MD INTERACTIVE SLIDER INSIDE ALPHA TAB */
    .slider-track {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 6px;
      margin: 14px 0;
    }
    .slider-node {
      background: var(--surface-alt);
      border: 1.5px solid var(--border);
      border-radius: 10px;
      padding: 10px 4px;
      cursor: pointer;
      text-align: center;
      transition: all 0.15s;
      color: var(--muted);
    }
    .slider-node:hover { border-color: #555; color: #fff; }
    .slider-node .val { font-size: 1.15rem; font-weight: 800; display: block; }
    .slider-node .lbl { font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.4px; }
    .slider-node.active-brig {
      background: rgba(255, 71, 87, 0.18); border-color: var(--red); color: #fff;
      box-shadow: 0 0 14px rgba(255, 71, 87, 0.3);
    }
    .slider-node.active-bal {
      background: rgba(59, 130, 246, 0.18); border-color: var(--blue); color: #fff;
      box-shadow: 0 0 14px rgba(59, 130, 246, 0.3);
    }
    .slider-node.active-sanctum {
      background: rgba(245, 176, 65, 0.18); border-color: var(--gold); color: #fff;
      box-shadow: 0 0 14px rgba(245, 176, 65, 0.3);
    }
    .sweet-spot-tag {
      display: inline-block; font-size: 0.6rem;
      background: rgba(16, 185, 129, 0.2); color: var(--green);
      padding: 1px 4px; border-radius: 4px; margin-top: 3px; font-weight: 700;
    }
    table.reckoning-table {
      width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 0.84rem;
    }
    table.reckoning-table th, table.reckoning-table td {
      border: 1px solid var(--border); padding: 9px 10px; text-align: left; vertical-align: top;
    }
    table.reckoning-table th {
      background: var(--surface-alt); color: var(--gold); text-transform: uppercase; font-size: 0.72rem;
    }
    tr.highlight-row { background: rgba(255, 71, 87, 0.14); }

    /* SECTOR ATLAS GRID */
    .sector-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(225px, 1fr));
      gap: 12px;
      margin-top: 14px;
    }
    .sector-node {
      background: var(--surface-alt);
      border: 1px solid var(--border);
      border-top: 3px solid var(--green);
      border-radius: 12px;
      padding: 14px;
    }
    .sector-node.fog {
      border-top-color: #4b5563;
      opacity: 0.82;
    }

    .alliance-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
      gap: 12px; margin: 16px 0;
    }
    .alliance-box {
      background: var(--surface-alt); border: 1px solid var(--border);
      border-top: 3px solid var(--gold); border-radius: 12px; padding: 16px;
    }
    .alliance-box.desecrator { border-top-color: var(--red); }
    .alliance-box.marauder { border-top-color: var(--purple); }
    .alliance-title { font-weight: 800; font-size: 1rem; color: #fff; margin-bottom: 6px; }

    .btn-row { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 20px; }
    .terminal-link-btn {
      flex: 1; display: block; text-align: center; text-decoration: none;
      background: linear-gradient(135deg, #ff4757 0%, #b81929 100%);
      color: #fff; font-weight: 700; padding: 15px; border-radius: 12px;
      text-transform: uppercase; letter-spacing: 1px;
    }
    .terminal-link-btn.alt {
      background: linear-gradient(135deg, #9d5cff 0%, #6b2cf5 100%);
    }
    .hidden { display: none !important; }
  </style>
</head>
<body>

  <nav class="suite-nav">
    <a href="index.html" class="suite-link">🧟 Mode 1: Horde Command &amp; Spawner</a>
    <a href="pvp.html" class="suite-link">⚔️ Mode 2: 1v1 Ash Wastes PvP</a>
    <a href="rogue.html" class="suite-link">🎲 Mode 3: Rogue Sector &amp; AI Tracker</a>
    <a href="roster.html" class="suite-link">🎖️ Rosters &amp; Nemesis Ledger</a>
    <a href="briefing.html" class="suite-link active">📜 Briefings, Ship &amp; Atlas</a>
  </nav>

<div class="container">

  <!-- 4-TAB NAVIGATION -->
  <div class="commander-switcher">
    <button id="btnAlpha" class="active" onclick="showDossier('alpha')">
      🦅 Alpha Briefing &amp; SHIP.md
    </button>
    <button id="btnBeta" onclick="showDossier('beta')">
      💀 Beta (JUNEBUG) Briefing
    </button>
    <button id="btnAtlas" onclick="showDossier('atlas')">
      🗺️ Sector Atlas &amp; Intercepts
    </button>
    <button id="btnRules" onclick="showDossier('rules')">
      ⚡ Horde → Crusade Rules
    </button>
  </div>

  <!-- ================================================================= -->
  <!-- TAB 1: COMMANDER ALPHA (PRIVATE BRIEFING + EMBEDDED SHIP.MD)      -->
  <!-- ================================================================= -->
  <div id="dossierAlpha">

    <!-- PRIVATE CLEARANCE GATE FOR ALPHA -->
    <div id="gateAlpha" class="clearance-gate">
      <span class="section-tag red">Clearance Vermilion-Alpha • Private Dossier</span>
      <h2>Commander Alpha Eyes Only</h2>
      <p style="max-width:480px; margin:0 auto;">This terminal contains the private shipboard control slider (<code>SHIP.md</code>), Lower-Deck Brig Warrants, and confidential directives for <strong>The Sanctuary of Ash</strong>.</p>
      <button class="gate-btn" onclick="unlockTab('Alpha')">🔓 Authenticate Commander Alpha</button>
    </div>

    <div id="contentAlpha" class="hidden">
      <div class="vox-header">
        <div class="vox-meta">
          <span>+++ COMMANDER ALPHA • THE SANCTUARY OF ASH • GATEBREAKERS (1 CPt) +++</span>
          <button onclick="lockTab('Alpha')" style="background:#262c40; color:#fff; border:none; padding:4px 10px; border-radius:6px; cursor:pointer; font-size:0.75rem;">🔒 Lock Screen</button>
        </div>
        <h1 class="vox-title">The Sanctuary of Ash</h1>
        <blockquote class="vox-quote">
          "Once, a Sororitas pilgrim vessel named <em>Divine Providence</em> was defiled when heretics slaughtered its crew and used it to bombard holy worlds. After its recapture, the Sororitas decreed it too tainted to exist—until a Krieg regiment, condemned for a 'failure' they did not commit, claimed it as their floating purgatory. Scrubbed with acid and the ash of their own cremated dead, the ship now hangs in low orbit above Armageddon. The Sororitas watch from the stripped High Sanctum through fire-blackened stained glass as your gunmetal siege columns drop into the ash wastes—sent to battles so hopeless, even death will feel like mercy."
        </blockquote>
      </div>

      <!-- EMBEDDED SHIP.MD: INTERACTIVE BALANCE SLIDER & RECKONING TABLE -->
      <div class="section-card" style="border-color:rgba(255, 71, 87, 0.4);">
        <span class="section-tag red">SHIP.md • Embedded Shipboard Control Manual</span>
        <h2>The Sanctuary of Ash Balance Slider (-3 ↔ 0 ↔ +3)</h2>
        <p>Your vessel is divided between the <strong>Lower Decks</strong> (your Kriegers, corpse-starch vats, and Commissar Dravik's bleeding brig walls) and the <strong>High Sanctum</strong> (the NPC Sororitas Wardens: <em>Saint Celestine, Aestred Thurga &amp; Agathae Dolan</em>—or Commander Beta if sharing the ship). <strong>-1 and +1 are the Golden Sweet Spots!</strong></p>

        <div class="slider-track">
          <div id="node-3" class="slider-node" onclick="selectSlider(-3)">
            <span class="val">-3</span>
            <span class="lbl">Brig Abyss</span>
          </div>
          <div id="node-2" class="slider-node" onclick="selectSlider(-2)">
            <span class="val">-2</span>
            <span class="lbl">Quicksand</span>
          </div>
          <div id="node-1" class="slider-node" onclick="selectSlider(-1)">
            <span class="val">-1</span>
            <span class="lbl">Lower Decks</span>
            <span class="sweet-spot-tag">Sweet Spot</span>
          </div>
          <div id="node0" class="slider-node active-bal" onclick="selectSlider(0)">
            <span class="val">0</span>
            <span class="lbl">Balanced</span>
          </div>
          <div id="node1" class="slider-node" onclick="selectSlider(1)">
            <span class="val">+1</span>
            <span class="lbl">High Sanctum</span>
            <span class="sweet-spot-tag">Sweet Spot</span>
          </div>
          <div id="node2" class="slider-node" onclick="selectSlider(2)">
            <span class="val">+2</span>
            <span class="lbl">Quicksand</span>
          </div>
          <div id="node3" class="slider-node" onclick="selectSlider(3)">
            <span class="val">+3</span>
            <span class="lbl">Tyranny</span>
          </div>
        </div>

        <div id="sliderDetailBox" class="hero-box blue" style="margin-top:14px;"></div>

        <details style="margin-top:16px; background:var(--surface-alt); padding:12px 16px; border-radius:10px; border:1px solid var(--border);">
          <summary style="cursor:pointer; font-weight:700; color:var(--gold); font-size:0.92rem;">
            🔥 View 7-Level Dynamic Phase Reckoning Table (When Alliance 3 Wins a Phase)
          </summary>
          <div style="margin-top:12px;">
            <p style="font-size:0.86rem;">If the Campaign Master's <strong>3rd Alliance (Horde AI)</strong> wins a Campaign Phase (or wipes out the strike force in a Phase Finale), the ship suffers a reckoning based on your current Slider Level (used as a severity baseline and dynamically tailored by the Campaign Master to that battle's events):</p>
            <table class="reckoning-table">
              <thead>
                <tr>
                  <th style="width:95px;">Slider</th>
                  <th style="width:165px;">Reckoning</th>
                  <th>Baseline Mechanical &amp; Narrative Punishment</th>
                </tr>
              </thead>
              <tbody>
                <tr id="reckRow-3">
                  <td><strong>-3 Abyss</strong></td>
                  <td><strong>"The Red Deck Purge &amp; Hull Breach"</strong></td>
                  <td><strong>1.</strong> Lose <strong>1 RP</strong> (or -100 pts Supply Limit). <strong>2.</strong> Both <strong>Dravik's Cull</strong> (1 random Krieg squad starts at Half-Strength) AND <strong>Saint Celestine's Purge Strike</strong> trigger in Battle 1 of next Phase! <strong>3.</strong> One Vehicle takes an automatic <strong>Battle Scar</strong> (<em>"Sabotaged by Mutineers"</em>).</td>
                </tr>
                <tr id="reckRow-2">
                  <td><strong>-2 Quicksand</strong></td>
                  <td><strong>"The Corpse-Vat Famine"</strong></td>
                  <td><strong>1.</strong> Start Battle 1 of next Phase with <strong>0 CP</strong>. <strong>2.</strong> All <strong>Battleline Infantry</strong> suffer <strong>-1 Leadership and -1 OC</strong> next battle. <strong>3.</strong> Slider is dragged <strong>1 step deeper into -3</strong> unless you sacrifice <strong>3 XP</strong> from a Character!</td>
                </tr>
                <tr id="reckRow-1">
                  <td><strong style="color:var(--green);">-1 Sweet Spot</strong></td>
                  <td><strong>"Dravik's Scapegoat Execution"</strong></td>
                  <td><strong>Zero RP or CP loss!</strong> Dravik executes a scapegoat junior officer: <strong>1 unit on your Order of Battle loses D3 XP</strong>, and the slider resets to 0.</td>
                </tr>
                <tr id="reckRow0" class="highlight-row">
                  <td><strong>0 Balanced</strong></td>
                  <td><strong>"Deadlocked Command Blame-Game"</strong></td>
                  <td>Both orbital support grids go offline: in Battle 1 of next Phase, your <strong>Hard Mode SP Cap drops from 8 SP/round to 6 SP/round</strong> (or -1 CP in 1v1), AND you cannot buy <code>Strike</code> Resupplies that battle!</td>
                </tr>
                <tr id="reckRow1">
                  <td><strong style="color:var(--green);">+1 Sweet Spot</strong></td>
                  <td><strong>"The Penitent Lash"</strong></td>
                  <td><strong>Zero RP or Battle Scar penalties!</strong> Aestred Thurga shields the ship in exchange for a vow of fasting: start Battle 1 of next Phase with <strong>-2 SP</strong> (first 2 SP earned pay off the tithe), and slider resets to 0.</td>
                </tr>
                <tr id="reckRow2">
                  <td><strong>+2 Quicksand</strong></td>
                  <td><strong>"The Flagellant's Crusade"</strong></td>
                  <td><strong>1.</strong> One Krieg Infantry squad is converted into <strong>Penitent Flagellants</strong> next battle (cannot perform Actions or Fall Back; must declare a Charge if able). <strong>2.</strong> Lose <strong>1 RP</strong> (or 1 unit takes a Battle Scar). <strong>3.</strong> Slider is dragged <strong>1 step deeper into +3 Tyranny</strong>!</td>
                </tr>
                <tr id="reckRow3">
                  <td><strong>+3 Tyranny</strong></td>
                  <td><strong>"Decimation of the Condemned"</strong></td>
                  <td><strong>1.</strong> <strong>The Exile</strong> <em>automatically</em> suffers a permanent <strong>Battle Scar</strong> (no save!). <strong>2.</strong> <strong>Every unit on your Order of Battle loses 1 XP</strong>. <strong>3.</strong> Cannot spend CP on Stratagems during Rounds 1 &amp; 2 of next battle!</td>
                </tr>
              </tbody>
            </table>
          </div>
        </details>
      </div>

      <!-- FACTION SPECIAL RULES -->
      <div class="section-card">
        <span class="section-tag gold">Section I • Active Faction &amp; Character Rules</span>
        <h2>Special Campaign Rules for <em>The Sanctuary of Ash</em></h2>

        <div class="hero-box">
          <strong>🎖️ The Exile's Curse — <em>"Mercy Delayed Again"</em> (Warlord Rule)</strong><br>
          Whenever <strong>The Exile</strong> (Rogal Dorn Commander in <em>"Mercy's Delay"</em>) survives a Horde Mode Round 6 Final Stand while <strong>3 or more friendly Krieg units are destroyed</strong> in that battle, he gains <strong>+1 bonus XP</strong>, and one destroyed Krieg Battleline unit that failed its <em>Out of Action</em> test may replace its Battle Scar with <strong>"Absolved in Ash"</strong> (granting <em>Feel No Pain 6+</em> while within 6" of <em>The Exile</em>).
        </div>

        <div class="hero-box purple">
          <strong>⚔️ Lord Marshal Dreir — <em>Inspirational Champion</em> (+1 Crusade Pt)</strong><br>
          • <strong>Unflinching Obedience:</strong> While leading a Bodyguard unit (<em>Death Riders</em>), ignore any and all Battle Scars on that Bodyguard unit.<br>
          • <strong>Double Greatness:</strong> At the end of every battle in which Dreir is part of your Crusade army, select <strong>one additional unit</strong> to be <em>Marked for Greatness (+3 XP)</em>!
        </div>

        <div class="hero-box red">
          <strong>💥 2x Leman Russ Vanquishers — Unofficial Trench-Whisper: <em>"The Shrine-Breakers"</em></strong><br>
          Speaking the nickname aloud on the upper decks is a flogging offense, yet the masked trench-infantry tap their shovel-blades twice in silent reverence whenever these two hulls rumble past. <strong>Session 0 Legacy Perk:</strong> The first time either of the <em>Shrine-Breakers</em> reaches the <strong>Blooded</strong> rank (6 XP), it may re-roll its <em>Weapon Modification</em> or <em>Battle Trait</em> roll for free!
        </div>

        <div class="hero-box blue">
          <strong>🦅 Faction Crusade Blessing: Faith and Duty (IMPERIUM ONLY)</strong><br>
          Whenever your army qualifies as the Underdog, at the start of the battle select one objective marker: while your non-Battle-shocked models are within range of it, add <strong>+1 to their Objective Control (OC)</strong> characteristic!
        </div>
      </div>

      <!-- GATEBREAKERS ROADMAP -->
      <div class="section-card">
        <span class="section-tag green">Section II • Gatebreakers 4-Phase Roadmap</span>
        <h2>Your Narrative Goals &amp; Phase Rewards</h2>
        <div class="hero-box">
          <strong>Phase 1: Stabilising the Front (+5 Strategic Points on Victory)</strong><br>
          • <em>Success (Resurgent Morale):</em> Advance to <em>Reclaim the Lost Hives</em> in Phase 2, and each <em>Increase Supply Limit</em> requisition grants <strong>+250 pts</strong> instead of +200 pts!<br>
          • <em>Failure (Grim Determination):</em> Fall back to <em>Strengthen the Imperator Line</em>, and automatically pass your first failed Battle-shock test each battle.
        </div>
        <div class="hero-box">
          <strong>Phase 2: Reclaim the Lost Hives OR Strengthen the Imperator Line (+5 SPts)</strong><br>
          • <em>Reclaim Goal:</em> End battle with 2+ units wholly in opponent's DZ → Unlocks <strong>Commanding Grasp</strong> (Round 2 Reserve deployment in enemy DZ) or <strong>Staged Withdrawal</strong> (<em>Scouts 6"</em>).<br>
          • <em>Imperator Line Goal:</em> End battle with no enemy units wholly in your DZ → Unlocks <strong>Impenetrable Wall</strong> (+1 extra XP on Marked for Greatness).
        </div>
        <div class="hero-box">
          <strong>Phase 3: Raze the Monoliths OR Light in the Dark (+5 SPts)</strong><br>
          • <em>Raze Goal:</em> Control 1+ objective in opponent's DZ → Unlocks <strong>Righteous Resolve</strong> (-1 to Wound vs your units with Warp counters).<br>
          • <em>Light Goal:</em> Destroy more points of enemy units than you lose → Unlocks <strong>Faith Rekindled</strong> (re-roll Hit/Wound rolls of 1 vs units with Warp counters).
        </div>
        <div class="hero-box red">
          <strong>Phase 4 Finale: Shatter the Red Angel's Gate (+5 SPts on Victory)</strong><br>
          • Gain bonus CP in Battle Round 1 equal to the Gatebreakers' accumulated Campaign Points!
        </div>
      </div>
    </div>
  </div>

  <!-- ================================================================= -->
  <!-- TAB 2: COMMANDER BETA (JUNEBUG'S PRIVATE BRIEFING)                -->
  <!-- ================================================================= -->
  <div id="dossierBeta" class="hidden">

    <div id="gateBeta" class="clearance-gate">
      <span class="section-tag purple">Clearance Vermilion-Beta • Private Dossier</span>
      <h2>Commander Beta (JUNEBUG) Eyes Only</h2>
      <p style="max-width:480px; margin:0 auto;">This terminal contains Commander Beta's private campaign briefing, Session 0 High Sanctum honours, and Alliance selection directives.</p>
      <button class="gate-btn" style="background:linear-gradient(135deg, #9d5cff 0%, #6b2cf5 100%);" onclick="unlockTab('Beta')">🔓 Authenticate Commander Beta</button>
    </div>

    <div id="contentBeta" class="hidden">
      <div class="vox-header">
        <div class="vox-meta">
          <span>+++ INCOMING TRANSMISSION // RECIPIENT: COMMANDER BETA (JUNEBUG) +++</span>
          <button onclick="lockTab('Beta')" style="background:#262c40; color:#fff; border:none; padding:4px 10px; border-radius:6px; cursor:pointer; font-size:0.75rem;">🔒 Lock Screen</button>
        </div>
        <h1 class="vox-title">The Fires of Armageddon</h1>
        <blockquote class="vox-quote">
          "Hail, Commander Beta. During the Session 0 trial in the equatorial forest clearing of <em>The Golgotha Arbor-Basin (Sector Node 0)</em>, your Adepta Sororitas Wardens pushed the Krieg Penitentiary Regiment to the brink—even as their Vanquisher cannons detonated every stained-glass war-engine on the field, Saint Celestine's descent into their rear echelon clinched a 3-point victory for the High Sanctum. Now Armageddon itself awaits your official Phase 1 Crusade banner."
        </blockquote>
      </div>

      <div class="section-card">
        <span class="section-tag red">Section I • Who I Am &amp; Your Session 0 Legacy</span>
        <h2>Your Campaign Master &amp; The 3rd Alliance Overlord</h2>
        <ul>
          <li><strong>1. Impartial Arbitrator &amp; Chronicler:</strong> While you track unit XP and Crusade cards on <strong>Administratum</strong>, I maintain the global 4-Phase Scoreboard, Strategic Points, and write custom lore chronicles (including custom names for every Battle Scar and Battle Honour!) for every match.</li>
          <li><strong>2. The 3rd Alliance Overlord (The Horde AI):</strong> Commander Alpha has pledged <em>The Sanctuary of Ash</em> to the <strong>🛡️ Gatebreakers</strong> (and will switch to <strong>⚔️ Marauders</strong> if you claim Gatebreakers). Whichever of the three Alliances remains unchosen becomes <strong>my enigmatic 3rd Alliance Warhost!</strong></li>
          <li><strong>3. Your Session 0 Legacy (<em>Saint Celestine &amp; Aestred Thurga</em>):</strong> If you play <strong>Adepta Sororitas</strong> for Phase 1 and agree to share <em>The Sanctuary of Ash</em>, you command the <strong>High Sanctum</strong> directly! If you register a different faction for Phase 1, Celestine and Thurga serve as the ship's NPC High Sanctum Wardens and roaming Inquisitorial Auditors!</li>
        </ul>
      </div>

      <div class="section-card">
        <span class="section-tag gold">Section II • Choose Your Banner</span>
        <h2>The Three Alliances of Armageddon</h2>
        <div class="alliance-grid">
          <div class="alliance-box">
            <div class="alliance-title">🛡️ Gatebreakers</div>
            <p style="font-size:0.85rem; margin:0;">Defenders seeking to stem the tide of Chaos, hold the Imperator Line, and shatter the Red Angel’s Gate.</p>
          </div>
          <div class="alliance-box desecrator">
            <div class="alliance-title">💀 Desecrators</div>
            <p style="font-size:0.85rem; margin:0;">Those who wish to turn Armageddon into a nightmare world of carnage and feed the gathering warp storm at the planet’s pole with worthy sacrifices.</p>
          </div>
          <div class="alliance-box marauder">
            <div class="alliance-title">⚔️ Marauders</div>
            <p style="font-size:0.85rem; margin:0;">Opportunistic warhosts, xenos raiders, and renegades who strike from hidden haunts to plunder Antiquity Relics, decapitate enemy warlords, and profit from endless war.</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- ================================================================= -->
  <!-- TAB 3: 8-NODE FOG-OF-WAR SECTOR ATLAS & INTERCEPTED TRANSMISSIONS -->
  <!-- ================================================================= -->
  <div id="dossierAtlas" class="hidden">
    <div class="vox-header">
      <div class="vox-meta">
        +++ SEGMENTUM SOLAR ASTROPATHIC DUCT &amp; SECTOR AUSPICATOR +++
      </div>
      <h1 class="vox-title">Armageddon Sector Atlas</h1>
      <blockquote class="vox-quote">
        "Commanders Alpha and Beta deploy from low-orbit vessels above Armageddon, while the 3rd Alliance erupts from unknown vectors—be they screaming Warp rifts, subterranean brood-tunnels, deep-crust fungal spores, or ancient vaults. The planet below is divided into 8 Strategic Sector Nodes (Nodes 0 through 7). At the dawn of Phase 1, only your planetfall site in the equatorial forest of Sector Node 0 is mapped—Nodes 1 through 7 remain shrouded in Ash-Storm Fog of War."
      </blockquote>
    </div>

    <!-- 8-NODE FOG OF WAR MAP (NODE 0 DISCOVERED + NODES 1-7 UNDISCOVERED) -->
    <div class="section-card">
      <span class="section-tag green">Dynamic Campaign Map • 1 of 8 Nodes Discovered</span>
      <h2>The 8 Strategic Sector Nodes of Armageddon (Nodes 0–7)</h2>

      <div class="hero-box green" style="margin-top:12px;">
        <strong>🌲 SECTOR NODE 0: The Golgotha Arbor-Basin — <em>"The Petrified Canopy &amp; Graveyard of Stained Glass"</em> [DISCOVERED]</strong><br>
        <span style="font-size:0.85rem; color:var(--gold);">Theme: Equatorial Forestry / Landing Site • Status: Contested (Session 0 Prologue Site)</span><br>
        <p style="margin:6px 0 6px 0; font-size:0.9rem;">A rare, fiercely contested oasis of towering, ash-choked equatorial jungle and petrified iron-wood trees in a dying world of dust—making its breathable air and timber-promethium invaluable. The central clearing is choked with shattered iron-wood trunks and the detonated stained-glass hulls of Sororitas Exorcists blown apart by <em>The Shrine-Breakers</em> in Session 0.</p>
        <p style="margin:0; font-size:0.88rem; color:#fff;"><strong>• Active Sector Rule (<em>"Canopy &amp; Wreckage"</em>):</strong> Forest terrain areas grant <strong>Stealth</strong> to Infantry wholly within them, and the central Landing Site objective grants <strong>Benefit of Cover</strong> from the burnt-out Sororitas war-machines. However, due to the lingering psychic echo of <strong>Saint Celestine's</strong> wrath in the rear treeline, any unit ending its turn within 3" of the center or Defender's home objective must pass a Leadership test or gain <strong>1 Warp Counter</strong>!</p>
      </div>

      <div class="sector-grid">
        <div class="sector-node fog">
          <span class="section-tag blue">Sector Node 1 • Unmapped</span>
          <h3 style="margin:4px 0;">[FOG OF WAR — ASH TELEMETRY]</h3>
          <p style="margin:0; font-size:0.85rem;">Adjacent to Node 0's forest perimeter. Long-range augurs detect heavy armored tracks and ancient ferrocrete signatures beneath the ash.</p>
        </div>
        <div class="sector-node fog">
          <span class="section-tag">Sector Node 2 • Unmapped</span>
          <h3 style="margin:4px 0;">[FOG OF WAR — SEISMIC ANOMALY]</h3>
          <p style="margin:0; font-size:0.85rem;">Sub-surface cavernous voids and collapsed cathedral spires detected via orbital sonar.</p>
        </div>
        <div class="sector-node fog">
          <span class="section-tag">Sector Node 3 • Unmapped</span>
          <h3 style="margin:4px 0;">[FOG OF WAR — EMPYRIC RADIATION]</h3>
          <p style="margin:0; font-size:0.85rem;">Unstable tectonic warp-faults and black monolith energy signatures buried in the dust.</p>
        </div>
        <div class="sector-node fog">
          <span class="section-tag">Sector Node 4 • Unmapped</span>
          <h3 style="margin:4px 0;">[FOG OF WAR — HYDRO-SIGNATURE]</h3>
          <p style="margin:0; font-size:0.85rem;">Boiling acid-river chasms and industrial bridge bottlenecks suspected.</p>
        </div>
        <div class="sector-node fog">
          <span class="section-tag">Sector Node 5 • Unmapped</span>
          <h3 style="margin:4px 0;">[FOG OF WAR — THERMAL SPIKE]</h3>
          <p style="margin:0; font-size:0.85rem;">Volatile promethium pipelines and vat-refinery silos detected.</p>
        </div>
        <div class="sector-node fog">
          <span class="section-tag">Sector Node 6 • Unmapped</span>
          <h3 style="margin:4px 0;">[FOG OF WAR — RAIL-CORRIDOR]</h3>
          <p style="margin:0; font-size:0.85rem;">Derelict mag-train arteries and subterranean orbital defense silos suspected.</p>
        </div>
        <div class="sector-node fog">
          <span class="section-tag">Sector Node 7 • Unmapped</span>
          <h3 style="margin:4px 0;">[FOG OF WAR — POLAR VORTEX]</h3>
          <p style="margin:0; font-size:0.85rem;">Extreme atmospheric distortion along the outer threshold of the Crimson Mesa.</p>
        </div>
      </div>
    </div>

    <!-- INTERCEPTED TRANSMISSIONS -->
    <div class="section-card">
      <span class="section-tag gold">War Room Dispatch • Active Transmissions</span>
      <h2>High Lords' Mandate &amp; 3rd Alliance Emergence Telemetry</h2>

      <div class="hero-box red">
        <strong>📡 TRANSMISSION 1: PALACE OF THE HIGH LORDS OF TERRA (Joint Expeditionary Mandate)</strong><br>
        <em>"Following the live-fire audit in the forest clearing of the Golgotha Arbor-Basin (Sector Node 0), The Sanctuary of Ash is granted conditional clearance to prosecute the war on Armageddon. Before Phase 1 concludes, your forces must push beyond the forest canopy of Sector Node 0, reconnoiter and secure at least one Undiscovered Sector Node (or extract a fortified outpost), and prevent the rising 3rd Alliance Warhost from claiming primacy over the region. Fail our quota, and Orbital Termination Protocols will be authorized without appeal."</em>
      </div>

      <div class="hero-box purple">
        <strong>📡 TRANSMISSION 2: ANOMALOUS 3RD ALLIANCE TELEMETRY (War Room Decision Required!)</strong><br>
        Deep-crust augurs and empyric sensors have begun screaming across the border between <strong>[Sector Node 0]</strong> and <strong>[Sector Node 1 — Unmapped]</strong>! Whether emerging from tearing Warp rifts, subterranean brood-burrows, or deep-ash fungal blooms, the <strong>3rd Alliance Warhost</strong> is converging on the region from an unknown locus! For <strong>Phase 1, Battle 1</strong>, Commanders Alpha and Beta must choose:<br>
        • <strong>Option A (Hold the Forest — Sector Node 0):</strong> Fight in the mapped forestry of <em>The Golgotha Arbor-Basin</em> to repel the 3rd Alliance vanguard erupting around your landing zone.<br>
        • <strong>Option B (Push into the Fog — Recon Sector Node 1):</strong> March blindly out of the forest perimeter into <em>Unmapped Sector Node 1</em> to discover what lies inside and secure it before the 3rd Alliance claims it!
      </div>
    </div>
  </div>

  <!-- ================================================================= -->
  <!-- TAB 4: HORDE MODE -> CRUSADE ROSTER PROGRESSION RULES             -->
  <!-- ================================================================= -->
  <div id="dossierRules" class="hidden">
    <div class="vox-header">
      <div class="vox-meta">
        +++ CAMPAIGN CODEX // HORDE MODE TO CRUSADE ROSTER SYNERGIES +++
      </div>
      <h1 class="vox-title">Spoils of Breach Containment</h1>
      <blockquote class="vox-quote">
        "Surviving the 6th Round Final Stand against the Horde is not merely a matter of Strategic Points. What you fortify, what you summon, and the covert directives you execute in the ash wastes permanently shape your Crusade Order of Battle."
      </blockquote>
    </div>

    <div class="section-card">
      <span class="section-tag gold">Rule 1 • Secret Objective "Victor Bonuses"</span>
      <h2>Completing Your Secret Objective Rewards Your Roster</h2>
      <p>When you complete your private <strong>Secret Objective</strong> in Horde Mode (and survive Battle Round 6 if required), in addition to scoring <strong>+5 Strategic Points</strong> for your Alliance, you claim <strong>BOTH</strong> the General Bonus and the Tag-Specific Reward matching your Secret Objective:</p>

      <div class="hero-box green">
        <strong>🎁 General "Spoils of Extraction" Bonus (All Completed Secrets):</strong><br>
        Gain <strong>+1 bonus Requisition Point (RP)</strong> <em>OR</em> increase your Crusade Force's <strong>Supply Limit by +100 pts</strong> for free!
      </div>

      <div class="hero-box red">
        <strong>🗡️ The Extra-Juicy "Traitor's Bounty" (Traitor Tag — High Risk, Massive Payout!)</strong><br>
        Completing a <code>Traitor</code> Secret Objective (<em>#6, #8, #15, #17, #23, #26, #28, #30, #31, #33</em>) shifts the Shipboard Slider <strong>-1 step toward the Lower Decks</strong> and awards a <strong>Double Payout</strong>:<br>
        1. <strong>Siphon Resources:</strong> Steal <strong>1 RP</strong> (or <strong>2 Strategic Points</strong>) from the other player, <strong>AND</strong> expand your Supply Limit by an extra <strong>+200 pts for free</strong>!<br>
        2. <strong>Forbidden Spoils:</strong> Immediately bestow a <strong>free Battle Honour</strong> (Battle Trait, Weapon Mod, or an <strong>Antiquity Crusade Relic</strong> ignoring rank restrictions!) onto any unit in your army, <strong>PLUS +3 bonus XP</strong> to the unit that executed the betrayal!<br>
        <em>The Grudge Consequence:</em> In your next 1v1 PvP match, the betrayed player automatically gains <strong>1 free Armageddon Crusade Blessing</strong> even if they are not the Underdog!
      </div>

      <div class="hero-box">
        <strong>⚡ Action / Relic Secrets</strong> (<em>#3, #5, #18, #20, #24, #25</em>):<br>
        The unit that completed the Action immediately earns a free <strong>Battle Trait</strong> or <strong>Weapon Modification</strong> (or a free <strong>Crusade Relic</strong> if it is a Character) without needing to rank up!
      </div>

      <div class="hero-box blue">
        <strong>⚔️ Kill / Combat Secrets</strong> (<em>#4, #11, #12, #27, #29, #34</em>):<br>
        Select <strong>one additional unit</strong> to be <strong>Marked for Greatness (+3 XP)</strong> at the end of the battle!
      </div>

      <div class="hero-box purple">
        <strong>🛡️ Support / Fortify / Extraction Secrets</strong> (<em>#1, #2, #7, #9, #10, #13, #14, #16, #19, #21, #22, #32</em>):<br>
        Claim a free <strong>Repair and Recuperate</strong> Requisition after the battle (heal 1 Battle Scar on any unit for 0 RP).
      </div>
    </div>

    <div class="section-card">
      <span class="section-tag blue">Rules 2–6 • Resupply, Salvage, Fortifications &amp; "Scars Are Stories"</span>
      <h2>Field Promotions, Salvaged SP, Outposts &amp; Narrative Scars</h2>

      <div class="hero-box">
        <strong>🎖️ Battlefield Promotions &amp; Recruiting Reinforcements:</strong><br>
        • <strong>"A Name Earned" (1 SP) Discount:</strong> If a Character buys <em>A Name Earned</em> during Horde Mode, survives Round 6, and slays a Horde Character/Monster/Vehicle (or completes an Action), reduce the RP cost of making that Enhancement permanent via <em>Renowned Heroes</em> by <strong>1 RP</strong> (min 1 RP).<br>
        • <strong>Recruiting Reinforcements:</strong> Any unit summoned via <em>Reinforcements Arrive (12 SP)</em> or upgraded via <em>Field Promotion (X SP)</em> that survives Round 6 can be permanently inducted into your Order of Battle (within Supply Limit) starting with <strong>3 XP</strong>!
      </div>

      <div class="hero-box green">
        <strong>📦 Evacuated Munitions (Leftover Supply Point Conversion):</strong><br>
        • <strong>3 Leftover SP:</strong> Bank a <strong>Supply Cache Token</strong> for your next 1v1 PvP game (one-time use of a 2–3 SP Resupply item like <em>Pizza Party</em> or <em>Deploy Razor Wire</em>).<br>
        • <strong>5 Leftover SP:</strong> Grant <strong>+2 XP</strong> to any surviving unit.<br>
        • <strong>8 Leftover SP:</strong> Gain <strong>+1 RP</strong> or <strong>+100 pts Supply Limit</strong>.
      </div>

      <div class="hero-box purple">
        <strong>🏰 Persistent Fortifications (Held at Round 6 End &amp; Etched onto the Sector Map):</strong><br>
        • <strong>Field Hospital / MASH (4 SP):</strong> All destroyed units from your army automatically pass their <em>Out of Action</em> tests after this battle!<br>
        • <strong>Ammo Dump (5 SP):</strong> One unit within range at game end gains a free <strong>Weapon Modification</strong> (or +2 XP).<br>
        • <strong>War Trench / Shovel Stash (4 SP):</strong> Each surviving Infantry/Battleline unit that fought in the trench gains <strong>+1 bonus XP</strong>.<br>
        • <strong>Forward Operating Base (3 SP):</strong> Gain <strong>+1 bonus Strategic Point</strong> for your Alliance.
      </div>

      <div class="hero-box red">
        <strong>🩸 "Scars Are Stories" &amp; Armageddon Warp Bridge:</strong><br>
        • <strong>Scars Are Stories:</strong> Whenever a unit earns a Battle Scar or Battle Honour on Administratum, report how it happened to the Campaign Master in chat to receive a custom lore title and backstory in your Dossier!<br>
        • <strong>Warp Counter Bridge:</strong> Ending a turn in a Horde Spawn Zone, spawning on a 10+, or standing within 6" of a <em>Warp-Relic Outpost (4 SP)</em> grants a <strong>Warp Counter</strong>. Rolling natural doubles on a 2D6 Horde Spawn Roll triggers a <strong>3D6 Armageddon Anomaly roll</strong>!
      </div>
    </div>
  </div>

  <div class="btn-row">
    <a href="roster.html" class="terminal-link-btn alt">
      🎖️ View Dramatis Personae &amp; Nemesis Ledger →
    </a>
    <a href="index.html" class="terminal-link-btn">
      ⚔️ Open Tactical Command Terminal →
    </a>
  </div>

</div>

<script>
const SLIDER_LEVELS = {
  "-3": {
    cls: "active-brig",
    boxCls: "hero-box red",
    title: "🔻 -3: TOTAL BRIG MUTINY & THE RED LOCKDOWN (Lower Decks Abyss)",
    body: `
      <strong>• Mutinous Vault Burn:</strong> Even if you win the Phase, mutinous lower-deck crews burn the Phase-End Shipboard Cache (<strong>0 RP</strong>!).<br>
      <strong>• Dravik's Mandatory Cull &amp; #35 Experimental Ammunition:</strong> At the start of every battle fought at -3, <strong>1 random Krieg Infantry unit starts at Half-Strength and Battle-shocked</strong> for Round 1, AND your army starts Horde Mode under Misery #35 <em>Experimental Ammunition</em> (+1 S, +1 AP, and <strong>[HAZARDOUS]</strong> on all ranged weapons)!<br>
      <strong>• High Sanctum Purge Strike:</strong> <strong>Saint Celestine &amp; Aestred Thurga</strong> automatically deploy onto the board against you as hostile <strong>Power Level 3 Bosses</strong> hunting <em>The Exile</em>!<br>
      <strong>• How to Escape -3 (back to -1):</strong> You MUST either personally slay the hostile Celestine/Thurga manifestation on the tabletop, OR allow <em>The Exile ("Mercy's Delay")</em> to be destroyed and voluntarily fail his Out of Action test (taking a permanent Battle Scar as blood-penance)!
    `
  },
  "-2": {
    cls: "active-brig",
    boxCls: "hero-box red",
    title: "🔻 -2: THE BRIG DEMANDS BLOOD (Lower Decks Quicksand Zone)",
    body: `
      <strong>• Battlefield Buffs:</strong> Krieg Infantry gain <strong>+1 to Hit in melee</strong> (below Starting Strength), AND your Vehicles gain <strong>Feel No Pain 6+ against Mortal Wounds</strong>.<br>
      <strong>• High Sanctum Cutoff:</strong> The Sororitas seal the upper reliquaries! You are <strong>locked out of all Fortify Resupply purchases</strong> (except <em>Emergency Shovel Stash / War Trench</em>), AND all ranged weapons on your <strong>Vehicles gain [HAZARDOUS]</strong> when firing at targets within 18"!<br>
      <strong>• How to Escape -2 (back to -1):</strong> Normal High Sanctum Mandates are suspended! <strong>Dravik or The Unseen Jury must personally slay an enemy Character/Boss</strong>, OR you must sacrifice a friendly unit on the center objective!
    `
  },
  "-1": {
    cls: "active-brig",
    boxCls: "hero-box green",
    title: "🟢 -1: LOWER DECKS FAVORED (The Brig Sweet Spot!)",
    body: `
      <strong>• Battlefield Buff:</strong> Siphoning reactor power to the corpse-starch vats and siege magazines grants all Krieg Infantry <strong>+1 to Hit in melee</strong> when below Starting Strength (zero quicksand penalties!).<br>
      <strong>• Phase-End Vault Unlocked:</strong> Winning/surviving the Phase at -1 unlocks the <strong>Phase-End Shipboard Cache (+1 bonus RP or +100 pts Supply Limit)</strong>, and shields you from heavy punishments if Alliance 3 wins the Phase!
    `
  },
  "0": {
    cls: "active-bal",
    boxCls: "hero-box blue",
    title: "⚖️ 0: BALANCED EQUILIBRIUM (Synchronized Broadsides)",
    body: `
      <strong>• Battlefield Buff:</strong> The ship's batteries fire in harmony—granting you <strong>+1 starting Supply Point (SP)</strong> in Horde Mode (or <strong>1 free Anomaly/Spawn Roll re-roll</strong> in 1v1).<br>
      <strong>• Phase-End Vault Lock:</strong> Ending a Phase at 0 means neither deck controls the supply vaults—you <strong>forfeit the +1 RP Phase-End Shipboard Cache</strong> (and suffer the Deadlocked Command SP cap throttle if Alliance 3 wins the Phase) unless you tilt the slider to <strong>-1</strong> or <strong>+1</strong> before the Phase ends!
    `
  },
  "1": {
    cls: "active-sanctum",
    boxCls: "hero-box green",
    title: "🟢 +1: HIGH SANCTUM FAVORED (The Sanctum Sweet Spot!)",
    body: `
      <strong>• Battlefield Buff:</strong> Appeasing the Sororitas Wardens grants <strong>The Exile's</strong> unit <strong>re-roll 1s to Hit</strong> and reduces the SP cost of your first <strong>Strike</strong> or <strong>Fortify</strong> Resupply purchase each game by <strong>1 SP</strong> (zero quicksand penalties!).<br>
      <strong>• Phase-End Vault Unlocked:</strong> Winning/surviving the Phase at +1 unlocks the <strong>Phase-End Shipboard Cache (+1 bonus RP or +100 pts Supply Limit)</strong>, and Aestred Thurga shields your roster if Alliance 3 wins the Phase!
    `
  },
  "2": {
    cls: "active-sanctum",
    boxCls: "hero-box",
    title: "🔺 +2: STRICT ATONEMENT — 'No Retreat for the Condemned' (Quicksand Zone)",
    body: `
      <strong>• Battlefield Buff:</strong> Keep the +1 buffs (<em>The Exile</em> re-rolls 1s to Hit; -1 SP on first <em>Strike/Fortify</em>).<br>
      <strong>• Traitor Blockade &amp; No Retreat:</strong> You are <strong>completely locked out of Traitor Secret Objectives</strong> (making it very hard to shift back toward the Lower Decks!). Furthermore, your units <strong>cannot use Emergency Evac (5 SP)</strong>, and whenever any of your units <strong>Fall Back</strong>, they suffer <strong>D3 Mortal Wounds</strong> from orbital punishment volleys!
    `
  },
  "3": {
    cls: "active-sanctum",
    boxCls: "hero-box red",
    title: "🔺 +3: TOTAL HIGH SANCTUM TYRANNY — 'The Martyr's Tithe'",
    body: `
      <strong>• Battlefield Buff:</strong> Keep the +1/+2 buffs, plus gain <strong>1 free Miracle Die (valued at a 5)</strong> once per battle for <em>The Exile</em>.<br>
      <strong>• Confiscated Glory &amp; The Exile's Penance:</strong> The Sororitas <strong>confiscate your +1 RP Phase-End Cache</strong>! At the end of every battle fought at +3, <strong>The Exile</strong> must pass a Leadership test (at -1) or suffer <strong>1 automatic Battle Scar</strong> (<em>"Scorched by Purity Seals"</em>) for surviving instead of dying as a martyr!<br>
      <strong>• How to Escape +3 (back to +1):</strong> Since Traitor Secrets are blocked, you MUST deliberately defy the High Sanctum mid-battle by destroying a Fortified Objective with <em>Scuttle the Objective / Air Strike</em> OR letting Dravik execute a unit holding a sanctified objective!
    `
  }
};

function selectSlider(val) {
  [-3, -2, -1, 0, 1, 2, 3].forEach(n => {
    const el = document.getElementById('node' + n);
    el.className = 'slider-node';
    const row = document.getElementById('reckRow' + n);
    if (row) row.classList.toggle('highlight-row', n === val);
  });
  const cfg = SLIDER_LEVELS[String(val)];
  document.getElementById('node' + val).classList.add(cfg.cls);
  const box = document.getElementById('sliderDetailBox');
  box.className = cfg.boxCls;
  box.innerHTML = `<h3 style="margin:0 0 6px 0;">${cfg.title}</h3><div style="font-size:0.88rem; line-height:1.5;">${cfg.body}</div>`;
}

function showDossier(which) {
  ['alpha', 'beta', 'atlas', 'rules'].forEach(k => {
    const cap = k.charAt(0).toUpperCase() + k.slice(1);
    document.getElementById('dossier' + cap).classList.toggle('hidden', which !== k);
    document.getElementById('btn' + cap).classList.toggle('active', which === k);
  });
}

function unlockTab(who) {
  document.getElementById('gate' + who).classList.add('hidden');
  document.getElementById('content' + who).classList.remove('hidden');
}

function lockTab(who) {
  document.getElementById('content' + who).classList.add('hidden');
  document.getElementById('gate' + who).classList.remove('hidden');
}

selectSlider(0);
</script>

</body>
</html>
````

---

## File: `pvp.html` <a id="file-pvphtml"></a>

````html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fires of Armageddon // 1v1 Ash Wastes PvP</title>
  <link rel="icon" type="image/svg+xml" href="favicon.svg">
  <link rel="apple-touch-icon" href="favicon.svg">
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
    <a href="index.html" class="suite-link">🧟 Mode 1: Horde Command &amp; Spawner</a>
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
        <select id="warpIntensity">
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

function renderHellscape() {
  const idx = parseInt(document.getElementById('hellscapeSelect').value, 10);
  document.getElementById('hellscapeDesc').innerHTML = HELLSCAPES[idx];
}

function rollRandomHellscape() {
  const idx = Math.floor(Math.random() * HELLSCAPES.length);
  document.getElementById('hellscapeSelect').value = idx;
  renderHellscape();
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
}

function updateVulture() {
  const extra = document.getElementById('vultureKillCheck').checked ? 1 : 0;
  document.getElementById('vulturePts').innerText = `${3 + extra} SPts`;
}

function rollUnboundAdversary() {
  const pick = UNBOUND_UNITS[Math.floor(Math.random() * UNBOUND_UNITS.length)];
  document.getElementById('unboundResult').innerHTML = `<p style="margin:0;">${pick}</p>`;
}

renderHellscape();
</script>
</body>
</html>
````

---

## File: `rogue.html` <a id="file-roguehtml"></a>

````html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fires of Armageddon // Rogue Sector &amp; AI Tracker</title>
  <link rel="icon" type="image/svg+xml" href="favicon.svg">
  <link rel="apple-touch-icon" href="favicon.svg">
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
    <a href="index.html" class="suite-link">🧟 Mode 1: Horde Command &amp; Spawner</a>
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
let currentAiStep = 0;
function nextAiStep() {
  currentAiStep = (currentAiStep + 1) % 3;
  [0, 1, 2].forEach(i => {
    const el = document.getElementById('aiStep' + i);
    el.classList.toggle('active-step', i === currentAiStep);
    el.querySelector('.ai-step-title span:last-child').innerText = (i === currentAiStep) ? '[Active]' : '';
  });
}
</script>
</body>
</html>
````

---

## File: `roster.html` <a id="file-rosterhtml"></a>

````html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fires of Armageddon // Rosters &amp; Nemesis Ledger</title>
  <link rel="icon" type="image/svg+xml" href="favicon.svg">
  <link rel="apple-touch-icon" href="favicon.svg">
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
    <a href="index.html" class="suite-link">🧟 Mode 1: Horde Command &amp; Spawner</a>
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

// Populate Spawner Faction Dropdown on load
if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
  window.addEventListener('DOMContentLoaded', () => {
    const sel = document.getElementById('hordeFactionSelect');
    if (sel && typeof HORDE_FACTIONS !== 'undefined') {
      sel.innerHTML = HORDE_FACTIONS.map(f => `<option value="${f.name}">${f.name} (${f.ruleTitle})</option>`).join('');
    }
  });
}

function selectMode(mode) {
  selectedModeVal = mode;
  document.getElementById('modeCardCoop').classList.toggle('selected-red', mode === 'coop');
  document.getElementById('modeCardSolo').classList.toggle('selected-red', mode === 'solo');
  document.getElementById('playerRoleSection').classList.toggle('hidden', mode === 'solo');
}

function selectRole(role) {
  selectedRoleVal = role;
  document.getElementById('roleCard1').classList.toggle('selected', role === '1');
  document.getElementById('roleCard2').classList.toggle('selected', role === '2');
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
}

function manualChangeFaction() {
  const val = document.getElementById('hordeFactionSelect').value;
  activeHordeFaction = HORDE_FACTIONS.find(f => f.name === val) || HORDE_FACTIONS[0];
  renderFactionReminderBanner();
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
    buyResupply,
    leaveSession
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

globalThis.document = {
  getElementById: (id) => getOrCreateElement(id)
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
  assert.ok(html.includes('href="briefing.html" class="suite-link">📜 Briefings, Ship &amp; Atlas</a>'));
  assert.ok(html.includes('href="pvp.html"'));
  assert.ok(html.includes('href="rogue.html"'));
  assert.ok(html.includes('href="roster.html"'));

  // Stylesheet
  assert.ok(html.includes('<link rel="stylesheet" href="css/style.css">'));

  // Modular script architecture
  assert.ok(html.includes('<script src="js/data.js"></script>'));
  assert.ok(html.includes('<script src="js/rng.js"></script>'));
  assert.ok(html.includes('<script src="js/spawner.js"></script>'));
  assert.ok(html.includes('<script src="js/app.js"></script>'));
});

test('UI Boundary: all pages share unified navigation title for Briefings, Ship & Atlas', () => {
  const pages = ['pvp.html', 'rogue.html', 'roster.html', 'briefing.html'];
  const expectedSnippet = 'href="briefing.html" class="suite-link';

  for (const page of pages) {
    const html = readPage(page);
    assert.ok(html.includes(expectedSnippet), `${page} missing standard briefing suite-link`);
    assert.ok(
      html.includes('Briefings, Ship &amp; Atlas') || html.includes('Briefings, Ship & Atlas'),
      `${page} navigation text must match Briefings, Ship & Atlas`
    );
  }
});

test('All HTML pages link to favicon.svg and apple-touch-icon', () => {
  const faviconPath = path.join(__dirname, '../../favicon.svg');
  assert.ok(fs.existsSync(faviconPath), 'favicon.svg must exist in repository root');

  const pages = ['index.html', 'briefing.html', 'pvp.html', 'rogue.html', 'roster.html'];
  for (const page of pages) {
    const html = fs.readFileSync(path.join(__dirname, '../../', page), 'utf8');
    assert.match(
      html,
      /<link\s+rel="icon"\s+type="image\/svg\+xml"\s+href="favicon\.svg"\s*\/?>/i,
      `${page} must include <link rel="icon" type="image/svg+xml" href="favicon.svg">`
    );
    assert.match(
      html,
      /<link\s+rel="apple-touch-icon"\s+href="favicon\.svg"\s*\/?>/i,
      `${page} must include <link rel="apple-touch-icon" href="favicon.svg">`
    );
  }
});
````

---

## File: `favicon.svg` <a id="file-faviconsvg"></a>

> **Asset Notice**: `favicon.svg` is a 1.29 MB raster image asset (Warhammer 40k vox skull icon). Raw binary data is excluded from text code fences to prevent null-byte corruption in Gemini Notebook / NotebookLM ingestion.

---

