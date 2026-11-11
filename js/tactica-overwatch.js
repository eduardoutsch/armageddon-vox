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

