import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const members = sqliteTable("members", {
  id: text("id").primaryKey(),
  memberId: text("member_id").notNull().unique(),
  email: text("email").notNull().unique(),
  displayName: text("display_name").notNull(),
  phone: text("phone"),
  emailVerified: integer("email_verified").notNull().default(1),
  phoneVerified: integer("phone_verified").notNull().default(0),
  kycStatus: text("kyc_status").notNull().default("not_started"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const verificationChallenges = sqliteTable("verification_challenges", {
  id: text("id").primaryKey(),
  memberId: text("member_id").notNull().references(() => members.id),
  kind: text("kind").notNull(),
  destination: text("destination").notNull(),
  codeHash: text("code_hash"),
  status: text("status").notNull(),
  expiresAt: integer("expires_at"),
  usedAt: integer("used_at"),
  createdAt: integer("created_at").notNull(),
});

export const memberTickets = sqliteTable("member_tickets", {
  id: text("id").primaryKey(),
  memberId: text("member_id").notNull().references(() => members.id),
  ticketCode: text("ticket_code").notNull().unique(),
  ticketPrice: integer("ticket_price").notNull(),
  drawId: text("draw_id").notNull(),
  status: text("status").notNull().default("pending"),
  rank: integer("rank"),
  prizeAmount: integer("prize_amount"),
  createdAt: integer("created_at").notNull(),
});
