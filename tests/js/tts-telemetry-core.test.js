/**
 * @fileoverview Unit tests for js/tts-telemetry-core.js pure TTS BBCode stripper,
 * Yellowscribe/ForceOrg datasheet parser, and 2D edge-to-edge tabletop geometry.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  MAX_COHERENCY_LINK_INCHES,
  MAX_UNIT_SPAN_INCHES,
  stripTtsMarkup,
  parseModelNameAndWounds,
  parseDatasheetFromTts,
  hasDatasheetSignature,
  inferSide,
  inferBaseRadiusInches,
  measureEdgeToEdgeInches,
  clusterModelsByCoherency,
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

test('measureEdgeToEdgeInches: subtracts 2D base radii from horizontal XZ distance', () => {
  assert.equal(inferBaseRadiusInches(), 0.63);
  // 32mm base (~1.26" diameter -> 0.63" radius) vs 40mm objective (~1.57" diameter -> 0.787" radius)
  const r32 = inferBaseRadiusInches({ baseDiameterMm: 32 });
  const r40 = inferBaseRadiusInches({ baseDiameterMm: 40 });
  const dist = measureEdgeToEdgeInches({ x: 0, y: 1, z: 0 }, r32, { x: 5, y: 4, z: 0 }, r40);
  // Vertical Y difference (1 vs 4) ignored in 2D horizontal distance; 5.0 - 0.63 - 0.787 = ~3.58"
  assert.ok(Math.abs(dist - (5 - r32 - r40)) < 0.02);

  // Overlapping bases clamp at 0"
  assert.equal(measureEdgeToEdgeInches({ x: 0, z: 0 }, 1.0, { x: 0.5, z: 0 }, 1.0), 0);
});

test('normalizeTtsBoardScan: groups squad models, detects Spawn Zones, and computes closest enemy & objective inches', () => {
  const rawScan = {
    spawnZones: [{ id: 1, minX: -12, maxX: 12, minZ: 14, maxZ: 22 }],
    objects: [
      { guid: 'obj1', name: 'Objective 1', pos: { x: 0, y: 1, z: 0 }, bounds: { x: 1.57, y: 0.1, z: 1.57 } },
      {
        guid: 'h1',
        name: '1/1 Necron Warriors',
        tags: ['HORDE'],
        pos: { x: 0, y: 1, z: 16 },
        bounds: { x: 1.26, y: 1.5, z: 1.26 },
        description: 'M: 5" T: 4 Sv: 4+ W: 1 Ld: 7+ OC: 2\nKeywords: Infantry, Battleline'
      },
      {
        guid: 'h2',
        name: '1/1 Necron Warriors',
        tags: ['HORDE'],
        pos: { x: 1.3, y: 1, z: 16 },
        bounds: { x: 1.26, y: 1.5, z: 1.26 },
        description: 'M: 5" T: 4 Sv: 4+ W: 1 Ld: 7+ OC: 2\nKeywords: Infantry, Battleline'
      },
      {
        guid: 'p1',
        name: '14/14 Leman Russ Vanquisher',
        tags: ['PLAYER'],
        pos: { x: 0, y: 1, z: -4 },
        bounds: { x: 3.0, y: 2.2, z: 4.5 },
        description: 'M: 10" T: 11 Sv: 2+ W: 14 Ld: 7+ OC: 3\nKeywords: Vehicle, Imperium'
      }
    ]
  };

  const res = normalizeTtsBoardScan(rawScan);
  assert.equal(res.objectives.length, 1);
  assert.equal(res.units.length, 2, 'Two Necron Warrior models must group into 1 squad');

  const warriors = res.units.find(u => u.name === 'Necron Warriors');
  assert.ok(warriors);
  assert.equal(warriors.side, 'HORDE');
  assert.equal(warriors.modelCount, 2);
  assert.equal(warriors.inSpawnZone, true);
  assert.equal(warriors.save, 4);
  assert.ok(warriors.closestEnemy && warriors.closestEnemy.name === 'Leman Russ Vanquisher');
  assert.ok(warriors.closestEnemy.distanceInches > 17 && warriors.closestEnemy.distanceInches < 19);
  assert.ok(warriors.closestObjective && warriors.closestObjective.name === 'Objective 1');
});

test('hasDatasheetSignature & inferSide: reject non-datasheet props and auto-classify non-Horde factions as PLAYER', () => {
  assert.equal(typeof hasDatasheetSignature, 'function');
  assert.equal(typeof inferSide, 'function');

  assert.equal(hasDatasheetSignature('', '', 'Blue dice camera'), false);
  assert.equal(hasDatasheetSignature('', '', 'Tower'), false);
  assert.equal(hasDatasheetSignature('', '', '8/10 Screamer-Killer'), true);
  assert.equal(hasDatasheetSignature('M: 5" T: 5 Sv: 4+ W: 1 Ld: 7+ OC: 2', '', 'Hearthkyn'), true);
  assert.equal(hasDatasheetSignature('M T Sv W Ld OC\n5" 5 4+ 1 7+ 2', '', 'Hearthkyn'), true);
  assert.equal(hasDatasheetSignature('', 'Keywords: Infantry, Leagues of Votann', 'Hearthkyn'), true);
  assert.equal(hasDatasheetSignature('Autoch-pattern bolter | 24" | 2 | 4+ | 4 | 0 | 1', '', 'Hearthkyn'), true);

  assert.equal(
    inferSide({ tags: [] }, ['INFANTRY', 'LEAGUES OF VOTANN'], { hordeFactionName: 'Imperial Knights' }),
    'PLAYER'
  );
  assert.equal(
    inferSide({ tags: [] }, ['VEHICLE', 'WALKER', 'IMPERIUM', 'ARMIGER'], { hordeFactionName: 'Imperial Knights' }),
    'HORDE'
  );
  assert.equal(
    inferSide({ tags: ['HORDE'] }, ['INFANTRY', 'LEAGUES OF VOTANN'], { hordeFactionName: 'Imperial Knights' }),
    'HORDE'
  );
  assert.equal(
    inferSide({ tags: ['PLAYER'] }, ['VEHICLE', 'ARMIGER'], { hordeFactionName: 'Imperial Knights' }),
    'PLAYER'
  );
  assert.equal(inferSide({ tags: [] }, [], {}), 'HORDE');
});

test('normalizeTtsBoardScan: rejects LCT cameras, locked Tower, Objective Secured chips, and off-board reserves while auto-detecting deployed PLAYER army', () => {
  const rawScan = {
    playmatBounds: { minX: -22.5, maxX: 22.5, minZ: -30.5, maxZ: 30.5 },
    objects: [
      {
        guid: 'cam-blue',
        name: 'Blue dice camera',
        locked: true,
        pos: { x: 10, y: 2, z: 12 },
        bounds: { x: 1.5, y: 1.5, z: 1.5 },
        description: ''
      },
      {
        guid: 'cam-red',
        name: 'Red dice cam',
        locked: false,
        pos: { x: -10, y: 2, z: -12 },
        bounds: { x: 1.5, y: 1.5, z: 1.5 },
        description: ''
      },
      {
        guid: 'ter-tower',
        name: 'Tower',
        locked: true,
        pos: { x: 4, y: 3, z: -2 },
        bounds: { x: 5.0, y: 6.0, z: 5.0 },
        description: 'M: 0" T: 12'
      },
      {
        guid: 'sec-chip',
        name: 'Objective Secured Red',
        tags: ['OBJECTIVE'],
        locked: false,
        pos: { x: 0, y: 1, z: 2 },
        bounds: { x: 1.5, y: 0.2, z: 1.5 },
        description: ''
      },
      {
        guid: 'untagged-prop',
        name: 'Decorative Munitorum Barrel',
        locked: false,
        pos: { x: 2, y: 1, z: 2 },
        bounds: { x: 1.0, y: 1.2, z: 1.0 },
        description: 'Just a prop'
      },
      {
        guid: 'tmpl-1',
        name: '12/12 Armiger Helverin',
        tags: ['HORDE_TEMPLATE'],
        locked: false,
        pos: { x: 0, y: 1, z: 10 },
        bounds: { x: 3.9, y: 4.5, z: 3.9 },
        description: 'M: 12" T: 10 Sv: 3+ W: 12 Ld: 7+ OC: 8\nKeywords: Vehicle, Walker, Armiger'
      },
      {
        guid: 'offboard-gork',
        name: '18/18 Gorkanaut',
        tags: ['HORDE'],
        locked: false,
        pos: { x: -45, y: 1, z: 60 },
        bounds: { x: 5.0, y: 6.0, z: 5.0 },
        description: 'M: 8" T: 12 Sv: 3+ W: 18 Ld: 7+ OC: 8\nKeywords: Vehicle, Titanic, Orks'
      },
      {
        guid: 'real-obj',
        name: 'Objective 2',
        locked: true,
        pos: { x: 0, y: 1, z: 0 },
        bounds: { x: 1.57, y: 0.1, z: 1.57 }
      },
      {
        guid: 'vot-1',
        name: 'Hearthkyn Warriors',
        locked: false,
        pos: { x: 0, y: 1, z: -10 },
        bounds: { x: 1.1, y: 1.4, z: 1.1 },
        description: 'M: 5" T: 5 Sv: 4+ W: 1 Ld: 7+ OC: 2\nKeywords: Infantry, Battleline, Leagues of Votann'
      },
      {
        guid: 'kni-1',
        name: '12/12 Armiger Warglaive',
        locked: false,
        pos: { x: 0, y: 1, z: 14 },
        bounds: { x: 3.9, y: 4.5, z: 3.9 },
        description: 'M: 12" T: 10 Sv: 3+ W: 12 Ld: 7+ OC: 8\nKeywords: Vehicle, Walker, Imperium, Armiger'
      }
    ]
  };

  const res = normalizeTtsBoardScan(rawScan, { hordeFactionName: 'Imperial Knights' });
  assert.equal(res.objectives.length, 1, 'Only Objective 2 must remain; Objective Secured Red must be rejected');
  assert.equal(res.objectives[0].name, 'Objective 2');

  const unitNames = res.units.map(u => u.name);
  assert.equal(unitNames.includes('Blue dice camera'), false);
  assert.equal(unitNames.includes('Red dice cam'), false);
  assert.equal(unitNames.includes('Tower'), false);
  assert.equal(unitNames.includes('Objective Secured Red'), false);
  assert.equal(unitNames.includes('Decorative Munitorum Barrel'), false);
  assert.equal(unitNames.includes('Armiger Helverin'), false);
  assert.equal(unitNames.includes('Gorkanaut'), false, 'Off-board Gorkanaut at (-45, 60) must be rejected');

  assert.equal(res.units.length, 2);
  const votann = res.units.find(u => u.name === 'Hearthkyn Warriors');
  const warglaive = res.units.find(u => u.name === 'Armiger Warglaive');
  assert.ok(votann, 'Untagged Hearthkyn Warriors with Yellowscribe keywords must be kept');
  assert.equal(votann.side, 'PLAYER', 'Hearthkyn Warriors must auto-resolve to PLAYER against Imperial Knights');
  assert.ok(warglaive, 'Untagged Armiger Warglaive on playmat must be kept');
  assert.equal(warglaive.side, 'HORDE', 'Armiger Warglaive must match Imperial Knights alias and resolve to HORDE');
});

test('normalizeTtsBoardScan: splits duplicate-datasheet models >6" edge-to-edge apart into #1/#2 squads while keeping coherent lines unified', () => {
  const rawScan = {
    objects: [
      // Two separate PLAYER Theyn leaders on opposite flanks (20" apart)
      {
        guid: 'theyn-west',
        name: 'Theyn',
        tags: ['PLAYER'],
        pos: { x: -12, y: 1, z: -14 },
        bounds: { x: 1.1, y: 1.4, z: 1.1 },
        description: 'M: 5" T: 5 Sv: 4+ W: 2 Ld: 7+ OC: 2\nKeywords: Infantry, Leagues of Votann'
      },
      {
        guid: 'theyn-east',
        name: 'Theyn',
        tags: ['PLAYER'],
        pos: { x: 12, y: 1, z: -14 },
        bounds: { x: 1.1, y: 1.4, z: 1.1 },
        description: 'M: 5" T: 5 Sv: 4+ W: 2 Ld: 7+ OC: 2\nKeywords: Infantry, Leagues of Votann'
      },
      // Two separate HORDE Armiger Helverin waves > 6" edge-to-edge apart
      {
        guid: 'helv-1',
        name: '12/12 Armiger Helverin',
        tags: ['HORDE'],
        pos: { x: -10, y: 1, z: 16 },
        bounds: { x: 3.9, y: 4.5, z: 3.9 },
        description: 'M: 12" T: 10 Sv: 3+ W: 12 Ld: 7+ OC: 8\nKeywords: Vehicle, Walker, Armiger'
      },
      {
        guid: 'helv-2',
        name: '12/12 Armiger Helverin',
        tags: ['HORDE'],
        pos: { x: 10, y: 1, z: 16 },
        bounds: { x: 3.9, y: 4.5, z: 3.9 },
        description: 'M: 12" T: 10 Sv: 3+ W: 12 Ld: 7+ OC: 8\nKeywords: Vehicle, Walker, Armiger'
      },
      // Out-of-order 4-model Necron Warrior chain spanning 9" end-to-end, but each neighbor <= 3" apart
      { guid: 'nw-a', name: '1/1 Necron Warriors', tags: ['HORDE'], pos: { x: 0, y: 1, z: 4 }, bounds: { x: 1.26, y: 1.5, z: 1.26 }, description: 'M: 5" T: 4 Sv: 4+ W: 1 Ld: 7+ OC: 2\nKeywords: Infantry' },
      { guid: 'nw-d', name: '1/1 Necron Warriors', tags: ['HORDE'], pos: { x: 9, y: 1, z: 4 }, bounds: { x: 1.26, y: 1.5, z: 1.26 }, description: 'M: 5" T: 4 Sv: 4+ W: 1 Ld: 7+ OC: 2\nKeywords: Infantry' },
      { guid: 'nw-b', name: '1/1 Necron Warriors', tags: ['HORDE'], pos: { x: 3, y: 1, z: 4 }, bounds: { x: 1.26, y: 1.5, z: 1.26 }, description: 'M: 5" T: 4 Sv: 4+ W: 1 Ld: 7+ OC: 2\nKeywords: Infantry' },
      { guid: 'nw-c', name: '1/1 Necron Warriors', tags: ['HORDE'], pos: { x: 6, y: 1, z: 4 }, bounds: { x: 1.26, y: 1.5, z: 1.26 }, description: 'M: 5" T: 4 Sv: 4+ W: 1 Ld: 7+ OC: 2\nKeywords: Infantry' }
    ]
  };

  const res = normalizeTtsBoardScan(rawScan);
  const theyn1 = res.units.find(u => u.name === 'Theyn #1');
  const theyn2 = res.units.find(u => u.name === 'Theyn #2');
  assert.ok(theyn1 && theyn2, 'Distant duplicate Theyn models must split into Theyn #1 and Theyn #2');
  assert.equal(theyn1.modelCount, 1);
  assert.equal(theyn2.modelCount, 1);
  assert.equal(theyn1.pos.x, -12, 'Theyn #1 must keep its true West flank centroid, not float at 0');
  assert.equal(theyn2.pos.x, 12, 'Theyn #2 must keep its true East flank centroid, not float at 0');
  assert.notEqual(theyn1.squadKey, theyn2.squadKey);

  const helv1 = res.units.find(u => u.name === 'Armiger Helverin #1');
  const helv2 = res.units.find(u => u.name === 'Armiger Helverin #2');
  assert.ok(helv1 && helv2, 'Separate Armiger Helverin waves >6" apart must split into #1 and #2');
  assert.equal(helv1.pos.x, -10);
  assert.equal(helv2.pos.x, 10);

  const warriors = res.units.find(u => u.name === 'Necron Warriors');
  assert.ok(warriors, 'Coherent 4-model line (1.74" neighbor links, 7.74" total span <= 9") must remain 1 un-numbered squad');
  assert.equal(warriors.modelCount, 4);
});

test('clusterModelsByCoherency: enforces 11th Ed dual coherency (<=2" neighbor link AND <=9" max furthest-model span)', () => {
  assert.equal(typeof MAX_COHERENCY_LINK_INCHES, 'number');
  assert.equal(typeof MAX_UNIT_SPAN_INCHES, 'number');
  assert.ok(MAX_COHERENCY_LINK_INCHES >= 2.0 && MAX_COHERENCY_LINK_INCHES <= 2.6, 'Adjacent link bound must reflect 2" coherency + small placement slack');
  assert.ok(MAX_UNIT_SPAN_INCHES >= 9.0 && MAX_UNIT_SPAN_INCHES <= 9.6, 'Max unit span bound must reflect 9" furthest-model cap + small placement slack');

  const r32 = 0.63; // 32mm base (~1.26" diameter)
  // 1. Legal 5-model unit: 1.24" edge-to-edge neighbor spacing, 8.74" edge-to-edge furthest span (<= 9")
  const legalUnit = [0, 2.5, 5.0, 7.5, 10.0].map((x, idx) => ({
    guid: `lg-${idx}`,
    pos: { x, z: 0 },
    radiusInches: r32
  }));
  const legalClusters = clusterModelsByCoherency(legalUnit);
  assert.equal(legalClusters.length, 1, 'Unit obeying both <=2" link and <=9" span must stay 1 cluster');
  assert.equal(legalClusters[0].length, 5);

  // 2. Two untinted squads standing 3.2" edge-to-edge apart (> 2" coherency link, even though < 6"!)
  const closePair = [
    { guid: 'sqA-1', pos: { x: 0, z: 0 }, radiusInches: r32 },
    { guid: 'sqA-2', pos: { x: 2.0, z: 0 }, radiusInches: r32 },
    { guid: 'sqB-1', pos: { x: 6.5, z: 0 }, radiusInches: r32 }, // 6.5 - 2.0 - 1.26 = 3.24" edge-to-edge
    { guid: 'sqB-2', pos: { x: 8.5, z: 0 }, radiusInches: r32 }
  ];
  const closePairClusters = clusterModelsByCoherency(closePair);
  assert.equal(closePairClusters.length, 2, 'Models >2.5" edge-to-edge apart break 2" coherency and must split into 2 squads');

  // 3. Over-wide trench line exceeding 9" max furthest-model span despite <2" neighbor links
  const trenchLine = [0, 2.5, 5.0, 7.5, 10.0, 12.2, 14.7, 17.2].map((x, idx) => ({
    guid: `tr-${idx}`,
    pos: { x, z: 0 },
    radiusInches: r32
  }));
  const trenchClusters = clusterModelsByCoherency(trenchLine);
  assert.equal(trenchClusters.length, 2, 'Line exceeding 9" furthest-model span must split even when every adjacent pair is <2" apart');
});

test('normalizeTtsBoardScan: keeps separate squads distinct even at 0.2" base-to-base via GUID lock (previousUnits), SQUAD tags, and base ColorTint', () => {
  const dsText = 'M: 5" T: 5 Sv: 4+ W: 1 Ld: 7+ OC: 2\nKeywords: Infantry, Battleline, Leagues of Votann';
  // Turn 1 Deployment: Squad A on West flank, Squad B on East flank
  const turn1Scan = normalizeTtsBoardScan({
    objects: [
      { guid: 'hk-a1', name: 'Hearthkyn Warriors', tags: ['PLAYER'], pos: { x: -12, y: 1, z: -12 }, bounds: { x: 1.1, y: 1.4, z: 1.1 }, description: dsText },
      { guid: 'hk-a2', name: 'Hearthkyn Warriors', tags: ['PLAYER'], pos: { x: -10.5, y: 1, z: -12 }, bounds: { x: 1.1, y: 1.4, z: 1.1 }, description: dsText },
      { guid: 'hk-a3', name: 'Hearthkyn Warriors', tags: ['PLAYER'], pos: { x: -9.0, y: 1, z: -12 }, bounds: { x: 1.1, y: 1.4, z: 1.1 }, description: dsText },
      { guid: 'hk-b1', name: 'Hearthkyn Warriors', tags: ['PLAYER'], pos: { x: 10.0, y: 1, z: -12 }, bounds: { x: 1.1, y: 1.4, z: 1.1 }, description: dsText },
      { guid: 'hk-b2', name: 'Hearthkyn Warriors', tags: ['PLAYER'], pos: { x: 11.5, y: 1, z: -12 }, bounds: { x: 1.1, y: 1.4, z: 1.1 }, description: dsText },
      { guid: 'hk-b3', name: 'Hearthkyn Warriors', tags: ['PLAYER'], pos: { x: 13.0, y: 1, z: -12 }, bounds: { x: 1.1, y: 1.4, z: 1.1 }, description: dsText }
    ]
  });
  assert.equal(turn1Scan.units.length, 2);

  // Turn 2 Convergence: BOTH squads stand side-by-side on Center Objective (0, 0) only 0.1" apart (well inside 2" AND 9"!)
  const turn2Scan = normalizeTtsBoardScan({
    objects: [
      { guid: 'hk-a1', name: 'Hearthkyn Warriors', tags: ['PLAYER'], pos: { x: -1.0, y: 1, z: -0.6 }, bounds: { x: 1.1, y: 1.4, z: 1.1 }, description: dsText },
      { guid: 'hk-a2', name: 'Hearthkyn Warriors', tags: ['PLAYER'], pos: { x: 0.2, y: 1, z: -0.6 }, bounds: { x: 1.1, y: 1.4, z: 1.1 }, description: dsText },
      { guid: 'hk-a3', name: 'Hearthkyn Warriors', tags: ['PLAYER'], pos: { x: 1.4, y: 1, z: -0.6 }, bounds: { x: 1.1, y: 1.4, z: 1.1 }, description: dsText },
      { guid: 'hk-b1', name: 'Hearthkyn Warriors', tags: ['PLAYER'], pos: { x: -1.0, y: 1, z: 0.6 }, bounds: { x: 1.1, y: 1.4, z: 1.1 }, description: dsText },
      { guid: 'hk-b2', name: 'Hearthkyn Warriors', tags: ['PLAYER'], pos: { x: 0.2, y: 1, z: 0.6 }, bounds: { x: 1.1, y: 1.4, z: 1.1 }, description: dsText },
      { guid: 'hk-b3', name: 'Hearthkyn Warriors', tags: ['PLAYER'], pos: { x: 1.4, y: 1, z: 0.6 }, bounds: { x: 1.1, y: 1.4, z: 1.1 }, description: dsText }
    ]
  }, { previousUnits: turn1Scan.units });

  assert.equal(turn2Scan.units.length, 2, 'GUID-locked squads must stay 2 separate units even when huddled 0.1" apart on the same objective');
  const sq1 = turn2Scan.units.find(u => u.name === 'Hearthkyn Warriors #1');
  const sq2 = turn2Scan.units.find(u => u.name === 'Hearthkyn Warriors #2');
  assert.ok(sq1 && sq2);
  assert.deepEqual(sq1.guids.sort(), ['hk-a1', 'hk-a2', 'hk-a3']);
  assert.deepEqual(sq2.guids.sort(), ['hk-b1', 'hk-b2', 'hk-b3']);

  // Turn 3 Casualty: Squad #1 is wiped out; Squad #2 keeps its stable #2 designation
  const turn3Scan = normalizeTtsBoardScan({
    objects: [
      { guid: 'hk-b1', name: 'Hearthkyn Warriors', tags: ['PLAYER'], pos: { x: -1.0, y: 1, z: 0.6 }, bounds: { x: 1.1, y: 1.4, z: 1.1 }, description: dsText },
      { guid: 'hk-b2', name: 'Hearthkyn Warriors', tags: ['PLAYER'], pos: { x: 0.2, y: 1, z: 0.6 }, bounds: { x: 1.1, y: 1.4, z: 1.1 }, description: dsText }
    ]
  }, { previousUnits: turn2Scan.units });
  assert.equal(turn3Scan.units.length, 1);
  assert.equal(turn3Scan.units[0].name, 'Hearthkyn Warriors #2', 'Surviving Squad #2 must keep its #2 label rather than renaming mid-match');

  // First-scan 0" separation via SQUAD:WAVE_* tags and distinct base rim colorTint
  const firstScanClose = normalizeTtsBoardScan({
    objects: [
      { guid: 'w-helv-1', name: '12/12 Armiger Helverin', tags: ['HORDE', 'SQUAD:WAVE_1_1'], pos: { x: 0, y: 1, z: 16 }, bounds: { x: 3.9, y: 4.5, z: 3.9 }, description: 'M: 12" T: 10 Sv: 3+ W: 12' },
      { guid: 'w-helv-2', name: '12/12 Armiger Helverin', tags: ['HORDE', 'SQUAD:WAVE_2_1'], pos: { x: 4.1, y: 1, z: 16 }, bounds: { x: 3.9, y: 4.5, z: 3.9 }, description: 'M: 12" T: 10 Sv: 3+ W: 12' },
      { guid: 'tint-a1', name: 'Cadian Shock Troops', tags: ['PLAYER'], colorTint: '#2266ff', pos: { x: 0, y: 1, z: -8 }, bounds: { x: 1.1, y: 1.4, z: 1.1 }, description: 'M: 6" T: 3 Sv: 5+ W: 1' },
      { guid: 'tint-b1', name: 'Cadian Shock Troops', tags: ['PLAYER'], colorTint: '#ffcc22', pos: { x: 1.2, y: 1, z: -8 }, bounds: { x: 1.1, y: 1.4, z: 1.1 }, description: 'M: 6" T: 3 Sv: 5+ W: 1' }
    ]
  });
  assert.ok(
    firstScanClose.units.find(u => u.name === 'Armiger Helverin #1') &&
    firstScanClose.units.find(u => u.name === 'Armiger Helverin #2'),
    'Wave-tagged Helverins 0.2" apart on first scan must stay separate #1/#2 squads'
  );
  assert.ok(
    firstScanClose.units.find(u => u.name === 'Cadian Shock Troops #1') &&
    firstScanClose.units.find(u => u.name === 'Cadian Shock Troops #2'),
    'Differently tinted Cadian squads 0.1" apart on first scan must split automatically'
  );
});

test('normalizeTtsBoardScan: supports Player & Horde model resurrection (casualty-tray return + Ctrl+C/V Medipack/Reanimation), wound healing, and cloned wave-tag splitting', () => {
  const dsVotann = 'M: 5" T: 5 Sv: 4+ W: 1 Ld: 7+ OC: 2\nKeywords: Infantry, Battleline, Leagues of Votann';
  const dsNecron = 'M: 5" T: 4 Sv: 4+ W: 1 Ld: 7+ OC: 2\nKeywords: Infantry, Battleline';

  // Turn 1: Two 3-model Hearthkyn squads (#1 West, #2 East) + Two 3-model HORDE Necron Warrior waves
  const t1 = normalizeTtsBoardScan({
    objects: [
      { guid: 'hk1-1', name: 'Hearthkyn Warriors', tags: ['PLAYER'], pos: { x: -12, y: 1, z: -10 }, bounds: { x: 1.1, y: 1.4, z: 1.1 }, description: dsVotann },
      { guid: 'hk1-2', name: 'Hearthkyn Warriors', tags: ['PLAYER'], pos: { x: -10.5, y: 1, z: -10 }, bounds: { x: 1.1, y: 1.4, z: 1.1 }, description: dsVotann },
      { guid: 'hk1-3', name: 'Hearthkyn Warriors', tags: ['PLAYER'], pos: { x: -9.0, y: 1, z: -10 }, bounds: { x: 1.1, y: 1.4, z: 1.1 }, description: dsVotann },
      { guid: 'hk2-1', name: 'Hearthkyn Warriors', tags: ['PLAYER'], pos: { x: 10, y: 1, z: -10 }, bounds: { x: 1.1, y: 1.4, z: 1.1 }, description: dsVotann },
      { guid: 'hk2-2', name: 'Hearthkyn Warriors', tags: ['PLAYER'], pos: { x: 11.5, y: 1, z: -10 }, bounds: { x: 1.1, y: 1.4, z: 1.1 }, description: dsVotann },
      { guid: 'hk2-3', name: 'Hearthkyn Warriors', tags: ['PLAYER'], pos: { x: 13.0, y: 1, z: -10 }, bounds: { x: 1.1, y: 1.4, z: 1.1 }, description: dsVotann },
      { guid: 'nw1-1', name: '1/1 Necron Warriors', tags: ['HORDE', 'SQUAD:WAVE_1_1'], pos: { x: -8, y: 1, z: 14 }, bounds: { x: 1.26, y: 1.5, z: 1.26 }, description: dsNecron },
      { guid: 'nw1-2', name: '1/1 Necron Warriors', tags: ['HORDE', 'SQUAD:WAVE_1_1'], pos: { x: -6.5, y: 1, z: 14 }, bounds: { x: 1.26, y: 1.5, z: 1.26 }, description: dsNecron },
      { guid: 'nw1-3', name: '1/1 Necron Warriors', tags: ['HORDE', 'SQUAD:WAVE_1_1'], pos: { x: -5.0, y: 1, z: 14 }, bounds: { x: 1.26, y: 1.5, z: 1.26 }, description: dsNecron },
      { guid: 'helv-w1', name: '5/12 Armiger Helverin', tags: ['HORDE'], pos: { x: 8, y: 1, z: 16 }, bounds: { x: 3.9, y: 4.5, z: 3.9 }, description: 'M: 12" T: 10 Sv: 3+ W: 12' }
    ]
  });
  assert.ok(t1.guidRegistry && typeof t1.guidRegistry === 'object', 'Scan must emit cumulative guidRegistry for dead-model resurrection');
  assert.equal(t1.units.find(u => u.name === 'Hearthkyn Warriors #1').peakModelCount, 3);

  // Turn 2: hk1-3 and nw1-3 are destroyed (removed from playmat); both Hearthkyn squads converge to 0.1" apart at (0, 0)
  const t2 = normalizeTtsBoardScan({
    objects: [
      { guid: 'hk1-1', name: 'Hearthkyn Warriors', tags: ['PLAYER'], pos: { x: -1.0, y: 1, z: -0.6 }, bounds: { x: 1.1, y: 1.4, z: 1.1 }, description: dsVotann },
      { guid: 'hk1-2', name: 'Hearthkyn Warriors', tags: ['PLAYER'], pos: { x: 0.3, y: 1, z: -0.6 }, bounds: { x: 1.1, y: 1.4, z: 1.1 }, description: dsVotann },
      { guid: 'hk2-1', name: 'Hearthkyn Warriors', tags: ['PLAYER'], pos: { x: -1.0, y: 1, z: 0.6 }, bounds: { x: 1.1, y: 1.4, z: 1.1 }, description: dsVotann },
      { guid: 'hk2-2', name: 'Hearthkyn Warriors', tags: ['PLAYER'], pos: { x: 0.3, y: 1, z: 0.6 }, bounds: { x: 1.1, y: 1.4, z: 1.1 }, description: dsVotann },
      { guid: 'hk2-3', name: 'Hearthkyn Warriors', tags: ['PLAYER'], pos: { x: 1.6, y: 1, z: 0.6 }, bounds: { x: 1.1, y: 1.4, z: 1.1 }, description: dsVotann },
      { guid: 'nw1-1', name: '1/1 Necron Warriors', tags: ['HORDE', 'SQUAD:WAVE_1_1'], pos: { x: -8, y: 1, z: 10 }, bounds: { x: 1.26, y: 1.5, z: 1.26 }, description: dsNecron },
      { guid: 'nw1-2', name: '1/1 Necron Warriors', tags: ['HORDE', 'SQUAD:WAVE_1_1'], pos: { x: -6.5, y: 1, z: 10 }, bounds: { x: 1.26, y: 1.5, z: 1.26 }, description: dsNecron },
      // Multi-wound healing on Armiger Helverin (5/12 -> 8/12)
      { guid: 'helv-w1', name: '8/12 Armiger Helverin', tags: ['HORDE'], pos: { x: 8, y: 1, z: 12 }, bounds: { x: 3.9, y: 4.5, z: 3.9 }, description: 'M: 12" T: 10 Sv: 3+ W: 12' }
    ]
  }, { previousUnits: t1.units, guidRegistry: t1.guidRegistry });

  assert.equal(t2.units.find(u => u.name === 'Hearthkyn Warriors #1').modelCount, 2);
  assert.equal(t2.units.find(u => u.name === 'Hearthkyn Warriors #1').peakModelCount, 3, 'Injured squad must remember its peakModelCount of 3');
  assert.equal(t2.units.find(u => u.name === 'Armiger Helverin').totalRemainingWounds, 8, 'Healed multi-wound model must update totalRemainingWounds');

  // Turn 3A: Medipack! Player drags original dead hk1-3 back from casualty tray into crowded (0, 0) melee,
  // AND Horde Reanimation Protocols! Player Ctrl+C/Ctrl+V pastes a brand-new GUID (nw1-revived) into Necron Warriors,
  // AND Player also Ctrl+C/Ctrl+V clones a brand-new 3-man Necron wave 16" away (inheriting SQUAD:WAVE_1_1 tag!)
  const t3 = normalizeTtsBoardScan({
    objects: [
      { guid: 'hk1-1', name: 'Hearthkyn Warriors', tags: ['PLAYER'], pos: { x: -1.0, y: 1, z: -0.6 }, bounds: { x: 1.1, y: 1.4, z: 1.1 }, description: dsVotann },
      { guid: 'hk1-2', name: 'Hearthkyn Warriors', tags: ['PLAYER'], pos: { x: 0.3, y: 1, z: -0.6 }, bounds: { x: 1.1, y: 1.4, z: 1.1 }, description: dsVotann },
      { guid: 'hk1-3', name: 'Hearthkyn Warriors', tags: ['PLAYER'], pos: { x: 1.6, y: 1, z: -0.6 }, bounds: { x: 1.1, y: 1.4, z: 1.1 }, description: dsVotann },
      { guid: 'hk2-1', name: 'Hearthkyn Warriors', tags: ['PLAYER'], pos: { x: -1.0, y: 1, z: 0.6 }, bounds: { x: 1.1, y: 1.4, z: 1.1 }, description: dsVotann },
      { guid: 'hk2-2', name: 'Hearthkyn Warriors', tags: ['PLAYER'], pos: { x: 0.3, y: 1, z: 0.6 }, bounds: { x: 1.1, y: 1.4, z: 1.1 }, description: dsVotann },
      { guid: 'hk2-3', name: 'Hearthkyn Warriors', tags: ['PLAYER'], pos: { x: 1.6, y: 1, z: 0.6 }, bounds: { x: 1.1, y: 1.4, z: 1.1 }, description: dsVotann },
      // Horde Reanimation via Ctrl+C/Ctrl+V (brand-new GUID nw1-revived within 2" link & 9" span of 2/3 injured Necrons)
      { guid: 'nw1-1', name: '1/1 Necron Warriors', tags: ['HORDE', 'SQUAD:WAVE_1_1'], pos: { x: -8, y: 1, z: 10 }, bounds: { x: 1.26, y: 1.5, z: 1.26 }, description: dsNecron },
      { guid: 'nw1-2', name: '1/1 Necron Warriors', tags: ['HORDE', 'SQUAD:WAVE_1_1'], pos: { x: -6.5, y: 1, z: 10 }, bounds: { x: 1.26, y: 1.5, z: 1.26 }, description: dsNecron },
      { guid: 'nw1-revived', name: '1/1 Necron Warriors', tags: ['HORDE', 'SQUAD:WAVE_1_1'], pos: { x: -5.0, y: 1, z: 10 }, bounds: { x: 1.26, y: 1.5, z: 1.26 }, description: dsNecron },
      // Second Necron wave spawned manually via Ctrl+C/Ctrl+V at x = +12 (inherited SQUAD:WAVE_1_1 tag, but 18" away!)
      { guid: 'nw2-1', name: '1/1 Necron Warriors', tags: ['HORDE', 'SQUAD:WAVE_1_1'], pos: { x: 11.0, y: 1, z: 18 }, bounds: { x: 1.26, y: 1.5, z: 1.26 }, description: dsNecron },
      { guid: 'nw2-2', name: '1/1 Necron Warriors', tags: ['HORDE', 'SQUAD:WAVE_1_1'], pos: { x: 12.5, y: 1, z: 18 }, bounds: { x: 1.26, y: 1.5, z: 1.26 }, description: dsNecron },
      { guid: 'nw2-3', name: '1/1 Necron Warriors', tags: ['HORDE', 'SQUAD:WAVE_1_1'], pos: { x: 14.0, y: 1, z: 18 }, bounds: { x: 1.26, y: 1.5, z: 1.26 }, description: dsNecron }
    ]
  }, { previousUnits: t2.units, guidRegistry: t2.guidRegistry });

  assert.equal(t3.units.filter(u => u.name.startsWith('Hearthkyn Warriors')).length, 2, 'Resurrected hk1-3 must rejoin #1, NOT spawn a 1-model #3 squad');
  assert.equal(t3.units.find(u => u.name === 'Hearthkyn Warriors #1').modelCount, 3, 'Hearthkyn #1 must return to 3 models after casualty-tray Medipack');
  assert.equal(t3.units.find(u => u.name === 'Hearthkyn Warriors #2').modelCount, 3);

  const necronSquads = t3.units.filter(u => u.name.startsWith('Necron Warriors'));
  assert.equal(necronSquads.length, 2, 'Cloned Wave 2 18" away must split into #2 while nw1-revived joins #1');
  assert.equal(t3.units.find(u => u.name === 'Necron Warriors #1').modelCount, 3, 'Ctrl+C/V Reanimated Warrior must rejoin injured #1 (3/3)');
  assert.equal(t3.units.find(u => u.name === 'Necron Warriors #2').modelCount, 3, 'Out-of-coherency Ctrl+C/V wave must form separate #2 (3/3)');

  // Turn 4: Untinted PLAYER Medipack via Ctrl+C/Ctrl+V (brand-new GUID hk1-cloned-medic) when #1 is at 2/3 and #2 is at 3/3 right next to it!
  const t3CasualtyDrop = normalizeTtsBoardScan({
    objects: [
      { guid: 'hk1-1', name: 'Hearthkyn Warriors', tags: ['PLAYER'], pos: { x: -1.0, y: 1, z: -0.6 }, bounds: { x: 1.1, y: 1.4, z: 1.1 }, description: dsVotann },
      { guid: 'hk1-2', name: 'Hearthkyn Warriors', tags: ['PLAYER'], pos: { x: 0.3, y: 1, z: -0.6 }, bounds: { x: 1.1, y: 1.4, z: 1.1 }, description: dsVotann },
      { guid: 'hk2-1', name: 'Hearthkyn Warriors', tags: ['PLAYER'], pos: { x: -1.0, y: 1, z: 0.6 }, bounds: { x: 1.1, y: 1.4, z: 1.1 }, description: dsVotann },
      { guid: 'hk2-2', name: 'Hearthkyn Warriors', tags: ['PLAYER'], pos: { x: 0.3, y: 1, z: 0.6 }, bounds: { x: 1.1, y: 1.4, z: 1.1 }, description: dsVotann },
      { guid: 'hk2-3', name: 'Hearthkyn Warriors', tags: ['PLAYER'], pos: { x: 1.6, y: 1, z: 0.6 }, bounds: { x: 1.1, y: 1.4, z: 1.1 }, description: dsVotann }
    ]
  }, { previousUnits: t3.units, guidRegistry: t3.guidRegistry });

  const t4CloneRevive = normalizeTtsBoardScan({
    objects: [
      { guid: 'hk1-1', name: 'Hearthkyn Warriors', tags: ['PLAYER'], pos: { x: -1.0, y: 1, z: -0.6 }, bounds: { x: 1.1, y: 1.4, z: 1.1 }, description: dsVotann },
      { guid: 'hk1-2', name: 'Hearthkyn Warriors', tags: ['PLAYER'], pos: { x: 0.3, y: 1, z: -0.6 }, bounds: { x: 1.1, y: 1.4, z: 1.1 }, description: dsVotann },
      { guid: 'hk1-cloned-medic', name: 'Hearthkyn Warriors', tags: ['PLAYER'], pos: { x: 1.5, y: 1, z: -0.6 }, bounds: { x: 1.1, y: 1.4, z: 1.1 }, description: dsVotann },
      { guid: 'hk2-1', name: 'Hearthkyn Warriors', tags: ['PLAYER'], pos: { x: -1.0, y: 1, z: 0.6 }, bounds: { x: 1.1, y: 1.4, z: 1.1 }, description: dsVotann },
      { guid: 'hk2-2', name: 'Hearthkyn Warriors', tags: ['PLAYER'], pos: { x: 0.3, y: 1, z: 0.6 }, bounds: { x: 1.1, y: 1.4, z: 1.1 }, description: dsVotann },
      { guid: 'hk2-3', name: 'Hearthkyn Warriors', tags: ['PLAYER'], pos: { x: 1.6, y: 1, z: 0.6 }, bounds: { x: 1.1, y: 1.4, z: 1.1 }, description: dsVotann }
    ]
  }, { previousUnits: t3CasualtyDrop.units, guidRegistry: t3CasualtyDrop.guidRegistry });

  assert.equal(t4CloneRevive.units.length, 2, 'Ctrl+C/V Medipack clone must absorb into injured #1 (2/3 -> 3/3) while full-strength #2 (3/3) stays 3');
  assert.equal(t4CloneRevive.units.find(u => u.name === 'Hearthkyn Warriors #1').modelCount, 3);
  assert.equal(t4CloneRevive.units.find(u => u.name === 'Hearthkyn Warriors #2').modelCount, 3);
});

test('normalizeTtsBoardScan: manages 5-man vs 10-man same-type squads, [5 + Leader] Transport EMBARKED cargo, and cross-datasheet Attached Units', () => {
  const dsKillTeam = 'M: 6" T: 4 Sv: 3+ W: 2 Ld: 6+ OC: 2\nDeathwatch Boltgun | 24" | 2 | 3+ | 4 | -1 | 1\nKeywords: Infantry, Battleline, Imperium';
  const dsWatchMaster = 'M: 7" T: 4 Sv: 2+ W: 4 Ld: 6+ OC: 1\nInvuln: 4+\nVigil Spear | 24" | 3 | 2+ | 6 | -2 | 2\nKeywords: Infantry, Character, Imperium';
  const dsCorvus = 'M: 20" T: 10 Sv: 3+ W: 14 Ld: 6+ OC: 0\nKeywords: Vehicle, Aircraft, Transport, Fly';

  const objects = [];
  // 1. 5-model Kill Team squad on West flank (x = -16..-11)
  for (let i = 0; i < 5; i++) {
    objects.push({
      guid: `kt5-${i}`,
      name: '2/2 Kill Team',
      tags: ['HORDE', 'SQUAD:WAVE_1_1'],
      pos: { x: -16 + i * 1.2, y: 1, z: 14 },
      bounds: { x: 1.26, y: 1.5, z: 1.26 },
      description: dsKillTeam
    });
  }
  // 2. 10-model Kill Team squad on East flank (2 ranks of 5 at x = 8..13, z = 14..15.3)
  for (let i = 0; i < 10; i++) {
    const col = i % 5;
    const row = Math.floor(i / 5);
    objects.push({
      guid: `kt10-${i}`,
      name: '2/2 Kill Team',
      tags: ['HORDE', 'SQUAD:WAVE_2_1'],
      pos: { x: 8 + col * 1.2, y: 1, z: 14 + row * 1.3 },
      bounds: { x: 1.26, y: 1.5, z: 1.26 },
      description: dsKillTeam
    });
  }
  // 3. Transport carrying [5 Kill Team + 1 Watch Master] via EMBARKED tag
  objects.push({
    guid: 'corvus-1',
    name: '14/14 Corvus Blackstar',
    tags: ['HORDE', 'EMBARKED:5 Kill Team + 1 Watch Master'],
    pos: { x: 0, y: 2, z: 16 },
    bounds: { x: 4.5, y: 3.5, z: 4.5 },
    description: dsCorvus
  });

  const scan1 = normalizeTtsBoardScan({ objects });
  assert.equal(scan1.units.length, 3, 'Embarked passengers must NOT create phantom units before disembarking');

  const kt5 = scan1.units.find(u => u.name === 'Kill Team #1');
  const kt10 = scan1.units.find(u => u.name === 'Kill Team #2');
  const corvus = scan1.units.find(u => u.name === 'Corvus Blackstar');
  assert.ok(kt5 && kt10 && corvus);
  assert.equal(kt5.modelCount, 5);
  assert.equal(kt5.peakModelCount, 5, '5-model Kill Team locks peakModelCount = 5');
  assert.equal(kt10.modelCount, 10);
  assert.equal(kt10.peakModelCount, 10, '10-model Kill Team locks peakModelCount = 10');
  assert.deepEqual(corvus.embarkedCargo, [
    { count: 5, templateName: 'Kill Team' },
    { count: 1, templateName: 'Watch Master' }
  ]);
  assert.equal(corvus.embarkedSummary, '5x Kill Team + 1x Watch Master');

  // Turn 2: Corvus Blackstar disembarks [5 Kill Team + 1 Watch Master] within 3" with shared SQUAD:DISEMBARK_corvus-1 tag
  const disembarkedObjects = objects.map(o =>
    o.guid === 'corvus-1' ? { ...o, tags: ['HORDE'] } : o
  );
  for (let i = 0; i < 5; i++) {
    disembarkedObjects.push({
      guid: `kt-att-${i}`,
      name: '2/2 Kill Team',
      tags: ['HORDE', 'SQUAD:DISEMBARK_corvus-1'],
      pos: { x: -2.4 + i * 1.2, y: 1, z: 11.5 },
      bounds: { x: 1.26, y: 1.5, z: 1.26 },
      description: dsKillTeam
    });
  }
  disembarkedObjects.push({
    guid: 'wm-att-1',
    name: '4/4 Watch Master',
    tags: ['HORDE', 'SQUAD:DISEMBARK_corvus-1'],
    pos: { x: 0, y: 1, z: 10.2 },
    bounds: { x: 1.57, y: 1.8, z: 1.57 },
    description: dsWatchMaster
  });

  const scan2 = normalizeTtsBoardScan({ objects: disembarkedObjects }, {
    previousUnits: scan1.units,
    guidRegistry: scan1.guidRegistry
  });

  assert.equal(scan2.units.length, 4, 'Board now holds Kill Team #1 (5), Kill Team #2 (10), Corvus Blackstar (empty), and Kill Team + Watch Master (6)');
  const emptyCorvus = scan2.units.find(u => u.name === 'Corvus Blackstar');
  assert.deepEqual(emptyCorvus.embarkedCargo, []);
  assert.equal(emptyCorvus.embarkedSummary, null);

  const attached = scan2.units.find(u => u.name === 'Kill Team + Watch Master');
  assert.ok(attached, 'Shared SQUAD tag across Kill Team + Watch Master must form 1 combined Attached Unit');
  assert.equal(attached.modelCount, 6);
  assert.equal(attached.peakModelCount, 6);
  assert.equal(attached.totalRemainingWounds, 14, '5x 2W Kill Team (10W) + 1x 4W Watch Master (4W) = 14W');
  assert.equal(attached.move, 6, 'Attached Unit must move at slowest Bodyguard speed (6", not 7") to preserve 2" coherency');
  assert.equal(attached.save, 3, 'Attached Unit uses majority Bodyguard Save (3+) while Bodyguards live');
  assert.ok(attached.keywords.includes('CHARACTER') && attached.keywords.includes('INFANTRY'), 'Attached Unit unions CHARACTER + INFANTRY keywords');
  assert.equal(attached.weapons.length, 2, 'Attached Unit merges Deathwatch Boltgun + Vigil Spear without 5x duplicates');

  // Turn 3: Attached Unit persists via guidRegistry even if tags are stripped or models move into crowded melee
  const scan3 = normalizeTtsBoardScan({
    objects: disembarkedObjects.map(o =>
      o.guid.startsWith('kt-att-') || o.guid === 'wm-att-1'
        ? { ...o, tags: ['HORDE'] }
        : o
    )
  }, { previousUnits: scan2.units, guidRegistry: scan2.guidRegistry });

  const attachedTurn3 = scan3.units.find(u => u.name === 'Kill Team + Watch Master');
  assert.ok(attachedTurn3, 'Attached Unit must remain locked via guidRegistry across turns');
  assert.equal(attachedTurn3.modelCount, 6);

  // Turn 4: Bodyguard Wipeout! All 5 Kill Team bodyguards are slain, leaving only wm-att-1 alive ->
  // Per 40k Attached Unit rules, the surviving Character reverts to standalone Watch Master (Sv 2+/4++, M 7")!
  const scan4BodyguardSlain = normalizeTtsBoardScan({
    objects: disembarkedObjects
      .filter(o => !o.guid.startsWith('kt-att-'))
      .map(o => (o.guid === 'wm-att-1' ? { ...o, tags: ['HORDE'] } : o))
  }, { previousUnits: scan3.units, guidRegistry: scan3.guidRegistry });

  const loneLeader = scan4BodyguardSlain.units.find(u => u.name === 'Watch Master');
  assert.ok(loneLeader, 'When all Bodyguard models die, lone Character must revert to standalone Watch Master');
  assert.equal(loneLeader.modelCount, 1);
  assert.equal(loneLeader.save, 2, 'Standalone Watch Master now uses its own 2+ Save');
  assert.equal(loneLeader.invuln, 4, 'Standalone Watch Master now exposes its 4++ Invulnerable Save');
  assert.equal(loneLeader.move, 7, 'Standalone Watch Master regains its full 7" Move');

  // Deep Strike datasheet detection & shelfTemplates normalization
  const dsTermie = parseDatasheetFromTts('M: 5" T: 5 Sv: 2+ W: 3 Ld: 6+ OC: 1\nAbilities: Deep Strike, Teleport Homer\nKeywords: Infantry, Terminator');
  assert.equal(dsTermie.hasDeepStrike, true);
  const shelfScan = normalizeTtsBoardScan({
    objects: [],
    shelfTemplates: [
      { name: '3/3 Terminator Squad', description: 'M: 5" T: 5 Sv: 2+ W: 3\nAbilities: Deep Strike', bounds: { x: 1.57, y: 2.0, z: 1.57 } }
    ]
  });
  assert.equal(shelfScan.shelfTemplates.length, 1);
  assert.equal(shelfScan.shelfTemplates[0].name, 'Terminator Squad');
  assert.equal(shelfScan.shelfTemplates[0].hasDeepStrike, true);
});

test('normalizeTtsBoardScan: preserves 3D solid obstacles and computes squad-level autoBlockedLosPairs only when every model-to-model raycast is blocked', () => {
  const dsArmiger = 'M: 12" T: 10 Sv: 3+ W: 12 Ld: 7+ OC: 8\nThermal spear | 24" | 2 | 3+ | 12 | -4 | D6 [MELTA 4]\nKeywords: Vehicle, Walker, Armiger';
  const dsInfantry = 'M: 6" T: 4 Sv: 4+ W: 1 Ld: 7+ OC: 2\nAutogun | 24" | 2 | 4+ | 3 | 0 | 1\nKeywords: Infantry';
  const dsKapricus = 'M: 12" T: 9 Sv: 3+ W: 10 Ld: 7+ OC: 3\nKeywords: Vehicle, Leagues of Votann';

  const scan = normalizeTtsBoardScan({
    obstacles: [
      { name: 'Central Munitorum Container', minX: -4, maxX: 4, minZ: 1, maxZ: 3, heightY: 2.5, solid: true }
    ],
    raycastBlockedGuidPairs: [
      'arm-1->kap-1',
      'cult-1->kap-1' // cult-2 is peeking around the wall, so cultist squad is NOT fully blocked!
    ],
    objects: [
      {
        guid: 'arm-1',
        name: '12/12 Armiger Warglaive',
        tags: ['HORDE'],
        pos: { x: 0, y: 1, z: 10 },
        bounds: { x: 3.9, y: 4.5, z: 3.9 },
        description: dsArmiger
      },
      {
        guid: 'cult-1',
        name: '1/1 Chaos Cultists',
        tags: ['HORDE', 'SQUAD:CULT_A'],
        pos: { x: -2, y: 1, z: 8 },
        bounds: { x: 1.0, y: 1.4, z: 1.0 },
        description: dsInfantry
      },
      {
        guid: 'cult-2',
        name: '1/1 Chaos Cultists',
        tags: ['HORDE', 'SQUAD:CULT_A'],
        pos: { x: -5.2, y: 1, z: 8 },
        bounds: { x: 1.0, y: 1.4, z: 1.0 },
        description: dsInfantry
      },
      {
        guid: 'kap-1',
        name: '10/10 Kapricus Defender',
        tags: ['PLAYER'],
        pos: { x: 0, y: 1, z: -4 },
        bounds: { x: 3.5, y: 2.8, z: 4.5 },
        description: dsKapricus
      }
    ]
  });

  assert.ok(Array.isArray(scan.obstacles), 'Must preserve obstacles array on normalized board telemetry');
  assert.equal(scan.obstacles.length, 1);
  assert.equal(scan.obstacles[0].name, 'Central Munitorum Container');
  assert.equal(scan.obstacles[0].solid, true);
  assert.equal(scan.obstacles[0].heightY, 2.5);

  assert.ok(Array.isArray(scan.autoBlockedLosPairs), 'Must compute squad-level autoBlockedLosPairs');
  assert.ok(
    scan.autoBlockedLosPairs.includes('HORDE::Armiger Warglaive->PLAYER::Kapricus Defender'),
    '1-model Armiger Warglaive fully raycast-blocked behind container must be in autoBlockedLosPairs'
  );
  assert.equal(
    scan.autoBlockedLosPairs.includes('HORDE::Chaos Cultists->PLAYER::Kapricus Defender'),
    false,
    'Multi-model squad with 1 peeking model (cult-2 unblocked) has 11th Ed visibility and must NOT be auto-blocked'
  );

  // When ALL models in Chaos Cultists are raycast-blocked, the squad pair becomes auto-blocked
  const allBlockedScan = normalizeTtsBoardScan({
    raycastBlockedGuidPairs: ['cult-1->kap-1', 'cult-2->kap-1'],
    objects: [
      { guid: 'cult-1', name: '1/1 Chaos Cultists', tags: ['HORDE', 'SQUAD:CULT_A'], pos: { x: -2, y: 1, z: 8 }, bounds: { x: 1.0, y: 1.4, z: 1.0 }, description: dsInfantry },
      { guid: 'cult-2', name: '1/1 Chaos Cultists', tags: ['HORDE', 'SQUAD:CULT_A'], pos: { x: -1, y: 1, z: 8 }, bounds: { x: 1.0, y: 1.4, z: 1.0 }, description: dsInfantry },
      { guid: 'kap-1', name: '10/10 Kapricus Defender', tags: ['PLAYER'], pos: { x: 0, y: 1, z: -4 }, bounds: { x: 3.5, y: 2.8, z: 4.5 }, description: dsKapricus }
    ]
  });
  assert.ok(allBlockedScan.autoBlockedLosPairs.includes('HORDE::Chaos Cultists->PLAYER::Kapricus Defender'));
});



