# 📦 Fires of Armageddon // Bundle: UI Tests (In-Match LCT Tactical Console)

Boundary, MVVM Humble View, Step 2 Projected Sightlines, In-Place Undo Move, Step 2/3 Cover (-1 Hit) Toggle, and Step 3 LOS Re-Pick UI tests (`tests/ui/tactica.test.js`).

## 📑 Table of Contents
- [tests/ui/tactica.test.js](#file-testsuitacticatestjs)

---

## File: `tests/ui/tactica.test.js` <a id="file-testsuitacticatestjs"></a>

````javascript
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
  assert.ok(html.includes('id="tacticaReservesStrip" class="card hidden"'), 'Section 2 pop-up strip must include hidden #tacticaReservesStrip');
  assert.ok(html.includes('id="tacticaModeHorde"') && html.includes('id="tacticaModePlayer"') && html.includes('id="tacticaModeExport"'), 'Must include 3-mode progressive panels');
  assert.ok(html.includes('id="quickStratDurationSelect"'), 'Quick Stratagem drawer must include phase vs round duration selector');
  assert.ok(html.includes('id="tacticaBoardDrawer"') && html.includes('id="tacticaChronicleDrawer"'), 'Must include collapsed bottom utility drawers');
  assert.ok(html.includes('<link rel="icon" type="image/svg+xml" href="../assets/favicon.svg">'), 'Must link favicon');
  assert.ok(html.includes('<script src="../js/spawner.js"></script>'), 'Must link spawner.js');
  assert.ok(html.includes('<script src="../js/tts-telemetry-core.js"></script>'), 'Must link tts-telemetry-core.js');
  assert.ok(html.includes('<script src="../js/horde-deepstrike-core.js"></script>'), 'Must link horde-deepstrike-core.js');
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
  assert.ok(luaSrc.includes('linkSelectionAsSquad') && luaSrc.includes('SQUAD:WAVE_') && luaSrc.includes('colorTint'), 'Lua beacon must stamp SQUAD tags on waves/manual links and export colorTint');
  assert.ok(luaSrc.includes('DISEMBARK_CARGO') && luaSrc.includes('EMBARKED:'), 'Lua beacon must support EMBARKED cargo tags and DISEMBARK_CARGO 3" drop');
  assert.ok(luaSrc.includes('DEEP_STRIKE_DROP') && luaSrc.includes('shelfTemplates'), 'Lua beacon must export shelfTemplates and execute DEEP_STRIKE_DROP');
  assert.ok(luaSrc.includes('FALLBACK_INGRESS_TO_SPAWN') && luaSrc.includes('executeFallbackIngressToSpawn'), 'Lua beacon must support FALLBACK_INGRESS_TO_SPAWN ruin-block fallback');
  assert.ok(luaSrc.includes('detectDiceMatBounds') && luaSrc.includes('LCT_MAT_BOUNDS'), 'Lua beacon must dynamically detect Red/Blue LCT Dice Mat bounds with accurate ±24.2..±28.8 fallback');
  assert.equal(luaSrc.includes('matObj.call'), false, 'Lua beacon must NEVER invoke matObj.call cross-script button callbacks');
  assert.equal(luaSrc.includes('clickMatButtonMatching'), false, 'Lua beacon must remove clickMatButtonMatching');
  assert.ok(luaSrc.includes('isDestroyed()') && luaSrc.includes('raycastBlockedGuidPairs') && luaSrc.includes('obstacles'), 'Lua beacon must guard isDestroyed() and export 3D raycastBlockedGuidPairs + obstacles');
  assert.ok(html.includes('id="hordePrevStepBtn"') && html.includes('id="hordeNextStepBtn"'), 'Step bar must include ← Prev Step and Next Step → navigation buttons');

  const spawnerHtml = fs.readFileSync(path.join(ROOT_DIR, 'pages/spawner.html'), 'utf8');
  assert.ok(spawnerHtml.includes('tactica.html'), 'spawner.html must link to pages/tactica.html');

  const spawner = require(path.join(ROOT_DIR, 'js/spawner.js'));
  const combat = require(path.join(ROOT_DIR, 'js/horde-combat-modifiers.js'));
  const telemetry = require(path.join(ROOT_DIR, 'js/tts-telemetry-core.js'));
  const deepStrike = require(path.join(ROOT_DIR, 'js/horde-deepstrike-core.js'));
  const autopilot = require(path.join(ROOT_DIR, 'js/horde-autopilot-core.js'));
  const overwatchCore = require(path.join(ROOT_DIR, 'js/tactica-overwatch-core.js'));
  const core = require(path.join(ROOT_DIR, 'js/tactica-core.js'));
  Object.assign(globalThis, spawner, combat, telemetry, deepStrike, autopilot, overwatchCore, core);

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
    'hordePrevStepBtn', 'hordeNextStepBtn',
    'tacticaLosBar', 'tacticaHordeTargetChips', 'tacticaUnitCountSummary',
    'tacticaLatestLogSummary', 'tacticaPendingRollStrip', 'tacticaReservesStrip', 'quickStratTargetSelect',
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
  assert.ok(els.tacticaAutopilotBox.innerHTML.includes('Undo Move'));
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
  tactica.getTacticaClientState().pendingDiceSequence = null;

  // MVVM Humble View: Embarked Transport badge + 1-click Disembark (3") action
  tactica.getTacticaClientState().boardTelemetry.units = [
    {
      squadKey: 'HORDE::Corvus Blackstar',
      guid: 'corvus-mvvm-1',
      name: 'Corvus Blackstar',
      side: 'HORDE',
      modelCount: 1,
      save: 3,
      pos: { x: 4, z: 14 },
      models: [{ guid: 'corvus-mvvm-1', pos: { x: 4, z: 14 }, radiusInches: 2.0 }],
      embarkedCargo: [
        { count: 5, templateName: 'Kill Team' },
        { count: 1, templateName: 'Watch Master' }
      ],
      embarkedSummary: '5x Kill Team + 1x Watch Master'
    }
  ];
  await tactica.refreshDaemonState();
  assert.ok(
    els.tacticaTelemetryBox.innerHTML.includes('🚌 Embarked: 5x Kill Team + 1x Watch Master'),
    'Humble View must render Embarked cargo summary from ViewModel'
  );
  assert.ok(
    els.tacticaTelemetryBox.innerHTML.includes('disembarkTelemetryTransport(0)'),
    'Humble View must expose 1-click Disembark button when canDisembark is true'
  );
  assert.equal(typeof tactica.disembarkTelemetryTransport, 'function');
  const disembarkRes = await tactica.disembarkTelemetryTransport(0);
  assert.ok(disembarkRes && disembarkRes.action === 'DISEMBARK_CARGO');
  assert.deepEqual(tactica.getTacticaClientState().boardTelemetry.units[0].embarkedCargo, []);
  assert.equal(
    els.tacticaTelemetryBox.innerHTML.includes('disembarkTelemetryTransport(0)'),
    false,
    'Disembark button must disappear once cargo has disembarked'
  );
  assert.ok(els.tacticaChronicleBox.innerHTML.includes('Disembarked 5x Kill Team + 1x Watch Master'));

  // Round 2 Deep Strike Reserves Strip, Step 2 Button Badge, Empty-Board Ingress Guard, 1-Click Ruin Fallback & DEEP_STRUCK Telemetry Badge
  assert.equal(els.tacticaReservesStrip.classList.contains('hidden'), true, '#tacticaReservesStrip must stay hidden when hordeReserves is empty');
  assert.equal(els.hordeStepBtn2.textContent, '2. Move & LOS');

  tactica.getTacticaClientState().battleRound = 2;
  tactica.getTacticaClientState().zoneSpawns = [
    { zone: 1, bracketKey: '7-9', units: ['5 Terminator Squad'] }
  ];
  // Empty Horde board (zero Horde units -> plans.length === 0) while 1 Player unit is on board
  tactica.getTacticaClientState().boardTelemetry.units = [
    {
      squadKey: 'PLAYER::Hearthkyn Warriors',
      name: 'Hearthkyn Warriors',
      side: 'PLAYER',
      modelCount: 5,
      pos: { x: 0, z: -14 },
      models: [{ guid: 'hk-ds-1', pos: { x: 0, z: -14 }, radiusInches: 0.55 }]
    }
  ];
  await tactica.triggerAutopilotSpawnWaves();
  assert.equal((tactica.getTacticaClientState().hordeReserves || []).length, 1);
  assert.equal(els.tacticaReservesStrip.classList.contains('hidden'), false, '#tacticaReservesStrip must reveal while hordeReserves > 0');
  assert.ok(
    els.tacticaReservesStrip.innerHTML.includes('Holding in Deep Strike Reserves (Drops in Step 2):') &&
    els.tacticaReservesStrip.innerHTML.includes('5x Terminator Squad (&gt;8")'),
    '#tacticaReservesStrip must list queued Deep Strike reserve units'
  );
  assert.equal(els.hordeStepBtn2.textContent, '2. Move & Ingress (1 🪂)');

  await tactica.triggerAutopilotMovement();
  assert.equal(els.tacticaReservesStrip.classList.contains('hidden'), true, '#tacticaReservesStrip must hide again once Step 2 drops reserves');
  assert.equal(els.hordeStepBtn2.textContent, '2. Move & LOS');
  assert.equal(
    els.tacticaAutopilotBox.innerHTML.includes('No eligible Horde movement vectors found on board'),
    false,
    'Empty-Board Ingress Guard: must NOT display empty movement message when ingressDrops.length > 0'
  );
  assert.ok(
    els.tacticaAutopilotBox.innerHTML.includes('Deep Strike Ingress') &&
    els.tacticaAutopilotBox.innerHTML.includes('Terminator Squad') &&
    els.tacticaAutopilotBox.innerHTML.includes('fallbackAutopilotIngressDrop(0)') &&
    els.tacticaAutopilotBox.innerHTML.includes('Fire Overwatch (1 CP)'),
    'Step 2 Movement must render Deep Strike Ingress drop coordinates, 1-click Fallback to Spawn Zone button, and Fire Overwatch (1 CP) reminder'
  );
  assert.equal((tactica.getTacticaClientState().hordeReserves || []).length, 0);

  // Trigger 1-click Fallback to Spawn Zone (e.g. unscanned 3D ruin mesh physically blocks (X, Z))
  assert.equal(typeof tactica.fallbackAutopilotIngressDrop, 'function');
  const fbRes = await tactica.fallbackAutopilotIngressDrop(0);
  assert.ok(fbRes && fbRes.action === 'FALLBACK_INGRESS_TO_SPAWN');
  assert.ok(els.tacticaAutopilotBox.innerHTML.includes('Spawn Zone 1'));

  // Scanned DEEP_STRUCK unit displays purple 🪂 Deep Struck badge in #tacticaTelemetryBox
  tactica.getTacticaClientState().boardTelemetry.units.push({
    squadKey: 'HORDE::Terminator Squad',
    name: 'Terminator Squad',
    side: 'HORDE',
    modelCount: 5,
    save: 2,
    invuln: 4,
    didIngressThisTurn: true
  });
  await tactica.refreshDaemonState();
  assert.ok(
    els.tacticaTelemetryBox.innerHTML.includes('badge purple') &&
    els.tacticaTelemetryBox.innerHTML.includes('🪂 Deep Struck'),
    '#tacticaTelemetryBox must render purple 🪂 Deep Struck badge for units with didIngressThisTurn'
  );

  // Step Navigation (← Prev Step / Next Step →) + Multi-Squad Step 2 Sightlines, In-Place Undo Move, and Step 3 🚫 No LOS Re-Pick
  tactica.setHordeTurnStep(2);
  assert.equal(typeof tactica.stepHordeTurn, 'function');
  assert.equal(tactica.stepHordeTurn(-1), 1, 'stepHordeTurn(-1) must step back from 2 to 1');
  assert.equal(tactica.stepHordeTurn(1), 2, 'stepHordeTurn(1) must step forward from 1 to 2');

  tactica.getTacticaClientState().losBlockedPairs = [];
  tactica.getTacticaClientState().losAllowedPairs = [];
  tactica.getTacticaClientState().phaseOriginSnapshots = {};
  tactica.getTacticaClientState().boardTelemetry = {
    playmatBounds: { minX: -22, maxX: 22, minZ: -30, maxZ: 30 },
    obstacles: [{ name: 'Shipping Container', minX: -4, maxX: 4, minZ: 1.5, maxZ: 3.5, heightY: 3.0, solid: true }],
    autoBlockedLosPairs: ['HORDE::Armiger Warglaive->PLAYER::Kapricus Defender'],
    objectives: [],
    units: [
      {
        squadKey: 'HORDE::Armiger Warglaive',
        name: 'Armiger Warglaive',
        side: 'HORDE',
        modelCount: 1,
        move: 12,
        save: 3,
        pos: { x: 0, z: 14 },
        keywords: ['VEHICLE', 'WALKER'],
        models: [{ guid: 'wg-1', pos: { x: 0, y: 1.5, z: 14 }, radiusInches: 1.97 }],
        weapons: [{ name: 'Thermal spear', type: 'ranged', rangeInches: 24, attacks: 2, skill: 3, strength: 12, ap: -4, damage: 'D6', keywords: ['MELTA 4'] }]
      },
      {
        squadKey: 'HORDE::Armiger Helverin',
        name: 'Armiger Helverin',
        side: 'HORDE',
        modelCount: 1,
        move: 12,
        save: 3,
        pos: { x: 10, z: 14 },
        keywords: ['VEHICLE', 'WALKER'],
        models: [{ guid: 'hv-1', pos: { x: 10, y: 1.5, z: 14 }, radiusInches: 1.97 }],
        weapons: [{ name: 'Armiger autocannon', type: 'ranged', rangeInches: 48, attacks: 4, skill: 3, strength: 9, ap: -1, damage: 3, keywords: [] }]
      },
      {
        squadKey: 'PLAYER::Kapricus Defender',
        name: 'Kapricus Defender',
        side: 'PLAYER',
        modelCount: 1,
        toughness: 9,
        save: 3,
        pos: { x: 0, z: -4 },
        keywords: ['VEHICLE'],
        models: [{ guid: 'kp-1', pos: { x: 0, y: 1.5, z: -4 }, radiusInches: 1.8 }]
      },
      {
        squadKey: 'PLAYER::Hernkyn Yaegirs',
        name: 'Hernkyn Yaegirs',
        side: 'PLAYER',
        modelCount: 10,
        toughness: 4,
        save: 5,
        pos: { x: 12, z: 4 },
        keywords: ['INFANTRY'],
        models: [{ guid: 'yg-1', pos: { x: 12, y: 1.1, z: 4 }, radiusInches: 0.55 }]
      }
    ]
  };

  await tactica.triggerAutopilotMovement();
  assert.ok(
    els.tacticaAutopilotBox.innerHTML.includes('Armiger Warglaive') &&
    els.tacticaAutopilotBox.innerHTML.includes('Armiger Helverin'),
    'Step 2 must render both moved Horde squads'
  );
  assert.ok(
    els.tacticaAutopilotBox.innerHTML.includes('blockShootingSightline(') &&
    els.tacticaAutopilotBox.innerHTML.includes('allowShootingSightline('),
    'Step 2 must render clear sightline [🚫 No LOS] and blocked wall sightline [👁️ Allow LOS] buttons right under move rows'
  );
  assert.ok(
    els.tacticaTelemetryBox.innerHTML.includes('undoSquadMoveByKey('),
    'Bottom Scanned Board Units drawer must render [↩️ Undo Move] for Horde squads with a stored round origin snapshot'
  );

  // Clicking Undo Move on Squad #1 marks Squad #1 REVERTED in-place while keeping Squad #2 and its buttons visible!
  await tactica.revertAutopilotSquadMove(0);
  assert.ok(
    els.tacticaAutopilotBox.innerHTML.includes('Armiger Warglaive') &&
    els.tacticaAutopilotBox.innerHTML.includes('REVERTED') &&
    els.tacticaAutopilotBox.innerHTML.includes('Armiger Helverin') &&
    els.tacticaAutopilotBox.innerHTML.includes('revertAutopilotSquadMove(1)'),
    'revertAutopilotSquadMove(0) must keep Squad #2 row and Undo button visible in #tacticaAutopilotBox'
  );

  // Step 3 renders [🚫 No LOS (Re-pick)] + [↩️ Undo Move] alongside [🎲 Roll Attack on LCT Mat]
  await tactica.triggerAutopilotShooting();
  assert.ok(
    els.tacticaAutopilotBox.innerHTML.includes('blockShootingSightline(') &&
    els.tacticaAutopilotBox.innerHTML.includes('No LOS (Re-pick)') &&
    els.tacticaAutopilotBox.innerHTML.includes('undoSquadMoveByKey('),
    'Step 3 must render [🚫 No LOS (Re-pick)] and [↩️ Undo Move] beside [🎲 Roll Attack on LCT Mat]'
  );

  // Clicking [🚫 No LOS (Re-pick)] on Armiger Helverin -> Hernkyn Yaegirs immediately re-picks Kapricus Defender (since Helverin at X=10 has clear diagonal LOS around X=-4..4 container!)
  await tactica.blockShootingSightline('HORDE::Armiger Helverin->PLAYER::Hernkyn Yaegirs');
  const helvAfterBlock = (tactica.getTacticaClientState().lastShootingAssignments || []).find(
    a => a.attackerKey === 'HORDE::Armiger Helverin'
  );
  assert.ok(helvAfterBlock, 'Armiger Helverin must re-pick its next visible target after blocking Yaegirs');
  assert.equal(helvAfterBlock.targetKey, 'PLAYER::Kapricus Defender');

  // Step 2 & Step 3 clickable 🛡️ Cover (-1 Hit) toggle chip flips partial-obscuration Cover on/off before rolling on LCT mat
  assert.equal(typeof tactica.toggleTargetCover, 'function', 'Must export toggleTargetCover for 1-click Cover toggling');
  tactica.setHordeTurnStep(2);
  assert.ok(
    els.tacticaAutopilotBox.innerHTML.includes('toggleTargetCover(') &&
    els.tacticaAutopilotBox.innerHTML.includes('🛡️ Cover (-1 Hit)'),
    'Step 2 sightline row must render clickable 🛡️ Cover (-1 Hit) toggle chip'
  );
  tactica.setHordeTurnStep(3);
  assert.ok(
    els.tacticaAutopilotBox.innerHTML.includes('toggleTargetCover(') &&
    els.tacticaAutopilotBox.innerHTML.includes('🛡️ Cover (-1 Hit)'),
    'Step 3 shooting row must render clickable 🛡️ Cover (-1 Hit) toggle chip'
  );

  const helvIdx = (tactica.getTacticaClientState().lastShootingAssignments || []).findIndex(
    a => a.attackerKey === 'HORDE::Armiger Helverin'
  );
  assert.ok(helvIdx >= 0);

  // Flip Cover ON for Armiger Helverin -> Kapricus Defender -> BS 3+ worsens to 4+ on LCT mat
  await tactica.toggleTargetCover('HORDE::Armiger Helverin->PLAYER::Kapricus Defender', true);
  assert.ok(els.tacticaAutopilotBox.innerHTML.includes('🛡️ Cover (-1 Hit): ON'), 'Active Cover chip must show : ON state');
  const coverOnSeq = await tactica.fireAutopilotWeaponOnMat(helvIdx);
  assert.equal(coverOnSeq.nextCommand.threshold, 4, 'Toggled Cover (-1 Hit) must worsen Armiger Helverin BS 3+ to 4+ on LCT mat');
  tactica.getTacticaClientState().pendingDiceSequence = null;

  // Misery #26 ([IGNORE COVER]) strips Cover's -1 to Hit cleanly back to 3+
  tactica.getTacticaClientState().activeMiseryIds = [26];
  const misery26Seq = await tactica.fireAutopilotWeaponOnMat(helvIdx);
  assert.equal(misery26Seq.nextCommand.threshold, 3, 'Misery #26 [IGNORE COVER] must strip Cover -1 Hit back to 3+');
  tactica.getTacticaClientState().activeMiseryIds = [];
  tactica.getTacticaClientState().pendingDiceSequence = null;

  // Flip Cover OFF -> BS 3+ returns to 3+ on LCT mat
  await tactica.toggleTargetCover('HORDE::Armiger Helverin->PLAYER::Kapricus Defender', false);
  const coverOffSeq = await tactica.fireAutopilotWeaponOnMat(helvIdx);
  assert.equal(coverOffSeq.nextCommand.threshold, 3, 'Flipping Cover chip OFF must restore BS 3+ on LCT mat');
  tactica.getTacticaClientState().pendingDiceSequence = null;

  if (typeof tactica.stopTacticaAutoPoller === 'function') tactica.stopTacticaAutoPoller();
  delete globalThis.localStorage;
  delete globalThis.document;
  delete globalThis.window;
  delete globalThis.fetch;
});

````
