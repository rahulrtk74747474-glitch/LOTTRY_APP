export type DrawCadence = "daily" | "weekly" | "monthly";

export const DRAW_RULES = {
  daily: { requiredVerifiedAdViews: 10, label: "Daily" },
  weekly: { requiredVerifiedAdViews: 50, label: "Weekly" },
  monthly: { requiredVerifiedAdViews: 300, label: "Monthly" },
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
  referralBonusTotal: number;
  totalPayout: number;
  remainder: number;
  remainderPercent: number;
  profitableBeforeCosts: boolean;
};

export function calculateDrawEconomics(input: DrawEconomicsInput): DrawEconomics {
  const entrants = Math.max(0, Math.floor(input.entrants));
  const revenuePerView = Math.max(0, input.netRevenuePerVerifiedAdView);
  const requiredViews = DRAW_RULES[input.cadence].requiredVerifiedAdViews;
  const totalVerifiedAdViews = entrants * requiredViews;
  const grossPool = totalVerifiedAdViews * revenuePerView;

  // User-specified waterfall:
  // 1st = 30% of pool.
  // 2nd = 20% of the remaining 70% = 14% of pool.
  // 3rd = 10% of that 20%-of-70% slice = 1.4% of pool.
  const firstPrize = grossPool * PAYOUT_RULES.firstPoolShare;
  const secondPrize = grossPool * (0.70 * PAYOUT_RULES.secondOfRemaining70Share);
  const thirdPrize = grossPool * (0.70 * PAYOUT_RULES.secondOfRemaining70Share * PAYOUT_RULES.thirdOfSecondSliceShare);

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
  const referralBonusTotal = referralCount * referralBonusAdEquivalentPerDay * referralBonusDays * revenuePerView;

  const totalPayout = firstPrize + secondPrize + thirdPrize + rankRefundTotal + referralBonusTotal;
  const remainder = grossPool - totalPayout;
  const remainderPercent = grossPool > 0 ? (remainder / grossPool) * 100 : 0;

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
    referralBonusTotal,
    totalPayout,
    remainder,
    remainderPercent,
    profitableBeforeCosts: remainder >= 0,
  };
}
