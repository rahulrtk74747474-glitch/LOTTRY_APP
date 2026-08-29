"use client";

import { ArrowRight, BadgeCheck, Fingerprint, ShieldCheck, Ticket } from "lucide-react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function AuthGateway({ signInPath }: { signInPath: string }) {
  return (
    <main className="auth-shell">
      <section className="auth-story" aria-labelledby="auth-title">
        <Link className="brand auth-brand" href="/" aria-label="FairDraw home">
          <span className="brand-mark"><Ticket /></span>
          <span>FairDraw</span>
        </Link>
        <div className="auth-copy">
          <span className="eyebrow"><ShieldCheck /> Member access</span>
          <h1 id="auth-title">Your tickets. Your results. One member ID.</h1>
          <p>Sign in before entering a draw so every ticket and result stays connected to your secure FairDraw profile.</p>
          <div className="auth-benefits">
            <span><Fingerprint /> Permanent FairDraw member ID</span>
            <span><BadgeCheck /> Email, phone and KYC status</span>
            <span><Ticket /> Ticket and result history</span>
          </div>
        </div>
        <small>Prototype only · Demo credits · No payments or cash prizes</small>
      </section>

      <section className="auth-panel" aria-label="Account access">
        <Tabs defaultValue="login" className="auth-tabs">
          <TabsList className="auth-tab-list">
            <TabsTrigger value="login">Log in</TabsTrigger>
            <TabsTrigger value="create">Create account</TabsTrigger>
          </TabsList>
          <TabsContent value="login" className="auth-tab-content">
            <span className="auth-icon"><Fingerprint /></span>
            <h2>Welcome back</h2>
            <p>Continue with your secure identity to open your member dashboard and check ticket results.</p>
            <a className="auth-primary" href={signInPath} target="_top">
              Continue securely <ArrowRight />
            </a>
            <small>Your FairDraw member ID is restored automatically.</small>
          </TabsContent>
          <TabsContent value="create" className="auth-tab-content">
            <span className="auth-icon"><BadgeCheck /></span>
            <h2>Create your membership</h2>
            <p>Use a verified email identity. FairDraw will assign a permanent, unique member ID after your first sign-in.</p>
            <a className="auth-primary" href={signInPath} target="_top">
              Create secure account <ArrowRight />
            </a>
            <small>No password is stored by FairDraw.</small>
          </TabsContent>
        </Tabs>
        <p className="auth-privacy"><ShieldCheck /> Authentication is platform-managed. FairDraw stores only the profile and verification status needed for this prototype.</p>
      </section>
    </main>
  );
}
