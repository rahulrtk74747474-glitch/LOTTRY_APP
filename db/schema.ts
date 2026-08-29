import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

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

// Existing prototype ticket table. It remains in place while V2 migrates to
// cohort-bound draw entries below.
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

export const drawCohorts = sqliteTable("draw_cohorts", {
  id: text("id").primaryKey(),
  cadence: text("cadence").notNull(),
  opensAt: integer("opens_at").notNull(),
  scheduledResultAt: integer("scheduled_result_at").notNull(),
  qualificationTarget: integer("qualification_target").notNull(),
  status: text("status").notNull().default("open"),
  rolloverCount: integer("rollover_count").notNull().default(0),
  lockedAt: integer("locked_at"),
  resultedAt: integer("resulted_at"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const memberDrawEntries = sqliteTable(
  "member_draw_entries",
  {
    id: text("id").primaryKey(),
    memberId: text("member_id").notNull().references(() => members.id),
    cohortId: text("cohort_id").notNull().references(() => drawCohorts.id),
    verifiedAdViews: integer("verified_ad_views").notNull().default(0),
    status: text("status").notNull().default("qualifying"),
    ticketCode: text("ticket_code").unique(),
    qualifiedAt: integer("qualified_at"),
    rank: integer("rank"),
    prizeAmount: integer("prize_amount"),
    createdAt: integer("created_at").notNull(),
    updatedAt: integer("updated_at").notNull(),
  },
  (table) => ({
    oneEntryPerMemberPerCohort: uniqueIndex("member_draw_entries_member_cohort_uq").on(
      table.memberId,
      table.cohortId,
    ),
  }),
);

export const verifiedAdEvents = sqliteTable("verified_ad_events", {
  id: text("id").primaryKey(),
  networkEventId: text("network_event_id").notNull().unique(),
  provider: text("provider").notNull(),
  memberId: text("member_id").notNull().references(() => members.id),
  cohortId: text("cohort_id").notNull().references(() => drawCohorts.id),
  entryId: text("entry_id").notNull().references(() => memberDrawEntries.id),
  revenueMicros: integer("revenue_micros").notNull().default(0),
  currency: text("currency").notNull().default("USD"),
  verifiedAt: integer("verified_at").notNull(),
  createdAt: integer("created_at").notNull(),
});
