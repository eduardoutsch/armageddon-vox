const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '../../');
const CRUSADE_HTML_PATH = path.join(ROOT_DIR, 'pages/crusade.html');

// Read crusade.html and modular crusade scripts
const crusadeHtml = fs.readFileSync(CRUSADE_HTML_PATH, 'utf8');
assert.ok(crusadeHtml.includes('<script src="../js/crusade-data.js"></script>'), 'pages/crusade.html must link to js/crusade-data.js');
assert.ok(crusadeHtml.includes('<script src="../js/crusade-forge.js"></script>'), 'pages/crusade.html must link to js/crusade-forge.js');
assert.ok(crusadeHtml.includes('<script src="../js/crusade.js"></script>'), 'pages/crusade.html must link to js/crusade.js');

const CRUSADE_DATA_JS = path.join(ROOT_DIR, 'js/crusade-data.js');
const CRUSADE_FORGE_JS = path.join(ROOT_DIR, 'js/crusade-forge.js');
const CRUSADE_JS = path.join(ROOT_DIR, 'js/crusade.js');

const crusadeScriptCode = [
  fs.readFileSync(CRUSADE_DATA_JS, 'utf8'),
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
    initCrusadePage
  };`
);

const crusade = evalFn(mockDocument, mockWindow, mockLocalStorage, console);

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
  assert.ok(report.includes('+++ DEPARTMENTO MUNITORUM // TOUR OF DUTY & LOGISTICS ALLOCATION DISPATCH +++'));
  assert.ok(report.includes('THE EXILE // THE SANCTUARY OF ASH (044TH KRIEG)'));
  assert.ok(report.includes('OPERATIONAL QUOTAS: 8 Battles Required // 4 Victories Required'));
  assert.ok(report.includes('MUNITORUM LOGISTICS ALLOCATION (5 PTS): Lexmechanicus: 2 | Materiel: 2 | Tithe Pool: 1 | Morale: 0'));
  assert.ok(report.includes('ACTIVE COMMENDATION TALLY: 2 CmP'));
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

test('crusade: #forgeSourcePool option label and BetaCodex Necron Battle Traits, Relics, and Battle Scars schemas', () => {
  // 1. Check HTML option label for BetaCodex
  assert.ok(
    crusadeHtml.includes('<option value="BetaCodex">💀 Necrons Codex (Commander Beta — Awakening Tomb World)</option>'),
    'pages/crusade.html must include the exact BetaCodex Necrons Codex option label inside #forgeSourcePool'
  );

  // 2. Check BATTLE_TRAIT_TABLES.BetaCodex and NECRONS_TRAIT_TABLES
  assert.ok(crusade.BATTLE_TRAIT_TABLES.BetaCodex, 'Must define BetaCodex inside BATTLE_TRAIT_TABLES');
  assert.equal(crusade.BATTLE_TRAIT_TABLES.BetaCodex.label, 'Necrons Codex (Dynastic Battle Traits)');
  assert.equal(crusade.BATTLE_TRAIT_TABLES.BetaCodex.tables['CHARACTER Units'].length, 6);
  assert.equal(crusade.BATTLE_TRAIT_TABLES.BetaCodex.tables['INFANTRY Units (Excluding CHARACTERS)'].length, 6);
  assert.equal(crusade.BATTLE_TRAIT_TABLES.BetaCodex.tables['VEHICLE & MOUNTED Units (Excluding CANOPTEK)'].length, 6);
  assert.equal(crusade.BATTLE_TRAIT_TABLES.BetaCodex.tables['CANOPTEK Units'].length, 3);

  assert.equal(crusade.NECRONS_TRAIT_TABLES.Character.length, 6);
  assert.equal(crusade.NECRONS_TRAIT_TABLES.Infantry.length, 6);
  assert.equal(crusade.NECRONS_TRAIT_TABLES.Mounted.length, 6);
  assert.equal(crusade.NECRONS_TRAIT_TABLES.MonsterVehicle.length, 6);
  assert.equal(crusade.NECRONS_TRAIT_TABLES.Canoptek.length, 3);

  // 3. Check CRUSADE_RELIC_VAULT.BetaCodex and NECRONS_RELIC_VAULT
  assert.ok(crusade.CRUSADE_RELIC_VAULT.BetaCodex, 'Must define BetaCodex inside CRUSADE_RELIC_VAULT');
  assert.equal(crusade.CRUSADE_RELIC_VAULT.BetaCodex.Artificer.length, 2);
  assert.equal(crusade.CRUSADE_RELIC_VAULT.BetaCodex.Antiquity.length, 2);
  assert.equal(crusade.CRUSADE_RELIC_VAULT.BetaCodex.Legendary.length, 1);

  assert.equal(crusade.NECRONS_RELIC_VAULT.Artificer.length, 2);
  assert.equal(crusade.NECRONS_RELIC_VAULT.Antiquity.length, 2);
  assert.equal(crusade.NECRONS_RELIC_VAULT.Legendary.length, 1);

  // 4. Check NECRON_BATTLE_SCARS and NECRON_BATTLE_SCAR_TABLE
  assert.equal(crusade.NECRON_BATTLE_SCARS.length, 4, 'Must define 4 Necron bespoke Battle Scars');
  assert.ok(crusade.NECRON_BATTLE_SCARS[0].includes('Creeping Madness'));
  assert.ok(crusade.NECRON_BATTLE_SCARS[1].includes('Mindless Reaper'));
  assert.ok(crusade.NECRON_BATTLE_SCARS[2].includes('Engrammatic Degradation'));
  assert.ok(crusade.NECRON_BATTLE_SCARS[3].includes('Depleted Transmaterial Reserves'));
  assert.equal(crusade.NECRON_BATTLE_SCAR_TABLE.length, 4);
});

test('crusade: Quartermaster rollers draw from BetaCodex Necron tables when forgeSourcePool is BetaCodex', () => {
  mockElements.forgeSourcePool.value = 'BetaCodex';

  // Roll Necron Character Trait
  mockElements.traitUnitType.value = 'Character';
  crusade.rollRandomBattleTrait();
  assert.ok(crusade.lastRolledItem.trait);
  const charNames = crusade.NECRONS_TRAIT_TABLES.Character.map((t) => t.name);
  assert.ok(charNames.includes(crusade.lastRolledItem.trait.name), 'Rolled trait must come from Necron Character table');

  // Roll Necron Canoptek Trait
  mockElements.traitUnitType.value = 'Canoptek';
  crusade.rollRandomBattleTrait();
  const canoptekNames = crusade.NECRONS_TRAIT_TABLES.Canoptek.map((t) => t.name);
  assert.ok(canoptekNames.includes(crusade.lastRolledItem.trait.name), 'Rolled trait must come from Necron Canoptek table');

  // Roll Necron Legendary Relic
  mockElements.relicTierSelect.value = 'Legendary';
  crusade.rollRandomRelic();
  assert.ok(crusade.lastRolledItem.relic.name.includes('Casket of Heshkefnet'), 'Must roll Casket of Heshkefnet for Necron Legendary Relic');

  // Roll Necron Bespoke Battle Scar
  crusade.rollRandomBattleScar();
  const scarNames = crusade.NECRON_BATTLE_SCAR_TABLE.map((s) => s.name);
  assert.ok(scarNames.includes(crusade.lastRolledItem.scar.name), 'Rolled scar must come from Necron Battle Scar table');

  // Restore pool
  mockElements.forgeSourcePool.value = 'Armageddon';
});

test('crusade: switchCrusadeTab handles Tab 4 Tomb World Awakening Matrix', () => {
  crusade.switchCrusadeTab('tomb', false);
  assert.equal(mockElements.cruTabBoard.classList.contains('hidden'), true);
  assert.equal(mockElements.cruTabForge.classList.contains('hidden'), true);
  assert.equal(mockElements.cruTabTour.classList.contains('hidden'), true);
  assert.equal(mockElements.cruTabTomb.classList.contains('hidden'), false);
  assert.equal(mockElements.cruTabBtn4.classList.contains('active'), true);
  assert.equal(mockElements.cruTabBtn1.classList.contains('active'), false);
  assert.equal(mockElements.cruTabBtn2.classList.contains('active'), false);
  assert.equal(mockElements.cruTabBtn3.classList.contains('active'), false);
});

test('crusade: Tomb World Awakening Matrix point allocation, Master System status, D3 reset, and Power Reserves requisition', () => {
  assert.equal(crusade.TOMB_WORLD_SYSTEMS.length, 3, 'Must define 3 Tomb World Awakening Systems');
  assert.ok(crusade.NECRON_DYNASTIC_VAULT.length >= 8, 'Must define Necron Dynastic Requisitions, Agendas & Master Protocols');

  // Reset Tomb World state
  crusade.getCrusadeState().powerReservesAllocated = false;
  mockElements.powerReservesToggle.checked = false;
  crusade.getCrusadeState().tombSystems = { command: 1, reanimation: 1, translocation: 0 };
  crusade.renderTombAwakeningMatrix();

  assert.equal(mockElements.tombMatrixAllocatedLabel.textContent, '2 / 3');
  assert.ok(mockElements.tombMasterStatusVal.textContent.includes('AWAKENING'));

  // Allocate 3rd point to translocation -> reaches 3 / 3 Master Systems Online
  crusade.adjTombSystemPt('translocation', 1);
  assert.equal(crusade.getCrusadeState().tombSystems.translocation, 1);
  assert.equal(mockElements.tombMatrixAllocatedLabel.textContent, '3 / 3');
  assert.ok(mockElements.tombMasterStatusVal.textContent.includes('MASTER ONLINE'));

  // Cannot exceed 3 total points without Power Reserves Allocated requisition
  crusade.adjTombSystemPt('command', 1);
  assert.equal(crusade.getCrusadeState().tombSystems.command, 1, 'Cannot exceed 3 total Awakening Points without Power Reserves');

  // Toggle Power Reserves Allocated (1 RP) -> expands capacity to 4
  mockElements.powerReservesToggle.checked = true;
  crusade.togglePowerReserves();
  assert.equal(crusade.getCrusadeState().powerReservesAllocated, true);
  assert.equal(mockElements.tombMatrixAllocatedLabel.textContent, '3 / 4');

  // Now we can allocate 1 more point
  crusade.adjTombSystemPt('command', 1);
  assert.equal(crusade.getCrusadeState().tombSystems.command, 2);
  assert.equal(mockElements.tombMatrixAllocatedLabel.textContent, '4 / 4');

  // Trigger Master System D3 Reset -> unassigns 1..3 Awakening Points and increments cycle counter
  const prevTotal = Object.values(crusade.getCrusadeState().tombSystems).reduce((a, b) => a + b, 0);
  crusade.rollMasterSystemReset();
  const nextTotal = Object.values(crusade.getCrusadeState().tombSystems).reduce((a, b) => a + b, 0);
  assert.ok(nextTotal < prevTotal && nextTotal >= 0, 'rollMasterSystemReset must deduct D3 Awakening Points');

  // Adjust Tomb counters (tombAgendasCompleted, tombAwakeningCycles)
  crusade.adjTombField('tombAgendasCompleted', 3);
  assert.equal(crusade.getCrusadeState().tombAgendasCompleted, 3);
  assert.equal(mockElements.tombAgendasCompleted.textContent, '3');
  crusade.adjTombField('tombAgendasCompleted', -10);
  assert.equal(crusade.getCrusadeState().tombAgendasCompleted, 0);
});

test('crusade: Necron Dynastic Vault selection, attachNecronVaultToDossier, and Tomb World Awakening Dispatch transmission', () => {
  crusade.populateNecronDynasticVault();
  assert.ok(mockElements.necronVaultSelect.innerHTML.includes('Viral Vectors'));
  assert.ok(mockElements.necronVaultSelect.innerHTML.includes('The Slow Decay of Self'));

  mockElements.necronVaultSelect.value = 'viral_vectors';
  crusade.renderSelectedNecronVaultPreview();
  assert.ok(mockElements.necronVaultPreviewBox.innerHTML.includes('Flayed Ones'));

  mockElements.necronRecipientUnit.value = 'Immortal Phalanx #2';
  const prevLen = crusade.getCrusadeState().queuedRolls.length;
  crusade.attachNecronVaultToDossier();
  assert.equal(crusade.getCrusadeState().queuedRolls.length, prevLen + 1);
  assert.equal(crusade.getCrusadeState().queuedRolls[crusade.getCrusadeState().queuedRolls.length - 1].unit, 'Immortal Phalanx #2');
  assert.equal(crusade.getCrusadeState().activeTab, 'forge');

  // Verify Tomb Matrix telemetry in Beta Master Dossier and Tomb Awakening Dispatch
  crusade.getCrusadeState().tombSystems = { command: 2, reanimation: 1, translocation: 0 };
  crusade.getCrusadeState().tombAgendasCompleted = 4;
  crusade.getCrusadeState().tombAwakeningCycles = 1;
  mockElements.tombAwakeningNotes.value = 'Cryptek Conclave routing power to Command and Reanimation nodes beneath Golgotha.';

  const summary = crusade.buildTombMatrixSummaryLine();
  assert.ok(summary.includes('Command: 2'));
  assert.ok(summary.includes('Reanimation: 1'));
  assert.ok(summary.includes('Translocation: 0'));
  assert.ok(summary.includes('MASTER ONLINE'));

  // Beta Master Battle Dossier includes Tomb World Awakening Matrix Telemetry
  mockElements.dossierChannel.value = 'beta';
  mockElements.dossierModeNode.value = 'Mode 1: Co-op Horde Breach // Node 0 (Golgotha Arbor-Basin)';
  const betaMaster = crusade.buildMasterDossierString();
  assert.ok(betaMaster.includes('TOMB WORLD AWAKENING MATRIX TELEMETRY:'));

  // Dedicated Tomb World Awakening Dispatch
  crusade.updateTombAwakeningPreview();
  const dispatch = crusade.buildTombAwakeningDossierString();
  assert.equal(mockElements.tombAwakeningPreviewBox.textContent, dispatch);
  assert.ok(dispatch.includes('+++ TOMB-SHIP MASTER MATRIX // TOMB WORLD AWAKENING & SYSTEM ALLOCATION DISPATCH +++'));
  assert.ok(dispatch.includes('LORD COMMANDER JUNEBUG // TOMB-SHIP INTERLINK'));
  assert.ok(dispatch.includes('Cryptek Conclave routing power to Command and Reanimation nodes'));

  transmittedChannel = null;
  transmittedPayload = null;
  crusade.transmitTombAwakeningDossier();
  assert.equal(transmittedChannel, 'beta');
  assert.equal(transmittedPayload, dispatch);
});

test('crusade: resetTombAwakeningTab resets Tomb World Awakening tab state, centers stat cards & buttons, and keeps Tour of Duty tab in Militarum color', () => {
  // 1. Verify resetTombAwakeningTab button exists in HTML and function is exported
  assert.ok(
    crusadeHtml.includes('resetTombAwakeningTab()'),
    'pages/crusade.html must include a Reset button calling resetTombAwakeningTab() in #cruTabTomb'
  );
  assert.equal(typeof crusade.resetTombAwakeningTab, 'function', 'Must define resetTombAwakeningTab function');

  // Dirty up Tomb World Awakening state
  crusade.getCrusadeState().tombAgendasCompleted = 5;
  crusade.getCrusadeState().tombAwakeningCycles = 3;
  crusade.getCrusadeState().powerReservesAllocated = true;
  crusade.getCrusadeState().tombSystems = { command: 3, reanimation: 1, translocation: 0 };
  mockElements.powerReservesToggle.checked = true;
  mockElements.necronRecipientUnit.value = 'Doomsday Ark #1';
  mockElements.tombAwakeningNotes.value = 'Custom Cryptek notes to be reset.';
  mockElements.tombResetNotice.innerHTML = 'Master System Surge!';

  // Execute resetTombAwakeningTab()
  crusade.resetTombAwakeningTab();

  assert.equal(crusade.getCrusadeState().tombAgendasCompleted, 0);
  assert.equal(crusade.getCrusadeState().tombAwakeningCycles, 0);
  assert.equal(crusade.getCrusadeState().powerReservesAllocated, false);
  assert.deepEqual(crusade.getCrusadeState().tombSystems, { command: 0, reanimation: 0, translocation: 0 });
  assert.equal(mockElements.tombAgendasCompleted.textContent, '0');
  assert.equal(mockElements.tombAwakeningCycles.textContent, '0');
  assert.equal(mockElements.powerReservesToggle.checked, false);
  assert.equal(mockElements.necronRecipientUnit.value, '');
  assert.equal(mockElements.tombAwakeningNotes.value, '');
  assert.equal(mockElements.tombMatrixAllocatedLabel.textContent, '0 / 3');
  assert.ok(mockElements.tombMasterStatusVal.textContent.includes('DORMANT STASIS'));

  // 2. Verify centered stat cards and centered button rows in #cruTabTomb
  assert.ok(
    crusadeHtml.includes('stat-card-centered') && crusadeHtml.includes('justify-content:center'),
    'pages/crusade.html must center stat cards and button rows in Tomb World Awakening tab'
  );

  // 3. Verify Tour of Duty tab (#cruTabTour) always keeps Militarum color scheme (like vox.html)
  crusade.switchCrusadeTab('tomb', false);
  assert.equal(mockDocument.body.classList.contains('theme-necron'), true, 'Switching to Tomb World tab activates theme-necron');
  assert.equal(mockDocument.body.classList.contains('theme-militarum'), false);

  crusade.switchCrusadeTab('tour', false);
  assert.equal(mockDocument.body.classList.contains('theme-militarum'), true, 'Switching to Tour of Duty tab always activates Militarum color mode (theme-militarum)');
  assert.equal(mockDocument.body.classList.contains('theme-necron'), false, 'Switching to Tour of Duty tab removes theme-necron');
  const crusadeCss = fs.readFileSync(path.join(ROOT_DIR, 'css/crusade.css'), 'utf8');
  assert.ok(
    (crusadeHtml.includes('#cruTabTour') || crusadeCss.includes('#cruTabTour')) &&
    (crusadeHtml.includes('#cruTabBtn3.active') || crusadeCss.includes('#cruTabBtn3.active')),
    'pages/crusade.html or css/crusade.css must include explicit Militarum color styling for #cruTabTour and #cruTabBtn3.active'
  );

  // 4. Verify choice-grid form column alignment & vault preview flex header layout
  assert.ok(
    crusadeHtml.includes('.choice-grid > div:not(.choice-card):not(.card)') ||
    crusadeCss.includes('.choice-grid > div:not(.choice-card):not(.card)'),
    'pages/crusade.html or css/crusade.css must align choice-grid form field columns so select and input boxes sit level'
  );
  crusade.renderSelectedNecronVaultPreview();
  assert.ok(
    mockElements.necronVaultPreviewBox.innerHTML.includes('justify-content:space-between'),
    'renderSelectedNecronVaultPreview must use a flex header row so badge and title align cleanly'
  );
  crusade.renderSelectedCommendationPreview();
  assert.ok(
    mockElements.commendationPreviewBox.innerHTML.includes('justify-content:space-between'),
    'renderSelectedCommendationPreview must use a flex header row so badge and title align cleanly'
  );
});
