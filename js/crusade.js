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
        : _compileHordeBattleStatsDossierSection;
      const statsSection = compiler ? compiler(input.hordeBattleStats) : '';
      if (statsSection) {
        lines.push(statsSection);
      }
    }

    lines.push(
      `------------------------------------------------`,
      `• OBSERVED REMOTE UNIT UPGRADES, RELICS & BATTLE SCARS ("STORIES IN THE ASH-STORM"):`,
      unitLines,
      `------------------------------------------------`,
      `• ORBITAL AUGUR AFTER-ACTION LOG: "${notes}"`,
      `------------------------------------------------`,
      `REQUEST FOR CAMPAIGN MASTER: Please emit an Astropathic Vox Decree logging this distant solo horde breach caught in the distance by our orbital augurs. As neither main player participated, no Alliance SPts are shifted—please chronicle the narrative fate of this remote detachment and christen custom in-universe Lore Names & Backstories for their attached unit Upgrades, Relics, and Battle Scars!`
    );
    return lines.join('\n');
  }

  const isBeta = chan === 'beta';
  const isGamma = chan === 'gamma';
  const headerLine = isBeta ? `+++ DYNASTIC ENGRAM-CHRONICLE // MASTER POST-BATTLE DOSSIER & AWAKENING LOG +++`
    : (isGamma ? `+++ THRYMKÂL SALVAGE CONSORTIUM // MASTER POST-BATTLE DOSSIER & BLACK-LEDGER REPORT +++`
      : `+++ DEPARTMENTO MUNITORUM // MASTER POST-BATTLE DOSSIER & HONOUR SCROLL +++`);
  const cmdrLabel = isBeta ? `PHAERON JUNEBUG // TOMB-SHIP COMMAND INTERLINK (NECRONS)`
    : (isGamma ? `KÂHL HÂRKYN // THE LEDGER OF EMBERS (THRYMKÂL SALVAGE CONSORTIUM)`
      : `THE EXILE // THE SANCTUARY OF ASH (ASTRA MILITARUM — 044TH KRIEG)`);
  const upgradeSectionTitle = isBeta ? `[2. CRYPTEK CONCLAVE // DYNASTIC EPITHETS, RELICS & ENGRAMMATIC FLAWS]:`
    : (isGamma ? `[2. BRÔKHYR GUILD-COUNCIL // BATTLE HONOURS, RELICS & SCARS]:`
      : `[2. QUARTERMASTER ROLLS // BATTLE HONOURS, RELICS & SCARS]:`);
  const closingRequest = isBeta ? `REQUEST FOR TOMB-SHIP MASTER MATRIX & CRYPTEK CONCLAVE: Please inscribe this engagement into the Blackstone Engram-Chronicles (Pattern 2), allocate any earned Tomb World Awakening Points or Marauder/Alliance Hegemony spoils, and bestow permanent Dynastic Epithets upon the upgraded phalanxes above!`
    : (isGamma ? `REQUEST FOR FANE-NODE VÔL-09 ("THE DEAF EAR"): Inscribe this Black-Ledger post-battle record into the deep-core Ancestor Vault, register all asset yields and contract rewards, and christen our upgraded Kin with permanent Kindred honours!`
      : `REQUEST FOR CAMPAIGN MASTER (LOGIS-PREFECT VANE): Please audit this after-action dossier (Pattern 2), credit our Alliance & Sector Hegemony spoils in the orbital ledger, and christen the upgraded units and scars above with permanent Munitorum lore titles!`);

  const lines = [
    headerLine,
    `• REPORTING COMMANDER: ${cmdrLabel}`,
    `• ENGAGEMENT & SECTOR NODE: ${modeNode}`,
    `• OUTCOME & SURVIVAL: ${outcome}`,
    `• SECRET OBJECTIVE CODE: [${secCode}] // TAG: ${secTag}`,
    `• EXTRACTED FORTIFICATIONS: ${fortStr}`,
    `• LEFTOVER SP SALVAGE: ${leftover}`
  ];

  if (isBeta) {
    const tombSummary = input.tombSummary || (typeof buildTombMatrixSummaryLine === 'function' ? buildTombMatrixSummaryLine() : '');
    if (tombSummary) lines.push(`• TOMB WORLD AWAKENING MATRIX TELEMETRY: ${tombSummary}`);
  } else if (isGamma) {
    const votSummary = input.votannSummary || (typeof buildVotannSummaryLine === 'function' ? buildVotannSummaryLine() : '');
    if (votSummary) lines.push(`• KINDRED EXPEDITION & RESOURCE VAULT TELEMETRY: ${votSummary}`);
  } else {
    const logSummary = input.logisticsSummary || (typeof buildLogisticsSummaryLine === 'function' ? buildLogisticsSummaryLine() : '');
    if (logSummary) lines.push(`• TOUR OF DUTY & LOGISTICS TELEMETRY: ${logSummary}`);
  }

  if (allowHordeStats && input.hordeBattleStats) {
    const compiler = (typeof compileHordeBattleStatsDossierSection === 'function')
      ? compileHordeBattleStatsDossierSection
      : _compileHordeBattleStatsDossierSection;
    const statsSection = compiler ? compiler(input.hordeBattleStats) : '';
    if (statsSection) {
      lines.push(statsSection);
    }
  }

  lines.push(
    `------------------------------------------------`,
    upgradeSectionTitle,
    unitLines,
    `------------------------------------------------`,
    `• COMMANDER'S AFTER-ACTION LOG: "${notes}"`,
    `------------------------------------------------`,
    closingRequest
  );

  return lines.join('\n');
}

/**
 * Humble View (Dumb UI) input reader: extracts current Master Dossier form fields
 * from the DOM into a plain data object.
 *
 * @returns {object} Plain input snapshot for compileMasterDossier.
 */
function readMasterDossierFormInputs() {
  const forts = [];
  if (document.getElementById('fortHosp')?.checked) forts.push('Field Hospital (Auto-Pass OOA)');
  if (document.getElementById('fortAmmo')?.checked) forts.push('Ammo Dump (Free Weapon Mod)');
  if (document.getElementById('fortTrench')?.checked) forts.push('War Trench (+1 XP Infantry)');
  if (document.getElementById('fortFob')?.checked) forts.push('FOB (+1 SPt & +1 Hegemony)');

  const modeNode = document.getElementById('dossierModeNode')?.value || '';
  const isHorde = isHordeModeDossier(modeNode);

  return {
    channel: document.getElementById('dossierChannel')?.value || 'alpha',
    modeNode,
    outcome: document.getElementById('dossierOutcome')?.value || '',
    secretCode: document.getElementById('dossierSecretCode')?.value || '',
    secretTag: document.getElementById('dossierSecretTag')?.value || '',
    leftoverSp: document.getElementById('dossierLeftoverSp')?.value || '0 Leftover SP',
    battleNotes: document.getElementById('dossierBattleNotes')?.value || '',
    distantForce: document.getElementById('dossierDistantForce')?.value || '',
    fortifications: forts,
    queuedRolls: Array.isArray(crusadeState.queuedRolls) ? crusadeState.queuedRolls : [],
    hordeBattleStats: isHorde ? (crusadeState.attachedHordeStats || null) : null,
    logisticsSummary: typeof buildLogisticsSummaryLine === 'function' ? buildLogisticsSummaryLine() : null,
    tombSummary: typeof buildTombMatrixSummaryLine === 'function' ? buildTombMatrixSummaryLine() : null,
    votannSummary: typeof buildVotannSummaryLine === 'function' ? buildVotannSummaryLine() : null
  };
}

/**
 * Compiles the Master Post-Battle & Unit Progression Dossier string for Mode 1 (Horde)
 * and Mode 2 (1v1 PvP) Crusade engagements, delegating to the pure compileMasterDossier core.
 *
 * @returns {string} Formatted teletype dossier payload for Astropathic Vox transmission.
 */
function buildMasterDossierString() {
  return compileMasterDossier(readMasterDossierFormInputs());
}

function updateMasterDossierPreview() {
  if (typeof document === 'undefined') return;
  updateDistantForceVisibility();
  const modeNode = document.getElementById('dossierModeNode')?.value || '';
  if (modeNode && !isHordeModeDossier(modeNode) && crusadeState.attachedHordeStats) {
    crusadeState.attachedHordeStats = null;
  }
  renderHordeStatsAttachmentCard();
  const box = document.getElementById('masterDossierPreviewBox');
  const chan = document.getElementById('dossierChannel')?.value || 'alpha';
  if (box) {
    box.textContent = buildMasterDossierString();
    if (box.classList && typeof box.classList.toggle === 'function') {
      box.classList.toggle('vox-preview-beta', chan === 'beta' || chan === 'augur_beta');
      box.classList.toggle('vox-preview-alpha', chan !== 'beta' && chan !== 'augur_beta');
    }
  }
  saveCrusadeState();
}

function transmitMasterBattleDossier() {
  const chanVal = document.getElementById('dossierChannel')?.value || 'alpha';
  const targetChan = chanVal.startsWith('augur_') ? chanVal.replace('augur_', '') : chanVal;
  const payload = buildMasterDossierString();
  if (typeof window !== 'undefined' && window.VoxAudio && typeof window.VoxAudio.transmitToVox === 'function') {
    window.VoxAudio.transmitToVox(targetChan, payload);
  }
}

function saveCrusadeState() {
  if (typeof document !== 'undefined') {
    ['dossierDistantForce', 'dossierChannel', 'dossierModeNode'].forEach(id => {
      const el = document.getElementById(id);
      if (el) crusadeState[id] = el.value;
    });
  }
  try {
    if (typeof localStorage !== 'undefined') {
      const stateKey = (typeof CRUSADE_STATE_KEY !== 'undefined') ? CRUSADE_STATE_KEY : (typeof window !== 'undefined' ? window.CRUSADE_STATE_KEY : 'foa_crusade_quartermaster_v1');
      localStorage.setItem(stateKey, JSON.stringify(crusadeState));
    }
  } catch (e) {}
}

function initCrusadePage() {
  try {
    const stateKey = (typeof CRUSADE_STATE_KEY !== 'undefined') ? CRUSADE_STATE_KEY : (typeof window !== 'undefined' ? window.CRUSADE_STATE_KEY : 'foa_crusade_quartermaster_v1');
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(stateKey) : null;
    if (raw) crusadeState = Object.assign(crusadeState, JSON.parse(raw));
  } catch (e) {}

  ['dossierChannel', 'dossierModeNode', 'dossierDistantForce'].forEach(id => {
    const el = document.getElementById(id);
    if (el && crusadeState[id]) el.value = crusadeState[id];
  });

  ['alphaSP', 'alphaCP', 'alphaCacheCount', 'betaSP', 'betaCP', 'betaCacheCount', 'hordeSP', 'hordeCP', 'tourBattlesRem', 'tourWinsRem', 'commendationPts', 'toursCompletedCount', 'tombAgendasCompleted', 'tombAwakeningCycles'].forEach(k => {
    const el = document.getElementById(k);
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

/**
 * Imports the latest saved Horde Battle Stats from localStorage into Crusade state
 * and automatically pre-fills matching form fields (secret objective, fortifications,
 * leftover SP, and mode). Only permitted when reporting a Mode 1 Horde Mode battle.
 *
 * @returns {boolean} True if telemetry was imported, false if blocked or unavailable.
 */
function importHordeBattleStatsToCrusade() {
  const modeEl = typeof document !== 'undefined' ? document.getElementById('dossierModeNode') : null;
  const currentMode = modeEl ? modeEl.value : (crusadeState.dossierModeNode || 'Mode 1: Co-op Horde Breach // Node 0 (Golgotha Arbor-Basin)');
  if (!isHordeModeDossier(currentMode)) {
    if (typeof alert === 'function') {
      alert("Horde Mode Battle Telemetry can only be imported when reporting a Mode 1 Horde Mode battle.\nSelect a Mode 1 Horde Breach option in 'Mode & Sector Node Fought' first!");
    }
    return false;
  }

  const loader = (typeof loadHordeBattleStats === 'function') ? loadHordeBattleStats : _loadHordeBattleStats;
  const stats = loader ? loader() : null;
  if (!stats) {
    if (typeof alert === 'function') {
      alert("No saved Horde Mode Battle Telemetry found in local memory.\nPlay a match in Spawner / Mode 1 and click 'Export to Crusade' first!");
    }
    return false;
  }
  crusadeState.attachedHordeStats = stats;

  if (stats.secretObjective && stats.secretObjective.code) {
    const secCodeInput = typeof document !== 'undefined' ? document.getElementById('dossierSecretCode') : null;
    if (secCodeInput) secCodeInput.value = stats.secretObjective.code;
  }
  if (stats.gameMode === 'SOLO') {
    if (modeEl && !modeEl.value.includes('Solo')) {
      modeEl.value = 'Mode 1: Solo Horde Breach // Node 0 (Golgotha Arbor-Basin)';
    }
  }

  if (Array.isArray(stats.fortifications) && typeof document !== 'undefined') {
    const fortList = stats.fortifications.map(f => String(f).toLowerCase());
    const fortHosp = document.getElementById('fortHosp');
    if (fortHosp) fortHosp.checked = fortList.some(f => f.includes('hospital'));
    const fortAmmo = document.getElementById('fortAmmo');
    if (fortAmmo) fortAmmo.checked = fortList.some(f => f.includes('ammo'));
    const fortTrench = document.getElementById('fortTrench');
    if (fortTrench) fortTrench.checked = fortList.some(f => f.includes('trench'));
    const fortFob = document.getElementById('fortFob');
    if (fortFob) fortFob.checked = fortList.some(f => f.includes('fob') || f.includes('forward operating'));
  }

  const leftoverVal = Number(stats.leftoverSp) || 0;
  const leftoverEl = typeof document !== 'undefined' ? document.getElementById('dossierLeftoverSp') : null;
  if (leftoverEl) {
    if (leftoverVal >= 8) leftoverEl.value = '8 Leftover SP → +1 RP or +100 pts Supply Limit';
    else if (leftoverVal >= 5) leftoverEl.value = '5 Leftover SP → +2 XP to Surviving Unit';
    else if (leftoverVal >= 3) leftoverEl.value = '3 Leftover SP → Bank 1v1 Supply Cache Token';
    else if (leftoverVal >= 2) leftoverEl.value = '2 Leftover SP → Orbital Auspex Recon Probe (Reveal Adjacent Node)';
    else leftoverEl.value = '0 Leftover SP';
  }

  if (typeof window !== 'undefined' && window.VoxAudio && typeof window.VoxAudio.playPowerSurge === 'function') {
    window.VoxAudio.playPowerSurge();
  }

  saveCrusadeState();
  renderHordeStatsAttachmentCard();
  updateMasterDossierPreview();
  return true;
}

/**
 * Detaches the currently attached Horde Battle Stats from Crusade state.
 */
function detachHordeBattleStatsFromCrusade() {
  crusadeState.attachedHordeStats = null;
  if (typeof window !== 'undefined' && window.VoxAudio && typeof window.VoxAudio.playClank === 'function') {
    window.VoxAudio.playClank('card');
  }
  saveCrusadeState();
  renderHordeStatsAttachmentCard();
  updateMasterDossierPreview();
}

/**
 * Dumb UI renderer for the Attached Horde Battle Stats card.
 * Hides the card and disables importing when the selected battle mode is not Horde Mode.
 */
function renderHordeStatsAttachmentCard() {
  if (typeof document === 'undefined') return;
  const card = document.getElementById('hordeStatsAttachCard');
  if (!card) return;

  const modeEl = document.getElementById('dossierModeNode');
  const currentMode = modeEl ? modeEl.value : (crusadeState.dossierModeNode || 'Mode 1: Co-op Horde Breach // Node 0 (Golgotha Arbor-Basin)');
  if (!isHordeModeDossier(currentMode)) {
    if (card.style) {
      card.style.display = 'none';
      card.style.borderColor = 'rgba(255,255,255,0.08)';
      card.style.background = '#0b0d13';
    }
    card.innerHTML = `
      <div style="font-size:0.82rem; color:var(--muted);">
        Horde Battle Telemetry import is only available when reporting a Mode 1 Horde Mode battle.
      </div>
    `;
    return;
  }

  if (card.style) {
    card.style.display = 'block';
  }

  const stats = crusadeState.attachedHordeStats;
  if (!stats) {
    const hasSaved = (typeof loadHordeBattleStats === 'function') && loadHordeBattleStats() !== null;
    card.style.borderColor = 'rgba(255,255,255,0.15)';
    card.style.background = '#0b0d13';
    card.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
        <div>
          <span class="hud-label" style="display:block; color:var(--muted);">ATTACHED HORDE BATTLE TELEMETRY</span>
          <span style="font-size:0.84rem; color:#94a3b8;">No Horde Battle Telemetry attached to this dossier.</span>
        </div>
        <button type="button" class="btn-gold btn-sm" onclick="importHordeBattleStatsToCrusade()">
          📥 Import Latest Horde Battle Stats
        </button>
      </div>
      ${hasSaved ? '<div style="margin-top:6px; font-size:0.75rem; color:var(--green);">⚡ Saved battle telemetry detected in local cogitator memory.</div>' : ''}
    `;
    return;
  }

  const kills = stats.hordeKills || 0;
  const misCount = Array.isArray(stats.miseriesDrawn) ? stats.miseriesDrawn.length : 0;
  const secComp = Array.isArray(stats.secondariesCompleted) ? stats.secondariesCompleted.length : 0;
  const secFail = Array.isArray(stats.secondariesFailed) ? stats.secondariesFailed.length : 0;
  const faction = stats.hordeFaction || 'Horde Enemy';
  const mode = stats.gameMode || 'CO-OP';

  card.style.borderColor = 'var(--gold)';
  card.style.background = 'rgba(217,119,6,0.08)';
  card.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:6px;">
      <div style="display:flex; align-items:center; gap:8px;">
        <span class="badge gold">📎 TELEMETRY ATTACHED</span>
        <strong style="color:#fff; font-size:0.9rem;">${faction} (${mode})</strong>
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
