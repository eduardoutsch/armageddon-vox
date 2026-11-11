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

