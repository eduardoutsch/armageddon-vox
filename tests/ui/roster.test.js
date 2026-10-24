const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '../../');
const ROSTER_HTML_PATH = path.join(ROOT_DIR, 'pages/roster.html');
const DATA_JS_PATH = path.join(ROOT_DIR, 'js/data.js');

// Load HORDE_FACTIONS and HORDE_FACTION_SPAWN_TABLES from js/data.js
const dataJsCode = fs.readFileSync(DATA_JS_PATH, 'utf8');
const dataFn = new Function(`${dataJsCode}; return { HORDE_FACTIONS, HORDE_FACTION_SPAWN_TABLES };`);
const { HORDE_FACTIONS, HORDE_FACTION_SPAWN_TABLES } = dataFn();

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
  nemStatus3: { value: 'roaming' },
  toggleAllNemBtn: { textContent: '▴ Collapse All' },
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

const mockNemesisCards = [{ open: true }, { open: true }, { open: true }];

const mockDocument = {
  getElementById: (id) => mockElements[id] || null,
  querySelectorAll: (sel) => (sel.includes('details.nemesis-card') ? mockNemesisCards : [])
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
  'HORDE_FACTION_SPAWN_TABLES',
  'console',
  'fetch',
  `${rosterScriptCode}; return {
    ROSTER_STATE_KEY,
    CUSTOM_POOL_STORAGE_KEY,
    HORDE_FACTION_SPAWN_TABLES: (typeof HORDE_FACTION_SPAWN_TABLES !== 'undefined' ? HORDE_FACTION_SPAWN_TABLES : (window && window.HORDE_FACTION_SPAWN_TABLES)),
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
    onFactionPickerChange,
    resetNemesisDossierForm: (typeof resetNemesisDossierForm !== 'undefined' ? resetNemesisDossierForm : undefined)
  };`
);

const roster = evalFn(mockDocument, mockWindow, mockLocalStorage, HORDE_FACTIONS, HORDE_FACTION_SPAWN_TABLES, console, mockFetch);

test('roster: runs cleanly in browser global scope alongside data.js without syntax errors and populates preview', () => {
  // Test sequential script execution in shared scope to verify no duplicate declarations
  const runner = new Function(
    'document',
    'window',
    'localStorage',
    'console',
    'fetch',
    `
    ${dataJsCode}
    ${rosterScriptCode}
    return {
      initRosterPage,
      updateNemesisPreview,
      switchRosterTab,
      buildNemesisDossierString
    };
    `
  );
  assert.doesNotThrow(() => {
    const res = runner(mockDocument, mockWindow, mockLocalStorage, console, mockFetch);
    assert.ok(res.switchRosterTab, 'switchRosterTab must be defined');
    res.initRosterPage();
    assert.ok(mockElements.nemDossierPreview.textContent.includes('ORDO MALLEUS'), 'Preview must have text');
  }, 'Must not throw SyntaxError when data.js and roster.html run together');
});

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

test('roster: Active Nemesis cards are collapsible windows sharing the same design pattern without an Expand All button', () => {
  // Verify Expand/Collapse All button is removed
  assert.ok(!rosterHtml.includes('id="toggleAllNemBtn"'), 'Must not include #toggleAllNemBtn Expand/Collapse All button');
  assert.ok(!rosterHtml.includes('toggleAllNemesisCards'), 'Must not include toggleAllNemesisCards handler');

  // Verify all 3 active nemeses are rendered as collapsible <details> windows
  const detailsMatches = rosterHtml.match(/<details\s+class="datasheet-card nemesis-card"/g) || [];
  assert.equal(detailsMatches.length, 3, 'Must render 3 collapsible <details class="datasheet-card nemesis-card"> windows');

  // Verify all 3 share the unified rule-tag header pattern (NEMESIS #01, NEMESIS #02, NEMESIS #03)
  assert.ok(rosterHtml.includes('NEMESIS #01 • SESSION 0 INDUCTION (PL 4)'), 'Must include NEMESIS #01 rule-tag');
  assert.ok(rosterHtml.includes('NEMESIS #02 • SESSION 0 INDUCTION (PL 3)'), 'Must include NEMESIS #02 rule-tag');
  assert.ok(rosterHtml.includes('NEMESIS #03 • ROGUE SECTOR APEX NEMESIS (PL 4)'), 'Must include NEMESIS #03 rule-tag');

  // Verify all 3 use the unified .locked-status-select dropdown (#nemStatus1, #nemStatus2, #nemStatus3)
  assert.match(rosterHtml, /<select\s+id="nemStatus1"\s+class="locked-status-select"/);
  assert.match(rosterHtml, /<select\s+id="nemStatus2"\s+class="locked-status-select"/);
  assert.match(rosterHtml, /<select\s+id="nemStatus3"\s+class="locked-status-select"/);

  // Verify Nemesis 3: C'tan Shard of the Void Dragon content and placement after Aestred Thurga
  const thurgaIdx = rosterHtml.indexOf('Aestred Thurga');
  const voidDragonIdx = rosterHtml.indexOf("C'tan Shard of the Void Dragon");
  assert.ok(thurgaIdx > -1, 'Must include Aestred Thurga card');
  assert.ok(voidDragonIdx > thurgaIdx, "C'tan Shard of the Void Dragon card must appear after Aestred Thurga's card");

  assert.ok(rosterHtml.includes('"The World-Eater of the Iron-Oxide Wastes"'), 'Must include Void Dragon title');
  assert.ok(rosterHtml.includes('Faction: Xenos / Necrons (Hypercrypt Phalanx)'), 'Must include unified Faction subtitle for Void Dragon');
  assert.ok(rosterHtml.includes('Tesseract Arc-Discharge'), 'Must include Void Dragon Boss Battle Trait');
  assert.ok(rosterHtml.includes('🎯 Bounty Payout: +3 XP to killer unit &amp; +1 Strategic Point'), 'Must include Bounty Payout');
});

test('roster: uses valid Supabase publishable anon key, aligns #cloudSyncBadge with .status-pill, and manual pull populates inputs & shows notice', async () => {
  assert.ok(
    rosterHtml.includes('sb_publishable_R3wXKsK7Gl54-8BNCauUNg_NIoosOOO'),
    'pages/roster.html must configure the valid Supabase publishable key'
  );
  assert.ok(
    !rosterHtml.includes('fc9652398N1BP1126h1-t0h22H2y519a119918b500'),
    'pages/roster.html must not contain the invalid placeholder JWT key'
  );

  // Verify hero header aligns status-pill and cloudSyncBadge on the same centered row without vertical offset
  assert.match(
    rosterHtml,
    /justify-content:\s*center;\s*align-items:\s*center;[^>]*>[\s\S]*?class="status-pill"\s+style="margin:0;"[\s\S]*?id="cloudSyncBadge"/,
    'Hero header must center and align .status-pill (margin:0) and #cloudSyncBadge on the same row'
  );

  // Test manual click on "Pull Latest from Cloud": pullSharedPoolsFromCloud(true)
  enableCloudMock = true;
  mockElements.shelfSaveNotice.classList.add('hidden');
  mockElements.bracketFactionPicker.value = 'Space Marines';

  const ok = await roster.pullSharedPoolsFromCloud(true);
  assert.equal(ok, true);
  assert.equal(
    mockElements.shelfSaveNotice.classList.contains('hidden'),
    false,
    'Manual pullSharedPoolsFromCloud(true) must un-hide #shelfSaveNotice for visual confirmation'
  );
  assert.ok(mockElements.cloudSyncBadge.textContent.includes('Cloud Pool Synced'));
  enableCloudMock = false;
});

test('roster: resetNemesisDossierForm resets all Nemesis Induction Dossier form fields and preview to clean defaults', () => {
  assert.ok(
    rosterHtml.includes('resetNemesisDossierForm()'),
    'pages/roster.html must include a button calling resetNemesisDossierForm()'
  );
  assert.equal(typeof roster.resetNemesisDossierForm, 'function', 'resetNemesisDossierForm must be defined');

  mockElements.nemReportChannel.value = 'beta';
  mockElements.nemReportSector.value = 'Mode 3: Rogue Sector Auxiliary Clash';
  mockElements.nemReportUnit.value = 'World Eaters — Eightbound';
  mockElements.nemReportFeat.value = 'Epic cinematic moment / Unbelievable dice streak';
  mockElements.nemReportNotes.value = 'Custom nemesis combat notes.';

  roster.resetNemesisDossierForm();

  assert.equal(mockElements.nemReportChannel.value, 'alpha');
  assert.equal(mockElements.nemReportSector.value, 'Mode 1: Horde Breach // Node 0 (Golgotha Arbor-Basin)');
  assert.equal(mockElements.nemReportUnit.value, '');
  assert.equal(mockElements.nemReportFeat.value, 'Slain a Player Warlord / Character in combat');
  assert.equal(mockElements.nemReportNotes.value, '');
  assert.ok(mockElements.nemDossierPreview.textContent.includes('THE EXILE // SANCTUARY OF ASH'));
  assert.ok(mockElements.nemDossierPreview.textContent.includes('[Unspecified Hostile Entity]'));
  assert.equal(mockElements.nemDossierPreview.textContent.includes('Eightbound'), false);
});
