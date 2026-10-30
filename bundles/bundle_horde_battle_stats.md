# 📦 Fires of Armageddon // Bundle: Horde Battle Stats & Crusade Unit Tests

After-action Horde battle telemetry tracking (`js/horde-battle-stats.js`) and Crusade unit test suites (`tests/js/crusade.test.js`, `tests/js/crusade-data.test.js`, `tests/js/crusade-forge.test.js`).

## 📑 Table of Contents
- [js/horde-battle-stats.js](#file-jshordebattlestatsjs)
- [tests/js/crusade.test.js](#file-testsjscrusadetestjs)
- [tests/js/crusade-data.test.js](#file-testsjscrusadedatatestjs)
- [tests/js/crusade-forge.test.js](#file-testsjscrusadeforgetestjs)

---

## File: `js/horde-battle-stats.js` <a id="file-jshordebattlestatsjs"></a>

````javascript
/**
 * 📦 FIRES OF ARMAGEDDON // HORDE BATTLE STATS & CRUSADE TELEMETRY ENGINE
 *
 * Tracks, aggregates, and compiles complete after-action combat telemetry
 * from Mode 1 Horde Battles to attach directly into Mode 5 Crusade Master Dossiers.
 *
 * Telemetry metrics tracked:
 * - Total Horde Units Destroyed
 * - Misery Cards Drawn, Endured, and Nullified
 * - Secondary Missions Completed (Rewards Claimed) vs Failed (Punishments Endured)
 * - Resource Economy: Total SP Earned, SP Spent in Resupply, Leftover SP
 * - Command Assets: Stratagems Used, Leftover CP
 * - Faction & Room Seed, Game Mode (Solo/Co-op), Battle Round reached
 * - Confidential Secret Objective & Extracted Fortifications
 */

(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    const exports = factory();
    Object.assign(root, exports);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {

  const STORAGE_KEY_STATS = 'foa_horde_battle_stats_v1';

  let currentStats = {
    hordeKills: 0,
    spEarned: 0,
    spSpent: 0,
    leftoverSp: 0,
    leftoverCp: 2,
    stratagemsUsed: 0,
    roundsPlayed: 0,
    hordeFaction: '',
    roomSeed: '',
    gameMode: '',
    miseriesDrawn: [],
    miseriesNullified: 0,
    secondariesCompleted: [],
    secondariesFailed: [],
    secretObjective: null,
    fortifications: [],
    timestamp: null
  };

  /**
   * Resets the active in-memory battle stats to clean initial defaults.
   */
  function resetHordeBattleStats() {
    currentStats = {
      hordeKills: 0,
      spEarned: 0,
      spSpent: 0,
      leftoverSp: 0,
      leftoverCp: 2,
      stratagemsUsed: 0,
      roundsPlayed: 0,
      hordeFaction: '',
      roomSeed: '',
      gameMode: '',
      miseriesDrawn: [],
      miseriesNullified: 0,
      secondariesCompleted: [],
      secondariesFailed: [],
      secretObjective: null,
      fortifications: [],
      timestamp: null
    };
  }

  /**
   * Returns a copy of the current in-memory stats.
   * @returns {object}
   */
  function getHordeBattleStats() {
    return JSON.parse(JSON.stringify(currentStats));
  }

  /**
   * Increments the count of destroyed Horde units.
   * @param {number} count
   */
  function recordHordeKill(count = 1) {
    currentStats.hordeKills += (Number(count) || 1);
  }

  /**
   * Increments total SP earned across the battle.
   * @param {number} amount
   */
  function recordSpEarned(amount) {
    currentStats.spEarned += (Number(amount) || 0);
  }

  /**
   * Increments total SP spent in the Resupply Shop across the battle.
   * @param {number} amount
   */
  function recordSpSpent(amount) {
    currentStats.spSpent += (Number(amount) || 0);
  }

  /**
   * Increments total Stratagems used during the battle.
   */
  function recordStratagemUsed() {
    currentStats.stratagemsUsed += 1;
  }

  /**
   * Records a drawn Misery card.
   * @param {object} card
   */
  function recordMiseryDrawn(card) {
    if (!card) return;
    const exists = currentStats.miseriesDrawn.some(m => m.id === card.id);
    if (!exists) {
      currentStats.miseriesDrawn.push({
        id: card.id,
        name: card.name || `Misery #${card.id}`
      });
    }
  }

  /**
   * Records a nullified or discarded Misery card.
   * @param {object} [card]
   */
  function recordMiseryNullified(card) {
    currentStats.miseriesNullified += 1;
  }

  /**
   * Records the outcome of a Secondary Mission (Claimed Reward vs Applied Punishment).
   * @param {object} card - Secondary mission card object
   * @param {boolean} isSuccess - true if reward claimed, false if punishment applied
   * @param {object} [details] - Optional reward or punishment text
   */
  function recordSecondaryResolved(card, isSuccess, details = {}) {
    if (!card) return;
    const entry = {
      id: card.id,
      name: card.name || `Secondary #${card.id}`,
      rewardText: details.rewardText || card.rew || '',
      punText: details.punText || card.pun || ''
    };

    if (isSuccess) {
      currentStats.secondariesCompleted = currentStats.secondariesCompleted.filter(s => s.id !== card.id);
      currentStats.secondariesCompleted.push(entry);
    } else {
      currentStats.secondariesFailed = currentStats.secondariesFailed.filter(s => s.id !== card.id);
      currentStats.secondariesFailed.push(entry);
    }
  }

  /**
   * Pure functional compiler: compiles formatted teletype combat telemetry
   * from a plain battle stats object to embed into the Master Crusade Battle Dossier.
   *
   * @param {object} stats
   * @returns {string} Formatted markdown/teletype string
   */
  function compileHordeBattleStatsDossierSection(stats) {
    if (!stats) return '';

    const kills = Number(stats.hordeKills) || 0;
    const spEarned = Number(stats.spEarned) || 0;
    const spSpent = Number(stats.spSpent) || 0;
    const leftoverSp = Number(stats.leftoverSp) || 0;
    const leftoverCp = Number(stats.leftoverCp) || 0;
    const strats = Number(stats.stratagemsUsed) || 0;
    const round = Number(stats.roundsPlayed) || 0;
    const faction = stats.hordeFaction || 'Unknown Adversary';
    const room = stats.roomSeed || 'LOCAL';
    const mode = stats.gameMode ? String(stats.gameMode).toUpperCase() : 'CO-OP';

    const misDrawn = Array.isArray(stats.miseriesDrawn) ? stats.miseriesDrawn : [];
    const misNull = Number(stats.miseriesNullified) || 0;
    const misEndured = Math.max(0, misDrawn.length - misNull);

    const secComp = Array.isArray(stats.secondariesCompleted) ? stats.secondariesCompleted : [];
    const secFail = Array.isArray(stats.secondariesFailed) ? stats.secondariesFailed : [];

    const lines = [
      `------------------------------------------------`,
      `[HORDE ENGAGEMENT COMBAT TELEMETRY & BATTLE STATS]:`,
      `• HORDE ADVERSARY: ${faction} (Room Code: ${room} • Mode: ${mode})`,
      `• BATTLE DURATION: Battle Round ${round > 0 ? round : 'End of Match'}`,
      `• HORDE UNITS DESTROYED: ${kills} Units Slain`,
      `• MISERY CARDS: ${misDrawn.length} Drawn (${misNull} Nullified, ${misEndured} Endured)`
    ];

    if (secComp.length > 0 || secFail.length > 0) {
      lines.push(`• SECONDARY MISSIONS: ${secComp.length} Completed, ${secFail.length} Failed`);
      secComp.forEach(sc => {
        lines.push(`  - Completed: #${sc.id} ${sc.name}${sc.rewardText ? ` (${sc.rewardText})` : ''}`);
      });
      secFail.forEach(sf => {
        lines.push(`  - Failed: #${sf.id} ${sf.name}${sf.punText ? ` (${sf.punText})` : ''}`);
      });
    } else {
      lines.push(`• SECONDARY MISSIONS: None Resolved`);
    }

    lines.push(
      `• SUPPLY ECONOMY: ${spEarned} SP Earned • ${spSpent} SP Spent on Resupply • ${leftoverSp} Leftover Banked`,
      `• COMMAND ASSETS: ${strats} Stratagems Deployed • ${leftoverCp} CP Banked`
    );

    if (stats.secretObjective && stats.secretObjective.code) {
      lines.push(`• CONFIDENTIAL DIRECTIVE: [${stats.secretObjective.code}] ${stats.secretObjective.name || ''} (${stats.secretObjective.tags || ''})`);
    }

    if (Array.isArray(stats.fortifications) && stats.fortifications.length > 0) {
      lines.push(`• EXTRACTED FORTIFICATIONS: ${stats.fortifications.join(', ')}`);
    }

    lines.push(`------------------------------------------------`);
    return lines.join('\n');
  }

  /**
   * Persists a battle stats object to localStorage.
   * @param {object} stats
   */
  function saveHordeBattleStats(stats) {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats));
    } catch (e) {
      console.warn('Failed to save Horde battle stats to localStorage:', e);
    }
  }

  /**
   * Loads the most recent battle stats from localStorage.
   * @returns {object|null}
   */
  function loadHordeBattleStats() {
    if (typeof localStorage === 'undefined') return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY_STATS);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  /**
   * Clears saved battle stats from localStorage.
   */
  function clearHordeBattleStats() {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.removeItem(STORAGE_KEY_STATS);
    } catch (e) {}
  }

  /**
   * Live snapshot builder: inspects current live state in spawner.html and writes
   * a complete telemetry snapshot to localStorage for crusade.html.
   *
   * @param {object} [source] - Optional mock or explicit state source
   * @returns {object} The captured snapshot
   */
  function snapshotCurrentHordeStats(source = {}) {
    const g = typeof window !== 'undefined' ? window : globalThis;
    const doc = typeof document !== 'undefined' ? document : null;

    const effState = (source.state) || (g.state) || null;
    const battleRound = source.battleRound ?? g.battleRound ?? (effState?.round) ?? 0;
    const faction = source.hordeFaction || (g.activeHordeFaction?.name) || (doc?.getElementById('hordeFactionSelect')?.value) || 'Unknown Faction';
    const room = source.roomSeed || (doc?.getElementById('seedInput')?.value) || 'HADES-1';
    const isSolo = source.isSoloMode ?? g.isSoloMode ?? (effState?.mode === 'solo') ?? false;

    const sp = source.sp ?? g.sp ?? (effState?.sp) ?? 0;
    const spSpent = source.spSpentThisRound ?? g.spSpentThisRound ?? currentStats.spSpent ?? 0;
    const spEarned = currentStats.spEarned > 0 ? currentStats.spEarned : (sp + spSpent);
    const cp = source.cp ?? g.cp ?? (effState?.cp) ?? 2;
    const stratCount = source.stratCount ?? g.stratCount ?? currentStats.stratagemsUsed ?? 0;

    // Fortifications
    const forts = [];
    if (doc?.getElementById('fobFortCheck')?.checked) forts.push('Forward Operating Base (FOB)');
    if (doc?.getElementById('jammerCheck')?.checked) forts.push('Communications Jammer');
    if (doc?.getElementById('fortHosp')?.checked) forts.push('Field Hospital');
    if (doc?.getElementById('fortAmmo')?.checked) forts.push('Ammo Dump');
    if (doc?.getElementById('fortTrench')?.checked) forts.push('War Trench');

    // Secret card
    let secret = currentStats.secretObjective;
    if (!secret && g.activeCard) {
      secret = {
        code: g.activeCard.code || '',
        name: g.activeCard.name || '',
        tags: g.activeCard.tags || '',
        desc: g.activeCard.desc || ''
      };
    }

    const snapshot = {
      hordeKills: currentStats.hordeKills,
      spEarned,
      spSpent,
      leftoverSp: sp,
      leftoverCp: cp,
      stratagemsUsed: stratCount,
      roundsPlayed: Math.max(1, battleRound),
      hordeFaction: faction,
      roomSeed: room.trim().toUpperCase(),
      gameMode: isSolo ? 'SOLO' : 'CO-OP',
      miseriesDrawn: currentStats.miseriesDrawn.length > 0 ? currentStats.miseriesDrawn : (g.activeMiseries || []).map(m => ({ id: m.id, name: m.name })),
      miseriesNullified: currentStats.miseriesNullified,
      secondariesCompleted: currentStats.secondariesCompleted,
      secondariesFailed: currentStats.secondariesFailed,
      secretObjective: secret,
      fortifications: forts,
      timestamp: Date.now()
    };

    saveHordeBattleStats(snapshot);
    return snapshot;
  }

  return {
    resetHordeBattleStats,
    getHordeBattleStats,
    recordHordeKill,
    recordSpEarned,
    recordSpSpent,
    recordStratagemUsed,
    recordMiseryDrawn,
    recordMiseryNullified,
    recordSecondaryResolved,
    compileHordeBattleStatsDossierSection,
    saveHordeBattleStats,
    loadHordeBattleStats,
    clearHordeBattleStats,
    snapshotCurrentHordeStats
  };
});
````

---

## File: `tests/js/crusade.test.js` <a id="file-testsjscrusadetestjs"></a>

````javascript
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


````

---

## File: `tests/js/crusade-data.test.js` <a id="file-testsjscrusadedatatestjs"></a>

````javascript
/**
 * @fileoverview Unit test suite for js/crusade-data.js data tables and pure parser helpers.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const crusadeData = require('../../js/crusade-data.js');

test('crusade-data: parseCodexTraitOrScarLine parses d6, name, and description accurately', () => {
  const parsed = crusadeData.parseCodexTraitOrScarLine(
    '1–2 — Guardian Constructs: While a friendly CRYPTEK unit is on the battlefield, re-roll Wound rolls of 1.'
  );
  assert.equal(parsed.d6, '1–2');
  assert.equal(parsed.name, 'Guardian Constructs');
  assert.ok(parsed.desc.includes('While a friendly CRYPTEK unit'));

  const fallback = crusadeData.parseCodexTraitOrScarLine('Unformatted Trait Entry');
  assert.equal(fallback.d6, '1');
  assert.equal(fallback.name, 'Unformatted Trait Entry');
  assert.equal(fallback.desc, '');
});

test('crusade-data: parseCodexRelicLine parses relic name and description accurately', () => {
  const parsed = crusadeData.parseCodexRelicLine(
    'Orb of Eternity (Antiquity — NECRONS CHARACTER): Reanimates 3 wounds instead of D3!'
  );
  assert.equal(parsed.name, 'Orb of Eternity (Antiquity — NECRONS CHARACTER)');
  assert.equal(parsed.desc, 'Reanimates 3 wounds instead of D3!');

  const noColon = crusadeData.parseCodexRelicLine('Bare Relic Name');
  assert.equal(noColon.name, 'Bare Relic Name');
  assert.equal(noColon.desc, '');
});

test('crusade-data: exports complete Faction Trait, Relic, Scar, Logistics, Tomb, and Votann catalogs', () => {
  assert.equal(crusadeData.CRUSADE_STATE_KEY, 'foa_crusade_quartermaster_v1');

  // Necrons parsed trait & relic tables
  assert.equal(crusadeData.NECRONS_TRAIT_TABLES.Character.length, 6);
  assert.equal(crusadeData.NECRONS_TRAIT_TABLES.Infantry.length, 6);
  assert.equal(crusadeData.NECRONS_TRAIT_TABLES.Canoptek.length, 3);
  assert.ok(crusadeData.NECRONS_RELIC_VAULT.Artificer.length >= 2);
  assert.ok(crusadeData.NECRONS_RELIC_VAULT.Antiquity.length >= 2);
  assert.equal(crusadeData.NECRONS_RELIC_VAULT.Legendary.length, 1);
  assert.equal(crusadeData.NECRON_BATTLE_SCAR_TABLE.length, 4);

  // Votann tables & assets
  assert.equal(crusadeData.VOTANN_TRAIT_TABLES.Character.length, 3);
  assert.equal(crusadeData.VOTANN_TRAIT_TABLES.Infantry.length, 6);
  assert.equal(crusadeData.VOTANN_TRAIT_TABLES.Mounted.length, 3);
  assert.equal(crusadeData.VOTANN_RELIC_VAULT.Artificer.length, 3);
  assert.equal(crusadeData.VOTANN_RELIC_VAULT.Antiquity.length, 2);
  assert.equal(crusadeData.VOTANN_RELIC_VAULT.Legendary.length, 1);
  assert.equal(crusadeData.VOTANN_KINDRED_ASSETS.length, 10);
  assert.equal(crusadeData.VOTANN_VAULT_PROTOCOLS.length, 8);

  // Tomb World systems & Necron Dynastic Vault
  assert.equal(crusadeData.TOMB_WORLD_SYSTEMS.length, 3);
  assert.equal(crusadeData.NECRON_DYNASTIC_VAULT.length, 11);
});

````

---

## File: `tests/js/crusade-forge.test.js` <a id="file-testsjscrusadeforgetestjs"></a>

````javascript
/**
 * @fileoverview Unit test suite for js/crusade-forge.js state reducers, logistics allocator, and tour dispatch compilers.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const crusadeData = require('../../js/crusade-data.js');
const crusadeForge = require('../../js/crusade-forge.js');

// Ensure global tables are accessible when testing crusade-forge in Node
Object.assign(globalThis, crusadeData);

test('crusade-forge: adjScore increments and clamps scoreboard values at zero', () => {
  crusadeForge.crusadeState.alphaSP = 0;
  crusadeForge.adjScore('alphaSP', 4);
  assert.equal(crusadeForge.crusadeState.alphaSP, 4);

  crusadeForge.adjScore('alphaSP', -10);
  assert.equal(crusadeForge.crusadeState.alphaSP, 0);
});

test('crusade-forge: adjLogisticsPt enforces [0..2] per-category bounds and total capacity (4 standard, 5 with Uplifting Primer)', () => {
  crusadeForge.crusadeState.upliftingPrimer = false;
  crusadeForge.crusadeState.logistics = {
    lexmechanicus: 1,
    materiel: 2,
    tithePool: 0,
    morale: 1
  };

  // Total is already 4/4, so adding +1 to tithePool must be rejected
  crusadeForge.adjLogisticsPt('tithePool', 1);
  assert.equal(crusadeForge.crusadeState.logistics.tithePool, 0);

  // Materiel is already at max per-category (2), so adding +1 even with capacity must be rejected
  crusadeForge.crusadeState.upliftingPrimer = true; // 5 max capacity
  crusadeForge.adjLogisticsPt('materiel', 1);
  assert.equal(crusadeForge.crusadeState.logistics.materiel, 2);

  // Now with 5 max capacity, tithePool can be incremented to 1
  crusadeForge.adjLogisticsPt('tithePool', 1);
  assert.equal(crusadeForge.crusadeState.logistics.tithePool, 1);

  // Cannot go below 0
  crusadeForge.adjLogisticsPt('tithePool', -1);
  crusadeForge.adjLogisticsPt('tithePool', -1);
  assert.equal(crusadeForge.crusadeState.logistics.tithePool, 0);
});

test('crusade-forge: buildLogisticsSummaryLine summarizes quotas, surplus, and deficiency categories', () => {
  crusadeForge.crusadeState.tourBattlesRem = 6;
  crusadeForge.crusadeState.tourWinsRem = 3;
  crusadeForge.crusadeState.commendationPts = 5;
  crusadeForge.crusadeState.logistics = {
    lexmechanicus: 2,
    materiel: 2,
    tithePool: 0,
    morale: 0
  };

  const summary = crusadeForge.buildLogisticsSummaryLine();
  assert.ok(summary.includes('Battles Rem: 6 | Wins Rem: 3 | Commendation Pts: 5'));
  assert.ok(summary.includes('Surplus: [Lexmechanicus, Materiel]'));
  assert.ok(summary.includes('Deficiency: [Tithe, Morale]'));
});

test('crusade-forge: compileTourDispatch handles Uplifting Primer 5-point header and optional notes', () => {
  const withPrimer = crusadeForge.compileTourDispatch({
    tourBattlesRem: 7,
    tourWinsRem: 4,
    commendationPts: 2,
    logistics: { lexmechanicus: 2, materiel: 2, tithePool: 1, morale: 0 },
    upliftingPrimer: true,
    notes: ''
  });
  assert.ok(withPrimer.includes('MUNITORUM LOGISTICS ALLOCATION (5 PTS): Lexmechanicus: 2 | Materiel: 2 | Tithe Pool: 1 | Morale: 0'));
  assert.ok(!withPrimer.includes('REGIMENTAL DEPLOYMENT DIRECTIVE:'));
});

test('crusade-forge: attachRollToDossier, removeQueuedRoll, and clearQueuedRolls manage dossier roll queue', () => {
  crusadeForge.clearQueuedRolls();
  assert.equal(crusadeForge.crusadeState.queuedRolls.length, 0);

  crusadeForge.lastRolledItem.trait = {
    category: 'Battle Trait (Infantry)',
    roll: 'D6 = 3',
    name: 'Ash-Waste Stalkers',
    desc: 'Stealth in Round 1'
  };

  crusadeForge.attachRollToDossier('trait');
  assert.equal(crusadeForge.crusadeState.queuedRolls.length, 1);
  assert.equal(crusadeForge.crusadeState.queuedRolls[0].name, 'Ash-Waste Stalkers');

  crusadeForge.removeQueuedRoll(0);
  assert.equal(crusadeForge.crusadeState.queuedRolls.length, 0);
});

test('crusade-forge: adjTourField increments and clamps Tour of Duty counters at zero', () => {
  crusadeForge.crusadeState.tourBattlesRem = 3;
  crusadeForge.adjTourField('tourBattlesRem', 2);
  assert.equal(crusadeForge.crusadeState.tourBattlesRem, 5);

  crusadeForge.adjTourField('tourBattlesRem', -10);
  assert.equal(crusadeForge.crusadeState.tourBattlesRem, 0);
});

test('crusade-forge: rollNewTourQuotas and rollVictoryCommendationPts generate bounded D6+4, D3+2, and +D3 rolls', () => {
  for (let i = 0; i < 15; i++) {
    crusadeForge.rollNewTourQuotas();
    assert.ok(crusadeForge.crusadeState.tourBattlesRem >= 5 && crusadeForge.crusadeState.tourBattlesRem <= 10);
    assert.ok(crusadeForge.crusadeState.tourWinsRem >= 3 && crusadeForge.crusadeState.tourWinsRem <= 5);
  }

  crusadeForge.crusadeState.commendationPts = 0;
  crusadeForge.rollVictoryCommendationPts();
  assert.ok(crusadeForge.crusadeState.commendationPts >= 1 && crusadeForge.crusadeState.commendationPts <= 3);
});

test('crusade-forge: rollRandomBattleTrait, rollRandomWeaponMod, rollRandomRelic, and rollRandomBattleScar populate lastRolledItem', () => {
  crusadeForge.lastRolledItem.trait = null;
  crusadeForge.lastRolledItem.weapon = null;
  crusadeForge.lastRolledItem.relic = null;
  crusadeForge.lastRolledItem.scar = null;

  crusadeForge.rollRandomBattleTrait();
  assert.ok(crusadeForge.lastRolledItem.trait && crusadeForge.lastRolledItem.trait.name);
  assert.ok(crusadeForge.lastRolledItem.trait.category.includes('Battle Trait'));

  crusadeForge.rollRandomWeaponMod();
  assert.ok(crusadeForge.lastRolledItem.weapon && crusadeForge.lastRolledItem.weapon.name.includes('+'));
  assert.equal(crusadeForge.lastRolledItem.weapon.category, 'Weapon Modification (2x D6)');

  crusadeForge.rollRandomRelic();
  assert.ok(crusadeForge.lastRolledItem.relic && crusadeForge.lastRolledItem.relic.name);
  assert.ok(crusadeForge.lastRolledItem.relic.category.includes('Crusade Relic'));

  crusadeForge.rollRandomBattleScar();
  assert.ok(crusadeForge.lastRolledItem.scar && crusadeForge.lastRolledItem.scar.name);
  assert.equal(crusadeForge.lastRolledItem.scar.category, 'Battle Scar');
});

test('crusade-forge: buildStartOfTourDossierString and transmitStartOfTourDossier dispatch to alpha conduit', () => {
  crusadeForge.crusadeState.tourBattlesRem = 8;
  crusadeForge.crusadeState.tourWinsRem = 4;
  crusadeForge.crusadeState.commendationPts = 3;
  crusadeForge.crusadeState.upliftingPrimer = false;
  crusadeForge.crusadeState.logistics = { lexmechanicus: 1, materiel: 1, tithePool: 1, morale: 1 };

  const built = crusadeForge.buildStartOfTourDossierString();
  assert.ok(built.includes('8 Battles Required // 4 Victories Required'));
  assert.ok(built.includes('MUNITORUM LOGISTICS ALLOCATION (4 PTS):'));
  assert.ok(built.includes('ACTIVE COMMENDATION TALLY: 3 CmP'));

  let sentChannel = null;
  let sentPayload = null;
  globalThis.window = {
    VoxAudio: {
      transmitToVox: (ch, msg) => {
        sentChannel = ch;
        sentPayload = msg;
      }
    }
  };

  crusadeForge.transmitStartOfTourDossier();
  assert.equal(sentChannel, 'alpha');
  assert.equal(sentPayload, built);
});

````
