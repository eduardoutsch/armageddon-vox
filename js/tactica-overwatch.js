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

