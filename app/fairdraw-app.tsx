"use client";

import {
  ArrowRight,
  BadgeCheck,
  Fingerprint,
  Globe2,
  LockKeyhole,
  Menu,
  ShieldCheck,
  Sparkles,
  Ticket,
  Users,
  WalletCards,
  X,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { AdDrawDashboard } from "./ad-draw-dashboard";
import { MemberHub } from "./member-hub";
import type { MemberProfile, MemberTicket } from "@/lib/members";

export function FairDrawApp({ member, initialTickets }: { member: MemberProfile; initialTickets: MemberTicket[] }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="FairDraw home">
          <span className="brand-mark" aria-hidden="true"><Ticket /></span>
          <span>FairDraw</span>
        </a>

        <nav className="desktop-nav" aria-label="Main navigation">
          <a className="active" href="#ad-draws">Draws</a>
          <a href="#security">Security</a>
          <a href="#results">Results</a>
        </nav>

        <div className="top-actions">
          <span className="demo-chip"><span /> Compliance sandbox</span>
          <a className="wallet-button account-link" href="#member-profile">
            <WalletCards /> {member.memberId}
          </a>
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
          <a href="#ad-draws" onClick={() => setMenuOpen(false)}>Draws</a>
          <a href="#security" onClick={() => setMenuOpen(false)}>Security</a>
          <a href="#results" onClick={() => setMenuOpen(false)}>Results</a>
        </nav>
      )}

      <MemberHub initialMember={member} initialTickets={initialTickets} />

      <section className="hero" id="top">
        <div className="hero-copy">
          <div className="eyebrow"><Sparkles /> Profit-protected qualification platform</div>
          <h1>One verified member. Three sustainable draw timelines.</h1>
          <p>
            FairDraw V2 is built around verified identity, unique tickets, auditable qualification records and 48-hour, weekly and monthly draw windows. A draw never closes merely because a clock expired: production rules must first satisfy the published participation, reserve and margin guardrails.
          </p>
          <div className="hero-actions">
            <Button size="lg" className="primary-cta" onClick={() => document.querySelector("#ad-draws")?.scrollIntoView({ behavior: "smooth" })}>
              Open qualification dashboard <ArrowRight />
            </Button>
            <a className="text-link" href="#security">See security model</a>
          </div>
          <div className="trust-row" aria-label="FairDraw safeguards">
            <span><Fingerprint /> Unique member ID</span>
            <span><BadgeCheck /> Verification status</span>
            <span><ShieldCheck /> Server-authoritative rules</span>
          </div>
        </div>

        <div className="hero-visual" aria-label="FairDraw V2 qualification summary">
          <div className="orb orb-one" />
          <div className="orb orb-two" />
          <article className="ticket-preview">
            <div className="ticket-topline">
              <span>V2 SANDBOX</span>
              <span className="live-dot"><i /> ACTIVE</span>
            </div>
            <div className="ticket-price"><small>48-hour target</small>20</div>
            <div className="ticket-code">verified ad completions</div>
            <div className="ticket-divider" />
            <div className="ticket-stats">
              <div><small>Weekly</small><strong>50</strong></div>
              <div><small>Monthly</small><strong>300</strong></div>
            </div>
            <div className="ticket-footer">
              <span><LockKeyhole /> No forced clicks</span>
              <span>Profit guard</span>
            </div>
          </article>
          <div className="winner-float"><Users /><span><small>Winner modes</small>10 / 200</span></div>
          <div className="refund-float"><Globe2 /><span><small>Architecture</small>multi-locale</span></div>
        </div>
      </section>

      <AdDrawDashboard />

      <section className="results-section" id="security">
        <div>
          <span className="section-kicker">Security architecture</span>
          <h2>Assume every client can be manipulated.</h2>
          <p>Qualification, tickets, balances, draw closing and winner selection must be verified on trusted servers, not accepted from Android, iOS or browser state.</p>
        </div>
        <div className="proof-grid">
          <article><span>01</span><Fingerprint /><h3>Identity controls</h3><p>Email and phone verification, unique normalized identities, device risk checks, age controls and KYC gates before regulated redemption.</p></article>
          <article><span>02</span><ShieldCheck /><h3>Ad-event verification</h3><p>Production integrations must use supported server-to-server verification, event idempotency and fraud detection. Ad clicks never count toward qualification.</p></article>
          <article><span>03</span><LockKeyhole /><h3>Auditable ledger</h3><p>Immutable draw cutoffs, append-only money records, payout idempotency, admin MFA and complete privileged-action logging.</p></article>
        </div>
      </section>

      <section className="results-section" id="results">
        <div>
          <span className="section-kicker">Verifiable results</span>
          <h2>Results should be independently checkable.</h2>
        </div>
        <div className="proof-grid">
          <article><span>01</span><Ticket /><h3>Unique entries</h3><p>Every qualifying entry receives a non-repeating ticket bound to a member and one draw window.</p></article>
          <article><span>02</span><ShieldCheck /><h3>Frozen entry set</h3><p>The final eligible ticket list is committed and locked before a winner-selection process starts.</p></article>
          <article><span>03</span><Sparkles /><h3>Published proof</h3><p>Draw commitment, result ordering, payout calculation and audit metadata are retained so disputes can be investigated.</p></article>
        </div>
      </section>

      <section className="rules-section">
        <div className="math-note">
          <Globe2 />
          <p><strong>International launch:</strong> interface language and legal eligibility are separate. A translated interface can be available globally while cash/lottery functionality remains server-disabled in territories where required permissions are not active.</p>
        </div>
      </section>

      <footer>
        <a className="brand" href="#top"><span className="brand-mark"><Ticket /></span><span>FairDraw</span></a>
        <p>Compliance sandbox · No deposits · No cash or voucher entitlement from sandbox ad completions</p>
        <span>Adult-only where required · Territory rules apply</span>
      </footer>
    </main>
  );
}
