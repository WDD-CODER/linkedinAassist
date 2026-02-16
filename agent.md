# Agent Guide: LinkedIn Assistant (Agent Optimized)

This is the primary entry point for AI Agents. Embark on every task by reading this and `.github/copilot-instructions.md`.

## Core Rules & Source of Truth
- **Primary Instructions**: `.github/copilot-instructions.md`
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
2. **Plan**: Write the `plan/XXX.md` including a "Questions for User" section.
3. **Execute**: Use @Composer for multi-file updates.
4. **Audit**: Run tests and ask for the mandatory `.spec.ts` confirmation.


