# 📦 Fires of Armageddon // Bundle: Mode 5 - Crusade Quartermaster Matrix (Part 2)

Humble View UI adapters for Votann Expeditions, Master Dossier compilation/transmission, Horde Battle Telemetry attachment, and state persistence (`js/crusade.js` lines 406 to end).

## 📑 Table of Contents
- [js/crusade.js (Part 2: Dossier Shell & Persistence, Lines 406-end)](#file-jscrusadejspart2dossiershellpersistencelines406end)

---

## File: `js/crusade.js (Part 2: Dossier Shell & Persistence, Lines 406-end)` <a id="file-jscrusadejspart2dossiershellpersistencelines406end"></a>

````javascript
  updateMasterDossierPreview();
  saveCrusadeState();
  if (typeof switchCrusadeTab === 'function') switchCrusadeTab('forge');
}

function renderVotannTab() {
  if (typeof document === 'undefined') return;
  const v = ensureVotannState();
  const vm = _matrixCore.deriveVotannTabViewModel(v, _resolveMatrixCatalogs().votannAssets);

  ['rawMinerals', 'biomatter', 'energySources', 'galacticIntel'].forEach((k) => {
    const rEl = _getMatrixEl('votRes_' + k);
    const rareEl = _getMatrixEl('votRare_' + k);
    if (rEl) rEl.textContent = String(v[k] || 0);
    if (rareEl) rareEl.textContent = String(v.rare?.[k] || 0);
  });

  const bLbl = _getMatrixEl('votExpBattlesLabel');
  const wLbl = _getMatrixEl('votExpWinsLabel');
  if (bLbl) bLbl.textContent = vm.battlesLabel;
  if (wLbl) wLbl.textContent = vm.winsLabel;

  const gpLabel = _getMatrixEl('votGoalProgressLabel');
  if (gpLabel) gpLabel.textContent = vm.goalProgressLabel;
  const gpPips = _getMatrixEl('votGoalPips');
  if (gpPips) gpPips.innerHTML = vm.goalPipsText;

  const expTotEl = _getMatrixEl('votExpTotalsDisplay');
  if (expTotEl) expTotEl.textContent = vm.expTotalsText;

  const grid = _getMatrixEl('votannAssetsGrid');
  if (grid) {
    grid.innerHTML = vm.cards.map((card) => `
      <div class="logistics-card">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;"><strong style="color:#fff; font-size:0.88rem;">${card.title}</strong><button type="button" class="mini-btn" style="width:auto; padding:2px 8px; border-color:${card.badgeColor}; color:${card.badgeColor};" onclick="cycleVotannAssetState('${card.key}')">${card.status.toUpperCase()}</button></div>
        <div style="font-size:0.74rem; color:var(--muted); margin-bottom:4px;">${card.costLine}</div>
        <div style="font-size:0.79rem; color:var(--text);">${card.desc}</div>
      </div>`).join('');
  }
  const cEl = _getMatrixEl('votActiveAssetsCount');
  if (cEl) cEl.textContent = String(vm.activeAssetsCount);
  updateVotannDispatchPreview();
}

function buildVotannSummaryLine() {
  return _matrixCore.formatVotannSummaryLine(ensureVotannState());
}

function compileVotannDispatch(input = {}) {
  const hasExplicitNotes = Object.prototype.hasOwnProperty.call(input, 'notes');
  return _matrixCore.compileVotannDispatch({
    votann: input.votann || ensureVotannState(),
    notes: hasExplicitNotes ? input.notes : (_getMatrixEl('votannDispatchNotes')?.value || '')
  });
}

function updateVotannDispatchPreview() {
  const box = _getMatrixEl('votannDispatchPreviewBox');
  if (box) box.textContent = compileVotannDispatch();
}

function transmitVotannDispatch() {
  const payload = compileVotannDispatch();
  _getMatrixVox()?.transmitToVox?.('gamma', payload);
}

// =============================================================================
// TAB 2: MASTER POST-BATTLE DOSSIER, HORDE TELEMETRY & PERSISTENCE ADAPTERS
// =============================================================================
function resetMasterDossierForm() {
  const defaults = {
    dossierChannel: 'alpha',
    dossierModeNode: 'Mode 1: Co-op Horde Breach // Node 0 (Golgotha Arbor-Basin)',
    dossierOutcome: 'Survived Round 6 Final Stand & Completed Secret Objective (+5 SPts)',
    dossierSecretCode: '',
    dossierSecretTag: 'Action / Relic Tag (Free Battle Trait, Weapon Mod, or Relic)',
    dossierLeftoverSp: '0 Leftover SP',
    dossierBattleNotes: '',
    dossierDistantForce: ''
  };
  Object.entries(defaults).forEach(([id, val]) => {
    const el = _getMatrixEl(id);
    if (el) el.value = val;
  });
  ['fortHosp', 'fortAmmo', 'fortTrench', 'fortFob'].forEach((id) => {
    const el = _getMatrixEl(id);
    if (el) el.checked = false;
  });

  crusadeState.queuedRolls = [];
  crusadeState.dossierDistantForce = '';
  crusadeState.dossierChannel = 'alpha';
  crusadeState.attachedHordeStats = null;

  renderHordeStatsAttachmentCard();
  _getMatrixVox()?.playClank?.('card');
  if (typeof renderQueuedRolls === 'function') renderQueuedRolls();
  updateMasterDossierPreview();
  saveCrusadeState();
}

function updateDistantForceVisibility() {
  const chan = _getMatrixEl('dossierChannel')?.value || 'alpha';
  const mode = _getMatrixEl('dossierModeNode')?.value || '';
  const row = _getMatrixEl('dossierDistantForceRow');
  if (row) {
    row.style.display = _matrixCore.isDistantAugurEngagement(chan, mode) ? 'block' : 'none';
  }
}

function isHordeModeDossier(modeNode) {
  return _matrixCore.isHordeModeDossier(modeNode);
}

function compileMasterDossier(input = {}) {
  const compiler = typeof compileHordeBattleStatsDossierSection === 'function'
    ? compileHordeBattleStatsDossierSection
    : _compileHordeBattleStatsDossierSection;
  const chan = input.channel || 'alpha';
  const enriched = { ...input };

  if (chan === 'beta' && !enriched.tombSummary) {
    enriched.tombSummary = buildTombMatrixSummaryLine();
  } else if (chan === 'gamma' && !enriched.votannSummary) {
    enriched.votannSummary = buildVotannSummaryLine();
  } else if (chan === 'alpha' && !enriched.logisticsSummary) {
    enriched.logisticsSummary = typeof buildLogisticsSummaryLine === 'function'
      ? buildLogisticsSummaryLine()
      : _matrixCore.formatLogisticsSummaryLine(crusadeState, _resolveMatrixCatalogs().logisticsCategories);
  }
  return _matrixCore.compileMasterDossier(enriched, { formatHordeTelemetry: compiler });
}

function readMasterDossierFormInputs() {
  const fortDefs = [
    ['fortHosp', 'Field Hospital (Auto-Pass OOA)'],
    ['fortAmmo', 'Ammo Dump (Free Weapon Mod)'],
    ['fortTrench', 'War Trench (+1 XP Infantry)'],
    ['fortFob', 'FOB (+1 SPt & +1 Hegemony)']
  ];
  const fortifications = fortDefs
    .filter(([id]) => _getMatrixEl(id)?.checked)
    .map(([, label]) => label);

  const modeNode = _getMatrixEl('dossierModeNode')?.value || '';
  return {
    channel: _getMatrixEl('dossierChannel')?.value || 'alpha',
    modeNode,
    outcome: _getMatrixEl('dossierOutcome')?.value || '',
    secretCode: _getMatrixEl('dossierSecretCode')?.value || '',
    secretTag: _getMatrixEl('dossierSecretTag')?.value || '',
    leftoverSp: _getMatrixEl('dossierLeftoverSp')?.value || '0 Leftover SP',
    battleNotes: _getMatrixEl('dossierBattleNotes')?.value || '',
    distantForce: _getMatrixEl('dossierDistantForce')?.value || '',
    fortifications,
    queuedRolls: Array.isArray(crusadeState.queuedRolls) ? crusadeState.queuedRolls : [],
    hordeBattleStats: isHordeModeDossier(modeNode) ? (crusadeState.attachedHordeStats || null) : null,
    logisticsSummary: typeof buildLogisticsSummaryLine === 'function'
      ? buildLogisticsSummaryLine()
      : _matrixCore.formatLogisticsSummaryLine(crusadeState, _resolveMatrixCatalogs().logisticsCategories),
    tombSummary: buildTombMatrixSummaryLine(),
    votannSummary: buildVotannSummaryLine()
  };
}

function buildMasterDossierString() {
  return compileMasterDossier(readMasterDossierFormInputs());
}

function updateMasterDossierPreview() {
  if (typeof document === 'undefined') return;
  updateDistantForceVisibility();
  const modeNode = _getMatrixEl('dossierModeNode')?.value || '';
  if (modeNode && !isHordeModeDossier(modeNode) && crusadeState.attachedHordeStats) {
    crusadeState.attachedHordeStats = null;
  }
  renderHordeStatsAttachmentCard();

  const box = _getMatrixEl('masterDossierPreviewBox');
  const chan = _getMatrixEl('dossierChannel')?.value || 'alpha';
  const profile = _matrixCore.DOSSIER_CHANNEL_PROFILES[chan] || _matrixCore.DOSSIER_CHANNEL_PROFILES.alpha;
  if (box) {
    box.textContent = buildMasterDossierString();
    if (box.classList && typeof box.classList.toggle === 'function') {
      box.classList.toggle('vox-preview-beta', !!profile.previewBeta);
      box.classList.toggle('vox-preview-alpha', !profile.previewBeta);
    }
  }
  saveCrusadeState();
}

function transmitMasterBattleDossier() {
  const chanVal = _getMatrixEl('dossierChannel')?.value || 'alpha';
  const profile = _matrixCore.DOSSIER_CHANNEL_PROFILES[chanVal];
  const targetChan = profile ? profile.targetVoxChannel : (chanVal.startsWith('augur_') ? chanVal.replace('augur_', '') : chanVal);
  const payload = buildMasterDossierString();
  _getMatrixVox()?.transmitToVox?.(targetChan, payload);
}

function _resolveCrusadeStorageKey() {
  if (typeof CRUSADE_STATE_KEY !== 'undefined') return CRUSADE_STATE_KEY;
  if (typeof window !== 'undefined' && window.CRUSADE_STATE_KEY) return window.CRUSADE_STATE_KEY;
  return _matrixData.CRUSADE_STATE_KEY || 'foa_crusade_quartermaster_v1';
}

function saveCrusadeState() {
  if (typeof document !== 'undefined') {
    ['dossierDistantForce', 'dossierChannel', 'dossierModeNode'].forEach((id) => {
      const el = _getMatrixEl(id);
      if (el) crusadeState[id] = el.value;
    });
  }
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(_resolveCrusadeStorageKey(), JSON.stringify(crusadeState));
    }
  } catch (_) {}
}

function initCrusadePage() {
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(_resolveCrusadeStorageKey()) : null;
    if (raw) {
      Object.assign(crusadeState, _matrixCore.hydrateCrusadeState(crusadeState, JSON.parse(raw)));
    }
  } catch (_) {}

  ['dossierChannel', 'dossierModeNode', 'dossierDistantForce'].forEach((id) => {
    const el = _getMatrixEl(id);
    if (el && crusadeState[id]) el.value = crusadeState[id];
  });

  [
    'alphaSP', 'alphaCP', 'alphaCacheCount', 'betaSP', 'betaCP', 'betaCacheCount',
    'hordeSP', 'hordeCP', 'tourBattlesRem', 'tourWinsRem', 'commendationPts',
    'toursCompletedCount', 'tombAgendasCompleted', 'tombAwakeningCycles'
  ].forEach((k) => {
    const el = _getMatrixEl(k);
    if (el && typeof crusadeState[k] === 'number') el.textContent = String(crusadeState[k]);
  });

  if (typeof switchCrusadeTab === 'function') switchCrusadeTab(crusadeState.activeTab || 'board', false);
  if (typeof selectAllianceTree === 'function') selectAllianceTree(crusadeState.selectedTree || 'Gatebreakers', false);
  if (typeof renderLogisticsAllocator === 'function') renderLogisticsAllocator();
  if (typeof populateCommendationVault === 'function') populateCommendationVault();
  renderTombAwakeningMatrix();
  populateNecronDynasticVault();
  renderVotannTab();
  populateVotannVault();
  if (typeof renderQueuedRolls === 'function') renderQueuedRolls();
  renderHordeStatsAttachmentCard();
  updateMasterDossierPreview();
  if (typeof updateStartOfTourPreview === 'function') updateStartOfTourPreview();
  updateTombAwakeningPreview();
  updateVotannDispatchPreview();
}

function importHordeBattleStatsToCrusade() {
  const modeEl = _getMatrixEl('dossierModeNode');
  const currentMode = modeEl ? modeEl.value : (crusadeState.dossierModeNode || 'Mode 1: Co-op Horde Breach // Node 0 (Golgotha Arbor-Basin)');
  if (!isHordeModeDossier(currentMode)) {
    if (typeof alert === 'function') {
      alert("Horde Mode Battle Telemetry can only be imported when reporting a Mode 1 Horde Mode battle.\nSelect a Mode 1 Horde Breach option in 'Mode & Sector Node Fought' first!");
    }
    return false;
  }

  const loader = typeof loadHordeBattleStats === 'function' ? loadHordeBattleStats : _loadHordeBattleStats;
  const stats = loader ? loader() : null;
  if (!stats) {
    if (typeof alert === 'function') {
      alert("No saved Horde Mode Battle Telemetry found in local memory.\nPlay a match in Spawner / Mode 1 and click 'Export to Crusade' first!");
    }
    return false;
  }

  crusadeState.attachedHordeStats = stats;
  const patch = _matrixCore.deriveHordeTelemetryImportPatch(stats, currentMode);

  if (patch.secretCode) {
    const secCodeInput = _getMatrixEl('dossierSecretCode');
    if (secCodeInput) secCodeInput.value = patch.secretCode;
  }
  if (patch.upgradedSoloModeNode && modeEl) {
    modeEl.value = patch.upgradedSoloModeNode;
  }
  if (typeof document !== 'undefined' && Array.isArray(stats.fortifications)) {
    Object.entries(patch.fortifications).forEach(([id, checked]) => {
      const el = _getMatrixEl(id);
      if (el) el.checked = checked;
    });
  }
  const leftoverEl = _getMatrixEl('dossierLeftoverSp');
  if (leftoverEl) leftoverEl.value = patch.leftoverSpOption;

  _getMatrixVox()?.playPowerSurge?.();
  saveCrusadeState();
  renderHordeStatsAttachmentCard();
  updateMasterDossierPreview();
  return true;
}

function detachHordeBattleStatsFromCrusade() {
  crusadeState.attachedHordeStats = null;
  _getMatrixVox()?.playClank?.('card');
  saveCrusadeState();
  renderHordeStatsAttachmentCard();
  updateMasterDossierPreview();
}

function renderHordeStatsAttachmentCard() {
  if (typeof document === 'undefined') return;
  const card = _getMatrixEl('hordeStatsAttachCard');
  if (!card) return;

  const modeEl = _getMatrixEl('dossierModeNode');
  const currentMode = modeEl ? modeEl.value : (crusadeState.dossierModeNode || 'Mode 1: Co-op Horde Breach // Node 0 (Golgotha Arbor-Basin)');
  if (!isHordeModeDossier(currentMode)) {
    if (card.style) {
      card.style.display = 'none';
      card.style.borderColor = 'rgba(255,255,255,0.08)';
      card.style.background = '#0b0d13';
    }
    card.innerHTML = `<div style="font-size:0.82rem; color:var(--muted);">Horde Battle Telemetry import is only available when reporting a Mode 1 Horde Mode battle.</div>`;
    return;
  }

  if (card.style) card.style.display = 'block';
  const stats = crusadeState.attachedHordeStats;
  if (!stats) {
    const loader = typeof loadHordeBattleStats === 'function' ? loadHordeBattleStats : _loadHordeBattleStats;
    const hasSaved = loader && loader() !== null;
    if (card.style) {
      card.style.borderColor = 'rgba(255,255,255,0.15)';
      card.style.background = '#0b0d13';
    }
    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
        <div>
          <span class="hud-label" style="display:block; color:var(--muted);">ATTACHED HORDE BATTLE TELEMETRY</span>
          <span style="font-size:0.84rem; color:#94a3b8;">No Horde Battle Telemetry attached to this dossier.</span>
        </div>
        <button type="button" class="btn-gold btn-sm" onclick="importHordeBattleStatsToCrusade()">📥 Import Latest Horde Battle Stats</button>
      </div>
      ${hasSaved ? '<div style="margin-top:6px; font-size:0.75rem; color:var(--green);">⚡ Saved battle telemetry detected in local cogitator memory.</div>' : ''}
    `;
    return;
  }

  const kills = stats.hordeKills || 0;
  const misCount = Array.isArray(stats.miseriesDrawn) ? stats.miseriesDrawn.length : 0;
  const secComp = Array.isArray(stats.secondariesCompleted) ? stats.secondariesCompleted.length : 0;
  const secFail = Array.isArray(stats.secondariesFailed) ? stats.secondariesFailed.length : 0;
  if (card.style) {
    card.style.borderColor = 'var(--gold)';
    card.style.background = 'rgba(217,119,6,0.08)';
  }
  card.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:6px;">
      <div style="display:flex; align-items:center; gap:8px;">
        <span class="badge gold">📎 TELEMETRY ATTACHED</span>
        <strong style="color:#fff; font-size:0.9rem;">${stats.hordeFaction || 'Horde Enemy'} (${stats.gameMode || 'CO-OP'})</strong>
      </div>
      <div style="display:flex; gap:6px;">
        <button type="button" class="btn-ghost btn-sm" onclick="importHordeBattleStatsToCrusade()" title="Re-sync latest stats">🔄 Re-sync</button>
        <button type="button" class="btn-red btn-sm" onclick="detachHordeBattleStatsFromCrusade()" title="Remove attached stats">✕ Detach</button>
      </div>
    </div>
    <div style="font-size:0.82rem; color:#e2e8f0; line-height:1.4;">
      💀 <strong>${kills}</strong> Units Slain • 📜 <strong>${misCount}</strong> Miseries • 🎯 <strong>${secComp}</strong> Secondaries Won / <strong>${secFail}</strong> Failed • ⚡ <strong>${stats.spEarned || 0}</strong> SP Earned / <strong>${stats.spSpent || 0}</strong> Spent
    </div>
  `;
}

const crusadeExports = {
  adjTombField, togglePowerReserves, adjTombSystemPt, rollMasterSystemReset,
  renderTombAwakeningMatrix, populateNecronDynasticVault, renderSelectedNecronVaultPreview,
  attachNecronVaultToDossier, buildTombMatrixSummaryLine, compileTombAwakeningDossier,
  buildTombAwakeningDossierString, updateTombAwakeningPreview, transmitTombAwakeningDossier,
  resetTombAwakeningTab, ensureVotannState, adjVotannRes, adjVotannRare,
  rollVotannPostBattleHarvest, rollVotannRareResourceCheck, syncVotannExpeditionSelectors,
  adjVotannExpField, cycleVotannAssetState, populateVotannVault,
  renderSelectedVotannVaultPreview, attachVotannVaultToDossier, renderVotannTab,
  buildVotannSummaryLine, compileVotannDispatch, updateVotannDispatchPreview,
  transmitVotannDispatch, resetMasterDossierForm, updateDistantForceVisibility,
  isHordeModeDossier, compileMasterDossier, readMasterDossierFormInputs, buildMasterDossierString,
  updateMasterDossierPreview, transmitMasterBattleDossier, saveCrusadeState,
  initCrusadePage, importHordeBattleStatsToCrusade, detachHordeBattleStatsFromCrusade,
  renderHordeStatsAttachmentCard
};

if (typeof window !== 'undefined') {
  Object.assign(window, crusadeExports);
  window.addEventListener('DOMContentLoaded', initCrusadePage);
  window.addEventListener('vox:page-swapped', () => {
    if (document.getElementById('cruTabBoard')) initCrusadePage();
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = crusadeExports;
}
````
