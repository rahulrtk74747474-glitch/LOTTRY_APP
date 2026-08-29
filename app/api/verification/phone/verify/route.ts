import { NextResponse } from "next/server";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { ensureMember, getMemberById, getMemberDatabase } from "@/lib/members";

export const dynamic = "force-dynamic";

type Challenge = { destination: string; code_hash: string; expires_at: number; status: string };

async function digest(value: string) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const member = await ensureMember(user);
  const body = (await request.json()) as { challengeId?: unknown; code?: unknown };
  const challengeId = typeof body.challengeId === "string" ? body.challengeId : "";
  const code = typeof body.code === "string" ? body.code : "";
  if (!challengeId || !/^\d{6}$/.test(code)) return NextResponse.json({ error: "Enter the 6-digit demo code." }, { status: 400 });

  const db = getMemberDatabase();
  const challenge = await db.prepare("SELECT destination, code_hash, expires_at, status FROM verification_challenges WHERE id = ?1 AND member_id = ?2 AND kind = 'phone' LIMIT 1").bind(challengeId, member.id).first<Challenge>();
  if (!challenge || challenge.status !== "pending" || challenge.expires_at < Date.now()) return NextResponse.json({ error: "This code has expired. Generate a new one." }, { status: 400 });
  if ((await digest(`${challengeId}:${code}`)) !== challenge.code_hash) return NextResponse.json({ error: "Incorrect demo code." }, { status: 400 });

  const now = Date.now();
  await db.batch([
    db.prepare("UPDATE verification_challenges SET status = 'verified', used_at = ?1 WHERE id = ?2 AND member_id = ?3").bind(now, challengeId, member.id),
    db.prepare("UPDATE members SET phone = ?1, phone_verified = 1, updated_at = ?2 WHERE id = ?3").bind(challenge.destination, now, member.id),
  ]);
  return NextResponse.json({ member: await getMemberById(member.id) });
}
