import { z } from "zod";

// Analytics Event Types
export enum AnalyticsEventType {
  PAGE_VIEW = "PAGE_VIEW",
  BUTTON_CLICK = "BUTTON_CLICK",
  PURCHASE = "PURCHASE",
  NFT_MINT = "NFT_MINT",
  GUILD_ACTION = "GUILD_ACTION",
  REFERRAL = "REFERRAL",
  AIRDROP_CLAIM = "AIRDROP_CLAIM",
}

// Analytics Event Interface
export interface AnalyticsEvent {
  id: number;
  userId: number | null;
  eventType: AnalyticsEventType;
  eventData: string; // JSON string containing eventName and properties
  sessionId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}

// Event Data Structure (stored in eventData field)
export interface EventData {
  eventName: string;
  properties?: Record<string, any>;
}

// Analytics Event Input Schema (for API requests)
export const analyticsEventInputSchema = z.object({
  userId: z.number().optional().nullable(),
  eventType: z.nativeEnum(AnalyticsEventType),
  eventName: z.string().min(1).max(255),
  properties: z.record(z.any()).optional(),
  sessionId: z.string().optional().nullable(),
});

export type AnalyticsEventInput = z.infer<typeof analyticsEventInputSchema>;

// Batch Event Input Schema
export const analyticsBatchEventInputSchema = z.object({
  events: z.array(analyticsEventInputSchema).min(1).max(100),
});

export type AnalyticsBatchEventInput = z.infer<typeof analyticsBatchEventInputSchema>;

// Analytics Query Parameters (for filtering)
export const analyticsQueryParamsSchema = z.object({
  userId: z.number().optional(),
  eventType: z.nativeEnum(AnalyticsEventType).optional(),
  sessionId: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.number().min(1).max(1000).default(100),
  offset: z.number().min(0).default(0),
});

export type AnalyticsQueryParams = z.infer<typeof analyticsQueryParamsSchema>;

// Dashboard Analytics Types

export interface EventTypeBreakdown {
  eventType: AnalyticsEventType;
  count: number;
  percentage: number;
}

export interface DashboardOverview {
  totalEvents: number;
  uniqueUsers: number;
  activeSessions: number;
  eventsByType: EventTypeBreakdown[];
  dateRange: {
    start: string;
    end: string;
  };
}

export interface TimelineDataPoint {
  timestamp: string;
  count: number;
  eventType?: AnalyticsEventType;
}

export interface EventsTimeline {
  interval: 'hourly' | 'daily' | 'weekly';
  data: TimelineDataPoint[];
  totalEvents: number;
  dateRange: {
    start: string;
    end: string;
  };
}

export interface TopUser {
  userId: number | null;
  username?: string;
  eventCount: number;
  lastActive: string;
  isAnonymous: boolean;
}

export interface FunnelStage {
  stage: string;
  eventType: AnalyticsEventType;
  count: number;
  conversionRate: number;
  dropoffRate: number;
}

export interface ConversionFunnel {
  funnelType: 'purchase' | 'airdrop' | 'guild_join';
  stages: FunnelStage[];
  totalEntries: number;
  overallConversionRate: number;
  dateRange: {
    start: string;
    end: string;
  };
}

export interface RealtimeMetrics {
  eventsLast5Minutes: number;
  activeUsers: number;
  eventRate: number; // events per minute
  topEventTypes: {
    eventType: AnalyticsEventType;
    count: number;
  }[];
  timestamp: string;
}

// Battle Pass System Types

export enum XPSource {
  AIRDROP_CLAIM = "AIRDROP_CLAIM",
  NFT_MINT = "NFT_MINT",
  GUILD_ACTION = "GUILD_ACTION",
  REFERRAL = "REFERRAL",
  DAILY_LOGIN = "DAILY_LOGIN",
}

export const XP_AMOUNTS: Record<XPSource, number> = {
  [XPSource.AIRDROP_CLAIM]: 50,
  [XPSource.NFT_MINT]: 100,
  [XPSource.GUILD_ACTION]: 75,
  [XPSource.REFERRAL]: 25,
  [XPSource.DAILY_LOGIN]: 10,
};

export interface BattlePassReward {
  level: number;
  reward: string;
  type: "token" | "nft" | "bundle" | "cosmetic";
}

export interface BattlePassSeason {
  id: number;
  name: string;
  seasonNumber: number;
  startDate: Date;
  endDate: Date;
  freeTierRewardsJson: string | null;
  premiumTierRewardsJson: string | null;
  isActive: boolean;
  createdAt: Date;
}

export interface BattlePassProgress {
  id: number;
  userId: number | null;
  seasonId: number | null;
  currentLevel: number | null;
  currentXp: number | null;
  isPremium: boolean | null;
  premiumPurchasedAt: Date | null;
  updatedAt: Date | null;
}

export interface BattlePassPurchase {
  id: number;
  userId: number;
  seasonId: number;
  amount: number;
  stripePaymentId: string | null;
  purchasedAt: Date;
}

export interface BattlePassSeasonWithRewards extends Omit<BattlePassSeason, 'freeTierRewardsJson' | 'premiumTierRewardsJson'> {
  freeTierRewards: BattlePassReward[];
  premiumTierRewards: BattlePassReward[];
}

export interface UserBattlePassProgress {
  season: BattlePassSeasonWithRewards;
  progress: BattlePassProgress;
  unclaimedRewards: {
    level: number;
    tier: 'free' | 'premium';
    reward: BattlePassReward;
  }[];
}
