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
