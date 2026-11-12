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
  previewMovementSightlines,
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

  const CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Access-Control-Request-Private-Network',
    'Access-Control-Allow-Private-Network': 'true'
  };

  function sendJson(res, status, payload) {
    res.writeHead(status, {
      'Content-Type': 'application/json; charset=utf-8',
      ...CORS_HEADERS
    });
    res.end(JSON.stringify(payload));
  }

  function readJsonBody(req) {
    return new Promise((resolve, reject) => {
      let buf = '';
      req.on('data', c => { buf += c; });
      req.on('error', reject);
      req.on('end', () => {
        if (!buf || !buf.trim()) return resolve({});
        try {
          resolve(JSON.parse(buf));
        } catch (e) {
          reject(new Error(`Invalid JSON body: ${e.message}`));
        }
      });
    });
  }

  function restoreUnitOriginInTelemetry(squadKey, snapshot) {
    if (!snapshot || !Array.isArray(liveState.boardTelemetry?.units)) return;
    const unit = liveState.boardTelemetry.units.find(u => (u.squadKey || u.name) === squadKey);
    if (!unit) return;
    if (snapshot.originPos) {
      unit.pos = {
        x: Number(snapshot.originPos.x) || 0,
        y: Number(snapshot.originPos.y) || 1.1,
        z: Number(snapshot.originPos.z) || 0
      };
    }
    if (Array.isArray(unit.models) && Array.isArray(snapshot.originModels)) {
      const byGuid = new Map(snapshot.originModels.map(m => [m.guid, m]));
      unit.models = unit.models.map((m, idx) => {
        const om = (m.guid && byGuid.get(m.guid)) || snapshot.originModels[idx];
        return om ? { ...m, pos: { x: Number(om.x) || 0, y: Number(om.y) || 1.1, z: Number(om.z) || 0 } } : m;
      });
    }
    unit.advancedThisTurn = false;
  }

  const server = http.createServer(async (req, res) => {
    try {
    if (req.method === 'OPTIONS') {
      res.writeHead(204, CORS_HEADERS);
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
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8', ...CORS_HEADERS });
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
          liveState.boardTelemetry = { updatedAt: null, units: [], objectives: [], obstacles: [], autoBlockedLosPairs: [] };
          liveState.squadGuidRegistry = {};
          liveState.hordeReserves = [];
          liveState.shelfTemplates = [];
          liveState.losBlockedPairs = [];
          liveState.losAllowedPairs = [];
          liveState.phaseOriginSnapshots = {};
          liveState.lastMovementPlans = [];
          liveState.lastMovementSightlines = [];
        }
        liveState.roomCode = nextRoom;
      }
      if (body.battleRound !== undefined) {
        const nextRnd = Number(body.battleRound);
        if (nextRnd !== liveState.battleRound) {
          if (Array.isArray(liveState.boardTelemetry?.units)) {
            if (liveState.boardTelemetry.units.some(u => u.didIngressThisTurn)) {
              cmdCounter += 1;
              ttsCommandQueue.push({ id: `lct_cmd_${Date.now()}_${cmdCounter}`, action: 'CLEAR_DEEP_STRUCK' });
            }
            liveState.boardTelemetry.units.forEach(u => { u.didIngressThisTurn = false; });
          }
          liveState.losBlockedPairs = [];
          liveState.losAllowedPairs = [];
          liveState.phaseOriginSnapshots = {};
          liveState.lastMovementPlans = [];
          liveState.lastMovementSightlines = [];
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
      if (Array.isArray(body.hordeReserves)) liveState.hordeReserves = body.hordeReserves;
      if (Array.isArray(body.shelfTemplates)) liveState.shelfTemplates = body.shelfTemplates;
      if (Array.isArray(body.activePlayerBuffs)) liveState.activePlayerBuffs = body.activePlayerBuffs;
      savePersistedState();
      return sendJson(res, 200, { ok: true, state: liveState });
    }

    if (req.method === 'POST' && urlPath === '/chronicle/append') {
      const body = await readJsonBody(req);
      const roundOrPhaseChanged = body.battleRound !== undefined || Boolean(body.phase);
      if (body.battleRound !== undefined) liveState.battleRound = Number(body.battleRound);
      if (body.phase) liveState.phase = body.phase;
      if (roundOrPhaseChanged) {
        liveState.activePlayerBuffs = pruneExpiredPlayerBuffs(
          liveState.activePlayerBuffs,
          liveState.battleRound,
          liveState.phase
        );
      }
      const entry = appendEvent(body);
      if (body.reactionTrigger) {
        const win = detectPlayerReactionWindow(body.reactionTrigger, liveState);
        liveState.pendingReactionWindow = win.open ? win : null;
        savePersistedState();
      }
      return sendJson(res, 200, { ok: true, entry, pendingReactionWindow: liveState.pendingReactionWindow });
    }

    if (req.method === 'POST' && urlPath === '/reaction/resolve') {
      const body = await readJsonBody(req);
      const cpSpent = Math.max(0, Number(body.cpSpent) || 0);
      liveState.playerCp = Math.max(0, (Number(liveState.playerCp) || 0) - cpSpent);
      liveState.pendingReactionWindow = null;
      const entry = appendEvent({
        type: 'REACTION',
        summary: body.summary || `Player resolved reaction: ${body.choice || 'PASS'} (-${cpSpent} CP).`
      });
      return sendJson(res, 200, { ok: true, state: liveState, entry });
    }

    if (req.method === 'POST' && urlPath === '/combat/defend-request') {
      const body = await readJsonBody(req);
      cmdCounter += 1;
      const seq = createDefenseRollSequence({ ...body, sequenceId: `def_${Date.now()}_${cmdCounter}` }, liveState);
      if (seq.stage === 'COMPLETE') {
        liveState.pendingDiceSequence = null;
        const entry = logCompletedSequence(seq);
        return sendJson(res, 200, { ok: true, sequence: seq, entry });
      }
      liveState.pendingDiceSequence = seq;
      queueNextSequenceCommand(seq);
      savePersistedState();
      return sendJson(res, 200, { ok: true, sequence: seq, queueLength: ttsCommandQueue.length });
    }

    if (req.method === 'POST' && urlPath === '/combat/attack-request') {
      const body = await readJsonBody(req);
      cmdCounter += 1;
      const seq = createHordeAttackRollSequence({ ...body, sequenceId: `atk_${Date.now()}_${cmdCounter}` }, liveState);
      if (seq.stage === 'COMPLETE') {
        liveState.pendingDiceSequence = null;
        const entry = logCompletedSequence(seq);
        return sendJson(res, 200, { ok: true, sequence: seq, entry });
      }
      liveState.pendingDiceSequence = seq;
      queueNextSequenceCommand(seq);
      savePersistedState();
      return sendJson(res, 200, { ok: true, sequence: seq, queueLength: ttsCommandQueue.length });
    }

    if (req.method === 'POST' && urlPath === '/tts/dice-result') {
      const body = await readJsonBody(req);
      const dice = Array.isArray(body.dice) ? body.dice.map(Number) : [];
      liveState.lastDiceResult = { ...body, dice, receivedAt: Date.now() };

      const activeSeq = liveState.pendingDiceSequence;
      if (activeSeq && (!body.sequenceId || body.sequenceId === activeSeq.sequenceId)) {
        const updated = activeSeq.kind === 'AUTO_DEFENDER'
          ? advanceDefenseRollSequence(activeSeq, dice)
          : advanceHordeAttackRollSequence(activeSeq, dice);

        if (updated.stage === 'COMPLETE') {
          liveState.pendingDiceSequence = null;
          const entry = logCompletedSequence(updated);
          return sendJson(res, 200, { ok: true, sequence: updated, entry });
        }
        liveState.pendingDiceSequence = updated;
        queueNextSequenceCommand(updated);
        savePersistedState();
        return sendJson(res, 200, { ok: true, sequence: updated, queueLength: ttsCommandQueue.length });
      }

      if (liveState.pendingChargeDecl && (!body.sequenceId || body.sequenceId === liveState.pendingChargeDecl.sequenceId)) {
        const resolved = resolveHordeChargeRoll(liveState.pendingChargeDecl, dice);
        liveState.pendingChargeDecl = null;
        if (resolved.moveCommand) {
          cmdCounter += 1;
          ttsCommandQueue.push({ id: `lct_cmd_${Date.now()}_${cmdCounter}`, ...resolved.moveCommand });
        }
        const entry = appendEvent({
          type: 'HORDE_CHARGE',
          summary: `${resolved.attackerName} -> ${resolved.targetName} [LCT 2D6 = ${resolved.modifiedTotal}"]: ${resolved.succeeded ? 'CHARGE SUCCEEDED!' : 'Charge Failed.'}`
        });
        return sendJson(res, 200, { ok: true, chargeResult: resolved, entry });
      }

      const entry = appendEvent({
        type: 'TTS_DICE',
        summary: `LCT Mat Roll [${body.label || 'Check'}]: [${dice.join(', ')}]`
      });
      return sendJson(res, 200, { ok: true, sequence: null, entry });
    }

    if (req.method === 'POST' && urlPath === '/tts/enqueue') {
      const body = await readJsonBody(req);
      cmdCounter += 1;
      const cmd = { id: `lct_cmd_${Date.now()}_${cmdCounter}`, createdAt: Date.now(), ...body };
      ttsCommandQueue.push(cmd);
      return sendJson(res, 200, { ok: true, queued: cmd, queueLength: ttsCommandQueue.length });
    }

    if (req.method === 'POST' && urlPath === '/tts/set-side') {
      const body = await readJsonBody(req);
      const nextSide = String(body.side || 'PLAYER').toUpperCase() === 'HORDE' ? 'HORDE' : 'PLAYER';
      const guids = Array.isArray(body.guids) ? body.guids : [];
      const units = liveState.boardTelemetry?.units || [];
      units.forEach(u => {
        if (u.squadKey === body.squadKey || (guids.length > 0 && u.guids?.some(g => guids.includes(g)))) {
          u.side = nextSide;
          u.squadKey = `${nextSide}::${u.name}`;
        }
      });
      if (liveState.squadGuidRegistry && typeof liveState.squadGuidRegistry === 'object') {
        guids.forEach(g => {
          if (liveState.squadGuidRegistry[g]) {
            liveState.squadGuidRegistry[g].side = nextSide;
            liveState.squadGuidRegistry[g].squadKey = `${nextSide}::${liveState.squadGuidRegistry[g].name}`;
          }
        });
      }
      cmdCounter += 1;
      ttsCommandQueue.push({ id: `lct_cmd_${Date.now()}_${cmdCounter}`, action: 'SET_UNIT_SIDE', side: nextSide, guids });
      savePersistedState();
      return sendJson(res, 200, { ok: true, units });
    }

    if (req.method === 'POST' && urlPath === '/tts/telemetry') {
      const body = await readJsonBody(req);
      let units = Array.isArray(body.units) ? body.units : [];
      let objectives = Array.isArray(body.objectives) ? body.objectives : [];
      let obstacles = Array.isArray(body.obstacles) ? body.obstacles : (liveState.boardTelemetry?.obstacles || []);
      let autoBlockedLosPairs = Array.isArray(body.autoBlockedLosPairs)
        ? body.autoBlockedLosPairs
        : (liveState.boardTelemetry?.autoBlockedLosPairs || []);

      if (Array.isArray(body.objects)) {
        const normalized = normalizeTtsBoardScan(body, {
          hordeFactionName: liveState.factionName,
          previousUnits: liveState.boardTelemetry?.units || [],
          guidRegistry: liveState.squadGuidRegistry || {}
        });
        units = normalized.units;
        objectives = normalized.objectives;
        obstacles = normalized.obstacles || [];
        autoBlockedLosPairs = normalized.autoBlockedLosPairs || [];
        liveState.squadGuidRegistry = normalized.guidRegistry || {};
        if (Array.isArray(normalized.shelfTemplates) && normalized.shelfTemplates.length > 0) {
          liveState.shelfTemplates = normalized.shelfTemplates;
        }
      } else if (Array.isArray(body.shelfTemplates)) {
        liveState.shelfTemplates = body.shelfTemplates;
      }

      liveState.boardTelemetry = { updatedAt: Date.now(), units, objectives, obstacles, autoBlockedLosPairs };

      const wlCheck = assignHordeWarlordIfEligible(liveState.hordeWarlord, units, liveState.battleRound);
      if (wlCheck.newlyAssigned) {
        liveState.hordeWarlord = wlCheck.warlord;
        appendEvent({ type: 'WARLORD', summary: `Designated ${wlCheck.warlord.name} as Horde Warlord!` });
      } else {
        savePersistedState();
      }
      return sendJson(res, 200, {
        ok: true,
        warlord: liveState.hordeWarlord,
        trackedUnits: units.length,
        objectives: objectives.length,
        units
      });
    }

    if (req.method === 'POST' && urlPath === '/autopilot/spawn-waves') {
      const body = await readJsonBody(req);
      liveState.phase = 'COMMAND_SPAWN';
      liveState.activePlayerBuffs = pruneExpiredPlayerBuffs(liveState.activePlayerBuffs, liveState.battleRound, liveState.phase);
      const resPlan = planWaveSpawnCommands(body.zoneSpawns || liveState.zoneSpawns, body.spawnZones || [], {
        battleRound: liveState.battleRound,
        shelfTemplates: body.shelfTemplates || liveState.shelfTemplates || []
      });
      liveState.hordeReserves = [...(liveState.hordeReserves || []), ...(resPlan.queuedReserves || [])];
      resPlan.commands.forEach(c => {
        cmdCounter += 1;
        ttsCommandQueue.push({ id: `lct_cmd_${Date.now()}_${cmdCounter}`, ...c });
      });
      const entry = appendEvent({ type: 'SPAWN_WAVE', summary: resPlan.summary });
      return sendJson(res, 200, { ok: true, ...resPlan, hordeReserves: liveState.hordeReserves, entry, queueLength: ttsCommandQueue.length });
    }

    if (req.method === 'POST' && urlPath === '/autopilot/disembark') {
      const body = await readJsonBody(req);
      const units = liveState.boardTelemetry?.units || [];
      const targetTransport = body.transportUnit ||
        units.find(u =>
          (body.squadKey && u.squadKey === body.squadKey) ||
          (body.transportGuid && u.guid === body.transportGuid)
        ) ||
        (Number.isInteger(body.unitIndex) ? units[body.unitIndex] : null);

      const cmd = buildDisembarkWaveCommand(targetTransport, body);
      if (!cmd) {
        return sendJson(res, 400, { ok: false, error: 'No embarked cargo to disembark' });
      }
      if (targetTransport && units.includes(targetTransport)) {
        targetTransport.embarkedCargo = [];
        targetTransport.embarkedSummary = null;
      }
      cmdCounter += 1;
      ttsCommandQueue.push({ id: `lct_cmd_${Date.now()}_${cmdCounter}`, ...cmd });
      const entry = appendEvent({ type: 'DISEMBARK', summary: cmd.summary });
      return sendJson(res, 200, { ok: true, command: cmd, units, entry, queueLength: ttsCommandQueue.length });
    }

    if (req.method === 'POST' && urlPath === '/autopilot/plan-movement') {
      const body = await readJsonBody(req);
      liveState.phase = 'HORDE_MOVEMENT';
      liveState.activePlayerBuffs = pruneExpiredPlayerBuffs(liveState.activePlayerBuffs, liveState.battleRound, liveState.phase);
      const preMoveTelemetry = JSON.parse(JSON.stringify(liveState.boardTelemetry || { units: [], objectives: [], obstacles: [], autoBlockedLosPairs: [] }));
      const moveRes = planHordeMovementPhase(liveState.boardTelemetry, liveState, body);
      if (!liveState.phaseOriginSnapshots || typeof liveState.phaseOriginSnapshots !== 'object') {
        liveState.phaseOriginSnapshots = {};
      }
      moveRes.plans.forEach(p => {
        if (p.squadKey && !liveState.phaseOriginSnapshots[p.squadKey]) {
          liveState.phaseOriginSnapshots[p.squadKey] = {
            squadKey: p.squadKey,
            unitName: p.unitName,
            guids: p.guids || [],
            originPos: p.originPos || null,
            originModels: p.originModels || []
          };
        }
        if (Number.isFinite(Number(p.targetX)) && Number.isFinite(Number(p.targetZ)) && Array.isArray(liveState.boardTelemetry?.units)) {
          const unit = liveState.boardTelemetry.units.find(u => (u.squadKey || u.name) === p.squadKey);
          if (unit) {
            const dx = Number(p.targetX) - (Number(unit.pos?.x) || 0);
            const dz = Number(p.targetZ) - (Number(unit.pos?.z) || 0);
            unit.pos = { x: Number(p.targetX), y: Number(unit.pos?.y) || 1.1, z: Number(p.targetZ) };
            if (Array.isArray(unit.models)) {
              unit.models = unit.models.map(m => ({
                ...m,
                pos: {
                  x: Number(((Number(m.pos?.x) || 0) + dx).toFixed(2)),
                  y: Number(m.pos?.y) || 1.1,
                  z: Number(((Number(m.pos?.z) || 0) + dz).toFixed(2))
                }
              }));
            }
            unit.advancedThisTurn = Boolean(p.advanced);
          }
        }
      });

      const sightlines = previewMovementSightlines(preMoveTelemetry, liveState, moveRes.plans, {
        losBlockedPairs: liveState.losBlockedPairs || [],
        losAllowedPairs: liveState.losAllowedPairs || []
      });
      liveState.lastMovementPlans = moveRes.plans;
      liveState.lastMovementSightlines = sightlines;
      liveState.hordeReserves = [];
      moveRes.commands.forEach(c => {
        cmdCounter += 1;
        ttsCommandQueue.push({ id: `lct_cmd_${Date.now()}_${cmdCounter}`, ...c });
      });
      const ingressDrops = moveRes.ingressDrops || [];
      liveState.lastIngressDrops = ingressDrops;
      const ingressNote = ingressDrops.length > 0 ? ` + ${ingressDrops.length} Deep Strike Ingress drop(s)` : '';
      const entry = appendEvent({
        type: 'HORDE_MOVE',
        summary: `Moved ${moveRes.plans.length} Horde squad(s)${ingressNote} — awaiting Pre-Overwatch LOS check.`
      });
      return sendJson(res, 200, {
        ok: true,
        plans: moveRes.plans,
        sightlines,
        phaseOriginSnapshots: liveState.phaseOriginSnapshots,
        ingressDrops,
        entry,
        queueLength: ttsCommandQueue.length
      });
    }

    if (req.method === 'POST' && urlPath === '/autopilot/fallback-ingress') {
      const body = await readJsonBody(req);
      const drops = liveState.lastIngressDrops || [];
      const targetDrop = drops.find(d => body.reserveId && d.reserveId === body.reserveId) || drops[Number(body.dropIndex) || 0];
      const cmd = buildIngressFallbackCommand(targetDrop);
      if (!cmd) return sendJson(res, 400, { ok: false, error: 'No stored Deep Strike ingress drop' });
      for (let i = ttsCommandQueue.length - 1; i >= 0; i--) {
        if (ttsCommandQueue[i].action === 'DEEP_STRIKE_DROP' && ttsCommandQueue[i].reserveId === cmd.reserveId) {
          ttsCommandQueue.splice(i, 1);
        }
      }
      if (targetDrop) {
        targetDrop.status = 'SCREENED_FALLBACK_SPAWN_ZONE';
        targetDrop.targetX = cmd.targetX;
        targetDrop.targetZ = cmd.targetZ;
      }
      cmdCounter += 1;
      ttsCommandQueue.push({ id: `lct_cmd_${Date.now()}_${cmdCounter}`, ...cmd });
      const entry = appendEvent({
        type: 'INGRESS_FALLBACK',
        summary: `Relocated ${cmd.unitLabel} to Spawn Zone ${cmd.zone} (3D terrain/ruin obstructed Deep Strike landing).`
      });
      return sendJson(res, 200, { ok: true, command: cmd, entry, queueLength: ttsCommandQueue.length });
    }

    if (req.method === 'POST' && urlPath === '/autopilot/revert-move') {
      const body = await readJsonBody(req);
      const plans = Array.isArray(liveState.lastMovementPlans) ? liveState.lastMovementPlans : [];
      const snapshots = liveState.phaseOriginSnapshots || {};
      const targetPlan = body.squadKey
        ? plans.find(p => p.squadKey === body.squadKey)
        : plans[Number(body.planIndex) || 0];
      const resolvedKey = body.squadKey || targetPlan?.squadKey;
      const originSource = (resolvedKey && snapshots[resolvedKey]) || targetPlan;
      const cmd = buildMoveRevertCommand(originSource);
      if (!cmd) return sendJson(res, 400, { ok: false, error: 'No stored origin snapshot' });

      if (targetPlan) {
        targetPlan.status = 'REVERTED';
      }
      restoreUnitOriginInTelemetry(resolvedKey, originSource);

      const sightlines = previewMovementSightlines(liveState.boardTelemetry, liveState, plans, {
        losBlockedPairs: liveState.losBlockedPairs || [],
        losAllowedPairs: liveState.losAllowedPairs || []
      });
      const assignments = selectHordeShootingTargets(liveState.boardTelemetry, liveState, {
        losBlockedPairs: liveState.losBlockedPairs || [],
        losAllowedPairs: liveState.losAllowedPairs || []
      });
      liveState.lastMovementSightlines = sightlines;
      liveState.lastShootingAssignments = assignments;

      cmdCounter += 1;
      ttsCommandQueue.push({ id: `lct_cmd_${Date.now()}_${cmdCounter}`, ...cmd });
      const entry = appendEvent({ type: 'MOVE_REVERT', summary: `Reverted ${cmd.unitName} to pre-move origin.` });
      return sendJson(res, 200, {
        ok: true,
        command: cmd,
        plans,
        sightlines,
        assignments,
        entry
      });
    }

    if (req.method === 'POST' && urlPath === '/autopilot/toggle-los') {
      const body = await readJsonBody(req);
      const pairKey = String(body.pairKey || '').trim();
      if (!pairKey) return sendJson(res, 400, { ok: false, error: 'Missing pairKey' });
      const isBlocked = body.blocked !== false;

      const blockedSet = new Set(liveState.losBlockedPairs || []);
      const allowedSet = new Set(liveState.losAllowedPairs || []);
      if (isBlocked) {
        blockedSet.add(pairKey);
        allowedSet.delete(pairKey);
      } else {
        blockedSet.delete(pairKey);
        allowedSet.add(pairKey);
      }
      liveState.losBlockedPairs = Array.from(blockedSet);
      liveState.losAllowedPairs = Array.from(allowedSet);

      const sightlines = previewMovementSightlines(liveState.boardTelemetry, liveState, liveState.lastMovementPlans || [], {
        losBlockedPairs: liveState.losBlockedPairs,
        losAllowedPairs: liveState.losAllowedPairs
      });
      const assignments = selectHordeShootingTargets(liveState.boardTelemetry, liveState, {
        losBlockedPairs: liveState.losBlockedPairs,
        losAllowedPairs: liveState.losAllowedPairs
      });
      liveState.lastMovementSightlines = sightlines;
      liveState.lastShootingAssignments = assignments;
      savePersistedState();

      return sendJson(res, 200, {
        ok: true,
        pairKey,
        blocked: isBlocked,
        losBlockedPairs: liveState.losBlockedPairs,
        losAllowedPairs: liveState.losAllowedPairs,
        sightlines,
        assignments
      });
    }

    if (req.method === 'POST' && urlPath === '/autopilot/select-shooting') {
      const body = await readJsonBody(req);
      liveState.phase = 'HORDE_SHOOTING';
      liveState.activePlayerBuffs = pruneExpiredPlayerBuffs(liveState.activePlayerBuffs, liveState.battleRound, liveState.phase);
      const mergedBlocked = Array.from(new Set([
        ...(liveState.losBlockedPairs || []),
        ...(body.losBlockedPairs || [])
      ]));
      const mergedAllowed = Array.from(new Set([
        ...(liveState.losAllowedPairs || []),
        ...(body.losAllowedPairs || [])
      ]));
      const assignments = selectHordeShootingTargets(liveState.boardTelemetry, liveState, {
        ...body,
        losBlockedPairs: mergedBlocked,
        losAllowedPairs: mergedAllowed
      });
      liveState.lastShootingAssignments = assignments;
      return sendJson(res, 200, { ok: true, assignments, losBlockedPairs: mergedBlocked, losAllowedPairs: mergedAllowed });
    }

    if (req.method === 'POST' && urlPath === '/autopilot/declare-charges') {
      const body = await readJsonBody(req);
      liveState.phase = 'HORDE_CHARGE';
      liveState.activePlayerBuffs = pruneExpiredPlayerBuffs(liveState.activePlayerBuffs, liveState.battleRound, liveState.phase);
      const chg = planHordeCharges(liveState.boardTelemetry, liveState, body);
      const win = detectPlayerReactionWindow('HORDE_CHARGE_DECLARED', liveState);
      liveState.pendingReactionWindow = (chg.declarations.length > 0 && win.open) ? win : null;

      if (chg.declarations[0]) {
        const first = chg.declarations[0];
        if (first.moveCommand) {
          cmdCounter += 1;
          ttsCommandQueue.push({ id: `lct_cmd_${Date.now()}_${cmdCounter}`, ...first.moveCommand });
        } else if (first.lctCommand) {
          liveState.pendingChargeDecl = first;
          cmdCounter += 1;
          ttsCommandQueue.push({ id: `lct_cmd_${Date.now()}_${cmdCounter}`, ...first.lctCommand });
        }
      }
      const entry = appendEvent({
        type: 'HORDE_CHARGE',
        summary: `Declared ${chg.declarations.length} Horde charge(s).`
      });
      return sendJson(res, 200, { ok: true, declarations: chg.declarations, pendingReactionWindow: liveState.pendingReactionWindow, entry });
    }

    if (req.method === 'POST' && urlPath === '/autopilot/consolidate') {
      liveState.phase = 'HORDE_FIGHT';
      liveState.activePlayerBuffs = pruneExpiredPlayerBuffs(liveState.activePlayerBuffs, liveState.battleRound, liveState.phase);
      const units = liveState.boardTelemetry?.units || [];
      const objs = liveState.boardTelemetry?.objectives || [];
      const horde = units.filter(u => u.side !== 'PLAYER');
      const players = units.filter(u => u.side === 'PLAYER');
      const moves = horde.map(h => ({ unitName: h.name, ...planConsolidationMove(h, players, objs) }));
      moves.forEach(m => {
        if (m.moveCommand) {
          cmdCounter += 1;
          ttsCommandQueue.push({ id: `lct_cmd_${Date.now()}_${cmdCounter}`, ...m.moveCommand });
        }
      });
      const entry = appendEvent({ type: 'CONSOLIDATE', summary: `Resolved 3" Consolidation for ${moves.length} Horde unit(s).` });
      return sendJson(res, 200, { ok: true, moves, entry });
    }

    if (req.method === 'POST' && urlPath === '/overwatch/los-check') {
      const body = await readJsonBody(req);
      const prompt = buildLosVerificationPrompt(liveState, body.transcript || body.query || '');
      const apiKey = options.geminiApiKey ?? env.GEMINI_API_KEY ?? '';
      const model = options.geminiModel || env.GEMINI_VISION_MODEL || 'gemini-2.5-flash';
      const fetchImpl = options.visionFetchFn || (apiKey && typeof fetch === 'function' ? fetch : null);

      let verdict = {
        losBlocked: false,
        revertSquadKey: null,
        blockedPairs: [],
        spokenReply: 'Local Auspex LOS mode: using 3D TTS wall raycasts & 2D terrain footprints (configure TACTICA_THREAD_URL or GEMINI_API_KEY in .env for live screen vision).'
      };
      let mode = 'local-auspex';

      if (typeof activeThreadQueryFn !== 'function' && typeof options.ensureThreadSession === 'function') {
        const ensured = await options.ensureThreadSession();
        if (typeof ensured === 'function') {
          activeThreadQueryFn = ensured;
        } else if (ensured && typeof ensured.queryThread === 'function') {
          activeThreadQueryFn = ensured.queryThread;
        }
      }

      const frameData = body.imageBase64 || body.imageDataUrl || '';
      if (typeof activeThreadQueryFn === 'function') {
        const rawText = await activeThreadQueryFn(prompt, frameData);
        if (rawText) {
          verdict = parseOverwatchVerdict(rawText);
          mode = 'gemini-thread';
        }
      } else if (fetchImpl) {
        const parts = [{ text: prompt }];
        if (frameData) {
          const cleanB64 = String(frameData).replace(/^data:image\/\w+;base64,/, '');
          parts.push({ inline_data: { mime_type: body.mimeType || 'image/jpeg', data: cleanB64 } });
        }
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const gRes = await fetchImpl(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts }] })
        });
        if (gRes && gRes.ok) {
          const gJson = await gRes.json();
          const rawText = gJson?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          verdict = parseOverwatchVerdict(rawText);
          mode = 'gemini-vision';
        }
      }

      if (verdict.blockedPairs.length > 0) {
        liveState.losBlockedPairs = Array.from(new Set([...(liveState.losBlockedPairs || []), ...verdict.blockedPairs]));
      }

      let revertedCommand = null;
      if (verdict.losBlocked && verdict.revertSquadKey && body.autoRevert !== false) {
        const targetPlan = (liveState.lastMovementPlans || []).find(p => p.squadKey === verdict.revertSquadKey);
        const originSource = (liveState.phaseOriginSnapshots || {})[verdict.revertSquadKey] || targetPlan;
        const revCmd = buildMoveRevertCommand(originSource);
        if (revCmd) {
          if (targetPlan) targetPlan.status = 'REVERTED';
          restoreUnitOriginInTelemetry(verdict.revertSquadKey, originSource);
          cmdCounter += 1;
          revertedCommand = { id: `lct_cmd_${Date.now()}_${cmdCounter}`, ...revCmd };
          ttsCommandQueue.push(revertedCommand);
        }
      }

      const entry = appendEvent({
        type: 'OVERWATCH_LOS',
        summary: `${verdict.spokenReply}${revertedCommand ? ` [Auto-Reverted ${verdict.revertSquadKey}]` : ''}`
      });
      return sendJson(res, 200, { ok: true, mode, verdict, revertedCommand, entry });
    }

    if (req.method === 'POST' && urlPath === '/chronicle/compile') {
      const body = await readJsonBody(req);
      const entries = readChronicleFromDisk();
      const report = compileTacticaPostMatchReport(liveState, entries, body);
      return sendJson(res, 200, { ok: true, report, entryCount: entries.length });
    }

    return sendJson(res, 404, { ok: false, error: 'Not found' });
    } catch (err) {
      if (!res.headersSent) {
        return sendJson(res, 500, { ok: false, error: err?.message || 'Internal daemon error' });
      }
      res.end();
    }
  });

  return {
    server,
    tacticaThreadUrl,
    setThreadQueryFn(fn) {
      activeThreadQueryFn = fn;
    },
    start(port = (options.port !== undefined ? options.port : DEFAULT_PORT)) {
      return new Promise((resolve, reject) => {
        server.once('error', reject);
        server.listen(port, '127.0.0.1', () => resolve(server.address().port));
      });
    },
    stop() {
      return new Promise((resolve) => server.close(() => resolve()));
    }
  };
}

if (require.main === module) {
  let activeSession = null;
  let launchingPromise = null;
  let daemon = null;
  const profileDir = resolveTacticaProfileDir();
  const configuredUrl = resolveTacticaThreadUrl();

  const ensureThreadSession = async () => {
    if (activeSession) return activeSession;
    if (!isUsableGeminiThreadUrl(configuredUrl)) return null;
    if (launchingPromise) return launchingPromise;

    launchingPromise = launchTacticaBrowserSession(configuredUrl, {
      onClose: () => {
        activeSession = null;
        if (daemon) daemon.setThreadQueryFn(null);
        console.log('[TACTICA BROWSER] Chrome window closed — LCT HTTP Scribe remains online (will auto-relaunch on next LOS check).');
      }
    }).then((sess) => {
      activeSession = sess;
      if (sess && daemon) {
        daemon.setThreadQueryFn(sess.queryThread);
        console.log('++ TACTICA GEMINI REFEREE THREAD LOCKED & READY (Sign into Google once if prompted) ++');
      }
      return sess;
    }).catch((err) => {
      console.warn(`[TACTICA THREAD WARNING] Could not open chrome_tactica_profile window: ${err.message}`);
      return null;
    }).finally(() => {
      launchingPromise = null;
    });
    return launchingPromise;
  };

  daemon = createTacticaDaemon({ ensureThreadSession });

  const shutdownDaemon = async () => {
    if (activeSession) {
      const s = activeSession;
      activeSession = null;
      await s.close().catch(() => {});
    }
    await daemon.stop().catch(() => {});
    process.exit(0);
  };
  process.once('SIGINT', shutdownDaemon);
  process.once('SIGTERM', shutdownDaemon);
  process.once('SIGBREAK', shutdownDaemon);

  daemon.start(DEFAULT_PORT).then(async (port) => {
    console.log('----------------------------------------------------------------');
    console.log('[SYSTEM DIAGNOSTICS // LCT TACTICA DAEMON & SCRIBE]');
    console.log(` -> HTTP DAEMON       : http://127.0.0.1:${port}`);
    console.log(` -> BROWSER PROFILE   : ${path.basename(profileDir)} (ISOLATED from Vox chrome_vox_profile)`);
    if (isUsableGeminiThreadUrl(daemon.tacticaThreadUrl)) {
      console.log(` -> TACTICA_THREAD_URL: ${daemon.tacticaThreadUrl} (ISOLATED — ALPHA/BETA/GAMMA IGNORED)`);
    } else if (daemon.tacticaThreadUrl) {
      console.log(` -> TACTICA_THREAD_URL: ${daemon.tacticaThreadUrl} [PLACEHOLDER — replace YOUR_NEW_THREAD_ID_HERE in .env]`);
    } else {
      console.log(' -> TACTICA_THREAD_URL: NOT SET in .env (running in local LCT Scribe mode)');
    }
    console.log('----------------------------------------------------------------');

    if (isUsableGeminiThreadUrl(daemon.tacticaThreadUrl)) {
      await ensureThreadSession();
    }
    console.log(`+++ LCT TACTICA DAEMON & SCRIBE ONLINE [http://127.0.0.1:${port}] +++`);
  }).catch((err) => {
    console.error(`[TACTICA DAEMON PORT ERROR] Could not bind 127.0.0.1:${DEFAULT_PORT} (${err.code || err.message}). Is another tactica_daemon window already open?`);
    process.exitCode = 1;
  });
}

module.exports = {
  createTacticaDaemon,
  resolveTacticaThreadUrl,
  resolveTacticaProfileDir,
  isUsableGeminiThreadUrl,
  launchTacticaBrowserSession
};

