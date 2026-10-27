# 📦 Fires of Armageddon // Bundle: Briefings & Sector Atlas Logic

8-node interactive SVG sector map, parallel hegemony race math, briefing locking protocol, and fullscreen HUD (`js/briefing.js`).

## 📑 Table of Contents
- [js/briefing.js](#file-jsbriefingjs)

---

## File: `js/briefing.js` <a id="file-jsbriefingjs"></a>

````javascript
/**
 * @fileoverview Fires of Armageddon // Briefings, Ship Slider & Sector Atlas Logic
 * Pure logic and boundary adapters for Tab navigation, Shipboard Balance Gauge,
 * and Hololith Auspex Sector Map telemetry.
 */

var BRIEFING_STORAGE_KEY = 'foa_briefing_state_v1';
var STORAGE_KEY_BRIEFING = BRIEFING_STORAGE_KEY;

var SHIP_SLIDER_DATA = {
  "-3": {
    title: "-3 // Total Brig Mutiny & The Red Lockdown (Abyss)",
    desc: "<strong>Mutinous Vault Burn:</strong> Even if you win the Phase, mutinous lower-deck crews burn the Phase-End Cache (<strong>0 RP</strong>!).<br><strong>Dravik's Mandatory Cull &amp; #35 Experimental Ammunition:</strong> 1 random Krieg Infantry squad starts every battle at Half-Strength and Battle-shocked for Round 1, AND all ranged attacks have +1 S, +1 AP, and <strong>[HAZARDOUS]</strong>!<br><strong>High Sanctum Purge Strike:</strong> <strong>Saint Celestine &amp; Aestred Thurga</strong> deploy against you as hostile Bosses hunting <em>The Exile</em>!"
  },
  "-2": {
    title: "-2 // The Brig Demands Blood (Lower Decks Quicksand)",
    desc: "<strong>Battlefield Buffs:</strong> Krieg Infantry keep <strong>+1 to Hit in melee</strong> (below Starting Strength), AND your Vehicles gain <strong>Feel No Pain 6+ against Mortal Wounds</strong>.<br><strong>High Sanctum Cutoff &amp; Unstable Warp-Shells:</strong> Locked out of all <code>Fortify</code> Resupplies except <em>Emergency Shovel Stash (War Trench)</em>, and all Vehicle ranged weapons gain <strong>[HAZARDOUS]</strong> when firing at targets within 18\"!"
  },
  "-1": {
    title: "-1 (Lower Decks Ascendant — Tier I: Ash-Hold Surge)",
    desc: "<strong>Active Operational Threshold Buff (Sub-Routine Alpha):</strong> Siphoning reactor power (<code>94.2% / 58.0 Hz</code>) to Deck 44 corpse-starch vats and siege magazines grants all 044th Krieg Infantry <strong>+1 to Hit in melee</strong> when below Starting Strength (or <em>Feel No Pain 6+</em> within 6\" of <em>The Exile</em>, plus <strong>-1 SP</strong> on your first <em>Resupply / Reinforcements</em> purchase).<br><strong>Phase-End Vault (Sub-Routine Beta):</strong> Optimal Operational Thresholds are -1 and +1 (Unlocking the Phase-End Shipboard Cache: +1 RP or +100 pts Supply Limit) with zero High Sanctum penalties!"
  },
  "0": {
    title: "0 // Balanced Equilibrium (Synchronized Broadsides)",
    desc: "<strong>Battlefield Buff:</strong> Ship batteries fire in harmony—granting <strong>+1 starting Supply Point (SP)</strong> in Horde Mode (or <strong>1 free re-roll of an Anomaly / Spawn Roll</strong> in 1v1).<br><strong>Phase-End Vault Lock:</strong> Ending a Phase at 0 means neither deck controls the vaults—you forfeit the Phase-End Cache (+1 RP) unless you tilt the slider to -1 or +1 before the Phase ends!"
  },
  "1": {
    title: "+1 (High Sanctum Ascendant — Tier I: Sanctum Threshold)",
    desc: "<strong>Operational Threshold Buff:</strong> Appeasing the Sororitas Wardens grants <em>The Exile's</em> unit <strong>re-roll 1s to Hit</strong> and reduces the SP cost of your first <em>Strike</em> or <em>Fortify</em> Resupply purchase each battle by <strong>1 SP</strong>.<br><strong>Phase-End Vault:</strong> Optimal Operational Thresholds are -1 and +1 (Unlocking the Phase-End Shipboard Cache: +1 RP or +100 pts Supply Limit)!"
  },
  "2": {
    title: "+2 // Strict Atonement (No Retreat for the Condemned)",
    desc: "<strong>Buff:</strong> Keep +1 buffs.<br><strong>Quicksand Penalty:</strong> Sororitas Arbites lock the hangars—you are <strong>completely locked out of Traitor Secret Objectives</strong>, cannot use <em>Emergency Evac (5 SP)</em>, and any unit that Falls Back suffers <strong>D3 Mortal Wounds</strong> from orbital punishment volleys!"
  },
  "3": {
    title: "+3 // Total High Sanctum Tyranny (The Martyr's Tithe)",
    desc: "<strong>Buff:</strong> Keep +1/+2 buffs, plus gain <strong>1 free Miracle Die (valued at 5)</strong> once per battle for <em>The Exile</em>.<br><strong>Quicksand Penalty:</strong> The Sororitas confiscate your Phase-End Cache (+1 RP), and <em>The Exile</em> must pass a Leadership test (-1) after every battle or suffer an automatic Battle Scar (<em>Scorched by Purity Seals</em>)!"
  }
};

var ATLAS_NODES = {
  0: {
    title: "Sector Node 0: Equatorial Jungle // The Golgotha Arbor-Basin",
    badge: "DISCOVERED • BIO-OXYGEN LANDING ZONE",
    lore: "A rare surviving basin of petrified iron-wood jungle bridging Armageddon Prime and Secundus. Breathable oxygen pockets, promethium-timber, and the shattered stained-glass hulls of Session 0 Exorcists make this the primary planetfall staging ground.",
    rule: "<strong>Active Sector Rule (Canopy &amp; Wreckage):</strong> Dense iron-wood canopy grants <strong>Stealth</strong> to Infantry; landing site debris grants <strong>Benefit of Cover</strong>. Lingering near the center strains sanity (requires Leadership test or inflicts <strong>1 Warp Counter</strong>).<br><strong>Conquest Incentive:</strong> Solidifies planetfall beachheads and opens primary ground transit corridors between Prime and Secundus.",
    alphaHP: 1,
    betaHP: 2,
    hordeHP: 1
  },
  1: {
    title: "Sector Node 1: Anthrand Siege-Vaults [MUNITIONS CACHE]",
    badge: "UNDISCOVERED • BURIED ORDNANCE DEPOT",
    lore: "Deep beneath the acidic mire-swamps west of the River Stygies lie sealed Segmentum Solar macro-ordnance bunkers and Earthshaker shell stockpiles buried since the Second War for Armageddon.",
    rule: "<strong>Strategic Asset Intelligence (Buried Munitions Cache):</strong> <em>[TELEMETRY CLASSIFIED] — Auspex signatures detect massive unspent siege munitions and ordnance reserves slumbering beneath the silt. Securing this sector promises heavy ballistic resupply advantages and discounted heavy weaponry refits for whichever warlord unseals the vaults.</em>",
    alphaHP: 0,
    betaHP: 0,
    hordeHP: null
  },
  2: {
    title: "Sector Node 2: Stygies Aegis Redoubt [DEACTIVATED MILITARY OUTPOST]",
    badge: "UNDISCOVERED • DORMANT BASTION &amp; AUSPEX ARRAY",
    lore: "An abandoned Tempestus and Militarum fortress-complex overlooking the boiling sulfur bridges of the River Stygies. Its hydra flak-turrets, void-relays, and long-range auspex dishes sit cold and unpowered.",
    rule: "<strong>Strategic Asset Intelligence (Military Outpost):</strong> <em>[TELEMETRY CLASSIFIED] — Fortified garrison commanding the River Stygies crossing. Restoring power to its long-range sensory array promises enhanced orbital recon capabilities and pre-established forward operating fortifications.</em>",
    alphaHP: 0,
    betaHP: 0,
    hordeHP: null
  },
  3: {
    title: "Sector Node 3: Hive Volcanus [IMPERIAL FORGE-HIVE #1]",
    badge: "UNDISCOVERED • GEOTHERMAL MANUFAC-SPIRE",
    lore: "Anchored into the volcanic calderas of western Armageddon Prime, Hive Volcanus houses titanic geothermal plasma-forges and super-heavy tank assembly lines shrouded in volcanic ash.",
    rule: "<strong>Strategic Asset Intelligence (Imperial Forge-Hive #1):</strong> <em>[TELEMETRY CLASSIFIED] — Subterranean manufactorums capable of churning out endless war materiel. Capturing Volcanus promises battlefield support for heavy war engines, mechanized walker cohorts, and armor reclamation.</em>",
    alphaHP: 0,
    betaHP: 0,
    hordeHP: null
  },
  4: {
    title: "Sector Node 4: Tempest Defense Silos [ORBITAL LASER BATTERY]",
    badge: "UNDISCOVERED • SURFACE-TO-ORBIT DEFENSE COMPLEX",
    lore: "Perched along the toxic southern cliffs of the Tempest Ocean, these armored defense silos house dormant anti-ship macro-lasers and coastal void-shield generators.",
    rule: "<strong>Strategic Asset Intelligence (Orbital Defense Battery):</strong> <em>[TELEMETRY CLASSIFIED] — Armored defense silos overlooking the southern approaches. Powering up these macro-batteries promises coastal airspace supremacy, cheaper orbital fire support, and defensive protection against marauding incursions.</em>",
    alphaHP: 0,
    betaHP: 0,
    hordeHP: null
  },
  5: {
    title: "Sector Node 5: Deadlands Ark-Vault [GROUNDED MECHANICUS VESSEL]",
    badge: "UNDISCOVERED • FROZEN ARCHEOTECH RELIQUARY",
    lore: "Half-buried in the sub-zero ash glaciers of the Netheria Peninsula lies a grounded Adeptus Mechanicus Ark-Barge and a sealed pre-Imperial vault-complex humming with ancient power.",
    rule: "<strong>Strategic Asset Intelligence (Sub-Polar Reliquary):</strong> <em>[TELEMETRY CLASSIFIED] — Anomalous energy readings point to ancient archeotech and forgotten technology sealed within permafrost stasis-vaults. Excavating the barge promises access to powerful Antiquity Relics and technological arcana.</em>",
    alphaHP: 0,
    betaHP: 0,
    hordeHP: null
  },
  6: {
    title: "Sector Node 6: Ruins of Hive Hades &amp; Hive Thoraddis [HIVES #2 &amp; #3]",
    badge: "UNDISCOVERED • SHATTERED CRATER &amp; BESIEGED SPIRE",
    lore: "The twin heart of northeastern Armageddon Secundus cited in High Command dispatches: the radioactive, warp-haunted glass crater of ruined Hive Hades and its sister-city Hive Thoraddis, whose upper spires still echo with desperate vox-screams.",
    rule: "<strong>Strategic Asset Intelligence (Twin Hive Nexus):</strong> <em>[TELEMETRY CLASSIFIED] — The strategic crux of Armageddon Secundus. Dominating this shattered ground grants immense campaign momentum and vast strategic influence, though fighting amidst the radioactive glass incurs severe warp turbulence.</em>",
    alphaHP: 0,
    betaHP: 0,
    hordeHP: null
  },
  7: {
    title: "Sector Node 7: The Fire Wastes &amp; The Red Angel's Gate [POLAR CITADEL]",
    badge: "UNDISCOVERED • IMMATERIUM BREACH THRESHOLD",
    lore: "Across the Boiling Sea and past Phoenix Island lies the scorched northern continent of the Fire Wastes—where the basalt cliffs of the Crimson Mesa and the Red Angel's Gate bleed endless nightmare legions into reality.",
    rule: "<strong>Strategic Asset Intelligence (Polar Rift Citadel):</strong> <em>[TELEMETRY CLASSIFIED] — The apocalyptic gateway anchoring the daemon world incursion. Sealing or claiming this threshold represents the ultimate theatre objective and planetary supremacy.</em>",
    alphaHP: 0,
    betaHP: 0,
    hordeHP: null
  }
};

var briefingState = {
  activeDossier: 'beta',
  unlockedAlpha: false,
  unlockedBeta: false,
  shipSlider: -1,
  selectedNode: 0
};

/**
 * Persists current briefing UI state to browser localStorage.
 */
function saveBriefingState() {
  if (typeof localStorage === 'undefined') return;
  if (typeof document !== 'undefined' && !document.getElementById('dossierBeta') && !document.getElementById('atlas-node-inspector')) return;
  try {
    localStorage.setItem(BRIEFING_STORAGE_KEY, JSON.stringify(briefingState));
  } catch (e) {
    console.warn('Could not save briefing state:', e);
  }
}

/**
 * Restores briefing state from localStorage and URL hash parameters.
 */
function restoreBriefingState() {
  try {
    var raw = typeof localStorage !== 'undefined' ? localStorage.getItem(BRIEFING_STORAGE_KEY) : null;
    if (raw) {
      var parsed = JSON.parse(raw);
      briefingState = Object.assign({}, briefingState, parsed);
    }
  } catch (e) {
    console.warn('Could not restore briefing state:', e);
  }

  // URL hash navigation takes precedence if a valid hash is specified
  if (typeof window !== 'undefined' && window.location) {
    var validTabs = ['alpha', 'beta', 'atlas', 'rules'];
    var hashTab = (window.location.hash || '').replace('#', '').toLowerCase();
    if (validTabs.indexOf(hashTab) !== -1) {
      briefingState.activeDossier = hashTab;
    }
  }

  applyBriefingState();
}

/**
 * Applies current in-memory briefing state to DOM nodes.
 */
function applyBriefingState() {
  showDossier(briefingState.activeDossier, false);
  if (briefingState.unlockedAlpha) unlockTab('Alpha', false);
  if (briefingState.unlockedBeta) unlockTab('Beta', false);
  selectSlider(briefingState.shipSlider, false);
  selectAtlasNode(briefingState.selectedNode, false);
}

/**
 * Sets global faction audio and visual theme from briefing selections.
 * @param {string} theme - 'necron' or 'militarum'
 * @param {boolean} [persist=true] - Whether to save to storage
 */
function applyGlobalFactionThemeFromBriefing(theme, persist) {
  if (persist === undefined) persist = true;
  if (typeof window !== 'undefined' && window.VoxAudio && typeof window.VoxAudio.setFactionTheme === 'function') {
    window.VoxAudio.setFactionTheme(theme, persist);
  }
  if (typeof document !== 'undefined' && document.body && document.body.classList) {
    document.body.classList.toggle('theme-necron', theme === 'necron');
    document.body.classList.toggle('theme-militarum', theme === 'militarum');
  }
  if (persist && (theme === 'necron' || theme === 'militarum')) {
    try {
      if (typeof localStorage !== 'undefined') localStorage.setItem('foa_faction_theme_v1', theme);
    } catch (e) {}
  }
}

/**
 * Switches the active briefing dossier tab.
 * @param {string} which - 'alpha' | 'beta' | 'atlas' | 'rules'
 * @param {boolean} [persist=true]
 */
function showDossier(which, persist) {
  if (persist === undefined) persist = true;
  briefingState.activeDossier = which;
  if (typeof document !== 'undefined' && document.body && document.body.classList) {
    document.body.classList.toggle('necron-briefing-active', which === 'beta');
  }
  if (which === 'beta' && briefingState.unlockedBeta) {
    applyGlobalFactionThemeFromBriefing('necron', persist);
  } else if (which === 'alpha' && briefingState.unlockedAlpha) {
    applyGlobalFactionThemeFromBriefing('militarum', persist);
  }

  var map = {
    alpha: ['dossierAlpha', 'btnAlpha'],
    beta: ['dossierBeta', 'btnBeta'],
    atlas: ['dossierAtlas', 'btnAtlas'],
    rules: ['dossierRules', 'btnRules']
  };

  if (typeof document !== 'undefined') {
    Object.keys(map).forEach(function(k) {
      var entry = map[k];
      var divEl = document.getElementById(entry[0]);
      var btnEl = document.getElementById(entry[1]);
      if (divEl && divEl.classList) divEl.classList.toggle('hidden', k !== which);
      if (btnEl && btnEl.classList) btnEl.classList.toggle('active', k === which);
    });
  }

  if (which === 'atlas') {
    selectAtlasNode(briefingState.selectedNode, false);
  }

  if (persist) saveBriefingState();
}

/**
 * Unlocks a restricted faction tab.
 * @param {string} who - 'Alpha' or 'Beta'
 * @param {boolean} [persist=true]
 */
function unlockTab(who, persist) {
  if (persist === undefined) persist = true;
  if (typeof document !== 'undefined') {
    var gate = document.getElementById('gate' + who);
    var content = document.getElementById('content' + who);
    if (gate && gate.classList) gate.classList.add('hidden');
    if (content && content.classList) content.classList.remove('hidden');
  }
  if (who === 'Alpha') {
    briefingState.unlockedAlpha = true;
    applyGlobalFactionThemeFromBriefing('militarum', persist);
  }
  if (who === 'Beta') {
    briefingState.unlockedBeta = true;
    applyGlobalFactionThemeFromBriefing('necron', persist);
  }
  if (persist) saveBriefingState();
}

/**
 * Re-locks a faction tab.
 * @param {string} who - 'Alpha' or 'Beta'
 * @param {boolean} [persist=true]
 */
function lockTab(who, persist) {
  if (persist === undefined) persist = true;
  if (typeof document !== 'undefined') {
    var gate = document.getElementById('gate' + who);
    var content = document.getElementById('content' + who);
    if (gate && gate.classList) gate.classList.remove('hidden');
    if (content && content.classList) content.classList.add('hidden');
  }
  if (who === 'Alpha') {
    briefingState.unlockedAlpha = false;
    if (briefingState.unlockedBeta) applyGlobalFactionThemeFromBriefing('necron', persist);
  }
  if (who === 'Beta') {
    briefingState.unlockedBeta = false;
    if (briefingState.unlockedAlpha) applyGlobalFactionThemeFromBriefing('militarum', persist);
  }
  if (persist) saveBriefingState();
}

/**
 * Selects and highlights a position on the read-only Shipboard Slider Gauge.
 * @param {number|string} val - Slider position (-3 to 3)
 * @param {boolean} [persist=true]
 */
function selectSlider(val, persist) {
  if (persist === undefined) persist = true;
  var key = String(val);
  briefingState.shipSlider = Number(val);

  if (typeof document !== 'undefined') {
    for (var i = -3; i <= 3; i++) {
      var btn = document.getElementById('sliderBtn' + i);
      if (btn && btn.classList) btn.classList.toggle('active', i === Number(val));
      var nodeEl = document.getElementById('node' + i);
      if (nodeEl && nodeEl.classList) {
        nodeEl.classList.toggle('active', i === Number(val));
        nodeEl.classList.remove('active-brig', 'active-bal', 'active-sanctum');
        if (i === Number(val)) {
          if (i < 0) nodeEl.classList.add('active-brig');
          else if (i === 0) nodeEl.classList.add('active-bal');
          else nodeEl.classList.add('active-sanctum');
        }
      }
      var row = document.getElementById('reckRow' + i);
      if (row && row.classList) row.classList.toggle('highlight-row', i === Number(val));
    }
    var info = SHIP_SLIDER_DATA[key] || SHIP_SLIDER_DATA["-1"] || SHIP_SLIDER_DATA["0"];
    var label = document.getElementById('shipSliderLabel');
    var box = document.getElementById('sliderDetailBox');
    if (label) label.textContent = 'Current State: ' + info.title;
    if (box) box.innerHTML = '<div style="font-weight:800; color:var(--gold); margin-bottom:6px;">' + info.title + '</div><div style="font-size:0.88rem; line-height:1.55;">' + info.desc + '</div>';
  }
  if (persist) saveBriefingState();
}

/**
 * Renders an 8-segment hegemony / dominance bar.
 * @param {string} containerId - Element ID
 * @param {number|null} count - Active HP
 * @param {string} activeClass - 'alpha' | 'beta' | 'horde'
 */
function renderHegBar(containerId, count, activeClass) {
  if (typeof document === 'undefined') return;
  var el = document.getElementById(containerId);
  if (!el) return;
  if (count === null) {
    el.innerHTML = Array.from({ length: 8 }, function() {
      return '<div class="heg-seg unknown-fog" style="border-radius:3px; border:1px solid #6e40aa;"></div>';
    }).join('');
    return;
  }
  el.innerHTML = Array.from({ length: 8 }, function(_, idx) {
    var filled = idx < count;
    var bg = filled
      ? (activeClass === 'alpha' ? '#f5b041' : activeClass === 'beta' ? '#3b82f6' : '#ff4757')
      : '#161b22';
    return '<div class="heg-seg ' + (filled ? 'active-' + activeClass : '') + '" style="background:' + bg + '; border-radius:3px; border:1px solid #262c40;"></div>';
  }).join('');
}

/**
 * Changes Auspex zoom scale.
 * @param {string} level - '1x' | '15x' | '22x'
 */
function setAuspexZoom(level) {
  if (typeof document === 'undefined') return;
  var vp = document.getElementById('auspexViewport');
  if (!vp || !vp.classList) return;
  vp.classList.remove('zoom-1x', 'zoom-15x', 'zoom-22x');
  vp.classList.add('zoom-' + level);

  ['1', '15', '22'].forEach(function(k) {
    var btn = document.getElementById('zoomBtn' + k);
    if (btn && btn.classList) btn.classList.toggle('active', k + 'x' === level);
  });
}

/**
 * Toggles hololith fullscreen mode for the sector map.
 */
function toggleAuspexFullscreen() {
  if (typeof document === 'undefined') return;
  var frame = document.getElementById('auspexMapFrame');
  var btn = document.getElementById('fullscreenMapBtn');
  var quickHud = document.getElementById('fullscreenQuickHud');
  if (!frame || !frame.classList) return;

  var isFs = frame.classList.toggle('hololith-fullscreen');
  if (btn) {
    btn.textContent = isFs ? '✕ Exit Fullscreen' : '🔍 Expand Fullscreen';
    if (btn.classList) btn.classList.toggle('active', isFs);
  }
  if (quickHud && quickHud.style) {
    quickHud.style.display = isFs ? 'block' : 'none';
  }
}

/**
 * Collapses or reveals HUD details in fullscreen mode.
 */
function toggleFsHudDetails() {
  if (typeof document === 'undefined') return;
  var details = document.getElementById('fsHudDetails');
  var btn = document.getElementById('fsToggleDetailsBtn');
  if (!details || !details.classList) return;
  var isHidden = details.classList.toggle('hidden-details');
  if (btn) {
    btn.textContent = isHidden ? '▾ Show Telemetry' : '▴ Hide Telemetry';
  }
}

/**
 * Returns formatted sector dominance narrative.
 * @param {object} n - Sector node descriptor
 * @returns {string}
 */
function getDominanceText(n) {
  if (!n) return '';
  if (n.hordeHP === null && n.alphaHP === 0 && n.betaHP === 0) {
    return '◌ Fog of War — No Hegemony Established (?/8 HP)';
  }
  var a = n.alphaHP || 0;
  var b = n.betaHP || 0;
  var h = n.hordeHP || 0;
  if (b > a && b > h) return '💀 Lord Commander Junebug Leading (' + b + ' / 8 HP)';
  if (a > b && a > h) return '🦅 The Exile // Sanctuary of Ash Leading (' + a + ' / 8 HP)';
  if (h > a && h > b) return '👁️🗨️ 3rd Alliance Leading (' + h + ' / 8 HP)';
  return '⚔️ Contested Stalemate (Tied at ' + Math.max(a, b, h) + ' HP)';
}

/**
 * Selects an Auspex Sector Node (0-7) and updates inspection cards.
 * @param {number} nodeId
 * @param {boolean} [persist=true]
 */
function selectAtlasNode(nodeId, persist) {
  if (persist === undefined) persist = true;
  var n = ATLAS_NODES[nodeId] || ATLAS_NODES[0];
  briefingState.selectedNode = nodeId;

  if (typeof document !== 'undefined') {
    // Highlight SVG node
    var mapNodes = document.querySelectorAll('#armageddon-sector-map .atlas-node-group, #armageddon-sector-map .map-node-group');
    if (mapNodes) {
      mapNodes.forEach(function(el) {
        if (el && el.classList) {
          el.classList.toggle('selected-node', Number(el.getAttribute('data-node-id')) === nodeId);
        }
      });
    }

    // Highlight Fullscreen HUD selector pills
    for (var i = 0; i <= 7; i++) {
      var pill = document.getElementById('fsPill' + i);
      if (pill && pill.classList) pill.classList.toggle('active', i === nodeId);
    }

    var dominanceText = getDominanceText(n);

    // Standard non-fullscreen Inspector
    var titleEl = document.getElementById('inspectorNodeTitle') || document.getElementById('insp-title');
    if (titleEl) titleEl.textContent = n.title;

    var badgeEl = document.getElementById('inspectorNodeBadge') || document.getElementById('insp-badge');
    if (badgeEl) badgeEl.textContent = n.badge;

    var domEl = document.getElementById('inspectorDominance');
    if (domEl) domEl.textContent = dominanceText;

    var loreEl = document.getElementById('inspectorNodeLore') || document.getElementById('insp-desc');
    if (loreEl) loreEl.textContent = n.lore;

    var ruleEl = document.getElementById('inspectorNodeRule') || document.getElementById('insp-rule');
    if (ruleEl) ruleEl.innerHTML = n.rule;

    var lblAlpha = document.getElementById('heg-label-alpha') || document.getElementById('heg-val-alpha');
    if (lblAlpha) lblAlpha.textContent = n.alphaHP + ' / 8 HP';

    var lblBeta = document.getElementById('heg-label-beta') || document.getElementById('heg-val-beta');
    if (lblBeta) lblBeta.textContent = n.betaHP + ' / 8 HP';

    var lblHorde = document.getElementById('heg-label-horde') || document.getElementById('heg-val-horde');
    if (lblHorde) {
      lblHorde.textContent = n.hordeHP === null ? '??? / 8 HP (Shrouded in Ash)' : n.hordeHP + ' / 8 HP';
    }

    renderHegBar('heg-bar-alpha', n.alphaHP, 'alpha');
    renderHegBar('heg-bar-beta', n.betaHP, 'beta');
    renderHegBar('heg-bar-horde', n.hordeHP, 'horde');

    // Fullscreen Interactive HUD elements
    var fsTitle = document.getElementById('fsHudTitle');
    if (fsTitle) fsTitle.textContent = n.title;

    var fsBadge = document.getElementById('fsHudBadge');
    if (fsBadge) fsBadge.textContent = n.badge;

    var fsDom = document.getElementById('fsHudDominance');
    if (fsDom) fsDom.textContent = dominanceText;

    var fsRule = document.getElementById('fsHudRule');
    if (fsRule) fsRule.innerHTML = n.rule;

    var fsAlpha = document.getElementById('fs-heg-val-alpha');
    if (fsAlpha) fsAlpha.textContent = n.alphaHP + ' / 8 HP';

    var fsBeta = document.getElementById('fs-heg-val-beta');
    if (fsBeta) fsBeta.textContent = n.betaHP + ' / 8 HP';

    var fsHorde = document.getElementById('fs-heg-val-horde');
    if (fsHorde) {
      fsHorde.textContent = n.hordeHP === null ? '??? / 8 HP' : n.hordeHP + ' / 8 HP';
    }

    renderHegBar('fs-heg-bar-alpha', n.alphaHP, 'alpha');
    renderHegBar('fs-heg-bar-beta', n.betaHP, 'beta');
    renderHegBar('fs-heg-bar-horde', n.hordeHP, 'horde');
  }

  if (persist) saveBriefingState();
}

// Locked Campaign State (Updated strictly by Campaign Master patches)
var CURRENT_SHIP_SLIDER = -1;

if (typeof window !== 'undefined') {
  window.BRIEFING_STORAGE_KEY = BRIEFING_STORAGE_KEY;
  window.STORAGE_KEY_BRIEFING = STORAGE_KEY_BRIEFING;
  window.SHIP_SLIDER_DATA = SHIP_SLIDER_DATA;
  window.ATLAS_NODES = ATLAS_NODES;
  window.CURRENT_SHIP_SLIDER = CURRENT_SHIP_SLIDER;
  window.briefingState = briefingState;
  window.saveBriefingState = saveBriefingState;
  window.restoreBriefingState = restoreBriefingState;
  window.applyBriefingState = applyBriefingState;
  window.applyGlobalFactionThemeFromBriefing = applyGlobalFactionThemeFromBriefing;
  window.showDossier = showDossier;
  window.unlockTab = unlockTab;
  window.lockTab = lockTab;
  window.selectSlider = selectSlider;
  window.renderHegBar = renderHegBar;
  window.setAuspexZoom = setAuspexZoom;
  window.toggleAuspexFullscreen = toggleAuspexFullscreen;
  window.toggleFsHudDetails = toggleFsHudDetails;
  window.getDominanceText = getDominanceText;
  window.selectAtlasNode = selectAtlasNode;

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      window.addEventListener('DOMContentLoaded', restoreBriefingState);
    } else {
      restoreBriefingState();
    }
  }
  selectSlider(CURRENT_SHIP_SLIDER);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    BRIEFING_STORAGE_KEY: BRIEFING_STORAGE_KEY,
    STORAGE_KEY_BRIEFING: STORAGE_KEY_BRIEFING,
    SHIP_SLIDER_DATA: SHIP_SLIDER_DATA,
    ATLAS_NODES: ATLAS_NODES,
    CURRENT_SHIP_SLIDER: CURRENT_SHIP_SLIDER,
    briefingState: briefingState,
    saveBriefingState: saveBriefingState,
    restoreBriefingState: restoreBriefingState,
    applyBriefingState: applyBriefingState,
    applyGlobalFactionThemeFromBriefing: applyGlobalFactionThemeFromBriefing,
    showDossier: showDossier,
    unlockTab: unlockTab,
    lockTab: lockTab,
    selectSlider: selectSlider,
    renderHegBar: renderHegBar,
    setAuspexZoom: setAuspexZoom,
    toggleAuspexFullscreen: toggleAuspexFullscreen,
    toggleFsHudDetails: toggleFsHudDetails,
    getDominanceText: getDominanceText,
    selectAtlasNode: selectAtlasNode
  };
}
````
