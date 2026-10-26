# 📦 Fires of Armageddon // Bundle: JavaScript Game Engine & Audio

Core logic, RNG algorithms, spawner mechanics, state management, faction/mission datasets, and Vox-Caster Web Audio synth (`js/*.js`).

## 📑 Table of Contents
- [js/data.js](#file-jsdatajs)
- [js/rng.js](#file-jsrngjs)
- [js/spawner.js](#file-jsspawnerjs)
- [js/spawner-cards.js](#file-jsspawnercardsjs)
- [js/spawner-cockpit.js](#file-jsspawnercockpitjs)
- [js/spawner-resupply.js](#file-jsspawnerresupplyjs)
- [js/app.js](#file-jsappjs)
- [js/vox-audio.js](#file-jsvoxaudiojs)

---

## File: `js/data.js` <a id="file-jsdatajs"></a>

````javascript
// 1. ALL 23 OFFICIAL SECTION 7.5 HORDE PRIMARY FACTION RULES
const HORDE_FACTIONS = [
  { name: "Space Marines", group: "Imperium", ruleTitle: "Transhuman Skills", desc: "Horde ADEPTUS ASTARTES units can re-roll hit rolls of 1." },
  { name: "Adepta Sororitas", group: "Imperium", ruleTitle: "Martyrs and Miracles", desc: "Starting in the fourth battle round, treat the first Horde Spawn Roll each round as an unmodified 12 instead of rolling 2D6." },
  { name: "Adeptus Custodes", group: "Imperium", ruleTitle: "Best of the Best of the Best", desc: "Horde ADEPTUS CUSTODES units’ melee attacks have [LETHAL HITS]." },
  { name: "Adeptus Mechanicus", group: "Imperium", ruleTitle: "Third Try’s the Charm", desc: "Horde ADEPTUS MECHANICUS units’ ranged attacks have +1 BS and [ASSAULT]." },
  { name: "Astra Militarum", group: "Imperium", ruleTitle: "Unanimous Orders", desc: "Horde ASTRA MILITARUM units’ ranged attacks have +1 BS while within 6\" of a friendly ASTRA MILITARUM OFFICER model." },
  { name: "Grey Knights", group: "Imperium", ruleTitle: "Poor Hammers", desc: "Horde GREY KNIGHTS units’ melee attacks against enemy VEHICLE or MONSTER units have -1 to hit rolls and +4 S." },
  { name: "Imperial Agents", group: "Imperium", ruleTitle: "Fine, I’ll Do It Myself", desc: "Horde IMPERIAL AGENTS attacks have +1 to hit vs CHAOS, re-roll hit/wound rolls of 1 vs IMPERIUM, and +1 to wound vs targets with neither keyword." },
  { name: "Imperial Knights", group: "Imperium", ruleTitle: "Passive Ion Shields", desc: "Horde IMPERIAL KNIGHTS models have Feel No Pain 6+." },
  { name: "Chaos Space Marines", group: "Chaos", ruleTitle: "Wonton Slaughter", desc: "Horde CHAOS SPACE MARINES units’ melee attacks have +1 A on turns that they charge." },
  { name: "Chaos Daemons", group: "Chaos", ruleTitle: "Shadow Forms", desc: "Ranged attacks against Horde LEGIONES DAEMONICA units have -1 to hit rolls unless the attacking model is within 12\"." },
  { name: "Chaos Knights", group: "Chaos", ruleTitle: "God I Wish We Had A Different Theme", desc: "Horde CHAOS KNIGHTS units’ attacks have +1 to hit rolls and +1 to wound rolls if the target is battle-shocked." },
  { name: "Death Guard", group: "Chaos", ruleTitle: "Don’t You Miss DR?", desc: "Enemy units within 6\" of Horde DEATH GUARD units have -1 T, and their attacks have -1 BS and -1 WS." },
  { name: "Emperor's Children", group: "Chaos", ruleTitle: "Elegant Violence", desc: "Each Horde EMPEROR’S CHILDREN unit is eligible to shoot and declare a charge in a turn in which it made an advance or fall-back move." },
  { name: "Thousand Sons", group: "Chaos", ruleTitle: "Psychic Storms", desc: "At the beginning of the Horde Shooting phase, each Player unit within 12\" of a Horde THOUSAND SONS unit suffers D3 mortal wounds." },
  { name: "World Eaters", group: "Chaos", ruleTitle: "Bloodthirsty", desc: "Horde WORLD EATERS units have +2\" M." },
  { name: "Aeldari", group: "Xenos", ruleTitle: "Monomolecular Ammunition", desc: "Horde AELDARI units’ ranged attacks have +1 AP." },
  { name: "Drukhari", group: "Xenos", ruleTitle: "Monomolecular Edges", desc: "Horde DRUKHARI units’ melee attacks have +1 AP." },
  { name: "Necrons", group: "Xenos", ruleTitle: "We’re So Back", desc: "Horde NECRON non-CHARACTER INFANTRY, BEAST, and SWARM models have Feel No Pain 5+." },
  { name: "T'au Empire", group: "Xenos", ruleTitle: "Glasses", desc: "When a Horde T’AU EMPIRE unit is selected to shoot, roll one D6: on a 4+, the unit's attacks have +1 BS." },
  { name: "Orks", group: "Xenos", ruleTitle: "High (Green) Tide", desc: "On the third battle round reveal one additional Misery card, add 1 to Spawn Rolls, and Horde ORKS models have +3\" M." },
  { name: "Leagues of Votann", group: "Xenos", ruleTitle: "Grudge Game", desc: "Whenever an unmarked unit destroys a Horde LEAGUES OF VOTANN unit, mark it. Horde VOTANN attacks against marked units have +1 to hit and +1 to wound." },
  { name: "Tyranids", group: "Xenos", ruleTitle: "Neurons Activated", desc: "Each time a Horde TYRANIDS unit makes a battle-shock roll, roll 3D6 instead of 2D6. Horde TYRANIDS units’ melee attacks have +1 S." },
  { name: "Genestealer Cults", group: "Xenos", ruleTitle: "Should Have Just Been A 5+ FNP", desc: "Whenever a Horde GSC INFANTRY or MOUNTED unit is destroyed, roll 1D6: on a 5+ set it aside and respawn an identical unit in any Spawn Zone at the start of the next battle round!" }
];

// 2. SECRET OBJECTIVES (1-34)
const OBJECTIVES = [
  { id: 1, code: "A9F", name: "1 - Forward Extraction", tags: "End of Game", desc: "End the game with at least one unit wholly within a Horde Spawn Zone." },
  { id: 2, code: "B4K", name: "2 - A Noble Sacrifice", tags: "Early Reveal", desc: "Reveal and complete at the end of your turn if there is at least one CHARACTER unit from your army within range of the Attacker’s Home Objective." },
  { id: 3, code: "C8M", name: "3 - Cleanse Sacred Ground", tags: "End of Game", desc: "End the game controlling at least one objective in No Man’s Land with no other players or Horde units within range of the objective." },
  { id: 4, code: "D2P", name: "4 - Take Research Subjects", tags: "Early Reveal", desc: "Reveal and complete after destroying an enemy unit in the Fight phase that was within the Defender’s deployment zone." },
  { id: 5, code: "E7Q", name: "5 - Recover the Lost Relic", tags: "Action, Early Reveal, Survival Required", desc: "Reveal in Shooting phase (Round 3+). Action: 1 CHARACTER wholly within 6\" of center; completes end of your Command phase. Must survive." },
  { id: 6, code: "F3R", name: "6 - Two Birds, One Stone", tags: "End of Game, Multiplayer, Traitor", desc: "End the game with at least one other player not surviving." },
  { id: 7, code: "G6T", name: "7 - Team Player", tags: "End of Game, Multiplayer", desc: "End the game with all players surviving." },
  { id: 8, code: "H1V", name: "8 - Majority Rules", tags: "End of Game, Multiplayer, Traitor", desc: "End the game with the most units of any player on the battlefield." },
  { id: 9, code: "J5W", name: "9 - VIP", tags: "End of Game", desc: "End the game with your Warlord’s unit wholly within No Man’s Land at starting strength." },
  { id: 10, code: "K9X", name: "10 - Rear Extraction", tags: "End of Game", desc: "End the game with all of your units wholly within the Defender’s deployment zone." },
  { id: 11, code: "L2Y", name: "11 - Show Off", tags: "Early Reveal / End of Game", desc: "Reveal and complete when you spend 15 or more Supply Points during a single Resupply Step." },
  { id: 12, code: "M8Z", name: "12 - Kill Confirmed", tags: "Early Reveal", desc: "Reveal and complete after a Horde CHARACTER model is destroyed while engaged with one of your CHARACTER units." },
  { id: 13, code: "N4B", name: "13 - Master Sculptor", tags: "Secret Tally, Early Reveal, Survival Required", desc: "Tally uses of Air Strike and Defensive Positions. Reveal and complete after 5th total tally. Must survive." },
  { id: 14, code: "P7C", name: "14 - Hand of Fate", tags: "End of Game", desc: "Succeed in at least 7 Secondary Missions by the end of the game." },
  { id: 15, code: "Q3D", name: "15 - Saboteur", tags: "Early Reveal, Multiplayer, Traitor, Survival Required", desc: "At end of Round 5, before resolving active Secondary Missions, reveal if at least one Secondary Mission failed this game. Must survive." },
  { id: 16, code: "R6F", name: "16 - Hold the Line", tags: "End of Game", desc: "End the game with no Horde units within the Defender’s deployment zone." },
  { id: 17, code: "S1G", name: "17 - Pure Spite", tags: "Early Reveal, Multiplayer, Traitor", desc: "Reveal and complete after another player’s Warlord is destroyed." },
  { id: 18, code: "T5H", name: "18 - Aspect of Change", tags: "End of Game", desc: "End the game with 2 units you spawned via Field Promotion on the battlefield." },
  { id: 19, code: "U9J", name: "19 - Benevolence", tags: "Secret Tally, Early Reveal, Multiplayer", desc: "Tally uses of Share Supplies you purchase. Reveal and complete after 5th tally." },
  { id: 20, code: "V2K", name: "20 - Tacticool", tags: "Secret Tally, Early Reveal, Survival Required", desc: "Tally times you use at least 1 CP on a stratagem. Reveal after 8th tally. Must survive." },
  { id: 21, code: "W8L", name: "21 - Camp Counselor", tags: "Secret Tally, Early Reveal, Multiplayer, Survival Required", desc: "Tally times you remove battle-shock from another player’s unit via Pizza Party. Reveal after 2nd tally. Must survive." },
  { id: 22, code: "X4M", name: "22 - Adornable", tags: "Secret Tally, Early Reveal, Survival Required", desc: "Tally objectives you fortify. Reveal after 3rd tally. Must survive." },
  { id: 23, code: "Y7N", name: "23 - Acceptable Collateral", tags: "Early Reveal, Multiplayer, Traitor, Survival Required", desc: "Reveal after destroying >=1 Horde model and >=1 other player's model with a single Artillery Strike. Must survive." },
  { id: 24, code: "Z3P", name: "24 - Action Hero", tags: "Action, Early Reveal", desc: "Reveal & complete after a CHARACTER you own completes any Secondary Mission action. OR reveal at start of Shooting phase (Round 3+) for Put on Sunglasses Action (1 CHARACTER wholly within 6\" of center; completes end of turn if no Horde within 8\")." },
  { id: 25, code: "A6Q", name: "25 - Triangulate Signal", tags: "Action, Early Reveal", desc: "Reveal in Shooting phase (Round 3+). Action: 3 units within range of 3 different objectives with no Horde in range. Completes end of turn if controlled." },
  { id: 26, code: "B1R", name: "26 - Destroy the Evidence", tags: "Action, Early Reveal, Multiplayer, Traitor", desc: "Reveal in Shooting phase (Round 3+). Action: 1 unit within range of an objective. Completes end of turn if controlled: Destroy unit & all units in range; units within 9\" (6\" terrain) take D6 MW; remove objective; next round add Debris Storm." },
  { id: 27, code: "C5S", name: "27 - Lancelot", tags: "Secret Tally, Early Reveal", desc: "Tally Horde MONSTER, VEHICLE, and CHARACTER models you destroy (10+ W = 2; TITANIC = 3). Reveal and complete after 4th tally." },
  { id: 28, code: "D9T", name: "28 - Chaos Incarnate", tags: "Secret Tally, Early Reveal, Multiplayer, Traitor", desc: "Tally Misery cards activated over the game. Reveal after 9th tally, even if removed. Complete if >=1 other player survives and you did not." },
  { id: 29, code: "E2U", name: "29 - Deus Ex Machina", tags: "Early Reveal, Multiplayer", desc: "Reveal after you are removed from the game. Spend saved Secondary Reward Cards, SP, and CP as though you were any surviving player. Complete after 13th tally of SP/CP spent while removed." },
  { id: 30, code: "F8V", name: "30 - Supervisor", tags: "Secret Tally, Early Reveal, Multiplayer, Traitor, Survival Required", desc: "Tally Horde units destroyed by yourself vs. all other players combined. Reveal when your tally is at least 4 less than other players. Must survive." },
  { id: 31, code: "G4W", name: "31 - All For One", tags: "Secret Tally, Early Reveal, Multiplayer, Traitor, Survival Required", desc: "Tally times another Player uses Share Supplies targeting you. Reveal after 5th tally. Must survive." },
  { id: 32, code: "H7X", name: "32 - Meatball Surgeon", tags: "Secret Tally, Early Reveal, Multiplayer", desc: "Tally wounds other players’ units heal from your uses of Patched Up. Reveal and complete after 12th tally." },
  { id: 33, code: "J3Y", name: "33 - Traffic Jam", tags: "Early Reveal, Traitor, Survival Required", desc: "Reveal and complete when a Horde unit is destroyed by the Horde Spawn Zone during Spawn The Horde step. Must survive." },
  { id: 34, code: "K6Z", name: "34 - Vainglorious", tags: "Secret Tally, Multiplayer, End of Game", desc: "Tally Horde units destroyed by yourself vs. each other player. End the game with 2 more marks on your tally than any other player’s." }
];

// 3. MISERY DECK (1-36)
const MISERIES = [
  { id: 1, name: "1 - Unnatural Stamina", desc: "Horde units are eligible to shoot and declare a charge in a turn in which they made an advance move." },
  { id: 2, name: "2 - Grudge Match", desc: "Horde unit attacks have +1 to hit rolls and +1 to wound rolls." },
  { id: 3, name: "3 - Rip and Tear", desc: "Horde unit attacks have +1 AP." },
  { id: 4, name: "4 - Blistering Speed", desc: "Do not roll advance or charge rolls for the Horde. Advance rolls are automatically 6 and charge rolls are automatically 12." },
  { id: 5, name: "5 - Untouchable", desc: "Horde models have a 4+ invulnerable save (or improve existing 4+ invulnerable save by 1)." },
  { id: 6, name: "6 - Stray Orbital Bombardment", desc: "Split battlefield into a 2x3 grid (1–6). Roll 1D6: each unit within the rolled area suffers 2D3 mortal wounds." },
  { id: 7, name: "7 - Unlucky Night", desc: "When making Spawn Rolls for the Horde, roll 3D6 and discard the lowest." },
  { id: 8, name: "8 - Death Denied", desc: "Each Horde unit heals 13 wounds." },
  { id: 9, name: "9 - Terrifying Shockwave", desc: "All Player battle-shock rolls automatically fail." },
  { id: 10, name: "10 - Planetquake", desc: "Select one terrain area wholly outside Attacker’s deployment zone at random. Air Strike (2D3 MW & remove terrain) activates on it." },
  { id: 11, name: "11 - Errant Explosion", desc: "Randomly select one objective in No Man’s Land and destroy it." },
  { id: 12, name: "12 - Nowhere is Safe", desc: "Destroy all objectives in the Defender’s deployment zone." },
  { id: 13, name: "13 - Pincer Maneuver", desc: "Spawn an extra Horde unit into strategic reserves with Deep Strike. Next Horde Movement phase it ingresses >3\" from Player units (in Player DZ if able, else NML)." },
  { id: 14, name: "14 - No Hard Feelings", desc: "Randomly select a player and set their SP to 0 (in Single Player, reveal 2 more Misery Cards instead)." },
  { id: 15, name: "15 - Bad Investment", desc: "Remove 5 SP from all players (minimum 0)." },
  { id: 16, name: "16 - Fair and Balanced", desc: "Horde unit attacks have [DEVASTATING WOUNDS]." },
  { id: 17, name: "17 - Unfettered Fury", desc: "Horde unit attacks have [SUSTAINED HITS 1] and [LETHAL HITS 1]." },
  { id: 18, name: "18 - A Worthless Sacrifice", desc: "Players discuss and secretly vote for a Player unit to be destroyed. If not unanimous, randomly select from units with >=1 vote." },
  { id: 19, name: "19 - Fog of War", desc: "Horde models have Stealth and are Hidden." },
  { id: 20, name: "20 - Lamentable Luck", desc: "Reveal 2 more Misery cards!" },
  { id: 21, name: "21 - Bunkers Busted", desc: "Remove all fortified markers from all objectives. Players cannot make Fortify purchases." },
  { id: 22, name: "22 - Comms Jammed", desc: "Players cannot use stratagems or spend CP. Players cannot make Supply, Spawn, or Strike purchases." },
  { id: 23, name: "23 - The Mind Killer", desc: "Player units must each make a battle-shock roll, then remove all Enhancements/Upgrades from battle-shocked units. No Tactics purchases." },
  { id: 24, name: "24 - Seller’s Market", desc: "The SP cost of all purchases is doubled." },
  { id: 25, name: "25 - Hotter Shots", desc: "Horde unit ranged attacks have [MELTA 1]." },
  { id: 26, name: "26 - Sinking Showboats", desc: "Horde unit ranged attacks have [PRECISION] and [IGNORE COVER]." },
  { id: 27, name: "27 - Chitinous Growths", desc: "Attacks that target Horde units have -1 S and -1 AP." },
  { id: 28, name: "28 - They Fly Now", desc: "Horde units have FLY and TOWERING. Ignore all terrain for visibility on Horde ranged attacks." },
  { id: 29, name: "29 - Fate’s Fetters", desc: "Remove 4 SP from player with most SP. Reveal 3 extra Secondary Missions (ignore limit this round). No Secondary purchases." },
  { id: 30, name: "30 - Aim for the Heads", desc: "When a Horde model is destroyed, roll D6: on 4+, after attacking unit finishes, it fights (in Fight phase) or shoots before being removed." },
  { id: 31, name: "31 - Debris Storm", desc: "Player units must re-roll unmodified hit rolls of 6." },
  { id: 32, name: "32 - Glowing Eyes", desc: "Each time a Horde model makes an attack, they may re-roll the hit roll." },
  { id: 33, name: "33 - Danger Close", desc: "Horde ranged attacks have [BLAST 1]. Horde melee attacks have [CLEAVE 1]." },
  { id: 34, name: "34 - Surging Power", desc: "Horde unit attacks have +1 S and [PSYCHIC]." },
  { id: 35, name: "35 - Experimental Ammunition", desc: "Player unit ranged attacks have +1 S, +1 AP, and [HAZARDOUS]." },
  { id: 36, name: "36 - Flash Flood", desc: "Player units have -2\" M (min 4\") and -2 to advance and charge rolls (min 1)." }
];

// 4. SECONDARY MISSIONS (1-24)
const SECONDARIES = [
  { id: 1, r1Skip: false, name: "1 - Secure Drop Zones", cond: "Randomly select 2 objectives in NML. Control them at end of round.", rew: "3 SP. 1 random player saves card (free Tactics purchase).", pun: "+1 Misery card." },
  { id: 2, r1Skip: false, name: "2 - Back To Basics", cond: "Tally X Horde units destroyed this round after reveal (X > 0).", rew: "(X + 1) SP.", pun: "+2 Misery cards." },
  { id: 3, r1Skip: false, name: "3 - Show No Fear", cond: "No Player units battle-shocked at end of battle round.", rew: "3 SP.", pun: "+2 Misery cards, +1 to Spawn Rolls." },
  { id: 4, r1Skip: false, name: "4 - Establish Orbital Comms", cond: "Action (Shooting): 1 INFANTRY/CHARACTER wholly within 6\" of center (Completes end of turn).", rew: "Unrevealed players use A Change of Plans.", pun: "Unrevealed players use A Change of Plans at random!" },
  { id: 5, r1Skip: false, name: "5 - Search for Supplies", cond: "Action (Shooting): 1 unit on non-home objective. End of turn if controlled, roll 4+ on D6.", rew: "3 SP. 1 random player saves card (free Supply purchase).", pun: "+2 Misery cards." },
  { id: 6, r1Skip: false, name: "6 - Clear the Evac Zone", cond: "No Horde units within Defender’s DZ at end of battle round.", rew: "3 SP.", pun: "Reinforcements Arrive is removed from Resupply Table." },
  { id: 7, r1Skip: false, name: "7 - Decapitation Strike", cond: "Destroy a Horde CHARACTER model, or have none exist at end of round.", rew: "2 SP, 2 CP.", pun: "+2 Misery cards." },
  { id: 8, r1Skip: false, name: "8 - Dragon Slayer", cond: "Destroy a Horde VEHICLE/MONSTER model or have none exist at end of round.", rew: "1 free Field Promotion to triggering player (or 2 SP).", pun: "+6 to first Spawn Roll." },
  { id: 9, r1Skip: false, name: "9 - Paint Targets", cond: "This round: No Player Fall Back moves, and no moves leaving range of objectives started in range of.", rew: "1 free Air Strike & 1 free Defensive Positions (random players).", pun: "Search & resolve Stray Orbital Bombardment immediately!" },
  { id: 10, r1Skip: false, name: "10 - Study Behaviors", cond: "Start of Player Movement: pick random Horde unit; it must not lose any wounds this round.", rew: "2 SP. 1 random player saves card (discard to nullify a Misery card).", pun: "+3 to Spawn Rolls." },
  { id: 11, r1Skip: true, name: "11 - Use It Or Lose It", cond: "Tally X SP spent this round after reveal; X must be >= 7.", rew: "Roll D6: 4+ gives X SP to random player; else 3 SP.", pun: "-3 SP, +1 Misery card." },
  { id: 12, r1Skip: false, name: "12 - Control the Battlefield", cond: "End of round: >=1 Player unit wholly in each table quarter and >6\" from center.", rew: "-1 to Spawn Rolls. 1 random player saves card (free Secondary purchase).", pun: "+1 Misery card, +1 to Spawn Rolls." },
  { id: 13, r1Skip: true, name: "13 - The Smell of Napalm", cond: "Make 2 Strike purchases this battle round.", rew: "2 SP, -1 to Spawn Rolls.", pun: "+1 Misery card, +1 to Spawn Rolls." },
  { id: 14, r1Skip: true, name: "14 - Marching on Stomachs", cond: "Make 2 Supply purchases this battle round.", rew: "1 SP. 1 random player saves card (-5 SP cost to Reinforcements Arrive).", pun: "+1 Misery card, each Horde unit heals 3 wounds." },
  { id: 15, r1Skip: false, name: "15 - Baiting the Trap", cond: "Action (Shooting): 1 unit wholly within 6\" of center (Completes end of turn).", rew: "2 SP, +12 first Spawn Roll, 1 free Deploy Minefield.", pun: "+2 Misery cards, +2 to Spawn Rolls." },
  { id: 16, r1Skip: false, name: "16 - Lead From the Front", cond: "Tally damage X (max 4) dealt to Horde by Player CHARACTERS (X > 0) and no fewer Player CHARACTERS alive at end of round.", rew: "X SP.", pun: "+1 Misery card, -1 to Player Battle-shock tests." },
  { id: 17, r1Skip: true, name: "17 - Spruce This Place Up", cond: "End of round: have at least 2 objectives fortified.", rew: "1 SP. 1 random player saves card (discard to nullify a Misery card).", pun: "+1 Misery card, Remove all Fortified Markers." },
  { id: 18, r1Skip: false, name: "18 - Calling Shots", cond: "End of Horde Movement: mark X (>=1) Horde units. Destroy all X marked units this round.", rew: "(X * 2) SP.", pun: "+X Misery cards, +X to Spawn Rolls." },
  { id: 19, r1Skip: true, name: "19 - Tactical Withdrawal", cond: "Action (Shooting): 1 unit wholly in NML and within 4\" of board edge -> enters reserves.", rew: "1 SP. Saving player gets up to 2 free Teleporters.", pun: "Next round add Pincer Maneuver to active Misery cards." },
  { id: 20, r1Skip: false, name: "20 - Insane Gambit", cond: "Scuttle Objective Action (Shooting): 1 unit on controlled objective -> remove objective.", rew: "4 SP. 1 random player saves card (free Fortify purchase).", pun: "+2 Misery cards." },
  { id: 21, r1Skip: true, name: "21 - Stabilize Warp Beacons", cond: "Action (Shooting): 3–4 units in different quarters >6\" from center. Roll D6 (+1 if 4) per unit: 1–2 destroys unit!", rew: "1 SP, 1 free Reinforcements Arrive to a completing player.", pun: "+2 Misery cards." },
  { id: 22, r1Skip: false, name: "22 - Confirm Kills", cond: "Mark all Horde units that lose wounds. No marked Horde units alive at end of round.", rew: "3 SP, -1 to Spawn Rolls.", pun: "+2 to Spawn Rolls." },
  { id: 23, r1Skip: false, name: "23 - Secure the LZ", cond: "Action (Shooting): 3 units wholly in Defender DZ and >6\" apart.", rew: "Next Resupply: first purchase for each player costs -3 SP.", pun: "+1 Misery card & add Comms Jammed next round." },
  { id: 24, r1Skip: true, name: "24 - VIP Delivery", cond: "Action (Shooting): 1 VEHICLE/MONSTER within 6\" of center.", rew: "3 SP.", pun: "+1 Misery card." }
];

// 5. RESUPPLY TABLE (7.1)
const RESUPPLIES = [
  { cost: 1, name: "A Name Earned", tags: "Tactics", desc: "Add an Enhancement to a Character or Upgrade to a unit." },
  { cost: 2, name: "Basic Tactics", tags: "Tactics", desc: "Gain 1 CP.", autoCP: 1 },
  { cost: 3, name: "Air Strike", tags: "Strike", desc: "Select terrain area: units inside take 2D3 MW, remove terrain." },
  { cost: 3, name: "Short Range Teleporter", tags: "Supply", desc: "Place 40mm Teleporter wholly within 3\" of unengaged unit (max 3)." },
  { cost: 3, name: "Forward Operating Base", tags: "Fortify", desc: "Fortify objective: gain +1 extra SP when controlling objectives." },
  { cost: 3, name: "Pizza Party", tags: "Tactics, Supply", desc: "Remove battle-shock from any player's unit." },
  { cost: 3, name: "Share Supplies", tags: "Tactics", desc: "Grant 2 SP to another player." },
  { cost: 3, name: "Supply Drop", tags: "Supply", desc: "Add new objective to NML >=6\" from edges/objs (max 6 objs)." },
  { cost: 4, name: "Experimental Defenses", tags: "Fortify", desc: "Fortify (Warp-Relic): Start of Player Fight phase, Horde within 6\" take 3 MW (engaged Players 1 MW)." },
  { cost: 4, name: "Defensive Positions", tags: "Supply, Fortify", desc: "Set up 9\"x9\" dense ruin >=3\" from terrain (1/turn limit)." },
  { cost: 4, name: "Deploy Razor Wire", tags: "Supply, Strike", desc: "Place 40mm marker within 3\" (max 2): D3 MW on move, -1\" M, -2 Adv/Charge." },
  { cost: 4, name: "Emergency Shovel Stash", tags: "Fortify", desc: "Fortify (War Trench): Friendly melee has +1 S and +1 AP wholly within range." },
  { cost: 4, name: "Field Hospital", tags: "Fortify", desc: "Fortify (MASH): End of Movement, Player units wholly within range heal 3 wounds." },
  { cost: 4, name: "Tempt Fate", tags: "Secondary", desc: "Reveal a 2nd Secondary Mission this round (1/turn limit)." },
  { cost: 5, name: "Activate Jamming Station", tags: "Fortify", desc: "Fortify: -1 to Horde Spawn Rolls while controlled." },
  { cost: 5, name: "Advanced Tactics", tags: "Secondary, Tactics", desc: "Remove 1 active Secondary Mission and reveal a new one (1/turn limit)." },
  { cost: 5, name: "Ammo Supplies", tags: "Fortify", desc: "Fortify (Ammo Dump): Friendly ranged has [SUSTAINED HITS 1] wholly within range." },
  { cost: 5, name: "Emergency Evac", tags: "Tactics", desc: "Place unengaged unit into strategic reserves; ingress next Movement phase." },
  { cost: 6, name: "Activate Shield Generator", tags: "Fortify", desc: "Fortify: Friendly units wholly within range get FNP 5+ vs outside ranged attacks." },
  { cost: 6, name: "Deploy Minefield", tags: "Supply, Strike", desc: "40mm marker in NML >6\" from enemies/objs (max 1): D6 MW on move (removes at 10 dmg)." },
  { cost: 8, name: "A Change of Plans", tags: "Tactics", desc: "Draw 2 Secret Objectives; pick 1 or keep original." },
  { cost: 8, name: "Artillery Strike", tags: "Strike", desc: "Marker >2\" from models. End of next Fight phase, roll D6 per model within 9\": 5+ deals 1 MW (3 MW Monster/Vehicle)." },
  { cost: 12, name: "Reinforcements Arrive", tags: "Spawn", desc: "Roll 2D6 and add a unit from your army's Spawning Table to strategic reserves." },
  { cost: 0, varCost: true, name: "Patched Up", tags: "Tactics", desc: "Pay X SP to heal X wounds on an unengaged Player unit (1/turn)." },
  { cost: 0, varCost: true, name: "Field Promotion", tags: "Spawn", desc: "Destroy unengaged unit, roll 1D6 + min bracket, pay X SP equal to roll to upgrade (1/turn)." },
  { cost: 0, varCost: true, name: "Deploy Fortification", tags: "Supply, Fortify", desc: "Pay X SP equal to min bracket for a FORTIFICATION with Deep Strike (1/turn)." }
];

// 6. HARD MODE ROUND PROGRESSION
const HARD_MODE_ROUNDS = [
  null,
  { misery: 1, spawnModNum: 0, spawnMod: "+0 to Spawn Rolls" },
  { misery: 1, spawnModNum: 1, spawnMod: "+1 to Spawn Rolls" },
  { misery: 2, spawnModNum: 2, spawnMod: "+2 to Spawn Rolls" },
  { misery: 2, spawnModNum: 3, spawnMod: "+3 to Spawn Rolls" },
  { misery: 3, spawnModNum: 3, spawnMod: "+3 to Spawn Rolls" },
  { misery: 3, spawnModNum: -99, spawnMod: "NO SPAWNS • Final Horde Onslaught!" }
];

// 7. CANONICAL DEFAULT HORDE SPAWN TABLES FOR ALL 23 OFFICIAL FACTIONS
const HORDE_FACTION_SPAWN_TABLES = {
  "Space Marines": {
    b34: ["5 Scout Squad", "5 Assault Intercessors", "5 Infernus Squad", "3 Outriders", "1 Invader ATV"],
    b56: ["10 Intercessor Squad", "5 Hellblasters", "3 Bladeguard Veterans", "5 Jump Pack Intercessors", "1 Ballistus Dreadnought"],
    b79: ["5 Terminator Squad + Captain", "6 Aggressor Squad", "1 Redemptor Dreadnought", "1 Gladiator Lancer", "1 Repulsor"],
    b10: ["1 Land Raider Redeemer + 6 Bladeguard", "10 Terminators + Chaplain", "1 Roboute Guilliman / Chapter Master Retinue"],
    b13: ["1 Astraeus Super-heavy Tank", "1 Thunderhawk Gunship", "1 Warlord Titan Battlegroup Support"]
  },
  "Adepta Sororitas": {
    b34: ["10 Battle Sisters Squad", "5 Seraphim Squad", "10 Sisters Novitiate", "1 Sororitas Rhino", "1 Mortifier"],
    b56: ["10 Dominion Squad + Immolator", "5 Zephyrim Squad", "5 Celestian Sacresants", "1 Castigator Tank", "1 Exorcist"],
    b79: ["3 Paragon Warsuits + Morvenn Vahl", "10 Repentia + Mistress", "1 Triumph of Saint Katherine", "2 Penitent Engines"],
    b10: ["Morvenn Vahl + 3 Paragon Warsuits", "1 Saint Celestine + 10 Zephyrim", "1 Exorcist Battery Phalanx"],
    b13: ["1 Sororitas Sanctum Super-Heavy", "1 Thunderhawk Transporter", "1 Warhound Titan Empyric Purifier"]
  },
  "Adeptus Custodes": {
    b34: ["4 Custodian Guard Squad", "5 Prosecutors (Sisters of Silence)", "5 Witchseekers", "1 Allarus Terminator"],
    b56: ["5 Custodian Wardens", "3 Allarus Custodians", "2 Vertus Praetors", "1 Venerable Contemptor Dreadnought"],
    b79: ["6 Custodian Wardens + Blade Champion", "1 Caladius Grav-tank", "1 Achillus Contemptor", "1 Telemon Heavy Dreadnought"],
    b10: ["Trajann Valoris + 5 Wardens", "1 Telemon Heavy Dreadnought + Caladius", "1 Land Raider Venerable"],
    b13: ["1 Orion Assault Dropship", "1 Ares Gunship", "1 Legio Custodes Titan Battle-Asset"]
  },
  "Adeptus Mechanicus": {
    b34: ["10 Skitarii Vanguard", "10 Skitarii Rangers", "5 Pteraxii Skystalkers", "3 Sydonian Dragoons", "3 Serberys Raiders"],
    b56: ["6 Kataphron Breachers", "5 Sicarian Ruststalkers", "1 Onager Dunecrawler", "1 Skorpius Disintegrator"],
    b79: ["6 Kataphron Destroyers + Tech-Priest Dominus", "2 Kastelan Robots + Datasmith", "1 Skorpius Dunerider + Electro-Priests"],
    b10: ["Belisarius Cawl + 6 Breachers", "4 Kastelan Robots + Datasmith", "1 Dunecrawler Battery"],
    b13: ["1 Knight Castellan Mechanicus", "1 Ordinatus Minoris Siege Engine", "1 Titan Battlegroup Support"]
  },
  "Astra Militarum": {
    b34: ["10 Cadian Shock Troops", "10 Catachan Jungle Fighters", "10 Death Korps of Krieg", "1 Scout Sentinel", "1 Heavy Weapons Squad"],
    b56: ["20 Cadian Shock Troops + Command Squad", "1 Rogal Dorn Battle Tank", "1 Leman Russ Demolisher", "2 Armoured Sentinels", "1 Chimera + 10 Kasrkin"],
    b79: ["1 Lord Solar Leontus + Retinue", "1 Leman Russ Battle Tank + Leman Russ Executioner", "1 Rogal Dorn Battle Tank + Techpriest", "3 Basilisk Artillery Battery"],
    b10: ["1 Baneblade Super-Heavy Tank", "1 Shadowsword Titan-Killer", "1 Stormsword Siege Tank"],
    b13: ["1 Banesword Super-Heavy", "1 Mars-Pattern Warhound Titan", "1 Emperor's Fist Tank Company"]
  },
  "Grey Knights": {
    b34: ["5 Strike Squad", "5 Interceptor Squad", "5 Purifier Squad", "1 Razorback"],
    b56: ["5 Terminator Squad", "5 Paladin Squad", "1 Nemesis Dreadknight", "1 Brotherhood Librarian"],
    b79: ["1 Nemesis Dreadknight (Grand Master)", "10 Paladins + Grand Master Voldus", "1 Grey Knights Land Raider Redeemer"],
    b10: ["1 Kaldor Draigo + 5 Paladins", "2 Nemesis Dreadknights", "1 Grand Master in Nemesis Dreadknight + Retinue"],
    b13: ["1 Grey Knights Thunderhawk Gunship", "3 Nemesis Dreadknight Strike Force", "1 Warlord Titan Banisher Protocol"]
  },
  "Imperial Agents": {
    b34: ["10 Imperial Navy Breachers", "10 Exaction Squad (Arbites)", "10 Subductor Squad", "1 Eversor Assassin", "1 Callidus Assassin"],
    b56: ["1 Inquisitor + 4 Henchmen", "1 Culexus Assassin", "1 Vindicare Assassin", "1 Imperial Chimera + 10 Breachers"],
    b79: ["1 Inquisitor Greyfax + 10 Kasrkin Inquisitorial Retinue", "1 Corvus Blackstar + 5 Deathwatch Veterans", "1 Deathwatch Kill Team"],
    b10: ["1 Inquisitor Lord Karamazov + Retinue", "1 Deathwatch Watch Master + 10 Veterans", "1 Blackstar Air Wing"],
    b13: ["1 Ordo Malleus Requisitioned Titan", "1 Inquisitorial Black Ship Orbital Lance", "1 Void Station Gun Battery"]
  },
  "Imperial Knights": {
    b34: ["1 Armiger Helverin", "1 Armiger Warglaive"],
    b56: ["2 Armiger Helverins", "2 Armiger Warglaives", "1 Armiger Helverin + 1 Warglaive"],
    b79: ["1 Knight Paladin", "1 Knight Errant", "1 Knight Crusader", "1 Knight Warden"],
    b10: ["1 Knight Castellan", "1 Knight Valiant", "1 Canis Rex + Sir Hekhtur"],
    b13: ["1 Acastus Knight Porphyrion", "1 Acastus Knight Asterius", "1 Warmaster Iconoclast Titan"]
  },
  "Chaos Space Marines": {
    b34: ["10 Cultist Mob", "5 Legionaries", "5 Raptors", "8 Accursed Cultists", "3 Chaos Bikers"],
    b56: ["10 Legionaries + Chaos Lord", "5 Chosen + Rhino", "5 Possessed", "5 Havocs", "1 Helbrute"],
    b79: ["5 Chaos Terminators + Sorcerer", "1 Forgefiend", "1 Maulerfiend", "1 Venomcrawler + 2 Obliterators"],
    b10: ["1 Chaos Land Raider + 10 Chosen", "1 Abaddon the Despoiler + 5 Terminators", "1 Vashtorr the Arkifane"],
    b13: ["1 Khorne Lord of Skulls", "2 Khorne Lords of Skulls", "1 Chaos Warhound Titan"]
  },
  "Chaos Daemons": {
    b34: ["3 Nurglings", "10 Blue Horrors", "5 Flesh Hounds", "3 Screamers", "5 Seekers"],
    b56: ["10 Bloodletters", "10 Plaguebearers", "10 Daemonettes", "10 Pink Horrors", "3 Flamers"],
    b79: ["6 Bloodcrushers", "1 Daemon Prince of Chaos", "1 Soul Grinder", "3 Fiends + Contorted Epitome"],
    b10: ["1 Bloodthirster", "1 Great Unclean One", "1 Lord of Change", "1 Keeper of Secrets", "1 Be'lakor the Dark Master"],
    b13: ["1 An'ggrath the Unbound", "1 Scabeiathrax the Bloated", "1 Aetaos'rau'keres", "1 Zarakynel"]
  },
  "Chaos Knights": {
    b34: ["1 War Dog Brigand", "1 War Dog Karnivore", "1 War Dog Stalker"],
    b56: ["2 War Dog Brigands", "2 War Dog Karnivores", "2 War Dog Executioners"],
    b79: ["1 Knight Abominant", "1 Knight Desecrator", "1 Knight Rampager"],
    b10: ["1 Knight Tyrant", "1 Knight Despoiler + War Dog Stalker", "1 Chaos Knight Lancer"],
    b13: ["1 Chaos Warhound Titan", "1 Acastus Knight Porphyrion Despoiler", "1 Warmaster Titan Corrupted"]
  },
  "Death Guard": {
    b34: ["10 Poxwalkers", "10 Death Guard Cultists", "5 Plague Marines", "1 Foetid Bloat-drone"],
    b56: ["10 Plague Marines + Rhino", "3 Deathshroud Terminators", "1 Plagueburst Crawler", "1 Myphitic Blight-hauler"],
    b79: ["5 Blightlord Terminators + Lord of Contagion", "2 Plagueburst Crawlers", "1 Daemon Prince of Nurgle with Wings"],
    b10: ["1 Mortarion (Daemon Primarch of Nurgle)", "1 Death Guard Land Raider + 3 Deathshroud", "1 Great Unclean One Ally"],
    b13: ["1 Nurgle Corrupted Lord of Skulls", "1 Plague Titan Bio-Colossus", "1 Great Plague Fleet Orbital Barrage"]
  },
  "Emperor's Children": {
    b34: ["10 Tormentors / Cultists", "5 Noise Marines", "5 Warp Talons", "1 Chaos Rhino"],
    b56: ["10 Noise Marines + Sonic Blasters", "5 Flawless Chosen", "1 Sonic Dreadnought / Helbrute", "5 Raptors"],
    b79: ["6 Slaanesh Fiends + Herald", "1 Daemon Prince of Slaanesh", "1 Chaos Predator Destructor + Noise Marines"],
    b10: ["1 Lucius the Eternal + 10 Noise Marines", "1 Keeper of Secrets Ally", "1 Chaos Land Raider + Chosen"],
    b13: ["1 Slaanesh Subjugator Titan", "1 Hell-Strider Chaos Titan", "1 Sonic Decimator Super-Heavy"]
  },
  "Thousand Sons": {
    b34: ["10 Tzaangors", "10 Cultists", "5 Rubric Marines", "1 Tzaangor Enlightened"],
    b56: ["10 Rubric Marines + Sorcerer", "5 Scarab Occult Terminators", "1 Mutalith Vortex Beast", "1 Chaos Spawn Phalanx"],
    b79: ["10 Scarab Occult Terminators + Sorcerer", "1 Daemon Prince of Tzeentch", "1 Forgefiend + Rubrics"],
    b10: ["1 Magnus the Red (Daemon Primarch of Tzeentch)", "1 Lord of Change Ally", "1 Thousand Sons Land Raider + Sorcerers"],
    b13: ["1 Tzeentch Corrupted Titan", "1 Silver Tower of Tzeentch", "1 Eldritch Warp Storm Cataclysm"]
  },
  "World Eaters": {
    b34: ["10 Jakhals", "5 Khorne Berzerkers", "1 Chaos Spawn", "1 World Eaters Rhino"],
    b56: ["10 Khorne Berzerkers + Master of Executions", "3 Eightbound", "1 Predator Destructor", "1 Helbrute"],
    b79: ["6 Exalted Eightbound", "1 World Eaters Daemon Prince", "1 Maulerfiend", "1 Defiler"],
    b10: ["1 Angron (Daemon Primarch of Khorne)", "1 World Eaters Land Raider + 5 Berzerkers", "1 Bloodthirster Ally"],
    b13: ["1 Khorne Lord of Skulls", "2 Khorne Lords of Skulls", "1 Khornate Warhound Titan"]
  },
  "Aeldari": {
    b34: ["10 Guardian Defenders", "5 Rangers", "5 Swooping Hawks", "5 Warp Spiders", "1 Windriders Unit"],
    b56: ["10 Dire Avengers + Wave Serpent", "5 Howling Banshees", "5 Striking Scorpions", "5 Fire Dragons", "1 Wraithlord"],
    b79: ["1 Wraithknight", "1 Fire Prism + 1 Falcon", "5 Wraithguard + Spiritseer", "1 Avatar of Khaine"],
    b10: ["1 Avatar of Khaine + Farseer", "1 Wraithknight + 5 Wraithblades", "1 Eldrad Ulthran + 10 Guardians"],
    b13: ["1 Revenant Titan", "1 Phantom Titan", "1 Scorpion Super-Heavy Grav Tank"]
  },
  "Drukhari": {
    b34: ["10 Kabalite Warriors", "10 Wyches", "10 Wracks", "1 Venom", "3 Reavers"],
    b56: ["1 Raider + 10 Kabalites", "5 Incubi + Archon", "1 Talos", "1 Cronos", "5 Scourges"],
    b79: ["2 Talos Pain Engines", "1 Ravager Gunship", "10 Incubi + Drazhar", "1 Voidraven Bomber"],
    b10: ["1 Drazhar + 10 Incubi + Raider", "1 Tantalus Super-Skimmer", "3 Talos Pain Engine Phalanx"],
    b13: ["1 Drukhari Tormentor Titan Barge", "1 Dark City Dais of Destruction", "1 Commorragh Spire Leviathan"]
  },
  "Necrons": {
    b34: ["10 Necron Warriors", "5 Flayed Ones", "3 Canoptek Scarab Swarms", "5 Deathmarks", "3 Ophydian Destroyers"],
    b56: ["10 Immortals + Chronomancer", "3 Skorpekh Destroyers", "3 Canoptek Wraiths", "1 Canoptek Doomstalker", "1 Triarch Stalker"],
    b79: ["10 Lychguard + Overlord", "1 Doomsday Ark", "6 Lokhust Destroyers", "1 C'tan Shard of the Nightbringer"],
    b10: ["1 Monolith", "1 C'tan Shard of the Void Dragon", "1 The Silent King (Szarekh)"],
    b13: ["1 Tesseract Vault", "1 Seraptek Heavy Construct", "1 Obelisk + Monolith Phalanx"]
  },
  "T'au Empire": {
    b34: ["10 Breacher Team", "10 Strike Team", "10 Kroot Carnivores", "3 Stealth Battlesuits", "1 Piranha"],
    b56: ["3 Crisis Battlesuits + Commander", "1 Devilfish + 10 Breachers", "1 Broadside Battlesuit", "1 Ghostkeel Battlesuit"],
    b79: ["1 Hammerhead Gunship", "1 Commander Farsight + 3 Crisis Suits", "1 Riptide Battlesuit", "1 Sky Ray Gunship"],
    b10: ["1 Stormsurge Ballistic Suit", "2 Broadside Battlesuits + Riptide", "1 Commander Shadowsun + Riptide"],
    b13: ["1 Ta'unar Supremacy Armour", "1 Tiger Shark Fighter-Bomber", "1 Manta Super-Heavy Dropship"]
  },
  "Orks": {
    b34: ["10 Gretchin + Runtherd", "10 Boyz", "5 Stormboyz", "3 Warbikers", "1 Deffkopta"],
    b56: ["20 Boyz + Warboss", "10 Beast Snagga Boyz", "5 Nobz + Trukk", "3 Meganobz", "1 Deff Dread"],
    b79: ["1 Battlewagon + 10 Nobz", "1 Kill Rig", "6 Squighog Boyz + Beastboss", "1 Gorkanaut"],
    b10: ["1 Ghazghkull Thraka + 6 Meganobz", "1 Morkanaut + Mek", "1 Gargantuan Squiggoth"],
    b13: ["1 Stompa", "2 Stompa Mob", "1 Great Gargant Support"]
  },
  "Leagues of Votann": {
    b34: ["10 Hearthkyn Warriors", "3 Hernkyn Pioneers", "5 Brôkhyr Thunderkyn", "1 Sagitaur"],
    b56: ["5 Einhyr Hearthguard", "5 Cthonian Beserks", "1 Sagitaur + 5 Warriors", "1 Brôkhyr Iron-master + Retinue"],
    b79: ["1 Hekaton Land Fortress", "10 Einhyr Hearthguard + Kâhl", "1 Hekaton Land Fortress + Beserks"],
    b10: ["1 Hekaton Land Fortress + 5 Hearthguard", "1 Ûthar the Destined + 10 Hearthguard", "2 Hekaton Land Fortresses"],
    b13: ["1 Colossus Mobile Mining Rig", "1 Votann Void-Harvester Dreadnought", "1 Hearthguard Grand Battery"]
  },
  "Tyranids": {
    b34: ["10 Termagants", "10 Hormagaunts", "5 Barbgaunts", "10 Gargoyles", "3 Von Ryan's Leapers"],
    b56: ["10 Genestealers + Broodlord", "3 Tyranid Warriors", "3 Zoanthropes", "1 Lictor", "1 Biovore + Pyrovores"],
    b79: ["1 Screamer-Killer", "1 Trygon", "1 Exocrine", "1 Haruspex", "1 Maleceptor"],
    b10: ["1 Norn Emissary", "1 Hive Tyrant + 3 Tyrant Guard", "1 Tyrannofex + 1 Psychophage"],
    b13: ["1 Hierophant Bio-Titan", "1 Harridan Sky-Terror", "1 Scythed Hierodule"]
  },
  "Genestealer Cults": {
    b34: ["10 Neophyte Hybrids", "5 Acolyte Hybrids", "5 Purestrain Genestealers", "1 Achilles Ridgerunner", "5 Atalan Jackals"],
    b56: ["10 Hybrid Metamorphs", "1 Goliath Truck + 10 Neophytes", "1 Aberrants Squad (5)", "1 Patriarch + Magus"],
    b79: ["10 Aberrants + Abominant", "1 Goliath Rockgrinder + 5 Aberrants", "1 Cult Leman Russ Demolisher"],
    b10: ["1 Patriarch + 10 Purestrains + 10 Aberrants", "1 Cult Baneblade Super-Heavy", "2 Goliath Rockgrinders"],
    b13: ["1 Cult-Hijacked Warhound Titan", "1 Subterranean Burrowing Bio-Colossus", "1 Grand Insurrection Overwhelming Wave"]
  }
};

// Browser global exposure
if (typeof window !== 'undefined') {
  window.HORDE_FACTIONS = HORDE_FACTIONS;
  window.OBJECTIVES = OBJECTIVES;
  window.MISERIES = MISERIES;
  window.HARD_MODE_ROUNDS = HARD_MODE_ROUNDS;
  window.HORDE_FACTION_SPAWN_TABLES = HORDE_FACTION_SPAWN_TABLES;
}

// Dual export for Node.js test runner and browser global scope
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    HORDE_FACTIONS,
    OBJECTIVES,
    MISERIES,
    SECONDARIES,
    RESUPPLIES,
    HARD_MODE_ROUNDS,
    HORDE_FACTION_SPAWN_TABLES
  };
}
````

---

## File: `js/rng.js` <a id="file-jsrngjs"></a>

````javascript
// PRNG & Seed Hashing Engine

/**
 * 32-bit FNV-1a hash algorithm for deterministic string-to-integer hashing.
 */
function hashString(str) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 16777619);
  }
  return h >>> 0;
}

/**
 * Mulberry32 32-bit Pseudo-Random Number Generator.
 * Returns a generator function yielding uniform floats in [0, 1).
 */
function mulberry32(a) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

/**
 * Seeded Fisher-Yates shuffle that immutably returns a new shuffled array.
 */
function seededShuffle(arr, rng) {
  let copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Expanded pool of 60 Warhammer 40,000 & Armageddon Crusade room code prefixes.
 */
const ROOM_CODE_PREFIXES = [
  "HADES", "ASH", "GATE", "THOR", "VULK", "SKULL", "WARP", "IRON", "PYRE", "HIVE",
  "GOLGOTHA", "ACHERON", "INFERNUS", "TARTARUS", "TEMPESTORA", "HELSREACH", "VOLCANUS",
  "PALATINE", "KRIEG", "VARKAN", "EXILE", "JUNEBUG", "YARRICK", "GRIMALDUS", "ANGRON",
  "KHORNE", "MALEFACTOR", "SANCTUARY", "BASTION", "VANGUARD", "BASILISK", "BANEBLADE",
  "VALKYRIE", "DREAD", "RELIC", "CHIMERA", "VANQUISHER", "ROGAL", "MORTAR", "TRENCH",
  "BUNKER", "SIEGE", "AUSPEX", "VOX", "ORBITAL", "VOID", "NECRON", "TYRANID",
  "DAEMON", "MARAUDER", "DESECRATOR", "GATEBREAKER", "SECTOR", "CITADEL", "PROMETHIUM",
  "OBSIDIAN", "SULFUR", "CINDER", "REDANGEL", "WRATH"
];

/**
 * Generates a thematic room code like HADES-42 or HELSREACH-84.
 */
function generateRandomCode() {
  const prevCode = (typeof document !== 'undefined' && document.getElementById('seedInput')?.value)
    ? document.getElementById('seedInput').value.trim().toUpperCase()
    : '';
  let code = '';
  for (let attempt = 0; attempt < 10; attempt++) {
    const p = ROOM_CODE_PREFIXES[Math.floor(Math.random() * ROOM_CODE_PREFIXES.length)];
    const n = Math.floor(10 + Math.random() * 90);
    code = `${p}-${n}`;
    if (code !== prevCode) break;
  }
  if (typeof document !== 'undefined') {
    const el = document.getElementById('seedInput');
    if (el) {
      el.value = code;
      if (typeof window !== 'undefined' && typeof window.onRoomCodeChanged === 'function') {
        window.onRoomCodeChanged();
      }
    }
  }
  return code;
}

// Dual export for Node.js test runner and browser global scope
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    hashString,
    mulberry32,
    seededShuffle,
    generateRandomCode,
    ROOM_CODE_PREFIXES
  };
}

````

---

## File: `js/spawner.js` <a id="file-jsspawnerjs"></a>

````javascript
// Spawner and Bracket Evaluation Engine

const DOWN_MAP = {
  '13+': '10-12',
  '10-12': '7-9',
  '10+': '7-9',
  '7-9': '5-6',
  '5-6': '3-4'
};

const LABEL_MAP = {
  '10-12': { label: 'Bracket [10–12] (Rolled Down x2)', pts: '301–550 pts each' },
  '10+': { label: 'Bracket [10–12] (Rolled Down x2)', pts: '301–550 pts each' },
  '7-9': { label: 'Bracket [7–9] (Rolled Down x2)', pts: '151–300 pts each' },
  '5-6': { label: 'Bracket [5–6] (Rolled Down x2)', pts: '76–150 pts each' },
  '3-4': { label: 'Bracket [3–4] (Rolled Down x2)', pts: '0–75 pts each' }
};

/**
 * Evaluates the spawn bracket from the 2D6 roll and modified total.
 * Rules: Unmodified 2 is always No Spawn. Modified <= 2 is No Spawn.
 * 3–4: 0–75 pts | 5–6: 76–150 pts | 7–9: 151–300 pts | 10–12: 301–550 pts | 13+: 551+ pts
 */
function getBracketInfo(modRoll, unmodRoll) {
  if (unmodRoll === 2 || modRoll <= 2) {
    return { key: 'NONE', label: 'No Spawn (Roll of 2)', pts: '0 pts' };
  }
  if (modRoll <= 4) return { key: '3-4', label: 'Bracket [3–4]', pts: '0–75 pts' };
  if (modRoll <= 6) return { key: '5-6', label: 'Bracket [5–6]', pts: '76–150 pts' };
  if (modRoll <= 9) return { key: '7-9', label: 'Bracket [7–9]', pts: '151–300 pts' };
  if (modRoll <= 12) return { key: '10-12', label: 'Bracket [10–12]', pts: '301–550 pts' };
  return { key: '13+', label: 'Bracket [13+]', pts: '551+ pts' };
}

/**
 * Calculates the next bracket down when a player triggers a Roll Down.
 * Returns null if the bracket cannot be rolled down (NONE or 3-4).
 */
function calculateRollDown(bracketKey) {
  const nextKey = DOWN_MAP[bracketKey];
  if (!nextKey) return null;
  return {
    nextKey,
    bracketLabel: LABEL_MAP[nextKey].label,
    pts: LABEL_MAP[nextKey].pts
  };
}

/**
 * Picks a unit from the shelf pool for a given bracket.
 */
function pickSyncedUnitFromBracket(bracketKey, rng, customPoolMap = null) {
  const idMap = { '3-4': 'pool34', '5-6': 'pool56', '7-9': 'pool79', '10+': 'pool10', '10-12': 'pool10', '13+': 'pool13' };
  const mapKey = bracketKey === '3-4' ? 'b34'
    : bracketKey === '5-6' ? 'b56'
    : bracketKey === '7-9' ? 'b79'
    : (bracketKey === '10+' || bracketKey === '10-12') ? 'b10'
    : 'b13';

  let raw = '';
  let activeFaction = '';
  if (typeof document !== 'undefined') {
    activeFaction = document.getElementById('hordeFactionSelect')?.value || '';
  }

  if (customPoolMap && customPoolMap[bracketKey] !== undefined) {
    raw = customPoolMap[bracketKey];
  } else if (typeof localStorage !== 'undefined') {
    try {
      const saved = localStorage.getItem('foa_custom_shelf_pool_v1') || localStorage.getItem('armageddon_horde_pool');
      if (saved) {
        const p = JSON.parse(saved);
        if (activeFaction && p.byFaction) {
          const facPool = p.byFaction[activeFaction] || {};
          raw = facPool[mapKey] || '';
        } else if (!p.byFaction && p[mapKey]) {
          raw = p[mapKey];
        }
      }
    } catch (e) {}
  }
  if (!raw && typeof document !== 'undefined') {
    const el = document.getElementById(idMap[bracketKey]) || document.getElementById('rosterPool' + mapKey.slice(1));
    raw = el ? (el.value || '') : '';
  }

  // Canonical default faction spawn table fallback from js/data.js
  const tables = (typeof HORDE_FACTION_SPAWN_TABLES !== 'undefined')
    ? HORDE_FACTION_SPAWN_TABLES
    : (typeof window !== 'undefined' && window.HORDE_FACTION_SPAWN_TABLES ? window.HORDE_FACTION_SPAWN_TABLES : null);

  if (!raw && activeFaction && tables && tables[activeFaction]) {
    const defaultUnits = tables[activeFaction][mapKey];
    if (Array.isArray(defaultUnits) && defaultUnits.length > 0) {
      raw = defaultUnits.join(', ');
    } else if (typeof defaultUnits === 'string') {
      raw = defaultUnits;
    }
  }

  const list = raw.split(',').map(s => s.trim()).filter(Boolean);
  if (list.length === 0) {
    return activeFaction
      ? `⚠️ ${activeFaction} Pool Empty for Bracket [${bracketKey}] — Configure in Mode 4!`
      : "Unit from Bracket [" + bracketKey + "]";
  }
  return list[Math.floor(rng() * list.length)];
}

// Dual export for Node.js test runner and browser global scope
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DOWN_MAP,
    LABEL_MAP,
    getBracketInfo,
    calculateRollDown,
    pickSyncedUnitFromBracket
  };
}
````

---

## File: `js/spawner-cards.js` <a id="file-jsspawnercardsjs"></a>

````javascript
/**
 * 📦 FIRES OF ARMAGEDDON // SPAWNER CARDS DATABASE & OVERRIDES
 * Authoritative official card assets for Mode 1 Spawner:
 * - 36 Verbatim Misery Deck Cards (11th Ed Horde Mode v0.9 PDFs)
 * - 24 Verbatim Secondary Mission Cards (11th Ed Horde Mode v0.9 PDFs)
 * - 26 Official Resupply Table Cards (Section 7.1 Official Card Assets)
 */

(function (root, factory) {
  const exports = factory();
  if (typeof root !== 'undefined') {
    Object.assign(root, exports);
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = exports;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {

  /**
   * 1. AUTHORITATIVE 36-CARD MISERY DECK ASSET DATABASE (11th Ed Horde Mode v0.9 PDFs)
   */
  const MISERY_CARD_OFFICIAL_OVERRIDES = {
    1: {
      id: 1, num: "1/36", name: "Unnatural Stamina",
      timing: "Persistent • Horde Movement, Shooting & Charge",
      desc: "Horde units are eligible to shoot and declare a charge in a turn in which they made an advance move.",
      note: "Tactical Reminder: Every Horde unit that Advances this round can still Shoot AND Charge!"
    },
    2: {
      id: 2, num: "2/36", name: "Grudge Match",
      timing: "Persistent • Horde Shooting & Fight Phases",
      desc: "Horde unit attacks have +1 to hit rolls and +1 to wound rolls.",
      note: "Tactical Reminder: Applies to all ranged and melee attacks made by Horde units this round."
    },
    3: {
      id: 3, num: "3/36", name: "Rip and Tear",
      timing: "Persistent • Horde Shooting & Fight Phases",
      desc: "Horde unit attacks have +1 AP.",
      note: "Tactical Reminder: Improves AP by 1 on all Horde ranged and melee weapons this round."
    },
    4: {
      id: 4, num: "4/36", name: "Blistering Speed",
      timing: "Persistent • Horde Movement & Charge Phases",
      desc: "Do not roll advance or charge rolls for the Horde. The Horde's advance rolls are automatically 6 and charge rolls are automatically 12.",
      note: "Tactical Reminder: Horde units automatically Advance +6\" and auto-roll 12\" on Charges!"
    },
    5: {
      id: 5, num: "5/36", name: "Untouchable",
      timing: "Persistent • All Saves Made by Horde Models",
      desc: "Horde models have a 4+ invulnerable save. Horde models that already had a 4+ invulnerable save instead improve their invulnerable save by 1.",
      note: "Tactical Reminder: Models with a 4+ Invuln become 3+ Invuln; all other Horde models gain 4+ Invuln."
    },
    6: {
      id: 6, num: "6/36", name: "Stray Orbital Bombardment",
      timing: "Immediate Resolution • Start of Battle Round",
      desc: "Split the battlefield evenly into a 2x3 grid. Assign each area a different number from 1 to 6. Roll one D6. Each unit within the rolled area suffers 2D3 mortal wounds.",
      note: "Affects ALL units (both Player and Horde) inside the rolled 2x3 sector!",
      actionType: "ORBITAL_GRID_ROLL"
    },
    7: {
      id: 7, num: "7/36", name: "Unlucky Night",
      timing: "Spawner Modifier • Roll 3D6 Drop Lowest!",
      desc: "When making Spawn Rolls for the Horde, roll 3D6 and discard the lowest.",
      note: "Spawner Linked: Automatically activates the [3D6 Drop Lowest] Spawn Roll modifier for this round!",
      spawnerEffect: "UNLUCKY_NIGHT_3D6"
    },
    8: {
      id: 8, num: "8/36", name: "Death Denied",
      timing: "Immediate Resolution • Start of Battle Round",
      desc: "Each Horde unit heals 13 wounds.",
      note: "Tactical Reminder: Heal up to 13 lost wounds on every damaged Horde unit currently on the battlefield."
    },
    9: {
      id: 9, num: "9/36", name: "Terrifying Shockwave",
      timing: "Persistent • All Player Battle-Shock Tests",
      desc: "All Player battle-shock rolls automatically fail.",
      note: "Tactical Reminder: Any Player unit required to take a Battle-shock test this round automatically fails it!"
    },
    10: {
      id: 10, num: "10/36", name: "Planetquake",
      timing: "Immediate Resolution • Terrain Area Strike",
      desc: "Select one terrain area wholly outside of the Attacker's deployment zone at random. Air Strike (see 7.1) activates, targeting that terrain area.",
      note: "Air Strike (7.1): Roll 1D6 for each model in each unit within the terrain feature; for every 4+, that unit suffers 1 mortal wound (MONSTER/VEHICLE units suffer 3 MW on a 4+ instead)."
    },
    11: {
      id: 11, num: "11/36", name: "Errant Explosion",
      timing: "Immediate Resolution • No Man's Land Objective",
      desc: "Randomly select one objective in No Man's Land. Destroy that objective.",
      note: "Tactical Reminder: Remove the randomly selected No Man's Land objective marker from the battlefield permanently."
    },
    12: {
      id: 12, num: "12/36", name: "Nowhere is Safe",
      timing: "Immediate Resolution • Defender Deployment Zone",
      desc: "Destroy all objectives in the Defender's deployment zone.",
      note: "Tactical Reminder: Remove all objective markers located inside the Player (Defender) deployment zone."
    },
    13: {
      id: 13, num: "13/36", name: "Pincer Maneuver",
      timing: "Spawner Modifier • Extra Deep Strike Reserve Unit (>3\")",
      desc: "Spawn an extra Horde unit into the Horde's strategic reserves, following the normal sequence. That unit gains Deep Strike and makes an ingress move during the Horde's next Movement phase, except it may be set up anywhere that is more than 3\" from all Player units. It deploys within the Players' deployment zone if able. If unable, it deploys within No Man's Land if able.",
      note: "Spawner Linked: Click [🎲 Roll Pincer Maneuver Reserve Spawn] below to roll 2D6 and generate the extra Deep Strike Horde unit!",
      spawnerEffect: "PINCER_MANEUVER_EXTRA_SPAWN"
    },
    14: {
      id: 14, num: "14/36", name: "No Hard Feelings",
      timing: "Immediate Resolution • Supply Points / Solo Escalation",
      desc: "Randomly select a player. Set their SP to 0. If playing Single Player, instead reveal 2 more Misery Cards.",
      note: "In Co-op: 1 random player's SP becomes 0. In Solo Mode: Your SP is untouched, but you MUST reveal +2 Misery Cards!"
    },
    15: {
      id: 15, num: "15/36", name: "Bad Investment",
      timing: "Immediate Resolution • All Players Lose 5 SP",
      desc: "Remove 5SP from all players. (The minimum SP is 0.)",
      note: "Click the quick button below to deduct 5 SP (down to a minimum of 0 SP)."
    },
    16: {
      id: 16, num: "16/36", name: "Fair and Balanced",
      timing: "Persistent • Horde Shooting & Fight Phases",
      desc: "Horde unit attacks have [DEVASTATING WOUNDS].",
      note: "Tactical Reminder: Critical Wounds by Horde models inflict Mortal Wounds bypassing normal saves!"
    },
    17: {
      id: 17, num: "17/36", name: "Unfettered Fury",
      timing: "Persistent • Horde Shooting & Fight Phases",
      desc: "Horde unit attacks have [SUSTAINED HITS 1] and [LETHAL HITS 1].",
      note: "Tactical Reminder: Critical Hits (unmodified 6s) by Horde models score 1 extra hit AND automatically wound!"
    },
    18: {
      id: 18, num: "18/36", name: "A Worthless Sacrifice",
      timing: "Immediate Resolution • Secret Player Vote",
      desc: "Players discuss and then secretly vote for a Player unit to be destroyed by the Horde. If the result of the vote is not unanimous, randomly select a unit to be destroyed from among all of the units that received at least one vote.",
      note: "Tactical Reminder: One Player unit on the battlefield is immediately destroyed!"
    },
    19: {
      id: 19, num: "19/36", name: "Fog of War",
      timing: "Persistent • Player Shooting Phase",
      desc: "Horde models have Stealth and are Hidden.",
      note: "Tactical Reminder: Ranged attacks against Horde units suffer -1 to Hit (Stealth) and cannot target them from >18\" away (Hidden)!"
    },
    20: {
      id: 20, num: "20/36", name: "Lamentable Luck",
      timing: "Immediate Chain Draw • Reveal +2 Misery Cards",
      desc: "Reveal 2 more Misery cards.",
      note: "Click the button below to immediately reveal 2 additional Misery cards from the deck."
    },
    21: {
      id: 21, num: "21/36", name: "Bunkers Busted",
      timing: "Immediate + Persistent Resupply Lockout",
      desc: "Remove all fortified markers from all objectives. Players cannot make Fortify purchases.",
      note: "Lockout: Strip all Fortified markers (FOB, Trench, Hospital, Jammer, etc.) and block [Fortify] shop purchases this round!"
    },
    22: {
      id: 22, num: "22/36", name: "Comms Jammed",
      timing: "Persistent • Command Point & Resupply Lockout",
      desc: "Players cannot use stratagems or spend Command Points. Players cannot make Supply, Spawn, or Strike purchases.",
      note: "Lockout: No Stratagems/CP spending allowed, and [Supply], [Spawn], and [Strike] shop purchases are blocked this round!"
    },
    23: {
      id: 23, num: "23/36", name: "The Mind Killer",
      timing: "Immediate Battle-Shock + Tactics Lockout",
      desc: "Player units must each make a battle-shock roll, then remove all Enhancements and Upgrades from battle-shocked units. Players cannot make Tactics purchases.",
      note: "Lockout: Test Battle-shock for every Player unit now (strip Enhancements/Upgrades if failed). Blocks [Tactics] purchases!"
    },
    24: {
      id: 24, num: "24/36", name: "Seller's Market",
      timing: "Persistent • Resupply Step (2x SP Cost)",
      desc: "The SP cost of all purchases is doubled.",
      note: "Automatically enables the 2x Seller's Market toggle in the Resupply Shop for this round."
    },
    25: {
      id: 25, num: "25/36", name: "Hotter Shots",
      timing: "Persistent • Horde Shooting Phase",
      desc: "Horde unit ranged attacks have [MELTA 1].",
      note: "Tactical Reminder: Horde ranged weapons deal +1 Damage when targeting units within half range."
    },
    26: {
      id: 26, num: "26/36", name: "Sinking Showboats",
      timing: "Persistent • Horde Shooting Phase",
      desc: "Horde unit ranged attacks have [PRECISION] and [IGNORE COVER].",
      note: "Tactical Reminder: Horde ranged attacks ignore Benefit of Cover and can allocate wounds directly to attached Player CHARACTERS!"
    },
    27: {
      id: 27, num: "27/36", name: "Chitinous Growths",
      timing: "Persistent • Player Shooting & Fight Phases",
      desc: "Attacks that target Horde units have -1 S and -1 AP.",
      note: "Tactical Reminder: Subtract 1 Strength and worsen AP by 1 on all Player attacks targeting Horde units."
    },
    28: {
      id: 28, num: "28/36", name: "They Fly Now",
      timing: "Persistent • Horde Movement & Shooting Phases",
      desc: "Horde units have the FLY and TOWERING keywords. Ignore all terrain when determining visibility for ranged attacks made by Horde models.",
      note: "Tactical Reminder: Horde units move over terrain/models (FLY) and have true line-of-sight through all terrain!"
    },
    29: {
      id: 29, num: "29/36", name: "Fate's Fetters",
      timing: "Immediate Resolution + Secondary Lockout",
      desc: "Remove 4SP from the player with the most SP. Reveal 3 extra Secondary Missions. Ignore the limit on Secondary Missions this battle round. Players cannot make Secondary purchases.",
      note: "Deduct 4 SP from highest-SP player, draw +3 Secondary Missions now, and block [Secondary] Resupply purchases!"
    },
    30: {
      id: 30, num: "30/36", name: "Aim for the Heads",
      timing: "Persistent • Shoot/Fight on Death (4+)",
      desc: "Each time a Horde model is destroyed, roll one D6: on a 4+, do not remove it from play. After the attacking model's unit has finished making its attacks, the destroyed model may fight if it is the Fight phase, or shoot if it is not. The destroyed model is then removed from play.",
      note: "Tactical Reminder: Roll 1D6 for every slain Horde model—on a 4+, it shoots back (or fights back in melee) before dying!"
    },
    31: {
      id: 31, num: "31/36", name: "Debris Storm",
      timing: "Persistent • Player Shooting & Fight Phases",
      desc: "Player units must re-roll unmodified hit rolls of 6.",
      note: "Tactical Reminder: Any natural 6 to Hit rolled by a Player unit must be re-rolled!"
    },
    32: {
      id: 32, num: "32/36", name: "Glowing Eyes",
      timing: "Persistent • Horde Shooting & Fight Phases",
      desc: "Each time a Horde model makes an attack, they may re-roll the hit roll.",
      note: "Tactical Reminder: Full Hit re-rolls on all Horde ranged and melee attacks this round!"
    },
    33: {
      id: 33, num: "33/36", name: "Danger Close",
      timing: "Persistent • Horde Shooting & Fight Phases",
      desc: "Horde unit ranged attacks have [BLAST 1]. Horde unit melee attacks have [CLEAVE 1].",
      note: "Tactical Reminder: Horde ranged weapons gain [BLAST 1]; Horde melee weapons gain [CLEAVE 1]."
    },
    34: {
      id: 34, num: "34/36", name: "Surging Power",
      timing: "Persistent • Horde Shooting & Fight Phases",
      desc: "Horde unit attacks have +1 S and [PSYCHIC].",
      note: "Tactical Reminder: Add +1 Strength and the [PSYCHIC] keyword to all Horde ranged and melee attacks."
    },
    35: {
      id: 35, num: "35/36", name: "Experimental Ammunition",
      timing: "Persistent • Player Shooting Phase",
      desc: "Player unit ranged attacks have +1 S, +1 AP, and [HAZARDOUS].",
      note: "Tactical Reminder: All Player ranged weapons get +1 Strength and +1 AP, but you MUST roll Hazardous tests after shooting!"
    },
    36: {
      id: 36, num: "36/36", name: "Flash Flood",
      timing: "Persistent • Player Movement & Charge Phases",
      desc: "Player units have -2\" M (to a minimum 4\") and subtract 2 from advance and charge rolls. (to a minimum 1).",
      note: "Tactical Reminder: Player Move reduced by 2\" (min 4\"), and -2 to Player Advance and Charge rolls!"
    }
  };

  /**
   * 2. AUTHORITATIVE 24-CARD SECONDARY MISSION ASSET DATABASE (11th Ed Horde Mode v0.9 PDFs)
   */
  const SECONDARY_MISSION_OFFICIAL_OVERRIDES = {
    1: {
      id: 1, num: "1/24", name: "Secure Drop Zones",
      typeTag: "Objective Control • End of Battle Round",
      round1Restricted: false,
      cond: "Randomly select two objectives in No Man's Land (if fewer exist, select that number instead.) Control those selected objectives at the end of the battle round.",
      rew: "3 SP, One random player saves this card. You may discard this card during the Resupply Step to make a Tactics purchase without paying SP.",
      pun: "+1 Misery card",
      rewardSp: 3,
      savedCardBenefit: "Discard during Resupply Step for 1 FREE [Tactics] purchase",
      punMisery: 1
    },
    2: {
      id: 2, num: "2/24", name: "Back to Basics",
      typeTag: "Kill Tally (X) • End of Battle Round",
      round1Restricted: false,
      hasTally: true,
      tallyLabel: "Horde Units Destroyed This Round (X)",
      cond: "Keep a tally, X, of how many Horde units are destroyed this battle round after the horde is spawned and you have revealed this mission. X must be greater than zero.",
      rew: "(X+1) SP",
      pun: "+2 Misery cards",
      rewardSpFormula: "X_PLUS_1",
      punMisery: 2
    },
    3: {
      id: 3, num: "3/24", name: "Show No Fear",
      typeTag: "Morale Check • End of Battle Round",
      round1Restricted: false,
      cond: "No Player units can be battle-shocked at the end of the battle round.",
      rew: "3 SP",
      pun: "+2 Misery cards, +1 to Spawn Rolls",
      rewardSp: 3,
      punMisery: 2,
      punSpawnMod: 1
    },
    4: {
      id: 4, num: "4/24", name: "Establish Orbital Comms",
      typeTag: "Shooting Action • Center Battlefield (6\")",
      round1Restricted: false,
      actionTitle: "Establish Orbital Comms - Action",
      actionBlock: "STARTS: Your Shooting phase. | UNITS: One INFANTRY or CHARACTER unit that is wholly within 6\" of the center of the battlefield. | USE LIMIT: Once per turn. | COMPLETES: End of the turn. | EFFECT: The Condition of this Secondary Mission is met.",
      cond: "Complete the Establish Orbital Comms action with 1 INFANTRY or CHARACTER unit wholly within 6\" of the center of the battlefield.",
      rew: "One at a time, each player without a revealed Secret Objective immediately uses A Change of Plans.",
      pun: "One at a time, each player without a revealed Secret Objective immediately uses A Change of Plans, but they do not choose a card; instead they select one at random.",
      specialRewardAction: "CHANGE_OF_PLANS_CHOICE",
      specialPunAction: "CHANGE_OF_PLANS_RANDOM"
    },
    5: {
      id: 5, num: "5/24", name: "Search for Supplies",
      typeTag: "Shooting Action • Objective Roll (4+)",
      round1Restricted: false,
      actionTitle: "Search for Supplies - Action",
      actionBlock: "STARTS: Your Shooting phase. | UNITS: One unit within range of an objective (excluding your home objective). | USE LIMIT: Unlimited. Each unit that starts this action this phase must be within range of a different objective. | COMPLETES: End of the turn, if that unit controls that objective. | EFFECT: Roll one D6: on a 4+ the Condition of this Secondary Mission is met.",
      cond: "Complete the Search for Supplies action on controlled non-home objective(s) and roll a 4+ on 1D6.",
      rew: "3 SP, One random player saves this card. You may discard this card during the Resupply step to make a Supply purchase without paying SP.",
      pun: "+2 Misery cards",
      rewardSp: 3,
      savedCardBenefit: "Discard during Resupply Step for 1 FREE [Supply] purchase",
      punMisery: 2
    },
    6: {
      id: 6, num: "6/24", name: "Clear the Evac Zone",
      typeTag: "Zone Defense • End of Battle Round",
      round1Restricted: false,
      cond: "No Horde units are within the Defender's deployment zone at the end of the battle round.",
      rew: "3 SP",
      pun: "Reinforcements Arrive is removed from the SP Purchase Table",
      rewardSp: 3,
      punNote: "Reinforcements Arrive (12 SP) is permanently removed from the Resupply Shop!"
    },
    7: {
      id: 7, num: "7/24", name: "Decapitation Strike",
      typeTag: "Assassination • End of Battle Round",
      round1Restricted: false,
      cond: "Destroy a Horde CHARACTER model, or have no Horde CHARACTER models exist at the end of the battle round.",
      rew: "2 SP, 2 CP",
      pun: "+2 Misery cards",
      rewardSp: 2,
      rewardCp: 2,
      punMisery: 2
    },
    8: {
      id: 8, num: "8/24", name: "Dragon Slayer",
      typeTag: "Big Game Hunt • End of Battle Round",
      round1Restricted: false,
      cond: "Destroy a Horde VEHICLE or MONSTER model or have none exist at the end of the battle round.",
      rew: "1 free Field Promotion use to the player who triggers it. If no player triggers, 2SP",
      pun: "+6 to the first Spawn Roll",
      rewardSp: 2,
      punFirstZoneBonus: 6
    },
    9: {
      id: 9, num: "9/24", name: "Paint Targets",
      typeTag: "Movement Restriction • Until End of Round",
      round1Restricted: false,
      cond: "Until the end of the battle round: (1) No player unit may make a fall-back move. (2) No player unit may make any move that takes them out of range of any objective they began the turn in range of.",
      rew: "1 Free use of Air Strike to a random player, 1 Free use of Defensive Positions to a random player.",
      pun: "Search for Stray Orbital Bombardment in the Misery Deck and discard pile and immediately resolve it.",
      savedCardBenefit: "1 FREE Air Strike + 1 FREE Defensive Positions",
      punTriggerMiseryId: 6
    },
    10: {
      id: 10, num: "10/24", name: "Study Behaviors",
      typeTag: "Specimen Preservation • Player Movement Phase",
      round1Restricted: false,
      cond: "At the start of the Player Movement phase, choose a Horde unit on the battlefield at random; that unit must not lose any wounds until the end of the battle round.",
      rew: "2 SP, One random player saves this card. You may discard this card to discard and nullify the effect of a revealed Misery card.",
      pun: "+3 to Spawn Roll",
      rewardSp: 2,
      savedCardBenefit: "Discard anytime to NULLIFY 1 revealed Misery card",
      punSpawnMod: 3
    },
    11: {
      id: 11, num: "11/24", name: "Use It or Lose It",
      typeTag: "Resupply Spend Tally (X >= 7) • Round 2+ Only",
      round1Restricted: true,
      hasTally: true,
      tallyLabel: "SP Spent This Round After Reveal (X, Need 7+)",
      cond: "Keep a tally, X, of how much SP is spent during the battle round after revealing this card. The tally must be at least 7 at the end of the battle round. (If drawn in Round 1, reveal another Secondary Mission and shuffle this back into the deck.)",
      rew: "Roll a D6, on a 4+, X SP to a random player. Otherwise, 3 SP to a random player.",
      pun: "-3SP, +1 Misery card",
      rewardSpFormula: "USE_IT_OR_LOSE_IT",
      punLoseSp: 3,
      punMisery: 1
    },
    12: {
      id: 12, num: "12/24", name: "Control the Battlefield",
      typeTag: "Table Quarters • End of Battle Round",
      round1Restricted: false,
      cond: "At the end of the battle round, have at least one Player unit wholly within each table quarter and outside of 6\" of the center of the battlefield.",
      rew: "-1 to Spawn Rolls, One random player saves this card. You may discard this card during the Resupply step to make a Secondary purchase without paying SP.",
      pun: "+1 Misery card, +1 to Spawn Rolls",
      rewardSpawnMod: -1,
      savedCardBenefit: "Discard during Resupply Step for 1 FREE [Secondary] purchase",
      punMisery: 1,
      punSpawnMod: 1
    },
    13: {
      id: 13, num: "13/24", name: "The Smell of Napalm",
      typeTag: "Resupply Quota (2x Strike) • Round 2+ Only",
      round1Restricted: true,
      cond: "Make 2 Strike purchases this battle round. (If drawn in Round 1, reveal another Secondary Mission and shuffle this back into the deck.)",
      rew: "2SP, -1 to Spawn Rolls",
      pun: "+1 Misery card, +1 to Spawn Rolls",
      rewardSp: 2,
      rewardSpawnMod: -1,
      punMisery: 1,
      punSpawnMod: 1
    },
    14: {
      id: 14, num: "14/24", name: "Marching on Stomachs",
      typeTag: "Resupply Quota (2x Supply) • Round 2+ Only",
      round1Restricted: true,
      cond: "Make 2 Supply purchases this battle round. (If drawn in Round 1, reveal another Secondary Mission and shuffle this back into the deck.)",
      rew: "1SP, One random player saves this card. You may discard this card during the Resupply step to reduce the cost of Reinforcements Arrive by 5.",
      pun: "+1 Misery card, each Horde unit on the battlefield heals 3 wounds.",
      rewardSp: 1,
      savedCardBenefit: "Discard during Resupply to reduce Reinforcements Arrive cost by 5 SP (to 7 SP)",
      punMisery: 1
    },
    15: {
      id: 15, num: "15/24", name: "Baiting the Trap",
      typeTag: "Shooting Action • Center Battlefield (6\")",
      round1Restricted: false,
      actionTitle: "Baiting the Trap - Action",
      actionBlock: "STARTS: Your Shooting phase. | UNITS: One unit that is wholly within 6\" of the center of the battlefield. | USE LIMIT: Once per turn. | COMPLETES: End of the turn. | EFFECT: The Condition of this Secondary Mission is met.",
      cond: "Complete the Baiting the Trap action with 1 unit wholly within 6\" of the center of the battlefield.",
      rew: "2SP, +12 to the first Spawn Roll, One free use of Deploy Minefield to the Player whose unit completed Baiting the Trap",
      pun: "+2 Misery cards, +2 to Spawn Rolls",
      rewardSp: 2,
      rewardFirstZoneBonus: 12,
      savedCardBenefit: "1 FREE Deploy Minefield use",
      punMisery: 2,
      punSpawnMod: 2
    },
    16: {
      id: 16, num: "16/24", name: "Lead from the Front",
      typeTag: "Character Damage Tally (X, Max 4) • End of Round",
      round1Restricted: false,
      hasTally: true,
      tallyLabel: "Damage Dealt by Player CHARACTERS (X, Max 4)",
      cond: "Keep a tally of damage dealt to Horde models by Player CHARACTER models this battle round, X, up to a maximum of 4. Count the number of Player CHARACTER models on the battlefield. At the end of the battle round X must be greater than 0 and there must be at least as many Player CHARACTER models on the battlefield as there were when the Secondary Mission was revealed.",
      rew: "X SP",
      pun: "+1 Misery card, -1 to Battle-shock tests made by Player units",
      rewardSpFormula: "X_MAX_4",
      punMisery: 1
    },
    17: {
      id: 17, num: "17/24", name: "Spruce This Place Up",
      typeTag: "Fortification Check (2+ Obj) • Round 2+ Only",
      round1Restricted: true,
      cond: "At the end of the battle round, have at least 2 objectives fortified. (If drawn in Round 1, reveal another Secondary Mission and shuffle this back into the deck.)",
      rew: "1SP, One random player saves this card. You may discard this card to discard and nullify the effect of a revealed Misery card.",
      pun: "+1 Misery card, Remove all Fortified Markers from Objectives",
      rewardSp: 1,
      savedCardBenefit: "Discard anytime to NULLIFY 1 revealed Misery card",
      punMisery: 1
    },
    18: {
      id: 18, num: "18/24", name: "Calling Shots",
      typeTag: "Marked Priority Targets (X) • End of Horde Move",
      round1Restricted: false,
      hasTally: true,
      tallyLabel: "Marked Horde Units Chosen & Destroyed (X)",
      cond: "At the end of the Horde's Movement phase, select one or more Horde units. Mark them with a reminder token and keep track of the chosen number of units, X. Keep a tally of the amount of marked units destroyed during the battle round. The tally at the end of the battle round must equal X. (If revealed after the Horde's Movement Phase, reveal another Secondary Objective and shuffle Calling Shots back into the deck.)",
      rew: "(X * 2) SP",
      pun: "+X Misery cards, +X to Spawn Rolls",
      rewardSpFormula: "X_TIMES_2",
      punFormula: "X_MISERY_AND_SPAWN"
    },
    19: {
      id: 19, num: "19/24", name: "Tactical Withdrawal",
      typeTag: "Shooting Action • NML Board Edge (4\") • Round 2+",
      round1Restricted: true,
      actionTitle: "Tactical Withdrawal - Action",
      actionBlock: "STARTS: Your Shooting phase. | UNITS: One unit that is wholly within No Man's Land and wholly within 4\" of a board edge. | USE LIMIT: Once per turn. | COMPLETES: End of the turn. | EFFECT: (1) Place the unit that completed this action into strategic reserves. (2) The Condition of this Secondary Mission is met.",
      cond: "Complete the Tactical Withdrawal action with 1 unit wholly in No Man's Land and wholly within 4\" of a board edge. (If drawn in Round 1, reveal another Secondary Mission and shuffle this back into the deck.)",
      rew: "1SP, The player whose unit completes Tactical Withdrawal saves this card. You may discard this card during the Resupply step to make up to 2 Deploy Short Range Teleporter purchases without paying SP.",
      pun: "Next battle round, before revealing Misery Cards, first search for Pincer Maneuver in the Misery Deck and discard pile and add it to the active Misery cards.",
      rewardSp: 1,
      savedCardBenefit: "Discard during Resupply for up to 2 FREE Deploy Short Range Teleporter purchases",
      punTriggerMiseryId: 13
    },
    20: {
      id: 20, num: "20/24", name: "Insane Gambit",
      typeTag: "Shooting Action • Destroy Controlled Objective!",
      round1Restricted: false,
      actionTitle: "Scuttle the Objective - Action",
      actionBlock: "STARTS: Your Shooting phase. | UNITS: One unit within range of an objective. | USE LIMIT: Once per turn. | COMPLETES: End of the turn, if that unit controls that objective. | EFFECT: If completed on objective terrain, it no longer counts as an objective and becomes normal terrain. If completed on an objective marker, remove the objective marker. The Condition of this Secondary Mission is met.",
      cond: "Complete the Scuttle the Objective action on a controlled objective (permanently removing that objective marker!).",
      rew: "4SP, One random player saves this card. You may discard this card during the Resupply step to make a Fortify purchase without paying SP.",
      pun: "+2 Misery cards",
      rewardSp: 4,
      savedCardBenefit: "Discard during Resupply Step for 1 FREE [Fortify] purchase",
      punMisery: 2
    },
    21: {
      id: 21, num: "21/24", name: "Stabilize Warp Beacons",
      typeTag: "Shooting Action • 3 or 4 Table Quarters • Round 2+",
      round1Restricted: true,
      actionTitle: "Stabilize Warp Beacons - Action",
      actionBlock: "STARTS: Your Shooting phase. | UNITS: Three or four units wholly within different table quarters and more than 6\" away from the center of the battlefield. | USE LIMIT: Once per turn. | COMPLETES: End of the turn. | EFFECT: For each unit that completed this action, roll one D6 (adding 1 if four units completed this action): on a roll of 1 or 2 destroy that unit. The Condition of this Secondary Objective is met.",
      cond: "Complete Stabilize Warp Beacons with 3 or 4 units in different table quarters (>6\" from center). Roll 1D6 per unit (+1 if 4 units): on 1–2 that unit is destroyed! (If drawn in Round 1, redraw.)",
      rew: "1SP, One free use of Reinforcements Arrive to a random player whose unit completed Stabilize Warp Beacons",
      pun: "+2 Misery cards",
      rewardSp: 1,
      savedCardBenefit: "1 FREE Reinforcements Arrive (12 SP value!)",
      punMisery: 2
    },
    22: {
      id: 22, num: "22/24", name: "Confirm Kills",
      typeTag: "Focus Fire • No Damaged Horde Units Survive",
      round1Restricted: false,
      cond: "Mark all Horde units that lose wounds. No marked Horde units are on the battlefield at the end of the battle round.",
      rew: "3SP, -1 to Spawn Rolls",
      pun: "+2 to Spawn Rolls",
      rewardSp: 3,
      rewardSpawnMod: -1,
      punSpawnMod: 2
    },
    23: {
      id: 23, num: "23/24", name: "Secure the LZ",
      typeTag: "Shooting Action • 3 Units in Defender DZ (>6\" Apart)",
      round1Restricted: false,
      actionTitle: "Secure the LZ - Action",
      actionBlock: "STARTS: Your Shooting phase. | UNITS: Three units wholly within the Defender's deployment zone and more than 6\" away from each other. | USE LIMIT: Once per turn. | COMPLETES: End of the turn. | EFFECT: The Condition of this Secondary Objective is met.",
      cond: "Complete the Secure the LZ action with 3 units wholly within the Defender's deployment zone and >6\" away from each other.",
      rew: "In the next Resupply phase, reduce the cost of the first SP purchase for each player by 3SP (to a minimum cost of 0SP).",
      pun: "+1 Misery card. Next battle round before revealing Misery Cards, first search for Comms Jammed in the Misery Deck and discard pile and add it to the active Misery cards.",
      savedCardBenefit: "Next Resupply Phase: -3 SP discount on each player's first SP purchase (min 0 SP)",
      punMisery: 1,
      punTriggerMiseryId: 22
    },
    24: {
      id: 24, num: "24/24", name: "VIP Delivery",
      typeTag: "Shooting Action • VEHICLE/MONSTER in Center • Round 2+",
      round1Restricted: true,
      actionTitle: "VIP Delivery - Action",
      actionBlock: "STARTS: Your Shooting phase. | UNITS: One VEHICLE or MONSTER unit that is within 6\" of the center of the battlefield. | USE LIMIT: Once per turn. | COMPLETES: End of the turn. | EFFECT: The Condition of this Secondary Mission is met.",
      cond: "Complete VIP Delivery with 1 VEHICLE or MONSTER unit within 6\" of the center of the battlefield. (If drawn in Round 1, or if no Player VEHICLE/MONSTER units are on the battlefield, discard/redraw!)",
      rew: "3SP",
      pun: "+1 Misery Card",
      rewardSp: 3,
      punMisery: 1
    }
  };

  /**
   * 3. AUTHORITATIVE RESUPPLY TABLE OVERRIDES (Section 7.1 Official Card Assets)
   * Patches RESUPPLY_TABLE / RESUPPLIES with verbatim rules text, exact measurements, turn limits,
   * interactive X-SP calculators, and automatic Misery lockout detection.
   */
  const RESUPPLY_OFFICIAL_OVERRIDES = {
    // 1 SP
    "A Name Earned": {
      cost: 1, tags: ["Tactics"], limit: "Max 1 copy of each Enhancement per player",
      desc: "Add either an Enhancement to a CHARACTER unit without one, or a Crusade/Detachment upgrade to a unit without one. Follow all rules for its placement. For each player, only one copy of any Enhancement may exist at once."
    },
    // 2 SP
    "Basic Tactics": {
      cost: 2, tags: ["Tactics"], limit: "Unlimited uses during Resupply Step",
      desc: "Gain 1 CP.",
      autoEffect: "GAIN_1_CP"
    },
    "Deploy Minefield": {
      cost: 2, tags: ["Supply", "Strike"], limit: "Max 1 Minefield on battlefield at once",
      desc: "Place a 40mm Minefield marker wholly within No Man's Land and more than 6\" away from all enemy models and objectives. You cannot place a Minefield marker if one already exists on the battlefield. If a unit starts or ends any move within 6\" of a Minefield, it suffers D6 mortal wounds (once per unit per phase). Keep a tally of total damage dealt by the Minefield; at the end of each battle round, if that tally is 10 or more, remove the Minefield from the battlefield.",
      autoEffect: "MARKER_MINE"
    },
    "Deploy Razor Wire": {
      cost: 2, tags: ["Supply", "Strike"], limit: "Max 2 Razor Wire markers on battlefield at once",
      desc: "Place a 40mm Razor Wire marker wholly within 3\" of a unit you own that is unengaged and more than 2\" away from all enemy models and objectives. No more than 2 Razor Wire markers may exist at once (if 2 are already deployed, remove one before placing a new one). If a unit begins or ends any move within 2\" of Razor Wire, that unit suffers D3 mortal wounds. Units within 2\" of Razor Wire have -1\" Move (to a minimum of 5\") and subtract 2 from their Advance and Charge rolls.",
      autoEffect: "MARKER_WIRE"
    },
    // 3 SP
    "Air Strike": {
      cost: 3, tags: ["Strike"], limit: "Destroys target terrain feature!",
      desc: "Select a terrain area. Each unit within it suffers 2D3 mortal wounds, then remove that terrain feature from the battlefield. If the target is a terrain objective, place an objective marker using the rules for Objectives Not Within a Terrain Area (Core Rules pg.88) centered on the position of the missing terrain objective.",
      hasAirStrikeRoller: true
    },
    "Deploy Short Range Teleporter": {
      cost: 3, tags: ["Supply"], limit: "Max 3 Teleporters on battlefield at once",
      desc: "Place a 40mm Teleporter marker wholly within 3\" of a target unit you own that is unengaged and more than 2\" away from all enemy models and objectives. No more than 3 Teleporters may exist at once (if 3 exist, remove one before placing a new one). If a Horde model ends a turn within 2\" of a Teleporter, remove that Teleporter. TELEPORT RULE: Friendly units that end a move wholly within 3\" of a Teleporter while at least 2 Teleporters are on the battlefield may be removed into Strategic Reserves and immediately make a disembark move at a different Teleporter as if it were a TRANSPORT that made a Normal Move this phase (Core Rules 18.04; if it cannot disembark, it is destroyed).",
      autoEffect: "MARKER_TELE"
    },
    "Forward Operating Base": {
      cost: 3, tags: ["Fortify"], limit: "Requires a non-Fortified Objective",
      desc: "Place a FOB marker on a non-Fortified objective; it is now a Forward Operating Base and Fortified. Players gain an additional +1 SP (or +2 SP in Solo Mode!) for controlling a Forward Operating Base when gaining SP for controlling objectives in the Command phase.",
      autoEffect: "FORT_FOB"
    },
    "Pizza Party": {
      cost: 3, tags: ["Tactics", "Supply"], limit: "Can target any player's unit",
      desc: "Choose a Battle-shocked unit owned by any player. That unit is no longer Battle-shocked."
    },
    "Share Supplies": {
      cost: 3, tags: ["Tactics"], limit: "Co-op Resource Transfer (Counts for 'Benevolence')",
      desc: "Grant 2 SP to another player."
    },
    "Supply Drop": {
      cost: 3, tags: ["Supply"], limit: "Max 6 Objectives in play at once",
      desc: "Add a new objective marker to No Man's Land, at least 6\" from all board edges and other objective markers, and at least 3\" from objective terrains. If not placed in an existing terrain area, use the rules for Objectives Not Within a Terrain Area (Core Rules pg.88). A maximum of 6 objectives may be in play at once."
    },
    // 4 SP
    "Arm Experimental Defenses": {
      cost: 4, tags: ["Fortify"], limit: "Requires a non-Fortified Objective",
      desc: "Place a Lightning Marker on a non-fortified objective; it is now a Warp-Relic Outpost and Fortified. At the beginning of the Player Fight phase, each Horde unit within 6\" of a Warp-Relic Outpost suffers 3 mortal wounds. Player units engaged with any of those Horde units suffer 1 mortal wound.",
      autoEffect: "FORT_WARP"
    },
    "Defensive Positions": {
      cost: 4, tags: ["Supply", "Fortify"], limit: "Once per turn",
      desc: "Set up a dense terrain area anywhere on the battlefield at least 3\" from all other terrain, using either ruins with a max footprint of 9\"x9\" (Core Rules 13.01) or a terrain footprint template with at least 1 dense feature and 1 additional dense/light feature. Neither walls nor features may cover any model's base. OBJECTIVE SWAP: If placed over an objective marker, remove the marker and treat the new ruin as an Area Terrain Objective instead (carrying over current control, secured status, and any Fortified marker). This option may only be purchased once per turn."
    },
    "Emergency Shovel Stash": {
      cost: 4, tags: ["Fortify"], limit: "Requires a non-Fortified Objective",
      desc: "Place a Shovel Marker on a non-fortified objective; it is now a War Trench and Fortified. Friendly models' melee attacks have +1 Strength and +1 AP while their unit is wholly within range of a War Trench.",
      autoEffect: "FORT_TRENCH"
    },
    "Field Hospital": {
      cost: 4, tags: ["Fortify"], limit: "Requires a non-Fortified Objective",
      desc: "Place a MASH marker on a non-fortified objective; it is now a Field Hospital and Fortified. At the end of your Movement phase, each Player unit wholly within range of a Field Hospital heals 3 wounds.",
      autoEffect: "FORT_HOSP"
    },
    "Tempt Fate": {
      cost: 4, tags: ["Secondary"], limit: "Once per turn • Max 2 active Secondaries",
      desc: "Reveal a second Secondary Mission. Resolve each Secondary Mission separately. Their rewards and punishments stack, but no more than two Secondary Missions can be active in any round. This option may only be purchased once per turn.",
      autoEffect: "DRAW_SECOND_MISSION"
    },
    // 5 SP
    "Activate Jamming Station": {
      cost: 5, tags: ["Fortify"], limit: "Requires a non-Fortified Objective",
      desc: "Place a Jammer Marker on a non-fortified objective; it is now a Jamming Station and Fortified. When making Spawn Rolls for the Horde, subtract 1 from the roll as long as the players control a Jamming Station.",
      autoEffect: "FORT_JAMMER"
    },
    "Advanced Tactics": {
      cost: 5, tags: ["Secondary", "Tactics"], limit: "Once per turn",
      desc: "Remove one active Secondary Mission and reveal a new one. This option may only be purchased once per turn.",
      autoEffect: "REPLACE_MISSION"
    },
    "Ammo Supplies": {
      cost: 5, tags: ["Fortify"], limit: "Requires a non-Fortified Objective",
      desc: "Place an Ammo Marker on a non-fortified objective; it is now an Ammo Dump and Fortified. Friendly models' ranged attacks have [SUSTAINED HITS 1] while their unit is wholly within range of an Ammo Dump.",
      autoEffect: "FORT_AMMO"
    },
    "Emergency Evac": {
      cost: 5, tags: ["Tactics"], limit: "Unengaged friendly unit only",
      desc: "Choose a unit you own that is unengaged. Remove that unit from the battlefield and place it into Strategic Reserves. In your next Movement phase, make an ingress move with that unit (Core Rules 20.04). Any units not on the battlefield at the end of the battle are destroyed."
    },
    // 6 SP
    "Activate Shield Generator": {
      cost: 6, tags: ["Fortify"], limit: "Requires a non-Fortified Objective",
      desc: "Place a Shield Generator marker on a non-fortified objective; it is now a Shield Generator and Fortified. Friendly units wholly within range of a Shield Generator have Feel No Pain 5+ against ranged attacks made by models not within range of the Shield Generator.",
      autoEffect: "FORT_SHIELD"
    },
    // 8 SP
    "A Change of Plans": {
      cost: 8, tags: ["Tactics"], limit: "Redraws Secret Objective (Choose 1 of 3)",
      desc: "Draw up to two additional Secret Objectives from the Secret Objective Deck. Choose either one of the drawn Secret Objectives to be your new Secret Objective, or keep your original Secret Objective. Place all but the chosen Secret Objective card back into the Secret Objective deck face down, then shuffle the deck.",
      autoEffect: "CHANGE_OF_PLANS"
    },
    "Artillery Strike": {
      cost: 8, tags: ["Strike"], limit: "Resolves at end of next Fight Phase (9\" radius)",
      desc: "Place a 40mm marker anywhere on the battlefield more than 2\" away from all models. At the end of the next Fight phase, roll one D6 for every model in each unit within 9\" of the marker. For every 5+, that unit suffers 1 mortal wound. MONSTER or VEHICLE units suffer 3 mortal wounds for each 5+ instead. Remove the marker from the battlefield."
    },
    // 12 SP
    "Reinforcements Arrive": {
      cost: 12, tags: ["Spawn"], limit: "Roll 2D6 on your Army's Spawning Table",
      desc: "Roll 2D6 and select a unit of your choice from the corresponding bracket of your army's Spawning Table to add to your Strategic Reserves (they may make an ingress move this turn). If no valid unit within that spawning bracket is available, you may instead select a single unit of a lower bracket. An unmodified roll of 2 fails!",
      hasReinforcementsRoller: true
    },
    // VARIABLE X SP
    "Patched Up": {
      cost: "X", isVariable: true, varType: "PATCHED_UP", tags: ["Tactics"], limit: "Once per turn, per player • Unengaged unit",
      desc: "Select any Player unit that is unengaged. Pay X SP to have that unit heal X wounds. X cannot be 0, and cannot be higher than the total missing wounds of the unit. This option may only be purchased once per turn, per player."
    },
    "Deploy Fortification": {
      cost: "X", isVariable: true, varType: "DEPLOY_FORT", tags: ["Supply", "Fortify"], limit: "Once per turn, per player • X = Min Bracket Roll",
      desc: "Pick a FORTIFICATION unit from your faction's Spawning Table. Pay X SP, an amount equal to the minimum Spawning Bracket roll for that FORTIFICATION (3, 5, 7, 10, or 13 SP). That FORTIFICATION gains Deep Strike, is placed into Strategic Reserves, and makes an ingress move this turn. This option may only be purchased once per turn, per player."
    },
    "Field Promotion": {
      cost: "X", isVariable: true, varType: "FIELD_PROMO", tags: ["Spawn"], limit: "Once per turn, per player • X = 1D6 + Min Bracket",
      desc: "Destroy an unengaged unit you own. Look up the Spawning Table bracket of the smallest unit size it currently fits into (e.g., a 10-man squad with 3 models left counts as a 5-man squad). Roll 1D6 and add that bracket's minimum roll value (3, 5, 7, or 10) to get X. You may pay X SP to select a unit of your choice from your army's Spawning Table bracket corresponding to X and set it up as close as possible to the original unit's position (outside Engagement Range), with no more models than were in the destroyed unit. (If you do not pay X SP, the original unit remains destroyed!)"
    }
  };

  /**
   * Patches the global game databases (MISERIES, SECONDARIES, RESUPPLIES)
   * with the official authoritative text and card properties.
   */
  function applyAuthoritativeCardOverrides() {
    // 1. Patch Misery Deck
    const miseryDeckRef = (typeof MISERY_DECK !== 'undefined')
      ? MISERY_DECK
      : (typeof MISERIES !== 'undefined' ? MISERIES : (typeof window !== 'undefined' ? (window.MISERY_DECK || window.MISERIES || []) : []));

    if (Array.isArray(miseryDeckRef)) {
      miseryDeckRef.forEach(card => {
        const official = MISERY_CARD_OFFICIAL_OVERRIDES[card.id];
        if (official) {
          card.name = official.name;
          card.desc = official.desc;
          card.effect = official.desc;
          card.num = official.num;
          card.timing = official.timing;
          card.note = official.note;
        }
      });
    }

    // 2. Patch Secondary Deck
    const secDeckRef = (typeof SECONDARY_DECK !== 'undefined')
      ? SECONDARY_DECK
      : (typeof SECONDARIES !== 'undefined' ? SECONDARIES : (typeof window !== 'undefined' ? (window.SECONDARY_DECK || window.SECONDARIES || []) : []));

    if (Array.isArray(secDeckRef)) {
      secDeckRef.forEach(card => {
        const official = SECONDARY_MISSION_OFFICIAL_OVERRIDES[card.id];
        if (official) {
          card.name = official.name;
          card.cond = official.cond;
          card.rew = official.rew;
          card.pun = official.pun;
          card.r1 = !official.round1Restricted;
        }
      });
    }

    // 3. Patch Resupply Table
    if (typeof window !== 'undefined' && typeof window.RESUPPLY_TABLE === 'undefined') {
      window.RESUPPLY_TABLE = (typeof RESUPPLIES !== 'undefined') ? RESUPPLIES : [];
    }
    const resupplyRef = (typeof RESUPPLY_TABLE !== 'undefined')
      ? RESUPPLY_TABLE
      : (typeof window !== 'undefined' && window.RESUPPLY_TABLE ? window.RESUPPLY_TABLE : (typeof RESUPPLIES !== 'undefined' ? RESUPPLIES : []));

    if (Array.isArray(resupplyRef)) {
      resupplyRef.forEach(item => {
        const official = RESUPPLY_OFFICIAL_OVERRIDES[item.name] ||
          (item.name === 'Short Range Teleporter' ? RESUPPLY_OFFICIAL_OVERRIDES['Deploy Short Range Teleporter'] : null) ||
          (item.name === 'Experimental Defenses' ? RESUPPLY_OFFICIAL_OVERRIDES['Arm Experimental Defenses'] : null);

        if (official) {
          if (item.name === 'Short Range Teleporter') item.name = 'Deploy Short Range Teleporter';
          if (item.name === 'Experimental Defenses') item.name = 'Arm Experimental Defenses';
          item.cost = official.cost;
          item.desc = official.desc;
          item.tags = official.tags;
          item.limit = official.limit;
          item.autoEffect = official.autoEffect || null;
          item.isVariable = !!official.isVariable;
          item.varType = official.varType || null;
          item.hasAirStrikeRoller = !!official.hasAirStrikeRoller;
          item.hasReinforcementsRoller = !!official.hasReinforcementsRoller;
        }
      });
    }
  }

  // Execute patch immediately
  applyAuthoritativeCardOverrides();

  return {
    MISERY_CARD_OFFICIAL_OVERRIDES,
    SECONDARY_MISSION_OFFICIAL_OVERRIDES,
    RESUPPLY_OFFICIAL_OVERRIDES,
    applyAuthoritativeCardOverrides
  };
});
````

---

## File: `js/spawner-cockpit.js` <a id="file-jsspawnercockpitjs"></a>

````javascript
/**
 * 📦 FIRES OF ARMAGEDDON // SPAWNER COCKPIT & INTERACTIVE LOGIC
 * Handles:
 * - Guided 5-Step Phase Tracker & Round Flow Cockpit
 * - Solo Mode 2x SP Automation & Command Phase SP Claims
 * - Misery Live Spawner Modifiers (#7 Unlucky Night 3D6, #13 Pincer Maneuver)
 * - Verbatim Misery & Secondary Mission Outcomes, Tallies & Saved Card Vault
 * - Enhanced Resupply Shop with Misery Lockouts & Variable X-SP Calculators
 */

(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    const exports = factory();
    Object.assign(root, exports);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {

  // Global trackers for card tallies and saved secondary rewards
  const gRoot = typeof window !== 'undefined' ? window : globalThis;
  gRoot.secondaryTallyMap = gRoot.secondaryTallyMap || {};
  gRoot.savedSecondaryRewards = gRoot.savedSecondaryRewards || [];
  gRoot.lastClaimedCommandRound = gRoot.lastClaimedCommandRound || 0;


  /**
   * =========================================================================
   * 1. SOLO MODE 2x SP DETECTION & COMMAND PHASE OBJECTIVE CLAIMS
   * =========================================================================
   */
  function isSoloModeActive() {
    if (typeof isSoloMode !== 'undefined' && isSoloMode) return true;
    if (typeof selectedModeVal !== 'undefined' && selectedModeVal === 'solo') return true;
    if (typeof state !== 'undefined' && state && state.mode === 'solo') return true;
    if (typeof document !== 'undefined') {
      const hudInfo = document.getElementById('hudSessionInfo')?.innerText || '';
      if (hudInfo.includes('SOLO')) return true;
      const soloCard = document.getElementById('modeCardSolo');
      if (soloCard && (soloCard.classList.contains('selected') || soloCard.classList.contains('selected-red'))) return true;
    }
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem('foa_horde_session_v1');
        if (raw) {
          const d = JSON.parse(raw);
          if (d && (d.selectedModeVal === 'solo' || d.isSoloMode)) return true;
        }
      }
    } catch (e) {}
    return false;
  }

  function syncSoloSpUiIndicators() {
    if (typeof document === 'undefined') return;
    const solo = isSoloModeActive();
    const pill = document.getElementById('soloDoubleSpHudBadge');
    if (pill) pill.classList.toggle('hidden', !solo);

    const statusText = document.getElementById('spMultiplierStatusText');
    if (statusText) {
      statusText.innerHTML = solo
        ? '<strong style="color:#60a5fa;">🛡️ Solo Mode (Rule 3.7): All SP Gains Doubled (2x SP • Cap 16/Rnd)</strong>'
        : '⚔️ Co-op Mode (1x Base SP • Cap 8/Rnd)';
    }

    document.querySelectorAll('.sp-unit-val').forEach(el => {
      el.textContent = solo ? '+2' : '+1';
    });

    const hudGainBtn = document.getElementById('hudGainSpBtn');
    if (hudGainBtn) {
      hudGainBtn.title = solo
        ? 'Gain SP (Solo Mode: +2 SP per click, or hold Shift for +1 SP)'
        : 'Gain 1 SP';
    }
  }

  function getCurrentBattleRound() {
    if (typeof battleRound !== 'undefined') return battleRound;
    if (typeof state !== 'undefined' && state && typeof state.round === 'number') return state.round;
    if (typeof document !== 'undefined') {
      const text = document.getElementById('hudRound')?.innerText || '';
      const match = text.match(/\d+/);
      return match ? parseInt(match[0], 10) : 0;
    }
    return 0;
  }

  function updateCommandObjectiveClaimButton(isClaimed, roundNum, gainedSp) {
    if (typeof document === 'undefined') return;
    const btn = document.getElementById('btnClaimCommandSp');
    if (!btn) return;
    if (isClaimed) {
      btn.disabled = true;
      btn.style.opacity = '0.65';
      btn.style.cursor = 'not-allowed';
      const spLabel = gainedSp ? ` (+${gainedSp} SP)` : '';
      btn.innerHTML = `✓ Claimed for Rnd ${roundNum}${spLabel}`;
      btn.title = `Rule 3.7: Command Phase SP already claimed for Battle Round ${roundNum}. Resets upon advancing to the next round.`;
    } else {
      btn.disabled = false;
      btn.style.opacity = '1';
      btn.style.cursor = 'pointer';
      btn.innerHTML = '🚩 Claim Command SP';
      btn.title = 'Rule 3.7: Gain 1 SP per controlled objective (+1 if FOB fortified). Automatically doubled in Solo Mode!';
    }
  }

  function resetCommandObjectiveClaimState() {
    gRoot.lastClaimedCommandRound = 0;
    updateCommandObjectiveClaimButton(false);
  }

  function awardCommandPhaseObjectiveSP() {
    const currentRnd = getCurrentBattleRound();
    if (currentRnd > 0 && gRoot.lastClaimedCommandRound === currentRnd) {
      if (typeof window !== 'undefined' && window.VoxAudio && typeof window.VoxAudio.playErrorBeep === 'function') {
        window.VoxAudio.playErrorBeep();
      }
      if (typeof alert === 'function') {
        alert(`Command Phase SP has already been claimed for Battle Round ${currentRnd}! It will reset when you advance to the next round.`);
      }
      return;
    }

    const objInput = (typeof document !== 'undefined') ? document.getElementById('quickObjCountInput') : null;
    const count = Math.max(0, parseInt(objInput?.value, 10) || 0);
    const hasFob = !!((typeof document !== 'undefined') && document.getElementById('fobFortCheck')?.checked);
    const solo = isSoloModeActive();

    // Rule 3.7: In Co-op, 1 SP per controlled objective (+1 for fortified FOB).
    // In Solo Mode, strictly 2 SP per controlled objective (+2 for fortified FOB).
    const spPerObj = solo ? 2 : 1;
    const fobBonus = (hasFob && count > 0) ? (solo ? 2 : 1) : 0;
    const awardedSp = (count * spPerObj) + fobBonus;
    if (awardedSp <= 0) {
      if (typeof alert === 'function') alert('No controlled objectives to claim! Set Controlled Obj to at least 1.');
      return;
    }

    if (typeof window !== 'undefined' && window.VoxAudio && typeof window.VoxAudio.playPowerSurge === 'function') {
      window.VoxAudio.playPowerSurge();
    }

    if (typeof window !== 'undefined' && typeof window.gainSP === 'function') {
      window.gainSP(awardedSp, { alreadyDoubled: true });
    }

    if (currentRnd > 0) {
      gRoot.lastClaimedCommandRound = currentRnd;
      updateCommandObjectiveClaimButton(true, currentRnd, awardedSp);
    }

    if (typeof saveSessionState === 'function') {
      saveSessionState();
    }

    setGuidedPhaseStep(3);
  }

  function awardHordeKillSP(kills = 1) {
    if (typeof window !== 'undefined' && window.VoxAudio && typeof window.VoxAudio.playBoltgunBlast === 'function') {
      window.VoxAudio.playBoltgunBlast();
    }
    if (typeof window !== 'undefined' && typeof window.gainSP === 'function') {
      window.gainSP(kills);
    }
  }

  /**
   * =========================================================================
   * 2. MISERY-TO-SPAWNER LIVE MODIFIERS (#7 UNLUCKY NIGHT & #13 PINCER)
   * =========================================================================
   */
  function isUnluckyNightActive() {
    if (typeof document !== 'undefined') {
      const toggle = document.getElementById('unluckyNightSpawnerCheck');
      if (toggle && toggle.checked) return true;
    }
    if (typeof state !== 'undefined' && state && Array.isArray(state.activeMiseries)) {
      return state.activeMiseries.some(c => c.id === 7);
    }
    return false;
  }

  function isPincerManeuverActive() {
    if (typeof state !== 'undefined' && state && Array.isArray(state.activeMiseries)) {
      return state.activeMiseries.some(c => c.id === 13);
    }
    return false;
  }

  function ensureMiserySpawnerControls() {
    if (typeof document === 'undefined') return;
    const firstRollCheck = document.getElementById('firstRollBonusCheck');
    if (firstRollCheck && !document.getElementById('unluckyNightSpawnerCheck')) {
      const parentRow = firstRollCheck.parentElement?.parentElement;
      if (parentRow) {
        const lbl = document.createElement('label');
        lbl.style.cssText = 'display:inline-flex; align-items:center; gap:6px; cursor:pointer; color:#fda4af; font-weight:700;';
        lbl.innerHTML = `<input type="checkbox" id="unluckyNightSpawnerCheck" style="accent-color:var(--red);" onchange="syncMiserySpawnerBanner()"> 🎲 #7 Unlucky Night (3D6 Drop Lowest)`;
        parentRow.appendChild(lbl);
      }
    }

    const cockpitBox = document.getElementById('cockpitSpawnMirrorBox');
    if (cockpitBox && !document.getElementById('miserySpawnerStatusBanner')) {
      const banner = document.createElement('div');
      banner.id = 'miserySpawnerStatusBanner';
      banner.style.cssText = 'margin-bottom:10px;';
      cockpitBox.parentElement.insertBefore(banner, cockpitBox);
    }
    syncMiserySpawnerBanner();
  }

  function syncMiserySpawnerBanner() {
    if (typeof document === 'undefined') return;
    const hasUnlucky = (typeof state !== 'undefined' && state && Array.isArray(state.activeMiseries) && state.activeMiseries.some(c => c.id === 7));
    const checkEl = document.getElementById('unluckyNightSpawnerCheck');
    if (checkEl && hasUnlucky && !checkEl.checked) {
      checkEl.checked = true;
    }

    const banner = document.getElementById('miserySpawnerStatusBanner');
    if (!banner) return;

    const extraMod = parseInt(document.getElementById('extraSpawnMod')?.value, 10) || 0;
    const dSlayer = !!document.getElementById('firstRollBonusCheck')?.checked;
    const bTrap = !!document.getElementById('baitTrapBonusCheck')?.checked;
    const unlucky = isUnluckyNightActive();
    const pincer = isPincerManeuverActive();

    const pills = [];
    if (unlucky) {
      pills.push(`<span class="badge red">🎲 MISERY #7 UNLUCKY NIGHT ACTIVE: All Spawn Rolls Use 3D6 Drop Lowest!</span>`);
    }
    if (pincer) {
      pills.push(`<span class="badge purple">🪂 MISERY #13 PINCER MANEUVER ACTIVE: Spawn +1 Extra Deep Strike Unit (>3" from Players)!</span>`);
    }
    if (extraMod !== 0) {
      pills.push(`<span class="badge gold">Extra Spawn Roll Mod: ${extraMod > 0 ? '+' + extraMod : extraMod}</span>`);
    }
    if (dSlayer) {
      pills.push(`<span class="badge red">+6 First Spawn Zone (Dragon Slayer Failed)</span>`);
    }
    if (bTrap) {
      pills.push(`<span class="badge gold">+12 First Spawn Zone (Baiting the Trap)</span>`);
    }

    banner.innerHTML = pills.length > 0
      ? `<div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center; padding:8px 10px; background:rgba(255,71,87,0.1); border:1px solid rgba(255,71,87,0.35); border-radius:8px;">
          ${pills.join(' ')}
          ${pincer ? `<button type="button" class="btn-red btn-sm" style="margin-left:auto;" onclick="rollPincerManeuverExtraSpawn()">🪂 Roll Pincer Maneuver Unit Now</button>` : ''}
         </div>`
      : '';
  }

  function adjustExtraSpawnRollMod(delta, firstZoneType = null) {
    if (typeof document === 'undefined') return;
    if (firstZoneType === 'DRAGON_SLAYER_6') {
      const el = document.getElementById('firstRollBonusCheck');
      if (el) el.checked = true;
    } else if (firstZoneType === 'BAIT_TRAP_12') {
      const el = document.getElementById('baitTrapBonusCheck');
      if (el) el.checked = true;
    } else if (delta !== 0) {
      const modEl = document.getElementById('extraSpawnMod');
      if (modEl) {
        modEl.value = String((parseInt(modEl.value, 10) || 0) + delta);
      }
    }
    syncMiserySpawnerBanner();
  }

  function rollPincerManeuverExtraSpawn() {
    if (typeof window !== 'undefined' && window.VoxAudio && typeof window.VoxAudio.playWarpStatic === 'function') {
      window.VoxAudio.playWarpStatic();
    }
    const roundNum = (typeof state !== 'undefined' && state && state.round > 0) ? state.round : 1;
    const roundMod = (roundNum === 1) ? 0 : (roundNum === 2 ? 1 : (roundNum === 3 ? 2 : 3));
    const extraMod = (typeof document !== 'undefined') ? (parseInt(document.getElementById('extraSpawnMod')?.value, 10) || 0) : 0;
    const jammerMod = (typeof document !== 'undefined' && document.getElementById('jammerCheck')?.checked) ? -1 : 0;
    const totalMod = roundMod + extraMod + jammerMod;

    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    let unmod = d1 + d2;
    let diceLabel = `${d1} + ${d2}`;

    if (isUnluckyNightActive()) {
      const d3 = Math.floor(Math.random() * 6) + 1;
      const sorted = [d1, d2, d3].sort((a, b) => b - a);
      unmod = sorted[0] + sorted[1];
      diceLabel = `3D6 Drop Lowest: ${sorted[0]} + ${sorted[1]} (dropped ${sorted[2]})`;
    }

    const modTotal = unmod + totalMod;
    const bInfo = (typeof getBracketInfo === 'function')
      ? getBracketInfo(modTotal, unmod)
      : { key: '7-9', label: 'Bracket [7–9]', pts: '151–300 pts' };

    const rngFn = () => Math.random();
    const unitName = (bInfo.key === 'NONE')
      ? 'No Unit Spawned (Unmodified 2)'
      : ((typeof pickSyncedUnitFromBracket === 'function')
        ? pickSyncedUnitFromBracket(bInfo.key, rngFn)
        : `Unit from ${bInfo.label}`);

    const cardHtml = `
      <div class="card spawn-zone" style="border-left:4px solid var(--purple); background:rgba(139,92,246,0.12); margin-bottom:10px;">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:6px;">
          <span class="badge purple">🪂 MISERY #13 • PINCER MANEUVER RESERVE SPAWN</span>
          <span class="hud-sub">Roll: ${unmod} (${diceLabel}) + Mod ${totalMod >= 0 ? '+' + totalMod : totalMod} = <strong>${modTotal}</strong></span>
        </div>
        <h4 style="margin:6px 0 2px 0; color:#fff;">${bInfo.label} (${bInfo.pts}) → <span style="color:var(--gold);">${unitName}</span></h4>
        <p class="card-desc" style="margin:4px 0 0 0; font-size:0.82rem; color:#cbd5e1;">
          <strong>Placement Rule (Misery #13):</strong> Gains <strong>Deep Strike</strong> into Horde Strategic Reserves. During the Horde's Movement phase, set up anywhere <strong>&gt;3" from all Player units</strong> — inside the <strong>Players' Deployment Zone</strong> if able (otherwise within No Man's Land).
        </p>
      </div>
    `;

    if (typeof document !== 'undefined') {
      const container = document.getElementById('spawnResultsContainer');
      if (container) {
        container.insertAdjacentHTML('afterbegin', cardHtml);
      }
    }
    mirrorSpawnerToCockpit();
  }

  /**
   * =========================================================================
   * 3. VERBATIM MISERY & SECONDARY MISSION OUTCOMES & RENDERERS
   * =========================================================================
   */
  function renderActiveMiseries() {
    if (typeof document === 'undefined') return;
    const box = document.getElementById('activeMiseriesBox');
    if (!box || typeof state === 'undefined' || !state) return;

    const deckEl = document.getElementById('misDeckCount');
    if (deckEl && Array.isArray(state.miseryDeck)) {
      deckEl.textContent = `${state.miseryDeck.length} left in deck`;
    }

    ensureMiserySpawnerControls();
    syncMiserySpawnerBanner();

    const activeList = state.activeMiseries || [];
    if (activeList.length === 0) {
      box.innerHTML = `<div class="card misery" style="opacity:0.65; padding:14px 16px; margin:0; min-height:52px; box-sizing:border-box; display:flex; align-items:center;">
        <p class="card-desc" style="margin:0;">No active Misery Cards.</p>
      </div>`;
      return;
    }

    const hasSellersMarket = activeList.some(c => c.id === 24);
    const dblToggle = document.getElementById('doubleCostToggle');
    if (dblToggle && hasSellersMarket && !dblToggle.checked) {
      dblToggle.checked = true;
      if (typeof renderResupplyTable === 'function') renderResupplyTable();
    }

    const overrides = gRoot.MISERY_CARD_OFFICIAL_OVERRIDES || {};
    box.innerHTML = activeList.map((rawCard, idx) => {
      const official = overrides[rawCard.id] || rawCard;
      const numBadge = official.num || `#${rawCard.id}/36`;
      const timingBadge = official.timing || 'Active Misery Effect';
      const verbatimDesc = official.desc || rawCard.desc || rawCard.effect || '';
      const tacticalNote = official.note || '';

      let actionButtonsHtml = '';
      if (rawCard.id === 6) {
        actionButtonsHtml = `<button type="button" class="btn-red btn-sm" onclick="resolveOrbitalBombardmentRoll(${idx})">🎲 Roll Sector (1D6) &amp; 2D3 Mortal Wounds</button><div id="orbitalRollResult_${idx}" style="margin-top:6px; font-size:0.8rem; color:var(--gold);"></div>`;
      } else if (rawCard.id === 7) {
        actionButtonsHtml = `<button type="button" class="btn-red btn-sm" onclick="rollSpawnsFromCockpit()">🎲 Re-Roll Round Spawns with 3D6 Drop Lowest</button>`;
      } else if (rawCard.id === 13) {
        actionButtonsHtml = `<button type="button" class="btn-purple btn-sm" onclick="rollPincerManeuverExtraSpawn()">🪂 Roll Pincer Maneuver Deep Strike Unit (&gt;3")</button>`;
      } else if (rawCard.id === 14) {
        actionButtonsHtml = isSoloModeActive()
          ? `<button type="button" class="btn-red btn-sm" onclick="drawMisery(2)">🛡️ Solo Rule: Reveal +2 Misery Cards Now</button>`
          : `<button type="button" class="btn-red btn-sm" onclick="if(typeof state!=='undefined'){loseSP(state.sp || 99);}">💸 Set My SP to 0 (If Selected)</button>`;
      } else if (rawCard.id === 15) {
        actionButtonsHtml = `<button type="button" class="btn-red btn-sm" onclick="loseSP(5)">💸 Deduct 5 SP (Min 0)</button>`;
      } else if (rawCard.id === 20) {
        actionButtonsHtml = `<button type="button" class="btn-red btn-sm" onclick="drawMisery(2)">🎲 Reveal +2 Misery Cards (Lamentable Luck)</button>`;
      } else if (rawCard.id === 29) {
        actionButtonsHtml = `<button type="button" class="btn-gold btn-sm" onclick="drawSecondary(false); drawSecondary(false); drawSecondary(false);">🎯 Reveal +3 Extra Secondary Missions</button>
                             <button type="button" class="btn-red btn-sm" onclick="loseSP(4)">💸 Deduct 4 SP (Most SP)</button>`;
      }

      return `
        <div class="misery-card-official">
          <div class="misery-meta-row">
            <span class="misery-card-num">MISERY ${numBadge}</span>
            <span class="misery-timing-tag">${timingBadge}</span>
          </div>
          <h4 style="margin:2px 0 4px 0; color:#fff; font-size:1.05rem;">#${rawCard.id} — ${official.name}</h4>
          <div class="misery-verbatim-body">${verbatimDesc}</div>
          ${tacticalNote ? `<div class="misery-tactical-note">${tacticalNote}</div>` : ''}
          <div style="display:flex; gap:8px; flex-wrap:wrap; align-items:center; margin-top:10px;">
            ${actionButtonsHtml}
            <button type="button" class="btn-ghost btn-sm" style="margin-left:auto;" onclick="if(typeof nullifyMisery==='function') nullifyMisery(${idx}); else if(state && state.activeMiseries){state.activeMiseries.splice(${idx},1); renderActiveMiseries();}">
              🛡️ Nullify / Discard
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  function resolveOrbitalBombardmentRoll(idx) {
    if (typeof window !== 'undefined' && window.VoxAudio && typeof window.VoxAudio.playBoltgunBlast === 'function') {
      window.VoxAudio.playBoltgunBlast();
    }
    const sector = Math.floor(Math.random() * 6) + 1;
    const d3a = Math.floor(Math.random() * 3) + 1;
    const d3b = Math.floor(Math.random() * 3) + 1;
    const mw = d3a + d3b;
    if (typeof document !== 'undefined') {
      const el = document.getElementById(`orbitalRollResult_${idx}`);
      if (el) {
        el.innerHTML = `💥 <strong>Grid Sector #${sector} Hit!</strong> Every unit in Sector #${sector} suffers <strong>${mw} Mortal Wounds</strong> (2D3: ${d3a}+${d3b})!`;
      }
    }
  }

  function adjSecondaryTally(cardId, delta) {
    if (typeof window !== 'undefined' && window.VoxAudio && typeof window.VoxAudio.playCogitatorStep === 'function') {
      window.VoxAudio.playCogitatorStep();
    }
    const cur = gRoot.secondaryTallyMap[cardId] || 0;
    const maxVal = (cardId === 16) ? 4 : 99;
    gRoot.secondaryTallyMap[cardId] = Math.max(0, Math.min(maxVal, cur + delta));
    renderActiveSecondaries();
  }

  function resolveSecondaryOutcome(idx, isSuccess) {
    if (typeof state === 'undefined' || !state || !Array.isArray(state.activeSecondaries)) return;
    const rawCard = state.activeSecondaries[idx];
    if (!rawCard) return;
    const overrides = gRoot.SECONDARY_MISSION_OFFICIAL_OVERRIDES || {};
    const official = overrides[rawCard.id] || rawCard;
    const tallyX = gRoot.secondaryTallyMap[rawCard.id] || 0;

    if (isSuccess) {
      if (typeof window !== 'undefined' && window.VoxAudio && typeof window.VoxAudio.playPowerSurge === 'function') {
        window.VoxAudio.playPowerSurge();
      }
      let spToGain = official.rewardSp || 0;
      if (official.rewardSpFormula === 'X_PLUS_1') {
        spToGain = Math.max(1, tallyX) + 1;
      } else if (official.rewardSpFormula === 'X_MAX_4') {
        spToGain = Math.min(4, Math.max(1, tallyX));
      } else if (official.rewardSpFormula === 'X_TIMES_2') {
        spToGain = Math.max(1, tallyX) * 2;
      } else if (official.rewardSpFormula === 'USE_IT_OR_LOSE_IT') {
        const roll = Math.floor(Math.random() * 6) + 1;
        spToGain = (roll >= 4) ? Math.max(7, tallyX) : 3;
      }
      if (spToGain > 0 && typeof window.gainSP === 'function') {
        window.gainSP(spToGain);
      }

      if (official.rewardCp && typeof window.adjCP === 'function') {
        window.adjCP(official.rewardCp);
      }

      if (official.rewardSpawnMod) {
        adjustExtraSpawnRollMod(official.rewardSpawnMod);
      }
      if (official.rewardFirstZoneBonus === 12) {
        adjustExtraSpawnRollMod(0, 'BAIT_TRAP_12');
      }

      if (official.savedCardBenefit) {
        gRoot.savedSecondaryRewards.push({
          id: official.id,
          name: official.name,
          benefit: official.savedCardBenefit
        });
      }

      if (official.specialRewardAction === 'CHANGE_OF_PLANS_CHOICE' && typeof window.triggerChangeOfPlans === 'function') {
        window.triggerChangeOfPlans();
      }
    } else {
      if (typeof window !== 'undefined' && window.VoxAudio && typeof window.VoxAudio.playWarpStatic === 'function') {
        window.VoxAudio.playWarpStatic();
      }
      if (official.punLoseSp && typeof window.loseSP === 'function') {
        window.loseSP(official.punLoseSp);
      }

      let miseryToDraw = official.punMisery || 0;
      let spawnModToAdd = official.punSpawnMod || 0;
      if (official.punFormula === 'X_MISERY_AND_SPAWN') {
        const xVal = Math.max(1, tallyX);
        miseryToDraw = xVal;
        spawnModToAdd = xVal;
      }

      if (spawnModToAdd !== 0) {
        adjustExtraSpawnRollMod(spawnModToAdd);
      }
      if (official.punFirstZoneBonus === 6) {
        adjustExtraSpawnRollMod(0, 'DRAGON_SLAYER_6');
      }

      if (official.punTriggerMiseryId && typeof document !== 'undefined') {
        const sel = document.getElementById('specificMiserySelect');
        if (sel) {
          sel.value = String(official.punTriggerMiseryId);
          if (typeof window.triggerSpecificMisery === 'function') window.triggerSpecificMisery();
        }
      }

      if (miseryToDraw > 0 && typeof window.drawMisery === 'function') {
        window.drawMisery(miseryToDraw);
      }

      if (official.specialPunAction === 'CHANGE_OF_PLANS_RANDOM' && typeof window.triggerOrbitalPunishment === 'function') {
        window.triggerOrbitalPunishment();
      }
    }

    state.activeSecondaries.splice(idx, 1);
    renderActiveSecondaries();
    if (typeof window.saveState === 'function') window.saveState();
  }

  function redeemSavedSecondaryCard(savedIdx) {
    if (typeof window !== 'undefined' && window.VoxAudio && typeof window.VoxAudio.playPneumaticDispense === 'function') {
      window.VoxAudio.playPneumaticDispense();
    }
    gRoot.savedSecondaryRewards.splice(savedIdx, 1);
    renderActiveSecondaries();
  }

  function renderActiveSecondaries() {
    if (typeof document === 'undefined') return;
    const box = document.getElementById('activeSecondariesBox');
    if (!box || typeof state === 'undefined' || !state) return;

    const deckEl = document.getElementById('secDeckCount');
    if (deckEl && Array.isArray(state.secondaryDeck)) {
      deckEl.textContent = `${state.secondaryDeck.length} left in deck`;
    }

    const activeList = state.activeSecondaries || [];
    const solo = isSoloModeActive();
    const overrides = gRoot.SECONDARY_MISSION_OFFICIAL_OVERRIDES || {};

    const cardsHtml = activeList.length === 0
      ? `<div class="card secondary" style="opacity:0.65; padding:14px 16px; margin:0; min-height:52px; box-sizing:border-box; display:flex; align-items:center;">
         <p class="card-desc" style="margin:0;">No active Secondary Mission.</p>
       </div>`
      : activeList.map((rawCard, idx) => {
        const official = overrides[rawCard.id] || rawCard;
        const numBadge = official.num || `${rawCard.id}/24`;
        const typeTag = official.typeTag || 'Secondary Mission';
        const tallyVal = gRoot.secondaryTallyMap[rawCard.id] || 0;

        const r1Warning = (official.round1Restricted && state.round === 1)
          ? `<div style="background:rgba(234,179,8,0.18); border:1px solid var(--gold); color:var(--gold); padding:6px 10px; border-radius:6px; font-size:0.78rem; font-weight:700; margin-bottom:8px;">
               ⚠️ ROUND 1 RESTRICTION: If drawn during Battle Round 1, click [🔄 Redraw (R1 Rule)] below to reveal another Secondary Mission and shuffle this back into the deck!
             </div>`
          : '';

        const actionHtml = official.actionBlock
          ? `<div style="background:rgba(59,130,246,0.12); border:1px solid rgba(59,130,246,0.35); border-left:3px solid var(--blue); padding:8px 10px; border-radius:6px; margin:8px 0; font-size:0.8rem; color:#dbeafe;">
               <strong style="color:#93c5fd; display:block; margin-bottom:2px;">⚡ ${official.actionTitle || 'Mission Action'} (Rule 3.10: Any Player May Perform)</strong>
               ${official.actionBlock}
             </div>`
          : '';

        const tallyHtml = official.hasTally
          ? `<div style="display:flex; align-items:center; justify-content:space-between; background:#0b0d13; border:1px solid var(--border); padding:6px 10px; border-radius:6px; margin:8px 0;">
               <span style="font-size:0.78rem; color:var(--gold); font-weight:700;">📊 ${official.tallyLabel || 'Mission Tally (X)'}:</span>
               <div style="display:flex; align-items:center; gap:8px;">
                 <button type="button" class="mini-btn" onclick="adjSecondaryTally(${rawCard.id}, -1)">−</button>
                 <strong style="font-size:1rem; color:#fff; min-width:20px; text-align:center;">${tallyVal}</strong>
                 <button type="button" class="mini-btn" onclick="adjSecondaryTally(${rawCard.id}, 1)">+</button>
               </div>
             </div>`
          : '';

        return `
          <div class="card gold" style="border-left:4px solid var(--gold); padding:14px 16px; margin-bottom:10px;">
            <div class="misery-meta-row">
              <span class="badge gold">SECONDARY ${numBadge}</span>
              <span style="font-size:0.72rem; color:var(--muted); font-weight:700; text-transform:uppercase;">${typeTag}</span>
            </div>
            <h4 style="margin:2px 0 6px 0; color:#fff; font-size:1.05rem;">#${rawCard.id} — ${official.name}</h4>
            ${r1Warning}
            ${actionHtml}
            <div style="font-size:0.88rem; color:#f1f5f9; line-height:1.5; margin-bottom:8px;">
              <strong>CONDITION:</strong> ${official.cond || rawCard.cond}
            </div>
            ${tallyHtml}
            <div class="grid-2" style="gap:8px; margin-top:8px;">
              <div style="background:rgba(34,197,94,0.1); border:1px solid rgba(34,197,94,0.35); padding:8px 10px; border-radius:6px; font-size:0.8rem;">
                <strong style="color:var(--green); display:block; margin-bottom:2px;">✅ REWARD ${solo && (official.rewardSp || official.rewardSpFormula) ? '(Solo 2x SP!)' : ''}:</strong>
                <span style="color:#dcfce7;">${official.rew || rawCard.rew}</span>
              </div>
              <div style="background:rgba(255,71,87,0.1); border:1px solid rgba(255,71,87,0.35); padding:8px 10px; border-radius:6px; font-size:0.8rem;">
                <strong style="color:var(--red); display:block; margin-bottom:2px;">❌ PUNISHMENT:</strong>
                <span style="color:#ffe4e6;">${official.pun || rawCard.pun}</span>
              </div>
            </div>
            <div style="display:flex; gap:8px; flex-wrap:wrap; margin-top:10px;">
              <button type="button" class="btn-green btn-sm" style="flex:1;" onclick="resolveSecondaryOutcome(${idx}, true)">
                ✅ Mission Success (Claim Reward)
              </button>
              <button type="button" class="btn-red btn-sm" style="flex:1;" onclick="resolveSecondaryOutcome(${idx}, false)">
                ❌ Mission Failed (Apply Punishment)
              </button>
              <button type="button" class="btn-ghost btn-sm" onclick="replaceSecondary()" title="Redraw / Replace Secondary Mission">
                🔄 Redraw
              </button>
            </div>
          </div>
        `;
      }).join('');

    const savedVaultHtml = gRoot.savedSecondaryRewards.length > 0
      ? `<div class="card" style="border:1px dashed var(--gold); background:rgba(234,179,8,0.08); padding:10px 12px; margin-top:10px;">
         <div style="font-size:0.75rem; font-weight:800; color:var(--gold); text-transform:uppercase; margin-bottom:6px;">
           🎒 Saved Secondary Reward Cards (${gRoot.savedSecondaryRewards.length})
         </div>
         ${gRoot.savedSecondaryRewards.map((item, sIdx) => `
           <div style="display:flex; justify-content:space-between; align-items:center; gap:8px; padding:6px 0; border-top:1px solid rgba(255,255,255,0.08); font-size:0.8rem;">
             <span><strong>#${item.id} ${item.name}:</strong> ${item.benefit}</span>
             <button type="button" class="btn-gold btn-sm" onclick="redeemSavedSecondaryCard(${sIdx})">Use &amp; Discard</button>
           </div>
         `).join('')}
       </div>`
      : '';

    box.innerHTML = cardsHtml + savedVaultHtml;
  }

  /**
   * =========================================================================
   * 4. SPAWNER MIRROR, UNLUCKY NIGHT 3D6 HOOK & COCKPIT CONTROLS
   * =========================================================================
   */
  function mirrorSpawnerToCockpit() {
    if (typeof document === 'undefined') return;
    const src = document.getElementById('spawnResultsContainer');
    const dest = document.getElementById('cockpitSpawnMirrorBox');
    if (!src || !dest) return;
    dest.innerHTML = src.innerHTML;

    const spawnerRoundEl = document.getElementById('spawnerBtnRound');
    const cockpitRoundEl = document.getElementById('cockpitSpawnBtnRound');
    if (spawnerRoundEl && cockpitRoundEl) {
      cockpitRoundEl.textContent = spawnerRoundEl.textContent;
    }
    syncMiserySpawnerBanner();
  }

  function rollSpawnsFromCockpit() {
    if (typeof window !== 'undefined' && typeof window.rollAllSpawnZones === 'function') {
      window.rollAllSpawnZones();
    }
    mirrorSpawnerToCockpit();
  }

  /**
   * =========================================================================
   * 5. GUIDED 5-STEP PHASE TRACKER COCKPIT
   * =========================================================================
   */
  let currentGuidedStep = 1;
  const PHASE_STEP_GUIDES = {
    1: {
      badge: "STEP 1 OF 5 • START OF BATTLE ROUND (RULE 3.2)",
      heading: "1. Reveal Misery, Secondary Mission & Spawn the Horde",
      body: "1) Discard last round's Misery cards & reveal this round's new Misery & Secondary cards.<br>2) <strong>Round 1:</strong> Spawns were rolled during Deployment (Rule 2.9). <strong>Rounds 2–5:</strong> Roll 2D6 for each Horde Spawn Zone below! (<strong>Round 6 Final Stand:</strong> 3 Misery cards, NO new Horde spawns)."
    },
    2: {
      badge: "STEP 2 OF 5 • HORDE TURN (RULE 3.1 & SECTION 5)",
      heading: "2. Horde Movement, Shooting, Charge & Fight",
      body: "The Horde always has the first turn! Move, Shoot, Charge, and Fight with all Horde units using the active <strong>Horde Primary Faction Rule</strong> (top banner) and any active <strong>Misery Card</strong> buffs below. Horde units within a Spawn Zone have Benefit of Cover and are Hidden."
    },
    3: {
      badge: "STEP 3 OF 5 • PLAYER COMMAND & RESUPPLY STEP (RULE 3.7 & 3.8)",
      heading: "3. Battle-Shock, Claim Objective SP & Spend Resupply SP",
      body: "1) Take Battle-shock tests for Player units below Half-strength (Note: Players do NOT gain core 1 CP in the Command Phase!).<br>2) Click <strong>🚩 Claim Command SP</strong> below to gain 1 SP per controlled objective (+1 for FOB) — <strong>automatically doubled to 2 SP per objective in Solo Mode!</strong><br>3) Open the <strong>Resupply Shop (Tab 3)</strong> to buy Fortifications, Strikes, or Reinforcements."
    },
    4: {
      badge: "STEP 4 OF 5 • PLAYER TURN (MOVE / SHOOT / CHARGE / FIGHT)",
      heading: "4. Execute Secondary Mission Actions & Destroy the Horde",
      body: "Players move through phases together as a single team! Whenever your attack, ability, or action destroys a Horde unit, click <strong>💀 +1 Horde Unit Destroyed</strong> below (+1 SP in Co-op / <strong>+2 SP in Solo Mode</strong>, up to your 8 or 16 SP round cap)."
    },
    5: {
      badge: "STEP 5 OF 5 • END OF BATTLE ROUND (RULE 3.6)",
      heading: "5. Resolve Secondary Mission Rewards or Punishments",
      body: "Check your Active Secondary Mission condition below: claim its <strong>Reward</strong> (SP rewards are automatically doubled in Solo Mode!) or apply its <strong>Punishment</strong> (+Misery cards or +Spawn Roll modifiers carry into next round). Then click the red <strong>Advance to Next Battle Round</strong> button at the top!"
    }
  };

  function setGuidedPhaseStep(stepNum) {
    if (typeof window !== 'undefined' && window.VoxAudio && typeof window.VoxAudio.playCogitatorStep === 'function') {
      window.VoxAudio.playCogitatorStep();
    }
    currentGuidedStep = Math.max(1, Math.min(5, Number(stepNum) || 1));
    if (typeof document !== 'undefined') {
      const buttons = document.querySelectorAll('#roundPhaseStepper .phase-step-btn');
      buttons.forEach(btn => {
        const s = parseInt(btn.getAttribute('data-step'), 10);
        btn.classList.toggle('active-step', s === currentGuidedStep);
      });

      const info = PHASE_STEP_GUIDES[currentGuidedStep];
      if (info) {
        const bEl = document.getElementById('guidedPhaseBadge');
        const hEl = document.getElementById('guidedPhaseHeading');
        const dEl = document.getElementById('guidedPhaseInstructions');
        if (bEl) bEl.textContent = info.badge;
        if (hEl) hEl.textContent = info.heading;
        if (dEl) dEl.innerHTML = info.body;
      }
    }
  }

  function stepGuidedPhase(delta) {
    let next = currentGuidedStep + delta;
    if (next > 5) next = 1;
    if (next < 1) next = 5;
    setGuidedPhaseStep(next);
  }

  function updateGuidedFlowForRound() {
    const r = getCurrentBattleRound();
    if (typeof document !== 'undefined') {
      const summaryBadge = document.getElementById('roundRuleSummaryBadge');
      const cockpitRoundEl = document.getElementById('cockpitSpawnBtnRound');
      if (cockpitRoundEl) cockpitRoundEl.textContent = String(r > 0 ? r : 1);

      if (summaryBadge) {
        if (r === 0) {
          summaryBadge.textContent = 'Deployment Step 2.9: Roll Round 1 Spawns First!';
        } else if (r === 1) {
          summaryBadge.textContent = 'Hard Mode Rnd 1: 1 Misery • +0 Spawn Mod (Spawns Rolled in Deployment)';
        } else if (r === 2) {
          summaryBadge.textContent = 'Hard Mode Rnd 2: 1 Misery • +1 Spawn Mod';
        } else if (r === 3) {
          summaryBadge.textContent = 'Hard Mode Rnd 3: 2 Misery • +2 Spawn Mod';
        } else if (r === 4) {
          summaryBadge.textContent = 'Hard Mode Rnd 4: 2 Misery • +3 Spawn Mod';
        } else if (r === 5) {
          summaryBadge.textContent = 'Hard Mode Rnd 5: 3 Misery • +3 Spawn Mod';
        } else {
          summaryBadge.textContent = 'Hard Mode Rnd 6 (Final Stand): 3 Misery • NO New Spawns • Horde Turn Only!';
        }
      }
    }
    setGuidedPhaseStep(1);
  }


  /**
   * =========================================================================
   * 7. WRAPPERS & BINDINGS FOR LIVE SPAWNER INTERACTION
   * =========================================================================
   */
  function bindSpawnerCockpitWrappers() {
    if (typeof window === 'undefined') return;

    // Wrap gainSP for Solo Mode 2x SP
    if (typeof window.gainSP === 'function' && !window.gainSP._isSoloDoubleWrapped) {
      const baseGainSP = window.gainSP;
      const wrappedGainSP = function (amount, options = {}) {
        const solo = isSoloModeActive();
        const shouldDouble = solo && !options.alreadyDoubled && !options.rawSingle;
        const finalAmount = shouldDouble ? (Number(amount) || 0) * 2 : (Number(amount) || 0);
        return baseGainSP(finalAmount, options);
      };
      wrappedGainSP._isSoloDoubleWrapped = true;
      wrappedGainSP._baseGainSP = baseGainSP;
      window.gainSP = wrappedGainSP;
    }

    // Wrap selectMode & startSession to keep Solo indicators synced
    if (typeof window.selectMode === 'function' && !window.selectMode._isSoloSyncWrapped) {
      const origSelectMode = window.selectMode;
      const wrappedSelectMode = function (mode) {
        const res = origSelectMode.apply(this, arguments);
        syncSoloSpUiIndicators();
        return res;
      };
      wrappedSelectMode._isSoloSyncWrapped = true;
      window.selectMode = wrappedSelectMode;
    }

    if (typeof window.startSession === 'function' && !window.startSession._isSoloSyncWrapped) {
      const origStartSession = window.startSession;
      const wrappedStartSession = function () {
        const res = origStartSession.apply(this, arguments);
        syncSoloSpUiIndicators();
        updateGuidedFlowForRound();
        resetCommandObjectiveClaimState();
        mirrorSpawnerToCockpit();
        return res;
      };
      wrappedStartSession._isSoloSyncWrapped = true;
      window.startSession = wrappedStartSession;
    }

    // Wrap rollAllSpawnZones for Misery #7 (Unlucky Night 3D6 Drop Lowest)
    if (typeof window.rollAllSpawnZones === 'function' && !window.rollAllSpawnZones._isUnluckyNightWrapped) {
      const origRollAllSpawnZones = window.rollAllSpawnZones;
      const wrappedRoll = function () {
        ensureMiserySpawnerControls();
        syncMiserySpawnerBanner();
        const res = origRollAllSpawnZones.apply(this, arguments);

        if (isUnluckyNightActive() && typeof document !== 'undefined') {
          const container = document.getElementById('spawnResultsContainer');
          if (container) {
            const zoneCards = container.querySelectorAll('.spawn-zone');
            zoneCards.forEach(card => {
              const d1 = Math.floor(Math.random() * 6) + 1;
              const d2 = Math.floor(Math.random() * 6) + 1;
              const d3 = Math.floor(Math.random() * 6) + 1;
              const sorted = [d1, d2, d3].sort((a, b) => b - a);
              const unmod3d6 = sorted[0] + sorted[1];

              const badge = document.createElement('div');
              badge.style.cssText = 'margin-top:6px; padding:4px 8px; background:rgba(255,71,87,0.16); border:1px solid var(--red); border-radius:6px; font-size:0.76rem; color:#fecdd3;';
              badge.innerHTML = `🎲 <strong>#7 Unlucky Night (3D6 Drop Lowest):</strong> Rolled [${sorted[0]}, ${sorted[1]}, <s>${sorted[2]}</s>] → Base 2D6 = <strong>${unmod3d6}</strong>`;
              card.appendChild(badge);
            });
          }
        }
        mirrorSpawnerToCockpit();
        return res;
      };
      wrappedRoll._isUnluckyNightWrapped = true;
      window.rollAllSpawnZones = wrappedRoll;
    }

    // Wrap clearSpawnerResults & triggerZoneRollDown to keep cockpit mirror synced
    if (typeof window.clearSpawnerResults === 'function' && !window.clearSpawnerResults._isMirrorWrapped) {
      const origClearSpawnerResults = window.clearSpawnerResults;
      const wrappedClear = function () {
        const res = origClearSpawnerResults.apply(this, arguments);
        mirrorSpawnerToCockpit();
        return res;
      };
      wrappedClear._isMirrorWrapped = true;
      window.clearSpawnerResults = wrappedClear;
    }

    if (typeof window.triggerZoneRollDown === 'function' && !window.triggerZoneRollDown._isMirrorWrapped) {
      const origTriggerZoneRollDown = window.triggerZoneRollDown;
      const wrappedTrigger = function () {
        const res = origTriggerZoneRollDown.apply(this, arguments);
        mirrorSpawnerToCockpit();
        return res;
      };
      wrappedTrigger._isMirrorWrapped = true;
      window.triggerZoneRollDown = wrappedTrigger;
    }

    // Wrap advanceBattleRound for round updates & auto-rolling spawns
    if (typeof window.advanceBattleRound === 'function' && !window.advanceBattleRound._isGuidedFlowWrapped) {
      const origAdvanceBattleRound = window.advanceBattleRound;
      const wrappedAdvance = function () {
        if (window.VoxAudio && typeof window.VoxAudio.playWarhorn === 'function') {
          window.VoxAudio.playWarhorn();
        }
        const res = origAdvanceBattleRound.apply(this, arguments);
        syncSoloSpUiIndicators();
        updateGuidedFlowForRound();
        resetCommandObjectiveClaimState();

        const r = getCurrentBattleRound();
        const autoRoll = !!document.getElementById('autoRollSpawnsOnAdvanceCheck')?.checked;
        if (autoRoll && r >= 2 && r <= 5 && typeof window.rollAllSpawnZones === 'function') {
          window.rollAllSpawnZones();
        } else {
          mirrorSpawnerToCockpit();
        }
        return res;
      };
      wrappedAdvance._isGuidedFlowWrapped = true;
      window.advanceBattleRound = wrappedAdvance;
    }
  }

  function initSpawnerCockpit() {
    bindSpawnerCockpitWrappers();
    ensureMiserySpawnerControls();
    syncSoloSpUiIndicators();
    if (typeof state !== 'undefined' && state) {
      if (Array.isArray(state.activeMiseries)) renderActiveMiseries();
      if (Array.isArray(state.activeSecondaries)) renderActiveSecondaries();
    }
    if (typeof renderResupplyTable === 'function') {
      renderResupplyTable();
    }
    if (typeof setTimeout === 'function') {
      setTimeout(mirrorSpawnerToCockpit, 150);
    }
  }

  // Auto-init in browser if DOM is ready, or queue for DOMContentLoaded
  if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initSpawnerCockpit);
    } else {
      initSpawnerCockpit();
    }
  }

  return {
    isSoloModeActive,
    syncSoloSpUiIndicators,
    getCurrentBattleRound,
    updateCommandObjectiveClaimButton,
    resetCommandObjectiveClaimState,
    awardCommandPhaseObjectiveSP,
    awardHordeKillSP,
    isUnluckyNightActive,
    isPincerManeuverActive,
    ensureMiserySpawnerControls,
    syncMiserySpawnerBanner,
    adjustExtraSpawnRollMod,
    rollPincerManeuverExtraSpawn,
    renderActiveMiseries,
    resolveOrbitalBombardmentRoll,
    adjSecondaryTally,
    resolveSecondaryOutcome,
    redeemSavedSecondaryCard,
    renderActiveSecondaries,
    mirrorSpawnerToCockpit,
    rollSpawnsFromCockpit,
    setGuidedPhaseStep,
    stepGuidedPhase,
    updateGuidedFlowForRound,

    bindSpawnerCockpitWrappers,
    initSpawnerCockpit
  };
});
````

---

## File: `js/spawner-resupply.js` <a id="file-jsspawnerresupplyjs"></a>

````javascript
/**
 * 📦 FIRES OF ARMAGEDDON // RESUPPLY SHOP & TACTICAL CALCULATORS
 * Module: js/spawner-resupply.js
 *
 * Implements:
 * - Section 7.1 Authoritative Resupply Table logic & interactive calculators
 * - Automatic Misery card lockout detection:
 *     #21 Bunkers Busted -> Fortify lockout
 *     #22 Comms Jammed -> Supply, Spawn, Strike lockout
 *     #23 The Mind Killer -> Tactics lockout
 *     #29 Fate's Fetters -> Secondary lockout
 * - Dynamic Variable X-SP Calculators:
 *     - Patched Up: Interactive wound stepper (X wounds = X SP)
 *     - Deploy Fortification: Bracket minimum roll selector (3, 5, 7, 10 SP)
 *     - Field Promotion: Sacrificed unit bracket selector + 1D6 dice roll calculation
 * - Dice Rollers:
 *     - Air Strike: 2D3 mortal wounds roll
 *     - Reinforcements Arrive: 2D6 bracket roll (fails on unmodified roll of 2)
 * - Safe purchase execution with double-cost toggle support and automatic card side-effects.
 */

(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    const exports = factory();
    Object.assign(root, exports);
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {

  const gRoot = typeof window !== 'undefined' ? window : globalThis;

  // Track variable X inputs and Field Promotion rolls for Resupply Shop
  gRoot.resupplyVarState = gRoot.resupplyVarState || {
    patchedUpWounds: 3,
    fortBracketCost: 5,
    promoBaseMin: 3,
    promoLastRoll: null
  };

  /**
   * Checks if any active Misery card locks out a given Resupply tag array.
   * @param {string[]} tags - Array of card tags (e.g. ['Fortify'], ['Tactics'])
   * @returns {string|null} Lockout explanation text if blocked, or null if allowed.
   */
  function getMiseryLockoutReason(tags = []) {
    if (typeof state === 'undefined' || !state || !Array.isArray(state.activeMiseries)) return null;
    const ids = state.activeMiseries.map(m => m.id);
    if (ids.includes(21) && tags.includes('Fortify')) {
      return 'Locked by Misery #21 (Bunkers Busted: No Fortify purchases)';
    }
    if (ids.includes(22)) {
      const blocked = tags.filter(t => ['Supply', 'Spawn', 'Strike'].includes(t));
      if (blocked.length > 0) {
        return `Locked by Misery #22 (Comms Jammed: No ${blocked.join('/')} purchases)`;
      }
    }
    if (ids.includes(23) && tags.includes('Tactics')) {
      return 'Locked by Misery #23 (The Mind Killer: No Tactics purchases)';
    }
    if (ids.includes(29) && tags.includes('Secondary')) {
      return 'Locked by Misery #29 (Fate\'s Fetters: No Secondary purchases)';
    }
    return null;
  }

  /**
   * Adjusts the number of wounds to heal for the 'Patched Up' resupply card (X = wounds).
   * @param {number} delta - Positive or negative integer adjustment
   */
  function adjPatchedUpWounds(delta) {
    gRoot.resupplyVarState.patchedUpWounds = Math.max(
      1,
      Math.min(16, (gRoot.resupplyVarState.patchedUpWounds || 3) + delta)
    );
    renderResupplyTable();
  }

  /**
   * Sets the fortification minimum bracket cost (X SP) for 'Deploy Fortification'.
   * @param {string|number} val - Cost value (3, 5, 7, 10)
   */
  function setFortBracketCost(val) {
    gRoot.resupplyVarState.fortBracketCost = parseInt(val, 10) || 5;
    renderResupplyTable();
  }

  /**
   * Sets the base minimum bracket roll for 'Field Promotion' calculation.
   * @param {string|number} val - Base minimum value (3, 5, 7, 10)
   */
  function setPromoBaseMin(val) {
    gRoot.resupplyVarState.promoBaseMin = parseInt(val, 10) || 3;
    renderResupplyTable();
  }

  /**
   * Rolls 1D6 and calculates total SP cost for 'Field Promotion' (1D6 + min bracket roll).
   */
  function rollFieldPromotionCost() {
    const d6 = Math.floor(Math.random() * 6) + 1;
    const baseMin = gRoot.resupplyVarState.promoBaseMin || 3;
    const modTotal = d6 + baseMin;
    const bInfo = (typeof getBracketInfo === 'function')
      ? getBracketInfo(modTotal, modTotal)
      : { label: `Bracket [${modTotal}]`, pts: '' };
    gRoot.resupplyVarState.promoLastRoll = {
      d6,
      baseMin,
      totalCost: modTotal,
      bracketLabel: bInfo.label,
      pts: bInfo.pts
    };
    renderResupplyTable();
  }

  /**
   * Rolls 2D3 mortal wounds for 'Air Strike' and renders impact output.
   * @param {HTMLElement} [btnEl] - Optional triggering button element
   */
  function rollAirStrikeDamage(btnEl) {
    const d3a = Math.floor(Math.random() * 3) + 1;
    const d3b = Math.floor(Math.random() * 3) + 1;
    if (typeof document !== 'undefined') {
      const outEl = document.getElementById('airStrikeRollOut');
      if (outEl) {
        outEl.innerHTML = `💥 <strong>Air Strike Impact:</strong> Each unit inside the target terrain suffers <strong>${d3a + d3b} Mortal Wounds</strong> (2D3: ${d3a}+${d3b}), then remove the terrain feature!`;
      }
    }
  }

  /**
   * Rolls 2D6 for 'Reinforcements Arrive' and displays resulting bracket or failure on 2.
   */
  function rollReinforcementsBracket() {
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const sum = d1 + d2;
    if (typeof document === 'undefined') return;
    const outEl = document.getElementById('reinforcementsRollOut');
    if (!outEl) return;
    if (sum === 2) {
      outEl.innerHTML = `⚠️ <strong>Rolled 2 (1+1) — REINFORCEMENTS FAIL!</strong> Per official card rules, an unmodified roll of 2 fails to deploy.`;
    } else {
      const bInfo = (typeof getBracketInfo === 'function')
        ? getBracketInfo(sum, sum)
        : { label: `Bracket [${sum}]`, pts: '' };
      outEl.innerHTML = `🪂 <strong>Rolled ${sum} (${d1}+${d2}) → ${bInfo.label} (${bInfo.pts})!</strong> Pick 1 unit of your choice from this bracket (or lower if none available) and place into Strategic Reserves.`;
    }
  }

  /**
   * Executes a purchase from the Resupply table, checking SP, deducting cost,
   * and applying automated marker/side-effect adjustments.
   * @param {string} itemName - Resupply card name
   * @param {number} baseSpCost - Base SP cost before doubling
   */
  function executeEnhancedResupplyPurchase(itemName, baseSpCost) {
    const isDouble = !!((typeof document !== 'undefined') && document.getElementById('doubleCostToggle')?.checked);
    const numCost = Number(baseSpCost) || 0;
    const finalCost = isDouble ? numCost * 2 : numCost;

    const curSp = (typeof state !== 'undefined' && state && typeof state.sp === 'number')
      ? state.sp
      : (typeof sp !== 'undefined' ? sp : 0);

    if (curSp < finalCost) {
      if (typeof alert === 'function') {
        alert(`Insufficient Supply Points! Need ${finalCost} SP (Currently have ${curSp} SP).`);
      }
      return;
    }

    if (typeof gRoot.loseSP === 'function') {
      gRoot.loseSP(finalCost);
    } else if (typeof loseSP === 'function') {
      loseSP(finalCost);
    }

    const overrides = gRoot.RESUPPLY_OFFICIAL_OVERRIDES || {};
    const override = overrides[itemName];
    if (override && override.autoEffect) {
      const eff = override.autoEffect;
      const adjCpFn = typeof gRoot.adjCP === 'function' ? gRoot.adjCP : (typeof adjCP === 'function' ? adjCP : null);
      const adjMarkerFn = typeof gRoot.adjMarker === 'function' ? gRoot.adjMarker : (typeof adjMarker === 'function' ? adjMarker : null);

      if (eff === 'GAIN_1_CP' && adjCpFn) {
        adjCpFn(1);
      } else if (eff === 'MARKER_TELE' && adjMarkerFn) {
        adjMarkerFn('teleCount', 1, 3);
      } else if (eff === 'MARKER_WIRE' && adjMarkerFn) {
        adjMarkerFn('wireCount', 1, 2);
      } else if (eff === 'MARKER_MINE' && typeof document !== 'undefined') {
        const mEl = document.getElementById('mineCount');
        if (mEl) mEl.textContent = '0';
      } else if (eff === 'FORT_FOB' && typeof document !== 'undefined') {
        const el = document.getElementById('fobFortCheck');
        if (el) el.checked = true;
      } else if (eff === 'FORT_JAMMER') {
        if (typeof document !== 'undefined') {
          const el = document.getElementById('jammerCheck');
          if (el) el.checked = true;
        }
        if (typeof gRoot.syncMiserySpawnerBanner === 'function') gRoot.syncMiserySpawnerBanner();
      } else if (eff === 'DRAW_SECOND_MISSION' && typeof gRoot.drawSecondary === 'function') {
        gRoot.drawSecondary(false);
      } else if (eff === 'REPLACE_MISSION' && typeof gRoot.replaceSecondary === 'function') {
        gRoot.replaceSecondary();
      } else if (eff === 'CHANGE_OF_PLANS' && typeof gRoot.triggerChangeOfPlans === 'function') {
        gRoot.triggerChangeOfPlans();
        if (typeof gRoot.switchTab === 'function') gRoot.switchTab(2);
      }
    }
    renderResupplyTable();
  }

  /**
   * Renders the Resupply Shop list with official text, tag filters, Misery lockout status,
   * and interactive calculators for variable cost options.
   */
  function renderResupplyTable() {
    if (typeof document === 'undefined') return;
    const listEl = document.getElementById('resupplyList');
    if (!listEl) return;

    const items = (typeof RESUPPLY_TABLE !== 'undefined')
      ? RESUPPLY_TABLE
      : (typeof window !== 'undefined' && window.RESUPPLY_TABLE ? window.RESUPPLY_TABLE : (typeof RESUPPLIES !== 'undefined' ? RESUPPLIES : []));

    const activeFilter = (typeof currentShopFilter !== 'undefined') ? currentShopFilter : 'All';
    const isDouble = !!document.getElementById('doubleCostToggle')?.checked;
    const curSp = (typeof state !== 'undefined' && state && typeof state.sp === 'number')
      ? state.sp
      : (typeof sp !== 'undefined' ? sp : 0);

    const overrides = gRoot.RESUPPLY_OFFICIAL_OVERRIDES || {};

    const filtered = items.filter(it => {
      if (activeFilter === 'All') return true;
      const official = overrides[it.name] || it;
      const tags = Array.isArray(official.tags)
        ? official.tags
        : (Array.isArray(it.tags) ? it.tags : (typeof it.tags === 'string' ? it.tags.split(',').map(s => s.trim()) : []));
      return tags.includes(activeFilter);
    });

    listEl.innerHTML = filtered.map(rawItem => {
      const official = overrides[rawItem.name] || rawItem;
      const tags = Array.isArray(official.tags)
        ? official.tags
        : (Array.isArray(rawItem.tags) ? rawItem.tags : (typeof rawItem.tags === 'string' ? rawItem.tags.split(',').map(s => s.trim()) : []));

      const lockoutMsg = getMiseryLockoutReason(tags);
      const limitText = official.limit || '';
      const descText = official.desc || rawItem.desc || '';

      const tagPills = tags.map(t => `<span class="badge" style="font-size:0.68rem; padding:2px 7px;">${t}</span>`).join(' ');

      let effectiveBaseCost = typeof official.cost === 'number' ? official.cost : (parseInt(rawItem.cost, 10) || 0);
      let extraControlsHtml = '';

      if (official.varType === 'PATCHED_UP') {
        effectiveBaseCost = gRoot.resupplyVarState.patchedUpWounds || 3;
        extraControlsHtml = `
          <div style="display:flex; align-items:center; justify-content:space-between; background:#0b0d13; border:1px solid var(--border); padding:6px 10px; border-radius:6px; margin-top:8px;">
            <span style="font-size:0.78rem; color:var(--gold); font-weight:700;">🩹 Select Wounds to Heal (X):</span>
            <div style="display:flex; align-items:center; gap:8px;">
              <button type="button" class="mini-btn" onclick="adjPatchedUpWounds(-1)">−</button>
              <strong style="color:#fff; font-size:0.95rem; min-width:48px; text-align:center;">${effectiveBaseCost} W</strong>
              <button type="button" class="mini-btn" onclick="adjPatchedUpWounds(1)">+</button>
            </div>
          </div>`;
      } else if (official.varType === 'DEPLOY_FORT') {
        effectiveBaseCost = gRoot.resupplyVarState.fortBracketCost || 5;
        extraControlsHtml = `
          <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px; background:#0b0d13; border:1px solid var(--border); padding:6px 10px; border-radius:6px; margin-top:8px;">
            <span style="font-size:0.78rem; color:var(--gold); font-weight:700;">🏰 Fortification Min Bracket (X):</span>
            <select onchange="setFortBracketCost(this.value)" style="padding:4px 8px; background:#141824; color:#fff; border:1px solid var(--border); border-radius:4px; font-size:0.8rem;">
              <option value="3" ${effectiveBaseCost===3?'selected':''}>Bracket [3–4] (0–75 pts) → 3 SP</option>
              <option value="5" ${effectiveBaseCost===5?'selected':''}>Bracket [5–6] (76–150 pts) → 5 SP</option>
              <option value="7" ${effectiveBaseCost===7?'selected':''}>Bracket [7–9] (151–300 pts) → 7 SP</option>
              <option value="10" ${effectiveBaseCost===10?'selected':''}>Bracket [10–12] (301–550 pts) → 10 SP</option>
            </select>
          </div>`;
      } else if (official.varType === 'FIELD_PROMO') {
        const pState = gRoot.resupplyVarState;
        effectiveBaseCost = pState.promoLastRoll ? pState.promoLastRoll.totalCost : (pState.promoBaseMin + 3);
        extraControlsHtml = `
          <div style="background:#0b0d13; border:1px solid var(--border); padding:8px 10px; border-radius:6px; margin-top:8px;">
            <div style="display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:8px;">
              <span style="font-size:0.76rem; color:var(--gold); font-weight:700;">🎖️ 1. Sacrificed Unit's Current Bracket:</span>
              <select onchange="setPromoBaseMin(this.value)" style="padding:4px 8px; background:#141824; color:#fff; border:1px solid var(--border); border-radius:4px; font-size:0.78rem;">
                <option value="3" ${pState.promoBaseMin===3?'selected':''}>Bracket [3–4] (Min Roll: 3)</option>
                <option value="5" ${pState.promoBaseMin===5?'selected':''}>Bracket [5–6] (Min Roll: 5)</option>
                <option value="7" ${pState.promoBaseMin===7?'selected':''}>Bracket [7–9] (Min Roll: 7)</option>
                <option value="10" ${pState.promoBaseMin===10?'selected':''}>Bracket [10–12] (Min Roll: 10)</option>
              </select>
              <button type="button" class="btn-gold btn-sm" onclick="rollFieldPromotionCost()">🎲 2. Roll 1D6 + Min</button>
            </div>
            ${pState.promoLastRoll ? `
              <div style="margin-top:6px; font-size:0.8rem; color:#dcfce7;">
                Rolled <strong>${pState.promoLastRoll.d6}</strong> + Min <strong>${pState.promoLastRoll.baseMin}</strong> = <strong>X = ${pState.promoLastRoll.totalCost} SP</strong> → Upgrade into <strong>${pState.promoLastRoll.bracketLabel} (${pState.promoLastRoll.pts})</strong>!
              </div>
            ` : ''}
          </div>`;
      } else if (official.hasAirStrikeRoller) {
        extraControlsHtml = `
          <div style="margin-top:8px;">
            <button type="button" class="btn-ghost btn-sm" onclick="rollAirStrikeDamage(this)">🎲 Roll 2D3 Air Strike Mortal Wounds</button>
            <div id="airStrikeRollOut" style="margin-top:4px; font-size:0.8rem; color:var(--gold);"></div>
          </div>`;
      } else if (official.hasReinforcementsRoller) {
        extraControlsHtml = `
          <div style="margin-top:8px;">
            <button type="button" class="btn-ghost btn-sm" onclick="rollReinforcementsBracket()">🎲 Roll 2D6 Reinforcements Bracket</button>
            <div id="reinforcementsRollOut" style="margin-top:4px; font-size:0.8rem; color:var(--gold);"></div>
          </div>`;
      }

      const finalSpCost = isDouble ? effectiveBaseCost * 2 : effectiveBaseCost;
      const canAfford = curSp >= finalSpCost && !lockoutMsg;

      return `
        <div class="card" style="padding:14px 16px; margin-bottom:10px; border-left:4px solid ${lockoutMsg ? 'var(--red)' : (canAfford ? 'var(--blue)' : 'var(--border)')}; opacity:${lockoutMsg ? '0.68' : '1'};">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; gap:10px; flex-wrap:wrap;">
            <div>
              <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap; margin-bottom:4px;">
                ${tagPills}
                ${limitText ? `<span style="font-size:0.72rem; color:var(--gold); font-weight:700;">• ${limitText}</span>` : ''}
              </div>
              <h4 style="margin:0; font-size:1.02rem; color:#fff;">${rawItem.name}</h4>
            </div>
            <button type="button" class="${lockoutMsg ? 'btn-red' : (canAfford ? 'btn-blue' : 'btn-ghost')} btn-sm"
              ${lockoutMsg ? 'disabled' : ''}
              onclick="executeEnhancedResupplyPurchase('${rawItem.name.replace(/'/g, "\\'")}', ${effectiveBaseCost})"
              style="font-weight:800; min-width:110px;">
              ${lockoutMsg ? '🚫 Locked' : `Buy (${finalSpCost} SP)`}
            </button>
          </div>
          ${lockoutMsg ? `<div style="margin-top:6px; padding:4px 8px; background:rgba(255,71,87,0.16); border:1px solid var(--red); border-radius:4px; font-size:0.76rem; color:#fda4af; font-weight:700;">🚫 ${lockoutMsg}</div>` : ''}
          <p class="card-desc" style="margin:8px 0 0 0; font-size:0.86rem; line-height:1.5; color:#e2e8f0;">${descText}</p>
          ${extraControlsHtml}
        </div>
      `;
    }).join('');
  }

  // Auto-render when script loads in browser if DOM is ready
  if (typeof window !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', renderResupplyTable);
    } else {
      renderResupplyTable();
    }
  }

  return {
    getMiseryLockoutReason,
    adjPatchedUpWounds,
    setFortBracketCost,
    setPromoBaseMin,
    rollFieldPromotionCost,
    rollAirStrikeDamage,
    rollReinforcementsBracket,
    executeEnhancedResupplyPurchase,
    renderResupplyTable
  };
});
````

---

## File: `js/app.js` <a id="file-jsappjs"></a>

````javascript
// Main UI and Session Controller for Fires of Armageddon

if (typeof require !== 'undefined') {
  if (typeof HORDE_FACTIONS === 'undefined') Object.assign(globalThis, require('./data.js'));
  if (typeof hashString === 'undefined') Object.assign(globalThis, require('./rng.js'));
  if (typeof getBracketInfo === 'undefined') Object.assign(globalThis, require('./spawner.js'));
}

let selectedModeVal = 'coop';
let selectedRoleVal = '1';
let activeHordeFaction = typeof HORDE_FACTIONS !== 'undefined' ? HORDE_FACTIONS[0] : null;

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
let bankedSpLost = 0;
let cp = 2;
let stratCount = 0;
let currentZoneSpawns = [];

const STORAGE_KEY_SESSION = 'foa_horde_session_v1';

let isRestoring = false;

function saveSessionState() {
  if (isRestoring || typeof localStorage === 'undefined') return;
  // Guard: strictly only save if we are on the spawner page
  const setupScreen = document.getElementById('setupScreen');
  const gameScreen = document.getElementById('gameScreen');
  if (!setupScreen && !gameScreen) return;

  try {
    const isSessionActive = !!(gameScreen && !gameScreen.classList.contains('hidden'));
    const seed = (document.getElementById('seedInput')?.value || 'HADES-1').trim().toUpperCase();
    const setupFactionMode = document.getElementById('setupFactionMode')?.value || 'SYNC_ALL';

    // 1. Capture active tab
    let activeTab = 1;
    for (let i = 1; i <= 3; i++) {
      const t = document.getElementById('tab' + i);
      if (t && !t.classList.contains('hidden')) activeTab = i;
    }

    // 2. Capture fortifications and markers
    const fortChecks = [];
    document.querySelectorAll('.fort-grid input[type="checkbox"]').forEach(cb => {
      fortChecks.push(cb.checked);
    });
    const teleCount = parseInt(document.getElementById('teleCount')?.innerText || '0', 10);
    const wireCount = parseInt(document.getElementById('wireCount')?.innerText || '0', 10);
    const mineCount = parseInt(document.getElementById('mineCount')?.innerText || '0', 10);

    // 3. Capture spawner controls
    const spawnZoneCount = document.getElementById('spawnZoneCountSelect')?.value || '3';
    const extraSpawnMod = document.getElementById('extraSpawnMod')?.value || '0';
    const firstRollBonus = !!document.getElementById('firstRollBonusCheck')?.checked;
    const baitTrapBonus = !!document.getElementById('baitTrapBonusCheck')?.checked;
    const doubleCost = !!document.getElementById('doubleCostToggle')?.checked;
    const quickObjCount = parseInt(document.getElementById('quickObjCountInput')?.value || '2', 10);
    const lastClaimedCommandRound = (typeof window !== 'undefined' && window.lastClaimedCommandRound) ? window.lastClaimedCommandRound : 0;

    const data = {
      hasActiveSession: isSessionActive,
      seed,
      selectedModeVal,
      selectedRoleVal,
      setupFactionMode,
      activeHordeFactionName: activeHordeFaction ? activeHordeFaction.name : null,
      activeTab,
      battleRound,
      sp,
      spGainedThisRound,
      spRoundCap,
      bankedSpLost,
      cp,
      stratCount,
      activeCard,
      currentChoices,
      activeMiseries,
      activeSecondaries,
      personalSecretDeck,
      sharedMiseryDeck,
      sharedSecondaryDeck,
      currentZoneSpawns,
      isPrivacyHidden,
      currentShopFilter,
      fortChecks,
      teleCount,
      wireCount,
      mineCount,
      spawnZoneCount,
      extraSpawnMod,
      firstRollBonus,
      baitTrapBonus,
      doubleCost,
      quickObjCount,
      lastClaimedCommandRound
    };
    localStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify(data));
    if (typeof debouncedPushLiveSpawnerStateToCloud === 'function') {
      debouncedPushLiveSpawnerStateToCloud();
    }
  } catch (e) {
    console.error('Failed to save session state:', e);
  }
}

function restoreSessionState() {
  if (typeof localStorage === 'undefined') return false;
  if (typeof document !== 'undefined' && !document.getElementById('setupScreen') && !document.getElementById('gameScreen')) {
    return false;
  }

  isRestoring = true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SESSION);
    if (!raw) return false;
    const data = JSON.parse(raw);
    if (!data) return false;

    // Restore setup inputs
    if (data.selectedModeVal) selectMode(data.selectedModeVal);
    if (data.selectedRoleVal) selectRole(data.selectedRoleVal);
    if (data.seed && document.getElementById('seedInput')) {
      document.getElementById('seedInput').value = data.seed;
    }
    if (data.setupFactionMode && document.getElementById('setupFactionMode')) {
      document.getElementById('setupFactionMode').value = data.setupFactionMode;
    }

    if (!data.hasActiveSession) return false;

    // Restore session variables
    isSoloMode = (data.selectedModeVal === 'solo');
    spRoundCap = data.spRoundCap || (isSoloMode ? 16 : 8);
    battleRound = (typeof data.battleRound === 'number') ? data.battleRound : 0;
    sp = (typeof data.sp === 'number') ? data.sp : 0;
    spGainedThisRound = (typeof data.spGainedThisRound === 'number') ? data.spGainedThisRound : 0;
    bankedSpLost = (typeof data.bankedSpLost === 'number') ? data.bankedSpLost : 0;
    cp = (typeof data.cp === 'number') ? data.cp : 2;
    stratCount = data.stratCount || 0;

    if (typeof data.quickObjCount === 'number' && document.getElementById('quickObjCountInput')) {
      document.getElementById('quickObjCountInput').value = data.quickObjCount;
    }
    if (typeof window !== 'undefined') {
      if (data.lastClaimedCommandRound && data.lastClaimedCommandRound === battleRound && battleRound > 0) {
        window.lastClaimedCommandRound = data.lastClaimedCommandRound;
        if (typeof window.updateCommandObjectiveClaimButton === 'function') {
          const count = typeof data.quickObjCount === 'number' ? data.quickObjCount : 2;
          const hasFob = !!document.getElementById('fobFortCheck')?.checked;
          const baseSp = count + (hasFob && count > 0 ? 1 : 0);
          const awardedSp = isSoloMode ? baseSp * 2 : baseSp;
          window.updateCommandObjectiveClaimButton(true, battleRound, awardedSp);
        }
      } else {
        window.lastClaimedCommandRound = 0;
        if (typeof window.updateCommandObjectiveClaimButton === 'function') {
          window.updateCommandObjectiveClaimButton(false);
        }
      }
    }

    activeCard = data.activeCard || null;
    currentChoices = data.currentChoices || [];
    activeMiseries = data.activeMiseries || [];
    activeSecondaries = data.activeSecondaries || [];
    personalSecretDeck = data.personalSecretDeck || [];
    sharedMiseryDeck = data.sharedMiseryDeck || [];
    sharedSecondaryDeck = data.sharedSecondaryDeck || [];
    currentZoneSpawns = data.currentZoneSpawns || [];
    isPrivacyHidden = !!data.isPrivacyHidden;
    currentShopFilter = data.currentShopFilter || 'All';

    if (data.activeHordeFactionName && typeof HORDE_FACTIONS !== 'undefined') {
      const found = HORDE_FACTIONS.find(f => f.name === data.activeHordeFactionName) || HORDE_FACTIONS[0];
      activeHordeFaction = { ...found, syncedRoomCode: data.seed || getActiveRoomCode() };
      const sel = document.getElementById('hordeFactionSelect');
      if (sel) sel.value = activeHordeFaction.name;
      renderFactionReminderBanner();
    }

    const setupScreen = document.getElementById('setupScreen');
    const gameScreen = document.getElementById('gameScreen');
    if (setupScreen) setupScreen.classList.add('hidden');
    if (gameScreen) gameScreen.classList.remove('hidden');

    const cfg = (typeof HARD_MODE_ROUNDS !== 'undefined' && HARD_MODE_ROUNDS[Math.min(battleRound, 6)]) ? HARD_MODE_ROUNDS[Math.min(battleRound, 6)] : { misery: 1, spawnMod: '2D6+0' };
    const roundTitle = document.getElementById('roundTitle');
    if (roundTitle) roundTitle.innerText = battleRound === 0 ? "Deployment & Setup" : `Battle Round ${battleRound}`;
    const spawnModDisplay = document.getElementById('spawnModDisplay');
    if (spawnModDisplay) {
      spawnModDisplay.innerText = battleRound === 0
        ? "Open Tab 4 (Spawner) to roll Round 1 Horde Spawns!"
        : `${cfg.misery} Misery Drawn • ${cfg.spawnMod}`;
    }
    const nextRoundBtn = document.getElementById('nextRoundBtn');
    if (nextRoundBtn) {
      nextRoundBtn.innerText = battleRound === 0
        ? "Begin Battle Round 1"
        : (battleRound < 6 ? `Advance to Battle Round ${battleRound + 1}` : `Battle Round 6 Active (Final Stand)`);
    }
    const spawnerBtnRound = document.getElementById('spawnerBtnRound');
    if (spawnerBtnRound) {
      spawnerBtnRound.innerText = Math.max(1, battleRound);
    }

    if (activeCard) {
      const activeCardBox = document.getElementById('activeCardBox');
      if (activeCardBox) {
        activeCardBox.innerHTML = `
          <div class="card">
            <span class="badge">${activeCard.tags}</span>
            <h4 class="card-title">${activeCard.name}</h4>
            <p class="card-desc">${activeCard.desc}</p>
          </div>
        `;
      }
      const cmCodeBox = document.getElementById('cmCodeBox');
      if (cmCodeBox) cmCodeBox.innerText = `CM Verification Code: ${activeCard.code}`;
      const selectionArea = document.getElementById('selectionArea');
      if (selectionArea) selectionArea.classList.add('hidden');
      const lockedArea = document.getElementById('lockedArea');
      if (lockedArea) lockedArea.classList.remove('hidden');
    } else if (currentChoices && currentChoices.length > 0) {
      renderSecretChoices("Select 1 Initial Secret Objective");
    }

    if (isPrivacyHidden) {
      const pw = document.getElementById('PrivacyWrapper');
      if (pw) pw.classList.add('hidden');
      const pb = document.getElementById('privacyBtn');
      if (pb) pb.innerText = "Show Objective";
    }

    // Restore fortifications
    if (data.fortChecks && Array.isArray(data.fortChecks)) {
      document.querySelectorAll('.fort-grid input[type="checkbox"]').forEach((cb, idx) => {
        if (typeof data.fortChecks[idx] === 'boolean') cb.checked = data.fortChecks[idx];
      });
    }
    if (typeof data.teleCount === 'number' && document.getElementById('teleCount')) {
      document.getElementById('teleCount').innerText = data.teleCount;
    }
    if (typeof data.wireCount === 'number' && document.getElementById('wireCount')) {
      document.getElementById('wireCount').innerText = data.wireCount;
    }
    if (typeof data.mineCount === 'number' && document.getElementById('mineCount')) {
      document.getElementById('mineCount').innerText = data.mineCount;
    }

    // Restore spawner inputs
    if (data.spawnZoneCount && document.getElementById('spawnZoneCountSelect')) {
      document.getElementById('spawnZoneCountSelect').value = data.spawnZoneCount;
    }
    if (data.extraSpawnMod && document.getElementById('extraSpawnMod')) {
      document.getElementById('extraSpawnMod').value = data.extraSpawnMod;
    }
    if (typeof data.firstRollBonus === 'boolean' && document.getElementById('firstRollBonusCheck')) {
      document.getElementById('firstRollBonusCheck').checked = data.firstRollBonus;
    }
    if (typeof data.baitTrapBonus === 'boolean' && document.getElementById('baitTrapBonusCheck')) {
      document.getElementById('baitTrapBonusCheck').checked = data.baitTrapBonus;
    }
    if (typeof data.doubleCost === 'boolean' && document.getElementById('doubleCostToggle')) {
      document.getElementById('doubleCostToggle').checked = data.doubleCost;
    }

    updateHUD();
    renderSharedDecks();
    renderResupplyTable();
    if (currentZoneSpawns && currentZoneSpawns.length > 0) {
      renderSpawnZones();
    }
    loadCustomPool();

    // Restore active tab
    if (data.activeTab && data.activeTab >= 1 && data.activeTab <= 4) {
      switchTab(data.activeTab, false);
    }

    return true;
  } catch (e) {
    console.error('Failed to restore session state:', e);
    return false;
  } finally {
    isRestoring = false;
  }
}

function clearSessionState() {
  if (typeof localStorage === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY_SESSION);
}

// Populate Spawner Faction Dropdown and restore session on load
function initApp() {
  const sel = document.getElementById('hordeFactionSelect');
  if (sel && typeof HORDE_FACTIONS !== 'undefined') {
    sel.innerHTML = HORDE_FACTIONS.map(f => `<option value="${f.name}">${f.name} (${f.ruleTitle})</option>`).join('');
  }
  restoreSessionState();
}

if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
  if (typeof document !== 'undefined' && document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', initApp);
  } else {
    initApp();
  }
  window.addEventListener('beforeunload', saveSessionState);
  window.addEventListener('pagehide', saveSessionState);
}

if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
  document.addEventListener('change', (e) => {
    if (e.target && typeof e.target.closest === 'function') {
      if (e.target.closest('#setupScreen, #gameScreen')) {
        saveSessionState();
      }
      if (e.target.closest('#pool34, #pool56, #pool79, #pool10')) {
        saveCustomPool();
      }
    }
  });
  document.addEventListener('input', (e) => {
    if (e.target && typeof e.target.closest === 'function') {
      if (e.target.closest('#seedInput, #extraSpawnMod')) {
        saveSessionState();
      }
      if (e.target.closest('#pool34, #pool56, #pool79, #pool10')) {
        saveCustomPool();
      }
    }
  });
}

function selectMode(mode) {
  selectedModeVal = mode;
  const coop = document.getElementById('modeCardCoop');
  const solo = document.getElementById('modeCardSolo');
  const roleSec = document.getElementById('playerRoleSection');
  if (coop) coop.classList.toggle('selected-red', mode === 'coop');
  if (solo) solo.classList.toggle('selected-red', mode === 'solo');
  if (roleSec) roleSec.classList.toggle('hidden', mode === 'solo');
  saveSessionState();
}

function selectRole(role) {
  selectedRoleVal = role;
  const r1 = document.getElementById('roleCard1');
  const r2 = document.getElementById('roleCard2');
  if (r1) r1.classList.toggle('selected', role === '1');
  if (r2) r2.classList.toggle('selected', role === '2');
  saveSessionState();
}

function resolveRoomSyncedFaction(code) {
  const mode = (typeof document !== 'undefined' && document.getElementById('setupFactionMode')?.value) || 'SYNC_ALL';
  const rngFac = mulberry32(hashString(code + "_HORDE_FACTION"));

  let picked = null;
  if (mode.startsWith("SYNC_")) {
    let pool = HORDE_FACTIONS;
    if (mode === "SYNC_CHAOS") pool = HORDE_FACTIONS.filter(f => f.group === "Chaos");
    if (mode === "SYNC_XENOS") pool = HORDE_FACTIONS.filter(f => f.group === "Xenos");
    if (mode === "SYNC_IMPERIUM") pool = HORDE_FACTIONS.filter(f => f.group === "Imperium");
    const idx = Math.floor(rngFac() * pool.length);
    picked = pool[idx];
  } else {
    picked = HORDE_FACTIONS.find(f => f.name === mode) || HORDE_FACTIONS[0];
  }

  activeHordeFaction = { ...picked, syncedRoomCode: code, syncedMode: mode };

  if (typeof document !== 'undefined') {
    const sel = document.getElementById('hordeFactionSelect');
    if (sel) sel.value = activeHordeFaction.name;
    renderFactionReminderBanner();
  }
  saveSessionState();
}

/**
 * Triggered whenever the user modifies the Horde Primary Faction Rule dropdown
 * on the setup screen. Immediately resolves the room-synced faction for the current
 * room code according to the chosen category/filter and persists state.
 */
function onSetupFactionModeChanged() {
  const code = getActiveRoomCode();
  resolveRoomSyncedFaction(code);
  saveSessionState();
  if (typeof debouncedPushLiveSpawnerStateToCloud === 'function') {
    debouncedPushLiveSpawnerStateToCloud();
  }
}

function manualChangeFaction() {
  const val = document.getElementById('hordeFactionSelect')?.value;
  const found = HORDE_FACTIONS.find(f => f.name === val) || HORDE_FACTIONS[0];
  activeHordeFaction = { ...found, syncedRoomCode: getActiveRoomCode(), syncedMode: val };
  renderFactionReminderBanner();

  // Clear stale spawns from previous faction so user never sees mismatched cards
  currentZoneSpawns = [];
  const spawnContainer = document.getElementById('spawnResultsContainer');
  if (spawnContainer) {
    spawnContainer.innerHTML = `
      <div class="card spawn-zone" style="opacity:0.65; text-align:center;">
        <p class="card-desc">Horde faction updated to ${activeHordeFaction.name}. Tap the green button above to roll synchronized spawns.</p>
      </div>
    `;
  }
  saveSessionState();
}

function onChangeSpawnZoneCount() {
  currentZoneSpawns = [];
  const spawnContainer = document.getElementById('spawnResultsContainer');
  if (spawnContainer) {
    spawnContainer.innerHTML = `
      <div class="card spawn-zone" style="opacity:0.65; text-align:center;">
        <p class="card-desc">Spawn zone count updated. Tap the green button above to roll synchronized spawns.</p>
      </div>
    `;
  }
  saveSessionState();
}

function renderFactionReminderBanner() {
  if (!activeHordeFaction) return;
  const t = document.getElementById('activeFactionBannerTitle');
  if (t) t.innerText = `HORDE FACTION: ${activeHordeFaction.name} — "${activeHordeFaction.ruleTitle}"`;
  const d = document.getElementById('activeFactionBannerDesc');
  if (d) d.innerText = activeHordeFaction.desc;
}

function startSession() {
  const code = getActiveRoomCode();
  const mode = selectedModeVal;
  const role = selectedRoleVal;

  isSoloMode = (mode === 'solo');
  spRoundCap = isSoloMode ? 16 : 8;

  // 1. Resolve Room-Synced Horde Faction (only if not already set by cloud room sync or if room/mode changed)
  const currentSetupMode = (typeof document !== 'undefined' && document.getElementById('setupFactionMode')?.value) || 'SYNC_ALL';
  if (!activeHordeFaction || activeHordeFaction.syncedRoomCode !== code || activeHordeFaction.syncedMode !== currentSetupMode) {
    resolveRoomSyncedFaction(code);
  }

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
    const n = (typeof document !== 'undefined') ? document.getElementById('secretPoolNotice') : null;
    if (n) n.innerText = `Solo Deck (${personalSecretDeck.length} valid cards; Multiplayer blocked)`;
  } else {
    personalSecretDeck = (role === "1") ? shuffledSecrets.slice(0, 17) : shuffledSecrets.slice(17, 34);
    const n = (typeof document !== 'undefined') ? document.getElementById('secretPoolNotice') : null;
    if (n) n.innerText = `Co-op Split Pool (${personalSecretDeck.length} cards)`;
  }

  if (!sharedMiseryDeck || sharedMiseryDeck.length === 0) {
    sharedMiseryDeck = seededShuffle(MISERIES, rngMisery);
  }
  if (!sharedSecondaryDeck || sharedSecondaryDeck.length === 0) {
    sharedSecondaryDeck = seededShuffle(SECONDARIES, rngSecond);
  }

  // Preserve existing spawns if already synced from room!
  if (!currentZoneSpawns || currentZoneSpawns.length === 0) {
    currentZoneSpawns = [];
    const spawnContainer = (typeof document !== 'undefined') ? document.getElementById('spawnResultsContainer') : null;
    if (spawnContainer) {
      spawnContainer.innerHTML = `
        <div class="card spawn-zone" style="opacity:0.65; text-align:center;">
          <p class="card-desc">Tap the green button above to generate synchronized brackets and units for each Spawn Zone.</p>
        </div>
      `;
    }
  } else {
    renderSpawnZones();
  }

  loadCustomPool();

  if (typeof document !== 'undefined') {
    const setupScreen = document.getElementById('setupScreen');
    if (setupScreen) setupScreen.classList.add('hidden');
    const gameScreen = document.getElementById('gameScreen');
    if (gameScreen) gameScreen.classList.remove('hidden');
  }

  currentChoices = drawSecretCards(2);
  renderSecretChoices("Select 1 Initial Secret Objective");
  updateHUD();
  renderSharedDecks();
  renderResupplyTable();
  if (typeof window !== 'undefined' && typeof window.resetCommandObjectiveClaimState === 'function') {
    window.resetCommandObjectiveClaimState();
  }
  switchTab(2);
  saveSessionState();
  debouncedPushLiveSpawnerStateToCloud();
}


function switchTab(tabNum, persist = true) {
  if (tabNum > 3 || tabNum < 1) tabNum = 1;
  [1, 2, 3].forEach(n => {
    const tabEl = document.getElementById('tab' + n);
    const btnEl = document.getElementById('tabBtn' + n);
    if (tabEl) tabEl.classList.toggle('hidden', n !== tabNum);
    if (btnEl) btnEl.classList.toggle('active', n === tabNum);
  });
  if (persist) saveSessionState();
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
  saveSessionState();
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
  saveSessionState();
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
  const pw = document.getElementById('PrivacyWrapper');
  if (pw) pw.classList.toggle('hidden', isPrivacyHidden);
  const pb = document.getElementById('privacyBtn');
  if (pb) pb.innerText = isPrivacyHidden ? "Show Objective" : "Hide Screen";
  saveSessionState();
}

// --- BATTLE ROUND, MISERY & SECONDARIES ---
function advanceBattleRound() {
  if (battleRound >= 6) {
    if (!confirm("Round 6 complete! Continue into Infinite Mode Round " + (battleRound + 1) + "?")) return;
  }
  battleRound++;
  spGainedThisRound = 0;
  bankedSpLost = 0;
  lastWarpSirenSeedKey = '';
  if (typeof window !== 'undefined' && typeof window.resetCommandObjectiveClaimState === 'function') {
    window.resetCommandObjectiveClaimState();
  }

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
  debouncedPushLiveSpawnerStateToCloud();
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
  saveSessionState();
}

function triggerSpecificMisery() {
  const id = parseInt(document.getElementById('specificMiserySelect').value, 10);
  const found = MISERIES.find(m => m.id === id);
  if (!found) return;
  sharedMiseryDeck = sharedMiseryDeck.filter(m => m.id !== id);
  activeMiseries.push(found);
  renderSharedDecks();
  saveSessionState();
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
  saveSessionState();
}

function replaceSecondary() {
  if (activeSecondaries.length === 0) return alert("No active Secondary Mission to replace!");
  activeSecondaries.pop();
  drawSecondary(battleRound === 1);
  saveSessionState();
}

function renderSharedDecks() {
  document.getElementById('secDeckCount').innerText = `${sharedSecondaryDeck.length} in deck`;
  document.getElementById('misDeckCount').innerText = `${sharedMiseryDeck.length} in deck`;

  const secBox = document.getElementById('activeSecondariesBox');
  if (activeSecondaries.length === 0) {
    secBox.innerHTML = `<div class="card secondary" style="opacity:0.65; padding:14px 16px; margin:0; min-height:52px; box-sizing:border-box; display:flex; align-items:center;"><p class="card-desc" style="margin:0;">No active Secondary Mission.</p></div>`;
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
    misBox.innerHTML = `<div class="card misery" style="opacity:0.65; padding:14px 16px; margin:0; min-height:52px; box-sizing:border-box; display:flex; align-items:center;"><p class="card-desc" style="margin:0;">No active Misery Cards.</p></div>`;
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
  const el34 = document.getElementById('pool34');
  if (!el34) return;
  const pool = {
    b34: el34.value,
    b56: document.getElementById('pool56') ? document.getElementById('pool56').value : '',
    b79: document.getElementById('pool79') ? document.getElementById('pool79').value : '',
    b10: document.getElementById('pool10') ? document.getElementById('pool10').value : '',
    b13: document.getElementById('pool13') ? document.getElementById('pool13').value : ''
  };
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('armageddon_horde_pool', JSON.stringify(pool));
  }
  if (typeof alert === 'function') alert("Custom Shelf Pool saved!");
}

function loadCustomPool() {
  if (typeof localStorage === 'undefined') return;
  const saved = localStorage.getItem('foa_custom_shelf_pool_v1') || localStorage.getItem('armageddon_horde_pool');
  if (!saved) return;
  try {
    const p = JSON.parse(saved);
    if (p.b34 && document.getElementById('pool34')) document.getElementById('pool34').value = p.b34;
    if (p.b56 && document.getElementById('pool56')) document.getElementById('pool56').value = p.b56;
    if (p.b79 && document.getElementById('pool79')) document.getElementById('pool79').value = p.b79;
    if (p.b10 && document.getElementById('pool10')) document.getElementById('pool10').value = p.b10;
    if (p.b13 && document.getElementById('pool13')) document.getElementById('pool13').value = p.b13;
  } catch (e) {}
}

function rollAllSpawnZones() {
  if (battleRound === 6) {
    return alert("Battle Round 6 (Hard Mode Final Stand): Do NOT roll Spawn Rolls in Round 6!");
  }
  const code = (document.getElementById('seedInput')?.value || 'HADES-1').trim().toUpperCase();
  const effRound = Math.max(1, battleRound);
  const numZones = parseInt(document.getElementById('spawnZoneCountSelect')?.value || '3', 10);
  const fac = activeHordeFaction ? activeHordeFaction.name : (document.getElementById('hordeFactionSelect')?.value || 'Chaos Daemons');
  const extraMod = parseInt(document.getElementById('extraSpawnMod')?.value, 10) || 0;
  const jammerActive = !!document.getElementById('jammerCheck')?.checked;
  const unluckyNightActive = activeMiseries.some(m => m.id === 7);
  const firstBonus6 = !!document.getElementById('firstRollBonusCheck')?.checked;
  const firstBonus12 = !!document.getElementById('baitTrapBonusCheck')?.checked;

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
  saveSessionState();
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
  saveSessionState();
}

function renderSpawnZones() {
  const container = document.getElementById('spawnResultsContainer');
  if (!container) return;
  container.innerHTML = currentZoneSpawns.map((z, idx) => {
    if (typeof z === 'string') {
      return `
        <div class="card spawn-zone">
          <span class="badge green">Spawn Zone ${idx + 1}</span>
          <h4 class="card-title" style="margin-top:6px;">${z}</h4>
        </div>
      `;
    }
    const zoneNum = z?.zone || idx + 1;
    const bracketLabel = z?.bracketLabel || 'Spawn';
    const ptsStr = z?.pts ? ` (${z.pts})` : '';
    const diceStr = z?.diceStr || '';
    const modStr = z?.totalMod !== undefined ? ` | Mod: ${z.totalMod >= 0 ? '+' + z.totalMod : z.totalMod}` : '';
    const rollStr = z?.finalRoll !== undefined ? ` → <strong>Total: ${z.finalRoll}</strong>` : '';
    const unitsStr = Array.isArray(z?.units) ? z.units.join('  +  ') : (z?.units || '');

    return `
      <div class="card spawn-zone">
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap;">
          <span class="badge green">Spawn Zone ${zoneNum} • ${bracketLabel}${ptsStr}</span>
          <span class="hud-sub">${diceStr}${modStr}${rollStr}</span>
        </div>
        <h4 class="card-title" style="margin-top:6px;">${unitsStr}</h4>
        ${(z?.bracketKey && z.bracketKey !== 'NONE' && z.bracketKey !== '3-4') ? `
          <div style="display:flex; justify-content:flex-end; margin-top:10px;">
            <button class="btn-ghost btn-sm" onclick="rollDownZone(${idx})">
              ⤵️ Roll Down (Spawn 2x Lower Bracket Units Instead)
            </button>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

// --- SP, CP & RESUPPLY SHOP ---
/**
 * Increases Supply Points (SP).
 * Accounts for previously reduced banked SP (restoring banked balance without consuming
 * from the finite round cap), and enforces the per-round finite cap (spRoundCap).
 * @param {number} amount
 */
function gainSP(amount) {
  let toAdd = amount;
  if (bankedSpLost > 0) {
    const restore = Math.min(toAdd, bankedSpLost);
    bankedSpLost -= restore;
    sp += restore;
    toAdd -= restore;
  }
  if (toAdd > 0) {
    const remainingCap = spRoundCap - spGainedThisRound;
    if (remainingCap <= 0) {
      if (typeof confirm === 'function' && !confirm(`Round cap of ${spRoundCap} SP reached! Add SP anyway?`)) {
        updateHUD();
        return;
      }
      sp += toAdd;
    } else {
      const actual = Math.min(toAdd, remainingCap);
      sp += actual;
      spGainedThisRound += actual;
      const overflow = toAdd - actual;
      if (overflow > 0) {
        if (typeof confirm === 'function' && !confirm(`Round cap of ${spRoundCap} SP reached! Add SP anyway?`)) {
          updateHUD();
          return;
        }
        sp += overflow;
      }
    }
  }
  updateHUD();
}

/**
 * Decreases Supply Points (SP).
 * Symmetrically decrements the current round's earned tally (spGainedThisRound)
 * so that reducing and increasing SP does not consume finite round cap allocations.
 * Any reduction beyond round-earned SP is tracked in bankedSpLost so restoring it
 * later does not falsely consume from the finite round cap.
 * @param {number} amount
 */
function loseSP(amount) {
  const prevSp = sp;
  sp = Math.max(0, sp - amount);
  const actualLost = prevSp - sp;
  if (actualLost > 0) {
    if (spGainedThisRound > 0) {
      const capReduction = Math.min(spGainedThisRound, actualLost);
      spGainedThisRound -= capReduction;
      const remainingLost = actualLost - capReduction;
      bankedSpLost += remainingLost;
    } else {
      bankedSpLost += actualLost;
    }
  }
  if (sp === 0) {
    bankedSpLost = 0;
  }
  updateHUD();
}

/**
 * Manually adjusts or resets the SP gained this round tally via prompt.
 */
function adjustSpRoundTally() {
  if (typeof prompt !== 'function') return;
  const input = prompt(`Set SP gained this round (0 to ${spRoundCap}):`, String(spGainedThisRound));
  if (input !== null) {
    const val = parseInt(input, 10);
    if (!isNaN(val) && val >= 0) {
      spGainedThisRound = Math.min(val, spRoundCap);
      bankedSpLost = 0;
      updateHUD();
    }
  }
}

/**
 * Manually adjusts or resets the Stratagems used tally via prompt.
 */
function adjustStratTally() {
  if (typeof prompt !== 'function') return;
  const input = prompt("Set Stratagems used tally (or 0 to reset):", String(stratCount));
  if (input !== null) {
    const val = parseInt(input, 10);
    if (!isNaN(val) && val >= 0) {
      stratCount = val;
      updateHUD();
    }
  }
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
  if (!el) return;
  let val = parseInt(el.innerText, 10) + delta;
  el.innerText = Math.max(0, Math.min(max, val));
  saveSessionState();
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
  if (typeof confirm === 'function' && !confirm("Exit current battle terminal?")) return;
  const gameScreen = document.getElementById('gameScreen');
  if (gameScreen) gameScreen.classList.add('hidden');
  const setupScreen = document.getElementById('setupScreen');
  if (setupScreen) setupScreen.classList.remove('hidden');
  saveSessionState();
}

function clearSpawnerResults() {
  currentZoneSpawns = [];
  lastWarpSirenSeedKey = '';
  const spawnContainer = document.getElementById('spawnResultsContainer');
  if (spawnContainer) {
    spawnContainer.innerHTML = `
      <div class="card spawn-zone" style="opacity:0.65; text-align:center;">
        <p class="card-desc">Tap the green button above to generate synchronized brackets and units for each Spawn Zone.</p>
      </div>
    `;
  }
  saveSessionState();
  debouncedPushLiveSpawnerStateToCloud();
}

function resetMatchToSetup() {
  if (typeof confirm === 'function' && !confirm("Reset current battle and spawner to mission setup? All active round progress, objectives, and spawn cards will be cleared.")) {
    return;
  }
  clearSessionState();
  currentZoneSpawns = [];
  lastWarpSirenSeedKey = '';
  if (typeof window !== 'undefined' && typeof window.resetCommandObjectiveClaimState === 'function') {
    window.resetCommandObjectiveClaimState();
  }

  battleRound = 0;
  activeCard = null;
  activeMiseries = [];
  activeSecondaries = [];
  personalSecretDeck = [];
  sharedMiseryDeck = [];
  sharedSecondaryDeck = [];
  currentChoices = [];
  sp = 0;
  spGainedThisRound = 0;
  bankedSpLost = 0;
  cp = 2;
  stratCount = 0;

  const spawnContainer = document.getElementById('spawnResultsContainer');
  if (spawnContainer) {
    spawnContainer.innerHTML = `
      <div class="card spawn-zone" style="opacity:0.65; text-align:center;">
        <p class="card-desc">Tap the green button above to generate synchronized brackets and units for each Spawn Zone.</p>
      </div>
    `;
  }

  const setupScreen = document.getElementById('setupScreen');
  if (setupScreen) setupScreen.classList.remove('hidden');
  const gameScreen = document.getElementById('gameScreen');
  if (gameScreen) gameScreen.classList.add('hidden');
  switchTab(1, false);
}

// =========================================================================
// LIVE CLOUD ROOM SYNCHRONIZATION (SUPABASE)
// =========================================================================
let clientDeviceId = null;
function getClientDeviceId() {
  if (clientDeviceId) return clientDeviceId;
  try {
    let saved = (typeof sessionStorage !== 'undefined') ? sessionStorage.getItem('foa_spawner_device_id') : null;
    if (!saved) {
      saved = 'dev_' + Math.random().toString(36).slice(2, 10) + '_' + Date.now();
      if (typeof sessionStorage !== 'undefined') sessionStorage.setItem('foa_spawner_device_id', saved);
    }
    clientDeviceId = saved;
  } catch (e) {
    clientDeviceId = 'dev_' + Math.random().toString(36).slice(2, 10);
  }
  return clientDeviceId;
}

let currentRoomCode = '';
let roomCodeChangeTimer = null;

function getActiveRoomCode() {
  return ((typeof document !== 'undefined' && document.getElementById('seedInput')?.value) || 'HADES-1').trim().toUpperCase();
}

async function onRoomCodeChanged(immediate = false) {
  if (roomCodeChangeTimer) {
    clearTimeout(roomCodeChangeTimer);
    roomCodeChangeTimer = null;
  }

  const runSync = async () => {
    const roomCode = getActiveRoomCode();
    if (!roomCode) return false;

    // Reset watermark when switching or pasting room codes
    currentRoomCode = roomCode;
    lastSyncedUpdatedAt = 0;
    lastKnownStateSignature = '';

    updateSyncBadge(true, `☁️ Connecting to Room (${roomCode})...`);

    // 1. Try pulling existing live session from cloud FIRST
    const pulled = await pollLiveSpawnerStateFromCloud(true);
    if (pulled) {
      return true;
    }

    // 2. If room does not exist in cloud, resolve deterministic faction for this seed
    resolveRoomSyncedFaction(roomCode);
    updateSyncBadge(true, `☁️ New Room Created (${roomCode})`);

    // 3. Register the new room in Supabase so joining allies immediately sync
    debouncedPushLiveSpawnerStateToCloud();
    return false;
  };

  if (immediate) {
    return await runSync();
  } else {
    roomCodeChangeTimer = setTimeout(runSync, 350);
  }
}

let lastSyncedUpdatedAt = 0;
let isPushingToCloud = false;
let isPollingFromCloud = false;
let pushCloudTimer = null;
let hasCompletedInitialSync = false;
let lastKnownStateSignature = '';
let lastWarpSirenSeedKey = '';

function triggerCardStaticShake(el) {
  if (!el || !el.classList) return;
  el.classList.remove('card-synced-shake');
  if (typeof el.offsetWidth === 'number') {
    void el.offsetWidth;
  }
  el.classList.add('card-synced-shake');
  setTimeout(() => {
    if (el && el.classList) el.classList.remove('card-synced-shake');
  }, 600);
}

function updateSyncBadge(isLive, labelText) {
  if (typeof document === 'undefined') return;
  const badge = document.getElementById('spawnerSyncBadge');
  if (badge) {
    badge.textContent = labelText || (isLive ? '☁️ Room Live' : '☁️ Room Offline');
    badge.classList.toggle('offline', !isLive);
    badge.style.borderColor = isLive ? 'rgba(16, 185, 129, 0.55)' : 'rgba(255, 71, 87, 0.45)';
    badge.style.color = isLive ? '#6ee7b7' : '#fca5a5';
    badge.style.background = isLive ? 'rgba(16, 185, 129, 0.14)' : 'rgba(255, 71, 87, 0.12)';
  }
  const setupBadge = document.getElementById('setupSyncPill');
  if (setupBadge && isLive) {
    setupBadge.textContent = labelText || (activeHordeFaction
      ? `☁️ Room Synced (${getActiveRoomCode()} • ${activeHordeFaction.name})`
      : '☁️ Live Room Sync Active');
  }
}


async function pushLiveSpawnerStateToCloud() {
  if (typeof fetch !== 'function') return false;
  const setupScreen = (typeof document !== 'undefined') ? document.getElementById('setupScreen') : null;
  const gameScreen = (typeof document !== 'undefined') ? document.getElementById('gameScreen') : null;
  if (!setupScreen && !gameScreen) return false;

  const roomCode = getActiveRoomCode();
  currentRoomCode = roomCode;
  const isSessionActive = !!(gameScreen && !gameScreen.classList.contains('hidden'));

  const fortChecks = [];
  if (typeof document !== 'undefined') {
    document.querySelectorAll('.fort-grid input[type="checkbox"]').forEach(cb => {
      fortChecks.push(cb.checked);
    });
  }

  const spawnZoneCount = (typeof document !== 'undefined' && document.getElementById('spawnZoneCountSelect')?.value) || '3';
  const extraSpawnMod = (typeof document !== 'undefined' && document.getElementById('extraSpawnMod')?.value) || '0';
  const setupFactionModeVal = (typeof document !== 'undefined' && document.getElementById('setupFactionMode')?.value) || 'SYNC_ALL';
  const firstRollBonus = !!(typeof document !== 'undefined' && document.getElementById('firstRollBonusCheck')?.checked);
  const baitTrapBonus = !!(typeof document !== 'undefined' && document.getElementById('baitTrapBonusCheck')?.checked);
  const doubleCost = !!(typeof document !== 'undefined' && document.getElementById('doubleCostToggle')?.checked);
  const teleCount = parseInt((typeof document !== 'undefined' && document.getElementById('teleCount')?.innerText) || '0', 10);
  const wireCount = parseInt((typeof document !== 'undefined' && document.getElementById('wireCount')?.innerText) || '0', 10);
  const mineCount = parseInt((typeof document !== 'undefined' && document.getElementById('mineCount')?.innerText) || '0', 10);

  const now = Date.now();
  lastSyncedUpdatedAt = now;

  const sharedRoomState = {
    roomCode,
    hasActiveSession: isSessionActive,
    battleRound,
    activeHordeFactionName: activeHordeFaction ? activeHordeFaction.name : null,
    setupFactionMode: setupFactionModeVal,
    spawnZoneCount,

    extraSpawnMod,
    firstRollBonus,
    baitTrapBonus,
    doubleCost,
    currentZoneSpawns,
    activeMiseries,
    sharedMiseryDeck,
    activeSecondaries,
    sharedSecondaryDeck,
    fortChecks,
    teleCount,
    wireCount,
    mineCount,
    updatedAt: now,
    lastSenderId: getClientDeviceId()
  };

  isPushingToCloud = true;
  try {
    const supabaseUrl = (typeof window !== 'undefined' && window.SUPABASE_URL) ? window.SUPABASE_URL : 'https://dsfvhjjalexqpbzqoaqb.supabase.co';
    const supabaseKey = (typeof window !== 'undefined' && window.SUPABASE_ANON_KEY) ? window.SUPABASE_ANON_KEY : 'sb_publishable_R3wXKsK7Gl54-8BNCauUNg_NIoosOOO';

    let currentHordePool = {};
    let currentNemesisStatus = {};
    try {
      const getRes = await fetch(`${supabaseUrl}/rest/v1/rpc/get_shared_spawn_pools`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        },
        body: JSON.stringify({})
      });
      if (getRes && getRes.ok) {
        const cur = await getRes.json();
        if (cur) {
          currentHordePool = cur.horde_pool || {};
          currentNemesisStatus = cur.nemesis_status || {};
        }
      }
    } catch (e) {}

    const spawnerRooms = (currentNemesisStatus && currentNemesisStatus.spawner_rooms) ? currentNemesisStatus.spawner_rooms : {};
    spawnerRooms[roomCode] = sharedRoomState;

    const saveRes = await fetch(`${supabaseUrl}/rest/v1/rpc/save_shared_spawn_pools`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        p_horde_pool: null,
        p_nemesis_status: {
          ...currentNemesisStatus,
          spawner_rooms: spawnerRooms
        }
      })
    });

    if (saveRes && saveRes.ok) {
      updateSyncBadge(true, `☁️ Room Synced (${roomCode})`);
      return true;
    }
  } catch (err) {
    console.warn('Live spawner cloud push error:', err);
  } finally {
    isPushingToCloud = false;
  }
  return false;
}

function debouncedPushLiveSpawnerStateToCloud() {
  if (pushCloudTimer) clearTimeout(pushCloudTimer);
  pushCloudTimer = setTimeout(() => {
    pushLiveSpawnerStateToCloud();
  }, 400);
}

function applyRemoteSharedState(remoteState) {
  if (!remoteState) return;
  const isSessionActive = !!remoteState.hasActiveSession;

  const prevRound = battleRound;
  const prevFaction = activeHordeFaction ? activeHordeFaction.name : null;
  const prevSpawns = Array.isArray(currentZoneSpawns) ? [...currentZoneSpawns] : [];
  const prevMiseries = Array.isArray(activeMiseries) ? [...activeMiseries] : [];
  const prevSecondaries = Array.isArray(activeSecondaries) ? [...activeSecondaries] : [];

  const roundChanged = typeof remoteState.battleRound === 'number' && remoteState.battleRound !== prevRound;
  const factionChanged = !!(remoteState.activeHordeFactionName && remoteState.activeHordeFactionName !== prevFaction);
  const spawnsChanged = Array.isArray(remoteState.currentZoneSpawns) && JSON.stringify(remoteState.currentZoneSpawns) !== JSON.stringify(prevSpawns);
  const miseriesChanged = Array.isArray(remoteState.activeMiseries) && JSON.stringify(remoteState.activeMiseries) !== JSON.stringify(prevMiseries);
  const secondariesChanged = Array.isArray(remoteState.activeSecondaries) && JSON.stringify(remoteState.activeSecondaries) !== JSON.stringify(prevSecondaries);

  if (typeof remoteState.battleRound === 'number') {
    battleRound = remoteState.battleRound;
  }

  if (remoteState.activeHordeFactionName && typeof HORDE_FACTIONS !== 'undefined') {
    const found = HORDE_FACTIONS.find(f => f.name === remoteState.activeHordeFactionName);
    if (found) {
      const mode = remoteState.setupFactionMode || found.name;
      activeHordeFaction = {
        ...found,
        syncedRoomCode: remoteState.roomCode || getActiveRoomCode(),
        syncedMode: mode
      };
      const sel = (typeof document !== 'undefined') ? document.getElementById('hordeFactionSelect') : null;
      if (sel) sel.value = found.name;
      const setupSel = (typeof document !== 'undefined') ? document.getElementById('setupFactionMode') : null;
      if (setupSel) setupSel.value = mode;
      renderFactionReminderBanner();
    }
  }

  if (remoteState.setupFactionMode && typeof document !== 'undefined') {
    const modeSel = document.getElementById('setupFactionMode');
    if (modeSel) modeSel.value = remoteState.setupFactionMode;
  }

  if (Array.isArray(remoteState.currentZoneSpawns)) {
    currentZoneSpawns = remoteState.currentZoneSpawns;
    if (currentZoneSpawns.length > 0) {
      renderSpawnZones();
      if (typeof evaluateWarpBreachIntrusions === 'function') evaluateWarpBreachIntrusions();
    }
  }

  if (Array.isArray(remoteState.activeMiseries)) {
    activeMiseries = remoteState.activeMiseries;
  }
  if (Array.isArray(remoteState.sharedMiseryDeck)) {
    sharedMiseryDeck = remoteState.sharedMiseryDeck;
  }
  if (Array.isArray(remoteState.activeSecondaries)) {
    activeSecondaries = remoteState.activeSecondaries;
  }
  if (Array.isArray(remoteState.sharedSecondaryDeck)) {
    sharedSecondaryDeck = remoteState.sharedSecondaryDeck;
  }

  renderSharedDecks();

  if (typeof document !== 'undefined') {
    if (remoteState.spawnZoneCount && document.getElementById('spawnZoneCountSelect')) {
      document.getElementById('spawnZoneCountSelect').value = remoteState.spawnZoneCount;
    }
    if (remoteState.extraSpawnMod && document.getElementById('extraSpawnMod')) {
      document.getElementById('extraSpawnMod').value = remoteState.extraSpawnMod;
    }
    if (document.getElementById('firstRollBonusCheck')) {
      document.getElementById('firstRollBonusCheck').checked = !!remoteState.firstRollBonus;
    }
    if (document.getElementById('baitTrapBonusCheck')) {
      document.getElementById('baitTrapBonusCheck').checked = !!remoteState.baitTrapBonus;
    }
    if (document.getElementById('doubleCostToggle')) {
      document.getElementById('doubleCostToggle').checked = !!remoteState.doubleCost;
    }

    if (typeof remoteState.wireCount === 'number' && document.getElementById('wireCount')) {
      document.getElementById('wireCount').innerText = String(remoteState.wireCount);
    }
    if (typeof remoteState.teleCount === 'number' && document.getElementById('teleCount')) {
      document.getElementById('teleCount').innerText = String(remoteState.teleCount);
    }
    if (typeof remoteState.mineCount === 'number' && document.getElementById('mineCount')) {
      document.getElementById('mineCount').innerText = String(remoteState.mineCount);
    }
    if (Array.isArray(remoteState.fortChecks)) {
      const cbs = document.querySelectorAll('.fort-grid input[type="checkbox"]');
      cbs.forEach((cb, idx) => {
        if (idx < remoteState.fortChecks.length) cb.checked = !!remoteState.fortChecks[idx];
      });
    }

    // Trigger subtle CRT static shake specifically on the card(s) that changed
    if (roundChanged) {
      const roundBanner = document.querySelector('#tab1 .round-banner') || document.querySelector('.round-banner');
      if (roundBanner) triggerCardStaticShake(roundBanner);
    }
    if (factionChanged) {
      const factionBanner = document.querySelector('.faction-reminder-bar');
      if (factionBanner) triggerCardStaticShake(factionBanner);
    }
    if (spawnsChanged) {
      const zoneCards = document.querySelectorAll('#spawnResultsContainer .spawn-zone');
      zoneCards.forEach((card, idx) => {
        const prevZ = prevSpawns[idx];
        const curZ = currentZoneSpawns[idx];
        if (!prevZ || JSON.stringify(prevZ) !== JSON.stringify(curZ)) {
          triggerCardStaticShake(card);
        }
      });
    }
    if (miseriesChanged) {
      const misCards = document.querySelectorAll('#activeMiseriesBox .card.misery');
      misCards.forEach((card, idx) => {
        const prevM = prevMiseries[idx];
        const curM = activeMiseries[idx];
        if (!prevM || JSON.stringify(prevM) !== JSON.stringify(curM)) {
          triggerCardStaticShake(card);
        }
      });
    }
    if (secondariesChanged) {
      const secCards = document.querySelectorAll('#activeSecondariesBox .card.secondary');
      secCards.forEach((card, idx) => {
        const prevS = prevSecondaries[idx];
        const curS = activeSecondaries[idx];
        if (!prevS || JSON.stringify(prevS) !== JSON.stringify(curS)) {
          triggerCardStaticShake(card);
        }
      });
    }
  }

  // Update round titles and HUD
  if (typeof HARD_MODE_ROUNDS !== 'undefined' && battleRound > 0 && typeof document !== 'undefined') {
    const cfg = HARD_MODE_ROUNDS[Math.min(battleRound, 6)] || HARD_MODE_ROUNDS[1];
    const roundTitle = document.getElementById('roundTitle');
    if (roundTitle) roundTitle.innerText = `Battle Round ${battleRound}`;
    const spawnModDisplay = document.getElementById('spawnModDisplay');
    if (spawnModDisplay) spawnModDisplay.innerText = `${cfg.misery} Misery Drawn • ${cfg.spawnMod}`;
    const nextRoundBtn = document.getElementById('nextRoundBtn');
    if (nextRoundBtn) {
      nextRoundBtn.innerText = battleRound < 6
        ? `Advance to Battle Round ${battleRound + 1}`
        : `Battle Round 6 Active (Final Stand)`;
    }
    const btnRound = document.getElementById('spawnerBtnRound');
    if (btnRound) btnRound.textContent = String(battleRound);
  }

  updateHUD();

  if (isSessionActive && typeof document !== 'undefined') {
    const setupScreen = document.getElementById('setupScreen');
    const gameScreen = document.getElementById('gameScreen');
    if (setupScreen) setupScreen.classList.add('hidden');
    if (gameScreen) gameScreen.classList.remove('hidden');
  }

  // Persist to local cache so reload maintains sync
  saveSessionState();
}

async function pollLiveSpawnerStateFromCloud(force = false) {
  if (typeof fetch !== 'function' || isPushingToCloud || isPollingFromCloud) return false;
  const roomCode = getActiveRoomCode();
  if (roomCode !== currentRoomCode) {
    currentRoomCode = roomCode;
    lastSyncedUpdatedAt = 0;
    lastKnownStateSignature = '';
  }

  isPollingFromCloud = true;
  try {
    const supabaseUrl = (typeof window !== 'undefined' && window.SUPABASE_URL) ? window.SUPABASE_URL : 'https://dsfvhjjalexqpbzqoaqb.supabase.co';
    const supabaseKey = (typeof window !== 'undefined' && window.SUPABASE_ANON_KEY) ? window.SUPABASE_ANON_KEY : 'sb_publishable_R3wXKsK7Gl54-8BNCauUNg_NIoosOOO';

    const res = await fetch(`${supabaseUrl}/rest/v1/rpc/get_shared_spawn_pools`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({})
    });
    if (!res || !res.ok) return false;
    const data = await res.json();
    if (!data || !data.nemesis_status || !data.nemesis_status.spawner_rooms) return false;

    const remoteState = data.nemesis_status.spawner_rooms[roomCode];
    if (!remoteState || !remoteState.updatedAt) return false;

    if (!force) {
      if (remoteState.lastSenderId === getClientDeviceId()) return false;
      if (remoteState.updatedAt <= lastSyncedUpdatedAt) return false;
    }

    const currentSig = `${remoteState.battleRound || 0}_${remoteState.activeHordeFactionName || ''}_` +
      `${JSON.stringify(remoteState.currentZoneSpawns || [])}_` +
      `${JSON.stringify(remoteState.activeMiseries || [])}_` +
      `${JSON.stringify(remoteState.activeSecondaries || [])}`;

    if (!force && currentSig === lastKnownStateSignature) {
      lastSyncedUpdatedAt = remoteState.updatedAt;
      return false;
    }

    applyRemoteSharedState(remoteState);
    lastSyncedUpdatedAt = remoteState.updatedAt;
    lastKnownStateSignature = currentSig;

    updateSyncBadge(true, `☁️ Synced with Ally (${roomCode} • R${remoteState.battleRound || 0})`);

    // Audio cue plays strictly once per newly arrived remote change (never repeats or on initial hydration)
    if (hasCompletedInitialSync) {
      if (typeof window !== 'undefined' && window.VoxAudio && typeof window.VoxAudio.playCloudSyncChime === 'function') {
        window.VoxAudio.playCloudSyncChime();
      }
    } else {
      hasCompletedInitialSync = true;
    }
    return true;
  } catch (err) {
    return false;
  } finally {
    isPollingFromCloud = false;
  }
}


// Dual export for Node.js test runner and browser environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    get battleRound() { return battleRound; },
    get activeHordeFaction() { return activeHordeFaction; },
    get selectedRoleVal() { return selectedRoleVal; },
    get cp() { return cp; },
    get sp() { return sp; },
    get spGainedThisRound() { return spGainedThisRound; },
    get spRoundCap() { return spRoundCap; },
    get bankedSpLost() { return bankedSpLost; },
    get stratCount() { return stratCount; },
    get currentZoneSpawns() { return currentZoneSpawns; },
    get activeMiseries() { return activeMiseries; },
    get activeSecondaries() { return activeSecondaries; },
    selectMode,
    selectRole,
    resolveRoomSyncedFaction,
    manualChangeFaction,
    onChangeSpawnZoneCount,
    renderFactionReminderBanner,
    startSession,
    updateHUD,
    gainSP,
    loseSP,
    adjustSpRoundTally,
    adjustStratTally,
    adjCP,
    spendCPForStrat,
    buyResupply,
    leaveSession,
    clearSpawnerResults,
    resetMatchToSetup,
    saveSessionState,
    restoreSessionState,
    clearSessionState,
    adjMarker,
    switchTab,
    togglePrivacy,
    advanceBattleRound,
    drawMisery,
    triggerSpecificMisery,
    drawSecondary,
    replaceSecondary,
    drawSecretCards,
    pickSecretCard,
    triggerChangeOfPlans,
    rollAllSpawnZones,
    rollDownZone,
    saveCustomPool,
    loadCustomPool,
    pushLiveSpawnerStateToCloud,
    pollLiveSpawnerStateFromCloud,
    getActiveRoomCode,
    onRoomCodeChanged,
    getClientDeviceId,
    updateSyncBadge,
    applyRemoteSharedState,
    triggerCardStaticShake,
    onSetupFactionModeChanged,
    getActiveHordeFaction: () => activeHordeFaction
  };
}

if (typeof window !== 'undefined') {
  window.getActiveRoomCode = getActiveRoomCode;
  window.onRoomCodeChanged = onRoomCodeChanged;
  window.onSetupFactionModeChanged = onSetupFactionModeChanged;
  window.pollLiveSpawnerStateFromCloud = pollLiveSpawnerStateFromCloud;
  window.debouncedPushLiveSpawnerStateToCloud = debouncedPushLiveSpawnerStateToCloud;
}

// =========================================================================
// CLOUD-SYNCED STANDARD HORDE POOL & [10+]/[13+] WARP-BREACH INTRUSION HOOK
// =========================================================================
(function () {
  const SUPABASE_URL_SPAWNER = 'https://dsfvhjjalexqpbzqoaqb.supabase.co';
  const SUPABASE_ANON_SPAWNER = 'sb_publishable_R3wXKsK7Gl54-8BNCauUNg_NIoosOOO';

  async function syncSpawnerPoolFromSupabase() {
    if (typeof fetch !== 'function' || typeof localStorage === 'undefined') return;
    try {
      const res = await fetch(`${SUPABASE_URL_SPAWNER}/rest/v1/rpc/get_shared_spawn_pools`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_SPAWNER,
          'Authorization': `Bearer ${SUPABASE_ANON_SPAWNER}`
        },
        body: JSON.stringify({})
      });
      if (!res || !res.ok) return;
      const data = await res.json();
      if (data && data.ok && data.horde_pool && typeof data.horde_pool === 'object' && Object.keys(data.horde_pool).length > 0) {
        if (data.horde_pool.byFaction) {
          const localRaw = localStorage.getItem('foa_custom_shelf_pool_v1');
          let localPool = {};
          try { localPool = localRaw ? JSON.parse(localRaw) : {}; } catch (e) {}
          const mergedByFaction = {
            ...(localPool.byFaction || {}),
            ...data.horde_pool.byFaction
          };
          const mergedPool = {
            ...localPool,
            ...data.horde_pool,
            byFaction: mergedByFaction
          };
          localStorage.setItem('foa_custom_shelf_pool_v1', JSON.stringify(mergedPool));
        } else {
          localStorage.setItem('foa_custom_shelf_pool_v1', JSON.stringify(data.horde_pool));
        }
        renderLiveSpawnerBracketTable();
      }
    } catch (e) {}
  }

  function renderLiveSpawnerBracketTable() {
    if (typeof document === 'undefined') return;
    const box = document.getElementById('liveSpawnerBracketWindow');
    if (!box) return;

    const facName = document.getElementById('hordeFactionSelect')?.value || '';
    let pool = { b34: '', b56: '', b79: '', b10: '', b13: '' };

    try {
      const raw = localStorage.getItem('foa_custom_shelf_pool_v1');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (facName && parsed.byFaction) {
          pool = { ...pool, ...(parsed.byFaction[facName] || {}) };
        } else if (!parsed.byFaction) {
          pool = { ...pool, ...parsed };
        }
      }
    } catch (e) {}

    const tables = (typeof HORDE_FACTION_SPAWN_TABLES !== 'undefined')
      ? HORDE_FACTION_SPAWN_TABLES
      : ((typeof window !== 'undefined' && window.HORDE_FACTION_SPAWN_TABLES) ? window.HORDE_FACTION_SPAWN_TABLES : {});
    const refTable = (facName && tables[facName]) ? tables[facName] : {};

    const showVal = (val, refArr) => {
      if (val && val.trim()) return val;
      if (Array.isArray(refArr) && refArr.length > 0) return refArr.join(' • ');
      return `<span style="color:var(--red); font-style:italic;">⚠️ Horde Pool Empty${facName ? ' for ' + facName : ''} — Configure in Mode 4 (Roster)!</span>`;
    };

    box.innerHTML = `
      <div style="margin-bottom:6px; color:var(--muted); font-size:0.78rem;">
        ☁️ <strong>Active Standard Horde Spawn Pool ${facName ? '(' + facName + ')' : ''}</strong>:
      </div>
      <table class="bracket-matrix-table">
        <thead>
          <tr>
            <th style="width:145px;">2D6 + Mod Bracket</th>
            <th>Configured ${facName || 'Horde'} Shelf Units</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><strong>[2] No Spawn</strong></td><td style="color:var(--muted);">Breach Holds (Unmodified 2 always spawns nothing)</td></tr>
          <tr><td><strong>[3–4] (0–75 pts)</strong></td><td>${showVal(pool.b34, refTable.b34)}</td></tr>
          <tr><td><strong>[5–6] (76–150 pts)</strong></td><td>${showVal(pool.b56, refTable.b56)}</td></tr>
          <tr><td><strong>[7–9] (151–300 pts)</strong></td><td>${showVal(pool.b79, refTable.b79)}</td></tr>
          <tr><td><strong>[10–12] (301–550 pts)</strong></td><td>${showVal(pool.b10, refTable.b10)} <br><span style="color:var(--red); font-size:0.74rem;">⚡ + 1D6 Warp-Breach Intrusion Check (6+ = Campaign Master Adversary/Nemesis!)</span></td></tr>
          <tr><td><strong>[13+] (551+ pts)</strong></td><td>${showVal(pool.b13, refTable.b13)} <br><span style="color:var(--red); font-size:0.74rem;">⚡ + 1D6 Warp-Breach Intrusion Check (6+ = Campaign Master Adversary/Nemesis!)</span></td></tr>
        </tbody>
      </table>
    `;
  }

  function transmitHordeIntrusionPing(zoneNum, bracketLabel, channel) {
    const roomStr = (typeof document !== 'undefined' && document.getElementById('seedInput')?.value) || 'HADES-1';
    const roundStr = (typeof document !== 'undefined' && document.getElementById('spawnerBtnRound')?.textContent) || '1';
    const facStr = (typeof document !== 'undefined' && document.getElementById('hordeFactionSelect')?.value) || 'Horde';

    const isDistant = channel === 'distant';
    const isBeta = channel === 'beta';
    const cleanBracket = bracketLabel.startsWith('Bracket') ? bracketLabel : `Bracket [${bracketLabel}]`;

    const payload = isDistant
      ? [
          `+++ ORBITAL AUGUR ARRAY // DISTANT WARP-BREACH ADVERSARY DETECTED +++`,
          `• MODE & ROOM SEED: Mode 1 (Distant Solo Horde Breach // Room: ${roomStr} // Battle Round ${roundStr})`,
          `• THEATRE & SENSOR SWEEP: Distant Sector Grid ${zoneNum} // Orbital Augur Intercept (Neither Main Player Fielded)`,
          `• REMOTE SECTOR & BRACKET: Distant Spawn Zone ${zoneNum} rolled ${cleanBracket} + [6+ WARP-BREACH INTRUSION]!`,
          `• ACTIVE DISTANT ENEMY FACTION: ${facStr}`,
          `• REQUEST FOR CAMPAIGN MASTER: Long-range augurs have detected an anomalous Warp signature / Unbound Adversary tearing into a distant engagement outside the primary lines. Please execute the Contextual 3-Tier Intrusion Roll (NEMESIS.md) for this remote sector and broadcast the telemetry intercept to BOTH command networks!`
        ].join('\n')
      : (isBeta
          ? `+++ EMERGENCY AUSPEX PING: HORDE WARP-BREACH INTRUSION DETECTED +++\n• CONDUIT: TOMB-SHIP OMNICIDAL AUSPEX [PHAERON JUNEBUG]\n• MODE & ROOM SEED: Mode 1 (Horde Command // Room: ${roomStr} // Battle Round ${roundStr})\n• TRIGGER: Spawn Zone ${zoneNum} rolled ${cleanBracket} + [6+ WARP-BREACH INTRUSION] against ${facStr}!\n• REQUEST FOR TOMB-SHIP MASTER MATRIX: Execute the Contextual 3-Tier Intrusion Roll (NEMESIS.md) and reveal which apex threat or Nemesis has hijacked Spawn Zone ${zoneNum}!`
          : `+++ EMERGENCY AUSPEX PING: HORDE WARP-BREACH INTRUSION DETECTED +++\n• CONDUIT: MUNITORUM PERIMETER AUGUR [THE EXILE // 044TH KRIEG]\n• MODE & ROOM SEED: Mode 1 (Horde Command // Room: ${roomStr} // Battle Round ${roundStr})\n• TRIGGER: Spawn Zone ${zoneNum} rolled ${cleanBracket} + [6+ WARP-BREACH INTRUSION] against ${facStr}!\n• REQUEST FOR CAMPAIGN MASTER: Please execute the Contextual 3-Tier Intrusion Roll (NEMESIS.md) and reveal which entity hijacks Spawn Zone ${zoneNum}!`);

    if (typeof window !== 'undefined' && window.VoxAudio && typeof window.VoxAudio.transmitToVox === 'function') {
      window.VoxAudio.transmitToVox(channel, payload);
    }
  }

  const transmitIntrusionPing = transmitHordeIntrusionPing;
  if (typeof window !== 'undefined') {
    window.transmitHordeIntrusionPing = transmitHordeIntrusionPing;
    window.transmitIntrusionPing = transmitIntrusionPing;
  }

  function evaluateWarpBreachIntrusions() {
    if (typeof document === 'undefined') return;
    const container = document.getElementById('spawnResultsContainer');
    if (!container) return;

    const cards = container.querySelectorAll('.spawn-zone');
    if (!cards || cards.length === 0) return;

    const roomStr = (document.getElementById('seedInput')?.value || 'HADES-1').trim().toUpperCase();
    const roundStr = (document.getElementById('spawnerBtnRound')?.textContent || '1').trim();
    let anyIntrusionTriggered = false;
    const currentWaveIntrusions = [];

    cards.forEach((card, idx) => {
      const text = card.textContent || '';
      const isBigBracket = /Bracket\s*\[(10[–\-]12|10\+|13\+)\]/i.test(text) && !/Rolled Down/i.test(text);
      if (!isBigBracket) return;

      const zoneNum = idx + 1;
      const bracketMatch = text.match(/Bracket\s*\[[^\]]+\]/i);
      const bracketLabel = bracketMatch ? bracketMatch[0] : 'Bracket [10+]';

      // Deterministic 1D6 roll seeded by Room Code + Round + Zone so both players see the exact same result!
      let intrusionRoll = 1;
      if (typeof cyrb128 === 'function' && typeof mulberry32 === 'function') {
        const seedArr = cyrb128(`${roomStr}_INTRUSION_R${roundStr}_Z${zoneNum}`);
        const rng = mulberry32(seedArr[0]);
        intrusionRoll = Math.floor(rng() * 6) + 1;
      } else if (typeof hashString === 'function' && typeof mulberry32 === 'function') {
        const rng = mulberry32(hashString(`${roomStr}_INTRUSION_R${roundStr}_Z${zoneNum}`));
        intrusionRoll = Math.floor(rng() * 6) + 1;
      } else {
        intrusionRoll = Math.floor(Math.random() * 6) + 1;
      }

      if (intrusionRoll >= 6) {
        anyIntrusionTriggered = true;
        currentWaveIntrusions.push(`${roomStr}_R${roundStr}_Z${zoneNum}_${intrusionRoll}`);
        if (!card.querySelector('.warp-intrusion-alert')) {
          card.style.borderColor = 'var(--red)';
          const alertDiv = document.createElement('div');
          alertDiv.className = 'warp-intrusion-alert';
          alertDiv.style.textAlign = 'center';
          alertDiv.innerHTML = `
            <div style="color:var(--red); font-weight:900; font-family:monospace; font-size:0.84rem; margin-bottom:4px; text-align:center;">
              ⚡ [WARP-BREACH INTRUSION ROLLED: D6 = ${intrusionRoll} (6+) — ADVERSARY / NEMESIS HIJACK!]
            </div>
            <div style="font-size:0.8rem; color:#e2e8f0; margin-bottom:8px; text-align:center;">
              Instead of the standard Horde unit above, an anomalous signature is tearing through <strong>Spawn Zone ${zoneNum}</strong>! Ping the Campaign Master on Vox to reveal the intruder:
            </div>
            <div style="display:flex; gap:8px; flex-wrap:wrap; justify-content:center; align-items:center;">
              <button type="button" class="btn-red btn-sm" onclick="transmitHordeIntrusionPing(${zoneNum}, '${bracketLabel}', 'alpha')">🦅 Ping Vox (The Exile)</button>
              <button type="button" class="btn-green btn-sm" onclick="transmitHordeIntrusionPing(${zoneNum}, '${bracketLabel}', 'beta')">💀 Ping Tomb-Ship (Junebug)</button>
              <button type="button" class="btn-gold btn-sm" onclick="transmitHordeIntrusionPing(${zoneNum}, '${bracketLabel}', 'distant')">📡 Ping Vox (Distant Intercept)</button>
            </div>
          `;
          card.appendChild(alertDiv);
        }
      } else {
        if (!card.querySelector('.intrusion-badge-clean') && !card.querySelector('.warp-intrusion-alert')) {
          const cleanNote = document.createElement('div');
          cleanNote.className = 'intrusion-badge-clean';
          cleanNote.style.cssText = 'margin-top:6px; font-size:0.74rem; color:var(--muted); font-family:monospace; text-align:center;';
          cleanNote.textContent = `[Warp-Breach Intrusion Check: D6 = ${intrusionRoll} (Needed 6+) — Standard Horde Wave Holds]`;
          card.appendChild(cleanNote);
        }
      }
    });

    const waveSignature = currentWaveIntrusions.sort().join('|');
    if (anyIntrusionTriggered && waveSignature && waveSignature !== lastWarpSirenSeedKey) {
      lastWarpSirenSeedKey = waveSignature;
      if (typeof window !== 'undefined' && window.VoxAudio && typeof window.VoxAudio.playWarpSiren === 'function') {
        window.VoxAudio.playWarpSiren();
      }
    }
  }

  if (typeof window !== 'undefined') {
    window.syncSpawnerPoolFromSupabase = syncSpawnerPoolFromSupabase;
    window.renderLiveSpawnerBracketTable = renderLiveSpawnerBracketTable;
    window.transmitHordeIntrusionPing = transmitHordeIntrusionPing;
    window.evaluateWarpBreachIntrusions = evaluateWarpBreachIntrusions;
    window.resetMatchToSetup = resetMatchToSetup;
    window.clearSpawnerResults = clearSpawnerResults;
    window.onChangeSpawnZoneCount = onChangeSpawnZoneCount;
    window.pushLiveSpawnerStateToCloud = pushLiveSpawnerStateToCloud;
    window.pollLiveSpawnerStateFromCloud = pollLiveSpawnerStateFromCloud;
    window.debouncedPushLiveSpawnerStateToCloud = debouncedPushLiveSpawnerStateToCloud;
    window.getClientDeviceId = getClientDeviceId;
    window.updateSyncBadge = updateSyncBadge;
    window.triggerCardStaticShake = triggerCardStaticShake;
    window.manualSyncSpawnerNow = function () {
      updateSyncBadge(true, '☁️ Syncing...');
      pollLiveSpawnerStateFromCloud().then(synced => {
        if (!synced) pushLiveSpawnerStateToCloud();
      });
    };

    if (typeof window.rollAllSpawnZones === 'function' && !window.rollAllSpawnZones._hasIntrusionHook) {
      const origRollAll = window.rollAllSpawnZones;
      const wrappedRollAll = function () {
        const res = origRollAll.apply(this, arguments);
        evaluateWarpBreachIntrusions();
        pushLiveSpawnerStateToCloud();
        return res;
      };
      wrappedRollAll._hasIntrusionHook = true;
      window.rollAllSpawnZones = wrappedRollAll;
    }

    if (typeof window.manualChangeFaction === 'function' && !window.manualChangeFaction._hasBracketRenderHook) {
      const origManualFaction = window.manualChangeFaction;
      const wrappedManual = function () {
        const res = origManualFaction.apply(this, arguments);
        renderLiveSpawnerBracketTable();
        debouncedPushLiveSpawnerStateToCloud();
        return res;
      };
      wrappedManual._hasBracketRenderHook = true;
      window.manualChangeFaction = wrappedManual;
    }

    let spawnerCloudPollTimer = null;
    function initSpawnerCloudPolling() {
      if (document.getElementById('setupScreen') || document.getElementById('gameScreen')) {
        syncSpawnerPoolFromSupabase();
        renderLiveSpawnerBracketTable();
        pollLiveSpawnerStateFromCloud();
        if (!spawnerCloudPollTimer) {
          spawnerCloudPollTimer = setInterval(() => {
            if (document.getElementById('setupScreen') || document.getElementById('gameScreen')) {
              pollLiveSpawnerStateFromCloud();
            } else {
              clearInterval(spawnerCloudPollTimer);
              spawnerCloudPollTimer = null;
            }
          }, 3500);
        }
      } else {
        if (spawnerCloudPollTimer) {
          clearInterval(spawnerCloudPollTimer);
          spawnerCloudPollTimer = null;
        }
      }
    }

    window.addEventListener('DOMContentLoaded', initSpawnerCloudPolling);
    window.addEventListener('vox:page-swapped', initSpawnerCloudPolling);
  }

  if (typeof module !== 'undefined' && module.exports) {
    Object.assign(module.exports, {
      syncSpawnerPoolFromSupabase,
      renderLiveSpawnerBracketTable,
      transmitHordeIntrusionPing,
      transmitIntrusionPing,
      evaluateWarpBreachIntrusions,
      triggerCardStaticShake
    });
  }
})();
````

---

## File: `js/vox-audio.js` <a id="file-jsvoxaudiojs"></a>

````javascript
/**
 * SANCTUARY OF ASH // VOX-CASTER AMBIENT PLAYLIST RANDOMIZER & TERMINAL SFX
 * Playlist: https://www.youtube.com/playlist?list=PL1PnO3JojeSmA_jPzjhuiKycUQ8BHHjek
 */
(function () {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  const PLAYLIST_ID = 'PL1PnO3JojeSmA_jPzjhuiKycUQ8BHHjek';
  const STORAGE_KEY_MUSIC = 'soa_vox_music_enabled_v1';
  const STORAGE_KEY_TRACK_INDEX = 'soa_vox_track_index_v1';
  const STORAGE_KEY_TRACK_TIME = 'soa_vox_track_time_v1';
  const STORAGE_KEY_TRACK_ID = 'soa_vox_track_id_v1';

  // Curated 20 ambient 40K soundscapes from the official Sanctuary playlist
  const VOX_TRACK_IDS = [
    '2QQerwk9ibs',
    'spnhLfHGHko',
    'BXjLjZCMYOk',
    'MOcBnBzZ2us',
    'CCQBh3XlsvQ',
    '7Z--CqggdC4',
    'YwKHbMxBzPY',
    'uHBH4zXThFI',
    'O6HcnAFhfb4',
    'XFRYg1vPc-Q',
    'tXoEite1JYo',
    'Zi2kgjDhmC0',
    'Pg19ptB8kCQ',
    'k3w4rYX1ERw',
    'k5xDyG72wHE',
    'KPObDVPb_XM',
    'VMs_p5EWri4',
    'vwJOJiOixHo',
    'Ej5LheTW5Jk',
    'isCFBRHtjFo'
  ];

  let ytPlayer = null;
  let ytReady = false;
  let isPlaying = false;
  let progressInterval = null;

  // Default to ON unless user explicitly disabled it ('false')
  let wantMusic = true;
  try {
    const stored = localStorage.getItem(STORAGE_KEY_MUSIC);
    wantMusic = stored === null ? true : stored === 'true';
  } catch (err) {
    console.warn('Could not read music preference from localStorage:', err);
  }

  // =========================================================================
  // PART 1: TACTICAL TERMINAL SFX SUITE (WEB AUDIO SYNTH - VARIETY)
  // =========================================================================
  let audioCtx = null;

  function getAudioCtx() {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (Ctx) audioCtx = new Ctx();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  /**
   * Synthesizes thematic Imperial cogitator sound effects.
   * Profiles:
   *  - 'heavy': Hydraulic bulkhead / launch button impact
   *  - 'auspex': CRT scanner cathode pulse / reticle chirp
   *  - 'pneumatic': Solenoid click / numeric valve nudge
   *  - 'card': Tactile data-slate latch / parchment card flip
   *  - 'relay': Standard cogitator copper relay switch
   */
  function playTerminalClank(profile = 'relay') {
    const ctx = getAudioCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const detune = 1 + (Math.random() * 0.12 - 0.06);

    if (profile === 'heavy' || profile === true) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(145 * detune, now);
      osc.frequency.exponentialRampToValueAtTime(32, now + 0.09);

      gain.gain.setValueAtTime(0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.095);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.1);

      const ringOsc = ctx.createOscillator();
      const ringGain = ctx.createGain();
      ringOsc.type = 'triangle';
      ringOsc.frequency.setValueAtTime(480 * detune, now);
      ringOsc.frequency.exponentialRampToValueAtTime(120, now + 0.06);

      ringGain.gain.setValueAtTime(0.08, now);
      ringGain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);

      ringOsc.connect(ringGain);
      ringGain.connect(ctx.destination);
      ringOsc.start(now);
      ringOsc.stop(now + 0.07);

    } else if (profile === 'auspex') {
      const chirpOsc = ctx.createOscillator();
      const chirpGain = ctx.createGain();
      chirpOsc.type = 'sine';
      chirpOsc.frequency.setValueAtTime(1400 * detune, now);
      chirpOsc.frequency.exponentialRampToValueAtTime(2400 * detune, now + 0.022);
      chirpOsc.frequency.exponentialRampToValueAtTime(800 * detune, now + 0.045);

      chirpGain.gain.setValueAtTime(0.12, now);
      chirpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.048);

      chirpOsc.connect(chirpGain);
      chirpGain.connect(ctx.destination);
      chirpOsc.start(now);
      chirpOsc.stop(now + 0.05);

    } else if (profile === 'pneumatic') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(380 * detune, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.025);

      gain.gain.setValueAtTime(0.11, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.028);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.03);

    } else if (profile === 'card') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(190 * detune, now);
      osc.frequency.exponentialRampToValueAtTime(55, now + 0.04);

      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.042);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.045);

      const snap = ctx.createOscillator();
      const snapGain = ctx.createGain();
      snap.type = 'square';
      snap.frequency.setValueAtTime(780 * detune, now);
      snap.frequency.exponentialRampToValueAtTime(220, now + 0.015);

      snapGain.gain.setValueAtTime(0.05, now);
      snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.016);

      snap.connect(snapGain);
      snapGain.connect(ctx.destination);
      snap.start(now);
      snap.stop(now + 0.018);

    } else {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(210 * detune, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.04);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.05);

      const clickOsc = ctx.createOscillator();
      const clickGain = ctx.createGain();
      clickOsc.type = 'square';
      clickOsc.frequency.setValueAtTime(1250 * detune, now);
      clickOsc.frequency.exponentialRampToValueAtTime(280, now + 0.018);

      clickGain.gain.setValueAtTime(0.06, now);
      clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

      clickOsc.connect(clickGain);
      clickGain.connect(ctx.destination);
      clickOsc.start(now);
      clickOsc.stop(now + 0.022);
    }
  }

  /**
   * 1. CRT Teletype / Keyboard Typing Micro-Tick
   * @param {'type'|'stream'|'redact'|'incoming'} mode
   */
  function playTeletypeTick(mode = 'stream') {
    const ctx = getAudioCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const jitter = 1 + (Math.random() * 0.18 - 0.09);

    if (mode === 'redact') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160 * jitter, now);
      osc.frequency.linearRampToValueAtTime(75, now + 0.045);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.052);
      return;
    }

    const baseFreq = mode === 'type' ? 980 : 1320;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = mode === 'type' ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(baseFreq * jitter, now);
    osc.frequency.exponentialRampToValueAtTime(260, now + 0.012);

    gain.gain.setValueAtTime(mode === 'type' ? 0.065 : 0.04, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.014);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.015);
  }

  /**
   * 2. Ceramite Dice Clatter (Cascading multi-bounce roll sound)
   */
  function playDiceClatter() {
    const ctx = getAudioCtx();
    if (!ctx) return;

    const offsets = [0, 0.045, 0.095, 0.155, 0.225, 0.305];
    offsets.forEach((offset, idx) => {
      const t = ctx.currentTime + offset;
      const pitch = (620 - idx * 55) * (0.92 + Math.random() * 0.16);
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(pitch, t);
      osc.frequency.exponentialRampToValueAtTime(110, t + 0.028);

      const vol = Math.max(0.04, 0.16 - idx * 0.02);
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.032);
    });
  }

  /**
   * 3. Master-Artificer Forge Anvil Strike (For Battle Traits & Weapon Mods)
   */
  function playForgeAnvil() {
    const ctx = getAudioCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const impact = ctx.createOscillator();
    const impGain = ctx.createGain();
    impact.type = 'sawtooth';
    impact.frequency.setValueAtTime(240, now);
    impact.frequency.exponentialRampToValueAtTime(52, now + 0.11);
    impGain.gain.setValueAtTime(0.24, now);
    impGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    impact.connect(impGain);
    impGain.connect(ctx.destination);
    impact.start(now);
    impact.stop(now + 0.13);

    [587.33, 880, 1174.66].forEach((freq, i) => {
      const ring = ctx.createOscillator();
      const rGain = ctx.createGain();
      ring.type = 'sine';
      ring.frequency.setValueAtTime(freq, now);
      rGain.gain.setValueAtTime(0.11 / (i + 1), now);
      rGain.gain.exponentialRampToValueAtTime(0.0008, now + 0.48);
      ring.connect(rGain);
      rGain.connect(ctx.destination);
      ring.start(now);
      ring.stop(now + 0.5);
    });
  }

  /**
   * 4. Sacred Stasis-Reliquary Choir Chord (For Crusade Relics)
   */
  function playRelicChoir() {
    const ctx = getAudioCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const freqs = [220, 329.63, 440, 659.25];
    freqs.forEach((f, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = idx % 2 === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(f * 0.997, now);
      osc.frequency.linearRampToValueAtTime(f * 1.003, now + 0.75);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.075 / (idx * 0.5 + 1), now + 0.12);
      gain.gain.exponentialRampToValueAtTime(0.0008, now + 0.85);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.88);
    });
  }

  /**
   * 5. Medicae / Auspex Scar Hazard Klaxon (For Out of Action Failures & Scars)
   */
  function playScarHazard() {
    const ctx = getAudioCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    [0, 0.16].forEach((offset, idx) => {
      const t = now + offset;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(idx === 0 ? 155 : 122, t);
      osc.frequency.linearRampToValueAtTime(idx === 0 ? 98 : 58, t + 0.14);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.16);
    });
  }

  /**
   * 6. Inquisitorial Dossier Wax-Seal Stamp & Astropathic Burst
   */
  function playDossierStamp() {
    const ctx = getAudioCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    [0, 0.08].forEach((offset, i) => {
      const t = now + offset;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(i === 0 ? 160 : 125, t);
      osc.frequency.exponentialRampToValueAtTime(34, t + 0.075);
      gain.gain.setValueAtTime(0.24, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.085);
    });

    [1480, 1920, 2480].forEach((freq, idx) => {
      const t = now + 0.16 + idx * 0.035;
      const chirp = ctx.createOscillator();
      const cGain = ctx.createGain();
      chirp.type = 'sine';
      chirp.frequency.setValueAtTime(freq, t);
      cGain.gain.setValueAtTime(0.08, t);
      cGain.gain.exponentialRampToValueAtTime(0.001, t + 0.03);
      chirp.connect(cGain);
      cGain.connect(ctx.destination);
      chirp.start(t);
      chirp.stop(t + 0.032);
    });
  }

  /**
   * 7. Warp-Breach Intrusion & PL 4 Classified Apex Anomaly Siren!
   *    (Sub-bass Geller-field failure rumble + dual-tritone Imperial void-klaxon)
   */
  function playWarpSiren() {
    const ctx = getAudioCtx();
    if (!ctx) return;

    const now = ctx.currentTime;

    // Layer A: Deep Geller-field sub-bass rupture (110Hz -> 32Hz)
    const sub = ctx.createOscillator();
    const subGain = ctx.createGain();
    sub.type = 'sawtooth';
    sub.frequency.setValueAtTime(110, now);
    sub.frequency.exponentialRampToValueAtTime(32, now + 0.85);
    subGain.gain.setValueAtTime(0.26, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.88);
    sub.connect(subGain);
    subGain.connect(ctx.destination);
    sub.start(now);
    sub.stop(now + 0.9);

    // Layer B: Dual-pulse dissonant tritone Red Alert klaxon
    [0, 0.42].forEach((offset) => {
      const t = now + offset;
      [440, 622.25].forEach((baseFreq, i) => {
        const siren = ctx.createOscillator();
        const sGain = ctx.createGain();
        siren.type = i === 0 ? 'sawtooth' : 'square';
        siren.frequency.setValueAtTime(baseFreq * 0.85, t);
        siren.frequency.linearRampToValueAtTime(baseFreq * 1.35, t + 0.22);
        siren.frequency.linearRampToValueAtTime(baseFreq * 0.75, t + 0.38);

        sGain.gain.setValueAtTime(0.001, t);
        sGain.gain.linearRampToValueAtTime(i === 0 ? 0.14 : 0.08, t + 0.04);
        sGain.gain.exponentialRampToValueAtTime(0.001, t + 0.39);

        siren.connect(sGain);
        sGain.connect(ctx.destination);
        siren.start(t);
        siren.stop(t + 0.4);
      });
    });
  }

  /**
   * 8. Orbital Auspex Threat Lock (For PL 1-3 Unbound Adversaries & Anomaly Surges)
   */
  function playAuspexLock() {
    const ctx = getAudioCtx();
    if (!ctx) return;

    const now = ctx.currentTime;
    const pings = [960, 1280, 1640, 2180];
    pings.forEach((freq, idx) => {
      const t = now + idx * 0.065;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.72, t + 0.05);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.055);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.058);
    });
  }

  /**
   * 9. Lexmechanicus Cloud Pool Sync Audio Cue (Single-Shot Soft Data Pulse)
   * Plays a subtle, non-intrusive high-tech datalink chirp strictly once.
   */
  let lastCloudSyncChimeTime = 0;
  function playCloudSyncChime(force = false) {
    const nowMs = Date.now();
    if (!force && nowMs - lastCloudSyncChimeTime < 1200) return false;
    lastCloudSyncChimeTime = nowMs;

    const ctx = getAudioCtx();
    if (!ctx) return false;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1046.5, now);

    gain.gain.setValueAtTime(0.045, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.075);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.08);
    return true;
  }


  /**
   * 10. Heavy Bolter / Kinetic Kill Discharge
   * Synthesizes a punchy explosive round impact + mechanical shell casing ring.
   */
  function playBoltgunBlast() {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const detune = 1 + (Math.random() * 0.12 - 0.06);

    const punch = ctx.createOscillator();
    const punchGain = ctx.createGain();
    punch.type = 'sawtooth';
    punch.frequency.setValueAtTime(140 * detune, now);
    punch.frequency.exponentialRampToValueAtTime(28, now + 0.11);
    punchGain.gain.setValueAtTime(0.26, now);
    punchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    punch.connect(punchGain);
    punchGain.connect(ctx.destination);
    punch.start(now);
    punch.stop(now + 0.13);

    const crack = ctx.createOscillator();
    const crackGain = ctx.createGain();
    crack.type = 'square';
    crack.frequency.setValueAtTime(420 * detune, now);
    crack.frequency.exponentialRampToValueAtTime(70, now + 0.05);
    crackGain.gain.setValueAtTime(0.18, now);
    crackGain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);
    crack.connect(crackGain);
    crackGain.connect(ctx.destination);
    crack.start(now);
    crack.stop(now + 0.06);

    const ring = ctx.createOscillator();
    const ringGain = ctx.createGain();
    ring.type = 'sine';
    ring.frequency.setValueAtTime(1860 * detune, now + 0.04);
    ring.frequency.exponentialRampToValueAtTime(940, now + 0.16);
    ringGain.gain.setValueAtTime(0.001, now);
    ringGain.gain.setValueAtTime(0.06, now + 0.04);
    ringGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    ring.connect(ringGain);
    ringGain.connect(ctx.destination);
    ring.start(now + 0.04);
    ring.stop(now + 0.19);
  }

  /**
   * 11. Plasma Power Surge / Resource Gain Chime
   * Synthesizes an ascending tri-tone crystal harmonic for acquiring SP, CP, or Objectives.
   */
  function playPowerSurge() {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.5];

    freqs.forEach((freq, idx) => {
      const t = now + idx * 0.038;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.linearRampToValueAtTime(freq * 1.015, t + 0.12);

      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.11 / (idx * 0.3 + 1), t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.2);
    });
  }

  /**
   * 12. Munitorum Pneumatic Vault Dispenser / Purchase Clank
   * Synthesizes a heavy pneumatic pressure drop + industrial solenoid clamp for spending resources.
   */
  function playPneumaticDispense() {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    const hiss = ctx.createOscillator();
    const hissGain = ctx.createGain();
    hiss.type = 'sawtooth';
    hiss.frequency.setValueAtTime(1450, now);
    hiss.frequency.exponentialRampToValueAtTime(220, now + 0.045);
    hissGain.gain.setValueAtTime(0.09, now);
    hissGain.gain.exponentialRampToValueAtTime(0.001, now + 0.048);
    hiss.connect(hissGain);
    hissGain.connect(ctx.destination);
    hiss.start(now);
    hiss.stop(now + 0.05);

    const clank = ctx.createOscillator();
    const clankGain = ctx.createGain();
    clank.type = 'square';
    clank.frequency.setValueAtTime(260, now + 0.02);
    clank.frequency.exponentialRampToValueAtTime(55, now + 0.08);
    clankGain.gain.setValueAtTime(0.001, now);
    clankGain.gain.setValueAtTime(0.14, now + 0.02);
    clankGain.gain.exponentialRampToValueAtTime(0.001, now + 0.085);
    clank.connect(clankGain);
    clankGain.connect(ctx.destination);
    clank.start(now + 0.02);
    clank.stop(now + 0.09);
  }

  /**
   * 13. Magnetic Lock / Field Fortification Deploy Snap
   * Tactile double-click for checkboxes and marker toggles.
   */
  function playMagLock() {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    const latch = ctx.createOscillator();
    const latchGain = ctx.createGain();
    latch.type = 'square';
    latch.frequency.setValueAtTime(1180, now);
    latch.frequency.exponentialRampToValueAtTime(240, now + 0.014);
    latchGain.gain.setValueAtTime(0.07, now);
    latchGain.gain.exponentialRampToValueAtTime(0.001, now + 0.016);
    latch.connect(latchGain);
    latchGain.connect(ctx.destination);
    latch.start(now);
    latch.stop(now + 0.018);

    const mag = ctx.createOscillator();
    const magGain = ctx.createGain();
    mag.type = 'triangle';
    mag.frequency.setValueAtTime(210, now + 0.025);
    mag.frequency.exponentialRampToValueAtTime(42, now + 0.065);
    magGain.gain.setValueAtTime(0.001, now);
    magGain.gain.setValueAtTime(0.13, now + 0.025);
    magGain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
    mag.connect(magGain);
    magGain.connect(ctx.destination);
    mag.start(now + 0.025);
    mag.stop(now + 0.075);
  }

  /**
   * 14. Voidship Battle Warhorn / Round Advance Vox-Chime
   * Low Imperial brass drone announcing battle round transitions.
   */
  function playWarhorn() {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    const hornA = ctx.createOscillator();
    const gainA = ctx.createGain();
    hornA.type = 'sawtooth';
    hornA.frequency.setValueAtTime(110, now);
    hornA.frequency.linearRampToValueAtTime(108, now + 0.7);
    gainA.gain.setValueAtTime(0.001, now);
    gainA.gain.linearRampToValueAtTime(0.18, now + 0.08);
    gainA.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
    hornA.connect(gainA);
    gainA.connect(ctx.destination);
    hornA.start(now);
    hornA.stop(now + 0.8);

    const hornB = ctx.createOscillator();
    const gainB = ctx.createGain();
    hornB.type = 'triangle';
    hornB.frequency.setValueAtTime(164.8, now);
    hornB.frequency.linearRampToValueAtTime(162, now + 0.7);
    gainB.gain.setValueAtTime(0.001, now);
    gainB.gain.linearRampToValueAtTime(0.12, now + 0.1);
    gainB.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
    hornB.connect(gainB);
    gainB.connect(ctx.destination);
    hornB.start(now);
    hornB.stop(now + 0.8);
  }

  /**
   * 15. Warp Static & Empyric Dissonance
   * Eerie binaural psychic ripple when Misery cards are revealed.
   */
  function playWarpStatic() {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    [320, 326].forEach((f) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, now);
      osc.frequency.linearRampToValueAtTime(f * 0.94, now + 0.4);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.09, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.45);
    });

    const rasp = ctx.createOscillator();
    const raspGain = ctx.createGain();
    rasp.type = 'sawtooth';
    rasp.frequency.setValueAtTime(85, now);
    rasp.frequency.linearRampToValueAtTime(45, now + 0.35);
    raspGain.gain.setValueAtTime(0.001, now);
    raspGain.gain.linearRampToValueAtTime(0.08, now + 0.04);
    raspGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
    rasp.connect(raspGain);
    raspGain.connect(ctx.destination);
    rasp.start(now);
    rasp.stop(now + 0.4);
  }

  /**
   * 16. Dataslate Cipher Decryption Chatter
   * High-speed encrypted burst for Secondary Missions and Secret Objectives.
   */
  function playCipherDecryption() {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const notes = [1760, 2200, 1980, 2640];

    notes.forEach((pitch, i) => {
      const t = now + i * 0.024;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(pitch, t);
      osc.frequency.exponentialRampToValueAtTime(pitch * 0.65, t + 0.018);
      gain.gain.setValueAtTime(0.07, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.02);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.022);
    });
  }

  /**
   * 17. Cogitator Phase Stepper Detent
   * Tactile rotary click for match flow stepper and navigation tabs.
   */
  function playCogitatorStep() {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(740, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.024);
    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.026);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.028);
  }

  /**
   * 18. Magnetic Degauss & Incinerator Data Purge
   * Downward magnetic degaussing hum for clearing logs and purging records.
   */
  function playDegaussPurge() {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(280, now);
    osc.frequency.exponentialRampToValueAtTime(32, now + 0.28);
    gain.gain.setValueAtTime(0.16, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.32);
  }

  /**
   * 19. Necron Gauss Disintegration Pulse
   * Eerie tachyon/chronomantic green energy hum for Tomb-Ship interactions.
   */
  function playNecronGaussPulse() {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    const beam = ctx.createOscillator();
    const beamGain = ctx.createGain();
    beam.type = 'sine';
    beam.frequency.setValueAtTime(220, now);
    beam.frequency.linearRampToValueAtTime(75, now + 0.24);
    beamGain.gain.setValueAtTime(0.001, now);
    beamGain.gain.linearRampToValueAtTime(0.15, now + 0.03);
    beamGain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
    beam.connect(beamGain);
    beamGain.connect(ctx.destination);
    beam.start(now);
    beam.stop(now + 0.28);

    const flutter = ctx.createOscillator();
    const flutterGain = ctx.createGain();
    flutter.type = 'triangle';
    flutter.frequency.setValueAtTime(880, now);
    flutter.frequency.exponentialRampToValueAtTime(280, now + 0.14);
    flutterGain.gain.setValueAtTime(0.06, now);
    flutterGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    flutter.connect(flutterGain);
    flutterGain.connect(ctx.destination);
    flutter.start(now);
    flutter.stop(now + 0.16);
  }

  let hasUserInteracted = false;

  function handleUserGestureForMusic(e) {
    hasUserInteracted = true;
    if (!wantMusic) return;
    if (e && e.target && typeof e.target.closest === 'function' && e.target.closest('#voxMusicToggle, #voxMusicSkip')) {
      return;
    }
    if (!ytReady) {
      loadYouTubeAPI();
    } else if (!isPlayerActuallyPlaying()) {
      resumeOrStartMusic(true);
    }
  }

  // Global listener: contextually triggers sound profiles on clicks
  document.addEventListener('click', (e) => {
    const target = e.target.closest(
      'button, .suite-link, .choice-card, .slider-node, .map-node-group, summary, .terminal-link-btn, .fs-pill-btn, .mini-btn, .phase-step-btn, input[type="checkbox"], input[type="radio"], .chip, .nav-pills button'
    );
    if (target) {
      if (target.dataset && target.dataset.sfx === 'custom') {
        // Handled explicitly by upgrade roller / stamp / siren functions
      } else if (target.matches('#btnQuickKillSp, [onclick*="awardHordeKillSP"]')) {
        playBoltgunBlast();
      } else if (target.matches('#nextRoundBtn, [onclick*="advanceBattleRound"]')) {
        playWarhorn();
      } else if (target.matches('.phase-step-btn, [onclick*="setGuidedPhaseStep"], [onclick*="stepGuidedPhase"]')) {
        playCogitatorStep();
      } else if (target.matches('#hudGainSpBtn, [onclick*="gainSP"], [onclick*="adjCP(1)"], [onclick*="awardCommandPhaseObjectiveSP"]')) {
        playPowerSurge();
      } else if (target.matches('[onclick*="loseSP"], [onclick*="spendCPForStrat"], [onclick*="buyResupply"], [onclick*="adjCP(-1)"]')) {
        playPneumaticDispense();
      } else if (target.matches('[onclick*="drawMisery"], [onclick*="triggerSpecificMisery"], .btn-red[onclick*="Misery"]')) {
        playWarpStatic();
      } else if (target.matches('[onclick*="drawSecondary"], [onclick*="replaceSecondary"], [onclick*="triggerChangeOfPlans"]')) {
        playCipherDecryption();
      } else if (target.matches('.crt-purge-btn, [onclick*="purgeVoxEntry"], [onclick*="clearSpawnerResults"]')) {
        playDegaussPurge();
      } else if (target.matches('input[type="checkbox"], input[type="radio"], .fort-item input')) {
        playMagLock();
      } else if (target.closest('.theme-necron, .vox-preview-beta, #cardBeta') && (target.matches('.tomb-btn, .necron-btn') || target.closest('#cruTabTomb, #tabTomb'))) {
        playNecronGaussPulse();
      } else if (target.matches('.launch-btn, .gate-btn, .btn-red, .unlock-btn, .terminal-link-btn')) {
        playTerminalClank('heavy');
      } else if (
        target.matches('.auspex-btn, .auspex-toolbar-btn, .fs-pill-btn, .map-node-group, #zoomBtn1, #zoomBtn15, #zoomBtn22, #fullscreenMapBtn, #fsToggleDetailsBtn')
      ) {
        playTerminalClank('auspex');
      } else if (target.matches('.mini-btn, .slider-node, .dice-btn, [onclick*="roll"]')) {
        playTerminalClank('pneumatic');
      } else if (target.matches('.choice-card, summary, .score-card, .stat-box, .impact-box, .chip, .nav-pills button')) {
        playTerminalClank('card');
      } else {
        playTerminalClank('relay');
      }
    }

    handleUserGestureForMusic(e);
  });

  // Unlock audio immediately on pointerdown or touchstart anywhere on root page (e.g. https://armageddon-vox.pages.dev/)
  document.addEventListener('pointerdown', handleUserGestureForMusic);
  document.addEventListener('touchstart', handleUserGestureForMusic);

  // Global listener: plays CRT teletype click whenever player types in an input or textarea
  document.addEventListener('keydown', (e) => {
    handleUserGestureForMusic(e);
    const el = e.target;
    if (!el || !el.matches('input[type="text"], input[type="password"], textarea')) return;
    if (e.ctrlKey || e.metaKey || e.altKey || e.key === 'Shift' || e.key === 'Tab' || e.key === 'CapsLock') return;
    playTeletypeTick('type');
  });

  // =========================================================================
  // PART 2: TOP-NAV YOUTUBE AMBIENT PLAYLIST RANDOMIZER WITH CONTINUITY
  // =========================================================================
  let musicRecoveryTimer = null;

  function isPlayerActuallyPlaying() {
    if (!ytPlayer || !ytReady) return false;
    try {
      if (typeof ytPlayer.isMuted === 'function' && ytPlayer.isMuted()) {
        return false;
      }
      if (typeof ytPlayer.getPlayerState === 'function') {
        const state = ytPlayer.getPlayerState();
        // YT.PlayerState.PLAYING === 1, YT.PlayerState.BUFFERING === 3
        return state === 1 || state === 3;
      }
    } catch (e) {}
    return isPlaying;
  }

  function injectNavToggle() {
    const nav = document.querySelector('.suite-nav');
    if (!nav || document.getElementById('voxMusicToggle')) return;

    const wrap = document.createElement('div');
    wrap.className = 'vox-caster-bar';
    wrap.innerHTML = `
      <button type="button" id="voxMusicToggle" class="vox-music-btn" title="Toggle 40K Ship Ambience Playlist">
        <span id="voxMusicIcon">${wantMusic ? '🔊' : '🔇'}</span>
        <span id="voxMusicLabel">${wantMusic ? 'VOX-AMBIENCE: ON' : 'VOX-AMBIENCE: OFF'}</span>
        <span class="vox-eq"><span></span><span></span><span></span></span>
      </button>
      <button type="button" id="voxMusicSkip" class="vox-music-btn ${wantMusic ? '' : 'hidden'}" title="Randomize Next Ambient Track">
        ⏭️
      </button>
    `;
    nav.appendChild(wrap);

    const ytHost = document.createElement('div');
    ytHost.id = 'soaHiddenYtPlayer';
    ytHost.style.cssText = 'position:fixed;bottom:-10px;right:-10px;width:1px;height:1px;opacity:0.01;pointer-events:none;z-index:-1;';
    document.body.appendChild(ytHost);

    document.getElementById('voxMusicToggle').addEventListener('click', toggleMusic);
    document.getElementById('voxMusicSkip').addEventListener('click', () => {
      hasUserInteracted = true;
      playNextRandomTrack();
    });

    updateMusicUI(wantMusic);
    if (wantMusic) {
      loadYouTubeAPI();
    }
  }

  function updateMusicUI(active) {
    const btn = document.getElementById('voxMusicToggle');
    const icon = document.getElementById('voxMusicIcon');
    const lbl = document.getElementById('voxMusicLabel');
    const skip = document.getElementById('voxMusicSkip');
    if (!btn) return;

    btn.classList.toggle('playing', active);
    if (icon) icon.textContent = active ? '🔊' : '🔇';
    if (lbl) lbl.textContent = active ? 'VOX-AMBIENCE: ON' : 'VOX-AMBIENCE: OFF';
    if (skip) skip.classList.toggle('hidden', !active);
  }

  function loadYouTubeAPI() {
    if (window.YT && window.YT.Player) {
      createPlayer();
      return;
    }
    if (document.getElementById('soaYtApiScript')) return;

    const tag = document.createElement('script');
    tag.id = 'soaYtApiScript';
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);

    const prevReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = function () {
      if (typeof prevReady === 'function') prevReady();
      createPlayer();
    };
  }

  function getActiveTrackConfig() {
    let savedId = null;
    let savedTime = 0;
    try {
      savedId = localStorage.getItem(STORAGE_KEY_TRACK_ID);
      const timeVal = localStorage.getItem(STORAGE_KEY_TRACK_TIME);
      savedTime = timeVal ? Math.max(0, parseInt(timeVal, 10)) : 0;
    } catch (e) {}

    if (!savedId || !VOX_TRACK_IDS.includes(savedId)) {
      const randIdx = Math.floor(Math.random() * VOX_TRACK_IDS.length);
      savedId = VOX_TRACK_IDS[randIdx];
      savedTime = 0;
      try {
        localStorage.setItem(STORAGE_KEY_TRACK_ID, savedId);
        localStorage.setItem(STORAGE_KEY_TRACK_INDEX, String(randIdx));
        localStorage.setItem(STORAGE_KEY_TRACK_TIME, '0');
      } catch (e) {}
    }

    return { videoId: savedId, startSeconds: savedTime };
  }

  function createPlayer() {
    if (ytPlayer) return;

    const { videoId, startSeconds } = getActiveTrackConfig();
    const playerVars = {
      autoplay: wantMusic ? 1 : 0,
      start: startSeconds,
      loop: 1,
      controls: 0,
      disablekb: 1,
      modestbranding: 1,
      playsinline: 1,
      enablejsapi: 1
    };
    if (window.location && typeof window.location.origin === 'string' && /^https?:\/\//i.test(window.location.origin)) {
      playerVars.origin = window.location.origin;
    }

    ytPlayer = new YT.Player('soaHiddenYtPlayer', {
      height: '1',
      width: '1',
      videoId: videoId,
      playerVars: playerVars,
      events: {
        onReady: (event) => {
          ytReady = true;
          if (event && event.target) {
            if (typeof event.target.unMute === 'function') event.target.unMute();
            if (typeof event.target.setVolume === 'function') event.target.setVolume(35);
          }
          if (wantMusic) {
            resumeOrStartMusic(hasUserInteracted);
          }
        },
        onStateChange: (event) => {
          if (event.data === YT.PlayerState.PLAYING) {
            isPlaying = true;
            if (musicRecoveryTimer) {
              clearTimeout(musicRecoveryTimer);
              musicRecoveryTimer = null;
            }
            updateMusicUI(true);
            startTrackingProgress();
          } else if (event.data === YT.PlayerState.ENDED) {
            isPlaying = false;
            playNextRandomTrack();
          } else if (
            event.data === YT.PlayerState.PAUSED ||
            event.data === YT.PlayerState.CUED ||
            event.data === -1
          ) {
            isPlaying = false;
            stopTrackingProgress();
            if (!wantMusic) {
              updateMusicUI(false);
            }
          }
        },
        onError: () => {
          isPlaying = false;
          if (wantMusic) {
            playNextRandomTrack();
          }
        }
      }
    });
  }

  function startTrackingProgress() {
    if (progressInterval) clearInterval(progressInterval);
    progressInterval = setInterval(() => {
      if (!ytPlayer || !isPlaying) return;
      try {
        if (typeof ytPlayer.getCurrentTime === 'function') {
          const t = ytPlayer.getCurrentTime();
          if (typeof t === 'number' && t >= 0) {
            localStorage.setItem(STORAGE_KEY_TRACK_TIME, String(Math.floor(t)));
          }
        }
      } catch (e) {}
    }, 750);
  }

  function stopTrackingProgress() {
    if (progressInterval) {
      clearInterval(progressInterval);
      progressInterval = null;
    }
  }

  function saveCurrentPosition() {
    if (!ytPlayer) return;
    try {
      if (typeof ytPlayer.getCurrentTime === 'function') {
        const t = ytPlayer.getCurrentTime();
        if (typeof t === 'number' && t >= 0) {
          localStorage.setItem(STORAGE_KEY_TRACK_TIME, String(Math.floor(t)));
        }
      }
    } catch (e) {}
  }

  window.addEventListener('beforeunload', saveCurrentPosition);
  window.addEventListener('pagehide', saveCurrentPosition);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) saveCurrentPosition();
  });

  function resumeOrStartMusic(fromUserGesture = false) {
    if (!ytPlayer || !ytReady) return;
    try {
      if (typeof ytPlayer.unMute === 'function') {
        ytPlayer.unMute();
      }
      if (typeof ytPlayer.setVolume === 'function') {
        ytPlayer.setVolume(35);
      }

      if (isPlayerActuallyPlaying()) {
        isPlaying = true;
        updateMusicUI(true);
        startTrackingProgress();
        return;
      }

      let state = -1;
      if (typeof ytPlayer.getPlayerState === 'function') {
        try {
          state = ytPlayer.getPlayerState();
        } catch (e) {}
      }

      // When triggered from a user gesture and the player is still UNSTARTED (-1) or CUED (5)
      // (e.g. after initial root-page autoplay block on https://armageddon-vox.pages.dev/),
      // synchronously call loadVideoById inside the gesture call stack so playback starts immediately.
      if ((state === -1 || state === 5) && (fromUserGesture || hasUserInteracted) && typeof ytPlayer.loadVideoById === 'function') {
        const { videoId, startSeconds } = getActiveTrackConfig();
        ytPlayer.loadVideoById({
          videoId: videoId,
          startSeconds: startSeconds
        });
      }

      if (typeof ytPlayer.playVideo === 'function') {
        ytPlayer.playVideo();
      } else if (typeof ytPlayer.loadVideoById === 'function') {
        const { videoId, startSeconds } = getActiveTrackConfig();
        ytPlayer.loadVideoById({
          videoId: videoId,
          startSeconds: startSeconds
        });
      }

      updateMusicUI(true);

      if (musicRecoveryTimer) clearTimeout(musicRecoveryTimer);
      musicRecoveryTimer = setTimeout(() => {
        musicRecoveryTimer = null;
        if (!wantMusic || !ytReady || isPlayerActuallyPlaying()) return;
        if (fromUserGesture || hasUserInteracted) {
          playNextRandomTrack();
        } else if (ytPlayer && typeof ytPlayer.mute === 'function' && typeof ytPlayer.playVideo === 'function') {
          // If browser blocked unmuted autoplay on initial load before any user gesture,
          // pre-buffer muted so the very first pointerdown/click/keydown unmutes with zero delay.
          try {
            ytPlayer.mute();
            ytPlayer.playVideo();
          } catch (e) {}
        }
      }, 900);
    } catch (err) {
      console.warn('Vox-Caster resume exception, falling back to random:', err);
      playNextRandomTrack();
    }
  }

  function playNextRandomTrack() {
    if (!ytPlayer || !ytReady) return;
    try {
      const currentId = localStorage.getItem(STORAGE_KEY_TRACK_ID);
      const candidateList = VOX_TRACK_IDS.filter(id => id !== currentId);
      const pool = candidateList.length > 0 ? candidateList : VOX_TRACK_IDS;
      const nextIndex = Math.floor(Math.random() * pool.length);
      const nextId = pool[nextIndex];

      const fullListIndex = VOX_TRACK_IDS.indexOf(nextId);
      localStorage.setItem(STORAGE_KEY_TRACK_ID, nextId);
      localStorage.setItem(STORAGE_KEY_TRACK_INDEX, String(fullListIndex >= 0 ? fullListIndex : 0));
      localStorage.setItem(STORAGE_KEY_TRACK_TIME, '0');

      if (typeof ytPlayer.unMute === 'function') {
        ytPlayer.unMute();
      }
      if (typeof ytPlayer.loadVideoById === 'function') {
        ytPlayer.loadVideoById({
          videoId: nextId,
          startSeconds: 0
        });
      }
      if (typeof ytPlayer.playVideo === 'function') {
        ytPlayer.playVideo();
      }

      if (typeof ytPlayer.setVolume === 'function') {
        ytPlayer.setVolume(35);
      }
      updateMusicUI(true);
    } catch (err) {
      console.warn('Vox-Caster playlist randomizer warning:', err);
    }
  }

  function toggleMusic() {
    hasUserInteracted = true;
    // If user wanted music ON, but browser blocked initial autoplay on root load so nothing is playing yet,
    // clicking VOX-AMBIENCE starts the music immediately instead of toggling it OFF!
    if (wantMusic && ytReady && !isPlayerActuallyPlaying()) {
      resumeOrStartMusic(true);
      return;
    }

    wantMusic = !wantMusic;
    try {
      localStorage.setItem(STORAGE_KEY_MUSIC, String(wantMusic));
    } catch (err) {
      console.warn('Could not save music preference to localStorage:', err);
    }

    if (wantMusic) {
      if (!ytReady) {
        updateMusicUI(true);
        loadYouTubeAPI();
      } else {
        resumeOrStartMusic(true);
      }
    } else {
      isPlaying = false;
      updateMusicUI(false);
      stopTrackingProgress();
      if (ytPlayer && ytReady && typeof ytPlayer.pauseVideo === 'function') {
        ytPlayer.pauseVideo();
      }
    }
  }

  // =========================================================================
  // PART 3: SEAMLESS CLIENT-SIDE PAGE ROUTER (GAPLESS AUDIO ACROSS NAVIGATION)
  // =========================================================================
  let isNavigating = false;

  async function navigateSeamlessly(targetUrl, push = true) {
    if (isNavigating) return;
    isNavigating = true;

    try {
      if (typeof saveSessionState === 'function' && (document.getElementById('setupScreen') || document.getElementById('gameScreen'))) {
        try { saveSessionState(); } catch (e) {}
      }
      if (typeof saveBriefingState === 'function' && (document.getElementById('atlas-node-inspector') || document.getElementById('dossierBeta'))) {
        try { saveBriefingState(); } catch (e) {}
      }
      if (typeof savePvpState === 'function' && document.getElementById('hellscapeSelect')) {
        try { savePvpState(); } catch (e) {}
      }
      if (typeof saveRogueState === 'function' && document.getElementById('aiStep0')) {
        try { saveRogueState(); } catch (e) {}
      }
      saveCurrentPosition();

      const resp = await fetch(targetUrl);
      if (!resp.ok) {
        window.location.href = targetUrl;
        return;
      }
      const htmlText = await resp.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlText, 'text/html');

      if (doc.title) {
        document.title = doc.title;
      }

      const targetShellSelector = '.app-shell, .vox-shell, .briefing-shell, .container';
      const currentShell = document.querySelector(targetShellSelector);
      const newShell = doc.querySelector(targetShellSelector);

      if (currentShell && newShell) {
        currentShell.replaceWith(document.importNode(newShell, true));
      } else {
        window.location.href = targetUrl;
        return;
      }

      // Clean up previous seamless page-swapped styles
      document.querySelectorAll('style[data-seamless-style]').forEach(s => s.remove());

      // Inject any <style> tags from target page head or body
      const incomingStyles = doc.querySelectorAll('style');
      incomingStyles.forEach(s => {
        const styleEl = document.createElement('style');
        styleEl.setAttribute('data-seamless-style', 'true');
        styleEl.textContent = s.textContent;
        document.head.appendChild(styleEl);
      });

      const currentNav = document.querySelector('.suite-nav');
      const newNav = doc.querySelector('.suite-nav');
      if (currentNav && newNav) {
        const newLinks = newNav.querySelectorAll('.suite-link');
        const currentLinks = currentNav.querySelectorAll('.suite-link');
        currentLinks.forEach(l => l.remove());
        const voxBar = currentNav.querySelector('.vox-caster-bar');
        newLinks.forEach(l => {
          const imported = document.importNode(l, true);
          if (voxBar) {
            currentNav.insertBefore(imported, voxBar);
          } else {
            currentNav.appendChild(imported);
          }
        });
      }

      if (push && window.location.href !== targetUrl) {
        window.history.pushState({}, '', targetUrl);
      }

      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

      const externalScripts = Array.from(doc.querySelectorAll('script[src]'));
      for (const s of externalScripts) {
        const src = s.getAttribute('src');
        if (!src || src.includes('vox-audio.js')) continue;
        const resolvedSrc = new URL(src, targetUrl).href;
        if (!document.querySelector(`script[src="${resolvedSrc}"], script[src="${src}"]`)) {
          await new Promise((resolve) => {
            const scriptEl = document.createElement('script');
            scriptEl.src = resolvedSrc;
            scriptEl.onload = resolve;
            scriptEl.onerror = resolve;
            document.head.appendChild(scriptEl);
          });
        }
      }

      const inlineScripts = doc.querySelectorAll('script:not([src])');
      inlineScripts.forEach(s => {
        try {
          const scriptEl = document.createElement('script');
          // Replace top-level const and let with var so re-entrant seamless navigation
          // across pages or repeated visits never throws "Identifier has already been declared".
          const sanitized = s.textContent.replace(/(^|[\n\r;])\s*(const|let)\s+([a-zA-Z0-9_$]+)/g, '$1 var $3');
          scriptEl.textContent = sanitized;
          document.body.appendChild(scriptEl);
        } catch (scriptErr) {
          console.warn('Seamless inline script execution error:', scriptErr);
        }
      });

      if (document.getElementById('setupScreen') || document.getElementById('gameScreen')) {
        const hordeSel = document.getElementById('hordeFactionSelect');
        if (hordeSel && typeof HORDE_FACTIONS !== 'undefined') {
          hordeSel.innerHTML = HORDE_FACTIONS.map(f => `<option value="${f.name}">${f.name} (${f.ruleTitle})</option>`).join('');
        }
        if (typeof restoreSessionState === 'function') {
          restoreSessionState();
        }
      }
      if ((document.getElementById('atlas-node-inspector') || document.getElementById('dossierBeta')) && typeof restoreBriefingState === 'function') {
        restoreBriefingState();
      }
      if (document.getElementById('hellscapeSelect') && typeof restorePvpState === 'function') {
        restorePvpState();
      }
      if (document.getElementById('aiStep0') && typeof restoreRogueState === 'function') {
        restoreRogueState();
      }
      if (document.getElementById('rosTabNemesis') && typeof window.initRosterPage === 'function') {
        window.initRosterPage();
      }

      syncFactionTheme();

      document.dispatchEvent(new Event('DOMContentLoaded'));
      window.dispatchEvent(new Event('vox:page-swapped'));

    } catch (err) {
      console.warn('Seamless router fallback to standard navigation:', err);
      if (typeof window.location.replace === 'function') {
        window.location.replace(targetUrl);
      } else {
        window.location.href = targetUrl;
      }
    } finally {
      isNavigating = false;
    }
  }

  // =========================================================================
  // GLOBAL FACTION COLOR MODE SYNCHRONIZATION (NECRON VS MILITARUM)
  // =========================================================================
  const STORAGE_KEY_FACTION_THEME = 'foa_faction_theme_v1';

  /**
   * Pure functional core helper: Resolves the active global faction theme
   * ('necron' for Lord Commander Junebug / Beta, 'militarum' for The Exile / Alpha, or null)
   * from browser storage based on which broadcast or terminal conduit is unlocked.
   *
   * @param {Storage} [localStore] - localStorage-compatible store
   * @param {Storage} [sessionStore] - sessionStorage-compatible store
   * @returns {'necron' | 'militarum' | null} Resolved faction theme
   */
  function resolveFactionThemeFromStorage(localStore, sessionStore) {
    try {
      if (localStore && typeof localStore.getItem === 'function') {
        const explicit = localStore.getItem(STORAGE_KEY_FACTION_THEME);
        if (explicit === 'necron' || explicit === 'militarum') {
          return explicit;
        }
      }
    } catch (e) {}

    try {
      if (sessionStore && typeof sessionStore.getItem === 'function') {
        const rawVoxSession = sessionStore.getItem('foa_vox_active_session_v1');
        if (rawVoxSession) {
          const parsedVox = JSON.parse(rawVoxSession);
          if (parsedVox && parsedVox.channel === 'beta') return 'necron';
          if (parsedVox && parsedVox.channel === 'alpha') return 'militarum';
        }
      }
    } catch (e) {}

    try {
      if (localStore && typeof localStore.getItem === 'function') {
        const rawBriefing = localStore.getItem('foa_briefing_state_v3');
        if (rawBriefing) {
          const parsedBriefing = JSON.parse(rawBriefing);
          if (parsedBriefing) {
            if (parsedBriefing.unlockedBeta && !parsedBriefing.unlockedAlpha) return 'necron';
            if (parsedBriefing.unlockedAlpha && !parsedBriefing.unlockedBeta) return 'militarum';
            if (parsedBriefing.unlockedBeta && parsedBriefing.unlockedAlpha) {
              return parsedBriefing.activeDossier === 'alpha' ? 'militarum' : 'necron';
            }
          }
        }
      }
    } catch (e) {}

    return null;
  }

  /**
   * Applies the given faction theme ('necron' or 'militarum') to document.body
   * and optionally persists it to localStorage across all pages.
   *
   * @param {'necron' | 'militarum' | null} theme - Target faction theme
   * @param {boolean} [persist=true] - Whether to persist in localStorage
   * @returns {'necron' | 'militarum' | null} Applied theme
   */
  function setFactionTheme(theme, persist = true) {
    const normalized = theme === 'necron' ? 'necron' : (theme === 'militarum' ? 'militarum' : null);
    if (persist) {
      try {
        if (normalized) {
          localStorage.setItem(STORAGE_KEY_FACTION_THEME, normalized);
        } else {
          localStorage.removeItem(STORAGE_KEY_FACTION_THEME);
        }
      } catch (e) {}
    }

    if (document && document.body && document.body.classList) {
      document.body.classList.toggle('theme-necron', normalized === 'necron');
      document.body.classList.toggle('theme-militarum', normalized === 'militarum');
      if (document.body.dataset) {
        document.body.dataset.factionTheme = normalized || 'default';
      }
    }
    return normalized;
  }

  /**
   * Returns the currently active faction theme ('necron' | 'militarum' | null).
   *
   * @returns {'necron' | 'militarum' | null}
   */
  function getFactionTheme() {
    return resolveFactionThemeFromStorage(
      typeof localStorage !== 'undefined' ? localStorage : null,
      typeof sessionStorage !== 'undefined' ? sessionStorage : null
    );
  }

  /**
   * Synchronizes document.body classes with the unlocked broadcast/terminal theme in storage.
   *
   * @returns {'necron' | 'militarum' | null}
   */
  function syncFactionTheme() {
    const resolved = getFactionTheme();
    if (resolved) {
      setFactionTheme(resolved, false);
    }
    return resolved;
  }

  /**
   * Queues a compiled Dossier payload into sessionStorage, plays the Inquisitorial
   * Dossier Stamp SFX, and routes the user directly to pages/vox.html!
   */
  function transmitToVox(channel, payloadText) {
    playDossierStamp();
    try {
      sessionStorage.setItem(
        'foa_pending_vox_payload',
        JSON.stringify({
          channel: channel || 'alpha',
          text: payloadText,
          queuedAt: Date.now()
        })
      );
      // Strictly prevent terminal password bypass: purge any pre-existing active session auth
      sessionStorage.removeItem('foa_vox_active_session_v1');
    } catch (e) {}

    const inPagesDir = window.location.pathname.includes('/pages/');
    const targetPath = inPagesDir ? 'vox.html' : 'pages/vox.html';
    const fullUrl = new URL(targetPath, window.location.href).href;

    setTimeout(() => {
      navigateSeamlessly(fullUrl, true);
    }, 260);
  }

  // Expose public audio & routing API for Crusade Rollers, Dossiers, Spawner & CRT Terminal
  window.VoxAudio = {
    playClank: playTerminalClank,
    playTeletypeTick: playTeletypeTick,
    playDiceClatter: playDiceClatter,
    playForgeAnvil: playForgeAnvil,
    playRelicChoir: playRelicChoir,
    playScarHazard: playScarHazard,
    playDossierStamp: playDossierStamp,
    playWarpSiren: playWarpSiren,
    playAuspexLock: playAuspexLock,
    playCloudSyncChime: playCloudSyncChime,
    playBoltgunBlast: playBoltgunBlast,
    playPowerSurge: playPowerSurge,
    playPneumaticDispense: playPneumaticDispense,
    playMagLock: playMagLock,
    playWarhorn: playWarhorn,
    playWarpStatic: playWarpStatic,
    playCipherDecryption: playCipherDecryption,
    playCogitatorStep: playCogitatorStep,
    playDegaussPurge: playDegaussPurge,
    playNecronGaussPulse: playNecronGaussPulse,
    navigateSeamlessly: navigateSeamlessly,
    transmitToVox: transmitToVox,
    resolveFactionThemeFromStorage: resolveFactionThemeFromStorage,
    setFactionTheme: setFactionTheme,
    getFactionTheme: getFactionTheme,
    syncFactionTheme: syncFactionTheme
  };

  /**
   * Normalizes URL pathnames so root '/' and '/index.html' (on Cloudflare Pages / static hosts)
   * resolve to the same canonical path ('/').
   *
   * @param {string} pathname - URL pathname string
   * @returns {string} Canonical pathname
   */
  function normalizePathname(pathname) {
    const raw = String(pathname || '/');
    return raw.replace(/\/index\.html$/i, '/') || '/';
  }

  document.addEventListener('click', (e) => {
    if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;

    const link = e.target.closest('a[href]');
    if (!link) return;

    const hrefAttr = link.getAttribute('href');
    if (!hrefAttr || hrefAttr.startsWith('#') || hrefAttr.startsWith('javascript:') || hrefAttr.startsWith('mailto:')) return;
    if (link.target && link.target !== '_self') return;

    try {
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin) return;

      if (normalizePathname(url.pathname) === normalizePathname(window.location.pathname) && url.search === window.location.search) {
        if (url.hash) return;
        e.preventDefault();
        return;
      }

      if (url.pathname.endsWith('.html') || url.pathname.endsWith('/') || !url.pathname.includes('.')) {
        e.preventDefault();
        navigateSeamlessly(url.href, true);
      }
    } catch (err) {}
  });

  window.addEventListener('popstate', () => {
    navigateSeamlessly(window.location.href, false);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      syncFactionTheme();
      injectNavToggle();
    });
  } else {
    syncFactionTheme();
    injectNavToggle();
  }

  // Dual export for Node.js test runner
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      PLAYLIST_ID,
      VOX_TRACK_IDS,
      STORAGE_KEY_FACTION_THEME,
      playTerminalClank,
      playTeletypeTick,
      playDiceClatter,
      playForgeAnvil,
      playRelicChoir,
      playScarHazard,
      playDossierStamp,
      playWarpSiren,
      playAuspexLock,
      playCloudSyncChime,
      playBoltgunBlast,
      playPowerSurge,
      playPneumaticDispense,
      playMagLock,
      playWarhorn,
      playWarpStatic,
      playCipherDecryption,
      playCogitatorStep,
      playDegaussPurge,
      playNecronGaussPulse,
      saveCurrentPosition,
      navigateSeamlessly,
      injectNavToggle,
      transmitToVox,
      createPlayer,
      isPlayerActuallyPlaying,
      resumeOrStartMusic,
      playNextRandomTrack,
      normalizePathname,
      resolveFactionThemeFromStorage,
      setFactionTheme,
      getFactionTheme,
      syncFactionTheme
    };
  }
})();
````
