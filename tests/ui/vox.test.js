const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '../../');
const VOX_HTML_PATH = path.join(ROOT_DIR, 'pages/vox.html');

// Read vox.html and extract script block
const voxHtml = fs.readFileSync(VOX_HTML_PATH, 'utf8');
const scriptMatches = voxHtml.match(/<script>([\s\S]*?)<\/script>/);
assert.ok(scriptMatches && scriptMatches[1], 'Must locate script tag inside pages/vox.html');
const voxScriptCode = scriptMatches[1];

// Set up mock DOM and sessionStorage environment
const sessionStore = new Map();
const mockSessionStorage = {
  getItem: (k) => (sessionStore.has(k) ? sessionStore.get(k) : null),
  setItem: (k, v) => sessionStore.set(k, String(v)),
  removeItem: (k) => sessionStore.delete(k),
  clear: () => sessionStore.clear()
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
  terminalServerStatusLabel: { textContent: '', style: {} }
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
  'fetch',
  'console',
  'setInterval',
  'clearInterval',
  'setTimeout',
  `${voxScriptCode}; return {
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
    isVoxServerOnline: (typeof isVoxServerOnline === 'function' ? isVoxServerOnline : null),
    checkVoxServerStatus: (typeof checkVoxServerStatus === 'function' ? checkVoxServerStatus : null)
  };`
);

const vox = evalFn(
  mockDocument,
  mockWindow,
  mockSessionStorage,
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

  await vox.selectConduit('alpha');
  assert.equal(vox.getSelectedChannel(), 'alpha');
  assert.equal(mockElements.cardAlpha.classList.contains('selected'), true);
  assert.equal(mockElements.cardBeta.classList.contains('selected'), false);
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

  const intToggleBar = mockElements.interferencesBox.children[0];
  assert.ok(intToggleBar.className.includes('crt-older-bar'));
  assert.ok(intToggleBar.children[0].textContent.includes('See Older Interferences (2 older)'));

  // Toggle to expand all
  vox.toggleOlderInterferences();
  await vox.refreshTerminal(false);

  assert.equal(vox.getShowAllOlderInterferences(), true);
  assert.equal(mockElements.interferencesBox.children.length, 6, 'Must render all 5 interferences + toggle bar');
  const expandedBar = mockElements.interferencesBox.children[0];
  assert.ok(expandedBar.children[0].textContent.includes('Collapse to Recent 3 Psychic Bleeds'));

  // Toggle back to collapse / hide old interferences
  vox.toggleOlderInterferences();
  await vox.refreshTerminal(false);

  assert.equal(vox.getShowAllOlderInterferences(), false);
  assert.equal(mockElements.interferencesBox.children.length, 4, 'Must collapse back to 3 interferences + toggle bar');
});

test('vox: extractDynamicReplyCardMeta parses explicit titles, banner headers, mid-text keywords, and fallbacks', () => {
  const fallback = '++ CAMPAIGN MASTER // SEGMENTUM SOLAR COMMAND ++';

  // 1. Null / undefined / empty
  assert.deepEqual(vox.extractDynamicReplyCardMeta(null), { cardTitle: fallback, cleanBody: '' });
  assert.deepEqual(vox.extractDynamicReplyCardMeta(''), { cardTitle: fallback, cleanBody: '' });

  // 2. Explicit [CARD_TITLE: ...]
  const explicitRes = vox.extractDynamicReplyCardMeta('[CARD_TITLE: Logis-Prefect Vane]\n+++ HULL INTEGRITY: 100% +++');
  assert.equal(explicitRes.cardTitle, '++ LOGIS-PREFECT VANE ++');
  assert.equal(explicitRes.cleanBody, '+++ HULL INTEGRITY: 100% +++');

  // 3. Canonical +++ BANNER +++ on first line
  const bannerRes = vox.extractDynamicReplyCardMeta('+++ ASTROPATHIC CONDUIT: HIGH COMMAND +++\n\nRouting verified. State query.');
  assert.equal(bannerRes.cardTitle, '++ ASTROPATHIC CONDUIT: HIGH COMMAND ++');
  assert.equal(bannerRes.cleanBody, 'Routing verified. State query.');

  // 4. Canonical ++ BANNER ++ on first line
  const doublePlusRes = vox.extractDynamicReplyCardMeta('++ COGITATOR DECK-44 ++\n\nSystems operational.');
  assert.equal(doublePlusRes.cardTitle, '++ COGITATOR DECK-44 ++');
  assert.equal(doublePlusRes.cleanBody, 'Systems operational.');

  // 5. Mid-text fallback inference for Ashen Spirit / MU-TH-UR / Deck 44
  const midTextRes = vox.extractDynamicReplyCardMeta('The Ashen Spirit stirs beneath the bulkheads...');
  assert.equal(midTextRes.cardTitle, '++ ASHEN SPIRIT LOGIC CORE // DECK 44 COGITATOR ++');
  assert.equal(midTextRes.cleanBody, 'The Ashen Spirit stirs beneath the bulkheads...');

  // 6. Generic prose without banners
  const genericRes = vox.extractDynamicReplyCardMeta('Standard battlefield communique received.');
  assert.equal(genericRes.cardTitle, fallback);
  assert.equal(genericRes.cleanBody, 'Standard battlefield communique received.');
});

test('vox: refreshTerminal uses dynamic reply card title and avoids duplicating banner in body', async () => {
  mockElements.passInput.value = 'VermilionKey99';
  await vox.handleSealAction();

  mockMessages = [
    {
      id: 'm_dyn_1',
      channel: 'alpha',
      sender: 'The Exile',
      question: 'Status report',
      reply: '+++ ORBITAL LOGIS SCAN +++\nPerimeter is secure across Sector 0.',
      status: 'answered'
    }
  ];

  await vox.refreshTerminal(false);
  // Reset signature and refresh so seenToken causes immediate synchronous textContent assignment
  mockElements.directMessagesBox.dataset.sig = '';
  await vox.refreshTerminal(false);

  // Exchange wrap contains 1 player card + 1 reply card
  const exchangeWrap = mockElements.directMessagesBox.children[0];
  assert.equal(exchangeWrap.children.length, 2);

  const replyCard = exchangeWrap.children[1];
  assert.ok(replyCard.className.includes('crt-reply-card'));
  assert.ok(replyCard.innerHTML.includes('++ ORBITAL LOGIS SCAN ++'), 'Must render extracted dynamic title');
  assert.ok(!replyCard.innerHTML.includes('SEGMENTUM SOLAR COMMAND'), 'Must not use fallback title when banner is present');

  const rBody = replyCard.children[0];
  assert.ok(rBody.textContent.includes('Perimeter is secure across Sector 0.'));
  assert.ok(!rBody.textContent.includes('+++ ORBITAL LOGIS SCAN +++'), 'Must strip first header banner line from clean body');
});

test('vox: cards render [ ✕ PURGE ] button in meta bar for direct messages, replies, and interferences', async () => {
  mockElements.passInput.value = 'VermilionKey99';
  await vox.handleSealAction();

  mockMessages = [
    {
      id: 'm_purge_1',
      channel: 'alpha',
      sender: 'The Exile',
      question: 'Testing purge button visibility',
      reply: '+++ HIGH COMMAND +++\nOrders acknowledged.',
      status: 'answered',
      created_at: '2026-10-22T10:00:00Z',
      answered_at: '2026-10-22T10:01:00Z'
    }
  ];

  mockInterferences = [
    {
      id: 'int_purge_1',
      target_channel: 'alpha',
      origin_hint: 'RIVAL PSYCHIC ECHO',
      redacted_text: 'Secret warband moving toward [REDACTED]',
      created_at: '2026-10-22T10:05:00Z'
    }
  ];

  mockElements.directMessagesBox.dataset.sig = '';
  mockElements.interferencesBox.dataset.sig = '';
  await vox.refreshTerminal(false);

  const exchangeWrap = mockElements.directMessagesBox.children[0];
  assert.ok(exchangeWrap, 'Direct messages box must contain exchange wrap');
  const msgCard = exchangeWrap.children[0];
  assert.ok(msgCard.innerHTML.includes('crt-purge-btn'), 'Direct message must include crt-purge-btn');
  assert.ok(msgCard.innerHTML.includes("purgeVoxEntry('m_purge_1', 'message')"), 'Direct message card must wire onclick to purgeVoxEntry');
  assert.ok(msgCard.innerHTML.includes('✕ PURGE'), 'Must render purge button label');

  const replyCard = exchangeWrap.children[1];
  assert.ok(replyCard.innerHTML.includes('crt-purge-btn'), 'Reply card must include crt-purge-btn');
  assert.ok(replyCard.innerHTML.includes("purgeVoxEntry('m_purge_1', 'message')"), 'Reply card must wire onclick to purgeVoxEntry');

  const intCard = mockElements.interferencesBox.children[0];
  assert.ok(intCard, 'Interferences box must contain intercept card');
  assert.ok(intCard.innerHTML.includes('crt-purge-btn'), 'Interferences must include crt-purge-btn');
  assert.ok(intCard.innerHTML.includes("purgeVoxEntry('int_purge_1', 'interference')"), 'Interference card must wire onclick to purgeVoxEntry');
});

test('vox: purgeVoxEntry confirms, triggers SFX, calls delete_vox_entry RPC, and refreshes terminal', async () => {
  mockElements.passInput.value = 'VermilionKey99';
  await vox.handleSealAction();

  rpcCalls.length = 0;
  mockWindow.confirm = () => true;

  await vox.purgeVoxEntry('m_purge_1', 'message');

  const deleteRpc = rpcCalls.find(c => c.fnName === 'delete_vox_entry');
  assert.ok(deleteRpc, 'Must invoke delete_vox_entry RPC');
  assert.equal(deleteRpc.params.p_channel, 'alpha');
  assert.equal(deleteRpc.params.p_passphrase, 'VermilionKey99');
  assert.equal(deleteRpc.params.p_entry_id, 'm_purge_1');
  assert.equal(deleteRpc.params.p_entry_type, 'message');

  // Verify refusal / cancel in confirm prompt aborts RPC
  rpcCalls.length = 0;
  mockWindow.confirm = () => false;
  await vox.purgeVoxEntry('int_purge_2', 'interference');
  assert.equal(rpcCalls.some(c => c.fnName === 'delete_vox_entry'), false, 'Cancelled confirm must not trigger RPC');
});

test('vox: streamTextIntoElement uses elapsed-time teletype engine, sets dataset metadata, and finishes on click', () => {
  tickEvents = [];
  const targetEl = mockDocument.createElement('div');

  vox.streamTextIntoElement(targetEl, 'Commander Beta\'s transmission received.', false);

  assert.equal(targetEl.dataset.fullText, 'Commander Beta\'s transmission received.');
  assert.equal(targetEl.dataset.isRedacted, '0');
  assert.equal(targetEl.dataset.streaming, '1');
  assert.ok(tickEvents.includes('incoming'), 'Must trigger incoming teletype tick');
  assert.equal(typeof targetEl.onclick, 'function', 'Must attach onclick handler to finish streaming on click');

  // Clicking anywhere on the streaming element finishes it immediately
  targetEl.onclick();
  assert.equal(targetEl.dataset.streaming, '0');
  assert.equal(targetEl.textContent, 'Commander Beta\'s transmission received.');

  // Verify redacted mode and click-to-finish
  const redactedEl = mockDocument.createElement('div');
  vox.streamTextIntoElement(redactedEl, 'Target: [REDACTED]', true);
  assert.equal(redactedEl.dataset.isRedacted, '1');
  redactedEl.onclick();
  assert.equal(redactedEl.dataset.streaming, '0');
  assert.ok(redactedEl.innerHTML.includes('censor-bar'), 'Redacted stream finish must render censor-bar HTML');
});

test('vox: initVoxTerminalPage strictly enforces terminal password when pending payload is present, preventing password bypass', async () => {
  sessionStore.clear();
  vox.lockTerminal();

  // Simulate an active session from a previous unlock
  sessionStore.set(vox.SESSION_AUTH_KEY, JSON.stringify({ channel: 'beta', pass: 'PriorSecretPass' }));

  // Simulate a pending transmission queued from pvp, roster, crusade, or spawner
  const testPayload = {
    channel: 'beta',
    text: '+++ ORDO MALLEUS NEMESIS INDUCTION DOSSIER +++',
    queuedAt: Date.now()
  };
  sessionStore.set('foa_pending_vox_payload', JSON.stringify(testPayload));

  // Run initVoxTerminalPage
  await vox.initVoxTerminalPage();

  // Terminal MUST NOT be unlocked automatically
  assert.equal(mockElements.terminalScreen.classList.contains('hidden'), true, 'Terminal screen must remain hidden');
  assert.equal(mockElements.authScreen.classList.contains('hidden'), false, 'Auth screen must remain visible');
  assert.equal(vox.getActivePassphrase(), null, 'Active passphrase must remain null until explicitly authenticated');
  assert.equal(sessionStore.has(vox.SESSION_AUTH_KEY), false, 'Active session must be cleared to enforce password entry');
  assert.equal(vox.getSelectedChannel(), 'beta', 'Target channel must be matched from pending payload');
  assert.equal(mockElements.pendingDossierNotice.classList.contains('hidden'), false, 'Pending dossier banner must be shown');
  assert.equal(mockElements.passInput.value, '', 'Pass input must not be auto-filled');
});

test('vox: initVoxTerminalPage restores saved session only when no pending payload awaits authorization', async () => {
  sessionStore.clear();
  vox.lockTerminal();

  // Active session with NO pending payload
  sessionStore.set(vox.SESSION_AUTH_KEY, JSON.stringify({ channel: 'alpha', pass: 'VermilionKey99' }));

  await vox.initVoxTerminalPage();

  // Should restore session and unlock
  assert.equal(vox.getActivePassphrase(), 'VermilionKey99');
  assert.equal(mockElements.terminalScreen.classList.contains('hidden'), false);
  assert.equal(mockElements.authScreen.classList.contains('hidden'), true);
});

test('vox: renders Rogue Sector dual-channel interferences in a distinct color/class (.rogue-intercept) compared to rival player interferences', async () => {
  assert.equal(typeof vox.isRogueSectorInterference, 'function', 'Must define isRogueSectorInterference helper');
  assert.equal(vox.isRogueSectorInterference({ origin_hint: 'ORBITAL AUGUR ARRAY // PARALLEL SECTOR EVENT' }), true);
  assert.equal(vox.isRogueSectorInterference({ origin_hint: 'RIVAL WARHOST VOX-BLEED (LORD COMMANDER JUNEBUG)' }), false);

  mockElements.passInput.value = 'VermilionKey99';
  await vox.handleSealAction();

  mockInterferences = [
    {
      id: 'int_rival_1',
      target_channel: 'alpha',
      origin_hint: 'RIVAL WARHOST VOX-BLEED (LORD COMMANDER JUNEBUG)',
      redacted_text: 'Rival movement near [REDACTED]',
      created_at: '2026-10-24T14:00:00Z'
    },
    {
      id: 'int_rogue_1',
      target_channel: 'alpha',
      origin_hint: 'ORBITAL AUGUR ARRAY // PARALLEL SECTOR EVENT',
      redacted_text: 'Rogue sector clash near [REDACTED] shifted Warp weather',
      created_at: '2026-10-24T14:05:00Z'
    }
  ];

  mockElements.interferencesBox.dataset.sig = '';
  await vox.refreshTerminal(false);

  assert.equal(mockElements.interferencesBox.children.length, 2);
  const rivalCard = mockElements.interferencesBox.children[0];
  const rogueCard = mockElements.interferencesBox.children[1];

  assert.equal(rivalCard.className, 'crt-intercept-card', 'Rival player intercept must use standard crimson .crt-intercept-card');
  assert.ok(rivalCard.innerHTML.includes('#ff4757'), 'Rival player intercept header must use crimson color');

  assert.ok(rogueCard.className.includes('rogue-intercept'), 'Rogue Sector intercept must include .rogue-intercept class');
  assert.ok(!rogueCard.innerHTML.includes('#ff4757'), 'Rogue Sector intercept header must use a distinct non-crimson color');
  assert.ok(voxHtml.includes('.crt-intercept-card.rogue-intercept'), 'vox.html CSS must define .crt-intercept-card.rogue-intercept');
});

test('vox: displays live Astropathic Server Online/Offline status on both Auth and Terminal screens via checkVoxServerStatus', async () => {
  assert.ok(voxHtml.includes('id="serverStatusBadge"'), 'pages/vox.html must include #serverStatusBadge on authScreen');
  assert.ok(voxHtml.includes('id="terminalServerStatusLabel"'), 'pages/vox.html must include #terminalServerStatusLabel on terminalScreen');
  assert.equal(typeof vox.isVoxServerOnline, 'function', 'Must define isVoxServerOnline helper');
  assert.equal(typeof vox.checkVoxServerStatus, 'function', 'Must define checkVoxServerStatus function');

  const now = 1700000000000;
  // Fresh online heartbeat (10 seconds ago, within 25s window)
  assert.equal(vox.isVoxServerOnline({ status: 'online', updatedAt: now - 10000 }, now), true);
  // Stale heartbeat (30 seconds ago) must be offline even if legacy manualActive flag is true
  assert.equal(vox.isVoxServerOnline({ status: 'online', updatedAt: now - 30000, manualActive: true }, now), false);
  // Stale heartbeat (5 minutes ago)
  assert.equal(vox.isVoxServerOnline({ status: 'online', updatedAt: now - 300000 }, now), false);
  // Explicit offline heartbeat
  assert.equal(vox.isVoxServerOnline({ status: 'offline', updatedAt: now - 1000 }, now), false);

  // Test checkVoxServerStatus when server is ONLINE
  mockServerHeartbeat = { status: 'online', updatedAt: Date.now() };
  const onlineState = await vox.checkVoxServerStatus();
  assert.equal(onlineState, true);
  assert.equal(mockElements.serverStatusBadge.classList.contains('online'), true);
  assert.equal(mockElements.serverStatusBadge.classList.contains('offline'), false);
  assert.ok(mockElements.serverStatusBadge.innerHTML.includes('ONLINE'));
  assert.ok(mockElements.terminalServerStatusLabel.textContent.includes('ONLINE'));

  // Test checkVoxServerStatus when server is OFFLINE
  mockServerHeartbeat = { status: 'offline', updatedAt: Date.now() };
  const offlineState = await vox.checkVoxServerStatus();
  assert.equal(offlineState, false);
  assert.equal(mockElements.serverStatusBadge.classList.contains('offline'), true);
  assert.equal(mockElements.serverStatusBadge.classList.contains('online'), false);
  assert.ok(mockElements.serverStatusBadge.innerHTML.includes('OFFLINE'));
  assert.ok(mockElements.terminalServerStatusLabel.textContent.includes('OFFLINE'));
});

test('vox: selecting and unlocking Terminal Beta vs Terminal Alpha activates Necron vs Militarum personal terminal mode', async () => {
  await vox.selectConduit('beta');
  assert.equal(mockDocument.body.classList.contains('theme-necron'), true, 'Selecting Terminal Beta must activate theme-necron on body');
  assert.equal(mockDocument.body.classList.contains('theme-militarum'), false);

  mockElements.passInput.value = 'JunebugRoyalKey';
  await vox.handleSealAction();
  assert.equal(mockDocument.body.classList.contains('theme-necron'), true, 'Unlocking Terminal Beta must preserve theme-necron');
  assert.ok(mockElements.activeConduitLabel.textContent.includes('LORD COMMANDER JUNEBUG'));

  await vox.selectConduit('alpha');
  assert.equal(mockDocument.body.classList.contains('theme-militarum'), true, 'Selecting Terminal Alpha must activate theme-militarum on body');
  assert.equal(mockDocument.body.classList.contains('theme-necron'), false);

  mockElements.passInput.value = 'VermilionKey99';
  await vox.handleSealAction();
  assert.equal(mockDocument.body.classList.contains('theme-militarum'), true, 'Unlocking Terminal Alpha must preserve theme-militarum');

  // Verify pages/vox.html defines Necron personal terminal styling
  assert.ok(voxHtml.includes('body.theme-necron .crt-monitor-frame'), 'vox.html must style .crt-monitor-frame in Necron Tomb-Ship mode');
  assert.ok(voxHtml.includes('body.theme-necron .crt-msg-card'), 'vox.html must style .crt-msg-card in Necron Tomb-Ship mode');
  assert.ok(voxHtml.includes('body.theme-necron .crt-reply-card'), 'vox.html must style .crt-reply-card in Necron Tomb-Ship mode');
  assert.ok(voxHtml.includes('body.theme-necron .crt-input-textarea'), 'vox.html must style .crt-input-textarea in Necron Tomb-Ship mode');
});


