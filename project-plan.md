# Project Plan: LinkedIn Assistant

## Goal
Develop a personalized, high-impact LinkedIn assistant that scans profiles to identify the most attractive connections and crafts highly personalized messages using Gemini. The assistant runs automating the tedious parts but requires manual approval for sending messages.

## Unique Value Proposition
-   **Hyper-Personalization**: Uses Gemini API to analyze profiles and write custom messages.
-   **Safety First**: Strictly limited to 10 actions/day to mimic human behavior.
-   **User Control**: Fully automated drafting, but **nothing is sent without user confirmation**.

## Features
- [x] **Authentication**: Secure login handling (User's main account).
- [x] **Smart Networking**:
    - [x] Scan profiles to find "attractive" connections.
    - [x] Analyze profile data (About, Experience, Posts).
    - [x] Generate personalized connection requests using **Gemini API**.
- [ ] **Approval Workflow**:
    - [ ] Web Dashboard to review potential connections.
    - [ ] Edit/Approve generated messages before sending.
    - *Build approach: Frontend first, backend later—see plan 006.*
- [ ] **Data Management**:
    - [ ] LocalStorage-based async storage service (simulating a backend).
    - [ ] Future migration to a real backend.
- [x] **Safety Mechanisms**:
    - [x] Daily limit enforcement (Max 10/day).
    - [x] Human-like delays and behavior.

## Tech Stack (Updated)
- **Frontend**: Angular (Renaissance/Signals, Standalone Components)
- **Automation**: Node.js + Playwright (Stealth Mode)
- **AI**: Google Gemini 1.5/2.0 API
- **Storage**: AsyncStorageService (Simulated Backend)


## High-Level Implementation
1. **Foundation**: Scaffold Angular & Node with strict TypeScript.
2. **Persistence**: Build the Signal-based Mock Backend.
3. **Stealth Engine**: Develop the Playwright scraper with human-jitter.
4. **Intelligence**: Integrate Gemini for profile analysis.
5. **Dashboard**: Build the Angular Review UI (frontend first; automation API extensions after UI is done).


## Next Steps
-   Implement 006 Approval Dashboard UI (frontend-first per plan).
-   Add PATCH /api/candidates after dashboard is complete.
