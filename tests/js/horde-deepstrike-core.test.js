/**
 * @fileoverview Unit tests for js/horde-deepstrike-core.js deterministic >8" Deep Strike
 * & >3" Misery #13 Pincer Maneuver drop solver, R2-R4 reserve gating, and screened-out fallback.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  STANDARD_DEEP_STRIKE_MIN_ENEMY_INCHES,
  PINCER_DEEP_STRIKE_MIN_ENEMY_INCHES,
  OBJECTIVE_EXCLUSION_INCHES,
  inferUnitHasDeepStrike,
  partitionWavesByDeepStrikeEligibility,
  buildFormationOffsets,
  solveDeepStrikeDrop,
  planDeepStrikeIngressDrops,
  buildIngressFallbackCommand
} = require('../../js/horde-deepstrike-core.js');
const { measureEdgeToEdgeInches } = require('../../js/tts-telemetry-core.js');

test('Zero-JS-RNG Guard: horde-deepstrike-core.js contains zero Math.random() calls', () => {
  const src = fs.readFileSync(path.resolve(__dirname, '../../js/horde-deepstrike-core.js'), 'utf8');
  assert.equal(src.includes('Math.random'), false, 'Deep Strike solver must be 100% deterministic');
});

test('partitionWavesByDeepStrikeEligibility: routes standard Deep Strike to reserves ONLY in R2-R4, deploys in R1/R5, and always routes Misery #13 Pincer Maneuver', () => {
  const shelfTemplates = [
    { name: 'Terminator Squad', hasDeepStrike: true, radiusInches: 0.79 },
    { name: 'Captain in Terminator Armour', hasDeepStrike: true, radiusInches: 0.79 },
    { name: 'Intercessor Squad', hasDeepStrike: false, radiusInches: 0.63 }
  ];

  assert.equal(inferUnitHasDeepStrike('Terminator Squad', shelfTemplates), true);
  assert.equal(inferUnitHasDeepStrike('Intercessor Squad', shelfTemplates), false);
  assert.equal(inferUnitHasDeepStrike('Seraphim Squad', []), true, 'Fallback name heuristic detects Seraphim Deep Strike');
  assert.equal(buildFormationOffsets([{ templateName: 'Terminator Squad', count: 5, radiusInches: 0.79 }]).length, 5);

  const zoneSpawns = [
    { zone: 1, bracketKey: '7-9', units: ['5 Terminator Squad + 1 Captain in Terminator Armour'] },
    { zone: 2, bracketKey: '5-6', units: ['10 Intercessor Squad'] }
  ];

  // Round 1: Terminators MUST deploy in Spawn Zone 1 (not Reserves!)
  const r1 = partitionWavesByDeepStrikeEligibility(zoneSpawns, { battleRound: 1, shelfTemplates });
  assert.equal(r1.immediateZoneSpawns.length, 2);
  assert.equal(r1.reserveEntries.length, 0);

  // Round 2: Terminators + Terminator Captain both have Deep Strike -> held in Reserves; Intercessors spawn normally
  const r2 = partitionWavesByDeepStrikeEligibility(zoneSpawns, { battleRound: 2, shelfTemplates });
  assert.equal(r2.immediateZoneSpawns.length, 1);
  assert.equal(r2.immediateZoneSpawns[0].zone, 2);
  assert.equal(r2.reserveEntries.length, 1);
  assert.equal(r2.reserveEntries[0].mode, 'STANDARD_DEEP_STRIKE');
  assert.equal(r2.reserveEntries[0].fallbackZone, 1);

  // Round 5: Terminators deploy directly into Spawn Zone 1 again
  const r5 = partitionWavesByDeepStrikeEligibility(zoneSpawns, { battleRound: 5, shelfTemplates });
  assert.equal(r5.immediateZoneSpawns.length, 2);
  assert.equal(r5.reserveEntries.length, 0);

  // Misery #13 Pincer Maneuver: enters PINCER_MANEUVER reserves even for non-Deep-Strike units and even in Round 1/5
  const pincerZones = [
    { zone: 'PINCER', isPincerManeuver: true, bracketKey: '5-6', units: ['10 Intercessor Squad'] }
  ];
  const r5Pincer = partitionWavesByDeepStrikeEligibility(pincerZones, { battleRound: 5, shelfTemplates });
  assert.equal(r5Pincer.immediateZoneSpawns.length, 0);
  assert.equal(r5Pincer.reserveEntries.length, 1);
  assert.equal(r5Pincer.reserveEntries[0].mode, 'PINCER_MANEUVER');
});

test('solveDeepStrikeDrop (Standard >8"): places multi-model squad >8.0" edge-to-edge from all Player models, >3.0" from Objectives, and as close to Player as possible', () => {
  assert.equal(STANDARD_DEEP_STRIKE_MIN_ENEMY_INCHES, 8.0);
  assert.equal(OBJECTIVE_EXCLUSION_INCHES, 3.0);

  const board = {
    playmatBounds: { minX: -22, maxX: 22, minZ: -30, maxZ: 30 },
    objectives: [
      { name: 'Objective 1', pos: { x: 0, z: -10 }, radiusInches: 0.79 }
    ],
    units: [
      {
        squadKey: 'PLAYER::Hearthkyn',
        name: 'Hearthkyn Warriors',
        side: 'PLAYER',
        pos: { x: 0, z: -14 },
        models: [{ guid: 'p1', pos: { x: 0, z: -14 }, radiusInches: 0.55 }]
      }
    ]
  };

  const reserveEntry = {
    reserveId: 'res_termies',
    mode: 'STANDARD_DEEP_STRIKE',
    unitLabel: '5x Terminator Squad',
    fallbackZone: 1,
    fallbackAnchor: { x: 0, z: 19.5, facingY: 180 },
    units: [{ templateName: 'Terminator Squad', count: 5, radiusInches: 0.79 }]
  };

  const drop = solveDeepStrikeDrop(reserveEntry, board);
  assert.equal(drop.status, 'DROPPED_ON_BOARD');

  // Verify EVERY spawned model base in the 5-model ring obeys > 8.0" from Player AND > 3.0" from Objective 1
  for (const m of drop.spawnedModelsPreview) {
    const dEnemy = measureEdgeToEdgeInches(m.pos, m.radiusInches, { x: 0, z: -14 }, 0.55);
    const dObj = measureEdgeToEdgeInches(m.pos, m.radiusInches, { x: 0, z: -10 }, 0.79);
    assert.ok(dEnemy > 8.0, `Model at (${m.pos.x}, ${m.pos.z}) violated >8.0" enemy clearance (${dEnemy}")`);
    assert.ok(dObj > 3.0, `Model at (${m.pos.x}, ${m.pos.z}) violated >3.0" objective exclusion (${dObj}")`);
  }
  assert.ok(drop.closestEnemyDistanceInches > 8.0 && drop.closestEnemyDistanceInches < 9.5, 'Must hug >8" envelope for a 7+ Charge roll');
});

test('solveDeepStrikeDrop (Misery #13 Pincer Maneuver >3"): prioritizes Player DZ (>3" from enemies, objectives allowed), then NML', () => {
  assert.equal(PINCER_DEEP_STRIKE_MIN_ENEMY_INCHES, 3.0);

  const board = {
    playmatBounds: { minX: -22, maxX: 22, minZ: -30, maxZ: 30 },
    objectives: [{ name: 'Home Obj', pos: { x: 0, z: -24 }, radiusInches: 0.79 }],
    units: [
      {
        squadKey: 'PLAYER::Brokhyr',
        name: 'Brokhyr Thunderkyn',
        side: 'PLAYER',
        pos: { x: 0, z: -22 },
        models: [{ guid: 'p1', pos: { x: 0, z: -22 }, radiusInches: 0.79 }]
      }
    ]
  };

  const pincerEntry = {
    reserveId: 'res_pincer',
    mode: 'PINCER_MANEUVER',
    unitLabel: '5x Chaos Terminators',
    fallbackZone: 1,
    fallbackAnchor: { x: 0, z: 19.5, facingY: 180 },
    units: [{ templateName: 'Chaos Terminators', count: 5, radiusInches: 0.79 }]
  };

  const drop = solveDeepStrikeDrop(pincerEntry, board);
  assert.equal(drop.status, 'DROPPED_ON_BOARD');
  assert.equal(drop.deployedZoneTier, 'PLAYER_DZ', 'Pincer Maneuver must deploy inside Player DZ when unscreened');
  assert.ok(drop.targetZ <= -18, `Expected Player DZ z <= -18, got ${drop.targetZ}`);
  for (const m of drop.spawnedModelsPreview) {
    const dEnemy = measureEdgeToEdgeInches(m.pos, m.radiusInches, { x: 0, z: -22 }, 0.79);
    assert.ok(dEnemy > 3.0, `Pincer model must stay >3.0" from Player models (got ${dEnemy}")`);
  }
});

test('planDeepStrikeIngressDrops: falls back to Spawn Zone + Normal Move when Player screens out 100% of the playmat', () => {
  const screenedModels = [];
  for (let x = -20; x <= 20; x += 6) {
    for (let z = -28; z <= 28; z += 6) {
      screenedModels.push({ guid: `s_${x}_${z}`, pos: { x, z }, radiusInches: 0.63 });
    }
  }
  const board = {
    playmatBounds: { minX: -22, maxX: 22, minZ: -30, maxZ: 30 },
    objectives: [],
    units: [{ squadKey: 'PLAYER::Screen', name: 'Conscript Screen', side: 'PLAYER', pos: { x: 0, z: 0 }, models: screenedModels }]
  };

  const res = planDeepStrikeIngressDrops(
    [{
      reserveId: 'res_screened',
      mode: 'STANDARD_DEEP_STRIKE',
      unitLabel: '5x Seraphim Squad',
      fallbackZone: 2,
      fallbackAnchor: { x: 4, z: 19.5, facingY: 180 },
      units: [{ templateName: 'Seraphim Squad', count: 5, radiusInches: 0.63 }]
    }],
    board
  );

  assert.equal(res.drops.length, 1);
  assert.equal(res.drops[0].status, 'SCREENED_FALLBACK_SPAWN_ZONE');
  assert.equal(res.commands[0].action, 'SPAWN_WAVE', 'Screened-out Deep Striker must fall back to its rolled Spawn Zone instead of being destroyed');
  assert.equal(res.commands[0].zone, 2);
});

test('buildIngressFallbackCommand: converts an active DROPPED_ON_BOARD ingress drop into a FALLBACK_INGRESS_TO_SPAWN command when 3D ruin blocks setup', () => {
  const board = {
    playmatBounds: { minX: -22, maxX: 22, minZ: -30, maxZ: 30 },
    objectives: [],
    units: [{ squadKey: 'PLAYER::Krieg', name: 'Death Korps', side: 'PLAYER', pos: { x: 0, z: -14 }, models: [{ guid: 'k1', pos: { x: 0, z: -14 }, radiusInches: 0.5 }] }]
  };
  const solved = solveDeepStrikeDrop({
    reserveId: 'res_ruin_block',
    mode: 'STANDARD_DEEP_STRIKE',
    unitLabel: '5x Terminator Squad',
    fallbackZone: 2,
    fallbackAnchor: { x: 6.5, z: 19.5, facingY: 180 },
    units: [{ templateName: 'Terminator Squad', count: 5, radiusInches: 0.79 }]
  }, board);

  assert.equal(solved.status, 'DROPPED_ON_BOARD');
  assert.equal(solved.fallbackZone, 2);
  assert.equal(typeof buildIngressFallbackCommand, 'function');
  const fbCmd = buildIngressFallbackCommand(solved);
  assert.ok(fbCmd);
  assert.equal(fbCmd.action, 'FALLBACK_INGRESS_TO_SPAWN');
  assert.equal(fbCmd.reserveId, 'res_ruin_block');
  assert.equal(fbCmd.squadTag, 'SQUAD:DS_res_ruin_block');
  assert.equal(fbCmd.zone, 2);
  assert.equal(fbCmd.targetX, 6.5);
  assert.equal(fbCmd.targetZ, 19.5);
  assert.equal(fbCmd.units[0].templateName, 'Terminator Squad');
  assert.equal(fbCmd.units[0].count, 5);
});
