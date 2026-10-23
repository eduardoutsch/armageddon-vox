# 📦 Fires of Armageddon // Bundle: Mode 4 - Hostile Matrix & Nemesis Archive

Complete source code for the Hostile Threat Matrix, Cross-Mode Nemesis Bounty Ledger, Nemesis Dossier Induction Compiler, Unbound Datasheets, and Custom Shelf Pool (`pages/roster.html`).

## 📑 Table of Contents
- [pages/roster.html](#file-pagesrosterhtml)

---

## File: `pages/roster.html` <a id="file-pagesrosterhtml"></a>

````html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fires of Armageddon // Hostile Threat Matrix &amp; Nemesis Archive</title>
  <link rel="icon" type="image/svg+xml" href="../assets/favicon.svg">
  <link rel="apple-touch-icon" href="../assets/favicon.svg">
  <link rel="stylesheet" href="../css/style.css">
  <style>
    .datasheet-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-top: 3px solid var(--red);
      border-radius: 14px;
      padding: 18px;
      margin-bottom: 16px;
      box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    }
    .stat-strip {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 6px;
      background: #090b10;
      border: 1px solid var(--border);
      border-radius: 10px;
      padding: 10px 8px;
      margin: 12px 0;
      text-align: center;
    }
    .stat-cell {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .stat-cell .s-lbl {
      font-size: 0.68rem;
      font-weight: 800;
      color: var(--gold);
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }
    .stat-cell .s-val {
      font-size: 1.05rem;
      font-weight: 900;
      color: #fff;
      margin-top: 2px;
      font-family: monospace;
    }
    .weapon-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.82rem;
      margin: 10px 0;
    }
    .weapon-table th, .weapon-table td {
      border: 1px solid var(--border);
      padding: 7px 9px;
      text-align: left;
    }
    .weapon-table th {
      background: #0b0d13;
      color: var(--gold);
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.6px;
    }
    .dossier-preview-box {
      background: #040805;
      border: 1.5px dashed rgba(0, 255, 136, 0.4);
      border-radius: 10px;
      padding: 14px;
      font-family: 'Courier New', Consolas, monospace;
      font-size: 0.84rem;
      color: #66ffb8;
      text-shadow: 0 0 6px rgba(0, 255, 136, 0.35);
      white-space: pre-wrap;
      margin: 14px 0;
      line-height: 1.5;
    }
    .cloud-sync-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      font-family: monospace;
      font-size: 0.75rem;
      padding: 4px 10px;
      border-radius: 999px;
      background: rgba(16, 185, 129, 0.14);
      border: 1px solid rgba(16, 185, 129, 0.45);
      color: #6ee7b7;
    }
    .locked-status-select {
      padding: 6px 10px;
      font-size: 0.78rem;
      font-weight: 800;
      pointer-events: none;
      opacity: 0.92;
      cursor: default;
      border: 1px solid var(--gold);
      background: #090b10;
      color: var(--gold);
    }
  </style>
</head>
<body>

  <!-- CAMPAIGN SUITE TOP NAVIGATION -->
  <nav class="suite-nav">
    <a href="../index.html" class="suite-link">📖 Field Codex &amp; Guide</a>
    <a href="spawner.html" class="suite-link">🧟 Mode 1: Horde Command &amp; Spawner</a>
    <a href="pvp.html" class="suite-link">⚔️ Mode 2: 1v1 Ash Wastes PvP</a>
    <a href="rogue.html" class="suite-link">🎲 Mode 3: Rogue Sector &amp; AI Tracker</a>
    <a href="roster.html" class="suite-link active">🎖️ Mode 4: Hostile Matrix &amp; Nemeses</a>
    <a href="crusade.html" class="suite-link">🏆 Mode 5: Crusade Quartermaster</a>
    <a href="briefing.html" class="suite-link">📜 Mode 6: Briefings, Ship &amp; Atlas</a>
    <a href="vox.html" class="suite-link">📡 Mode 7: Astropath Vox</a>
  </nav>

<div class="app-shell">

  <div class="hero-card" style="margin-bottom:18px;">
    <div class="hero-header">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
        <div class="status-pill">Ordo Malleus Threat Archive • Cloud-Synced Spawn Pools</div>
        <span id="cloudSyncBadge" class="cloud-sync-pill">☁️ Supabase Pool Sync Ready</span>
      </div>
      <h1 class="hero-title">Hostile Threat Matrix &amp; Nemesis Vault</h1>
      <p class="hero-subtitle">
        Cross-mode Nemesis Bounty Board, Inquisitorial Nemesis Induction Compiler, Unbound Adversaries Reference Codex, and Cloud-Synced Standard Horde Spawn Brackets.
      </p>
    </div>

    <!-- 3 SUB-TABS FOR CONCEPT 5 -->
    <div class="nav-pills" style="margin-bottom:0;">
      <button id="rosTabBtn1" class="active" onclick="switchRosterTab('nemesis')">💀 1. Nemesis Bounty &amp; Dossier</button>
      <button id="rosTabBtn2" onclick="switchRosterTab('unbound')">👹 2. Unbound Adversaries Codex</button>
      <button id="rosTabBtn3" onclick="switchRosterTab('brackets')">🧟 3. Horde Brackets &amp; Cloud Pool</button>
    </div>
  </div>

  <!-- ===================================================================== -->
  <!-- TAB A: CROSS-MODE NEMESIS BOUNTY BOARD & DIRECT VOX DOSSIER COMPILER  -->
  <!-- ===================================================================== -->
  <div id="rosTabNemesis">

    <div class="section-header" style="margin-top:0;">
      <h3>Active Cross-Mode Nemesis Bounty Ledger</h3>
      <span class="hud-sub">Status Locked by Campaign Master • Slaying a Nemesis Awards +2/+3 XP &amp; +1 SPt</span>
    </div>

    <!-- INDUCTED NEMESIS #1: SAINT CELESTINE -->
    <div class="datasheet-card" style="border-top-color:var(--gold);">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:8px;">
        <div>
          <span class="rule-tag" style="border-color:var(--gold); color:var(--gold);">NEMESIS #01 • SESSION 0 INDUCTION (PL 4)</span>
          <h3 style="margin:6px 0 2px 0; color:#fff; font-size:1.2rem;">🪽 Saint Celestine, <em>"The Ashen Seraph of the High Sanctum"</em></h3>
          <div style="font-size:0.8rem; color:var(--muted);">Faction: Imperium / Adepta Sororitas (High Sanctum Auditor)</div>
        </div>
        <select id="nemStatus1" class="locked-status-select" tabindex="-1" aria-disabled="true" onchange="saveRosterPageState()">
          <option value="roaming">🔒 GM Status: 🟡 Orbiting High Sanctum (Dormant)</option>
          <option value="deployed">🔒 GM Status: 🔴 Deployed on Surface (Active Threat!)</option>
          <option value="slain">🔒 GM Status: 🟢 Slain — Reconstructing (Cooldown)</option>
        </select>
      </div>
      <p class="card-desc" style="margin-top:10px;">
        <strong>Origin Feat (Golgotha Arbor-Basin — Session 0):</strong> After the Krieg Leman Russ Vanquishers (<em>"The Shrine-Breakers"</em>) detonated every Sororitas war-engine around the central Landing Site, Celestine descended from the sulfuric storm-clouds directly into the Krieg rear deployment zone—slaughtering the command echelon and seizing the home objective to clinch a razor-thin 3-VP victory.
      </p>
      <div class="card" style="background:#0b0d13; margin:10px 0 0 0; font-size:0.85rem;">
        <strong style="color:var(--gold);">Permanent Nemesis Trait — <em>Judgment of the Blackened Glass</em>:</strong> When deployed on the surface (via Orbital Descent or a Slider -3 Purge Strike), Celestine deep-strikes within 9" of the trailing player's home objective and gains <strong>[PRECISION]</strong> and <strong>[DEVASTATING WOUNDS]</strong> against units carrying Warp Counters.
      </div>
    </div>

    <!-- INDUCTED NEMESIS #2: AESTRED THURGA & AGATHAE DOLAN -->
    <div class="datasheet-card" style="border-top-color:var(--purple);">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:8px;">
        <div>
          <span class="rule-tag" style="border-color:var(--purple); color:var(--purple);">NEMESIS #02 • SESSION 0 INDUCTION (PL 3)</span>
          <h3 style="margin:6px 0 2px 0; color:#fff; font-size:1.2rem;">🚩 Aestred Thurga &amp; Agathae Dolan, <em>"Keepers of the Penitentiary Tapestry"</em></h3>
          <div style="font-size:0.8rem; color:var(--muted);">Faction: Imperium / Adepta Sororitas (Reliquant &amp; Hagiolater)</div>
        </div>
        <select id="nemStatus2" class="locked-status-select" tabindex="-1" aria-disabled="true" onchange="saveRosterPageState()">
          <option value="roaming">🔒 GM Status: 🟡 Orbiting High Sanctum (Dormant)</option>
          <option value="deployed">🔒 GM Status: 🔴 Deployed on Surface (Active Threat!)</option>
          <option value="slain">🔒 GM Status: 🟢 Slain — Reconstructing (Cooldown)</option>
        </select>
      </div>
      <p class="card-desc" style="margin-top:10px;">
        <strong>Origin Feat (Golgotha Arbor-Basin — Session 0):</strong> Struck down a forward Krieg Scout Sentinel in Round 1 with <em>Devastating Wounds</em> and weathered 11 point-blank Krieg shovel strikes without failing a single 3+ save, recording every transgression into the Auto-Tapestry of Judgement.
      </p>
      <div class="card" style="background:#0b0d13; margin:10px 0 0 0; font-size:0.85rem;">
        <strong style="color:var(--purple);">Permanent Nemesis Trait — <em>The Unforgiving Ledger</em>:</strong> Enemy units within 6" of Aestred Thurga cannot re-roll Battle-shock tests and suffer <strong>-1 Objective Control (OC)</strong> (to a minimum of 1).
      </div>
    </div>

    <!-- SUBMIT NEW NEMESIS DOSSIER TO CAMPAIGN MASTER -->
    <div class="card" style="border-left:4px solid var(--red); margin-top:24px;">
      <div class="section-header" style="margin-top:0;">
        <h3 style="color:var(--red);">📁 Compile &amp; Transmit New Nemesis Dossier to Campaign Master</h3>
        <span class="hud-sub">"Vibe-Check" Induction Protocol</span>
      </div>
      <p class="card-desc" style="margin-bottom:14px;">
        Whenever a Horde Warlord survives Round 6, slays a Player's Character, or any enemy Monster/Sergeant performs an unforgettable cinematic feat in Horde, 1v1, or Rogue Sector battles, compile their field folder below and transmit it directly to the Campaign Master via the Astropathic Vox!
      </p>

      <div class="choice-grid" style="margin-bottom:12px;">
        <div>
          <label class="hud-label" style="display:block; margin-bottom:4px;">1. Reporting Commander Conduit</label>
          <select id="nemReportChannel" onchange="updateNemesisPreview()" style="width:100%; padding:10px;">
            <option value="alpha">🦅 The Exile // Sanctuary of Ash (Terminal Alpha)</option>
            <option value="beta">💀 Lord Commander Junebug (Terminal Beta)</option>
          </select>
        </div>
        <div>
          <label class="hud-label" style="display:block; margin-bottom:4px;">2. Encounter Mode &amp; Sector Node</label>
          <select id="nemReportSector" onchange="updateNemesisPreview()" style="width:100%; padding:10px;">
            <option value="Mode 1: Horde Breach // Node 0 (Golgotha Arbor-Basin)">Mode 1: Horde // Node 0 (Golgotha Jungle)</option>
            <option value="Mode 1: Horde Breach // Node 1 (Hive Death Mire)">Mode 1: Horde // Node 1 (Hive Death Mire)</option>
            <option value="Mode 1: Horde Breach // Node 2 (Hive Infernus)">Mode 1: Horde // Node 2 (Hive Infernus)</option>
            <option value="Mode 2: 1v1 PvP Clash // Unbound Adversary">Mode 2: 1v1 PvP // Unbound Adversary</option>
            <option value="Mode 3: Rogue Sector Auxiliary Clash">Mode 3: Rogue Sector Auxiliary Clash</option>
          </select>
        </div>
      </div>

      <div class="choice-grid" style="margin-bottom:12px;">
        <div>
          <label class="hud-label" style="display:block; margin-bottom:4px;">3. Enemy Faction &amp; Unit Datasheet</label>
          <input type="text" id="nemReportUnit" oninput="updateNemesisPreview()" placeholder="e.g. Tyranids — Screamer-Killer / Chaos Lord" style="width:100%; padding:10px;">
        </div>
        <div>
          <label class="hud-label" style="display:block; margin-bottom:4px;">4. Triggering Battlefield Feat</label>
          <select id="nemReportFeat" onchange="updateNemesisPreview()" style="width:100%; padding:10px;">
            <option value="Slain a Player Warlord / Character in combat">Slain a Player Warlord / Character</option>
            <option value="Survived Battle Round 6 (The Final Stand) as Horde Warlord">Survived Round 6 Final Stand (Horde Warlord)</option>
            <option value="Tanked overwhelming firepower &amp; wiped multiple units">Tanked overwhelming fire &amp; wiped units</option>
            <option value="Epic cinematic moment / Unbelievable dice streak">Epic cinematic moment / Dice streak</option>
          </select>
        </div>
      </div>

      <label class="hud-label" style="display:block; margin-bottom:4px;">5. Eye-Witness Combat Log (What Happened on the Table?)</label>
      <textarea id="nemReportNotes" oninput="updateNemesisPreview()" placeholder="Describe how this enemy unit earned its infamy (e.g., 'Spawned in Zone 2, survived two Vanquisher shots on 1 Wound, and ate Dreir's Death Riders in Round 5')..." style="width:100%; min-height:74px; background:#0b0d13; color:var(--text); border:1px solid var(--border); border-radius:8px; padding:10px; font-family:inherit;"></textarea>

      <div class="dossier-preview-box" id="nemDossierPreview">+++ ORDO MALLEUS // NEW NEMESIS INDUCTION DOSSIER +++
• FILING COMMANDER: THE EXILE // SANCTUARY OF ASH
• THEATRE &amp; MODE: Mode 1: Horde Breach // Node 0 (Golgotha Arbor-Basin)
• HOSTILE DATASHEET / FACTION: [Unspecified Hostile Entity]
• TRIGGERING FEAT: Slain a Player Warlord / Character in combat
• EYE-WITNESS COMBAT LOG: "Survived engagement and demonstrated anomalous lethality."
------------------------------------------------
REQUEST FOR CAMPAIGN MASTER: Please induct this hostile entity into the Cross-Mode Nemesis Ledger (AGENT.md) and emit a CRT Vox-Dispatch christening its permanent Name, Title, Lore, and Boss Battle Trait!</div>

      <button type="button" class="launch-btn" data-sfx="custom" onclick="transmitNemesisDossier()" style="margin-top:8px;">
        📡 Transmit Directly via Astropathic Vox →
      </button>
    </div>
  </div>

  <!-- ===================================================================== -->
  <!-- TAB B: UNBOUND ADVERSARIES CODEX (POWER LEVELS 1 TO 4)                -->
  <!-- ===================================================================== -->
  <div id="rosTabUnbound" class="hidden">
    <div class="section-header" style="margin-top:0;">
      <h3>Crusade: Armageddon // Unbound Adversaries Datasheets</h3>
      <span class="hud-sub">Live Manifestations Rolled by Campaign Master on Vox</span>
    </div>
    <p class="card-desc" style="margin-bottom:16px;">
      Unbound Adversaries have the <strong>UNBOUND ADVERSARIES</strong> faction keyword, a <strong>5+ Invulnerable Save</strong>, and the <strong>Deep Strike</strong> ability. Whenever an Unbound Adversary is triggered in <a href="pvp.html" style="color:var(--gold);">Mode 2: 1v1 PvP</a> or hijacks a <a href="spawner.html" style="color:var(--gold);">Mode 1: Horde Spawn Zone</a> via a <strong>Warp-Breach Intrusion (5+ at [10–12] / [13+])</strong>, transmit a ping to the <strong>Campaign Master</strong> on <code>vox.html</code> to reveal whether a standard Unbound unit, an active Surface Nemesis, or a Classified Apex Anomaly steps out of the ash-storm!
    </p>

    <!-- POWER LEVEL 1: WARP-SPAWNED HORRORS / LESSER PACK -->
    <div class="datasheet-card">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <h3 style="margin:0; color:#fff;">👹 Power Level 1: Unbound Lesser Pack (5 Models)</h3>
        <span class="rule-tag">5 Models • Infantry • 5+ Invuln</span>
      </div>
      <div class="stat-strip">
        <div class="stat-cell"><span class="s-lbl">M</span><span class="s-val">7"</span></div>
        <div class="stat-cell"><span class="s-lbl">T</span><span class="s-val">4</span></div>
        <div class="stat-cell"><span class="s-lbl">SV</span><span class="s-val">5+</span></div>
        <div class="stat-cell"><span class="s-lbl">W</span><span class="s-val">1</span></div>
        <div class="stat-cell"><span class="s-lbl">LD</span><span class="s-val">7+</span></div>
        <div class="stat-cell"><span class="s-lbl">OC</span><span class="s-val">1</span></div>
      </div>
      <table class="weapon-table">
        <thead>
          <tr><th>Weapon</th><th>Range</th><th>A</th><th>WS/BS</th><th>S</th><th>AP</th><th>D</th><th>Abilities</th></tr>
        </thead>
        <tbody>
          <tr><td>Warp-bolt Volley</td><td>18"</td><td>2</td><td>4+</td><td>4</td><td>0</td><td>1</td><td>[ASSAULT]</td></tr>
          <tr><td>Hellforged Talons &amp; Blades</td><td>Melee</td><td>3</td><td>3+</td><td>4</td><td>-1</td><td>1</td><td>[SUSTAINED HITS 1]</td></tr>
        </tbody>
      </table>
    </div>

    <!-- POWER LEVEL 2: UNBOUND STALKER BEASTS -->
    <div class="datasheet-card" style="border-top-color:var(--gold);">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <h3 style="margin:0; color:#fff;">🐗 Power Level 2: Unbound Gore-Stalkers (3 Models)</h3>
        <span class="rule-tag">3 Models • Beasts / Mounted • 5+ Invuln</span>
      </div>
      <div class="stat-strip">
        <div class="stat-cell"><span class="s-lbl">M</span><span class="s-val">9"</span></div>
        <div class="stat-cell"><span class="s-lbl">T</span><span class="s-val">5</span></div>
        <div class="stat-cell"><span class="s-lbl">SV</span><span class="s-val">4+</span></div>
        <div class="stat-cell"><span class="s-lbl">W</span><span class="s-val">3</span></div>
        <div class="stat-cell"><span class="s-lbl">LD</span><span class="s-val">7+</span></div>
        <div class="stat-cell"><span class="s-lbl">OC</span><span class="s-val">2</span></div>
      </div>
      <table class="weapon-table">
        <thead>
          <tr><th>Weapon</th><th>Range</th><th>A</th><th>WS/BS</th><th>S</th><th>AP</th><th>D</th><th>Abilities</th></tr>
        </thead>
        <tbody>
          <tr><td>Corrosive Spittle</td><td>12"</td><td>D6</td><td>N/A</td><td>5</td><td>-1</td><td>1</td><td>[TORRENT, IGNORES COVER]</td></tr>
          <tr><td>Rending Maw &amp; Horns</td><td>Melee</td><td>4</td><td>3+</td><td>6</td><td>-1</td><td>2</td><td>[LANCE]</td></tr>
        </tbody>
      </table>
    </div>

    <!-- POWER LEVEL 3: UNBOUND ABOMINATION / BRUTE -->
    <div class="datasheet-card" style="border-top-color:var(--purple);">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <h3 style="margin:0; color:#fff;">👾 Power Level 3: Unbound Warp-Brute (1 Monster)</h3>
        <span class="rule-tag">1 Model • Monster • 5+ Invuln • Deadly Demise D3</span>
      </div>
      <div class="stat-strip">
        <div class="stat-cell"><span class="s-lbl">M</span><span class="s-val">8"</span></div>
        <div class="stat-cell"><span class="s-lbl">T</span><span class="s-val">9</span></div>
        <div class="stat-cell"><span class="s-lbl">SV</span><span class="s-val">3+</span></div>
        <div class="stat-cell"><span class="s-lbl">W</span><span class="s-val">10</span></div>
        <div class="stat-cell"><span class="s-lbl">LD</span><span class="s-val">6+</span></div>
        <div class="stat-cell"><span class="s-lbl">OC</span><span class="s-val">3</span></div>
      </div>
      <table class="weapon-table">
        <thead>
          <tr><th>Weapon</th><th>Range</th><th>A</th><th>WS/BS</th><th>S</th><th>AP</th><th>D</th><th>Abilities</th></tr>
        </thead>
        <tbody>
          <tr><td>Empyric Cannon</td><td>24"</td><td>D6+1</td><td>3+</td><td>8</td><td>-2</td><td>2</td><td>[BLAST, PSYCHIC]</td></tr>
          <tr><td>Crushing Claws</td><td>Melee</td><td>6</td><td>3+</td><td>10</td><td>-2</td><td>3</td><td>[DEVASTATING WOUNDS]</td></tr>
        </tbody>
      </table>
    </div>

    <!-- POWER LEVEL 4: UNBOUND APEX HARBINGER -->
    <div class="datasheet-card" style="border-top-color:var(--red);">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <h3 style="margin:0; color:#fff;">🔥 Power Level 4: Unbound Apex Harbinger / Classified Anomaly</h3>
        <span class="rule-tag">1 Model • Monster / Character • 4+ Invuln • Deadly Demise D6</span>
      </div>
      <div class="stat-strip">
        <div class="stat-cell"><span class="s-lbl">M</span><span class="s-val">10"</span></div>
        <div class="stat-cell"><span class="s-lbl">T</span><span class="s-val">11</span></div>
        <div class="stat-cell"><span class="s-lbl">SV</span><span class="s-val">3+</span></div>
        <div class="stat-cell"><span class="s-lbl">W</span><span class="s-val">16</span></div>
        <div class="stat-cell"><span class="s-lbl">LD</span><span class="s-val">6+</span></div>
        <div class="stat-cell"><span class="s-lbl">OC</span><span class="s-val">5</span></div>
      </div>
      <table class="weapon-table">
        <thead>
          <tr><th>Weapon</th><th>Range</th><th>A</th><th>WS/BS</th><th>S</th><th>AP</th><th>D</th><th>Abilities</th></tr>
        </thead>
        <tbody>
          <tr><td>Hellfire Scourge</td><td>18"</td><td>2D6</td><td>2+</td><td>7</td><td>-2</td><td>2</td><td>[TORRENT, IGNORES COVER]</td></tr>
          <tr><td>Great Cleaver of the Gate</td><td>Melee</td><td>7</td><td>2+</td><td>14</td><td>-3</td><td>D6+1</td><td>[LETHAL HITS]</td></tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- ===================================================================== -->
  <!-- TAB C: HORDE THREAT BRACKETS & CLOUD-SYNCED SHELF BARRACKS            -->
  <!-- ===================================================================== -->
  <div id="rosTabBrackets" class="hidden">
    <div class="card" style="border-left:4px solid var(--blue); margin-bottom:20px;">
      <div class="section-header" style="margin-top:0;">
        <h3>1. Cloud-Synced Horde Shelf Barracks (Standard Pool — Shared Across Devices)</h3>
        <span class="hud-sub">Synced to Supabase &amp; Mode 1 Spawner</span>
      </div>
      <p class="card-desc" style="margin-bottom:12px;">
        Configure the standard Horde models for each threat bracket (comma-separated). Clicking <strong>☁️ Save &amp; Sync Shelf Barracks to Cloud</strong> stores this pool in Supabase so both players automatically share the exact same standard Horde spawn list on every device!
      </p>

      <label class="hud-label" style="color:var(--gold);">Select Horde Faction to Configure &amp; Cloud-Sync:</label>
      <select id="bracketFactionPicker" onchange="onFactionPickerChange()" style="width:100%; padding:12px; font-weight:700; margin-bottom:14px; background:#090b10; border:1.5px solid var(--gold); color:#fff;"></select>

      <label class="hud-label">Bracket [3–4] (0–75 pts // Swarms &amp; Chaff)</label>
      <input type="text" id="rosterPool34" style="width:100%; margin-bottom:10px;" placeholder="Empty — enter comma-separated [3–4] units for this faction..." value="">

      <label class="hud-label">Bracket [5–6] (76–150 pts // Line Infantry &amp; Skirmishers)</label>
      <input type="text" id="rosterPool56" style="width:100%; margin-bottom:10px;" placeholder="Empty — enter comma-separated [5–6] units for this faction..." value="">

      <label class="hud-label">Bracket [7–9] (151–300 pts // Heavy Elites, Walkers &amp; Monsters)</label>
      <input type="text" id="rosterPool79" style="width:100%; margin-bottom:10px;" placeholder="Empty — enter comma-separated [7–9] units for this faction..." value="">

      <label class="hud-label">Bracket [10–12] (301–550 pts // Apex Bosses, Greater Daemons &amp; Heavy Armor)</label>
      <input type="text" id="rosterPool10" style="width:100%; margin-bottom:10px;" placeholder="Empty — enter comma-separated [10–12] units for this faction..." value="">

      <label class="hud-label">Bracket [13+] (551+ pts // Titanic, Super-Heavy &amp; Lords of War)</label>
      <input type="text" id="rosterPool13" style="width:100%; margin-bottom:12px;" placeholder="Empty — enter comma-separated [13+] units for this faction..." value="">

      <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
        <button type="button" class="btn-blue" onclick="saveShelfBarracks()">☁️ Save &amp; Sync Shelf Barracks to Cloud</button>
        <button type="button" class="btn-ghost btn-sm" onclick="pullSharedPoolsFromCloud()">🔄 Pull Latest from Cloud</button>
        <span id="shelfSaveNotice" style="font-size:0.82rem; color:var(--green);" class="hidden">✓ Synced with Supabase Cloud &amp; Mode 1 Spawner!</span>
      </div>
    </div>

    <!-- 23-FACTION HORDE SPAWN BRACKET INSPECTOR -->
    <div class="card" style="border-left:4px solid var(--gold);">
      <div class="section-header" style="margin-top:0;">
        <h3>2. Standard 11th Ed Horde Mode Faction Spawn Matrix</h3>
        <span class="hud-sub">Clean Standard Brackets (No Nemesis Spoilers)</span>
      </div>
      <p class="card-desc" style="margin-bottom:12px;">
        Inspect the primary faction rule and configured or reference threat-bracket unit possibilities (<code>[3–4]</code>, <code>[5–6]</code>, <code>[7–9]</code>, <code>[10–12]</code>, <code>[13+]</code>) for the selected faction above.
      </p>

      <div id="factionBracketDisplay"></div>
    </div>
  </div>

</div>

<script src="../js/data.js"></script>
<script src="../js/vox-audio.js"></script>
<script>
var ROSTER_STATE_KEY = 'foa_roster_matrix_state_v1';
var CUSTOM_POOL_STORAGE_KEY = 'foa_custom_shelf_pool_v1';

var SUPABASE_URL = (typeof window !== 'undefined' && window.SUPABASE_URL)
  ? window.SUPABASE_URL
  : 'https://dsfvhjjalexqpbzqoaqb.supabase.co';
var SUPABASE_ANON_KEY = (typeof window !== 'undefined' && window.SUPABASE_ANON_KEY)
  ? window.SUPABASE_ANON_KEY
  : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzZnZoamphbGV4cXBienFvYXFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MzcxNjEsImV4cCI6MjA5MjQxMzE2MX0.fc9652398N1BP1126h1-t0h22H2y519a119918b500';

// Canonical 23-Faction Standard Horde Spawn Bracket Matrix is loaded from data.js
var ROSTER_SPAWN_TABLES = (typeof HORDE_FACTION_SPAWN_TABLES !== 'undefined')
  ? HORDE_FACTION_SPAWN_TABLES
  : ((typeof window !== 'undefined' && window.HORDE_FACTION_SPAWN_TABLES) ? window.HORDE_FACTION_SPAWN_TABLES : {});

var activeRosterTab = 'nemesis';

function switchRosterTab(tab, persist = true) {
  activeRosterTab = tab;
  document.getElementById('rosTabNemesis').classList.toggle('hidden', tab !== 'nemesis');
  document.getElementById('rosTabUnbound').classList.toggle('hidden', tab !== 'unbound');
  document.getElementById('rosTabBrackets').classList.toggle('hidden', tab !== 'brackets');

  document.getElementById('rosTabBtn1').classList.toggle('active', tab === 'nemesis');
  document.getElementById('rosTabBtn2').classList.toggle('active', tab === 'unbound');
  document.getElementById('rosTabBtn3').classList.toggle('active', tab === 'brackets');

  if (persist) saveRosterPageState();
}

function buildNemesisDossierString() {
  const chan = document.getElementById('nemReportChannel').value;
  const commanderLabel = chan === 'alpha' ? 'THE EXILE // SANCTUARY OF ASH' : 'LORD COMMANDER JUNEBUG';
  const sector = document.getElementById('nemReportSector').value;
  const unit = (document.getElementById('nemReportUnit').value || '[Unspecified Hostile Entity]').trim();
  const feat = document.getElementById('nemReportFeat').value;
  const notes = (document.getElementById('nemReportNotes').value || 'Survived engagement and demonstrated anomalous lethality.').trim();

  return [
    `+++ ORDO MALLEUS // NEW NEMESIS INDUCTION DOSSIER +++`,
    `• FILING COMMANDER: ${commanderLabel}`,
    `• THEATRE & MODE: ${sector}`,
    `• HOSTILE DATASHEET / FACTION: ${unit}`,
    `• TRIGGERING FEAT: ${feat}`,
    `• EYE-WITNESS COMBAT LOG: "${notes}"`,
    `------------------------------------------------`,
    `REQUEST FOR CAMPAIGN MASTER: Please induct this hostile entity into the Cross-Mode Nemesis Ledger (AGENT.md) and emit a CRT Vox-Dispatch christening its permanent Name, Title, Lore, and Boss Battle Trait!`
  ].join('\n');
}

function updateNemesisPreview() {
  const box = document.getElementById('nemDossierPreview');
  if (box) box.textContent = buildNemesisDossierString();
  saveRosterPageState();
}

function transmitNemesisDossier() {
  const chan = document.getElementById('nemReportChannel').value || 'alpha';
  const payload = buildNemesisDossierString();
  if (window.VoxAudio && typeof window.VoxAudio.transmitToVox === 'function') {
    window.VoxAudio.transmitToVox(chan, payload);
  }
}

function getStoredPoolRoot() {
  try {
    const raw = localStorage.getItem(CUSTOM_POOL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function getFactionPoolFromStore(facName) {
  const root = getStoredPoolRoot();
  if (root.byFaction && root.byFaction[facName]) {
    return root.byFaction[facName];
  }
  // Legacy flat-object support (only if byFaction hasn't been created yet)
  if (!root.byFaction && (root.b34 || root.b56 || root.b79 || root.b10 || root.b13)) {
    return {
      b34: root.b34 || '',
      b56: root.b56 || '',
      b79: root.b79 || '',
      b10: root.b10 || '',
      b13: root.b13 || ''
    };
  }
  return { b34: '', b56: '', b79: '', b10: '', b13: '' };
}

function loadFactionInputs(facName) {
  const p = getFactionPoolFromStore(facName);
  if (document.getElementById('rosterPool34')) document.getElementById('rosterPool34').value = p.b34 || '';
  if (document.getElementById('rosterPool56')) document.getElementById('rosterPool56').value = p.b56 || '';
  if (document.getElementById('rosterPool79')) document.getElementById('rosterPool79').value = p.b79 || '';
  if (document.getElementById('rosterPool10')) document.getElementById('rosterPool10').value = p.b10 || '';
  if (document.getElementById('rosterPool13')) document.getElementById('rosterPool13').value = p.b13 || '';
}

function onFactionPickerChange() {
  const facName = document.getElementById('bracketFactionPicker')?.value || 'Space Marines';
  loadFactionInputs(facName);
  renderFactionBracketTable();
  saveRosterPageState();
}

function saveShelfBarracks() {
  if (window.VoxAudio && typeof window.VoxAudio.playCloudSyncChime === 'function') {
    window.VoxAudio.playCloudSyncChime();
  }
  const facName = document.getElementById('bracketFactionPicker')?.value || 'Space Marines';
  const currentInputs = {
    b34: (document.getElementById('rosterPool34')?.value || '').trim(),
    b56: (document.getElementById('rosterPool56')?.value || '').trim(),
    b79: (document.getElementById('rosterPool79')?.value || '').trim(),
    b10: (document.getElementById('rosterPool10')?.value || '').trim(),
    b13: (document.getElementById('rosterPool13')?.value || '').trim()
  };

  const root = getStoredPoolRoot();
  const byFaction = root.byFaction || {};
  byFaction[facName] = currentInputs;

  // Keep top-level b34..b13 mirrored to the last saved faction so roster.test.js assertions pass!
  const poolObj = {
    ...currentInputs,
    byFaction
  };

  try {
    localStorage.setItem(CUSTOM_POOL_STORAGE_KEY, JSON.stringify(poolObj));
  } catch (e) {}

  const notice = document.getElementById('shelfSaveNotice');
  if (notice) {
    notice.classList.remove('hidden');
    setTimeout(() => notice.classList.add('hidden'), 3000);
  }
  renderFactionBracketTable();
  saveRosterPageState();
  syncPoolsToSupabaseCloud(poolObj);
}

async function syncPoolsToSupabaseCloud(poolObj) {
  if (typeof fetch !== 'function') return false;
  try {
    const hordePool = poolObj || JSON.parse(localStorage.getItem(CUSTOM_POOL_STORAGE_KEY) || '{}');
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/save_shared_spawn_pools`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        p_horde_pool: hordePool
      })
    });
    if (res && res.ok) {
      const badge = document.getElementById('cloudSyncBadge');
      if (badge) badge.textContent = '☁️ Cloud Pool Synced (Live for Both Players)';
      return true;
    }
  } catch (e) {}
  return false;
}

async function pullSharedPoolsFromCloud() {
  if (typeof fetch !== 'function') return false;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_shared_spawn_pools`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({})
    });
    if (!res || !res.ok) return false;
    const data = await res.json();
    if (!data || !data.ok) return false;

    if (window.VoxAudio && typeof window.VoxAudio.playCloudSyncChime === 'function') {
      window.VoxAudio.playCloudSyncChime();
    }

    if (data.horde_pool && Object.keys(data.horde_pool).length > 0) {
      localStorage.setItem(CUSTOM_POOL_STORAGE_KEY, JSON.stringify(data.horde_pool));
      const facName = document.getElementById('bracketFactionPicker')?.value || 'Space Marines';
      loadFactionInputs(facName);
      renderFactionBracketTable();
    }

    if (data.nemesis_status) {
      if (data.nemesis_status.nem1 && document.getElementById('nemStatus1')) {
        document.getElementById('nemStatus1').value = data.nemesis_status.nem1;
      }
      if (data.nemesis_status.nem2 && document.getElementById('nemStatus2')) {
        document.getElementById('nemStatus2').value = data.nemesis_status.nem2;
      }
      saveRosterPageState();
    }

    const badge = document.getElementById('cloudSyncBadge');
    if (badge) badge.textContent = '☁️ Cloud Pool Synced';
    return true;
  } catch (e) {}
  return false;
}

function renderFactionBracketTable() {
  const picker = document.getElementById('bracketFactionPicker');
  const box = document.getElementById('factionBracketDisplay');
  if (!picker || !box) return;

  const facName = picker.value || 'Space Marines';
  const facObj = (typeof HORDE_FACTIONS !== 'undefined')
    ? HORDE_FACTIONS.find(f => f.name === facName)
    : null;

  const customP = getFactionPoolFromStore(facName);
  const tables = (typeof HORDE_FACTION_SPAWN_TABLES !== 'undefined') ? HORDE_FACTION_SPAWN_TABLES : ROSTER_SPAWN_TABLES;
  const refTable = tables[facName] || {};

  const fmtRow = (customStr, refArr) => {
    if (customStr && customStr.trim()) return customStr;
    if (Array.isArray(refArr) && refArr.length > 0) return refArr.join(' • ');
    return `<span style="color:var(--red); font-style:italic;">⚠️ Horde Pool Empty for ${facName} — Configure above &amp; Sync to Cloud!</span>`;
  };

  box.innerHTML = `
    <div class="card" style="background:#0b0d13; margin-bottom:12px; border-left:4px solid var(--red);">
      <div style="font-weight:800; color:var(--gold); font-size:0.95rem;">
        ${facName} — Primary Rule: ${facObj ? facObj.ruleTitle : 'Faction Protocol'}
      </div>
      <div style="font-size:0.86rem; color:var(--text); margin-top:4px;">
        ${facObj ? (facObj.desc || facObj.ruleDesc || '') : ''}
      </div>
    </div>
    <table class="weapon-table">
      <thead>
        <tr>
          <th style="width:140px;">Spawn Roll Bracket</th>
          <th>Configured ${facName} Spawn Units</th>
        </tr>
      </thead>
      <tbody>
        <tr><td><strong>[3–4] (0–75 pts)</strong></td><td>${fmtRow(customP.b34, refTable.b34)}</td></tr>
        <tr><td><strong>[5–6] (76–150 pts)</strong></td><td>${fmtRow(customP.b56, refTable.b56)}</td></tr>
        <tr><td><strong>[7–9] (151–300 pts)</strong></td><td>${fmtRow(customP.b79, refTable.b79)}</td></tr>
        <tr><td><strong>[10–12] (301–550 pts)</strong></td><td>${fmtRow(customP.b10, refTable.b10)}</td></tr>
        <tr><td><strong>[13+] (551+ pts)</strong></td><td>${fmtRow(customP.b13, refTable.b13)}</td></tr>
      </tbody>
    </table>
  `;
}

function saveRosterPageState() {
  try {
    const state = {
      activeRosterTab,
      nemStatus1: document.getElementById('nemStatus1')?.value || 'roaming',
      nemStatus2: document.getElementById('nemStatus2')?.value || 'roaming',
      nemReportChannel: document.getElementById('nemReportChannel')?.value || 'alpha',
      nemReportSector: document.getElementById('nemReportSector')?.value || '',
      nemReportUnit: document.getElementById('nemReportUnit')?.value || '',
      nemReportFeat: document.getElementById('nemReportFeat')?.value || '',
      nemReportNotes: document.getElementById('nemReportNotes')?.value || ''
    };
    localStorage.setItem(ROSTER_STATE_KEY, JSON.stringify(state));
  } catch (e) {}
}

function initRosterPage() {
  const picker = document.getElementById('bracketFactionPicker');
  if (picker && typeof HORDE_FACTIONS !== 'undefined') {
    picker.innerHTML = HORDE_FACTIONS.map(f => `<option value="${f.name}">${f.name} (${f.group})</option>`).join('');
  }

  try {
    const raw = localStorage.getItem(ROSTER_STATE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (s.nemStatus1) document.getElementById('nemStatus1').value = s.nemStatus1;
      if (s.nemStatus2) document.getElementById('nemStatus2').value = s.nemStatus2;
      if (s.nemReportChannel) document.getElementById('nemReportChannel').value = s.nemReportChannel;
      if (s.nemReportSector) document.getElementById('nemReportSector').value = s.nemReportSector;
      if (s.nemReportUnit) document.getElementById('nemReportUnit').value = s.nemReportUnit;
      if (s.nemReportFeat) document.getElementById('nemReportFeat').value = s.nemReportFeat;
      if (s.nemReportNotes) document.getElementById('nemReportNotes').value = s.nemReportNotes;
      if (s.activeRosterTab) switchRosterTab(s.activeRosterTab, false);
    }
  } catch (e) {}

  loadFactionInputs(picker?.value || 'Space Marines');
  updateNemesisPreview();
  renderFactionBracketTable();
  pullSharedPoolsFromCloud();
}

if (typeof window !== 'undefined') {
  window.switchRosterTab = switchRosterTab;
  window.buildNemesisDossierString = buildNemesisDossierString;
  window.updateNemesisPreview = updateNemesisPreview;
  window.transmitNemesisDossier = transmitNemesisDossier;
  window.getStoredPoolRoot = getStoredPoolRoot;
  window.getFactionPoolFromStore = getFactionPoolFromStore;
  window.loadFactionInputs = loadFactionInputs;
  window.onFactionPickerChange = onFactionPickerChange;
  window.saveShelfBarracks = saveShelfBarracks;
  window.syncPoolsToSupabaseCloud = syncPoolsToSupabaseCloud;
  window.pullSharedPoolsFromCloud = pullSharedPoolsFromCloud;
  window.renderFactionBracketTable = renderFactionBracketTable;
  window.saveRosterPageState = saveRosterPageState;
  window.initRosterPage = initRosterPage;
}

window.addEventListener('DOMContentLoaded', initRosterPage);
window.addEventListener('vox:page-swapped', () => {
  if (document.getElementById('rosTabNemesis')) initRosterPage();
});
</script>
</body>
</html>
````
