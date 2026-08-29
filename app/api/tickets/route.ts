import { NextResponse } from "next/server";
import { getChatGPTUser } from "@/app/chatgpt-auth";
import { ensureMember, getMemberDatabase } from "@/lib/members";

export const dynamic = "force-dynamic";
const prices = new Set([10, 100, 1000, 10000]);

type TicketRow = { id: string; ticket_code: string; ticket_price: number; draw_id: string; status: string; rank: number | null; prize_amount: number | null; created_at: number };

function ticket(row: TicketRow) {
  return { id: row.id, ticketCode: row.ticket_code, ticketPrice: row.ticket_price, drawId: row.draw_id, status: row.status, rank: row.rank, prizeAmount: row.prize_amount, createdAt: row.created_at };
}

export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const member = await ensureMember(user);
  const result = await getMemberDatabase().prepare("SELECT id, ticket_code, ticket_price, draw_id, status, rank, prize_amount, created_at FROM member_tickets WHERE member_id = ?1 ORDER BY created_at DESC LIMIT 50").bind(member.id).all<TicketRow>();
  return NextResponse.json({ tickets: result.results.map(ticket) });
}

export async function POST(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  const member = await ensureMember(user);
  const body = (await request.json()) as { ticketPrice?: unknown; quantity?: unknown };
  const ticketPrice = Number(body.ticketPrice);
  const quantity = Math.max(1, Math.min(10, Number(body.quantity) || 1));
  if (!prices.has(ticketPrice)) return NextResponse.json({ error: "Invalid ticket value." }, { status: 400 });

  const db = getMemberDatabase();
  const now = Date.now();
  const drawWindow = Math.floor(now / (12 * 60 * 60 * 1000));
  const drawId = `FD${ticketPrice}-${drawWindow.toString(36).toUpperCase()}`;
  const statements = Array.from({ length: quantity }, (_, index) => {
    const code = `FD-${ticketPrice}-${crypto.randomUUID().replaceAll("-", "").slice(0, 10).toUpperCase()}`;
    return db.prepare("INSERT INTO member_tickets (id, member_id, ticket_code, ticket_price, draw_id, status, rank, prize_amount, created_at) VALUES (?1, ?2, ?3, ?4, ?5, 'pending', NULL, NULL, ?6) RETURNING id, ticket_code, ticket_price, draw_id, status, rank, prize_amount, created_at").bind(crypto.randomUUID(), member.id, code, ticketPrice, drawId, now + index);
  });
  const results = await db.batch<TicketRow>(statements);
  return NextResponse.json({ tickets: results.map((entry) => ticket(entry.results[0])) });
}
