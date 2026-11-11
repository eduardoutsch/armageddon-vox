# 📦 Fires of Armageddon // Bundle: LCT Tactica Daemon & Scribe Server (Part 1: Browser Referee, Audio & Persistence)

Zero-dependency local HTTP LCT daemon setup, isolated TACTICA_THREAD_URL Playwright referee session, SHA-256 neural Auspex cache, and JSONL disk persistence (`tactica_daemon.js` lines 1 to 510).

## 📑 Table of Contents
- [tactica_daemon.js (Part 1: Referee Session, Audio Cache & Persistence, Lines 1-510)](#file-tacticadaemonjspart1refereesessionaudiocachepersistencelines1510)

---

## File: `tactica_daemon.js (Part 1: Referee Session, Audio Cache & Persistence, Lines 1-510)` <a id="file-tacticadaemonjspart1refereesessionaudiocachepersistencelines1510"></a>

````javascript
/**
 * @fileoverview Fires of Armageddon // Local LCT TTS Daemon & Persistent Black-Box Scribe
 *
 * Zero-dependency HTTP daemon (127.0.0.1:3030) connecting `pages/tactica.html` and the
 * LCT (11th Ed FTC) Tabletop Simulator map. Orchestrates multi-stage LCT dice-mat rolls
 * (`/tts/poll` -> `/tts/dice-result`) with zero local PRNG and persists Round 1–6 match logs
 * to append-only JSONL on disk so daemon restarts suffer zero memory loss.
 */

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
try {
  require('dotenv').config({ path: path.join(__dirname, '.env') });
  require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
} catch (e) {}

const {
  createInitialTacticaState,
  pruneExpiredPlayerBuffs,
  formatChronicleEntry,
  detectPlayerReactionWindow,
  assignHordeWarlordIfEligible,
  createDefenseRollSequence,
  advanceDefenseRollSequence,
  createHordeAttackRollSequence,
  advanceHordeAttackRollSequence,
  compileTacticaPostMatchReport
} = require('./js/tactica-core.js');
const { normalizeTtsBoardScan } = require('./js/tts-telemetry-core.js');
const { buildIngressFallbackCommand } = require('./js/horde-deepstrike-core.js');
const {
  planWaveSpawnCommands,
  buildDisembarkWaveCommand,
  planHordeMovementPhase,
  buildMoveRevertCommand,
  selectHordeShootingTargets,
  planHordeCharges,
  resolveHordeChargeRoll,
  planConsolidationMove
} = require('./js/horde-autopilot-core.js');
const {
  resolveTacticalAuspexVoice,
  buildLosVerificationPrompt,
  scrubGeminiThreadArtifacts,
  isGeminiInterimThinkingText,
  parseOverwatchVerdict
} = require('./js/tactica-overwatch-core.js');

const DEFAULT_PORT = Number(process.env.TACTICA_PORT) || 3030;
const CHAT_INPUT_SELECTOR = 'rich-textarea div.ql-editor, div.ql-editor[contenteditable="true"], div[role="textbox"][contenteditable="true"], textarea';
const SEND_BUTTON_SELECTOR = 'button.send-button, button[aria-label*="Send"], button[aria-label*="Enviar"]';

/**
 * Pure helper: resolves strictly the Tactica Daemon Gemini thread URL from `.env`,
 * ignoring ALPHA_THREAD_URL, BETA_THREAD_URL, GAMMA_THREAD_URL, and all other Vox/Supabase URLs.
 *
 * @param {object} [env=process.env] - Environment dictionary.
 * @returns {string} Trimmed Tactica thread URL, or empty string if unset.
 */
function resolveTacticaThreadUrl(env = process.env) {
  if (!env || typeof env !== 'object') return '';
  const candidates = [
    env.TACTICA_THREAD_URL,
    env.TACTICA_DAEMON_THREAD_URL,
    env.TACTICA_DAEMON_URL
  ];
  for (const val of candidates) {
    if (typeof val === 'string' && val.trim()) {
      return val.trim();
    }
  }
  return '';
}

/**
 * Pure helper: resolves the dedicated Chromium persistent profile directory for Tactica Daemon,
 * strictly isolated from `chrome_vox_profile` so `vox_autopilot.bat` and `tactica_daemon.bat`
 * can run simultaneously in separate Chromium instances without `ProcessSingleton` crashes.
 *
 * @param {object} [env=process.env] - Environment dictionary.
 * @param {string} [baseDir=__dirname] - Base directory for relative profile folder resolution.
 * @returns {string} Absolute path to Tactica's dedicated Chromium user-data-dir.
 */
function resolveTacticaProfileDir(env = process.env, baseDir = __dirname) {
  const defaultDir = path.join(baseDir, 'chrome_tactica_profile');
  const voxDir = path.resolve(baseDir, 'chrome_vox_profile');
  const raw = env && typeof env.TACTICA_PROFILE_DIR === 'string' ? env.TACTICA_PROFILE_DIR.trim() : '';
  if (!raw) return defaultDir;
  const resolved = path.resolve(baseDir, raw);
  if (
    resolved.toLowerCase() === voxDir.toLowerCase() ||
    path.basename(resolved).toLowerCase() === 'chrome_vox_profile'
  ) {
    return defaultDir;
  }
  return resolved;
}

/**
 * Pure helper: checks whether a Gemini web thread URL is a real configured URL
 * rather than an unedited `.env` template placeholder.
 *
 * @param {string} url - Candidate Gemini thread URL.
 * @returns {boolean} True when ready for Playwright navigation.
 */
function isUsableGeminiThreadUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!/^https:\/\/gemini\.google\.com\/app(?:\/[A-Za-z0-9_-]+|\/)?(?:\?.*)?$/i.test(trimmed)) return false;
  if (/YOUR_[A-Z0-9_]*HERE|<your-|PLACEHOLDER/i.test(trimmed)) return false;
  return true;
}

/**
 * Launches an isolated Playwright Chrome window (`chrome_tactica_profile`) locked strictly to
 * `tacticaThreadUrl` (`TACTICA_THREAD_URL`), never sharing `chrome_vox_profile` or touching
 * Alpha/Beta/Gamma narrative threads.
 *
 * @param {string} tacticaThreadUrl - Verified `TACTICA_THREAD_URL` from `.env`.
 * @param {object} [options={}] - Optional `env`, `baseDir`, `chromium`, and `onClose` overrides.
 * @returns {Promise<{profileDir: string, queryThread: function(string, string=): Promise<string>, close: function(): Promise<void>}|null>}
 */
async function launchTacticaBrowserSession(tacticaThreadUrl, options = {}) {
  if (!isUsableGeminiThreadUrl(tacticaThreadUrl)) return null;
  let chromium = options.chromium;
  if (!chromium) {
    try {
      ({ chromium } = require('playwright'));
    } catch (e) {
      return null;
    }
  }

  const profileDir = resolveTacticaProfileDir(options.env || process.env, options.baseDir || __dirname);
  const launchOpts = {
    headless: false,
    channel: 'chrome',
    ignoreDefaultArgs: ['--enable-automation'],
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox'],
    viewport: { width: 1200, height: 840 }
  };

  const context = await chromium.launchPersistentContext(profileDir, launchOpts);
  if (typeof context.on === 'function' && typeof options.onClose === 'function') {
    context.on('close', options.onClose);
  }

  const pages = context.pages();
  const page = pages[0] || await context.newPage();
  for (let i = 1; i < pages.length; i++) {
    await pages[i].close().catch(() => {});
  }

  await page.goto(tacticaThreadUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('model-response', { timeout: 15000 }).catch(() => {});

  const normalizedTargetUrl = tacticaThreadUrl.replace(/\/+$/, '');
  let lock = Promise.resolve();
  const queryThread = (promptText, imageBase64 = '') => {
    const task = lock.then(async () => {
      const curUrl = String(page.url() || '').replace(/\/+$/, '');
      if (!curUrl.startsWith(normalizedTargetUrl)) {
        await page.goto(tacticaThreadUrl, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(1500);
      }
      const prevCount = await page.locator('model-response').count();

      const input = page.locator(CHAT_INPUT_SELECTOR).first();
      await input.click({ force: true });
      await page.keyboard.press('Control+A');
      await page.keyboard.press('Backspace');
      await page.keyboard.insertText(promptText);
      await page.waitForTimeout(250);

      if (imageBase64) {
        const cleanB64 = String(imageBase64).replace(/^data:image\/\w+;base64,/, '');
        await page.evaluate(async ({ b64 }) => {
          const editor = document.querySelector('rich-textarea div.ql-editor, div[contenteditable="true"]');
          if (!editor) return;
          editor.focus();
          const blob = await (await fetch(`data:image/jpeg;base64,${b64}`)).blob();
          const dt = new DataTransfer();
          dt.items.add(new File([blob], 'tts_los_frame.jpg', { type: 'image/jpeg' }));
          editor.dispatchEvent(new ClipboardEvent('paste', { bubbles: true, cancelable: true, clipboardData: dt }));
        }, { b64: cleanB64 });
        await page.waitForTimeout(900);
      }

      const sendBtn = page.locator(SEND_BUTTON_SELECTOR).first();
      if (await sendBtn.count() > 0 && await sendBtn.isEnabled().catch(() => false)) {
        await sendBtn.click();
      } else {
        await page.keyboard.press('Enter');
      }

      let lastText = '';
      let stable = 0;
      const started = Date.now();
      while (Date.now() - started < 90000) {
        await page.waitForTimeout(1100);
        const snap = await page.evaluate(() => {
          const nodes = document.querySelectorAll('model-response');
          if (!nodes || nodes.length === 0) return { count: 0, text: '', isGenerating: false };
          const lastNode = nodes[nodes.length - 1];

          const stopBtn = document.querySelector(
            'button[aria-label*="Stop"], button[aria-label*="Parar"], button[aria-label*="Interromper"], button.stop-button'
          );
          const isGenerating = Boolean(
            (stopBtn && stopBtn.offsetParent !== null) ||
            lastNode.getAttribute('aria-busy') === 'true'
          );

          const clone = lastNode.cloneNode(true);
          const junkSelectors = [
            'model-thoughts',
            '[data-test-id*="thought"]',
            'thoughts-header',
            '.thoughts-container',
            '[class*="thought"]',
            '.sr-only',
            '.visually-hidden',
            '.cdk-visually-hidden',
            'source-footnote',
            'sources-carousel',
            'sources-list',
            'citation-marker',
            'sup',
            '.citation',
            '.source-chip',
            'mat-chip',
            '.code-block-decoration',
            '.code-block-header',
            '.code-header',
            'button'
          ];
          junkSelectors.forEach((sel) => {
            clone.querySelectorAll(sel).forEach((el) => el.remove());
          });
          clone.querySelectorAll('span, div, h1, h2, h3, h4, p').forEach((el) => {
            if (el.children.length === 0) {
              const t = (el.textContent || '').trim();
              if (/^(?:O Gemini disse:?|Gemini said:?|Mostrar pensamento|Ocultar pensamento|Show thinking|Hide thinking|JSON|Plaintext|Texto simples|Copy code|Copiar código)$/i.test(t)) {
                el.remove();
              }
            }
          });

          const bodyRoot = clone.querySelector('message-content, .model-response-text, .markdown');
          return {
            count: nodes.length,
            text: bodyRoot ? (bodyRoot.textContent || '').trim() : '',
            isGenerating
          };
        }).catch(() => ({ count: 0, text: '', isGenerating: false }));

        if (snap.count <= prevCount) continue;
        const cleaned = scrubGeminiThreadArtifacts(snap.text);
        if (isGeminiInterimThinkingText(cleaned, { isGenerating: snap.isGenerating })) {
          stable = 0;
          continue;
        }
        if (cleaned === lastText) {
          stable += 1;
          const looksCompleteJson = cleaned.includes('{') && cleaned.trim().endsWith('}');
          if ((looksCompleteJson && stable >= 2) || stable >= 3) {
            return cleaned;
          }
        } else {
          lastText = cleaned;
          stable = 0;
        }
      }
      return lastText;
    });
    lock = task.catch(() => {});
    return task;
  };

  return {
    profileDir,
    queryThread,
    close: () => context.close().catch(() => {})
  };
}

/**
 * Creates a self-contained LCT Relay & Append-Only Chronicle Daemon instance.
 *
 * @param {object} [options={}] - Daemon configuration (`logDir` override for isolated test folders).
 * @returns {{server: http.Server, start: function(number=): Promise<number>, stop: function(): Promise<void>}}
 */
function createTacticaDaemon(options = {}) {
  const env = options.env || process.env;
  const tacticaThreadUrl = resolveTacticaThreadUrl(env);
  const logDir = options.logDir || path.join(__dirname, 'match_logs');
  const statePath = path.join(logDir, 'live_state.json');
  const chroniclePath = path.join(logDir, 'match_chronicle.jsonl');
  let activeThreadQueryFn = options.threadQueryFn || null;

  fs.mkdirSync(logDir, { recursive: true });

  let liveState = createInitialTacticaState();
  const ttsCommandQueue = [];
  let cmdCounter = 0;

  function loadPersistedState() {
    if (fs.existsSync(statePath)) {
      try {
        liveState = createInitialTacticaState(JSON.parse(fs.readFileSync(statePath, 'utf8')));
      } catch (e) {}
    }
  }

  function savePersistedState() {
    fs.writeFileSync(statePath, JSON.stringify(liveState, null, 2), 'utf8');
  }

  function readChronicleFromDisk() {
    if (!fs.existsSync(chroniclePath)) return [];
    const raw = fs.readFileSync(chroniclePath, 'utf8').trim();
    if (!raw) return [];
    return raw.split('\n').map(l => {
      try { return JSON.parse(l); } catch (e) { return null; }
    }).filter(Boolean);
  }

  function appendEvent(rawEvent) {
    liveState.seqCounter = (Number(liveState.seqCounter) || 0) + 1;
    const entry = formatChronicleEntry({ ...rawEvent, seq: liveState.seqCounter }, liveState);
    fs.appendFileSync(chroniclePath, JSON.stringify(entry) + '\n', 'utf8');
    savePersistedState();
    return entry;
  }

  function queueNextSequenceCommand(seq) {
    if (seq && seq.nextCommand) {
      cmdCounter += 1;
      ttsCommandQueue.push({
        id: `lct_cmd_${Date.now()}_${cmdCounter}`,
        createdAt: Date.now(),
        ...seq.nextCommand
      });
    }
  }

  function logCompletedSequence(seq) {
    if (seq.kind === 'AUTO_DEFENDER') {
      const prof = seq.defenseProfile;
      const out = seq.outcome;
      const fnpNote = prof.fnp ? `, FNP ${prof.fnp}+ (${out.fnpPassed} shrugged)` : '';
      const deathNote = out.onDeathTriggers > 0 ? ` [${out.onDeathTriggers}x Shoot/Fight on Death!]` : '';
      const gscNote = out.gscRespawnTriggered ? ' [GSC 5+ Respawn!]' : '';

      if (out.unitDestroyed && liveState.hordeWarlord && liveState.hordeWarlord.name === seq.unitName) {
        liveState.hordeWarlord.alive = false;
      }
      return appendEvent({
        type: 'AUTO_DEFENDER',
        summary: `${seq.unitName} [LCT Mat]: Save ${prof.saveTarget}+ (${out.savesPassed}/${seq.numWounds} saved${fnpNote}) -> ${out.modelsSlain} slain (${out.remainingModels} left).${deathNote}${gscNote}`,
        details: { defenseProfile: prof, outcome: out }
      });
    }

    if (seq.kind === 'HORDE_ATTACK') {
      return appendEvent({
        type: 'HORDE_ATTACK',
        summary: `${seq.attackerName} -> ${seq.targetName} [LCT Mat]: ${seq.normalWounds} Wounds (AP ${seq.attackMods.apSigned}) + ${seq.devastatingMortalWounds} Mortal Wounds.`,
        details: { normalWounds: seq.normalWounds, devastatingMortalWounds: seq.devastatingMortalWounds }
      });
    }
    return null;
  }

  loadPersistedState();

  function sendJson(res, status, payload) {
    res.writeHead(status, {
      'Content-Type': 'application/json; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    });
    res.end(JSON.stringify(payload));
  }

  function readJsonBody(req) {
    return new Promise((resolve) => {
      let buf = '';
      req.on('data', c => { buf += c; });
      req.on('end', () => {
        if (!buf) return resolve({});
        try { resolve(JSON.parse(buf)); } catch (e) { resolve({}); }
      });
    });
  }

  const server = http.createServer(async (req, res) => {
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
      return res.end();
    }

    const urlPath = (req.url || '/').split('?')[0];

    if (req.method === 'GET' && urlPath === '/state') {
      return sendJson(res, 200, {
        ok: true,
        state: liveState,
        chronicle: readChronicleFromDisk(),
        ttsQueueLength: ttsCommandQueue.length,
        tacticaThreadUrl,
        tacticaThreadReady: Boolean(activeThreadQueryFn || isUsableGeminiThreadUrl(tacticaThreadUrl))
      });
    }

    if (req.method === 'GET' && urlPath === '/tts/poll') {
      if (ttsCommandQueue.length === 0) {
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8', 'Access-Control-Allow-Origin': '*' });
        return res.end('IDLE');
      }
      return sendJson(res, 200, ttsCommandQueue.shift());
    }

    if (req.method === 'POST' && urlPath === '/audio/speak') {
      const body = await readJsonBody(req);
      const text = String(body.text || '').trim().slice(0, 320);
      if (!text) return sendJson(res, 400, { ok: false, error: 'Empty text' });

      const preset = resolveTacticalAuspexVoice(body.theme);
      const cacheDir = path.join(logDir, 'audio_cache');
      fs.mkdirSync(cacheDir, { recursive: true });
      const hash = crypto.createHash('sha256').update(`${preset.voice}|${preset.rate}|${preset.pitch}|${text}`).digest('hex').slice(0, 24);
      const mp3Path = path.join(cacheDir, `${hash}.mp3`);

      if (fs.existsSync(mp3Path)) {
        const b64 = fs.readFileSync(mp3Path).toString('base64');
        return sendJson(res, 200, { ok: true, cached: true, voice: preset.voice, mimeType: 'audio/mpeg', audioBase64: b64 });
      }

      const synthFn = options.ttsSynthesizeFn || (async (t, p, destFile) => {
        const { MsEdgeTTS, OUTPUT_FORMAT } = await import('msedge-tts');
        const tts = new MsEdgeTTS();
        await tts.setMetadata(p.voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
        const { audioStream } = tts.toStream(t, { rate: p.rate, pitch: p.pitch });
        const chunks = [];
        await new Promise((resolve, reject) => {
          audioStream.on('data', d => chunks.push(Buffer.from(d)));
          audioStream.on('close', resolve);
          audioStream.on('end', resolve);
          audioStream.on('error', reject);
        });
        const buf = Buffer.concat(chunks);
        fs.writeFileSync(destFile, buf);
        return buf;
      });

      try {
        const audioBuf = Buffer.from(await synthFn(text, preset, mp3Path));
        if (!fs.existsSync(mp3Path)) fs.writeFileSync(mp3Path, audioBuf);
        return sendJson(res, 200, { ok: true, cached: false, voice: preset.voice, mimeType: 'audio/mpeg', audioBase64: audioBuf.toString('base64') });
      } catch (err) {
        return sendJson(res, 200, { ok: false, fallbackChimeOnly: true, error: err.message });
      }
    }

    if (req.method === 'POST' && urlPath === '/session/sync') {
      const body = await readJsonBody(req);
      const roundOrPhaseChanged = body.battleRound !== undefined || body.phase !== undefined;
      if (body.roomCode !== undefined) {
        const nextRoom = String(body.roomCode).trim().toUpperCase();
        if (nextRoom && nextRoom !== liveState.roomCode) {
          liveState.boardTelemetry = { updatedAt: null, units: [], objectives: [] };
          liveState.squadGuidRegistry = {};
          liveState.hordeReserves = [];
          liveState.shelfTemplates = [];
        }
        liveState.roomCode = nextRoom;
      }
      if (body.battleRound !== undefined) {
        const nextRnd = Number(body.battleRound);
        if (nextRnd !== liveState.battleRound && Array.isArray(liveState.boardTelemetry?.units)) {
          if (liveState.boardTelemetry.units.some(u => u.didIngressThisTurn)) {
            cmdCounter += 1;
            ttsCommandQueue.push({ id: `lct_cmd_${Date.now()}_${cmdCounter}`, action: 'CLEAR_DEEP_STRUCK' });
          }
          liveState.boardTelemetry.units.forEach(u => { u.didIngressThisTurn = false; });
        }
        liveState.battleRound = nextRnd;
      }
      if (body.phase !== undefined) liveState.phase = body.phase;
      if (roundOrPhaseChanged) {
        liveState.activePlayerBuffs = pruneExpiredPlayerBuffs(
          liveState.activePlayerBuffs,
          liveState.battleRound,
          liveState.phase
        );
      }
      if (body.factionName !== undefined) liveState.factionName = body.factionName;
      if (body.playerCp !== undefined) liveState.playerCp = Number(body.playerCp);
      if (body.playerSp !== undefined) liveState.playerSp = Number(body.playerSp);
      if (Array.isArray(body.activeMiseryIds)) liveState.activeMiseryIds = body.activeMiseryIds;
      if (Array.isArray(body.activeFortifications)) liveState.activeFortifications = body.activeFortifications;
      if (Array.isArray(body.zoneSpawns)) liveState.zoneSpawns = body.zoneSpawns;
````
