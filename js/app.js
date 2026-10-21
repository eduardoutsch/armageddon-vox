// Main UI and Session Controller for Fires of Armageddon

let selectedModeVal = 'coop';
let selectedRoleVal = '1';
let activeHordeFaction = HORDE_FACTIONS[0];

let personalSecretDeck = [];
let sharedMiseryDeck = [];
let sharedSecondaryDeck = [];
let activeCard = null;
let currentChoices = [];
let activeMiseries = [];
let activeSecondaries = [];
let battleRound = 0;
let isPrivacyHidden = false;
let isSoloMode = false;
let currentShopFilter = 'All';

let sp = 0;
let spGainedThisRound = 0;
let spRoundCap = 8;
let cp = 2;
let stratCount = 0;
let currentZoneSpawns = [];

// Populate Spawner Faction Dropdown on load
window.addEventListener('DOMContentLoaded', () => {
  const sel = document.getElementById('hordeFactionSelect');
  if (sel) {
    sel.innerHTML = HORDE_FACTIONS.map(f => `<option value="${f.name}">${f.name} (${f.ruleTitle})</option>`).join('');
  }
});

function selectMode(mode) {
  selectedModeVal = mode;
  document.getElementById('modeCardCoop').classList.toggle('selected-red', mode === 'coop');
  document.getElementById('modeCardSolo').classList.toggle('selected-red', mode === 'solo');
  document.getElementById('playerRoleSection').classList.toggle('hidden', mode === 'solo');
}

function selectRole(role) {
  selectedRoleVal = role;
  document.getElementById('roleCard1').classList.toggle('selected', role === '1');
  document.getElementById('roleCard2').classList.toggle('selected', role === '2');
}

function resolveRoomSyncedFaction(code) {
  const mode = document.getElementById('setupFactionMode').value;
  const rngFac = mulberry32(hashString(code + "_HORDE_FACTION"));

  if (mode.startsWith("SYNC_")) {
    let pool = HORDE_FACTIONS;
    if (mode === "SYNC_CHAOS") pool = HORDE_FACTIONS.filter(f => f.group === "Chaos");
    if (mode === "SYNC_XENOS") pool = HORDE_FACTIONS.filter(f => f.group === "Xenos");
    if (mode === "SYNC_IMPERIUM") pool = HORDE_FACTIONS.filter(f => f.group === "Imperium");
    const idx = Math.floor(rngFac() * pool.length);
    activeHordeFaction = pool[idx];
  } else {
    activeHordeFaction = HORDE_FACTIONS.find(f => f.name === mode) || HORDE_FACTIONS[0];
  }

  document.getElementById('hordeFactionSelect').value = activeHordeFaction.name;
  renderFactionReminderBanner();
}

function manualChangeFaction() {
  const val = document.getElementById('hordeFactionSelect').value;
  activeHordeFaction = HORDE_FACTIONS.find(f => f.name === val) || HORDE_FACTIONS[0];
  renderFactionReminderBanner();
}

function renderFactionReminderBanner() {
  document.getElementById('activeFactionBannerTitle').innerText = `HORDE FACTION: ${activeHordeFaction.name} — "${activeHordeFaction.ruleTitle}"`;
  document.getElementById('activeFactionBannerDesc').innerText = activeHordeFaction.desc;
}

function startSession() {
  const code = (document.getElementById('seedInput').value || 'HADES-1').trim().toUpperCase();
  const mode = selectedModeVal;
  const role = selectedRoleVal;

  isSoloMode = (mode === 'solo');
  spRoundCap = isSoloMode ? 16 : 8;

  // 1. Resolve Room-Synced Horde Faction
  resolveRoomSyncedFaction(code);

  // 2. Resolve Room-Synced Decks
  const rngSecret = mulberry32(hashString(code + "_SEC"));
  const rngMisery = mulberry32(hashString(code + "_MIS"));
  const rngSecond = mulberry32(hashString(code + "_MSN"));

  const validSecrets = isSoloMode
    ? OBJECTIVES.filter(o => !o.tags.includes("Multiplayer"))
    : OBJECTIVES;

  const shuffledSecrets = seededShuffle(validSecrets, rngSecret);

  if (isSoloMode) {
    personalSecretDeck = shuffledSecrets;
    document.getElementById('secretPoolNotice').innerText = `Solo Deck (${personalSecretDeck.length} valid cards; Multiplayer blocked)`;
  } else {
    personalSecretDeck = (role === "1") ? shuffledSecrets.slice(0, 17) : shuffledSecrets.slice(17, 34);
    document.getElementById('secretPoolNotice').innerText = `Co-op Split Pool (${personalSecretDeck.length} cards)`;
  }

  sharedMiseryDeck = seededShuffle(MISERIES, rngMisery);
  sharedSecondaryDeck = seededShuffle(SECONDARIES, rngSecond);

  battleRound = 0;
  activeCard = null;
  activeMiseries = [];
  activeSecondaries = [];
  sp = 0;
  spGainedThisRound = 0;
  cp = 2;
  stratCount = 0;

  loadCustomPool();

  document.getElementById('setupScreen').classList.add('hidden');
  document.getElementById('gameScreen').classList.remove('hidden');

  currentChoices = drawSecretCards(2);
  renderSecretChoices("Select 1 Initial Secret Objective");
  updateHUD();
  renderSharedDecks();
  renderResupplyTable();
  switchTab(2);
}

function switchTab(tabNum) {
  [1, 2, 3, 4].forEach(n => {
    document.getElementById('tab' + n).classList.toggle('hidden', n !== tabNum);
    document.getElementById('tabBtn' + n).classList.toggle('active', n === tabNum);
  });
}

function updateHUD() {
  const code = (document.getElementById('seedInput').value || 'HADES-1').trim().toUpperCase();
  document.getElementById('hudSessionInfo').innerText = isSoloMode ? `${code} • SOLO` : `${code} • P${selectedRoleVal}`;
  document.getElementById('hudRound').innerText = battleRound === 0 ? "Pre-Game" : `Round ${battleRound}/6`;
  document.getElementById('hudSp').innerText = sp;
  document.getElementById('hudSpCap').innerText = `(${spGainedThisRound}/${spRoundCap})`;
  document.getElementById('hudCp').innerText = cp;
  document.getElementById('hudStratTally').innerText = `(${stratCount} Strats)`;
  document.getElementById('spawnerBtnRound').innerText = Math.max(1, battleRound);
}

// --- SECRET OBJECTIVES ---
function drawSecretCards(count) {
  let drawn = [];
  for (let i = 0; i < count; i++) {
    if (personalSecretDeck.length === 0) break;
    drawn.push(personalSecretDeck.shift());
  }
  return drawn;
}

function renderSecretChoices(promptText) {
  document.getElementById('selectionPrompt').innerText = promptText;
  document.getElementById('selectionArea').classList.remove('hidden');
  document.getElementById('lockedArea').classList.add('hidden');

  const list = document.getElementById('choicesList');
  list.innerHTML = currentChoices.map((c, idx) => {
    const isCur = (activeCard && c.id === activeCard.id);
    return `
      <div class="card">
        <span class="badge ${isCur ? 'gold' : ''}">${isCur ? 'Current Objective' : c.tags}</span>
        <h4 class="card-title">${c.name}</h4>
        <p class="card-desc">${c.desc}</p>
        <button onclick="pickSecretCard(${idx})" style="margin-top:14px; width:100%;">
          ${isCur ? 'Keep Current Objective' : 'Confirm & Lock Objective'}
        </button>
      </div>
    `;
  }).join('');
}

function pickSecretCard(chosenIdx) {
  const chosen = currentChoices[chosenIdx];
  currentChoices.forEach((c, idx) => {
    if (idx !== chosenIdx) personalSecretDeck.push(c);
  });
  activeCard = chosen;
  currentChoices = [];
  document.getElementById('selectionArea').classList.add('hidden');
  document.getElementById('lockedArea').classList.remove('hidden');

  document.getElementById('activeCardBox').innerHTML = `
    <div class="card">
      <span class="badge">${activeCard.tags}</span>
      <h4 class="card-title">${activeCard.name}</h4>
      <p class="card-desc">${activeCard.desc}</p>
    </div>
  `;
  document.getElementById('cmCodeBox').innerText = `CM Verification Code: ${activeCard.code}`;
}

function triggerChangeOfPlans() {
  const drawn = drawSecretCards(2);
  if (drawn.length === 0) return alert("No cards remaining in your Secret Objective deck!");
  currentChoices = activeCard ? [activeCard, ...drawn] : drawn;
  renderSecretChoices("Change of Plans: Pick 1 or Keep Current");
}

function triggerOrbitalPunishment() {
  if (!confirm("Failed 'Establish Orbital Comms'? This draws 2 cards and assigns one at random!")) return;
  const drawn = drawSecretCards(2);
  const pool = activeCard ? [activeCard, ...drawn] : drawn;
  const randIdx = Math.floor(Math.random() * pool.length);
  currentChoices = pool;
  pickSecretCard(randIdx);
  alert(`New Randomized Secret Objective: ${activeCard.name}`);
}

function togglePrivacy() {
  isPrivacyHidden = !isPrivacyHidden;
  document.getElementById('PrivacyWrapper').classList.toggle('hidden', isPrivacyHidden);
  document.getElementById('privacyBtn').innerText = isPrivacyHidden ? "Show Objective" : "Hide Screen";
}

// --- BATTLE ROUND, MISERY & SECONDARIES ---
function advanceBattleRound() {
  if (battleRound >= 6) {
    if (!confirm("Round 6 complete! Continue into Infinite Mode Round " + (battleRound + 1) + "?")) return;
  }
  battleRound++;
  spGainedThisRound = 0;

  const cfg = HARD_MODE_ROUNDS[Math.min(battleRound, 6)];
  document.getElementById('roundTitle').innerText = `Battle Round ${battleRound}`;
  document.getElementById('spawnModDisplay').innerText = `${cfg.misery} Misery Drawn • ${cfg.spawnMod}`;
  document.getElementById('nextRoundBtn').innerText = battleRound < 6
    ? `Advance to Battle Round ${battleRound + 1}`
    : `Battle Round 6 Active (Final Stand)`;

  activeMiseries = [];
  activeSecondaries = [];

  drawMisery(cfg.misery);
  // Orks Round 3 High (Green) Tide check
  if (battleRound === 3 && activeHordeFaction.name === 'Orks') {
    drawMisery(1);
  }

  if (battleRound <= 5) {
    drawSecondary(battleRound === 1);
  }

  updateHUD();
  renderSharedDecks();
}

function drawMisery(count) {
  for (let i = 0; i < count; i++) {
    if (sharedMiseryDeck.length === 0) {
      const code = (document.getElementById('seedInput').value || 'HADES-1').trim().toUpperCase();
      sharedMiseryDeck = seededShuffle(MISERIES, mulberry32(hashString(code + "_MIS_R" + battleRound)));
    }
    const card = sharedMiseryDeck.shift();
    activeMiseries.push(card);
    if (card.id === 20) drawMisery(2);
    if (card.id === 14 && isSoloMode) drawMisery(2);
  }
  renderSharedDecks();
}

function triggerSpecificMisery() {
  const id = parseInt(document.getElementById('specificMiserySelect').value, 10);
  const found = MISERIES.find(m => m.id === id);
  if (!found) return;
  sharedMiseryDeck = sharedMiseryDeck.filter(m => m.id !== id);
  activeMiseries.push(found);
  renderSharedDecks();
}

function drawSecondary(isRound1) {
  if (sharedSecondaryDeck.length === 0) {
    const code = (document.getElementById('seedInput').value || 'HADES-1').trim().toUpperCase();
    sharedSecondaryDeck = seededShuffle(SECONDARIES, mulberry32(hashString(code + "_MSN_R" + battleRound)));
  }
  let skipped = [];
  let chosen = null;
  while (sharedSecondaryDeck.length > 0) {
    let candidate = sharedSecondaryDeck.shift();
    if (isRound1 && candidate.r1Skip) {
      skipped.push(candidate);
    } else {
      chosen = candidate;
      break;
    }
  }
  sharedSecondaryDeck.push(...skipped);
  if (chosen) activeSecondaries.push(chosen);
  renderSharedDecks();
}

function replaceSecondary() {
  if (activeSecondaries.length === 0) return alert("No active Secondary Mission to replace!");
  activeSecondaries.pop();
  drawSecondary(battleRound === 1);
}

function renderSharedDecks() {
  document.getElementById('secDeckCount').innerText = `${sharedSecondaryDeck.length} in deck`;
  document.getElementById('misDeckCount').innerText = `${sharedMiseryDeck.length} in deck`;

  const secBox = document.getElementById('activeSecondariesBox');
  if (activeSecondaries.length === 0) {
    secBox.innerHTML = `<div class="card secondary" style="opacity:0.6;"><p class="card-desc">No active Secondary Mission.</p></div>`;
  } else {
    secBox.innerHTML = activeSecondaries.map(s => `
      <div class="card secondary">
        <span class="badge gold">Secondary Mission</span>
        <h4 class="card-title">${s.name}</h4>
        <p class="card-desc">${s.cond}</p>
        <div class="meta-row">
          <span class="reward-pill"><strong>Reward:</strong> ${s.rew}</span>
          <span class="punish-pill"><strong>Failure:</strong> ${s.pun}</span>
        </div>
      </div>
    `).join('');
  }

  const misBox = document.getElementById('activeMiseriesBox');
  if (activeMiseries.length === 0) {
    misBox.innerHTML = `<div class="card misery" style="opacity:0.6;"><p class="card-desc">No active Misery Cards.</p></div>`;
  } else {
    misBox.innerHTML = activeMiseries.map(m => `
      <div class="card misery">
        <span class="badge red">Misery Effect</span>
        <h4 class="card-title">${m.name}</h4>
        <p class="card-desc">${m.desc}</p>
      </div>
    `).join('');
  }
}

// --- TAB 4: ROOM-SYNCED HORDE SPAWNER ---
function saveCustomPool() {
  const pool = {
    b34: document.getElementById('pool34').value,
    b56: document.getElementById('pool56').value,
    b79: document.getElementById('pool79').value,
    b10: document.getElementById('pool10').value
  };
  localStorage.setItem('armageddon_horde_pool', JSON.stringify(pool));
  alert("Custom Shelf Pool saved!");
}

function loadCustomPool() {
  const saved = localStorage.getItem('armageddon_horde_pool');
  if (!saved) return;
  try {
    const p = JSON.parse(saved);
    if (p.b34) document.getElementById('pool34').value = p.b34;
    if (p.b56) document.getElementById('pool56').value = p.b56;
    if (p.b79) document.getElementById('pool79').value = p.b79;
    if (p.b10) document.getElementById('pool10').value = p.b10;
  } catch (e) {}
}

function rollAllSpawnZones() {
  if (battleRound === 6) {
    return alert("Battle Round 6 (Hard Mode Final Stand): Do NOT roll Spawn Rolls in Round 6!");
  }
  const code = (document.getElementById('seedInput').value || 'HADES-1').trim().toUpperCase();
  const effRound = Math.max(1, battleRound);
  const numZones = parseInt(document.getElementById('spawnZoneCountSelect').value, 10);
  const fac = activeHordeFaction.name;
  const extraMod = parseInt(document.getElementById('extraSpawnMod').value, 10) || 0;
  const jammerActive = document.getElementById('jammerCheck').checked;
  const unluckyNightActive = activeMiseries.some(m => m.id === 7);
  const firstBonus6 = document.getElementById('firstRollBonusCheck').checked;
  const firstBonus12 = document.getElementById('baitTrapBonusCheck').checked;

  const rndIndex = Math.max(1, Math.min(effRound, 5));
  let baseRoundMod = HARD_MODE_ROUNDS[rndIndex].spawnModNum;
  if (effRound === 3 && fac === 'Orks') baseRoundMod += 1;

  currentZoneSpawns = [];

  for (let z = 1; z <= numZones; z++) {
    // Seeded RNG per Room + Round + Zone so both phones roll identical spawns!
    const rngZone = mulberry32(hashString(`${code}_SPAWN_R${effRound}_Z${z}`));
    let unmod = 0;
    let diceStr = "";

    if (z === 1 && effRound >= 4 && fac === 'Adepta Sororitas') {
      unmod = 12;
      diceStr = "Auto-12 (Martyrs & Miracles)";
    } else if (unluckyNightActive) {
      const d1 = Math.floor(rngZone() * 6) + 1;
      const d2 = Math.floor(rngZone() * 6) + 1;
      const d3 = Math.floor(rngZone() * 6) + 1;
      const sorted = [d1, d2, d3].sort((a,b) => b - a);
      unmod = sorted[0] + sorted[1];
      diceStr = `3D6 Drop Lowest (${d1},${d2},${d3} → ${unmod})`;
    } else {
      const d1 = Math.floor(rngZone() * 6) + 1;
      const d2 = Math.floor(rngZone() * 6) + 1;
      unmod = d1 + d2;
      diceStr = `2D6 (${d1}+${d2} = ${unmod})`;
    }

    let totalMod = baseRoundMod + extraMod + (jammerActive ? -1 : 0);
    if (z === 1 && firstBonus6) totalMod += 6;
    if (z === 1 && firstBonus12) totalMod += 12;

    const finalRoll = unmod + totalMod;
    const bInfo = getBracketInfo(finalRoll, unmod);
    const unitPicked = (bInfo.key === 'NONE') ? 'None' : pickSyncedUnitFromBracket(bInfo.key, rngZone);

    currentZoneSpawns.push({
      zone: z,
      diceStr,
      unmod,
      totalMod,
      finalRoll,
      bracketKey: bInfo.key,
      bracketLabel: bInfo.label,
      pts: bInfo.pts,
      units: [unitPicked]
    });
  }

  renderSpawnZones();
}

function rollDownZone(idx) {
  const z = currentZoneSpawns[idx];
  const rollDownResult = calculateRollDown(z.bracketKey);
  if (!rollDownResult) {
    return alert("Cannot roll down lower than Bracket [3–4]!");
  }

  const { nextKey, bracketLabel, pts } = rollDownResult;
  const code = (document.getElementById('seedInput').value || 'HADES-1').trim().toUpperCase();
  const rngDown = mulberry32(hashString(`${code}_ROLLDOWN_R${battleRound}_Z${z.zone}_${nextKey}`));

  const newCount = z.units.length * 2;
  let newUnits = [];
  for (let i = 0; i < newCount; i++) {
    newUnits.push(pickSyncedUnitFromBracket(nextKey, rngDown));
  }
  z.bracketKey = nextKey;
  z.bracketLabel = bracketLabel;
  z.pts = pts;
  z.units = newUnits;
  renderSpawnZones();
}

function renderSpawnZones() {
  const container = document.getElementById('spawnResultsContainer');
  container.innerHTML = currentZoneSpawns.map((z, idx) => `
    <div class="card spawn-zone">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap;">
        <span class="badge green">Spawn Zone ${z.zone} • ${z.bracketLabel} (${z.pts})</span>
        <span class="hud-sub">${z.diceStr} | Mod: ${z.totalMod >= 0 ? '+'+z.totalMod : z.totalMod} → <strong>Total: ${z.finalRoll}</strong></span>
      </div>
      <h4 class="card-title" style="margin-top:4px;">${z.units.join('  +  ')}</h4>
      ${(z.bracketKey !== 'NONE' && z.bracketKey !== '3-4') ? `
        <button class="btn-ghost btn-sm" style="margin-top:8px;" onclick="rollDownZone(${idx})">
          ⤵️ Roll Down (Spawn 2x Lower Bracket Units Instead)
        </button>
      ` : ''}
    </div>
  `).join('');
}

// --- SP, CP & RESUPPLY SHOP ---
function gainSP(amount) {
  const remainingCap = spRoundCap - spGainedThisRound;
  if (remainingCap <= 0) {
    if (!confirm(`Round cap of ${spRoundCap} SP reached! Add SP anyway?`)) return;
    sp += amount;
  } else {
    const actual = Math.min(amount, remainingCap);
    sp += actual;
    spGainedThisRound += actual;
  }
  updateHUD();
}

function loseSP(amount) {
  sp = Math.max(0, sp - amount);
  updateHUD();
}

function adjCP(delta) {
  cp = Math.max(0, cp + delta);
  updateHUD();
}

function spendCPForStrat() {
  if (cp <= 0) return alert("0 CP remaining!");
  cp--;
  stratCount++;
  updateHUD();
}

function adjMarker(id, delta, max) {
  const el = document.getElementById(id);
  let val = parseInt(el.innerText, 10) + delta;
  el.innerText = Math.max(0, Math.min(max, val));
}

function setShopFilter(tag, btnEl) {
  currentShopFilter = tag;
  document.querySelectorAll('.filter-bar .chip').forEach(b => b.classList.remove('active'));
  btnEl.classList.add('active');
  renderResupplyTable();
}

function buyResupply(idx) {
  const item = RESUPPLIES[idx];
  const isDoubled = document.getElementById('doubleCostToggle').checked;
  let finalCost = item.cost;

  if (item.varCost) {
    const input = prompt(`Enter X SP to spend on ${item.name}:`, "3");
    if (input === null) return;
    finalCost = parseInt(input, 10) || 0;
  }
  if (isDoubled) finalCost *= 2;

  if (sp < finalCost) {
    return alert(`Insufficient SP! Need ${finalCost} SP (You have ${sp} SP).`);
  }
  sp -= finalCost;
  if (item.autoCP) cp += item.autoCP;
  if (item.name === "A Change of Plans") {
    switchTab(2);
    triggerChangeOfPlans();
  } else if (item.name === "Tempt Fate") {
    drawSecondary(battleRound === 1);
    switchTab(1);
  } else if (item.name === "Advanced Tactics") {
    replaceSecondary();
    switchTab(1);
  }
  updateHUD();
}

function renderResupplyTable() {
  const isDoubled = document.getElementById('doubleCostToggle').checked;
  const container = document.getElementById('resupplyList');

  const filtered = RESUPPLIES.map((r, i) => ({ ...r, origIdx: i }))
    .filter(r => currentShopFilter === 'All' || r.tags.includes(currentShopFilter));

  container.innerHTML = filtered.map(r => {
    const dispCost = r.varCost ? (isDoubled ? "2X SP" : "X SP") : `${isDoubled ? r.cost * 2 : r.cost} SP`;
    return `
      <div class="card resupply">
        <div>
          <span class="badge blue" style="margin-bottom:4px;">${dispCost} • ${r.tags}</span>
          <h4 class="card-title" style="font-size:1rem;">${r.name}</h4>
          <p class="card-desc" style="font-size:0.86rem;">${r.desc}</p>
        </div>
        <button class="btn-blue btn-sm" onclick="buyResupply(${r.origIdx})">Buy</button>
      </div>
    `;
  }).join('');
}

function leaveSession() {
  if (!confirm("Exit current battle terminal?")) return;
  document.getElementById('gameScreen').classList.add('hidden');
  document.getElementById('setupScreen').classList.remove('hidden');
}
