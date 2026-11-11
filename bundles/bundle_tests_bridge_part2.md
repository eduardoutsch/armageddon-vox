# 📦 Fires of Armageddon // Bundle: Courier Bridge Tests (Part 2: Queue Draining, Heartbeat & Thread URLs)

Automated verification for queue draining, heartbeats, Gamma isolation, and non-Tactica .env thread URL resolution (`tests/vox_bridge.test.js` lines 523 to end).

## 📑 Table of Contents
- [tests/vox_bridge.test.js (Part 2: Queue Draining, Heartbeat & Thread URLs, Lines 523-end)](#file-testsvoxbridgetestjspart2queuedrainingheartbeatthreadurlslines523end)

---

## File: `tests/vox_bridge.test.js (Part 2: Queue Draining, Heartbeat & Thread URLs, Lines 523-end)` <a id="file-testsvoxbridgetestjspart2queuedrainingheartbeatthreadurlslines523end"></a>

````javascript
test('processSingleMessage: triggers dual-channel intercept broadcast for ORBITAL AUGUR ARRAY / DISTANT SOLO HORDE report', async () => {
  const dispatchedPrompts = [];
  const fetchCalls = [];
  const logged = [];

  const mockPage = createMockPage({
    onInsertText: (txt) => { dispatchedPrompts.push(txt); }
  });

  const mockFetch = async (url, opts) => {
    fetchCalls.push({ url, opts, body: JSON.parse(opts.body || '{}') });
    return { ok: true, status: 200, json: async () => ({}) };
  };

  const augurMsg = {
    id: '77889900-augur-report',
    channel: 'alpha',
    sender: 'The Exile',
    question: '+++ MASTER POST-BATTLE DOSSIER // ORBITAL AUGUR TELEMETRY +++\n• ENGAGEMENT CLASSIFICATION: Mode 1: Distant Solo Horde Breach // Orbital Augur Telemetry\n• ENGAGED FORCES (IN THE DISTANCE): 019th Steel Legion Patrol (Neither Main Player Fielded)'
  };

  const success = await processSingleMessage(augurMsg, mockPage, {
    fetchFn: mockFetch,
    supabaseUrl: 'https://test.supabase.co',
    serviceKey: 'valid_test_secret_key_123',
    waitForReplyFn: async () => '<DIRECT_REPLY>REF-ID: 77889900\n+++ ORBITAL DECREE +++\nDistant solo horde battle logged.</DIRECT_REPLY><INTERCEPT>Distant breach signals near [REDACTED] confirmed by orbital scans.</INTERCEPT>',
    logFn: (m) => logged.push(m)
  });

  assert.equal(success, true);
  const fullPrompt = dispatchedPrompts.join('\n');
  assert.ok(
    fullPrompt.includes('Pattern 5 intercept block'),
    'Distant solo horde augur report must trigger Pattern 5 intercept bleed instruction in prompt'
  );

  const interceptCalls = fetchCalls.filter(c => c.url.includes('/rest/v1/vox_interferences'));
  assert.equal(interceptCalls.length, 3, 'Distant solo horde augur intercept must be broadcast to alpha, beta, and gamma');
  assert.deepEqual(interceptCalls.map(c => c.body.target_channel), ['alpha', 'beta', 'gamma']);
  assert.equal(interceptCalls[0].body.origin_hint, 'ORBITAL AUGUR ARRAY // PARALLEL SECTOR EVENT');
  assert.equal(interceptCalls[1].body.origin_hint, 'ORBITAL AUGUR ARRAY // PARALLEL SECTOR EVENT');
  assert.equal(interceptCalls[2].body.origin_hint, 'ORBITAL AUGUR ARRAY // PARALLEL SECTOR EVENT');
  assert.ok(interceptCalls[0].body.redacted_text.includes('[REDACTED]'));
});

test('processSingleMessage: triggers dual-channel intercept broadcast for DISTANT WARP-BREACH ADVERSARY DETECTED ping', async () => {
  const dispatchedPrompts = [];
  const fetchCalls = [];
  const logged = [];

  const mockPage = createMockPage({
    onInsertText: (txt) => { dispatchedPrompts.push(txt); }
  });

  const mockFetch = async (url, opts) => {
    fetchCalls.push({ url, opts, body: JSON.parse(opts.body || '{}') });
    return { ok: true, status: 200, json: async () => ({}) };
  };

  const distantAdversaryMsg = {
    id: '11223344-distant-adversary',
    channel: 'alpha',
    sender: '🛰️ Orbital Augur Array // Distant Intercept',
    question: '+++ ORBITAL AUGUR ARRAY // DISTANT WARP-BREACH ADVERSARY DETECTED +++\n• THEATRE & SENSOR SWEEP: Distant Sector Grid 3 // Orbital Augur Intercept (Neither Main Player Fielded)\n• REMOTE SECTOR & BRACKET: Distant Spawn Zone 3 rolled Bracket [13+] + [5+ WARP-BREACH INTRUSION]!\n• ACTIVE DISTANT ENEMY FACTION: World Eaters'
  };

  const success = await processSingleMessage(distantAdversaryMsg, mockPage, {
    fetchFn: mockFetch,
    supabaseUrl: 'https://test.supabase.co',
    serviceKey: 'valid_test_secret_key_123',
    waitForReplyFn: async () => '<DIRECT_REPLY>REF-ID: 11223344\n+++ ORBITAL DECREE +++\nDistant Warp-breach adversary recorded in sector 3.</DIRECT_REPLY><INTERCEPT>Distant breach signals near [REDACTED] confirmed by orbital scans.</INTERCEPT>',
    logFn: (m) => logged.push(m)
  });

  assert.equal(success, true);
  const fullPrompt = dispatchedPrompts.join('\n');
  assert.ok(
    fullPrompt.includes('Pattern 5 intercept block'),
    'Distant warp-breach adversary ping must trigger Pattern 5 intercept bleed instruction in prompt'
  );

  const interceptCalls = fetchCalls.filter(c => c.url.includes('/rest/v1/vox_interferences'));
  assert.equal(interceptCalls.length, 3, 'Distant warp-breach adversary intercept must be broadcast to alpha, beta, and gamma');
  assert.deepEqual(interceptCalls.map(c => c.body.target_channel), ['alpha', 'beta', 'gamma']);
  assert.equal(interceptCalls[0].body.origin_hint, 'ORBITAL AUGUR ARRAY // PARALLEL SECTOR EVENT');
  assert.equal(interceptCalls[1].body.origin_hint, 'ORBITAL AUGUR ARRAY // PARALLEL SECTOR EVENT');
  assert.equal(interceptCalls[2].body.origin_hint, 'ORBITAL AUGUR ARRAY // PARALLEL SECTOR EVENT');
  assert.ok(interceptCalls[0].body.redacted_text.includes('[REDACTED]'));
});

test('processSingleMessage: dispatches prompt, awaits response, and patches Supabase state', async () => {
  const dispatchedText = [];
  const clickedSelectors = [];

  const mockPage = {
    url: () => 'https://gemini.google.com/test',
    evaluate: async () => ({
      count: 0,
      text: ''
    }),
    locator: (sel) => {
      if (sel.includes('ql-editor') || sel.includes('textbox') || sel.includes('textarea')) {
        return {
          first: () => ({
            waitFor: async () => true,
            click: async () => {}
          })
        };
      }
      if (sel.includes('send-button')) {
        return {
          first: () => ({
            count: async () => 1,
            isEnabled: async () => true,
            click: async () => { clickedSelectors.push('send-button'); }
          })
        };
      }
      return {
        count: async () => 1
      };
    },
    bringToFront: async () => {},
    waitForTimeout: async () => {},
    keyboard: {
      press: async () => {},
      insertText: async (txt) => { dispatchedText.push(txt); }
    }
  };

  const fetchCalls = [];
  const mockFetch = async (url, opts) => {
    fetchCalls.push({ url, opts, body: JSON.parse(opts.body || '{}') });
    return {
      ok: true,
      status: 200,
      json: async () => ({})
    };
  };

  const testMsg = {
    id: '12345678-test-msg',
    channel: 'alpha',
    sender: 'The Exile',
    question: 'Report on sector casualties.'
  };

  const success = await processSingleMessage(testMsg, mockPage, {
    fetchFn: mockFetch,
    supabaseUrl: 'https://test.supabase.co',
    serviceKey: 'valid_test_secret_key_123',
    waitForReplyFn: async () => '<DIRECT_REPLY>REF-ID: 12345678\nOrders logged.</DIRECT_REPLY><INTERCEPT>Bleed at [REDACTED]</INTERCEPT>',
    logFn: () => {}
  });

  assert.equal(success, true, 'processSingleMessage must succeed with valid mock');
  assert.equal(dispatchedText.length > 0, true, 'Must insert prompt text into editor');

  // Verify Supabase PATCH call for vox_messages
  const patchCall = fetchCalls.find(c => c.url.includes('/rest/v1/vox_messages?id=eq.12345678-test-msg'));
  assert.ok(patchCall, 'Must issue PATCH to vox_messages endpoint');
  assert.ok(patchCall.body.reply.includes('Orders logged.'));
  assert.equal(patchCall.body.status, 'answered');

  // Verify Supabase POST calls for vox_interferences (routes to rival beta AND passive listener gamma)
  const interceptCalls = fetchCalls.filter(c => c.url.includes('/rest/v1/vox_interferences'));
  assert.deepEqual(interceptCalls.map(c => c.body.target_channel), ['beta', 'gamma'], 'Player interferences must arrive on rival channel and gamma Black-Ledger');
  assert.ok(interceptCalls[0].body.redacted_text.includes('[REDACTED]'));
});

test('processSingleMessage: late-arrival catcher captures pre-existing response without re-typing prompt', async () => {
  const dispatchedText = [];
  const testMsg = {
    id: '87654321-late-arrival',
    channel: 'alpha',
    sender: 'The Exile',
    question: 'Report status'
  };

  const mockPage = {
    url: () => 'https://gemini.google.com/test',
    evaluate: async () => ({
      count: 1,
      text: '<DIRECT_REPLY>REF-ID: 87654321\n+++ STATUS NOMINAL +++\nImmediate report inscribed.</DIRECT_REPLY>'
    }),
    locator: () => ({
      first: () => ({
        waitFor: async () => true,
        click: async () => {}
      })
    }),
    bringToFront: async () => {},
    waitForTimeout: async () => {},
    keyboard: {
      press: async () => {},
      insertText: async (txt) => { dispatchedText.push(txt); }
    }
  };

  const fetchCalls = [];
  const mockFetch = async (url, opts) => {
    fetchCalls.push({ url, opts, body: JSON.parse(opts.body || '{}') });
    return {
      ok: true,
      status: 200,
      json: async () => ({})
    };
  };

  const logged = [];
  const success = await processSingleMessage(testMsg, mockPage, {
    fetchFn: mockFetch,
    supabaseUrl: 'https://test.supabase.co',
    serviceKey: 'valid_test_secret_key_123',
    logFn: (msg) => logged.push(msg)
  });

  assert.equal(success, true, 'processSingleMessage must succeed via late-arrival catcher');
  assert.equal(dispatchedText.length, 0, 'Must NOT re-type prompt when late reply is already present');
  assert.ok(logged.some(m => m.includes('LATE-ARRIVAL CAPTURED')), 'Must log late-arrival capture notice');

  const patchCall = fetchCalls.find(c => c.url.includes('/rest/v1/vox_messages?id=eq.87654321-late-arrival'));
  assert.ok(patchCall, 'Must patch Supabase with the late-arrival reply');
  assert.ok(patchCall.body.reply.includes('STATUS NOMINAL'));
  assert.equal(patchCall.body.status, 'answered');
});

test('drainChannelQueue: handles empty queue and missing service key gracefully', async () => {
  // Test missing service key
  const logged = [];
  await drainChannelQueue('alpha', {}, {
    serviceKey: '',
    logFn: (msg) => logged.push(msg)
  });
  assert.ok(logged.some(m => m.includes('SERVICE_KEY is missing')), 'Must warn when SERVICE_KEY is missing');

  // Test empty queue
  const mockEmptyFetch = async () => ({
    ok: true,
    json: async () => []
  });

  const emptyResult = await drainChannelQueue('alpha', {}, {
    fetchFn: mockEmptyFetch,
    supabaseUrl: 'https://test.supabase.co',
    serviceKey: 'valid_service_key_for_test',
    logFn: () => {}
  });

  assert.equal(emptyResult, 0, 'Drained message count must be 0 for empty queue');
});

test('resolveThreadUrls: resolves Alpha and Beta thread URLs cleanly and trims whitespace', () => {
  // Both defined and trimmed
  const urls = resolveThreadUrls({
    ALPHA_THREAD_URL: '  https://gemini.google.com/app/alpha123  ',
    BETA_THREAD_URL: '  https://gemini.google.com/app/beta456  '
  });
  assert.equal(urls.alphaThreadUrl, 'https://gemini.google.com/app/alpha123');
  assert.equal(urls.betaThreadUrl, 'https://gemini.google.com/app/beta456');

  // Missing or non-string
  const missing = resolveThreadUrls({});
  assert.equal(missing.alphaThreadUrl, '');
  assert.equal(missing.betaThreadUrl, '');

  const partial = resolveThreadUrls({ ALPHA_THREAD_URL: 'https://gemini.google.com/app/alpha123' });
  assert.equal(partial.alphaThreadUrl, 'https://gemini.google.com/app/alpha123');
  assert.equal(partial.betaThreadUrl, '');
});

test('runDualThreadCourier: safely returns false and logs fatal error when thread URLs are missing from env', async () => {
  const logged = [];
  const result = await runDualThreadCourier({
    env: { ALPHA_THREAD_URL: '' },
    logFn: (msg) => logged.push(msg)
  });
  assert.equal(result, false, 'runDualThreadCourier must exit early and return false');
  assert.ok(logged.some(m => m.includes('[FATAL ERROR] ALPHA_THREAD_URL and BETA_THREAD_URL must be defined in your .env file!')), 'Must log fatal error message');
});

test('publishServerHeartbeat: publishes online/offline vox_server_heartbeat to Supabase while preserving existing horde_pool and nemesis_status', async () => {
  assert.equal(typeof publishServerHeartbeat, 'function', 'publishServerHeartbeat must be exported from vox_bridge.js');

  const fetchCalls = [];
  const mockFetch = async (url, opts = {}) => {
    const body = opts.body ? JSON.parse(opts.body) : {};
    fetchCalls.push({ url, body });
    if (url.includes('get_shared_spawn_pools')) {
      return {
        ok: true,
        json: async () => ({
          ok: true,
          horde_pool: { b34: '10 Termagants' },
          nemesis_status: { nem1: 'roaming', spawner_rooms: { 'HADES-01': { battleRound: 2 } } }
        })
      };
    }
    if (url.includes('save_shared_spawn_pools')) {
      return {
        ok: true,
        json: async () => ({ ok: true })
      };
    }
    return { ok: false };
  };

  const okOnline = await publishServerHeartbeat('online', {
    fetchFn: mockFetch,
    supabaseUrl: 'https://test.supabase.co'
  });
  assert.equal(okOnline, true);

  const saveCall = fetchCalls.find(c => c.url.includes('save_shared_spawn_pools'));
  assert.ok(saveCall, 'Must call save_shared_spawn_pools');
  assert.deepEqual(saveCall.body.p_horde_pool, { b34: '10 Termagants' }, 'Must preserve existing horde_pool');
  assert.equal(saveCall.body.p_nemesis_status.nem1, 'roaming', 'Must preserve existing nemesis_status keys');
  assert.deepEqual(saveCall.body.p_nemesis_status.spawner_rooms, { 'HADES-01': { battleRound: 2 } });
  assert.equal(saveCall.body.p_nemesis_status.vox_server_heartbeat.status, 'online');
  assert.equal(typeof saveCall.body.p_nemesis_status.vox_server_heartbeat.updatedAt, 'number');
  assert.equal(saveCall.body.p_nemesis_status.vox_server_heartbeat.manualActive, undefined, 'Must not set manualActive bypass');

  fetchCalls.length = 0;
  const okOffline = await publishServerHeartbeat('offline', {
    fetchFn: mockFetch,
    supabaseUrl: 'https://test.supabase.co'
  });
  assert.equal(okOffline, true);
  const saveOfflineCall = fetchCalls.find(c => c.url.includes('save_shared_spawn_pools'));
  assert.equal(saveOfflineCall.body.p_nemesis_status.vox_server_heartbeat.status, 'offline');
});

test('processSingleMessage: routes channel gamma to Fane-Node Vôl-09 and suppresses Pattern 5 interference bleed into other channels', async () => {
  const dispatchedPrompts = [];
  const mockPage = createMockPage({
    onInsertText: (txt) => { dispatchedPrompts.push(txt); }
  });

  const fetchCalls = [];
  const mockFetch = async (url, opts) => {
    fetchCalls.push({ url, body: opts && opts.body ? JSON.parse(opts.body) : null });
    return { ok: true, status: 200, json: async () => ({}) };
  };

  const gammaMsg = {
    id: '11223344-gamma-report',
    channel: 'gamma',
    sender: 'Kâhl Hârkyn',
    question: '+++ THRYMKÂL SALVAGE CONSORTIUM // BLACK-LEDGER EXPEDITION & ACQUISITIONS DISPATCH +++'
  };

  const responseWithIntercept = `REF-ID: 11223344
+++ FANE-NODE VÔL-09 // BLACK-LEDGER ANCESTOR CORE +++
• CLAIM CONFIRMED: Ore reserves logged.
<INTERCEPT_BLEED target="alpha">
[PASSIVE INTERCEPT]: Votann chatter detected.
</INTERCEPT_BLEED>`;

  const success = await processSingleMessage(gammaMsg, mockPage, {
    fetchFn: mockFetch,
    supabaseUrl: 'https://test.supabase.co',
    serviceKey: 'valid_test_secret_key_123',
    waitForReplyFn: async () => responseWithIntercept,
    logFn: () => {}
  });

  assert.equal(success, true);
  const fullPrompt = dispatchedPrompts.join('\n');
  assert.ok(fullPrompt.includes('Fane-Node Vôl-09'), 'Must prompt as Fane-Node Vôl-09');
  assert.ok(fullPrompt.includes('The Ledger of Embers'), 'Must reference The Ledger of Embers');

  // Verify that NO call was made to /rest/v1/vox_interferences (zero interference bleed!)
  const interceptCall = fetchCalls.find(c => c.url.includes('/rest/v1/vox_interferences'));
  assert.equal(interceptCall, undefined, 'Gamma messages must NEVER post to vox_interferences (Zero Interference Bleed)');
});


test('routeSpeakerPersona: routes gamma to Fane-Node Vôl-09 with allowIntercept=false and Black-Ledger prompt prefix', () => {
  const p1 = routeSpeakerPersona('gamma', 'Check ore reserves', '12345678');
  assert.equal(p1.speaker, 'FANE_NODE_VOL_09');
  assert.equal(p1.allowIntercept, false);
  assert.equal(p1.pattern, 'Pattern 4C (Fane-Node Vôl-09 Readout)');
  assert.ok(p1.promptPrefix.includes('Fane-Node Vôl-09 ("The Deaf Ear")'));
  assert.ok(p1.promptPrefix.includes('Commander Omega - The Ledger of Embers (Story, Roster & Acquisitions Ledger).md'));
  assert.ok(p1.promptPrefix.includes('Force Warlord Kâhl Hârkyn: '));
  assert.ok(p1.promptPrefix.includes('Pattern 4C / Pattern 2 / Pattern 3, REF-ID: 12345678'));
  assert.ok(p1.promptPrefix.includes('DO NOT include any Pattern 5 intercept block'));

  const p2 = routeSpeakerPersona('gamma', 'MASTER POST-BATTLE REPORT: Extraction complete', '12345678');
  assert.equal(p2.speaker, 'FANE_NODE_VOL_09');

  assert.equal(p2.allowIntercept, false);
  assert.equal(p2.pattern, 'Pattern 2 (Thrymkâl Black-Ledger Audit)');

  const p3 = routeSpeakerPersona('gamma', 'NEMESIS THREAT DETECTED ON SECTOR RIDGE', '12345678');
  assert.equal(p3.speaker, 'FANE_NODE_VOL_09');
  assert.equal(p3.allowIntercept, false);
  assert.equal(p3.pattern, 'Pattern 3 (Seismic Grudge-Warrant)');
});

test('resolveThreadUrls: resolves gammaUrl when GAMMA_THREAD_URL is configured', () => {
  const urls = resolveThreadUrls({
    ALPHA_THREAD_URL: 'https://gemini.google.com/app/alpha',
    BETA_THREAD_URL: 'https://gemini.google.com/app/beta',
    GAMMA_THREAD_URL: 'https://gemini.google.com/app/gamma'
  });
  assert.equal(urls.alphaUrl, 'https://gemini.google.com/app/alpha');
  assert.equal(urls.betaUrl, 'https://gemini.google.com/app/beta');
  assert.equal(urls.gammaUrl, 'https://gemini.google.com/app/gamma');
  assert.equal(urls.gammaThreadUrl, 'https://gemini.google.com/app/gamma');
});

test('resolveThreadUrls: picks up all non-Tactica *_THREAD_URL entries and strictly excludes TACTICA_THREAD_URL', () => {
  const urls = resolveThreadUrls({
    SUPABASE_URL: 'https://dsfvhjjalexqpbzqoaqb.supabase.co',
    TACTICA_THREAD_URL: 'https://gemini.google.com/app/tactica-only-thread',
    ALPHA_THREAD_URL: 'https://gemini.google.com/app/32b1c53a813d15a3',
    BETA_THREAD_URL: 'https://gemini.google.com/app/0c0b15a075182321',
    GAMMA_THREAD_URL: 'https://gemini.google.com/app/793dd9d2bd84ad35',
    DELTA_THREAD_URL: 'https://gemini.google.com/app/delta999'
  });

  assert.equal(urls.alphaThreadUrl, 'https://gemini.google.com/app/32b1c53a813d15a3');
  assert.equal(urls.betaThreadUrl, 'https://gemini.google.com/app/0c0b15a075182321');
  assert.equal(urls.gammaThreadUrl, 'https://gemini.google.com/app/793dd9d2bd84ad35');
  assert.deepEqual(urls.allVoxThreadUrls, {
    alpha: 'https://gemini.google.com/app/32b1c53a813d15a3',
    beta: 'https://gemini.google.com/app/0c0b15a075182321',
    gamma: 'https://gemini.google.com/app/793dd9d2bd84ad35',
    delta: 'https://gemini.google.com/app/delta999'
  });
  assert.equal(Object.values(urls.allVoxThreadUrls).includes('https://gemini.google.com/app/tactica-only-thread'), false);
  assert.equal(urls.extraThreadUrls.length, 1);
  assert.equal(urls.extraThreadUrls[0].channel, 'delta');
  assert.equal(urls.extraThreadUrls[0].url, 'https://gemini.google.com/app/delta999');

  // Even if someone accidentally points a Vox channel to the exact TACTICA_THREAD_URL, Vox excludes it
  const accidentalDup = resolveThreadUrls({
    TACTICA_THREAD_URL: 'https://gemini.google.com/app/tactica-only-thread',
    ALPHA_THREAD_URL: 'https://gemini.google.com/app/32b1c53a813d15a3',
    BETA_THREAD_URL: 'https://gemini.google.com/app/0c0b15a075182321',
    GAMMA_THREAD_URL: 'https://gemini.google.com/app/tactica-only-thread'
  });
  assert.equal(accidentalDup.gammaThreadUrl, '', 'Must never allow Vox Autopilot to claim TACTICA_THREAD_URL');
});

test('processSingleMessage: channel=gamma logs GAMMA channelTag, guards against drift using GAMMA_THREAD_URL, and uses Fane-Node Vôl-09 self-heal recovery prompt on refusal', async () => {
  const logged = [];
  const gotoUrls = [];
  const dispatchedPrompts = [];
  let callCount = 0;

  const mockPage = Object.assign(createMockPage({ onInsertText: (txt) => dispatchedPrompts.push(txt) }), {
    url: () => 'https://gemini.google.com/app/drifted-wrong-thread',
    goto: async (url) => { gotoUrls.push(url); },
    waitForSelector: async () => {}
  });

  const gammaMsg = {
    id: '99887766-gamma-drift',
    channel: 'gamma',
    sender: 'Kâhl Hârkyn',
    question: 'Report current Raw Minerals and Expedition Total.'
  };

  const success = await processSingleMessage(gammaMsg, mockPage, {
    fetchFn: async () => ({ ok: true, status: 200, json: async () => ({}) }),
    supabaseUrl: 'https://test.supabase.co',
    serviceKey: 'valid_test_secret_key_123',
    gammaThreadUrl: 'https://gemini.google.com/app/793dd9d2bd84ad35',
    waitForReplyFn: async () => (++callCount === 1
      ? '__GEMINI_REFUSAL__'
      : 'REF-ID: 99887766\n+++ FANE-NODE VÔL-09 // BLACK-LEDGER ANCESTOR CORE +++\n• VAULT VERIFIED: 70 Raw Minerals logged.'),
    logFn: (m) => logged.push(m)
  });

  assert.equal(success, true);
  assert.ok(logged.some(m => m.includes('GAMMA // KÂHL HÂRKYN')), 'Must log GAMMA // KÂHL HÂRKYN channelTag for gamma messages');
  assert.deepEqual(gotoUrls, ['https://gemini.google.com/app/793dd9d2bd84ad35'], 'Must snap drifted gamma tab back to expected gamma thread URL');
  assert.equal(dispatchedPrompts.length, 2, 'Must send initial prompt and self-heal recovery prompt on refusal');
  assert.ok(dispatchedPrompts[1].includes('Fane-Node Vôl-09') && dispatchedPrompts[1].includes('Commander Omega - The Ledger of Embers'));
});

````
