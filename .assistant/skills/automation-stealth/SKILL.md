---
name: automationStealth
description: Guidelines for mimicking human behavior and bypassing bot detection during LinkedIn automation.
---

# Automation Stealth Skill

## 1. Human-Like Delays (Jitter)
- **Rule**: Never click or type immediately.
- **Implementation**: Use a `jitterDelay()` function before every interaction.
- **Timing**: Use a random duration between 1000ms and 3000ms.
- **Logic**: `Math.random() * 2000 + 1000`.

## 2. Mouse Movement
- **Rule**: Before clicking an element, simulate a random mouse movement.
- **Implementation**: Move the cursor to a random coordinate near the target element rather than snapping directly to the center.

## 3. The Daily Governor
- **Rule**: Strict limit of 10 connection requests per 24-hour period.
- **Persistence**: Store the `action_count_` and `last_reset_timestamp_` in LocalStorage.
- **Safety**: If `action_count_ >= 10`, the "Send" function must return an error and disable the UI button.

## 4. Manual Intervention
- **Rule**: The "Send" action must never be fully automated.
- **Process**: 
  1. AI drafts the message.
  2. AI populates the text field.
  3. System waits for the user to click a physical "Confirm & Send" button on the Dashboard.
