# 📦 Fires of Armageddon // Bundle: JavaScript Game Engine & Audio

Core logic, RNG algorithms, spawner mechanics, state management, faction/mission datasets, and Vox-Caster Web Audio synth (`js/*.js`).

## 📑 Table of Contents
- [js/data.js](#file-jsdatajs)
- [js/rng.js](#file-jsrngjs)
- [js/spawner.js](#file-jsspawnerjs)
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
 * Generates a thematic room code like HADES-42.
 */
function generateRandomCode() {
  const prefixes = ["HADES", "ASH", "GATE", "THOR", "VULK", "SKULL", "WARP", "IRON", "PYRE", "HIVE"];
  const p = prefixes[Math.floor(Math.random() * prefixes.length)];
  const n = Math.floor(10 + Math.random() * 90);
  const code = `${p}-${n}`;
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
    generateRandomCode
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
    for (let i = 1; i <= 4; i++) {
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
      doubleCost
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
    cp = (typeof data.cp === 'number') ? data.cp : 2;
    stratCount = data.stratCount || 0;

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

  activeHordeFaction = { ...picked, syncedRoomCode: code };

  if (typeof document !== 'undefined') {
    const sel = document.getElementById('hordeFactionSelect');
    if (sel) sel.value = activeHordeFaction.name;
    renderFactionReminderBanner();
  }
  saveSessionState();
}

function manualChangeFaction() {
  const val = document.getElementById('hordeFactionSelect')?.value;
  const found = HORDE_FACTIONS.find(f => f.name === val) || HORDE_FACTIONS[0];
  activeHordeFaction = { ...found, syncedRoomCode: getActiveRoomCode() };
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

  // 1. Resolve Room-Synced Horde Faction (only if not already set by cloud room sync)
  if (!activeHordeFaction || activeHordeFaction.syncedRoomCode !== code) {
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
  switchTab(2);
  saveSessionState();
  debouncedPushLiveSpawnerStateToCloud();
}


function switchTab(tabNum, persist = true) {
  [1, 2, 3, 4].forEach(n => {
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
  lastWarpSirenSeedKey = '';

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
    badge.style.borderColor = isLive ? 'rgba(16, 185, 129, 0.55)' : 'var(--border)';
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
        p_horde_pool: currentHordePool,
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
      activeHordeFaction = { ...found, syncedRoomCode: remoteState.roomCode || getActiveRoomCode() };
      const sel = (typeof document !== 'undefined') ? document.getElementById('hordeFactionSelect') : null;
      if (sel) sel.value = found.name;
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
    triggerCardStaticShake
  };
}

if (typeof window !== 'undefined') {
  window.getActiveRoomCode = getActiveRoomCode;
  window.onRoomCodeChanged = onRoomCodeChanged;
  window.pollLiveSpawnerStateFromCloud = pollLiveSpawnerStateFromCloud;
  window.debouncedPushLiveSpawnerStateToCloud = debouncedPushLiveSpawnerStateToCloud;
}

// =========================================================================
// CLOUD-SYNCED STANDARD HORDE POOL & [10+]/[13+] WARP-BREACH INTRUSION HOOK
// =========================================================================
(function () {
  const SUPABASE_URL_SPAWNER = 'https://dsfvhjjalexqpbzqoaqb.supabase.co';
  const SUPABASE_ANON_SPAWNER = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzZnZoamphbGV4cXBienFvYXFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MzcxNjEsImV4cCI6MjA5MjQxMzE2MX0.fc9652398N1BP1126h1-t0h22H2y519a119918b500';

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
      if (data && data.ok && data.horde_pool && Object.keys(data.horde_pool).length > 0) {
        localStorage.setItem('foa_custom_shelf_pool_v1', JSON.stringify(data.horde_pool));
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

    const showVal = (val) => (val && val.trim())
      ? val
      : `<span style="color:var(--red); font-style:italic;">⚠️ Horde Pool Empty${facName ? ' for ' + facName : ''} — Configure in Mode 4 (Roster)!</span>`;

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
          <tr><td><strong>[3–4] (0–75 pts)</strong></td><td>${showVal(pool.b34)}</td></tr>
          <tr><td><strong>[5–6] (76–150 pts)</strong></td><td>${showVal(pool.b56)}</td></tr>
          <tr><td><strong>[7–9] (151–300 pts)</strong></td><td>${showVal(pool.b79)}</td></tr>
          <tr><td><strong>[10–12] (301–550 pts)</strong></td><td>${showVal(pool.b10)} <br><span style="color:var(--red); font-size:0.74rem;">⚡ + 1D6 Warp-Breach Intrusion Check (5+ = Campaign Master Adversary/Nemesis!)</span></td></tr>
          <tr><td><strong>[13+] (551+ pts)</strong></td><td>${showVal(pool.b13)} <br><span style="color:var(--red); font-size:0.74rem;">⚡ + 1D6 Warp-Breach Intrusion Check (5+ = Campaign Master Adversary/Nemesis!)</span></td></tr>
        </tbody>
      </table>
    `;
  }

  function transmitHordeIntrusionPing(zoneNum, bracketLabel, channel) {
    const roomStr = (typeof document !== 'undefined' && document.getElementById('seedInput')?.value) || 'HADES-1';
    const roundStr = (typeof document !== 'undefined' && document.getElementById('spawnerBtnRound')?.textContent) || '1';
    const facStr = (typeof document !== 'undefined' && document.getElementById('hordeFactionSelect')?.value) || 'Horde';

    const payload = [
      `+++ EMERGENCY AUSPEX PING: HORDE WARP-BREACH INTRUSION DETECTED +++`,
      `• MODE & ROOM SEED: Mode 1 (Horde Breach // Room: ${roomStr} // Battle Round ${roundStr})`,
      `• SPAWN ZONE & BRACKET: Spawn Zone ${zoneNum} rolled ${bracketLabel} + [5+ WARP-BREACH INTRUSION]!`,
      `• ACTIVE HORDE FACTION: ${facStr}`,
      `• REQUEST FOR CAMPAIGN MASTER: Please execute the Contextual 3-Tier Intrusion Roll (NEMESIS.md) and reveal which Unbound Adversary, Active Surface Nemesis, or Classified Legacy Boss hijacks Spawn Zone ${zoneNum}!`
    ].join('\n');

    if (typeof window !== 'undefined' && window.VoxAudio && typeof window.VoxAudio.transmitToVox === 'function') {
      window.VoxAudio.transmitToVox(channel, payload);
    }
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

      if (intrusionRoll >= 5) {
        anyIntrusionTriggered = true;
        currentWaveIntrusions.push(`${roomStr}_R${roundStr}_Z${zoneNum}_${intrusionRoll}`);
        if (!card.querySelector('.warp-intrusion-alert')) {
          card.style.borderColor = 'var(--red)';
          const alertDiv = document.createElement('div');
          alertDiv.className = 'warp-intrusion-alert';
          alertDiv.style.textAlign = 'center';
          alertDiv.innerHTML = `
            <div style="color:var(--red); font-weight:900; font-family:monospace; font-size:0.84rem; margin-bottom:4px; text-align:center;">
              ⚡ [WARP-BREACH INTRUSION ROLLED: D6 = ${intrusionRoll} (5+) — ADVERSARY / NEMESIS HIJACK!]
            </div>
            <div style="font-size:0.8rem; color:#e2e8f0; margin-bottom:8px; text-align:center;">
              Instead of the standard Horde unit above, an anomalous signature is tearing through <strong>Spawn Zone ${zoneNum}</strong>! Ping the Campaign Master on Vox to reveal the intruder:
            </div>
            <div style="display:flex; gap:8px; flex-wrap:wrap; justify-content:center; align-items:center;">
              <button type="button" class="btn-red btn-sm" onclick="transmitHordeIntrusionPing(${zoneNum}, '${bracketLabel}', 'alpha')">📡 Ping Vox (The Exile)</button>
              <button type="button" class="btn-blue btn-sm" onclick="transmitHordeIntrusionPing(${zoneNum}, '${bracketLabel}', 'beta')">📡 Ping Vox (Junebug)</button>
            </div>
          `;
          card.appendChild(alertDiv);
        }
      } else {
        if (!card.querySelector('.intrusion-badge-clean') && !card.querySelector('.warp-intrusion-alert')) {
          const cleanNote = document.createElement('div');
          cleanNote.className = 'intrusion-badge-clean';
          cleanNote.style.cssText = 'margin-top:6px; font-size:0.74rem; color:var(--muted); font-family:monospace; text-align:center;';
          cleanNote.textContent = `[Warp-Breach Intrusion Check: D6 = ${intrusionRoll} (Needed 5+) — Standard Horde Wave Holds]`;
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


  // Global listener: contextually triggers sound profiles on clicks
  document.addEventListener('click', (e) => {
    const target = e.target.closest(
      'button, .suite-link, .choice-card, .slider-node, .map-node-group, summary, .terminal-link-btn, .fs-pill-btn, .mini-btn'
    );
    if (target) {
      if (target.dataset && target.dataset.sfx === 'custom') {
        // Handled explicitly by upgrade roller / stamp / siren functions
      } else if (target.matches('.launch-btn, .gate-btn, .btn-red, .unlock-btn, .terminal-link-btn')) {
        playTerminalClank('heavy');
      } else if (
        target.matches('.auspex-btn, .auspex-toolbar-btn, .fs-pill-btn, .map-node-group, #zoomBtn1, #zoomBtn15, #zoomBtn22, #fullscreenMapBtn, #fsToggleDetailsBtn')
      ) {
        playTerminalClank('auspex');
      } else if (target.matches('.mini-btn, .slider-node, .dice-btn')) {
        playTerminalClank('pneumatic');
      } else if (target.matches('.choice-card, summary, .score-card, .stat-box, .impact-box')) {
        playTerminalClank('card');
      } else {
        playTerminalClank('relay');
      }
    }

    if (wantMusic && (!e.target || !e.target.closest || !e.target.closest('#voxMusicToggle, #voxMusicSkip'))) {
      if (!ytReady) {
        loadYouTubeAPI();
      } else if (!isPlayerActuallyPlaying()) {
        resumeOrStartMusic(true);
      }
    }
  });

  // Global listener: plays CRT teletype click whenever player types in an input or textarea
  document.addEventListener('keydown', (e) => {
    if (wantMusic && ytReady && !isPlayerActuallyPlaying()) {
      resumeOrStartMusic(true);
    }
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

    ytPlayer = new YT.Player('soaHiddenYtPlayer', {
      height: '1',
      width: '1',
      videoId: videoId,
      playerVars: {
        autoplay: wantMusic ? 1 : 0,
        start: startSeconds,
        loop: 1,
        controls: 0,
        disablekb: 1,
        modestbranding: 1,
        playsinline: 1,
        enablejsapi: 1
      },
      events: {
        onReady: (event) => {
          ytReady = true;
          if (event && event.target) {
            if (typeof event.target.unMute === 'function') event.target.unMute();
            if (typeof event.target.setVolume === 'function') event.target.setVolume(35);
          }
          if (wantMusic) {
            resumeOrStartMusic(false);
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

      // If triggered by a user gesture and the current video remains stuck/unstarted after 1.2s,
      // automatically advance to a fresh random track (eliminating the need to press Skip manually).
      if (fromUserGesture) {
        if (musicRecoveryTimer) clearTimeout(musicRecoveryTimer);
        musicRecoveryTimer = setTimeout(() => {
          musicRecoveryTimer = null;
          if (wantMusic && ytReady && !isPlayerActuallyPlaying()) {
            playNextRandomTrack();
          }
        }, 1200);
      }
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
        resumeOrStartMusic();
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
    navigateSeamlessly: navigateSeamlessly,
    transmitToVox: transmitToVox
  };

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

      if (url.pathname === window.location.pathname && url.search === window.location.search) {
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
    document.addEventListener('DOMContentLoaded', injectNavToggle);
  } else {
    injectNavToggle();
  }

  // Dual export for Node.js test runner
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      PLAYLIST_ID,
      VOX_TRACK_IDS,
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
      saveCurrentPosition,
      navigateSeamlessly,
      injectNavToggle,
      transmitToVox,
      createPlayer,
      isPlayerActuallyPlaying,
      resumeOrStartMusic,
      playNextRandomTrack
    };
  }
})();
````
