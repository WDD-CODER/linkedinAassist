---
name: automationStealth
description: Guidelines for mimicking human behavior and bypassing bot detection during LinkedIn automation.
---

# Automation Stealth Skill

## 1. Human-ish Interaction (Jitter)
* **Constraint**: Prohibit immediate clicks or typing.
* **Mechanism**: Implement `jitterDelay_()`.
* **Timing**: Randomize duration between 1000ms and 3000ms.
* **Logic**: `const delay_ = Math.floor(Math.random() * 2000) + 1000;`.

## 2. Realistic Input Simulation
* **Mouse**: Simulate non-linear movement. Move cursor to randomized coordinates within the target element's bounding box rather than snapping to center.
* **Keyboard**: Use variable typing speeds (e.g., 50ms to 150ms per character).

## 3. The Daily Governor (Hard Limits)
* **Threshold**: Strict limit of 10 connection requests per 24-hour cycle.
* **State Management**: Persist `action_count_` and `last_reset_timestamp_` in `stats.json` or `localStorage`.
* **Lockdown**: If `action_count_ >= 10`, return `AutomationError`, log the event, and programmatically disable the UI "Send" button.

## 4. Human-in-the-Loop (HITL) Protocol
* **Automation Boundary**: The final `page.click()` for "Send" is strictly forbidden from being autonomous.
* **Workflow**:
    1. AI drafts message content.
    2. AI populates the LinkedIn text field.
    3. System enters `AwaitConfirmation` state.
    4. Execution resumes ONLY after physical user interaction with the Dashboard "Confirm & Send" button.