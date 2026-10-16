---
title: "Forms and Validation"
block: reverse-eng/web-app/internal/forms-and-validation
part: A
source_repo: electric-wealth-web
source_version: 0.1.0
source_commit: bbb4907dd0d866223742c529ea65a75ec8af576f
extracted: 2026-10-16
---

## 12. Forms and Validation

### 12.1 Form Handling Approach

Plain controlled inputs: one `useState` per field, a native `<form onSubmit>` that calls `e.preventDefault()` and then
a mutation or API call. No form library (no React Hook Form, Formik, Zod). Shared form CSS: `form`, `form__row`,
`form__row--2`, `form__row--even`, `form__actions`, `form__error`, `form__hint-error`, `choice-list`/`choice`,
`checkbox`, `inline-form`.

| Form | File | Submit | Busy / disabled |
|---|---|---|---|
| Login | `AuthPages.tsx` | `login(email.trim(), password)` | Disabled while busy or a field is empty; `noValidate` |
| MFA | `AuthPages.tsx` | `verifyMfa(code)` | Disabled until 6 digits; non-digits stripped on input; clears the code on error |
| Registration steps 1–6 | `RegisterPage.tsx` (`StepForm`) | `run(fn)` → next step on success | All buttons disabled while busy |
| Open account (3 steps) | `AccountOpenPage.tsx` | Steps 1–2 advance; step 3 `useOpenAccount` | Submit disabled while pending |
| Nickname | `AccountDetailPage.tsx` | `useUpdateAccount` | Save disabled while pending |
| Add goal | `GoalsPage.tsx` | `useCreateGoal` (dollars → cents) | Save / Cancel disabled while pending |
| Address | `ProfilePage.tsx` | `useUpdateAddress` (`country: 'Canada'`) | Save / Cancel disabled while pending |
| Book / reschedule | `AdvisorPage.tsx` | `useBookAppointment` or `useUpdateAppointment` | Disabled until a slot is chosen |
| Share document | `DocumentsPage.tsx` (`<dialog>`) | `useShareDocument` | Disabled while pending |
| Message composer | `AdvisorMessagesPage.tsx` | `useSendAdvisorMessage(text.trim())`; Enter sends, Shift+Enter = newline | Disabled when blank or pending |

Settings are not a form: each control saves immediately (`useUpdatePreferences`).

### 12.2 Validation Rules

Validation is **HTML constraint validation plus server codes**. Most forms rely on the browser's built-in validation
bubbles (`required`, `pattern`, `min`, `maxLength`); login and MFA use `noValidate` and button-disabling instead. The
API re-validates everything.

| Field | Rule (client) | Source |
|---|---|---|
| Login email / password | Button disabled until both non-empty | `AuthPages.tsx` |
| MFA code | Digits only, exactly 6 | `AuthPages.tsx` |
| Registration password | `required`, `minLength=8`, `pattern="(?=.*[A-Za-z])(?=.*\d).{8,}"` ("At least 8 characters, with a letter and a number.") | `RegisterPage.tsx` |
| Confirm password | Must equal password; mismatch shows `web.passwords_differ`, `aria-invalid`, and blocks submit silently | `RegisterPage.tsx` |
| Account number | `pattern="\d{10}"` | `RegisterPage.tsx` |
| Postal code (registration) | `required` only | `RegisterPage.tsx` |
| Postal code (address) | `pattern="[A-Za-z]\d[A-Za-z] ?\d[A-Za-z]\d"` | `ProfilePage.tsx` |
| Date of birth | `type="date"`, `required` | `RegisterPage.tsx` |
| Security answers | 2 different questions (the other pick is disabled), answers `minLength=2` `maxLength=100` | `RegisterPage.tsx` |
| Trusted contact | name ≤ 80 and relationship ≤ 40 required; phone ≤ 30, email optional | `RegisterPage.tsx` |
| Consents | All three checkboxes `required` | `RegisterPage.tsx` |
| Account display name | ≤ 40; blank → "`<type name>` account" (`web.default_account_name`) | `AccountOpenPage.tsx` |
| Nickname | ≤ 40; blank → `null` (clears) | `AccountDetailPage.tsx` |
| Goal name | `required`, ≤ 60 | `GoalsPage.tsx` |
| Goal target | `min=1`, `step=0.01`, `required` | `GoalsPage.tsx` |
| Goal current | `min=0`, `max` = target, optional | `GoalsPage.tsx` |
| Goal date | `required`, `min` = tomorrow (UTC date) | `GoalsPage.tsx` |
| Address line 1 / city | `required`, ≤ 100 / ≤ 60; province from 13-item list | `ProfilePage.tsx` |
| Meeting notes | ≤ 500 | `AdvisorPage.tsx` |
| Message | ≤ 2000, non-blank | `AdvisorMessagesPage.tsx` |
| Share recipient | `type="email"`, `required` | `DocumentsPage.tsx` |

Server-side validation failures surface as `VALIDATION_ERROR` and are mapped to one message per form (no per-field
error mapping).

