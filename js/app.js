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
