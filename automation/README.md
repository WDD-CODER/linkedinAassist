# LinkedIn Assistant — Automation

Node scripts for scraping, governor, and Gemini drafts. Run from repo root or from `automation/`.

## Setup

```bash
cd automation
npm install
npm run build
```

## Commands

- **Governor check** (no LinkedIn): `npm run check` — logs "Action permitted" or "Limit reached". Uses `data/stats.json` (10 actions per 24h).
- **Scrape one profile**: `npm run scrape -- <linkedin-profile-url>` or set `PROFILE_URL`. Requires `LINKEDIN_EMAIL` and `LINKEDIN_PASSWORD` on first run. Saves to `data/scraped/<slug>.json`.
- **Pipeline** (Gemini drafts): `npm run pipeline` (reads all `data/scraped/*.json`) or `npm run pipeline -- <path-to-scraped.json>`. Requires `GEMINI_API_KEY`. Writes to `data/candidates.json`.
- **Candidates API**: `npm run api` — serves `GET /api/candidates` and `POST /api/candidates` on port 3750 (or `API_PORT`).

## Env

- `LINKEDIN_EMAIL`, `LINKEDIN_PASSWORD` — used when no saved session in `data/.auth/`.
- `GEMINI_API_KEY` — required for pipeline. Optional: `GEMINI_MODEL` (default `gemini-1.5-flash`).
- `API_PORT` — default 3750 for the candidates API.
