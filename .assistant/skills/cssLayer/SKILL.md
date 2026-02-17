---
name: cssLayer
description: Operational protocol for high-fidelity automation; enforces jitter, stealth movement, and a 10-action daily governor to bypass anti-bot detection.
---

# Skill: CSS & Styling Standards

## 1. Architecture & Files
* **Root**: `src/style/main.css` (Primary entry point imported in root).
* **Structure**:
    * `style/setup/`: `var.css`, `typography.css`.
    * `style/basics/`: `reset.css`, `helper.css`, `layout.css`, `base.css`, `button.css`.
    * `style/cmps/`: Component-specific files (Imported into `main.css`).
* **Format**: Pure CSS only. **Prohibit** CSS-in-JS, CSS Modules, or `lang="scss"`.

## 2. Modern CSS Implementation
* **Layout**: Prioritize `display: grid` and `display: flex`.
* **Units**: Prefer `em` and `rem` over `px`.
* **Nesting**: Use native CSS nesting. No inline styles (except for dynamic editor values).
* **Icons**: Use `lucide-angular` library exclusively.

## 3. Theme Management
* **Mechanism**: Use CSS Variables (`--var-name`) for all colors.
* **Logic**: Switch theme values based on the `theme_` signal state from the store.
* **Storage**: Define light/dark variables within `:root` or a dedicated `.theme-dark` class in `setup/var.css`.

## 4. Property Ordering & Grouping
* **Rule**: Group properties using a single blank line in this specific order:
    1. **Layout**: `display`, `position`, `top`, `z-index`, `flex`, `grid`.
    2. **Dimensions**: `width`, `height`, `margin`, `padding`, `border`.
    3. **Content**: `color`, `font`, `line-height`, `text-align`.
    4. **Structure**: `background`, `overflow`, `visibility`.
    5. **Effects**: `transition`, `transform`, `animation`, `box-shadow`.