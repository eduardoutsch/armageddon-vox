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

