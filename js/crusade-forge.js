/**
 * @fileoverview Crusade Tactical Forge & Tour of Duty Humble View Controller (MVVM Shell).
 * Projects explicit Crusade state (`State -> UI`) and forwards DOM user intents (`Event -> Core -> State`)
 * for Tab 1 (Scoreboard & Branching Alliance Trees), Tab 2 (Quartermaster Forge Rollers & Roll Queue),
 * and Tab 3 (Astra Militarum Tour of Duty & Munitorum Logistics Allocator).
 * All pure game rules, RNG math, ViewModel derivation, and dispatch formatting live in `js/crusade-core.js`.
 */

var _forgeCore = (typeof CrusadeCore !== 'undefined' && CrusadeCore)
  ? CrusadeCore
  : (typeof require === 'function' ? require('./crusade-core.js') : null);

var _forgeData = (typeof require === 'function' && typeof BATTLE_TRAIT_TABLES === 'undefined')
  ? (function () { try { return require('./crusade-data.js'); } catch (_) { return {}; } })()
  : {};

var crusadeState = _forgeCore.createInitialCrusadeState();

var lastRolledItem = {
  trait: null,
  weapon: null,
  relic: null,
  scar: null
};

function _getForgeEl(id) {
  return typeof document !== 'undefined' ? document.getElementById(id) : null;
}

function _getVoxAudio() {
  return (typeof window !== 'undefined' && window.VoxAudio) ? window.VoxAudio : null;
}

function _scheduleForgeReveal(callback, delayMs) {
  if (typeof setTimeout !== 'function') {
    callback();
    return;
  }
  const handle = setTimeout(callback, delayMs);
  if (handle && typeof handle.unref === 'function') handle.unref();
}

function _resolveForgeCatalogs() {
  const win = typeof window !== 'undefined' ? window : {};
  return {
    allianceTrees: (typeof ALLIANCE_TREES !== 'undefined' ? ALLIANCE_TREES : win.ALLIANCE_TREES) || _forgeData.ALLIANCE_TREES || {},
    battleTraits: (typeof BATTLE_TRAIT_TABLES !== 'undefined' ? BATTLE_TRAIT_TABLES : win.BATTLE_TRAIT_TABLES) || _forgeData.BATTLE_TRAIT_TABLES || {},
    astraTraits: (typeof ASTRA_MILITARUM_TRAIT_TABLES !== 'undefined' ? ASTRA_MILITARUM_TRAIT_TABLES : win.ASTRA_MILITARUM_TRAIT_TABLES) || _forgeData.ASTRA_MILITARUM_TRAIT_TABLES || {},
    necronTraits: (typeof NECRONS_TRAIT_TABLES !== 'undefined' ? NECRONS_TRAIT_TABLES : win.NECRONS_TRAIT_TABLES) || _forgeData.NECRONS_TRAIT_TABLES || {},
    votannTraits: (typeof VOTANN_TRAIT_TABLES !== 'undefined' ? VOTANN_TRAIT_TABLES : win.VOTANN_TRAIT_TABLES) || _forgeData.VOTANN_TRAIT_TABLES || {},
    weaponMods: (typeof WEAPON_MOD_TABLE !== 'undefined' ? WEAPON_MOD_TABLE : win.WEAPON_MOD_TABLE) || _forgeData.WEAPON_MOD_TABLE || [],
    relicVault: (typeof CRUSADE_RELIC_VAULT !== 'undefined' ? CRUSADE_RELIC_VAULT : win.CRUSADE_RELIC_VAULT) || _forgeData.CRUSADE_RELIC_VAULT || {},
    astraRelics: (typeof ASTRA_MILITARUM_RELIC_VAULT !== 'undefined' ? ASTRA_MILITARUM_RELIC_VAULT : win.ASTRA_MILITARUM_RELIC_VAULT) || _forgeData.ASTRA_MILITARUM_RELIC_VAULT || {},
    necronRelics: (typeof NECRONS_RELIC_VAULT !== 'undefined' ? NECRONS_RELIC_VAULT : win.NECRONS_RELIC_VAULT) || _forgeData.NECRONS_RELIC_VAULT || {},
    votannRelics: (typeof VOTANN_RELIC_VAULT !== 'undefined' ? VOTANN_RELIC_VAULT : win.VOTANN_RELIC_VAULT) || _forgeData.VOTANN_RELIC_VAULT || {},
    battleScars: (typeof BATTLE_SCAR_TABLE !== 'undefined' ? BATTLE_SCAR_TABLE : win.BATTLE_SCAR_TABLE) || _forgeData.BATTLE_SCAR_TABLE || [],
    necronScars: (typeof NECRON_BATTLE_SCAR_TABLE !== 'undefined' ? NECRON_BATTLE_SCAR_TABLE : win.NECRON_BATTLE_SCAR_TABLE) || _forgeData.NECRON_BATTLE_SCAR_TABLE || [],
    votannScars: (typeof VOTANN_BATTLE_SCAR_TABLE !== 'undefined' ? VOTANN_BATTLE_SCAR_TABLE : win.VOTANN_BATTLE_SCAR_TABLE) || _forgeData.VOTANN_BATTLE_SCAR_TABLE || [],
    logisticsCategories: (typeof LOGISTICS_CATEGORIES !== 'undefined' ? LOGISTICS_CATEGORIES : win.LOGISTICS_CATEGORIES) || _forgeData.LOGISTICS_CATEGORIES || [],
    commendationsVault: (typeof ASTRA_COMMENDATIONS_VAULT !== 'undefined' ? ASTRA_COMMENDATIONS_VAULT : win.ASTRA_COMMENDATIONS_VAULT) || _forgeData.ASTRA_COMMENDATIONS_VAULT || []
  };
}

function _syncPostForgeChange() {
  if (typeof updateMasterDossierPreview === 'function') updateMasterDossierPreview();
  if (typeof saveCrusadeState === 'function') saveCrusadeState();
}

/**
 * Declaratively switches active Crusade tabs using `CRUSADE_TAB_DESCRIPTORS`
 * and locks faction-specific tabs to their dedicated CSS palette.
 */
function switchCrusadeTab(which, persist = true) {
  crusadeState.activeTab = which;
  Object.entries(_forgeCore.CRUSADE_TAB_DESCRIPTORS).forEach(([tabKey, desc]) => {
    const panel = _getForgeEl(desc.panelId);
    const btn = _getForgeEl(desc.buttonId);
    if (panel) panel.classList.toggle('hidden', tabKey !== which);
    if (btn) btn.classList.toggle('active', tabKey === which);
  });

  if (typeof document !== 'undefined' && document.body && document.body.classList) {
    const activeDesc = _forgeCore.CRUSADE_TAB_DESCRIPTORS[which];
    if (activeDesc && activeDesc.bodyThemeClass) {
      _forgeCore.FACTION_THEME_CLASSES.forEach((cls) => {
        if (cls === activeDesc.bodyThemeClass) document.body.classList.add(cls);
        else document.body.classList.remove(cls);
      });
    } else {
      const audio = _getVoxAudio();
      if (audio && typeof audio.syncFactionTheme === 'function') audio.syncFactionTheme();
    }
  }

  if (persist && typeof saveCrusadeState === 'function') saveCrusadeState();
}

/**
 * Updates an Alliance Strategic or Campaign Point counter via `CrusadeCore.clampCounter`.
 */
function adjScore(field, delta) {
  crusadeState[field] = _forgeCore.clampCounter(crusadeState[field], delta);
  const el = _getForgeEl(field);
  if (el) el.textContent = crusadeState[field];
  if (typeof saveCrusadeState === 'function') saveCrusadeState();
}

/**
 * Renders the selected Alliance narrative tree phases idempotently into `#allianceTreeBox`.
 */
function selectAllianceTree(alliance, persist = true) {
  crusadeState.selectedTree = alliance;
  Object.entries(_forgeCore.ALLIANCE_TREE_BUTTON_MAP).forEach(([treeKey, btnId]) => {
    const btn = _getForgeEl(btnId);
    if (btn) btn.classList.toggle('active', treeKey === alliance);
  });

  const trees = _resolveForgeCatalogs().allianceTrees;
  const phases = trees[alliance] || trees.Gatebreakers || [];
  const box = _getForgeEl('allianceTreeBox');
  if (box) {
    box.innerHTML = phases.map((p) => `
      <div class="card" style="background:#0b0d13; margin-bottom:10px;">
        <div style="font-weight:800; color:var(--gold); font-size:0.95rem; margin-bottom:4px;">${p.phase}</div>
        <div style="font-size:0.86rem; color:#fff; margin-bottom:8px;"><strong>Narrative Goal:</strong> ${p.goal}</div>
        <div style="font-size:0.82rem; color:var(--green); margin-bottom:4px;">✓ ${p.success}</div>
        <div style="font-size:0.82rem; color:var(--red);">✗ ${p.failure}</div>
      </div>
    `).join('');
  }

  if (persist && typeof saveCrusadeState === 'function') saveCrusadeState();
}

// =============================================================================
// QUARTERMASTER FORGE ROLLER ADAPTERS (SHELL -> PURE CORE -> UI)
// =============================================================================
function rollRandomBattleTrait() {
  _getVoxAudio()?.playDiceClatter?.();
  const poolKey = _getForgeEl('forgeSourcePool')?.value || 'Armageddon';
  const uType = _getForgeEl('traitUnitType')?.value || 'Infantry';
  const pick = _forgeCore.rollBattleTraitPick(poolKey, uType, _resolveForgeCatalogs());
  lastRolledItem.trait = { category: pick.category, roll: pick.roll, name: pick.name, desc: pick.desc };

  _scheduleForgeReveal(() => {
    _getVoxAudio()?.playForgeAnvil?.();
    const box = _getForgeEl('traitResultBox');
    if (box) {
      box.innerHTML = `
        <div><span class="dice-pip-badge">D6: ${pick.d6}</span> <strong style="color:var(--gold);">${pick.name}</strong></div>
        <div style="margin-top:6px; font-size:0.83rem; color:var(--text);">${pick.desc}</div>
      `;
    }
  }, 260);
}

function rollRandomWeaponMod() {
  _getVoxAudio()?.playDiceClatter?.();
  const result = _forgeCore.rollWeaponModPair(_resolveForgeCatalogs().weaponMods);
  lastRolledItem.weapon = { category: result.category, roll: result.roll, name: result.name, desc: result.desc };

  _scheduleForgeReveal(() => {
    _getVoxAudio()?.playForgeAnvil?.();
    const box = _getForgeEl('weaponResultBox');
    if (box) {
      const m1 = result.pick1;
      const m2 = result.pick2;
      box.innerHTML = `
        <div><span class="dice-pip-badge">D6: ${m1.d6} &amp; ${m2.d6}</span> <strong style="color:var(--blue);">${result.name}</strong></div>
        <div style="margin-top:6px; font-size:0.81rem; color:var(--text);">• <strong>${m1.name}:</strong> ${m1.desc}<br>• <strong>${m2.name}:</strong> ${m2.desc}</div>
      `;
    }
  }, 260);
}

function rollRandomRelic() {
  _getVoxAudio()?.playDiceClatter?.();
  const poolKey = _getForgeEl('forgeSourcePool')?.value || 'Armageddon';
  const tier = _getForgeEl('relicTierSelect')?.value || 'Artificer';
  const pick = _forgeCore.rollCrusadeRelicPick(poolKey, tier, _resolveForgeCatalogs());
  lastRolledItem.relic = { category: pick.category, roll: pick.roll, name: pick.name, desc: pick.desc };

  _scheduleForgeReveal(() => {
    _getVoxAudio()?.playRelicChoir?.();
    const box = _getForgeEl('relicResultBox');
    if (box) {
      box.innerHTML = `
        <div><span class="dice-pip-badge" style="background:var(--purple); color:#fff;">${tier.toUpperCase()}</span> <strong style="color:#d8b4fe;">${pick.name}</strong></div>
        <div style="margin-top:6px; font-size:0.83rem; color:var(--text);">${pick.desc}</div>
      `;
    }
  }, 260);
}

function rollOutOfActionTest() {
  _getVoxAudio()?.playDiceClatter?.();
  const outcome = _forgeCore.evaluateOutOfActionRoll();

  _scheduleForgeReveal(() => {
    const box = _getForgeEl('scarResultBox');
    if (!box) return;
    if (!outcome.survived) {
      _getVoxAudio()?.playScarHazard?.();
      box.innerHTML = `
        <div><span class="dice-pip-badge" style="background:var(--red); color:#fff;">D6: 1 (FAILED!)</span> <strong style="color:var(--red);">Out of Action Test Failed!</strong></div>
        <div style="margin-top:6px; font-size:0.83rem; color:var(--text);">Choose <strong>Devastating Blow</strong> (-1 Battle Honour) OR click <strong>🎲 Roll Scar (D6)</strong> below to roll a Battle Scar!</div>
      `;
    } else {
      _getVoxAudio()?.playForgeAnvil?.();
      box.innerHTML = `
        <div><span class="dice-pip-badge" style="background:var(--green); color:#000;">D6: ${outcome.roll} (PASSED)</span> <strong style="color:var(--green);">Unit Recovered Unscathed!</strong></div>
        <div style="margin-top:6px; font-size:0.83rem; color:var(--text);">No Battle Scar suffered. Unit returns to Order of Battle at full strength.</div>
      `;
    }
  }, 260);
}

function rollRandomBattleScar() {
  if (typeof window !== 'undefined' && window.VoxAudio?.playDiceClatter) window.VoxAudio.playDiceClatter();
  const poolKey = (typeof document !== 'undefined' ? document.getElementById('forgeSourcePool')?.value : '') || 'Armageddon';
  const scars = (typeof BATTLE_SCAR_TABLE !== 'undefined') ? BATTLE_SCAR_TABLE : (typeof window !== 'undefined' ? window.BATTLE_SCAR_TABLE : []);
  const necScars = (typeof NECRON_BATTLE_SCAR_TABLE !== 'undefined') ? NECRON_BATTLE_SCAR_TABLE : (typeof window !== 'undefined' ? window.NECRON_BATTLE_SCAR_TABLE : []);
  const activeScarTable = poolKey === 'BetaCodex' ? necScars : scars;
  const pick = activeScarTable[Math.floor(Math.random() * activeScarTable.length)] || { d6: 1, name: 'Scar', desc: 'No scar' };

  lastRolledItem.scar = {
    category: `Battle Scar`,
    roll: `D6 = ${pick.d6}`,
    name: pick.name,
    desc: pick.desc
  };

  setTimeout(() => {
    if (typeof window !== 'undefined' && window.VoxAudio?.playScarHazard) window.VoxAudio.playScarHazard();
    const box = typeof document !== 'undefined' ? document.getElementById('scarResultBox') : null;
    if (box) {
      box.innerHTML = `
        <div><span class="dice-pip-badge" style="background:var(--red); color:#fff;">SCAR D6: ${pick.d6}</span> <strong style="color:var(--red);">${pick.name}</strong></div>
        <div style="margin-top:6px; font-size:0.83rem; color:var(--text);">${pick.desc}</div>
      `;
    }
  }, 260);
}

function attachRollToDossier(kind) {
  const item = lastRolledItem[kind];
  if (!item) {
    alert('Roll the dice on this card first before attaching it to the Master Dossier!');
    return;
  }
  const unitName = ((typeof document !== 'undefined' ? document.getElementById('rollerUnitName')?.value : '') || '[Unnamed Unit]').trim();
  const unitCtx = ((typeof document !== 'undefined' ? document.getElementById('rollerUnitContext')?.value : '') || 'Fielded in battle').trim();

  crusadeState.queuedRolls.push({
    unit: unitName,
    context: unitCtx,
    category: item.category,
    roll: item.roll,
    name: item.name,
    desc: item.desc
  });

  if (typeof window !== 'undefined' && window.VoxAudio) window.VoxAudio.playClank('card');
  renderQueuedRolls();
  if (typeof updateMasterDossierPreview === 'function') updateMasterDossierPreview();
  if (typeof saveCrusadeState === 'function') saveCrusadeState();
}

function removeQueuedRoll(idx) {
  crusadeState.queuedRolls.splice(idx, 1);
  renderQueuedRolls();
  if (typeof updateMasterDossierPreview === 'function') updateMasterDossierPreview();
  if (typeof saveCrusadeState === 'function') saveCrusadeState();
}

function clearQueuedRolls() {
  crusadeState.queuedRolls = [];
  renderQueuedRolls();
  if (typeof updateMasterDossierPreview === 'function') updateMasterDossierPreview();
  if (typeof saveCrusadeState === 'function') saveCrusadeState();
}

function renderQueuedRolls() {
  if (typeof document === 'undefined') return;
  const countEl = document.getElementById('queuedCountLabel');
  const box = document.getElementById('queuedRollsContainer');
  if (countEl) countEl.textContent = String(crusadeState.queuedRolls.length);
  if (!box) return;

  if (crusadeState.queuedRolls.length === 0) {
    box.innerHTML = `<div style="font-size:0.82rem; color:var(--muted); font-style:italic;">No unit upgrades, relics, commendations, or scars attached yet. Roll on any table above (or Tab 3 Commendations / Tab 4 Dynastic Vault) and click "➕ Attach" to include them in your Master Battle Dossier!</div>`;
    return;
  }

  box.innerHTML = crusadeState.queuedRolls.map((q, idx) => `
    <div class="queued-item-pill">
      <div>
        <strong style="color:var(--gold);">${q.unit}</strong> — <span style="color:#fff; font-weight:700;">${q.category}: ${q.name}</span> (${q.roll})<br>
        <span style="color:var(--muted); font-size:0.78rem;">Context: "${q.context}"</span>
      </div>
      <button type="button" class="mini-btn" onclick="removeQueuedRoll(${idx})" title="Remove">✕</button>
    </div>
  `).join('');
}

// =========================================================================
// ASTRA MILITARUM TOUR OF DUTY, LOGISTICS & COMMENDATIONS FUNCTIONS
// =========================================================================
function adjTourField(field, delta) {
  crusadeState[field] = Math.max(0, (crusadeState[field] || 0) + delta);
  const el = typeof document !== 'undefined' ? document.getElementById(field) : null;
  if (el) el.textContent = String(crusadeState[field]);
  if (typeof updateMasterDossierPreview === 'function') updateMasterDossierPreview();
  updateStartOfTourPreview();
  if (typeof saveCrusadeState === 'function') saveCrusadeState();
}

function rollNewTourQuotas() {
  if (typeof window !== 'undefined' && window.VoxAudio?.playDiceClatter) window.VoxAudio.playDiceClatter();
  const d6 = Math.floor(Math.random() * 6) + 1;
  const d3 = Math.floor(Math.random() * 3) + 1;
  crusadeState.tourBattlesRem = d6 + 4;
  crusadeState.tourWinsRem = d3 + 2;

  setTimeout(() => {
    if (typeof window !== 'undefined' && window.VoxAudio?.playForgeAnvil) window.VoxAudio.playForgeAnvil();
    const bEl = typeof document !== 'undefined' ? document.getElementById('tourBattlesRem') : null;
    const wEl = typeof document !== 'undefined' ? document.getElementById('tourWinsRem') : null;
    if (bEl) bEl.textContent = String(crusadeState.tourBattlesRem);
    if (wEl) wEl.textContent = String(crusadeState.tourWinsRem);
    if (typeof updateMasterDossierPreview === 'function') updateMasterDossierPreview();
    updateStartOfTourPreview();
    if (typeof saveCrusadeState === 'function') saveCrusadeState();
  }, 240);
}

function rollVictoryCommendationPts() {
  if (typeof window !== 'undefined' && window.VoxAudio?.playDiceClatter) window.VoxAudio.playDiceClatter();
  const d3 = Math.floor(Math.random() * 3) + 1;
  crusadeState.commendationPts = (crusadeState.commendationPts || 0) + d3;

  setTimeout(() => {
    if (typeof window !== 'undefined' && window.VoxAudio?.playRelicChoir) window.VoxAudio.playRelicChoir();
    const cEl = typeof document !== 'undefined' ? document.getElementById('commendationPts') : null;
    const noticeEl = typeof document !== 'undefined' ? document.getElementById('commRollNotice') : null;
    if (cEl) cEl.textContent = String(crusadeState.commendationPts);
    if (noticeEl) noticeEl.innerHTML = `<strong style="color:var(--green);">Rolled D3 = +${d3} Commendation Pts!</strong>`;
    if (typeof updateMasterDossierPreview === 'function') updateMasterDossierPreview();
    updateStartOfTourPreview();
    if (typeof saveCrusadeState === 'function') saveCrusadeState();
  }, 240);
}

function toggleUpliftingPrimer() {
  const cb = typeof document !== 'undefined' ? document.getElementById('upliftingPrimerToggle') : null;
  crusadeState.upliftingPrimer = !!(cb && cb.checked);
  renderLogisticsAllocator();
  if (typeof updateMasterDossierPreview === 'function') updateMasterDossierPreview();
  updateStartOfTourPreview();
  if (typeof saveCrusadeState === 'function') saveCrusadeState();
}

function adjLogisticsPt(catKey, delta) {
  if (!crusadeState.logistics) {
    crusadeState.logistics = { lexmechanicus: 1, materiel: 2, tithePool: 0, morale: 1 };
  }
  const maxTotal = crusadeState.upliftingPrimer ? 5 : 4;
  const currentTotal = Object.values(crusadeState.logistics).reduce((a, b) => a + b, 0);
  const currVal = crusadeState.logistics[catKey] || 0;
  const nextVal = currVal + delta;

  if (nextVal < 0 || nextVal > 2) return;
  if (delta > 0 && currentTotal >= maxTotal) return;

  crusadeState.logistics[catKey] = nextVal;
  if (typeof window !== 'undefined' && window.VoxAudio) window.VoxAudio.playClank('card');
  renderLogisticsAllocator();
  if (typeof updateMasterDossierPreview === 'function') updateMasterDossierPreview();
  updateStartOfTourPreview();
  if (typeof saveCrusadeState === 'function') saveCrusadeState();
}

function renderLogisticsAllocator() {
  if (typeof document === 'undefined') return;
  const grid = document.getElementById('logisticsAllocatorGrid');
  const label = document.getElementById('logisticsAllocatedLabel');
  const cb = document.getElementById('upliftingPrimerToggle');
  if (!grid) return;

  if (!crusadeState.logistics) {
    crusadeState.logistics = { lexmechanicus: 1, materiel: 2, tithePool: 0, morale: 1 };
  }
  if (cb) cb.checked = !!crusadeState.upliftingPrimer;

  const maxTotal = crusadeState.upliftingPrimer ? 5 : 4;
  const currentTotal = Object.values(crusadeState.logistics).reduce((a, b) => a + b, 0);
  if (label) label.textContent = `${currentTotal} / ${maxTotal}`;

  const categories = (typeof LOGISTICS_CATEGORIES !== 'undefined') ? LOGISTICS_CATEGORIES : (typeof window !== 'undefined' ? window.LOGISTICS_CATEGORIES : []);
  grid.innerHTML = categories.map(cat => {
    const pts = crusadeState.logistics[cat.key] || 0;
    const stateClass = pts === 2 ? 'state-surplus' : (pts === 0 ? 'state-deficiency' : '');
    const badgeHtml = pts === 2
      ? `<span class="rule-tag" style="border-color:var(--green); color:var(--green);">🟢 SURPLUS (2 PTS)</span>`
      : (pts === 1
        ? `<span class="rule-tag" style="border-color:var(--muted); color:var(--muted);">⚪ STANDARD (1 PT)</span>`
        : `<span class="rule-tag" style="border-color:var(--red); color:var(--red);">🔴 DEFICIENCY (0 PTS)</span>`);

    const ruleText = pts === 2
      ? `<span style="color:var(--green);">${cat.surplus}</span>`
      : (pts === 1
        ? `<span style="color:var(--muted);">Standard Munitorum allocation — no Surplus bonus or Deficiency penalty applies.</span>`
        : `<span style="color:var(--red);">${cat.deficiency}</span>`);

    return `
      <div class="logistics-card ${stateClass}">
        <div style="display:flex; flex-direction:column; align-items:center; text-align:center; gap:6px; margin-bottom:8px;">
          <strong style="color:#fff; font-size:0.9rem;">${cat.title}</strong>
          ${badgeHtml}
        </div>
        <div class="hud-val-row" style="margin-bottom:8px;">
          <button type="button" class="mini-btn" onclick="adjLogisticsPt('${cat.key}', -1)">−</button>
          <span class="hud-num" style="color:var(--gold); font-size:1.2rem;">${pts} PT${pts === 1 ? '' : 'S'}</span>
          <button type="button" class="mini-btn" onclick="adjLogisticsPt('${cat.key}', 1)">+</button>
        </div>
        <div style="font-size:0.8rem; line-height:1.45;">${ruleText}</div>
      </div>
    `;
  }).join('');
}

function populateCommendationVault() {
  const sel = document.getElementById('commendationSelect');
  if (!sel) return;
  const vault = (typeof ASTRA_COMMENDATIONS_VAULT !== 'undefined') ? ASTRA_COMMENDATIONS_VAULT : (typeof window !== 'undefined' ? window.ASTRA_COMMENDATIONS_VAULT : []);
  sel.innerHTML = vault.map(c =>
    `<option value="${c.id}">${c.name} — [${c.type}]</option>`
  ).join('');
  renderSelectedCommendationPreview();
}

function renderSelectedCommendationPreview() {
  const sel = document.getElementById('commendationSelect');
  const box = document.getElementById('commendationPreviewBox');
  if (!sel || !box) return;
  const vault = (typeof ASTRA_COMMENDATIONS_VAULT !== 'undefined') ? ASTRA_COMMENDATIONS_VAULT : (typeof window !== 'undefined' ? window.ASTRA_COMMENDATIONS_VAULT : []);
  const pick = vault.find(c => c.id === sel.value) || vault[0];
  if (!pick) return;
  box.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:6px;">
      <strong style="color:#fff; font-size:0.94rem;">${pick.name}</strong>
      <span class="dice-pip-badge" style="background:var(--gold); color:#000; margin-right:0; font-size:0.76rem;">${pick.type}</span>
    </div>
    <div style="font-size:0.84rem; color:var(--text);">${pick.desc}</div>
  `;
}

function attachCommendationToDossier() {
  const sel = document.getElementById('commendationSelect');
  if (!sel) return;
  const vault = (typeof ASTRA_COMMENDATIONS_VAULT !== 'undefined') ? ASTRA_COMMENDATIONS_VAULT : (typeof window !== 'undefined' ? window.ASTRA_COMMENDATIONS_VAULT : []);
  const pick = vault.find(c => c.id === sel.value) || vault[0];
  const unitName = (document.getElementById('commRecipientUnit')?.value || '044th Krieg Regiment').trim();

  crusadeState.queuedRolls.push({
    unit: unitName,
    context: `Awarded upon Tour of Duty completion (${pick.type})`,
    category: pick.type,
    roll: `Munitorum Commendation`,
    name: pick.name,
    desc: pick.desc
  });

  if (typeof window !== 'undefined' && window.VoxAudio) window.VoxAudio.playRelicChoir();
  renderQueuedRolls();
  if (typeof updateMasterDossierPreview === 'function') updateMasterDossierPreview();
  if (typeof saveCrusadeState === 'function') saveCrusadeState();
  switchCrusadeTab('forge');
}

function buildLogisticsSummaryLine() {
  const log = crusadeState.logistics || { lexmechanicus: 1, materiel: 2, tithePool: 0, morale: 1 };
  const categories = (typeof LOGISTICS_CATEGORIES !== 'undefined') ? LOGISTICS_CATEGORIES : (typeof window !== 'undefined' ? window.LOGISTICS_CATEGORIES : []);
  const surplus = [];
  const def = [];
  categories.forEach(c => {
    const v = log[c.key] || 0;
    const shortName = c.title.split(' ')[1];
    if (v === 2) surplus.push(shortName);
    if (v === 0) def.push(shortName);
  });
  const surStr = surplus.length ? surplus.join(', ') : 'None';
  const defStr = def.length ? def.join(', ') : 'None';
  return `Battles Rem: ${crusadeState.tourBattlesRem || 0} | Wins Rem: ${crusadeState.tourWinsRem || 0} | Commendation Pts: ${crusadeState.commendationPts || 0} | Surplus: [${surStr}] | Deficiency: [${defStr}]`;
}

/**
 * Pure functional core: compiles the unique Start of Tour of Duty Dispatch string
 * (Departmento Munitorum Regulation 884-Alpha).
 *
 * @param {object} [input={}] - Plain Tour of Duty state snapshot.
 * @returns {string} Formatted Start of Tour of Duty dispatch payload.
 */
function compileTourDispatch(input = {}) {
  const battles = (typeof input.tourBattlesRem === 'number') ? input.tourBattlesRem : (crusadeState.tourBattlesRem || 0);
  const wins = (typeof input.tourWinsRem === 'number') ? input.tourWinsRem : (crusadeState.tourWinsRem || 0);
  const commPts = (typeof input.commendationPts === 'number') ? input.commendationPts : (crusadeState.commendationPts || 0);
  const log = input.logistics || (crusadeState.logistics || { lexmechanicus: 1, materiel: 1, tithePool: 1, morale: 1 });
  const lex = log.lexmechanicus || 0;
  const mat = log.materiel || 0;
  const tithe = log.tithePool || 0;
  const mor = log.morale || 0;
  const primer = (typeof input.upliftingPrimer === 'boolean') ? input.upliftingPrimer : !!crusadeState.upliftingPrimer;
  const maxPts = primer ? 5 : 4;
  const notes = (input.notes || (typeof document !== 'undefined' && document.getElementById('startTourNotes')?.value) || '').trim();

  const lines = [
    `+++ DEPARTMENTO MUNITORUM // TOUR OF DUTY & LOGISTICS ALLOCATION DISPATCH +++`,
    `• REPORTING COMMANDER: THE EXILE // THE SANCTUARY OF ASH (044TH KRIEG)`,
    `• OPERATIONAL QUOTAS: ${battles} Battles Required // ${wins} Victories Required`,
    `• MUNITORUM LOGISTICS ALLOCATION (${maxPts} PTS): Lexmechanicus: ${lex} | Materiel: ${mat} | Tithe Pool: ${tithe} | Morale: ${mor}`,
    `• ACTIVE COMMENDATION TALLY: ${commPts} CmP`
  ];

  if (notes) {
    lines.push(`• REGIMENTAL DEPLOYMENT DIRECTIVE: "${notes}"`);
  }

  lines.push(
    `------------------------------------------------`,
    `REQUEST FOR LOGIS-PREFECT VANE: Please register this Tour of Duty operational quota and Munitorum Regulation 884-Alpha logistics distribution in the orbital ledger!`
  );

  return lines.join('\n');
}

function buildStartOfTourDossierString() {
  return compileTourDispatch({
    tourBattlesRem: crusadeState.tourBattlesRem,
    tourWinsRem: crusadeState.tourWinsRem,
    commendationPts: crusadeState.commendationPts,
    logistics: crusadeState.logistics,
    upliftingPrimer: crusadeState.upliftingPrimer,
    notes: (typeof document !== 'undefined' ? document.getElementById('startTourNotes')?.value : '') || ''
  });
}

function updateStartOfTourPreview() {
  if (typeof document === 'undefined') return;
  const box = document.getElementById('startOfTourPreviewBox') || document.getElementById('tourDispatchPreviewBox');
  if (box) {
    box.textContent = buildStartOfTourDossierString();
    if (box.classList && typeof box.classList.toggle === 'function') {
      box.classList.toggle('vox-preview-alpha', true);
      box.classList.toggle('vox-preview-beta', false);
    }
  }
}

function transmitStartOfTourDossier() {
  const payload = buildStartOfTourDossierString();
  if (typeof window !== 'undefined' && window.VoxAudio && typeof window.VoxAudio.transmitToVox === 'function') {
    window.VoxAudio.transmitToVox('alpha', payload);
  }
}

// Attach to window for browser global scope
if (typeof window !== 'undefined') {
  window.crusadeState = crusadeState;
  window.lastRolledItem = lastRolledItem;
  window.switchCrusadeTab = switchCrusadeTab;
  window.adjScore = adjScore;
  window.selectAllianceTree = selectAllianceTree;
  window.rollRandomBattleTrait = rollRandomBattleTrait;
  window.rollRandomWeaponMod = rollRandomWeaponMod;
  window.rollRandomRelic = rollRandomRelic;
  window.rollOutOfActionTest = rollOutOfActionTest;
  window.rollRandomBattleScar = rollRandomBattleScar;
  window.attachRollToDossier = attachRollToDossier;
  window.removeQueuedRoll = removeQueuedRoll;
  window.clearQueuedRolls = clearQueuedRolls;
  window.renderQueuedRolls = renderQueuedRolls;
  window.adjTourField = adjTourField;
  window.rollNewTourQuotas = rollNewTourQuotas;
  window.rollVictoryCommendationPts = rollVictoryCommendationPts;
  window.toggleUpliftingPrimer = toggleUpliftingPrimer;
  window.adjLogisticsPt = adjLogisticsPt;
  window.renderLogisticsAllocator = renderLogisticsAllocator;
  window.populateCommendationVault = populateCommendationVault;
  window.renderSelectedCommendationPreview = renderSelectedCommendationPreview;
  window.attachCommendationToDossier = attachCommendationToDossier;
  window.buildLogisticsSummaryLine = buildLogisticsSummaryLine;
  window.compileTourDispatch = compileTourDispatch;
  window.buildStartOfTourDossierString = buildStartOfTourDossierString;
  window.updateStartOfTourPreview = updateStartOfTourPreview;
  window.transmitStartOfTourDossier = transmitStartOfTourDossier;
}

// CommonJS export for Node test runners
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    crusadeState,
    lastRolledItem,
    switchCrusadeTab,
    adjScore,
    selectAllianceTree,
    rollRandomBattleTrait,
    rollRandomWeaponMod,
    rollRandomRelic,
    rollOutOfActionTest,
    rollRandomBattleScar,
    attachRollToDossier,
    removeQueuedRoll,
    clearQueuedRolls,
    renderQueuedRolls,
    adjTourField,
    rollNewTourQuotas,
    rollVictoryCommendationPts,
    toggleUpliftingPrimer,
    adjLogisticsPt,
    renderLogisticsAllocator,
    populateCommendationVault,
    renderSelectedCommendationPreview,
    attachCommendationToDossier,
    buildLogisticsSummaryLine,
    compileTourDispatch,
    buildStartOfTourDossierString,
    updateStartOfTourPreview,
    transmitStartOfTourDossier
  };
}
