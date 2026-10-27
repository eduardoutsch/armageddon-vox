# 📦 Fires of Armageddon // Bundle: Mode 7 - Astropathic Vox-Terminal Logic (Part 2: CRT Monitor & Streams)

Real-time Teletype typewriter audio streaming, CRT message rendering, and interferences array (`js/vox.js`).

## 📑 Table of Contents
- [js/vox.js (Part 2: CRT Monitors & Streams)](#file-jsvoxjspart2crtmonitorsstreams)

---

## File: `js/vox.js (Part 2: CRT Monitors & Streams)` <a id="file-jsvoxjspart2crtmonitorsstreams"></a>

````javascript
    };
  }

  // 3. Fallback inference if +++ banner was mid-text
  if (/ASHEN SPIRIT|MU-TH-UR|DECK 44/i.test(trimmed)) {
    return {
      cardTitle: '++ ASHEN SPIRIT LOGIC CORE // DECK 44 COGITATOR ++',
      cleanBody: trimmed
    };
  }

  return { cardTitle: fallbackTitle, cleanBody: trimmed };
}

var callRpc = rpcCall;

function formatTime(isoStr) {
  if (!isoStr) return 'VOX-LOG';
  try {
    const d = new Date(isoStr);
    return isNaN(d.getTime()) ? 'VOX-LOG' : d.toLocaleTimeString();
  } catch (e) {
    return 'VOX-LOG';
  }
}

async function purgeVoxEntry(entryId, entryType = 'message') {
  if (!activePassphrase || !entryId) return;

  const label = entryType === 'interference'
    ? 'Purge this intercepted psychic bleed from the cogitator log?'
    : 'Purge this transmission exchange from the cogitator log?';

  if (typeof window !== 'undefined' && typeof window.confirm === 'function' && !window.confirm(label)) {
    return;
  }

  if (typeof window !== 'undefined' && window.VoxAudio) window.VoxAudio.playScarHazard();

  const res = await callRpc('delete_vox_entry', {
    p_channel: selectedChannel,
    p_passphrase: activePassphrase,
    p_entry_id: entryId,
    p_entry_type: entryType
  });

  if (res && res.ok) {
    const directBox = document.getElementById('directMessagesBox');
    const intBox = document.getElementById('interferencesBox');
    if (directBox && directBox.dataset) directBox.dataset.sig = '';
    if (intBox && intBox.dataset) intBox.dataset.sig = '';
    await refreshTerminal(false);
  }
}

/**
 * Determines whether an interference entry originated from a dual-broadcast
 * Mode 3 Rogue Sector Auxiliary Battle Report rather than a single rival player's conduit.
 *
 * @param {object} ix - Interference record from public.vox_interferences
 * @returns {boolean} True when the interference is a Rogue Sector dual-channel broadcast
 */
function isRogueSectorInterference(ix) {
  if (!ix) return false;
  const combined = `${ix.origin_hint || ''} ${ix.redacted_text || ''}`;
  return /PARALLEL SECTOR|ORBITAL AUGUR ARRAY|ROGUE SECTOR/i.test(combined);
}

/**
 * Evaluates whether a Supabase `vox_server_heartbeat` payload indicates that the
 * Astropathic Courier server (`vox_bridge.js`) is currently online and active.
 *
 * @param {object} hb - Heartbeat object `{ status, updatedAt }`
 * @param {number} [now=Date.now()] - Current epoch timestamp in ms
 * @returns {boolean} True if the server is online and heartbeat is fresh (<= 25s)
 */
function isVoxServerOnline(hb, now = Date.now()) {
  if (!hb || typeof hb !== 'object') return false;
  if (hb.status !== 'online') return false;
  if (typeof hb.updatedAt !== 'number') return false;
  const ageMs = now - hb.updatedAt;
  return ageMs >= -5000 && ageMs <= 25000;
}

/**
 * Queries Supabase for the latest Astropathic Courier heartbeat and updates
 * both `#serverStatusBadge` (Auth screen) and `#terminalServerStatusLabel` (Terminal HUD).
 *
 * @returns {Promise<boolean>} True if the server is currently online
 */
async function checkVoxServerStatus() {
  let isOnline = false;
  try {
    const data = await rpcCall('get_shared_spawn_pools', {});
    const hb = data && data.nemesis_status ? data.nemesis_status.vox_server_heartbeat : null;
    isOnline = isVoxServerOnline(hb, Date.now());
  } catch (e) {
    isOnline = false;
  }

  const authBadge = document.getElementById('serverStatusBadge');
  if (authBadge) {
    authBadge.classList.toggle('online', isOnline);
    authBadge.classList.toggle('offline', !isOnline);
    authBadge.innerHTML = isOnline
      ? `<span class="server-dot"></span> 🟢 ASTROPATHIC SERVER: ONLINE`
      : `<span class="server-dot"></span> 🔴 ASTROPATHIC SERVER: OFFLINE (QUEUE MODE)`;
  }

  const termLabel = document.getElementById('terminalServerStatusLabel');
  if (termLabel) {
    termLabel.textContent = isOnline ? '🟢 ONLINE (ACTIVE)' : '🔴 OFFLINE (QUEUED)';
    if (termLabel.style) {
      termLabel.style.color = isOnline ? '#00ff88' : '#ff4757';
      termLabel.style.textShadow = isOnline
        ? '0 0 6px rgba(0,255,136,0.35)'
        : '0 0 6px rgba(255,71,87,0.35)';
    }
  }

  return isOnline;
}

async function refreshTerminal(forceScroll = false) {
  checkVoxServerStatus().catch(() => {});
  if (!activePassphrase) return;
  try {
    const data = await rpcCall('get_vox_terminal_data', {
      p_channel: selectedChannel,
      p_passphrase: activePassphrase
    });
    if (!data || !data.ok) return;

    const msgs = data.messages || [];
    const dBox = document.getElementById('directMessagesBox');
    if (!dBox) return;

    syncSeenTokensFromStorage();

    if (msgs.length === 0) {
      dBox.innerHTML = `<p style="color:#00ff88; text-align:center; margin-top:45px; opacity:0.7;">++ NO TRANSMISSIONS LOGGED ON THIS FREQUENCY YET ++<span class="crt-cursor"></span></p>`;
    } else {
      const totalCount = msgs.length;
      const hasOlder = totalCount > 3;
      const visibleMsgs = (hasOlder && !showAllOlderMessages) ? msgs.slice(-3) : msgs;

      const stateSignature = `${showAllOlderMessages ? 'all' : 'recent'}_${visibleMsgs.map(m => `${m.id}:${m.status}`).join('|')}`;
      if (dBox.dataset.sig !== stateSignature) {
        clearStreamTimers();
        dBox.dataset.sig = stateSignature;
        dBox.innerHTML = '';

        if (hasOlder) {
          const olderBar = document.createElement('div');
          olderBar.className = 'crt-older-bar';

          const olderBtn = document.createElement('button');
          olderBtn.type = 'button';
          olderBtn.id = 'toggleOlderMsgsBtn';
          olderBtn.className = 'btn-ghost btn-sm crt-older-btn';
          olderBtn.textContent = showAllOlderMessages
            ? '🔼 Collapse to Recent 3 Messages'
            : `📜 See Older Messages (${totalCount - 3} older)`;
          olderBtn.onclick = toggleOlderMessages;

          olderBar.appendChild(olderBtn);
          dBox.appendChild(olderBar);
        }

        visibleMsgs.forEach(m => {
          const wrap = document.createElement('div');
          wrap.className = 'crt-exchange-wrap';

          const msgCard = document.createElement('div');
          msgCard.className = 'crt-msg-card';
          msgCard.innerHTML = `
            <div class="crt-msg-header crt-msg-meta">
              <span>📡 ${escapeHtml(m.sender || 'COMMANDER')}</span>
              <span>
                ${formatTime(m.created_at)}
                <button type="button" class="crt-purge-btn" onclick="purgeVoxEntry('${escapeHtml(m.id)}', 'message')" title="Purge Transmission from Log">✕ PURGE</button>
              </span>
            </div>
            <div class="crt-q-body crt-msg-body"></div>
          `;
          const qBody = msgCard.querySelector('.crt-q-body');
          const qToken = `q_${m.id}`;

          if (!seenTokens.has(qToken)) {
            markTokenSeen(qToken);
            streamTextIntoElement(qBody, m.question || '', false);
          } else {
            qBody.textContent = m.question || '';
          }
          wrap.appendChild(msgCard);

          if (m.status === 'answered' && m.reply) {
            const { cardTitle, cleanBody } = extractDynamicReplyCardMeta(m.reply);

            const repCard = document.createElement('div');
            repCard.className = 'crt-reply-card crt-msg-card reply';
            repCard.innerHTML = `
              <div class="crt-reply-header crt-msg-meta">
                <span>${escapeHtml(cardTitle)}</span>
                <span>
                  ${formatTime(m.answered_at)}
                  <button type="button" class="crt-purge-btn" onclick="purgeVoxEntry('${escapeHtml(m.id)}', 'message')" title="Purge Transmission from Log">✕ PURGE</button>
                </span>
              </div>
              <div class="crt-r-body crt-msg-body"></div>
            `;
            const rBody = repCard.querySelector('.crt-r-body');
            const rToken = `r_${m.id}`;

            if (!seenTokens.has(rToken)) {
              markTokenSeen(rToken);
              streamTextIntoElement(rBody, cleanBody, false);
            } else {
              rBody.textContent = cleanBody;
            }
            wrap.appendChild(repCard);
          } else {
            const pend = document.createElement('div');
            pend.className = 'crt-pending-line';
            pend.innerHTML = `⏳ VERMILION CIPHER TRANSMITTED // AWAITING COGITATOR DECRYPTION & RETURN FEED... <span class="crt-cursor"></span>`;
            wrap.appendChild(pend);
          }

          dBox.appendChild(wrap);
        });

        if (!showAllOlderMessages || forceScroll) {
          dBox.scrollTop = dBox.scrollHeight;
        }
      }
    }

    // Render Redacted Astropathic Interferences
    const ints = data.interferences || [];
    const iBox = document.getElementById('interferencesBox');
    const badge = document.getElementById('interferenceCountBadge');
    if (badge) badge.textContent = ints.length > 0 ? `(${ints.length})` : '';

    if (!iBox) return;

    if (ints.length === 0) {
      iBox.innerHTML = `<p style="color:#fda4af; text-align:center; margin-top:45px; opacity:0.65;">++ NO PSYCHIC BLEED DETECTED IN THE IMMATERIUM ++</p>`;
    } else {
      const totalInts = ints.length;
      const hasOlderInts = totalInts > 3;
      const visibleInts = (hasOlderInts && !showAllOlderInterferences) ? ints.slice(-3) : ints;

      const intSig = `${showAllOlderInterferences ? 'all' : 'recent'}_${visibleInts.map(x => x.id).join('|')}`;
      if (iBox.dataset.sig !== intSig) {
        iBox.dataset.sig = intSig;
        iBox.innerHTML = '';

        if (hasOlderInts) {
          const olderBar = document.createElement('div');
          olderBar.className = 'crt-older-bar';

          const olderBtn = document.createElement('button');
          olderBtn.type = 'button';
          olderBtn.id = 'toggleOlderIntsBtn';
          olderBtn.className = 'btn-ghost btn-sm crt-older-btn';
          olderBtn.style.color = '#ff4757';
          olderBtn.style.borderColor = 'rgba(255, 71, 87, 0.45)';
          olderBtn.style.background = 'rgba(28, 8, 12, 0.8)';
          olderBtn.textContent = showAllOlderInterferences
            ? '🔼 Collapse to Recent 3 Psychic Bleeds'
            : `⚡ See Older Interferences (${totalInts - 3} older)`;
          olderBtn.onclick = toggleOlderInterferences;

          olderBar.appendChild(olderBtn);
          iBox.appendChild(olderBar);
        }

        visibleInts.forEach(ix => {
          const isRogue = isRogueSectorInterference(ix);
          const card = document.createElement('div');
          card.className = isRogue ? 'crt-intercept-card rogue-intercept' : 'crt-intercept-card';
          const headerColor = isRogue ? '#c084fc' : '#ff4757';
          const headerBorder = isRogue ? 'rgba(168,85,247,0.35)' : 'rgba(255,71,87,0.3)';
          const headerIcon = isRogue ? 'SECTOR BROADCAST' : 'INTERCEPT';
          card.innerHTML = `
            <div class="crt-msg-meta" style="display:flex; justify-content:space-between; align-items:center; font-size:0.72rem; color:${headerColor}; border-bottom:1px dashed ${headerBorder}; padding-bottom:5px; margin-bottom:8px;">
              <span>${headerIcon} // ${escapeHtml(ix.origin_hint || 'UNKNOWN CARRIER WAVE')}</span>
              <span>
                ${formatTime(ix.created_at)}
                <button type="button" class="crt-purge-btn" onclick="purgeVoxEntry('${escapeHtml(ix.id)}', 'interference')" title="Purge Intercept from Log">✕ PURGE</button>
              </span>
            </div>
            <div class="crt-int-body crt-msg-body"></div>
          `;
          const bodyEl = card.querySelector('.crt-int-body');
          const iToken = `int_${ix.id}`;
          if (!seenTokens.has(iToken)) {
            markTokenSeen(iToken);
            streamTextIntoElement(bodyEl, ix.redacted_text || '', true);
          } else {
            bodyEl.innerHTML = formatRedactedHtml(ix.redacted_text || '');
          }
          iBox.appendChild(card);
        });
      }
    }
  } catch (e) {}
}

async function transmitQuestion() {
  const input = document.getElementById('questionInput');
  const text = (input ? input.value : '').trim();
  if (!text || !activePassphrase) return;

  if (typeof window !== 'undefined' && window.VoxAudio && typeof window.VoxAudio.playDossierStamp === 'function') {
    window.VoxAudio.playDossierStamp();
  }

  input.value = '';
  const senderName = selectedChannel === 'alpha'
    ? 'The Exile // Sanctuary of Ash'
    : (selectedChannel === 'beta'
        ? 'Lord Commander Junebug'
        : 'Kâhl Hârkyn Grîmledger // The Ledger of Embers');

  await rpcCall('send_vox_message', {
    p_channel: selectedChannel,
    p_passphrase: activePassphrase,
    p_sender: senderName,
    p_question: text
  });

  await refreshTerminal(true);
}

function switchSubWindow(which) {
  const isDirect = which === 'direct';
  const subDirect = document.getElementById('subWinDirect');
  const subInt = document.getElementById('subWinInterferences');
  const btn1 = document.getElementById('winBtn1');
  const btn2 = document.getElementById('winBtn2');
  if (subDirect) subDirect.classList.toggle('hidden', !isDirect);
  if (subInt) subInt.classList.toggle('hidden', isDirect);
  if (btn1) btn1.classList.toggle('active', isDirect);
  if (btn2) btn2.classList.toggle('active', !isDirect);
}

function lockTerminal() {
  activePassphrase = null;
  showAllOlderMessages = false;
  showAllOlderInterferences = false;
  clearStreamTimers();
  if (pollTimer) clearInterval(pollTimer);
  try { sessionStorage.removeItem(SESSION_AUTH_KEY); } catch (e) {}
  if (typeof window !== 'undefined' && window.VoxAudio && typeof window.VoxAudio.playTerminalPowerOff === 'function') {
    window.VoxAudio.playTerminalPowerOff(selectedChannel);
  }
  const termScreen = document.getElementById('terminalScreen');
  const authScreen = document.getElementById('authScreen');
  if (termScreen) termScreen.classList.add('hidden');
  if (authScreen) authScreen.classList.remove('hidden');
  selectConduit(selectedChannel);
}

var serverStatusTimer = null;

async function initVoxTerminalPage() {
  checkVoxServerStatus().catch(() => {});
  if (typeof window !== 'undefined' && window.location && window.location.search) {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const chanParam = (urlParams.get('channel') || urlParams.get('conduit') || '').toLowerCase();
      if (chanParam && validChannels.includes(chanParam)) {
        selectedChannel = chanParam;
      }
    } catch (e) {}
  }
  if (serverStatusTimer) clearInterval(serverStatusTimer);
  serverStatusTimer = setInterval(() => {
    checkVoxServerStatus().catch(() => {});
  }, 8000);

  const pending = checkPendingDossierBuffer();

  if (pending) {
    try {
      sessionStorage.removeItem(SESSION_AUTH_KEY);
    } catch (e) {}
    await selectConduit(pending.channel || 'alpha');
    const passEl = document.getElementById('passInput');
    if (passEl) {
      passEl.value = '';
      setTimeout(() => passEl.focus(), 100);
    }
    return;
  }

  try {
    const savedSession = sessionStorage.getItem(SESSION_AUTH_KEY);
    if (savedSession) {
      const parsed = JSON.parse(savedSession);
      if (parsed.pass && parsed.channel) {
        selectedChannel = parsed.channel;
        const passEl = document.getElementById('passInput');
        if (passEl) passEl.value = parsed.pass;
        await handleSealAction();
        return;
      }
    }
  } catch (e) {}

  const activeTheme = (typeof window !== 'undefined' && window.VoxAudio && typeof window.VoxAudio.getFactionTheme === 'function')
    ? window.VoxAudio.getFactionTheme()
    : null;
  await selectConduit(activeTheme === 'necron' ? 'beta' : 'alpha');
}

// Attach to window for browser global scope
if (typeof window !== 'undefined') {
  window.validChannels = validChannels;
  window.SUPABASE_URL = SUPABASE_URL;
  window.SUPABASE_ANON_KEY = SUPABASE_ANON_KEY;
  window.SEEN_IDS_STORAGE_KEY = SEEN_IDS_STORAGE_KEY;
  window.SESSION_AUTH_KEY = SESSION_AUTH_KEY;
  window.toggleOlderMessages = toggleOlderMessages;
  window.toggleOlderInterferences = toggleOlderInterferences;
  window.syncSeenTokensFromStorage = syncSeenTokensFromStorage;
  window.markTokenSeen = markTokenSeen;
  window.rpcCall = rpcCall;
  window.callRpc = callRpc;
  window.checkPendingDossierBuffer = checkPendingDossierBuffer;
  window.applyVoxFactionTheme = applyVoxFactionTheme;
  window.selectConduit = selectConduit;
  window.handleSealAction = handleSealAction;
  window.flushPendingDossierIfAny = flushPendingDossierIfAny;
  window.clearStreamTimers = clearStreamTimers;
  window.streamTextIntoElement = streamTextIntoElement;
  window.escapeHtml = escapeHtml;
  window.formatRedactedHtml = formatRedactedHtml;
  window.extractDynamicReplyCardMeta = extractDynamicReplyCardMeta;
  window.formatTime = formatTime;
  window.purgeVoxEntry = purgeVoxEntry;
  window.isRogueSectorInterference = isRogueSectorInterference;
  window.isVoxServerOnline = isVoxServerOnline;
  window.checkVoxServerStatus = checkVoxServerStatus;
  window.refreshTerminal = refreshTerminal;
  window.transmitQuestion = transmitQuestion;
  window.switchSubWindow = switchSubWindow;
  window.lockTerminal = lockTerminal;
  window.initVoxTerminalPage = initVoxTerminalPage;

  window.addEventListener('DOMContentLoaded', initVoxTerminalPage);
  window.addEventListener('vox:page-swapped', () => {
    if (document.getElementById('authScreen') && document.getElementById('directMessagesBox')) {
      initVoxTerminalPage();
    } else {
      if (pollTimer) {
        clearInterval(pollTimer);
        pollTimer = null;
      }
      if (serverStatusTimer) {
        clearInterval(serverStatusTimer);
        serverStatusTimer = null;
      }
      activeStreamTimers.forEach(t => clearTimeout(t));
      activeStreamTimers = [];
    }
  });
}

// CommonJS export for Node test runners
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    validChannels,
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
    SEEN_IDS_STORAGE_KEY,
    SESSION_AUTH_KEY,
    toggleOlderMessages,
    toggleOlderInterferences,
    syncSeenTokensFromStorage,
    markTokenSeen,
    rpcCall,
    callRpc,
    checkPendingDossierBuffer,
    applyVoxFactionTheme,
    selectConduit,
    handleSealAction,
    flushPendingDossierIfAny,
    clearStreamTimers,
    streamTextIntoElement,
    escapeHtml,
    formatRedactedHtml,
    extractDynamicReplyCardMeta,
    formatTime,
    purgeVoxEntry,
    isRogueSectorInterference,
    isVoxServerOnline,
    checkVoxServerStatus,
    refreshTerminal,
    transmitQuestion,
    switchSubWindow,
    lockTerminal,
    initVoxTerminalPage
  };
}
````
