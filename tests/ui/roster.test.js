const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '../../');
const ROSTER_HTML_PATH = path.join(ROOT_DIR, 'pages/roster.html');
const DATA_JS_PATH = path.join(ROOT_DIR, 'js/data.js');

// Load HORDE_FACTIONS from js/data.js
const dataJsCode = fs.readFileSync(DATA_JS_PATH, 'utf8');
const dataFn = new Function(`${dataJsCode}; return { HORDE_FACTIONS };`);
const { HORDE_FACTIONS } = dataFn();

// Read roster.html and extract script block
const rosterHtml = fs.readFileSync(ROSTER_HTML_PATH, 'utf8');
const scriptMatches = rosterHtml.match(/<script>([\s\S]*?)<\/script>/);
assert.ok(scriptMatches && scriptMatches[1], 'Must locate script tag inside pages/roster.html');
const rosterScriptCode = scriptMatches[1];

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
  rosTabNemesis: { classList: createMockClassList() },
  rosTabUnbound: { classList: createMockClassList() },
  rosTabBrackets: { classList: createMockClassList() },
  rosTabBtn1: { classList: createMockClassList() },
  rosTabBtn2: { classList: createMockClassList() },
  rosTabBtn3: { classList: createMockClassList() },
  nemStatus1: { value: 'roaming' },
  nemStatus2: { value: 'roaming' },
  nemReportChannel: { value: 'alpha' },
  nemReportSector: { value: 'Mode 1: Horde Breach // Node 0 (Golgotha Arbor-Basin)' },
  nemReportUnit: { value: 'Tyranids — Screamer-Killer' },
  nemReportFeat: { value: 'Slain a Player Warlord / Character in combat' },
  nemReportNotes: { value: 'Survived two Vanquisher shots and wiped Krieg squad.' },
  nemDossierPreview: { textContent: '' },
  rosterPool34: { value: '10 Hormagaunts, 10 Termagants' },
  rosterPool56: { value: '10 Genestealers, 5 Chaos Terminators' },
  rosterPool79: { value: '1 Screamer-Killer, 1 Trygon' },
  rosterPool10: { value: '1 Norn Emissary, 1 Hive Tyrant' },
  rosterPool13: { value: '1 Hierophant Bio-Titan' },
  shelfSaveNotice: { classList: createMockClassList() },
  cloudSyncBadge: { textContent: '' },
  bracketFactionPicker: { value: 'Space Marines', innerHTML: '' },
  factionBracketDisplay: { innerHTML: '' }
};

const mockDocument = {
  getElementById: (id) => mockElements[id] || null
};

let transmittedChannel = null;
let transmittedPayload = null;
let cloudSyncChimesPlayed = 0;

const mockWindow = {
  addEventListener: () => {},
  VoxAudio: {
    playCloudSyncChime: () => {
      cloudSyncChimesPlayed++;
    },
    transmitToVox: (chan, payload) => {
      transmittedChannel = chan;
      transmittedPayload = payload;
    }
  }
};

let enableCloudMock = false;
let lastFetchUrl = null;
let lastFetchBody = null;

const mockFetch = async (url, options = {}) => {
  lastFetchUrl = url;
  lastFetchBody = options.body ? JSON.parse(options.body) : null;

  if (!enableCloudMock) {
    return { ok: false };
  }

  if (url.includes('save_shared_spawn_pools')) {
    return {
      ok: true,
      json: async () => ({ ok: true })
    };
  }

  if (url.includes('get_shared_spawn_pools')) {
    return {
      ok: true,
      json: async () => ({
        ok: true,
        horde_pool: {
          b34: 'Cloud Gaunts 20',
          b56: 'Cloud Warriors 5',
          b79: 'Cloud Carnifex 2',
          b10: 'Cloud Tyrant 1',
          b13: 'Cloud Titan 1'
        },
        nemesis_status: {
          nem1: 'deployed',
          nem2: 'slain'
        }
      })
    };
  }

  return { ok: false };
};

// Evaluate script in mock environment
const evalFn = new Function(
  'document',
  'window',
  'localStorage',
  'HORDE_FACTIONS',
  'console',
  'fetch',
  `${rosterScriptCode}; return {
    ROSTER_STATE_KEY,
    CUSTOM_POOL_STORAGE_KEY,
    HORDE_FACTION_SPAWN_TABLES,
    switchRosterTab,
    buildNemesisDossierString,
    updateNemesisPreview,
    transmitNemesisDossier,
    saveShelfBarracks,
    syncPoolsToSupabaseCloud,
    pullSharedPoolsFromCloud,
    renderFactionBracketTable,
    saveRosterPageState,
    initRosterPage,
    getStoredPoolRoot,
    getFactionPoolFromStore,
    loadFactionInputs,
    onFactionPickerChange
  };`
);

const roster = evalFn(mockDocument, mockWindow, mockLocalStorage, HORDE_FACTIONS, console, mockFetch);

test('roster: HORDE_FACTION_SPAWN_TABLES contains valid threat brackets for factions', () => {
  assert.ok(roster.HORDE_FACTION_SPAWN_TABLES, 'Must define HORDE_FACTION_SPAWN_TABLES');
  const sm = roster.HORDE_FACTION_SPAWN_TABLES['Space Marines'];
  assert.ok(sm, 'Must define Space Marines table');
  assert.ok(Array.isArray(sm.b34) && sm.b34.length > 0, 'Space Marines must have bracket [3-4]');
  assert.ok(Array.isArray(sm.b56) && sm.b56.length > 0, 'Space Marines must have bracket [5-6]');
  assert.ok(Array.isArray(sm.b79) && sm.b79.length > 0, 'Space Marines must have bracket [7-9]');
  assert.ok(Array.isArray(sm.b10) && sm.b10.length > 0, 'Space Marines must have bracket [10+]');
  assert.ok(Array.isArray(sm.b13) && sm.b13.length > 0, 'Space Marines must have bracket [13+]');
});

test('roster: switchRosterTab toggles active tab and DOM visibility classes', () => {
  roster.switchRosterTab('unbound', false);
  assert.equal(mockElements.rosTabNemesis.classList.contains('hidden'), true);
  assert.equal(mockElements.rosTabUnbound.classList.contains('hidden'), false);
  assert.equal(mockElements.rosTabBrackets.classList.contains('hidden'), true);
  assert.equal(mockElements.rosTabBtn2.classList.contains('active'), true);
  assert.equal(mockElements.rosTabBtn1.classList.contains('active'), false);

  roster.switchRosterTab('brackets', false);
  assert.equal(mockElements.rosTabBrackets.classList.contains('hidden'), false);
  assert.equal(mockElements.rosTabBtn3.classList.contains('active'), true);

  roster.switchRosterTab('nemesis', false);
  assert.equal(mockElements.rosTabNemesis.classList.contains('hidden'), false);
  assert.equal(mockElements.rosTabBtn1.classList.contains('active'), true);
});

test('roster: buildNemesisDossierString formats Nemesis Induction Dossier for Campaign Master', () => {
  mockElements.nemReportChannel.value = 'alpha';
  mockElements.nemReportUnit.value = 'Tyranids — Screamer-Killer';
  mockElements.nemReportNotes.value = 'Survived two Vanquisher shots on 1 Wound and slaughtered Death Riders.';

  const str = roster.buildNemesisDossierString();
  assert.ok(str.includes('+++ ORDO MALLEUS // NEW NEMESIS INDUCTION DOSSIER +++'));
  assert.ok(str.includes('• FILING COMMANDER: THE EXILE // SANCTUARY OF ASH'));
  assert.ok(str.includes('• HOSTILE DATASHEET / FACTION: Tyranids — Screamer-Killer'));
  assert.ok(str.includes('slaughtered Death Riders'));

  mockElements.nemReportChannel.value = 'beta';
  const strBeta = roster.buildNemesisDossierString();
  assert.ok(strBeta.includes('• FILING COMMANDER: LORD COMMANDER JUNEBUG'));
});

test('roster: updateNemesisPreview populates preview box and saves state', () => {
  roster.updateNemesisPreview();
  assert.ok(mockElements.nemDossierPreview.textContent.includes('ORDO MALLEUS'));

  const rawState = mockLocalStorage.getItem(roster.ROSTER_STATE_KEY);
  assert.ok(rawState, 'Must persist roster state to localStorage');
  const state = JSON.parse(rawState);
  assert.equal(state.nemReportUnit, 'Tyranids — Screamer-Killer');
});

test('roster: transmitNemesisDossier triggers window.VoxAudio.transmitToVox with compiled payload', () => {
  transmittedChannel = null;
  transmittedPayload = null;
  mockElements.nemReportChannel.value = 'beta';

  roster.transmitNemesisDossier();
  assert.equal(transmittedChannel, 'beta');
  assert.ok(transmittedPayload.includes('LORD COMMANDER JUNEBUG'));
  assert.ok(transmittedPayload.includes('ORDO MALLEUS'));
});

test('roster: saveShelfBarracks persists custom pool to localStorage', () => {
  mockElements.rosterPool34.value = '20 Termagants';
  mockElements.rosterPool56.value = '5 Tyranid Warriors';
  mockElements.rosterPool79.value = '1 Maleceptor';
  mockElements.rosterPool10.value = '1 Tyrannofex';
  mockElements.rosterPool13.value = '1 Hierophant Bio-Titan';

  cloudSyncChimesPlayed = 0;
  roster.saveShelfBarracks();

  assert.equal(cloudSyncChimesPlayed, 1, 'saveShelfBarracks must play cloud sync chime');
  const saved = mockLocalStorage.getItem(roster.CUSTOM_POOL_STORAGE_KEY);
  assert.ok(saved, 'Must persist custom shelf pool to localStorage');
  const pool = JSON.parse(saved);
  assert.equal(pool.b34, '20 Termagants');
  assert.equal(pool.b56, '5 Tyranid Warriors');
  assert.equal(pool.b79, '1 Maleceptor');
  assert.equal(pool.b10, '1 Tyrannofex');
  assert.equal(pool.b13, '1 Hierophant Bio-Titan');
});

test('roster: renderFactionBracketTable displays faction rules and bracket units', () => {
  mockElements.bracketFactionPicker.value = 'Tyranids';
  roster.renderFactionBracketTable();

  assert.ok(mockElements.factionBracketDisplay.innerHTML.includes('Tyranids'));
  assert.ok(mockElements.factionBracketDisplay.innerHTML.includes('Neurons Activated'));
  assert.ok(mockElements.factionBracketDisplay.innerHTML.includes('10 Termagants'));
  assert.ok(mockElements.factionBracketDisplay.innerHTML.includes('Norn Emissary'));
});

test('roster: saveRosterPageState and initRosterPage preserve and restore form and tab state', () => {
  mockLocalStorage.clear();
  mockLocalStorage.setItem(roster.ROSTER_STATE_KEY, JSON.stringify({
    activeRosterTab: 'unbound',
    nemStatus1: 'slain',
    nemStatus2: 'deployed',
    nemReportChannel: 'beta',
    nemReportSector: 'Mode 2: 1v1 PvP // Unbound Adversary',
    nemReportUnit: 'Chaos Lord in Terminator Armour',
    nemReportFeat: 'Slain a Player Warlord / Character in combat',
    nemReportNotes: 'Struck down Commander Alpha in heroic intervention.'
  }));

  mockLocalStorage.setItem(roster.CUSTOM_POOL_STORAGE_KEY, JSON.stringify({
    b34: 'Custom Chaff A, B',
    b56: 'Custom Elites C',
    b79: 'Custom Heavy D',
    b10: 'Custom Super-Heavy E'
  }));

  roster.initRosterPage();

  assert.equal(mockElements.nemStatus1.value, 'slain');
  assert.equal(mockElements.nemStatus2.value, 'deployed');
  assert.equal(mockElements.nemReportChannel.value, 'beta');
  assert.equal(mockElements.nemReportUnit.value, 'Chaos Lord in Terminator Armour');
  assert.equal(mockElements.rosterPool34.value, 'Custom Chaff A, B');
  assert.equal(mockElements.rosterPool10.value, 'Custom Super-Heavy E');
});

test('roster: syncPoolsToSupabaseCloud sends pool payload to Supabase RPC and updates badge', async () => {
  enableCloudMock = true;
  lastFetchUrl = null;
  lastFetchBody = null;

  const testPool = {
    b34: '10 Hormagaunts',
    b56: '5 Terminators',
    b79: '1 Trygon',
    b10: '1 Norn Emissary',
    b13: '1 Bio-Titan'
  };

  const ok = await roster.syncPoolsToSupabaseCloud(testPool);
  assert.equal(ok, true);
  assert.ok(lastFetchUrl.includes('save_shared_spawn_pools'));
  assert.deepEqual(lastFetchBody.p_horde_pool, testPool);
  assert.ok(mockElements.cloudSyncBadge.textContent.includes('Cloud Pool Synced'));

  enableCloudMock = false;
});

test('roster: pullSharedPoolsFromCloud pulls pool and nemesis status from Supabase RPC', async () => {
  enableCloudMock = true;
  lastFetchUrl = null;

  cloudSyncChimesPlayed = 0;
  const ok = await roster.pullSharedPoolsFromCloud();
  assert.equal(ok, true);
  assert.equal(cloudSyncChimesPlayed, 1, 'pullSharedPoolsFromCloud must play cloud sync chime');
  assert.ok(lastFetchUrl.includes('get_shared_spawn_pools'));
  assert.equal(mockElements.rosterPool34.value, 'Cloud Gaunts 20');
  assert.equal(mockElements.rosterPool56.value, 'Cloud Warriors 5');
  assert.equal(mockElements.nemStatus1.value, 'deployed');
  assert.equal(mockElements.nemStatus2.value, 'slain');

  const savedPool = JSON.parse(mockLocalStorage.getItem(roster.CUSTOM_POOL_STORAGE_KEY));
  assert.equal(savedPool.b34, 'Cloud Gaunts 20');

  enableCloudMock = false;
});

test('roster: per-faction shelf pool storage preserves separate pools per faction', () => {
  mockLocalStorage.clear();
  mockElements.bracketFactionPicker.value = 'Tyranids';
  mockElements.rosterPool34.value = '10 Hormagaunts';
  mockElements.rosterPool56.value = '3 Warriors';
  mockElements.rosterPool79.value = '1 Carnifex';
  mockElements.rosterPool10.value = '1 Norn Emissary';
  mockElements.rosterPool13.value = '1 Hierophant';
  roster.saveShelfBarracks();

  // Switch to Orks
  mockElements.bracketFactionPicker.value = 'Orks';
  mockElements.rosterPool34.value = '10 Boyz';
  mockElements.rosterPool56.value = '5 Nobz';
  mockElements.rosterPool79.value = '1 Battlewagon';
  mockElements.rosterPool10.value = '1 Ghazghkull';
  mockElements.rosterPool13.value = '1 Stompa';
  roster.saveShelfBarracks();

  // Verify stored JSON has byFaction
  const root = roster.getStoredPoolRoot();
  assert.ok(root.byFaction);
  assert.equal(root.byFaction['Tyranids'].b34, '10 Hormagaunts');
  assert.equal(root.byFaction['Orks'].b34, '10 Boyz');

  // Switch faction picker back to Tyranids and trigger onFactionPickerChange
  mockElements.bracketFactionPicker.value = 'Tyranids';
  roster.onFactionPickerChange();
  assert.equal(mockElements.rosterPool34.value, '10 Hormagaunts');
  assert.equal(mockElements.rosterPool10.value, '1 Norn Emissary');

  // Switch to an unconfigured faction and verify empty values
  mockElements.bracketFactionPicker.value = 'Necrons';
  roster.onFactionPickerChange();
  assert.equal(mockElements.rosterPool34.value, '');
});

