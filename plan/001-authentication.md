# Plan: Authentication (First Feature)

**Links to:** project-plan.md (Feature: Authentication — Secure login handling)

## Scope
- **Dashboard user login**: Identify who is using the LinkedIn Assistant (no LinkedIn OAuth here; that is 003-playwright-linkedin-auth).
- **Persistence**: Session and user data via existing `AsyncStorageService` + localStorage for session.
- **Guard**: Protect dashboard routes; redirect unauthenticated users to `/login`.

## Implementation
1. **User model** (`src/core/models/user.model.ts`): `User` interface (`_id`, `email`, `displayName`).
2. **AuthService** (`src/core/services/auth.service.ts`): Signals `currentUser`, `isLoggedIn`; `login(email, displayName)`, `logout()`; session in localStorage; user records in entity `user` via AsyncStorageService.

3. **Auth guard** (`src/core/guards/auth.guard.ts`): Functional guard; redirect to `/login` when not authenticated.
4. **Login page** (`src/app/pages/login/`): Form (email, display name); submit calls AuthService.login; navigate to dashboard on success.
5. **Dashboard shell** (`src/app/pages/dashboard/`): Minimal protected page with welcome + logout.
6. **Routes**: `''` → redirect to `dashboard` or `login` by auth; `login` → LoginPage; `dashboard` → Dashboard + auth guard.
7. **App shell**: Keep `RouterOutlet`; optional later: nav bar when logged in.

## Notes
- No password for mock backend (simulated security); real backend can add proper auth later.
- Naming: `app-` prefix only for collision-prone selectors; use `login-page`, `dashboard-page` etc.

## Questions for User
- Is email-only login (no password) acceptable for this mock phase, or should we add a simple client-only password check?
yes

