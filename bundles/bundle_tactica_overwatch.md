# 📦 Fires of Armageddon // Bundle: Live Screen & Mic Overwatch Referee & Crusade Handoff

Pure voice-command intent parser, multimodal 3D ruin LOS prompt/verdict helpers, Gemini thinking/artifact scrubbers, 6+ Warp-Breach Intrusion alerts, Mode 5 Crusade snapshot compiler, browser screen/mic shell, and unit tests (`js/tactica-overwatch-core.js`, `js/tactica-overwatch.js`, `tests/js/tactica-overwatch-core.test.js`).

## 📑 Table of Contents
- [js/tactica-overwatch-core.js](#file-jstacticaoverwatchcorejs)
- [js/tactica-overwatch.js](#file-jstacticaoverwatchjs)
- [tests/js/tactica-overwatch-core.test.js](#file-testsjstacticaoverwatchcoretestjs)

---

## File: `js/tactica-overwatch-core.js` <a id="file-jstacticaoverwatchcorejs"></a>

````javascript
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
    scrubGeminiThreadArtifacts,
    isGeminiInterimThinkingText,
    parseOverwatchVerdict,
    buildReactionVoiceCallout,
    detectActiveIntrusionZones,
    buildIntrusionVoxPayload,
    compileTacticaCrusadeSnapshot
  };
});
````

---

## File: `js/tactica-overwatch.js` <a id="file-jstacticaoverwatchjs"></a>

````javascript
/**
 * @fileoverview Fires of Armageddon // Live Screen & Microphone Overwatch Imperative Shell
 *
 * Humble View adapter managing:
 * - On-demand TTS window frame capture (`getDisplayMedia` -> offscreen JPEG canvas)
 * - Push-to-talk Web Speech microphone input & spoken tactical callouts (`speechSynthesis`)
 * - 6+ Big-Bracket Warp-Breach Intrusion alerts & 1-click Vox emergency dispatch
 * - 1-click post-match telemetry export to Mode 5 Crusade (`foa_horde_battle_stats_v1`)
 */

(function (root, factory) {
  const exports = factory();
  if (typeof root !== 'undefined') Object.assign(root, exports);
  if (typeof module !== 'undefined' && module.exports) module.exports = exports;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {

  const DAEMON_URL = 'http://127.0.0.1:3030';
  let screenStream = null;
  let screenVideoEl = null;
  let voiceOutputEnabled = true;
  let lastAnnouncedReactionKey = '';
  let lastSirenSignature = '';

  function speakOverwatchLine(text) {
    if (!voiceOutputEnabled || !text || typeof window === 'undefined') return false;
    if (window.speechSynthesis && typeof window.speechSynthesis.speak === 'function' && typeof SpeechSynthesisUtterance === 'function') {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 1.04;
      utter.pitch = 0.92;
      window.speechSynthesis.speak(utter);
      return true;
    }
    return false;
  }

  function toggleOverwatchVoiceOutput() {
    voiceOutputEnabled = !voiceOutputEnabled;
    const btn = typeof document !== 'undefined' ? document.getElementById('btnToggleOverwatchTts') : null;
    if (btn) btn.textContent = voiceOutputEnabled ? '🔊 Voice Readout: ON' : '🔇 Voice Readout: MUTE';
    return voiceOutputEnabled;
  }

  async function toggleTtsScreenCapture() {
    const statusEl = typeof document !== 'undefined' ? document.getElementById('overwatchScreenStatus') : null;
    if (screenStream) {
      screenStream.getTracks().forEach(t => t.stop());
      screenStream = null;
      if (statusEl) statusEl.textContent = '📷 Screen Share: Disconnected';
      return false;
    }
    if (typeof navigator === 'undefined' || !navigator.mediaDevices || typeof navigator.mediaDevices.getDisplayMedia !== 'function') {
      if (statusEl) statusEl.textContent = '⚠️ Screen Share unavailable in this browser';
      return false;
    }
    screenStream = await navigator.mediaDevices.getDisplayMedia({ video: { cursor: 'always' }, audio: false });
    if (typeof document !== 'undefined' && typeof document.createElement === 'function') {
      screenVideoEl = document.createElement('video');
      screenVideoEl.srcObject = screenStream;
      screenVideoEl.muted = true;
      if (typeof screenVideoEl.play === 'function') await screenVideoEl.play().catch(() => {});
    }
    if (statusEl) statusEl.textContent = '🟢 Screen Share: Locked on TTS Window';
    return true;
  }

  function captureSingleScreenFrameBase64() {
    if (!screenStream || !screenVideoEl || typeof document === 'undefined' || typeof document.createElement !== 'function') {
      return null;
    }
    const w = screenVideoEl.videoWidth || 1280;
    const h = screenVideoEl.videoHeight || 720;
    const canvas = document.createElement('canvas');
    canvas.width = Math.min(1280, w);
    canvas.height = Math.round((canvas.width / w) * h);
    const ctx = canvas.getContext && canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(screenVideoEl, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.72);
  }

  async function runOverwatchLosCheck(explicitQuery) {
    const inp = typeof document !== 'undefined' ? document.getElementById('overwatchQueryInput') : null;
    const query = (explicitQuery !== undefined ? explicitQuery : (inp?.value || '')).trim();
    if (inp && explicitQuery === undefined) inp.value = '';

    const outBox = typeof document !== 'undefined' ? document.getElementById('overwatchVerdictBox') : null;
    const imageBase64 = captureSingleScreenFrameBase64();

    try {
      const res = await fetch(`${DAEMON_URL}/overwatch/los-check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: query, imageBase64, mimeType: 'image/jpeg', autoRevert: true })
      });
      const data = await res.json();
      if (outBox && data.verdict) {
        outBox.innerHTML = `<strong>👁️ Overwatch Referee (${data.mode}):</strong> ${data.verdict.spokenReply}`;
      }
      if (data.verdict?.spokenReply) speakOverwatchLine(data.verdict.spokenReply);
      if (typeof window !== 'undefined' && typeof window.refreshDaemonState === 'function') {
        await window.refreshDaemonState();
      }
      return data.verdict;
    } catch (e) {
      const fallbackMsg = 'Overwatch daemon offline — run `npm run tactica:daemon` for live Gemini Vision LOS checks, or use [↩️ Revert Move] above.';
      if (outBox) outBox.innerHTML = `<strong>👁️ Overwatch Referee (offline):</strong> ${fallbackMsg}`;
      return { losBlocked: false, revertSquadKey: null, blockedPairs: [], spokenReply: fallbackMsg };
    }
  }

  async function dispatchSpokenOrTypedCommand(rawTranscript) {
    const parsed = parseSpokenTacticaIntent(rawTranscript);
    if (parsed.intent === 'NONE') return parsed;

    const w = typeof window !== 'undefined' ? window : globalThis;
    if (parsed.intent === 'SCAN_BOARD' && typeof w.requestTtsBoardScan === 'function') await w.requestTtsBoardScan();
    else if (parsed.intent === 'SPAWN_WAVES' && typeof w.triggerAutopilotSpawnWaves === 'function') await w.triggerAutopilotSpawnWaves();
    else if (parsed.intent === 'MOVE_HORDE' && typeof w.triggerAutopilotMovement === 'function') await w.triggerAutopilotMovement();
    else if (parsed.intent === 'REVERT_LAST_MOVE' && typeof w.revertAutopilotSquadMove === 'function') await w.revertAutopilotSquadMove(0);
    else if (parsed.intent === 'LOCK_MOVEMENT' && typeof w.setConsolePhaseAndTrigger === 'function') await w.setConsolePhaseAndTrigger('HORDE_MOVEMENT', 'END_OF_HORDE_MOVEMENT');
    else if (parsed.intent === 'SELECT_SHOOTING' && typeof w.triggerAutopilotShooting === 'function') await w.triggerAutopilotShooting();
    else if (parsed.intent === 'DECLARE_CHARGES' && typeof w.triggerAutopilotCharges === 'function') await w.triggerAutopilotCharges();
    else if (parsed.intent === 'CONSOLIDATE' && typeof w.triggerAutopilotConsolidate === 'function') await w.triggerAutopilotConsolidate();
    else if (parsed.intent === 'USE_FIRE_OVERWATCH' && typeof w.resolveConsoleReaction === 'function') await w.resolveConsoleReaction('FIRE_OVERWATCH', 1);
    else if (parsed.intent === 'USE_HEROIC_INTERVENTION' && typeof w.resolveConsoleReaction === 'function') await w.resolveConsoleReaction('HEROIC_INTERVENTION', 1);
    else if (parsed.intent === 'USE_COUNTER_OFFENSIVE' && typeof w.resolveConsoleReaction === 'function') await w.resolveConsoleReaction('COUNTER_OFFENSIVE', 2);
    else if (parsed.intent === 'PASS_REACTION' && typeof w.resolveConsoleReaction === 'function') await w.resolveConsoleReaction('PASS', 0);
    else {
      await runOverwatchLosCheck(parsed.transcript);
    }

    syncOverwatchAlertsFromState();
    return parsed;
  }

  function startPushToTalkMic() {
    if (typeof window === 'undefined') return false;
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const outBox = typeof document !== 'undefined' ? document.getElementById('overwatchVerdictBox') : null;
    if (!SR) {
      if (outBox) outBox.innerHTML = '⚠️ Web Speech API mic not supported in this browser; type commands in the box instead.';
      return false;
    }
    const rec = new SR();
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    if (outBox) outBox.innerHTML = '🎙️ Listening... speak a command or LOS question now.';
    rec.onresult = (ev) => {
      const spoken = ev.results?.[0]?.[0]?.transcript || '';
      dispatchSpokenOrTypedCommand(spoken);
    };
    rec.start();
    return true;
  }

  function syncOverwatchAlertsFromState() {
    const w = typeof window !== 'undefined' ? window : globalThis;
    const state = typeof w.getTacticaClientState === 'function' ? w.getTacticaClientState() : null;
    if (!state) return;

    // 1. Voice reaction callout
    const win = state.pendingReactionWindow;
    if (win && win.open) {
      const rKey = `${state.battleRound}_${win.triggerKey}_${win.playerCp}`;
      if (rKey !== lastAnnouncedReactionKey) {
        lastAnnouncedReactionKey = rKey;
        speakOverwatchLine(buildReactionVoiceCallout(win));
      }
    }

    // 2. Render 6+ Big-Bracket Warp-Breach Intrusion alerts
    const intBox = typeof document !== 'undefined' ? document.getElementById('tacticaIntrusionAlertBox') : null;
    const breaches = detectActiveIntrusionZones(state.zoneSpawns || []);
    if (intBox) {
      if (breaches.length === 0) {
        intBox.classList.add('hidden');
        intBox.innerHTML = '';
      } else {
        intBox.classList.remove('hidden');
        const sig = breaches.map(b => `${b.waveId || b.zone}:${b.intrusionRoll}`).join('|');
        if (sig !== lastSirenSignature) {
          lastSirenSignature = sig;
          const hasApex13 = breaches.some(b => b.bracketKey === '13+' || /13\+/.test(String(b.bracketLabel || '')));
          if (w.VoxAudio) {
            if (hasApex13 && typeof w.VoxAudio.playWarpSiren === 'function') {
              w.VoxAudio.playWarpSiren();
            } else if (!hasApex13 && typeof w.VoxAudio.playUnboundBreachAlert === 'function') {
              w.VoxAudio.playUnboundBreachAlert();
            } else if (typeof w.VoxAudio.playWarpSiren === 'function') {
              w.VoxAudio.playWarpSiren();
            }
          }
          speakOverwatchLine(`Warning! Warp-Breach Intrusion detected in Spawn Zone ${breaches[0].zone}!`);
        }
        intBox.innerHTML = breaches.map(b => `
          <div style="margin-bottom:6px;">
            <strong style="color:var(--red);">⚡ WARP-BREACH INTRUSION (D6 = ${b.intrusionRoll}) — Spawn Zone ${b.zone} • ${b.bracketLabel}</strong>
            <div style="display:flex; gap:6px; flex-wrap:wrap; margin-top:6px;">
              <button type="button" class="btn-red btn-sm" onclick="pingIntrusionFromTactica(${b.zone}, '${b.bracketLabel}', 'alpha')">📡 Ping Vox (Alpha)</button>
              <button type="button" class="btn-ghost btn-sm" onclick="pingIntrusionFromTactica(${b.zone}, '${b.bracketLabel}', 'beta')">📡 Ping Vox (Beta)</button>
              <button type="button" class="btn-ghost btn-sm" onclick="pingIntrusionFromTactica(${b.zone}, '${b.bracketLabel}', 'gamma')">📡 Ping Vox (Gamma)</button>
              <button type="button" class="btn-ghost btn-sm" onclick="pingIntrusionFromTactica(${b.zone}, '${b.bracketLabel}', 'distant')">🛰️ Ping Vox (Distant)</button>
            </div>
          </div>
        `).join('');
      }
    }
  }

  function pingIntrusionFromTactica(zoneNum, bracketLabel, channel) {
    const w = typeof window !== 'undefined' ? window : globalThis;
    const state = typeof w.getTacticaClientState === 'function' ? w.getTacticaClientState() : {};
    const payload = buildIntrusionVoxPayload({
      zoneNum,
      bracketLabel,
      channel,
      roomCode: state.roomCode,
      battleRound: state.battleRound,
      factionName: state.factionName
    });
    if (w.VoxAudio && typeof w.VoxAudio.transmitToVox === 'function') {
      w.VoxAudio.transmitToVox(channel, payload);
    }
    return payload;
  }

  function exportTacticaToCrusade() {
    if (typeof localStorage === 'undefined') return null;
    const w = typeof window !== 'undefined' ? window : globalThis;
    const state = typeof w.getTacticaClientState === 'function' ? w.getTacticaClientState() : {};
    const chronicle = typeof w.getTacticaChronicle === 'function' ? w.getTacticaChronicle() : [];
    let spawnerSession = {};
    try {
      const raw = localStorage.getItem('foa_horde_session_v1');
      if (raw) spawnerSession = JSON.parse(raw);
    } catch (e) {}

    const snapshot = compileTacticaCrusadeSnapshot(state, chronicle, spawnerSession);
    localStorage.setItem('foa_horde_battle_stats_v1', JSON.stringify(snapshot));
    if (w.VoxAudio && typeof w.VoxAudio.playPowerSurge === 'function') w.VoxAudio.playPowerSurge();

    const notice = typeof document !== 'undefined' ? document.getElementById('tacticaCrusadeExportNotice') : null;
    if (notice) {
      notice.classList.remove('hidden');
      notice.innerHTML = `✅ Exported to Mode 5 Crusade Quartermaster (${snapshot.hordeKills} Horde Units Wiped • R${snapshot.roundsPlayed} • ${snapshot.leftoverSp} Leftover SP)! <a href="crusade.html" style="color:var(--gold); text-decoration:underline;">Open Crusade Command &rarr;</a>`;
    }
    return snapshot;
  }

  if (typeof window !== 'undefined') {
    Object.assign(window, {
      toggleTtsScreenCapture,
      toggleOverwatchVoiceOutput,
      startPushToTalkMic,
      runOverwatchLosCheck,
      dispatchSpokenOrTypedCommand,
      syncOverwatchAlertsFromState,
      pingIntrusionFromTactica,
      exportTacticaToCrusade
    });
  }

  return {
    toggleTtsScreenCapture,
    toggleOverwatchVoiceOutput,
    startPushToTalkMic,
    runOverwatchLosCheck,
    dispatchSpokenOrTypedCommand,
    syncOverwatchAlertsFromState,
    pingIntrusionFromTactica,
    exportTacticaToCrusade
  };
});

````

---

## File: `tests/js/tactica-overwatch-core.test.js` <a id="file-testsjstacticaoverwatchcoretestjs"></a>

````javascript
/**
 * @fileoverview Unit tests for js/tactica-overwatch-core.js voice intent parser,
 * multimodal 3D LOS prompt/verdict helpers, 6+ Intrusion alerts & Crusade stats handoff.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  parseSpokenTacticaIntent,
  buildLosVerificationPrompt,
  scrubGeminiThreadArtifacts,
  isGeminiInterimThinkingText,
  parseOverwatchVerdict,
  buildReactionVoiceCallout,
  detectActiveIntrusionZones,
  buildIntrusionVoxPayload,
  compileTacticaCrusadeSnapshot
} = require('../../js/tactica-overwatch-core.js');

test('parseSpokenTacticaIntent: maps spoken tabletop commands to deterministic console actions and routes LOS queries', () => {
  assert.equal(parseSpokenTacticaIntent('').intent, 'NONE');
  assert.equal(parseSpokenTacticaIntent('Scan the LCT board now').intent, 'SCAN_BOARD');
  assert.equal(parseSpokenTacticaIntent('Drop wave spawns into zones').intent, 'SPAWN_WAVES');
  assert.equal(parseSpokenTacticaIntent('Move the horde units').intent, 'MOVE_HORDE');
  assert.equal(parseSpokenTacticaIntent('Revert move on that squad').intent, 'REVERT_LAST_MOVE');
  assert.equal(parseSpokenTacticaIntent('Lock movement and check overwatch').intent, 'LOCK_MOVEMENT');
  assert.equal(parseSpokenTacticaIntent('Compute shooting target priority').intent, 'SELECT_SHOOTING');
  assert.equal(parseSpokenTacticaIntent('Declare charges').intent, 'DECLARE_CHARGES');
  assert.equal(parseSpokenTacticaIntent('Consolidate horde').intent, 'CONSOLIDATE');
  assert.equal(parseSpokenTacticaIntent('Activate Fire Overwatch').intent, 'USE_FIRE_OVERWATCH');
  assert.equal(parseSpokenTacticaIntent('Heroic Intervention').intent, 'USE_HEROIC_INTERVENTION');
  assert.equal(parseSpokenTacticaIntent('Counter-Offensive').intent, 'USE_COUNTER_OFFENSIVE');
  assert.equal(parseSpokenTacticaIntent('Pass window and hold CP').intent, 'PASS_REACTION');
  assert.equal(
    parseSpokenTacticaIntent('Can the Screamer-Killer see my Krieg squad through that ruin window?').intent,
    'VISUAL_LOS_CHECK'
  );
});

test('buildLosVerificationPrompt & parseOverwatchVerdict: embeds Misery #28 / coordinates and parses JSON or prose verdicts', () => {
  const prompt = buildLosVerificationPrompt({
    factionName: 'Tyranids',
    battleRound: 2,
    activeMiseryIds: [],
    lastMovementPlans: [{ squadKey: 'HORDE::Screamer', unitName: 'Screamer-Killer', goalName: 'Krieg Squad', targetX: 2, targetZ: 6 }],
    boardTelemetry: {
      units: [
        { squadKey: 'HORDE::Screamer', name: 'Screamer-Killer', side: 'HORDE', pos: { x: 2, z: 6 }, keywords: ['MONSTER'] },
        { squadKey: 'PLAYER::Krieg', name: 'Krieg Squad', side: 'PLAYER', pos: { x: 2, z: -4 }, keywords: ['INFANTRY'], isHidden: true }
      ]
    }
  }, 'Can the Screamer-Killer see the Krieg Squad behind the solid L-ruin?');

  assert.ok(prompt.includes('HORDE::Screamer'));
  assert.ok(prompt.includes('11th Edition'));

  const flyPrompt = buildLosVerificationPrompt({ activeMiseryIds: [28] }, '');
  assert.ok(flyPrompt.includes('Misery #28'));

  const fencedJson = '```json\n{"losBlocked":true,"revertSquadKey":"HORDE::Screamer","blockedPairs":["HORDE::Screamer->PLAYER::Krieg"],"spokenReply":"Solid first-floor ruin blocks true line of sight; reverting Screamer-Killer."}\n```';
  const parsed = parseOverwatchVerdict(fencedJson);
  assert.equal(parsed.losBlocked, true);
  assert.equal(parsed.revertSquadKey, 'HORDE::Screamer');
  assert.deepEqual(parsed.blockedPairs, ['HORDE::Screamer->PLAYER::Krieg']);
  assert.ok(parsed.spokenReply.includes('reverting Screamer-Killer'));

  const fallback = parseOverwatchVerdict('Line of sight is clear past the rubble.');
  assert.equal(fallback.losBlocked, false);
  assert.equal(fallback.spokenReply, 'Line of sight is clear past the rubble.');

  const proseBlocked = parseOverwatchVerdict('No line of sight behind the ruin.');
  assert.equal(proseBlocked.losBlocked, true);
  assert.equal(parseOverwatchVerdict('').losBlocked, false);
});

test('buildReactionVoiceCallout & detectActiveIntrusionZones: announces CP options and flags 6+ Big-Bracket breaches', () => {
  assert.equal(buildReactionVoiceCallout(null), '');
  const callout = buildReactionVoiceCallout({
    open: true,
    title: 'End of Horde Movement Phase',
    playerCp: 2,
    eligibleStratagems: [{ name: 'Fire Overwatch (24", 6+ Snap Shots)', cpCost: 1 }]
  });
  assert.ok(callout.includes('2 Command Points') && callout.includes('Fire Overwatch'));

  const breaches = detectActiveIntrusionZones([
    { zone: 1, bracketKey: '7-9', bracketLabel: 'Bracket [7–9]', intrusionRoll: null },
    { zone: 2, bracketKey: '10-12', bracketLabel: 'Bracket [10–12]', intrusionRoll: 5 },
    { zone: 3, bracketKey: '13+', bracketLabel: 'Bracket [13+]', intrusionRoll: 6 }
  ]);
  assert.equal(breaches.length, 1);
  assert.equal(breaches[0].zone, 3);

  const gammaPing = buildIntrusionVoxPayload({
    zoneNum: 3,
    bracketLabel: 'Bracket [13+]',
    channel: 'gamma',
    roomCode: 'EMBER-09',
    battleRound: 4,
    factionName: 'Orks'
  });
  assert.ok(gammaPing.includes('FANE-NODE VÔL-09') && gammaPing.includes('EMBER-09'));

  const alphaPing = buildIntrusionVoxPayload({ zoneNum: 1, bracketLabel: '[10–12]', channel: 'alpha', roomCode: 'HADES-1' });
  assert.ok(alphaPing.includes('THE EXILE'));
  const betaPing = buildIntrusionVoxPayload({ zoneNum: 1, bracketLabel: '[10–12]', channel: 'beta', roomCode: 'HADES-1' });
  assert.ok(betaPing.includes('JUNEBUG'));
  const distPing = buildIntrusionVoxPayload({ zoneNum: 2, bracketLabel: '[13+]', channel: 'distant', roomCode: 'HADES-1' });
  assert.ok(distPing.includes('ORBITAL AUGUR ARRAY'));
});

test('compileTacticaCrusadeSnapshot: aggregates chronicle kills, reactions, Misery cards & Warlord status for Mode 5 Crusade', () => {
  const state = {
    roomCode: 'GOLGOTHA-44',
    battleRound: 6,
    factionName: 'World Eaters',
    playerSp: 10,
    playerCp: 1,
    activeMiseryIds: [5, 30],
    hordeWarlord: { name: 'Lord Invocatus', roundSpawned: 2, alive: false }
  };
  const chronicle = [
    { type: 'AUTO_DEFENDER', summary: 'Wiped Berzerkers', details: { outcome: { unitDestroyed: true, modelsSlain: 10 } } },
    { type: 'AUTO_DEFENDER', summary: 'Slain Invocatus', details: { outcome: { unitDestroyed: true, modelsSlain: 1 } } },
    { type: 'REACTION', summary: 'Player activated FIRE_OVERWATCH (-1 CP).' },
    { type: 'REACTION', summary: 'Player passed reaction window.' }
  ];
  const spawnerSession = {
    selectedModeVal: 'solo',
    spSpentThisRound: 6,
    activeMiseries: [{ id: 5, name: 'Untouchable' }, { id: 30, name: 'Aim for the Heads' }],
    activeCard: { code: 'L2Y', name: '11 - Show Off', tags: 'End of Game' }
  };

  const snap = compileTacticaCrusadeSnapshot(state, chronicle, spawnerSession);
  assert.equal(snap.hordeKills, 2);
  assert.equal(snap.stratagemsUsed, 1);
  assert.equal(snap.roundsPlayed, 6);
  assert.equal(snap.hordeFaction, 'World Eaters');
  assert.equal(snap.roomSeed, 'GOLGOTHA-44');
  assert.equal(snap.gameMode, 'SOLO');
  assert.equal(snap.leftoverSp, 10);
  assert.equal(snap.leftoverCp, 1);
  assert.equal(snap.secretObjective.code, 'L2Y');
  assert.equal(snap.hordeWarlord.alive, false);
});

test('scrubGeminiThreadArtifacts & isGeminiInterimThinkingText: strips "O Gemini disse" anywhere and rejects thinking/streaming states', () => {
  assert.equal(typeof scrubGeminiThreadArtifacts, 'function');
  assert.equal(typeof isGeminiInterimThinkingText, 'function');

  // Exact interim thinking strings observed in live Portuguese/English Gemini 2.5 Thinking UI
  const interim1 = scrubGeminiThreadArtifacts('Processing: Determining if terrain blocks visibility O Gemini disse');
  assert.equal(interim1.includes('O Gemini disse'), false);
  assert.equal(isGeminiInterimThinkingText(interim1), true, 'Must treat "Processing: Determining..." as interim thinking');

  const interim2 = scrubGeminiThreadArtifacts('Determining if large rulebooks are supported O Gemini disse');
  assert.equal(interim2.includes('O Gemini disse'), false);
  assert.equal(isGeminiInterimThinkingText(interim2), true, 'Must treat "Determining if..." thought header as interim thinking');

  const adjacentNoSpace = scrubGeminiThreadArtifacts('Mostrar pensamentoDetermining if terrain blocks visibilityO Gemini disse');
  assert.equal(adjacentNoSpace.includes('O Gemini disse'), false);
  assert.equal(adjacentNoSpace.includes('Mostrar pensamento'), false);
  assert.equal(isGeminiInterimThinkingText(adjacentNoSpace), true);

  const emptyAfterLabel = scrubGeminiThreadArtifacts('  O Gemini disse:  ');
  assert.equal(emptyAfterLabel, '');
  assert.equal(isGeminiInterimThinkingText(emptyAfterLabel), true, 'Empty body after stripping O Gemini disse must keep waiting');

  // Active streaming button still present on page
  assert.equal(
    isGeminiInterimThinkingText('{"losBlocked":true', { isGenerating: true }),
    true,
    'Must keep waiting while Gemini Stop/streaming indicator is active'
  );

  // Completed real responses (JSON and conversational prose)
  const finalJson = scrubGeminiThreadArtifacts(
    'O Gemini disse\nJSON\nCopiar código\n{"losBlocked":true,"revertSquadKey":"HORDE::Paladin","blockedPairs":[],"spokenReply":"Solid ruin blocks LOS."}'
  );
  assert.equal(isGeminiInterimThinkingText(finalJson, { isGenerating: false }), false);
  const verdict = parseOverwatchVerdict(
    'O Gemini disse\n{"losBlocked":false,"revertSquadKey":null,"blockedPairs":[],"spokenReply":"Clear sightline past low rubble."}'
  );
  assert.equal(verdict.spokenReply, 'Clear sightline past low rubble.');

  const proseVerdict = parseOverwatchVerdict('O Gemini disse: Yes, I can hear you loud and clear and am ready to verify line of sight.');
  assert.equal(proseVerdict.spokenReply.includes('O Gemini disse'), false);
  assert.equal(isGeminiInterimThinkingText(proseVerdict.spokenReply, { isGenerating: false }), false);
});


````
