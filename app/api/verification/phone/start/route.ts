import { NextResponse } from "next/server";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { ensureMember, getMemberDatabase } from "@/lib/members";

export const dynamic = "force-dynamic";

async function digest(value: string) {
  const bytes = new TextEncoder().encode(value);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const body = (await request.json()) as { phone?: unknown };
  const phone = typeof body.phone === "string" ? body.phone.trim() : "";
  if (!/^\+[1-9]\d{7,14}$/.test(phone)) {
    return NextResponse.json({ error: "Use international phone format, for example +919876543210." }, { status: 400 });
  }

  const member = await ensureMember(user);
  const challengeId = crypto.randomUUID();
  const demoCode = String(crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000).padStart(6, "0");
  const now = Date.now();
  const expiresAt = now + 10 * 60 * 1000;
  const codeHash = await digest(`${challengeId}:${demoCode}`);
  const db = getMemberDatabase();

  await db.batch([
    db.prepare("UPDATE verification_challenges SET status = 'expired' WHERE member_id = ?1 AND kind = 'phone' AND status = 'pending'").bind(member.id),
    db.prepare("INSERT INTO verification_challenges (id, member_id, kind, destination, code_hash, status, expires_at, used_at, created_at) VALUES (?1, ?2, 'phone', ?3, ?4, 'pending', ?5, NULL, ?6)").bind(challengeId, member.id, phone, codeHash, expiresAt, now),
    db.prepare("UPDATE members SET phone = ?1, phone_verified = 0, updated_at = ?2 WHERE id = ?3").bind(phone, now, member.id),
  ]);

  return NextResponse.json({ challengeId, demoCode, expiresAt, sandbox: true });
}
