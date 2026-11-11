/**
 * @fileoverview Fires of Armageddon // Deterministic Horde Deep Strike & Ingress Solver Core
 *
 * Pure Functional Core module (zero DOM, filesystem, network, or local RNG dependencies):
 * - Enforces Horde Mode Round 2–4 Deep Strike reserve gating (R1 & R5 deploy directly to Spawn Zones)
 * - Enforces Misery #13 (`Pincer Maneuver`) >3" Deep Strike reserve priority (Player DZ -> NML -> Horde DZ)
 * - Validates full multi-model 2D base-edge footprints (>8.0" enemy clearance & >3.0" objective exclusion)
 * - Automatically falls back to the unit's rolled Spawn Zone if Player models screen out the board
 */

(function (root, factory) {
  const exports = factory();
  if (typeof root !== 'undefined') Object.assign(root, exports);
  if (typeof module !== 'undefined' && module.exports) module.exports = exports;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {

  const telemetryCore = (typeof measureEdgeToEdgeInches === 'function')
    ? { measureEdgeToEdgeInches }
    : (typeof require === 'function' ? require('./tts-telemetry-core.js') : {});

  const spawnerCore = (typeof parseSpawnWaveSpec === 'function')
    ? { parseSpawnWaveSpec }
    : (typeof require === 'function' ? require('./spawner.js') : {});

  const STANDARD_DEEP_STRIKE_MIN_ENEMY_INCHES = 8.0;
  const PINCER_DEEP_STRIKE_MIN_ENEMY_INCHES = 3.0;
  const OBJECTIVE_EXCLUSION_INCHES = 3.0;
  const SAFETY_EPSILON_INCHES = 0.08;

  /** Canonical fallback name matcher when off-board Staging Shelf descriptions have not been scanned yet. */
  const DEEP_STRIKE_NAME_HEURISTIC = /\b(terminator|inceptor|suppressor|seraphim|zephyrim|allarus|venatari|aquilon|scion|grey\s+knight|interceptor|paladin|strike\s+squad|warp\s+talon|raptor|obliterator|crisis|vespid|deathmark|ophydian|hexmark|flayed\s+one|trygon|mawloc|gargoyle|ravener|swooping\s+hawk|warp\s+spider|scourge|mandrake|pteraxii|bloodletter|daemonette|plaguebearer|pink\s+horror|flamer|screamer|bloodcrusher|flesh\s+hound|nurglings|belakor|be'lakor|bloodthirster|lord\s+of\s+change|keeper\s+of\s+secrets|great\s+unclean\s+one|daemon\s+prince|unbound|drop\s+pod|falcon)\b/i;

  function inferUnitHasDeepStrike(templateName = '', shelfTemplates = []) {
    const clean = String(templateName || '').trim().toLowerCase();
    if (!clean) return false;
    if (Array.isArray(shelfTemplates) && shelfTemplates.length > 0) {
      const matched = shelfTemplates.find(t => {
        const tn = String(t.name || '').trim().toLowerCase();
        return tn && (tn === clean || tn.includes(clean) || clean.includes(tn));
      });
      if (matched && typeof matched.hasDeepStrike === 'boolean') {
        return matched.hasDeepStrike;
      }
    }
    return DEEP_STRIKE_NAME_HEURISTIC.test(clean);
  }

  function inferTemplateRadiusInches(templateName = '', shelfTemplates = []) {
    const clean = String(templateName || '').trim().toLowerCase();
    if (Array.isArray(shelfTemplates)) {
      const matched = shelfTemplates.find(t => {
        const tn = String(t.name || '').trim().toLowerCase();
        return tn && (tn === clean || tn.includes(clean) || clean.includes(tn));
      });
      if (matched && Number(matched.radiusInches) > 0) return Number(matched.radiusInches);
    }
    if (/\b(knight|monolith|stompa|baneblade|gorkanaut|morkanaut|bloodthirster|belakor|trygon)\b/i.test(clean)) return 2.0;
    if (/\b(terminator|allarus|aggressor|crisis|eightbound|hearthguard|paragon|obliterator)\b/i.test(clean)) return 0.79;
    return 0.63;
  }

  /**
   * Computes exact relative `(ox, oz)` model offsets matching `tts/lct_horde_bridge.lua` ring placement.
   *
   * @param {Array<object>} [units=[]] - Reserve unit descriptors (`{ templateName, count, radiusInches }`).
   * @returns {Array<object>} Flattened model footprints with `(ox, oz)` center offsets.
   */
  function buildFormationOffsets(units = []) {
    const flatModels = [];
    for (const u of units) {
      const count = Math.max(1, Number(u.count) || 1);
      const r = Number(u.radiusInches) || 0.63;
      for (let i = 0; i < count; i++) {
        flatModels.push({ templateName: u.templateName || 'Model', radiusInches: r });
      }
    }
    const total = flatModels.length;
    return flatModels.map((m, idx) => {
      if (total <= 1 || idx === 0) {
        return { ...m, ox: 0, oz: 0 };
      }
      const ang = ((idx - 1) / (total - 1)) * (2 * Math.PI);
      const ringRad = idx <= 6 ? 1.35 : 2.6;
      return {
        ...m,
        ox: Number((Math.cos(ang) * ringRad).toFixed(2)),
        oz: Number((Math.sin(ang) * ringRad).toFixed(2))
      };
    });
  }

  /**
   * Splits synced Mode 1 `zoneSpawns` into immediate Spawn Zone waves vs. Horde Strategic Reserves.
   * Standard Deep Strike applies strictly in Battle Rounds 2–4; Misery #13 (`isPincerManeuver`) applies in any round.
   *
   * @param {Array<object>} [zoneSpawns=[]] - Active round zone spawns from Mode 1 Spawner.
   * @param {object} [context={}] - `{ battleRound, shelfTemplates, spawnZoneAnchors }`.
   * @returns {{immediateZoneSpawns: Array<object>, reserveEntries: Array<object>}}
   */
  function partitionWavesByDeepStrikeEligibility(zoneSpawns = [], context = {}) {
    const round = Number(context.battleRound) || 1;
    const shelfTemplates = Array.isArray(context.shelfTemplates) ? context.shelfTemplates : [];
    const spawnZoneAnchors = Array.isArray(context.spawnZoneAnchors) ? context.spawnZoneAnchors : [];
    const standardDsRoundEligible = round >= 2 && round <= 4;

    const immediateZoneSpawns = [];
    const reserveEntries = [];
    const totalRegularZones = (zoneSpawns || []).filter(z => z && !z.isPincerManeuver && z.zone !== 'PINCER').length || 1;
    let regIdx = 0;

    (zoneSpawns || []).forEach((z, idx) => {
      if (!z || z.bracketKey === 'NONE') return;
      const isPincer = Boolean(z.isPincerManeuver || z.zone === 'PINCER');
      const zoneNum = isPincer ? 1 : (Number(z.zone) || (regIdx + 1));
      const anchor = spawnZoneAnchors.find(a => Number(a.zone) === zoneNum) || {
        zone: zoneNum,
        x: totalRegularZones <= 1 ? 0 : Number((-20 + (40 * regIdx) / Math.max(1, totalRegularZones - 1)).toFixed(1)),
        z: 19.5,
        facingY: 180
      };
      if (!isPincer) regIdx += 1;

      let parsed = Array.isArray(z.parsedWave) && z.parsedWave.length > 0 ? z.parsedWave : [];
      if (parsed.length === 0 && Array.isArray(z.units) && typeof spawnerCore.parseSpawnWaveSpec === 'function') {
        parsed = z.units.flatMap(u => spawnerCore.parseSpawnWaveSpec(u, () => 0));
      }
      if (parsed.length === 0) return;

      const hasEmbarkedCargo = parsed.some(u => u.embarked || (Array.isArray(u.embarkedUnits) && u.embarkedUnits.length > 0));
      const everyUnitHasDeepStrike = !hasEmbarkedCargo && parsed.every(u =>
        Boolean(u.hasDeepStrike) || inferUnitHasDeepStrike(u.templateName, shelfTemplates)
      );

      if (isPincer || (standardDsRoundEligible && everyUnitHasDeepStrike)) {
        const mode = isPincer ? 'PINCER_MANEUVER' : 'STANDARD_DEEP_STRIKE';
        const unitLabel = parsed.map(u => `${u.count || 1}x ${u.templateName}`).join(' + ');
        reserveEntries.push({
          reserveId: `ds_r${round}_${idx + 1}_${String(parsed[0].templateName || 'unit').replace(/\W+/g, '_')}`,
          battleRoundQueued: round,
          mode,
          unitLabel,
          fallbackZone: zoneNum,
          fallbackAnchor: anchor,
          units: parsed.map(u => ({
            templateName: u.templateName,
            count: Math.max(1, Number(u.count) || 1),
            radiusInches: inferTemplateRadiusInches(u.templateName, shelfTemplates)
          }))
        });
      } else {
        immediateZoneSpawns.push(z);
      }
    });

    return { immediateZoneSpawns, reserveEntries };
  }

  function classifyZZone(z, bounds, playerOnSouthNegativeZ) {
    const dzDepth = Math.min(12.0, (bounds.maxZ - bounds.minZ) * 0.22);
    if (playerOnSouthNegativeZ) {
      if (z <= bounds.minZ + dzDepth) return 'PLAYER_DZ';
      if (z >= bounds.maxZ - dzDepth) return 'HORDE_DZ';
      return 'NML';
    }
    if (z >= bounds.maxZ - dzDepth) return 'PLAYER_DZ';
    if (z <= bounds.minZ + dzDepth) return 'HORDE_DZ';
    return 'NML';
  }

  /**
   * Solves the optimal legal 2D tabletop drop coordinate `(targetX, targetZ)` for a single Deep Strike unit.
   *
   * @param {object} [reserveEntry={}] - Queued reserve descriptor.
   * @param {object} [boardTelemetry={}] - Normalized LCT board telemetry.
   * @param {object} [options={}] - Optional `{ obstacles, occupiedHordeModels, scatteredCoordinates }`.
   * @returns {object} Solved drop descriptor (`DROPPED_ON_BOARD` or `SCREENED_FALLBACK_SPAWN_ZONE`).
   */
  function solveDeepStrikeDrop(reserveEntry = {}, boardTelemetry = {}, options = {}) {
    const bounds = boardTelemetry.playmatBounds || { minX: -22, maxX: 22, minZ: -30, maxZ: 30 };
    const allUnits = Array.isArray(boardTelemetry.units) ? boardTelemetry.units : [];
    const objectives = Array.isArray(boardTelemetry.objectives) ? boardTelemetry.objectives : [];
    const obstacles = Array.isArray(options.obstacles) ? options.obstacles : [];
    const extraFriendlyModels = Array.isArray(options.occupiedHordeModels) ? options.occupiedHordeModels : [];

    const playerUnits = allUnits.filter(u => String(u.side || '').toUpperCase() === 'PLAYER');
    const hordeUnits = allUnits.filter(u => String(u.side || 'HORDE').toUpperCase() !== 'PLAYER');
    const playerModels = playerUnits.flatMap(u =>
      Array.isArray(u.models) && u.models.length > 0
        ? u.models
        : [{ pos: u.pos || { x: 0, z: -18 }, radiusInches: 0.63 }]
    );
    const friendlyModels = [
      ...hordeUnits.flatMap(u => Array.isArray(u.models) && u.models.length > 0 ? u.models : []),
      ...extraFriendlyModels
    ];

    const isPincer = reserveEntry.mode === 'PINCER_MANEUVER';
    const minEnemyReq = isPincer ? PINCER_DEEP_STRIKE_MIN_ENEMY_INCHES : STANDARD_DEEP_STRIKE_MIN_ENEMY_INCHES;
    const minObjReq = isPincer ? 0 : OBJECTIVE_EXCLUSION_INCHES;
    const formation = buildFormationOffsets(reserveEntry.units || []);
    const maxOffsetSpan = formation.reduce((mx, m) => Math.max(mx, Math.hypot(m.ox, m.oz) + m.radiusInches), 0.63);

    const avgPlayerZ = playerModels.length > 0
      ? playerModels.reduce((acc, m) => acc + (Number(m.pos?.z) || 0), 0) / playerModels.length
      : -18;
    const playerOnSouthNegativeZ = avgPlayerZ <= 0;

    function evaluateCandidateCenter(cx, cz) {
      const rx = Number(cx.toFixed(2));
      const rz = Number(cz.toFixed(2));
      let minEnemyDist = Infinity;
      const preview = [];

      if (options.scatteredCoordinates) {
        const distToEdge = Math.min(
          rx - bounds.minX,
          bounds.maxX - rx,
          rz - bounds.minZ,
          bounds.maxZ - rz
        );
        if (distToEdge + maxOffsetSpan > 6.0) return null;
      }

      for (const fm of formation) {
        const mx = Number((rx + fm.ox).toFixed(2));
        const mz = Number((rz + fm.oz).toFixed(2));
        const r = fm.radiusInches;

        if (mx - r < bounds.minX || mx + r > bounds.maxX || mz - r < bounds.minZ || mz + r > bounds.maxZ) {
          return null;
        }
        for (const obs of obstacles) {
          if (obs.solid && mx + r >= obs.minX && mx - r <= obs.maxX && mz + r >= obs.minZ && mz - r <= obs.maxZ) {
            return null;
          }
        }
        for (const pm of playerModels) {
          const d = telemetryCore.measureEdgeToEdgeInches({ x: mx, z: mz }, r, pm.pos, pm.radiusInches || 0.63);
          if (d <= minEnemyReq + 0.02) return null;
          if (d < minEnemyDist) minEnemyDist = d;
        }
        if (minObjReq > 0) {
          for (const obj of objectives) {
            const dObj = telemetryCore.measureEdgeToEdgeInches({ x: mx, z: mz }, r, obj.pos, obj.radiusInches || 0.79);
            if (dObj <= minObjReq + 0.02) return null;
          }
        }
        for (const hm of friendlyModels) {
          const dFr = telemetryCore.measureEdgeToEdgeInches({ x: mx, z: mz }, r, hm.pos, hm.radiusInches || 0.63);
          if (dFr < 1.05) return null;
        }
        preview.push({ templateName: fm.templateName, pos: { x: mx, z: mz }, radiusInches: r });
      }

      if (playerModels.length === 0) minEnemyDist = 99;
      return {
        targetX: rx,
        targetZ: rz,
        minEnemyDist: Number(minEnemyDist.toFixed(2)),
        zoneTier: classifyZZone(rz, bounds, playerOnSouthNegativeZ),
        spawnedModelsPreview: preview
      };
    }

    const candidates = [];
    // 1. High-precision radial rings around every Player model so drops hug 8.08" (or 3.08") for shortest legal Charge
    const clearanceRings = [minEnemyReq + SAFETY_EPSILON_INCHES, minEnemyReq + 0.45, minEnemyReq + 1.2, minEnemyReq + 2.5];
    for (const pm of playerModels) {
      const px = Number(pm.pos?.x) || 0;
      const pz = Number(pm.pos?.z) || 0;
      const pr = pm.radiusInches || 0.63;
      for (const edgeClear of clearanceRings) {
        const centerDist = pr + maxOffsetSpan + edgeClear;
        for (let deg = 0; deg < 360; deg += 10) {
          const rad = (deg * Math.PI) / 180;
          const ev = evaluateCandidateCenter(px + Math.cos(rad) * centerDist, pz + Math.sin(rad) * centerDist);
          if (ev) candidates.push(ev);
        }
      }
    }

    // 2. Deterministic 2" playmat lattice scan (catches open backfield pockets for Pincer Maneuver or empty-enemy boards)
    for (let z = bounds.minZ + 2; z <= bounds.maxZ - 2; z += 2.0) {
      for (let x = bounds.minX + 2; x <= bounds.maxX - 2; x += 2.0) {
        const ev = evaluateCandidateCenter(x, z);
        if (ev) candidates.push(ev);
      }
    }

    let chosen = null;
    if (isPincer && candidates.length > 0) {
      const tierOrder = ['PLAYER_DZ', 'NML', 'HORDE_DZ'];
      for (const tier of tierOrder) {
        const inTier = candidates.filter(c => c.zoneTier === tier);
        if (inTier.length > 0) {
          inTier.sort((a, b) => a.minEnemyDist - b.minEnemyDist || Math.abs(a.targetX) - Math.abs(b.targetX));
          chosen = inTier[0];
          break;
        }
      }
    } else if (candidates.length > 0) {
      candidates.sort((a, b) => a.minEnemyDist - b.minEnemyDist || Math.abs(a.targetX) - Math.abs(b.targetX));
      chosen = candidates[0];
    }

    if (!chosen) {
      const fb = reserveEntry.fallbackAnchor || { x: 0, z: 19.5, facingY: 180 };
      return {
        reserveId: reserveEntry.reserveId,
        mode: reserveEntry.mode,
        unitLabel: reserveEntry.unitLabel,
        squadTag: `SQUAD:DS_${reserveEntry.reserveId}`,
        status: 'SCREENED_FALLBACK_SPAWN_ZONE',
        fallbackZone: reserveEntry.fallbackZone || 1,
        fallbackAnchor: fb,
        targetX: fb.x,
        targetZ: fb.z,
        facingY: fb.facingY ?? 180,
        closestEnemyDistanceInches: null,
        deployedZoneTier: 'SPAWN_ZONE_FALLBACK',
        spawnedModelsPreview: [],
        units: reserveEntry.units
      };
    }

    // Face toward the closest Player model
    let closestPm = playerModels[0] || { pos: { x: chosen.targetX, z: 0 } };
    let bestD = Infinity;
    for (const pm of playerModels) {
      const d = Math.hypot((pm.pos?.x || 0) - chosen.targetX, (pm.pos?.z || 0) - chosen.targetZ);
      if (d < bestD) {
        bestD = d;
        closestPm = pm;
      }
    }
    const facingY = Number(((Math.atan2((closestPm.pos?.x || 0) - chosen.targetX, (closestPm.pos?.z || 0) - chosen.targetZ) * 180) / Math.PI).toFixed(1));
    const fb = reserveEntry.fallbackAnchor || { x: 0, z: 19.5, facingY: 180 };

    return {
      reserveId: reserveEntry.reserveId,
      mode: reserveEntry.mode,
      unitLabel: reserveEntry.unitLabel,
      squadTag: `SQUAD:DS_${reserveEntry.reserveId}`,
      status: 'DROPPED_ON_BOARD',
      fallbackZone: reserveEntry.fallbackZone || 1,
      fallbackAnchor: fb,
      targetX: chosen.targetX,
      targetZ: chosen.targetZ,
      facingY,
      closestEnemyDistanceInches: chosen.minEnemyDist,
      deployedZoneTier: chosen.zoneTier,
      spawnedModelsPreview: chosen.spawnedModelsPreview,
      units: reserveEntry.units
    };
  }

  /**
   * Solves sequential Deep Strike drops for all queued `hordeReserves` so multiple arriving squads never overlap.
   *
   * @param {Array<object>} [hordeReserves=[]] - Queued Deep Strike / Pincer reserve descriptors.
   * @param {object} [boardTelemetry={}] - Normalized LCT board telemetry.
   * @param {object} [options={}] - Optional `{ obstacles, scatteredCoordinates }`.
   * @returns {{drops: Array<object>, commands: Array<object>, summary: string}}
   */
  function planDeepStrikeIngressDrops(hordeReserves = [], boardTelemetry = {}, options = {}) {
    if (!Array.isArray(hordeReserves) || hordeReserves.length === 0) {
      return { drops: [], commands: [], summary: 'No Horde Deep Strike reserves queued.' };
    }

    const occupiedHordeModels = [];
    const drops = [];
    const commands = [];

    for (const entry of hordeReserves) {
      const solved = solveDeepStrikeDrop(entry, boardTelemetry, { ...options, occupiedHordeModels });
      drops.push(solved);

      if (solved.status === 'SCREENED_FALLBACK_SPAWN_ZONE') {
        commands.push({
          action: 'SPAWN_WAVE',
          zone: solved.fallbackZone || 1,
          targetX: solved.targetX,
          targetZ: solved.targetZ,
          facingY: solved.facingY,
          units: entry.units.map(u => ({
            templateName: u.templateName,
            count: u.count,
            attachedGroup: `DS_FB_${entry.reserveId}`
          }))
        });
      } else {
        occupiedHordeModels.push(...solved.spawnedModelsPreview);
        commands.push({
          action: 'DEEP_STRIKE_DROP',
          reserveId: entry.reserveId,
          mode: entry.mode,
          unitLabel: entry.unitLabel,
          squadTag: `SQUAD:DS_${entry.reserveId}`,
          targetX: solved.targetX,
          targetZ: solved.targetZ,
          facingY: solved.facingY,
          closestEnemyDistanceInches: solved.closestEnemyDistanceInches,
          units: entry.units
        });
      }
    }

    return {
      drops,
      commands,
      summary: `Resolved ${drops.length} Horde Deep Strike ingress drop(s).`
    };
  }

  /**
   * Builds a deterministic fallback command relocating an active Deep Strike ingress drop
   * to its rolled Spawn Zone when an unscanned 3D ruin mesh physically blocks `(X, Z)` on TTS.
   *
   * @param {object} dropEntry - Solved ingress drop record from `solveDeepStrikeDrop`.
   * @returns {object|null} `FALLBACK_INGRESS_TO_SPAWN` TTS command or `null`.
   */
  function buildIngressFallbackCommand(dropEntry) {
    if (!dropEntry || !Array.isArray(dropEntry.units) || dropEntry.units.length === 0) return null;
    const fb = dropEntry.fallbackAnchor || { x: 0, z: 19.5, facingY: 180 };
    const zone = Number(dropEntry.fallbackZone) || 1;
    const reserveId = dropEntry.reserveId || 'res_1';
    return {
      action: 'FALLBACK_INGRESS_TO_SPAWN',
      reserveId,
      unitLabel: dropEntry.unitLabel || 'Horde Reserve',
      squadTag: dropEntry.squadTag || `SQUAD:DS_${reserveId}`,
      zone,
      targetX: Number(fb.x) || 0,
      targetZ: Number(fb.z ?? 19.5),
      facingY: Number(fb.facingY ?? 180),
      units: dropEntry.units.map(u => ({
        templateName: u.templateName,
        count: Math.max(1, Number(u.count) || 1),
        attachedGroup: `DS_FB_${reserveId}`
      }))
    };
  }

  return {
    STANDARD_DEEP_STRIKE_MIN_ENEMY_INCHES,
    PINCER_DEEP_STRIKE_MIN_ENEMY_INCHES,
    OBJECTIVE_EXCLUSION_INCHES,
    inferUnitHasDeepStrike,
    buildFormationOffsets,
    partitionWavesByDeepStrikeEligibility,
    solveDeepStrikeDrop,
    planDeepStrikeIngressDrops,
    buildIngressFallbackCommand
  };
});
