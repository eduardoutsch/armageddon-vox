# 📦 Modular Codebase Bundles // AI Context-Window Partitioning

This directory contains standalone, subsystem-focused Markdown artifacts compiled deterministically by [`scripts/generate_bundles.js`](../scripts/generate_bundles.js) (`npm run bundle`).

## 🧠 Technical Purpose & AI Involvement

1. **AI Context-Window Partitioning (Google Gemini & NotebookLM)**:
   - Rather than feeding a monolithic repository dump into an LLM or AI Campaign Master notebook, the codebase is partitioned into **focused, modular bundles strictly $\le 1000$ lines each (targeting ~800 lines)**.
   - This allows both the live **Astropathic Courier Campaign Master** (Google Gemini / NotebookLM) and **autonomous coding agents** (Google Antigravity) to ingest only the exact vertical slice required for a given game mode or engineering task, maximizing attention recall and minimizing token overhead.
2. **Deterministic Anchor Indexing & Quadruple-Backtick Escaping**:
   - Every bundle generates a deterministic Table of Contents with normalized anchor links (`#file-...`) pointing to each constituent source file.
   - Source files are wrapped in **quadruple-backtick** code fences (` ````lang `) rather than triple backticks so embedded Markdown documentation (`README.md`, `AGENTS.md`) and inline code blocks never prematurely terminate the outer AST fence during LLM parsing.
3. **Continuous Synchronization Mandate (`AGENTS.md` Principle IX)**:
   - Any modification to any source file in the repository requires immediate regeneration via `npm run bundle` and is verified by the automated boundary test suite (`tests/ui/pages.test.js`).

---

## 📑 Complete Bundle Directory Manifest

| Bundle Document | Target Scope | Included Files / Slices |
| :--- | :--- | :--- |
| [`bundle_index.md`](bundle_index.md) | **Home Launchpad** | `index.html` |
| [`bundle_spawner.md`](bundle_spawner.md) | **Mode 1 Spawner Terminal** | `pages/spawner.html` |
| [`bundle_spawner_cards.md`](bundle_spawner_cards.md) | **Threat Cards & Audio FX** | `js/spawner-cards.js` |
| [`bundle_spawner_cockpit.md`](bundle_spawner_cockpit.md) | **Spawner Cockpit & Telemetry** | `js/spawner-cockpit.js` |
| [`bundle_spawner_engine.md`](bundle_spawner_engine.md) | **Spawner Engine & Resupply** | `js/spawner.js`, `js/spawner-resupply.js` |
| [`bundle_data_rng.md`](bundle_data_rng.md) | **Data Schemas & Seeded RNG** | `js/data.js`, `js/rng.js` |
| [`bundle_app_part1.md`](bundle_app_part1.md) | **App Engine (State & Factions)** | `js/app.js` (Lines 1-700) |
| [`bundle_app_part2.md`](bundle_app_part2.md) | **App Engine (Waves & Escalation)** | `js/app.js` (Lines 701-1400) |
| [`bundle_app_part3.md`](bundle_app_part3.md) | **App Engine (UI & Telemetry)** | `js/app.js` (Lines 1401-end) |
| [`bundle_javascript.md`](bundle_javascript.md) | **Audio Synth & Oscillators** | `js/vox-audio.js` (Lines 1-850) |
| [`bundle_audio_synth.md`](bundle_audio_synth.md) | **Sound FX & Teletype Synth** | `js/vox-audio.js` (Lines 851-end) |
| [`bundle_briefing.md`](bundle_briefing.md) | **Mode 6: Briefing (Part 1: Alpha & Beta)** | `pages/briefing.html` (Lines 1-521) |
| [`bundle_briefing_part2.md`](bundle_briefing_part2.md) | **Mode 6: Briefing (Part 2: Gamma & Atlas)** | `pages/briefing.html` (Lines 522-end) |
| [`bundle_briefing_css.md`](bundle_briefing_css.md) | **Mode 6: Briefing Stylesheet** | `css/briefing.css` |
| [`bundle_briefing_js.md`](bundle_briefing_js.md) | **Mode 6: Sector Atlas & Logic** | `js/briefing.js` |
| [`bundle_pvp.md`](bundle_pvp.md) | **Mode 2: 1v1 Ash Wastes PvP** | `pages/pvp.html`, `js/pvp.js` |
| [`bundle_rogue.md`](bundle_rogue.md) | **Mode 3: Rogue Sector & AI Tracker** | `pages/rogue.html`, `css/rogue.css`, `js/rogue.js` |
| [`bundle_roster.md`](bundle_roster.md) | **Mode 4: Hostile Threat Matrix (Page)**| `pages/roster.html`, `css/roster.css` |
| [`bundle_roster_logic.md`](bundle_roster_logic.md) | **Mode 4: Threat Matrix Logic** | `js/roster.js` |
| [`bundle_crusade.md`](bundle_crusade.md) | **Mode 5: Crusade Command (Page)** | `pages/crusade.html` |
| [`bundle_crusade_css.md`](bundle_crusade_css.md) | **Mode 5: Crusade Stylesheet** | `css/crusade.css` |
| [`bundle_crusade_matrix.md`](bundle_crusade_matrix.md) | **Mode 5: Crusade Matrix (Part 1)** | `js/crusade.js` (Lines 1-550) |
| [`bundle_crusade_matrix_part2.md`](bundle_crusade_matrix_part2.md) | **Mode 5: Crusade Matrix (Part 2)** | `js/crusade.js` (Lines 551-end) |
| [`bundle_crusade_forge.md`](bundle_crusade_forge.md) | **Mode 5: Munitorum Forge & Dossier** | `js/crusade-forge.js` |
| [`bundle_crusade_data.md`](bundle_crusade_data.md) | **Mode 5: Crusade Upgrade Tables** | `js/crusade-data.js` |
| [`bundle_vox.md`](bundle_vox.md) | **Mode 7: CRT Vox-Terminal (Page)** | `pages/vox.html`, `css/vox.css` |
| [`bundle_vox_logic.md`](bundle_vox_logic.md) | **Mode 7: Vox-Terminal (Part 1)** | `js/vox.js` (Lines 1-500) |
| [`bundle_vox_logic_part2.md`](bundle_vox_logic_part2.md) | **Mode 7: Vox-Terminal (Part 2)** | `js/vox.js` (Lines 501-end) |
| [`bundle_welcome.md`](bundle_welcome.md) | **Field Codex & Tutorials** | `pages/welcome.html` |
| [`bundle_css.md`](bundle_css.md) | **Styles (Part 1: Tokens & Auspex)** | `css/style.css` (Lines 1-750) |
| [`bundle_css_part2.md`](bundle_css_part2.md) | **Styles (Part 2: Navigation & Cards)** | `css/style.css` (Lines 751-1450) |
| [`bundle_css_part3.md`](bundle_css_part3.md) | **Styles (Part 3: Spawner & Modals)** | `css/style.css` (Lines 1451-2150) |
| [`bundle_css_part4.md`](bundle_css_part4.md) | **Styles (Part 4: Utilities & SVG)** | `css/style.css` (Lines 2151-end), `assets/favicon.svg` |
| [`bundle_packages.md`](bundle_packages.md) | **Configs & Engineering Directives** | `package.json`, `wrangler.jsonc`, `README.md`, `AGENTS.md`, `.gitignore`, `.env.example`, `vox_autopilot.bat` |
| [`bundle_bridge.md`](bundle_bridge.md) | **Courier WebSocket Bridge** | `vox_bridge.js` |
| [`bundle_tests.md`](bundle_tests.md) | **Pages & Boundary Tests (Part 1: UI & Bundles)** | `tests/ui/pages.test.js` (Lines 1-558) |
| [`bundle_tests_part2.md`](bundle_tests_part2.md) | **Pages & Boundary Tests (Part 2: Headless Playwright E2E)** | `tests/ui/pages.test.js` (Lines 559-end) |
| [`bundle_tests_ui_overview.md`](bundle_tests_ui_overview.md) | **UI Tests (Briefing & PvP)** | `tests/ui/briefing.test.js`, `tests/ui/pvp.test.js` |
| [`bundle_tests_ui_roster_rogue.md`](bundle_tests_ui_roster_rogue.md) | **UI Tests (Rogue & Roster)** | `tests/ui/rogue.test.js`, `tests/ui/roster.test.js` |
| [`bundle_tests_ui_crusade.md`](bundle_tests_ui_crusade.md) | **UI Tests (Crusade Command)** | `tests/ui/crusade.test.js`, `tests/js/crusade.test.js` |
| [`bundle_tests_ui_forge.md`](bundle_tests_ui_forge.md) | **UI Tests (Munitorum Forge)** | `tests/ui/crusade-forge.test.js` |
| [`bundle_tests_ui_vox.md`](bundle_tests_ui_vox.md) | **UI Tests (Vox-Terminal)** | `tests/ui/vox.test.js` |
| [`bundle_tests_bridge.md`](bundle_tests_bridge.md) | **Courier Bridge Tests** | `tests/vox_bridge.test.js` |
| [`bundle_tests_js_spawner.md`](bundle_tests_js_spawner.md) | **Tests (Spawner Subsystems & UI Flow)** | `tests/js/spawner*.test.js`, `tests/ui/spawner.test.js` |
| [`bundle_tests_js_core.md`](bundle_tests_js_core.md) | **Unit Tests (Data, RNG & Audio)** | `tests/js/data.test.js`, `tests/js/rng.test.js`, `tests/js/vox-audio.test.js` |
| [`bundle_tests_js_app.md`](bundle_tests_js_app.md) | **Unit Tests (App Engine)** | `tests/js/app.test.js` |
| [`bundle_tests_js_modes.md`](bundle_tests_js_modes.md) | **Unit Tests (Game Modes 2-7)** | `tests/js/briefing.test.js`, `tests/js/pvp.test.js`, `tests/js/rogue.test.js`, `tests/js/roster.test.js`, `tests/js/vox.test.js` |
