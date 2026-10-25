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
  cruTabTour: { classList: createMockClassList() },
  cruTabBtn1: { classList: createMockClassList() },
  cruTabBtn2: { classList: createMockClassList() },
  cruTabBtn3: { classList: createMockClassList() },
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
  masterDossierPreviewBox: { textContent: '' },
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
  startOfTourPreviewBox: { textContent: '' }
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
    ASTRA_MILITARUM_TRAIT_TABLES,
    WEAPON_MOD_TABLE,
    CRUSADE_RELIC_VAULT,
    ASTRA_MILITARUM_RELIC_VAULT,
    BATTLE_SCAR_TABLE,
    LOGISTICS_CATEGORIES,
    ASTRA_COMMENDATIONS_VAULT,
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
  assert.ok(dossierStr.includes('+++ MASTER POST-BATTLE & UNIT PROGRESSION DOSSIER +++'));
  assert.ok(dossierStr.includes('THE EXILE // SANCTUARY OF ASH'));
  assert.ok(dossierStr.includes('Golgotha Arbor-Basin'));
  assert.ok(dossierStr.includes('SECRET OBJECTIVE CODE: [A9F]'));
  assert.ok(dossierStr.includes("Mercy's Delay"));
  assert.ok(dossierStr.includes('Held the frontline'));
});

test('crusade: does not duplicate Mode 3 Rogue Sector reporting (kept exclusively in pages/rogue.html)', () => {
  assert.ok(!crusadeHtml.includes('Mode 3: Rogue Sector Auxiliary Clash'), 'crusade.html must not include Mode 3 Rogue Sector option in dossierModeNode');
  assert.ok(!crusadeHtml.includes('Mode 3 Rogue Sector:'), 'crusade.html must not include Mode 3 Rogue Sector outcomes in dossierOutcome');

  mockElements.dossierChannel.value = 'alpha';
  mockElements.dossierModeNode.value = 'Mode 2: 1v1 Ash Wastes PvP // Node 0 (Golgotha Arbor-Basin)';
  mockElements.dossierOutcome.value = '1v1 PvP Victory & Achieved Phase Narrative Goal (+5 SPts)';
  mockElements.dossierBattleNotes.value = 'Secured the central ridge against rival vanguard.';

  const dossierStr = crusade.buildMasterDossierString();
  assert.ok(dossierStr.includes('+++ MASTER POST-BATTLE & UNIT PROGRESSION DOSSIER +++'));
  assert.ok(!dossierStr.includes('ROGUE SECTOR PLANETARY IMPACT'), 'Master Dossier in crusade.html must not include Rogue Sector planetary impact');
  assert.ok(dossierStr.includes('Pattern 2 Munitorum After-Action Audit'));
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

test('crusade: Munitorum logistics point allocation enforces limits and toggles Uplifting Primers', () => {
  // Reset logistics
  crusade.getCrusadeState().upliftingPrimer = false;
  mockElements.upliftingPrimerToggle.checked = false;
  crusade.getCrusadeState().logistics = { lexmechanicus: 1, materiel: 2, tithePool: 0, morale: 1 };
  crusade.renderLogisticsAllocator();

  assert.equal(mockElements.logisticsAllocatedLabel.textContent, '4 / 4');

  // Attempt to increment when already at 4/4 total -> should not increase
  crusade.adjLogisticsPt('tithePool', 1);
  assert.equal(crusade.getCrusadeState().logistics.tithePool, 0, 'Cannot exceed 4 total points without Uplifting Primer');

  // Toggle Uplifting Primer -> expands total to 5
  mockElements.upliftingPrimerToggle.checked = true;
  crusade.toggleUpliftingPrimer();
  assert.equal(crusade.getCrusadeState().upliftingPrimer, true);
  assert.equal(mockElements.logisticsAllocatedLabel.textContent, '4 / 5');

  // Now we can increment tithePool
  crusade.adjLogisticsPt('tithePool', 1);
  assert.equal(crusade.getCrusadeState().logistics.tithePool, 1);
  assert.equal(mockElements.logisticsAllocatedLabel.textContent, '5 / 5');

  // Max 2 per category
  crusade.adjLogisticsPt('tithePool', 1);
  assert.equal(crusade.getCrusadeState().logistics.tithePool, 1, 'Cannot exceed total or per-category limit');

  // Min 0 per category
  crusade.adjLogisticsPt('tithePool', -1);
  assert.equal(crusade.getCrusadeState().logistics.tithePool, 0);
  crusade.adjLogisticsPt('tithePool', -1);
  assert.equal(crusade.getCrusadeState().logistics.tithePool, 0, 'Cannot drop below 0');
});

test('crusade: Astra Militarum commendation vault selection and attaching to dossier', () => {
  crusade.populateCommendationVault();
  assert.ok(mockElements.commendationSelect.innerHTML.includes('Bastion Honour'));
  assert.ok(mockElements.commendationSelect.innerHTML.includes('Veteran Crew'));

  mockElements.commendationSelect.value = 'auramite';
  crusade.renderSelectedCommendationPreview();
  assert.ok(mockElements.commendationPreviewBox.innerHTML.includes('Auramite Aquila'));

  mockElements.commRecipientUnit.value = "Mercy's Delay (Rogal Dorn)";
  const prevCount = crusade.getCrusadeState().queuedRolls.length;
  crusade.attachCommendationToDossier();

  assert.equal(crusade.getCrusadeState().queuedRolls.length, prevCount + 1);
  const lastItem = crusade.getCrusadeState().queuedRolls[crusade.getCrusadeState().queuedRolls.length - 1];
  assert.equal(lastItem.unit, "Mercy's Delay (Rogal Dorn)");
  assert.ok(lastItem.category.includes('Personal Commendation'));
  assert.equal(crusade.getCrusadeState().activeTab, 'forge');
});

test('crusade: buildLogisticsSummaryLine and inclusion in buildMasterDossierString for Alpha vs Beta', () => {
  crusade.getCrusadeState().tourBattlesRem = 4;
  crusade.getCrusadeState().tourWinsRem = 2;
  crusade.getCrusadeState().commendationPts = 7;
  crusade.getCrusadeState().logistics = { lexmechanicus: 2, materiel: 2, tithePool: 0, morale: 0 };

  const summary = crusade.buildLogisticsSummaryLine();
  assert.ok(summary.includes('Battles Rem: 4'));
  assert.ok(summary.includes('Wins Rem: 2'));
  assert.ok(summary.includes('Commendation Pts: 7'));
  assert.ok(summary.includes('Surplus: [Lexmechanicus, Materiel]'));
  assert.ok(summary.includes('Deficiency: [Tithe, Morale]'));

  // When dossierChannel is alpha, summary must be included
  mockElements.dossierChannel.value = 'alpha';
  const alphaDossier = crusade.buildMasterDossierString();
  assert.ok(alphaDossier.includes('TOUR OF DUTY & LOGISTICS TELEMETRY: Battles Rem: 4'));

  // When dossierChannel is beta, summary line must not be present
  mockElements.dossierChannel.value = 'beta';
  const betaDossier = crusade.buildMasterDossierString();
  assert.ok(!betaDossier.includes('TOUR OF DUTY & LOGISTICS TELEMETRY'));
});

test('crusade: saveCrusadeState and initCrusadePage restore Tour of Duty and Munitorum logistics state', () => {
  mockLocalStorage.clear();
  mockLocalStorage.setItem(crusade.CRUSADE_STATE_KEY, JSON.stringify({
    activeTab: 'tour',
    tourBattlesRem: 6,
    tourWinsRem: 3,
    commendationPts: 9,
    toursCompletedCount: 2,
    upliftingPrimer: true,
    logistics: { lexmechanicus: 2, materiel: 1, tithePool: 1, morale: 1 }
  }));

  crusade.initCrusadePage();

  assert.equal(crusade.getCrusadeState().activeTab, 'tour');
  assert.equal(crusade.getCrusadeState().tourBattlesRem, 6);
  assert.equal(crusade.getCrusadeState().tourWinsRem, 3);
  assert.equal(crusade.getCrusadeState().commendationPts, 9);
  assert.equal(crusade.getCrusadeState().toursCompletedCount, 2);
  assert.equal(crusade.getCrusadeState().upliftingPrimer, true);
  assert.equal(mockElements.tourBattlesRem.textContent, '6');
  assert.equal(mockElements.tourWinsRem.textContent, '3');
  assert.equal(mockElements.commendationPts.textContent, '9');
  assert.equal(mockElements.toursCompletedCount.textContent, '2');
});

test('crusade: resetMasterDossierForm resets all Crusade report form fields and queued rolls to clean defaults', () => {
  assert.ok(
    crusadeHtml.includes('resetMasterDossierForm()'),
    'pages/crusade.html must include a button calling resetMasterDossierForm()'
  );

  // Dirty up all fields and queue a roll
  mockElements.dossierChannel.value = 'beta';
  mockElements.dossierModeNode.value = 'Mode 2: 1v1 Ash Wastes PvP // Node 1 (Pyre-Silt Refinery)';
  mockElements.dossierOutcome.value = '1v1 PvP Defeat (+3 SPts)';
  mockElements.dossierSecretCode.value = 'Z99';
  mockElements.dossierSecretTag.value = 'Wargear / Cache Tag (+1 Supply Cache Token)';
  mockElements.fortHosp.checked = true;
  mockElements.fortAmmo.checked = true;
  mockElements.fortTrench.checked = true;
  mockElements.fortFob.checked = true;
  mockElements.dossierLeftoverSp.value = '3 Leftover SP → Bank 1v1 Supply Cache Token';
  mockElements.dossierBattleNotes.value = 'Custom battle report notes to be cleared.';
  mockElements.rollerUnitName.value = 'Test Unit';
  crusade.rollRandomBattleTrait();
  crusade.attachRollToDossier('trait');
  assert.ok(crusade.getCrusadeState().queuedRolls.length > 0);

  crusade.resetMasterDossierForm();

  assert.equal(mockElements.dossierChannel.value, 'alpha');
  assert.equal(mockElements.dossierSecretCode.value, '');
  assert.equal(mockElements.fortHosp.checked, false);
  assert.equal(mockElements.fortAmmo.checked, false);
  assert.equal(mockElements.fortTrench.checked, false);
  assert.equal(mockElements.fortFob.checked, false);
  assert.equal(mockElements.dossierLeftoverSp.value, '0 Leftover SP');
  assert.equal(mockElements.dossierBattleNotes.value, '');
  assert.equal(crusade.getCrusadeState().queuedRolls.length, 0);
  assert.equal(mockElements.queuedCountLabel.textContent, '0');
  assert.ok(mockElements.masterDossierPreviewBox.textContent.includes('None attached this battle.'));
});

test('crusade: buildStartOfTourDossierString and transmitStartOfTourDossier compile and transmit unique Start of Tour of Duty report', () => {
  assert.ok(
    crusadeHtml.includes('transmitStartOfTourDossier()'),
    'pages/crusade.html must include a button calling transmitStartOfTourDossier()'
  );

  crusade.getCrusadeState().tourBattlesRem = 8;
  crusade.getCrusadeState().tourWinsRem = 4;
  crusade.getCrusadeState().commendationPts = 2;
  crusade.getCrusadeState().toursCompletedCount = 1;
  crusade.getCrusadeState().upliftingPrimer = true;
  crusade.getCrusadeState().logistics = { lexmechanicus: 2, materiel: 2, tithePool: 1, morale: 0 };
  mockElements.startTourNotes.value = 'Deploying 044th Krieg armored column to Golgotha sector.';

  crusade.updateStartOfTourPreview();
  const report = crusade.buildStartOfTourDossierString();

  assert.equal(mockElements.startOfTourPreviewBox.textContent, report);
  assert.ok(report.includes('+++ MUNITORUM FIELD REGULATION 884-ALPHA // START OF TOUR OF DUTY DISPATCH +++'));
  assert.ok(report.includes('THE EXILE // SANCTUARY OF ASH'));
  assert.ok(report.includes('BATTLES REQUIRED QUOTA (D6+4): 8 Battles'));
  assert.ok(report.includes('VICTORIES REQUIRED QUOTA (D3+2): 4 Wins'));
  assert.ok(report.includes('PRIOR TOURS COMPLETED: 1'));
  assert.ok(report.includes('UPLIFTING PRIMERS REQUISITION (1 RP): ACTIVE (5 Total Logistics Pts)'));
  assert.ok(report.includes('Surplus: [Lexmechanicus, Materiel]'));
  assert.ok(report.includes('Deficiency: [Morale]'));
  assert.ok(report.includes('Deploying 044th Krieg armored column to Golgotha sector.'));

  transmittedChannel = null;
  transmittedPayload = null;
  crusade.transmitStartOfTourDossier();
  assert.equal(transmittedChannel, 'alpha');
  assert.equal(transmittedPayload, report);
});

test('crusade: compileMasterDossier and buildMasterDossierString format Distant Solo Horde Augur Intercept for off-roster force with zero SPt shifts', () => {
  mockElements.dossierChannel.value = 'augur_alpha';
  mockElements.dossierModeNode.value = 'Mode 1: Distant Solo Horde Breach // Orbital Augur Telemetry';
  mockElements.dossierDistantForce.value = '019th Steel Legion Patrol';
  mockElements.dossierOutcome.value = 'Survived Round 6 Final Stand & Completed Secret Objective (+5 SPts)';
  mockElements.dossierSecretCode.value = 'B77';
  mockElements.dossierSecretTag.value = 'Action / Relic Tag (Free Battle Trait, Weapon Mod, or Relic)';
  mockElements.dossierBattleNotes.value = 'Ventral augurs locked onto an intense swarm breach 40km north. Remote PDF held the perimeter.';

  crusade.clearQueuedRolls();
  mockElements.rollerUnitName.value = 'Sentinel Outrider Alpha-9';
  mockElements.rollerUnitContext.value = 'Kited the swarm behemoth across the sulfur dunes.';
  crusade.rollRandomBattleTrait();
  crusade.attachRollToDossier('trait');

  crusade.updateDistantForceVisibility();
  assert.equal(mockElements.dossierDistantForceRow.style.display, 'block');

  const dossierStr = crusade.buildMasterDossierString();
  assert.ok(dossierStr.includes('+++ MASTER POST-BATTLE DOSSIER // ORBITAL AUGUR TELEMETRY +++'));
  assert.ok(dossierStr.includes('ORBITAL AUGUR ARRAY (Relayed via THE EXILE // SANCTUARY OF ASH)'));
  assert.ok(dossierStr.includes('019th Steel Legion Patrol (Neither Main Player Fielded)'));
  assert.ok(dossierStr.includes('Mode 1: Distant Solo Horde Breach // Orbital Augur Telemetry'));
  assert.ok(dossierStr.includes('Zero Alliance SPt Shift (Off-Roster Narrative Telemetry)'));
  assert.ok(dossierStr.includes('Zero Quota Deduction (Neither Main Player Fielded)'));
  assert.ok(!dossierStr.includes('TOUR OF DUTY & LOGISTICS TELEMETRY: Battles Rem:'));
  assert.ok(dossierStr.includes('Sentinel Outrider Alpha-9'));
  assert.ok(dossierStr.includes('Ventral augurs locked onto an intense swarm breach'));
  assert.ok(dossierStr.includes('As neither main player participated, no Alliance SPts are shifted'));
});

test('crusade: compileMasterDossier supports Junebug augur_beta conduit and fallbacks for empty distant force', () => {
  mockElements.dossierChannel.value = 'augur_beta';
  mockElements.dossierModeNode.value = 'Mode 1: Distant Solo Horde Breach // Orbital Augur Telemetry';
  mockElements.dossierDistantForce.value = '';
  mockElements.dossierBattleNotes.value = 'Distant explosions recorded.';

  const dossierStr = crusade.buildMasterDossierString();
  assert.ok(dossierStr.includes('ORBITAL AUGUR ARRAY (Relayed via LORD COMMANDER JUNEBUG)'));
  assert.ok(dossierStr.includes('Unspecified Distant Auxiliary Detachment (Neither Main Player Fielded)'));
});

test('crusade: transmitMasterBattleDossier routes augur_alpha to alpha and augur_beta to beta with dual-channel intercept payload', () => {
  transmittedChannel = null;
  transmittedPayload = null;
  mockElements.dossierChannel.value = 'augur_alpha';
  mockElements.dossierModeNode.value = 'Mode 1: Distant Solo Horde Breach // Orbital Augur Telemetry';
  mockElements.dossierDistantForce.value = 'Iron Warriors 77th Cohort';

  crusade.transmitMasterBattleDossier();
  assert.equal(transmittedChannel, 'alpha', 'Must route to commanding player alpha CRT terminal');
  assert.ok(transmittedPayload.includes('ORBITAL AUGUR TELEMETRY'));

  mockElements.dossierChannel.value = 'augur_beta';
  crusade.transmitMasterBattleDossier();
  assert.equal(transmittedChannel, 'beta', 'Must route to commanding player beta CRT terminal');
  assert.ok(transmittedPayload.includes('LORD COMMANDER JUNEBUG'));
});

test('crusade: resetMasterDossierForm clears dossierDistantForce and resets distant force visibility', () => {
  mockElements.dossierChannel.value = 'augur_alpha';
  mockElements.dossierDistantForce.value = 'Test Distant Auxiliary';
  crusade.updateDistantForceVisibility();
  assert.equal(mockElements.dossierDistantForceRow.style.display, 'block');

  crusade.resetMasterDossierForm();
  assert.equal(mockElements.dossierChannel.value, 'alpha');
  assert.equal(mockElements.dossierDistantForce.value, '');
  assert.equal(mockElements.dossierDistantForceRow.style.display, 'none');
});

test('crusade: saveCrusadeState and initCrusadePage persist and restore distant force and augur channel', () => {
  mockLocalStorage.clear();
  mockLocalStorage.setItem(crusade.CRUSADE_STATE_KEY, JSON.stringify({
    activeTab: 'forge',
    dossierChannel: 'augur_alpha',
    dossierDistantForce: 'Salamanders 3rd Company Patrol'
  }));

  crusade.initCrusadePage();
  assert.equal(crusade.getCrusadeState().dossierChannel, 'augur_alpha');
  assert.equal(crusade.getCrusadeState().dossierDistantForce, 'Salamanders 3rd Company Patrol');
  assert.equal(mockElements.dossierChannel.value, 'augur_alpha');
  assert.equal(mockElements.dossierDistantForce.value, 'Salamanders 3rd Company Patrol');
  assert.equal(mockElements.dossierDistantForceRow.style.display, 'block');
});



