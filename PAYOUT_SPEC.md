# Payout specification

This document fixes the current interpretation so product copy, tests, backend calculations, and customer terms do not drift.

For `N = 1,000` tickets of price `P`:

- Gross pool: `G = 1,000 × P`
- Rank 1: `0.22 × G`
- Rank 2: `0.11 × G`
- Rank 3: `0.08 × G`
- Ranks 4–50: `47 × P`
- Ranks 51–100: `50 × 0.80 × P`
- Ranks 101–200: `100 × 0.50 × P`
- Ranks 201–1,000: `800 × 0.30 × P`

Total payout:

```text
(0.22 + 0.11 + 0.08)G + 47P + 40P + 50P + 240P
= 0.41(1,000P) + 377P
= 787P
= 78.7% of G
```

The pre-cost remainder is `213P`, or 21.3% of the pool.

| Ticket | Pool | Rank 1 | Rank 2 | Rank 3 | Total payout | Pre-cost remainder |
|---:|---:|---:|---:|---:|---:|---:|
| ₹10 | ₹10,000 | ₹2,200 | ₹1,100 | ₹800 | ₹7,870 | ₹2,130 |
| ₹100 | ₹1,00,000 | ₹22,000 | ₹11,000 | ₹8,000 | ₹78,700 | ₹21,300 |
| ₹1,000 | ₹10,00,000 | ₹2,20,000 | ₹1,10,000 | ₹80,000 | ₹7,87,000 | ₹2,13,000 |
| ₹10,000 | ₹1,00,00,000 | ₹22,00,000 | ₹11,00,000 | ₹8,00,000 | ₹78,70,000 | ₹21,30,000 |

## Required product decision

If ranks 1–3 must also receive a 100% ticket refund, total payout becomes 79.0% rather than 78.7%. That must be explicitly approved before backend payout code is implemented.
