# 📦 Fires of Armageddon // Bundle: Briefings (Part 2: Votann Gamma Dossier, Ship Slider & Sector Atlas)

Complete markup for Commander Gamma (Leagues of Votann / The Ledger of Embers), interactive SHIP.md slider, and the 8-node Sector Atlas (`pages/briefing.html`).

## 📑 Table of Contents
- [pages/briefing.html (Part 2: Gamma Dossier, Ship Slider & Sector Atlas)](#file-pagesbriefinghtmlpart2gammadossiershipslidersectoratlas)

---

## File: `pages/briefing.html (Part 2: Gamma Dossier, Ship Slider & Sector Atlas)` <a id="file-pagesbriefinghtmlpart2gammadossiershipslidersectoratlas"></a>

````html
    <div id="dossierGamma" class="hidden">

      <!-- CLEARANCE GATE GAMMA -->
      <div id="gateGamma" class="hero-card" style="text-align:center; padding:36px 24px; border-color:rgba(245, 176, 65, 0.45);">
        <div class="status-pill" style="margin-bottom:8px;">Sub-Thermospheric Void-Cracker • The Ledger of Embers • Site #44-KHA</div>
        <h2 class="hero-title" style="font-size:1.6rem; color:var(--gold);">⛏️ The Ledger of Embers // Fane-Node Vôl-09</h2>
        <p class="hero-subtitle" style="max-width:540px; margin:8px auto 22px auto;">
          Black-Ledger operational console for <strong>Kâhl Hârkyn Grîmledger</strong> &amp; the <strong>Thrymkâl Salvage Consortium</strong>. Operating under total radio-silence beneath the Armageddon smog clouds. Unauthorized Imperial interception blocked.
        </p>
        <button class="launch-btn unlock-btn" style="max-width:340px; margin:0 auto;" onclick="unlockTab('Gamma')">🔓 Authenticate Fane-Node Vôl-09 Key</button>
      </div>

      <!-- UNLOCKED GAMMA CONTENT -->
      <div id="contentGamma" class="hidden">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; margin-bottom:10px;">
          <span style="font-family:monospace; font-size:0.76rem; color:var(--gold);">
            +++ FANE-NODE VÔL-09 ("THE DEAF EAR") // BLACK-LEDGER ANCESTOR CORE // WARLORD: KÂHL HÂRKYN GRÎMLEDGER +++
          </span>
          <button class="btn-ghost btn-sm lock-toggle-btn" onclick="lockTab('Gamma')">🔒 Lock Black-Ledger Dataslate</button>
        </div>

        <!-- PART 1: SHIP ORIGIN & THE 900-YEAR DEBT OF HIVE INFERNUS -->
        <div class="hero-card" style="margin-bottom:20px; border-color:rgba(245, 176, 65, 0.4);">
          <div class="status-pill">Deep-Core Void-Cracker &amp; Heavy Macro-Hauler • Registry: Glôk-Vâr • Alliance: Independent / Marauders Plunder-Pact</div>
          <h1 class="hero-title" style="font-size:1.85rem; margin-top:4px;">The Ledger of Embers (Glôk-Vâr)</h1>

          <div class="lore-quote" style="text-align:left; line-height:1.65;">
            <p style="margin:0 0 10px 0; font-family:monospace; font-size:0.82rem; color:var(--gold);"><strong>+++ FANE-NODE VÔL-09 // SUB-THERMOSPHERIC SEISMIC &amp; CLAIM-RECKONING TELEMETRY +++</strong></p>
            <p style="margin-bottom:10px;">
              <em>"Seismic anchoring confirmed. Welcome to the Hearth, Kâhl Grîmledger. While the Imperial primitives aboard <strong>The Sanctuary of Ash</strong> flagellate themselves and Phaeron Junebug's living metal awakens in the equatorial dirt, our deep-core Void-Cracker <strong>The Ledger of Embers</strong> (registered in ancient core charters as <strong>'Glôk-Vâr'</strong>) drifts masked beneath the sulfur cloudbanks of Armageddon.</em>
            </p>
            <p style="margin-bottom:10px;">
              <em>Nine centuries ago during the Second War for Armageddon, the Thrymkâl Consortium advanced three million metric tons of promethium-drilling equipment and seismic macro-charges to the ruling merchant baronies of <strong>Hive Infernus</strong>. When the world fell to ash, the Administratum marked the balance as martyred deficit. But the Ancestors do not write off debts. <strong>The 900-Year Debt of Hive Infernus</strong> has compounded across three Terran generations—and with interest, humanity owes the League exactly four billion tons of raw minerals, rare heavy isotopes, and uncatalogued xenos salvage.</em>
            </p>
            <p style="margin:0;">
              <em>Our local Ironkin cogitator bank, <strong>Fane-Node Vôl-09 ('The Deaf Ear')</strong>, actively filters out all Imperial tithe demands and astropathic distress wails, tuning our sensors solely to raw resource concentrations. We fight not for the Emperor or the Chaos gods, but to balance the ledger down to the last scrap of ferric ore."</em>
            </p>
          </div>

          <!-- TELEMETRY GRID -->
          <div class="telemetry-grid">
            <div class="telemetry-box" style="border-top-color:var(--gold);">
              <strong style="color:var(--gold); display:block; margin-bottom:4px;">🪨 Deep-Seismic Core Drills &amp; Site #44-KHA</strong>
              Stationed above Sector Node 0, our seismic ground-penetrators detect massive tectonic fractures and unharvested veins beneath the petrified iron-wood roots.
            </div>
            <div class="telemetry-box" style="border-top-color:var(--blue);">
              <strong style="color:var(--blue); display:block; margin-bottom:4px;">🧠 Fane-Node Vôl-09 ("The Deaf Ear")</strong>
              An isolated Brôkhyr ancestral archive operating without empyric broadcast. All harvested resources and guild contracts are encrypted locally into the Black-Ledger.
            </div>
            <div class="telemetry-box" style="border-top-color:var(--green);">
              <strong style="color:var(--green); display:block; margin-bottom:4px;">📡 Radio-Silent Solo Black-Ledger Channel</strong>
              Terminal Gamma in <a href="vox.html" style="color:var(--green);">Mode 7: Astropath Vox</a> communicates directly with Fane-Node Vôl-09 with zero telepathic resonance bleed into Imperial or Necron frequencies.
            </div>
          </div>
        </div>

        <!-- PART 2: 10-UNIT NEEDGAÂRD OATHBAND ROSTER (1,200 / 1,200 PTS) -->
        <div class="card" style="margin-bottom:20px; border-left:4px solid var(--gold);">
          <div class="section-header" style="margin-top:0;">
            <h3>📜 10-Unit Needgaârd Oathband Crusade Roster (1,200 / 1,200 Pts • 3 RP • 1 CrP)</h3>
            <span class="hud-sub">Warlord: Kâhl Hârkyn Grîmledger • Thrymkâl Salvage Consortium</span>
          </div>
          <p class="card-desc" style="margin-bottom:14px;">
            The veteran core of the <strong>Needgaârd Oathband</strong>, deployed with heavy prospecting gear, teleport crests, and forward infiltration squads to secure mining claims across Armageddon:
          </p>
          <div style="overflow-x:auto;">
            <table class="reckoning-table" style="width:100%; border-collapse:collapse; font-size:0.83rem;">
              <thead>
                <tr style="border-bottom:1px solid var(--border); text-align:left; color:var(--gold);">
                  <th style="padding:6px 8px;">#</th>
                  <th style="padding:6px 8px;">Unit Designation</th>
                  <th style="padding:6px 8px;">Role</th>
                  <th style="padding:6px 8px;">Wargear &amp; Modifications</th>
                  <th style="padding:6px 8px; text-align:right;">Points</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom:1px solid rgba(255,255,255,0.06);">
                  <td style="padding:6px 8px; color:var(--gold); font-weight:700;">1</td>
                  <td style="padding:6px 8px; font-weight:700; color:#fff;">Kâhl Hârkyn Grîmledger</td>
                  <td style="padding:6px 8px; color:var(--muted);">Character (Warlord)</td>
                  <td style="padding:6px 8px;">Mass Gauntlet, Volkanite Disintegrator, Rampart Crest • <em>Oathbound Speculator (+1 CrP)</em></td>
                  <td style="padding:6px 8px; text-align:right; font-weight:700;">100 pts</td>
                </tr>
                <tr style="border-bottom:1px solid rgba(255,255,255,0.06);">
                  <td style="padding:6px 8px; color:var(--gold); font-weight:700;">2</td>
                  <td style="padding:6px 8px; font-weight:700; color:#fff;">Einhyr Champion</td>
                  <td style="padding:6px 8px; color:var(--muted);">Character</td>
                  <td style="padding:6px 8px;">Darkstar Axe, Weavefield Crest, Autoch-pattern Combisquig</td>
                  <td style="padding:6px 8px; text-align:right; font-weight:700;">60 pts</td>
                </tr>
                <tr style="border-bottom:1px solid rgba(255,255,255,0.06);">
                  <td style="padding:6px 8px; color:var(--gold); font-weight:700;">3</td>
                  <td style="padding:6px 8px; font-weight:700; color:#fff;">Grimnyr &amp; 2 CORVs</td>
                  <td style="padding:6px 8px; color:var(--muted);">Character</td>
                  <td style="padding:6px 8px;">Ancestral Wrath, 2x CORV Autoch-bolters, Fortify Totems</td>
                  <td style="padding:6px 8px; text-align:right; font-weight:700;">65 pts</td>
                </tr>
                <tr style="border-bottom:1px solid rgba(255,255,255,0.06);">
                  <td style="padding:6px 8px; color:var(--gold); font-weight:700;">4</td>
                  <td style="padding:6px 8px; font-weight:700; color:#fff;">Hearthkyn Warriors (10 Kin)</td>
                  <td style="padding:6px 8px; color:var(--muted);">Battleline</td>
                  <td style="padding:6px 8px;">Theyn w/ Concussion Gauntlet, Medipack, Comms, Magna-rail Rifle, L7 Missile Launcher</td>
                  <td style="padding:6px 8px; text-align:right; font-weight:700;">100 pts</td>
                </tr>
                <tr style="border-bottom:1px solid rgba(255,255,255,0.06);">
                  <td style="padding:6px 8px; color:var(--gold); font-weight:700;">5</td>
                  <td style="padding:6px 8px; font-weight:700; color:#fff;">Hernkyn Yaegirs Alpha (10 Kin)</td>
                  <td style="padding:6px 8px; color:var(--muted);">Infantry (Infiltrators)</td>
                  <td style="padding:6px 8px;">Theyn, Magna-coil Rifle, Plasma Knives, Bolt Shotguns (Scouts 9")</td>
                  <td style="padding:6px 8px; text-align:right; font-weight:700;">90 pts</td>
                </tr>
                <tr style="border-bottom:1px solid rgba(255,255,255,0.06);">
                  <td style="padding:6px 8px; color:var(--gold); font-weight:700;">6</td>
                  <td style="padding:6px 8px; font-weight:700; color:#fff;">Hernkyn Yaegirs Beta (10 Kin)</td>
                  <td style="padding:6px 8px; color:var(--muted);">Infantry (Infiltrators)</td>
                  <td style="padding:6px 8px;">Theyn, AP-3 Magna-coil Sniper, Bolt Shotguns, Land-mines (Scouts 9")</td>
                  <td style="padding:6px 8px; text-align:right; font-weight:700;">90 pts</td>
                </tr>
                <tr style="border-bottom:1px solid rgba(255,255,255,0.06);">
                  <td style="padding:6px 8px; color:var(--gold); font-weight:700;">7</td>
                  <td style="padding:6px 8px; font-weight:700; color:#fff;">Einhyr Hearthguard (5 Kin)</td>
                  <td style="padding:6px 8px; color:var(--muted);">Elite Infantry</td>
                  <td style="padding:6px 8px;">Hesyr, Teleport Crest, Concussion Gauntlets, Volkanite Disintegrators (Deep Strike)</td>
                  <td style="padding:6px 8px; text-align:right; font-weight:700;">160 pts</td>
                </tr>
                <tr style="border-bottom:1px solid rgba(255,255,255,0.06);">
                  <td style="padding:6px 8px; color:var(--gold); font-weight:700;">8</td>
                  <td style="padding:6px 8px; font-weight:700; color:#fff;">Hernkyn Pioneers (3 Kin)</td>
                  <td style="padding:6px 8px; color:var(--muted);">Mounted Outriders</td>
                  <td style="padding:6px 8px;">Pan Spectral Scanner, Magna-coil Autocannon, HYLas Rotary Cannon (Scouts 9")</td>
                  <td style="padding:6px 8px; text-align:right; font-weight:700;">90 pts</td>
                </tr>
                <tr style="border-bottom:1px solid rgba(255,255,255,0.06);">
                  <td style="padding:6px 8px; color:var(--gold); font-weight:700;">9</td>
                  <td style="padding:6px 8px; font-weight:700; color:#fff;">Sagitaur</td>
                  <td style="padding:6px 8px; color:var(--muted);">Transport / Vehicle</td>
                  <td style="padding:6px 8px;">HYLas Beam Cannon, Twin Bolt Cannon, Armoured Bulkheads</td>
                  <td style="padding:6px 8px; text-align:right; font-weight:700;">115 pts</td>
                </tr>
                <tr style="border-bottom:1px solid rgba(255,255,255,0.06);">
                  <td style="padding:6px 8px; color:var(--gold); font-weight:700;">10</td>
                  <td style="padding:6px 8px; font-weight:700; color:#fff;">Hekaton Land Fortress</td>
                  <td style="padding:6px 8px; color:var(--muted);">Heavy Vehicle / Battle Tank</td>
                  <td style="padding:6px 8px;">Heavy Magna-rail Cannon, 2x Twin Bolt Cannons, MATR Autocannon, Void Plating</td>
                  <td style="padding:6px 8px; text-align:right; font-weight:700;">225 pts</td>
                </tr>
              </tbody>
              <tfoot>
                <tr style="font-weight:800; color:var(--gold);">
                  <td colspan="4" style="padding:8px; text-align:right;">TOTAL FORCE VALUE:</td>
                  <td style="padding:8px; text-align:right; color:var(--green); font-size:0.95rem;">1,200 / 1,200 pts</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

      </div>
    </div>

    <!-- ================================================================= -->
    <!-- TAB 3: 8-NODE SECTOR ATLAS & PARALLEL HEGEMONY TRACKER            -->
    <!-- ================================================================= -->
    <div id="dossierAtlas" class="hidden">
      <div class="hero-card" style="margin-bottom:20px;">
        <div class="status-pill">Segmentum Solar Cartography • Sub-Sector Armageddon Auspex</div>
        <h1 class="hero-title" style="font-size:1.75rem; margin-top:8px;">Armageddon Planetary Theatre Atlas</h1>
        <p class="hero-subtitle">
          Live orbital auspex projection of <strong>Armageddon Prime</strong>, the <strong>Equatorial Jungle</strong>,
          <strong>Armageddon Secundus</strong>, and <strong>The Fire Wastes</strong>. Tap any Sector Node
          (<strong>N0–N7</strong>) to inspect its strategic installation, or use the <strong>🔍 Expand Fullscreen &amp;
            Zoom</strong> controls to inspect the theatre up close.
        </p>
      </div>

      <!-- LORE-ACCURATE ARMAGEDDON TACTICAL AUSPEX SVG MAP (NODES 0 TO 7) -->
      <div id="auspexMapFrame" class="auspex-map-frame">
        <!-- TOP AUSPEX HEADER & ZOOM / FULLSCREEN CONTROLS -->
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px; padding:4px 8px 10px 8px; border-bottom:1px solid rgba(74, 222, 128, 0.2); margin-bottom:8px; font-family:monospace; font-size:0.75rem; color:#86efac;">
          <span>📡 AUSPEX TELEMETRY // 998.M41 — ERA OF THE RED ANGEL'S GATE</span>

          <div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap;">
            <div style="display:flex; gap:10px; flex-wrap:wrap;">
              <span><strong style="color:#10b981;">●</strong> Active Zone</span>
              <span><strong style="color:#f5b041;">▲</strong> Hive (Max 3)</span>
              <span><strong style="color:#38bdf8;">❖</strong> Military / Cache</span>
              <span><strong style="color:#a855f7;">◌</strong> Fog (?/8 HP)</span>
            </div>

            <!-- Interactive Zoom & Fullscreen Buttons -->
            <div style="display:flex; gap:5px; align-items:center;">
              <button type="button" class="auspex-toolbar-btn active" id="zoomBtn1" onclick="setAuspexZoom('1x')">1x</button>
              <button type="button" class="auspex-toolbar-btn" id="zoomBtn15" onclick="setAuspexZoom('15x')">1.6x</button>
              <button type="button" class="auspex-toolbar-btn" id="zoomBtn22" onclick="setAuspexZoom('22x')">2.2x</button>
              <button type="button" class="auspex-toolbar-btn" id="fullscreenMapBtn" onclick="toggleAuspexFullscreen()">🔍 Expand Fullscreen</button>
            </div>
          </div>
        </div>

        <div id="auspexViewport" class="auspex-map-viewport zoom-1x">
          <svg id="armageddon-sector-map" viewBox="0 0 920 500" ondblclick="toggleAuspexFullscreen()">
            <defs>
              <!-- Tactical Auspex Grid Pattern -->
              <pattern id="auspexGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(74, 222, 128, 0.07)" stroke-width="1" />
                <path d="M 20 0 L 20 40 M 0 20 L 40 20" fill="none" stroke="rgba(74, 222, 128, 0.025)" stroke-width="0.5" />
              </pattern>
              <!-- Equatorial Jungle Red Diagonal Threat Hatching -->
              <pattern id="jungleHazard" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="10" stroke="rgba(239, 68, 68, 0.28)" stroke-width="4" />
              </pattern>
              <!-- Fire Wastes Crimson Rift Glow -->
              <radialGradient id="fireWastesGlow" cx="55%" cy="10%" r="45%">
                <stop offset="0%" stop-color="#ff4757" stop-opacity="0.35" />
                <stop offset="55%" stop-color="#991b1b" stop-opacity="0.12" />
                <stop offset="100%" stop-color="#000000" stop-opacity="0" />
              </radialGradient>
              <!-- Golgotha Jungle Bio-Glow -->
              <radialGradient id="jungleGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stop-color="#10b981" stop-opacity="0.32" />
                <stop offset="100%" stop-color="#10b981" stop-opacity="0" />
              </radialGradient>
              <!-- Reusable Standing Hive Spire Icon (Used ONLY for Volcanus & Thoraddis) -->
              <g id="hiveIcon">
                <path d="M 0,-12 L 5,2 L 9,6 L -9,6 L -5,2 Z" fill="#0d1914" stroke="#f5b041" stroke-width="1.4" />
                <circle cx="0" cy="-1" r="2" fill="#f5b041"  />
              </g>
              <!-- Reusable Ruined Hive Icon (Used ONLY for Hive Hades Ruins) -->
              <g id="ruinIcon">
                <polygon points="-7,-6 7,-6 0,7" fill="#1f1216" stroke="#f87171" stroke-width="1.3" />
                <text x="0" y="2" text-anchor="middle" fill="#f87171" font-size="8" font-weight="900">!</text>
              </g>
              <!-- Reusable Bunker / Outpost Crosshair Icon -->
              <g id="outpostIcon">
                <rect x="-6" y="-6" width="12" height="12" rx="2" fill="#09151b" stroke="#38bdf8" stroke-width="1.3" />
                <circle cx="0" cy="0" r="2.2" fill="#38bdf8"  />
              </g>
              <!-- Reusable Munitions / Ordnance Icon -->
              <g id="ammoIcon">
                <polygon points="0,-7 7,0 0,7 -7,0" fill="#1c1608" stroke="#f59e0b" stroke-width="1.3" />
                <circle cx="0" cy="0" r="2" fill="#f59e0b"  />
              </g>
            </defs>

            <!-- 1. DEEP TOXIC OCEAN BACKGROUND -->
            <rect width="920" height="500" fill="#06100d" />
            <rect width="920" height="500" fill="url(#auspexGrid)" />
            <rect width="920" height="500" fill="url(#fireWastesGlow)" />

            <!-- 2. CANONICAL CONTINENTAL LANDMASSES -->
            <!-- Northern Landmass: THE FIRE WASTES -->
            <path d="M 190,0 L 840,0 L 825,48 L 775,55 L 740,42 L 690,62 L 650,50 L 615,72 L 560,65 L 520,82 L 470,68 L 435,88 L 395,72 L 350,82 L 305,65 L 265,78 L 220,52 L 185,28 Z" fill="#271917" stroke="#5c3a33" stroke-width="1.5" />
            <path d="M 320,25 L 340,12 L 360,25 M 480,35 L 505,15 L 530,35 M 540,45 L 565,20 L 590,45 M 660,30 L 685,12 L 710,30" fill="none" stroke="#7f4f45" stroke-width="1.5" />

            <!-- Phoenix Island (In the Boiling Sea) -->
            <path d="M 555,105 L 585,98 L 605,112 L 590,126 L 560,124 L 545,114 Z" fill="#1f241d" stroke="#4b5e47" stroke-width="1.2" />

            <!-- Main Continent: ARMAGEDDON PRIME + EQUATORIAL JUNGLE + ARMAGEDDON SECUNDUS -->
            <path d="M 275,105 L 315,95 L 345,112 L 330,132 L 365,125 L 395,142 L 420,168 L 465,165 L 505,172 L 545,158 L 585,165 L 620,145 L 665,150 L 705,128 L 755,135 L 795,115 L 845,105 L 920,100 L 920,385 L 875,375 L 845,350 L 810,362 L 780,335 L 735,345 L 690,330 L 645,342 L 605,322 L 570,330 L 535,305 L 495,315 L 460,338 L 430,335 L 415,305 L 385,285 L 345,298 L 310,282 L 280,295 L 255,272 L 215,278 L 195,258 L 235,245 L 185,232 L 165,212 L 215,205 L 175,188 L 195,168 L 240,175 L 210,148 L 235,132 L 270,140 L 255,118 Z" fill="#1d261f" stroke="#4b6352" stroke-width="1.8" />

            <!-- Armageddon Prime Uplands Shading -->
            <path d="M 235,145 L 325,135 L 385,155 L 410,210 L 385,275 L 295,278 L 225,255 Z" fill="#282d23" opacity="0.7" />

            <!-- Armageddon Secundus Ash Wastes Shading -->
            <path d="M 505,175 L 695,152 L 835,130 L 885,235 L 835,340 L 635,330 L 535,295 L 495,235 Z" fill="#2c2820" opacity="0.75" />

            <!-- EQUATORIAL JUNGLE BIOME -->
            <path d="M 412,168 L 478,168 L 502,215 L 488,285 L 458,336 L 428,332 L 412,285 L 398,225 Z" fill="#112a1a" stroke="#22c55e" stroke-width="1" stroke-dasharray="3,2" />
            <path d="M 418,175 L 472,175 L 492,218 L 480,282 L 455,330 L 432,326 L 418,280 L 406,225 Z" fill="url(#jungleHazard)" />
            <circle cx="445" cy="245" r="58" fill="url(#jungleGlow)"  />

            <!-- Southern Landmass: THE DEADLANDS & NETHERIA PENINSULA -->
            <path d="M 115,500 L 145,455 L 185,435 L 210,455 L 255,405 L 295,385 L 280,435 L 325,415 L 365,375 L 395,395 L 375,445 L 435,430 L 485,445 L 535,425 L 555,375 L 595,358 L 635,372 L 620,415 L 675,408 L 725,425 L 785,412 L 855,435 L 920,420 L 920,500 Z" fill="#171d1b" stroke="#3d4f49" stroke-width="1.5" />

            <!-- 3. STEPPED TACTICAL AUSPEX SECTOR BOUNDARIES -->
            <g fill="none" stroke="rgba(134, 239, 172, 0.22)" stroke-width="1.2">
              <polyline points="170,130 280,130 280,90 410,90 410,155 530,155 530,120 680,120 680,95 850,95" />
              <polyline points="200,295 360,295 360,345 510,345 510,335 710,335 710,380 860,380" />
              <polyline points="395,155 395,295" />
              <polyline points="505,155 505,335" />
              <polyline points="670,120 670,335" />
            </g>

            <!-- 4. MOUNTAIN RANGES & RIVERS -->
            <g fill="none" stroke="#52525b" stroke-width="1.4" opacity="0.75">
              <path d="M 275,185 L 285,172 L 295,185 L 305,170 L 315,185 L 325,174 L 335,185" />
              <path d="M 245,235 L 255,222 L 265,235 L 275,220 L 285,235" />
              <path d="M 525,192 L 538,176 L 550,192 L 562,175 L 575,192 L 588,178 L 600,192" />
              <path d="M 615,212 L 628,196 L 640,212 L 652,198 L 665,212" />
            </g>
            <!-- River Stygies & Boiling Sea Channels -->
            <path d="M 390,142 Q 405,205 382,285" fill="none" stroke="#0ea5e9" stroke-width="1.8" opacity="0.45" />
            <path d="M 545,190 Q 585,245 568,325" fill="none" stroke="#0ea5e9" stroke-width="1.8" opacity="0.45" />

            <!-- 5. CANONICAL OCEAN & CONTINENT LABELS (Strictly 3 Hives Total on Map!) -->
            <g fill="rgba(167, 243, 208, 0.45)" font-size="13" font-weight="700" letter-spacing="3">
              <text x="515" y="24" text-anchor="middle" fill="rgba(252, 165, 165, 0.75)" font-size="15">THE FIRE WASTES</text>
              <text x="365" y="76" text-anchor="middle">THE BOILING SEA</text>
              <text x="520" y="368" text-anchor="middle">THE TEMPEST OCEAN</text>
              <text x="315" y="482" text-anchor="middle" fill="rgba(156, 163, 175, 0.55)">THE DEADLANDS</text>
              <text x="88" y="295" text-anchor="middle" transform="rotate(-38 88 295)" font-size="11">THE OCEAN OF FURY</text>
            </g>

            <g fill="rgba(226, 232, 240, 0.55)" font-size="12" font-weight="800" letter-spacing="2">
              <text x="275" y="258" text-anchor="middle">ARMAGEDDON PRIME</text>
              <text x="730" y="255" text-anchor="middle">ARMAGEDDON SECUNDUS</text>
              <text x="445" y="204" text-anchor="middle" fill="#86efac" font-size="9.5" letter-spacing="1.2">EQUATORIAL JUNGLE</text>
              <text x="345" y="272" text-anchor="middle" fill="#9ca3af" font-size="8.5" letter-spacing="1">PLAINS OF ANTHRAND</text>
              <text x="680" y="395" text-anchor="middle" fill="#9ca3af" font-size="8.5" letter-spacing="1">NETHERIA PENINSULA</text>
            </g>

            <!-- 6. AUSPEX COMPASS ROSE & DEADLANDS SKULL WATERMARK -->
            <g transform="translate(135, 395)" opacity="0.55">
              <circle cx="0" cy="0" r="38" fill="none" stroke="#4ade80" stroke-width="1.5"  />
              <circle cx="0" cy="0" r="32" fill="none" stroke="#4ade80" stroke-width="0.8" stroke-dasharray="3,2"  />
              <circle cx="0" cy="0" r="22" fill="none" stroke="#4ade80" stroke-width="0.8"  />
              <ellipse cx="0" cy="0" rx="22" ry="9" fill="none" stroke="#4ade80" stroke-width="0.6" transform="rotate(-35)" />
              <ellipse cx="0" cy="0" rx="9" ry="22" fill="none" stroke="#4ade80" stroke-width="0.6" transform="rotate(-35)" />
              <polygon points="-28,-28 -18,-10 -10,-18" fill="#4ade80" />
              <text x="-33" y="-32" fill="#4ade80" font-size="9" font-weight="800" transform="rotate(-45 -33 -32)">N</text>
            </g>

            <g transform="translate(455, 442)" opacity="0.16" fill="none" stroke="#86efac" stroke-width="2">
              <circle cx="0" cy="0" r="28"  />
              <path d="M -12,-6 C -12,-18 12,-18 12,-6 C 12,2 8,6 8,12 L -8,12 C -8,6 -12,2 -12,-6 Z" fill="#86efac" />
              <circle cx="-5" cy="-4" r="3" fill="#06100d"  />
              <circle cx="5" cy="-4" r="3" fill="#06100d"  />
            </g>

            <!-- 7. TACTICAL TRANSIT CORRIDORS BETWEEN THE 8 CAMPAIGN NODES -->
            <g stroke-width="2.2" fill="none">
              <line x1="445" y1="245" x2="335" y2="195" stroke="#10b981" stroke-dasharray="5,4" />
              <line x1="445" y1="245" x2="560" y2="230" stroke="#10b981" stroke-dasharray="5,4" />
              <line x1="445" y1="245" x2="590" y2="435" stroke="rgba(74, 222, 128, 0.35)" stroke-dasharray="4,5" />
              <line x1="335" y1="195" x2="210" y2="160" stroke="#3b2d54" stroke-dasharray="5,5" />
              <line x1="335" y1="195" x2="555" y2="58" stroke="#4c1d24" stroke-dasharray="4,6" />
              <line x1="210" y1="160" x2="555" y2="58" stroke="#4c1d24" stroke-dasharray="4,6" />
              <line x1="560" y1="230" x2="650" y2="305" stroke="#3b2d54" stroke-dasharray="5,5" />
              <line x1="560" y1="230" x2="725" y2="165" stroke="#3b2d54" stroke-dasharray="5,5" />
              <line x1="650" y1="305" x2="590" y2="435" stroke="#3b2d54" stroke-dasharray="5,5" />
              <line x1="650" y1="305" x2="725" y2="165" stroke="#3b2d54" stroke-dasharray="5,5" />
              <line x1="725" y1="165" x2="555" y2="58" stroke="#7f1d1d" stroke-dasharray="5,4" />
            </g>

            <!-- =============================================================== -->
            <!-- 8. INTERACTIVE CAMPAIGN SECTOR NODES (NODES 0 TO 7)             -->
            <!--    Strictly 3 Hives total: Volcanus (N3), Hades & Thoraddis (N6)-->
            <!-- =============================================================== -->

            <!-- NODE 0: GOLGOTHA ARBOR-BASIN (BIO-OXYGEN BASIN & LANDING SITE) -->
            <g class="map-node-group atlas-node-group selected-node" data-node-id="0" onclick="selectAtlasNode(0)" style="cursor:pointer;">
              <circle cx="445" cy="245" r="31" class="node-selection-reticle" stroke="#f5b041" stroke-width="2" stroke-dasharray="4,3" fill="none"  />
              <circle cx="445" cy="245" r="24" fill="#0d2618" stroke="#10b981" stroke-width="3"  />
              <text x="445" y="242" text-anchor="middle" fill="#ffffff" font-size="10.5" font-weight="900">NODE 0</text>
              <text x="445" y="254" text-anchor="middle" fill="#f5b041" font-size="7.5" font-weight="800">A:1 • B:2 • H:1</text>
              <rect x="372" y="273" width="146" height="26" rx="4" fill="rgba(5, 12, 9, 0.9)" stroke="#10b981" stroke-width="1" />
              <text x="445" y="285" text-anchor="middle" fill="#ecfdf5" font-size="8.5" font-weight="800">GOLGOTHA ARBOR-BASIN</text>
              <text x="445" y="295" text-anchor="middle" fill="#10b981" font-size="7" font-weight="700">[BIO-OXYGEN LANDING ZONE]</text>
            </g>

            <!-- NODE 1: ANTHRAND MUNITIONS VAULTS (STRATEGIC MUNITIONS CACHE) -->
            <g class="map-node-group atlas-node-group" data-node-id="1" onclick="selectAtlasNode(1)" style="cursor:pointer;">
              <circle cx="335" cy="195" r="28" class="node-selection-reticle" stroke="#f5b041" stroke-width="2" stroke-dasharray="4,3" fill="none"  />
              <circle cx="335" cy="195" r="21" fill="#151824" stroke="#f5b041" stroke-width="2" stroke-dasharray="4,2"  />
              <use href="#ammoIcon" x="312" y="175" />
              <text x="335" y="192" text-anchor="middle" fill="#fde68a" font-size="10" font-weight="800">NODE 1</text>
              <text x="335" y="203" text-anchor="middle" fill="#c084fc" font-size="7.5" font-weight="700">[FOG • ?/8]</text>
              <rect x="266" y="220" width="138" height="25" rx="4" fill="rgba(10, 12, 18, 0.9)" stroke="#f59e0b" stroke-width="1" />
              <text x="335" y="231" text-anchor="middle" fill="#fef3c7" font-size="8" font-weight="700">ANTHRAND SIEGE-VAULTS</text>
              <text x="335" y="241" text-anchor="middle" fill="#f5b041" font-size="6.8">[BURIED MUNITIONS CACHE]</text>
            </g>

            <!-- NODE 2: STYGIES DEACTIVATED LISTENING BASTION (MILITARY OUTPOST) -->
            <g class="map-node-group atlas-node-group" data-node-id="2" onclick="selectAtlasNode(2)" style="cursor:pointer;">
              <circle cx="560" cy="230" r="28" class="node-selection-reticle" stroke="#f5b041" stroke-width="2" stroke-dasharray="4,3" fill="none"  />
              <circle cx="560" cy="230" r="21" fill="#101c24" stroke="#38bdf8" stroke-width="2" stroke-dasharray="4,2"  />
              <use href="#outpostIcon" x="537" y="210" />
              <text x="560" y="227" text-anchor="middle" fill="#bae6fd" font-size="10" font-weight="800">NODE 2</text>
              <text x="560" y="238" text-anchor="middle" fill="#c084fc" font-size="7.5" font-weight="700">[FOG • ?/8]</text>
              <rect x="492" y="255" width="136" height="25" rx="4" fill="rgba(8, 16, 22, 0.9)" stroke="#38bdf8" stroke-width="1" />
              <text x="560" y="266" text-anchor="middle" fill="#e0f2fe" font-size="8" font-weight="700">STYGIES AEGIS REDOUBT</text>
              <text x="560" y="276" text-anchor="middle" fill="#38bdf8" font-size="6.8">[DEACTIVATED MILITARY OUTPOST]</text>
            </g>

            <!-- NODE 3: HIVE VOLCANUS (HIVE #1 — GEOTHERMAL FORGE-SPIRE) -->
            <g class="map-node-group atlas-node-group" data-node-id="3" onclick="selectAtlasNode(3)" style="cursor:pointer;">
              <circle cx="210" cy="160" r="28" class="node-selection-reticle" stroke="#f5b041" stroke-width="2" stroke-dasharray="4,3" fill="none"  />
              <circle cx="210" cy="160" r="21" fill="#12151f" stroke="#7c3aed" stroke-width="2" stroke-dasharray="4,3"  />
              <use href="#hiveIcon" x="186" y="138" />
              <text x="210" y="157" text-anchor="middle" fill="#c9d1d9" font-size="10" font-weight="800">NODE 3</text>
              <text x="210" y="168" text-anchor="middle" fill="#a855f7" font-size="7.5">[FOG • ?/8]</text>
              <rect x="145" y="185" width="130" height="25" rx="4" fill="rgba(10, 12, 18, 0.9)" stroke="#f5b041" stroke-width="1" />
              <text x="210" y="196" text-anchor="middle" fill="#fde68a" font-size="8" font-weight="700">HIVE VOLCANUS</text>
              <text x="210" y="206" text-anchor="middle" fill="#9ca3af" font-size="6.8">[IMPERIAL FORGE-HIVE #1]</text>
            </g>

            <!-- NODE 4: TEMPEST VOID-LASER BATTERY (DORMANT ORBITAL DEFENSE SILO) -->
            <g class="map-node-group atlas-node-group" data-node-id="4" onclick="selectAtlasNode(4)" style="cursor:pointer;">
              <circle cx="650" cy="305" r="28" class="node-selection-reticle" stroke="#f5b041" stroke-width="2" stroke-dasharray="4,3" fill="none"  />
              <circle cx="650" cy="305" r="21" fill="#101c24" stroke="#38bdf8" stroke-width="2" stroke-dasharray="4,3"  />
              <use href="#outpostIcon" x="626" y="285" />
              <text x="650" y="302" text-anchor="middle" fill="#c9d1d9" font-size="10" font-weight="800">NODE 4</text>
              <text x="650" y="313" text-anchor="middle" fill="#a855f7" font-size="7.5">[FOG • ?/8]</text>
              <rect x="580" y="330" width="140" height="25" rx="4" fill="rgba(8, 16, 22, 0.9)" stroke="#38bdf8" stroke-width="1" />
              <text x="650" y="341" text-anchor="middle" fill="#e0f2fe" font-size="8" font-weight="700">TEMPEST DEFENSE SILOS</text>
              <text x="650" y="351" text-anchor="middle" fill="#38bdf8" font-size="6.8">[DORMANT ORBITAL LASER BATTERY]</text>
            </g>

            <!-- NODE 5: NETHERIA RELIQUARY BARGE (GROUNDED MECHANICUS ARK-VAULT) -->
            <g class="map-node-group atlas-node-group" data-node-id="5" onclick="selectAtlasNode(5)" style="cursor:pointer;">
              <circle cx="590" cy="435" r="28" class="node-selection-reticle" stroke="#f5b041" stroke-width="2" stroke-dasharray="4,3" fill="none"  />
              <circle cx="590" cy="435" r="21" fill="#12151f" stroke="#7c3aed" stroke-width="2" stroke-dasharray="4,3"  />
              <use href="#ammoIcon" x="566" y="415" />
              <text x="590" y="432" text-anchor="middle" fill="#c9d1d9" font-size="10" font-weight="800">NODE 5</text>
              <text x="590" y="443" text-anchor="middle" fill="#a855f7" font-size="7.5">[FOG • ?/8]</text>
              <rect x="518" y="460" width="144" height="25" rx="4" fill="rgba(10, 12, 18, 0.9)" stroke="#a855f7" stroke-width="1" />
              <text x="590" y="471" text-anchor="middle" fill="#f3e8ff" font-size="8" font-weight="700">DEADLANDS ARK-VAULT</text>
              <text x="590" y="481" text-anchor="middle" fill="#c084fc" font-size="6.8">[FROZEN ARCHEOTECH CACHE]</text>
            </g>

            <!-- NODE 6: HIVE THORADDIS & RUINS OF HIVE HADES (HIVES #2 & #3 — BETA BRIEFING) -->
            <g class="map-node-group atlas-node-group" data-node-id="6" onclick="selectAtlasNode(6)" style="cursor:pointer;">
              <circle cx="725" cy="165" r="29" class="node-selection-reticle" stroke="#f5b041" stroke-width="2" stroke-dasharray="4,3" fill="none"  />
              <circle cx="725" cy="165" r="22" fill="#1a1218" stroke="#c084fc" stroke-width="2" stroke-dasharray="4,3"  />
              <!-- Twin Icons: Ruined Hive Hades (West) + Besieged Hive Thoraddis Spire (East) -->
              <use href="#ruinIcon" x="696" y="142" />
              <use href="#hiveIcon" x="754" y="142" />
              <text x="725" y="162" text-anchor="middle" fill="#f3e8ff" font-size="10" font-weight="800">NODE 6</text>
              <text x="725" y="173" text-anchor="middle" fill="#c084fc" font-size="7.5">[FOG • ?/8]</text>
              <rect x="643" y="191" width="164" height="26" rx="4" fill="rgba(18, 10, 16, 0.92)" stroke="#f5b041" stroke-width="1.1" />
              <text x="725" y="202" text-anchor="middle" fill="#fde68a" font-size="8" font-weight="800">HIVES HADES &amp; THORADDIS</text>
              <text x="725" y="212" text-anchor="middle" fill="#c084fc" font-size="6.8">[RUINED CRATER &amp; BESIEGED SPIRE]</text>
            </g>

            <!-- NODE 7: THE FIRE WASTES & RED ANGEL'S GATE (POLAR WARP-RIFT CITADEL) -->
            <g class="map-node-group atlas-node-group" data-node-id="7" onclick="selectAtlasNode(7)" style="cursor:pointer;">
              <circle cx="555" cy="58" r="31" class="node-selection-reticle" stroke="#f5b041" stroke-width="2" stroke-dasharray="4,3" fill="none"  />
              <circle cx="555" cy="58" r="23" fill="#280d12" stroke="#ff4757" stroke-width="2.5" stroke-dasharray="5,3"  />
              <text x="555" y="55" text-anchor="middle" fill="#fecdd3" font-size="10.5" font-weight="900">NODE 7</text>
              <text x="555" y="67" text-anchor="middle" fill="#ff4757" font-size="7.5" font-weight="800">[RIFT • ?/8]</text>
              <rect x="480" y="84" width="150" height="25" rx="4" fill="rgba(28, 8, 12, 0.9)" stroke="#ff4757" stroke-width="1.2" />
              <text x="555" y="95" text-anchor="middle" fill="#ffe4e6" font-size="8.5" font-weight="800">RED ANGEL'S GATE</text>
              <text x="555" y="104" text-anchor="middle" fill="#ff4757" font-size="6.8" font-weight="700">[CRIMSON MESA WARP-CITADEL]</text>
            </g>
          </svg>
        </div>

        <!-- INTERACTIVE AUSPEX TELEMETRY HUD INSIDE FULLSCREEN MODE -->
        <div id="fullscreenQuickHud" class="auspex-fullscreen-hud" style="display:none;">
          <div class="fs-hud-header">
            <div class="fs-hud-title-wrap">
              <span class="fs-node-tag" id="fsHudBadge">ACTIVE ZONE</span>
              <strong id="fsHudTitle" style="color:#ecfdf5; font-size:1.05rem; font-weight:800;">Sector Node 0: Golgotha
                Arbor-Basin</strong>
              <div id="fsHudDominance" class="fs-dominance-pill">💀 Lord Commander Junebug Leading (2 / 8 HP)</div>
            </div>
            <div style="display:flex; gap:6px; align-items:center;">
              <button type="button" class="auspex-toolbar-btn" id="fsToggleDetailsBtn" onclick="toggleFsHudDetails()">▾
                Telemetry Details</button>
              <button type="button" class="auspex-toolbar-btn" onclick="toggleAuspexFullscreen()">✕ Exit
                Fullscreen</button>
            </div>
          </div>

          <!-- QUICK NODE SELECTOR PILLS -->
          <div class="fs-hud-pills">
            <span style="font-size:0.68rem; color:#86efac; font-family:monospace; margin-right:4px;">RECON
              SECTOR:</span>
            <button type="button" class="fs-pill-btn active" id="fsPill0" onclick="selectAtlasNode(0)">N0
              Golgotha</button>
            <button type="button" class="fs-pill-btn" id="fsPill1" onclick="selectAtlasNode(1)">N1 Anthrand</button>
            <button type="button" class="fs-pill-btn" id="fsPill2" onclick="selectAtlasNode(2)">N2 Stygies</button>
            <button type="button" class="fs-pill-btn" id="fsPill3" onclick="selectAtlasNode(3)">N3 Volcanus</button>
            <button type="button" class="fs-pill-btn" id="fsPill4" onclick="selectAtlasNode(4)">N4 Tempest</button>
            <button type="button" class="fs-pill-btn" id="fsPill5" onclick="selectAtlasNode(5)">N5 Deadlands</button>
            <button type="button" class="fs-pill-btn" id="fsPill6" onclick="selectAtlasNode(6)">N6
              Hades/Thoraddis</button>
            <button type="button" class="fs-pill-btn" id="fsPill7" onclick="selectAtlasNode(7)">N7 Red Angel</button>
          </div>

          <!-- COLLAPSIBLE EXPANDED FULLSCREEN INTELLIGENCE & 3-WAY BARS -->
          <div id="fsHudDetails" class="fs-hud-details">
            <div id="fsHudRule" class="fs-hud-rule-box"></div>
            <div class="fs-hud-heg-grid">
              <div class="fs-heg-row">
                <div class="fs-heg-label">
                  <span>🦅 The Exile // Sanctuary of Ash</span>
                  <strong id="fs-heg-val-alpha">1 / 8 HP</strong>
                </div>
                <div id="fs-heg-bar-alpha" class="fs-heg-bar"></div>
              </div>
              <div class="fs-heg-row">
                <div class="fs-heg-label">
                  <span>💀 Lord Commander Junebug</span>
                  <strong id="fs-heg-val-beta">2 / 8 HP</strong>
                </div>
                <div id="fs-heg-bar-beta" class="fs-heg-bar"></div>
              </div>
              <div class="fs-heg-row">
                <div class="fs-heg-label">
                  <span>👁️🗨️ 3rd Alliance (Horde AI)</span>
                  <strong id="fs-heg-val-horde">1 / 8 HP</strong>
                </div>
                <div id="fs-heg-bar-horde" class="fs-heg-bar"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- NODE INSPECTOR & PARALLEL 8-PIP HEGEMONY BARS -->
      <div id="atlas-node-inspector" class="card" style="margin-bottom:20px; border-left:4px solid var(--green);">
        <div class="section-header" style="margin-top:0;">
          <h3 id="inspectorNodeTitle">Sector Node 0: Equatorial Jungle // The Golgotha Arbor-Basin</h3>
          <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap;">
            <span class="status-pill" id="inspectorNodeBadge">DISCOVERED • CONTESTED</span>
            <span class="fs-dominance-pill" id="inspectorDominance">💀 Lord Commander Junebug Leading (2 / 8 HP)</span>
          </div>
        </div>
        <p id="inspectorNodeLore" class="card-desc"></p>
        <div id="inspectorNodeRule" class="card" style="background:#0b0d13; margin:12px 0; font-size:0.88rem;"></div>

        <h4 style="margin:14px 0 8px 0; font-size:0.85rem; text-transform:uppercase; color:var(--gold);">
          Parallel Sector Hegemony Race (First to 8 HP Locks &amp; Conquers Sector)
        </h4>

        <div style="margin-bottom:10px;">
          <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:4px;">
            <span>🦅 The Exile // Sanctuary of Ash</span>
            <strong id="heg-label-alpha">1 / 8 HP</strong>
          </div>
          <div id="heg-bar-alpha" style="display:grid; grid-template-columns:repeat(8, 1fr); gap:4px; height:12px;">
          </div>
        </div>

        <div style="margin-bottom:10px;">
          <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:4px;">
            <span>💀 Lord Commander Junebug</span>
            <strong id="heg-label-beta">2 / 8 HP</strong>
          </div>
          <div id="heg-bar-beta" style="display:grid; grid-template-columns:repeat(8, 1fr); gap:4px; height:12px;">
          </div>
        </div>

        <div>
          <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom:4px;">
            <span>👁️🗨️ 3rd Alliance Overlord (Horde AI)</span>
            <strong id="heg-label-horde">1 / 8 HP</strong>
          </div>
          <div id="heg-bar-horde" style="display:grid; grid-template-columns:repeat(8, 1fr); gap:4px; height:12px;">
          </div>
        </div>
      </div>
    </div>

    <!-- ================================================================= -->
    <!-- TAB 4: HORDE → CRUSADE ROSTER PROGRESSION RULES                   -->
    <!-- ================================================================= -->
    <div id="dossierRules" class="hidden">
      <div class="hero-card" style="margin-bottom:20px;">
        <div class="status-pill">Campaign Synergy Rules • Mode B → Administratum Roster</div>
        <h1 class="hero-title" style="font-size:1.75rem; margin-top:8px;">Spoils of Breach Containment</h1>
        <p class="hero-subtitle">Completing your confidential Secret Objective, extracting Fortifications, and banking leftover Supply Points in Horde Mode permanently strengthens your Crusade Order of Battle.</p>
      </div>

      <div class="card" style="margin-bottom:16px; border-left:4px solid var(--red);">
        <h3 style="margin-top:0; color:var(--red);">1. The Traitor's Bounty (Covert Betrayal Payout)</h3>
        <p class="card-desc">
          Completing a Secret Objective carrying the <strong>Traitor</strong> tag in Co-op Horde Mode requires
          orchestrating the downfall of your partner amidst the breach. Because of the extreme risk and the permanent
          grudge it creates, fulfilling a <strong>Traitor Directive</strong> awards a <strong>Double Spoils
            Payout</strong>:
        </p>
        <ul style="font-size:0.9rem; line-height:1.6;">
          <li><strong>Plundered Command Cache:</strong> Steal <strong>1 Requisition Point (RP)</strong> (or <strong>2 Strategic Points</strong>) directly from the betrayed Commander, <strong>AND</strong> expand your Crusade Force's <strong>Supply Limit by +200 pts</strong> for free.</li>
          <li><strong>Forbidden Spoils of Treachery:</strong> Bestow a free <strong>Battle Honour</strong> (or an Armageddon <strong>Antiquity Relic</strong> ignoring rank restrictions!) upon your Warlord or the unit that executed the betrayal, <strong>plus +3 bonus XP</strong>.</li>
          <li><strong>Shipboard Shift (The Exile // Sanctuary of Ash Only):</strong> Completing a Traitor directive shifts <em>The Sanctuary of Ash</em> Balance Slider <strong>1 step toward the Lower Decks (-1)</strong>.</li>
          <li><strong>The Grudge Consequence:</strong> In your next 1v1 PvP clash, the betrayed Commander automatically receives <strong>1 free Armageddon Crusade Blessing</strong> even if they are not the Underdog!</li>
        </ul>
      </div>

      <div class="card" style="margin-bottom:16px; border-left:4px solid var(--gold);">
        <h3 style="margin-top:0; color:var(--gold);">2. Standard Secret Objective Victor Bonuses</h3>
        <p class="card-desc">Completing any non-Traitor Secret Objective (and surviving Round 6 if required) awards <strong>+5 Strategic Points</strong>, <strong>+1 bonus RP (or +100 pts Supply Limit)</strong>, plus the reward matching your card's tag:</p>
        <ul style="font-size:0.9rem; line-height:1.6;">
          <li><strong>Action / Relic Directives:</strong> The unit that completed the Action earns a free <strong>Battle Trait</strong> or <strong>Weapon Modification</strong> (or a free <strong>Crusade Relic</strong> if a Character) without needing to rank up.</li>
          <li><strong>Kill / Combat Directives:</strong> Select <strong>one additional unit</strong> to be <em>Marked for Greatness (+3 XP)</em> at the end of the battle.</li>
          <li><strong>Support / Fortify / Extraction Directives:</strong> Claim a free <strong>Repair and Recuperate</strong> Requisition after the battle (heal 1 Battle Scar on any unit for 0 RP).</li>
        </ul>
      </div>

      <div class="card" style="margin-bottom:16px; border-left:4px solid var(--blue);">
        <h3 style="margin-top:0; color:var(--blue);">3. Field Promotions, Leftover SP &amp; Persistent Fortifications
        </h3>
        <ul style="font-size:0.9rem; line-height:1.6;">
          <li><strong>"A Name Earned" (1 SP) Discount:</strong> If a Character buys <em>A Name Earned</em> during Horde Mode, survives Round 6, and slays a Horde Character/Monster/Vehicle (or completes an Action), reduce the RP cost of making that Enhancement permanent via <em>Renowned Heroes</em> by <strong>1 RP</strong> (min 1 RP).</li>
          <li><strong>Recruiting Reinforcements:</strong> Any unit summoned via <em>Reinforcements Arrive (12 SP)</em> or <em>Field Promotion (X SP)</em> that survives Round 6 can be inducted directly into your Order of Battle starting with <strong>3 XP</strong>!</li>
          <li><strong>Leftover SP Salvage:</strong> Unspent SP after surviving Round 6 can be cashed in: <strong>2 SP</strong> = Orbital Auspex Recon Probe into an adjacent Fog-of-War Sector Node; <strong>3 SP</strong> = Bank a 1v1 <em>Supply Cache Token</em>; <strong>5 SP</strong> = +2 XP to a surviving unit; <strong>8 SP</strong> = +1 RP or +100 pts Supply Limit.</li>
          <li><strong>Extracted Fortifications:</strong> Still controlling a Fortified Objective at the end of Round 6 grants a sector bonus: <strong>Field Hospital</strong> (all destroyed units auto-pass Out of Action tests), <strong>Ammo Dump</strong> (free Weapon Mod or +2 XP), <strong>War Trench</strong> (+1 XP to surviving Infantry/Battleline), or <strong>FOB</strong> (+1 bonus SPt &amp; +1 Sector Hegemony Pip).</li>
        </ul>
      </div>
    </div>

    <div class="btn-row">
      <a href="roster.html" class="terminal-link-btn alt">
        🎖️ View Dramatis Personae &amp; Nemesis Ledger →
      </a>
      <a href="spawner.html" class="terminal-link-btn">
        🧟 Launch Mode 1 Horde Command →
      </a>
      <a href="../index.html" class="terminal-link-btn">
        📖 Return to Field Codex &amp; Guide →
      </a>
    </div>

  </div>

  <script src="../js/briefing.js"></script>
  <script src="../js/vox-audio.js"></script>
</body>

</html>
````
