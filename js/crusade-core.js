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
