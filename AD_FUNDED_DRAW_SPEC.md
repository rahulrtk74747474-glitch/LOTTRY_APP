# FairDraw V2 — ad-funded draw specification

Status: **prototype / compliance-gated**. Real cash, vouchers, bank withdrawals, live lottery operation, and production ad monetization must stay disabled until the relevant legal, app-store, ad-network, payment, KYC/AML, tax, age, and territory approvals are complete.

## Sustainable product model

Each verified member receives a permanent member ID and can qualify for three draw cadences:

| Draw | Qualification target |
|---|---:|
| 48-hour | 20 verified ad completions during the active 48-hour window |
| Weekly | 50 verified ad completions during the week |
| Monthly | 300 verified ad completions during the month before cutoff |

The original 24-hour / 10-completion draw is removed from the production design because low-participation cases could pay more than the pool after the requested winner-return rules. The 48-hour / 20-completion design provides materially safer economics while preserving a frequent draw.

A qualifying ticket is unique and bound to one member and one draw. Production eligibility must be server-authoritative; the client must never be able to mint a ticket by itself.

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

The backend must calculate draw economics from **settled server-side revenue**, not estimated client eCPM. A real-value draw cannot close merely because its clock expired.

Default guardrails:

- minimum qualified entrants: **12**;
- referral campaign budget: maximum **5% of the settled pool**;
- operating/fraud/compliance risk reserve: **10% of the settled pool**;
- minimum target operator remainder after known payouts and the operating/risk reserve: **10% of the settled pool**;
- short-draw rollover: another **48 hours** when the published close conditions are not met.

The rollover rule must be disclosed before users enter. Once a real-value draw is formally locked for winner selection, its rules and entry set cannot be changed opportunistically.

Referral campaigns are budget-limited. Production must stop accepting new promotional claims before the campaign budget is exhausted; already accepted claims must still be honored. Referral rewards must never be silently reduced after acceptance.

## Economics formula

Let:

- `N` = qualified entrants
- `r` = actual net revenue per verified ad completion assigned to this pool
- `V` = required ad completions per entrant (20 for 48-hour, 50 weekly, 300 monthly)
- `W` = winner count (`min(200,N)` when N >= 500; otherwise `min(10,N)`)
- `R` = successful referrals credited during the accounting period

Then:

- Gross pool `P = N × V × r`
- Top-three payout `= 0.454P`
- Rank-refund payout `= max(W - 3, 0) × 10r`
- Raw requested referral payout `= R × 3 × 7 × r`
- Referral campaign payout is capped by the configured campaign budget, currently `0.05P`
- Operating/risk reserve `= 0.10P`
- Protected operator target `= 0.10P`

A draw passes the profit guard only when:

1. `N >= 12`; and
2. after top-three prizes, rank-return prizes, accepted referral liabilities, and the 10% operating/risk reserve, at least another 10% of `P` remains.

If the short draw fails this test at the scheduled cutoff, entries roll into the next pre-disclosed 48-hour window instead of forcing a loss-making result.

The implementation is in `lib/economics.ts`.

## Why 48 hours is safer

Using the requested 200-winner rule at 500 entrants:

- the old 10-completion short draw left only 15.2% before referral and operating costs;
- the new 20-completion / 48-hour design leaves 34.9% before referral and operating reserves;
- after fully reserving 5% for referrals and 10% for operating/risk costs, roughly 19.9% remains in the conservative 500-entrant example before taxes and other unmodeled costs.

These are structural percentages under the configured prize rules, not guaranteed business profit. Actual profitability still depends on real ad fill, geographic eCPM, invalid-traffic adjustments, taxes, payment costs, KYC costs, fraud, customer support, hosting, and legal/compliance expenses.

## No double counting

The same ad revenue cannot fund the 48-hour, weekly, and monthly pools simultaneously. Production accounting must use one of these approaches:

1. assign each verified ad revenue event to exactly one draw pool; or
2. split each settled revenue event by a fixed allocation whose percentages total 100%.

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

- Never trust ad completion, ticket eligibility, draw closing, winner selection, balance, or withdrawal values sent by the client.
- Use signed server-to-server ad callbacks when supported.
- Use idempotency keys for ad events, tickets, wallet ledger entries, payouts, and referrals.
- Use an append-only double-entry or auditable ledger for monetary amounts.
- Encrypt sensitive data at rest and in transit; store secrets only in a managed secret store.
- Apply rate limits by account/device/IP/risk score.
- Detect emulator farms, duplicated device identities, impossible completion rates, repeated payout destinations, referral rings, and account farming.
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
