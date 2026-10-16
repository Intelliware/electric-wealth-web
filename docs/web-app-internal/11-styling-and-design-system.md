---
title: "Styling and Design System"
block: reverse-eng/web-app/internal/styling-and-design-system
part: A
source_repo: electric-wealth-web
source_version: 0.1.0
source_commit: bbb4907dd0d866223742c529ea65a75ec8af576f
extracted: 2026-10-16
---

## 11. Styling and Design System

### 11.1 Styling Approach

A single global stylesheet, [styles.css](../../src/styles.css) (1,582 lines, 22.6 kB built / 5.1 kB gzip), imported
once in [main.tsx](../../src/main.tsx). No CSS modules, no CSS-in-JS, no preprocessor, no utility framework, no
component library. Class names are BEM-like (`card`, `card--warning`, `account-row__name`) with `is-*` state classes
(`is-active`, `is-selected`, `is-unread`, `is-highlighted`, `is-current`, `is-done`). Inline `style` is used only
for computed widths (progress bars, allocation segments) and a few one-off margins.

Visual language (from the stylesheet): system font stack, 15 px base size, cards with 14 px radius on a warm off-white
page, a dark "hero" card for headline amounts, monospace-style "eyebrow" labels rendered as `// UPPERCASE`, tabular
numerals for money.

### 11.2 Design Tokens

CSS custom properties on `:root` (light) with dark overrides:

| Token | Light | Dark | Use |
|---|---|---|---|
| `--bg` / `--bg-alt` | `#ffffff` / `#f5f4f2` | `#19131f` / `#221b2a` | Surfaces / page background |
| `--bg-raised` / `--bg-sunken` | `#ffffff` / `#f5f4f2` | `#2a2333` / `#141019` | Cards / inputs, tracks |
| `--text` / `--text-muted` | `#19131f` / `#75695f` | `#f5f4f2` / `#bab0a8` | Body / secondary text |
| `--accent` / `--accent-soft` | `#3348ff` / `#e8d8fc` | `#c89ffd` / `#3d2f52` | Links, primary buttons / soft fills |
| `--border` / `--border-strong` | `#e9e8e4` / `#d8d0c8` | `#3f3d3a` / `#75695f` | Hairlines / inputs |
| `--focus` | `#3348ff` | `#c89ffd` | `:focus-visible` outline |
| `--feature` / `--on-feature` | `#19131f` / `#ffffff` | `#2a2333` / `#f5f4f2` | Hero card |
| `--on-primary` | `#ffffff` | `#19131f` | Text on primary buttons |
| `--success-*`, `--warning-*`, `--error-*`, `--info-*` | text/bg pairs (+ `--warning-border`) | dark pairs | Tags, notices, alerts, change colours |
| `--chart-1..4` | `#3348ff`, `#c89ffd`, `#7b8cff`, `#75695f` | not overridden | Allocation segments |
| `--benchmark` | `#75695f` | `#bab0a8` | Benchmark line |
| `--radius-card` / `--radius-button` / `--radius-pill` | `14px` / `12px` / `999px` | — | Shapes |
| `--font` | `system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif` | — | Typeface |

**Theme switching** (three states, from the user's saved preference):

| Preference | `<html data-theme>` | Effect |
|---|---|---|
| `light` | `light` | `:root` tokens; the `prefers-color-scheme` block is skipped by `:root:not([data-theme='light'])` |
| `dark` | `dark` | `:root[data-theme='dark']` overrides |
| `system` (or not loaded yet) | attribute removed | `@media (prefers-color-scheme: dark)` applies the dark overrides |

Applied by `useThemePreference()` in [Layout.tsx](../../src/components/Layout.tsx), so it only runs while signed in.
Before the first sign-in of a page load, login and registration follow the system theme. The effect has no cleanup, so
after sign-out the last applied `data-theme` stays until the page is reloaded. The dark token values are written twice
(explicit block and media-query block).

### 11.3 Responsive Breakpoints

No named breakpoints; each component has its own media query. Content is centred with `max-width: 1120px`.

| Query | Effect |
|---|---|
| `max-width: 720px` | Top bar wraps (nav moves to its own row) |
| `min-width: 800px` | `.grid--2` and `.goal-grid` become two columns |
| `max-width: 640px` | Tables hide `<thead>` and stack cells; transaction rows collapse to two columns |
| `max-width: 560px` | Account rows collapse to two columns |
| `min-width: 560px` | `.form__row` (3 columns `2fr 1.5fr 1fr`), `.form__row--2` (`2fr 1fr`) |
| `min-width: 480px` | `.form__row--even` becomes two equal columns |
| `prefers-reduced-motion: reduce` | Spinner animation disabled |
| `prefers-color-scheme: dark` | Dark tokens unless `data-theme='light'` |

### 11.4 Using Design Tokens in Components

```css
.card {
  background: var(--bg-raised);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  padding: 20px;
}
.tag--success { color: var(--success-text); background: var(--success-bg); }
```

SVG charts reference tokens through classes (`.perf-chart__series`, `.perf-chart__benchmark`) or inline
`background: var(--chart-n)` ([charts.tsx](../../src/components/charts.tsx)). Components never read token values in
TypeScript.

### 11.5 Styling Do's and Don'ts

**Do**

- Use the existing tokens; add a new token to `:root`, `:root[data-theme='dark']` **and** the
  `prefers-color-scheme` block.
- Reuse layout classes (`grid grid--2`, `goal-grid`, `form`, `form__row`, `form__actions`, `facts`, `table`, `row`,
  `tags`) and shared components (`Card`, `Tag`, `Segmented`) before adding CSS.
- Use `num` (tabular numerals, right-aligned) for money columns.
- Keep visible focus: rely on the global `:focus-visible` rule.

**Don't**

- Hard-code colours; the existing exceptions (`.hero .change--up` `#7fe0ad`, `.hero .change--down` `#f4a3bb`, one
  `#fff`) do not adapt to the theme.
- Add inline styles for anything other than computed values.
- Add a CSS framework or chart library without discussion — the codebase intentionally has neither.

---

# Part 5 — Features and Workflows

