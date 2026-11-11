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
   * 11th Edition / LCT Dual Unit Coherency bounds (with +0.5" TTS base-placement tolerance):
   *   1. Every model must be within 2" edge-to-edge of another model in the same unit (`2.5"`).
   *   2. Every model must stay within 9" edge-to-edge of the furthest model in the unit (`9.5"`).
   */
  const MAX_COHERENCY_LINK_INCHES = 2.5;
  const MAX_UNIT_SPAN_INCHES = 9.5;
  const MAX_COHERENCY_CLUSTER_INCHES = MAX_COHERENCY_LINK_INCHES;

  /**
   * Extracts an explicit per-squad identity token from `obj.squadId` (e.g. Yellowscribe `unitID`)
   * or a `SQUAD:<id>` TTS tag stamped by `SPAWN_WAVE` or `"Link Selected as Squad"`.
   *
   * @param {object} [obj={}] - Raw TTS object descriptor.
   * @returns {string|null}
   */
  function extractExplicitSquadToken(obj = {}) {
    if (obj.squadId !== undefined && obj.squadId !== null && String(obj.squadId).trim() !== '') {
      return `ID:${String(obj.squadId).trim()}`;
    }
    const tags = Array.isArray(obj.tags) ? obj.tags : [];
    for (const rawTag of tags) {
      const m = String(rawTag || '').trim().match(/^SQUAD:(.+)$/i);
      if (m && m[1].trim()) return `TAG:${m[1].trim()}`;
    }
    return null;
  }

  /**
   * Extracts embarked passenger descriptors (`[{ count, templateName }]`) from an `EMBARKED:<spec>`
   * tag or GM Notes line stamped onto a Transport miniature, keeping passengers off-board until disembarked.
   *
   * @param {object} [obj={}] - Raw TTS object descriptor.
   * @returns {Array<{count: number, templateName: string}>}
   */
  function extractEmbarkedCargo(obj = {}) {
    let rawSpec = '';
    const tags = Array.isArray(obj.tags) ? obj.tags : [];
    for (const t of tags) {
      const m = String(t || '').trim().match(/^EMBARKED:(.+)$/i);
      if (m && m[1].trim()) {
        rawSpec = m[1].trim();
        break;
      }
    }
    if (!rawSpec && obj.gmNotes) {
      const gmMatch = String(obj.gmNotes).match(/EMBARKED:([^\r\n]+)/i);
      if (gmMatch && gmMatch[1].trim()) rawSpec = gmMatch[1].trim();
    }
    if (!rawSpec) return [];

    return rawSpec
      .split(/\s+\+\s+/)
      .map(seg => seg.trim())
      .filter(Boolean)
      .map(seg => {
        const m = seg.match(/^(\d+)x?\s+(.+)$/i);
        return m
          ? { count: Math.max(1, parseInt(m[1], 10)), templateName: m[2].trim() }
          : { count: 1, templateName: seg };
      });
  }

  /**
   * Quantizes a TTS `colorTint` (`"#RRGGBB"` or `{ r, g, b }`) into a stable rim-color bucket so
   * duplicate squads tinted different colors in TTS split automatically even at 0" on first scan.
   *
   * @param {string|object|null} colorTint - Raw TTS color tint.
   * @returns {string}
   */
  function normalizeColorTintKey(colorTint) {
    if (!colorTint) return 'DEFAULT';
    const quant = v => Math.min(255, Math.max(0, Math.round(v / 16) * 16));
    if (typeof colorTint === 'string') {
      const hex = colorTint.trim().replace(/^#/, '').toLowerCase();
      if (/^[0-9a-f]{6}$/.test(hex)) {
        const r = quant(parseInt(hex.slice(0, 2), 16));
        const g = quant(parseInt(hex.slice(2, 4), 16));
        const b = quant(parseInt(hex.slice(4, 6), 16));
        return (r >= 240 && g >= 240 && b >= 240) ? 'DEFAULT' : `TINT:${r}_${g}_${b}`;
      }
      return hex ? `TINT:${hex}` : 'DEFAULT';
    }
    if (typeof colorTint === 'object') {
      const to255 = c => {
        const n = Number(c ?? 1);
        return n <= 1.001 ? n * 255 : n;
      };
      const r = quant(to255(colorTint.r));
      const g = quant(to255(colorTint.g));
      const b = quant(to255(colorTint.b));
      return (r >= 240 && g >= 240 && b >= 240) ? 'DEFAULT' : `TINT:${r}_${g}_${b}`;
    }
    return 'DEFAULT';
  }

  /**
   * Pure 11th Edition coherency partitioner: agglomerates nearest-neighbor models that satisfy BOTH:
   *   - `minEdgeDistance <= maxLinkInches` (`<= 2"` neighbor coherency + 0.5" slack), AND
   *   - `maxEdgeDistance <= maxSpanInches` (`<= 9"` max distance from furthest model in unit + 0.5" slack).
   *
   * Deterministic `(x, z, guid)` seed ordering ensures identical clusters regardless of TTS object order.
   *
   * @param {Array<object>} [models=[]] - Candidate model entries with `pos` and `radiusInches`.
   * @param {number|object} [linkOrOpts={}] - Max link distance number or `{ maxLinkInches, maxSpanInches }`.
   * @returns {Array<Array<object>>} Ordered array of spatial model clusters.
   */
  function clusterModelsByCoherency(models = [], linkOrOpts = {}) {
    if (!Array.isArray(models) || models.length === 0) return [];
    if (models.length === 1) return [[models[0]]];

    const maxLinkInches = typeof linkOrOpts === 'number'
      ? linkOrOpts
      : (linkOrOpts?.maxLinkInches ?? MAX_COHERENCY_LINK_INCHES);
    const maxSpanInches = (typeof linkOrOpts === 'object' && linkOrOpts !== null && linkOrOpts.maxSpanInches !== undefined)
      ? linkOrOpts.maxSpanInches
      : MAX_UNIT_SPAN_INCHES;

    const orderedIndices = models.map((_, i) => i).sort((a, b) => {
      const dx = (Number(models[a].pos?.x) || 0) - (Number(models[b].pos?.x) || 0);
      if (Math.abs(dx) > 1e-4) return dx;
      const dz = (Number(models[a].pos?.z) || 0) - (Number(models[b].pos?.z) || 0);
      if (Math.abs(dz) > 1e-4) return dz;
      return String(models[a].guid || '').localeCompare(String(models[b].guid || ''));
    });

    const assigned = new Array(models.length).fill(false);
    const clusters = [];

    for (const seedIdx of orderedIndices) {
      if (assigned[seedIdx]) continue;
      assigned[seedIdx] = true;
      const cluster = [models[seedIdx]];

      while (true) {
        let bestIdx = -1;
        let bestMinDist = Infinity;

        for (const candIdx of orderedIndices) {
          if (assigned[candIdx]) continue;
          const cand = models[candIdx];
          let minDist = Infinity;
          let maxDist = 0;

          for (const member of cluster) {
            const d = measureEdgeToEdgeInches(member.pos, member.radiusInches, cand.pos, cand.radiusInches);
            if (d < minDist) minDist = d;
            if (d > maxDist) maxDist = d;
          }

          if (minDist <= maxLinkInches && maxDist <= maxSpanInches && minDist < bestMinDist) {
            bestMinDist = minDist;
            bestIdx = candIdx;
          }
        }

        if (bestIdx === -1) break;
        assigned[bestIdx] = true;
        cluster.push(models[bestIdx]);
      }

      clusters.push(cluster);
    }
    return clusters;
  }

  function buildSquadRecord(squadKey, unitName, side, entries, prevPeakModelCount = 0) {
    const countsByBase = new Map();
    for (const e of entries) {
      countsByBase.set(e.baseName, (countsByBase.get(e.baseName) || 0) + 1);
    }
    let majorityBase = entries[0].baseName;
    let majorityCount = 0;
    for (const [bName, cnt] of countsByBase.entries()) {
      if (cnt > majorityCount) {
        majorityCount = cnt;
        majorityBase = bName;
      }
    }

    const majorityEntry = entries.find(
      e => e.baseName === majorityBase && (e.ds.weapons.length > 0 || e.ds.keywords.length > 0)
    ) || entries.find(e => e.baseName === majorityBase) || entries[0];
    const primaryDs = majorityEntry.ds;
    const woundsPerModel = majorityEntry.maxWounds || primaryDs.woundsPerModel || 1;

    const models = entries.map(e => {
      const modelMaxW = e.maxWounds || e.ds.woundsPerModel || woundsPerModel;
      const curW = e.currentWounds !== null ? e.currentWounds : modelMaxW;
      return {
        guid: e.guid,
        pos: e.pos,
        radiusInches: e.radiusInches,
        currentWounds: curW,
        explicitSquadToken: e.explicitSquadToken || null,
        colorTintKey: e.colorTintKey || 'DEFAULT'
      };
    });
    const totalRemainingWounds = models.reduce((acc, m) => acc + m.currentWounds, 0);
    const peakModelCount = Math.max(Number(prevPeakModelCount) || 0, models.length);

    const positiveMoves = entries.map(e => Number(e.ds.move) || 0).filter(m => m > 0);
    const coherentMove = positiveMoves.length > 0 ? Math.min(...positiveMoves) : primaryDs.move;
    const unionKeywords = Array.from(new Set(entries.flatMap(e => e.ds.keywords || [])));

    const weaponMap = new Map();
    for (const e of entries) {
      for (const w of (e.ds.weapons || [])) {
        const wKey = `${w.type}::${String(w.name || '').toLowerCase()}`;
        if (!weaponMap.has(wKey)) weaponMap.set(wKey, w);
      }
    }

    const embarkedCargo = entries.find(e => e.embarkedCargo && e.embarkedCargo.length > 0)?.embarkedCargo || [];
    const embarkedSummary = embarkedCargo.length > 0
      ? embarkedCargo.map(c => `${c.count}x ${c.templateName}`).join(' + ')
      : null;

    return {
      squadKey,
      guid: entries[0].guid || null,
      guids: entries.map(e => e.guid),
      name: unitName,
      side,
      modelCount: models.length,
      peakModelCount,
      totalRemainingWounds,
      woundsPerModel,
      move: coherentMove,
      toughness: primaryDs.toughness,
      save: primaryDs.save,
      invuln: primaryDs.invuln,
      fnp: primaryDs.fnp,
      leadership: primaryDs.leadership,
      oc: primaryDs.oc,
      scoutsInches: primaryDs.scoutsInches,
      keywords: unionKeywords,
      weapons: Array.from(weaponMap.values()),
      embarkedCargo,
      embarkedSummary,
      models
    };
  }

  function stripSquadNumberSuffix(name = '') {
    return String(name || '').replace(/\s+#\d+$/, '').trim();
  }

  /**
   * Evaluates whether an unseen-GUID cluster (`Ctrl+C`/`Ctrl+V` Medipack / Reanimation revival)
   * can legally rejoin an injured locked squad under 11th Ed Dual Coherency (`<= 2"` link and
   * `<= 9"` max unit span) without exceeding `locked.peakModelCount`.
   *
   * @param {object} locked - Locked squad bucket (`{ entries, peakModelCount, colorTintKey }`).
   * @param {Array<object>} candidateCluster - Unseen model entries.
   * @returns {number|null} Closest edge-to-edge link distance in inches if eligible, else `null`.
   */
  function evaluateCoherentRevivalDistance(locked, candidateCluster) {
    if (!locked || !Array.isArray(locked.entries) || locked.entries.length === 0) return null;
    if (!Array.isArray(candidateCluster) || candidateCluster.length === 0) return null;

    const currentCount = locked.entries.length;
    const peak = Math.max(Number(locked.peakModelCount) || currentCount, currentCount);
    if (currentCount + candidateCluster.length > peak) return null;

    const candTint = candidateCluster[0].colorTintKey || 'DEFAULT';
    if (
      locked.colorTintKey &&
      locked.colorTintKey !== 'DEFAULT' &&
      candTint !== 'DEFAULT' &&
      locked.colorTintKey !== candTint
    ) {
      return null;
    }

    const combined = [...locked.entries, ...candidateCluster];
    for (let i = 0; i < combined.length; i++) {
      for (let j = i + 1; j < combined.length; j++) {
        const spanDist = measureEdgeToEdgeInches(
          combined[i].pos,
          combined[i].radiusInches,
          combined[j].pos,
          combined[j].radiusInches
        );
        if (spanDist > MAX_UNIT_SPAN_INCHES) return null;
      }
    }

    let closestLink = Infinity;
    for (const cand of candidateCluster) {
      for (const existing of locked.entries) {
        const d = measureEdgeToEdgeInches(existing.pos, existing.radiusInches, cand.pos, cand.radiusInches);
        if (d < closestLink) closestLink = d;
      }
    }
    return closestLink <= MAX_COHERENCY_LINK_INCHES ? closestLink : null;
  }

  /**
   * Converts a raw TTS `getAllObjects()` snapshot into grouped squads, parsed datasheets & exact distances,
   * filtering out off-mat reserves, `HORDE_TEMPLATE` shelf clones, and non-datasheet LCT props/terrain,
   * while supporting both `PLAYER` and `HORDE` persistent squad identity, multi-wound healing, and model
   * resurrection (dragging slain models back from off-mat via `guidRegistry`, or `Ctrl+C`/`Ctrl+V` cloning
   * up to `peakModelCount` within `<= 2"` / `<= 9"` coherency).
   *
   * @param {object} [rawScan={}] - Raw telemetry payload (`objects`, `playmatBounds`, `spawnZones`).
   * @param {object} [options={}] - Optional `{ hordeFactionName, playmatBounds, previousUnits, guidRegistry }` context.
   * @returns {{units: object[], objectives: object[], guidRegistry: object}} Normalized tabletop telemetry.
   */
  function normalizeTtsBoardScan(rawScan = {}, options = {}) {
    const rawObjects = Array.isArray(rawScan.objects) ? rawScan.objects : [];
    const spawnZones = Array.isArray(rawScan.spawnZones) ? rawScan.spawnZones : [];
    const playmatBounds = rawScan.playmatBounds || options.playmatBounds || null;
    const objectives = [];
    const scannedEntries = [];
    const nameGroups = new Map();

    const prevGuidMap = new Map();
    const incomingRegistry = (options.guidRegistry && typeof options.guidRegistry === 'object')
      ? options.guidRegistry
      : {};
    for (const [g, info] of Object.entries(incomingRegistry)) {
      if (g && info && info.squadKey) {
        prevGuidMap.set(g, { ...info });
      }
    }

    const previousUnits = Array.isArray(options.previousUnits) ? options.previousUnits : [];
    for (const pu of previousUnits) {
      if (!pu || !pu.squadKey) continue;
      const puBaseName = stripSquadNumberSuffix(pu.name);
      const numMatch = String(pu.name || '').match(/#(\d+)$/);
      const squadNum = numMatch ? parseInt(numMatch[1], 10) : null;
      const guids = Array.isArray(pu.guids)
        ? pu.guids
        : (Array.isArray(pu.models) ? pu.models.map(m => m.guid) : []);
      const peakModelCount = Math.max(Number(pu.peakModelCount) || 0, guids.length);
      for (const g of guids) {
        if (g) {
          const existing = prevGuidMap.get(g);
          prevGuidMap.set(g, {
            squadKey: pu.squadKey,
            name: pu.name || puBaseName,
            baseName: puBaseName,
            side: pu.side,
            squadNum: squadNum ?? existing?.squadNum ?? null,
            peakModelCount: Math.max(existing?.peakModelCount || 0, peakModelCount),
            explicitSquadToken: existing?.explicitSquadToken || null,
            colorTintKey: existing?.colorTintKey || 'DEFAULT'
          });
        }
      }
    }

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
      scannedEntries.push({
        guid: obj.guid,
        pos,
        radiusInches,
        currentWounds: parsedName.currentWounds,
        maxWounds: parsedName.maxWounds,
        baseName: parsedName.baseName,
        groupBaseName: parsedName.baseName,
        side,
        ds,
        explicitSquadToken: extractExplicitSquadToken(obj),
        embarkedCargo: extractEmbarkedCargo(obj),
        rawSquadId: obj.squadId ? String(obj.squadId).trim() : null,
        colorTintKey: normalizeColorTintKey(obj.colorTint)
      });
    }

    // Resolve cross-datasheet Attached Units (`5 Kill Team + 1 Watch Master`) sharing a SQUAD token or locked GUID
    const tokenBuckets = new Map();
    for (const e of scannedEntries) {
      if (!e.explicitSquadToken) continue;
      const tKey = `${e.side}::${e.explicitSquadToken}`;
      if (!tokenBuckets.has(tKey)) tokenBuckets.set(tKey, []);
      tokenBuckets.get(tKey).push(e);
    }
    for (const bucket of tokenBuckets.values()) {
      const counts = new Map();
      for (const e of bucket) counts.set(e.baseName, (counts.get(e.baseName) || 0) + 1);
      if (counts.size > 1) {
        const compositeName = Array.from(counts.entries())
          .sort((a, b) => b[1] - a[1])
          .map(([bName]) => bName)
          .join(' + ');
        for (const e of bucket) e.groupBaseName = compositeName;
      }
    }
    const prevAttachedBuckets = new Map();
    for (const e of scannedEntries) {
      if (e.groupBaseName !== e.baseName) continue;
      const prev = e.guid ? prevGuidMap.get(e.guid) : null;
      if (prev && prev.side === e.side && String(prev.baseName || '').includes(' + ')) {
        if (!prevAttachedBuckets.has(prev.squadKey)) prevAttachedBuckets.set(prev.squadKey, []);
        prevAttachedBuckets.get(prev.squadKey).push({ entry: e, prevBaseName: prev.baseName });
      }
    }
    for (const list of prevAttachedBuckets.values()) {
      const survivingBases = new Set(list.map(x => x.entry.baseName));
      if (survivingBases.size > 1) {
        for (const item of list) item.entry.groupBaseName = item.prevBaseName;
      }
    }
    for (const e of scannedEntries) {
      const groupKey = `${e.side}::${e.groupBaseName}`;
      if (!nameGroups.has(groupKey)) nameGroups.set(groupKey, []);
      nameGroups.get(groupKey).push(e);
    }

    const rawSquads = [];
    for (const [, entries] of nameGroups.entries()) {
      const baseName = entries[0].groupBaseName;
      const side = entries[0].side;
      const manualOverrideMap = new Map();
      const lockedMap = new Map();
      const unseenBuckets = new Map();

      for (const e of entries) {
        const prev = e.guid ? prevGuidMap.get(e.guid) : null;
        const isManualReLink =
          prev &&
          e.explicitSquadToken &&
          !e.explicitSquadToken.startsWith('TAG:WAVE_') &&
          e.explicitSquadToken !== prev.explicitSquadToken;

        if (isManualReLink) {
          if (!manualOverrideMap.has(e.explicitSquadToken)) manualOverrideMap.set(e.explicitSquadToken, []);
          manualOverrideMap.get(e.explicitSquadToken).push(e);
          continue;
        }

        if (prev && prev.side === side && prev.baseName === baseName) {
          if (!lockedMap.has(prev.squadKey)) {
            lockedMap.set(prev.squadKey, {
              entries: [],
              squadNum: prev.squadNum,
              peakModelCount: prev.peakModelCount || 1,
              colorTintKey: e.colorTintKey || prev.colorTintKey || 'DEFAULT',
              rawSquadId: e.rawSquadId || null
            });
          }
          lockedMap.get(prev.squadKey).entries.push(e);
          continue;
        }

        const unseenKey = e.explicitSquadToken || e.colorTintKey || 'DEFAULT';
        if (!unseenBuckets.has(unseenKey)) unseenBuckets.set(unseenKey, []);
        unseenBuckets.get(unseenKey).push(e);
      }

      const freshClusters = [];
      for (const [bucketKey, bucketEntries] of unseenBuckets.entries()) {
        const isManualOrYsId = bucketKey.startsWith('ID:') || (bucketKey.startsWith('TAG:') && !bucketKey.startsWith('TAG:WAVE_'));
        const subClusters = isManualOrYsId ? [bucketEntries] : clusterModelsByCoherency(bucketEntries);

        for (const sc of subClusters) {
          // Check if this unseen cluster is a Ctrl+C/Ctrl+V Medipack / Reanimation revival for an injured locked squad
          let bestLocked = null;
          let bestDist = Infinity;
          for (const locked of lockedMap.values()) {
            const reviveDist = evaluateCoherentRevivalDistance(locked, sc);
            if (reviveDist !== null && reviveDist < bestDist) {
              bestDist = reviveDist;
              bestLocked = locked;
            }
          }
          if (bestLocked) {
            bestLocked.entries.push(...sc);
          } else {
            freshClusters.push({ entries: sc, squadNum: null, peakModelCount: sc.length, rawSquadId: sc[0].rawSquadId });
          }
        }
      }

      const clusterDescriptors = [];
      for (const [, bucket] of manualOverrideMap.entries()) {
        clusterDescriptors.push({ entries: bucket, squadNum: null, peakModelCount: bucket.length, rawSquadId: bucket[0].rawSquadId });
      }
      for (const [, locked] of lockedMap.entries()) {
        clusterDescriptors.push({
          entries: locked.entries,
          squadNum: locked.squadNum,
          peakModelCount: locked.peakModelCount,
          rawSquadId: locked.rawSquadId
        });
      }
      clusterDescriptors.push(...freshClusters);

      if (clusterDescriptors.length === 1 && clusterDescriptors[0].squadNum === null) {
        const desc = clusterDescriptors[0];
        const sqKey = desc.rawSquadId || `${side}::${baseName}`;
        rawSquads.push(buildSquadRecord(sqKey, baseName, side, desc.entries, desc.peakModelCount));
      } else {
        const usedNums = new Set(
          clusterDescriptors.map(c => c.squadNum).filter(n => Number.isInteger(n) && n >= 1)
        );
        let nextNum = 1;
        for (const desc of clusterDescriptors) {
          let num = desc.squadNum;
          if (!num) {
            while (usedNums.has(nextNum)) nextNum += 1;
            num = nextNum;
            usedNums.add(num);
          }
          const numberedName = `${baseName} #${num}`;
          const sqKey = desc.rawSquadId || `${side}::${numberedName}`;
          rawSquads.push(buildSquadRecord(sqKey, numberedName, side, desc.entries, desc.peakModelCount));
        }
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

    const updatedGuidRegistry = {};
    for (const [g, info] of prevGuidMap.entries()) {
      updatedGuidRegistry[g] = { ...info };
    }
    for (const u of units) {
      const uBaseName = stripSquadNumberSuffix(u.name);
      const uNumMatch = String(u.name || '').match(/#(\d+)$/);
      const uSquadNum = uNumMatch ? parseInt(uNumMatch[1], 10) : null;
      for (const m of u.models) {
        if (!m.guid) continue;
        updatedGuidRegistry[m.guid] = {
          squadKey: u.squadKey,
          name: u.name,
          baseName: uBaseName,
          side: u.side,
          squadNum: uSquadNum,
          peakModelCount: u.peakModelCount,
          explicitSquadToken: m.explicitSquadToken || null,
          colorTintKey: m.colorTintKey || 'DEFAULT'
        };
      }
      for (const info of Object.values(updatedGuidRegistry)) {
        if (info && info.squadKey === u.squadKey) {
          info.name = u.name;
          info.squadNum = uSquadNum;
          info.peakModelCount = Math.max(Number(info.peakModelCount) || 0, u.peakModelCount);
        }
      }
    }

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

    return { units, objectives, guidRegistry: updatedGuidRegistry };
  }

  return {
    MAX_COHERENCY_LINK_INCHES,
    MAX_UNIT_SPAN_INCHES,
    MAX_COHERENCY_CLUSTER_INCHES,
    stripTtsMarkup,
    parseModelNameAndWounds,
    parseDatasheetFromTts,
    hasDatasheetSignature,
    inferSide,
    extractExplicitSquadToken,
    extractEmbarkedCargo,
    normalizeColorTintKey,
    inferBaseRadiusInches,
    measureEdgeToEdgeInches,
    clusterModelsByCoherency,
    evaluateCoherentRevivalDistance,
    normalizeTtsBoardScan
  };
});

