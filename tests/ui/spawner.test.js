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
  const context = await browser.newContext();
  const page = await context.newPage();

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

test('UI Boundary: pages/spawner.html guided phase stepper preserves active phase on button clicks and SP shop purchase updates tracker', async () => {
  const browser = await launchTestBrowser();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.addInitScript(() => {
      window.confirm = () => true;
      try {
        localStorage.setItem('foa_horde_session_v1', JSON.stringify({
          seed: 'TEST-STEPPER-40',
          selectedModeVal: 'solo',
          isSoloMode: true,
          battleRound: 1,
          sp: 16,
          spSpentThisRound: 0,
          spRoundCap: 16,
          hasActiveSession: true
        }));
      } catch (e) {}
    });

    const filePath = 'file:///' + path.resolve(ROOT_DIR, 'pages/spawner.html').replace(/\\/g, '/');
    await page.goto(filePath, { waitUntil: 'load' });

    await page.evaluate(() => {
      window.confirm = () => true;
      if (typeof window.switchTab === 'function') window.switchTab(1);
      if (typeof window.setGuidedPhaseStep === 'function') window.setGuidedPhaseStep(3, { silent: true });
      if (typeof window.updateHUD === 'function') window.updateHUD();
    });

    // 1. Verify Phase 3 is active
    let activeStepBtn = await page.$eval('#roundPhaseStepper .active-step', el => el.getAttribute('data-step'));
    assert.equal(activeStepBtn, '3', 'Phase 3 must be active initially');

    // 2. Click HUD "+ SP" button and verify phase does NOT reset to 1
    await page.click('#hudGainSpBtn');
    activeStepBtn = await page.$eval('#roundPhaseStepper .active-step', el => el.getAttribute('data-step'));
    assert.equal(activeStepBtn, '3', 'Phase 3 must remain active after clicking + SP');

    // 3. Click HUD "- SP" button and verify phase does NOT reset to 1
    await page.click('.hud-stat button[onclick*="loseSP"]');
    activeStepBtn = await page.$eval('#roundPhaseStepper .active-step', el => el.getAttribute('data-step'));
    assert.equal(activeStepBtn, '3', 'Phase 3 must remain active after clicking - SP');

    // 4. Click "+ CP" button and verify phase does NOT reset to 1
    await page.click('.hud-stat button[onclick*="adjCP(1)"]');
    activeStepBtn = await page.$eval('#roundPhaseStepper .active-step', el => el.getAttribute('data-step'));
    assert.equal(activeStepBtn, '3', 'Phase 3 must remain active after clicking + CP');

    // 5. Test Resupply Shop purchase: spend 4 SP
    await page.evaluate(() => {
      window.confirm = () => true;
      if (typeof window.executeEnhancedResupplyPurchase === 'function') {
        window.executeEnhancedResupplyPurchase('Field Promotion', 4);
      } else if (typeof window.spendSP === 'function') {
        window.spendSP(4);
      }
    });

    const spCapText = await page.$eval('#hudSpCap', el => el.innerText.trim());
    assert.equal(spCapText, '(4/16)', 'HUD SP tracker must accompany the 4 SP spent on the resupply shop');

    // Phase 3 must still be active after spending SP
    activeStepBtn = await page.$eval('#roundPhaseStepper .active-step', el => el.getAttribute('data-step'));
    assert.equal(activeStepBtn, '3', 'Phase 3 must remain active after resupply purchase');

    // 6. Advance to next battle round: now phase step MUST reset to 1, and tracker resets to (0/16)
    await page.click('#nextRoundBtn');
    await page.waitForTimeout(200);

    const r2ActiveStep = await page.$eval('#roundPhaseStepper .active-step', el => el.getAttribute('data-step'));
    const r2SpCapText = await page.$eval('#hudSpCap', el => el.innerText.trim());
    assert.equal(r2ActiveStep, '1', 'Advancing battle round must reset guided phase stepper to Step 1');
    assert.equal(r2SpCapText, '(0/16)', 'Advancing battle round must reset SP spent tracker to (0/16)');
  } finally {
    await browser.close();
  }
});

test('UI Boundary: pages/spawner.html failing Secondary #17 wipes all fortifications, and phase stepper does not cycle past phase 5', async () => {
  const browser = await launchTestBrowser();
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await page.addInitScript(() => {
      window.confirm = () => true;
      try {
        localStorage.setItem('foa_horde_session_v1', JSON.stringify({
          seed: 'TEST-FORT-WIPE',
          selectedModeVal: 'solo',
          isSoloMode: true,
          battleRound: 2,
          sp: 8,
          activeMiseries: [],
          activeSecondaries: [{ id: 17, name: 'Spruce This Place Up', punWipeFortifications: true }],
          hasActiveSession: true,
          fortChecks: [true, false, false, true, false, false, false],
          teleCount: 2,
          currentGuidedStep: 4
        }));
      } catch (e) {}
    });

    const filePath = 'file:///' + path.resolve(ROOT_DIR, 'pages/spawner.html').replace(/\\/g, '/');
    await page.route('**/rest/v1/rpc/**', route => route.abort());
    await page.goto(filePath, { waitUntil: 'load' });

    await page.evaluate(() => {
      window.confirm = () => true;
      if (typeof window.switchTab === 'function') window.switchTab(1);
    });

    // 1. Verify initial active fortifications (FOB and Field Hospital are checked, Teleporters = 2)
    const fobChecked = await page.$eval('#fobFortCheck', el => el.checked);
    const hospChecked = await page.$eval('#fieldHospitalCheck', el => el.checked);
    const teleVal = await page.$eval('#teleCount', el => el.innerText.trim());

    assert.equal(fobChecked, true, 'FOB check should initially be checked');
    assert.equal(hospChecked, true, 'Field Hospital check should initially be checked');
    assert.equal(teleVal, '2', 'Teleporters should initially be 2');

    // 2. Fail Secondary #17 ("Spruce This Place Up")
    await page.evaluate(() => {
      if (typeof window.resolveSecondaryOutcome === 'function') {
        window.resolveSecondaryOutcome(0, false);
      }
    });

    // 3. Verify all fortifications have been wiped
    const fobAfterWipe = await page.$eval('#fobFortCheck', el => el.checked);
    const hospAfterWipe = await page.$eval('#fieldHospitalCheck', el => el.checked);
    const teleAfterWipe = await page.$eval('#teleCount', el => el.innerText.trim());

    assert.equal(fobAfterWipe, false, 'FOB must be unchecked after Secondary #17 fails');
    assert.equal(hospAfterWipe, false, 'Field Hospital must be unchecked after Secondary #17 fails');
    assert.equal(teleAfterWipe, '0', 'Teleporters must be reset to 0 after Secondary #17 fails');

    // 4. Test phase stepper clamping at Step 5
    await page.evaluate(() => {
      if (typeof window.setGuidedPhaseStep === 'function') {
        window.setGuidedPhaseStep(5);
      }
    });

    let currentStep = await page.$eval('#roundPhaseStepper .active-step', el => el.getAttribute('data-step'));
    assert.equal(currentStep, '5', 'Phase 5 should be active');

    // Click Next Step button at Phase 5: must clamp at Phase 5 and not cycle back to 1
    await page.click('#stepNextBtn');
    currentStep = await page.$eval('#roundPhaseStepper .active-step', el => el.getAttribute('data-step'));
    assert.equal(currentStep, '5', 'Clicking Next Step at Phase 5 must remain clamped at Phase 5');

    // 5. Test page reload restores currentGuidedStep from localStorage
    await page.evaluate(() => {
      if (typeof window.setGuidedPhaseStep === 'function') {
        window.setGuidedPhaseStep(4);
      }
    });
    await page.reload({ waitUntil: 'load' });
    await page.waitForTimeout(200);

    const reloadedStep = await page.$eval('#roundPhaseStepper .active-step', el => el.getAttribute('data-step'));
    assert.equal(reloadedStep, '4', 'Reloading page must restore currentGuidedStep without resetting to 1');
  } finally {
    await browser.close();
  }
});

