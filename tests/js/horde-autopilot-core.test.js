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

