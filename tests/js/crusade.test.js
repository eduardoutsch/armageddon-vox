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

