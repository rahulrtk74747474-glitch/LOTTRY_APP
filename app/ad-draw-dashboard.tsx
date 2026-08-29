"use client";

import { CalendarDays, Check, Clock3, Eye, Gift, ShieldCheck, Sparkles, Ticket, Trophy } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { calculateDrawEconomics, DRAW_RULES, type DrawCadence } from "@/lib/economics";

const cadenceOrder: DrawCadence[] = ["daily", "weekly", "monthly"];
const sandboxStart: Record<DrawCadence, number> = { daily: 0, weekly: 0, monthly: 0 };

function cadenceDescription(cadence: DrawCadence) {
  if (cadence === "daily") return "Complete the daily qualification target before the daily cutoff.";
  if (cadence === "weekly") return "Completions accumulate during the active weekly qualification window.";
  return "Completions accumulate during the active monthly qualification window.";
}

export function AdDrawDashboard() {
  const [selected, setSelected] = useState<DrawCadence>("daily");
  const [progress, setProgress] = useState(sandboxStart);
  const [demoTicket, setDemoTicket] = useState<string | null>(null);

  const rule = DRAW_RULES[selected];
  const completed = progress[selected];
  const qualified = completed >= rule.requiredVerifiedAdViews;

  const sample = useMemo(
    () => calculateDrawEconomics({ cadence: selected, entrants: 500, netRevenuePerVerifiedAdView: 1 }),
    [selected],
  );

  function recordSandboxCompletion() {
    setProgress((current) => ({
      ...current,
      [selected]: Math.min(current[selected] + 1, DRAW_RULES[selected].requiredVerifiedAdViews),
    }));
    setDemoTicket(null);
  }

  function createSandboxTicket() {
    if (!qualified) return;
    const prefix = selected === "daily" ? "D" : selected === "weekly" ? "W" : "M";
    setDemoTicket(`FD-${prefix}-${crypto.randomUUID().replaceAll("-", "").slice(0, 10).toUpperCase()}`);
  }

  return (
    <section className="draw-section" id="ad-draws" aria-labelledby="ad-draw-title">
      <div className="section-heading">
        <div>
          <span className="section-kicker">FairDraw V2 sandbox</span>
          <h2 id="ad-draw-title">Daily, weekly and monthly qualification</h2>
        </div>
        <p>
          This build counts sandbox verified-ad completions, never clicks. Production ad callbacks and cash-equivalent rewards stay disabled until network and territory approvals are complete.
        </p>
      </div>

      <div className="tier-grid" role="list" aria-label="Draw qualification periods">
        {cadenceOrder.map((cadence) => {
          const target = DRAW_RULES[cadence].requiredVerifiedAdViews;
          const value = progress[cadence];
          const isSelected = selected === cadence;
          const isQualified = value >= target;

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
                <span className="status-pill"><i /> {isQualified ? "Qualified" : "Open"}</span>
              </div>
              <div className="draw-price">{target}</div>
              <span className="draw-label">verified ad completions</span>
              <div className="draw-pool">
                <span>{DRAW_RULES[cadence].label} progress</span><strong>{value} / {target}</strong>
              </div>
              <Progress value={(value / target) * 100} aria-label={`${value} of ${target} sandbox ad completions`} />
              <div className="draw-meta">
                <span><Eye /> No forced clicks</span>
                <span>{isQualified ? <><Check /> Ready</> : `${target - value} left`}</span>
              </div>
            </button>
          );
        })}
      </div>

      <section className="purchase-panel" aria-labelledby="qualification-title">
        <div className="purchase-summary">
          <span className="section-kicker">{DRAW_RULES[selected].label} entry</span>
          <h2 id="qualification-title">{completed} / {rule.requiredVerifiedAdViews} completed</h2>
          <p>{cadenceDescription(selected)}</p>
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
          <small>For testing only. This button does not display a live ad and creates no monetary entitlement.</small>
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
          <div><span className="rank-badge">Top 3</span><p><strong>Pool waterfall</strong><small>45.4% combined</small></p><b>54.6% before other payouts</b></div>
          <div><span className="rank-badge">Sample</span><p><strong>{sample.remainderPercent.toFixed(2)}% remainder</strong><small>500 entrants, ₹1 net/view assumption</small></p><b>before referrals & costs</b></div>
        </div>
      </div>

      <div className="math-note">
        <ShieldCheck />
        <p>
          <strong>Compliance gate:</strong> live cash, bank withdrawals, Amazon/gift-card redemption and production lottery access are intentionally not enabled in this sandbox. Territory licensing, age/KYC controls, ad-network approval, payment-provider approval and server-verified accounting must be completed first.
        </p>
      </div>

      <div className="math-note">
        <Sparkles />
        <p>
          <strong>Accounting rule:</strong> one unit of settled ad revenue can fund only one pool allocation. Daily, weekly and monthly pools must not count the same revenue three times.
        </p>
      </div>
    </section>
  );
}
