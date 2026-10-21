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
