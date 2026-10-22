/**
 * Dual-Thread Concurrent Astropathic Courier Bridge (v5.1 - Bulletproof + Smart Intercept Routing)
 * - Strictly targets <model-response> (never user <message-content>)
 * - Preserves full paragraph (\n\n), line-break (\n), and bullet-point spacing
 * - Strips all Gemini Notebook citation chips ("MD", "+ 2", "+ 4", "")
 * - Routes test/simulated interferences to sender's own screen (and catches missing opening <INTERCEPT> tags)
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { chromium } = require('playwright');

const GREEN = '\x1b[92m';
function logGreen(text) {
  console.log(`${GREEN}${text}`);
}

function resolveServiceKey(env = process.env) {
  const candidates = [
    env.SUPABASE_SERVICE_ROLE_KEY,
    env.SUPABASE_SECRET_KEY,
    env.SERVICE_ROLE_KEY,
    env.SUPABASE_KEY,
    env.SECRET_KEY,
    env.API_KEY
  ];
  for (const c of candidates) {
    if (c && typeof c === 'string' && c.trim().length > 10) return c.trim();
  }
  for (const [k, v] of Object.entries(env)) {
    if (typeof v === 'string' && (v.startsWith('sb_secret_') || (k.toUpperCase().includes('SUPABASE') && !v.startsWith('http')))) {
      if (v.trim().length > 10) return v.trim();
    }
  }
  return '';
}

const SUPABASE_URL = (process.env.SUPABASE_URL || 'https://dsfvhjjalexqpbzqoaqb.supabase.co').trim();
const SERVICE_KEY = resolveServiceKey();

const ALPHA_THREAD_URL = (process.env.ALPHA_THREAD_URL || 'https://gemini.google.com/app/e834be114b163dea').trim();
const BETA_THREAD_URL = (process.env.BETA_THREAD_URL || 'https://gemini.google.com/app/0c0b15a075182321').trim();

logGreen('----------------------------------------------------------------');
logGreen('[SYSTEM DIAGNOSTICS // ASTROPATHIC COURIER v5.1 BULLETPROOF]');
logGreen(` -> SUPABASE_URL : ${SUPABASE_URL}`);
logGreen(` -> SERVICE_KEY  : ${SERVICE_KEY ? `LOADED (${SERVICE_KEY.slice(0, 14)}...)` : 'MISSING! Check your .env file!'}`);
logGreen(` -> TAB 1 (EXILE): ${ALPHA_THREAD_URL}`);
logGreen(` -> TAB 2 (JUNE) : ${BETA_THREAD_URL}`);
logGreen('----------------------------------------------------------------');

const headers = {
  'Content-Type': 'application/json',
  'apikey': SERVICE_KEY
};

const CHAT_INPUT_SELECTOR = 'rich-textarea div.ql-editor, div.ql-editor[contenteditable="true"], div[role="textbox"][contenteditable="true"], textarea';
const SEND_BUTTON_SELECTOR = 'button.send-button, button[aria-label*="Send"], button[aria-label*="Enviar"]';
const MODEL_TURN_SELECTOR = 'model-response';

let typingLock = Promise.resolve();

/**
 * Extracts clean text from the last <model-response> element in the browser,
 * removing all Notebook source citation badges ("MD", "+ 2", etc.) AND
 * preserving exact paragraph (\n\n), line-break (\n), and bullet spacing!
 */
async function extractCleanLastModelResponse(page) {
  const raw = await page.evaluate((sel) => {
    const nodes = document.querySelectorAll(sel);
    if (!nodes || nodes.length === 0) return { count: 0, text: '' };
    const lastNode = nodes[nodes.length - 1];
    const clone = lastNode.cloneNode(true);

    // 1. Remove Gemini Notebook source citation badge elements & buttons
    const junkSelectors = [
      'source-footnote',
      'sources-carousel',
      'sources-list',
      'citation-marker',
      'sup',
      '[data-test-id*="citation"]',
      '[data-test-id*="source"]',
      'button[aria-label*="source"]',
      'button[aria-label*="fonte"]',
      '.citation',
      '.source-chip',
      'mat-chip',
      'model-thoughts'
    ];
    junkSelectors.forEach(s => {
      clone.querySelectorAll(s).forEach(el => el.remove());
    });

    // 2. Remove any small inline pill/button whose text is just "MD" or "+ 2"
    clone.querySelectorAll('button, span, a, div').forEach(el => {
      if (el.children.length === 0) {
        const t = (el.textContent || '').trim();
        if (/^(MD|\+\s*\d+)$/.test(t)) {
          el.remove();
        }
      }
    });

    // 3. Explicitly inject newlines into the detached clone so <p>, <br>, <li>, etc.
    // never glue together when reading textContent/innerText!
    clone.querySelectorAll('br').forEach(br => {
      br.replaceWith('\n');
    });

    clone.querySelectorAll('li').forEach(li => {
      li.prepend('\n• ');
      li.append('\n');
    });

    clone.querySelectorAll('p, h1, h2, h3, h4, h5, h6, pre, blockquote, hr, tr').forEach(block => {
      block.prepend('\n\n');
      block.append('\n\n');
    });

    return {
      count: nodes.length,
      text: (clone.textContent || '').trim()
    };
  }, MODEL_TURN_SELECTOR);

  return {
    count: raw.count,
    text: scrubArtifacts(raw.text)
  };
}

/**
 * Secondary regex scrubber & paragraph formatter:
 * - Strips any remaining citation tags
 * - Guarantees clean spacing around +++ banners, [HEADERS]:, and bullet points
 */
function scrubArtifacts(str) {
  if (!str) return '';
  return str
    // Remove "[cite: 1, 2]" style tags if any appear
    .replace(/\[cite:\s*[\d,\s]+\]/gi, '')
    // Remove standalone "MD" followed by optional "+ N"
    .replace(/[ \t]*\bMD\b(?:\s*\+\s*\d+)?/g, '')
    // Remove standalone "+ 1", "+ 2", "+ 4" lines left by citation counters
    .replace(/^\s*\+\s*\d+\s*$/gm, '')
    // Ensure a newline after closing "+++" header banners if glued to next word
    .replace(/(\+{3})([A-Za-z\[])/g, '$1\n\n$2')
    // Ensure a blank line before closing/opening "+++" banners if glued to a period
    .replace(/([.!?])\s*(\+{3})/g, '$1\n\n$2')
    // Ensure a blank line before bracketed section headers like "[CONDUIT LOG]:"
    .replace(/([.!?])\s*(\[[A-Z0-9\s&//\-_]+\]:)/g, '$1\n\n$2')
    // Ensure a newline before bullet points if glued
    .replace(/([^\n])\s*(•\s+)/g, '$1\n$2')
    // Clean up duplicate bullets "• • " if Gemini already had a bullet inside <li>
    .replace(/•\s*[•\-*]\s*/g, '• ')
    // Clean up trailing spaces before newlines
    .replace(/[ \t]+\n/g, '\n')
    // Collapse 3+ consecutive newlines into a clean double-newline paragraph break
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function waitForBulletproofReply(page, prevState, msgShortId, channelTag) {
  const maxWaitMs = 110000;
  const start = Date.now();

  logGreen(`[WAITING // ${channelTag}] Waiting for new <model-response> (Previous count:${prevState.count})...`);

  let newResponseStarted = false;
  while (Date.now() - start < 45000) {
    await page.waitForTimeout(1000);
    const curr = await extractCleanLastModelResponse(page);

    if (curr.count > prevState.count && curr.text.length > 5 && curr.text !== prevState.text) {
      newResponseStarted = true;
      break;
    }
    if (curr.text.includes(msgShortId) && curr.text !== prevState.text) {
      newResponseStarted = true;
      break;
    }
  }

  if (!newResponseStarted) {
    logGreen(`[WARNING // ${channelTag}] No new <model-response> detected within 45s! Aborting to prevent stale read.`);
    return '';
  }

  let lastText = '';
  let stableTicks = 0;

  while (Date.now() - start < maxWaitMs) {
    await page.waitForTimeout(1400);
    const curr = await extractCleanLastModelResponse(page);
    const text = curr.text;

    if (!text || text === prevState.text) continue;

    const hasClosingTag = /<\/DIRECT_REPLY>/i.test(text);
    const hasOpenIntercept = /<INTERCEPT/i.test(text);
    const hasCloseIntercept = /<\/INTERCEPT>/i.test(text);
    const tagsComplete = hasClosingTag && (!hasOpenIntercept || hasCloseIntercept);

    if (text === lastText && text.length > 30) {
      stableTicks++;
      if ((tagsComplete && stableTicks >= 2) || stableTicks >= 4) {
        return text;
      }
    } else {
      lastText = text;
      stableTicks = 0;
    }
  }

  logGreen(`[WARNING // ${channelTag}] Stream max wait reached; returning captured text.`);
  return lastText;
}

async function processSingleMessage(msg, targetPage, options = {}) {
  const fetchFn = options.fetchFn || fetch;
  const supabaseUrl = options.supabaseUrl || SUPABASE_URL;
  const serviceKey = options.serviceKey || SERVICE_KEY;
  const logFn = options.logFn || logGreen;
  const waitForReplyFn = options.waitForReplyFn || waitForBulletproofReply;

  const isAlpha = msg.channel === 'alpha';
  const channelTag = isAlpha ? 'ALPHA // THE EXILE' : 'BETA // JUNEBUG';
  const otherChannel = isAlpha ? 'beta' : 'alpha';
  const originLabel = isAlpha
    ? 'LOWER DECKS VOX-BLEED (SANCTUARY OF ASH)'
    : 'RIVAL WARHOST VOX-BLEED (LORD COMMANDER JUNEBUG)';
  const msgShortId = msg.id ? msg.id.slice(0, 8) : '00000000';

  logFn(`\n[INCOMING TRANSMISSION -> ${channelTag}] MSG_ID: ${msgShortId} \vert{} From:${msg.sender || 'Unknown'}`);
  logFn(`   Payload: "${(msg.question || '').slice(0, 90)}..."`);

  const inputLocator = targetPage.locator(CHAT_INPUT_SELECTOR).first();
  try {
    await inputLocator.waitFor({ state: 'visible', timeout: 8000 });
  } catch (e) {
    logFn(`[WARNING // ${channelTag}] Chat input box not visible on tab. Retrying next cycle...`);
    return false;
  }

  const prevState = await extractCleanLastModelResponse(targetPage);

  const channelSpecificRules = isAlpha
    ? [
      `   - FOR CHANNEL ALPHA (THE EXILE):`,
      `     * If the player is speaking to HIGH COMMAND (Logis-Prefect Vane): Vane sits in ORBIT. He ONLY knows official Administratum serial manifests and orbital augur scans. He DOES NOT KNOW internal ship details, the -3 to +3 Ship Slider, corpse-starch vats, Cell 09 / Dravik's resurrection or bleeding walls, or underground troop nicknames like "The Shrine-Breakers" (call them "your Leman Russ Vanquisher squadron" or "Vanquisher Hulls #44-V1 and #44-V2"!).`,
      `     * ONLY if the player explicitly addresses the Ship / "Ashen Spirit" / "Machine-Spirit" directly: Use PATTERN 4 and reply in a 100% COLD, ROBOTIC, CLINICAL MU-TH-UR 6000 / COGITATOR TELEMETRY VOICE (zero conversational prose—only raw sensor readouts, percentages, hull equilibrium index [-3 to +3], Cell 09 bio-sensors, and subroutine statuses).`
    ].join('\n')
    : [
      `   - FOR CHANNEL BETA (LORD COMMANDER JUNEBUG):`,
      `     * ZERO CROSS-PLAYER LEAKS: Treat Commander Alpha's dossier and SHIP.md as NON-EXISTENT. Never mention The Sanctuary of Ash's internal lore (unless he chooses to share ship in the future), The Exile, Dreir, Dravik, or "The Shrine-Breakers".`,
      `     * NO FACTION ASSUMPTIONS: Junebug will tell you his faction when he decides to play. This is an early game problem.`,
      `     * ORBITAL PERSPECTIVE ONLY: High Command (Logis-Prefect Vane) does NOT know what happens inside JUNEBUG's flagship corridors unless JUNEBUG explicitly tells High Command in his message!`
    ].join('\n');

  const prompt = [
    `[PRIVATE TERMINAL CONDUIT: ${msg.channel.toUpperCase()} // SENDER: ${msg.sender} // MSG_ID:${msgShortId}]`,
    `Transmission Payload:`,
    `${msg.question}`,
    ``,
    `CAMPAIGN MASTER DIRECTIVES (MANDATORY AUTONOMOUS COMPLIANCE):`,
    `1. Follow the 5 Canonical Imperial CRT Dispatch Patterns in Section 2.B of AGENT.md (include ">>> REF-ID: ${msgShortId}" in the header and put clean blank lines between paragraphs/sections).`,
    `2. EXECUTE PRE-RESPONSE EPISTEMIC AUDIT (CRITICAL — DO NOT USE OMNISCIENT .MD LORE UNLESS THIS SPEAKER KNOWS IT IN-UNIVERSE):`,
    channelSpecificRules,
    `3. NEVER name-drop "The 3rd Alliance" or "Horde AI" (refer only to raw sensor anomalies/tremors), and NEVER leak unmapped Node 1-7 Hegemony numbers.`,
    `4. Reply inside <DIRECT_REPLY>...</DIRECT_REPLY> tags. If this is a Master Post-Battle or Nemesis Dossier, christen custom in-universe Lore Names & Backstories for every attached Upgrade, Relic, and Scar and update the relevant .md source!`,
    `5. If warranted, also include an <INTERCEPT>...</INTERCEPT> block (with both opening <INTERCEPT> and closing </INTERCEPT> tags!) containing a cryptic, heavily redacted snippet (using [REDACTED]) for ${otherChannel.toUpperCase()}'s Interferences window.`
  ].join('\n');

  await (typingLock = typingLock.then(async () => {
    await targetPage.bringToFront();
    await targetPage.waitForTimeout(250);
    await inputLocator.click({ force: true });
    await targetPage.waitForTimeout(150);

    await targetPage.keyboard.press('Control+A');
    await targetPage.keyboard.press('Backspace');
    await targetPage.keyboard.insertText(prompt);
    await targetPage.waitForTimeout(400);

    const sendBtn = targetPage.locator(SEND_BUTTON_SELECTOR).first();
    if (await sendBtn.count() > 0 && await sendBtn.isEnabled().catch(() => false)) {
      await sendBtn.click();
    } else {
      await targetPage.keyboard.press('Enter');
    }
    await targetPage.waitForTimeout(300);
  }).catch(err => logGreen(`[ERROR // ${channelTag}] Typing error:${err.message}`)));

  logGreen(`[DISPATCHED // ${channelTag}] Prompt sent (MSG_ID:${msgShortId}). Awaiting Campaign Master decree...`);

  const rawReply = await waitForReplyFn(targetPage, prevState, msgShortId, channelTag);

  if (!rawReply || rawReply === prevState.text) {
    logGreen(`[ERROR // ${channelTag}] No valid new response captured yet. Keeping MSG_ID ${msgShortId} in queue.`);
    return false;
  }

  const directMatch = rawReply.match(/<DIRECT_REPLY[^>]*>([\s\S]*?)<\/DIRECT_REPLY>/i);
  // Match standard <INTERCEPT>...</INTERCEPT>, OR fallback to text between </DIRECT_REPLY> and </INTERCEPT> if opening tag was omitted!
  const interceptMatch =
    rawReply.match(/<INTERCEPT([^>]*)>([\s\S]*?)<\/INTERCEPT>/i) ||
    rawReply.match(/<\/DIRECT_REPLY>\s*([\s\S]*?)<\/INTERCEPT>/i);

  const finalDirectReply = scrubArtifacts(directMatch ? directMatch[1] : rawReply);

  const reqHeaders = {
    'Content-Type': 'application/json',
    'apikey': serviceKey
  };

  const patchRes = await fetchFn(`${supabaseUrl}/rest/v1/vox_messages?id=eq.${msg.id}`, {
    method: 'PATCH',
    headers: reqHeaders,
    body: JSON.stringify({
      reply: finalDirectReply,
      status: 'answered',
      answered_at: new Date().toISOString()
    })
  });

  if (!patchRes.ok) {
    logFn(`[ERROR // ${channelTag}] Failed to write reply to Supabase (${patchRes.status})`);
    return false;
  }

  const rawInterceptBody = interceptMatch
    ? (interceptMatch[2] !== undefined ? interceptMatch[2] : interceptMatch[1])
    : '';

  if (rawInterceptBody && rawInterceptBody.trim()) {
    const cleanIntercept = scrubArtifacts(rawInterceptBody);
    const interceptAttrs = (interceptMatch[2] !== undefined ? interceptMatch[1] : '') || '';

    // If the player asked to simulate/test an interference (or tag has target="self"), route to the sender's own Interferences tab!
    const isSelfTest =
      /simulate|test.*interference/i.test(msg.question || '') ||
      /target=["']?(self|same)/i.test(interceptAttrs);

    let destChannel = isSelfTest ? msg.channel : otherChannel;
    if (/target=["']?alpha/i.test(interceptAttrs)) destChannel = 'alpha';
    if (/target=["']?beta/i.test(interceptAttrs)) destChannel = 'beta';

    const destOriginLabel = isSelfTest
      ? 'ASHEN SPIRIT SYNTHETIC BLEED TEST // DECK 44 LOOPBACK'
      : originLabel;

    await fetchFn(`${supabaseUrl}/rest/v1/vox_interferences`, {
      method: 'POST',
      headers: reqHeaders,
      body: JSON.stringify({
        target_channel: destChannel,
        origin_hint: destOriginLabel,
        redacted_text: cleanIntercept
      })
    });
    logFn(`[INTERCEPT // ${channelTag}] Redacted psychic bleed transmitted to ${destChannel.toUpperCase()}!`);
  }

  logFn(`[DELIVERED // ${channelTag}] Verified reply for MSG_ID ${msgShortId} streamed to CRT terminal!`);
  return true;
}

async function drainChannelQueue(channelName, targetPage, options = {}) {
  const fetchFn = options.fetchFn || fetch;
  const supabaseUrl = options.supabaseUrl || SUPABASE_URL;
  const serviceKey = options.serviceKey !== undefined ? options.serviceKey : SERVICE_KEY;
  const logFn = options.logFn || logGreen;

  if (!serviceKey) {
    logFn(`[CONFIG WARNING // ${channelName.toUpperCase()}] SERVICE_KEY is missing! Check .env file.`);
    return 0;
  }

  const reqHeaders = {
    'Content-Type': 'application/json',
    'apikey': serviceKey
  };

  let processedCount = 0;
  while (true) {
    const res = await fetchFn(
      `${supabaseUrl}/rest/v1/vox_messages?channel=eq.${channelName}&status=eq.pending&order=created_at.asc`,
      { headers: reqHeaders }
    );

    if (!res.ok) {
      const errText = await res.text();
      logFn(`[ERROR // ${channelName.toUpperCase()} QUEUE (${res.status})]: ${errText}`);
      break;
    }

    const queue = await res.json();
    if (!Array.isArray(queue) || queue.length === 0) {
      break;
    }

    logFn(`[QUEUE // ${channelName.toUpperCase()}] ${queue.length} pending transmission(s) in Supabase.`);

    const oldestMsg = queue[0];
    const ok = await processSingleMessage(oldestMsg, targetPage, {
      fetchFn,
      supabaseUrl,
      serviceKey,
      logFn
    });
    if (!ok) break;

    processedCount++;
    if (typeof targetPage.waitForTimeout === 'function') {
      await targetPage.waitForTimeout(1500);
    }
  }
  return processedCount;
}

async function runDualThreadCourier() {
  const profileDir = path.join(__dirname, 'chrome_vox_profile');
  const context = await chromium.launchPersistentContext(profileDir, {
    headless: false,
    channel: 'chrome',
    ignoreDefaultArgs: ['--enable-automation'],
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox'
    ],
    viewport: { width: 1280, height: 860 }
  });

  const alphaPage = context.pages()[0] || await context.newPage();
  logGreen('>> Opening Tab 1 (Commander Alpha // The Exile)...');
  await alphaPage.goto(ALPHA_THREAD_URL, { waitUntil: 'domcontentloaded' });

  const betaPage = await context.newPage();
  logGreen('>> Opening Tab 2 (Commander Beta // JUNEBUG)...');
  await betaPage.goto(BETA_THREAD_URL, { waitUntil: 'domcontentloaded' });

  try {
    const initCheck = await fetch(`${SUPABASE_URL}/rest/v1/vox_messages?status=eq.pending&select=id,channel,sender`, { headers });
    const initData = await initCheck.json();
    logGreen('================================================================');
    logGreen('++ DUAL-CONDUIT PARALLEL BRIDGE v5.1 (SMART INTERCEPT) ONLINE ++');
    logGreen(`++ Pending Transmissions in Supabase: ${Array.isArray(initData) ? initData.length : JSON.stringify(initData)}`);
    logGreen('================================================================');
  } catch (e) {
    logGreen(`[BOOT ERROR] Could not reach Supabase: ${e.message}`);
  }

  let busyAlpha = false;
  let busyBeta = false;

  setInterval(() => {
    if (!busyAlpha) {
      busyAlpha = true;
      drainChannelQueue('alpha', alphaPage)
        .catch(err => logGreen(`[ERROR // ALPHA QUEUE]: ${err.message}`))
        .finally(() => { busyAlpha = false; });
    }

    if (!busyBeta) {
      busyBeta = true;
      drainChannelQueue('beta', betaPage)
        .catch(err => logGreen(`[ERROR // BETA QUEUE]: ${err.message}`))
        .finally(() => { busyBeta = false; });
    }
  }, 5000);
}

module.exports = {
  resolveServiceKey,
  scrubArtifacts,
  extractCleanLastModelResponse,
  waitForBulletproofReply,
  processSingleMessage,
  drainChannelQueue,
  runDualThreadCourier
};

if (require.main === module) {
  runDualThreadCourier().catch(err => {
    console.error('[FATAL // ASTROPATHIC COURIER]', err);
    process.exit(1);
  });
}