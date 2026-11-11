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
    'overwatchQueryInput', 'overwatchVerdictBox', 'tacticaCrusadeExportNotice'
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
  globalThis.localStorage = {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v))
  };
  globalThis.document = { getElementById: (id) => els[id] || null };
  globalThis.window = {
    addEventListener: () => {},
    VoxAudio: {
      playClank: () => {},
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
  tactica.selectTelemetryUnitForDefense(0);
  assert.equal(els.defUnitName.value, 'Skorpekh Destroyers');
  assert.equal(els.defInSpawnCheck.checked, true);

