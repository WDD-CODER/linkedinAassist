# Plan: Stealth Scraper & Auth (The "Eyes")

**Links to:** project-plan.md (Smart Networking), todo 003, 004. Parent: [002-smart-networking.md](002-smart-networking.md). **Depends on:** [003-automation-foundation-governor.md](003-automation-foundation-governor.md) (automation/, jitter, governor in place).

## Why

Scraping is the most fragile part. The AI needs to focus entirely on robust CSS selectors and human-like movement—no Gemini, no candidate pipeline. This feature delivers a script that visits one LinkedIn profile URL and writes a JSON file with About and Experience (and optionally Posts preview).

## Outcome

A script that, given a LinkedIn profile URL (and valid session), visits the page with Playwright, uses `jitterDelay_()` before interactions, extracts About and Experience (and optionally posts preview), and saves a **ScrapedProfile** JSON file (e.g. `data/scraped/<profileId>.json` or one file per run). LinkedIn auth and session persistence are working so repeated runs reuse the session.

## Scope

- **In scope:** Playwright in `automation/`, LinkedIn login flow (credentials from env/config), session persistence (cookies/storage so the next run does not require login), `ScrapedProfile` type and extraction logic, use of `jitterDelay_()` before navigation/clicks, governor check before the single "action" (one scrape = one action), writing scraped result to disk (no API yet).
- **Out of scope:** Gemini, candidates API, sending connection requests, multiple URLs in one run (optional: support one URL per run for this feature; multi-URL can be added later). No "Send" click.

## Implementation

### 1. Playwright and auth

- **Install:** Add Playwright to `automation/` (e.g. `playwright` or `@playwright/test` for core). Use a persistent browser context or stored auth state so login is required only when no valid session exists.
- **File:** `automation/src/linkedin-auth.ts` (or equivalent) — login to LinkedIn using credentials from env (e.g. `LINKEDIN_EMAIL`, `LINKEDIN_PASSWORD`); save auth state to disk (e.g. `data/.auth/linkedin-state.json` or Playwright’s `storageState`). Expose something like `ensureLoggedIn(pageOrContext)` that either loads state and navigates to LinkedIn to verify, or performs login and saves state. Use `jitterDelay_()` before typing/clicks per [automation-stealth SKILL](.assistant/skills/automation-stealth/SKILL.md).

### 2. ScrapedProfile type

- **File:** `automation/src/types.ts` (or shared types file).
- **Shape:** `ScrapedProfile`: `profileUrl: string`, `name: string`, `about: string`, `experience: Array<{ title, company, duration? }>`, `postsPreview?: string[]`, `scrapedAt: string` (ISO). Keep selectors in one place (e.g. a small selectors config or constants) so LinkedIn DOM changes require minimal edits.

### 3. Profile scraper

- **File:** `automation/src/profile-scraper.ts`
- **Input:** One profile URL (CLI arg or config for this feature).
- **Flow:** Ensure logged in → governor check (if not permitted, exit without scraping) → `jitterDelay_()` → navigate to profile URL → extract About, Experience (and optionally posts preview), name → build `ScrapedProfile` → write to JSON file (e.g. `data/scraped/<slug>.json`). Call governor `recordAction()` after a successful scrape so the 10/day limit applies.

### 4. Runner

- **Entry:** e.g. `automation/src/run-scrape.ts` — accepts one URL (arg or from a simple config), runs auth + governor check + scrape, writes file. Log success or failure (e.g. "Limit reached", "Scraped and saved to ...").

### 5. File summary

| Item        | Path |
| ----------- | ----- |
| Auth        | `automation/src/linkedin-auth.ts` |
| Types       | `automation/src/types.ts` (ScrapedProfile, selectors config) |
| Scraper     | `automation/src/profile-scraper.ts` |
| Runner      | `automation/src/run-scrape.ts` |
| Auth state  | `data/.auth/linkedin-state.json` (or similar; gitignore) |
| Scraped out | `data/scraped/<id>.json` |

## Success criteria

- Running the script with a valid LinkedIn profile URL and credentials: after login (first run), it visits the profile, extracts About and Experience, and saves a JSON file. Second run reuses session and does not require login (until session expires).
- Governor is consulted before the scrape; if limit is reached, the script exits without scraping and logs "Limit reached".
- Jitter is used before navigation/interaction. No connection request or message is sent.

## Open decisions

**1. Session storage path**

Where should LinkedIn auth state be stored?

- **Option A:** `data/.auth/linkedin-state.json` at repo root (same `data/` as governor; keep `.auth` in `.gitignore`).
- **Option B:** `automation/.auth/linkedin-state.json` (inside automation only).

Recommendation: Option A for consistency with `data/` and future API.

**2. Scraped output location**

Where should the ScrapedProfile JSON files be written?

- **Option A:** `data/scraped/<profile-slug-or-id>.json` at repo root (one file per profile; slug from URL or generated id).
- **Option B:** Single file per run, e.g. `data/scraped/run-<timestamp>.json` containing one ScrapedProfile.

Recommendation: Option A so the next feature (Brain) can read one file per profile and pipe to Gemini without merging files.
