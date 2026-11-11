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

