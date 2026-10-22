const test = require('node:test');
const assert = require('node:assert/strict');

const {
  resolveServiceKey,
  resolveThreadUrls,
  scrubArtifacts,
  processSingleMessage,
  drainChannelQueue,
  runDualThreadCourier
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

test('scrubArtifacts: cleanly scrubs Notebook source citation chips and formats paragraph breaks', () => {
  // Strips citation chips and isolated line counters
  const inputWithChips = `
The cogitator awaits your command, Warden.
MD
+ 4
Transmit your tactical queries or dispatch Post-Battle Dossiers.
MD + 2
[cite: 1, 3]
+++ TRANSMISSION CONCLUDED +++
  `;

  const scrubbed = scrubArtifacts(inputWithChips);
  assert.equal(scrubbed.includes('MD'), false, 'Must scrub MD citation badges');
  assert.equal(scrubbed.includes('+ 4'), false, 'Must scrub + 4 citation lines');
  assert.equal(scrubbed.includes('+ 2'), false, 'Must scrub + 2 citation lines');
  assert.equal(scrubbed.includes('[cite:'), false, 'Must scrub [cite:] markers');
  assert.ok(scrubbed.includes('The cogitator awaits your command, Warden.'));
  assert.ok(scrubbed.includes('Transmit your tactical queries or dispatch Post-Battle Dossiers.'));
  assert.ok(scrubbed.includes('+++ TRANSMISSION CONCLUDED +++'));

  // Bullets formatting
  const bulletInput = 'Status report:• • Unit Alfa ready\n• Unit Beta advancing';
  const cleanBullets = scrubArtifacts(bulletInput);
  assert.ok(cleanBullets.includes('• Unit Alfa ready'));
  assert.ok(cleanBullets.includes('• Unit Beta advancing'));

  // Null/empty input
  assert.equal(scrubArtifacts(''), '');
  assert.equal(scrubArtifacts(null), '');
  assert.equal(scrubArtifacts(undefined), '');
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

  // Verify Supabase POST call for vox_interferences
  const interceptCall = fetchCalls.find(c => c.url.includes('/rest/v1/vox_interferences'));
  assert.ok(interceptCall, 'Must issue POST to vox_interferences endpoint');
  assert.equal(interceptCall.body.target_channel, 'beta');
  assert.ok(interceptCall.body.redacted_text.includes('[REDACTED]'));
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
