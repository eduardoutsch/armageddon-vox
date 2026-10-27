# 📦 Fires of Armageddon // Bundle: UI Tests (Crusade Command & Tour of Duty)

Crusade tab orchestration, 3-way scoreboard, tour quotas, and narrative tree test suites (`tests/ui/crusade.test.js`, `tests/js/crusade.test.js`, `tests/js/horde-battle-stats.test.js`).

## 📑 Table of Contents
- [tests/ui/crusade.test.js](#file-testsuicrusadetestjs)
- [tests/js/crusade.test.js](#file-testsjscrusadetestjs)
- [tests/js/horde-battle-stats.test.js](#file-testsjshordebattlestatstestjs)

---

## File: `tests/ui/crusade.test.js` <a id="file-testsuicrusadetestjs"></a>

````javascript
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '../../');
const CRUSADE_HTML_PATH = path.join(ROOT_DIR, 'pages/crusade.html');

// Read crusade.html and modular crusade scripts
const crusadeHtml = fs.readFileSync(CRUSADE_HTML_PATH, 'utf8');
assert.ok(crusadeHtml.includes('<script src="../js/crusade-data.js"></script>'), 'pages/crusade.html must link to js/crusade-data.js');
assert.ok(crusadeHtml.includes('<script src="../js/horde-battle-stats.js"></script>'), 'pages/crusade.html must link to js/horde-battle-stats.js');
assert.ok(crusadeHtml.includes('<script src="../js/crusade-forge.js"></script>'), 'pages/crusade.html must link to js/crusade-forge.js');
assert.ok(crusadeHtml.includes('<script src="../js/crusade.js"></script>'), 'pages/crusade.html must link to js/crusade.js');
assert.ok(crusadeHtml.includes('id="hordeStatsAttachCard"'), 'pages/crusade.html must include #hordeStatsAttachCard');

const CRUSADE_DATA_JS = path.join(ROOT_DIR, 'js/crusade-data.js');
const HORDE_STATS_JS = path.join(ROOT_DIR, 'js/horde-battle-stats.js');
const CRUSADE_FORGE_JS = path.join(ROOT_DIR, 'js/crusade-forge.js');
const CRUSADE_JS = path.join(ROOT_DIR, 'js/crusade.js');

const crusadeScriptCode = [
  fs.readFileSync(CRUSADE_DATA_JS, 'utf8'),
  fs.readFileSync(HORDE_STATS_JS, 'utf8'),
  fs.readFileSync(CRUSADE_FORGE_JS, 'utf8'),
  fs.readFileSync(CRUSADE_JS, 'utf8')
].join('\n;\n');

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
  cruTabTour: { classList: createMockClassList() },
  cruTabTomb: { classList: createMockClassList() },
  cruTabBtn1: { classList: createMockClassList() },
  cruTabBtn2: { classList: createMockClassList() },
  cruTabBtn3: { classList: createMockClassList() },
  cruTabBtn4: { classList: createMockClassList() },
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
  dossierDistantForce: { value: '' },
  dossierDistantForceRow: { style: { display: 'none' } },
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
  hordeStatsAttachCard: { innerHTML: '', style: {} },
  masterDossierPreviewBox: { textContent: '', classList: createMockClassList() },
  tourBattlesRem: { textContent: '0' },
  tourWinsRem: { textContent: '0' },
  commendationPts: { textContent: '0' },
  toursCompletedCount: { textContent: '0' },
  commRollNotice: { innerHTML: '' },
  upliftingPrimerToggle: { checked: false },
  logisticsAllocatedLabel: { textContent: '4 / 4' },
  logisticsAllocatorGrid: { innerHTML: '' },
  commendationSelect: { innerHTML: '', value: 'bastion' },
  commRecipientUnit: { value: '044th Krieg Regiment' },
  commendationPreviewBox: { innerHTML: '' },
  startTourNotes: { value: '' },
  startOfTourPreviewBox: { textContent: '' },
  tombAgendasCompleted: { textContent: '0' },
  tombAwakeningCycles: { textContent: '0' },
  tombMasterStatusVal: { textContent: '', style: {} },
  tombResetNotice: { innerHTML: '' },
  powerReservesToggle: { checked: false },
  tombMatrixAllocatedLabel: { textContent: '2 / 3' },
  tombMatrixGrid: { innerHTML: '' },
  necronVaultSelect: { innerHTML: '', value: 'viral_vectors' },
  necronRecipientUnit: { value: 'Hypercrypt Phalanx' },
  necronVaultPreviewBox: { innerHTML: '' },
  tombAwakeningNotes: { value: '' },
  tombAwakeningPreviewBox: { textContent: '' }
};

const mockDocument = {
  body: {
    dataset: {},
    classList: createMockClassList()
  },
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
    ASTRA_MILITARUM_TRAIT_TABLES,
    NECRONS_TRAIT_TABLES,
    WEAPON_MOD_TABLE,
    CRUSADE_RELIC_VAULT,
    ASTRA_MILITARUM_RELIC_VAULT,
    NECRONS_RELIC_VAULT,
    BATTLE_SCAR_TABLE,
    NECRON_BATTLE_SCARS,
    NECRON_BATTLE_SCAR_TABLE,
    LOGISTICS_CATEGORIES,
    ASTRA_COMMENDATIONS_VAULT,
    TOMB_WORLD_SYSTEMS,
    NECRON_DYNASTIC_VAULT,
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
    adjTourField,
    rollNewTourQuotas,
    rollVictoryCommendationPts,
    toggleUpliftingPrimer,
    adjLogisticsPt,
    renderLogisticsAllocator,
    populateCommendationVault,
    renderSelectedCommendationPreview,
    attachCommendationToDossier,
    adjTombField,
    rollMasterSystemReset,
    togglePowerReserves,
    adjTombSystemPt,
    renderTombAwakeningMatrix,
    populateNecronDynasticVault,
    renderSelectedNecronVaultPreview,
    attachNecronVaultToDossier,
    buildTombMatrixSummaryLine,
    compileTombAwakeningDossier,
    buildTombAwakeningDossierString,
    updateTombAwakeningPreview,
    transmitTombAwakeningDossier,
    resetTombAwakeningTab: (typeof resetTombAwakeningTab === 'function' ? resetTombAwakeningTab : null),
    attachRollToDossier,
    removeQueuedRoll,
    clearQueuedRolls,
    resetMasterDossierForm,
    renderQueuedRolls,
    buildLogisticsSummaryLine,
    compileMasterDossier,
    readMasterDossierFormInputs,
    updateDistantForceVisibility,
    buildMasterDossierString,
    updateMasterDossierPreview,
    transmitMasterBattleDossier,
    buildStartOfTourDossierString,
    updateStartOfTourPreview,
    transmitStartOfTourDossier,
    saveCrusadeState,
    initCrusadePage,
    importHordeBattleStatsToCrusade,
    detachHordeBattleStatsFromCrusade,
    renderHordeStatsAttachmentCard
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

test('crusade: Marauders (3rd Force) default hordeSP is 1 in crusadeState and HTML scoreboard', () => {
  assert.equal(crusade.getCrusadeState().hordeSP, 1, 'Default crusadeState.hordeSP must be 1');
  assert.match(
    crusadeHtml,
    /id="hordeSP"[^>]*>1</,
    'pages/crusade.html #hordeSP counter must default to 1'
  );
  assert.match(
    crusadeHtml,
    /id="hordeSP"[^>]*style="color:var\(--purple\);"/,
    'pages/crusade.html #hordeSP counter must use var(--purple) styling'
  );
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
  assert.ok(dossierStr.includes('+++ DEPARTMENTO MUNITORUM // MASTER POST-BATTLE DOSSIER & HONOUR SCROLL +++'));
  assert.ok(dossierStr.includes('THE EXILE // THE SANCTUARY OF ASH (ASTRA MILITARUM — 044TH KRIEG)'));
  assert.ok(dossierStr.includes('Golgotha Arbor-Basin'));
  assert.ok(dossierStr.includes('SECRET OBJECTIVE CODE: [A9F]'));
  assert.ok(dossierStr.includes("Mercy's Delay"));
  assert.ok(dossierStr.includes('Held the frontline'));

  // Test Necron beta conduit
  mockElements.dossierChannel.value = 'beta';
  const betaDossierStr = crusade.buildMasterDossierString();
  assert.ok(betaDossierStr.includes('+++ DYNASTIC ENGRAM-CHRONICLE // MASTER POST-BATTLE DOSSIER & AWAKENING LOG +++'));
  assert.ok(betaDossierStr.includes('PHAERON JUNEBUG // TOMB-SHIP COMMAND INTERLINK (NECRONS)'));
  assert.ok(betaDossierStr.includes('[2. CRYPTEK CONCLAVE // DYNASTIC EPITHETS, RELICS & ENGRAMMATIC FLAWS]:'));
  assert.ok(betaDossierStr.includes('REQUEST FOR TOMB-SHIP MASTER MATRIX & CRYPTEK CONCLAVE:'));
});

test('crusade: does not duplicate Mode 3 Rogue Sector reporting (kept exclusively in pages/rogue.html)', () => {
  assert.ok(!crusadeHtml.includes('Mode 3: Rogue Sector Auxiliary Clash'), 'crusade.html must not include Mode 3 Rogue Sector option in dossierModeNode');
  assert.ok(!crusadeHtml.includes('Mode 3 Rogue Sector:'), 'crusade.html must not include Mode 3 Rogue Sector outcomes in dossierOutcome');

  mockElements.dossierChannel.value = 'alpha';
  mockElements.dossierModeNode.value = 'Mode 2: 1v1 Ash Wastes PvP // Node 0 (Golgotha Arbor-Basin)';
  mockElements.dossierOutcome.value = '1v1 PvP Victory & Achieved Phase Narrative Goal (+5 SPts)';
  mockElements.dossierBattleNotes.value = 'Secured the central ridge against rival vanguard.';

  const dossierStr = crusade.buildMasterDossierString();
  assert.ok(dossierStr.includes('+++ DEPARTMENTO MUNITORUM // MASTER POST-BATTLE DOSSIER & HONOUR SCROLL +++'));
  assert.ok(!dossierStr.includes('ROGUE SECTOR PLANETARY IMPACT'), 'Master Dossier in crusade.html must not include Rogue Sector planetary impact');
  assert.ok(dossierStr.includes('Pattern 2'));
});

test('crusade: transmitMasterBattleDossier invokes window.VoxAudio.transmitToVox', () => {
  transmittedChannel = null;
  transmittedPayload = null;
  mockElements.dossierChannel.value = 'alpha';

  crusade.transmitMasterBattleDossier();
  assert.equal(transmittedChannel, 'alpha');
  assert.ok(transmittedPayload.includes('MASTER POST-BATTLE'));
  assert.ok(transmittedPayload.includes('SANCTUARY OF ASH'));
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

test('crusade: Astra Militarum codex tables, Munitorum logistics categories, and Commendations vault schemas', () => {
  // AM Codex Traits
  assert.equal(crusade.ASTRA_MILITARUM_TRAIT_TABLES.Infantry.length, 6, 'Must define 6 AM Infantry traits');
  assert.equal(crusade.ASTRA_MILITARUM_TRAIT_TABLES.Mounted.length, 6, 'Must define 6 AM Mounted traits');
  assert.equal(crusade.ASTRA_MILITARUM_TRAIT_TABLES.MonsterVehicle.length, 6, 'Must define 6 AM Monster/Vehicle traits');
  assert.equal(crusade.ASTRA_MILITARUM_TRAIT_TABLES.Character.length, 6, 'Must define 6 AM Character traits');

  // AM Codex Relics
  assert.ok(crusade.ASTRA_MILITARUM_RELIC_VAULT.Artificer.length > 0, 'Must define AM Artificer relics');
  assert.ok(crusade.ASTRA_MILITARUM_RELIC_VAULT.Antiquity.length > 0, 'Must define AM Antiquity relics');
  assert.ok(crusade.ASTRA_MILITARUM_RELIC_VAULT.Legendary.length > 0, 'Must define AM Legendary relics');

  // Munitorum Logistics Categories
  assert.equal(crusade.LOGISTICS_CATEGORIES.length, 4, 'Must define 4 Munitorum logistics categories');
  crusade.LOGISTICS_CATEGORIES.forEach(c => {
    assert.ok(c.key, 'Logistics category must have key');
    assert.ok(c.title, 'Logistics category must have title');
    assert.ok(c.surplus, 'Logistics category must have surplus rule');
    assert.ok(c.deficiency, 'Logistics category must have deficiency rule');
  });

  // Commendations Vault
  assert.ok(crusade.ASTRA_COMMENDATIONS_VAULT.length >= 15, 'Must define complete Commendations Vault');
  const personal = crusade.ASTRA_COMMENDATIONS_VAULT.filter(c => c.type.includes('Personal'));
  const regimental = crusade.ASTRA_COMMENDATIONS_VAULT.filter(c => c.type.includes('Regimental'));
  assert.ok(personal.length > 0, 'Must include Personal Commendations');
  assert.ok(regimental.length > 0, 'Must include Regimental Commendations');
});

test('crusade: switchCrusadeTab handles Tab 3 Tour of Duty & Logistics', () => {
  crusade.switchCrusadeTab('tour', false);
  assert.equal(mockElements.cruTabBoard.classList.contains('hidden'), true);
  assert.equal(mockElements.cruTabForge.classList.contains('hidden'), true);
  assert.equal(mockElements.cruTabTour.classList.contains('hidden'), false);
  assert.equal(mockElements.cruTabBtn3.classList.contains('active'), true);
  assert.equal(mockElements.cruTabBtn1.classList.contains('active'), false);
  assert.equal(mockElements.cruTabBtn2.classList.contains('active'), false);
});

test('crusade: adjTourField, rollNewTourQuotas, and rollVictoryCommendationPts manage quotas & commendation bank', () => {
  crusade.adjTourField('tourBattlesRem', 5);
  assert.equal(crusade.getCrusadeState().tourBattlesRem, 5);
  assert.equal(mockElements.tourBattlesRem.textContent, '5');

  crusade.adjTourField('tourBattlesRem', -2);
  assert.equal(crusade.getCrusadeState().tourBattlesRem, 3);
  assert.equal(mockElements.tourBattlesRem.textContent, '3');

  // Floor at 0
  crusade.adjTourField('tourBattlesRem', -10);
  assert.equal(crusade.getCrusadeState().tourBattlesRem, 0);
  assert.equal(mockElements.tourBattlesRem.textContent, '0');

  // Roll new quotas
  crusade.rollNewTourQuotas();
  assert.ok(crusade.getCrusadeState().tourBattlesRem >= 5 && crusade.getCrusadeState().tourBattlesRem <= 10);
  assert.ok(crusade.getCrusadeState().tourWinsRem >= 3 && crusade.getCrusadeState().tourWinsRem <= 5);

  // Roll victory commendation points
  const prevComm = crusade.getCrusadeState().commendationPts || 0;
  crusade.rollVictoryCommendationPts();
  assert.ok(crusade.getCrusadeState().commendationPts >= prevComm + 1);

  // Mark and Demark Tour Completed (+1 and -1)
  assert.ok(
    crusadeHtml.includes(`adjTourField('toursCompletedCount', 1)`),
    'pages/crusade.html must include Mark Tour Completed (+1) button'
  );
  assert.ok(
    crusadeHtml.includes(`adjTourField('toursCompletedCount', -1)`),
    'pages/crusade.html must include Demark Tour Completed (-1) button'
  );
  crusade.adjTourField('toursCompletedCount', 1);
  assert.equal(crusade.getCrusadeState().toursCompletedCount, 1);
  assert.equal(mockElements.toursCompletedCount.textContent, '1');
  crusade.adjTourField('toursCompletedCount', -1);
  assert.equal(crusade.getCrusadeState().toursCompletedCount, 0);
  assert.equal(mockElements.toursCompletedCount.textContent, '0');
});

test('UI Integration: importHordeBattleStatsToCrusade updates attachment card and injects telemetry into preview', () => {
  // Save simulated Horde battle stats to localStorage
  const simulatedStats = {
    hordeKills: 23,
    spEarned: 32,
    spSpent: 18,
    leftoverSp: 14,
    leftoverCp: 2,
    stratagemsUsed: 6,
    roundsPlayed: 6,
    hordeFaction: 'Chaos Daemons',
    roomSeed: 'TERRA-9',
    gameMode: 'SOLO',
    miseriesDrawn: [{ id: 7, name: 'Unlucky Night' }],
    miseriesNullified: 0,
    secondariesCompleted: [{ id: 1, name: 'Purge the Warp', rewardText: '+4 SP' }],
    secondariesFailed: [],
    secretObjective: { code: 'K9X', name: 'Daemon Core Extraction' },
    fortifications: ['Field Hospital', 'War Trench']
  };

  mockLocalStorage.setItem('foa_horde_battle_stats_v1', JSON.stringify(simulatedStats));

  // Import into Crusade page
  crusade.importHordeBattleStatsToCrusade();

  // Check that attachment card re-rendered
  assert.ok(mockElements.hordeStatsAttachCard.innerHTML.includes('TELEMETRY ATTACHED'));
  assert.ok(mockElements.hordeStatsAttachCard.innerHTML.includes('Chaos Daemons (SOLO)'));
  assert.ok(mockElements.hordeStatsAttachCard.innerHTML.includes('23'));

  // Check pre-filled inputs
  assert.equal(mockElements.dossierSecretCode.value, 'K9X');
  assert.equal(mockElements.fortHosp.checked, true);
  assert.equal(mockElements.fortTrench.checked, true);

  // Check live Master Dossier preview contains combat telemetry
  const preview = mockElements.masterDossierPreviewBox.textContent;
  assert.ok(preview.includes('[HORDE ENGAGEMENT COMBAT TELEMETRY & BATTLE STATS]:'));
  assert.ok(preview.includes('• HORDE UNITS DESTROYED: 23 Units Slain'));
  assert.ok(preview.includes('• HORDE ADVERSARY: Chaos Daemons (Room Code: TERRA-9 • Mode: SOLO)'));

  // Detach stats
  crusade.detachHordeBattleStatsFromCrusade();
  assert.ok(mockElements.hordeStatsAttachCard.innerHTML.includes('No Horde Battle Telemetry attached'));
  assert.ok(!mockElements.masterDossierPreviewBox.textContent.includes('[HORDE ENGAGEMENT COMBAT TELEMETRY & BATTLE STATS]'));
});


````

---

## File: `tests/js/crusade.test.js` <a id="file-testsjscrusadetestjs"></a>

````javascript
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '../../');
const crusadeData = require(path.join(ROOT_DIR, 'js/crusade-data.js'));
const crusadeForge = require(path.join(ROOT_DIR, 'js/crusade-forge.js'));
const crusade = require(path.join(ROOT_DIR, 'js/crusade.js'));

test('Crusade Data: ALLIANCE_TREES has 3 alliances and valid phase structures', () => {
  assert.ok(crusadeData.ALLIANCE_TREES.Gatebreakers);
  assert.ok(crusadeData.ALLIANCE_TREES.Desecrators);
  assert.ok(crusadeData.ALLIANCE_TREES.Marauders);
  assert.equal(crusadeData.ALLIANCE_TREES.Gatebreakers.length, 3);
  assert.ok(crusadeData.BATTLE_TRAIT_TABLES.Infantry.length >= 6);
  assert.ok(crusadeData.CRUSADE_RELIC_VAULT.Artificer.length >= 4);
});

test('Crusade Pure Core: compileTourDispatch generates valid Munitorum Regulation 884-A dispatch', () => {
  const result = crusadeForge.compileTourDispatch({
    tourBattlesRem: 8,
    tourWinsRem: 4,
    commendationPts: 3,
    logistics: { lexmechanicus: 2, materiel: 1, tithePool: 0, morale: 1 },
    upliftingPrimer: false,
    notes: 'Advance toward Hive Tartarus.'
  });
  assert.ok(result.includes('+++ DEPARTMENTO MUNITORUM // TOUR OF DUTY & LOGISTICS ALLOCATION DISPATCH +++'));
  assert.ok(result.includes('8 Battles Required // 4 Victories Required'));
  assert.ok(result.includes('Lexmechanicus: 2 | Materiel: 1 | Tithe Pool: 0 | Morale: 1'));
  assert.ok(result.includes('Advance toward Hive Tartarus.'));
});

test('Crusade Pure Core: compileMasterDossier formats distant augur telemetries without shifting SPts', () => {
  const result = crusade.compileMasterDossier({
    channel: 'augur_alpha',
    modeNode: 'Distant Solo Horde // Node 4',
    outcome: 'Swarm Repelled',
    secretCode: 'D99',
    secretTag: 'Recon Tag',
    leftoverSp: '2 SP',
    battleNotes: 'Distant artillery breach intercepted.',
    distantForce: 'Steel Legion Vanguard',
    queuedRolls: []
  });
  assert.ok(result.includes('+++ MASTER POST-BATTLE DOSSIER // ORBITAL AUGUR TELEMETRY +++'));
  assert.ok(result.includes('Steel Legion Vanguard (Neither Main Player Fielded)'));
  assert.ok(result.includes('Zero Alliance SPt Shift'));
});

test('Crusade Pure Core: compileMasterDossier includes attached Horde Battle Stats in Master Dossier', () => {
  const result = crusade.compileMasterDossier({
    channel: 'alpha',
    modeNode: 'Mode 1: The Ashen Breach (Horde Defence)',
    outcome: 'Victory: Survived All 6 Battle Rounds (+5 SPts)',
    secretCode: 'L2Y',
    secretTag: 'Early Reveal / End of Game',
    leftoverSp: '12 Leftover SP',
    battleNotes: 'Grim holdout against the greenskin tide.',
    queuedRolls: [],
    hordeBattleStats: {
      hordeKills: 17,
      spEarned: 28,
      spSpent: 16,
      leftoverSp: 12,
      leftoverCp: 3,
      stratagemsUsed: 5,
      roundsPlayed: 6,
      hordeFaction: 'Orks',
      roomSeed: 'HADES-1',
      gameMode: 'SOLO',
      miseriesDrawn: [{ id: 1, name: 'Eye of Terror' }],
      miseriesNullified: 0,
      secondariesCompleted: [{ id: 4, name: 'Hold the Line', rewardText: '3 SP' }],
      secondariesFailed: [{ id: 8, name: 'Desperate Stand', punText: '+2 Misery' }]
    }
  });

  assert.ok(result.includes('[HORDE ENGAGEMENT COMBAT TELEMETRY & BATTLE STATS]:'));
  assert.ok(result.includes('• HORDE ADVERSARY: Orks (Room Code: HADES-1 • Mode: SOLO)'));
  assert.ok(result.includes('• HORDE UNITS DESTROYED: 17 Units Slain'));
  assert.ok(result.includes('• SECONDARY MISSIONS: 1 Completed, 1 Failed'));
  assert.ok(result.includes('• SUPPLY ECONOMY: 28 SP Earned • 16 SP Spent on Resupply • 12 Leftover Banked'));
});
````

---

## File: `tests/js/horde-battle-stats.test.js` <a id="file-testsjshordebattlestatstestjs"></a>

````javascript
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '../../');
const hordeStats = require(path.join(ROOT_DIR, 'js/horde-battle-stats.js'));

test('Horde Battle Stats: tracks kills, SP economy, stratagems, and round progression', () => {
  hordeStats.resetHordeBattleStats();
  assert.equal(hordeStats.getHordeBattleStats().hordeKills, 0);

  hordeStats.recordHordeKill(3);
  assert.equal(hordeStats.getHordeBattleStats().hordeKills, 3);

  hordeStats.recordSpEarned(6);
  assert.equal(hordeStats.getHordeBattleStats().spEarned, 6);

  hordeStats.recordSpSpent(4);
  assert.equal(hordeStats.getHordeBattleStats().spSpent, 4);

  hordeStats.recordStratagemUsed();
  hordeStats.recordStratagemUsed();
  assert.equal(hordeStats.getHordeBattleStats().stratagemsUsed, 2);
});

test('Horde Battle Stats: records miseries drawn, nullified, and secondaries resolved', () => {
  hordeStats.resetHordeBattleStats();

  hordeStats.recordMiseryDrawn({ id: 1, name: 'Eye of Terror' });
  hordeStats.recordMiseryDrawn({ id: 7, name: 'Unlucky Night' });
  assert.equal(hordeStats.getHordeBattleStats().miseriesDrawn.length, 2);

  hordeStats.recordMiseryNullified({ id: 1, name: 'Eye of Terror' });
  assert.equal(hordeStats.getHordeBattleStats().miseriesNullified, 1);

  hordeStats.recordSecondaryResolved({ id: 4, name: 'Hold the Line' }, true, { rewardText: '3 SP' });
  hordeStats.recordSecondaryResolved({ id: 8, name: 'Desperate Stand' }, false, { punText: '+2 Misery' });

  const stats = hordeStats.getHordeBattleStats();
  assert.equal(stats.secondariesCompleted.length, 1);
  assert.equal(stats.secondariesCompleted[0].name, 'Hold the Line');
  assert.equal(stats.secondariesCompleted[0].rewardText, '3 SP');

  assert.equal(stats.secondariesFailed.length, 1);
  assert.equal(stats.secondariesFailed[0].name, 'Desperate Stand');
  assert.equal(stats.secondariesFailed[0].punText, '+2 Misery');
});

test('Horde Battle Stats: compileHordeBattleStatsDossierSection produces rich teletype telemetry', () => {
  const sampleStats = {
    hordeKills: 14,
    spEarned: 26,
    spSpent: 14,
    leftoverSp: 12,
    leftoverCp: 3,
    stratagemsUsed: 4,
    roundsPlayed: 6,
    hordeFaction: 'Orks',
    roomSeed: 'HADES-1',
    gameMode: 'SOLO',
    miseriesDrawn: [
      { id: 1, name: 'Eye of Terror' },
      { id: 7, name: 'Unlucky Night' },
      { id: 21, name: 'Bunkers Busted' }
    ],
    miseriesNullified: 1,
    secondariesCompleted: [
      { id: 4, name: 'Hold the Line', rewardText: '3 SP' },
      { id: 10, name: 'Outflank', rewardText: '+1 Spawn Mod' }
    ],
    secondariesFailed: [
      { id: 8, name: 'Desperate Stand', punText: '+2 Misery' }
    ],
    secretObjective: { code: 'L2Y', name: '11 - Show Off', tags: 'Early Reveal / End of Game' },
    fortifications: ['Field Hospital', 'Ammo Dump', 'FOB']
  };

  const compiled = hordeStats.compileHordeBattleStatsDossierSection(sampleStats);
  assert.ok(compiled.includes('[HORDE ENGAGEMENT COMBAT TELEMETRY & BATTLE STATS]:'));
  assert.ok(compiled.includes('• HORDE ADVERSARY: Orks (Room Code: HADES-1 • Mode: SOLO)'));
  assert.ok(compiled.includes('• BATTLE DURATION: Battle Round 6'));
  assert.ok(compiled.includes('• HORDE UNITS DESTROYED: 14 Units Slain'));
  assert.ok(compiled.includes('• MISERY CARDS: 3 Drawn (1 Nullified, 2 Endured)'));
  assert.ok(compiled.includes('• SECONDARY MISSIONS: 2 Completed, 1 Failed'));
  assert.ok(compiled.includes('#4 Hold the Line (3 SP)'));
  assert.ok(compiled.includes('#8 Desperate Stand (+2 Misery)'));
  assert.ok(compiled.includes('• SUPPLY ECONOMY: 26 SP Earned • 14 SP Spent on Resupply • 12 Leftover Banked'));
  assert.ok(compiled.includes('• COMMAND ASSETS: 4 Stratagems Deployed • 3 CP Banked'));
  assert.ok(compiled.includes('• CONFIDENTIAL DIRECTIVE: [L2Y] 11 - Show Off'));
  assert.ok(compiled.includes('• EXTRACTED FORTIFICATIONS: Field Hospital, Ammo Dump, FOB'));
});

test('Horde Battle Stats: saveHordeBattleStats and loadHordeBattleStats persist to localStorage', () => {
  const mockStorage = {};
  globalThis.localStorage = {
    getItem: (k) => mockStorage[k] || null,
    setItem: (k, v) => { mockStorage[k] = String(v); },
    removeItem: (k) => { delete mockStorage[k]; }
  };

  const payload = {
    hordeKills: 9,
    hordeFaction: 'World Eaters',
    roundsPlayed: 4
  };

  hordeStats.saveHordeBattleStats(payload);
  const loaded = hordeStats.loadHordeBattleStats();
  assert.equal(loaded.hordeKills, 9);
  assert.equal(loaded.hordeFaction, 'World Eaters');
  assert.equal(loaded.roundsPlayed, 4);

  hordeStats.clearHordeBattleStats();
  assert.equal(hordeStats.loadHordeBattleStats(), null);

  delete globalThis.localStorage;
});

test('Horde Battle Stats: snapshotCurrentHordeStats aggregates live telemetry and persists to storage', () => {
  const mockStorage = {};
  globalThis.localStorage = {
    getItem: (k) => mockStorage[k] || null,
    setItem: (k, v) => { mockStorage[k] = String(v); },
    removeItem: (k) => { delete mockStorage[k]; }
  };

  hordeStats.resetHordeBattleStats();
  hordeStats.recordHordeKill(5);
  hordeStats.recordSpEarned(8);
  hordeStats.recordSpSpent(4);

  const snapshot = hordeStats.snapshotCurrentHordeStats({
    battleRound: 3,
    hordeFaction: 'Death Guard',
    roomSeed: 'WARP-7',
    isSoloMode: true,
    sp: 12,
    cp: 1
  });

  assert.equal(snapshot.hordeKills, 5);
  assert.equal(snapshot.hordeFaction, 'Death Guard');
  assert.equal(snapshot.roomSeed, 'WARP-7');
  assert.equal(snapshot.gameMode, 'SOLO');
  assert.equal(snapshot.roundsPlayed, 3);
  assert.equal(snapshot.leftoverSp, 12);
  assert.equal(snapshot.leftoverCp, 1);

  const reloaded = hordeStats.loadHordeBattleStats();
  assert.equal(reloaded.hordeKills, 5);
  assert.equal(reloaded.hordeFaction, 'Death Guard');

  delete globalThis.localStorage;
});

test('Spawn Rolling Regression: consecutive rollAllSpawnZones calls generate fresh random results on repeat presses', () => {
  // Mock minimal DOM for app.rollAllSpawnZones
  const mockEls = {
    seedInput: { value: 'HADES-1' },
    spawnZoneCountSelect: { value: '4' },
    hordeFactionSelect: { value: 'Orks' },
    extraSpawnMod: { value: '0' },
    spawnResultsContainer: { innerHTML: '' }
  };
  globalThis.document = {
    getElementById: (id) => mockEls[id] || { innerText: '', textContent: '', innerHTML: '', style: {}, classList: { contains: () => false, add: () => {}, remove: () => {} } },
    querySelectorAll: () => []
  };
  globalThis.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  };

  const app = require(path.join(ROOT_DIR, 'js/app.js'));

  // Roll 10 batches of spawns with 4 zones each
  const rollSnapshots = new Set();
  for (let i = 0; i < 10; i++) {
    app.rollAllSpawnZones();
    const diceSignatures = app.currentZoneSpawns.map(z => `${z.zone}:${z.diceStr}:${z.finalRoll}`).join('|');
    rollSnapshots.add(diceSignatures);
  }

  // With static Mulberry32 seed, all 10 rolls would be 100% identical (Set size = 1).
  // With fresh Math.random() rolls on every press, multiple distinct roll sequences are produced!
  assert.ok(rollSnapshots.size > 1, `Expected multiple distinct roll signatures across 10 presses, got ${rollSnapshots.size}`);
});

````
