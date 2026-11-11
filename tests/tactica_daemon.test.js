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

