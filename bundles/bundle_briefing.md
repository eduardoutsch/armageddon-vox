# 📦 Fires of Armageddon // Bundle: Briefings (Part 1: Launchpad, Alpha & Beta Dossiers)

Complete markup and Auspex layout for Commander Conduit Grid, and Commander Alpha (Krieg) & Beta (Necron) briefings (`pages/briefing.html`).

## 📑 Table of Contents
- [pages/briefing.html (Part 1: Conduits, Alpha & Beta Dossiers)](#file-pagesbriefinghtmlpart1conduitsalphabetadossiers)

---

## File: `pages/briefing.html (Part 1: Conduits, Alpha & Beta Dossiers)` <a id="file-pagesbriefinghtmlpart1conduitsalphabetadossiers"></a>

````html
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Fires of Armageddon // Briefings, Ship Slider &amp; Sector Atlas</title>
  <link rel="icon" type="image/svg+xml" href="../assets/favicon.svg">
  <link rel="apple-touch-icon" href="../assets/favicon.svg">
  <link rel="stylesheet" href="../css/style.css">
  <link rel="stylesheet" href="../css/briefing.css">
</head>

<body class="necron-briefing-active">

  <!-- CAMPAIGN SUITE TOP NAVIGATION -->
  <nav class="suite-nav">
    <a href="../index.html" class="suite-link">📖 Field Codex &amp; Guide</a>
    <a href="spawner.html" class="suite-link">🧟 Mode 1: Horde Command &amp; Spawner</a>
    <a href="pvp.html" class="suite-link">⚔️ Mode 2: 1v1 Ash Wastes PvP</a>
    <a href="rogue.html" class="suite-link">🎲 Mode 3: Rogue Sector &amp; AI Tracker</a>
    <a href="roster.html" class="suite-link">🎖️ Mode 4: Hostile Matrix &amp; Nemeses</a>
    <a href="crusade.html" class="suite-link">🏆 Mode 5: Crusade Quartermaster</a>
    <a href="briefing.html" class="suite-link active">📜 Mode 6: Briefings, Ship &amp; Atlas</a>
    <a href="vox.html" class="suite-link">📡 Mode 7: Astropath Vox</a>
  </nav>

  <div class="app-shell briefing-shell">

    <!-- 4-TAB DOSSIER SWITCHER (DEFAULTS TO BETA PER UI BOUNDARY TESTS) -->
    <!-- COMMANDER CONDUIT SELECTOR GRID -->
    <div class="choice-grid conduit-selector" style="margin-top:8px; margin-bottom:14px; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr));">
      <div class="conduit-card choice-card" id="cardBriefAlpha" onclick="selectBriefingConduit('alpha')">
        <span class="conduit-tag" style="color:var(--gold); font-size:0.7rem; font-weight:800; text-transform:uppercase;">TERMINAL ALPHA // IMPERIUM COMMAND</span>
        <div class="conduit-title" style="font-weight:800; font-size:1.05rem; color:#fff; margin:4px 0 2px 0;">🦅 The Exile</div>
        <div class="conduit-sub" style="font-size:0.78rem; color:var(--muted);">The Sanctuary of Ash (044th Krieg — 1,200 Pts)</div>
      </div>
      <div class="conduit-card choice-card active" id="cardBriefBeta" onclick="selectBriefingConduit('beta')">
        <span class="conduit-tag" style="color:var(--green); font-size:0.7rem; font-weight:800; text-transform:uppercase;">TERMINAL BETA // TOMB-SHIP INTERLINK</span>
        <div class="conduit-title" style="font-weight:800; font-size:1.05rem; color:#fff; margin:4px 0 2px 0;">💀 Lord Commander Junebug</div>
        <div class="conduit-sub" style="font-size:0.78rem; color:var(--muted);">Tomb-Ship Oblivion's Edge (Necrons — 1,200 Pts)</div>
      </div>
      <div class="conduit-card choice-card" id="cardBriefGamma" onclick="selectBriefingConduit('gamma')">
        <span class="conduit-tag" style="color:var(--gold); font-size:0.7rem; font-weight:800; text-transform:uppercase;">SOLO BLACK-LEDGER CONDUIT // SITE #44-KHA</span>
        <div class="conduit-title" style="font-weight:800; font-size:1.05rem; color:#fff; margin:4px 0 2px 0;">⛏️ Kâhl Hârkyn Grîmledger</div>
        <div class="conduit-sub" style="font-size:0.78rem; color:var(--muted);">The Ledger of Embers (Leagues of Votann — 1,200 Pts)</div>
      </div>
    </div>

    <!-- 5-TAB DOSSIER SWITCHER (DEFAULTS TO BETA PER UI BOUNDARY TESTS) -->
    <div class="nav-pills" style="margin-top:8px; margin-bottom:20px;">
      <button id="btnAlpha" onclick="showDossier('alpha')">🦅 The Exile // Sanctuary of Ash &amp; Ship</button>
      <button id="btnBeta" class="active" onclick="showDossier('beta')">💀 Lord Commander Junebug Briefing</button>
      <button id="btnGamma" onclick="showDossier('gamma')">⛏️ Kâhl Hârkyn Grîmledger Briefing</button>
      <button id="btnAtlas" onclick="showDossier('atlas')">🗺️ Sector Atlas</button>
      <button id="btnRules" onclick="showDossier('rules')">⚡ Horde → Crusade Rules</button>
    </div>

    <!-- ================================================================= -->
    <!-- TAB 1: THE EXILE // SANCTUARY OF ASH (SHIP.MD SLIDER & DOSSIER)   -->
    <!-- ================================================================= -->
    <div id="dossierAlpha" class="hidden">

      <!-- CLEARANCE GATE ALPHA -->
      <div id="gateAlpha" class="hero-card" style="text-align:center; padding:36px 24px; border-color:rgba(245, 176, 65, 0.45);">
        <div class="status-pill" style="margin-bottom:12px;">Clearance Vermilion • The Exile // Sanctuary of Ash •
          Restricted Dataslate</div>
        <h2 class="hero-title" style="font-size:1.6rem;">The Sanctuary of Ash // Command &amp; Ship Slider</h2>
        <p class="hero-subtitle" style="max-width:520px; margin:8px auto 22px auto;">Private operational ledger for <strong>The Exile // Sanctuary of Ash</strong> (Deck 44 Penitentiary Holds, Ashen Spirit Mainframe &amp; Shipboard Control Slider). Unauthorized inspection by rival Warlords is prohibited.</p>
        <button class="launch-btn unlock-btn" style="max-width:340px; margin:0 auto;" onclick="unlockTab('Alpha')">🔓 Authenticate The Exile // Sanctuary of Ash</button>
      </div>

      <!-- UNLOCKED ALPHA CONTENT -->
      <div id="contentAlpha" class="hidden">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:10px;">
          <span style="font-family:monospace; font-size:0.76rem; color:var(--gold);">
            +++ ASHEN SPIRIT LOGIC CORE [MU-TH-UR 044] // OPERATOR: EXILE-044 // DECK 44 INTERLINK +++
          </span>
          <button class="btn-ghost btn-sm lock-toggle-btn" onclick="lockTab('Alpha')">🔒 Lock The Exile
            Dataslate</button>
        </div>

        <!-- HERO SHIP ORIGIN CARD -->
        <div class="hero-card" style="margin-bottom:20px;">
          <div class="status-pill">Arkurian-Pattern Orbital Siege &amp; Penitentiary Battle Barge • Alliance:
            Gatebreakers</div>
          <h1 class="hero-title" style="font-size:1.85rem; margin-top:8px;">The Sanctuary of Ash (044th Penitentiary
            Siege Column)</h1>
          <div class="lore-quote">
            "Once, a Sororitas pilgrim vessel named <em>Divine Providence</em> was defiled when heretics slaughtered its
            crew and used it to bombard holy worlds. After its recapture, the Sororitas decreed it too tainted to
            exist—until a Krieg regiment, condemned for a 'failure' they did not commit, claimed it as their floating
            purgatory. The Krieg spent decades reforging it into a hybrid prison-monastery, scrubbing its halls with
            acid and ash from their own cremated dead. They renamed it <em>The Sanctuary of Ash</em>: a bitter joke, for
            there is no sanctuary here, only endless war."
          </div>

          <div class="telemetry-grid">
            <div class="telemetry-box" style="border-top-color:var(--red);">
              <strong style="color:var(--red); display:block; margin-bottom:4px;">⚙️ Deck 44: The Lower Decks &amp; Bay
                04</strong>
              A gunmetal labyrinth of acid-scrubbed barracks, munitions presses, and corpse-starch vats operating at
              <strong>+14.8% caloric density</strong> via siphoned reactor power (<code>94.2% / 58.0 Hz</code>). In the
              unlit catwalks of <strong>Bay 04</strong>, mute crews hoist 140-kg Vanquisher Sabot shells and drill with
              ferro-steel spades against ballast-slag.
            </div>
            <div class="telemetry-box" style="border-top-color:var(--gold);">
              <strong style="color:var(--gold); display:block; margin-bottom:4px;">🩸 Brig Cell 09: The Bleeding
                Bulkhead</strong>
              Quartered in Cell 09, <strong>Commissar Dravik</strong> (vitals steady at <code>46 BPM</code>) monitors
              the North Bulkhead, where <strong>16.4% hemoglobin and iron-oxide condensation</strong> forms unindexed
              execution warrants in fresh blood—issuing covert <em>Brig Wall Warrants</em> before every planetfall.
            </div>
            <div class="telemetry-box" style="border-top-color:var(--purple);">
              <strong style="color:#d8b4fe; display:block; margin-bottom:4px;"> stained-glass Deck 01: The High Sanctum
                Spire</strong>
              Behind sealed blast-shutters in the stripped upper cathedral, two stationary Apex thermal
              signatures—<strong>Saint Celestine</strong> and <strong>Relic-Keeper Aestred Thurga</strong>—watch through
              fire-blackened stained glass, ready to unleash an orbital Purge Strike if Deck 44 slips into open mutiny.
            </div>
          </div>
        </div>

        <!-- READ-ONLY SHIP.MD BALANCE SLIDER (-3 TO +3) -->
        <div class="card" style="margin-bottom:20px; border-left:4px solid var(--gold);">
          <div class="section-header" style="margin-top:0;">
            <h3>SHIP.md // Shipboard Tug-of-War Gauge (-3 to +3)</h3>
            <span class="hud-sub" id="shipSliderLabel">Current State: -1 (Lower Decks Ascendant — Tier I: Ash-Hold Surge)</span>
          </div>
          <p class="card-desc" style="margin-bottom:14px;">
            Read-only hull telemetry tracking the internal struggle between <strong>Deck 44 (The Lower Decks &amp; Cell
              09 Warrants)</strong> and <strong>Deck 01 (The High Sanctum Wardens)</strong>. Optimal Operational Thresholds are <strong>-1</strong> and <strong>+1</strong> (Unlocking the Phase-End Shipboard Cache: +1 RP or +100 pts Supply Limit). Pushing into <strong>±2</strong> or
            <strong>±3</strong> triggers oppressive shipboard quicksand!
          </p>

          <div class="slider-track" aria-label="Current Shipboard Balance Gauge (Read-Only)">
            <div id="node-3" class="slider-node"><span class="val">-3</span><span class="lbl">Brig Abyss</span></div>
            <div id="node-2" class="slider-node"><span class="val">-2</span><span class="lbl">Quicksand</span></div>
            <div id="node-1" class="slider-node active-brig"><span class="val">-1</span><span class="lbl">Lower Decks</span>
              <span class="sweet-spot-tag">ACTIVE • Tier I Surge</span></div>
            <div id="node0" class="slider-node"><span class="val">0</span><span class="lbl">Balanced</span></div>
            <div id="node1" class="slider-node"><span class="val">+1</span><span class="lbl">High Sanctum</span>
              <span class="sweet-spot-tag">Tier I Threshold</span></div>
            <div id="node2" class="slider-node"><span class="val">+2</span><span class="lbl">Quicksand</span></div>
            <div id="node3" class="slider-node"><span class="val">+3</span><span class="lbl">Tyranny</span></div>
          </div>

          <div id="sliderDetailBox" class="card" style="background:#0b0d13; margin-bottom:12px;"></div>

          <details>
            <summary style="cursor:pointer; font-weight:700; color:var(--gold);">7-Level Dynamic Phase Reckoning Table
              (If Unseen 3rd Force Wins Phase)</summary>
            <div class="drawer-body" style="font-size:0.88rem; line-height:1.55; margin-top:10px;">
              <p>If the Campaign Master's <strong>3rd Force (Horde AI)</strong> wins a Campaign Phase (or wipes out your
                strike force in a Phase Finale), the ship suffers a reckoning based on your current Slider Level (used
                as a severity baseline and dynamically tailored by the Campaign Master to that phase's events):</p>
              <table class="reckoning-table">
                <thead>
                  <tr>
                    <th style="width:95px;">Slider</th>
                    <th style="width:165px;">Reckoning</th>
                    <th>Baseline Mechanical &amp; Narrative Punishment</th>
                  </tr>
                </thead>
                <tbody>
                  <tr id="reckRow-3"><td><strong>-3 Abyss</strong></td><td><strong>"The Red Deck Purge &amp; Hull Breach"</strong></td><td><strong>1.</strong> Lose <strong>1 RP</strong> (or -100 pts Supply Limit). <strong>2.</strong> Both <strong>Dravik's Cull</strong> (1 random Krieg squad starts at Half-Strength) AND <strong>Saint Celestine's Purge Strike</strong> trigger in Battle 1 of next Phase! <strong>3.</strong> One Vehicle takes an automatic <strong>Battle Scar</strong> (<em>"Sabotaged by Mutineers"</em>).</td></tr>
                  <tr id="reckRow-2"><td><strong>-2 Quicksand</strong></td><td><strong>"The Corpse-Vat Famine"</strong></td><td><strong>1.</strong> Start Battle 1 of next Phase with <strong>0 CP</strong>. <strong>2.</strong> All <strong>Battleline Infantry</strong> suffer <strong>-1 Leadership and -1 OC</strong> next battle. <strong>3.</strong> Slider is dragged <strong>1 step deeper into -3</strong> unless you sacrifice <strong>3 XP</strong> from a Character!</td></tr>
                  <tr id="reckRow-1" class="highlight-row"><td><strong style="color:var(--green);">-1 Tier I Surge</strong></td><td><strong>"Dravik's Scapegoat Execution"</strong></td><td><strong>Zero RP or CP loss!</strong> Dravik contains the fallout by executing a scapegoat junior officer: <strong>1 unit on your Order of Battle loses D3 XP</strong>, and the slider resets to 0.</td></tr>
                  <tr id="reckRow0"><td><strong>0 Balanced</strong></td><td><strong>"Deadlocked Command Blame-Game"</strong></td><td>Both orbital support grids go offline: in Battle 1 of next Phase, your <strong>Hard Mode SP Cap drops from 8 SP/round to 6 SP/round</strong> (or -1 CP in 1v1), AND you cannot buy <code>Strike</code> Resupplies that battle!</td></tr>
                  <tr id="reckRow1"><td><strong style="color:var(--green);">+1 Tier I Sanctum</strong></td><td><strong>"The Penitent Lash"</strong></td><td><strong>Zero RP or Battle Scar penalties!</strong> Aestred Thurga shields the ship in exchange for a vow of fasting: start Battle 1 of next Phase with <strong>-2 SP</strong> (first 2 SP earned pay off the tithe), and slider resets to 0.</td></tr>
                  <tr id="reckRow2"><td><strong>+2 Quicksand</strong></td><td><strong>"The Flagellant's Crusade"</strong></td><td><strong>1.</strong> One Krieg Infantry squad is converted into <strong>Penitent Flagellants</strong> next battle (cannot perform Actions or Fall Back; must declare a Charge if able). <strong>2.</strong> Lose <strong>1 RP</strong> (or 1 unit takes a Battle Scar). <strong>3.</strong> Slider is dragged <strong>1 step deeper into +3 Tyranny</strong>!</td></tr>
                  <tr id="reckRow3"><td><strong>+3 Tyranny</strong></td><td><strong>"Decimation of the Condemned"</strong></td><td><strong>1.</strong> <strong>The Exile</strong> <em>automatically</em> suffers a permanent <strong>Battle Scar</strong> (no save!). <strong>2.</strong> <strong>Every unit on your Order of Battle loses 1 XP</strong>. <strong>3.</strong> Cannot spend CP on Stratagems during Rounds 1 &amp; 2 of next battle!</td></tr>
                </tbody>
              </table>
            </div>
          </details>
        </div>

        <!-- ALPHA DRAMATIS PERSONAE & ACTIVE CRUSADE RULES -->
        <div class="card" style="margin-bottom:20px; border-left:4px solid var(--red);">
          <div class="section-header" style="margin-top:0;">
            <h3 style="color:var(--gold);">044th Penitentiary Command Echelon &amp; Regiment Rules</h3>
            <span class="hud-sub">1,820 / 1,900 Pts • 0 RP • +1 Crusade Pt (Dreir)</span>
          </div>
          <ul style="font-size:0.9rem; line-height:1.62;">
            <li style="margin-bottom:10px;">
              <strong>🎖️ Warlord: The Exile — Rogal Dorn Tank Commander (<em>"Mercy's Delay"</em> • 265 pts |
                Enhancement: <em>Calm Under Fire</em>):</strong>
              Once a decorated Cadian Shock Officer who survived the Fall of Cadia and walked out of seven slaughtered
              perimeters where every Cadian under his command died in the mud. Expunged of his Cadian birth-name by the
              Departmento Munitorum and transferred to the Death Korps as a living indictment, he commands <em>"Mercy's
                Delay"</em>—a salvaged Rogal Dorn retrofitted with Krieg siege dozer blades and Sororitas purity seals
              that blister his skin on contact.
              <br><span style="color:var(--gold);"><strong>Special Campaign Rule (<em>The Exile's Curse — "Mercy Delayed
                    Again"</em>):</strong></span> Whenever <em>The Exile</em> survives a Horde Mode Round 6 Final Stand
              while 3+ friendly Krieg units were destroyed, he gains <strong>+1 bonus XP</strong>, and one destroyed
              Krieg Battleline unit that failed its Out of Action test may replace its Battle Scar with
              <strong>"Absolved in Ash"</strong> (<em>Feel No Pain 6+</em> within 6" of <em>The Exile</em>).
            </li>
            <li style="margin-bottom:10px;">
              <strong>⚔️ Mighty Champion: Lord Marshal Dreir (100 pts | <em>Inspirational Champion</em> [+1 Crusade
                Pt]):</strong>
              The unyielding cavalry spearhead of the penitentiary column. While leading a Bodyguard unit (<em>Death
                Riders</em>), ignore any and all Battle Scars on that Bodyguard unit, AND at the end of every battle in
              which he is fielded, select <strong>one additional unit</strong> to be <em>Marked for Greatness (+3
                XP)</em>!
            </li>
            <li style="margin-bottom:10px;">
              <strong>💥 2x Leman Russ Vanquishers (Official Munitorum Manifest: <em>Serial Hulls #44-V1 &amp;
                  #44-V2</em> // Sub-Deck Whisper: <em>"The Shrine-Breakers"</em> • 145 pts each):</strong>
              Speaking their true nickname aloud on the upper decks is a flogging offense, and High Command's orbital
              auditors know them strictly as <code>Hulls #44-V1 and #44-V2</code>. Yet down in Deck 44, every masked
              trooper taps his shovel-blade twice against his helmet when their long-barreled Vanquisher cannons rumble
              past—honoring the Session 0 crucible where they blew every single stained-glass Sororitas war-engine
              sky-high.
              <br><span style="color:var(--gold);"><strong>Session 0 Legacy Perk:</strong></span> The first time either
              of <em>The Shrine-Breakers</em> reaches the <strong>Blooded</strong> rank (6 XP), it may re-roll its
              <strong>Weapon Modification</strong> or <strong>Battle Trait</strong> roll for free!
            </li>
            <li style="margin-bottom:10px;">
              <strong>💀 The Unseen Jury — Krieg Command Squad (65 pts | <em>Stalwart's Honours</em>):</strong>
              Enforces the ship's will through sanctioned purges, leaving spent shell casings in neat rows at execution
              sites like beads on a rosary.
            </li>
            <li style="margin-bottom:10px;">
              <strong>🔫 Dravik, The Silent Judge — Commissar (30 pts):</strong>
              Never raises his voice; executes with a single shot to the back of the skull and moves on without comment,
              quietly purging any Krieger who displays reckless zeal for <em>"wasting the Emperor's currency."</em> Cut
              down in Session 0, only to reappear in Brig Cell 09 the next morning as if nothing had happened.
            </li>
            <li><strong>📜 Munitorum Field Regulation 884-Alpha &amp; Faith and Duty:</strong> Eligible for full <strong>Astra Militarum Tours of Duty</strong> (`D6+4` Battles, `D3+2` Victories, 4 Munitorum Logistics Points, and Personal/Regimental Commendations in <a href="crusade.html" style="color:var(--gold);">Mode 5: Crusade Quartermaster</a>). When Underdog in 1v1, <strong>Faith and Duty</strong> grants <strong>+1 OC</strong> to non-Battle-shocked models on a selected objective marker.</li>
          </ul>
        </div>

        <!-- SESSION 0 PROLOGUE CHRONICLE ARCHIVE -->
        <div class="card" style="margin-bottom:20px; border-left:4px solid var(--green);">
          <div class="section-header" style="margin-top:0;">
            <h3 style="color:var(--green);">📖 Campaign Chronicle Archive // Session 0 Prologue</h3>
            <span class="hud-sub">Sector Node 0: The Golgotha Arbor-Basin • Razor-Thin Audit (-3 VP)</span>
          </div>
          <p class="card-desc" style="margin-bottom:12px;">
            Before the High Sanctum wardens permitted the 044th Penitentiary Regiment to make full planetfall onto
            Armageddon, Relic-Keeper <strong>Aestred Thurga</strong>, Hagiolater <strong>Agathae Dolan</strong>, and a
            manifestation of <strong>Saint Celestine</strong> subjected the column to a live-fire trial of purity
            beneath the petrified canopy of the Golgotha Arbor-Basin:
          </p>
          <div class="chronicle-pillar">
            <strong style="color:var(--gold);">1. The Left Flank Heresy (<em>"You Defy the Light?!"</em>):</strong>
            When Aestred Thurga cut down a forward Scout Sentinel with <em>Devastating Wounds</em> and bellowed <em>"You
              defy the light?!"</em>, the advancing Kriegers coldly replied that they had indeed bombarded a holy world.
            Though all 11 of their trench-shovel strikes glanced off Sororitas power armor, their unyielding <em>Duty
              and Honour!</em> discipline (<strong>8 OC vs. 1 OC</strong>) stole the bunker objective right out from
            under the sacred banner!
          </div>
          <div class="chronicle-pillar">
            <strong style="color:var(--gold);">2. The Center Crucible &amp; Rise of <em>"The
                Shrine-Breakers"</em>:</strong>
            The super-heavy <strong>Stormlord (460 pts)</strong> rumbled directly onto the central Landing Site,
            disgorging <strong>40 Death Korps troopers</strong> into a point-blank war of attrition. As stained-glass
            Exorcists and Penitent Engines closed in to purge the infantry, the two <strong>Leman Russ Vanquishers
              (#44-V1 &amp; #44-V2)</strong> calmly locked onto the gilded reliquaries and blew every single Sororitas
            war-machine sky-high in chain-reaction fireballs.
          </div>
          <div class="chronicle-pillar" style="margin-bottom:0;">
            <strong style="color:var(--red);">3. The Wrath of the Ashen Seraph &amp; The -1 Shift:</strong>
            With her armored support reduced to burning slag, <strong>Saint Celestine</strong> descended from the
            sulfuric ash-clouds into the Krieg rear deployment zone—slaughtering the command echelon (<em>The Exile,
              Dreir, The Unseen Jury,</em> and <em>Dravik</em>) and seizing the home objective to win the audit by a
            mere 3 VP. Yet The Exile was dragged alive from the smoking hull of <em>"Mercy's Delay"</em> once again, and
            the Vanquishers' open defiance of the Ecclesiarchy's war-engines tilted the shipboard balance to <strong>-1
              (Lower Decks Ascendant — Tier I: Ash-Hold Surge)</strong>!
          </div>
        </div>
      </div>
    </div>

    <!-- ================================================================= -->
    <!-- TAB 2: LORD COMMANDER JUNEBUG (DEFAULT VISIBLE TAB — NECRONS)     -->
    <!-- ================================================================= -->
    <div id="dossierBeta">

      <!-- CLEARANCE GATE BETA -->
      <div id="gateBeta" class="hero-card" style="text-align:center; padding:36px 24px; border-color:rgba(16, 185, 129, 0.45);">
        <div class="status-pill" style="margin-bottom:8px;">Royal Engram Seal • Lord Commander Junebug • Restricted
          Tomb-Ship Dataslate</div>
        <div class="necron-ankh-divider" aria-hidden="true"><span></span>❖ ☥ ❖<span></span></div>
        <h2 class="hero-title" style="font-size:1.6rem;">Tomb-Ship Autonomous Master Matrix &amp; Intercepted Vox</h2>
        <p class="hero-subtitle" style="max-width:540px; margin:8px auto 22px auto;">Phase-masked command interlink for <strong>Lord Commander Junebug</strong> (Tomb-Ship Stasis-Wake Sequence, Tesseract Core Equilibrium Gauge &amp; Intercepted Zenith-09 Carrier Wave).</p>
        <button class="launch-btn unlock-btn" style="max-width:340px; margin:0 auto;" onclick="unlockTab('Beta')">🔓 Authenticate Royal Engram Imprint</button>
      </div>

      <!-- UNLOCKED BETA CONTENT -->
      <div id="contentBeta" class="hidden">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:10px;">
          <span style="font-family:monospace; font-size:0.76rem; color:var(--green);">
            +++ TOMB-SHIP AUTONOMOUS MASTER MATRIX // PHASE-MASKED ORBITAL DRIFT // PHAERON: LORD COMMANDER JUNEBUG +++
          </span>
          <button class="btn-ghost btn-sm lock-toggle-btn" onclick="lockTab('Beta')">🔒 Lock Lord Commander Junebug
            Dataslate</button>
        </div>

        <!-- PART 1: TOMB-SHIP MASTER MATRIX WAKE SEQUENCE -->
        <div class="hero-card" style="margin-bottom:20px; border-color:rgba(16, 185, 129, 0.4);">
          <div class="status-pill">Tomb-Ship Autonomous Master Matrix // Stasis-Wake Sequence • Orbital Anchor: Sector
            Node 0</div>
          <div class="necron-ankh-divider" aria-hidden="true"><span></span>❖ ☥ ❖<span></span></div>
          <h1 class="hero-title" style="font-size:1.85rem; margin-top:4px;">Awakening of the Undying Dynasty</h1>

          <div class="lore-quote" style="text-align:left; line-height:1.65;">
            <p style="margin:0 0 10px 0; font-family:monospace; font-size:0.82rem; color:var(--green);"><strong>+++ TOMB-SHIP MASTER MATRIX // SUB-CRUSTAL AUGUR &amp; TRANSLOCATION TELEMETRY +++</strong></p>
            <p style="margin-bottom:10px;">
              <em>"Royal engram imprint recognized. Welcome back to the command throne, Phaeron. Since the primitives'
                prologue artillery cracked the tectonic seal beneath the Golgotha Arbor-Basin, our Tomb-Ship has risen
                openly into low equatorial orbit above the clearing—driving the battered Sisterhood vanguard into the
                upper thermosphere while our Quantum Shields drink the feeble targeting sweeps of the human station at
                <strong>Geostationary Zenith-09</strong>.</em>
            </p>
            <p style="margin-bottom:10px;">
              <em>Down in the southern iron-oxide flats (<code>REF-ID: c44c6f23</code>), our outer hypercrypt vanguard
                has already annihilated Commissar Yarrick's armored column, unsealed the buried tomb-vaults, and
                unleashed the <strong>C'tan Shard of the Void Dragon</strong> (<code>nem3</code>). You hold the dominant
                foothold in <strong>Sector Node 0 (2 / 8 HP)</strong>, and our ventral <strong>Tesseract Core</strong> is
                currently running at <strong>-1 (Crimson Harvest Ascendant — Tier I: Tesseract Overclock)</strong>,
                bleeding raw star-god plasma into our translocation portals while the <strong>Cryptek Conclave</strong>
                and <strong>Triarch Auditors</strong> clamor for engrammatic restraint.</em>
            </p>
            <p style="margin:0;">
              <em>Yet our primary stasis-crypts, <strong>3 Tomb World Awakening Points</strong> (<code>Command</code>,
                <code>Reanimation</code>, and <code>Translocation</code> Systems in <a href="crusade.html" style="color:var(--green);">Mode 5: Crusade Quartermaster</a>), and Dynasty designation await your
                royal decree. Before you issue the translocation order, be advised: <strong>Logis-Prefect Vane</strong>
                aboard Zenith-09 has correlated our Tomb-Ship's arrival with the southern massacre. Knowing his defense
                lasers cannot pierce our Quantum Shielding—and fearing the empyric cancer of the Red Angel's Gate more
                than our living metal—the human auditor has transmitted a formal open-frequency parley to our bridge.
                Playing his broadcast below: should you ever deign to address the human station in <a href="vox.html" style="color:var(--gold);">Mode 7: Astropath Vox</a>, simply include <strong>'Vane'</strong> or
                <strong>'Zenith-09'</strong> in your transmission; otherwise, I and the Cryptek Conclave will answer all
                your commands directly."</em>
            </p>
          </div>

          <!-- ORBITAL TELEMETRY & AWAKENING ADVANTAGE -->
          <div class="telemetry-grid">
            <div class="telemetry-box" style="border-top-color:var(--green);">
              <strong style="color:var(--green); display:block; margin-bottom:4px;">🛰️ Sector Node 0 Hegemony Lead (2 /
                8 HP) &amp; Marauders +1 SPt</strong>
              You hold the leading foothold in <strong>Sector Node 0 (The Golgotha Arbor-Basin)</strong> at <strong>2 /
                8 HP</strong>, and the southern tomb-vault awakening (<code>REF-ID: c44c6f23</code>) has already locked
              in the <strong>Gravitic Nexus / Staggered Time</strong> Hellscapes for the next main battle!
            </div>
            <div class="telemetry-box" style="border-top-color:var(--gold);">
              <strong style="color:var(--gold); display:block; margin-bottom:4px;">🐉 Roaming Star-God &amp; Orbiting
                Auditors</strong>
              The <strong>C'tan Shard of the Void Dragon (<code>nem3</code>)</strong> prowls the southern wastes
              (ready to breach if your Tomb-Ship Index hits <code>-3</code>!), while the Prologue Sisterhood
              champions—<strong>Saint Celestine (<code>nem1</code>)</strong> and <strong>Aestred Thurga
                (<code>nem2</code>)</strong>—orbit above as autonomous Inquisitorial Auditors in <a href="roster.html" style="color:var(--gold);">Mode 4: Nemesis Archive</a>.
            </div>
            <div class="telemetry-box" style="border-top-color:var(--purple);">
              <strong style="color:#d8b4fe; display:block; margin-bottom:4px;">📡 Mirror-Image Tomb-Ship Terminal &amp;
                Psychic Bleed</strong>
              In <a href="vox.html" style="color:#d8b4fe;">Mode 7: Astropath Vox</a>, your default channel speaker is
              your <strong>Tomb-Ship Autonomous Master Matrix &amp; Cryptek Conclave</strong> (firing Sub-Crustal
              Quantum-Resonance Probes and inscribing Dynastic Epithets). Address <strong>"Vane"</strong> or
              <strong>"Zenith-09"</strong> anytime you wish to hail the human orbital auditor!
            </div>
          </div>
        </div>

        <!-- READ-ONLY SHIP.MD PART 2: TOMB-SHIP ENGRAM & TESSERACT EQUILIBRIUM GAUGE (-3 TO +3) -->
        <div class="card" style="margin-bottom:20px; border-left:4px solid var(--green);">
          <div class="section-header" style="margin-top:0;">
            <h3>SHIP.md Part 2 // Tomb-Ship Engram &amp; Tesseract Equilibrium (-3 to +3)</h3>
            <span class="hud-sub" id="betaShipSliderLabel">Current State: -1 (Crimson Harvest Ascendant — Tier I:
              Tesseract Overclock)</span>
          </div>
          <p class="card-desc" style="margin-bottom:14px;">
            Read-only Tomb-Ship telemetry tracking the internal struggle between <strong>🔻 The Crimson Harvest
              (Tesseract Reactor Core, Destroyer Cults &amp; Flayer Virus: -1 to -3)</strong> and <strong>🔺 The Triarch
              &amp; Cryptek Conclave (Engrammatic Orthodoxy: +1 to +3)</strong>. Positions <strong>-1</strong> and
            <strong>+1</strong> are the <strong>Optimal Operational Thresholds</strong> (unlocking the <strong>Phase-End
              Tomb-Vault Cache: +1 RP or +100 pts Supply</strong>); pushing into <strong>±2</strong> or
            <strong>±3</strong> triggers catastrophic Tomb-Ship extremes!
          </p>

          <div class="slider-track" aria-label="Commander Beta Tomb-Ship Equilibrium Gauge (Read-Only)">
            <div id="betaNode-3" class="slider-node"><span class="val">-3</span><span class="lbl">Core Breach</span></div>
            <div id="betaNode-2" class="slider-node"><span class="val">-2</span><span class="lbl">Tier II Leak</span></div>
            <div id="betaNode-1" class="slider-node active-brig"><span class="val">-1</span><span class="lbl">Crimson Harvest</span>
              <span class="sweet-spot-tag">ACTIVE • Tier I</span></div>
            <div id="betaNode0" class="slider-node"><span class="val">0</span><span class="lbl">Cold Stasis</span></div>
            <div id="betaNode1" class="slider-node"><span class="val">+1</span><span class="lbl">Cryptek Conclave</span>
              <span class="sweet-spot-tag">Tier I Optimal</span></div>
            <div id="betaNode2" class="slider-node"><span class="val">+2</span><span class="lbl">Silent Leash</span></div>
            <div id="betaNode3" class="slider-node"><span class="val">+3</span><span class="lbl">Mind-Scrub</span></div>
          </div>

          <div id="betaSliderDetailBox" class="card" style="background:#0b0d13; margin-bottom:12px;">
            <div style="font-weight:800; color:var(--green); margin-bottom:6px;">-1 // Crimson Harvest Ascendant (★ TIER
              I: TESSERACT OVERCLOCK ★)</div>
            <div style="font-size:0.88rem; line-height:1.55;">
              <strong>Active Tier I Buff (Sub-Routine Alpha):</strong> Bleeding raw star-god plasma from the Tesseract
              Core into the translocation portals grants all friendly <strong>NECRONS</strong> units <strong>re-roll Hit
                rolls of 1 in melee</strong> when Below Starting Strength (or <strong>+1" to Charge rolls</strong>
              within 6" of your Warlord) and reduces the SP cost of your first <em>Reinforcements / Strike</em> Resupply
              purchase in Horde Mode by <strong>1 SP</strong>.<br>
              <strong>Phase-End Tomb-Vault Cache (Sub-Routine Beta):</strong> Winning/surviving the Phase at
              <code>-1</code> or <code>+1</code> unlocks the <strong>Phase-End Tomb-Vault Cache (+1 bonus RP or +100 pts
                Supply Limit)</strong>!
            </div>
          </div>

          <details>
            <summary style="cursor:pointer; font-weight:700; color:var(--green);">Tomb-Ship 7-State Breakdown &amp;
              Phase Reckoning Table (If 3rd Force Wins Phase)</summary>
            <div class="drawer-body" style="font-size:0.88rem; line-height:1.55; margin-top:10px;">
              <p>Before each battle, your Tomb-Ship Master Matrix issues two conflicting directives: a <strong>🔻
                  Tesseract Core / Destroyer Imperative (shifts -1)</strong> and a <strong>🔺 Triarch / Cryptek Conclave
                  Decree (shifts +1)</strong>. If the <strong>3rd Force (Horde AI)</strong> wins a Campaign Phase, your
                Tomb-Ship suffers the reckoning matching your current Equilibrium Index:</p>
              <table class="reckoning-table">
                <thead>
                  <tr>
                    <th style="width:105px;">Index</th>
                    <th style="width:185px;">State &amp; Reckoning</th>
                    <th>Active State Rules &amp; Phase Reckoning Consequence</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td><strong>-3 Core Breach</strong></td><td><strong>"Tesseract Core Rupture &amp; Flayer Outbreak"</strong></td><td><strong>At -3:</strong> Phase-End Cache burned (<strong>0 RP</strong>); 1 random Necron Infantry squad starts at Half-Strength &amp; Battle-shocked (Round 1) under <code>#35 Experimental Ammunition</code>; AND <strong>C'tan Shard of the Void Dragon (<code>nem3</code>) / Iash'uddra</strong> deploys against you as a hostile PL 4 Boss!<br><strong>Phase Reckoning:</strong> Lose <strong>1 RP</strong> (or -100 pts Supply), trigger Flayer Toll + Hostile C'tan Strike next battle, and 1 Vehicle/Canoptek takes a <strong>Battle Scar</strong>.</td></tr>
                  <tr><td><strong>-2 Tier II Leak</strong></td><td><strong>"Sub-Crypt Power Starvation"</strong></td><td><strong>At -2:</strong> Nobles/Destroyers/Flayed Ones gain <strong>[SUSTAINED HITS 1]</strong> in melee, BUT Crypteks lock out all <code>Fortify</code> Resupplies (except War Trenches) and Vehicle/Mounted guns gain <strong>[HAZARDOUS]</strong> within 18"!<br><strong>Phase Reckoning:</strong> Start Battle 1 of next Phase with <strong>0 CP</strong>, Battleline suffer <strong>-1 Ld &amp; -1 OC</strong>, and index shifts to <code>-3</code> unless a Character sacrifices <strong>3 XP</strong>.</td></tr>
                  <tr class="highlight-row"><td><strong style="color:var(--green);">-1 Tier I Optimal</strong></td><td><strong>"Cryptek Scapegoat Mind-Wipe"</strong></td><td><strong>At -1 [ACTIVE]:</strong> Friendly Necrons re-roll 1s to Hit in melee when Below Starting Strength (+1" Charge within 6" of Warlord), -1 SP on first <em>Reinforcements/Strike</em>, and Phase-End Cache armed.<br><strong>Phase Reckoning:</strong> <strong>Zero RP or CP loss!</strong> 1 unit loses <strong>D3 XP</strong> (subordinate engrams purged), and index resets to 0.</td></tr>
                  <tr><td><strong>0 Cold Stasis</strong></td><td><strong>"Conclave Calculation Deadlock"</strong></td><td><strong>At 0:</strong> +1 starting SP in Horde Mode (or 1 free Anomaly/Spawn re-roll in 1v1), but <strong>Phase-End Tomb-Vault Cache is locked (0 RP)</strong>.<br><strong>Phase Reckoning:</strong> Hard Mode SP Cap drops from <strong>8 SP/round to 6 SP/round</strong> (or -1 CP in 1v1) and no <code>Strike</code> Resupplies in Battle 1 of next Phase.</td></tr>
                  <tr><td><strong style="color:var(--green);">+1 Tier I Optimal</strong></td><td><strong>"The Triarch Tithe"</strong></td><td><strong>At +1:</strong> Warlord's unit re-rolls 1s to Hit (+1 wound on first Reanimation), -1 SP on first <em>Strike/Fortify</em>, and Phase-End Cache armed.<br><strong>Phase Reckoning:</strong> <strong>Zero RP or Battle Scar penalties!</strong> Start Battle 1 of next Phase with <strong>-2 SP</strong> (first 2 SP earned pay off the Conclave's energy tithe), and index resets to 0.</td></tr>
                  <tr><td><strong>+2 Silent Leash</strong></td><td><strong>"Thrall-Protocol Override"</strong></td><td><strong>At +2:</strong> Triarch Honour Lock blocks all <strong>Traitor Secret Objectives</strong>, forbids <em>Emergency Evac (5 SP)</em>, and inflicts <strong>D3 Mortal Wounds</strong> on any friendly unit that Falls Back!<br><strong>Phase Reckoning:</strong> 1 Necron Infantry squad is locked into <strong>Mindless Thrall-Mode</strong> next battle (cannot perform Actions or Fall Back; must Charge if able), lose <strong>1 RP</strong>, and shift to <code>+3</code>.</td></tr>
                  <tr><td><strong>+3 Mind-Scrub</strong></td><td><strong>"Total Dynastic Mind-Scrub"</strong></td><td><strong>At +3:</strong> 1/battle change a Reanimation roll to 3, BUT the Conclave confiscates your Phase-End Cache (<strong>0 RP</strong>) and your Warlord must pass a Leadership test (-1) after every battle or take <em>Engrammatic Degradation</em>!<br><strong>Phase Reckoning:</strong> Warlord takes an automatic <strong>Battle Scar</strong>, every unit on your Order of Battle loses <strong>1 XP</strong>, and no Stratagems in Rounds 1–2 next battle!</td></tr>
                </tbody>
              </table>
            </div>
          </details>
        </div>

        <!-- PART 2: INTERCEPTED DISPATCH FROM LOGIS-PREFECT VANE & THE THREE BANNERS -->
        <div class="card" style="margin-bottom:20px; border-left:4px solid var(--gold);">
          <div class="section-header" style="margin-top:0;">
            <h2 style="margin:0; font-size:1.22rem; color:var(--gold);">📜 Open-Frequency Orbital Parley
              (Geostationary Zenith-09)</h2>
            <span class="hud-sub">Auditor: Logis-Prefect Vane • Ordo Xenos / Tactica Logis Cold Parley</span>
          </div>

          <div class="lore-quote" style="text-align:left; line-height:1.62; margin-bottom:16px;">
            <p style="margin-bottom:10px;">
              <em>"My seismographs have already matched your Tomb-Ship's gravitic wake to the Hypercrypt phalanx and
                Star-God shard that butchered Commissar Yarrick's column across the southern iron-oxide flats, Xenos.
                Zenith-09 is not powering its defense lasers—first, because firing upon a Quantum-Shielded Necron
                capital hull is an exercise in wasted promethium, and second, because in the cold arithmetic of this
                theatre, the empyric cancer bleeding from the <strong>Red Angel's Gate</strong> threatens your ancient
                vaults and my orbital ledger alike.</em>
            </p>
            <p style="margin:0;">
              <em>Consider this a formal Ordo Xenos and Tactica Logis parley, Regent of the Tomb. Two kilometers north
                of your clearing, a Death Korps penitentiary siege-barge calling itself <strong>The Sanctuary of
                  Ash</strong> is already cycling its drop-locks with heavy anti-titan ordnance aimed squarely at your
                <strong>Sector Node 0 (2 / 8 HP)</strong> foothold. Three great movements now vie for Armageddon's
                ashes—and your human rival's banner remains sealed under encrypted cipher until your own court declares
                its intent."</em>
            </p>
          </div>

          <div class="choice-grid" style="grid-template-columns:repeat(auto-fit, minmax(210px, 1fr));">
            <div class="card" style="border-top:3px solid var(--gold); margin:0;">
              <div class="choice-title">🛡️ The Gatebreakers</div>
              <p class="card-desc" style="font-size:0.84rem; margin-top:6px;">Wardens of the Threshold. Sworn to enforce blackstone containment across the Imperator Line, purge the tainted hive cities, and seal the empyric breach of the Red Angel’s Gate.</p>
            </div>
            <div class="card" style="border-top:3px solid var(--red); margin:0;">
              <div class="choice-title">💀 The Desecrators</div>
              <p class="card-desc" style="font-size:0.84rem; margin-top:6px;">Harvesters of Annihilation. Those who look upon a burning world and seek total eradication—reaping organic life, shattering the defenders of order, and harvesting the rift's raw energy.</p>
            </div>
            <div class="card" style="border-top:3px solid var(--purple); margin:0;">
              <div class="choice-title">⚔️ The Marauders</div>
              <p class="card-desc" style="font-size:0.84rem; margin-top:6px;">Lords of the Forgotten Vaults. Dynastic reclaimers and xenos warhosts who strike from hyperphase corridors to plunder <strong>Antiquity Relics</strong> (ignoring rank restrictions on Phase 1 victory!), decapitate enemy warlords, and reclaim their ancient empire.</p>
            </div>
          </div>
        </div>

        <!-- PART 3: TOMB-SHIP MUSTER & DYNASTIC REGISTRATION PROTOCOL -->
        <div class="card" style="margin-bottom:20px; border-left:4px solid var(--green);">
          <div class="section-header" style="margin-top:0;">
            <h2 style="margin:0; font-size:1.22rem; color:var(--green);">📡 Phase 1 Tomb-Ship Muster &amp; Dynastic
              Registration Protocol</h2>
            <span class="hud-sub">Awaiting Royal Decree on Terminal Beta</span>
          </div>
          <p class="card-desc" style="margin-bottom:12px;">
            Step onto your command throne in <a href="vox.html" style="color:var(--green); font-weight:700;">📡 Mode 7:
              Astropath Vox (Lord Commander Junebug Conduit)</a> and issue your opening royal decree to your
            <strong>Tomb-Ship Autonomous Master Matrix</strong> (or include <strong>"Vane"</strong> to uncloak and hail
            Zenith-09 directly) with:
          </p>
          <div class="choice-grid" style="grid-template-columns:repeat(auto-fit, minmax(210px, 1fr)); margin-bottom:4px;">
            <div class="card" style="background:#090b10; margin:0; padding:12px;">
              <strong style="color:var(--green); font-size:0.88rem;">1. Dynasty &amp; Detachment</strong>
              <p class="card-desc" style="font-size:0.8rem; margin-top:4px;">
                Your <strong>11th Ed Necrons Crusade Rules &amp; Tomb World Awakening Console</strong> (Command,
                Reanimation &amp; Translocation Systems) are already welded into <a href="crusade.html" style="color:var(--green);">Mode 5: Crusade Quartermaster</a>! Declare your Dynasty name and starting
                Detachment.
              </p>
            </div>
            <div class="card" style="background:#090b10; margin:0; padding:12px;">
              <strong style="color:var(--blue); font-size:0.88rem;">2. Tomb-Ship &amp; Phaeron Lore</strong>
              <p class="card-desc" style="font-size:0.8rem; margin-top:4px;">Christen your Tomb-Ship (or reclaim the <em>Oblivion's Edge</em>), name your Phaeron/Overlord and Cryptek court, and declare any <strong>Epic Hero</strong> you wish bestowed with a <strong>Mighty Champion</strong> ability!</p>
            </div>
            <div class="card" style="background:#090b10; margin:0; padding:12px;">
              <strong style="color:var(--gold); font-size:0.88rem;">3. Pledged Alliance Banner</strong>
              <p class="card-desc" style="font-size:0.8rem; margin-top:4px;">Claim your banner among the three Alliances above (<strong>Gatebreakers</strong>, <strong>Desecrators</strong>, or <strong>Marauders</strong>—note that <strong>Marauders</strong> already holds <strong>1 SPt</strong> from the Southern Tomb-Vault awakening!).</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ================================================================= -->
    <!-- TAB 3: LEAGUES OF VOTANN // THE LEDGER OF EMBERS (DOSSIER GAMMA)    -->
    <!-- ================================================================= -->
````
