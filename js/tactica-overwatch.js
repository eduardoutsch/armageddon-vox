/**
 * @fileoverview Fires of Armageddon // Live Screen, Neural Auspex & Push-to-Talk Overwatch Shell
 *
 * Humble View adapter managing:
 * - On-demand TTS window frame capture (`getDisplayMedia` -> offscreen JPEG canvas)
 * - Hold-[Space] / [V] Push-to-Talk Web Speech mic input & neural Auspex comm playback (`/audio/speak`)
 * - Vocal & Sticky-Bar Core/Faction Stratagem resolution with fuzzy PLAYER squad matching
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
  let overwatchAudioCtx = null;
  let activeMicRecognition = null;
  let isPttHeld = false;
  let lastAnnouncedReactionKey = '';
  let lastSirenSignature = '';

  function base64ToArrayBuffer(b64) {
    if (typeof atob === 'function') {
      const bin = atob(b64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return bytes.buffer;
    }
    if (typeof Buffer !== 'undefined') {
      const buf = Buffer.from(b64, 'base64');
      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
    }
    return new ArrayBuffer(0);
  }

  /**
   * Synchronously instantiates and resumes `overwatchAudioCtx` on the first browser click or keypress
   * so subsequent asynchronous neural Auspex `/audio/speak` responses are never blocked by autoplay policy.
   */
  function unlockOverwatchAudio() {
    const w = typeof window !== 'undefined' ? window : globalThis;
    const Ctx = w.AudioContext || w.webkitAudioContext;
    if (!Ctx) return;
    if (!overwatchAudioCtx) overwatchAudioCtx = new Ctx();
    if (overwatchAudioCtx.state === 'suspended' && typeof overwatchAudioCtx.resume === 'function') {
      overwatchAudioCtx.resume().catch(() => {});
    }
  }

  /**
   * Plays a neural Auspex voice line via `POST /audio/speak`, passing decoded audio through a
   * gentle 260Hz–4200Hz visor comm-filter at 0.55 gain, falling back to an HTML5 `Audio` Data-URI
   * if `AudioContext` remains suspended, or to an auspex chime when offline.
   *
   * @param {string} text - Tactical callout sentence.
   * @returns {Promise<boolean>} True if neural audio played, false when muted or offline.
   */
  async function speakOverwatchLine(text) {
    if (!voiceOutputEnabled || !text) return false;
    const w = typeof window !== 'undefined' ? window : globalThis;
    const theme = w.VoxAudio?.getFactionTheme?.() || 'default';

    try {
      if (typeof fetch !== 'function') throw new Error('Offline');
      const res = await fetch(`${DAEMON_URL}/audio/speak`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: String(text).trim(), theme })
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!data || !data.ok || !data.audioBase64) throw new Error('Fallback chime');

      const Ctx = w.AudioContext || w.webkitAudioContext;
      const AudioCtor = typeof Audio === 'function' ? Audio : (typeof w.Audio === 'function' ? w.Audio : null);
      if (Ctx) {
        if (!overwatchAudioCtx) overwatchAudioCtx = new Ctx();
        if (overwatchAudioCtx.state === 'suspended' && typeof overwatchAudioCtx.resume === 'function') {
          await overwatchAudioCtx.resume().catch(() => {});
        }
      }
      if ((!overwatchAudioCtx || overwatchAudioCtx.state === 'suspended') && AudioCtor) {
        const a = new AudioCtor('data:audio/mpeg;base64,' + data.audioBase64);
        a.volume = 0.6;
        await a.play();
        return true;
      }
      if (!overwatchAudioCtx) throw new Error('No AudioContext');
      if (overwatchAudioCtx.state === 'suspended') throw new Error('AudioContext suspended');

      const rawBuf = base64ToArrayBuffer(data.audioBase64);
      const audioBuffer = await overwatchAudioCtx.decodeAudioData(rawBuf.slice(0));
      const src = overwatchAudioCtx.createBufferSource();
      src.buffer = audioBuffer;

      const hp = overwatchAudioCtx.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.setValueAtTime(260, overwatchAudioCtx.currentTime);

      const lp = overwatchAudioCtx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(4200, overwatchAudioCtx.currentTime);

      const gainNode = overwatchAudioCtx.createGain();
      gainNode.gain.setValueAtTime(0.55, overwatchAudioCtx.currentTime);

      src.connect(hp);
      hp.connect(lp);
      lp.connect(gainNode);
      gainNode.connect(overwatchAudioCtx.destination);
      src.start(0);
      return true;
    } catch (e) {
      if (w.VoxAudio && typeof w.VoxAudio.playClank === 'function') {
        w.VoxAudio.playClank('auspex');
      }
      return false;
    }
  }

  function toggleOverwatchVoiceOutput() {
    voiceOutputEnabled = !voiceOutputEnabled;
    const btn = typeof document !== 'undefined' ? document.getElementById('btnToggleOverwatchTts') : null;
    if (btn) btn.textContent = voiceOutputEnabled ? '🔊 Auspex Voice: ON' : '🔇 Auspex Voice: MUTE';
    return voiceOutputEnabled;
  }

  function isEditableTarget(el) {
    if (!el) return false;
    const tag = String(el.tagName || '').toUpperCase();
    return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || Boolean(el.isContentEditable);
  }

  function handlePttKeyDown(e) {
    if (!e || e.repeat || isPttHeld || isEditableTarget(e.target)) return;
    if (e.code !== 'Space' && e.code !== 'KeyV') return;
    if (e.code === 'Space' && typeof e.preventDefault === 'function') e.preventDefault();
    isPttHeld = true;
    const pill = typeof document !== 'undefined' ? document.getElementById('pttStatusPill') : null;
    if (pill) {
      pill.textContent = '🔴 MIC LIVE — SPEAK COMMAND OR STRATAGEM...';
      pill.classList.add('ptt-active');
    }
    if (typeof window !== 'undefined' && window.VoxAudio?.playClank) window.VoxAudio.playClank('auspex');
    startPushToTalkMic();
  }

  function handlePttKeyUp(e) {
    if (!isPttHeld || !e || (e.code !== 'Space' && e.code !== 'KeyV')) return;
    isPttHeld = false;
    const pill = typeof document !== 'undefined' ? document.getElementById('pttStatusPill') : null;
    if (pill) {
      pill.textContent = '🎙️ Hold [SPACE] or [V] to Talk';
      pill.classList.remove('ptt-active');
    }
    if (activeMicRecognition && typeof activeMicRecognition.stop === 'function') {
      try { activeMicRecognition.stop(); } catch (err) {}
    }
  }

  async function toggleTtsScreenCapture() {
    const statusEl = typeof document !== 'undefined' ? document.getElementById('overwatchScreenStatus') : null;
    if (screenStream) {
      screenStream.getTracks().forEach(t => t.stop());
      screenStream = null;
      if (statusEl) statusEl.textContent = '📷 Off';
      return false;
    }
    if (typeof navigator === 'undefined' || !navigator.mediaDevices || typeof navigator.mediaDevices.getDisplayMedia !== 'function') {
      if (statusEl) statusEl.textContent = '⚠️ Screen Share unavailable';
      return false;
    }
    screenStream = await navigator.mediaDevices.getDisplayMedia({ video: { cursor: 'always' }, audio: false });
    if (typeof document !== 'undefined' && typeof document.createElement === 'function') {
      screenVideoEl = document.createElement('video');
      screenVideoEl.srcObject = screenStream;
      screenVideoEl.muted = true;
      if (typeof screenVideoEl.play === 'function') await screenVideoEl.play().catch(() => {});
    }
    if (statusEl) statusEl.textContent = '🟢 Locked';
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

  function syncPlayerCpToSpawnerSession(newCp, countsForSecret20 = false) {
    if (typeof localStorage === 'undefined') return;
    try {
      const raw = localStorage.getItem('foa_horde_session_v1');
      const sess = raw ? JSON.parse(raw) : {};
      sess.cp = newCp;
      if (countsForSecret20) {
        sess.stratCount = (Number(sess.stratCount) || 0) + 1;
      }
      localStorage.setItem('foa_horde_session_v1', JSON.stringify(sess));
    } catch (e) {}
  }

  async function executePlayerStratagemIntent(parsed, w) {
    const state = typeof w.getTacticaClientState === 'function' ? w.getTacticaClientState() : {};
    const outBox = typeof document !== 'undefined' ? document.getElementById('overwatchVerdictBox') : null;
    const validation = typeof validatePlayerStratagemUse === 'function'
      ? validatePlayerStratagemUse(parsed, state)
      : { allowed: (Number(state.playerCp) || 0) >= (Number(parsed.cpCost) || 0), reason: 'Insufficient CP.', countsForSecret20: (Number(parsed.cpCost) || 0) >= 1 };

    if (!validation.allowed) {
      if (outBox) outBox.innerHTML = `<span style="color:var(--red);">⚠️ ${validation.reason}</span>`;
      speakOverwatchLine(validation.reason);
      return { ...parsed, rejected: true, reason: validation.reason };
    }

    const units = state.boardTelemetry?.units || [];
    const matchedUnit = (parsed.targetUnit && typeof matchPlayerUnitFromTelemetry === 'function')
      ? matchPlayerUnitFromTelemetry(parsed.targetUnit, units)
      : null;
    const resolvedTarget = matchedUnit ? matchedUnit.name : (parsed.targetUnit || null);
    const actionLabel = resolvedTarget ? `${parsed.stratName} on ${resolvedTarget}` : parsed.stratName;
    const cost = Math.max(0, Number(parsed.cpCost) || 0);

    if (typeof w.resolveConsoleReaction === 'function') {
      await w.resolveConsoleReaction(actionLabel, cost);
    }

    const updatedState = typeof w.getTacticaClientState === 'function' ? w.getTacticaClientState() : state;
    const durationScope = String(parsed.durationScope || 'PHASE').toUpperCase() === 'ROUND' ? 'ROUND' : 'PHASE';
    if (parsed.buff) {
      if (!Array.isArray(updatedState.activePlayerBuffs)) updatedState.activePlayerBuffs = [];
      const buffEntry = typeof createPlayerStratagemBuff === 'function'
        ? createPlayerStratagemBuff({ ...parsed, resolvedTarget, durationScope }, updatedState)
        : {
            stratName: parsed.stratName,
            targetUnit: resolvedTarget,
            durationScope,
            battleRound: updatedState.battleRound || 1,
            ...parsed.buff
          };
      updatedState.activePlayerBuffs.push(buffEntry);
      if (typeof fetch === 'function') {
        fetch(`${DAEMON_URL}/session/sync`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ activePlayerBuffs: updatedState.activePlayerBuffs })
        }).catch(() => {});
      }
    }

    syncPlayerCpToSpawnerSession(updatedState.playerCp ?? 0, validation.countsForSecret20);

    const durationLabel = durationScope === 'ROUND' ? '1 Round / Until Next Turn' : 'This Phase';
    const cpSpeech = cost === 1 ? 'One Command Point deducted.' : `${cost} Command Points deducted.`;
    if (outBox) {
      outBox.innerHTML = `<strong style="color:var(--gold);">⚡ Stratagem Active:</strong> ${actionLabel} (-${cost} CP • ${durationLabel})`;
    }
    speakOverwatchLine(`${actionLabel} active. ${cpSpeech}`);
    return { ...parsed, durationScope, resolvedTarget, rejected: false };
  }

  async function dispatchSpokenOrTypedCommand(rawTranscript) {
    const parsed = parseSpokenTacticaIntent(rawTranscript);
    if (parsed.intent === 'NONE') return parsed;

    const w = typeof window !== 'undefined' ? window : globalThis;
    if (parsed.intent === 'PLAYER_STRATAGEM') {
      const res = await executePlayerStratagemIntent(parsed, w);
      syncOverwatchAlertsFromState();
      return res;
    }

    if (parsed.intent === 'SCAN_BOARD' && typeof w.requestTtsBoardScan === 'function') await w.requestTtsBoardScan();
    else if (parsed.intent === 'SPAWN_WAVES' && typeof w.triggerAutopilotSpawnWaves === 'function') await w.triggerAutopilotSpawnWaves();
    else if (parsed.intent === 'MOVE_HORDE' && typeof w.triggerAutopilotMovement === 'function') await w.triggerAutopilotMovement();
    else if (parsed.intent === 'REVERT_LAST_MOVE' && typeof w.revertAutopilotSquadMove === 'function') await w.revertAutopilotSquadMove(0);
    else if (parsed.intent === 'LOCK_MOVEMENT' && typeof w.setConsolePhaseAndTrigger === 'function') await w.setConsolePhaseAndTrigger('HORDE_MOVEMENT', 'END_OF_HORDE_MOVEMENT');
    else if (parsed.intent === 'SELECT_SHOOTING' && typeof w.triggerAutopilotShooting === 'function') await w.triggerAutopilotShooting();
    else if (parsed.intent === 'DECLARE_CHARGES' && typeof w.triggerAutopilotCharges === 'function') await w.triggerAutopilotCharges();
    else if (parsed.intent === 'CONSOLIDATE' && typeof w.triggerAutopilotConsolidate === 'function') await w.triggerAutopilotConsolidate();
    else if (parsed.intent === 'PASS_REACTION' && typeof w.resolveConsoleReaction === 'function') await w.resolveConsoleReaction('PASS', 0);
    else {
      await runOverwatchLosCheck(parsed.transcript);
    }

    syncOverwatchAlertsFromState();
    return parsed;
  }

  function toggleQuickStratCategory() {
    if (typeof document === 'undefined') return;
    const cat = document.getElementById('quickStratCategorySelect')?.value || 'FACTION';
    const facInp = document.getElementById('quickStratNameInput');
    const coreSel = document.getElementById('quickStratCoreSelect');
    if (facInp) facInp.classList.toggle('hidden', cat === 'CORE');
    if (coreSel) coreSel.classList.toggle('hidden', cat !== 'CORE');
  }

  async function triggerQuickStratagem(cpCost = 1) {
    if (typeof document === 'undefined') return null;
    const cat = document.getElementById('quickStratCategorySelect')?.value || 'FACTION';
    const rawName = cat === 'CORE'
      ? (document.getElementById('quickStratCoreSelect')?.value || 'Fire Overwatch')
      : (document.getElementById('quickStratNameInput')?.value || '').trim();
    if (!rawName) return null;
    const target = (document.getElementById('quickStratTargetSelect')?.value || '').trim();
    const duration = (document.getElementById('quickStratDurationSelect')?.value || 'PHASE').toUpperCase();
    const targetClause = target ? ` on ${target}` : '';
    const durationClause = duration === 'ROUND' ? ' for the round' : '';
    const cmd = `Stratagem ${rawName}${targetClause}${durationClause} - ${Number(cpCost) || 0}cp`;
    return dispatchSpokenOrTypedCommand(cmd);
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
    activeMicRecognition = rec;
    rec.lang = 'en-US';
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    if (outBox) outBox.innerHTML = '🎙️ Listening... speak a command or Stratagem now.';
    rec.onresult = (ev) => {
      const spoken = ev.results?.[0]?.[0]?.transcript || '';
      dispatchSpokenOrTypedCommand(spoken);
    };
    rec.onend = () => {
      if (activeMicRecognition === rec) activeMicRecognition = null;
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
      unlockOverwatchAudio,
      speakOverwatchLine,
      toggleTtsScreenCapture,
      toggleOverwatchVoiceOutput,
      isEditableTarget,
      handlePttKeyDown,
      handlePttKeyUp,
      toggleQuickStratCategory,
      triggerQuickStratagem,
      startPushToTalkMic,
      runOverwatchLosCheck,
      dispatchSpokenOrTypedCommand,
      syncOverwatchAlertsFromState,
      pingIntrusionFromTactica,
      exportTacticaToCrusade
    });
    if (typeof window.addEventListener === 'function') {
      if (window._foaUnlockAudio && typeof window.removeEventListener === 'function') {
        window.removeEventListener('pointerdown', window._foaUnlockAudio);
        window.removeEventListener('keydown', window._foaUnlockAudio);
      }
      window._foaUnlockAudio = unlockOverwatchAudio;
      window.addEventListener('pointerdown', unlockOverwatchAudio);
      window.addEventListener('keydown', unlockOverwatchAudio);

      if (window._foaPttKeyDown && typeof window.removeEventListener === 'function') {
        window.removeEventListener('keydown', window._foaPttKeyDown);
      }
      if (window._foaPttKeyUp && typeof window.removeEventListener === 'function') {
        window.removeEventListener('keyup', window._foaPttKeyUp);
      }
      window._foaPttKeyDown = (e) => {
        if (typeof document !== 'undefined' && (document.getElementById('pttStatusPill') || document.getElementById('tacticaRoomLabel'))) {
          handlePttKeyDown(e);
        }
      };
      window._foaPttKeyUp = (e) => {
        if (isPttHeld || (typeof document !== 'undefined' && (document.getElementById('pttStatusPill') || document.getElementById('tacticaRoomLabel')))) {
          handlePttKeyUp(e);
        }
      };
      window.addEventListener('keydown', window._foaPttKeyDown);
      window.addEventListener('keyup', window._foaPttKeyUp);
    }
  }

  return {
    unlockOverwatchAudio,
    speakOverwatchLine,
    toggleTtsScreenCapture,
    toggleOverwatchVoiceOutput,
    isEditableTarget,
    handlePttKeyDown,
    handlePttKeyUp,
    toggleQuickStratCategory,
    triggerQuickStratagem,
    startPushToTalkMic,
    runOverwatchLosCheck,
    dispatchSpokenOrTypedCommand,
    syncOverwatchAlertsFromState,
    pingIntrusionFromTactica,
    exportTacticaToCrusade
  };
});
