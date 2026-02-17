# LinkedIn Assistant: Master Todo

## Phase 1: Foundation
- [x] 000-verify-system-rules (Instructions & Skills setup)
- [x] 001-authentication (plan/001-authentication.md)
    - [x] User model, AuthService, auth guard
    - [x] Login page, Dashboard shell, routes
- [x] 002-core-services (Angular)
    - [x] AsyncStorageService
    - [x] UserMsgService
    - [ ] UtilService in Angular (optional; jitter lives in automation per 003)

## Phase 2: Smart Networking (one feature at a time)
- [x] 003-automation-foundation-governor (plan/003-automation-foundation-governor.md) — The "Plumbing"
    - [x] automation/ project (package.json, strict tsconfig)
    - [x] jitterDelay_(), data/stats.json
    - [x] Daily Governor (10/day)
    - [x] Runner script: logs "Action permitted" / "Limit reached"
- [x] 004-stealth-scraper-auth (plan/004-stealth-scraper-auth.md) — The "Eyes"
    - [x] Playwright, LinkedIn auth, session persistence
    - [x] ScrapedProfile type, profile-scraper
    - [x] Visit URL → save JSON (About/Experience)
- [x] 005-intelligence-candidate-pipeline (plan/005-intelligence-candidate-pipeline.md) — The "Brain"
    - [x] Gemini API, Candidate type
    - [x] Scraped data → Gemini → candidates.json
    - [x] Minimal GET/POST /api/candidates

## Phase 3: Approval & HITL
- [x] 006-approval-dashboard-ui (plan/006-approval-dashboard-ui.md) — review/edit/approve candidates
- [x] 007-final-human-in-the-loop-test (plan/007-final-human-in-the-loop-test.md) — Confirm & Send only after user click
