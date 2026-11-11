# 📦 Fires of Armageddon // Bundle: Mode 5 - Crusade Quartermaster Matrix (Part 1)

Humble View UI adapters for Necron Tomb World Awakening Matrix, Dynastic Vault, and Leagues of Votann resource prospecting (`js/crusade.js` lines 1 to 405).

## 📑 Table of Contents
- [js/crusade.js (Part 1: Tomb Matrix & Votann Vaults, Lines 1-405)](#file-jscrusadejspart1tombmatrixvotannvaultslines1405)

---

## File: `js/crusade.js (Part 1: Tomb Matrix & Votann Vaults, Lines 1-405)` <a id="file-jscrusadejspart1tombmatrixvotannvaultslines1405"></a>

````javascript
/**
 * @fileoverview Crusade Command & Master Dossier Humble View Controller (MVVM Shell).
 * Projects explicit Crusade state (`State -> UI`) and forwards DOM user intents (`Event -> Core -> State`)
 * for Tab 4 (Necrons Tomb World Awakening Matrix & Dynastic Vault), Tab 5 (Leagues of Votann
 * Kindred Expeditions & Resource Vault), Tab 2 Master Post-Battle Dossier compilation/transmission,
 * Mode 1 Horde Battle Telemetry attachment, and localStorage persistence.
 * All pure game rules, RNG math, ViewModel derivation, and dossier compilers live in `js/crusade-core.js`.
 */

var _matrixCore = (typeof CrusadeCore !== 'undefined' && CrusadeCore)
  ? CrusadeCore
  : (typeof require === 'function' ? require('./crusade-core.js') : null);

var _matrixData = (typeof require === 'function' && typeof TOMB_WORLD_SYSTEMS === 'undefined')
  ? (function () { try { return require('./crusade-data.js'); } catch (_) { return {}; } })()
  : {};

let _compileHordeBattleStatsDossierSection = typeof compileHordeBattleStatsDossierSection === 'function'
  ? compileHordeBattleStatsDossierSection
  : null;
let _loadHordeBattleStats = typeof loadHordeBattleStats === 'function' ? loadHordeBattleStats : null;

if (typeof require === 'function') {
  try {
    const hStats = require('./horde-battle-stats.js');
    if (hStats?.compileHordeBattleStatsDossierSection) {
      _compileHordeBattleStatsDossierSection = hStats.compileHordeBattleStatsDossierSection;
    }
    if (hStats?.loadHordeBattleStats) _loadHordeBattleStats = hStats.loadHordeBattleStats;
  } catch (_) {}
  if (typeof crusadeState === 'undefined') {
    try {
      const forge = require('./crusade-forge.js');
      if (forge && forge.crusadeState) global.crusadeState = forge.crusadeState;
    } catch (_) {}
  }
}

function _getMatrixEl(id) {
  return typeof document !== 'undefined' ? document.getElementById(id) : null;
}

function _getMatrixVox() {
  return (typeof window !== 'undefined' && window.VoxAudio) ? window.VoxAudio : null;
}

function _scheduleMatrixEffect(callback, delayMs) {
  if (typeof setTimeout !== 'function') {
    callback();
    return;
  }
  const handle = setTimeout(callback, delayMs);
  if (handle && typeof handle.unref === 'function') handle.unref();
}

function _resolveMatrixCatalogs() {
  const win = typeof window !== 'undefined' ? window : {};
  return {
    logisticsCategories: (typeof LOGISTICS_CATEGORIES !== 'undefined' ? LOGISTICS_CATEGORIES : win.LOGISTICS_CATEGORIES) || _matrixData.LOGISTICS_CATEGORIES || [],
    tombSystems: (typeof TOMB_WORLD_SYSTEMS !== 'undefined' ? TOMB_WORLD_SYSTEMS : win.TOMB_WORLD_SYSTEMS) || _matrixData.TOMB_WORLD_SYSTEMS || [],
    necronVault: (typeof NECRON_DYNASTIC_VAULT !== 'undefined' ? NECRON_DYNASTIC_VAULT : win.NECRON_DYNASTIC_VAULT) || _matrixData.NECRON_DYNASTIC_VAULT || [],
    votannAssets: (typeof VOTANN_KINDRED_ASSETS !== 'undefined' ? VOTANN_KINDRED_ASSETS : win.VOTANN_KINDRED_ASSETS) || _matrixData.VOTANN_KINDRED_ASSETS || [],
    votannVault: (typeof VOTANN_VAULT_PROTOCOLS !== 'undefined' ? VOTANN_VAULT_PROTOCOLS : win.VOTANN_VAULT_PROTOCOLS) || _matrixData.VOTANN_VAULT_PROTOCOLS || []
  };
}

// =============================================================================
// TAB 4: NECRONS TOMB WORLD AWAKENING MATRIX & DYNASTIC VAULT ADAPTERS
// =============================================================================
function adjTombField(field, delta) {
  crusadeState[field] = _matrixCore.clampCounter(crusadeState[field], delta);
  const el = _getMatrixEl(field);
  if (el) el.textContent = String(crusadeState[field]);
  updateMasterDossierPreview();
  updateTombAwakeningPreview();
  saveCrusadeState();
}

function togglePowerReserves() {
  const cb = _getMatrixEl('powerReservesToggle');
  crusadeState.powerReservesAllocated = !!(cb && cb.checked);
  renderTombAwakeningMatrix();
  updateMasterDossierPreview();
  updateTombAwakeningPreview();
  saveCrusadeState();
}

function adjTombSystemPt(sysKey, delta) {
  const res = _matrixCore.allocateTombSystemPoint(
    crusadeState.tombSystems,
    crusadeState.powerReservesAllocated,
    sysKey,
    delta
  );
  if (!res.changed) return;
  crusadeState.tombSystems = res.tombSystems;
  _getMatrixVox()?.playClank?.('card');
  renderTombAwakeningMatrix();
  updateMasterDossierPreview();
  updateTombAwakeningPreview();
  saveCrusadeState();
}

function rollMasterSystemReset() {
  _getMatrixVox()?.playDiceClatter?.();
  const res = _matrixCore.applyMasterSystemDrain(crusadeState.tombSystems, crusadeState.tombAwakeningCycles);
  crusadeState.tombSystems = res.tombSystems;
  crusadeState.tombAwakeningCycles = res.tombAwakeningCycles;

  const cycEl = _getMatrixEl('tombAwakeningCycles');
  if (cycEl) cycEl.textContent = String(crusadeState.tombAwakeningCycles);
  const noticeEl = _getMatrixEl('tombResetNotice');
  if (noticeEl) {
    noticeEl.innerHTML = `<strong style="color:var(--red);">Master System Surge! Rolled D3 = −${res.drainTarget} Awakening Pt(s) Reset!</strong>`;
  }

  renderTombAwakeningMatrix();
  updateMasterDossierPreview();
  updateTombAwakeningPreview();
  saveCrusadeState();

  _scheduleMatrixEffect(() => {
    _getMatrixVox()?.playScarHazard?.();
  }, 240);
}

function renderTombAwakeningMatrix() {
  if (typeof document === 'undefined') return;
  const grid = _getMatrixEl('tombMatrixGrid');
  const label = _getMatrixEl('tombMatrixAllocatedLabel');
  const statusEl = _getMatrixEl('tombMasterStatusVal');
  const cb = _getMatrixEl('powerReservesToggle');

  if (!crusadeState.tombSystems) {
    crusadeState.tombSystems = { command: 1, reanimation: 1, translocation: 0 };
  }
  const vm = _matrixCore.deriveTombMatrixViewModel(
    crusadeState.tombSystems,
    crusadeState.powerReservesAllocated,
    _resolveMatrixCatalogs().tombSystems
  );

  if (cb) cb.checked = !!crusadeState.powerReservesAllocated;
  if (label) label.textContent = vm.allocatedLabel;
  if (statusEl) {
    statusEl.textContent = vm.masterStatusLabel;
    if (statusEl.style) statusEl.style.color = vm.masterStatusColor;
  }
  if (!grid) return;

  grid.innerHTML = vm.cards.map((card) => {
    const tiersHtml = card.tiers.map((t) =>
      `<div style="color:${t.unlocked ? 'var(--green)' : 'var(--muted)'}; margin-bottom:4px;">${t.unlocked ? '✓' : '🔒'} ${t.text}</div>`
    ).join('');
    return `
      <div class="logistics-card ${card.stateClass}">
        <div style="display:flex; flex-direction:column; align-items:center; text-align:center; gap:6px; margin-bottom:8px;"><strong style="color:#fff; font-size:0.9rem;">${card.title}</strong><span class="rule-tag" style="border-color:${card.badgeColor}; color:${card.badgeColor};">${card.badgeText}</span></div>
        <div class="hud-val-row" style="margin-bottom:8px;"><button type="button" class="mini-btn" onclick="adjTombSystemPt('${card.key}', -1)">−</button><span class="hud-num" style="color:var(--green); font-size:1.2rem;">${card.pts} / 3 PTS</span><button type="button" class="mini-btn" onclick="adjTombSystemPt('${card.key}', 1)">+</button></div>
        <div style="font-size:0.77rem; color:var(--gold); margin-bottom:6px;">${card.agenda}</div>
        <div style="font-size:0.79rem; line-height:1.42; margin-bottom:6px;">${tiersHtml}</div>
        <div style="font-size:0.78rem; line-height:1.4; color:${card.masterColor}; border-top:1px solid var(--border); padding-top:6px;"><strong>${card.masterPrefix}</strong>${card.master}</div>
      </div>`;
  }).join('');
}

function populateNecronDynasticVault() {
  const sel = _getMatrixEl('necronVaultSelect');
  if (!sel) return;
  const vault = _resolveMatrixCatalogs().necronVault;
  sel.innerHTML = vault.map((item) => `<option value="${item.id}">${item.name} — [${item.type}]</option>`).join('');
  renderSelectedNecronVaultPreview();
}

function renderSelectedNecronVaultPreview() {
  const sel = _getMatrixEl('necronVaultSelect');
  const box = _getMatrixEl('necronVaultPreviewBox');
  if (!sel || !box) return;
  const vault = _resolveMatrixCatalogs().necronVault;
  const pick = vault.find((item) => item.id === sel.value) || vault[0];
  if (!pick) return;
  box.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:6px;">
      <strong style="color:#fff; font-size:0.94rem;">${pick.name}</strong>
      <span class="dice-pip-badge" style="background:var(--green); color:#000; margin-right:0; font-size:0.76rem;">${pick.type}</span>
    </div>
    <div style="font-size:0.84rem; color:var(--text);">${pick.desc}</div>
  `;
}

function attachNecronVaultToDossier() {
  const sel = _getMatrixEl('necronVaultSelect');
  if (!sel) return;
  const vault = _resolveMatrixCatalogs().necronVault;
  const pick = vault.find((item) => item.id === sel.value) || vault[0];
  if (!pick) return;
  const unitName = (_getMatrixEl('necronRecipientUnit')?.value || 'Hypercrypt Phalanx').trim();

  crusadeState.queuedRolls.push({
    unit: unitName,
    context: `Activated via Tomb World Awakening Matrix (${pick.type})`,
    category: pick.type,
    roll: 'Tomb World Protocol',
    name: pick.name,
    desc: pick.desc
  });

  _getMatrixVox()?.playRelicChoir?.();
  if (typeof renderQueuedRolls === 'function') renderQueuedRolls();
  updateMasterDossierPreview();
  saveCrusadeState();
  if (typeof switchCrusadeTab === 'function') switchCrusadeTab('forge');
}

function buildTombMatrixSummaryLine() {
  return _matrixCore.formatTombMatrixSummaryLine(crusadeState);
}

function compileTombAwakeningDossier(input = {}) {
  const hasExplicitNotes = Object.prototype.hasOwnProperty.call(input, 'notes');
  return _matrixCore.compileTombAwakeningDossier({
    tombSystems: input.tombSystems || (typeof crusadeState !== 'undefined' ? crusadeState.tombSystems : {}),
    allocatedPts: input.allocatedPts,
    powerReservesAllocated: typeof input.powerReservesAllocated === 'boolean'
      ? input.powerReservesAllocated
      : !!(typeof crusadeState !== 'undefined' && crusadeState.powerReservesAllocated),
    notes: hasExplicitNotes ? input.notes : (_getMatrixEl('tombAwakeningNotes')?.value || '')
  });
}

function buildTombAwakeningDossierString() {
  return compileTombAwakeningDossier({
    powerReservesAllocated: !!crusadeState.powerReservesAllocated,
    tombSystems: crusadeState.tombSystems,
    notes: _getMatrixEl('tombAwakeningNotes')?.value || ''
  });
}

function updateTombAwakeningPreview() {
  if (typeof document === 'undefined') return;
  const box = _getMatrixEl('tombAwakeningPreviewBox');
  if (box) {
    box.textContent = buildTombAwakeningDossierString();
    if (box.classList && typeof box.classList.toggle === 'function') {
      box.classList.toggle('vox-preview-beta', true);
      box.classList.toggle('vox-preview-alpha', false);
    }
  }
}

function transmitTombAwakeningDossier() {
  const payload = buildTombAwakeningDossierString();
  _getMatrixVox()?.transmitToVox?.('beta', payload);
}

function resetTombAwakeningTab() {
  crusadeState.tombAgendasCompleted = 0;
  crusadeState.tombAwakeningCycles = 0;
  crusadeState.powerReservesAllocated = false;
  crusadeState.tombSystems = { command: 0, reanimation: 0, translocation: 0 };

  if (typeof document !== 'undefined') {
    const txtIds = { tombAgendasCompleted: '0', tombAwakeningCycles: '0', necronRecipientUnit: '', tombAwakeningNotes: '' };
    Object.entries(txtIds).forEach(([id, val]) => {
      const el = _getMatrixEl(id);
      if (el) {
        if ('value' in el) el.value = val;
        else el.textContent = val;
      }
    });
    const reservesEl = _getMatrixEl('powerReservesToggle');
    if (reservesEl) reservesEl.checked = false;
    const noticeEl = _getMatrixEl('tombResetNotice');
    if (noticeEl) noticeEl.innerHTML = 'Allocate 3/3 pts to unlock Master System abilities';
  }

  _getMatrixVox()?.playClank?.('card');
  renderTombAwakeningMatrix();
  updateMasterDossierPreview();
  updateTombAwakeningPreview();
  saveCrusadeState();
}

// =============================================================================
// TAB 5: LEAGUES OF VOTANN EXPEDITIONS & GUILD CONTRACTS ADAPTERS
// =============================================================================
function ensureVotannState() {
  if (!crusadeState.votann) {
    crusadeState.votann = _matrixCore.createInitialVotannState();
  } else {
    Object.assign(crusadeState.votann, _matrixCore.createInitialVotannState(crusadeState.votann));
  }
  return crusadeState.votann;
}

function adjVotannRes(key, delta) {
  const v = ensureVotannState();
  Object.assign(v, _matrixCore.adjustVotannResource(v, key, delta).votann);
  renderVotannTab();
  updateMasterDossierPreview();
  saveCrusadeState();
}

function adjVotannRare(key, delta) {
  const v = ensureVotannState();
  Object.assign(v, _matrixCore.adjustVotannRareResource(v, key, delta).votann);
  renderVotannTab();
  updateMasterDossierPreview();
  saveCrusadeState();
}

function rollVotannPostBattleHarvest() {
  _getMatrixVox()?.playDiceClatter?.();
  const v = ensureVotannState();
  const mult = parseFloat(_getMatrixEl('votHarvestSizeSelect')?.value || '1');
  const res = _matrixCore.calculateVotannHarvest(v, mult);
  Object.assign(v, res.votann);

  const bioSuffix = res.bioBonus > 0 ? ` (+${res.bioBonus} Biomatter from Biorecyc Fabricator)` : '';
  const notice = _getMatrixEl('votHarvestNotice');
  if (notice) {
    notice.innerHTML = `<strong style="color:var(--gold);">Rolled D6=${res.resRoll}: +${res.finalGain} ${res.targetLabel}${bioSuffix}!</strong>`;
  }
  renderVotannTab();
  saveCrusadeState();
}

function rollVotannRareResourceCheck() {
  _getMatrixVox()?.playDiceClatter?.();
  const v = ensureVotannState();
  const outcome = _matrixCore.evaluateVotannRareRoll();
  const notice = _getMatrixEl('votHarvestNotice');
  if (outcome.success) {
    Object.assign(v, _matrixCore.adjustVotannRareResource(v, 'rawMinerals', 1).votann);
    if (notice) notice.innerHTML = `<strong style="color:var(--green);">D6 = 6! Unearthed +1 Rare Resource!</strong>`;
  } else if (notice) {
    notice.innerHTML = `<span style="color:var(--muted);">Victory Rare Roll: D6 = ${outcome.d6} (Requires 6+).</span>`;
  }
  renderVotannTab();
  saveCrusadeState();
}

function syncVotannExpeditionSelectors() {
  const v = ensureVotannState();
  v.expBacking = _getMatrixEl('votExpBacking')?.value || v.expBacking;
  v.expGoal = _getMatrixEl('votExpGoal')?.value || v.expGoal;
  v.expContract = _getMatrixEl('votExpContract')?.value || v.expContract;
  renderVotannTab();
  saveCrusadeState();
}

function adjVotannExpField(field, delta) {
  const v = ensureVotannState();
  Object.assign(v, _matrixCore.adjustVotannExpeditionField(v, field, delta).votann);
  renderVotannTab();
  saveCrusadeState();
}

function cycleVotannAssetState(key) {
  const v = ensureVotannState();
  v.assets[key] = _matrixCore.nextVotannAssetState(v.assets[key]);
  renderVotannTab();
  saveCrusadeState();
}

function populateVotannVault() {
  const sel = _getMatrixEl('votannVaultSelect');
  if (!sel) return;
  const vault = _resolveMatrixCatalogs().votannVault;
  sel.innerHTML = vault.map((i) => `<option value="${i.id}">${i.name} — [${i.type}]</option>`).join('');
  renderSelectedVotannVaultPreview();
}

function renderSelectedVotannVaultPreview() {
  const sel = _getMatrixEl('votannVaultSelect');
  const box = _getMatrixEl('votannVaultPreviewBox');
  if (!sel || !box) return;
  const vault = _resolveMatrixCatalogs().votannVault;
  const pick = vault.find((i) => i.id === sel.value) || vault[0];
  if (!pick) return;
  box.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:6px;">
      <strong style="color:#fff; font-size:0.94rem;">${pick.name}</strong>
      <span class="dice-pip-badge" style="background:var(--gold); color:#000; margin-right:0; font-size:0.76rem;">${pick.type}</span>
    </div>
    <div style="font-size:0.84rem; color:var(--text);">${pick.desc}</div>
  `;
}

function attachVotannVaultToDossier() {
  const sel = _getMatrixEl('votannVaultSelect');
  if (!sel) return;
  const vault = _resolveMatrixCatalogs().votannVault;
  const pick = vault.find((i) => i.id === sel.value) || vault[0];
  if (!pick) return;
  const unitName = (_getMatrixEl('votannRecipientUnit')?.value || 'Needgaârd Oathband').trim();
  crusadeState.queuedRolls.push({
    unit: unitName,
    context: `Activated via Kindred Acquisitions Vault (${pick.type})`,
    category: pick.type,
    roll: 'Kindred Protocol',
    name: pick.name,
    desc: pick.desc
  });
  _getMatrixVox()?.playRelicChoir?.();
  if (typeof renderQueuedRolls === 'function') renderQueuedRolls();
````
