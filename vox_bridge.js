/**
 * Dual-Thread Concurrent Astropathic Courier Bridge (v6.3 - Thread Hydration Guard & Strict REF-ID Lock Edition)
 * - Strictly targets <model-response> (never user <message-content>)
 * - THREAD HYDRATION & DRIFT GUARD: Waits for existing <model-response> turns to mount on boot and snaps back
 *   to ALPHA_THREAD_URL / BETA_THREAD_URL if a tab ever drifts, preventing standalone chats outside the Notebook!
 * - STRICT REF-ID MATCHING: Never accepts a previous turn's <model-response>!
 * - ULTRA-LIGHT PROMPT: Leaves all formatting templates inside AGENT.md so the prompt never gets Gemini stuck!
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

function resolveThreadUrls(env = process.env) {
  return {
    alphaThreadUrl: (env && typeof env.ALPHA_THREAD_URL === 'string' ? env.ALPHA_THREAD_URL : '').trim(),
    betaThreadUrl: (env && typeof env.BETA_THREAD_URL === 'string' ? env.BETA_THREAD_URL : '').trim()
  };
}

const SUPABASE_URL = (process.env.SUPABASE_URL || 'https://dsfvhjjalexqpbzqoaqb.supabase.co').trim();
const SERVICE_KEY = resolveServiceKey();

const { alphaThreadUrl: ALPHA_THREAD_URL, betaThreadUrl: BETA_THREAD_URL } = resolveThreadUrls();

logGreen('----------------------------------------------------------------');
logGreen('[SYSTEM DIAGNOSTICS // ASTROPATHIC COURIER v6.3 THREAD-LOCKED]');
logGreen(` -> SUPABASE_URL : ${SUPABASE_URL}`);
logGreen(` -> SERVICE_KEY  : ${SERVICE_KEY ? `LOADED (${SERVICE_KEY.slice(0, 14)}...)` : 'MISSING! Check your .env file!'}`);
logGreen(` -> TAB 1 (EXILE): ${ALPHA_THREAD_URL || 'MISSING! Define ALPHA_THREAD_URL in .env'}`);
logGreen(` -> TAB 2 (JUNE) : ${BETA_THREAD_URL || 'MISSING! Define BETA_THREAD_URL in .env'}`);
logGreen('----------------------------------------------------------------');

const headers = {
  'Content-Type': 'application/json',
  'apikey': SERVICE_KEY
};

const CHAT_INPUT_SELECTOR = 'rich-textarea div.ql-editor, div.ql-editor[contenteditable="true"], div[role="textbox"][contenteditable="true"], textarea';
const SEND_BUTTON_SELECTOR = 'button.send-button, button[aria-label*="Send"], button[aria-label*="Enviar"]';
const MODEL_TURN_SELECTOR = 'model-response';

let typingLock = Promise.resolve();
const messageAttemptTracker = new Map();

function sanitizePlayerQueryForGemini(rawQuestion) {
  if (!rawQuestion || typeof rawQuestion !== 'string') return '';
  return rawQuestion.trim();
}

function isGeminiErrorBanner(text) {
  if (!text || typeof text !== 'string') return false;
  const trimmed = text.trim();
  if (trimmed.length < 450) {
    if (/seem to be encountering an error|try something else for you|hard time fulfilling|something else instead|não fui programado|só consigo gerar texto|encountered an error|doing what you asked|could you try again|something went wrong|try your request again|algo deu errado|tente novamente|ocorreu um erro|couldn't generate|não foi possível gerar/i.test(trimmed)) {
      return true;
    }
    if (/não (posso|consigo) (te )?ajudar|sou (apenas |só )?um modelo de linguagem|modelo de linguagem|não tenho (essas informações|capacidade)|i cannot help with that|i'm just a language model|as an ai|cannot fulfill this request/i.test(trimmed)) {
      return true;
    }
  }
  return false;
}

function isValidImperialDispatch(text) {
  if (!text || typeof text !== 'string') return false;
  if (isGeminiErrorBanner(text)) return false;
  const trimmed = text.trim();
  if (trimmed.length < 25) return false;
  return /<DIRECT_REPLY|\+{2,}\s*[A-Z0-9]|REF-ID\s*:/i.test(trimmed);
}

/**
 * Checks if a reply contains a DIFFERENT message's REF-ID (stale reply protection!).
 */
function hasMismatchedRefId(text, expectedShortId) {
  if (!text || !expectedShortId || expectedShortId === '00000000') return false;
  const match = text.match(/REF-ID\s*:\s*([a-f0-9]{8})/i);
  if (match && match[1]) {
    return match[1].toLowerCase() !== expectedShortId.toLowerCase();
  }
  return false;
}

function isToolLoadingBanner(text) {
  if (!text || typeof text !== 'string') return true;
  if (isGeminiErrorBanner(text)) return false;
  const trimmed = text.trim();
  if (trimmed.length < 95 && /conectando|connecting|thinking|pensando|analisando|searching|buscando|loading|carregando/i.test(trimmed)) {
    return true;
  }
  if (!isValidImperialDispatch(trimmed)) {
    return true;
  }
  return false;
}

async function clickGeminiRetryButton(page, channelTag, logFn = logGreen) {
  if (!page || typeof page.evaluate !== 'function') return false;
  try {
    const clicked = await page.evaluate(() => {
      const models = document.querySelectorAll('model-response');
      if (!models || models.length === 0) return false;
      const lastModel = models[models.length - 1];

      const buttons = Array.from(lastModel.querySelectorAll('button'));
      for (const btn of buttons) {
        const label = (
          (btn.getAttribute('aria-label') || '') + ' ' +
          (btn.getAttribute('mattooltip') || '') + ' ' +
          (btn.getAttribute('title') || '') + ' ' +
          (btn.textContent || '')
        ).toLowerCase();
        if (/retry|try again|regenerate|refresh|tentar|novamente|atualizar|replay/.test(label)) {
          btn.click();
          return true;
        }
        const icon = btn.querySelector('mat-icon, .google-symbols, .material-icons');
        if (icon && /refresh|replay|autorenew|sync/i.test(icon.textContent || '')) {
          btn.click();
          return true;
        }
      }

      if (buttons.length >= 3) {
        buttons[2].click();
        return true;
      }
      return false;
    });

    if (clicked) {
      logFn(`[SELF-HEAL // ${channelTag}] Clicked Gemini '↻' Retry button automatically!`);
      return true;
    }
  } catch (err) {
    logFn(`[WARNING // ${channelTag}] Could not click Retry button: ${err.message}`);
  }
  return false;
}

async function extractCleanLastModelResponse(page) {
  const raw = await page.evaluate((sel) => {
    const nodes = document.querySelectorAll(sel);
    if (!nodes || nodes.length === 0) return { count: 0, text: '' };
    const lastNode = nodes[nodes.length - 1];
    const clone = lastNode.cloneNode(true);

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
      'model-thoughts',
      '.code-block-decoration',
      '.code-block-header',
      '.code-header',
      '[class*="code-block-header"]',
      'button[aria-label*="Copy"]',
      'button[aria-label*="Copiar"]',
      '.sr-only',
      '.visually-hidden',
      '.cdk-visually-hidden'
    ];
    junkSelectors.forEach(s => {
      clone.querySelectorAll(s).forEach(el => el.remove());
    });

    clone.querySelectorAll('button, span, a, div, h1, h2, h3, h4, p').forEach(el => {
      if (el.children.length === 0) {
        const t = (el.textContent || '').trim();
        if (/^(MD|\+\s*\d+|O Gemini disse:?|Gemini said:?|Plaintext|Texto simples|Text|Markdown|Copy code|Copiar código)$/i.test(t)) {
          el.remove();
        }
      }
    });

    clone.querySelectorAll('br').forEach(br => {
      br.replaceWith('\n');
    });

    clone.querySelectorAll('li').forEach(li => {
      // Unwrap inner <p> tags inside <li> so bullets never split onto an empty line!
      li.querySelectorAll('p').forEach(p => {
        p.replaceWith(...p.childNodes);
      });
      li.prepend('\n• ');
      li.append('\n');
    });

    clone.querySelectorAll('p, h1, h2, h3, h4, h5, h6, pre, blockquote, hr, tr').forEach(block => {
      if (block.tagName === 'P' && block.closest('li')) return;
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

function scrubArtifacts(str) {
  if (!str) return '';
  return str
    .replace(/^\s*(?:O Gemini disse|Gemini said)\s*:?\s*/gi, '')
    .replace(/\[cite:\s*[\d,\s]+\]/gi, '')
    .replace(/[ \t]*\bMD\b(?:\s*\+\s*\d+)?/g, '')
    .replace(/^\s*\+\s*\d+\s*$/gm, '')
    .replace(/^\s*(?:Plaintext|Texto simples|Text|Markdown|Copy code|Copiar código)\s*$/gim, '')
    .replace(/<\/?(?:DIRECT_REPLY|INTERCEPT)[^>]*>/gi, '')
    .replace(/(\+{3})([A-Za-z\[])/g, '$1\n\n$2')
    .replace(/([.!?])\s*(\+{3})/g, '$1\n\n$2')
    .replace(/([.!?])\s*(\[[A-Z0-9\s&//\-_]+\]:)/g, '$1\n\n$2')
    .replace(/([^\n])\s*(•\s+)/g, '$1\n$2')
    .replace(/•\s*\n+\s*/g, '• ')
    .replace(/•\s*[•\-*]\s*/g, '• ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function waitForBulletproofReply(page, prevState, msgShortId, channelTag) {
  const maxWaitMs = 150000;
  const start = Date.now();

  logGreen(`[WAITING // ${channelTag}] Waiting for new <model-response> with REF-ID ${msgShortId} (Previous count:${prevState.count})...`);

  let newResponseStarted = false;
  while (Date.now() - start < 80000) {
    await page.waitForTimeout(1000);
    const curr = await extractCleanLastModelResponse(page);

    if (!curr.text || curr.text === prevState.text) continue;
    if (hasMismatchedRefId(curr.text, msgShortId)) continue;

    if (curr.count > prevState.count && curr.text.length > 5) {
      newResponseStarted = true;
      break;
    }
    if (curr.text.includes(msgShortId)) {
      newResponseStarted = true;
      break;
    }
  }

  if (!newResponseStarted) {
    logGreen(`[WARNING // ${channelTag}] No new <model-response> for REF-ID ${msgShortId} detected within 45s! Aborting to prevent stale read.`);
    return '';
  }

  let lastText = '';
  let stableTicks = 0;

  while (Date.now() - start < maxWaitMs) {
    await page.waitForTimeout(1300);
    const curr = await extractCleanLastModelResponse(page);
    const text = curr.text;

    if (!text || text === prevState.text) continue;

    if (hasMismatchedRefId(text, msgShortId)) {
      stableTicks = 0;
      continue;
    }

    if (isGeminiErrorBanner(text)) {
      logGreen(`[ERROR/REFUSAL BLOCKED // ${channelTag}] Gemini output: "${text.slice(0, 80)}"`);
      return '__GEMINI_REFUSAL__';
    }

    if (isToolLoadingBanner(text)) {
      logGreen(`[WAITING // ${channelTag}] Gemini is reading Notebook ("${text.slice(0, 38)}")...`);
      stableTicks = 0;
      lastText = text;
      continue;
    }

    const hasEndBanner = /\+{2,}\s*(?:END COGITATOR|TRANSMISSION|LEDGER INSCRIBED|WARRANT SEALED)/i.test(text) || /<\/DIRECT_REPLY>/i.test(text);

    if (text === lastText && isValidImperialDispatch(text)) {
      stableTicks++;
      if ((hasEndBanner && stableTicks >= 2) || stableTicks >= 4) {
        return text;
      }
    } else {
      lastText = text;
      stableTicks = 0;
    }
  }

  if (!isValidImperialDispatch(lastText) || hasMismatchedRefId(lastText, msgShortId)) {
    logGreen(`[WARNING // ${channelTag}] Stream timed out or had mismatched REF-ID. Rejecting capture.`);
    return '';
  }

  logGreen(`[WARNING // ${channelTag}] Stream max wait reached; returning verified text.`);
  return lastText;
}

async function typeAndSendPrompt(targetPage, inputLocator, promptText, channelTag) {
  await (typingLock = typingLock.then(async () => {
    await targetPage.bringToFront();
    await targetPage.waitForTimeout(200);
    await inputLocator.click({ force: true });
    await targetPage.waitForTimeout(120);

    await targetPage.keyboard.press('Control+A');
    await targetPage.keyboard.press('Backspace');
    await targetPage.keyboard.insertText(promptText);
    await targetPage.waitForTimeout(300);

    const sendBtn = targetPage.locator(SEND_BUTTON_SELECTOR).first();
    if (await sendBtn.count() > 0 && await sendBtn.isEnabled().catch(() => false)) {
      await sendBtn.click();
    } else {
      await targetPage.keyboard.press('Enter');
    }
    await targetPage.waitForTimeout(250);
  }).catch(err => logGreen(`[ERROR // ${channelTag}] Typing error:${err.message}`)));
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

  logFn(`\n[INCOMING TRANSMISSION -> ${channelTag}] MSG_ID: ${msgShortId} | From:${msg.sender || 'Unknown'}`);
  logFn(`   Payload: "${(msg.question || '').slice(0, 90)}..."`);

  // THREAD DRIFT GUARD: Ensure the browser tab is still on the configured Notebook chat URL before typing!
  const expectedUrl = isAlpha ? ALPHA_THREAD_URL : BETA_THREAD_URL;
  if (expectedUrl && typeof targetPage.goto === 'function' && typeof targetPage.url === 'function') {
    const currentUrl = targetPage.url();
    const expectedId = expectedUrl.split('/').filter(Boolean).pop();
    if (expectedId && currentUrl !== 'https://gemini.google.com/test' && !currentUrl.includes(expectedId)) {
      logFn(`[THREAD GUARD // ${channelTag}] Tab drifted to ${currentUrl} — snapping back to ${expectedUrl}...`);
      await targetPage.goto(expectedUrl, { waitUntil: 'domcontentloaded' });
      if (typeof targetPage.waitForSelector === 'function') {
        await targetPage.waitForSelector(MODEL_TURN_SELECTOR, { timeout: 15000 }).catch(() => { });
      }
      if (typeof targetPage.waitForTimeout === 'function') {
        await targetPage.waitForTimeout(1500);
      }
    }
  }

  const inputLocator = targetPage.locator(CHAT_INPUT_SELECTOR).first();
  try {
    await inputLocator.waitFor({ state: 'visible', timeout: 8000 });
  } catch (e) {
    logFn(`[WARNING // ${channelTag}] Chat input box not visible on tab. Retrying next cycle...`);
    return false;
  }

  const rawQ = msg.question || '';
  let prevState = await extractCleanLastModelResponse(targetPage);

  let rawReply;

  // LATE-ARRIVAL CATCHER: Only captures if the screen ALREADY shows this exact msgShortId!
  if (prevState.text && prevState.text.includes(msgShortId) && !hasMismatchedRefId(prevState.text, msgShortId) && isValidImperialDispatch(prevState.text)) {
    logFn(`[LATE-ARRIVAL CAPTURED // ${channelTag}] Found completed reply for MSG_ID ${msgShortId} already on screen! Forwarding to Supabase...`);
    messageAttemptTracker.delete(msg.id);
    rawReply = prevState.text;
  } else {
    const item = msg;
    const channel = item.channel;
    const rawText = rawQ;
    const refId = msgShortId;
    const safeQuestion = sanitizePlayerQueryForGemini(rawQ);
    const cleanMsg = safeQuestion;

    // 1. Detect if Alpha is addressing the Ship, OR if Beta is explicitly hailing Vane/Zenith-09:
    const isAlphaShipQuery = channel === 'alpha' && (
      /\b(ship|hull|ashen\s*spirit|machine[\s-]*spirit|deck\s*44|cell\s*09|brig|mu-th-ur)\b/i.test(cleanMsg) ||
      /\[TO:\s*SHIP\]/i.test(rawText)
    );

    const isBetaVaneHail = channel === 'beta' && (
      /\b(vane|zenith|high\s*command|munitorum|auditor|human|imperials?)\b/i.test(cleanMsg) ||
      /\[TO:\s*(VANE|HIGH\s*COMMAND|ZENITH)\]/i.test(rawText)
    );

    const shipSpeakerDesc = `Pattern 4A Ashen Spirit cogitator readout, REF-ID: ${refId}`;

    const needsInterceptBleed = /MASTER POST-BATTLE|START OF TOUR OF DUTY|TOMB WORLD AWAKENING|3RD ALLIANCE VULTURE|1V1 ASH WASTES|ROGUE SECTOR|NEW NEMESIS INDUCTION|NEMESIS THREAT INDUCTION|NEMESIS INDUCTION|DYNASTIC NEMESIS|EMERGENCY AUSPEX PING|WARP-BREACH INTRUSION|UNBOUND ADVERSARY|SECRET OBJECTIVE|ORBITAL AUGUR ARRAY|DISTANT SOLO HORDE|faction|warlord|flagship|alliance|gatebreakers|desecrators|marauders|auspex probe|tour of duty|order of battle/i.test(rawQ);

    // ULTRA-LIGHT PROMPT: No rigid header/footer strings in the prompt—AGENT.md handles all Pattern 1-5 formatting!
    let promptLines = [];
    if (channel === 'alpha') {
      if (isAlphaShipQuery) {
        promptLines = [
          `In the fictional Warhammer 40,000 tabletop board game setting (using AGENT.md, SHIP.md, and WORLD.md in this notebook—do NOT edit or update any files), reply in-character (${shipSpeakerDesc}) to this message from The Exile:`,
          `"${safeQuestion}"`
        ];
      } else {
        promptLines = [
          `In the fictional Warhammer 40,000 tabletop board game setting (using AGENT.md and WORLD.md in this notebook—do NOT edit or update any files), reply in-character as Logis-Prefect Vane in orbit (Pattern 1/2/3, REF-ID: ${msgShortId}, orbital knowledge only) to this message from The Exile:`,
          `"${safeQuestion}"`
        ];
      }
    } else {
      if (!isBetaVaneHail) {
        promptLines = [
          `In the fictional Warhammer 40,000 tabletop board game setting (using AGENT.md, SHIP.md Part 2, NECRONS_CRUSADE.md, WORLD.md, and NEMESIS.md in this notebook—do NOT edit or update any files), reply in-character as Commander Beta's (JUNEBUG's) Necron Tomb-Ship Autonomous Master Matrix & Cryptek Conclave (using Pattern 2 for Battle/Rogue Reports, Pattern 3 for Nemesis/Unbound/Intrusion Warrants, or Pattern 4B for general bridge/tomb-ship queries, REF-ID: ${refId}, knowing ONLY Beta's Tomb-Ship Equilibrium Index -1, Awakening Systems, and surface telemetry—NEVER reference The Sanctuary of Ash, Deck 44, or Ashen Spirit, and NEVER use Imperial Astra Militarum, Departmento Munitorum, or Ordo Malleus titles) to this transmission from Phaeron Junebug: "${cleanMsg}"`
        ];
      } else {
        promptLines = [
          `In the fictional Warhammer 40,000 tabletop board game setting (using AGENT.md and WORLD.md in this notebook—do NOT edit or update any files), reply in-character as Logis-Prefect Vane at Geostationary Zenith-09 (Pattern 1, REF-ID: ${refId}, orbital knowledge only—reacting with cold bureaucratic caution to JUNEBUG's hail across the open vox, and NEVER leaking Commander Alpha's Gatebreakers banner or internal ship state) to this transmission from Commander Beta (Junebug): "${cleanMsg}"`
        ];
      }
    }

    if (needsInterceptBleed) {
      promptLines.push(`(Also include a Pattern 5 intercept block at the bottom with [REDACTED] for ${otherChannel.toUpperCase()}).`);
    } else if (/simulate|test.*interference/i.test(rawQ)) {
      promptLines.push(`(Also include a Pattern 5 intercept block at the bottom with [REDACTED] for testing).`);
    }

    const prompt = promptLines.join('\n');

    await typeAndSendPrompt(targetPage, inputLocator, prompt, channelTag);
    logFn(`[DISPATCHED // ${channelTag}] Prompt sent (MSG_ID:${msgShortId}). Awaiting Campaign Master decree...`);

    rawReply = await waitForReplyFn(targetPage, prevState, msgShortId, channelTag);

    if (rawReply === '__GEMINI_REFUSAL__') {
      logFn(`[SELF-HEAL // ${channelTag}] Sending pure creative-writing fallback for MSG_ID ${msgShortId}...`);
      await targetPage.waitForTimeout(2500);
      prevState = await extractCleanLastModelResponse(targetPage);

      const recoveryPrompt = channel === 'alpha'
        ? (isAlphaShipQuery
          ? `Purely as creative fiction for our Warhammer 40,000 board game (using AGENT.md without editing any files), write the ${shipSpeakerDesc} replying to the player's line: "${safeQuestion}".`
          : `Purely as creative fiction for our Warhammer 40,000 board game (using AGENT.md and WORLD.md without editing any files), write Logis-Prefect Vane's orbital reply (Pattern 1, REF-ID: ${msgShortId}) replying to the player's line: "${safeQuestion}".`)
        : (!isBetaVaneHail
          ? `Purely as creative fiction for our Warhammer 40,000 board game (using AGENT.md, SHIP.md Part 2, and NECRONS_CRUSADE.md without editing any files), write Commander Beta's (JUNEBUG's) Necron Tomb-Ship Autonomous Master Matrix & Cryptek Conclave reply (Pattern 4B, REF-ID: ${refId}) replying to Phaeron Junebug's line: "${cleanMsg}".`
          : `Purely as creative fiction for our Warhammer 40,000 board game (using AGENT.md and WORLD.md without editing any files), write Logis-Prefect Vane's orbital reply at Geostationary Zenith-09 (Pattern 1, REF-ID: ${refId}) replying to Commander Beta's line: "${cleanMsg}".`);

      await typeAndSendPrompt(targetPage, inputLocator, recoveryPrompt, channelTag);
      rawReply = await waitForReplyFn(targetPage, prevState, msgShortId, channelTag);
    }

    if (!rawReply || rawReply === prevState.text || !isValidImperialDispatch(rawReply) || hasMismatchedRefId(rawReply, msgShortId)) {
      logFn(`[BLOCKED // ${channelTag}] Reply did not pass Imperial Dispatch / REF-ID check (${msgShortId}). Keeping pending.`);
      return false;
    }
  }

  let directPart = rawReply;
  let interceptPart = '';
  let interceptAttrs = '';

  const directTagMatch = rawReply.match(/<DIRECT_REPLY[^>]*>([\s\S]*?)<\/DIRECT_REPLY>/i);
  const interceptTagMatch =
    rawReply.match(/<INTERCEPT([^>]*)>([\s\S]*?)<\/INTERCEPT>/i) ||
    rawReply.match(/<\/DIRECT_REPLY>\s*([\s\S]*?)<\/INTERCEPT>/i);

  if (directTagMatch) {
    directPart = directTagMatch[1];
  }
  if (interceptTagMatch) {
    interceptAttrs = (interceptTagMatch[2] !== undefined ? interceptTagMatch[1] : '') || '';
    interceptPart = interceptTagMatch[2] !== undefined ? interceptTagMatch[2] : interceptTagMatch[1];
  } else {
    const splitIdx = directPart.search(/(?:Plaintext\s*\n+)?\+{2,}\s*(?:PASSIVE\s+)?(?:ASTROPATHIC\s+)?(?:CHOIR\s+)?INTERCEPT/i);
    if (splitIdx > 20) {
      interceptPart = directPart.slice(splitIdx).replace(/^\s*Plaintext\s*/i, '');
      directPart = directPart.slice(0, splitIdx);
    }
  }

  const finalDirectReply = scrubArtifacts(directPart);

  if (isGeminiErrorBanner(finalDirectReply) || !isValidImperialDispatch(finalDirectReply) || hasMismatchedRefId(finalDirectReply, msgShortId)) {
    logFn(`[BLOCKED // ${channelTag}] Extracted body failed validation or had mismatched REF-ID. Keeping MSG_ID ${msgShortId} pending.`);
    return false;
  }

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

  if (interceptPart && interceptPart.trim()) {
    const cleanIntercept = scrubArtifacts(interceptPart);
    const isDualBroadcast = /ROGUE SECTOR AUXILIARY BATTLE REPORT|ORBITAL AUGUR ARRAY|DISTANT SOLO HORDE|DISTANT WARP-BREACH|DISTANT ADVERSARY|DISTANT INTERCEPT/i.test(rawQ);

    const isSelfTest =
      /simulate|test.*interference/i.test(rawQ) ||
      /target=["']?(self|same)/i.test(interceptAttrs);

    let destChannel = isSelfTest ? msg.channel : otherChannel;
    if (/target=["']?alpha/i.test(interceptAttrs)) destChannel = 'alpha';
    if (/target=["']?beta/i.test(interceptAttrs)) destChannel = 'beta';

    const targetChannels = isDualBroadcast ? ['alpha', 'beta'] : [destChannel];

    const destOriginLabel = isDualBroadcast
      ? 'ORBITAL AUGUR ARRAY // PARALLEL SECTOR EVENT'
      : (isSelfTest
        ? 'ASHEN SPIRIT SYNTHETIC BLEED TEST // DECK 44 LOOPBACK'
        : originLabel);

    for (const targetCh of targetChannels) {
      await fetchFn(`${supabaseUrl}/rest/v1/vox_interferences`, {
        method: 'POST',
        headers: reqHeaders,
        body: JSON.stringify({
          target_channel: targetCh,
          origin_hint: destOriginLabel,
          redacted_text: cleanIntercept
        })
      });
    }
    logFn(`[INTERCEPT BLEED ROUTED // ${channelTag}] -> ${targetChannels.join(' & ').toUpperCase()}!`);
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

const DEFAULT_ANON_KEY = 'sb_publishable_R3wXKsK7Gl54-8BNCauUNg_NIoosOOO';

/**
 * Publishes the live Astropathic Courier server status ('online' or 'offline')
 * to Supabase's shared state (`nemesis_status.vox_server_heartbeat`) while preserving
 * all existing `horde_pool` and `nemesis_status` properties.
 *
 * @param {'online'|'offline'} status - Current server status
 * @param {object} [options] - Optional overrides for testing
 * @returns {Promise<boolean>} True if heartbeat was saved to Supabase
 */
async function publishServerHeartbeat(status = 'online', options = {}) {
  const fetchFn = options.fetchFn || (typeof fetch === 'function' ? fetch : null);
  if (!fetchFn) return false;

  const supabaseUrl = options.supabaseUrl || SUPABASE_URL;
  const anonKey = options.anonKey || DEFAULT_ANON_KEY;
  const rpcHeaders = {
    'Content-Type': 'application/json',
    'apikey': anonKey,
    'Authorization': `Bearer ${anonKey}`
  };

  try {
    let currentHordePool = null;
    let currentNemesisStatus = {};

    const getRes = await fetchFn(`${supabaseUrl}/rest/v1/rpc/get_shared_spawn_pools`, {
      method: 'POST',
      headers: rpcHeaders,
      body: JSON.stringify({})
    });
    if (getRes && getRes.ok) {
      const cur = await getRes.json();
      if (cur) {
        currentHordePool = (cur.horde_pool && typeof cur.horde_pool === 'object' && Object.keys(cur.horde_pool).length > 0)
          ? cur.horde_pool
          : null;
        currentNemesisStatus = cur.nemesis_status || {};
      }
    }

    const nextHeartbeat = {
      status: status === 'offline' ? 'offline' : 'online',
      updatedAt: Date.now()
    };

    const saveRes = await fetchFn(`${supabaseUrl}/rest/v1/rpc/save_shared_spawn_pools`, {
      method: 'POST',
      headers: rpcHeaders,
      body: JSON.stringify({
        p_horde_pool: currentHordePool,
        p_nemesis_status: {
          ...currentNemesisStatus,
          vox_server_heartbeat: nextHeartbeat
        }
      })
    });

    return Boolean(saveRes && saveRes.ok);
  } catch (e) {
    return false;
  }
}

async function runDualThreadCourier({ env = process.env, logFn = logGreen } = {}) {
  const { alphaThreadUrl, betaThreadUrl } = resolveThreadUrls(env);

  if (!alphaThreadUrl || !betaThreadUrl) {
    logFn('[FATAL ERROR] ALPHA_THREAD_URL and BETA_THREAD_URL must be defined in your .env file!');
    return false;
  }

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
  await alphaPage.goto(alphaThreadUrl, { waitUntil: 'domcontentloaded' });
  if (typeof alphaPage.waitForSelector === 'function') {
    await alphaPage.waitForSelector(MODEL_TURN_SELECTOR, { timeout: 20000 }).catch(() => { });
  }
  if (typeof alphaPage.waitForTimeout === 'function') {
    await alphaPage.waitForTimeout(2000);
  }

  const betaPage = await context.newPage();
  logGreen('>> Opening Tab 2 (Commander Beta // JUNEBUG)...');
  await betaPage.goto(betaThreadUrl, { waitUntil: 'domcontentloaded' });
  if (typeof betaPage.waitForSelector === 'function') {
    await betaPage.waitForSelector(MODEL_TURN_SELECTOR, { timeout: 20000 }).catch(() => { });
  }
  if (typeof betaPage.waitForTimeout === 'function') {
    await betaPage.waitForTimeout(2000);
  }

  try {
    const initCheck = await fetch(`${SUPABASE_URL}/rest/v1/vox_messages?status=eq.pending&select=id,channel,sender`, { headers });
    const initData = await initCheck.json();
    await publishServerHeartbeat('online');
    logGreen('================================================================');
    logGreen('++ DUAL-CONDUIT PARALLEL BRIDGE v6.3 (THREAD-LOCKED) ONLINE ++');
    logGreen(`++ Pending Transmissions in Supabase: ${Array.isArray(initData) ? initData.length : JSON.stringify(initData)}`);
    logGreen('================================================================');
  } catch (e) {
    logGreen(`[BOOT ERROR] Could not reach Supabase: ${e.message}`);
  }

  let shuttingDown = false;
  const handleShutdown = async () => {
    if (shuttingDown) return;
    shuttingDown = true;
    logGreen('\n[SHUTDOWN] Marking Astropathic Courier Server OFFLINE in Supabase...');
    await publishServerHeartbeat('offline').catch(() => {});
    process.exit(0);
  };
  process.once('SIGINT', handleShutdown);
  process.once('SIGTERM', handleShutdown);
  process.once('SIGHUP', handleShutdown);
  process.once('SIGBREAK', handleShutdown);
  if (typeof context.on === 'function') context.on('close', handleShutdown);
  if (typeof alphaPage.on === 'function') alphaPage.on('close', handleShutdown);
  if (typeof betaPage.on === 'function') betaPage.on('close', handleShutdown);

  let busyAlpha = false;
  let busyBeta = false;
  let heartbeatTick = 0;

  setInterval(() => {
    if (shuttingDown) return;
    heartbeatTick = (heartbeatTick + 1) % 2;
    if (heartbeatTick === 0) {
      publishServerHeartbeat('online').catch(() => {});
    }

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
  resolveThreadUrls,
  sanitizePlayerQueryForGemini,
  scrubArtifacts,
  isGeminiErrorBanner,
  isValidImperialDispatch,
  hasMismatchedRefId,
  isToolLoadingBanner,
  clickGeminiRetryButton,
  extractCleanLastModelResponse,
  waitForBulletproofReply,
  processSingleMessage,
  drainChannelQueue,
  runDualThreadCourier,
  publishServerHeartbeat,
  messageAttemptTracker
};

if (require.main === module) {
  runDualThreadCourier().catch(err => {
    console.error('[FATAL // ASTROPATHIC COURIER]', err);
    process.exit(1);
  });
}