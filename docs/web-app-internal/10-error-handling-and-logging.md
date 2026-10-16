---
title: "Error Handling and Logging"
block: reverse-eng/web-app/internal/error-handling-and-logging
part: A
source_repo: electric-wealth-web
source_version: 0.1.0
source_commit: bbb4907dd0d866223742c529ea65a75ec8af576f
extracted: 2026-10-16
---

## 10. Error Handling and Logging

### 10.1 Error Handling Strategy

**One error type.** Every API failure becomes `ApiError { status, code, message, traceId? }` via `unwrap()`
([client.ts](../../src/api/client.ts)). The `code` comes from the API's `ErrorEnvelope.error.code`
(`UNKNOWN` when the body is not an envelope); `message` falls back to the HTTP status text.

**Three layers:**

| Layer | Mechanism | Covers |
|---|---|---|
| Transport / session | `onResponse` middleware → `ew:unauthorized` → `logout('expired')` | Expired or revoked sessions on any protected call |
| Query retry | `QueryClient` `retry`: once, only when not an `ApiError` with `status < 500` | Network failures, 5xx |
| Page | `<ErrorState error onRetry>` for queries; inline `<p class="form__error" role="alert">` for mutations | Everything else |

**Message selection.** The UI never shows the API's English `message`. It shows a translated message, chosen by
status or code:

| Where | Rule | Key |
|---|---|---|
| All queries | Any error | `common.error_generic` (+ "Trace: {traceId}" line when available) |
| Login | `status === 401` | `auth.invalid_credentials`, else `common.error_generic` |
| MFA | `code === 'UNAUTHORIZED'` → sign out as expired; `status === 401` | `auth.mfa_invalid` |
| Registration | `web.register_errors.<code>`, `defaultValue` generic | 6 codes (see [08.3](08-api-integration.md#83-error-handling)); `REGISTRATION_NOT_FOUND` also clears `registrationId` and returns to step 1 |
| Goal form | `code === 'VALIDATION_ERROR'` | `web.goal_invalid` |
| Address form | `code === 'VALIDATION_ERROR'` | `profile.address_invalid` |
| Booking / reschedule | `code === 'SLOT_UNAVAILABLE'` | `web.slot_taken` |
| Account detail | `status === 404` | `web.not_found_title` / `web.not_found_body` |
| Other mutations | Any error | `common.error_generic` |
| Settings | `update.isError` | `common.error_generic` in the `aria-live` status line (the optimistic change is rolled back) |

**Gaps** (also listed in [20](20-anti-patterns.md)):

- No React error boundary: a render-time exception unmounts the whole app (blank page).
- `DocumentsPage.download()` has no `catch`, so a failed download produces an unhandled promise rejection and no
  message.
- `MarketPage`'s search results do not handle `search.error` (shows "no results" text).
- Cancelling an advisor meeting uses `window.confirm`, and the cancel mutation's error is not displayed.

### 10.2 Logging

There is **no logging or telemetry** in the web app: no `console.*` calls in `src/`, no error-reporting SDK, no
analytics, no web-vitals reporting. The only diagnostic surfaced to users is the API `traceId`, shown under
`ErrorState` as `Trace: <id>` ([ui.tsx](../../src/components/ui.tsx)). Support staff can use it to find the request
in the API's logs (the API generates and logs trace ids; see the API Part A, section 21).


---

# Part 4 — Styling and Theming
