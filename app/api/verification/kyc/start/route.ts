import { NextResponse } from "next/server";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { ensureMember, getMemberById, getMemberDatabase } from "@/lib/members";

export const dynamic = "force-dynamic";

export async function POST() {
  const user = await getChatGPTUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const member = await ensureMember(user);
  const db = getMemberDatabase();
  const now = Date.now();
  await db.batch([
    db.prepare("UPDATE members SET kyc_status = 'sandbox_pending', updated_at = ?1 WHERE id = ?2").bind(now, member.id),
    db.prepare("INSERT INTO verification_challenges (id, member_id, kind, destination, code_hash, status, expires_at, used_at, created_at) VALUES (?1, ?2, 'kyc', 'sandbox', NULL, 'sandbox_pending', NULL, NULL, ?3)").bind(crypto.randomUUID(), member.id, now),
  ]);
  return NextResponse.json({ member: await getMemberById(member.id), sandbox: true });
}
