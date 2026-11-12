# 📦 Fires of Armageddon // Bundle: Unit Tests (Horde Autopilot Core)

Unit tests for deterministic wave spawning, Bodyguard + Leader wave linking, 3" Transport cargo disembarkation, obstacle detours, shooting target priority, LCT charges, and 11th Ed consolidation (`tests/js/horde-autopilot-core.test.js`).

## 📑 Table of Contents
- [tests/js/horde-autopilot-core.test.js](#file-testsjshordeautopilotcoretestjs)

---

## File: `tests/js/horde-autopilot-core.test.js` <a id="file-testsjshordeautopilotcoretestjs"></a>

````javascript
/**
 * @fileoverview Unit tests for js/horde-autopilot-core.js deterministic wave spawning,
 * obstacle-aware movement, pre-Overwatch LOS revert, keyword target priority, charges & 11th Ed consolidation.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  planWaveSpawnCommands,
  buildDisembarkWaveCommand,
  planHordeMovementPhase,
  previewMovementSightlines,
  buildMoveRevertCommand,
  selectHordeShootingTargets,
  planHordeCharges,
  resolveHordeChargeRoll,
  planConsolidationMove
} = require('../../js/horde-autopilot-core.js');

test('Zero-JS-RNG Guard: horde-autopilot-core.js contains zero Math.random() calls', () => {
  const src = fs.readFileSync(path.resolve(__dirname, '../../js/horde-autopilot-core.js'), 'utf8');
  assert.equal(src.includes('Math.random'), false, 'Autopilot core must be 100% deterministic');
});

test('planWaveSpawnCommands: builds SPAWN_WAVE commands from synced Mode 1 zoneSpawns and skips NONE/empty warnings', () => {
  assert.equal(planWaveSpawnCommands([]).commands.length, 0);
  const zoneSpawns = [
    {
      zone: 1,
      bracketKey: 'NONE',
      units: ['None'],
      parsedWave: []
    },
    {
      zone: 2,
      bracketKey: '7-9',
      units: ['5 Bladeguard Veterans + 1 Captain'],
      parsedWave: [
        { count: 5, templateName: 'Bladeguard Veterans', embarked: null },
        { count: 1, templateName: 'Captain', embarked: null }
      ]
    },
    {
      zone: 3,
      bracketKey: '5-6',
      units: ['⚠️ Necrons Pool Empty for Bracket [5-6] — Configure in Mode 4!'],
      parsedWave: []
    }
  ];

  const plan = planWaveSpawnCommands(zoneSpawns);
  assert.equal(plan.commands.length, 1, 'Only valid populated zones should emit SPAWN_WAVE');
  assert.equal(plan.commands[0].action, 'SPAWN_WAVE');
  assert.equal(plan.commands[0].zone, 2);
  assert.equal(plan.commands[0].units.length, 2);
  assert.equal(plan.commands[0].units[0].templateName, 'Bladeguard Veterans');
  assert.equal(plan.commands[0].units[0].count, 5);
});

test('planHordeMovementPhase & buildMoveRevertCommand: stops outside 2" Engagement Range, detours/flags obstacles, auto-Advances out-of-range melee, and snapshots origin for LOS revert', () => {
  const board = {
    objectives: [{ name: 'Obj 1', pos: { x: 0, z: 0 }, radiusInches: 0.79 }],
    units: [
      {
        squadKey: 'HORDE::Berzerkers',
        name: 'Khorne Berzerkers',
        side: 'HORDE',
        modelCount: 15,
        move: 6,
        pos: { x: 0, z: 20 },
        keywords: ['INFANTRY'],
        weapons: [{ name: 'Chainblade', type: 'melee', rangeInches: 0, keywords: [] }],
        models: [
          { guid: 'b1', pos: { x: 0, y: 1.1, z: 20 }, radiusInches: 0.63 },
          { guid: 'b2', pos: { x: 1.3, y: 1.1, z: 20 }, radiusInches: 0.63 }
        ]
      },
      {
        squadKey: 'PLAYER::Krieg',
        name: 'Death Korps',
        side: 'PLAYER',
        modelCount: 10,
        pos: { x: 0, z: -5 },
        keywords: ['INFANTRY'],
        models: [{ guid: 'k1', pos: { x: 0, y: 1.1, z: -5 }, radiusInches: 0.5 }]
      }
    ]
  };

  // World Eaters (+2" Move = 8") + Misery #4 (auto-Advance 6" = 14" total move)
  const moveRes = planHordeMovementPhase(
    board,
    { factionName: 'World Eaters', activeMiseryIds: [4] },
    { obstacles: [{ name: 'Central Ruin', minX: -3, maxX: 3, minZ: 8, maxZ: 12, solid: true }] }
  );

  assert.equal(moveRes.plans.length, 1);
  const p = moveRes.plans[0];
  assert.equal(p.advanced, true, 'Out-of-range melee unit must automatically Advance');
  assert.equal(p.moveBudgetInches, 14);
  assert.equal(p.originModels.length, 2, 'Must record exact origin coordinates for Pre-Overwatch LOS revert');
  assert.equal(p.detouredAroundObstacle || p.requiresGhostRing, true, 'Must detect solid ruin blocking straight path');
  assert.equal(p.requiresGhostRing, true, 'Blob >10 models detouring around obstacle emits SPAWN_GHOST_RING');

  // Test Pre-Overwatch LOS Revert command generation
  const revertCmd = buildMoveRevertCommand(p);
  assert.equal(revertCmd.action, 'REVERT_MOVE');
  assert.deepEqual(revertCmd.models[0], { guid: 'b1', x: 0, y: 1.1, z: 20 });
  assert.equal(buildMoveRevertCommand(null), null);

  // Verify close unit stops > 2.0" outside Engagement Range on a Normal Move
  const closeBoard = {
    objectives: [],
    units: [
      {
        squadKey: 'HORDE::Gaunts',
        name: 'Hormagaunts',
        side: 'HORDE',
        modelCount: 1,
        move: 10,
        pos: { x: 0, z: 6 },
        keywords: ['INFANTRY'],
        weapons: [{ name: 'Claws', type: 'melee', rangeInches: 0, keywords: [] }],
        models: [{ guid: 'g1', pos: { x: 0, y: 1, z: 6 }, radiusInches: 0.5 }]
      },
      {
        squadKey: 'PLAYER::Tank',
        name: 'Rogal Dorn',
        side: 'PLAYER',
        modelCount: 1,
        pos: { x: 0, z: 0 },
        keywords: ['VEHICLE'],
        models: [{ guid: 't1', pos: { x: 0, y: 1, z: 0 }, radiusInches: 1.5 }]
      }
    ]
  };
  const closeRes = planHordeMovementPhase(closeBoard, { factionName: 'Tyranids', activeMiseryIds: [] });
  assert.ok(closeRes.plans[0].targetZ >= 4.05, 'Must stop outside 2.0" edge-to-edge Engagement Range (radii 0.5 + 1.5 + 2.1 buffer)');
});

test('selectHordeShootingTargets: enforces [ANTI-X], [PRECISION], [MELTA], Hidden 15" / Gone to Ground 12" & LOS blocks', () => {
  const shooter = {
    squadKey: 'HORDE::Shooter',
    guid: 'h_shoot',
    name: 'Chaos Havocs',
    side: 'HORDE',
    modelCount: 1,
    pos: { x: 0, z: 0 },
    keywords: ['INFANTRY'],
    models: [{ guid: 'h_shoot', pos: { x: 0, z: 0 }, radiusInches: 0.63 }],
    weapons: [
      { name: 'Haywire Cannon', type: 'ranged', rangeInches: 24, attacks: 2, skill: 3, strength: 6, ap: -1, damage: 2, keywords: ['ANTI-VEHICLE 4+'] },
      { name: 'Sniper Rifle', type: 'ranged', rangeInches: 36, attacks: 1, skill: 3, strength: 5, ap: -2, damage: 3, keywords: ['PRECISION'] },
      { name: 'Multi-melta', type: 'ranged', rangeInches: 18, attacks: 2, attacksMod: 0, skill: 4, strength: 9, ap: -4, damage: 'D6', keywords: ['MELTA 2'] },
      { name: 'Autocannon', type: 'ranged', rangeInches: 36, attacks: 2, skill: 4, strength: 9, ap: -1, damage: 3, keywords: [] }
    ]
  };

  const playerScreen = {
    squadKey: 'PLAYER::Screen',
    guid: 'p_screen',
    name: 'Krieg Guardsmen',
    side: 'PLAYER',
    pos: { x: 0, z: 8 },
    keywords: ['INFANTRY'],
    models: [{ guid: 'p_screen', pos: { x: 0, z: 8 }, radiusInches: 0.5 }]
  };
  const playerCommand = {
    squadKey: 'PLAYER::Command',
    guid: 'p_cmd',
    name: 'Marshal Command Squad',
    side: 'PLAYER',
    pos: { x: 0, z: 12 },
    keywords: ['INFANTRY', 'CHARACTER'],
    models: [{ guid: 'p_cmd', pos: { x: 0, z: 12 }, radiusInches: 0.5 }]
  };
  const playerTank = {
    squadKey: 'PLAYER::Tank',
    guid: 'p_tank',
    name: 'Leman Russ',
    side: 'PLAYER',
    pos: { x: 0, z: 15 },
    keywords: ['VEHICLE', 'IMPERIUM'],
    models: [{ guid: 'p_tank', pos: { x: 0, z: 15 }, radiusInches: 1.5 }]
  };
  const hiddenScouts = {
    squadKey: 'PLAYER::Scouts',
    guid: 'p_scouts',
    name: 'Hidden Stalkers',
    side: 'PLAYER',
    isHidden: true,
    pos: { x: 0, z: 18 },
    keywords: ['INFANTRY'],
    models: [{ guid: 'p_scouts', pos: { x: 0, z: 18 }, radiusInches: 0.5 }]
  };

  const assignments = selectHordeShootingTargets(
    { units: [shooter, playerScreen, playerCommand, playerTank, hiddenScouts], objectives: [] },
    { factionName: 'Chaos Space Marines', activeMiseryIds: [] }
  );

  const byWeapon = Object.fromEntries(assignments.map(a => [a.weapon.name, a.targetName]));
  assert.equal(byWeapon['Haywire Cannon'], 'Leman Russ', '[ANTI-VEHICLE] must prioritize closest VEHICLE');
  assert.equal(byWeapon['Sniper Rifle'], 'Marshal Command Squad', '[PRECISION] must prioritize closest CHARACTER unit');
  assert.equal(byWeapon['Multi-melta'], 'Leman Russ', '[MELTA] must prioritize closest non-INFANTRY/non-SWARM');
  assert.equal(byWeapon['Autocannon'], 'Krieg Guardsmen', 'Standard weapon targets closest visible Player unit');

  // Verify Hidden 15" cap blocks targeting Hidden Stalkers at ~16.87" when they are the only enemy
  const stealthCheck = selectHordeShootingTargets(
    { units: [shooter, hiddenScouts], objectives: [] },
    { factionName: 'Chaos Space Marines', activeMiseryIds: [] }
  );
  assert.equal(stealthCheck.length, 0, 'Hidden unit >15" away cannot be targeted by ranged attacks');

  // Misery #28 (They Fly Now) ignores terrain visibility & overrides Hidden cap
  const flyOverride = selectHordeShootingTargets(
    { units: [shooter, hiddenScouts], objectives: [] },
    { factionName: 'Chaos Space Marines', activeMiseryIds: [28] }
  );
  assert.ok(flyOverride.length > 0, 'Misery #28 ignores terrain visibility');
});

test('planHordeCharges & resolveHordeChargeRoll: queues 2D6 LCT mat roll, applies Razor Wire -2 mod, and glides into Engagement Range', () => {
  const board = {
    objectives: [],
    units: [
      {
        squadKey: 'HORDE::Eightbound',
        name: 'Eightbound',
        side: 'HORDE',
        modelCount: 3,
        guids: ['e1', 'e2', 'e3'],
        pos: { x: 0, z: 9 },
        keywords: ['INFANTRY'],
        models: [{ guid: 'e1', pos: { x: 0, z: 9 }, radiusInches: 0.78 }]
      },
      {
        squadKey: 'PLAYER::Beserks',
        name: 'Cthonian Beserks',
        side: 'PLAYER',
        pos: { x: 0, z: 0 },
        keywords: ['INFANTRY'],
        models: [{ guid: 'c1', pos: { x: 0, z: 0 }, radiusInches: 0.63 }]
      }
    ]
  };

  const chargePlan = planHordeCharges(
    board,
    { factionName: 'World Eaters', activeMiseryIds: [] },
    { withinRazorWireKeys: ['HORDE::Eightbound'] }
  );
  assert.equal(chargePlan.declarations.length, 1);
  const decl = chargePlan.declarations[0];
  // Edge-to-edge distance = 9 - 0.78 - 0.63 = 7.59"; Engagement Range is <= 2.0", so needed charge roll >= 6" (7.59 - 2.0 = 5.59 -> 6)
  assert.equal(decl.chargeRollMod, -2, 'Razor Wire subtracts 2 from Charge rolls');
  assert.equal(decl.lctCommand.action, 'LCT_MAT_ROLL');
  assert.equal(decl.lctCommand.count, 2);

  // Fail roll with Razor Wire: [4, 3] = 7 - 2 = 5 (< 5.59" needed to reach 2.0" Engagement Range)
  const failed = resolveHordeChargeRoll(decl, [4, 3]);
  assert.equal(failed.succeeded, false);
  assert.equal(failed.moveCommand, null);

  // Pass roll: [5, 5] = 10 - 2 = 8 (>= 5.59") -> glides into base-to-base!
  const passed = resolveHordeChargeRoll(decl, [5, 5]);
  assert.equal(passed.succeeded, true);
  assert.equal(passed.moveCommand.action, 'MOVE_UNIT');
});

test('planConsolidationMove: enforces 11th Edition 3-Tier Consolidation priority (Ongoing -> Engaging -> Objective)', () => {
  const mover = {
    squadKey: 'HORDE::Orks',
    name: 'Boyz',
    guids: ['o1'],
    pos: { x: 0, z: 0 },
    models: [{ guid: 'o1', pos: { x: 0, z: 0 }, radiusInches: 0.63 }]
  };

  // Tier 1: Already Engaged (<= 2.0") -> Ongoing Consolidation toward base-to-base
  const tier1 = planConsolidationMove(
    mover,
    [{ name: 'Krieg', pos: { x: 0, z: 2.5 }, models: [{ pos: { x: 0, z: 2.5 }, radiusInches: 0.5 }] }],
    [{ name: 'Obj 1', pos: { x: -3, z: 0 }, radiusInches: 0.79 }]
  );
  assert.equal(tier1.mode, 'ONGOING');

  // Tier 2: Unengaged, enemy at 3.8" edge-to-edge (3" move reaches <= 2.0" Engagement Range!) -> Engaging Consolidation
  const tier2 = planConsolidationMove(
    mover,
    [{ name: 'Scout', pos: { x: 0, z: 5.0 }, models: [{ pos: { x: 0, z: 5.0 }, radiusInches: 0.63 }] }],
    [{ name: 'Obj 1', pos: { x: -3, z: 0 }, radiusInches: 0.79 }]
  );
  assert.equal(tier2.mode, 'ENGAGING');

  // Tier 3: Enemy too far (10"), Objective at 4.2" edge-to-edge (3" move reaches <= 3.0" Obj range!) -> Objective Consolidation
  const tier3 = planConsolidationMove(
    mover,
    [{ name: 'Far Tank', pos: { x: 0, z: 14.0 }, models: [{ pos: { x: 0, z: 14.0 }, radiusInches: 1.5 }] }],
    [{ name: 'Obj 1', pos: { x: 5.5, z: 0 }, radiusInches: 0.79 }]
  );
  assert.equal(tier3.mode, 'OBJECTIVE');

  // Hold: neither enemy nor objective reachable
  const hold = planConsolidationMove(mover, [], []);
  assert.equal(hold.mode, 'HOLD');
});

test('planWaveSpawnCommands & buildDisembarkWaveCommand: links Bodyguard + Leader waves, preserves [5 + Leader] Transport cargo, and disembarks within 3"', () => {
  const wavePlan = planWaveSpawnCommands([
    {
      zone: 1,
      bracketKey: '7-9',
      units: ['5 Kill Team + 1 Watch Master']
    },
    {
      zone: 2,
      bracketKey: '10-12',
      units: ['1 Corvus Blackstar [5 Kill Team + 1 Watch Master]']
    }
  ]);

  assert.equal(wavePlan.commands.length, 2);
  const footCmd = wavePlan.commands[0];
  assert.equal(footCmd.units.length, 2);
  assert.ok(footCmd.units[0].attachedGroup, 'Bodyguard in + combo must receive an attachedGroup ID');
  assert.equal(
    footCmd.units[0].attachedGroup,
    footCmd.units[1].attachedGroup,
    '5 Kill Team + 1 Watch Master must share the same attachedGroup so they spawn as 1 Attached Unit'
  );

  const transportCmd = wavePlan.commands[1];
  assert.equal(transportCmd.units.length, 1);
  assert.equal(transportCmd.units[0].templateName, 'Corvus Blackstar');
  assert.deepEqual(transportCmd.units[0].embarkedUnits, [
    { count: 5, templateName: 'Kill Team' },
    { count: 1, templateName: 'Watch Master' }
  ]);
  assert.equal(transportCmd.units[0].embarkedSpec, '5 Kill Team + 1 Watch Master');

  // Disembark cargo within 3" of Transport hull
  assert.equal(typeof buildDisembarkWaveCommand, 'function');
  assert.equal(buildDisembarkWaveCommand(null), null);
  assert.equal(buildDisembarkWaveCommand({ name: 'Empty Rhino', embarkedCargo: [] }), null);

  const scannedTransport = {
    squadKey: 'HORDE::Corvus Blackstar',
    guid: 'corvus-01',
    name: 'Corvus Blackstar',
    side: 'HORDE',
    pos: { x: 6, z: 12 },
    models: [{ guid: 'corvus-01', pos: { x: 6, z: 12 }, radiusInches: 2.0 }],
    embarkedCargo: [
      { count: 5, templateName: 'Kill Team' },
      { count: 1, templateName: 'Watch Master' }
    ]
  };

  const disembarkCmd = buildDisembarkWaveCommand(scannedTransport);
  assert.equal(disembarkCmd.action, 'DISEMBARK_CARGO');
  assert.equal(disembarkCmd.transportGuid, 'corvus-01');
  assert.equal(disembarkCmd.squadTag, 'SQUAD:DISEMBARK_corvus-01');
  assert.equal(disembarkCmd.units.length, 2);

  // Verify disembark center is within 3.0" of Transport hull edge (center-to-center <= hullRadius + 2.5")
  const centerDist = Math.hypot(disembarkCmd.targetX - 6, disembarkCmd.targetZ - 12);
  const edgeFromHull = Math.max(0, centerDist - 2.0 - 0.63);
  assert.ok(edgeFromHull <= 3.0, `Disembark anchor must place models within 3" of Transport hull (got ${edgeFromHull}")`);

  // Round 2 Deep Strike reserve routing + Step 2 Movement Phase Ingress
  const r2Wave = planWaveSpawnCommands(
    [
      { zone: 1, bracketKey: '7-9', units: ['5 Terminator Squad'] },
      { zone: 2, bracketKey: '5-6', units: ['10 Intercessor Squad'] }
    ],
    [],
    { battleRound: 2, shelfTemplates: [{ name: 'Terminator Squad', hasDeepStrike: true, radiusInches: 0.79 }] }
  );
  assert.equal(r2Wave.commands.length, 1, 'Only non-Deep-Strike Intercessors spawn in Step 1 during Round 2');
  assert.equal(r2Wave.queuedReserves.length, 1, 'Terminators hold in Deep Strike Reserves for Step 2 Ingress');

  const ingressMove = planHordeMovementPhase(
    {
      playmatBounds: { minX: -22, maxX: 22, minZ: -30, maxZ: 30 },
      objectives: [],
      units: [
        { squadKey: 'HORDE::JustDropped', name: 'Raptors', side: 'HORDE', didIngressThisTurn: true, pos: { x: -8, z: 4 }, models: [{ guid: 'r1', pos: { x: -8, z: 4 }, radiusInches: 0.63 }] },
        { squadKey: 'PLAYER::Guard', name: 'Cadians', side: 'PLAYER', pos: { x: 0, z: -12 }, models: [{ guid: 'c1', pos: { x: 0, z: -12 }, radiusInches: 0.55 }] }
      ]
    },
    { factionName: 'Chaos Space Marines', activeMiseryIds: [], hordeReserves: r2Wave.queuedReserves }
  );
  assert.equal(ingressMove.plans[0].status, 'INGRESSED_HOLD', 'Units flagged didIngressThisTurn must hold rather than Normal Move');
  assert.equal(ingressMove.ingressDrops.length, 1);
  assert.equal(ingressMove.commands.some(c => c.action === 'DEEP_STRIKE_DROP'), true);
});

test('3D Wall Raycasts + 2D Solid Obstacles + previewMovementSightlines: blocks Armiger behind wall, supports losAllowedPairs override, and projects Step 2 sightlines', () => {
  const telemetry = {
    playmatBounds: { minX: -22, maxX: 22, minZ: -30, maxZ: 30 },
    // Thin 0.2" LCT ruin wall between X=0,Z=10 and X=0,Z=-4 that discrete 16-step sampling could skip
    obstacles: [
      { name: 'Central LCT Ruin Wall', minX: -6, maxX: 6, minZ: 1.9, maxZ: 2.1, heightY: 5.0, solid: true }
    ],
    autoBlockedLosPairs: [
      'HORDE::Armiger Warglaive->PLAYER::Kapricus Defender'
    ],
    objectives: [],
    units: [
      {
        squadKey: 'HORDE::Armiger Warglaive',
        name: 'Armiger Warglaive',
        side: 'HORDE',
        move: 12,
        pos: { x: 0, z: 14 },
        keywords: ['VEHICLE', 'WALKER'],
        models: [{ guid: 'arm-1', pos: { x: 0, y: 1.5, z: 14 }, radiusInches: 1.97 }],
        weapons: [
          { name: 'Thermal spear', type: 'ranged', rangeInches: 24, attacks: 2, skill: 3, strength: 12, ap: -4, damage: 'D6', keywords: ['MELTA 4'] }
        ]
      },
      {
        squadKey: 'PLAYER::Kapricus Defender',
        name: 'Kapricus Defender',
        side: 'PLAYER',
        toughness: 9,
        woundsPerModel: 10,
        pos: { x: 0, z: -4 },
        keywords: ['VEHICLE'],
        models: [{ guid: 'kap-1', pos: { x: 0, y: 1.5, z: -4 }, radiusInches: 1.8 }]
      },
      {
        squadKey: 'PLAYER::Hernkyn Yaegirs',
        name: 'Hernkyn Yaegirs',
        side: 'PLAYER',
        toughness: 4,
        woundsPerModel: 1,
        pos: { x: 12, z: 8 },
        keywords: ['INFANTRY'],
        models: [{ guid: 'yae-1', pos: { x: 12, y: 1.1, z: 8 }, radiusInches: 0.55 }]
      }
    ]
  };

  // 1. Default: Kapricus Defender is blocked by both autoBlockedLosPairs and the thin solid wall -> Armiger re-picks Hernkyn Yaegirs
  const defaultShots = selectHordeShootingTargets(telemetry, { activeMiseryIds: [] });
  assert.equal(defaultShots.length, 1);
  assert.equal(defaultShots[0].targetKey, 'PLAYER::Hernkyn Yaegirs', 'Armiger must skip wall-blocked Kapricus Defender and pick visible Hernkyn Yaegirs');

  // 2. Manual losAllowedPairs override ('👁️ Allow LOS') unblocks both autoBlockedLosPairs and obstacle segment for that pair
  const allowedShots = selectHordeShootingTargets(
    telemetry,
    { activeMiseryIds: [] },
    { losAllowedPairs: ['HORDE::Armiger Warglaive->PLAYER::Kapricus Defender'] }
  );
  assert.equal(allowedShots.length, 1);
  assert.equal(allowedShots[0].targetKey, 'PLAYER::Kapricus Defender', 'losAllowedPairs override must restore visibility to Kapricus Defender (higher MELTA/VEHICLE priority)');

  // 3. Thin 0.2" obstacle alone (without autoBlockedLosPairs) still blocks unless Misery #28 (They Fly Now) is active
  const obstacleOnlyTelemetry = { ...telemetry, autoBlockedLosPairs: [] };
  const blockedByWallShots = selectHordeShootingTargets(obstacleOnlyTelemetry, { activeMiseryIds: [] });
  assert.equal(blockedByWallShots[0].targetKey, 'PLAYER::Hernkyn Yaegirs', 'Exact Liang-Barsky 2D segment-AABB check must catch 0.2" thin wall');

  const flyMiseryShots = selectHordeShootingTargets(obstacleOnlyTelemetry, { activeMiseryIds: [28] });
  assert.equal(flyMiseryShots[0].targetKey, 'PLAYER::Kapricus Defender', 'Misery #28 (They Fly Now) ignores terrain obstacles');

  // 4. previewMovementSightlines projects Step 2 targets after movement (and respects REVERTED status)
  const preview = previewMovementSightlines(
    telemetry,
    { activeMiseryIds: [] },
    [
      {
        squadKey: 'HORDE::Armiger Warglaive',
        unitName: 'Armiger Warglaive',
        status: 'MOVED',
        originPos: { x: 0, y: 1.5, z: 14 },
        targetX: 10,
        targetZ: 10
      }
    ]
  );
  assert.ok(preview && preview.bySquad && preview.bySquad['HORDE::Armiger Warglaive']);
  const armSight = preview.bySquad['HORDE::Armiger Warglaive'];
  assert.equal(armSight.clearTargets.some(t => t.targetKey === 'PLAYER::Hernkyn Yaegirs'), true, 'Step 2 preview must list visible Hernkyn Yaegirs');
  assert.equal(armSight.blockedTargets.some(t => t.targetKey === 'PLAYER::Kapricus Defender'), true, 'Step 2 preview must list wall-blocked Kapricus Defender');
});

test('evaluatePairVisibility & Automatic Terrain Cover Detection: grants targetHasCover on Light/Dense terrain or behind ruin/barricade edges and respects manual Cover toggles', () => {
  const { evaluatePairVisibility } = require('../../js/horde-autopilot-core.js');
  assert.equal(typeof evaluatePairVisibility, 'function');

  const shooter = {
    squadKey: 'HORDE::Helverin',
    name: 'Armiger Helverin',
    side: 'HORDE',
    pos: { x: 2, z: 12 },
    keywords: ['VEHICLE'],
    models: [{ guid: 'h1', pos: { x: 2, z: 12 }, radiusInches: 1.97 }],
    weapons: [{ name: 'Autocannon', type: 'ranged', rangeInches: 48, attacks: 4, skill: 3, strength: 9, ap: -1, damage: 3, keywords: [] }]
  };

  const openTarget = {
    squadKey: 'PLAYER::OpenUnit',
    name: 'Open Hearthkyn',
    side: 'PLAYER',
    pos: { x: 10, z: 0 },
    keywords: ['INFANTRY'],
    models: [{ guid: 'p_open', pos: { x: 10, z: 0 }, radiusInches: 0.55 }]
  };

  const woodsTarget = {
    squadKey: 'PLAYER::WoodsUnit',
    name: 'Woods Yaegirs',
    side: 'PLAYER',
    pos: { x: 10, z: -6 },
    keywords: ['INFANTRY'],
    models: [{ guid: 'p_woods', pos: { x: 10, z: -6 }, radiusInches: 0.55 }]
  };

  const ruinEdgeTarget = {
    squadKey: 'PLAYER::RuinEdgeUnit',
    name: 'Ruin-Edge Pioneers',
    side: 'PLAYER',
    pos: { x: 0.35, z: 0.5 },
    keywords: ['MOUNTED'],
    models: [{ guid: 'p_edge', pos: { x: 0.35, z: 0.5 }, radiusInches: 0.9 }]
  };

  const obstacles = [
    { name: 'Light Woods Patch', minX: 8, maxX: 12, minZ: -8, maxZ: -4, heightY: 1.0, solid: false, terrainType: 'LIGHT' },
    { name: 'Central LCT Ruin Wall', minX: -6, maxX: 0, minZ: 1.9, maxZ: 2.1, heightY: 5.0, solid: true }
  ];
  const board = { units: [shooter, openTarget, woodsTarget, ruinEdgeTarget], objectives: [], obstacles };

  const openVis = evaluatePairVisibility(shooter, openTarget, 14, board, {});
  assert.equal(openVis.blocked, false);
  assert.equal(openVis.targetHasCover, false, 'Target in open field must have targetHasCover: false');

  const woodsVis = evaluatePairVisibility(shooter, woodsTarget, 18, board, {});
  assert.equal(woodsVis.blocked, false);
  assert.equal(woodsVis.targetHasCover, true, 'Target sitting on Light/Dense terrain must receive targetHasCover: true');

  const edgeVis = evaluatePairVisibility(shooter, ruinEdgeTarget, 11, board, {});
  assert.equal(edgeVis.blocked, false);
  assert.equal(edgeVis.targetHasCover, true, 'Target tucked behind a ruin/barricade edge must receive targetHasCover: true');

  const grantedOpen = evaluatePairVisibility(shooter, openTarget, 14, board, {
    coverGrantedPairs: ['HORDE::Helverin->PLAYER::OpenUnit']
  });
  assert.equal(grantedOpen.targetHasCover, true, 'coverGrantedPairs must grant Cover on open target');

  const strippedWoods = evaluatePairVisibility(shooter, woodsTarget, 18, board, {
    coverStrippedPairs: ['HORDE::Helverin->PLAYER::WoodsUnit']
  });
  assert.equal(strippedWoods.targetHasCover, false, 'coverStrippedPairs must strip automatic terrain Cover');

  const preview = previewMovementSightlines(board, {}, []);
  const helvClear = preview.bySquad['HORDE::Helverin'].clearTargets;
  assert.equal(helvClear.find(t => t.targetKey === 'PLAYER::OpenUnit')?.targetHasCover, false);
  assert.equal(helvClear.find(t => t.targetKey === 'PLAYER::WoodsUnit')?.targetHasCover, true);
  assert.equal(helvClear.find(t => t.targetKey === 'PLAYER::RuinEdgeUnit')?.targetHasCover, true);

  const shots = selectHordeShootingTargets(board, {});
  assert.equal(shots[0].targetKey, 'PLAYER::RuinEdgeUnit');
  assert.equal(shots[0].targetHasCover, true, 'selectHordeShootingTargets must surface targetHasCover on chosen assignment');
});



````
