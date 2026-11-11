# 📦 Fires of Armageddon // Bundle: Unit Tests (TTS Telemetry, Tactica & Overwatch)

Unit tests for LCT playmat bounds filtering, prop/camera rejection, deployed PLAYER army keyword detection, 1-click side flipping, vocal Stratagem parsing, and neural Auspex visor playback (`tests/js/tts-telemetry-core.test.js`, `tests/js/tactica.test.js`, `tests/js/tactica-overwatch-core.test.js`, `tests/js/tactica-overwatch.test.js`).

## 📑 Table of Contents
- [tests/js/tts-telemetry-core.test.js](#file-testsjsttstelemetrycoretestjs)
- [tests/js/tactica.test.js](#file-testsjstacticatestjs)
- [tests/js/tactica-overwatch-core.test.js](#file-testsjstacticaoverwatchcoretestjs)
- [tests/js/tactica-overwatch.test.js](#file-testsjstacticaoverwatchtestjs)

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

---

## File: `tests/js/tactica-overwatch-core.test.js` <a id="file-testsjstacticaoverwatchcoretestjs"></a>

````javascript
/**
 * @fileoverview Unit tests for js/tactica-overwatch-core.js voice intent parser,
 * multimodal 3D LOS prompt/verdict helpers, 6+ Intrusion alerts & Crusade stats handoff.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  AUSPEX_VOICE_PRESETS,
  resolveTacticalAuspexVoice,
  PLAYER_VOCAL_STRATAGEMS,
  parsePlayerStratagem,
  matchPlayerUnitFromTelemetry,
  validatePlayerStratagemUse,
  parseSpokenTacticaIntent,
  buildLosVerificationPrompt,
  scrubGeminiThreadArtifacts,
  isGeminiInterimThinkingText,
  parseOverwatchVerdict,
  buildReactionVoiceCallout,
  detectActiveIntrusionZones,
  buildIntrusionVoxPayload,
  compileTacticaCrusadeSnapshot
} = require('../../js/tactica-overwatch-core.js');

test('parseSpokenTacticaIntent: maps spoken tabletop commands, Core/Faction Stratagems, and LOS queries', () => {
  assert.equal(parseSpokenTacticaIntent('').intent, 'NONE');
  assert.equal(parseSpokenTacticaIntent('Scan the LCT board now').intent, 'SCAN_BOARD');
  assert.equal(parseSpokenTacticaIntent('Drop wave spawns into zones').intent, 'SPAWN_WAVES');
  assert.equal(parseSpokenTacticaIntent('Move the horde units').intent, 'MOVE_HORDE');
  assert.equal(parseSpokenTacticaIntent('Revert move on that squad').intent, 'REVERT_LAST_MOVE');
  assert.equal(parseSpokenTacticaIntent('Lock movement and check overwatch').intent, 'LOCK_MOVEMENT');
  assert.equal(parseSpokenTacticaIntent('Compute shooting target priority').intent, 'SELECT_SHOOTING');
  assert.equal(parseSpokenTacticaIntent('Declare charges').intent, 'DECLARE_CHARGES');
  assert.equal(parseSpokenTacticaIntent('Consolidate horde').intent, 'CONSOLIDATE');

  const ow = parseSpokenTacticaIntent('Activate Fire Overwatch');
  assert.equal(ow.intent, 'PLAYER_STRATAGEM');
  assert.equal(ow.stratKey, 'FIRE_OVERWATCH');
  assert.equal(ow.cpCost, 1);

  const hi = parseSpokenTacticaIntent('Heroic Intervention');
  assert.equal(hi.intent, 'PLAYER_STRATAGEM');
  assert.equal(hi.stratKey, 'HEROIC_INTERVENTION');
  assert.equal(hi.cpCost, 1);

  const co = parseSpokenTacticaIntent('Counter-Offensive');
  assert.equal(co.intent, 'PLAYER_STRATAGEM');
  assert.equal(co.stratKey, 'COUNTER_OFFENSIVE');
  assert.equal(co.cpCost, 2);

  assert.equal(parseSpokenTacticaIntent('Pass window and hold CP').intent, 'PASS_REACTION');
  assert.equal(
    parseSpokenTacticaIntent('Can the Screamer-Killer see my Krieg squad through that ruin window?').intent,
    'VISUAL_LOS_CHECK'
  );
});

test('resolveTacticalAuspexVoice & zero speechSynthesis guard: maps Commander themes to neural voices and removes robotic OS TTS', () => {
  assert.ok(AUSPEX_VOICE_PRESETS && Array.isArray(PLAYER_VOCAL_STRATAGEMS));
  assert.equal(resolveTacticalAuspexVoice('votann').voice, 'en-GB-RyanNeural');
  assert.equal(resolveTacticalAuspexVoice('VOTANN').label, 'Brôkhyr Helm-Auspex');
  assert.equal(resolveTacticalAuspexVoice('militarum').voice, 'en-GB-SoniaNeural');
  assert.equal(resolveTacticalAuspexVoice('necron').voice, 'en-GB-ThomasNeural');
  assert.equal(resolveTacticalAuspexVoice('unknown').voice, 'en-GB-RyanNeural');

  const overwatchSrc = fs.readFileSync(path.resolve(__dirname, '../../js/tactica-overwatch.js'), 'utf8');
  assert.equal(
    /speechSynthesis/i.test(overwatchSrc),
    false,
    'js/tactica-overwatch.js must contain zero speechSynthesis references'
  );
});

test('parsePlayerStratagem, matchPlayerUnitFromTelemetry & validatePlayerStratagemUse: parses Core + Faction stratagems, spoken numbers, fuzzy targets & Misery #22/Secret #20 rules', () => {
  const voidArmour1 = parseSpokenTacticaIntent('Using Void Armour for 1 CP');
  assert.equal(voidArmour1.intent, 'PLAYER_STRATAGEM');
  assert.equal(voidArmour1.category, 'FACTION');
  assert.equal(voidArmour1.stratName, 'Void Armour');
  assert.equal(voidArmour1.cpCost, 1);

  const reprisal = parseSpokenTacticaIntent('Spend 2 CP on Reactive Reprisal');
  assert.equal(reprisal.intent, 'PLAYER_STRATAGEM');
  assert.equal(reprisal.stratName, 'Reactive Reprisal');
  assert.equal(reprisal.cpCost, 2);

  const typed = parsePlayerStratagem('strategem Void Armour on Hearthguard - 2cp');
  assert.equal(typed.intent, 'PLAYER_STRATAGEM');
  assert.equal(typed.category, 'FACTION');
  assert.equal(typed.stratName, 'Void Armour');
  assert.equal(typed.targetUnit, 'Hearthguard');
  assert.equal(typed.cpCost, 2);

  const spokenWords = parsePlayerStratagem('Stratagem Ancestral Sentence on Pioneers, one CP');
  assert.equal(spokenWords.intent, 'PLAYER_STRATAGEM');
  assert.equal(spokenWords.stratName, 'Ancestral Sentence');
  assert.equal(spokenWords.targetUnit, 'Pioneers');
  assert.equal(spokenWords.cpCost, 1);

  const freeOw = parsePlayerStratagem('Fire Overwatch on Yaegirs - 0cp');
  assert.equal(freeOw.intent, 'PLAYER_STRATAGEM');
  assert.equal(freeOw.category, 'CORE');
  assert.equal(freeOw.stratKey, 'FIRE_OVERWATCH');
  assert.equal(freeOw.targetUnit, 'Yaegirs');
  assert.equal(freeOw.cpCost, 0);

  const smoke = parseSpokenTacticaIntent('Popping smoke on Sagitaur');
  assert.equal(smoke.intent, 'PLAYER_STRATAGEM');
  assert.equal(smoke.stratKey, 'SMOKESCREEN');
  assert.deepEqual(smoke.buff, { hitMod: -1, cover: true });

  // Fuzzy PLAYER unit matching
  const boardUnits = [
    { name: 'Armiger Warglaive', side: 'HORDE' },
    { name: 'Einhyr Hearthguard', side: 'PLAYER' },
    { name: 'Hernkyn Pioneers', side: 'PLAYER' }
  ];
  assert.equal(matchPlayerUnitFromTelemetry('Hearthguard', boardUnits)?.name, 'Einhyr Hearthguard');
  assert.equal(matchPlayerUnitFromTelemetry('Pioneers', boardUnits)?.name, 'Hernkyn Pioneers');
  assert.equal(matchPlayerUnitFromTelemetry('Warglaive', boardUnits), null, 'Must never fuzzy-match HORDE units for Player Stratagems');

  // Misery #22 (Comms Jammed), minRound, CP check, and Secret #20 (cpCost >= 1)
  assert.equal(validatePlayerStratagemUse(voidArmour1, { battleRound: 2, playerCp: 2, activeMiseryIds: [22] }).allowed, false);
  const ingress = parseSpokenTacticaIntent('Rapid Ingress');
  assert.equal(validatePlayerStratagemUse(ingress, { battleRound: 1, playerCp: 2, activeMiseryIds: [] }).allowed, false);
  assert.equal(validatePlayerStratagemUse(ingress, { battleRound: 2, playerCp: 2, activeMiseryIds: [] }).allowed, true);
  assert.equal(validatePlayerStratagemUse(reprisal, { battleRound: 2, playerCp: 1, activeMiseryIds: [] }).allowed, false);
  assert.equal(validatePlayerStratagemUse(freeOw, { battleRound: 2, playerCp: 0, activeMiseryIds: [] }).countsForSecret20, false);
  assert.equal(validatePlayerStratagemUse(voidArmour1, { battleRound: 2, playerCp: 2, activeMiseryIds: [] }).countsForSecret20, true);
});

test('buildLosVerificationPrompt & parseOverwatchVerdict: embeds Misery #28 / coordinates and parses JSON or prose verdicts', () => {
  const prompt = buildLosVerificationPrompt({
    factionName: 'Tyranids',
    battleRound: 2,
    activeMiseryIds: [],
    lastMovementPlans: [{ squadKey: 'HORDE::Screamer', unitName: 'Screamer-Killer', goalName: 'Krieg Squad', targetX: 2, targetZ: 6 }],
    boardTelemetry: {
      units: [
        { squadKey: 'HORDE::Screamer', name: 'Screamer-Killer', side: 'HORDE', pos: { x: 2, z: 6 }, keywords: ['MONSTER'] },
        { squadKey: 'PLAYER::Krieg', name: 'Krieg Squad', side: 'PLAYER', pos: { x: 2, z: -4 }, keywords: ['INFANTRY'], isHidden: true }
      ]
    }
  }, 'Can the Screamer-Killer see the Krieg Squad behind the solid L-ruin?');

  assert.ok(prompt.includes('HORDE::Screamer'));
  assert.ok(prompt.includes('11th Edition'));

  const flyPrompt = buildLosVerificationPrompt({ activeMiseryIds: [28] }, '');
  assert.ok(flyPrompt.includes('Misery #28'));

  const fencedJson = '```json\n{"losBlocked":true,"revertSquadKey":"HORDE::Screamer","blockedPairs":["HORDE::Screamer->PLAYER::Krieg"],"spokenReply":"Solid first-floor ruin blocks true line of sight; reverting Screamer-Killer."}\n```';
  const parsed = parseOverwatchVerdict(fencedJson);
  assert.equal(parsed.losBlocked, true);
  assert.equal(parsed.revertSquadKey, 'HORDE::Screamer');
  assert.deepEqual(parsed.blockedPairs, ['HORDE::Screamer->PLAYER::Krieg']);
  assert.ok(parsed.spokenReply.includes('reverting Screamer-Killer'));

  const fallback = parseOverwatchVerdict('Line of sight is clear past the rubble.');
  assert.equal(fallback.losBlocked, false);
  assert.equal(fallback.spokenReply, 'Line of sight is clear past the rubble.');

  const proseBlocked = parseOverwatchVerdict('No line of sight behind the ruin.');
  assert.equal(proseBlocked.losBlocked, true);
  assert.equal(parseOverwatchVerdict('').losBlocked, false);
});

test('buildReactionVoiceCallout & detectActiveIntrusionZones: announces CP options and flags 6+ Big-Bracket breaches', () => {
  assert.equal(buildReactionVoiceCallout(null), '');
  const callout = buildReactionVoiceCallout({
    open: true,
    title: 'End of Horde Movement Phase',
    playerCp: 2,
    eligibleStratagems: [{ name: 'Fire Overwatch (24", 6+ Snap Shots)', cpCost: 1 }]
  });
  assert.ok(callout.includes('2 Command Points') && callout.includes('Fire Overwatch'));

  const breaches = detectActiveIntrusionZones([
    { zone: 1, bracketKey: '7-9', bracketLabel: 'Bracket [7–9]', intrusionRoll: null },
    { zone: 2, bracketKey: '10-12', bracketLabel: 'Bracket [10–12]', intrusionRoll: 5 },
    { zone: 3, bracketKey: '13+', bracketLabel: 'Bracket [13+]', intrusionRoll: 6 }
  ]);
  assert.equal(breaches.length, 1);
  assert.equal(breaches[0].zone, 3);

  const gammaPing = buildIntrusionVoxPayload({
    zoneNum: 3,
    bracketLabel: 'Bracket [13+]',
    channel: 'gamma',
    roomCode: 'EMBER-09',
    battleRound: 4,
    factionName: 'Orks'
  });
  assert.ok(gammaPing.includes('FANE-NODE VÔL-09') && gammaPing.includes('EMBER-09'));

  const alphaPing = buildIntrusionVoxPayload({ zoneNum: 1, bracketLabel: '[10–12]', channel: 'alpha', roomCode: 'HADES-1' });
  assert.ok(alphaPing.includes('THE EXILE'));
  const betaPing = buildIntrusionVoxPayload({ zoneNum: 1, bracketLabel: '[10–12]', channel: 'beta', roomCode: 'HADES-1' });
  assert.ok(betaPing.includes('JUNEBUG'));
  const distPing = buildIntrusionVoxPayload({ zoneNum: 2, bracketLabel: '[13+]', channel: 'distant', roomCode: 'HADES-1' });
  assert.ok(distPing.includes('ORBITAL AUGUR ARRAY'));
});

test('compileTacticaCrusadeSnapshot: aggregates chronicle kills, reactions, Misery cards & Warlord status for Mode 5 Crusade', () => {
  const state = {
    roomCode: 'GOLGOTHA-44',
    battleRound: 6,
    factionName: 'World Eaters',
    playerSp: 10,
    playerCp: 1,
    activeMiseryIds: [5, 30],
    hordeWarlord: { name: 'Lord Invocatus', roundSpawned: 2, alive: false }
  };
  const chronicle = [
    { type: 'AUTO_DEFENDER', summary: 'Wiped Berzerkers', details: { outcome: { unitDestroyed: true, modelsSlain: 10 } } },
    { type: 'AUTO_DEFENDER', summary: 'Slain Invocatus', details: { outcome: { unitDestroyed: true, modelsSlain: 1 } } },
    { type: 'REACTION', summary: 'Player activated FIRE_OVERWATCH (-1 CP).' },
    { type: 'REACTION', summary: 'Player passed reaction window.' }
  ];
  const spawnerSession = {
    selectedModeVal: 'solo',
    spSpentThisRound: 6,
    activeMiseries: [{ id: 5, name: 'Untouchable' }, { id: 30, name: 'Aim for the Heads' }],
    activeCard: { code: 'L2Y', name: '11 - Show Off', tags: 'End of Game' }
  };

  const snap = compileTacticaCrusadeSnapshot(state, chronicle, spawnerSession);
  assert.equal(snap.hordeKills, 2);
  assert.equal(snap.stratagemsUsed, 1);
  assert.equal(snap.roundsPlayed, 6);
  assert.equal(snap.hordeFaction, 'World Eaters');
  assert.equal(snap.roomSeed, 'GOLGOTHA-44');
  assert.equal(snap.gameMode, 'SOLO');
  assert.equal(snap.leftoverSp, 10);
  assert.equal(snap.leftoverCp, 1);
  assert.equal(snap.secretObjective.code, 'L2Y');
  assert.equal(snap.hordeWarlord.alive, false);
});

test('scrubGeminiThreadArtifacts & isGeminiInterimThinkingText: strips "O Gemini disse" anywhere and rejects thinking/streaming states', () => {
  assert.equal(typeof scrubGeminiThreadArtifacts, 'function');
  assert.equal(typeof isGeminiInterimThinkingText, 'function');

  // Exact interim thinking strings observed in live Portuguese/English Gemini 2.5 Thinking UI
  const interim1 = scrubGeminiThreadArtifacts('Processing: Determining if terrain blocks visibility O Gemini disse');
  assert.equal(interim1.includes('O Gemini disse'), false);
  assert.equal(isGeminiInterimThinkingText(interim1), true, 'Must treat "Processing: Determining..." as interim thinking');

  const interim2 = scrubGeminiThreadArtifacts('Determining if large rulebooks are supported O Gemini disse');
  assert.equal(interim2.includes('O Gemini disse'), false);
  assert.equal(isGeminiInterimThinkingText(interim2), true, 'Must treat "Determining if..." thought header as interim thinking');

  const adjacentNoSpace = scrubGeminiThreadArtifacts('Mostrar pensamentoDetermining if terrain blocks visibilityO Gemini disse');
  assert.equal(adjacentNoSpace.includes('O Gemini disse'), false);
  assert.equal(adjacentNoSpace.includes('Mostrar pensamento'), false);
  assert.equal(isGeminiInterimThinkingText(adjacentNoSpace), true);

  const emptyAfterLabel = scrubGeminiThreadArtifacts('  O Gemini disse:  ');
  assert.equal(emptyAfterLabel, '');
  assert.equal(isGeminiInterimThinkingText(emptyAfterLabel), true, 'Empty body after stripping O Gemini disse must keep waiting');

  // Active streaming button still present on page
  assert.equal(
    isGeminiInterimThinkingText('{"losBlocked":true', { isGenerating: true }),
    true,
    'Must keep waiting while Gemini Stop/streaming indicator is active'
  );

  // Completed real responses (JSON and conversational prose)
  const finalJson = scrubGeminiThreadArtifacts(
    'O Gemini disse\nJSON\nCopiar código\n{"losBlocked":true,"revertSquadKey":"HORDE::Paladin","blockedPairs":[],"spokenReply":"Solid ruin blocks LOS."}'
  );
  assert.equal(isGeminiInterimThinkingText(finalJson, { isGenerating: false }), false);
  const verdict = parseOverwatchVerdict(
    'O Gemini disse\n{"losBlocked":false,"revertSquadKey":null,"blockedPairs":[],"spokenReply":"Clear sightline past low rubble."}'
  );
  assert.equal(verdict.spokenReply, 'Clear sightline past low rubble.');

  const proseVerdict = parseOverwatchVerdict('O Gemini disse: Yes, I can hear you loud and clear and am ready to verify line of sight.');
  assert.equal(proseVerdict.spokenReply.includes('O Gemini disse'), false);
  assert.equal(isGeminiInterimThinkingText(proseVerdict.spokenReply, { isGenerating: false }), false);
});


````

---

## File: `tests/js/tactica-overwatch.test.js` <a id="file-testsjstacticaoverwatchtestjs"></a>

````javascript
/**
 * @fileoverview Unit tests for js/tactica-overwatch.js neural Auspex Web Audio playback,
 * visor comm-filter chain (260Hz–4200Hz @ 0.55 gain), sticky-bar quick Stratagems, and PTT guards.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '../../');

test('speakOverwatchLine & triggerQuickStratagem: plays decoded /audio/speak MP3 through 260Hz-4200Hz visor filter and routes quick Stratagems', async () => {
  const overwatchCore = require(path.join(ROOT_DIR, 'js/tactica-overwatch-core.js'));
  Object.assign(globalThis, overwatchCore);

  const createdFilters = [];
  const createdGains = [];
  let bufferStarted = false;
  let auspexChimes = 0;

  class MockOverwatchAudioCtx {
    constructor() {
      this.currentTime = 10;
      this.state = 'running';
      this.destination = {};
    }
    async decodeAudioData(buf) {
      return { byteLength: buf.byteLength };
    }
    createBufferSource() {
      return {
        buffer: null,
        connect() {},
        start() { bufferStarted = true; }
      };
    }
    createBiquadFilter() {
      const f = { type: 'lowpass', frequency: { val: 0, setValueAtTime(v) { this.val = v; } }, connect() {} };
      createdFilters.push(f);
      return f;
    }
    createGain() {
      const g = { gain: { val: 1, setValueAtTime(v) { this.val = v; } }, connect() {} };
      createdGains.push(g);
      return g;
    }
  }

  const els = {};
  const makeEl = (val = '') => ({
    value: val,
    textContent: '',
    innerHTML: '',
    classList: {
      _s: new Set(),
      add(c) { this._s.add(c); },
      remove(c) { this._s.delete(c); },
      toggle(c, f) { if (f === undefined ? !this._s.has(c) : f) this._s.add(c); else this._s.delete(c); },
      contains(c) { return this._s.has(c); }
    }
  });
  [
    'quickStratCategorySelect', 'quickStratNameInput', 'quickStratCoreSelect',
    'quickStratTargetSelect', 'overwatchVerdictBox', 'tacticaIntrusionAlertBox', 'btnToggleOverwatchTts'
  ].forEach(id => { els[id] = makeEl(); });

  const clientState = {
    battleRound: 2,
    playerCp: 2,
    activeMiseryIds: [],
    boardTelemetry: { units: [{ name: 'Einhyr Hearthguard', side: 'PLAYER' }] }
  };

  let requestedBody = null;
  globalThis.localStorage = { getItem: () => null, setItem: () => {} };
  globalThis.document = { getElementById: (id) => els[id] || null };
  globalThis.window = {
    AudioContext: MockOverwatchAudioCtx,
    addEventListener: () => {},
    getTacticaClientState: () => clientState,
    resolveConsoleReaction: async (choice, cost) => { clientState.playerCp -= cost; },
    VoxAudio: {
      getFactionTheme: () => 'votann',
      playClank: () => { auspexChimes += 1; }
    }
  };
  globalThis.fetch = async (_url, opts) => {
    requestedBody = JSON.parse(opts.body);
    return {
      ok: true,
      json: async () => ({
        ok: true,
        voice: 'en-GB-RyanNeural',
        audioBase64: Buffer.from('FAKE_MP3_BYTES').toString('base64')
      })
    };
  };

  delete require.cache[require.resolve(path.join(ROOT_DIR, 'js/tactica-overwatch.js'))];
  const overwatch = require(path.join(ROOT_DIR, 'js/tactica-overwatch.js'));

  try {
    const played = await overwatch.speakOverwatchLine('Void Armour active.');
    assert.equal(played, true);
    assert.equal(requestedBody.theme, 'votann');
    assert.equal(bufferStarted, true);
    assert.equal(createdFilters.length, 2);
    assert.equal(createdFilters[0].frequency.val, 260);
    assert.equal(createdFilters[1].frequency.val, 4200);
    assert.equal(createdGains[0].gain.val, 0.55);

    // Quick Stratagem sticky-bar helper + Misery #22 block
    els.quickStratCategorySelect.value = 'FACTION';
    overwatch.toggleQuickStratCategory();
    assert.equal(els.quickStratCoreSelect.classList.contains('hidden'), true);
    els.quickStratNameInput.value = 'Void Armour';
    els.quickStratTargetSelect.value = 'Hearthguard';
    const stratRes = await overwatch.triggerQuickStratagem(1);
    assert.equal(stratRes.rejected, false);
    assert.equal(stratRes.resolvedTarget, 'Einhyr Hearthguard');
    assert.equal(clientState.playerCp, 1);

    clientState.activeMiseryIds = [22];
    const blocked = await overwatch.triggerQuickStratagem(0);
    assert.equal(blocked.rejected, true, 'Misery #22 (Comms Jammed) must block Stratagems');

    // Offline fallback plays gentle auspex clank without throwing
    globalThis.fetch = async () => { throw new Error('Offline'); };
    const offlinePlayed = await overwatch.speakOverwatchLine('Offline test.');
    assert.equal(offlinePlayed, false);
    assert.ok(auspexChimes >= 1);
  } finally {
    delete globalThis.localStorage;
    delete globalThis.document;
    delete globalThis.window;
    delete globalThis.fetch;
  }
});
````
