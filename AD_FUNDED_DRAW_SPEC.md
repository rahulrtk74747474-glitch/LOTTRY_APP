# FairDraw V2 — ad-funded draw specification

Status: **prototype / compliance-gated**. Real cash, vouchers, bank withdrawals, live lottery operation, and production ad monetization must stay disabled until the relevant legal, app-store, ad-network, payment, KYC/AML, tax, age, and territory approvals are complete.

## Sustainable product model

Each verified member receives a permanent member ID and can qualify for three draw cadences:

| Draw | Qualification target | Opening model |
|---|---:|---|
| 48-hour | 20 verified ad completions | profit-protected short window |
| Weekly | 50 verified ad completions | a new 7-day cohort opens every day |
| Monthly | 300 verified ad completions | a new 30-day cohort opens every day |

The original 24-hour / 10-completion draw is removed from the production design because low-participation cases could pay more than the pool after the requested winner-return rules. The 48-hour / 20-completion design provides materially safer economics while preserving a frequent draw.

A qualifying ticket is unique and bound to one member and one specific draw cohort. Production eligibility must be server-authoritative; the client must never be able to mint a ticket by itself.

## Rolling weekly and monthly cohorts

Weekly and monthly draws are continuous rather than one shared calendar draw.

For weekly draws:

- a cohort opens every calendar day;
- the cohort remains a seven-calendar-date draw;
- a cohort opened on **2 Jan** publishes its scheduled result on **8 Jan**;
- the cohort opened on **3 Jan** publishes on **9 Jan**;
- the cohort opened on **4 Jan** publishes on **10 Jan**, and so on.

Monthly uses the same rolling idea with a 30-day cohort. A new monthly cohort opens every day while older monthly cohorts continue toward their own result dates.

Every cohort must have its own immutable `draw_id`, qualification counter, eligible-member set, ticket set, revenue ledger, referral liabilities, profit-guard calculation, result commitment, ranked result and payout ledger.

Default identifiers are derived from the opening date, for example:

- `FD-W-20260102` for the weekly cohort opened 2 Jan 2026;
- `FD-W-20260103` for the next day's weekly cohort;
- `FD-M-20260102` for the 30-day monthly cohort opened 2 Jan 2026.

A verified member can enter multiple overlapping cohorts, but each cohort requires its **own qualification activity**. One set of 50 verified ad completions cannot create tickets in every active weekly cohort, and one set of 300 cannot create tickets in every active monthly cohort.

For the first production version, allow at most **one ticket per verified member per cohort**. This keeps the probability model understandable and reduces account/ad farming risk. Additional-ticket mechanics should not be added until economics, policy and fraud behavior are measured.

The rolling cohort helper is implemented in `lib/rolling-draws.ts`.

## Important ad-policy correction

Do **not** reward, require, or encourage ad clicks. A click must happen only from genuine user interest. Any future ad integration must track server-verified rewarded-ad completion callbacks where the ad network permits the product model.

Google-served rewarded ads must not be configured to pay cash, gift cards, transferable value, or another direct monetary item to the user. Therefore the cash/voucher design is feature-gated and cannot be enabled merely by adding AdMob rewarded ads.

## Prize waterfall

Let `P` be the actual settled net revenue allocated to one draw pool after invalid-traffic adjustments/refunds and before draw payouts.

- Rank 1 = `30% × P` = `0.30P`
- Rank 2 = `20% × 70% × P` = `0.14P`
- Rank 3 = `10% × 20% × 70% × P` = `0.014P`
- Ranks 4 onward receive an amount equivalent to the configured value of 10 verified ad completions.
- If entrants are at least 500, maximum winners = 200.
- If entrants are below 500, maximum winners = 10.

Ranks 1–3 consume 45.4% of the pool, leaving **54.6%** before the rank-4+ payments, referral rewards, reserves, taxes, payment fees, fraud losses, compliance costs, and operating expenses.

## Profit-protection guardrails

The backend must calculate each cohort's economics from **settled server-side revenue**, not estimated client eCPM. A real-value draw cannot close merely because its clock expired.

Default guardrails:

- minimum qualified entrants: **12**;
- referral campaign budget: maximum **5% of that cohort's settled pool**;
- operating/fraud/compliance risk reserve: **10% of that cohort's settled pool**;
- minimum target operator remainder after known payouts and the operating/risk reserve: **10% of that cohort's settled pool**;
- short-draw rollover: another **48 hours** when the published close conditions are not met.

Weekly/monthly cohorts are also evaluated independently. Any rollover, extension, cancellation/refund-equivalent handling or other failure mode must follow rules published before entry and must never be changed after seeing who would win.

The rollover rule must be disclosed before users enter. Once a real-value draw is formally locked for winner selection, its rules and entry set cannot be changed opportunistically.

Referral campaigns are budget-limited. Production must stop accepting new promotional claims before the campaign budget is exhausted; already accepted claims must still be honored. Referral rewards must never be silently reduced after acceptance.

## Economics formula

Let:

- `N` = qualified entrants in one cohort
- `r` = actual net revenue per verified ad completion assigned to that cohort
- `V` = required ad completions per entrant (20 for 48-hour, 50 weekly, 300 monthly)
- `W` = winner count (`min(200,N)` when N >= 500; otherwise `min(10,N)`)
- `R` = successful referrals credited to that cohort/accounting period

Then:

- Gross pool `P = N × V × r`
- Top-three payout `= 0.454P`
- Rank-refund payout `= max(W - 3, 0) × 10r`
- Raw requested referral payout `= R × 3 × 7 × r`
- Referral campaign payout is capped by the configured campaign budget, currently `0.05P`
- Operating/risk reserve `= 0.10P`
- Protected operator target `= 0.10P`

A cohort passes the profit guard only when:

1. `N >= 12`; and
2. after top-three prizes, rank-return prizes, accepted referral liabilities, and the 10% operating/risk reserve, at least another 10% of `P` remains.

If the short draw fails this test at the scheduled cutoff, entries roll into the next pre-disclosed 48-hour window instead of forcing a loss-making result.

The economics implementation is in `lib/economics.ts`.

## Why 48 hours is safer

Using the requested 200-winner rule at 500 entrants:

- the old 10-completion short draw left only 15.2% before referral and operating costs;
- the new 20-completion / 48-hour design leaves 34.9% before referral and operating reserves;
- after fully reserving 5% for referrals and 10% for operating/risk costs, roughly 19.9% remains in the conservative 500-entrant example before taxes and other unmodeled costs.

These are structural percentages under the configured prize rules, not guaranteed business profit. Actual profitability still depends on real ad fill, geographic eCPM, invalid-traffic adjustments, taxes, payment costs, KYC costs, fraud, customer support, hosting, and legal/compliance expenses.

## No double counting

Rolling draws increase the number of available entry opportunities, but **they do not create revenue by accounting duplication**.

Every verified ad event must contain an immutable allocation such as `cohort_id` (or an auditable revenue-allocation record) before it can advance qualification. That event can advance only one cohort unless its settled revenue is explicitly split into fixed fractions whose total is no more than 100%.

Examples:

- 50 completions allocated to `FD-W-20260102` qualify only for that weekly cohort;
- entering `FD-W-20260103` requires another 50 eligible completions allocated to that cohort;
- an event used in a weekly cohort cannot simultaneously be booked at full value into a monthly or short-draw pool.

Settled publisher revenue, not client-estimated eCPM, must be the source of truth.

## Identity and eligibility

Production launch should require:

- email OTP verification;
- phone OTP verification;
- unique normalized phone and email constraints;
- age verification / adult-only access where required;
- country/region eligibility and geofencing;
- device and account abuse controls;
- KYC before any cash-equivalent redemption where legally permitted;
- encrypted payout details stored through a PCI/banking/payment provider token rather than raw bank credentials where possible.

## Security architecture

- Never trust ad completion, cohort selection, ticket eligibility, draw closing, winner selection, balance, or withdrawal values sent by the client.
- Use signed server-to-server ad callbacks when supported.
- Require unique network event IDs and idempotency keys so replayed callbacks cannot create duplicate progress.
- Persist an immutable `cohort_id` allocation for each accepted ad/revenue event.
- Enforce one ticket per verified member per cohort in the initial production rules.
- Use idempotency keys for tickets, wallet ledger entries, payouts, referrals and result publication.
- Use an append-only double-entry or auditable ledger for monetary amounts.
- Encrypt sensitive data at rest and in transit; store secrets only in a managed secret store.
- Apply rate limits by account/device/IP/risk score.
- Detect emulator farms, duplicated device identities, impossible completion rates, repeated payout destinations, referral rings, overlapping-account fingerprints and account farming.
- Require MFA/step-up verification for payout-detail changes and withdrawals.
- Keep draw inputs immutable after cutoff and publish a verifiable draw commitment/hash before winner selection.
- Separate admin roles and require strong MFA; log every privileged action to immutable audit storage.
- Back up databases and test restoration.

## Internationalization

Use locale keys rather than hard-coded copy. Initial target set should include English, Hindi, Spanish, Portuguese, French, German, Arabic (RTL), Indonesian, Turkish, Japanese, Korean, Simplified Chinese, and additional locales based on actual user demand. Currency and legal eligibility are territory-specific and must never be inferred only from display language.

## Platform delivery

The repository already targets:

- responsive web/PWA;
- Android through Capacitor;
- iOS through Capacitor.

Production cash/lottery features must remain controlled by server-side country feature flags so unsupported territories receive the non-cash/global experience instead of an illegal or store-noncompliant flow.
