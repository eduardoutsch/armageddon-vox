# 📦 Fires of Armageddon // Bundle: Mode 5 - Crusade Quartermaster Matrix

Crusade tab orchestration, 3-way score tracking, tour quotas, and state persistence (`js/crusade.js`).

## 📑 Table of Contents
- [js/crusade.js](#file-jscrusadejs)

---

## File: `js/crusade.js` <a id="file-jscrusadejs"></a>

````javascript
/**
 * Fires of Armageddon // Crusade Command & Master Dossier Engine
 * Handles Tab 4 (Necrons Tomb World Awakening Matrix & Dynastic Vault),
 * Master Post-Battle Dossier compilation & Astropathic Vox transmissions,
 * and page lifecycle persistence.
 */

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
        <div style="display:flex; flex-direction:column; align-items:center; text-align:center; gap:6px; margin-bottom:8px;">
          <strong style="color:#fff; font-size:0.9rem;">${sys.title}</strong>
          ${badgeHtml}
        </div>
        <div class="hud-val-row" style="margin-bottom:8px;">
          <button type="button" class="mini-btn" onclick="adjTombSystemPt('${sys.key}', -1)">−</button>
          <span class="hud-num" style="color:var(--green); font-size:1.2rem;">${pts} / 3 PTS</span>
          <button type="button" class="mini-btn" onclick="adjTombSystemPt('${sys.key}', 1)">+</button>
        </div>
        <div style="font-size:0.77rem; color:var(--gold); margin-bottom:6px;">${sys.agenda}</div>
        <div style="font-size:0.79rem; line-height:1.42; margin-bottom:6px;">${tiersHtml}</div>
        <div style="font-size:0.78rem; line-height:1.4; color:${masterColor}; border-top:1px solid var(--border); padding-top:6px;">
          <strong>${masterPrefix}</strong>${sys.master}
        </div>
      </div>
    `;
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
  crusadeState.tombSystems = {
    command: 0,
    reanimation: 0,
    translocation: 0
  };

  const agendasEl = document.getElementById('tombAgendasCompleted');
  const cyclesEl = document.getElementById('tombAwakeningCycles');
  const reservesEl = document.getElementById('powerReservesToggle');
  const unitEl = document.getElementById('necronRecipientUnit');
  const notesEl = document.getElementById('tombAwakeningNotes');
  const noticeEl = document.getElementById('tombResetNotice');

  if (agendasEl) agendasEl.textContent = '0';
  if (cyclesEl) cyclesEl.textContent = '0';
  if (reservesEl) reservesEl.checked = false;
  if (unitEl) unitEl.value = '';
  if (notesEl) notesEl.value = '';
  if (noticeEl) noticeEl.innerHTML = 'Allocate 3/3 pts to unlock Master System abilities';

  if (typeof window !== 'undefined' && window.VoxAudio && typeof window.VoxAudio.playClank === 'function') {
    window.VoxAudio.playClank('card');
  }

  renderTombAwakeningMatrix();
  updateMasterDossierPreview();
  updateTombAwakeningPreview();
  saveCrusadeState();
}

/**
 * Resets all Crusade Master Battle Dossier form fields, checkboxes, and attached
 * unit progression rolls back to their clean default state.
 */
function resetMasterDossierForm() {
  const chanEl = document.getElementById('dossierChannel');
  const modeEl = document.getElementById('dossierModeNode');
  const outEl = document.getElementById('dossierOutcome');
  const secCodeEl = document.getElementById('dossierSecretCode');
  const secTagEl = document.getElementById('dossierSecretTag');
  const hospEl = document.getElementById('fortHosp');
  const ammoEl = document.getElementById('fortAmmo');
  const trenchEl = document.getElementById('fortTrench');
  const fobEl = document.getElementById('fortFob');
  const leftEl = document.getElementById('dossierLeftoverSp');
  const notesEl = document.getElementById('dossierBattleNotes');
  const distantForceEl = document.getElementById('dossierDistantForce');

  if (chanEl) chanEl.value = 'alpha';
  if (modeEl) modeEl.value = 'Mode 1: Co-op Horde Breach // Node 0 (Golgotha Arbor-Basin)';
  if (outEl) outEl.value = 'Survived Round 6 Final Stand & Completed Secret Objective (+5 SPts)';
  if (secCodeEl) secCodeEl.value = '';
  if (secTagEl) secTagEl.value = 'Action / Relic Tag (Free Battle Trait, Weapon Mod, or Relic)';
  if (hospEl) hospEl.checked = false;
  if (ammoEl) ammoEl.checked = false;
  if (trenchEl) trenchEl.checked = false;
  if (fobEl) fobEl.checked = false;
  if (leftEl) leftEl.value = '0 Leftover SP';
  if (notesEl) notesEl.value = '';
  if (distantForceEl) distantForceEl.value = '';

  crusadeState.queuedRolls = [];
  crusadeState.dossierDistantForce = '';
  crusadeState.dossierChannel = 'alpha';
  if (typeof window !== 'undefined' && window.VoxAudio && typeof window.VoxAudio.playClank === 'function') {
    window.VoxAudio.playClank('card');
  }
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
      `• TOUR OF DUTY IMPACT: Zero Quota Deduction (Neither Main Player Fielded)`,
      `------------------------------------------------`,
      `• OBSERVED REMOTE UNIT UPGRADES, RELICS & BATTLE SCARS ("STORIES IN THE ASH-STORM"):`,
      unitLines,
      `------------------------------------------------`,
      `• ORBITAL AUGUR AFTER-ACTION LOG: "${notes}"`,
      `------------------------------------------------`,
      `REQUEST FOR CAMPAIGN MASTER: Please emit an Astropathic Vox Decree logging this distant solo horde breach caught in the distance by our orbital augurs. As neither main player participated, no Alliance SPts are shifted—please chronicle the narrative fate of this remote detachment and christen custom in-universe Lore Names & Backstories for their attached unit Upgrades, Relics, and Battle Scars!`
    ];
    return lines.join('\n');
  }

  const isBeta = chan === 'beta';
  const headerLine = isBeta
    ? `+++ DYNASTIC ENGRAM-CHRONICLE // MASTER POST-BATTLE DOSSIER & AWAKENING LOG +++`
    : `+++ DEPARTMENTO MUNITORUM // MASTER POST-BATTLE DOSSIER & HONOUR SCROLL +++`;

  const cmdrLabel = isBeta
    ? `PHAERON JUNEBUG // TOMB-SHIP COMMAND INTERLINK (NECRONS)`
    : `THE EXILE // THE SANCTUARY OF ASH (ASTRA MILITARUM — 044TH KRIEG)`;

  const upgradeSectionTitle = isBeta
    ? `[2. CRYPTEK CONCLAVE // DYNASTIC EPITHETS, RELICS & ENGRAMMATIC FLAWS]:`
    : `[2. QUARTERMASTER ROLLS // BATTLE HONOURS, RELICS & SCARS]:`;

  const closingRequest = isBeta
    ? `REQUEST FOR TOMB-SHIP MASTER MATRIX & CRYPTEK CONCLAVE: Please inscribe this engagement into the Blackstone Engram-Chronicles (Pattern 2), allocate any earned Tomb World Awakening Points or Marauder/Alliance Hegemony spoils, and bestow permanent Dynastic Epithets upon the upgraded phalanxes above!`
    : `REQUEST FOR CAMPAIGN MASTER (LOGIS-PREFECT VANE): Please audit this after-action dossier (Pattern 2), credit our Alliance & Sector Hegemony spoils in the orbital ledger, and christen the upgraded units and scars above with permanent Munitorum lore titles!`;

  const lines = [
    headerLine,
    `• REPORTING COMMANDER: ${cmdrLabel}`,
    `• ENGAGEMENT & SECTOR NODE: ${modeNode}`,
    `• OUTCOME & SURVIVAL: ${outcome}`,
    `• SECRET OBJECTIVE CODE: [${secCode}] // TAG: ${secTag}`,
    `• EXTRACTED FORTIFICATIONS: ${fortStr}`,
    `• LEFTOVER SP SALVAGE: ${leftover}`
  ];

  if (!isBeta) {
    const logSummary = input.logisticsSummary || (typeof buildLogisticsSummaryLine === 'function' ? buildLogisticsSummaryLine() : '');
    if (logSummary) {
      lines.push(`• TOUR OF DUTY & LOGISTICS TELEMETRY: ${logSummary}`);
    }
  } else {
    const tombSummary = input.tombSummary || (typeof buildTombMatrixSummaryLine === 'function' ? buildTombMatrixSummaryLine() : '');
    if (tombSummary) {
      lines.push(`• TOMB WORLD AWAKENING MATRIX TELEMETRY: ${tombSummary}`);
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

  return {
    channel: document.getElementById('dossierChannel')?.value || 'alpha',
    modeNode: document.getElementById('dossierModeNode')?.value || '',
    outcome: document.getElementById('dossierOutcome')?.value || '',
    secretCode: document.getElementById('dossierSecretCode')?.value || '',
    secretTag: document.getElementById('dossierSecretTag')?.value || '',
    leftoverSp: document.getElementById('dossierLeftoverSp')?.value || '0 Leftover SP',
    battleNotes: document.getElementById('dossierBattleNotes')?.value || '',
    distantForce: document.getElementById('dossierDistantForce')?.value || '',
    fortifications: forts,
    queuedRolls: Array.isArray(crusadeState.queuedRolls) ? crusadeState.queuedRolls : [],
    logisticsSummary: typeof buildLogisticsSummaryLine === 'function' ? buildLogisticsSummaryLine() : null,
    tombSummary: typeof buildTombMatrixSummaryLine === 'function' ? buildTombMatrixSummaryLine() : null
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
  updateDistantForceVisibility();
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
  const distantForceEl = document.getElementById('dossierDistantForce');
  if (distantForceEl) {
    crusadeState.dossierDistantForce = distantForceEl.value;
  }
  const channelEl = document.getElementById('dossierChannel');
  if (channelEl) {
    crusadeState.dossierChannel = channelEl.value;
  }
  const modeNodeEl = document.getElementById('dossierModeNode');
  if (modeNodeEl) {
    crusadeState.dossierModeNode = modeNodeEl.value;
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
    if (raw) {
      const parsed = JSON.parse(raw);
      crusadeState = Object.assign(crusadeState, parsed);
    }
  } catch (e) {}

  if (crusadeState.dossierChannel) {
    const chanEl = document.getElementById('dossierChannel');
    if (chanEl) chanEl.value = crusadeState.dossierChannel;
  }
  if (crusadeState.dossierModeNode) {
    const modeEl = document.getElementById('dossierModeNode');
    if (modeEl) modeEl.value = crusadeState.dossierModeNode;
  }
  if (crusadeState.dossierDistantForce) {
    const distEl = document.getElementById('dossierDistantForce');
    if (distEl) distEl.value = crusadeState.dossierDistantForce;
  }

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
  if (typeof renderQueuedRolls === 'function') renderQueuedRolls();
  updateMasterDossierPreview();
  if (typeof updateStartOfTourPreview === 'function') updateStartOfTourPreview();
  updateTombAwakeningPreview();
}

// Attach to window for browser global scope
if (typeof window !== 'undefined') {
  window.adjTombField = adjTombField;
  window.togglePowerReserves = togglePowerReserves;
  window.adjTombSystemPt = adjTombSystemPt;
  window.rollMasterSystemReset = rollMasterSystemReset;
  window.renderTombAwakeningMatrix = renderTombAwakeningMatrix;
  window.populateNecronDynasticVault = populateNecronDynasticVault;
  window.renderSelectedNecronVaultPreview = renderSelectedNecronVaultPreview;
  window.attachNecronVaultToDossier = attachNecronVaultToDossier;
  window.buildTombMatrixSummaryLine = buildTombMatrixSummaryLine;
  window.compileTombAwakeningDossier = compileTombAwakeningDossier;
  window.buildTombAwakeningDossierString = buildTombAwakeningDossierString;
  window.updateTombAwakeningPreview = updateTombAwakeningPreview;
  window.transmitTombAwakeningDossier = transmitTombAwakeningDossier;
  window.resetTombAwakeningTab = resetTombAwakeningTab;
  window.resetMasterDossierForm = resetMasterDossierForm;
  window.updateDistantForceVisibility = updateDistantForceVisibility;
  window.compileMasterDossier = compileMasterDossier;
  window.readMasterDossierFormInputs = readMasterDossierFormInputs;
  window.buildMasterDossierString = buildMasterDossierString;
  window.updateMasterDossierPreview = updateMasterDossierPreview;
  window.transmitMasterBattleDossier = transmitMasterBattleDossier;
  window.saveCrusadeState = saveCrusadeState;
  window.initCrusadePage = initCrusadePage;

  window.addEventListener('DOMContentLoaded', initCrusadePage);
  window.addEventListener('vox:page-swapped', () => {
    if (document.getElementById('cruTabBoard')) initCrusadePage();
  });
}

// CommonJS export for Node test runners
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    adjTombField,
    togglePowerReserves,
    adjTombSystemPt,
    rollMasterSystemReset,
    renderTombAwakeningMatrix,
    populateNecronDynasticVault,
    renderSelectedNecronVaultPreview,
    attachNecronVaultToDossier,
    buildTombMatrixSummaryLine,
    compileTombAwakeningDossier,
    buildTombAwakeningDossierString,
    updateTombAwakeningPreview,
    transmitTombAwakeningDossier,
    resetTombAwakeningTab,
    resetMasterDossierForm,
    updateDistantForceVisibility,
    compileMasterDossier,
    readMasterDossierFormInputs,
    buildMasterDossierString,
    updateMasterDossierPreview,
    transmitMasterBattleDossier,
    saveCrusadeState,
    initCrusadePage
  };
}
````
