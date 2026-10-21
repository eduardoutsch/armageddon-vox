# ⚔️ Fires of Armageddon // Warhammer 40,000 Horde Mode Suite

A web-based mission runner, dynamic spawner, and companion suite designed for cooperative and solo Warhammer 40k Horde Mode battles, 1v1 Ash Wastes PvP skirmishes, and narrative campaign tracking.

---

## 🎮 Game Modes & Features

- **📖 Field Codex & Command Launchpad (`index.html`)**  
  Central briefing console, quickstart guides, mode overviews, and unified tactical navigation across all Munitorum operations.

- **🧟 Mode 1: Horde Command & Spawner (`pages/spawner.html`)**  
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

- `index.html` — Root entry point (Sanctuary Field Codex & Command Launchpad).
- `pages/` — Suite HTML views (`spawner.html`, `briefing.html`, `pvp.html`, `rogue.html`, `roster.html`, `welcome.html`).
- `bundles/` — Modular Markdown ingestion bundles per page (`bundle_index.md`, `bundle_briefing.md`, `bundle_welcome.md`, etc.), engine modules (`bundle_javascript.md`), test suites (`bundle_tests.md`), tactical styles (`bundle_css.md`), and packages (`bundle_packages.md`).
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
