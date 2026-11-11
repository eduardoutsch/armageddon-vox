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

