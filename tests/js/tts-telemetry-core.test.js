/**
 * @fileoverview Unit tests for js/tts-telemetry-core.js pure TTS BBCode stripper,
 * Yellowscribe/ForceOrg datasheet parser, and 2D edge-to-edge tabletop geometry.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  stripTtsMarkup,
  parseModelNameAndWounds,
  parseDatasheetFromTts,
  inferBaseRadiusInches,
  measureEdgeToEdgeInches,
  normalizeTtsBoardScan
} = require('../../js/tts-telemetry-core.js');

test('stripTtsMarkup: removes TTS BBCode & hex color tags while preserving 40k [KEYWORD] brackets', () => {
  assert.equal(stripTtsMarkup(''), '');
  const raw = '[b][c6c930]Gauss flayer[-][/b] [00ff88ff][LETHAL HITS, RAPID FIRE 1][-]';
  const clean = stripTtsMarkup(raw);
  assert.equal(clean, 'Gauss flayer [LETHAL HITS, RAPID FIRE 1]');
});

test('parseModelNameAndWounds: extracts current/max wounds from prefix or suffix counters', () => {
  assert.deepEqual(parseModelNameAndWounds(''), {
    baseName: 'Unknown Model',
    currentWounds: null,
    maxWounds: null
  });
  assert.deepEqual(parseModelNameAndWounds('8/10 Screamer-Killer'), {
    baseName: 'Screamer-Killer',
    currentWounds: 8,
    maxWounds: 10
  });
  assert.deepEqual(parseModelNameAndWounds('[b]Necron Warriors[/b] (1/1)'), {
    baseName: 'Necron Warriors',
    currentWounds: 1,
    maxWounds: 1
  });
  assert.deepEqual(parseModelNameAndWounds('Overlord'), {
    baseName: 'Overlord',
    currentWounds: null,
    maxWounds: null
  });
});

test('parseDatasheetFromTts: parses tabular & inline Yellowscribe/ForceOrg stats, saves, keywords, and weapons', () => {
  const yellowscribeDesc = `
    [b][f5b041]M    T   Sv   W   Ld   OC[-][/b]
    8"   9   3+   10  6+   3
    [c6c930]Invulnerable Save:[-] 4+
    [c6c930]Abilities:[-] Scouts 6", Deadly Demise D3, Feel No Pain 5+
    [b]Ranged Weapons[/b]
    Bio-plasmic scream | 18" | D6+3 | 4+ | 8 | -2 | 1 | [ASSAULT, BLAST]
    [b]Melee Weapons[/b]
    Screamer-killer talons | Melee | 10 | 3+ | 10 | -2 | 3 | [LETHAL HITS]
    [b]Keywords:[/b] Monster, Character, Great Devourer, Screamer-Killer
  `;

  const ds = parseDatasheetFromTts(yellowscribeDesc);
  assert.equal(ds.move, 8);
  assert.equal(ds.toughness, 9);
  assert.equal(ds.save, 3);
  assert.equal(ds.invuln, 4);
  assert.equal(ds.fnp, 5);
  assert.equal(ds.woundsPerModel, 10);
  assert.equal(ds.leadership, 6);
  assert.equal(ds.oc, 3);
  assert.equal(ds.scoutsInches, 6);
  assert.ok(ds.keywords.includes('MONSTER') && ds.keywords.includes('CHARACTER'));

  assert.equal(ds.weapons.length, 2);
  assert.equal(ds.weapons[0].name, 'Bio-plasmic scream');
  assert.equal(ds.weapons[0].type, 'ranged');
  assert.equal(ds.weapons[0].rangeInches, 18);
  assert.equal(ds.weapons[0].attacks, 'D6+3');
  assert.equal(ds.weapons[0].skill, 4);
  assert.equal(ds.weapons[0].strength, 8);
  assert.equal(ds.weapons[0].ap, -2);
  assert.equal(ds.weapons[0].damage, '1');
  assert.ok(ds.weapons[0].keywords.includes('ASSAULT') && ds.weapons[0].keywords.includes('BLAST'));

  assert.equal(ds.weapons[1].type, 'melee');
  assert.equal(ds.weapons[1].strength, 10);
  assert.ok(ds.weapons[1].keywords.includes('LETHAL HITS'));

  // Inline labeled weapon & shorthand 5++ invuln
  const inlineDs = parseDatasheetFromTts(
    'M: 6" T: 4 Sv: 3+ W: 2 Ld: 6+ OC: 2\n5++\nBolt rifle - Range: 24" A: 2 BS: 3+ S: 4 AP: -1 D: 1 [HEAVY]\nFaction Keywords: Adeptus Astartes'
  );
  assert.equal(inlineDs.invuln, 5);
  assert.equal(inlineDs.weapons.length, 1);
  assert.equal(inlineDs.weapons[0].name, 'Bolt rifle');
  assert.equal(inlineDs.weapons[0].attacks, 2);
  assert.ok(inlineDs.weapons[0].keywords.includes('HEAVY'));
});

