# 📦 Fires of Armageddon // Bundle: Mode 5 - Crusade Quartermaster Matrix (Part 2)

Crusade resource adjustments, harvest rollers, expedition fields, and master dossier compiler (`js/crusade.js`).

## 📑 Table of Contents
- [js/crusade.js (Part 2: Operations & Dispatch)](#file-jscrusadejspart2operationsdispatch)

---

## File: `js/crusade.js (Part 2: Operations & Dispatch)` <a id="file-jscrusadejspart2operationsdispatch"></a>

````javascript
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
      `• TOUR OF DUTY IMPACT: Zero Quota Deduction (Neither Main Player Fielded)`
    ];

    if (input.hordeBattleStats) {
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
    : (isGamma ? `KÂHL HÂRKYN GRÎMLEDGER // THE LEDGER OF EMBERS (THRYMKÂL SALVAGE CONSORTIUM)`
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

  if (input.hordeBattleStats) {
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
    hordeBattleStats: crusadeState.attachedHordeStats || null,
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
  ['dossierDistantForce', 'dossierChannel', 'dossierModeNode'].forEach(id => {
    const el = document.getElementById(id);
    if (el) crusadeState[id] = el.value;
  });
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
 * leftover SP, and mode).
 */
function importHordeBattleStatsToCrusade() {
  const loader = (typeof loadHordeBattleStats === 'function') ? loadHordeBattleStats : _loadHordeBattleStats;
  const stats = loader ? loader() : null;
  if (!stats) {
    if (typeof alert === 'function') {
      alert("No saved Horde Mode Battle Telemetry found in local memory.\nPlay a match in Spawner / Mode 1 and click 'Export to Crusade' first!");
    }
    return;
  }
  crusadeState.attachedHordeStats = stats;

  if (stats.secretObjective && stats.secretObjective.code) {
    const secCodeInput = document.getElementById('dossierSecretCode');
    if (secCodeInput) secCodeInput.value = stats.secretObjective.code;
  }
  if (stats.gameMode === 'SOLO') {
    const modeEl = document.getElementById('dossierModeNode');
    if (modeEl && !modeEl.value.includes('Solo')) {
      modeEl.value = 'Mode 1: Solo Horde Breach // Node 0 (Golgotha Arbor-Basin)';
    }
  }

  if (Array.isArray(stats.fortifications)) {
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
  const leftoverEl = document.getElementById('dossierLeftoverSp');
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
 */
function renderHordeStatsAttachmentCard() {
  const card = document.getElementById('hordeStatsAttachCard');
  if (!card) return;

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
  compileMasterDossier, readMasterDossierFormInputs, buildMasterDossierString,
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
