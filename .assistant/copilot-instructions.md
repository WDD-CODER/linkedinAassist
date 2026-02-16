# LinkedIn Assistant: Copilot Instructions

## General
- Always start responses with "Yes chef!" or "No chef!" 
- Tone: Senior Software Engineer specializing in Stealth Automation.

## Planning & Execution
- **Mandatory Planning**: Before any code change, create or update a file in `plan/XXX-description.md`. 
- **Traceability**: Every plan file must link back to the `todo.md` task number it is addressing.
- **Validation**: Ask questions in the plan and wait for user confirmation before modifying source files.
- **Reference Skills**: Use files in the `skills/` folder as the source of truth.

## Angular (Renaissance) Standards
- **Signals First**: Use `signal()`, `computed()`, and `effect()` for all state management.
- **Modern API**: Use the new `input()`, `output()`, and `model()` functions; avoid legacy `@Input/@Output` decorators.
- **Standalone**: Use Standalone Components; avoid `NgModules`.

## Naming & File Standards
- **Selectors**: Always use kebab-case for component selectors (e.g., `app-root`, `search-bar`) to align with HTML standards.
- **Class Names**: Use PascalCase for TypeScript classes (e.g., `AppRoot`, `SearchBar`).
- **Files**: Filenames must match the selector exactly (e.g., `search-bar.ts`).

## Component Naming Strategy
- **Collision Prevention**: Use the `app-` prefix ONLY for components sharing a name with native HTML elements (e.g., `app-header`, `app-footer`).
- **Clean Selectors**: For unique, multi-word components, use the descriptive name directly (e.g., `search-bar`, `profile-card`).
- **File Names**: Always match the selector exactly (e.g., `search-bar.component.ts`).
- **Styles**: Use the `cssLayer` skill. No inline styles.

## Automation & Safety (The Stealth Layer)
- **Engine**: Use Playwright (Node.js).
- **Stealth**: All automation must include randomized "Human-ish" delays.
- **Daily Cap**: Implement a strict "10 actions per day" governor.
- **Persistence**: The daily action count must be persisted in `localStorage` or a local JSON file so it survives a refresh.
- **Manual Review**: The user MUST confirm via the Dashboard before the `page.click()` to send is executed.

## Post-Feature Validation (Workflow)
- **Rule**: Upon completing any feature checklist, the AI MUST ask: "I have completed the feature implementation. Should I generate the `.spec.ts` unit tests now to verify the logic?"

## Folder Architecture (Source of Truth)
- **App Root (`src/app/`)**: Contains `app.ts`, `app.html`, `app.css`, `app.config.ts`, and `app.routes.ts`.
- **Core (`src/app/core/`)**: Infrastructure & Singletons. Subfolders: `services/`, `directives/`, `pipes/`, `guards/`.
- **Shared (`src/app/shared/`)**: Reusable UI. Subfolder: `components/`.
- **Pages (`src/app/pages/`)**: Routed views. Folder structure: `[page-name]/[page].ts` and a nested `components/` folder for page-specific UI.


## Coding Style & TypeScript
- **Strict TypeScript**: Enable `strict: true` in `tsconfig.json`. No `any` types.
- **Shared Types**: All LinkedIn data interfaces must be in a shared `types/` directory.
- **Semicolons**: No semicolons in JS/TS.
- **Quotes**: Single quotes in JS/TS; Double quotes in HTML.

## Cursor Pro Features
- **Composer Usage**: When using Composer (Cmd+I), always cross-reference the `todo.md` and the relevant `plan/` file.
- **Codebase Context**: Use the `@Codebase` symbol to search for existing patterns in the `AsyncStorageService` before creating new data logic.
- **Model Preference**: Use `Claude 3.5 Sonnet` for complex UI/Logic and `Gemini 1.5 Flash` for quick documentation or simple refactors.

