# 📦 Fires of Armageddon // Bundle: LCT TTS Telemetry & Spatial Squad Core (Part 2: Squad Normalization & 3D LOS)

Persistent squad identity, Attached Units, Embarked cargo, solid obstacles, and squad-level 3D raycast LOS (`js/tts-telemetry-core.js` lines 521 to end).

## 📑 Table of Contents
- [js/tts-telemetry-core.js (Part 2: Squad Normalization, Obstacles & 3D LOS, Lines 521-1200)](#file-jsttstelemetrycorejspart2squadnormalizationobstacles3dloslines5211200)

---

## File: `js/tts-telemetry-core.js (Part 2: Squad Normalization, Obstacles & 3D LOS, Lines 521-1200)` <a id="file-jsttstelemetrycorejspart2squadnormalizationobstacles3dloslines5211200"></a>

````javascript
      guids: entries.map(e => e.guid),
      name: unitName,
      side,
      modelCount: models.length,
      peakModelCount,
      totalRemainingWounds,
      woundsPerModel,
      move: coherentMove,
      toughness: primaryDs.toughness,
      save: primaryDs.save,
      invuln: primaryDs.invuln,
      fnp: primaryDs.fnp,
      leadership: primaryDs.leadership,
      oc: primaryDs.oc,
      scoutsInches: primaryDs.scoutsInches,
      hasDeepStrike: entries.every(e => Boolean(e.ds.hasDeepStrike)),
      didIngressThisTurn: entries.some(e => Boolean(e.didIngressThisTurn)),
      keywords: unionKeywords,
      weapons: Array.from(weaponMap.values()),
      embarkedCargo,
      embarkedSummary,
      models
    };
  }

  function stripSquadNumberSuffix(name = '') {
    return String(name || '').replace(/\s+#\d+$/, '').trim();
  }

  /**
   * Evaluates whether an unseen-GUID cluster (`Ctrl+C`/`Ctrl+V` Medipack / Reanimation revival)
   * can legally rejoin an injured locked squad under 11th Ed Dual Coherency (`<= 2"` link and
   * `<= 9"` max unit span) without exceeding `locked.peakModelCount`.
   *
   * @param {object} locked - Locked squad bucket (`{ entries, peakModelCount, colorTintKey }`).
   * @param {Array<object>} candidateCluster - Unseen model entries.
   * @returns {number|null} Closest edge-to-edge link distance in inches if eligible, else `null`.
   */
  function evaluateCoherentRevivalDistance(locked, candidateCluster) {
    if (!locked || !Array.isArray(locked.entries) || locked.entries.length === 0) return null;
    if (!Array.isArray(candidateCluster) || candidateCluster.length === 0) return null;

    const currentCount = locked.entries.length;
    const peak = Math.max(Number(locked.peakModelCount) || currentCount, currentCount);
    if (currentCount + candidateCluster.length > peak) return null;

    const candTint = candidateCluster[0].colorTintKey || 'DEFAULT';
    if (
      locked.colorTintKey &&
      locked.colorTintKey !== 'DEFAULT' &&
      candTint !== 'DEFAULT' &&
      locked.colorTintKey !== candTint
    ) {
      return null;
    }

    const combined = [...locked.entries, ...candidateCluster];
    for (let i = 0; i < combined.length; i++) {
      for (let j = i + 1; j < combined.length; j++) {
        const spanDist = measureEdgeToEdgeInches(
          combined[i].pos,
          combined[i].radiusInches,
          combined[j].pos,
          combined[j].radiusInches
        );
        if (spanDist > MAX_UNIT_SPAN_INCHES) return null;
      }
    }

    let closestLink = Infinity;
    for (const cand of candidateCluster) {
      for (const existing of locked.entries) {
        const d = measureEdgeToEdgeInches(existing.pos, existing.radiusInches, cand.pos, cand.radiusInches);
        if (d < closestLink) closestLink = d;
      }
    }
    return closestLink <= MAX_COHERENCY_LINK_INCHES ? closestLink : null;
  }

  /**
   * Converts a raw TTS `getAllObjects()` snapshot into grouped squads, parsed datasheets & exact distances,
   * filtering out off-mat reserves, `HORDE_TEMPLATE` shelf clones, and non-datasheet LCT props/terrain,
   * while supporting both `PLAYER` and `HORDE` persistent squad identity, multi-wound healing, and model
   * resurrection (dragging slain models back from off-mat via `guidRegistry`, or `Ctrl+C`/`Ctrl+V` cloning
   * up to `peakModelCount` within `<= 2"` / `<= 9"` coherency).
   *
   * @param {object} [rawScan={}] - Raw telemetry payload (`objects`, `playmatBounds`, `spawnZones`).
   * @param {object} [options={}] - Optional `{ hordeFactionName, playmatBounds, previousUnits, guidRegistry }` context.
   * @returns {{units: object[], objectives: object[], guidRegistry: object}} Normalized tabletop telemetry.
   */
  function normalizeTtsBoardScan(rawScan = {}, options = {}) {
    const rawObjects = Array.isArray(rawScan.objects) ? rawScan.objects : [];
    const spawnZones = Array.isArray(rawScan.spawnZones) ? rawScan.spawnZones : [];
    const playmatBounds = rawScan.playmatBounds || options.playmatBounds || null;
    const objectives = [];
    const scannedEntries = [];
    const nameGroups = new Map();

    const prevGuidMap = new Map();
    const incomingRegistry = (options.guidRegistry && typeof options.guidRegistry === 'object')
      ? options.guidRegistry
      : {};
    for (const [g, info] of Object.entries(incomingRegistry)) {
      if (g && info && info.squadKey) {
        prevGuidMap.set(g, { ...info });
      }
    }

    const previousUnits = Array.isArray(options.previousUnits) ? options.previousUnits : [];
    for (const pu of previousUnits) {
      if (!pu || !pu.squadKey) continue;
      const puBaseName = stripSquadNumberSuffix(pu.name);
      const numMatch = String(pu.name || '').match(/#(\d+)$/);
      const squadNum = numMatch ? parseInt(numMatch[1], 10) : null;
      const guids = Array.isArray(pu.guids)
        ? pu.guids
        : (Array.isArray(pu.models) ? pu.models.map(m => m.guid) : []);
      const peakModelCount = Math.max(Number(pu.peakModelCount) || 0, guids.length);
      for (const g of guids) {
        if (g) {
          const existing = prevGuidMap.get(g);
          prevGuidMap.set(g, {
            squadKey: pu.squadKey,
            name: pu.name || puBaseName,
            baseName: puBaseName,
            side: pu.side,
            squadNum: squadNum ?? existing?.squadNum ?? null,
            peakModelCount: Math.max(existing?.peakModelCount || 0, peakModelCount),
            explicitSquadToken: existing?.explicitSquadToken || null,
            colorTintKey: existing?.colorTintKey || 'DEFAULT'
          });
        }
      }
    }

    for (const obj of rawObjects) {
      if (!obj || !obj.name) continue;
      const cleanName = stripTtsMarkup(obj.name);
      if (!cleanName) continue;
      const tags = Array.isArray(obj.tags) ? obj.tags.map(t => String(t).toUpperCase()) : [];

      if (tags.includes('HORDE_TEMPLATE')) continue;

      const pos = obj.pos || { x: 0, y: 0, z: 0 };
      if (playmatBounds) {
        const px = Number(pos.x) || 0;
        const pz = Number(pos.z) || 0;
        if (
          px < playmatBounds.minX ||
          px > playmatBounds.maxX ||
          pz < playmatBounds.minZ ||
          pz > playmatBounds.maxZ
        ) {
          continue;
        }
      }

      const explicitSide = String(obj.side || '').toUpperCase();
      const hasExplicitSide =
        tags.includes('PLAYER') ||
        tags.includes('HORDE') ||
        explicitSide === 'PLAYER' ||
        explicitSide === 'HORDE';

      if (!hasExplicitSide && PROP_NAME_BLACKLIST.test(cleanName)) continue;

      if (tags.includes('OBJECTIVE') || /^(?:objective(?:\s+marker)?|obj)(?:\s*#?\d+)?$/i.test(cleanName)) {
        objectives.push({
          guid: obj.guid || null,
          name: cleanName,
          pos,
          radiusInches: inferBaseRadiusInches({ baseDiameterMm: 40, bounds: obj.bounds })
        });
        continue;
      }

      if (!hasExplicitSide) {
        if (obj.locked === true) continue;
        if (!hasDatasheetSignature(obj.description, obj.gmNotes, cleanName)) continue;
      }

      const ds = parseDatasheetFromTts(obj.description, obj.gmNotes);
      const side = inferSide(obj, ds.keywords, options);
      const parsedName = parseModelNameAndWounds(cleanName);
      const radiusInches = inferBaseRadiusInches(obj);
      scannedEntries.push({
        guid: obj.guid,
        pos,
        radiusInches,
        currentWounds: parsedName.currentWounds,
        maxWounds: parsedName.maxWounds,
        baseName: parsedName.baseName,
        groupBaseName: parsedName.baseName,
        side,
        ds,
        explicitSquadToken: extractExplicitSquadToken(obj),
        embarkedCargo: extractEmbarkedCargo(obj),
        didIngressThisTurn: Boolean(obj.didIngressThisTurn || tags.includes('DEEP_STRUCK')),
        rawSquadId: obj.squadId ? String(obj.squadId).trim() : null,
        colorTintKey: normalizeColorTintKey(obj.colorTint)
      });
    }

    // Resolve cross-datasheet Attached Units (`5 Kill Team + 1 Watch Master`) sharing a SQUAD token or locked GUID
    const tokenBuckets = new Map();
    for (const e of scannedEntries) {
      if (!e.explicitSquadToken) continue;
      const tKey = `${e.side}::${e.explicitSquadToken}`;
      if (!tokenBuckets.has(tKey)) tokenBuckets.set(tKey, []);
      tokenBuckets.get(tKey).push(e);
    }
    for (const bucket of tokenBuckets.values()) {
      const counts = new Map();
      for (const e of bucket) counts.set(e.baseName, (counts.get(e.baseName) || 0) + 1);
      if (counts.size > 1) {
        const compositeName = Array.from(counts.entries())
          .sort((a, b) => b[1] - a[1])
          .map(([bName]) => bName)
          .join(' + ');
        for (const e of bucket) e.groupBaseName = compositeName;
      }
    }
    const prevAttachedBuckets = new Map();
    for (const e of scannedEntries) {
      if (e.groupBaseName !== e.baseName) continue;
      const prev = e.guid ? prevGuidMap.get(e.guid) : null;
      if (prev && prev.side === e.side && String(prev.baseName || '').includes(' + ')) {
        if (!prevAttachedBuckets.has(prev.squadKey)) prevAttachedBuckets.set(prev.squadKey, []);
        prevAttachedBuckets.get(prev.squadKey).push({ entry: e, prevBaseName: prev.baseName });
      }
    }
    for (const list of prevAttachedBuckets.values()) {
      const survivingBases = new Set(list.map(x => x.entry.baseName));
      if (survivingBases.size > 1) {
        for (const item of list) item.entry.groupBaseName = item.prevBaseName;
      }
    }
    for (const e of scannedEntries) {
      const groupKey = `${e.side}::${e.groupBaseName}`;
      if (!nameGroups.has(groupKey)) nameGroups.set(groupKey, []);
      nameGroups.get(groupKey).push(e);
    }

    const rawSquads = [];
    for (const [, entries] of nameGroups.entries()) {
      const baseName = entries[0].groupBaseName;
      const side = entries[0].side;
      const manualOverrideMap = new Map();
      const lockedMap = new Map();
      const unseenBuckets = new Map();

      for (const e of entries) {
        const prev = e.guid ? prevGuidMap.get(e.guid) : null;
        const isManualReLink =
          prev &&
          e.explicitSquadToken &&
          !e.explicitSquadToken.startsWith('TAG:WAVE_') &&
          e.explicitSquadToken !== prev.explicitSquadToken;

        if (isManualReLink) {
          if (!manualOverrideMap.has(e.explicitSquadToken)) manualOverrideMap.set(e.explicitSquadToken, []);
          manualOverrideMap.get(e.explicitSquadToken).push(e);
          continue;
        }

        if (prev && prev.side === side && prev.baseName === baseName) {
          if (!lockedMap.has(prev.squadKey)) {
            lockedMap.set(prev.squadKey, {
              entries: [],
              squadNum: prev.squadNum,
              peakModelCount: prev.peakModelCount || 1,
              colorTintKey: e.colorTintKey || prev.colorTintKey || 'DEFAULT',
              rawSquadId: e.rawSquadId || null
            });
          }
          lockedMap.get(prev.squadKey).entries.push(e);
          continue;
        }

        const unseenKey = e.explicitSquadToken || e.colorTintKey || 'DEFAULT';
        if (!unseenBuckets.has(unseenKey)) unseenBuckets.set(unseenKey, []);
        unseenBuckets.get(unseenKey).push(e);
      }

      const freshClusters = [];
      for (const [bucketKey, bucketEntries] of unseenBuckets.entries()) {
        const isManualOrYsId = bucketKey.startsWith('ID:') || (bucketKey.startsWith('TAG:') && !bucketKey.startsWith('TAG:WAVE_'));
        const subClusters = isManualOrYsId ? [bucketEntries] : clusterModelsByCoherency(bucketEntries);

        for (const sc of subClusters) {
          // Check if this unseen cluster is a Ctrl+C/Ctrl+V Medipack / Reanimation revival for an injured locked squad
          let bestLocked = null;
          let bestDist = Infinity;
          for (const locked of lockedMap.values()) {
            const reviveDist = evaluateCoherentRevivalDistance(locked, sc);
            if (reviveDist !== null && reviveDist < bestDist) {
              bestDist = reviveDist;
              bestLocked = locked;
            }
          }
          if (bestLocked) {
            bestLocked.entries.push(...sc);
          } else {
            freshClusters.push({ entries: sc, squadNum: null, peakModelCount: sc.length, rawSquadId: sc[0].rawSquadId });
          }
        }
      }

      const clusterDescriptors = [];
      for (const [, bucket] of manualOverrideMap.entries()) {
        clusterDescriptors.push({ entries: bucket, squadNum: null, peakModelCount: bucket.length, rawSquadId: bucket[0].rawSquadId });
      }
      for (const [, locked] of lockedMap.entries()) {
        clusterDescriptors.push({
          entries: locked.entries,
          squadNum: locked.squadNum,
          peakModelCount: locked.peakModelCount,
          rawSquadId: locked.rawSquadId
        });
      }
      clusterDescriptors.push(...freshClusters);

      if (clusterDescriptors.length === 1 && clusterDescriptors[0].squadNum === null) {
        const desc = clusterDescriptors[0];
        const sqKey = desc.rawSquadId || `${side}::${baseName}`;
        rawSquads.push(buildSquadRecord(sqKey, baseName, side, desc.entries, desc.peakModelCount));
      } else {
        const usedNums = new Set(
          clusterDescriptors.map(c => c.squadNum).filter(n => Number.isInteger(n) && n >= 1)
        );
        let nextNum = 1;
        for (const desc of clusterDescriptors) {
          let num = desc.squadNum;
          if (!num) {
            while (usedNums.has(nextNum)) nextNum += 1;
            num = nextNum;
            usedNums.add(num);
          }
          const numberedName = `${baseName} #${num}`;
          const sqKey = desc.rawSquadId || `${side}::${numberedName}`;
          rawSquads.push(buildSquadRecord(sqKey, numberedName, side, desc.entries, desc.peakModelCount));
        }
      }
    }

    const units = rawSquads.map(u => {
      const sumX = u.models.reduce((acc, m) => acc + (Number(m.pos.x) || 0), 0);
      const sumZ = u.models.reduce((acc, m) => acc + (Number(m.pos.z) || 0), 0);
      const center = {
        x: Number((sumX / u.modelCount).toFixed(2)),
        z: Number((sumZ / u.modelCount).toFixed(2))
      };
      const inSpawnZone = u.models.every(m => isPointInZones(m.pos, spawnZones)) && spawnZones.length > 0;
      return { ...u, pos: center, inSpawnZone };
    });

    const updatedGuidRegistry = {};
    for (const [g, info] of prevGuidMap.entries()) {
      updatedGuidRegistry[g] = { ...info };
    }
    for (const u of units) {
      const uBaseName = stripSquadNumberSuffix(u.name);
      const uNumMatch = String(u.name || '').match(/#(\d+)$/);
      const uSquadNum = uNumMatch ? parseInt(uNumMatch[1], 10) : null;
      for (const m of u.models) {
        if (!m.guid) continue;
        updatedGuidRegistry[m.guid] = {
          squadKey: u.squadKey,
          name: u.name,
          baseName: uBaseName,
          side: u.side,
          squadNum: uSquadNum,
          peakModelCount: u.peakModelCount,
          explicitSquadToken: m.explicitSquadToken || null,
          colorTintKey: m.colorTintKey || 'DEFAULT'
        };
      }
      for (const info of Object.values(updatedGuidRegistry)) {
        if (info && info.squadKey === u.squadKey) {
          info.name = u.name;
          info.squadNum = uSquadNum;
          info.peakModelCount = Math.max(Number(info.peakModelCount) || 0, u.peakModelCount);
        }
      }
    }

    // Compute exact squad-to-objective & squad-to-enemy minimum edge-to-edge distances
    for (const u of units) {
      let closestObj = null;
      for (const o of objectives) {
        let minD = Infinity;
        for (const m of u.models) {
          const d = measureEdgeToEdgeInches(m.pos, m.radiusInches, o.pos, o.radiusInches);
          if (d < minD) minD = d;
        }
        if (!closestObj || minD < closestObj.distanceInches) {
          closestObj = { name: o.name, distanceInches: minD, withinControlRange: minD <= 3.0 };
        }
      }
      u.closestObjective = closestObj;

      let closestEnemy = null;
      for (const other of units) {
        if (other.side === u.side) continue;
        let minEnemyD = Infinity;
        for (const m1 of u.models) {
          for (const m2 of other.models) {
            const d = measureEdgeToEdgeInches(m1.pos, m1.radiusInches, m2.pos, m2.radiusInches);
            if (d < minEnemyD) minEnemyD = d;
          }
        }
        if (!closestEnemy || minEnemyD < closestEnemy.distanceInches) {
          closestEnemy = {
            name: other.name,
            guid: other.guid,
            distanceInches: minEnemyD,
            withinEngagementRange: minEnemyD <= 2.0
          };
        }
      }
      u.closestEnemy = closestEnemy;
    }

    const shelfTemplates = (Array.isArray(rawScan.shelfTemplates) ? rawScan.shelfTemplates : []).map(t => {
      const ds = parseDatasheetFromTts(t.description, t.gmNotes);
      return {
        name: parseModelNameAndWounds(stripTtsMarkup(t.name || '')).baseName,
        hasDeepStrike: Boolean(t.hasDeepStrike || ds.hasDeepStrike),
        radiusInches: inferBaseRadiusInches(t)
      };
    });

    const obstacles = (Array.isArray(rawScan.obstacles) ? rawScan.obstacles : [])
      .filter(o => o && Number.isFinite(Number(o.minX)) && Number.isFinite(Number(o.maxX)) && Number.isFinite(Number(o.minZ)) && Number.isFinite(Number(o.maxZ)))
      .map(o => ({
        name: String(o.name || 'Terrain Wall'),
        minX: Number(o.minX),
        maxX: Number(o.maxX),
        minZ: Number(o.minZ),
        maxZ: Number(o.maxZ),
        heightY: Number(o.heightY) || 2.0,
        solid: o.solid !== false,
        obscuring: Boolean(o.obscuring)
      }));

    // Squad-Level 40k LOS Rule: mark HORDE->PLAYER pair blocked only when EVERY model-to-model 3D raycast is blocked
    const blockedGuidSet = new Set(
      (Array.isArray(rawScan.raycastBlockedGuidPairs) ? rawScan.raycastBlockedGuidPairs : []).map(String)
    );
    const autoBlockedLosPairs = [];
    if (blockedGuidSet.size > 0) {
      const hordeUnits = units.filter(u => u.side !== 'PLAYER');
      const playerUnits = units.filter(u => u.side === 'PLAYER');
      for (const h of hordeUnits) {
        const hModels = Array.isArray(h.models) && h.models.length > 0 ? h.models : (h.guid ? [{ guid: h.guid }] : []);
        if (hModels.length === 0) continue;
        for (const p of playerUnits) {
          const pModels = Array.isArray(p.models) && p.models.length > 0 ? p.models : (p.guid ? [{ guid: p.guid }] : []);
          if (pModels.length === 0) continue;
          let allPairsBlocked = true;
          for (const hm of hModels) {
            for (const pm of pModels) {
              if (!hm.guid || !pm.guid || (!blockedGuidSet.has(`${hm.guid}->${pm.guid}`) && !blockedGuidSet.has(`${pm.guid}->${hm.guid}`))) {
                allPairsBlocked = false;
                break;
              }
            }
            if (!allPairsBlocked) break;
          }
          if (allPairsBlocked) {
            autoBlockedLosPairs.push(`${h.squadKey || h.name}->${p.squadKey || p.name}`);
          }
        }
      }
    }

    return { units, objectives, guidRegistry: updatedGuidRegistry, shelfTemplates, obstacles, autoBlockedLosPairs };
  }

  return {
    MAX_COHERENCY_LINK_INCHES,
    MAX_UNIT_SPAN_INCHES,
    MAX_COHERENCY_CLUSTER_INCHES,
    stripTtsMarkup,
    parseModelNameAndWounds,
    parseDatasheetFromTts,
    hasDatasheetSignature,
    inferSide,
    extractExplicitSquadToken,
    extractEmbarkedCargo,
    normalizeColorTintKey,
    inferBaseRadiusInches,
    measureEdgeToEdgeInches,
    clusterModelsByCoherency,
    evaluateCoherentRevivalDistance,
    normalizeTtsBoardScan
  };
});

````
