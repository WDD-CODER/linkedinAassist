# Plan: Approval Dashboard UI

**Links to:** project-plan.md (Approval Workflow). **Depends on:** [005-intelligence-candidate-pipeline.md](005-intelligence-candidate-pipeline.md) (GET /api/candidates, Candidate type).

## Why

Candidates with draft messages are stored in `data/candidates.json` and served via `GET /api/candidates`. Users need a dashboard to review, edit, and approve these drafts before any connection request is sent. Nothing is sent in this feature—only review, edit, and approve (status change).

## Outcome

- Dashboard shows a list of candidates (profile name, about snippet, draft message).
- User can edit the draft message inline.
- User can approve a candidate (status: `draft` → `approved`).
- Approved candidates are persisted via API. No "Send" action yet (that is 007).

## Scope

- **In scope:** Angular Candidates list on dashboard; fetch from `GET /api/candidates`; display profile + draft; inline edit of `draftMessage`; approve button → `PATCH /api/candidates/:id` with `{ draftMessage?, status }`; Candidate model in Angular (mirror `automation/src/types.ts`).
- **Out of scope:** LinkedIn Send; full connection request flow. That is 007.

## Implementation approach

**Frontend first, backend later.** Build the full Angular UI (model, service, dashboard, components) before touching the automation layer. Use existing `GET /api/candidates` for fetching. Wire `updateCandidate` calls in the service—they will fail or use a stub until PATCH exists. After the frontend is complete, implement the backend (PATCH) based on exactly what the frontend expects. This keeps the API contract driven by the UI needs.

## Implementation

### 1. Angular: Candidate model

- **File:** `src/core/models/candidate.model.ts`
- Mirror `Candidate` and `ScrapedProfile` from automation types so Angular can type the API responses.

### 2. Environment

- **File:** `src/environments/environment.ts` (or equivalent)
- `apiBaseUrl: 'http://localhost:3750'` for development.

### 3. Angular: Candidates service

- **File:** `src/core/services/candidates.service.ts`
- `getCandidates(): Signal<Candidate[]>` or `Observable<Candidate[]>` (fetch from API).
- `updateCandidate(id, partial): Promise<Candidate>` — PATCH to API. Wire the call; it will fail until backend implements PATCH.

### 4. Dashboard: Candidates list

- **File:** `src/app/pages/dashboard/dashboard.ts`, `dashboard.html`
- Inject `CandidatesService`; load candidates on init.
- **Template:** List of candidate cards; each shows: name, about (truncated), draft message (editable textarea), Approve button.
- On Approve: call `updateCandidate(id, { status: 'approved' })`; refresh list.
- On edit: debounced or on blur, call `updateCandidate(id, { draftMessage })`.

### 5. API extension (automation) — *after frontend is done*

- **File:** `automation/src/api.ts`, `automation/src/candidates-store.ts`
- Add `PATCH /api/candidates/:id`: accept `{ draftMessage?: string, status?: 'draft' | 'approved' | 'sent' }`; find by `_id`, update, persist via `writeCandidates`.
- Add `updateCandidate(id, partial)` in candidates-store.
- Implement based on what the frontend service expects.

### 6. File summary

| Item | Path |
|------|------|
| Candidate model | `src/core/models/candidate.model.ts` |
| Environment | `src/environments/` |
| Candidates service | `src/core/services/candidates.service.ts` |
| Dashboard | `src/app/pages/dashboard/` |
| API PATCH *(last)* | `automation/src/api.ts`, `candidates-store.ts` |

## Success criteria

- Dashboard fetches and displays candidates from `GET /api/candidates`.
- User can edit draft message and see it persisted.
- User can approve a candidate; status changes to `approved` and persists.
- No LinkedIn Send or connection request in this feature.

## Open decisions

**1. Edit UX** — *Decided: Option A*

- **Option A (chosen):** Inline textarea with save on blur or debounced (e.g. 500ms after typing stops).
- Option B: Edit in a modal/dialog.
