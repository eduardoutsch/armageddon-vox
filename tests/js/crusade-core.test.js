/**
 * @fileoverview Unit tests for js/crusade-core.js pure Functional Core, ViewModel selectors,
 * declarative lookup tables, RNG-injectable upgrade/resource rollers, and DOM-free dossier compilers.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '../../');
const crusadeData = require(path.join(ROOT_DIR, 'js/crusade-data.js'));
const hordeStats = require(path.join(ROOT_DIR, 'js/horde-battle-stats.js'));
const core = require(path.join(ROOT_DIR, 'js/crusade-core.js'));

function makeSeqRng(floats) {
  let idx = 0;
  return () => {
    const val = floats[idx % floats.length];
    idx += 1;
    return val;
  };
}

test('Humble View Purity Guard: js/crusade-core.js has zero DOM, storage, timer, audio, or network calls', () => {
  const src = fs.readFileSync(path.join(ROOT_DIR, 'js/crusade-core.js'), 'utf8');
  for (const forbidden of ['document.', 'localStorage', 'sessionStorage', 'VoxAudio', 'setTimeout(', 'fetch(']) {
    assert.equal(src.includes(forbidden), false, `js/crusade-core.js must remain pure and free of ${forbidden}`);
  }
});

test('State Initialization & Hydration: createInitialCrusadeState and hydrateCrusadeState merge nested sub-states cleanly', () => {
  const initial = core.createInitialCrusadeState();
  assert.equal(initial.hordeSP, 1);
  assert.equal(initial.activeTab, 'board');
  assert.deepEqual(initial.logistics, { lexmechanicus: 1, materiel: 2, tithePool: 0, morale: 1 });
  assert.deepEqual(initial.tombSystems, { command: 1, reanimation: 1, translocation: 0 });
  assert.equal(initial.votann.goalProgress, 0);

  const hydrated = core.hydrateCrusadeState(initial, {
    activeTab: 'votann',
    alphaSP: 9,
    logistics: { lexmechanicus: 2, materiel: 2, tithePool: 0, morale: 0 },
    tombSystems: { command: 3 },
    votann: { rawMinerals: 50, rare: { energySources: 2 }, assets: { outpost1: 'Upgraded' } }
  });

  assert.equal(hydrated.activeTab, 'votann');
  assert.equal(hydrated.alphaSP, 9);
  assert.equal(hydrated.hordeSP, 1);
  assert.equal(hydrated.logistics.lexmechanicus, 2);
  assert.equal(hydrated.tombSystems.command, 3);
  assert.equal(hydrated.tombSystems.reanimation, 1);
  assert.equal(hydrated.votann.rawMinerals, 50);
  assert.equal(hydrated.votann.rare.energySources, 2);
  assert.equal(hydrated.votann.rare.rawMinerals, 0);
  assert.equal(hydrated.votann.assets.outpost1, 'Upgraded');
});

test('Declarative Lookup Tables: CRUSADE_TAB_DESCRIPTORS and DOSSIER_CHANNEL_PROFILES cover all tabs and conduits', () => {
  assert.deepEqual(Object.keys(core.CRUSADE_TAB_DESCRIPTORS), ['board', 'forge', 'tour', 'tomb', 'votann']);
  assert.equal(core.CRUSADE_TAB_DESCRIPTORS.tour.bodyThemeClass, 'theme-militarum');
  assert.equal(core.CRUSADE_TAB_DESCRIPTORS.tomb.bodyThemeClass, 'theme-necron');
  assert.equal(core.CRUSADE_TAB_DESCRIPTORS.votann.bodyThemeClass, 'theme-votann');

  for (const ch of ['alpha', 'beta', 'gamma', 'augur_alpha', 'augur_beta']) {
    assert.ok(core.DOSSIER_CHANNEL_PROFILES[ch], `Missing DOSSIER_CHANNEL_PROFILES entry for ${ch}`);
  }
  assert.equal(core.DOSSIER_CHANNEL_PROFILES.augur_alpha.targetVoxChannel, 'alpha');
  assert.equal(core.DOSSIER_CHANNEL_PROFILES.augur_beta.targetVoxChannel, 'beta');
});

test('Pure Forge Rollers: deterministic traits, distinct 2xD6 weapon mods, relics, OOA tests, and battle scars', () => {
  const catalogs = {
    battleTraits: crusadeData.BATTLE_TRAIT_TABLES,
    astraTraits: crusadeData.ASTRA_MILITARUM_TRAIT_TABLES,
    necronTraits: crusadeData.NECRONS_TRAIT_TABLES,
    votannTraits: crusadeData.VOTANN_TRAIT_TABLES,
    weaponMods: crusadeData.WEAPON_MOD_TABLE,
    relicVault: crusadeData.CRUSADE_RELIC_VAULT,
    astraRelics: crusadeData.ASTRA_MILITARUM_RELIC_VAULT,
    necronRelics: crusadeData.NECRONS_RELIC_VAULT,
    votannRelics: crusadeData.VOTANN_RELIC_VAULT,
    battleScars: crusadeData.BATTLE_SCAR_TABLE,
    necronScars: crusadeData.NECRON_BATTLE_SCAR_TABLE,
    votannScars: crusadeData.VOTANN_BATTLE_SCAR_TABLE
  };

  // Trait pick across Armageddon, AlphaCodex, BetaCodex, GammaCodex
  const traitPick = core.rollBattleTraitPick('BetaCodex', 'Canoptek', catalogs, () => 0);
  assert.equal(traitPick.poolTag, 'Necrons Codex');
  assert.equal(traitPick.name, crusadeData.NECRONS_TRAIT_TABLES.Canoptek[0].name);

  const gammaTrait = core.rollBattleTraitPick('GammaCodex', 'Infantry', catalogs, () => 0.99);
  assert.equal(gammaTrait.poolTag, 'Leagues of Votann Codex');

  // Weapon Mod pair guarantees 2 distinct mods even if RNG repeats 0.0 then 0.0 -> 0.5
  const modPair = core.rollWeaponModPair(catalogs.weaponMods, makeSeqRng([0.0, 0.0, 0.4]));
  assert.notEqual(modPair.pick1.roll, modPair.pick2.roll);
  assert.ok(modPair.name.includes('+'));

  // Relic pick
  const relicPick = core.rollCrusadeRelicPick('AlphaCodex', 'Artificer', catalogs, () => 0);
  assert.equal(relicPick.poolTag, 'AM Codex');
  assert.equal(relicPick.name, crusadeData.ASTRA_MILITARUM_RELIC_VAULT.Artificer[0].name);

  // Out of Action roll: 0.0 -> D6=1 (failed), 0.2 -> D6=2 (survived)
  assert.deepEqual(core.evaluateOutOfActionRoll(() => 0.0), { roll: 1, survived: false });
  assert.deepEqual(core.evaluateOutOfActionRoll(() => 0.2), { roll: 2, survived: true });

  // Battle Scar pick
  const scarPick = core.rollBattleScarPick('BetaCodex', catalogs, () => 0);
  assert.equal(scarPick.poolTag, 'Necron Flaw');
  assert.equal(scarPick.name, crusadeData.NECRON_BATTLE_SCAR_TABLE[0].name);

  // Queued upgrade entry builder
  const entry = core.createQueuedUpgradeEntry(traitPick, '  Immortal Squad  ', '  Held Node 2  ');
  assert.equal(entry.unit, 'Immortal Squad');
  assert.equal(entry.context, 'Held Node 2');
  assert.equal(entry.name, traitPick.name);
});

test('Astra Militarum Tour & Logistics Core: quota rollers, capacity clamping, ViewModel & pure dispatch', () => {
  const quotas = core.rollTourQuotaValues(makeSeqRng([0.5, 0.99]));
  assert.equal(quotas.bRoll, 4);
  assert.equal(quotas.tourBattlesRem, 8);
  assert.equal(quotas.wRoll, 3);
  assert.equal(quotas.tourWinsRem, 5);

  const comm = core.rollCommendationPointsGain(2, () => 0.7);
  assert.equal(comm.gain, 3);
  assert.equal(comm.commendationPts, 5);

  // Capacity clamping
  const startLog = { lexmechanicus: 2, materiel: 1, tithePool: 1, morale: 0 };
  const blocked = core.allocateLogisticsPoint(startLog, false, 'morale', 1);
  assert.equal(blocked.changed, false);
  assert.equal(blocked.allocated, 4);

  const allowedWithPrimer = core.allocateLogisticsPoint(startLog, true, 'morale', 1);
  assert.equal(allowedWithPrimer.changed, true);
  assert.equal(allowedWithPrimer.logistics.morale, 1);
  assert.equal(allowedWithPrimer.allocated, 5);

  const vm = core.deriveLogisticsViewModel(startLog, false, crusadeData.LOGISTICS_CATEGORIES);
  assert.equal(vm.allocatedLabel, '4 / 4');
  assert.equal(vm.cards.length, 4);
  assert.equal(vm.cards[0].statusBadge, '🟢 SURPLUS (2 PTS)');
  assert.equal(vm.cards[3].statusBadge, '🔴 DEFICIENCY (0 PTS)');

  const dispatch = core.compileTourDispatch({
    tourBattlesRem: 8,
    tourWinsRem: 5,
    commendationPts: 5,
    logistics: startLog,
    upliftingPrimer: false,
    notes: 'Hold Hades Hive.'
  });
  assert.ok(dispatch.includes('8 Battles Required // 5 Victories Required'));
  assert.ok(dispatch.includes('Hold Hades Hive.'));
});

test('Necron Tomb Matrix Core: system point allocation, deterministic D3 drain order, ViewModel & pure dispatch', () => {
  const startSys = { command: 2, reanimation: 1, translocation: 0 };
  const blocked = core.allocateTombSystemPoint(startSys, false, 'translocation', 1);
  assert.equal(blocked.changed, false);

  const expanded = core.allocateTombSystemPoint(startSys, true, 'translocation', 1);
  assert.equal(expanded.changed, true);
  assert.equal(expanded.tombSystems.translocation, 1);

  // Drain 2 points (rng=0.5 -> D3=2) drains translocation (1->0) then reanimation (1->0), leaving command=2
  const drained = core.applyMasterSystemDrain(expanded.tombSystems, 1, () => 0.5);
  assert.equal(drained.drainTarget, 2);
  assert.equal(drained.drained, 2);
  assert.deepEqual(drained.tombSystems, { command: 2, reanimation: 0, translocation: 0 });
  assert.equal(drained.tombAwakeningCycles, 2);

  const vmOnline = core.deriveTombMatrixViewModel(startSys, false, crusadeData.TOMB_WORLD_SYSTEMS);
  assert.equal(vmOnline.allocatedLabel, '3 / 3');
  assert.ok(vmOnline.masterStatusLabel.includes('MASTER ONLINE'));

  const vmDormant = core.deriveTombMatrixViewModel({ command: 0, reanimation: 0, translocation: 0 }, false, crusadeData.TOMB_WORLD_SYSTEMS);
  assert.ok(vmDormant.masterStatusLabel.includes('DORMANT STASIS'));
});

test('Leagues of Votann Core: harvest multipliers + asset bonuses, rare check, asset cycling & pure dispatch', () => {
  const votann = core.createInitialVotannState({
    assets: { outpost1: 'Active', outpost2: 'Upgraded', biorecyc: 'Active' }
  });

  // Roll D6=1 (Raw Minerals) at Strike Force (mult=2: 2D6 with 4 and 5 -> 9 * 10 = 90) + Outpost1(+20) + Outpost2(+30) = 140, plus +20 Biomatter from biorecyc
  const harvestMinerals = core.calculateVotannHarvest(votann, 2, makeSeqRng([0.0, 0.6, 0.8]));
  assert.equal(harvestMinerals.targetKey, 'rawMinerals');
  assert.equal(harvestMinerals.baseAmount, 90);
  assert.equal(harvestMinerals.mineralBonus, 50);
  assert.equal(harvestMinerals.finalGain, 140);
  assert.equal(harvestMinerals.bioBonus, 20);
  assert.equal(harvestMinerals.votann.rawMinerals, 140);
  assert.equal(harvestMinerals.votann.biomatter, 20);
  assert.equal(harvestMinerals.votann.expTotals.rawMinerals, 140);
  assert.equal(harvestMinerals.votann.expTotals.biomatter, 20);

  // Roll D6=2 (Biomatter, rng=0.2) at Combat Patrol (mult=0.5: D6=4 -> 4 * 5 = 20); biorecyc does NOT double-trigger when rolling Biomatter directly
  const harvestBio = core.calculateVotannHarvest(harvestMinerals.votann, 0.5, makeSeqRng([0.2, 0.6]));
  assert.equal(harvestBio.targetKey, 'biomatter');
  assert.equal(harvestBio.baseAmount, 20);
  assert.equal(harvestBio.bioBonus, 0);
  assert.equal(harvestBio.finalGain, 20);
  assert.equal(harvestBio.votann.biomatter, 40);

  // Rare check: 0.9 -> D6=6 (success), 0.7 -> D6=5 (fail)
  assert.deepEqual(core.evaluateVotannRareRoll(() => 0.9), { d6: 6, success: true });
  assert.deepEqual(core.evaluateVotannRareRoll(() => 0.7), { d6: 5, success: false });

  // Asset state cycle
  assert.equal(core.nextVotannAssetState('Locked'), 'Active');
  assert.equal(core.nextVotannAssetState('Active'), 'Upgraded');
  assert.equal(core.nextVotannAssetState('Upgraded'), 'Inactive');
  assert.equal(core.nextVotannAssetState('Inactive'), 'Locked');

  // Expedition reset on completion
  const completed = core.adjustVotannExpeditionField(harvestBio.votann, 'expeditionsCompleted', 1).votann;
  assert.equal(completed.expeditionsCompleted, 1);
  assert.equal(completed.expTotals.rawMinerals, 0);
  assert.equal(completed.rawMinerals, 140, 'Fundamental vault persists when expedition resets');
});

test('Master Dossier & Horde Telemetry Patch: declarative salvage tiers, fortification flags, and Gamma Votann channel', () => {
  assert.equal(core.mapLeftoverSpToOption(9), '8 Leftover SP → +1 RP or +100 pts Supply Limit');
  assert.equal(core.mapLeftoverSpToOption(5), '5 Leftover SP → +2 XP to Surviving Unit');
  assert.equal(core.mapLeftoverSpToOption(3), '3 Leftover SP → Bank 1v1 Supply Cache Token');
  assert.equal(core.mapLeftoverSpToOption(2), '2 Leftover SP → Orbital Auspex Recon Probe (Reveal Adjacent Node)');
  assert.equal(core.mapLeftoverSpToOption(1), '0 Leftover SP');

  const patch = core.deriveHordeTelemetryImportPatch(
    {
      leftoverSp: 6,
      gameMode: 'SOLO',
      secretObjective: { code: 'V99' },
      fortifications: ['Field Hospital', 'Ammo Dump', 'Forward Operating Base']
    },
    'Mode 1: Co-op Horde Breach // Node 0 (Golgotha Arbor-Basin)'
  );
  assert.equal(patch.secretCode, 'V99');
  assert.equal(patch.leftoverSpOption, '5 Leftover SP → +2 XP to Surviving Unit');
  assert.ok(patch.upgradedSoloModeNode.includes('Mode 1: Solo Horde Breach'));
  assert.deepEqual(patch.fortifications, { fortHosp: true, fortAmmo: true, fortTrench: false, fortFob: true });

  const gammaDossier = core.compileMasterDossier(
    {
      channel: 'gamma',
      modeNode: 'Mode 1: Solo Horde Breach // Node 0 (Golgotha Arbor-Basin)',
      outcome: 'Victory (+5 SPts)',
      secretCode: 'V99',
      secretTag: 'Wargear Tag',
      leftoverSp: patch.leftoverSpOption,
      battleNotes: 'Kin prospectors held the drill rig.',
      votannSummary: 'Expeditions: 1 | Vault [M:40 B:20 E:10 I:0]',
      queuedRolls: [],
      hordeBattleStats: { hordeKills: 14, spEarned: 20, spSpent: 14, leftoverSp: 6, hordeFaction: 'Orks', roomSeed: 'VOT-1', gameMode: 'SOLO' }
    },
    {
      formatHordeTelemetry: hordeStats.compileHordeBattleStatsDossierSection
    }
  );
  assert.ok(gammaDossier.includes('+++ THRYMKÂL SALVAGE CONSORTIUM // MASTER POST-BATTLE DOSSIER & BLACK-LEDGER REPORT +++'));
  assert.ok(gammaDossier.includes('KÂHL HÂRKYN // THE LEDGER OF EMBERS'));
  assert.ok(gammaDossier.includes('KINDRED EXPEDITION & RESOURCE VAULT TELEMETRY: Expeditions: 1'));
  assert.ok(gammaDossier.includes('• HORDE UNITS DESTROYED: 14 Units Slain'));
});
