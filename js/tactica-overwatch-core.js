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
    { intent: 'USE_FIRE_OVERWATCH', pattern: /\b(fire\s+overwatch|use\s+overwatch)\b/i },
    { intent: 'USE_HEROIC_INTERVENTION', pattern: /\b(heroic\s+intervention)\b/i },
    { intent: 'USE_COUNTER_OFFENSIVE', pattern: /\b(counter[\s-]*offensive)\b/i },
    { intent: 'PASS_REACTION', pattern: /\b(pass\s+window|hold\s+cp|decline\s+reaction|pass\s+reaction)\b/i },
    { intent: 'VISUAL_LOS_CHECK', pattern: /\b(line\s+of\s+sight|\blos\b|can\s+.+\s+see|visible|ruin\s+window)\b/i }
  ];

  /**
   * Maps a spoken or typed transcript to a deterministic console command or `VISUAL_LOS_CHECK`.
   *
   * @param {string} [transcript=''] - Raw voice or typed text query.
   * @returns {{intent: string, transcript: string}}
   */
  function parseSpokenTacticaIntent(transcript = '') {
    const clean = String(transcript || '').trim();
    if (!clean) return { intent: 'NONE', transcript: '' };
    for (const rule of VOICE_INTENT_RULES) {
      if (rule.pattern.test(clean)) {
        return { intent: rule.intent, transcript: clean };
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
   * Parses a structured JSON (or fenced JSON) Overwatch verdict with graceful prose fallback.
   *
   * @param {string} [rawResponse=''] - Model response string.
   * @returns {{losBlocked: boolean, revertSquadKey: string|null, blockedPairs: string[], spokenReply: string}}
   */
  function parseOverwatchVerdict(rawResponse = '') {
    const raw = String(rawResponse || '').trim();
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
      if (e.type === 'REACTION' && !/passed\s+reaction/i.test(e.summary || '')) {
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
    parseSpokenTacticaIntent,
    buildLosVerificationPrompt,
    parseOverwatchVerdict,
    buildReactionVoiceCallout,
    detectActiveIntrusionZones,
    buildIntrusionVoxPayload,
    compileTacticaCrusadeSnapshot
  };
});
