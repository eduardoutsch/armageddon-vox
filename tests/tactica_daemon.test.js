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

