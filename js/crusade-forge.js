/**
 * Fires of Armageddon // Crusade Tactical Forge & Tour of Duty
 * Handles Tab 1 (Scoreboard & Branching Alliance Trees), Tab 2 (Tactical Forge Rollers & Queued Items),
 * and Tab 3 (Astra Militarum Tour of Duty & Munitorum Logistics Allocator).
 */

var crusadeState = {
  activeTab: 'board',
  selectedTree: 'Gatebreakers',
  alphaSP: 0,
  alphaCP: 0,
  alphaCacheCount: 0,
  betaSP: 0,
  betaCP: 0,
  betaCacheCount: 0,
  hordeSP: 1,
  hordeCP: 0,
  queuedRolls: [],
  // Astra Militarum Tour of Duty & Logistics State
  tourBattlesRem: 0,
  tourWinsRem: 0,
  commendationPts: 0,
  toursCompletedCount: 0,
  upliftingPrimer: false,
  logistics: {
    lexmechanicus: 1,
    materiel: 2,
    tithePool: 0,
    morale: 1
  },
  // Necrons Tomb World Awakening Matrix State
  tombAgendasCompleted: 0,
  tombAwakeningCycles: 0,
  powerReservesAllocated: false,
  tombSystems: {
    command: 1,
    reanimation: 1,
    translocation: 0
  }
};

var lastRolledItem = {
  trait: null,
  weapon: null,
  relic: null,
  scar: null
};

function switchCrusadeTab(which, persist = true) {
  crusadeState.activeTab = which;
  const tabBoard = document.getElementById('cruTabBoard');
  const tabForge = document.getElementById('cruTabForge');
  const tabTour = document.getElementById('cruTabTour');
  const tabTomb = document.getElementById('cruTabTomb');
  if (tabBoard) tabBoard.classList.toggle('hidden', which !== 'board');
  if (tabForge) tabForge.classList.toggle('hidden', which !== 'forge');
  if (tabTour) tabTour.classList.toggle('hidden', which !== 'tour');
  if (tabTomb) tabTomb.classList.toggle('hidden', which !== 'tomb');

  const btn1 = document.getElementById('cruTabBtn1');
  const btn2 = document.getElementById('cruTabBtn2');
  const btn3 = document.getElementById('cruTabBtn3');
  const btn4 = document.getElementById('cruTabBtn4');
  if (btn1) btn1.classList.toggle('active', which === 'board');
  if (btn2) btn2.classList.toggle('active', which === 'forge');
  if (btn3) btn3.classList.toggle('active', which === 'tour');
  if (btn4) btn4.classList.toggle('active', which === 'tomb');

  // Keep Tab 3 (Tour of Duty) always in Militarum color and Tab 4 (Tomb World) in Necron color
  if (document.body && document.body.classList) {
    if (which === 'tour') {
      document.body.classList.add('theme-militarum');
      document.body.classList.remove('theme-necron');
    } else if (which === 'tomb') {
      document.body.classList.add('theme-necron');
      document.body.classList.remove('theme-militarum');
    } else if (typeof window !== 'undefined' && window.VoxAudio && typeof window.VoxAudio.syncFactionTheme === 'function') {
      window.VoxAudio.syncFactionTheme();
    }
  }

  if (persist && typeof saveCrusadeState === 'function') saveCrusadeState();
}

function adjScore(field, delta) {
  crusadeState[field] = Math.max(0, (crusadeState[field] || 0) + delta);
  const el = document.getElementById(field);
  if (el) el.textContent = crusadeState[field];
  if (typeof saveCrusadeState === 'function') saveCrusadeState();
}

function selectAllianceTree(alliance, persist = true) {
  crusadeState.selectedTree = alliance;
  const btnGate = document.getElementById('treeBtnGate');
  const btnDes = document.getElementById('treeBtnDes');
  const btnMar = document.getElementById('treeBtnMar');
  if (btnGate) btnGate.classList.toggle('active', alliance === 'Gatebreakers');
  if (btnDes) btnDes.classList.toggle('active', alliance === 'Desecrators');
  if (btnMar) btnMar.classList.toggle('active', alliance === 'Marauders');

  const trees = (typeof ALLIANCE_TREES !== 'undefined') ? ALLIANCE_TREES : (typeof window !== 'undefined' ? window.ALLIANCE_TREES : {});
  const phases = trees[alliance] || trees.Gatebreakers || [];
  const box = document.getElementById('allianceTreeBox');
  if (box) {
    box.innerHTML = phases.map(p => `
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

// --- PURE RANDOM ROLLERS WITH CUSTOM WEB AUDIO SFX ---
function rollRandomBattleTrait() {
  if (typeof window !== 'undefined' && window.VoxAudio) window.VoxAudio.playDiceClatter();
  const poolKey = document.getElementById('forgeSourcePool')?.value || 'Armageddon';
  const uType = document.getElementById('traitUnitType')?.value || 'Infantry';
  const traits = (typeof BATTLE_TRAIT_TABLES !== 'undefined') ? BATTLE_TRAIT_TABLES : (typeof window !== 'undefined' ? window.BATTLE_TRAIT_TABLES : {});
  const amTraits = (typeof ASTRA_MILITARUM_TRAIT_TABLES !== 'undefined') ? ASTRA_MILITARUM_TRAIT_TABLES : (typeof window !== 'undefined' ? window.ASTRA_MILITARUM_TRAIT_TABLES : {});
  const necTraits = (typeof NECRONS_TRAIT_TABLES !== 'undefined') ? NECRONS_TRAIT_TABLES : (typeof window !== 'undefined' ? window.NECRONS_TRAIT_TABLES : {});

  const activePool = poolKey === 'AlphaCodex'
    ? amTraits
    : (poolKey === 'BetaCodex' ? necTraits : traits);
  const table = activePool[uType] || activePool.Infantry || traits.Infantry || [];
  const pick = table[Math.floor(Math.random() * table.length)] || { d6: 1, name: 'Default Trait', desc: 'No trait found' };
  lastRolledItem.trait = {
    category: `Battle Trait (${uType})`,
    roll: `D6 = ${pick.d6}`,
    name: pick.name,
    desc: pick.desc
  };

  setTimeout(() => {
    if (typeof window !== 'undefined' && window.VoxAudio) window.VoxAudio.playForgeAnvil();
    const box = document.getElementById('traitResultBox');
    if (box) {
      box.innerHTML = `
        <div><span class="dice-pip-badge">D6: ${pick.d6}</span> <strong style="color:var(--gold);">${pick.name}</strong></div>
        <div style="margin-top:6px; font-size:0.83rem; color:var(--text);">${pick.desc}</div>
      `;
    }
  }, 260);
}

function rollRandomWeaponMod() {
  if (typeof window !== 'undefined' && window.VoxAudio) window.VoxAudio.playDiceClatter();
  const mods = (typeof WEAPON_MOD_TABLE !== 'undefined') ? WEAPON_MOD_TABLE : (typeof window !== 'undefined' ? window.WEAPON_MOD_TABLE : []);
  const idx1 = Math.floor(Math.random() * mods.length);
  let idx2 = Math.floor(Math.random() * mods.length);
  while (idx2 === idx1 && mods.length > 1) {
    idx2 = Math.floor(Math.random() * mods.length);
  }
  const m1 = mods[idx1] || { d6: 1, name: 'Brutal', desc: '+1 Strength' };
  const m2 = mods[idx2] || { d6: 2, name: 'Master-Worked', desc: '+1 Damage' };

  lastRolledItem.weapon = {
    category: `Weapon Modification (2x D6)`,
    roll: `D6 = ${m1.d6} & ${m2.d6}`,
    name: `${m1.name} + ${m2.name}`,
    desc: `[${m1.name}: ${m1.desc}] + [${m2.name}: ${m2.desc}]`
  };

  setTimeout(() => {
    if (typeof window !== 'undefined' && window.VoxAudio) window.VoxAudio.playForgeAnvil();
    const box = document.getElementById('weaponResultBox');
    if (box) {
      box.innerHTML = `
        <div><span class="dice-pip-badge">D6: ${m1.d6} &amp; ${m2.d6}</span> <strong style="color:var(--blue);">${m1.name} + ${m2.name}</strong></div>
        <div style="margin-top:6px; font-size:0.81rem; color:var(--text);">• <strong>${m1.name}:</strong> ${m1.desc}<br>• <strong>${m2.name}:</strong> ${m2.desc}</div>
      `;
    }
  }, 260);
}

function rollRandomRelic() {
  if (typeof window !== 'undefined' && window.VoxAudio) window.VoxAudio.playDiceClatter();
  const poolKey = document.getElementById('forgeSourcePool')?.value || 'Armageddon';
  const tier = document.getElementById('relicTierSelect')?.value || 'Artificer';
  const relics = (typeof CRUSADE_RELIC_VAULT !== 'undefined') ? CRUSADE_RELIC_VAULT : (typeof window !== 'undefined' ? window.CRUSADE_RELIC_VAULT : {});
  const amRelics = (typeof ASTRA_MILITARUM_RELIC_VAULT !== 'undefined') ? ASTRA_MILITARUM_RELIC_VAULT : (typeof window !== 'undefined' ? window.ASTRA_MILITARUM_RELIC_VAULT : {});
  const necRelics = (typeof NECRONS_RELIC_VAULT !== 'undefined') ? NECRONS_RELIC_VAULT : (typeof window !== 'undefined' ? window.NECRONS_RELIC_VAULT : {});

  const activeVault = poolKey === 'AlphaCodex'
    ? amRelics
    : (poolKey === 'BetaCodex' ? necRelics : relics);
  const pool = activeVault[tier] || relics.Artificer || [];
  const pick = pool[Math.floor(Math.random() * pool.length)] || { name: 'Standard Relic', desc: 'No relic found' };

  lastRolledItem.relic = {
    category: `Crusade Relic (${tier})`,
    roll: `Vault Draw`,
    name: pick.name,
    desc: pick.desc
  };

  setTimeout(() => {
    if (typeof window !== 'undefined' && window.VoxAudio) window.VoxAudio.playRelicChoir();
    const box = document.getElementById('relicResultBox');
    if (box) {
      box.innerHTML = `
        <div><span class="dice-pip-badge" style="background:var(--purple); color:#fff;">${tier.toUpperCase()}</span> <strong style="color:#d8b4fe;">${pick.name}</strong></div>
        <div style="margin-top:6px; font-size:0.83rem; color:var(--text);">${pick.desc}</div>
      `;
    }
  }, 260);
}

function rollOutOfActionTest() {
  if (typeof window !== 'undefined' && window.VoxAudio) window.VoxAudio.playDiceClatter();
  const d6 = Math.floor(Math.random() * 6) + 1;

  setTimeout(() => {
    const box = document.getElementById('scarResultBox');
    if (!box) return;
    if (d6 === 1) {
      if (typeof window !== 'undefined' && window.VoxAudio) window.VoxAudio.playScarHazard();
      box.innerHTML = `
        <div><span class="dice-pip-badge" style="background:var(--red); color:#fff;">D6: 1 (FAILED!)</span> <strong style="color:var(--red);">Out of Action Test Failed!</strong></div>
        <div style="margin-top:6px; font-size:0.83rem; color:var(--text);">Choose <strong>Devastating Blow</strong> (-1 Battle Honour) OR click <strong>🎲 Roll Scar (D6)</strong> below to roll a Battle Scar!</div>
      `;
    } else {
      if (typeof window !== 'undefined' && window.VoxAudio) window.VoxAudio.playForgeAnvil();
      box.innerHTML = `
        <div><span class="dice-pip-badge" style="background:var(--green); color:#000;">D6: ${d6} (PASSED)</span> <strong style="color:var(--green);">Unit Recovered Unscathed!</strong></div>
        <div style="margin-top:6px; font-size:0.83rem; color:var(--text);">No Battle Scar suffered. Unit returns to Order of Battle at full strength.</div>
      `;
    }
  }, 260);
}

function rollRandomBattleScar() {
  if (typeof window !== 'undefined' && window.VoxAudio) window.VoxAudio.playDiceClatter();
  const poolKey = document.getElementById('forgeSourcePool')?.value || 'Armageddon';
  const scars = (typeof BATTLE_SCAR_TABLE !== 'undefined') ? BATTLE_SCAR_TABLE : (typeof window !== 'undefined' ? window.BATTLE_SCAR_TABLE : []);
  const necScars = (typeof NECRON_BATTLE_SCAR_TABLE !== 'undefined') ? NECRON_BATTLE_SCAR_TABLE : (typeof window !== 'undefined' ? window.NECRON_BATTLE_SCAR_TABLE : []);
  const activeScarTable = poolKey === 'BetaCodex' ? necScars : scars;
  const pick = activeScarTable[Math.floor(Math.random() * activeScarTable.length)] || { d6: 1, name: 'Scar', desc: 'No scar' };

  lastRolledItem.scar = {
    category: `Battle Scar`,
    roll: `D6 = ${pick.d6}`,
    name: pick.name,
    desc: pick.desc
  };

  setTimeout(() => {
    if (typeof window !== 'undefined' && window.VoxAudio) window.VoxAudio.playScarHazard();
    const box = document.getElementById('scarResultBox');
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
    alert('Roll the dice on this card first before attaching it to the Master Dossier!');
    return;
  }
  const unitName = (document.getElementById('rollerUnitName')?.value || '[Unnamed Unit]').trim();
  const unitCtx = (document.getElementById('rollerUnitContext')?.value || 'Fielded in battle').trim();

  crusadeState.queuedRolls.push({
    unit: unitName,
    context: unitCtx,
    category: item.category,
    roll: item.roll,
    name: item.name,
    desc: item.desc
  });

  if (typeof window !== 'undefined' && window.VoxAudio) window.VoxAudio.playClank('card');
  renderQueuedRolls();
  if (typeof updateMasterDossierPreview === 'function') updateMasterDossierPreview();
  if (typeof saveCrusadeState === 'function') saveCrusadeState();
}

function removeQueuedRoll(idx) {
  crusadeState.queuedRolls.splice(idx, 1);
  renderQueuedRolls();
  if (typeof updateMasterDossierPreview === 'function') updateMasterDossierPreview();
  if (typeof saveCrusadeState === 'function') saveCrusadeState();
}

function clearQueuedRolls() {
  crusadeState.queuedRolls = [];
  renderQueuedRolls();
  if (typeof updateMasterDossierPreview === 'function') updateMasterDossierPreview();
  if (typeof saveCrusadeState === 'function') saveCrusadeState();
}

function renderQueuedRolls() {
  const countEl = document.getElementById('queuedCountLabel');
  const box = document.getElementById('queuedRollsContainer');
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

// =========================================================================
// ASTRA MILITARUM TOUR OF DUTY, LOGISTICS & COMMENDATIONS FUNCTIONS
// =========================================================================
function adjTourField(field, delta) {
  crusadeState[field] = Math.max(0, (crusadeState[field] || 0) + delta);
  const el = document.getElementById(field);
  if (el) el.textContent = String(crusadeState[field]);
  if (typeof updateMasterDossierPreview === 'function') updateMasterDossierPreview();
  updateStartOfTourPreview();
  if (typeof saveCrusadeState === 'function') saveCrusadeState();
}

function rollNewTourQuotas() {
  if (typeof window !== 'undefined' && window.VoxAudio) window.VoxAudio.playDiceClatter();
  const d6 = Math.floor(Math.random() * 6) + 1;
  const d3 = Math.floor(Math.random() * 3) + 1;
  crusadeState.tourBattlesRem = d6 + 4;
  crusadeState.tourWinsRem = d3 + 2;

  setTimeout(() => {
    if (typeof window !== 'undefined' && window.VoxAudio) window.VoxAudio.playForgeAnvil();
    const bEl = document.getElementById('tourBattlesRem');
    const wEl = document.getElementById('tourWinsRem');
    if (bEl) bEl.textContent = String(crusadeState.tourBattlesRem);
    if (wEl) wEl.textContent = String(crusadeState.tourWinsRem);
    if (typeof updateMasterDossierPreview === 'function') updateMasterDossierPreview();
    updateStartOfTourPreview();
    if (typeof saveCrusadeState === 'function') saveCrusadeState();
  }, 240);
}

function rollVictoryCommendationPts() {
  if (typeof window !== 'undefined' && window.VoxAudio) window.VoxAudio.playDiceClatter();
  const d3 = Math.floor(Math.random() * 3) + 1;
  crusadeState.commendationPts = (crusadeState.commendationPts || 0) + d3;

  setTimeout(() => {
    if (typeof window !== 'undefined' && window.VoxAudio) window.VoxAudio.playRelicChoir();
    const cEl = document.getElementById('commendationPts');
    const noticeEl = document.getElementById('commRollNotice');
    if (cEl) cEl.textContent = String(crusadeState.commendationPts);
    if (noticeEl) noticeEl.innerHTML = `<strong style="color:var(--green);">Rolled D3 = +${d3} Commendation Pts!</strong>`;
    if (typeof updateMasterDossierPreview === 'function') updateMasterDossierPreview();
    updateStartOfTourPreview();
    if (typeof saveCrusadeState === 'function') saveCrusadeState();
  }, 240);
}

function toggleUpliftingPrimer() {
  const cb = document.getElementById('upliftingPrimerToggle');
  crusadeState.upliftingPrimer = !!(cb && cb.checked);
  renderLogisticsAllocator();
  if (typeof updateMasterDossierPreview === 'function') updateMasterDossierPreview();
  updateStartOfTourPreview();
  if (typeof saveCrusadeState === 'function') saveCrusadeState();
}

function adjLogisticsPt(catKey, delta) {
  if (!crusadeState.logistics) {
    crusadeState.logistics = { lexmechanicus: 1, materiel: 2, tithePool: 0, morale: 1 };
  }
  const maxTotal = crusadeState.upliftingPrimer ? 5 : 4;
  const currentTotal = Object.values(crusadeState.logistics).reduce((a, b) => a + b, 0);
  const currVal = crusadeState.logistics[catKey] || 0;
  const nextVal = currVal + delta;

  if (nextVal < 0 || nextVal > 2) return;
  if (delta > 0 && currentTotal >= maxTotal) return;

  crusadeState.logistics[catKey] = nextVal;
  if (typeof window !== 'undefined' && window.VoxAudio) window.VoxAudio.playClank('card');
  renderLogisticsAllocator();
  if (typeof updateMasterDossierPreview === 'function') updateMasterDossierPreview();
  updateStartOfTourPreview();
  if (typeof saveCrusadeState === 'function') saveCrusadeState();
}

function renderLogisticsAllocator() {
  const grid = document.getElementById('logisticsAllocatorGrid');
  const label = document.getElementById('logisticsAllocatedLabel');
  const cb = document.getElementById('upliftingPrimerToggle');
  if (!grid) return;

  if (!crusadeState.logistics) {
    crusadeState.logistics = { lexmechanicus: 1, materiel: 2, tithePool: 0, morale: 1 };
  }
  if (cb) cb.checked = !!crusadeState.upliftingPrimer;

  const maxTotal = crusadeState.upliftingPrimer ? 5 : 4;
  const currentTotal = Object.values(crusadeState.logistics).reduce((a, b) => a + b, 0);
  if (label) label.textContent = `${currentTotal} / ${maxTotal}`;

  const categories = (typeof LOGISTICS_CATEGORIES !== 'undefined') ? LOGISTICS_CATEGORIES : (typeof window !== 'undefined' ? window.LOGISTICS_CATEGORIES : []);
  grid.innerHTML = categories.map(cat => {
    const pts = crusadeState.logistics[cat.key] || 0;
    const stateClass = pts === 2 ? 'state-surplus' : (pts === 0 ? 'state-deficiency' : '');
    const badgeHtml = pts === 2
      ? `<span class="rule-tag" style="border-color:var(--green); color:var(--green);">🟢 SURPLUS (2 PTS)</span>`
      : (pts === 1
        ? `<span class="rule-tag" style="border-color:var(--muted); color:var(--muted);">⚪ STANDARD (1 PT)</span>`
        : `<span class="rule-tag" style="border-color:var(--red); color:var(--red);">🔴 DEFICIENCY (0 PTS)</span>`);

    const ruleText = pts === 2
      ? `<span style="color:var(--green);">${cat.surplus}</span>`
      : (pts === 1
        ? `<span style="color:var(--muted);">Standard Munitorum allocation — no Surplus bonus or Deficiency penalty applies.</span>`
        : `<span style="color:var(--red);">${cat.deficiency}</span>`);

    return `
      <div class="logistics-card ${stateClass}">
        <div style="display:flex; flex-direction:column; align-items:center; text-align:center; gap:6px; margin-bottom:8px;">
          <strong style="color:#fff; font-size:0.9rem;">${cat.title}</strong>
          ${badgeHtml}
        </div>
        <div class="hud-val-row" style="margin-bottom:8px;">
          <button type="button" class="mini-btn" onclick="adjLogisticsPt('${cat.key}', -1)">−</button>
          <span class="hud-num" style="color:var(--gold); font-size:1.2rem;">${pts} PT${pts === 1 ? '' : 'S'}</span>
          <button type="button" class="mini-btn" onclick="adjLogisticsPt('${cat.key}', 1)">+</button>
        </div>
        <div style="font-size:0.8rem; line-height:1.45;">${ruleText}</div>
      </div>
    `;
  }).join('');
}

function populateCommendationVault() {
  const sel = document.getElementById('commendationSelect');
  if (!sel) return;
  const vault = (typeof ASTRA_COMMENDATIONS_VAULT !== 'undefined') ? ASTRA_COMMENDATIONS_VAULT : (typeof window !== 'undefined' ? window.ASTRA_COMMENDATIONS_VAULT : []);
  sel.innerHTML = vault.map(c =>
    `<option value="${c.id}">${c.name} — [${c.type}]</option>`
  ).join('');
  renderSelectedCommendationPreview();
}

function renderSelectedCommendationPreview() {
  const sel = document.getElementById('commendationSelect');
  const box = document.getElementById('commendationPreviewBox');
  if (!sel || !box) return;
  const vault = (typeof ASTRA_COMMENDATIONS_VAULT !== 'undefined') ? ASTRA_COMMENDATIONS_VAULT : (typeof window !== 'undefined' ? window.ASTRA_COMMENDATIONS_VAULT : []);
  const pick = vault.find(c => c.id === sel.value) || vault[0];
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
  const sel = document.getElementById('commendationSelect');
  if (!sel) return;
  const vault = (typeof ASTRA_COMMENDATIONS_VAULT !== 'undefined') ? ASTRA_COMMENDATIONS_VAULT : (typeof window !== 'undefined' ? window.ASTRA_COMMENDATIONS_VAULT : []);
  const pick = vault.find(c => c.id === sel.value) || vault[0];
  const unitName = (document.getElementById('commRecipientUnit')?.value || '044th Krieg Regiment').trim();

  crusadeState.queuedRolls.push({
    unit: unitName,
    context: `Awarded upon Tour of Duty completion (${pick.type})`,
    category: pick.type,
    roll: `Munitorum Commendation`,
    name: pick.name,
    desc: pick.desc
  });

  if (typeof window !== 'undefined' && window.VoxAudio) window.VoxAudio.playRelicChoir();
  renderQueuedRolls();
  if (typeof updateMasterDossierPreview === 'function') updateMasterDossierPreview();
  if (typeof saveCrusadeState === 'function') saveCrusadeState();
  switchCrusadeTab('forge');
}

function buildLogisticsSummaryLine() {
  const log = crusadeState.logistics || { lexmechanicus: 1, materiel: 2, tithePool: 0, morale: 1 };
  const categories = (typeof LOGISTICS_CATEGORIES !== 'undefined') ? LOGISTICS_CATEGORIES : (typeof window !== 'undefined' ? window.LOGISTICS_CATEGORIES : []);
  const surplus = [];
  const def = [];
  categories.forEach(c => {
    const v = log[c.key] || 0;
    const shortName = c.title.split(' ')[1];
    if (v === 2) surplus.push(shortName);
    if (v === 0) def.push(shortName);
  });
  const surStr = surplus.length ? surplus.join(', ') : 'None';
  const defStr = def.length ? def.join(', ') : 'None';
  return `Battles Rem: ${crusadeState.tourBattlesRem || 0} | Wins Rem: ${crusadeState.tourWinsRem || 0} | Commendation Pts: ${crusadeState.commendationPts || 0} | Surplus: [${surStr}] | Deficiency: [${defStr}]`;
}

/**
 * Pure functional core: compiles the unique Start of Tour of Duty Dispatch string
 * (Departmento Munitorum Regulation 884-Alpha).
 *
 * @param {object} [input={}] - Plain Tour of Duty state snapshot.
 * @returns {string} Formatted Start of Tour of Duty dispatch payload.
 */
function compileTourDispatch(input = {}) {
  const battles = (typeof input.tourBattlesRem === 'number') ? input.tourBattlesRem : (crusadeState.tourBattlesRem || 0);
  const wins = (typeof input.tourWinsRem === 'number') ? input.tourWinsRem : (crusadeState.tourWinsRem || 0);
  const commPts = (typeof input.commendationPts === 'number') ? input.commendationPts : (crusadeState.commendationPts || 0);
  const log = input.logistics || (crusadeState.logistics || { lexmechanicus: 1, materiel: 1, tithePool: 1, morale: 1 });
  const lex = log.lexmechanicus || 0;
  const mat = log.materiel || 0;
  const tithe = log.tithePool || 0;
  const mor = log.morale || 0;
  const primer = (typeof input.upliftingPrimer === 'boolean') ? input.upliftingPrimer : !!crusadeState.upliftingPrimer;
  const maxPts = primer ? 5 : 4;
  const notes = (input.notes || (typeof document !== 'undefined' && document.getElementById('startTourNotes')?.value) || '').trim();

  const lines = [
    `+++ DEPARTMENTO MUNITORUM // TOUR OF DUTY & LOGISTICS ALLOCATION DISPATCH +++`,
    `• REPORTING COMMANDER: THE EXILE // THE SANCTUARY OF ASH (044TH KRIEG)`,
    `• OPERATIONAL QUOTAS: ${battles} Battles Required // ${wins} Victories Required`,
    `• MUNITORUM LOGISTICS ALLOCATION (${maxPts} PTS): Lexmechanicus: ${lex} | Materiel: ${mat} | Tithe Pool: ${tithe} | Morale: ${mor}`,
    `• ACTIVE COMMENDATION TALLY: ${commPts} CmP`
  ];

  if (notes) {
    lines.push(`• REGIMENTAL DEPLOYMENT DIRECTIVE: "${notes}"`);
  }

  lines.push(
    `------------------------------------------------`,
    `REQUEST FOR LOGIS-PREFECT VANE: Please register this Tour of Duty operational quota and Munitorum Regulation 884-Alpha logistics distribution in the orbital ledger!`
  );

  return lines.join('\n');
}

function buildStartOfTourDossierString() {
  return compileTourDispatch({
    tourBattlesRem: crusadeState.tourBattlesRem,
    tourWinsRem: crusadeState.tourWinsRem,
    commendationPts: crusadeState.commendationPts,
    logistics: crusadeState.logistics,
    upliftingPrimer: crusadeState.upliftingPrimer,
    notes: document.getElementById('startTourNotes')?.value || ''
  });
}

function updateStartOfTourPreview() {
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
