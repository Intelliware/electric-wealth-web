---
title: "Accessibility"
block: reverse-eng/web-app/internal/accessibility
part: A
source_repo: electric-wealth-web
source_version: 0.1.0
source_commit: bbb4907dd0d866223742c529ea65a75ec8af576f
extracted: 2026-10-16
---

## 15. Accessibility

### 15.1 Accessibility Features

No accessibility testing tool, linter rule set (`eslint-plugin-jsx-a11y`) or stated WCAG target exists in the repo.
What the code does:

| Feature | Implementation | Source |
|---|---|---|
| Skip link | `<a class="skip-link" href="#main">Skip to content</a>`, visible on focus; target `<main id="main">` | `Layout.tsx`, `styles.css` |
| Landmarks | `<header class="topbar">`, `<nav aria-label="Main">` (`web.nav_main`), `<main>`; pages use `<section>` cards, `<header>` page headers | `Layout.tsx`, `ui.tsx` |
| Headings | One `<h1>` per page (`PageHeader`), `<h2>` section titles and card titles | `ui.tsx`, pages |
| Focus | Global `:focus-visible { outline: 2px solid var(--focus); outline-offset: 2px }`; `autoFocus` on the first field of each form, the edit inputs, and the share dialog's "Done" | `styles.css`, forms |
| Labels | Every input is wrapped in a `<label>`; icon-only or terse controls get `aria-label` or a `.sr-only` label (search fields, nickname, answers, composer) | forms |
| Live regions | `Loading` `role="status" aria-live="polite"`; `ErrorState` and form errors `role="alert"`; settings save status `role="status" aria-live="polite"`; share / booking confirmations `role="status"` | `ui.tsx`, pages |
| Modal | Native `<dialog>` with `showModal()` (focus trap, Esc to close), `aria-labelledby` | `DocumentsPage.tsx` |
| Colour + text | Change direction uses ▲/▼/— glyphs plus colour; tags carry text; "unread" announced with `.sr-only` text | `ui.tsx`, `NotificationsPage.tsx` |
| Charts | `role="img"` with a descriptive `aria-label`; the allocation bar is `aria-hidden` with a text legend | `charts.tsx` |
| Language | `<html lang>` follows the UI locale | `i18n/index.ts` |
| Motion | Spinner animation disabled under `prefers-reduced-motion` | `styles.css` |
| Wizard progress | `role="progressbar"` with `aria-valuenow` = step; `<ol class="stepper">` with `aria-current="step"` | `RegisterPage.tsx`, `AccountOpenPage.tsx` |

### 15.2 ARIA Attributes

| Attribute | Used on |
|---|---|
| `aria-label` | Main nav, language toggle, bell (includes unread count), user menu summary ("Signed in as {name}"), segmented groups, pagination, day/slot pickers, charts, progress bars, watchlist Remove ("Remove {symbol} from watchlist"), thread list, search results list |
| `aria-pressed` | `Segmented` buttons, day and slot picker buttons, hide-balances toggle, watchlist toggle on `SecurityPage` |
| `aria-current="step"` | Account-opening stepper |
| `aria-invalid` | Confirm-password field when it differs |
| `aria-describedby` | Registration password → rule text |
| `aria-hidden="true"` | Decorative glyphs, brand mark, avatar initials, chart bars, unread badge (count is in the bell's label), scroll sentinel |
| `aria-labelledby` | Share dialog → its heading |
| `aria-valuenow/min/max` | `ProgressBar`, registration progress |
| `role` | `status`, `alert`, `group`, `progressbar`, `img`, `switch` (notification channel checkboxes) |

**Known gaps:** the user menu is a `<details>` without menu semantics; `window.confirm` is used to confirm cancelling
a meeting; table rows on narrow screens hide `<thead>` without per-cell labels; hard-coded English in the skip link
and pagination label; `--chart-*` colours are not adjusted for dark mode and contrast has not been measured.

