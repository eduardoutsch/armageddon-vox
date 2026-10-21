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

// 1. MASTER BUNDLE: codebase_bundle.md
const MASTER_FILES = [
  'package.json',
  'wrangler.jsonc',
  '.gitignore',
  'README.md',
  'AGENTS.md',
  'index.html',
  'pages/briefing.html',
  'pages/pvp.html',
  'pages/rogue.html',
  'pages/roster.html',
  'assets/favicon.svg',
  'css/style.css',
  'js/data.js',
  'js/rng.js',
  'js/spawner.js',
  'js/app.js',
  'tests/js/data.test.js',
  'tests/js/rng.test.js',
  'tests/js/spawner.test.js',
  'tests/js/app.test.js',
  'tests/ui/pages.test.js'
];

compileBundle(
  '📦 Fires of Armageddon // Complete Codebase Bundle',
  'All project files compiled into a single document for Gemini / NotebookLM ingestion.',
  MASTER_FILES,
  path.join(ROOT_DIR, 'codebase_bundle.md')
);

// 2. PAGE 1: Mode 1 Spawner & Tactical Terminal (index.html + JS core + test suites)
const INDEX_FILES = [
  'index.html',
  'js/data.js',
  'js/rng.js',
  'js/spawner.js',
  'js/app.js',
  'tests/js/data.test.js',
  'tests/js/rng.test.js',
  'tests/js/spawner.test.js',
  'tests/js/app.test.js',
  'tests/ui/pages.test.js'
];

compileBundle(
  '📦 Fires of Armageddon // Bundle: Mode 1 - Tactical Terminal & Spawner',
  'Complete source code and test suites for the primary Mode 1 Horde Command terminal and spawner (`index.html`).',
  INDEX_FILES,
  path.join(BUNDLES_DIR, 'bundle_index.md')
);

// 3. PAGE 2: Briefing & Ship Slider
compileBundle(
  '📦 Fires of Armageddon // Bundle: Briefings, Ship Slider & Sector Atlas',
  'Complete source code for Commander Alpha & Beta briefings, interactive SHIP.md slider, and the 8-node Sector Atlas (`pages/briefing.html`).',
  ['pages/briefing.html'],
  path.join(BUNDLES_DIR, 'bundle_briefing.md')
);

// 4. PAGE 3: Mode 2 PvP
compileBundle(
  '📦 Fires of Armageddon // Bundle: Mode 2 - 1v1 Ash Wastes PvP',
  'Complete source code for the 1v1 Ash Wastes PvP module, Hellscapes, Warp Storm Anomalies, and Unbound Adversaries (`pages/pvp.html`).',
  ['pages/pvp.html'],
  path.join(BUNDLES_DIR, 'bundle_pvp.md')
);

// 5. PAGE 4: Mode 3 Rogue Sector & AI Tracker
compileBundle(
  '📦 Fires of Armageddon // Bundle: Mode 3 - Rogue Sector & AI Tracker',
  'Complete source code for the autonomous AI Turn Sequencer and Rogue Sector impact reference (`pages/rogue.html`).',
  ['pages/rogue.html'],
  path.join(BUNDLES_DIR, 'bundle_rogue.md')
);

// 6. PAGE 5: Rosters & Nemesis Ledger
compileBundle(
  '📦 Fires of Armageddon // Bundle: Rosters & Nemesis Ledger',
  'Complete source code for the Crusade Order of Battle rosters and Cross-Mode Nemesis Ledger (`pages/roster.html`).',
  ['pages/roster.html'],
  path.join(BUNDLES_DIR, 'bundle_roster.md')
);

// 7. CSS & PACKAGES
const CSS_PACKAGE_FILES = [
  'css/style.css',
  'package.json',
  'wrangler.jsonc',
  'assets/favicon.svg',
  'README.md',
  'AGENTS.md',
  '.gitignore'
];

compileBundle(
  '📦 Fires of Armageddon // Bundle: Stylesheet, Configuration & Packages',
  'Global typography, design system tokens, Cloudflare Pages config, project metadata, and engineering rules.',
  CSS_PACKAGE_FILES,
  path.join(BUNDLES_DIR, 'bundle_css_packages.md')
);

// 8. BUNDLES DIRECTORY README
const bundlesReadme = `# 📦 Modular Codebase Bundles

This directory contains standalone, page-by-page and component-focused Markdown bundles designed for targeted NotebookLM and Gemini context ingestion.

| Bundle Document | Target Scope | Included Files |
| :--- | :--- | :--- |
| [\`bundle_index.md\`](bundle_index.md) | **Mode 1: Tactical Terminal & Spawner** | \`index.html\`, \`js/*.js\`, \`tests/**/*.js\` |
| [\`bundle_briefing.md\`](bundle_briefing.md) | **Briefings, Ship Slider & Atlas** | \`pages/briefing.html\` |
| [\`bundle_pvp.md\`](bundle_pvp.md) | **Mode 2: 1v1 Ash Wastes PvP** | \`pages/pvp.html\` |
| [\`bundle_rogue.md\`](bundle_rogue.md) | **Mode 3: Rogue Sector & AI Tracker** | \`pages/rogue.html\` |
| [\`bundle_roster.md\`](bundle_roster.md) | **Rosters & Nemesis Ledger** | \`pages/roster.html\` |
| [\`bundle_css_packages.md\`](bundle_css_packages.md) | **Stylesheets, Config & Packages** | \`css/style.css\`, \`package.json\`, \`wrangler.jsonc\`, \`assets/favicon.svg\`, \`README.md\`, \`AGENTS.md\`, \`.gitignore\` |

*For the unified, single-file bundle containing the entire repository, see [\`../codebase_bundle.md\`](../codebase_bundle.md).*
`;

fs.writeFileSync(path.join(BUNDLES_DIR, 'README.md'), bundlesReadme, 'utf8');
console.log('Generated bundles/README.md');
