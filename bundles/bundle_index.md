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
    <a href="pages/roster.html" class="suite-link">🎖️ Rosters &amp; Nemesis Ledger</a>
    <a href="pages/briefing.html" class="suite-link">📜 Briefings, Ship &amp; Atlas</a>
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
          <strong style="color:var(--gold-bright); font-size:0.92rem; text-transform:uppercase;">Mode 4: Rosters</strong>
          <span style="font-size:0.78rem; color:var(--muted); margin-top:4px;">Ledger &amp; Persistent Nemeses</span>
        </a>
        <a href="pages/briefing.html" class="welcome-quick-card">
          <span style="font-size:1.6rem; margin-bottom:6px;">📜</span>
          <strong style="color:var(--gold-bright); font-size:0.92rem; text-transform:uppercase;">Mode 5: Briefings</strong>
          <span style="font-size:0.78rem; color:var(--muted); margin-top:4px;">Ship Slider &amp; Sector Atlas</span>
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
</head>
<body>

  <!-- CAMPAIGN SUITE TOP NAVIGATION -->
  <nav class="suite-nav">
    <a href="../index.html" class="suite-link">📖 Field Codex &amp; Guide</a>
    <a href="spawner.html" class="suite-link active">🧟 Mode 1: Horde Command &amp; Spawner</a>
    <a href="pvp.html" class="suite-link">⚔️ Mode 2: 1v1 Ash Wastes PvP</a>
    <a href="rogue.html" class="suite-link">🎲 Mode 3: Rogue Sector &amp; AI Tracker</a>
    <a href="roster.html" class="suite-link">🎖️ Rosters &amp; Nemesis Ledger</a>
    <a href="briefing.html" class="suite-link">📜 Briefings, Ship &amp; Atlas</a>
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
          <div class="choice-title">Commander Alpha</div>
          <div class="choice-sub">Primary Objective Deck (Slot 1)</div>
        </div>
        <div id="roleCard2" class="choice-card" onclick="selectRole('2')">
          <span class="choice-icon">💀</span>
          <div class="choice-title">Commander Beta</div>
          <div class="choice-sub">Secondary Objective Deck (Slot 2)</div>
        </div>
      </div>
    </div>

    <!-- 5. SURVIVAL DURATION -->
    <label class="setup-label">5. Hard Mode Protocol</label>
    <div class="choice-card selected" style="margin-bottom:20px; cursor:default; border-color:var(--gold);">
      <div class="choice-title" style="color:var(--gold-bright);">Standard Hard Mode Engagement (6 Rounds)</div>
      <div class="choice-sub">Rounds 1–5: Escalating Wave Spawns &amp; Misery Cards • Round 6: The Final Stand</div>
    </div>

    <!-- LAUNCH BUTTON -->
    <button class="launch-btn" onclick="startSession()">Initiate Battle Sequence</button>
  </div>

  <!-- GAME SCREEN -->
  <div id="gameScreen" class="hidden">

    <!-- TOP HUD BAR -->
    <div class="hud-bar">
      <div>
        <div class="hud-label">Current Round</div>
        <div class="hud-val" id="hudRoundDisplay">Round 1 / 6</div>
      </div>
      <div>
        <div class="hud-label">Enemy Faction</div>
        <div class="hud-val" id="hudFactionDisplay" style="color:var(--red-bright); font-size:1.05rem;">Space Marines</div>
      </div>
      <div>
        <div class="hud-label">Room Seed</div>
        <div class="hud-val" id="hudSeedDisplay" style="color:var(--gold-bright);">HADES-1</div>
      </div>
      <button class="mini-btn" onclick="returnToSetup()">End Battle</button>
    </div>

    <!-- ACTIVE HORDE RULE CARD -->
    <div id="activeFactionRuleCard" class="card" style="border-left-color: var(--red);">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span class="badge red">Horde Rule (Section 7.5)</span>
        <span id="activeFactionCategory" style="font-family:var(--font-mono); font-size:0.75rem; color:var(--muted); text-transform:uppercase;">IMPERIUM</span>
      </div>
      <h3 id="activeFactionRuleName" style="margin-top:6px; color:var(--gold-bright);">Transhuman Skills</h3>
      <p id="activeFactionRuleDesc" class="card-desc">All enemy units have a 6+ Feel No Pain.</p>
    </div>

    <!-- ROUND ESCALATION BANNER -->
    <div id="roundEscalationCard" class="card">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span class="badge gold" id="roundBadge">Round 1</span>
        <span class="hud-sub" id="roundMaxSpText">Max SP: 8 (4/Player)</span>
      </div>
      <h3 id="roundTitleText" style="margin-top:8px; font-size:1.15rem; color:var(--text);">Vanguard Probing Attacks</h3>
      <p id="roundInstructionText" class="card-desc">Roll on the Spawner Table. Resolve 1 Secondary Mission and 1 Misery Card.</p>
    </div>

    <!-- SECRET OBJECTIVE (COLLAPSIBLE / PROTECTED) -->
    <div class="card secret">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span class="badge blue" id="secretBadgeRole">Commander Alpha // Classified Directive</span>
        <button class="btn-blue btn-sm" id="toggleSecretBtn" onclick="toggleSecretVisibility()">Reveal Directive</button>
      </div>

      <div id="secretRevealedContent" class="hidden" style="margin-top:12px;">
        <h3 id="secretObjName" style="color:var(--gold-bright); margin-bottom:4px;">In The Emperor's Name</h3>
        <span class="badge" id="secretObjTypeBadge" style="background:#222; margin-bottom:8px;">Heroic Directive</span>
        <p id="secretObjDesc" class="card-desc" style="margin-top:8px; font-size:0.95rem;">Do not allow any friendly unit to fall below half-strength.</p>

        <div class="cm-code" id="secretCmCodeDisplay">CM CODE: 1000</div>
        <p class="hud-sub" style="margin-top:4px;">Keep this code secret until the endgame verification phase.</p>
      </div>
    </div>

    <!-- MISERY CARD -->
    <div class="card misery">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span class="badge red">Active Misery Card</span>
        <span class="hud-sub" id="miseryCardNum">Misery #1</span>
      </div>
      <h3 id="miseryName" style="color:#ff8585; margin-top:6px;">Vox Interference</h3>
      <p id="miseryDesc" class="card-desc">Strategems cost +1 CP this battle round.</p>
    </div>

    <!-- SECONDARY MISSION CARD -->
    <div class="card secondary">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span class="badge gold">Secondary Mission</span>
        <span class="hud-sub" id="secondaryCardNum">Mission #1</span>
      </div>
      <h3 id="secondaryName" style="color:var(--gold-bright); margin-top:6px;">Hold the High Ground</h3>
      <p id="secondaryCondition" class="card-desc"><strong>Condition:</strong> Hold Objective 2 at end of round.</p>
      <div class="hud-sub" style="margin-top:6px;">
        <span style="color:var(--green);"><strong>Reward:</strong> +2 SP &amp; +1 CP</span> • 
        <span style="color:var(--red-bright);"><strong>Punishment:</strong> Horde spawns +1 Swarm in Zone 1</span>
      </div>
    </div>

    <!-- RESUPPLY PURCHASE DRAWER -->
    <details>
      <summary>Requisition &amp; Resupply Armory (Tap to Browse)</summary>
      <div class="drawer-body">
        <p class="hud-sub" style="margin-bottom:12px;">Spend earned Supply Points (SP) on tactical enhancements, orbital support, and emergency reinforcements.</p>
        <div id="resupplyList"></div>
      </div>
    </details>

    <!-- ROUND CONTROLS -->
    <div class="action-bar">
      <button class="action-btn btn-gold" onclick="advanceRound()">Next Round ❯</button>
      <button class="action-btn btn-red" onclick="triggerFinalStand()">⚠️ Trigger Final Stand</button>
    </div>

    <!-- =========================================================================
         MULTI-ZONE DYNAMIC SPATIAL SPANWER (SECTION 7.3)
         ========================================================================= -->
    <div class="section-card" style="border-left-color: var(--green); margin-top:20px;">
      <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
        <div>
          <span class="badge green">Section 7.3 Spatial Spawner</span>
          <h2 style="margin:4px 0 0 0; font-size:1.25rem;">Horde Spawn Generator</h2>
        </div>
        <div style="display:flex; gap:6px; align-items:center;">
          <label style="font-size:0.8rem; font-family:var(--font-mono); color:var(--muted);">Spawn Zones:</label>
          <select id="spawnerZoneCount" style="padding:4px 8px; font-weight:700; background:#0b0d13;">
            <option value="2">2 Zones</option>
            <option value="3" selected>3 Zones (Standard)</option>
            <option value="4">4 Zones (Large Table)</option>
          </select>
        </div>
      </div>

      <p class="hud-sub" style="margin-top:8px;">
        Roll 2D6 on the terminal or enter your physical dice roll. Brackets cascade down (10+ ➔ 7–9 ➔ 5–6 ➔ 3–4). Unmodified 2 = No Spawn.
      </p>

      <!-- SPATIAL SPANWER CONTROLS -->
      <div class="seed-row" style="margin:12px 0;">
        <button class="btn-green" style="flex:1; padding:12px; font-size:0.95rem;" onclick="generateMultiZoneSpawns()">
          🎲 Roll &amp; Spawn All Zones
        </button>
      </div>

      <!-- SPATIAL RESULTS GRID -->
      <div id="spawnResultsContainer">
        <div class="card spawn-zone" style="opacity:0.65;">
          <p class="card-desc">Tap the green button above to generate synchronized brackets and units for each Spawn Zone.</p>
        </div>
      </div>

      <!-- CUSTOM COLLECTION POOL BUILDER -->
      <details>
        <summary>Customize Your Shelf Pool (Auto-Picks Models You Own)</summary>
        <div class="drawer-body" style="text-align:left;">
          <p class="hud-sub" style="margin-bottom:10px;">Enter the units you own for each bracket (comma-separated). Both players can paste the same list so unit names sync too!</p>
          <label class="hud-label">Bracket [3–4] (0–75 pts)</label>
          <input type="text" id="pool34" style="width:100%; margin-bottom:10px;" value="10 Hormagaunts, 10 Termagants, 10 Cultists, 3 Nurglings, 5 Barbgaunts">
          <label class="hud-label">Bracket [5–6] (76–150 pts)</label>
          <input type="text" id="pool56" style="width:100%; margin-bottom:10px;" value="10 Bloodletters, 10 Genestealers, 5 Chaos Terminators, 3 Tyranid Warriors, 10 Gargoyles">
          <label class="hud-label">Bracket [7–9] (151–300 pts)</label>
          <input type="text" id="pool79" style="width:100%; margin-bottom:10px;" value="1 Trygon, 1 Screamer-Killer, 1 Daemon Prince, 1 Chaos Predator, 6 Bloodcrushers">
          <label class="hud-label">Bracket [10+] (301–550 pts)</label>
          <input type="text" id="pool10" style="width:100%; margin-bottom:10px;" value="1 Bloodthirster, 1 Norn Emissary, 1 Great Unclean One, 1 Tyrannofex + Hive Tyrant">
          <button class="btn-blue btn-sm" onclick="saveCustomPool()">Save Shelf Pool to Browser</button>
        </div>
      </details>
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
