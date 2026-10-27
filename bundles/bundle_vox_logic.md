# 📦 Fires of Armageddon // Bundle: Mode 7 - Astropathic Vox-Terminal Logic (Part 1: Auth & Conduits)

Conduit pass-seal verification, multi-channel auth state, and RPC messaging interfaces (`js/vox.js`).

## 📑 Table of Contents
- [js/vox.js (Part 1: Auth & Conduits)](#file-jsvoxjspart1authconduits)

---

## File: `js/vox.js (Part 1: Auth & Conduits)` <a id="file-jsvoxjspart1authconduits"></a>

````javascript
/**
 * Fires of Armageddon // Astropathic CRT Vox-Terminal Engine
 * Handles RLS-protected Supabase RPC conduits, real-time teletype audio streaming,
 * Vermilion Pass-Seal authentication, psychic interferences, and live server heartbeat status.
 */

// =========================================================================
// SUPABASE CONFIGURATION (RLS-Protected RPC Endpoints)
// =========================================================================
var SUPABASE_URL = (typeof window !== 'undefined' && window.SUPABASE_URL)
  ? window.SUPABASE_URL
  : 'https://dsfvhjjalexqpbzqoaqb.supabase.co';
var SUPABASE_ANON_KEY = (typeof window !== 'undefined' && window.SUPABASE_ANON_KEY)
  ? window.SUPABASE_ANON_KEY
  : 'sb_publishable_R3wXKsK7Gl54-8BNCauUNg_NIoosOOO';

var SEEN_IDS_STORAGE_KEY = 'foa_vox_seen_ids_v1';
var SESSION_AUTH_KEY = 'foa_vox_active_session_v1';

const validChannels = ['alpha', 'beta', 'gamma'];
var selectedChannel = 'alpha';
var activePassphrase = null;
var isChannelSealed = true;
var pollTimer = null;
var activeStreamTimers = [];
var showAllOlderMessages = false;
var showAllOlderInterferences = false;

function toggleOlderMessages() {
  showAllOlderMessages = !showAllOlderMessages;
  const dBox = document.getElementById('directMessagesBox');
  if (dBox) dBox.dataset.sig = '';
  refreshTerminal(false);
}

function toggleOlderInterferences() {
  showAllOlderInterferences = !showAllOlderInterferences;
  const iBox = document.getElementById('interferencesBox');
  if (iBox) iBox.dataset.sig = '';
  refreshTerminal(false);
}

// Storage helper for persistently seen messages
function getSeenStorage() {
  try {
    if (typeof localStorage !== 'undefined' && localStorage && typeof localStorage.getItem === 'function') {
      return localStorage;
    }
  } catch (e) {}
  try {
    if (typeof sessionStorage !== 'undefined' && sessionStorage && typeof sessionStorage.getItem === 'function') {
      return sessionStorage;
    }
  } catch (e) {}
  return null;
}

// Track which message & reply IDs have already animated so they only stream once
var seenTokens = (typeof window !== 'undefined' && window.seenTokens) ? window.seenTokens : new Set();
if (typeof window !== 'undefined') window.seenTokens = seenTokens;

function syncSeenTokensFromStorage() {
  try {
    const storage = getSeenStorage();
    if (storage) {
      const raw = storage.getItem(SEEN_IDS_STORAGE_KEY);
      if (raw) {
        JSON.parse(raw).forEach(k => seenTokens.add(k));
      }
    }
  } catch (e) {}
  try {
    if (typeof sessionStorage !== 'undefined' && sessionStorage && typeof sessionStorage.getItem === 'function') {
      const rawSess = sessionStorage.getItem(SEEN_IDS_STORAGE_KEY);
      if (rawSess) {
        JSON.parse(rawSess).forEach(k => seenTokens.add(k));
      }
    }
  } catch (e) {}
}
syncSeenTokensFromStorage();

function markTokenSeen(token) {
  seenTokens.add(token);
  const arr = Array.from(seenTokens);
  const bounded = arr.length > 1000 ? arr.slice(-1000) : arr;
  const json = JSON.stringify(bounded);
  try {
    const storage = getSeenStorage();
    if (storage) {
      storage.setItem(SEEN_IDS_STORAGE_KEY, json);
    }
  } catch (e) {}
  try {
    if (typeof sessionStorage !== 'undefined' && sessionStorage && typeof sessionStorage.setItem === 'function') {
      sessionStorage.setItem(SEEN_IDS_STORAGE_KEY, json);
    }
  } catch (e) {}
}

async function rpcCall(fnName, params) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${fnName}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    },
    body: JSON.stringify(params)
  });
  if (!res.ok) throw new Error(`Astropathic RPC fault (${res.status})`);
  return res.json();
}

function checkPendingDossierBuffer() {
  try {
    const raw = sessionStorage.getItem('foa_pending_vox_payload');
    const banner = document.getElementById('pendingDossierNotice');
    if (!raw) {
      if (banner) banner.classList.add('hidden');
      return null;
    }
    const parsed = JSON.parse(raw);
    if (banner) {
      banner.classList.remove('hidden');
      let targetName = 'The Exile // Sanctuary of Ash (Terminal Alpha)';
      if (parsed.channel === 'beta') {
        targetName = 'Lord Commander Junebug (Terminal Beta)';
      } else if (parsed.channel === 'gamma') {
        targetName = 'Kâhl Hârkyn Grîmledger // The Ledger of Embers (Terminal Gamma)';
      } else if (parsed.channel === 'distant' || /DISTANT|ORBITAL AUGUR/i.test(parsed.text || '')) {
        targetName = '🛰️ Distant Intercept // Orbital Augur Array (Neither Main Player Fielded)';
      }
      banner.innerHTML = `
        <div style="font-size:0.88rem; font-weight:800; margin-bottom:4px;">
          📡 [1 ENCRYPTED TRANSMISSION QUEUED IN BUFFER]
        </div>
        <div style="font-size:0.8rem; line-height:1.45; opacity:0.95;">
          Target Conduit: <strong>${targetName}</strong><br>
          Terminal password required to verify identity and authorize transmission. Enter your Vermilion Pass-Seal below to decrypt and broadcast to the Campaign Master!
        </div>
      `;
    }
    if (parsed.channel && parsed.channel !== 'distant' && parsed.channel !== selectedChannel) {
      selectConduit(parsed.channel, false);
    }
    return parsed;
  } catch (e) {
    return null;
  }
}

function applyVoxFactionTheme(chan, persist = false) {
  const theme = chan === 'beta' ? 'necron' : (chan === 'alpha' ? 'militarum' : null);
  if (typeof window !== 'undefined' && window.VoxAudio && typeof window.VoxAudio.setFactionTheme === 'function') {
    window.VoxAudio.setFactionTheme(theme, persist);
  }
  if (document.body && document.body.classList) {
    document.body.classList.toggle('theme-necron', theme === 'necron');
    document.body.classList.toggle('theme-militarum', theme === 'militarum');
    if (document.body.dataset) {
      document.body.dataset.factionTheme = theme || 'default';
    }
  }
  const dBox = document.getElementById('directMessagesBox');
  const iBox = document.getElementById('interferencesBox');
  if (dBox && dBox.classList && typeof dBox.classList.toggle === 'function') {
    dBox.classList.toggle('vox-preview-beta', chan === 'beta');
    dBox.classList.toggle('vox-preview-alpha', chan === 'alpha');
  }
  if (iBox && iBox.classList && typeof iBox.classList.toggle === 'function') {
    iBox.classList.toggle('vox-preview-beta', chan === 'beta');
    iBox.classList.toggle('vox-preview-alpha', chan === 'alpha');
  }
}

async function selectConduit(chan, clearPendingCheck = false) {
  selectedChannel = chan;
  applyVoxFactionTheme(chan, false);
  const cardA = document.getElementById('cardAlpha');
  const cardB = document.getElementById('cardBeta');
  const cardG = document.getElementById('cardGamma');
  const errEl = document.getElementById('authErrorMsg');
  if (cardA) {
    cardA.classList.toggle('selected', chan === 'alpha');
    cardA.classList.toggle('active', chan === 'alpha');
  }
  if (cardB) {
    cardB.classList.toggle('selected', chan === 'beta');
    cardB.classList.toggle('active', chan === 'beta');
  }
  if (cardG) {
    cardG.classList.toggle('selected', chan === 'gamma');
    cardG.classList.toggle('active', chan === 'gamma');
  }
  if (errEl) errEl.classList.add('hidden');

  // Update CRT Terminal Banner / Subtitle:
  const termTitle = document.getElementById('voxTerminalTitle');
  if (termTitle) {
    if (chan === 'gamma') {
      termTitle.textContent = '+++ FANE-NODE VÔL-09 ("THE DEAF EAR") // SUB-THERMOSPHERIC BLACK-LEDGER TERMINAL +++';
      termTitle.style.color = '#f5b041';
      termTitle.style.borderColor = 'rgba(245,176,65,0.4)';
    } else if (chan === 'beta') {
      termTitle.textContent = '+++ TOMB-SHIP AUTONOMOUS MASTER MATRIX // ROYAL COMMAND INTERLINK +++';
      termTitle.style.color = '#00ff88';
      termTitle.style.borderColor = 'rgba(0,255,136,0.3)';
    } else {
      termTitle.textContent = '+++ ASTROPATHIC CONDUIT: SEGMENTUM SOLAR HIGH COMMAND [DECK 44] +++';
      termTitle.style.color = '#00ff88';
      termTitle.style.borderColor = 'rgba(0,255,136,0.3)';
    }
  }

  try {
    isChannelSealed = await rpcCall('check_channel_seal', { p_channel: chan });
    const badge = document.getElementById('sealStatusBadge');
    const sub = document.getElementById('sealSubtitle');
    const label = document.getElementById('passLabel');
    const btn = document.getElementById('sealActionBtn');

    if (!badge || !sub || !label || !btn) return;

    if (!isChannelSealed) {
      badge.innerHTML = `<span class="pulse-dot"></span> UNSEALED CONDUIT • FIRST-BOOT SETUP`;
      sub.textContent = `This conduit has not been sealed yet. Choose a permanent secret passphrase—once inscribed, it will lock this terminal exclusively to you!`;
      label.textContent = `2. Create Your Permanent Secret Passphrase`;
      btn.textContent = `🛡️ Inscribe Permanent Seal & Unlock`;
    } else {
      badge.innerHTML = `<span class="pulse-dot"></span> VERMILION SEAL ACTIVE • ENCRYPTED`;
      const conduitOwner = chan === 'alpha'
        ? 'The Exile // Sanctuary of Ash'
        : (chan === 'beta' ? 'Lord Commander Junebug' : 'Kâhl Hârkyn Grîmledger // The Ledger of Embers');
      sub.textContent = `Conduit sealed to ${conduitOwner}. Enter your secret passphrase to decrypt.`;
      label.textContent = `2. Enter Secret Vermilion Pass-Seal`;
      btn.textContent = `🔓 Authenticate & Decrypt Conduit`;
    }
  } catch (err) {
    const errBadge = document.getElementById('sealStatusBadge');
    if (errBadge) errBadge.textContent = '⚠️ Configure SUPABASE_URL in pages/vox.html';
  }
}

async function handleSealAction() {
  const passEl = document.getElementById('passInput');
  const pass = (passEl ? passEl.value : '').trim();
  const errEl = document.getElementById('authErrorMsg');

  if (pass.length < 3) {
    if (errEl) {
      errEl.textContent = 'Passphrase must be at least 3 characters.';
      errEl.classList.remove('hidden');
    }
    return;
  }

  try {
    const result = await rpcCall('unlock_or_seal_channel', {
      p_channel: selectedChannel,
      p_passphrase: pass
    });

    if (!result || !result.ok) {
      if (errEl) {
        errEl.textContent = (result && result.error) || 'Access Denied: Invalid Vermilion Pass-Seal.';
        errEl.classList.remove('hidden');
      }
      if (typeof window !== 'undefined' && window.VoxAudio && typeof window.VoxAudio.playScarHazard === 'function') {
        window.VoxAudio.playScarHazard();
      }
      return;
    }

    activePassphrase = pass;
    applyVoxFactionTheme(selectedChannel, true);
    try {
      sessionStorage.setItem(SESSION_AUTH_KEY, JSON.stringify({ channel: selectedChannel, pass }));
    } catch (e) {}

    if (passEl) passEl.value = '';
    if (errEl) errEl.classList.add('hidden');

    const authScreen = document.getElementById('authScreen');
    const termScreen = document.getElementById('terminalScreen');
    const conduitLabel = document.getElementById('activeConduitLabel');
    const questionInput = document.getElementById('questionInput');
    if (authScreen) authScreen.classList.add('hidden');
    if (termScreen) termScreen.classList.remove('hidden');
    if (typeof window !== 'undefined' && window.VoxAudio && typeof window.VoxAudio.playTerminalPowerOn === 'function') {
      window.VoxAudio.playTerminalPowerOn(selectedChannel);
    }
    if (conduitLabel) {
      conduitLabel.textContent =
        selectedChannel === 'alpha'
          ? '🦅 CONDUIT ALPHA // THE SANCTUARY OF ASH (044TH KRIEG)'
          : (selectedChannel === 'beta'
              ? '💀 CONDUIT BETA // TOMB-SHIP AUTONOMOUS MASTER MATRIX (NECRONS)'
              : '⛏️ CONDUIT GAMMA // FANE-NODE VÔL-09 ("THE DEAF EAR")');
    }
    const unlockedTermTitle = document.getElementById('voxTerminalTitle');
    if (unlockedTermTitle) {
      if (selectedChannel === 'gamma') {
        unlockedTermTitle.textContent = '+++ FANE-NODE VÔL-09 ("THE DEAF EAR") // SUB-THERMOSPHERIC BLACK-LEDGER TERMINAL +++';
        unlockedTermTitle.style.color = '#f5b041';
        unlockedTermTitle.style.borderColor = 'rgba(245,176,65,0.4)';
      } else if (selectedChannel === 'beta') {
        unlockedTermTitle.textContent = '+++ TOMB-SHIP AUTONOMOUS MASTER MATRIX // ROYAL COMMAND INTERLINK +++';
        unlockedTermTitle.style.color = '#00ff88';
        unlockedTermTitle.style.borderColor = 'rgba(0,255,136,0.3)';
      } else {
        unlockedTermTitle.textContent = '+++ ASTROPATHIC CONDUIT: SEGMENTUM SOLAR HIGH COMMAND [DECK 44] +++';
        unlockedTermTitle.style.color = '#00ff88';
        unlockedTermTitle.style.borderColor = 'rgba(0,255,136,0.3)';
      }
    }
    if (questionInput) {
      questionInput.placeholder =
        selectedChannel === 'alpha'
          ? "Transmit orders to Logis-Prefect Vane (Zenith-09), or type 'Ship - ...' to query The Ashen Spirit (Deck 44)..."
          : (selectedChannel === 'beta'
              ? "Issue royal decrees to your Tomb-Ship Master Matrix & Cryptek Conclave, or include 'Vane' / 'Zenith-09' to hail the human orbital station..."
              : "Transmit Black-Ledger prospecting queries to Fane-Node Vôl-09 & the Brôkhyr Guild-Council (total radio silence)...");
    }

    // Check if a compiled Master Battle Dossier or Nemesis Dossier is waiting in sessionStorage!
    await flushPendingDossierIfAny();

    await refreshTerminal(false);
    if (pollTimer) clearInterval(pollTimer);
    pollTimer = setInterval(() => refreshTerminal(false), 7000);
  } catch (err) {
    if (errEl) {
      errEl.textContent = 'Connection error: Verify Supabase URL & Anon Key.';
      errEl.classList.remove('hidden');
    }
  }
}

async function flushPendingDossierIfAny() {
  try {
    const raw = sessionStorage.getItem('foa_pending_vox_payload');
    if (!raw) return;
    const queued = JSON.parse(raw);
    sessionStorage.removeItem('foa_pending_vox_payload');
    const notice = document.getElementById('pendingDossierNotice');
    if (notice) notice.classList.add('hidden');

    if (queued && queued.text && activePassphrase) {
      const isDistant = queued.channel === 'distant' || /DISTANT|ORBITAL AUGUR/i.test(queued.text);
      const senderName = isDistant
        ? '🛰️ Orbital Augur Array // Distant Intercept'
        : (selectedChannel === 'alpha'
            ? 'The Exile // Sanctuary of Ash'
            : (selectedChannel === 'beta'
                ? 'Lord Commander Junebug'
                : 'Kâhl Hârkyn Grîmledger // The Ledger of Embers'));

      await rpcCall('send_vox_message', {
        p_channel: selectedChannel,
        p_passphrase: activePassphrase,
        p_sender: senderName,
        p_question: queued.text
      });
    }
  } catch (e) {
    console.warn('Queued dossier auto-dispatch warning:', e);
  }
}

function clearStreamTimers() {
  activeStreamTimers.forEach(id => clearInterval(id));
  activeStreamTimers = [];
}

// Freeze-proof elapsed-time teletype streamer (never stalls on background tab throttling or apostrophes)
function streamTextIntoElement(targetEl, fullString, isHtmlRedacted = false) {
  if (!targetEl) return;
  const rawStr = String(fullString || '');
  if (!rawStr) {
    targetEl.textContent = '';
    return;
  }

  // Store the full target text on the DOM node so refreshTerminal can auto-complete if interrupted
  targetEl.dataset.fullText = rawStr;
  targetEl.dataset.isRedacted = isHtmlRedacted ? '1' : '0';
  targetEl.dataset.streaming = '1';

  const cursor = document.createElement('span');
  cursor.className = 'crt-cursor';
  cursor.textContent = '█';

  const textSpan = document.createElement('span');
  targetEl.innerHTML = '';
  targetEl.appendChild(textSpan);
  targetEl.appendChild(cursor);

  const startTime = Date.now();
  const charsPerSecond = 85; // Fast Imperial cogitator speed (~11ms per char)
  let lastIdx = 0;

  function finishStream() {
    targetEl.dataset.streaming = '0';
    if (isHtmlRedacted) {
      targetEl.innerHTML = formatRedactedHtml(rawStr);
    } else {
      targetEl.textContent = rawStr;
    }
    const scrollParent = targetEl.closest('.crt-messages') || targetEl.closest('.crt-monitor-frame');
    if (scrollParent) scrollParent.scrollTop = scrollParent.scrollHeight;
  }

  // Allow clicking anywhere on a streaming message card to instantly finish typing it!
  targetEl.onclick = () => {
    if (targetEl.dataset.streaming === '1') finishStream();
  };

  function step() {
    if (targetEl.dataset.streaming !== '1') return;

    const elapsedMs = Date.now() - startTime;
    const targetIdx = Math.min(rawStr.length, Math.max(lastIdx + 1, Math.floor((elapsedMs / 1000) * charsPerSecond)));

    if (targetIdx > lastIdx) {
      const currentSlice = rawStr.slice(0, targetIdx);
      if (isHtmlRedacted) {
        textSpan.innerHTML = formatRedactedHtml(currentSlice);
      } else {
        textSpan.textContent = currentSlice;
      }

      if (typeof window !== 'undefined' && window.VoxAudio && typeof window.VoxAudio.playTeletypeTick === 'function') {
        window.VoxAudio.playTeletypeTick('incoming');
      }

      const scrollParent = targetEl.closest('.crt-messages') || targetEl.closest('.crt-monitor-frame');
      if (scrollParent) scrollParent.scrollTop = scrollParent.scrollHeight;
      lastIdx = targetIdx;
    }

    if (lastIdx < rawStr.length) {
      setTimeout(step, 16);
    } else {
      finishStream();
    }
  }

  step();
}

function escapeHtml(str) {
  if (typeof document !== 'undefined') {
    const div = document.createElement('div');
    div.textContent = str || '';
    return div.innerHTML;
  }
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatRedactedHtml(raw) {
  return escapeHtml(raw).replace(
    /\[REDACTED\]/gi,
    '<span class="censor-bar">▓▓REDACTED▓▓</span>'
  );
}

/**
 * Dynamically extracts the speaker/card title from the first +++ ... +++ banner
 * (or [CARD_TITLE: ...]) of the Supabase reply, and strips that first line from
 * the body so the title appears cleanly at the top of the CRT card without repeating!
 */
function extractDynamicReplyCardMeta(rawReply) {
  const fallbackTitle = '++ CAMPAIGN MASTER // SEGMENTUM SOLAR COMMAND ++';
  if (!rawReply || typeof rawReply !== 'string') {
    return { cardTitle: fallbackTitle, cleanBody: rawReply || '' };
  }

  const trimmed = rawReply.trim();

  // 1. Check for explicit [CARD_TITLE: ...] override if present
  const explicitMatch = trimmed.match(/^\[CARD_TITLE:\s*([^\]]+)\]\s*\n?/i);
  if (explicitMatch) {
    return {
      cardTitle: `++ ${explicitMatch[1].trim().toUpperCase()} ++`,
      cleanBody: trimmed.slice(explicitMatch[0].length).trim()
    };
  }

  // 2. Check if the first line is a canonical +++ HEADER BANNER +++
  const bannerMatch = trimmed.match(/^\+{2,}\s*([^\n+]+?)\s*\+{2,}[ \t]*\n+/);
  if (bannerMatch) {
    return {
      cardTitle: `++ ${bannerMatch[1].trim().toUpperCase()} ++`,
      cleanBody: trimmed.slice(bannerMatch[0].length).trim()
````
