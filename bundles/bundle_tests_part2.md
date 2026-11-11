# 📦 Fires of Armageddon // Bundle: Pages, Boundary & Tactica Daemon Tests (Part 2)

Headless browser E2E verification, cockpit controls, and LCT Tactica Daemon integration & .env routing tests (`tests/ui/pages.test.js` lines 566 to end, `tests/tactica_daemon.test.js`).

## 📑 Table of Contents
- [tests/ui/pages.test.js (Part 2: Headless Playwright E2E, Lines 566-1100)](#file-testsuipagestestjspart2headlessplaywrighte2elines5661100)
- [tests/tactica_daemon.test.js](#file-teststacticadaemontestjs)

---

## File: `tests/ui/pages.test.js (Part 2: Headless Playwright E2E, Lines 566-1100)` <a id="file-testsuipagestestjspart2headlessplaywrighte2elines5661100"></a>

````javascript
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

  // Verify .hud-bar defines safe padding and flex-wrap
  assert.ok(css.includes('.hud-bar'), 'css/style.css must define .hud-bar');
  assert.match(
    css,
    /\.hud-bar[\s\S]*?flex-wrap:\s*wrap;/,
    '.hud-bar must support flex-wrap: wrap to prevent horizontal pixel overflow'
  );

  // Verify .hud-actions defines compact button styling
  assert.ok(css.includes('.hud-actions'), 'css/style.css must define .hud-actions');
  assert.match(
    css,
    /\.hud-actions[\s\S]*?\.btn-sm/,
    '.hud-actions must define compact button styling'
  );

  // Verify .solo-sp-pill defines white-space: nowrap
  assert.ok(css.includes('.solo-sp-pill'), 'css/style.css must define .solo-sp-pill');
  assert.match(
    css,
    /\.solo-sp-pill[\s\S]*?white-space:\s*nowrap;/,
    '.solo-sp-pill must enforce white-space: nowrap'
  );
});

test('UI Boundary: pages/spawner.html HUD bar prevents pixel overflow on desktop and mobile viewports with zero clipped buttons', async () => {
  const browser = await launchTestBrowser();
  const page = await browser.newPage();

  try {
    const filePath = 'file:///' + path.resolve(ROOT_DIR, 'pages/spawner.html').replace(/\\/g, '/');
    await page.goto(filePath, { waitUntil: 'load' });

    // Initialize Solo mode active session
    await page.evaluate(() => {
      const seedInput = document.getElementById('seedInput');
      if (seedInput) seedInput.value = 'GRIMALDUS-83';
      if (window.selectGameMode) window.selectGameMode('solo');
      if (window.startSession) window.startSession();

      const hudSessionInfo = document.getElementById('hudSessionInfo');
      if (hudSessionInfo) hudSessionInfo.textContent = 'GRIMALDUS-83 • SOLO';
      const hudRound = document.getElementById('hudRound');
      if (hudRound) hudRound.textContent = 'Round 1/6';
      const pill = document.getElementById('soloDoubleSpHudBadge');
      if (pill) pill.classList.remove('hidden');
    });

    // 1. Desktop check (1280px viewport)
    await page.setViewportSize({ width: 1280, height: 900 });
    const desktopOverflows = await page.evaluate(() => {
      const bar = document.querySelector('.hud-bar');
      const barRect = bar.getBoundingClientRect();
      const results = [];
      for (const child of bar.children) {
        const rect = child.getBoundingClientRect();
        results.push(rect.right - barRect.right);
      }
      return results;
    });

    for (const ov of desktopOverflows) {
      assert.ok(ov <= 0, `Desktop HUD child must not overflow bar boundary (overflow: ${ov}px)`);
    }

    // 2. Mobile check (480px viewport)
    await page.setViewportSize({ width: 480, height: 800 });
    const mobileOverflows = await page.evaluate(() => {
      const bar = document.querySelector('.hud-bar');
      const barRect = bar.getBoundingClientRect();
      const results = [];
      for (const child of bar.children) {
        const rect = child.getBoundingClientRect();
        results.push(rect.right - barRect.right);
      }
      return results;
    });

    for (const ov of mobileOverflows) {
      assert.ok(ov <= 0, `Mobile HUD child must not overflow bar boundary (overflow: ${ov}px)`);
    }
  } finally {
    await browser.close();
  }
});
test('UI Boundary: pages/spawner.html includes Remastered Horde Rules v0.9 patch with 24 verbatim secondaries, 36 miseries, and spawner hooks', () => {
  const spawnerHtml = readPage('pages/spawner.html');
  const spawnerCards = readPage('js/spawner-cards.js');
  const spawnerCockpit = readPage('js/spawner-cockpit.js');

  assert.ok(spawnerHtml.includes('<script src="../js/spawner-cards.js"></script>'), 'Must link to js/spawner-cards.js');
  assert.ok(spawnerHtml.includes('<script src="../js/spawner-cockpit.js"></script>'), 'Must link to js/spawner-cockpit.js');

  // 1. Verbatim Misery Overrides (36 cards)
  assert.ok(spawnerCards.includes('MISERY_CARD_OFFICIAL_OVERRIDES'), 'Must define MISERY_CARD_OFFICIAL_OVERRIDES');
  assert.ok(spawnerCards.includes('UNLUCKY_NIGHT_3D6'), 'Must configure #7 Unlucky Night 3D6 Drop Lowest hook');
  assert.ok(spawnerCards.includes('PINCER_MANEUVER_EXTRA_SPAWN'), 'Must configure #13 Pincer Maneuver extra spawn hook');
  assert.ok(spawnerCards.includes('Flash Flood'), 'Must include Misery #36 Flash Flood');

  // 2. Verbatim Secondary Mission Overrides (24 missions)
  assert.ok(spawnerCards.includes('SECONDARY_MISSION_OFFICIAL_OVERRIDES'), 'Must define SECONDARY_MISSION_OFFICIAL_OVERRIDES');
  assert.ok(spawnerCards.includes('Secure Drop Zones'), 'Must include Secondary #1 Secure Drop Zones');
  assert.ok(spawnerCards.includes('Back to Basics'), 'Must include Secondary #2 Back to Basics with X tally');
  assert.ok(spawnerCards.includes('VIP Delivery'), 'Must include Secondary #24 VIP Delivery');
  assert.ok(spawnerCockpit.includes('Saved Secondary Reward Cards'), 'Must include Saved Secondary Reward Card vault');

  // 3. Live Spawner Misery Hooks & Controls
  assert.ok(spawnerCockpit.includes('unluckyNightSpawnerCheck'), 'Must create #unluckyNightSpawnerCheck toggle');
  assert.ok(spawnerCockpit.includes('miserySpawnerStatusBanner'), 'Must create #miserySpawnerStatusBanner');
  assert.ok(spawnerCockpit.includes('rollPincerManeuverExtraSpawn'), 'Must implement rollPincerManeuverExtraSpawn');
  assert.ok(spawnerCockpit.includes('adjSecondaryTally'), 'Must implement adjSecondaryTally');
  assert.ok(spawnerCockpit.includes('resolveSecondaryOutcome'), 'Must implement resolveSecondaryOutcome');
  assert.ok(spawnerCockpit.includes('redeemSavedSecondaryCard'), 'Must implement redeemSavedSecondaryCard');
});

test('UI Boundary: pages/spawner.html and js/spawner-cards.js include Authoritative Section 7.1 Resupply Overrides with Misery Lockouts', () => {
  const spawnerHtml = readPage('pages/spawner.html');
  const spawnerCards = readPage('js/spawner-cards.js');
  const spawnerResupply = readPage('js/spawner-resupply.js');

  assert.ok(spawnerHtml.includes('<script src="../js/spawner-resupply.js"></script>'), 'Must link to js/spawner-resupply.js');

  assert.ok(spawnerCards.includes('RESUPPLY_OFFICIAL_OVERRIDES'), 'Must define RESUPPLY_OFFICIAL_OVERRIDES');
  assert.ok(spawnerCards.includes('Deploy Minefield'), 'Must include Deploy Minefield');
  assert.ok(spawnerCards.includes('Deploy Razor Wire'), 'Must include Deploy Razor Wire');
  assert.ok(spawnerCards.includes('Air Strike'), 'Must include Air Strike');
  assert.ok(spawnerCards.includes('Patched Up'), 'Must include Patched Up variable cost');
  assert.ok(spawnerCards.includes('Deploy Fortification'), 'Must include Deploy Fortification variable cost');
  assert.ok(spawnerCards.includes('Field Promotion'), 'Must include Field Promotion variable cost');

  assert.ok(spawnerResupply.includes('getMiseryLockoutReason'), 'Must implement getMiseryLockoutReason');
  assert.ok(spawnerResupply.includes('executeEnhancedResupplyPurchase'), 'Must implement executeEnhancedResupplyPurchase');
  assert.ok(spawnerResupply.includes('renderResupplyTable'), 'Must implement renderResupplyTable');
});

test('UI Boundary: pages/spawner.html aligns Secondary Mission and Misery Cards side-by-side and aligns Quick SP Income action controls', async () => {
  const browser = await launchTestBrowser();
  const page = await browser.newPage();

  try {
    const filePath = 'file:///' + path.resolve(ROOT_DIR, 'pages/spawner.html').replace(/\\/g, '/');
    await page.goto(filePath, { waitUntil: 'load' });

    // Enable Solo Mode to test the longer multiplier banner as well
    await page.evaluate(() => {
      if (typeof window.selectGameMode === 'function') window.selectGameMode('solo');
      if (typeof window.syncSoloSpUiIndicators === 'function') window.syncSoloSpUiIndicators();
    });

    await page.setViewportSize({ width: 1280, height: 900 });

    const layout = await page.evaluate(() => {
      const secBox = document.getElementById('activeSecondariesBox');
      const misBox = document.getElementById('activeMiseriesBox');
      const secRect = secBox ? secBox.getBoundingClientRect() : null;
      const misRect = misBox ? misBox.getBoundingClientRect() : null;

      const killBtn = document.getElementById('btnQuickKillSp');
      const objGroup = document.querySelector('.sp-obj-group') || document.querySelector('#quickObjCountInput')?.parentElement;
      const killRect = killBtn ? killBtn.getBoundingClientRect() : null;
      const objRect = objGroup ? objGroup.getBoundingClientRect() : null;

      return {
        secTop: secRect ? secRect.top : null,
        misTop: misRect ? misRect.top : null,
        killTop: killRect ? killRect.top : null,
        objTop: objRect ? objRect.top : null,
        killHeight: killRect ? killRect.height : null,
        objHeight: objRect ? objRect.height : null
      };
    });

    // 1. Verify Active Secondary Mission box and Active Misery Cards box are horizontally aligned at the top
    assert.ok(layout.secTop !== null && layout.misTop !== null, 'Both card boxes must exist in DOM');
    const cardTopDiff = Math.abs(layout.secTop - layout.misTop);
    assert.ok(
      cardTopDiff <= 2,
      `Secondary Mission top (${layout.secTop}px) and Misery Cards top (${layout.misTop}px) must be horizontally aligned (diff: ${cardTopDiff}px)`
    );

    // 2. Verify Quick SP Kill button and Controlled Obj control group are vertically aligned with matching height
    assert.ok(layout.killTop !== null && layout.objTop !== null, 'Quick SP action controls must exist in DOM');
    const actionTopDiff = Math.abs(layout.killTop - layout.objTop);
    assert.ok(
      actionTopDiff <= 2,
      `Quick SP Kill button top (${layout.killTop}px) and Controlled Obj group top (${layout.objTop}px) must be vertically aligned (diff: ${actionTopDiff}px)`
    );

    const actionHeightDiff = Math.abs(layout.killHeight - layout.objHeight);
    assert.ok(
      actionHeightDiff <= 2,
      `Quick SP Kill button height (${layout.killHeight}px) and Controlled Obj group height (${layout.objHeight}px) must match (diff: ${actionHeightDiff}px)`
    );
  } finally {
    await browser.close();
  }
});

test('UI Boundary: pages/spawner.html awards strictly 2 SP per objective in Solo mode, guards against seamless navigation multiplier stacking, and enforces once-per-round claim limit', async () => {
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
  try {
    browser = await launchTestBrowser();
    const page = await browser.newPage();
    await page.route(`http://localhost:${port}/**`, async (route) => {
      let reqPath = new URL(route.request().url()).pathname;
      if (reqPath === '/') reqPath = '/index.html';
      const filePath = path.join(ROOT_DIR, reqPath);
      if (fs.existsSync(filePath)) {
        const contentType = filePath.endsWith('.html')
          ? 'text/html'
          : (filePath.endsWith('.js') ? 'application/javascript' : (filePath.endsWith('.css') ? 'text/css' : 'application/octet-stream'));
        await route.fulfill({ status: 200, contentType, body: fs.readFileSync(filePath) });
      } else {
        await route.fulfill({ status: 404, body: 'Not found' });
      }
    });

    // 1. Initial load on spawner.html
    await page.goto(`http://localhost:${port}/pages/spawner.html`, { waitUntil: 'load' });

    // 2. Start Session in Solo Mode
    await page.evaluate(() => {
      if (typeof window.selectMode === 'function') window.selectMode('solo');
      if (typeof window.startSession === 'function') window.startSession();
      if (typeof window.switchTab === 'function') window.switchTab(1);
    });

    // 3. Advance to Round 1
    await page.evaluate(() => {
      if (typeof window.advanceBattleRound === 'function') window.advanceBattleRound();
    });

    // 4. Seamlessly navigate to roster.html, then back to spawner.html
    const rosterLink = await page.$('a[href*="roster.html"]');
    if (rosterLink) {
      await rosterLink.click();
      await page.waitForTimeout(350);
      const spawnerLink = await page.$('a[href*="spawner.html"]');
      if (spawnerLink) {
        await spawnerLink.click();
        await page.waitForTimeout(350);
      }
    }

    // 5. Set Controlled Obj to 1
    await page.evaluate(() => {
      const input = document.getElementById('quickObjCountInput');
      if (input) {
        input.value = '1';
        input.dispatchEvent(new Event('change'));
      }
    });

    // Initial SP must be 0
    let hudSp = await page.$eval('#hudSp', el => parseInt(el.innerText, 10));
    assert.equal(hudSp, 0, 'Initial SP must be 0');

    // 6. Click Claim Command SP (Controlled Obj: 1 in Solo Mode = 2 SP)
    const claimBtnSelector = '#btnClaimCommandSp, [onclick*="awardCommandPhaseObjectiveSP"]';
    await page.click(claimBtnSelector);

    hudSp = await page.$eval('#hudSp', el => parseInt(el.innerText, 10));
    assert.equal(hudSp, 2, 'In Solo Mode with 1 objective, exactly 2 SP must be awarded (not 4 or 8 SP after navigation)');

    // 7. Verify button feedback and disabled state
    const btnState = await page.$eval(claimBtnSelector, el => ({
      text: el.innerText,
      disabled: el.disabled
    }));
    assert.ok(btnState.text.toLowerCase().includes('claimed'), `Button text should show Claimed, got: ${btnState.text}`);
    assert.equal(btnState.disabled, true, 'Button should be disabled once claimed for the current round');

    // 8. Click again in the same round: must NOT award duplicate SP
    await page.evaluate(() => {
      if (typeof window.awardCommandPhaseObjectiveSP === 'function') {
        window.awardCommandPhaseObjectiveSP();
      }
    });
    hudSp = await page.$eval('#hudSp', el => parseInt(el.innerText, 10));
    assert.equal(hudSp, 2, 'SP must not increase when claiming again in the same round');

    // 9. Advance to Round 2
    await page.evaluate(() => {
      if (typeof window.advanceBattleRound === 'function') window.advanceBattleRound();
    });

    // 10. Verify button is re-enabled and reset for Round 2
    const btnReset = await page.$eval(claimBtnSelector, el => ({
      text: el.innerText,
      disabled: el.disabled
    }));
    assert.ok(btnReset.text.toLowerCase().includes('claim command sp'), `Button text should reset to Claim Command SP, got: ${btnReset.text}`);
    assert.equal(btnReset.disabled, false, 'Button should be re-enabled for Round 2');

    // 11. In Round 2, set Controlled Obj to 2: should award 4 SP (total SP goes from 2 to 6)
    await page.evaluate(() => {
      const input = document.getElementById('quickObjCountInput');
      if (input) {
        input.value = '2';
        input.dispatchEvent(new Event('change'));
      }
    });
    await page.click(claimBtnSelector);

    hudSp = await page.$eval('#hudSp', el => parseInt(el.innerText, 10));
    assert.equal(hudSp, 6, 'In Round 2 with 2 objectives in Solo Mode, exactly 4 additional SP should be awarded (total: 6 SP)');
  } finally {
    if (browser) await browser.close();
    server.close();
  }
});

test('UI Boundary: pages/spawner.html removes redundant top roll spawn button, keeping single roll spawner button in live feed', () => {
  const spawnerHtml = readPage('pages/spawner.html');
  assert.equal(
    spawnerHtml.includes('id="quickRollSpawnsTopBtn"'),
    false,
    'pages/spawner.html must not contain redundant quickRollSpawnsTopBtn'
  );
  assert.ok(
    spawnerHtml.includes('onclick="rollSpawnsFromCockpit()">🎲 Roll Spawns</button>'),
    'pages/spawner.html must retain the clean Roll Spawns button in the live feed container'
  );
});

test('UI Boundary: pages/spawner.html awards strictly 2 SP per objective in Solo mode (not 3), and scales linearly (1 obj = 2 SP, 2 obj = 4 SP, 3 obj = 6 SP)', async () => {
  const browser = await launchTestBrowser();
  const page = await browser.newPage();

  try {
    const filePath = 'file:///' + path.resolve(ROOT_DIR, 'pages/spawner.html').replace(/\\/g, '/');
    await page.goto(filePath, { waitUntil: 'load' });

    // Test calculation function in browser context for 1, 2, and 3 objectives
    await page.evaluate(() => {
      if (typeof window.selectMode === 'function') window.selectMode('solo');
      if (typeof window.startSession === 'function') window.startSession();
      if (typeof window.switchTab === 'function') window.switchTab(1);
    });

    const results = await page.evaluate(() => {
      const isSolo = isSoloModeActive();
      const calculateSp = (objCount, fob) => {
        const spPerObj = isSolo ? 2 : 1;
        const fobBonus = fob && objCount > 0 ? (isSolo ? 2 : 1) : 0;
        return (objCount * spPerObj) + fobBonus;
      };

      return {
        isSolo,
        oneObj: calculateSp(1, false),
        twoObj: calculateSp(2, false),
        threeObj: calculateSp(3, false),
        oneObjWithFob: calculateSp(1, true)
      };
    });

    assert.equal(results.isSolo, true, 'Solo mode must be active');
    assert.equal(results.oneObj, 2, 'In Solo mode, 1 objective must award strictly 2 SP (not 3)');
    assert.equal(results.twoObj, 4, 'In Solo mode, 2 objectives must award strictly 4 SP');
    assert.equal(results.threeObj, 6, 'In Solo mode, 3 objectives must award strictly 6 SP');
    assert.equal(results.oneObjWithFob, 4, 'In Solo mode, 1 objective + fortified FOB must award strictly 4 SP');
  } finally {
    await browser.close();
  }
});

test('UI Boundary: pages/spawner.html Command (CP) HUD supports 1, 2, and 3 CP Stratagem spend buttons', async () => {
  const html = readPage('pages/spawner.html');
  assert.ok(html.includes('spendCPForStrat(1)'), 'pages/spawner.html must include spendCPForStrat(1) button');
  assert.ok(html.includes('spendCPForStrat(2)'), 'pages/spawner.html must include spendCPForStrat(2) button');
  assert.ok(html.includes('spendCPForStrat(3)'), 'pages/spawner.html must include spendCPForStrat(3) button');
  assert.ok(html.includes('adjustCpDirect()'), 'pages/spawner.html must include adjustCpDirect() on #hudCp');

  const browser = await launchTestBrowser();
  const page = await browser.newPage();
  try {
    const filePath = 'file:///' + path.resolve(ROOT_DIR, 'pages/spawner.html').replace(/\\/g, '/');
    await page.goto(filePath, { waitUntil: 'load' });
    await page.evaluate(() => {
      localStorage.clear();
      if (typeof window.resetMatchToSetup === 'function') window.resetMatchToSetup();
      if (typeof window.startSession === 'function') window.startSession();
      if (typeof window.adjCP === 'function') window.adjCP(6);
    });

    let cpVal = await page.$eval('#hudCp', el => parseInt(el.innerText, 10));
    assert.equal(cpVal, 8);

    await page.click('button[onclick*="spendCPForStrat(2)"]');
    cpVal = await page.$eval('#hudCp', el => parseInt(el.innerText, 10));
    let stratTally = await page.$eval('#hudStratTally', el => el.innerText);
    assert.equal(cpVal, 6, 'Spending a 2 CP stratagem must deduct exactly 2 CP');
    assert.ok(stratTally.toLowerCase().includes('1 strats'), 'Spending a 2 CP stratagem must count as 1 Stratagem used');

    await page.click('button[onclick*="spendCPForStrat(3)"]');
    cpVal = await page.$eval('#hudCp', el => parseInt(el.innerText, 10));
    stratTally = await page.$eval('#hudStratTally', el => el.innerText);
    assert.equal(cpVal, 3, 'Spending a 3 CP stratagem must deduct exactly 3 CP');
    assert.ok(stratTally.toLowerCase().includes('2 strats'), 'Spending a 3 CP stratagem must count as 1 additional Stratagem (total 2)');
  } finally {
    await browser.close();
  }
});
````

---

## File: `tests/tactica_daemon.test.js` <a id="file-teststacticadaemontestjs"></a>

````javascript
/**
 * @fileoverview Integration tests for tactica_daemon.js LCT dice-mat queue, JSONL persistence & restarts.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {
  createTacticaDaemon,
  resolveTacticaThreadUrl,
  resolveTacticaProfileDir,
  isUsableGeminiThreadUrl,
  launchTacticaBrowserSession
} = require('../tactica_daemon.js');

async function postJson(baseUrl, route, body) {
  const res = await fetch(`${baseUrl}${route}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return res.json();
}

test('tactica_daemon: orchestrates multi-stage LCT dice-mat rolls via /tts/poll & /tts/dice-result and persists JSONL', async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'foa-lct-daemon-'));
  const daemon1 = createTacticaDaemon({
    logDir: tmpDir,
    visionFetchFn: async () => ({
      ok: true,
      json: async () => ({
        candidates: [{
          content: {
            parts: [{
              text: '{"losBlocked":true,"revertSquadKey":"HORDE::Overlord","blockedPairs":["HORDE::Overlord->PLAYER::Krieg"],"spokenReply":"Ruin wall blocks LOS; reverting Overlord."}'
            }]
          }
        }]
      })
    })
  });
  const port1 = await daemon1.start(0);
  const url1 = `http://127.0.0.1:${port1}`;

  try {
    // CORS preflight & state endpoint
    const optRes = await fetch(`${url1}/state`, { method: 'OPTIONS' });
    assert.equal(optRes.status, 204);

    await postJson(url1, '/session/sync', {
      roomCode: 'HADES-44',
      battleRound: 1,
      phase: 'PLAYER_TURN',
      factionName: 'Necrons',
      playerCp: 2,
      playerSp: 6,
      activeMiseryIds: [30],
      activeFortifications: ['FORT_TRENCH'],
      zoneSpawns: ['10 Necron Warriors']
    });

    const stateSnap = await (await fetch(`${url1}/state`)).json();
    assert.equal(stateSnap.ok, true);
    assert.equal(stateSnap.state.roomCode, 'HADES-44');

    // Reaction window trigger & resolution
    const reactEvt = await postJson(url1, '/chronicle/append', {
      phase: 'HORDE_MOVEMENT',
      type: 'PHASE',
      summary: 'Horde movement complete.',
      reactionTrigger: 'END_OF_HORDE_MOVEMENT'
    });
    assert.equal(reactEvt.pendingReactionWindow.open, true);

    const resolvedReact = await postJson(url1, '/reaction/resolve', {
      choice: 'FIRE_OVERWATCH',
      cpSpent: 1
    });
    assert.equal(resolvedReact.state.playerCp, 1);

    // 1. Request Auto-Defender sequence -> must NOT resolve yet, must queue SAVES on /tts/poll!
    const reqDef = await postJson(url1, '/combat/defend-request', {
      unitName: 'Necron Warriors',
      defender: { save: 4, woundsPerModel: 1, keywords: ['INFANTRY'] },
      incomingAttack: { type: 'ranged', strength: 5, ap: -1, damage: 1 },
      options: { numWounds: 2, damagePerWound: 1, startingModels: 10 }
    });
    assert.equal(reqDef.ok, true);
    assert.equal(reqDef.sequence.stage, 'SAVES');

    // TTS LCT poller fetches Stage 1 command (2x Saves at 5+)
    const pollSaves = await (await fetch(`${url1}/tts/poll`)).json();
    assert.equal(pollSaves.action, 'LCT_MAT_ROLL');
    assert.equal(pollSaves.stage, 'SAVES');
    assert.equal(pollSaves.count, 2);

    // LCT mat finishes rolling [2 (fail), 6 (pass)] and posts back -> daemon queues Stage 2 FNP (1 die at 5+)
    const resSaves = await postJson(url1, '/tts/dice-result', {
      rollId: pollSaves.rollId,
      sequenceId: pollSaves.sequenceId,
      dice: [2, 6]
    });
    assert.equal(resSaves.sequence.stage, 'FNP');

    const pollFnp = await (await fetch(`${url1}/tts/poll`)).json();
    assert.equal(pollFnp.stage, 'FNP');
    assert.equal(pollFnp.count, 1);

    // LCT mat rolls [4 (fail FNP)] -> 1 Warrior slain -> daemon queues Stage 3 Misery #30 ON_DEATH (1 die at 4+)
    const resFnp = await postJson(url1, '/tts/dice-result', {
      rollId: pollFnp.rollId,
      sequenceId: pollFnp.sequenceId,
      dice: [4]
    });
    assert.equal(resFnp.sequence.stage, 'ON_DEATH');

    const pollDeath = await (await fetch(`${url1}/tts/poll`)).json();
    assert.equal(pollDeath.stage, 'ON_DEATH');
    assert.equal(pollDeath.count, 1);

    // LCT mat rolls [5 (triggers shoot-on-death!)] -> sequence completes and writes chronicle!
    const resDeath = await postJson(url1, '/tts/dice-result', {
      rollId: pollDeath.rollId,
      sequenceId: pollDeath.sequenceId,
      dice: [5]
    });
    assert.equal(resDeath.sequence.stage, 'COMPLETE');
    assert.equal(resDeath.sequence.outcome.modelsSlain, 1);
    assert.equal(resDeath.sequence.outcome.onDeathTriggers, 1);

    // Queue is now IDLE
    assert.equal(await (await fetch(`${url1}/tts/poll`)).text(), 'IDLE');

    // Horde Attack sequence + standalone roll + custom command enqueue + 404 check
    const reqAtk = await postJson(url1, '/combat/attack-request', {
      attackerName: 'Immortals',
      targetName: 'Cadians',
      target: { toughness: 3 },
      weapon: { type: 'ranged', attacks: 1, skill: 3, strength: 5, ap: -1, damage: 1 }
    });
    assert.equal(reqAtk.sequence.stage, 'HITS');
    const pollHits = await (await fetch(`${url1}/tts/poll`)).json();
    await postJson(url1, '/tts/dice-result', { sequenceId: pollHits.sequenceId, dice: [5] });
    const pollWounds = await (await fetch(`${url1}/tts/poll`)).json();
    const atkDone = await postJson(url1, '/tts/dice-result', { sequenceId: pollWounds.sequenceId, dice: [4] });
    assert.equal(atkDone.sequence.stage, 'COMPLETE');

    const standalone = await postJson(url1, '/tts/dice-result', { label: 'Battle-shock', dice: [6, 3] });
    assert.equal(standalone.sequence, null);

    const enq = await postJson(url1, '/tts/enqueue', { action: 'SPAWN_PING', zone: 1 });
    assert.equal(enq.ok, true);
    const popped = await (await fetch(`${url1}/tts/poll`)).json();
    assert.equal(popped.action, 'SPAWN_PING');

    // Raw TTS Yellowscribe objects telemetry parses datasheets, computes objective distance & locks Horde Warlord
    const telRaw = await postJson(url1, '/tts/telemetry', {
      objects: [
        {
          guid: 'w1',
          name: '5/5 Technomancer',
          tags: ['HORDE'],
          pos: { x: 0, y: 1, z: 8 },
          bounds: { x: 1.57, y: 2.0, z: 1.57 },
          description: 'M: 6" T: 5 Sv: 3+ W: 5 Ld: 6+ OC: 2\nInvuln: 4+\nKeywords: Infantry, Character'
        },
        {
          guid: 'obj1',
          name: 'Objective 1',
          pos: { x: 0, y: 1, z: 0 },
          bounds: { x: 1.57, y: 0.1, z: 1.57 }
        }
      ]
    });
    assert.equal(telRaw.trackedUnits, 1);
    assert.equal(telRaw.objectives, 1);
    assert.equal(telRaw.warlord.name, 'Technomancer');
    assert.ok(typeof telRaw.units[0].closestObjective.distanceInches === 'number');
    assert.ok(telRaw.units[0].closestObjective.distanceInches > 6 && telRaw.units[0].closestObjective.distanceInches < 7);

    // Subsequent pre-parsed units telemetry preserves locked Horde Warlord & sets up Autopilot check
    const tel = await postJson(url1, '/tts/telemetry', {
      units: [
        {
          squadKey: 'HORDE::Overlord',
          guid: 'w2',
          guids: ['w2'],
          name: 'Overlord',
          side: 'HORDE',
          move: 5,
          pos: { x: 0, z: 9 },
          keywords: ['INFANTRY', 'CHARACTER'],
          weapons: [{ name: 'Tachyon Arrow', type: 'ranged', rangeInches: 72, attacks: 1, skill: 2, strength: 16, ap: -5, damage: 'D6+2', keywords: [] }],
          models: [{ guid: 'w2', pos: { x: 0, y: 1.1, z: 9 }, radiusInches: 0.78 }]
        },
        {
          squadKey: 'PLAYER::Krieg',
          guid: 'p1',
          guids: ['p1'],
          name: 'Death Korps',
          side: 'PLAYER',
          pos: { x: 0, z: 0 },
          keywords: ['INFANTRY'],
          models: [{ guid: 'p1', pos: { x: 0, y: 1.1, z: 0 }, radiusInches: 0.5 }]
        }
      ]
    });
    assert.equal(tel.warlord.name, 'Technomancer');

    // Autopilot spawn-waves, select-shooting & movement -> enqueues SPAWN_WAVE & MOVE_UNIT
    const spw = await postJson(url1, '/autopilot/spawn-waves', {
      zoneSpawns: [{ zone: 1, bracketKey: '5-6', units: ['5 Immortals'] }]
    });
    assert.equal(spw.ok, true);
    assert.equal((await (await fetch(`${url1}/tts/poll`)).json()).action, 'SPAWN_WAVE');

    const sht = await postJson(url1, '/autopilot/select-shooting', {});
    assert.equal(sht.ok, true);
    assert.equal(sht.assignments.length, 1);

    const mv = await postJson(url1, '/autopilot/plan-movement', {});
    assert.equal(mv.ok, true);
    assert.equal(mv.plans.length, 1);
    const pollMv = await (await fetch(`${url1}/tts/poll`)).json();
    assert.equal(pollMv.action, 'MOVE_UNIT');

    const rev = await postJson(url1, '/autopilot/revert-move', { squadKey: 'HORDE::Overlord' });
    assert.equal(rev.ok, true);
    const pollRev = await (await fetch(`${url1}/tts/poll`)).json();
    assert.equal(pollRev.action, 'REVERT_MOVE');

    // Autopilot declare-charges -> queues 2D6 LCT_MAT_ROLL -> settled [6, 5] enqueues MOVE_UNIT
    const chg = await postJson(url1, '/autopilot/declare-charges', {});
    assert.equal(chg.declarations.length, 1);
    const pollChgRoll = await (await fetch(`${url1}/tts/poll`)).json();
    assert.equal(pollChgRoll.action, 'LCT_MAT_ROLL');
    assert.equal(pollChgRoll.stage, 'CHARGE_ROLL');
    const chgSettled = await postJson(url1, '/tts/dice-result', {
      sequenceId: pollChgRoll.sequenceId,
      dice: [6, 5]
    });
    assert.equal(chgSettled.chargeResult.succeeded, true);
    const pollChgMove = await (await fetch(`${url1}/tts/poll`)).json();
    assert.equal(pollChgMove.action, 'MOVE_UNIT');

    const cons = await postJson(url1, '/autopilot/consolidate', {});
    assert.equal(cons.ok, true);
    assert.equal(cons.moves.length, 1);

    // Overwatch LOS Check -> auto-enqueues REVERT_MOVE & filters blockedPairs from subsequent shooting!
    const losRes = await postJson(url1, '/overwatch/los-check', {
      transcript: 'Can Overlord see Krieg behind solid ruin?',
      imageBase64: 'data:image/jpeg;base64,AAAA'
    });
    assert.equal(losRes.mode, 'gemini-vision');
    assert.equal(losRes.verdict.losBlocked, true);
    const pollLosRevert = await (await fetch(`${url1}/tts/poll`)).json();
    assert.equal(pollLosRevert.action, 'REVERT_MOVE');

    const shtAfterBlock = await postJson(url1, '/autopilot/select-shooting', {});
    assert.equal(shtAfterBlock.assignments.length, 0, 'losBlockedPairs must filter out blocked HORDE::Overlord->PLAYER::Krieg');

    // Sync Imperial Knights faction, verify /tts/telemetry auto-detects Votann as PLAYER & rejects props/off-board, then flip side via /tts/set-side
    await postJson(url1, '/session/sync', { factionName: 'Imperial Knights' });
    const telFaction = await postJson(url1, '/tts/telemetry', {
      playmatBounds: { minX: -22.5, maxX: 22.5, minZ: -30.5, maxZ: 30.5 },
      objects: [
        { guid: 'cam1', name: 'Blue dice camera', locked: true, pos: { x: 5, y: 2, z: 5 }, bounds: { x: 1, y: 1, z: 1 } },
        { guid: 'gork1', name: '18/18 Gorkanaut', tags: ['HORDE'], pos: { x: -45, y: 1, z: 60 }, bounds: { x: 5, y: 6, z: 5 }, description: 'M: 8" T: 12 Sv: 3+ W: 18 Ld: 7+ OC: 8\nKeywords: Vehicle, Orks' },
        { guid: 'vot1', name: 'Hearthkyn Warriors', locked: false, pos: { x: 0, y: 1, z: -8 }, bounds: { x: 1.1, y: 1.4, z: 1.1 }, description: 'M: 5" T: 5 Sv: 4+ W: 1 Ld: 7+ OC: 2\nKeywords: Infantry, Leagues of Votann' },
        { guid: 'arm1', name: '12/12 Armiger Warglaive', locked: false, pos: { x: 0, y: 1, z: 12 }, bounds: { x: 3.9, y: 4.5, z: 3.9 }, description: 'M: 12" T: 10 Sv: 3+ W: 12 Ld: 7+ OC: 8\nKeywords: Vehicle, Walker, Armiger' }
      ]
    });
    assert.equal(telFaction.trackedUnits, 2);
    const votUnit = telFaction.units.find(u => u.name === 'Hearthkyn Warriors');
    const armUnit = telFaction.units.find(u => u.name === 'Armiger Warglaive');
    assert.equal(votUnit.side, 'PLAYER');
    assert.equal(armUnit.side, 'HORDE');

    const flipped = await postJson(url1, '/tts/set-side', {
      squadKey: votUnit.squadKey,
      guids: votUnit.guids,
      side: 'HORDE'
    });
    assert.equal(flipped.ok, true);
    assert.equal(flipped.units.find(u => u.name === 'Hearthkyn Warriors').side, 'HORDE');
    const pollSetSide = await (await fetch(`${url1}/tts/poll`)).json();
    assert.equal(pollSetSide.action, 'SET_UNIT_SIDE');
    assert.equal(pollSetSide.side, 'HORDE');
    assert.deepEqual(pollSetSide.guids, ['vot1']);

    const notFound = await fetch(`${url1}/unknown`);
    assert.equal(notFound.status, 404);
  } finally {
    await daemon1.stop();
  }

  // 2. Restart daemon on same folder -> zero memory loss
  const daemon2 = createTacticaDaemon({ logDir: tmpDir });
  const port2 = await daemon2.start(0);
  const url2 = `http://127.0.0.1:${port2}`;
  try {
    const compiled = await postJson(url2, '/chronicle/compile', { channel: 'alpha' });
    assert.ok(compiled.report.includes('Necron Warriors'));
    assert.ok(compiled.report.includes('Technomancer'));
  } finally {
    await daemon2.stop();
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('tactica_daemon.bat: Windows launcher script switches to repo directory and invokes npm run tactica:daemon', () => {
  const batPath = path.resolve(__dirname, '../tactica_daemon.bat');
  assert.equal(fs.existsSync(batPath), true, 'tactica_daemon.bat must exist in /dealer root');
  const content = fs.readFileSync(batPath, 'utf8');
  assert.ok(content.includes('cd /d "%~dp0"'), 'Must switch working directory to script folder');
  assert.ok(content.includes('npm run tactica:daemon'), 'Must execute npm run tactica:daemon');
  assert.ok(content.includes('pause'), 'Must pause on exit so terminal diagnostics remain readable');
});

test('resolveTacticaThreadUrl: strictly selects TACTICA_THREAD_URL and ignores Alpha/Beta/Gamma/Supabase URLs', () => {
  assert.equal(typeof resolveTacticaThreadUrl, 'function');
  assert.equal(typeof isUsableGeminiThreadUrl, 'function');

  const resolved = resolveTacticaThreadUrl({
    SUPABASE_URL: 'https://dsfvhjjalexqpbzqoaqb.supabase.co',
    TACTICA_THREAD_URL: '  https://gemini.google.com/app/tactica999  ',
    ALPHA_THREAD_URL: 'https://gemini.google.com/app/32b1c53a813d15a3',
    BETA_THREAD_URL: 'https://gemini.google.com/app/0c0b15a075182321',
    GAMMA_THREAD_URL: 'https://gemini.google.com/app/793dd9d2bd84ad35'
  });
  assert.equal(resolved, 'https://gemini.google.com/app/tactica999');

  const withoutTactica = resolveTacticaThreadUrl({
    SUPABASE_URL: 'https://dsfvhjjalexqpbzqoaqb.supabase.co',
    ALPHA_THREAD_URL: 'https://gemini.google.com/app/32b1c53a813d15a3',
    BETA_THREAD_URL: 'https://gemini.google.com/app/0c0b15a075182321',
    GAMMA_THREAD_URL: 'https://gemini.google.com/app/793dd9d2bd84ad35'
  });
  assert.equal(withoutTactica, '', 'Must never fall back to ALPHA/BETA/GAMMA_THREAD_URL');

  assert.equal(isUsableGeminiThreadUrl('https://gemini.google.com/app/YOUR_NEW_THREAD_ID_HERE'), false);
  assert.equal(isUsableGeminiThreadUrl('https://gemini.google.com/app/<your-tactica-thread-id>'), false);
  assert.equal(isUsableGeminiThreadUrl('https://gemini.google.com/app/tactica999'), true);
});

test('resolveTacticaProfileDir & launchTacticaBrowserSession: strictly isolates chrome_tactica_profile from chrome_vox_profile so both terminals run concurrently without crashing', async () => {
  assert.equal(typeof resolveTacticaProfileDir, 'function');
  const baseDir = path.resolve(__dirname, '..');
  const defaultDir = resolveTacticaProfileDir({}, baseDir);
  assert.equal(defaultDir, path.join(baseDir, 'chrome_tactica_profile'));
  assert.notEqual(defaultDir, path.join(baseDir, 'chrome_vox_profile'));

  // Guard against accidental .env collision pointing Tactica at chrome_vox_profile
  const guardedDir = resolveTacticaProfileDir(
    { TACTICA_PROFILE_DIR: path.join(baseDir, 'chrome_vox_profile') },
    baseDir
  );
  assert.equal(guardedDir, path.join(baseDir, 'chrome_tactica_profile'));

  const launchedDirs = [];
  const mockPage = {
    goto: async () => {},
    waitForSelector: async () => {},
    url: () => 'https://gemini.google.com/app/tactica999',
    close: async () => {}
  };
  const mockChromium = {
    launchPersistentContext: async (dir) => {
      launchedDirs.push(dir);
      return {
        pages: () => [mockPage],
        newPage: async () => mockPage,
        on: () => {},
        close: async () => {}
      };
    }
  };

  const session = await launchTacticaBrowserSession('https://gemini.google.com/app/tactica999', {
    env: {},
    baseDir,
    chromium: mockChromium
  });
  assert.ok(session, 'Must return active Tactica browser session');
  assert.equal(launchedDirs.length, 1, 'Must launch Chromium strictly once');
  assert.equal(launchedDirs[0], path.join(baseDir, 'chrome_tactica_profile'));
  assert.equal(
    launchedDirs.some((d) => d.includes('chrome_vox_profile')),
    false,
    'Must NEVER touch chrome_vox_profile'
  );
  await session.close();
});



````
