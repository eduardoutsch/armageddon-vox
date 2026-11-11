# 📦 Fires of Armageddon // Bundle: Tactica Core & Daemon Integration Tests

LCT Tactica Functional Core unit tests and Tactica Daemon HTTP, neural audio cache, Clipboard LOS paste, and .env routing tests (`tests/js/tactica-core.test.js`, `tests/tactica_daemon.test.js`).

## 📑 Table of Contents
- [tests/js/tactica-core.test.js](#file-testsjstacticacoretestjs)
- [tests/tactica_daemon.test.js](#file-teststacticadaemontestjs)

---

## File: `tests/js/tactica-core.test.js` <a id="file-testsjstacticacoretestjs"></a>

````javascript
/**
 * @fileoverview Unit tests for js/tactica-core.js pure match state, LCT dice-mat state machines & chronicle compiler.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  TACTICA_PHASES,
  PHASE_ORDER_INDEX,
  REACTION_WINDOW_DEFS,
  createInitialTacticaState,
  createPlayerStratagemBuff,
  pruneExpiredPlayerBuffs,
  resolvePlayerUnitDefensiveBuffs,
  selectTelemetryRowViewModels,
  formatChronicleEntry,
  detectPlayerReactionWindow,
  assignHordeWarlordIfEligible,
  createDefenseRollSequence,
  advanceDefenseRollSequence,
  createHordeAttackRollSequence,
  advanceHordeAttackRollSequence,
  compileTacticaPostMatchReport
} = require('../../js/tactica-core.js');

const ROOT_DIR = path.resolve(__dirname, '../../');

test('Zero-JS-RNG Guard: tactica modules contain zero Math.random() calls (all dice come from LCT TTS mat)', () => {
  for (const rel of [
    'js/tactica-core.js',
    'js/tts-telemetry-core.js',
    'js/horde-autopilot-core.js',
    'js/tactica-overwatch-core.js',
    'js/tactica-overwatch.js',
    'js/tactica.js',
    'tactica_daemon.js'
  ]) {
    const src = fs.readFileSync(path.join(ROOT_DIR, rel), 'utf8');
    assert.equal(src.includes('Math.random'), false, `${rel} must not use Math.random(); LCT mat rolls all dice`);
  }
});

test('detectPlayerReactionWindow: enforces CP, Battle Round, and Misery #22 Comms Jammed lockouts', () => {
  assert.ok(Array.isArray(TACTICA_PHASES) && TACTICA_PHASES.length === 7);
  assert.ok(REACTION_WINDOW_DEFS.START_OF_HORDE_SHOOTING);
  assert.equal(detectPlayerReactionWindow('UNKNOWN_TRIGGER', {}).open, false);

  const r2State = createInitialTacticaState({ battleRound: 2, playerCp: 2, activeMiseryIds: [] });
  assert.equal(detectPlayerReactionWindow('END_OF_HORDE_MOVEMENT', r2State).eligibleStratagems.length, 2);

  const r1State = createInitialTacticaState({ battleRound: 1, playerCp: 1, activeMiseryIds: [] });
  assert.equal(detectPlayerReactionWindow('END_OF_HORDE_MOVEMENT', r1State).eligibleStratagems[0].key, 'FIRE_OVERWATCH');
  assert.equal(detectPlayerReactionWindow('AFTER_HORDE_UNIT_FOUGHT', r1State).open, false);

  const zeroCp = createInitialTacticaState({ battleRound: 2, playerCp: 0, activeMiseryIds: [] });
  assert.equal(detectPlayerReactionWindow('START_OF_HORDE_SHOOTING', zeroCp).open, false);

  const jammed = createInitialTacticaState({ battleRound: 3, playerCp: 3, activeMiseryIds: [22] });
  assert.equal(detectPlayerReactionWindow('HORDE_CHARGE_DECLARED', jammed).open, false);
});

test('assignHordeWarlordIfEligible: locks the first spawned Horde CHARACTER and ignores later Characters', () => {
  const playerOnly = assignHordeWarlordIfEligible(null, [
    { guid: 'p1', name: 'Player Marshall', side: 'PLAYER', keywords: ['CHARACTER'] }
  ], 1);
  assert.equal(playerOnly.newlyAssigned, false);
  assert.equal(playerOnly.warlord, null);

  const res1 = assignHordeWarlordIfEligible(null, [
    { guid: 'u1', name: '10 Necron Warriors', side: 'HORDE', keywords: ['INFANTRY'] },
    { guid: 'u2', name: 'Overlord', side: 'HORDE', keywords: ['INFANTRY', 'CHARACTER'] }
  ], 2);
  assert.equal(res1.newlyAssigned, true);
  assert.equal(res1.warlord.name, 'Overlord');

  const res2 = assignHordeWarlordIfEligible(res1.warlord, [
    { guid: 'u3', name: 'Skorpekh Lord', side: 'HORDE', keywords: ['CHARACTER'] }
  ], 3);
  assert.equal(res2.newlyAssigned, false);
  assert.equal(res2.warlord.name, 'Overlord');
});

test('Defense LCT Sequence: chains SAVES -> FNP -> ON_DEATH -> GSC_RESPAWN strictly from settled LCT mat pips', () => {
  const state = createInitialTacticaState({ factionName: 'Necrons', activeMiseryIds: [30] });

  // 2-wound Infantry models (Save 4+, AP -1 -> 5+ Save, Necron 5+ FNP, Misery #30 4+ On-Death)
  let seq = createDefenseRollSequence({
    sequenceId: 'seq_def_1',
    unitName: 'Necron Immortals',
    defender: { save: 4, woundsPerModel: 2, keywords: ['INFANTRY'] },
    incomingAttack: { type: 'ranged', strength: 5, ap: -1, damage: 2 },
    options: { numWounds: 3, damagePerWound: 2, startingModels: 2 }
  }, state);

  assert.equal(seq.stage, 'SAVES');
  assert.equal(seq.nextCommand.action, 'LCT_MAT_ROLL');
  assert.equal(seq.nextCommand.count, 3);
  assert.equal(seq.nextCommand.threshold, 5);
  assert.throws(() => advanceDefenseRollSequence(seq, [5]), /Expected 3 dice/);

  // Stage 1 settled on LCT mat: [5 (pass), 2 (fail), 3 (fail)] -> 2 unsaved x 2 dmg = 4 FNP dice!
  seq = advanceDefenseRollSequence(seq, [5, 2, 3]);
  assert.equal(seq.stage, 'FNP');
  assert.equal(seq.nextCommand.count, 4);
  assert.equal(seq.nextCommand.threshold, 5);

  // Stage 2 settled on LCT mat: [5(shrug), 1(take), 6(shrug), 2(take)] -> 1 dmg + 1 dmg = 1 model slain!
  seq = advanceDefenseRollSequence(seq, [5, 1, 6, 2]);
  assert.equal(seq.stage, 'ON_DEATH');
  assert.equal(seq.outcome.modelsSlain, 1);
  assert.equal(seq.outcome.remainingModels, 1);
  assert.equal(seq.nextCommand.count, 1);
  assert.equal(seq.nextCommand.threshold, 4);

  // Stage 3 settled on LCT mat: [4] -> triggers Misery #30 shoot-on-death and completes!
  seq = advanceDefenseRollSequence(seq, [4]);
  assert.equal(seq.stage, 'COMPLETE');
  assert.equal(seq.nextCommand, null);
  assert.equal(seq.outcome.onDeathTriggers, 1);
  assert.equal(advanceDefenseRollSequence(seq, []).stage, 'COMPLETE');

  // GSC squad wipe chains into Stage 4 GSC_RESPAWN (5+)
  const gscState = createInitialTacticaState({ factionName: 'Genestealer Cults', activeMiseryIds: [] });
  let gscSeq = createDefenseRollSequence({
    sequenceId: 'seq_gsc',
    unitName: 'Neophyte Hybrids',
    defender: { save: 5, woundsPerModel: 1, keywords: ['INFANTRY'] },
    incomingAttack: { type: 'ranged', strength: 4, ap: -2, damage: 1 },
    options: { numWounds: 1, damagePerWound: 1, startingModels: 1 }
  }, gscState);
  gscSeq = advanceDefenseRollSequence(gscSeq, [1]); // Failed save -> wiped -> needs 1D6 GSC respawn
  assert.equal(gscSeq.stage, 'GSC_RESPAWN');
  assert.equal(gscSeq.nextCommand.count, 1);
  gscSeq = advanceDefenseRollSequence(gscSeq, [5]);
  assert.equal(gscSeq.stage, 'COMPLETE');
  assert.equal(gscSeq.outcome.gscRespawnTriggered, true);

  // Mortal wounds spill over models (with and without FNP) & 0-wound no-op
  assert.equal(createDefenseRollSequence({ options: { numWounds: 0 } }, state).stage, 'COMPLETE');
  let mwSeq = createDefenseRollSequence({
    unitName: 'Lychguard',
    defender: { save: 3, woundsPerModel: 2, keywords: ['INFANTRY'] },
    options: { numWounds: 2, damagePerWound: 2, startingModels: 2, mortalWounds: true }
  }, state);
  assert.equal(mwSeq.stage, 'FNP');
  mwSeq = advanceDefenseRollSequence(mwSeq, [1, 2, 5, 1]); // 3 unshrugged MW -> 1 slain, 1 left at 1W
  assert.equal(mwSeq.outcome.modelsSlain, 1);
  assert.equal(mwSeq.outcome.currentModelRemainingWounds, 1);

  const mwNoFnp = createDefenseRollSequence({
    unitName: 'Cultists',
    defender: { save: 6, woundsPerModel: 1 },
    options: { numWounds: 2, damagePerWound: 1, startingModels: 3, mortalWounds: true }
  }, createInitialTacticaState({ factionName: 'Chaos Space Marines' }));
  assert.equal(mwNoFnp.stage, 'COMPLETE');
  assert.equal(mwNoFnp.outcome.modelsSlain, 2);
});

test('Horde Attack LCT Sequence: chains HITS -> HIT_REROLLS -> WOUNDS with Lethal, Sustained & Devastating keywords', () => {
  const state = createInitialTacticaState({ factionName: 'Space Marines', activeMiseryIds: [16, 17] });
  // Space Marines re-roll 1s to Hit; Misery #16 [DEVASTATING WOUNDS]; Misery #17 [SUSTAINED HITS 1, LETHAL HITS 1]
  let atk = createHordeAttackRollSequence({
    sequenceId: 'seq_atk_1',
    attackerName: 'Intercessors',
    targetName: 'Krieg Infantry',
    target: { toughness: 3, keywords: ['INFANTRY'] },
    weapon: { type: 'ranged', attacks: 4, skill: 3, strength: 4, ap: -1, damage: 1, keywords: [] }
  }, state);

  assert.equal(atk.stage, 'HITS');
  assert.equal(atk.nextCommand.count, 4);

  // Roll [6 (Crit: 1 Lethal auto-wound + 1 Sustained normal hit), 4 (normal hit), 1 (reroll!), 2 (miss)]
  atk = advanceHordeAttackRollSequence(atk, [6, 4, 1, 2]);
  assert.equal(atk.stage, 'HIT_REROLLS');
  assert.equal(atk.nextCommand.count, 1, 'Only the unmodified 1 is re-rolled for Space Marines');

  // Re-roll the 1 -> rolls [5] (normal hit! Total normal hits needing wound roll = 1 Sustained + 1 [4] + 1 [5] = 3)
  atk = advanceHordeAttackRollSequence(atk, [5]);
  assert.equal(atk.stage, 'WOUNDS');
  assert.equal(atk.autoWounds, 1);
  assert.equal(atk.nextCommand.count, 3);
  assert.equal(atk.nextCommand.threshold, 3); // S4 vs T3 = 3+

  // Wound rolls on LCT mat: [6 (Devastating MW!), 3 (normal wound), 2 (fail)]
  atk = advanceHordeAttackRollSequence(atk, [6, 3, 2]);
  assert.equal(atk.stage, 'COMPLETE');
  assert.equal(atk.normalWounds, 2); // 1 Lethal auto-wound + 1 rolled [3]
  assert.equal(atk.devastatingMortalWounds, 1);

  // T'au Glasses check + Twin-Linked wound re-rolls
  const tauState = createInitialTacticaState({ factionName: "T'au Empire" });
  let tauAtk = createHordeAttackRollSequence({
    attackerName: 'Crisis Suits',
    target: { toughness: 4 },
    weapon: { type: 'ranged', attacks: 2, skill: 4, strength: 5, keywords: ['TWIN-LINKED'] }
  }, tauState);
  assert.equal(tauAtk.stage, 'TAU_GLASSES');
  tauAtk = advanceHordeAttackRollSequence(tauAtk, [5]); // Passes 4+ -> BS improves to 3+
  assert.equal(tauAtk.stage, 'HITS');
  assert.equal(tauAtk.nextCommand.threshold, 3);
  tauAtk = advanceHordeAttackRollSequence(tauAtk, [4, 2]); // 1 hit, 1 miss
  assert.equal(tauAtk.stage, 'WOUNDS');
  tauAtk = advanceHordeAttackRollSequence(tauAtk, [2]); // Failed wound -> Twin-Linked re-roll!
  assert.equal(tauAtk.stage, 'WOUND_REROLLS');
  tauAtk = advanceHordeAttackRollSequence(tauAtk, [5]);
  assert.equal(tauAtk.stage, 'COMPLETE');
  assert.equal(tauAtk.normalWounds, 1);
});

test('compileTacticaPostMatchReport: preserves full Round 1 through Round 6 history without truncation', () => {
  const state = createInitialTacticaState({
    roomCode: 'TARTARUS-09',
    factionName: 'World Eaters',
    battleRound: 6,
    hordeWarlord: { name: 'Lord Invocatus', roundSpawned: 2, alive: false }
  });
  const entries = [
    formatChronicleEntry({ seq: 1, battleRound: 0, phase: 'COMMAND_SPAWN', type: 'NOTE', summary: 'Fortifications placed.' }, state),
    formatChronicleEntry({ seq: 2, battleRound: 1, phase: 'COMMAND_SPAWN', type: 'SPAWN', summary: 'Zone 1 spawned 10 Berzerkers.' }, state),
    formatChronicleEntry({ seq: 3, battleRound: 6, phase: 'PLAYER_TURN', type: 'AUTO_DEFENDER', summary: 'Lord Invocatus slain!' }, state)
  ];
  const report = compileTacticaPostMatchReport(state, entries, { channel: 'alpha', outcome: 'Victory' });
  assert.ok(report.includes('[DEPLOYMENT & PRE-GAME]:') && report.includes('[BATTLE ROUND 1]') && report.includes('[BATTLE ROUND 6]'));
  assert.ok(report.includes('Lord Invocatus (Slain'));

  const emptyGamma = compileTacticaPostMatchReport(createInitialTacticaState(), [], { channel: 'gamma' });
  assert.ok(emptyGamma.includes('KÂHL HÂRKYN') && emptyGamma.includes('[NO TACTICAL EVENTS RECORDED IN CHRONICLE]'));
});

test('createPlayerStratagemBuff, pruneExpiredPlayerBuffs & resolvePlayerUnitDefensiveBuffs: enforces 99% single-phase expiration vs 1-round ("until next shooting phase") persistence', () => {
  assert.ok(PHASE_ORDER_INDEX && typeof PHASE_ORDER_INDEX.HORDE_SHOOTING === 'number');
  assert.equal(typeof createPlayerStratagemBuff, 'function');
  assert.equal(typeof pruneExpiredPlayerBuffs, 'function');
  assert.equal(typeof resolvePlayerUnitDefensiveBuffs, 'function');

  // 1. Default PHASE buff (Smokescreen popped during HORDE_MOVEMENT right before clicking 3. Shoot in Round 2)
  const smokePreShoot = createPlayerStratagemBuff({
    stratKey: 'SMOKESCREEN',
    stratName: 'Smokescreen',
    resolvedTarget: 'Einhyr Hearthguard',
    durationScope: 'PHASE',
    buff: { hitMod: -1, cover: true }
  }, { battleRound: 2, phase: 'HORDE_MOVEMENT' });
  assert.equal(smokePreShoot.durationScope, 'PHASE');
  assert.equal(smokePreShoot.activePhase, 'HORDE_SHOOTING');

  let buffs = [smokePreShoot];
  // Advancing into HORDE_SHOOTING activates it and applies -1 to Hit
  buffs = pruneExpiredPlayerBuffs(buffs, 2, 'HORDE_SHOOTING');
  assert.equal(buffs.length, 1);
  assert.equal(resolvePlayerUnitDefensiveBuffs('Einhyr Hearthguard', buffs, 2, 'HORDE_SHOOTING').hitMod, -1);

  // Advancing out of HORDE_SHOOTING into HORDE_CHARGE (or HORDE_FIGHT) in the SAME Round 2 immediately expires it!
  buffs = pruneExpiredPlayerBuffs(buffs, 2, 'HORDE_CHARGE');
  assert.equal(buffs.length, 0, 'PHASE-scoped Shooting buff must expire as soon as HORDE_SHOOTING ends');

  // 2. PHASE buff popped during HORDE_CHARGE (e.g., melee Void Armour / -1 to Hit for the upcoming Fight phase)
  const fightBuff = createPlayerStratagemBuff({
    stratKey: 'FACTION_CUSTOM',
    stratName: 'Reactive Ward',
    resolvedTarget: 'Einhyr Hearthguard',
    durationScope: 'PHASE',
    buff: { hitMod: -1, worsenAp: 1 }
  }, { battleRound: 2, phase: 'HORDE_CHARGE' });
  assert.equal(fightBuff.activePhase, 'HORDE_FIGHT');
  let meleeBuffs = pruneExpiredPlayerBuffs([fightBuff], 2, 'HORDE_FIGHT');
  assert.equal(meleeBuffs.length, 1, 'Fight-targeted PHASE buff popped in HORDE_CHARGE must survive into HORDE_FIGHT');
  assert.equal(resolvePlayerUnitDefensiveBuffs('Einhyr Hearthguard', meleeBuffs, 2, 'HORDE_FIGHT').worsenAp, 1);
  meleeBuffs = pruneExpiredPlayerBuffs(meleeBuffs, 2, 'PLAYER_TURN');
  assert.equal(meleeBuffs.length, 0, 'Fight PHASE buff must expire immediately when HORDE_FIGHT ends');

  // 3. ROUND buff popped during Horde half of Round 2 -> lasts all remaining phases of Round 2, expires at Round 3
  const fullRoundHorde = createPlayerStratagemBuff({
    stratKey: 'FACTION_CUSTOM',
    stratName: 'Cloud Of Ash',
    resolvedTarget: 'Hernkyn Pioneers',
    durationScope: 'ROUND',
    buff: { hitMod: -1 }
  }, { battleRound: 2, phase: 'HORDE_SHOOTING' });
  let roundBuffs = [fullRoundHorde];
  roundBuffs = pruneExpiredPlayerBuffs(roundBuffs, 2, 'HORDE_CHARGE');
  roundBuffs = pruneExpiredPlayerBuffs(roundBuffs, 2, 'HORDE_FIGHT');
  roundBuffs = pruneExpiredPlayerBuffs(roundBuffs, 2, 'PLAYER_TURN');
  assert.equal(roundBuffs.length, 1, 'ROUND buff popped in Round 2 Horde Shooting must persist across Fight and Player Turn of Round 2');
  assert.equal(resolvePlayerUnitDefensiveBuffs('Hernkyn Pioneers', roundBuffs, 2, 'HORDE_FIGHT').hitMod, -1);
  roundBuffs = pruneExpiredPlayerBuffs(roundBuffs, 3, 'COMMAND_SPAWN');
  assert.equal(roundBuffs.length, 0, 'ROUND buff popped in Round 2 Horde half must expire at start of Round 3');

  // 4. "Until your next shooting phase (1 round)" buff popped during PLAYER_TURN of Round 2:
  //    Must survive advancing into Round 3 across COMMAND_SPAWN -> HORDE_MOVEMENT -> HORDE_SHOOTING -> HORDE_FIGHT,
  //    and expire upon entering PLAYER_TURN of Round 3!
  const untilNextShoot = createPlayerStratagemBuff({
    stratKey: 'FACTION_CUSTOM',
    stratName: 'Suppressing Fire',
    resolvedTarget: 'Einhyr Hearthguard',
    durationScope: 'ROUND',
    buff: { hitMod: -1 }
  }, { battleRound: 2, phase: 'PLAYER_TURN' });
  let nextTurnBuffs = [untilNextShoot];
  nextTurnBuffs = pruneExpiredPlayerBuffs(nextTurnBuffs, 3, 'COMMAND_SPAWN');
  nextTurnBuffs = pruneExpiredPlayerBuffs(nextTurnBuffs, 3, 'HORDE_MOVEMENT');
  nextTurnBuffs = pruneExpiredPlayerBuffs(nextTurnBuffs, 3, 'HORDE_SHOOTING');
  assert.equal(nextTurnBuffs.length, 1, '"Until next shooting phase" buff from R2 PLAYER_TURN must survive into R3 HORDE_SHOOTING');
  assert.equal(resolvePlayerUnitDefensiveBuffs('Einhyr Hearthguard', nextTurnBuffs, 3, 'HORDE_SHOOTING').hitMod, -1);
  nextTurnBuffs = pruneExpiredPlayerBuffs(nextTurnBuffs, 3, 'HORDE_FIGHT');
  assert.equal(nextTurnBuffs.length, 1, 'Must also protect through R3 HORDE_FIGHT before Player Turn begins');
  nextTurnBuffs = pruneExpiredPlayerBuffs(nextTurnBuffs, 3, 'PLAYER_TURN');
  assert.equal(nextTurnBuffs.length, 0, 'Must expire once Round 3 reaches PLAYER_TURN ("your next turn / shooting phase")');
});

test('selectTelemetryRowViewModels: pure MVVM selector projects unit badges, save brackets, and Embarked Transport actions without DOM', () => {
  assert.equal(typeof selectTelemetryRowViewModels, 'function');
  assert.deepEqual(selectTelemetryRowViewModels(null), []);

  const vms = selectTelemetryRowViewModels([
    {
      squadKey: 'HORDE::Corvus Blackstar',
      name: 'Corvus Blackstar',
      side: 'HORDE',
      modelCount: 1,
      save: 3,
      closestObjective: { name: 'Obj 2', distanceInches: 4.5 },
      closestEnemy: { name: 'Hearthkyn Warriors #1', distanceInches: 9.2 },
      embarkedCargo: [
        { count: 5, templateName: 'Kill Team' },
        { count: 1, templateName: 'Watch Master' }
      ],
      embarkedSummary: '5x Kill Team + 1x Watch Master'
    },
    {
      squadKey: 'PLAYER::Hearthkyn Warriors #1',
      name: 'Hearthkyn Warriors #1',
      side: 'PLAYER',
      modelCount: 10,
      save: 4,
      invuln: 5,
      fnp: 6,
      embarkedCargo: []
    }
  ]);

  assert.equal(vms.length, 2);
  assert.equal(vms[0].side, 'HORDE');
  assert.equal(vms[0].sideBadgeClass, 'red');
  assert.equal(vms[0].statsBracketText, '[x1 • Sv 3+]');
  assert.equal(vms[0].hasEmbarkedCargo, true);
  assert.equal(vms[0].embarkedBadgeText, '🚌 Embarked: 5x Kill Team + 1x Watch Master');
  assert.equal(vms[0].canDisembark, true);
  assert.equal(vms[0].canLoadAutoDefender, true);

  assert.equal(vms[1].side, 'PLAYER');
  assert.equal(vms[1].sideBadgeClass, 'blue');
  assert.equal(vms[1].statsBracketText, '[x10 • Sv 4+/5++/FNP 6+]');
  assert.equal(vms[1].hasEmbarkedCargo, false);
  assert.equal(vms[1].canDisembark, false);
  assert.equal(vms[1].canLoadAutoDefender, false);
});
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
