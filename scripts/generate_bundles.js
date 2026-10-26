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

function getAnchor(filePath) {
  return 'file-' + filePath.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}

function compileBundle(title, description, fileList, targetPath) {
  let out = `# ${title}\n\n`;
  out += `${description}\n\n`;
  out += `## 📑 Table of Contents\n`;

  for (const f of fileList) {
    out += `- [${f}](#${getAnchor(f)})\n`;
  }

  for (const f of fileList) {
    const fullPath = path.join(ROOT_DIR, f);
    const content = fs.readFileSync(fullPath, 'utf8');
    const lang = getLang(f);
    const anchor = getAnchor(f);

    out += `\n---\n\n`;
    out += `## File: \`${f}\` <a id="${anchor}"></a>\n\n`;
    out += `\`\`\`\`${lang}\n`;
    out += content;
    if (!content.endsWith('\n')) out += '\n';
    out += `\`\`\`\`\n`;
  }

  fs.writeFileSync(targetPath, out, 'utf8');
  console.log(`Bundle generated: ${path.relative(ROOT_DIR, targetPath)} (${out.length} characters)`);
}

// Clean up deprecated bundle_css_packages.md if present
const deprecatedCssPackages = path.join(BUNDLES_DIR, 'bundle_css_packages.md');
if (fs.existsSync(deprecatedCssPackages)) {
  fs.unlinkSync(deprecatedCssPackages);
}

// 1. PAGE 1: Home Launchpad & Mode 1 Spawner (index.html, pages/spawner.html)
compileBundle(
  '📦 Fires of Armageddon // Bundle: Home Launchpad & Mode 1 Spawner',
  'Complete source code for the primary Sanctuary Field Codex home launchpad (`index.html`) and the Mode 1 Horde Command tactical terminal and spawner (`pages/spawner.html`).',
  ['index.html', 'pages/spawner.html'],
  path.join(BUNDLES_DIR, 'bundle_index.md')
);

// 2. JAVASCRIPT GAME ENGINE & AUDIO
const JS_FILES = [
  'js/data.js',
  'js/rng.js',
  'js/spawner.js',
  'js/spawner-cards.js',
  'js/spawner-cockpit.js',
  'js/spawner-resupply.js',
  'js/app.js',
  'js/vox-audio.js'
];

compileBundle(
  '📦 Fires of Armageddon // Bundle: JavaScript Game Engine & Audio',
  'Core logic, RNG algorithms, spawner mechanics, state management, faction/mission datasets, and Vox-Caster Web Audio synth (`js/*.js`).',
  JS_FILES,
  path.join(BUNDLES_DIR, 'bundle_javascript.md')
);

// 3. TEST SUITES & VERIFICATION
const TEST_FILES = [
  'tests/js/data.test.js',
  'tests/js/rng.test.js',
  'tests/js/spawner.test.js',
  'tests/js/spawner-cards.test.js',
  'tests/js/spawner-cockpit.test.js',
  'tests/js/spawner-resupply.test.js',
  'tests/js/app.test.js',
  'tests/js/vox-audio.test.js',
  'tests/vox_bridge.test.js',
  'tests/ui/pages.test.js',
  'tests/ui/briefing.test.js',
  'tests/ui/pvp.test.js',
  'tests/ui/rogue.test.js',
  'tests/ui/roster.test.js',
  'tests/ui/crusade.test.js',
  'tests/ui/vox.test.js'
];

compileBundle(
  '📦 Fires of Armageddon // Bundle: Test Suites & Verification',
  'Unit, boundary, integration, and UI verification test suites for all game modes, data schemas, RNG determinism, and page requirements (`tests/**/*.test.js`).',
  TEST_FILES,
  path.join(BUNDLES_DIR, 'bundle_tests.md')
);

// 4. PAGE 2: Briefing & Ship Slider
compileBundle(
  '📦 Fires of Armageddon // Bundle: Briefings, Ship Slider & Sector Atlas',
  'Complete source code for Commander Alpha & Beta briefings, interactive SHIP.md slider, and the 8-node Sector Atlas (`pages/briefing.html`).',
  ['pages/briefing.html'],
  path.join(BUNDLES_DIR, 'bundle_briefing.md')
);

// 5. PAGE 3: Mode 2 PvP
compileBundle(
  '📦 Fires of Armageddon // Bundle: Mode 2 - 1v1 Ash Wastes PvP',
  'Complete source code for the 1v1 Ash Wastes PvP module, Hellscapes, Warp Storm Anomalies, and Unbound Adversaries (`pages/pvp.html`).',
  ['pages/pvp.html'],
  path.join(BUNDLES_DIR, 'bundle_pvp.md')
);

// 6. PAGE 4: Mode 3 Rogue Sector & AI Tracker
compileBundle(
  '📦 Fires of Armageddon // Bundle: Mode 3 - Rogue Sector & AI Tracker',
  'Complete source code for the autonomous AI Turn Sequencer and Rogue Sector impact reference (`pages/rogue.html`).',
  ['pages/rogue.html'],
  path.join(BUNDLES_DIR, 'bundle_rogue.md')
);

// 7. PAGE 5: Mode 4 Hostile Threat Matrix & Nemeses
compileBundle(
  '📦 Fires of Armageddon // Bundle: Mode 4 - Hostile Matrix & Nemesis Archive',
  'Complete source code for the Hostile Threat Matrix, Cross-Mode Nemesis Bounty Ledger, Nemesis Dossier Induction Compiler, Unbound Datasheets, and Custom Shelf Pool (`pages/roster.html`).',
  ['pages/roster.html'],
  path.join(BUNDLES_DIR, 'bundle_roster.md')
);

// 8. PAGE 6: Mode 5 Crusade Quartermaster
compileBundle(
  '📦 Fires of Armageddon // Bundle: Mode 5 - Crusade Command & Quartermaster',
  'Complete source code for the 3-Way Alliance Scoreboard, 4-Phase Branching Narrative Trees, Random Upgrade Rollers (Traits, Mods, Relics, Scars), and Master Battle Dossier Compiler (`pages/crusade.html`).',
  ['pages/crusade.html'],
  path.join(BUNDLES_DIR, 'bundle_crusade.md')
);

// 9. PAGE 7: Mode 7 Astropath Vox
compileBundle(
  '📦 Fires of Armageddon // Bundle: Mode 7 - Astropathic CRT Vox-Terminal',
  'Complete source code for the Astropathic CRT Vox-Terminal, Conduit Pass-Seal Security, Real-Time Teletype Audio Streaming, and Interferences Array (`pages/vox.html`).',
  ['pages/vox.html'],
  path.join(BUNDLES_DIR, 'bundle_vox.md')
);

// 10. PAGE 8: Field Codex & Tutorials
compileBundle(
  '📦 Fires of Armageddon // Bundle: Field Codex & Quickstart Tutorials',
  'Complete source code for the introductory tutorial and field operations manual (`pages/welcome.html`).',
  ['pages/welcome.html'],
  path.join(BUNDLES_DIR, 'bundle_welcome.md')
);

// 11. TACTICAL STYLESHEET & ASSETS
const CSS_FILES = [
  'css/style.css',
  'assets/favicon.svg'
];

compileBundle(
  '📦 Fires of Armageddon // Bundle: Sanctuary-Noctis Tactical Stylesheet & Assets',
  'Unified Tactical Stylesheet ("Sanctuary-Noctis Hybrid"), typography tokens, chamfered iron cards, Auspex CRT screens, and SVG icons (`css/style.css`, `assets/favicon.svg`).',
  CSS_FILES,
  path.join(BUNDLES_DIR, 'bundle_css.md')
);

// 12. PACKAGES, CONFIGURATION & DOCUMENTATION
const PACKAGE_FILES = [
  'package.json',
  'wrangler.jsonc',
  'README.md',
  'AGENTS.md',
  '.gitignore',
  '.env.example',
  'vox_bridge.js',
  'vox_autopilot.bat'
];

compileBundle(
  '📦 Fires of Armageddon // Bundle: Packages, Configuration & Documentation',
  'NPM package manifests, Cloudflare Pages deployment configs, repository documentation, and non-negotiable engineering directives.',
  PACKAGE_FILES,
  path.join(BUNDLES_DIR, 'bundle_packages.md')
);

// 13. BUNDLES DIRECTORY README
const bundlesReadme = `# 📦 Modular Codebase Bundles // AI Context-Window Partitioning

This directory contains standalone, page-by-page and subsystem-focused Markdown artifacts compiled deterministically by [\`scripts/generate_bundles.js\`](../scripts/generate_bundles.js) (\`npm run bundle\`).

## 🧠 Technical Purpose & AI Involvement

1. **AI Context-Window Partitioning (Google Gemini & NotebookLM)**:
   - Rather than feeding a monolithic repository dump into an LLM or AI Campaign Master notebook, the codebase is partitioned into **12 domain-scoped Markdown bundles**.
   - This allows both the live **Astropathic Courier Campaign Master** (Google Gemini / NotebookLM) and **autonomous coding agents** (Google Antigravity) to ingest only the exact vertical slice required for a given game mode or engineering task, maximizing attention recall and minimizing token overhead.
2. **Deterministic Anchor Indexing & Quadruple-Backtick Escaping**:
   - Every bundle generates a deterministic Table of Contents with normalized anchor links (\`#file-...\`) pointing to each constituent source file.
   - Source files are wrapped in **quadruple-backtick** code fences (\` \`\`\`\`lang \`) rather than triple backticks so embedded Markdown documentation (\`README.md\`, \`AGENTS.md\`) and inline code blocks never prematurely terminate the outer AST fence during LLM parsing.
3. **Continuous Synchronization Mandate (\`AGENTS.md\` Principle IX)**:
   - Any modification to any source file in the repository requires immediate regeneration via \`npm run bundle\` and is verified by the automated boundary test suite (\`tests/ui/pages.test.js\`).

---

## 📑 Bundle Manifest

| Bundle Document | Target Scope | Included Files |
| :--- | :--- | :--- |
| [\`bundle_index.md\`](bundle_index.md) | **Home Launchpad & Mode 1 Spawner** | \`index.html\`, \`pages/spawner.html\` |
| [\`bundle_javascript.md\`](bundle_javascript.md) | **JavaScript Functional Core & Audio Synth** | \`js/data.js\`, \`js/rng.js\`, \`js/spawner.js\`, \`js/app.js\`, \`js/vox-audio.js\` |
| [\`bundle_tests.md\`](bundle_tests.md) | **Automated Verification Suites (171 Tests)** | \`tests/**/*.test.js\` |
| [\`bundle_briefing.md\`](bundle_briefing.md) | **Mode 6: Briefings, Ship Slider & SVG Atlas** | \`pages/briefing.html\` |
| [\`bundle_pvp.md\`](bundle_pvp.md) | **Mode 2: 1v1 Ash Wastes PvP & Vulture Report** | \`pages/pvp.html\` |
| [\`bundle_rogue.md\`](bundle_rogue.md) | **Mode 3: Rogue Sector & AI State Machine** | \`pages/rogue.html\` |
| [\`bundle_roster.md\`](bundle_roster.md) | **Mode 4: Hostile Matrix, Nemeses & Cloud Pools** | \`pages/roster.html\` |
| [\`bundle_crusade.md\`](bundle_crusade.md) | **Mode 5: Crusade Quartermaster & Tour of Duty** | \`pages/crusade.html\` |
| [\`bundle_vox.md\`](bundle_vox.md) | **Mode 7: Astropathic CRT Vox-Terminal** | \`pages/vox.html\` |
| [\`bundle_welcome.md\`](bundle_welcome.md) | **Field Codex & Quickstart Tutorials** | \`pages/welcome.html\` |
| [\`bundle_css.md\`](bundle_css.md) | **Sanctuary-Noctis Stylesheet & Vector Assets** | \`css/style.css\`, \`assets/favicon.svg\` |
| [\`bundle_packages.md\`](bundle_packages.md) | **Courier Bridge, Configs & Engineering Rules** | \`package.json\`, \`wrangler.jsonc\`, \`README.md\`, \`AGENTS.md\`, \`.gitignore\`, \`.env.example\`, \`vox_bridge.js\`, \`vox_autopilot.bat\` |
`;

fs.writeFileSync(path.join(BUNDLES_DIR, 'README.md'), bundlesReadme, 'utf8');
console.log('Generated bundles/README.md');


