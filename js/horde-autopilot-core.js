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

