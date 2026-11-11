# 📦 Fires of Armageddon // Bundle: LCT Tactica Daemon & Test Suites

Zero-dependency local HTTP LCT TTS dice-mat queue, Horde Autopilot & Overwatch Vision LOS routes, append-only JSONL chronicle scribe, and daemon integration tests (`tactica_daemon.js`, `tests/tactica_daemon.test.js`).

## 📑 Table of Contents
- [tactica_daemon.js](#file-tacticadaemonjs)
- [tests/tactica_daemon.test.js](#file-teststacticadaemontestjs)

---

## File: `tactica_daemon.js` <a id="file-tacticadaemonjs"></a>

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
try { require('dotenv').config(); } catch (e) {}

const {
  createInitialTacticaState,
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
const {
  planWaveSpawnCommands,
  planHordeMovementPhase,
  buildMoveRevertCommand,
  selectHordeShootingTargets,
  planHordeCharges,
  resolveHordeChargeRoll,
  planConsolidationMove
} = require('./js/horde-autopilot-core.js');
const {
  buildLosVerificationPrompt,
  parseOverwatchVerdict
} = require('./js/tactica-overwatch-core.js');

const DEFAULT_PORT = Number(process.env.TACTICA_PORT) || 3030;

/**
 * Creates a self-contained LCT Relay & Append-Only Chronicle Daemon instance.
 *
 * @param {object} [options={}] - Daemon configuration (`logDir` override for isolated test folders).
 * @returns {{server: http.Server, start: function(number=): Promise<number>, stop: function(): Promise<void>}}
 */
function createTacticaDaemon(options = {}) {
  const logDir = options.logDir || path.join(__dirname, 'match_logs');
  const statePath = path.join(logDir, 'live_state.json');
  const chroniclePath = path.join(logDir, 'match_chronicle.jsonl');

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
        ttsQueueLength: ttsCommandQueue.length
      });
    }

    if (req.method === 'GET' && urlPath === '/tts/poll') {
      if (ttsCommandQueue.length === 0) {
        res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8', 'Access-Control-Allow-Origin': '*' });
        return res.end('IDLE');
      }
      return sendJson(res, 200, ttsCommandQueue.shift());
    }

    if (req.method === 'POST' && urlPath === '/session/sync') {
      const body = await readJsonBody(req);
      if (body.roomCode !== undefined) liveState.roomCode = String(body.roomCode).trim().toUpperCase();
      if (body.battleRound !== undefined) liveState.battleRound = Number(body.battleRound);
      if (body.phase !== undefined) liveState.phase = body.phase;
      if (body.factionName !== undefined) liveState.factionName = body.factionName;
      if (body.playerCp !== undefined) liveState.playerCp = Number(body.playerCp);
      if (body.playerSp !== undefined) liveState.playerSp = Number(body.playerSp);
      if (Array.isArray(body.activeMiseryIds)) liveState.activeMiseryIds = body.activeMiseryIds;
      if (Array.isArray(body.activeFortifications)) liveState.activeFortifications = body.activeFortifications;
      if (Array.isArray(body.zoneSpawns)) liveState.zoneSpawns = body.zoneSpawns;
      savePersistedState();
      return sendJson(res, 200, { ok: true, state: liveState });
    }

    if (req.method === 'POST' && urlPath === '/chronicle/append') {
      const body = await readJsonBody(req);
      if (body.phase) liveState.phase = body.phase;
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

    if (req.method === 'POST' && urlPath === '/tts/telemetry') {
      const body = await readJsonBody(req);
      let units = Array.isArray(body.units) ? body.units : [];
      let objectives = Array.isArray(body.objectives) ? body.objectives : [];

      if (Array.isArray(body.objects)) {
        const normalized = normalizeTtsBoardScan(body);
        units = normalized.units;
        objectives = normalized.objectives;
      }

      liveState.boardTelemetry = { updatedAt: Date.now(), units, objectives };

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
      const resPlan = planWaveSpawnCommands(body.zoneSpawns || liveState.zoneSpawns, body.spawnZones || []);
      resPlan.commands.forEach(c => {
        cmdCounter += 1;
        ttsCommandQueue.push({ id: `lct_cmd_${Date.now()}_${cmdCounter}`, ...c });
      });
      const entry = appendEvent({ type: 'SPAWN_WAVE', summary: resPlan.summary });
      return sendJson(res, 200, { ok: true, ...resPlan, entry, queueLength: ttsCommandQueue.length });
    }

    if (req.method === 'POST' && urlPath === '/autopilot/plan-movement') {
      const body = await readJsonBody(req);
      liveState.phase = 'HORDE_MOVEMENT';
      const moveRes = planHordeMovementPhase(liveState.boardTelemetry, liveState, body);
      liveState.lastMovementPlans = moveRes.plans;
      moveRes.commands.forEach(c => {
        cmdCounter += 1;
        ttsCommandQueue.push({ id: `lct_cmd_${Date.now()}_${cmdCounter}`, ...c });
      });
      const entry = appendEvent({
        type: 'HORDE_MOVE',
        summary: `Moved ${moveRes.plans.length} Horde squad(s) — awaiting Pre-Overwatch LOS check.`
      });
      return sendJson(res, 200, { ok: true, plans: moveRes.plans, entry, queueLength: ttsCommandQueue.length });
    }

    if (req.method === 'POST' && urlPath === '/autopilot/revert-move') {
      const body = await readJsonBody(req);
      const plans = liveState.lastMovementPlans || [];
      const targetPlan = plans.find(p => p.squadKey === body.squadKey) || plans[Number(body.planIndex) || 0];
      const cmd = buildMoveRevertCommand(targetPlan);
      if (!cmd) return sendJson(res, 400, { ok: false, error: 'No stored origin snapshot' });
      cmdCounter += 1;
      ttsCommandQueue.push({ id: `lct_cmd_${Date.now()}_${cmdCounter}`, ...cmd });
      const entry = appendEvent({ type: 'MOVE_REVERT', summary: `Reverted ${cmd.unitName} to pre-move origin (No LOS).` });
      return sendJson(res, 200, { ok: true, command: cmd, entry });
    }

    if (req.method === 'POST' && urlPath === '/autopilot/select-shooting') {
      const body = await readJsonBody(req);
      liveState.phase = 'HORDE_SHOOTING';
      const mergedBlocked = Array.from(new Set([
        ...(liveState.losBlockedPairs || []),
        ...(body.losBlockedPairs || [])
      ]));
      const assignments = selectHordeShootingTargets(liveState.boardTelemetry, liveState, {
        ...body,
        losBlockedPairs: mergedBlocked
      });
      liveState.lastShootingAssignments = assignments;
      return sendJson(res, 200, { ok: true, assignments, losBlockedPairs: mergedBlocked });
    }

    if (req.method === 'POST' && urlPath === '/autopilot/declare-charges') {
      const body = await readJsonBody(req);
      liveState.phase = 'HORDE_CHARGE';
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
      const prompt = buildLosVerificationPrompt(liveState, body.transcript || '');
      const apiKey = options.geminiApiKey ?? process.env.GEMINI_API_KEY ?? '';
      const model = options.geminiModel || process.env.GEMINI_VISION_MODEL || 'gemini-2.5-flash';
      const fetchImpl = options.visionFetchFn || (apiKey && typeof fetch === 'function' ? fetch : null);

      let verdict = {
        losBlocked: false,
        revertSquadKey: null,
        blockedPairs: [],
        spokenReply: 'Offline LOS mode: add GEMINI_API_KEY in .env for automatic TTS screen vision, or click Revert Move manually.'
      };
      let mode = 'offline';

      if (fetchImpl) {
        const parts = [{ text: prompt }];
        if (body.imageBase64) {
          const cleanB64 = String(body.imageBase64).replace(/^data:image\/\w+;base64,/, '');
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
        const revCmd = buildMoveRevertCommand(targetPlan);
        if (revCmd) {
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
  });

  return {
    server,
    start(port = DEFAULT_PORT) {
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
  createTacticaDaemon().start(DEFAULT_PORT).then((port) => {
    console.log(`+++ LCT TACTICA DAEMON & SCRIBE ONLINE [http://127.0.0.1:${port}] +++`);
  });
}

module.exports = { createTacticaDaemon };

````

---

## File: `tests/tactica_daemon.test.js` <a id="file-teststacticadaemontestjs"></a>

````javascript
/**
 * @fileoverview Integration tests for tactica_daemon.js LCT dice-mat queue, JSONL persistence & restarts.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { createTacticaDaemon } = require('../tactica_daemon.js');

async function postJson(baseUrl, route, body) {
  const res = await fetch(`${baseUrl}${route}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return res.json();
}

test('tactica_daemon: orchestrates multi-stage LCT dice-mat rolls via /tts/poll & /tts/dice-result and persists JSONL', async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'foa-lct-daemon-'));
  const daemon1 = createTacticaDaemon({
    logDir: tmpDir,
    visionFetchFn: async () => ({
      ok: true,
      json: async () => ({
        candidates: [{
          content: {
            parts: [{
              text: '{"losBlocked":true,"revertSquadKey":"HORDE::Overlord","blockedPairs":["HORDE::Overlord->PLAYER::Krieg"],"spokenReply":"Ruin wall blocks LOS; reverting Overlord."}'
            }]
          }
        }]
      })
    })
  });
  const port1 = await daemon1.start(0);
  const url1 = `http://127.0.0.1:${port1}`;

  try {
    // CORS preflight & state endpoint
    const optRes = await fetch(`${url1}/state`, { method: 'OPTIONS' });
    assert.equal(optRes.status, 204);

    await postJson(url1, '/session/sync', {
      roomCode: 'HADES-44',
      battleRound: 1,
      phase: 'PLAYER_TURN',
      factionName: 'Necrons',
      playerCp: 2,
      playerSp: 6,
      activeMiseryIds: [30],
      activeFortifications: ['FORT_TRENCH'],
      zoneSpawns: ['10 Necron Warriors']
    });

    const stateSnap = await (await fetch(`${url1}/state`)).json();
    assert.equal(stateSnap.ok, true);
    assert.equal(stateSnap.state.roomCode, 'HADES-44');

    // Reaction window trigger & resolution
    const reactEvt = await postJson(url1, '/chronicle/append', {
      phase: 'HORDE_MOVEMENT',
      type: 'PHASE',
      summary: 'Horde movement complete.',
      reactionTrigger: 'END_OF_HORDE_MOVEMENT'
    });
    assert.equal(reactEvt.pendingReactionWindow.open, true);

    const resolvedReact = await postJson(url1, '/reaction/resolve', {
      choice: 'FIRE_OVERWATCH',
      cpSpent: 1
    });
    assert.equal(resolvedReact.state.playerCp, 1);

    // 1. Request Auto-Defender sequence -> must NOT resolve yet, must queue SAVES on /tts/poll!
    const reqDef = await postJson(url1, '/combat/defend-request', {
      unitName: 'Necron Warriors',
      defender: { save: 4, woundsPerModel: 1, keywords: ['INFANTRY'] },
      incomingAttack: { type: 'ranged', strength: 5, ap: -1, damage: 1 },
      options: { numWounds: 2, damagePerWound: 1, startingModels: 10 }
    });
    assert.equal(reqDef.ok, true);
    assert.equal(reqDef.sequence.stage, 'SAVES');

    // TTS LCT poller fetches Stage 1 command (2x Saves at 5+)
    const pollSaves = await (await fetch(`${url1}/tts/poll`)).json();
    assert.equal(pollSaves.action, 'LCT_MAT_ROLL');
    assert.equal(pollSaves.stage, 'SAVES');
    assert.equal(pollSaves.count, 2);

    // LCT mat finishes rolling [2 (fail), 6 (pass)] and posts back -> daemon queues Stage 2 FNP (1 die at 5+)
    const resSaves = await postJson(url1, '/tts/dice-result', {
      rollId: pollSaves.rollId,
      sequenceId: pollSaves.sequenceId,
      dice: [2, 6]
    });
    assert.equal(resSaves.sequence.stage, 'FNP');

    const pollFnp = await (await fetch(`${url1}/tts/poll`)).json();
    assert.equal(pollFnp.stage, 'FNP');
    assert.equal(pollFnp.count, 1);

    // LCT mat rolls [4 (fail FNP)] -> 1 Warrior slain -> daemon queues Stage 3 Misery #30 ON_DEATH (1 die at 4+)
    const resFnp = await postJson(url1, '/tts/dice-result', {
      rollId: pollFnp.rollId,
      sequenceId: pollFnp.sequenceId,
      dice: [4]
    });
    assert.equal(resFnp.sequence.stage, 'ON_DEATH');

    const pollDeath = await (await fetch(`${url1}/tts/poll`)).json();
    assert.equal(pollDeath.stage, 'ON_DEATH');
    assert.equal(pollDeath.count, 1);

    // LCT mat rolls [5 (triggers shoot-on-death!)] -> sequence completes and writes chronicle!
    const resDeath = await postJson(url1, '/tts/dice-result', {
      rollId: pollDeath.rollId,
      sequenceId: pollDeath.sequenceId,
      dice: [5]
    });
    assert.equal(resDeath.sequence.stage, 'COMPLETE');
    assert.equal(resDeath.sequence.outcome.modelsSlain, 1);
    assert.equal(resDeath.sequence.outcome.onDeathTriggers, 1);

    // Queue is now IDLE
    assert.equal(await (await fetch(`${url1}/tts/poll`)).text(), 'IDLE');

    // Horde Attack sequence + standalone roll + custom command enqueue + 404 check
    const reqAtk = await postJson(url1, '/combat/attack-request', {
      attackerName: 'Immortals',
      targetName: 'Cadians',
      target: { toughness: 3 },
      weapon: { type: 'ranged', attacks: 1, skill: 3, strength: 5, ap: -1, damage: 1 }
    });
    assert.equal(reqAtk.sequence.stage, 'HITS');
    const pollHits = await (await fetch(`${url1}/tts/poll`)).json();
    await postJson(url1, '/tts/dice-result', { sequenceId: pollHits.sequenceId, dice: [5] });
    const pollWounds = await (await fetch(`${url1}/tts/poll`)).json();
    const atkDone = await postJson(url1, '/tts/dice-result', { sequenceId: pollWounds.sequenceId, dice: [4] });
    assert.equal(atkDone.sequence.stage, 'COMPLETE');

    const standalone = await postJson(url1, '/tts/dice-result', { label: 'Battle-shock', dice: [6, 3] });
    assert.equal(standalone.sequence, null);

    const enq = await postJson(url1, '/tts/enqueue', { action: 'SPAWN_PING', zone: 1 });
    assert.equal(enq.ok, true);
    const popped = await (await fetch(`${url1}/tts/poll`)).json();
    assert.equal(popped.action, 'SPAWN_PING');

    // Raw TTS Yellowscribe objects telemetry parses datasheets, computes objective distance & locks Horde Warlord
    const telRaw = await postJson(url1, '/tts/telemetry', {
      objects: [
        {
          guid: 'w1',
          name: '5/5 Technomancer',
          tags: ['HORDE'],
          pos: { x: 0, y: 1, z: 8 },
          bounds: { x: 1.57, y: 2.0, z: 1.57 },
          description: 'M: 6" T: 5 Sv: 3+ W: 5 Ld: 6+ OC: 2\nInvuln: 4+\nKeywords: Infantry, Character'
        },
        {
          guid: 'obj1',
          name: 'Objective 1',
          pos: { x: 0, y: 1, z: 0 },
          bounds: { x: 1.57, y: 0.1, z: 1.57 }
        }
      ]
    });
    assert.equal(telRaw.trackedUnits, 1);
    assert.equal(telRaw.objectives, 1);
    assert.equal(telRaw.warlord.name, 'Technomancer');
    assert.ok(typeof telRaw.units[0].closestObjective.distanceInches === 'number');
    assert.ok(telRaw.units[0].closestObjective.distanceInches > 6 && telRaw.units[0].closestObjective.distanceInches < 7);

    // Subsequent pre-parsed units telemetry preserves locked Horde Warlord & sets up Autopilot check
    const tel = await postJson(url1, '/tts/telemetry', {
      units: [
        {
          squadKey: 'HORDE::Overlord',
          guid: 'w2',
          guids: ['w2'],
          name: 'Overlord',
          side: 'HORDE',
          move: 5,
          pos: { x: 0, z: 9 },
          keywords: ['INFANTRY', 'CHARACTER'],
          weapons: [{ name: 'Tachyon Arrow', type: 'ranged', rangeInches: 72, attacks: 1, skill: 2, strength: 16, ap: -5, damage: 'D6+2', keywords: [] }],
          models: [{ guid: 'w2', pos: { x: 0, y: 1.1, z: 9 }, radiusInches: 0.78 }]
        },
        {
          squadKey: 'PLAYER::Krieg',
          guid: 'p1',
          guids: ['p1'],
          name: 'Death Korps',
          side: 'PLAYER',
          pos: { x: 0, z: 0 },
          keywords: ['INFANTRY'],
          models: [{ guid: 'p1', pos: { x: 0, y: 1.1, z: 0 }, radiusInches: 0.5 }]
        }
      ]
    });
    assert.equal(tel.warlord.name, 'Technomancer');

    // Autopilot spawn-waves, select-shooting & movement -> enqueues SPAWN_WAVE & MOVE_UNIT
    const spw = await postJson(url1, '/autopilot/spawn-waves', {
      zoneSpawns: [{ zone: 1, bracketKey: '5-6', units: ['5 Immortals'] }]
    });
    assert.equal(spw.ok, true);
    assert.equal((await (await fetch(`${url1}/tts/poll`)).json()).action, 'SPAWN_WAVE');

    const sht = await postJson(url1, '/autopilot/select-shooting', {});
    assert.equal(sht.ok, true);
    assert.equal(sht.assignments.length, 1);

    const mv = await postJson(url1, '/autopilot/plan-movement', {});
    assert.equal(mv.ok, true);
    assert.equal(mv.plans.length, 1);
    const pollMv = await (await fetch(`${url1}/tts/poll`)).json();
    assert.equal(pollMv.action, 'MOVE_UNIT');

    const rev = await postJson(url1, '/autopilot/revert-move', { squadKey: 'HORDE::Overlord' });
    assert.equal(rev.ok, true);
    const pollRev = await (await fetch(`${url1}/tts/poll`)).json();
    assert.equal(pollRev.action, 'REVERT_MOVE');

    // Autopilot declare-charges -> queues 2D6 LCT_MAT_ROLL -> settled [6, 5] enqueues MOVE_UNIT
    const chg = await postJson(url1, '/autopilot/declare-charges', {});
    assert.equal(chg.declarations.length, 1);
    const pollChgRoll = await (await fetch(`${url1}/tts/poll`)).json();
    assert.equal(pollChgRoll.action, 'LCT_MAT_ROLL');
    assert.equal(pollChgRoll.stage, 'CHARGE_ROLL');
    const chgSettled = await postJson(url1, '/tts/dice-result', {
      sequenceId: pollChgRoll.sequenceId,
      dice: [6, 5]
    });
    assert.equal(chgSettled.chargeResult.succeeded, true);
    const pollChgMove = await (await fetch(`${url1}/tts/poll`)).json();
    assert.equal(pollChgMove.action, 'MOVE_UNIT');

    const cons = await postJson(url1, '/autopilot/consolidate', {});
    assert.equal(cons.ok, true);
    assert.equal(cons.moves.length, 1);

    // Overwatch LOS Check -> auto-enqueues REVERT_MOVE & filters blockedPairs from subsequent shooting!
    const losRes = await postJson(url1, '/overwatch/los-check', {
      transcript: 'Can Overlord see Krieg behind solid ruin?',
      imageBase64: 'data:image/jpeg;base64,AAAA'
    });
    assert.equal(losRes.mode, 'gemini-vision');
    assert.equal(losRes.verdict.losBlocked, true);
    const pollLosRevert = await (await fetch(`${url1}/tts/poll`)).json();
    assert.equal(pollLosRevert.action, 'REVERT_MOVE');

    const shtAfterBlock = await postJson(url1, '/autopilot/select-shooting', {});
    assert.equal(shtAfterBlock.assignments.length, 0, 'losBlockedPairs must filter out blocked HORDE::Overlord->PLAYER::Krieg');

    const notFound = await fetch(`${url1}/unknown`);
    assert.equal(notFound.status, 404);
  } finally {
    await daemon1.stop();
  }

  // 2. Restart daemon on same folder -> zero memory loss
  const daemon2 = createTacticaDaemon({ logDir: tmpDir });
  const port2 = await daemon2.start(0);
  const url2 = `http://127.0.0.1:${port2}`;
  try {
    const compiled = await postJson(url2, '/chronicle/compile', { channel: 'alpha' });
    assert.ok(compiled.report.includes('Necron Warriors'));
    assert.ok(compiled.report.includes('Technomancer'));
  } finally {
    await daemon2.stop();
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

````
