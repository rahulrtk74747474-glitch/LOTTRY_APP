"use client";

import {
  ArrowRight,
  Check,
  ChevronRight,
  Clock3,
  Coins,
  Fingerprint,
  Gift,
  Menu,
  ShieldCheck,
  Sparkles,
  Ticket,
  Trophy,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const tiers = [10, 100, 1000, 10000] as const;

const drawMeta: Record<(typeof tiers)[number], { sold: number; time: string }> = {
  10: { sold: 742, time: "02h 14m" },
  100: { sold: 618, time: "05h 40m" },
  1000: { sold: 383, time: "18h 20m" },
  10000: { sold: 126, time: "2d 04h" },
};

function inr(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function Home() {
  const [selectedPrice, setSelectedPrice] = useState<(typeof tiers)[number]>(10);
  const [quantity, setQuantity] = useState(1);
  const [menuOpen, setMenuOpen] = useState(false);
  const [demoTicket, setDemoTicket] = useState<string | null>(null);

  const draw = drawMeta[selectedPrice];
  const pool = selectedPrice * 1000;
  const payout = useMemo(
    () => ({ first: pool * 0.22, second: pool * 0.11, third: pool * 0.08 }),
    [pool],
  );

  function generateDemoTicket() {
    const suffix = crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000;
    setDemoTicket(`FD-${selectedPrice}-${String(suffix).padStart(6, "0")}`);
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="FairDraw home">
          <span className="brand-mark" aria-hidden="true">
            <Ticket />
          </span>
          <span>FairDraw</span>
        </a>

        <nav className="desktop-nav" aria-label="Main navigation">
          <a className="active" href="#draws">Live draws</a>
          <a href="#results">Results</a>
          <a href="#fairness">How it works</a>
        </nav>

        <div className="top-actions">
          <span className="demo-chip"><span /> Demo credits only</span>
          <Button className="wallet-button" variant="outline">
            <WalletCards /> My tickets
          </Button>
          <Button
            className="menu-button"
            variant="ghost"
            size="icon"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </header>

      {menuOpen && (
        <nav className="mobile-nav" aria-label="Mobile navigation">
          <a href="#draws" onClick={() => setMenuOpen(false)}>Live draws</a>
          <a href="#results" onClick={() => setMenuOpen(false)}>Results</a>
          <a href="#fairness" onClick={() => setMenuOpen(false)}>How it works</a>
        </nav>
      )}

      <section className="hero" id="top">
        <div className="hero-copy">
          <div className="eyebrow"><Sparkles /> Transparent by design</div>
          <h1>Every ticket has a fair shot.</h1>
          <p>
            Choose a draw, receive a unique ticket, and follow the prize pool in
            real time. This first release uses demo credits while regulatory
            approval and payment licensing are completed.
          </p>
          <div className="hero-actions">
            <Button size="lg" className="primary-cta" onClick={() => document.querySelector("#draws")?.scrollIntoView({ behavior: "smooth" })}>
              Explore live draws <ArrowRight />
            </Button>
            <a className="text-link" href="#fairness">See payout rules <ChevronRight /></a>
          </div>
          <div className="trust-row" aria-label="FairDraw safeguards">
            <span><ShieldCheck /> Auditable rules</span>
            <span><Fingerprint /> Unique ticket IDs</span>
            <span><Users /> 18+ only</span>
          </div>
        </div>

        <div className="hero-visual" aria-label="Current ten rupee demo draw">
          <div className="orb orb-one" />
          <div className="orb orb-two" />
          <article className="ticket-preview">
            <div className="ticket-topline">
              <span>LIVE DRAW</span>
              <span className="live-dot"><i /> OPEN</span>
            </div>
            <div className="ticket-price"><small>Ticket</small>{inr(10)}</div>
            <div className="ticket-code">FD–10–••••••</div>
            <div className="ticket-divider" />
            <div className="ticket-stats">
              <div><small>Prize pool</small><strong>{inr(10_000)}</strong></div>
              <div><small>Tickets sold</small><strong>742 / 1,000</strong></div>
            </div>
            <Progress className="ticket-progress" value={74.2} aria-label="74.2 percent sold" />
            <div className="ticket-footer">
              <span><Clock3 /> 02h 14m</span>
              <span>Draw #FD1048</span>
            </div>
          </article>
          <div className="winner-float"><Trophy /><span><small>Top prize</small>{inr(2_200)}</span></div>
          <div className="refund-float"><Coins /><span><small>Every ticket</small>gets a return</span></div>
        </div>
      </section>

      <section className="draw-section" id="draws">
        <div className="section-heading">
          <div>
            <span className="section-kicker">Live draws</span>
            <h2>Pick your ticket value</h2>
          </div>
          <p>Each draw closes at 1,000 unique tickets. Prize percentages stay the same at every level.</p>
        </div>

        <RadioGroup
          className="tier-grid"
          value={String(selectedPrice)}
          onValueChange={(value) => {
            setSelectedPrice(Number(value) as (typeof tiers)[number]);
            setDemoTicket(null);
          }}
          aria-label="Choose a ticket value"
        >
          {tiers.map((price) => {
            const meta = drawMeta[price];
            const selected = selectedPrice === price;
            return (
              <label key={price} className={`draw-card ${selected ? "selected" : ""}`}>
                <RadioGroupItem className="sr-only" value={String(price)} />
                <div className="draw-card-top">
                  <span className="draw-icon"><Ticket /></span>
                  <span className="status-pill"><i /> Live</span>
                </div>
                <div className="draw-price">{inr(price)}</div>
                <span className="draw-label">per ticket</span>
                <div className="draw-pool">
                  <span>Pool at sell-out</span><strong>{inr(price * 1000)}</strong>
                </div>
                <Progress value={meta.sold / 10} aria-label={`${meta.sold} of 1000 tickets sold`} />
                <div className="draw-meta"><span>{meta.sold} sold</span><span><Clock3 /> {meta.time}</span></div>
                <span className="select-indicator">{selected ? <><Check /> Selected</> : <>Select draw <ChevronRight /></>}</span>
              </label>
            );
          })}
        </RadioGroup>
      </section>

      <section className="purchase-panel" aria-labelledby="purchase-title">
        <div className="purchase-summary">
          <span className="section-kicker">Your selection</span>
          <h2 id="purchase-title">{inr(selectedPrice)} FairDraw</h2>
          <p>Draw closes after the remaining {1000 - draw.sold} demo tickets are assigned.</p>
          <div className="pool-stat">
            <Gift />
            <span><small>Top prize at sell-out</small><strong>{inr(payout.first)}</strong></span>
          </div>
        </div>
        <div className="purchase-controls">
          <label htmlFor="quantity">Number of demo tickets</label>
          <div className="stepper">
            <Button variant="outline" size="icon" aria-label="Decrease quantity" onClick={() => setQuantity((value) => Math.max(1, value - 1))}>−</Button>
            <output id="quantity" aria-live="polite">{quantity}</output>
            <Button variant="outline" size="icon" aria-label="Increase quantity" onClick={() => setQuantity((value) => Math.min(10, value + 1))}>+</Button>
          </div>
          <div className="total-row"><span>Demo total</span><strong>{inr(selectedPrice * quantity)}</strong></div>
          <Button size="lg" className="buy-button" onClick={generateDemoTicket}>
            <Ticket /> Generate demo ticket
          </Button>
          <small>No payment is collected in this prototype.</small>
        </div>
        {demoTicket && (
          <div className="demo-success" role="status">
            <span><Check /></span>
            <div><small>Unique demo ticket created</small><strong>{demoTicket}</strong></div>
          </div>
        )}
      </section>

      <section className="rules-section" id="fairness">
        <div className="section-heading rules-heading">
          <div>
            <span className="section-kicker">Payout engine</span>
            <h2>One clear rulebook</h2>
          </div>
          <p>Example below assumes 1,000 tickets in the selected {inr(selectedPrice)} draw, creating a {inr(pool)} pool.</p>
        </div>
        <div className="rules-layout">
          <div className="podium">
            <article className="podium-card second"><span>2</span><small>Second</small><strong>{inr(payout.second)}</strong><em>11% of pool</em></article>
            <article className="podium-card first"><Trophy /><span>1</span><small>First</small><strong>{inr(payout.first)}</strong><em>22% of pool</em></article>
            <article className="podium-card third"><span>3</span><small>Third</small><strong>{inr(payout.third)}</strong><em>8% of pool</em></article>
          </div>
          <div className="refund-list">
            <div><span className="rank-badge">4–50</span><p><strong>100% ticket return</strong><small>{inr(selectedPrice)} per ticket</small></p><b>47 places</b></div>
            <div><span className="rank-badge">51–100</span><p><strong>80% ticket return</strong><small>{inr(selectedPrice * 0.8)} per ticket</small></p><b>50 places</b></div>
            <div><span className="rank-badge">101–200</span><p><strong>50% ticket return</strong><small>{inr(selectedPrice * 0.5)} per ticket</small></p><b>100 places</b></div>
            <div><span className="rank-badge">201–1,000</span><p><strong>30% ticket return</strong><small>{inr(selectedPrice * 0.3)} per ticket</small></p><b>800 places</b></div>
          </div>
        </div>
        <div className="math-note">
          <ShieldCheck />
          <p><strong>Payout math:</strong> this interpretation pays ranks 1–3 their percentage prize (without an extra ticket refund). The complete payout is 78.7% of the pool; 21.3% remains before taxes, payment fees, compliance, reserves, and operating costs.</p>
        </div>
      </section>

      <section className="results-section" id="results">
        <div>
          <span className="section-kicker">Verifiable results</span>
          <h2>Fairness should be provable, not promised.</h2>
        </div>
        <div className="proof-grid">
          <article><span>01</span><Fingerprint /><h3>Unique tickets</h3><p>Every entry receives a non-repeating ID tied to one draw.</p></article>
          <article><span>02</span><ShieldCheck /><h3>Locked entries</h3><p>The final ticket list is frozen before a result can be generated.</p></article>
          <article><span>03</span><Sparkles /><h3>Published proof</h3><p>Draw inputs, ranked results, and payout calculations are retained for audit.</p></article>
        </div>
      </section>

      <footer>
        <a className="brand" href="#top"><span className="brand-mark"><Ticket /></span><span>FairDraw</span></a>
        <p>Prototype only · Demo credits · No deposits or cash prizes</p>
        <span>18+ · Play responsibly</span>
      </footer>
    </main>
  );
}
