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
