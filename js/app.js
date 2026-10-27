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
  while (sharedSecondaryDeck.length > 0) {
    let candidate = sharedSecondaryDeck.shift();
    if (isRound1 && candidate.r1Skip) {
      skipped.push(candidate);
    } else {
      chosen = candidate;
      break;
    }
  }
  sharedSecondaryDeck.push(...skipped);
  if (chosen) activeSecondaries.push(chosen);
  renderSharedDecks();
  saveSessionState();
}

function replaceSecondary() {
  if (activeSecondaries.length === 0) return alert("No active Secondary Mission to replace!");
  activeSecondaries.pop();
  drawSecondary(battleRound === 1);
  saveSessionState();
}

function renderSharedDecks() {
  document.getElementById('secDeckCount').innerText = `${sharedSecondaryDeck.length} in deck`;
  document.getElementById('misDeckCount').innerText = `${sharedMiseryDeck.length} in deck`;

  const secBox = document.getElementById('activeSecondariesBox');
  if (activeSecondaries.length === 0) {
    secBox.innerHTML = `<div class="card secondary" style="opacity:0.65; padding:14px 16px; margin:0; min-height:52px; box-sizing:border-box; display:flex; align-items:center;"><p class="card-desc" style="margin:0;">No active Secondary Mission.</p></div>`;
  } else {
    secBox.innerHTML = activeSecondaries.map(s => `
      <div class="card secondary">
        <span class="badge gold">Secondary Mission</span>
        <h4 class="card-title">${s.name}</h4>
        <p class="card-desc">${s.cond}</p>
        <div class="meta-row">
          <span class="reward-pill"><strong>Reward:</strong> ${s.rew}</span>
          <span class="punish-pill"><strong>Failure:</strong> ${s.pun}</span>
        </div>
      </div>
    `).join('');
  }

  const misBox = document.getElementById('activeMiseriesBox');
  if (activeMiseries.length === 0) {
    misBox.innerHTML = `<div class="card misery" style="opacity:0.65; padding:14px 16px; margin:0; min-height:52px; box-sizing:border-box; display:flex; align-items:center;"><p class="card-desc" style="margin:0;">No active Misery Cards.</p></div>`;
  } else {
    misBox.innerHTML = activeMiseries.map(m => `
      <div class="card misery">
        <span class="badge red">Misery Effect</span>
        <h4 class="card-title">${m.name}</h4>
        <p class="card-desc">${m.desc}</p>
      </div>
    `).join('');
  }
}

// --- TAB 4: ROOM-SYNCED HORDE SPAWNER ---
function saveCustomPool() {
  const el34 = document.getElementById('pool34');
  if (!el34) return;
  const pool = {
    b34: el34.value,
    b56: document.getElementById('pool56') ? document.getElementById('pool56').value : '',
    b79: document.getElementById('pool79') ? document.getElementById('pool79').value : '',
    b10: document.getElementById('pool10') ? document.getElementById('pool10').value : '',
    b13: document.getElementById('pool13') ? document.getElementById('pool13').value : ''
  };
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('armageddon_horde_pool', JSON.stringify(pool));
  }
  if (typeof alert === 'function') alert("Custom Shelf Pool saved!");
}

function loadCustomPool() {
  if (typeof localStorage === 'undefined') return;
  const saved = localStorage.getItem('foa_custom_shelf_pool_v1') || localStorage.getItem('armageddon_horde_pool');
  if (!saved) return;
  try {
    const p = JSON.parse(saved);
    if (p.b34 && document.getElementById('pool34')) document.getElementById('pool34').value = p.b34;
    if (p.b56 && document.getElementById('pool56')) document.getElementById('pool56').value = p.b56;
    if (p.b79 && document.getElementById('pool79')) document.getElementById('pool79').value = p.b79;
    if (p.b10 && document.getElementById('pool10')) document.getElementById('pool10').value = p.b10;
    if (p.b13 && document.getElementById('pool13')) document.getElementById('pool13').value = p.b13;
  } catch (e) {}
}

function rollAllSpawnZones() {
  if (battleRound === 6) {
    return alert("Battle Round 6 (Hard Mode Final Stand): Do NOT roll Spawn Rolls in Round 6!");
  }
  const code = (document.getElementById('seedInput')?.value || 'HADES-1').trim().toUpperCase();
  const effRound = Math.max(1, battleRound);
  const numZones = parseInt(document.getElementById('spawnZoneCountSelect')?.value || '3', 10);
  const fac = activeHordeFaction ? activeHordeFaction.name : (document.getElementById('hordeFactionSelect')?.value || 'Chaos Daemons');
  const extraMod = parseInt(document.getElementById('extraSpawnMod')?.value, 10) || 0;
  const jammerActive = !!document.getElementById('jammerCheck')?.checked;
  const unluckyNightActive = activeMiseries.some(m => m.id === 7);
  const firstBonus6 = !!document.getElementById('firstRollBonusCheck')?.checked;
  const firstBonus12 = !!document.getElementById('baitTrapBonusCheck')?.checked;

  const rndIndex = Math.max(1, Math.min(effRound, 5));
  let baseRoundMod = HARD_MODE_ROUNDS[rndIndex].spawnModNum;
  if (effRound === 3 && fac === 'Orks') baseRoundMod += 1;

  currentZoneSpawns = [];

  for (let z = 1; z <= numZones; z++) {
    // Seeded RNG per Room + Round + Zone so both phones roll identical spawns!
    const rngZone = mulberry32(hashString(`${code}_SPAWN_R${effRound}_Z${z}`));
    let unmod = 0;
    let diceStr = "";

    if (z === 1 && effRound >= 4 && fac === 'Adepta Sororitas') {
      unmod = 12;
      diceStr = "Auto-12 (Martyrs & Miracles)";
    } else if (unluckyNightActive) {
      const d1 = Math.floor(rngZone() * 6) + 1;
      const d2 = Math.floor(rngZone() * 6) + 1;
      const d3 = Math.floor(rngZone() * 6) + 1;
      const sorted = [d1, d2, d3].sort((a,b) => b - a);
      unmod = sorted[0] + sorted[1];
      diceStr = `3D6 Drop Lowest (${d1},${d2},${d3} → ${unmod})`;
    } else {
      const d1 = Math.floor(rngZone() * 6) + 1;
      const d2 = Math.floor(rngZone() * 6) + 1;
      unmod = d1 + d2;
      diceStr = `2D6 (${d1}+${d2} = ${unmod})`;
    }

    let totalMod = baseRoundMod + extraMod + (jammerActive ? -1 : 0);
    if (z === 1 && firstBonus6) totalMod += 6;
    if (z === 1 && firstBonus12) totalMod += 12;

    const finalRoll = unmod + totalMod;
    const bInfo = getBracketInfo(finalRoll, unmod);
    const unitPicked = (bInfo.key === 'NONE') ? 'None' : pickSyncedUnitFromBracket(bInfo.key, rngZone);

    currentZoneSpawns.push({
      zone: z,
      diceStr,
      unmod,
      totalMod,
      finalRoll,
      bracketKey: bInfo.key,
      bracketLabel: bInfo.label,
      pts: bInfo.pts,
      units: [unitPicked]
    });
  }

  renderSpawnZones();
  saveSessionState();
}

function rollDownZone(idx) {
  const z = currentZoneSpawns[idx];
  const rollDownResult = calculateRollDown(z.bracketKey);
  if (!rollDownResult) {
    return alert("Cannot roll down lower than Bracket [3–4]!");
  }

  const { nextKey, bracketLabel, pts } = rollDownResult;
  const code = (document.getElementById('seedInput').value || 'HADES-1').trim().toUpperCase();
  const rngDown = mulberry32(hashString(`${code}_ROLLDOWN_R${battleRound}_Z${z.zone}_${nextKey}`));

  const newCount = z.units.length * 2;
  let newUnits = [];
  for (let i = 0; i < newCount; i++) {
    newUnits.push(pickSyncedUnitFromBracket(nextKey, rngDown));
  }
  z.bracketKey = nextKey;
  z.bracketLabel = bracketLabel;
  z.pts = pts;
  z.units = newUnits;
  renderSpawnZones();
  saveSessionState();
}

function renderSpawnZones() {
  const container = document.getElementById('spawnResultsContainer');
  if (!container) return;
  container.innerHTML = currentZoneSpawns.map((z, idx) => {
    if (typeof z === 'string') {
      return `
        <div class="card spawn-zone">
          <span class="badge green">Spawn Zone ${idx + 1}</span>
          <h4 class="card-title" style="margin-top:6px;">${z}</h4>
        </div>
      `;
    }
    const zoneNum = z?.zone || idx + 1;
    const bracketLabel = z?.bracketLabel || 'Spawn';
    const ptsStr = z?.pts ? ` (${z.pts})` : '';
    const diceStr = z?.diceStr || '';
    const modStr = z?.totalMod !== undefined ? ` | Mod: ${z.totalMod >= 0 ? '+' + z.totalMod : z.totalMod}` : '';
    const rollStr = z?.finalRoll !== undefined ? ` → <strong>Total: ${z.finalRoll}</strong>` : '';
    const unitsStr = Array.isArray(z?.units) ? z.units.join('  +  ') : (z?.units || '');

    return `
      <div class="card spawn-zone">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap;">
          <span class="badge green">Spawn Zone ${zoneNum} • ${bracketLabel}${ptsStr}</span>
          <span class="hud-sub">${diceStr}${modStr}${rollStr}</span>
        </div>
        <h4 class="card-title" style="margin-top:6px;">${unitsStr}</h4>
        ${(z?.bracketKey && z.bracketKey !== 'NONE' && z.bracketKey !== '3-4') ? `
          <div style="display:flex; justify-content:flex-end; margin-top:10px;">
            <button class="btn-ghost btn-sm" onclick="rollDownZone(${idx})">
              ⤵️ Roll Down (Spawn 2x Lower Bracket Units Instead)
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

// --- SP, CP & RESUPPLY SHOP ---
/**
 * Increases Supply Points (SP).
 * Accounts for previously reduced banked SP (restoring banked balance without consuming
 * from the finite round cap), and enforces the per-round finite cap (spRoundCap).
 * @param {number} amount
 */
function gainSP(amount) {
  let toAdd = amount;
  if (bankedSpLost > 0) {
    const restore = Math.min(toAdd, bankedSpLost);
    bankedSpLost -= restore;
    sp += restore;
    toAdd -= restore;
  }
  if (toAdd > 0) {
    const remainingCap = spRoundCap - spGainedThisRound;
    if (remainingCap <= 0) {
      if (typeof confirm === 'function' && !confirm(`Round cap of ${spRoundCap} SP reached! Add SP anyway?`)) {
        updateHUD();
        return;
      }
      sp += toAdd;
    } else {
      const actual = Math.min(toAdd, remainingCap);
      sp += actual;
      spGainedThisRound += actual;
      const overflow = toAdd - actual;
      if (overflow > 0) {
        if (typeof confirm === 'function' && !confirm(`Round cap of ${spRoundCap} SP reached! Add SP anyway?`)) {
          updateHUD();
          return;
        }
        sp += overflow;
      }
    }
  }
  updateHUD();
}

/**
 * Decreases Supply Points (SP).
 * Symmetrically decrements the current round's earned tally (spGainedThisRound)
 * so that reducing and increasing SP does not consume finite round cap allocations.
 * Any reduction beyond round-earned SP is tracked in bankedSpLost so restoring it
 * later does not falsely consume from the finite round cap.
 * @param {number} amount
 */
function loseSP(amount) {
  const prevSp = sp;
  sp = Math.max(0, sp - amount);
  const actualLost = prevSp - sp;
  if (actualLost > 0) {
    if (spGainedThisRound > 0) {
      const capReduction = Math.min(spGainedThisRound, actualLost);
      spGainedThisRound -= capReduction;
      const remainingLost = actualLost - capReduction;
      bankedSpLost += remainingLost;
    } else {
      bankedSpLost += actualLost;
    }
  }
  if (sp === 0) {
    bankedSpLost = 0;
  }
  updateHUD();
}

/**
 * Manually adjusts or resets the SP gained this round tally via prompt.
 */
function adjustSpRoundTally() {
  if (typeof prompt !== 'function') return;
  const input = prompt(`Set SP gained this round (0 to ${spRoundCap}):`, String(spGainedThisRound));
  if (input !== null) {
    const val = parseInt(input, 10);
    if (!isNaN(val) && val >= 0) {
      spGainedThisRound = Math.min(val, spRoundCap);
      bankedSpLost = 0;
      updateHUD();
    }
  }
}

/**
 * Manually adjusts or resets the Stratagems used tally via prompt.
 */
function adjustStratTally() {
  if (typeof prompt !== 'function') return;
  const input = prompt("Set Stratagems used tally (or 0 to reset):", String(stratCount));
  if (input !== null) {
    const val = parseInt(input, 10);
    if (!isNaN(val) && val >= 0) {
      stratCount = val;
      updateHUD();
    }
  }
}

function adjCP(delta) {
  cp = Math.max(0, cp + delta);
  updateHUD();
}

/**
 * Deducts CP for using a Stratagem and increments the Stratagems used tally.
 * Supports Stratagems costing 1, 2, 3, or custom CP amounts.
 * @param {number|string} cost - Amount of CP to spend (defaults to 1).
 */
function spendCPForStrat(cost = 1) {
  let c = cost;
  if (c === 'custom') {
    if (typeof prompt !== 'function') return;
    const input = prompt("Enter CP cost for Stratagem (e.g. 1, 2, 3):", "1");
    if (input === null) return;
    c = parseInt(input, 10);
  } else {
    c = parseInt(c, 10);
  }
  if (isNaN(c) || c < 1) c = 1;

  // Check for Misery #22 (Comms Jammed) lockout
  const commsJammed = Array.isArray(activeMiseries) && activeMiseries.some(m => m && m.id === 22);
  if (commsJammed && typeof confirm === 'function') {
    const override = confirm("⚠️ Warning: Misery #22 (Comms Jammed) is active! Players cannot use Stratagems or spend Command Points this round.\n\nDo you want to override and spend CP anyway?");
    if (!override) return;
  }

  if (cp < c) {
    const msg = cp <= 0
      ? "0 CP remaining!"
      : `Not enough CP! Have ${cp} CP, but Stratagem costs ${c} CP.`;
    return alert(msg);
  }

  cp -= c;
  stratCount++;
  updateHUD();
}

/**
 * Manually sets the Command Points (CP) pool via prompt.
 */
function adjustCpDirect() {
  if (typeof prompt !== 'function') return;
  const input = prompt("Set Command Points (CP) pool:", String(cp));
  if (input !== null) {
    const val = parseInt(input, 10);
    if (!isNaN(val) && val >= 0) {
      cp = val;
      updateHUD();
    }
  }
}

function adjMarker(id, delta, max) {
  const el = document.getElementById(id);
  if (!el) return;
  let val = parseInt(el.innerText, 10) + delta;
  el.innerText = Math.max(0, Math.min(max, val));
  saveSessionState();
}

function setShopFilter(tag, btnEl) {
  currentShopFilter = tag;
  document.querySelectorAll('.filter-bar .chip').forEach(b => b.classList.remove('active'));
  btnEl.classList.add('active');
  renderResupplyTable();
}

function buyResupply(idx) {
  const item = RESUPPLIES[idx];
  const isDoubled = document.getElementById('doubleCostToggle').checked;
  let finalCost = item.cost;

  if (item.varCost) {
    const input = prompt(`Enter X SP to spend on ${item.name}:`, "3");
    if (input === null) return;
    finalCost = parseInt(input, 10) || 0;
  }
  if (isDoubled) finalCost *= 2;

  if (sp < finalCost) {
    return alert(`Insufficient SP! Need ${finalCost} SP (You have ${sp} SP).`);
  }
  sp -= finalCost;
  if (item.autoCP) cp += item.autoCP;
  if (item.name === "A Change of Plans") {
    switchTab(2);
    triggerChangeOfPlans();
  } else if (item.name === "Tempt Fate") {
    drawSecondary(battleRound === 1);
    switchTab(1);
  } else if (item.name === "Advanced Tactics") {
    replaceSecondary();
    switchTab(1);
  }
  updateHUD();
}

function renderResupplyTable() {
  const isDoubled = document.getElementById('doubleCostToggle').checked;
  const container = document.getElementById('resupplyList');

  const filtered = RESUPPLIES.map((r, i) => ({ ...r, origIdx: i }))
    .filter(r => currentShopFilter === 'All' || r.tags.includes(currentShopFilter));

  container.innerHTML = filtered.map(r => {
    const dispCost = r.varCost ? (isDoubled ? "2X SP" : "X SP") : `${isDoubled ? r.cost * 2 : r.cost} SP`;
    return `
      <div class="card resupply">
        <div>
          <span class="badge blue" style="margin-bottom:4px;">${dispCost} • ${r.tags}</span>
          <h4 class="card-title" style="font-size:1rem;">${r.name}</h4>
          <p class="card-desc" style="font-size:0.86rem;">${r.desc}</p>
        </div>
        <button class="btn-blue btn-sm" onclick="buyResupply(${r.origIdx})">Buy</button>
      </div>
    `;
  }).join('');
}

function leaveSession() {
  if (typeof confirm === 'function' && !confirm("Exit current battle terminal?")) return;
  const gameScreen = document.getElementById('gameScreen');
  if (gameScreen) gameScreen.classList.add('hidden');
  const setupScreen = document.getElementById('setupScreen');
  if (setupScreen) setupScreen.classList.remove('hidden');
  saveSessionState();
}

function clearSpawnerResults() {
  currentZoneSpawns = [];
  lastWarpSirenSeedKey = '';
  const spawnContainer = document.getElementById('spawnResultsContainer');
  if (spawnContainer) {
    spawnContainer.innerHTML = `
      <div class="card spawn-zone" style="opacity:0.65; text-align:center;">
        <p class="card-desc">Tap the green button above to generate synchronized brackets and units for each Spawn Zone.</p>
      </div>
    `;
  }
  saveSessionState();
  debouncedPushLiveSpawnerStateToCloud();
}

function resetMatchToSetup() {
  if (typeof confirm === 'function' && !confirm("Reset current battle and spawner to mission setup? All active round progress, objectives, and spawn cards will be cleared.")) {
    return;
  }
  clearSessionState();
  currentZoneSpawns = [];
  lastWarpSirenSeedKey = '';
  if (typeof window !== 'undefined' && typeof window.resetCommandObjectiveClaimState === 'function') {
    window.resetCommandObjectiveClaimState();
  }

  battleRound = 0;
  activeCard = null;
  activeMiseries = [];
  activeSecondaries = [];
  personalSecretDeck = [];
  sharedMiseryDeck = [];
  sharedSecondaryDeck = [];
  currentChoices = [];
  sp = 0;
  spGainedThisRound = 0;
  bankedSpLost = 0;
  cp = 2;
  stratCount = 0;

  const spawnContainer = document.getElementById('spawnResultsContainer');
  if (spawnContainer) {
    spawnContainer.innerHTML = `
      <div class="card spawn-zone" style="opacity:0.65; text-align:center;">
        <p class="card-desc">Tap the green button above to generate synchronized brackets and units for each Spawn Zone.</p>
      </div>
    `;
  }

  const setupScreen = document.getElementById('setupScreen');
  if (setupScreen) setupScreen.classList.remove('hidden');
  const gameScreen = document.getElementById('gameScreen');
  if (gameScreen) gameScreen.classList.add('hidden');
  switchTab(1, false);
}

// =========================================================================
// LIVE CLOUD ROOM SYNCHRONIZATION (SUPABASE)
// =========================================================================
let clientDeviceId = null;
function getClientDeviceId() {
  if (clientDeviceId) return clientDeviceId;
  try {
    let saved = (typeof sessionStorage !== 'undefined') ? sessionStorage.getItem('foa_spawner_device_id') : null;
    if (!saved) {
      saved = 'dev_' + Math.random().toString(36).slice(2, 10) + '_' + Date.now();
      if (typeof sessionStorage !== 'undefined') sessionStorage.setItem('foa_spawner_device_id', saved);
    }
    clientDeviceId = saved;
  } catch (e) {
    clientDeviceId = 'dev_' + Math.random().toString(36).slice(2, 10);
  }
  return clientDeviceId;
}

let currentRoomCode = '';
let roomCodeChangeTimer = null;

function getActiveRoomCode() {
  return ((typeof document !== 'undefined' && document.getElementById('seedInput')?.value) || 'HADES-1').trim().toUpperCase();
}

async function onRoomCodeChanged(immediate = false) {
  if (roomCodeChangeTimer) {
    clearTimeout(roomCodeChangeTimer);
    roomCodeChangeTimer = null;
  }

  const runSync = async () => {
    const roomCode = getActiveRoomCode();
    if (!roomCode) return false;

    // Reset watermark when switching or pasting room codes
    currentRoomCode = roomCode;
    lastSyncedUpdatedAt = 0;
    lastKnownStateSignature = '';

    updateSyncBadge(true, `☁️ Connecting to Room (${roomCode})...`);

    // 1. Try pulling existing live session from cloud FIRST
    const pulled = await pollLiveSpawnerStateFromCloud(true);
    if (pulled) {
      return true;
    }

    // 2. If room does not exist in cloud, resolve deterministic faction for this seed
    resolveRoomSyncedFaction(roomCode);
    updateSyncBadge(true, `☁️ New Room Created (${roomCode})`);

    // 3. Register the new room in Supabase so joining allies immediately sync
    debouncedPushLiveSpawnerStateToCloud();
    return false;
  };

  if (immediate) {
    return await runSync();
  } else {
    roomCodeChangeTimer = setTimeout(runSync, 350);
  }
}

let lastSyncedUpdatedAt = 0;
let isPushingToCloud = false;
let isPollingFromCloud = false;
let pushCloudTimer = null;
let hasCompletedInitialSync = false;
let lastKnownStateSignature = '';
let lastWarpSirenSeedKey = '';

function triggerCardStaticShake(el) {
  if (!el || !el.classList) return;
  el.classList.remove('card-synced-shake');
  if (typeof el.offsetWidth === 'number') {
    void el.offsetWidth;
  }
  el.classList.add('card-synced-shake');
  setTimeout(() => {
    if (el && el.classList) el.classList.remove('card-synced-shake');
  }, 600);
}

function updateSyncBadge(isLive, labelText) {
  if (typeof document === 'undefined') return;
  const badge = document.getElementById('spawnerSyncBadge');
  if (badge) {
    badge.textContent = labelText || (isLive ? '☁️ Room Live' : '☁️ Room Offline');
    badge.classList.toggle('offline', !isLive);
    badge.style.borderColor = isLive ? 'rgba(16, 185, 129, 0.55)' : 'rgba(255, 71, 87, 0.45)';
    badge.style.color = isLive ? '#6ee7b7' : '#fca5a5';
    badge.style.background = isLive ? 'rgba(16, 185, 129, 0.14)' : 'rgba(255, 71, 87, 0.12)';
  }
  const setupBadge = document.getElementById('setupSyncPill');
  if (setupBadge && isLive) {
    setupBadge.textContent = labelText || (activeHordeFaction
      ? `☁️ Room Synced (${getActiveRoomCode()} • ${activeHordeFaction.name})`
      : '☁️ Live Room Sync Active');
  }
}


async function pushLiveSpawnerStateToCloud() {
  if (typeof fetch !== 'function') return false;
  const setupScreen = (typeof document !== 'undefined') ? document.getElementById('setupScreen') : null;
  const gameScreen = (typeof document !== 'undefined') ? document.getElementById('gameScreen') : null;
  if (!setupScreen && !gameScreen) return false;

  const roomCode = getActiveRoomCode();
  currentRoomCode = roomCode;
  const isSessionActive = !!(gameScreen && !gameScreen.classList.contains('hidden'));

  const fortChecks = [];
  if (typeof document !== 'undefined') {
    document.querySelectorAll('.fort-grid input[type="checkbox"]').forEach(cb => {
      fortChecks.push(cb.checked);
    });
  }

  const spawnZoneCount = (typeof document !== 'undefined' && document.getElementById('spawnZoneCountSelect')?.value) || '3';
  const extraSpawnMod = (typeof document !== 'undefined' && document.getElementById('extraSpawnMod')?.value) || '0';
  const setupFactionModeVal = (typeof document !== 'undefined' && document.getElementById('setupFactionMode')?.value) || 'SYNC_ALL';
  const firstRollBonus = !!(typeof document !== 'undefined' && document.getElementById('firstRollBonusCheck')?.checked);
  const baitTrapBonus = !!(typeof document !== 'undefined' && document.getElementById('baitTrapBonusCheck')?.checked);
  const doubleCost = !!(typeof document !== 'undefined' && document.getElementById('doubleCostToggle')?.checked);
  const teleCount = parseInt((typeof document !== 'undefined' && document.getElementById('teleCount')?.innerText) || '0', 10);
  const wireCount = parseInt((typeof document !== 'undefined' && document.getElementById('wireCount')?.innerText) || '0', 10);
  const mineCount = parseInt((typeof document !== 'undefined' && document.getElementById('mineCount')?.innerText) || '0', 10);

  const now = Date.now();
  lastSyncedUpdatedAt = now;

  const sharedRoomState = {
    roomCode,
    hasActiveSession: isSessionActive,
    battleRound,
    activeHordeFactionName: activeHordeFaction ? activeHordeFaction.name : null,
    setupFactionMode: setupFactionModeVal,
    spawnZoneCount,

    extraSpawnMod,
    firstRollBonus,
    baitTrapBonus,
    doubleCost,
    currentZoneSpawns,
    activeMiseries,
    sharedMiseryDeck,
    activeSecondaries,
    sharedSecondaryDeck,
    fortChecks,
    teleCount,
    wireCount,
    mineCount,
    updatedAt: now,
    lastSenderId: getClientDeviceId()
  };

  isPushingToCloud = true;
  try {
    const supabaseUrl = (typeof window !== 'undefined' && window.SUPABASE_URL) ? window.SUPABASE_URL : 'https://dsfvhjjalexqpbzqoaqb.supabase.co';
    const supabaseKey = (typeof window !== 'undefined' && window.SUPABASE_ANON_KEY) ? window.SUPABASE_ANON_KEY : 'sb_publishable_R3wXKsK7Gl54-8BNCauUNg_NIoosOOO';

    let currentHordePool = {};
    let currentNemesisStatus = {};
    try {
      const getRes = await fetch(`${supabaseUrl}/rest/v1/rpc/get_shared_spawn_pools`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({})
      });
      if (getRes && getRes.ok) {
        const cur = await getRes.json();
        if (cur) {
          currentHordePool = cur.horde_pool || {};
          currentNemesisStatus = cur.nemesis_status || {};
        }
      }
    } catch (e) {}

    const spawnerRooms = (currentNemesisStatus && currentNemesisStatus.spawner_rooms) ? currentNemesisStatus.spawner_rooms : {};
    spawnerRooms[roomCode] = sharedRoomState;

    const saveRes = await fetch(`${supabaseUrl}/rest/v1/rpc/save_shared_spawn_pools`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        p_horde_pool: null,
        p_nemesis_status: {
          ...currentNemesisStatus,
          spawner_rooms: spawnerRooms
        }
      })
    });

    if (saveRes && saveRes.ok) {
      updateSyncBadge(true, `☁️ Room Synced (${roomCode})`);
      return true;
    }
  } catch (err) {
    console.warn('Live spawner cloud push error:', err);
  } finally {
    isPushingToCloud = false;
  }
  return false;
}

function debouncedPushLiveSpawnerStateToCloud() {
  if (pushCloudTimer) clearTimeout(pushCloudTimer);
  pushCloudTimer = setTimeout(() => {
    pushLiveSpawnerStateToCloud();
  }, 400);
}

function applyRemoteSharedState(remoteState) {
  if (!remoteState) return;
  const isSessionActive = !!remoteState.hasActiveSession;

  const prevRound = battleRound;
  const prevFaction = activeHordeFaction ? activeHordeFaction.name : null;
  const prevSpawns = Array.isArray(currentZoneSpawns) ? [...currentZoneSpawns] : [];
  const prevMiseries = Array.isArray(activeMiseries) ? [...activeMiseries] : [];
  const prevSecondaries = Array.isArray(activeSecondaries) ? [...activeSecondaries] : [];

  const roundChanged = typeof remoteState.battleRound === 'number' && remoteState.battleRound !== prevRound;
  const factionChanged = !!(remoteState.activeHordeFactionName && remoteState.activeHordeFactionName !== prevFaction);
  const spawnsChanged = Array.isArray(remoteState.currentZoneSpawns) && JSON.stringify(remoteState.currentZoneSpawns) !== JSON.stringify(prevSpawns);
  const miseriesChanged = Array.isArray(remoteState.activeMiseries) && JSON.stringify(remoteState.activeMiseries) !== JSON.stringify(prevMiseries);
  const secondariesChanged = Array.isArray(remoteState.activeSecondaries) && JSON.stringify(remoteState.activeSecondaries) !== JSON.stringify(prevSecondaries);

  if (typeof remoteState.battleRound === 'number') {
    battleRound = remoteState.battleRound;
  }

  if (remoteState.activeHordeFactionName && typeof HORDE_FACTIONS !== 'undefined') {
    const found = HORDE_FACTIONS.find(f => f.name === remoteState.activeHordeFactionName);
    if (found) {
      const mode = remoteState.setupFactionMode || found.name;
      activeHordeFaction = {
        ...found,
        syncedRoomCode: remoteState.roomCode || getActiveRoomCode(),
        syncedMode: mode
      };
      const sel = (typeof document !== 'undefined') ? document.getElementById('hordeFactionSelect') : null;
      if (sel) sel.value = found.name;
      const setupSel = (typeof document !== 'undefined') ? document.getElementById('setupFactionMode') : null;
      if (setupSel) setupSel.value = mode;
      renderFactionReminderBanner();
    }
  }

  if (remoteState.setupFactionMode && typeof document !== 'undefined') {
    const modeSel = document.getElementById('setupFactionMode');
    if (modeSel) modeSel.value = remoteState.setupFactionMode;
  }

  if (Array.isArray(remoteState.currentZoneSpawns)) {
    currentZoneSpawns = remoteState.currentZoneSpawns;
    if (currentZoneSpawns.length > 0) {
      renderSpawnZones();
      if (typeof evaluateWarpBreachIntrusions === 'function') evaluateWarpBreachIntrusions();
    }
  }

  if (Array.isArray(remoteState.activeMiseries)) {
    activeMiseries = remoteState.activeMiseries;
  }
  if (Array.isArray(remoteState.sharedMiseryDeck)) {
    sharedMiseryDeck = remoteState.sharedMiseryDeck;
  }
  if (Array.isArray(remoteState.activeSecondaries)) {
    activeSecondaries = remoteState.activeSecondaries;
  }
  if (Array.isArray(remoteState.sharedSecondaryDeck)) {
    sharedSecondaryDeck = remoteState.sharedSecondaryDeck;
  }

  renderSharedDecks();

  if (typeof document !== 'undefined') {
    if (remoteState.spawnZoneCount && document.getElementById('spawnZoneCountSelect')) {
      document.getElementById('spawnZoneCountSelect').value = remoteState.spawnZoneCount;
    }
    if (remoteState.extraSpawnMod && document.getElementById('extraSpawnMod')) {
      document.getElementById('extraSpawnMod').value = remoteState.extraSpawnMod;
    }
    if (document.getElementById('firstRollBonusCheck')) {
      document.getElementById('firstRollBonusCheck').checked = !!remoteState.firstRollBonus;
    }
    if (document.getElementById('baitTrapBonusCheck')) {
      document.getElementById('baitTrapBonusCheck').checked = !!remoteState.baitTrapBonus;
    }
    if (document.getElementById('doubleCostToggle')) {
      document.getElementById('doubleCostToggle').checked = !!remoteState.doubleCost;
    }

    if (typeof remoteState.wireCount === 'number' && document.getElementById('wireCount')) {
      document.getElementById('wireCount').innerText = String(remoteState.wireCount);
    }
    if (typeof remoteState.teleCount === 'number' && document.getElementById('teleCount')) {
      document.getElementById('teleCount').innerText = String(remoteState.teleCount);
    }
    if (typeof remoteState.mineCount === 'number' && document.getElementById('mineCount')) {
      document.getElementById('mineCount').innerText = String(remoteState.mineCount);
    }
    if (Array.isArray(remoteState.fortChecks)) {
      const cbs = document.querySelectorAll('.fort-grid input[type="checkbox"]');
      cbs.forEach((cb, idx) => {
        if (idx < remoteState.fortChecks.length) cb.checked = !!remoteState.fortChecks[idx];
      });
    }

    // Trigger subtle CRT static shake specifically on the card(s) that changed
    if (roundChanged) {
      const roundBanner = document.querySelector('#tab1 .round-banner') || document.querySelector('.round-banner');
      if (roundBanner) triggerCardStaticShake(roundBanner);
    }
    if (factionChanged) {
      const factionBanner = document.querySelector('.faction-reminder-bar');
      if (factionBanner) triggerCardStaticShake(factionBanner);
    }
    if (spawnsChanged) {
      const zoneCards = document.querySelectorAll('#spawnResultsContainer .spawn-zone');
      zoneCards.forEach((card, idx) => {
        const prevZ = prevSpawns[idx];
        const curZ = currentZoneSpawns[idx];
        if (!prevZ || JSON.stringify(prevZ) !== JSON.stringify(curZ)) {
          triggerCardStaticShake(card);
        }
      });
    }
    if (miseriesChanged) {
      const misCards = document.querySelectorAll('#activeMiseriesBox .card.misery');
      misCards.forEach((card, idx) => {
        const prevM = prevMiseries[idx];
        const curM = activeMiseries[idx];
        if (!prevM || JSON.stringify(prevM) !== JSON.stringify(curM)) {
          triggerCardStaticShake(card);
        }
      });
    }
    if (secondariesChanged) {
      const secCards = document.querySelectorAll('#activeSecondariesBox .card.secondary');
      secCards.forEach((card, idx) => {
        const prevS = prevSecondaries[idx];
        const curS = activeSecondaries[idx];
        if (!prevS || JSON.stringify(prevS) !== JSON.stringify(curS)) {
          triggerCardStaticShake(card);
        }
      });
    }
  }

  // Update round titles and HUD
  if (typeof HARD_MODE_ROUNDS !== 'undefined' && battleRound > 0 && typeof document !== 'undefined') {
    const cfg = HARD_MODE_ROUNDS[Math.min(battleRound, 6)] || HARD_MODE_ROUNDS[1];
    const roundTitle = document.getElementById('roundTitle');
    if (roundTitle) roundTitle.innerText = `Battle Round ${battleRound}`;
    const spawnModDisplay = document.getElementById('spawnModDisplay');
    if (spawnModDisplay) spawnModDisplay.innerText = `${cfg.misery} Misery Drawn • ${cfg.spawnMod}`;
    const nextRoundBtn = document.getElementById('nextRoundBtn');
    if (nextRoundBtn) {
      nextRoundBtn.innerText = battleRound < 6
        ? `Advance to Battle Round ${battleRound + 1}`
        : `Battle Round 6 Active (Final Stand)`;
    }
    const btnRound = document.getElementById('spawnerBtnRound');
    if (btnRound) btnRound.textContent = String(battleRound);
  }

  updateHUD();

  if (isSessionActive && typeof document !== 'undefined') {
    const setupScreen = document.getElementById('setupScreen');
    const gameScreen = document.getElementById('gameScreen');
    if (setupScreen) setupScreen.classList.add('hidden');
    if (gameScreen) gameScreen.classList.remove('hidden');
  }

  // Persist to local cache so reload maintains sync
  saveSessionState();
}

async function pollLiveSpawnerStateFromCloud(force = false) {
  if (typeof fetch !== 'function' || isPushingToCloud || isPollingFromCloud) return false;
  const roomCode = getActiveRoomCode();
  if (roomCode !== currentRoomCode) {
    currentRoomCode = roomCode;
    lastSyncedUpdatedAt = 0;
    lastKnownStateSignature = '';
  }

  isPollingFromCloud = true;
  try {
    const supabaseUrl = (typeof window !== 'undefined' && window.SUPABASE_URL) ? window.SUPABASE_URL : 'https://dsfvhjjalexqpbzqoaqb.supabase.co';
    const supabaseKey = (typeof window !== 'undefined' && window.SUPABASE_ANON_KEY) ? window.SUPABASE_ANON_KEY : 'sb_publishable_R3wXKsK7Gl54-8BNCauUNg_NIoosOOO';

    const res = await fetch(`${supabaseUrl}/rest/v1/rpc/get_shared_spawn_pools`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({})
    });
    if (!res || !res.ok) return false;
    const data = await res.json();
    if (!data || !data.nemesis_status || !data.nemesis_status.spawner_rooms) return false;

    const remoteState = data.nemesis_status.spawner_rooms[roomCode];
    if (!remoteState || !remoteState.updatedAt) return false;

    if (!force) {
      if (remoteState.lastSenderId === getClientDeviceId()) return false;
      if (remoteState.updatedAt <= lastSyncedUpdatedAt) return false;
    }

    const currentSig = `${remoteState.battleRound || 0}_${remoteState.activeHordeFactionName || ''}_` +
      `${JSON.stringify(remoteState.currentZoneSpawns || [])}_` +
      `${JSON.stringify(remoteState.activeMiseries || [])}_` +
      `${JSON.stringify(remoteState.activeSecondaries || [])}`;

    if (!force && currentSig === lastKnownStateSignature) {
      lastSyncedUpdatedAt = remoteState.updatedAt;
      return false;
    }

    applyRemoteSharedState(remoteState);
    lastSyncedUpdatedAt = remoteState.updatedAt;
    lastKnownStateSignature = currentSig;

    updateSyncBadge(true, `☁️ Synced with Ally (${roomCode} • R${remoteState.battleRound || 0})`);

    // Audio cue plays strictly once per newly arrived remote change (never repeats or on initial hydration)
    if (hasCompletedInitialSync) {
      if (typeof window !== 'undefined' && window.VoxAudio && typeof window.VoxAudio.playCloudSyncChime === 'function') {
        window.VoxAudio.playCloudSyncChime();
      }
    } else {
      hasCompletedInitialSync = true;
    }
    return true;
  } catch (err) {
    return false;
  } finally {
    isPollingFromCloud = false;
  }
}


// Dual export for Node.js test runner and browser environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    get battleRound() { return battleRound; },
    get activeHordeFaction() { return activeHordeFaction; },
    get selectedRoleVal() { return selectedRoleVal; },
    get cp() { return cp; },
    get sp() { return sp; },
    get spGainedThisRound() { return spGainedThisRound; },
    get spRoundCap() { return spRoundCap; },
    get bankedSpLost() { return bankedSpLost; },
    get stratCount() { return stratCount; },
    get currentZoneSpawns() { return currentZoneSpawns; },
    get activeMiseries() { return activeMiseries; },
    get activeSecondaries() { return activeSecondaries; },
    selectMode,
    selectRole,
    resolveRoomSyncedFaction,
    manualChangeFaction,
    onChangeSpawnZoneCount,
    renderFactionReminderBanner,
    startSession,
    updateHUD,
    gainSP,
    loseSP,
    adjustSpRoundTally,
    adjustStratTally,
    adjCP,
    adjustCpDirect,
    spendCPForStrat,
    buyResupply,
    leaveSession,
    clearSpawnerResults,
    resetMatchToSetup,
    saveSessionState,
    restoreSessionState,
    clearSessionState,
    adjMarker,
    switchTab,
    togglePrivacy,
    advanceBattleRound,
    drawMisery,
    triggerSpecificMisery,
    drawSecondary,
    replaceSecondary,
    drawSecretCards,
    pickSecretCard,
    triggerChangeOfPlans,
    rollAllSpawnZones,
    rollDownZone,
    saveCustomPool,
    loadCustomPool,
    pushLiveSpawnerStateToCloud,
    pollLiveSpawnerStateFromCloud,
    getActiveRoomCode,
    onRoomCodeChanged,
    getClientDeviceId,
    updateSyncBadge,
    applyRemoteSharedState,
    triggerCardStaticShake,
    onSetupFactionModeChanged,
    getActiveHordeFaction: () => activeHordeFaction
  };
}

if (typeof window !== 'undefined') {
  window.getActiveRoomCode = getActiveRoomCode;
  window.onRoomCodeChanged = onRoomCodeChanged;
  window.onSetupFactionModeChanged = onSetupFactionModeChanged;
  window.pollLiveSpawnerStateFromCloud = pollLiveSpawnerStateFromCloud;
  window.debouncedPushLiveSpawnerStateToCloud = debouncedPushLiveSpawnerStateToCloud;
}

// =========================================================================
// CLOUD-SYNCED STANDARD HORDE POOL & [10+]/[13+] WARP-BREACH INTRUSION HOOK
// =========================================================================
(function () {
  const SUPABASE_URL_SPAWNER = 'https://dsfvhjjalexqpbzqoaqb.supabase.co';
  const SUPABASE_ANON_SPAWNER = 'sb_publishable_R3wXKsK7Gl54-8BNCauUNg_NIoosOOO';

  async function syncSpawnerPoolFromSupabase() {
    if (typeof fetch !== 'function' || typeof localStorage === 'undefined') return;
    try {
      const res = await fetch(`${SUPABASE_URL_SPAWNER}/rest/v1/rpc/get_shared_spawn_pools`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_SPAWNER,
          'Authorization': `Bearer ${SUPABASE_ANON_SPAWNER}`
        },
        body: JSON.stringify({})
      });
      if (!res || !res.ok) return;
      const data = await res.json();
      if (data && data.ok && data.horde_pool && typeof data.horde_pool === 'object' && Object.keys(data.horde_pool).length > 0) {
        if (data.horde_pool.byFaction) {
          const localRaw = localStorage.getItem('foa_custom_shelf_pool_v1');
          let localPool = {};
          try { localPool = localRaw ? JSON.parse(localRaw) : {}; } catch (e) {}
          const mergedByFaction = {
            ...(localPool.byFaction || {}),
            ...data.horde_pool.byFaction
          };
          const mergedPool = {
            ...localPool,
            ...data.horde_pool,
            byFaction: mergedByFaction
          };
          localStorage.setItem('foa_custom_shelf_pool_v1', JSON.stringify(mergedPool));
        } else {
          localStorage.setItem('foa_custom_shelf_pool_v1', JSON.stringify(data.horde_pool));
        }
        renderLiveSpawnerBracketTable();
      }
    } catch (e) {}
  }

  function renderLiveSpawnerBracketTable() {
    if (typeof document === 'undefined') return;
    const box = document.getElementById('liveSpawnerBracketWindow');
    if (!box) return;

    const facName = document.getElementById('hordeFactionSelect')?.value || '';
    let pool = { b34: '', b56: '', b79: '', b10: '', b13: '' };

    try {
      const raw = localStorage.getItem('foa_custom_shelf_pool_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (facName && parsed.byFaction) {
          pool = { ...pool, ...(parsed.byFaction[facName] || {}) };
        } else if (!parsed.byFaction) {
          pool = { ...pool, ...parsed };
        }
      }
    } catch (e) {}

    const tables = (typeof HORDE_FACTION_SPAWN_TABLES !== 'undefined')
      ? HORDE_FACTION_SPAWN_TABLES
      : ((typeof window !== 'undefined' && window.HORDE_FACTION_SPAWN_TABLES) ? window.HORDE_FACTION_SPAWN_TABLES : {});
    const refTable = (facName && tables[facName]) ? tables[facName] : {};

    const showVal = (val, refArr) => {
      if (val && val.trim()) return val;
      if (Array.isArray(refArr) && refArr.length > 0) return refArr.join(' • ');
      return `<span style="color:var(--red); font-style:italic;">⚠️ Horde Pool Empty${facName ? ' for ' + facName : ''} — Configure in Mode 4 (Roster)!</span>`;
    };

    box.innerHTML = `
      <div style="margin-bottom:6px; color:var(--muted); font-size:0.78rem;">
        ☁️ <strong>Active Standard Horde Spawn Pool ${facName ? '(' + facName + ')' : ''}</strong>:
      </div>
      <table class="bracket-matrix-table">
        <thead>
          <tr>
            <th style="width:145px;">2D6 + Mod Bracket</th>
            <th>Configured ${facName || 'Horde'} Shelf Units</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><strong>[2] No Spawn</strong></td><td style="color:var(--muted);">Breach Holds (Unmodified 2 always spawns nothing)</td></tr>
          <tr><td><strong>[3–4] (0–75 pts)</strong></td><td>${showVal(pool.b34, refTable.b34)}</td></tr>
          <tr><td><strong>[5–6] (76–150 pts)</strong></td><td>${showVal(pool.b56, refTable.b56)}</td></tr>
          <tr><td><strong>[7–9] (151–300 pts)</strong></td><td>${showVal(pool.b79, refTable.b79)}</td></tr>
          <tr><td><strong>[10–12] (301–550 pts)</strong></td><td>${showVal(pool.b10, refTable.b10)} <br><span style="color:var(--red); font-size:0.74rem;">⚡ + 1D6 Warp-Breach Intrusion Check (6+ = Campaign Master Adversary/Nemesis!)</span></td></tr>
          <tr><td><strong>[13+] (551+ pts)</strong></td><td>${showVal(pool.b13, refTable.b13)} <br><span style="color:var(--red); font-size:0.74rem;">⚡ + 1D6 Warp-Breach Intrusion Check (6+ = Campaign Master Adversary/Nemesis!)</span></td></tr>
        </tbody>
      </table>
    `;
  }

  function transmitHordeIntrusionPing(zoneNum, bracketLabel, channel) {
    const roomStr = (typeof document !== 'undefined' && document.getElementById('seedInput')?.value) || 'HADES-1';
    const roundStr = (typeof document !== 'undefined' && document.getElementById('spawnerBtnRound')?.textContent) || '1';
    const facStr = (typeof document !== 'undefined' && document.getElementById('hordeFactionSelect')?.value) || 'Horde';

    const isDistant = channel === 'distant';
    const isBeta = channel === 'beta';
    const cleanBracket = bracketLabel.startsWith('Bracket') ? bracketLabel : `Bracket [${bracketLabel}]`;

    const payload = isDistant
      ? [
          `+++ ORBITAL AUGUR ARRAY // DISTANT WARP-BREACH ADVERSARY DETECTED +++`,
          `• MODE & ROOM SEED: Mode 1 (Distant Solo Horde Breach // Room: ${roomStr} // Battle Round ${roundStr})`,
          `• THEATRE & SENSOR SWEEP: Distant Sector Grid ${zoneNum} // Orbital Augur Intercept (Neither Main Player Fielded)`,
          `• REMOTE SECTOR & BRACKET: Distant Spawn Zone ${zoneNum} rolled ${cleanBracket} + [6+ WARP-BREACH INTRUSION]!`,
          `• ACTIVE DISTANT ENEMY FACTION: ${facStr}`,
          `• REQUEST FOR CAMPAIGN MASTER: Long-range augurs have detected an anomalous Warp signature / Unbound Adversary tearing into a distant engagement outside the primary lines. Please execute the Contextual 3-Tier Intrusion Roll (NEMESIS.md) for this remote sector and broadcast the telemetry intercept to BOTH command networks!`
        ].join('\n')
      : (isBeta
          ? `+++ EMERGENCY AUSPEX PING: HORDE WARP-BREACH INTRUSION DETECTED +++\n• CONDUIT: TOMB-SHIP OMNICIDAL AUSPEX [PHAERON JUNEBUG]\n• MODE & ROOM SEED: Mode 1 (Horde Command // Room: ${roomStr} // Battle Round ${roundStr})\n• TRIGGER: Spawn Zone ${zoneNum} rolled ${cleanBracket} + [6+ WARP-BREACH INTRUSION] against ${facStr}!\n• REQUEST FOR TOMB-SHIP MASTER MATRIX: Execute the Contextual 3-Tier Intrusion Roll (NEMESIS.md) and reveal which apex threat or Nemesis has hijacked Spawn Zone ${zoneNum}!`
          : `+++ EMERGENCY AUSPEX PING: HORDE WARP-BREACH INTRUSION DETECTED +++\n• CONDUIT: MUNITORUM PERIMETER AUGUR [THE EXILE // 044TH KRIEG]\n• MODE & ROOM SEED: Mode 1 (Horde Command // Room: ${roomStr} // Battle Round ${roundStr})\n• TRIGGER: Spawn Zone ${zoneNum} rolled ${cleanBracket} + [6+ WARP-BREACH INTRUSION] against ${facStr}!\n• REQUEST FOR CAMPAIGN MASTER: Please execute the Contextual 3-Tier Intrusion Roll (NEMESIS.md) and reveal which entity hijacks Spawn Zone ${zoneNum}!`);

    if (typeof window !== 'undefined' && window.VoxAudio && typeof window.VoxAudio.transmitToVox === 'function') {
      window.VoxAudio.transmitToVox(channel, payload);
    }
  }

  const transmitIntrusionPing = transmitHordeIntrusionPing;
  if (typeof window !== 'undefined') {
    window.transmitHordeIntrusionPing = transmitHordeIntrusionPing;
    window.transmitIntrusionPing = transmitIntrusionPing;
  }

  function evaluateWarpBreachIntrusions() {
    if (typeof document === 'undefined') return;
    const container = document.getElementById('spawnResultsContainer');
    if (!container) return;

    const cards = container.querySelectorAll('.spawn-zone');
    if (!cards || cards.length === 0) return;

    const roomStr = (document.getElementById('seedInput')?.value || 'HADES-1').trim().toUpperCase();
    const roundStr = (document.getElementById('spawnerBtnRound')?.textContent || '1').trim();
    let anyIntrusionTriggered = false;
    const currentWaveIntrusions = [];

    cards.forEach((card, idx) => {
      const text = card.textContent || '';
      const isBigBracket = /Bracket\s*\[(10[–\-]12|10\+|13\+)\]/i.test(text) && !/Rolled Down/i.test(text);
      if (!isBigBracket) return;

      const zoneNum = idx + 1;
      const bracketMatch = text.match(/Bracket\s*\[[^\]]+\]/i);
      const bracketLabel = bracketMatch ? bracketMatch[0] : 'Bracket [10+]';

      // Deterministic 1D6 roll seeded by Room Code + Round + Zone so both players see the exact same result!
      let intrusionRoll = 1;
      if (typeof cyrb128 === 'function' && typeof mulberry32 === 'function') {
        const seedArr = cyrb128(`${roomStr}_INTRUSION_R${roundStr}_Z${zoneNum}`);
        const rng = mulberry32(seedArr[0]);
        intrusionRoll = Math.floor(rng() * 6) + 1;
      } else if (typeof hashString === 'function' && typeof mulberry32 === 'function') {
        const rng = mulberry32(hashString(`${roomStr}_INTRUSION_R${roundStr}_Z${zoneNum}`));
        intrusionRoll = Math.floor(rng() * 6) + 1;
      } else {
        intrusionRoll = Math.floor(Math.random() * 6) + 1;
      }

      if (intrusionRoll >= 6) {
        anyIntrusionTriggered = true;
        currentWaveIntrusions.push(`${roomStr}_R${roundStr}_Z${zoneNum}_${intrusionRoll}`);
        if (!card.querySelector('.warp-intrusion-alert')) {
          card.style.borderColor = 'var(--red)';
          const alertDiv = document.createElement('div');
          alertDiv.className = 'warp-intrusion-alert';
          alertDiv.style.textAlign = 'center';
          alertDiv.innerHTML = `
            <div style="color:var(--red); font-weight:900; font-family:monospace; font-size:0.84rem; margin-bottom:4px; text-align:center;">
              ⚡ [WARP-BREACH INTRUSION ROLLED: D6 = ${intrusionRoll} (6+) — ADVERSARY / NEMESIS HIJACK!]
            </div>
            <div style="font-size:0.8rem; color:#e2e8f0; margin-bottom:8px; text-align:center;">
              Instead of the standard Horde unit above, an anomalous signature is tearing through <strong>Spawn Zone ${zoneNum}</strong>! Ping the Campaign Master on Vox to reveal the intruder:
            </div>
            <div style="display:flex; gap:8px; flex-wrap:wrap; justify-content:center; align-items:center;">
              <button type="button" class="btn-red btn-sm" onclick="transmitHordeIntrusionPing(${zoneNum}, '${bracketLabel}', 'alpha')">🦅 Ping Vox (The Exile)</button>
              <button type="button" class="btn-green btn-sm" onclick="transmitHordeIntrusionPing(${zoneNum}, '${bracketLabel}', 'beta')">💀 Ping Tomb-Ship (Junebug)</button>
              <button type="button" class="btn-gold btn-sm" onclick="transmitHordeIntrusionPing(${zoneNum}, '${bracketLabel}', 'distant')">📡 Ping Vox (Distant Intercept)</button>
            </div>
          `;
          card.appendChild(alertDiv);
        }
      } else {
        if (!card.querySelector('.intrusion-badge-clean') && !card.querySelector('.warp-intrusion-alert')) {
          const cleanNote = document.createElement('div');
          cleanNote.className = 'intrusion-badge-clean';
          cleanNote.style.cssText = 'margin-top:6px; font-size:0.74rem; color:var(--muted); font-family:monospace; text-align:center;';
          cleanNote.textContent = `[Warp-Breach Intrusion Check: D6 = ${intrusionRoll} (Needed 6+) — Standard Horde Wave Holds]`;
          card.appendChild(cleanNote);
        }
      }
    });

    const waveSignature = currentWaveIntrusions.sort().join('|');
    if (anyIntrusionTriggered && waveSignature && waveSignature !== lastWarpSirenSeedKey) {
      lastWarpSirenSeedKey = waveSignature;
      if (typeof window !== 'undefined' && window.VoxAudio && typeof window.VoxAudio.playWarpSiren === 'function') {
        window.VoxAudio.playWarpSiren();
      }
    }
  }

  if (typeof window !== 'undefined') {
    window.syncSpawnerPoolFromSupabase = syncSpawnerPoolFromSupabase;
    window.renderLiveSpawnerBracketTable = renderLiveSpawnerBracketTable;
    window.transmitHordeIntrusionPing = transmitHordeIntrusionPing;
    window.evaluateWarpBreachIntrusions = evaluateWarpBreachIntrusions;
    window.resetMatchToSetup = resetMatchToSetup;
    window.clearSpawnerResults = clearSpawnerResults;
    window.onChangeSpawnZoneCount = onChangeSpawnZoneCount;
    window.pushLiveSpawnerStateToCloud = pushLiveSpawnerStateToCloud;
    window.pollLiveSpawnerStateFromCloud = pollLiveSpawnerStateFromCloud;
    window.debouncedPushLiveSpawnerStateToCloud = debouncedPushLiveSpawnerStateToCloud;
    window.getClientDeviceId = getClientDeviceId;
    window.updateSyncBadge = updateSyncBadge;
    window.triggerCardStaticShake = triggerCardStaticShake;
    window.manualSyncSpawnerNow = function () {
      updateSyncBadge(true, '☁️ Syncing...');
      pollLiveSpawnerStateFromCloud().then(synced => {
        if (!synced) pushLiveSpawnerStateToCloud();
      });
    };

    if (typeof window.rollAllSpawnZones === 'function' && !window.rollAllSpawnZones._hasIntrusionHook) {
      const origRollAll = window.rollAllSpawnZones;
      const wrappedRollAll = function () {
        const res = origRollAll.apply(this, arguments);
        evaluateWarpBreachIntrusions();
        pushLiveSpawnerStateToCloud();
        return res;
      };
      wrappedRollAll._hasIntrusionHook = true;
      window.rollAllSpawnZones = wrappedRollAll;
    }

    if (typeof window.manualChangeFaction === 'function' && !window.manualChangeFaction._hasBracketRenderHook) {
      const origManualFaction = window.manualChangeFaction;
      const wrappedManual = function () {
        const res = origManualFaction.apply(this, arguments);
        renderLiveSpawnerBracketTable();
        debouncedPushLiveSpawnerStateToCloud();
        return res;
      };
      wrappedManual._hasBracketRenderHook = true;
      window.manualChangeFaction = wrappedManual;
    }

    let spawnerCloudPollTimer = null;
    function initSpawnerCloudPolling() {
      if (document.getElementById('setupScreen') || document.getElementById('gameScreen')) {
        syncSpawnerPoolFromSupabase();
        renderLiveSpawnerBracketTable();
        pollLiveSpawnerStateFromCloud();
        if (!spawnerCloudPollTimer) {
          spawnerCloudPollTimer = setInterval(() => {
            if (document.getElementById('setupScreen') || document.getElementById('gameScreen')) {
              pollLiveSpawnerStateFromCloud();
            } else {
              clearInterval(spawnerCloudPollTimer);
              spawnerCloudPollTimer = null;
            }
          }, 3500);
        }
      } else {
        if (spawnerCloudPollTimer) {
          clearInterval(spawnerCloudPollTimer);
          spawnerCloudPollTimer = null;
        }
      }
    }

    window.addEventListener('DOMContentLoaded', initSpawnerCloudPolling);
    window.addEventListener('vox:page-swapped', initSpawnerCloudPolling);
  }

  if (typeof module !== 'undefined' && module.exports) {
    Object.assign(module.exports, {
      syncSpawnerPoolFromSupabase,
      renderLiveSpawnerBracketTable,
      transmitHordeIntrusionPing,
      transmitIntrusionPing,
      evaluateWarpBreachIntrusions,
      triggerCardStaticShake
    });
  }
})();
