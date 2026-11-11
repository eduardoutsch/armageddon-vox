# 📦 Fires of Armageddon // Bundle: LCT TTS Orbital Auspex Beacon & Telemetry Core

Pure Yellowscribe/ForceOrg BBCode datasheet parser, 2D edge-to-edge tabletop inch geometry, non-invasive LCT Beacon token Lua script, and unit tests (`js/tts-telemetry-core.js`, `tts/lct_horde_bridge.lua`, `tests/js/tts-telemetry-core.test.js`).

## 📑 Table of Contents
- [js/tts-telemetry-core.js](#file-jsttstelemetrycorejs)
- [tts/lct_horde_bridge.lua](#file-ttslcthordebridgelua)
- [tests/js/tts-telemetry-core.test.js](#file-testsjsttstelemetrycoretestjs)

---

## File: `js/tts-telemetry-core.js` <a id="file-jsttstelemetrycorejs"></a>

````javascript
/**
 * @fileoverview Fires of Armageddon // Pure TTS Telemetry, Datasheet & Geometry Core
 *
 * Pure Functional Core module (zero DOM, network, filesystem, or PRNG dependencies):
 * - Strips TTS BBCode/color markup while preserving 40k `[KEYWORD]` weapon brackets
 * - Extracts stats, saves, FNP, Scouts, keywords, and weapons from Yellowscribe/ForceOrg text
 * - Groups individual TTS miniature objects into logical squads with wound tallies
 * - Computes exact 2D base-edge-to-base-edge distances in inches to enemies and objectives
 */

(function (root, factory) {
  const exports = factory();
  if (typeof root !== 'undefined') Object.assign(root, exports);
  if (typeof module !== 'undefined' && module.exports) module.exports = exports;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {

  /**
   * Removes TTS BBCode formatting (`[b]`, `[-]`, `[c6c930]`) without touching `[LETHAL HITS]`.
   *
   * @param {string} text - Raw TTS string containing MoonSharp/NGUI color and formatting tags.
   * @returns {string} Sanitized plain text with 40k bracketed weapon keywords intact.
   */
  function stripTtsMarkup(text) {
    if (!text) return '';
    return String(text)
      .replace(/\[\/?(?:b|i|u|s|sub|sup)\]/gi, '')
      .replace(/\[-\]/g, '')
      .replace(/\[[0-9a-fA-F]{6}(?:[0-9a-fA-F]{2})?\]/g, '')
      .replace(/\r\n/g, '\n')
      .trim();
  }

  /**
   * Extracts `current/max` wound counters and normalized base unit name from a TTS object name.
   *
   * @param {string} rawName - Raw TTS model name (e.g. `"8/10 Screamer-Killer"` or `"[b]Warriors[/b] (1/1)"`).
   * @returns {{baseName: string, currentWounds: number|null, maxWounds: number|null}}
   */
  function parseModelNameAndWounds(rawName) {
    const clean = stripTtsMarkup(rawName);
    if (!clean) return { baseName: 'Unknown Model', currentWounds: null, maxWounds: null };

    const leadMatch = clean.match(/^\(?(\d+)\s*\/\s*(\d+)\)?\s+(.+)$/);
    if (leadMatch) {
      return {
        baseName: leadMatch[3].trim(),
        currentWounds: parseInt(leadMatch[1], 10),
        maxWounds: parseInt(leadMatch[2], 10)
      };
    }

    const trailMatch = clean.match(/^(.+?)\s+\(?(\d+)\s*\/\s*(\d+)\)?$/);
    if (trailMatch) {
      return {
        baseName: trailMatch[1].trim(),
        currentWounds: parseInt(trailMatch[2], 10),
        maxWounds: parseInt(trailMatch[3], 10)
      };
    }

    return { baseName: clean, currentWounds: null, maxWounds: null };
  }

  function parseWeaponLine(line) {
    const trimmed = line.trim();
    if (!trimmed) return null;

    let kwList = [];
    let working = trimmed;
    const kwMatch = working.match(/\[([A-Z0-9\s,\-+]+)\]\s*$/i);
    if (kwMatch) {
      kwList = kwMatch[1].split(',').map(k => k.trim().toUpperCase()).filter(Boolean);
      working = working.slice(0, kwMatch.index).trim().replace(/\|\s*$/, '').trim();
    }

    // Pipe-delimited Yellowscribe / table row: Name | 18" or Melee | A | BS/WS | S | AP | D
    if (working.includes('|')) {
      const cols = working.split('|').map(c => c.trim()).filter(Boolean);
      if (cols.length >= 7) {
        const isMelee = /^melee$/i.test(cols[1]);
        return {
          name: cols[0],
          type: isMelee ? 'melee' : 'ranged',
          rangeInches: isMelee ? 0 : (parseInt(cols[1], 10) || 0),
          attacks: /^\d+$/.test(cols[2]) ? parseInt(cols[2], 10) : cols[2].toUpperCase(),
          skill: parseInt(cols[3], 10) || 4,
          strength: parseInt(cols[4], 10) || 4,
          ap: parseInt(cols[5], 10) || 0,
          damage: cols[6],
          keywords: kwList
        };
      }
    }

    // Inline labeled format: Range: 24" A: 2 BS: 3+ S: 4 AP: -1 D: 1
    const lblMatch = working.match(/^(?:(.+?)\s*[-—:]\s*)?(?:Range:\s*)?(Melee|\d+")\s+A:\s*([0-9D+]+)\s+(?:BS|WS):\s*(\d)\+\s+S:\s*(\d+)\s+AP:\s*(-?\d+)\s+D:\s*([0-9D+]+)/i);
    if (lblMatch) {
      const isMelee = /^melee$/i.test(lblMatch[2]);
      return {
        name: (lblMatch[1] || 'Weapon').trim(),
        type: isMelee ? 'melee' : 'ranged',
        rangeInches: isMelee ? 0 : (parseInt(lblMatch[2], 10) || 0),
        attacks: /^\d+$/.test(lblMatch[3]) ? parseInt(lblMatch[3], 10) : lblMatch[3].toUpperCase(),
        skill: parseInt(lblMatch[4], 10) || 4,
        strength: parseInt(lblMatch[5], 10) || 4,
        ap: parseInt(lblMatch[6], 10) || 0,
        damage: lblMatch[7],
        keywords: kwList
      };
    }
    return null;
  }

  /**
   * Parses a Yellowscribe or ForceOrg TTS model description into structured 11th Ed stats & weapons.
   *
   * @param {string} [description=''] - TTS object `getDescription()` string.
   * @param {string} [gmNotes=''] - TTS object `getGMNotes()` string.
   * @returns {object} Normalized datasheet profile (`move`, `toughness`, `save`, `invuln`, `fnp`, `weapons`, etc.).
   */
  function parseDatasheetFromTts(description = '', gmNotes = '') {
    const clean = stripTtsMarkup(`${description || ''}\n${gmNotes || ''}`);
    const lines = clean.split('\n').map(l => l.trim()).filter(Boolean);

    let move = 6;
    let toughness = 4;
    let save = 4;
    let invuln = null;
    let fnp = null;
    let woundsPerModel = 1;
    let leadership = 7;
    let oc = 1;
    let scoutsInches = 0;
    const keywords = new Set();
    const weapons = [];

    // 1. Inline labeled statline (M: 6" T: 4 Sv: 4+ W: 1 Ld: 7+ OC: 2)
    const inlineStats = clean.match(/M:?\s*(\d+)"?[\s|]+T:?\s*(\d+)[\s|]+Sv:?\s*(\d)\+[\s|]+W:?\s*(\d+)[\s|]+Ld:?\s*(\d+)\+?[\s|]+OC:?\s*(\d+)/i);
    if (inlineStats) {
      move = parseInt(inlineStats[1], 10);
      toughness = parseInt(inlineStats[2], 10);
      save = parseInt(inlineStats[3], 10);
      woundsPerModel = parseInt(inlineStats[4], 10);
      leadership = parseInt(inlineStats[5], 10);
      oc = parseInt(inlineStats[6], 10);
    }

    // 2. Two-line tabular Yellowscribe statline
    for (let i = 0; i < lines.length - 1; i++) {
      if (/^M\s+T\s+Sv\s+W\s+Ld\s+OC\b/i.test(lines[i])) {
        const vals = lines[i + 1].match(/(\d+)"?\s+(\d+)\s+(\d)\+\s+(\d+)\s+(\d+)\+?\s+(\d+)/);
        if (vals) {
          move = parseInt(vals[1], 10);
          toughness = parseInt(vals[2], 10);
          save = parseInt(vals[3], 10);
          woundsPerModel = parseInt(vals[4], 10);
          leadership = parseInt(vals[5], 10);
          oc = parseInt(vals[6], 10);
        }
      }
    }

    const invMatch = clean.match(/(?:Invulnerable Save|Invuln|Inv):?\s*(\d)\+|\b(\d)\+\+/i);
    if (invMatch) invuln = parseInt(invMatch[1] || invMatch[2], 10);

    const fnpMatch = clean.match(/(?:Feel No Pain|FNP):?\s*(\d)\+/i);
    if (fnpMatch) fnp = parseInt(fnpMatch[1], 10);

    const scoutMatch = clean.match(/Scouts\s+(\d+)"/i);
    if (scoutMatch) scoutsInches = parseInt(scoutMatch[1], 10);

    for (const line of lines) {
      const kwLine = line.match(/^(?:Faction\s+)?Keywords:\s*(.+)$/i);
      if (kwLine) {
        kwLine[1].split(/[,|]/).map(k => k.trim().toUpperCase()).filter(Boolean).forEach(k => keywords.add(k));
        continue;
      }
      const wp = parseWeaponLine(line);
      if (wp) weapons.push(wp);
    }

    return {
      move,
      toughness,
      save,
      invuln,
      fnp,
      woundsPerModel,
      leadership,
      oc,
      scoutsInches,
      keywords: Array.from(keywords),
      weapons
    };
  }

  /**
   * Infers 2D horizontal base radius in inches from explicit mm or TTS normalized bounds.
   */
  function inferBaseRadiusInches(obj = {}) {
    if (obj.baseDiameterMm) {
      return (Number(obj.baseDiameterMm) / 25.4) * 0.5;
    }
    if (obj.bounds && obj.bounds.x && obj.bounds.z) {
      const minSpan = Math.min(Number(obj.bounds.x) || 1.26, Number(obj.bounds.z) || 1.26);
      return Math.max(0.45, Math.min(3.5, minSpan * 0.5));
    }
    return 0.63; // Default 32mm base radius in inches
  }

  /**
   * Measures 2D tabletop edge-to-edge distance in inches (1 TTS unit = 1 inch on XZ plane).
   */
  function measureEdgeToEdgeInches(posA = {}, radiusA = 0, posB = {}, radiusB = 0) {
    const dx = (Number(posA.x) || 0) - (Number(posB.x) || 0);
    const dz = (Number(posA.z) || 0) - (Number(posB.z) || 0);
    const centerDist = Math.hypot(dx, dz);
    return Number(Math.max(0, centerDist - radiusA - radiusB).toFixed(2));
  }

  function isPointInZones(pos, zones = []) {
    if (!pos || !Array.isArray(zones)) return false;
    const x = Number(pos.x) || 0;
    const z = Number(pos.z) || 0;
    return zones.some(zn => x >= zn.minX && x <= zn.maxX && z >= zn.minZ && z <= zn.maxZ);
  }

  function inferSide(obj) {
    const tags = Array.isArray(obj.tags) ? obj.tags.map(t => String(t).toUpperCase()) : [];
    if (tags.includes('PLAYER') || String(obj.side || '').toUpperCase() === 'PLAYER') return 'PLAYER';
    if (tags.includes('HORDE') || String(obj.side || '').toUpperCase() === 'HORDE') return 'HORDE';
    return 'HORDE';
  }

  /**
   * Converts a raw TTS `getAllObjects()` snapshot into grouped squads, parsed datasheets & exact distances.
   */
  function normalizeTtsBoardScan(rawScan = {}) {
    const rawObjects = Array.isArray(rawScan.objects) ? rawScan.objects : [];
    const spawnZones = Array.isArray(rawScan.spawnZones) ? rawScan.spawnZones : [];
    const objectives = [];
    const squadBuckets = new Map();

    for (const obj of rawObjects) {
      if (!obj || !obj.name) continue;
      const cleanName = stripTtsMarkup(obj.name);
      const tags = Array.isArray(obj.tags) ? obj.tags.map(t => String(t).toUpperCase()) : [];

      if (tags.includes('OBJECTIVE') || /^obj(?:ective)?\b/i.test(cleanName)) {
        objectives.push({
          guid: obj.guid || null,
          name: cleanName,
          pos: obj.pos || { x: 0, y: 0, z: 0 },
          radiusInches: inferBaseRadiusInches({ baseDiameterMm: 40, bounds: obj.bounds })
        });
        continue;
      }

      const side = inferSide(obj);
      const parsedName = parseModelNameAndWounds(cleanName);
      const squadKey = obj.squadId || `${side}::${parsedName.baseName}`;
      const radiusInches = inferBaseRadiusInches(obj);

      if (!squadBuckets.has(squadKey)) {
        const ds = parseDatasheetFromTts(obj.description, obj.gmNotes);
        squadBuckets.set(squadKey, {
          squadKey,
          guid: obj.guid || null,
          guids: [],
          name: parsedName.baseName,
          side,
          modelCount: 0,
          totalRemainingWounds: 0,
          woundsPerModel: parsedName.maxWounds || ds.woundsPerModel || 1,
          move: ds.move,
          toughness: ds.toughness,
          save: ds.save,
          invuln: ds.invuln,
          fnp: ds.fnp,
          leadership: ds.leadership,
          oc: ds.oc,
          scoutsInches: ds.scoutsInches,
          keywords: ds.keywords,
          weapons: ds.weapons,
          models: []
        });
      }

      const bucket = squadBuckets.get(squadKey);
      bucket.guids.push(obj.guid);
      bucket.modelCount += 1;
      const curW = parsedName.currentWounds !== null ? parsedName.currentWounds : bucket.woundsPerModel;
      bucket.totalRemainingWounds += curW;
      bucket.models.push({
        guid: obj.guid,
        pos: obj.pos || { x: 0, y: 0, z: 0 },
        radiusInches,
        currentWounds: curW
      });
    }

    const units = Array.from(squadBuckets.values()).map(u => {
      const sumX = u.models.reduce((acc, m) => acc + (Number(m.pos.x) || 0), 0);
      const sumZ = u.models.reduce((acc, m) => acc + (Number(m.pos.z) || 0), 0);
      const center = {
        x: Number((sumX / u.modelCount).toFixed(2)),
        z: Number((sumZ / u.modelCount).toFixed(2))
      };
      const inSpawnZone = u.models.every(m => isPointInZones(m.pos, spawnZones)) && spawnZones.length > 0;
      return { ...u, pos: center, inSpawnZone };
    });

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

    return { units, objectives };
  }

  return {
    stripTtsMarkup,
    parseModelNameAndWounds,
    parseDatasheetFromTts,
    inferBaseRadiusInches,
    measureEdgeToEdgeInches,
    normalizeTtsBoardScan
  };
});

````

---

## File: `tts/lct_horde_bridge.lua` <a id="file-ttslcthordebridgelua"></a>

````lua
-- ============================================================================
-- FIRES OF ARMAGEDDON // LCT (11TH ED FTC) ORBITAL AUSPEX & DICE-MAT BRIDGE
-- Attach this script to a single Token/Checker on the LCT table (DO NOT replace LCT Global!).
-- Connects TTS <-> Local Tactica Daemon (http://127.0.0.1:3030)
-- ============================================================================

local BRIDGE_URL = "http://127.0.0.1:3030"
local pollEnabled = true
local isRollingMat = false

-- Standard LCT Red/Blue Dice Mat Scripting Zone fallback bounds if zone GUID is not set in GMNotes
local LCT_MAT_BOUNDS = {
    RED  = { minX = -38, maxX = -18, minZ = -32, maxZ = -16, spawnY = 3.2 },
    BLUE = { minX =  18, maxX =  38, minZ =  16, maxZ =  32, spawnY = 3.2 }
}

function onLoad()
    self.setName("📡 LCT Horde Autopilot Beacon")
    buildBeaconButtons()
    Wait.time(pollTacticaDaemon, 0.5, -1)
    printToAll("+++ LCT ORBITAL AUSPEX & DICE-MAT BRIDGE ONLINE [127.0.0.1:3030] +++", {0.2, 1.0, 0.5})
end

function buildBeaconButtons()
    self.clearButtons()
    self.createButton({
        click_function = "pushBoardTelemetry", function_owner = self,
        label = "📡 Scan LCT Board", position = {0, 0.3, -0.8},
        width = 1100, height = 280, font_size = 120, color = {0.1, 0.32, 0.22}, font_color = {0.8, 1, 0.85}
    })
    self.createButton({
        click_function = "tagSelectionAsPlayer", function_owner = self,
        label = "🛡️ Tag Selected PLAYER", position = {-0.9, 0.3, 0.1},
        width = 1050, height = 250, font_size = 95, color = {0.12, 0.24, 0.45}, font_color = {1, 1, 1}
    })
    self.createButton({
        click_function = "tagSelectionAsHorde", function_owner = self,
        label = "🧟 Tag Selected HORDE", position = {0.9, 0.3, 0.1},
        width = 1050, height = 250, font_size = 95, color = {0.45, 0.12, 0.15}, font_color = {1, 1, 1}
    })
    self.createButton({
        click_function = "togglePoller", function_owner = self,
        label = "🔄 Poll: ON", position = {0, 0.3, 0.9},
        width = 900, height = 240, font_size = 100, color = {0.18, 0.18, 0.22}, font_color = {0.95, 0.8, 0.3}
    })
end

function togglePoller()
    pollEnabled = not pollEnabled
    self.editButton({ index = 3, label = pollEnabled and "🔄 Poll: ON" or "⏸️ Poll: OFF" })
end

function tagSelectionAsPlayer(_, playerColor)
    for _, obj in ipairs(Player[playerColor].getSelectedObjects()) do
        obj.removeTag("HORDE")
        obj.addTag("PLAYER")
    end
    broadcastToAll("🛡️ Tagged selected models as PLAYER.", {0.4, 0.75, 1})
    pushBoardTelemetry()
end

function tagSelectionAsHorde(_, playerColor)
    for _, obj in ipairs(Player[playerColor].getSelectedObjects()) do
        obj.removeTag("PLAYER")
        obj.addTag("HORDE")
    end
    broadcastToAll("🧟 Tagged selected models as HORDE.", {1, 0.45, 0.45})
    pushBoardTelemetry()
end

-- Scans all miniatures and objectives on the LCT map and posts raw metadata to /tts/telemetry
function pushBoardTelemetry()
    local objectsPayload = {}
    for _, obj in ipairs(getAllObjects()) do
        if obj ~= self and not obj.isSmoothMoving() then
            local name = obj.getName() or ""
            local lname = string.lower(name)
            local size = obj.getBoundsNormalized().size
            local isObjMarker = obj.hasTag("OBJECTIVE") or string.find(lname, "^objective") or string.find(lname, "^obj ")
            local isMini = (obj.tag == "Figurine" or obj.tag == "Custom_Model" or obj.hasTag("HORDE") or obj.hasTag("PLAYER") or string.find(name, "%d+/%d+"))
                           and size.x > 0.3 and size.x < 12 and size.z < 12

            if isObjMarker or isMini then
                local pos = obj.getPosition()
                local tags = obj.getTags()
                if isObjMarker then table.insert(tags, "OBJECTIVE") end
                table.insert(objectsPayload, {
                    guid = obj.getGUID(),
                    name = name,
                    description = obj.getDescription() or "",
                    gmNotes = obj.getGMNotes() or "",
                    tags = tags,
                    pos = { x = pos.x, y = pos.y, z = pos.z },
                    bounds = { x = size.x, y = size.y, z = size.z }
                })
            end
        end
    end

    local body = JSON.encode({ objects = objectsPayload })
    WebRequest.custom(BRIDGE_URL .. "/tts/telemetry", "POST", true, body, { ["Content-Type"] = "application/json" }, function(res)
        if not res.is_error then
            printToAll("📡 LCT Telemetry Synced (" .. #objectsPayload .. " tabletop objects).", {0.4, 0.95, 0.7})
        end
    end)
end

function pollTacticaDaemon()
    if not pollEnabled or isRollingMat then return end
    WebRequest.get(BRIDGE_URL .. "/tts/poll", function(req)
        if req.is_error or not req.text or req.text == "" or req.text == "IDLE" then return end
        local cmd = JSON.decode(req.text)
        if not cmd then return end

        if cmd.action == "LCT_MAT_ROLL" then
            executeLctMatRoll(cmd)
        elseif cmd.action == "SCAN_BOARD" then
            pushBoardTelemetry()
        elseif cmd.action == "MOVE_UNIT" then
            executeSquadMove(cmd.guids or {}, cmd.targetX, cmd.targetZ, cmd.facingY)
        elseif cmd.action == "SPAWN_WAVE" then
            executeSpawnWave(cmd)
        elseif cmd.action == "REVERT_MOVE" then
            executeRevertMove(cmd)
        elseif cmd.action == "SPAWN_GHOST_RING" then
            spawnGhostRing(cmd)
        end
    end)
end

-- Discovers LCT's native Red/Blue Dice Mat controller object and clicks matching buttons if present
function findLctDiceMatController(matSide)
    local sideLower = string.lower(matSide or "RED")
    for _, obj in ipairs(getAllObjects()) do
        local n = string.lower(obj.getName() or "")
        local btns = obj.getButtons()
        if btns and #btns >= 4 and (string.find(n, "dice") or string.find(n, "roller")) then
            if string.find(n, sideLower) or sideLower == "red" then
                return obj, btns
            end
        end
    end
    return nil, nil
end

function clickMatButtonMatching(matObj, btns, pattern, playerColor)
    if not matObj or not btns then return false end
    for _, b in ipairs(btns) do
        local lbl = string.lower(b.label or "")
        local fn = string.lower(b.click_function or "")
        if string.find(lbl, pattern) or string.find(fn, pattern) then
            pcall(function() matObj.call(b.click_function, { matObj, playerColor, false }) end)
            return true
        end
    end
    return false
end

function getDiceInMatBounds(bounds)
    local found = {}
    for _, obj in ipairs(getAllObjects()) do
        if obj.tag == "Dice" then
            local p = obj.getPosition()
            if p.x >= bounds.minX and p.x <= bounds.maxX and p.z >= bounds.minZ and p.z <= bounds.maxZ then
                table.insert(found, obj)
            end
        end
    end
    return found
end

-- Triggers LCT's Red/Blue Dice Mat, waits for settled physics, and posts pip values to /tts/dice-result
function executeLctMatRoll(cmd)
    isRollingMat = true
    local side = string.upper(cmd.matSide or "RED")
    local playerColor = (side == "BLUE") and "Blue" or "Red"
    local bounds = LCT_MAT_BOUNDS[side] or LCT_MAT_BOUNDS.RED
    local count = math.max(1, tonumber(cmd.count) or 1)

    printToAll("🎲 [LCT MAT • " .. (cmd.stage or "ROLL") .. "] " .. (cmd.label or (count .. "D6")), {1, 0.8, 0.25})

    local matObj, btns = findLctDiceMatController(side)
    if cmd.clearFirst ~= false then
        if not clickMatButtonMatching(matObj, btns, "clear", playerColor) then
            for _, oldDie in ipairs(getDiceInMatBounds(bounds)) do destroyObject(oldDie) end
        end
    end

    Wait.time(function()
        local spawnedViaButtons = false
        if matObj and btns then
            local rem = count
            for _, denom in ipairs({25, 10, 5, 2, 1}) do
                while rem >= denom do
                    if clickMatButtonMatching(matObj, btns, "^%+?" .. tostring(denom) .. "$", playerColor) then
                        rem = rem - denom
                        spawnedViaButtons = true
                    else
                        break
                    end
                end
            end
            clickMatButtonMatching(matObj, btns, "roll", playerColor)
        end

        -- Guaranteed fallback inside LCT's Dice Mat zone so LCT's zone counter still tallies them
        if not spawnedViaButtons then
            for i = 1, count do
                local col = (i - 1) % 8
                local row = math.floor((i - 1) / 8)
                local die = spawnObject({
                    type = "Die_6_Rounded",
                    position = { bounds.minX + 2.0 + col * 1.1, bounds.spawnY, bounds.minZ + 2.0 + row * 1.1 }
                })
                die.setColorTint(side == "BLUE" and {0.2, 0.5, 1} or {0.9, 0.2, 0.2})
                die.roll()
            end
        end

        Wait.time(function()
            Wait.condition(function()
                local settledDice = getDiceInMatBounds(bounds)
                local pips = {}
                for i = 1, math.min(count, #settledDice) do
                    table.insert(pips, settledDice[i].getValue())
                end
                local payload = JSON.encode({
                    rollId = cmd.rollId,
                    sequenceId = cmd.sequenceId,
                    label = cmd.label,
                    dice = pips
                })
                WebRequest.custom(BRIDGE_URL .. "/tts/dice-result", "POST", true, payload, { ["Content-Type"] = "application/json" }, function()
                    isRollingMat = false
                end)
            end, function()
                local active = getDiceInMatBounds(bounds)
                if #active < count then return false end
                for _, d in ipairs(active) do
                    if not d.resting then return false end
                end
                return true
            end, 7.0, function()
                isRollingMat = false
            end)
        end, 0.45)
    end, 0.25)
end

-- Raycasts terrain surface height and smoothly glides squad models (used in Step 5 Horde Autopilot)
function getSurfaceY(x, z, halfH)
    local hits = Physics.cast({ origin = {x = x, y = 25, z = z}, direction = {x = 0, y = -1, z = 0}, type = 1, max_distance = 30 })
    for _, hit in ipairs(hits) do
        if hit.hit_object ~= self and hit.hit_object.tag ~= "Figurine" and hit.hit_object.tag ~= "Dice" then
            return hit.point.y + (halfH or 0.15)
        end
    end
    return 1.1
end

function executeSquadMove(guids, targetX, targetZ, facingY)
    local total = #guids
    for i, guid in ipairs(guids) do
        local obj = getObjectFromGUID(guid)
        if obj then
            local ox, oz = 0, 0
            if total > 1 and i > 1 then
                local ang = ((i - 2) / (total - 1)) * (2 * math.pi)
                local rad = (i <= 7) and 1.35 or 2.6
                ox = math.cos(ang) * rad
                oz = math.sin(ang) * rad
            end
            local halfH = obj.getBoundsNormalized().size.y * 0.5
            local y = getSurfaceY(targetX + ox, targetZ + oz, halfH)
            obj.setPositionSmooth({x = targetX + ox, y = y, z = targetZ + oz}, false, false)
            if facingY then obj.setRotationSmooth({x = 0, y = facingY, z = 0}, false, false) end
        end
    end
    Wait.time(pushBoardTelemetry, 1.4)
end

-- Finds an off-board or HORDE_TEMPLATE miniature matching templateName for wave cloning
function findShelfTemplateModel(templateName)
    local targetLower = string.lower(templateName or "")
    for _, obj in ipairs(getAllObjects()) do
        if obj ~= self then
            local p = obj.getPosition()
            local isOffBoard = math.abs(p.x) > 32 or math.abs(p.z) > 24
            if obj.hasTag("HORDE_TEMPLATE") or isOffBoard then
                local clean = string.lower(string.gsub(obj.getName() or "", "^%s*%d+/%d+%s*", ""))
                if clean == targetLower or string.find(clean, targetLower, 1, true) then
                    return obj
                end
            end
        end
    end
    return nil
end

function executeSpawnWave(cmd)
    local offsetGroup = 0
    for _, u in ipairs(cmd.units or {}) do
        local tmpl = findShelfTemplateModel(u.templateName)
        local cx = (tonumber(cmd.targetX) or 0) + offsetGroup
        local cz = tonumber(cmd.targetZ) or 19.5
        if tmpl then
            local count = math.max(1, tonumber(u.count) or 1)
            for i = 1, count do
                local ox, oz = 0, 0
                if count > 1 and i > 1 then
                    local ang = ((i - 2) / (count - 1)) * (2 * math.pi)
                    local rad = (i <= 7) and 1.35 or 2.6
                    ox = math.cos(ang) * rad
                    oz = math.sin(ang) * rad
                end
                local y = getSurfaceY(cx + ox, cz + oz, 0.5)
                local cloned = tmpl.clone({ position = { x = cx + ox, y = y + 0.5, z = cz + oz } })
                cloned.removeTag("HORDE_TEMPLATE")
                cloned.addTag("HORDE")
                cloned.setLock(false)
                if cmd.facingY then cloned.setRotation({ x = 0, y = cmd.facingY, z = 0 }) end
            end
            printToAll("🧟 Spawned " .. count .. "x " .. u.templateName .. " in Zone " .. tostring(cmd.zone), {1, 0.45, 0.45})
        else
            spawnGhostRing({ targetX = cx, targetZ = cz, label = "Missing Shelf Template: " .. tostring(u.count) .. "x " .. tostring(u.templateName) })
        end
        offsetGroup = offsetGroup + 4.0
    end
    Wait.time(pushBoardTelemetry, 1.5)
end

function executeRevertMove(cmd)
    for _, m in ipairs(cmd.models or {}) do
        local obj = getObjectFromGUID(m.guid)
        if obj then
            obj.setPositionSmooth({ x = m.x, y = m.y or 1.1, z = m.z }, false, false)
        end
    end
    printToAll("↩️ Reverted move for " .. tostring(cmd.unitName or "Horde Squad") .. " (LOS Check).", {0.95, 0.8, 0.3})
    Wait.time(pushBoardTelemetry, 1.2)
end

function spawnGhostRing(cmd)
    local y = getSurfaceY(cmd.targetX or 0, cmd.targetZ or 0, 0.05)
    local ring = spawnObject({
        type = "Custom_Tile",
        position = { x = cmd.targetX or 0, y = y, z = cmd.targetZ or 0 },
        scale = { x = 1.6, y = 0.1, z = 1.6 }
    })
    ring.setName("📍 " .. tostring(cmd.label or "Horde Waypoint"))
    ring.setColorTint({ 1.0, 0.75, 0.15, 0.65 })
    ring.setLock(true)
end


````

---

## File: `tests/js/tts-telemetry-core.test.js` <a id="file-testsjsttstelemetrycoretestjs"></a>

````javascript
/**
 * @fileoverview Unit tests for js/tts-telemetry-core.js pure TTS BBCode stripper,
 * Yellowscribe/ForceOrg datasheet parser, and 2D edge-to-edge tabletop geometry.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  stripTtsMarkup,
  parseModelNameAndWounds,
  parseDatasheetFromTts,
  inferBaseRadiusInches,
  measureEdgeToEdgeInches,
  normalizeTtsBoardScan
} = require('../../js/tts-telemetry-core.js');

test('stripTtsMarkup: removes TTS BBCode & hex color tags while preserving 40k [KEYWORD] brackets', () => {
  assert.equal(stripTtsMarkup(''), '');
  const raw = '[b][c6c930]Gauss flayer[-][/b] [00ff88ff][LETHAL HITS, RAPID FIRE 1][-]';
  const clean = stripTtsMarkup(raw);
  assert.equal(clean, 'Gauss flayer [LETHAL HITS, RAPID FIRE 1]');
});

test('parseModelNameAndWounds: extracts current/max wounds from prefix or suffix counters', () => {
  assert.deepEqual(parseModelNameAndWounds(''), {
    baseName: 'Unknown Model',
    currentWounds: null,
    maxWounds: null
  });
  assert.deepEqual(parseModelNameAndWounds('8/10 Screamer-Killer'), {
    baseName: 'Screamer-Killer',
    currentWounds: 8,
    maxWounds: 10
  });
  assert.deepEqual(parseModelNameAndWounds('[b]Necron Warriors[/b] (1/1)'), {
    baseName: 'Necron Warriors',
    currentWounds: 1,
    maxWounds: 1
  });
  assert.deepEqual(parseModelNameAndWounds('Overlord'), {
    baseName: 'Overlord',
    currentWounds: null,
    maxWounds: null
  });
});

test('parseDatasheetFromTts: parses tabular & inline Yellowscribe/ForceOrg stats, saves, keywords, and weapons', () => {
  const yellowscribeDesc = `
    [b][f5b041]M    T   Sv   W   Ld   OC[-][/b]
    8"   9   3+   10  6+   3
    [c6c930]Invulnerable Save:[-] 4+
    [c6c930]Abilities:[-] Scouts 6", Deadly Demise D3, Feel No Pain 5+
    [b]Ranged Weapons[/b]
    Bio-plasmic scream | 18" | D6+3 | 4+ | 8 | -2 | 1 | [ASSAULT, BLAST]
    [b]Melee Weapons[/b]
    Screamer-killer talons | Melee | 10 | 3+ | 10 | -2 | 3 | [LETHAL HITS]
    [b]Keywords:[/b] Monster, Character, Great Devourer, Screamer-Killer
  `;

  const ds = parseDatasheetFromTts(yellowscribeDesc);
  assert.equal(ds.move, 8);
  assert.equal(ds.toughness, 9);
  assert.equal(ds.save, 3);
  assert.equal(ds.invuln, 4);
  assert.equal(ds.fnp, 5);
  assert.equal(ds.woundsPerModel, 10);
  assert.equal(ds.leadership, 6);
  assert.equal(ds.oc, 3);
  assert.equal(ds.scoutsInches, 6);
  assert.ok(ds.keywords.includes('MONSTER') && ds.keywords.includes('CHARACTER'));

  assert.equal(ds.weapons.length, 2);
  assert.equal(ds.weapons[0].name, 'Bio-plasmic scream');
  assert.equal(ds.weapons[0].type, 'ranged');
  assert.equal(ds.weapons[0].rangeInches, 18);
  assert.equal(ds.weapons[0].attacks, 'D6+3');
  assert.equal(ds.weapons[0].skill, 4);
  assert.equal(ds.weapons[0].strength, 8);
  assert.equal(ds.weapons[0].ap, -2);
  assert.equal(ds.weapons[0].damage, '1');
  assert.ok(ds.weapons[0].keywords.includes('ASSAULT') && ds.weapons[0].keywords.includes('BLAST'));

  assert.equal(ds.weapons[1].type, 'melee');
  assert.equal(ds.weapons[1].strength, 10);
  assert.ok(ds.weapons[1].keywords.includes('LETHAL HITS'));

  // Inline labeled weapon & shorthand 5++ invuln
  const inlineDs = parseDatasheetFromTts(
    'M: 6" T: 4 Sv: 3+ W: 2 Ld: 6+ OC: 2\n5++\nBolt rifle - Range: 24" A: 2 BS: 3+ S: 4 AP: -1 D: 1 [HEAVY]\nFaction Keywords: Adeptus Astartes'
  );
  assert.equal(inlineDs.invuln, 5);
  assert.equal(inlineDs.weapons.length, 1);
  assert.equal(inlineDs.weapons[0].name, 'Bolt rifle');
  assert.equal(inlineDs.weapons[0].attacks, 2);
  assert.ok(inlineDs.weapons[0].keywords.includes('HEAVY'));
});

test('measureEdgeToEdgeInches: subtracts 2D base radii from horizontal XZ distance', () => {
  assert.equal(inferBaseRadiusInches(), 0.63);
  // 32mm base (~1.26" diameter -> 0.63" radius) vs 40mm objective (~1.57" diameter -> 0.787" radius)
  const r32 = inferBaseRadiusInches({ baseDiameterMm: 32 });
  const r40 = inferBaseRadiusInches({ baseDiameterMm: 40 });
  const dist = measureEdgeToEdgeInches({ x: 0, y: 1, z: 0 }, r32, { x: 5, y: 4, z: 0 }, r40);
  // Vertical Y difference (1 vs 4) ignored in 2D horizontal distance; 5.0 - 0.63 - 0.787 = ~3.58"
  assert.ok(Math.abs(dist - (5 - r32 - r40)) < 0.02);

  // Overlapping bases clamp at 0"
  assert.equal(measureEdgeToEdgeInches({ x: 0, z: 0 }, 1.0, { x: 0.5, z: 0 }, 1.0), 0);
});

test('normalizeTtsBoardScan: groups squad models, detects Spawn Zones, and computes closest enemy & objective inches', () => {
  const rawScan = {
    spawnZones: [{ id: 1, minX: -12, maxX: 12, minZ: 14, maxZ: 22 }],
    objects: [
      { guid: 'obj1', name: 'Objective 1', pos: { x: 0, y: 1, z: 0 }, bounds: { x: 1.57, y: 0.1, z: 1.57 } },
      {
        guid: 'h1',
        name: '1/1 Necron Warriors',
        tags: ['HORDE'],
        pos: { x: 0, y: 1, z: 16 },
        bounds: { x: 1.26, y: 1.5, z: 1.26 },
        description: 'M: 5" T: 4 Sv: 4+ W: 1 Ld: 7+ OC: 2\nKeywords: Infantry, Battleline'
      },
      {
        guid: 'h2',
        name: '1/1 Necron Warriors',
        tags: ['HORDE'],
        pos: { x: 1.3, y: 1, z: 16 },
        bounds: { x: 1.26, y: 1.5, z: 1.26 },
        description: 'M: 5" T: 4 Sv: 4+ W: 1 Ld: 7+ OC: 2\nKeywords: Infantry, Battleline'
      },
      {
        guid: 'p1',
        name: '14/14 Leman Russ Vanquisher',
        tags: ['PLAYER'],
        pos: { x: 0, y: 1, z: -4 },
        bounds: { x: 3.0, y: 2.2, z: 4.5 },
        description: 'M: 10" T: 11 Sv: 2+ W: 14 Ld: 7+ OC: 3\nKeywords: Vehicle, Imperium'
      }
    ]
  };

  const res = normalizeTtsBoardScan(rawScan);
  assert.equal(res.objectives.length, 1);
  assert.equal(res.units.length, 2, 'Two Necron Warrior models must group into 1 squad');

  const warriors = res.units.find(u => u.name === 'Necron Warriors');
  assert.ok(warriors);
  assert.equal(warriors.side, 'HORDE');
  assert.equal(warriors.modelCount, 2);
  assert.equal(warriors.inSpawnZone, true);
  assert.equal(warriors.save, 4);
  assert.ok(warriors.closestEnemy && warriors.closestEnemy.name === 'Leman Russ Vanquisher');
  assert.ok(warriors.closestEnemy.distanceInches > 17 && warriors.closestEnemy.distanceInches < 19);
  assert.ok(warriors.closestObjective && warriors.closestObjective.name === 'Objective 1');
});

````
