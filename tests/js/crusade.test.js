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
