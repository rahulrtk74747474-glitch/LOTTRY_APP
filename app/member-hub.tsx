"use client";

import { useEffect, useState } from "react";
import {
  BadgeCheck,
  Check,
  ChevronRight,
  Clock3,
  Copy,
  FileCheck2,
  LogOut,
  MailCheck,
  Phone,
  ShieldAlert,
  Ticket,
  UserRound,
} from "lucide-react";
import type { MemberProfile, MemberTicket } from "@/lib/members";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export function MemberHub({ initialMember, initialTickets }: { initialMember: MemberProfile; initialTickets: MemberTicket[] }) {
  const [member, setMember] = useState(initialMember);
  const [tickets, setTickets] = useState<MemberTicket[]>(initialTickets);
  const [profileOpen, setProfileOpen] = useState(false);
  const [phoneOpen, setPhoneOpen] = useState(false);
  const [name, setName] = useState(member.displayName);
  const [phone, setPhone] = useState(member.phone ?? "+91");
  const [otp, setOtp] = useState("");
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function loadTickets() {
    const response = await fetch("/api/tickets", { cache: "no-store" });
    if (response.ok) setTickets((await response.json()).tickets);
  }

  useEffect(() => {
    const refresh = () => void loadTickets();
    window.addEventListener("fairdraw:ticket-created", refresh);
    return () => window.removeEventListener("fairdraw:ticket-created", refresh);
  }, []);

  async function saveProfile() {
    setBusy(true);
    setMessage(null);
    const response = await fetch("/api/profile", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ displayName: name, phone: phone === "+91" ? null : phone }),
    });
    const data = await response.json();
    setBusy(false);
    if (!response.ok) return setMessage(data.error ?? "Could not save profile.");
    setMember(data.member);
    setProfileOpen(false);
  }

  async function startPhoneVerification() {
    setBusy(true);
    setMessage(null);
    const response = await fetch("/api/verification/phone/start", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ phone }),
    });
    const data = await response.json();
    setBusy(false);
    if (!response.ok) return setMessage(data.error ?? "Could not start verification.");
    setChallengeId(data.challengeId);
    setDemoCode(data.demoCode);
  }

  async function verifyPhone() {
    if (!challengeId) return;
    setBusy(true);
    setMessage(null);
    const response = await fetch("/api/verification/phone/verify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ challengeId, code: otp }),
    });
    const data = await response.json();
    setBusy(false);
    if (!response.ok) return setMessage(data.error ?? "The code was not accepted.");
    setMember(data.member);
    setPhoneOpen(false);
    setChallengeId(null);
    setDemoCode(null);
    setOtp("");
  }

  async function startKyc() {
    setBusy(true);
    setMessage(null);
    const response = await fetch("/api/verification/kyc/start", { method: "POST" });
    const data = await response.json();
    setBusy(false);
    if (!response.ok) return setMessage(data.error ?? "Could not start KYC.");
    setMember(data.member);
  }

  const verifiedCount = [member.emailVerified, member.phoneVerified, member.kycStatus !== "not_started"].filter(Boolean).length;

  return (
    <section className="member-hub" id="member-profile" aria-labelledby="member-title">
      <div className="member-heading">
        <div>
          <span className="section-kicker">Member dashboard</span>
          <h1 id="member-title">Hello, {member.displayName.split(" ")[0]}</h1>
          <p>Your profile, verification and entries stay linked to one permanent member ID.</p>
        </div>
        <div className="member-actions">
          <Dialog open={profileOpen} onOpenChange={setProfileOpen}>
            <DialogTrigger asChild><Button variant="outline"><UserRound /> Edit profile</Button></DialogTrigger>
            <DialogContent className="member-dialog">
              <DialogHeader><DialogTitle>Profile details</DialogTitle><DialogDescription>Changes are stored securely against your member ID.</DialogDescription></DialogHeader>
              <div className="dialog-fields">
                <div><Label htmlFor="display-name">Full name</Label><Input id="display-name" value={name} onChange={(event) => setName(event.target.value)} /></div>
                <div><Label htmlFor="email">Verified email</Label><Input id="email" value={member.email} disabled /></div>
                <div><Label htmlFor="profile-phone">Phone number</Label><Input id="profile-phone" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+919876543210" /></div>
              </div>
              {message && <p className="form-message">{message}</p>}
              <DialogFooter><Button onClick={saveProfile} disabled={busy}>{busy ? "Saving…" : "Save profile"}</Button></DialogFooter>
            </DialogContent>
          </Dialog>
          <a className="signout-link" href="/signout-with-chatgpt?return_to=%2F"><LogOut /> Sign out</a>
        </div>
      </div>

      <div className="member-grid">
        <article className="member-id-card">
          <span className="member-card-label"><BadgeCheck /> Your permanent member ID</span>
          <strong>{member.memberId}</strong>
          <button type="button" onClick={() => navigator.clipboard.writeText(member.memberId)} aria-label="Copy member ID"><Copy /> Copy</button>
          <small>Created {new Date(member.createdAt).toLocaleDateString("en-IN")}</small>
        </article>

        <article className="verification-card">
          <div className="card-title-row"><div><span className="member-card-label">Verification</span><h2>{verifiedCount} of 3 steps</h2></div><span className="score-ring">{verifiedCount}/3</span></div>
          <div className="verification-list">
            <div className="verified"><span><MailCheck /></span><p><strong>Email verified</strong><small>{member.email}</small></p><Check /></div>
            <div className={member.phoneVerified ? "verified" : ""}><span><Phone /></span><p><strong>Phone {member.phoneVerified ? "verified" : "not verified"}</strong><small>{member.phone ?? "Add a phone number"}</small></p>
              <Dialog open={phoneOpen} onOpenChange={setPhoneOpen}>
                <DialogTrigger asChild><button type="button" className="row-action">{member.phoneVerified ? "Change" : "Verify"}<ChevronRight /></button></DialogTrigger>
                <DialogContent className="member-dialog">
                  <DialogHeader><DialogTitle>Verify phone — sandbox</DialogTitle><DialogDescription>No SMS is sent in this prototype. Use the on-screen demo code.</DialogDescription></DialogHeader>
                  {!challengeId ? <div className="dialog-fields"><div><Label htmlFor="verify-phone">Phone in international format</Label><Input id="verify-phone" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="+919876543210" /></div></div> : <div className="otp-stage"><span>Demo code: <strong>{demoCode}</strong></span><Label htmlFor="phone-otp">Enter 6-digit code</Label><InputOTP id="phone-otp" maxLength={6} value={otp} onChange={setOtp}><InputOTPGroup>{[0,1,2,3,4,5].map((index) => <InputOTPSlot key={index} index={index} />)}</InputOTPGroup></InputOTP></div>}
                  {message && <p className="form-message">{message}</p>}
                  <DialogFooter><Button onClick={challengeId ? verifyPhone : startPhoneVerification} disabled={busy || (Boolean(challengeId) && otp.length !== 6)}>{busy ? "Please wait…" : challengeId ? "Verify code" : "Generate demo code"}</Button></DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            <div className={member.kycStatus !== "not_started" ? "pending" : ""}><span><FileCheck2 /></span><p><strong>KYC {member.kycStatus === "not_started" ? "not started" : "sandbox pending"}</strong><small>No real documents accepted</small></p><button type="button" className="row-action" onClick={startKyc} disabled={busy || member.kycStatus !== "not_started"}>{member.kycStatus === "not_started" ? "Start" : "Pending"}<ChevronRight /></button></div>
          </div>
          <p className="sandbox-warning"><ShieldAlert /> Sandbox only: do not upload Aadhaar, PAN or other real documents until a licensed KYC provider and retention policy are connected.</p>
        </article>

        <article className="results-card">
          <div className="card-title-row"><div><span className="member-card-label">My tickets & results</span><h2>{tickets.length ? `${tickets.length} saved entr${tickets.length === 1 ? "y" : "ies"}` : "No tickets yet"}</h2></div><Ticket /></div>
          {tickets.length ? <div className="ticket-history">{tickets.slice(0, 4).map((ticket) => <div key={ticket.id}><span><strong>{ticket.ticketCode}</strong><small>Draw {ticket.drawId} · ₹{ticket.ticketPrice}</small></span><b><Clock3 /> {ticket.rank ? `Rank ${ticket.rank}` : "Result pending"}</b></div>)}</div> : <div className="empty-results"><Ticket /><p>Generate a demo ticket below. It will be saved here and restored after your next login.</p></div>}
        </article>
      </div>
    </section>
  );
}
