# ⚔️ Fires of Armageddon // Warhammer 40,000 Horde Mode Suite

A web-based mission runner, dynamic spawner, and companion suite designed for cooperative and solo Warhammer 40k Horde Mode battles, 1v1 Ash Wastes PvP skirmishes, narrative campaign tracking, and real-time Astropathic Vox relay.

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

- **🎖️ Mode 4: Hostile Matrix & Nemesis Archive (`pages/roster.html`)**  
  Enemy roster configurations across threat brackets, nemesis tracking, custom shelf barracks, and one-click Nemesis Dossier induction compiler.

- **🏆 Mode 5: Crusade Command & Quartermaster (`pages/crusade.html`)**  
  3-Way Alliance Scoreboard (Imperium, Chaos, Xenos), 4-Phase Branching Narrative Trees, Random Upgrade Rollers (Traits, Mods, Relics, Scars), and Master Post-Battle Dossier Compiler.

- **📜 Mode 6: Briefings, Ship & Atlas (`pages/briefing.html`)**  
  Interactive planetary atlas with 8-node sector SVG map, 3-way Parallel Hegemony Race tracker, narrative lore briefings, and orbital command support assets.

- **📡 Mode 7: Astropathic CRT Vox-Terminal (`pages/vox.html`)**  
  Recessed cathode-ray green & amber phosphor monitor, Conduit Pass-Seal security, real-time CRT teletype audio streaming, and psychic interferences array.

- **⚡ Astropathic Courier Gemini Bridge (`vox_bridge.js` & `vox_autopilot.bat`)**  
  Dual-thread concurrent automation bridge connecting Supabase message queues directly with live Google Gemini web sessions (Commander Alpha & Commander Beta conduits). Automates Campaign Master decrees, unit christenings, and psychic interferences bleed.

---

## 📂 Repository Structure

- `index.html` — Root entry point (Sanctuary Field Codex & Command Launchpad).
- `pages/` — Suite HTML views (`spawner.html`, `briefing.html`, `pvp.html`, `rogue.html`, `roster.html`, `crusade.html`, `vox.html`, `welcome.html`).
- `vox_bridge.js` — Dual-thread Playwright automation courier bridging Supabase and Gemini notebook sessions.
- `vox_autopilot.bat` — Windows launch script with auto-dependency installer and environment setup.
- `bundles/` — Modular Markdown ingestion bundles per page (`bundle_index.md`, `bundle_briefing.md`, `bundle_crusade.md`, `bundle_vox.md`, etc.), engine modules (`bundle_javascript.md`), test suites (`bundle_tests.md`), tactical styles (`bundle_css.md`), and packages (`bundle_packages.md`).
- `assets/` — Static icons and vector assets (`favicon.svg`, `favicon.png`).
- `css/` — Shared application stylesheets (`style.css`).
- `js/` — Modular client-side logic (`data.js`, `rng.js`, `spawner.js`, `app.js`, `vox-audio.js`).
- `scripts/` — Utility generators (`generate_bundles.js`).
- `tests/` — Automated Node test suites mirroring `js/` (`tests/js/`), root logic (`tests/vox_bridge.test.js`), and UI boundary tests (`tests/ui/`).

---

## 🧪 Testing & Verification

Run the complete 100% pass verification test suite:

```bash
npm test
```

Synchronize all modular Markdown ingestion bundles:

```bash
npm run bundle
```

Start the Astropathic Courier Gemini Bridge:

```bash
npm run vox:bridge
# or execute on Windows:
vox_autopilot.bat
```

---

## 🚀 Deployment & Hosting

Designed for static hosting on **Cloudflare Pages** (unlimited free bandwidth and automated builds from private Git repository) or any static web host.

---

## 💻 Tech Stack

- Zero-dependency client-side architecture (HTML5, Modern CSS, Vanilla JavaScript, Web Audio API).
- Serverless Supabase Real-Time Backend with RLS-protected RPC functions.
- Headless / Persistent Playwright Browser Courier for live Campaign Master AI interfacing.
- Fully responsive and optimized for tablet and mobile play at the tabletop.
- Instant, deterministic seed generator for synchronized multi-player spawning.
