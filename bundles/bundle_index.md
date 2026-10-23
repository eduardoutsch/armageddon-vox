# 📦 Fires of Armageddon // Bundle: Home Launchpad & Mode 1 Spawner

Complete source code for the primary Sanctuary Field Codex home launchpad (`index.html`) and the Mode 1 Horde Command tactical terminal and spawner (`pages/spawner.html`).

## 📑 Table of Contents
- [index.html](#file-indexhtml)
- [pages/spawner.html](#file-pagesspawnerhtml)

---

## File: `index.html` <a id="file-indexhtml"></a>

````html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fires of Armageddon // Field Codex &amp; Quickstart Manual</title>
  <link rel="icon" type="image/svg+xml" href="assets/favicon.svg">
  <link rel="apple-touch-icon" href="assets/favicon.svg">
  <link rel="stylesheet" href="css/style.css">
</head>
<body>

  <!-- CAMPAIGN SUITE TOP NAVIGATION -->
  <nav class="suite-nav">
    <a href="index.html" class="suite-link active">📖 Field Codex &amp; Guide</a>
    <a href="pages/spawner.html" class="suite-link">🧟 Mode 1: Horde Command &amp; Spawner</a>
    <a href="pages/pvp.html" class="suite-link">⚔️ Mode 2: 1v1 Ash Wastes PvP</a>
    <a href="pages/rogue.html" class="suite-link">🎲 Mode 3: Rogue Sector &amp; AI Tracker</a>
    <a href="pages/roster.html" class="suite-link">🎖️ Mode 4: Hostile Matrix &amp; Nemeses</a>
    <a href="pages/crusade.html" class="suite-link">🏆 Mode 5: Crusade Quartermaster</a>
    <a href="pages/briefing.html" class="suite-link">📜 Mode 6: Briefings, Ship &amp; Atlas</a>
    <a href="pages/vox.html" class="suite-link">📡 Mode 7: Astropath Vox</a>
  </nav>

  <div class="container">

    <!-- HERO HEADER & COMMAND LAUNCHPAD -->
    <div class="hero-card" style="margin-bottom:24px; text-align:center;">
      <div class="status-pill" style="margin:0 auto 10px auto;">Imperial Field Manual • Sub-Sector Armageddon Cogitator Protocols</div>
      <h1 class="hero-title" style="font-size:1.95rem; margin-top:6px; text-align:center;">Sanctuary Field Codex &amp; Quickstart Manual</h1>
      <p class="hero-subtitle" style="text-align:center; margin:0 auto 18px auto; max-width:760px;">
        Welcome, Commander. This automated Munitorum terminal manages cooperative horde survival battles, 1v1 wasteland skirmishes, autonomous AI logic, and persistent narrative campaign progression. Select an operational theatre below or review the tactical field directives.
      </p>

      <!-- CENTERED QUICK-LAUNCH COMMAND MATRIX -->
      <div class="welcome-quick-grid">
        <a href="pages/spawner.html" class="welcome-quick-card">
          <span style="font-size:1.6rem; margin-bottom:6px;">🧟</span>
          <strong style="color:var(--gold-bright); font-size:0.92rem; text-transform:uppercase;">Mode 1: Spawner</strong>
          <span style="font-size:0.78rem; color:var(--muted); margin-top:4px;">Synced Co-op Horde Command</span>
        </a>
        <a href="pages/pvp.html" class="welcome-quick-card">
          <span style="font-size:1.6rem; margin-bottom:6px;">⚔️</span>
          <strong style="color:var(--gold-bright); font-size:0.92rem; text-transform:uppercase;">Mode 2: 1v1 PvP</strong>
          <span style="font-size:0.78rem; color:var(--muted); margin-top:4px;">Ash Wastes Head-to-Head</span>
        </a>
        <a href="pages/rogue.html" class="welcome-quick-card">
          <span style="font-size:1.6rem; margin-bottom:6px;">🎲</span>
          <strong style="color:var(--gold-bright); font-size:0.92rem; text-transform:uppercase;">Mode 3: Rogue AI</strong>
          <span style="font-size:0.78rem; color:var(--muted); margin-top:4px;">Flowchart &amp; Pilot Engine</span>
        </a>
        <a href="pages/roster.html" class="welcome-quick-card">
          <span style="font-size:1.6rem; margin-bottom:6px;">🎖️</span>
          <strong style="color:var(--gold-bright); font-size:0.92rem; text-transform:uppercase;">Mode 4: Threat Matrix</strong>
          <span style="font-size:0.78rem; color:var(--muted); margin-top:4px;">Ledger, Nemeses &amp; Brackets</span>
        </a>
        <a href="pages/crusade.html" class="welcome-quick-card">
          <span style="font-size:1.6rem; margin-bottom:6px;">🏆</span>
          <strong style="color:var(--gold-bright); font-size:0.92rem; text-transform:uppercase;">Mode 5: Crusade</strong>
          <span style="font-size:0.78rem; color:var(--muted); margin-top:4px;">Quartermaster &amp; Rollers</span>
        </a>
        <a href="pages/briefing.html" class="welcome-quick-card">
          <span style="font-size:1.6rem; margin-bottom:6px;">📜</span>
          <strong style="color:var(--gold-bright); font-size:0.92rem; text-transform:uppercase;">Mode 6: Briefings</strong>
          <span style="font-size:0.78rem; color:var(--muted); margin-top:4px;">Ship Slider &amp; Sector Atlas</span>
        </a>
        <a href="pages/vox.html" class="welcome-quick-card">
          <span style="font-size:1.6rem; margin-bottom:6px;">📡</span>
          <strong style="color:var(--gold-bright); font-size:0.92rem; text-transform:uppercase;">Mode 7: Vox-Sanctum</strong>
          <span style="font-size:0.78rem; color:var(--muted); margin-top:4px;">Astropathic CRT Terminal</span>
        </a>
      </div>
    </div>

    <!-- TUTORIAL 1: MODE 1 HOARDE COMMAND & AUTOMATED SPAWNER -->
    <div class="section-card" style="border-left-color:var(--red);">
      <div style="display:flex; justify-content:center; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:12px;">
        <h2 style="margin:0; font-size:1.35rem; color:var(--gold-bright); text-align:center;">🧟 Mode 1: Horde Command &amp; Automated Spawner</h2>
        <span class="badge red">Co-op Hard Mode</span>
      </div>
      <p style="color:var(--text); font-size:0.94rem; margin-bottom:16px; text-align:center;">
        Automates wave escalation, threat-bracket cascades, and dynamic battlefield events for tabletop horde defense games.
      </p>

      <div class="grid-2" style="margin-bottom:14px;">
        <div class="hero-box red">
          <strong style="color:var(--gold-bright); font-size:0.92rem; display:block; margin-bottom:4px; text-align:center;">1. Multi-Player Seed Synchronization</strong>
          <p style="font-size:0.86rem; color:var(--text); margin:0;">
            Both players enter the <strong>identical 6-character Room Seed</strong> (e.g. <code>HADES-1</code>). This uses deterministic pseudo-random hashing to ensure both players see the exact same enemy units, wave spawns, and misery draws.
          </p>
        </div>
        <div class="hero-box red">
          <strong style="color:var(--gold-bright); font-size:0.92rem; display:block; margin-bottom:4px; text-align:center;">2. Threat Escalation &amp; Brackets</strong>
          <p style="font-size:0.86rem; color:var(--text); margin:0;">
            Each battle round, roll 2D6 on the terminal. The terminal cascades down from 10+ (Monsters/Bosses) to 3–4 (Swarms). An unmodified 2 always yields <strong>No Spawn</strong>. Battle Round 6 triggers <strong>The Final Stand</strong>!
          </p>
        </div>
      </div>

      <div class="hero-box">
        <strong style="color:var(--gold-bright); font-size:0.92rem; display:block; margin-bottom:4px; text-align:center;">3. Secret Objectives &amp; Covert Treachery</strong>
        <p style="font-size:0.86rem; color:var(--text); margin:0;">
          Before the horde breaches the perimeter, each player is dealt a confidential <strong>Secret Objective</strong> with a verification code. Keep it secret. Some are heroic deeds; others are high-risk <strong>Traitor Directives</strong> offering plundered Requisition Points and relics if you engineer your partner's downfall...
        </p>
      </div>

      <!-- CENTERED ACTION BUTTON -->
      <div class="welcome-btn-row">
        <a href="pages/spawner.html" class="terminal-link-btn" style="display:inline-flex; align-items:center; justify-content:center; max-width:280px; padding:12px 24px;">🧟 Launch Mode 1 Spawner</a>
      </div>
    </div>

    <!-- TUTORIAL 2: MODE 2 1V1 ASH WASTES PVP -->
    <div class="section-card" style="border-left-color:var(--gold);">
      <div style="display:flex; justify-content:center; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:12px;">
        <h2 style="margin:0; font-size:1.35rem; color:var(--gold-bright); text-align:center;">⚔️ Mode 2: 1v1 Ash Wastes PvP Skirmishes</h2>
        <span class="badge gold">Head-to-Head Clash</span>
      </div>
      <p style="color:var(--text); font-size:0.94rem; margin-bottom:16px; text-align:center;">
        Wage head-to-head battles across Armageddon's hostile surface with randomized weather, psychic surges, and roaming scavengers.
      </p>

      <div class="grid-2">
        <div class="hero-box">
          <strong style="color:var(--gold); font-size:0.92rem; display:block; margin-bottom:4px; text-align:center;">1. Hellscapes &amp; Hazards</strong>
          <p style="font-size:0.86rem; color:var(--text); margin:0;">
            Click <strong>Generate Hellscape</strong> to roll environmental conditions such as <em>Sulfur Smog</em> (-1 to hit beyond 12") or <em>Ash Tsunami</em> (-2" Move).
          </p>
        </div>
        <div class="hero-box">
          <strong style="color:var(--gold); font-size:0.92rem; display:block; margin-bottom:4px; text-align:center;">2. Unbound Adversaries (3rd Force)</strong>
          <p style="font-size:0.86rem; color:var(--text); margin:0;">
            Every time the two commanders clash, click <strong>Roll Unbound Adversary</strong>. Roaming beasts enter the fray, advancing the 3rd Alliance (+3 Vulture SPts &amp; +1 Sector Hegemony).
          </p>
        </div>
      </div>

      <!-- CENTERED ACTION BUTTON -->
      <div class="welcome-btn-row">
        <a href="pages/pvp.html" class="terminal-link-btn" style="display:inline-flex; align-items:center; justify-content:center; max-width:280px; padding:12px 24px;">⚔️ Open 1v1 PvP Arena</a>
      </div>
    </div>

    <!-- TUTORIAL 3: MODE 3 ROGUE SECTOR AI PILOT -->
    <div class="section-card" style="border-left-color:var(--purple);">
      <div style="display:flex; justify-content:center; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:12px;">
        <h2 style="margin:0; font-size:1.35rem; color:var(--gold-bright); text-align:center;">🎲 Mode 3: Rogue Sector &amp; AI Decision Flowchart</h2>
        <span class="badge purple">Automated AI Pilot</span>
      </div>
      <p style="color:var(--text); font-size:0.94rem; margin-bottom:16px; text-align:center;">
        Step-by-step priority engine to pilot non-player horde units and unbound monsters without human bias.
      </p>

      <div class="ai-step active-step">
        <div class="ai-step-title" style="display:flex; justify-content:space-between; align-items:center;">
          <span>Phase Sequence Checklist</span>
          <span style="color:var(--gold-bright);">Phases 1 → 5</span>
        </div>
        <p style="font-size:0.88rem; color:var(--text); margin:0;">
          Tap <strong>Next Phase</strong> during each turn. The engine prioritizes moving toward the nearest objective marker, firing heavy weapons at highest-wound targets, and charging vulnerable infantry within 9".
        </p>
      </div>

      <!-- CENTERED ACTION BUTTON -->
      <div class="welcome-btn-row">
        <a href="pages/rogue.html" class="terminal-link-btn alt" style="display:inline-flex; align-items:center; justify-content:center; max-width:280px; padding:12px 24px;">🎲 Open AI Flowchart</a>
      </div>
    </div>

    <!-- TUTORIAL 4: MODE 4 ROSTERS & NEMESIS LEDGER -->
    <div class="section-card" style="border-left-color:var(--blue);">
      <div style="display:flex; justify-content:center; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:12px;">
        <h2 style="margin:0; font-size:1.35rem; color:var(--gold-bright); text-align:center;">🎖️ Mode 4: Rosters &amp; Cross-Mode Nemesis Ledger</h2>
        <span class="badge blue">Crusade Progression</span>
      </div>
      <p style="color:var(--text); font-size:0.94rem; margin-bottom:16px; text-align:center;">
        Persistent campaign ledger for orders of battle, hero deeds, supply limit expansions, and recurring nemesis warlords.
      </p>

      <div class="grid-2">
        <div class="hero-box blue">
          <strong style="color:var(--blue); font-size:0.92rem; display:block; margin-bottom:4px; text-align:center;">Persistent Nemeses</strong>
          <p style="font-size:0.86rem; color:var(--text); margin:0;">
            Any boss or squad leader that slays a Commander's Warlord or survives Round 6 is immortalized in the Ledger, gaining battle traits and returning in future games!
          </p>
        </div>
        <div class="hero-box blue">
          <strong style="color:var(--blue); font-size:0.92rem; display:block; margin-bottom:4px; text-align:center;">Spoils of Breach Containment</strong>
          <p style="font-size:0.86rem; color:var(--text); margin:0;">
            Unspent Supply Points (SP) bank into orbital scans, free weapon modifications, or emergency field promotions for surviving recruits.
          </p>
        </div>
      </div>

      <!-- CENTERED ACTION BUTTON -->
      <div class="welcome-btn-row">
        <a href="pages/roster.html" class="terminal-link-btn" style="display:inline-flex; align-items:center; justify-content:center; max-width:280px; padding:12px 24px;">🎖️ Inspect Rosters</a>
      </div>
    </div>

    <!-- TUTORIAL 5: MODE 5 BRIEFINGS, SHIP SLIDER & SECTOR ATLAS -->
    <div class="section-card" style="border-left-color:var(--green);">
      <div style="display:flex; justify-content:center; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:12px;">
        <h2 style="margin:0; font-size:1.35rem; color:var(--gold-bright); text-align:center;">📜 Mode 5: Briefings, Ship Slider &amp; 8-Node Sector Atlas</h2>
        <span class="badge green">Narrative Theatre</span>
      </div>
      <p style="color:var(--text); font-size:0.94rem; margin-bottom:16px; text-align:center;">
        Planetary auspex projection of Armageddon Prime, Secundus, the Equatorial Jungle, and the Fire Wastes with interactive parallel hegemony tracking.
      </p>

      <div class="grid-2" style="margin-bottom:14px;">
        <div class="hero-box green">
          <strong style="color:var(--green); font-size:0.92rem; display:block; margin-bottom:4px; text-align:center;">The Sanctuary Ship Slider</strong>
          <p style="font-size:0.86rem; color:var(--text); margin:0;">
            Commander Alpha's vessel balances between the Lower Decks (-3 to -1, brutal penal conscripts), Stasis (0), and Upper Sanctum (+1 to +3, sacred relic blessings).
          </p>
        </div>
        <div class="hero-box green">
          <strong style="color:var(--green); font-size:0.92rem; display:block; margin-bottom:4px; text-align:center;">3-Way Hegemony Race (0–8 HP)</strong>
          <p style="font-size:0.86rem; color:var(--text); margin:0;">
            Every node (N0–N7) tracks parallel Hegemony Points for Alpha, Beta, and the Horde AI. The first faction to claim 8 HP permanently locks and conquers that sector!
          </p>
        </div>
      </div>

      <div class="hero-box green">
        <strong style="color:var(--green); font-size:0.92rem; display:block; margin-bottom:4px; text-align:center;">🔍 Fullscreen Auspex Mode</strong>
        <p style="font-size:0.86rem; color:var(--text); margin:0;">
          Double-click the map or tap <code>🔍 Expand Fullscreen</code> to enter full-theatre Auspex mode on tablet or monitor, complete with interactive quick-recon HUD and zoom levels (1x, 1.6x, 2.2x).
        </p>
      </div>

      <!-- CENTERED ACTION BUTTON -->
      <div class="welcome-btn-row">
        <a href="pages/briefing.html" class="terminal-link-btn" style="display:inline-flex; align-items:center; justify-content:center; max-width:280px; padding:12px 24px;">🗺️ Explore Planetary Atlas</a>
      </div>
    </div>

    <!-- AUDIO & SFX HIGHLIGHT -->
    <div class="card" style="border-left-color:var(--gold); text-align:center;">
      <h3 style="margin-top:0; color:var(--gold-bright); text-align:center;">📡 Cogitator Audio &amp; Terminal Sound Suite</h3>
      <p style="font-size:0.92rem; color:var(--text); line-height:1.6; margin:0 auto; max-width:760px;">
        <strong>Vox-Caster Ambience:</strong> Toggle the top-nav speaker (<code>VOX-AMBIENCE: ON</code>) for atmospheric 40K soundscapes. Playback continues uninterrupted across page transitions, preserving your exact track and timestamp.<br>
        <strong>Tactical Sound Effects:</strong> Every button, sector reticle, and card flip synthesizes themed Imperial mechanical clanks, CRT scanner chirps, and pneumatic solenoid taps.
      </p>
    </div>

  </div>

  <script src="js/vox-audio.js"></script>
</body>
</html>
````

---

## File: `pages/spawner.html` <a id="file-pagesspawnerhtml"></a>

````html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fires of Armageddon // Mode 1: Horde Command &amp; Spawner</title>
  <link rel="icon" type="image/svg+xml" href="../assets/favicon.svg">
  <link rel="apple-touch-icon" href="../assets/favicon.svg">
  <link rel="stylesheet" href="../css/style.css">
  <style>
    .warp-intrusion-alert {
      margin-top: 10px;
      padding: 12px;
      background: rgba(255, 71, 87, 0.16);
      border: 1.5px solid var(--red);
      border-radius: 10px;
      box-shadow: 0 0 18px rgba(255, 71, 87, 0.3);
    }
    .bracket-matrix-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.82rem;
      margin-top: 8px;
    }
    .bracket-matrix-table th, .bracket-matrix-table td {
      border: 1px solid var(--border);
      padding: 7px 10px;
      text-align: left;
    }
    .bracket-matrix-table th {
      background: #0b0d13;
      color: var(--gold);
      font-size: 0.72rem;
      text-transform: uppercase;
      letter-spacing: 0.6px;
    }
  </style>
</head>
<body>

  <!-- CAMPAIGN SUITE TOP NAVIGATION -->
  <nav class="suite-nav">
    <a href="../index.html" class="suite-link">📖 Field Codex &amp; Guide</a>
    <a href="spawner.html" class="suite-link active">🧟 Mode 1: Horde Command &amp; Spawner</a>
    <a href="pvp.html" class="suite-link">⚔️ Mode 2: 1v1 Ash Wastes PvP</a>
    <a href="rogue.html" class="suite-link">🎲 Mode 3: Rogue Sector &amp; AI Tracker</a>
    <a href="roster.html" class="suite-link">🎖️ Mode 4: Hostile Matrix &amp; Nemeses</a>
    <a href="crusade.html" class="suite-link">🏆 Mode 5: Crusade Quartermaster</a>
    <a href="briefing.html" class="suite-link">📜 Mode 6: Briefings, Ship &amp; Atlas</a>
    <a href="vox.html" class="suite-link">📡 Mode 7: Astropath Vox</a>
  </nav>

<div class="app-shell">

  <!-- HOME SCREEN -->
  <div id="setupScreen" class="hero-card">
    <div class="hero-header">
      <div class="status-pill">
        <span class="pulse-dot"></span> Segmentum Solar • Vox-Link Online
      </div>
      <h1 class="hero-title">Fires of Armageddon</h1>
      <p class="hero-subtitle">Tactical Horde Command, Synced Faction &amp; Multi-Zone Spawner</p>

      <div class="lore-quote">
        "The empyric barriers around the Red Angel's Gate are fracturing. Synchronize your dataslates, lock in your covert directives, and hold the ash wastes until extraction."
      </div>
    </div>

    <!-- 1. ROOM CODE -->
    <label class="setup-label">1. Shared Room Code (Syncs Decks, Horde Faction &amp; Spawns)</label>
    <div class="seed-row">
      <input type="text" id="seedInput" class="seed-input" placeholder="e.g. HADES-1" value="HADES-1">
      <button type="button" class="dice-btn" onclick="generateRandomCode()">🎲 New Room</button>
    </div>

    <!-- 2. HORDE PRIMARY FACTION (SYNCED BY ROOM CODE) -->
    <label class="setup-label">2. Horde Primary Faction Rule (Section 7.5)</label>
    <select id="setupFactionMode" style="width:100%; padding:12px; font-weight:600; background:#0b0d13;">
      <option value="SYNC_ALL">🎲 Auto-Sync Random Faction from Room Code (All 23 Factions)</option>
      <option value="SYNC_CHAOS">🎲 Auto-Sync Random CHAOS Faction from Room Code</option>
      <option value="SYNC_XENOS">🎲 Auto-Sync Random XENOS Faction from Room Code</option>
      <option value="SYNC_IMPERIUM">🎲 Auto-Sync Random IMPERIUM Faction from Room Code</option>
      <optgroup label="Or Manually Lock a Specific Faction:">
        <option value="Space Marines">Space Marines (Transhuman Skills)</option>
        <option value="Adepta Sororitas">Adepta Sororitas (Martyrs and Miracles)</option>
        <option value="Adeptus Custodes">Adeptus Custodes (Best of the Best)</option>
        <option value="Adeptus Mechanicus">Adeptus Mechanicus (Third Try's the Charm)</option>
        <option value="Astra Militarum">Astra Militarum (Unanimous Orders)</option>
        <option value="Grey Knights">Grey Knights (Poor Hammers)</option>
        <option value="Imperial Agents">Imperial Agents (Fine, I'll Do It Myself)</option>
        <option value="Imperial Knights">Imperial Knights (Passive Ion Shields)</option>
        <option value="Chaos Space Marines">Chaos Space Marines (Wonton Slaughter)</option>
        <option value="Chaos Daemons">Chaos Daemons (Shadow Forms)</option>
        <option value="Chaos Knights">Chaos Knights (Different Theme)</option>
        <option value="Death Guard">Death Guard (Don't You Miss DR?)</option>
        <option value="Emperor's Children">Emperor's Children (Elegant Violence)</option>
        <option value="Thousand Sons">Thousand Sons (Psychic Storms)</option>
        <option value="World Eaters">World Eaters (Bloodthirsty)</option>
        <option value="Aeldari">Aeldari (Monomolecular Ammunition)</option>
        <option value="Drukhari">Drukhari (Monomolecular Edges)</option>
        <option value="Necrons">Necrons (We're So Back)</option>
        <option value="T'au Empire">T'au Empire (Glasses)</option>
        <option value="Orks">Orks (High Green Tide)</option>
        <option value="Leagues of Votann">Leagues of Votann (Grudge Game)</option>
        <option value="Tyranids">Tyranids (Neurons Activated)</option>
        <option value="Genestealer Cults">Genestealer Cults (Should Have Been 5+ FNP)</option>
      </optgroup>
    </select>

    <!-- 3. ENGAGEMENT PROTOCOL -->
    <label class="setup-label">3. Engagement Protocol</label>
    <div class="choice-grid">
      <div id="modeCardCoop" class="choice-card selected-red" onclick="selectMode('coop')">
        <span class="choice-icon">⚔️</span>
        <div class="choice-title">Co-op Strike Team</div>
        <div class="choice-sub">2 Players • Max 8 SP/Rnd • Full 34 Secret Deck</div>
      </div>
      <div id="modeCardSolo" class="choice-card" onclick="selectMode('solo')">
        <span class="choice-icon">🛡️</span>
        <div class="choice-title">Solo Last Stand</div>
        <div class="choice-sub">1 Player • Max 16 SP/Rnd • Blocks Multiplayer Secrets</div>
      </div>
    </div>

    <!-- 4. COMMANDER DESIGNATION -->
    <div id="playerRoleSection">
      <label class="setup-label">4. Commander Designation</label>
      <div class="choice-grid">
        <div id="roleCard1" class="choice-card selected" onclick="selectRole('1')">
          <span class="choice-icon">🦅</span>
          <div class="choice-title">The Exile // Sanctuary of Ash</div>
          <div class="choice-sub">Player 1 • Upper Deck Pool (No Duplicate Draws)</div>
        </div>
        <div id="roleCard2" class="choice-card" onclick="selectRole('2')">
          <span class="choice-icon">💀</span>
          <div class="choice-title">Lord Commander Junebug</div>
          <div class="choice-sub">Player 2 • Lower Deck Pool (No Duplicate Draws)</div>
        </div>
      </div>
    </div>

    <div class="rules-strip">
      <span class="rule-tag"><strong>Difficulty:</strong> Hard Mode</span>
      <span class="rule-tag"><strong>Spawn Zones:</strong> n + 1 (3 @ 1k / 5 @ 2k)</span>
      <span class="rule-tag"><strong>Duration:</strong> 6 Rounds (Final Stand)</span>
    </div>

    <button class="launch-btn" onclick="startSession()">
      Deploy to Battlefield →
    </button>
  </div>

  <!-- MAIN GAME INTERFACE -->
  <div id="gameScreen" class="hidden">

    <!-- STICKY TOP HUD -->
    <div class="hud-bar">
      <div class="hud-stat">
        <span class="hud-label" id="hudSessionInfo">HADES-1 • P1</span>
        <span class="hud-num" id="hudRound" style="color:var(--red);">Pre-Game</span>
      </div>

      <div class="hud-stat">
        <span class="hud-label">Supply (SP) <span id="hudSpCap" class="hud-sub">(0/8)</span></span>
        <div class="hud-val-row">
          <button class="mini-btn" onclick="loseSP(1)">−</button>
          <span class="hud-num" id="hudSp" style="color:var(--blue);">0</span>
          <button class="mini-btn" onclick="gainSP(1)">+</button>
        </div>
      </div>

      <div class="hud-stat">
        <span class="hud-label">Command (CP) <span id="hudStratTally" class="hud-sub">(0 Strats)</span></span>
        <div class="hud-val-row">
          <button class="mini-btn" onclick="spendCPForStrat()">−</button>
          <span class="hud-num" id="hudCp" style="color:var(--purple);">2</span>
          <button class="mini-btn" onclick="adjCP(1)">+</button>
        </div>
      </div>

      <button class="btn-ghost btn-sm" onclick="leaveSession()">Exit</button>
    </div>

    <!-- PERSISTENT SYNCED HORDE FACTION REMINDER BANNER -->
    <div class="faction-reminder-bar">
      <div class="faction-reminder-title">
        <span id="activeFactionBannerTitle">HORDE FACTION: CHAOS DAEMONS</span>
        <span style="font-size:0.7rem; color:var(--muted);">Synced to Room Code</span>
      </div>
      <div id="activeFactionBannerDesc" style="color:#e2e8f0;"></div>
    </div>

    <!-- 4 NAVIGATION TABS -->
    <div class="nav-pills">
      <button id="tabBtn1" class="active" onclick="switchTab(1)">1. Battle Round</button>
      <button id="tabBtn2" onclick="switchTab(2)">2. Secret Obj</button>
      <button id="tabBtn3" onclick="switchTab(3)">3. Resupply</button>
      <button id="tabBtn4" onclick="switchTab(4)">4. Spawner</button>
    </div>

    <!-- TAB 1: BATTLE ROUND -->
    <div id="tab1">
      <div class="round-banner">
        <h2 id="roundTitle">Deployment &amp; Setup</h2>
        <p id="spawnModDisplay">Open Tab 4 (Spawner) to roll Round 1 Horde Spawns!</p>
        <button class="btn-red" id="nextRoundBtn" onclick="advanceBattleRound()" style="width:100%; max-width:340px;">
          Begin Battle Round 1
        </button>
      </div>

      <div class="section-header">
        <h3>Active Secondary Mission</h3>
        <span id="secDeckCount" class="hud-sub"></span>
      </div>
      <div id="activeSecondariesBox"></div>

      <div class="section-header">
        <h3>Active Misery Cards</h3>
        <span id="misDeckCount" class="hud-sub"></span>
      </div>
      <div id="activeMiseriesBox"></div>

      <details>
        <summary>Manual Card Draws &amp; Punishment Triggers</summary>
        <div class="drawer-body">
          <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:12px; justify-content:center;">
            <button class="btn-gold btn-sm" onclick="drawSecondary(false)">+1 Secondary (Tempt Fate)</button>
            <button class="btn-ghost btn-sm" onclick="replaceSecondary()">Replace Secondary (Advanced Tactics)</button>
            <button class="btn-red btn-sm" onclick="drawMisery(1)">+1 Misery Card</button>
            <button class="btn-red btn-sm" onclick="drawMisery(2)">+2 Misery Cards</button>
          </div>
          <div style="display:flex; gap:8px; align-items:center; justify-content:center; max-width:480px; margin:0 auto;">
            <select id="specificMiserySelect" style="flex:1; padding:8px;">
              <option value="6">#6 Stray Orbital Bombardment</option>
              <option value="13">#13 Pincer Maneuver</option>
              <option value="22">#22 Comms Jammed</option>
              <option value="31">#31 Debris Storm</option>
            </select>
            <button class="btn-ghost btn-sm" onclick="triggerSpecificMisery()">Trigger Specific</button>
          </div>
        </div>
      </details>
    </div>

    <!-- TAB 2: SECRET OBJECTIVE -->
    <div id="tab2" class="hidden">
      <div id="selectionArea" class="hidden">
        <div class="section-header">
          <h3 id="selectionPrompt">Select 1 Secret Objective to Keep</h3>
          <span id="secretPoolNotice" class="hud-sub"></span>
        </div>
        <div id="choicesList"></div>
      </div>

      <div id="lockedArea" class="hidden">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
          <span class="hud-label">Your Confidential Directive</span>
          <button class="btn-ghost btn-sm" onclick="togglePrivacy()" id="privacyBtn">Hide Screen</button>
        </div>

        <div id="PrivacyWrapper">
          <div id="activeCardBox"></div>
          <div style="text-align:center;">
            <div class="cm-code" id="cmCodeBox"></div>
            <p class="hud-sub" style="margin-top:6px;">Share this encrypted code with the Campaign Master to log your objective secretly.</p>
          </div>
        </div>

        <details>
          <summary>Redraw Secret Objective (Change of Plans / Comms)</summary>
          <div class="drawer-body" style="display:flex; flex-direction:column; gap:10px; align-items:center;">
            <button class="btn-blue" onclick="triggerChangeOfPlans()" style="width:100%; max-width:440px;">
              Use "A Change of Plans" (Draw 2, Choose 1 or Keep)
            </button>
            <button class="btn-red" onclick="triggerOrbitalPunishment()" style="width:100%; max-width:440px;">
              Failed "Establish Orbital Comms" (Draw 2, Force Random)
            </button>
          </div>
        </details>
      </div>
    </div>

    <!-- TAB 3: RESUPPLY SHOP -->
    <div id="tab3" class="hidden">
      <details style="margin-top:0; margin-bottom:16px;">
        <summary>Active Fortifications &amp; Field Markers</summary>
        <div class="drawer-body">
          <div class="fort-grid">
            <label class="fort-item"><span>FOB (+1 SP)</span><input type="checkbox"></label>
            <label class="fort-item"><span>Warp-Relic (3 MW)</span><input type="checkbox"></label>
            <label class="fort-item"><span>War Trench (+1S/AP)</span><input type="checkbox"></label>
            <label class="fort-item"><span>Field Hospital (3W)</span><input type="checkbox"></label>
            <label class="fort-item"><span>Jammer (-1 Spawn)</span><input type="checkbox" id="jammerCheck"></label>
            <label class="fort-item"><span>Ammo (Sustained 1)</span><input type="checkbox"></label>
            <label class="fort-item"><span>Shield (FNP 5+)</span><input type="checkbox"></label>
            <div class="fort-item">
              <span>Teleporters: <strong id="teleCount">0</strong>/3</span>
              <div style="display:flex; gap:4px;">
                <button class="mini-btn" onclick="adjMarker('teleCount',-1,3)">−</button>
                <button class="mini-btn" onclick="adjMarker('teleCount',1,3)">+</button>
              </div>
            </div>
            <div class="fort-item">
              <span>Razor Wire: <strong id="wireCount">0</strong>/2</span>
              <div style="display:flex; gap:4px;">
                <button class="mini-btn" onclick="adjMarker('wireCount',-1,2)">−</button>
                <button class="mini-btn" onclick="adjMarker('wireCount',1,2)">+</button>
              </div>
            </div>
            <div class="fort-item">
              <span>Mine Dmg: <strong id="mineCount">0</strong>/10</span>
              <div style="display:flex; gap:4px;">
                <button class="mini-btn" onclick="adjMarker('mineCount',-1,10)">−</button>
                <button class="mini-btn" onclick="adjMarker('mineCount',1,10)">+</button>
              </div>
            </div>
          </div>
        </div>
      </details>

      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
        <span class="hud-label">Filter Resupply Options</span>
        <label style="font-size:0.8rem; color:var(--red); cursor:pointer;">
          <input type="checkbox" id="doubleCostToggle" onchange="renderResupplyTable()"> Seller's Market (2x Cost)
        </label>
      </div>

      <div class="filter-bar">
        <button class="chip active" onclick="setShopFilter('All', this)">All (26)</button>
        <button class="chip" onclick="setShopFilter('Fortify', this)">Fortify</button>
        <button class="chip" onclick="setShopFilter('Strike', this)">Strike</button>
        <button class="chip" onclick="setShopFilter('Supply', this)">Supply</button>
        <button class="chip" onclick="setShopFilter('Tactics', this)">Tactics</button>
        <button class="chip" onclick="setShopFilter('Spawn', this)">Spawn</button>
        <button class="chip" onclick="setShopFilter('Secondary', this)">Secondary</button>
      </div>

      <div id="resupplyList"></div>
    </div>

    <!-- TAB 4: AUTOMATED HORDE SPAWNER (n + 1 ZONES) -->
    <div id="tab4" class="hidden">
      <div class="round-banner" style="padding:16px;">
        <h2>Room-Synced Horde Spawner (n + 1 Zones)</h2>
        <p style="margin-bottom:12px;">Synchronized by Room Code &amp; Supabase Cloud Pool • [10–12] &amp; [13+] Roll 1D6 Warp-Breach Intrusion (5+)</p>

        <div style="display:flex; flex-wrap:wrap; gap:10px; justify-content:center; align-items:center; margin-bottom:14px; width:100%; max-width:620px;">
          <select id="spawnZoneCountSelect" style="flex:1; min-width:200px;">
            <option value="3">1,000 Pts (3 Spawn Zones)</option>
            <option value="5">2,000 Pts (5 Spawn Zones)</option>
          </select>
          <select id="hordeFactionSelect" onchange="manualChangeFaction()" style="flex:1; min-width:240px;"></select>
        </div>

        <div style="display:flex; flex-wrap:wrap; gap:14px; justify-content:center; align-items:center; margin-bottom:16px; font-size:0.85rem; width:100%; max-width:640px;">
          <label style="display:inline-flex; align-items:center; gap:6px;">Extra Spawn Mod: <input type="number" id="extraSpawnMod" value="0" style="width:55px; padding:6px; text-align:center; font-family:var(--font-mono); font-weight:700;"></label>
          <label style="display:inline-flex; align-items:center; gap:6px; cursor:pointer;"><input type="checkbox" id="firstRollBonusCheck" style="accent-color:var(--gold);"> +6 1st Zone (Dragon Slayer)</label>
          <label style="display:inline-flex; align-items:center; gap:6px; cursor:pointer;"><input type="checkbox" id="baitTrapBonusCheck" style="accent-color:var(--gold);"> +12 1st Zone (Baiting Trap)</label>
        </div>

        <button class="btn-green" onclick="rollAllSpawnZones()" style="width:100%; max-width:360px; padding:13px; font-size:1rem;">
          🎲 Roll Synced Spawns for Round <span id="spawnerBtnRound">1</span>
        </button>
      </div>

      <div class="section-header">
        <h3>Spawn Zone Results</h3>
        <span class="hud-sub">Unmodified 2 = No Spawn • [10+] Rolls 1D6 Warp-Breach Intrusion (5+)</span>
      </div>
      <div id="spawnResultsContainer">
        <div class="card spawn-zone" style="opacity:0.65; text-align:center;">
          <p class="card-desc">Tap the green button above to generate synchronized brackets and units for each Spawn Zone.</p>
        </div>
      </div>

      <!-- LIVE STANDARD HORDE SPAWN BRACKET MATRIX WINDOW (NO NEMESIS SPOILERS) -->
      <details style="margin-top:16px;" ontoggle="if(this.open && typeof renderLiveSpawnerBracketTable==='function') renderLiveSpawnerBracketTable()">
        <summary style="cursor:pointer; font-weight:800; color:var(--gold);">
          📋 View Active Standard Horde Spawn Brackets ([3–4] to [13+] • Cloud-Synced)
        </summary>
        <div class="drawer-body" id="liveSpawnerBracketWindow" style="font-size:0.84rem; line-height:1.5;">
          Loading active Cloud-Synced Standard Horde Spawn Pool...
        </div>
      </details>

      <!-- CUSTOM COLLECTION POOL LINK (CONFIGURED IN MODE 4) -->
      <div style="margin-top:14px; text-align:center;">
        <a href="roster.html#brackets" class="suite-link" style="display:inline-block; font-size:0.84rem; padding:8px 16px;">
          🎖️ Edit &amp; Cloud-Sync Standard Shelf Pool in Mode 4: Hostile Matrix →
        </a>
      </div>
    </div>

  </div>
</div>

  <script src="../js/data.js"></script>
  <script src="../js/rng.js"></script>
  <script src="../js/spawner.js"></script>
  <script src="../js/app.js"></script>
  <script src="../js/vox-audio.js"></script>
</body>
</html>
````
