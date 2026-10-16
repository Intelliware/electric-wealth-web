---
title: "Feature Modules"
block: reverse-eng/web-app/internal/feature-modules
part: A
source_repo: electric-wealth-web
source_version: 0.1.0
source_commit: bbb4907dd0d866223742c529ea65a75ec8af576f
extracted: 2026-10-16
---

## 13. Feature Modules

One folder per product area under `src/features/`. Every page follows the pattern in
[07.2](07-component-architecture.md#72-component-documentation-template). API details are in
[08.2](08-api-integration.md#82-api-endpoints-consumed) (numbers `#n` below refer to that table).

### 13.1 Sign-in, MFA and Registration

**Routes:** `/login` (signed out; shows `LoginPage` or `MfaPage` by phase), `/register`.

**Components** — [AuthPages.tsx](../../src/features/auth/AuthPages.tsx), [RegisterPage.tsx](../../src/features/auth/RegisterPage.tsx):
- `AuthCard` — centred panel with brand, language toggle (local only; not saved to the profile), title, subtitle.
- `LoginPage` — email (pre-filled `sarah.chen@example.com`) + password; sign-out notice for `idle` / `expired`; demo hint;
  link to `/register`.
- `MfaPage` — 6-digit code (`autoComplete="one-time-code"`), Verify, Back (= `logout('user')`), demo hint.
- `RegisterPage` — 7-step wizard with a progress bar ("Step n of 7"):

| Step | Sub-component | API | Notes |
|---|---|---|---|
| 1 Login details | `CredentialsStep` | `#5` start | Email, password, confirm |
| 2 Identity | `IdentityStep` | `#6` verify-identity | 10-digit account number, postal code, date of birth; shows demo identities (`web.register_demo_hint`) |
| 3 Security questions | `SecurityQuestionsStep` | `#7` list, `#8` save | Two different questions (defaults `q1`, `q2`); greets the verified client by name |
| 4 Two-step method | inline `StepForm` | none (kept in state) | `sms` or `email` |
| 5 Trusted contact | `TrustedContactStep` | `#9` | Skippable |
| 6 Consent | `ConsentStep` | `#10` complete | Three required checkboxes; returns tokens |
| 7 Done | inline tour | none | Four onboarding slides; "Get started" → `navigate('/')` then `startSession(tokens)` |

**State:** `AuthContext` (phase, sign-out reason); `RegisterPage` local state `step`, `busy`, `error`,
`registrationId`, `clientName`, `mfaMethod`, `tokens`. The API holds the draft registration between steps
(`registrationId`); the session starts only at step 7.

**API calls:** `#1`–`#4` (auth), `#5`–`#10` (registration).

**Behaviour notes:** Back buttons move between steps without calling the API. `REGISTRATION_NOT_FOUND` (timed-out
draft) resets to step 1. The registration wizard sends `consents` as all `true` (the checkboxes gate the submit).

---

### 13.2 Dashboard

**Routes:** `/` — [DashboardPage.tsx](../../src/features/dashboard/DashboardPage.tsx)

**Components:** greeting `PageHeader` (`dashboard.greeting_named`, "Good morning, {first name}", regardless of the
time of day); hero `Card` with portfolio total, day change
(`ChangeIndicator`) and as-of time; action-required alerts (link if the deep link maps, else "Mobile app only" tag);
`AllocationBar`; goals list with `ProgressBar`s and "View all" → `/goals`; quick links.

**State:** `useDashboard()` (`['dashboard', locale]`), `useProfile()` for the first name.

**API calls:** `#11` `GET /api/wealth/dashboard`, `#12` `GET /api/profile`.

---

### 13.3 Accounts

**Routes:** `/accounts`, `/accounts/new`, `/accounts/:id`

**Components:**
- `AccountsPage` — total balance hero (sum of returned accounts; "Hidden accounts are not included."), hide/show balances
  toggle (`••••`, local only), "Open an account" → `/accounts/new`, account rows (nickname or display name, tax status,
  type tag, balance, day change) linking to detail.
- `AccountDetailPage` — breadcrumb; hero (balance, day change); facts (tax status, rate of return, contribution room);
  `NicknameEditor`; `PerformanceSection` (range `1M` / `1Y` / `ALL`, time-weighted return, `PerformanceChart` vs
  benchmark); holdings table (symbol, name, quantity, value, weight); `TransactionsSection` (filter all / contribution
  / buy / dividend, scheduled list, history list, `Pagination` 10 per page). 404 → not-found state.
- `AccountOpenPage` — 3 steps: choose type (`TFSA`, `RRSP`, `FHSA`, `NON_REGISTERED` with descriptions), name it, review
  (+ KYC note); success card with links to the new account and back to accounts.

**State:** `useAccounts()` (page 1 only), `useAccount(id)`, `usePerformance(id, range)`,
`useTransactions(id, page, type)`; local `hideBalances`, `range`, `filter`, `page`, `editing`, `step`, `type`,
`displayName`.

**API calls:** `#16`–`#21`.

---

### 13.4 Documents

**Routes:** `/documents` (`?highlight=<id>`) — [DocumentsPage.tsx](../../src/features/documents/DocumentsPage.tsx)

**Components:** filters (client-side name search; year segmented `all` / `2024` / `2023`; category segmented `all` /
Tax / Statements / Confirmations / Legal); table (name, category and "action required" tags, account label or "All
accounts", year, size, Download, Share); highlighted row from the query string; `ShareDialog` (native `<dialog>` modal,
recipient email, success notice with link expiry).

**State:** `useDocuments({ year, category })` (server-side filters, `pageSize: 100`); local `search`, `downloading`,
`sharing`.

**API calls:** `#22` list, `#23` fetch for download, `#24` share.

**Behaviour notes:** download decodes `base64Stub` into a `Blob` and clicks a temporary `<a download="{name}.pdf">`
("The API returns a stub PDF; this shows the round trip without real document storage"). The year options are
hard-coded.

---

### 13.5 Goals

**Routes:** `/goals` — [GoalsPage.tsx](../../src/features/goals/GoalsPage.tsx)

**Components:** goal cards (name, category tag, current / target amounts, `ProgressBar`, on-track tag, target date);
"Add goal" opens `GoalForm` inline (name, category `Home` / `Retirement` / `Education` / `Vacation` / `Safety`, target
$, current $, target date).

**State:** `useGoals()` (`pageSize: 100`), `useCreateGoal()`; local `adding` and form fields.

**API calls:** `#25`, `#26` (currency always `CAD`; amounts converted to cents).

**Business rule in the UI:** "on track" = `progressPct >= 50` ("Same rule as the mobile app").

---

### 13.6 Market

**Routes:** `/market`, `/market/:symbol`, `/market/baskets`

**Components:**
- `MarketPage` — `SecuritySearch` (deferred input, ≥ 2 chars, results link to security pages); watchlist table (symbol,
  name, "held" tag, price, today's change, Remove); news list; weekly roundup; link to baskets.
- `SecurityPage` — breadcrumb; header with Add to / Remove from watchlist; hero price + change + held tag; `PriceChart`
  with range `1D` / `1M` / `1Y` / `5Y`; range change % (current price vs first close), range high and low; "About".
- `BasketsPage` — basket cards (name, risk tag Low / Medium / High, description, 1-year return, holdings count).

**State:** `useWatchlist`, `useToggleWatchlist`, `useMarketNews`, `useMarketRoundup`, `useMarketSearch(term)`,
`useSecurity(symbol)`, `usePriceHistory(symbol, range)`, `useBaskets`.

**API calls:** `#39`–`#47`. (`GET /api/market/quote` is not used.)

---

### 13.7 Education

**Routes:** `/learn`, `/learn/glossary`

**Components:**
- `LearnPage` — "x of y lessons completed" eyebrow; level filter (all / beginner / intermediate / advanced); lesson
  cards (level, type, duration tags; title; progress bar; "Mark complete" or "Completed").
- `GlossaryPage` — deferred search box; `<dl>` of terms and definitions.

**State:** `useEducationContent(level)` and `useGlossary(q)` (both keyed by locale), `useSaveEducationProgress`.

**API calls:** `#30`–`#32`. "Mark complete" always sends `progressPct: 100`; there is no lesson viewer.

---

### 13.8 Advisor

**Routes:** `/advisor`, `/advisor/messages`

**Components:**
- `AdvisorPage` — advisor card (initials avatar, name, designation, availability, "Message {first name}"); `BookingPanel`
  (meeting type segmented — defaults to the saved `defaultMeetingType`; day picker; slot picker; notes; Book) that turns
  into a reschedule panel for an existing meeting; upcoming meetings (`MeetingRow` with Reschedule and Cancel); past
  meetings (status completed / cancelled).
- `AdvisorMessagesPage` — breadcrumb; secure-channel notice; message thread (client / advisor bubbles with time); composer.

**State:** `useAdvisorAvailability`, `useAppointments`, `useBookAppointment`, `useUpdateAppointment`,
`useAdvisorMessages`, `useSendAdvisorMessage`, `usePreferences` (default meeting type); local `rescheduling`,
`meetingType`, `date`, `time`, `notes`, `confirmed`, `text`.

**API calls:** `#33`–`#38`. Booking and updates invalidate every `['advisor', …]` query on settle, so slots and the
meeting list refresh.

**Behaviour notes:** cancel asks `window.confirm`; a taken slot (`SLOT_UNAVAILABLE`) shows `web.slot_taken`; the thread
scrolls to the newest message when the count changes; no polling for new advisor replies.

---

### 13.9 Notifications

**Routes:** `/notifications` — [NotificationsPage.tsx](../../src/features/notifications/NotificationsPage.tsx), plus
`NotificationBell` in [Layout.tsx](../../src/components/Layout.tsx).

**Components:** unread count eyebrow; "Mark all as read"; list with type dot and tag (`ACTION_REQUIRED` / `WARNING` →
warning, `SUCCESS` → success, `INFO` → info), title, body, time, per-item "Mark as read". The bell shows the unread
count (capped `9+`).

**State:** `useNotifications()` (polled every 60 s while any component using it is mounted — the bell is always
mounted when signed in), `useMarkNotificationRead`, `useMarkAllNotificationsRead` (both update the cache in place).

**API calls:** `#27`–`#29`. Notification items are not links: the API's `Notification` schema has no deep-link field.

---

### 13.10 Profile

**Routes:** `/profile` — [ProfilePage.tsx](../../src/features/profile/ProfilePage.tsx)

**Components:** personal details (name, email, masked phone, date of birth, masked SIN if present; "To change these details, contact your advisor."); address card with inline `AddressForm` (line 1–2, city, province from 13 codes, postal code; country fixed to
Canada); trusted contact (read-only).

**State:** `useProfile()` (5-min stale time), `useUpdateAddress()` (writes the response into the cache).

**API calls:** `#12`, `#13`.

---

### 13.11 Settings

**Routes:** `/settings` — [SettingsPage.tsx](../../src/features/settings/SettingsPage.tsx)

**Components:** Appearance (theme light / dark / system; language en-CA / fr-CA), notification channels (email / SMS /
push switches), document delivery (digital / paper and digital), default meeting type (video / phone / in person),
`aria-live` save status line.

**State:** `usePreferences()`, `useUpdatePreferences()` (optimistic; each control saves immediately). Changing language
here also calls `setAppLocale`. The top-bar language toggle also saves `{ language }`.

**API calls:** `#14`, `#15`.


---

# Part 6 — Cross-Cutting Concerns
