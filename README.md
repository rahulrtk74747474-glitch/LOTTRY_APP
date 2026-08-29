# FairDraw

FairDraw is a responsive web/PWA + Android/iOS prototype for a verified-member draw platform.

## Current V2 sandbox

The `feature/ad-funded-draw-v2` branch adds the requested daily/weekly/monthly qualification model while keeping regulated cash features disabled until approvals are complete.

- Permanent member ID
- Account/profile and verification dashboard
- Phone verification sandbox flow
- Daily target: 10 verified ad completions
- Weekly target: 50 verified ad completions
- Monthly target: 300 verified ad completions
- Unique sandbox ticket generation after qualification
- Below 500 entrants: up to 10 winners
- 500+ entrants: up to 200 winners
- User-requested top-three waterfall: 30%, 14%, 1.4% of the allocated pool
- Rank 4+ rule: value equivalent to 10 verified ad completions
- Referral economics supported in the calculation engine
- Web/PWA, Android Capacitor and iOS Capacitor targets

See [AD_FUNDED_DRAW_SPEC.md](AD_FUNDED_DRAW_SPEC.md) for economics, international rollout, anti-fraud, security and compliance gates. The calculation code lives in `lib/economics.ts`.

## Critical ad rule

FairDraw must never ask or incentivize users to click ads. The sandbox uses the concept of a **verified ad completion**, not an ad click. Production qualification must come from an approved ad integration and trusted/server-verifiable events.

Cash, gift-card, bank-withdrawal and real-lottery functionality is not enabled in the sandbox. These features require territory-specific legal/licensing review plus app-store, ad-network, payment-provider, KYC/AML, tax, age and location controls.

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

## Android

```bash
npm install
npm run build
npx cap sync android
npx cap open android
```

Use Android Studio to build a test APK or signed App Bundle.

## iOS

macOS, Xcode and an Apple Developer account are required.

```bash
npm install
npm run build
npx cap sync ios
npx cap open ios
```

Choose the signing team in Xcode, then run on a device or archive for TestFlight.

## Production security requirements

- server-authoritative qualification and ticket minting;
- signed/server-verified ad callbacks where supported;
- idempotent ad events, referrals, ledger entries and payouts;
- immutable draw cutoffs and auditable winner selection;
- fraud/risk controls for devices, accounts, referrals and payout destinations;
- MFA/step-up checks for payout changes;
- managed secrets, encryption, rate limiting and immutable admin audit logs;
- geo-restriction, age controls, KYC and territory feature flags.
