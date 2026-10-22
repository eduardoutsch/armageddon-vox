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

# Astropathic Courier Gemini Notebook Thread URLs (Required for vox_bridge.js)
ALPHA_THREAD_URL=https://gemini.google.com/app/<your-alpha-thread-id>
BETA_THREAD_URL=https://gemini.google.com/app/<your-beta-thread-id>

````

---

## File: `vox_bridge.js` <a id="file-voxbridgejs"></a>

````javascript
/**
 * Dual-Thread Concurrent Astropathic Courier Bridge (v5.1 - Bulletproof + Smart Intercept Routing)
 * - Strictly targets <model-response> (never user <message-content>)
 * - Preserves full paragraph (\n\n), line-break (\n), and bullet-point spacing
 * - Strips all Gemini Notebook citation chips ("MD", "+ 2", "+ 4", "")
 * - Routes test/simulated interferences to sender's own screen (and catches missing opening <INTERCEPT> tags)
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { chromium } = require('playwright');

const GREEN = '\x1b[92m';
function logGreen(text) {
  console.log(`${GREEN}${text}`);
}

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
  for (const [k, v] of Object.entries(env)) {
    if (typeof v === 'string' && (v.startsWith('sb_secret_') || (k.toUpperCase().includes('SUPABASE') && !v.startsWith('http')))) {
      if (v.trim().length > 10) return v.trim();
    }
  }
  return '';
}

/**
 * Resolves the Astropathic Courier thread URLs for Alpha and Beta channels strictly from environment variables.
 *
 * @param {object} [env=process.env] - The environment dictionary.
 * @returns {{ alphaThreadUrl: string, betaThreadUrl: string }} The resolved URLs.
 */
function resolveThreadUrls(env = process.env) {
  return {
    alphaThreadUrl: (env && typeof env.ALPHA_THREAD_URL === 'string' ? env.ALPHA_THREAD_URL : '').trim(),
    betaThreadUrl: (env && typeof env.BETA_THREAD_URL === 'string' ? env.BETA_THREAD_URL : '').trim()
  };
}

const SUPABASE_URL = (process.env.SUPABASE_URL || 'https://dsfvhjjalexqpbzqoaqb.supabase.co').trim();
const SERVICE_KEY = resolveServiceKey();

const { alphaThreadUrl: ALPHA_THREAD_URL, betaThreadUrl: BETA_THREAD_URL } = resolveThreadUrls();

logGreen('----------------------------------------------------------------');
logGreen('[SYSTEM DIAGNOSTICS // ASTROPATHIC COURIER v5.1 BULLETPROOF]');
logGreen(` -> SUPABASE_URL : ${SUPABASE_URL}`);
logGreen(` -> SERVICE_KEY  : ${SERVICE_KEY ? `LOADED (${SERVICE_KEY.slice(0, 14)}...)` : 'MISSING! Check your .env file!'}`);
logGreen(` -> TAB 1 (EXILE): ${ALPHA_THREAD_URL || 'MISSING! Define ALPHA_THREAD_URL in .env'}`);
logGreen(` -> TAB 2 (JUNE) : ${BETA_THREAD_URL || 'MISSING! Define BETA_THREAD_URL in .env'}`);
logGreen('----------------------------------------------------------------');

const headers = {
  'Content-Type': 'application/json',
  'apikey': SERVICE_KEY
};

const CHAT_INPUT_SELECTOR = 'rich-textarea div.ql-editor, div.ql-editor[contenteditable="true"], div[role="textbox"][contenteditable="true"], textarea';
const SEND_BUTTON_SELECTOR = 'button.send-button, button[aria-label*="Send"], button[aria-label*="Enviar"]';
const MODEL_TURN_SELECTOR = 'model-response';

let typingLock = Promise.resolve();

/**
 * Extracts clean text from the last <model-response> element in the browser,
 * removing all Notebook source citation badges ("MD", "+ 2", etc.) AND
 * preserving exact paragraph (\n\n), line-break (\n), and bullet spacing!
 */
async function extractCleanLastModelResponse(page) {
  const raw = await page.evaluate((sel) => {
    const nodes = document.querySelectorAll(sel);
    if (!nodes || nodes.length === 0) return { count: 0, text: '' };
    const lastNode = nodes[nodes.length - 1];
    const clone = lastNode.cloneNode(true);

    // 1. Remove Gemini Notebook source citation badge elements & buttons
    const junkSelectors = [
      'source-footnote',
      'sources-carousel',
      'sources-list',
      'citation-marker',
      'sup',
      '[data-test-id*="citation"]',
      '[data-test-id*="source"]',
      'button[aria-label*="source"]',
      'button[aria-label*="fonte"]',
      '.citation',
      '.source-chip',
      'mat-chip',
      'model-thoughts'
    ];
    junkSelectors.forEach(s => {
      clone.querySelectorAll(s).forEach(el => el.remove());
    });

    // 2. Remove any small inline pill/button whose text is just "MD" or "+ 2"
    clone.querySelectorAll('button, span, a, div').forEach(el => {
      if (el.children.length === 0) {
        const t = (el.textContent || '').trim();
        if (/^(MD|\+\s*\d+)$/.test(t)) {
          el.remove();
        }
      }
    });

    // 3. Explicitly inject newlines into the detached clone so <p>, <br>, <li>, etc.
    // never glue together when reading textContent/innerText!
    clone.querySelectorAll('br').forEach(br => {
      br.replaceWith('\n');
    });

    clone.querySelectorAll('li').forEach(li => {
      li.prepend('\n• ');
      li.append('\n');
    });

    clone.querySelectorAll('p, h1, h2, h3, h4, h5, h6, pre, blockquote, hr, tr').forEach(block => {
      block.prepend('\n\n');
      block.append('\n\n');
    });

    return {
      count: nodes.length,
      text: (clone.textContent || '').trim()
    };
  }, MODEL_TURN_SELECTOR);

  return {
    count: raw.count,
    text: scrubArtifacts(raw.text)
  };
}

/**
 * Secondary regex scrubber & paragraph formatter:
 * - Strips any remaining citation tags
 * - Guarantees clean spacing around +++ banners, [HEADERS]:, and bullet points
 */
function scrubArtifacts(str) {
  if (!str) return '';
  return str
    // Remove "[cite: 1, 2]" style tags if any appear
    .replace(/\[cite:\s*[\d,\s]+\]/gi, '')
    // Remove standalone "MD" followed by optional "+ N"
    .replace(/[ \t]*\bMD\b(?:\s*\+\s*\d+)?/g, '')
    // Remove standalone "+ 1", "+ 2", "+ 4" lines left by citation counters
    .replace(/^\s*\+\s*\d+\s*$/gm, '')
    // Ensure a newline after closing "+++" header banners if glued to next word
    .replace(/(\+{3})([A-Za-z\[])/g, '$1\n\n$2')
    // Ensure a blank line before closing/opening "+++" banners if glued to a period
    .replace(/([.!?])\s*(\+{3})/g, '$1\n\n$2')
    // Ensure a blank line before bracketed section headers like "[CONDUIT LOG]:"
    .replace(/([.!?])\s*(\[[A-Z0-9\s&//\-_]+\]:)/g, '$1\n\n$2')
    // Ensure a newline before bullet points if glued
    .replace(/([^\n])\s*(•\s+)/g, '$1\n$2')
    // Clean up duplicate bullets "• • " if Gemini already had a bullet inside <li>
    .replace(/•\s*[•\-*]\s*/g, '• ')
    // Clean up trailing spaces before newlines
    .replace(/[ \t]+\n/g, '\n')
    // Collapse 3+ consecutive newlines into a clean double-newline paragraph break
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function waitForBulletproofReply(page, prevState, msgShortId, channelTag) {
  const maxWaitMs = 120000;
  const start = Date.now();

  logGreen(`[WAITING // ${channelTag}] Waiting for new <model-response> (Previous count:${prevState.count})...`);

  // Helper: returns true if text is just Gemini's "Conectando a Gemini Notebook" tool spinner
  const isToolLoadingBanner = (t) => {
    if (!t || t.length < 80) {
      if (/conectando|connecting|thinking|pensando|analisando|searching|buscando|loading|carregando/i.test(t || '')) {
        return true;
      }
      // A real Imperial dispatch is always >80 chars and starts with +++ or <DIRECT_REPLY>
      if (!/<DIRECT_REPLY|\+{3}|REF-ID/i.test(t || '')) {
        return true;
      }
    }
    return false;
  };

  let newResponseStarted = false;
  while (Date.now() - start < 60000) {
    await page.waitForTimeout(1000);
    const curr = await extractCleanLastModelResponse(page);

    if (curr.count > prevState.count && curr.text.length > 5 && curr.text !== prevState.text) {
      newResponseStarted = true;
      break;
    }
    if (curr.text.includes(msgShortId) && curr.text !== prevState.text) {
      newResponseStarted = true;
      break;
    }
  }

  if (!newResponseStarted) {
    logGreen(`[WARNING // ${channelTag}] No new <model-response> detected within 60s! Aborting to prevent stale read.`);
    return '';
  }

  let lastText = '';
  let stableTicks = 0;

  while (Date.now() - start < maxWaitMs) {
    await page.waitForTimeout(1400);
    const curr = await extractCleanLastModelResponse(page);
    const text = curr.text;

    if (!text || text === prevState.text) continue;

    // CRITICAL FIX: Never count "Conectando a Gemini Notebook" or tool spinners as a finished reply!
    if (isToolLoadingBanner(text)) {
      logGreen(`[WAITING // ${channelTag}] Gemini is accessing Notebook tools ("${text.slice(0, 40)}")... waiting for actual reply...`);
      stableTicks = 0;
      lastText = text;
      continue;
    }

    const hasClosingTag = /<\/DIRECT_REPLY>/i.test(text);
    const hasOpenIntercept = /<INTERCEPT/i.test(text);
    const hasCloseIntercept = /<\/INTERCEPT>/i.test(text);
    const tagsComplete = hasClosingTag && (!hasOpenIntercept || hasCloseIntercept);

    if (text === lastText && text.length > 80) {
      stableTicks++;
      // If closing tags are present, 2 stable ticks (2.8s) is enough; otherwise require 5 ticks (7s)
      if ((tagsComplete && stableTicks >= 2) || stableTicks >= 5) {
        return text;
      }
    } else {
      lastText = text;
      stableTicks = 0;
    }
  }

  logGreen(`[WARNING // ${channelTag}] Stream max wait reached; returning captured text.`);
  return lastText;
}

async function processSingleMessage(msg, targetPage, options = {}) {
  const fetchFn = options.fetchFn || fetch;
  const supabaseUrl = options.supabaseUrl || SUPABASE_URL;
  const serviceKey = options.serviceKey || SERVICE_KEY;
  const logFn = options.logFn || logGreen;
  const waitForReplyFn = options.waitForReplyFn || waitForBulletproofReply;

  const isAlpha = msg.channel === 'alpha';
  const channelTag = isAlpha ? 'ALPHA // THE EXILE' : 'BETA // JUNEBUG';
  const otherChannel = isAlpha ? 'beta' : 'alpha';
  const originLabel = isAlpha
    ? 'LOWER DECKS VOX-BLEED (SANCTUARY OF ASH)'
    : 'RIVAL WARHOST VOX-BLEED (LORD COMMANDER JUNEBUG)';
  const msgShortId = msg.id ? msg.id.slice(0, 8) : '00000000';

  logFn(`\n[INCOMING TRANSMISSION -> ${channelTag}] MSG_ID: ${msgShortId} \vert{} From:${msg.sender || 'Unknown'}`);
  logFn(`   Payload: "${(msg.question || '').slice(0, 90)}..."`);

  const inputLocator = targetPage.locator(CHAT_INPUT_SELECTOR).first();
  try {
    await inputLocator.waitFor({ state: 'visible', timeout: 8000 });
  } catch (e) {
    logFn(`[WARNING // ${channelTag}] Chat input box not visible on tab. Retrying next cycle...`);
    return false;
  }

  const prevState = await extractCleanLastModelResponse(targetPage);

  const channelSpecificRules = isAlpha
    ? [
      `   - FOR CHANNEL ALPHA (THE EXILE):`,
      `     * If the player is speaking to HIGH COMMAND (Logis-Prefect Vane): Vane sits in ORBIT. He ONLY knows official Administratum serial manifests and orbital augur scans. He DOES NOT KNOW internal ship details, the -3 to +3 Ship Slider, corpse-starch vats, Cell 09 / Dravik's resurrection or bleeding walls, or underground troop nicknames like "The Shrine-Breakers" (call them "your Leman Russ Vanquisher squadron" or "Vanquisher Hulls #44-V1 and #44-V2"!).`,
      `     * ONLY if the player explicitly addresses the Ship / "Ashen Spirit" / "Machine-Spirit" directly: Use PATTERN 4 and reply in a 100% COLD, ROBOTIC, CLINICAL MU-TH-UR 6000 / COGITATOR TELEMETRY VOICE (zero conversational prose—only raw sensor readouts, percentages, hull equilibrium index [-3 to +3], Cell 09 bio-sensors, and subroutine statuses).`
    ].join('\n')
    : [
      `   - FOR CHANNEL BETA (LORD COMMANDER JUNEBUG):`,
      `     * ZERO CROSS-PLAYER LEAKS: Treat Commander Alpha's dossier and SHIP.md as NON-EXISTENT. Never mention The Sanctuary of Ash's internal lore (unless he chooses to share ship in the future), The Exile, Dreir, Dravik, or "The Shrine-Breakers".`,
      `     * NO FACTION ASSUMPTIONS: Junebug will tell you his faction when he decides to play. This is an early game problem.`,
      `     * ORBITAL PERSPECTIVE ONLY: High Command (Logis-Prefect Vane) does NOT know what happens inside JUNEBUG's flagship corridors unless JUNEBUG explicitly tells High Command in his message!`
    ].join('\n');

  const prompt = [
    `[PRIVATE TERMINAL CONDUIT: ${msg.channel.toUpperCase()} // SENDER: ${msg.sender} // MSG_ID:${msgShortId}]`,
    `Transmission Payload:`,
    `${msg.question}`,
    ``,
    `CAMPAIGN MASTER DIRECTIVES (MANDATORY AUTONOMOUS COMPLIANCE):`,
    `1. Follow the 5 Canonical Imperial CRT Dispatch Patterns in Section 2.B of AGENT.md (include ">>> REF-ID: ${msgShortId}" in the header and put clean blank lines between paragraphs/sections).`,
    `2. EXECUTE PRE-RESPONSE EPISTEMIC AUDIT (CRITICAL — DO NOT USE OMNISCIENT .MD LORE UNLESS THIS SPEAKER KNOWS IT IN-UNIVERSE):`,
    channelSpecificRules,
    `3. NEVER name-drop "The 3rd Alliance" or "Horde AI" (refer only to raw sensor anomalies/tremors), and NEVER leak unmapped Node 1-7 Hegemony numbers.`,
    `4. Reply inside <DIRECT_REPLY>...</DIRECT_REPLY> tags. If this is a Master Post-Battle or Nemesis Dossier, christen custom in-universe Lore Names & Backstories for every attached Upgrade, Relic, and Scar and update the relevant .md source!`,
    `5. If warranted, also include an <INTERCEPT>...</INTERCEPT> block (with both opening <INTERCEPT> and closing </INTERCEPT> tags!) containing a cryptic, heavily redacted snippet (using [REDACTED]) for ${otherChannel.toUpperCase()}'s Interferences window.`
  ].join('\n');

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
  }).catch(err => logGreen(`[ERROR // ${channelTag}] Typing error:${err.message}`)));

  logGreen(`[DISPATCHED // ${channelTag}] Prompt sent (MSG_ID:${msgShortId}). Awaiting Campaign Master decree...`);

  const rawReply = await waitForReplyFn(targetPage, prevState, msgShortId, channelTag);

  if (!rawReply || rawReply === prevState.text) {
    logGreen(`[ERROR // ${channelTag}] No valid new response captured yet. Keeping MSG_ID ${msgShortId} in queue.`);
    return false;
  }

  const directMatch = rawReply.match(/<DIRECT_REPLY[^>]*>([\s\S]*?)<\/DIRECT_REPLY>/i);
  // Match standard <INTERCEPT>...</INTERCEPT>, OR fallback to text between </DIRECT_REPLY> and </INTERCEPT> if opening tag was omitted!
  const interceptMatch =
    rawReply.match(/<INTERCEPT([^>]*)>([\s\S]*?)<\/INTERCEPT>/i) ||
    rawReply.match(/<\/DIRECT_REPLY>\s*([\s\S]*?)<\/INTERCEPT>/i);

  const finalDirectReply = scrubArtifacts(directMatch ? directMatch[1] : rawReply);

  const reqHeaders = {
    'Content-Type': 'application/json',
    'apikey': serviceKey
  };

  const patchRes = await fetchFn(`${supabaseUrl}/rest/v1/vox_messages?id=eq.${msg.id}`, {
    method: 'PATCH',
    headers: reqHeaders,
    body: JSON.stringify({
      reply: finalDirectReply,
      status: 'answered',
      answered_at: new Date().toISOString()
    })
  });

  if (!patchRes.ok) {
    logFn(`[ERROR // ${channelTag}] Failed to write reply to Supabase (${patchRes.status})`);
    return false;
  }

  const rawInterceptBody = interceptMatch
    ? (interceptMatch[2] !== undefined ? interceptMatch[2] : interceptMatch[1])
    : '';

  if (rawInterceptBody && rawInterceptBody.trim()) {
    const cleanIntercept = scrubArtifacts(rawInterceptBody);
    const interceptAttrs = (interceptMatch[2] !== undefined ? interceptMatch[1] : '') || '';

    // If the player asked to simulate/test an interference (or tag has target="self"), route to the sender's own Interferences tab!
    const isSelfTest =
      /simulate|test.*interference/i.test(msg.question || '') ||
      /target=["']?(self|same)/i.test(interceptAttrs);

    let destChannel = isSelfTest ? msg.channel : otherChannel;
    if (/target=["']?alpha/i.test(interceptAttrs)) destChannel = 'alpha';
    if (/target=["']?beta/i.test(interceptAttrs)) destChannel = 'beta';

    const destOriginLabel = isSelfTest
      ? 'ASHEN SPIRIT SYNTHETIC BLEED TEST // DECK 44 LOOPBACK'
      : originLabel;

    await fetchFn(`${supabaseUrl}/rest/v1/vox_interferences`, {
      method: 'POST',
      headers: reqHeaders,
      body: JSON.stringify({
        target_channel: destChannel,
        origin_hint: destOriginLabel,
        redacted_text: cleanIntercept
      })
    });
    logFn(`[INTERCEPT // ${channelTag}] Redacted psychic bleed transmitted to ${destChannel.toUpperCase()}!`);
  }

  logFn(`[DELIVERED // ${channelTag}] Verified reply for MSG_ID ${msgShortId} streamed to CRT terminal!`);
  return true;
}

async function drainChannelQueue(channelName, targetPage, options = {}) {
  const fetchFn = options.fetchFn || fetch;
  const supabaseUrl = options.supabaseUrl || SUPABASE_URL;
  const serviceKey = options.serviceKey !== undefined ? options.serviceKey : SERVICE_KEY;
  const logFn = options.logFn || logGreen;

  if (!serviceKey) {
    logFn(`[CONFIG WARNING // ${channelName.toUpperCase()}] SERVICE_KEY is missing! Check .env file.`);
    return 0;
  }

  const reqHeaders = {
    'Content-Type': 'application/json',
    'apikey': serviceKey
  };

  let processedCount = 0;
  while (true) {
    const res = await fetchFn(
      `${supabaseUrl}/rest/v1/vox_messages?channel=eq.${channelName}&status=eq.pending&order=created_at.asc`,
      { headers: reqHeaders }
    );

    if (!res.ok) {
      const errText = await res.text();
      logFn(`[ERROR // ${channelName.toUpperCase()} QUEUE (${res.status})]: ${errText}`);
      break;
    }

    const queue = await res.json();
    if (!Array.isArray(queue) || queue.length === 0) {
      break;
    }

    logFn(`[QUEUE // ${channelName.toUpperCase()}] ${queue.length} pending transmission(s) in Supabase.`);

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

async function runDualThreadCourier({ env = process.env, logFn = logGreen } = {}) {
  const { alphaThreadUrl, betaThreadUrl } = resolveThreadUrls(env);

  if (!alphaThreadUrl || !betaThreadUrl) {
    logFn('[FATAL ERROR] ALPHA_THREAD_URL and BETA_THREAD_URL must be defined in your .env file!');
    return false;
  }

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
  await alphaPage.goto(alphaThreadUrl, { waitUntil: 'domcontentloaded' });

  const betaPage = await context.newPage();
  logGreen('>> Opening Tab 2 (Commander Beta // JUNEBUG)...');
  await betaPage.goto(betaThreadUrl, { waitUntil: 'domcontentloaded' });

  try {
    const initCheck = await fetch(`${SUPABASE_URL}/rest/v1/vox_messages?status=eq.pending&select=id,channel,sender`, { headers });
    const initData = await initCheck.json();
    logGreen('================================================================');
    logGreen('++ DUAL-CONDUIT PARALLEL BRIDGE v5.1 (SMART INTERCEPT) ONLINE ++');
    logGreen(`++ Pending Transmissions in Supabase: ${Array.isArray(initData) ? initData.length : JSON.stringify(initData)}`);
    logGreen('================================================================');
  } catch (e) {
    logGreen(`[BOOT ERROR] Could not reach Supabase: ${e.message}`);
  }

  let busyAlpha = false;
  let busyBeta = false;

  setInterval(() => {
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
}

module.exports = {
  resolveServiceKey,
  resolveThreadUrls,
  scrubArtifacts,
  extractCleanLastModelResponse,
  waitForBulletproofReply,
  processSingleMessage,
  drainChannelQueue,
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
