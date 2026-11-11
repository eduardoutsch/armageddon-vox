// Spawner and Bracket Evaluation Engine

const DOWN_MAP = {
  '13+': '10-12',
  '10-12': '7-9',
  '10+': '7-9',
  '7-9': '5-6',
  '5-6': '3-4'
};

const LABEL_MAP = {
  '10-12': { label: 'Bracket [10–12] (Rolled Down x2)', pts: '301–550 pts each' },
  '10+': { label: 'Bracket [10–12] (Rolled Down x2)', pts: '301–550 pts each' },
  '7-9': { label: 'Bracket [7–9] (Rolled Down x2)', pts: '151–300 pts each' },
  '5-6': { label: 'Bracket [5–6] (Rolled Down x2)', pts: '76–150 pts each' },
  '3-4': { label: 'Bracket [3–4] (Rolled Down x2)', pts: '0–75 pts each' }
};

/**
 * Evaluates the spawn bracket from the 2D6 roll and modified total.
 * Rules: Unmodified 2 is always No Spawn. Modified <= 2 is No Spawn.
 * 3–4: 0–75 pts | 5–6: 76–150 pts | 7–9: 151–300 pts | 10–12: 301–550 pts | 13+: 551+ pts
 */
function getBracketInfo(modRoll, unmodRoll) {
  if (unmodRoll === 2 || modRoll <= 2) {
    return { key: 'NONE', label: 'No Spawn (Roll of 2)', pts: '0 pts' };
  }
  if (modRoll <= 4) return { key: '3-4', label: 'Bracket [3–4]', pts: '0–75 pts' };
  if (modRoll <= 6) return { key: '5-6', label: 'Bracket [5–6]', pts: '76–150 pts' };
  if (modRoll <= 9) return { key: '7-9', label: 'Bracket [7–9]', pts: '151–300 pts' };
  if (modRoll <= 12) return { key: '10-12', label: 'Bracket [10–12]', pts: '301–550 pts' };
  return { key: '13+', label: 'Bracket [13+]', pts: '551+ pts' };
}

/**
 * Calculates the next bracket down when a player triggers a Roll Down.
 * Returns null if the bracket cannot be rolled down (NONE or 3-4).
 */
function calculateRollDown(bracketKey) {
  const nextKey = DOWN_MAP[bracketKey];
  if (!nextKey) return null;
  return {
    nextKey,
    bracketLabel: LABEL_MAP[nextKey].label,
    pts: LABEL_MAP[nextKey].pts
  };
}

/**
 * Pure helper: parses a single chosen spawn wave string into structured TTS spawn descriptors.
 * Convention:
 *   - '+' separates multiple units spawned together (e.g. "5 Bladeguard Veterans + 1 Captain")
 *   - Leading number or dice expression sets model count (e.g. "10 Boyz", "1D3 Chaos Spawns", "D3+1 Scarabs")
 *   - Optional "[Count Unit]" suffix tags embarked transport passengers (e.g. "1 Chimera [10 Kasrkin]")
 *
 * @param {string} entryStr - Chosen spawn option from a bracket.
 * @param {function(): number} [rng=Math.random] - Random float generator in [0, 1).
 * @returns {Array<{count: number, countExpr: string, templateName: string, embarked: object|null}>}
 */
function splitTopLevelWaveUnits(str) {
  const parts = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (ch === '[') depth++;
    else if (ch === ']' && depth > 0) depth--;
    else if (ch === '+' && depth === 0) {
      const before = str.slice(start, i);
      const after = str.slice(i + 1);
      const isDiceBonus = /(?:^|\s)\d*d\d+\s*$/i.test(before) && /^\s*\d+\s+\S/.test(after);
      if (!isDiceBonus) {
        parts.push(before.trim());
        start = i + 1;
      }
    }
  }
  parts.push(str.slice(start).trim());
  return parts.filter(Boolean);
}

function parseSpawnWaveSpec(entryStr, rng = Math.random) {
  if (!entryStr || typeof entryStr !== 'string') return [];
  const trimmed = entryStr.trim();
  if (!trimmed || trimmed === 'None' || trimmed.startsWith('⚠️') || trimmed.startsWith('Unit from Bracket')) {
    return [];
  }

  return splitTopLevelWaveUnits(trimmed)
    .map(sub => parseSingleUnitToken(sub, rng))
    .filter(Boolean);
}

/**
 * Pure helper: parses an individual unit token (including optional embarked passengers and dice/integer counts).
 *
 * @param {string} token - Single unit segment from a wave option.
 * @param {function(): number} [rng=Math.random] - Random float generator in [0, 1).
 * @returns {{count: number, countExpr: string, templateName: string, embarked: object|null}|null}
 */
function parseSingleUnitToken(token, rng = Math.random) {
  let working = String(token || '').trim();
  if (!working) return null;

  let embarked = null;
  const embarkedMatch = working.match(/\[([^\]]+)\]\s*$/);
  if (embarkedMatch) {
    working = working.slice(0, embarkedMatch.index).trim();
    embarked = parseSingleUnitToken(embarkedMatch[1], rng);
  }

  // Match dice count (e.g., "1D3", "2D6+2", "D3") or integer count (e.g., "10", "10x")
  const diceMatch = working.match(/^(\d*)d(\d+)(?:\s*\+\s*(\d+))?\s+(.+)$/i);
  if (diceMatch) {
    const numDice = diceMatch[1] ? parseInt(diceMatch[1], 10) : 1;
    const sides = parseInt(diceMatch[2], 10);
    const flatBonus = diceMatch[3] ? parseInt(diceMatch[3], 10) : 0;
    let total = flatBonus;
    for (let i = 0; i < numDice; i++) {
      total += Math.floor(rng() * sides) + 1;
    }
    const expr = `${numDice}D${sides}${flatBonus ? '+' + flatBonus : ''}`;
    return {
      count: Math.max(1, total),
      countExpr: expr,
      templateName: diceMatch[4].trim(),
      embarked
    };
  }

  const intMatch = working.match(/^(\d+)x?\s+(.+)$/i);
  if (intMatch) {
    return {
      count: Math.max(1, parseInt(intMatch[1], 10)),
      countExpr: intMatch[1],
      templateName: intMatch[2].trim(),
      embarked
    };
  }

  return {
    count: 1,
    countExpr: '1',
    templateName: working,
    embarked
  };
}

/**
 * Picks a unit strictly from the active faction's shelf pool (zero hardcoded fallbacks).
 *
 * @param {string} bracketKey - Evaluated spawn bracket key ('3-4', '5-6', '7-9', '10-12', '13+').
 * @param {function(): number} rng - Random float generator in [0, 1).
 * @param {object|null} [customPoolMap=null] - Optional explicit bracket map override for pure tests.
 * @returns {string} Chosen unit wave entry or explicit empty-pool warning.
 */
function pickSyncedUnitFromBracket(bracketKey, rng, customPoolMap = null) {
  const mapKey = bracketKey === '3-4' ? 'b34'
    : bracketKey === '5-6' ? 'b56'
    : bracketKey === '7-9' ? 'b79'
    : (bracketKey === '10+' || bracketKey === '10-12') ? 'b10'
    : 'b13';

  let raw = '';
  let activeFaction = '';
  if (typeof document !== 'undefined') {
    activeFaction = document.getElementById('hordeFactionSelect')?.value || '';
  }

  if (customPoolMap && customPoolMap[bracketKey] !== undefined) {
    raw = customPoolMap[bracketKey];
  } else if (typeof localStorage !== 'undefined') {
    try {
      const saved = localStorage.getItem('foa_custom_shelf_pool_v1');
      if (saved) {
        const p = JSON.parse(saved);
        if (activeFaction) {
          const facPool = (p && p.byFaction && p.byFaction[activeFaction]) ? p.byFaction[activeFaction] : {};
          raw = facPool[mapKey] || '';
        } else if (p && !p.byFaction && p[mapKey]) {
          raw = p[mapKey];
        }
      }
    } catch (e) {}
  }

  const list = String(raw || '').split(',').map(s => s.trim()).filter(Boolean);
  if (list.length === 0) {
    return activeFaction
      ? `⚠️ ${activeFaction} Pool Empty for Bracket [${bracketKey}] — Configure in Mode 4!`
      : "Unit from Bracket [" + bracketKey + "]";
  }
  return list[Math.floor(rng() * list.length)];
}

if (typeof window !== 'undefined') {
  window.parseSpawnWaveSpec = parseSpawnWaveSpec;
}

// Dual export for Node.js test runner and browser global scope
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DOWN_MAP,
    LABEL_MAP,
    getBracketInfo,
    calculateRollDown,
    pickSyncedUnitFromBracket,
    parseSpawnWaveSpec
  };
}
