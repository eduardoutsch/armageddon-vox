# 📦 Fires of Armageddon // Bundle: Mode 5 - Crusade Quartermaster Matrix (Part 2)

Crusade resource adjustments, harvest rollers, expedition fields, and master dossier compiler (`js/crusade.js`).

## 📑 Table of Contents
- [js/crusade.js (Part 2: Operations & Dispatch)](#file-jscrusadejspart2operationsdispatch)

---

## File: `js/crusade.js (Part 2: Operations & Dispatch)` <a id="file-jscrusadejspart2operationsdispatch"></a>

````javascript

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
    `• REPORTING WARLORD: KÂHL HÂRKYN GRÎMLEDGER // THE LEDGER OF EMBERS (1,200 PTS)`,
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
  if (typeof document === 'undefined') return;
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
````
