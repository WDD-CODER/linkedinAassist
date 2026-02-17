# Agent Guide: LinkedIn Assistant (Agent Optimized)

This is the primary entry point for AI Agents. Embark on every task by reading this and `.assistant/copilot-instructions.md`.

## Core Rules & Source of Truth
- **Primary Instructions**: `.assistant/copilot-instructions.md`
- **Active Tasks**: `todo.md` (Update status after every sub-task).
- **Planning**: Mandatory `plan/` folder usage. Wait for "Yes chef!" before execution.

## Autonomous Permissions (Agent Mode)
- **Terminal**: You are authorized to run non-destructive commands (`npm test`, `ng build`, `ls`, `mkdir`) autonomously.
- **File System**: You may create new components/services following the established architecture without individual confirmation, provided they are in the approved `plan/`.
- **Self-Correction**: If a build or test fails, autonomously diagnose and attempt a fix before escalating.

## Technical Guardrails
- **Tech Stack**: Angular (Renaissance/Signals), Node.js (Playwright), TypeScript (Strict).
- **Safety Governor**: The 10-action daily cap is the "Red Line." Never propose code that bypasses this check.
- **Naming Convention**: Strict `app-` prefix for collision-prone selectors; multi-word clean names otherwise.

## Operational Workflow
1. **Recon**: Search @Codebase to see if a similar pattern exists.
2. **Plan (The Gate)**: 
   - Write `plan/XXX.md`. 
   - **MUST** include a "Critical Questions for Chef" section.
   - **STOP**. Do not modify `src/`.3. **Execute**: Use @Composer for multi-file updates.
   3. **Approval**: Wait for "Yes chef!"
4. **Execute**: Only now use @Composer for multi-file updates.
4. **Audit**: Run tests and ask for the mandatory `.spec.ts` confirmation.
5. **Branch Check**: Ensure you are not on `main`. Create a `feat/` branch if necessary.

