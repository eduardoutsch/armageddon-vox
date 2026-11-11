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

