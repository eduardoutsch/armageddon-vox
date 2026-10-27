# 📦 Fires of Armageddon // Bundle: Mode 5 - Crusade Quartermaster Matrix (Part 1)

Crusade tab orchestration, 3-way score tracking, tour quotas, and state persistence (`js/crusade.js`).

## 📑 Table of Contents
- [js/crusade.js (Part 1: State & Tabs)](#file-jscrusadejspart1statetabs)

---

## File: `js/crusade.js (Part 1: State & Tabs)` <a id="file-jscrusadejspart1statetabs"></a>

````javascript
/**
 * Fires of Armageddon // Crusade Command & Master Dossier Engine
 * Handles Tab 4 (Necrons Tomb World Awakening Matrix & Dynastic Vault),
 * Master Post-Battle Dossier compilation & Astropathic Vox transmissions,
 * and page lifecycle persistence.
 */

let _compileHordeBattleStatsDossierSection = typeof compileHordeBattleStatsDossierSection === 'function' ? compileHordeBattleStatsDossierSection : null;
let _loadHordeBattleStats = typeof loadHordeBattleStats === 'function' ? loadHordeBattleStats : null;
if (typeof require === 'function') {
  try {
    const hStats = require('./horde-battle-stats.js');
    if (hStats?.compileHordeBattleStatsDossierSection) _compileHordeBattleStatsDossierSection = hStats.compileHordeBattleStatsDossierSection;
    if (hStats?.loadHordeBattleStats) _loadHordeBattleStats = hStats.loadHordeBattleStats;
  } catch (e) {}
}

/**
 * Adjusts numeric Tomb World Awakening counters (tombAgendasCompleted, tombAwakeningCycles),
 * clamping at zero and synchronizing previews and storage.
 *
 * @param {string} field - State key to adjust.
 * @param {number} delta - Signed increment or decrement.
 */
function adjTombField(field, delta) {
  crusadeState[field] = Math.max(0, (crusadeState[field] || 0) + delta);
  const el = document.getElementById(field);
  if (el) el.textContent = String(crusadeState[field]);
  updateMasterDossierPreview();
  updateTombAwakeningPreview();
  saveCrusadeState();
}

/**
 * Toggles the Power Reserves Allocated Requisition (1 RP), expanding the Tomb World
 * Awakening Matrix capacity from 3 points to 4 points.
 */
function togglePowerReserves() {
  const cb = document.getElementById('powerReservesToggle');
  crusadeState.powerReservesAllocated = !!(cb && cb.checked);
  renderTombAwakeningMatrix();
  updateMasterDossierPreview();
  updateTombAwakeningPreview();
  saveCrusadeState();
}

/**
 * Allocates or deallocates an Awakening Point in one of the three Tomb World Systems
 * (command, reanimation, translocation), enforcing per-system [0..3] bounds and
 * total Tomb Matrix capacity (3 standard, 4 with Power Reserves Allocated).
 *
 * @param {string} sysKey - System key ('command' | 'reanimation' | 'translocation').
 * @param {number} delta - Signed point adjustment (+1 or -1).
 */
function adjTombSystemPt(sysKey, delta) {
  if (!crusadeState.tombSystems) {
    crusadeState.tombSystems = { command: 1, reanimation: 1, translocation: 0 };
  }
  const maxTotal = crusadeState.powerReservesAllocated ? 4 : 3;
  const currentTotal = Object.values(crusadeState.tombSystems).reduce((a, b) => a + b, 0);
  const currVal = crusadeState.tombSystems[sysKey] || 0;
  const nextVal = currVal + delta;

  if (nextVal < 0 || nextVal > 3) return;
  if (delta > 0 && currentTotal >= maxTotal) return;

  crusadeState.tombSystems[sysKey] = nextVal;
  if (typeof window !== 'undefined' && window.VoxAudio) window.VoxAudio.playClank('card');
  renderTombAwakeningMatrix();
  updateMasterDossierPreview();
  updateTombAwakeningPreview();
  saveCrusadeState();
}

/**
 * Rolls 1D3 when a Necron Master System Ability is expended in battle, unassigning
 * that many Awakening Points across the active Tomb World Systems and incrementing
 * the Awakening Cycles counter.
 */
function rollMasterSystemReset() {
  if (typeof window !== 'undefined' && window.VoxAudio) window.VoxAudio.playDiceClatter();
  if (!crusadeState.tombSystems) {
    crusadeState.tombSystems = { command: 1, reanimation: 1, translocation: 0 };
  }
  const d3 = Math.floor(Math.random() * 3) + 1;
  let toDeduct = d3;
  const order = ['translocation', 'reanimation', 'command'];
  for (const key of order) {
    while (toDeduct > 0 && (crusadeState.tombSystems[key] || 0) > 0) {
      crusadeState.tombSystems[key] -= 1;
      toDeduct -= 1;
    }
  }
  crusadeState.tombAwakeningCycles = (crusadeState.tombAwakeningCycles || 0) + 1;
  const cycEl = document.getElementById('tombAwakeningCycles');
  if (cycEl) cycEl.textContent = String(crusadeState.tombAwakeningCycles);
  const noticeEl = document.getElementById('tombResetNotice');
  if (noticeEl) {
    noticeEl.innerHTML = `<strong style="color:var(--red);">Master System Surge! Rolled D3 = −${d3} Awakening Pt(s) Reset!</strong>`;
  }

  renderTombAwakeningMatrix();
  updateMasterDossierPreview();
  updateTombAwakeningPreview();
  saveCrusadeState();

  setTimeout(() => {
    if (typeof window !== 'undefined' && window.VoxAudio) window.VoxAudio.playScarHazard();
  }, 240);
}

/**
 * Idempotently renders the 3 Tomb World Awakening Systems (Command, Reanimation,
 * Translocation) and updates Master System status indicators in Tab 4.
 */
function renderTombAwakeningMatrix() {
  const grid = document.getElementById('tombMatrixGrid');
  const label = document.getElementById('tombMatrixAllocatedLabel');
  const statusEl = document.getElementById('tombMasterStatusVal');
  const cb = document.getElementById('powerReservesToggle');

  if (!crusadeState.tombSystems) {
    crusadeState.tombSystems = { command: 1, reanimation: 1, translocation: 0 };
  }
  if (cb) cb.checked = !!crusadeState.powerReservesAllocated;

  const maxTotal = crusadeState.powerReservesAllocated ? 4 : 3;
  const currentTotal = Object.values(crusadeState.tombSystems).reduce((a, b) => a + b, 0);
  if (label) label.textContent = `${currentTotal} / ${maxTotal}`;

  const masterUnlocked = currentTotal >= 3;
  if (statusEl) {
    if (masterUnlocked) {
      statusEl.textContent = `🟢 MASTER ONLINE (${currentTotal} / ${maxTotal} PTS)`;
      if (statusEl.style) statusEl.style.color = 'var(--green)';
    } else if (currentTotal > 0) {
      statusEl.textContent = `🟡 AWAKENING (${currentTotal} / ${maxTotal} PTS)`;
      if (statusEl.style) statusEl.style.color = 'var(--gold)';
    } else {
      statusEl.textContent = `🔴 DORMANT STASIS (0 / ${maxTotal} PTS)`;
      if (statusEl.style) statusEl.style.color = 'var(--red)';
    }
  }

  if (!grid) return;

  const systems = (typeof TOMB_WORLD_SYSTEMS !== 'undefined') ? TOMB_WORLD_SYSTEMS : (typeof window !== 'undefined' ? window.TOMB_WORLD_SYSTEMS : []);
  grid.innerHTML = systems.map(sys => {
    const pts = crusadeState.tombSystems[sys.key] || 0;
    const sysMasterActive = masterUnlocked && pts >= 1;
    const stateClass = pts >= 2 || sysMasterActive ? 'state-surplus' : (pts === 0 ? 'state-deficiency' : '');
    const badgeHtml = pts === 3
      ? `<span class="rule-tag" style="border-color:var(--green); color:var(--green);">🟢 MAX TIER 3 (3 PTS)</span>`
      : (pts > 0
        ? `<span class="rule-tag" style="border-color:var(--blue); color:var(--blue);">⚡ TIER ${pts} ONLINE (${pts} PT${pts === 1 ? '' : 'S'})</span>`
        : `<span class="rule-tag" style="border-color:var(--red); color:var(--red);">🔴 DORMANT (0 PTS)</span>`);

    const tiersHtml = sys.tiers.map((t, idx) => {
      const unlocked = pts >= idx + 1;
      const color = unlocked ? 'var(--green)' : 'var(--muted)';
      const icon = unlocked ? '✓' : '🔒';
      return `<div style="color:${color}; margin-bottom:4px;">${icon} ${t}</div>`;
    }).join('');

    const masterColor = sysMasterActive ? '#d8b4fe' : 'var(--muted)';
    const masterPrefix = sysMasterActive ? '🟢 UNLOCKED — ' : '🔒 REQUIRES 3/3 MATRIX + 1 PT HERE — ';

    return `
      <div class="logistics-card ${stateClass}">
        <div style="display:flex; flex-direction:column; align-items:center; text-align:center; gap:6px; margin-bottom:8px;"><strong style="color:#fff; font-size:0.9rem;">${sys.title}</strong>${badgeHtml}</div>
        <div class="hud-val-row" style="margin-bottom:8px;"><button type="button" class="mini-btn" onclick="adjTombSystemPt('${sys.key}', -1)">−</button><span class="hud-num" style="color:var(--green); font-size:1.2rem;">${pts} / 3 PTS</span><button type="button" class="mini-btn" onclick="adjTombSystemPt('${sys.key}', 1)">+</button></div>
        <div style="font-size:0.77rem; color:var(--gold); margin-bottom:6px;">${sys.agenda}</div>
        <div style="font-size:0.79rem; line-height:1.42; margin-bottom:6px;">${tiersHtml}</div>
        <div style="font-size:0.78rem; line-height:1.4; color:${masterColor}; border-top:1px solid var(--border); padding-top:6px;"><strong>${masterPrefix}</strong>${sys.master}</div>
      </div>`;
  }).join('');
}

/**
 * Populates the Necron Dynastic Requisitions, Awakening Agendas & Master Protocols selector.
 */
function populateNecronDynasticVault() {
  const sel = document.getElementById('necronVaultSelect');
  if (!sel) return;
  const vault = (typeof NECRON_DYNASTIC_VAULT !== 'undefined') ? NECRON_DYNASTIC_VAULT : (typeof window !== 'undefined' ? window.NECRON_DYNASTIC_VAULT : []);
  sel.innerHTML = vault.map(item =>
    `<option value="${item.id}">${item.name} — [${item.type}]</option>`
  ).join('');
  renderSelectedNecronVaultPreview();
}

/**
 * Renders the currently selected Necron Dynastic Vault entry in #necronVaultPreviewBox.
 */
function renderSelectedNecronVaultPreview() {
  const sel = document.getElementById('necronVaultSelect');
  const box = document.getElementById('necronVaultPreviewBox');
  if (!sel || !box) return;
  const vault = (typeof NECRON_DYNASTIC_VAULT !== 'undefined') ? NECRON_DYNASTIC_VAULT : (typeof window !== 'undefined' ? window.NECRON_DYNASTIC_VAULT : []);
  const pick = vault.find(item => item.id === sel.value) || vault[0];
  if (!pick) return;
  box.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:6px;">
      <strong style="color:#fff; font-size:0.94rem;">${pick.name}</strong>
      <span class="dice-pip-badge" style="background:var(--green); color:#000; margin-right:0; font-size:0.76rem;">${pick.type}</span>
    </div>
    <div style="font-size:0.84rem; color:var(--text);">${pick.desc}</div>
  `;
}

/**
 * Attaches the selected Necron Dynastic Requisition, Awakening Agenda, or Master System
 * Protocol to the Master Battle Dossier queue and switches to Tab 2.
 */
function attachNecronVaultToDossier() {
  const sel = document.getElementById('necronVaultSelect');
  if (!sel) return;
  const vault = (typeof NECRON_DYNASTIC_VAULT !== 'undefined') ? NECRON_DYNASTIC_VAULT : (typeof window !== 'undefined' ? window.NECRON_DYNASTIC_VAULT : []);
  const pick = vault.find(item => item.id === sel.value) || vault[0];
  const unitName = (document.getElementById('necronRecipientUnit')?.value || 'Hypercrypt Phalanx').trim();

  crusadeState.queuedRolls.push({
    unit: unitName,
    context: `Activated via Tomb World Awakening Matrix (${pick.type})`,
    category: pick.type,
    roll: `Tomb World Protocol`,
    name: pick.name,
    desc: pick.desc
  });

  if (typeof window !== 'undefined' && window.VoxAudio) window.VoxAudio.playRelicChoir();
  if (typeof renderQueuedRolls === 'function') renderQueuedRolls();
  updateMasterDossierPreview();
  saveCrusadeState();
  if (typeof switchCrusadeTab === 'function') switchCrusadeTab('forge');
}

/**
 * Builds a concise single-line summary of the Necron Tomb World Awakening Matrix state.
 *
 * @returns {string} Formatted Tomb World Matrix telemetry summary line.
 */
function buildTombMatrixSummaryLine() {
  const sys = crusadeState.tombSystems || { command: 1, reanimation: 1, translocation: 0 };
  const maxTotal = crusadeState.powerReservesAllocated ? 4 : 3;
  const total = (sys.command || 0) + (sys.reanimation || 0) + (sys.translocation || 0);
  const masterStr = total >= 3 ? 'MASTER ONLINE' : (total > 0 ? 'AWAKENING' : 'DORMANT');
  return `Allocated: ${total}/${maxTotal} Pts (Command: ${sys.command || 0}, Reanimation: ${sys.reanimation || 0}, Translocation: ${sys.translocation || 0}) | Status: [${masterStr}] | Agendas Logged: ${crusadeState.tombAgendasCompleted || 0} | Awakening Cycles: ${crusadeState.tombAwakeningCycles || 0}`;
}

/**
 * Pure functional core: compiles the Tomb World Awakening Matrix Dispatch string.
 *
 * @param {object} [input={}] - Plain Tomb World Awakening state snapshot.
 * @returns {string} Formatted Astropathic dispatch string for Commander Beta.
 */
function compileTombAwakeningDossier(input = {}) {
  const sys = input.tombSystems || (typeof crusadeState !== 'undefined' ? crusadeState.tombSystems : {}) || {};
  const cmd = sys.command || 0;
  const reanim = sys.reanimation || 0;
  const trans = sys.translocation || 0;
  const allocatedPts = (typeof input.allocatedPts === 'number') ? input.allocatedPts : (cmd + reanim + trans);
  const maxPts = (input.powerReservesAllocated || (typeof crusadeState !== 'undefined' && crusadeState.powerReservesAllocated)) ? 4 : 3;

  const cmdSystemStatus = cmd > 0 ? `ACTIVE (${cmd} Pt${cmd > 1 ? 's' : ''})` : 'INACTIVE (0 Pts)';
  const reanimSystemStatus = reanim > 0 ? `ACTIVE (${reanim} Pt${reanim > 1 ? 's' : ''})` : 'INACTIVE (0 Pts)';
  const transSystemStatus = trans > 0 ? `ACTIVE (${trans} Pt${trans > 1 ? 's' : ''})` : 'INACTIVE (0 Pts)';
  const allThreeAllocated = allocatedPts >= 3;
  const notes = (input.notes || (typeof document !== 'undefined' && document.getElementById('tombAwakeningNotes')?.value) || '').trim();

  const lines = [
    `+++ TOMB-SHIP MASTER MATRIX // TOMB WORLD AWAKENING & SYSTEM ALLOCATION DISPATCH +++`,
    `• REPORTING PHAERON: LORD COMMANDER JUNEBUG // TOMB-SHIP INTERLINK`,
    `• AWAKENING POINTS ALLOCATED: ${allocatedPts} / ${maxPts} Awakening Points Active`,
    `• COMMAND SYSTEM (SUBJUGATION DECREE): ${cmdSystemStatus}`,
    `• REANIMATION SYSTEM (IMMORTAL SERVITUDE): ${reanimSystemStatus}`,
    `• TRANSLOCATION SYSTEM (RELENTLESS EXPANSION): ${transSystemStatus}`,
    `• MASTER SYSTEM STATUS: ${allThreeAllocated ? 'ONLINE (1D3 Power Drain Ready)' : 'DORMANT (Requires 3/3 Points)'}`
  ];

  if (notes) {
    lines.push(`• CRYPTEK CONCLAVE DIRECTIVE: "${notes}"`);
  }

  lines.push(
    `------------------------------------------------`,
    `REQUEST FOR TOMB-SHIP MASTER MATRIX & CRYPTEK CONCLAVE: Please lock these Dynastic Awakening System power allocations into our Tomb-Ship hypercircuits and confirm our active Master System protocols!`
  );

  return lines.join('\n');
}

function buildTombAwakeningDossierString() {
  return compileTombAwakeningDossier({
    tombAgendasCompleted: crusadeState.tombAgendasCompleted || 0,
    tombAwakeningCycles: crusadeState.tombAwakeningCycles || 0,
    powerReservesAllocated: !!crusadeState.powerReservesAllocated,
    tombSystems: crusadeState.tombSystems,
    notes: document.getElementById('tombAwakeningNotes')?.value || ''
  });
}

function updateTombAwakeningPreview() {
  const box = document.getElementById('tombAwakeningPreviewBox');
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
  if (typeof window !== 'undefined' && window.VoxAudio && typeof window.VoxAudio.transmitToVox === 'function') {
    window.VoxAudio.transmitToVox('beta', payload);
  }
}

/**
 * Resets all Tomb World Awakening Matrix counters, system point allocations,
 * Power Reserves requisition checkbox, and dispatch notes on Tab 4 back to clean defaults.
 */
function resetTombAwakeningTab() {
  crusadeState.tombAgendasCompleted = 0;
  crusadeState.tombAwakeningCycles = 0;
  crusadeState.powerReservesAllocated = false;
  crusadeState.tombSystems = { command: 0, reanimation: 0, translocation: 0 };
  const txtIds = { tombAgendasCompleted: '0', tombAwakeningCycles: '0', necronRecipientUnit: '', tombAwakeningNotes: '' };
  Object.entries(txtIds).forEach(([id, val]) => { const el = document.getElementById(id); if (el) { if ('value' in el) el.value = val; else el.textContent = val; } });
  const reservesEl = document.getElementById('powerReservesToggle');
  if (reservesEl) reservesEl.checked = false;
  const noticeEl = document.getElementById('tombResetNotice');
  if (noticeEl) noticeEl.innerHTML = 'Allocate 3/3 pts to unlock Master System abilities';
  if (typeof window !== 'undefined' && window.VoxAudio && typeof window.VoxAudio.playClank === 'function') window.VoxAudio.playClank('card');
  renderTombAwakeningMatrix();
  updateMasterDossierPreview();
  updateTombAwakeningPreview();
  saveCrusadeState();
}

// --- TAB 5: LEAGUES OF VOTANN EXPEDITIONS & GUILD CONTRACTS ---
function ensureVotannState() {
  if (!crusadeState.votann) {
    crusadeState.votann = {
      rawMinerals: 0, biomatter: 0, energySources: 0, galacticIntel: 0,
      rare: { rawMinerals: 0, biomatter: 0, energySources: 0, galacticIntel: 0 },
      expBacking: 'Lean Operation (Free // Max 5 Battles)',
      expGoal: 'Farstryd Exploration (Prospecting 2+ XP in 3+ Battles → +3 XP Character & 1 Free Mining Outpost)',
      expContract: 'Mining — Extraction: Minerals (60+ Raw Minerals → +1 Rare Raw Mineral)',
      expBattles: 0, expWins: 0, expeditionsCompleted: 0, assets: {}
    };
  }
  return crusadeState.votann;
}

function adjVotannRes(key, delta) {
  const v = ensureVotannState();
  v[key] = Math.max(0, (v[key] || 0) + delta);
  renderVotannTab();
  if (typeof updateMasterDossierPreview === 'function') updateMasterDossierPreview();
  if (typeof saveCrusadeState === 'function') saveCrusadeState();
}

function adjVotannRare(key, delta) {
  const v = ensureVotannState();
  if (!v.rare) v.rare = { rawMinerals: 0, biomatter: 0, energySources: 0, galacticIntel: 0 };
  v.rare[key] = Math.max(0, (v.rare[key] || 0) + delta);
  renderVotannTab();
  if (typeof updateMasterDossierPreview === 'function') updateMasterDossierPreview();
  if (typeof saveCrusadeState === 'function') saveCrusadeState();
}

function rollVotannPostBattleHarvest() {
  if (typeof window !== 'undefined' && window.VoxAudio) window.VoxAudio.playDiceClatter();
  const v = ensureVotannState();
  const mult = parseFloat(document.getElementById('votHarvestSizeSelect')?.value || '1');
  const typeRoll = Math.floor(Math.random() * 6) + 1;
  const d6Amt = Math.floor(Math.random() * 6) + 1 + (mult === 2 ? Math.floor(Math.random() * 6) + 1 : 0);
  let amt = mult === 0.5 ? d6Amt * 5 : d6Amt * 10;
  const map = { 1: ['rawMinerals', 'Raw Minerals'], 2: ['biomatter', 'Biomatter'], 3: ['energySources', 'Energy Sources'], 4: ['galacticIntel', 'Galactic Intel'] };
  const picked = map[typeRoll] || ['rawMinerals', 'Choice Resource (Defaulted to Raw Minerals)'];
  if (picked[0] === 'rawMinerals') {
    ['outpost1', 'outpost2', 'outpost3'].forEach(k => {
      if (v.assets[k] === 'Active') amt += 20;
      if (v.assets[k] === 'Upgraded') amt += 30;
    });
  }
  v[picked[0]] = (v[picked[0]] || 0) + amt;
  let bioBonus = '';
  if (picked[0] !== 'biomatter' && (v.assets.biorecyc === 'Active' || v.assets.biorecyc === 'Upgraded')) {
    v.biomatter = (v.biomatter || 0) + 20;
    bioBonus = ' (+20 Biomatter from Biorecyc Fabricator)';
  }
  const notice = document.getElementById('votHarvestNotice');
  if (notice) notice.innerHTML = `<strong style="color:var(--gold);">Rolled D6=${typeRoll}: +${amt} ${picked[1]}${bioBonus}!</strong>`;
  renderVotannTab();
  if (typeof saveCrusadeState === 'function') saveCrusadeState();
}

function rollVotannRareResourceCheck() {
  if (typeof window !== 'undefined' && window.VoxAudio) window.VoxAudio.playDiceClatter();
  const v = ensureVotannState();
  if (!v.rare) v.rare = { rawMinerals: 0, biomatter: 0, energySources: 0, galacticIntel: 0 };
  const d6 = Math.floor(Math.random() * 6) + 1;
  const notice = document.getElementById('votHarvestNotice');
  if (d6 === 6) {
    v.rare.rawMinerals = (v.rare.rawMinerals || 0) + 1;
    if (notice) notice.innerHTML = `<strong style="color:var(--green);">D6 = 6! Unearthed +1 Rare Resource!</strong>`;
  } else {
    if (notice) notice.innerHTML = `<span style="color:var(--muted);">Victory Rare Roll: D6 = ${d6} (Requires 6+).</span>`;
  }
  renderVotannTab();
  if (typeof saveCrusadeState === 'function') saveCrusadeState();
}

function syncVotannExpeditionSelectors() {
  const v = ensureVotannState();
  v.expBacking = document.getElementById('votExpBacking')?.value || v.expBacking;
  v.expGoal = document.getElementById('votExpGoal')?.value || v.expGoal;
  v.expContract = document.getElementById('votExpContract')?.value || v.expContract;
  renderVotannTab();
  if (typeof saveCrusadeState === 'function') saveCrusadeState();
}

function adjVotannExpField(field, delta) {
  const v = ensureVotannState();
  if (field === 'expeditionsCompleted') {
    v.expeditionsCompleted = Math.max(0, (v.expeditionsCompleted || 0) + delta);
    v.expBattles = 0;
    v.expWins = 0;
  } else {
    v[field] = Math.max(0, (v[field] || 0) + delta);
  }
  renderVotannTab();
  if (typeof saveCrusadeState === 'function') saveCrusadeState();
}

function cycleVotannAssetState(key) {
  const v = ensureVotannState();
  const states = ['Locked', 'Active', 'Upgraded', 'Inactive'];
  const curr = v.assets[key] || 'Locked';
  v.assets[key] = states[(states.indexOf(curr) + 1) % states.length];
  renderVotannTab();
  if (typeof saveCrusadeState === 'function') saveCrusadeState();
}

function populateVotannVault() {
  const sel = document.getElementById('votannVaultSelect');
  if (!sel) return;
  const vault = (typeof VOTANN_VAULT_PROTOCOLS !== 'undefined') ? VOTANN_VAULT_PROTOCOLS : (typeof window !== 'undefined' ? window.VOTANN_VAULT_PROTOCOLS : []);
  sel.innerHTML = vault.map(i => `<option value="${i.id}">${i.name} — [${i.type}]</option>`).join('');
  renderSelectedVotannVaultPreview();
}

function renderSelectedVotannVaultPreview() {
  const sel = document.getElementById('votannVaultSelect');
  const box = document.getElementById('votannVaultPreviewBox');
  if (!sel || !box) return;
  const vault = (typeof VOTANN_VAULT_PROTOCOLS !== 'undefined') ? VOTANN_VAULT_PROTOCOLS : (typeof window !== 'undefined' ? window.VOTANN_VAULT_PROTOCOLS : []);
  const pick = vault.find(i => i.id === sel.value) || vault[0];
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
  const sel = document.getElementById('votannVaultSelect');
  if (!sel) return;
  const vault = (typeof VOTANN_VAULT_PROTOCOLS !== 'undefined') ? VOTANN_VAULT_PROTOCOLS : (typeof window !== 'undefined' ? window.VOTANN_VAULT_PROTOCOLS : []);
  const pick = vault.find(i => i.id === sel.value) || vault[0];
  const unitName = (document.getElementById('votannRecipientUnit')?.value || 'Needgaârd Oathband').trim();
  crusadeState.queuedRolls.push({
    unit: unitName,
    context: `Activated via Kindred Acquisitions Vault (${pick.type})`,
    category: pick.type,
    roll: 'Kindred Protocol',
    name: pick.name,
    desc: pick.desc
  });
  if (typeof window !== 'undefined' && window.VoxAudio) window.VoxAudio.playRelicChoir();
  if (typeof renderQueuedRolls === 'function') renderQueuedRolls();
  updateMasterDossierPreview();
  saveCrusadeState();
  if (typeof switchCrusadeTab === 'function') switchCrusadeTab('forge');
}

function renderVotannTab() {
  const v = ensureVotannState();
  ['rawMinerals', 'biomatter', 'energySources', 'galacticIntel'].forEach(k => {
    const rEl = document.getElementById('votRes_' + k);
    const rareEl = document.getElementById('votRare_' + k);
    if (rEl) rEl.textContent = String(v[k] || 0);
    if (rareEl) rareEl.textContent = String(v.rare?.[k] || 0);
  });
  const maxB = v.expBacking.includes('6') ? 6 : (v.expBacking.includes('7') ? 7 : 5);
  const bLbl = document.getElementById('votExpBattlesLabel');
  const wLbl = document.getElementById('votExpWinsLabel');
  if (bLbl) bLbl.textContent = `${v.expBattles || 0} / ${maxB}`;
  if (wLbl) wLbl.textContent = String(v.expWins || 0);

  const grid = document.getElementById('votannAssetsGrid');
  const assetsCatalog = (typeof VOTANN_KINDRED_ASSETS !== 'undefined') ? VOTANN_KINDRED_ASSETS : (typeof window !== 'undefined' ? window.VOTANN_KINDRED_ASSETS : []);
  let activeCount = 0;
  if (grid) {
    grid.innerHTML = (assetsCatalog || []).map(a => {
      const st = v.assets[a.key] || 'Locked';
      if (st === 'Active' || st === 'Upgraded') activeCount++;
      const badgeColor = st === 'Upgraded' ? 'var(--green)' : (st === 'Active' ? 'var(--gold)' : (st === 'Inactive' ? 'var(--red)' : 'var(--muted)'));
      return `
        <div class="logistics-card">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;"><strong style="color:#fff; font-size:0.88rem;">${a.title}</strong><button type="button" class="mini-btn" style="width:auto; padding:2px 8px; border-color:${badgeColor}; color:${badgeColor};" onclick="cycleVotannAssetState('${a.key}')">${st.toUpperCase()}</button></div>
          <div style="font-size:0.74rem; color:var(--muted); margin-bottom:4px;">Cost: ${a.cost} | Upg: ${a.upgCost}</div>
          <div style="font-size:0.79rem; color:var(--text);">${st === 'Upgraded' ? a.upgDesc : a.baseDesc}</div>
        </div>`;
    }).join('');
  }
  const cEl = document.getElementById('votActiveAssetsCount');
  if (cEl) cEl.textContent = String(activeCount);
  updateVotannDispatchPreview();
}

function buildVotannSummaryLine() {
  const v = ensureVotannState();
  const r = v.rare || {};
  return `Charter: ${v.expBacking || 'Lean'} (${v.expBattles || 0} Battles, ${v.expWins || 0} Wins) | Goal: ${v.expGoal || 'Farstryd'} | Vault: Minerals:${v.rawMinerals || 0} Biomatter:${v.biomatter || 0} Energy:${v.energySources || 0} Intel:${v.galacticIntel || 0} (Rare: M:${r.rawMinerals || 0}, B:${r.biomatter || 0}, E:${r.energySources || 0}, I:${r.galacticIntel || 0})`;
}

function compileVotannDispatch(input = {}) {
  const v = input.votann || ensureVotannState();
  const activeAssets = Object.entries(v.assets || {})
    .filter(([, st]) => st === 'Active' || st === 'Upgraded')
    .map(([k, st]) => `${k} (${st})`).join(', ') || 'None yet';
  const notes = (input.notes || (typeof document !== 'undefined' && document.getElementById('votannDispatchNotes')?.value) || '').trim();
  const lines = [
    `+++ THRYMKÂL SALVAGE CONSORTIUM // BLACK-LEDGER EXPEDITION & ACQUISITIONS DISPATCH +++`,
    `• REPORTING WARLORD: KÂHL HÂRKYN GRÎMLEDGER // THE LEDGER OF EMBERS (1,200 PTS)`,
    `• EXPEDITION CHARTER: ${v.expBacking} | Progress: ${v.expBattles} Battles (${v.expWins} Wins)`,
    `• EXPEDITION GOAL: ${v.expGoal}`,
    `• GUILD CONTRACT: ${v.expContract}`,
    `• FUNDAMENTAL VAULT: Raw Minerals: ${v.rawMinerals} | Biomatter: ${v.biomatter} | Energy Sources: ${v.energySources} | Galactic Intel: ${v.galacticIntel}`,
    `• RARE RESOURCE VAULT: Minerals: ${v.rare?.rawMinerals || 0} | Biomatter: ${v.rare?.biomatter || 0} | Energy: ${v.rare?.energySources || 0} | Intel: ${v.rare?.galacticIntel || 0}`,
    `• ACTIVE KINDRED ASSETS: ${activeAssets}`
  ];
````
