# Plan: Final Human-in-the-Loop Test

**Links to:** project-plan.md (Approval Workflow, User Control). **Depends on:** [006-approval-dashboard-ui.md](006-approval-dashboard-ui.md) (dashboard with approved candidates). References: [automation-stealth SKILL](.assistant/skills/automation-stealth/SKILL.md) (HITL Protocol).

## Why

The project's core principle: **nothing is sent without user confirmation**. 006 delivers review, edit, and approve. This feature adds the final step: a "Confirm & Send" button that, when clicked by the user, triggers the automation to send the connection request on LinkedIn. The automation must never send autonomously—only after explicit user click.

## Outcome

- Dashboard shows "Confirm & Send" for approved candidates.
- User clicks → automation runs Playwright: navigate to profile, click Connect, add personalized message, click Send.
- Candidate status updates to `sent`. Governor records the action (10/day limit).
- If governor limit reached, "Confirm & Send" is disabled and the API rejects the request.

## Scope

- **In scope:** "Confirm & Send" button in dashboard; `POST /api/candidates/:id/send` endpoint; Playwright send flow (connect + message); governor check before send; status `approved` → `sent`; UI disables button when governor limit reached (optional: fetch `GET /api/stats` for remaining actions).
- **Out of scope:** Autonomous send; batch send; anything that sends without user click.

## Implementation

### 1. Automation: Send flow (Playwright)

- **File:** `automation/src/send-connection.ts`
- **Input:** Candidate (with `scrapedProfile.profileUrl`, `draftMessage`).
- **Flow:** Ensure LinkedIn logged in → governor check (if limit reached, throw/return error) → `jitterDelay_()` → navigate to profile URL → locate Connect button → click → wait for "Add a note" / message modal → type message with variable speed → click Send → `recordAction()` → return success.
- **Selectors:** LinkedIn Connect button, "Add a note" link/button, message textarea, Send button. Store in `types.ts` or a send-specific config (LinkedIn DOM may differ from scraper selectors).

### 2. Automation: API endpoint

- **File:** `automation/src/api.ts`
- Add `POST /api/candidates/:id/send`:
  - Read candidate by `_id`; if not found → 404.
  - If `status !== 'approved'` → 400 "Candidate must be approved first".
  - Governor check; if limit reached → 429 or 403 with message "Daily limit reached".
  - Call send flow (Playwright).
  - On success: update candidate `status: 'sent'`, persist; return 200.
  - On failure: return 500 with error message.

### 3. Automation: Stats endpoint (optional but recommended)

- **File:** `automation/src/api.ts`
- Add `GET /api/stats`: return `{ actionCount, remaining, lastReset }` from governor so the UI can disable "Confirm & Send" when `remaining === 0`.

### 4. Angular: Candidates service

- **File:** `src/core/services/candidates.service.ts`
- Add `sendConnection(id: string): Promise<Candidate>` — POST to `/api/candidates/:id/send`.
- Add `getStats(): Promise<{ remaining: number }>` if stats endpoint exists.

### 5. Dashboard: Confirm & Send button

- **File:** `src/app/pages/dashboard/dashboard.html`, `dashboard.ts`
- For each candidate with `status === 'approved'`: show "Confirm & Send" button.
- On click: call `sendConnection(id)`; on success, refresh list (status → `sent`); on error (limit reached), show toast/message.
- Optional: fetch stats on load; disable button when `remaining === 0` (or hide it).

### 6. File summary

| Item | Path |
|------|------|
| Send flow | `automation/src/send-connection.ts` |
| API POST send | `automation/src/api.ts` |
| API GET stats | `automation/src/api.ts` |
| Candidates service | `src/core/services/candidates.service.ts` |
| Dashboard | `src/app/pages/dashboard/` |

## Success criteria

- User can click "Confirm & Send" only for approved candidates.
- Automation sends the connection request on LinkedIn with the personalized message.
- Candidate status becomes `sent`; governor records the action.
- If daily limit (10) is reached, send is rejected and user sees clear feedback.
- No send occurs without user click.

## Open decisions

**1. Confirmation dialog**

- **Option A:** Single click on "Confirm & Send" triggers send immediately.
- **Option B:** Show a confirmation dialog ("Are you sure? This will send the connection request.") before sending.

Recommendation: Option B for safety; user explicitly confirms twice (approve + confirm & send).

**2. Stats in UI**

- **Option A:** Fetch `GET /api/stats` on dashboard load; show "X of 10 actions remaining today" and disable "Confirm & Send" when 0.
- **Option B:** Only show error after user clicks (simpler; API still rejects).

Recommendation: Option A for better UX; user knows upfront if they can send.
