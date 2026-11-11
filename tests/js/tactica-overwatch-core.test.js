/**
 * @fileoverview Unit tests for js/tactica-overwatch-core.js voice intent parser,
 * multimodal 3D LOS prompt/verdict helpers, 6+ Intrusion alerts & Crusade stats handoff.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  parseSpokenTacticaIntent,
  buildLosVerificationPrompt,
  parseOverwatchVerdict,
  buildReactionVoiceCallout,
  detectActiveIntrusionZones,
  buildIntrusionVoxPayload,
  compileTacticaCrusadeSnapshot
} = require('../../js/tactica-overwatch-core.js');

test('parseSpokenTacticaIntent: maps spoken tabletop commands to deterministic console actions and routes LOS queries', () => {
  assert.equal(parseSpokenTacticaIntent('').intent, 'NONE');
  assert.equal(parseSpokenTacticaIntent('Scan the LCT board now').intent, 'SCAN_BOARD');
  assert.equal(parseSpokenTacticaIntent('Drop wave spawns into zones').intent, 'SPAWN_WAVES');
  assert.equal(parseSpokenTacticaIntent('Move the horde units').intent, 'MOVE_HORDE');
  assert.equal(parseSpokenTacticaIntent('Revert move on that squad').intent, 'REVERT_LAST_MOVE');
  assert.equal(parseSpokenTacticaIntent('Lock movement and check overwatch').intent, 'LOCK_MOVEMENT');
  assert.equal(parseSpokenTacticaIntent('Compute shooting target priority').intent, 'SELECT_SHOOTING');
  assert.equal(parseSpokenTacticaIntent('Declare charges').intent, 'DECLARE_CHARGES');
  assert.equal(parseSpokenTacticaIntent('Consolidate horde').intent, 'CONSOLIDATE');
  assert.equal(parseSpokenTacticaIntent('Activate Fire Overwatch').intent, 'USE_FIRE_OVERWATCH');
  assert.equal(parseSpokenTacticaIntent('Heroic Intervention').intent, 'USE_HEROIC_INTERVENTION');
  assert.equal(parseSpokenTacticaIntent('Counter-Offensive').intent, 'USE_COUNTER_OFFENSIVE');
  assert.equal(parseSpokenTacticaIntent('Pass window and hold CP').intent, 'PASS_REACTION');
  assert.equal(
    parseSpokenTacticaIntent('Can the Screamer-Killer see my Krieg squad through that ruin window?').intent,
    'VISUAL_LOS_CHECK'
  );
});

test('buildLosVerificationPrompt & parseOverwatchVerdict: embeds Misery #28 / coordinates and parses JSON or prose verdicts', () => {
  const prompt = buildLosVerificationPrompt({
    factionName: 'Tyranids',
    battleRound: 2,
    activeMiseryIds: [],
    lastMovementPlans: [{ squadKey: 'HORDE::Screamer', unitName: 'Screamer-Killer', goalName: 'Krieg Squad', targetX: 2, targetZ: 6 }],
    boardTelemetry: {
      units: [
        { squadKey: 'HORDE::Screamer', name: 'Screamer-Killer', side: 'HORDE', pos: { x: 2, z: 6 }, keywords: ['MONSTER'] },
        { squadKey: 'PLAYER::Krieg', name: 'Krieg Squad', side: 'PLAYER', pos: { x: 2, z: -4 }, keywords: ['INFANTRY'], isHidden: true }
      ]
    }
  }, 'Can the Screamer-Killer see the Krieg Squad behind the solid L-ruin?');

  assert.ok(prompt.includes('HORDE::Screamer'));
  assert.ok(prompt.includes('11th Edition'));

  const flyPrompt = buildLosVerificationPrompt({ activeMiseryIds: [28] }, '');
  assert.ok(flyPrompt.includes('Misery #28'));

  const fencedJson = '```json\n{"losBlocked":true,"revertSquadKey":"HORDE::Screamer","blockedPairs":["HORDE::Screamer->PLAYER::Krieg"],"spokenReply":"Solid first-floor ruin blocks true line of sight; reverting Screamer-Killer."}\n```';
  const parsed = parseOverwatchVerdict(fencedJson);
  assert.equal(parsed.losBlocked, true);
  assert.equal(parsed.revertSquadKey, 'HORDE::Screamer');
  assert.deepEqual(parsed.blockedPairs, ['HORDE::Screamer->PLAYER::Krieg']);
  assert.ok(parsed.spokenReply.includes('reverting Screamer-Killer'));

  const fallback = parseOverwatchVerdict('Line of sight is clear past the rubble.');
  assert.equal(fallback.losBlocked, false);
  assert.equal(fallback.spokenReply, 'Line of sight is clear past the rubble.');

  const proseBlocked = parseOverwatchVerdict('No line of sight behind the ruin.');
  assert.equal(proseBlocked.losBlocked, true);
  assert.equal(parseOverwatchVerdict('').losBlocked, false);
});

