# 📦 Fires of Armageddon // Bundle: Unit Tests (Game Modes 2, 3, 4, 6 & 7)

Unit tests for PvP, Rogue Sector, Roster Nemeses, Briefing Atlas, and Astropath Vox (`tests/js/briefing.test.js`, `tests/js/pvp.test.js`, `tests/js/rogue.test.js`, `tests/js/roster.test.js`, `tests/js/vox.test.js`).

## 📑 Table of Contents
- [tests/js/briefing.test.js](#file-testsjsbriefingtestjs)
- [tests/js/pvp.test.js](#file-testsjspvptestjs)
- [tests/js/rogue.test.js](#file-testsjsroguetestjs)
- [tests/js/roster.test.js](#file-testsjsrostertestjs)
- [tests/js/vox.test.js](#file-testsjsvoxtestjs)

---

## File: `tests/js/briefing.test.js` <a id="file-testsjsbriefingtestjs"></a>

````javascript
/**
 * @fileoverview Unit test suite for js/briefing.js functional logic.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const briefingModule = require('../../js/briefing.js');

test('briefing pure: ATLAS_NODES defines all 8 sector nodes with required properties', () => {
  assert.equal(typeof briefingModule.ATLAS_NODES, 'object');
  const keys = Object.keys(briefingModule.ATLAS_NODES);
  assert.equal(keys.length, 8);

  for (let i = 0; i <= 7; i++) {
    const node = briefingModule.ATLAS_NODES[i];
    assert.ok(node, `Node ${i} must exist`);
    assert.ok(node.title, `Node ${i} must have title`);
    assert.ok(node.badge, `Node ${i} must have badge`);
    assert.ok(node.lore, `Node ${i} must have lore`);
    assert.ok(node.rule, `Node ${i} must have rule`);
    assert.equal(typeof node.alphaHP, 'number');
    assert.equal(typeof node.betaHP, 'number');
  }
});

test('briefing pure: SHIP_SLIDER_DATA spans from -3 to +3', () => {
  assert.equal(typeof briefingModule.SHIP_SLIDER_DATA, 'object');
  for (let i = -3; i <= 3; i++) {
    const entry = briefingModule.SHIP_SLIDER_DATA[String(i)];
    assert.ok(entry, `Slider level ${i} must exist`);
    assert.ok(entry.title, `Slider level ${i} must have title`);
    assert.ok(entry.desc, `Slider level ${i} must have desc`);
  }
});

test('briefing pure: getDominanceText returns correct narrative for various HP combinations', () => {
  assert.equal(briefingModule.getDominanceText(null), '');
  
  // Fog of war
  const fogNode = { alphaHP: 0, betaHP: 0, hordeHP: null };
  assert.ok(briefingModule.getDominanceText(fogNode).includes('Fog of War'));

  // Beta leading
  const betaLead = { alphaHP: 1, betaHP: 3, hordeHP: 0 };
  assert.ok(briefingModule.getDominanceText(betaLead).includes('Lord Commander Junebug Leading'));

  // Alpha leading
  const alphaLead = { alphaHP: 4, betaHP: 2, hordeHP: 1 };
  assert.ok(briefingModule.getDominanceText(alphaLead).includes('Sanctuary of Ash Leading'));

  // Horde leading
  const hordeLead = { alphaHP: 1, betaHP: 2, hordeHP: 5 };
  assert.ok(briefingModule.getDominanceText(hordeLead).includes('3rd Alliance Leading'));

  // Stalemate / tie
  const tieNode = { alphaHP: 2, betaHP: 2, hordeHP: 1 };
  assert.ok(briefingModule.getDominanceText(tieNode).includes('Contested Stalemate'));
});

test('briefing pure: CURRENT_SHIP_SLIDER is locked to -1', () => {
  assert.equal(briefingModule.CURRENT_SHIP_SLIDER, -1);
});

test('briefing pure: showDossier supports gamma and selectBriefingConduit routes correctly', () => {
  assert.equal(typeof briefingModule.showDossier, 'function');
  assert.equal(typeof briefingModule.selectBriefingConduit, 'function');
  briefingModule.showDossier('gamma', false);
  assert.equal(briefingModule.briefingState.activeDossier, 'gamma');
  briefingModule.selectBriefingConduit('beta');
  assert.equal(briefingModule.briefingState.activeDossier, 'beta');
  briefingModule.selectBriefingConduit('gamma');
  assert.equal(briefingModule.briefingState.activeDossier, 'gamma');
});

test('briefing pure: unlockTab and lockTab handle Gamma with dedicated gamma audio cues', () => {
  const audioCalls = [];
  globalThis.window = {
    VoxAudio: {
      playBriefingDecode: (ch) => audioCalls.push(`decode:${ch}`),
      playTerminalPowerOff: (ch) => audioCalls.push(`poweroff:${ch}`),
      setFactionTheme: () => {}
    }
  };

  briefingModule.unlockTab('Gamma', false);
  assert.equal(briefingModule.briefingState.unlockedGamma, true);
  assert.equal(audioCalls.includes('decode:gamma'), true, 'unlockTab(Gamma) must invoke playBriefingDecode("gamma")');
  assert.equal(audioCalls.includes('decode:alpha'), false, 'unlockTab(Gamma) must NOT invoke playBriefingDecode("alpha")');

  briefingModule.lockTab('Gamma', false);
  assert.equal(briefingModule.briefingState.unlockedGamma, false);
  assert.equal(audioCalls.includes('poweroff:gamma'), true, 'lockTab(Gamma) must invoke playTerminalPowerOff("gamma")');
  assert.equal(audioCalls.includes('poweroff:alpha'), false, 'lockTab(Gamma) must NOT invoke playTerminalPowerOff("alpha")');
});

test('briefing pure: selectSlider and selectAtlasNode update briefingState accurately', () => {
  for (let s = -3; s <= 3; s++) {
    briefingModule.selectSlider(s, false);
    assert.equal(briefingModule.briefingState.shipSlider, s);
  }

  for (let n = 0; n <= 7; n++) {
    briefingModule.selectAtlasNode(n, false);
    assert.equal(briefingModule.briefingState.selectedNode, n);
  }
});

test('briefing pure: restoreBriefingState honors URL hash and search query parameters over stored state', () => {
  const mockStorage = {};
  globalThis.localStorage = {
    getItem: (k) => mockStorage[k] || null,
    setItem: (k, v) => { mockStorage[k] = String(v); }
  };

  mockStorage[briefingModule.BRIEFING_STORAGE_KEY] = JSON.stringify({
    activeDossier: 'alpha',
    unlockedAlpha: true,
    shipSlider: 1,
    selectedNode: 4
  });

  // 1. URL hash #gamma takes precedence over stored 'alpha'
  globalThis.window = {
    location: { hash: '#gamma', search: '' },
    VoxAudio: { setFactionTheme: () => {} }
  };
  briefingModule.restoreBriefingState();
  assert.equal(briefingModule.briefingState.activeDossier, 'gamma');
  assert.equal(briefingModule.briefingState.unlockedAlpha, true);
  assert.equal(briefingModule.briefingState.selectedNode, 4);

  // 2. URL search ?tab=atlas takes precedence when hash is empty
  globalThis.window = {
    location: { hash: '', search: '?tab=atlas' },
    VoxAudio: { setFactionTheme: () => {} }
  };
  briefingModule.restoreBriefingState();
  assert.equal(briefingModule.briefingState.activeDossier, 'atlas');

  delete globalThis.localStorage;
});


````

---

## File: `tests/js/pvp.test.js` <a id="file-testsjspvptestjs"></a>

````javascript
/**
 * @fileoverview Unit test suite for js/pvp.js pure functional logic.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const pvpModule = require('../../js/pvp.js');

test('pvp pure: constants HELLSCAPES, ANOMALIES, UNBOUND_UNITS are populated and valid', () => {
  assert.equal(pvpModule.HELLSCAPES.length, 6);
  assert.equal(pvpModule.HELLSCAPE_NAMES.length, 6);
  assert.equal(pvpModule.ANOMALIES.length, 6);
  assert.equal(pvpModule.UNBOUND_UNITS.length, 4);

  pvpModule.HELLSCAPES.forEach(h => assert.ok(h.length > 20));
  pvpModule.ANOMALIES.forEach(a => assert.ok(a.length > 20));
  pvpModule.UNBOUND_UNITS.forEach(u => assert.ok(u.length > 20));
});

test('pvp pure: compilePvpVultureReport generates accurate reports for both Alpha and Beta conduits', () => {
  // Alpha conduit report
  const alphaReport = pvpModule.compilePvpVultureReport({
    channel: 'alpha',
    killedUnit: true,
    hellscapeIdx: 2,
    warpIntensity: 'major',
    notes: 'Encountered daemonic vanguard near eastern ridge.'
  });

  assert.ok(alphaReport.includes('+++ 1V1 ASH WASTES // 3RD ALLIANCE VULTURE SPTS REPORT +++'));
  assert.ok(alphaReport.includes('THE EXILE // SANCTUARY OF ASH'));
  assert.ok(alphaReport.includes('4 SPts'));
  assert.ok(alphaReport.includes('Fading Reality'));
  assert.ok(alphaReport.includes('Encountered daemonic vanguard'));

  // Beta conduit report
  const betaReport = pvpModule.compilePvpVultureReport({
    channel: 'beta',
    killedUnit: false,
    hellscapeIdx: 0,
    warpIntensity: 'minor',
    notes: 'Royal tomb sweeps detected minor scavengers.'
  });

  assert.ok(betaReport.includes('+++ TOMB-SHIP SENSOR SWEEP // 1V1 ASH WASTES VULTURE SPTS REPORT +++'));
  assert.ok(betaReport.includes('LORD COMMANDER JUNEBUG'));
  assert.ok(betaReport.includes('3 SPts'));
  assert.ok(betaReport.includes('Folded Space'));
  assert.ok(betaReport.includes('Royal tomb sweeps'));
});

test('pvp pure: compilePvpVultureReport handles empty/default inputs and out-of-bounds hellscape indices', () => {
  const defaultAlpha = pvpModule.compilePvpVultureReport();
  assert.ok(defaultAlpha.includes('THE EXILE // SANCTUARY OF ASH'));
  assert.ok(defaultAlpha.includes('3 SPts'));
  assert.ok(defaultAlpha.includes('Folded Space // Intensity: MAJOR'));
  assert.ok(defaultAlpha.includes('1v1 Ash Wastes clash concluded. Reporting 3rd Alliance Vulture Strategic Points to Campaign Master.'));

  const defaultBeta = pvpModule.compilePvpVultureReport({
    channel: 'beta',
    hellscapeIdx: 99,
    intensity: 'catastrophic'
  });
  assert.ok(defaultBeta.includes('LORD COMMANDER JUNEBUG'));
  assert.ok(defaultBeta.includes('Folded Space // Intensity: CATASTROPHIC'));
  assert.ok(defaultBeta.includes('Reporting 3rd Alliance Vulture Strategic Points to Tomb-Ship Master Matrix.'));
});

test('pvp boundary adapters: updateVulture, renderHellscape, rollWarpAnomaly, and transmitUnboundPing', () => {
  const els = {
    hellscapeSelect: { value: '1' },
    hellscapeDesc: { innerHTML: '' },
    warpIntensity: { value: 'catastrophic' },
    anomalyResultBox: { innerHTML: '' },
    vultureKillCheck: { checked: true },
    vulturePts: { innerText: '', textContent: '' },
    pvpReportSpBadge: { textContent: '' },
    pvpReportChannel: { value: 'beta' },
    pvpReportNotes: { value: 'Necron monoliths secured the ridge.' },
    pvpVulturePreviewBox: { textContent: '', classList: { toggle: () => {} } },
    unboundResult: { innerHTML: '' }
  };

  const store = {};
  globalThis.localStorage = {
    getItem: (k) => store[k] || null,
    setItem: (k, v) => { store[k] = String(v); }
  };
  globalThis.document = {
    getElementById: (id) => els[id] || null
  };

  let transmitted = null;
  globalThis.window = {
    VoxAudio: {
      playClank: () => {},
      playWarpSiren: () => {},
      playAuspexLock: () => {},
      transmitToVox: (chan, payload) => {
        transmitted = { chan, payload };
      }
    }
  };

  pvpModule.renderHellscape(true);
  assert.ok(els.hellscapeDesc.innerHTML.includes('Fractured Realm'));

  pvpModule.updateVulture(true);
  assert.equal(els.vulturePts.textContent, '4 SPts');
  assert.equal(els.pvpReportSpBadge.textContent, '4 SPts');

  pvpModule.rollWarpAnomaly();
  assert.ok(
    els.anomalyResultBox.innerHTML.includes('WARP SURGE!') ||
    els.anomalyResultBox.innerHTML.includes('Reality Holds')
  );

  pvpModule.rollUnboundAdversary();
  assert.ok(els.unboundResult.innerHTML.includes('transmitUnboundPing'));

  // Test PL 4 Apex Anomaly ping on Beta vs PL 2 on Alpha
  pvpModule.transmitUnboundPing(4, 'beta');
  assert.equal(transmitted.chan, 'beta');
  assert.ok(transmitted.payload.includes('POWER LEVEL 4 APEX ANOMALY DETECTED'));
  assert.ok(transmitted.payload.includes('PHAERON JUNEBUG'));

  pvpModule.transmitUnboundPing(2, 'alpha');
  assert.equal(transmitted.chan, 'alpha');
  assert.ok(transmitted.payload.includes('POWER LEVEL 2 UNBOUND ADVERSARY DETECTED'));
  assert.ok(transmitted.payload.includes('THE EXILE'));

  // Reset form
  pvpModule.resetPvpVultureReportForm();
  assert.equal(els.pvpReportChannel.value, 'alpha');
  assert.equal(els.vultureKillCheck.checked, false);
  assert.equal(els.pvpReportNotes.value, '');
  assert.equal(els.vulturePts.textContent, '3 SPts');

  delete globalThis.localStorage;
  delete globalThis.document;
  delete globalThis.window;
});
````

---

## File: `tests/js/rogue.test.js` <a id="file-testsjsroguetestjs"></a>

````javascript
/**
 * @fileoverview Unit test suite for js/rogue.js pure functional logic.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const rogueModule = require('../../js/rogue.js');

test('rogue pure: ROGUE_OUTCOME_IMPACTS maps all 4 standard outcomes to consequences', () => {
  assert.equal(typeof rogueModule.ROGUE_OUTCOME_IMPACTS, 'object');
  const outcomes = ['Imperium Victory', 'Chaos Victory', 'Xenos Victory', 'Contested'];

  outcomes.forEach(key => {
    const entry = rogueModule.ROGUE_OUTCOME_IMPACTS[key];
    assert.ok(entry, `Outcome '${key}' must exist in lookup table`);
    assert.ok(entry.planetaryImpact, `Outcome '${key}' must specify planetaryImpact`);
    assert.ok(entry.hegemonyImpact, `Outcome '${key}' must specify hegemonyImpact`);
  });
});

test('rogue pure: compileRogueDossier formats battle report with planetary and alliance consequences', () => {
  // Alpha conduit report
  const alphaReport = rogueModule.compileRogueDossier({
    channel: 'alpha',
    combatants: '144th Krieg Siege Regiment vs Death Guard 7th Plague Company',
    outcome: 'Imperium Victory',
    nominee: 'Lord of Contagion (Nurgle Terminator)',
    notes: 'Bitter trench engagement amidst the toxic mire.'
  });

  assert.ok(alphaReport.includes('+++ ROGUE SECTOR AUXILIARY BATTLE REPORT +++'));
  assert.ok(alphaReport.includes('THE EXILE // SANCTUARY OF ASH'));
  assert.ok(alphaReport.includes('144th Krieg Siege Regiment'));
  assert.ok(alphaReport.includes('Imperium Victory'));
  assert.ok(alphaReport.includes('+1 SPt to Gatebreakers'));
  assert.ok(alphaReport.includes('Lord of Contagion'));
  assert.ok(alphaReport.includes('Bitter trench engagement'));

  // Beta conduit report
  const betaReport = rogueModule.compileRogueDossier({
    channel: 'beta',
    combatants: 'Canoptek Swarm vs Orks',
    outcome: 'Chaos Victory',
    nominee: '',
    notes: 'Chaos daemons manifested unexpectedly.'
  });

  assert.ok(betaReport.includes('+++ TOMB-SHIP QUANTUM SURVEILLANCE // ROGUE SECTOR AUXILIARY BATTLE REPORT +++'));
  assert.ok(betaReport.includes('LORD COMMANDER JUNEBUG'));
  assert.ok(betaReport.includes('Canoptek Swarm vs Orks'));
  assert.ok(betaReport.includes('Chaos Victory'));
  assert.ok(betaReport.includes('+1 SPt to Desecrators'));
  assert.ok(!betaReport.includes('NOMINEE:'));
});

test('rogue pure: compileRogueDossier handles Xenos Victory, Contested fallback, and Beta nominee label', () => {
  const xenosBeta = rogueModule.compileRogueDossier({
    channel: 'beta',
    combatants: 'Ork Speed Freeks vs Tyranid Vanguard',
    outcome: 'Xenos Victory',
    nominee: 'Deffkilla Wartrike',
    notes: 'Xenos scavengers overran the eastern supply depot.'
  });
  assert.ok(xenosBeta.includes('+1 SPt to Marauders'));
  assert.ok(xenosBeta.includes('• SPECIMEN TARGETING NOMINEE: Deffkilla Wartrike'));

  const contestedDefault = rogueModule.compileRogueDossier({
    outcome: 'Unrecognized Stalemate'
  });
  assert.ok(contestedDefault.includes('Auxiliary Forces (Unspecified Factions)'));
  assert.ok(contestedDefault.includes('Zero SPt shift (Contested)'));
});

test('rogue state & adapters: setAiStep, nextAiStep, saveRogueState, restoreRogueState, and resetRogueDossierForm', () => {
  const makeStepEl = () => ({
    classList: {
      active: false,
      toggle(cls, force) { this.active = !!force; }
    },
    querySelector: () => ({ innerText: '' })
  });

  const els = {
    aiStep0: makeStepEl(),
    aiStep1: makeStepEl(),
    aiStep2: makeStepEl(),
    rogueReportChannel: { value: 'beta' },
    rogueCombatants: { value: 'World Eaters vs Space Marines' },
    rogueOutcome: { value: 'Chaos Victory' },
    rogueNemesisNominee: { value: 'Eightbound Champion' },
    rogueNotes: { value: 'Brutal melee clash.' },
    rogueDossierPreviewBox: { textContent: '', classList: { toggle: () => {} } }
  };

  const store = {};
  globalThis.localStorage = {
    getItem: (k) => store[k] || null,
    setItem: (k, v) => { store[k] = String(v); }
  };
  globalThis.document = {
    getElementById: (id) => els[id] || null
  };

  let transmitted = null;
  globalThis.window = {
    VoxAudio: {
      playClank: () => {},
      transmitToVox: (chan, payload) => { transmitted = { chan, payload }; }
    }
  };

  rogueModule.setAiStep(0);
  assert.equal(rogueModule.getCurrentAiStep(), 0);
  assert.equal(els.aiStep0.classList.active, true);

  rogueModule.nextAiStep();
  assert.equal(rogueModule.getCurrentAiStep(), 1);
  assert.equal(els.aiStep1.classList.active, true);

  rogueModule.nextAiStep();
  assert.equal(rogueModule.getCurrentAiStep(), 2);

  rogueModule.nextAiStep();
  assert.equal(rogueModule.getCurrentAiStep(), 0, 'nextAiStep must wrap from 2 back to 0');

  rogueModule.transmitRogueDossier();
  assert.equal(transmitted.chan, 'beta');
  assert.ok(transmitted.payload.includes('World Eaters vs Space Marines'));

  rogueModule.resetRogueDossierForm();
  assert.equal(els.rogueReportChannel.value, 'alpha');
  assert.equal(els.rogueCombatants.value, '');
  assert.equal(els.rogueOutcome.value, 'Imperium Victory');
  assert.equal(els.rogueNemesisNominee.value, '');

  delete globalThis.localStorage;
  delete globalThis.document;
  delete globalThis.window;
});
````

---

## File: `tests/js/roster.test.js` <a id="file-testsjsrostertestjs"></a>

````javascript
const test = require('node:test');
const assert = require('node:assert/strict');
const {
  compileNemesisDossier,
  normalizeUnitType,
  deduplicateSimilarUnits,
  extractUniqueUnitTypes,
  formatTtsUnitList
} = require('../../js/roster.js');

test('Roster: compileNemesisDossier compiles Alpha and Beta dossiers with correct banners', () => {
  const alphaDossier = compileNemesisDossier({
    channel: 'alpha',
    sector: 'Equatorial Jungle // Sector 0',
    unit: '10 Khorne Berzerkers',
    feat: 'Slain Captain in melee',
    notes: 'Demonstrated relentless aggression'
  });
  assert.ok(alphaDossier.includes('ORDO MALLEUS // NEMESIS THREAT INDUCTION DOSSIER'));
  assert.ok(alphaDossier.includes('THE EXILE // SANCTUARY OF ASH'));
  assert.ok(alphaDossier.includes('10 Khorne Berzerkers'));

  const betaDossier = compileNemesisDossier({
    channel: 'beta',
    sector: 'Golgotha Basin',
    unit: 'Necron Overlord',
    feat: 'Annihilated Immortals phalanx',
    notes: 'Hyperphase resonance detected'
  });
  assert.ok(betaDossier.includes('TOMB-SHIP MASTER MATRIX // DYNASTIC NEMESIS INDUCTION ENGRAM'));
  assert.ok(betaDossier.includes('LORD COMMANDER JUNEBUG // TOMB-SHIP PHAERON INTERLINK'));
});

test('Roster: normalizeUnitType and deduplicateSimilarUnits strip quantities and merge shorthand units', () => {
  assert.equal(normalizeUnitType('5 Bladeguard Veterans'), 'Bladeguard Veterans');
  assert.equal(normalizeUnitType('1D3 Chaos Spawns'), 'Chaos Spawns');
  assert.equal(normalizeUnitType('2x Armiger Warglaives'), 'Armiger Warglaives');

  const deduplicated = deduplicateSimilarUnits([
    'Bladeguard',
    'Bladeguard Veterans',
    'Terminators',
    'Terminator Squad'
  ]);
  assert.deepEqual(deduplicated, ['Bladeguard Veterans', 'Terminator Squad']);
});

test('Roster: extractUniqueUnitTypes and formatTtsUnitList parse brackets and compile checklist', () => {
  const pool = {
    b34: '5 Intercessors, 5 Assault Intercessors',
    b56: '5 Bladeguard Veterans + 1 Captain',
    b79: '1 Redemptor Dreadnought',
    b10: '1 Land Raider Redeemer',
    b13: '1 Roboute Guilliman'
  };

  const types = extractUniqueUnitTypes(pool);
  assert.ok(types.includes('Intercessors'));
  assert.ok(types.includes('Bladeguard Veterans'));
  assert.ok(types.includes('Redemptor Dreadnought'));

  const checklist = formatTtsUnitList('Space Marines', types);
  assert.ok(checklist.includes('+++ TABLETOP SIMULATOR (TTS) PREPARATION // SPACE MARINES +++'));
  assert.ok(checklist.includes('[ ] Intercessors'));
});

test('Roster: compileNemesisDossier, normalizeUnitType, and formatTtsUnitList handle empty/fallback inputs cleanly', () => {
  const fallbackDossier = compileNemesisDossier({});
  assert.ok(fallbackDossier.includes('[Unspecified Hostile Entity]'));
  assert.ok(fallbackDossier.includes('Slain a Player Warlord / Character in combat'));
  assert.ok(fallbackDossier.includes('Survived engagement and demonstrated anomalous lethality.'));

  assert.equal(normalizeUnitType(''), '');
  assert.equal(normalizeUnitType(null), '');
  assert.equal(normalizeUnitType('2D6 Termagants (Fleshborers)'), 'Termagants (Fleshborers)');

  assert.deepEqual(deduplicateSimilarUnits([]), []);
  assert.deepEqual(extractUniqueUnitTypes(null), []);

  const emptyChecklist = formatTtsUnitList('Orks', []);
  assert.ok(emptyChecklist.includes('+++ TABLETOP SIMULATOR (TTS) PREPARATION // ORKS +++'));
  assert.ok(emptyChecklist.includes('Total Unique Unit Types Required: 0'));
});
````

---

## File: `tests/js/vox.test.js` <a id="file-testsjsvoxtestjs"></a>

````javascript
/**
 * @fileoverview Unit tests for js/vox.js pure functional utilities and Astropathic logic.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const voxModule = require('../../js/vox.js');

test('vox pure: isRogueSectorInterference correctly classifies parallel sector broadcasts', () => {
  assert.equal(voxModule.isRogueSectorInterference(null), false);
  assert.equal(voxModule.isRogueSectorInterference({}), false);
  assert.equal(
    voxModule.isRogueSectorInterference({ origin_hint: 'PARALLEL SECTOR BROADCAST', redacted_text: 'Warning' }),
    true
  );
  assert.equal(
    voxModule.isRogueSectorInterference({ origin_hint: 'Alpha Conduit', redacted_text: 'ORBITAL AUGUR ARRAY signal intercepted' }),
    true
  );
  assert.equal(
    voxModule.isRogueSectorInterference({ origin_hint: 'Sector 4', redacted_text: 'ROGUE SECTOR fleet movement detected' }),
    true
  );
  assert.equal(
    voxModule.isRogueSectorInterference({ origin_hint: 'Conduit Alpha', redacted_text: 'Standard patrol report' }),
    false
  );
});

test('vox pure: isVoxServerOnline validates timestamps and heartbeat status', () => {
  const now = 1700000000000;
  assert.equal(voxModule.isVoxServerOnline(null, now), false);
  assert.equal(voxModule.isVoxServerOnline({ status: 'offline' }, now), false);
  assert.equal(voxModule.isVoxServerOnline({ status: 'online', updatedAt: now - 5000 }, now), true);
  assert.equal(voxModule.isVoxServerOnline({ status: 'online', updatedAt: now - 35000 }, now), false);
});

test('vox pure: formatRedactedHtml safely injects censor bars for [REDACTED]', () => {
  const raw = 'The target is [REDACTED] located at coordinates [REDACTED].';
  const formatted = voxModule.formatRedactedHtml(raw);
  assert.ok(formatted.includes('class="censor-bar"'));
  assert.ok(!formatted.includes('[REDACTED]'));
  assert.equal(voxModule.formatRedactedHtml(''), '');
  assert.equal(voxModule.formatRedactedHtml(null), '');
});

test('vox pure: extractDynamicReplyCardMeta parses explicit headers and fallback titles', () => {
  const bannerText = '+++ INCOMING TRANSMISSION: SECTOR REPORT +++\nDetails follow.';
  const meta1 = voxModule.extractDynamicReplyCardMeta(bannerText);
  assert.ok(meta1.cardTitle);
  assert.ok(!meta1.cleanBody.includes('+++ INCOMING TRANSMISSION:'));

  const standardText = 'Casual message without custom banner.';
  const meta2 = voxModule.extractDynamicReplyCardMeta(standardText);
  assert.ok(meta2.cardTitle);
  assert.equal(meta2.cleanBody, 'Casual message without custom banner.');
});

test('vox pure: escapeHtml neutralizes hazardous characters', () => {
  const unsafe = '<script>alert("xss")&"\'</script>';
  const safe = voxModule.escapeHtml(unsafe);
  assert.ok(!safe.includes('<script>'));
  assert.ok(safe.includes('&lt;script&gt;'));
  assert.ok(safe.includes('&amp;'));
  assert.ok(safe.includes('&quot;'));
});
````
