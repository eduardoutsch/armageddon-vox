# 📦 Fires of Armageddon // Bundle: UI Tests (Astropathic Vox-Terminal Part 1)

Astropathic Vox CRT terminal, teletype audio streaming, and pass-seal security test suite (`tests/ui/vox.test.js` lines 1 to 550).

## 📑 Table of Contents
- [tests/ui/vox.test.js (Part 1: Auth, Seals & Transmission Tests, Lines 1-550)](#file-testsuivoxtestjspart1authsealstransmissiontestslines1550)

---

## File: `tests/ui/vox.test.js (Part 1: Auth, Seals & Transmission Tests, Lines 1-550)` <a id="file-testsuivoxtestjspart1authsealstransmissiontestslines1550"></a>

````javascript
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '../../');
const VOX_HTML_PATH = path.join(ROOT_DIR, 'pages/vox.html');
const VOX_JS_PATH = path.join(ROOT_DIR, 'js/vox.js');
const VOX_CSS_PATH = path.join(ROOT_DIR, 'css/vox.css');

// Read vox.html and modular script/styles
const voxHtml = fs.readFileSync(VOX_HTML_PATH, 'utf8');
const voxCss = fs.existsSync(VOX_CSS_PATH) ? fs.readFileSync(VOX_CSS_PATH, 'utf8') : '';
const scriptMatches = voxHtml.match(/<script>([\s\S]*?)<\/script>/);
const voxScriptCode = (scriptMatches && scriptMatches[1])
  ? scriptMatches[1]
  : (fs.existsSync(VOX_JS_PATH) ? fs.readFileSync(VOX_JS_PATH, 'utf8') : '');
assert.ok(voxScriptCode, 'Must locate script code inside pages/vox.html or js/vox.js');

// Set up mock DOM, localStorage, and sessionStorage environment
const sessionStore = new Map();
const mockSessionStorage = {
  getItem: (k) => (sessionStore.has(k) ? sessionStore.get(k) : null),
  setItem: (k, v) => sessionStore.set(k, String(v)),
  removeItem: (k) => sessionStore.delete(k),
  clear: () => sessionStore.clear()
};

const localStore = new Map();
const mockLocalStorage = {
  getItem: (k) => (localStore.has(k) ? localStore.get(k) : null),
  setItem: (k, v) => localStore.set(k, String(v)),
  removeItem: (k) => localStore.delete(k),
  clear: () => localStore.clear()
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

function createMockBox() {
  const box = {
    classList: createMockClassList(),
    _innerHTML: '',
    children: [],
    dataset: {},
    scrollTop: 0,
    scrollHeight: 100,
    get innerHTML() { return this._innerHTML; },
    set innerHTML(v) {
      this._innerHTML = v;
      if (v === '') this.children = [];
    },
    appendChild: (c) => { box.children.push(c); return c; }
  };
  return box;
}

const mockElements = {
  authScreen: { classList: createMockClassList() },
  terminalScreen: { classList: createMockClassList() },
  sealStatusBadge: { innerHTML: '', textContent: '' },
  sealSubtitle: { innerHTML: '', textContent: '' },
  passLabel: { textContent: '' },
  sealActionBtn: { textContent: '' },
  cardAlpha: { classList: createMockClassList() },
  cardBeta: { classList: createMockClassList() },
  cardGamma: { classList: createMockClassList() },
  passInput: { value: '' },
  authErrorMsg: { textContent: '', classList: createMockClassList() },
  activeConduitLabel: { textContent: '' },
  pendingDossierNotice: { classList: createMockClassList() },
  subWinDirect: { classList: createMockClassList() },
  subWinInterferences: { classList: createMockClassList() },
  winBtn1: { classList: createMockClassList() },
  winBtn2: { classList: createMockClassList() },
  directMessagesBox: createMockBox(),
  interferencesBox: createMockBox(),
  interferenceCountBadge: { textContent: '' },
  questionInput: { value: '' },
  serverStatusBadge: { innerHTML: '', textContent: '', classList: createMockClassList() },
  terminalServerStatusLabel: { textContent: '', style: {} },
  voxTerminalTitle: { textContent: '', style: {} }
};

const mockDocument = {
  body: {
    dataset: {},
    classList: createMockClassList()
  },
  getElementById: (id) => mockElements[id] || null,
  createElement: (tag) => {
    let _text = '';
    const el = {
      tagName: tag.toUpperCase(),
      className: '',
      style: {},
      dataset: {},
      get textContent() { return _text; },
      set textContent(v) { _text = v; this.innerHTML = v; },
      innerHTML: '',
      children: [],
      classList: createMockClassList(),
      appendChild: (c) => { el.children.push(c); return c; },
      querySelector: (sel) => {
        const dummy = {
          tagName: 'DIV',
          className: sel.replace('.', ''),
          style: {},
          dataset: {},
          textContent: '',
          innerHTML: '',
          appendChild: () => ({}),
          closest: () => ({ scrollTop: 0, scrollHeight: 100 })
        };
        el.children.push(dummy);
        return dummy;
      },
      closest: () => ({ scrollTop: 0, scrollHeight: 100 })
    };
    return el;
  }
};

let tickEvents = [];
let stampPlayed = false;

const mockWindow = {
  addEventListener: () => {},
  VoxAudio: {
    playTeletypeTick: (mode) => tickEvents.push(mode),
    playDossierStamp: () => { stampPlayed = true; },
    playScarHazard: () => {}
  }
};

// RPC mock results
const rpcCalls = [];
let mockMessages = [];
let mockInterferences = [];
let mockServerHeartbeat = { status: 'online', updatedAt: Date.now() };
let mockRpcHandler = async (fnName, params) => {
  rpcCalls.push({ fnName, params });
  if (fnName === 'check_channel_seal') return true;
  if (fnName === 'unlock_or_seal_channel') return { ok: true };
  if (fnName === 'send_vox_message') return { ok: true };
  if (fnName === 'delete_vox_entry') return { ok: true };
  if (fnName === 'get_vox_terminal_data') return { ok: true, messages: mockMessages, interferences: mockInterferences };
  if (fnName === 'get_shared_spawn_pools') {
    return {
      ok: true,
      horde_pool: {},
      nemesis_status: {
        vox_server_heartbeat: mockServerHeartbeat
      }
    };
  }
  return null;
};

// Evaluate script in mock environment
const evalFn = new Function(
  'document',
  'window',
  'sessionStorage',
  'localStorage',
  'fetch',
  'console',
  'setInterval',
  'clearInterval',
  'setTimeout',
  `${voxScriptCode}; return {
    validChannels,
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    SEEN_IDS_STORAGE_KEY,
    SESSION_AUTH_KEY,
    checkPendingDossierBuffer,
    selectConduit,
    handleSealAction,
    flushPendingDossierIfAny,
    streamTextIntoElement,
    formatRedactedHtml,
    switchSubWindow,
    extractDynamicReplyCardMeta,
    formatTime,
    purgeVoxEntry,
    transmitQuestion,
    refreshTerminal,
    toggleOlderMessages,
    toggleOlderInterferences,
    lockTerminal,
    initVoxTerminalPage,
    getSelectedChannel: () => selectedChannel,
    getActivePassphrase: () => activePassphrase,
    getShowAllOlderMessages: () => showAllOlderMessages,
    getShowAllOlderInterferences: () => showAllOlderInterferences,
    isRogueSectorInterference: (typeof isRogueSectorInterference === 'function' ? isRogueSectorInterference : null),
    applyVoxFactionTheme: (typeof applyVoxFactionTheme === 'function' ? applyVoxFactionTheme : null),
    isVoxServerOnline: (typeof isVoxServerOnline === 'function' ? isVoxServerOnline : null),
    checkVoxServerStatus: (typeof checkVoxServerStatus === 'function' ? checkVoxServerStatus : null),
    syncSeenTokensFromStorage: (typeof syncSeenTokensFromStorage === 'function' ? syncSeenTokensFromStorage : null),
    getSeenTokens: () => seenTokens
  };`
);

const vox = evalFn(
  mockDocument,
  mockWindow,
  mockSessionStorage,
  mockLocalStorage,
  async (url, opts) => {
    const parts = url.split('/rpc/');
    const fnName = parts[1];
    const params = opts && opts.body ? JSON.parse(opts.body) : {};
    const res = await mockRpcHandler(fnName, params);
    return {
      ok: true,
      json: async () => res
    };
  },
  console,
  (fn, ms) => 1234,
  (id) => {},
  (fn, ms) => 5678
);

test('vox: checkPendingDossierBuffer detects pending dossier payload from sessionStorage', () => {
  sessionStore.clear();
  assert.equal(vox.checkPendingDossierBuffer(), null);
  assert.equal(mockElements.pendingDossierNotice.classList.contains('hidden'), true);

  const payload = {
    channel: 'beta',
    text: '+++ ORDO MALLEUS DOSSIER TRANSMISSION +++',
    queuedAt: Date.now()
  };
  sessionStore.set('foa_pending_vox_payload', JSON.stringify(payload));

  const detected = vox.checkPendingDossierBuffer();
  assert.ok(detected, 'Must detect pending dossier from sessionStorage');
  assert.equal(detected.channel, 'beta');
  assert.equal(detected.text, payload.text);
  assert.equal(mockElements.pendingDossierNotice.classList.contains('hidden'), false);
});

test('vox: checkPendingDossierBuffer formats target description for distant intercept payload', () => {
  sessionStore.clear();
  const payload = {
    channel: 'distant',
    text: '+++ ORBITAL AUGUR ARRAY // DISTANT WARP-BREACH ADVERSARY DETECTED +++',
    queuedAt: Date.now()
  };
  sessionStore.set('foa_pending_vox_payload', JSON.stringify(payload));

  const detected = vox.checkPendingDossierBuffer();
  assert.ok(detected, 'Must detect pending distant intercept dossier');
  assert.equal(detected.channel, 'distant');
  assert.ok(mockElements.pendingDossierNotice.innerHTML.includes('Distant Intercept // Orbital Augur Array'));
  assert.ok(mockElements.pendingDossierNotice.innerHTML.includes('Neither Main Player Fielded'));
});

test('vox: selectConduit toggles selected channel and updates UI elements', async () => {
  await vox.selectConduit('beta');
  assert.equal(vox.getSelectedChannel(), 'beta');
  assert.equal(mockElements.cardBeta.classList.contains('selected'), true);
  assert.equal(mockElements.cardAlpha.classList.contains('selected'), false);

  await vox.selectConduit('gamma');
  assert.equal(vox.getSelectedChannel(), 'gamma');
  assert.equal(mockElements.cardGamma.classList.contains('selected'), true);
  assert.equal(mockElements.cardGamma.classList.contains('active'), true);
  assert.equal(mockElements.cardAlpha.classList.contains('selected'), false);
  assert.equal(mockElements.cardBeta.classList.contains('selected'), false);
  assert.ok(mockElements.sealSubtitle.textContent.includes('Kâhl Hârkyn // The Ledger of Embers'));
  assert.equal(mockElements.voxTerminalTitle.textContent, '+++ FANE-NODE VÔL-09 ("THE DEAF EAR") // SUB-THERMOSPHERIC BLACK-LEDGER TERMINAL +++');

  await vox.selectConduit('alpha');
  assert.equal(vox.getSelectedChannel(), 'alpha');
  assert.equal(mockElements.cardAlpha.classList.contains('selected'), true);
  assert.equal(mockElements.cardBeta.classList.contains('selected'), false);
  assert.equal(mockElements.cardGamma.classList.contains('selected'), false);
});

test('vox: selectConduit and handleSealAction unlock Terminal Gamma for Kâhl Hârkyn and activate Votann theme', async () => {
  await vox.selectConduit('gamma');
  assert.equal(vox.getSelectedChannel(), 'gamma');
  assert.equal(mockDocument.body.classList.contains('theme-votann'), true, 'Selecting Terminal Gamma must activate theme-votann');
  assert.equal(mockDocument.body.classList.contains('theme-necron'), false);
  assert.equal(mockElements.interferencesBox.classList.contains('vox-preview-gamma'), false, 'Interferences box must not be clobbered by vox-preview-gamma');

  mockElements.passInput.value = 'votanngold777';
  await vox.handleSealAction();
  assert.equal(mockDocument.body.classList.contains('theme-votann'), true, 'Unlocking Terminal Gamma must keep theme-votann');
  assert.ok(
    mockElements.activeConduitLabel.textContent.includes('CONDUIT GAMMA') ||
    mockElements.activeConduitLabel.textContent.includes('FANE-NODE VÔL-09')
  );
  assert.ok(
    mockElements.questionInput.placeholder.includes('Fane-Node Vôl-09') ||
    mockElements.questionInput.placeholder.includes('Brôkhyr')
  );

  // CSS assertions for Votann theme
  assert.ok(voxHtml.includes('body.theme-votann .crt-monitor-frame') || voxCss.includes('body.theme-votann .crt-monitor-frame'), 'vox.html or vox.css must style .crt-monitor-frame in Votann Black-Ledger mode');
  assert.ok(voxHtml.includes('body.theme-votann .crt-msg-card') || voxCss.includes('body.theme-votann .crt-msg-card'), 'vox.html or vox.css must style .crt-msg-card in Votann Black-Ledger mode');
  assert.ok(voxHtml.includes('body.theme-votann .crt-reply-card') || voxCss.includes('body.theme-votann .crt-reply-card'), 'vox.html or vox.css must style .crt-reply-card in Votann Black-Ledger mode');
  assert.ok(voxHtml.includes('body.theme-votann .crt-input-textarea') || voxCss.includes('body.theme-votann .crt-input-textarea'), 'vox.html or vox.css must style .crt-input-textarea in Votann Black-Ledger mode');
});

test('vox: checkPendingDossierBuffer formats target description for gamma Votann payload', () => {
  sessionStore.clear();
  const payload = {
    channel: 'gamma',
    text: '+++ THE LEDGER OF EMBERS // KINDRED DISPATCH +++',
    queuedAt: Date.now()
  };
  sessionStore.set('foa_pending_vox_payload', JSON.stringify(payload));
  const detected = vox.checkPendingDossierBuffer();
  assert.ok(detected);
  assert.equal(detected.channel, 'gamma');
  assert.ok(mockElements.pendingDossierNotice.innerHTML.includes('Kâhl Hârkyn // The Ledger of Embers (Terminal Gamma)'));
});

test('vox: flushPendingDossierIfAny routes gamma channel transmission with Kâhl Hârkyn sender', async () => {
  sessionStore.clear();
  rpcCalls.length = 0;
  await vox.selectConduit('gamma');
  mockElements.passInput.value = 'votanngold777';
  await vox.handleSealAction();

  const payload = {
    channel: 'gamma',
    text: '+++ OATHBAND ROSTER // 1200 PTS DEPLOYED +++',
    queuedAt: Date.now()
  };
  sessionStore.set('foa_pending_vox_payload', JSON.stringify(payload));

  await vox.flushPendingDossierIfAny();

  const sendCall = rpcCalls.find(c => c.fnName === 'send_vox_message' && c.params.p_channel === 'gamma');
  assert.ok(sendCall, 'Must call send_vox_message on gamma channel');
  assert.equal(sendCall.params.p_sender, 'Kâhl Hârkyn // The Ledger of Embers');
  assert.equal(sendCall.params.p_question, payload.text);

  // Reset to alpha channel so downstream tests start in expected baseline state
  await vox.selectConduit('alpha');
  mockElements.passInput.value = 'krieg44';
  await vox.handleSealAction();
});

test('vox.html defines #cardGamma for Kâhl Hârkyn in conduit selector and maintains valid shell containment', () => {
  assert.ok(voxHtml.includes('id="cardGamma"'), 'pages/vox.html must include #cardGamma');
  assert.ok(voxHtml.includes("selectConduit('gamma')"), 'pages/vox.html #cardGamma must invoke selectConduit(\'gamma\')');
  assert.ok(voxHtml.includes('Kâhl Hârkyn'), 'pages/vox.html must reference Kâhl Hârkyn');
  assert.ok(!voxHtml.includes('Kâhl Hârkyn Grîmledger'), 'pages/vox.html must NOT reference Grîmledger');
  assert.ok(voxHtml.includes('The Ledger of Embers'), 'pages/vox.html must reference The Ledger of Embers');

  // Verify DOM nesting: authScreen and terminalScreen must both be inside vox-shell
  const shellStart = voxHtml.indexOf('class="app-shell vox-shell"');
  assert.ok(shellStart !== -1, 'Must have .app-shell.vox-shell container');
  const authIdx = voxHtml.indexOf('id="authScreen"', shellStart);
  const termIdx = voxHtml.indexOf('id="terminalScreen"', authIdx);
  const scriptIdx = voxHtml.indexOf('<script src="../js/vox-audio.js">', termIdx);
  const closingDivIdx = voxHtml.lastIndexOf('</div>', scriptIdx);
  assert.ok(authIdx !== -1, '#authScreen must be inside vox-shell');
  assert.ok(termIdx !== -1, '#terminalScreen must be inside vox-shell after authScreen');
  assert.ok(closingDivIdx > termIdx, '#terminalScreen must reside inside .app-shell.vox-shell prior to closing script tag');


  // Verify authScreen contains passInput and sealActionBtn (not cut off by extra closing div)
  const authEnd = voxHtml.indexOf('id="terminalScreen"');
  const passIdx = voxHtml.indexOf('id="passInput"');
  const btnIdx = voxHtml.indexOf('id="sealActionBtn"');
  assert.ok(passIdx > authIdx && passIdx < authEnd, '#passInput must reside inside #authScreen');
  assert.ok(btnIdx > authIdx && btnIdx < authEnd, '#sealActionBtn must reside inside #authScreen');
});


test('vox: switchSubWindow toggles Direct vs Interferences monitors', () => {
  vox.switchSubWindow('interferences');
  assert.equal(mockElements.subWinDirect.classList.contains('hidden'), true);
  assert.equal(mockElements.subWinInterferences.classList.contains('hidden'), false);
  assert.equal(mockElements.winBtn2.classList.contains('active'), true);
  assert.equal(mockElements.winBtn1.classList.contains('active'), false);

  vox.switchSubWindow('direct');
  assert.equal(mockElements.subWinDirect.classList.contains('hidden'), false);
  assert.equal(mockElements.subWinInterferences.classList.contains('hidden'), true);
  assert.equal(mockElements.winBtn1.classList.contains('active'), true);
  assert.equal(mockElements.winBtn2.classList.contains('active'), false);
});

test('vox: formatRedactedHtml replaces [REDACTED] with styled censor-bar', () => {
  const input = 'Hostile intercepted near [REDACTED] hive node.';
  const output = vox.formatRedactedHtml(input);
  assert.ok(output.includes('<span class="censor-bar">▓▓REDACTED▓▓</span>'));
  assert.ok(!output.includes('[REDACTED]'));
});

test('vox: handleSealAction validates passphrase, authenticates, and unlocks terminal', async () => {
  mockElements.passInput.value = 'ab'; // Too short
  await vox.handleSealAction();
  assert.equal(mockElements.authErrorMsg.textContent, 'Passphrase must be at least 3 characters.');
  assert.equal(mockElements.authErrorMsg.classList.contains('hidden'), false);

  // Valid passphrase
  mockElements.passInput.value = 'VermilionKey99';
  await vox.handleSealAction();

  assert.equal(vox.getActivePassphrase(), 'VermilionKey99');
  assert.equal(mockElements.authScreen.classList.contains('hidden'), true);
  assert.equal(mockElements.terminalScreen.classList.contains('hidden'), false);

  const storedAuth = sessionStore.get(vox.SESSION_AUTH_KEY);
  assert.ok(storedAuth, 'Must store active session in sessionStorage');
  assert.equal(JSON.parse(storedAuth).pass, 'VermilionKey99');
});

test('vox: flushPendingDossierIfAny transmits queued payload and clears sessionStorage buffer', async () => {
  sessionStore.clear();
  const testPayload = {
    channel: 'alpha',
    text: '+++ COMPILER TRANSMISSION TO CAMPAIGN MASTER +++',
    queuedAt: Date.now()
  };
  sessionStore.set('foa_pending_vox_payload', JSON.stringify(testPayload));

  rpcCalls.length = 0;
  await vox.flushPendingDossierIfAny();

  assert.equal(sessionStore.has('foa_pending_vox_payload'), false, 'Must clear pending payload buffer');
  const sendCall = rpcCalls.find(c => c.fnName === 'send_vox_message');
  assert.ok(sendCall, 'Must invoke send_vox_message RPC endpoint');
  assert.equal(sendCall.params.p_channel, 'alpha');
  assert.equal(sendCall.params.p_question, testPayload.text);
});

test('vox: flushPendingDossierIfAny routes distant intercept with Orbital Augur Array sender', async () => {
  mockElements.passInput.value = 'VermilionKey99';
  await vox.handleSealAction();

  const testPayload = {
    channel: 'distant',
    text: '+++ ORBITAL AUGUR ARRAY // DISTANT WARP-BREACH ADVERSARY DETECTED +++\n• THEATRE & SENSOR SWEEP: Distant Sector Grid 2',
    queuedAt: Date.now()
  };
  sessionStore.set('foa_pending_vox_payload', JSON.stringify(testPayload));

  rpcCalls.length = 0;
  await vox.flushPendingDossierIfAny();

  assert.equal(sessionStore.has('foa_pending_vox_payload'), false, 'Must clear pending payload buffer');
  const sendCall = rpcCalls.find(c => c.fnName === 'send_vox_message');
  assert.ok(sendCall, 'Must invoke send_vox_message RPC endpoint');
  assert.equal(sendCall.params.p_sender, '🛰️ Orbital Augur Array // Distant Intercept');
  assert.ok(sendCall.params.p_question.includes('DISTANT WARP-BREACH ADVERSARY DETECTED'));
});

test('vox: lockTerminal clears passphrase and hides terminal screen', () => {
  vox.lockTerminal();
  assert.equal(vox.getActivePassphrase(), null);
  assert.equal(sessionStore.has(vox.SESSION_AUTH_KEY), false);
  assert.equal(mockElements.terminalScreen.classList.contains('hidden'), true);
  assert.equal(mockElements.authScreen.classList.contains('hidden'), false);
  assert.equal(vox.getShowAllOlderMessages(), false, 'Must reset showAllOlderMessages on lock');
});

test('vox: refreshTerminal shows only past 3 messages by default and toggles older messages on demand', async () => {
  // Authenticate first
  mockElements.passInput.value = 'VermilionKey99';
  await vox.handleSealAction();

  // Populate 5 mock messages
  mockMessages = [
    { id: 'm1', channel: 'alpha', sender: 'The Exile', question: 'Q1', reply: 'A1', status: 'answered' },
    { id: 'm2', channel: 'alpha', sender: 'The Exile', question: 'Q2', reply: 'A2', status: 'answered' },
    { id: 'm3', channel: 'alpha', sender: 'The Exile', question: 'Q3', reply: 'A3', status: 'answered' },
    { id: 'm4', channel: 'alpha', sender: 'The Exile', question: 'Q4', reply: 'A4', status: 'answered' },
    { id: 'm5', channel: 'alpha', sender: 'The Exile', question: 'Q5', reply: 'A5', status: 'answered' }
  ];

  // Refresh terminal with default settings
  await vox.refreshTerminal(false);

  // When more than 3 messages exist, children should include the toggle bar + 3 exchange wraps
  assert.equal(vox.getShowAllOlderMessages(), false);
  assert.equal(mockElements.directMessagesBox.children.length, 4, 'Must have 1 toggle bar + 3 message wraps');

  // Verify the toggle button text
  const toggleBar = mockElements.directMessagesBox.children[0];
  assert.ok(toggleBar.className.includes('crt-older-bar'));
  const olderBtn = toggleBar.children[0];
  assert.ok(olderBtn.textContent.includes('See Older Messages (2 older)'));

  // Toggle to expand all messages
  vox.toggleOlderMessages();
  await vox.refreshTerminal(false);

  assert.equal(vox.getShowAllOlderMessages(), true);
  // Now all 5 messages plus the toggle bar should be rendered (1 + 5 = 6)
  assert.equal(mockElements.directMessagesBox.children.length, 6, 'Must render all 5 messages + toggle bar');
  const expandedToggleBar = mockElements.directMessagesBox.children[0];
  assert.ok(expandedToggleBar.children[0].textContent.includes('Collapse to Recent 3 Messages'));

  // Toggle back to collapse
  vox.toggleOlderMessages();
  await vox.refreshTerminal(false);

  assert.equal(vox.getShowAllOlderMessages(), false);
  assert.equal(mockElements.directMessagesBox.children.length, 4, 'Must collapse back to 3 messages + toggle bar');
  const collapsedToggleBar = mockElements.directMessagesBox.children[0];
  assert.ok(collapsedToggleBar.children[0].textContent.includes('See Older Messages (2 older)'));
});

test('vox: refreshTerminal hides old interferences by default and toggles on demand', async () => {
  // Authenticate first
  mockElements.passInput.value = 'VermilionKey99';
  await vox.handleSealAction();

  // Populate 5 mock interferences
  mockInterferences = [
    { id: 'int1', origin_hint: 'SECTOR-1', redacted_text: 'Fragment [REDACTED] alpha', created_at: Date.now() - 50000 },
    { id: 'int2', origin_hint: 'SECTOR-2', redacted_text: 'Fragment [REDACTED] beta', created_at: Date.now() - 40000 },
    { id: 'int3 =', origin_hint: 'SECTOR-3', redacted_text: 'Fragment [REDACTED] gamma', created_at: Date.now() - 30000 },
    { id: 'int4', origin_hint: 'SECTOR-4', redacted_text: 'Fragment [REDACTED] delta', created_at: Date.now() - 20000 },
    { id: 'int5', origin_hint: 'SECTOR-5', redacted_text: 'Fragment [REDACTED] epsilon', created_at: Date.now() - 10000 }
  ];

  await vox.refreshTerminal(false);

  // When > 3 interferences exist, should have 1 toggle bar + 3 visible cards
  assert.equal(vox.getShowAllOlderInterferences(), false);
  assert.equal(mockElements.interferencesBox.children.length, 4, 'Must render 1 toggle bar + 3 most recent interferences');

````
