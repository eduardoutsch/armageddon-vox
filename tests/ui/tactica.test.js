/**
 * @fileoverview UI & boundary tests for pages/tactica.html and js/tactica.js LCT mat workflow.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT_DIR = path.resolve(__dirname, '../../');

test('UI Boundary: pages/tactica.html shares suite navigation and steps LCT mat rolls without local RNG', async () => {
  const html = fs.readFileSync(path.join(ROOT_DIR, 'pages/tactica.html'), 'utf8');
  assert.ok(html.includes('href="../index.html" class="suite-link'), 'Must include root index suite-link');
  assert.ok(html.includes('href="briefing.html" class="suite-link'), 'Must include briefing suite-link');
  assert.ok(html.includes('href="spawner.html"'), 'Sticky bar must include href="spawner.html" return button');
  assert.ok(html.includes('id="pttStatusPill"'), 'Sticky bar must include #pttStatusPill');
  assert.ok(html.includes('id="tacticaModeHorde"') && html.includes('id="tacticaModePlayer"') && html.includes('id="tacticaModeExport"'), 'Must include 3-mode progressive panels');
  assert.ok(html.includes('id="quickStratDurationSelect"'), 'Quick Stratagem drawer must include phase vs round duration selector');
  assert.ok(html.includes('id="tacticaBoardDrawer"') && html.includes('id="tacticaChronicleDrawer"'), 'Must include collapsed bottom utility drawers');
  assert.ok(html.includes('<link rel="icon" type="image/svg+xml" href="../assets/favicon.svg">'), 'Must link favicon');
  assert.ok(html.includes('<script src="../js/spawner.js"></script>'), 'Must link spawner.js');
  assert.ok(html.includes('<script src="../js/tts-telemetry-core.js"></script>'), 'Must link tts-telemetry-core.js');
  assert.ok(html.includes('<script src="../js/horde-autopilot-core.js"></script>'), 'Must link horde-autopilot-core.js');
  assert.ok(html.includes('<script src="../js/tactica-core.js"></script>'), 'Must link tactica-core.js');
  assert.ok(html.includes('<script src="../js/tactica.js"></script>'), 'Must link tactica.js');
  assert.ok(html.includes('<script src="../js/tactica-overwatch-core.js"></script>'), 'Must link tactica-overwatch-core.js');
  assert.ok(html.includes('<script src="../js/tactica-overwatch.js"></script>'), 'Must link tactica-overwatch.js');
  assert.ok(html.includes('<script src="../js/vox-audio.js"></script>'), 'Must link vox-audio.js');

  const luaPath = path.join(ROOT_DIR, 'tts/lct_horde_bridge.lua');
  assert.ok(fs.existsSync(luaPath), 'tts/lct_horde_bridge.lua must exist');
  const luaSrc = fs.readFileSync(luaPath, 'utf8');
  assert.ok(luaSrc.includes('/tts/poll'), 'Lua beacon must poll /tts/poll');
  assert.ok(luaSrc.includes('/tts/telemetry'), 'Lua beacon must post to /tts/telemetry');
  assert.ok(luaSrc.includes('/tts/dice-result'), 'Lua beacon must post settled dice to /tts/dice-result');
  assert.ok(luaSrc.includes('SPAWN_WAVE') && luaSrc.includes('REVERT_MOVE') && luaSrc.includes('SPAWN_GHOST_RING'), 'Lua beacon must support SPAWN_WAVE, REVERT_MOVE & SPAWN_GHOST_RING');
  assert.ok(luaSrc.includes('self.setRotation({ x = 0, y = rot.y, z = 0 })'), 'Lua beacon must force upright rotation on load');
  assert.ok(luaSrc.includes('buildContextMenu') && luaSrc.includes('addContextMenuItem') && luaSrc.includes('tagSelectionAsTemplate'), 'Lua beacon must register right-click context menu items including HORDE_TEMPLATE');
  assert.ok(luaSrc.includes('detectPlaymatBounds') && luaSrc.includes('playmatBounds'), 'Lua beacon must auto-detect LCT 44"x60" playmat bounds');
  assert.ok(luaSrc.includes('SET_UNIT_SIDE') && luaSrc.includes('executeSetUnitSide'), 'Lua beacon must support browser-driven SET_UNIT_SIDE command');

  const spawnerHtml = fs.readFileSync(path.join(ROOT_DIR, 'pages/spawner.html'), 'utf8');
  assert.ok(spawnerHtml.includes('tactica.html'), 'spawner.html must link to pages/tactica.html');

  const spawner = require(path.join(ROOT_DIR, 'js/spawner.js'));
  const combat = require(path.join(ROOT_DIR, 'js/horde-combat-modifiers.js'));
  const telemetry = require(path.join(ROOT_DIR, 'js/tts-telemetry-core.js'));
  const autopilot = require(path.join(ROOT_DIR, 'js/horde-autopilot-core.js'));
  const overwatchCore = require(path.join(ROOT_DIR, 'js/tactica-overwatch-core.js'));
  const core = require(path.join(ROOT_DIR, 'js/tactica-core.js'));
  Object.assign(globalThis, spawner, combat, telemetry, autopilot, overwatchCore, core);

  const store = new Map();
  store.set('foa_horde_session_v1', JSON.stringify({
    seed: 'ASHEN-11',
    battleRound: 2,
    activeHordeFactionName: 'Necrons',
    cp: 2,
    sp: 8,
    activeMiseries: []
  }));

  const els = {};
  const makeEl = (val = '') => ({
    value: val,
    checked: false,
    textContent: '',
    innerHTML: '',
    style: {},
    classList: {
      _s: new Set(),
      add(c) { this._s.add(c); },
      remove(c) { this._s.delete(c); },
      toggle(c, f) { if (f === undefined ? !this._s.has(c) : f) this._s.add(c); else this._s.delete(c); },
      contains(c) { return this._s.has(c); }
    }
  });

  [
    'tacticaDaemonBadge', 'tacticaRoomLabel', 'tacticaFactionLabel', 'tacticaRoundSelect',
    'tacticaPhaseSelect', 'tacticaCpLabel', 'tacticaWarlordLabel', 'tacticaQueueLabel',
    'tacticaTelemetryBox', 'tacticaAutopilotBox', 'tacticaReactionBanner', 'tacticaPendingRollBox', 'tacticaManualPipsInput',
    'tacticaChronicleBox', 'tacticaNoteInput', 'defUnitName', 'defSaveInput', 'defInvulnInput',
    'defWpmInput', 'defKeywordsInput', 'defModelsInput', 'defWoundsCountInput', 'defApInput',
    'defDmgInput', 'defInSpawnCheck', 'defResultBox', 'tacticaReportChannel',
    'tacticaOutcomeInput', 'tacticaCompiledPreview',
    'overwatchScreenStatus', 'tacticaIntrusionAlertBox', 'btnToggleOverwatchTts',
    'overwatchQueryInput', 'overwatchVerdictBox', 'tacticaCrusadeExportNotice',
    'pttStatusPill', 'tacticaModeHorde', 'tacticaModePlayer', 'tacticaModeExport',
    'btnTacticaModeHorde', 'btnTacticaModePlayer', 'btnTacticaModeExport',
    'hordeStepPanel1', 'hordeStepPanel2', 'hordeStepPanel3', 'hordeStepPanel4',
    'hordeStepBtn1', 'hordeStepBtn2', 'hordeStepBtn3', 'hordeStepBtn4',
    'tacticaLosBar', 'tacticaHordeTargetChips', 'tacticaUnitCountSummary',
    'tacticaLatestLogSummary', 'tacticaPendingRollStrip', 'quickStratTargetSelect',
    'quickStratNameInput', 'quickStratCategorySelect', 'quickStratCoreSelect', 'quickStratDurationSelect'
  ].forEach(id => { els[id] = makeEl(); });

  els.defUnitName.value = 'Necron Warriors';
  els.defSaveInput.value = '4';
  els.defWpmInput.value = '1';
  els.defKeywordsInput.value = 'INFANTRY';
  els.defModelsInput.value = '10';
  els.defWoundsCountInput.value = '2';
  els.defApInput.value = '0';
  els.defDmgInput.value = '1';
  els.tacticaReportChannel.value = 'alpha';
  els.tacticaRoundSelect.value = '2';

  let voxQueued = null;
  let tacticaApexSirens = 0;
  let tacticaMidAlerts = 0;
  globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v))
  };
  globalThis.document = { getElementById: (id) => els[id] || null };
  globalThis.window = {
    addEventListener: () => {},
    VoxAudio: {
      playClank: () => {},
      playWarpSiren: () => { tacticaApexSirens++; },
      playUnboundBreachAlert: () => { tacticaMidAlerts++; },
      transmitToVox: (chan, text) => { voxQueued = { chan, text }; }
    }
  };
  globalThis.fetch = async () => { throw new Error('Offline'); };

  const tactica = require(path.join(ROOT_DIR, 'js/tactica.js'));
  const overwatch = require(path.join(ROOT_DIR, 'js/tactica-overwatch.js'));
  await tactica.syncFromSpawnerStorage();
  await tactica.refreshDaemonState();
  assert.ok(els.tacticaDaemonBadge.textContent.includes('OFFLINE'));

  // Reaction window & manual note offline fallback
  await tactica.setConsolePhaseAndTrigger('HORDE_MOVEMENT', 'END_OF_HORDE_MOVEMENT');
  assert.equal(els.tacticaReactionBanner.classList.contains('hidden'), false);
  await tactica.resolveConsoleReaction('FIRE_OVERWATCH', 1);
  assert.equal(els.tacticaReactionBanner.classList.contains('hidden'), true);

  els.tacticaNoteInput.value = 'Krieg squad held Eastern Bastion.';
  await tactica.appendConsoleNote();
  assert.ok(els.tacticaChronicleBox.innerHTML.includes('Eastern Bastion'));

  // Queue Auto-Defender -> pauses awaiting 2D6 Saves on LCT mat (does NOT roll in JS!)
  await tactica.queueConsoleAutoDefender();
  assert.ok(els.tacticaPendingRollBox.innerHTML.includes('SAVES'), 'Must display pending SAVES stage for LCT mat');

  // Feed settled pips [2, 5] -> 1 fail triggers FNP stage (5+)
  els.tacticaManualPipsInput.value = '2, 5';
  await tactica.submitSettledMatPips();
  assert.ok(els.tacticaPendingRollBox.innerHTML.includes('FNP'), 'Must advance to FNP stage');

  // Feed settled FNP pip [6] -> shrugged! Sequence completes with 0 slain
  els.tacticaManualPipsInput.value = '6';
  await tactica.submitSettledMatPips();
  assert.ok(els.defResultBox.innerHTML.includes('Slain: <strong style="color:var(--red);">0</strong>'));

  await tactica.compileAndPreviewMatchReport();
  tactica.sendCompiledReportToVox();
  assert.ok(voxQueued && voxQueued.text.includes('ASHEN-11'));

  // One-click Orbital Auspex Telemetry -> Auto-Defender population & Autopilot Move + LOS Revert
  tactica.getTacticaClientState().boardTelemetry = {
    objectives: [],
    units: [
      {
        squadKey: 'HORDE::Skorpekh',
        name: 'Skorpekh Destroyers',
        side: 'HORDE',
        modelCount: 3,
        move: 8,
        save: 3,
        invuln: 0,
        woundsPerModel: 3,
        pos: { x: 0, z: 14 },
        keywords: ['INFANTRY'],
        weapons: [{ name: 'Gauss Blaster', type: 'ranged', rangeInches: 24, attacks: 2, skill: 3, strength: 5, ap: -2, damage: 2, keywords: [] }],
        inSpawnZone: true,
        models: [{ guid: 'sk1', pos: { x: 0, y: 1.1, z: 14 }, radiusInches: 0.98 }]
      },
      {
        squadKey: 'PLAYER::Cadians',
        name: 'Cadian Shock Troops',
        side: 'PLAYER',
        modelCount: 10,
        toughness: 3,
        pos: { x: 0, z: 4 },
        keywords: ['INFANTRY'],
        models: [{ guid: 'cd1', pos: { x: 0, y: 1.1, z: 4 }, radiusInches: 0.55 }]
      }
    ]
  };
  tactica.getTacticaClientState().zoneSpawns = [
    { zone: 1, bracketKey: '5-6', units: ['10 Necron Warriors'] }
  ];
  await tactica.requestTtsBoardScan();
  assert.ok(els.tacticaTelemetryBox.innerHTML.includes('Skorpekh Destroyers'));
  assert.ok(
    els.tacticaTelemetryBox.innerHTML.includes('onclick="toggleTelemetryUnitSide(0)"') &&
    els.tacticaTelemetryBox.innerHTML.includes('⇄ Flip Side'),
    'Each telemetry row must render a 1-click ⇄ Flip Side button'
  );
  tactica.selectTelemetryUnitForDefense(0);
  assert.equal(els.defUnitName.value, 'Skorpekh Destroyers');
  assert.equal(els.defInSpawnCheck.checked, true);

  // Flip unit side HORDE -> PLAYER and back PLAYER -> HORDE
  await tactica.toggleTelemetryUnitSide(0);
  assert.equal(tactica.getTacticaClientState().boardTelemetry.units[0].side, 'PLAYER');
  await tactica.toggleTelemetryUnitSide(0);
  assert.equal(tactica.getTacticaClientState().boardTelemetry.units[0].side, 'HORDE');

  await tactica.triggerAutopilotSpawnWaves();
  assert.ok(els.tacticaAutopilotBox.innerHTML.includes('Queued 1 Spawn Zone wave drop'));

  await tactica.triggerAutopilotMovement();
  assert.ok(els.tacticaAutopilotBox.innerHTML.includes('Revert Move (No LOS)'));
  await tactica.revertAutopilotSquadMove(0);
  assert.ok(els.tacticaAutopilotBox.innerHTML.includes('Reverted'));

  await tactica.triggerAutopilotShooting();
  assert.ok(els.tacticaAutopilotBox.innerHTML.includes('Roll Attack on LCT Mat'));
  await tactica.fireAutopilotWeaponOnMat(0);
  assert.ok(els.tacticaPendingRollBox.innerHTML.includes('HITS'));
  tactica.getTacticaClientState().pendingDiceSequence = null;

  await tactica.triggerAutopilotCharges();
  assert.ok(els.tacticaPendingRollBox.innerHTML.includes('CHARGE_ROLL'));
  els.tacticaManualPipsInput.value = '5, 6';
  await tactica.submitSettledMatPips();
  assert.equal(tactica.getTacticaClientState().pendingChargeDecl, null);

  await tactica.triggerAutopilotConsolidate();
  assert.ok(els.tacticaAutopilotBox.innerHTML.includes('Skorpekh Destroyers'));

  // Step 6 Overwatch voice command dispatch, 6+ Intrusion Vox ping & Mode 5 Crusade export
  await tactica.setConsolePhaseAndTrigger('HORDE_MOVEMENT', 'END_OF_HORDE_MOVEMENT');
  assert.equal(els.tacticaReactionBanner.classList.contains('hidden'), false);
  await overwatch.dispatchSpokenOrTypedCommand('Pass window and hold CP');
  assert.equal(els.tacticaReactionBanner.classList.contains('hidden'), true);

  tactica.getTacticaClientState().zoneSpawns = [
    { zone: 2, waveId: 't_mid_1', bracketKey: '10-12', bracketLabel: 'Bracket [10–12]', intrusionRoll: 6, units: ['3 Skorpekh Destroyers'] }
  ];
  overwatch.syncOverwatchAlertsFromState();
  assert.equal(els.tacticaIntrusionAlertBox.classList.contains('hidden'), false);
  assert.equal(tacticaMidAlerts, 1, 'Tactica [10-12] 6+ breach must play playUnboundBreachAlert');
  assert.equal(tacticaApexSirens, 0, 'Tactica [10-12] 6+ breach must NOT play [13+] playWarpSiren');

  tactica.getTacticaClientState().zoneSpawns = [
    { zone: 1, waveId: 't_apex_1', bracketKey: '13+', bracketLabel: 'Bracket [13+]', intrusionRoll: 6, units: ['1 Monolith'] }
  ];
  overwatch.syncOverwatchAlertsFromState();
  assert.equal(els.tacticaIntrusionAlertBox.classList.contains('hidden'), false);
  assert.equal(tacticaApexSirens, 1, 'Tactica [13+] 6+ breach must play terrifying playWarpSiren');
  assert.equal(tacticaMidAlerts, 1, 'Tactica [13+] 6+ breach must not increment playUnboundBreachAlert');
  overwatch.pingIntrusionFromTactica(1, 'Bracket [13+]', 'alpha');
  assert.ok(voxQueued && voxQueued.chan === 'alpha' && voxQueued.text.includes('EMERGENCY AUSPEX PING'));

  const crusadeSnap = overwatch.exportTacticaToCrusade();
  assert.ok(crusadeSnap && crusadeSnap.roomSeed === 'ASHEN-11');
  assert.ok(store.has('foa_horde_battle_stats_v1'), 'Must write foa_horde_battle_stats_v1 to localStorage');
  assert.equal(els.tacticaCrusadeExportNotice.classList.contains('hidden'), false);

  assert.equal(overwatch.toggleOverwatchVoiceOutput(), false);
  assert.equal(els.btnToggleOverwatchTts.textContent.includes('MUTE'), true);
  assert.equal(overwatch.startPushToTalkMic(), false);
  assert.equal(await overwatch.toggleTtsScreenCapture(), false);
  await overwatch.dispatchSpokenOrTypedCommand('Can Skorpekh see Cadians behind central ruin?');
  assert.ok(els.overwatchVerdictBox.innerHTML.includes('offline'));

  // 3-Mode Progressive Switcher & Guided 4-Step Horde Sub-Bar
  assert.equal(typeof tactica.switchTacticaMode, 'function');
  tactica.switchTacticaMode('player');
  assert.equal(els.tacticaModeHorde.classList.contains('hidden'), true, 'switchTacticaMode("player") must hide #tacticaModeHorde');
  assert.equal(els.tacticaModePlayer.classList.contains('hidden'), false, 'switchTacticaMode("player") must reveal #tacticaModePlayer');
  assert.equal(els.tacticaModeExport.classList.contains('hidden'), true);

  tactica.switchTacticaMode('export');
  assert.equal(els.tacticaModePlayer.classList.contains('hidden'), true);
  assert.equal(els.tacticaModeExport.classList.contains('hidden'), false);

  tactica.switchTacticaMode('horde');
  tactica.setHordeTurnStep(1);
  assert.equal(els.tacticaLosBar.classList.contains('hidden'), true, 'LOS bar stays tucked in Step 1 (Spawn)');
  tactica.setHordeTurnStep(2);
  assert.equal(els.tacticaLosBar.classList.contains('hidden'), false, 'LOS bar reveals in Step 2 (Move & LOS)');

  // Hold-[Space] / [V] Push-to-Talk Hotkey (ignores INPUT/TEXTAREA/SELECT)
  let spacePrevented = false;
  overwatch.handlePttKeyDown({ code: 'Space', preventDefault: () => { spacePrevented = true; }, target: { tagName: 'INPUT' } });
  assert.equal(spacePrevented, false, 'handlePttKeyDown must ignore editable INPUT targets');
  assert.equal(els.pttStatusPill.classList.contains('ptt-active'), false);

  overwatch.handlePttKeyDown({ code: 'Space', preventDefault: () => { spacePrevented = true; }, target: { tagName: 'BODY' } });
  assert.equal(spacePrevented, true, 'handlePttKeyDown must activate PTT on BODY');
  assert.equal(els.pttStatusPill.classList.contains('ptt-active'), true);
  overwatch.handlePttKeyUp({ code: 'Space' });
  assert.equal(els.pttStatusPill.classList.contains('ptt-active'), false);

  // Spoken Player Stratagem fuzzy-matching & Mode 1 session sync
  tactica.getTacticaClientState().playerCp = 3;
  tactica.getTacticaClientState().boardTelemetry.units.push({
    squadKey: 'PLAYER::Einhyr Hearthguard',
    name: 'Einhyr Hearthguard',
    side: 'PLAYER',
    modelCount: 5,
    save: 2
  });
  await overwatch.dispatchSpokenOrTypedCommand('Stratagem Void Armour on Hearthguard, one CP');
  assert.equal(tactica.getTacticaClientState().playerCp, 2, 'Vocal stratagem must deduct 1 CP');
  assert.ok(els.tacticaChronicleBox.innerHTML.includes('Void Armour on Einhyr Hearthguard'), 'Must fuzzy-match scanned PLAYER unit name into chronicle');
  const syncedSession = JSON.parse(store.get('foa_horde_session_v1'));
  assert.equal(syncedSession.cp, 2, 'Updated CP must deduct 1 CP into foa_horde_session_v1');
  assert.equal(syncedSession.stratCount, 1, '1+ CP Stratagem must increment stratCount for Secret #20');

  // Vocal Smokescreen (-1 to Hit, PHASE default) worsens Horde LCT Mat Hit threshold (3+ -> 4+)
  // during HORDE_SHOOTING, then expires immediately in the SAME Round when advancing to HORDE_CHARGE!
  tactica.getTacticaClientState().playerCp = 3;
  tactica.getTacticaClientState().boardTelemetry.units = [
    {
      squadKey: 'HORDE::Armiger Helverin',
      name: 'Armiger Helverin',
      side: 'HORDE',
      modelCount: 1,
      pos: { x: 0, z: 12 },
      models: [{ guid: 'helv1', pos: { x: 0, z: 12 }, radiusInches: 1.95 }],
      weapons: [{ name: 'Armiger autocannon', type: 'ranged', rangeInches: 48, attacks: 4, skill: 3, strength: 9, ap: -1, damage: 3, keywords: [] }]
    },
    {
      squadKey: 'PLAYER::Einhyr Hearthguard',
      name: 'Einhyr Hearthguard',
      side: 'PLAYER',
      modelCount: 5,
      toughness: 6,
      save: 2,
      pos: { x: 0, z: -4 },
      models: [{ guid: 'hg1', pos: { x: 0, z: -4 }, radiusInches: 0.78 }]
    }
  ];
  await tactica.setConsolePhaseAndTrigger('HORDE_MOVEMENT');
  await overwatch.dispatchSpokenOrTypedCommand('Smokescreen on Hearthguard - 1cp');
  await tactica.triggerAutopilotShooting();
  const smokeSeq = await tactica.fireAutopilotWeaponOnMat(0);
  assert.ok(smokeSeq && smokeSeq.nextCommand, 'Must queue LCT mat Hit roll for Armiger Helverin -> Einhyr Hearthguard');
  assert.equal(smokeSeq.nextCommand.threshold, 4, 'Smokescreen (-1 to Hit) must worsen Armiger Helverin BS 3+ to 4+ on LCT mat');
  tactica.getTacticaClientState().pendingDiceSequence = null;

  // Advancing to HORDE_CHARGE in the SAME Round 2 must expire PHASE-scoped Smokescreen immediately!
  await tactica.setConsolePhaseAndTrigger('HORDE_CHARGE');
  assert.equal(
    (tactica.getTacticaClientState().activePlayerBuffs || []).length,
    0,
    '99% PHASE-scoped Smokescreen must expire as soon as HORDE_SHOOTING ends (entering HORDE_CHARGE in same round)'
  );

  // Round-oriented ("until next shooting phase") -1 to Hit buff declared in Round 2 PLAYER_TURN
  // must survive into Round 3 HORDE_SHOOTING (4+) and expire when Round 3 reaches PLAYER_TURN!
  await tactica.setConsolePhaseAndTrigger('PLAYER_TURN');
  await overwatch.dispatchSpokenOrTypedCommand('Smokescreen on Hearthguard until next shooting phase - 1cp');
  assert.equal((tactica.getTacticaClientState().activePlayerBuffs || []).length, 1);

  els.tacticaRoundSelect.value = '3';
  await tactica.setConsolePhaseAndTrigger('COMMAND_SPAWN');
  assert.equal(
    (tactica.getTacticaClientState().activePlayerBuffs || []).length,
    1,
    'ROUND-scoped ("until next shooting phase") buff declared in R2 PLAYER_TURN must survive advancing into Round 3'
  );
  await tactica.triggerAutopilotShooting();
  const r3ProtectedSeq = await tactica.fireAutopilotWeaponOnMat(0);
  assert.equal(r3ProtectedSeq.nextCommand.threshold, 4, 'Round-scoped buff from R2 PLAYER_TURN must worsen R3 Horde Shooting from 3+ to 4+');
  tactica.getTacticaClientState().pendingDiceSequence = null;

  // Entering Round 3 PLAYER_TURN expires the "until next shooting phase" buff so subsequent shooting returns to 3+
  await tactica.setConsolePhaseAndTrigger('PLAYER_TURN');
  assert.equal(
    (tactica.getTacticaClientState().activePlayerBuffs || []).length,
    0,
    'ROUND-scoped ("until next shooting phase") buff must expire once Round 3 enters PLAYER_TURN'
  );
  await tactica.triggerAutopilotShooting();
  const freshRoundSeq = await tactica.fireAutopilotWeaponOnMat(0);
  assert.equal(freshRoundSeq.nextCommand.threshold, 3, 'After Round 3 PLAYER_TURN expires buff, BS 3+ must roll 3+ on LCT mat');

  delete globalThis.localStorage;
  delete globalThis.document;
  delete globalThis.window;
  delete globalThis.fetch;
});

