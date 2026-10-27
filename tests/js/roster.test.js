const test = require('node:test');
const assert = require('node:assert/strict');
const {
  compileNemesisDossier,
  normalizeUnitType,
  deduplicateSimilarUnits,
  extractUniqueUnitTypes,
  formatTtsUnitList
} = require('../../js/roster.js');

test('Roster: compileNemesisDossier compiles Alpha and Beta dossiers with correct banners', () => {
  const alphaDossier = compileNemesisDossier({
    channel: 'alpha',
    sector: 'Equatorial Jungle // Sector 0',
    unit: '10 Khorne Berzerkers',
    feat: 'Slain Captain in melee',
    notes: 'Demonstrated relentless aggression'
  });
  assert.ok(alphaDossier.includes('ORDO MALLEUS // NEMESIS THREAT INDUCTION DOSSIER'));
  assert.ok(alphaDossier.includes('THE EXILE // SANCTUARY OF ASH'));
  assert.ok(alphaDossier.includes('10 Khorne Berzerkers'));

  const betaDossier = compileNemesisDossier({
    channel: 'beta',
    sector: 'Golgotha Basin',
    unit: 'Necron Overlord',
    feat: 'Annihilated Immortals phalanx',
    notes: 'Hyperphase resonance detected'
  });
  assert.ok(betaDossier.includes('TOMB-SHIP MASTER MATRIX // DYNASTIC NEMESIS INDUCTION ENGRAM'));
  assert.ok(betaDossier.includes('LORD COMMANDER JUNEBUG // TOMB-SHIP PHAERON INTERLINK'));
});

test('Roster: normalizeUnitType and deduplicateSimilarUnits strip quantities and merge shorthand units', () => {
  assert.equal(normalizeUnitType('5 Bladeguard Veterans'), 'Bladeguard Veterans');
  assert.equal(normalizeUnitType('1D3 Chaos Spawns'), 'Chaos Spawns');
  assert.equal(normalizeUnitType('2x Armiger Warglaives'), 'Armiger Warglaives');

  const deduplicated = deduplicateSimilarUnits([
    'Bladeguard',
    'Bladeguard Veterans',
    'Terminators',
    'Terminator Squad'
  ]);
  assert.deepEqual(deduplicated, ['Bladeguard Veterans', 'Terminator Squad']);
});

test('Roster: extractUniqueUnitTypes and formatTtsUnitList parse brackets and compile checklist', () => {
  const pool = {
    b34: '5 Intercessors, 5 Assault Intercessors',
    b56: '5 Bladeguard Veterans + 1 Captain',
    b79: '1 Redemptor Dreadnought',
    b10: '1 Land Raider Redeemer',
    b13: '1 Roboute Guilliman'
  };

  const types = extractUniqueUnitTypes(pool);
  assert.ok(types.includes('Intercessors'));
  assert.ok(types.includes('Bladeguard Veterans'));
  assert.ok(types.includes('Redemptor Dreadnought'));

  const checklist = formatTtsUnitList('Space Marines', types);
  assert.ok(checklist.includes('+++ TABLETOP SIMULATOR (TTS) PREPARATION // SPACE MARINES +++'));
  assert.ok(checklist.includes('[ ] Intercessors'));
});
