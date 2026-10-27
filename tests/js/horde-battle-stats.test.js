const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '../../');
const hordeStats = require(path.join(ROOT_DIR, 'js/horde-battle-stats.js'));

test('Horde Battle Stats: tracks kills, SP economy, stratagems, and round progression', () => {
  hordeStats.resetHordeBattleStats();
  assert.equal(hordeStats.getHordeBattleStats().hordeKills, 0);

  hordeStats.recordHordeKill(3);
  assert.equal(hordeStats.getHordeBattleStats().hordeKills, 3);

  hordeStats.recordSpEarned(6);
  assert.equal(hordeStats.getHordeBattleStats().spEarned, 6);

  hordeStats.recordSpSpent(4);
  assert.equal(hordeStats.getHordeBattleStats().spSpent, 4);

  hordeStats.recordStratagemUsed();
  hordeStats.recordStratagemUsed();
  assert.equal(hordeStats.getHordeBattleStats().stratagemsUsed, 2);
});

test('Horde Battle Stats: records miseries drawn, nullified, and secondaries resolved', () => {
  hordeStats.resetHordeBattleStats();

  hordeStats.recordMiseryDrawn({ id: 1, name: 'Eye of Terror' });
  hordeStats.recordMiseryDrawn({ id: 7, name: 'Unlucky Night' });
  assert.equal(hordeStats.getHordeBattleStats().miseriesDrawn.length, 2);

  hordeStats.recordMiseryNullified({ id: 1, name: 'Eye of Terror' });
  assert.equal(hordeStats.getHordeBattleStats().miseriesNullified, 1);

  hordeStats.recordSecondaryResolved({ id: 4, name: 'Hold the Line' }, true, { rewardText: '3 SP' });
  hordeStats.recordSecondaryResolved({ id: 8, name: 'Desperate Stand' }, false, { punText: '+2 Misery' });

  const stats = hordeStats.getHordeBattleStats();
  assert.equal(stats.secondariesCompleted.length, 1);
  assert.equal(stats.secondariesCompleted[0].name, 'Hold the Line');
  assert.equal(stats.secondariesCompleted[0].rewardText, '3 SP');

  assert.equal(stats.secondariesFailed.length, 1);
  assert.equal(stats.secondariesFailed[0].name, 'Desperate Stand');
  assert.equal(stats.secondariesFailed[0].punText, '+2 Misery');
});

test('Horde Battle Stats: compileHordeBattleStatsDossierSection produces rich teletype telemetry', () => {
  const sampleStats = {
    hordeKills: 14,
    spEarned: 26,
    spSpent: 14,
    leftoverSp: 12,
    leftoverCp: 3,
    stratagemsUsed: 4,
    roundsPlayed: 6,
    hordeFaction: 'Orks',
    roomSeed: 'HADES-1',
    gameMode: 'SOLO',
    miseriesDrawn: [
      { id: 1, name: 'Eye of Terror' },
      { id: 7, name: 'Unlucky Night' },
      { id: 21, name: 'Bunkers Busted' }
    ],
    miseriesNullified: 1,
    secondariesCompleted: [
      { id: 4, name: 'Hold the Line', rewardText: '3 SP' },
      { id: 10, name: 'Outflank', rewardText: '+1 Spawn Mod' }
    ],
    secondariesFailed: [
      { id: 8, name: 'Desperate Stand', punText: '+2 Misery' }
    ],
    secretObjective: { code: 'L2Y', name: '11 - Show Off', tags: 'Early Reveal / End of Game' },
    fortifications: ['Field Hospital', 'Ammo Dump', 'FOB']
  };

  const compiled = hordeStats.compileHordeBattleStatsDossierSection(sampleStats);
  assert.ok(compiled.includes('[HORDE ENGAGEMENT COMBAT TELEMETRY & BATTLE STATS]:'));
  assert.ok(compiled.includes('• HORDE ADVERSARY: Orks (Room Code: HADES-1 • Mode: SOLO)'));
  assert.ok(compiled.includes('• BATTLE DURATION: Battle Round 6'));
  assert.ok(compiled.includes('• HORDE UNITS DESTROYED: 14 Units Slain'));
  assert.ok(compiled.includes('• MISERY CARDS: 3 Drawn (1 Nullified, 2 Endured)'));
  assert.ok(compiled.includes('• SECONDARY MISSIONS: 2 Completed, 1 Failed'));
  assert.ok(compiled.includes('#4 Hold the Line (3 SP)'));
  assert.ok(compiled.includes('#8 Desperate Stand (+2 Misery)'));
  assert.ok(compiled.includes('• SUPPLY ECONOMY: 26 SP Earned • 14 SP Spent on Resupply • 12 Leftover Banked'));
  assert.ok(compiled.includes('• COMMAND ASSETS: 4 Stratagems Deployed • 3 CP Banked'));
  assert.ok(compiled.includes('• CONFIDENTIAL DIRECTIVE: [L2Y] 11 - Show Off'));
  assert.ok(compiled.includes('• EXTRACTED FORTIFICATIONS: Field Hospital, Ammo Dump, FOB'));
});

test('Horde Battle Stats: saveHordeBattleStats and loadHordeBattleStats persist to localStorage', () => {
  const mockStorage = {};
  globalThis.localStorage = {
    getItem: (k) => mockStorage[k] || null,
    setItem: (k, v) => { mockStorage[k] = String(v); },
    removeItem: (k) => { delete mockStorage[k]; }
  };

  const payload = {
    hordeKills: 9,
    hordeFaction: 'World Eaters',
    roundsPlayed: 4
  };

  hordeStats.saveHordeBattleStats(payload);
  const loaded = hordeStats.loadHordeBattleStats();
  assert.equal(loaded.hordeKills, 9);
  assert.equal(loaded.hordeFaction, 'World Eaters');
  assert.equal(loaded.roundsPlayed, 4);

  hordeStats.clearHordeBattleStats();
  assert.equal(hordeStats.loadHordeBattleStats(), null);

  delete globalThis.localStorage;
});

test('Horde Battle Stats: snapshotCurrentHordeStats aggregates live telemetry and persists to storage', () => {
  const mockStorage = {};
  globalThis.localStorage = {
    getItem: (k) => mockStorage[k] || null,
    setItem: (k, v) => { mockStorage[k] = String(v); },
    removeItem: (k) => { delete mockStorage[k]; }
  };

  hordeStats.resetHordeBattleStats();
  hordeStats.recordHordeKill(5);
  hordeStats.recordSpEarned(8);
  hordeStats.recordSpSpent(4);

  const snapshot = hordeStats.snapshotCurrentHordeStats({
    battleRound: 3,
    hordeFaction: 'Death Guard',
    roomSeed: 'WARP-7',
    isSoloMode: true,
    sp: 12,
    cp: 1
  });

  assert.equal(snapshot.hordeKills, 5);
  assert.equal(snapshot.hordeFaction, 'Death Guard');
  assert.equal(snapshot.roomSeed, 'WARP-7');
  assert.equal(snapshot.gameMode, 'SOLO');
  assert.equal(snapshot.roundsPlayed, 3);
  assert.equal(snapshot.leftoverSp, 12);
  assert.equal(snapshot.leftoverCp, 1);

  const reloaded = hordeStats.loadHordeBattleStats();
  assert.equal(reloaded.hordeKills, 5);
  assert.equal(reloaded.hordeFaction, 'Death Guard');

  delete globalThis.localStorage;
});

test('Spawn Rolling Regression: consecutive rollAllSpawnZones calls generate fresh random results on repeat presses', () => {
  // Mock minimal DOM for app.rollAllSpawnZones
  const mockEls = {
    seedInput: { value: 'HADES-1' },
    spawnZoneCountSelect: { value: '4' },
    hordeFactionSelect: { value: 'Orks' },
    extraSpawnMod: { value: '0' },
    spawnResultsContainer: { innerHTML: '' }
  };
  globalThis.document = {
    getElementById: (id) => mockEls[id] || { innerText: '', textContent: '', innerHTML: '', style: {}, classList: { contains: () => false, add: () => {}, remove: () => {} } },
    querySelectorAll: () => []
  };
  globalThis.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  };

  const app = require(path.join(ROOT_DIR, 'js/app.js'));

  // Roll 10 batches of spawns with 4 zones each
  const rollSnapshots = new Set();
  for (let i = 0; i < 10; i++) {
    app.rollAllSpawnZones();
    const diceSignatures = app.currentZoneSpawns.map(z => `${z.zone}:${z.diceStr}:${z.finalRoll}`).join('|');
    rollSnapshots.add(diceSignatures);
  }

  // With static Mulberry32 seed, all 10 rolls would be 100% identical (Set size = 1).
  // With fresh Math.random() rolls on every press, multiple distinct roll sequences are produced!
  assert.ok(rollSnapshots.size > 1, `Expected multiple distinct roll signatures across 10 presses, got ${rollSnapshots.size}`);
});

