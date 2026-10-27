# 📦 Fires of Armageddon // Bundle: App Engine (Part 3: UI Telemetry & Persistence)

DOM event handlers, Auspex telemetry HUD synchronization, and session state persistence (`js/app.js` lines 1401 to end).

## 📑 Table of Contents
- [js/app.js (Part 3: UI Telemetry & Persistence, Lines 1401-end)](#file-jsappjspart3uitelemetrypersistencelines1401end)

---

## File: `js/app.js (Part 3: UI Telemetry & Persistence, Lines 1401-end)` <a id="file-jsappjspart3uitelemetrypersistencelines1401end"></a>

````javascript
  const doubleCost = !!(typeof document !== 'undefined' && document.getElementById('doubleCostToggle')?.checked);
  const teleCount = parseInt((typeof document !== 'undefined' && document.getElementById('teleCount')?.innerText) || '0', 10);
  const wireCount = parseInt((typeof document !== 'undefined' && document.getElementById('wireCount')?.innerText) || '0', 10);
  const mineCount = parseInt((typeof document !== 'undefined' && document.getElementById('mineCount')?.innerText) || '0', 10);

  const now = Date.now();
  lastSyncedUpdatedAt = now;

  const sharedRoomState = {
    roomCode,
    hasActiveSession: isSessionActive,
    battleRound,
    activeHordeFactionName: activeHordeFaction ? activeHordeFaction.name : null,
    setupFactionMode: setupFactionModeVal,
    spawnZoneCount,

    extraSpawnMod,
    firstRollBonus,
    baitTrapBonus,
    doubleCost,
    currentZoneSpawns,
    activeMiseries,
    sharedMiseryDeck,
    activeSecondaries,
    sharedSecondaryDeck,
    fortChecks,
    teleCount,
    wireCount,
    mineCount,
    updatedAt: now,
    lastSenderId: getClientDeviceId()
  };

  isPushingToCloud = true;
  try {
    const supabaseUrl = (typeof window !== 'undefined' && window.SUPABASE_URL) ? window.SUPABASE_URL : 'https://dsfvhjjalexqpbzqoaqb.supabase.co';
    const supabaseKey = (typeof window !== 'undefined' && window.SUPABASE_ANON_KEY) ? window.SUPABASE_ANON_KEY : 'sb_publishable_R3wXKsK7Gl54-8BNCauUNg_NIoosOOO';

    let currentHordePool = {};
    let currentNemesisStatus = {};
    try {
      const getRes = await fetch(`${supabaseUrl}/rest/v1/rpc/get_shared_spawn_pools`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({})
      });
      if (getRes && getRes.ok) {
        const cur = await getRes.json();
        if (cur) {
          currentHordePool = cur.horde_pool || {};
          currentNemesisStatus = cur.nemesis_status || {};
        }
      }
    } catch (e) {}

    const spawnerRooms = (currentNemesisStatus && currentNemesisStatus.spawner_rooms) ? currentNemesisStatus.spawner_rooms : {};
    spawnerRooms[roomCode] = sharedRoomState;

    const saveRes = await fetch(`${supabaseUrl}/rest/v1/rpc/save_shared_spawn_pools`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        p_horde_pool: null,
        p_nemesis_status: {
          ...currentNemesisStatus,
          spawner_rooms: spawnerRooms
        }
      })
    });

    if (saveRes && saveRes.ok) {
      updateSyncBadge(true, `☁️ Room Synced (${roomCode})`);
      return true;
    }
  } catch (err) {
    console.warn('Live spawner cloud push error:', err);
  } finally {
    isPushingToCloud = false;
  }
  return false;
}

function debouncedPushLiveSpawnerStateToCloud() {
  if (pushCloudTimer) clearTimeout(pushCloudTimer);
  pushCloudTimer = setTimeout(() => {
    pushLiveSpawnerStateToCloud();
  }, 400);
}

function applyRemoteSharedState(remoteState) {
  if (!remoteState) return;
  const isSessionActive = !!remoteState.hasActiveSession;

  const prevRound = battleRound;
  const prevFaction = activeHordeFaction ? activeHordeFaction.name : null;
  const prevSpawns = Array.isArray(currentZoneSpawns) ? [...currentZoneSpawns] : [];
  const prevMiseries = Array.isArray(activeMiseries) ? [...activeMiseries] : [];
  const prevSecondaries = Array.isArray(activeSecondaries) ? [...activeSecondaries] : [];

  const roundChanged = typeof remoteState.battleRound === 'number' && remoteState.battleRound !== prevRound;
  const factionChanged = !!(remoteState.activeHordeFactionName && remoteState.activeHordeFactionName !== prevFaction);
  const spawnsChanged = Array.isArray(remoteState.currentZoneSpawns) && JSON.stringify(remoteState.currentZoneSpawns) !== JSON.stringify(prevSpawns);
  const miseriesChanged = Array.isArray(remoteState.activeMiseries) && JSON.stringify(remoteState.activeMiseries) !== JSON.stringify(prevMiseries);
  const secondariesChanged = Array.isArray(remoteState.activeSecondaries) && JSON.stringify(remoteState.activeSecondaries) !== JSON.stringify(prevSecondaries);

  if (typeof remoteState.battleRound === 'number') {
    battleRound = remoteState.battleRound;
  }

  if (remoteState.activeHordeFactionName && typeof HORDE_FACTIONS !== 'undefined') {
    const found = HORDE_FACTIONS.find(f => f.name === remoteState.activeHordeFactionName);
    if (found) {
      const mode = remoteState.setupFactionMode || found.name;
      activeHordeFaction = {
        ...found,
        syncedRoomCode: remoteState.roomCode || getActiveRoomCode(),
        syncedMode: mode
      };
      const sel = (typeof document !== 'undefined') ? document.getElementById('hordeFactionSelect') : null;
      if (sel) sel.value = found.name;
      const setupSel = (typeof document !== 'undefined') ? document.getElementById('setupFactionMode') : null;
      if (setupSel) setupSel.value = mode;
      renderFactionReminderBanner();
    }
  }

  if (remoteState.setupFactionMode && typeof document !== 'undefined') {
    const modeSel = document.getElementById('setupFactionMode');
    if (modeSel) modeSel.value = remoteState.setupFactionMode;
  }

  if (Array.isArray(remoteState.currentZoneSpawns)) {
    currentZoneSpawns = remoteState.currentZoneSpawns;
    if (currentZoneSpawns.length > 0) {
      renderSpawnZones();
      if (typeof evaluateWarpBreachIntrusions === 'function') evaluateWarpBreachIntrusions();
    }
  }

  if (Array.isArray(remoteState.activeMiseries)) {
    activeMiseries = remoteState.activeMiseries;
  }
  if (Array.isArray(remoteState.sharedMiseryDeck)) {
    sharedMiseryDeck = remoteState.sharedMiseryDeck;
  }
  if (Array.isArray(remoteState.activeSecondaries)) {
    activeSecondaries = remoteState.activeSecondaries;
  }
  if (Array.isArray(remoteState.sharedSecondaryDeck)) {
    sharedSecondaryDeck = remoteState.sharedSecondaryDeck;
  }

  renderSharedDecks();

  if (typeof document !== 'undefined') {
    if (remoteState.spawnZoneCount && document.getElementById('spawnZoneCountSelect')) {
      document.getElementById('spawnZoneCountSelect').value = remoteState.spawnZoneCount;
    }
    if (remoteState.extraSpawnMod && document.getElementById('extraSpawnMod')) {
      document.getElementById('extraSpawnMod').value = remoteState.extraSpawnMod;
    }
    if (document.getElementById('firstRollBonusCheck')) {
      document.getElementById('firstRollBonusCheck').checked = !!remoteState.firstRollBonus;
    }
    if (document.getElementById('baitTrapBonusCheck')) {
      document.getElementById('baitTrapBonusCheck').checked = !!remoteState.baitTrapBonus;
    }
    if (document.getElementById('doubleCostToggle')) {
      document.getElementById('doubleCostToggle').checked = !!remoteState.doubleCost;
    }

    if (typeof remoteState.wireCount === 'number' && document.getElementById('wireCount')) {
      document.getElementById('wireCount').innerText = String(remoteState.wireCount);
    }
    if (typeof remoteState.teleCount === 'number' && document.getElementById('teleCount')) {
      document.getElementById('teleCount').innerText = String(remoteState.teleCount);
    }
    if (typeof remoteState.mineCount === 'number' && document.getElementById('mineCount')) {
      document.getElementById('mineCount').innerText = String(remoteState.mineCount);
    }
    if (Array.isArray(remoteState.fortChecks)) {
      const cbs = document.querySelectorAll('.fort-grid input[type="checkbox"]');
      cbs.forEach((cb, idx) => {
        if (idx < remoteState.fortChecks.length) cb.checked = !!remoteState.fortChecks[idx];
      });
    }

    // Trigger subtle CRT static shake specifically on the card(s) that changed
    if (roundChanged) {
      const roundBanner = document.querySelector('#tab1 .round-banner') || document.querySelector('.round-banner');
      if (roundBanner) triggerCardStaticShake(roundBanner);
    }
    if (factionChanged) {
      const factionBanner = document.querySelector('.faction-reminder-bar');
      if (factionBanner) triggerCardStaticShake(factionBanner);
    }
    if (spawnsChanged) {
      const zoneCards = document.querySelectorAll('#spawnResultsContainer .spawn-zone');
      zoneCards.forEach((card, idx) => {
        const prevZ = prevSpawns[idx];
        const curZ = currentZoneSpawns[idx];
        if (!prevZ || JSON.stringify(prevZ) !== JSON.stringify(curZ)) {
          triggerCardStaticShake(card);
        }
      });
    }
    if (miseriesChanged) {
      const misCards = document.querySelectorAll('#activeMiseriesBox .card.misery');
      misCards.forEach((card, idx) => {
        const prevM = prevMiseries[idx];
        const curM = activeMiseries[idx];
        if (!prevM || JSON.stringify(prevM) !== JSON.stringify(curM)) {
          triggerCardStaticShake(card);
        }
      });
    }
    if (secondariesChanged) {
      const secCards = document.querySelectorAll('#activeSecondariesBox .card.secondary');
      secCards.forEach((card, idx) => {
        const prevS = prevSecondaries[idx];
        const curS = activeSecondaries[idx];
        if (!prevS || JSON.stringify(prevS) !== JSON.stringify(curS)) {
          triggerCardStaticShake(card);
        }
      });
    }
  }

  // Update round titles and HUD
  updateRoundBanner();
  updateHUD();

  if (isSessionActive && typeof document !== 'undefined') {
    const setupScreen = document.getElementById('setupScreen');
    const gameScreen = document.getElementById('gameScreen');
    if (setupScreen) setupScreen.classList.add('hidden');
    if (gameScreen) gameScreen.classList.remove('hidden');
  }

  // Persist to local cache so reload maintains sync
  saveSessionState();
}

async function pollLiveSpawnerStateFromCloud(force = false) {
  if (typeof fetch !== 'function' || isPushingToCloud || isPollingFromCloud) return false;
  const roomCode = getActiveRoomCode();
  if (roomCode !== currentRoomCode) {
    currentRoomCode = roomCode;
    lastSyncedUpdatedAt = 0;
    lastKnownStateSignature = '';
  }

  isPollingFromCloud = true;
  try {
    const supabaseUrl = (typeof window !== 'undefined' && window.SUPABASE_URL) ? window.SUPABASE_URL : 'https://dsfvhjjalexqpbzqoaqb.supabase.co';
    const supabaseKey = (typeof window !== 'undefined' && window.SUPABASE_ANON_KEY) ? window.SUPABASE_ANON_KEY : 'sb_publishable_R3wXKsK7Gl54-8BNCauUNg_NIoosOOO';

    const res = await fetch(`${supabaseUrl}/rest/v1/rpc/get_shared_spawn_pools`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({})
    });
    if (!res || !res.ok) return false;
    const data = await res.json();
    if (!data || !data.nemesis_status || !data.nemesis_status.spawner_rooms) return false;

    const remoteState = data.nemesis_status.spawner_rooms[roomCode];
    if (!remoteState || !remoteState.updatedAt) return false;

    if (!force) {
      if (remoteState.lastSenderId === getClientDeviceId()) return false;
      if (remoteState.updatedAt <= lastSyncedUpdatedAt) return false;
    }

    const currentSig = `${remoteState.battleRound || 0}_${remoteState.activeHordeFactionName || ''}_` +
      `${JSON.stringify(remoteState.currentZoneSpawns || [])}_` +
      `${JSON.stringify(remoteState.activeMiseries || [])}_` +
      `${JSON.stringify(remoteState.activeSecondaries || [])}`;

    if (!force && currentSig === lastKnownStateSignature) {
      lastSyncedUpdatedAt = remoteState.updatedAt;
      return false;
    }

    applyRemoteSharedState(remoteState);
    lastSyncedUpdatedAt = remoteState.updatedAt;
    lastKnownStateSignature = currentSig;

    updateSyncBadge(true, `☁️ Synced with Ally (${roomCode} • R${remoteState.battleRound || 0})`);

    // Audio cue plays strictly once per newly arrived remote change (never repeats or on initial hydration)
    if (hasCompletedInitialSync) {
      if (typeof window !== 'undefined' && window.VoxAudio && typeof window.VoxAudio.playCloudSyncChime === 'function') {
        window.VoxAudio.playCloudSyncChime();
      }
    } else {
      hasCompletedInitialSync = true;
    }
    return true;
  } catch (err) {
    return false;
  } finally {
    isPollingFromCloud = false;
  }
}


function exportHordeStatsToCrusade() {
  const snapshot = (typeof snapshotCurrentHordeStats === 'function')
    ? snapshotCurrentHordeStats()
    : null;
  if (typeof window !== 'undefined' && window.VoxAudio && typeof window.VoxAudio.playPowerSurge === 'function') {
    window.VoxAudio.playPowerSurge();
  }
  if (typeof document !== 'undefined') {
    const noticeEl = document.getElementById('exportCrusadeNotice');
    if (noticeEl) {
      noticeEl.style.display = 'block';
      noticeEl.innerHTML = `✅ <strong>Horde Battle Telemetry Exported!</strong><br>Kills: <strong>${snapshot?.hordeKills || 0}</strong> • SP: <strong>${snapshot?.spEarned || 0}</strong> Earned / <strong>${snapshot?.spSpent || 0}</strong> Spent • Miseries: <strong>${snapshot?.miseriesDrawn?.length || 0}</strong> • Secondaries: <strong>${snapshot?.secondariesCompleted?.length || 0}</strong> Won / <strong>${snapshot?.secondariesFailed?.length || 0}</strong> Failed.<br>Ready to attach in <a href="crusade.html" style="color:var(--gold); text-decoration:underline;">Mode 5 Crusade Dossier</a>!`;
      setTimeout(() => {
        if (noticeEl) noticeEl.style.display = 'none';
      }, 8000);
    } else if (typeof alert === 'function') {
      alert(`✅ Horde Battle Telemetry Exported!\nKills: ${snapshot?.hordeKills || 0}\nSP: ${snapshot?.spEarned || 0} Earned / ${snapshot?.spSpent || 0} Spent\nMiseries: ${snapshot?.miseriesDrawn?.length || 0}\n\nGo to crusade.html to attach it to your Master Dossier!`);
    }
  }
  return snapshot;
}

// Dual export for Node.js test runner and browser environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    get battleRound() { return battleRound; },
    get activeHordeFaction() { return activeHordeFaction; },
    get selectedRoleVal() { return selectedRoleVal; },
    get cp() { return cp; },
    get sp() { return sp; },
    get spSpentThisRound() { return spSpentThisRound; },
    get spGainedThisRound() { return spGainedThisRound; },
    get spRoundCap() { return spRoundCap; },
    get bankedSpLost() { return bankedSpLost; },
    get stratCount() { return stratCount; },
    get currentZoneSpawns() { return currentZoneSpawns; },
    get activeMiseries() { return activeMiseries; },
    get activeSecondaries() { return activeSecondaries; },
    selectMode,
    selectRole,
    resolveRoomSyncedFaction,
    manualChangeFaction,
    onChangeSpawnZoneCount,
    renderFactionReminderBanner,
    startSession,
    updateHUD,
    gainSP,
    spendSP,
    loseSP,
    adjustSpRoundTally,
    adjustStratTally,
    adjCP,
    adjustCpDirect,
    spendCPForStrat,
    buyResupply,
    leaveSession,
    clearSpawnerResults,
    resetMatchToSetup,
    saveSessionState,
    restoreSessionState,
    clearSessionState,
    adjMarker,
    switchTab,
    togglePrivacy,
    advanceBattleRound,
    drawMisery,
    triggerSpecificMisery,
    drawSecondary,
    replaceSecondary,
    drawSecretCards,
    pickSecretCard,
    triggerChangeOfPlans,
    rollAllSpawnZones,
    rollDownZone,
    triggerZoneRollDown,
    exportHordeStatsToCrusade,
    saveCustomPool,
    loadCustomPool,
    pushLiveSpawnerStateToCloud,
    pollLiveSpawnerStateFromCloud,
    getActiveRoomCode,
    onRoomCodeChanged,
    getClientDeviceId,
    updateSyncBadge,
    applyRemoteSharedState,
    triggerCardStaticShake,
    onSetupFactionModeChanged,
    getActiveHordeFaction: () => activeHordeFaction
  };
}

if (typeof window !== 'undefined') {
  window.getActiveRoomCode = getActiveRoomCode;
  window.onRoomCodeChanged = onRoomCodeChanged;
  window.onSetupFactionModeChanged = onSetupFactionModeChanged;
  window.pollLiveSpawnerStateFromCloud = pollLiveSpawnerStateFromCloud;
  window.debouncedPushLiveSpawnerStateToCloud = debouncedPushLiveSpawnerStateToCloud;
  window.triggerZoneRollDown = triggerZoneRollDown;
  window.exportHordeStatsToCrusade = exportHordeStatsToCrusade;
}

// =========================================================================
// CLOUD-SYNCED STANDARD HORDE POOL & [10+]/[13+] WARP-BREACH INTRUSION HOOK
// =========================================================================
(function () {
  const SUPABASE_URL_SPAWNER = 'https://dsfvhjjalexqpbzqoaqb.supabase.co';
  const SUPABASE_ANON_SPAWNER = 'sb_publishable_R3wXKsK7Gl54-8BNCauUNg_NIoosOOO';

  async function syncSpawnerPoolFromSupabase() {
    if (typeof fetch !== 'function' || typeof localStorage === 'undefined') return;
    try {
      const res = await fetch(`${SUPABASE_URL_SPAWNER}/rest/v1/rpc/get_shared_spawn_pools`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_SPAWNER,
          'Authorization': `Bearer ${SUPABASE_ANON_SPAWNER}`
        },
        body: JSON.stringify({})
      });
      if (!res || !res.ok) return;
      const data = await res.json();
      if (data && data.ok && data.horde_pool && typeof data.horde_pool === 'object' && Object.keys(data.horde_pool).length > 0) {
        if (data.horde_pool.byFaction) {
          const localRaw = localStorage.getItem('foa_custom_shelf_pool_v1');
          let localPool = {};
          try { localPool = localRaw ? JSON.parse(localRaw) : {}; } catch (e) {}
          const mergedByFaction = {
            ...(localPool.byFaction || {}),
            ...data.horde_pool.byFaction
          };
          const mergedPool = {
            ...localPool,
            ...data.horde_pool,
            byFaction: mergedByFaction
          };
          localStorage.setItem('foa_custom_shelf_pool_v1', JSON.stringify(mergedPool));
        } else {
          localStorage.setItem('foa_custom_shelf_pool_v1', JSON.stringify(data.horde_pool));
        }
        renderLiveSpawnerBracketTable();
      }
    } catch (e) {}
  }

  function renderLiveSpawnerBracketTable() {
    if (typeof document === 'undefined') return;
    const box = document.getElementById('liveSpawnerBracketWindow');
    if (!box) return;

    const facName = document.getElementById('hordeFactionSelect')?.value || '';
    let pool = { b34: '', b56: '', b79: '', b10: '', b13: '' };

    try {
      const raw = localStorage.getItem('foa_custom_shelf_pool_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (facName && parsed.byFaction) {
          pool = { ...pool, ...(parsed.byFaction[facName] || {}) };
        } else if (!parsed.byFaction) {
          pool = { ...pool, ...parsed };
        }
      }
    } catch (e) {}

    const tables = (typeof HORDE_FACTION_SPAWN_TABLES !== 'undefined')
      ? HORDE_FACTION_SPAWN_TABLES
      : ((typeof window !== 'undefined' && window.HORDE_FACTION_SPAWN_TABLES) ? window.HORDE_FACTION_SPAWN_TABLES : {});
    const refTable = (facName && tables[facName]) ? tables[facName] : {};

    const showVal = (val, refArr) => {
      if (val && val.trim()) return val;
      if (Array.isArray(refArr) && refArr.length > 0) return refArr.join(' • ');
      return `<span style="color:var(--red); font-style:italic;">⚠️ Horde Pool Empty${facName ? ' for ' + facName : ''} — Configure in Mode 4 (Roster)!</span>`;
    };

    box.innerHTML = `
      <div style="margin-bottom:6px; color:var(--muted); font-size:0.78rem;">
        ☁️ <strong>Active Standard Horde Spawn Pool ${facName ? '(' + facName + ')' : ''}</strong>:
      </div>
      <table class="bracket-matrix-table">
        <thead>
          <tr>
            <th style="width:145px;">2D6 + Mod Bracket</th>
            <th>Configured ${facName || 'Horde'} Shelf Units</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><strong>[2] No Spawn</strong></td><td style="color:var(--muted);">Breach Holds (Unmodified 2 always spawns nothing)</td></tr>
          <tr><td><strong>[3–4] (0–75 pts)</strong></td><td>${showVal(pool.b34, refTable.b34)}</td></tr>
          <tr><td><strong>[5–6] (76–150 pts)</strong></td><td>${showVal(pool.b56, refTable.b56)}</td></tr>
          <tr><td><strong>[7–9] (151–300 pts)</strong></td><td>${showVal(pool.b79, refTable.b79)}</td></tr>
          <tr><td><strong>[10–12] (301–550 pts)</strong></td><td>${showVal(pool.b10, refTable.b10)} <br><span style="color:var(--red); font-size:0.74rem;">⚡ + 1D6 Warp-Breach Intrusion Check (6+ = Campaign Master Adversary/Nemesis!)</span></td></tr>
          <tr><td><strong>[13+] (551+ pts)</strong></td><td>${showVal(pool.b13, refTable.b13)} <br><span style="color:var(--red); font-size:0.74rem;">⚡ + 1D6 Warp-Breach Intrusion Check (6+ = Campaign Master Adversary/Nemesis!)</span></td></tr>
        </tbody>
      </table>
    `;
  }

  function transmitHordeIntrusionPing(zoneNum, bracketLabel, channel) {
    const roomStr = (typeof document !== 'undefined' && document.getElementById('seedInput')?.value) || 'HADES-1';
    const roundStr = (typeof document !== 'undefined' && document.getElementById('spawnerBtnRound')?.textContent) || '1';
    const facStr = (typeof document !== 'undefined' && document.getElementById('hordeFactionSelect')?.value) || 'Horde';

    const isDistant = channel === 'distant';
    const isBeta = channel === 'beta';
    const cleanBracket = bracketLabel.startsWith('Bracket') ? bracketLabel : `Bracket [${bracketLabel}]`;

    const payload = isDistant
      ? [
          `+++ ORBITAL AUGUR ARRAY // DISTANT WARP-BREACH ADVERSARY DETECTED +++`,
          `• MODE & ROOM SEED: Mode 1 (Distant Solo Horde Breach // Room: ${roomStr} // Battle Round ${roundStr})`,
          `• THEATRE & SENSOR SWEEP: Distant Sector Grid ${zoneNum} // Orbital Augur Intercept (Neither Main Player Fielded)`,
          `• REMOTE SECTOR & BRACKET: Distant Spawn Zone ${zoneNum} rolled ${cleanBracket} + [6+ WARP-BREACH INTRUSION]!`,
          `• ACTIVE DISTANT ENEMY FACTION: ${facStr}`,
          `• REQUEST FOR CAMPAIGN MASTER: Long-range augurs have detected an anomalous Warp signature / Unbound Adversary tearing into a distant engagement outside the primary lines. Please execute the Contextual 3-Tier Intrusion Roll (NEMESIS.md) for this remote sector and broadcast the telemetry intercept to BOTH command networks!`
        ].join('\n')
      : (isBeta
          ? `+++ EMERGENCY AUSPEX PING: HORDE WARP-BREACH INTRUSION DETECTED +++\n• CONDUIT: TOMB-SHIP OMNICIDAL AUSPEX [PHAERON JUNEBUG]\n• MODE & ROOM SEED: Mode 1 (Horde Command // Room: ${roomStr} // Battle Round ${roundStr})\n• TRIGGER: Spawn Zone ${zoneNum} rolled ${cleanBracket} + [6+ WARP-BREACH INTRUSION] against ${facStr}!\n• REQUEST FOR TOMB-SHIP MASTER MATRIX: Execute the Contextual 3-Tier Intrusion Roll (NEMESIS.md) and reveal which apex threat or Nemesis has hijacked Spawn Zone ${zoneNum}!`
          : `+++ EMERGENCY AUSPEX PING: HORDE WARP-BREACH INTRUSION DETECTED +++\n• CONDUIT: MUNITORUM PERIMETER AUGUR [THE EXILE // 044TH KRIEG]\n• MODE & ROOM SEED: Mode 1 (Horde Command // Room: ${roomStr} // Battle Round ${roundStr})\n• TRIGGER: Spawn Zone ${zoneNum} rolled ${cleanBracket} + [6+ WARP-BREACH INTRUSION] against ${facStr}!\n• REQUEST FOR CAMPAIGN MASTER: Please execute the Contextual 3-Tier Intrusion Roll (NEMESIS.md) and reveal which entity hijacks Spawn Zone ${zoneNum}!`);

    if (typeof window !== 'undefined' && window.VoxAudio && typeof window.VoxAudio.transmitToVox === 'function') {
      window.VoxAudio.transmitToVox(channel, payload);
    }
  }

  const transmitIntrusionPing = transmitHordeIntrusionPing;
  if (typeof window !== 'undefined') {
    window.transmitHordeIntrusionPing = transmitHordeIntrusionPing;
    window.transmitIntrusionPing = transmitIntrusionPing;
  }

  function evaluateWarpBreachIntrusions() {
    if (typeof document === 'undefined') return;
    const container = document.getElementById('spawnResultsContainer');
    if (!container) return;

    const cards = container.querySelectorAll('.spawn-zone');
    if (!cards || cards.length === 0) return;

    const roomStr = (document.getElementById('seedInput')?.value || 'HADES-1').trim().toUpperCase();
    const roundStr = (document.getElementById('spawnerBtnRound')?.textContent || '1').trim();
    let anyIntrusionTriggered = false;
    const currentWaveIntrusions = [];

    cards.forEach((card, idx) => {
      const text = card.textContent || '';
      const isBigBracket = /Bracket\s*\[(10[–\-]12|10\+|13\+)\]/i.test(text) && !/Rolled Down/i.test(text);
      if (!isBigBracket) return;

      const zoneNum = idx + 1;
      const bracketMatch = text.match(/Bracket\s*\[[^\]]+\]/i);
      const bracketLabel = bracketMatch ? bracketMatch[0] : 'Bracket [10+]';

      // Deterministic 1D6 roll seeded by Room Code + Round + Zone so both players see the exact same result!
      let intrusionRoll = 1;
      if (typeof cyrb128 === 'function' && typeof mulberry32 === 'function') {
        const seedArr = cyrb128(`${roomStr}_INTRUSION_R${roundStr}_Z${zoneNum}`);
        const rng = mulberry32(seedArr[0]);
        intrusionRoll = Math.floor(rng() * 6) + 1;
      } else if (typeof hashString === 'function' && typeof mulberry32 === 'function') {
        const rng = mulberry32(hashString(`${roomStr}_INTRUSION_R${roundStr}_Z${zoneNum}`));
        intrusionRoll = Math.floor(rng() * 6) + 1;
      } else {
        intrusionRoll = Math.floor(Math.random() * 6) + 1;
      }

      if (intrusionRoll >= 6) {
        anyIntrusionTriggered = true;
        currentWaveIntrusions.push(`${roomStr}_R${roundStr}_Z${zoneNum}_${intrusionRoll}`);
        if (!card.querySelector('.warp-intrusion-alert')) {
          card.style.borderColor = 'var(--red)';
          const alertDiv = document.createElement('div');
          alertDiv.className = 'warp-intrusion-alert';
          alertDiv.style.textAlign = 'center';
          alertDiv.innerHTML = `
            <div style="color:var(--red); font-weight:900; font-family:monospace; font-size:0.84rem; margin-bottom:4px; text-align:center;">
              ⚡ [WARP-BREACH INTRUSION ROLLED: D6 = ${intrusionRoll} (6+) — ADVERSARY / NEMESIS HIJACK!]
            </div>
            <div style="font-size:0.8rem; color:#e2e8f0; margin-bottom:8px; text-align:center;">
              Instead of the standard Horde unit above, an anomalous signature is tearing through <strong>Spawn Zone ${zoneNum}</strong>! Ping the Campaign Master on Vox to reveal the intruder:
            </div>
            <div style="display:flex; gap:8px; flex-wrap:wrap; justify-content:center; align-items:center;">
              <button type="button" class="btn-red btn-sm" onclick="transmitHordeIntrusionPing(${zoneNum}, '${bracketLabel}', 'alpha')">🦅 Ping Vox (The Exile)</button>
              <button type="button" class="btn-green btn-sm" onclick="transmitHordeIntrusionPing(${zoneNum}, '${bracketLabel}', 'beta')">💀 Ping Tomb-Ship (Junebug)</button>
              <button type="button" class="btn-gold btn-sm" onclick="transmitHordeIntrusionPing(${zoneNum}, '${bracketLabel}', 'distant')">📡 Ping Vox (Distant Intercept)</button>
            </div>
          `;
          card.appendChild(alertDiv);
        }
      } else {
        if (!card.querySelector('.intrusion-badge-clean') && !card.querySelector('.warp-intrusion-alert')) {
          const cleanNote = document.createElement('div');
          cleanNote.className = 'intrusion-badge-clean';
          cleanNote.style.cssText = 'margin-top:6px; font-size:0.74rem; color:var(--muted); font-family:monospace; text-align:center;';
          cleanNote.textContent = `[Warp-Breach Intrusion Check: D6 = ${intrusionRoll} (Needed 6+) — Standard Horde Wave Holds]`;
          card.appendChild(cleanNote);
        }
      }
    });

    const waveSignature = currentWaveIntrusions.sort().join('|');
    if (anyIntrusionTriggered && waveSignature && waveSignature !== lastWarpSirenSeedKey) {
      lastWarpSirenSeedKey = waveSignature;
      if (typeof window !== 'undefined' && window.VoxAudio && typeof window.VoxAudio.playWarpSiren === 'function') {
        window.VoxAudio.playWarpSiren();
      }
    }
  }

  if (typeof window !== 'undefined') {
    window.updateRoundBanner = updateRoundBanner;
    window.state = {
      get round() { return battleRound; },
      set round(v) { battleRound = v; },
      get battleRound() { return battleRound; },
      set battleRound(v) { battleRound = v; },
      get activeMiseries() { return activeMiseries; },
      set activeMiseries(v) { activeMiseries = v; },
      get activeSecondaries() { return activeSecondaries; },
      set activeSecondaries(v) { activeSecondaries = v; },
      get miseryDeck() { return sharedMiseryDeck; },
      set miseryDeck(v) { sharedMiseryDeck = v; },
      get secondaryDeck() { return sharedSecondaryDeck; },
      set secondaryDeck(v) { sharedSecondaryDeck = v; },
      get mode() { return isSoloMode ? 'solo' : selectedModeVal; },
      get sp() { return sp; },
      set sp(v) { sp = v; },
      get cp() { return cp; },
      set cp(v) { cp = v; }
    };
    window.syncSpawnerPoolFromSupabase = syncSpawnerPoolFromSupabase;
    window.renderLiveSpawnerBracketTable = renderLiveSpawnerBracketTable;
    window.transmitHordeIntrusionPing = transmitHordeIntrusionPing;
    window.evaluateWarpBreachIntrusions = evaluateWarpBreachIntrusions;
    window.resetMatchToSetup = resetMatchToSetup;
    window.clearSpawnerResults = clearSpawnerResults;
    window.onChangeSpawnZoneCount = onChangeSpawnZoneCount;
    window.pushLiveSpawnerStateToCloud = pushLiveSpawnerStateToCloud;
    window.pollLiveSpawnerStateFromCloud = pollLiveSpawnerStateFromCloud;
    window.debouncedPushLiveSpawnerStateToCloud = debouncedPushLiveSpawnerStateToCloud;
    window.getClientDeviceId = getClientDeviceId;
    window.updateSyncBadge = updateSyncBadge;
    window.triggerCardStaticShake = triggerCardStaticShake;
    window.manualSyncSpawnerNow = function () {
      updateSyncBadge(true, '☁️ Syncing...');
      pollLiveSpawnerStateFromCloud().then(synced => {
        if (!synced) pushLiveSpawnerStateToCloud();
      });
    };

    if (typeof window.rollAllSpawnZones === 'function' && !window.rollAllSpawnZones._hasIntrusionHook) {
      const origRollAll = window.rollAllSpawnZones;
      const wrappedRollAll = function () {
        const res = origRollAll.apply(this, arguments);
        evaluateWarpBreachIntrusions();
        pushLiveSpawnerStateToCloud();
        return res;
      };
      wrappedRollAll._hasIntrusionHook = true;
      window.rollAllSpawnZones = wrappedRollAll;
    }

    if (typeof window.manualChangeFaction === 'function' && !window.manualChangeFaction._hasBracketRenderHook) {
      const origManualFaction = window.manualChangeFaction;
      const wrappedManual = function () {
        const res = origManualFaction.apply(this, arguments);
        renderLiveSpawnerBracketTable();
        debouncedPushLiveSpawnerStateToCloud();
        return res;
      };
      wrappedManual._hasBracketRenderHook = true;
      window.manualChangeFaction = wrappedManual;
    }

    let spawnerCloudPollTimer = null;
    function initSpawnerCloudPolling() {
      if (document.getElementById('setupScreen') || document.getElementById('gameScreen')) {
        syncSpawnerPoolFromSupabase();
        renderLiveSpawnerBracketTable();
        pollLiveSpawnerStateFromCloud();
        if (!spawnerCloudPollTimer) {
          spawnerCloudPollTimer = setInterval(() => {
            if (document.getElementById('setupScreen') || document.getElementById('gameScreen')) {
              pollLiveSpawnerStateFromCloud();
            } else {
              clearInterval(spawnerCloudPollTimer);
              spawnerCloudPollTimer = null;
            }
          }, 3500);
        }
      } else {
        if (spawnerCloudPollTimer) {
          clearInterval(spawnerCloudPollTimer);
          spawnerCloudPollTimer = null;
        }
      }
    }

    window.addEventListener('DOMContentLoaded', initSpawnerCloudPolling);
    window.addEventListener('vox:page-swapped', initSpawnerCloudPolling);
  }

  if (typeof module !== 'undefined' && module.exports) {
    Object.assign(module.exports, {
      updateRoundBanner,
      syncSpawnerPoolFromSupabase,
      renderLiveSpawnerBracketTable,
      transmitHordeIntrusionPing,
      transmitIntrusionPing,
      evaluateWarpBreachIntrusions,
      triggerCardStaticShake
    });
  }
})();
````
