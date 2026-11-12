# 📦 Fires of Armageddon // Bundle: LCT TTS Orbital Auspex Lua Beacon

Non-invasive Tabletop Simulator Checker/Token Lua script providing 3D & context-menu board scanning, 65%-hull 3D wall raycasts, playmat & Dice Mat bounds detection, and destroyed-safe dice rolling (`tts/lct_horde_bridge.lua`).

## 📑 Table of Contents
- [tts/lct_horde_bridge.lua](#file-ttslcthordebridgelua)

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

-- Accurate LCT Red/Blue Dice Mat fallback bounds (±24.2..±28.8 on X, -12..+12 on Z)
local LCT_MAT_BOUNDS = {
    RED  = { minX = -28.8, maxX = -24.2, minZ = -12.0, maxZ = 12.0, spawnY = 3.2 },
    BLUE = { minX =  24.2, maxX =  28.8, minZ = -12.0, maxZ = 12.0, spawnY = 3.2 }
}

function onLoad()
    local rot = self.getRotation()
    self.setRotation({ x = 0, y = rot.y, z = 0 }) -- Force upright so buttons never render under the felt
    self.setName("📡 LCT Horde Autopilot Beacon")
    buildBeaconButtons()
    buildContextMenu()
    Wait.time(pollTacticaDaemon, 0.5, -1)
    printToAll("+++ LCT ORBITAL AUSPEX & DICE-MAT BRIDGE ONLINE [127.0.0.1:3030] +++", {0.2, 1.0, 0.5})
end

function buildContextMenu()
    self.clearContextMenu()
    self.addContextMenuItem("Scan LCT Board", function() pushBoardTelemetry() end)
    self.addContextMenuItem("Tag Selected PLAYER", function(playerColor) tagSelectionAsPlayer(self, playerColor) end)
    self.addContextMenuItem("Tag Selected HORDE", function(playerColor) tagSelectionAsHorde(self, playerColor) end)
    self.addContextMenuItem("Link Selected as Squad", function(playerColor) linkSelectionAsSquad(self, playerColor) end)
    self.addContextMenuItem("Tag Selected TEMPLATE", function(playerColor) tagSelectionAsTemplate(self, playerColor) end)
end

function buildBeaconButtons()
    self.clearButtons()
    self.createButton({
        click_function = "pushBoardTelemetry", function_owner = self,
        label = "📡 Scan LCT Board", position = {0, 0.65, -1.5},
        width = 1300, height = 300, font_size = 120, color = {0.1, 0.32, 0.22}, font_color = {0.8, 1, 0.85}
    })
    self.createButton({
        click_function = "tagSelectionAsPlayer", function_owner = self,
        label = "🛡️ Tag Selected PLAYER", position = {0, 0.65, -0.5},
        width = 1300, height = 280, font_size = 105, color = {0.12, 0.24, 0.45}, font_color = {1, 1, 1}
    })
    self.createButton({
        click_function = "tagSelectionAsHorde", function_owner = self,
        label = "🧟 Tag Selected HORDE", position = {0, 0.65, 0.5},
        width = 1300, height = 280, font_size = 105, color = {0.45, 0.12, 0.15}, font_color = {1, 1, 1}
    })
    self.createButton({
        click_function = "togglePoller", function_owner = self,
        label = "🔄 Poll: ON", position = {0, 0.65, 1.5},
        width = 1100, height = 260, font_size = 105, color = {0.18, 0.18, 0.22}, font_color = {0.95, 0.8, 0.3}
    })
end

function togglePoller()
    pollEnabled = not pollEnabled
    self.editButton({ index = 3, label = pollEnabled and "🔄 Poll: ON" or "⏸️ Poll: OFF" })
end

function tagSelectionAsPlayer(_, playerColor)
    for _, obj in ipairs(Player[playerColor].getSelectedObjects()) do
        obj.removeTag("HORDE")
        obj.removeTag("HORDE_TEMPLATE")
        obj.addTag("PLAYER")
    end
    broadcastToAll("🛡️ Tagged selected models as PLAYER.", {0.4, 0.75, 1})
    pushBoardTelemetry()
end

function tagSelectionAsHorde(_, playerColor)
    for _, obj in ipairs(Player[playerColor].getSelectedObjects()) do
        obj.removeTag("PLAYER")
        obj.removeTag("HORDE_TEMPLATE")
        obj.addTag("HORDE")
    end
    broadcastToAll("🧟 Tagged selected models as HORDE.", {1, 0.45, 0.45})
    pushBoardTelemetry()
end

function tagSelectionAsTemplate(_, playerColor)
    for _, obj in ipairs(Player[playerColor].getSelectedObjects()) do
        obj.removeTag("PLAYER")
        obj.removeTag("HORDE")
        obj.addTag("HORDE_TEMPLATE")
    end
    broadcastToAll("📦 Tagged selected models as off-board HORDE_TEMPLATE.", {0.95, 0.8, 0.3})
    pushBoardTelemetry()
end

function linkSelectionAsSquad(_, playerColor)
    local selected = Player[playerColor].getSelectedObjects()
    if #selected == 0 then return end
    local sqTag = "SQUAD:" .. string.sub(selected[1].getGUID(), 1, 6) .. "_" .. tostring(math.floor(os.clock() * 100))
    for _, obj in ipairs(selected) do
        for _, t in ipairs(obj.getTags()) do
            if string.sub(string.upper(t), 1, 6) == "SQUAD:" then obj.removeTag(t) end
        end
        obj.addTag(sqTag)
    end
    broadcastToAll("🔗 Linked " .. #selected .. " selected models into permanent Squad (" .. sqTag .. ").", {0.4, 0.95, 0.7})
    pushBoardTelemetry()
end

-- Detects LCT's central 44"x60" (or 60"x44") battlemat bounds around (0,0)
function detectPlaymatBounds()
    for _, obj in ipairs(getAllObjects()) do
        local p = obj.getPosition()
        if math.abs(p.x) < 4 and math.abs(p.z) < 4 then
            local s = obj.getBoundsNormalized().size
            if (math.abs(s.x - 44) < 3 and math.abs(s.z - 60) < 3) or (math.abs(s.x - 60) < 3 and math.abs(s.z - 44) < 3) then
                return { minX = p.x - s.x * 0.5 - 0.5, maxX = p.x + s.x * 0.5 + 0.5, minZ = p.z - s.z * 0.5 - 0.5, maxZ = p.z + s.z * 0.5 + 0.5 }
            end
        end
    end
    return { minX = -22.5, maxX = 22.5, minZ = -30.5, maxZ = 30.5 }
end

function executeSetUnitSide(cmd)
    local side = string.upper(cmd.side or "PLAYER")
    for _, guid in ipairs(cmd.guids or {}) do
        local obj = getObjectFromGUID(guid)
        if obj then
            obj.removeTag("PLAYER")
            obj.removeTag("HORDE")
            obj.removeTag("HORDE_TEMPLATE")
            obj.addTag(side)
        end
    end
    pushBoardTelemetry()
end

-- Scans all miniatures, locked 3D terrain obstacles, and 65%-hull Physics.cast LOS blocks inside LCT's playmat bounds
function pushBoardTelemetry()
    local matBounds = detectPlaymatBounds()
    local objectsPayload = {}
    local shelfTemplates = {}
    local obstacles = {}
    local onMatMinis = {}
    local raycastBlockedGuidPairs = {}

    for _, obj in ipairs(getAllObjects()) do
        if obj ~= self and not obj.isSmoothMoving() then
            local pos = obj.getPosition()
            local bnd = obj.getBoundsNormalized()
            local size = bnd and bnd.size or { x = 0, y = 0, z = 0 }
            local center = bnd and bnd.center or pos
            local inMat = pos.x >= matBounds.minX and pos.x <= matBounds.maxX
                      and pos.z >= matBounds.minZ and pos.z <= matBounds.maxZ
            local centerInMat = center.x >= matBounds.minX and center.x <= matBounds.maxX
                            and center.z >= matBounds.minZ and center.z <= matBounds.maxZ
            local name = obj.getName() or ""
            local lname = string.lower(name)
            local isSecChip = string.find(lname, "secured") or string.find(lname, "camera") or string.find(lname, "dice cam")
            local isMini = obj.interactable ~= false and not isSecChip
                           and (obj.tag == "Figurine" or obj.tag == "Custom_Model" or obj.hasTag("HORDE") or obj.hasTag("PLAYER") or obj.hasTag("HORDE_TEMPLATE"))
                           and size.x > 0.3 and size.x < 12 and size.z < 12 and not obj.getLock()
            local isObjMarker = obj.interactable ~= false and not isSecChip
                           and (obj.hasTag("OBJECTIVE") or string.match(lname, "^objective%s*%d*$") or string.match(lname, "^obj%s*%d+$"))

            -- Collect locked 3D terrain colliders (ruins, containers, solid walls >= 1.8" tall) inside playmat
            if centerInMat and obj.getLock() and not isSecChip and not isObjMarker
               and obj.tag ~= "Figurine" and obj.tag ~= "Dice"
               and not obj.hasTag("HORDE") and not obj.hasTag("PLAYER") and not obj.hasTag("HORDE_TEMPLATE")
               and size.y >= 1.8 and size.x >= 0.15 and size.z >= 0.15 and size.x < 36 and size.z < 36 then
                table.insert(obstacles, {
                    name = (name ~= "" and name) or "Terrain Wall",
                    minX = center.x - size.x * 0.5,
                    maxX = center.x + size.x * 0.5,
                    minZ = center.z - size.z * 0.5,
                    maxZ = center.z + size.z * 0.5,
                    heightY = size.y,
                    solid = true
                })
            end

            if obj.interactable ~= false then
                local isAnyMini = not isSecChip and (obj.tag == "Figurine" or obj.tag == "Custom_Model" or obj.hasTag("HORDE") or obj.hasTag("PLAYER") or obj.hasTag("HORDE_TEMPLATE"))
                                  and size.x > 0.3 and size.x < 12 and size.z < 12
                if (not inMat or obj.hasTag("HORDE_TEMPLATE")) and isAnyMini and name ~= "" then
                    table.insert(shelfTemplates, {
                        name = name,
                        description = obj.getDescription() or "",
                        gmNotes = obj.getGMNotes() or "",
                        bounds = { x = size.x, y = size.y, z = size.z }
                    })
                elseif inMat and not obj.hasTag("HORDE_TEMPLATE") then
                    if isObjMarker or isAnyMini then
                        local guid = obj.getGUID()
                        local tags = obj.getTags()
                        if isObjMarker then table.insert(tags, "OBJECTIVE") end
                        local c = obj.getColorTint() or { r = 1, g = 1, b = 1 }
                        local tintHex = string.format("#%02x%02x%02x",
                            math.min(255, math.max(0, math.floor((c.r or 1) * 255 + 0.5))),
                            math.min(255, math.max(0, math.floor((c.g or 1) * 255 + 0.5))),
                            math.min(255, math.max(0, math.floor((c.b or 1) * 255 + 0.5)))
                        )
                        local ysUnitId = nil
                        pcall(function()
                            ysUnitId = obj.getVar("unitID") or obj.getVar("squadID")
                            if not ysUnitId then
                                local ud = obj.getVar("unitData")
                                if type(ud) == "table" then ysUnitId = ud.unitID or ud.id or ud.uuid end
                            end
                        end)
                        table.insert(objectsPayload, {
                            guid = guid,
                            name = name,
                            locked = obj.getLock(),
                            description = obj.getDescription() or "",
                            gmNotes = obj.getGMNotes() or "",
                            tags = tags,
                            colorTint = tintHex,
                            squadId = ysUnitId and tostring(ysUnitId) or nil,
                            pos = { x = pos.x, y = pos.y, z = pos.z },
                            bounds = { x = size.x, y = size.y, z = size.z }
                        })
                        if isMini and not isObjMarker then
                            local baseY = center.y - size.y * 0.5
                            local rayY = baseY + math.max(0.6, size.y) * 0.65
                            local expSide = obj.hasTag("HORDE") and "HORDE" or (obj.hasTag("PLAYER") and "PLAYER" or nil)
                            table.insert(onMatMinis, {
                                guid = guid,
                                obj = obj,
                                explicitSide = expSide,
                                rayOrigin = { x = center.x, y = rayY, z = center.z }
                            })
                        end
                    end
                end
            end
        end
    end

    -- Fast 3D Physics.cast from 65% hull height of each Horde model to 65% hull height of each Player model
    for i = 1, #onMatMinis do
        local a = onMatMinis[i]
        for j = i + 1, #onMatMinis do
            local b = onMatMinis[j]
            local sameExplicitSide = (a.explicitSide ~= nil and a.explicitSide == b.explicitSide)
            if not sameExplicitSide then
                local dx = b.rayOrigin.x - a.rayOrigin.x
                local dy = b.rayOrigin.y - a.rayOrigin.y
                local dz = b.rayOrigin.z - a.rayOrigin.z
                local dist = math.sqrt(dx * dx + dy * dy + dz * dz)
                if dist > 0.5 and dist <= 60.0 then
                    local hits = Physics.cast({
                        origin = a.rayOrigin,
                        direction = { x = dx / dist, y = dy / dist, z = dz / dist },
                        type = 1,
                        max_distance = dist
                    })
                    local wallBlocked = false
                    for _, hit in ipairs(hits or {}) do
                        local hObj = hit.hit_object
                        if hObj and hObj ~= self and hObj ~= a.obj and hObj ~= b.obj
                           and hit.distance and hit.distance > 0.12 and hit.distance < (dist - 0.12)
                           and hObj.getLock() and hObj.tag ~= "Figurine" and hObj.tag ~= "Dice"
                           and not hObj.hasTag("HORDE") and not hObj.hasTag("PLAYER") and not hObj.hasTag("OBJECTIVE") then
                            local hb = hObj.getBoundsNormalized()
                            if hb and hb.size.y >= 1.8 and hb.size.x < 36 and hb.size.z < 36 then
                                wallBlocked = true
                                break
                            end
                        end
                    end
                    if wallBlocked then
                        if a.explicitSide == "HORDE" and b.explicitSide == "PLAYER" then
                            table.insert(raycastBlockedGuidPairs, a.guid .. "->" .. b.guid)
                        elseif b.explicitSide == "HORDE" and a.explicitSide == "PLAYER" then
                            table.insert(raycastBlockedGuidPairs, b.guid .. "->" .. a.guid)
                        else
                            table.insert(raycastBlockedGuidPairs, a.guid .. "->" .. b.guid)
                            table.insert(raycastBlockedGuidPairs, b.guid .. "->" .. a.guid)
                        end
                    end
                end
            end
        end
    end

    local body = JSON.encode({
        playmatBounds = matBounds,
        objects = objectsPayload,
        shelfTemplates = shelfTemplates,
        obstacles = obstacles,
        raycastBlockedGuidPairs = raycastBlockedGuidPairs
    })
    WebRequest.custom(BRIDGE_URL .. "/tts/telemetry", "POST", true, body, { ["Content-Type"] = "application/json" }, function(res)
        if not res.is_error then
            printToAll("📡 LCT Playmat Synced (" .. #objectsPayload .. " objects, " .. #obstacles .. " walls).", {0.4, 0.95, 0.7})
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
        elseif cmd.action == "DEEP_STRIKE_DROP" then
            executeDeepStrikeDrop(cmd)
        elseif cmd.action == "FALLBACK_INGRESS_TO_SPAWN" then
            executeFallbackIngressToSpawn(cmd)
        elseif cmd.action == "CLEAR_DEEP_STRUCK" then
            clearDeepStruckTags()
            pushBoardTelemetry()
        elseif cmd.action == "DISEMBARK_CARGO" then
            executeDisembarkCargo(cmd)
        elseif cmd.action == "REVERT_MOVE" then
            executeRevertMove(cmd)
        elseif cmd.action == "SPAWN_GHOST_RING" then
            spawnGhostRing(cmd)
        elseif cmd.action == "SET_UNIT_SIDE" then
            executeSetUnitSide(cmd)
        end
    end)
end

-- Dynamically measures the 3D bounding box of LCT's Red (x < 0) or Blue (x > 0) Dice Mat starfield zone
function detectDiceMatBounds(matSide)
    local wantBlue = (string.upper(matSide or "RED") == "BLUE")
    local playmat = detectPlaymatBounds()
    for _, obj in ipairs(getAllObjects()) do
        local p = obj.getPosition()
        local outOfPlaymat = p.x < playmat.minX or p.x > playmat.maxX
        local rightSide = (wantBlue and p.x > 10) or (not wantBlue and p.x < -10)
        if outOfPlaymat and rightSide then
            local btns = obj.getButtons()
            if btns and #btns >= 5 then
                for _, b in ipairs(btns) do
                    local lbl = string.lower(b.label or "")
                    if string.find(lbl, "roll all") or string.find(lbl, "%+%s*1d6") or string.find(lbl, "ordered roll") then
                        local bnd = obj.getBoundsNormalized()
                        if bnd and bnd.size.x > 3 and bnd.size.z > 3 then
                            local halfX = math.max(1.8, bnd.size.x * 0.5 - 1.2)
                            local halfZ = math.max(2.5, bnd.size.z * 0.5 - 2.2)
                            return {
                                minX = bnd.center.x - halfX, maxX = bnd.center.x + halfX,
                                minZ = bnd.center.z - halfZ, maxZ = bnd.center.z + halfZ,
                                spawnY = bnd.center.y + 2.2
                            }
                        end
                    end
                end
            end
        end
    end
    return wantBlue and LCT_MAT_BOUNDS.BLUE or LCT_MAT_BOUNDS.RED
end

function getDiceInMatBounds(bounds)
    local found = {}
    local pad = 1.2
    for _, obj in ipairs(getAllObjects()) do
        if obj and not obj.isDestroyed() and obj.tag == "Dice" then
            local p = obj.getPosition()
            if p.x >= (bounds.minX - pad) and p.x <= (bounds.maxX + pad)
               and p.z >= (bounds.minZ - pad) and p.z <= (bounds.maxZ + pad) then
                table.insert(found, obj)
            end
        end
    end
    return found
end

-- Spawns physical Die_6_Rounded directly inside LCT's Dice Mat Scripting Zone (zero cross-script button calls)
function executeLctMatRoll(cmd)
    isRollingMat = true
    local side = string.upper(cmd.matSide or "RED")
    local bounds = detectDiceMatBounds(side)
    local count = math.max(1, tonumber(cmd.count) or 1)

    printToAll("🎲 [LCT MAT • " .. (cmd.stage or "ROLL") .. "] " .. (cmd.label or (count .. "D6")), {1, 0.8, 0.25})

    if cmd.clearFirst ~= false then
        for _, d in ipairs(getDiceInMatBounds(bounds)) do
            if d and not d.isDestroyed() then
                destroyObject(d)
            end
        end
    end

    Wait.time(function()
        local spanX = math.max(2.0, bounds.maxX - bounds.minX)
        local centerX = (bounds.minX + bounds.maxX) * 0.5
        local centerZ = (bounds.minZ + bounds.maxZ) * 0.5
        local step = 0.95
        local maxCols = math.max(1, math.min(count, math.floor((spanX - 0.6) / step) + 1))
        local totalRows = math.ceil(count / maxCols)
        local spawnedDice = {}

        for i = 1, count do
            local col = (i - 1) % maxCols
            local row = math.floor((i - 1) / maxCols)
            local px = centerX + (col - (maxCols - 1) * 0.5) * step
            local pz = centerZ + (row - (totalRows - 1) * 0.5) * step
            local die = spawnObject({
                type = "Die_6_Rounded",
                position = { px, bounds.spawnY, pz }
            })
            die.setColorTint(side == "BLUE" and {0.2, 0.5, 1} or {0.9, 0.2, 0.2})
            die.roll()
            table.insert(spawnedDice, die)
        end

        Wait.time(function()
            Wait.condition(function()
                local pips = {}
                for _, d in ipairs(spawnedDice) do
                    if d and not d.isDestroyed() and d.resting then
                        table.insert(pips, d.getValue())
                    end
                end
                if #pips < count then
                    local zoneDice = getDiceInMatBounds(bounds)
                    pips = {}
                    for i = 1, math.min(count, #zoneDice) do
                        local d = zoneDice[i]
                        if d and not d.isDestroyed() and d.resting then
                            table.insert(pips, d.getValue())
                        end
                    end
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
                local aliveSpawned = 0
                local restingSpawned = 0
                for _, d in ipairs(spawnedDice) do
                    if d and not d.isDestroyed() then
                        aliveSpawned = aliveSpawned + 1
                        if d.resting then restingSpawned = restingSpawned + 1 end
                    end
                end
                if aliveSpawned >= count then
                    return restingSpawned >= count
                end
                local active = getDiceInMatBounds(bounds)
                if #active < count then return false end
                for _, d in ipairs(active) do
                    if d.isDestroyed() or not d.resting then return false end
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

-- Finds an off-board (outside detectPlaymatBounds()) or HORDE_TEMPLATE miniature matching templateName for wave cloning
function findShelfTemplateModel(templateName)
    local targetLower = string.lower(templateName or "")
    local matBounds = detectPlaymatBounds()
    for _, obj in ipairs(getAllObjects()) do
        if obj ~= self then
            local p = obj.getPosition()
            local isOffBoard = p.x < matBounds.minX or p.x > matBounds.maxX or p.z < matBounds.minZ or p.z > matBounds.maxZ
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

function clearDeepStruckTags()
    for _, obj in ipairs(getAllObjects()) do
        if obj ~= self and obj.hasTag("DEEP_STRUCK") then
            obj.removeTag("DEEP_STRUCK")
        end
    end
end

function executeSpawnWave(cmd)
    clearDeepStruckTags()
    local offsetGroup = 0
    local prevAttachedGroup = nil
    local anchorByGroup = {}
    for uIdx, u in ipairs(cmd.units or {}) do
        local grpKey = u.attachedGroup or tostring(uIdx)
        if grpKey ~= prevAttachedGroup and prevAttachedGroup ~= nil then
            offsetGroup = offsetGroup + 4.0
        end
        prevAttachedGroup = grpKey

        local tmpl = findShelfTemplateModel(u.templateName)
        local isLeaderFollowup = (anchorByGroup[grpKey] ~= nil)
        local baseAnchorX = anchorByGroup[grpKey] or ((tonumber(cmd.targetX) or 0) + offsetGroup)
        anchorByGroup[grpKey] = baseAnchorX
        local cx = isLeaderFollowup and (baseAnchorX + 1.4) or baseAnchorX
        local cz = isLeaderFollowup and ((tonumber(cmd.targetZ) or 19.5) - 1.2) or (tonumber(cmd.targetZ) or 19.5)
        local waveSquadTag = "SQUAD:WAVE_" .. tostring(cmd.id or cmd.zone or "Z") .. "_" .. tostring(grpKey)

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
                cloned.addTag(waveSquadTag)
                if u.embarkedSpec and tostring(u.embarkedSpec) ~= "" then
                    cloned.addTag("EMBARKED:" .. tostring(u.embarkedSpec))
                end
                cloned.setLock(false)
                if cmd.facingY then cloned.setRotation({ x = 0, y = cmd.facingY, z = 0 }) end
            end
            printToAll("🧟 Spawned " .. count .. "x " .. u.templateName .. " in Zone " .. tostring(cmd.zone), {1, 0.45, 0.45})
        else
            spawnGhostRing({ targetX = cx, targetZ = cz, label = "Missing Shelf Template: " .. tostring(u.count) .. "x " .. tostring(u.templateName) })
        end
    end
    Wait.time(pushBoardTelemetry, 1.5)
end

function executeDisembarkCargo(cmd)
    if cmd.transportGuid then
        local transObj = getObjectFromGUID(cmd.transportGuid)
        if transObj then
            for _, t in ipairs(transObj.getTags()) do
                if string.find(string.upper(t), "^EMBARKED:") then
                    transObj.removeTag(t)
                end
            end
        end
    end

    local cx = tonumber(cmd.targetX) or 0
    local cz = tonumber(cmd.targetZ) or 0
    local sideTag = (string.upper(cmd.side or "HORDE") == "PLAYER") and "PLAYER" or "HORDE"
    local sharedSquadTag = cmd.squadTag or ("SQUAD:DISEMBARK_" .. tostring(cmd.transportGuid or "T1"))
    local modelIdx = 0
    local totalModels = 0
    for _, u in ipairs(cmd.units or {}) do
        totalModels = totalModels + math.max(1, tonumber(u.count) or 1)
    end

    for _, u in ipairs(cmd.units or {}) do
        local tmpl = findShelfTemplateModel(u.templateName)
        local count = math.max(1, tonumber(u.count) or 1)
        if tmpl then
            for _ = 1, count do
                modelIdx = modelIdx + 1
                local ox, oz = 0, 0
                if totalModels > 1 and modelIdx > 1 then
                    local ang = ((modelIdx - 2) / (totalModels - 1)) * (2 * math.pi)
                    local rad = (modelIdx <= 7) and 1.25 or 2.2
                    ox = math.cos(ang) * rad
                    oz = math.sin(ang) * rad
                end
                local y = getSurfaceY(cx + ox, cz + oz, 0.5)
                local cloned = tmpl.clone({ position = { x = cx + ox, y = y + 0.5, z = cz + oz } })
                cloned.removeTag("HORDE_TEMPLATE")
                cloned.removeTag("PLAYER")
                cloned.removeTag("HORDE")
                cloned.addTag(sideTag)
                cloned.addTag(sharedSquadTag)
                cloned.setLock(false)
                if cmd.facingY then cloned.setRotation({ x = 0, y = cmd.facingY, z = 0 }) end
            end
        else
            spawnGhostRing({ targetX = cx, targetZ = cz, label = "Disembark: " .. tostring(count) .. "x " .. tostring(u.templateName) })
        end
    end
    printToAll("🚌 " .. tostring(cmd.summary or "Disembarked passengers within 3\"."), {0.95, 0.8, 0.3})
    Wait.time(pushBoardTelemetry, 1.4)
end

function executeDeepStrikeDrop(cmd)
    local cx = tonumber(cmd.targetX) or 0
    local cz = tonumber(cmd.targetZ) or 0
    local sharedTag = cmd.squadTag or ("SQUAD:DS_" .. tostring(cmd.reserveId or "R1"))
    local totalModels = 0
    for _, u in ipairs(cmd.units or {}) do
        totalModels = totalModels + math.max(1, tonumber(u.count) or 1)
    end
    local modelIdx = 0

    for _, u in ipairs(cmd.units or {}) do
        local tmpl = findShelfTemplateModel(u.templateName)
        local count = math.max(1, tonumber(u.count) or 1)
        if tmpl then
            for _ = 1, count do
                modelIdx = modelIdx + 1
                local ox, oz = 0, 0
                if totalModels > 1 and modelIdx > 1 then
                    local ang = ((modelIdx - 2) / (totalModels - 1)) * (2 * math.pi)
                    local rad = (modelIdx <= 7) and 1.35 or 2.6
                    ox = math.cos(ang) * rad
                    oz = math.sin(ang) * rad
                end
                local y = getSurfaceY(cx + ox, cz + oz, 0.5)
                local cloned = tmpl.clone({ position = { x = cx + ox, y = y + 0.5, z = cz + oz } })
                cloned.removeTag("HORDE_TEMPLATE")
                cloned.addTag("HORDE")
                cloned.addTag("DEEP_STRUCK")
                cloned.addTag(sharedTag)
                cloned.setLock(false)
                if cmd.facingY then cloned.setRotation({ x = 0, y = cmd.facingY, z = 0 }) end
            end
        else
            spawnGhostRing({ targetX = cx, targetZ = cz, label = "Deep Strike: " .. tostring(count) .. "x " .. tostring(u.templateName) })
        end
    end
    local tagLabel = (cmd.mode == "PINCER_MANEUVER") and "PINCER >3\" DROP" or "DEEP STRIKE >8\" DROP"
    printToAll("🪂 [" .. tagLabel .. "] " .. tostring(cmd.unitLabel or "Horde Reserve") .. " @ (" .. cx .. ", " .. cz .. ")", {0.95, 0.55, 1.0})
    Wait.time(pushBoardTelemetry, 1.5)
end

function executeFallbackIngressToSpawn(cmd)
    local targetTag = cmd.squadTag
    if targetTag and targetTag ~= "" then
        for _, obj in ipairs(getAllObjects()) do
            if obj ~= self and obj.hasTag(targetTag) then
                destroyObject(obj)
            end
        end
    end
    local cx = tonumber(cmd.targetX) or 0
    local cz = tonumber(cmd.targetZ) or 19.5
    local fbTag = "SQUAD:WAVE_FB_" .. tostring(cmd.reserveId or "R1")
    local totalModels = 0
    for _, u in ipairs(cmd.units or {}) do
        totalModels = totalModels + math.max(1, tonumber(u.count) or 1)
    end
    local modelIdx = 0
    for _, u in ipairs(cmd.units or {}) do
        local tmpl = findShelfTemplateModel(u.templateName)
        local count = math.max(1, tonumber(u.count) or 1)
        if tmpl then
            for _ = 1, count do
                modelIdx = modelIdx + 1
                local ox, oz = 0, 0
                if totalModels > 1 and modelIdx > 1 then
                    local ang = ((modelIdx - 2) / (totalModels - 1)) * (2 * math.pi)
                    local rad = (modelIdx <= 7) and 1.35 or 2.6
                    ox = math.cos(ang) * rad
                    oz = math.sin(ang) * rad
                end
                local y = getSurfaceY(cx + ox, cz + oz, 0.5)
                local cloned = tmpl.clone({ position = { x = cx + ox, y = y + 0.5, z = cz + oz } })
                cloned.removeTag("HORDE_TEMPLATE")
                cloned.addTag("HORDE")
                cloned.addTag(fbTag)
                cloned.setLock(false)
                if cmd.facingY then cloned.setRotation({ x = 0, y = cmd.facingY, z = 0 }) end
            end
        else
            spawnGhostRing({ targetX = cx, targetZ = cz, label = "Fallback Spawn: " .. tostring(count) .. "x " .. tostring(u.templateName) })
        end
    end
    printToAll("↩️ [INGRESS FALLBACK] " .. tostring(cmd.unitLabel or "Horde Reserve") .. " relocated to Spawn Zone " .. tostring(cmd.zone or 1), {0.95, 0.8, 0.3})
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
