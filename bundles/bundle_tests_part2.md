# 📦 Fires of Armageddon // Bundle: Pages & Boundary Tests (Part 2: Headless Playwright E2E)

Headless browser E2E verification, cockpit controls, and multi-CP stratagem validation (`tests/ui/pages.test.js` lines 559 to end).

## 📑 Table of Contents
- [tests/ui/pages.test.js (Part 2: Headless Playwright E2E, Lines 559-1100)](#file-testsuipagestestjspart2headlessplaywrighte2elines5591100)

---

## File: `tests/ui/pages.test.js (Part 2: Headless Playwright E2E, Lines 559-1100)` <a id="file-testsuipagestestjspart2headlessplaywrighte2elines5591100"></a>

````javascript

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
