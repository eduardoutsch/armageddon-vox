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

  function inferSide(obj) {
    const tags = Array.isArray(obj.tags) ? obj.tags.map(t => String(t).toUpperCase()) : [];
    if (tags.includes('PLAYER') || String(obj.side || '').toUpperCase() === 'PLAYER') return 'PLAYER';
    if (tags.includes('HORDE') || String(obj.side || '').toUpperCase() === 'HORDE') return 'HORDE';
    return 'HORDE';
  }

  /**
   * Converts a raw TTS `getAllObjects()` snapshot into grouped squads, parsed datasheets & exact distances.
   */
  function normalizeTtsBoardScan(rawScan = {}) {
    const rawObjects = Array.isArray(rawScan.objects) ? rawScan.objects : [];
    const spawnZones = Array.isArray(rawScan.spawnZones) ? rawScan.spawnZones : [];
    const objectives = [];
    const squadBuckets = new Map();

    for (const obj of rawObjects) {
      if (!obj || !obj.name) continue;
      const cleanName = stripTtsMarkup(obj.name);
      const tags = Array.isArray(obj.tags) ? obj.tags.map(t => String(t).toUpperCase()) : [];

      if (tags.includes('OBJECTIVE') || /^obj(?:ective)?\b/i.test(cleanName)) {
        objectives.push({
          guid: obj.guid || null,
          name: cleanName,
          pos: obj.pos || { x: 0, y: 0, z: 0 },
          radiusInches: inferBaseRadiusInches({ baseDiameterMm: 40, bounds: obj.bounds })
        });
        continue;
      }

      const side = inferSide(obj);
      const parsedName = parseModelNameAndWounds(cleanName);
      const squadKey = obj.squadId || `${side}::${parsedName.baseName}`;
      const radiusInches = inferBaseRadiusInches(obj);

      if (!squadBuckets.has(squadKey)) {
        const ds = parseDatasheetFromTts(obj.description, obj.gmNotes);
        squadBuckets.set(squadKey, {
          squadKey,
          guid: obj.guid || null,
          guids: [],
          name: parsedName.baseName,
          side,
          modelCount: 0,
          totalRemainingWounds: 0,
          woundsPerModel: parsedName.maxWounds || ds.woundsPerModel || 1,
          move: ds.move,
          toughness: ds.toughness,
          save: ds.save,
          invuln: ds.invuln,
          fnp: ds.fnp,
          leadership: ds.leadership,
          oc: ds.oc,
          scoutsInches: ds.scoutsInches,
          keywords: ds.keywords,
          weapons: ds.weapons,
          models: []
        });
      }

