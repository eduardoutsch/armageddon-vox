# 📦 Fires of Armageddon // Bundle: App Engine (Part 2: Wave Engine & Threat Escalation)

Wave generation cycle, threat level brackets, and battlefield event resolvers (`js/app.js` lines 701 to 1400).

## 📑 Table of Contents
- [js/app.js (Part 2: Wave Engine & Threat Escalation, Lines 701-1400)](#file-jsappjspart2waveenginethreatescalationlines7011400)

---

## File: `js/app.js (Part 2: Wave Engine & Threat Escalation, Lines 701-1400)` <a id="file-jsappjspart2waveenginethreatescalationlines7011400"></a>

````javascript
    drawSecondary(battleRound === 1);
  }

  updateHUD();
  renderSharedDecks();
  debouncedPushLiveSpawnerStateToCloud();
}

function drawMisery(count) {
  for (let i = 0; i < count; i++) {
    if (sharedMiseryDeck.length === 0) {
      const code = (document.getElementById('seedInput').value || 'HADES-1').trim().toUpperCase();
      sharedMiseryDeck = seededShuffle(MISERIES, mulberry32(hashString(code + "_MIS_R" + battleRound)));
    }
    const card = sharedMiseryDeck.shift();
    activeMiseries.push(card);
    if (typeof recordMiseryDrawn === 'function') recordMiseryDrawn(card);
    if (card.wipeFortifications || card.id === 21) {
      if (typeof window !== 'undefined' && typeof window.wipeAllFortifications === 'function') {
        window.wipeAllFortifications({ reason: 'Misery #21 Bunkers Busted' });
      }
    }
    if (card.id === 20) drawMisery(2);
    if (card.id === 14 && isSoloMode) drawMisery(2);
  }
  renderSharedDecks();
  saveSessionState();
}

function triggerSpecificMisery() {
  const id = parseInt(document.getElementById('specificMiserySelect').value, 10);
  const found = MISERIES.find(m => m.id === id);
  if (!found) return;
  sharedMiseryDeck = sharedMiseryDeck.filter(m => m.id !== id);
  activeMiseries.push(found);
  if (typeof recordMiseryDrawn === 'function') recordMiseryDrawn(found);
  if (found.wipeFortifications || found.id === 21) {
    if (typeof window !== 'undefined' && typeof window.wipeAllFortifications === 'function') {
      window.wipeAllFortifications({ reason: 'Misery #21 Bunkers Busted' });
    }
  }
  renderSharedDecks();
  saveSessionState();
}

function drawSecondary(isRound1) {
  if (sharedSecondaryDeck.length === 0) {
    const code = (document.getElementById('seedInput').value || 'HADES-1').trim().toUpperCase();
    sharedSecondaryDeck = seededShuffle(SECONDARIES, mulberry32(hashString(code + "_MSN_R" + battleRound)));
  }
  let skipped = [];
  let chosen = null;
  while (sharedSecondaryDeck.length > 0) {
    let candidate = sharedSecondaryDeck.shift();
    if (isRound1 && candidate.r1Skip) {
      skipped.push(candidate);
    } else {
      chosen = candidate;
      break;
    }
  }
  sharedSecondaryDeck.push(...skipped);
  if (chosen) activeSecondaries.push(chosen);
  renderSharedDecks();
  saveSessionState();
}

function replaceSecondary() {
  if (activeSecondaries.length === 0) return alert("No active Secondary Mission to replace!");
  activeSecondaries.pop();
  drawSecondary(battleRound === 1);
  saveSessionState();
}

function renderSharedDecks() {
  document.getElementById('secDeckCount').innerText = `${sharedSecondaryDeck.length} in deck`;
  document.getElementById('misDeckCount').innerText = `${sharedMiseryDeck.length} in deck`;

  const secBox = document.getElementById('activeSecondariesBox');
  if (secBox) {
    if (activeSecondaries.length === 0) {
      secBox.innerHTML = `<div class="card secondary" style="opacity:0.65; padding:14px 16px; margin:0; min-height:52px; box-sizing:border-box; display:flex; align-items:center;"><p class="card-desc" style="margin:0;">No active Secondary Mission.</p></div>`;
    } else if (typeof window !== 'undefined' && typeof window.renderActiveSecondaries === 'function') {
      window.renderActiveSecondaries();
    } else {
      secBox.innerHTML = activeSecondaries.map(s => `
        <div class="card secondary">
          <span class="badge gold">Secondary Mission</span>
          <h4 class="card-title">${s.name}</h4>
          <p class="card-desc">${s.cond}</p>
          <div class="meta-row">
            <span class="reward-pill"><strong>Reward:</strong> ${s.rew}</span>
            <span class="punish-pill"><strong>Failure:</strong> ${s.pun}</span>
          </div>
        </div>
      `).join('');
    }
  }

  const misBox = document.getElementById('activeMiseriesBox');
  if (misBox) {
    if (activeMiseries.length === 0) {
      misBox.innerHTML = `<div class="card misery" style="opacity:0.65; padding:14px 16px; margin:0; min-height:52px; box-sizing:border-box; display:flex; align-items:center;"><p class="card-desc" style="margin:0;">No active Misery Cards.</p></div>`;
    } else if (typeof window !== 'undefined' && typeof window.renderActiveMiseries === 'function') {
      window.renderActiveMiseries();
    } else {
      misBox.innerHTML = activeMiseries.map(m => `
        <div class="card misery">
          <span class="badge red">Misery Effect</span>
          <h4 class="card-title">${m.name}</h4>
          <p class="card-desc">${m.desc}</p>
        </div>
      `).join('');
    }
  }
}

// --- TAB 4: ROOM-SYNCED HORDE SPAWNER ---
function saveCustomPool() {
  const el34 = document.getElementById('pool34');
  if (!el34) return;
  const pool = {
    b34: el34.value,
    b56: document.getElementById('pool56') ? document.getElementById('pool56').value : '',
    b79: document.getElementById('pool79') ? document.getElementById('pool79').value : '',
    b10: document.getElementById('pool10') ? document.getElementById('pool10').value : '',
    b13: document.getElementById('pool13') ? document.getElementById('pool13').value : ''
  };
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('armageddon_horde_pool', JSON.stringify(pool));
  }
  if (typeof alert === 'function') alert("Custom Shelf Pool saved!");
}

function loadCustomPool() {
  if (typeof localStorage === 'undefined') return;
  const saved = localStorage.getItem('foa_custom_shelf_pool_v1') || localStorage.getItem('armageddon_horde_pool');
  if (!saved) return;
  try {
    const p = JSON.parse(saved);
    if (p.b34 && document.getElementById('pool34')) document.getElementById('pool34').value = p.b34;
    if (p.b56 && document.getElementById('pool56')) document.getElementById('pool56').value = p.b56;
    if (p.b79 && document.getElementById('pool79')) document.getElementById('pool79').value = p.b79;
    if (p.b10 && document.getElementById('pool10')) document.getElementById('pool10').value = p.b10;
    if (p.b13 && document.getElementById('pool13')) document.getElementById('pool13').value = p.b13;
  } catch (e) {}
}

function rollAllSpawnZones() {
  if (battleRound === 6) {
    return alert("Battle Round 6 (Hard Mode Final Stand): Do NOT roll Spawn Rolls in Round 6!");
  }
  const code = (document.getElementById('seedInput')?.value || 'HADES-1').trim().toUpperCase();
  const effRound = Math.max(1, battleRound);
  const numZones = parseInt(document.getElementById('spawnZoneCountSelect')?.value || '3', 10);
  const fac = activeHordeFaction ? activeHordeFaction.name : (document.getElementById('hordeFactionSelect')?.value || 'Chaos Daemons');
  const extraMod = parseInt(document.getElementById('extraSpawnMod')?.value, 10) || 0;
  const jammerActive = !!document.getElementById('jammerCheck')?.checked;
  const unluckyNightActive = (typeof isUnluckyNightActive === 'function' && isUnluckyNightActive()) || !!document.getElementById('unluckyNightSpawnerCheck')?.checked || activeMiseries.some(m => m.id === 7);
  const firstBonus6 = !!document.getElementById('firstRollBonusCheck')?.checked;
  const firstBonus12 = !!document.getElementById('baitTrapBonusCheck')?.checked;

  const rndIndex = Math.max(1, Math.min(effRound, 5));
  let baseRoundMod = HARD_MODE_ROUNDS[rndIndex].spawnModNum;
  if (effRound === 3 && fac === 'Orks') baseRoundMod += 1;

  currentZoneSpawns = [];

  for (let z = 1; z <= numZones; z++) {
    let unmod = 0;
    let diceStr = "";

    if (z === 1 && effRound >= 4 && fac === 'Adepta Sororitas') {
      unmod = 12;
      diceStr = "Auto-12 (Martyrs & Miracles)";
    } else if (unluckyNightActive) {
      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      const d3 = Math.floor(Math.random() * 6) + 1;
      const sorted = [d1, d2, d3].sort((a,b) => b - a);
      unmod = sorted[0] + sorted[1];
      diceStr = `3D6 Drop Lowest (${d1},${d2},${d3} → ${unmod})`;
    } else {
      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      unmod = d1 + d2;
      diceStr = `2D6 (${d1}+${d2} = ${unmod})`;
    }

    let totalMod = baseRoundMod + extraMod + (jammerActive ? -1 : 0);
    if (z === 1 && firstBonus6) totalMod += 6;
    if (z === 1 && firstBonus12) totalMod += 12;

    const finalRoll = unmod + totalMod;
    const bInfo = getBracketInfo(finalRoll, unmod);
    const unitPicked = (bInfo.key === 'NONE') ? 'None' : pickSyncedUnitFromBracket(bInfo.key, Math.random);

    currentZoneSpawns.push({
      zone: z,
      diceStr,
      unmod,
      totalMod,
      finalRoll,
      bracketKey: bInfo.key,
      bracketLabel: bInfo.label,
      pts: bInfo.pts,
      units: [unitPicked]
    });
  }

  renderSpawnZones();
  saveSessionState();
}

function rollDownZone(idx) {
  const z = currentZoneSpawns[idx];
  const rollDownResult = calculateRollDown(z.bracketKey);
  if (!rollDownResult) {
    return alert("Cannot roll down lower than Bracket [3–4]!");
  }

  const { nextKey, bracketLabel, pts } = rollDownResult;
  const newCount = z.units.length * 2;
  let newUnits = [];
  for (let i = 0; i < newCount; i++) {
    newUnits.push(pickSyncedUnitFromBracket(nextKey, Math.random));
  }
  z.bracketKey = nextKey;
  z.bracketLabel = bracketLabel;
  z.pts = pts;
  z.units = newUnits;
  renderSpawnZones();
  saveSessionState();
}

function triggerZoneRollDown(idx) {
  return rollDownZone(idx);
}

function renderSpawnZones() {
  const container = document.getElementById('spawnResultsContainer');
  if (!container) return;
  container.innerHTML = currentZoneSpawns.map((z, idx) => {
    if (typeof z === 'string') {
      return `
        <div class="card spawn-zone">
          <span class="badge green">Spawn Zone ${idx + 1}</span>
          <h4 class="card-title" style="margin-top:6px;">${z}</h4>
        </div>
      `;
    }
    const zoneNum = z?.zone || idx + 1;
    const bracketLabel = z?.bracketLabel || 'Spawn';
    const ptsStr = z?.pts ? ` (${z.pts})` : '';
    const diceStr = z?.diceStr || '';
    const modStr = z?.totalMod !== undefined ? ` | Mod: ${z.totalMod >= 0 ? '+' + z.totalMod : z.totalMod}` : '';
    const rollStr = z?.finalRoll !== undefined ? ` → <strong>Total: ${z.finalRoll}</strong>` : '';
    const unitsStr = Array.isArray(z?.units) ? z.units.join('  +  ') : (z?.units || '');

    return `
      <div class="card spawn-zone">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap;">
          <span class="badge green">Spawn Zone ${zoneNum} • ${bracketLabel}${ptsStr}</span>
          <span class="hud-sub">${diceStr}${modStr}${rollStr}</span>
        </div>
        <h4 class="card-title" style="margin-top:6px;">${unitsStr}</h4>
        ${(z?.bracketKey && z.bracketKey !== 'NONE' && z.bracketKey !== '3-4') ? `
          <div style="display:flex; justify-content:flex-end; margin-top:10px;">
            <button class="btn-ghost btn-sm" onclick="rollDownZone(${idx})">
              ⤵️ Roll Down (Spawn 2x Lower Bracket Units Instead)
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

// --- SP, CP & RESUPPLY SHOP ---
/**
 * Increases Supply Points (SP).
 * Accounts for previously reduced banked SP (restoring banked balance without consuming
 * from the finite round cap), and enforces the per-round finite cap (spRoundCap).
 * @param {number} amount
 */
function gainSP(amount) {
  if (typeof recordSpEarned === 'function') recordSpEarned(amount);
  let toAdd = amount;
  if (bankedSpLost > 0) {
    const restore = Math.min(toAdd, bankedSpLost);
    bankedSpLost -= restore;
    sp += restore;
    toAdd -= restore;
  }
  if (toAdd > 0) {
    const remainingCap = spRoundCap - spGainedThisRound;
    if (remainingCap <= 0) {
      if (typeof confirm === 'function' && !confirm(`Round cap of ${spRoundCap} SP reached! Add SP anyway?`)) {
        updateHUD();
        return;
      }
      sp += toAdd;
    } else {
      const actual = Math.min(toAdd, remainingCap);
      sp += actual;
      spGainedThisRound += actual;
      const overflow = toAdd - actual;
      if (overflow > 0) {
        if (typeof confirm === 'function' && !confirm(`Round cap of ${spRoundCap} SP reached! Add SP anyway?`)) {
          updateHUD();
          return;
        }
        sp += overflow;
      }
    }
  }
  updateHUD();
}

/**
 * Spends Supply Points (SP), typically on Resupply Shop purchases.
 * Deducts from banked SP balance, increments spSpentThisRound,
 * and updates the HUD.
 * @param {number} amount
 * @returns {number} actual amount deducted
 */
function spendSP(amount) {
  const toSpend = Number(amount) || 0;
  if (toSpend <= 0) return 0;
  if (typeof recordSpSpent === 'function') recordSpSpent(toSpend);
  const prevSp = sp;
  sp = Math.max(0, sp - toSpend);
  const actualSpent = prevSp - sp;
  spSpentThisRound += toSpend;
  updateHUD();
  return actualSpent;
}

/**
 * Decreases Supply Points (SP).
 * If options.isPurchase is true, treats as a Resupply Shop spend (spendSP).
 * Otherwise decrements banked SP balance.
 * Symmetrically decrements the current round's earned tally (spGainedThisRound)
 * so that reducing and increasing SP does not consume finite round cap allocations.
 * Any reduction beyond round-earned SP is tracked in bankedSpLost so restoring it
 * later does not falsely consume from the finite round cap.
 * @param {number} amount
 * @param {object} [options]
 */
function loseSP(amount, options = {}) {
  if (options && (options.isPurchase || options.isSpend)) {
    return spendSP(amount);
  }
  const prevSp = sp;
  sp = Math.max(0, sp - amount);
  const actualLost = prevSp - sp;
  if (actualLost > 0) {
    if (spGainedThisRound > 0) {
      const capReduction = Math.min(spGainedThisRound, actualLost);
      spGainedThisRound -= capReduction;
      const remainingLost = actualLost - capReduction;
      bankedSpLost += remainingLost;
    } else {
      bankedSpLost += actualLost;
    }
  }
  if (sp === 0) {
    bankedSpLost = 0;
  }
  updateHUD();
}

/**
 * Manually adjusts or resets the SP spent this round tally via prompt.
 */
function adjustSpRoundTally() {
  if (typeof prompt !== 'function') return;
  const input = prompt(`Set SP spent this round (0 to ${spRoundCap}):`, String(spSpentThisRound));
  if (input !== null) {
    const val = parseInt(input, 10);
    if (!isNaN(val) && val >= 0) {
      spSpentThisRound = val;
      updateHUD();
    }
  }
}

/**
 * Manually adjusts or resets the Stratagems used tally via prompt.
 */
function adjustStratTally() {
  if (typeof prompt !== 'function') return;
  const input = prompt("Set Stratagems used tally (or 0 to reset):", String(stratCount));
  if (input !== null) {
    const val = parseInt(input, 10);
    if (!isNaN(val) && val >= 0) {
      stratCount = val;
      updateHUD();
    }
  }
}

function adjCP(delta) {
  cp = Math.max(0, cp + delta);
  updateHUD();
}

/**
 * Deducts CP for using a Stratagem and increments the Stratagems used tally.
 * Supports Stratagems costing 1, 2, 3, or custom CP amounts.
 * @param {number|string} cost - Amount of CP to spend (defaults to 1).
 */
function spendCPForStrat(cost = 1) {
  let c = cost;
  if (c === 'custom') {
    if (typeof prompt !== 'function') return;
    const input = prompt("Enter CP cost for Stratagem (e.g. 1, 2, 3):", "1");
    if (input === null) return;
    c = parseInt(input, 10);
  } else {
    c = parseInt(c, 10);
  }
  if (isNaN(c) || c < 1) c = 1;

  // Check for Misery #22 (Comms Jammed) lockout
  const commsJammed = Array.isArray(activeMiseries) && activeMiseries.some(m => m && m.id === 22);
  if (commsJammed && typeof confirm === 'function') {
    const override = confirm("⚠️ Warning: Misery #22 (Comms Jammed) is active! Players cannot use Stratagems or spend Command Points this round.\n\nDo you want to override and spend CP anyway?");
    if (!override) return;
  }

  if (cp < c) {
    const msg = cp <= 0
      ? "0 CP remaining!"
      : `Not enough CP! Have ${cp} CP, but Stratagem costs ${c} CP.`;
    return alert(msg);
  }

  cp -= c;
  stratCount++;
  if (typeof recordStratagemUsed === 'function') recordStratagemUsed();
  updateHUD();
}

/**
 * Manually sets the Command Points (CP) pool via prompt.
 */
function adjustCpDirect() {
  if (typeof prompt !== 'function') return;
  const input = prompt("Set Command Points (CP) pool:", String(cp));
  if (input !== null) {
    const val = parseInt(input, 10);
    if (!isNaN(val) && val >= 0) {
      cp = val;
      updateHUD();
    }
  }
}

function adjMarker(id, delta, max) {
  const el = document.getElementById(id);
  if (!el) return;
  let val = parseInt(el.innerText, 10) + delta;
  el.innerText = Math.max(0, Math.min(max, val));
  saveSessionState();
}

function setShopFilter(tag, btnEl) {
  currentShopFilter = tag;
  document.querySelectorAll('.filter-bar .chip').forEach(b => b.classList.remove('active'));
  btnEl.classList.add('active');
  renderResupplyTable();
}

function buyResupply(idx) {
  const item = RESUPPLIES[idx];
  const isDoubled = document.getElementById('doubleCostToggle').checked;
  let finalCost = item.cost;

  if (item.varCost) {
    const input = prompt(`Enter X SP to spend on ${item.name}:`, "3");
    if (input === null) return;
    finalCost = parseInt(input, 10) || 0;
  }
  if (isDoubled) finalCost *= 2;

  if (sp < finalCost) {
    return alert(`Insufficient SP! Need ${finalCost} SP (You have ${sp} SP).`);
  }
  if (spSpentThisRound + finalCost > spRoundCap) {
    if (typeof confirm === 'function' && !confirm(`Round resupply spending limit of ${spRoundCap} SP reached! (Already spent ${spSpentThisRound} SP this round). Purchase anyway?`)) {
      return;
    }
  }
  spendSP(finalCost);
  if (item.autoCP) cp += item.autoCP;
  if (item.name === "A Change of Plans") {
    switchTab(2);
    triggerChangeOfPlans();
  } else if (item.name === "Tempt Fate") {
    drawSecondary(battleRound === 1);
    switchTab(1);
  } else if (item.name === "Advanced Tactics") {
    replaceSecondary();
    switchTab(1);
  }
  updateHUD();
}

function renderResupplyTable() {
  const isDoubled = document.getElementById('doubleCostToggle').checked;
  const container = document.getElementById('resupplyList');

  const filtered = RESUPPLIES.map((r, i) => ({ ...r, origIdx: i }))
    .filter(r => currentShopFilter === 'All' || r.tags.includes(currentShopFilter));

  container.innerHTML = filtered.map(r => {
    const dispCost = r.varCost ? (isDoubled ? "2X SP" : "X SP") : `${isDoubled ? r.cost * 2 : r.cost} SP`;
    return `
      <div class="card resupply">
        <div>
          <span class="badge blue" style="margin-bottom:4px;">${dispCost} • ${r.tags}</span>
          <h4 class="card-title" style="font-size:1rem;">${r.name}</h4>
          <p class="card-desc" style="font-size:0.86rem;">${r.desc}</p>
        </div>
        <button class="btn-blue btn-sm" onclick="buyResupply(${r.origIdx})">Buy</button>
      </div>
    `;
  }).join('');
}

function leaveSession() {
  if (typeof confirm === 'function' && !confirm("Exit current battle terminal?")) return;
  const gameScreen = document.getElementById('gameScreen');
  if (gameScreen) gameScreen.classList.add('hidden');
  const setupScreen = document.getElementById('setupScreen');
  if (setupScreen) setupScreen.classList.remove('hidden');
  saveSessionState();
}

function clearSpawnerResults() {
  currentZoneSpawns = [];
  lastWarpSirenSeedKey = '';
  const spawnContainer = document.getElementById('spawnResultsContainer');
  if (spawnContainer) {
    spawnContainer.innerHTML = `
      <div class="card spawn-zone" style="opacity:0.65; text-align:center;">
        <p class="card-desc">Tap the green button above to generate synchronized brackets and units for each Spawn Zone.</p>
      </div>
    `;
  }
  saveSessionState();
  debouncedPushLiveSpawnerStateToCloud();
}

function resetMatchToSetup() {
  if (typeof confirm === 'function' && !confirm("Reset current battle and spawner to mission setup? All active round progress, objectives, and spawn cards will be cleared.")) {
    return;
  }
  clearSessionState();
  currentZoneSpawns = [];
  lastWarpSirenSeedKey = '';
  if (typeof window !== 'undefined' && typeof window.resetCommandObjectiveClaimState === 'function') {
    window.resetCommandObjectiveClaimState();
  }

  battleRound = 0;
  activeCard = null;
  activeMiseries = [];
  activeSecondaries = [];
  personalSecretDeck = [];
  sharedMiseryDeck = [];
  sharedSecondaryDeck = [];
  currentChoices = [];
  sp = 0;
  spSpentThisRound = 0;
  spGainedThisRound = 0;
  bankedSpLost = 0;
  cp = 2;
  stratCount = 0;

  const spawnContainer = document.getElementById('spawnResultsContainer');
  if (spawnContainer) {
    spawnContainer.innerHTML = `
      <div class="card spawn-zone" style="opacity:0.65; text-align:center;">
        <p class="card-desc">Tap the green button above to generate synchronized brackets and units for each Spawn Zone.</p>
      </div>
    `;
  }

  const setupScreen = document.getElementById('setupScreen');
  if (setupScreen) setupScreen.classList.remove('hidden');
  const gameScreen = document.getElementById('gameScreen');
  if (gameScreen) gameScreen.classList.add('hidden');
  updateRoundBanner();
  updateHUD();
  renderSharedDecks();
  switchTab(1, false);
}

// =========================================================================
// LIVE CLOUD ROOM SYNCHRONIZATION (SUPABASE)
// =========================================================================
let clientDeviceId = null;
function getClientDeviceId() {
  if (clientDeviceId) return clientDeviceId;
  try {
    let saved = (typeof sessionStorage !== 'undefined') ? sessionStorage.getItem('foa_spawner_device_id') : null;
    if (!saved) {
      saved = 'dev_' + Math.random().toString(36).slice(2, 10) + '_' + Date.now();
      if (typeof sessionStorage !== 'undefined') sessionStorage.setItem('foa_spawner_device_id', saved);
    }
    clientDeviceId = saved;
  } catch (e) {
    clientDeviceId = 'dev_' + Math.random().toString(36).slice(2, 10);
  }
  return clientDeviceId;
}

let currentRoomCode = '';
let roomCodeChangeTimer = null;

function getActiveRoomCode() {
  return ((typeof document !== 'undefined' && document.getElementById('seedInput')?.value) || 'HADES-1').trim().toUpperCase();
}

async function onRoomCodeChanged(immediate = false) {
  if (roomCodeChangeTimer) {
    clearTimeout(roomCodeChangeTimer);
    roomCodeChangeTimer = null;
  }

  const runSync = async () => {
    const roomCode = getActiveRoomCode();
    if (!roomCode) return false;

    // Reset watermark when switching or pasting room codes
    currentRoomCode = roomCode;
    lastSyncedUpdatedAt = 0;
    lastKnownStateSignature = '';

    updateSyncBadge(true, `☁️ Connecting to Room (${roomCode})...`);

    // 1. Try pulling existing live session from cloud FIRST
    const pulled = await pollLiveSpawnerStateFromCloud(true);
    if (pulled) {
      return true;
    }

    // 2. If room does not exist in cloud, resolve deterministic faction for this seed
    resolveRoomSyncedFaction(roomCode);
    updateSyncBadge(true, `☁️ New Room Created (${roomCode})`);

    // 3. Register the new room in Supabase so joining allies immediately sync
    debouncedPushLiveSpawnerStateToCloud();
    return false;
  };

  if (immediate) {
    return await runSync();
  } else {
    roomCodeChangeTimer = setTimeout(runSync, 350);
  }
}

let lastSyncedUpdatedAt = 0;
let isPushingToCloud = false;
let isPollingFromCloud = false;
let pushCloudTimer = null;
let hasCompletedInitialSync = false;
let lastKnownStateSignature = '';
let lastWarpSirenSeedKey = '';

function triggerCardStaticShake(el) {
  if (!el || !el.classList) return;
  el.classList.remove('card-synced-shake');
  if (typeof el.offsetWidth === 'number') {
    void el.offsetWidth;
  }
  el.classList.add('card-synced-shake');
  setTimeout(() => {
    if (el && el.classList) el.classList.remove('card-synced-shake');
  }, 600);
}

function updateSyncBadge(isLive, labelText) {
  if (typeof document === 'undefined') return;
  const badge = document.getElementById('spawnerSyncBadge');
  if (badge) {
    badge.textContent = labelText || (isLive ? '☁️ Room Live' : '☁️ Room Offline');
    badge.classList.toggle('offline', !isLive);
    badge.style.borderColor = isLive ? 'rgba(16, 185, 129, 0.55)' : 'rgba(255, 71, 87, 0.45)';
    badge.style.color = isLive ? '#6ee7b7' : '#fca5a5';
    badge.style.background = isLive ? 'rgba(16, 185, 129, 0.14)' : 'rgba(255, 71, 87, 0.12)';
  }
  const setupBadge = document.getElementById('setupSyncPill');
  if (setupBadge && isLive) {
    setupBadge.textContent = labelText || (activeHordeFaction
      ? `☁️ Room Synced (${getActiveRoomCode()} • ${activeHordeFaction.name})`
      : '☁️ Live Room Sync Active');
````
