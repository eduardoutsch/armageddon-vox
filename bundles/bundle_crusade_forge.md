# 📦 Fires of Armageddon // Bundle: Mode 5 - Munitorum Forge Shell & Crusade Core Unit Tests

Humble View UI adapters for Scoreboard, Quartermaster Forge rollers, and Astra Militarum Tour of Duty (`js/crusade-forge.js`) plus pure Crusade Core unit tests (`tests/js/crusade-core.test.js`).

## 📑 Table of Contents
- [js/crusade-forge.js](#file-jscrusadeforgejs)
- [tests/js/crusade-core.test.js](#file-testsjscrusadecoretestjs)

---

## File: `js/crusade-forge.js` <a id="file-jscrusadeforgejs"></a>

````javascript
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
  _getVoxAudio()?.playDiceClatter?.();
  const poolKey = _getForgeEl('forgeSourcePool')?.value || 'Armageddon';
  const pick = _forgeCore.rollBattleScarPick(poolKey, _resolveForgeCatalogs());
  lastRolledItem.scar = { category: pick.category, roll: pick.roll, name: pick.name, desc: pick.desc };

  _scheduleForgeReveal(() => {
    _getVoxAudio()?.playScarHazard?.();
    const box = _getForgeEl('scarResultBox');
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
    if (typeof alert === 'function') alert('Roll the dice on this card first before attaching it to the Master Dossier!');
    return;
  }
  const entry = _forgeCore.createQueuedUpgradeEntry(
    item,
    _getForgeEl('rollerUnitName')?.value,
    _getForgeEl('rollerUnitContext')?.value
  );
  crusadeState.queuedRolls.push(entry);
  _getVoxAudio()?.playClank?.('card');
  renderQueuedRolls();
  _syncPostForgeChange();
}

function removeQueuedRoll(idx) {
  crusadeState.queuedRolls.splice(idx, 1);
  renderQueuedRolls();
  _syncPostForgeChange();
}

function clearQueuedRolls() {
  crusadeState.queuedRolls = [];
  renderQueuedRolls();
  _syncPostForgeChange();
}

function renderQueuedRolls() {
  if (typeof document === 'undefined') return;
  const countEl = _getForgeEl('queuedCountLabel');
  const box = _getForgeEl('queuedRollsContainer');
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

// =============================================================================
// TAB 3: ASTRA MILITARUM TOUR OF DUTY, LOGISTICS & COMMENDATIONS VIEW ADAPTERS
// =============================================================================
function adjTourField(field, delta) {
  crusadeState[field] = _forgeCore.clampCounter(crusadeState[field], delta);
  const el = _getForgeEl(field);
  if (el) el.textContent = String(crusadeState[field]);
  updateStartOfTourPreview();
  _syncPostForgeChange();
}

function rollNewTourQuotas() {
  _getVoxAudio()?.playDiceClatter?.();
  const rolled = _forgeCore.rollTourQuotaValues();
  crusadeState.tourBattlesRem = rolled.tourBattlesRem;
  crusadeState.tourWinsRem = rolled.tourWinsRem;

  _scheduleForgeReveal(() => {
    _getVoxAudio()?.playForgeAnvil?.();
    const bEl = _getForgeEl('tourBattlesRem');
    const wEl = _getForgeEl('tourWinsRem');
    if (bEl) bEl.textContent = String(crusadeState.tourBattlesRem);
    if (wEl) wEl.textContent = String(crusadeState.tourWinsRem);
    updateStartOfTourPreview();
    _syncPostForgeChange();
  }, 240);
}

function rollVictoryCommendationPts() {
  _getVoxAudio()?.playDiceClatter?.();
  const rolled = _forgeCore.rollCommendationPointsGain(crusadeState.commendationPts);
  crusadeState.commendationPts = rolled.commendationPts;

  _scheduleForgeReveal(() => {
    _getVoxAudio()?.playRelicChoir?.();
    const cEl = _getForgeEl('commendationPts');
    const noticeEl = _getForgeEl('commRollNotice');
    if (cEl) cEl.textContent = String(crusadeState.commendationPts);
    if (noticeEl) noticeEl.innerHTML = `<strong style="color:var(--green);">Rolled D3 = +${rolled.gain} Commendation Pts!</strong>`;
    updateStartOfTourPreview();
    _syncPostForgeChange();
  }, 240);
}

function toggleUpliftingPrimer() {
  const cb = _getForgeEl('upliftingPrimerToggle');
  crusadeState.upliftingPrimer = !!(cb && cb.checked);
  renderLogisticsAllocator();
  updateStartOfTourPreview();
  _syncPostForgeChange();
}

function adjLogisticsPt(catKey, delta) {
  const res = _forgeCore.allocateLogisticsPoint(crusadeState.logistics, crusadeState.upliftingPrimer, catKey, delta);
  if (!res.changed) return;
  crusadeState.logistics = res.logistics;
  _getVoxAudio()?.playClank?.('card');
  renderLogisticsAllocator();
  updateStartOfTourPreview();
  _syncPostForgeChange();
}

function renderLogisticsAllocator() {
  if (typeof document === 'undefined') return;
  const grid = _getForgeEl('logisticsAllocatorGrid');
  const label = _getForgeEl('logisticsAllocatedLabel');
  const cb = _getForgeEl('upliftingPrimerToggle');
  if (!grid) return;

  const vm = _forgeCore.deriveLogisticsViewModel(
    crusadeState.logistics,
    crusadeState.upliftingPrimer,
    _resolveForgeCatalogs().logisticsCategories
  );
  if (!crusadeState.logistics) {
    crusadeState.logistics = { lexmechanicus: 1, materiel: 2, tithePool: 0, morale: 1 };
  }
  if (cb) cb.checked = !!crusadeState.upliftingPrimer;
  if (label) label.textContent = vm.allocatedLabel;

  grid.innerHTML = vm.cards.map((card) => `
    <div class="logistics-card ${card.stateClass}">
      <div style="display:flex; flex-direction:column; align-items:center; text-align:center; gap:6px; margin-bottom:8px;">
        <strong style="color:#fff; font-size:0.9rem;">${card.title}</strong>
        <span class="rule-tag" style="border-color:${card.badgeColor}; color:${card.badgeColor};">${card.statusBadge}</span>
      </div>
      <div class="hud-val-row" style="margin-bottom:8px;">
        <button type="button" class="mini-btn" onclick="adjLogisticsPt('${card.key}', -1)">−</button>
        <span class="hud-num" style="color:var(--gold); font-size:1.2rem;">${card.ptsLabel}</span>
        <button type="button" class="mini-btn" onclick="adjLogisticsPt('${card.key}', 1)">+</button>
      </div>
      <div style="font-size:0.8rem; line-height:1.45;"><span style="color:${card.ruleColor};">${card.ruleText}</span></div>
    </div>
  `).join('');
}

function populateCommendationVault() {
  const sel = _getForgeEl('commendationSelect');
  if (!sel) return;
  const vault = _resolveForgeCatalogs().commendationsVault;
  sel.innerHTML = vault.map((c) => `<option value="${c.id}">${c.name} — [${c.type}]</option>`).join('');
  renderSelectedCommendationPreview();
}

function renderSelectedCommendationPreview() {
  const sel = _getForgeEl('commendationSelect');
  const box = _getForgeEl('commendationPreviewBox');
  if (!sel || !box) return;
  const vault = _resolveForgeCatalogs().commendationsVault;
  const pick = vault.find((c) => c.id === sel.value) || vault[0];
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
  const sel = _getForgeEl('commendationSelect');
  if (!sel) return;
  const vault = _resolveForgeCatalogs().commendationsVault;
  const pick = vault.find((c) => c.id === sel.value) || vault[0];
  if (!pick) return;
  const unitName = (_getForgeEl('commRecipientUnit')?.value || '044th Krieg Regiment').trim();

  crusadeState.queuedRolls.push({
    unit: unitName,
    context: `Awarded upon Tour of Duty completion (${pick.type})`,
    category: pick.type,
    roll: 'Munitorum Commendation',
    name: pick.name,
    desc: pick.desc
  });

  _getVoxAudio()?.playRelicChoir?.();
  renderQueuedRolls();
  _syncPostForgeChange();
  switchCrusadeTab('forge');
}

function buildLogisticsSummaryLine() {
  return _forgeCore.formatLogisticsSummaryLine(crusadeState, _resolveForgeCatalogs().logisticsCategories);
}

/**
 * Boundary adapter delegating Tour of Duty dispatch compilation to `CrusadeCore.compileTourDispatch`.
 */
function compileTourDispatch(input = {}) {
  const hasExplicitNotes = Object.prototype.hasOwnProperty.call(input, 'notes');
  return _forgeCore.compileTourDispatch({
    tourBattlesRem: typeof input.tourBattlesRem === 'number' ? input.tourBattlesRem : (crusadeState.tourBattlesRem || 0),
    tourWinsRem: typeof input.tourWinsRem === 'number' ? input.tourWinsRem : (crusadeState.tourWinsRem || 0),
    commendationPts: typeof input.commendationPts === 'number' ? input.commendationPts : (crusadeState.commendationPts || 0),
    logistics: input.logistics || crusadeState.logistics,
    upliftingPrimer: typeof input.upliftingPrimer === 'boolean' ? input.upliftingPrimer : !!crusadeState.upliftingPrimer,
    notes: hasExplicitNotes ? input.notes : (_getForgeEl('startTourNotes')?.value || '')
  });
}

function buildStartOfTourDossierString() {
  return compileTourDispatch({
    tourBattlesRem: crusadeState.tourBattlesRem,
    tourWinsRem: crusadeState.tourWinsRem,
    commendationPts: crusadeState.commendationPts,
    logistics: crusadeState.logistics,
    upliftingPrimer: crusadeState.upliftingPrimer,
    notes: _getForgeEl('startTourNotes')?.value || ''
  });
}

function updateStartOfTourPreview() {
  if (typeof document === 'undefined') return;
  const box = _getForgeEl('startOfTourPreviewBox') || _getForgeEl('tourDispatchPreviewBox');
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
  _getVoxAudio()?.transmitToVox?.('alpha', payload);
}

const crusadeForgeExports = {
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

if (typeof window !== 'undefined') {
  Object.assign(window, crusadeForgeExports);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = crusadeForgeExports;
}
````

---

## File: `tests/js/crusade-core.test.js` <a id="file-testsjscrusadecoretestjs"></a>

````javascript
/**
 * @fileoverview Unit tests for js/crusade-core.js pure Functional Core, ViewModel selectors,
 * declarative lookup tables, RNG-injectable upgrade/resource rollers, and DOM-free dossier compilers.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '../../');
const crusadeData = require(path.join(ROOT_DIR, 'js/crusade-data.js'));
const hordeStats = require(path.join(ROOT_DIR, 'js/horde-battle-stats.js'));
const core = require(path.join(ROOT_DIR, 'js/crusade-core.js'));

function makeSeqRng(floats) {
  let idx = 0;
  return () => {
    const val = floats[idx % floats.length];
    idx += 1;
    return val;
  };
}

test('Humble View Purity Guard: js/crusade-core.js has zero DOM, storage, timer, audio, or network calls', () => {
  const src = fs.readFileSync(path.join(ROOT_DIR, 'js/crusade-core.js'), 'utf8');
  for (const forbidden of ['document.', 'localStorage', 'sessionStorage', 'VoxAudio', 'setTimeout(', 'fetch(']) {
    assert.equal(src.includes(forbidden), false, `js/crusade-core.js must remain pure and free of ${forbidden}`);
  }
});

test('State Initialization & Hydration: createInitialCrusadeState and hydrateCrusadeState merge nested sub-states cleanly', () => {
  const initial = core.createInitialCrusadeState();
  assert.equal(initial.hordeSP, 1);
  assert.equal(initial.activeTab, 'board');
  assert.deepEqual(initial.logistics, { lexmechanicus: 1, materiel: 2, tithePool: 0, morale: 1 });
  assert.deepEqual(initial.tombSystems, { command: 1, reanimation: 1, translocation: 0 });
  assert.equal(initial.votann.goalProgress, 0);

  const hydrated = core.hydrateCrusadeState(initial, {
    activeTab: 'votann',
    alphaSP: 9,
    logistics: { lexmechanicus: 2, materiel: 2, tithePool: 0, morale: 0 },
    tombSystems: { command: 3 },
    votann: { rawMinerals: 50, rare: { energySources: 2 }, assets: { outpost1: 'Upgraded' } }
  });

  assert.equal(hydrated.activeTab, 'votann');
  assert.equal(hydrated.alphaSP, 9);
  assert.equal(hydrated.hordeSP, 1);
  assert.equal(hydrated.logistics.lexmechanicus, 2);
  assert.equal(hydrated.tombSystems.command, 3);
  assert.equal(hydrated.tombSystems.reanimation, 1);
  assert.equal(hydrated.votann.rawMinerals, 50);
  assert.equal(hydrated.votann.rare.energySources, 2);
  assert.equal(hydrated.votann.rare.rawMinerals, 0);
  assert.equal(hydrated.votann.assets.outpost1, 'Upgraded');
});

test('Declarative Lookup Tables: CRUSADE_TAB_DESCRIPTORS and DOSSIER_CHANNEL_PROFILES cover all tabs and conduits', () => {
  assert.deepEqual(Object.keys(core.CRUSADE_TAB_DESCRIPTORS), ['board', 'forge', 'tour', 'tomb', 'votann']);
  assert.equal(core.CRUSADE_TAB_DESCRIPTORS.tour.bodyThemeClass, 'theme-militarum');
  assert.equal(core.CRUSADE_TAB_DESCRIPTORS.tomb.bodyThemeClass, 'theme-necron');
  assert.equal(core.CRUSADE_TAB_DESCRIPTORS.votann.bodyThemeClass, 'theme-votann');

  for (const ch of ['alpha', 'beta', 'gamma', 'augur_alpha', 'augur_beta']) {
    assert.ok(core.DOSSIER_CHANNEL_PROFILES[ch], `Missing DOSSIER_CHANNEL_PROFILES entry for ${ch}`);
  }
  assert.equal(core.DOSSIER_CHANNEL_PROFILES.augur_alpha.targetVoxChannel, 'alpha');
  assert.equal(core.DOSSIER_CHANNEL_PROFILES.augur_beta.targetVoxChannel, 'beta');
});

test('Pure Forge Rollers: deterministic traits, distinct 2xD6 weapon mods, relics, OOA tests, and battle scars', () => {
  const catalogs = {
    battleTraits: crusadeData.BATTLE_TRAIT_TABLES,
    astraTraits: crusadeData.ASTRA_MILITARUM_TRAIT_TABLES,
    necronTraits: crusadeData.NECRONS_TRAIT_TABLES,
    votannTraits: crusadeData.VOTANN_TRAIT_TABLES,
    weaponMods: crusadeData.WEAPON_MOD_TABLE,
    relicVault: crusadeData.CRUSADE_RELIC_VAULT,
    astraRelics: crusadeData.ASTRA_MILITARUM_RELIC_VAULT,
    necronRelics: crusadeData.NECRONS_RELIC_VAULT,
    votannRelics: crusadeData.VOTANN_RELIC_VAULT,
    battleScars: crusadeData.BATTLE_SCAR_TABLE,
    necronScars: crusadeData.NECRON_BATTLE_SCAR_TABLE,
    votannScars: crusadeData.VOTANN_BATTLE_SCAR_TABLE
  };

  // Trait pick across Armageddon, AlphaCodex, BetaCodex, GammaCodex
  const traitPick = core.rollBattleTraitPick('BetaCodex', 'Canoptek', catalogs, () => 0);
  assert.equal(traitPick.poolTag, 'Necrons Codex');
  assert.equal(traitPick.name, crusadeData.NECRONS_TRAIT_TABLES.Canoptek[0].name);

  const gammaTrait = core.rollBattleTraitPick('GammaCodex', 'Infantry', catalogs, () => 0.99);
  assert.equal(gammaTrait.poolTag, 'Leagues of Votann Codex');

  // Weapon Mod pair guarantees 2 distinct mods even if RNG repeats 0.0 then 0.0 -> 0.5
  const modPair = core.rollWeaponModPair(catalogs.weaponMods, makeSeqRng([0.0, 0.0, 0.4]));
  assert.notEqual(modPair.pick1.roll, modPair.pick2.roll);
  assert.ok(modPair.name.includes('+'));

  // Relic pick
  const relicPick = core.rollCrusadeRelicPick('AlphaCodex', 'Artificer', catalogs, () => 0);
  assert.equal(relicPick.poolTag, 'AM Codex');
  assert.equal(relicPick.name, crusadeData.ASTRA_MILITARUM_RELIC_VAULT.Artificer[0].name);

  // Out of Action roll: 0.0 -> D6=1 (failed), 0.2 -> D6=2 (survived)
  assert.deepEqual(core.evaluateOutOfActionRoll(() => 0.0), { roll: 1, survived: false });
  assert.deepEqual(core.evaluateOutOfActionRoll(() => 0.2), { roll: 2, survived: true });

  // Battle Scar pick
  const scarPick = core.rollBattleScarPick('BetaCodex', catalogs, () => 0);
  assert.equal(scarPick.poolTag, 'Necron Flaw');
  assert.equal(scarPick.name, crusadeData.NECRON_BATTLE_SCAR_TABLE[0].name);

  // Queued upgrade entry builder
  const entry = core.createQueuedUpgradeEntry(traitPick, '  Immortal Squad  ', '  Held Node 2  ');
  assert.equal(entry.unit, 'Immortal Squad');
  assert.equal(entry.context, 'Held Node 2');
  assert.equal(entry.name, traitPick.name);
});

test('Astra Militarum Tour & Logistics Core: quota rollers, capacity clamping, ViewModel & pure dispatch', () => {
  const quotas = core.rollTourQuotaValues(makeSeqRng([0.5, 0.99]));
  assert.equal(quotas.bRoll, 4);
  assert.equal(quotas.tourBattlesRem, 8);
  assert.equal(quotas.wRoll, 3);
  assert.equal(quotas.tourWinsRem, 5);

  const comm = core.rollCommendationPointsGain(2, () => 0.7);
  assert.equal(comm.gain, 3);
  assert.equal(comm.commendationPts, 5);

  // Capacity clamping
  const startLog = { lexmechanicus: 2, materiel: 1, tithePool: 1, morale: 0 };
  const blocked = core.allocateLogisticsPoint(startLog, false, 'morale', 1);
  assert.equal(blocked.changed, false);
  assert.equal(blocked.allocated, 4);

  const allowedWithPrimer = core.allocateLogisticsPoint(startLog, true, 'morale', 1);
  assert.equal(allowedWithPrimer.changed, true);
  assert.equal(allowedWithPrimer.logistics.morale, 1);
  assert.equal(allowedWithPrimer.allocated, 5);

  const vm = core.deriveLogisticsViewModel(startLog, false, crusadeData.LOGISTICS_CATEGORIES);
  assert.equal(vm.allocatedLabel, '4 / 4');
  assert.equal(vm.cards.length, 4);
  assert.equal(vm.cards[0].statusBadge, '🟢 SURPLUS (2 PTS)');
  assert.equal(vm.cards[3].statusBadge, '🔴 DEFICIENCY (0 PTS)');

  const dispatch = core.compileTourDispatch({
    tourBattlesRem: 8,
    tourWinsRem: 5,
    commendationPts: 5,
    logistics: startLog,
    upliftingPrimer: false,
    notes: 'Hold Hades Hive.'
  });
  assert.ok(dispatch.includes('8 Battles Required // 5 Victories Required'));
  assert.ok(dispatch.includes('Hold Hades Hive.'));
});

test('Necron Tomb Matrix Core: system point allocation, deterministic D3 drain order, ViewModel & pure dispatch', () => {
  const startSys = { command: 2, reanimation: 1, translocation: 0 };
  const blocked = core.allocateTombSystemPoint(startSys, false, 'translocation', 1);
  assert.equal(blocked.changed, false);

  const expanded = core.allocateTombSystemPoint(startSys, true, 'translocation', 1);
  assert.equal(expanded.changed, true);
  assert.equal(expanded.tombSystems.translocation, 1);

  // Drain 2 points (rng=0.5 -> D3=2) drains translocation (1->0) then reanimation (1->0), leaving command=2
  const drained = core.applyMasterSystemDrain(expanded.tombSystems, 1, () => 0.5);
  assert.equal(drained.drainTarget, 2);
  assert.equal(drained.drained, 2);
  assert.deepEqual(drained.tombSystems, { command: 2, reanimation: 0, translocation: 0 });
  assert.equal(drained.tombAwakeningCycles, 2);

  const vmOnline = core.deriveTombMatrixViewModel(startSys, false, crusadeData.TOMB_WORLD_SYSTEMS);
  assert.equal(vmOnline.allocatedLabel, '3 / 3');
  assert.ok(vmOnline.masterStatusLabel.includes('MASTER ONLINE'));

  const vmDormant = core.deriveTombMatrixViewModel({ command: 0, reanimation: 0, translocation: 0 }, false, crusadeData.TOMB_WORLD_SYSTEMS);
  assert.ok(vmDormant.masterStatusLabel.includes('DORMANT STASIS'));
});

test('Leagues of Votann Core: harvest multipliers + asset bonuses, rare check, asset cycling & pure dispatch', () => {
  const votann = core.createInitialVotannState({
    assets: { outpost1: 'Active', outpost2: 'Upgraded', biorecyc: 'Active' }
  });

  // Roll D6=1 (Raw Minerals) at Strike Force (mult=2: 2D6 with 4 and 5 -> 9 * 10 = 90) + Outpost1(+20) + Outpost2(+30) = 140, plus +20 Biomatter from biorecyc
  const harvestMinerals = core.calculateVotannHarvest(votann, 2, makeSeqRng([0.0, 0.6, 0.8]));
  assert.equal(harvestMinerals.targetKey, 'rawMinerals');
  assert.equal(harvestMinerals.baseAmount, 90);
  assert.equal(harvestMinerals.mineralBonus, 50);
  assert.equal(harvestMinerals.finalGain, 140);
  assert.equal(harvestMinerals.bioBonus, 20);
  assert.equal(harvestMinerals.votann.rawMinerals, 140);
  assert.equal(harvestMinerals.votann.biomatter, 20);
  assert.equal(harvestMinerals.votann.expTotals.rawMinerals, 140);
  assert.equal(harvestMinerals.votann.expTotals.biomatter, 20);

  // Roll D6=2 (Biomatter, rng=0.2) at Combat Patrol (mult=0.5: D6=4 -> 4 * 5 = 20); biorecyc does NOT double-trigger when rolling Biomatter directly
  const harvestBio = core.calculateVotannHarvest(harvestMinerals.votann, 0.5, makeSeqRng([0.2, 0.6]));
  assert.equal(harvestBio.targetKey, 'biomatter');
  assert.equal(harvestBio.baseAmount, 20);
  assert.equal(harvestBio.bioBonus, 0);
  assert.equal(harvestBio.finalGain, 20);
  assert.equal(harvestBio.votann.biomatter, 40);

  // Rare check: 0.9 -> D6=6 (success), 0.7 -> D6=5 (fail)
  assert.deepEqual(core.evaluateVotannRareRoll(() => 0.9), { d6: 6, success: true });
  assert.deepEqual(core.evaluateVotannRareRoll(() => 0.7), { d6: 5, success: false });

  // Asset state cycle
  assert.equal(core.nextVotannAssetState('Locked'), 'Active');
  assert.equal(core.nextVotannAssetState('Active'), 'Upgraded');
  assert.equal(core.nextVotannAssetState('Upgraded'), 'Inactive');
  assert.equal(core.nextVotannAssetState('Inactive'), 'Locked');

  // Expedition reset on completion
  const completed = core.adjustVotannExpeditionField(harvestBio.votann, 'expeditionsCompleted', 1).votann;
  assert.equal(completed.expeditionsCompleted, 1);
  assert.equal(completed.expTotals.rawMinerals, 0);
  assert.equal(completed.rawMinerals, 140, 'Fundamental vault persists when expedition resets');
});

test('Master Dossier & Horde Telemetry Patch: declarative salvage tiers, fortification flags, and Gamma Votann channel', () => {
  assert.equal(core.mapLeftoverSpToOption(9), '8 Leftover SP → +1 RP or +100 pts Supply Limit');
  assert.equal(core.mapLeftoverSpToOption(5), '5 Leftover SP → +2 XP to Surviving Unit');
  assert.equal(core.mapLeftoverSpToOption(3), '3 Leftover SP → Bank 1v1 Supply Cache Token');
  assert.equal(core.mapLeftoverSpToOption(2), '2 Leftover SP → Orbital Auspex Recon Probe (Reveal Adjacent Node)');
  assert.equal(core.mapLeftoverSpToOption(1), '0 Leftover SP');

  const patch = core.deriveHordeTelemetryImportPatch(
    {
      leftoverSp: 6,
      gameMode: 'SOLO',
      secretObjective: { code: 'V99' },
      fortifications: ['Field Hospital', 'Ammo Dump', 'Forward Operating Base']
    },
    'Mode 1: Co-op Horde Breach // Node 0 (Golgotha Arbor-Basin)'
  );
  assert.equal(patch.secretCode, 'V99');
  assert.equal(patch.leftoverSpOption, '5 Leftover SP → +2 XP to Surviving Unit');
  assert.ok(patch.upgradedSoloModeNode.includes('Mode 1: Solo Horde Breach'));
  assert.deepEqual(patch.fortifications, { fortHosp: true, fortAmmo: true, fortTrench: false, fortFob: true });

  const gammaDossier = core.compileMasterDossier(
    {
      channel: 'gamma',
      modeNode: 'Mode 1: Solo Horde Breach // Node 0 (Golgotha Arbor-Basin)',
      outcome: 'Victory (+5 SPts)',
      secretCode: 'V99',
      secretTag: 'Wargear Tag',
      leftoverSp: patch.leftoverSpOption,
      battleNotes: 'Kin prospectors held the drill rig.',
      votannSummary: 'Expeditions: 1 | Vault [M:40 B:20 E:10 I:0]',
      queuedRolls: [],
      hordeBattleStats: { hordeKills: 14, spEarned: 20, spSpent: 14, leftoverSp: 6, hordeFaction: 'Orks', roomSeed: 'VOT-1', gameMode: 'SOLO' }
    },
    {
      formatHordeTelemetry: hordeStats.compileHordeBattleStatsDossierSection
    }
  );
  assert.ok(gammaDossier.includes('+++ THRYMKÂL SALVAGE CONSORTIUM // MASTER POST-BATTLE DOSSIER & BLACK-LEDGER REPORT +++'));
  assert.ok(gammaDossier.includes('KÂHL HÂRKYN // THE LEDGER OF EMBERS'));
  assert.ok(gammaDossier.includes('KINDRED EXPEDITION & RESOURCE VAULT TELEMETRY: Expeditions: 1'));
  assert.ok(gammaDossier.includes('• HORDE UNITS DESTROYED: 14 Units Slain'));
});
````
