const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../');
const BUNDLES_DIR = path.join(ROOT_DIR, 'bundles');

if (!fs.existsSync(BUNDLES_DIR)) {
  fs.mkdirSync(BUNDLES_DIR, { recursive: true });
}

function getLang(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.json':
    case '.jsonc':
      return 'json';
    case '.md':
      return 'markdown';
    case '.html':
      return 'html';
    case '.svg':
      return 'xml';
    case '.css':
      return 'css';
    case '.js':
      return 'javascript';
    default:
      if (filePath.endsWith('.gitignore')) return 'gitignore';
      return 'text';
  }
}

function getAnchor(label) {
  return 'file-' + label.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}

/**
 * Compiles a modular bundle Markdown file.
 * Supports fileList items as:
 * - String: 'relative/path'
 * - Object: { file: 'relative/path', label: 'Custom Label', startLine: 1, endLine: 750 }
 */
function compileBundle(title, description, fileList, targetPath) {
  let out = `# ${title}\n\n`;
  out += `${description}\n\n`;
  out += `## 📑 Table of Contents\n`;

  for (const item of fileList) {
    const label = typeof item === 'string' ? item : (item.label || item.file);
    const anchor = getAnchor(label);
    out += `- [${label}](#${anchor})\n`;
  }

  for (const item of fileList) {
    const filePath = typeof item === 'string' ? item : item.file;
    const label = typeof item === 'string' ? item : (item.label || item.file);
    const fullPath = path.join(ROOT_DIR, filePath);
    let content = fs.readFileSync(fullPath, 'utf8');

    if (typeof item === 'object' && (item.startLine || item.endLine)) {
      const lines = content.split('\n');
      const start = (item.startLine || 1) - 1;
      const end = item.endLine ? item.endLine : lines.length;
      content = lines.slice(start, end).join('\n');
    }

    const lang = getLang(filePath);
    const anchor = getAnchor(label);

    out += `\n---\n\n`;
    out += `## File: \`${label}\` <a id="${anchor}"></a>\n\n`;
    out += `\`\`\`\`${lang}\n`;
    out += content;
    if (!content.endsWith('\n')) out += '\n';
    out += `\`\`\`\`\n`;
  }

  fs.writeFileSync(targetPath, out, 'utf8');
  const totalLines = out.split('\n').length;
  console.log(`Bundle generated: ${path.relative(ROOT_DIR, targetPath)} (${totalLines} lines, ${out.length} chars)`);
  if (totalLines > 1000) {
    console.warn(`⚠️ WARNING: Bundle ${path.basename(targetPath)} exceeds 1000 lines (${totalLines} lines)!`);
  }
}

// Clean up deprecated bundle files if present
const deprecatedFiles = [
  path.join(BUNDLES_DIR, 'bundle_css_packages.md'),
  path.join(BUNDLES_DIR, 'codebase_bundle.md')
];
for (const dep of deprecatedFiles) {
  if (fs.existsSync(dep)) fs.unlinkSync(dep);
}

// ============================================================================
// 1. LAUNCHPAD & AUTOMATED SPANNER (index.html, spawner.html, spawner components)
// ============================================================================
compileBundle(
  '📦 Fires of Armageddon // Bundle: Home Launchpad',
  'Complete source code for the primary Sanctuary Field Codex home launchpad (`index.html`).',
  ['index.html'],
  path.join(BUNDLES_DIR, 'bundle_index.md')
);

compileBundle(
  '📦 Fires of Armageddon // Bundle: Mode 1 Spawner Terminal',
  'Complete source code for the Mode 1 Horde Command tactical terminal and automated spawner (`pages/spawner.html`).',
  ['pages/spawner.html'],
  path.join(BUNDLES_DIR, 'bundle_spawner.md')
);

compileBundle(
  '📦 Fires of Armageddon // Bundle: Spawner Threat Cards & Audio FX',
  'Modular visual threat card rendering, boss cards, audio integration, and chamfered badges (`js/spawner-cards.js`).',
  ['js/spawner-cards.js'],
  path.join(BUNDLES_DIR, 'bundle_spawner_cards.md')
);

compileBundle(
  '📦 Fires of Armageddon // Bundle: Spawner Cockpit & Wave Telemetry',
  'Tactical telemetry HUD, wave controls, escalation meters, mission modals, and cockpit state machine (`js/spawner-cockpit.js`).',
  ['js/spawner-cockpit.js'],
  path.join(BUNDLES_DIR, 'bundle_spawner_cockpit.md')
);

compileBundle(
  '📦 Fires of Armageddon // Bundle: Spawner Engine & Resupply Protocol',
  'Core wave calculation routines, quota enforcement, and authoritative Munitorum Resupply tables (`js/spawner.js`, `js/spawner-resupply.js`).',
  ['js/spawner.js', 'js/spawner-resupply.js'],
  path.join(BUNDLES_DIR, 'bundle_spawner_engine.md')
);

// ============================================================================
// 2. CORE GAME ENGINE & APP LOGIC
// ============================================================================
compileBundle(
  '📦 Fires of Armageddon // Bundle: Tactical Data Schemas & Seeded RNG',
  'Immutable faction data, mission profiles, event lookup tables, and Mulberry32 deterministic RNG engine (`js/data.js`, `js/rng.js`).',
  ['js/data.js', 'js/rng.js'],
  path.join(BUNDLES_DIR, 'bundle_data_rng.md')
);

compileBundle(
  '📦 Fires of Armageddon // Bundle: App Engine (Part 1: State & Faction Tables)',
  'Main horde application logic, state stores, and faction profile bindings (`js/app.js` lines 1 to 700).',
  [{ file: 'js/app.js', label: 'js/app.js (Part 1: State & Faction Tables, Lines 1-700)', startLine: 1, endLine: 700 }],
  path.join(BUNDLES_DIR, 'bundle_app_part1.md')
);

compileBundle(
  '📦 Fires of Armageddon // Bundle: App Engine (Part 2: Wave Engine & Threat Escalation)',
  'Wave generation cycle, threat level brackets, and battlefield event resolvers (`js/app.js` lines 701 to 1400).',
  [{ file: 'js/app.js', label: 'js/app.js (Part 2: Wave Engine & Threat Escalation, Lines 701-1400)', startLine: 701, endLine: 1400 }],
  path.join(BUNDLES_DIR, 'bundle_app_part2.md')
);

compileBundle(
  '📦 Fires of Armageddon // Bundle: App Engine (Part 3: UI Telemetry & Persistence)',
  'DOM event handlers, Auspex telemetry HUD synchronization, and session state persistence (`js/app.js` lines 1401 to end).',
  [{ file: 'js/app.js', label: 'js/app.js (Part 3: UI Telemetry & Persistence, Lines 1401-end)', startLine: 1401, endLine: 2150 }],
  path.join(BUNDLES_DIR, 'bundle_app_part3.md')
);

compileBundle(
  '📦 Fires of Armageddon // Bundle: JavaScript Core Audio & Synth Engine',
  'Web Audio API sound generation, procedural ambient drones, and Auspex channel oscillators (`js/vox-audio.js` lines 1 to 850).',
  [{ file: 'js/vox-audio.js', label: 'js/vox-audio.js (Part 1: Web Audio Synth & Oscillators, Lines 1-850)', startLine: 1, endLine: 850 }],
  path.join(BUNDLES_DIR, 'bundle_javascript.md')
);

compileBundle(
  '📦 Fires of Armageddon // Bundle: Procedural Sound FX & Teletype Synth',
  'CRT cathode chimes, forge anvil clanks, mechanical dice clatter, and teletype typewriter synthesizers (`js/vox-audio.js` lines 851 to end).',
  [{ file: 'js/vox-audio.js', label: 'js/vox-audio.js (Part 2: Audio FX & Teletype Synth, Lines 851-1670)', startLine: 851, endLine: 1670 }],
  path.join(BUNDLES_DIR, 'bundle_audio_synth.md')
);

// ============================================================================
// 3. PAGE 2: BRIEFINGS, SHIP SLIDER & SECTOR ATLAS
// ============================================================================
compileBundle(
  '📦 Fires of Armageddon // Bundle: Briefings, Ship Slider & Sector Atlas (Page)',
  'Complete markup and Auspex layout for Commander Alpha & Beta briefings, interactive SHIP.md slider, and the 8-node Sector Atlas (`pages/briefing.html`).',
  ['pages/briefing.html'],
  path.join(BUNDLES_DIR, 'bundle_briefing.md')
);

compileBundle(
  '📦 Fires of Armageddon // Bundle: Briefings Stylesheet',
  'Auspex CRT styling, SVG sector atlas glow tokens, and responsive ship telemetry layout (`css/briefing.css`).',
  ['css/briefing.css'],
  path.join(BUNDLES_DIR, 'bundle_briefing_css.md')
);

compileBundle(
  '📦 Fires of Armageddon // Bundle: Briefings & Sector Atlas Logic',
  '8-node interactive SVG sector map, parallel hegemony race math, briefing locking protocol, and fullscreen HUD (`js/briefing.js`).',
  ['js/briefing.js'],
  path.join(BUNDLES_DIR, 'bundle_briefing_js.md')
);

// ============================================================================
// 4. PAGE 3: MODE 2 - 1V1 ASH WASTES PVP
// ============================================================================
compileBundle(
  '📦 Fires of Armageddon // Bundle: Mode 2 - 1v1 Ash Wastes PvP',
  'Complete source code for the 1v1 Ash Wastes PvP module, Hellscapes, Warp Storm Anomalies, and Unbound Adversaries (`pages/pvp.html`, `js/pvp.js`).',
  ['pages/pvp.html', 'js/pvp.js'],
  path.join(BUNDLES_DIR, 'bundle_pvp.md')
);

// ============================================================================
// 5. PAGE 4: MODE 3 - ROGUE SECTOR & AI TRACKER
// ============================================================================
compileBundle(
  '📦 Fires of Armageddon // Bundle: Mode 3 - Rogue Sector & AI Tracker',
  'Complete source code for the autonomous AI Turn Sequencer and Rogue Sector impact reference (`pages/rogue.html`, `css/rogue.css`, `js/rogue.js`).',
  ['pages/rogue.html', 'css/rogue.css', 'js/rogue.js'],
  path.join(BUNDLES_DIR, 'bundle_rogue.md')
);

// ============================================================================
// 6. PAGE 5: MODE 4 - HOSTILE THREAT MATRIX & NEMESES
// ============================================================================
compileBundle(
  '📦 Fires of Armageddon // Bundle: Mode 4 - Hostile Matrix & Nemesis Archive (Page)',
  'Complete markup and Auspex styling for Hostile Threat Matrix, Cross-Mode Nemesis Bounty Ledger, and Custom Shelf Pool (`pages/roster.html`, `css/roster.css`).',
  ['pages/roster.html', 'css/roster.css'],
  path.join(BUNDLES_DIR, 'bundle_roster.md')
);

compileBundle(
  '📦 Fires of Armageddon // Bundle: Mode 4 - Hostile Threat Matrix Logic',
  'Nemesis Dossier Induction Compiler, Unbound Datasheets, and Custom Shelf state machine (`js/roster.js`).',
  ['js/roster.js'],
  path.join(BUNDLES_DIR, 'bundle_roster_logic.md')
);

// ============================================================================
// 7. PAGE 6: MODE 5 - CRUSADE COMMAND & QUARTERMASTER
// ============================================================================
compileBundle(
  '📦 Fires of Armageddon // Bundle: Mode 5 - Crusade Command & Quartermaster (Page)',
  'Complete markup and theme styles for 3-Way Alliance Scoreboard, Branching Narrative Trees, and Master Battle Dossier (`pages/crusade.html`, `css/crusade.css`).',
  ['pages/crusade.html', 'css/crusade.css'],
  path.join(BUNDLES_DIR, 'bundle_crusade.md')
);

compileBundle(
  '📦 Fires of Armageddon // Bundle: Mode 5 - Crusade Quartermaster Matrix',
  'Crusade tab orchestration, 3-way score tracking, tour quotas, and state persistence (`js/crusade.js`).',
  ['js/crusade.js'],
  path.join(BUNDLES_DIR, 'bundle_crusade_matrix.md')
);

compileBundle(
  '📦 Fires of Armageddon // Bundle: Mode 5 - Munitorum Forge & Dossier Compiler',
  'Random upgrade rollers (Traits, Mods, Relics, Scars) and Master Post-Battle Dossier text compiler (`js/crusade-forge.js`).',
  ['js/crusade-forge.js'],
  path.join(BUNDLES_DIR, 'bundle_crusade_forge.md')
);

compileBundle(
  '📦 Fires of Armageddon // Bundle: Mode 5 - Crusade Data & Upgrade Tables',
  'Authoritative 11th Ed Crusade upgrade tables, Astra Militarum & Necron vaults, and branching narrative trees (`js/crusade-data.js`).',
  ['js/crusade-data.js'],
  path.join(BUNDLES_DIR, 'bundle_crusade_data.md')
);

compileBundle(
  '📦 Fires of Armageddon // Bundle: Horde Battle Stats & Crusade Telemetry Engine',
  'After-action Horde battle telemetry tracking (kills, miseries, secondaries, SP economy) and Crusade Master Dossier compiler adapter (`js/horde-battle-stats.js`).',
  ['js/horde-battle-stats.js'],
  path.join(BUNDLES_DIR, 'bundle_horde_battle_stats.md')
);

// ============================================================================
// 8. PAGE 7: MODE 7 - ASTROPATHIC CRT VOX-TERMINAL
// ============================================================================
compileBundle(
  '📦 Fires of Armageddon // Bundle: Mode 7 - Astropathic CRT Vox-Terminal (Page)',
  'Complete markup and CRT phosphor styling for Astropathic Vox-Terminal and Conduit Pass-Seal Security (`pages/vox.html`, `css/vox.css`).',
  ['pages/vox.html', 'css/vox.css'],
  path.join(BUNDLES_DIR, 'bundle_vox.md')
);

compileBundle(
  '📦 Fires of Armageddon // Bundle: Mode 7 - Astropathic Vox-Terminal Logic',
  'Real-time Teletype typewriter audio streaming, conduit pass-seal verification, and interferences array (`js/vox.js`).',
  ['js/vox.js'],
  path.join(BUNDLES_DIR, 'bundle_vox_logic.md')
);

// ============================================================================
// 9. PAGE 8: FIELD CODEX & TUTORIALS
// ============================================================================
compileBundle(
  '📦 Fires of Armageddon // Bundle: Field Codex & Quickstart Tutorials',
  'Complete source code for the introductory tutorial and field operations manual (`pages/welcome.html`).',
  ['pages/welcome.html'],
  path.join(BUNDLES_DIR, 'bundle_welcome.md')
);

// ============================================================================
// 10. TACTICAL STYLESHEET & VECTOR ASSETS
// ============================================================================
compileBundle(
  '📦 Fires of Armageddon // Bundle: Tactical Stylesheet (Part 1: Tokens & Auspex Glow)',
  'Sanctuary-Noctis design tokens, CRT scanlines, cathode pulse effects, and ambient glow (`css/style.css` lines 1 to 750).',
  [{ file: 'css/style.css', label: 'css/style.css (Part 1: Design Tokens & Auspex Glow, Lines 1-750)', startLine: 1, endLine: 750 }],
  path.join(BUNDLES_DIR, 'bundle_css.md')
);

compileBundle(
  '📦 Fires of Armageddon // Bundle: Tactical Stylesheet (Part 2: Navigation & Cards)',
  'Header tabs, responsive navigation bars, layout grids, and 45-degree chamfered card plasteel silhouettes (`css/style.css` lines 751 to 1450).',
  [{ file: 'css/style.css', label: 'css/style.css (Part 2: Navigation & Cards, Lines 751-1450)', startLine: 751, endLine: 1450 }],
  path.join(BUNDLES_DIR, 'bundle_css_part2.md')
);

compileBundle(
  '📦 Fires of Armageddon // Bundle: Tactical Stylesheet (Part 3: Spawner Cockpit & Modals)',
  'Spawner cockpit controls, resupply item cards, modal dialogs, and threat indicators (`css/style.css` lines 1451 to 2150).',
  [{ file: 'css/style.css', label: 'css/style.css (Part 3: Spawner Cockpit & Modals, Lines 1451-2150)', startLine: 1451, endLine: 2150 }],
  path.join(BUNDLES_DIR, 'bundle_css_part3.md')
);

compileBundle(
  '📦 Fires of Armageddon // Bundle: Tactical Stylesheet (Part 4: Utilities & SVG Favicon)',
  'Tactical utility classes, responsive media queries, and vector skull insignia (`css/style.css` lines 2151 to end, `assets/favicon.svg`).',
  [
    { file: 'css/style.css', label: 'css/style.css (Part 4: Utilities & Media Queries, Lines 2151-2800)', startLine: 2151, endLine: 2800 },
    'assets/favicon.svg'
  ],
  path.join(BUNDLES_DIR, 'bundle_css_part4.md')
);

// ============================================================================
// 11. PACKAGES, CONFIGURATION & BRIDGES
// ============================================================================
compileBundle(
  '📦 Fires of Armageddon // Bundle: Packages, Configuration & Documentation',
  'NPM package manifests, Cloudflare Pages deployment configs, repository documentation, and engineering directives.',
  [
    'package.json',
    'wrangler.jsonc',
    'README.md',
    'AGENTS.md',
    '.gitignore',
    '.env.example',
    'vox_autopilot.bat'
  ],
  path.join(BUNDLES_DIR, 'bundle_packages.md')
);

compileBundle(
  '📦 Fires of Armageddon // Bundle: Astropathic Courier WebSocket Bridge',
  'Bidirectional Node.js relay bridge connecting local game modes to Gemini AI Campaign Master (`vox_bridge.js`).',
  ['vox_bridge.js'],
  path.join(BUNDLES_DIR, 'bundle_bridge.md')
);

// ============================================================================
// 12. TEST SUITES & VERIFICATION
// ============================================================================
compileBundle(
  '📦 Fires of Armageddon // Bundle: Pages & Boundary Tests (Part 1: UI & Bundles)',
  'Automated UI boundary verification, bundle integrity checks, and cross-tab persistence test suite (`tests/ui/pages.test.js` lines 1 to 558).',
  [{ file: 'tests/ui/pages.test.js', label: 'tests/ui/pages.test.js (Part 1: UI & Bundles, Lines 1-558)', startLine: 1, endLine: 558 }],
  path.join(BUNDLES_DIR, 'bundle_tests.md')
);

compileBundle(
  '📦 Fires of Armageddon // Bundle: Pages & Boundary Tests (Part 2: Headless Playwright E2E)',
  'Headless browser E2E verification, cockpit controls, and multi-CP stratagem validation (`tests/ui/pages.test.js` lines 559 to end).',
  [{ file: 'tests/ui/pages.test.js', label: 'tests/ui/pages.test.js (Part 2: Headless Playwright E2E, Lines 559-1100)', startLine: 559, endLine: 1100 }],
  path.join(BUNDLES_DIR, 'bundle_tests_part2.md')
);

compileBundle(
  '📦 Fires of Armageddon // Bundle: UI Tests (Briefing & PvP)',
  'UI integration and boundary test suites for Mode 6 Briefing and Mode 2 PvP (`tests/ui/briefing.test.js`, `tests/ui/pvp.test.js`).',
  ['tests/ui/briefing.test.js', 'tests/ui/pvp.test.js'],
  path.join(BUNDLES_DIR, 'bundle_tests_ui_overview.md')
);

compileBundle(
  '📦 Fires of Armageddon // Bundle: UI Tests (Rogue Sector & Threat Matrix)',
  'UI integration and boundary test suites for Mode 3 Rogue Sector and Mode 4 Roster (`tests/ui/rogue.test.js`, `tests/ui/roster.test.js`).',
  ['tests/ui/rogue.test.js', 'tests/ui/roster.test.js'],
  path.join(BUNDLES_DIR, 'bundle_tests_ui_roster_rogue.md')
);

compileBundle(
  '📦 Fires of Armageddon // Bundle: UI Tests (Crusade Command & Tour of Duty)',
  'Crusade tab orchestration, 3-way scoreboard, tour quotas, and narrative tree test suites (`tests/ui/crusade.test.js`, `tests/js/crusade.test.js`, `tests/js/horde-battle-stats.test.js`).',
  ['tests/ui/crusade.test.js', 'tests/js/crusade.test.js', 'tests/js/horde-battle-stats.test.js'],
  path.join(BUNDLES_DIR, 'bundle_tests_ui_crusade.md')
);

compileBundle(
  '📦 Fires of Armageddon // Bundle: UI Tests (Crusade Munitorum Forge)',
  'Munitorum logistics, commendations vault, upgrade rollers, and master dossier compiler test suite (`tests/ui/crusade-forge.test.js`).',
  ['tests/ui/crusade-forge.test.js'],
  path.join(BUNDLES_DIR, 'bundle_tests_ui_forge.md')
);

compileBundle(
  '📦 Fires of Armageddon // Bundle: UI Tests (Astropathic Vox-Terminal)',
  'Astropathic Vox CRT terminal, teletype audio streaming, and pass-seal security test suite (`tests/ui/vox.test.js`).',
  ['tests/ui/vox.test.js'],
  path.join(BUNDLES_DIR, 'bundle_tests_ui_vox.md')
);

compileBundle(
  '📦 Fires of Armageddon // Bundle: Courier Bridge Tests',
  'Automated mock WebSocket bridge, rate-limiting, and error-handling verification suite (`tests/vox_bridge.test.js`).',
  ['tests/vox_bridge.test.js'],
  path.join(BUNDLES_DIR, 'bundle_tests_bridge.md')
);

compileBundle(
  '📦 Fires of Armageddon // Bundle: Tests (Spawner Subsystems & UI Flow)',
  'Deterministic unit and Playwright UI tests for spawner cards, cockpit telemetry, resupply table, and threat rules (`tests/js/spawner*.test.js`, `tests/ui/spawner.test.js`).',
  [
    'tests/js/spawner.test.js',
    'tests/js/spawner-cards.test.js',
    'tests/js/spawner-cockpit.test.js',
    'tests/js/spawner-resupply.test.js',
    'tests/ui/spawner.test.js'
  ],
  path.join(BUNDLES_DIR, 'bundle_tests_js_spawner.md')
);

compileBundle(
  '📦 Fires of Armageddon // Bundle: Unit Tests (Data, RNG & Audio Engine)',
  'Deterministic unit tests for data schemas, Mulberry32 RNG determinism, and Web Audio synthesizers (`tests/js/data.test.js`, `tests/js/rng.test.js`, `tests/js/vox-audio.test.js`).',
  [
    'tests/js/data.test.js',
    'tests/js/rng.test.js',
    'tests/js/vox-audio.test.js'
  ],
  path.join(BUNDLES_DIR, 'bundle_tests_js_core.md')
);

compileBundle(
  '📦 Fires of Armageddon // Bundle: Unit Tests (App Engine & Wave Mechanics)',
  'Unit test suite for app engine state, wave generation, and threat escalation (`tests/js/app.test.js`).',
  ['tests/js/app.test.js'],
  path.join(BUNDLES_DIR, 'bundle_tests_js_app.md')
);

compileBundle(
  '📦 Fires of Armageddon // Bundle: Unit Tests (Game Modes 2, 3, 4, 6 & 7)',
  'Unit tests for PvP, Rogue Sector, Roster Nemeses, Briefing Atlas, and Astropath Vox (`tests/js/briefing.test.js`, `tests/js/pvp.test.js`, `tests/js/rogue.test.js`, `tests/js/roster.test.js`, `tests/js/vox.test.js`).',
  [
    'tests/js/briefing.test.js',
    'tests/js/pvp.test.js',
    'tests/js/rogue.test.js',
    'tests/js/roster.test.js',
    'tests/js/vox.test.js'
  ],
  path.join(BUNDLES_DIR, 'bundle_tests_js_modes.md')
);

// ============================================================================
// 13. BUNDLES DIRECTORY README
// ============================================================================
const bundlesReadme = `# 📦 Modular Codebase Bundles // AI Context-Window Partitioning

This directory contains standalone, subsystem-focused Markdown artifacts compiled deterministically by [\`scripts/generate_bundles.js\`](../scripts/generate_bundles.js) (\`npm run bundle\`).

## 🧠 Technical Purpose & AI Involvement

1. **AI Context-Window Partitioning (Google Gemini & NotebookLM)**:
   - Rather than feeding a monolithic repository dump into an LLM or AI Campaign Master notebook, the codebase is partitioned into **focused, modular bundles strictly $\\le 1000$ lines each (targeting ~800 lines)**.
   - This allows both the live **Astropathic Courier Campaign Master** (Google Gemini / NotebookLM) and **autonomous coding agents** (Google Antigravity) to ingest only the exact vertical slice required for a given game mode or engineering task, maximizing attention recall and minimizing token overhead.
2. **Deterministic Anchor Indexing & Quadruple-Backtick Escaping**:
   - Every bundle generates a deterministic Table of Contents with normalized anchor links (\`#file-...\`) pointing to each constituent source file.
   - Source files are wrapped in **quadruple-backtick** code fences (\` \`\`\`\`lang \`) rather than triple backticks so embedded Markdown documentation (\`README.md\`, \`AGENTS.md\`) and inline code blocks never prematurely terminate the outer AST fence during LLM parsing.
3. **Continuous Synchronization Mandate (\`AGENTS.md\` Principle IX)**:
   - Any modification to any source file in the repository requires immediate regeneration via \`npm run bundle\` and is verified by the automated boundary test suite (\`tests/ui/pages.test.js\`).

---

## 📑 Complete Bundle Directory Manifest

| Bundle Document | Target Scope | Included Files / Slices |
| :--- | :--- | :--- |
| [\`bundle_index.md\`](bundle_index.md) | **Home Launchpad** | \`index.html\` |
| [\`bundle_spawner.md\`](bundle_spawner.md) | **Mode 1 Spawner Terminal** | \`pages/spawner.html\` |
| [\`bundle_spawner_cards.md\`](bundle_spawner_cards.md) | **Threat Cards & Audio FX** | \`js/spawner-cards.js\` |
| [\`bundle_spawner_cockpit.md\`](bundle_spawner_cockpit.md) | **Spawner Cockpit & Telemetry** | \`js/spawner-cockpit.js\` |
| [\`bundle_spawner_engine.md\`](bundle_spawner_engine.md) | **Spawner Engine & Resupply** | \`js/spawner.js\`, \`js/spawner-resupply.js\` |
| [\`bundle_data_rng.md\`](bundle_data_rng.md) | **Data Schemas & Seeded RNG** | \`js/data.js\`, \`js/rng.js\` |
| [\`bundle_app_part1.md\`](bundle_app_part1.md) | **App Engine (State & Factions)** | \`js/app.js\` (Lines 1-700) |
| [\`bundle_app_part2.md\`](bundle_app_part2.md) | **App Engine (Waves & Escalation)** | \`js/app.js\` (Lines 701-1400) |
| [\`bundle_app_part3.md\`](bundle_app_part3.md) | **App Engine (UI & Telemetry)** | \`js/app.js\` (Lines 1401-end) |
| [\`bundle_javascript.md\`](bundle_javascript.md) | **Audio Synth & Oscillators** | \`js/vox-audio.js\` (Lines 1-850) |
| [\`bundle_audio_synth.md\`](bundle_audio_synth.md) | **Sound FX & Teletype Synth** | \`js/vox-audio.js\` (Lines 851-end) |
| [\`bundle_briefing.md\`](bundle_briefing.md) | **Mode 6: Briefing & Ship Slider** | \`pages/briefing.html\` |
| [\`bundle_briefing_css.md\`](bundle_briefing_css.md) | **Mode 6: Briefing Stylesheet** | \`css/briefing.css\` |
| [\`bundle_briefing_js.md\`](bundle_briefing_js.md) | **Mode 6: Sector Atlas & Logic** | \`js/briefing.js\` |
| [\`bundle_pvp.md\`](bundle_pvp.md) | **Mode 2: 1v1 Ash Wastes PvP** | \`pages/pvp.html\`, \`js/pvp.js\` |
| [\`bundle_rogue.md\`](bundle_rogue.md) | **Mode 3: Rogue Sector & AI Tracker** | \`pages/rogue.html\`, \`css/rogue.css\`, \`js/rogue.js\` |
| [\`bundle_roster.md\`](bundle_roster.md) | **Mode 4: Hostile Threat Matrix (Page)**| \`pages/roster.html\`, \`css/roster.css\` |
| [\`bundle_roster_logic.md\`](bundle_roster_logic.md) | **Mode 4: Threat Matrix Logic** | \`js/roster.js\` |
| [\`bundle_crusade.md\`](bundle_crusade.md) | **Mode 5: Crusade Command (Page)** | \`pages/crusade.html\`, \`css/crusade.css\` |
| [\`bundle_crusade_matrix.md\`](bundle_crusade_matrix.md) | **Mode 5: Crusade Matrix & Tabs** | \`js/crusade.js\` |
| [\`bundle_crusade_forge.md\`](bundle_crusade_forge.md) | **Mode 5: Munitorum Forge & Dossier** | \`js/crusade-forge.js\` |
| [\`bundle_crusade_data.md\`](bundle_crusade_data.md) | **Mode 5: Crusade Upgrade Tables** | \`js/crusade-data.js\` |
| [\`bundle_vox.md\`](bundle_vox.md) | **Mode 7: CRT Vox-Terminal (Page)** | \`pages/vox.html\`, \`css/vox.css\` |
| [\`bundle_vox_logic.md\`](bundle_vox_logic.md) | **Mode 7: Vox-Terminal Logic** | \`js/vox.js\` |
| [\`bundle_welcome.md\`](bundle_welcome.md) | **Field Codex & Tutorials** | \`pages/welcome.html\` |
| [\`bundle_css.md\`](bundle_css.md) | **Styles (Part 1: Tokens & Auspex)** | \`css/style.css\` (Lines 1-750) |
| [\`bundle_css_part2.md\`](bundle_css_part2.md) | **Styles (Part 2: Navigation & Cards)** | \`css/style.css\` (Lines 751-1450) |
| [\`bundle_css_part3.md\`](bundle_css_part3.md) | **Styles (Part 3: Spawner & Modals)** | \`css/style.css\` (Lines 1451-2150) |
| [\`bundle_css_part4.md\`](bundle_css_part4.md) | **Styles (Part 4: Utilities & SVG)** | \`css/style.css\` (Lines 2151-end), \`assets/favicon.svg\` |
| [\`bundle_packages.md\`](bundle_packages.md) | **Configs & Engineering Directives** | \`package.json\`, \`wrangler.jsonc\`, \`README.md\`, \`AGENTS.md\`, \`.gitignore\`, \`.env.example\`, \`vox_autopilot.bat\` |
| [\`bundle_bridge.md\`](bundle_bridge.md) | **Courier WebSocket Bridge** | \`vox_bridge.js\` |
| [\`bundle_tests.md\`](bundle_tests.md) | **Pages & Boundary Tests (Part 1: UI & Bundles)** | \`tests/ui/pages.test.js\` (Lines 1-558) |
| [\`bundle_tests_part2.md\`](bundle_tests_part2.md) | **Pages & Boundary Tests (Part 2: Headless Playwright E2E)** | \`tests/ui/pages.test.js\` (Lines 559-end) |
| [\`bundle_tests_ui_overview.md\`](bundle_tests_ui_overview.md) | **UI Tests (Briefing & PvP)** | \`tests/ui/briefing.test.js\`, \`tests/ui/pvp.test.js\` |
| [\`bundle_tests_ui_roster_rogue.md\`](bundle_tests_ui_roster_rogue.md) | **UI Tests (Rogue & Roster)** | \`tests/ui/rogue.test.js\`, \`tests/ui/roster.test.js\` |
| [\`bundle_tests_ui_crusade.md\`](bundle_tests_ui_crusade.md) | **UI Tests (Crusade Command)** | \`tests/ui/crusade.test.js\`, \`tests/js/crusade.test.js\` |
| [\`bundle_tests_ui_forge.md\`](bundle_tests_ui_forge.md) | **UI Tests (Munitorum Forge)** | \`tests/ui/crusade-forge.test.js\` |
| [\`bundle_tests_ui_vox.md\`](bundle_tests_ui_vox.md) | **UI Tests (Vox-Terminal)** | \`tests/ui/vox.test.js\` |
| [\`bundle_tests_bridge.md\`](bundle_tests_bridge.md) | **Courier Bridge Tests** | \`tests/vox_bridge.test.js\` |
| [\`bundle_tests_js_spawner.md\`](bundle_tests_js_spawner.md) | **Tests (Spawner Subsystems & UI Flow)** | \`tests/js/spawner*.test.js\`, \`tests/ui/spawner.test.js\` |
| [\`bundle_tests_js_core.md\`](bundle_tests_js_core.md) | **Unit Tests (Data, RNG & Audio)** | \`tests/js/data.test.js\`, \`tests/js/rng.test.js\`, \`tests/js/vox-audio.test.js\` |
| [\`bundle_tests_js_app.md\`](bundle_tests_js_app.md) | **Unit Tests (App Engine)** | \`tests/js/app.test.js\` |
| [\`bundle_tests_js_modes.md\`](bundle_tests_js_modes.md) | **Unit Tests (Game Modes 2-7)** | \`tests/js/briefing.test.js\`, \`tests/js/pvp.test.js\`, \`tests/js/rogue.test.js\`, \`tests/js/roster.test.js\`, \`tests/js/vox.test.js\` |
`;

fs.writeFileSync(path.join(BUNDLES_DIR, 'README.md'), bundlesReadme, 'utf8');
console.log('Generated bundles/README.md');
