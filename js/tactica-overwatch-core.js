/**
 * @fileoverview Fires of Armageddon // Live Overwatch Referee & Crusade Handoff Pure Core
 *
 * Pure Functional Core module (zero DOM, network, filesystem, or local PRNG dependencies):
 * - Deterministic spoken voice-command intent mapping for hands-free TTS table control
 * - Multimodal 3D ruin Line-of-Sight prompt builder & structured JSON verdict parser
 * - 6+ Warp-Breach Intrusion detector & multi-conduit Vox emergency payload builder
 * - Post-Match `foa_horde_battle_stats_v1` snapshot compiler for Mode 5 (`pages/crusade.html`)
 */

(function (root, factory) {
  const exports = factory();
  if (typeof root !== 'undefined') Object.assign(root, exports);
  if (typeof module !== 'undefined' && module.exports) module.exports = exports;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {

  /** Maps YOUR active Commander theme (never the enemy Horde) to a clean neural Auspex voice. */
  const AUSPEX_VOICE_PRESETS = {
    votann:    { voice: 'en-GB-RyanNeural',   rate: '+4%', pitch: '-2Hz', label: 'Brôkhyr Helm-Auspex' },
    militarum: { voice: 'en-GB-SoniaNeural',  rate: '+5%', pitch: '+0Hz', label: 'Orbital Tactica Auspex' },
    necron:    { voice: 'en-GB-ThomasNeural', rate: '+2%', pitch: '-3Hz', label: 'Cryptek Engram Auspex' },
    default:   { voice: 'en-GB-RyanNeural',   rate: '+4%', pitch: '+0Hz', label: 'Tactical Auspex' }
  };

  /**
   * Resolves the neural Auspex voice preset for the player's active Commander theme.
   *
   * @param {string} [theme='default'] - Active Commander faction theme (`votann`, `militarum`, `necron`, `default`).
   * @returns {{voice: string, rate: string, pitch: string, label: string}}
   */
  function resolveTacticalAuspexVoice(theme = 'default') {
    return AUSPEX_VOICE_PRESETS[String(theme || '').toLowerCase()] || AUSPEX_VOICE_PRESETS.default;
  }

  /** Canonical 11th Ed Core Stratagems declared vocally by the Player. */
  const PLAYER_VOCAL_STRATAGEMS = [
    { key: 'FIRE_OVERWATCH',      name: 'Fire Overwatch',      cpCost: 1, pattern: /\b(fire\s+overwatch|pop(?:ping)?\s+overwatch|use\s+overwatch)\b/i },
    { key: 'RAPID_INGRESS',       name: 'Rapid Ingress',       cpCost: 1, minRound: 2, pattern: /\b(rapid\s+ingress)\b/i },
    { key: 'SMOKESCREEN',         name: 'Smokescreen',         cpCost: 1, buff: { hitMod: -1, cover: true }, pattern: /\b(smokescreen|pop(?:ping)?\s+smoke)\b/i },
    { key: 'GO_TO_GROUND',        name: 'Go to Ground',        cpCost: 1, buff: { cover: true, invuln6: true }, pattern: /\b(go(?:ing)?\s+to\s+ground)\b/i },
    { key: 'HEROIC_INTERVENTION', name: 'Heroic Intervention', cpCost: 1, pattern: /\b(heroic\s+intervention)\b/i },
    { key: 'COUNTER_OFFENSIVE',   name: 'Counter-Offensive',   cpCost: 2, pattern: /\b(counter[\s-]*offensive)\b/i },
    { key: 'COMMAND_REROLL',      name: 'Command Re-roll',     cpCost: 1, pattern: /\b(command\s+re[\s-]*roll)\b/i },
    { key: 'TANK_SHOCK',          name: 'Crushing Impact',     cpCost: 1, pattern: /\b(tank\s+shock|crushing\s+impact)\b/i },
    { key: 'GRENADE',             name: 'Explosives',          cpCost: 1, pattern: /\b(throw\s+grenades?|use\s+grenades?|explosives\s+strat(?:agem)?)\b/i },
    { key: 'INSANE_BRAVERY',      name: 'Insane Bravery',      cpCost: 1, pattern: /\b(insane\s+bravery)\b/i },
    { key: 'EPIC_CHALLENGE',      name: 'Epic Challenge',      cpCost: 1, pattern: /\b(epic\s+challenge)\b/i }
  ];

  const SPOKEN_NUM_MAP = {
    zero: '0', free: '0', one: '1', won: '1', two: '2', to: '2', too: '2', three: '3'
  };

  const CORE_STRAT_NAMES = {
    FIRE_OVERWATCH: 'Fire Overwatch',
    RAPID_INGRESS: 'Rapid Ingress',
    SMOKESCREEN: 'Smokescreen',
    GO_TO_GROUND: 'Go to Ground',
    HEROIC_INTERVENTION: 'Heroic Intervention',
    COUNTER_OFFENSIVE: 'Counter-Offensive',
    COMMAND_REROLL: 'Command Re-roll',
    CRUSHING_IMPACT: 'Crushing Impact',
    EXPLOSIVES: 'Explosives',
    INSANE_BRAVERY: 'Insane Bravery',
    EPIC_CHALLENGE: 'Epic Challenge'
  };

  /**
   * Maps normalized spoken/typed Stratagem text to a canonical 11th Edition Core key or `FACTION_CUSTOM`.
   *
   * @param {string} [name=''] - Candidate Stratagem name.
   * @returns {string} Canonical Core Stratagem key or `'FACTION_CUSTOM'`.
   */
  function normalizeCoreStratKey(name = '') {
    const s = name.toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
    if (/\boverwatch\b/.test(s)) return 'FIRE_OVERWATCH';
    if (/\brapid ingress\b/.test(s)) return 'RAPID_INGRESS';
    if (/\bsmoke\s*screen\b|\bpop(?:ping)?\s+smoke\b|\bsmoke\b/.test(s)) return 'SMOKESCREEN';
    if (/\bgo(?:ing)? to ground\b/.test(s)) return 'GO_TO_GROUND';
    if (/\bheroic intervention\b/.test(s)) return 'HEROIC_INTERVENTION';
    if (/\bcounter offensive\b/.test(s)) return 'COUNTER_OFFENSIVE';
    if (/\bcommand re roll\b|\breroll\b/.test(s)) return 'COMMAND_REROLL';
    if (/\btank shock\b|\bcrushing impact\b/.test(s)) return 'CRUSHING_IMPACT';
    if (/\bgrenades?\b|\bexplosives\b/.test(s)) return 'EXPLOSIVES';
    if (/\binsane bravery\b/.test(s)) return 'INSANE_BRAVERY';
    if (/\bepic challenge\b/.test(s)) return 'EPIC_CHALLENGE';
    return 'FACTION_CUSTOM';
  }

  /**
   * Infers common defensive buffs from Faction Stratagem names (e.g., Void Armour / Armour of Contempt).
   *
   * @param {string} [stratName=''] - Faction Stratagem display name.
   * @returns {object|null} Defensive buff descriptor or `null`.
   */
  function inferFactionStratBuff(stratName = '') {
    if (/\b(void\s+armou?r|armou?r\s+of\s+contempt|reinforced\s+armou?r)\b/i.test(stratName)) {
      return { worsenAp: 1 };
    }
    return null;
  }

  /**
   * Parses Core & Faction-Specific Stratagem declarations such as:
   *   - `"strategem Void Armour on Hearthguard - 2cp"`
   *   - `"Stratagem Ancestral Sentence on Pioneers, one CP"`
   *   - `"Using Void Armour for 1 CP"` / `"Spend 2 CP on Reactive Reprisal"`
   *   - `"Fire Overwatch on Yaegirs"` (uses Core 1 CP default, or explicit override like `"- 0cp"`)
   *
   * @param {string} [rawInput=''] - Raw spoken or typed text.
   * @returns {object|null} Structured `PLAYER_STRATAGEM` descriptor or `null` when not a Stratagem.
   */
  function parsePlayerStratagem(rawInput = '') {
    let text = String(rawInput || '').trim();
    if (!text) return null;

    // Normalize spoken number words right before "CP" (e.g. "two CP" -> "2 CP")
    text = text.replace(/\b(zero|free|one|won|two|to|too|three)\s*(?=cp\b|command\s+points?\b)/gi, (_, word) => SPOKEN_NUM_MAP[word.toLowerCase()] + ' ');

    let explicitCp = null;
    const cpMatch = text.match(/(?:[-–—,]|for|\bwith)?\s*(\d+)\s*(?:cp|command\s+points?)\b/i);
    if (cpMatch) {
      explicitCp = parseInt(cpMatch[1], 10);
      text = (text.slice(0, cpMatch.index) + ' ' + text.slice(cpMatch.index + cpMatch[0].length)).trim();
    }

    const hasStratPrefix = /^(?:use\s+|using\s+|pop(?:ping)?\s+|spend(?:ing)?\s+|declare\s+|activate\s+)?strat[ae]gem\b/i.test(text);
    const stripped = text
      .replace(/^(?:use\s+|using\s+|pop(?:ping)?\s+|spend(?:ing)?\s+(?:on\s+|for\s+)?|declare\s+|activate\s+)?(?:strat[ae]gem\s+)?/i, '')
      .replace(/[-–—,\s]+$/, '')
      .trim();

    let rawName = stripped;
    let targetUnit = null;
    const onMatch = stripped.match(/^(.+?)\s+\bon\s+(.+)$/i);
    if (onMatch) {
      rawName = onMatch[1].replace(/[-–—,\s]+$/, '').trim();
      targetUnit = onMatch[2].replace(/[-–—,\s]+$/, '').trim();
    }

    const coreKey = normalizeCoreStratKey(rawName);
    if (coreKey === 'FACTION_CUSTOM' && !hasStratPrefix && explicitCp === null) {
      return null;
    }

    switch (coreKey) {
      case 'COUNTER_OFFENSIVE':
        return { intent: 'PLAYER_STRATAGEM', category: 'CORE', stratKey: coreKey, stratName: 'Counter-Offensive', targetUnit, cpCost: explicitCp ?? 2, minRound: 1, buff: null };
      case 'RAPID_INGRESS':
        return { intent: 'PLAYER_STRATAGEM', category: 'CORE', stratKey: coreKey, stratName: 'Rapid Ingress', targetUnit, cpCost: explicitCp ?? 1, minRound: 2, buff: null };
      case 'SMOKESCREEN':
        return { intent: 'PLAYER_STRATAGEM', category: 'CORE', stratKey: coreKey, stratName: 'Smokescreen', targetUnit, cpCost: explicitCp ?? 1, minRound: 1, buff: { hitMod: -1, cover: true } };
      case 'GO_TO_GROUND':
        return { intent: 'PLAYER_STRATAGEM', category: 'CORE', stratKey: coreKey, stratName: 'Go to Ground', targetUnit, cpCost: explicitCp ?? 1, minRound: 1, buff: { cover: true, invuln6: true } };
      case 'FIRE_OVERWATCH':
      case 'HEROIC_INTERVENTION':
      case 'COMMAND_REROLL':
      case 'CRUSHING_IMPACT':
      case 'EXPLOSIVES':
      case 'INSANE_BRAVERY':
      case 'EPIC_CHALLENGE': {
        const pretty = CORE_STRAT_NAMES[coreKey] || rawName.replace(/\b\w/g, c => c.toUpperCase());
        return { intent: 'PLAYER_STRATAGEM', category: 'CORE', stratKey: coreKey, stratName: pretty, targetUnit, cpCost: explicitCp ?? 1, minRound: 1, buff: null };
      }
      default: {
        const cleanFactionStrat = rawName.replace(/\b\w/g, c => c.toUpperCase()) || 'Faction Stratagem';
        return {
          intent: 'PLAYER_STRATAGEM',
          category: 'FACTION',
          stratKey: 'FACTION_CUSTOM',
          stratName: cleanFactionStrat,
          targetUnit,
          cpCost: explicitCp ?? 1,
          minRound: 1,
          buff: inferFactionStratBuff(cleanFactionStrat)
        };
      }
    }
  }

  /**
   * Fuzzy-matches a spoken target keyword (e.g. `"Hearthguard"`, `"Pioneers"`) strictly against
   * scanned `PLAYER` squads on the LCT playmat (`Einhyr Hearthguard`, `Hernkyn Pioneers`).
   *
   * @param {string|null} [rawTarget=''] - Spoken or selected target name.
   * @param {Array<object>} [boardUnits=[]] - Scanned board telemetry units.
   * @returns {object|null} Matched `PLAYER` unit entry or `null`.
   */
  function matchPlayerUnitFromTelemetry(rawTarget = '', boardUnits = []) {
    const query = String(rawTarget || '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
    if (!query || !Array.isArray(boardUnits)) return null;
    const playerUnits = boardUnits.filter(u => u && u.side === 'PLAYER');
    if (playerUnits.length === 0) return null;

    for (const u of playerUnits) {
      const uNorm = String(u.name || '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
      if (uNorm === query || uNorm.includes(query) || query.includes(uNorm)) return u;
    }

    const qTokens = query.split(' ').filter(t => t.length >= 3);
    for (const u of playerUnits) {
      const uNorm = String(u.name || '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
      if (qTokens.some(tok => uNorm.includes(tok))) return u;
    }
    return null;
  }

  /**
   * Pure rule validator checking Misery #22 (Comms Jammed), minimum Battle Round, and available CP,
   * while computing whether the activation increments `stratCount` for Secret Objective #20 (Tacticool).
   *
   * @param {object} stratParsed - Output from `parsePlayerStratagem`.
   * @param {object} [state={}] - Live Tactica match state.
   * @returns {{allowed: boolean, reason: string|null, countsForSecret20: boolean}}
   */
  function validatePlayerStratagemUse(stratParsed, state = {}) {
    if (!stratParsed) return { allowed: false, reason: 'Invalid Stratagem.', countsForSecret20: false };
    const miseryIds = Array.isArray(state.activeMiseryIds) ? state.activeMiseryIds.map(Number) : [];
    if (miseryIds.includes(22)) {
      return { allowed: false, reason: 'Comms Jammed (Misery #22 active — Stratagems are locked this round).', countsForSecret20: false };
    }
    const minRound = Number(stratParsed.minRound) || 1;
    const curRound = Math.max(1, Number(state.battleRound) || 1);
    if (curRound < minRound) {
      return { allowed: false, reason: `${stratParsed.stratName} cannot be used before Battle Round ${minRound}.`, countsForSecret20: false };
    }
    const cost = Math.max(0, Number(stratParsed.cpCost) || 0);
    const availCp = Math.max(0, Number(state.playerCp) || 0);
    if (availCp < cost) {
      return { allowed: false, reason: `Insufficient Command Points for ${stratParsed.stratName} (requires ${cost} CP, ${availCp} CP available).`, countsForSecret20: false };
    }
    return { allowed: true, reason: null, countsForSecret20: cost >= 1 };
  }

  /** Declarative lookup table mapping spoken tabletop commands to deterministic console actions. */
  const VOICE_INTENT_RULES = [
    { intent: 'SCAN_BOARD', pattern: /\b(scan\b.*boards?|update\s+auspex|board\s+scan)\b/i },
    { intent: 'SPAWN_WAVES', pattern: /\b(drop\b.*spawns?|spawn\s+waves?|deploy\s+waves?)\b/i },
    { intent: 'REVERT_LAST_MOVE', pattern: /\b(revert\b.*moves?|undo\s+moves?|move\s+back)\b/i },
    { intent: 'LOCK_MOVEMENT', pattern: /\b(lock\s+move\w*|open\s+overwatch|check\s+overwatch|end\s+horde\s+move\w*)\b/i },
    { intent: 'MOVE_HORDE', pattern: /\b(move\b.*horde|horde\s+move\w*)\b/i },
    { intent: 'SELECT_SHOOTING', pattern: /\b(compute\s+shoot\w*|shooting\s+priority|target\s+priority|roll\s+shoot\w*)\b/i },
    { intent: 'DECLARE_CHARGES', pattern: /\b(declare\s+charges?|horde\s+charges?)\b/i },
    { intent: 'CONSOLIDATE', pattern: /\b(consolidate|consolidation)\b/i },
    { intent: 'PASS_REACTION', pattern: /\b(pass\s+window|hold\s+cp|decline\s+reaction|pass\s+reaction)\b/i },
    { intent: 'VISUAL_LOS_CHECK', pattern: /\b(line\s+of\s+sight|\blos\b|can\s+.+\s+see|visible|ruin\s+window)\b/i }
  ];

  /**
   * Maps a spoken or typed transcript to a deterministic console command, `PLAYER_STRATAGEM`, or `VISUAL_LOS_CHECK`.
   *
   * @param {string} [transcript=''] - Raw voice or typed text query.
   * @returns {object}
   */
  function parseSpokenTacticaIntent(transcript = '') {
    const clean = String(transcript || '').trim();
    if (!clean) return { intent: 'NONE', transcript: '' };
    for (const rule of VOICE_INTENT_RULES) {
      if (rule.pattern.test(clean)) {
        return { intent: rule.intent, transcript: clean };
      }
    }
    const strat = parsePlayerStratagem(clean);
    if (strat) {
      return { ...strat, transcript: clean };
    }
    for (const s of PLAYER_VOCAL_STRATAGEMS) {
      if (s.pattern.test(clean)) {
        return {
          intent: 'PLAYER_STRATAGEM',
          category: 'CORE',
          stratKey: s.key,
          stratName: s.name,
          targetUnit: null,
          cpCost: s.cpCost,
          minRound: s.minRound || 1,
          buff: s.buff || null,
          transcript: clean
        };
      }
    }
    return { intent: 'VISUAL_LOS_CHECK', transcript: clean };
  }

  /**
   * Builds a compact multimodal 11th Edition 40k Line-of-Sight verification prompt combining
   * exact LCT Lua miniature coordinates with active Misery overrides.
   *
   * @param {object} [state={}] - Live Tactica match state.
   * @param {string} [transcript=''] - Player's specific 3D LOS question.
   * @returns {string} Structured prompt for Gemini Vision refereeing.
   */
  function buildLosVerificationPrompt(state = {}, transcript = '') {
    const miseryIds = Array.isArray(state.activeMiseryIds) ? state.activeMiseryIds.map(Number) : [];
    const flyToweringActive = miseryIds.includes(28);
    const units = (state.boardTelemetry?.units || []).map(u => {
      const kws = Array.isArray(u.keywords) ? u.keywords.join(',') : '';
      const stealth = u.isGoneToGround ? ' [GoneToGround<=12"]' : (u.isHidden ? ' [Hidden<=15"]' : '');
      return `${u.squadKey || u.name} (${u.side}) @ (${u.pos?.x ?? 0}, ${u.pos?.z ?? 0}) [${kws}]${stealth}`;
    }).join('; ');

    const moves = (state.lastMovementPlans || []).map(p =>
      `${p.squadKey}: ${p.unitName} -> ${p.goalName || 'Hold'} @ (${p.targetX ?? 0}, ${p.targetZ ?? 0})`
    ).join('; ');

    return [
      'You are the 11th Edition Warhammer 40,000 Visual Line-of-Sight Referee for Automated Horde Mode on Tabletop Simulator (LCT map).',
      '11th Ed Rules: Solid features block LOS through windows/gaps <=3" from ground; Obscuring blocks LOS across footprint; Hidden caps visibility at 15" (Gone to Ground 12").',
      flyToweringActive ? 'ACTIVE OVERRIDE: Misery #28 (They Fly Now) grants Horde units FLY/TOWERING and ignores all terrain for ranged visibility!' : 'Misery #28 is NOT active.',
      `Board Units: ${units || 'None scanned'}`,
      `Recent Horde Moves: ${moves || 'None'}`,
      `Player Query: "${String(transcript || 'Verify true 3D line of sight for moved Horde units.').trim()}"`,
      'Respond ONLY with a single JSON object matching: {"losBlocked":boolean,"revertSquadKey":string|null,"blockedPairs":["HORDE::Unit->PLAYER::Unit"],"spokenReply":"concise 1-sentence ruling"}.'
    ].join('\n');
  }

  /**
   * Pure helper: strips Gemini Web UI accessibility headers ("O Gemini disse", "Gemini said"),
   * code-fence chrome ("Copiar código", "Copy code", "JSON"), and Notebook citation chips.
   *
   * @param {string} [rawText=''] - Raw DOM text extracted from a Gemini `<model-response>` node.
   * @returns {string} Cleaned model text without UI chrome.
   */
  function scrubGeminiThreadArtifacts(rawText = '') {
    if (!rawText) return '';
    return String(rawText)
      .replace(/(?:O Gemini disse|Gemini said)\s*:?/gi, '')
      .replace(/(?:Mostrar pensamento|Ocultar pensamento|Show thinking|Hide thinking)\s*:?/gi, '')
      .replace(/\[cite:\s*[\d,\s]+\]/gi, '')
      .replace(/[ \t]*\bMD\b(?:\s*\+\s*\d+)?/g, '')
      .replace(/^\s*\+\s*\d+\s*$/gm, '')
      .replace(/^\s*(?:Plaintext|Texto simples|Text|Markdown|JSON|Copy code|Copiar código)\s*$/gim, '')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  /**
   * Pure helper: detects whether extracted Gemini Web text is still an interim thinking/loading
   * status (e.g. `<model-thoughts>` header or active Stop button) rather than the final reply.
   *
   * @param {string} [cleanedText=''] - Text after `scrubGeminiThreadArtifacts`.
   * @param {{isGenerating?: boolean}} [meta={}] - Live DOM streaming metadata.
   * @returns {boolean} True when the poller must keep waiting instead of returning early.
   */
  function isGeminiInterimThinkingText(cleanedText = '', meta = {}) {
    if (meta && meta.isGenerating) return true;
    const trimmed = scrubGeminiThreadArtifacts(cleanedText);
    if (!trimmed) return true;
    if (
      trimmed.length < 180 &&
      /^(?:processing:|thinking\b|pensando\b|analisando\b|searching\b|buscando\b|conectando\b|connecting\b|loading\b|carregando\b|determining\b|checking\b|verifying\b|analyzing\b|reading\b|looking\s+up\b|consulting\b)/i.test(trimmed)
    ) {
      return true;
    }
    return false;
  }

  /**
   * Parses a structured JSON (or fenced JSON) Overwatch verdict with graceful prose fallback.
   *
   * @param {string} [rawResponse=''] - Model response string.
   * @returns {{losBlocked: boolean, revertSquadKey: string|null, blockedPairs: string[], spokenReply: string}}
   */
  function parseOverwatchVerdict(rawResponse = '') {
    const raw = scrubGeminiThreadArtifacts(rawResponse);
    if (!raw) {
      return { losBlocked: false, revertSquadKey: null, blockedPairs: [], spokenReply: 'No Overwatch response received.' };
    }

    const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
    const candidate = fenceMatch ? fenceMatch[1].trim() : raw;
    const braceStart = candidate.indexOf('{');
    const braceEnd = candidate.lastIndexOf('}');

    if (braceStart !== -1 && braceEnd > braceStart) {
      try {
        const parsed = JSON.parse(candidate.slice(braceStart, braceEnd + 1));
        return {
          losBlocked: Boolean(parsed.losBlocked),
          revertSquadKey: parsed.revertSquadKey ? String(parsed.revertSquadKey) : null,
          blockedPairs: Array.isArray(parsed.blockedPairs) ? parsed.blockedPairs.map(String) : [],
          spokenReply: String(parsed.spokenReply || (parsed.losBlocked ? 'Line of sight blocked.' : 'Line of sight confirmed.')).trim()
        };
      } catch (e) {}
    }

    const impliedBlocked = /\b(no\s+line\s+of\s+sight|blocked|cannot\s+see|obscured)\b/i.test(raw);
    return {
      losBlocked: impliedBlocked,
      revertSquadKey: null,
      blockedPairs: [],
      spokenReply: raw.slice(0, 240)
    };
  }

  /**
   * Builds a concise spoken callout when a Player Stratagem Reaction Window opens.
   *
   * @param {object} win - Reaction window descriptor from `detectPlayerReactionWindow`.
   * @returns {string} Spoken sentence or empty string when closed.
   */
  function buildReactionVoiceCallout(win) {
    if (!win || !win.open) return '';
    const names = (win.eligibleStratagems || []).map(s => s.name.split('(')[0].trim()).join(' or ');
    return `${win.title}. You have ${win.playerCp} Command Points. ${names} available.`;
  }

  /**
   * Filters synced `zoneSpawns` for Big-Bracket (`[10-12]` / `[13+]`) waves that rolled `6+` Intrusion.
   *
   * @param {Array<object>} [zoneSpawns=[]] - Active round zone spawns.
   * @returns {Array<object>} Zones triggering a 6+ Warp-Breach Intrusion.
   */
  function detectActiveIntrusionZones(zoneSpawns = []) {
    if (!Array.isArray(zoneSpawns)) return [];
    return zoneSpawns.filter(z =>
      z && (z.bracketKey === '10-12' || z.bracketKey === '13+') && Number(z.intrusionRoll) >= 6
    );
  }

  /**
   * Formats an emergency 6+ Horde Warp-Breach Intrusion dispatch for Conduit Alpha, Beta, Gamma, or Distant.
   *
   * @param {object} [params={}] - Intrusion context (`zoneNum`, `bracketLabel`, `channel`, `roomCode`, `battleRound`, `factionName`).
   * @returns {string} Formatted Astropathic Vox payload.
   */
  function buildIntrusionVoxPayload(params = {}) {
    const zoneNum = Number(params.zoneNum) || 1;
    const rawBracket = String(params.bracketLabel || '[10–12]');
    const cleanBracket = rawBracket.startsWith('Bracket') ? rawBracket : `Bracket ${rawBracket}`;
    const chan = params.channel || 'alpha';
    const room = String(params.roomCode || 'HADES-1').trim().toUpperCase();
    const round = Number(params.battleRound) || 1;
    const fac = params.factionName || 'Horde';

    if (chan === 'distant') {
      return [
        '+++ ORBITAL AUGUR ARRAY // DISTANT WARP-BREACH ADVERSARY DETECTED +++',
        `• MODE & ROOM SEED: Mode 1 (Distant Solo Horde Breach // Room: ${room} // Battle Round ${round})`,
        `• THEATRE & SENSOR SWEEP: Distant Sector Grid ${zoneNum} // Orbital Augur Intercept (Neither Main Player Fielded)`,
        `• REMOTE SECTOR & BRACKET: Distant Spawn Zone ${zoneNum} rolled ${cleanBracket} + [6+ WARP-BREACH INTRUSION]!`,
        `• ACTIVE DISTANT ENEMY FACTION: ${fac}`,
        '• REQUEST FOR CAMPAIGN MASTER: Execute the Contextual 3-Tier Intrusion Roll (NEMESIS.md) for this remote sector and broadcast the telemetry intercept to BOTH command networks!'
      ].join('\n');
    }

    if (chan === 'gamma') {
      return [
        '+++ FANE-NODE VÔL-09 // SEISMIC WARP-BREACH INTRUSION ALERT +++',
        `• MODE & ROOM SEED: Mode 1 (Solo Kindred Holdout // Room: ${room} // Battle Round ${round})`,
        `• TELEMETRY SOURCE: SUB-THERMOSPHERIC GRUDGE-AUGUR [KÂHL HÂRKYN // NEEDGAÂRD OATHBAND]`,
        `• BREACH VECTOR: Spawn Zone ${zoneNum} rolled ${cleanBracket} + [6+ WARP-BREACH INTRUSION] against ${fac}!`,
        '• REQUEST FOR FANE-NODE VÔL-09: Execute the Contextual 3-Tier Intrusion Roll (NEMESIS.md) and output a Pattern 3 Seismic Grudge-Warrant with exact TTS miniature spawn instructions!'
      ].join('\n');
    }

    const isBeta = chan === 'beta';
    return [
      '+++ EMERGENCY AUSPEX PING: HORDE WARP-BREACH INTRUSION DETECTED +++',
      `• MODE & ROOM SEED: Mode 1 (Horde Command // Room: ${room} // Battle Round ${round})`,
      isBeta
        ? '• TELEMETRY SOURCE: TOMB-SHIP OMNICIDAL AUSPEX [PHAERON JUNEBUG]'
        : '• TELEMETRY SOURCE: MUNITORUM PERIMETER AUGUR [THE EXILE // 044TH KRIEG]',
      `• BREACH VECTOR: Spawn Zone ${zoneNum} rolled ${cleanBracket} + [6+ WARP-BREACH INTRUSION] against ${fac}!`,
      isBeta
        ? '• REQUEST FOR TOMB-SHIP MASTER MATRIX: Execute the Contextual 3-Tier Intrusion Roll (NEMESIS.md) and output a Pattern 3 Threat Manifestation Warrant with exact TTS miniature to spawn!'
        : '• REQUEST FOR CAMPAIGN MASTER: Execute the Contextual 3-Tier Intrusion Roll (NEMESIS.md) and output a Pattern 3 Ordo Malleus Threat Warrant with exact TTS miniature to spawn!'
    ].join('\n');
  }

  /**
   * Compiles live Tactica state + Round 1–6 chronicle into `foa_horde_battle_stats_v1` for Mode 5 (`crusade.html`).
   *
   * @param {object} [state={}] - Live Tactica match state.
   * @param {Array<object>} [chronicleEntries=[]] - Persisted Round 1–6 chronicle entries.
   * @param {object} [spawnerSession={}] - Optional Mode 1 `foa_horde_session_v1` object for secondary/secret card merge.
   * @returns {object} `foa_horde_battle_stats_v1` telemetry snapshot.
   */
  function compileTacticaCrusadeSnapshot(state = {}, chronicleEntries = [], spawnerSession = {}) {
    let chronicleUnitWipes = 0;
    let chronicleStrats = 0;

    for (const e of (chronicleEntries || [])) {
      if (!e) continue;
      if (e.type === 'AUTO_DEFENDER' && e.details?.outcome?.unitDestroyed) {
        chronicleUnitWipes += 1;
      }
      if ((e.type === 'REACTION' || e.type === 'STRATAGEM') && !/passed\s+reaction/i.test(e.summary || '') && !/\(-?0\s*CP\)/i.test(e.summary || '')) {
        chronicleStrats += 1;
      }
    }

    const spLeft = Number(state.playerSp ?? spawnerSession.sp ?? 0);
    const spSpent = Number(spawnerSession.spSpentThisRound ?? spawnerSession.spSpent ?? 0);
    const spEarned = Math.max(Number(spawnerSession.spEarned || 0), spLeft + spSpent);
    const isSolo = spawnerSession.selectedModeVal === 'solo' || spawnerSession.isSoloMode !== false;

    const miseriesDrawn = Array.isArray(spawnerSession.activeMiseries) && spawnerSession.activeMiseries.length > 0
      ? spawnerSession.activeMiseries.map(m => ({ id: m.id, name: m.name || `Misery #${m.id}` }))
      : (state.activeMiseryIds || []).map(id => ({ id, name: `Misery #${id}` }));

    return {
      hordeKills: Math.max(chronicleUnitWipes, Number(spawnerSession.hordeKills) || 0),
      spEarned,
      spSpent,
      leftoverSp: spLeft,
      leftoverCp: Number(state.playerCp ?? spawnerSession.cp ?? 0),
      stratagemsUsed: Math.max(chronicleStrats, Number(spawnerSession.stratCount) || 0),
      roundsPlayed: Math.max(1, Number(state.battleRound) || 1),
      hordeFaction: state.factionName || spawnerSession.activeHordeFactionName || 'Unknown Faction',
      roomSeed: String(state.roomCode || spawnerSession.seed || 'HADES-1').trim().toUpperCase(),
      gameMode: isSolo ? 'SOLO' : 'CO-OP',
      miseriesDrawn,
      miseriesNullified: Number(spawnerSession.miseriesNullified) || 0,
      secondariesCompleted: Array.isArray(spawnerSession.secondariesCompleted) ? spawnerSession.secondariesCompleted : [],
      secondariesFailed: Array.isArray(spawnerSession.secondariesFailed) ? spawnerSession.secondariesFailed : [],
      secretObjective: spawnerSession.activeCard || null,
      fortifications: Array.isArray(state.activeFortifications) ? state.activeFortifications : [],
      hordeWarlord: state.hordeWarlord || null,
      timestamp: Date.now()
    };
  }

  return {
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
  };
});
