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
