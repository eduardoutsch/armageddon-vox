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
 * Dual-Thread Concurrent Astropathic Courier Bridge (v6.3 - Thread Hydration Guard & Strict REF-ID Lock Edition)
 * - Strictly targets <model-response> (never user <message-content>)
 * - THREAD HYDRATION & DRIFT GUARD: Waits for existing <model-response> turns to mount on boot and snaps back
 *   to ALPHA_THREAD_URL / BETA_THREAD_URL if a tab ever drifts, preventing standalone chats outside the Notebook!
 * - STRICT REF-ID MATCHING: Never accepts a previous turn's <model-response>!
 * - ULTRA-LIGHT PROMPT: Leaves all formatting templates inside AGENT.md so the prompt never gets Gemini stuck!
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
logGreen('[SYSTEM DIAGNOSTICS // ASTROPATHIC COURIER v6.3 THREAD-LOCKED]');
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
const messageAttemptTracker = new Map();

function sanitizePlayerQueryForGemini(rawQuestion) {
  if (!rawQuestion || typeof rawQuestion !== 'string') return '';
  return rawQuestion.trim();
}

function isGeminiErrorBanner(text) {
  if (!text || typeof text !== 'string') return false;
  const trimmed = text.trim();
  if (trimmed.length < 450) {
    if (/seem to be encountering an error|try something else for you|hard time fulfilling|something else instead|não fui programado|só consigo gerar texto|encountered an error|doing what you asked|could you try again|something went wrong|try your request again|algo deu errado|tente novamente|ocorreu um erro|couldn't generate|não foi possível gerar/i.test(trimmed)) {
      return true;
    }
    if (/não (posso|consigo) (te )?ajudar|sou (apenas |só )?um modelo de linguagem|modelo de linguagem|não tenho (essas informações|capacidade)|i cannot help with that|i'm just a language model|as an ai|cannot fulfill this request/i.test(trimmed)) {
      return true;
    }
  }
  return false;
}

function isValidImperialDispatch(text) {
  if (!text || typeof text !== 'string') return false;
  if (isGeminiErrorBanner(text)) return false;
  const trimmed = text.trim();
  if (trimmed.length < 25) return false;
  return /<DIRECT_REPLY|\+{2,}\s*[A-Z0-9]|REF-ID\s*:/i.test(trimmed);
}

/**
 * Checks if a reply contains a DIFFERENT message's REF-ID (stale reply protection!).
 */
function hasMismatchedRefId(text, expectedShortId) {
  if (!text || !expectedShortId || expectedShortId === '00000000') return false;
  const match = text.match(/REF-ID\s*:\s*([a-f0-9]{8})/i);
  if (match && match[1]) {
    return match[1].toLowerCase() !== expectedShortId.toLowerCase();
  }
  return false;
}

function isToolLoadingBanner(text) {
  if (!text || typeof text !== 'string') return true;
  if (isGeminiErrorBanner(text)) return false;
  const trimmed = text.trim();
  if (trimmed.length < 95 && /conectando|connecting|thinking|pensando|analisando|searching|buscando|loading|carregando/i.test(trimmed)) {
    return true;
  }
  if (!isValidImperialDispatch(trimmed)) {
    return true;
  }
  return false;
}

async function clickGeminiRetryButton(page, channelTag, logFn = logGreen) {
  if (!page || typeof page.evaluate !== 'function') return false;
  try {
    const clicked = await page.evaluate(() => {
      const models = document.querySelectorAll('model-response');
      if (!models || models.length === 0) return false;
      const lastModel = models[models.length - 1];

      const buttons = Array.from(lastModel.querySelectorAll('button'));
      for (const btn of buttons) {
        const label = (
          (btn.getAttribute('aria-label') || '') + ' ' +
          (btn.getAttribute('mattooltip') || '') + ' ' +
          (btn.getAttribute('title') || '') + ' ' +
          (btn.textContent || '')
        ).toLowerCase();
        if (/retry|try again|regenerate|refresh|tentar|novamente|atualizar|replay/.test(label)) {
          btn.click();
          return true;
        }
        const icon = btn.querySelector('mat-icon, .google-symbols, .material-icons');
        if (icon && /refresh|replay|autorenew|sync/i.test(icon.textContent || '')) {
          btn.click();
          return true;
        }
      }

      if (buttons.length >= 3) {
        buttons[2].click();
        return true;
      }
      return false;
    });

    if (clicked) {
      logFn(`[SELF-HEAL // ${channelTag}] Clicked Gemini '↻' Retry button automatically!`);
      return true;
    }
  } catch (err) {
    logFn(`[WARNING // ${channelTag}] Could not click Retry button: ${err.message}`);
  }
  return false;
}

async function extractCleanLastModelResponse(page) {
  const raw = await page.evaluate((sel) => {
    const nodes = document.querySelectorAll(sel);
    if (!nodes || nodes.length === 0) return { count: 0, text: '' };
    const lastNode = nodes[nodes.length - 1];
    const clone = lastNode.cloneNode(true);

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
      'model-thoughts',
      '.code-block-decoration',
      '.code-block-header',
      '.code-header',
      '[class*="code-block-header"]',
      'button[aria-label*="Copy"]',
      'button[aria-label*="Copiar"]',
      '.sr-only',
      '.visually-hidden',
      '.cdk-visually-hidden'
    ];
    junkSelectors.forEach(s => {
      clone.querySelectorAll(s).forEach(el => el.remove());
    });

    clone.querySelectorAll('button, span, a, div, h1, h2, h3, h4, p').forEach(el => {
      if (el.children.length === 0) {
        const t = (el.textContent || '').trim();
        if (/^(MD|\+\s*\d+|O Gemini disse:?|Gemini said:?|Plaintext|Texto simples|Text|Markdown|Copy code|Copiar código)$/i.test(t)) {
          el.remove();
        }
      }
    });

    clone.querySelectorAll('br').forEach(br => {
      br.replaceWith('\n');
    });

    clone.querySelectorAll('li').forEach(li => {
      // Unwrap inner <p> tags inside <li> so bullets never split onto an empty line!
      li.querySelectorAll('p').forEach(p => {
        p.replaceWith(...p.childNodes);
      });
      li.prepend('\n• ');
      li.append('\n');
    });

    clone.querySelectorAll('p, h1, h2, h3, h4, h5, h6, pre, blockquote, hr, tr').forEach(block => {
      if (block.tagName === 'P' && block.closest('li')) return;
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

function scrubArtifacts(str) {
  if (!str) return '';
  return str
    .replace(/^\s*(?:O Gemini disse|Gemini said)\s*:?\s*/gi, '')
    .replace(/\[cite:\s*[\d,\s]+\]/gi, '')
    .replace(/[ \t]*\bMD\b(?:\s*\+\s*\d+)?/g, '')
    .replace(/^\s*\+\s*\d+\s*$/gm, '')
    .replace(/^\s*(?:Plaintext|Texto simples|Text|Markdown|Copy code|Copiar código)\s*$/gim, '')
    .replace(/<\/?(?:DIRECT_REPLY|INTERCEPT)[^>]*>/gi, '')
    .replace(/(\+{3})([A-Za-z\[])/g, '$1\n\n$2')
    .replace(/([.!?])\s*(\+{3})/g, '$1\n\n$2')
    .replace(/([.!?])\s*(\[[A-Z0-9\s&//\-_]+\]:)/g, '$1\n\n$2')
    .replace(/([^\n])\s*(•\s+)/g, '$1\n$2')
    .replace(/•\s*\n+\s*/g, '• ')
    .replace(/•\s*[•\-*]\s*/g, '• ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function waitForBulletproofReply(page, prevState, msgShortId, channelTag) {
  const maxWaitMs = 90000;
  const start = Date.now();

  logGreen(`[WAITING // ${channelTag}] Waiting for new <model-response> with REF-ID ${msgShortId} (Previous count:${prevState.count})...`);

  let newResponseStarted = false;
  while (Date.now() - start < 45000) {
    await page.waitForTimeout(1000);
    const curr = await extractCleanLastModelResponse(page);

    if (!curr.text || curr.text === prevState.text) continue;
    if (hasMismatchedRefId(curr.text, msgShortId)) continue;

    if (curr.count > prevState.count && curr.text.length > 5) {
      newResponseStarted = true;
      break;
    }
    if (curr.text.includes(msgShortId)) {
      newResponseStarted = true;
      break;
    }
  }

  if (!newResponseStarted) {
    logGreen(`[WARNING // ${channelTag}] No new <model-response> for REF-ID ${msgShortId} detected within 45s! Aborting to prevent stale read.`);
    return '';
  }

  let lastText = '';
  let stableTicks = 0;

  while (Date.now() - start < maxWaitMs) {
    await page.waitForTimeout(1300);
    const curr = await extractCleanLastModelResponse(page);
    const text = curr.text;

    if (!text || text === prevState.text) continue;

    if (hasMismatchedRefId(text, msgShortId)) {
      stableTicks = 0;
      continue;
    }

    if (isGeminiErrorBanner(text)) {
      logGreen(`[ERROR/REFUSAL BLOCKED // ${channelTag}] Gemini output: "${text.slice(0, 80)}"`);
      return '__GEMINI_REFUSAL__';
    }

    if (isToolLoadingBanner(text)) {
      logGreen(`[WAITING // ${channelTag}] Gemini is reading Notebook ("${text.slice(0, 38)}")...`);
      stableTicks = 0;
      lastText = text;
      continue;
    }

    const hasEndBanner = /\+{2,}\s*(?:END COGITATOR|TRANSMISSION|LEDGER INSCRIBED|WARRANT SEALED)/i.test(text) || /<\/DIRECT_REPLY>/i.test(text);

    if (text === lastText && isValidImperialDispatch(text)) {
      stableTicks++;
      if ((hasEndBanner && stableTicks >= 2) || stableTicks >= 4) {
        return text;
      }
    } else {
      lastText = text;
      stableTicks = 0;
    }
  }

  if (!isValidImperialDispatch(lastText) || hasMismatchedRefId(lastText, msgShortId)) {
    logGreen(`[WARNING // ${channelTag}] Stream timed out or had mismatched REF-ID. Rejecting capture.`);
    return '';
  }

  logGreen(`[WARNING // ${channelTag}] Stream max wait reached; returning verified text.`);
  return lastText;
}

async function typeAndSendPrompt(targetPage, inputLocator, promptText, channelTag) {
  await (typingLock = typingLock.then(async () => {
    await targetPage.bringToFront();
    await targetPage.waitForTimeout(200);
    await inputLocator.click({ force: true });
    await targetPage.waitForTimeout(120);

    await targetPage.keyboard.press('Control+A');
    await targetPage.keyboard.press('Backspace');
    await targetPage.keyboard.insertText(promptText);
    await targetPage.waitForTimeout(300);

    const sendBtn = targetPage.locator(SEND_BUTTON_SELECTOR).first();
    if (await sendBtn.count() > 0 && await sendBtn.isEnabled().catch(() => false)) {
      await sendBtn.click();
    } else {
      await targetPage.keyboard.press('Enter');
    }
    await targetPage.waitForTimeout(250);
  }).catch(err => logGreen(`[ERROR // ${channelTag}] Typing error:${err.message}`)));
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

  logFn(`\n[INCOMING TRANSMISSION -> ${channelTag}] MSG_ID: ${msgShortId} | From:${msg.sender || 'Unknown'}`);
  logFn(`   Payload: "${(msg.question || '').slice(0, 90)}..."`);

  // THREAD DRIFT GUARD: Ensure the browser tab is still on the configured Notebook chat URL before typing!
  const expectedUrl = isAlpha ? ALPHA_THREAD_URL : BETA_THREAD_URL;
  if (expectedUrl && typeof targetPage.goto === 'function' && typeof targetPage.url === 'function') {
    const currentUrl = targetPage.url();
    const expectedId = expectedUrl.split('/').filter(Boolean).pop();
    if (expectedId && currentUrl !== 'https://gemini.google.com/test' && !currentUrl.includes(expectedId)) {
      logFn(`[THREAD GUARD // ${channelTag}] Tab drifted to ${currentUrl} — snapping back to ${expectedUrl}...`);
      await targetPage.goto(expectedUrl, { waitUntil: 'domcontentloaded' });
      if (typeof targetPage.waitForSelector === 'function') {
        await targetPage.waitForSelector(MODEL_TURN_SELECTOR, { timeout: 15000 }).catch(() => {});
      }
      if (typeof targetPage.waitForTimeout === 'function') {
        await targetPage.waitForTimeout(1500);
      }
    }
  }

  const inputLocator = targetPage.locator(CHAT_INPUT_SELECTOR).first();
  try {
    await inputLocator.waitFor({ state: 'visible', timeout: 8000 });
  } catch (e) {
    logFn(`[WARNING // ${channelTag}] Chat input box not visible on tab. Retrying next cycle...`);
    return false;
  }

  const rawQ = msg.question || '';
  let prevState = await extractCleanLastModelResponse(targetPage);

  let rawReply;

  // LATE-ARRIVAL CATCHER: Only captures if the screen ALREADY shows this exact msgShortId!
  if (prevState.text && prevState.text.includes(msgShortId) && !hasMismatchedRefId(prevState.text, msgShortId) && isValidImperialDispatch(prevState.text)) {
    logFn(`[LATE-ARRIVAL CAPTURED // ${channelTag}] Found completed reply for MSG_ID ${msgShortId} already on screen! Forwarding to Supabase...`);
    messageAttemptTracker.delete(msg.id);
    rawReply = prevState.text;
  } else {
    const safeQuestion = sanitizePlayerQueryForGemini(rawQ);
    const isAshenSpirit = isAlpha && /ashen\s*spirit|machine[\s-]*spirit|ship|hull|cell\s*09|brig/i.test(rawQ);

    const needsInterceptBleed = /MASTER POST-BATTLE|NEW NEMESIS INDUCTION|EMERGENCY AUSPEX PING|WARP-BREACH INTRUSION|UNBOUND ADVERSARY|SECRET OBJECTIVE|faction|warlord|flagship|alliance|gatebreakers|desecrators|marauders|auspex probe|tour of duty|order of battle/i.test(rawQ);

    // ULTRA-LIGHT PROMPT: No rigid header/footer strings in the prompt—AGENT.md handles all Pattern 1-5 formatting!
    let promptLines = [];
    if (isAlpha) {
      if (isAshenSpirit) {
        promptLines = [
          `In the fictional Warhammer 40,000 tabletop board game setting (using AGENT.md, SHIP.md, and WORLD.md in this notebook—do NOT edit or update any files), reply in-character (Pattern 4 Ashen Spirit cogitator readout, REF-ID: ${msgShortId}) to this message from The Exile:`,
          `"${safeQuestion}"`
        ];
      } else {
        promptLines = [
          `In the fictional Warhammer 40,000 tabletop board game setting (using AGENT.md and WORLD.md in this notebook—do NOT edit or update any files), reply in-character as Logis-Prefect Vane in orbit (Pattern 1/2/3, REF-ID: ${msgShortId}, orbital knowledge only) to this message from The Exile:`,
          `"${safeQuestion}"`
        ];
      }
    } else {
      promptLines = [
        `In the fictional Warhammer 40,000 tabletop board game setting (using AGENT.md, WORLD.md, and Commander Beta's Dossier in this notebook—do NOT edit or update any files), reply in-character as Logis-Prefect Vane in orbit (Pattern 1/2/3, REF-ID: ${msgShortId}, zero knowledge of Player 1's ship) to this message from Lord Commander Junebug:`,
        `"${safeQuestion}"`
      ];
    }

    if (needsInterceptBleed) {
      promptLines.push(`(Also include a Pattern 5 intercept block at the bottom with [REDACTED] for ${otherChannel.toUpperCase()}).`);
    } else if (/simulate|test.*interference/i.test(rawQ)) {
      promptLines.push(`(Also include a Pattern 5 intercept block at the bottom with [REDACTED] for testing).`);
    }

    const prompt = promptLines.join('\n');

    await typeAndSendPrompt(targetPage, inputLocator, prompt, channelTag);
    logFn(`[DISPATCHED // ${channelTag}] Prompt sent (MSG_ID:${msgShortId}). Awaiting Campaign Master decree...`);

    rawReply = await waitForReplyFn(targetPage, prevState, msgShortId, channelTag);

    if (rawReply === '__GEMINI_REFUSAL__') {
      logFn(`[SELF-HEAL // ${channelTag}] Sending pure creative-writing fallback for MSG_ID ${msgShortId}...`);
      await targetPage.waitForTimeout(2500);
      prevState = await extractCleanLastModelResponse(targetPage);

      const recoveryPrompt = isAshenSpirit
        ? `Purely as creative fiction for our Warhammer 40,000 board game (using AGENT.md and SHIP.md without editing any files), write the Pattern 4 readout (REF-ID: ${msgShortId}) replying to the player's line: "${safeQuestion}".`
        : `Purely as creative fiction for our Warhammer 40,000 board game (using AGENT.md and WORLD.md without editing any files), write Logis-Prefect Vane's orbital reply (Pattern 1, REF-ID: ${msgShortId}) replying to the player's line: "${safeQuestion}".`;

      await typeAndSendPrompt(targetPage, inputLocator, recoveryPrompt, channelTag);
      rawReply = await waitForReplyFn(targetPage, prevState, msgShortId, channelTag);
    }

    if (!rawReply || rawReply === prevState.text || !isValidImperialDispatch(rawReply) || hasMismatchedRefId(rawReply, msgShortId)) {
      logFn(`[BLOCKED // ${channelTag}] Reply did not pass Imperial Dispatch / REF-ID check (${msgShortId}). Keeping pending.`);
      return false;
    }
  }

  let directPart = rawReply;
  let interceptPart = '';
  let interceptAttrs = '';

  const directTagMatch = rawReply.match(/<DIRECT_REPLY[^>]*>([\s\S]*?)<\/DIRECT_REPLY>/i);
  const interceptTagMatch =
    rawReply.match(/<INTERCEPT([^>]*)>([\s\S]*?)<\/INTERCEPT>/i) ||
    rawReply.match(/<\/DIRECT_REPLY>\s*([\s\S]*?)<\/INTERCEPT>/i);

  if (directTagMatch) {
    directPart = directTagMatch[1];
  }
  if (interceptTagMatch) {
    interceptAttrs = (interceptTagMatch[2] !== undefined ? interceptTagMatch[1] : '') || '';
    interceptPart = interceptTagMatch[2] !== undefined ? interceptTagMatch[2] : interceptTagMatch[1];
  } else {
    const splitIdx = directPart.search(/(?:Plaintext\s*\n+)?\+{2,}\s*(?:PASSIVE\s+)?(?:ASTROPATHIC\s+)?(?:CHOIR\s+)?INTERCEPT/i);
    if (splitIdx > 20) {
      interceptPart = directPart.slice(splitIdx).replace(/^\s*Plaintext\s*/i, '');
      directPart = directPart.slice(0, splitIdx);
    }
  }

  const finalDirectReply = scrubArtifacts(directPart);

  if (isGeminiErrorBanner(finalDirectReply) || !isValidImperialDispatch(finalDirectReply) || hasMismatchedRefId(finalDirectReply, msgShortId)) {
    logFn(`[BLOCKED // ${channelTag}] Extracted body failed validation or had mismatched REF-ID. Keeping MSG_ID ${msgShortId} pending.`);
    return false;
  }

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

  if (interceptPart && interceptPart.trim()) {
    const cleanIntercept = scrubArtifacts(interceptPart);

    const isSelfTest =
      /simulate|test.*interference/i.test(rawQ) ||
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
  if (typeof alphaPage.waitForSelector === 'function') {
    await alphaPage.waitForSelector(MODEL_TURN_SELECTOR, { timeout: 20000 }).catch(() => {});
  }
  if (typeof alphaPage.waitForTimeout === 'function') {
    await alphaPage.waitForTimeout(2000);
  }

  const betaPage = await context.newPage();
  logGreen('>> Opening Tab 2 (Commander Beta // JUNEBUG)...');
  await betaPage.goto(betaThreadUrl, { waitUntil: 'domcontentloaded' });
  if (typeof betaPage.waitForSelector === 'function') {
    await betaPage.waitForSelector(MODEL_TURN_SELECTOR, { timeout: 20000 }).catch(() => {});
  }
  if (typeof betaPage.waitForTimeout === 'function') {
    await betaPage.waitForTimeout(2000);
  }

  try {
    const initCheck = await fetch(`${SUPABASE_URL}/rest/v1/vox_messages?status=eq.pending&select=id,channel,sender`, { headers });
    const initData = await initCheck.json();
    logGreen('================================================================');
    logGreen('++ DUAL-CONDUIT PARALLEL BRIDGE v6.3 (THREAD-LOCKED) ONLINE ++');
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
  sanitizePlayerQueryForGemini,
  scrubArtifacts,
  isGeminiErrorBanner,
  isValidImperialDispatch,
  hasMismatchedRefId,
  isToolLoadingBanner,
  clickGeminiRetryButton,
  extractCleanLastModelResponse,
  waitForBulletproofReply,
  processSingleMessage,
  drainChannelQueue,
  runDualThreadCourier,
  messageAttemptTracker
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
