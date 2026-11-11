/**
 * @fileoverview Pure Functional Core & MVVM ViewModel Selectors for Mode 5 Crusade Quartermaster.
 * Isolates all Crusade state schemas, hydration rules, RNG-injectable upgrade/resource rollers,
 * faction sub-matrix ViewModels (Astra Militarum Logistics, Necron Tomb World Awakening,
 * Leagues of Votann Expeditions), and Astropathic Dossier compilers away from DOM, storage,
 * timers, and Web Audio side effects (AGENTS.md Principles II & III).
 */

var CrusadeCore = (function () {
  'use strict';

  /** Declarative UI tab descriptors mapping tab keys to DOM IDs and fixed faction CSS themes. */
  const CRUSADE_TAB_DESCRIPTORS = {
    board: { panelId: 'cruTabBoard', buttonId: 'cruTabBtn1', bodyThemeClass: null },
    forge: { panelId: 'cruTabForge', buttonId: 'cruTabBtn2', bodyThemeClass: null },
    tour: { panelId: 'cruTabTour', buttonId: 'cruTabBtn3', bodyThemeClass: 'theme-militarum' },
    tomb: { panelId: 'cruTabTomb', buttonId: 'cruTabBtn4', bodyThemeClass: 'theme-necron' },
    votann: { panelId: 'cruTabVotann', buttonId: 'cruTabBtn5', bodyThemeClass: 'theme-votann' }
  };

  const FACTION_THEME_CLASSES = ['theme-militarum', 'theme-necron', 'theme-votann'];

  const ALLIANCE_TREE_BUTTON_MAP = {
    Gatebreakers: 'treeBtnGate',
    Desecrators: 'treeBtnDes',
    Marauders: 'treeBtnMar'
  };

  /** Declarative channel profiles replacing nested ternary chains in Master Dossier compilation. */
  const DOSSIER_CHANNEL_PROFILES = {
    alpha: {
      targetVoxChannel: 'alpha',
      isDistantAugur: false,
      previewBeta: false,
      headerLine: '+++ DEPARTMENTO MUNITORUM // MASTER POST-BATTLE DOSSIER & HONOUR SCROLL +++',
      commanderLabel: 'THE EXILE // THE SANCTUARY OF ASH (ASTRA MILITARUM — 044TH KRIEG)',
      telemetryKey: 'logisticsSummary',
      telemetryPrefix: '• TOUR OF DUTY & LOGISTICS TELEMETRY: ',
      upgradeSectionTitle: '[2. QUARTERMASTER ROLLS // BATTLE HONOURS, RELICS & SCARS]:',
      closingRequest: 'REQUEST FOR CAMPAIGN MASTER (LOGIS-PREFECT VANE): Please audit this after-action dossier (Pattern 2), credit our Alliance & Sector Hegemony spoils in the orbital ledger, and christen the upgraded units and scars above with permanent Munitorum lore titles!'
    },
    beta: {
      targetVoxChannel: 'beta',
      isDistantAugur: false,
      previewBeta: true,
      headerLine: '+++ DYNASTIC ENGRAM-CHRONICLE // MASTER POST-BATTLE DOSSIER & AWAKENING LOG +++',
      commanderLabel: 'PHAERON JUNEBUG // TOMB-SHIP COMMAND INTERLINK (NECRONS)',
      telemetryKey: 'tombSummary',
      telemetryPrefix: '• TOMB WORLD AWAKENING MATRIX TELEMETRY: ',
      upgradeSectionTitle: '[2. CRYPTEK CONCLAVE // DYNASTIC EPITHETS, RELICS & ENGRAMMATIC FLAWS]:',
      closingRequest: 'REQUEST FOR TOMB-SHIP MASTER MATRIX & CRYPTEK CONCLAVE: Please inscribe this engagement into the Blackstone Engram-Chronicles (Pattern 2), allocate any earned Tomb World Awakening Points or Marauder/Alliance Hegemony spoils, and bestow permanent Dynastic Epithets upon the upgraded phalanxes above!'
    },
    gamma: {
      targetVoxChannel: 'gamma',
      isDistantAugur: false,
      previewBeta: false,
      headerLine: '+++ THRYMKÂL SALVAGE CONSORTIUM // MASTER POST-BATTLE DOSSIER & BLACK-LEDGER REPORT +++',
      commanderLabel: 'KÂHL HÂRKYN // THE LEDGER OF EMBERS (THRYMKÂL SALVAGE CONSORTIUM)',
      telemetryKey: 'votannSummary',
      telemetryPrefix: '• KINDRED EXPEDITION & RESOURCE VAULT TELEMETRY: ',
      upgradeSectionTitle: '[2. BRÔKHYR GUILD-COUNCIL // BATTLE HONOURS, RELICS & SCARS]:',
      closingRequest: 'REQUEST FOR FANE-NODE VÔL-09 ("THE DEAF EAR"): Inscribe this Black-Ledger post-battle record into the deep-core Ancestor Vault, register all asset yields and contract rewards, and christen our upgraded Kin with permanent Kindred honours!'
    },
    augur_alpha: {
      targetVoxChannel: 'alpha',
      isDistantAugur: true,
      previewBeta: false,
      scanningVessel: 'THE EXILE // SANCTUARY OF ASH'
    },
    augur_beta: {
      targetVoxChannel: 'beta',
      isDistantAugur: true,
      previewBeta: true,
      scanningVessel: 'LORD COMMANDER JUNEBUG'
    }
  };

  /** Declarative D6 resource harvest mapping for Leagues of Votann post-battle prospecting. */
  const VOTANN_HARVEST_RESOURCE_MAP = {
    1: { key: 'rawMinerals', label: 'Raw Minerals' },
    2: { key: 'biomatter', label: 'Biomatter' },
    3: { key: 'energySources', label: 'Energy Sources' },
    4: { key: 'galacticIntel', label: 'Galactic Intel' },
    5: { key: 'rawMinerals', label: 'Choice Resource (Defaulted to Raw Minerals)' },
    6: { key: 'rawMinerals', label: 'Choice Resource (Defaulted to Raw Minerals)' }
  };

  const VOTANN_ASSET_CYCLE = ['Locked', 'Active', 'Upgraded', 'Inactive'];
  const TOMB_DRAIN_ORDER = ['translocation', 'reanimation', 'command'];

  /** Ordered threshold table mapping numeric leftover SP to canonical Master Dossier option values. */
  const LEFTOVER_SP_SALVAGE_TIERS = [
    { min: 8, option: '8 Leftover SP → +1 RP or +100 pts Supply Limit' },
    { min: 5, option: '5 Leftover SP → +2 XP to Surviving Unit' },
    { min: 3, option: '3 Leftover SP → Bank 1v1 Supply Cache Token' },
    { min: 2, option: '2 Leftover SP → Orbital Auspex Recon Probe (Reveal Adjacent Node)' },
    { min: 0, option: '0 Leftover SP' }
  ];

  function _rollDie(sides, rng = Math.random) {
    return Math.min(sides, Math.max(1, Math.floor(rng() * sides) + 1));
  }

  function _pickRandom(list, rng = Math.random) {
    if (!Array.isArray(list) || list.length === 0) return null;
    const idx = Math.min(list.length - 1, Math.max(0, Math.floor(rng() * list.length)));
    return { index: idx, item: list[idx] };
  }

  /**
   * Clamps a non-negative integer counter after applying a signed delta.
   */
  function clampCounter(current, delta) {
    return Math.max(0, (Number(current) || 0) + (Number(delta) || 0));
  }

  /**
   * Creates a clean Leagues of Votann Kindred Expedition & Vault state object.
   */
  function createInitialVotannState(overrides = {}) {
    const base = {
      rawMinerals: 0,
      biomatter: 0,
      energySources: 0,
      galacticIntel: 0,
      rare: { rawMinerals: 0, biomatter: 0, energySources: 0, galacticIntel: 0 },
      expBacking: 'Lean Operation (Free // Max 5 Battles)',
      expGoal: 'Farstryd Exploration (Prospecting 2+ XP in 3+ Battles → +3 XP Character & 1 Free Mining Outpost)',
      expContract: 'Mining — Extraction: Minerals (60+ Raw Minerals → +1 Rare Raw Mineral)',
      expBattles: 0,
      expWins: 0,
      expeditionsCompleted: 0,
      goalProgress: 0,
      expTotals: { rawMinerals: 0, biomatter: 0, energySources: 0, galacticIntel: 0, rare: 0 },
      assets: {}
    };
    if (!overrides || typeof overrides !== 'object') return base;
    return {
      ...base,
      ...overrides,
      rare: { ...base.rare, ...(overrides.rare || {}) },
      expTotals: { ...base.expTotals, ...(overrides.expTotals || {}) },
      assets: { ...base.assets, ...(overrides.assets || {}) }
    };
  }

  /**
   * Creates the canonical Mode 5 Crusade Quartermaster state model.
   */
  function createInitialCrusadeState(overrides = {}) {
    const base = {
      activeTab: 'board',
      selectedTree: 'Gatebreakers',
      alphaSP: 0,
      alphaCP: 0,
      alphaCacheCount: 0,
      betaSP: 0,
      betaCP: 0,
      betaCacheCount: 0,
      hordeSP: 1,
      hordeCP: 0,
      queuedRolls: [],
      tourBattlesRem: 0,
      tourWinsRem: 0,
      commendationPts: 0,
      toursCompletedCount: 0,
      upliftingPrimer: false,
      logistics: { lexmechanicus: 1, materiel: 2, tithePool: 0, morale: 1 },
      tombAgendasCompleted: 0,
      tombAwakeningCycles: 0,
      powerReservesAllocated: false,
      tombSystems: { command: 1, reanimation: 1, translocation: 0 },
      votann: createInitialVotannState(),
      attachedHordeStats: null
    };
    return hydrateCrusadeState(base, overrides);
  }

  /**
   * Pure state hydrator merging a persisted JSON snapshot onto an existing Crusade state
   * while preserving nested sub-objects (`logistics`, `tombSystems`, `votann`).
   */
  function hydrateCrusadeState(baseState, savedSnapshot) {
    const base = baseState || createInitialCrusadeState();
    if (!savedSnapshot || typeof savedSnapshot !== 'object') return base;
    return {
      ...base,
      ...savedSnapshot,
      queuedRolls: Array.isArray(savedSnapshot.queuedRolls)
        ? savedSnapshot.queuedRolls.slice()
        : (Array.isArray(base.queuedRolls) ? base.queuedRolls.slice() : []),
      logistics: { ...(base.logistics || {}), ...(savedSnapshot.logistics || {}) },
      tombSystems: { ...(base.tombSystems || {}), ...(savedSnapshot.tombSystems || {}) },
      votann: createInitialVotannState({ ...(base.votann || {}), ...(savedSnapshot.votann || {}) })
    };
  }

  // ===========================================================================
  // QUARTERMASTER FORGE ROLLERS (PURE & RNG-INJECTABLE)
  // ===========================================================================
  function rollBattleTraitPick(poolKey, unitType, catalogs = {}, rng = Math.random) {
    const uType = unitType || 'Infantry';
    const poolLookup = {
      AlphaCodex: { tag: 'AM Codex', tables: catalogs.astraTraits },
      BetaCodex: { tag: 'Necrons Codex', tables: catalogs.necronTraits },
      GammaCodex: { tag: 'Leagues of Votann Codex', tables: catalogs.votannTraits },
      Armageddon: { tag: 'Armageddon', tables: catalogs.battleTraits }
    };
    const chosen = poolLookup[poolKey] || poolLookup.Armageddon;
    const fallbackTables = catalogs.battleTraits || {};
    const activeTables = chosen.tables || fallbackTables;
    const table = activeTables[uType] || activeTables.Infantry || fallbackTables.Infantry || [];
    const picked = _pickRandom(table, rng)?.item || { d6: 1, name: 'Default Trait', desc: 'No trait found' };

    return {
      category: `Battle Trait (${uType})`,
      roll: `D6 = ${picked.d6}`,
      d6: picked.d6,
      name: picked.name,
      desc: picked.desc,
      poolTag: chosen.tag
    };
  }

  function rollWeaponModPair(modsTable = [], rng = Math.random) {
    const first = _pickRandom(modsTable, rng);
    let second = _pickRandom(modsTable, rng);
    while (second && first && second.index === first.index && modsTable.length > 1) {
      second = _pickRandom(modsTable, rng);
    }
    const m1 = first?.item || { d6: 1, name: 'Brutal', desc: '+1 Strength' };
    const m2 = second?.item || { d6: 2, name: 'Master-Worked', desc: '+1 Damage' };
    return {
      category: 'Weapon Modification (2x D6)',
      roll: `D6 = ${m1.d6} & ${m2.d6}`,
      name: `${m1.name} + ${m2.name}`,
      desc: `[${m1.name}: ${m1.desc}] + [${m2.name}: ${m2.desc}]`,
      pick1: { ...m1, roll: m1.d6 },
      pick2: { ...m2, roll: m2.d6 }
    };
  }

  function rollCrusadeRelicPick(poolKey, tier, catalogs = {}, rng = Math.random) {
    const relicTier = tier || 'Artificer';
    const vaultLookup = {
      AlphaCodex: { tag: 'AM Codex', vault: catalogs.astraRelics },
      BetaCodex: { tag: 'Necrons Codex', vault: catalogs.necronRelics },
      GammaCodex: { tag: 'Leagues of Votann Codex', vault: catalogs.votannRelics },
      Armageddon: { tag: 'Armageddon', vault: catalogs.relicVault }
    };
    const chosen = vaultLookup[poolKey] || vaultLookup.Armageddon;
    const fallbackVault = catalogs.relicVault || {};
    const activeVault = chosen.vault || fallbackVault;
    const pool = activeVault[relicTier] || fallbackVault.Artificer || [];
    const picked = _pickRandom(pool, rng)?.item || { name: 'Standard Relic', desc: 'No relic found' };

    return {
      category: `Crusade Relic (${relicTier})`,
      roll: 'Vault Draw',
      tier: relicTier,
      name: picked.name,
      desc: picked.desc,
      poolTag: chosen.tag
    };
  }

  function evaluateOutOfActionRoll(rng = Math.random) {
    const roll = _rollDie(6, rng);
    return { roll, survived: roll >= 2 };
  }

  function rollBattleScarPick(poolKey, catalogs = {}, rng = Math.random) {
    const scarLookup = {
      BetaCodex: { tag: 'Necron Flaw', table: catalogs.necronScars },
      GammaCodex: { tag: 'Votann Scar', table: catalogs.votannScars && catalogs.votannScars.length ? catalogs.votannScars : catalogs.battleScars }
    };
    const chosen = scarLookup[poolKey] || { tag: 'Armageddon', table: catalogs.battleScars };
    const table = chosen.table || catalogs.battleScars || [];
    const picked = _pickRandom(table, rng)?.item || { d6: 1, name: 'Scar', desc: 'No scar' };

    return {
      category: 'Battle Scar',
      roll: `D6 = ${picked.d6}`,
      d6: picked.d6,
      name: picked.name,
      desc: picked.desc,
      poolTag: chosen.tag
    };
  }

  function createQueuedUpgradeEntry(rolledItem, unitName, unitContext) {
    return {
      unit: String(unitName || '[Unnamed Unit]').trim() || '[Unnamed Unit]',
      context: String(unitContext || 'Fielded in battle').trim() || 'Fielded in battle',
      category: rolledItem.category,
      roll: rolledItem.roll,
      name: rolledItem.name,
      desc: rolledItem.desc
    };
  }

  // ===========================================================================
  // TAB 3: ASTRA MILITARUM TOUR OF DUTY & MUNITORUM LOGISTICS
  // ===========================================================================
  function rollTourQuotaValues(rng = Math.random) {
    const bRoll = _rollDie(6, rng);
    const wRoll = _rollDie(3, rng);
    return {
      bRoll,
      wRoll,
      tourBattlesRem: bRoll + 4,
      tourWinsRem: wRoll + 2
    };
  }

  function rollCommendationPointsGain(currentPts = 0, rng = Math.random) {
    const gain = _rollDie(3, rng);
    return {
      gain,
      commendationPts: (Number(currentPts) || 0) + gain
    };
  }

  function allocateLogisticsPoint(logistics, upliftingPrimer, catKey, delta) {
    const baseLog = logistics || { lexmechanicus: 1, materiel: 2, tithePool: 0, morale: 1 };
    const maxTotal = upliftingPrimer ? 5 : 4;
    const currentTotal = Object.values(baseLog).reduce((a, b) => a + b, 0);
    const currVal = baseLog[catKey] || 0;
    const nextVal = currVal + delta;

    if (nextVal < 0 || nextVal > 2 || (delta > 0 && currentTotal >= maxTotal)) {
      return { changed: false, logistics: { ...baseLog }, allocated: currentTotal, maxTotal };
    }

    const updated = { ...baseLog, [catKey]: nextVal };
    return {
      changed: true,
      logistics: updated,
      allocated: currentTotal + delta,
      maxTotal
    };
  }

  function deriveLogisticsViewModel(logistics, upliftingPrimer, categories = []) {
    const baseLog = logistics || { lexmechanicus: 1, materiel: 2, tithePool: 0, morale: 1 };
    const maxTotal = upliftingPrimer ? 5 : 4;
    const allocated = Object.values(baseLog).reduce((a, b) => a + b, 0);
    const cards = (categories || []).map((cat) => {
      const pts = baseLog[cat.key] || 0;
      const isSurplus = pts === 2;
      const isStandard = pts === 1;
      return {
        key: cat.key,
        title: cat.title,
        pts,
        ptsLabel: `${pts} PT${pts === 1 ? '' : 'S'}`,
        stateClass: isSurplus ? 'state-surplus' : (pts === 0 ? 'state-deficiency' : ''),
        statusBadge: isSurplus ? '🟢 SURPLUS (2 PTS)' : (isStandard ? '⚪ STANDARD (1 PT)' : '🔴 DEFICIENCY (0 PTS)'),
        badgeColor: isSurplus ? 'var(--green)' : (isStandard ? 'var(--muted)' : 'var(--red)'),
        ruleColor: isSurplus ? 'var(--green)' : (isStandard ? 'var(--muted)' : 'var(--red)'),
        ruleText: isSurplus
          ? cat.surplus
          : (isStandard ? 'Standard Munitorum allocation — no Surplus bonus or Deficiency penalty applies.' : cat.deficiency)
      };
    });

    return { allocated, maxTotal, allocatedLabel: `${allocated} / ${maxTotal}`, cards };
  }

  function formatLogisticsSummaryLine(state = {}, categories = []) {
    const log = state.logistics || { lexmechanicus: 1, materiel: 2, tithePool: 0, morale: 1 };
    const surplus = [];
    const def = [];
    (categories || []).forEach((c) => {
      const v = log[c.key] || 0;
      const shortName = c.title.split(' ')[1] || c.title;
      if (v === 2) surplus.push(shortName);
      if (v === 0) def.push(shortName);
    });
    return `Battles Rem: ${state.tourBattlesRem || 0} | Wins Rem: ${state.tourWinsRem || 0} | Commendation Pts: ${state.commendationPts || 0} | Surplus: [${surplus.length ? surplus.join(', ') : 'None'}] | Deficiency: [${def.length ? def.join(', ') : 'None'}]`;
  }

  function compileTourDispatch(input = {}) {
    const battles = typeof input.tourBattlesRem === 'number' ? input.tourBattlesRem : 0;
    const wins = typeof input.tourWinsRem === 'number' ? input.tourWinsRem : 0;
    const commPts = typeof input.commendationPts === 'number' ? input.commendationPts : 0;
    const log = input.logistics || { lexmechanicus: 1, materiel: 1, tithePool: 1, morale: 1 };
    const maxPts = input.upliftingPrimer ? 5 : 4;
    const notes = String(input.notes || '').trim();

    const lines = [
      '+++ DEPARTMENTO MUNITORUM // TOUR OF DUTY & LOGISTICS ALLOCATION DISPATCH +++',
      '• REPORTING COMMANDER: THE EXILE // THE SANCTUARY OF ASH (044TH KRIEG)',
      `• OPERATIONAL QUOTAS: ${battles} Battles Required // ${wins} Victories Required`,
      `• MUNITORUM LOGISTICS ALLOCATION (${maxPts} PTS): Lexmechanicus: ${log.lexmechanicus || 0} | Materiel: ${log.materiel || 0} | Tithe Pool: ${log.tithePool || 0} | Morale: ${log.morale || 0}`,
      `• ACTIVE COMMENDATION TALLY: ${commPts} CmP`
    ];
    if (notes) lines.push(`• REGIMENTAL DEPLOYMENT DIRECTIVE: "${notes}"`);
    lines.push(
      '------------------------------------------------',
      'REQUEST FOR LOGIS-PREFECT VANE: Please register this Tour of Duty operational quota and Munitorum Regulation 884-Alpha logistics distribution in the orbital ledger!'
    );
    return lines.join('\n');
  }

  // ===========================================================================
  // TAB 4: NECRONS TOMB WORLD AWAKENING MATRIX
  // ===========================================================================
  function allocateTombSystemPoint(tombSystems, powerReservesAllocated, sysKey, delta) {
    const baseSys = tombSystems || { command: 1, reanimation: 1, translocation: 0 };
    const maxTotal = powerReservesAllocated ? 4 : 3;
    const currentTotal = Object.values(baseSys).reduce((a, b) => a + b, 0);
    const currVal = baseSys[sysKey] || 0;
    const nextVal = currVal + delta;

    if (nextVal < 0 || nextVal > 3 || (delta > 0 && currentTotal >= maxTotal)) {
      return { changed: false, tombSystems: { ...baseSys }, allocated: currentTotal, maxTotal };
    }
    const updated = { ...baseSys, [sysKey]: nextVal };
    return { changed: true, tombSystems: updated, allocated: currentTotal + delta, maxTotal };
  }

