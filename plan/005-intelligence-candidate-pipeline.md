# Plan: Intelligence & Candidate Pipeline (The "Brain")

**Links to:** project-plan.md (Smart Networking), todo 006. Parent: [002-smart-networking.md](002-smart-networking.md). **Depends on:** [003-automation-foundation-governor.md](003-automation-foundation-governor.md), [004-stealth-scraper-auth.md](004-stealth-scraper-auth.md) (governor, ScrapedProfile, scraped JSON files).

## Why

Now that data is safely scraped, the AI can focus on prompt engineering for connection drafts. This feature adds Gemini integration and the Candidate data model so scraped profiles are turned into draft messages and stored in `candidates.json`.

## Outcome

Scraped data (from `data/scraped/*.json` or from the scraper’s output) is piped through the Gemini API; each ScrapedProfile produces a short personalized connection draft. Results are saved as **Candidate** records in `data/candidates.json`. The governor is used so each draft consumes one action from the daily limit.

## Scope

- **In scope:** Gemini API integration (API key from env, e.g. `GEMINI_API_KEY`), **Candidate** type (`_id`, `userId?`, `scrapedProfile`, `draftMessage`, `status`, `createdAt`), prompt that takes ScrapedProfile text and returns ~300-character draft, reading ScrapedProfile from disk (or from scraper output), governor check before each draft, appending to `data/candidates.json`. Optional: minimal Express server that serves `GET /api/candidates` and accepts `POST /api/candidates` so the Angular dashboard can read/feed later.
- **Out of scope:** LinkedIn, Playwright, scraping logic. No "Send" click. Full Approval Workflow UI is a later feature.

## Implementation

### 1. Candidate type and storage

- **File:** `automation/src/types.ts` (extend with Candidate).
- **Candidate shape:** `_id: string`, `userId?: string` (dashboard user; optional for this feature), `scrapedProfile: ScrapedProfile`, `draftMessage: string`, `status: 'draft' | 'approved' | 'sent'`, `createdAt: string` (ISO).
- **Storage:** `data/candidates.json` — JSON array of Candidate. Read existing array (or create `[]`), append new candidate(s), write back. Use a simple `makeId()` (e.g. in a small util) for `_id`.

### 2. Gemini integration

- **File:** `automation/src/gemini-draft.ts`
- **Responsibility:** Accept a ScrapedProfile (or its string summary); call Gemini API (1.5 or 2.0 per project plan); return a short personalized connection request draft (~300 characters). Prompt should include profile context (name, about, experience) and ask for a professional, non-generic message.
- **Config:** API key from `process.env.GEMINI_API_KEY` (or similar); never commit. Use official Gemini SDK or REST; handle errors (rate limit, invalid key) with clear logs.

### 3. Pipeline script

- **File:** `automation/src/run-pipeline.ts` (or integrate into scraper flow later).
- **Input:** Path(s) to scraped JSON file(s) (e.g. `data/scraped/*.json` or one file passed as arg). Alternatively: accept one ScrapedProfile from stdin or from the scraper’s previous step.
- **Flow for each ScrapedProfile:** Governor check → if permitted, call Gemini to get draft → build Candidate (`status: 'draft'`) → append to `data/candidates.json` → call governor `recordAction()`. If limit reached, skip and log.

### 4. Optional: minimal API

- **File:** `automation/src/api.ts` or `server.ts`
- **Behavior:** Express (or equivalent) server that: `GET /api/candidates` returns contents of `data/candidates.json`; `POST /api/candidates` accepts a Candidate body and appends to the file. Runs separately from the pipeline (e.g. `npm run api`); pipeline only writes to file. This allows the Angular app to read candidates in a later feature without changing the pipeline.

### 5. File summary

| Item      | Path |
| --------- | ----- |
| Types     | `automation/src/types.ts` (Candidate, ScrapedProfile) |
| Gemini    | `automation/src/gemini-draft.ts` |
| Pipeline  | `automation/src/run-pipeline.ts` |
| Optional API | `automation/src/api.ts` |
| Data      | `data/candidates.json` |

## Success criteria

- Given one or more ScrapedProfile JSON files, running the pipeline calls Gemini for each, produces a draft message, and appends a Candidate to `data/candidates.json`. Governor is respected (10/day).
- `data/candidates.json` is a valid JSON array of Candidate objects. No LinkedIn or browser involved in this feature.

## Open decisions

**1. Include minimal API in this feature?**

Should this feature add a small Express server (e.g. `GET /api/candidates`, `POST /api/candidates`) so the Angular dashboard can read candidates without file access, or keep the feature to file-only and add the API in a later feature?

- **Option A:** Include minimal API in this feature: one script runs the pipeline (writes to file); another runs the server (reads/serves file, accepts POST). Same `data/candidates.json`.
- **Option B:** File-only in this feature; add the API when building the Approval Workflow or dashboard integration.

Recommendation: Option A so the dashboard can call `GET /api/candidates` as soon as the next UI feature is built, without another plumbing task.

**2. Gemini model**

Which Gemini model for draft generation?

- **Option A:** Gemini 1.5 Flash (faster, lower cost; sufficient for short drafts).
- **Option B:** Gemini 1.5 Pro or 2.0 (higher quality, slower/costlier).

Recommendation: Option A unless you need higher-quality prose; we can make the model configurable via env (e.g. `GEMINI_MODEL=gemini-1.5-flash`).
