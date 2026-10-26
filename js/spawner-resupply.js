/**
 * 📦 FIRES OF ARMAGEDDON // RESUPPLY SHOP & TACTICAL CALCULATORS
 * Module: js/spawner-resupply.js
 *
 * Implements:
 * - Section 7.1 Authoritative Resupply Table logic & interactive calculators
 * - Automatic Misery card lockout detection:
 *     #21 Bunkers Busted -> Fortify lockout
 *     #22 Comms Jammed -> Supply, Spawn, Strike lockout
 *     #23 The Mind Killer -> Tactics lockout
 *     #29 Fate's Fetters -> Secondary lockout
 * - Dynamic Variable X-SP Calculators:
 *     - Patched Up: Interactive wound stepper (X wounds = X SP)
 *     - Deploy Fortification: Bracket minimum roll selector (3, 5, 7, 10 SP)
 *     - Field Promotion: Sacrificed unit bracket selector + 1D6 dice roll calculation
 * - Dice Rollers:
 *     - Air Strike: 2D3 mortal wounds roll
 *     - Reinforcements Arrive: 2D6 bracket roll (fails on unmodified roll of 2)
 * - Safe purchase execution with double-cost toggle support and automatic card side-effects.
 */

(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    const exports = factory();
    Object.assign(root, exports);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {

  const gRoot = typeof window !== 'undefined' ? window : globalThis;

  // Track variable X inputs and Field Promotion rolls for Resupply Shop
  gRoot.resupplyVarState = gRoot.resupplyVarState || {
    patchedUpWounds: 3,
    fortBracketCost: 5,
    promoBaseMin: 3,
    promoLastRoll: null
  };

  /**
   * Checks if any active Misery card locks out a given Resupply tag array.
   * @param {string[]} tags - Array of card tags (e.g. ['Fortify'], ['Tactics'])
   * @returns {string|null} Lockout explanation text if blocked, or null if allowed.
   */
  function getMiseryLockoutReason(tags = []) {
    if (typeof state === 'undefined' || !state || !Array.isArray(state.activeMiseries)) return null;
    const ids = state.activeMiseries.map(m => m.id);
    if (ids.includes(21) && tags.includes('Fortify')) {
      return 'Locked by Misery #21 (Bunkers Busted: No Fortify purchases)';
    }
    if (ids.includes(22)) {
      const blocked = tags.filter(t => ['Supply', 'Spawn', 'Strike'].includes(t));
      if (blocked.length > 0) {
        return `Locked by Misery #22 (Comms Jammed: No ${blocked.join('/')} purchases)`;
      }
    }
    if (ids.includes(23) && tags.includes('Tactics')) {
      return 'Locked by Misery #23 (The Mind Killer: No Tactics purchases)';
    }
    if (ids.includes(29) && tags.includes('Secondary')) {
      return 'Locked by Misery #29 (Fate\'s Fetters: No Secondary purchases)';
    }
    return null;
  }

  /**
   * Adjusts the number of wounds to heal for the 'Patched Up' resupply card (X = wounds).
   * @param {number} delta - Positive or negative integer adjustment
   */
  function adjPatchedUpWounds(delta) {
    gRoot.resupplyVarState.patchedUpWounds = Math.max(
      1,
      Math.min(16, (gRoot.resupplyVarState.patchedUpWounds || 3) + delta)
    );
    renderResupplyTable();
  }

  /**
   * Sets the fortification minimum bracket cost (X SP) for 'Deploy Fortification'.
   * @param {string|number} val - Cost value (3, 5, 7, 10)
   */
  function setFortBracketCost(val) {
    gRoot.resupplyVarState.fortBracketCost = parseInt(val, 10) || 5;
    renderResupplyTable();
  }

  /**
   * Sets the base minimum bracket roll for 'Field Promotion' calculation.
   * @param {string|number} val - Base minimum value (3, 5, 7, 10)
   */
  function setPromoBaseMin(val) {
    gRoot.resupplyVarState.promoBaseMin = parseInt(val, 10) || 3;
    renderResupplyTable();
  }

  /**
   * Rolls 1D6 and calculates total SP cost for 'Field Promotion' (1D6 + min bracket roll).
   */
  function rollFieldPromotionCost() {
    const d6 = Math.floor(Math.random() * 6) + 1;
    const baseMin = gRoot.resupplyVarState.promoBaseMin || 3;
    const modTotal = d6 + baseMin;
    const bInfo = (typeof getBracketInfo === 'function')
      ? getBracketInfo(modTotal, modTotal)
      : { label: `Bracket [${modTotal}]`, pts: '' };
    gRoot.resupplyVarState.promoLastRoll = {
      d6,
      baseMin,
      totalCost: modTotal,
      bracketLabel: bInfo.label,
      pts: bInfo.pts
    };
    renderResupplyTable();
  }

  /**
   * Rolls 2D3 mortal wounds for 'Air Strike' and renders impact output.
   * @param {HTMLElement} [btnEl] - Optional triggering button element
   */
  function rollAirStrikeDamage(btnEl) {
    const d3a = Math.floor(Math.random() * 3) + 1;
    const d3b = Math.floor(Math.random() * 3) + 1;
    if (typeof document !== 'undefined') {
      const outEl = document.getElementById('airStrikeRollOut');
      if (outEl) {
        outEl.innerHTML = `💥 <strong>Air Strike Impact:</strong> Each unit inside the target terrain suffers <strong>${d3a + d3b} Mortal Wounds</strong> (2D3: ${d3a}+${d3b}), then remove the terrain feature!`;
      }
    }
  }

  /**
   * Rolls 2D6 for 'Reinforcements Arrive' and displays resulting bracket or failure on 2.
   */
  function rollReinforcementsBracket() {
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const sum = d1 + d2;
    if (typeof document === 'undefined') return;
    const outEl = document.getElementById('reinforcementsRollOut');
    if (!outEl) return;
    if (sum === 2) {
      outEl.innerHTML = `⚠️ <strong>Rolled 2 (1+1) — REINFORCEMENTS FAIL!</strong> Per official card rules, an unmodified roll of 2 fails to deploy.`;
    } else {
      const bInfo = (typeof getBracketInfo === 'function')
        ? getBracketInfo(sum, sum)
        : { label: `Bracket [${sum}]`, pts: '' };
      outEl.innerHTML = `🪂 <strong>Rolled ${sum} (${d1}+${d2}) → ${bInfo.label} (${bInfo.pts})!</strong> Pick 1 unit of your choice from this bracket (or lower if none available) and place into Strategic Reserves.`;
    }
  }

  /**
   * Executes a purchase from the Resupply table, checking SP, deducting cost,
   * and applying automated marker/side-effect adjustments.
   * @param {string} itemName - Resupply card name
   * @param {number} baseSpCost - Base SP cost before doubling
   */
  function executeEnhancedResupplyPurchase(itemName, baseSpCost) {
    const isDouble = !!((typeof document !== 'undefined') && document.getElementById('doubleCostToggle')?.checked);
    const numCost = Number(baseSpCost) || 0;
    const finalCost = isDouble ? numCost * 2 : numCost;

    const curSp = (typeof state !== 'undefined' && state && typeof state.sp === 'number')
      ? state.sp
      : (typeof sp !== 'undefined' ? sp : 0);

    if (curSp < finalCost) {
      if (typeof alert === 'function') {
        alert(`Insufficient Supply Points! Need ${finalCost} SP (Currently have ${curSp} SP).`);
      }
      return;
    }

    if (typeof gRoot.loseSP === 'function') {
      gRoot.loseSP(finalCost);
    } else if (typeof loseSP === 'function') {
      loseSP(finalCost);
    }

    const overrides = gRoot.RESUPPLY_OFFICIAL_OVERRIDES || {};
    const override = overrides[itemName];
    if (override && override.autoEffect) {
      const eff = override.autoEffect;
      const adjCpFn = typeof gRoot.adjCP === 'function' ? gRoot.adjCP : (typeof adjCP === 'function' ? adjCP : null);
      const adjMarkerFn = typeof gRoot.adjMarker === 'function' ? gRoot.adjMarker : (typeof adjMarker === 'function' ? adjMarker : null);

      if (eff === 'GAIN_1_CP' && adjCpFn) {
        adjCpFn(1);
      } else if (eff === 'MARKER_TELE' && adjMarkerFn) {
        adjMarkerFn('teleCount', 1, 3);
      } else if (eff === 'MARKER_WIRE' && adjMarkerFn) {
        adjMarkerFn('wireCount', 1, 2);
      } else if (eff === 'MARKER_MINE' && typeof document !== 'undefined') {
        const mEl = document.getElementById('mineCount');
        if (mEl) mEl.textContent = '0';
      } else if (eff === 'FORT_FOB' && typeof document !== 'undefined') {
        const el = document.getElementById('fobFortCheck');
        if (el) el.checked = true;
      } else if (eff === 'FORT_JAMMER') {
        if (typeof document !== 'undefined') {
          const el = document.getElementById('jammerCheck');
          if (el) el.checked = true;
        }
        if (typeof gRoot.syncMiserySpawnerBanner === 'function') gRoot.syncMiserySpawnerBanner();
      } else if (eff === 'DRAW_SECOND_MISSION' && typeof gRoot.drawSecondary === 'function') {
        gRoot.drawSecondary(false);
      } else if (eff === 'REPLACE_MISSION' && typeof gRoot.replaceSecondary === 'function') {
        gRoot.replaceSecondary();
      } else if (eff === 'CHANGE_OF_PLANS' && typeof gRoot.triggerChangeOfPlans === 'function') {
        gRoot.triggerChangeOfPlans();
        if (typeof gRoot.switchTab === 'function') gRoot.switchTab(2);
      }
    }
    renderResupplyTable();
  }

  /**
   * Renders the Resupply Shop list with official text, tag filters, Misery lockout status,
   * and interactive calculators for variable cost options.
   */
  function renderResupplyTable() {
    if (typeof document === 'undefined') return;
    const listEl = document.getElementById('resupplyList');
    if (!listEl) return;

    const items = (typeof RESUPPLY_TABLE !== 'undefined')
      ? RESUPPLY_TABLE
      : (typeof window !== 'undefined' && window.RESUPPLY_TABLE ? window.RESUPPLY_TABLE : (typeof RESUPPLIES !== 'undefined' ? RESUPPLIES : []));

    const activeFilter = (typeof currentShopFilter !== 'undefined') ? currentShopFilter : 'All';
    const isDouble = !!document.getElementById('doubleCostToggle')?.checked;
    const curSp = (typeof state !== 'undefined' && state && typeof state.sp === 'number')
      ? state.sp
      : (typeof sp !== 'undefined' ? sp : 0);

    const overrides = gRoot.RESUPPLY_OFFICIAL_OVERRIDES || {};

    const filtered = items.filter(it => {
      if (activeFilter === 'All') return true;
      const official = overrides[it.name] || it;
      const tags = Array.isArray(official.tags)
        ? official.tags
        : (Array.isArray(it.tags) ? it.tags : (typeof it.tags === 'string' ? it.tags.split(',').map(s => s.trim()) : []));
      return tags.includes(activeFilter);
    });

    listEl.innerHTML = filtered.map(rawItem => {
      const official = overrides[rawItem.name] || rawItem;
      const tags = Array.isArray(official.tags)
        ? official.tags
        : (Array.isArray(rawItem.tags) ? rawItem.tags : (typeof rawItem.tags === 'string' ? rawItem.tags.split(',').map(s => s.trim()) : []));

      const lockoutMsg = getMiseryLockoutReason(tags);
      const limitText = official.limit || '';
      const descText = official.desc || rawItem.desc || '';

      const tagPills = tags.map(t => `<span class="badge" style="font-size:0.68rem; padding:2px 7px;">${t}</span>`).join(' ');

      let effectiveBaseCost = typeof official.cost === 'number' ? official.cost : (parseInt(rawItem.cost, 10) || 0);
      let extraControlsHtml = '';

      if (official.varType === 'PATCHED_UP') {
        effectiveBaseCost = gRoot.resupplyVarState.patchedUpWounds || 3;
        extraControlsHtml = `
          <div style="display:flex; align-items:center; justify-content:space-between; background:#0b0d13; border:1px solid var(--border); padding:6px 10px; border-radius:6px; margin-top:8px;">
            <span style="font-size:0.78rem; color:var(--gold); font-weight:700;">🩹 Select Wounds to Heal (X):</span>
            <div style="display:flex; align-items:center; gap:8px;">
              <button type="button" class="mini-btn" onclick="adjPatchedUpWounds(-1)">−</button>
              <strong style="color:#fff; font-size:0.95rem; min-width:48px; text-align:center;">${effectiveBaseCost} W</strong>
              <button type="button" class="mini-btn" onclick="adjPatchedUpWounds(1)">+</button>
            </div>
          </div>`;
      } else if (official.varType === 'DEPLOY_FORT') {
        effectiveBaseCost = gRoot.resupplyVarState.fortBracketCost || 5;
        extraControlsHtml = `
          <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px; background:#0b0d13; border:1px solid var(--border); padding:6px 10px; border-radius:6px; margin-top:8px;">
            <span style="font-size:0.78rem; color:var(--gold); font-weight:700;">🏰 Fortification Min Bracket (X):</span>
            <select onchange="setFortBracketCost(this.value)" style="padding:4px 8px; background:#141824; color:#fff; border:1px solid var(--border); border-radius:4px; font-size:0.8rem;">
              <option value="3" ${effectiveBaseCost===3?'selected':''}>Bracket [3–4] (0–75 pts) → 3 SP</option>
              <option value="5" ${effectiveBaseCost===5?'selected':''}>Bracket [5–6] (76–150 pts) → 5 SP</option>
              <option value="7" ${effectiveBaseCost===7?'selected':''}>Bracket [7–9] (151–300 pts) → 7 SP</option>
              <option value="10" ${effectiveBaseCost===10?'selected':''}>Bracket [10–12] (301–550 pts) → 10 SP</option>
            </select>
          </div>`;
      } else if (official.varType === 'FIELD_PROMO') {
        const pState = gRoot.resupplyVarState;
        effectiveBaseCost = pState.promoLastRoll ? pState.promoLastRoll.totalCost : (pState.promoBaseMin + 3);
        extraControlsHtml = `
          <div style="background:#0b0d13; border:1px solid var(--border); padding:8px 10px; border-radius:6px; margin-top:8px;">
            <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px;">
              <span style="font-size:0.76rem; color:var(--gold); font-weight:700;">🎖️ 1. Sacrificed Unit's Current Bracket:</span>
              <select onchange="setPromoBaseMin(this.value)" style="padding:4px 8px; background:#141824; color:#fff; border:1px solid var(--border); border-radius:4px; font-size:0.78rem;">
                <option value="3" ${pState.promoBaseMin===3?'selected':''}>Bracket [3–4] (Min Roll: 3)</option>
                <option value="5" ${pState.promoBaseMin===5?'selected':''}>Bracket [5–6] (Min Roll: 5)</option>
                <option value="7" ${pState.promoBaseMin===7?'selected':''}>Bracket [7–9] (Min Roll: 7)</option>
                <option value="10" ${pState.promoBaseMin===10?'selected':''}>Bracket [10–12] (Min Roll: 10)</option>
              </select>
              <button type="button" class="btn-gold btn-sm" onclick="rollFieldPromotionCost()">🎲 2. Roll 1D6 + Min</button>
            </div>
            ${pState.promoLastRoll ? `
              <div style="margin-top:6px; font-size:0.8rem; color:#dcfce7;">
                Rolled <strong>${pState.promoLastRoll.d6}</strong> + Min <strong>${pState.promoLastRoll.baseMin}</strong> = <strong>X = ${pState.promoLastRoll.totalCost} SP</strong> → Upgrade into <strong>${pState.promoLastRoll.bracketLabel} (${pState.promoLastRoll.pts})</strong>!
              </div>
            ` : ''}
          </div>`;
      } else if (official.hasAirStrikeRoller) {
        extraControlsHtml = `
          <div style="margin-top:8px;">
            <button type="button" class="btn-ghost btn-sm" onclick="rollAirStrikeDamage(this)">🎲 Roll 2D3 Air Strike Mortal Wounds</button>
            <div id="airStrikeRollOut" style="margin-top:4px; font-size:0.8rem; color:var(--gold);"></div>
          </div>`;
      } else if (official.hasReinforcementsRoller) {
        extraControlsHtml = `
          <div style="margin-top:8px;">
            <button type="button" class="btn-ghost btn-sm" onclick="rollReinforcementsBracket()">🎲 Roll 2D6 Reinforcements Bracket</button>
            <div id="reinforcementsRollOut" style="margin-top:4px; font-size:0.8rem; color:var(--gold);"></div>
          </div>`;
      }

      const finalSpCost = isDouble ? effectiveBaseCost * 2 : effectiveBaseCost;
      const canAfford = curSp >= finalSpCost && !lockoutMsg;

      return `
        <div class="card" style="padding:14px 16px; margin-bottom:10px; border-left:4px solid ${lockoutMsg ? 'var(--red)' : (canAfford ? 'var(--blue)' : 'var(--border)')}; opacity:${lockoutMsg ? '0.68' : '1'};">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px; flex-wrap:wrap;">
            <div>
              <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap; margin-bottom:4px;">
                ${tagPills}
                ${limitText ? `<span style="font-size:0.72rem; color:var(--gold); font-weight:700;">• ${limitText}</span>` : ''}
              </div>
              <h4 style="margin:0; font-size:1.02rem; color:#fff;">${rawItem.name}</h4>
            </div>
            <button type="button" class="${lockoutMsg ? 'btn-red' : (canAfford ? 'btn-blue' : 'btn-ghost')} btn-sm"
              ${lockoutMsg ? 'disabled' : ''}
              onclick="executeEnhancedResupplyPurchase('${rawItem.name.replace(/'/g, "\\'")}', ${effectiveBaseCost})"
              style="font-weight:800; min-width:110px;">
              ${lockoutMsg ? '🚫 Locked' : `Buy (${finalSpCost} SP)`}
            </button>
          </div>
          ${lockoutMsg ? `<div style="margin-top:6px; padding:4px 8px; background:rgba(255,71,87,0.16); border:1px solid var(--red); border-radius:4px; font-size:0.76rem; color:#fda4af; font-weight:700;">🚫 ${lockoutMsg}</div>` : ''}
          <p class="card-desc" style="margin:8px 0 0 0; font-size:0.86rem; line-height:1.5; color:#e2e8f0;">${descText}</p>
          ${extraControlsHtml}
        </div>
      `;
    }).join('');
  }

  // Auto-render when script loads in browser if DOM is ready
  if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', renderResupplyTable);
    } else {
      renderResupplyTable();
    }
  }

  return {
    getMiseryLockoutReason,
    adjPatchedUpWounds,
    setFortBracketCost,
    setPromoBaseMin,
    rollFieldPromotionCost,
    rollAirStrikeDamage,
    rollReinforcementsBracket,
    executeEnhancedResupplyPurchase,
    renderResupplyTable
  };
});
