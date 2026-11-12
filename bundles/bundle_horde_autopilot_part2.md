# 📦 Fires of Armageddon // Bundle: Deterministic Horde Autopilot Core (Part 2: Sightlines, Shooting, Charges & Consolidation)

Pure Step 2 Projected Sightlines, keyword-driven shooting priority with 3D/2D LOS overrides, LCT 2D6 charges, 11th Ed 3-tier consolidation, and 3" Transport disembarkation (`js/horde-autopilot-core.js` lines 511 to end).

## 📑 Table of Contents
- [js/horde-autopilot-core.js (Part 2: Sightlines, Shooting, Charges & Consolidation, Lines 511-1200)](#file-jshordeautopilotcorejspart2sightlinesshootingchargesconsolidationlines5111200)

---

## File: `js/horde-autopilot-core.js (Part 2: Sightlines, Shooting, Charges & Consolidation, Lines 511-1200)` <a id="file-jshordeautopilotcorejspart2sightlinesshootingchargesconsolidationlines5111200"></a>

````javascript
   * 2D solid/obscuring terrain footprints, or 11th Ed Hidden (`15"`) / Gone to Ground (`12"`) caps.
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
    const autoBlockedSet = new Set(boardTelemetry.autoBlockedLosPairs || []);
    const obstacles = Array.isArray(options.obstacles)
      ? options.obstacles
      : (Array.isArray(boardTelemetry.obstacles) ? boardTelemetry.obstacles : []);
    const miseryIds = Array.isArray(matchState.activeMiseryIds) ? matchState.activeMiseryIds.map(Number) : [];
    const ignoreTerrainVis = miseryIds.includes(28);

    if (manualBlockedSet.has(pairKey)) {
      return { blocked: true, pairKey, reason: 'MANUAL_NO_LOS' };
    }
    if (!allowedSet.has(pairKey) && !ignoreTerrainVis) {
      if (autoBlockedSet.has(pairKey)) {
        return { blocked: true, pairKey, reason: 'RAYCAST_WALL' };
      }
      if (isSquadBlockedByObstacles(attacker, target, obstacles)) {
        return { blocked: true, pairKey, reason: 'SOLID_OBSTACLE' };
      }
      if (target.isGoneToGround && dist > 12.0) {
        return { blocked: true, pairKey, reason: 'GONE_TO_GROUND_12' };
      }
      if (target.isHidden && dist > 15.0) {
        return { blocked: true, pairKey, reason: 'HIDDEN_15' };
      }
    }
    return { blocked: false, pairKey, reason: null };
  }

  /**
   * 3. Selects legal ranged targets per weapon using Mode 3 Priority (`[ANTI-X]`, `[PRECISION]`, `[MELTA]`),
   * merging 3D TTS raycast blocks, 2D solid obstacle footprints, manual `losBlockedPairs` / `losAllowedPairs`,
   * and 11th Edition Hidden (`15"`) / Gone to Ground (`12"`) visibility caps.
   *
   * @param {object} [boardTelemetry={}] - Normalized LCT tabletop scan (`units`, `objectives`, `obstacles`, `autoBlockedLosPairs`).
   * @param {object} [matchState={}] - Active match state (`factionName`, `activeMiseryIds`, `losBlockedPairs`, `losAllowedPairs`).
   * @param {object} [options={}] - Optional `{ losBlockedPairs, losAllowedPairs, obstacles }` overrides.
   * @returns {Array<object>} Prioritized weapon-to-target firing assignments.
   */
  function selectHordeShootingTargets(boardTelemetry = {}, matchState = {}, options = {}) {
    const allUnits = Array.isArray(boardTelemetry.units) ? boardTelemetry.units : [];
    const miseryIds = Array.isArray(matchState.activeMiseryIds) ? matchState.activeMiseryIds.map(Number) : [];

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
          const dist = squadEdgeDistance(attacker, target);
          if (dist > range) continue;

          const vis = evaluatePairVisibility(attacker, target, dist, boardTelemetry, matchState, options);
          if (vis.blocked) continue;

          const mods = combatCore.resolveHordeAttackModifiers(attacker, target, baseWeapon, matchState);
          if (attacker.advancedThisTurn && !miseryIds.includes(1) && matchState.factionName !== "Emperor's Children") {
            if (!mods.keywords.includes('ASSAULT')) continue;
          }

          candidates.push({ target, dist, mods, pairKey: vis.pairKey });
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
          pairKey: chosen.pairKey,
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
    selectHordeShootingTargets,
    previewMovementSightlines,
    planHordeCharges,
    resolveHordeChargeRoll,
    planConsolidationMove
  };
});

````
