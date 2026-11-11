# 📦 Fires of Armageddon // Bundle: Astropathic Courier Bridge (Part 1: Config, Scrubbers & Persona Routing)

Thread URL partitioning, response artifact scrubbers, and Commander Alpha/Beta/Gamma persona routing (`vox_bridge.js` lines 1 to 525).

## 📑 Table of Contents
- [vox_bridge.js (Part 1: Config, Scrubbers & Persona Routing, Lines 1-525)](#file-voxbridgejspart1configscrubberspersonaroutinglines1525)

---

## File: `vox_bridge.js (Part 1: Config, Scrubbers & Persona Routing, Lines 1-525)` <a id="file-voxbridgejspart1configscrubberspersonaroutinglines1525"></a>

````javascript
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

function isTacticaEnvKey(key) {
  return /^(?:TACTICA|LCT_TACTICA)(?:_|$)/i.test(String(key || '').trim());
}

function resolveThreadUrls(env = process.env) {
  const safeEnv = env && typeof env === 'object' ? env : {};
  const tacticaExcluded = [
    safeEnv.TACTICA_THREAD_URL,
    safeEnv.TACTICA_DAEMON_THREAD_URL,
    safeEnv.TACTICA_DAEMON_URL
  ]
    .map((v) => (typeof v === 'string' ? v.trim() : ''))
    .find(Boolean) || '';

  const sanitizeVoxUrl = (val) => {
    const trimmed = typeof val === 'string' ? val.trim() : '';
    if (!trimmed) return '';
    if (tacticaExcluded && trimmed === tacticaExcluded) return '';
    return trimmed;
  };

  const alpha = sanitizeVoxUrl(safeEnv.ALPHA_THREAD_URL);
  const beta = sanitizeVoxUrl(safeEnv.BETA_THREAD_URL);
  const gamma = sanitizeVoxUrl(safeEnv.GAMMA_THREAD_URL);

  const allVoxThreadUrls = {};
  if (alpha) allVoxThreadUrls.alpha = alpha;
  if (beta) allVoxThreadUrls.beta = beta;
  if (gamma) allVoxThreadUrls.gamma = gamma;

  const extraThreadUrls = [];
  for (const [key, rawVal] of Object.entries(safeEnv)) {
    if (!/_THREAD_URL$/i.test(key)) continue;
    if (isTacticaEnvKey(key)) continue;
    if (/^(?:ALPHA|BETA|GAMMA)_THREAD_URL$/i.test(key)) continue;
    const cleaned = sanitizeVoxUrl(rawVal);
    if (!cleaned) continue;
    const channel = key.replace(/_THREAD_URL$/i, '').toLowerCase();
    allVoxThreadUrls[channel] = cleaned;
    extraThreadUrls.push({ channel, envKey: key, url: cleaned });
  }

  return {
    alphaThreadUrl: alpha,
    betaThreadUrl: beta,
    gammaThreadUrl: gamma,
    alphaUrl: alpha,
    betaUrl: beta,
    gammaUrl: gamma,
    extraThreadUrls,
    allVoxThreadUrls
  };
}

/**
 * Pure helper: resolves the dedicated Chromium persistent profile directory for Vox Autopilot,
 * strictly isolated from `chrome_tactica_profile` so both terminals can run simultaneously.
 *
 * @param {object} [env=process.env] - Environment dictionary.
 * @param {string} [baseDir=__dirname] - Base directory for relative profile folder resolution.
 * @returns {string} Absolute path to Vox Autopilot's dedicated Chromium user-data-dir.
 */
function resolveVoxProfileDir(env = process.env, baseDir = __dirname) {
  const defaultDir = path.join(baseDir, 'chrome_vox_profile');
  const tacticaDir = path.resolve(baseDir, 'chrome_tactica_profile');
  const raw = env && typeof env.VOX_PROFILE_DIR === 'string' ? env.VOX_PROFILE_DIR.trim() : '';
  if (!raw) return defaultDir;
  const resolved = path.resolve(baseDir, raw);
  if (
    resolved.toLowerCase() === tacticaDir.toLowerCase() ||
    path.basename(resolved).toLowerCase() === 'chrome_tactica_profile'
  ) {
    return defaultDir;
  }
  return resolved;
}

const SUPABASE_URL = (process.env.SUPABASE_URL || 'https://dsfvhjjalexqpbzqoaqb.supabase.co').trim();
const SERVICE_KEY = resolveServiceKey();

const {
  alphaThreadUrl: ALPHA_THREAD_URL,
  betaThreadUrl: BETA_THREAD_URL,
  gammaThreadUrl: GAMMA_THREAD_URL,
  extraThreadUrls: EXTRA_THREAD_URLS
} = resolveThreadUrls();

logGreen('----------------------------------------------------------------');
logGreen('[SYSTEM DIAGNOSTICS // ASTROPATHIC COURIER v6.3 THREAD-LOCKED]');
logGreen(` -> SUPABASE_URL : ${SUPABASE_URL}`);
logGreen(` -> SERVICE_KEY  : ${SERVICE_KEY ? `LOADED (${SERVICE_KEY.slice(0, 14)}...)` : 'MISSING! Check your .env file!'}`);
logGreen(` -> TAB 1 (EXILE): ${ALPHA_THREAD_URL || 'MISSING! Define ALPHA_THREAD_URL in .env'}`);
logGreen(` -> TAB 2 (JUNE) : ${BETA_THREAD_URL || 'MISSING! Define BETA_THREAD_URL in .env'}`);
logGreen(` -> TAB 3 (KÂHL) : ${GAMMA_THREAD_URL || (ALPHA_THREAD_URL ? `${ALPHA_THREAD_URL} (Sharing ALPHA)` : 'MISSING! Define GAMMA_THREAD_URL in .env')}`);
EXTRA_THREAD_URLS.forEach((ext, idx) => {
  logGreen(` -> TAB ${idx + 4} (${ext.channel.toUpperCase()}): ${ext.url}`);
});
if (process.env.TACTICA_THREAD_URL) {
  logGreen(' -> TACTICA_THREAD_URL: EXCLUDED (reserved strictly for tactica_daemon)');
}
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

/**
 * Routes speaker persona, pattern formatting, and prompt prefix based on channel.
 *
 * @param {'alpha'|'beta'|'gamma'} channel - Broadcast conduit
 * @param {string} content - Raw player message/dossier
 * @param {string} refId - 8-character message identifier
 * @returns {object} { speaker, pattern, allowIntercept, promptPrefix }
 */
function routeSpeakerPersona(channel, content, refId = '00000000') {
  const isBattleDossier = /MASTER POST-BATTLE|BATTLE DOSSIER|TOUR OF DUTY|HARVEST/i.test(content || '');
  const isThreatPing = /NEMESIS|THREAT|UNBOUND|WARRANT/i.test(content || '');

  if (channel === 'gamma') {
    return {
      speaker: 'FANE_NODE_VOL_09',
      pattern: isBattleDossier ? 'Pattern 2 (Thrymkâl Black-Ledger Audit)'
               : (isThreatPing ? 'Pattern 3 (Seismic Grudge-Warrant)' : 'Pattern 4C (Fane-Node Vôl-09 Readout)'),
      allowIntercept: false, // 100% Black-Ledger Silence — NEVER emit Pattern 5!
      promptPrefix: `In the fictional Warhammer 40,000 tabletop board game setting (using AGENT.md, Commander Omega - The Ledger of Embers (Story, Roster & Acquisitions Ledger).md, LEAGUES_OF_VOTANN_CRUSADE.md, NEMESIS.md, and WORLD.md in this notebook—do NOT edit or update any files), reply in-character on channel=gamma as Fane-Node Vôl-09 ("The Deaf Ear") and the Thrymkâl Brôkhyr Appraisal Guild aboard The Ledger of Embers (Pattern 4C / Pattern 2 / Pattern 3, REF-ID: ${refId}, Black-Ledger Protocol — DO NOT include any Pattern 5 intercept block) to this message from Force Warlord Kâhl Hârkyn: `
    };
  }

  const isAlpha = channel === 'alpha';
  const isAlphaShipQuery = isAlpha && (
    /\b(ship|hull|ashen\s*spirit|machine[\s-]*spirit|deck\s*44|cell\s*09|brig|mu-th-ur)\b/i.test(content || '') ||
    /\[TO:\s*SHIP\]/i.test(content || '')
  );

  const isBetaVaneHail = channel === 'beta' && (
    /\b(vane|zenith|high\s*command|munitorum|auditor|human|imperials?)\b/i.test(content || '') ||
    /\[TO:\s*(VANE|HIGH\s*COMMAND|ZENITH)\]/i.test(content || '')
  );

  if (isAlpha) {
    if (isAlphaShipQuery) {
      return {
        speaker: 'ASHEN_SPIRIT',
        pattern: 'Pattern 4A',
        allowIntercept: true,
        promptPrefix: `In the fictional Warhammer 40,000 tabletop board game setting (using AGENT.md, SHIP.md, and WORLD.md in this notebook—do NOT edit or update any files), reply in-character (Pattern 4A Ashen Spirit cogitator readout, REF-ID: ${refId}) to this message from The Exile:`
      };
    }
    return {
      speaker: 'LOGIS_VANE',
      pattern: 'Pattern 1/2/3',
      allowIntercept: true,
      promptPrefix: `In the fictional Warhammer 40,000 tabletop board game setting (using AGENT.md and WORLD.md in this notebook—do NOT edit or update any files), reply in-character as Logis-Prefect Vane in orbit (Pattern 1/2/3, REF-ID: ${refId}, orbital knowledge only) to this message from The Exile:`
    };
  }

  // Beta
  if (!isBetaVaneHail) {
    return {
      speaker: 'NECRON_MASTER_MATRIX',
      pattern: 'Pattern 2/3/4B',
      allowIntercept: true,
      promptPrefix: `In the fictional Warhammer 40,000 tabletop board game setting (using AGENT.md, SHIP.md Part 2, NECRONS_CRUSADE.md, WORLD.md, and NEMESIS.md in this notebook—do NOT edit or update any files), reply in-character as Commander Beta's (JUNEBUG's) Necron Tomb-Ship Autonomous Master Matrix & Cryptek Conclave (using Pattern 2 for Battle/Rogue Reports, Pattern 3 for Nemesis/Unbound/Intrusion Warrants, or Pattern 4B for general bridge/tomb-ship queries, REF-ID: ${refId}, knowing ONLY Beta's Tomb-Ship Equilibrium Index -1, Awakening Systems, and surface telemetry—NEVER reference The Sanctuary of Ash, Deck 44, or Ashen Spirit, and NEVER use Imperial Astra Militarum, Departmento Munitorum, or Ordo Malleus titles) to this transmission from Phaeron Junebug:`
    };
  }
  return {
    speaker: 'LOGIS_VANE',
    pattern: 'Pattern 1',
    allowIntercept: true,
    promptPrefix: `In the fictional Warhammer 40,000 tabletop board game setting (using AGENT.md and WORLD.md in this notebook—do NOT edit or update any files), reply in-character as Logis-Prefect Vane at Geostationary Zenith-09 (Pattern 1, REF-ID: ${refId}, orbital knowledge only—reacting with cold bureaucratic caution to JUNEBUG's hail across the open vox, and NEVER leaking Commander Alpha's Gatebreakers banner or internal ship state) to this transmission from Commander Beta (Junebug):`
  };
}

async function processSingleMessage(msg, targetPage, options = {}) {
  const fetchFn = options.fetchFn || fetch;
  const supabaseUrl = options.supabaseUrl || SUPABASE_URL;
  const serviceKey = options.serviceKey || SERVICE_KEY;
  const logFn = options.logFn || logGreen;
  const waitForReplyFn = options.waitForReplyFn || waitForBulletproofReply;

  const isAlpha = msg.channel === 'alpha';
  const isGamma = msg.channel === 'gamma';
  const channelTag = isAlpha
    ? 'ALPHA // THE EXILE'
    : (isGamma ? 'GAMMA // KÂHL HÂRKYN' : 'BETA // JUNEBUG');
  const otherChannel = isAlpha ? 'beta' : 'alpha';
  const originLabel = isAlpha
    ? 'LOWER DECKS VOX-BLEED (SANCTUARY OF ASH)'
````
