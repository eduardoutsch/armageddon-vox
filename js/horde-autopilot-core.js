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

  const deepStrikeCore = (typeof partitionWavesByDeepStrikeEligibility === 'function')
    ? { partitionWavesByDeepStrikeEligibility, planDeepStrikeIngressDrops }
    : (typeof require === 'function' ? require('./horde-deepstrike-core.js') : {});

  const spawnerCore = (typeof parseSpawnWaveSpec === 'function')
    ? {
        parseSpawnWaveSpec,
        normalizeEmbarkedUnits: typeof normalizeEmbarkedUnits === 'function' ? normalizeEmbarkedUnits : null
      }
    : (typeof require === 'function' ? require('./spawner.js') : {});

  const STANDALONE_HULL_PATTERN = /\b(knight|armiger|wardog|carnifex|dreadnought|tank|rhino|chimera|impulsor|raider|trukk|land\s+raider|monolith|baneblade|blackstar|valkyrie)\b/i;

  function normalizeCargoList(rawEmbarked) {
    if (!rawEmbarked) return [];
    if (typeof spawnerCore.normalizeEmbarkedUnits === 'function') {
      return spawnerCore.normalizeEmbarkedUnits(rawEmbarked);
    }
    const arr = Array.isArray(rawEmbarked) ? rawEmbarked : [rawEmbarked];
    return arr
      .filter(item => item && item.templateName)
      .map(item => ({
        count: Math.max(1, Number(item.count) || 1),
        templateName: String(item.templateName).trim()
      }));
  }

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
   * Exact 2D Liang-Barsky segment-vs-AABB intersection check against a solid/obscuring obstacle footprint.
   * Catches even thin (`0.15"–0.2"`) LCT ruin walls that discrete point sampling could step across.
   *
   * @param {{x: number, z: number}} p1 - Segment start.
   * @param {{x: number, z: number}} p2 - Segment end.
   * @param {{minX: number, maxX: number, minZ: number, maxZ: number}} rect - Obstacle AABB.
   * @returns {boolean} True when the segment crosses inside the obstacle footprint.
   */
  function segmentIntersectsRect(p1, p2, rect) {
    if (!p1 || !p2 || !rect) return false;
    const x1 = Number(p1.x) || 0;
    const z1 = Number(p1.z) || 0;
    const x2 = Number(p2.x) || 0;
    const z2 = Number(p2.z) || 0;
    const dx = x2 - x1;
    const dz = z2 - z1;
    let t0 = 0;
    let t1 = 1;
    const p = [-dx, dx, -dz, dz];
    const q = [x1 - rect.minX, rect.maxX - x1, z1 - rect.minZ, rect.maxZ - z1];
    for (let i = 0; i < 4; i++) {
      if (Math.abs(p[i]) < 1e-9) {
        if (q[i] < 0) return false;
      } else {
        const t = q[i] / p[i];
        if (p[i] < 0) {
          if (t > t1) return false;
          if (t > t0) t0 = t;
        } else {
          if (t < t0) return false;
          if (t < t1) t1 = t;
        }
      }
    }
    return t0 <= t1 && t1 > 0.001 && t0 < 0.999;
  }

  /**
   * Squad-level 2D obstacle LOS check: returns true only when EVERY model in `attacker` has its
   * horizontal sightline to EVERY model in `target` intersected by at least one solid/obscuring obstacle.
   */
  function isSquadBlockedByObstacles(attacker, target, obstacles) {
    const blocking = (Array.isArray(obstacles) ? obstacles : []).filter(
      o => o && (o.solid !== false || o.obscuring)
    );
    if (blocking.length === 0) return false;

    const aPoints = Array.isArray(attacker.models) && attacker.models.length > 0
      ? attacker.models.map(m => m.pos || attacker.pos || { x: 0, z: 0 })
      : [attacker.pos || { x: 0, z: 0 }];
    const tPoints = Array.isArray(target.models) && target.models.length > 0
      ? target.models.map(m => m.pos || target.pos || { x: 0, z: 0 })
      : [target.pos || { x: 0, z: 0 }];

    for (const pa of aPoints) {
      for (const pt of tPoints) {
        const pairBlocked = blocking.some(obs => segmentIntersectsRect(pa, pt, obs));
        if (!pairBlocked) return false;
      }
    }
    return true;
  }

  /**
   * 1. Converts synced Mode 1 `zoneSpawns` into deterministic `SPAWN_WAVE` TTS commands
   * so off-board `HORDE_TEMPLATE` miniatures clone directly into LCT Spawn Zones.
   *
   * @param {Array<object>} [zoneSpawns=[]] - Active round zone spawns from Mode 1 Spawner.
   * @param {Array<object>} [spawnZoneAnchors=[]] - Optional custom `{ zone, x, z, facingY }` overrides.
   * @returns {{commands: Array<object>, summary: string}}
   */
  function planWaveSpawnCommands(zoneSpawns = [], spawnZoneAnchors = [], options = {}) {
    if (!Array.isArray(zoneSpawns) || zoneSpawns.length === 0) {
      return { commands: [], queuedReserves: [], summary: 'No active zone spawns to deploy.' };
    }

    let workingSpawns = zoneSpawns;
    let queuedReserves = [];
    const hasPincer = zoneSpawns.some(z => z && (z.isPincerManeuver || z.zone === 'PINCER'));
    if (
      (options.battleRound !== undefined || hasPincer) &&
      typeof deepStrikeCore.partitionWavesByDeepStrikeEligibility === 'function'
    ) {
      const part = deepStrikeCore.partitionWavesByDeepStrikeEligibility(zoneSpawns, {
        battleRound: options.battleRound ?? 1,
        shelfTemplates: options.shelfTemplates || [],
        spawnZoneAnchors
      });
      workingSpawns = part.immediateZoneSpawns;
      queuedReserves = part.reserveEntries;
    }

    const totalZones = workingSpawns.length;
    const commands = [];

    workingSpawns.forEach((z, idx) => {
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

      const normalizedWaveUnits = parsedUnits.map(u => {
        const count = Math.max(1, Number(u.count) || 1);
        const embarkedUnits = normalizeCargoList(u.embarkedUnits || u.embarked);
        const embarkedSpec = embarkedUnits.map(c => `${c.count} ${c.templateName}`).join(' + ');
        return {
          templateName: u.templateName,
          count,
          embarked: u.embarked || null,
          embarkedUnits,
          embarkedSpec,
          attachedGroup: null
        };
      });

      let groupSeq = 0;
      for (let i = 0; i < normalizedWaveUnits.length; i++) {
        if (normalizedWaveUnits[i].attachedGroup) continue;
        groupSeq += 1;
        const groupId = `Z${zoneNum}_G${groupSeq}`;
        normalizedWaveUnits[i].attachedGroup = groupId;

        const cur = normalizedWaveUnits[i];
        const next = normalizedWaveUnits[i + 1];
        const canAttachLeader =
          next &&
          cur.count >= 2 &&
          next.count === 1 &&
          cur.embarkedUnits.length === 0 &&
          next.embarkedUnits.length === 0 &&
          !STANDALONE_HULL_PATTERN.test(cur.templateName) &&
          !STANDALONE_HULL_PATTERN.test(next.templateName);

        if (canAttachLeader) {
          next.attachedGroup = groupId;
        }
      }

      commands.push({
        action: 'SPAWN_WAVE',
        zone: zoneNum,
        targetX: anchor.x,
        targetZ: anchor.z,
        facingY: anchor.facingY ?? 180,
        units: normalizedWaveUnits
      });
    });

    const reserveNote = queuedReserves.length > 0
      ? ` + ${queuedReserves.length} Deep Strike Reserve unit(s) held for Step 2 Ingress.`
      : '';
    return {
      commands,
      queuedReserves,
      summary: `Queued ${commands.length} Spawn Zone wave drop(s) for LCT Staging Shelf.${reserveNote}`
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
    const obstacles = Array.isArray(options.obstacles)
      ? options.obstacles
      : (Array.isArray(boardTelemetry.obstacles) ? boardTelemetry.obstacles : []);
    const razorWireSet = new Set(options.withinRazorWireKeys || []);
    const spawnedSet = new Set(options.spawnedSquadKeys || []);

    const hordeUnits = allUnits.filter(u => String(u.side || 'HORDE').toUpperCase() !== 'PLAYER');
    const playerUnits = allUnits.filter(u => String(u.side || '').toUpperCase() === 'PLAYER');

    const plans = [];
    const commands = [];

    for (const u of hordeUnits) {
      const originPos = {
        x: Number(u.pos?.x) || 0,
        y: Number(u.pos?.y) || 1.1,
        z: Number(u.pos?.z) || 0
      };
      const originModels = (u.models || []).map(m => ({
        guid: m.guid,
        x: Number(m.pos?.x) || 0,
        y: Number(m.pos?.y) || 1.1,
        z: Number(m.pos?.z) || 0
      }));

      if (u.didIngressThisTurn === true) {
        plans.push({
          squadKey: u.squadKey || u.name,
          unitName: u.name,
          guids: u.guids || originModels.map(m => m.guid),
          status: 'INGRESSED_HOLD',
          originModels
        });
        continue;
      }

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
        originPos,
        originModels
      });
    }

    const reserves = options.hordeReserves || matchState.hordeReserves || [];
    let ingressDrops = [];
    if (reserves.length > 0 && typeof deepStrikeCore.planDeepStrikeIngressDrops === 'function') {
      const ingressRes = deepStrikeCore.planDeepStrikeIngressDrops(reserves, boardTelemetry, options);
      ingressDrops = ingressRes.drops;
      commands.push(...ingressRes.commands);
    }

    return { plans, commands, ingressDrops };
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
   * Detects 11th Edition automatic Benefit of Cover (`-1` to Attacker's ranged Hit roll)
   * when a visible target sits on Light/Dense terrain, has a sightline crossing non-solid cover terrain,
   * or sits partially obscured behind a ruin/barricade edge.
   */
  function detectAutomaticTerrainCover(attacker, target, obstacles = [], boardTelemetry = {}) {
    if (!target || typeof target !== 'object') return false;
    if (target.hasCover || target.inCover || target.inSpawnZone || target.isGoneToGround) return true;

    const obsList = Array.isArray(obstacles) ? obstacles.filter(Boolean) : [];
    const aModels = Array.isArray(attacker?.models) && attacker.models.length > 0
      ? attacker.models
      : [{ guid: attacker?.guid, pos: attacker?.pos || { x: 0, z: 0 }, radiusInches: 0.63 }];
    const tModels = Array.isArray(target.models) && target.models.length > 0
      ? target.models
      : [{ guid: target.guid, pos: target.pos || { x: 0, z: 0 }, radiusInches: target.radiusInches || 0.63 }];

    // Partial 3D TTS raycast obscuration (some model-to-model rays blocked while squad remains visible)
    const blockedGuids = Array.isArray(boardTelemetry?.raycastBlockedGuidPairs)
      ? new Set(boardTelemetry.raycastBlockedGuidPairs.map(String))
      : null;
    if (blockedGuids && blockedGuids.size > 0) {
      for (const am of aModels) {
        for (const tm of tModels) {
          if (am.guid && tm.guid && (blockedGuids.has(`${am.guid}->${tm.guid}`) || blockedGuids.has(`${tm.guid}->${am.guid}`))) {
            return true;
          }
        }
      }
    }

    if (obsList.length === 0) return false;

    for (const obs of obsList) {
      if (obs.grantsCover === false) continue;
      const isAreaCover = obs.solid === false ||
        obs.grantsCover === true ||
        /\b(light|dense|area|woods?|forest|crater|rubble|debris|trench)\b/i.test(`${obs.terrainType || ''} ${obs.name || ''}`);

      // 1. Target model sitting on/within Light/Dense/Area terrain footprint
      if (isAreaCover) {
        const sitsOnArea = tModels.some(tm => {
          const px = Number(tm.pos?.x ?? target.pos?.x) || 0;
          const pz = Number(tm.pos?.z ?? target.pos?.z) || 0;
          const r = Number(tm.radiusInches) || 0.55;
          return px >= obs.minX - r && px <= obs.maxX + r && pz >= obs.minZ - r && pz <= obs.maxZ + r;
        });
        if (sitsOnArea) return true;
      }

      // 2. Partial sightline or base-perimeter edge obscured by a ruin/barricade/cover obstacle
      for (const am of aModels) {
        const pa = am.pos || attacker?.pos || { x: 0, z: 0 };
        for (const tm of tModels) {
          const pt = tm.pos || target.pos || { x: 0, z: 0 };
          const r = Math.max(0.45, Number(tm.radiusInches) || 0.63);
          const samplePts = [
            pt,
            { x: (Number(pt.x) || 0) - r, z: Number(pt.z) || 0 },
            { x: (Number(pt.x) || 0) + r, z: Number(pt.z) || 0 },
            { x: Number(pt.x) || 0, z: (Number(pt.z) || 0) - r },
            { x: Number(pt.x) || 0, z: (Number(pt.z) || 0) + r }
          ];
          if (samplePts.some(sp => segmentIntersectsRect(pa, sp, obs))) {
            return true;
          }
        }
      }
    }
    return false;
  }

  /**
   * Evaluates whether a `HORDE->PLAYER` squad pair is blocked by manual LOS overrides, 3D TTS wall raycasts,
   * 2D solid/obscuring terrain footprints, or 11th Ed Hidden (`15"`) / Gone to Ground (`12"`) caps,
   * and resolves `targetHasCover` for 11th Edition Benefit of Cover (`-1` to Hit).
   */
  function evaluatePairVisibility(attacker, target, dist, boardTelemetry = {}, matchState = {}, options = {}) {
    const pairKey = `${attacker.squadKey || attacker.name}->${target.squadKey || target.name}`;
    const allowedSet = new Set([
      ...(boardTelemetry.losAllowedPairs || []),
      ...(matchState.losAllowedPairs || []),
      ...(options.losAllowedPairs || [])
    ]);
    const manualBlockedSet = new Set([
      ...(matchState.losBlockedPairs || []),
      ...(options.losBlockedPairs || [])
    ]);
    const coverGrantedSet = new Set([
      ...(boardTelemetry.coverGrantedPairs || []),
      ...(matchState.coverGrantedPairs || []),
      ...(options.coverGrantedPairs || [])
    ]);
    const coverStrippedSet = new Set([
      ...(boardTelemetry.coverStrippedPairs || []),
      ...(matchState.coverStrippedPairs || []),
      ...(options.coverStrippedPairs || [])
    ]);
    const autoBlockedSet = new Set(boardTelemetry.autoBlockedLosPairs || []);
    const obstacles = Array.isArray(options.obstacles)
      ? options.obstacles
      : (Array.isArray(boardTelemetry.obstacles) ? boardTelemetry.obstacles : []);
    const miseryIds = Array.isArray(matchState.activeMiseryIds) ? matchState.activeMiseryIds.map(Number) : [];
    const ignoreTerrainVis = miseryIds.includes(28);

    if (manualBlockedSet.has(pairKey)) {
      return { blocked: true, pairKey, reason: 'MANUAL_NO_LOS', targetHasCover: false };
    }
    if (!allowedSet.has(pairKey) && !ignoreTerrainVis) {
      if (autoBlockedSet.has(pairKey)) {
        return { blocked: true, pairKey, reason: 'RAYCAST_WALL', targetHasCover: false };
      }
      if (isSquadBlockedByObstacles(attacker, target, obstacles)) {
        return { blocked: true, pairKey, reason: 'SOLID_OBSTACLE', targetHasCover: false };
      }
      if (target.isGoneToGround && dist > 12.0) {
        return { blocked: true, pairKey, reason: 'GONE_TO_GROUND_12', targetHasCover: false };
      }
      if (target.isHidden && dist > 15.0) {
        return { blocked: true, pairKey, reason: 'HIDDEN_15', targetHasCover: false };
      }
    }

    const autoCover = detectAutomaticTerrainCover(attacker, target, obstacles, boardTelemetry);
    const targetHasCover = coverGrantedSet.has(pairKey)
      ? true
      : (coverStrippedSet.has(pairKey) ? false : autoCover);

    return { blocked: false, pairKey, reason: null, targetHasCover };
  }

  /**
   * 3. Selects legal ranged targets per weapon using Mode 3 Priority (`[ANTI-X]`, `[PRECISION]`, `[MELTA]`),
   * merging 3D TTS raycast blocks, 2D solid obstacle footprints, manual `losBlockedPairs` / `losAllowedPairs`,
   * 11th Edition Cover detection, and Hidden (`15"`) / Gone to Ground (`12"`) visibility caps.
   *
   * @param {object} [boardTelemetry={}] - Normalized LCT tabletop scan (`units`, `objectives`, `obstacles`, `autoBlockedLosPairs`).
   * @param {object} [matchState={}] - Active match state (`factionName`, `activeMiseryIds`, `losBlockedPairs`, `losAllowedPairs`).
   * @param {object} [options={}] - Optional `{ losBlockedPairs, losAllowedPairs, coverGrantedPairs, coverStrippedPairs, obstacles }` overrides.
   * @returns {Array<object>} Prioritized weapon-to-target firing assignments.
   */
  function selectHordeShootingTargets(boardTelemetry = {}, matchState = {}, options = {}) {
    const allUnits = Array.isArray(boardTelemetry.units) ? boardTelemetry.units : [];
    const miseryIds = Array.isArray(matchState.activeMiseryIds) ? matchState.activeMiseryIds.map(Number) : [];

    const hordeUnits = allUnits.filter(u => String(u.side || 'HORDE').toUpperCase() !== 'PLAYER');
    const playerUnits = allUnits.filter(u => String(u.side || '').toUpperCase() === 'PLAYER');
    const assignments = [];

    for (const attacker of hordeUnits) {
      const attackerKws = normalizeKwList(attacker.keywords);
      const isMonsterOrVehicle = attackerKws.includes('MONSTER') || attackerKws.includes('VEHICLE');
      const isAttackerEngaged = playerUnits.some(p => squadEdgeDistance(attacker, p) <= 2.0);

      for (const baseWeapon of (attacker.weapons || [])) {
        if (String(baseWeapon.type || '').toLowerCase() === 'melee') continue;
        const range = Number(baseWeapon.rangeInches) || 0;
        if (range <= 0) continue;

        const baseWepKws = normalizeKwList(baseWeapon.keywords);
        const isCloseQuarters = baseWepKws.includes('PISTOL') || baseWepKws.includes('CLOSE-QUARTERS') || baseWepKws.includes('CLOSE QUARTERS');
        if (isAttackerEngaged && !isMonsterOrVehicle && !isCloseQuarters) continue;
        const engagedMonsterVehiclePenalty = isAttackerEngaged && isMonsterOrVehicle && !isCloseQuarters;

        const candidates = [];
        for (const target of playerUnits) {
          const dist = squadEdgeDistance(attacker, target);
          if (dist > range) continue;

          const vis = evaluatePairVisibility(attacker, target, dist, boardTelemetry, matchState, options);
          if (vis.blocked) continue;

          const mods = combatCore.resolveHordeAttackModifiers(attacker, target, baseWeapon, matchState, {
            targetHasCover: vis.targetHasCover,
            engagedMonsterVehiclePenalty
          });
          if (attacker.advancedThisTurn && !miseryIds.includes(1) && matchState.factionName !== "Emperor's Children") {
            if (!mods.keywords.includes('ASSAULT')) continue;
          }

          candidates.push({
            target,
            dist,
            mods,
            pairKey: vis.pairKey,
            targetHasCover: Boolean(vis.targetHasCover),
            engagedMonsterVehiclePenalty
          });
        }

        if (candidates.length === 0) continue;
        candidates.sort((a, b) => a.dist - b.dist);

        const effectiveKws = candidates[0].mods.keywords || baseWepKws;
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
          pairKey: chosen.pairKey,
          attackerKey: attacker.squadKey || attacker.name,
          attackerName: attacker.name,
          targetKey: chosen.target.squadKey || chosen.target.name,
          targetName: chosen.target.name,
          distanceInches: chosen.dist,
          targetHasCover: Boolean(chosen.targetHasCover),
          engagedMonsterVehiclePenalty: Boolean(chosen.engagedMonsterVehiclePenalty),
          target: chosen.target,
          weapon: baseWeapon
        });
      }
    }

    return assignments;
  }

  /**
   * Projects every moved Horde squad's shooting sightlines (`clearTargets` & `blockedTargets`) during Step 2
   * (Move & Sightlines) so the player can inspect LOS, toggle `🚫 No LOS` / `👁️ Allow LOS`, or `↩️ Undo Move`
   * before locking the Movement Phase.
   *
   * @param {object} [boardTelemetry={}] - Normalized LCT tabletop scan.
   * @param {object} [matchState={}] - Active match state.
   * @param {Array<object>} [plans=[]] - Planned or reverted movement entries from `planHordeMovementPhase`.
   * @param {object} [options={}] - Optional `{ losBlockedPairs, losAllowedPairs, obstacles }` overrides.
   * @returns {{bySquad: Object<string, {squadKey: string, unitName: string, clearTargets: Array<object>, blockedTargets: Array<object>}>, assignments: Array<object>}}
   */
  function previewMovementSightlines(boardTelemetry = {}, matchState = {}, plans = [], options = {}) {
    const rawUnits = Array.isArray(boardTelemetry.units) ? boardTelemetry.units : [];
    const planMap = new Map((Array.isArray(plans) ? plans : []).map(p => [p.squadKey || p.unitName, p]));
    const miseryIds = Array.isArray(matchState.activeMiseryIds) ? matchState.activeMiseryIds.map(Number) : [];

    const projectedUnits = rawUnits.map(u => {
      if (String(u.side || 'HORDE').toUpperCase() === 'PLAYER') return u;
      const key = u.squadKey || u.name;
      const plan = planMap.get(key);
      if (!plan) return u;

      const curX = Number(u.pos?.x) || 0;
      const curZ = Number(u.pos?.z) || 0;
      let nextX = curX;
      let nextZ = curZ;
      if (plan.status === 'REVERTED') {
        if (plan.originPos && Number.isFinite(Number(plan.originPos.x))) {
          nextX = Number(plan.originPos.x);
          nextZ = Number(plan.originPos.z) || 0;
        } else if (Array.isArray(plan.originModels) && plan.originModels.length > 0) {
          nextX = plan.originModels.reduce((s, m) => s + (Number(m.x) || 0), 0) / plan.originModels.length;
          nextZ = plan.originModels.reduce((s, m) => s + (Number(m.z) || 0), 0) / plan.originModels.length;
        }
      } else if (Number.isFinite(Number(plan.targetX)) && Number.isFinite(Number(plan.targetZ))) {
        nextX = Number(plan.targetX);
        nextZ = Number(plan.targetZ);
      }

      const dx = nextX - curX;
      const dz = nextZ - curZ;
      const projectedModels = Array.isArray(u.models)
        ? u.models.map((m, idx) => {
            if (plan.status === 'REVERTED' && Array.isArray(plan.originModels) && plan.originModels[idx]) {
              const om = plan.originModels[idx];
              return { ...m, pos: { x: Number(om.x) || 0, y: Number(om.y) || 1.1, z: Number(om.z) || 0 } };
            }
            return {
              ...m,
              pos: {
                x: Number(((Number(m.pos?.x) || 0) + dx).toFixed(2)),
                y: Number(m.pos?.y) || 1.1,
                z: Number(((Number(m.pos?.z) || 0) + dz).toFixed(2))
              }
            };
          })
        : [];

      return {
        ...u,
        pos: { x: Number(nextX.toFixed(2)), y: Number(u.pos?.y) || 1.1, z: Number(nextZ.toFixed(2)) },
        models: projectedModels,
        advancedThisTurn: plan.status === 'REVERTED' ? false : Boolean(plan.advanced || u.advancedThisTurn)
      };
    });

    const projectedTelemetry = { ...boardTelemetry, units: projectedUnits };
    const hordeUnits = projectedUnits.filter(u => String(u.side || 'HORDE').toUpperCase() !== 'PLAYER');
    const playerUnits = projectedUnits.filter(u => String(u.side || '').toUpperCase() === 'PLAYER');
    const bySquad = {};

    for (const attacker of hordeUnits) {
      const attackerKey = attacker.squadKey || attacker.name;
      const rangedWeapons = (attacker.weapons || []).filter(
        w => String(w.type || '').toLowerCase() !== 'melee' && (Number(w.rangeInches) || 0) > 0
      );
      const maxRange = rangedWeapons.reduce((mx, w) => Math.max(mx, Number(w.rangeInches) || 0), 0);
      const clearTargets = [];
      const blockedTargets = [];

      if (maxRange > 0) {
        for (const target of playerUnits) {
          const dist = squadEdgeDistance(attacker, target);
          if (dist > maxRange) continue;

          const canAnyGunFire = rangedWeapons.some(w => {
            if (dist > (Number(w.rangeInches) || 0)) return false;
            if (attacker.advancedThisTurn && !miseryIds.includes(1) && matchState.factionName !== "Emperor's Children") {
              const mods = combatCore.resolveHordeAttackModifiers(attacker, target, w, matchState);
              return mods.keywords.includes('ASSAULT');
            }
            return true;
          });
          if (!canAnyGunFire) continue;

          const vis = evaluatePairVisibility(attacker, target, dist, projectedTelemetry, matchState, options);
          const entry = {
            pairKey: vis.pairKey,
            targetKey: target.squadKey || target.name,
            targetName: target.name,
            distanceInches: Number(dist.toFixed(1)),
            targetHasCover: Boolean(vis.targetHasCover),
            reason: vis.reason
          };
          if (vis.blocked) {
            blockedTargets.push(entry);
          } else {
            clearTargets.push(entry);
          }
        }
      }

      clearTargets.sort((a, b) => a.distanceInches - b.distanceInches);
      blockedTargets.sort((a, b) => a.distanceInches - b.distanceInches);
      bySquad[attackerKey] = {
        squadKey: attackerKey,
        unitName: attacker.name,
        clearTargets,
        blockedTargets
      };
    }

    const assignments = selectHordeShootingTargets(projectedTelemetry, matchState, options);
    return { bySquad, assignments };
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

  /**
   * Builds a deterministic `DISEMBARK_CARGO` TTS command placing all embarked passenger units
   * (`[10 Kasrkin]` or `[5 Kill Team + 1 Watch Master]`) wholly within `3"` of the Transport hull
   * under a shared `SQUAD:DISEMBARK_<guid>` tag so `Bodyguard + Leader` cargo emerges as 1 Attached Unit.
   *
   * @param {object|null} transportUnit - Scanned tabletop Transport record carrying `embarkedCargo`.
   * @param {object} [options={}] - Optional `{ towardPos, facingY }` overrides.
   * @returns {object|null} Deterministic `DISEMBARK_CARGO` command or `null` when empty.
   */
  function buildDisembarkWaveCommand(transportUnit, options = {}) {
    if (!transportUnit || typeof transportUnit !== 'object') return null;
    const cargo = normalizeCargoList(transportUnit.embarkedCargo || transportUnit.embarkedUnits || transportUnit.embarked);
    if (cargo.length === 0) return null;

    const tx = Number(transportUnit.pos?.x) || 0;
    const tz = Number(transportUnit.pos?.z) || 0;
    const hullRadius = Number(transportUnit.models?.[0]?.radiusInches) || 1.5;
    const isPlayer = String(transportUnit.side || 'HORDE').toUpperCase() === 'PLAYER';
    const goalPos = options.towardPos || { x: 0, z: isPlayer ? 4 : -4 };
    const dropDist = Number((hullRadius + 1.45).toFixed(2));
    const step = stepTowardPoint({ x: tx, z: tz }, goalPos, dropDist, 0);
    const hasMoved = Math.hypot(step.x - tx, step.z - tz) > 0.1;
    const targetX = hasMoved ? step.x : tx;
    const targetZ = hasMoved ? step.z : Number((tz + (isPlayer ? dropDist : -dropDist)).toFixed(2));
    const safeGuid = String(transportUnit.guid || transportUnit.name || 'T1').replace(/\s+/g, '_');
    const cargoSummary = cargo.map(c => `${c.count}x ${c.templateName}`).join(' + ');

    return {
      action: 'DISEMBARK_CARGO',
      transportGuid: transportUnit.guid || null,
      transportSquadKey: transportUnit.squadKey || null,
      transportName: transportUnit.name || 'Transport',
      side: isPlayer ? 'PLAYER' : 'HORDE',
      squadTag: `SQUAD:DISEMBARK_${safeGuid}`,
      targetX,
      targetZ,
      facingY: options.facingY ?? (isPlayer ? 0 : 180),
      units: cargo,
      summary: `Disembarked ${cargoSummary} within 3" of ${transportUnit.name || 'Transport'}.`
    };
  }

  return {
    planWaveSpawnCommands,
    buildDisembarkWaveCommand,
    planHordeMovementPhase,
    buildMoveRevertCommand,
    evaluatePairVisibility,
    selectHordeShootingTargets,
    previewMovementSightlines,
    planHordeCharges,
    resolveHordeChargeRoll,
    planConsolidationMove
  };
});

