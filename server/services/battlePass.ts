import { db } from "../storage";
import { battlePassSeasons, battlePassProgress, battlePassPurchases, battlePassClaims } from "@shared/schema";
import { 
  BattlePassReward, 
  BattlePassSeason, 
  BattlePassProgress, 
  BattlePassSeasonWithRewards,
  UserBattlePassProgress,
  XPSource,
  XP_AMOUNTS 
} from "@shared/types";
import { eq, and, lte, gte, desc } from "drizzle-orm";

const XP_PER_LEVEL = 100;
const MAX_LEVEL = 50;

export class BattlePassService {
  
  // ============ Season Management Functions ============
  
  async createSeason(
    name: string,
    seasonNumber: number,
    startDate: Date,
    endDate: Date,
    freeTierRewards: BattlePassReward[],
    premiumTierRewards: BattlePassReward[]
  ): Promise<BattlePassSeasonWithRewards> {
    if (startDate >= endDate) {
      throw new Error("End date must be after start date");
    }

    const [season] = await db.insert(battlePassSeasons).values({
      name,
      seasonNumber,
      startDate,
      endDate,
      freeTierRewardsJson: JSON.stringify(freeTierRewards),
      premiumTierRewardsJson: JSON.stringify(premiumTierRewards),
      isActive: true,
    }).returning();

    return this.parseSeasonRewards(season);
  }

  async getActiveSeason(): Promise<BattlePassSeasonWithRewards | null> {
    const now = new Date();
    const [season] = await db
      .select()
      .from(battlePassSeasons)
      .where(
        and(
          eq(battlePassSeasons.isActive, true),
          lte(battlePassSeasons.startDate, now),
          gte(battlePassSeasons.endDate, now)
        )
      )
      .limit(1);

    if (!season) {
      return null;
    }

    return this.parseSeasonRewards(season);
  }

  async getAllSeasons(limit: number = 10, offset: number = 0): Promise<BattlePassSeasonWithRewards[]> {
    const seasons = await db
      .select()
      .from(battlePassSeasons)
      .orderBy(desc(battlePassSeasons.seasonNumber))
      .limit(limit)
      .offset(offset);

    return seasons.map(season => this.parseSeasonRewards(season));
  }

  async updateSeason(
    seasonId: number,
    updates: {
      name?: string;
      startDate?: Date;
      endDate?: Date;
      freeTierRewards?: BattlePassReward[];
      premiumTierRewards?: BattlePassReward[];
      isActive?: boolean;
    }
  ): Promise<BattlePassSeasonWithRewards> {
    // Get existing season to validate dates
    const existingSeason = await this.getSeasonById(seasonId);
    if (!existingSeason) {
      throw new Error("Season not found");
    }

    const updateData: any = {};

    if (updates.name !== undefined) {
      updateData.name = updates.name;
    }

    if (updates.startDate !== undefined) {
      updateData.startDate = updates.startDate;
    }

    if (updates.endDate !== undefined) {
      updateData.endDate = updates.endDate;
    }

    if (updates.freeTierRewards !== undefined) {
      updateData.freeTierRewardsJson = JSON.stringify(updates.freeTierRewards);
    }

    if (updates.premiumTierRewards !== undefined) {
      updateData.premiumTierRewardsJson = JSON.stringify(updates.premiumTierRewards);
    }

    if (updates.isActive !== undefined) {
      updateData.isActive = updates.isActive;
    }

    // Always validate resulting date range
    const finalStartDate = updateData.startDate ?? existingSeason.startDate;
    const finalEndDate = updateData.endDate ?? existingSeason.endDate;

    if (finalStartDate >= finalEndDate) {
      throw new Error("End date must be after start date");
    }

    const [updatedSeason] = await db
      .update(battlePassSeasons)
      .set(updateData)
      .where(eq(battlePassSeasons.id, seasonId))
      .returning();

    if (!updatedSeason) {
      throw new Error("Season not found");
    }

    return this.parseSeasonRewards(updatedSeason);
  }

  async deactivateSeason(seasonId: number): Promise<void> {
    const [result] = await db
      .update(battlePassSeasons)
      .set({ isActive: false })
      .where(eq(battlePassSeasons.id, seasonId))
      .returning();

    if (!result) {
      throw new Error("Season not found");
    }
  }

  async getSeasonById(seasonId: number): Promise<BattlePassSeasonWithRewards | null> {
    const [season] = await db
      .select()
      .from(battlePassSeasons)
      .where(eq(battlePassSeasons.id, seasonId))
      .limit(1);

    if (!season) {
      return null;
    }

    return this.parseSeasonRewards(season);
  }

  // ============ User Progress Functions ============

  async getUserProgress(userId: number, seasonId?: number): Promise<UserBattlePassProgress | null> {
    let targetSeasonId = seasonId;

    if (!targetSeasonId) {
      const activeSeason = await this.getActiveSeason();
      if (!activeSeason) {
        return null;
      }
      targetSeasonId = activeSeason.id;
    }

    const season = await this.getSeasonById(targetSeasonId);
    if (!season) {
      return null;
    }

    let [progress] = await db
      .select()
      .from(battlePassProgress)
      .where(
        and(
          eq(battlePassProgress.userId, userId),
          eq(battlePassProgress.seasonId, targetSeasonId)
        )
      )
      .limit(1);

    if (!progress) {
      [progress] = await db.insert(battlePassProgress).values({
        userId,
        seasonId: targetSeasonId,
        currentLevel: 1,
        currentXp: 0,
        isPremium: false,
        premiumPurchasedAt: null,
      }).returning();
    }

    const unclaimedRewards = await this.getUnclaimedRewards(userId, targetSeasonId);

    return {
      season,
      progress,
      unclaimedRewards,
    };
  }

  // Internal function for trusted server-side XP awards with source validation
  async addXPFromEvent(userId: number, source: XPSource): Promise<BattlePassProgress> {
    // Validate XP amount against source caps
    const xpAmount = XP_AMOUNTS[source];
    
    if (!xpAmount || xpAmount <= 0) {
      throw new Error(`Invalid XP source: ${source}`);
    }

    const activeSeason = await this.getActiveSeason();
    if (!activeSeason) {
      throw new Error("No active season");
    }

    let [progress] = await db
      .select()
      .from(battlePassProgress)
      .where(
        and(
          eq(battlePassProgress.userId, userId),
          eq(battlePassProgress.seasonId, activeSeason.id)
        )
      )
      .limit(1);

    if (!progress) {
      [progress] = await db.insert(battlePassProgress).values({
        userId,
        seasonId: activeSeason.id,
        currentLevel: 1,
        currentXp: 0,
        isPremium: false,
        premiumPurchasedAt: null,
      }).returning();
    }

    const currentXp = progress.currentXp ?? 0;
    const newXp = currentXp + xpAmount;
    const newLevel = this.calculateLevel(newXp);
    const cappedLevel = Math.min(newLevel, MAX_LEVEL);
    const cappedXp = cappedLevel === MAX_LEVEL ? (MAX_LEVEL * XP_PER_LEVEL) - 1 : newXp;

    const [updatedProgress] = await db
      .update(battlePassProgress)
      .set({
        currentXp: cappedXp,
        currentLevel: cappedLevel,
        updatedAt: new Date(),
      })
      .where(eq(battlePassProgress.id, progress.id))
      .returning();

    console.log(`[Battle Pass] User ${userId} earned ${xpAmount} XP from ${source} (Level: ${cappedLevel}, Total XP: ${cappedXp})`);

    return updatedProgress;
  }

  // Admin-only function for manual XP grants (testing/support)
  async addXPAdmin(userId: number, xpAmount: number, reason: string): Promise<BattlePassProgress> {
    if (xpAmount <= 0) {
      throw new Error("XP amount must be positive");
    }

    if (xpAmount > 1000) {
      throw new Error("XP amount cannot exceed 1000 per admin grant");
    }

    const activeSeason = await this.getActiveSeason();
    if (!activeSeason) {
      throw new Error("No active season");
    }

    let [progress] = await db
      .select()
      .from(battlePassProgress)
      .where(
        and(
          eq(battlePassProgress.userId, userId),
          eq(battlePassProgress.seasonId, activeSeason.id)
        )
      )
      .limit(1);

    if (!progress) {
      [progress] = await db.insert(battlePassProgress).values({
        userId,
        seasonId: activeSeason.id,
        currentLevel: 1,
        currentXp: 0,
        isPremium: false,
        premiumPurchasedAt: null,
      }).returning();
    }

    const currentXp = progress.currentXp ?? 0;
    const newXp = currentXp + xpAmount;
    const newLevel = this.calculateLevel(newXp);
    const cappedLevel = Math.min(newLevel, MAX_LEVEL);
    const cappedXp = cappedLevel === MAX_LEVEL ? (MAX_LEVEL * XP_PER_LEVEL) - 1 : newXp;

    const [updatedProgress] = await db
      .update(battlePassProgress)
      .set({
        currentXp: cappedXp,
        currentLevel: cappedLevel,
        updatedAt: new Date(),
      })
      .where(eq(battlePassProgress.id, progress.id))
      .returning();

    console.log(`[Battle Pass] [ADMIN] User ${userId} granted ${xpAmount} XP manually. Reason: ${reason} (Level: ${cappedLevel}, Total XP: ${cappedXp})`);

    return updatedProgress;
  }

  // Stripe purchase flow - records pending purchase for webhook confirmation
  async purchasePremiumWithStripe(
    userId: number, 
    seasonId: number, 
    stripeSessionId: string, 
    amount: number
  ): Promise<{ purchase: any; alreadyPremium: boolean }> {
    const season = await this.getSeasonById(seasonId);
    if (!season) {
      throw new Error("Season not found");
    }

    if (!season.isActive) {
      throw new Error("Season is not active");
    }

    let [progress] = await db
      .select()
      .from(battlePassProgress)
      .where(
        and(
          eq(battlePassProgress.userId, userId),
          eq(battlePassProgress.seasonId, seasonId)
        )
      )
      .limit(1);

    if (!progress) {
      [progress] = await db.insert(battlePassProgress).values({
        userId,
        seasonId,
        currentLevel: 1,
        currentXp: 0,
        isPremium: false,
        premiumPurchasedAt: null,
      }).returning();
    }

    // Check if already premium
    if (progress.isPremium) {
      return { purchase: null, alreadyPremium: true };
    }

    // Record pending purchase - will be confirmed by webhook
    const [purchase] = await db.insert(battlePassPurchases).values({
      userId,
      seasonId,
      amount: Math.round(amount * 100), // Store in cents
      stripePaymentId: stripeSessionId, // Store session ID for now, will update with payment intent
      purchasedAt: new Date(),
    }).returning();

    return { purchase, alreadyPremium: false };
  }

  // Complete premium purchase after webhook confirmation
  async completePremiumPurchase(userId: number, seasonId: number, stripePaymentId: string): Promise<BattlePassProgress> {
    let [progress] = await db
      .select()
      .from(battlePassProgress)
      .where(
        and(
          eq(battlePassProgress.userId, userId),
          eq(battlePassProgress.seasonId, seasonId)
        )
      )
      .limit(1);

    if (!progress) {
      [progress] = await db.insert(battlePassProgress).values({
        userId,
        seasonId,
        currentLevel: 1,
        currentXp: 0,
        isPremium: false,
        premiumPurchasedAt: null,
      }).returning();
    }

    if (progress.isPremium) {
      console.log(`[Battle Pass] User ${userId} already has premium for season ${seasonId}`);
      return progress;
    }

    const [updatedProgress] = await db
      .update(battlePassProgress)
      .set({
        isPremium: true,
        premiumPurchasedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(battlePassProgress.id, progress.id))
      .returning();

    console.log(`✅ Battle Pass Premium activated for user ${userId}, season ${seasonId}`);

    return updatedProgress;
  }

  async purchasePremium(userId: number, seasonId: number, stripePaymentId: string): Promise<BattlePassProgress> {
    const season = await this.getSeasonById(seasonId);
    if (!season) {
      throw new Error("Season not found");
    }

    if (!season.isActive) {
      throw new Error("Season is not active");
    }

    let [progress] = await db
      .select()
      .from(battlePassProgress)
      .where(
        and(
          eq(battlePassProgress.userId, userId),
          eq(battlePassProgress.seasonId, seasonId)
        )
      )
      .limit(1);

    if (!progress) {
      [progress] = await db.insert(battlePassProgress).values({
        userId,
        seasonId,
        currentLevel: 1,
        currentXp: 0,
        isPremium: false,
        premiumPurchasedAt: null,
      }).returning();
    }

    if (progress.isPremium) {
      throw new Error("Premium already purchased for this season");
    }

    const [updatedProgress] = await db
      .update(battlePassProgress)
      .set({
        isPremium: true,
        premiumPurchasedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(battlePassProgress.id, progress.id))
      .returning();

    await db.insert(battlePassPurchases).values({
      userId,
      seasonId,
      amount: 999,
      stripePaymentId,
      purchasedAt: new Date(),
    });

    return updatedProgress;
  }

  async claimReward(userId: number, level: number, tier: 'free' | 'premium'): Promise<{ success: boolean; reward: BattlePassReward }> {
    const userProgress = await this.getUserProgress(userId);
    if (!userProgress) {
      throw new Error("No active season or progress found");
    }

    const seasonId = userProgress.season.id;
    const currentLevel = userProgress.progress.currentLevel ?? 1;
    
    // Validate user has reached the required level
    if (level > currentLevel) {
      throw new Error("Level not yet reached");
    }

    // Validate tier matches user's premium status
    if (tier === 'premium' && !userProgress.progress.isPremium) {
      throw new Error("Premium tier not purchased");
    }

    const reward = this.getRewardsAtLevel(level, tier, userProgress.season);
    if (!reward) {
      throw new Error("No reward at this level");
    }

    // Check if reward already claimed
    const [existingClaim] = await db
      .select()
      .from(battlePassClaims)
      .where(
        and(
          eq(battlePassClaims.userId, userId),
          eq(battlePassClaims.seasonId, seasonId),
          eq(battlePassClaims.level, level),
          eq(battlePassClaims.tier, tier)
        )
      )
      .limit(1);

    if (existingClaim) {
      throw new Error("Reward already claimed");
    }

    // Insert claim record
    await db.insert(battlePassClaims).values({
      userId,
      seasonId,
      level,
      tier,
      rewardJson: JSON.stringify(reward),
      claimedAt: new Date(),
    });

    console.log(`[Battle Pass] User ${userId} claimed ${tier} reward at level ${level} for season ${seasonId}:`, reward);

    return {
      success: true,
      reward,
    };
  }

  // ============ Rewards Logic ============

  calculateLevel(xp: number): number {
    return Math.floor(xp / XP_PER_LEVEL) + 1;
  }

  getRewardsAtLevel(level: number, tier: 'free' | 'premium', season: BattlePassSeasonWithRewards): BattlePassReward | null {
    const rewards = tier === 'free' ? season.freeTierRewards : season.premiumTierRewards;
    return rewards.find(r => r.level === level) || null;
  }

  async getUnclaimedRewards(userId: number, seasonId: number): Promise<Array<{ level: number; tier: 'free' | 'premium'; reward: BattlePassReward }>> {
    const season = await this.getSeasonById(seasonId);
    if (!season) {
      return [];
    }

    const [progress] = await db
      .select()
      .from(battlePassProgress)
      .where(
        and(
          eq(battlePassProgress.userId, userId),
          eq(battlePassProgress.seasonId, seasonId)
        )
      )
      .limit(1);

    if (!progress) {
      return [];
    }

    // Get all claimed rewards for this user and season
    const claimedRewards = await db
      .select()
      .from(battlePassClaims)
      .where(
        and(
          eq(battlePassClaims.userId, userId),
          eq(battlePassClaims.seasonId, seasonId)
        )
      );

    // Create a set of claimed reward keys for quick lookup
    const claimedSet = new Set(
      claimedRewards.map(claim => `${claim.level}-${claim.tier}`)
    );

    const unclaimed: Array<{ level: number; tier: 'free' | 'premium'; reward: BattlePassReward }> = [];

    const currentLevel = progress.currentLevel ?? 1;
    
    for (let level = 1; level <= currentLevel; level++) {
      const freeReward = this.getRewardsAtLevel(level, 'free', season);
      if (freeReward && !claimedSet.has(`${level}-free`)) {
        unclaimed.push({ level, tier: 'free', reward: freeReward });
      }

      if (progress.isPremium) {
        const premiumReward = this.getRewardsAtLevel(level, 'premium', season);
        if (premiumReward && !claimedSet.has(`${level}-premium`)) {
          unclaimed.push({ level, tier: 'premium', reward: premiumReward });
        }
      }
    }

    return unclaimed;
  }

  // ============ Helper Functions ============

  private parseSeasonRewards(season: any): BattlePassSeasonWithRewards {
    return {
      ...season,
      freeTierRewards: season.freeTierRewardsJson ? JSON.parse(season.freeTierRewardsJson) : [],
      premiumTierRewards: season.premiumTierRewardsJson ? JSON.parse(season.premiumTierRewardsJson) : [],
    };
  }
}

export const battlePassService = new BattlePassService();
