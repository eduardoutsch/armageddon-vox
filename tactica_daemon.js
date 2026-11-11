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

