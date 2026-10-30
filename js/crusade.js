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
  if (typeof crusadeState === 'undefined') {
    try {
      const forge = require('./crusade-forge.js');
      if (forge && forge.crusadeState) {
        global.crusadeState = forge.crusadeState;
      }
    } catch (e) {}
  }
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
  const el = typeof document !== 'undefined' ? document.getElementById(field) : null;
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
  const cb = typeof document !== 'undefined' ? document.getElementById('powerReservesToggle') : null;
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
  const cycEl = typeof document !== 'undefined' ? document.getElementById('tombAwakeningCycles') : null;
  if (cycEl) cycEl.textContent = String(crusadeState.tombAwakeningCycles);
  const noticeEl = typeof document !== 'undefined' ? document.getElementById('tombResetNotice') : null;
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
  if (typeof document === 'undefined') return;
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
    notes: (typeof document !== 'undefined' ? document.getElementById('tombAwakeningNotes')?.value : '') || ''
  });
}

function updateTombAwakeningPreview() {
  if (typeof document === 'undefined') return;
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
  if (typeof document !== 'undefined') {
    const txtIds = { tombAgendasCompleted: '0', tombAwakeningCycles: '0', necronRecipientUnit: '', tombAwakeningNotes: '' };
    Object.entries(txtIds).forEach(([id, val]) => { const el = document.getElementById(id); if (el) { if ('value' in el) el.value = val; else el.textContent = val; } });
    const reservesEl = document.getElementById('powerReservesToggle');
    if (reservesEl) reservesEl.checked = false;
    const noticeEl = document.getElementById('tombResetNotice');
    if (noticeEl) noticeEl.innerHTML = 'Allocate 3/3 pts to unlock Master System abilities';
  }
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
      expBattles: 0, expWins: 0, expeditionsCompleted: 0,
      goalProgress: 0,
      expTotals: { rawMinerals: 0, biomatter: 0, energySources: 0, galacticIntel: 0, rare: 0 },
      assets: {}
    };
  }
  if (crusadeState.votann.goalProgress === undefined) {
    crusadeState.votann.goalProgress = 0;
  }
  if (!crusadeState.votann.expTotals) {
    crusadeState.votann.expTotals = { rawMinerals: 0, biomatter: 0, energySources: 0, galacticIntel: 0, rare: 0 };
  }
  return crusadeState.votann;
}

function adjVotannRes(key, delta) {
  const v = ensureVotannState();
  v[key] = Math.max(0, (v[key] || 0) + delta);
  if (delta > 0) {
    v.expTotals = v.expTotals || { rawMinerals: 0, biomatter: 0, energySources: 0, galacticIntel: 0, rare: 0 };
    v.expTotals[key] = (v.expTotals[key] || 0) + delta;
  }
  renderVotannTab();
  if (typeof updateMasterDossierPreview === 'function') updateMasterDossierPreview();
  if (typeof saveCrusadeState === 'function') saveCrusadeState();
}

function adjVotannRare(key, delta) {
  const v = ensureVotannState();
  if (!v.rare) v.rare = { rawMinerals: 0, biomatter: 0, energySources: 0, galacticIntel: 0 };
  v.rare[key] = Math.max(0, (v.rare[key] || 0) + delta);
  if (delta > 0) {
    v.expTotals = v.expTotals || { rawMinerals: 0, biomatter: 0, energySources: 0, galacticIntel: 0, rare: 0 };
    v.expTotals.rare = (v.expTotals.rare || 0) + delta;
  }
  renderVotannTab();
  if (typeof updateMasterDossierPreview === 'function') updateMasterDossierPreview();
  if (typeof saveCrusadeState === 'function') saveCrusadeState();
}

function rollVotannPostBattleHarvest() {
  if (typeof window !== 'undefined' && window.VoxAudio) window.VoxAudio.playDiceClatter();
  const v = ensureVotannState();
  const mult = parseFloat((typeof document !== 'undefined' ? document.getElementById('votHarvestSizeSelect')?.value : '') || '1');
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
  v.expTotals = v.expTotals || { rawMinerals: 0, biomatter: 0, energySources: 0, galacticIntel: 0, rare: 0 };
  v.expTotals[picked[0]] = (v.expTotals[picked[0]] || 0) + amt;

  let bioBonus = '';
  if (picked[0] !== 'biomatter' && (v.assets.biorecyc === 'Active' || v.assets.biorecyc === 'Upgraded')) {
    v.biomatter = (v.biomatter || 0) + 20;
    v.expTotals.biomatter = (v.expTotals.biomatter || 0) + 20;
    bioBonus = ' (+20 Biomatter from Biorecyc Fabricator)';
  }
  const notice = typeof document !== 'undefined' ? document.getElementById('votHarvestNotice') : null;
  if (notice) notice.innerHTML = `<strong style="color:var(--gold);">Rolled D6=${typeRoll}: +${amt} ${picked[1]}${bioBonus}!</strong>`;
  renderVotannTab();
  if (typeof saveCrusadeState === 'function') saveCrusadeState();
}

function rollVotannRareResourceCheck() {
  if (typeof window !== 'undefined' && window.VoxAudio) window.VoxAudio.playDiceClatter();
  const v = ensureVotannState();
  if (!v.rare) v.rare = { rawMinerals: 0, biomatter: 0, energySources: 0, galacticIntel: 0 };
  const d6 = Math.floor(Math.random() * 6) + 1;
  const notice = typeof document !== 'undefined' ? document.getElementById('votHarvestNotice') : null;
  if (d6 === 6) {
    v.rare.rawMinerals = (v.rare.rawMinerals || 0) + 1;
    v.expTotals = v.expTotals || { rawMinerals: 0, biomatter: 0, energySources: 0, galacticIntel: 0, rare: 0 };
    v.expTotals.rare = (v.expTotals.rare || 0) + 1;
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
    v.goalProgress = 0;
    v.expTotals = { rawMinerals: 0, biomatter: 0, energySources: 0, galacticIntel: 0, rare: 0 };
  } else if (field === 'goalProgress') {
    v.goalProgress = Math.min(3, Math.max(0, (v.goalProgress || 0) + delta));
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
  if (typeof document === 'undefined') return;
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

  const gp = Math.min(3, Math.max(0, v.goalProgress || 0));
  const gpLabel = document.getElementById('votGoalProgressLabel');
  if (gpLabel) gpLabel.textContent = `${gp} / 3`;
  const gpPips = document.getElementById('votGoalPips');
  if (gpPips) {
    gpPips.innerHTML = [0, 1, 2].map(i => i < gp ? '🟡' : '⚪').join(' ');
  }

  const expTot = v.expTotals || { rawMinerals: 0, biomatter: 0, energySources: 0, galacticIntel: 0, rare: 0 };
  const expTotEl = document.getElementById('votExpTotalsDisplay');
  if (expTotEl) {
    expTotEl.textContent = `Minerals: ${expTot.rawMinerals || 0} | Biomatter: ${expTot.biomatter || 0} | Energy: ${expTot.energySources || 0} | Intel: ${expTot.galacticIntel || 0}${expTot.rare ? ` | Rare: ${expTot.rare}` : ''}`;
  }

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
  const tot = v.expTotals || {};
  return `Charter: ${v.expBacking || 'Lean'} (${v.expBattles || 0} Battles, ${v.expWins || 0} Wins, Goal: ${v.goalProgress || 0}/3) | Exp Total: M:${tot.rawMinerals || 0} B:${tot.biomatter || 0} E:${tot.energySources || 0} I:${tot.galacticIntel || 0} | Vault: M:${v.rawMinerals || 0} B:${v.biomatter || 0} E:${v.energySources || 0} I:${v.galacticIntel || 0} (Rare: M:${r.rawMinerals || 0}, B:${r.biomatter || 0}, E:${r.energySources || 0}, I:${r.galacticIntel || 0})`;
}

function compileVotannDispatch(input = {}) {
  const v = input.votann || ensureVotannState();
  const activeAssets = Object.entries(v.assets || {})
    .filter(([, st]) => st === 'Active' || st === 'Upgraded')
    .map(([k, st]) => `${k} (${st})`).join(', ') || 'None yet';
  const notes = (input.notes || (typeof document !== 'undefined' && document.getElementById('votannDispatchNotes')?.value) || '').trim();
  const lines = [
    `+++ THRYMKÂL SALVAGE CONSORTIUM // BLACK-LEDGER EXPEDITION & ACQUISITIONS DISPATCH +++`,
    `• REPORTING WARLORD: KÂHL HÂRKYN // THE LEDGER OF EMBERS (1,200 PTS)`,
    `• EXPEDITION CHARTER: ${v.expBacking} | Progress: ${v.expBattles} Battles (${v.expWins} Wins)`,
    `• EXPEDITION GOAL: ${v.expGoal}`,
    `• GOAL CONDITION TRACKER: ${v.goalProgress || 0} / 3`,
    `• GUILD CONTRACT: ${v.expContract}`,
    `• EXPEDITION TOTAL (CURRENT RUN): Minerals: ${v.expTotals?.rawMinerals || 0} | Biomatter: ${v.expTotals?.biomatter || 0} | Energy: ${v.expTotals?.energySources || 0} | Intel: ${v.expTotals?.galacticIntel || 0}`,
    `• FUNDAMENTAL VAULT: Raw Minerals: ${v.rawMinerals} | Biomatter: ${v.biomatter} | Energy Sources: ${v.energySources} | Galactic Intel: ${v.galacticIntel}`,
    `• RARE RESOURCE VAULT: Minerals: ${v.rare?.rawMinerals || 0} | Biomatter: ${v.rare?.biomatter || 0} | Energy: ${v.rare?.energySources || 0} | Intel: ${v.rare?.galacticIntel || 0}`,
    `• ACTIVE KINDRED ASSETS: ${activeAssets}`
  ];
  if (notes) lines.push(`• CLAIM-RECKONER FIELD LOG: "${notes}"`);
  lines.push(
    `------------------------------------------------`,
    `DIRECTIVE FOR FANE-NODE VÔL-09 ("THE DEAF EAR"): Inscribe this Black-Ledger resource tally and Expedition progress into the deep-core Ancestor Vault without alerting Geostationary Zenith-09!`
  );
  return lines.join('\n');
}

function updateVotannDispatchPreview() {
  const box = document.getElementById('votannDispatchPreviewBox');
  if (box) box.textContent = compileVotannDispatch();
}

function transmitVotannDispatch() {
  const payload = compileVotannDispatch();
  if (typeof window !== 'undefined' && window.VoxAudio && typeof window.VoxAudio.transmitToVox === 'function') {
    window.VoxAudio.transmitToVox('gamma', payload);
  }
}

/**
 * Resets all Crusade Master Battle Dossier form fields, checkboxes, and attached
 * unit progression rolls back to their clean default state.
 */
function resetMasterDossierForm() {
  const vals = {
    dossierChannel: 'alpha', dossierModeNode: 'Mode 1: Co-op Horde Breach // Node 0 (Golgotha Arbor-Basin)',
    dossierOutcome: 'Survived Round 6 Final Stand & Completed Secret Objective (+5 SPts)',
    dossierSecretCode: '', dossierSecretTag: 'Action / Relic Tag (Free Battle Trait, Weapon Mod, or Relic)',
    dossierLeftoverSp: '0 Leftover SP', dossierBattleNotes: '', dossierDistantForce: ''
  };
  Object.entries(vals).forEach(([id, val]) => { const el = document.getElementById(id); if (el) el.value = val; });
  ['fortHosp', 'fortAmmo', 'fortTrench', 'fortFob'].forEach(id => { const el = document.getElementById(id); if (el) el.checked = false; });
  crusadeState.queuedRolls = [];
  crusadeState.dossierDistantForce = '';
  crusadeState.dossierChannel = 'alpha';
  crusadeState.attachedHordeStats = null;
  if (typeof renderHordeStatsAttachmentCard === 'function') renderHordeStatsAttachmentCard();
  if (typeof window !== 'undefined' && window.VoxAudio && typeof window.VoxAudio.playClank === 'function') window.VoxAudio.playClank('card');
  if (typeof renderQueuedRolls === 'function') renderQueuedRolls();
  updateMasterDossierPreview();
  saveCrusadeState();
}

/**
 * Toggles the visibility of the Distant Engaged Force field based on whether
 * an Orbital Augur conduit or a Distant Solo Horde mode is currently selected.
 */
function updateDistantForceVisibility() {
  const chan = document.getElementById('dossierChannel')?.value || 'alpha';
  const mode = document.getElementById('dossierModeNode')?.value || '';
  const isDistant = chan.startsWith('augur_') || /distant solo horde|augur telemetry|augur intercept/i.test(mode);
  const row = document.getElementById('dossierDistantForceRow');
  if (row) {
    row.style.display = isDistant ? 'block' : 'none';
  }
}

/**
 * Pure predicate: determines whether the selected engagement mode in the
 * Master Battle Dossier represents a Mode 1 Horde Mode battle.
 *
 * @param {string} [modeNode] - Mode & Sector Node string from #dossierModeNode.
 * @returns {boolean} True only if the engagement is a Horde Mode battle.
 */
function isHordeModeDossier(modeNode) {
  const mode = String(modeNode || '').trim();
  if (!mode) return false;
  if (/mode\s*2|1v1|pvp/i.test(mode)) return false;
  return /mode\s*1|horde/i.test(mode);
}

/**
 * Pure functional core: compiles the Master Post-Battle Dossier string from a plain data
 * object. Supports standard Player 1 / Player 2 engagements as well as Distant Solo Horde
 * Orbital Augur Telemetry where neither main player was fielded.
 *
 * @param {object} [input={}] - Plain Master Battle Dossier inputs.
 * @returns {string} Formatted teletype dossier payload for Astropathic Vox transmission.
 */
function compileMasterDossier(input = {}) {
  const chan = input.channel || 'alpha';
  const modeNode = input.modeNode || '';
  const outcome = input.outcome || '';
  const secCode = (input.secretCode || 'N/A').trim().toUpperCase();
  const secTag = input.secretTag || 'None';
  const leftover = input.leftoverSp || '0 Leftover SP';
  const notes = (input.battleNotes || 'Battle concluded. Awaiting Campaign Master chronicle.').trim();
  const forts = Array.isArray(input.fortifications) ? input.fortifications : [];
  const fortStr = forts.length > 0 ? forts.join(', ') : 'None';
  const queuedRolls = Array.isArray(input.queuedRolls) ? input.queuedRolls : [];
  const distantForce = (input.distantForce || '').trim();

  const isDistantAugur = chan.startsWith('augur_') || /distant solo horde|augur telemetry|augur intercept/i.test(modeNode);
  const allowHordeStats = modeNode ? isHordeModeDossier(modeNode) : true;

  const unitLines = queuedRolls.length > 0
    ? queuedRolls.map((q, i) =>
        `  ${i + 1}. [${q.unit}] → ${q.category}: ${q.name} (${q.roll})\n     • Battlefield Context: "${q.context}"`
      ).join('\n')
    : '  • None attached this battle.';

  if (isDistantAugur) {
    const scanningVessel = (chan === 'augur_beta' || chan === 'beta')
      ? 'LORD COMMANDER JUNEBUG'
      : 'THE EXILE // SANCTUARY OF ASH';
    const forceName = distantForce || 'Unspecified Distant Auxiliary Detachment';

    const lines = [
      `+++ MASTER POST-BATTLE DOSSIER // ORBITAL AUGUR TELEMETRY +++`,
      `• SCANNING SENSOR ARRAY: ORBITAL AUGUR ARRAY (Relayed via ${scanningVessel})`,
      `• ENGAGED FORCES (IN THE DISTANCE): ${forceName} (Neither Main Player Fielded)`,
      `• ENGAGEMENT CLASSIFICATION: ${modeNode}`,
      `• OUTCOME & SURVIVAL: ${outcome}`,
      `• SECRET OBJECTIVE CODE: [${secCode}] // TAG: ${secTag}`,
      `• EXTRACTED FORTIFICATIONS: ${fortStr}`,
      `• LEFTOVER SP SALVAGE: ${leftover}`,
      `• STRATEGIC POINTS & ALLIANCE IMPACT: Zero Alliance SPt Shift (Off-Roster Narrative Telemetry)`,
      `• TOUR OF DUTY IMPACT: Zero Quota Deduction (Neither Main Player Fielded)`
    ];

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
