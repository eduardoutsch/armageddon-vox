# 📦 Fires of Armageddon // Bundle: Packages, Configuration & Documentation

NPM package manifests, Cloudflare Pages deployment configs, repository documentation, and engineering directives.

## 📑 Table of Contents
- [package.json](#file-packagejson)
- [wrangler.jsonc](#file-wranglerjsonc)
- [README.md](#file-readmemd)
- [AGENTS.md](#file-agentsmd)
- [.gitignore](#file-gitignore)
- [.env.example](#file-envexample)
- [vox_autopilot.bat](#file-voxautopilotbat)

---

## File: `package.json` <a id="file-packagejson"></a>

````json
{
  "name": "fires-of-armageddon",
  "version": "1.0.0",
  "description": "Warhammer 40,000 Horde Mode Suite // Spawner, PvP Wastes, Rogue AI Sector & Rosters",
  "scripts": {
    "test": "node --test \"tests/**/*.test.js\"",
    "bundle": "node scripts/generate_bundles.js",
    "vox:bridge": "node vox_bridge.js"
  },
  "keywords": [
    "warhammer-40k",
    "horde-mode",
    "tabletop-companion"
  ],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "dotenv": "^18.0.8",
    "playwright": "^1.64.1"
  }
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

## File: `README.md` <a id="file-readmemd"></a>

````markdown
# Fires of Armageddon // Warhammer 40,000 Horde & Asymmetric Crusade Suite

A zero-dependency, offline-tolerant web companion suite, deterministic wave spawner, and real-time AI-bridged Astropathic Vox relay designed for cooperative, solo, and asymmetric Warhammer 40,000 Crusade campaigns.

---

## 🗺️ System Architecture

The project is engineered as a **three-tier hybrid architecture** combining a static client-side tactical suite (hosted on Cloudflare Pages), a serverless PostgreSQL/RPC state & message relay layer (Supabase), and a local dual-thread Playwright automation courier (`vox_bridge.js`) that bridges live Google Gemini web sessions into an in-universe Campaign Master.

```mermaid
flowchart LR
  subgraph Client["Client Tier // Static Web Suite (Cloudflare Pages)"]
    UI["Humble View UI Pages\n(index.html, pages/*.html)"]
    Core["Functional Core Engine\n(js/data.js, js/rng.js, js/spawner.js)"]
    Audio["Procedural Web Audio & Router\n(js/vox-audio.js)"]
    UI --> Core
    UI --> Audio
  end

  subgraph Cloud["Cloud Tier // Supabase PostgreSQL + RLS"]
    RPC_Vox["Astropathic Vox RPCs\n(submit_vox_message, get_vox_logs)"]
    RPC_Pools["Shared State & Telemetry RPCs\n(save/get_shared_spawn_pools)"]
  end

  subgraph Courier["Courier Tier // Local Node.js + Playwright Bridge"]
    Bridge["vox_bridge.js\nDual-Thread Queue Poller & Heartbeat"]
    TabAlpha["Chromium Tab 1 // Commander Alpha\n(The Exile // Pattern 4A Ashen Spirit)"]
    TabBeta["Chromium Tab 2 // Commander Beta\n(Lord Commander Junebug // Pattern 4B)"]
    Bridge --> TabAlpha
    Bridge --> TabBeta
  end

  UI <-->|"Publishable Anon Key (HTTPS REST)"| RPC_Vox
  UI <-->|"Cloud Pool Sync & Heartbeat Check"| RPC_Pools
  Bridge <-->|"Service Role Key (3.5s Poll + 30s Heartbeat)"| RPC_Vox
  Bridge <-->|"vox_server_heartbeat ('online'/'offline')"| RPC_Pools
```

---

## 🤖 AI Involvement & Human-AI Collaboration

This project integrates Artificial Intelligence across **two distinct layers**: as a **live runtime component** during tabletop campaign sessions, and as an **agentic pair-programming partner** during software engineering.

### 1. Runtime AI Involvement (Live Campaign Master & Asymmetric Narrative Engine)
During live campaign play, AI acts as the autonomous **Campaign Master**, **3rd Alliance ("The Marauders") Scavenger Commander**, and **Flagship Logic Core**:
- **Dual-Thread Google Gemini Automation (`vox_bridge.js`)**: Rather than calling stateless completion APIs, `vox_bridge.js` uses Playwright with a persistent Chromium profile (`./vox_chrome_profile`) to drive two long-running, context-rich Google Gemini notebook/chat threads—one isolated to **Commander Alpha (`THE EXILE // SANCTUARY OF ASH`)** and one isolated to **Commander Beta (`LORD COMMANDER JUNEBUG`)**.
- **Dynamic Prompt Routing & Pattern Injection**: When a player transmits a report from any page (`crusade.html`, `pvp.html`, `rogue.html`, `roster.html`, or `vox.html`), `vox_bridge.js` inspects the teletype header and wraps it in specialized system directives:
  - **Pattern 4A / 4B Ship Queries (`isShipQuery`)**: Routes `[TO: SHIP]` queries to either the *Pattern 4A Ashen Spirit cogitator readout* (`alpha` channel) or the *Pattern 4B Flagship Bridge Logic Core readout* (`beta` channel), preventing cross-flagship lore contamination.
  - **Pattern 5 Psychic Intercept Bleed**: Instructs the AI to append a `+++ [PASSIVE ASTROPATHIC CHOIR INTERCEPT] +++` block at the end of its response. `vox_bridge.js` programmatically splits this block out of the direct reply, scrubs citation artifacts, and injects it into the **rival commander's** `[ 👁️ INTERFERENCES ]` monitor (or broadcasts to **both** channels simultaneously for Mode 3 Rogue Sector clashes).
- **NotebookLM & Gemini Context Ingestion (`/bundles/`)**: The build script [`scripts/generate_bundles.js`](scripts/generate_bundles.js) compiles the entire repository into 12 domain-scoped Markdown bundles in [`/bundles/`](bundles/README.md) so the AI Campaign Master notebooks remain synchronized with live game rules, threat brackets, and Nemesis rosters.

### 2. Development-Time AI Involvement (Human-Directed Agentic Engineering)
- **Human Direction, Game Design & Architecture**: The tabletop game mechanics, asymmetric 3-Way Alliance Hegemony race, Tour of Duty progression, Warhammer 40k Crusade adaptations, UI/UX layout, and architectural constraints were designed and directed by the project creator.
- **Agentic Pair Programming (Google Antigravity)**: Code implementation, refactoring, procedural Web Audio synthesis, SVG sector cartography, Playwright DOM-stream stabilization, and the automated test suite were co-developed with **Google Antigravity** (utilizing Claude and Gemini coding models) under the strict engineering constitution codified in [`AGENTS.md`](AGENTS.md):
  - **100% Test-Driven Development (TDD)**: Every feature, bug fix, and UI boundary is backed by automated Node.js unit and headless Playwright browser tests (`171` passing tests across `tests/js/`, `tests/ui/`, and `tests/vox_bridge.test.js`) written via Red-Green-Refactor cycles.
  - **Continuous Bundle Synchronization**: Autonomous agents are strictly bound by `AGENTS.md` Principle IX to regenerate and verify `/bundles/*.md` on every file modification.

---

## 🏛️ Clean Code Architecture & "Dumb UI" (Humble View) Pattern

Per [`AGENTS.md`](AGENTS.md), the codebase enforces strict modularization and the **Functional Core, Imperative Shell** ("Dumb UI" / Humble View) pattern:

1. **Functional Core (Pure Domain Logic)**:
   - All game rules, Strategic Point calculations, PRNG algorithms, heartbeat staleness evaluators, and teletype dossier compilers (`compileRogueDossier`, `compilePvpVultureReport`, `compileNemesisDossier`, `isVoxServerOnline`, `mulberry32`, `resolveThreatBracket`, `executeRoundSpawns`) are written as pure, deterministic functions `(state, input) => output` with zero dependency on `document`, `window`, `localStorage`, or `fetch`.
2. **Declarative Rule Lookup Tables**:
   - Game outcomes (`ROGUE_OUTCOME_IMPACTS`), faction spawn brackets (`HORDE_FACTION_SPAWN_TABLES`), room-code prefixes (`ROOM_CODE_PREFIXES`), and environmental tables (`HELLSCAPES`, `ANOMALIES`) are modeled as declarative data maps rather than deeply nested `if / else` branching chains.
3. **Humble View ("Dumb UI") Imperative Shell**:
   - DOM interaction is isolated to thin input readers (`readRogueFormInputs`, `readPvpVultureFormInputs`, `readNemesisFormInputs`) and idempotent UI renderers (`renderServerStatusIndicator`, `updateRogueDossierPreview`, `renderFactionBracketTable`) that project explicit state onto the DOM and forward user events back to the pure core.

---

## 🔬 Technical Deep-Dive by Subsystem

### 1. Deterministic PRNG & Seeded Horde Spawner (`js/rng.js`, `js/spawner.js`, `js/data.js`)
- **Cross-Tabletop Seed Synchronization**: Co-op players enter a shared room seed (generated from 60 thematic Warhammer 40k prefixes such as `GOLGOTHA-4821` or `ASHEN-9012`). [`hashSeed()`](js/rng.js) hashes the string via a 32-bit avalanche mixer to seed [`mulberry32()`](js/rng.js), ensuring two separate tablets roll identical enemy spawns, misery cards, and resupply drops without requiring a live WebSocket connection during tabletop play.
- **Wave Escalation & Pity-Timer Math**: [`spawner.js`](js/spawner.js) computes per-round 2D6 modifiers based on Battle Round ($R_1 \dots R_5$), player count, and difficulty mode, resolving rolls against 5 threat brackets (`b34`, `b56`, `b79`, `b10`, `b13`) while dynamically scaling Resupply Pod drop probabilities via a cumulative pity counter.

### 2. Procedural Web Audio Synthesizer & Seamless Router (`js/vox-audio.js`)
- **Zero-Asset Web Audio API Synthesis**: Instead of loading external `.mp3` or `.wav` files, `VoxAudio` synthesizes all tactile UI feedback in real time using native `AudioContext` oscillator, gain, noise-buffer, and biquad-filter graphs:
  - Mechanical cogitator key-clanks (`playClank`), CRT teletype bursts, Warp anomaly sirens (`playWarpSurge`), orbital auspex pings (`playAuspexPing`), and a continuous sub-bass shipboard ambient drone.
- **Seamless SPA-Style Page Router**: To prevent the browser from destroying the active `AudioContext` ambient drone when navigating between `.html` pages, `vox-audio.js` intercepts internal navigation clicks, fetches the target HTML document in the background, swaps the `.shell` / `<main>` DOM tree, and safely re-evaluates page scripts in a clean lifecycle.

### 3. Supabase RPC Backend, Cloud Pool Sync & Live Server Telemetry
- **RLS & `SECURITY DEFINER` Isolation**: The browser client uses a publishable anon key restricted solely to vetted PostgreSQL RPC endpoints (`submit_vox_message`, `get_vox_logs`, `delete_vox_entry`, `save_shared_spawn_pools`, `get_shared_spawn_pools`). Direct table mutations require the `SUPABASE_SERVICE_KEY` held exclusively by the local `vox_bridge.js` courier.
- **Cross-Device Custom Shelf Barracks (`pages/roster.html`, `pages/spawner.html`)**: Players customize per-faction miniature pools in `roster.html` and sync them to Supabase via `save_shared_spawn_pools`. The Mode 1 Spawner automatically pulls and merges these custom pools into `HORDE_FACTION_SPAWN_TABLES`.
- **Live Courier Server Heartbeat (`vox_server_heartbeat`)**: `vox_bridge.js` publishes `{ status: 'online', updated_at }` to the shared state row on startup and every 30 seconds (and `{ status: 'offline' }` on `SIGINT`/`SIGTERM`). [`pages/vox.html`](pages/vox.html) polls this metadata and uses the pure [`isVoxServerOnline()`](pages/vox.html) evaluator (with a 90-second staleness window) to render a live green/red status badge on both the Security Clearance screen and the active CRT terminal header.

### 4. Astropathic Courier Playwright Engine (`vox_bridge.js`)
- **Concurrent Dual-Tab State Machine**: Manages two persistent Chromium pages in parallel locks (`isProcessing.alpha`, `isProcessing.beta`), draining pending Supabase queue items in FIFO order.
- **Streaming Stability & Artifact Scrubbing**: Polls the Gemini DOM response container until character length stabilizes across `STABLE_CHECKS_REQUIRED` consecutive intervals and all generating indicators disappear. [`scrubArtifacts()`](vox_bridge.js) and [`extractCleanLastModelResponse()`](vox_bridge.js) strip NotebookLM source citation chips, unwrap markdown code fences, sanitize nested HTML `<p>` tags inside `<li>` elements, and partition direct replies from cross-channel psychic intercepts.

---

## 🎮 Suite Modules (`index.html` & `pages/*.html`)

| Module | File | Core Technical Capabilities |
| :--- | :--- | :--- |
| **📖 Field Codex Launchpad** | [`index.html`](index.html) | Central command hub, onboarding protocol, and unified navigation bar. |
| **🧟 Mode 1: Horde Spawner** | [`pages/spawner.html`](pages/spawner.html) | Seed-synchronized wave generator, Misery Card deck manager, Pity-Timer resupply engine, and Cloud Pool integration. |
| **⚔️ Mode 2: 1v1 Ash Wastes PvP** | [`pages/pvp.html`](pages/pvp.html) | Dynamic Hellscape selector, Warp Intensity anomaly roller, Unbound Adversary spawner, and 3rd Alliance Vulture SPts Match Report compiler (`compilePvpVultureReport`). |
| **🎲 Mode 3: Rogue Sector & AI** | [`pages/rogue.html`](pages/rogue.html) | 3-Step autonomous AI behavioral state machine and declarative Rogue Sector Battle Report compiler (`ROGUE_OUTCOME_IMPACTS`, `compileRogueDossier`). |
| **🎖️ Mode 4: Hostile Matrix** | [`pages/roster.html`](pages/roster.html) | Cross-Mode Nemesis Bounty Ledger, Ordo Malleus Nemesis Induction compiler (`compileNemesisDossier`), Unbound Datasheets, and Supabase-synced Shelf Barracks. |
| **🏆 Mode 5: Crusade Command** | [`pages/crusade.html`](pages/crusade.html) | 3-Way Alliance Scoreboard, 4-Phase branching narrative trees, D6 upgrade rollers, Tour of Duty logistics tracker, Tomb World Awakening Matrix, Start of Tour Dispatch, and Master Post-Battle Dossier compiler. |
| **📜 Mode 6: Briefings & Atlas** | [`pages/briefing.html`](pages/briefing.html) | Passcode-sealed Commander Alpha/Beta dossiers, interactive `SHIP.md` orbital slider, 8-node interactive SVG Sector Atlas, and 3-Way Parallel Hegemony Race bars. |
| **📡 Mode 7: Astropath Vox** | [`pages/vox.html`](pages/vox.html) | Pass-Seal authenticated CRT terminal, elapsed-time teletype text streamer, Direct vs. Interferences monitors, `[ ✕ PURGE ]` RPC controls, and live Courier Server Status indicator. |
| **🎓 Quickstart Tutorials** | [`pages/welcome.html`](pages/welcome.html) | Field operations manual and guided walkthrough for all 7 suite modes. |

---

## 📂 Repository Structure

```text
armageddon-vox/
├── index.html                  # Root entry point (Field Codex & Command Launchpad)
├── AGENTS.md                   # Non-negotiable engineering & architectural directives
├── README.md                   # Technical architecture & project documentation
├── vox_bridge.js               # Dual-thread Playwright courier bridging Supabase <-> Gemini
├── vox_autopilot.bat           # Windows launcher with auto-dependency check
├── package.json                # Scripts & dev/runtime dependencies (Playwright, dotenv)
├── wrangler.jsonc              # Cloudflare Pages static deployment configuration
├── assets/                     # Vector icons & favicons (favicon.svg, favicon.png)
├── css/
│   └── style.css               # "Sanctuary-Noctis Hybrid" tactical stylesheet & CRT tokens
├── js/
│   ├── data.js                 # Faction tables, missions, misery cards, and lore constants
│   ├── rng.js                  # Deterministic hashSeed(), mulberry32() PRNG & 60 room prefixes
│   ├── spawner.js              # Pure wave-spawning math, bracket resolution & pity timer
│   ├── app.js                  # Mode 1 Horde Command UI controller & localStorage state
│   └── vox-audio.js            # Procedural Web Audio synth & seamless SPA page router
├── pages/                      # Modular suite views (spawner, pvp, rogue, roster, crusade, briefing, vox, welcome)
├── scripts/
│   └── generate_bundles.js     # Automated compiler for /bundles/*.md AI context artifacts
├── bundles/                    # 12 modular Markdown codebase bundles for Gemini / NotebookLM
└── tests/                      # 171 automated tests (Node:test + VM sandboxes + Playwright)
    ├── vox_bridge.test.js      # Courier prompt routing, scrubbing, queue & heartbeat tests
    ├── js/                     # Unit tests mirroring js/*.js
    └── ui/                     # Boundary, DOM, and headless browser E2E integration tests
```

---

## 🧪 Testing & Verification

The repository maintains a strict **100% test pass target** (`241` tests across unit, courier, and headless browser UI suites) using Node's native test runner (`node:test`), `node:vm` lexical sandboxes, and headless Playwright Chromium/Edge integration:

```bash
# Run the complete 241-test verification suite (unit + courier + headless browser E2E)
npm test

# Regenerate and synchronize all modular Markdown bundles (<= 1000 lines) in /bundles/
npm run bundle

# Launch the local Astropathic Courier Gemini Bridge
npm run vox:bridge
# (or run vox_autopilot.bat on Windows)
```
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

## III. The "Dumb UI" (Humble View) & Functional Core Pattern
The UI layer MUST remain "dumb"—acting strictly as a humble visual projection of state (`State → UI`) and a thin forwarder of user intent (`DOM Event → Action`).
- **Functional Core, Imperative Shell**:
  - **Functional Core (Pure Logic)**: Game rules, RNG math, threat-bracket resolution, quota/point calculations, and Astropathic Dossier text compilers MUST be written as pure, deterministic functions (`(state, inputs) => result`) with zero direct dependency on `document`, `localStorage`, `fetch`, or `VoxAudio`.
  - **Imperative Shell (Boundary Adapters)**: DOM queries (`document.getElementById`), browser storage (`localStorage` / `sessionStorage`), Web Audio cues (`window.VoxAudio`), and network calls (`fetch` / Supabase RPCs) must reside at the outer boundary, reading inputs, calling the pure core, and applying the resulting state to the DOM.
- **Explicit State Over DOM-as-State**: Maintain an explicit JavaScript state object for each module/page rather than treating scattered DOM input `.value` properties as the primary source of truth.
- **Idempotent Rendering**: Every `render*` or `update*Preview` function must be idempotent—calling it repeatedly with the same state must produce the exact same DOM output without duplicating nodes, timers, or event listeners.
- **Declarative Lookup Tables Over Branching Chains**: Prefer declarative lookup maps/tables (e.g., mapping outcomes, channels, or brackets to structured rule descriptors) over deeply nested `if / else if / switch` chains.
- **Guard Clauses & Single Level of Abstraction**: Use early returns (guard clauses) at the top of functions to handle missing elements or invalid states, keeping the happy path flat and readable. High-level workflow functions should read like a clear table of contents delegating to small, single-purpose helpers.

## IV. 100% Test Coverage Target
Any submitted change must strive for and target 100% test coverage (covering unit, integration, and UI component paths). This standard is non-negotiable.

## V. Test-First Imperative (TDD)
Test-Driven Development (TDD) is **mandatory** and non-negotiable.
- ANY production logic or UI module MUST have a corresponding test suite file in the `tests/` directory, **strictly mirroring the directory structure of the source** (e.g., `js/<module>.js` MUST have `tests/js/<module>.test.js`, and UI/integration tests must live in `tests/ui/`).
- Tests MUST be written and executed first (and must initially fail) before starting any production code implementation.
- The Red-Green-Refactor cycle must be strictly followed for every new feature, rule addition, or logical unit introduced.

## VI. Boundary and UI/Integration Tests First
Prioritize testing system boundaries, component interfaces, and integration flows before descending into irrelevant internal implementation details.
- Component, UI, and integration tests MUST be prioritized to validate realistic end-to-end user workflows.
- This guarantees the integrity of the user interface as a cohesive whole and ensures that visual, functional, and user-facing requirements are satisfied right from the start of development.

## VII. Simplicity and Anti-Abstraction
Code MUST be simple, declarative, and effortless to comprehend.
- Avoid premature abstractions, speculative generality, and "clever" code (unnecessary cognitive overhead).
- Follow the golden rule: *"A little duplication is far better than the wrong abstraction."*
- Concurrently, practice prudent DRY (Don't Repeat Yourself): avoid repetitive boilerplate when it can be abstracted in an obvious, simple manner for straightforward reuse.

## VIII. Continuous and Comprehensive Documentation
Clean code does NOT substitute for thorough technical documentation.
- All implementations MUST be well-documented using structured docstrings / JSDoc blocks (`/** ... */`) across functions, classes, and modules, articulating *the why* (intent and architectural rationale) and not merely *the what* (the raw mechanical action).
- Every new module, capability, or architectural change MUST be reflected with improvements and updates in the relevant `README.md` and documentation files.
- Documentation is a living artifact and an inseparable part of delivering software value.

## IX. Modular Codebase Bundles Synchronization (`/bundles/` Directory)
Any and all changes made to the codebase (files added, modified, renamed, or deleted) MUST immediately and continuously be reflected in the modular markdown bundles in `/bundles/` via `npm run bundle` / `node scripts/generate_bundles.js`.
- The `/bundles` directory provides modular, page-by-page and component-focused ingestion artifacts for Gemini Notebook and NotebookLM, partitioned so that every single bundle file is strictly $\le 1000$ lines (targeting ~800 lines) for optimal AI context-window chunking.
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
scratch/
chrome_vox_profile/
.env
.env.*
!.env.example

````

---

## File: `.env.example` <a id="file-envexample"></a>

````text
# Supabase Configuration Template
# Copy this file to .env and fill in your actual project values.
SUPABASE_URL=https://<your-project-id>.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...

# Astropathic Courier Gemini Notebook Thread URLs (Required for vox_bridge.js)
ALPHA_THREAD_URL=https://gemini.google.com/app/<your-alpha-thread-id>
BETA_THREAD_URL=https://gemini.google.com/app/<your-beta-thread-id>

````

---

## File: `vox_autopilot.bat` <a id="file-voxautopilotbat"></a>

````text
@echo off
setlocal
cd /d "%~dp0"
color 0A
title Segmentum Solar // Dual-Thread Astropathic Courier
echo ================================================================
echo  ASTROPATHIC VOX-BRIDGE (SUPABASE ^<--^> GOOGLE ONE NOTEBOOK)
echo  Active Directory: %CD%
echo ================================================================

where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not found in PATH! Please install Node.js 18+ to proceed.
    pause
    exit /b 1
)

if not exist "%~dp0.env" (
    if exist "%~dp0.env.example" (
        echo [NOTICE] .env file not detected. Creating .env from .env.example template...
        copy "%~dp0.env.example" "%~dp0.env" >nul
        echo [ACTION REQUIRED] Please edit .env with your SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY!
    )
)

if not exist "%~dp0node_modules\playwright" (
    echo Installing Playwright and dotenv in current directory...
    call npm.cmd install playwright dotenv
    call npx.cmd playwright install chromium
)

echo Launching Dual-Thread Courier...
node "%~dp0vox_bridge.js"
node -e "require('./vox_bridge.js').publishServerHeartbeat('offline').catch(function(){})" >nul 2>nul
pause
````
