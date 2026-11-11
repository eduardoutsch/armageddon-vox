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

