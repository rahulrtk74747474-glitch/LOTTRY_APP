import type { DrawCadence } from "./economics";

export type RollingDrawCohort = {
  id: string;
  cadence: DrawCadence;
  opensAt: Date;
  resultDate: Date;
  windowDays: number;
};

export const ROLLING_DRAW_RULES = {
  daily: {
    opensEveryDays: 2,
    windowDays: 2,
    prefix: "48H",
  },
  weekly: {
    opensEveryDays: 1,
    windowDays: 7,
    prefix: "W",
  },
  monthly: {
    opensEveryDays: 1,
    windowDays: 30,
    prefix: "M",
  },
} as const;

function startOfUtcDay(input: Date) {
  return new Date(Date.UTC(input.getUTCFullYear(), input.getUTCMonth(), input.getUTCDate()));
}

function addUtcDays(input: Date, days: number) {
  const date = new Date(input);
  date.setUTCDate(date.getUTCDate() + days);
  return date;
}

function yyyymmdd(input: Date) {
  const year = input.getUTCFullYear();
  const month = String(input.getUTCMonth() + 1).padStart(2, "0");
  const day = String(input.getUTCDate()).padStart(2, "0");
  return `${year}${month}${day}`;
}

export function getRollingDrawCohort(cadence: DrawCadence, opensOn: Date): RollingDrawCohort {
  const rule = ROLLING_DRAW_RULES[cadence];
  const opensAt = startOfUtcDay(opensOn);

  // Result date is inclusive. Example: weekly cohort opened Jan 2 has its
  // published result date on Jan 8 (Jan 2..Jan 8 = seven calendar dates).
  const resultDate = addUtcDays(opensAt, rule.windowDays - 1);

  return {
    id: `FD-${rule.prefix}-${yyyymmdd(opensAt)}`,
    cadence,
    opensAt,
    resultDate,
    windowDays: rule.windowDays,
  };
}

export function getActiveRollingCohorts(cadence: "weekly" | "monthly", now: Date, limit = 4) {
  const rule = ROLLING_DRAW_RULES[cadence];
  const today = startOfUtcDay(now);
  const cohorts: RollingDrawCohort[] = [];

  for (let offset = 0; offset < rule.windowDays && cohorts.length < limit; offset += 1) {
    const opensAt = addUtcDays(today, -offset);
    const cohort = getRollingDrawCohort(cadence, opensAt);
    if (cohort.resultDate >= today) cohorts.push(cohort);
  }

  return cohorts;
}

export function formatRollingDate(date: Date, locale = "en") {
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(date);
}
