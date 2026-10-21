const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '../../');

function readPage(fileName) {
  return fs.readFileSync(path.join(ROOT_DIR, fileName), 'utf8');
}

test('UI Boundary: index.html has complete navigation, stylesheets, and modular scripts', () => {
  const html = readPage('index.html');

  assert.ok(html.includes('<nav class="suite-nav">'), 'Missing suite navigation bar');
  assert.ok(html.includes('href="briefing.html" class="suite-link">📜 Briefings, Ship &amp; Atlas</a>'));
  assert.ok(html.includes('href="pvp.html"'));
  assert.ok(html.includes('href="rogue.html"'));
  assert.ok(html.includes('href="roster.html"'));

  // Stylesheet
  assert.ok(html.includes('<link rel="stylesheet" href="css/style.css">'));

  // Modular script architecture
  assert.ok(html.includes('<script src="js/data.js"></script>'));
  assert.ok(html.includes('<script src="js/rng.js"></script>'));
  assert.ok(html.includes('<script src="js/spawner.js"></script>'));
  assert.ok(html.includes('<script src="js/app.js"></script>'));
});

test('UI Boundary: all pages share unified navigation title for Briefings, Ship & Atlas', () => {
  const pages = ['pvp.html', 'rogue.html', 'roster.html', 'briefing.html'];
  const expectedSnippet = 'href="briefing.html" class="suite-link';

  for (const page of pages) {
    const html = readPage(page);
    assert.ok(html.includes(expectedSnippet), `${page} missing standard briefing suite-link`);
    assert.ok(
      html.includes('Briefings, Ship &amp; Atlas') || html.includes('Briefings, Ship & Atlas'),
      `${page} navigation text must match Briefings, Ship & Atlas`
    );
  }
});

test('All HTML pages link to favicon.svg and apple-touch-icon', () => {
  const faviconPath = path.join(__dirname, '../../favicon.svg');
  assert.ok(fs.existsSync(faviconPath), 'favicon.svg must exist in repository root');

  const pages = ['index.html', 'briefing.html', 'pvp.html', 'rogue.html', 'roster.html'];
  for (const page of pages) {
    const html = fs.readFileSync(path.join(__dirname, '../../', page), 'utf8');
    assert.match(
      html,
      /<link\s+rel="icon"\s+type="image\/svg\+xml"\s+href="favicon\.svg"\s*\/?>/i,
      `${page} must include <link rel="icon" type="image/svg+xml" href="favicon.svg">`
    );
    assert.match(
      html,
      /<link\s+rel="apple-touch-icon"\s+href="favicon\.svg"\s*\/?>/i,
      `${page} must include <link rel="apple-touch-icon" href="favicon.svg">`
    );
  }
});

test('UI Boundary: briefing.html defaults to Commander Beta dossier and includes immersive dispatch without Marauder spoiler', () => {
  const html = readPage('briefing.html');

  // Verify tab switcher defaults to Beta
  assert.match(
    html,
    /<button\s+id="btnBeta"\s+class="active"/i,
    'briefing.html must have #btnBeta active by default'
  );
  assert.doesNotMatch(
    html,
    /<button\s+id="btnAlpha"\s+class="active"/i,
    'briefing.html must not have #btnAlpha active by default'
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

  // Verify new sealed Astropathic dispatch and clearance gate
  assert.ok(
    html.includes("Commander Beta's Sealed Astropathic Dispatch"),
    'Must include Commander Beta sealed dispatch title'
  );
  assert.ok(
    html.includes('Clearance Vermilion-Beta • Restricted Dataslate'),
    'Must include Vermilion-Beta clearance tag'
  );
  assert.ok(
    html.includes('The Voice in the Ash (Your Chronicler &amp; The Third Force)') ||
    html.includes('The Voice in the Ash (Your Chronicler & The Third Force)'),
    'Must include The Voice in the Ash narrative section'
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
});

