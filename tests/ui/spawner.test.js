const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { chromium } = require('playwright');

const ROOT_DIR = path.resolve(__dirname, '../../');

async function launchTestBrowser() {
  for (const opts of [{ headless: true }, { channel: 'chrome', headless: true }, { channel: 'msedge', headless: true }]) {
    try {
      return await chromium.launch(opts);
    } catch (_) {}
  }
  throw new Error('Could not launch headless Chromium, Chrome, or Edge for UI integration test');
}

test('UI Boundary: pages/spawner.html synchronizes Pre-Game (Round 0) vs Battle Round 1, draws cards, and supports manual draw', async () => {
  const browser = await launchTestBrowser();
  const page = await browser.newPage();

  try {
    await page.addInitScript(() => {
      window.confirm = () => true;
      try {
        localStorage.setItem('foa_horde_session_v1', JSON.stringify({
          seed: 'TEST-PREGAME-99',
          selectedModeVal: 'solo',
          isSoloMode: true,
          battleRound: 0,
          activeMiseries: [],
          activeSecondaries: [],
          hasActiveSession: true
        }));
      } catch (e) {}
    });

    const filePath = 'file:///' + path.resolve(ROOT_DIR, 'pages/spawner.html').replace(/\\/g, '/');
    await page.goto(filePath, { waitUntil: 'load' });

    await page.evaluate(() => {
      window.confirm = () => true;
      if (typeof window.resetMatchToSetup === 'function') window.resetMatchToSetup();
      if (typeof window.startSession === 'function') window.startSession();

      if (typeof window.battleRound !== 'undefined') window.battleRound = 0;
      if (window.state) {
        window.state.round = 0;
        window.state.activeMiseries = [];
        window.state.activeSecondaries = [];
      }
      if (typeof window.switchTab === 'function') window.switchTab(1);
      if (typeof window.updateHUD === 'function') window.updateHUD();
      if (typeof window.renderSharedDecks === 'function') window.renderSharedDecks();
      if (typeof window.renderActiveMiseries === 'function') window.renderActiveMiseries();
      if (typeof window.renderActiveSecondaries === 'function') window.renderActiveSecondaries();
    });

    // 1. Verify Pre-Game (Round 0) UI elements
    const hudRoundText = await page.$eval('#hudRound', el => el.innerText.trim());
    const roundTitleText = await page.$eval('#roundTitle', el => el.innerText.trim());
    const spawnModText = await page.$eval('#spawnModDisplay', el => el.innerText.trim());
    const nextBtnText = await page.$eval('#nextRoundBtn', el => el.innerText.trim());
    const secBoxContent = await page.$eval('#activeSecondariesBox', el => el.innerText.trim());
    const misBoxContent = await page.$eval('#activeMiseriesBox', el => el.innerText.trim());

    assert.equal(hudRoundText, 'Pre-Game', 'HUD Round must indicate Pre-Game at round 0');
    assert.equal(roundTitleText.toUpperCase(), 'DEPLOYMENT & SETUP', 'Round title must be Deployment & Setup in Pre-Game');
    assert.ok(spawnModText.includes('Roll your initial Round 1 Horde Spawns'), 'Spawn mod display must guide player to roll spawns in Pre-Game');
    assert.ok(nextBtnText.toUpperCase().includes('BEGIN BATTLE ROUND 1'), 'Next round button must read Begin Battle Round 1 in Pre-Game');
    assert.ok(secBoxContent.includes('No active Secondary Mission.'), 'Must show placeholder when no secondary mission is drawn in Pre-Game');
    assert.ok(misBoxContent.includes('No active Misery Cards.'), 'Must show placeholder when no misery cards are drawn in Pre-Game');

    // Verify manual + Draw buttons are present in dock headers
    const secDrawBtn = await page.$('#btnManualDrawSecondary');
    const misDrawBtn = await page.$('#btnManualDrawMisery');
    assert.ok(secDrawBtn, 'Active Secondary dock header must contain #btnManualDrawSecondary');
    assert.ok(misDrawBtn, 'Active Misery dock header must contain #btnManualDrawMisery');

    // 2. Click "Begin Battle Round 1 →" to advance to Round 1
    await page.click('#nextRoundBtn');
    await page.waitForTimeout(200);

    // 3. Verify Battle Round 1 UI state & card draws
    const r1HudRound = await page.$eval('#hudRound', el => el.innerText.trim());
    const r1Title = await page.$eval('#roundTitle', el => el.innerText.trim());
    const r1SpawnMod = await page.$eval('#spawnModDisplay', el => el.innerText.trim());
    const r1NextBtn = await page.$eval('#nextRoundBtn', el => el.innerText.trim());
    const r1SecBox = await page.$eval('#activeSecondariesBox', el => el.innerHTML);
    const r1MisBox = await page.$eval('#activeMiseriesBox', el => el.innerHTML);

    assert.equal(r1HudRound, 'Round 1/6', 'HUD Round must update to Round 1/6');
    assert.equal(r1Title.toUpperCase(), 'BATTLE ROUND 1', 'Round title must update to Battle Round 1');
    assert.ok(r1SpawnMod.includes('1 Misery Drawn'), 'Spawn mod display must show 1 Misery Drawn');
    assert.ok(r1NextBtn.toUpperCase().includes('ADVANCE TO BATTLE ROUND 2'), 'Next round button must read Advance to Battle Round 2');
    assert.ok(!r1SecBox.includes('No active Secondary Mission.'), 'Secondary mission card must be drawn and rendered in Round 1');
    assert.ok(!r1MisBox.includes('No active Misery Cards.'), 'Misery card must be drawn and rendered in Round 1');

    // 4. Test manual draw button: draw another Secondary Mission
    await page.click('#btnManualDrawSecondary');
    await page.waitForTimeout(100);
    const secCardsCount = await page.$$eval('#activeSecondariesBox .card', cards => cards.length);
    assert.ok(secCardsCount >= 2, 'Clicking manual + Draw button must draw an additional Secondary Mission');
  } finally {
    await browser.close();
  }
});
