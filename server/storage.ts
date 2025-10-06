import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users, contributions, nftBadges, missions, patents, economicRewards, userPatentAccess, environmentalBattles, userEconomicStats, githubOAuthStates, tokens, purchaseHistory,
         type User, type InsertUser, 
         type Contribution, type InsertContribution,
         type NftBadge, type InsertNftBadge,
         type Patent, type InsertPatent,
         type EconomicReward, type InsertEconomicReward,
         type UserPatentAccess, type InsertUserPatentAccess,
         type EnvironmentalBattle, type InsertEnvironmentalBattle,
         type UserEconomicStats, type InsertUserEconomicStats,
         type GitHubOAuthState, type InsertGitHubOAuthState,
         type Token, type InsertToken,
         type PurchaseHistory, type InsertPurchaseHistory } from "@shared/schema";
import { eq, desc, sum, and, sql, lt } from "drizzle-orm";
import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { PATENTS_DATABASE } from "../client/src/data/patents";

// Interface for environmental impact structure
interface EnvironmentalImpact {
  co2Sequestered?: number;
  plasticConverted?: number;
  energyGenerated?: number;
  waterPurified?: number;
  wasteReduction?: number;
  carbonStorage?: number;
  oceanCleanup?: number;
}

// Master Team Missions Definition
export const TEAM_MISSIONS = [
  {
    id: 'ocean-cleanup',
    title: 'Ocean Cleanup Challenge',
    description: 'Collectively remove 10,000 kg of plastic from oceans worldwide',
    goal: 10000,
    reward: '500 AQUA tokens',
    difficulty: 'Hard' as const,
    endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'renewable-energy',
    title: 'Renewable Energy Sprint',
    description: 'Generate 50,000 kWh of clean energy this week',
    goal: 50000,
    reward: '300 VOLTRA tokens',
    difficulty: 'Medium' as const,
    endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'carbon-offset',
    title: 'Carbon Offset Marathon',
    description: 'Offset 25 tons of CO₂ through verified projects',
    goal: 25000,
    reward: '1000 GXCOIN',
    difficulty: 'Legendary' as const,
    endDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'hemp-revolution',
    title: 'Hemp Revolution Challenge',
    description: 'Convert 5,000 plastic bottles into hemp-based products',
    goal: 5000,
    reward: '200 HEMP tokens',
    difficulty: 'Easy' as const,
    endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'battery-innovation',
    title: 'Graphene Battery Innovation',
    description: 'Deploy 100 graphene battery systems for renewable energy storage',
    goal: 100,
    reward: '750 BATT tokens',
    difficulty: 'Hard' as const,
    endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
  },
  {
    id: 'carbon-credits',
    title: 'Carbon Credits Collective',
    description: 'Earn 10,000 verified carbon credits through environmental actions',
    goal: 10000,
    reward: '400 GCCT tokens',
    difficulty: 'Medium' as const,
    endDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000)
  }
];

// Initialize PostgreSQL client and Drizzle
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const client = postgres(process.env.DATABASE_URL, { ssl: 'require' });
const db = drizzle(client);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByReplitUserId(replitUserId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  upsertReplitUser(replitUserId: string, replitUsername: string, email?: string): Promise<User>;
  updateUserGitHubInfo(userId: number, githubInfo: {
    githubUsername: string;
    githubAvatarUrl: string;
    githubProfileUrl: string;
    githubConnectedAt: Date;
  }): Promise<User>;
  authenticateUser(username: string, password: string): Promise<User | null>;
  generateToken(user: User): string;
  verifyToken(token: string): { userId: number } | null;
  
  // Contribution methods
  getUserContributions(userId: number): Promise<Contribution[]>;
  addContribution(contribution: InsertContribution): Promise<Contribution>;
  getTotalContribution(userId: number): Promise<number>;
  getLeaderboard(limit?: number): Promise<Array<{
    rank: number;
    username: string;
    contribution: number;
    rank_title: string;
    avatar: string;
  }>>;
  
  // NFT Badge methods
  getUserNFTBadges(userId: number): Promise<NftBadge[]>;
  createNFTBadge(badge: InsertNftBadge): Promise<NftBadge>;
  
  // Mission methods
  getUserMissionProgress(userId: number): Promise<any[]>;
  updateMissionProgress(userId: number, missionId: string, progress: number): Promise<void>;
  getTeamMissions(): Promise<any[]>;
  
  // Patent Registry methods
  getAllPatents(): Promise<Patent[]>;
  getPatentById(patentId: number): Promise<Patent | undefined>;
  createPatent(patent: InsertPatent): Promise<Patent>;
  getUserPatentAccess(userId: number): Promise<UserPatentAccess[]>;
  unlockPatentForUser(userId: number, patentId: number): Promise<UserPatentAccess>;
  updatePatentUsage(userId: number, patentId: number, newUsageCount: number): Promise<void>;
  
  // Economic Rewards methods
  getUserEconomicRewards(userId: number): Promise<EconomicReward[]>;
  addEconomicReward(reward: InsertEconomicReward): Promise<EconomicReward>;
  getUserEconomicStats(userId: number): Promise<UserEconomicStats | undefined>;
  updateUserEconomicStats(userId: number, stats: Partial<InsertUserEconomicStats>): Promise<UserEconomicStats>;
  
  // Environmental Battle methods
  getUserBattleHistory(userId: number): Promise<EnvironmentalBattle[]>;
  recordEnvironmentalBattle(battle: InsertEnvironmentalBattle): Promise<EnvironmentalBattle>;
  
  // Economic Calculations
  calculateCarbonCreditValue(carbonTons: number): number;
  calculatePlasticConversionValue(bottleCount: number): number;
  calculatePatentLicensingValue(patentId: number, usageCount: number): Promise<number>;
  
  // GitHub OAuth methods
  createOAuthState(userId: number): Promise<{ state: string; codeVerifier: string }>;
  verifyOAuthState(state: string, userId: number): Promise<{ codeVerifier: string } | null>;
  cleanupExpiredOAuthStates(): Promise<void>;
  updateUserGitHubOAuth(userId: number, tokens: {
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
    githubUserId: string;
    githubUsername: string;
    githubAvatarUrl: string;
    githubProfileUrl: string;
  }): Promise<User>;
  getUserGitHubToken(userId: number): Promise<string | null>;
  encryptToken(token: string): string;
  decryptToken(encryptedToken: string): string;
  
  // Token methods
  seedTokens(): Promise<void>;
  getTokenPrices(): Promise<Token[]>;
  getUserTokenBalances(userId: number): Promise<Array<{
    symbol: string;
    balance: number;
    value: number;
  }>>;
  
  // Purchase History methods (Stripe)
  createPurchase(purchase: InsertPurchaseHistory): Promise<PurchaseHistory>;
  updatePurchaseStatus(sessionId: string, status: string, completedAt?: Date, paymentIntentId?: string): Promise<PurchaseHistory | undefined>;
  getUserPurchaseHistory(userId: number): Promise<PurchaseHistory[]>;
  getPurchaseBySessionId(sessionId: string): Promise<PurchaseHistory | undefined>;
  updateUserStripeCustomerId(userId: number, stripeCustomerId: string): Promise<User>;
}

export class PostgresStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async getUserByReplitUserId(replitUserId: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.replitUserId, replitUserId)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    let hashedPassword = null;
    
    // Only hash password if provided (for traditional username/password auth)
    if (insertUser.password && insertUser.password.trim() !== '') {
      hashedPassword = await bcrypt.hash(insertUser.password, 10);
    }
    
    const userData = { ...insertUser, password: hashedPassword };
    const result = await db.insert(users).values(userData).returning();
    return result[0];
  }

  async upsertReplitUser(replitUserId: string, replitUsername: string, email?: string): Promise<User> {
    // Check if user already exists by Replit ID
    const existingUser = await this.getUserByReplitUserId(replitUserId);
    
    if (existingUser) {
      // Update existing user with latest Replit info
      const result = await db.update(users)
        .set({ 
          replitUsername, 
          email: email || existingUser.email,
        })
        .where(eq(users.replitUserId, replitUserId))
        .returning();
      return result[0];
    } else {
      // Handle username collisions for new users
      const baseUsername = replitUsername;
      let uniqueUsername = baseUsername;
      let counter = 1;
      
      // Check for username conflicts and generate unique username
      while (await this.getUserByUsername(uniqueUsername)) {
        uniqueUsername = `${baseUsername}_replit_${counter}`;
        counter++;
        
        // Prevent infinite loops
        if (counter > 100) {
          uniqueUsername = `${baseUsername}_${replitUserId.slice(-8)}`;
          break;
        }
      }
      
      // Create new user with Replit auth and unique username
      const userData = {
        username: uniqueUsername, // Use unique username to avoid conflicts
        password: null, // No password needed for Replit auth users
        replitUserId,
        replitUsername: baseUsername, // Keep original Replit username for reference
        email: email || null,
        walletAddress: null,
      };
      
      try {
        const result = await db.insert(users).values(userData).returning();
        return result[0];
      } catch (error: any) {
        // Handle any remaining unique constraint violations
        if (error.code === '23505') {
          // Generate a truly unique username using timestamp
          const timestampUsername = `${baseUsername}_${Date.now()}`;
          const fallbackData = { ...userData, username: timestampUsername };
          const result = await db.insert(users).values(fallbackData).returning();
          return result[0];
        }
        throw error;
      }
    }
  }

  async updateUserGitHubInfo(userId: number, githubInfo: {
    githubUsername: string;
    githubAvatarUrl: string;
    githubProfileUrl: string;
    githubConnectedAt: Date;
  }): Promise<User> {
    const result = await db.update(users)
      .set({
        githubUsername: githubInfo.githubUsername,
        githubAvatarUrl: githubInfo.githubAvatarUrl,
        githubProfileUrl: githubInfo.githubProfileUrl,
        githubConnectedAt: githubInfo.githubConnectedAt,
      })
      .where(eq(users.id, userId))
      .returning();
    return result[0];
  }

  async authenticateUser(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (!user) return null;
    
    // Handle SSO users (Replit auth) who don't have passwords
    if (!user.password) {
      // SSO users should not authenticate via username/password
      return null;
    }
    
    // Traditional password authentication
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  generateToken(user: User): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('❌ CRITICAL SECURITY ERROR: JWT_SECRET environment variable is required');
    }
    return jwt.sign(
      { userId: user.id, username: user.username },
      secret,
      { expiresIn: '7d' }
    );
  }

  verifyToken(token: string): { userId: number } | null {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('❌ CRITICAL SECURITY ERROR: JWT_SECRET environment variable is required');
    }
    try {
      const payload = jwt.verify(token, secret) as any;
      return { userId: payload.userId };
    } catch {
      return null;
    }
  }

  // Contribution methods
  async getUserContributions(userId: number): Promise<Contribution[]> {
    return await db.select().from(contributions).where(eq(contributions.userId, userId)).orderBy(desc(contributions.createdAt));
  }

  async addContribution(contribution: InsertContribution): Promise<Contribution> {
    const result = await db.insert(contributions).values(contribution).returning();
    return result[0];
  }

  async getTotalContribution(userId: number): Promise<number> {
    const result = await db
      .select({ total: sum(contributions.amount) })
      .from(contributions)
      .where(eq(contributions.userId, userId));
    return Number(result[0]?.total) || 0;
  }

  async getLeaderboard(limit: number = 10): Promise<Array<{
    rank: number;
    username: string;
    contribution: number;
    rank_title: string;
    avatar: string;
  }>> {
    const leaderboardData = await db
      .select({
        userId: users.id,
        username: users.username,
        totalContribution: sql<number>`COALESCE(SUM(${contributions.amount}), 0)`,
      })
      .from(users)
      .leftJoin(contributions, eq(users.id, contributions.userId))
      .groupBy(users.id, users.username)
      .orderBy(desc(sql`COALESCE(SUM(${contributions.amount}), 0)`))
      .limit(limit);

    return leaderboardData.map((entry, index) => {
      const contribution = Number(entry.totalContribution);
      
      let rank_title = 'Eco Warrior';
      if (contribution >= 15000) rank_title = 'Diamond Legend';
      else if (contribution >= 12000) rank_title = 'Platinum Hero';
      else if (contribution >= 10000) rank_title = 'Gold Guardian';
      else if (contribution >= 8000) rank_title = 'Silver Defender';
      else if (contribution >= 5000) rank_title = 'Bronze Recruit';

      const avatars = ['🏆', '🌟', '⚡', '🌊', '☀️', '💨', '🌍', '♻️', '🌱', '💎'];
      const avatar = index < avatars.length ? avatars[index] : '🌿';

      return {
        rank: index + 1,
        username: entry.username,
        contribution,
        rank_title,
        avatar,
      };
    });
  }

  // NFT Badge methods
  async getUserNFTBadges(userId: number): Promise<NftBadge[]> {
    return await db.select().from(nftBadges).where(eq(nftBadges.userId, userId));
  }

  async createNFTBadge(badge: InsertNftBadge): Promise<NftBadge> {
    const result = await db.insert(nftBadges).values(badge).returning();
    return result[0];
  }

  // Mission methods
  async getUserMissionProgress(userId: number): Promise<any[]> {
    return await db.select().from(missions).where(eq(missions.userId, userId));
  }

  async updateMissionProgress(userId: number, missionId: string, progress: number): Promise<void> {
    await db.insert(missions).values({
      userId,
      missionId,
      progress,
      completed: progress >= 100
    }).onConflictDoUpdate({
      target: [missions.userId, missions.missionId],
      set: { 
        progress, 
        completed: progress >= 100,
        updatedAt: new Date()
      }
    });
  }

  async getTeamMissions(): Promise<any[]> {
    const teamMissions = await Promise.all(
      TEAM_MISSIONS.map(async (mission) => {
        const stats = await db
          .select({
            participants: sql<number>`COUNT(DISTINCT ${missions.userId})`,
            totalProgress: sql<number>`COALESCE(SUM(${missions.progress}), 0)`
          })
          .from(missions)
          .where(eq(missions.missionId, mission.id));

        const participants = Number(stats[0]?.participants) || 0;
        const totalProgress = Number(stats[0]?.totalProgress) || 0;
        
        const timeLeft = this.calculateTimeLeft(mission.endDate);

        return {
          id: mission.id,
          title: mission.title,
          description: mission.description,
          goal: mission.goal,
          current: Math.min(totalProgress, mission.goal),
          participants,
          timeLeft,
          reward: mission.reward,
          difficulty: mission.difficulty
        };
      })
    );

    return teamMissions;
  }

  private calculateTimeLeft(endDate: Date): string {
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h`;
    } else {
      return `${hours}h`;
    }
  }
  
  // Patent Registry methods
  async getAllPatents(): Promise<Patent[]> {
    return await db.select().from(patents).orderBy(patents.patentNumber);
  }
  
  async getPatentById(patentId: number): Promise<Patent | undefined> {
    const result = await db.select().from(patents).where(eq(patents.id, patentId)).limit(1);
    return result[0];
  }
  
  async createPatent(patent: InsertPatent): Promise<Patent> {
    const result = await db.insert(patents).values(patent).returning();
    return result[0];
  }
  
  async getUserPatentAccess(userId: number): Promise<UserPatentAccess[]> {
    return await db.select().from(userPatentAccess).where(eq(userPatentAccess.userId, userId));
  }
  
  async unlockPatentForUser(userId: number, patentId: number): Promise<UserPatentAccess> {
    const result = await db.insert(userPatentAccess).values({
      userId,
      patentId,
      usageCount: 0,
      totalValueGenerated: 0
    }).returning();
    
    // Update user's economic stats
    await this.updateUserEconomicStats(userId, { patentsUnlocked: 1 });
    
    return result[0];
  }
  
  async updatePatentUsage(userId: number, patentId: number, newUsageCount: number): Promise<void> {
    // Get the patent to use its actual economic value
    const patent = await this.getPatentById(patentId);
    if (!patent) {
      throw new Error(`Patent ${patentId} not found`);
    }
    
    // Calculate total value using actual patent economic value with diminishing returns
    const baseValue = patent.economicValue;
    const scalingFactor = Math.max(0.1, 1 - (newUsageCount * 0.05)); // 5% reduction per use, minimum 10%
    const totalValueGenerated = baseValue * newUsageCount * scalingFactor;
    
    await db.update(userPatentAccess)
      .set({ 
        usageCount: newUsageCount,
        totalValueGenerated: Math.round(totalValueGenerated * 100) / 100 // Round to 2 decimal places
      })
      .where(and(eq(userPatentAccess.userId, userId), eq(userPatentAccess.patentId, patentId)));
  }
  
  // Economic Rewards methods
  async getUserEconomicRewards(userId: number): Promise<EconomicReward[]> {
    return await db.select().from(economicRewards).where(eq(economicRewards.userId, userId)).orderBy(desc(economicRewards.createdAt));
  }
  
  async addEconomicReward(reward: InsertEconomicReward): Promise<EconomicReward> {
    const result = await db.insert(economicRewards).values(reward).returning();
    
    // Update user's economic stats
    const stats: Partial<InsertUserEconomicStats> = {
      totalEconomicValue: reward.amount
    };
    
    switch (reward.rewardType) {
      case 'carbon_credits':
        stats.totalCarbonCredits = reward.quantity;
        stats.carbonTonsSequestered = reward.quantity;
        break;
      case 'plastic_conversion':
        stats.totalPlasticConverted = reward.quantity;
        break;
      case 'energy_generation':
        stats.totalEnergyGenerated = reward.quantity;
        break;
      case 'patent_licensing':
        stats.totalPatentLicensing = reward.amount;
        break;
    }
    
    await this.updateUserEconomicStats(reward.userId, stats);
    
    return result[0];
  }
  
  async getUserEconomicStats(userId: number): Promise<UserEconomicStats | undefined> {
    const result = await db.select().from(userEconomicStats).where(eq(userEconomicStats.userId, userId)).limit(1);
    return result[0];
  }
  
  async updateUserEconomicStats(userId: number, stats: Partial<InsertUserEconomicStats>): Promise<UserEconomicStats> {
    // First try to update existing record
    const existing = await this.getUserEconomicStats(userId);
    
    if (existing) {
      // Update existing record by adding to existing values
      const updateData: Partial<UserEconomicStats> = {
        totalCarbonCredits: (existing.totalCarbonCredits || 0) + (stats.totalCarbonCredits || 0),
        totalPlasticConverted: (existing.totalPlasticConverted || 0) + (stats.totalPlasticConverted || 0),
        totalEnergyGenerated: (existing.totalEnergyGenerated || 0) + (stats.totalEnergyGenerated || 0),
        totalPatentLicensing: (existing.totalPatentLicensing || 0) + (stats.totalPatentLicensing || 0),
        totalEconomicValue: (existing.totalEconomicValue || 0) + (stats.totalEconomicValue || 0),
        carbonTonsSequestered: (existing.carbonTonsSequestered || 0) + (stats.carbonTonsSequestered || 0),
        environmentalThreatsDefeated: (existing.environmentalThreatsDefeated || 0) + (stats.environmentalThreatsDefeated || 0),
        patentsUnlocked: (existing.patentsUnlocked || 0) + (stats.patentsUnlocked || 0),
        updatedAt: new Date()
      };
      
      const result = await db.update(userEconomicStats)
        .set(updateData)
        .where(eq(userEconomicStats.userId, userId))
        .returning();
      return result[0];
    } else {
      // Create new record
      const result = await db.insert(userEconomicStats).values({
        userId,
        ...stats,
        updatedAt: new Date()
      }).returning();
      return result[0];
    }
  }
  
  // Environmental Battle methods
  async getUserBattleHistory(userId: number): Promise<EnvironmentalBattle[]> {
    return await db.select().from(environmentalBattles).where(eq(environmentalBattles.userId, userId)).orderBy(desc(environmentalBattles.createdAt));
  }
  
  async recordEnvironmentalBattle(battle: InsertEnvironmentalBattle): Promise<EnvironmentalBattle> {
    const result = await db.insert(environmentalBattles).values(battle).returning();
    
    // Update environmental threats defeated if victory
    if (battle.outcome === 'victory') {
      await this.updateUserEconomicStats(battle.userId, { 
        environmentalThreatsDefeated: 1,
        totalEconomicValue: battle.economicValue
      });
    }
    
    return result[0];
  }
  
  // Economic Calculations
  calculateCarbonCreditValue(carbonTons: number): number {
    // Base value of $175 per ton of CO2 sequestered
    const basePrice = 175;
    return carbonTons * basePrice;
  }
  
  calculatePlasticConversionValue(bottleCount: number): number {
    // $1.25 per plastic bottle converted to hemp
    const bottleValue = 1.25;
    return bottleCount * bottleValue;
  }
  
  async calculatePatentLicensingValue(patentId: number, usageCount: number): Promise<number> {
    const patent = await this.getPatentById(patentId);
    if (!patent) return 0;
    
    // Base economic value multiplied by usage count with diminishing returns
    const baseValue = patent.economicValue;
    const diminishingFactor = Math.log(usageCount + 1) / Math.log(10); // Logarithmic scaling
    return baseValue * usageCount * (0.5 + diminishingFactor * 0.5);
  }

  // GitHub OAuth methods implementation
  async createOAuthState(userId: number): Promise<{ state: string; codeVerifier: string }> {
    const state = crypto.randomBytes(32).toString('base64url');
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await db.insert(githubOAuthStates).values({
      userId,
      state,
      codeVerifier,
      expiresAt
    });

    return { state, codeVerifier };
  }

  async verifyOAuthState(state: string, userId: number): Promise<{ codeVerifier: string } | null> {
    const result = await db.select()
      .from(githubOAuthStates)
      .where(and(
        eq(githubOAuthStates.state, state),
        eq(githubOAuthStates.userId, userId),
        sql`${githubOAuthStates.expiresAt} > NOW()`
      ))
      .limit(1);

    if (!result[0]) return null;

    // Clean up used state
    await db.delete(githubOAuthStates)
      .where(eq(githubOAuthStates.state, state));

    return { codeVerifier: result[0].codeVerifier };
  }

  async cleanupExpiredOAuthStates(): Promise<void> {
    await db.delete(githubOAuthStates)
      .where(lt(githubOAuthStates.expiresAt, new Date()));
  }

  async updateUserGitHubOAuth(userId: number, tokens: {
    accessToken: string;
    refreshToken?: string;
    expiresAt?: Date;
    githubUserId: string;
    githubUsername: string;
    githubAvatarUrl: string;
    githubProfileUrl: string;
  }): Promise<User> {
    const encryptedAccessToken = this.encryptToken(tokens.accessToken);
    const encryptedRefreshToken = tokens.refreshToken ? this.encryptToken(tokens.refreshToken) : null;

    const result = await db.update(users)
      .set({
        githubAccessToken: encryptedAccessToken,
        githubRefreshToken: encryptedRefreshToken,
        githubTokenExpiresAt: tokens.expiresAt,
        githubUserId: tokens.githubUserId,
        githubUsername: tokens.githubUsername,
        githubAvatarUrl: tokens.githubAvatarUrl,
        githubProfileUrl: tokens.githubProfileUrl,
        githubConnectedAt: new Date()
      })
      .where(eq(users.id, userId))
      .returning();

    return result[0];
  }

  async getUserGitHubToken(userId: number): Promise<string | null> {
    const result = await db.select({ githubAccessToken: users.githubAccessToken })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!result[0]?.githubAccessToken) return null;

    return this.decryptToken(result[0].githubAccessToken);
  }

  encryptToken(token: string): string {
    const algorithm = 'aes-256-gcm';
    const secretKey = process.env.ENCRYPTION_KEY || process.env.JWT_SECRET;
    
    if (!secretKey) {
      throw new Error('ENCRYPTION_KEY or JWT_SECRET environment variable is required for token encryption');
    }

    // Create a hash of the secret to ensure it's 32 bytes
    const key = crypto.createHash('sha256').update(secretKey).digest();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv, { authTagLength: 16 });
    
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    
    // Combine iv, authTag, and encrypted data
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  }

  decryptToken(encryptedToken: string): string {
    const algorithm = 'aes-256-gcm';
    const secretKey = process.env.ENCRYPTION_KEY || process.env.JWT_SECRET;
    
    if (!secretKey) {
      throw new Error('ENCRYPTION_KEY or JWT_SECRET environment variable is required for token decryption');
    }

    // Create a hash of the secret to ensure it's 32 bytes
    const key = crypto.createHash('sha256').update(secretKey).digest();
    
    const [ivHex, authTagHex, encrypted] = encryptedToken.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    
    const decipher = crypto.createDecipheriv(algorithm, key, iv, { authTagLength: 16 });
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }

  // Token methods
  async seedTokens(): Promise<void> {
    try {
      // Check if tokens already exist
      const existingTokens = await db.select().from(tokens);
      
      if (existingTokens.length > 0) {
        console.log(`💰 Found ${existingTokens.length} existing tokens. Skipping seed.`);
        return;
      }

      // Initial token data with base prices
      const tokenData: InsertToken[] = [
        {
          symbol: 'AQUA',
          name: 'AQUA Water Token',
          price: 0.45,
          change24h: 0,
          marketCap: 450000,
          volume24h: 25000,
        },
        {
          symbol: 'HEMP',
          name: 'HEMP Biochar Token',
          price: 0.32,
          change24h: 0,
          marketCap: 320000,
          volume24h: 18000,
        },
        {
          symbol: 'VOLTRA',
          name: 'VOLTRA Energy Token',
          price: 0.67,
          change24h: 0,
          marketCap: 670000,
          volume24h: 35000,
        },
        {
          symbol: 'GRAPHENE',
          name: 'GRAPHENE Battery Token',
          price: 1.23,
          change24h: 0,
          marketCap: 1230000,
          volume24h: 67000,
        },
        {
          symbol: 'TRADER',
          name: 'TRADER Carbon Credit Token',
          price: 2.14,
          change24h: 0,
          marketCap: 2140000,
          volume24h: 98000,
        },
      ];

      await db.insert(tokens).values(tokenData);
      console.log(`✅ Successfully seeded ${tokenData.length} tokens!`);
    } catch (error) {
      console.error('❌ Error seeding tokens:', error);
      throw error;
    }
  }

  async getTokenPrices(): Promise<Token[]> {
    const result = await db.select().from(tokens);
    return result;
  }

  async getUserTokenBalances(userId: number): Promise<Array<{
    symbol: string;
    balance: number;
    value: number;
  }>> {
    // Get all economic rewards for the user
    const rewards = await db
      .select()
      .from(economicRewards)
      .where(eq(economicRewards.userId, userId));

    // Calculate balances based on reward types
    const balances = {
      AQUA: 0,
      HEMP: 0,
      VOLTRA: 0,
      GRAPHENE: 0,
      TRADER: 0,
    };

    // Sum up rewards by token type based on rewardType
    rewards.forEach((reward) => {
      const rewardType = reward.rewardType.toLowerCase();
      
      if (rewardType.includes('water') || rewardType.includes('ocean')) {
        balances.AQUA += reward.amount;
      } else if (rewardType.includes('carbon') || rewardType.includes('biochar')) {
        balances.HEMP += reward.amount;
      } else if (rewardType.includes('energy')) {
        balances.VOLTRA += reward.amount;
      } else if (rewardType.includes('graphene')) {
        balances.GRAPHENE += reward.amount;
      } else if (rewardType.includes('trading') || rewardType.includes('carbon_credits')) {
        balances.TRADER += reward.amount;
      }
    });

    // Get current token prices
    const tokenPrices = await this.getTokenPrices();
    const priceMap = tokenPrices.reduce((acc, token) => {
      acc[token.symbol] = token.price;
      return acc;
    }, {} as Record<string, number>);

    // Return balances with values
    return Object.entries(balances).map(([symbol, balance]) => ({
      symbol,
      balance,
      value: balance * (priceMap[symbol] || 0),
    }));
  }

  // Purchase History methods (Stripe)
  async createPurchase(purchase: InsertPurchaseHistory): Promise<PurchaseHistory> {
    const result = await db.insert(purchaseHistory).values(purchase).returning();
    return result[0];
  }

  async updatePurchaseStatus(
    sessionId: string, 
    status: string, 
    completedAt?: Date, 
    paymentIntentId?: string
  ): Promise<PurchaseHistory | undefined> {
    const updateData: any = { status };
    if (completedAt) updateData.completedAt = completedAt;
    if (paymentIntentId) updateData.stripePaymentIntentId = paymentIntentId;

    const result = await db
      .update(purchaseHistory)
      .set(updateData)
      .where(eq(purchaseHistory.stripeSessionId, sessionId))
      .returning();
    
    return result[0];
  }

  async getUserPurchaseHistory(userId: number): Promise<PurchaseHistory[]> {
    const result = await db
      .select()
      .from(purchaseHistory)
      .where(eq(purchaseHistory.userId, userId))
      .orderBy(desc(purchaseHistory.createdAt));
    
    return result;
  }

  async getPurchaseBySessionId(sessionId: string): Promise<PurchaseHistory | undefined> {
    const result = await db
      .select()
      .from(purchaseHistory)
      .where(eq(purchaseHistory.stripeSessionId, sessionId))
      .limit(1);
    
    return result[0];
  }

  async updateUserStripeCustomerId(userId: number, stripeCustomerId: string): Promise<User> {
    const result = await db
      .update(users)
      .set({ stripeCustomerId })
      .where(eq(users.id, userId))
      .returning();
    
    return result[0];
  }
}

// Patent initialization function
export async function initializePatents(): Promise<void> {
  console.log('🌱 Starting patent database initialization...');
  
  try {
    // Check if patents already exist to avoid duplicates
    const existingPatents = await db.select().from(patents);
    
    if (existingPatents.length > 0) {
      console.log(`📋 Found ${existingPatents.length} existing patents. Skipping initialization.`);
      return;
    }
    
    // Transform patents data for database insertion
    const patentsToInsert = PATENTS_DATABASE.map(patent => ({
      patentNumber: patent.patentNumber,
      title: patent.title,
      description: patent.description,
      category: patent.category,
      economicValue: patent.economicValue,
      environmentalImpact: patent.environmentalImpact,
      accessLevel: patent.accessLevel,
      heroAssociation: patent.heroAssociation
    }));
    
    // Insert all patents
    console.log(`📄 Inserting ${patentsToInsert.length} patents...`);
    const insertedPatents = await db.insert(patents).values(patentsToInsert).returning();
    
    console.log(`✅ Successfully initialized ${insertedPatents.length} patents!`);
    
    // Log category breakdown
    const categoryBreakdown = insertedPatents.reduce((acc, patent) => {
      acc[patent.category] = (acc[patent.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    console.log('📊 Patent categories:', categoryBreakdown);
    
  } catch (error) {
    console.error('❌ Error initializing patents:', error);
    throw error;
  }
}

// Export a singleton instance of the storage
export const storage = new PostgresStorage();
