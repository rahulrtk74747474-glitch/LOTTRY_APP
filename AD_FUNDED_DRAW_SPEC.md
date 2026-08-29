# FairDraw V2 — ad-funded draw specification

Status: **prototype / compliance-gated**. Real cash, vouchers, bank withdrawals, live lottery operation, and production ad monetization must stay disabled until the relevant legal, app-store, ad-network, payment, KYC/AML, tax, age, and territory approvals are complete.

## Product model requested

Each verified member receives a permanent member ID and can qualify for three draw cadences:

| Draw | Qualification target |
|---|---:|
| Daily | 10 verified ad completions |
| Weekly | 50 verified ad completions during the week |
| Monthly | 300 verified ad completions during the month before cutoff |

A qualifying ticket is unique and bound to one member and one draw. Production eligibility must be server-authoritative; the client must never be able to mint a ticket by itself.

## Important ad-policy correction

Do **not** reward, require, or encourage ad clicks. A click must happen only from genuine user interest. Any future ad integration must track server-verified rewarded-ad completion callbacks where the ad network permits the product model.

Google-served rewarded ads must not be configured to pay cash, gift cards, transferable value, or another direct monetary item to the user. Therefore the cash/voucher design is feature-gated and cannot be enabled merely by adding AdMob rewarded ads.

## User-requested prize waterfall

Let `P` be the actual net revenue allocated to one draw pool after invalid-traffic adjustments/refunds and before draw payouts.

- Rank 1 = `30% × P` = `0.30P`
- Rank 2 = `20% × 70% × P` = `0.14P`
- Rank 3 = `10% × 20% × 70% × P` = `0.014P`
- Ranks 4 onward receive an amount equivalent to the configured value of 10 verified ad completions.
- If entrants are at least 500, maximum winners = 200.
- If entrants are below 500, maximum winners = 10.

Ranks 1–3 consume 45.4% of the pool, leaving **54.6%** before the rank-4+ payments, referral rewards, taxes, payment fees, fraud losses, chargebacks, reserves, compliance costs, and operating expenses.

## Economics formula

Let:

- `N` = qualified entrants
- `r` = actual net revenue per verified ad completion assigned to this pool
- `V` = required ad completions per entrant (10 daily, 50 weekly, 300 monthly)
- `W` = winner count (`min(200,N)` when N >= 500; otherwise `min(10,N)`)
- `R` = successful referrals credited during the accounting period

Then:

- Gross pool `P = N × V × r`
- Top-three payout `= 0.454P`
- Rank-refund payout `= max(W - 3, 0) × 10r`
- Default referral payout assumption from the requested wording `= R × 3 × 7 × r` (3 ad-equivalents per day for 7 days). This must be changed if the intended referral bonus is only 3 ad-equivalents total.
- Pre-cost remainder `= P - top-three payout - rank-refund payout - referral payout`

The implementation is in `lib/economics.ts`.

## No double counting

The same ad revenue cannot fund the daily, weekly, and monthly pools simultaneously. Production accounting must use one of these approaches:

1. assign each verified ad revenue event to exactly one draw pool; or
2. split each settled revenue event by a fixed allocation, for example daily/weekly/monthly reserves whose percentages total 100%.

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
