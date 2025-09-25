import { pgTable, text, serial, integer, boolean, timestamp, real, jsonb, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  walletAddress: text("wallet_address"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const contributions = pgTable("contributions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  amount: real("amount").notNull(),
  currentRankId: text("current_rank_id").notNull(),
  impactMetrics: jsonb("impact_metrics").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const nftBadges = pgTable("nft_badges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  heroId: text("hero_id").notNull(),
  level: integer("level").notNull(),
  evolution: text("evolution").notNull(),
  rarity: text("rarity").notNull(),
  attributes: jsonb("attributes").notNull(),
  minted: boolean("minted").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const missions = pgTable("missions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  missionId: text("mission_id").notNull(),
  progress: integer("progress").default(0),
  completed: boolean("completed").default(false),
  completedAt: timestamp("completed_at"),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userMissionUnique: unique().on(table.userId, table.missionId),
}));

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  walletAddress: true,
}).extend({
  walletAddress: z.string().optional().nullable(),
});

export const insertContributionSchema = createInsertSchema(contributions).pick({
  userId: true,
  amount: true,
  currentRankId: true,
  impactMetrics: true,
});

export const insertNftBadgeSchema = createInsertSchema(nftBadges).pick({
  userId: true,
  heroId: true,
  level: true,
  evolution: true,
  rarity: true,
  attributes: true,
  minted: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertContribution = z.infer<typeof insertContributionSchema>;
export type Contribution = typeof contributions.$inferSelect;
export type InsertNftBadge = z.infer<typeof insertNftBadgeSchema>;
export type NftBadge = typeof nftBadges.$inferSelect;
