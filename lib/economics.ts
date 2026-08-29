export type DrawCadence = "daily" | "weekly" | "monthly";

export const DRAW_RULES = {
  // Keep the internal key `daily` for compatibility, but the customer-facing
  // short draw is now a 48-hour window. Twenty verified completions avoids the
  // loss-making 10-view edge cases in the original one-day design.
  daily: { requiredVerifiedAdViews: 20, label: "48-hour", windowHours: 48 },
  weekly: { requiredVerifiedAdViews: 50, label: "Weekly", windowHours: 7 * 24 },
  monthly: { requiredVerifiedAdViews: 300, label: "Monthly", windowHours: 30 * 24 },
} as const;

export const PAYOUT_RULES = {
  firstPoolShare: 0.30,
  secondOfRemaining70Share: 0.20,
  thirdOfSecondSliceShare: 0.10,
  standardWinnerCount: 200,
  lowParticipationWinnerCount: 10,
  standardWinnerThreshold: 500,
  rankRefundAdEquivalent: 10,
  referralBonusAdEquivalentPerDay: 3,
  referralBonusDays: 7,
} as const;

export const BUSINESS_GUARDRAILS = {
  // A regulated/real-value draw should not close below this participation.
  // At 12 entrants, even the 48-hour design can protect the reserves below.
  minimumEntrants: 12,
  referralBudgetPoolShare: 0.05,
  operatingAndRiskReservePoolShare: 0.10,
  targetOperatorMarginPoolShare: 0.10,
  shortDrawRolloverHours: 48,
} as const;

export type DrawEconomicsInput = {
  cadence: DrawCadence;
  entrants: number;
  netRevenuePerVerifiedAdView: number;
  successfulReferrals?: number;
  referralBonusAdEquivalentPerDay?: number;
  referralBonusDays?: number;
};

export type DrawEconomics = {
  cadence: DrawCadence;
  entrants: number;
  requiredVerifiedAdViewsPerEntrant: number;
  totalVerifiedAdViews: number;
  grossPool: number;
  winnerCount: number;
  firstPrize: number;
  secondPrize: number;
  thirdPrize: number;
  rankRefundWinners: number;
  rankRefundTotal: number;
  rawReferralBonusTotal: number;
  referralBudget: number;
  referralBonusTotal: number;
  referralBudgetExhausted: boolean;
  totalPayout: number;
  remainder: number;
  remainderPercent: number;
  operatingAndRiskReserve: number;
  operatorRemainderAfterReserve: number;
  operatorRemainderAfterReservePercent: number;
  targetOperatorMargin: number;
  minimumEntrantsMet: boolean;
  profitGuardPasses: boolean;
  shouldRollover: boolean;
  profitableBeforeCosts: boolean;
};

export function calculateDrawEconomics(input: DrawEconomicsInput): DrawEconomics {
  const entrants = Math.max(0, Math.floor(input.entrants));
  const revenuePerView = Math.max(0, input.netRevenuePerVerifiedAdView);
  const requiredViews = DRAW_RULES[input.cadence].requiredVerifiedAdViews;
  const totalVerifiedAdViews = entrants * requiredViews;
  const grossPool = totalVerifiedAdViews * revenuePerView;

  // Requested waterfall:
  // 1st = 30% of pool.
  // 2nd = 20% of the remaining 70% = 14% of pool.
  // 3rd = 10% of that 20%-of-70% slice = 1.4% of pool.
  const firstPrize = grossPool * PAYOUT_RULES.firstPoolShare;
  const secondPrize = grossPool * (0.70 * PAYOUT_RULES.secondOfRemaining70Share);
  const thirdPrize = grossPool * (
    0.70 *
    PAYOUT_RULES.secondOfRemaining70Share *
    PAYOUT_RULES.thirdOfSecondSliceShare
  );

  const winnerCount = entrants >= PAYOUT_RULES.standardWinnerThreshold
    ? Math.min(PAYOUT_RULES.standardWinnerCount, entrants)
    : Math.min(PAYOUT_RULES.lowParticipationWinnerCount, entrants);

  const rankRefundWinners = Math.max(0, winnerCount - Math.min(3, winnerCount));
  const rankRefundTotal = rankRefundWinners * PAYOUT_RULES.rankRefundAdEquivalent * revenuePerView;

  const referralCount = Math.max(0, Math.floor(input.successfulReferrals ?? 0));
  const referralBonusAdEquivalentPerDay = Math.max(
    0,
    input.referralBonusAdEquivalentPerDay ?? PAYOUT_RULES.referralBonusAdEquivalentPerDay,
  );
  const referralBonusDays = Math.max(0, input.referralBonusDays ?? PAYOUT_RULES.referralBonusDays);
  const rawReferralBonusTotal = referralCount * referralBonusAdEquivalentPerDay * referralBonusDays * revenuePerView;

  // Referral campaigns are budgeted rather than allowed to consume the draw's
  // protected operating margin. Production should stop accepting new promo
  // claims once the campaign budget is exhausted; already accepted claims must
  // still be honored.
  const referralBudget = grossPool * BUSINESS_GUARDRAILS.referralBudgetPoolShare;
  const referralBonusTotal = Math.min(rawReferralBonusTotal, referralBudget);
  const referralBudgetExhausted = rawReferralBonusTotal > referralBudget;

  const totalPayout = firstPrize + secondPrize + thirdPrize + rankRefundTotal + referralBonusTotal;
  const remainder = grossPool - totalPayout;
  const remainderPercent = grossPool > 0 ? (remainder / grossPool) * 100 : 0;

  const operatingAndRiskReserve = grossPool * BUSINESS_GUARDRAILS.operatingAndRiskReservePoolShare;
  const operatorRemainderAfterReserve = remainder - operatingAndRiskReserve;
  const operatorRemainderAfterReservePercent = grossPool > 0
    ? (operatorRemainderAfterReserve / grossPool) * 100
    : 0;
  const targetOperatorMargin = grossPool * BUSINESS_GUARDRAILS.targetOperatorMarginPoolShare;
  const minimumEntrantsMet = entrants >= BUSINESS_GUARDRAILS.minimumEntrants;
  const profitGuardPasses = minimumEntrantsMet && operatorRemainderAfterReserve >= targetOperatorMargin;
  const shouldRollover = !profitGuardPasses;

  return {
    cadence: input.cadence,
    entrants,
    requiredVerifiedAdViewsPerEntrant: requiredViews,
    totalVerifiedAdViews,
    grossPool,
    winnerCount,
    firstPrize,
    secondPrize,
    thirdPrize,
    rankRefundWinners,
    rankRefundTotal,
    rawReferralBonusTotal,
    referralBudget,
    referralBonusTotal,
    referralBudgetExhausted,
    totalPayout,
    remainder,
    remainderPercent,
    operatingAndRiskReserve,
    operatorRemainderAfterReserve,
    operatorRemainderAfterReservePercent,
    targetOperatorMargin,
    minimumEntrantsMet,
    profitGuardPasses,
    shouldRollover,
    profitableBeforeCosts: remainder >= 0,
  };
}
