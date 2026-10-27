/**
 * 📦 FIRES OF ARMAGEDDON // HOSTILE MATRIX & NEMESIS ARCHIVE (MODE 4)
 * File: js/roster.js
 *
 * Implements:
 * - 3-Tab Interface: Active Nemeses, Shelf Barracks (Custom Pools), and Faction Threat Brackets
 * - Ordo Malleus / Tomb-Ship New Nemesis Induction Dossier generator
 * - Multi-faction custom shelf pool storage (persisted in localStorage and Supabase RPC)
 * - Pure functional unit type extraction and Tabletop Simulator (TTS) preparation checklist
 */

var ROSTER_STATE_KEY = 'foa_roster_matrix_state_v1';
var CUSTOM_POOL_STORAGE_KEY = 'foa_custom_shelf_pool_v1';

var SUPABASE_URL = (typeof window !== 'undefined' && window.SUPABASE_URL)
  ? window.SUPABASE_URL
  : 'https://dsfvhjjalexqpbzqoaqb.supabase.co';
var SUPABASE_ANON_KEY = (typeof window !== 'undefined' && window.SUPABASE_ANON_KEY)
  ? window.SUPABASE_ANON_KEY
  : 'sb_publishable_R3wXKsK7Gl54-8BNCauUNg_NIoosOOO';

// Canonical 23-Faction Standard Horde Spawn Bracket Matrix loaded from data.js
var ROSTER_SPAWN_TABLES = (typeof HORDE_FACTION_SPAWN_TABLES !== 'undefined')
  ? HORDE_FACTION_SPAWN_TABLES
  : ((typeof window !== 'undefined' && window.HORDE_FACTION_SPAWN_TABLES) ? window.HORDE_FACTION_SPAWN_TABLES : {});

var activeRosterTab = 'nemesis';

  function switchRosterTab(tab, persist = true) {
    activeRosterTab = tab;
    if (typeof document === 'undefined') return;

    const tNem = document.getElementById('rosTabNemesis');
    const tUnb = document.getElementById('rosTabUnbound');
    const tBrk = document.getElementById('rosTabBrackets');
    if (tNem) tNem.classList.toggle('hidden', tab !== 'nemesis');
    if (tUnb) tUnb.classList.toggle('hidden', tab !== 'unbound');
    if (tBrk) tBrk.classList.toggle('hidden', tab !== 'brackets');

    const b1 = document.getElementById('rosTabBtn1');
    const b2 = document.getElementById('rosTabBtn2');
    const b3 = document.getElementById('rosTabBtn3');
    if (b1) b1.classList.toggle('active', tab === 'nemesis');
    if (b2) b2.classList.toggle('active', tab === 'unbound');
    if (b3) b3.classList.toggle('active', tab === 'brackets');

    if (persist) saveRosterPageState();
  }

  /**
   * Pure functional core: compiles an Ordo Malleus New Nemesis Induction Dossier
   * from a plain state object without touching the DOM.
   *
   * @param {object} [input={}] - Plain Nemesis dossier parameters.
   * @returns {string} Formatted teletype dossier string.
   */
  function compileNemesisDossier(input = {}) {
    const chan = input.channel || 'alpha';
    const isBeta = chan === 'beta';
    const cmdr = isBeta
      ? 'LORD COMMANDER JUNEBUG // TOMB-SHIP PHAERON INTERLINK'
      : 'THE EXILE // SANCTUARY OF ASH';

    const headerBanner = isBeta
      ? `+++ TOMB-SHIP MASTER MATRIX // DYNASTIC NEMESIS INDUCTION ENGRAM +++`
      : `+++ ORDO MALLEUS // NEMESIS THREAT INDUCTION DOSSIER +++`;

    const footerRequest = isBeta
      ? `REQUEST FOR TOMB-SHIP MASTER MATRIX & CAMPAIGN MASTER: Please etch this hostile specimen's engrammatic threat profile into the Dynastic Nemesis Matrix (Pattern 3), assign its permanent Dynastic Threat Designation and bespoke Boss Battle Trait, and lock its extermination protocol!`
      : `REQUEST FOR CAMPAIGN MASTER: Please induct this hostile entity into the Cross-Mode Nemesis Ledger (Pattern 3), forge their permanent In-Universe Name, Epithet, and bespoke Boss Battle Trait, and issue an Extremis Bounty Warrant!`;

    const sector = input.sector || 'Mode 1: Horde Breach // Node 0 (Golgotha Arbor-Basin)';
    const unit = (input.unit || '').trim() || '[Unspecified Hostile Entity]';
    const feat = input.feat || 'Slain a Player Warlord / Character in combat';
    const notes = (input.notes || '').trim() || 'Survived engagement and demonstrated anomalous lethality.';

    const labels = isBeta ? {
      cmdr: '• REPORTING PHAERON:',
      sector: '• ENGAGEMENT THEATRE & SECTOR:',
      unit: '• TARGET SPECIMEN / INTRUDER FACTION:',
      feat: '• OBSERVED ANOMALY / SLAIN DYNASTIC ASSETS:',
      notes: '• CANOPTEK TELEMETRY & ENGRAMMATIC LOG:'
    } : {
      cmdr: '• FILING COMMANDER:',
      sector: '• THEATRE & MODE:',
      unit: '• HOSTILE DATASHEET / FACTION:',
      feat: '• TRIGGERING FEAT:',
      notes: '• EYE-WITNESS COMBAT LOG:'
    };

    return [
      headerBanner,
      `${labels.cmdr} ${cmdr}`,
      `${labels.sector} ${sector}`,
      `${labels.unit} ${unit}`,
      `${labels.feat} ${feat}`,
      `${labels.notes} "${notes}"`,
      `------------------------------------------------`,
      footerRequest
    ].join('\n');
  }

  /**
   * Humble View (Dumb UI) input reader: extracts current Nemesis Induction Dossier
   * form fields from the DOM into a plain data object.
   *
   * @returns {object} Plain input snapshot for compileNemesisDossier.
   */
  function readNemesisFormInputs() {
    if (typeof document === 'undefined') return {};
    return {
      channel: document.getElementById('nemReportChannel')?.value || 'alpha',
      sector: document.getElementById('nemReportSector')?.value || 'Mode 1: Horde Breach // Node 0 (Golgotha Arbor-Basin)',
      unit: document.getElementById('nemReportUnit')?.value || '',
      feat: document.getElementById('nemReportFeat')?.value || 'Slain a Player Warlord / Character in combat',
      notes: document.getElementById('nemReportNotes')?.value || ''
    };
  }

  /**
   * Thin DOM-to-Core adapter that reads current Nemesis form inputs and delegates
   * formatting to the pure compileNemesisDossier functional core.
   *
   * @returns {string} Formatted teletype dossier string.
   */
  function buildNemesisDossierString() {
    return compileNemesisDossier(readNemesisFormInputs());
  }

  function updateNemesisPreview() {
    if (typeof document === 'undefined') return;
    const box = document.getElementById('nemDossierPreview') || document.getElementById('nemesisDossierPreviewBox');
    const chan = document.getElementById('nemReportChannel')?.value || 'alpha';
    if (box) {
      box.textContent = buildNemesisDossierString();
      if (box.classList && typeof box.classList.toggle === 'function') {
        box.classList.toggle('vox-preview-beta', chan === 'beta');
        box.classList.toggle('vox-preview-alpha', chan !== 'beta');
      }
    }
    saveRosterPageState();
  }

  function updateNemesisDossierPreview() {
    updateNemesisPreview();
  }

  function transmitNemesisDossier() {
    if (typeof document === 'undefined') return;
    const chan = document.getElementById('nemReportChannel')?.value || 'alpha';
    const payload = buildNemesisDossierString();
    if (typeof window !== 'undefined' && window.VoxAudio && typeof window.VoxAudio.transmitToVox === 'function') {
      window.VoxAudio.transmitToVox(chan, payload);
    }
  }

  /**
   * Resets all New Nemesis Induction Dossier form fields back to their clean default state
   * and refreshes the live preview and persisted localStorage state.
   */
  function resetNemesisDossierForm() {
    if (typeof document === 'undefined') return;
    const chanEl = document.getElementById('nemReportChannel');
    const secEl = document.getElementById('nemReportSector');
    const unitEl = document.getElementById('nemReportUnit');
    const featEl = document.getElementById('nemReportFeat');
    const notesEl = document.getElementById('nemReportNotes');

    if (chanEl) chanEl.value = 'alpha';
    if (secEl) secEl.value = 'Mode 1: Horde Breach // Node 0 (Golgotha Arbor-Basin)';
    if (unitEl) unitEl.value = '';
    if (featEl) featEl.value = 'Slain a Player Warlord / Character in combat';
    if (notesEl) notesEl.value = '';

    if (typeof window !== 'undefined' && window.VoxAudio && typeof window.VoxAudio.playClank === 'function') {
      window.VoxAudio.playClank('card');
    }
    updateNemesisPreview();
  }

  function getStoredPoolRoot() {
    try {
      if (typeof localStorage === 'undefined') return {};
      const raw = localStorage.getItem(CUSTOM_POOL_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  function getFactionPoolFromStore(facName) {
    const root = getStoredPoolRoot();
    if (root.byFaction && root.byFaction[facName]) {
      return root.byFaction[facName];
    }
    // Legacy flat-object support (only if byFaction hasn't been created yet)
    if (!root.byFaction && (root.b34 || root.b56 || root.b79 || root.b10 || root.b13)) {
      return {
        b34: root.b34 || '',
        b56: root.b56 || '',
        b79: root.b79 || '',
        b10: root.b10 || '',
        b13: root.b13 || ''
      };
    }
    return { b34: '', b56: '', b79: '', b10: '', b13: '' };
  }

  function loadFactionInputs(facName) {
    if (typeof document === 'undefined') return;
    const p = getFactionPoolFromStore(facName);
    if (document.getElementById('rosterPool34')) document.getElementById('rosterPool34').value = p.b34 || '';
    if (document.getElementById('rosterPool56')) document.getElementById('rosterPool56').value = p.b56 || '';
    if (document.getElementById('rosterPool79')) document.getElementById('rosterPool79').value = p.b79 || '';
    if (document.getElementById('rosterPool10')) document.getElementById('rosterPool10').value = p.b10 || '';
    if (document.getElementById('rosterPool13')) document.getElementById('rosterPool13').value = p.b13 || '';
  }

  function onFactionPickerChange() {
    if (typeof document === 'undefined') return;
    const facName = document.getElementById('bracketFactionPicker')?.value || 'Space Marines';
    loadFactionInputs(facName);
    renderFactionBracketTable();
    saveRosterPageState();
  }

  async function saveShelfBarracks() {
    if (typeof window !== 'undefined' && window.VoxAudio && typeof window.VoxAudio.playCloudSyncChime === 'function') {
      window.VoxAudio.playCloudSyncChime();
    }
    if (typeof document === 'undefined') return false;

    const facName = document.getElementById('bracketFactionPicker')?.value || 'Space Marines';
    const currentInputs = {
      b34: (document.getElementById('rosterPool34')?.value || '').trim(),
      b56: (document.getElementById('rosterPool56')?.value || '').trim(),
      b79: (document.getElementById('rosterPool79')?.value || '').trim(),
      b10: (document.getElementById('rosterPool10')?.value || '').trim(),
      b13: (document.getElementById('rosterPool13')?.value || '').trim()
    };

    const root = getStoredPoolRoot();
    const byFaction = root.byFaction || {};
    byFaction[facName] = currentInputs;

    const poolObj = {
      ...currentInputs,
      byFaction
    };

    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(CUSTOM_POOL_STORAGE_KEY, JSON.stringify(poolObj));
      }
    } catch (e) {}

    renderFactionBracketTable();
    saveRosterPageState();

    const notice = document.getElementById('shelfSaveNotice');
    if (notice) {
      notice.textContent = '⏳ Syncing with Supabase Cloud...';
      if (notice.style) notice.style.color = 'var(--gold)';
      notice.classList.remove('hidden');
    }

    const ok = await syncPoolsToSupabaseCloud(poolObj);
    if (notice) {
      if (ok) {
        notice.textContent = '✓ Synced with Supabase Cloud & Mode 1 Spawner!';
        if (notice.style) notice.style.color = 'var(--green)';
      } else {
        notice.textContent = '⚠️ Saved locally, but Cloud Sync failed (Check connection)!';
        if (notice.style) notice.style.color = 'var(--red)';
      }
      setTimeout(() => notice.classList.add('hidden'), 3500);
    }
    return ok;
  }

  async function syncPoolsToSupabaseCloud(poolObj) {
    if (typeof fetch !== 'function') return false;
    try {
      const hordePool = poolObj || JSON.parse((typeof localStorage !== 'undefined' ? localStorage.getItem(CUSTOM_POOL_STORAGE_KEY) : null) || '{}');
      const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/save_shared_spawn_pools`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          p_horde_pool: hordePool
        })
      });
      if (res && res.ok) {
        if (typeof document !== 'undefined') {
          const badge = document.getElementById('cloudSyncBadge');
          if (badge) badge.textContent = '☁️ Cloud Pool Synced (Live for Both Players)';
        }
        return true;
      }
    } catch (e) {}
    return false;
  }

  async function pullSharedPoolsFromCloud(isManual = false) {
    if (typeof fetch !== 'function') return false;
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/get_shared_spawn_pools`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({})
      });
      if (!res || !res.ok) return false;
      const data = await res.json();
      if (!data || !data.ok) return false;

      if (typeof window !== 'undefined' && window.VoxAudio && typeof window.VoxAudio.playCloudSyncChime === 'function') {
        window.VoxAudio.playCloudSyncChime();
      }

      const facName = (typeof document !== 'undefined')
        ? (document.getElementById('bracketFactionPicker')?.value || 'Space Marines')
        : 'Space Marines';

      if (data.horde_pool && typeof data.horde_pool === 'object' && Object.keys(data.horde_pool).length > 0) {
        if (typeof localStorage !== 'undefined') {
          if (data.horde_pool.byFaction) {
            const localRoot = getStoredPoolRoot();
            const mergedByFaction = {
              ...(localRoot.byFaction || {}),
              ...data.horde_pool.byFaction
            };
            const mergedPool = {
              ...localRoot,
              ...data.horde_pool,
              byFaction: mergedByFaction
            };
            localStorage.setItem(CUSTOM_POOL_STORAGE_KEY, JSON.stringify(mergedPool));
          } else {
            localStorage.setItem(CUSTOM_POOL_STORAGE_KEY, JSON.stringify(data.horde_pool));
          }
        }
        loadFactionInputs(facName);
      }

      if (isManual && typeof document !== 'undefined') {
        const currentP = getFactionPoolFromStore(facName);
        const hasAnyValue = Boolean(
          (currentP.b34 && currentP.b34.trim()) ||
          (currentP.b56 && currentP.b56.trim()) ||
          (currentP.b79 && currentP.b79.trim()) ||
          (currentP.b10 && currentP.b10.trim()) ||
          (currentP.b13 && currentP.b13.trim())
        );
        if (!hasAnyValue) {
          const tables = (typeof HORDE_FACTION_SPAWN_TABLES !== 'undefined') ? HORDE_FACTION_SPAWN_TABLES : ROSTER_SPAWN_TABLES;
          const ref = tables[facName] || {};
          const fallbackInputs = {
            b34: Array.isArray(ref.b34) ? ref.b34.join(', ') : '',
            b56: Array.isArray(ref.b56) ? ref.b56.join(', ') : '',
            b79: Array.isArray(ref.b79) ? ref.b79.join(', ') : '',
            b10: Array.isArray(ref.b10) ? ref.b10.join(', ') : '',
            b13: Array.isArray(ref.b13) ? ref.b13.join(', ') : ''
          };
          if (document.getElementById('rosterPool34')) document.getElementById('rosterPool34').value = fallbackInputs.b34;
          if (document.getElementById('rosterPool56')) document.getElementById('rosterPool56').value = fallbackInputs.b56;
          if (document.getElementById('rosterPool79')) document.getElementById('rosterPool79').value = fallbackInputs.b79;
          if (document.getElementById('rosterPool10')) document.getElementById('rosterPool10').value = fallbackInputs.b10;
          if (document.getElementById('rosterPool13')) document.getElementById('rosterPool13').value = fallbackInputs.b13;
        }
        const notice = document.getElementById('shelfSaveNotice');
        if (notice) {
          notice.textContent = '✓ Pulled Latest Pool & Nemesis Status from Supabase Cloud!';
          notice.classList.remove('hidden');
          setTimeout(() => notice.classList.add('hidden'), 3500);
        }
      }

      renderFactionBracketTable();

      if (data.nemesis_status && typeof document !== 'undefined') {
        if (data.nemesis_status.nem1 && document.getElementById('nemStatus1')) {
          document.getElementById('nemStatus1').value = data.nemesis_status.nem1;
        }
        if (data.nemesis_status.nem2 && document.getElementById('nemStatus2')) {
          document.getElementById('nemStatus2').value = data.nemesis_status.nem2;
        }
        if (data.nemesis_status.nem3 && document.getElementById('nemStatus3')) {
          document.getElementById('nemStatus3').value = data.nemesis_status.nem3;
        }
        saveRosterPageState();
      }

      if (typeof document !== 'undefined') {
        const badge = document.getElementById('cloudSyncBadge');
        if (badge) badge.textContent = '☁️ Cloud Pool Synced';
      }
      return true;
    } catch (e) {}
    return false;
  }

  function renderFactionBracketTable() {
    if (typeof document === 'undefined') return;
    const picker = document.getElementById('bracketFactionPicker');
    const box = document.getElementById('factionBracketDisplay');
    if (!picker || !box) return;

    const facName = picker.value || 'Space Marines';
    const facObj = (typeof HORDE_FACTIONS !== 'undefined')
      ? HORDE_FACTIONS.find(f => f.name === facName)
      : null;

    const customP = getFactionPoolFromStore(facName);
    const tables = (typeof HORDE_FACTION_SPAWN_TABLES !== 'undefined') ? HORDE_FACTION_SPAWN_TABLES : ROSTER_SPAWN_TABLES;
    const refTable = tables[facName] || {};

    const fmtRow = (customStr, refArr) => {
      if (customStr && customStr.trim()) return customStr;
      if (Array.isArray(refArr) && refArr.length > 0) return refArr.join(' • ');
      return `<span style="color:var(--red); font-style:italic;">⚠️ Horde Pool Empty for ${facName} — Configure above &amp; Sync to Cloud!</span>`;
    };

    box.innerHTML = `
      <div class="card" style="background:#0b0d13; margin-bottom:12px; border-left:4px solid var(--red);">
        <div style="font-weight:800; color:var(--gold); font-size:0.95rem;">
          ${facName} — Primary Rule: ${facObj ? facObj.ruleTitle : 'Faction Protocol'}
        </div>
        <div style="font-size:0.86rem; color:var(--text); margin-top:4px;">
          ${facObj ? (facObj.desc || facObj.ruleDesc || '') : ''}
        </div>
      </div>
      <table class="weapon-table">
        <thead>
          <tr>
            <th style="width:140px;">Spawn Roll Bracket</th>
            <th>Configured ${facName} Spawn Units</th>
          </tr>
        </thead>
        <tbody>
          <tr><td><strong>[3–4] (0–75 pts)</strong></td><td>${fmtRow(customP.b34, refTable.b34)}</td></tr>
          <tr><td><strong>[5–6] (76–150 pts)</strong></td><td>${fmtRow(customP.b56, refTable.b56)}</td></tr>
          <tr><td><strong>[7–9] (151–300 pts)</strong></td><td>${fmtRow(customP.b79, refTable.b79)}</td></tr>
          <tr><td><strong>[10–12] (301–550 pts)</strong></td><td>${fmtRow(customP.b10, refTable.b10)}</td></tr>
          <tr><td><strong>[13+] (551+ pts)</strong></td><td>${fmtRow(customP.b13, refTable.b13)}</td></tr>
        </tbody>
      </table>
    `;

    renderTtsUnitTypes(facName, customP, refTable);
  }

  /**
   * Pure helper: normalizes raw unit text by stripping leading dice or model quantities.
   *
   * @param {string} raw - Raw unit text.
   * @returns {string} Cleaned unit name.
   */
  function normalizeUnitType(raw) {
    if (!raw) return '';
    let s = String(raw).trim();
    s = s.replace(/^(?:\d+D\d+|\d+x|\d+|-|\+|D\d+)\s*/i, '');
    return s.trim();
  }

  /**
   * Pure helper: deduplicates shorter shorthand unit names when a longer, more descriptive
   * version already exists in the list.
   *
   * @param {string[]} units - Array of cleaned unit type names.
   * @returns {string[]} Deduplicated, alphabetically sorted array of unit types.
   */
  function deduplicateSimilarUnits(units) {
    const sorted = [...units].sort((a, b) => b.length - a.length);
    const result = [];

    for (const u of sorted) {
      const uNorm = u.toLowerCase().replace(/\s+(?:squad|veterans|unit|models?)$/i, '').trim();
      const exists = result.some(existing => {
        const exNorm = existing.toLowerCase().replace(/\s+(?:squad|veterans|unit|models?)$/i, '').trim();
        if (exNorm === uNorm) return true;
        if (exNorm === uNorm + 's' || uNorm === exNorm + 's') return true;
        if (exNorm.startsWith(uNorm) && (exNorm.length - uNorm.length <= 10)) return true;
        return false;
      });
      if (!exists) {
        result.push(u);
      }
    }
    return result.sort((a, b) => a.localeCompare(b));
  }

  /**
   * Pure functional core: extracts a sorted list of unique unit types used across
   * all threat brackets from either a standard spawn table object or a custom shelf pool.
   *
   * @param {object|string[]} tableOrPool - Spawn table or pool containing b34..b13 brackets or string array.
   * @returns {string[]} Sorted array of unique, normalized unit types.
   */
  function extractUniqueUnitTypes(tableOrPool) {
    if (!tableOrPool) return [];
    const rawEntries = [];
    if (Array.isArray(tableOrPool)) {
      rawEntries.push(...tableOrPool);
    } else if (typeof tableOrPool === 'object') {
      const keys = ['b34', 'b56', 'b79', 'b10', 'b13'];
      for (const k of keys) {
        const val = tableOrPool[k];
        if (Array.isArray(val)) {
          rawEntries.push(...val);
        } else if (typeof val === 'string' && val.trim()) {
          rawEntries.push(...val.split(','));
        }
      }
    }

    const unitMap = new Map();
    for (const entry of rawEntries) {
      if (!entry) continue;
      const subUnits = String(entry).split('+');
      for (const sub of subUnits) {
        const clean = normalizeUnitType(sub);
        if (clean && clean.length > 1) {
          const lowerKey = clean.toLowerCase();
          if (!unitMap.has(lowerKey)) {
            unitMap.set(lowerKey, clean);
          }
        }
      }
    }

    return deduplicateSimilarUnits(Array.from(unitMap.values()));
  }

  /**
   * Pure functional core: formats an ASCII/Markdown checklist of unit types
   * ready to be copied to the clipboard for Tabletop Simulator preparation.
   *
   * @param {string} factionName - Name of the Horde faction.
   * @param {string[]} unitTypes - Array of unique unit names.
   * @returns {string} Formatted checklist string.
   */
  function formatTtsUnitList(factionName, unitTypes = []) {
    const title = `+++ TABLETOP SIMULATOR (TTS) PREPARATION // ${factionName ? factionName.toUpperCase() : 'HORDE ARMY'} +++`;
    const sub = `Total Unique Unit Types Required: ${unitTypes.length}`;
    const lines = unitTypes.map(u => `[ ] ${u}`);
    return [title, sub, '------------------------------------------------', ...lines].join('\n');
  }

  /**
   * Renders the TTS unit types checklist tags and count badge for the currently selected faction.
   */
  function renderTtsUnitTypes(facName, customP, refTable) {
    if (typeof document === 'undefined') return;
    const box = document.getElementById('ttsUnitTypesBox');
    const countEl = document.getElementById('ttsUnitCount');
    const nameEl = document.getElementById('ttsFactionName');
    if (!box) return;

    if (nameEl) nameEl.textContent = facName;

    const hasCustom = Boolean(
      (customP?.b34 && customP.b34.trim()) ||
      (customP?.b56 && customP.b56.trim()) ||
      (customP?.b79 && customP.b79.trim()) ||
      (customP?.b10 && customP.b10.trim()) ||
      (customP?.b13 && customP.b13.trim())
    );
    const activeSource = hasCustom ? customP : refTable;
    const unitTypes = extractUniqueUnitTypes(activeSource);

    if (countEl) countEl.textContent = String(unitTypes.length);

    if (unitTypes.length === 0) {
      box.innerHTML = `<span style="color:var(--text-muted); font-size:0.85rem; font-style:italic;">No unit types detected in this pool.</span>`;
      return;
    }

    box.innerHTML = unitTypes.map(u => `
      <span class="rule-tag" style="background:#0b0e17; border-color:var(--border); color:#e2e8f0; font-size:0.82rem; padding:6px 10px; display:inline-flex; align-items:center; gap:6px;">
        <span style="color:var(--gold);">•</span> ${u}
      </span>
    `).join('');
  }

  /**
   * Copies the Tabletop Simulator preparation checklist to the clipboard and triggers SFX.
   */
  function copyTtsUnitTypesList() {
    if (typeof document === 'undefined') return;
    const picker = document.getElementById('bracketFactionPicker');
    const facName = picker?.value || 'Space Marines';
    const customP = getFactionPoolFromStore(facName);
    const tables = (typeof HORDE_FACTION_SPAWN_TABLES !== 'undefined') ? HORDE_FACTION_SPAWN_TABLES : (typeof ROSTER_SPAWN_TABLES !== 'undefined' ? ROSTER_SPAWN_TABLES : {});
    const refTable = tables[facName] || {};

    const hasCustom = Boolean(
      (customP?.b34 && customP.b34.trim()) ||
      (customP?.b56 && customP.b56.trim()) ||
      (customP?.b79 && customP.b79.trim()) ||
      (customP?.b10 && customP.b10.trim()) ||
      (customP?.b13 && customP.b13.trim())
    );
    const activeSource = hasCustom ? customP : refTable;
    const unitTypes = extractUniqueUnitTypes(activeSource);
    const text = formatTtsUnitList(facName, unitTypes);

    const nav = (typeof window !== 'undefined' && window.navigator) ? window.navigator : (typeof navigator !== 'undefined' ? navigator : null);
    if (nav && nav.clipboard && typeof nav.clipboard.writeText === 'function') {
      nav.clipboard.writeText(text);
    }

    if (typeof window !== 'undefined' && window.VoxAudio && typeof window.VoxAudio.playClank === 'function') {
      window.VoxAudio.playClank('card');
    }

    const notice = document.getElementById('ttsCopyNotice');
    if (notice) {
      notice.classList.remove('hidden');
      setTimeout(() => notice.classList.add('hidden'), 2500);
    }
  }

  function saveRosterPageState() {
    if (typeof document === 'undefined' || typeof localStorage === 'undefined') return;
    try {
      const state = {
        activeRosterTab,
        bracketFactionPicker: document.getElementById('bracketFactionPicker')?.value || 'Space Marines',
        nemStatus1: document.getElementById('nemStatus1')?.value || 'roaming',
        nemStatus2: document.getElementById('nemStatus2')?.value || 'roaming',
        nemStatus3: document.getElementById('nemStatus3')?.value || 'roaming',
        nemReportChannel: document.getElementById('nemReportChannel')?.value || 'alpha',
        nemReportSector: document.getElementById('nemReportSector')?.value || '',
        nemReportUnit: document.getElementById('nemReportUnit')?.value || '',
        nemReportFeat: document.getElementById('nemReportFeat')?.value || '',
        nemReportNotes: document.getElementById('nemReportNotes')?.value || ''
      };
      localStorage.setItem(ROSTER_STATE_KEY, JSON.stringify(state));
    } catch (e) {}
  }

  function initRosterPage() {
    if (typeof document === 'undefined') return;
    const picker = document.getElementById('bracketFactionPicker');
    if (picker && typeof HORDE_FACTIONS !== 'undefined') {
      picker.innerHTML = HORDE_FACTIONS.map(f => `<option value="${f.name}">${f.name} (${f.group})</option>`).join('');
    }

    let savedFaction = 'Space Marines';
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(ROSTER_STATE_KEY);
        if (raw) {
          const s = JSON.parse(raw);
          if (s.bracketFactionPicker && picker) {
            picker.value = s.bracketFactionPicker;
            savedFaction = s.bracketFactionPicker;
          }
          if (s.nemStatus1 && document.getElementById('nemStatus1')) document.getElementById('nemStatus1').value = s.nemStatus1;
          if (s.nemStatus2 && document.getElementById('nemStatus2')) document.getElementById('nemStatus2').value = s.nemStatus2;
          if (s.nemStatus3 && document.getElementById('nemStatus3')) document.getElementById('nemStatus3').value = s.nemStatus3;
          if (s.nemReportChannel && document.getElementById('nemReportChannel')) document.getElementById('nemReportChannel').value = s.nemReportChannel;
          if (s.nemReportSector && document.getElementById('nemReportSector')) document.getElementById('nemReportSector').value = s.nemReportSector;
          if (s.nemReportUnit && document.getElementById('nemReportUnit')) document.getElementById('nemReportUnit').value = s.nemReportUnit;
          if (s.nemReportFeat && document.getElementById('nemReportFeat')) document.getElementById('nemReportFeat').value = s.nemReportFeat;
          if (s.nemReportNotes && document.getElementById('nemReportNotes')) document.getElementById('nemReportNotes').value = s.nemReportNotes;
          if (s.activeRosterTab) switchRosterTab(s.activeRosterTab, false);
        }
      }
    } catch (e) {}

    const activeFac = (picker && picker.value) ? picker.value : savedFaction;
    loadFactionInputs(activeFac);
    updateNemesisPreview();
    renderFactionBracketTable();
    pullSharedPoolsFromCloud();
  }

  if (typeof window !== 'undefined') {
    window.switchRosterTab = switchRosterTab;
    window.buildNemesisDossierString = buildNemesisDossierString;
    window.updateNemesisPreview = updateNemesisPreview;
    window.updateNemesisDossierPreview = updateNemesisDossierPreview;
    window.compileNemesisDossier = compileNemesisDossier;
    window.transmitNemesisDossier = transmitNemesisDossier;
    window.getStoredPoolRoot = getStoredPoolRoot;
    window.getFactionPoolFromStore = getFactionPoolFromStore;
    window.loadFactionInputs = loadFactionInputs;
    window.onFactionPickerChange = onFactionPickerChange;
    window.saveShelfBarracks = saveShelfBarracks;
    window.syncPoolsToSupabaseCloud = syncPoolsToSupabaseCloud;
    window.pullSharedPoolsFromCloud = pullSharedPoolsFromCloud;
    window.renderFactionBracketTable = renderFactionBracketTable;
    window.extractUniqueUnitTypes = extractUniqueUnitTypes;
    window.formatTtsUnitList = formatTtsUnitList;
    window.renderTtsUnitTypes = renderTtsUnitTypes;
    window.copyTtsUnitTypesList = copyTtsUnitTypesList;
    window.saveRosterPageState = saveRosterPageState;
    window.initRosterPage = initRosterPage;

    window.addEventListener('DOMContentLoaded', initRosterPage);
    window.addEventListener('vox:page-swapped', () => {
      if (document.getElementById('rosTabNemesis')) initRosterPage();
    });
  }

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      ROSTER_STATE_KEY,
      CUSTOM_POOL_STORAGE_KEY,
      HORDE_FACTION_SPAWN_TABLES: (typeof HORDE_FACTION_SPAWN_TABLES !== 'undefined' ? HORDE_FACTION_SPAWN_TABLES : (typeof window !== 'undefined' ? window.HORDE_FACTION_SPAWN_TABLES : {})),
      switchRosterTab,
      compileNemesisDossier,
      readNemesisFormInputs,
      buildNemesisDossierString,
      updateNemesisPreview,
      updateNemesisDossierPreview,
      transmitNemesisDossier,
      resetNemesisDossierForm,
      getStoredPoolRoot,
      getFactionPoolFromStore,
      loadFactionInputs,
      onFactionPickerChange,
      saveShelfBarracks,
      syncPoolsToSupabaseCloud,
      pullSharedPoolsFromCloud,
      renderFactionBracketTable,
      normalizeUnitType,
      deduplicateSimilarUnits,
      extractUniqueUnitTypes,
      formatTtsUnitList,
      renderTtsUnitTypes,
      copyTtsUnitTypesList,
      saveRosterPageState,
      initRosterPage
    };
  }
