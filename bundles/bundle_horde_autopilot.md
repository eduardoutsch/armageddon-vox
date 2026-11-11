# 📦 Fires of Armageddon // Bundle: Deterministic Horde Autopilot Core & Tests

Pure Horde Autopilot wave spawning, obstacle-aware Movement/Advance vectors, pre-Overwatch LOS revert snapshots, keyword-driven shooting priority, LCT 2D6 charges, 11th Ed 3-tier consolidation, and unit tests (`js/horde-autopilot-core.js`, `tests/js/horde-autopilot-core.test.js`).

## 📑 Table of Contents
- [js/horde-autopilot-core.js](#file-jshordeautopilotcorejs)
- [tests/js/horde-autopilot-core.test.js](#file-testsjshordeautopilotcoretestjs)

---

## File: `js/horde-autopilot-core.js` <a id="file-jshordeautopilotcorejs"></a>

````javascript
/**
 * @fileoverview Fires of Armageddon // Deterministic Horde Autopilot Functional Core
 *
 * Pure Functional Core module (zero DOM, filesystem, network, or local PRNG dependencies):
 * - Spawner-to-TTS wave placement commands (`SPAWN_WAVE`) from synced Mode 1 `zoneSpawns`
 * - Obstacle-aware Horde Movement & Advance vectors + Pre-Overwatch `REVERT_MOVE` snapshots
 * - Mode 3 Keyword-Driven Shooting Target Priority (`[ANTI-X]`, `[PRECISION]`, `[MELTA]`) + 11th Ed Hidden caps
 * - Deterministic LCT Dice-Mat Charge declarations (`2D6`) and 3-Tier 11th Ed Consolidation (Rule 12.08)
 */

(function (root, factory) {
  const exports = factory();
  if (typeof root !== 'undefined') Object.assign(root, exports);
  if (typeof module !== 'undefined' && module.exports) module.exports = exports;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {

  const combatCore = (typeof resolveHordeMovementProfile === 'function')
    ? { resolveHordeMovementProfile, resolveHordeAttackModifiers }
    : (typeof require === 'function' ? require('./horde-combat-modifiers.js') : {});

  const telemetryCore = (typeof measureEdgeToEdgeInches === 'function')
    ? { measureEdgeToEdgeInches }
    : (typeof require === 'function' ? require('./tts-telemetry-core.js') : {});

  const spawnerCore = (typeof parseSpawnWaveSpec === 'function')
    ? { parseSpawnWaveSpec }
    : (typeof require === 'function' ? require('./spawner.js') : {});

  /**
   * Normalizes an array of datasheet or weapon keywords to trimmed uppercase tokens.
   *
   * @param {string[]} list - Raw keyword tokens.
   * @returns {string[]} Normalized uppercase keywords.
   */
  function normalizeKwList(list) {
    return Array.isArray(list) ? list.map(k => String(k || '').trim().toUpperCase()).filter(Boolean) : [];
  }

  /**
   * Computes minimum 2D horizontal base-edge-to-base-edge distance in inches between two tabletop squads/markers.
   *
   * @param {object} unitA - Source unit or marker.
   * @param {object} unitB - Destination unit or objective marker.
   * @returns {number} Shortest horizontal edge-to-edge distance in inches.
   */
  function squadEdgeDistance(unitA, unitB) {
    const modelsA = Array.isArray(unitA.models) && unitA.models.length > 0
      ? unitA.models
      : [{ pos: unitA.pos || { x: 0, z: 0 }, radiusInches: 0.63 }];
    const modelsB = Array.isArray(unitB.models) && unitB.models.length > 0
      ? unitB.models
      : [{ pos: unitB.pos || { x: 0, z: 0 }, radiusInches: unitB.radiusInches || 0.63 }];

    let minD = Infinity;
    for (const m1 of modelsA) {
      for (const m2 of modelsB) {
        const d = telemetryCore.measureEdgeToEdgeInches(m1.pos, m1.radiusInches || 0.63, m2.pos, m2.radiusInches || 0.63);
        if (d < minD) minD = d;
      }
    }
    return minD;
  }

  /**
   * Advances a 2D tabletop coordinate toward a destination up to `maxInches`, stopping `stopShortCenterDist`
   * short of the destination center so models respect 11th Edition Engagement Range or base-contact spacing.
   *
   * @param {{x: number, z: number}} fromPos - Starting center position.
   * @param {{x: number, z: number}} toPos - Goal center position.
   * @param {number} maxInches - Maximum movement allowance in inches.
   * @param {number} [stopShortCenterDist=0] - Center-to-center buffer distance to preserve.
   * @returns {{x: number, z: number, movedInches: number, facingY: number}}
   */
  function stepTowardPoint(fromPos, toPos, maxInches, stopShortCenterDist = 0) {
    const fx = Number(fromPos.x) || 0;
    const fz = Number(fromPos.z) || 0;
    const tx = Number(toPos.x) || 0;
    const tz = Number(toPos.z) || 0;
    const dx = tx - fx;
    const dz = tz - fz;
    const totalCenterDist = Math.hypot(dx, dz);
    if (totalCenterDist < 0.01) {
      return { x: fx, z: fz, movedInches: 0, facingY: 180 };
    }

    const allowedTravel = Math.max(0, Math.min(maxInches, totalCenterDist - stopShortCenterDist));
    const ux = dx / totalCenterDist;
    const uz = dz / totalCenterDist;
    const facingY = Number(((Math.atan2(ux, uz) * 180) / Math.PI).toFixed(1));

    return {
      x: Number((fx + ux * allowedTravel).toFixed(2)),
      z: Number((fz + uz * allowedTravel).toFixed(2)),
      movedInches: Number(allowedTravel.toFixed(2)),
      facingY
    };
  }

  /**
   * Samples a straight 2D movement vector against an axis-aligned solid obstacle footprint.
   *
   * @param {{x: number, z: number}} p1 - Segment start.
   * @param {{x: number, z: number}} p2 - Segment end.
   * @param {{minX: number, maxX: number, minZ: number, maxZ: number}} rect - Obstacle AABB.
   * @returns {boolean} True when the segment crosses inside the solid footprint.
   */
  function segmentIntersectsRect(p1, p2, rect) {
    const steps = 16;
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      const x = p1.x + (p2.x - p1.x) * t;
      const z = p1.z + (p2.z - p1.z) * t;
      if (x >= rect.minX && x <= rect.maxX && z >= rect.minZ && z <= rect.maxZ) {
        return true;
      }
    }
    return false;
  }

  /**
   * 1. Converts synced Mode 1 `zoneSpawns` into deterministic `SPAWN_WAVE` TTS commands
   * so off-board `HORDE_TEMPLATE` miniatures clone directly into LCT Spawn Zones.
   *
   * @param {Array<object>} [zoneSpawns=[]] - Active round zone spawns from Mode 1 Spawner.
   * @param {Array<object>} [spawnZoneAnchors=[]] - Optional custom `{ zone, x, z, facingY }` overrides.
   * @returns {{commands: Array<object>, summary: string}}
   */
  function planWaveSpawnCommands(zoneSpawns = [], spawnZoneAnchors = []) {
    if (!Array.isArray(zoneSpawns) || zoneSpawns.length === 0) {
      return { commands: [], summary: 'No active zone spawns to deploy.' };
    }

    const totalZones = zoneSpawns.length;
    const commands = [];

    zoneSpawns.forEach((z, idx) => {
      if (!z || z.bracketKey === 'NONE') return;
      let parsedUnits = Array.isArray(z.parsedWave) && z.parsedWave.length > 0 ? z.parsedWave : [];
      if (parsedUnits.length === 0 && Array.isArray(z.units) && typeof spawnerCore.parseSpawnWaveSpec === 'function') {
        parsedUnits = z.units.flatMap(u => spawnerCore.parseSpawnWaveSpec(u, () => 0));
      }
      if (parsedUnits.length === 0) return;

      const zoneNum = Number(z.zone) || (idx + 1);
      const anchor = spawnZoneAnchors.find(a => Number(a.zone) === zoneNum) || {
        zone: zoneNum,
        x: totalZones === 1 ? 0 : Number((-20 + (40 * idx) / Math.max(1, totalZones - 1)).toFixed(1)),
        z: 19.5,
        facingY: 180
      };

      commands.push({
        action: 'SPAWN_WAVE',
        zone: zoneNum,
        targetX: anchor.x,
        targetZ: anchor.z,
        facingY: anchor.facingY ?? 180,
        units: parsedUnits.map(u => ({
          templateName: u.templateName,
          count: Math.max(1, Number(u.count) || 1),
          embarked: u.embarked || null
        }))
      });
    });

    return {
      commands,
      summary: `Queued ${commands.length} Spawn Zone wave drop(s) for LCT Staging Shelf.`
    };
  }

  /**
   * Determines whether a Horde squad should Advance when out of effective gun or Charge range.
   */
  function shouldUnitAdvance(unit, moveProfile, distAfterNormalMove) {
    if (moveProfile.canShootAfterAdvance && moveProfile.canChargeAfterAdvance) return true;
    const rangedWeapons = (unit.weapons || []).filter(w => String(w.type || '').toLowerCase() !== 'melee');
    const maxGunRange = rangedWeapons.reduce((mx, w) => Math.max(mx, Number(w.rangeInches) || 0), 0);
    const allAssault = rangedWeapons.length > 0 && rangedWeapons.every(w => normalizeKwList(w.keywords).includes('ASSAULT'));

    if (allAssault && distAfterNormalMove > 9) return true;
    if (maxGunRange < distAfterNormalMove && distAfterNormalMove > 12) return true;
    return false;
  }

  /**
   * 2. Plans deterministic Horde Movement, Advance eligibility, obstacle detours & Pre-Overwatch LOS snapshots.
   * Records exact `(x, y, z)` model origins before moving so LOS-blocked moves can be reverted with one click.
   *
   * @param {object} [boardTelemetry={}] - Normalized LCT tabletop scan (`units`, `objectives`).
   * @param {object} [matchState={}] - Active match state (`factionName`, `activeMiseryIds`).
   * @param {object} [options={}] - Optional `{ obstacles, withinRazorWireKeys, spawnedSquadKeys }`.
   * @returns {{plans: Array<object>, commands: Array<object>}}
   */
  function planHordeMovementPhase(boardTelemetry = {}, matchState = {}, options = {}) {
    const allUnits = Array.isArray(boardTelemetry.units) ? boardTelemetry.units : [];
    const objectives = Array.isArray(boardTelemetry.objectives) ? boardTelemetry.objectives : [];
    const obstacles = Array.isArray(options.obstacles) ? options.obstacles : [];
    const razorWireSet = new Set(options.withinRazorWireKeys || []);
    const spawnedSet = new Set(options.spawnedSquadKeys || []);

    const hordeUnits = allUnits.filter(u => String(u.side || 'HORDE').toUpperCase() !== 'PLAYER');
    const playerUnits = allUnits.filter(u => String(u.side || '').toUpperCase() === 'PLAYER');

    const plans = [];
    const commands = [];

    for (const u of hordeUnits) {
      const originModels = (u.models || []).map(m => ({
        guid: m.guid,
        x: Number(m.pos?.x) || 0,
        y: Number(m.pos?.y) || 1.1,
        z: Number(m.pos?.z) || 0
      }));

      // Check if already Engaged (<= 2.0" horizontal)
      let closestPlayer = null;
      let minPlayerDist = Infinity;
      for (const p of playerUnits) {
        const d = squadEdgeDistance(u, p);
        if (d < minPlayerDist) {
          minPlayerDist = d;
          closestPlayer = p;
        }
      }

      if (minPlayerDist <= 2.0) {
        plans.push({
          squadKey: u.squadKey || u.name,
          unitName: u.name,
          guids: u.guids || originModels.map(m => m.guid),
          status: 'ENGAGED_HOLD',
          originModels
        });
        continue;
      }

      let closestObj = null;
      let minObjDist = Infinity;
      for (const o of objectives) {
        const d = squadEdgeDistance(u, o);
        if (d < minObjDist) {
          minObjDist = d;
          closestObj = o;
        }
      }

      // Mode 3 Target Selection: closest Player unit (or closest Objective if tied / no Player units)
      const pickObjective = (!closestPlayer && closestObj) ||
        (closestPlayer && closestObj && Math.abs(minPlayerDist - minObjDist) <= 0.1);
      const goalTarget = pickObjective ? closestObj : closestPlayer;

      if (!goalTarget) continue;

      const moveProfile = combatCore.resolveHordeMovementProfile(u, matchState, {
        spawnedThisTurn: spawnedSet.has(u.squadKey),
        withinRazorWire: razorWireSet.has(u.squadKey)
      });

      const goalDistEdge = pickObjective ? minObjDist : minPlayerDist;
      const distAfterNormal = Math.max(0, goalDistEdge - moveProfile.effectiveMove);
      const wantsAdvance = shouldUnitAdvance(u, moveProfile, distAfterNormal);
      const extraAdvance = (wantsAdvance && typeof moveProfile.autoAdvance === 'number') ? moveProfile.autoAdvance : 0;
      const moveBudgetInches = moveProfile.effectiveMove + extraAdvance;

      const uRadius = u.models?.[0]?.radiusInches || 0.63;
      const gRadius = goalTarget.models?.[0]?.radiusInches || goalTarget.radiusInches || 0.63;
      const stopShortCenter = pickObjective ? 0 : (uRadius + gRadius + 2.1);

      let step = stepTowardPoint(u.pos || { x: 0, z: 0 }, goalTarget.pos || { x: 0, z: 0 }, moveBudgetInches, stopShortCenter);
      let detouredAroundObstacle = false;
      let requiresGhostRing = false;

      const hasFly = moveProfile.keywords.includes('FLY');
      if (!hasFly) {
        for (const obs of obstacles) {
          if (!obs.solid) continue;
          if (segmentIntersectsRect(u.pos || { x: 0, z: 0 }, step, obs)) {
            const leftCorner = { x: obs.minX - 1.5, z: (obs.minZ + obs.maxZ) * 0.5 };
            const rightCorner = { x: obs.maxX + 1.5, z: (obs.minZ + obs.maxZ) * 0.5 };
            const pickCorner = Math.hypot(leftCorner.x - (u.pos?.x || 0), leftCorner.z - (u.pos?.z || 0)) <=
                               Math.hypot(rightCorner.x - (u.pos?.x || 0), rightCorner.z - (u.pos?.z || 0))
              ? leftCorner
              : rightCorner;

            step = stepTowardPoint(u.pos || { x: 0, z: 0 }, pickCorner, moveBudgetInches, 0);
            detouredAroundObstacle = true;
            if ((u.modelCount || 1) > 10) requiresGhostRing = true;
            break;
          }
        }
      }

      const guids = u.guids || originModels.map(m => m.guid);
      const moveCmd = {
        action: 'MOVE_UNIT',
        squadKey: u.squadKey || u.name,
        guids,
        targetX: step.x,
        targetZ: step.z,
        facingY: step.facingY
      };
      commands.push(moveCmd);

      if (requiresGhostRing) {
        commands.push({
          action: 'SPAWN_GHOST_RING',
          targetX: step.x,
          targetZ: step.z,
          label: `${u.name} Waypoint`
        });
      }

      plans.push({
        squadKey: u.squadKey || u.name,
        unitName: u.name,
        guids,
        status: 'MOVED_AWAITING_LOS_CHECK',
        goalName: goalTarget.name,
        moveBudgetInches,
        advanced: wantsAdvance && extraAdvance > 0,
        needsAdvanceMatRoll: wantsAdvance && extraAdvance === 0,
        advanceRollMod: moveProfile.advanceRollMod,
        targetX: step.x,
        targetZ: step.z,
        facingY: step.facingY,
        detouredAroundObstacle,
        requiresGhostRing,
        originModels
      });
    }

    return { plans, commands };
  }

  /**
   * Builds a `REVERT_MOVE` command restoring a Horde squad to its exact pre-move coordinates if LOS is blocked.
   *
   * @param {object} movePlan - Squad plan object produced by `planHordeMovementPhase`.
   * @returns {object|null} `REVERT_MOVE` command or `null` if no snapshot exists.
   */
  function buildMoveRevertCommand(movePlan) {
    if (!movePlan || !Array.isArray(movePlan.originModels)) return null;
    return {
      action: 'REVERT_MOVE',
      squadKey: movePlan.squadKey,
      unitName: movePlan.unitName,
      models: movePlan.originModels.map(m => ({ guid: m.guid, x: m.x, y: m.y, z: m.z }))
    };
  }

  /**
   * Extracts the target keyword (`VEHICLE`, `INFANTRY`, `MONSTER`, etc.) from `[ANTI-X Y+]` weapon keywords.
   */
  function extractAntiKeyword(weaponKws) {
    for (const kw of weaponKws) {
      const m = kw.match(/^ANTI-([A-Z\s]+?)\s+\d\+$/) || kw.match(/^([A-Z\s]+?)\s+HUNTER$/);
      if (m) return m[1].trim().toUpperCase();
    }
    return null;
  }

  /**
   * 3. Selects legal ranged targets per weapon using Mode 3 Priority (`[ANTI-X]`, `[PRECISION]`, `[MELTA]`)
   * and enforces 11th Edition Hidden (`15"`) / Gone to Ground (`12"`) visibility caps.
   *
   * @param {object} [boardTelemetry={}] - Normalized LCT tabletop scan (`units`, `objectives`).
   * @param {object} [matchState={}] - Active match state (`factionName`, `activeMiseryIds`).
   * @param {object} [options={}] - Optional `{ losBlockedPairs }` array of `'attackerKey->targetKey'` strings.
   * @returns {Array<object>} Prioritized weapon-to-target firing assignments.
   */
  function selectHordeShootingTargets(boardTelemetry = {}, matchState = {}, options = {}) {
    const allUnits = Array.isArray(boardTelemetry.units) ? boardTelemetry.units : [];
    const blockedSet = new Set(options.losBlockedPairs || []);
    const miseryIds = Array.isArray(matchState.activeMiseryIds) ? matchState.activeMiseryIds.map(Number) : [];
    const ignoreTerrainVis = miseryIds.includes(28);

    const hordeUnits = allUnits.filter(u => String(u.side || 'HORDE').toUpperCase() !== 'PLAYER');
    const playerUnits = allUnits.filter(u => String(u.side || '').toUpperCase() === 'PLAYER');
    const assignments = [];

    for (const attacker of hordeUnits) {
      for (const baseWeapon of (attacker.weapons || [])) {
        if (String(baseWeapon.type || '').toLowerCase() === 'melee') continue;
        const range = Number(baseWeapon.rangeInches) || 0;
        if (range <= 0) continue;

        const candidates = [];
        for (const target of playerUnits) {
          const pairKey = `${attacker.squadKey || attacker.name}->${target.squadKey || target.name}`;
          if (blockedSet.has(pairKey)) continue;

          const dist = squadEdgeDistance(attacker, target);
          if (dist > range) continue;

          // 11th Edition Hidden (15") & Gone to Ground (12") visibility caps
          if (!ignoreTerrainVis) {
            if (target.isGoneToGround && dist > 12.0) continue;
            if (target.isHidden && dist > 15.0) continue;
          }

          const mods = combatCore.resolveHordeAttackModifiers(attacker, target, baseWeapon, matchState);
          if (attacker.advancedThisTurn && !miseryIds.includes(1) && matchState.factionName !== "Emperor's Children") {
            if (!mods.keywords.includes('ASSAULT')) continue;
          }

          candidates.push({ target, dist, mods });
        }

        if (candidates.length === 0) continue;
        candidates.sort((a, b) => a.dist - b.dist);

        const effectiveKws = candidates[0].mods.keywords || normalizeKwList(baseWeapon.keywords);
        const antiTargetKw = extractAntiKeyword(effectiveKws);
        const hasPrecision = effectiveKws.includes('PRECISION');
        const hasMelta = effectiveKws.some(k => k.startsWith('MELTA'));

        let chosen = null;
        if (antiTargetKw) {
          chosen = candidates.find(c => normalizeKwList(c.target.keywords).includes(antiTargetKw));
        }
        if (!chosen && hasPrecision) {
          chosen = candidates.find(c => {
            const tk = normalizeKwList(c.target.keywords);
            return tk.includes('CHARACTER') || tk.includes('LEADER') || Boolean(c.target.hasLeader);
          });
        }
        if (!chosen && hasMelta) {
          chosen = candidates.find(c => {
            const tk = normalizeKwList(c.target.keywords);
            return !tk.includes('INFANTRY') && !tk.includes('SWARM');
          });
        }
        if (!chosen) chosen = candidates[0];

        assignments.push({
          attackerKey: attacker.squadKey || attacker.name,
          attackerName: attacker.name,
          targetKey: chosen.target.squadKey || chosen.target.name,
          targetName: chosen.target.name,
          distanceInches: chosen.dist,
          target: chosen.target,
          weapon: baseWeapon
        });
      }
    }

    return assignments;
  }

  /**
   * 4. Evaluates eligible Horde Charges (`<= 12"`) and builds `2D6` LCT mat roll jobs (or Misery #4 auto-12" moves).
   *
   * @param {object} [boardTelemetry={}] - Normalized LCT tabletop scan (`units`).
   * @param {object} [matchState={}] - Active match state (`factionName`, `activeMiseryIds`).
   * @param {object} [options={}] - Optional `{ withinRazorWireKeys }` applying `-2` Charge roll modifier.
   * @returns {{declarations: Array<object>}}
   */
  function planHordeCharges(boardTelemetry = {}, matchState = {}, options = {}) {
    const allUnits = Array.isArray(boardTelemetry.units) ? boardTelemetry.units : [];
    const razorWireSet = new Set(options.withinRazorWireKeys || []);
    const hordeUnits = allUnits.filter(u => String(u.side || 'HORDE').toUpperCase() !== 'PLAYER');
    const playerUnits = allUnits.filter(u => String(u.side || '').toUpperCase() === 'PLAYER');

    const declarations = [];
    for (const h of hordeUnits) {
      let closestEnemy = null;
      let minD = Infinity;
      for (const p of playerUnits) {
        const d = squadEdgeDistance(h, p);
        if (d < minD) {
          minD = d;
          closestEnemy = p;
        }
      }
      if (!closestEnemy || minD <= 2.0 || minD > 12.0) continue;

      const moveProf = combatCore.resolveHordeMovementProfile(h, matchState, {
        withinRazorWire: razorWireSet.has(h.squadKey)
      });
      if (h.advancedThisTurn && !moveProf.canChargeAfterAdvance) continue;

      const uRadius = h.models?.[0]?.radiusInches || 0.63;
      const eRadius = closestEnemy.models?.[0]?.radiusInches || 0.63;
      const destStep = stepTowardPoint(h.pos || { x: 0, z: 0 }, closestEnemy.pos || { x: 0, z: 0 }, 24, uRadius + eRadius + 0.25);
      const minEdgeRollNeeded = Math.max(2, Math.ceil(minD - 2.0));
      const seqId = `chg_${h.squadKey || h.name}`;

      const decl = {
        sequenceId: seqId,
        squadKey: h.squadKey || h.name,
        attackerName: h.name,
        guids: h.guids || (h.models || []).map(m => m.guid),
        targetName: closestEnemy.name,
        distanceInches: minD,
        neededEdgeReachInches: Number(Math.max(0, minD - 2.0).toFixed(2)),
        chargeRollMod: moveProf.chargeRollMod,
        destX: destStep.x,
        destZ: destStep.z,
        facingY: destStep.facingY,
        autoSucceeded: typeof moveProf.autoCharge === 'number',
        lctCommand: null,
        moveCommand: null
      };

      if (decl.autoSucceeded) {
        decl.moveCommand = {
          action: 'MOVE_UNIT',
          squadKey: decl.squadKey,
          guids: decl.guids,
          targetX: decl.destX,
          targetZ: decl.destZ,
          facingY: decl.facingY
        };
      } else {
        decl.lctCommand = {
          action: 'LCT_MAT_ROLL',
          rollId: `${seqId}:CHARGE_ROLL`,
          sequenceId: seqId,
          stage: 'CHARGE_ROLL',
          matSide: 'RED',
          count: 2,
          threshold: minEdgeRollNeeded,
          clearFirst: true,
          label: `${h.name} -> ${closestEnemy.name} — 2D6 Charge (Need ${minEdgeRollNeeded}" after ${moveProf.chargeRollMod >= 0 ? '+' : ''}${moveProf.chargeRollMod} mod)`
        };
      }

      declarations.push(decl);
    }

    return { declarations };
  }

  /**
   * Resolves a settled `2D6` LCT mat Charge roll and emits `MOVE_UNIT` if Engagement Range (`<= 2.0"`) is reached.
   *
   * @param {object} chargeDecl - Charge declaration built by `planHordeCharges`.
   * @param {number[]} [dice=[]] - Settled `2D6` pips from the LCT TTS Dice Mat.
   * @returns {object} Resolved charge result with `succeeded` flag and optional `moveCommand`.
   */
  function resolveHordeChargeRoll(chargeDecl, dice = []) {
    const d1 = Number(dice[0]) || 1;
    const d2 = Number(dice[1]) || 1;
    const modifiedTotal = Math.max(1, d1 + d2 + (Number(chargeDecl.chargeRollMod) || 0));
    const succeeded = modifiedTotal >= chargeDecl.neededEdgeReachInches;

    return {
      ...chargeDecl,
      diceRolled: [d1, d2],
      modifiedTotal,
      succeeded,
      moveCommand: succeeded
        ? {
            action: 'MOVE_UNIT',
            squadKey: chargeDecl.squadKey,
            guids: chargeDecl.guids,
            targetX: chargeDecl.destX,
            targetZ: chargeDecl.destZ,
            facingY: chargeDecl.facingY
          }
        : null
    };
  }

  /**
   * 5. Implements 11th Edition Core Rule 12.08 `3"` Consolidation Priority (`ONGOING` -> `ENGAGING` -> `OBJECTIVE` -> `HOLD`).
   *
   * @param {object} unit - Fighting Horde unit.
   * @param {Array<object>} [enemyUnits=[]] - Active Player units on the board.
   * @param {Array<object>} [objectives=[]] - Active Objective markers on the board.
   * @returns {{mode: string, targetName: string|null, moveCommand: object|null}}
   */
  function planConsolidationMove(unit, enemyUnits = [], objectives = []) {
    const guids = unit.guids || (unit.models || []).map(m => m.guid);
    const uRadius = unit.models?.[0]?.radiusInches || 0.63;

    let closestEnemy = null;
    let minEnemyD = Infinity;
    for (const e of enemyUnits) {
      const d = squadEdgeDistance(unit, e);
      if (d < minEnemyD) {
        minEnemyD = d;
        closestEnemy = e;
      }
    }

    // Mode 1: Ongoing Consolidation (already Engaged <= 2.0")
    if (closestEnemy && minEnemyD <= 2.0) {
      const eRadius = closestEnemy.models?.[0]?.radiusInches || 0.63;
      const step = stepTowardPoint(unit.pos || { x: 0, z: 0 }, closestEnemy.pos || { x: 0, z: 0 }, 3.0, uRadius + eRadius + 0.1);
      return {
        mode: 'ONGOING',
        targetName: closestEnemy.name,
        moveCommand: { action: 'MOVE_UNIT', guids, targetX: step.x, targetZ: step.z, facingY: step.facingY }
      };
    }

    // Mode 2: Engaging Consolidation (unengaged, but 3" move reaches <= 2.0" Engagement Range -> dist <= 5.0")
    if (closestEnemy && minEnemyD <= 5.0) {
      const eRadius = closestEnemy.models?.[0]?.radiusInches || 0.63;
      const step = stepTowardPoint(unit.pos || { x: 0, z: 0 }, closestEnemy.pos || { x: 0, z: 0 }, 3.0, uRadius + eRadius + 0.25);
      return {
        mode: 'ENGAGING',
        targetName: closestEnemy.name,
        moveCommand: { action: 'MOVE_UNIT', guids, targetX: step.x, targetZ: step.z, facingY: step.facingY }
      };
    }

    // Mode 3: Objective Consolidation (within 6.0" edge-to-edge so 3" move reaches <= 3.0" Objective range)
    let closestObj = null;
    let minObjD = Infinity;
    for (const o of objectives) {
      const d = squadEdgeDistance(unit, o);
      if (d < minObjD) {
        minObjD = d;
        closestObj = o;
      }
    }
    if (closestObj && minObjD <= 6.0) {
      const step = stepTowardPoint(unit.pos || { x: 0, z: 0 }, closestObj.pos || { x: 0, z: 0 }, 3.0, 0);
      return {
        mode: 'OBJECTIVE',
        targetName: closestObj.name,
        moveCommand: { action: 'MOVE_UNIT', guids, targetX: step.x, targetZ: step.z, facingY: step.facingY }
      };
    }

    return { mode: 'HOLD', targetName: null, moveCommand: null };
  }

  return {
    planWaveSpawnCommands,
    planHordeMovementPhase,
    buildMoveRevertCommand,
    selectHordeShootingTargets,
    planHordeCharges,
    resolveHordeChargeRoll,
    planConsolidationMove
  };
});

````

---

## File: `tests/js/horde-autopilot-core.test.js` <a id="file-testsjshordeautopilotcoretestjs"></a>

````javascript
/**
 * @fileoverview Unit tests for js/horde-autopilot-core.js deterministic wave spawning,
 * obstacle-aware movement, pre-Overwatch LOS revert, keyword target priority, charges & 11th Ed consolidation.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  planWaveSpawnCommands,
  planHordeMovementPhase,
  buildMoveRevertCommand,
  selectHordeShootingTargets,
  planHordeCharges,
  resolveHordeChargeRoll,
  planConsolidationMove
} = require('../../js/horde-autopilot-core.js');

test('Zero-JS-RNG Guard: horde-autopilot-core.js contains zero Math.random() calls', () => {
  const src = fs.readFileSync(path.resolve(__dirname, '../../js/horde-autopilot-core.js'), 'utf8');
  assert.equal(src.includes('Math.random'), false, 'Autopilot core must be 100% deterministic');
});

test('planWaveSpawnCommands: builds SPAWN_WAVE commands from synced Mode 1 zoneSpawns and skips NONE/empty warnings', () => {
  assert.equal(planWaveSpawnCommands([]).commands.length, 0);
  const zoneSpawns = [
    {
      zone: 1,
      bracketKey: 'NONE',
      units: ['None'],
      parsedWave: []
    },
    {
      zone: 2,
      bracketKey: '7-9',
      units: ['5 Bladeguard Veterans + 1 Captain'],
      parsedWave: [
        { count: 5, templateName: 'Bladeguard Veterans', embarked: null },
        { count: 1, templateName: 'Captain', embarked: null }
      ]
    },
    {
      zone: 3,
      bracketKey: '5-6',
      units: ['⚠️ Necrons Pool Empty for Bracket [5-6] — Configure in Mode 4!'],
      parsedWave: []
    }
  ];

  const plan = planWaveSpawnCommands(zoneSpawns);
  assert.equal(plan.commands.length, 1, 'Only valid populated zones should emit SPAWN_WAVE');
  assert.equal(plan.commands[0].action, 'SPAWN_WAVE');
  assert.equal(plan.commands[0].zone, 2);
  assert.equal(plan.commands[0].units.length, 2);
  assert.equal(plan.commands[0].units[0].templateName, 'Bladeguard Veterans');
  assert.equal(plan.commands[0].units[0].count, 5);
});

test('planHordeMovementPhase & buildMoveRevertCommand: stops outside 2" Engagement Range, detours/flags obstacles, auto-Advances out-of-range melee, and snapshots origin for LOS revert', () => {
  const board = {
    objectives: [{ name: 'Obj 1', pos: { x: 0, z: 0 }, radiusInches: 0.79 }],
    units: [
      {
        squadKey: 'HORDE::Berzerkers',
        name: 'Khorne Berzerkers',
        side: 'HORDE',
        modelCount: 15,
        move: 6,
        pos: { x: 0, z: 20 },
        keywords: ['INFANTRY'],
        weapons: [{ name: 'Chainblade', type: 'melee', rangeInches: 0, keywords: [] }],
        models: [
          { guid: 'b1', pos: { x: 0, y: 1.1, z: 20 }, radiusInches: 0.63 },
          { guid: 'b2', pos: { x: 1.3, y: 1.1, z: 20 }, radiusInches: 0.63 }
        ]
      },
      {
        squadKey: 'PLAYER::Krieg',
        name: 'Death Korps',
        side: 'PLAYER',
        modelCount: 10,
        pos: { x: 0, z: -5 },
        keywords: ['INFANTRY'],
        models: [{ guid: 'k1', pos: { x: 0, y: 1.1, z: -5 }, radiusInches: 0.5 }]
      }
    ]
  };

  // World Eaters (+2" Move = 8") + Misery #4 (auto-Advance 6" = 14" total move)
  const moveRes = planHordeMovementPhase(
    board,
    { factionName: 'World Eaters', activeMiseryIds: [4] },
    { obstacles: [{ name: 'Central Ruin', minX: -3, maxX: 3, minZ: 8, maxZ: 12, solid: true }] }
  );

  assert.equal(moveRes.plans.length, 1);
  const p = moveRes.plans[0];
  assert.equal(p.advanced, true, 'Out-of-range melee unit must automatically Advance');
  assert.equal(p.moveBudgetInches, 14);
  assert.equal(p.originModels.length, 2, 'Must record exact origin coordinates for Pre-Overwatch LOS revert');
  assert.equal(p.detouredAroundObstacle || p.requiresGhostRing, true, 'Must detect solid ruin blocking straight path');
  assert.equal(p.requiresGhostRing, true, 'Blob >10 models detouring around obstacle emits SPAWN_GHOST_RING');

  // Test Pre-Overwatch LOS Revert command generation
  const revertCmd = buildMoveRevertCommand(p);
  assert.equal(revertCmd.action, 'REVERT_MOVE');
  assert.deepEqual(revertCmd.models[0], { guid: 'b1', x: 0, y: 1.1, z: 20 });
  assert.equal(buildMoveRevertCommand(null), null);

  // Verify close unit stops > 2.0" outside Engagement Range on a Normal Move
  const closeBoard = {
    objectives: [],
    units: [
      {
        squadKey: 'HORDE::Gaunts',
        name: 'Hormagaunts',
        side: 'HORDE',
        modelCount: 1,
        move: 10,
        pos: { x: 0, z: 6 },
        keywords: ['INFANTRY'],
        weapons: [{ name: 'Claws', type: 'melee', rangeInches: 0, keywords: [] }],
        models: [{ guid: 'g1', pos: { x: 0, y: 1, z: 6 }, radiusInches: 0.5 }]
      },
      {
        squadKey: 'PLAYER::Tank',
        name: 'Rogal Dorn',
        side: 'PLAYER',
        modelCount: 1,
        pos: { x: 0, z: 0 },
        keywords: ['VEHICLE'],
        models: [{ guid: 't1', pos: { x: 0, y: 1, z: 0 }, radiusInches: 1.5 }]
      }
    ]
  };
  const closeRes = planHordeMovementPhase(closeBoard, { factionName: 'Tyranids', activeMiseryIds: [] });
  assert.ok(closeRes.plans[0].targetZ >= 4.05, 'Must stop outside 2.0" edge-to-edge Engagement Range (radii 0.5 + 1.5 + 2.1 buffer)');
});

test('selectHordeShootingTargets: enforces [ANTI-X], [PRECISION], [MELTA], Hidden 15" / Gone to Ground 12" & LOS blocks', () => {
  const shooter = {
    squadKey: 'HORDE::Shooter',
    guid: 'h_shoot',
    name: 'Chaos Havocs',
    side: 'HORDE',
    modelCount: 1,
    pos: { x: 0, z: 0 },
    keywords: ['INFANTRY'],
    models: [{ guid: 'h_shoot', pos: { x: 0, z: 0 }, radiusInches: 0.63 }],
    weapons: [
      { name: 'Haywire Cannon', type: 'ranged', rangeInches: 24, attacks: 2, skill: 3, strength: 6, ap: -1, damage: 2, keywords: ['ANTI-VEHICLE 4+'] },
      { name: 'Sniper Rifle', type: 'ranged', rangeInches: 36, attacks: 1, skill: 3, strength: 5, ap: -2, damage: 3, keywords: ['PRECISION'] },
      { name: 'Multi-melta', type: 'ranged', rangeInches: 18, attacks: 2, attacksMod: 0, skill: 4, strength: 9, ap: -4, damage: 'D6', keywords: ['MELTA 2'] },
      { name: 'Autocannon', type: 'ranged', rangeInches: 36, attacks: 2, skill: 4, strength: 9, ap: -1, damage: 3, keywords: [] }
    ]
  };

  const playerScreen = {
    squadKey: 'PLAYER::Screen',
    guid: 'p_screen',
    name: 'Krieg Guardsmen',
    side: 'PLAYER',
    pos: { x: 0, z: 8 },
    keywords: ['INFANTRY'],
    models: [{ guid: 'p_screen', pos: { x: 0, z: 8 }, radiusInches: 0.5 }]
  };
  const playerCommand = {
    squadKey: 'PLAYER::Command',
    guid: 'p_cmd',
    name: 'Marshal Command Squad',
    side: 'PLAYER',
    pos: { x: 0, z: 12 },
    keywords: ['INFANTRY', 'CHARACTER'],
    models: [{ guid: 'p_cmd', pos: { x: 0, z: 12 }, radiusInches: 0.5 }]
  };
  const playerTank = {
    squadKey: 'PLAYER::Tank',
    guid: 'p_tank',
    name: 'Leman Russ',
    side: 'PLAYER',
    pos: { x: 0, z: 15 },
    keywords: ['VEHICLE', 'IMPERIUM'],
    models: [{ guid: 'p_tank', pos: { x: 0, z: 15 }, radiusInches: 1.5 }]
  };
  const hiddenScouts = {
    squadKey: 'PLAYER::Scouts',
    guid: 'p_scouts',
    name: 'Hidden Stalkers',
    side: 'PLAYER',
    isHidden: true,
    pos: { x: 0, z: 18 },
    keywords: ['INFANTRY'],
    models: [{ guid: 'p_scouts', pos: { x: 0, z: 18 }, radiusInches: 0.5 }]
  };

  const assignments = selectHordeShootingTargets(
    { units: [shooter, playerScreen, playerCommand, playerTank, hiddenScouts], objectives: [] },
    { factionName: 'Chaos Space Marines', activeMiseryIds: [] }
  );

  const byWeapon = Object.fromEntries(assignments.map(a => [a.weapon.name, a.targetName]));
  assert.equal(byWeapon['Haywire Cannon'], 'Leman Russ', '[ANTI-VEHICLE] must prioritize closest VEHICLE');
  assert.equal(byWeapon['Sniper Rifle'], 'Marshal Command Squad', '[PRECISION] must prioritize closest CHARACTER unit');
  assert.equal(byWeapon['Multi-melta'], 'Leman Russ', '[MELTA] must prioritize closest non-INFANTRY/non-SWARM');
  assert.equal(byWeapon['Autocannon'], 'Krieg Guardsmen', 'Standard weapon targets closest visible Player unit');

  // Verify Hidden 15" cap blocks targeting Hidden Stalkers at ~16.87" when they are the only enemy
  const stealthCheck = selectHordeShootingTargets(
    { units: [shooter, hiddenScouts], objectives: [] },
    { factionName: 'Chaos Space Marines', activeMiseryIds: [] }
  );
  assert.equal(stealthCheck.length, 0, 'Hidden unit >15" away cannot be targeted by ranged attacks');

  // Misery #28 (They Fly Now) ignores terrain visibility & overrides Hidden cap
  const flyOverride = selectHordeShootingTargets(
    { units: [shooter, hiddenScouts], objectives: [] },
    { factionName: 'Chaos Space Marines', activeMiseryIds: [28] }
  );
  assert.ok(flyOverride.length > 0, 'Misery #28 ignores terrain visibility');
});

test('planHordeCharges & resolveHordeChargeRoll: queues 2D6 LCT mat roll, applies Razor Wire -2 mod, and glides into Engagement Range', () => {
  const board = {
    objectives: [],
    units: [
      {
        squadKey: 'HORDE::Eightbound',
        name: 'Eightbound',
        side: 'HORDE',
        modelCount: 3,
        guids: ['e1', 'e2', 'e3'],
        pos: { x: 0, z: 9 },
        keywords: ['INFANTRY'],
        models: [{ guid: 'e1', pos: { x: 0, z: 9 }, radiusInches: 0.78 }]
      },
      {
        squadKey: 'PLAYER::Beserks',
        name: 'Cthonian Beserks',
        side: 'PLAYER',
        pos: { x: 0, z: 0 },
        keywords: ['INFANTRY'],
        models: [{ guid: 'c1', pos: { x: 0, z: 0 }, radiusInches: 0.63 }]
      }
    ]
  };

  const chargePlan = planHordeCharges(
    board,
    { factionName: 'World Eaters', activeMiseryIds: [] },
    { withinRazorWireKeys: ['HORDE::Eightbound'] }
  );
  assert.equal(chargePlan.declarations.length, 1);
  const decl = chargePlan.declarations[0];
  // Edge-to-edge distance = 9 - 0.78 - 0.63 = 7.59"; Engagement Range is <= 2.0", so needed charge roll >= 6" (7.59 - 2.0 = 5.59 -> 6)
  assert.equal(decl.chargeRollMod, -2, 'Razor Wire subtracts 2 from Charge rolls');
  assert.equal(decl.lctCommand.action, 'LCT_MAT_ROLL');
  assert.equal(decl.lctCommand.count, 2);

  // Fail roll with Razor Wire: [4, 3] = 7 - 2 = 5 (< 5.59" needed to reach 2.0" Engagement Range)
  const failed = resolveHordeChargeRoll(decl, [4, 3]);
  assert.equal(failed.succeeded, false);
  assert.equal(failed.moveCommand, null);

  // Pass roll: [5, 5] = 10 - 2 = 8 (>= 5.59") -> glides into base-to-base!
  const passed = resolveHordeChargeRoll(decl, [5, 5]);
  assert.equal(passed.succeeded, true);
  assert.equal(passed.moveCommand.action, 'MOVE_UNIT');
});

test('planConsolidationMove: enforces 11th Edition 3-Tier Consolidation priority (Ongoing -> Engaging -> Objective)', () => {
  const mover = {
    squadKey: 'HORDE::Orks',
    name: 'Boyz',
    guids: ['o1'],
    pos: { x: 0, z: 0 },
    models: [{ guid: 'o1', pos: { x: 0, z: 0 }, radiusInches: 0.63 }]
  };

  // Tier 1: Already Engaged (<= 2.0") -> Ongoing Consolidation toward base-to-base
  const tier1 = planConsolidationMove(
    mover,
    [{ name: 'Krieg', pos: { x: 0, z: 2.5 }, models: [{ pos: { x: 0, z: 2.5 }, radiusInches: 0.5 }] }],
    [{ name: 'Obj 1', pos: { x: -3, z: 0 }, radiusInches: 0.79 }]
  );
  assert.equal(tier1.mode, 'ONGOING');

  // Tier 2: Unengaged, enemy at 3.8" edge-to-edge (3" move reaches <= 2.0" Engagement Range!) -> Engaging Consolidation
  const tier2 = planConsolidationMove(
    mover,
    [{ name: 'Scout', pos: { x: 0, z: 5.0 }, models: [{ pos: { x: 0, z: 5.0 }, radiusInches: 0.63 }] }],
    [{ name: 'Obj 1', pos: { x: -3, z: 0 }, radiusInches: 0.79 }]
  );
  assert.equal(tier2.mode, 'ENGAGING');

  // Tier 3: Enemy too far (10"), Objective at 4.2" edge-to-edge (3" move reaches <= 3.0" Obj range!) -> Objective Consolidation
  const tier3 = planConsolidationMove(
    mover,
    [{ name: 'Far Tank', pos: { x: 0, z: 14.0 }, models: [{ pos: { x: 0, z: 14.0 }, radiusInches: 1.5 }] }],
    [{ name: 'Obj 1', pos: { x: 5.5, z: 0 }, radiusInches: 0.79 }]
  );
  assert.equal(tier3.mode, 'OBJECTIVE');

  // Hold: neither enemy nor objective reachable
  const hold = planConsolidationMove(mover, [], []);
  assert.equal(hold.mode, 'HOLD');
});

````
