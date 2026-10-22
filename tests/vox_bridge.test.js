const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const {
  resolveServiceKey,
  buildDispatchPrompt,
  parseGeminiReply,
  waitForGeminiReply,
  processSingleMessage,
  drainChannelQueue
} = require('../vox_bridge.js');

test('resolveServiceKey: resolves key correctly across standard and fallback env formats', () => {
  // Test primary standard keys
  assert.equal(
    resolveServiceKey({ SUPABASE_SERVICE_ROLE_KEY: '  valid_service_role_secret_key_123  ' }),
    'valid_service_role_secret_key_123'
  );
  assert.equal(
    resolveServiceKey({ SUPABASE_SECRET_KEY: 'sb_secret_alpha_bravo_charlie_key' }),
    'sb_secret_alpha_bravo_charlie_key'
  );
  assert.equal(
    resolveServiceKey({ SERVICE_ROLE_KEY: 'service_role_key_long_enough' }),
    'service_role_key_long_enough'
  );
  assert.equal(
    resolveServiceKey({ SUPABASE_KEY: 'supabase_generic_key_string' }),
    'supabase_generic_key_string'
  );
  assert.equal(
    resolveServiceKey({ SECRET_KEY: 'secret_key_generic_string' }),
    'secret_key_generic_string'
  );
  assert.equal(
    resolveServiceKey({ API_KEY: 'api_key_generic_long_string' }),
    'api_key_generic_long_string'
  );

  // Test sb_secret_ prefix scan fallback
  assert.equal(
    resolveServiceKey({ CUSTOM_VAR_NAME: 'sb_secret_random_prefix_found' }),
    'sb_secret_random_prefix_found'
  );

  // Test SUPABASE-named variable fallback that is not a URL
  assert.equal(
    resolveServiceKey({ MY_SUPABASE_TOKEN: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.token' }),
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.token'
  );

  // Must reject keys <= 10 characters
  assert.equal(resolveServiceKey({ SUPABASE_SERVICE_ROLE_KEY: 'short' }), '');

  // Must return empty string if no valid candidate exists
  assert.equal(resolveServiceKey({}), '');
  assert.equal(resolveServiceKey({ SUPABASE_URL: 'https://example.supabase.co' }), '');
});

test('buildDispatchPrompt: constructs structured Campaign Master prompt with appropriate channel targets', () => {
  // Alpha channel dispatch
  const alphaMsg = {
    id: 'msg-001-alpha',
    channel: 'alpha',
    sender: 'The Exile // Sanctuary of Ash',
    question: 'Requesting permission to requisition sacred plasma coils.'
  };

  const alphaPrompt = buildDispatchPrompt(alphaMsg);
  assert.ok(alphaPrompt.includes('[PRIVATE TERMINAL CONDUIT: ALPHA // SENDER:The Exile // Sanctuary of Ash]'));
  assert.ok(alphaPrompt.includes('Requesting permission to requisition sacred plasma coils.'));
  assert.ok(alphaPrompt.includes('<DIRECT_REPLY>...</DIRECT_REPLY>'));
  assert.ok(alphaPrompt.includes('BETA\'s Interferences window'));

  // Beta channel dispatch
  const betaMsg = {
    id: 'msg-002-beta',
    channel: 'beta',
    sender: 'Lord Commander Junebug',
    question: 'Secured primary promethium silos at Node 4.'
  };

  const betaPrompt = buildDispatchPrompt(betaMsg);
  assert.ok(betaPrompt.includes('[PRIVATE TERMINAL CONDUIT: BETA // SENDER:Lord Commander Junebug]'));
  assert.ok(betaPrompt.includes('Secured primary promethium silos at Node 4.'));
  assert.ok(betaPrompt.includes('ALPHA\'s Interferences window'));

  // Graceful fallback for missing fields
  const emptyPrompt = buildDispatchPrompt({});
  assert.ok(emptyPrompt.includes('[PRIVATE TERMINAL CONDUIT: ALPHA // SENDER:Unknown Sender]'));
});

test('parseGeminiReply: cleanly separates direct replies and psychic interferences across formats', () => {
  // Standard format with both direct reply and intercept tags
  const rawWithBoth = `
Here is my campaign decree:
<DIRECT_REPLY>
The Munitorum grants your requisition. Advance without delay.
</DIRECT_REPLY>
<INTERCEPT>
Heavy plasma activity detected in [REDACTED] lower sanctum.
</INTERCEPT>
Praise the Omnissiah.
  `;

  const parsed1 = parseGeminiReply(rawWithBoth);
  assert.equal(parsed1.directReply, 'The Munitorum grants your requisition. Advance without delay.');
  assert.equal(parsed1.interceptText, 'Heavy plasma activity detected in [REDACTED] lower sanctum.');

  // Case-insensitive tags
  const rawCaseInsensitive = `
<direct_reply>
Hostile titan silenced.
</direct_reply>
<intercept>
Static warp echo near sector [REDACTED].
</intercept>
  `;
  const parsedCase = parseGeminiReply(rawCaseInsensitive);
  assert.equal(parsedCase.directReply, 'Hostile titan silenced.');
  assert.equal(parsedCase.interceptText, 'Static warp echo near sector [REDACTED].');

  // Direct reply only, no intercept
  const rawDirectOnly = `
<DIRECT_REPLY>
Orders received and logged in the Lex Imperialis.
</DIRECT_REPLY>
  `;
  const parsedDirectOnly = parseGeminiReply(rawDirectOnly);
  assert.equal(parsedDirectOnly.directReply, 'Orders received and logged in the Lex Imperialis.');
  assert.equal(parsedDirectOnly.interceptText, null);

  // Free-form reply with no XML tags (fallback)
  const rawUntagged = 'The Emperor Protects. Stand firm at the redoubt.';
  const parsedUntagged = parseGeminiReply(rawUntagged);
  assert.equal(parsedUntagged.directReply, 'The Emperor Protects. Stand firm at the redoubt.');
  assert.equal(parsedUntagged.interceptText, null);

  // Empty or invalid input
  assert.deepEqual(parseGeminiReply(''), { directReply: '', interceptText: null });
  assert.deepEqual(parseGeminiReply(null), { directReply: '', interceptText: null });
  assert.deepEqual(parseGeminiReply(undefined), { directReply: '', interceptText: null });
});

test('waitForGeminiReply: stabilizes when text reaches steady-state over consecutive ticks', async () => {
  let tick = 0;
  const mockPage = {
    locator: (sel) => ({
      count: async () => 1,
      last: () => ({
        innerText: async () => {
          tick++;
          // Returns same text on tick 3, 4, 5 to trigger 3 stable ticks
          if (tick < 3) return 'Streamin...';
          return 'Affirmative decree from Command.';
        }
      })
    }),
    waitForTimeout: async () => {}
  };

  const reply = await waitForGeminiReply(mockPage, 0, 'ALPHA // TEST', {
    maxWaitMs: 5000,
    checkIntervalMs: 10,
    logFn: () => {}
  });

  assert.equal(reply, 'Affirmative decree from Command.');
});

test('processSingleMessage: dispatches prompt, awaits response, and patches Supabase state', async () => {
  const dispatchedText = [];
  const clickedSelectors = [];
  let modelCount = 0;

  const mockPage = {
    url: () => 'https://gemini.google.com/test',
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
            click: async () => {
              clickedSelectors.push('send-button');
              modelCount = 1; // Simulate model response starting after dispatch
            }
          })
        };
      }
      return {
        count: async () => modelCount,
        last: () => ({
          innerText: async () => '<DIRECT_REPLY>Approved by Warmaster.</DIRECT_REPLY><INTERCEPT>Bleed at [REDACTED]</INTERCEPT>'
        })
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
    id: 'test-msg-12345678',
    channel: 'alpha',
    sender: 'The Exile',
    question: 'Report on sector casualties.'
  };

  const success = await processSingleMessage(testMsg, mockPage, {
    fetchFn: mockFetch,
    supabaseUrl: 'https://test.supabase.co',
    serviceKey: 'valid_test_secret_key_123',
    logFn: () => {}
  });

  assert.equal(success, true, 'processSingleMessage must succeed with valid mock');
  assert.equal(dispatchedText.length > 0, true, 'Must insert prompt text into editor');

  // Verify Supabase PATCH call for vox_messages
  const patchCall = fetchCalls.find(c => c.url.includes('/rest/v1/vox_messages?id=eq.test-msg-12345678'));
  assert.ok(patchCall, 'Must issue PATCH to vox_messages endpoint');
  assert.equal(patchCall.body.reply, 'Approved by Warmaster.');
  assert.equal(patchCall.body.status, 'answered');

  // Verify Supabase POST call for vox_interferences
  const interceptCall = fetchCalls.find(c => c.url.includes('/rest/v1/vox_interferences'));
  assert.ok(interceptCall, 'Must issue POST to vox_interferences endpoint');
  assert.equal(interceptCall.body.target_channel, 'beta');
  assert.equal(interceptCall.body.redacted_text, 'Bleed at [REDACTED]');
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
