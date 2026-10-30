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

