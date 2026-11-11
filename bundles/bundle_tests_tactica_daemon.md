# 📦 Fires of Armageddon // Bundle: Tactica Daemon Integration Tests

Tactica Daemon HTTP, Deep Strike ingress/fallback queue, neural audio cache, Clipboard LOS paste, and .env routing tests (`tests/tactica_daemon.test.js`).

## 📑 Table of Contents
- [tests/tactica_daemon.test.js](#file-teststacticadaemontestjs)

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
const {
  createTacticaDaemon,
  resolveTacticaThreadUrl,
  resolveTacticaProfileDir,
  isUsableGeminiThreadUrl,
  launchTacticaBrowserSession
} = require('../tactica_daemon.js');

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

    // Consecutive /tts/telemetry scans lock duplicate-datasheet GUIDs across turns even when squads converge to 0.1" apart
    const deployScan = await postJson(url1, '/tts/telemetry', {
      objects: [
        { guid: 'imm-a1', name: '1/1 Immortals', tags: ['HORDE'], pos: { x: -10, y: 1, z: 14 }, bounds: { x: 1.26, y: 1.5, z: 1.26 }, description: 'M: 5" T: 5 Sv: 3+ W: 1\nKeywords: Infantry' },
        { guid: 'imm-b1', name: '1/1 Immortals', tags: ['HORDE'], pos: { x: 10, y: 1, z: 14 }, bounds: { x: 1.26, y: 1.5, z: 1.26 }, description: 'M: 5" T: 5 Sv: 3+ W: 1\nKeywords: Infantry' }
      ]
    });
    assert.equal(deployScan.trackedUnits, 2);
    const convergedScan = await postJson(url1, '/tts/telemetry', {
      objects: [
        { guid: 'imm-a1', name: '1/1 Immortals', tags: ['HORDE'], pos: { x: 0, y: 1, z: 2 }, bounds: { x: 1.26, y: 1.5, z: 1.26 }, description: 'M: 5" T: 5 Sv: 3+ W: 1\nKeywords: Infantry' },
        { guid: 'imm-b1', name: '1/1 Immortals', tags: ['HORDE'], pos: { x: 1.3, y: 1, z: 2 }, bounds: { x: 1.26, y: 1.5, z: 1.26 }, description: 'M: 5" T: 5 Sv: 3+ W: 1\nKeywords: Infantry' }
      ]
    });
    assert.equal(convergedScan.trackedUnits, 2, 'Daemon must preserve GUID-locked #1/#2 squads when they move 0.04" apart');

    // Casualty off-mat on Scan 3 followed by Reanimation return on Scan 4 remembers dead GUID in squadGuidRegistry
    await postJson(url1, '/tts/telemetry', {
      objects: [
        { guid: 'imm-b1', name: '1/1 Immortals', tags: ['HORDE'], pos: { x: 1.3, y: 1, z: 2 }, bounds: { x: 1.26, y: 1.5, z: 1.26 }, description: 'M: 5" T: 5 Sv: 3+ W: 1\nKeywords: Infantry' }
      ]
    });
    const reanimatedScan = await postJson(url1, '/tts/telemetry', {
      objects: [
        { guid: 'imm-a1', name: '1/1 Immortals', tags: ['HORDE'], pos: { x: 0, y: 1, z: 2 }, bounds: { x: 1.26, y: 1.5, z: 1.26 }, description: 'M: 5" T: 5 Sv: 3+ W: 1\nKeywords: Infantry' },
        { guid: 'imm-b1', name: '1/1 Immortals', tags: ['HORDE'], pos: { x: 1.3, y: 1, z: 2 }, bounds: { x: 1.26, y: 1.5, z: 1.26 }, description: 'M: 5" T: 5 Sv: 3+ W: 1\nKeywords: Infantry' }
      ]
    });
    assert.equal(reanimatedScan.trackedUnits, 2, 'Daemon squadGuidRegistry must remember resurrected imm-a1 as Immortals #1');

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

    // Autopilot spawn-waves, disembark, select-shooting & movement -> enqueues SPAWN_WAVE, DISEMBARK_CARGO & MOVE_UNIT
    const spw = await postJson(url1, '/autopilot/spawn-waves', {
      zoneSpawns: [{ zone: 1, bracketKey: '5-6', units: ['5 Immortals'] }]
    });
    assert.equal(spw.ok, true);
    assert.equal((await (await fetch(`${url1}/tts/poll`)).json()).action, 'SPAWN_WAVE');

    const badDisembark = await fetch(`${url1}/autopilot/disembark`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ squadKey: 'HORDE::Overlord' })
    });
    assert.equal(badDisembark.status, 400, 'Disembarking a unit without embarkedCargo must return 400');

    const disembarkRes = await postJson(url1, '/autopilot/disembark', {
      transportUnit: {
        squadKey: 'HORDE::Corvus Blackstar',
        guid: 'corvus-d1',
        name: 'Corvus Blackstar',
        side: 'HORDE',
        pos: { x: 4, z: 12 },
        models: [{ guid: 'corvus-d1', pos: { x: 4, z: 12 }, radiusInches: 2.0 }],
        embarkedCargo: [
          { count: 5, templateName: 'Kill Team' },
          { count: 1, templateName: 'Watch Master' }
        ]
      }
    });
    assert.equal(disembarkRes.ok, true);
    assert.equal(disembarkRes.command.action, 'DISEMBARK_CARGO');
    assert.equal((await (await fetch(`${url1}/tts/poll`)).json()).action, 'DISEMBARK_CARGO');

    // Round 2 Deep Strike reserve gating -> /autopilot/spawn-waves holds in hordeReserves -> /autopilot/plan-movement pops DEEP_STRIKE_DROP > 8.0"
    await postJson(url1, '/session/sync', {
      battleRound: 2,
      zoneSpawns: [{ zone: 1, bracketKey: '7-9', units: ['5 Terminator Squad'] }]
    });
    const dsWave = await postJson(url1, '/autopilot/spawn-waves', {});
    assert.equal(dsWave.commands.length, 0, 'Round 2 Terminator Squad must hold in Deep Strike reserves rather than immediate SPAWN_WAVE');
    assert.equal(dsWave.queuedReserves.length, 1);
    const stMid = await (await fetch(`${url1}/state`)).json();
    assert.equal(stMid.state.hordeReserves.length, 1);

    const dsMove = await postJson(url1, '/autopilot/plan-movement', {});
    assert.equal(dsMove.ingressDrops.length, 1);
    assert.ok(dsMove.ingressDrops[0].closestEnemyDistanceInches > 8.0);
    // Drain Overlord's MOVE_UNIT then fallback Terminators' DEEP_STRIKE_DROP to Spawn Zone 1 via /autopilot/fallback-ingress
    const firstPoll = await (await fetch(`${url1}/tts/poll`)).json();
    assert.equal(firstPoll.action, 'MOVE_UNIT');
    const fbIngress = await postJson(url1, '/autopilot/fallback-ingress', { dropIndex: 0 });
    assert.equal(fbIngress.ok, true);
    assert.equal(fbIngress.command.action, 'FALLBACK_INGRESS_TO_SPAWN');
    const secondPoll = await (await fetch(`${url1}/tts/poll`)).json();
    assert.equal(secondPoll.action, 'FALLBACK_INGRESS_TO_SPAWN', 'Fallback must replace unpolled DEEP_STRIKE_DROP and enqueue FALLBACK_INGRESS_TO_SPAWN');

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

    // Sync Imperial Knights faction, verify /tts/telemetry auto-detects Votann as PLAYER & rejects props/off-board, then flip side via /tts/set-side
    await postJson(url1, '/session/sync', { factionName: 'Imperial Knights' });
    const telFaction = await postJson(url1, '/tts/telemetry', {
      playmatBounds: { minX: -22.5, maxX: 22.5, minZ: -30.5, maxZ: 30.5 },
      objects: [
        { guid: 'cam1', name: 'Blue dice camera', locked: true, pos: { x: 5, y: 2, z: 5 }, bounds: { x: 1, y: 1, z: 1 } },
        { guid: 'gork1', name: '18/18 Gorkanaut', tags: ['HORDE'], pos: { x: -45, y: 1, z: 60 }, bounds: { x: 5, y: 6, z: 5 }, description: 'M: 8" T: 12 Sv: 3+ W: 18 Ld: 7+ OC: 8\nKeywords: Vehicle, Orks' },
        { guid: 'vot1', name: 'Hearthkyn Warriors', locked: false, pos: { x: 0, y: 1, z: -8 }, bounds: { x: 1.1, y: 1.4, z: 1.1 }, description: 'M: 5" T: 5 Sv: 4+ W: 1 Ld: 7+ OC: 2\nKeywords: Infantry, Leagues of Votann' },
        { guid: 'arm1', name: '12/12 Armiger Warglaive', locked: false, pos: { x: 0, y: 1, z: 12 }, bounds: { x: 3.9, y: 4.5, z: 3.9 }, description: 'M: 12" T: 10 Sv: 3+ W: 12 Ld: 7+ OC: 8\nKeywords: Vehicle, Walker, Armiger' }
      ]
    });
    assert.equal(telFaction.trackedUnits, 2);
    const votUnit = telFaction.units.find(u => u.name === 'Hearthkyn Warriors');
    const armUnit = telFaction.units.find(u => u.name === 'Armiger Warglaive');
    assert.equal(votUnit.side, 'PLAYER');
    assert.equal(armUnit.side, 'HORDE');

    const flipped = await postJson(url1, '/tts/set-side', {
      squadKey: votUnit.squadKey,
      guids: votUnit.guids,
      side: 'HORDE'
    });
    assert.equal(flipped.ok, true);
    assert.equal(flipped.units.find(u => u.name === 'Hearthkyn Warriors').side, 'HORDE');
    const pollSetSide = await (await fetch(`${url1}/tts/poll`)).json();
    assert.equal(pollSetSide.action, 'SET_UNIT_SIDE');
    assert.equal(pollSetSide.side, 'HORDE');
    assert.deepEqual(pollSetSide.guids, ['vot1']);

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

test('tactica_daemon.bat: Windows launcher script switches to repo directory and invokes npm run tactica:daemon', () => {
  const batPath = path.resolve(__dirname, '../tactica_daemon.bat');
  assert.equal(fs.existsSync(batPath), true, 'tactica_daemon.bat must exist in /dealer root');
  const content = fs.readFileSync(batPath, 'utf8');
  assert.ok(content.includes('cd /d "%~dp0"'), 'Must switch working directory to script folder');
  assert.ok(content.includes('npm run tactica:daemon'), 'Must execute npm run tactica:daemon');
  assert.ok(content.includes('pause'), 'Must pause on exit so terminal diagnostics remain readable');
});

test('resolveTacticaThreadUrl: strictly selects TACTICA_THREAD_URL and ignores Alpha/Beta/Gamma/Supabase URLs', () => {
  assert.equal(typeof resolveTacticaThreadUrl, 'function');
  assert.equal(typeof isUsableGeminiThreadUrl, 'function');

  const resolved = resolveTacticaThreadUrl({
    SUPABASE_URL: 'https://dsfvhjjalexqpbzqoaqb.supabase.co',
    TACTICA_THREAD_URL: '  https://gemini.google.com/app/tactica999  ',
    ALPHA_THREAD_URL: 'https://gemini.google.com/app/32b1c53a813d15a3',
    BETA_THREAD_URL: 'https://gemini.google.com/app/0c0b15a075182321',
    GAMMA_THREAD_URL: 'https://gemini.google.com/app/793dd9d2bd84ad35'
  });
  assert.equal(resolved, 'https://gemini.google.com/app/tactica999');

  const withoutTactica = resolveTacticaThreadUrl({
    SUPABASE_URL: 'https://dsfvhjjalexqpbzqoaqb.supabase.co',
    ALPHA_THREAD_URL: 'https://gemini.google.com/app/32b1c53a813d15a3',
    BETA_THREAD_URL: 'https://gemini.google.com/app/0c0b15a075182321',
    GAMMA_THREAD_URL: 'https://gemini.google.com/app/793dd9d2bd84ad35'
  });
  assert.equal(withoutTactica, '', 'Must never fall back to ALPHA/BETA/GAMMA_THREAD_URL');

  assert.equal(isUsableGeminiThreadUrl('https://gemini.google.com/app/YOUR_NEW_THREAD_ID_HERE'), false);
  assert.equal(isUsableGeminiThreadUrl('https://gemini.google.com/app/<your-tactica-thread-id>'), false);
  assert.equal(isUsableGeminiThreadUrl('https://gemini.google.com/app/tactica999'), true);
  assert.equal(isUsableGeminiThreadUrl('https://gemini.google.com/app'), true, 'Must accept bare https://gemini.google.com/app URL');
  assert.equal(isUsableGeminiThreadUrl('https://gemini.google.com/app/'), true, 'Must accept bare https://gemini.google.com/app/ URL');
});

test('launchTacticaBrowserSession -> queryThread: clears editor and inserts promptText BEFORE dispatching ClipboardEvent paste so Ctrl+A + Backspace never deletes the screenshot', async () => {
  const ops = [];
  let evalSnapCall = 0;
  const mockInput = {
    click: async () => { ops.push('click-input'); }
  };
  const mockSendBtn = {
    count: async () => 1,
    isEnabled: async () => true,
    click: async () => { ops.push('click-send'); }
  };
  const mockModelResponses = {
    count: async () => 1
  };
  const mockPage = {
    goto: async () => { ops.push('goto'); },
    waitForSelector: async () => {},
    waitForTimeout: async () => {},
    url: () => 'https://gemini.google.com/app',
    locator: (sel) => {
      if (sel === 'model-response') return mockModelResponses;
      if (sel.includes('send-button') || sel.includes('Send')) return mockSendBtn;
      return { first: () => mockInput };
    },
    keyboard: {
      press: async (k) => { ops.push(`key:${k}`); },
      insertText: async (t) => { ops.push(`insertText:${t.slice(0, 12)}`); }
    },
    evaluate: async (fn, arg) => {
      if (arg && arg.b64 !== undefined) {
        ops.push('paste-image');
        return undefined;
      }
      evalSnapCall += 1;
      return {
        count: 2,
        text: '{"losBlocked":true,"revertSquadKey":"HORDE::1","blockedPairs":[],"spokenReply":"Blocked by ruin."}',
        isGenerating: false
      };
    },
    close: async () => {}
  };
  mockSendBtn.first = () => mockSendBtn;

  const mockChromium = {
    launchPersistentContext: async () => ({
      pages: () => [mockPage],
      newPage: async () => mockPage,
      on: () => {},
      close: async () => {}
    })
  };

  const session = await launchTacticaBrowserSession('https://gemini.google.com/app', {
    env: {},
    baseDir: os.tmpdir(),
    chromium: mockChromium
  });
  assert.ok(session, 'launchTacticaBrowserSession must accept bare https://gemini.google.com/app');

  const reply = await session.queryThread('Verify LOS prompt', 'data:image/jpeg;base64,AAAA');
  assert.ok(reply.includes('"losBlocked":true'));
  assert.ok(evalSnapCall >= 2);

  const ctrlAIdx = ops.indexOf('key:Control+A');
  const backspaceIdx = ops.indexOf('key:Backspace');
  const insertIdx = ops.findIndex(o => o.startsWith('insertText:'));
  const pasteIdx = ops.indexOf('paste-image');
  const sendIdx = ops.indexOf('click-send');

  assert.ok(ctrlAIdx >= 0 && backspaceIdx > ctrlAIdx && insertIdx > backspaceIdx, 'Must clear editor and insert promptText');
  assert.ok(pasteIdx > insertIdx, `ClipboardEvent paste (${pasteIdx}) MUST happen AFTER Ctrl+A/Backspace/insertText (${insertIdx}) so screenshot is not deleted`);
  assert.ok(sendIdx > pasteIdx, `Send click (${sendIdx}) MUST happen AFTER ClipboardEvent paste (${pasteIdx})`);
  await session.close();
});

test('resolveTacticaProfileDir & launchTacticaBrowserSession: strictly isolates chrome_tactica_profile from chrome_vox_profile so both terminals run concurrently without crashing', async () => {
  assert.equal(typeof resolveTacticaProfileDir, 'function');
  const baseDir = path.resolve(__dirname, '..');
  const defaultDir = resolveTacticaProfileDir({}, baseDir);
  assert.equal(defaultDir, path.join(baseDir, 'chrome_tactica_profile'));
  assert.notEqual(defaultDir, path.join(baseDir, 'chrome_vox_profile'));

  // Guard against accidental .env collision pointing Tactica at chrome_vox_profile
  const guardedDir = resolveTacticaProfileDir(
    { TACTICA_PROFILE_DIR: path.join(baseDir, 'chrome_vox_profile') },
    baseDir
  );
  assert.equal(guardedDir, path.join(baseDir, 'chrome_tactica_profile'));

  const launchedDirs = [];
  const mockPage = {
    goto: async () => {},
    waitForSelector: async () => {},
    url: () => 'https://gemini.google.com/app/tactica999',
    close: async () => {}
  };
  const mockChromium = {
    launchPersistentContext: async (dir) => {
      launchedDirs.push(dir);
      return {
        pages: () => [mockPage],
        newPage: async () => mockPage,
        on: () => {},
        close: async () => {}
      };
    }
  };

  const session = await launchTacticaBrowserSession('https://gemini.google.com/app/tactica999', {
    env: {},
    baseDir,
    chromium: mockChromium
  });
  assert.ok(session, 'Must return active Tactica browser session');
  assert.equal(launchedDirs.length, 1, 'Must launch Chromium strictly once');
  assert.equal(launchedDirs[0], path.join(baseDir, 'chrome_tactica_profile'));
  assert.equal(
    launchedDirs.some((d) => d.includes('chrome_vox_profile')),
    false,
    'Must NEVER touch chrome_vox_profile'
  );
  await session.close();
});

test('POST /audio/speak & Clipboard LOS paste: caches SHA-256 neural Auspex MP3s in audio_cache/ and pastes TTS LOS frames via ClipboardEvent', async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'tactica-audio-test-'));
  let synthCallCount = 0;
  const daemon = createTacticaDaemon({
    logDir: tmpDir,
    ttsSynthesizeFn: async (text, preset, destFile) => {
      synthCallCount += 1;
      const fakeMp3 = Buffer.from(`MP3:${preset.voice}:${text}`);
      fs.writeFileSync(destFile, fakeMp3);
      return fakeMp3;
    }
  });
  const port = await daemon.start(0);
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    const emptyRes = await fetch(`${baseUrl}/audio/speak`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: '   ', theme: 'votann' })
    });
    assert.equal(emptyRes.status, 400);

    const call1 = await postJson(baseUrl, '/audio/speak', {
      text: 'Void Armour active. One Command Point deducted.',
      theme: 'votann'
    });
    assert.equal(call1.ok, true);
    assert.equal(call1.cached, false, 'First call must synthesize fresh MP3');
    assert.equal(call1.voice, 'en-GB-RyanNeural');
    assert.equal(call1.mimeType, 'audio/mpeg');
    assert.equal(synthCallCount, 1);

    const call2 = await postJson(baseUrl, '/audio/speak', {
      text: 'Void Armour active. One Command Point deducted.',
      theme: 'votann'
    });
    assert.equal(call2.ok, true);
    assert.equal(call2.cached, true, 'Second identical call must hit SHA-256 disk audio_cache/');
    assert.equal(call2.audioBase64, call1.audioBase64);
    assert.equal(synthCallCount, 1, 'Cached hit must not invoke ttsSynthesizeFn again');

    const daemonSrc = fs.readFileSync(path.resolve(__dirname, '../tactica_daemon.js'), 'utf8');
    assert.ok(daemonSrc.includes("new ClipboardEvent('paste'"), 'launchTacticaBrowserSession must paste LOS frames via ClipboardEvent');
  } finally {
    await daemon.stop();
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});



````
