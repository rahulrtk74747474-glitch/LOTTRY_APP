# Security policy and production controls

The current application is a non-cash prototype. Demo ticket IDs are generated on the device and are not authoritative.

## Minimum controls before production

1. Server-side identity with verified age and jurisdiction.
2. KYC/AML and sanctions screening appropriate to the licensed operation.
3. Payment-provider approval for the exact lottery/gaming use case.
4. Append-only accounting ledger; never calculate balances only from mutable wallet rows.
5. Idempotency keys for deposits, ticket purchase, draw settlement, refunds, and withdrawals.
6. Database uniqueness on `(draw_id, ticket_number)` and transactionally enforced ticket limits.
7. Cryptographically secure draw entropy with a public pre-commit/reveal record or regulated certified RNG.
8. Separation of duties: nobody who administers tickets should be able to alter draw results or approve their own payouts.
9. Signed audit events, immutable result snapshots, reconciliation, fraud monitoring, and incident response.
10. Encryption in transit and at rest, secret management, least privilege, rate limiting, WAF/bot controls, CSRF protection, and secure session cookies.
11. Independent application security review, penetration test, RNG review, and payout-engine tests.
12. Backups, restore drills, observability, alerts, and a documented disaster-recovery objective.

## Never store

- API keys, payment secrets, private signing keys, passwords, PINs, or TOTP seeds in source control.
- Full card data.
- KYC documents in the relational database; use encrypted object storage with narrow access and retention rules.

## Reporting

Do not publish security vulnerabilities in a public issue. Contact the repository owner privately.
