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
  planHordeMovementPhase,
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

