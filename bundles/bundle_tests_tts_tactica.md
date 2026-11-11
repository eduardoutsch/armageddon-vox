# 📦 Fires of Armageddon // Bundle: Unit Tests (TTS Telemetry Core & Tactica Console)

Unit tests for LCT playmat bounds filtering, prop/camera rejection, deployed PLAYER army keyword detection, and 1-click `/tts/set-side` side flipping (`tests/js/tts-telemetry-core.test.js`, `tests/js/tactica.test.js`).

## 📑 Table of Contents
- [tests/js/tts-telemetry-core.test.js](#file-testsjsttstelemetrycoretestjs)
- [tests/js/tactica.test.js](#file-testsjstacticatestjs)

---

## File: `tests/js/tts-telemetry-core.test.js` <a id="file-testsjsttstelemetrycoretestjs"></a>

````javascript
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
  hasDatasheetSignature,
  inferSide,
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

````

---

## File: `tests/js/tactica.test.js` <a id="file-testsjstacticatestjs"></a>

````javascript
/**
 * @fileoverview Unit tests for js/tactica.js telemetry side-flip adapter (`/tts/set-side`),
 * idempotent console rendering, and guard clauses.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '../../');

test('toggleTelemetryUnitSide: posts { squadKey, guids, side } to /tts/set-side when online and renders ⇄ Flip Side idempotently', async () => {
  const spawner = require(path.join(ROOT_DIR, 'js/spawner.js'));
  const combat = require(path.join(ROOT_DIR, 'js/horde-combat-modifiers.js'));
  const telemetry = require(path.join(ROOT_DIR, 'js/tts-telemetry-core.js'));
  const autopilot = require(path.join(ROOT_DIR, 'js/horde-autopilot-core.js'));
  const overwatchCore = require(path.join(ROOT_DIR, 'js/tactica-overwatch-core.js'));
  const core = require(path.join(ROOT_DIR, 'js/tactica-core.js'));
  Object.assign(globalThis, spawner, combat, telemetry, autopilot, overwatchCore, core);

  const els = {
    tacticaTelemetryBox: { innerHTML: '' },
    tacticaDaemonBadge: { textContent: '' }
  };
  const postedRequests = [];

  globalThis.document = { getElementById: (id) => els[id] || null };
  globalThis.window = { addEventListener: () => {} };
  globalThis.fetch = async (url, opts) => {
    const body = opts && opts.body ? JSON.parse(opts.body) : null;
    postedRequests.push({ url, method: opts?.method || 'GET', body });
    return {
      ok: true,
      json: async () => ({
        ok: true,
        units: [
          {
            squadKey: body.squadKey,
            guids: body.guids,
            name: 'Hearthkyn Warriors',
            side: body.side,
            modelCount: 10,
            save: 4
          }
        ]
      })
    };
  };

  try {
    delete require.cache[require.resolve(path.join(ROOT_DIR, 'js/tactica.js'))];
    const tactica = require(path.join(ROOT_DIR, 'js/tactica.js'));

    tactica.getTacticaClientState().boardTelemetry = {
      objectives: [],
      units: [
        {
          squadKey: 'HORDE::Hearthkyn Warriors',
          guids: ['vot-a', 'vot-b'],
          name: 'Hearthkyn Warriors',
          side: 'HORDE',
          modelCount: 10,
          save: 4
        }
      ]
    };

    assert.equal(typeof tactica.toggleTelemetryUnitSide, 'function');
    assert.equal(await tactica.toggleTelemetryUnitSide(99), null, 'Out-of-bounds index must return null safely');

    const updated = await tactica.toggleTelemetryUnitSide(0);
    assert.equal(updated.side, 'PLAYER');
    assert.equal(postedRequests.length, 1);
    assert.ok(postedRequests[0].url.endsWith('/tts/set-side'));
    assert.equal(postedRequests[0].method, 'POST');
    assert.deepEqual(postedRequests[0].body, {
      squadKey: 'HORDE::Hearthkyn Warriors',
      guids: ['vot-a', 'vot-b'],
      side: 'PLAYER'
    });

    assert.ok(els.tacticaTelemetryBox.innerHTML.includes('<span class="badge blue">PLAYER</span>'));
    assert.ok(els.tacticaTelemetryBox.innerHTML.includes('onclick="toggleTelemetryUnitSide(0)"'));
    assert.equal(
      els.tacticaTelemetryBox.innerHTML.includes('selectTelemetryUnitForDefense(0)'),
      false,
      'PLAYER units must hide the Horde Auto-Defender button'
    );
  } finally {
    delete globalThis.document;
    delete globalThis.window;
    delete globalThis.fetch;
  }
});
````
