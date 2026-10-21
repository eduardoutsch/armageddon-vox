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

// 1. PAGE 1: Mode 1 Spawner & Tactical Terminal (index.html)
compileBundle(
  '📦 Fires of Armageddon // Bundle: Mode 1 - Tactical Terminal & Spawner',
  'Complete source code for the primary Mode 1 Horde Command tactical terminal and spawner (`index.html`).',
  ['index.html'],
  path.join(BUNDLES_DIR, 'bundle_index.md')
);

// 2. JAVASCRIPT GAME ENGINE & AUDIO
const JS_FILES = [
  'js/data.js',
  'js/rng.js',
  'js/spawner.js',
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
  'tests/js/app.test.js',
  'tests/js/vox-audio.test.js',
  'tests/ui/pages.test.js'
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

// 7. PAGE 5: Rosters & Nemesis Ledger
compileBundle(
  '📦 Fires of Armageddon // Bundle: Rosters & Nemesis Ledger',
  'Complete source code for the Crusade Order of Battle rosters and Cross-Mode Nemesis Ledger (`pages/roster.html`).',
  ['pages/roster.html'],
  path.join(BUNDLES_DIR, 'bundle_roster.md')
);

// 8. PAGE 6: Field Codex & Tutorials
compileBundle(
  '📦 Fires of Armageddon // Bundle: Field Codex & Quickstart Tutorials',
  'Complete source code for the introductory tutorial and field operations manual (`pages/welcome.html`).',
  ['pages/welcome.html'],
  path.join(BUNDLES_DIR, 'bundle_welcome.md')
);

// 9. TACTICAL STYLESHEET & ASSETS
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

// 10. PACKAGES, CONFIGURATION & DOCUMENTATION
const PACKAGE_FILES = [
  'package.json',
  'wrangler.jsonc',
  'README.md',
  'AGENTS.md',
  '.gitignore'
];

compileBundle(
  '📦 Fires of Armageddon // Bundle: Packages, Configuration & Documentation',
  'NPM package manifests, Cloudflare Pages deployment configs, repository documentation, and non-negotiable engineering directives.',
  PACKAGE_FILES,
  path.join(BUNDLES_DIR, 'bundle_packages.md')
);

// 11. BUNDLES DIRECTORY README
const bundlesReadme = `# 📦 Modular Codebase Bundles

This directory contains standalone, page-by-page and component-focused Markdown bundles designed for targeted NotebookLM and Gemini context ingestion.

| Bundle Document | Target Scope | Included Files |
| :--- | :--- | :--- |
| [\`bundle_index.md\`](bundle_index.md) | **Mode 1: Tactical Terminal & Spawner** | \`index.html\` |
| [\`bundle_javascript.md\`](bundle_javascript.md) | **JavaScript Engine & Audio** | \`js/data.js\`, \`js/rng.js\`, \`js/spawner.js\`, \`js/app.js\`, \`js/vox-audio.js\` |
| [\`bundle_tests.md\`](bundle_tests.md) | **Test Suites & Verification** | \`tests/js/*.test.js\`, \`tests/ui/pages.test.js\` |
| [\`bundle_briefing.md\`](bundle_briefing.md) | **Briefings, Ship Slider & Atlas** | \`pages/briefing.html\` |
| [\`bundle_pvp.md\`](bundle_pvp.md) | **Mode 2: 1v1 Ash Wastes PvP** | \`pages/pvp.html\` |
| [\`bundle_rogue.md\`](bundle_rogue.md) | **Mode 3: Rogue Sector & AI Tracker** | \`pages/rogue.html\` |
| [\`bundle_roster.md\`](bundle_roster.md) | **Rosters & Nemesis Ledger** | \`pages/roster.html\` |
| [\`bundle_welcome.md\`](bundle_welcome.md) | **Field Codex & Tutorials** | \`pages/welcome.html\` |
| [\`bundle_css.md\`](bundle_css.md) | **Sanctuary-Noctis Stylesheet & Assets** | \`css/style.css\`, \`assets/favicon.svg\` |
| [\`bundle_packages.md\`](bundle_packages.md) | **Packages, Config & Documentation** | \`package.json\`, \`wrangler.jsonc\`, \`README.md\`, \`AGENTS.md\`, \`.gitignore\` |

`;

fs.writeFileSync(path.join(BUNDLES_DIR, 'README.md'), bundlesReadme, 'utf8');
console.log('Generated bundles/README.md');
