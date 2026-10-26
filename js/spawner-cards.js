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
