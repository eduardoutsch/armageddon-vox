# 📦 Fires of Armageddon // Bundle: Packages, Configuration & Documentation

NPM package manifests, Cloudflare Pages deployment configs, repository documentation, and non-negotiable engineering directives.

## 📑 Table of Contents
- [package.json](#file-packagejson)
- [wrangler.jsonc](#file-wranglerjsonc)
- [README.md](#file-readmemd)
- [AGENTS.md](#file-agentsmd)
- [.gitignore](#file-gitignore)
- [.env.example](#file-envexample)
- [vox_bridge.js](#file-voxbridgejs)
- [vox_autopilot.bat](#file-voxautopilotbat)

---

## File: `package.json` <a id="file-packagejson"></a>

````json
{
  "name": "fires-of-armageddon",
  "version": "1.0.0",
  "description": "Warhammer 40,000 Horde Mode Suite // Spawner, PvP Wastes, Rogue AI Sector & Rosters",
  "scripts": {
    "test": "node --test \"tests/**/*.test.js\"",
    "bundle": "node scripts/generate_bundles.js",
    "vox:bridge": "node vox_bridge.js"
  },
  "keywords": [
    "warhammer-40k",
    "horde-mode",
    "tabletop-companion"
  ],
  "author": "",
  "license": "MIT",
  "dependencies": {
    "dotenv": "^18.0.8",
    "playwright": "^1.64.1"
  }
}
````

---

## File: `wrangler.jsonc` <a id="file-wranglerjsonc"></a>

````json
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "armageddon-vox",
  "compatibility_date": "2026-10-19",
  "assets": {
    "directory": "."
  }
}
````

---

## File: `README.md` <a id="file-readmemd"></a>

````markdown
# ⚔️ Fires of Armageddon // Warhammer 40,000 Horde Mode Suite

A web-based mission runner, dynamic spawner, and companion suite designed for cooperative and solo Warhammer 40k Horde Mode battles, 1v1 Ash Wastes PvP skirmishes, narrative campaign tracking, and real-time Astropathic Vox relay.

---

## 🎮 Game Modes & Features

- **📖 Field Codex & Command Launchpad (`index.html`)**  
  Central briefing console, quickstart guides, mode overviews, and unified tactical navigation across all Munitorum operations.

- **🧟 Mode 1: Horde Command & Spawner (`pages/spawner.html`)**  
  Automated horde spawning with seed-synchronized zone generation, wave escalation mechanics, misery card deck management, and faction-specific tactical rules.

- **⚔️ Mode 2: 1v1 Ash Wastes PvP (`pages/pvp.html`)**  
  Competitive wasteland skirmish rules, hazardous environmental effects, dynamic primary and secondary objectives.

- **🎲 Mode 3: Rogue Sector & AI Tracker (`pages/rogue.html`)**  
  Co-op and solo automated AI decision engine, behavioral priority trees, and target acquisition rules for non-player units.

- **🎖️ Mode 4: Hostile Matrix & Nemesis Archive (`pages/roster.html`)**  
  Enemy roster configurations across threat brackets, nemesis tracking, custom shelf barracks, and one-click Nemesis Dossier induction compiler.

- **🏆 Mode 5: Crusade Command & Quartermaster (`pages/crusade.html`)**  
  3-Way Alliance Scoreboard (Imperium, Chaos, Xenos), 4-Phase Branching Narrative Trees, Random Upgrade Rollers (Traits, Mods, Relics, Scars), and Master Post-Battle Dossier Compiler.

- **📜 Mode 6: Briefings, Ship & Atlas (`pages/briefing.html`)**  
  Interactive planetary atlas with 8-node sector SVG map, 3-way Parallel Hegemony Race tracker, narrative lore briefings, and orbital command support assets.

- **📡 Mode 7: Astropathic CRT Vox-Terminal (`pages/vox.html`)**  
  Recessed cathode-ray green & amber phosphor monitor, Conduit Pass-Seal security, real-time CRT teletype audio streaming, and psychic interferences array.

- **⚡ Astropathic Courier Gemini Bridge (`vox_bridge.js` & `vox_autopilot.bat`)**  
  Dual-thread concurrent automation bridge connecting Supabase message queues directly with live Google Gemini web sessions (Commander Alpha & Commander Beta conduits). Automates Campaign Master decrees, unit christenings, and psychic interferences bleed.

---

## 📂 Repository Structure

- `index.html` — Root entry point (Sanctuary Field Codex & Command Launchpad).
- `pages/` — Suite HTML views (`spawner.html`, `briefing.html`, `pvp.html`, `rogue.html`, `roster.html`, `crusade.html`, `vox.html`, `welcome.html`).
- `vox_bridge.js` — Dual-thread Playwright automation courier bridging Supabase and Gemini notebook sessions.
- `vox_autopilot.bat` — Windows launch script with auto-dependency installer and environment setup.
- `bundles/` — Modular Markdown ingestion bundles per page (`bundle_index.md`, `bundle_briefing.md`, `bundle_crusade.md`, `bundle_vox.md`, etc.), engine modules (`bundle_javascript.md`), test suites (`bundle_tests.md`), tactical styles (`bundle_css.md`), and packages (`bundle_packages.md`).
- `assets/` — Static icons and vector assets (`favicon.svg`, `favicon.png`).
- `css/` — Shared application stylesheets (`style.css`).
- `js/` — Modular client-side logic (`data.js`, `rng.js`, `spawner.js`, `app.js`, `vox-audio.js`).
- `scripts/` — Utility generators (`generate_bundles.js`).
- `tests/` — Automated Node test suites mirroring `js/` (`tests/js/`), root logic (`tests/vox_bridge.test.js`), and UI boundary tests (`tests/ui/`).

---

## 🧪 Testing & Verification

Run the complete 100% pass verification test suite:

```bash
npm test
```

Synchronize all modular Markdown ingestion bundles:

```bash
npm run bundle
```

Start the Astropathic Courier Gemini Bridge:

```bash
npm run vox:bridge
# or execute on Windows:
vox_autopilot.bat
```

---

## 🚀 Deployment & Hosting

Designed for static hosting on **Cloudflare Pages** (unlimited free bandwidth and automated builds from private Git repository) or any static web host.

---

## 💻 Tech Stack

- Zero-dependency client-side architecture (HTML5, Modern CSS, Vanilla JavaScript, Web Audio API).
- Serverless Supabase Real-Time Backend with RLS-protected RPC functions.
- Headless / Persistent Playwright Browser Courier for live Campaign Master AI interfacing.
- Fully responsive and optimized for tablet and mobile play at the tabletop.
- Instant, deterministic seed generator for synchronized multi-player spawning.
````

---

## File: `AGENTS.md` <a id="file-agentsmd"></a>

````markdown
# Engineering Principles // AGENTS.md

To ensure that our codebase—whether written by human developers or autonomous AI agents (such as Google Antigravity, OPSX, and automated coding assistants)—remains cohesive, testable, maintainable, and simple, we adopt foundational, non-negotiable engineering principles.

These principles MUST guide any and all new implementations, refactoring, or modifications in this repository.

## I. Everything in English
The entire repository MUST **STRICTLY** be in English. This includes, but is not limited to: documentation, specifications, architecture notes, code comments, function names, class and module names, UI labels, test descriptions, and variable names. No foreign-language identifiers or comments are permitted.

## II. Independent Components (Feature-First & Modular Architecture)
Every feature MUST be built in a modular fashion.
- Components, modules, and utilities must be self-contained, independently testable, and clearly documented.
- Avoid creating empty wrapper classes, components, or functions that exist solely for superficial organizational purposes; every component must have a clear functional responsibility.
- Do not mix business rules or core state logic into monolithic UI files. Maintain a clean separation of concerns (e.g., pure logic, algorithms, and data structures separated from DOM rendering and user interaction).

## III. 100% Test Coverage Target
Any submitted change must strive for and target 100% test coverage (covering unit, integration, and UI component paths). This standard is non-negotiable.

## IV. Test-First Imperative (TDD)
Test-Driven Development (TDD) is **mandatory** and non-negotiable.
- ANY production logic or UI module MUST have a corresponding test suite file in the `tests/` directory, **strictly mirroring the directory structure of the source** (e.g., `js/<module>.js` MUST have `tests/js/<module>.test.js`, and UI/integration tests must live in `tests/ui/`).
- Tests MUST be written and executed first (and must initially fail) before starting any production code implementation.
- The Red-Green-Refactor cycle must be strictly followed for every new feature, rule addition, or logical unit introduced.

## V. Boundary and UI/Integration Tests First
Prioritize testing system boundaries, component interfaces, and integration flows before descending into irrelevant internal implementation details.
- Component, UI, and integration tests MUST be prioritized to validate realistic end-to-end user workflows.
- This guarantees the integrity of the user interface as a cohesive whole and ensures that visual, functional, and user-facing requirements are satisfied right from the start of development.

## VI. Simplicity and Anti-Abstraction
Code MUST be simple, declarative, and effortless to comprehend.
- Avoid premature abstractions, speculative generality, and "clever" code (unnecessary cognitive overhead).
- Follow the golden rule: *"A little duplication is far better than the wrong abstraction."*
- Concurrently, practice prudent DRY (Don't Repeat Yourself): avoid repetitive boilerplate when it can be abstracted in an obvious, simple manner for straightforward reuse.

## VII. Continuous and Comprehensive Documentation
Clean code does NOT substitute for thorough technical documentation.
- All implementations MUST be well-documented using structured docstrings / JSDoc blocks (`/** ... */`) across functions, classes, and modules, articulating *the why* (intent and architectural rationale) and not merely *the what* (the raw mechanical action).
- Every new module, capability, or architectural change MUST be reflected with improvements and updates in the relevant `README.md` and documentation files.
- Documentation is a living artifact and an inseparable part of delivering software value.

## VIII. Modular Codebase Bundles Synchronization (`/bundles/` Directory)
Any and all changes made to the codebase (files added, modified, renamed, or deleted) MUST immediately and continuously be reflected in the modular markdown bundles in `/bundles/` via `npm run bundle` / `node scripts/generate_bundles.js`.
- The `/bundles` directory provides modular, page-by-page and component-focused ingestion artifacts for Gemini Notebook and NotebookLM (`bundle_index.md`, `bundle_javascript.md`, `bundle_tests.md`, `bundle_briefing.md`, `bundle_pvp.md`, `bundle_rogue.md`, `bundle_roster.md`, `bundle_welcome.md`, `bundle_css.md`, and `bundle_packages.md`).
- Each bundle maintains an up-to-date Table of Contents with working anchor links to its constituent project files.
- All code fences in each bundle MUST use quadruple backticks (` ````lang `) to prevent formatting conflicts with nested code blocks or Markdown documentation.
- No task, commit, or pull request is considered complete until all modular bundles in `/bundles/` have been regenerated, verified, and kept in sync with the current repository state.

---
> **Note for Autonomous Agents**: You are strictly required to treat this document as the highest-priority directive when planning architecture, suggesting refactoring, or implementing new routines and features (including operations performed via Google Antigravity, OPSX, or autonomous workflows). **Whenever you create, modify, or delete any file in the repository, you MUST regenerate and synchronize the modular `/bundles/` directory before concluding your turn.**
````

---

## File: `.gitignore` <a id="file-gitignore"></a>

````gitignore
# OS metadata
.DS_Store
Thumbs.db
desktop.ini

# Editor files
.vscode/
.idea/
*.swp
*.swo

# Node / Scratch
node_modules/
*.log
.wrangler/
scratch/
chrome_vox_profile/
.env
.env.*
!.env.example

````

---

## File: `.env.example` <a id="file-envexample"></a>

````text
# Supabase Configuration Template
# Copy this file to .env and fill in your actual project values.
SUPABASE_URL=https://<your-project-id>.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...

# Astropathic Courier Gemini Notebook Thread URLs (Optional Overrides)
# ALPHA_THREAD_URL=https://gemini.google.com/app/e834be114b163dea
# BETA_THREAD_URL=https://gemini.google.com/app/0c0b15a075182321

````

---

## File: `vox_bridge.js` <a id="file-voxbridgejs"></a>

````javascript
/**
 * Dual-Thread Concurrent Astropathic Courier Bridge
 * - Connects Supabase vox_messages with live Gemini web sessions.
 * - Tab 1 (Alpha / The Exile):   https://gemini.google.com/app/e834be114b163dea
 * - Tab 2 (Beta / JUNEBUG):      https://gemini.google.com/app/0c0b15a075182321
 */
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { chromium } = require('playwright');

// Lock terminal output to bright CRT Phosphor Green with standard reset
const GREEN = '\x1b[92m';
const RESET = '\x1b[0m';

/**
 * Logs phosphor green text to the terminal and resets formatting.
 * @param {string} text - Message to log.
 */
function logGreen(text) {
  console.log(`${GREEN}${text}${RESET}`);
}

/**
 * Auto-detects the Supabase Service Key from environment variables across standard aliases.
 * @param {Record<string, string|undefined>} [env=process.env] - Environment object to query.
 * @returns {string} The detected service key or empty string.
 */
function resolveServiceKey(env = process.env) {
  const candidates = [
    env.SUPABASE_SERVICE_ROLE_KEY,
    env.SUPABASE_SECRET_KEY,
    env.SERVICE_ROLE_KEY,
    env.SUPABASE_KEY,
    env.SECRET_KEY,
    env.API_KEY
  ];
  for (const c of candidates) {
    if (c && typeof c === 'string' && c.trim().length > 10) return c.trim();
  }
  // Fallback: scan all env values for 'sb_secret_' or 'SUPABASE' JWT tokens
  for (const [k, v] of Object.entries(env)) {
    if (typeof v === 'string' && (v.startsWith('sb_secret_') || (k.toUpperCase().includes('SUPABASE') && !v.startsWith('http')))) {
      if (v.trim().length > 10) return v.trim();
    }
  }
  return '';
}

const SUPABASE_URL = (process.env.SUPABASE_URL || 'https://dsfvhjjalexqpbzqoaqb.supabase.co').trim();
const SERVICE_KEY = resolveServiceKey();

const ALPHA_THREAD_URL = (process.env.ALPHA_THREAD_URL || 'https://gemini.google.com/app/e834be114b163dea').trim();
const BETA_THREAD_URL = (process.env.BETA_THREAD_URL || 'https://gemini.google.com/app/0c0b15a075182321').trim();

const CHAT_INPUT_SELECTOR = 'rich-textarea div.ql-editor, div.ql-editor[contenteditable="true"], div[role="textbox"][contenteditable="true"], textarea';
const SEND_BUTTON_SELECTOR = 'button.send-button, button[aria-label*="Send"], button[aria-label*="Enviar"]';
const MODEL_RESPONSE_SELECTOR = 'model-response, .model-response-text, message-content, [data-message-author-role="model"]';

let typingLock = Promise.resolve();

/**
 * Builds the structured Campaign Master prompt for Gemini.
 * @param {Object} msg - The incoming transmission object.
 * @returns {string} The fully assembled prompt text.
 */
function buildDispatchPrompt(msg) {
  const channel = (msg.channel || 'alpha').toLowerCase();
  const otherChannel = channel === 'alpha' ? 'beta' : 'alpha';
  const sender = msg.sender || 'Unknown Sender';
  const question = msg.question || '';

  return [
    `[PRIVATE TERMINAL CONDUIT: ${channel.toUpperCase()} // SENDER:${sender}]`,
    `Transmission Payload:`,
    `${question}`,
    ``,
    `CAMPAIGN MASTER DIRECTIVES:`,
    `1. Reply in-character inside <DIRECT_REPLY>...</DIRECT_REPLY> tags. If this is a Master Post-Battle Dossier or Nemesis Dossier, christen custom in-universe Lore Names & Backstories for every attached unit Upgrade, Relic, and Battle Scar!`,
    `2. Update the relevant Notebook Markdown source (AGENT.md, NEMESIS.md, SHIP.md, or ${sender}'s Dossier.md) if this logs a permanent battle result, Nemesis, or Secret Objective code.`,
    `3. If deemed relevant, also include an <INTERCEPT>...</INTERCEPT> block with a cryptic, heavily redacted snippet (using [REDACTED]) for ${otherChannel.toUpperCase()}'s Interferences window.`
  ].join('\n');
}

/**
 * Parses raw Gemini output into direct reply and psychic intercept text.
 * @param {string} rawReply - Raw response from Gemini.
 * @returns {{ directReply: string, interceptText: string|null }}
 */
function parseGeminiReply(rawReply) {
  if (!rawReply || typeof rawReply !== 'string') {
    return { directReply: '', interceptText: null };
  }

  const directMatch = rawReply.match(/<DIRECT_REPLY>([\s\S]*?)<\/DIRECT_REPLY>/i);
  const interceptMatch = rawReply.match(/<INTERCEPT>([\s\S]*?)<\/INTERCEPT>/i);

  const directReply = (directMatch ? directMatch[1] : rawReply).trim();
  const interceptText = (interceptMatch && interceptMatch[1].trim()) ? interceptMatch[1].trim() : null;

  return { directReply, interceptText };
}

/**
 * Waits for Gemini's streaming output to reach steady-state.
 * @param {import('playwright').Page} page - Playwright page.
 * @param {number} prevResponseCount - Previous model response count.
 * @param {string} channelTag - Channel label for logging.
 * @param {Object} [options={}] - Optional tuning parameters.
 * @returns {Promise<string>} Stabilized response text.
 */
async function waitForGeminiReply(page, prevResponseCount, channelTag, options = {}) {
  const maxWaitMs = options.maxWaitMs || 95000;
  const checkIntervalMs = options.checkIntervalMs || 1300;
  const logFn = options.logFn || logGreen;
  const start = Date.now();

  // Wait for new model-response element to appear
  while (Date.now() - start < 35000) {
    const currentCount = await page.locator(MODEL_RESPONSE_SELECTOR).count();
    if (currentCount > prevResponseCount) break;
    await page.waitForTimeout(1000);
  }

  let lastText = '';
  let stableTicks = 0;

  // Poll until text stabilizes for 3 consecutive checks
  while (Date.now() - start < maxWaitMs) {
    await page.waitForTimeout(checkIntervalMs);
    const responses = page.locator(MODEL_RESPONSE_SELECTOR);
    const count = await responses.count();
    if (count === 0) continue;

    const currentText = (await responses.last().innerText().catch(() => '')).trim();

    if (currentText.length > 0 && currentText === lastText) {
      stableTicks++;
      if (stableTicks >= 3) {
        return currentText;
      }
    } else {
      lastText = currentText;
      stableTicks = 0;
    }
  }

  logFn(`[WARNING // ${channelTag}] Stream timeout reached; returning current text buffer.`);
  return lastText;
}

/**
 * Injects a single transmission into the target Gemini tab and captures the decree.
 * @param {Object} msg - Transmission record from Supabase.
 * @param {import('playwright').Page} targetPage - Target Playwright tab.
 * @param {Object} [options={}] - Dependency injection options.
 * @returns {Promise<boolean>} True if processed and answered successfully.
 */
async function processSingleMessage(msg, targetPage, options = {}) {
  const fetchFn = options.fetchFn || fetch;
  const supabaseUrl = options.supabaseUrl || SUPABASE_URL;
  const serviceKey = options.serviceKey || SERVICE_KEY;
  const logFn = options.logFn || logGreen;

  const isAlpha = msg.channel === 'alpha';
  const channelTag = isAlpha ? 'ALPHA // THE EXILE' : 'BETA // JUNEBUG';
  const otherChannel = isAlpha ? 'beta' : 'alpha';
  const originLabel = isAlpha
    ? 'LOWER DECKS VOX-BLEED (SANCTUARY OF ASH)'
    : 'RIVAL WARHOST VOX-BLEED (LORD COMMANDER JUNEBUG)';

  logFn(`\n[INCOMING TRANSMISSION -> ${channelTag}] ID: ${msg.id.slice(0, 8)} | From:${msg.sender}`);
  logFn(`   Payload: "${(msg.question || '').slice(0, 90)}..."`);

  const inputLocator = targetPage.locator(CHAT_INPUT_SELECTOR).first();
  try {
    await inputLocator.waitFor({ state: 'visible', timeout: 8000 });
  } catch (e) {
    logFn(`[WARNING // ${channelTag}] Chat input box not visible on tab (${targetPage.url()}). Retrying next cycle...`);
    return false;
  }

  const prevResponseCount = await targetPage.locator(MODEL_RESPONSE_SELECTOR).count();
  const prompt = buildDispatchPrompt(msg);

  await (typingLock = typingLock.then(async () => {
    await targetPage.bringToFront();
    await targetPage.waitForTimeout(250);
    await inputLocator.click({ force: true });
    await targetPage.waitForTimeout(150);

    await targetPage.keyboard.press('Control+A');
    await targetPage.keyboard.press('Backspace');
    await targetPage.keyboard.insertText(prompt);
    await targetPage.waitForTimeout(400);

    const sendBtn = targetPage.locator(SEND_BUTTON_SELECTOR).first();
    if (await sendBtn.count() > 0 && await sendBtn.isEnabled().catch(() => false)) {
      await sendBtn.click();
    } else {
      await targetPage.keyboard.press('Enter');
    }
    await targetPage.waitForTimeout(300);
  }).catch(err => logFn(`[ERROR // ${channelTag}] Typing error: ${err.message}`)));

  logFn(`[DISPATCHED // ${channelTag}] Transmission injected into Gemini! Awaiting Campaign Master decree...`);

  const rawReply = await waitForGeminiReply(targetPage, prevResponseCount, channelTag, { logFn });

  if (!rawReply) {
    logFn(`[ERROR // ${channelTag}] Empty response captured. Keeping message in queue for retry.`);
    return false;
  }

  const { directReply, interceptText } = parseGeminiReply(rawReply);

  const headers = {
    'Content-Type': 'application/json',
    'apikey': serviceKey
  };

  try {
    const patchRes = await fetchFn(`${supabaseUrl}/rest/v1/vox_messages?id=eq.${msg.id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({
        reply: directReply,
        status: 'answered',
        answered_at: new Date().toISOString()
      })
    });

    if (!patchRes.ok) {
      logFn(`[ERROR // ${channelTag}] Failed to write reply to Supabase (${patchRes.status})`);
      return false;
    }
  } catch (err) {
    logFn(`[ERROR // ${channelTag}] Supabase PATCH network failure: ${err.message}`);
    return false;
  }

  if (interceptText) {
    try {
      await fetchFn(`${supabaseUrl}/rest/v1/vox_interferences`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          target_channel: otherChannel,
          origin_hint: originLabel,
          redacted_text: interceptText
        })
      });
      logFn(`[INTERCEPT // ${channelTag}] Redacted psychic bleed transmitted to ${otherChannel.toUpperCase()}!`);
    } catch (err) {
      logFn(`[WARNING // ${channelTag}] Intercept post error: ${err.message}`);
    }
  }

  logFn(`[DELIVERED // ${channelTag}] Campaign Master reply streamed to CRT terminal!`);
  return true;
}

/**
 * Fetches and processes all pending messages for a given channel queue.
 * @param {string} channelName - 'alpha' or 'beta'.
 * @param {import('playwright').Page} targetPage - Playwright page.
 * @param {Object} [options={}] - Options for testing or execution.
 * @returns {Promise<number>} Count of processed messages.
 */
async function drainChannelQueue(channelName, targetPage, options = {}) {
  const fetchFn = options.fetchFn || fetch;
  const supabaseUrl = options.supabaseUrl || SUPABASE_URL;
  const serviceKey = options.serviceKey !== undefined ? options.serviceKey : SERVICE_KEY;
  const logFn = options.logFn || logGreen;

  if (!serviceKey) {
    logFn(`[CONFIG WARNING // ${channelName.toUpperCase()}] SERVICE_KEY is missing! Set SUPABASE_SERVICE_ROLE_KEY in .env.`);
    return 0;
  }

  const headers = {
    'Content-Type': 'application/json',
    'apikey': serviceKey
  };

  let processedCount = 0;

  while (true) {
    let res;
    try {
      res = await fetchFn(
        `${supabaseUrl}/rest/v1/vox_messages?channel=eq.${channelName}&status=eq.pending&order=created_at.asc`,
        { headers }
      );
    } catch (err) {
      logFn(`[ERROR // ${channelName.toUpperCase()} QUEUE FETCH]: ${err.message}`);
      break;
    }

    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      logFn(`[ERROR // ${channelName.toUpperCase()} QUEUE (${res.status})]: ${errText}`);
      break;
    }

    const queue = await res.json();
    if (!Array.isArray(queue) || queue.length === 0) {
      break;
    }

    logFn(`[QUEUE // ${channelName.toUpperCase()}] ${queue.length} pending transmission(s) detected in Supabase!`);

    const oldestMsg = queue[0];
    const ok = await processSingleMessage(oldestMsg, targetPage, {
      fetchFn,
      supabaseUrl,
      serviceKey,
      logFn
    });

    if (!ok) break;

    processedCount++;
    if (typeof targetPage.waitForTimeout === 'function') {
      await targetPage.waitForTimeout(1500);
    }
  }

  return processedCount;
}

/**
 * Prints system diagnostics on startup.
 */
function logDiagnostics() {
  logGreen('----------------------------------------------------------------');
  logGreen('[SYSTEM DIAGNOSTICS // ASTROPATHIC COURIER]');
  logGreen(` -> SUPABASE_URL : ${SUPABASE_URL}`);
  logGreen(` -> SERVICE_KEY  : ${SERVICE_KEY ? `LOADED (${SERVICE_KEY.slice(0, 14)}...)` : 'MISSING! Check your .env file!'}`);
  logGreen(` -> TAB 1 (EXILE): ${ALPHA_THREAD_URL}`);
  logGreen(` -> TAB 2 (JUNE) : ${BETA_THREAD_URL}`);
  logGreen('----------------------------------------------------------------');
}

/**
 * Main daemon runner initializing Playwright and parallel channel polling.
 */
async function runDualThreadCourier() {
  logDiagnostics();

  const profileDir = path.join(__dirname, 'chrome_vox_profile');
  const context = await chromium.launchPersistentContext(profileDir, {
    headless: false,
    channel: 'chrome',
    ignoreDefaultArgs: ['--enable-automation'],
    args: [
      '--disable-blink-features=AutomationControlled',
      '--no-sandbox'
    ],
    viewport: { width: 1280, height: 860 }
  });

  const alphaPage = context.pages()[0] || await context.newPage();
  logGreen('>> Opening Tab 1 (Commander Alpha // The Exile)...');
  await alphaPage.goto(ALPHA_THREAD_URL, { waitUntil: 'domcontentloaded' });

  const betaPage = await context.newPage();
  logGreen('>> Opening Tab 2 (Commander Beta // JUNEBUG)...');
  await betaPage.goto(BETA_THREAD_URL, { waitUntil: 'domcontentloaded' });

  const headers = {
    'Content-Type': 'application/json',
    'apikey': SERVICE_KEY
  };

  try {
    const initCheck = await fetch(`${SUPABASE_URL}/rest/v1/vox_messages?status=eq.pending&select=id,channel,sender`, { headers });
    const initData = await initCheck.json();
    logGreen('================================================================');
    logGreen('++ DUAL-CONDUIT PARALLEL BRIDGE ONLINE ++');
    logGreen(`++ Pending Transmissions in Supabase: ${Array.isArray(initData) ? initData.length : JSON.stringify(initData)}`);
    logGreen('================================================================');
  } catch (e) {
    logGreen(`[BOOT ERROR] Could not reach Supabase: ${e.message}`);
  }

  let busyAlpha = false;
  let busyBeta = false;

  const pollInterval = setInterval(() => {
    if (!busyAlpha) {
      busyAlpha = true;
      drainChannelQueue('alpha', alphaPage)
        .catch(err => logGreen(`[ERROR // ALPHA QUEUE]: ${err.message}`))
        .finally(() => { busyAlpha = false; });
    }

    if (!busyBeta) {
      busyBeta = true;
      drainChannelQueue('beta', betaPage)
        .catch(err => logGreen(`[ERROR // BETA QUEUE]: ${err.message}`))
        .finally(() => { busyBeta = false; });
    }
  }, 5000);

  const shutdown = async () => {
    logGreen('\n[TERMINATING // ASTROPATHIC COURIER] Severing conduits and closing browser...');
    clearInterval(pollInterval);
    await context.close().catch(() => {});
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

module.exports = {
  resolveServiceKey,
  buildDispatchPrompt,
  parseGeminiReply,
  waitForGeminiReply,
  processSingleMessage,
  drainChannelQueue,
  logDiagnostics,
  runDualThreadCourier
};

if (require.main === module) {
  runDualThreadCourier().catch(err => {
    console.error('[FATAL // ASTROPATHIC COURIER]', err);
    process.exit(1);
  });
}
````

---

## File: `vox_autopilot.bat` <a id="file-voxautopilotbat"></a>

````text
@echo off
setlocal
cd /d "%~dp0"
color 0A
title Segmentum Solar // Dual-Thread Astropathic Courier
echo ================================================================
echo  ASTROPATHIC VOX-BRIDGE (SUPABASE ^<--^> GOOGLE ONE NOTEBOOK)
echo  Active Directory: %CD%
echo ================================================================

where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not found in PATH! Please install Node.js 18+ to proceed.
    pause
    exit /b 1
)

if not exist "%~dp0.env" (
    if exist "%~dp0.env.example" (
        echo [NOTICE] .env file not detected. Creating .env from .env.example template...
        copy "%~dp0.env.example" "%~dp0.env" >nul
        echo [ACTION REQUIRED] Please edit .env with your SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY!
    )
)

if not exist "%~dp0node_modules\playwright" (
    echo Installing Playwright and dotenv in current directory...
    call npm.cmd install playwright dotenv
    call npx.cmd playwright install chromium
)

echo Launching Dual-Thread Courier...
node "%~dp0vox_bridge.js"
pause
````
