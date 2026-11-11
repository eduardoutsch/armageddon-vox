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

 */
function pickSyncedUnitFromBracket(bracketKey, rng, customPoolMap = null) {
  const idMap = { '3-4': 'pool34', '5-6': 'pool56', '7-9': 'pool79', '10+': 'pool10', '10-12': 'pool10', '13+': 'pool13' };
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
      const saved = localStorage.getItem('foa_custom_shelf_pool_v1') || localStorage.getItem('armageddon_horde_pool');
      if (saved) {
        const p = JSON.parse(saved);
        if (activeFaction && p.byFaction) {
          const facPool = p.byFaction[activeFaction] || {};
          raw = facPool[mapKey] || '';
        } else if (!p.byFaction && p[mapKey]) {
          raw = p[mapKey];
        }
      }
    } catch (e) {}
  }
  if (!raw && typeof document !== 'undefined') {
    const el = document.getElementById(idMap[bracketKey]) || document.getElementById('rosterPool' + mapKey.slice(1));
    raw = el ? (el.value || '') : '';
  }

  // Canonical default faction spawn table fallback from js/data.js
  const tables = (typeof HORDE_FACTION_SPAWN_TABLES !== 'undefined')
    ? HORDE_FACTION_SPAWN_TABLES
    : (typeof window !== 'undefined' && window.HORDE_FACTION_SPAWN_TABLES ? window.HORDE_FACTION_SPAWN_TABLES : null);

  if (!raw && activeFaction && tables && tables[activeFaction]) {
    const defaultUnits = tables[activeFaction][mapKey];
    if (Array.isArray(defaultUnits) && defaultUnits.length > 0) {
      raw = defaultUnits.join(', ');
    } else if (typeof defaultUnits === 'string') {
      raw = defaultUnits;
    }
  }

  const list = raw.split(',').map(s => s.trim()).filter(Boolean);
  if (list.length === 0) {
    return activeFaction
      ? `⚠️ ${activeFaction} Pool Empty for Bracket [${bracketKey}] — Configure in Mode 4!`
      : "Unit from Bracket [" + bracketKey + "]";
  }
  return list[Math.floor(rng() * list.length)];
}

// Dual export for Node.js test runner and browser global scope
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DOWN_MAP,
    LABEL_MAP,
    getBracketInfo,
    calculateRollDown,
    pickSyncedUnitFromBracket
  };
}
