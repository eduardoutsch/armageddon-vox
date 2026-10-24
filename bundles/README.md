# 📦 Modular Codebase Bundles // AI Context-Window Partitioning

This directory contains standalone, page-by-page and subsystem-focused Markdown artifacts compiled deterministically by [`scripts/generate_bundles.js`](../scripts/generate_bundles.js) (`npm run bundle`).

## 🧠 Technical Purpose & AI Involvement

1. **AI Context-Window Partitioning (Google Gemini & NotebookLM)**:
   - Rather than feeding a monolithic repository dump into an LLM or AI Campaign Master notebook, the codebase is partitioned into **12 domain-scoped Markdown bundles**.
   - This allows both the live **Astropathic Courier Campaign Master** (Google Gemini / NotebookLM) and **autonomous coding agents** (Google Antigravity) to ingest only the exact vertical slice required for a given game mode or engineering task, maximizing attention recall and minimizing token overhead.
2. **Deterministic Anchor Indexing & Quadruple-Backtick Escaping**:
   - Every bundle generates a deterministic Table of Contents with normalized anchor links (`#file-...`) pointing to each constituent source file.
   - Source files are wrapped in **quadruple-backtick** code fences (` ````lang `) rather than triple backticks so embedded Markdown documentation (`README.md`, `AGENTS.md`) and inline code blocks never prematurely terminate the outer AST fence during LLM parsing.
3. **Continuous Synchronization Mandate (`AGENTS.md` Principle IX)**:
   - Any modification to any source file in the repository requires immediate regeneration via `npm run bundle` and is verified by the automated boundary test suite (`tests/ui/pages.test.js`).

---

## 📑 Bundle Manifest

| Bundle Document | Target Scope | Included Files |
| :--- | :--- | :--- |
| [`bundle_index.md`](bundle_index.md) | **Home Launchpad & Mode 1 Spawner** | `index.html`, `pages/spawner.html` |
| [`bundle_javascript.md`](bundle_javascript.md) | **JavaScript Functional Core & Audio Synth** | `js/data.js`, `js/rng.js`, `js/spawner.js`, `js/app.js`, `js/vox-audio.js` |
| [`bundle_tests.md`](bundle_tests.md) | **Automated Verification Suites (171 Tests)** | `tests/**/*.test.js` |
| [`bundle_briefing.md`](bundle_briefing.md) | **Mode 6: Briefings, Ship Slider & SVG Atlas** | `pages/briefing.html` |
| [`bundle_pvp.md`](bundle_pvp.md) | **Mode 2: 1v1 Ash Wastes PvP & Vulture Report** | `pages/pvp.html` |
| [`bundle_rogue.md`](bundle_rogue.md) | **Mode 3: Rogue Sector & AI State Machine** | `pages/rogue.html` |
| [`bundle_roster.md`](bundle_roster.md) | **Mode 4: Hostile Matrix, Nemeses & Cloud Pools** | `pages/roster.html` |
| [`bundle_crusade.md`](bundle_crusade.md) | **Mode 5: Crusade Quartermaster & Tour of Duty** | `pages/crusade.html` |
| [`bundle_vox.md`](bundle_vox.md) | **Mode 7: Astropathic CRT Vox-Terminal** | `pages/vox.html` |
| [`bundle_welcome.md`](bundle_welcome.md) | **Field Codex & Quickstart Tutorials** | `pages/welcome.html` |
| [`bundle_css.md`](bundle_css.md) | **Sanctuary-Noctis Stylesheet & Vector Assets** | `css/style.css`, `assets/favicon.svg` |
| [`bundle_packages.md`](bundle_packages.md) | **Courier Bridge, Configs & Engineering Rules** | `package.json`, `wrangler.jsonc`, `README.md`, `AGENTS.md`, `.gitignore`, `.env.example`, `vox_bridge.js`, `vox_autopilot.bat` |
