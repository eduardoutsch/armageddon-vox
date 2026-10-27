/**
 * Fires of Armageddon // Crusade Command & Quartermaster Data Vault
 * Authoritative tables: 4-Phase Branching Alliance Trees, Core & Codex Battle Traits,
 * Weapon Modifications, Crusade Relics, Battle Scars, Munitorum Logistics & Commendations,
 * and Necrons Tomb World Awakening Matrix & Dynastic Vault.
 */

var CRUSADE_STATE_KEY = 'foa_crusade_quartermaster_v1';

// =========================================================================
// ARMAGEDDON 4-PHASE ALLIANCE BRANCHING TREES
// =========================================================================
var ALLIANCE_TREES = {
  Gatebreakers: [
    {
      phase: "Phase 1: Stabilising the Front",
      goal: "At the end of each battle, if you are the victor, gain +5 Strategic Points.",
      success: "SUCCESS (Resurgent Morale → Reclaim the Lost Hives): Each time you purchase Increase Supply Limit, increase Supply Limit by +250 pts instead of +200 pts.",
      failure: "FAILURE (Grim Determination → Strengthen the Imperator Line): In each battle, the first time a unit from your Crusade army fails a Battle-shock test, it automatically passes instead."
    },
    {
      phase: "Phase 2A (Success Path): Reclaim the Lost Hives",
      goal: "End of battle: if 2+ non-Aircraft, non-Battle-shocked units are wholly within opponent's deployment zone, gain +5 SPts.",
      success: "SUCCESS (Commanding Grasp → Raze the Monoliths): In your 2nd Reinforcement step, set up 1 Strategic Reserve unit as if it were Battle Round 3.",
      failure: "FAILURE (Staged Withdrawal → Light in the Dark): Select 1 INFANTRY or BATTLELINE unit at Declare Battle Formations to gain Scouts 6\".",
    },
    {
      phase: "Phase 2B (Failure Path): Strengthen the Imperator Line",
      goal: "End of battle: if points value of destroyed enemy units exceeds yours, gain +5 SPts.",
      success: "SUCCESS (Faith Rekindled → Shatter the Red Angel's Gate): Attacks targeting units with 1+ Warp Counters re-roll Hit rolls of 1 and Wound rolls of 1.",
      failure: "FAILURE (Forlorn Hope → Shatter the Red Angel's Gate): Once per turn, re-roll one Charge roll made for a unit in your Crusade army."
    }
  ],
  Desecrators: [
    {
      phase: "Phase 1: Planetfall",
      goal: "At the end of each battle, if you are the victor, gain +5 Strategic Points.",
      success: "SUCCESS (Momentum Unchecked → The Red Angel's Summons): Add +1 to Advance and Charge rolls for units with 1+ Warp Counters.",
      failure: "FAILURE (Spreading Corruption → Regroup in the Fire Wastes): If 3+ units end wholly within 9\" of different battlefield edges, gain +5 SPts."
    },
    {
      phase: "Phase 2: Feed the Storm / The Dark Gods Demand",
      goal: "Sacrifice or corrupt objective markers with Warp Rites and slaughter enemy Champions.",
      success: "SUCCESS: While controlling more objectives in No Man's Land, re-roll one result on the Anomalies table each round.",
      failure: "FAILURE (Fully Committed): Each time you spend 1+ CP on a Stratagem, roll a D6: on a 5+, refund 1 CP."
    }
  ],
  Marauders: [
    {
      phase: "Phase 1: Drawn to the Fight",
      goal: "At the end of each battle, if you are the victor, gain +5 Strategic Points.",
      success: "SUCCESS (Spoils of Victory → Forgotten Relics): Whenever a CHARACTER gains a Crusade Relic, it can select an Antiquity Relic regardless of its Rank!",
      failure: "FAILURE (Blunted Momentum → Escalation): After any battle you do not win, your first Increase Supply Limit Requisition costs 1 fewer RP."
    },
    {
      phase: "Phase 2A (Success Path): Forgotten Relics",
      goal: "Select your highest-XP unit at start of Round 1; if it destroys 1+ enemy units this battle, gain +5 SPts.",
      success: "SUCCESS (Alpha Strike → Decapitation): Whenever the enemy Warlord is destroyed, all enemy units on the battlefield must take a Battle-shock test.",
      failure: "FAILURE (Guerrilla Warfare → Bloodied but Unbowed): When you are the Attacker, select 1 INFANTRY unit to gain the Infiltrators ability."
    },
    {
      phase: "Phase 2B (Failure Path): Escalation",
      goal: "End of battle: if 3+ units are each wholly within a different battlefield quarter, gain +5 SPts.",
      success: "SUCCESS (Overwhelming Numbers → Decapitation): At the end of each battle, each surviving BATTLELINE unit on the battlefield gains +1 bonus XP.",
      failure: "FAILURE (Spiteful Onslaught → Bloodied but Unbowed): CHARACTER units from your Crusade army can re-roll Charge rolls."
    }
  ]
};

// =========================================================================
// 11TH ED CRUSADE & ARMAGEDDON RANDOM ROLLER TABLES (UNIVERSAL DEFAULT)
// =========================================================================
var BATTLE_TRAIT_TABLES = {
  Infantry: [
    { d6: 1, name: "Fortune's Favoured", desc: "Once per battle, you can re-roll one Hit roll, one Wound roll, or one Saving throw made for this unit." },
    { d6: 2, name: "Hellscape Veterans", desc: "Models in this unit have Feel No Pain 5+ against Mortal Wounds and Anomaly effects." },
    { d6: 3, name: "Ash-Waste Stalkers", desc: "Models in this unit have the Stealth ability during Battle Round 1, and ignore negative Move modifiers from terrain." },
    { d6: 4, name: "Zealous Purge", desc: "Each time a model in this unit makes a melee attack against a unit within range of an objective marker, re-roll a Hit roll of 1." },
    { d6: 5, name: "Hardened to the Warp", desc: "While this unit has 1+ Warp Counters, add +1 to its Leadership and Objective Control characteristics." },
    { d6: 6, name: "Bane of the Unbound", desc: "Weapons equipped by models in this unit have the [ANTI-UNBOUND ADVERSARIES 4+] ability." }
  ],
  Mounted: [
    { d6: 1, name: "Thunderous Impact", desc: "Each time this unit ends a Charge move, select 1 enemy unit within Engagement Range; on a 4+, it suffers D3 Mortal Wounds." },
    { d6: 2, name: "Outriders of the Wastes", desc: "Add +1\" to the Move characteristic of models in this unit and re-roll Advance rolls." },
    { d6: 3, name: "Relentless Lancers", desc: "Melee weapons equipped by models in this unit have the [LANCE] ability on turns in which they charged." },
    { d6: 4, name: "Hit-and-Run Raiders", desc: "This unit is eligible to declare a Charge in a turn in which it Fell Back." },
    { d6: 5, name: "Empyric Stride", desc: "While this unit has 1+ Warp Counters, it can move through enemy models and terrain when making Normal, Advance, or Fall Back moves." },
    { d6: 6, name: "Apex Hunters", desc: "Each time this unit targets a MONSTER or VEHICLE, re-roll Wound rolls of 1." }
  ],
  MonsterVehicle: [
    { d6: 1, name: "Armoured Behemoth", desc: "Once per battle round, reduce the AP characteristic of one attack allocated to this model by 1." },
    { d6: 2, name: "Machine-Spirit Resolute", desc: "Ignore modifiers to this model's Move characteristic and to Hit rolls when this model is bracketed." },
    { d6: 3, name: "Juggernaut of the Wastes", desc: "Add +2 to Tank Shock / monstrous impact dice rolled for this model." },
    { d6: 4, name: "Searing Promethium Vent", desc: "At the end of the Fight phase, roll 1D6 for each enemy Infantry unit within Engagement Range; on a 4+, it suffers D3 Mortal Wounds." },
    { d6: 5, name: "Sanctified Hull", desc: "This model has Feel No Pain 5+ against Psychic Attacks and Mortal Wounds." },
    { d6: 6, name: "Titan-Killer Calibration", desc: "Each time this model makes a ranged attack targeting a MONSTER or VEHICLE, re-roll a Hit roll of 1." }
  ],
  Character: [
    { d6: 1, name: "Inspiring Commander", desc: "While this model is leading a unit, add +1 to the Leadership characteristic of models in that unit and once per battle clear Battle-shock." },
    { d6: 2, name: "Slayer of Champions", desc: "Melee weapons equipped by this model gain the [PRECISION] ability and re-roll Wound rolls of 1 against Characters." },
    { d6: 3, name: "Tactical Acumen", desc: "Once per battle, target this model's unit with a Stratagem for 1 fewer CP (if not already modified)." },
    { d6: 4, name: "Ward of the Gate", desc: "This model's unit has a 4+ Feel No Pain save against Mortal Wounds caused by Anomalies and Warp Counters." },
    { d6: 5, name: "Unyielding Paragon", desc: "Add +1 to the Wounds characteristic of this Character model." },
    { d6: 6, name: "Scourge of the Warp", desc: "While leading a unit, weapons in that unit gain [LETHAL HITS] when targeting units with 1+ Warp Counters or Unbound Adversaries." }
  ],
  // 1. NECRONS BATTLE TRAITS (BetaCodex — 1D6 / Category Tables)
  BetaCodex: {
    label: "Necrons Codex (Dynastic Battle Traits)",
    tables: {
      "CHARACTER Units": [
        "1 — Eternal Perfection: Each time this model makes an attack, re-roll a Hit roll of 1 and re-roll a Wound roll of 1.",
        "2 — Endless Legions: At the end of the battle, if this model was part of your Crusade army and gained 3+ XP (excluding Marked for Greatness), you gain +1 RP.",
        "3 — Sempiternal Strategist: Once per battle, when you target this model's unit with a Stratagem, reduce the CP cost of that Stratagem by 1 CP.",
        "4 — Implacable Conqueror: While this model is leading a unit, add +1 to Charge rolls made for that unit.",
        "5 — Technomantic Singularity (CRYPTEK): In your Command phase, select 1 friendly NECRONS unit within 6\"; that unit regains D3 lost wounds (or re-rolls 1s on Reanimation).",
        "6 — Dynastic Overlord (NOBLE): Increase the range of this model's Aura abilities by +3\" (or models in its led unit gain +1 OC)."
      ],
      "INFANTRY Units (Excluding CHARACTERS)": [
        "1 — Undying Revenants: Each time you make a Reanimation Protocols roll for this unit, add +1 to the result.",
        "2 — The Will to Serve: Add +1 to the Objective Control (OC) characteristic of models in this unit while within range of an objective you control.",
        "3 — Subdual Protocols: Each time a model in this unit makes an attack targeting an enemy unit within range of an objective marker, re-roll a Hit roll of 1.",
        "4 — Relentless March: Add +1\" to the Move (M) characteristic of models in this unit and +1 to Advance rolls.",
        "5 — Phasal Condenser: Ranged weapons equipped by models in this unit gain [ASSAULT] (or [IGNORES COVER] while Stationary).",
        "6 — Butcher's Choreography (DESTROYER CULT / FLAYED ONES): Each time a model in this unit makes a melee attack, re-roll a Wound roll of 1 (or +1 AP on Critical Wounds)."
      ],
      "VEHICLE & MOUNTED Units (Excluding CANOPTEK)": [
        "1 — Hypergrav Field Manipulation: Add +2\" to the Move (M) characteristic of models in this unit.",
        "2 — Spectral Disassembly Targeters: Each time a model in this unit makes a ranged attack, re-roll a Hit roll of 1 (or ignore Cover).",
        "3 — Quantum Deflection Matrix: Each time an attack with AP -1 or AP -2 is allocated to a model in this unit, worsen the AP by 1 (or gain 6+ FNP vs Mortal Wounds).",
        "4 — Living Metal Resurgence: Each time you make a Reanimation Protocols roll for this unit, add +1 to the result.",
        "5 — Entropic Impact Rams: When this unit finishes a Charge move, select 1 enemy unit within Engagement Range; on a 2+, it suffers D3 mortal wounds.",
        "6 — Annihilation Convergence (DESTROYER CULT): Each time a model in this unit makes a ranged attack against the closest eligible target, re-roll Wound rolls of 1."
      ],
      "CANOPTEK Units": [
        "1–2 — Guardian Constructs: While a friendly CRYPTEK unit is on the battlefield, each time a model in this unit makes a melee attack, re-roll a Wound roll of 1.",
        "3–4 — Optimised Aggressors: You can re-roll Advance and Charge rolls made for this unit.",
        "5–6 — Self-Replicator Nodes: Once per turn, one unit from your Crusade army with this Battle Trait can change the result of its Reanimation Protocols roll to 3."
      ]
    }
  }
};

/**
 * Pure parser helper: converts a Necron Codex Battle Trait or Battle Scar string
 * formatted as "<d6> — <name>: <desc>" into a structured roller descriptor object.
 *
 * @param {string} line - Raw rule string.
 * @returns {{d6: string, name: string, desc: string, raw: string}} Structured descriptor.
 */
function parseCodexTraitOrScarLine(line) {
  const dashIdx = line.indexOf(' — ');
  const d6Part = dashIdx !== -1 ? line.slice(0, dashIdx).trim() : '1';
  const rest = dashIdx !== -1 ? line.slice(dashIdx + 3).trim() : line;
  const colonIdx = rest.indexOf(': ');
  const name = colonIdx !== -1 ? rest.slice(0, colonIdx).trim() : rest;
  const desc = colonIdx !== -1 ? rest.slice(colonIdx + 2).trim() : '';
  return { d6: d6Part, name, desc, raw: line };
}

/**
 * Pure parser helper: converts a Necron Codex Crusade Relic string
 * formatted as "<name>: <desc>" into a structured relic descriptor object.
 *
 * @param {string} line - Raw relic rule string.
 * @returns {{name: string, desc: string, raw: string}} Structured relic descriptor.
 */
function parseCodexRelicLine(line) {
  const colonIdx = line.indexOf(': ');
  const name = colonIdx !== -1 ? line.slice(0, colonIdx).trim() : line;
  const desc = colonIdx !== -1 ? line.slice(colonIdx + 2).trim() : '';
  return { name, desc, raw: line };
}

var NECRONS_TRAIT_TABLES = {
  Character: BATTLE_TRAIT_TABLES.BetaCodex.tables["CHARACTER Units"].map(parseCodexTraitOrScarLine),
  Infantry: BATTLE_TRAIT_TABLES.BetaCodex.tables["INFANTRY Units (Excluding CHARACTERS)"].map(parseCodexTraitOrScarLine),
  Mounted: BATTLE_TRAIT_TABLES.BetaCodex.tables["VEHICLE & MOUNTED Units (Excluding CANOPTEK)"].map(parseCodexTraitOrScarLine),
  MonsterVehicle: BATTLE_TRAIT_TABLES.BetaCodex.tables["VEHICLE & MOUNTED Units (Excluding CANOPTEK)"].map(parseCodexTraitOrScarLine),
  Canoptek: BATTLE_TRAIT_TABLES.BetaCodex.tables["CANOPTEK Units"].map(parseCodexTraitOrScarLine),
  BetaCodex: BATTLE_TRAIT_TABLES.BetaCodex
};

// =========================================================================
// ASTRA MILITARUM CODEX BATTLE TRAITS & RELICS (COMMANDER ALPHA POOL)
// =========================================================================
var ASTRA_MILITARUM_TRAIT_TABLES = {
  Infantry: [
    { d6: 1, name: "Dead-Eyed Killers (AM Codex)", desc: "Each time you take a Battle-shock, Leadership, or Desperate Escape test for this unit, add +1 to that test." },
    { d6: 2, name: "Stealthy (AM Codex)", desc: "Models in this unit have the Stealth ability while within terrain or more than 12\" from the attacking model." },
    { d6: 3, name: "Brutal Strength (AM Codex)", desc: "Melee weapons equipped by models in this unit have the [LETHAL HITS] ability." },
    { d6: 4, name: "Grim Demeanour (AM Codex)", desc: "While this unit is affected by an Order, add +1 to the Objective Control (OC) characteristic of models in this unit." },
    { d6: 5, name: "Rapid Redeployment (AM Codex)", desc: "Ranged weapons equipped by models in this unit have the [ASSAULT] ability." },
    { d6: 6, name: "Trench-Fighting Veterans (AM Codex)", desc: "Each time a ranged attack targets this unit while it has the Benefit of Cover, improve the Save characteristic of models in this unit by 1." }
  ],
  Mounted: [
    { d6: 1, name: "Dead-Eyed Killers (AM Codex)", desc: "Each time you take a Battle-shock, Leadership, or Desperate Escape test for this unit, add +1 to that test." },
    { d6: 2, name: "Stealthy Outriders (AM Codex)", desc: "Models in this unit have the Stealth ability and ignore vertical/rough terrain penalties." },
    { d6: 3, name: "Brutal Strength (AM Codex)", desc: "Melee weapons equipped by models in this unit have the [LETHAL HITS] ability." },
    { d6: 4, name: "Swift Envelopment (AM Codex)", desc: "Add +2\" to the Move characteristic of models in this unit and re-roll Advance rolls." },
    { d6: 5, name: "Carbine Volley (AM Codex)", desc: "Ranged weapons equipped by models in this unit have the [ASSAULT] ability." },
    { d6: 6, name: "Shock Lancers (AM Codex)", desc: "Each time this unit ends a Charge move, re-roll Hit rolls of 1 in the Fight phase this turn." }
  ],
  MonsterVehicle: [
    { d6: 1, name: "Urban Fighters (AM Codex)", desc: "This VEHICLE unit ignores the -1 to Hit penalty from Big Guns Never Tire when firing at targets while within Engagement Range." },
    { d6: 2, name: "Armoured Superiority (AM Codex)", desc: "Add +2 to the Objective Control (OC) characteristic of this VEHICLE model." },
    { d6: 3, name: "Veteran Tankers (AM Codex)", desc: "Each time this model makes a ranged attack with its primary turret/hull weapon, re-roll a Hit roll of 1." },
    { d6: 4, name: "Field-Rigged Plating (AM Codex)", desc: "This VEHICLE model has the Feel No Pain 6+ ability against Mortal Wounds." },
    { d6: 5, name: "Overcharged Engines (AM Codex)", desc: "Add +1\" to this model's Move characteristic and +1 to Advance and Tank Shock rolls." },
    { d6: 6, name: "Indomitable Machine Spirit (AM Codex)", desc: "While this VEHICLE model is Damaged (1–4 Wounds remaining), ignore the -1 penalty to its Hit rolls." }
  ],
  Character: [
    { d6: 1, name: "Booming Voice (AM Officer)", desc: "Each time this OFFICER issues an Order, you can select an eligible unit within 12\" instead of 6\"." },
    { d6: 2, name: "Eye for Talent (AM Officer)", desc: "If this OFFICER is on the battlefield and not destroyed at battle end, select 1 additional unit to be Marked for Greatness (+3 XP)!" },
    { d6: 3, name: "Old Grudges (AM Officer)", desc: "At start of battle, select 1 enemy unit; attacks made by models in this OFFICER's unit targeting that enemy unit can re-roll the Hit roll." },
    { d6: 4, name: "Front-Line Leader (AM Officer)", desc: "While this OFFICER is leading a unit, models in that unit can re-roll Battle-shock tests and add +1 to Charge rolls." },
    { d6: 5, name: "Master of Ordnance & Supply (AM Officer)", desc: "Once per battle, target this OFFICER's unit with a Battle Tactic Stratagem for 0 CP." },
    { d6: 6, name: "Summary Executioner (AM Officer)", desc: "Once per battle round, when this unit fails a Battle-shock test, destroy 1 bodyguard model to immediately pass that test instead." }
  ]
};

var WEAPON_MOD_TABLE = [
  { d6: 1, name: "Finely Balanced", desc: "Improve this weapon's Ballistic Skill or Weapon Skill characteristic by 1 (to a maximum of 2+)." },
  { d6: 2, name: "Brutal", desc: "Add +1 to this weapon's Strength characteristic." },
  { d6: 3, name: "Armour Piercing", desc: "Improve this weapon's Armour Penetration (AP) characteristic by 1." },
  { d6: 4, name: "Master-Worked", desc: "Add +1 to this weapon's Damage characteristic." },
  { d6: 5, name: "Heirloom", desc: "Add +1 to this weapon's Attacks characteristic." },
  { d6: 6, name: "Precise", desc: "Each time a Critical Wound is scored for an attack made with this weapon, that attack has the [PRECISION] ability." }
];

var CRUSADE_RELIC_VAULT = {
  Artificer: [
    { name: "Periapt of the Righteous (Artificer • +1 CrP)", desc: "Add +2 to bearer's Wounds. In your Command phase, you can remove 1 Warp Counter from bearer's unit; if you do, bearer regains up to D3 lost wounds." },
    { name: "Tartarine Cuirass (Artificer • +1 CrP)", desc: "Each time an attack is allocated to the bearer, subtract 1 from the Damage characteristic of that attack." },
    { name: "Grimoire Abjuratis (Artificer • +1 CrP)", desc: "Subtract 1 from Wound rolls for BEAST/MONSTER attacks targeting bearer's unit (and subtract 1 from Hit rolls if attacker is UNBOUND ADVERSARIES)." },
    { name: "Cowl of Vehemence (Artificer • +1 CrP)", desc: "PSYKER only. Re-roll Wound rolls of 1 on Psychic Attacks (or re-roll all Wound rolls while bearer's unit has 1+ Warp Counters)." }
  ],
  Antiquity: [
    { name: "Riftwalker's Astrolabe (Antiquity • +2 CrP)", desc: "The bearer—and all models in the unit the bearer is leading—gain the Deep Strike ability!" },
    { name: "Weapon of Renown (Antiquity • +2 CrP)", desc: "Select 1 melee weapon equipped by bearer; it gains [ANTI-UNBOUND ADVERSARIES 4+] and [DEVASTATING WOUNDS]." },
    { name: "Beast-Ward Barbute / Empyric Blade (Antiquity • +2 CrP)", desc: "INFANTRY/MOUNTED only. Select 1 melee weapon: +1 Attacks, +1 Strength, +1 Damage. When selected to fight, remove up to 3 Warp Counters for an extra +1 A & +1 S per counter!" },
    { name: "Exorcist's Thurible (Antiquity • +2 CrP)", desc: "Enemy units within 6\" of the bearer suffer -1 Leadership and cannot perform Warp Rites Actions." }
  ],
  Legendary: [
    { name: "Vengeance Totem (Legendary • +3 CrP)", desc: "When bearer's unit is destroyed, roll 1D6 for each enemy unit within 6\": on a 4+, D3 Mortal Wounds. Then spawn an Unbound Adversaries unit with Power Level equal to bearer's Warp Counters!" },
    { name: "Empyromancer's Focus (Legendary • +3 CrP)", desc: "Once per battle round, manipulate or trigger a localized Warp Anomaly within 18\" of the bearer and add +1 to all Psychic & melee Damage." }
  ],
  // 2. NECRONS CRUSADE RELICS (BetaCodex)
  BetaCodex: {
    Artificer: [
      "Godpyre Mantle (Artificer — NECRONS CHARACTER): Bearer gains the Stealth ability, and enemy units cannot use rules to ignore modifiers to Hit rolls when targeting the bearer's unit.",
      "Tachyon Field Phase Inducer (Artificer/Antiquity — NECRONS CHARACTER): Bearer's unit can Fall Back and still Shoot/Charge (or phase through models/terrain when moving)."
    ],
    Antiquity: [
      "Orb of Eternity (Antiquity — NECRONS CHARACTER): While the bearer is leading a unit, each time that unit's Reanimation Protocols activate, it reanimates 3 wounds instead of D3 wounds!",
      "Tachyon Field Phase Inducer (Antiquity — NECRONS CHARACTER): Once per battle, in your Movement phase, teleport the bearer's unit anywhere >9\" from enemies (or grant Deep Strike / phase movement)."
    ],
    Legendary: [
      "Casket of Heshkefnet (Legendary — NECRONS CHARACTER): Once per battle, at the start of your Command phase, select 1 enemy unit on the battlefield. Until the start of your next Command phase, EVERY model from your Crusade army re-rolls the Hit roll when attacking that enemy unit!"
    ]
  }
};

var NECRONS_RELIC_VAULT = {
  Artificer: CRUSADE_RELIC_VAULT.BetaCodex.Artificer.map(parseCodexRelicLine),
  Antiquity: CRUSADE_RELIC_VAULT.BetaCodex.Antiquity.map(parseCodexRelicLine),
  Legendary: CRUSADE_RELIC_VAULT.BetaCodex.Legendary.map(parseCodexRelicLine),
  BetaCodex: CRUSADE_RELIC_VAULT.BetaCodex
};

var ASTRA_MILITARUM_RELIC_VAULT = {
  Artificer: [
    { name: "Iconic Accoutrements (AM Artificer • +1 CrP)", desc: "Select one melee weapon or pistol equipped by the bearer; improve its WS/BS by 1, add +1 to its Attacks and +1 to its Damage, and friendly units within 6\" re-roll Battle-shock tests." },
    { name: "Voice of Von Rhyne (AM Artificer • +1 CrP)", desc: "OFFICER model only. The bearer can issue 1 additional Order in your Command phase, and Orders issued by the bearer are not lost if the target unit becomes Battle-shocked!" },
    { name: "Death Mask of Ollanius (AM Artificer • +1 CrP)", desc: "Bearer has a 4+ Invulnerable save, and while bearer's unit is Battle-shocked, subtract 1 from its OC instead of reducing OC to 0." }
  ],
  Antiquity: [
    { name: "Tactical Auto-Reliquary of Tyberius (AM Antiquity • +2 CrP)", desc: "INFANTRY OFFICER only. Improve bearer's Save, Wounds, Leadership, and OC by 1, improve bearer's WS and BS by 1, and improve bearer's Invulnerable save by 1 (max 4+)!" },
    { name: "Kurov's Aquila (AM Antiquity • +2 CrP)", desc: "OFFICER model only. Once per battle, when your opponent uses a Stratagem, increase the CP cost of that Stratagem by +1 CP, and roll a D6 each Command phase: on a 5+, gain +1 CP." },
    { name: "Blade of Conquest (AM Antiquity • +2 CrP)", desc: "Upgrades bearer's melee weapon with +2 Strength, AP -3, Damage 2, and [DEVASTATING WOUNDS] on the charge." }
  ],
  Legendary: [
    { name: "Star of Terra (AM Legendary • +3 CrP)", desc: "INFANTRY OFFICER model only. Models in the bearer's unit have a 5+ Invulnerable save, AND each time an attack targets the bearer's unit, subtract 1 from the Wound roll!" },
    { name: "Laurels of Command (AM Legendary • +3 CrP)", desc: "OFFICER model only. Each time the bearer issues an Order to a unit, roll a D6: on a 4+, issue a second different Order to that same unit immediately for free (both Orders remain active simultaneously)!" }
  ]
};

var BATTLE_SCAR_TABLE = [
  { d6: 1, name: "Crippling Damage", desc: "Subtract 1\" from the Move characteristic of models in this unit, and you cannot use Advance or Charge re-rolls for this unit." },
  { d6: 2, name: "Battle-Weary", desc: "Each time this unit takes a Battle-shock, Leadership, or Out of Action test, subtract 1 from the roll." },
  { d6: 3, name: "Fatigued", desc: "Subtract 1 from the Objective Control (OC) characteristic of models in this unit (to a minimum of 0), and this unit never receives the benefit of Cover." },
  { d6: 4, name: "Disgraced", desc: "You cannot use any Stratagems to affect this unit, and this unit cannot be Marked for Greatness." },
  { d6: 5, name: "Mark of Shame", desc: "This unit cannot form an Attached unit, is unaffected by friendly Aura abilities, and cannot be selected for Marked for Greatness." },
  { d6: 6, name: "Deep Scars", desc: "Each time a Critical Wound is scored against this unit, that attack's AP is improved by 1." }
];

var NECRON_BATTLE_SCARS = [
  "1 (NOBLE Units) — Creeping Madness: Add +1 Strength and +1 Attacks to melee weapons equipped by this model. This unit gains Lone Operative, but LOSES the Leader ability!",
  "2 (DESTROYER CULT Units) — Mindless Reaper: Each time a model in this unit makes an attack, you can re-roll the Hit roll, BUT worsen this unit's Leadership and Objective Control (OC) by 1.",
  "3 (NECRONS Units, Excl. C'tan) — Engrammatic Degradation: Each time you target this unit with a Stratagem, reduce the CP cost by 1 CP for that usage, BUT this unit cannot Fall Back or Advance!",
  "4 (CANOPTEK Units) — Depleted Transmaterial Reserves: Add +1 to the Attacks characteristic of melee weapons in this unit, BUT this unit CANNOT use its Reanimation Protocols ability!"
];

var NECRON_BATTLE_SCAR_TABLE = NECRON_BATTLE_SCARS.map(parseCodexTraitOrScarLine);

// =========================================================================
// MUNITORUM LOGISTICS CATEGORIES & COMMENDATIONS VAULT (REGULATION 884-A)
// =========================================================================
var LOGISTICS_CATEGORIES = [
  {
    key: "lexmechanicus",
    title: "📡 Lexmechanicus (Comms & Planning)",
    surplus: "SURPLUS (2 Pts): When selecting Agendas for a battle, you can select 1 additional Astra Militarum Agenda to be active for that battle!",
    deficiency: "DEFICIENCY (0 Pts): Each time an OFFICER from your army issues an Order, roll 1D6: on a 1, that Order is not issued!"
  },
  {
    key: "materiel",
    title: "⚙️ Materiel (Fuel & Ordnance)",
    surplus: "SURPLUS (2 Pts): Each time an ASTRA MILITARUM unit from your army is selected to shoot, you can re-roll one Hit roll!",
    deficiency: "DEFICIENCY (0 Pts): Subtract 2\" from the Move characteristic of all ASTRA MILITARUM VEHICLE models in your Crusade force!"
  },
  {
    key: "tithePool",
    title: "🪖 Tithe Pool (Fresh Recruits)",
    surplus: "SURPLUS (2 Pts): In your Command phase, return 1 destroyed model (excluding Characters) to each REGIMENT INFANTRY unit below Starting Strength!",
    deficiency: "DEFICIENCY (0 Pts): In your Command phase, if your WARLORD is not on the battlefield, you do not gain a Command Point!"
  },
  {
    key: "morale",
    title: "🦅 Morale (Rations & Spirit)",
    surplus: "SURPLUS (2 Pts): Improve the Leadership characteristic of all ASTRA MILITARUM models in your Crusade force by 1!",
    deficiency: "DEFICIENCY (0 Pts): You cannot use the Insane Bravery Stratagem during your battles!"
  }
];

var ASTRA_COMMENDATIONS_VAULT = [
  // PERSONAL COMMENDATIONS (1–5 PTS)
  { id: "bastion", type: "Personal Commendation (1 Pt • Regiment Unit)", name: "Bastion Honour (1 Pt)", desc: "REGIMENT unit only. Once per battle, at the start of the opponent's Fight phase, this unit gains Fights First until the end of the phase." },
  { id: "steel_armorial", type: "Personal Commendation (1 Pt • Vehicle / Enginseer)", name: "Steel Armorial (1 Pt)", desc: "VEHICLE or TECH-PRIEST ENGINSEER only. If this unit survives the battle, re-roll one failed Out of Action test taken for a friendly Astra Militarum Vehicle unit." },
  { id: "diamantine", type: "Personal Commendation (1 Pt • Infantry / Mounted)", name: "Diamantine Star (1 Pt)", desc: "Once per battle, this unit can use the Rapid Ingress or Heroic Intervention Stratagem for 0 CP." },
  { id: "strategium", type: "Personal Commendation (2 Pts • Any Unit)", name: "Merit of the Strategium (2 Pts)", desc: "Each time you select this unit as the target of a Stratagem, roll 1D6: on a 5+, you gain 1 CP." },
  { id: "dispensation", type: "Personal Commendation (3 Pts • Officer Warlord)", name: "Decree of Dispensation (3 Pts)", desc: "OFFICER Warlord only. Once per Tour of Duty, select 1 Logistics Deficiency effect currently applying to your force; ignore that Deficiency for the entire battle!" },
  { id: "purity", type: "Personal Commendation (3 Pts • Officer / Priest)", name: "Laurels of Purity (3 Pts)", desc: "OFFICER or MINISTORUM PRIEST only. While leading a unit, models in that unit have Feel No Pain 4+ against Psychic Attacks." },
  { id: "sigilum", type: "Personal Commendation (3 Pts • Any Unit)", name: "Lord Commander's Sigilum (3 Pts)", desc: "At the end of the battle, if this unit destroyed 1 or more enemy units during that battle, gain +1 bonus Commendation Point!" },
  { id: "resolute", type: "Personal Commendation (3 Pts • Any Unit)", name: "Medallion Resolute (3 Pts)", desc: "While this unit is within range of an Objective Marker you control, models in this unit have a 5+ Invulnerable save!" },
  { id: "laudable", type: "Personal Commendation (3 Pts • Any Unit)", name: "Medal of Laudable Service (3 Pts)", desc: "At the start of every Tour of Duty, you can replace one Battle Honour on this unit with a new Battle Honour of your choosing." },
  { id: "oculus", type: "Personal Commendation (4 Pts • Officer Warlord)", name: "Oculus Laureate (4 Pts)", desc: "OFFICER Warlord only. You can use one Crusade Blessing even if you are not the Underdog!" },
  { id: "auramite", type: "Personal Commendation (5 Pts • Battle-Hardened+)", name: "Auramite Aquila (5 Pts)", desc: "Battle-hardened+ unit only. Gains 1 extra Battle Trait that does NOT count toward its Battle Honour cap, and reduces Legendary Veterans Requisition to 1 RP!" },
  // REGIMENTAL COMMENDATIONS (8 PTS • +3 CRUSADE PTS • ARMY-WIDE)
  { id: "reg_veteran_crew", type: "Regimental Commendation (8 Pts • +3 CrP • Army-Wide)", name: "Veteran Crew (8 Pts — Squadron Doctrine)", desc: "While a SQUADRON unit is under Duty and Honour!, ignore all Damaged profile penalties! [Materiel Surplus]: +3 OC to all Squadron models! [Tithe Pool Deficiency]: -1 to Out of Action tests." },
  { id: "reg_vanguard", type: "Regimental Commendation (8 Pts • +3 CrP • Army-Wide)", name: "Vanguard Honours (8 Pts — Squadron Doctrine)", desc: "While a SQUADRON unit is under Move! Move! Move!, its ranged weapons gain [ASSAULT] when Advancing! [Lexmechanicus Surplus]: +1 CP in Command phase if 1+ Squadron unit is in opponent's deployment zone. [Morale Deficiency]: Roll D6 when gaining a Commendation Pt; on a 1, lose 1." },
  { id: "reg_drill", type: "Regimental Commendation (8 Pts • +3 CrP • Army-Wide)", name: "Paragons of Drill Discipline (8 Pts — Las-Fusillade & Artillery)", desc: "Units under First Rank, Fire! Second Rank, Fire! that Remain Stationary gain [SUSTAINED HITS 1] on Rapid Fire weapons! [Materiel Surplus]: Artillery units re-roll Hit rolls of 1. [Tithe Pool Deficiency]: +1 RP cost to Supply/Repair/Recruits." },
  { id: "reg_preservation", type: "Regimental Commendation (8 Pts • +3 CrP • Army-Wide)", name: "Preservation Commendation (8 Pts — Armoured Shield)", desc: "INFANTRY under Take Cover! within 3\" of a friendly TRANSPORT gain Benefit of Cover. [Tithe Pool Surplus]: +1 Wound to all TRANSPORT models! [Lexmechanicus Deficiency]: -1 Crusade Blessing." },
  { id: "reg_mech_assault", type: "Regimental Commendation (8 Pts • +3 CrP • Army-Wide)", name: "Mechanised Assault Merit (8 Pts — Transport Disembark)", desc: "Units disembarking from a TRANSPORT under First Rank, Fire! Second Rank, Fire! automatically receive that same Order! [Morale Surplus]: Regiment units can disembark after Transport Advances. [Materiel Deficiency]: -4\" Move on Below Half-Strength Transports." },
  { id: "reg_cavalry", type: "Regimental Commendation (8 Pts • +3 CrP • Army-Wide)", name: "Cavalry Aquila (8 Pts — Vanguard Infiltration)", desc: "REGIMENT units under Move! Move! Move! add +2 to Advance rolls. [Lexmechanicus Surplus]: Up to 3 Regiment units gain Infiltrators! [Morale Deficiency]: Cannot use Marked for Greatness or Relics." },
  { id: "reg_guerrillas", type: "Regimental Commendation (8 Pts • +3 CrP • Army-Wide)", name: "Veteran Guerrillas (8 Pts — Bayonet Precision)", desc: "REGIMENT units under Fix Bayonets! gain [PRECISION] on melee weapons. [Tithe Pool Surplus]: Regiment units gain 2 XP from Battle Experience instead of 1 XP! [Morale Deficiency]: 0 RP gained on defeat." }
];

// =========================================================================
// NECRONS TOMB WORLD AWAKENING MATRIX & DYNASTIC VAULT (COMMANDER BETA)
// =========================================================================
var TOMB_WORLD_SYSTEMS = [
  {
    key: "command",
    title: "👑 Command System (Dynastic Neural Network)",
    agenda: "Awakening Agenda (Martial Dominance): Destroy 3+ enemy units with your NECRONS WARLORD or NOBLE units in a single battle to allocate +1 Awakening Point here.",
    tiers: [
      "Tier 1 (1 Pt — Protocols of the Undying): Select 1 NECRONS CHARACTER in your army; add +1 to that model's Toughness characteristic.",
      "Tier 2 (2 Pts — Vengeful Bodyguards): Models in Bodyguard units led by a NECRONS CHARACTER gain a 3+ Fight-on-Death ability in melee.",
      "Tier 3 (3 Pts — Supreme Directive): Once per battle round, one NECRONS CHARACTER unit from your army can use the Command Re-roll Stratagem for 0 CP."
    ],
    master: "⚡ MASTER COMMAND ABILITY (Once Per Battle): Either re-roll all Battle-shock tests for your NECRONS units OR add +1 to the Objective Control (OC) characteristic of all NECRONS models until your next Command phase (then roll D3 Awakening Point reset)."
  },
  {
    key: "reanimation",
    title: "💚 Reanimation System (Canoptek Repair Forges)",
    agenda: "Awakening Agenda (Tireless Reconstruction): Recover threshold Wounds across your army via Reanimation Protocols during a battle to allocate +1 Awakening Point here.",
    tiers: [
      "Tier 1 (1 Pt — Surging Nano-Scarabs): Once per battle round, when making a Reanimation Protocols roll for a NECRONS unit, you can re-roll that dice roll.",
      "Tier 2 (2 Pts — Critical Resurgence): Each time you make a Reanimation Protocols roll for a NECRONS unit that is Below Half-strength, add +1 to that roll.",
      "Tier 3 (3 Pts — Emergency Reconstruction): Once per battle, immediately after a NECRONS unit drops Below Starting Strength, it immediately activates its Reanimation Protocols out of phase!"
    ],
    master: "⚡ MASTER REANIMATION ABILITY (Once Per Battle): In your Command phase, either select 1 NECRONS unit to activate its Reanimation Protocols twice in a row OR grant +1 to all Reanimation Protocols rolls army-wide for the phase (then roll D3 Awakening Point reset)."
  },
  {
    key: "translocation",
    title: "🌀 Translocation System (Dimensional Manifold)",
    agenda: "Awakening Agenda (Relentless Expansion): Have 3+ NECRONS units end the battle wholly within 6\" of the opponent's battlefield edge (+3 XP) to allocate +1 Awakening Point here.",
    tiers: [
      "Tier 1 (1 Pt — Dimensional Lock): Each time a NECRONS unit sets up via Deep Strike or Hypercrypt Reserves, re-roll Hit rolls of 1 for that unit until the end of the turn.",
      "Tier 2 (2 Pts — Phase-Shift Vanguard): Before the battle begins, select up to 3 NECRONS units to gain the Scouts 6\" and Fly abilities for the first battle round.",
      "Tier 3 (3 Pts — Chrono-Spatial Surge): Select 1 NECRONS unit per turn to add +2 to its Advance and Charge rolls."
    ],
    master: "⚡ MASTER TRANSLOCATION ABILITY (Once Per Battle): Either swap 1 NECRONS INFANTRY unit in Reserves with 1 friendly NECRONS INFANTRY unit on the battlefield (>1\" from enemies) OR redeploy up to 3 NECRONS INFANTRY units before Battle Round 1 (then roll D3 Awakening Point reset)."
  }
];

var NECRON_DYNASTIC_VAULT = [
  { id: "viral_vectors", type: "Necron Requisition (1 RP • Flayer Virus)", name: "Viral Vectors (1 RP — Scars to Flayed Ones)", desc: "Replace a Battle-scarred NECRONS BATTLELINE unit on your Order of Battle with a fresh Flayed Ones unit retaining its total XP!" },
  { id: "cunning_advisors", type: "Necron Requisition (1 RP • Cryptek Politics)", name: "Cunning Advisors (1 RP — Cryptek Greatness)", desc: "If a CRYPTEK unit destroyed 1 or more enemy units during the battle, select it as an additional Marked for Greatness (+3 XP) unit!" },
  { id: "slow_decay", type: "Necron Requisition (1 RP • Noble Madness)", name: "The Slow Decay of Self (1 RP — Destroyer Noble)", desc: "Bestow the DESTROYER CULT and Lone Operative abilities and re-roll Hit rolls of 1 onto a NOBLE model (model loses its Leader ability)." },
  { id: "power_reserves", type: "Necron Requisition (1 RP • Tomb Matrix Overclock)", name: "Power Reserves Allocated (1 RP — Matrix Reallocation)", desc: "Select an Awakening Agenda even when all Awakening Points are allocated, and immediately reallocate 1 Awakening Point between Tomb World Systems!" },
  { id: "unending_tally", type: "Necron Awakening Agenda (Destroyer Cults)", name: "Unending Tally (+2 XP per 2 Kills)", desc: "Each DESTROYER CULT unit gains +2 XP every time it destroys 2 enemy units in a single battle round." },
  { id: "supremacy_annihilation", type: "Necron Awakening Agenda (Apex Purge)", name: "Supremacy Through Annihilation (+2 XP per High-Value Kill)", desc: "The opponent's 3 highest-point units are marked for termination; gain +2 XP each time one is destroyed." },
  { id: "territorial_imperative", type: "Necron Awakening Agenda (Tomb Reclamation)", name: "Territorial Imperative (+1 XP Kill / +2 XP Conquer)", desc: "Gain +1 XP per enemy unit destroyed within range of an objective, plus +2 XP for completing the Conquer Objective action." },
  { id: "inescapable_retribution", type: "Necron Awakening Agenda (Relic Transmutation)", name: "Inescapable Retribution (+4 XP & Relic Swap)", desc: "NECRONS CHARACTER completes an action on a No Man's Land objective to erase the objective marker, gain +4 XP, and swap its Crusade Relic!" },
  { id: "master_command_surge", type: "Master System Protocol (Command Matrix Surge)", name: "Master Command Protocol Unleashed (D3 Reset)", desc: "Triggered the Command System Master Ability (+1 OC army-wide or re-roll all Battle-shock tests; triggers D3 Awakening Point reset)." },
  { id: "master_reanimation_surge", type: "Master System Protocol (Reanimation Forge Surge)", name: "Master Reanimation Protocol Unleashed (D3 Reset)", desc: "Triggered the Reanimation System Master Ability (double Reanimation activation or +1 to all Reanimation rolls; triggers D3 Awakening Point reset)." },
  { id: "master_translocation_surge", type: "Master System Protocol (Dimensional Manifold Surge)", name: "Master Translocation Manifold Unleashed (D3 Reset)", desc: "Triggered the Translocation System Master Ability (dimensional infantry swap >1\" from enemies or 3-unit pre-battle redeployment; triggers D3 Awakening Point reset)." }
];

var VOTANN_TRAIT_TABLES = {
  Character: [
    { d6: "1–2", name: "Grim Demeanour", desc: "Improve the Objective Control (OC) and Leadership (Ld) characteristics of models in this unit by 1." },
    { d6: "3–4", name: "Dour Survivalist", desc: "CHARACTER models in this unit have Feel No Pain 5+ and you can re-roll Out of Action tests taken for this unit." },
    { d6: "5–6", name: "Personal Grudge", desc: "At the start of the battle, select 1 enemy unit. Attacks made by models in this unit targeting that unit gain [LETHAL HITS] and [PRECISION]." }
  ],
  Infantry: [
    { d6: "1", name: "Ruthless Efficiency", desc: "This unit always has Hostile Acquisition, even while units from your army have Fortify Takeover." },
    { d6: "2", name: "Vengeful", desc: "Add +1 to Hit rolls while below Starting Strength, and add +1 to Wound rolls while Below Half-strength." },
    { d6: "3", name: "Ancestral Fury", desc: "Melee weapons equipped by models in this unit have the [SUSTAINED HITS 1] ability." },
    { d6: "4", name: "Guardians of Need", desc: "Start of battle: select 1 objective marker. While within range of it, this unit has Fortify Takeover even while your army has Hostile Acquisition." },
    { d6: "5", name: "War-Wrought", desc: "While your army has Fortify Takeover, each time a Damage 1 attack is allocated to a model in this unit, add +1 to the Armour Saving throw." },
    { d6: "6", name: "Warrior Pride", desc: "Each time this unit is selected to shoot or fight, you can re-roll one Hit roll and re-roll one Wound roll." }
  ],
  Mounted: [
    { d6: "1–2", name: "Refined Power Cores", desc: "Add +2\" to the Move characteristic of models in this unit." },
    { d6: "3–4", name: "KV-Ceramide Undersuits", desc: "Models in this unit have a 5+ Invulnerable Save." },
    { d6: "5–6", name: "Frontier Weaponsmiths", desc: "Add +6\" to the Range characteristic of ranged weapons equipped by models in this unit." }
  ]
};

var VOTANN_RELIC_VAULT = {
  Artificer: [
    { name: "Grey Crest", desc: "Models in the bearer's unit have the Stealth ability." },
    { name: "Flâyre", desc: "While your army has Hostile Acquisition, add +2 to the Attacks of the bearer's melee weapons (or +1 while in Fortify Takeover)." },
    { name: "Murmuring Stave (Grimnyr only)", desc: "When selecting Agendas for a battle, you can select 1 additional Leagues of Votann Agenda." }
  ],
  Antiquity: [
    { name: "Thyrikite Plate", desc: "While in Hostile Acquisition, subtract 1 from incoming Damage allocated to the bearer. While in Fortify Takeover, change incoming Damage allocated to the bearer to 1!" },
    { name: "Wayfarer's Grace", desc: "First time bearer is destroyed, roll 1D6 at end of phase: on a 2+, set bearer back up with 3 Wounds remaining." }
  ],
  Legendary: [
    { name: "First Knife", desc: "Bearer re-rolls Hit and Wound rolls in melee. End of Fight phase: spend up to 4 YP; roll 1D6 per YP spent, dealing 1 Mortal Wound on each 2+ to an engaged enemy unit." }
  ]
};

var VOTANN_KINDRED_ASSETS = [
  { key: "outpost1", title: "🪨 Mining Outpost #1", cost: "Minerals x30, Energy x30, Intel x50", upgCost: "Energy x50", baseDesc: "+20 Raw Minerals whenever Raw Minerals are gained.", upgDesc: "+30 Raw Minerals whenever Raw Minerals are gained." },
  { key: "outpost2", title: "🪨 Mining Outpost #2", cost: "Minerals x30, Energy x30, Intel x50", upgCost: "Energy x50", baseDesc: "+20 Raw Minerals whenever Raw Minerals are gained.", upgDesc: "+30 Raw Minerals whenever Raw Minerals are gained." },
  { key: "outpost3", title: "🪨 Mining Outpost #3", cost: "Minerals x30, Energy x30, Intel x50", upgCost: "Energy x50", baseDesc: "+20 Raw Minerals whenever Raw Minerals are gained.", upgDesc: "+30 Raw Minerals whenever Raw Minerals are gained." },
  { key: "tradingHub", title: "⚖️ Trading Hub", cost: "Minerals x30, Biomatter x30, Energy x50", upgCost: "Energy x100, Rare Minerals x1", baseDesc: "After battle, use Guild Patronage Requisition once.", upgDesc: "After battle, use Guild Patronage Requisition twice." },
  { key: "faneAug", title: "🧠 Fane Augmentation", cost: "Minerals x50, Biomatter x50, Energy x50, Intel x50", upgCost: "Intel x100, Rare Energy x1", baseDesc: "Marked for Greatness grants +1 extra XP (+4 XP total).", upgDesc: "Select +1 additional Votann unit to be Marked for Greatness." },
  { key: "scoutVessel", title: "🛰️ Scout Vessel", cost: "Minerals x100, Biomatter x50, Energy x50", upgCost: "Minerals x100, Rare Biomatter x1", baseDesc: "Re-roll the dice when randomly determining resource type gained.", upgDesc: "Spend 1 Rare Resource after battle to extend Expedition max length by +1 battle." },
  { key: "implantRefinery", title: "🧬 Implant Refinery", cost: "Biomatter x100, Energy x100", upgCost: "Biomatter x50, Rare Energy x1", baseDesc: "Re-roll failed Out of Action tests for non-Vehicle Votann units.", upgDesc: "Re-roll the 1D6 post-victory check (6+) to gain a Rare Resource." },
  { key: "pioneerFleet", title: "⚡ Pioneer Fleet", cost: "Minerals x50, Biomatter x50, Intel x50", upgCost: "Minerals x50, Intel x50, Rare Biomatter x1", baseDesc: "After battle, roll 1 random resource: gain +10 of it per leftover YP.", upgDesc: "Start of Battle Round 1: spend 20 of any resource to immediately gain +2 YP." },
  { key: "evalVault", title: "🔧 Evaluation Vault", cost: "Minerals x50, Biomatter x50, Intel x100", upgCost: "Minerals x100, Rare Intel x1", baseDesc: "Before battle, use Field Testing Requisition once for 1 RP (instead of 2 RP).", upgDesc: "Before battle, use Field Testing Requisition twice for 1 RP each." },
  { key: "biorecyc", title: "♻️ Biorecyc Fabricator", cost: "Minerals x50, Biomatter x100, Energy x50", upgCost: "Biomatter x100, Rare Minerals x1", baseDesc: "After battle, if fundamental resource rolled is not Biomatter, also gain +20 Biomatter.", upgDesc: "End of battle: every surviving non-Vehicle Votann unit on the battlefield gains +1 XP!" }
];

var VOTANN_VAULT_PROTOCOLS = [
  { id: "req_harvest", name: "Red-Handed Harvest (1 RP — After Battle on Expedition)", type: "Votann Requisition (1 RP)", desc: "Roll 1D6 per enemy unit destroyed: each 5+ grants +10 Fundamental Resources (Aeldari/T'au=Minerals, Chaos/Imperium=Intel, Necrons=Energy, GSC/Orks/Tyranids=Biomatter)." },
  { id: "req_patronage", name: "Guild Patronage (1 RP — Requires Trading Hub)", type: "Votann Requisition (1 RP)", desc: "Spend 60 of 1 Fundamental Resource -> gain 50 of another; OR spend 1 Rare Resource -> gain 50 matching Fundamental or 1 random Rare Resource." },
  { id: "req_fieldtest", name: "Field Testing (2 RP, or 1 RP w/ Evaluation Vault)", type: "Votann Requisition (1-2 RP)", desc: "Before battle, give 1 Infantry/Mounted unit (+1 CrP) a temporary Weapon Modification (1/battle for 1 phase)." },
  { id: "req_ancestors", name: "Returned to the Ancestors (1 RP — Blooded+ Character Scar)", type: "Votann Requisition (1 RP)", desc: "Upload Character to the Votann: gain D6x5 Biomatter + D6x5 Raw Minerals, plus D6x5 Galactic Intel and +1 XP to all other units per Battle Honour!" },
  { id: "ag_prospecting", name: "Agenda: Prospecting (+2 XP per Board Edge / +20 Raw Minerals)", type: "Votann Agenda", desc: "End of battle: up to 3 units wholly within 9\" of different non-own board edges gain +2 XP each (4+ XP total = +20 Raw Minerals)." },
  { id: "ag_prophecy", name: "Agenda: Yield Prophecy (+1 to +3 XP Warlord / +20 Galactic Intel)", type: "Votann Agenda", desc: "Predict final YP tally at start of Round 1. Exact = +3 XP Warlord, ±1 = +2 XP, ±2 = +1 XP (2+ XP = +20 Galactic Intel)." },
  { id: "ag_pursuit", name: "Agenda: Exhaustive Pursuit (+2 XP per Objective / +20 Energy)", type: "Votann Agenda", desc: "Search newly controlled objectives for +2 XP (max 4 XP/unit). All searched = choose post-battle resource type; 6+ XP total = +20 Energy Sources." },
  { id: "ag_debt", name: "Agenda: Debt to Be Paid (+2/+3 XP per Kill by Scarred Unit / +20 Biomatter)", type: "Votann Agenda", desc: "Units with 1+ Battle Scars gain +2 XP (+3 XP vs. repeat opponent) per enemy destroyed (4+ XP total = +20 Biomatter)." }
];

// Attach to window for browser global scope
if (typeof window !== 'undefined') {
  window.CRUSADE_STATE_KEY = CRUSADE_STATE_KEY;
  window.ALLIANCE_TREES = ALLIANCE_TREES;
  window.BATTLE_TRAIT_TABLES = BATTLE_TRAIT_TABLES;
  window.NECRONS_TRAIT_TABLES = NECRONS_TRAIT_TABLES;
  window.ASTRA_MILITARUM_TRAIT_TABLES = ASTRA_MILITARUM_TRAIT_TABLES;
  window.VOTANN_TRAIT_TABLES = VOTANN_TRAIT_TABLES;
  window.WEAPON_MOD_TABLE = WEAPON_MOD_TABLE;
  window.CRUSADE_RELIC_VAULT = CRUSADE_RELIC_VAULT;
  window.NECRONS_RELIC_VAULT = NECRONS_RELIC_VAULT;
  window.ASTRA_MILITARUM_RELIC_VAULT = ASTRA_MILITARUM_RELIC_VAULT;
  window.VOTANN_RELIC_VAULT = VOTANN_RELIC_VAULT;
  window.BATTLE_SCAR_TABLE = BATTLE_SCAR_TABLE;
  window.NECRON_BATTLE_SCAR_TABLE = NECRON_BATTLE_SCAR_TABLE;
  window.LOGISTICS_CATEGORIES = LOGISTICS_CATEGORIES;
  window.ASTRA_COMMENDATIONS_VAULT = ASTRA_COMMENDATIONS_VAULT;
  window.TOMB_WORLD_SYSTEMS = TOMB_WORLD_SYSTEMS;
  window.NECRON_DYNASTIC_VAULT = NECRON_DYNASTIC_VAULT;
  window.VOTANN_KINDRED_ASSETS = VOTANN_KINDRED_ASSETS;
  window.VOTANN_VAULT_PROTOCOLS = VOTANN_VAULT_PROTOCOLS;
  window.parseCodexTraitOrScarLine = parseCodexTraitOrScarLine;
  window.parseCodexRelicLine = parseCodexRelicLine;
}

// CommonJS export for Node test runners
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CRUSADE_STATE_KEY,
    ALLIANCE_TREES,
    BATTLE_TRAIT_TABLES,
    NECRONS_TRAIT_TABLES,
    ASTRA_MILITARUM_TRAIT_TABLES,
    VOTANN_TRAIT_TABLES,
    WEAPON_MOD_TABLE,
    CRUSADE_RELIC_VAULT,
    NECRONS_RELIC_VAULT,
    ASTRA_MILITARUM_RELIC_VAULT,
    VOTANN_RELIC_VAULT,
    BATTLE_SCAR_TABLE,
    NECRON_BATTLE_SCAR_TABLE,
    LOGISTICS_CATEGORIES,
    ASTRA_COMMENDATIONS_VAULT,
    TOMB_WORLD_SYSTEMS,
    NECRON_DYNASTIC_VAULT,
    VOTANN_KINDRED_ASSETS,
    VOTANN_VAULT_PROTOCOLS,
    parseCodexTraitOrScarLine,
    parseCodexRelicLine
  };
}

