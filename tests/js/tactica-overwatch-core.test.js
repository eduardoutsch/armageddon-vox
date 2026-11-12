/**
 * @fileoverview Unit tests for js/tactica-overwatch-core.js voice intent parser,
 * multimodal 3D LOS prompt/verdict helpers, 6+ Intrusion alerts & Crusade stats handoff.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  AUSPEX_VOICE_PRESETS,
  resolveTacticalAuspexVoice,
  PLAYER_VOCAL_STRATAGEMS,
  parsePlayerStratagem,
  matchPlayerUnitFromTelemetry,
  validatePlayerStratagemUse,
  parseSpokenTacticaIntent,
  buildLosVerificationPrompt,
  scrubGeminiThreadArtifacts,
  isGeminiInterimThinkingText,
  parseOverwatchVerdict,
  buildReactionVoiceCallout,
  detectActiveIntrusionZones,
  buildIntrusionVoxPayload,
  compileTacticaCrusadeSnapshot
} = require('../../js/tactica-overwatch-core.js');

test('parseSpokenTacticaIntent: maps spoken tabletop commands, Core/Faction Stratagems, and LOS queries', () => {
  assert.equal(parseSpokenTacticaIntent('').intent, 'NONE');
  assert.equal(parseSpokenTacticaIntent('Scan the LCT board now').intent, 'SCAN_BOARD');
  assert.equal(parseSpokenTacticaIntent('Drop wave spawns into zones').intent, 'SPAWN_WAVES');
  assert.equal(parseSpokenTacticaIntent('Move the horde units').intent, 'MOVE_HORDE');
  assert.equal(parseSpokenTacticaIntent('Revert move on that squad').intent, 'REVERT_LAST_MOVE');
  assert.equal(parseSpokenTacticaIntent('Lock movement and check overwatch').intent, 'LOCK_MOVEMENT');
  assert.equal(parseSpokenTacticaIntent('Compute shooting target priority').intent, 'SELECT_SHOOTING');
  assert.equal(parseSpokenTacticaIntent('Declare charges').intent, 'DECLARE_CHARGES');
  assert.equal(parseSpokenTacticaIntent('Consolidate horde').intent, 'CONSOLIDATE');

  const ow = parseSpokenTacticaIntent('Activate Fire Overwatch');
  assert.equal(ow.intent, 'PLAYER_STRATAGEM');
  assert.equal(ow.stratKey, 'FIRE_OVERWATCH');
  assert.equal(ow.cpCost, 1);

  const hi = parseSpokenTacticaIntent('Heroic Intervention');
  assert.equal(hi.intent, 'PLAYER_STRATAGEM');
  assert.equal(hi.stratKey, 'HEROIC_INTERVENTION');
  assert.equal(hi.cpCost, 1);

  const co = parseSpokenTacticaIntent('Counter-Offensive');
  assert.equal(co.intent, 'PLAYER_STRATAGEM');
  assert.equal(co.stratKey, 'COUNTER_OFFENSIVE');
  assert.equal(co.cpCost, 2);

  assert.equal(parseSpokenTacticaIntent('Pass window and hold CP').intent, 'PASS_REACTION');
  assert.equal(
    parseSpokenTacticaIntent('Can the Screamer-Killer see my Krieg squad through that ruin window?').intent,
    'VISUAL_LOS_CHECK'
  );
});

test('resolveTacticalAuspexVoice & zero speechSynthesis guard: maps Commander themes to neural voices and removes robotic OS TTS', () => {
  assert.ok(AUSPEX_VOICE_PRESETS && Array.isArray(PLAYER_VOCAL_STRATAGEMS));
  assert.equal(resolveTacticalAuspexVoice('votann').voice, 'en-GB-RyanNeural');
  assert.equal(resolveTacticalAuspexVoice('VOTANN').label, 'Brôkhyr Helm-Auspex');
  assert.equal(resolveTacticalAuspexVoice('militarum').voice, 'en-GB-SoniaNeural');
  assert.equal(resolveTacticalAuspexVoice('necron').voice, 'en-GB-ThomasNeural');
  assert.equal(resolveTacticalAuspexVoice('unknown').voice, 'en-GB-RyanNeural');

  const overwatchSrc = fs.readFileSync(path.resolve(__dirname, '../../js/tactica-overwatch.js'), 'utf8');
  assert.equal(
    /speechSynthesis/i.test(overwatchSrc),
    false,
    'js/tactica-overwatch.js must contain zero speechSynthesis references'
  );
});

test('parsePlayerStratagem, matchPlayerUnitFromTelemetry & validatePlayerStratagemUse: parses Core + Faction stratagems, spoken numbers, fuzzy targets & Misery #22/Secret #20 rules', () => {
  const voidArmour1 = parseSpokenTacticaIntent('Using Void Armour for 1 CP');
  assert.equal(voidArmour1.intent, 'PLAYER_STRATAGEM');
  assert.equal(voidArmour1.category, 'FACTION');
  assert.equal(voidArmour1.stratName, 'Void Armour');
  assert.equal(voidArmour1.cpCost, 1);

  const reprisal = parseSpokenTacticaIntent('Spend 2 CP on Reactive Reprisal');
  assert.equal(reprisal.intent, 'PLAYER_STRATAGEM');
  assert.equal(reprisal.stratName, 'Reactive Reprisal');
  assert.equal(reprisal.cpCost, 2);

  const typed = parsePlayerStratagem('strategem Void Armour on Hearthguard - 2cp');
  assert.equal(typed.intent, 'PLAYER_STRATAGEM');
  assert.equal(typed.category, 'FACTION');
  assert.equal(typed.stratName, 'Void Armour');
  assert.equal(typed.targetUnit, 'Hearthguard');
  assert.equal(typed.cpCost, 2);

  const spokenWords = parsePlayerStratagem('Stratagem Ancestral Sentence on Pioneers, one CP');
  assert.equal(spokenWords.intent, 'PLAYER_STRATAGEM');
  assert.equal(spokenWords.stratName, 'Ancestral Sentence');
  assert.equal(spokenWords.targetUnit, 'Pioneers');
  assert.equal(spokenWords.cpCost, 1);

  const freeOw = parsePlayerStratagem('Fire Overwatch on Yaegirs - 0cp');
  assert.equal(freeOw.intent, 'PLAYER_STRATAGEM');
  assert.equal(freeOw.category, 'CORE');
  assert.equal(freeOw.stratKey, 'FIRE_OVERWATCH');
  assert.equal(freeOw.targetUnit, 'Yaegirs');
  assert.equal(freeOw.cpCost, 0);

  const smoke = parseSpokenTacticaIntent('Popping smoke on Sagitaur');
  assert.equal(smoke.intent, 'PLAYER_STRATAGEM');
  assert.equal(smoke.stratKey, 'SMOKESCREEN');
  assert.deepEqual(smoke.buff, { cover: true }, '11th Ed Smokescreen must grant Benefit of Cover ({ cover: true }) so [IGNORES COVER] strips it cleanly');
  assert.deepEqual(
    PLAYER_VOCAL_STRATAGEMS.find(s => s.key === 'SMOKESCREEN')?.buff,
    { cover: true },
    'PLAYER_VOCAL_STRATAGEMS SMOKESCREEN entry must use { cover: true }'
  );
  assert.equal(smoke.durationScope, 'PHASE', '99% of Stratagem buffs must default to PHASE durationScope');
  assert.equal(voidArmour1.durationScope, 'PHASE', 'Faction Stratagems without explicit round wording must default to PHASE');

  // Explicit 1-Round / "until your next shooting phase" Stratagem parsing
  const nextShoot = parsePlayerStratagem('Stratagem Suppressing Fire on Hearthguard until your next shooting phase - 1cp');
  assert.equal(nextShoot.intent, 'PLAYER_STRATAGEM');
  assert.equal(nextShoot.stratName, 'Suppressing Fire');
  assert.equal(nextShoot.targetUnit, 'Hearthguard');
  assert.equal(nextShoot.cpCost, 1);
  assert.equal(nextShoot.durationScope, 'ROUND', '"until your next shooting phase" must resolve to ROUND durationScope');

  const wholeRound = parsePlayerStratagem('Using Cloud of Ash on Pioneers for the whole round, 1 CP');
  assert.equal(wholeRound.intent, 'PLAYER_STRATAGEM');
  assert.equal(wholeRound.stratName, 'Cloud Of Ash');
  assert.equal(wholeRound.targetUnit, 'Pioneers');
  assert.equal(wholeRound.cpCost, 1);
  assert.equal(wholeRound.durationScope, 'ROUND', '"for the whole round" must resolve to ROUND durationScope');

  // Fuzzy PLAYER unit matching
  const boardUnits = [
    { name: 'Armiger Warglaive', side: 'HORDE' },
    { name: 'Einhyr Hearthguard', side: 'PLAYER' },
    { name: 'Hernkyn Pioneers', side: 'PLAYER' }
  ];
  assert.equal(matchPlayerUnitFromTelemetry('Hearthguard', boardUnits)?.name, 'Einhyr Hearthguard');
  assert.equal(matchPlayerUnitFromTelemetry('Pioneers', boardUnits)?.name, 'Hernkyn Pioneers');
  assert.equal(matchPlayerUnitFromTelemetry('Warglaive', boardUnits), null, 'Must never fuzzy-match HORDE units for Player Stratagems');

  // Misery #22 (Comms Jammed), minRound, CP check, and Secret #20 (cpCost >= 1)
  assert.equal(validatePlayerStratagemUse(voidArmour1, { battleRound: 2, playerCp: 2, activeMiseryIds: [22] }).allowed, false);
  const ingress = parseSpokenTacticaIntent('Rapid Ingress');
  assert.equal(validatePlayerStratagemUse(ingress, { battleRound: 1, playerCp: 2, activeMiseryIds: [] }).allowed, false);
  assert.equal(validatePlayerStratagemUse(ingress, { battleRound: 2, playerCp: 2, activeMiseryIds: [] }).allowed, true);
  assert.equal(validatePlayerStratagemUse(reprisal, { battleRound: 2, playerCp: 1, activeMiseryIds: [] }).allowed, false);
  assert.equal(validatePlayerStratagemUse(freeOw, { battleRound: 2, playerCp: 0, activeMiseryIds: [] }).countsForSecret20, false);
  assert.equal(validatePlayerStratagemUse(voidArmour1, { battleRound: 2, playerCp: 2, activeMiseryIds: [] }).countsForSecret20, true);
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

test('buildReactionVoiceCallout & detectActiveIntrusionZones: announces CP options and flags 6+ Big-Bracket breaches', () => {
  assert.equal(buildReactionVoiceCallout(null), '');
  const callout = buildReactionVoiceCallout({
    open: true,
    title: 'End of Horde Movement Phase',
    playerCp: 2,
    eligibleStratagems: [{ name: 'Fire Overwatch (24", 6+ Snap Shots)', cpCost: 1 }]
  });
  assert.ok(callout.includes('2 Command Points') && callout.includes('Fire Overwatch'));

  const breaches = detectActiveIntrusionZones([
    { zone: 1, bracketKey: '7-9', bracketLabel: 'Bracket [7–9]', intrusionRoll: null },
    { zone: 2, bracketKey: '10-12', bracketLabel: 'Bracket [10–12]', intrusionRoll: 5 },
    { zone: 3, bracketKey: '13+', bracketLabel: 'Bracket [13+]', intrusionRoll: 6 }
  ]);
  assert.equal(breaches.length, 1);
  assert.equal(breaches[0].zone, 3);

  const gammaPing = buildIntrusionVoxPayload({
    zoneNum: 3,
    bracketLabel: 'Bracket [13+]',
    channel: 'gamma',
    roomCode: 'EMBER-09',
    battleRound: 4,
    factionName: 'Orks'
  });
  assert.ok(gammaPing.includes('FANE-NODE VÔL-09') && gammaPing.includes('EMBER-09'));

  const alphaPing = buildIntrusionVoxPayload({ zoneNum: 1, bracketLabel: '[10–12]', channel: 'alpha', roomCode: 'HADES-1' });
  assert.ok(alphaPing.includes('THE EXILE'));
  const betaPing = buildIntrusionVoxPayload({ zoneNum: 1, bracketLabel: '[10–12]', channel: 'beta', roomCode: 'HADES-1' });
  assert.ok(betaPing.includes('JUNEBUG'));
  const distPing = buildIntrusionVoxPayload({ zoneNum: 2, bracketLabel: '[13+]', channel: 'distant', roomCode: 'HADES-1' });
  assert.ok(distPing.includes('ORBITAL AUGUR ARRAY'));
});

test('compileTacticaCrusadeSnapshot: aggregates chronicle kills, reactions, Misery cards & Warlord status for Mode 5 Crusade', () => {
  const state = {
    roomCode: 'GOLGOTHA-44',
    battleRound: 6,
    factionName: 'World Eaters',
    playerSp: 10,
    playerCp: 1,
    activeMiseryIds: [5, 30],
    hordeWarlord: { name: 'Lord Invocatus', roundSpawned: 2, alive: false }
  };
  const chronicle = [
    { type: 'AUTO_DEFENDER', summary: 'Wiped Berzerkers', details: { outcome: { unitDestroyed: true, modelsSlain: 10 } } },
    { type: 'AUTO_DEFENDER', summary: 'Slain Invocatus', details: { outcome: { unitDestroyed: true, modelsSlain: 1 } } },
    { type: 'REACTION', summary: 'Player activated FIRE_OVERWATCH (-1 CP).' },
    { type: 'REACTION', summary: 'Player passed reaction window.' }
  ];
  const spawnerSession = {
    selectedModeVal: 'solo',
    spSpentThisRound: 6,
    activeMiseries: [{ id: 5, name: 'Untouchable' }, { id: 30, name: 'Aim for the Heads' }],
    activeCard: { code: 'L2Y', name: '11 - Show Off', tags: 'End of Game' }
  };

  const snap = compileTacticaCrusadeSnapshot(state, chronicle, spawnerSession);
  assert.equal(snap.hordeKills, 2);
  assert.equal(snap.stratagemsUsed, 1);
  assert.equal(snap.roundsPlayed, 6);
  assert.equal(snap.hordeFaction, 'World Eaters');
  assert.equal(snap.roomSeed, 'GOLGOTHA-44');
  assert.equal(snap.gameMode, 'SOLO');
  assert.equal(snap.leftoverSp, 10);
  assert.equal(snap.leftoverCp, 1);
  assert.equal(snap.secretObjective.code, 'L2Y');
  assert.equal(snap.hordeWarlord.alive, false);
});

test('scrubGeminiThreadArtifacts & isGeminiInterimThinkingText: strips "O Gemini disse" anywhere and rejects thinking/streaming states', () => {
  assert.equal(typeof scrubGeminiThreadArtifacts, 'function');
  assert.equal(typeof isGeminiInterimThinkingText, 'function');

  // Exact interim thinking strings observed in live Portuguese/English Gemini 2.5 Thinking UI
  const interim1 = scrubGeminiThreadArtifacts('Processing: Determining if terrain blocks visibility O Gemini disse');
  assert.equal(interim1.includes('O Gemini disse'), false);
  assert.equal(isGeminiInterimThinkingText(interim1), true, 'Must treat "Processing: Determining..." as interim thinking');

  const interim2 = scrubGeminiThreadArtifacts('Determining if large rulebooks are supported O Gemini disse');
  assert.equal(interim2.includes('O Gemini disse'), false);
  assert.equal(isGeminiInterimThinkingText(interim2), true, 'Must treat "Determining if..." thought header as interim thinking');

  const adjacentNoSpace = scrubGeminiThreadArtifacts('Mostrar pensamentoDetermining if terrain blocks visibilityO Gemini disse');
  assert.equal(adjacentNoSpace.includes('O Gemini disse'), false);
  assert.equal(adjacentNoSpace.includes('Mostrar pensamento'), false);
  assert.equal(isGeminiInterimThinkingText(adjacentNoSpace), true);

  const emptyAfterLabel = scrubGeminiThreadArtifacts('  O Gemini disse:  ');
  assert.equal(emptyAfterLabel, '');
  assert.equal(isGeminiInterimThinkingText(emptyAfterLabel), true, 'Empty body after stripping O Gemini disse must keep waiting');

  // Active streaming button still present on page
  assert.equal(
    isGeminiInterimThinkingText('{"losBlocked":true', { isGenerating: true }),
    true,
    'Must keep waiting while Gemini Stop/streaming indicator is active'
  );

  // Completed real responses (JSON and conversational prose)
  const finalJson = scrubGeminiThreadArtifacts(
    'O Gemini disse\nJSON\nCopiar código\n{"losBlocked":true,"revertSquadKey":"HORDE::Paladin","blockedPairs":[],"spokenReply":"Solid ruin blocks LOS."}'
  );
  assert.equal(isGeminiInterimThinkingText(finalJson, { isGenerating: false }), false);
  const verdict = parseOverwatchVerdict(
    'O Gemini disse\n{"losBlocked":false,"revertSquadKey":null,"blockedPairs":[],"spokenReply":"Clear sightline past low rubble."}'
  );
  assert.equal(verdict.spokenReply, 'Clear sightline past low rubble.');

  const proseVerdict = parseOverwatchVerdict('O Gemini disse: Yes, I can hear you loud and clear and am ready to verify line of sight.');
  assert.equal(proseVerdict.spokenReply.includes('O Gemini disse'), false);
  assert.equal(isGeminiInterimThinkingText(proseVerdict.spokenReply, { isGenerating: false }), false);
});


