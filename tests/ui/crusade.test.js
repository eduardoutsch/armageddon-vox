const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '../../');
const CRUSADE_HTML_PATH = path.join(ROOT_DIR, 'pages/crusade.html');

// Read crusade.html and extract script block
const crusadeHtml = fs.readFileSync(CRUSADE_HTML_PATH, 'utf8');
const scriptMatches = crusadeHtml.match(/<script>([\s\S]*?)<\/script>/);
assert.ok(scriptMatches && scriptMatches[1], 'Must locate script tag inside pages/crusade.html');
const crusadeScriptCode = scriptMatches[1];

// Set up mock DOM and localStorage environment
const storageStore = new Map();
const mockLocalStorage = {
  getItem: (k) => (storageStore.has(k) ? storageStore.get(k) : null),
  setItem: (k, v) => storageStore.set(k, String(v)),
  removeItem: (k) => storageStore.delete(k),
  clear: () => storageStore.clear()
};

function createMockClassList() {
  const classes = new Set();
  return {
    add: (c) => classes.add(c),
    remove: (c) => classes.delete(c),
    toggle: (c, force) => {
      if (force === undefined) {
        if (classes.has(c)) classes.delete(c);
        else classes.add(c);
      } else if (force) {
        classes.add(c);
      } else {
        classes.delete(c);
      }
    },
    contains: (c) => classes.has(c)
  };
}

const mockElements = {
  cruTabBoard: { classList: createMockClassList() },
  cruTabForge: { classList: createMockClassList() },
  cruTabBtn1: { classList: createMockClassList() },
  cruTabBtn2: { classList: createMockClassList() },
  treeBtnGate: { classList: createMockClassList() },
  treeBtnDes: { classList: createMockClassList() },
  treeBtnMar: { classList: createMockClassList() },
  allianceTreeBox: { innerHTML: '' },
  alphaSP: { textContent: '0' },
  alphaCP: { textContent: '0' },
  alphaCacheCount: { textContent: '0' },
  betaSP: { textContent: '0' },
  betaCP: { textContent: '0' },
  betaCacheCount: { textContent: '0' },
  hordeSP: { textContent: '0' },
  hordeCP: { textContent: '0' },
  forgeSourcePool: { value: 'Armageddon' },
  rollerUnitName: { value: "Mercy's Delay" },
  rollerUnitContext: { value: 'Held the landing zone bunker against three swarm waves.' },
  traitUnitType: { value: 'Infantry' },
  traitResultBox: { innerHTML: '' },
  weaponResultBox: { innerHTML: '' },
  relicTierSelect: { value: 'Artificer' },
  relicResultBox: { innerHTML: '' },
  scarResultBox: { innerHTML: '' },
  dossierChannel: { value: 'alpha' },
  dossierModeNode: { value: 'Mode 1: Co-op Horde Breach // Node 0 (Golgotha Arbor-Basin)' },
  dossierOutcome: { value: 'Survived Round 6 Final Stand & Completed Secret Objective (+5 SPts)' },
  dossierSecretCode: { value: 'A9F' },
  dossierSecretTag: { value: 'Action / Relic Tag (Free Battle Trait, Weapon Mod, or Relic)' },
  dossierLeftoverSp: { value: '3 Leftover SP → Bank 1v1 Supply Cache Token' },
  dossierBattleNotes: { value: 'Krieg Vanquishers eliminated the enemy heavy armor in round 2.' },
  fortHosp: { checked: true },
  fortAmmo: { checked: false },
  fortTrench: { checked: true },
  fortFob: { checked: false },
  queuedCountLabel: { textContent: '0' },
  queuedRollsContainer: { innerHTML: '' },
  masterDossierPreviewBox: { textContent: '' }
};

const mockDocument = {
  getElementById: (id) => mockElements[id] || null
};

let transmittedChannel = null;
let transmittedPayload = null;

const mockWindow = {
  addEventListener: () => {},
  VoxAudio: {
    playClank: () => {},
    playDiceClatter: () => {},
    playForgeAnvil: () => {},
    playRelicChoir: () => {},
    playScarHazard: () => {},
    playDossierStamp: () => {},
    transmitToVox: (chan, payload) => {
      transmittedChannel = chan;
      transmittedPayload = payload;
    }
  }
};

// Evaluate script in mock environment
const evalFn = new Function(
  'document',
  'window',
  'localStorage',
  'console',
  `${crusadeScriptCode}; return {
    CRUSADE_STATE_KEY,
    ALLIANCE_TREES,
    BATTLE_TRAIT_TABLES,
    WEAPON_MOD_TABLE,
    CRUSADE_RELIC_VAULT,
    BATTLE_SCAR_TABLE,
    getCrusadeState: () => crusadeState,
    lastRolledItem,
    switchCrusadeTab,
    adjScore,
    selectAllianceTree,
    rollRandomBattleTrait,
    rollRandomWeaponMod,
    rollRandomRelic,
    rollOutOfActionTest,
    rollRandomBattleScar,
    attachRollToDossier,
    removeQueuedRoll,
    clearQueuedRolls,
    renderQueuedRolls,
    buildMasterDossierString,
    updateMasterDossierPreview,
    transmitMasterBattleDossier,
    saveCrusadeState,
    initCrusadePage
  };`
);

const crusade = evalFn(mockDocument, mockWindow, mockLocalStorage, console);

test('crusade: ALLIANCE_TREES, tables, and vaults have complete schemas and 11th Ed crusade rules', () => {
  assert.ok(crusade.ALLIANCE_TREES.Gatebreakers, 'Must define Gatebreakers alliance tree');
  assert.ok(crusade.ALLIANCE_TREES.Desecrators, 'Must define Desecrators alliance tree');
  assert.ok(crusade.ALLIANCE_TREES.Marauders, 'Must define Marauders alliance tree');

  assert.equal(crusade.BATTLE_TRAIT_TABLES.Infantry.length, 6, 'Must define 6 Infantry traits');
  assert.equal(crusade.BATTLE_TRAIT_TABLES.Mounted.length, 6, 'Must define 6 Mounted traits');
  assert.equal(crusade.BATTLE_TRAIT_TABLES.MonsterVehicle.length, 6, 'Must define 6 Monster/Vehicle traits');
  assert.equal(crusade.BATTLE_TRAIT_TABLES.Character.length, 6, 'Must define 6 Character traits');

  assert.equal(crusade.WEAPON_MOD_TABLE.length, 6, 'Must define 6 Weapon Modifications');
  assert.ok(crusade.CRUSADE_RELIC_VAULT.Artificer.length > 0, 'Must define Artificer relics');
  assert.ok(crusade.CRUSADE_RELIC_VAULT.Antiquity.length > 0, 'Must define Antiquity relics');
  assert.ok(crusade.CRUSADE_RELIC_VAULT.Legendary.length > 0, 'Must define Legendary relics');

  assert.equal(crusade.BATTLE_SCAR_TABLE.length, 6, 'Must define 6 Battle Scars');
});

test('crusade: switchCrusadeTab switches tabs and persists state', () => {
  crusade.switchCrusadeTab('forge', false);
  assert.equal(mockElements.cruTabBoard.classList.contains('hidden'), true);
  assert.equal(mockElements.cruTabForge.classList.contains('hidden'), false);
  assert.equal(mockElements.cruTabBtn2.classList.contains('active'), true);
  assert.equal(mockElements.cruTabBtn1.classList.contains('active'), false);

  crusade.switchCrusadeTab('board', false);
  assert.equal(mockElements.cruTabBoard.classList.contains('hidden'), false);
  assert.equal(mockElements.cruTabForge.classList.contains('hidden'), true);
  assert.equal(mockElements.cruTabBtn1.classList.contains('active'), true);
});

test('crusade: adjScore modifies alliance Strategic & Campaign Points without going below 0', () => {
  crusade.adjScore('alphaSP', 5);
  assert.equal(crusade.getCrusadeState().alphaSP, 5);
  assert.equal(String(mockElements.alphaSP.textContent), '5');

  crusade.adjScore('alphaSP', -2);
  assert.equal(crusade.getCrusadeState().alphaSP, 3);
  assert.equal(String(mockElements.alphaSP.textContent), '3');

  // Should floor at 0
  crusade.adjScore('alphaSP', -10);
  assert.equal(crusade.getCrusadeState().alphaSP, 0);
  assert.equal(String(mockElements.alphaSP.textContent), '0');

  crusade.adjScore('betaCP', 2);
  assert.equal(crusade.getCrusadeState().betaCP, 2);
  assert.equal(String(mockElements.betaCP.textContent), '2');
});

test('crusade: selectAllianceTree renders branching phase goals, success and failure paths', () => {
  crusade.selectAllianceTree('Gatebreakers', false);
  assert.ok(mockElements.allianceTreeBox.innerHTML.includes('Stabilising the Front'));
  assert.ok(mockElements.allianceTreeBox.innerHTML.includes('Reclaim the Lost Hives'));
  assert.equal(mockElements.treeBtnGate.classList.contains('active'), true);

  crusade.selectAllianceTree('Desecrators', false);
  assert.ok(mockElements.allianceTreeBox.innerHTML.includes('Planetfall'));
  assert.equal(mockElements.treeBtnDes.classList.contains('active'), true);

  crusade.selectAllianceTree('Marauders', false);
  assert.ok(mockElements.allianceTreeBox.innerHTML.includes('Drawn to the Fight'));
  assert.equal(mockElements.treeBtnMar.classList.contains('active'), true);
});

test('crusade: upgrade rollers generate valid traits, weapon mods, relics, and scars', () => {
  // 1. Battle Trait
  mockElements.traitUnitType.value = 'Character';
  crusade.rollRandomBattleTrait();
  assert.ok(crusade.lastRolledItem.trait, 'Must store last rolled trait');
  assert.equal(crusade.lastRolledItem.trait.category, 'Battle Trait (Character)');
  assert.ok(crusade.lastRolledItem.trait.name);

  // 2. Weapon Mod
  crusade.rollRandomWeaponMod();
  assert.ok(crusade.lastRolledItem.weapon, 'Must store last rolled weapon mod');
  assert.ok(crusade.lastRolledItem.weapon.name.includes('+'));

  // 3. Relic
  mockElements.relicTierSelect.value = 'Legendary';
  crusade.rollRandomRelic();
  assert.ok(crusade.lastRolledItem.relic, 'Must store last rolled relic');
  assert.equal(crusade.lastRolledItem.relic.category, 'Crusade Relic (Legendary)');

  // 4. Battle Scar
  crusade.rollRandomBattleScar();
  assert.ok(crusade.lastRolledItem.scar, 'Must store last rolled scar');
  assert.equal(crusade.lastRolledItem.scar.category, 'Battle Scar');
});

test('crusade: attachRollToDossier queues rolled items and clearQueuedRolls resets list', () => {
  crusade.clearQueuedRolls();
  assert.equal(crusade.getCrusadeState().queuedRolls.length, 0);

  mockElements.rollerUnitName.value = 'Krieg Leman Russ #1';
  mockElements.rollerUnitContext.value = 'Survived 2 rounds under heavy fire.';
  crusade.attachRollToDossier('trait');

  assert.equal(crusade.getCrusadeState().queuedRolls.length, 1);
  assert.equal(crusade.getCrusadeState().queuedRolls[0].unit, 'Krieg Leman Russ #1');
  assert.equal(mockElements.queuedCountLabel.textContent, '1');

  // Attach another item
  mockElements.rollerUnitName.value = 'Watchmaster Dreir';
  mockElements.rollerUnitContext.value = 'Took devastating blow in melee.';
  crusade.attachRollToDossier('scar');
  assert.equal(crusade.getCrusadeState().queuedRolls.length, 2);

  // Remove first item
  crusade.removeQueuedRoll(0);
  assert.equal(crusade.getCrusadeState().queuedRolls.length, 1);
  assert.equal(crusade.getCrusadeState().queuedRolls[0].unit, 'Watchmaster Dreir');

  // Clear list
  crusade.clearQueuedRolls();
  assert.equal(crusade.getCrusadeState().queuedRolls.length, 0);
  assert.equal(mockElements.queuedCountLabel.textContent, '0');
});

test('crusade: buildMasterDossierString compiles comprehensive battle and unit progression dossier', () => {
  mockElements.dossierChannel.value = 'alpha';
  mockElements.dossierModeNode.value = 'Mode 1: Co-op Horde Breach // Node 0 (Golgotha Arbor-Basin)';
  mockElements.dossierOutcome.value = 'Survived Round 6 Final Stand & Completed Secret Objective (+5 SPts)';
  mockElements.dossierSecretCode.value = 'A9F';
  mockElements.dossierBattleNotes.value = 'Held the frontline and extracted with full supply cache.';

  crusade.clearQueuedRolls();
  mockElements.rollerUnitName.value = "Mercy's Delay";
  mockElements.rollerUnitContext.value = 'Held the center';
  crusade.attachRollToDossier('relic');

  const dossierStr = crusade.buildMasterDossierString();
  assert.ok(dossierStr.includes('+++ MASTER POST-BATTLE & UNIT PROGRESSION DOSSIER +++'));
  assert.ok(dossierStr.includes('COMMANDER ALPHA (THE SANCTUARY OF ASH)'));
  assert.ok(dossierStr.includes('Golgotha Arbor-Basin'));
  assert.ok(dossierStr.includes('SECRET OBJECTIVE CODE: [A9F]'));
  assert.ok(dossierStr.includes("Mercy's Delay"));
  assert.ok(dossierStr.includes('Held the frontline'));
});

test('crusade: transmitMasterBattleDossier invokes window.VoxAudio.transmitToVox', () => {
  transmittedChannel = null;
  transmittedPayload = null;
  mockElements.dossierChannel.value = 'alpha';

  crusade.transmitMasterBattleDossier();
  assert.equal(transmittedChannel, 'alpha');
  assert.ok(transmittedPayload.includes('MASTER POST-BATTLE'));
  assert.ok(transmittedPayload.includes('THE SANCTUARY OF ASH'));
});

test('crusade: saveCrusadeState and initCrusadePage restore state across tab navigation', () => {
  mockLocalStorage.clear();
  mockLocalStorage.setItem(crusade.CRUSADE_STATE_KEY, JSON.stringify({
    activeTab: 'forge',
    selectedTree: 'Desecrators',
    alphaSP: 12,
    alphaCP: 4,
    betaSP: 9,
    betaCP: 3,
    hordeSP: 6,
    hordeCP: 2,
    queuedRolls: [
      { unit: 'Krieg Sentinel', context: 'Scouted forward', category: 'Battle Trait (Mounted)', name: 'Outriders', roll: 'D6 = 2', desc: 'Fast move' }
    ]
  }));

  crusade.initCrusadePage();

  assert.equal(crusade.getCrusadeState().alphaSP, 12);
  assert.equal(crusade.getCrusadeState().betaSP, 9);
  assert.equal(crusade.getCrusadeState().hordeSP, 6);
  assert.equal(mockElements.alphaSP.textContent, '12');
  assert.equal(mockElements.betaSP.textContent, '9');
  assert.equal(mockElements.hordeSP.textContent, '6');
  assert.equal(crusade.getCrusadeState().queuedRolls.length, 1);
  assert.equal(mockElements.queuedCountLabel.textContent, '1');
});
