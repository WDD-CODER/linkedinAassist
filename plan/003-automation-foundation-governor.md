# Plan: Automation Foundation & Governor (The "Plumbing")

**Links to:** project-plan.md (Smart Networking, Safety Mechanisms), todo 001, 005. Parent: [002-smart-networking.md](002-smart-networking.md).

## Why

You cannot risk the AI writing a scraper before the safety brakes (Governor) are functional. This feature builds the foundation and the hard limit first—no LinkedIn, no browser, no AI.

## Outcome

A Node script that logs **"Action permitted"** or **"Limit reached"** without touching LinkedIn. The `automation/` folder exists with strict TypeScript, `jitterDelay_()`, and a Daily Governor that reads/writes `data/stats.json`.

## Scope

- **In scope:** Root-level `automation/` project (package.json, strict tsconfig), `jitterDelay_()` (1000–3000 ms per [automation-stealth SKILL](.assistant/skills/automation-stealth/SKILL.md)), Daily Governor (10 actions per 24h, persist `action_count_` and `last_reset_timestamp_` in `data/stats.json`), and a small **runner script** that checks the governor and logs the result.
- **Out of scope:** Playwright, LinkedIn, scraping, Gemini, candidates API. No browser, no network (except local file I/O).

## Implementation

### 1. Project setup

- **Folder:** `automation/` at repo root.
- **Files:** `package.json` (Node, strict TypeScript, no Playwright yet), `tsconfig.json` (strict mode, no semicolons if aligned with Angular style).
- **Data directory:** `data/` at repo root (or inside `automation/`); create if missing. `data/stats.json` holds governor state.

### 2. Jitter utility

- **File:** `automation/src/jitter.ts`
- **Export:** `jitterDelay_(): Promise<void>` — delay a random number of ms between 1000 and 3000 (e.g. `Math.floor(Math.random() * 2000) + 1000`). Used later by the scraper; for this feature the runner can call it once before the governor check to prove it works.

### 3. Daily Governor

- **File:** `automation/src/daily-governor.ts`
- **State file:** `data/stats.json` with shape: `{ action_count_: number, last_reset_timestamp_: number }` (e.g. ISO date string or Unix ms; 24h reset by timestamp).
- **Logic:**
  - If `last_reset_timestamp_` is older than 24 hours, set `action_count_ = 0` and update `last_reset_timestamp_`.
  - If `action_count_ >= 10`, return a clear "limit reached" result (e.g. object or throw `AutomationError` per SKILL); do not increment.
  - If under limit: increment `action_count_`, persist, return "action permitted."
- **API:** Expose at least: `canPerformAction(): Promise<boolean>` and `recordAction(): Promise<void>`, or a single `requestAction(): Promise<{ permitted: boolean }>` that checks, and if permitted increments and persists. Caller uses this before any future "action" (e.g. one scrape + one draft).

### 4. Runner script

- **File:** `automation/src/run-governor-check.ts` (or `index.ts`) — runnable via `npm run check` or `node dist/run-governor-check.js`.
- **Behavior:** Optional: call `jitterDelay_()` once, then call governor `requestAction()` (or equivalent). Log to stdout: **"Action permitted"** or **"Limit reached"** (and optionally current count). No LinkedIn, no HTTP.

### 5. File summary

| Item        | Path |
| ----------- | ----- |
| Project     | `automation/package.json`, `automation/tsconfig.json` |
| Jitter      | `automation/src/jitter.ts` |
| Governor    | `automation/src/daily-governor.ts` |
| Runner      | `automation/src/run-governor-check.ts` |
| State       | `data/stats.json` (create on first run; ensure `data/` exists) |

## Success criteria

- From repo root or `automation/`: running the script prints **"Action permitted"** the first 10 times (or after 24h reset) and **"Limit reached"** on the 11th without touching LinkedIn.
- `data/stats.json` exists and updates correctly; after 24h (or mocked timestamp) the count resets and "Action permitted" is logged again.

## Open decisions

**1. Stats file location**

Where should `stats.json` live?

- **Option A:** `data/stats.json` at repo root (shared with future `candidates.json`; `data/` used by both Angular API and automation).
- **Option B:** `automation/data/stats.json` (scoped to automation only; other features can introduce repo-root `data/` later).

Recommendation: Option A so the same `data/` is the single place for all automation state and future API.
