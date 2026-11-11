# 📦 Fires of Armageddon // Bundle: LCT TTS Telemetry & Spatial Squad Core

Pure Yellowscribe/ForceOrg BBCode datasheet parser, prop/terrain blacklist, spatial >6" squad coherency clustering, deployed PLAYER army auto-detection, and 2D edge-to-edge tabletop inch geometry (`js/tts-telemetry-core.js`).

## 📑 Table of Contents
- [js/tts-telemetry-core.js](#file-jsttstelemetrycorejs)

---

## File: `js/tts-telemetry-core.js` <a id="file-jsttstelemetrycorejs"></a>

````javascript
/**
 * @fileoverview Fires of Armageddon // Pure TTS Telemetry, Datasheet & Geometry Core
 *
 * Pure Functional Core module (zero DOM, network, filesystem, or PRNG dependencies):
 * - Strips TTS BBCode/color markup while preserving 40k `[KEYWORD]` weapon brackets
 * - Extracts stats, saves, FNP, Scouts, keywords, and weapons from Yellowscribe/ForceOrg text
 * - Groups individual TTS miniature objects into logical squads with wound tallies
 * - Computes exact 2D base-edge-to-base-edge distances in inches to enemies and objectives
 */

(function (root, factory) {
  const exports = factory();
  if (typeof root !== 'undefined') Object.assign(root, exports);
  if (typeof module !== 'undefined' && module.exports) module.exports = exports;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {

  /**
   * Removes TTS BBCode formatting (`[b]`, `[-]`, `[c6c930]`) without touching `[LETHAL HITS]`.
   *
   * @param {string} text - Raw TTS string containing MoonSharp/NGUI color and formatting tags.
   * @returns {string} Sanitized plain text with 40k bracketed weapon keywords intact.
   */
  function stripTtsMarkup(text) {
    if (!text) return '';
    return String(text)
      .replace(/\[\/?(?:b|i|u|s|sub|sup)\]/gi, '')
      .replace(/\[-\]/g, '')
      .replace(/\[[0-9a-fA-F]{6}(?:[0-9a-fA-F]{2})?\]/g, '')
      .replace(/\r\n/g, '\n')
      .trim();
  }

  /**
   * Extracts `current/max` wound counters and normalized base unit name from a TTS object name.
   *
   * @param {string} rawName - Raw TTS model name (e.g. `"8/10 Screamer-Killer"` or `"[b]Warriors[/b] (1/1)"`).
   * @returns {{baseName: string, currentWounds: number|null, maxWounds: number|null}}
   */
  function parseModelNameAndWounds(rawName) {
    const clean = stripTtsMarkup(rawName);
    if (!clean) return { baseName: 'Unknown Model', currentWounds: null, maxWounds: null };

    const leadMatch = clean.match(/^\(?(\d+)\s*\/\s*(\d+)\)?\s+(.+)$/);
    if (leadMatch) {
      return {
        baseName: leadMatch[3].trim(),
        currentWounds: parseInt(leadMatch[1], 10),
        maxWounds: parseInt(leadMatch[2], 10)
      };
    }

    const trailMatch = clean.match(/^(.+?)\s+\(?(\d+)\s*\/\s*(\d+)\)?$/);
    if (trailMatch) {
      return {
        baseName: trailMatch[1].trim(),
        currentWounds: parseInt(trailMatch[2], 10),
        maxWounds: parseInt(trailMatch[3], 10)
      };
    }

    return { baseName: clean, currentWounds: null, maxWounds: null };
  }

  function parseWeaponLine(line) {
    const trimmed = line.trim();
    if (!trimmed) return null;

    let kwList = [];
    let working = trimmed;
    const kwMatch = working.match(/\[([A-Z0-9\s,\-+]+)\]\s*$/i);
    if (kwMatch) {
      kwList = kwMatch[1].split(',').map(k => k.trim().toUpperCase()).filter(Boolean);
      working = working.slice(0, kwMatch.index).trim().replace(/\|\s*$/, '').trim();
    }

    // Pipe-delimited Yellowscribe / table row: Name | 18" or Melee | A | BS/WS | S | AP | D
    if (working.includes('|')) {
      const cols = working.split('|').map(c => c.trim()).filter(Boolean);
      if (cols.length >= 7) {
        const isMelee = /^melee$/i.test(cols[1]);
        return {
          name: cols[0],
          type: isMelee ? 'melee' : 'ranged',
          rangeInches: isMelee ? 0 : (parseInt(cols[1], 10) || 0),
          attacks: /^\d+$/.test(cols[2]) ? parseInt(cols[2], 10) : cols[2].toUpperCase(),
          skill: parseInt(cols[3], 10) || 4,
          strength: parseInt(cols[4], 10) || 4,
          ap: parseInt(cols[5], 10) || 0,
          damage: cols[6],
          keywords: kwList
        };
      }
    }

    // Inline labeled format: Range: 24" A: 2 BS: 3+ S: 4 AP: -1 D: 1
    const lblMatch = working.match(/^(?:(.+?)\s*[-—:]\s*)?(?:Range:\s*)?(Melee|\d+")\s+A:\s*([0-9D+]+)\s+(?:BS|WS):\s*(\d)\+\s+S:\s*(\d+)\s+AP:\s*(-?\d+)\s+D:\s*([0-9D+]+)/i);
    if (lblMatch) {
      const isMelee = /^melee$/i.test(lblMatch[2]);
      return {
        name: (lblMatch[1] || 'Weapon').trim(),
        type: isMelee ? 'melee' : 'ranged',
        rangeInches: isMelee ? 0 : (parseInt(lblMatch[2], 10) || 0),
        attacks: /^\d+$/.test(lblMatch[3]) ? parseInt(lblMatch[3], 10) : lblMatch[3].toUpperCase(),
        skill: parseInt(lblMatch[4], 10) || 4,
        strength: parseInt(lblMatch[5], 10) || 4,
        ap: parseInt(lblMatch[6], 10) || 0,
        damage: lblMatch[7],
        keywords: kwList
      };
    }
    return null;
  }

  /**
   * Parses a Yellowscribe or ForceOrg TTS model description into structured 11th Ed stats & weapons.
   *
   * @param {string} [description=''] - TTS object `getDescription()` string.
   * @param {string} [gmNotes=''] - TTS object `getGMNotes()` string.
   * @returns {object} Normalized datasheet profile (`move`, `toughness`, `save`, `invuln`, `fnp`, `weapons`, etc.).
   */
  function parseDatasheetFromTts(description = '', gmNotes = '') {
    const clean = stripTtsMarkup(`${description || ''}\n${gmNotes || ''}`);
    const lines = clean.split('\n').map(l => l.trim()).filter(Boolean);

    let move = 6;
    let toughness = 4;
    let save = 4;
    let invuln = null;
    let fnp = null;
    let woundsPerModel = 1;
    let leadership = 7;
    let oc = 1;
    let scoutsInches = 0;
    const keywords = new Set();
    const weapons = [];

    // 1. Inline labeled statline (M: 6" T: 4 Sv: 4+ W: 1 Ld: 7+ OC: 2)
    const inlineStats = clean.match(/M:?\s*(\d+)"?[\s|]+T:?\s*(\d+)[\s|]+Sv:?\s*(\d)\+[\s|]+W:?\s*(\d+)[\s|]+Ld:?\s*(\d+)\+?[\s|]+OC:?\s*(\d+)/i);
    if (inlineStats) {
      move = parseInt(inlineStats[1], 10);
      toughness = parseInt(inlineStats[2], 10);
      save = parseInt(inlineStats[3], 10);
      woundsPerModel = parseInt(inlineStats[4], 10);
      leadership = parseInt(inlineStats[5], 10);
      oc = parseInt(inlineStats[6], 10);
    }

    // 2. Two-line tabular Yellowscribe statline
    for (let i = 0; i < lines.length - 1; i++) {
      if (/^M\s+T\s+Sv\s+W\s+Ld\s+OC\b/i.test(lines[i])) {
        const vals = lines[i + 1].match(/(\d+)"?\s+(\d+)\s+(\d)\+\s+(\d+)\s+(\d+)\+?\s+(\d+)/);
        if (vals) {
          move = parseInt(vals[1], 10);
          toughness = parseInt(vals[2], 10);
          save = parseInt(vals[3], 10);
          woundsPerModel = parseInt(vals[4], 10);
          leadership = parseInt(vals[5], 10);
          oc = parseInt(vals[6], 10);
        }
      }
    }

    const invMatch = clean.match(/(?:Invulnerable Save|Invuln|Inv):?\s*(\d)\+|\b(\d)\+\+/i);
    if (invMatch) invuln = parseInt(invMatch[1] || invMatch[2], 10);

    const fnpMatch = clean.match(/(?:Feel No Pain|FNP):?\s*(\d)\+/i);
    if (fnpMatch) fnp = parseInt(fnpMatch[1], 10);

    const scoutMatch = clean.match(/Scouts\s+(\d+)"/i);
    if (scoutMatch) scoutsInches = parseInt(scoutMatch[1], 10);

    for (const line of lines) {
      const kwLine = line.match(/^(?:Faction\s+)?Keywords:\s*(.+)$/i);
      if (kwLine) {
        kwLine[1].split(/[,|]/).map(k => k.trim().toUpperCase()).filter(Boolean).forEach(k => keywords.add(k));
        continue;
      }
      const wp = parseWeaponLine(line);
      if (wp) weapons.push(wp);
    }

    return {
      move,
      toughness,
      save,
      invuln,
      fnp,
      woundsPerModel,
      leadership,
      oc,
      scoutsInches,
      keywords: Array.from(keywords),
      weapons
    };
  }

  /**
   * Infers 2D horizontal base radius in inches from explicit mm or TTS normalized bounds.
   */
  function inferBaseRadiusInches(obj = {}) {
    if (obj.baseDiameterMm) {
      return (Number(obj.baseDiameterMm) / 25.4) * 0.5;
    }
    if (obj.bounds && obj.bounds.x && obj.bounds.z) {
      const minSpan = Math.min(Number(obj.bounds.x) || 1.26, Number(obj.bounds.z) || 1.26);
      return Math.max(0.45, Math.min(3.5, minSpan * 0.5));
    }
    return 0.63; // Default 32mm base radius in inches
  }

  /**
   * Measures 2D tabletop edge-to-edge distance in inches (1 TTS unit = 1 inch on XZ plane).
   */
  function measureEdgeToEdgeInches(posA = {}, radiusA = 0, posB = {}, radiusB = 0) {
    const dx = (Number(posA.x) || 0) - (Number(posB.x) || 0);
    const dz = (Number(posA.z) || 0) - (Number(posB.z) || 0);
    const centerDist = Math.hypot(dx, dz);
    return Number(Math.max(0, centerDist - radiusA - radiusB).toFixed(2));
  }

  function isPointInZones(pos, zones = []) {
    if (!pos || !Array.isArray(zones)) return false;
    const x = Number(pos.x) || 0;
    const z = Number(pos.z) || 0;
    return zones.some(zn => x >= zn.minX && x <= zn.maxX && z >= zn.minZ && z <= zn.maxZ);
  }

  /**
   * Declarative prop/terrain name blacklist rejecting LCT cameras, Objective Secured chips,
   * ruins, clocks, and table helpers unless explicitly tagged `PLAYER` or `HORDE`.
   */
  const PROP_NAME_BLACKLIST = /\b(dice\s*cam(?:era)?|camera|objective\s+secured|tower|ruin|wall|container|crate|barricade|statue|tree|woods|crater|clock|scoreboard|mat|table|zone|helper|ruler)\b/i;

  /**
   * Verifies that an untagged TTS object carries genuine Yellowscribe/ForceOrg datasheet text
   * (`M/T/Sv/W`, `Keywords:`, weapon table rows, or `current/max` wound counters) so locked terrain
   * and decorative table props never pollute tactical telemetry.
   *
   * @param {string} [description=''] - TTS object description.
   * @param {string} [gmNotes=''] - TTS object GMNotes.
   * @param {string} [cleanName=''] - Markup-stripped object name.
   * @returns {boolean} True when the object matches a real 40k datasheet signature.
   */
  function hasDatasheetSignature(description = '', gmNotes = '', cleanName = '') {
    if (/^\(?(\d+)\s*\/\s*(\d+)\)?\s+.+|.+\s+\(?(\d+)\s*\/\s*(\d+)\)?$/.test(cleanName)) return true;
    const combined = stripTtsMarkup(`${description || ''}\n${gmNotes || ''}`);
    if (!combined) return false;
    return (
      /\bM:?\s*\d+"?[\s|]+T:?\s*\d+/i.test(combined) ||
      /\bM\s+T\s+Sv\s+W\s+Ld\s+OC\b/i.test(combined) ||
      /\b(?:Faction\s+)?Keywords:\s*\S+/i.test(combined) ||
      /\|\s*(?:Melee|\d+")\s*\|/i.test(combined)
    );
  }

  /**
   * Declarative lookup mapping Mode 1 Horde faction names to Yellowscribe/ForceOrg faction keyword tokens
   * so pre-deployed untagged armies on the LCT battlemat auto-classify as `PLAYER` vs `HORDE`.
   */
  const HORDE_FACTION_ALIASES = {
    'Space Marines': ['ADEPTUS ASTARTES'],
    'Imperial Agents': ['AGENTS OF THE IMPERIUM', 'IMPERIAL AGENTS'],
    'Astra Militarum': ['ASTRA MILITARUM'],
    'Imperial Knights': ['IMPERIAL KNIGHTS', 'QUESTORIS', 'ARMIGER', 'DOMINUS'],
    'Chaos Daemons': ['LEGIONES DAEMONICA'],
    'Chaos Knights': ['CHAOS KNIGHTS', 'WAR DOG', 'ABHORRENT'],
    'Chaos Space Marines': ['HERETIC ASTARTES'],
    "Emperor's Children": ["EMPEROR'S CHILDREN", 'EMPERORS CHILDREN'],
    'Aeldari': ['AELDARI', 'ASURYANI'],
    "T'au Empire": ["T'AU EMPIRE", 'TAU EMPIRE'],
    'Leagues of Votann': ['LEAGUES OF VOTANN', 'VOTANN'],
    'Tyranids': ['TYRANIDS', 'GREAT DEVOURER']
  };

  /**
   * Resolves a squad's allegiance (`PLAYER` vs `HORDE`) from explicit TTS tags first, then by comparing
   * parsed Yellowscribe faction keywords against `options.hordeFactionName`.
   *
   * @param {object} obj - Raw TTS object descriptor.
   * @param {string[]} [dsKeywords=[]] - Uppercase datasheet keywords from `parseDatasheetFromTts()`.
   * @param {object} [options={}] - Normalization options (`hordeFactionName`).
   * @returns {'PLAYER'|'HORDE'} Resolved tabletop side.
   */
  function inferSide(obj, dsKeywords = [], options = {}) {
    const tags = Array.isArray(obj.tags) ? obj.tags.map(t => String(t).toUpperCase()) : [];
    if (tags.includes('PLAYER') || String(obj.side || '').toUpperCase() === 'PLAYER') return 'PLAYER';
    if (tags.includes('HORDE') || String(obj.side || '').toUpperCase() === 'HORDE') return 'HORDE';

    const hordeFac = String(options.hordeFactionName || '').trim();
    if (hordeFac && dsKeywords.length > 0) {
      const expectedTokens = [hordeFac.toUpperCase(), ...(HORDE_FACTION_ALIASES[hordeFac] || [])];
      const matchesHorde = expectedTokens.some(tok => dsKeywords.some(kw => kw.includes(tok)));
      return matchesHorde ? 'HORDE' : 'PLAYER';
    }
    return 'HORDE';
  }

  /**
   * Maximum edge-to-edge distance (2" unit coherency + 4" base/casualty slack) before same-named
   * miniature models split into independent squads (`#1`, `#2`) instead of merging across the board.
   */
  const MAX_COHERENCY_CLUSTER_INCHES = 6.0;

  /**
   * Pure single-linkage connected-components partitioner: groups same-datasheet models whose bases
   * form a coherent chain within `maxEdgeInches`, while splitting distant duplicate squads (`> 6"`
   * away from every model in another cluster) regardless of TTS `getAllObjects()` iteration order.
   *
   * @param {Array<object>} [models=[]] - Candidate model entries with `pos` and `radiusInches`.
   * @param {number} [maxEdgeInches=MAX_COHERENCY_CLUSTER_INCHES] - Max edge-to-edge link distance.
   * @returns {Array<Array<object>>} Ordered array of spatial model clusters.
   */
  function clusterModelsByCoherency(models = [], maxEdgeInches = MAX_COHERENCY_CLUSTER_INCHES) {
    if (!Array.isArray(models) || models.length === 0) return [];
    if (models.length === 1) return [[models[0]]];

    const visited = new Array(models.length).fill(false);
    const clusters = [];

    for (let i = 0; i < models.length; i++) {
      if (visited[i]) continue;
      visited[i] = true;
      const queue = [i];
      const cluster = [];

      while (queue.length > 0) {
        const curIdx = queue.shift();
        const cur = models[curIdx];
        cluster.push(cur);

        for (let j = 0; j < models.length; j++) {
          if (visited[j]) continue;
          const dist = measureEdgeToEdgeInches(cur.pos, cur.radiusInches, models[j].pos, models[j].radiusInches);
          if (dist <= maxEdgeInches) {
            visited[j] = true;
            queue.push(j);
          }
        }
      }
      clusters.push(cluster);
    }
    return clusters;
  }

  function buildSquadRecord(squadKey, unitName, side, entries) {
    const primaryDs = entries.find(e => e.ds.weapons.length > 0 || e.ds.keywords.length > 0)?.ds || entries[0].ds;
    const woundsPerModel = entries[0].maxWounds || primaryDs.woundsPerModel || 1;
    const models = entries.map(e => {
      const curW = e.currentWounds !== null ? e.currentWounds : woundsPerModel;
      return {
        guid: e.guid,
        pos: e.pos,
        radiusInches: e.radiusInches,
        currentWounds: curW
      };
    });
    const totalRemainingWounds = models.reduce((acc, m) => acc + m.currentWounds, 0);

    return {
      squadKey,
      guid: entries[0].guid || null,
      guids: entries.map(e => e.guid),
      name: unitName,
      side,
      modelCount: models.length,
      totalRemainingWounds,
      woundsPerModel,
      move: primaryDs.move,
      toughness: primaryDs.toughness,
      save: primaryDs.save,
      invuln: primaryDs.invuln,
      fnp: primaryDs.fnp,
      leadership: primaryDs.leadership,
      oc: primaryDs.oc,
      scoutsInches: primaryDs.scoutsInches,
      keywords: primaryDs.keywords,
      weapons: primaryDs.weapons,
      models
    };
  }

  /**
   * Converts a raw TTS `getAllObjects()` snapshot into grouped squads, parsed datasheets & exact distances,
   * filtering out off-mat reserves, `HORDE_TEMPLATE` shelf clones, and non-datasheet LCT props/terrain,
   * and splitting duplicate-datasheet units (`> 6"` apart) into independent `#1`, `#2` squads.
   *
   * @param {object} [rawScan={}] - Raw telemetry payload (`objects`, `playmatBounds`, `spawnZones`).
   * @param {object} [options={}] - Optional `{ hordeFactionName, playmatBounds }` context.
   * @returns {{units: object[], objectives: object[]}} Normalized tabletop telemetry.
   */
  function normalizeTtsBoardScan(rawScan = {}, options = {}) {
    const rawObjects = Array.isArray(rawScan.objects) ? rawScan.objects : [];
    const spawnZones = Array.isArray(rawScan.spawnZones) ? rawScan.spawnZones : [];
    const playmatBounds = rawScan.playmatBounds || options.playmatBounds || null;
    const objectives = [];
    const explicitBuckets = new Map();
    const nameGroups = new Map();

    for (const obj of rawObjects) {
      if (!obj || !obj.name) continue;
      const cleanName = stripTtsMarkup(obj.name);
      if (!cleanName) continue;
      const tags = Array.isArray(obj.tags) ? obj.tags.map(t => String(t).toUpperCase()) : [];

      if (tags.includes('HORDE_TEMPLATE')) continue;

      const pos = obj.pos || { x: 0, y: 0, z: 0 };
      if (playmatBounds) {
        const px = Number(pos.x) || 0;
        const pz = Number(pos.z) || 0;
        if (
          px < playmatBounds.minX ||
          px > playmatBounds.maxX ||
          pz < playmatBounds.minZ ||
          pz > playmatBounds.maxZ
        ) {
          continue;
        }
      }

      const explicitSide = String(obj.side || '').toUpperCase();
      const hasExplicitSide =
        tags.includes('PLAYER') ||
        tags.includes('HORDE') ||
        explicitSide === 'PLAYER' ||
        explicitSide === 'HORDE';

      if (!hasExplicitSide && PROP_NAME_BLACKLIST.test(cleanName)) continue;

      if (tags.includes('OBJECTIVE') || /^(?:objective(?:\s+marker)?|obj)(?:\s*#?\d+)?$/i.test(cleanName)) {
        objectives.push({
          guid: obj.guid || null,
          name: cleanName,
          pos,
          radiusInches: inferBaseRadiusInches({ baseDiameterMm: 40, bounds: obj.bounds })
        });
        continue;
      }

      if (!hasExplicitSide) {
        if (obj.locked === true) continue;
        if (!hasDatasheetSignature(obj.description, obj.gmNotes, cleanName)) continue;
      }

      const ds = parseDatasheetFromTts(obj.description, obj.gmNotes);
      const side = inferSide(obj, ds.keywords, options);
      const parsedName = parseModelNameAndWounds(cleanName);
      const radiusInches = inferBaseRadiusInches(obj);
      const entry = {
        guid: obj.guid,
        pos,
        radiusInches,
        currentWounds: parsedName.currentWounds,
        maxWounds: parsedName.maxWounds,
        baseName: parsedName.baseName,
        side,
        ds
      };

      if (obj.squadId) {
        if (!explicitBuckets.has(obj.squadId)) explicitBuckets.set(obj.squadId, []);
        explicitBuckets.get(obj.squadId).push(entry);
      } else {
        const groupKey = `${side}::${parsedName.baseName}`;
        if (!nameGroups.has(groupKey)) nameGroups.set(groupKey, []);
        nameGroups.get(groupKey).push(entry);
      }
    }

    const rawSquads = [];
    for (const [squadId, entries] of explicitBuckets.entries()) {
      rawSquads.push(buildSquadRecord(squadId, entries[0].baseName, entries[0].side, entries));
    }
    for (const [, entries] of nameGroups.entries()) {
      const baseName = entries[0].baseName;
      const side = entries[0].side;
      const clusters = clusterModelsByCoherency(entries, MAX_COHERENCY_CLUSTER_INCHES);
      if (clusters.length === 1) {
        rawSquads.push(buildSquadRecord(`${side}::${baseName}`, baseName, side, clusters[0]));
      } else {
        clusters.forEach((cluster, idx) => {
          const numberedName = `${baseName} #${idx + 1}`;
          rawSquads.push(buildSquadRecord(`${side}::${numberedName}`, numberedName, side, cluster));
        });
      }
    }

    const units = rawSquads.map(u => {
      const sumX = u.models.reduce((acc, m) => acc + (Number(m.pos.x) || 0), 0);
      const sumZ = u.models.reduce((acc, m) => acc + (Number(m.pos.z) || 0), 0);
      const center = {
        x: Number((sumX / u.modelCount).toFixed(2)),
        z: Number((sumZ / u.modelCount).toFixed(2))
      };
      const inSpawnZone = u.models.every(m => isPointInZones(m.pos, spawnZones)) && spawnZones.length > 0;
      return { ...u, pos: center, inSpawnZone };
    });

    // Compute exact squad-to-objective & squad-to-enemy minimum edge-to-edge distances
    for (const u of units) {
      let closestObj = null;
      for (const o of objectives) {
        let minD = Infinity;
        for (const m of u.models) {
          const d = measureEdgeToEdgeInches(m.pos, m.radiusInches, o.pos, o.radiusInches);
          if (d < minD) minD = d;
        }
        if (!closestObj || minD < closestObj.distanceInches) {
          closestObj = { name: o.name, distanceInches: minD, withinControlRange: minD <= 3.0 };
        }
      }
      u.closestObjective = closestObj;

      let closestEnemy = null;
      for (const other of units) {
        if (other.side === u.side) continue;
        let minEnemyD = Infinity;
        for (const m1 of u.models) {
          for (const m2 of other.models) {
            const d = measureEdgeToEdgeInches(m1.pos, m1.radiusInches, m2.pos, m2.radiusInches);
            if (d < minEnemyD) minEnemyD = d;
          }
        }
        if (!closestEnemy || minEnemyD < closestEnemy.distanceInches) {
          closestEnemy = {
            name: other.name,
            guid: other.guid,
            distanceInches: minEnemyD,
            withinEngagementRange: minEnemyD <= 2.0
          };
        }
      }
      u.closestEnemy = closestEnemy;
    }

    return { units, objectives };
  }

  return {
    MAX_COHERENCY_CLUSTER_INCHES,
    stripTtsMarkup,
    parseModelNameAndWounds,
    parseDatasheetFromTts,
    hasDatasheetSignature,
    inferSide,
    inferBaseRadiusInches,
    measureEdgeToEdgeInches,
    clusterModelsByCoherency,
    normalizeTtsBoardScan
  };
});

````
