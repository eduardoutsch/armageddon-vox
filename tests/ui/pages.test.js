const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '../../');

function readPage(fileName) {
  return fs.readFileSync(path.join(ROOT_DIR, fileName), 'utf8');
}

test('UI Boundary: index.html is the home launchpad and pages/spawner.html houses Mode 1 modular scripts', () => {
  const indexHtml = readPage('index.html');

  assert.ok(indexHtml.includes('<nav class="suite-nav">'), 'Missing suite navigation bar in index.html');
  assert.ok(indexHtml.includes('href="pages/spawner.html" class="suite-link">🧟 Mode 1: Horde Command &amp; Spawner</a>'));
  assert.ok(indexHtml.includes('href="pages/pvp.html" class="suite-link">⚔️ Mode 2: 1v1 Ash Wastes PvP</a>'));
  assert.ok(indexHtml.includes('href="pages/rogue.html" class="suite-link">🎲 Mode 3: Rogue Sector &amp; AI Tracker</a>'));
  assert.ok(indexHtml.includes('href="pages/roster.html" class="suite-link">🎖️ Mode 4: Hostile Matrix &amp; Nemeses</a>'));
  assert.ok(indexHtml.includes('href="pages/crusade.html" class="suite-link">🏆 Mode 5: Crusade Quartermaster</a>'));
  assert.ok(indexHtml.includes('href="pages/briefing.html" class="suite-link">📜 Mode 6: Briefings, Ship &amp; Atlas</a>'));
  assert.ok(indexHtml.includes('href="pages/vox.html" class="suite-link">📡 Mode 7: Astropath Vox</a>'));

  // Stylesheet and Vox Audio in index.html
  assert.ok(indexHtml.includes('<link rel="stylesheet" href="css/style.css">'));
  assert.ok(indexHtml.includes('<script src="js/vox-audio.js"></script>'), 'index.html must link to js/vox-audio.js');

  // Mode 1 Spawner modular script architecture in pages/spawner.html
  const spawnerHtml = readPage('pages/spawner.html');
  assert.ok(spawnerHtml.includes('<script src="../js/data.js"></script>'));
  assert.ok(spawnerHtml.includes('<script src="../js/rng.js"></script>'));
  assert.ok(spawnerHtml.includes('<script src="../js/spawner.js"></script>'));
  assert.ok(spawnerHtml.includes('<script src="../js/app.js"></script>'));
  assert.ok(spawnerHtml.includes('<script src="../js/vox-audio.js"></script>'), 'spawner.html must link to js/vox-audio.js');
});

test('UI Boundary: all subpages live in /pages and share unified navigation links', () => {
  const subpages = ['spawner.html', 'pvp.html', 'rogue.html', 'roster.html', 'crusade.html', 'briefing.html', 'vox.html', 'welcome.html'];
  const expectedBriefingSnippet = 'href="briefing.html" class="suite-link';
  const expectedRootIndexSnippet = 'href="../index.html" class="suite-link';

  for (const page of subpages) {
    const rootPagePath = path.join(ROOT_DIR, page);
    assert.equal(fs.existsSync(rootPagePath), false, `${page} must not remain loose in repository root`);

    const html = readPage(path.join('pages', page));
    assert.ok(html.includes(expectedRootIndexSnippet), `pages/${page} must link back to ../index.html`);
    assert.ok(html.includes(expectedBriefingSnippet), `pages/${page} missing standard briefing suite-link`);
    assert.ok(
      html.includes('Briefings, Ship &amp; Atlas') || html.includes('Briefings, Ship & Atlas'),
      `pages/${page} navigation text must match Briefings, Ship & Atlas`
    );
    assert.ok(html.includes('<script src="../js/vox-audio.js"></script>'), `pages/${page} must link to ../js/vox-audio.js`);
    assert.ok(html.includes('<link rel="stylesheet" href="../css/style.css">'), `pages/${page} must link to ../css/style.css`);
  }

  const briefingHtml = readPage('pages/briefing.html');
  assert.ok(
    briefingHtml.includes('href="../index.html" class="terminal-link-btn">'),
    'pages/briefing.html terminal button must link to ../index.html'
  );
});

test('All HTML pages link to assets/favicon.svg and apple-touch-icon in /assets', () => {
  const faviconSvgPath = path.join(ROOT_DIR, 'assets/favicon.svg');
  const faviconPngPath = path.join(ROOT_DIR, 'assets/favicon.png');
  assert.ok(fs.existsSync(faviconSvgPath), 'assets/favicon.svg must exist in /assets directory');
  assert.ok(fs.existsSync(faviconPngPath), 'assets/favicon.png must exist in /assets directory');
  assert.equal(fs.existsSync(path.join(ROOT_DIR, 'favicon.svg')), false, 'favicon.svg must not remain in root');
  assert.equal(fs.existsSync(path.join(ROOT_DIR, 'favicon.png')), false, 'favicon.png must not remain in root');

  const indexHtml = readPage('index.html');
  assert.match(
    indexHtml,
    /<link\s+rel="icon"\s+type="image\/svg\+xml"\s+href="assets\/favicon\.svg"\s*\/?>/i,
    'index.html must include <link rel="icon" type="image/svg+xml" href="assets/favicon.svg">'
  );
  assert.match(
    indexHtml,
    /<link\s+rel="apple-touch-icon"\s+href="assets\/favicon\.svg"\s*\/?>/i,
    'index.html must include <link rel="apple-touch-icon" href="assets/favicon.svg">'
  );

  const subpages = ['pages/spawner.html', 'pages/briefing.html', 'pages/pvp.html', 'pages/rogue.html', 'pages/roster.html', 'pages/crusade.html', 'pages/vox.html', 'pages/welcome.html'];
  for (const page of subpages) {
    const html = readPage(page);
    assert.match(
      html,
      /<link\s+rel="icon"\s+type="image\/svg\+xml"\s+href="\.\.\/assets\/favicon\.svg"\s*\/?>/i,
      `${page} must include <link rel="icon" type="image/svg+xml" href="../assets/favicon.svg">`
    );
    assert.match(
      html,
      /<link\s+rel="apple-touch-icon"\s+href="\.\.\/assets\/favicon\.svg"\s*\/?>/i,
      `${page} must include <link rel="apple-touch-icon" href="../assets/favicon.svg">`
    );
  }
});

test('UI Boundary: pages/briefing.html defaults to Commander Beta dossier and includes immersive dispatch without Marauder spoiler', () => {
  const html = readPage('pages/briefing.html');

  // Verify tab switcher defaults to Beta
  assert.match(
    html,
    /<button\s+id="btnBeta"\s+class="active"/i,
    'pages/briefing.html must have #btnBeta active by default'
  );
  assert.doesNotMatch(
    html,
    /<button\s+id="btnAlpha"\s+class="active"/i,
    'pages/briefing.html must not have #btnAlpha active by default'
  );

  // Verify dossier containers default visibility
  assert.match(
    html,
    /<div\s+id="dossierAlpha"\s+class="hidden"/i,
    '#dossierAlpha must have class="hidden" by default'
  );
  assert.match(
    html,
    /<div\s+id="dossierBeta"(?!\s+class="hidden")/i,
    '#dossierBeta must be visible (not hidden) on load'
  );

  // Verify Royal Engram Seal clearance gate and Tomb-Ship Master Matrix / Intercepted Vox sections
  const normHtml = html.replace(/\s+/g, ' ');
  assert.ok(
    normHtml.includes('Tomb-Ship Autonomous Master Matrix &amp; Intercepted Vox'),
    'Must include Tomb-Ship Autonomous Master Matrix & Intercepted Vox title'
  );
  assert.ok(
    normHtml.includes('Royal Engram Seal • Lord Commander Junebug • Restricted Tomb-Ship Dataslate'),
    'Must include Lord Commander Junebug Royal Engram Seal clearance tag'
  );
  assert.ok(
    normHtml.includes('Intercepted Imperial Vox-Transmission (Geostationary Zenith-09)'),
    'Must include Intercepted Imperial Vox-Transmission (Geostationary Zenith-09) section'
  );
  assert.ok(
    html.includes('unlock-btn') && html.includes("unlockTab('Beta')"),
    'Must include unlock button for Beta'
  );
  assert.ok(
    html.includes('lock-toggle-btn') && html.includes("lockTab('Beta')"),
    'Must include lock toggle button for Beta'
  );

  // Verify secret Marauder spoiler is NOT present
  assert.ok(
    !html.includes('and will switch to <strong>⚔️ Marauders</strong> if you claim Gatebreakers'),
    'Briefing must not reveal Alpha switching to Marauders if Beta chooses Gatebreakers'
  );
  assert.ok(
    !html.includes('Commander Alpha (Gatebreakers)'),
    'Briefing must not reveal Alpha choosing Gatebreakers on public Atlas or non-Alpha sections'
  );
});

test('pages/briefing.html contains the 8-Node SVG Sector Map and 3-way Parallel Hegemony Race tracker', () => {
  const html = readPage('pages/briefing.html');

  assert.match(html, /id="armageddon-sector-map"/, 'pages/briefing.html must contain #armageddon-sector-map SVG');
  assert.match(html, /id="atlas-node-inspector"/, 'pages/briefing.html must contain #atlas-node-inspector panel');
  assert.match(html, /id="fullscreenQuickHud"/, 'pages/briefing.html must contain #fullscreenQuickHud telemetry panel');
  assert.match(html, /id="fsHudRule"/, 'pages/briefing.html must contain #fsHudRule strategic intelligence box');
  assert.match(html, /id="heg-bar-alpha"/, 'pages/briefing.html must contain Alpha parallel hegemony bar');
  assert.match(html, /id="heg-bar-beta"/, 'pages/briefing.html must contain Beta parallel hegemony bar');
  assert.match(html, /id="heg-bar-horde"/, 'pages/briefing.html must contain 3rd Alliance parallel hegemony bar');

  // Verify scoreboard in roster.html does not spoil Alpha alliance
  const rosterHtml = readPage('pages/roster.html');
  assert.ok(
    !rosterHtml.includes('Commander Alpha • Gatebreakers'),
    'Global scoreboard in roster.html must not spoil Commander Alpha alliance'
  );

  for (let i = 0; i <= 7; i++) {
    assert.match(
      html,
      new RegExp(`data-node-id="${i}"`),
      `SVG map in pages/briefing.html must include interactive node data-node-id="${i}"`
    );
  }
});

test('UI Boundary: pages integrate localStorage persistence so users can navigate tabs without resetting progress', () => {
  const briefingHtml = readPage('pages/briefing.html');
  assert.ok(briefingHtml.includes('foa_briefing_state_v1'), 'pages/briefing.html must persist state to foa_briefing_state_v1');
  assert.ok(briefingHtml.includes('saveBriefingState'), 'pages/briefing.html must have saveBriefingState');
  assert.ok(briefingHtml.includes('restoreBriefingState'), 'pages/briefing.html must have restoreBriefingState');

  const pvpHtml = readPage('pages/pvp.html');
  assert.ok(pvpHtml.includes('foa_pvp_state_v1'), 'pages/pvp.html must persist state to foa_pvp_state_v1');
  assert.ok(pvpHtml.includes('savePvpState'), 'pages/pvp.html must have savePvpState');
  assert.ok(pvpHtml.includes('restorePvpState'), 'pages/pvp.html must have restorePvpState');

  const rogueHtml = readPage('pages/rogue.html');
  assert.ok(rogueHtml.includes('foa_rogue_state_v1'), 'pages/rogue.html must persist state to foa_rogue_state_v1');
  assert.ok(rogueHtml.includes('saveRogueState'), 'pages/rogue.html must have saveRogueState');
  assert.ok(rogueHtml.includes('restoreRogueState'), 'pages/rogue.html must have restoreRogueState');

  const appJs = fs.readFileSync(path.join(ROOT_DIR, 'js/app.js'), 'utf8');
  assert.ok(appJs.includes('foa_horde_session_v1'), 'app.js must persist session to foa_horde_session_v1');
  assert.ok(appJs.includes('saveSessionState'), 'app.js must define saveSessionState');
  assert.ok(appJs.includes('restoreSessionState'), 'app.js must define restoreSessionState');
});

test('Documentation Boundary: breakdown bundle markdown files exist for each page, module, and package', () => {
  const bundlesDir = path.join(ROOT_DIR, 'bundles');
  assert.ok(fs.existsSync(bundlesDir), 'bundles/ directory must exist');

  const requiredBundles = [
    { file: 'bundle_index.md', check: 'index.html' },
    { file: 'bundle_javascript.md', check: 'js/vox-audio.js' },
    { file: 'bundle_tests.md', check: 'tests/ui/pages.test.js' },
    { file: 'bundle_briefing.md', check: 'pages/briefing.html' },
    { file: 'bundle_pvp.md', check: 'pages/pvp.html' },
    { file: 'bundle_rogue.md', check: 'pages/rogue.html' },
    { file: 'bundle_roster.md', check: 'pages/roster.html' },
    { file: 'bundle_crusade.md', check: 'pages/crusade.html' },
    { file: 'bundle_vox.md', check: 'pages/vox.html' },
    { file: 'bundle_welcome.md', check: 'pages/welcome.html' },
    { file: 'bundle_css.md', check: 'css/style.css' },
    { file: 'bundle_packages.md', check: 'package.json' }
  ];

  for (const b of requiredBundles) {
    const bundlePath = path.join(bundlesDir, b.file);
    assert.ok(fs.existsSync(bundlePath), `${b.file} must exist in bundles/ directory`);
    const content = fs.readFileSync(bundlePath, 'utf8');
    assert.ok(content.length > 500, `${b.file} must not be empty`);
    assert.ok(content.includes(b.check), `${b.file} must contain its target file ${b.check}`);
    assert.equal(content.includes('\0'), false, `${b.file} must not contain null bytes`);
  }

  // Deprecated bundle files must not exist
  assert.equal(
    fs.existsSync(path.join(bundlesDir, 'bundle_css_packages.md')),
    false,
    'bundle_css_packages.md is deprecated in favor of bundle_css.md and bundle_packages.md'
  );
  assert.equal(
    fs.existsSync(path.join(ROOT_DIR, 'codebase_bundle.md')),
    false,
    'codebase_bundle.md is deprecated; project exclusively uses modular bundles in /bundles/'
  );
});

test('UI Boundary: pages/welcome.html provides concise tutorials for all game modes and audio suite', () => {
  const html = readPage('pages/welcome.html');
  assert.ok(
    html.includes('Mode 1: Horde Command &amp; Automated Spawner') ||
    html.includes('Mode 1: Horde Command & Automated Spawner'),
    'welcome.html must explain Mode 1'
  );
  assert.ok(html.includes('Mode 2: 1v1 Ash Wastes PvP'), 'welcome.html must explain Mode 2');
  assert.ok(html.includes('Mode 3: Rogue Sector'), 'welcome.html must explain Mode 3');
  assert.ok(html.includes('Mode 4: Hostile Matrix'), 'welcome.html must explain Mode 4');
  assert.ok(html.includes('Mode 5: Crusade Quartermaster'), 'welcome.html must explain Mode 5');
  assert.ok(html.includes('Mode 6: Commander Briefings') || html.includes('Mode 6: Briefings'), 'welcome.html must explain Mode 6');
  assert.ok(html.includes('Mode 7: Astropathic CRT Vox-Sanctum') || html.includes('Mode 7: Astropath Vox'), 'welcome.html must explain Mode 7');
  assert.ok(html.includes('Vox-Caster Ambience'), 'welcome.html must explain audio features');
  assert.ok(html.includes('<link rel="stylesheet" href="../css/style.css">'), 'welcome.html must link to style.css');
  assert.ok(html.includes('<script src="../js/vox-audio.js"></script>'), 'welcome.html must link to vox-audio.js');
  assert.ok(html.includes('http-equiv="refresh"') && html.includes('url=../index.html'), 'welcome.html must redirect to index.html');
});

test('UI Boundary: index.html serves as the centered Field Codex home launchpad', () => {
  const html = readPage('index.html');
  assert.ok(html.includes('The Fires of Armageddon'), 'index.html must display campaign title');
  assert.ok(html.includes('New Commander Induction Protocol'), 'index.html must feature onboarding protocol');
  assert.ok(html.includes('welcome-btn-row'), 'index.html must feature centered action button rows');
  assert.ok(html.includes('pages/spawner.html'), 'index.html must link to Mode 1 spawner');
  assert.ok(html.includes('pages/pvp.html'), 'index.html must link to Mode 2 1v1 PvP');
  assert.ok(html.includes('pages/rogue.html'), 'index.html must link to Mode 3 Rogue AI');
  assert.ok(html.includes('pages/roster.html'), 'index.html must link to Mode 4 Hostile Matrix');
  assert.ok(html.includes('pages/crusade.html'), 'index.html must link to Mode 5 Crusade Quartermaster');
  assert.ok(html.includes('pages/briefing.html'), 'index.html must link to Mode 6 Briefings');
  assert.ok(html.includes('pages/vox.html'), 'index.html must link to Mode 7 Vox');
});

test('UI Script Boundary: HTML script sequences parse cleanly in shared scope without duplicate identifier declarations', () => {
  const vm = require('node:vm');
  const pages = [
    'index.html',
    'pages/spawner.html',
    'pages/pvp.html',
    'pages/rogue.html',
    'pages/roster.html',
    'pages/crusade.html',
    'pages/briefing.html',
    'pages/vox.html',
    'pages/welcome.html'
  ];

  for (const p of pages) {
    const html = readPage(p);
    const dir = path.dirname(path.join(ROOT_DIR, p));
    const scriptRegex = /<script\b([^>]*)>([\s\S]*?)<\/script>/gi;
    let match;
    const scriptContents = [];

    while ((match = scriptRegex.exec(html)) !== null) {
      const attrs = match[1] || '';
      const inlineCode = match[2] || '';
      const srcMatch = attrs.match(/src=["']([^"']+)["']/i);
      if (srcMatch) {
        const srcPath = path.resolve(dir, srcMatch[1]);
        if (fs.existsSync(srcPath)) {
          scriptContents.push(fs.readFileSync(srcPath, 'utf8'));
        }
      } else if (inlineCode.trim()) {
        scriptContents.push(inlineCode);
      }
    }

    // Concatenate all scripts that run sequentially in this HTML page into a single lexical script block
    const concatenatedCode = scriptContents.join('\n;\n');
    assert.doesNotThrow(() => {
      new vm.Script(concatenatedCode, { filename: `${p}-concatenated-scripts.js` });
    }, `Scripts in ${p} must not contain top-level duplicate identifier declarations (e.g. const/let collisions)`);
  }
});

/**
 * Launches a headless Playwright browser, falling back to system Chrome or Edge
 * when the standalone Playwright Chromium binary is not installed locally.
 */
async function launchTestBrowser() {
  const { chromium } = require('playwright');
  for (const opts of [{ headless: true }, { channel: 'chrome', headless: true }, { channel: 'msedge', headless: true }]) {
    try {
      return await chromium.launch(opts);
    } catch (_) {}
  }
  throw new Error('Could not launch headless Chromium, Chrome, or Edge for UI integration test');
}

test('UI Browser Integration: all HTML pages load in headless browser with zero uncaught page errors', async () => {
  const browser = await launchTestBrowser();
  const page = await browser.newPage();

  const pages = [
    'index.html',
    'pages/spawner.html',
    'pages/pvp.html',
    'pages/rogue.html',
    'pages/roster.html',
    'pages/crusade.html',
    'pages/briefing.html',
    'pages/vox.html',
    'pages/welcome.html'
  ];

  try {
    for (const p of pages) {
      const pageErrors = [];
      const errorListener = (err) => pageErrors.push(err.message);
      page.on('pageerror', errorListener);

      const filePath = 'file:///' + path.resolve(ROOT_DIR, p).replace(/\\/g, '/');
      await page.goto(filePath, { waitUntil: 'load' });

      assert.equal(
        pageErrors.length,
        0,
        `Page ${p} threw uncaught browser errors on load: ${pageErrors.join(' | ')}`
      );

      page.off('pageerror', errorListener);
    }
  } finally {
    await browser.close();
  }
});

test('UI Boundary: pages/roster.html loads with live dossier preview, active tab 1, and interactive submenu navigation', async () => {
  const browser = await launchTestBrowser();
  const page = await browser.newPage();

  const filePath = 'file:///' + path.resolve(ROOT_DIR, 'pages/roster.html').replace(/\\/g, '/');

  try {
    const pageErrors = [];
    page.on('pageerror', (err) => pageErrors.push(err.message));
    await page.goto(filePath, { waitUntil: 'load' });

    assert.equal(pageErrors.length, 0, `pages/roster.html must have zero browser page errors: ${pageErrors.join(' | ')}`);

    // 1. Initial preview text verification
    const initialPreview = await page.evaluate(() => document.getElementById('nemDossierPreview')?.textContent || '');
    assert.ok(initialPreview.length > 50, 'Preview box must contain initial dossier example text on load');
    assert.ok(initialPreview.includes('ORDO MALLEUS'), 'Preview must feature ORDO MALLEUS banner');
    assert.ok(initialPreview.includes('FILING COMMANDER'), 'Preview must feature filing commander field');

    // 2. Tab 1 is active by default
    const isTab1Active = await page.evaluate(() => document.getElementById('rosTabBtn1')?.classList.contains('active'));
    const isTabNemesisVisible = await page.evaluate(() => !document.getElementById('rosTabNemesis')?.classList.contains('hidden'));
    assert.equal(isTab1Active, true, 'Tab 1 button must be active by default');
    assert.equal(isTabNemesisVisible, true, 'Tab Nemesis panel must be visible by default');

    // 3. Switch to Tab 2 (Unbound Adversaries)
    await page.click('#rosTabBtn2');
    const isTab2Active = await page.evaluate(() => document.getElementById('rosTabBtn2')?.classList.contains('active'));
    const isTabUnboundVisible = await page.evaluate(() => !document.getElementById('rosTabUnbound')?.classList.contains('hidden'));
    const isTabNemesisHidden = await page.evaluate(() => document.getElementById('rosTabNemesis')?.classList.contains('hidden'));
    assert.equal(isTab2Active, true, 'Tab 2 button must become active after click');
    assert.equal(isTabUnboundVisible, true, 'Tab Unbound panel must become visible after clicking Tab 2');
    assert.equal(isTabNemesisHidden, true, 'Tab Nemesis panel must be hidden after switching to Tab 2');

    // 4. Switch to Tab 3 (Brackets & Cloud Pool)
    await page.click('#rosTabBtn3');
    const isTab3Active = await page.evaluate(() => document.getElementById('rosTabBtn3')?.classList.contains('active'));
    const isTabBracketsVisible = await page.evaluate(() => !document.getElementById('rosTabBrackets')?.classList.contains('hidden'));
    assert.equal(isTab3Active, true, 'Tab 3 button must become active after click');
    assert.equal(isTabBracketsVisible, true, 'Tab Brackets panel must become visible after clicking Tab 3');

    // 5. Switch back to Tab 1
    await page.click('#rosTabBtn1');
    const isTab1Restored = await page.evaluate(() => !document.getElementById('rosTabNemesis')?.classList.contains('hidden'));
    assert.equal(isTab1Restored, true, 'Tab 1 panel must restore visibility when clicked');

    // 6. Live update preview upon user input
    await page.fill('#nemReportUnit', 'Tyranids — Screamer-Killer Test Unit');
    await page.fill('#nemReportNotes', 'Weathered two melta shots and eliminated heavy infantry.');
    const updatedPreview = await page.evaluate(() => document.getElementById('nemDossierPreview')?.textContent || '');
    assert.ok(updatedPreview.includes('Tyranids — Screamer-Killer Test Unit'), 'Preview must update with entered unit');
    assert.ok(updatedPreview.includes('Weathered two melta shots'), 'Preview must update with entered notes');
  } finally {
    await browser.close();
  }
});

test('E2E Integration: seamless router supports multi-page navigation (vox -> roster -> vox -> roster) with zero syntax errors and responsive button interactions', async () => {
  const http = require('node:http');
  const server = http.createServer((req, res) => {
    let reqPath = req.url.split('?')[0];
    if (reqPath === '/') reqPath = '/index.html';
    const filePath = path.join(ROOT_DIR, reqPath);
    if (fs.existsSync(filePath)) {
      if (filePath.endsWith('.html')) res.setHeader('Content-Type', 'text/html');
      else if (filePath.endsWith('.js')) res.setHeader('Content-Type', 'application/javascript');
      else if (filePath.endsWith('.css')) res.setHeader('Content-Type', 'text/css');
      res.writeHead(200);
      res.end(fs.readFileSync(filePath));
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  });

  const port = await new Promise((resolve) => {
    server.listen(0, () => resolve(server.address().port));
  });

  let browser;
  const pageErrors = [];

  try {
    browser = await launchTestBrowser();
    const page = await browser.newPage();
    page.on('pageerror', (err) => pageErrors.push(err.message));

    // 1. Initial load on vox.html
    await page.goto(`http://localhost:${port}/pages/vox.html`);
    await page.waitForTimeout(300);

    // 2. Seamlessly navigate to roster.html
    const rosterLink = await page.$('a[href*="roster.html"]');
    assert.ok(rosterLink, 'Roster link must exist in navigation bar');
    await rosterLink.click();
    await page.waitForTimeout(400);

    // 3. Verify roster functions are defined and not aborted by syntax error
    const switchTabType = await page.evaluate(() => typeof window.switchRosterTab);
    assert.equal(switchTabType, 'function', 'window.switchRosterTab must be defined on window after seamless navigation');

    // 4. Click Tab 2 (Unbound Adversaries) and verify visibility
    await page.click('#rosTabBtn2');
    let isTab2Active = await page.evaluate(() => document.getElementById('rosTabBtn2')?.classList.contains('active'));
    let isTabUnboundVisible = await page.evaluate(() => !document.getElementById('rosTabUnbound')?.classList.contains('hidden'));
    assert.equal(isTab2Active, true, 'Tab 2 button must become active after click');
    assert.equal(isTabUnboundVisible, true, 'Tab Unbound panel must be visible');

    // 5. Click Tab 3 (Horde Brackets)
    await page.click('#rosTabBtn3');
    let isTabBracketsVisible = await page.evaluate(() => !document.getElementById('rosTabBrackets')?.classList.contains('hidden'));
    assert.equal(isTabBracketsVisible, true, 'Tab Brackets panel must be visible');

    // 6. Click Save Shelf Barracks button
    const saveBtn = await page.$('button[onclick="saveShelfBarracks()"]');
    assert.ok(saveBtn, 'Save Shelf Barracks button must exist');
    await saveBtn.click();

    // 7. Navigate back to vox.html
    const voxLink = await page.$('a[href*="vox.html"]');
    assert.ok(voxLink, 'Vox link must exist in navigation bar');
    await voxLink.click();
    await page.waitForTimeout(400);

    // 8. Re-visit roster.html to verify no re-declaration syntax collision
    const returnRosterLink = await page.$('a[href*="roster.html"]');
    await returnRosterLink.click();
    await page.waitForTimeout(400);

    // 9. Click Tab 2 again on re-visited roster
    await page.click('#rosTabBtn2');
    isTab2Active = await page.evaluate(() => document.getElementById('rosTabBtn2')?.classList.contains('active'));
    isTabUnboundVisible = await page.evaluate(() => !document.getElementById('rosTabUnbound')?.classList.contains('hidden'));
    assert.equal(isTab2Active, true, 'Tab 2 button must remain responsive on re-visited page');
    assert.equal(isTabUnboundVisible, true, 'Tab Unbound panel must be visible on re-visited page');

    // 10. Switch back to Tab 1
    await page.click('#rosTabBtn1');
    const isTabNemesisVisible = await page.evaluate(() => !document.getElementById('rosTabNemesis')?.classList.contains('hidden'));
    assert.equal(isTabNemesisVisible, true, 'Tab 1 panel must restore visibility on re-visited page');

    // Filter out potential 401 Supabase unauthenticated RPC noise
    const syntaxErrors = pageErrors.filter((e) => !e.includes('401'));
    assert.deepEqual(syntaxErrors, [], 'Must encounter 0 page errors or syntax errors during seamless navigation');
  } finally {
    if (browser) await browser.close();
    server.close();
  }
});

test('Documentation Boundary: README.md and bundles/README.md provide technical architecture deep-dives and explicit AI involvement disclosures', () => {
  const rootReadme = readPage('README.md');
  const bundlesReadme = readPage('bundles/README.md');

  // Root README technical sections & AI involvement disclosure
  assert.ok(rootReadme.includes('System Architecture'), 'README.md must include a System Architecture section');
  assert.ok(rootReadme.includes('AI Involvement & Human-AI Collaboration'), 'README.md must disclose AI involvement at runtime and development time');
  assert.ok(rootReadme.includes('Functional Core, Imperative Shell'), 'README.md must document the Functional Core / Dumb UI architecture');
  assert.ok(rootReadme.includes('mulberry32'), 'README.md must document the deterministic mulberry32 PRNG engine');
  assert.ok(rootReadme.includes('Web Audio API'), 'README.md must document the procedural Web Audio API synthesizer');
  assert.ok(rootReadme.includes('vox_server_heartbeat'), 'README.md must document the Supabase RPC & live server heartbeat architecture');

  // Bundles README technical context & AI ingestion explanation
  assert.ok(bundlesReadme.includes('AI Context-Window Partitioning'), 'bundles/README.md must explain the AI context-window partitioning architecture');
  assert.ok(bundlesReadme.includes('quadruple-backtick'), 'bundles/README.md must document the quadruple-backtick escaping mechanism');
});

test('UI Boundary: pages/spawner.html HUD bar keeps room info and cloud sync badge aligned on a single row without wrapping', () => {
  const spawnerHtml = readPage('pages/spawner.html');
  const css = readPage('css/style.css');

  // Verify .cloud-sync-pill is defined in global css with white-space: nowrap
  assert.ok(css.includes('.cloud-sync-pill'), 'css/style.css must define .cloud-sync-pill');
  assert.match(
    css,
    /\.cloud-sync-pill[\s\S]*?white-space:\s*nowrap;/,
    '.cloud-sync-pill must enforce white-space: nowrap to prevent broken multiline badges'
  );

  // Verify HUD bar session info row enforces nowrap and alignment
  assert.match(
    spawnerHtml,
    /<div[^>]*style="[^"]*display:\s*flex;[^"]*align-items:\s*center;[^"]*white-space:\s*nowrap;[^"]*"[^>]*>[\s\S]*?id="hudSessionInfo"[\s\S]*?id="spawnerSyncBadge"/,
    'HUD room info row must align hudSessionInfo and spawnerSyncBadge with white-space: nowrap'
  );

  // Verify hudRound has clean alignment
  assert.match(
    spawnerHtml,
    /id="hudRound"[^>]*style="[^"]*text-align:\s*left;/,
    '#hudRound must have text-align: left so round title aligns cleanly under room label'
  );
});






