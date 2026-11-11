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


