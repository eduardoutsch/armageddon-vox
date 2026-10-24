// PRNG & Seed Hashing Engine

/**
 * 32-bit FNV-1a hash algorithm for deterministic string-to-integer hashing.
 */
function hashString(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  }
  return h >>> 0;
}

/**
 * Mulberry32 32-bit Pseudo-Random Number Generator.
 * Returns a generator function yielding uniform floats in [0, 1).
 */
function mulberry32(a) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/**
 * Seeded Fisher-Yates shuffle that immutably returns a new shuffled array.
 */
function seededShuffle(arr, rng) {
  let copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Expanded pool of 60 Warhammer 40,000 & Armageddon Crusade room code prefixes.
 */
const ROOM_CODE_PREFIXES = [
  "HADES", "ASH", "GATE", "THOR", "VULK", "SKULL", "WARP", "IRON", "PYRE", "HIVE",
  "GOLGOTHA", "ACHERON", "INFERNUS", "TARTARUS", "TEMPESTORA", "HELSREACH", "VOLCANUS",
  "PALATINE", "KRIEG", "VARKAN", "EXILE", "JUNEBUG", "YARRICK", "GRIMALDUS", "ANGRON",
  "KHORNE", "MALEFACTOR", "SANCTUARY", "BASTION", "VANGUARD", "BASILISK", "BANEBLADE",
  "VALKYRIE", "DREAD", "RELIC", "CHIMERA", "VANQUISHER", "ROGAL", "MORTAR", "TRENCH",
  "BUNKER", "SIEGE", "AUSPEX", "VOX", "ORBITAL", "VOID", "NECRON", "TYRANID",
  "DAEMON", "MARAUDER", "DESECRATOR", "GATEBREAKER", "SECTOR", "CITADEL", "PROMETHIUM",
  "OBSIDIAN", "SULFUR", "CINDER", "REDANGEL", "WRATH"
];

/**
 * Generates a thematic room code like HADES-42 or HELSREACH-84.
 */
function generateRandomCode() {
  const prevCode = (typeof document !== 'undefined' && document.getElementById('seedInput')?.value)
    ? document.getElementById('seedInput').value.trim().toUpperCase()
    : '';
  let code = '';
  for (let attempt = 0; attempt < 10; attempt++) {
    const p = ROOM_CODE_PREFIXES[Math.floor(Math.random() * ROOM_CODE_PREFIXES.length)];
    const n = Math.floor(10 + Math.random() * 90);
    code = `${p}-${n}`;
    if (code !== prevCode) break;
  }
  if (typeof document !== 'undefined') {
    const el = document.getElementById('seedInput');
    if (el) {
      el.value = code;
      if (typeof window !== 'undefined' && typeof window.onRoomCodeChanged === 'function') {
        window.onRoomCodeChanged();
      }
    }
  }
  return code;
}

// Dual export for Node.js test runner and browser global scope
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    hashString,
    mulberry32,
    seededShuffle,
    generateRandomCode,
    ROOM_CODE_PREFIXES
  };
}

