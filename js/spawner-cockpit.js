/**
 * 📦 FIRES OF ARMAGEDDON // SPAWNER COCKPIT & INTERACTIVE LOGIC
 * Handles:
 * - Guided 5-Step Phase Tracker & Round Flow Cockpit
 * - Solo Mode 2x SP Automation & Command Phase SP Claims
 * - Misery Live Spawner Modifiers (#7 Unlucky Night 3D6, #13 Pincer Maneuver)
 * - Verbatim Misery & Secondary Mission Outcomes, Tallies & Saved Card Vault
 * - Enhanced Resupply Shop with Misery Lockouts & Variable X-SP Calculators
 */

(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    const exports = factory();
    Object.assign(root, exports);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {

  // Global trackers for card tallies and saved secondary rewards
  const gRoot = typeof window !== 'undefined' ? window : globalThis;
  gRoot.secondaryTallyMap = gRoot.secondaryTallyMap || {};
  gRoot.savedSecondaryRewards = gRoot.savedSecondaryRewards || [];
  gRoot.lastClaimedCommandRound = gRoot.lastClaimedCommandRound || 0;


  function getEffectiveState() {
    if (typeof state !== 'undefined' && state) return state;
    if (typeof window !== 'undefined' && window.state) return window.state;
    if (typeof globalThis !== 'undefined' && globalThis.state) return globalThis.state;
    return null;
  }

  // --- 1. SOLO MODE 2x SP DETECTION & COMMAND PHASE OBJECTIVE CLAIMS ---
  function isSoloModeActive() {
    if (typeof isSoloMode !== 'undefined' && isSoloMode) return true;
    if (typeof selectedModeVal !== 'undefined' && selectedModeVal === 'solo') return true;
    const effState = getEffectiveState();
    if (effState && effState.mode === 'solo') return true;
    if (typeof document !== 'undefined') {
      const hudInfo = document.getElementById('hudSessionInfo')?.innerText || '';
      if (hudInfo.includes('SOLO')) return true;
      const soloCard = document.getElementById('modeCardSolo');
      if (soloCard && (soloCard.classList.contains('selected') || soloCard.classList.contains('selected-red'))) return true;
    }
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem('foa_horde_session_v1');
        if (raw) {
          const d = JSON.parse(raw);
          if (d && (d.selectedModeVal === 'solo' || d.isSoloMode)) return true;
        }
      }
    } catch (e) {}
    return false;
  }

  function syncSoloSpUiIndicators() {
    if (typeof document === 'undefined') return;
    const solo = isSoloModeActive();
    const pill = document.getElementById('soloDoubleSpHudBadge');
    if (pill) pill.classList.toggle('hidden', !solo);

    const statusText = document.getElementById('spMultiplierStatusText');
    if (statusText) {
      statusText.innerHTML = solo
        ? '<strong style="color:#60a5fa;">🛡️ Solo Mode (Rule 3.7): All SP Gains Doubled (2x SP • Cap 16/Rnd)</strong>'
        : '⚔️ Co-op Mode (1x Base SP • Cap 8/Rnd)';
    }

    document.querySelectorAll('.sp-unit-val').forEach(el => {
      el.textContent = solo ? '+2' : '+1';
    });

    const hudGainBtn = document.getElementById('hudGainSpBtn');
    if (hudGainBtn) {
      hudGainBtn.title = solo
        ? 'Gain SP (Solo Mode: +2 SP per click, or hold Shift for +1 SP)'
        : 'Gain 1 SP';
    }
  }

  function getCurrentBattleRound() {
    if (typeof battleRound !== 'undefined') return battleRound;
    if (typeof window !== 'undefined' && typeof window.battleRound !== 'undefined') return window.battleRound;
    const effState = getEffectiveState();
    if (effState && typeof effState.round === 'number') return effState.round;
    if (effState && typeof effState.battleRound === 'number') return effState.battleRound;
    if (typeof document !== 'undefined') {
      const text = document.getElementById('hudRound')?.innerText || '';
      if (text.toLowerCase().includes('pre-game')) return 0;
      const match = text.match(/\d+/);
      return match ? parseInt(match[0], 10) : 0;
    }
    return 0;
  }

  function updateCommandObjectiveClaimButton(isClaimed, roundNum, gainedSp) {
    if (typeof document === 'undefined') return;
    const btn = document.getElementById('btnClaimCommandSp');
    if (!btn) return;
    if (isClaimed) {
      btn.disabled = true;
      btn.style.opacity = '0.65';
      btn.style.cursor = 'not-allowed';
      const spLabel = gainedSp ? ` (+${gainedSp} SP)` : '';
      btn.innerHTML = `✓ Claimed for Rnd ${roundNum}${spLabel}`;
      btn.title = `Rule 3.7: Command Phase SP already claimed for Battle Round ${roundNum}. Resets upon advancing to the next round.`;
    } else {
      btn.disabled = false;
      btn.style.opacity = '1';
      btn.style.cursor = 'pointer';
      btn.innerHTML = '🚩 Claim Command SP';
      btn.title = 'Rule 3.7: Gain 1 SP per controlled objective (+1 if FOB fortified). Automatically doubled in Solo Mode!';
    }
  }

  function resetCommandObjectiveClaimState() {
    gRoot.lastClaimedCommandRound = 0;
    updateCommandObjectiveClaimButton(false);
  }

  function awardCommandPhaseObjectiveSP() {
    const currentRnd = getCurrentBattleRound();
    if (currentRnd > 0 && gRoot.lastClaimedCommandRound === currentRnd) {
      if (typeof window !== 'undefined' && window.VoxAudio && typeof window.VoxAudio.playErrorBeep === 'function') {
        window.VoxAudio.playErrorBeep();
      }
      if (typeof alert === 'function') {
        alert(`Command Phase SP has already been claimed for Battle Round ${currentRnd}! It will reset when you advance to the next round.`);
      }
      return;
    }

    const objInput = (typeof document !== 'undefined') ? document.getElementById('quickObjCountInput') : null;
    const count = Math.max(0, parseInt(objInput?.value, 10) || 0);
    const hasFob = !!((typeof document !== 'undefined') && document.getElementById('fobFortCheck')?.checked);
    const solo = isSoloModeActive();

    // Rule 3.7: In Co-op, 1 SP per controlled objective (+1 for fortified FOB).
    // In Solo Mode, strictly 2 SP per controlled objective (+2 for fortified FOB).
    const spPerObj = solo ? 2 : 1;
    const fobBonus = (hasFob && count > 0) ? (solo ? 2 : 1) : 0;
    const awardedSp = (count * spPerObj) + fobBonus;
    if (awardedSp <= 0) {
      if (typeof alert === 'function') alert('No controlled objectives to claim! Set Controlled Obj to at least 1.');
      return;
    }

    if (typeof window !== 'undefined' && window.VoxAudio && typeof window.VoxAudio.playPowerSurge === 'function') {
      window.VoxAudio.playPowerSurge();
    }

    if (typeof window !== 'undefined' && typeof window.gainSP === 'function') {
      window.gainSP(awardedSp, { alreadyDoubled: true });
    }

    if (currentRnd > 0) {
      gRoot.lastClaimedCommandRound = currentRnd;
      updateCommandObjectiveClaimButton(true, currentRnd, awardedSp);
    }

    if (typeof saveSessionState === 'function') {
      saveSessionState();
    }
  }

  function awardHordeKillSP(kills = 1) {
    if (typeof window !== 'undefined' && window.VoxAudio && typeof window.VoxAudio.playBoltgunBlast === 'function') {
      window.VoxAudio.playBoltgunBlast();
    }
    if (typeof recordHordeKill === 'function') recordHordeKill(kills);
    if (typeof window !== 'undefined' && typeof window.gainSP === 'function') {
      window.gainSP(kills);
    }
  }

  // --- 2. MISERY-TO-SPAWNER LIVE MODIFIERS (#7 UNLUCKY NIGHT & #13 PINCER) ---
  function isUnluckyNightActive() {
    if (typeof document !== 'undefined') {
      const toggle = document.getElementById('unluckyNightSpawnerCheck');
      if (toggle && toggle.checked) return true;
    }
    const effState = getEffectiveState();
    const activeList = (effState && Array.isArray(effState.activeMiseries))
      ? effState.activeMiseries
      : (typeof window !== 'undefined' && Array.isArray(window.activeMiseries) ? window.activeMiseries : []);
    return activeList.some(c => c && c.id === 7);
  }

  function isPincerManeuverActive() {
    const effState = getEffectiveState();
    const activeList = (effState && Array.isArray(effState.activeMiseries))
      ? effState.activeMiseries
      : (typeof window !== 'undefined' && Array.isArray(window.activeMiseries) ? window.activeMiseries : []);
    return activeList.some(c => c && c.id === 13);
  }

  function ensureMiserySpawnerControls() {
    if (typeof document === 'undefined') return;
    const firstRollCheck = document.getElementById('firstRollBonusCheck');
    if (firstRollCheck && !document.getElementById('unluckyNightSpawnerCheck')) {
      const parentRow = firstRollCheck.parentElement?.parentElement;
      if (parentRow) {
        const lbl = document.createElement('label');
        lbl.style.cssText = 'display:inline-flex; align-items:center; gap:6px; cursor:pointer; color:#fda4af; font-weight:700;';
        lbl.innerHTML = `<input type="checkbox" id="unluckyNightSpawnerCheck" style="accent-color:var(--red);" onchange="syncMiserySpawnerBanner()"> 🎲 #7 Unlucky Night (3D6 Drop Lowest)`;
        parentRow.appendChild(lbl);
      }
    }

    const cockpitBox = document.getElementById('cockpitSpawnMirrorBox');
    if (cockpitBox && !document.getElementById('miserySpawnerStatusBanner')) {
      const banner = document.createElement('div');
      banner.id = 'miserySpawnerStatusBanner';
      banner.style.cssText = 'margin-bottom:10px;';
      cockpitBox.parentElement.insertBefore(banner, cockpitBox);
    }
    syncMiserySpawnerBanner();
  }

  function syncMiserySpawnerBanner() {
    if (typeof document === 'undefined') return;
    const effState = getEffectiveState();
    const activeM = (effState && Array.isArray(effState.activeMiseries))
      ? effState.activeMiseries
      : (typeof window !== 'undefined' && Array.isArray(window.activeMiseries) ? window.activeMiseries : []);
    const hasUnlucky = activeM.some(c => c && c.id === 7);
    const checkEl = document.getElementById('unluckyNightSpawnerCheck');
    if (checkEl && hasUnlucky && !checkEl.checked) {
      checkEl.checked = true;
    }

    const banner = document.getElementById('miserySpawnerStatusBanner');
    if (!banner) return;

    const extraMod = parseInt(document.getElementById('extraSpawnMod')?.value, 10) || 0;
    const dSlayer = !!document.getElementById('firstRollBonusCheck')?.checked;
    const bTrap = !!document.getElementById('baitTrapBonusCheck')?.checked;
    const unlucky = isUnluckyNightActive();
    const pincer = isPincerManeuverActive();

    const pills = [];
    if (unlucky) pills.push(`<span class="badge red">🎲 MISERY #7 UNLUCKY NIGHT ACTIVE: All Spawn Rolls Use 3D6 Drop Lowest!</span>`);
    if (pincer) pills.push(`<span class="badge purple">🪂 MISERY #13 PINCER MANEUVER ACTIVE: Spawn +1 Extra Deep Strike Unit (>3" from Players)!</span>`);
    if (extraMod !== 0) pills.push(`<span class="badge gold">Extra Spawn Roll Mod: ${extraMod > 0 ? '+' + extraMod : extraMod}</span>`);
    if (dSlayer) pills.push(`<span class="badge red">+6 First Spawn Zone (Dragon Slayer Failed)</span>`);
    if (bTrap) pills.push(`<span class="badge gold">+12 First Spawn Zone (Baiting the Trap)</span>`);

    banner.innerHTML = pills.length > 0
      ? `<div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center; padding:8px 10px; background:rgba(255,71,87,0.1); border:1px solid rgba(255,71,87,0.35); border-radius:8px;">
          ${pills.join(' ')}
          ${pincer ? `<button type="button" class="btn-red btn-sm" style="margin-left:auto;" onclick="rollPincerManeuverExtraSpawn()">🪂 Roll Pincer Maneuver Unit Now</button>` : ''}
         </div>`
      : '';
  }

  function adjustExtraSpawnRollMod(delta, firstZoneType = null) {
    if (typeof document === 'undefined') return;
    if (firstZoneType === 'DRAGON_SLAYER_6') {
      const el = document.getElementById('firstRollBonusCheck');
      if (el) el.checked = true;
    } else if (firstZoneType === 'BAIT_TRAP_12') {
      const el = document.getElementById('baitTrapBonusCheck');
      if (el) el.checked = true;
    } else if (delta !== 0) {
      const modEl = document.getElementById('extraSpawnMod');
      if (modEl) modEl.value = String((parseInt(modEl.value, 10) || 0) + delta);
    }
    syncMiserySpawnerBanner();
  }

  function rollPincerManeuverExtraSpawn() {
    if (typeof window !== 'undefined' && window.VoxAudio && typeof window.VoxAudio.playWarpStatic === 'function') {
      window.VoxAudio.playWarpStatic();
    }
    const roundNum = getCurrentBattleRound() || 1;
    const roundMod = (roundNum === 1) ? 0 : (roundNum === 2 ? 1 : (roundNum === 3 ? 2 : 3));
    const extraMod = (typeof document !== 'undefined') ? (parseInt(document.getElementById('extraSpawnMod')?.value, 10) || 0) : 0;
    const jammerMod = (typeof document !== 'undefined' && document.getElementById('jammerCheck')?.checked) ? -1 : 0;
    const totalMod = roundMod + extraMod + jammerMod;

    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    let unmod = d1 + d2;
    let diceLabel = `${d1} + ${d2}`;

    if (isUnluckyNightActive()) {
      const d3 = Math.floor(Math.random() * 6) + 1;
      const sorted = [d1, d2, d3].sort((a, b) => b - a);
      unmod = sorted[0] + sorted[1];
      diceLabel = `3D6 Drop Lowest: ${sorted[0]} + ${sorted[1]} (dropped ${sorted[2]})`;
    }

    const modTotal = unmod + totalMod;
    const bInfo = (typeof getBracketInfo === 'function')
      ? getBracketInfo(modTotal, unmod)
      : { key: '7-9', label: 'Bracket [7–9]', pts: '151–300 pts' };

    const rngFn = () => Math.random();
    const unitName = (bInfo.key === 'NONE')
      ? 'No Unit Spawned (Unmodified 2)'
      : ((typeof pickSyncedUnitFromBracket === 'function')
        ? pickSyncedUnitFromBracket(bInfo.key, rngFn)
        : `Unit from ${bInfo.label}`);

    const cardHtml = `
      <div class="card spawn-zone" style="border-left:4px solid var(--purple); background:rgba(139,92,246,0.12); margin-bottom:10px;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
          <span class="badge purple">🪂 MISERY #13 • PINCER MANEUVER RESERVE SPAWN</span>
          <span class="hud-sub">Roll: ${unmod} (${diceLabel}) + Mod ${totalMod >= 0 ? '+' + totalMod : totalMod} = <strong>${modTotal}</strong></span>
        </div>
        <h4 style="margin:6px 0 2px 0; color:#fff;">${bInfo.label} (${bInfo.pts}) → <span style="color:var(--gold);">${unitName}</span></h4>
        <p class="card-desc" style="margin:4px 0 0 0; font-size:0.82rem; color:#cbd5e1;">
          <strong>Placement Rule (Misery #13):</strong> Gains <strong>Deep Strike</strong> into Horde Strategic Reserves. During the Horde's Movement phase, set up anywhere <strong>&gt;3" from all Player units</strong> — inside the <strong>Players' Deployment Zone</strong> if able (otherwise within No Man's Land).
        </p>
      </div>
    `;

    if (typeof document !== 'undefined') {
      const container = document.getElementById('spawnResultsContainer');
      if (container) container.insertAdjacentHTML('afterbegin', cardHtml);
    }
    mirrorSpawnerToCockpit();
  }

  // --- 3. VERBATIM MISERY & SECONDARY MISSION OUTCOMES & RENDERERS ---
  function renderActiveMiseries() {
    if (typeof document === 'undefined') return;
    const box = document.getElementById('activeMiseriesBox');
    if (!box) return;

    const effState = getEffectiveState();
    const activeList = (effState && Array.isArray(effState.activeMiseries))
      ? effState.activeMiseries
      : (typeof window !== 'undefined' && Array.isArray(window.activeMiseries) ? window.activeMiseries : []);
    const miseryDeck = (effState && Array.isArray(effState.miseryDeck))
      ? effState.miseryDeck
      : (typeof window !== 'undefined' && Array.isArray(window.sharedMiseryDeck) ? window.sharedMiseryDeck : null);

    const deckEl = document.getElementById('misDeckCount');
    if (deckEl && miseryDeck) {
      deckEl.textContent = `${miseryDeck.length} in deck`;
    }

    ensureMiserySpawnerControls();
    syncMiserySpawnerBanner();

    if (activeList.length === 0) {
      box.innerHTML = `<div class="card misery" style="opacity:0.65; padding:14px 16px; margin:0; min-height:52px; box-sizing:border-box; display:flex; align-items:center;">
        <p class="card-desc" style="margin:0;">No active Misery Cards.</p>
      </div>`;
      return;
    }

    const dblToggle = document.getElementById('doubleCostToggle');
    if (dblToggle && activeList.some(c => c.id === 24) && !dblToggle.checked) {
      dblToggle.checked = true;
      if (typeof renderResupplyTable === 'function') renderResupplyTable();
    }

    const overrides = gRoot.MISERY_CARD_OFFICIAL_OVERRIDES || {};
    box.innerHTML = activeList.map((rawCard, idx) => {
      const official = overrides[rawCard.id] || rawCard;
      const numBadge = official.num || `#${rawCard.id}/36`;
      const timingBadge = official.timing || 'Active Misery Effect';
      const verbatimDesc = official.desc || rawCard.desc || rawCard.effect || '';
      const tacticalNote = official.note || '';

      let actionButtonsHtml = '';
      if (rawCard.id === 6) {
        actionButtonsHtml = `<button type="button" class="btn-red btn-sm" onclick="resolveOrbitalBombardmentRoll(${idx})">🎲 Roll Sector (1D6) &amp; 2D3 Mortal Wounds</button><div id="orbitalRollResult_${idx}" style="margin-top:6px; font-size:0.8rem; color:var(--gold);"></div>`;
      } else if (rawCard.id === 7) {
        actionButtonsHtml = `<button type="button" class="btn-red btn-sm" onclick="rollSpawnsFromCockpit()">🎲 Re-Roll Round Spawns with 3D6 Drop Lowest</button>`;
      } else if (rawCard.id === 13) {
        actionButtonsHtml = `<button type="button" class="btn-purple btn-sm" onclick="rollPincerManeuverExtraSpawn()">🪂 Roll Pincer Maneuver Deep Strike Unit (&gt;3")</button>`;
      } else if (rawCard.id === 14) {
        actionButtonsHtml = isSoloModeActive()
          ? `<button type="button" class="btn-red btn-sm" onclick="drawMisery(2)">🛡️ Solo Rule: Reveal +2 Misery Cards Now</button>`
          : `<button type="button" class="btn-red btn-sm" onclick="if(typeof state!=='undefined'){loseSP(state.sp || 99);}">💸 Set My SP to 0 (If Selected)</button>`;
      } else if (rawCard.id === 15) {
        actionButtonsHtml = `<button type="button" class="btn-red btn-sm" onclick="loseSP(5)">💸 Deduct 5 SP (Min 0)</button>`;
      } else if (rawCard.id === 20) {
        actionButtonsHtml = `<button type="button" class="btn-red btn-sm" onclick="drawMisery(2)">🎲 Reveal +2 Misery Cards (Lamentable Luck)</button>`;
      } else if (rawCard.id === 29) {
        actionButtonsHtml = `<button type="button" class="btn-gold btn-sm" onclick="drawSecondary(false); drawSecondary(false); drawSecondary(false);">🎯 Reveal +3 Extra Secondary Missions</button>
                             <button type="button" class="btn-red btn-sm" onclick="loseSP(4)">💸 Deduct 4 SP (Most SP)</button>`;
      }

      return `
        <div class="misery-card-official">
          <div class="misery-meta-row">
            <span class="misery-card-num">MISERY ${numBadge}</span>
            <span class="misery-timing-tag">${timingBadge}</span>
          </div>
          <h4 style="margin:2px 0 4px 0; color:#fff; font-size:1.05rem;">#${rawCard.id} — ${official.name}</h4>
          <div class="misery-verbatim-body">${verbatimDesc}</div>
          ${tacticalNote ? `<div class="misery-tactical-note">${tacticalNote}</div>` : ''}
          <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center; margin-top:10px;">
            ${actionButtonsHtml}
            <button type="button" class="btn-ghost btn-sm" style="margin-left:auto;" onclick="if(typeof nullifyMisery==='function') nullifyMisery(${idx}); else if(state && state.activeMiseries){state.activeMiseries.splice(${idx},1); renderActiveMiseries();}">
              🛡️ Nullify / Discard
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  function nullifyMisery(idx) {
    if (typeof window !== 'undefined' && window.VoxAudio && typeof window.VoxAudio.playCogitatorStep === 'function') {
      window.VoxAudio.playCogitatorStep();
    }
    const effState = getEffectiveState();
    const activeList = (effState && Array.isArray(effState.activeMiseries))
      ? effState.activeMiseries
      : (typeof window !== 'undefined' && Array.isArray(window.activeMiseries) ? window.activeMiseries : []);
    const removed = activeList.splice(idx, 1)[0];
    if (typeof recordMiseryNullified === 'function') recordMiseryNullified(removed);
    renderActiveMiseries();
    if (typeof window !== 'undefined' && typeof window.saveSessionState === 'function') window.saveSessionState();
    else if (typeof window !== 'undefined' && typeof window.saveState === 'function') window.saveState();
  }

  function resolveOrbitalBombardmentRoll(idx) {
    if (typeof window !== 'undefined' && window.VoxAudio) {
      if (typeof window.VoxAudio.playOrbitalBombardment === 'function') window.VoxAudio.playOrbitalBombardment();
      else if (typeof window.VoxAudio.playBoltgunBlast === 'function') window.VoxAudio.playBoltgunBlast();
    }
    const sector = Math.floor(Math.random() * 6) + 1;
    const d3a = Math.floor(Math.random() * 3) + 1, d3b = Math.floor(Math.random() * 3) + 1;
    const el = (typeof document !== 'undefined') ? document.getElementById(`orbitalRollResult_${idx}`) : null;
    if (el) el.innerHTML = `💥 <strong>Grid Sector #${sector} Hit!</strong> Every unit in Sector #${sector} suffers <strong>${d3a + d3b} Mortal Wounds</strong> (2D3: ${d3a}+${d3b})!`;
  }

  function wipeAllFortifications(options = {}) {
    if (typeof document !== 'undefined') {
      document.querySelectorAll('.fort-grid input[type="checkbox"]').forEach(cb => { cb.checked = false; });
      if (options.wipeAllMarkers || options.includeTeleporters !== false) {
        const tele = document.getElementById('teleCount');
        if (tele) tele.innerText = '0';
      }
      if (options.wipeAllMarkers) {
        const wire = document.getElementById('wireCount'), mine = document.getElementById('mineCount');
        if (wire) wire.innerText = '0';
        if (mine) mine.innerText = '0';
      }
    }
    if (typeof window !== 'undefined' && window.VoxAudio && typeof window.VoxAudio.playDegaussPurge === 'function') {
      window.VoxAudio.playDegaussPurge();
    }
    if (typeof saveSessionState === 'function') saveSessionState();
    else if (typeof window !== 'undefined' && typeof window.saveSessionState === 'function') window.saveSessionState();
    return true;
  }

  function adjSecondaryTally(cardId, delta) {
    if (typeof window !== 'undefined' && window.VoxAudio && typeof window.VoxAudio.playCogitatorStep === 'function') {
      window.VoxAudio.playCogitatorStep();
    }
    const cur = gRoot.secondaryTallyMap[cardId] || 0;
    const maxVal = (cardId === 16) ? 4 : 99;
    gRoot.secondaryTallyMap[cardId] = Math.max(0, Math.min(maxVal, cur + delta));
    renderActiveSecondaries();
  }

  function resolveSecondaryOutcome(idx, isSuccess) {
    const effState = getEffectiveState();
    const activeList = (effState && Array.isArray(effState.activeSecondaries))
      ? effState.activeSecondaries
      : (typeof window !== 'undefined' && Array.isArray(window.activeSecondaries) ? window.activeSecondaries : []);
    const rawCard = activeList[idx];
    if (!rawCard) return;
    const overrides = gRoot.SECONDARY_MISSION_OFFICIAL_OVERRIDES || {};
    const official = overrides[rawCard.id] || rawCard;
    const tallyX = gRoot.secondaryTallyMap[rawCard.id] || 0;

    if (isSuccess) {
      if (typeof window !== 'undefined' && window.VoxAudio && typeof window.VoxAudio.playPowerSurge === 'function') {
        window.VoxAudio.playPowerSurge();
      }
      let spToGain = official.rewardSp || 0;
      if (official.rewardSpFormula === 'X_PLUS_1') {
        spToGain = Math.max(1, tallyX) + 1;
      } else if (official.rewardSpFormula === 'X_MAX_4') {
        spToGain = Math.min(4, Math.max(1, tallyX));
      } else if (official.rewardSpFormula === 'X_TIMES_2') {
        spToGain = Math.max(1, tallyX) * 2;
      } else if (official.rewardSpFormula === 'USE_IT_OR_LOSE_IT') {
        const roll = Math.floor(Math.random() * 6) + 1;
        spToGain = (roll >= 4) ? Math.max(7, tallyX) : 3;
      }
      if (spToGain > 0 && typeof window.gainSP === 'function') {
        window.gainSP(spToGain);
      }

      if (official.rewardCp && typeof window.adjCP === 'function') {
        window.adjCP(official.rewardCp);
      }

      if (official.rewardSpawnMod) {
        adjustExtraSpawnRollMod(official.rewardSpawnMod);
      }
      if (official.rewardFirstZoneBonus === 12) {
        adjustExtraSpawnRollMod(0, 'BAIT_TRAP_12');
      }

      if (official.savedCardBenefit) {
        gRoot.savedSecondaryRewards.push({
          id: official.id,
          name: official.name,
          benefit: official.savedCardBenefit
        });
      }

      if (official.specialRewardAction === 'CHANGE_OF_PLANS_CHOICE' && typeof window.triggerChangeOfPlans === 'function') {
        window.triggerChangeOfPlans();
      }
    } else {
      if (typeof window !== 'undefined' && window.VoxAudio && typeof window.VoxAudio.playWarpStatic === 'function') {
        window.VoxAudio.playWarpStatic();
      }
      if (official.punLoseSp && typeof window.loseSP === 'function') {
        window.loseSP(official.punLoseSp);
      }

      let miseryToDraw = official.punMisery || 0;
      let spawnModToAdd = official.punSpawnMod || 0;
      if (official.punFormula === 'X_MISERY_AND_SPAWN') {
        const xVal = Math.max(1, tallyX);
        miseryToDraw = xVal;
        spawnModToAdd = xVal;
      }

      if (spawnModToAdd !== 0) {
        adjustExtraSpawnRollMod(spawnModToAdd);
      }
      if (official.punFirstZoneBonus === 6) {
        adjustExtraSpawnRollMod(0, 'DRAGON_SLAYER_6');
      }

      if (official.punTriggerMiseryId && typeof document !== 'undefined') {
        const sel = document.getElementById('specificMiserySelect');
        if (sel) {
          sel.value = String(official.punTriggerMiseryId);
          if (typeof window.triggerSpecificMisery === 'function') window.triggerSpecificMisery();
        }
      }
      if (miseryToDraw > 0 && typeof window.drawMisery === 'function') window.drawMisery(miseryToDraw);
      if (official.specialPunAction === 'CHANGE_OF_PLANS_RANDOM' && typeof window.triggerOrbitalPunishment === 'function') {
        window.triggerOrbitalPunishment();
      }
      if (official.punWipeFortifications || official.id === 17) {
        (typeof window !== 'undefined' && typeof window.wipeAllFortifications === 'function' ? window.wipeAllFortifications : wipeAllFortifications)();
      }
    }

    if (typeof recordSecondaryResolved === 'function') {
      recordSecondaryResolved(official, isSuccess, { rewardText: official.rew || '', punText: official.pun || '' });
    }

    activeList.splice(idx, 1);
    renderActiveSecondaries();
    if (typeof window !== 'undefined' && typeof window.saveSessionState === 'function') window.saveSessionState();
    else if (typeof window !== 'undefined' && typeof window.saveState === 'function') window.saveState();
  }

  function redeemSavedSecondaryCard(savedIdx) {
    if (typeof window !== 'undefined' && window.VoxAudio && typeof window.VoxAudio.playPneumaticDispense === 'function') {
      window.VoxAudio.playPneumaticDispense();
    }
    gRoot.savedSecondaryRewards.splice(savedIdx, 1);
    renderActiveSecondaries();
  }

  function renderActiveSecondaries() {
    if (typeof document === 'undefined') return;
    const box = document.getElementById('activeSecondariesBox');
    if (!box) return;

    const effState = getEffectiveState();
    const activeList = (effState && Array.isArray(effState.activeSecondaries))
      ? effState.activeSecondaries
      : (typeof window !== 'undefined' && Array.isArray(window.activeSecondaries) ? window.activeSecondaries : []);
    const secondaryDeck = (effState && Array.isArray(effState.secondaryDeck))
      ? effState.secondaryDeck
      : (typeof window !== 'undefined' && Array.isArray(window.sharedSecondaryDeck) ? window.sharedSecondaryDeck : null);

    const deckEl = document.getElementById('secDeckCount');
    if (deckEl && secondaryDeck) {
      deckEl.textContent = `${secondaryDeck.length} in deck`;
    }

    const currentRnd = getCurrentBattleRound();
    const solo = isSoloModeActive();
    const overrides = gRoot.SECONDARY_MISSION_OFFICIAL_OVERRIDES || {};

    const cardsHtml = activeList.length === 0
      ? `<div class="card secondary" style="opacity:0.65; padding:14px 16px; margin:0; min-height:52px; box-sizing:border-box; display:flex; align-items:center;">
         <p class="card-desc" style="margin:0;">No active Secondary Mission.</p>
       </div>`
      : activeList.map((rawCard, idx) => {
        const official = overrides[rawCard.id] || rawCard;
        const numBadge = official.num || `${rawCard.id}/24`;
        const typeTag = official.typeTag || 'Secondary Mission';
        const tallyVal = gRoot.secondaryTallyMap[rawCard.id] || 0;

        const r1Warning = (official.round1Restricted && currentRnd === 1)
          ? `<div style="background:rgba(234,179,8,0.18); border:1px solid var(--gold); color:var(--gold); padding:6px 10px; border-radius:6px; font-size:0.78rem; font-weight:700; margin-bottom:8px;">
               ⚠️ ROUND 1 RESTRICTION: If drawn during Battle Round 1, click [🔄 Redraw (R1 Rule)] below to reveal another Secondary Mission and shuffle this back into the deck!
             </div>`
          : '';

        const actionHtml = official.actionBlock
          ? `<div style="background:rgba(59,130,246,0.12); border:1px solid rgba(59,130,246,0.35); border-left:3px solid var(--blue); padding:8px 10px; border-radius:6px; margin:8px 0; font-size:0.8rem; color:#dbeafe;">
               <strong style="color:#93c5fd; display:block; margin-bottom:2px;">⚡ ${official.actionTitle || 'Mission Action'} (Rule 3.10: Any Player May Perform)</strong>
               ${official.actionBlock}
             </div>`
          : '';

        const tallyHtml = official.hasTally
          ? `<div style="display:flex; align-items:center; justify-content:space-between; background:#0b0d13; border:1px solid var(--border); padding:6px 10px; border-radius:6px; margin:8px 0;">
               <span style="font-size:0.78rem; color:var(--gold); font-weight:700;">📊 ${official.tallyLabel || 'Mission Tally (X)'}:</span>
               <div style="display:flex; align-items:center; gap:8px;">
                 <button type="button" class="mini-btn" onclick="adjSecondaryTally(${rawCard.id}, -1)">−</button>
                 <strong style="font-size:1rem; color:#fff; min-width:20px; text-align:center;">${tallyVal}</strong>
                 <button type="button" class="mini-btn" onclick="adjSecondaryTally(${rawCard.id}, 1)">+</button>
               </div>
             </div>`
          : '';

        return `
          <div class="card gold" style="border-left:4px solid var(--gold); padding:14px 16px; margin-bottom:10px;">
            <div class="misery-meta-row">
              <span class="badge gold">SECONDARY ${numBadge}</span>
              <span style="font-size:0.72rem; color:var(--muted); font-weight:700; text-transform:uppercase;">${typeTag}</span>
            </div>
            <h4 style="margin:2px 0 6px 0; color:#fff; font-size:1.05rem;">#${rawCard.id} — ${official.name}</h4>
            ${r1Warning}
            ${actionHtml}
            <div style="font-size:0.88rem; color:#f1f5f9; line-height:1.5; margin-bottom:8px;">
              <strong>CONDITION:</strong> ${official.cond || rawCard.cond}
            </div>
            ${tallyHtml}
            <div class="grid-2" style="gap:8px; margin-top:8px;">
              <div style="background:rgba(34,197,94,0.1); border:1px solid rgba(34,197,94,0.35); padding:8px 10px; border-radius:6px; font-size:0.8rem;">
                <strong style="color:var(--green); display:block; margin-bottom:2px;">✅ REWARD ${solo && (official.rewardSp || official.rewardSpFormula) ? '(Solo 2x SP!)' : ''}:</strong>
                <span style="color:#dcfce7;">${official.rew || rawCard.rew}</span>
              </div>
              <div style="background:rgba(255,71,87,0.1); border:1px solid rgba(255,71,87,0.35); padding:8px 10px; border-radius:6px; font-size:0.8rem;">
                <strong style="color:var(--red); display:block; margin-bottom:2px;">❌ PUNISHMENT:</strong>
                <span style="color:#ffe4e6;">${official.pun || rawCard.pun}</span>
              </div>
            </div>
            <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:10px;">
              <button type="button" class="btn-green btn-sm" style="flex:1;" onclick="resolveSecondaryOutcome(${idx}, true)">
                ✅ Mission Success (Claim Reward)
              </button>
              <button type="button" class="btn-red btn-sm" style="flex:1;" onclick="resolveSecondaryOutcome(${idx}, false)">
                ❌ Mission Failed (Apply Punishment)
              </button>
              <button type="button" class="btn-ghost btn-sm" onclick="replaceSecondary()" title="Redraw / Replace Secondary Mission">
                🔄 Redraw
              </button>
            </div>
          </div>
        `;
      }).join('');

    const savedVaultHtml = gRoot.savedSecondaryRewards.length > 0
      ? `<div class="card" style="border:1px dashed var(--gold); background:rgba(234,179,8,0.08); padding:10px 12px; margin-top:10px;">
         <div style="font-size:0.75rem; font-weight:800; color:var(--gold); text-transform:uppercase; margin-bottom:6px;">
           🎒 Saved Secondary Reward Cards (${gRoot.savedSecondaryRewards.length})
         </div>
         ${gRoot.savedSecondaryRewards.map((item, sIdx) => `
           <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; padding:6px 0; border-top:1px solid rgba(255,255,255,0.08); font-size:0.8rem;">
             <span><strong>#${item.id} ${item.name}:</strong> ${item.benefit}</span>
             <button type="button" class="btn-gold btn-sm" onclick="redeemSavedSecondaryCard(${sIdx})">Use &amp; Discard</button>
           </div>
         `).join('')}
       </div>`
      : '';

    box.innerHTML = cardsHtml + savedVaultHtml;
  }

  // --- 4. SPAWNER MIRROR, UNLUCKY NIGHT 3D6 HOOK & COCKPIT CONTROLS ---
  function mirrorSpawnerToCockpit() {
    if (typeof document === 'undefined') return;
    const src = document.getElementById('spawnResultsContainer');
    const dest = document.getElementById('cockpitSpawnMirrorBox');
    if (!src || !dest) return;
    dest.innerHTML = src.innerHTML;

    const spawnerRoundEl = document.getElementById('spawnerBtnRound');
    const cockpitRoundEl = document.getElementById('cockpitSpawnBtnRound');
    if (spawnerRoundEl && cockpitRoundEl) cockpitRoundEl.textContent = spawnerRoundEl.textContent;
    syncMiserySpawnerBanner();
  }

  function rollSpawnsFromCockpit() {
    if (typeof window !== 'undefined' && typeof window.rollAllSpawnZones === 'function') window.rollAllSpawnZones();
    mirrorSpawnerToCockpit();
  }

  // --- 5. GUIDED 5-STEP PHASE TRACKER COCKPIT ---
  let currentGuidedStep = 1;
  const PHASE_STEP_GUIDES = {
    1: { badge: "STEP 1 OF 5 • START OF BATTLE ROUND (RULE 3.2)", heading: "1. Reveal Misery, Secondary Mission & Spawn the Horde", body: "1) Discard last round's Misery cards & reveal this round's new Misery & Secondary cards.<br>2) <strong>Round 1:</strong> Spawns were rolled during Deployment (Rule 2.9). <strong>Rounds 2–5:</strong> Roll 2D6 for each Horde Spawn Zone below! (<strong>Round 6 Final Stand:</strong> 3 Misery cards, NO new Horde spawns)." },
    2: { badge: "STEP 2 OF 5 • HORDE TURN (RULE 3.1 & SECTION 5)", heading: "2. Horde Movement, Shooting, Charge & Fight", body: "The Horde always has the first turn! Move, Shoot, Charge, and Fight with all Horde units using the active <strong>Horde Primary Faction Rule</strong> (top banner) and any active <strong>Misery Card</strong> buffs below. Horde units within a Spawn Zone have Benefit of Cover and are Hidden." },
    3: { badge: "STEP 3 OF 5 • PLAYER COMMAND & RESUPPLY STEP (RULE 3.7 & 3.8)", heading: "3. Battle-Shock, Claim Objective SP & Spend Resupply SP", body: "1) Take Battle-shock tests for Player units below Half-strength (Note: Players do NOT gain core 1 CP in the Command Phase!).<br>2) Click <strong>🚩 Claim Command SP</strong> below to gain 1 SP per controlled objective (+1 for FOB) — <strong>automatically doubled to 2 SP per objective in Solo Mode!</strong><br>3) Open the <strong>Resupply Shop (Tab 3)</strong> to buy Fortifications, Strikes, or Reinforcements." },
    4: { badge: "STEP 4 OF 5 • PLAYER TURN (MOVE / SHOOT / CHARGE / FIGHT)", heading: "4. Execute Secondary Mission Actions & Destroy the Horde", body: "Players move through phases together as a single team! Whenever your attack, ability, or action destroys a Horde unit, click <strong>💀 +1 Horde Unit Destroyed</strong> below (+1 SP in Co-op / <strong>+2 SP in Solo Mode</strong>, up to your 8 or 16 SP round cap)." },
    5: { badge: "STEP 5 OF 5 • END OF BATTLE ROUND (RULE 3.6)", heading: "5. Resolve Secondary Mission Rewards or Punishments", body: "Check your Active Secondary Mission condition below: claim its <strong>Reward</strong> (SP rewards are automatically doubled in Solo Mode!) or apply its <strong>Punishment</strong> (+Misery cards or +Spawn Roll modifiers carry into next round). Then click the red <strong>Advance to Next Battle Round</strong> button at the top!" }
  };

  function setGuidedPhaseStep(stepNum, options = {}) {
    if (!options.silent && typeof window !== 'undefined' && window.VoxAudio && typeof window.VoxAudio.playCogitatorStep === 'function') {
      window.VoxAudio.playCogitatorStep();
    }
    currentGuidedStep = Math.max(1, Math.min(5, Number(stepNum) || 1));
    if (typeof window !== 'undefined') window.currentGuidedStep = currentGuidedStep;
    try {
      if (typeof sessionStorage !== 'undefined') sessionStorage.setItem('currentGuidedStep', String(currentGuidedStep));
      if (typeof localStorage !== 'undefined') localStorage.setItem('currentGuidedStep', String(currentGuidedStep));
    } catch (e) {}
    if (!options.silent) {
      if (typeof saveSessionState === 'function') saveSessionState();
      else if (typeof window !== 'undefined' && typeof window.saveSessionState === 'function') window.saveSessionState();
    }
    if (typeof document !== 'undefined') {
      const buttons = document.querySelectorAll('#roundPhaseStepper .phase-step-btn');
      buttons.forEach(btn => {
        const s = parseInt(btn.getAttribute('data-step'), 10);
        btn.classList.toggle('active-step', s === currentGuidedStep);
      });

      const info = PHASE_STEP_GUIDES[currentGuidedStep];
      if (info) {
        const bEl = document.getElementById('guidedPhaseBadge');
        const hEl = document.getElementById('guidedPhaseHeading');
        const dEl = document.getElementById('guidedPhaseInstructions');
        if (bEl) bEl.textContent = info.badge;
        if (hEl) hEl.textContent = info.heading;
        if (dEl) dEl.innerHTML = info.body;
      }
    }
  }

  function stepGuidedPhase(delta, options = {}) {
    let next = currentGuidedStep + delta;
    if (options.allowCycle) {
      if (next > 5) next = 1;
      if (next < 1) next = 5;
    } else {
      next = Math.max(1, Math.min(5, next));
    }
    setGuidedPhaseStep(next);
  }

  function updateGuidedFlowForRound(options = {}) {
    const r = getCurrentBattleRound();
    if (typeof document !== 'undefined') {
      const summaryBadge = document.getElementById('roundRuleSummaryBadge');
      const cockpitRoundEl = document.getElementById('cockpitSpawnBtnRound');
      if (cockpitRoundEl) cockpitRoundEl.textContent = String(r > 0 ? r : 1);

      if (summaryBadge) {
        if (r === 0) {
          summaryBadge.textContent = 'Deployment Step 2.9: Roll Round 1 Spawns First!';
        } else if (r === 1) {
          summaryBadge.textContent = 'Hard Mode Rnd 1: 1 Misery • +0 Spawn Mod (Spawns Rolled in Deployment)';
        } else if (r === 2) {
          summaryBadge.textContent = 'Hard Mode Rnd 2: 1 Misery • +1 Spawn Mod';
        } else if (r === 3) {
          summaryBadge.textContent = 'Hard Mode Rnd 3: 2 Misery • +2 Spawn Mod';
        } else if (r === 4) {
          summaryBadge.textContent = 'Hard Mode Rnd 4: 2 Misery • +3 Spawn Mod';
        } else if (r === 5) {
          summaryBadge.textContent = 'Hard Mode Rnd 5: 3 Misery • +3 Spawn Mod';
        } else {
          summaryBadge.textContent = 'Hard Mode Rnd 6 (Final Stand): 3 Misery • NO New Spawns • Horde Turn Only!';
        }
      }
    }
    if (options && options.resetStep) setGuidedPhaseStep(1, { silent: true });
  }


  // --- 6. WRAPPERS & BINDINGS FOR LIVE SPAWNER INTERACTION ---
  function bindSpawnerCockpitWrappers() {
    if (typeof window === 'undefined') return;

    // Wrap gainSP for Solo Mode 2x SP
    if (typeof window.gainSP === 'function' && !window.gainSP._isSoloDoubleWrapped) {
      const baseGainSP = window.gainSP;
      const wrappedGainSP = function (amount, options = {}) {
        const solo = isSoloModeActive();
        const shouldDouble = solo && !options.alreadyDoubled && !options.rawSingle;
        const finalAmount = shouldDouble ? (Number(amount) || 0) * 2 : (Number(amount) || 0);
        return baseGainSP(finalAmount, options);
      };
      wrappedGainSP._isSoloDoubleWrapped = true;
      wrappedGainSP._baseGainSP = baseGainSP;
      window.gainSP = wrappedGainSP;
    }

    // Wrap selectMode & startSession to keep Solo indicators synced
    if (typeof window.selectMode === 'function' && !window.selectMode._isSoloSyncWrapped) {
      const origSelectMode = window.selectMode;
      const wrappedSelectMode = function (mode) {
        const res = origSelectMode.apply(this, arguments);
        syncSoloSpUiIndicators();
        return res;
      };
      wrappedSelectMode._isSoloSyncWrapped = true;
      window.selectMode = wrappedSelectMode;
    }

    if (typeof window.startSession === 'function' && !window.startSession._isSoloSyncWrapped) {
      const origStartSession = window.startSession;
      const wrappedStartSession = function () {
        const res = origStartSession.apply(this, arguments);
        syncSoloSpUiIndicators();
        updateGuidedFlowForRound({ resetStep: true });
        resetCommandObjectiveClaimState();
        mirrorSpawnerToCockpit();
        return res;
      };
      wrappedStartSession._isSoloSyncWrapped = true;
      window.startSession = wrappedStartSession;
    }

    // Wrap rollAllSpawnZones for Misery #7 (Unlucky Night 3D6 Drop Lowest)
    if (typeof window.rollAllSpawnZones === 'function' && !window.rollAllSpawnZones._isUnluckyNightWrapped) {
      const origRollAllSpawnZones = window.rollAllSpawnZones;
      const wrappedRoll = function () {
        ensureMiserySpawnerControls();
        syncMiserySpawnerBanner();
        const res = origRollAllSpawnZones.apply(this, arguments);

        if (isUnluckyNightActive() && typeof document !== 'undefined') {
          const container = document.getElementById('spawnResultsContainer');
          if (container) {
            container.querySelectorAll('.spawn-zone').forEach(card => {
              const d = [1, 2, 3].map(() => Math.floor(Math.random() * 6) + 1).sort((a, b) => b - a);
              const unmod3d6 = d[0] + d[1];
              const badge = document.createElement('div');
              badge.style.cssText = 'margin-top:6px; padding:4px 8px; background:rgba(255,71,87,0.16); border:1px solid var(--red); border-radius:6px; font-size:0.76rem; color:#fecdd3;';
              badge.innerHTML = `🎲 <strong>#7 Unlucky Night (3D6 Drop Lowest):</strong> Rolled [${d[0]}, ${d[1]}, <s>${d[2]}</s>] → Base 2D6 = <strong>${unmod3d6}</strong>`;
              card.appendChild(badge);
            });
          }
        }
        mirrorSpawnerToCockpit();
        return res;
      };
      wrappedRoll._isUnluckyNightWrapped = true;
      window.rollAllSpawnZones = wrappedRoll;
    }

    // Wrap clearSpawnerResults & triggerZoneRollDown to keep cockpit mirror synced
    if (typeof window.clearSpawnerResults === 'function' && !window.clearSpawnerResults._isMirrorWrapped) {
      const origClearSpawnerResults = window.clearSpawnerResults;
      const wrappedClear = function () {
        const res = origClearSpawnerResults.apply(this, arguments);
        mirrorSpawnerToCockpit();
        return res;
      };
      wrappedClear._isMirrorWrapped = true;
      window.clearSpawnerResults = wrappedClear;
    }

    if (typeof window.triggerZoneRollDown === 'function' && !window.triggerZoneRollDown._isMirrorWrapped) {
      const origTriggerZoneRollDown = window.triggerZoneRollDown;
      const wrappedTrigger = function () {
        const res = origTriggerZoneRollDown.apply(this, arguments);
        mirrorSpawnerToCockpit();
        return res;
      };
      wrappedTrigger._isMirrorWrapped = true;
      window.triggerZoneRollDown = wrappedTrigger;
    }

    if (typeof window.rollDownZone === 'function' && !window.rollDownZone._isMirrorWrapped) {
      const origRollDown = window.rollDownZone;
      const wrappedRollDown = function () {
        const res = origRollDown.apply(this, arguments);
        mirrorSpawnerToCockpit();
        return res;
      };
      wrappedRollDown._isMirrorWrapped = true;
      window.rollDownZone = wrappedRollDown;
    }

    // Wrap advanceBattleRound for round updates & auto-rolling spawns
    if (typeof window.advanceBattleRound === 'function' && !window.advanceBattleRound._isGuidedFlowWrapped) {
      const origAdvanceBattleRound = window.advanceBattleRound;
      const wrappedAdvance = function () {
        if (window.VoxAudio && typeof window.VoxAudio.playWarhorn === 'function') {
          window.VoxAudio.playWarhorn();
        }
        const res = origAdvanceBattleRound.apply(this, arguments);
        syncSoloSpUiIndicators();
        updateGuidedFlowForRound({ resetStep: true });
        resetCommandObjectiveClaimState();

        const r = getCurrentBattleRound();
        const autoRoll = !!document.getElementById('autoRollSpawnsOnAdvanceCheck')?.checked;
        if (autoRoll && r >= 2 && r <= 5 && typeof window.rollAllSpawnZones === 'function') {
          window.rollAllSpawnZones();
        } else {
          mirrorSpawnerToCockpit();
        }
        return res;
      };
      wrappedAdvance._isGuidedFlowWrapped = true;
      window.advanceBattleRound = wrappedAdvance;
    }
  }

  function initSpawnerCockpit() {
    bindSpawnerCockpitWrappers();
    ensureMiserySpawnerControls();
    syncSoloSpUiIndicators();
    renderActiveMiseries();
    renderActiveSecondaries();
    if (typeof renderResupplyTable === 'function') renderResupplyTable();
    const savedStep = (typeof localStorage !== 'undefined' && localStorage.getItem('currentGuidedStep'))
      ? parseInt(localStorage.getItem('currentGuidedStep'), 10)
      : (typeof sessionStorage !== 'undefined' ? parseInt(sessionStorage.getItem('currentGuidedStep'), 10) : 1);
    setGuidedPhaseStep((!isNaN(savedStep) && savedStep >= 1 && savedStep <= 5) ? savedStep : 1, { silent: true });
    if (typeof setTimeout === 'function') setTimeout(mirrorSpawnerToCockpit, 150);
  }

  // Auto-init in browser if DOM is ready, or queue for DOMContentLoaded
  if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initSpawnerCockpit);
    else initSpawnerCockpit();
  }

  return {
    isSoloModeActive,
    syncSoloSpUiIndicators,
    getCurrentBattleRound,
    updateCommandObjectiveClaimButton,
    resetCommandObjectiveClaimState,
    awardCommandPhaseObjectiveSP,
    awardHordeKillSP,
    isUnluckyNightActive,
    isPincerManeuverActive,
    ensureMiserySpawnerControls,
    syncMiserySpawnerBanner,
    adjustExtraSpawnRollMod,
    rollPincerManeuverExtraSpawn,
    renderActiveMiseries,
    resolveOrbitalBombardmentRoll,
    nullifyMisery,
    adjSecondaryTally,
    resolveSecondaryOutcome,
    redeemSavedSecondaryCard,
    renderActiveSecondaries,
    mirrorSpawnerToCockpit,
    rollSpawnsFromCockpit,
    wipeAllFortifications,
    get currentGuidedStep() { return currentGuidedStep; },
    setGuidedPhaseStep,
    stepGuidedPhase,
    updateGuidedFlowForRound,

    bindSpawnerCockpitWrappers,
    initSpawnerCockpit
  };
});
