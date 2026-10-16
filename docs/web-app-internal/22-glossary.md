---
title: "Glossary"
block: reverse-eng/web-app/internal/glossary
part: A
source_repo: electric-wealth-web
source_version: 0.1.0
source_commit: bbb4907dd0d866223742c529ea65a75ec8af576f
extracted: 2026-10-16
---

## 22. Glossary

| Term | Meaning in this codebase |
|---|---|
| **Auth phase** | `unauthenticated` → `mfa` → `authenticated`; decides which route table `App` renders |
| **Benchmark** | Comparison index returned with account performance; drawn as a second line rebased to 100 |
| **Basket** | Thematic group of securities (market feature) with a risk level and 1-year return |
| **Cents / minor units** | Integer money amounts used by the API (`12345` = $123.45) |
| **Contribution room** | Remaining amount a registered account (TFSA, RRSP, FHSA) may receive this year |
| **Deep link** | Mobile URL `electricwealth://<section>/<id>` returned by the API; mapped to a web route by `deepLinkToRoute` |
| **Eyebrow** | Small uppercase label above a heading, rendered as `// LABEL` |
| **FHSA** | First Home Savings Account (Canadian registered account) |
| **Hero card** | Dark feature card showing a headline amount |
| **Holding** | A security position inside an account (symbol, quantity, market value, weight %) |
| **KYC** | Know Your Customer — account opening "is subject to KYC and suitability review" |
| **MFA** | Second sign-in step: 6-digit code (demo `123456`) |
| **Non-registered** | Taxable investment account (`NON_REGISTERED`) |
| **Query key** | TanStack Query cache key (array) defined in `queryKeys` |
| **Quick link** | Dashboard shortcut provided by the API, with a deep link |
| **Registration (enrolment)** | 7-step flow for an existing client to create online access; `registrationId` identifies the server-side draft |
| **RRSP** | Registered Retirement Savings Plan |
| **Scheduled transaction** | Future-dated transaction listed above history on the account page |
| **Security** | A tradable instrument (stock, ETF) identified by `symbol` |
| **Sign-out reason** | `user`, `idle` or `expired`; decides the notice on the login page |
| **Slot** | A bookable advisor time (`HH:mm`) on an availability day |
| **TFSA** | Tax-Free Savings Account |
| **Time-weighted return** | Performance figure (`timeWeightedReturnPct`) shown with the chart |
| **Trace id** | API request id included in error envelopes; shown under generic errors |
| **Trusted contact** | Person the firm may contact about the client (optional registration step) |
| **Watchlist** | User's list of followed securities |

