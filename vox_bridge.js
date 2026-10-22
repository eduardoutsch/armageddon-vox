/**
 * Dual-Thread Concurrent Astropathic Courier Bridge
 * - Connects Supabase vox_messages with live Gemini web sessions.
 * - Tab 1 (Alpha / The Exile):   https://gemini.google.com/app/e834be114b163dea
 * - Tab 2 (Beta / JUNEBUG):      https://gemini.google.com/app/0c0b15a075182321
 */
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { chromium } = require('playwright');

// Lock terminal output to bright CRT Phosphor Green with standard reset
const GREEN = '\x1b[92m';
const RESET = '\x1b[0m';

/**
 * Logs phosphor green text to the terminal and resets formatting.
 * @param {string} text - Message to log.
 */
function logGreen(text) {
  console.log(`${GREEN}${text}${RESET}`);
}

/**
 * Auto-detects the Supabase Service Key from environment variables across standard aliases.
 * @param {Record<string, string|undefined>} [env=process.env] - Environment object to query.
 * @returns {string} The detected service key or empty string.
 */
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
  // Fallback: scan all env values for 'sb_secret_' or 'SUPABASE' JWT tokens
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

const CHAT_INPUT_SELECTOR = 'rich-textarea div.ql-editor, div.ql-editor[contenteditable="true"], div[role="textbox"][contenteditable="true"], textarea';
const SEND_BUTTON_SELECTOR = 'button.send-button, button[aria-label*="Send"], button[aria-label*="Enviar"]';
const MODEL_RESPONSE_SELECTOR = 'model-response, .model-response-text, message-content, [data-message-author-role="model"]';

let typingLock = Promise.resolve();

/**
 * Builds the structured Campaign Master prompt for Gemini.
 * @param {Object} msg - The incoming transmission object.
 * @returns {string} The fully assembled prompt text.
 */
function buildDispatchPrompt(msg) {
  const channel = (msg.channel || 'alpha').toLowerCase();
  const otherChannel = channel === 'alpha' ? 'beta' : 'alpha';
  const sender = msg.sender || 'Unknown Sender';
  const question = msg.question || '';

  return [
    `[PRIVATE TERMINAL CONDUIT: ${channel.toUpperCase()} // SENDER:${sender}]`,
    `Transmission Payload:`,
    `${question}`,
    ``,
    `CAMPAIGN MASTER DIRECTIVES:`,
    `1. Reply in-character inside <DIRECT_REPLY>...</DIRECT_REPLY> tags. If this is a Master Post-Battle Dossier or Nemesis Dossier, christen custom in-universe Lore Names & Backstories for every attached unit Upgrade, Relic, and Battle Scar!`,
    `2. Update the relevant Notebook Markdown source (AGENT.md, NEMESIS.md, SHIP.md, or ${sender}'s Dossier.md) if this logs a permanent battle result, Nemesis, or Secret Objective code.`,
    `3. If deemed relevant, also include an <INTERCEPT>...</INTERCEPT> block with a cryptic, heavily redacted snippet (using [REDACTED]) for ${otherChannel.toUpperCase()}'s Interferences window.`
  ].join('\n');
}

/**
 * Parses raw Gemini output into direct reply and psychic intercept text.
 * @param {string} rawReply - Raw response from Gemini.
 * @returns {{ directReply: string, interceptText: string|null }}
 */
function parseGeminiReply(rawReply) {
  if (!rawReply || typeof rawReply !== 'string') {
    return { directReply: '', interceptText: null };
  }

  const directMatch = rawReply.match(/<DIRECT_REPLY>([\s\S]*?)<\/DIRECT_REPLY>/i);
  const interceptMatch = rawReply.match(/<INTERCEPT>([\s\S]*?)<\/INTERCEPT>/i);

  const directReply = (directMatch ? directMatch[1] : rawReply).trim();
  const interceptText = (interceptMatch && interceptMatch[1].trim()) ? interceptMatch[1].trim() : null;

  return { directReply, interceptText };
}

/**
 * Waits for Gemini's streaming output to reach steady-state.
 * @param {import('playwright').Page} page - Playwright page.
 * @param {number} prevResponseCount - Previous model response count.
 * @param {string} channelTag - Channel label for logging.
 * @param {Object} [options={}] - Optional tuning parameters.
 * @returns {Promise<string>} Stabilized response text.
 */
async function waitForGeminiReply(page, prevResponseCount, channelTag, options = {}) {
  const maxWaitMs = options.maxWaitMs || 95000;
  const checkIntervalMs = options.checkIntervalMs || 1300;
  const logFn = options.logFn || logGreen;
  const start = Date.now();

  // Wait for new model-response element to appear
  while (Date.now() - start < 35000) {
    const currentCount = await page.locator(MODEL_RESPONSE_SELECTOR).count();
    if (currentCount > prevResponseCount) break;
    await page.waitForTimeout(1000);
  }

  let lastText = '';
  let stableTicks = 0;

  // Poll until text stabilizes for 3 consecutive checks
  while (Date.now() - start < maxWaitMs) {
    await page.waitForTimeout(checkIntervalMs);
    const responses = page.locator(MODEL_RESPONSE_SELECTOR);
    const count = await responses.count();
    if (count === 0) continue;

    const currentText = (await responses.last().innerText().catch(() => '')).trim();

    if (currentText.length > 0 && currentText === lastText) {
      stableTicks++;
      if (stableTicks >= 3) {
        return currentText;
      }
    } else {
      lastText = currentText;
      stableTicks = 0;
    }
  }

  logFn(`[WARNING // ${channelTag}] Stream timeout reached; returning current text buffer.`);
  return lastText;
}

/**
 * Injects a single transmission into the target Gemini tab and captures the decree.
 * @param {Object} msg - Transmission record from Supabase.
 * @param {import('playwright').Page} targetPage - Target Playwright tab.
 * @param {Object} [options={}] - Dependency injection options.
 * @returns {Promise<boolean>} True if processed and answered successfully.
 */
async function processSingleMessage(msg, targetPage, options = {}) {
  const fetchFn = options.fetchFn || fetch;
  const supabaseUrl = options.supabaseUrl || SUPABASE_URL;
  const serviceKey = options.serviceKey || SERVICE_KEY;
  const logFn = options.logFn || logGreen;

  const isAlpha = msg.channel === 'alpha';
  const channelTag = isAlpha ? 'ALPHA // THE EXILE' : 'BETA // JUNEBUG';
  const otherChannel = isAlpha ? 'beta' : 'alpha';
  const originLabel = isAlpha
    ? 'LOWER DECKS VOX-BLEED (SANCTUARY OF ASH)'
    : 'RIVAL WARHOST VOX-BLEED (LORD COMMANDER JUNEBUG)';

  logFn(`\n[INCOMING TRANSMISSION -> ${channelTag}] ID: ${msg.id.slice(0, 8)} | From:${msg.sender}`);
  logFn(`   Payload: "${(msg.question || '').slice(0, 90)}..."`);

  const inputLocator = targetPage.locator(CHAT_INPUT_SELECTOR).first();
  try {
    await inputLocator.waitFor({ state: 'visible', timeout: 8000 });
  } catch (e) {
    logFn(`[WARNING // ${channelTag}] Chat input box not visible on tab (${targetPage.url()}). Retrying next cycle...`);
    return false;
  }

  const prevResponseCount = await targetPage.locator(MODEL_RESPONSE_SELECTOR).count();
  const prompt = buildDispatchPrompt(msg);

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
  }).catch(err => logFn(`[ERROR // ${channelTag}] Typing error: ${err.message}`)));

  logFn(`[DISPATCHED // ${channelTag}] Transmission injected into Gemini! Awaiting Campaign Master decree...`);

  const rawReply = await waitForGeminiReply(targetPage, prevResponseCount, channelTag, { logFn });

  if (!rawReply) {
    logFn(`[ERROR // ${channelTag}] Empty response captured. Keeping message in queue for retry.`);
    return false;
  }

  const { directReply, interceptText } = parseGeminiReply(rawReply);

  const headers = {
    'Content-Type': 'application/json',
    'apikey': serviceKey
  };

  try {
    const patchRes = await fetchFn(`${supabaseUrl}/rest/v1/vox_messages?id=eq.${msg.id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        reply: directReply,
        status: 'answered',
        answered_at: new Date().toISOString()
      })
    });

    if (!patchRes.ok) {
      logFn(`[ERROR // ${channelTag}] Failed to write reply to Supabase (${patchRes.status})`);
      return false;
    }
  } catch (err) {
    logFn(`[ERROR // ${channelTag}] Supabase PATCH network failure: ${err.message}`);
    return false;
  }

  if (interceptText) {
    try {
      await fetchFn(`${supabaseUrl}/rest/v1/vox_interferences`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          target_channel: otherChannel,
          origin_hint: originLabel,
          redacted_text: interceptText
        })
      });
      logFn(`[INTERCEPT // ${channelTag}] Redacted psychic bleed transmitted to ${otherChannel.toUpperCase()}!`);
    } catch (err) {
      logFn(`[WARNING // ${channelTag}] Intercept post error: ${err.message}`);
    }
  }

  logFn(`[DELIVERED // ${channelTag}] Campaign Master reply streamed to CRT terminal!`);
  return true;
}

/**
 * Fetches and processes all pending messages for a given channel queue.
 * @param {string} channelName - 'alpha' or 'beta'.
 * @param {import('playwright').Page} targetPage - Playwright page.
 * @param {Object} [options={}] - Options for testing or execution.
 * @returns {Promise<number>} Count of processed messages.
 */
async function drainChannelQueue(channelName, targetPage, options = {}) {
  const fetchFn = options.fetchFn || fetch;
  const supabaseUrl = options.supabaseUrl || SUPABASE_URL;
  const serviceKey = options.serviceKey !== undefined ? options.serviceKey : SERVICE_KEY;
  const logFn = options.logFn || logGreen;

  if (!serviceKey) {
    logFn(`[CONFIG WARNING // ${channelName.toUpperCase()}] SERVICE_KEY is missing! Set SUPABASE_SERVICE_ROLE_KEY in .env.`);
    return 0;
  }

  const headers = {
    'Content-Type': 'application/json',
    'apikey': serviceKey
  };

  let processedCount = 0;

  while (true) {
    let res;
    try {
      res = await fetchFn(
        `${supabaseUrl}/rest/v1/vox_messages?channel=eq.${channelName}&status=eq.pending&order=created_at.asc`,
        { headers }
      );
    } catch (err) {
      logFn(`[ERROR // ${channelName.toUpperCase()} QUEUE FETCH]: ${err.message}`);
      break;
    }

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      logFn(`[ERROR // ${channelName.toUpperCase()} QUEUE (${res.status})]: ${errText}`);
      break;
    }

    const queue = await res.json();
    if (!Array.isArray(queue) || queue.length === 0) {
      break;
    }

    logFn(`[QUEUE // ${channelName.toUpperCase()}] ${queue.length} pending transmission(s) detected in Supabase!`);

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

/**
 * Prints system diagnostics on startup.
 */
function logDiagnostics() {
  logGreen('----------------------------------------------------------------');
  logGreen('[SYSTEM DIAGNOSTICS // ASTROPATHIC COURIER]');
  logGreen(` -> SUPABASE_URL : ${SUPABASE_URL}`);
  logGreen(` -> SERVICE_KEY  : ${SERVICE_KEY ? `LOADED (${SERVICE_KEY.slice(0, 14)}...)` : 'MISSING! Check your .env file!'}`);
  logGreen(` -> TAB 1 (EXILE): ${ALPHA_THREAD_URL}`);
  logGreen(` -> TAB 2 (JUNE) : ${BETA_THREAD_URL}`);
  logGreen('----------------------------------------------------------------');
}

/**
 * Main daemon runner initializing Playwright and parallel channel polling.
 */
async function runDualThreadCourier() {
  logDiagnostics();

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

  const headers = {
    'Content-Type': 'application/json',
    'apikey': SERVICE_KEY
  };

  try {
    const initCheck = await fetch(`${SUPABASE_URL}/rest/v1/vox_messages?status=eq.pending&select=id,channel,sender`, { headers });
    const initData = await initCheck.json();
    logGreen('================================================================');
    logGreen('++ DUAL-CONDUIT PARALLEL BRIDGE ONLINE ++');
    logGreen(`++ Pending Transmissions in Supabase: ${Array.isArray(initData) ? initData.length : JSON.stringify(initData)}`);
    logGreen('================================================================');
  } catch (e) {
    logGreen(`[BOOT ERROR] Could not reach Supabase: ${e.message}`);
  }

  let busyAlpha = false;
  let busyBeta = false;

  const pollInterval = setInterval(() => {
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

  const shutdown = async () => {
    logGreen('\n[TERMINATING // ASTROPATHIC COURIER] Severing conduits and closing browser...');
    clearInterval(pollInterval);
    await context.close().catch(() => {});
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

module.exports = {
  resolveServiceKey,
  buildDispatchPrompt,
  parseGeminiReply,
  waitForGeminiReply,
  processSingleMessage,
  drainChannelQueue,
  logDiagnostics,
  runDualThreadCourier
};

if (require.main === module) {
  runDualThreadCourier().catch(err => {
    console.error('[FATAL // ASTROPATHIC COURIER]', err);
    process.exit(1);
  });
}