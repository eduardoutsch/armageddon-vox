# 📦 Fires of Armageddon // Bundle: Courier Bridge Tests (Part 1: Scrubbing & Intercept Routing)

Automated verification for response scrubbing, persona routing, and Pattern 5 intercept broadcasts (`tests/vox_bridge.test.js` lines 1 to 522).

## 📑 Table of Contents
- [tests/vox_bridge.test.js (Part 1: Scrubbing & Intercept Routing, Lines 1-522)](#file-testsvoxbridgetestjspart1scrubbinginterceptroutinglines1522)

---

## File: `tests/vox_bridge.test.js (Part 1: Scrubbing & Intercept Routing, Lines 1-522)` <a id="file-testsvoxbridgetestjspart1scrubbinginterceptroutinglines1522"></a>

````javascript
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const {
  resolveServiceKey,
  resolveThreadUrls,
  resolveVoxProfileDir,
  routeSpeakerPersona,
  scrubArtifacts,
  extractCleanLastModelResponse,
  processSingleMessage,
  drainChannelQueue,
  runDualThreadCourier,
  publishServerHeartbeat
} = require('../vox_bridge.js');

function createMockPage({ onInsertText, evaluateResult } = {}) {
  return {
    url: () => 'https://gemini.google.com/test',
    evaluate: async (fn, arg) => {
      if (typeof evaluateResult === 'function') {
        return evaluateResult(fn, arg);
      }
      return evaluateResult || { count: 0, text: '' };
    },
    locator: (sel) => {
      const btn = {
        waitFor: async () => true,
        count: async () => 1,
        isEnabled: async () => true,
        click: async () => {}
      };
      return {
        first: () => btn,
        count: async () => 1
      };
    },
    bringToFront: async () => {},
    waitForTimeout: async () => {},
    keyboard: {
      press: async () => {},
      insertText: async (txt) => {
        if (onInsertText) onInsertText(txt);
      }
    }
  };
}

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

  // Standalone code block and UI labels
  const uiLabelInput = 'Plaintext\n+++ VOX TRANSMISSION +++\n• \n\n Unit Gamma deployed\nCopy code\nCopiar código\nTexto simples';
  const cleanLabels = scrubArtifacts(uiLabelInput);
  assert.equal(cleanLabels.includes('Plaintext'), false, 'Must scrub Plaintext label');
  assert.equal(cleanLabels.includes('Copy code'), false, 'Must scrub Copy code label');
  assert.equal(cleanLabels.includes('Copiar código'), false, 'Must scrub Copiar código label');
  assert.equal(cleanLabels.includes('Texto simples'), false, 'Must scrub Texto simples label');
  assert.ok(cleanLabels.includes('• Unit Gamma deployed'), 'Must collapse hanging bullets onto single line');

  // Null/empty input
  assert.equal(scrubArtifacts(''), '');
  assert.equal(scrubArtifacts(null), '');
  assert.equal(scrubArtifacts(undefined), '');
});

test('extractCleanLastModelResponse: removes code-block headers and prevents <p> inside <li> from breaking bullets', async () => {
  class SimpleDomNode {
    constructor(tagName, text = '', className = '', attrs = {}) {
      this.tagName = tagName.toUpperCase();
      this._text = text;
      this.className = className;
      this.attrs = attrs;
      this.children = [];
      this.childNodes = text ? [text] : [];
      this.parentNode = null;
    }
    get textContent() {
      if (this.childNodes.length > 0) {
        return this.childNodes.map(c => (typeof c === 'string' ? c : c.textContent)).join('');
      }
      return this._text;
    }
    set textContent(v) {
      this._text = v;
      this.childNodes = [];
      this.children = [];
    }
    cloneNode(deep = true) {
      const cloned = new SimpleDomNode(this.tagName, this._text, this.className, { ...this.attrs });
      if (deep) {
        cloned.childNodes = this.childNodes.map(c => {
          if (typeof c === 'string') return c;
          const copy = c.cloneNode(true);
          copy.parentNode = cloned;
          return copy;
        });
        cloned.children = cloned.childNodes.filter(c => typeof c !== 'string');
      }
      return cloned;
    }
    remove() {
      if (this.parentNode) {
        this.parentNode.childNodes = this.parentNode.childNodes.filter(c => c !== this);
        this.parentNode.children = this.parentNode.children.filter(c => c !== this);
      }
    }
    replaceWith(...nodes) {
      if (this.parentNode) {
        const idx = this.parentNode.childNodes.indexOf(this);
        if (idx !== -1) {
          this.parentNode.childNodes.splice(idx, 1, ...nodes);
          nodes.forEach(n => {
            if (n && typeof n === 'object') n.parentNode = this.parentNode;
          });
          this.parentNode.children = this.parentNode.childNodes.filter(c => typeof c !== 'string');
        }
      }
    }
    prepend(...nodes) {
      nodes.slice().reverse().forEach(n => {
        this.childNodes.unshift(n);
        if (n && typeof n === 'object') {
          n.parentNode = this;
          this.children.unshift(n);
        }
      });
    }
    append(...nodes) {
      nodes.forEach(n => {
        this.childNodes.push(n);
        if (n && typeof n === 'object') {
          n.parentNode = this;
          this.children.push(n);
        }
      });
    }
    closest(tag) {
      let curr = this.parentNode;
      while (curr) {
        if (curr.tagName === tag.toUpperCase()) return curr;
        curr = curr.parentNode;
      }
      return null;
    }
    querySelectorAll(sel) {
      const results = [];
      const tokens = sel.split(',').map(s => s.trim().toLowerCase());
      const visit = (node) => {
        for (const child of node.children) {
          if (!child || typeof child !== 'object') continue;
          const tag = (child.tagName || '').toLowerCase();
          const cls = (child.className || '').toLowerCase();
          const match = tokens.some(t => {
            if (t.startsWith('.')) return cls.includes(t.slice(1));
            if (t.startsWith('button[')) return tag === 'button';
            return tag === t;
          });
          if (match) results.push(child);
          visit(child);
        }
      };
      visit(this);
      return results;
    }
  }

  const root = new SimpleDomNode('div');
  const codeHeader = new SimpleDomNode('div', 'Plaintext', 'code-block-decoration');
  codeHeader.parentNode = root;
  root.children.push(codeHeader);
  root.childNodes.push(codeHeader);

  const copyBtn = new SimpleDomNode('button', 'Copy code', '', { 'aria-label': 'Copy code' });
  copyBtn.parentNode = root;
  root.children.push(copyBtn);
  root.childNodes.push(copyBtn);

  const li = new SimpleDomNode('li');
  li.parentNode = root;
  const pInsideLi = new SimpleDomNode('p', 'Unit 1 deployed');
  pInsideLi.parentNode = li;
  li.children.push(pInsideLi);
  li.childNodes.push(pInsideLi);
  root.children.push(li);
  root.childNodes.push(li);

  const mockPage = {
    evaluate: async (fn, sel) => {
      const prevDoc = global.document;
      global.document = {
        querySelectorAll: (s) => (s === sel ? [root] : [])
      };
      try {
        return fn(sel);
      } finally {
        global.document = prevDoc;
      }
    }
  };

  const res = await extractCleanLastModelResponse(mockPage);
  assert.equal(res.count, 1);
  assert.equal(res.text.includes('Plaintext'), false, 'Code header must be removed');
  assert.equal(res.text.includes('Copy code'), false, 'Copy button must be removed');
  assert.ok(res.text.includes('• Unit 1 deployed'), 'Bullet must stay on same line without orphan newline');
  assert.equal(res.text.includes('• \n\n Unit 1 deployed'), false, 'Must not have orphan newline');
});

test('processSingleMessage: splits PASSIVE ASTROPATHIC CHOIR INTERCEPT variations and handles Plaintext headers', async () => {
  const fetchCalls = [];
  const mockFetch = async (url, opts) => {
    fetchCalls.push({ url, opts, body: JSON.parse(opts.body || '{}') });
    return { ok: true, status: 200, json: async () => ({}) };
  };

  const testMsg = {
    id: '44556677-intercept-msg',
    channel: 'alpha',
    sender: 'The Exile',
    question: 'Report astral choir bleed'
  };

  const mockPage = createMockPage();

  // Response with Plaintext header and PASSIVE ASTROPATHIC CHOIR INTERCEPT
  const responseWithAstropathicIntercept =
    'REF-ID: 44556677\n+++ ORBITAL DISPATCH +++\nDirect comms verified.\nPlaintext\n+++ PASSIVE ASTROPATHIC CHOIR INTERCEPT +++\nPsychic static from [REDACTED] detected.';

  const success = await processSingleMessage(testMsg, mockPage, {
    fetchFn: mockFetch,
    supabaseUrl: 'https://test.supabase.co',
    serviceKey: 'valid_test_secret_key_123',
    waitForReplyFn: async () => responseWithAstropathicIntercept,
    logFn: () => {}
  });

  assert.equal(success, true);
  const patchCall = fetchCalls.find(c => c.url.includes('/rest/v1/vox_messages?id=eq.44556677-intercept-msg'));
  assert.ok(patchCall, 'Must patch vox_messages');
  assert.ok(patchCall.body.reply.includes('Direct comms verified.'));
  assert.equal(patchCall.body.reply.includes('PASSIVE ASTROPATHIC CHOIR INTERCEPT'), false, 'Direct reply must have intercept stripped');

  const interceptCall = fetchCalls.find(c => c.url.includes('/rest/v1/vox_interferences'));
  assert.ok(interceptCall, 'Must post to vox_interferences');
  assert.ok(interceptCall.body.redacted_text.includes('PASSIVE ASTROPATHIC CHOIR INTERCEPT'));
  assert.equal(interceptCall.body.redacted_text.includes('Plaintext'), false, 'Intercept must have leading Plaintext label stripped');
});

test('processSingleMessage: triggers Pattern 5 intercept bleed prompt for EMERGENCY AUSPEX PING and UNBOUND ADVERSARY', async () => {
  const dispatchedPrompts = [];
  const mockPage = createMockPage({
    onInsertText: (txt) => { dispatchedPrompts.push(txt); }
  });

  const testMsg = {
    id: '99887766-unbound-ping',
    channel: 'alpha',
    sender: 'The Exile',
    question: '+++ EMERGENCY AUSPEX PING: UNBOUND ADVERSARY WARP-BREACH INTRUSION DETECTED +++'
  };

  await processSingleMessage(testMsg, mockPage, {
    fetchFn: async () => ({ ok: true, status: 200, json: async () => ({}) }),
    supabaseUrl: 'https://test.supabase.co',
    serviceKey: 'valid_test_secret_key_123',
    waitForReplyFn: async () => 'REF-ID: 99887766\n+++ COGITATOR READOUT +++\nIntrusion noted.',
    logFn: () => {}
  });

  const fullPrompt = dispatchedPrompts.join('\n');
  assert.ok(
    fullPrompt.includes('Pattern 5 intercept block'),
    'Unbound/Intrusion pings must trigger a Pattern 5 intercept bleed instruction in the prompt'
  );
});

test('processSingleMessage: triggers Pattern 5 intercept bleed prompt for START OF TOUR OF DUTY DISPATCH and 3RD ALLIANCE VULTURE SPTS REPORT', async () => {
  for (const header of [
    '+++ MUNITORUM FIELD REGULATION 884-ALPHA // START OF TOUR OF DUTY DISPATCH +++',
    '+++ 1V1 ASH WASTES // 3RD ALLIANCE VULTURE SPTS REPORT +++'
  ]) {
    const dispatchedPrompts = [];
    const mockPage = createMockPage({
      onInsertText: (txt) => { dispatchedPrompts.push(txt); }
    });

    const testMsg = {
      id: '11223344-dispatch-msg',
      channel: 'alpha',
      sender: 'The Exile',
      question: header
    };

    await processSingleMessage(testMsg, mockPage, {
      fetchFn: async () => ({ ok: true, status: 200, json: async () => ({}) }),
      supabaseUrl: 'https://test.supabase.co',
      serviceKey: 'valid_test_secret_key_123',
      waitForReplyFn: async () => 'REF-ID: 11223344\n+++ COGITATOR READOUT +++\nDispatch logged.',
      logFn: () => {}
    });

    const fullPrompt = dispatchedPrompts.join('\n');
    assert.ok(
      fullPrompt.includes('Pattern 5 intercept block'),
      `Report "${header}" must trigger a Pattern 5 intercept bleed instruction in the prompt`
    );
  }
});

test('processSingleMessage: uses mirror-image speaker routing (Alpha defaults to Vane unless ship query; Beta defaults to Tomb-Ship Master Matrix unless hailing Vane/Zenith-09)', async () => {
  const alphaPrompts = [];
  const alphaPage = createMockPage({
    onInsertText: (txt) => { alphaPrompts.push(txt); }
  });

  await processSingleMessage(
    {
      id: 'aaaa1111-ship-alpha',
      channel: 'alpha',
      sender: 'The Exile',
      question: 'Machine-Spirit, report hull integrity and Cell 09 status.'
    },
    alphaPage,
    {
      fetchFn: async () => ({ ok: true, status: 200, json: async () => ({}) }),
      supabaseUrl: 'https://test.supabase.co',
      serviceKey: 'valid_test_secret_key_123',
      waitForReplyFn: async () => 'REF-ID: aaaa1111\n+++ COGITATOR READOUT +++\nHull integrity at 42%.',
      logFn: () => {}
    }
  );

  const alphaFull = alphaPrompts.join('\n');
  assert.ok(
    alphaFull.includes('Pattern 4A Ashen Spirit cogitator readout, REF-ID: aaaa1111'),
    'Alpha ship query must use Pattern 4A Ashen Spirit cogitator readout'
  );

  // Beta default (no Vane/Zenith hail) -> Necron Tomb-Ship Autonomous Master Matrix & Cryptek Conclave
  const betaDefaultPrompts = [];
  const betaPage = createMockPage({
    onInsertText: (txt) => { betaDefaultPrompts.push(txt); }
  });

  await processSingleMessage(
    {
      id: 'bbbb2222-ship-beta',
      channel: 'beta',
      sender: 'Lord Commander Junebug',
      question: 'Report awakening matrix status and tesseract core telemetry.'
    },
    betaPage,
    {
      fetchFn: async () => ({ ok: true, status: 200, json: async () => ({}) }),
      supabaseUrl: 'https://test.supabase.co',
      serviceKey: 'valid_test_secret_key_123',
      waitForReplyFn: async () => 'REF-ID: bbbb2222\n+++ COGITATOR READOUT +++\nTomb-Ship Master Matrix nominal.',
      logFn: () => {}
    }
  );

  const betaDefaultFull = betaDefaultPrompts.join('\n');
  assert.ok(
    betaDefaultFull.includes("using AGENT.md, SHIP.md Part 2, NECRONS_CRUSADE.md, WORLD.md, and NEMESIS.md in this notebook"),
    'Beta default prompt must reference SHIP.md Part 2 and NECRONS_CRUSADE.md'
  );
  assert.ok(
    betaDefaultFull.includes("reply in-character as Commander Beta's (JUNEBUG's) Necron Tomb-Ship Autonomous Master Matrix & Cryptek Conclave"),
    'Beta default must reply as Necron Tomb-Ship Autonomous Master Matrix & Cryptek Conclave'
  );
  assert.ok(
    betaDefaultFull.includes('REF-ID: bbbb2222, knowing ONLY Beta\'s Tomb-Ship Equilibrium Index -1, Awakening Systems, and surface telemetry—NEVER reference The Sanctuary of Ash, Deck 44, or Ashen Spirit'),
    'Beta default must enforce Tomb-Ship isolation'
  );

  // Beta explicit Vane/Zenith-09 hail -> Logis-Prefect Vane at Geostationary Zenith-09
  const betaVanePrompts = [];
  const betaVanePage = createMockPage({
    onInsertText: (txt) => { betaVanePrompts.push(txt); }
  });

  await processSingleMessage(
    {
      id: 'cccc3333-vane-beta',
      channel: 'beta',
      sender: 'Lord Commander Junebug',
      question: '[TO: VANE] Auditor at Zenith-09, state the Imperial surface coordinates.'
    },
    betaVanePage,
    {
      fetchFn: async () => ({ ok: true, status: 200, json: async () => ({}) }),
      supabaseUrl: 'https://test.supabase.co',
      serviceKey: 'valid_test_secret_key_123',
      waitForReplyFn: async () => 'REF-ID: cccc3333\n+++ ORBITAL DISPATCH +++\nCoordinates logged.',
      logFn: () => {}
    }
  );

  const betaVaneFull = betaVanePrompts.join('\n');
  assert.ok(
    betaVaneFull.includes("reply in-character as Logis-Prefect Vane at Geostationary Zenith-09 (Pattern 1, REF-ID: cccc3333, orbital knowledge only—reacting with cold bureaucratic caution to JUNEBUG's hail across the open vox, and NEVER leaking Commander Alpha's Gatebreakers banner or internal ship state)"),
    'Beta explicit hail to Vane/Zenith-09 must route to Logis-Prefect Vane at Geostationary Zenith-09'
  );
});

test('processSingleMessage: triggers Pattern 5 intercept bleed for ROGUE SECTOR AUXILIARY BATTLE REPORT and broadcasts to BOTH alpha and beta channels', async () => {
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

  const rogueMsg = {
    id: '55667788-rogue-report',
    channel: 'alpha',
    sender: 'The Exile',
    question: '+++ ROGUE SECTOR AUXILIARY BATTLE REPORT +++\n• BATTLE OUTCOME: Chaos Victory'
  };

  const success = await processSingleMessage(rogueMsg, mockPage, {
    fetchFn: mockFetch,
    supabaseUrl: 'https://test.supabase.co',
    serviceKey: 'valid_test_secret_key_123',
    waitForReplyFn: async () => '<DIRECT_REPLY>REF-ID: 55667788\n+++ ORBITAL DECREE +++\nRogue clash logged.</DIRECT_REPLY><INTERCEPT>Warp surge near [REDACTED] detected across the sector.</INTERCEPT>',
    logFn: (m) => logged.push(m)
  });

  assert.equal(success, true);
  const fullPrompt = dispatchedPrompts.join('\n');
  assert.ok(
    fullPrompt.includes('Pattern 5 intercept block'),
    'Rogue Sector report must trigger Pattern 5 intercept bleed instruction in the prompt'
  );

  const interceptCalls = fetchCalls.filter(c => c.url.includes('/rest/v1/vox_interferences'));
  assert.equal(interceptCalls.length, 3, 'Rogue Sector intercept must be broadcast to alpha, beta, and gamma');
  assert.deepEqual(interceptCalls.map(c => c.body.target_channel), ['alpha', 'beta', 'gamma']);
  assert.equal(interceptCalls[0].body.origin_hint, 'ORBITAL AUGUR ARRAY // PARALLEL SECTOR EVENT');
  assert.equal(interceptCalls[1].body.origin_hint, 'ORBITAL AUGUR ARRAY // PARALLEL SECTOR EVENT');
  assert.equal(interceptCalls[2].body.origin_hint, 'ORBITAL AUGUR ARRAY // PARALLEL SECTOR EVENT');
  assert.ok(interceptCalls[0].body.redacted_text.includes('[REDACTED]'));
  assert.ok(logged.some(m => m.includes('ALPHA & BETA & GAMMA')));
````
