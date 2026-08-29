import { env } from "cloudflare:workers";
import type { ChatGPTUser } from "@/app/chatgpt-auth";

export type MemberProfile = {
  id: string;
  memberId: string;
  email: string;
  displayName: string;
  phone: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  kycStatus: "not_started" | "sandbox_pending" | "sandbox_reviewed";
  createdAt: number;
  updatedAt: number;
};

export type MemberTicket = {
  id: string;
  ticketCode: string;
  ticketPrice: number;
  drawId: string;
  status: string;
  rank: number | null;
  prizeAmount: number | null;
  createdAt: number;
};

type MemberRow = {
  id: string;
  member_id: string;
  email: string;
  display_name: string;
  phone: string | null;
  email_verified: number;
  phone_verified: number;
  kyc_status: MemberProfile["kycStatus"];
  created_at: number;
  updated_at: number;
};

const memberColumns = `
  id, member_id, email, display_name, phone, email_verified,
  phone_verified, kyc_status, created_at, updated_at
`;

function database() {
  if (!env.DB) throw new Error("FairDraw member database is unavailable.");
  return env.DB;
}

function publicMember(row: MemberRow): MemberProfile {
  return {
    id: row.id,
    memberId: row.member_id,
    email: row.email,
    displayName: row.display_name,
    phone: row.phone,
    emailVerified: Boolean(row.email_verified),
    phoneVerified: Boolean(row.phone_verified),
    kycStatus: row.kyc_status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function newMemberId() {
  return `FD-${crypto.randomUUID().replaceAll("-", "").slice(0, 10).toUpperCase()}`;
}

export async function ensureMember(user: ChatGPTUser): Promise<MemberProfile> {
  const email = user.email.trim().toLowerCase();
  const db = database();
  const existing = await db
    .prepare(`SELECT ${memberColumns} FROM members WHERE email = ?1 LIMIT 1`)
    .bind(email)
    .first<MemberRow>();

  if (existing) return publicMember(existing);

  const now = Date.now();
  for (let attempt = 0; attempt < 4; attempt += 1) {
    try {
      const created = await db
        .prepare(
          `INSERT INTO members (
            id, member_id, email, display_name, phone, email_verified,
            phone_verified, kyc_status, created_at, updated_at
          ) VALUES (?1, ?2, ?3, ?4, NULL, 1, 0, 'not_started', ?5, ?5)
          ON CONFLICT(email) DO UPDATE SET updated_at = excluded.updated_at
          RETURNING ${memberColumns}`,
        )
        .bind(crypto.randomUUID(), newMemberId(), email, user.fullName ?? user.displayName, now)
        .first<MemberRow>();
      if (created) return publicMember(created);
    } catch (error) {
      if (attempt === 3) throw error;
    }
  }

  throw new Error("Could not create a FairDraw member profile.");
}

export async function updateMemberProfile(
  memberId: string,
  values: { displayName: string; phone: string | null },
): Promise<MemberProfile> {
  const now = Date.now();
  const updated = await database()
    .prepare(
      `UPDATE members
       SET display_name = ?1,
           phone = ?2,
           phone_verified = CASE WHEN COALESCE(phone, '') = COALESCE(?2, '') THEN phone_verified ELSE 0 END,
           updated_at = ?3
       WHERE id = ?4
       RETURNING ${memberColumns}`,
    )
    .bind(values.displayName, values.phone, now, memberId)
    .first<MemberRow>();

  if (!updated) throw new Error("Member profile not found.");
  return publicMember(updated);
}

export async function getMemberById(id: string): Promise<MemberProfile | null> {
  const row = await database()
    .prepare(`SELECT ${memberColumns} FROM members WHERE id = ?1 LIMIT 1`)
    .bind(id)
    .first<MemberRow>();
  return row ? publicMember(row) : null;
}

export function getMemberDatabase() {
  return database();
}

export async function getMemberTickets(memberId: string): Promise<MemberTicket[]> {
  const result = await database()
    .prepare("SELECT id, ticket_code, ticket_price, draw_id, status, rank, prize_amount, created_at FROM member_tickets WHERE member_id = ?1 ORDER BY created_at DESC LIMIT 50")
    .bind(memberId)
    .all<{
      id: string;
      ticket_code: string;
      ticket_price: number;
      draw_id: string;
      status: string;
      rank: number | null;
      prize_amount: number | null;
      created_at: number;
    }>();

  return result.results.map((row) => ({
    id: row.id,
    ticketCode: row.ticket_code,
    ticketPrice: row.ticket_price,
    drawId: row.draw_id,
    status: row.status,
    rank: row.rank,
    prizeAmount: row.prize_amount,
    createdAt: row.created_at,
  }));
}
