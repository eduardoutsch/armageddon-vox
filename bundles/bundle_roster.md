# 📦 Fires of Armageddon // Bundle: Rosters & Nemesis Ledger

Complete source code for the Crusade Order of Battle rosters and Cross-Mode Nemesis Ledger (`pages/roster.html`).

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
  <title>Fires of Armageddon // Rosters &amp; Nemesis Ledger</title>
  <link rel="icon" type="image/svg+xml" href="../assets/favicon.svg">
  <link rel="apple-touch-icon" href="../assets/favicon.svg">
  <link rel="stylesheet" href="../css/style.css">
</head>
<body>

  <nav class="suite-nav">
    <a href="../index.html" class="suite-link">🧟 Mode 1: Horde Command &amp; Spawner</a>
    <a href="pvp.html" class="suite-link">⚔️ Mode 2: 1v1 Ash Wastes PvP</a>
    <a href="rogue.html" class="suite-link">🎲 Mode 3: Rogue Sector &amp; AI Tracker</a>
    <a href="roster.html" class="suite-link active">🎖️ Rosters &amp; Nemesis Ledger</a>
    <a href="briefing.html" class="suite-link">📜 Briefings, Ship &amp; Atlas</a>
    <a href="welcome.html" class="suite-link">📖 Codex &amp; Guide</a>
  </nav>

  <div class="container">
    <div class="hero-banner">
      <h1>Orders of Battle &amp; Nemesis Ledger</h1>
      <p>Dramatis Personae, "Scars Are Stories" Chronicles &amp; Cross-Mode Boss Pool</p>
    </div>

    <!-- PHASE 1 GLOBAL SCOREBOARD -->
    <div class="scoreboard-bar">
      <div class="score-card">
        <div class="score-title">Commander Alpha • The Exile</div>
        <div class="score-name">The Sanctuary of Ash</div>
        <div class="score-pts">0 SPts • 1 CPt <span style="font-size:0.75rem; color:var(--blue);">(Ship: 0)</span></div>
      </div>
      <div class="score-card beta">
        <div class="score-title">Commander Beta • JUNEBUG</div>
        <div class="score-name">High Sanctum / Pending</div>
        <div class="score-pts" style="color:var(--purple);">0 SPts • 0 CPts</div>
      </div>
      <div class="score-card horde">
        <div class="score-title">3rd Alliance • Origin Unknown</div>
        <div class="score-name">The Horde Overlord</div>
        <div class="score-pts" style="color:var(--red);">0 SPts • 0 CPts</div>
      </div>
    </div>

    <!-- 1. COMMANDER ALPHA DRAMATIS PERSONAE -->
    <div class="section-card">
      <span class="badge">Commander Alpha • Astra Militarum (1,790 / 1,900 Pts)</span>
      <h2>The Sanctuary of Ash — Dramatis Personae</h2>
      <p>Tracked on Administratum • 0 RP Remaining • +1 Crusade Point (Lord Marshal Dreir) • <em>Shipboard Slider Rules in Alpha's Briefing Tab</em></p>

      <div class="char-card">
        <div class="char-header">
          <span class="char-name">🎖️ The Exile — Rogal Dorn Commander (<em>"Mercy's Delay"</em>)</span>
          <span class="char-meta">Warlord • 265 Pts • Enhancement: Calm Under Fire</span>
        </div>
        <p style="margin:0;">Once a decorated Cadian Shock Officer who survived the Fall of Cadia and emerged unscathed from seven doomed last stands—declared "cursed" by his comrades and claimed by the Krieg as a living indictment. Commands a salvaged Rogal Dorn retrofitted with Krieg siege dozer blades and Sororitas purity seals that burn his skin when touched.</p>
        <div class="deed-box">
          <strong>• Special Rule (<em>"Mercy Delayed Again"</em>):</strong> Surviving a Horde Mode Round 6 Final Stand in which 3+ friendly Krieg units were destroyed grants <em>The Exile</em> <strong>+1 bonus XP</strong> and lets one destroyed Krieg Battleline unit swap a failed Out of Action Battle Scar for <strong>"Absolved in Ash"</strong> (<em>Feel No Pain 6+</em> within 6" of <em>The Exile</em>).<br>
          <strong>• Session 0 Deed (Sector Node 0 — Golgotha Arbor-Basin):</strong> Held the right forest flank during the Sororitas audit before <em>"Mercy's Delay"</em> was disabled in the closing salvos—dragged alive from the smoking wreckage once again.<br>
          <strong>• Narrative Honours &amp; Scars (<em>"Scars Are Stories"</em>):</strong> <em>None yet (0 XP • Battle-Ready).</em>
        </div>
      </div>

      <div class="char-card purple">
        <div class="char-header">
          <span class="char-name">⚔️ Lord Marshal Dreir — Epic Hero of Krieg</span>
          <span class="char-meta" style="color:var(--purple);">Epic Hero • 70 Pts • Inspirational Champion (+1 CrP)</span>
        </div>
        <p style="margin:0;">The unyielding cavalry spearhead of the penitentiary column, leading his Death Riders directly into the thickest empyric breaches of the ash wastes.</p>
        <div class="deed-box">
          <strong>• Mighty Champion Rule (<em>Inspirational Champion</em>):</strong> Ignore all Battle Scars on the Bodyguard unit Dreir leads, AND select <strong>one additional unit</strong> to be <em>Marked for Greatness (+3 XP)</em> at the end of every battle!<br>
          <strong>• Session 0 Deed (Golgotha Arbor-Basin):</strong> Led the cavalry charge into the Sororitas lines and fell in the crucible of fire before being recovered by the Krieg Quartermasters.
        </div>
      </div>

      <div class="char-card red">
        <div class="char-header">
          <span class="char-name">💥 2x Leman Russ Vanquishers — <em>"The Shrine-Breakers"</em></span>
          <span class="char-meta" style="color:var(--red);">Armored Tank Hunters • 145 Pts Each</span>
        </div>
        <p style="margin:0;">Recorded only by cold serial hull-numbers on High Sanctum manifests, speaking their nickname aloud on the upper decks is a flogging offense. Yet down by the corpse-starch vats of the Lower Decks, the troopers only ever call them <strong>"The Shrine-Breakers"</strong>—tapping their shovel-blades twice against their helmets whenever the long-barreled hulls rumble past.</p>
        <div class="deed-box">
          <strong>• Session 0 Deed (Golgotha Arbor-Basin):</strong> While 40 Kriegsmen brawled in the central forest clearing, these two Vanquishers calmly locked onto the gilded Sororitas reliquaries and blew <em>every single Sororitas war-machine</em> sky-high in catastrophic, chain-reaction fireballs—creating the permanent <em>Graveyard of Stained Glass</em> at Sector Node 0!<br>
          <strong>• Session 0 Legacy Perk:</strong> The first time either of the <em>Shrine-Breakers</em> reaches the <strong>Blooded</strong> rank (6 XP), it may re-roll its <em>Weapon Modification</em> or <em>Battle Trait</em> roll for free!
        </div>
      </div>

      <div class="char-card blue">
        <div class="char-header">
          <span class="char-name">💀 The Unseen Jury &amp; 🔫 Dravik, The Silent Judge</span>
          <span class="char-meta" style="color:var(--blue);">Krieg Command Squad (65 Pts • Stalwart's Honours) &amp; Commissar (30 Pts)</span>
        </div>
        <p style="margin:0;"><em>The Unseen Jury</em> enforces the Sororitas' will through sanctioned purges, leaving spent shell casings in neat rows like rosary beads. <em>Commissar Dravik</em> never raises his voice—executing overly zealous Kriegers with a single shot to the back of the skull for "wasting the Emperor's currency," guided by orders scrawled in blood on the walls of the ship's brig.</p>
      </div>

      <h3 style="font-size:0.95rem; color:var(--gold); margin:16px 0 8px 0; text-transform:uppercase;">Full Registered Order of Battle (13 Units • 1,820 Pts)</h3>
      <div class="oob-grid">
        <div class="oob-item"><strong>Stormlord (460 pts)</strong><br><span style="color:var(--muted);">Super-Heavy Fortress • Disgorged 40 Kriegsmen onto Node 0 Center in S0</span></div>
        <div class="oob-item"><strong>3x Death Korps of Krieg (130 pts ea)</strong><br><span style="color:var(--muted);">Battleline • Stole Left Forest Bunker in S0 via 8 OC</span></div>
        <div class="oob-item"><strong>1x Death Riders (70 pts)</strong><br><span style="color:var(--muted);">Mounted Spearhead • Led by Dreir (Scar-Immune)</span></div>
        <div class="oob-item"><strong>2x Scout Sentinels (55 pts ea)</strong><br><span style="color:var(--muted);">Forward Recon Walkers</span></div>
        <div class="oob-item"><strong>1x Ogryn Bodyguard (40 pts)</strong><br><span style="color:var(--muted);">Command Slab-Shield</span></div>
      </div>
    </div>

    <!-- 2. COMMANDER BETA & NEMESIS LEDGER -->
    <div class="section-card">
      <span class="badge red">3rd Alliance Boss Pool &amp; High Sanctum Wardens</span>
      <h2>Inducted Nemesis Ledger &amp; Commander Beta's Heroes</h2>
      <p>Slaying any inducted Nemesis on the battlefield grants the killer unit <strong>+2 bonus XP</strong> and scores <strong>+1 Strategic Point</strong> for your Alliance!</p>

      <div class="char-card red">
        <div class="char-header">
          <span class="char-name">🪽 Saint Celestine — <em>"The Ashen Seraph of the High Sanctum"</em></span>
          <span class="char-meta" style="color:var(--red);">Inducted Campaign Nemesis #1 • High Sanctum Warden</span>
        </div>
        <p style="margin:0;">After watching the Krieg <em>Shrine-Breakers</em> detonate every Sororitas war-engine in the forest clearing of Sector Node 1 during Session 0, Celestine descended from the ash-clouds directly into the Krieg rear deployment zone—slaughtering the rear guard, wiping out the Krieg officer corps, and stealing the Krieg home objective to clinch a 3-VP Sororitas victory!</p>
        <div class="deed-box">
          <strong>• Campaign Role:</strong> Serves as the NPC Warden of the High Sanctum (deploying against Commander Alpha if the Shipboard Slider hits <code>-3 Brig Abyss</code>)—or leads Commander Beta's Adepta Sororitas if Beta chooses to share <em>The Sanctuary of Ash</em>!
        </div>
      </div>

      <div class="char-card purple">
        <div class="char-header">
          <span class="char-name">🚩 Aestred Thurga &amp; Agathae Dolan — Keepers of the Penitentiary Ledger</span>
          <span class="char-meta" style="color:var(--purple);">High Sanctum Auditors • Adepta Sororitas</span>
        </div>
        <p style="margin:0;">Cut down a forward Krieg Scout Sentinel on the left flank in Round 1 of Session 0 with <em>Devastating Wounds</em> (generating a Miracle Die of 4), then weathered 11 point-blank Krieg shovel attacks without failing a single 3+ armor save—before having the forest bunker stolen out from under them by 4 Kriegsmen flexing 8 OC!</p>
      </div>
    </div>

  </div>
  <script src="../js/vox-audio.js"></script>
</body>
</html>
````
