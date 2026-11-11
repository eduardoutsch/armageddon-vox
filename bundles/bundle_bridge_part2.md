# 📦 Fires of Armageddon // Bundle: Astropathic Courier Bridge (Part 2: Queue Draining, Heartbeat & Playwright Runner)

Single-message dispatch, interference bleed routing, Supabase heartbeat, and multi-tab Playwright runner (`vox_bridge.js` lines 526 to end).

## 📑 Table of Contents
- [vox_bridge.js (Part 2: Queue Draining, Heartbeat & Playwright Runner, Lines 526-end)](#file-voxbridgejspart2queuedrainingheartbeatplaywrightrunnerlines526end)

---

## File: `vox_bridge.js (Part 2: Queue Draining, Heartbeat & Playwright Runner, Lines 526-end)` <a id="file-voxbridgejspart2queuedrainingheartbeatplaywrightrunnerlines526end"></a>

````javascript
    }
  }

  const inputLocator = targetPage.locator(CHAT_INPUT_SELECTOR).first();
  try {
    await inputLocator.waitFor({ state: 'visible', timeout: 8000 });
  } catch (e) {
    logFn(`[WARNING // ${channelTag}] Chat input box not visible on tab. Retrying next cycle...`);
    return false;
  }

  const rawQ = msg.question || '';
  let prevState = await extractCleanLastModelResponse(targetPage);

  let rawReply;

  // LATE-ARRIVAL CATCHER: Only captures if the screen ALREADY shows this exact msgShortId!
  if (prevState.text && prevState.text.includes(msgShortId) && !hasMismatchedRefId(prevState.text, msgShortId) && isValidImperialDispatch(prevState.text)) {
    logFn(`[LATE-ARRIVAL CAPTURED // ${channelTag}] Found completed reply for MSG_ID ${msgShortId} already on screen! Forwarding to Supabase...`);
    messageAttemptTracker.delete(msg.id);
    rawReply = prevState.text;
  } else {
    const item = msg;
    const channel = item.channel;
    const rawText = rawQ;
    const refId = msgShortId;
    const safeQuestion = sanitizePlayerQueryForGemini(rawQ);
    const cleanMsg = safeQuestion;

    // 1. Detect if Alpha is addressing the Ship, OR if Beta is explicitly hailing Vane/Zenith-09:
    const isAlphaShipQuery = channel === 'alpha' && (
      /\b(ship|hull|ashen\s*spirit|machine[\s-]*spirit|deck\s*44|cell\s*09|brig|mu-th-ur)\b/i.test(cleanMsg) ||
      /\[TO:\s*SHIP\]/i.test(rawText)
    );

    const isBetaVaneHail = channel === 'beta' && (
      /\b(vane|zenith|high\s*command|munitorum|auditor|human|imperials?)\b/i.test(cleanMsg) ||
      /\[TO:\s*(VANE|HIGH\s*COMMAND|ZENITH)\]/i.test(rawText)
    );

    const shipSpeakerDesc = `Pattern 4A Ashen Spirit cogitator readout, REF-ID: ${refId}`;

    const needsInterceptBleed = /MASTER POST-BATTLE|START OF TOUR OF DUTY|TOMB WORLD AWAKENING|3RD ALLIANCE VULTURE|1V1 ASH WASTES|ROGUE SECTOR|NEW NEMESIS INDUCTION|NEMESIS THREAT INDUCTION|NEMESIS INDUCTION|DYNASTIC NEMESIS|EMERGENCY AUSPEX PING|WARP-BREACH INTRUSION|UNBOUND ADVERSARY|SECRET OBJECTIVE|ORBITAL AUGUR ARRAY|DISTANT SOLO HORDE|faction|warlord|flagship|alliance|gatebreakers|desecrators|marauders|auspex probe|tour of duty|order of battle/i.test(rawQ);

    // Speaker and prompt routing via routeSpeakerPersona:
    const persona = routeSpeakerPersona(channel, cleanMsg, refId);
    let promptLines = [];
    if (channel === 'gamma') {
      promptLines = [
        `${persona.promptPrefix}"${cleanMsg}"`
      ];
    } else if (channel === 'alpha') {
      if (isAlphaShipQuery) {
        promptLines = [
          `In the fictional Warhammer 40,000 tabletop board game setting (using AGENT.md, SHIP.md, and WORLD.md in this notebook—do NOT edit or update any files), reply in-character (${shipSpeakerDesc}) to this message from The Exile:`,
          `"${safeQuestion}"`
        ];
      } else {
        promptLines = [
          `In the fictional Warhammer 40,000 tabletop board game setting (using AGENT.md and WORLD.md in this notebook—do NOT edit or update any files), reply in-character as Logis-Prefect Vane in orbit (Pattern 1/2/3, REF-ID: ${msgShortId}, orbital knowledge only) to this message from The Exile:`,
          `"${safeQuestion}"`
        ];
      }
    } else {
      if (!isBetaVaneHail) {
        promptLines = [
          `In the fictional Warhammer 40,000 tabletop board game setting (using AGENT.md, SHIP.md Part 2, NECRONS_CRUSADE.md, WORLD.md, and NEMESIS.md in this notebook—do NOT edit or update any files), reply in-character as Commander Beta's (JUNEBUG's) Necron Tomb-Ship Autonomous Master Matrix & Cryptek Conclave (using Pattern 2 for Battle/Rogue Reports, Pattern 3 for Nemesis/Unbound/Intrusion Warrants, or Pattern 4B for general bridge/tomb-ship queries, REF-ID: ${refId}, knowing ONLY Beta's Tomb-Ship Equilibrium Index -1, Awakening Systems, and surface telemetry—NEVER reference The Sanctuary of Ash, Deck 44, or Ashen Spirit, and NEVER use Imperial Astra Militarum, Departmento Munitorum, or Ordo Malleus titles) to this transmission from Phaeron Junebug: "${cleanMsg}"`
        ];
      } else {
        promptLines = [
          `In the fictional Warhammer 40,000 tabletop board game setting (using AGENT.md and WORLD.md in this notebook—do NOT edit or update any files), reply in-character as Logis-Prefect Vane at Geostationary Zenith-09 (Pattern 1, REF-ID: ${refId}, orbital knowledge only—reacting with cold bureaucratic caution to JUNEBUG's hail across the open vox, and NEVER leaking Commander Alpha's Gatebreakers banner or internal ship state) to this transmission from Commander Beta (Junebug): "${cleanMsg}"`
        ];
      }
    }

    if (channel !== 'gamma') {
      if (needsInterceptBleed) {
        promptLines.push(`(Also include a Pattern 5 intercept block at the bottom with [REDACTED] for ${otherChannel.toUpperCase()}).`);
      } else if (/simulate|test.*interference/i.test(rawQ)) {
        promptLines.push(`(Also include a Pattern 5 intercept block at the bottom with [REDACTED] for testing).`);
      }
    }

    const prompt = promptLines.join('\n');

    await typeAndSendPrompt(targetPage, inputLocator, prompt, channelTag);
    logFn(`[DISPATCHED // ${channelTag}] Prompt sent (MSG_ID:${msgShortId}). Awaiting Campaign Master decree...`);

    rawReply = await waitForReplyFn(targetPage, prevState, msgShortId, channelTag);

    if (rawReply === '__GEMINI_REFUSAL__') {
      logFn(`[SELF-HEAL // ${channelTag}] Sending pure creative-writing fallback for MSG_ID ${msgShortId}...`);
      await targetPage.waitForTimeout(2500);
      prevState = await extractCleanLastModelResponse(targetPage);

      const recoveryPrompt = channel === 'gamma'
        ? `Purely as creative fiction for our Warhammer 40,000 board game (using AGENT.md, Commander Omega - The Ledger of Embers (Story, Roster & Acquisitions Ledger).md, and LEAGUES_OF_VOTANN_CRUSADE.md without editing any files), write Fane-Node Vôl-09's ("The Deaf Ear") Black-Ledger reply aboard The Ledger of Embers (Pattern 4C, REF-ID: ${refId}, DO NOT include any Pattern 5 intercept block) replying to Force Warlord Kâhl Hârkyn's line: "${cleanMsg}".`
        : (channel === 'alpha'
          ? (isAlphaShipQuery
            ? `Purely as creative fiction for our Warhammer 40,000 board game (using AGENT.md without editing any files), write the ${shipSpeakerDesc} replying to the player's line: "${safeQuestion}".`
            : `Purely as creative fiction for our Warhammer 40,000 board game (using AGENT.md and WORLD.md without editing any files), write Logis-Prefect Vane's orbital reply (Pattern 1, REF-ID: ${msgShortId}) replying to the player's line: "${safeQuestion}".`)
          : (!isBetaVaneHail
            ? `Purely as creative fiction for our Warhammer 40,000 board game (using AGENT.md, SHIP.md Part 2, and NECRONS_CRUSADE.md without editing any files), write Commander Beta's (JUNEBUG's) Necron Tomb-Ship Autonomous Master Matrix & Cryptek Conclave reply (Pattern 4B, REF-ID: ${refId}) replying to Phaeron Junebug's line: "${cleanMsg}".`
            : `Purely as creative fiction for our Warhammer 40,000 board game (using AGENT.md and WORLD.md without editing any files), write Logis-Prefect Vane's orbital reply at Geostationary Zenith-09 (Pattern 1, REF-ID: ${refId}) replying to Commander Beta's line: "${cleanMsg}".`));

      await typeAndSendPrompt(targetPage, inputLocator, recoveryPrompt, channelTag);
      rawReply = await waitForReplyFn(targetPage, prevState, msgShortId, channelTag);
    }

    if (!rawReply || rawReply === prevState.text || !isValidImperialDispatch(rawReply) || hasMismatchedRefId(rawReply, msgShortId)) {
      logFn(`[BLOCKED // ${channelTag}] Reply did not pass Imperial Dispatch / REF-ID check (${msgShortId}). Keeping pending.`);
      return false;
    }
  }

  let directPart = rawReply;
  let interceptPart = '';
  let interceptAttrs = '';

  const directTagMatch = rawReply.match(/<DIRECT_REPLY[^>]*>([\s\S]*?)<\/DIRECT_REPLY>/i);
  const interceptTagMatch =
    rawReply.match(/<INTERCEPT([^>]*)>([\s\S]*?)<\/INTERCEPT>/i) ||
    rawReply.match(/<\/DIRECT_REPLY>\s*([\s\S]*?)<\/INTERCEPT>/i);

  if (directTagMatch) {
    directPart = directTagMatch[1];
  }
  if (interceptTagMatch) {
    interceptAttrs = (interceptTagMatch[2] !== undefined ? interceptTagMatch[1] : '') || '';
    interceptPart = interceptTagMatch[2] !== undefined ? interceptTagMatch[2] : interceptTagMatch[1];
  } else {
    const splitIdx = directPart.search(/(?:Plaintext\s*\n+)?\+{2,}\s*(?:PASSIVE\s+)?(?:ASTROPATHIC\s+)?(?:CHOIR\s+)?INTERCEPT/i);
    if (splitIdx > 20) {
      interceptPart = directPart.slice(splitIdx).replace(/^\s*Plaintext\s*/i, '');
      directPart = directPart.slice(0, splitIdx);
    }
  }

  const finalDirectReply = scrubArtifacts(directPart);

  if (isGeminiErrorBanner(finalDirectReply) || !isValidImperialDispatch(finalDirectReply) || hasMismatchedRefId(finalDirectReply, msgShortId)) {
    logFn(`[BLOCKED // ${channelTag}] Extracted body failed validation or had mismatched REF-ID. Keeping MSG_ID ${msgShortId} pending.`);
    return false;
  }

  const reqHeaders = {
    'Content-Type': 'application/json',
    'apikey': serviceKey
  };

  const patchRes = await fetchFn(`${supabaseUrl}/rest/v1/vox_messages?id=eq.${msg.id}`, {
    method: 'PATCH',
    headers: reqHeaders,
    body: JSON.stringify({
      reply: finalDirectReply,
      status: 'answered',
      answered_at: new Date().toISOString()
    })
  });

  if (!patchRes.ok) {
    logFn(`[ERROR // ${channelTag}] Failed to write reply to Supabase (${patchRes.status})`);
    return false;
  }

  if (interceptPart && interceptPart.trim()) {
    if (msg.channel === 'gamma') {
      // Black-Ledger Protocol: Solo Votann terminal NEVER emits Pattern 5 interferences to alpha or beta!
      logFn(`[INTERCEPT BLEED SUPPRESSED // ${channelTag}] Solo Black-Ledger radio-silence maintained!`);
    } else {
      const cleanIntercept = scrubArtifacts(interceptPart);
      const isDualBroadcast = /ROGUE SECTOR AUXILIARY BATTLE REPORT|ORBITAL AUGUR ARRAY|DISTANT SOLO HORDE|DISTANT WARP-BREACH|DISTANT ADVERSARY|DISTANT INTERCEPT/i.test(rawQ);

      const isSelfTest =
        /simulate|test.*interference/i.test(rawQ) ||
        /target=["']?(self|same)/i.test(interceptAttrs);

      let destChannel = isSelfTest ? msg.channel : otherChannel;
      if (/target=["']?alpha/i.test(interceptAttrs)) destChannel = 'alpha';
      if (/target=["']?beta/i.test(interceptAttrs)) destChannel = 'beta';

      const targetChannels = isDualBroadcast
        ? ['alpha', 'beta', 'gamma']
        : (isSelfTest ? [destChannel] : Array.from(new Set([destChannel, 'gamma'])));

      const destOriginLabel = isDualBroadcast
        ? 'ORBITAL AUGUR ARRAY // PARALLEL SECTOR EVENT'
        : (isSelfTest
          ? 'ASHEN SPIRIT SYNTHETIC BLEED TEST // DECK 44 LOOPBACK'
          : originLabel);

      for (const targetCh of targetChannels) {
        await fetchFn(`${supabaseUrl}/rest/v1/vox_interferences`, {
          method: 'POST',
          headers: reqHeaders,
          body: JSON.stringify({
            target_channel: targetCh,
            origin_hint: destOriginLabel,
            redacted_text: cleanIntercept
          })
        });
      }
      logFn(`[INTERCEPT BLEED ROUTED // ${channelTag}] -> ${targetChannels.join(' & ').toUpperCase()}!`);
    }
  }

  logFn(`[DELIVERED // ${channelTag}] Verified reply for MSG_ID ${msgShortId} streamed to CRT terminal!`);
  return true;
}

async function drainChannelQueue(channelName, targetPage, options = {}) {
  const fetchFn = options.fetchFn || fetch;
  const supabaseUrl = options.supabaseUrl || SUPABASE_URL;
  const serviceKey = options.serviceKey !== undefined ? options.serviceKey : SERVICE_KEY;
  const logFn = options.logFn || logGreen;

  if (!serviceKey) {
    logFn(`[CONFIG WARNING // ${channelName.toUpperCase()}] SERVICE_KEY is missing! Check .env file.`);
    return 0;
  }

  const reqHeaders = {
    'Content-Type': 'application/json',
    'apikey': serviceKey
  };

  let processedCount = 0;
  while (true) {
    const res = await fetchFn(
      `${supabaseUrl}/rest/v1/vox_messages?channel=eq.${channelName}&status=eq.pending&order=created_at.asc`,
      { headers: reqHeaders }
    );

    if (!res.ok) {
      const errText = await res.text();
      logFn(`[ERROR // ${channelName.toUpperCase()} QUEUE (${res.status})]: ${errText}`);
      break;
    }

    const queue = await res.json();
    if (!Array.isArray(queue) || queue.length === 0) {
      break;
    }

    logFn(`[QUEUE // ${channelName.toUpperCase()}] ${queue.length} pending transmission(s) in Supabase.`);

    const oldestMsg = queue[0];
    const ok = await processSingleMessage(oldestMsg, targetPage, {
      fetchFn,
      supabaseUrl,
      serviceKey,
      logFn
    });
    if (!ok) break;

    processedCount++;
    if (typeof targetPage.waitForTimeout === 'function') {
      await targetPage.waitForTimeout(1500);
    }
  }
  return processedCount;
}

const DEFAULT_ANON_KEY = 'sb_publishable_R3wXKsK7Gl54-8BNCauUNg_NIoosOOO';

/**
 * Publishes the live Astropathic Courier server status ('online' or 'offline')
 * to Supabase's shared state (`nemesis_status.vox_server_heartbeat`) while preserving
 * all existing `horde_pool` and `nemesis_status` properties.
 *
 * @param {'online'|'offline'} status - Current server status
 * @param {object} [options] - Optional overrides for testing
 * @returns {Promise<boolean>} True if heartbeat was saved to Supabase
 */
async function publishServerHeartbeat(status = 'online', options = {}) {
  const fetchFn = options.fetchFn || (typeof fetch === 'function' ? fetch : null);
  if (!fetchFn) return false;

  const supabaseUrl = options.supabaseUrl || SUPABASE_URL;
  const anonKey = options.anonKey || DEFAULT_ANON_KEY;
  const rpcHeaders = {
    'Content-Type': 'application/json',
    'apikey': anonKey,
    'Authorization': `Bearer ${anonKey}`
  };

  try {
    let currentHordePool = null;
    let currentNemesisStatus = {};

    const getRes = await fetchFn(`${supabaseUrl}/rest/v1/rpc/get_shared_spawn_pools`, {
      method: 'POST',
      headers: rpcHeaders,
      body: JSON.stringify({})
    });
    if (getRes && getRes.ok) {
      const cur = await getRes.json();
      if (cur) {
        currentHordePool = (cur.horde_pool && typeof cur.horde_pool === 'object' && Object.keys(cur.horde_pool).length > 0)
          ? cur.horde_pool
          : null;
        currentNemesisStatus = cur.nemesis_status || {};
      }
    }

    const nextHeartbeat = {
      status: status === 'offline' ? 'offline' : 'online',
      updatedAt: Date.now()
    };

    const saveRes = await fetchFn(`${supabaseUrl}/rest/v1/rpc/save_shared_spawn_pools`, {
      method: 'POST',
      headers: rpcHeaders,
      body: JSON.stringify({
        p_horde_pool: currentHordePool,
        p_nemesis_status: {
          ...currentNemesisStatus,
          vox_server_heartbeat: nextHeartbeat
        }
      })
    });

    return Boolean(saveRes && saveRes.ok);
  } catch (e) {
    return false;
  }
}

async function runDualThreadCourier({ env = process.env, logFn = logGreen } = {}) {
  const { alphaThreadUrl, betaThreadUrl, gammaThreadUrl, extraThreadUrls } = resolveThreadUrls(env);

  if (!alphaThreadUrl || !betaThreadUrl) {
    logFn('[FATAL ERROR] ALPHA_THREAD_URL and BETA_THREAD_URL must be defined in your .env file!');
    return false;
  }

  const profileDir = path.join(__dirname, 'chrome_vox_profile');
  const context = await chromium.launchPersistentContext(profileDir, {
    headless: false,
    channel: 'chrome',
    ignoreDefaultArgs: ['--enable-automation'],
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox'
    ],
    viewport: { width: 1280, height: 860 }
  });

  const existingPages = context.pages();
  const alphaPage = existingPages[0] || await context.newPage();
  for (let i = 1; i < existingPages.length; i++) {
    await existingPages[i].close().catch(() => {});
  }
  logGreen('>> Opening Tab 1 (Commander Alpha // The Exile)...');
  await alphaPage.goto(alphaThreadUrl, { waitUntil: 'domcontentloaded' });
  if (typeof alphaPage.waitForSelector === 'function') {
    await alphaPage.waitForSelector(MODEL_TURN_SELECTOR, { timeout: 20000 }).catch(() => { });
  }
  if (typeof alphaPage.waitForTimeout === 'function') {
    await alphaPage.waitForTimeout(2000);
  }

  const betaPage = await context.newPage();
  logGreen('>> Opening Tab 2 (Commander Beta // JUNEBUG)...');
  await betaPage.goto(betaThreadUrl, { waitUntil: 'domcontentloaded' });
  if (typeof betaPage.waitForSelector === 'function') {
    await betaPage.waitForSelector(MODEL_TURN_SELECTOR, { timeout: 20000 }).catch(() => { });
  }
  if (typeof betaPage.waitForTimeout === 'function') {
    await betaPage.waitForTimeout(2000);
  }

  const hasDedicatedGammaTab = Boolean(gammaThreadUrl && gammaThreadUrl !== alphaThreadUrl);
  let gammaPage = alphaPage;
  if (hasDedicatedGammaTab) {
    gammaPage = await context.newPage();
    logGreen('>> Opening Tab 3 (Commander Omega // Kâhl Hârkyn)...');
    await gammaPage.goto(gammaThreadUrl, { waitUntil: 'domcontentloaded' });
    if (typeof gammaPage.waitForSelector === 'function') {
      await gammaPage.waitForSelector(MODEL_TURN_SELECTOR, { timeout: 20000 }).catch(() => { });
    }
    if (typeof gammaPage.waitForTimeout === 'function') {
      await gammaPage.waitForTimeout(2000);
    }
  }

  const extraTabs = [];
  for (const ext of extraThreadUrls) {
    if (/YOUR_[A-Z0-9_]*HERE|<your-/i.test(ext.url)) continue;
    const extPage = await context.newPage();
    logGreen(`>> Opening Extra Vox Tab (${ext.channel.toUpperCase()})...`);
    await extPage.goto(ext.url, { waitUntil: 'domcontentloaded' });
    if (typeof extPage.waitForSelector === 'function') {
      await extPage.waitForSelector(MODEL_TURN_SELECTOR, { timeout: 20000 }).catch(() => { });
    }
    extraTabs.push({ channel: ext.channel, page: extPage, busy: false });
  }

  try {
    const initCheck = await fetch(`${SUPABASE_URL}/rest/v1/vox_messages?status=eq.pending&select=id,channel,sender`, { headers });
    const initData = await initCheck.json();
    await publishServerHeartbeat('online');
    logGreen('================================================================');
    logGreen('++ DUAL-CONDUIT PARALLEL BRIDGE v6.3 (THREAD-LOCKED) ONLINE ++');
    logGreen(`++ Pending Transmissions in Supabase: ${Array.isArray(initData) ? initData.length : JSON.stringify(initData)}`);
    logGreen('================================================================');
  } catch (e) {
    logGreen(`[BOOT ERROR] Could not reach Supabase: ${e.message}`);
  }

  let shuttingDown = false;
  const handleShutdown = async () => {
    if (shuttingDown) return;
    shuttingDown = true;
    logGreen('\n[SHUTDOWN] Marking Astropathic Courier Server OFFLINE in Supabase...');
    await publishServerHeartbeat('offline').catch(() => {});
    process.exit(0);
  };
  process.once('SIGINT', handleShutdown);
  process.once('SIGTERM', handleShutdown);
  process.once('SIGHUP', handleShutdown);
  process.once('SIGBREAK', handleShutdown);
  if (typeof context.on === 'function') context.on('close', handleShutdown);
  if (typeof alphaPage.on === 'function') alphaPage.on('close', handleShutdown);
  if (typeof betaPage.on === 'function') betaPage.on('close', handleShutdown);
  if (hasDedicatedGammaTab && typeof gammaPage.on === 'function') gammaPage.on('close', handleShutdown);

  let busyAlpha = false;
  let busyBeta = false;
  let busyGamma = false;
  let heartbeatTick = 0;

  setInterval(() => {
    if (shuttingDown) return;
    heartbeatTick = (heartbeatTick + 1) % 2;
    if (heartbeatTick === 0) {
      publishServerHeartbeat('online').catch(() => {});
    }

    if (!busyAlpha) {
      busyAlpha = true;
      drainChannelQueue('alpha', alphaPage)
        .catch(err => logGreen(`[ERROR // ALPHA QUEUE]: ${err.message}`))
        .then(() => {
          if (!hasDedicatedGammaTab) {
            return drainChannelQueue('gamma', alphaPage)
              .catch(err => logGreen(`[ERROR // GAMMA QUEUE]: ${err.message}`));
          }
        })
        .finally(() => { busyAlpha = false; });
    }

    if (!busyBeta) {
      busyBeta = true;
      drainChannelQueue('beta', betaPage)
        .catch(err => logGreen(`[ERROR // BETA QUEUE]: ${err.message}`))
        .finally(() => { busyBeta = false; });
    }

    if (hasDedicatedGammaTab && !busyGamma) {
      busyGamma = true;
      drainChannelQueue('gamma', gammaPage)
        .catch(err => logGreen(`[ERROR // GAMMA QUEUE]: ${err.message}`))
        .finally(() => { busyGamma = false; });
    }

    for (const slot of extraTabs) {
      if (!slot.busy) {
        slot.busy = true;
        drainChannelQueue(slot.channel, slot.page)
          .catch(err => logGreen(`[ERROR // ${slot.channel.toUpperCase()} QUEUE]: ${err.message}`))
          .finally(() => { slot.busy = false; });
      }
    }
  }, 5000);
}

module.exports = {
  resolveServiceKey,
  resolveThreadUrls,
  routeSpeakerPersona,
  sanitizePlayerQueryForGemini,
  scrubArtifacts,
  isGeminiErrorBanner,
  isValidImperialDispatch,
  hasMismatchedRefId,
  isToolLoadingBanner,
  clickGeminiRetryButton,
  extractCleanLastModelResponse,
  waitForBulletproofReply,
  processSingleMessage,
  drainChannelQueue,
  runDualThreadCourier,
  publishServerHeartbeat,
  messageAttemptTracker
};

if (require.main === module) {
  runDualThreadCourier().catch(err => {
    console.error('[FATAL // ASTROPATHIC COURIER]', err);
    process.exit(1);
  });
}
````
