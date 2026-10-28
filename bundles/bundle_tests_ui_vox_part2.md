# 📦 Fires of Armageddon // Bundle: UI Tests (Astropathic Vox-Terminal Part 2)

Terminal display streaming, faction theme isolation, and interference rendering test suite (`tests/ui/vox.test.js` lines 551 to end).

## 📑 Table of Contents
- [tests/ui/vox.test.js (Part 2: Terminal Display, Theme & Interference Tests, Lines 551-end)](#file-testsuivoxtestjspart2terminaldisplaythemeinterferencetestslines551end)

---

## File: `tests/ui/vox.test.js (Part 2: Terminal Display, Theme & Interference Tests, Lines 551-end)` <a id="file-testsuivoxtestjspart2terminaldisplaythemeinterferencetestslines551end"></a>

````javascript
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
  assert.ok(voxHtml.includes('.crt-intercept-card.rogue-intercept') || voxCss.includes('.crt-intercept-card.rogue-intercept'), 'vox.html or vox.css must define .crt-intercept-card.rogue-intercept');
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
  assert.ok(mockElements.activeConduitLabel.textContent.includes('TOMB-SHIP AUTONOMOUS MASTER MATRIX'));
  assert.ok(mockElements.activeConduitLabel.textContent.includes('CONDUIT BETA'));
  assert.ok(mockElements.questionInput.placeholder.includes('Issue royal decrees to your Tomb-Ship Master Matrix'));

  await vox.selectConduit('alpha');
  assert.equal(mockDocument.body.classList.contains('theme-militarum'), true, 'Selecting Terminal Alpha must activate theme-militarum on body');
  assert.equal(mockDocument.body.classList.contains('theme-necron'), false);

  mockElements.passInput.value = 'VermilionKey99';
  await vox.handleSealAction();
  assert.equal(mockDocument.body.classList.contains('theme-militarum'), true, 'Unlocking Terminal Alpha must preserve theme-militarum');
  assert.ok(mockElements.activeConduitLabel.textContent.includes('CONDUIT ALPHA'));
  assert.ok(mockElements.activeConduitLabel.textContent.includes('THE SANCTUARY OF ASH'));
  assert.ok(mockElements.questionInput.placeholder.includes('Transmit orders to Logis-Prefect Vane'));

  // Verify pages/vox.html or css/vox.css defines Necron personal terminal styling
  assert.ok(voxHtml.includes('body.theme-necron .crt-monitor-frame') || voxCss.includes('body.theme-necron .crt-monitor-frame'), 'vox.html or vox.css must style .crt-monitor-frame in Necron Tomb-Ship mode');
  assert.ok(voxHtml.includes('body.theme-necron .crt-msg-card') || voxCss.includes('body.theme-necron .crt-msg-card'), 'vox.html or vox.css must style .crt-msg-card in Necron Tomb-Ship mode');
  assert.ok(voxHtml.includes('body.theme-necron .crt-reply-card') || voxCss.includes('body.theme-necron .crt-reply-card'), 'vox.html or vox.css must style .crt-reply-card in Necron Tomb-Ship mode');
  assert.ok(voxHtml.includes('body.theme-necron .crt-input-textarea') || voxCss.includes('body.theme-necron .crt-input-textarea'), 'vox.html or vox.css must style .crt-input-textarea in Necron Tomb-Ship mode');
});

test('vox: terminal does not retype already-seen messages upon login or refresh, streaming only new unseen messages', async () => {
  localStore.clear();
  sessionStore.clear();
  const tokens = vox.getSeenTokens();
  if (tokens) tokens.clear();

  // 1. Simulate historical message m_old already seen in past sessions and stored in persistent storage
  localStore.set(vox.SEEN_IDS_STORAGE_KEY, JSON.stringify(['q_m_old', 'r_m_old']));

  mockMessages = [
    { id: 'm_old', channel: 'alpha', sender: 'Logis-Prefect Vane', question: 'Archived status inquiry', reply: 'All stations optimal', status: 'answered' }
  ];

  mockElements.directMessagesBox.dataset.sig = '';
  await vox.refreshTerminal(false);

  // m_old should be rendered immediately without typing animation (dataset.streaming must be falsy)
  const wrapOld = mockElements.directMessagesBox.children[0];
  const qBodyOld = wrapOld.children[0].children[0];
  const rBodyOld = wrapOld.children[1].children[0];

  assert.equal(qBodyOld.textContent, 'Archived status inquiry');
  assert.equal(qBodyOld.dataset.streaming, undefined, 'Already-seen message must NOT trigger streaming typing animation');
  assert.equal(rBodyOld.textContent, 'All stations optimal');
  assert.equal(rBodyOld.dataset.streaming, undefined, 'Already-seen reply must NOT trigger streaming typing animation');

  // 2. A brand-new message arrives that has never been seen before
  mockMessages = [
    { id: 'm_old', channel: 'alpha', sender: 'Logis-Prefect Vane', question: 'Archived status inquiry', reply: 'All stations optimal', status: 'answered' },
    { id: 'm_brand_new', channel: 'alpha', sender: 'Logis-Prefect Vane', question: 'Incoming orbital breach!', reply: 'Brace for impact', status: 'answered' }
  ];

  mockElements.directMessagesBox.dataset.sig = '';
  await vox.refreshTerminal(false);

  // m_brand_new should trigger the streaming teletype animation
  const wrapNew = mockElements.directMessagesBox.children[1];
  const qBodyNew = wrapNew.children[0].children[0];
  assert.equal(qBodyNew.dataset.streaming, '1', 'Unseen new message MUST trigger streaming typing animation');

  // 3. Re-render/subsequent terminal login: m_brand_new is now in seen tokens, so it does not stream again
  mockElements.directMessagesBox.dataset.sig = '';
  await vox.refreshTerminal(false);

  const wrapSubsequent = mockElements.directMessagesBox.children[1];
  const qBodySubsequent = wrapSubsequent.children[0].children[0];
  assert.equal(qBodySubsequent.dataset.streaming, undefined, 'Previously seen message must NOT retype on subsequent render or login');
});




test('vox: validChannels array includes gamma and pages/vox.html has .conduit-selector', () => {
  assert.deepEqual(vox.validChannels, ['alpha', 'beta', 'gamma']);
  assert.ok(voxHtml.includes('class="choice-grid conduit-selector"'), 'pages/vox.html must include .conduit-selector class');
  assert.ok(voxHtml.includes('id="voxTerminalTitle"'), 'pages/vox.html must define #voxTerminalTitle banner');
});

test('vox: conduit selection cards do not have duplicate emoji icons in their title headings', () => {
  // Extract conduit title blocks from voxHtml
  const betaMatch = voxHtml.match(/id="cardBeta"[\s\S]*?<div class="choice-title conduit-title"[^>]*>([\s\S]*?)<\/div>/);
  const gammaMatch = voxHtml.match(/id="cardGamma"[\s\S]*?<div class="choice-title conduit-title"[^>]*>([\s\S]*?)<\/div>/);
  const alphaMatch = voxHtml.match(/id="cardAlpha"[\s\S]*?<div class="choice-title conduit-title"[^>]*>([\s\S]*?)<\/div>/);

  assert.ok(betaMatch, 'cardBeta must have a choice-title');
  assert.ok(gammaMatch, 'cardGamma must have a choice-title');
  assert.ok(alphaMatch, 'cardAlpha must have a choice-title');

  const betaTitle = betaMatch[1].trim();
  const gammaTitle = gammaMatch[1].trim();
  const alphaTitle = alphaMatch[1].trim();

  // Heading titles must NOT contain duplicate emoji icons because the choice-icon span already renders them above
  assert.equal(betaTitle.includes('💀'), false, `Beta title must not duplicate skull emoji (was "${betaTitle}")`);
  assert.equal(gammaTitle.includes('⛏️'), false, `Gamma title must not duplicate pickaxe emoji (was "${gammaTitle}")`);
  assert.equal(alphaTitle.includes('🦅'), false, `Alpha title must not duplicate eagle emoji (was "${alphaTitle}")`);
  assert.equal(betaTitle, 'Lord Commander Junebug');
  assert.equal(gammaTitle, 'Kâhl Hârkyn');
  assert.equal(alphaTitle, 'The Exile');
});

test('vox: pages/vox.html has balanced div tag containment inside .app-shell.vox-shell to prevent dimension breakages', () => {
  // Extract everything inside <div class="app-shell vox-shell"> ... </div> prior to script tags
  const shellStart = voxHtml.indexOf('<div class="app-shell vox-shell"');
  assert.ok(shellStart !== -1, 'Must have .app-shell.vox-shell');
  const scriptIdx = voxHtml.indexOf('<script', shellStart);
  assert.ok(scriptIdx !== -1, 'Must have script tag after vox-shell');
  const shellBlock = voxHtml.substring(shellStart, scriptIdx);

  // Count opening <div vs closing </div
  const openDivCount = (shellBlock.match(/<div(\s|>)/g) || []).length;
  const closeDivCount = (shellBlock.match(/<\/div>/g) || []).length;

  assert.equal(openDivCount, closeDivCount, `vox-shell must have exactly balanced <div> tags (found ${openDivCount} open vs ${closeDivCount} close)`);

  // Verify #authScreen and #terminalScreen are siblings
  const authIdx = shellBlock.indexOf('id="authScreen"');
  const termIdx = shellBlock.indexOf('id="terminalScreen"');
  assert.ok(authIdx !== -1, '#authScreen must exist inside shell');
  assert.ok(termIdx !== -1, '#terminalScreen must exist inside shell');
  assert.ok(termIdx > authIdx, '#terminalScreen must come after #authScreen');

  // Verify authScreen closes BEFORE terminalScreen starts
  const subBeforeTerm = shellBlock.substring(authIdx, termIdx);
  const openInsideAuth = (subBeforeTerm.match(/<div(\s|>)/g) || []).length;
  const closeInsideAuth = (subBeforeTerm.match(/<\/div>/g) || []).length;
  assert.equal(openInsideAuth, closeInsideAuth, '#authScreen must fully close all its inner divs before #terminalScreen starts');
});

test('vox: interferences retain distinct colors (crimson for target vs purple for sector broadcast) and are not overridden by faction theme', async () => {
  // 1. Verify isRogueSectorInterference broad classification
  assert.equal(vox.isRogueSectorInterference({ origin_hint: 'SECTOR BROADCAST // ALL COMBATANTS' }), true);
  assert.equal(vox.isRogueSectorInterference({ origin_hint: 'ORBITAL AUGUR ARRAY // PARALLEL SECTOR EVENT' }), true);
  assert.equal(vox.isRogueSectorInterference({ origin_hint: 'DISTANT SOLO HORDE // SECTOR TELEMETRY' }), true);
  assert.equal(vox.isRogueSectorInterference({ redacted_text: '+++ SECTOR BROADCAST: WARP DISTORTION +++' }), true);
  assert.equal(vox.isRogueSectorInterference({ origin_hint: 'RIVAL WARHOST VOX-BLEED (LORD COMMANDER JUNEBUG)' }), false);
  assert.equal(vox.isRogueSectorInterference({ origin_hint: 'LOWER DECKS VOX-BLEED (SANCTUARY OF ASH)' }), false);
  assert.equal(vox.isRogueSectorInterference({ origin_hint: 'ASHEN SPIRIT SYNTHETIC BLEED TEST // DECK 44 LOOPBACK' }), false);

  // 2. Verify applyVoxFactionTheme does NOT add conflicting vox-preview-* classes to interferencesBox or directMessagesBox
  assert.equal(typeof vox.applyVoxFactionTheme, 'function', 'applyVoxFactionTheme must be exported');
  vox.applyVoxFactionTheme('beta');
  assert.equal(mockElements.interferencesBox.classList.contains('vox-preview-beta'), false, 'interferencesBox must NOT have vox-preview-beta');
  assert.equal(mockElements.interferencesBox.classList.contains('vox-preview-alpha'), false, 'interferencesBox must NOT have vox-preview-alpha');
  assert.equal(mockElements.interferencesBox.classList.contains('vox-preview-gamma'), false, 'interferencesBox must NOT have vox-preview-gamma');
  assert.equal(mockElements.directMessagesBox.classList.contains('vox-preview-beta'), false, 'directMessagesBox must NOT have vox-preview-beta');

  vox.applyVoxFactionTheme('gamma');
  assert.equal(mockElements.interferencesBox.classList.contains('vox-preview-gamma'), false, 'interferencesBox must NOT have vox-preview-gamma');

  // 3. Render mixed interferences and verify distinct card classes & headers
  mockElements.passInput.value = 'VermilionKey99';
  await vox.handleSealAction();

  mockInterferences = [
    {
      id: 'int_target_rival',
      target_channel: 'alpha',
      origin_hint: 'RIVAL WARHOST VOX-BLEED (LORD COMMANDER JUNEBUG)',
      redacted_text: 'Targeted enemy coordinates [REDACTED]',
      created_at: '2026-10-24T14:00:00Z'
    },
    {
      id: 'int_sector_broadcast',
      target_channel: 'alpha',
      origin_hint: 'SECTOR BROADCAST // ALL COMBATANTS',
      redacted_text: 'Sector-wide distress signal near [REDACTED]',
      created_at: '2026-10-24T14:05:00Z'
    }
  ];

  mockElements.interferencesBox.dataset.sig = '';
  await vox.refreshTerminal(false);

  assert.equal(mockElements.interferencesBox.children.length, 2);
  const targetCard = mockElements.interferencesBox.children[0];
  const broadcastCard = mockElements.interferencesBox.children[1];

  // Target interference: must have crt-intercept-card, not rogue-intercept, crimson color (#ff4757), and TARGET INTERCEPT header
  assert.ok(targetCard.className.includes('crt-intercept-card'), 'Target interference must have .crt-intercept-card class');
  assert.equal(targetCard.className.includes('rogue-intercept'), false, 'Target interference must NOT have .rogue-intercept class');
  assert.ok(targetCard.innerHTML.includes('#ff4757'), 'Target interference must use crimson header color #ff4757');
  assert.ok(targetCard.innerHTML.includes('TARGET INTERCEPT'), 'Target interference must state TARGET INTERCEPT in header');

  // Sector broadcast: must have rogue-intercept and sector-broadcast classes, amethyst color (#c084fc), and SECTOR BROADCAST header
  assert.ok(broadcastCard.className.includes('rogue-intercept'), 'Broadcast interference must have .rogue-intercept class');
  assert.ok(broadcastCard.className.includes('sector-broadcast'), 'Broadcast interference must have .sector-broadcast class');
  assert.ok(broadcastCard.innerHTML.includes('#c084fc'), 'Broadcast interference must use purple amethyst header color #c084fc');
  assert.ok(broadcastCard.innerHTML.includes('SECTOR BROADCAST'), 'Broadcast interference must state SECTOR BROADCAST in header');

  // Verify CSS defines explicit styles
  assert.ok(voxCss.includes('.target-intercept') || voxCss.includes('.crt-intercept-card:not(.rogue-intercept)'), 'vox.css must define target intercept styling');
  assert.ok(voxCss.includes('.rogue-intercept') || voxCss.includes('.sector-broadcast'), 'vox.css must define rogue/broadcast intercept styling');
});

````
