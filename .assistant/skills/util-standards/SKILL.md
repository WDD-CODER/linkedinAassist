---
name: utilStandards
description: Guidelines for managing shared utility functions.
---

# Utility Standards

## 1. Centralized Utils
- **Rule**: Do not create local helper functions inside components or feature services.
- **Location**: Use `src/app/services/util.service.ts`.
- **Common Functions**: 
  - `makeId(length)`: For generating entity IDs.
  - `jitterDelay()`: For the automation stealth patterns.

## 2. Purity
- **Rule**: Utility functions must be \"Pure Functions\" (no side effects, same input always produces same output).