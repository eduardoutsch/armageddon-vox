# 📦 Fires of Armageddon // Bundle: App Engine (Part 1: State & Faction Tables)

Main horde application logic, state stores, and faction profile bindings (`js/app.js` lines 1 to 700).

## 📑 Table of Contents
- [js/app.js (Part 1: State & Faction Tables, Lines 1-700)](#file-jsappjspart1statefactiontableslines1700)

---

## File: `js/app.js (Part 1: State & Faction Tables, Lines 1-700)` <a id="file-jsappjspart1statefactiontableslines1700"></a>

````javascript
// Main UI and Session Controller for Fires of Armageddon

if (typeof require !== 'undefined') {
  if (typeof HORDE_FACTIONS === 'undefined') Object.assign(globalThis, require('./data.js'));
  if (typeof hashString === 'undefined') Object.assign(globalThis, require('./rng.js'));
  if (typeof getBracketInfo === 'undefined') Object.assign(globalThis, require('./spawner.js'));
}

let selectedModeVal = 'coop';
let selectedRoleVal = '1';
let activeHordeFaction = typeof HORDE_FACTIONS !== 'undefined' ? HORDE_FACTIONS[0] : null;

let personalSecretDeck = [];
let sharedMiseryDeck = [];
let sharedSecondaryDeck = [];
let activeCard = null;
let currentChoices = [];
let activeMiseries = [];
let activeSecondaries = [];
let battleRound = 0;
let isPrivacyHidden = false;
let isSoloMode = false;
let currentShopFilter = 'All';

let sp = 0;
let spGainedThisRound = 0;
let spRoundCap = 8;
let bankedSpLost = 0;
let cp = 2;
let stratCount = 0;
let currentZoneSpawns = [];

const STORAGE_KEY_SESSION = 'foa_horde_session_v1';

let isRestoring = false;

function saveSessionState() {
  if (isRestoring || typeof localStorage === 'undefined') return;
  // Guard: strictly only save if we are on the spawner page
  const setupScreen = document.getElementById('setupScreen');
  const gameScreen = document.getElementById('gameScreen');
  if (!setupScreen && !gameScreen) return;

  try {
    const isSessionActive = !!(gameScreen && !gameScreen.classList.contains('hidden'));
    const seed = (document.getElementById('seedInput')?.value || 'HADES-1').trim().toUpperCase();
    const setupFactionMode = document.getElementById('setupFactionMode')?.value || 'SYNC_ALL';

    // 1. Capture active tab
    let activeTab = 1;
    for (let i = 1; i <= 3; i++) {
      const t = document.getElementById('tab' + i);
      if (t && !t.classList.contains('hidden')) activeTab = i;
    }

    // 2. Capture fortifications and markers
    const fortChecks = [];
    document.querySelectorAll('.fort-grid input[type="checkbox"]').forEach(cb => {
      fortChecks.push(cb.checked);
    });
    const teleCount = parseInt(document.getElementById('teleCount')?.innerText || '0', 10);
    const wireCount = parseInt(document.getElementById('wireCount')?.innerText || '0', 10);
    const mineCount = parseInt(document.getElementById('mineCount')?.innerText || '0', 10);

    // 3. Capture spawner controls
    const spawnZoneCount = document.getElementById('spawnZoneCountSelect')?.value || '3';
    const extraSpawnMod = document.getElementById('extraSpawnMod')?.value || '0';
    const firstRollBonus = !!document.getElementById('firstRollBonusCheck')?.checked;
    const baitTrapBonus = !!document.getElementById('baitTrapBonusCheck')?.checked;
    const doubleCost = !!document.getElementById('doubleCostToggle')?.checked;
    const quickObjCount = parseInt(document.getElementById('quickObjCountInput')?.value || '2', 10);
    const lastClaimedCommandRound = (typeof window !== 'undefined' && window.lastClaimedCommandRound) ? window.lastClaimedCommandRound : 0;

    const data = {
      hasActiveSession: isSessionActive,
      seed,
      selectedModeVal,
      selectedRoleVal,
      setupFactionMode,
      activeHordeFactionName: activeHordeFaction ? activeHordeFaction.name : null,
      activeTab,
      battleRound,
      sp,
      spGainedThisRound,
      spRoundCap,
      bankedSpLost,
      cp,
      stratCount,
      activeCard,
      currentChoices,
      activeMiseries,
      activeSecondaries,
      personalSecretDeck,
      sharedMiseryDeck,
      sharedSecondaryDeck,
      currentZoneSpawns,
      isPrivacyHidden,
      currentShopFilter,
      fortChecks,
      teleCount,
      wireCount,
      mineCount,
      spawnZoneCount,
      extraSpawnMod,
      firstRollBonus,
      baitTrapBonus,
      doubleCost,
      quickObjCount,
      lastClaimedCommandRound
    };
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(data));
    if (typeof debouncedPushLiveSpawnerStateToCloud === 'function') {
      debouncedPushLiveSpawnerStateToCloud();
    }
  } catch (e) {
    console.error('Failed to save session state:', e);
  }
}

function restoreSessionState() {
  if (typeof localStorage === 'undefined') return false;
  if (typeof document !== 'undefined' && !document.getElementById('setupScreen') && !document.getElementById('gameScreen')) {
    return false;
  }

  isRestoring = true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SESSION);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (!data) return false;

    // Restore setup inputs
    if (data.selectedModeVal) selectMode(data.selectedModeVal);
    if (data.selectedRoleVal) selectRole(data.selectedRoleVal);
    if (data.seed && document.getElementById('seedInput')) {
      document.getElementById('seedInput').value = data.seed;
    }
    if (data.setupFactionMode && document.getElementById('setupFactionMode')) {
      document.getElementById('setupFactionMode').value = data.setupFactionMode;
    }

    if (!data.hasActiveSession) return false;

    // Restore session variables
    isSoloMode = (data.selectedModeVal === 'solo');
    spRoundCap = data.spRoundCap || (isSoloMode ? 16 : 8);
    battleRound = (typeof data.battleRound === 'number') ? data.battleRound : 0;
    sp = (typeof data.sp === 'number') ? data.sp : 0;
    spGainedThisRound = (typeof data.spGainedThisRound === 'number') ? data.spGainedThisRound : 0;
    bankedSpLost = (typeof data.bankedSpLost === 'number') ? data.bankedSpLost : 0;
    cp = (typeof data.cp === 'number') ? data.cp : 2;
    stratCount = data.stratCount || 0;

    if (typeof data.quickObjCount === 'number' && document.getElementById('quickObjCountInput')) {
      document.getElementById('quickObjCountInput').value = data.quickObjCount;
    }
    if (typeof window !== 'undefined') {
      if (data.lastClaimedCommandRound && data.lastClaimedCommandRound === battleRound && battleRound > 0) {
        window.lastClaimedCommandRound = data.lastClaimedCommandRound;
        if (typeof window.updateCommandObjectiveClaimButton === 'function') {
          const count = typeof data.quickObjCount === 'number' ? data.quickObjCount : 2;
          const hasFob = !!document.getElementById('fobFortCheck')?.checked;
          const baseSp = count + (hasFob && count > 0 ? 1 : 0);
          const awardedSp = isSoloMode ? baseSp * 2 : baseSp;
          window.updateCommandObjectiveClaimButton(true, battleRound, awardedSp);
        }
      } else {
        window.lastClaimedCommandRound = 0;
        if (typeof window.updateCommandObjectiveClaimButton === 'function') {
          window.updateCommandObjectiveClaimButton(false);
        }
      }
    }

    activeCard = data.activeCard || null;
    currentChoices = data.currentChoices || [];
    activeMiseries = data.activeMiseries || [];
    activeSecondaries = data.activeSecondaries || [];
    personalSecretDeck = data.personalSecretDeck || [];
    sharedMiseryDeck = data.sharedMiseryDeck || [];
    sharedSecondaryDeck = data.sharedSecondaryDeck || [];
    currentZoneSpawns = data.currentZoneSpawns || [];
    isPrivacyHidden = !!data.isPrivacyHidden;
    currentShopFilter = data.currentShopFilter || 'All';

    if (data.activeHordeFactionName && typeof HORDE_FACTIONS !== 'undefined') {
      const found = HORDE_FACTIONS.find(f => f.name === data.activeHordeFactionName) || HORDE_FACTIONS[0];
      activeHordeFaction = { ...found, syncedRoomCode: data.seed || getActiveRoomCode() };
      const sel = document.getElementById('hordeFactionSelect');
      if (sel) sel.value = activeHordeFaction.name;
      renderFactionReminderBanner();
    }

    const setupScreen = document.getElementById('setupScreen');
    const gameScreen = document.getElementById('gameScreen');
    if (setupScreen) setupScreen.classList.add('hidden');
    if (gameScreen) gameScreen.classList.remove('hidden');

    const cfg = (typeof HARD_MODE_ROUNDS !== 'undefined' && HARD_MODE_ROUNDS[Math.min(battleRound, 6)]) ? HARD_MODE_ROUNDS[Math.min(battleRound, 6)] : { misery: 1, spawnMod: '2D6+0' };
    const roundTitle = document.getElementById('roundTitle');
    if (roundTitle) roundTitle.innerText = battleRound === 0 ? "Deployment & Setup" : `Battle Round ${battleRound}`;
    const spawnModDisplay = document.getElementById('spawnModDisplay');
    if (spawnModDisplay) {
      spawnModDisplay.innerText = battleRound === 0
        ? "Open Tab 4 (Spawner) to roll Round 1 Horde Spawns!"
        : `${cfg.misery} Misery Drawn • ${cfg.spawnMod}`;
    }
    const nextRoundBtn = document.getElementById('nextRoundBtn');
    if (nextRoundBtn) {
      nextRoundBtn.innerText = battleRound === 0
        ? "Begin Battle Round 1"
        : (battleRound < 6 ? `Advance to Battle Round ${battleRound + 1}` : `Battle Round 6 Active (Final Stand)`);
    }
    const spawnerBtnRound = document.getElementById('spawnerBtnRound');
    if (spawnerBtnRound) {
      spawnerBtnRound.innerText = Math.max(1, battleRound);
    }

    if (activeCard) {
      const activeCardBox = document.getElementById('activeCardBox');
      if (activeCardBox) {
        activeCardBox.innerHTML = `
          <div class="card">
            <span class="badge">${activeCard.tags}</span>
            <h4 class="card-title">${activeCard.name}</h4>
            <p class="card-desc">${activeCard.desc}</p>
          </div>
        `;
      }
      const cmCodeBox = document.getElementById('cmCodeBox');
      if (cmCodeBox) cmCodeBox.innerText = `CM Verification Code: ${activeCard.code}`;
      const selectionArea = document.getElementById('selectionArea');
      if (selectionArea) selectionArea.classList.add('hidden');
      const lockedArea = document.getElementById('lockedArea');
      if (lockedArea) lockedArea.classList.remove('hidden');
    } else if (currentChoices && currentChoices.length > 0) {
      renderSecretChoices("Select 1 Initial Secret Objective");
    }

    if (isPrivacyHidden) {
      const pw = document.getElementById('PrivacyWrapper');
      if (pw) pw.classList.add('hidden');
      const pb = document.getElementById('privacyBtn');
      if (pb) pb.innerText = "Show Objective";
    }

    // Restore fortifications
    if (data.fortChecks && Array.isArray(data.fortChecks)) {
      document.querySelectorAll('.fort-grid input[type="checkbox"]').forEach((cb, idx) => {
        if (typeof data.fortChecks[idx] === 'boolean') cb.checked = data.fortChecks[idx];
      });
    }
    if (typeof data.teleCount === 'number' && document.getElementById('teleCount')) {
      document.getElementById('teleCount').innerText = data.teleCount;
    }
    if (typeof data.wireCount === 'number' && document.getElementById('wireCount')) {
      document.getElementById('wireCount').innerText = data.wireCount;
    }
    if (typeof data.mineCount === 'number' && document.getElementById('mineCount')) {
      document.getElementById('mineCount').innerText = data.mineCount;
    }

    // Restore spawner inputs
    if (data.spawnZoneCount && document.getElementById('spawnZoneCountSelect')) {
      document.getElementById('spawnZoneCountSelect').value = data.spawnZoneCount;
    }
    if (data.extraSpawnMod && document.getElementById('extraSpawnMod')) {
      document.getElementById('extraSpawnMod').value = data.extraSpawnMod;
    }
    if (typeof data.firstRollBonus === 'boolean' && document.getElementById('firstRollBonusCheck')) {
      document.getElementById('firstRollBonusCheck').checked = data.firstRollBonus;
    }
    if (typeof data.baitTrapBonus === 'boolean' && document.getElementById('baitTrapBonusCheck')) {
      document.getElementById('baitTrapBonusCheck').checked = data.baitTrapBonus;
    }
    if (typeof data.doubleCost === 'boolean' && document.getElementById('doubleCostToggle')) {
      document.getElementById('doubleCostToggle').checked = data.doubleCost;
    }

    updateHUD();
    renderSharedDecks();
    renderResupplyTable();
    if (currentZoneSpawns && currentZoneSpawns.length > 0) {
      renderSpawnZones();
    }
    loadCustomPool();

    // Restore active tab
    if (data.activeTab && data.activeTab >= 1 && data.activeTab <= 4) {
      switchTab(data.activeTab, false);
    }

    return true;
  } catch (e) {
    console.error('Failed to restore session state:', e);
    return false;
  } finally {
    isRestoring = false;
  }
}

function clearSessionState() {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY_SESSION);
}

// Populate Spawner Faction Dropdown and restore session on load
function initApp() {
  const sel = document.getElementById('hordeFactionSelect');
  if (sel && typeof HORDE_FACTIONS !== 'undefined') {
    sel.innerHTML = HORDE_FACTIONS.map(f => `<option value="${f.name}">${f.name} (${f.ruleTitle})</option>`).join('');
  }
  restoreSessionState();
}

if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
  if (typeof document !== 'undefined' && document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
  window.addEventListener('beforeunload', saveSessionState);
  window.addEventListener('pagehide', saveSessionState);
}

if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
  document.addEventListener('change', (e) => {
    if (e.target && typeof e.target.closest === 'function') {
      if (e.target.closest('#setupScreen, #gameScreen')) {
        saveSessionState();
      }
      if (e.target.closest('#pool34, #pool56, #pool79, #pool10')) {
        saveCustomPool();
      }
    }
  });
  document.addEventListener('input', (e) => {
    if (e.target && typeof e.target.closest === 'function') {
      if (e.target.closest('#seedInput, #extraSpawnMod')) {
        saveSessionState();
      }
      if (e.target.closest('#pool34, #pool56, #pool79, #pool10')) {
        saveCustomPool();
      }
    }
  });
}

function selectMode(mode) {
  selectedModeVal = mode;
  const coop = document.getElementById('modeCardCoop');
  const solo = document.getElementById('modeCardSolo');
  const roleSec = document.getElementById('playerRoleSection');
  if (coop) coop.classList.toggle('selected-red', mode === 'coop');
  if (solo) solo.classList.toggle('selected-red', mode === 'solo');
  if (roleSec) roleSec.classList.toggle('hidden', mode === 'solo');
  saveSessionState();
}

function selectRole(role) {
  selectedRoleVal = role;
  const r1 = document.getElementById('roleCard1');
  const r2 = document.getElementById('roleCard2');
  if (r1) r1.classList.toggle('selected', role === '1');
  if (r2) r2.classList.toggle('selected', role === '2');
  saveSessionState();
}

function resolveRoomSyncedFaction(code) {
  const mode = (typeof document !== 'undefined' && document.getElementById('setupFactionMode')?.value) || 'SYNC_ALL';
  const rngFac = mulberry32(hashString(code + "_HORDE_FACTION"));

  let picked = null;
  if (mode.startsWith("SYNC_")) {
    let pool = HORDE_FACTIONS;
    if (mode === "SYNC_CHAOS") pool = HORDE_FACTIONS.filter(f => f.group === "Chaos");
    if (mode === "SYNC_XENOS") pool = HORDE_FACTIONS.filter(f => f.group === "Xenos");
    if (mode === "SYNC_IMPERIUM") pool = HORDE_FACTIONS.filter(f => f.group === "Imperium");
    const idx = Math.floor(rngFac() * pool.length);
    picked = pool[idx];
  } else {
    picked = HORDE_FACTIONS.find(f => f.name === mode) || HORDE_FACTIONS[0];
  }

  activeHordeFaction = { ...picked, syncedRoomCode: code, syncedMode: mode };

  if (typeof document !== 'undefined') {
    const sel = document.getElementById('hordeFactionSelect');
    if (sel) sel.value = activeHordeFaction.name;
    renderFactionReminderBanner();
  }
  saveSessionState();
}

/**
 * Triggered whenever the user modifies the Horde Primary Faction Rule dropdown
 * on the setup screen. Immediately resolves the room-synced faction for the current
 * room code according to the chosen category/filter and persists state.
 */
function onSetupFactionModeChanged() {
  const code = getActiveRoomCode();
  resolveRoomSyncedFaction(code);
  saveSessionState();
  if (typeof debouncedPushLiveSpawnerStateToCloud === 'function') {
    debouncedPushLiveSpawnerStateToCloud();
  }
}

function manualChangeFaction() {
  const val = document.getElementById('hordeFactionSelect')?.value;
  const found = HORDE_FACTIONS.find(f => f.name === val) || HORDE_FACTIONS[0];
  activeHordeFaction = { ...found, syncedRoomCode: getActiveRoomCode(), syncedMode: val };
  renderFactionReminderBanner();

  // Clear stale spawns from previous faction so user never sees mismatched cards
  currentZoneSpawns = [];
  const spawnContainer = document.getElementById('spawnResultsContainer');
  if (spawnContainer) {
    spawnContainer.innerHTML = `
      <div class="card spawn-zone" style="opacity:0.65; text-align:center;">
        <p class="card-desc">Horde faction updated to ${activeHordeFaction.name}. Tap the green button above to roll synchronized spawns.</p>
      </div>
    `;
  }
  saveSessionState();
}

function onChangeSpawnZoneCount() {
  currentZoneSpawns = [];
  const spawnContainer = document.getElementById('spawnResultsContainer');
  if (spawnContainer) {
    spawnContainer.innerHTML = `
      <div class="card spawn-zone" style="opacity:0.65; text-align:center;">
        <p class="card-desc">Spawn zone count updated. Tap the green button above to roll synchronized spawns.</p>
      </div>
    `;
  }
  saveSessionState();
}

function renderFactionReminderBanner() {
  if (!activeHordeFaction) return;
  const t = document.getElementById('activeFactionBannerTitle');
  if (t) t.innerText = `HORDE FACTION: ${activeHordeFaction.name} — "${activeHordeFaction.ruleTitle}"`;
  const d = document.getElementById('activeFactionBannerDesc');
  if (d) d.innerText = activeHordeFaction.desc;
}

function startSession() {
  const code = getActiveRoomCode();
  const mode = selectedModeVal;
  const role = selectedRoleVal;

  isSoloMode = (mode === 'solo');
  spRoundCap = isSoloMode ? 16 : 8;

  // 1. Resolve Room-Synced Horde Faction (only if not already set by cloud room sync or if room/mode changed)
  const currentSetupMode = (typeof document !== 'undefined' && document.getElementById('setupFactionMode')?.value) || 'SYNC_ALL';
  if (!activeHordeFaction || activeHordeFaction.syncedRoomCode !== code || activeHordeFaction.syncedMode !== currentSetupMode) {
    resolveRoomSyncedFaction(code);
  }

  // 2. Resolve Room-Synced Decks
  const rngSecret = mulberry32(hashString(code + "_SEC"));
  const rngMisery = mulberry32(hashString(code + "_MIS"));
  const rngSecond = mulberry32(hashString(code + "_MSN"));

  const validSecrets = isSoloMode
    ? OBJECTIVES.filter(o => !o.tags.includes("Multiplayer"))
    : OBJECTIVES;

  const shuffledSecrets = seededShuffle(validSecrets, rngSecret);

  if (isSoloMode) {
    personalSecretDeck = shuffledSecrets;
    const n = (typeof document !== 'undefined') ? document.getElementById('secretPoolNotice') : null;
    if (n) n.innerText = `Solo Deck (${personalSecretDeck.length} valid cards; Multiplayer blocked)`;
  } else {
    personalSecretDeck = (role === "1") ? shuffledSecrets.slice(0, 17) : shuffledSecrets.slice(17, 34);
    const n = (typeof document !== 'undefined') ? document.getElementById('secretPoolNotice') : null;
    if (n) n.innerText = `Co-op Split Pool (${personalSecretDeck.length} cards)`;
  }

  if (!sharedMiseryDeck || sharedMiseryDeck.length === 0) {
    sharedMiseryDeck = seededShuffle(MISERIES, rngMisery);
  }
  if (!sharedSecondaryDeck || sharedSecondaryDeck.length === 0) {
    sharedSecondaryDeck = seededShuffle(SECONDARIES, rngSecond);
  }

  // Preserve existing spawns if already synced from room!
  if (!currentZoneSpawns || currentZoneSpawns.length === 0) {
    currentZoneSpawns = [];
    const spawnContainer = (typeof document !== 'undefined') ? document.getElementById('spawnResultsContainer') : null;
    if (spawnContainer) {
      spawnContainer.innerHTML = `
        <div class="card spawn-zone" style="opacity:0.65; text-align:center;">
          <p class="card-desc">Tap the green button above to generate synchronized brackets and units for each Spawn Zone.</p>
        </div>
      `;
    }
  } else {
    renderSpawnZones();
  }

  loadCustomPool();

  if (typeof document !== 'undefined') {
    const setupScreen = document.getElementById('setupScreen');
    if (setupScreen) setupScreen.classList.add('hidden');
    const gameScreen = document.getElementById('gameScreen');
    if (gameScreen) gameScreen.classList.remove('hidden');
  }

  currentChoices = drawSecretCards(2);
  renderSecretChoices("Select 1 Initial Secret Objective");
  updateHUD();
  renderSharedDecks();
  renderResupplyTable();
  if (typeof window !== 'undefined' && typeof window.resetCommandObjectiveClaimState === 'function') {
    window.resetCommandObjectiveClaimState();
  }
  switchTab(2);
  saveSessionState();
  debouncedPushLiveSpawnerStateToCloud();
}


function switchTab(tabNum, persist = true) {
  if (tabNum > 3 || tabNum < 1) tabNum = 1;
  [1, 2, 3].forEach(n => {
    const tabEl = document.getElementById('tab' + n);
    const btnEl = document.getElementById('tabBtn' + n);
    if (tabEl) tabEl.classList.toggle('hidden', n !== tabNum);
    if (btnEl) btnEl.classList.toggle('active', n === tabNum);
  });
  if (persist) saveSessionState();
}

function updateHUD() {
  const code = (document.getElementById('seedInput').value || 'HADES-1').trim().toUpperCase();
  document.getElementById('hudSessionInfo').innerText = isSoloMode ? `${code} • SOLO` : `${code} • P${selectedRoleVal}`;
  document.getElementById('hudRound').innerText = battleRound === 0 ? "Pre-Game" : `Round ${battleRound}/6`;
  document.getElementById('hudSp').innerText = sp;
  document.getElementById('hudSpCap').innerText = `(${spGainedThisRound}/${spRoundCap})`;
  document.getElementById('hudCp').innerText = cp;
  document.getElementById('hudStratTally').innerText = `(${stratCount} Strats)`;
  document.getElementById('spawnerBtnRound').innerText = Math.max(1, battleRound);
  saveSessionState();
}

// --- SECRET OBJECTIVES ---
function drawSecretCards(count) {
  let drawn = [];
  for (let i = 0; i < count; i++) {
    if (personalSecretDeck.length === 0) break;
    drawn.push(personalSecretDeck.shift());
  }
  return drawn;
}

function renderSecretChoices(promptText) {
  document.getElementById('selectionPrompt').innerText = promptText;
  document.getElementById('selectionArea').classList.remove('hidden');
  document.getElementById('lockedArea').classList.add('hidden');

  const list = document.getElementById('choicesList');
  list.innerHTML = currentChoices.map((c, idx) => {
    const isCur = (activeCard && c.id === activeCard.id);
    return `
      <div class="card">
        <span class="badge ${isCur ? 'gold' : ''}">${isCur ? 'Current Objective' : c.tags}</span>
        <h4 class="card-title">${c.name}</h4>
        <p class="card-desc">${c.desc}</p>
        <button onclick="pickSecretCard(${idx})" style="margin-top:14px; width:100%;">
          ${isCur ? 'Keep Current Objective' : 'Confirm & Lock Objective'}
        </button>
      </div>
    `;
  }).join('');
}

function pickSecretCard(chosenIdx) {
  const chosen = currentChoices[chosenIdx];
  currentChoices.forEach((c, idx) => {
    if (idx !== chosenIdx) personalSecretDeck.push(c);
  });
  activeCard = chosen;
  currentChoices = [];
  document.getElementById('selectionArea').classList.add('hidden');
  document.getElementById('lockedArea').classList.remove('hidden');

  document.getElementById('activeCardBox').innerHTML = `
    <div class="card">
      <span class="badge">${activeCard.tags}</span>
      <h4 class="card-title">${activeCard.name}</h4>
      <p class="card-desc">${activeCard.desc}</p>
    </div>
  `;
  document.getElementById('cmCodeBox').innerText = `CM Verification Code: ${activeCard.code}`;
  saveSessionState();
}

function triggerChangeOfPlans() {
  const drawn = drawSecretCards(2);
  if (drawn.length === 0) return alert("No cards remaining in your Secret Objective deck!");
  currentChoices = activeCard ? [activeCard, ...drawn] : drawn;
  renderSecretChoices("Change of Plans: Pick 1 or Keep Current");
}

function triggerOrbitalPunishment() {
  if (!confirm("Failed 'Establish Orbital Comms'? This draws 2 cards and assigns one at random!")) return;
  const drawn = drawSecretCards(2);
  const pool = activeCard ? [activeCard, ...drawn] : drawn;
  const randIdx = Math.floor(Math.random() * pool.length);
  currentChoices = pool;
  pickSecretCard(randIdx);
  alert(`New Randomized Secret Objective: ${activeCard.name}`);
}

function togglePrivacy() {
  isPrivacyHidden = !isPrivacyHidden;
  const pw = document.getElementById('PrivacyWrapper');
  if (pw) pw.classList.toggle('hidden', isPrivacyHidden);
  const pb = document.getElementById('privacyBtn');
  if (pb) pb.innerText = isPrivacyHidden ? "Show Objective" : "Hide Screen";
  saveSessionState();
}

// --- BATTLE ROUND, MISERY & SECONDARIES ---
function advanceBattleRound() {
  if (battleRound >= 6) {
    if (!confirm("Round 6 complete! Continue into Infinite Mode Round " + (battleRound + 1) + "?")) return;
  }
  battleRound++;
  spGainedThisRound = 0;
  bankedSpLost = 0;
  lastWarpSirenSeedKey = '';
  if (typeof window !== 'undefined' && typeof window.resetCommandObjectiveClaimState === 'function') {
    window.resetCommandObjectiveClaimState();
  }

  const cfg = HARD_MODE_ROUNDS[Math.min(battleRound, 6)];
  document.getElementById('roundTitle').innerText = `Battle Round ${battleRound}`;
  document.getElementById('spawnModDisplay').innerText = `${cfg.misery} Misery Drawn • ${cfg.spawnMod}`;
  document.getElementById('nextRoundBtn').innerText = battleRound < 6
    ? `Advance to Battle Round ${battleRound + 1}`
    : `Battle Round 6 Active (Final Stand)`;

  activeMiseries = [];
  activeSecondaries = [];

  drawMisery(cfg.misery);
  // Orks Round 3 High (Green) Tide check
  if (battleRound === 3 && activeHordeFaction.name === 'Orks') {
    drawMisery(1);
  }

  if (battleRound <= 5) {
    drawSecondary(battleRound === 1);
  }

  updateHUD();
  renderSharedDecks();
  debouncedPushLiveSpawnerStateToCloud();
}

function drawMisery(count) {
  for (let i = 0; i < count; i++) {
    if (sharedMiseryDeck.length === 0) {
      const code = (document.getElementById('seedInput').value || 'HADES-1').trim().toUpperCase();
      sharedMiseryDeck = seededShuffle(MISERIES, mulberry32(hashString(code + "_MIS_R" + battleRound)));
    }
    const card = sharedMiseryDeck.shift();
    activeMiseries.push(card);
    if (card.id === 20) drawMisery(2);
    if (card.id === 14 && isSoloMode) drawMisery(2);
  }
  renderSharedDecks();
  saveSessionState();
}

function triggerSpecificMisery() {
  const id = parseInt(document.getElementById('specificMiserySelect').value, 10);
  const found = MISERIES.find(m => m.id === id);
  if (!found) return;
  sharedMiseryDeck = sharedMiseryDeck.filter(m => m.id !== id);
  activeMiseries.push(found);
  renderSharedDecks();
  saveSessionState();
}

function drawSecondary(isRound1) {
  if (sharedSecondaryDeck.length === 0) {
    const code = (document.getElementById('seedInput').value || 'HADES-1').trim().toUpperCase();
    sharedSecondaryDeck = seededShuffle(SECONDARIES, mulberry32(hashString(code + "_MSN_R" + battleRound)));
  }
  let skipped = [];
  let chosen = null;
````
