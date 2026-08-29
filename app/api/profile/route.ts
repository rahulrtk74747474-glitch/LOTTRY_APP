import { NextResponse } from "next/server";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { ensureMember, updateMemberProfile } from "@/lib/members";

export const dynamic = "force-dynamic";

export async function PUT(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  const member = await ensureMember(user);
  const body = (await request.json()) as { displayName?: unknown; phone?: unknown };
  const displayName = typeof body.displayName === "string" ? body.displayName.trim() : "";
  const phone = typeof body.phone === "string" && body.phone.trim() ? body.phone.trim() : null;

  if (displayName.length < 2 || displayName.length > 80) {
    return NextResponse.json({ error: "Enter a name between 2 and 80 characters." }, { status: 400 });
  }
  if (phone && !/^\+[1-9]\d{7,14}$/.test(phone)) {
    return NextResponse.json({ error: "Use international phone format, for example +919876543210." }, { status: 400 });
  }

  const updated = await updateMemberProfile(member.id, { displayName, phone });
  return NextResponse.json({ member: updated });
}
