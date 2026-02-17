# Plan: Smart Networking (Next Feature)

**Links to:** project-plan.md (Feature: Smart Networking), todo 003–006.

## Split into features (work one at a time)

| # | Feature | Plan | Outcome |
|---|---------|------|---------|
| 1 | **Automation Foundation & Governor** (The "Plumbing") | [003-automation-foundation-governor.md](003-automation-foundation-governor.md) | Node script logs "Action permitted" / "Limit reached"; no LinkedIn. |
| 2 | **Stealth Scraper & Auth** (The "Eyes") | [004-stealth-scraper-auth.md](004-stealth-scraper-auth.md) | Visit profile URL, save ScrapedProfile JSON (About/Experience). |
| 3 | **Intelligence & Candidate Pipeline** (The "Brain") | [005-intelligence-candidate-pipeline.md](005-intelligence-candidate-pipeline.md) | Scraped data → Gemini → candidates.json. |

Work on each feature by itself, in order. After reviewing the plan files, say which feature to start with.

## Context

- **Smart Networking**: Scan profiles, analyze (About, Experience, Posts), generate personalized connection requests via Gemini.
- **Order**: Stealth Engine (Playwright + scraper + governor) then Intelligence (Gemini). No Node/Playwright layer exists yet; Angular uses `src/core/` for services.

## Scope

- **In scope**: LinkedIn login via Playwright, profile scraper with jitter, daily 10-action governor, Gemini draft generation, shared data format and store so the dashboard can later show candidates. No “Send” click; full Approval Workflow UI can be the next feature.
- **Out of scope**: Autonomous send; full edit/approve UI (optional minimal list in this feature—see Open Decisions).

---

## Architecture

- **Node**: Playwright auth → scraper (per URL, with jitter) → governor check → Gemini draft → POST candidate to minimal API. API persists to `data/candidates.json` and `data/stats.json`.
- **Angular**: Can call `GET /api/candidates` (and optional `GET /api/stats`). Optional: minimal Candidates list on dashboard (see Open Decisions).

---

## 1. Shared Data and Storage

- **Models**: **ScrapedProfile** — `profileUrl`, `name`, `about`, `experience[]`, `postsPreview[]`, `scrapedAt`. **Candidate** — `_id`, `userId`, `scrapedProfile`, `draftMessage`, `status` (`draft` | `approved` | `sent`), `createdAt`.
- **Storage**: Minimal Node API (Express or equivalent) that: serves `GET /api/candidates` and optional `GET /api/stats`; accepts `POST /api/candidates` from the scraper; persists to `data/candidates.json` and `data/stats.json` under repo (or configurable path). Governor state in `data/stats.json`: `action_count_`, `last_reset_timestamp_`.

---

## 2. Node/Playwright Foundation (001 + 003)

- **Location**: Root-level folder **`automation/`** (recommended: clear that it covers auth, scraper, governor, API). Own `package.json`, strict TypeScript, Playwright.
- **003 – LinkedIn auth**: Script(s) to log into LinkedIn, persist session (cookies/storage), reuse on later runs. Credentials from env/config only. Stealth: no immediate clicks; use `jitterDelay_()`; optional non-linear mouse and variable typing speed per automation-stealth SKILL.
- **Jitter**: `jitterDelay_()` 1000–3000 ms in `automation/src/jitter.ts`, used by all Playwright actions.

---

## 3. Profile Scraper (004)

- **Input**: Profile URLs from **both** a config file (e.g. `data/profile-urls.txt`) and CLI args (args override or append—implementation choice). Default: read from config if no args.
- **Process**: For each URL: jitter → navigate → extract About, Experience, Posts preview, name, profile URL → map to `ScrapedProfile` → governor check → Gemini draft → POST candidate. No connection request or send.

---

## 4. Daily Governor (005)

- Before each action: read `data/stats.json`; if `action_count_ >= 10` in current 24h, skip and log. If `last_reset_timestamp_` &gt; 24h ago, reset count and timestamp. After each action, increment and persist.

---

## 5. Gemini Integration (006)

- **Responsibility**: Given `ScrapedProfile`, call Gemini API; return short personalized connection draft (~300 chars). API key from env (e.g. `GEMINI_API_KEY`). Use Gemini 1.5 or 2.0 per project plan.
- **Placement**: Node (same process as scraper). Pipeline: scrape → governor → Gemini → POST `/api/candidates`.

---

## 6. End-to-End Flow

1. Run Node script (with optional profile URL args or config file).
2. LinkedIn auth (if needed) → for each URL: jitter → scrape → governor check → Gemini draft → POST candidate.
3. Candidates and stats in `data/`. Angular (or curl) can read via `GET /api/candidates`.

---

## 7. Angular Side

- **API base URL**: Environment or config (e.g. `http://localhost:3xxx`) for `GET /api/candidates` (and optional stats).
- **Candidates list**: See Open Decisions—either add a minimal read-only list in this feature or defer to Approval Workflow.

---

## 8. File / Folder Summary

| Area         | Path / artifact |
| ------------ | ----------------- |
| Node project | `automation/`: `package.json`, `tsconfig.json`, Playwright config |
| LinkedIn auth| `automation/src/linkedin-auth.ts` |
| Scraper      | `automation/src/profile-scraper.ts` |
| Governor     | `automation/src/daily-governor.ts` + `data/stats.json` |
| Gemini       | `automation/src/gemini-draft.ts` |
| Jitter       | `automation/src/jitter.ts` |
| Minimal API  | `automation/src/api.ts` (or `server/`): Express serving candidates + stats, POST candidates |
| Shared types | `automation/src/types.ts` (optionally mirror in `src/core/models/` for Angular) |
| Data         | `data/candidates.json`, `data/stats.json` |

---

## 9. Implementation Order

1. Node project + jitter + governor + minimal API + types  
2. LinkedIn auth  
3. Profile scraper  
4. Gemini integration  
5. Wire scraper → governor → Gemini → API  
6. Optional: Angular candidates list (if Option A in Open Decisions)

---

## 10. Success Criteria

- Script run with profile URLs produces scraped profiles and Gemini drafts stored as candidates.
- Governor enforces 10 actions per 24h.
- `GET /api/candidates` returns candidates. No autonomous Send.

---

## Open Decisions

**1. Candidates list in this feature**

Do you want a read-only Candidates list on the dashboard as part of this feature, or should all candidate UI wait for the Approval Workflow feature?

V **Option A:** Add a minimal list in this feature: dashboard fetches `GET /api/candidates`, shows profile + draft message (read-only; no edit or send).

- **Option B:** Defer all candidate UI to the next feature (Approval Workflow); this feature delivers only the Node pipeline and API.
