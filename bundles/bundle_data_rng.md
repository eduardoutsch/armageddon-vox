# 📦 Fires of Armageddon // Bundle: Tactical Data Schemas & Seeded RNG

Immutable faction data, mission profiles, event lookup tables, and Mulberry32 deterministic RNG engine (`js/data.js`, `js/rng.js`).

## 📑 Table of Contents
- [js/data.js](#file-jsdatajs)
- [js/rng.js](#file-jsrngjs)

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
