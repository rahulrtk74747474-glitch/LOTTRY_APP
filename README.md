# FairDraw

FairDraw is a modern, installable raffle prototype for web, Android, and iOS. The current release is intentionally **demo-credit only**: it does not accept deposits, process payments, or pay cash prizes.

## What is included

- Four ticket tiers: ₹10, ₹100, ₹1,000, and ₹10,000
- A fixed 1,000-ticket capacity per draw
- Interactive prize-pool and payout calculations
- Unique demo ticket generation
- Responsive, installable PWA experience
- Capacitor Android and iOS shells
- GitHub Actions workflow for a test Android APK

## Payout interpretation

For a sold-out 1,000-ticket draw:

| Rank | Return |
|---|---:|
| 1 | 22% of total pool |
| 2 | 11% of total pool |
| 3 | 8% of total pool |
| 4–50 | 100% of ticket price |
| 51–100 | 80% of ticket price |
| 101–200 | 50% of ticket price |
| 201–1,000 | 30% of ticket price |

Ranks 1–3 receive their percentage prize without an additional ticket refund. On that interpretation, total payout is 78.7% and the pre-cost remainder is 21.3%. See [PAYOUT_SPEC.md](PAYOUT_SPEC.md).

## Run the website

Requirements: Node.js 22+.

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

## Install as a web app

- Android/Chrome: open the deployed website, tap the browser menu, then **Install app**.
- iPhone/Safari: open the website, tap **Share**, then **Add to Home Screen**.

## Android test APK

The repository workflow **Build Android test APK** creates a debug APK after each push and can also be started manually from GitHub Actions.

Local Android setup:

```bash
npm install
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

Open the Android project in Android Studio and build an APK or signed App Bundle.

## iOS test app

iOS builds require macOS, Xcode, and an Apple Developer account:

```bash
npm install
npm run build
npx cap add ios
npx cap sync ios
npx cap open ios
```

Choose your signing team in Xcode, then run on a device or archive for TestFlight.

## Before any real-money release

Do not add payment collection, wallets, withdrawals, or cash payouts until written legal confirmation, required lottery/gaming permissions, payment-provider approval, KYC/AML controls, tax handling, age and location controls, responsible-play tooling, and an independently reviewed draw system are in place. See [LEGAL-COMPLIANCE.md](LEGAL-COMPLIANCE.md) and [SECURITY.md](SECURITY.md).
