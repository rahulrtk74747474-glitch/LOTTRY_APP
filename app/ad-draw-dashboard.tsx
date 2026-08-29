"use client";

import { CalendarDays, Check, Clock3, Eye, Gift, Layers3, ShieldCheck, Sparkles, Ticket, Trophy } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  BUSINESS_GUARDRAILS,
  calculateDrawEconomics,
  DRAW_RULES,
  type DrawCadence,
} from "@/lib/economics";
import {
  formatRollingDate,
  getActiveRollingCohorts,
  getRollingDrawCohort,
  type RollingDrawCohort,
} from "@/lib/rolling-draws";

const cadenceOrder: DrawCadence[] = ["daily", "weekly", "monthly"];

function cadenceDescription(cadence: DrawCadence) {
  if (cadence === "daily") return "Complete the qualification target during the active 48-hour short-draw window.";
  if (cadence === "weekly") return "A new seven-day cohort opens every day. Each cohort has its own 50-completion qualification and result date.";
  return "A new 30-day cohort opens every day. Each cohort has its own 300-completion qualification and result date.";
}

function cohortTitle(cohort: RollingDrawCohort) {
  return `${formatRollingDate(cohort.opensAt)} → ${formatRollingDate(cohort.resultDate)}`;
}

export function AdDrawDashboard() {
  const [selected, setSelected] = useState<DrawCadence>("daily");
  const [today] = useState(() => new Date());
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [demoTicket, setDemoTicket] = useState<string | null>(null);

  const rollingCohorts = useMemo(
    () => selected === "weekly" || selected === "monthly"
      ? getActiveRollingCohorts(selected, today, 5)
      : [],
    [selected, today],
  );

  const defaultCohort = useMemo(
    () => selected === "weekly" || selected === "monthly"
      ? getRollingDrawCohort(selected, today)
      : null,
    [selected, today],
  );

  const [selectedCohortIds, setSelectedCohortIds] = useState<Record<"weekly" | "monthly", string>>(() => ({
    weekly: getRollingDrawCohort("weekly", today).id,
    monthly: getRollingDrawCohort("monthly", today).id,
  }));

  const selectedCohort = selected === "weekly" || selected === "monthly"
    ? rollingCohorts.find((cohort) => cohort.id === selectedCohortIds[selected]) ?? defaultCohort
    : null;

  const rule = DRAW_RULES[selected];
  const progressKey = selected === "daily" ? "48H-current" : selectedCohort?.id ?? `${selected}-current`;
  const completed = progress[progressKey] ?? 0;
  const qualified = completed >= rule.requiredVerifiedAdViews;

  const sample = useMemo(
    () => calculateDrawEconomics({
      cadence: selected,
      entrants: 500,
      netRevenuePerVerifiedAdView: 1,
      successfulReferrals: 10_000,
    }),
    [selected],
  );

  function recordSandboxCompletion() {
    setProgress((current) => ({
      ...current,
      [progressKey]: Math.min((current[progressKey] ?? 0) + 1, rule.requiredVerifiedAdViews),
    }));
    setDemoTicket(null);
  }

  function createSandboxTicket() {
    if (!qualified) return;
    const drawId = selected === "daily"
      ? `FD-48H-${crypto.randomUUID().slice(0, 6).toUpperCase()}`
      : selectedCohort?.id ?? `FD-${selected.toUpperCase()}`;
    setDemoTicket(`${drawId}-${crypto.randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase()}`);
  }

  return (
    <section className="draw-section" id="ad-draws" aria-labelledby="ad-draw-title">
      <div className="section-heading">
        <div>
          <span className="section-kicker">FairDraw V2 sandbox</span>
          <h2 id="ad-draw-title">Continuous rolling draws</h2>
        </div>
        <p>
          Weekly and monthly draws now overlap: a fresh cohort opens every calendar day while older cohorts continue toward their own result dates. Verified ad revenue and qualification are isolated per cohort so the same completion is never counted twice.
        </p>
      </div>

      <div className="tier-grid" role="list" aria-label="Draw qualification periods">
        {cadenceOrder.map((cadence) => {
          const target = DRAW_RULES[cadence].requiredVerifiedAdViews;
          const isSelected = selected === cadence;
          return (
            <button
              key={cadence}
              type="button"
              className={`draw-card ${isSelected ? "selected" : ""}`}
              onClick={() => {
                setSelected(cadence);
                setDemoTicket(null);
              }}
              aria-pressed={isSelected}
            >
              <div className="draw-card-top">
                <span className="draw-icon">{cadence === "daily" ? <Clock3 /> : <CalendarDays />}</span>
                <span className="status-pill"><i /> {cadence === "daily" ? "48-hour" : "Daily opening"}</span>
              </div>
              <div className="draw-price">{target}</div>
              <span className="draw-label">verified ad completions per ticket</span>
              <div className="draw-pool">
                <span>{DRAW_RULES[cadence].label}</span>
                <strong>{cadence === "weekly" ? "7 days" : cadence === "monthly" ? "30 days" : "48 hours"}</strong>
              </div>
              <div className="draw-meta">
                <span><Eye /> No forced clicks</span>
                <span>{cadence === "daily" ? "Profit protected" : "New cohort daily"}</span>
              </div>
            </button>
          );
        })}
      </div>

      {(selected === "weekly" || selected === "monthly") && (
        <section className="purchase-panel" aria-labelledby="rolling-cohorts-title">
          <div className="purchase-summary">
            <span className="section-kicker"><Layers3 /> Rolling cohorts</span>
            <h2 id="rolling-cohorts-title">Choose the draw you are qualifying for</h2>
            <p>
              Example: a weekly cohort opened on 2 Jan publishes its result on 8 Jan; the cohort opened on 3 Jan publishes on 9 Jan. The same pattern continues every day.
            </p>
          </div>
          <div className="purchase-controls">
            <label>Currently active cohorts</label>
            {rollingCohorts.map((cohort) => {
              const active = selectedCohort?.id === cohort.id;
              const cohortProgress = progress[cohort.id] ?? 0;
              return (
                <Button
                  key={cohort.id}
                  type="button"
                  variant={active ? "default" : "outline"}
                  onClick={() => {
                    setSelectedCohortIds((current) => ({ ...current, [selected]: cohort.id }));
                    setDemoTicket(null);
                  }}
                >
                  <CalendarDays /> {cohortTitle(cohort)} · {cohortProgress}/{rule.requiredVerifiedAdViews}
                </Button>
              );
            })}
            <small>Each cohort has a separate progress counter, ticket list, revenue ledger and result.</small>
          </div>
        </section>
      )}

      <section className="purchase-panel" aria-labelledby="qualification-title">
        <div className="purchase-summary">
          <span className="section-kicker">{DRAW_RULES[selected].label} entry</span>
          <h2 id="qualification-title">{completed} / {rule.requiredVerifiedAdViews} completed</h2>
          <p>{cadenceDescription(selected)}</p>
          {selectedCohort && <p><strong>Selected cohort:</strong> {cohortTitle(selectedCohort)} · {selectedCohort.id}</p>}
          <div className="pool-stat">
            <Gift />
            <span>
              <small>Winner mode</small>
              <strong>10 below 500 entrants · 200 from 500+</strong>
            </span>
          </div>
        </div>

        <div className="purchase-controls">
          <label>Sandbox qualification</label>
          <Progress value={(completed / rule.requiredVerifiedAdViews) * 100} aria-label="Qualification progress" />
          <Button size="lg" className="buy-button" onClick={recordSandboxCompletion} disabled={qualified}>
            <Eye /> {qualified ? "Qualification complete" : "Record sandbox ad completion"}
          </Button>
          <Button size="lg" variant="outline" onClick={createSandboxTicket} disabled={!qualified}>
            <Ticket /> Generate unique sandbox ticket
          </Button>
          <small>One verified completion is assigned to one cohort only. A ticket for tomorrow's weekly/monthly cohort requires separate qualification activity.</small>
        </div>

        {demoTicket && (
          <div className="demo-success" role="status">
            <span><Check /></span>
            <div><small>Unique sandbox ticket</small><strong>{demoTicket}</strong></div>
          </div>
        )}
      </section>

      <div className="rules-layout">
        <div className="podium">
          <article className="podium-card second"><span>2</span><small>Second</small><strong>14%</strong><em>20% of remaining 70%</em></article>
          <article className="podium-card first"><Trophy /><span>1</span><small>First</small><strong>30%</strong><em>of allocated pool</em></article>
          <article className="podium-card third"><span>3</span><small>Third</small><strong>1.4%</strong><em>10% of the 14% slice</em></article>
        </div>
        <div className="refund-list">
          <div><span className="rank-badge">4–10</span><p><strong>Low-participation return</strong><small>10 ad-equivalents each</small></p><b>&lt; 500 entrants</b></div>
          <div><span className="rank-badge">4–200</span><p><strong>Standard return</strong><small>10 ad-equivalents each</small></p><b>500+ entrants</b></div>
          <div><span className="rank-badge">Referrals</span><p><strong>Campaign-budget protected</strong><small>Maximum {BUSINESS_GUARDRAILS.referralBudgetPoolShare * 100}% of pool</small></p><b>No margin drain</b></div>
          <div><span className="rank-badge">Profit guard</span><p><strong>{sample.operatorRemainderAfterReservePercent.toFixed(2)}% protected remainder</strong><small>500 entrants, full referral reserve used</small></p><b>{sample.profitGuardPasses ? "PASS" : "ROLLOVER"}</b></div>
        </div>
      </div>

      <div className="math-note">
        <ShieldCheck />
        <p>
          <strong>Automatic rollover rule:</strong> every cohort is evaluated independently. It may close only when at least {BUSINESS_GUARDRAILS.minimumEntrants} qualified members are present and its own settled pool still leaves the {BUSINESS_GUARDRAILS.operatingAndRiskReservePoolShare * 100}% operating/risk reserve plus the {BUSINESS_GUARDRAILS.targetOperatorMarginPoolShare * 100}% target operator margin after known prizes and referral liabilities.
        </p>
      </div>

      <div className="math-note">
        <Sparkles />
        <p>
          <strong>No double counting:</strong> every verified ad-revenue event receives one immutable cohort allocation. Overlapping weekly/monthly draws can therefore grow total activity and revenue, but they cannot claim the same revenue event more than once.
        </p>
      </div>

      <div className="math-note">
        <ShieldCheck />
        <p>
          <strong>Compliance gate:</strong> live cash, bank withdrawals, Amazon/gift-card redemption and production lottery access remain disabled in this sandbox. Territory licensing, age/KYC controls, ad-network approval, payment-provider approval and server-verified accounting must be completed first.
        </p>
      </div>
    </section>
  );
}
