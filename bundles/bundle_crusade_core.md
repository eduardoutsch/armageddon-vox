# 📦 Fires of Armageddon // Bundle: Mode 5 - Crusade Pure Functional Core & ViewModels

Pure Functional Core state schemas, hydrators, RNG-injectable upgrade/resource rollers, declarative channel lookup tables, faction sub-matrix ViewModels, and DOM-free Astropathic Dossier compilers (`js/crusade-core.js`).

## 📑 Table of Contents
- [js/crusade-core.js](#file-jscrusadecorejs)

---

## File: `js/crusade-core.js` <a id="file-jscrusadecorejs"></a>

````javascript
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

  function applyMasterSystemDrain(tombSystems, currentCycles = 0, rng = Math.random) {
    const updated = { command: 0, reanimation: 0, translocation: 0, ...(tombSystems || {}) };
    const drainTarget = _rollDie(3, rng);
    let remaining = drainTarget;
    for (const key of TOMB_DRAIN_ORDER) {
      while (remaining > 0 && (updated[key] || 0) > 0) {
        updated[key] -= 1;
        remaining -= 1;
      }
    }
    return {
      drainTarget,
      drained: drainTarget - remaining,
      tombSystems: updated,
      tombAwakeningCycles: (Number(currentCycles) || 0) + 1
    };
  }

  function deriveTombMatrixViewModel(tombSystems, powerReservesAllocated, systemsCatalog = []) {
    const baseSys = tombSystems || { command: 1, reanimation: 1, translocation: 0 };
    const maxTotal = powerReservesAllocated ? 4 : 3;
    const allocated = Object.values(baseSys).reduce((a, b) => a + b, 0);
    const masterUnlocked = allocated >= 3;

    const masterStatus = masterUnlocked
      ? { label: `🟢 MASTER ONLINE (${allocated} / ${maxTotal} PTS)`, color: 'var(--green)' }
      : (allocated > 0
        ? { label: `🟡 AWAKENING (${allocated} / ${maxTotal} PTS)`, color: 'var(--gold)' }
        : { label: `🔴 DORMANT STASIS (0 / ${maxTotal} PTS)`, color: 'var(--red)' });

    const cards = (systemsCatalog || []).map((sys) => {
      const pts = baseSys[sys.key] || 0;
      const sysMasterActive = masterUnlocked && pts >= 1;
      return {
        key: sys.key,
        title: sys.title,
        agenda: sys.agenda,
        master: sys.master,
        pts,
        stateClass: (pts >= 2 || sysMasterActive) ? 'state-surplus' : (pts === 0 ? 'state-deficiency' : ''),
        badgeText: pts === 3 ? '🟢 MAX TIER 3 (3 PTS)' : (pts > 0 ? `⚡ TIER ${pts} ONLINE (${pts} PT${pts === 1 ? '' : 'S'})` : '🔴 DORMANT (0 PTS)'),
        badgeColor: pts === 3 ? 'var(--green)' : (pts > 0 ? 'var(--blue)' : 'var(--red)'),
        tiers: (sys.tiers || []).map((text, idx) => ({ text, unlocked: pts >= idx + 1 })),
        masterColor: sysMasterActive ? '#d8b4fe' : 'var(--muted)',
        masterPrefix: sysMasterActive ? '🟢 UNLOCKED — ' : '🔒 REQUIRES 3/3 MATRIX + 1 PT HERE — '
      };
    });

    return {
      allocated,
      maxTotal,
      allocatedLabel: `${allocated} / ${maxTotal}`,
      masterUnlocked,
      masterStatusLabel: masterStatus.label,
      masterStatusColor: masterStatus.color,
      cards
    };
  }

  function formatTombMatrixSummaryLine(state = {}) {
    const sys = state.tombSystems || { command: 1, reanimation: 1, translocation: 0 };
    const maxTotal = state.powerReservesAllocated ? 4 : 3;
    const total = (sys.command || 0) + (sys.reanimation || 0) + (sys.translocation || 0);
    const masterStr = total >= 3 ? 'MASTER ONLINE' : (total > 0 ? 'AWAKENING' : 'DORMANT');
    return `Allocated: ${total}/${maxTotal} Pts (Command: ${sys.command || 0}, Reanimation: ${sys.reanimation || 0}, Translocation: ${sys.translocation || 0}) | Status: [${masterStr}] | Agendas Logged: ${state.tombAgendasCompleted || 0} | Awakening Cycles: ${state.tombAwakeningCycles || 0}`;
  }

  function compileTombAwakeningDossier(input = {}) {
    const sys = input.tombSystems || {};
    const cmd = sys.command || 0;
    const reanim = sys.reanimation || 0;
    const trans = sys.translocation || 0;
    const allocatedPts = typeof input.allocatedPts === 'number' ? input.allocatedPts : (cmd + reanim + trans);
    const maxPts = input.powerReservesAllocated ? 4 : 3;
    const fmtSys = (n) => (n > 0 ? `ACTIVE (${n} Pt${n > 1 ? 's' : ''})` : 'INACTIVE (0 Pts)');
    const notes = String(input.notes || '').trim();

    const lines = [
      '+++ TOMB-SHIP MASTER MATRIX // TOMB WORLD AWAKENING & SYSTEM ALLOCATION DISPATCH +++',
      '• REPORTING PHAERON: LORD COMMANDER JUNEBUG // TOMB-SHIP INTERLINK',
      `• AWAKENING POINTS ALLOCATED: ${allocatedPts} / ${maxPts} Awakening Points Active`,
      `• COMMAND SYSTEM (SUBJUGATION DECREE): ${fmtSys(cmd)}`,
      `• REANIMATION SYSTEM (IMMORTAL SERVITUDE): ${fmtSys(reanim)}`,
      `• TRANSLOCATION SYSTEM (RELENTLESS EXPANSION): ${fmtSys(trans)}`,
      `• MASTER SYSTEM STATUS: ${allocatedPts >= 3 ? 'ONLINE (1D3 Power Drain Ready)' : 'DORMANT (Requires 3/3 Points)'}`
    ];
    if (notes) lines.push(`• CRYPTEK CONCLAVE DIRECTIVE: "${notes}"`);
    lines.push(
      '------------------------------------------------',
      'REQUEST FOR TOMB-SHIP MASTER MATRIX & CRYPTEK CONCLAVE: Please lock these Dynastic Awakening System power allocations into our Tomb-Ship hypercircuits and confirm our active Master System protocols!'
    );
    return lines.join('\n');
  }

  // ===========================================================================
  // TAB 5: LEAGUES OF VOTANN EXPEDITIONS & RESOURCE VAULT
  // ===========================================================================
  function adjustVotannResource(votannState, key, delta) {
    const v = createInitialVotannState(votannState);
    v[key] = clampCounter(v[key], delta);
    if (delta > 0) v.expTotals[key] = (v.expTotals[key] || 0) + delta;
    return { votann: v };
  }

  function adjustVotannRareResource(votannState, key, delta) {
    const v = createInitialVotannState(votannState);
    v.rare[key] = clampCounter(v.rare[key], delta);
    if (delta > 0) v.expTotals.rare = (v.expTotals.rare || 0) + delta;
    return { votann: v };
  }

  function calculateVotannHarvest(votannState, sizeMultiplier = 1, rng = Math.random) {
    const v = createInitialVotannState(votannState);
    const mult = Number(sizeMultiplier) || 1;
    const resRoll = _rollDie(6, rng);
    const d6Amt = _rollDie(6, rng) + (mult === 2 ? _rollDie(6, rng) : 0);
    const baseAmount = mult === 0.5 ? d6Amt * 5 : d6Amt * 10;
    const target = VOTANN_HARVEST_RESOURCE_MAP[resRoll] || VOTANN_HARVEST_RESOURCE_MAP[1];

    let mineralBonus = 0;
    if (target.key === 'rawMinerals') {
      ['outpost1', 'outpost2', 'outpost3'].forEach((k) => {
        if (v.assets[k] === 'Active') mineralBonus += 20;
        if (v.assets[k] === 'Upgraded') mineralBonus += 30;
      });
    }
    const finalGain = baseAmount + mineralBonus;
    v[target.key] = (v[target.key] || 0) + finalGain;
    v.expTotals[target.key] = (v.expTotals[target.key] || 0) + finalGain;

    let bioBonus = 0;
    if (target.key !== 'biomatter' && (v.assets.biorecyc === 'Active' || v.assets.biorecyc === 'Upgraded')) {
      bioBonus = 20;
      v.biomatter = (v.biomatter || 0) + 20;
      v.expTotals.biomatter = (v.expTotals.biomatter || 0) + 20;
    }

    return {
      resRoll,
      targetKey: target.key,
      targetLabel: target.label,
      baseAmount,
      mineralBonus,
      bioBonus,
      finalGain,
      votann: v
    };
  }

  function evaluateVotannRareRoll(rng = Math.random) {
    const d6 = _rollDie(6, rng);
    return { d6, success: d6 === 6 };
  }

  function adjustVotannExpeditionField(votannState, field, delta) {
    const v = createInitialVotannState(votannState);
    if (field === 'expeditionsCompleted') {
      v.expeditionsCompleted = clampCounter(v.expeditionsCompleted, delta);
      v.expBattles = 0;
      v.expWins = 0;
      v.goalProgress = 0;
      v.expTotals = { rawMinerals: 0, biomatter: 0, energySources: 0, galacticIntel: 0, rare: 0 };
    } else if (field === 'goalProgress') {
      v.goalProgress = Math.min(3, Math.max(0, (v.goalProgress || 0) + delta));
    } else {
      v[field] = clampCounter(v[field], delta);
    }
    return { votann: v };
  }

  function nextVotannAssetState(currentStatus) {
    const idx = VOTANN_ASSET_CYCLE.indexOf(currentStatus || 'Locked');
    return VOTANN_ASSET_CYCLE[(idx + 1) % VOTANN_ASSET_CYCLE.length];
  }

  function deriveVotannTabViewModel(votannState, assetsCatalog = []) {
    const v = createInitialVotannState(votannState);
    const maxBattles = v.expBacking.includes('6') ? 6 : (v.expBacking.includes('7') ? 7 : 5);
    const goalProgress = Math.min(3, Math.max(0, v.goalProgress || 0));
    const tot = v.expTotals || {};
    let activeAssetsCount = 0;

    const cards = (assetsCatalog || []).map((a) => {
      const status = v.assets[a.key] || 'Locked';
      if (status === 'Active' || status === 'Upgraded') activeAssetsCount += 1;
      const colorMap = { Upgraded: 'var(--green)', Active: 'var(--gold)', Inactive: 'var(--red)', Locked: 'var(--muted)' };
      return {
        key: a.key,
        title: a.title,
        status,
        badgeColor: colorMap[status] || 'var(--muted)',
        costLine: `Cost: ${a.cost} | Upg: ${a.upgCost}`,
        desc: status === 'Upgraded' ? a.upgDesc : a.baseDesc
      };
    });

    return {
      votann: v,
      maxBattles,
      battlesLabel: `${v.expBattles || 0} / ${maxBattles}`,
      winsLabel: String(v.expWins || 0),
      goalProgress,
      goalProgressLabel: `${goalProgress} / 3`,
      goalPipsText: [0, 1, 2].map((i) => (i < goalProgress ? '🟡' : '⚪')).join(' '),
      expTotalsText: `Minerals: ${tot.rawMinerals || 0} | Biomatter: ${tot.biomatter || 0} | Energy: ${tot.energySources || 0} | Intel: ${tot.galacticIntel || 0}${tot.rare ? ` | Rare: ${tot.rare}` : ''}`,
      activeAssetsCount,
      cards
    };
  }

  function formatVotannSummaryLine(votannState) {
    const v = createInitialVotannState(votannState);
    const r = v.rare || {};
    const tot = v.expTotals || {};
    return `Charter: ${v.expBacking || 'Lean'} (${v.expBattles || 0} Battles, ${v.expWins || 0} Wins, Goal: ${v.goalProgress || 0}/3) | Exp Total: M:${tot.rawMinerals || 0} B:${tot.biomatter || 0} E:${tot.energySources || 0} I:${tot.galacticIntel || 0} | Vault: M:${v.rawMinerals || 0} B:${v.biomatter || 0} E:${v.energySources || 0} I:${v.galacticIntel || 0} (Rare: M:${r.rawMinerals || 0}, B:${r.biomatter || 0}, E:${r.energySources || 0}, I:${r.galacticIntel || 0})`;
  }

  function compileVotannDispatch(input = {}) {
    const v = createInitialVotannState(input.votann);
    const activeAssets = Object.entries(v.assets || {})
      .filter(([, st]) => st === 'Active' || st === 'Upgraded')
      .map(([k, st]) => `${k} (${st})`)
      .join(', ') || 'None yet';
    const notes = String(input.notes || '').trim();
    const lines = [
      '+++ THRYMKÂL SALVAGE CONSORTIUM // BLACK-LEDGER EXPEDITION & ACQUISITIONS DISPATCH +++',
      '• REPORTING WARLORD: KÂHL HÂRKYN // THE LEDGER OF EMBERS (1,200 PTS)',
      `• EXPEDITION CHARTER: ${v.expBacking} | Progress: ${v.expBattles} Battles (${v.expWins} Wins)`,
      `• EXPEDITION GOAL: ${v.expGoal}`,
      `• GOAL CONDITION TRACKER: ${v.goalProgress || 0} / 3`,
      `• GUILD CONTRACT: ${v.expContract}`,
      `• EXPEDITION TOTAL (CURRENT RUN): Minerals: ${v.expTotals?.rawMinerals || 0} | Biomatter: ${v.expTotals?.biomatter || 0} | Energy: ${v.expTotals?.energySources || 0} | Intel: ${v.expTotals?.galacticIntel || 0}`,
      `• FUNDAMENTAL VAULT: Raw Minerals: ${v.rawMinerals} | Biomatter: ${v.biomatter} | Energy Sources: ${v.energySources} | Galactic Intel: ${v.galacticIntel}`,
      `• RARE RESOURCE VAULT: Minerals: ${v.rare?.rawMinerals || 0} | Biomatter: ${v.rare?.biomatter || 0} | Energy: ${v.rare?.energySources || 0} | Intel: ${v.rare?.galacticIntel || 0}`,
      `• ACTIVE KINDRED ASSETS: ${activeAssets}`
    ];
    if (notes) lines.push(`• CLAIM-RECKONER FIELD LOG: "${notes}"`);
    lines.push(
      '------------------------------------------------',
      'DIRECTIVE FOR FANE-NODE VÔL-09 ("THE DEAF EAR"): Inscribe this Black-Ledger resource tally and Expedition progress into the deep-core Ancestor Vault without alerting Geostationary Zenith-09!'
    );
    return lines.join('\n');
  }

  // ===========================================================================
  // TAB 2: MASTER POST-BATTLE DOSSIER & HORDE TELEMETRY IMPORT
  // ===========================================================================
  function isHordeModeDossier(modeNode) {
    const mode = String(modeNode || '').trim();
    if (!mode || /mode\s*2|1v1|pvp/i.test(mode)) return false;
    return /mode\s*1|horde/i.test(mode);
  }

  function isDistantAugurEngagement(channel, modeNode) {
    const chan = String(channel || 'alpha');
    return chan.startsWith('augur_') || /distant solo horde|augur telemetry|augur intercept/i.test(String(modeNode || ''));
  }

  function mapLeftoverSpToOption(leftoverSp) {
    const val = Number(leftoverSp) || 0;
    const match = LEFTOVER_SP_SALVAGE_TIERS.find((tier) => val >= tier.min);
    return match ? match.option : '0 Leftover SP';
  }

  function deriveHordeTelemetryImportPatch(stats = {}, currentModeNode = '') {
    const fortList = Array.isArray(stats.fortifications)
      ? stats.fortifications.map((f) => String(f).toLowerCase())
      : [];
    const shouldUpgradeSolo = stats.gameMode === 'SOLO' && currentModeNode && !currentModeNode.includes('Solo');

    return {
      secretCode: (stats.secretObjective && stats.secretObjective.code) ? String(stats.secretObjective.code) : null,
      leftoverSpOption: mapLeftoverSpToOption(stats.leftoverSp),
      upgradedSoloModeNode: shouldUpgradeSolo ? 'Mode 1: Solo Horde Breach // Node 0 (Golgotha Arbor-Basin)' : null,
      fortifications: {
        fortHosp: fortList.some((f) => f.includes('hospital')),
        fortAmmo: fortList.some((f) => f.includes('ammo')),
        fortTrench: fortList.some((f) => f.includes('trench')),
        fortFob: fortList.some((f) => f.includes('fob') || f.includes('forward operating'))
      }
    };
  }

  function compileMasterDossier(input = {}, options = {}) {
    const chan = input.channel || 'alpha';
    const modeNode = input.modeNode || '';
    const outcome = input.outcome || '';
    const secCode = (input.secretCode || 'N/A').trim().toUpperCase();
    const secTag = input.secretTag || 'None';
    const leftover = input.leftoverSp || '0 Leftover SP';
    const notes = (input.battleNotes || 'Battle concluded. Awaiting Campaign Master chronicle.').trim();
    const forts = Array.isArray(input.fortifications) ? input.fortifications : [];
    const fortStr = forts.length > 0 ? forts.join(', ') : 'None';
    const queuedRolls = Array.isArray(input.queuedRolls) ? input.queuedRolls : [];
    const distantForce = (input.distantForce || '').trim();
    const allowHordeStats = modeNode ? isHordeModeDossier(modeNode) : true;
    const formatHordeTelemetry = typeof options.formatHordeTelemetry === 'function' ? options.formatHordeTelemetry : null;
    const statsSection = (allowHordeStats && input.hordeBattleStats && formatHordeTelemetry)
      ? formatHordeTelemetry(input.hordeBattleStats)
      : '';

    const unitLines = queuedRolls.length > 0
      ? queuedRolls.map((q, i) => `  ${i + 1}. [${q.unit}] → ${q.category}: ${q.name} (${q.roll})\n     • Battlefield Context: "${q.context}"`).join('\n')
      : '  • None attached this battle.';

    if (isDistantAugurEngagement(chan, modeNode)) {
      const augurProfile = (chan === 'augur_beta' || chan === 'beta')
        ? DOSSIER_CHANNEL_PROFILES.augur_beta
        : DOSSIER_CHANNEL_PROFILES.augur_alpha;
      const forceName = distantForce || 'Unspecified Distant Auxiliary Detachment';
      const lines = [
        '+++ MASTER POST-BATTLE DOSSIER // ORBITAL AUGUR TELEMETRY +++',
        `• SCANNING SENSOR ARRAY: ORBITAL AUGUR ARRAY (Relayed via ${augurProfile.scanningVessel})`,
        `• ENGAGED FORCES (IN THE DISTANCE): ${forceName} (Neither Main Player Fielded)`,
        `• ENGAGEMENT CLASSIFICATION: ${modeNode}`,
        `• OUTCOME & SURVIVAL: ${outcome}`,
        `• SECRET OBJECTIVE CODE: [${secCode}] // TAG: ${secTag}`,
        `• EXTRACTED FORTIFICATIONS: ${fortStr}`,
        `• LEFTOVER SP SALVAGE: ${leftover}`,
        '• STRATEGIC POINTS & ALLIANCE IMPACT: Zero Alliance SPt Shift (Off-Roster Narrative Telemetry)',
        '• TOUR OF DUTY IMPACT: Zero Quota Deduction (Neither Main Player Fielded)'
      ];
      if (statsSection) lines.push(statsSection);
      lines.push(
        '------------------------------------------------',
        '• OBSERVED REMOTE UNIT UPGRADES, RELICS & BATTLE SCARS ("STORIES IN THE ASH-STORM"):',
        unitLines,
        '------------------------------------------------',
        `• ORBITAL AUGUR AFTER-ACTION LOG: "${notes}"`,
        '------------------------------------------------',
        'REQUEST FOR CAMPAIGN MASTER: Please emit an Astropathic Vox Decree logging this distant solo horde breach caught in the distance by our orbital augurs. As neither main player participated, no Alliance SPts are shifted—please chronicle the narrative fate of this remote detachment and christen custom in-universe Lore Names & Backstories for their attached unit Upgrades, Relics, and Battle Scars!'
      );
      return lines.join('\n');
    }

    const profile = DOSSIER_CHANNEL_PROFILES[chan] || DOSSIER_CHANNEL_PROFILES.alpha;
    const lines = [
      profile.headerLine,
      `• REPORTING COMMANDER: ${profile.commanderLabel}`,
      `• ENGAGEMENT & SECTOR NODE: ${modeNode}`,
      `• OUTCOME & SURVIVAL: ${outcome}`,
      `• SECRET OBJECTIVE CODE: [${secCode}] // TAG: ${secTag}`,
      `• EXTRACTED FORTIFICATIONS: ${fortStr}`,
      `• LEFTOVER SP SALVAGE: ${leftover}`
    ];

    const factionTelemetry = input[profile.telemetryKey] || options.factionTelemetryLine || '';
    if (factionTelemetry) lines.push(`${profile.telemetryPrefix}${factionTelemetry}`);
    if (statsSection) lines.push(statsSection);

    lines.push(
      '------------------------------------------------',
      profile.upgradeSectionTitle,
      unitLines,
      '------------------------------------------------',
      `• COMMANDER'S AFTER-ACTION LOG: "${notes}"`,
      '------------------------------------------------',
      profile.closingRequest
    );
    return lines.join('\n');
  }

  return {
    CRUSADE_TAB_DESCRIPTORS,
    FACTION_THEME_CLASSES,
    ALLIANCE_TREE_BUTTON_MAP,
    DOSSIER_CHANNEL_PROFILES,
    VOTANN_HARVEST_RESOURCE_MAP,
    VOTANN_ASSET_CYCLE,
    LEFTOVER_SP_SALVAGE_TIERS,
    TOMB_DRAIN_ORDER,
    clampCounter,
    createInitialVotannState,
    createInitialCrusadeState,
    hydrateCrusadeState,
    rollBattleTraitPick,
    rollWeaponModPair,
    rollCrusadeRelicPick,
    evaluateOutOfActionRoll,
    rollBattleScarPick,
    createQueuedUpgradeEntry,
    rollTourQuotaValues,
    rollCommendationPointsGain,
    allocateLogisticsPoint,
    deriveLogisticsViewModel,
    formatLogisticsSummaryLine,
    compileTourDispatch,
    allocateTombSystemPoint,
    applyMasterSystemDrain,
    deriveTombMatrixViewModel,
    formatTombMatrixSummaryLine,
    compileTombAwakeningDossier,
    adjustVotannResource,
    adjustVotannRareResource,
    calculateVotannHarvest,
    evaluateVotannRareRoll,
    adjustVotannExpeditionField,
    nextVotannAssetState,
    deriveVotannTabViewModel,
    formatVotannSummaryLine,
    compileVotannDispatch,
    isHordeModeDossier,
    isDistantAugurEngagement,
    mapLeftoverSpToOption,
    deriveHordeTelemetryImportPatch,
    compileMasterDossier
  };
})();

if (typeof window !== 'undefined') {
  window.CrusadeCore = CrusadeCore;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = CrusadeCore;
}
````
