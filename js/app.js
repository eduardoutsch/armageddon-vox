// Main UI and Session Controller for Fires of Armageddon

let selectedModeVal = 'coop';
let selectedRoleVal = '1';
let activeHordeFaction = HORDE_FACTIONS[0];

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
let cp = 2;
let stratCount = 0;
let currentZoneSpawns = [];

// Populate Spawner Faction Dropdown on load
window.addEventListener('DOMContentLoaded', () => {
  const sel = document.getElementById('hordeFactionSelect');
  if (sel) {
    sel.innerHTML = HORDE_FACTIONS.map(f => `<option value="${f.name}">${f.name} (${f.ruleTitle})</option>`).join('');
  }
});

function selectMode(mode) {
  selectedModeVal = mode;
  document.getElementById('modeCardCoop').classList.toggle('selected-red', mode === 'coop');
  document.getElementById('modeCardSolo').classList.toggle('selected-red', mode === 'solo');
  document.getElementById('playerRoleSection').classList.toggle('hidden', mode === 'solo');
}

function selectRole(role) {
  selectedRoleVal = role;
  document.getElementById('roleCard1').classList.toggle('selected', role === '1');
  document.getElementById('roleCard2').classList.toggle('selected', role === '2');
}

function resolveRoomSyncedFaction(code) {
  const mode = document.getElementById('setupFactionMode').value;
  const rngFac = mulberry32(hashString(code + "_HORDE_FACTION"));

  if (mode.startsWith("SYNC_")) {
    let pool = HORDE_FACTIONS;
    if (mode === "SYNC_CHAOS") pool = HORDE_FACTIONS.filter(f => f.group === "Chaos");
    if (mode === "SYNC_XENOS") pool = HORDE_FACTIONS.filter(f => f.group === "Xenos");
    if (mode === "SYNC_IMPERIUM") pool = HORDE_FACTIONS.filter(f => f.group === "Imperium");
    const idx = Math.floor(rngFac() * pool.length);
    activeHordeFaction = pool[idx];
  } else {
    activeHordeFaction = HORDE_FACTIONS.find(f => f.name === mode) || HORDE_FACTIONS[0];
  }

  document.getElementById('hordeFactionSelect').value = activeHordeFaction.name;
  renderFactionReminderBanner();
}

function manualChangeFaction() {
  const val = document.getElementById('hordeFactionSelect').value;
  activeHordeFaction = HORDE_FACTIONS.find(f => f.name === val) || HORDE_FACTIONS[0];
  renderFactionReminderBanner();
}

function renderFactionReminderBanner() {
  document.getElementById('activeFactionBannerTitle').innerText = `HORDE FACTION: ${activeHordeFaction.name} — "${activeHordeFaction.ruleTitle}"`;
  document.getElementById('activeFactionBannerDesc').innerText = activeHordeFaction.desc;
}

function startSession() {
  const code = (document.getElementById('seedInput').value || 'HADES-1').trim().toUpperCase();
  const mode = selectedModeVal;
  const role = selectedRoleVal;

  isSoloMode = (mode === 'solo');
  spRoundCap = isSoloMode ? 16 : 8;

  // 1. Resolve Room-Synced Horde Faction
  resolveRoomSyncedFaction(code);

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
    document.getElementById('secretPoolNotice').innerText = `Solo Deck (${personalSecretDeck.length} valid cards; Multiplayer blocked)`;
  } else {
    personalSecretDeck = (role === "1") ? shuffledSecrets.slice(0, 17) : shuffledSecrets.slice(17, 34);
    document.getElementById('secretPoolNotice').innerText = `Co-op Split Pool (${personalSecretDeck.length} cards)`;
  }

  sharedMiseryDeck = seededShuffle(MISERIES, rngMisery);
  sharedSecondaryDeck = seededShuffle(SECONDARIES, rngSecond);

  battleRound = 0;
  activeCard = null;
  activeMiseries = [];
  activeSecondaries = [];
  sp = 0;
  spGainedThisRound = 0;
  cp = 2;
  stratCount = 0;

  loadCustomPool();

  document.getElementById('setupScreen').classList.add('hidden');
  document.getElementById('gameScreen').classList.remove('hidden');

  currentChoices = drawSecretCards(2);
  renderSecretChoices("Select 1 Initial Secret Objective");
  updateHUD();
  renderSharedDecks();
  renderResupplyTable();
  switchTab(2);
}

function switchTab(tabNum) {
  [1, 2, 3, 4].forEach(n => {
    document.getElementById('tab' + n).classList.toggle('hidden', n !== tabNum);
    document.getElementById('tabBtn' + n).classList.toggle('active', n === tabNum);
  });
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
}
