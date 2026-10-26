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
  <title>Fires of Armageddon // Field Codex &amp; Theatre Induction</title>
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

    <!-- HERO IN-UNIVERSE WELCOME & THEATRE BRIEFING -->
    <div class="hero-card" style="margin-bottom:24px;">
      <div class="status-pill" style="margin:0 auto 10px auto;">Orbital Tactica Logis • Geostationary Zenith-09 • Sub-Sector Armageddon</div>
      <h1 class="hero-title" style="font-size:2rem; margin-top:6px; text-align:center;">The Fires of Armageddon</h1>
      <p class="hero-subtitle" style="text-align:center; margin:0 auto 18px auto; max-width:760px;">
        11th Edition Hybrid Warhammer 40,000 Narrative Crusade — Co-op Breach Containment, Head-to-Head Ash Wastes Warfare &amp; Live Orbital Command
      </p>

      <div class="lore-quote" style="text-align:left; line-height:1.65; margin-bottom:20px;">
        <p style="margin:0 0 10px 0;">
          <strong>+++ INCOMING ORBITAL TELEMETRY // AUDITOR: LOGIS-PREFECT VANE +++</strong>
        </p>
        <p style="margin:0 0 10px 0;">
          "Below your flagship's armourplast viewports, Armageddon burns like an open furnace. Across the northern continent of the Fire Wastes, the <strong>Red Angel's Gate</strong> stands torn wide—bleeding warp-static and nightmare legions across the ruined spires of Hives Hades, Volcanus, and Thoraddis. Upper-thermosphere sulfuric ash curtains register at <strong>98.6% opacity</strong>, blinding high-altitude orbital augurs over <strong>Sector Nodes 1 through 7</strong>.
        </p>
        <p style="margin:0;">
          Only the equatorial clearing of <strong>Sector Node 0 (The Golgotha Arbor-Basin)</strong> remains open for planetfall, its petrified iron-wood canopy still smoking from first contact. Two rival strike fleets now hang in geostationary siege-orbit above the basin—each vying for territory, relics, and supremacy. Yet neither of you fights alone. Out in the uncharted ash-fog, a <strong>Third Force</strong> is waking. When you lock blades with your rival in the wastes, it will feast upon the aftermath. And when its hordes surround your perimeter in the dark, you will have to decide whether the commander standing beside you is your salvation... or your next target."
        </p>
      </div>

      <!-- 3-STEP NEW COMMANDER ONBOARDING PROTOCOL -->
      <div class="section-header" style="margin-top:4px; margin-bottom:10px;">
        <h3 style="margin:0; font-size:0.95rem; color:var(--gold-bright);">⚡ New Commander Induction Protocol (Where to Begin)</h3>
        <span class="hud-sub">Use the Top Navigation Bar to Switch Modes Anytime</span>
      </div>

      <div class="grid-2" style="grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:12px;">
        <div class="hero-box" style="text-align:left;">
          <strong style="color:var(--gold-bright); font-size:0.9rem; display:block; margin-bottom:4px;">1. Decrypt Your Sealed Dossier (Mode 6)</strong>
          <p style="font-size:0.83rem; color:var(--text); margin:0;">
            Open <a href="pages/briefing.html" style="color:var(--gold); font-weight:700;">📜 Mode 6: Briefings, Ship &amp; Atlas</a> to unlock your private Commander Dataslate (<strong>The Exile</strong> or <strong>Lord Commander Junebug</strong>), inspect the 8-Node Planetary Auspex Map, and review the three warring Alliances (<em>Gatebreakers</em>, <em>Desecrators</em>, and <em>Marauders</em>).
          </p>
        </div>
        <div class="hero-box" style="text-align:left;">
          <strong style="color:var(--gold-bright); font-size:0.9rem; display:block; margin-bottom:4px;">2. Hail High Command on the CRT Vox (Mode 7)</strong>
          <p style="font-size:0.83rem; color:var(--text); margin:0;">
            Step into <a href="pages/vox.html" style="color:var(--gold); font-weight:700;">📡 Mode 7: Astropath Vox</a> and authenticate your private terminal. Speak directly in-character with <strong>Logis-Prefect Vane</strong> in high orbit (or query your ship's machine-spirit), register your Phase 1 Warlord &amp; Alliance banner, and monitor <code>[REDACTED]</code> psychic bleed from your rival's channel.
          </p>
        </div>
        <div class="hero-box" style="text-align:left;">
          <strong style="color:var(--gold-bright); font-size:0.9rem; display:block; margin-bottom:4px;">3. Deploy &amp; Chronicle Every Scar (Modes 1–5)</strong>
          <p style="font-size:0.83rem; color:var(--text); margin:0;">
            Wage synced Co-op Horde defences (<a href="pages/spawner.html" style="color:var(--gold);">Mode 1</a>) or 1v1 PvP clashes (<a href="pages/pvp.html" style="color:var(--gold);">Mode 2</a>), then visit the <a href="pages/crusade.html" style="color:var(--gold);">Mode 5 Quartermaster</a> after the battle to roll upgrades and transmit your Master Battle Dossier so every unit honour and scar is christened with custom lore.
          </p>
        </div>
      </div>
    </div>

    <!-- TUTORIAL 1: MODE 1 HORDE COMMAND & AUTOMATED SPAWNER -->
    <div class="section-card" style="border-left-color:var(--red);">
      <div style="display:flex; justify-content:center; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:12px;">
        <h2 style="margin:0; font-size:1.35rem; color:var(--gold-bright); text-align:center;">🧟 Mode 1: Horde Command &amp; Automated Spawner</h2>
        <span class="badge red">Co-op / Solo Hard Mode</span>
      </div>
      <p style="color:var(--text); font-size:0.94rem; margin-bottom:16px; text-align:center;">
        Stand shoulder-to-shoulder inside a single perimeter against six rounds of escalating waves, misery cards, and sudden warp-breach intrusions.
      </p>

      <div class="grid-2" style="margin-bottom:14px;">
        <div class="hero-box red">
          <strong style="color:var(--gold-bright); font-size:0.92rem; display:block; margin-bottom:4px; text-align:center;">1. Room-Seeded Multi-Device Sync</strong>
          <p style="font-size:0.86rem; color:var(--text); margin:0;">
            Both players enter the same <strong>Room Code</strong> (e.g. <code>HADES-1</code>). Deterministic hashing ensures both phones roll the exact same Horde Faction rule, Secondary Missions, Misery Cards, and non-overlapping Secret Objective pools.
          </p>
        </div>
        <div class="hero-box red">
          <strong style="color:var(--gold-bright); font-size:0.92rem; display:block; margin-bottom:4px; text-align:center;">2. Per-Faction Cloud Pools &amp; Warp-Breach Intrusions (5+)</strong>
          <p style="font-size:0.86rem; color:var(--text); margin:0;">
            Spawns pull directly from the active Horde Faction's cloud-synced shelf pool (<code>[3–4]</code> to <code>[13+]</code>). Whenever a spawn rolls a Big Bracket (<code>[10–12]</code> or <code>[13+]</code>), there's a chance that the zone suffers a <strong>Warp-Breach Intrusion</strong>: The klaxon sounds and an emergency broadcast must be made via the Vox!
          </p>
        </div>
      </div>

      <div class="hero-box">
        <strong style="color:var(--gold-bright); font-size:0.92rem; display:block; margin-bottom:4px; text-align:center;">3. Confidential Secret Objectives &amp; Covert Treachery</strong>
        <p style="font-size:0.86rem; color:var(--text); margin:0;">
          Before Round 1, each commander locks in a private <strong>Secret Objective</strong> with a 3-character verification code. You are forbidden from showing your screen directly, but free to lie or not. Some directives demand heroism; others are covert <strong>Traitor Directives</strong> offering special rewards if you manage to complete it at the cost of your partner's flank...
        </p>
      </div>

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
        Settle grudges head-to-head across Armageddon's shifting Hellscapes while the Unseen Third Force prowls the perimeter.
      </p>

      <div class="grid-2">
        <div class="hero-box">
          <strong style="color:var(--gold); font-size:0.92rem; display:block; margin-bottom:4px; text-align:center;">1. Hellscapes &amp; Warp Anomalies</strong>
          <p style="font-size:0.86rem; color:var(--text); margin:0;">
            Roll on the 6 Armageddon <strong>Hellscapes</strong> (<em>Folded Space</em>, <em>Fractured Realm</em>, <em>Gravitic Nexus</em>, etc.) and test for Battle Round <strong>Warp Anomaly Surges</strong> based on local sector intensity.
          </p>
        </div>
        <div class="hero-box">
          <strong style="color:var(--gold); font-size:0.92rem; display:block; margin-bottom:4px; text-align:center;">2. Unbound Adversaries &amp; PL 4 Apex Anomalies</strong>
          <p style="font-size:0.86rem; color:var(--text); margin:0;">
            Every time you two fight each other, the 3rd Alliance vultures <strong>3–4 Strategic Points</strong>. Click <strong>🎲 Roll Adversary</strong> to roll Power Level (<code>PL 1–4</code>) and ping the Campaign Master on the Vox to reveal which roaming monster, Surface-Deployed Nemesis, or <strong>Classified Apex Anomaly</strong> emerges into No Man's Land!
          </p>
        </div>
      </div>

      <div class="welcome-btn-row">
        <a href="pages/pvp.html" class="terminal-link-btn" style="display:inline-flex; align-items:center; justify-content:center; max-width:280px; padding:12px 24px;">⚔️ Open 1v1 PvP Arena</a>
      </div>
    </div>

    <!-- TUTORIAL 3: MODE 3 ROGUE SECTOR AI PILOT -->
    <div class="section-card" style="border-left-color:var(--purple);">
      <div style="display:flex; justify-content:center; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:12px;">
        <h2 style="margin:0; font-size:1.35rem; color:var(--gold-bright); text-align:center;">🎲 Mode 3: Rogue Sector &amp; Autonomous AI Pilot</h2>
        <span class="badge purple">AI Sequencer &amp; Off-Roster Games</span>
      </div>
      <p style="color:var(--text); font-size:0.94rem; margin-bottom:16px; text-align:center;">
        Impartial 3-phase target priority engine for Horde and Unbound units, plus rules for casual off-roster matches that shift planetary Warp weather.
      </p>

      <div class="ai-step active-step">
        <div class="ai-step-title" style="display:flex; justify-content:space-between; align-items:center;">
          <span>Autonomous AI Turn Sequencer</span>
          <span style="color:var(--gold-bright);">Movement → Shooting → Charge/Fight</span>
        </div>
        <p style="font-size:0.88rem; color:var(--text); margin:0;">
          Step through each AI phase during battle to resolve movement, keyword-driven shooting overrides (<code>[ANTI-X]</code>, <code>[PRECISION]</code>, <code>[MELTA]</code>), and multi-unit charge allocations without human bias—or log off-roster <strong>Rogue Sector Clashes</strong> to alter the next main game's Warp Intensity.
        </p>
      </div>

      <div class="welcome-btn-row">
        <a href="pages/rogue.html" class="terminal-link-btn alt" style="display:inline-flex; align-items:center; justify-content:center; max-width:280px; padding:12px 24px;">🎲 Open AI Flowchart</a>
      </div>
    </div>

    <!-- TUTORIAL 4: MODE 4 HOSTILE MATRIX, NEMESES & PER-FACTION CLOUD POOLS -->
    <div class="section-card" style="border-left-color:var(--blue);">
      <div style="display:flex; justify-content:center; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:12px;">
        <h2 style="margin:0; font-size:1.35rem; color:var(--gold-bright); text-align:center;">🎖️ Mode 4: Hostile Matrix, Nemeses &amp; Per-Faction Cloud Pools</h2>
        <span class="badge blue">Ordo Malleus Threat Archive</span>
      </div>
      <p style="color:var(--text); font-size:0.94rem; margin-bottom:16px; text-align:center;">
        Track recurring cross-mode Nemesis bosses, induct new enemy legends via the Vox, and configure cloud-synced Horde spawn pools for all 23 factions.
      </p>

      <div class="grid-2">
        <div class="hero-box blue">
          <strong style="color:var(--blue); font-size:0.92rem; display:block; margin-bottom:4px; text-align:center;">1. Living Cross-Mode Nemeses</strong>
          <p style="font-size:0.86rem; color:var(--text); margin:0;">
            Any Horde Warlord, Monster, or enemy Character that slays a player's hero or survives Round 6 can be transmitted to the Campaign Master via the <strong>"Vibe-Check" Dossier Compiler</strong>—returning in future matches with a custom title, Boss Battle Trait, and a <strong>special bounty</strong> on its head!
          </p>
        </div>
        <div class="hero-box blue">
          <strong style="color:var(--blue); font-size:0.92rem; display:block; margin-bottom:4px; text-align:center;">2. Per-Faction Cloud-Synced Shelf Barracks</strong>
          <p style="font-size:0.86rem; color:var(--text); margin:0;">
            Select any of the <strong>23 Horde Factions</strong> and customize its 5 threat brackets (<code>[3–4]</code> to <code>[13+]</code>). Clicking <strong>☁️ Save &amp; Sync</strong> stores that faction's pool in Supabase so both commanders roll the exact same faction-accurate spawns on every device.
          </p>
        </div>
      </div>

      <div class="welcome-btn-row">
        <a href="pages/roster.html" class="terminal-link-btn" style="display:inline-flex; align-items:center; justify-content:center; max-width:280px; padding:12px 24px;">🎖️ Open Threat Matrix</a>
      </div>
    </div>

    <!-- TUTORIAL 5: MODE 5 CRUSADE COMMAND & QUARTERMASTER FORGE -->
    <div class="section-card" style="border-left-color:var(--gold);">
      <div style="display:flex; justify-content:center; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:12px;">
        <h2 style="margin:0; font-size:1.35rem; color:var(--gold-bright); text-align:center;">🏆 Mode 5: Crusade Quartermaster, Rollers &amp; Tours of Duty</h2>
        <span class="badge gold">Post-Battle Progression</span>
      </div>
      <p style="color:var(--text); font-size:0.94rem; margin-bottom:16px; text-align:center;">
        Global 3-Way Alliance Scoreboard, 4-Phase branching narrative trees, pure random Upgrade/Relic/Scar rollers, and Munitorum Regulation 884-Alpha Tour of Duty management.
      </p>

      <div class="grid-2" style="margin-bottom:14px;">
        <div class="hero-box">
          <strong style="color:var(--gold-bright); font-size:0.92rem; display:block; margin-bottom:4px; text-align:center;">1. "Upgrades &amp; Scars Have Stories" Rollers</strong>
          <p style="font-size:0.86rem; color:var(--text); margin:0;">
            Roll 1D6 Battle Traits, 2x D6 Weapon Modifications, Crusade Relics, and Out of Action tests across the <strong>Armageddon Theatre</strong> or <strong>Faction Codex</strong> tables, attach them to your Fused Master Battle Dossier, and transmit to the Vox so the Campaign Master christens every upgrade and scar with custom lore!
          </p>
        </div>
        <div class="hero-box">
          <strong style="color:var(--gold-bright); font-size:0.92rem; display:block; margin-bottom:4px; text-align:center;">2. Tours of Duty &amp; Munitorum Logistics</strong>
          <p style="font-size:0.86rem; color:var(--text); margin:0;">
            Track operational quotas (<code>D6+4</code> Battles &amp; <code>D3+2</code> Victories), allocate your 4 Logistics Points across <em>Lexmechanicus, Materiel, Tithe Pool,</em> and <em>Morale</em> (Surplus vs. Deficiency), and cash in Commendation Points!
          </p>
        </div>
      </div>

      <div class="welcome-btn-row">
        <a href="pages/crusade.html" class="terminal-link-btn" style="display:inline-flex; align-items:center; justify-content:center; max-width:280px; padding:12px 24px;">🏆 Open Quartermaster</a>
      </div>
    </div>

    <!-- TUTORIAL 6: MODE 6 BRIEFINGS, SHIP GAUGE & SECTOR ATLAS -->
    <div class="section-card" style="border-left-color:var(--green);">
      <div style="display:flex; justify-content:center; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:12px;">
        <h2 style="margin:0; font-size:1.35rem; color:var(--gold-bright); text-align:center;">📜 Mode 6: Commander Briefings, Ship Gauge &amp; 8-Node Atlas</h2>
        <span class="badge green">Planetary Cartography</span>
      </div>
      <p style="color:var(--text); font-size:0.94rem; margin-bottom:16px; text-align:center;">
        Passphrase-gated Commander Dossiers, internal shipboard tug-of-war telemetry, and the interactive 8-Node Planetary Auspex Map.
      </p>

      <div class="grid-2" style="margin-bottom:14px;">
        <div class="hero-box green">
          <strong style="color:var(--green); font-size:0.92rem; display:block; margin-bottom:4px; text-align:center;">1. Sealed Dossiers &amp; Shipboard Tug-of-War</strong>
          <p style="font-size:0.86rem; color:var(--text); margin:0;">
            Inspect each Commander's private briefing, Session 0 battle chronicles, and <em>The Sanctuary of Ash</em>'s internal equilibrium gauge (balancing between <strong>-1 Lower Decks Favored</strong> and <strong>+1 High Sanctum Favored</strong> while avoiding the quicksand of ±2 and ±3).
          </p>
        </div>
        <div class="hero-box green">
          <strong style="color:var(--green); font-size:0.92rem; display:block; margin-bottom:4px; text-align:center;">2. Parallel 8-Node Sector Hegemony Race (0–8 HP)</strong>
          <p style="font-size:0.86rem; color:var(--text); margin:0;">
            Every sector node (<code>N0–N7</code>) tracks parallel Hegemony pips for both Commanders and the Unseen 3rd Force. Spend <strong>2 Leftover SP (or 1 RP)</strong> on an Orbital Auspex Probe to lift the Fog of War on adjacent nodes—the first alliance to reach <strong>8 HP</strong> conquers the sector!
          </p>
        </div>
      </div>

      <div class="welcome-btn-row">
        <a href="pages/briefing.html" class="terminal-link-btn" style="display:inline-flex; align-items:center; justify-content:center; max-width:280px; padding:12px 24px;">🗺️ Open Briefings &amp; Atlas</a>
      </div>
    </div>

    <!-- TUTORIAL 7: MODE 7 ASTROPATHIC CRT VOX-SANCTUM -->
    <div class="section-card" style="border-left-color:var(--red);">
      <div style="display:flex; justify-content:center; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:12px;">
        <h2 style="margin:0; font-size:1.35rem; color:var(--gold-bright); text-align:center;">📡 Mode 7: Astropathic CRT Vox-Sanctum</h2>
        <span class="badge red">Live Campaign Master Conduit</span>
      </div>
      <p style="color:var(--text); font-size:0.94rem; margin-bottom:16px; text-align:center;">
        Passphrase-sealed Cathode-Ray Terminal linking each Commander's private bridge directly to High Command and their vessel's logic core.
      </p>

      <div class="grid-2">
        <div class="hero-box red">
          <strong style="color:var(--gold-bright); font-size:0.92rem; display:block; margin-bottom:4px; text-align:center;">1. Live Orbital &amp; Shipboard Dispatches</strong>
          <p style="font-size:0.86rem; color:var(--text); margin:0;">
            Transmit directly to <strong>Logis-Prefect Vane</strong> at Geostationary Zenith-09 (or address the machine-spirit of your ship). Receive real-time teletype replies, submit post-battle dossiers, and resolve live <code>PL 4</code> &amp; Warp-Breach Intrusion pings.
          </p>
        </div>
        <div class="hero-box red">
          <strong style="color:var(--gold-bright); font-size:0.92rem; display:block; margin-bottom:4px; text-align:center;">2. ⚡ Psychic Interferences &amp; Omen Broadcasts</strong>
          <p style="font-size:0.86rem; color:var(--text); margin:0;">
            Monitor the <strong>⚡ Interferences</strong> scanner to intercept heavily <code>[REDACTED]</code> carrier-wave fragments whenever your rival transmits secret plots—plus dual-channel Omen warnings when orbiting or slain Nemeses enter the surface hunt!
          </p>
        </div>
      </div>

      <div class="welcome-btn-row">
        <a href="pages/vox.html" class="terminal-link-btn" style="display:inline-flex; align-items:center; justify-content:center; max-width:280px; padding:12px 24px;">📡 Access Astropath Vox</a>
      </div>
    </div>

    <!-- AUDIO & SFX HIGHLIGHT -->
    <div class="card" style="border-left-color:var(--gold); text-align:center;">
      <h3 style="margin-top:0; color:var(--gold-bright); text-align:center;">🔊 Gapless Vox-Caster Ambience &amp; Web Audio Synthesizer</h3>
      <p style="font-size:0.92rem; color:var(--text); line-height:1.6; margin:0 auto; max-width:760px;">
        <strong>Vox-Caster Ambience:</strong> Toggle the top-nav speaker (<code>VOX-AMBIENCE: ON</code>) for atmospheric 40K soundscapes that play across page transitions.<br>
        <strong>Custom Tactical Synthesizers:</strong> Every button, dice roll, relic draw, cloud sync, and Warp-Breach Intrusion triggers custom Web Audio API synthesizers—from ceramite dice clatter and forge anvils to Geller-field failure sirens.
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

    .bracket-matrix-table th,
    .bracket-matrix-table td {
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

    /* Remastered Guided Match Flow Stepper & Cockpit */
    .phase-stepper {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 6px;
      margin-bottom: 14px;
    }

    @media (max-width: 720px) {
      .phase-stepper {
        grid-template-columns: 1fr 1fr;
      }
    }

    .phase-step-btn {
      background: #0b0d13;
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 8px 10px;
      text-align: left;
      cursor: pointer;
      transition: all 0.18s ease;
      color: var(--muted);
    }

    .phase-step-btn:hover {
      border-color: var(--gold);
      color: var(--text);
    }

    .phase-step-btn.active-step {
      background: rgba(255, 71, 87, 0.14);
      border-color: var(--red);
      color: #fff;
      box-shadow: 0 0 12px rgba(255, 71, 87, 0.22);
    }

    .phase-step-num {
      display: block;
      font-size: 0.68rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.6px;
      color: var(--gold);
    }

    .phase-step-title {
      font-size: 0.8rem;
      font-weight: 700;
      margin-top: 2px;
      display: block;
    }

    .flow-guide-banner {
      background: linear-gradient(135deg, rgba(16, 20, 30, 0.96), rgba(26, 15, 23, 0.92));
      border: 1px solid var(--border);
      border-left: 4px solid var(--gold);
      border-radius: 10px;
      padding: 12px 16px;
      margin-bottom: 16px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .flow-guide-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
    }

    .solo-sp-pill {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 2px 8px;
      border-radius: 999px;
      font-size: 0.7rem;
      font-weight: 800;
      background: rgba(59, 130, 246, 0.18);
      border: 1px solid var(--blue);
      color: #93c5fd;
      white-space: nowrap;
      letter-spacing: 0.4px;
    }

    .sp-quick-bar {
      display: flex;
      flex-direction: column;
      gap: 10px;
      background: rgba(11, 13, 19, 0.85);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 10px 14px;
      margin-bottom: 16px;
    }

    .sp-quick-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
    }

    .sp-quick-title-group {
      display: flex;
      align-items: center;
      gap: 6px;
      flex-wrap: wrap;
    }

    .sp-quick-actions {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
    }

    .sp-action-btn {
      height: 38px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0 14px;
      font-size: 0.8rem;
      border-radius: 6px;
      box-sizing: border-box;
      margin: 0;
      white-space: nowrap;
    }

    .sp-obj-group {
      height: 38px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: #141824;
      padding: 0 8px;
      border-radius: 6px;
      border: 1px solid var(--border);
      box-sizing: border-box;
      margin: 0;
    }

    .sp-obj-label {
      font-size: 0.75rem;
      color: var(--text);
      white-space: nowrap;
    }

    .sp-obj-input {
      width: 42px;
      height: 26px;
      padding: 2px 4px;
      text-align: center;
      font-weight: 700;
      background: #0b0d13;
      color: var(--gold);
      border: 1px solid var(--border);
      border-radius: 4px;
      box-sizing: border-box;
    }

    .sp-obj-btn {
      height: 28px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0 10px;
      font-size: 0.78rem;
      border-radius: 4px;
      box-sizing: border-box;
      margin: 0;
      white-space: nowrap;
    }

    .sp-quick-shop-btn {
      height: 30px;
      display: inline-flex;
      align-items: center;
      padding: 0 10px;
      font-size: 0.76rem;
      border-radius: 6px;
      box-sizing: border-box;
      margin: 0;
      white-space: nowrap;
    }

    .card-dock-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: nowrap;
      gap: 8px;
      margin: 0 0 10px 0;
      padding-bottom: 6px;
      border-bottom: 1px dashed var(--border);
      min-height: 28px;
      box-sizing: border-box;
    }

    .card-dock-header h3 {
      margin: 0;
      font-size: 0.92rem;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: var(--gold);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .card-dock-header .hud-sub {
      white-space: nowrap;
      flex-shrink: 0;
      font-size: 0.74rem;
    }

    .misery-card-official {
      border-left: 4px solid var(--red);
      background: linear-gradient(145deg, rgba(28, 13, 18, 0.95), rgba(15, 17, 25, 0.95));
      padding: 14px 16px;
      border-radius: 10px;
      margin-bottom: 10px;
      border: 1px solid rgba(255, 71, 87, 0.35);
      border-left-width: 4px;
    }

    .misery-meta-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      margin-bottom: 6px;
      flex-wrap: wrap;
    }

    .misery-card-num {
      font-family: var(--font-mono, monospace);
      font-size: 0.74rem;
      font-weight: 800;
      padding: 2px 8px;
      border-radius: 4px;
      background: rgba(255, 71, 87, 0.2);
      color: #fda4af;
      border: 1px solid rgba(255, 71, 87, 0.4);
    }

    .misery-timing-tag {
      font-size: 0.72rem;
      font-weight: 700;
      text-transform: uppercase;
      padding: 2px 8px;
      border-radius: 4px;
      background: rgba(234, 179, 8, 0.15);
      color: var(--gold);
      border: 1px solid rgba(234, 179, 8, 0.35);
    }

    .misery-verbatim-body {
      font-size: 0.92rem;
      line-height: 1.55;
      color: #f1f5f9;
      margin: 6px 0 8px 0;
    }

    .misery-tactical-note {
      font-size: 0.78rem;
      color: #cbd5e1;
      background: rgba(0, 0, 0, 0.35);
      border-left: 2px solid var(--gold);
      padding: 6px 10px;
      border-radius: 4px;
      margin-top: 6px;
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
          "The empyric barriers around the Red Angel's Gate are fracturing. Synchronize your dataslates, lock in your
          covert directives, and hold the ash wastes until extraction."
        </div>
      </div>

      <!-- 1. ROOM CODE -->
      <div
        style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px; margin-bottom:4px;">
        <label class="setup-label" style="margin-bottom:0;">1. Shared Room Code (Syncs Decks, Horde Faction &amp;
          Spawns)</label>
        <span id="setupSyncPill" class="cloud-sync-pill" style="font-size:0.75rem;">☁️ Supabase Live Room Sync
          Ready</span>
      </div>
      <div class="seed-row">
        <input type="text" id="seedInput" class="seed-input" placeholder="e.g. HADES-1" value="HADES-1"
          oninput="if(window.onRoomCodeChanged) onRoomCodeChanged()"
          onchange="if(window.onRoomCodeChanged) onRoomCodeChanged()">
        <button type="button" class="dice-btn" onclick="generateRandomCode()">🎲 New Room</button>
      </div>

      <!-- 2. HORDE PRIMARY FACTION (SYNCED BY ROOM CODE) -->
      <label class="setup-label">2. Horde Primary Faction Rule (Section 7.5)</label>
      <select id="setupFactionMode" style="width:100%; padding:12px; font-weight:600; background:#0b0d13;"
        onchange="if(window.onSetupFactionModeChanged) onSetupFactionModeChanged()">
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
          <div class="choice-sub">2 Players • 1x SP Rate (Max 8 SP/Rnd) • Full 34 Secret Deck</div>
        </div>
        <div id="modeCardSolo" class="choice-card" onclick="selectMode('solo')">
          <span class="choice-icon">🛡️</span>
          <div class="choice-title">Solo Last Stand (2x SP)</div>
          <div class="choice-sub">1 Player • 2x All SP Gains (Max 16 SP/Rnd) • Solo Secret Deck</div>
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
        <span class="rule-tag"><strong>Difficulty:</strong> Hard Mode v0.9</span>
        <span class="rule-tag"><strong>Spawn Zones:</strong> n + 1 (3 @ 1k / 5 @ 2k)</span>
        <span class="rule-tag"><strong>Solo Rule 3.7:</strong> 2x SP Gains (Cap 16/Rnd)</span>
      </div>

      <button class="launch-btn" onclick="startSession()">
        Deploy to Battlefield →
      </button>
    </div>

    <!-- MAIN GAME INTERFACE -->
    <div id="gameScreen" class="hidden">

      <!-- STICKY TOP HUD -->
      <div class="hud-bar">
        <div class="hud-stat" style="flex-shrink:0;">
          <div style="display:flex; align-items:center; gap:8px; white-space:nowrap;">
            <span class="hud-label" id="hudSessionInfo" style="white-space:nowrap; margin-bottom:0;">HADES-1 • P1</span>
            <span id="spawnerSyncBadge" class="cloud-sync-pill" style="cursor:pointer;"
              onclick="if(window.manualSyncSpawnerNow) manualSyncSpawnerNow()"
              title="Live synced across all players with this Room Code. Tap to refresh.">☁️ Room Live</span>
          </div>
          <div style="display:flex; align-items:center; gap:8px; margin-top:2px;">
            <span class="hud-num" id="hudRound"
              style="color:var(--red); text-align:left; display:inline-block; min-width:auto;">Pre-Game</span>
            <span id="soloDoubleSpHudBadge" class="solo-sp-pill hidden"
              title="Rule 3.7: In a single-player game, double all SP gains!">⚡ SOLO 2x SP ACTIVE</span>
          </div>
        </div>

        <div class="hud-stat">
          <span class="hud-label">Supply (SP) <span id="hudSpCap" class="hud-sub" style="cursor:pointer;"
              onclick="adjustSpRoundTally()"
              title="Click to manually adjust Round SP tally (finite round cap)">(0/8)</span></span>
          <div class="hud-val-row">
            <button class="mini-btn" onclick="loseSP(1)" title="Reduce 1 SP">−</button>
            <span class="hud-num" id="hudSp" style="color:var(--blue);">0</span>
            <button class="mini-btn" id="hudGainSpBtn" onclick="gainSP(1)"
              title="Gain SP (+1 in Co-op / +2 in Solo)">+</button>
          </div>
        </div>

        <div class="hud-stat">
          <span class="hud-label">Command (CP) <span id="hudStratTally" class="hud-sub" style="cursor:pointer;"
              onclick="adjustStratTally()" title="Click to adjust or reset Stratagems used count">(0
              Strats)</span></span>
          <div class="hud-val-row">
            <button class="mini-btn" onclick="spendCPForStrat()" title="Spend 1 CP on Stratagem">−</button>
            <span class="hud-num" id="hudCp" style="color:var(--purple);">2</span>
            <button class="mini-btn" onclick="adjCP(1)" title="Add 1 CP">+</button>
          </div>
        </div>

        <div class="hud-actions" style="display:flex; gap:6px; align-items:center; flex-shrink:0;">
          <button class="btn-ghost btn-sm" onclick="resetMatchToSetup()"
            title="Reset battle and clear all spawner cards">🔄 Reset</button>
          <button class="btn-ghost btn-sm" onclick="leaveSession()" title="Exit to mission setup">Exit</button>
        </div>
      </div>

      <!-- PERSISTENT SYNCED HORDE FACTION REMINDER BANNER -->
      <div class="faction-reminder-bar">
        <div class="faction-reminder-title">
          <span id="activeFactionBannerTitle">HORDE FACTION: CHAOS DAEMONS</span>
          <span style="font-size:0.7rem; color:var(--muted);">Synced to Room Code</span>
        </div>
        <div id="activeFactionBannerDesc" style="color:#e2e8f0;"></div>
      </div>

      <!-- 3 UNIFIED NAVIGATION TABS -->
      <div class="nav-pills">
        <button id="tabBtn1" class="active" onclick="switchTab(1)">1. Match Command &amp; Spawner</button>
        <button id="tabBtn2" onclick="switchTab(2)">2. Secret Directive</button>
        <button id="tabBtn3" onclick="switchTab(3)">3. Resupply Shop</button>
      </div>

      <!-- TAB 1: REMASTERED UNIFIED BATTLE ROUND COCKPIT -->
      <div id="tab1">

        <!-- ROUND CONTROL & ONE-CLICK FLOW BANNER -->
        <div class="round-banner" style="padding:18px;">
          <div
            style="display:flex; justify-content:center; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:4px;">
            <span class="badge red" id="roundHardModeBadge">Hard Mode v0.9 • 6 Rounds</span>
            <span class="badge gold" id="roundRuleSummaryBadge">Pre-Game Deployment: Roll Round 1 Spawns First!</span>
          </div>
          <h2 id="roundTitle" style="margin-top:4px;">Deployment &amp; Setup</h2>
          <p id="spawnModDisplay" style="margin-bottom:12px;">Step 1: Roll your initial Round 1 Horde Spawns below, lock
            your Secret Objective, then click Begin Battle Round 1!</p>

          <div
            style="display:flex; flex-wrap:wrap; gap:10px; justify-content:center; width:100%; max-width:440px; margin:0 auto;">
            <button class="btn-red" id="nextRoundBtn" onclick="advanceBattleRound()"
              style="flex:1; min-width:240px; padding:12px; font-weight:800;">
              Begin Battle Round 1 →
            </button>
          </div>
          <span id="cockpitSpawnBtnRound" style="display:none;">1</span>

          <div
            style="margin-top:10px; display:flex; justify-content:center; gap:14px; flex-wrap:wrap; font-size:0.8rem; color:var(--muted);">
            <label style="cursor:pointer; display:inline-flex; align-items:center; gap:6px;">
              <input type="checkbox" id="autoRollSpawnsOnAdvanceCheck" checked style="accent-color:var(--gold);">
              Auto-roll Horde Spawns when advancing Rounds 2–5
            </label>
          </div>
        </div>

        <!-- INTERACTIVE 5-STEP BATTLE ROUND PHASE STEPPER -->
        <div class="phase-stepper" id="roundPhaseStepper">
          <button type="button" class="phase-step-btn active-step" data-step="1" onclick="setGuidedPhaseStep(1)">
            <span class="phase-step-num">Phase 1 • Start of Round</span>
            <span class="phase-step-title">1. Misery, Secondary &amp; Spawns</span>
          </button>
          <button type="button" class="phase-step-btn" data-step="2" onclick="setGuidedPhaseStep(2)">
            <span class="phase-step-num">Phase 2 • Horde Turn</span>
            <span class="phase-step-title">2. Horde Move, Shoot &amp; Fight</span>
          </button>
          <button type="button" class="phase-step-btn" data-step="3" onclick="setGuidedPhaseStep(3)">
            <span class="phase-step-num">Phase 3 • Player Command</span>
            <span class="phase-step-title">3. Objectives SP &amp; Resupply</span>
          </button>
          <button type="button" class="phase-step-btn" data-step="4" onclick="setGuidedPhaseStep(4)">
            <span class="phase-step-num">Phase 4 • Player Turn</span>
            <span class="phase-step-title">4. Actions, Combat &amp; Kills</span>
          </button>
          <button type="button" class="phase-step-btn" data-step="5" onclick="setGuidedPhaseStep(5)">
            <span class="phase-step-num">Phase 5 • End of Round</span>
            <span class="phase-step-title">5. Resolve Secondary Mission</span>
          </button>
        </div>

        <!-- CONTEXTUAL PHASE CHECKLIST & SOLO 2X SP CALCULATOR -->
        <div class="flow-guide-banner" id="guidedPhaseBanner">
          <div class="flow-guide-header">
            <div>
              <span class="badge gold" id="guidedPhaseBadge">STEP 1 OF 5 • START OF ROUND</span>
              <h4 id="guidedPhaseHeading" style="margin:4px 0 0 0; font-size:1rem;">Reveal Misery, Secondary Mission
                &amp; Spawn the Horde</h4>
            </div>
            <div style="display:flex; gap:6px;">
              <button type="button" class="btn-ghost btn-sm" onclick="stepGuidedPhase(-1)">← Prev Step</button>
              <button type="button" class="btn-gold btn-sm" onclick="stepGuidedPhase(1)">Next Step →</button>
            </div>
          </div>
          <div id="guidedPhaseInstructions" style="font-size:0.86rem; color:#cbd5e1; line-height:1.5;">
            During Deployment (Rule 2.9), roll your Round 1 Horde Spawns first. Then click <strong>Begin Battle Round
              1</strong> above to draw Round 1's Misery Card (Hard Mode: 1 Misery, +0 Spawn Mod) and Secondary Mission!
          </div>
        </div>

        <!-- QUICK SUPPLY POINT (SP) INCOME & KILL TRACKER BAR -->
        <div class="sp-quick-bar">
          <div class="sp-quick-header">
            <div class="sp-quick-title-group">
              <span style="font-size:0.78rem; font-weight:800; text-transform:uppercase; color:var(--gold);">⚡ Quick SP
                Income:</span>
              <span id="spMultiplierStatusText" style="font-size:0.76rem; color:var(--muted);">Co-op (1x Base SP)</span>
            </div>
            <button type="button" class="btn-ghost btn-sm sp-quick-shop-btn" onclick="switchTab(3)"
              title="Open Resupply Shop to spend SP">
              🛒 Open Resupply Shop →
            </button>
          </div>

          <div class="sp-quick-actions">
            <button type="button" class="btn-blue btn-sm sp-action-btn" onclick="awardHordeKillSP(1)"
              id="btnQuickKillSp" title="Rule 3.7: Gain SP for destroying a Horde unit (Doubled in Solo Mode)">
              💀 +1 Horde Unit Destroyed (<span class="sp-unit-val">+1</span> SP)
            </button>

            <div class="sp-obj-group">
              <span class="sp-obj-label">Controlled Obj:</span>
              <input type="number" id="quickObjCountInput" value="2" min="0" max="8" class="sp-obj-input"
                onchange="if(typeof saveSessionState==='function')saveSessionState();">
              <button type="button" class="btn-gold btn-sm sp-obj-btn" id="btnClaimCommandSp"
                onclick="awardCommandPhaseObjectiveSP()"
                title="Rule 3.7: Gain 1 SP per controlled objective (+1 if FOB fortified). Automatically doubled in Solo Mode!">
                🚩 Claim Command SP
              </button>
            </div>
          </div>
        </div>

        <!-- ACTIVE SECONDARY MISSION & ACTIVE MISERY CARDS (SIDE-BY-SIDE ON DESKTOP) -->
        <div class="grid-2" style="align-items:stretch; gap:14px; margin-bottom:16px;">
          <div style="display:flex; flex-direction:column;">
            <div class="card-dock-header">
              <h3>🎯 Active Secondary Mission</h3>
              <span id="secDeckCount" class="hud-sub"></span>
            </div>
            <div id="activeSecondariesBox" style="flex:1; display:flex; flex-direction:column;"></div>
          </div>

          <div style="display:flex; flex-direction:column;">
            <div class="card-dock-header">
              <h3>☠️ Active Misery Cards</h3>
              <span id="misDeckCount" class="hud-sub"></span>
            </div>
            <div id="activeMiseriesBox" style="flex:1; display:flex; flex-direction:column;"></div>
          </div>
        </div>

        <!-- CONSOLIDATED LIVE HORDE SPAWN ZONES & ADVANCED CONTROLS -->
        <div class="card"
          style="border:1px solid var(--border); background:rgba(11,13,19,0.85); padding:16px; margin-bottom:16px;">
          <div
            style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:12px;">
            <div>
              <span class="badge green">Live Synced Spawner Feed</span>
              <h3 style="margin:4px 0 0 0; font-size:1.05rem;">Current Round Horde Spawn Zones</h3>
              <p style="margin:4px 0 2px 0; font-size:0.8rem; color:var(--muted);">Live-Synchronized Across All Connected Players via Room Code &amp; Supabase Cloud • [10–12] &amp; [13+] Roll 1D6 Warp-Breach Intrusion (6+)</p>
              <span class="hud-sub">Unmodified 2 = No Spawn • [10+] Rolls 1D6 Warp-Breach Intrusion (6+)</span>
            </div>
            <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center;">
              <button type="button" class="btn-green btn-sm" onclick="rollSpawnsFromCockpit()">🎲 Roll Spawns</button>
              <button type="button" class="btn-ghost btn-sm" onclick="clearSpawnerResults()"
                title="Clear spawn cards for this round">🧹 Clear Cards</button>
            </div>
          </div>

          <!-- PRIMARY SPAWN RESULTS CONTAINER -->
          <div id="spawnResultsContainer">
            <div class="card spawn-zone" style="opacity:0.65; text-align:center;">
              <p class="card-desc">No Horde Spawns rolled for this round yet. Click <strong>"🎲 Roll Horde
                  Spawns"</strong> above to generate synchronized brackets and units for each Spawn Zone!</p>
            </div>
          </div>
          <!-- Hidden alias elements for backwards compatibility -->
          <div id="cockpitSpawnMirrorBox" style="display:none;"></div>
          <span id="spawnerBtnRound" style="display:none;">1</span>

          <!-- COLLAPSIBLE ADVANCED MODIFIERS & ZONE CONFIGURATION -->
          <details
            style="margin-top:14px; background:rgba(0,0,0,0.3); border:1px solid var(--border); border-radius:6px; padding:10px 14px;">
            <summary style="cursor:pointer; font-weight:700; color:var(--gold); font-size:0.86rem; user-select:none;">
              ⚙️ Tactical Spawn Modifiers, Zone Count &amp; Faction Override
            </summary>
            <div class="drawer-body" style="padding-top:12px;">
              <div
                style="display:flex; flex-wrap:wrap; gap:10px; justify-content:center; align-items:center; margin-bottom:12px;">
                <select id="spawnZoneCountSelect" onchange="onChangeSpawnZoneCount()" style="flex:1; min-width:180px;">
                  <option value="3">1,000 Pts (3 Spawn Zones)</option>
                  <option value="5">2,000 Pts (5 Spawn Zones)</option>
                </select>
                <select id="hordeFactionSelect" onchange="manualChangeFaction()"
                  style="flex:1; min-width:220px;"></select>
              </div>
              <div
                style="display:flex; flex-wrap:wrap; gap:14px; justify-content:center; align-items:center; font-size:0.84rem;">
                <label style="display:inline-flex; align-items:center; gap:6px;">Extra Spawn Mod: <input type="number"
                    id="extraSpawnMod" value="0"
                    style="width:55px; padding:5px; text-align:center; font-family:var(--font-mono); font-weight:700;"></label>
                <label style="display:inline-flex; align-items:center; gap:6px; cursor:pointer;"><input type="checkbox"
                    id="firstRollBonusCheck" style="accent-color:var(--gold);"> +6 1st Zone (Dragon Slayer)</label>
                <label style="display:inline-flex; align-items:center; gap:6px; cursor:pointer;"><input type="checkbox"
                    id="baitTrapBonusCheck" style="accent-color:var(--gold);"> +12 1st Zone (Baiting Trap)</label>
              </div>
            </div>
          </details>

          <!-- LIVE STANDARD HORDE SPAWN BRACKET MATRIX (NO NEMESIS SPOILERS) -->
          <details
            style="margin-top:10px; background:rgba(0,0,0,0.3); border:1px solid var(--border); border-radius:6px; padding:10px 14px;"
            ontoggle="if(this.open && typeof renderLiveSpawnerBracketTable==='function') renderLiveSpawnerBracketTable()">
            <summary style="cursor:pointer; font-weight:800; color:var(--gold); font-size:0.86rem; user-select:none;">
              📋 View Active Standard Horde Spawn Brackets ([3–4] to [13+] • Cloud-Synced)
            </summary>
            <div class="drawer-body" id="liveSpawnerBracketWindow"
              style="font-size:0.84rem; line-height:1.5; padding-top:12px;">
              Loading active Cloud-Synced Standard Horde Spawn Pool...
            </div>
          </details>

          <!-- CUSTOM COLLECTION POOL LINK (CONFIGURED IN MODE 4) -->
          <div style="margin-top:14px; text-align:center;">
            <a href="roster.html#brackets" class="suite-link"
              style="display:inline-block; font-size:0.8rem; padding:6px 14px;">
              🎖️ Edit &amp; Cloud-Sync Standard Shelf Pool in Mode 4: Hostile Matrix →
            </a>
          </div>
        </div>

        <!-- MANUAL CARD DRAWS & PUNISHMENT TRIGGERS -->
        <details>
          <summary>Manual Card Draws, Specific Misery Search &amp; Punishment Triggers</summary>
          <div class="drawer-body">
            <div style="display:flex; flex-wrap:wrap; gap:8px; margin-bottom:12px; justify-content:center;">
              <button class="btn-gold btn-sm" onclick="drawSecondary(false)">+1 Secondary (Tempt Fate)</button>
              <button class="btn-ghost btn-sm" onclick="replaceSecondary()">Replace Secondary (Advanced
                Tactics)</button>
              <button class="btn-red btn-sm" onclick="drawMisery(1)">+1 Misery Card</button>
              <button class="btn-red btn-sm" onclick="drawMisery(2)">+2 Misery Cards (Lamentable / Solo)</button>
            </div>
            <div
              style="display:flex; gap:8px; align-items:center; justify-content:center; max-width:520px; margin:0 auto;">
              <select id="specificMiserySelect" style="flex:1; padding:8px;">
                <option value="6">#6 Stray Orbital Bombardment (Paint Targets Failed)</option>
                <option value="13">#13 Pincer Maneuver (Tactical Withdrawal Failed)</option>
                <option value="14">#14 No Hard Feelings (0 SP / Solo +2 Misery)</option>
                <option value="20">#20 Lamentable Luck (Reveal +2 Misery)</option>
                <option value="22">#22 Comms Jammed (Secure the LZ Failed)</option>
                <option value="31">#31 Debris Storm (Destroy the Evidence)</option>
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
              <p class="hud-sub" style="margin-top:6px;">Share this encrypted code with the Campaign Master to log your
                objective secretly.</p>
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
        <details open style="margin-top:0; margin-bottom:16px;">
          <summary>Active Fortifications &amp; Field Markers</summary>
          <div class="drawer-body">
            <div class="fort-grid">
              <label class="fort-item"><span>FOB (+1 SP / +2 Solo)</span><input type="checkbox"
                  id="fobFortCheck"></label>
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

        <div
          style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; flex-wrap:wrap; gap:8px;">
          <span class="hud-label">Filter Resupply Options (Rule 3.8: Command Phase Resupply Step)</span>
          <label style="font-size:0.8rem; color:var(--red); cursor:pointer;">
            <input type="checkbox" id="doubleCostToggle" onchange="renderResupplyTable()"> Seller's Market (#24 • 2x
            Cost)
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



    </div>
  </div>

  <script src="../js/data.js"></script>
  <script src="../js/rng.js"></script>
  <script src="../js/spawner.js"></script>
  <script src="../js/app.js"></script>
  <script src="../js/vox-audio.js"></script>

  <!-- REMASTERED HORDE RULES v0.9 & RESUPPLY OVERRIDES: MODULAR ASSET & COCKPIT MODULES -->
  <script src="../js/spawner-cards.js"></script>
  <script src="../js/spawner-cockpit.js"></script>
  <script src="../js/spawner-resupply.js"></script>

</body>

</html>
````
