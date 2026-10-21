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
