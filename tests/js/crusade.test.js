const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '../../');
const crusadeData = require(path.join(ROOT_DIR, 'js/crusade-data.js'));
const crusadeForge = require(path.join(ROOT_DIR, 'js/crusade-forge.js'));
const crusade = require(path.join(ROOT_DIR, 'js/crusade.js'));

test('Crusade Data: ALLIANCE_TREES has 3 alliances and valid phase structures', () => {
  assert.ok(crusadeData.ALLIANCE_TREES.Gatebreakers);
  assert.ok(crusadeData.ALLIANCE_TREES.Desecrators);
  assert.ok(crusadeData.ALLIANCE_TREES.Marauders);
  assert.equal(crusadeData.ALLIANCE_TREES.Gatebreakers.length, 3);
  assert.ok(crusadeData.BATTLE_TRAIT_TABLES.Infantry.length >= 6);
  assert.ok(crusadeData.CRUSADE_RELIC_VAULT.Artificer.length >= 4);
});

test('Crusade Pure Core: compileTourDispatch generates valid Munitorum Regulation 884-A dispatch', () => {
  const result = crusadeForge.compileTourDispatch({
    tourBattlesRem: 8,
    tourWinsRem: 4,
    commendationPts: 3,
    logistics: { lexmechanicus: 2, materiel: 1, tithePool: 0, morale: 1 },
    upliftingPrimer: false,
    notes: 'Advance toward Hive Tartarus.'
  });
  assert.ok(result.includes('+++ DEPARTMENTO MUNITORUM // TOUR OF DUTY & LOGISTICS ALLOCATION DISPATCH +++'));
  assert.ok(result.includes('8 Battles Required // 4 Victories Required'));
  assert.ok(result.includes('Lexmechanicus: 2 | Materiel: 1 | Tithe Pool: 0 | Morale: 1'));
  assert.ok(result.includes('Advance toward Hive Tartarus.'));
});

test('Crusade Pure Core: compileMasterDossier formats distant augur telemetries without shifting SPts', () => {
  const result = crusade.compileMasterDossier({
    channel: 'augur_alpha',
    modeNode: 'Distant Solo Horde // Node 4',
    outcome: 'Swarm Repelled',
    secretCode: 'D99',
    secretTag: 'Recon Tag',
    leftoverSp: '2 SP',
    battleNotes: 'Distant artillery breach intercepted.',
    distantForce: 'Steel Legion Vanguard',
    queuedRolls: []
  });
  assert.ok(result.includes('+++ MASTER POST-BATTLE DOSSIER // ORBITAL AUGUR TELEMETRY +++'));
  assert.ok(result.includes('Steel Legion Vanguard (Neither Main Player Fielded)'));
  assert.ok(result.includes('Zero Alliance SPt Shift'));
});

test('Crusade Pure Core: compileMasterDossier includes attached Horde Battle Stats in Master Dossier', () => {
  const result = crusade.compileMasterDossier({
    channel: 'alpha',
    modeNode: 'Mode 1: The Ashen Breach (Horde Defence)',
    outcome: 'Victory: Survived All 6 Battle Rounds (+5 SPts)',
    secretCode: 'L2Y',
    secretTag: 'Early Reveal / End of Game',
    leftoverSp: '12 Leftover SP',
    battleNotes: 'Grim holdout against the greenskin tide.',
    queuedRolls: [],
    hordeBattleStats: {
      hordeKills: 17,
      spEarned: 28,
      spSpent: 16,
      leftoverSp: 12,
      leftoverCp: 3,
      stratagemsUsed: 5,
      roundsPlayed: 6,
      hordeFaction: 'Orks',
      roomSeed: 'HADES-1',
      gameMode: 'SOLO',
      miseriesDrawn: [{ id: 1, name: 'Eye of Terror' }],
      miseriesNullified: 0,
      secondariesCompleted: [{ id: 4, name: 'Hold the Line', rewardText: '3 SP' }],
      secondariesFailed: [{ id: 8, name: 'Desperate Stand', punText: '+2 Misery' }]
    }
  });

  assert.ok(result.includes('[HORDE ENGAGEMENT COMBAT TELEMETRY & BATTLE STATS]:'));
  assert.ok(result.includes('• HORDE ADVERSARY: Orks (Room Code: HADES-1 • Mode: SOLO)'));
  assert.ok(result.includes('• HORDE UNITS DESTROYED: 17 Units Slain'));
  assert.ok(result.includes('• SECONDARY MISSIONS: 1 Completed, 1 Failed'));
  assert.ok(result.includes('• SUPPLY ECONOMY: 28 SP Earned • 16 SP Spent on Resupply • 12 Leftover Banked'));
});

test('Crusade Votann Pure Core: compileVotannDispatch includes condition tracker and expedition totals', () => {
  const result = crusade.compileVotannDispatch({
    votann: {
      expBacking: 'Lean Operation (Free // Max 5 Battles)',
      expBattles: 2,
      expWins: 1,
      expGoal: 'Farstryd Exploration (Prospecting 3x)',
      expContract: 'Mining — Extraction: Minerals',
      goalProgress: 2,
      expTotals: { rawMinerals: 70, biomatter: 20, energySources: 10, galacticIntel: 0, rare: 1 },
      rawMinerals: 30,
      biomatter: 0,
      energySources: 10,
      galacticIntel: 0,
      rare: { rawMinerals: 0, biomatter: 0, energySources: 0, galacticIntel: 0 },
      assets: { outpost1: 'Active' }
    },
    notes: 'Secured deep seam.'
  });

  assert.ok(result.includes('+++ THRYMKÂL SALVAGE CONSORTIUM // BLACK-LEDGER EXPEDITION & ACQUISITIONS DISPATCH +++'));
  assert.ok(result.includes('• GOAL CONDITION TRACKER: 2 / 3'));
  assert.ok(result.includes('• EXPEDITION TOTAL (CURRENT RUN): Minerals: 70 | Biomatter: 20 | Energy: 10 | Intel: 0'));
  assert.ok(result.includes('• FUNDAMENTAL VAULT: Raw Minerals: 30 | Biomatter: 0 | Energy Sources: 10 | Galactic Intel: 0'));
});

test('Crusade Votann State: adjVotannRes accumulates expTotals on gain and expeditionsCompleted resets expedition', () => {
  crusadeForge.crusadeState.votann = null;
  const v = crusade.ensureVotannState();
  assert.equal(v.goalProgress, 0);
  assert.deepEqual(v.expTotals, { rawMinerals: 0, biomatter: 0, energySources: 0, galacticIntel: 0, rare: 0 });

  // Add 40 minerals
  crusade.adjVotannRes('rawMinerals', 40);
  assert.equal(v.rawMinerals, 40);
  assert.equal(v.expTotals.rawMinerals, 40);

  // Spend 20 minerals (vault decreases, expTotals remains 40)
  crusade.adjVotannRes('rawMinerals', -20);
  assert.equal(v.rawMinerals, 20);
  assert.equal(v.expTotals.rawMinerals, 40);

  // Adjust goal progress
  crusade.adjVotannExpField('goalProgress', 1);
  assert.equal(v.goalProgress, 1);
  crusade.adjVotannExpField('goalProgress', 3); // Clamped at 3
  assert.equal(v.goalProgress, 3);
  crusade.adjVotannExpField('goalProgress', -1);
  assert.equal(v.goalProgress, 2);

  // Complete and reset expedition
  crusade.adjVotannExpField('expeditionsCompleted', 1);
  assert.equal(v.expeditionsCompleted, 1);
  assert.equal(v.goalProgress, 0);
  assert.equal(v.expBattles, 0);
  assert.equal(v.expWins, 0);
  assert.deepEqual(v.expTotals, { rawMinerals: 0, biomatter: 0, energySources: 0, galacticIntel: 0, rare: 0 });
});

test('Crusade Pure Core: isHordeModeDossier returns true only for Mode 1 Horde battles and false for 1v1 PvP', () => {
  assert.equal(typeof crusade.isHordeModeDossier, 'function', 'crusade.js must export isHordeModeDossier');
  assert.equal(crusade.isHordeModeDossier('Mode 1: Co-op Horde Breach // Node 0 (Golgotha Arbor-Basin)'), true);
  assert.equal(crusade.isHordeModeDossier('Mode 1: Solo Horde Breach // Node 0 (Golgotha Arbor-Basin)'), true);
  assert.equal(crusade.isHordeModeDossier('Mode 1: Distant Solo Horde Breach // Orbital Augur Telemetry'), true);
  assert.equal(crusade.isHordeModeDossier('Mode 1: Horde Breach // Node 1 (Anthrand Munitions Vaults — Recon)'), true);
  assert.equal(crusade.isHordeModeDossier('Mode 2: 1v1 Ash Wastes PvP // Node 0 (Golgotha Arbor-Basin)'), false);
  assert.equal(crusade.isHordeModeDossier('1v1 Ash Wastes PvP'), false);
  assert.equal(crusade.isHordeModeDossier(''), false);
  assert.equal(crusade.isHordeModeDossier(null), false);
});

test('Crusade Pure Core: compileMasterDossier omits Horde Battle Stats when reporting a 1v1 PvP battle', () => {
  const pvpResult = crusade.compileMasterDossier({
    channel: 'alpha',
    modeNode: 'Mode 2: 1v1 Ash Wastes PvP // Node 0 (Golgotha Arbor-Basin)',
    outcome: '1v1 PvP Victory & Achieved Phase Narrative Goal (+5 SPts)',
    secretCode: 'None',
    secretTag: 'None / 1v1 Match',
    leftoverSp: '0 Leftover SP',
    battleNotes: 'Decisive 1v1 tank duel in the ash wastes.',
    queuedRolls: [],
    hordeBattleStats: {
      hordeKills: 19,
      spEarned: 24,
      spSpent: 12,
      leftoverSp: 12,
      hordeFaction: 'Tyranids',
      roomSeed: 'HIVE-4',
      gameMode: 'CO-OP'
    }
  });

  assert.ok(!pvpResult.includes('[HORDE ENGAGEMENT COMBAT TELEMETRY & BATTLE STATS]:'), '1v1 PvP report must NOT include Horde Battle Stats telemetry');
  assert.ok(!pvpResult.includes('Tyranids'), '1v1 PvP report must NOT include Horde Adversary line');
});

test('Crusade Tomb World Matrix: adjTombSystemPt, togglePowerReserves, rollMasterSystemReset, and compileTombAwakeningDossier', () => {
  crusade.resetTombAwakeningTab();
  assert.deepEqual(crusadeForge.crusadeState.tombSystems, { command: 0, reanimation: 0, translocation: 0 });
  assert.equal(crusadeForge.crusadeState.tombAgendasCompleted, 0);

  crusade.adjTombField('tombAgendasCompleted', 2);
  assert.equal(crusadeForge.crusadeState.tombAgendasCompleted, 2);

  // Standard max is 3 pts total
  crusade.adjTombSystemPt('command', 1);
  crusade.adjTombSystemPt('reanimation', 2);
  crusade.adjTombSystemPt('translocation', 1); // Should be blocked since 1+2 = 3/3
  assert.equal(crusadeForge.crusadeState.tombSystems.translocation, 0);

  // Enable Power Reserves (expands capacity to 4)
  crusadeForge.crusadeState.powerReservesAllocated = true;
  crusade.adjTombSystemPt('translocation', 1);
  assert.equal(crusadeForge.crusadeState.tombSystems.translocation, 1);

  const summary = crusade.buildTombMatrixSummaryLine();
  assert.ok(summary.includes('Allocated: 4/4 Pts'));
  assert.ok(summary.includes('Status: [MASTER ONLINE]'));

  const dispatch = crusade.compileTombAwakeningDossier({
    tombSystems: crusadeForge.crusadeState.tombSystems,
    powerReservesAllocated: true,
    notes: 'Awakening protocols locked.'
  });
  assert.ok(dispatch.includes('4 / 4 Awakening Points Active'));
  assert.ok(dispatch.includes('ONLINE (1D3 Power Drain Ready)'));
  assert.ok(dispatch.includes('Awakening protocols locked.'));

  // Roll Master System Reset (-D3 pts, +1 cycle)
  const beforeTotal = Object.values(crusadeForge.crusadeState.tombSystems).reduce((a, b) => a + b, 0);
  crusade.rollMasterSystemReset();
  const afterTotal = Object.values(crusadeForge.crusadeState.tombSystems).reduce((a, b) => a + b, 0);
  assert.ok(afterTotal < beforeTotal && afterTotal >= beforeTotal - 3);
  assert.equal(crusadeForge.crusadeState.tombAwakeningCycles, 1);
});

test('Crusade Votann: cycleVotannAssetState, adjVotannRare, and rollVotannPostBattleHarvest update vault and totals', () => {
  crusadeForge.crusadeState.votann = null;
  const v = crusade.ensureVotannState();

  // Cycle asset state: Locked -> Active -> Upgraded -> Inactive -> Locked
  assert.equal(v.assets.outpost1 || 'Locked', 'Locked');
  crusade.cycleVotannAssetState('outpost1');
  assert.equal(v.assets.outpost1, 'Active');
  crusade.cycleVotannAssetState('outpost1');
  assert.equal(v.assets.outpost1, 'Upgraded');

  // Rare resource adjustment
  crusade.adjVotannRare('energySources', 2);
  assert.equal(v.rare.energySources, 2);
  assert.equal(v.expTotals.rare, 2);
  crusade.adjVotannRare('energySources', -1);
  assert.equal(v.rare.energySources, 1);
  assert.equal(v.expTotals.rare, 2, 'Spending rare resource should not reduce expedition total');

  // Post-battle harvest roll adds fundamental resources
  const prevTotal = v.rawMinerals + v.biomatter + v.energySources + v.galacticIntel;
  crusade.rollVotannPostBattleHarvest();
  const nextTotal = v.rawMinerals + v.biomatter + v.energySources + v.galacticIntel;
  assert.ok(nextTotal > prevTotal, 'Post-battle harvest must increase total fundamental resources');
});


