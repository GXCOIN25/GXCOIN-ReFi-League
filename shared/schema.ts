import { pgTable, text, serial, integer, boolean, timestamp, real, jsonb, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password"), // Nullable for SSO users (Replit auth)
  walletAddress: text("wallet_address"),
  replitUserId: text("replit_user_id").unique(),
  replitUsername: text("replit_username"),
  email: text("email"),
  githubUsername: text("github_username"),
  githubAvatarUrl: text("github_avatar_url"),
  githubProfileUrl: text("github_profile_url"),
  githubConnectedAt: timestamp("github_connected_at"),
  // GitHub OAuth fields for per-user authentication
  githubAccessToken: text("github_access_token"), // Encrypted OAuth access token
  githubRefreshToken: text("github_refresh_token"), // Encrypted OAuth refresh token
  githubTokenExpiresAt: timestamp("github_token_expires_at"),
  githubUserId: text("github_user_id"), // GitHub user ID for identity verification
  // Stripe fields
  stripeCustomerId: text("stripe_customer_id"),
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
  editionNumber: integer("edition_number"),
  totalEditions: integer("total_editions"),
  seriesName: text("series_name"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  seriesEditionUnique: unique().on(table.seriesName, table.editionNumber),
}));

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
  replitUserId: true,
  replitUsername: true,
  email: true,
  githubUsername: true,
  githubAvatarUrl: true,
  githubProfileUrl: true,
  githubConnectedAt: true,
  githubAccessToken: true,
  githubRefreshToken: true,
  githubTokenExpiresAt: true,
  githubUserId: true,
  stripeCustomerId: true,
}).extend({
  password: z.string().optional().nullable(), // Allow null for SSO users
  walletAddress: z.string().optional().nullable(),
  replitUserId: z.string().optional().nullable(),
  replitUsername: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  githubUsername: z.string().optional().nullable(),
  githubAvatarUrl: z.string().optional().nullable(),
  githubProfileUrl: z.string().optional().nullable(),
  githubConnectedAt: z.date().optional().nullable(),
  githubAccessToken: z.string().optional().nullable(),
  githubRefreshToken: z.string().optional().nullable(),
  githubTokenExpiresAt: z.date().optional().nullable(),
  githubUserId: z.string().optional().nullable(),
  stripeCustomerId: z.string().optional().nullable(),
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
  editionNumber: true,
  totalEditions: true,
  seriesName: true,
}).extend({
  editionNumber: z.number().optional().nullable(),
  totalEditions: z.number().optional().nullable(),
  seriesName: z.string().optional().nullable(),
});

// Patent Registry System
export const patents = pgTable("patents", {
  id: serial("id").primaryKey(),
  patentNumber: text("patent_number").notNull().unique(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // 'biochar', 'water', 'carbon', 'energy', 'construction'
  economicValue: real("economic_value").notNull(), // Base economic value per usage
  environmentalImpact: jsonb("environmental_impact").notNull(), // CO2 saved, plastic converted, etc.
  accessLevel: integer("access_level").default(1), // Level required to unlock
  heroAssociation: text("hero_association"), // Associated hero ID
  createdAt: timestamp("created_at").defaultNow(),
});

// Economic Rewards Tracking
export const economicRewards = pgTable("economic_rewards", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  heroId: text("hero_id").notNull(),
  rewardType: text("reward_type").notNull(), // 'carbon_credits', 'plastic_conversion', 'patent_licensing', 'energy_generation'
  amount: real("amount").notNull(), // Dollar value earned
  quantity: real("quantity").notNull(), // Quantity of resource processed (tons CO2, bottles, kWh, etc.)
  patentId: integer("patent_id").references(() => patents.id),
  battleId: text("battle_id"), // Reference to battle that generated this reward
  transactionData: jsonb("transaction_data").notNull(), // Additional metadata
  createdAt: timestamp("created_at").defaultNow(),
});

// User Patent Access
export const userPatentAccess = pgTable("user_patent_access", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  patentId: integer("patent_id").references(() => patents.id).notNull(),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
  usageCount: integer("usage_count").default(0),
  totalValueGenerated: real("total_value_generated").default(0),
}, (table) => ({
  userPatentUnique: unique().on(table.userId, table.patentId),
}));

// Environmental Battle Records
export const environmentalBattles = pgTable("environmental_battles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  heroId: text("hero_id").notNull(),
  threatType: text("threat_type").notNull(), // 'big_tech_ai', 'toxic_mining', 'fast_fashion', 'fossil_fuel'
  threatLevel: integer("threat_level").notNull(), // 1-10 difficulty
  outcome: text("outcome").notNull(), // 'victory', 'defeat', 'draw'
  economicValue: real("economic_value").notNull(), // Total economic value generated
  environmentalImpact: jsonb("environmental_impact").notNull(), // Specific environmental metrics
  duration: integer("duration"), // Battle duration in seconds
  experienceGained: integer("experience_gained").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// User Economic Statistics
export const userEconomicStats = pgTable("user_economic_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull().unique(),
  totalCarbonCredits: real("total_carbon_credits").default(0),
  totalPlasticConverted: real("total_plastic_converted").default(0), // in bottles
  totalEnergyGenerated: real("total_energy_generated").default(0), // in kWh
  totalPatentLicensing: real("total_patent_licensing").default(0),
  totalEconomicValue: real("total_economic_value").default(0), // Total $ earned
  carbonTonsSequestered: real("carbon_tons_sequestered").default(0),
  environmentalThreatsDefeated: integer("environmental_threats_defeated").default(0),
  patentsUnlocked: integer("patents_unlocked").default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertPatentSchema = createInsertSchema(patents).pick({
  patentNumber: true,
  title: true,
  description: true,
  category: true,
  economicValue: true,
  environmentalImpact: true,
  accessLevel: true,
  heroAssociation: true,
});

export const insertEconomicRewardSchema = createInsertSchema(economicRewards).pick({
  userId: true,
  heroId: true,
  rewardType: true,
  amount: true,
  quantity: true,
  patentId: true,
  battleId: true,
  transactionData: true,
});

export const insertUserPatentAccessSchema = createInsertSchema(userPatentAccess).pick({
  userId: true,
  patentId: true,
  usageCount: true,
  totalValueGenerated: true,
});

export const insertEnvironmentalBattleSchema = createInsertSchema(environmentalBattles).pick({
  userId: true,
  heroId: true,
  threatType: true,
  threatLevel: true,
  outcome: true,
  economicValue: true,
  environmentalImpact: true,
  duration: true,
  experienceGained: true,
});

export const insertUserEconomicStatsSchema = createInsertSchema(userEconomicStats).pick({
  userId: true,
  totalCarbonCredits: true,
  totalPlasticConverted: true,
  totalEnergyGenerated: true,
  totalPatentLicensing: true,
  totalEconomicValue: true,
  carbonTonsSequestered: true,
  environmentalThreatsDefeated: true,
  patentsUnlocked: true,
});

// GitHub OAuth State Management
export const githubOAuthStates = pgTable("github_oauth_states", {
  id: serial("id").primaryKey(),
  state: text("state").notNull().unique(), // Random state parameter for CSRF protection
  codeVerifier: text("code_verifier").notNull(), // PKCE code verifier
  userId: integer("user_id").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at").notNull(), // OAuth state expires after 10 minutes
});

export const insertGitHubOAuthStateSchema = createInsertSchema(githubOAuthStates).pick({
  state: true,
  codeVerifier: true,
  userId: true,
  expiresAt: true,
});

// Token Prices System
export const tokens = pgTable("tokens", {
  symbol: text("symbol").primaryKey(),
  name: text("name").notNull(),
  price: real("price").notNull(),
  change24h: real("change_24h").notNull(),
  marketCap: real("market_cap").notNull(),
  volume24h: real("volume_24h").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTokenSchema = createInsertSchema(tokens).pick({
  symbol: true,
  name: true,
  price: true,
  change24h: true,
  marketCap: true,
  volume24h: true,
});

// Purchase History System for Stripe transactions
export const purchaseHistory = pgTable("purchase_history", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  stripeSessionId: text("stripe_session_id").notNull(),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  type: text("type").notNull(), // 'crypto_onramp', 'dnft_purchase'
  amount: real("amount").notNull(), // Amount in USD
  currency: text("currency").default('usd'),
  status: text("status").notNull(), // 'pending', 'completed', 'failed'
  // For crypto onramp
  walletAddress: text("wallet_address"),
  destinationCurrency: text("destination_currency"),
  destinationNetwork: text("destination_network"),
  sourceAmount: real("source_amount"),
  // For dNFT purchases
  heroId: text("hero_id"),
  nftBadgeId: integer("nft_badge_id").references(() => nftBadges.id),
  // Metadata
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const insertPurchaseHistorySchema = createInsertSchema(purchaseHistory).pick({
  userId: true,
  stripeSessionId: true,
  stripePaymentIntentId: true,
  type: true,
  amount: true,
  currency: true,
  status: true,
  walletAddress: true,
  destinationCurrency: true,
  destinationNetwork: true,
  sourceAmount: true,
  heroId: true,
  nftBadgeId: true,
  metadata: true,
  completedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type GitHubOAuthState = typeof githubOAuthStates.$inferSelect;
export type InsertGitHubOAuthState = z.infer<typeof insertGitHubOAuthStateSchema>;
export type InsertContribution = z.infer<typeof insertContributionSchema>;
export type Contribution = typeof contributions.$inferSelect;
export type InsertNftBadge = z.infer<typeof insertNftBadgeSchema>;
export type NftBadge = typeof nftBadges.$inferSelect;
export type Patent = typeof patents.$inferSelect;
export type InsertPatent = z.infer<typeof insertPatentSchema>;
export type EconomicReward = typeof economicRewards.$inferSelect;
export type InsertEconomicReward = z.infer<typeof insertEconomicRewardSchema>;
export type UserPatentAccess = typeof userPatentAccess.$inferSelect;
export type InsertUserPatentAccess = z.infer<typeof insertUserPatentAccessSchema>;
export type EnvironmentalBattle = typeof environmentalBattles.$inferSelect;
export type InsertEnvironmentalBattle = z.infer<typeof insertEnvironmentalBattleSchema>;
export type UserEconomicStats = typeof userEconomicStats.$inferSelect;
export type InsertUserEconomicStats = z.infer<typeof insertUserEconomicStatsSchema>;
export type Token = typeof tokens.$inferSelect;
export type InsertToken = z.infer<typeof insertTokenSchema>;
export type PurchaseHistory = typeof purchaseHistory.$inferSelect;
export type InsertPurchaseHistory = z.infer<typeof insertPurchaseHistorySchema>;
