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
