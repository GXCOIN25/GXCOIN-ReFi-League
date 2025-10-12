import { db } from "../storage";
import { analyticsEvents } from "@shared/schema";
import { 
  AnalyticsEventInput, 
  analyticsEventInputSchema,
  EventData 
} from "@shared/types";
import { z } from "zod";
import { eq, gte, lte, desc, count, and, sql } from "drizzle-orm";

const BATCH_SIZE = 100;
const BATCH_INTERVAL_MS = 5000; // 5 seconds

interface QueuedEvent {
  userId: number | null;
  eventType: string;
  eventData: string;
  sessionId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
}

class AnalyticsService {
  private eventQueue: QueuedEvent[] = [];
  private batchTimer: NodeJS.Timeout | null = null;
  private isProcessing = false;

  constructor() {
    this.startBatchTimer();
  }

  private startBatchTimer() {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
    }
    
    this.batchTimer = setTimeout(() => {
      this.flush();
      this.startBatchTimer();
    }, BATCH_INTERVAL_MS);
  }

  async ingestEvent(
    eventInput: AnalyticsEventInput,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const validatedEvent = analyticsEventInputSchema.parse(eventInput);

    const eventData: EventData = {
      eventName: validatedEvent.eventName,
      properties: validatedEvent.properties || {},
    };

    const queuedEvent: QueuedEvent = {
      userId: validatedEvent.userId || null,
      eventType: validatedEvent.eventType,
      eventData: JSON.stringify(eventData),
      sessionId: validatedEvent.sessionId || null,
      ipAddress: ipAddress || null,
      userAgent: userAgent || null,
    };

    this.eventQueue.push(queuedEvent);

    console.log(`📊 Analytics event queued: ${validatedEvent.eventType} - ${validatedEvent.eventName} (Queue size: ${this.eventQueue.length})`);

    if (this.eventQueue.length >= BATCH_SIZE) {
      await this.flush();
    }
  }

  async ingestBatch(
    events: AnalyticsEventInput[],
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    if (events.length === 0) {
      throw new Error("Batch cannot be empty");
    }

    if (events.length > 100) {
      throw new Error("Batch size cannot exceed 100 events");
    }

    for (const event of events) {
      const validatedEvent = analyticsEventInputSchema.parse(event);

      const eventData: EventData = {
        eventName: validatedEvent.eventName,
        properties: validatedEvent.properties || {},
      };

      const queuedEvent: QueuedEvent = {
        userId: validatedEvent.userId || null,
        eventType: validatedEvent.eventType,
        eventData: JSON.stringify(eventData),
        sessionId: validatedEvent.sessionId || null,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
      };

      this.eventQueue.push(queuedEvent);
    }

    console.log(`📊 Analytics batch queued: ${events.length} events (Queue size: ${this.eventQueue.length})`);

    if (this.eventQueue.length >= BATCH_SIZE) {
      await this.flush();
    }
  }

  async flush(): Promise<void> {
    if (this.eventQueue.length === 0 || this.isProcessing) {
      return;
    }

    this.isProcessing = true;
    const eventsToProcess = [...this.eventQueue];
    this.eventQueue = [];

    try {
      console.log(`💾 Flushing ${eventsToProcess.length} analytics events to database...`);
      
      await db.insert(analyticsEvents).values(eventsToProcess);
      
      console.log(`✅ Successfully stored ${eventsToProcess.length} analytics events`);
    } catch (error) {
      console.error("❌ Error storing analytics events:", error);
      console.error("⚠️  Dropping failed batch to prevent service crash");
    } finally {
      this.isProcessing = false;
    }
  }

  async queryEvents(params: {
    userId?: number;
    eventType?: string;
    sessionId?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    offset?: number;
  }) {
    try {
      const conditions = [];

      if (params.userId !== undefined) {
        conditions.push(eq(analyticsEvents.userId, params.userId));
      }

      if (params.eventType) {
        conditions.push(eq(analyticsEvents.eventType, params.eventType));
      }

      if (params.sessionId) {
        conditions.push(eq(analyticsEvents.sessionId, params.sessionId));
      }

      if (params.startDate) {
        conditions.push(gte(analyticsEvents.createdAt, new Date(params.startDate)));
      }

      if (params.endDate) {
        conditions.push(lte(analyticsEvents.createdAt, new Date(params.endDate)));
      }

      let query = db.select().from(analyticsEvents);

      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }

      query = query
        .orderBy(desc(analyticsEvents.createdAt))
        .limit(params.limit || 100)
        .offset(params.offset || 0) as any;

      const events = await query;

      const parsedEvents = events.map((event: any) => {
        try {
          const eventData = event.eventData ? JSON.parse(event.eventData) : { eventName: "unknown", properties: {} };
          return {
            ...event,
            eventName: eventData.eventName,
            properties: eventData.properties,
          };
        } catch {
          return {
            ...event,
            eventName: "unknown",
            properties: {},
          };
        }
      });

      return parsedEvents;
    } catch (error) {
      console.error("❌ Error querying analytics events:", error);
      throw error;
    }
  }

  async getEventCount(params: {
    userId?: number;
    eventType?: string;
    sessionId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<number> {
    try {
      const conditions = [];

      if (params.userId !== undefined) {
        conditions.push(eq(analyticsEvents.userId, params.userId));
      }

      if (params.eventType) {
        conditions.push(eq(analyticsEvents.eventType, params.eventType));
      }

      if (params.sessionId) {
        conditions.push(eq(analyticsEvents.sessionId, params.sessionId));
      }

      if (params.startDate) {
        conditions.push(gte(analyticsEvents.createdAt, new Date(params.startDate)));
      }

      if (params.endDate) {
        conditions.push(lte(analyticsEvents.createdAt, new Date(params.endDate)));
      }

      let query = db.select({ count: count() }).from(analyticsEvents);

      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }

      const result = await query;
      return result[0]?.count || 0;
    } catch (error) {
      console.error("❌ Error counting analytics events:", error);
      throw error;
    }
  }

  async getDashboardOverview(startDate?: string, endDate?: string) {
    try {
      const now = new Date();
      const defaultStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000); // 7 days ago
      
      const start = startDate ? new Date(startDate) : defaultStart;
      const end = endDate ? new Date(endDate) : now;

      if (start >= end) {
        throw new Error("Start date must be before end date");
      }

      const conditions = [
        gte(analyticsEvents.createdAt, start),
        lte(analyticsEvents.createdAt, end)
      ];

      const [totalEventsResult] = await db
        .select({ count: count() })
        .from(analyticsEvents)
        .where(and(...conditions));

      const [uniqueUsersResult] = await db
        .select({ count: sql<number>`COUNT(DISTINCT ${analyticsEvents.userId})` })
        .from(analyticsEvents)
        .where(and(...conditions));

      const [activeSessionsResult] = await db
        .select({ count: sql<number>`COUNT(DISTINCT ${analyticsEvents.sessionId})` })
        .from(analyticsEvents)
        .where(and(...conditions, sql`${analyticsEvents.sessionId} IS NOT NULL`));

      const eventsByTypeResult = await db
        .select({
          eventType: analyticsEvents.eventType,
          count: count()
        })
        .from(analyticsEvents)
        .where(and(...conditions))
        .groupBy(analyticsEvents.eventType);

      const totalEvents = totalEventsResult?.count || 0;
      const eventsByType = eventsByTypeResult.map(item => ({
        eventType: item.eventType as any,
        count: item.count,
        percentage: totalEvents > 0 ? Math.round((item.count / totalEvents) * 100 * 100) / 100 : 0
      }));

      return {
        totalEvents,
        uniqueUsers: uniqueUsersResult?.count || 0,
        activeSessions: activeSessionsResult?.count || 0,
        eventsByType,
        dateRange: {
          start: start.toISOString(),
          end: end.toISOString()
        }
      };
    } catch (error) {
      console.error("❌ Error getting dashboard overview:", error);
      throw error;
    }
  }

  async getEventsTimeline(
    eventType?: string,
    startDate?: string,
    endDate?: string,
    interval: 'hourly' | 'daily' | 'weekly' = 'daily'
  ) {
    try {
      const now = new Date();
      const defaultStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const start = startDate ? new Date(startDate) : defaultStart;
      const end = endDate ? new Date(endDate) : now;

      if (start >= end) {
        throw new Error("Start date must be before end date");
      }

      const conditions = [
        gte(analyticsEvents.createdAt, start),
        lte(analyticsEvents.createdAt, end)
      ];

      if (eventType) {
        conditions.push(eq(analyticsEvents.eventType, eventType));
      }

      const truncFormat = interval === 'hourly' ? 'hour' : interval === 'weekly' ? 'week' : 'day';

      const timelineData = await db
        .select({
          timestamp: sql<string>`DATE_TRUNC('${sql.raw(truncFormat)}', ${analyticsEvents.createdAt})::text`,
          count: count(),
          eventType: eventType ? analyticsEvents.eventType : sql<string>`NULL`
        })
        .from(analyticsEvents)
        .where(and(...conditions))
        .groupBy(sql`DATE_TRUNC('${sql.raw(truncFormat)}', ${analyticsEvents.createdAt})`)
        .orderBy(sql`DATE_TRUNC('${sql.raw(truncFormat)}', ${analyticsEvents.createdAt})`);

      const totalEvents = timelineData.reduce((sum, item) => sum + item.count, 0);

      return {
        interval,
        data: timelineData.map(item => ({
          timestamp: item.timestamp,
          count: item.count,
          eventType: item.eventType as any
        })),
        totalEvents,
        dateRange: {
          start: start.toISOString(),
          end: end.toISOString()
        }
      };
    } catch (error) {
      console.error("❌ Error getting events timeline:", error);
      throw error;
    }
  }

  async getTopUsers(limit: number = 10, startDate?: string, endDate?: string) {
    try {
      const now = new Date();
      const defaultStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const start = startDate ? new Date(startDate) : defaultStart;
      const end = endDate ? new Date(endDate) : now;

      if (start >= end) {
        throw new Error("Start date must be before end date");
      }

      const conditions = [
        gte(analyticsEvents.createdAt, start),
        lte(analyticsEvents.createdAt, end)
      ];

      const topUsersData = await db
        .select({
          userId: analyticsEvents.userId,
          eventCount: count(),
          lastActive: sql<string>`MAX(${analyticsEvents.createdAt})::text`
        })
        .from(analyticsEvents)
        .where(and(...conditions))
        .groupBy(analyticsEvents.userId)
        .orderBy(desc(count()))
        .limit(limit);

      const topUsers = topUsersData.map(item => ({
        userId: item.userId,
        eventCount: item.eventCount,
        lastActive: item.lastActive,
        isAnonymous: item.userId === null
      }));

      return topUsers;
    } catch (error) {
      console.error("❌ Error getting top users:", error);
      throw error;
    }
  }

  async getConversionFunnel(
    funnelType: 'purchase' | 'airdrop' | 'guild_join',
    startDate?: string,
    endDate?: string
  ) {
    try {
      const now = new Date();
      const defaultStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const start = startDate ? new Date(startDate) : defaultStart;
      const end = endDate ? new Date(endDate) : now;

      if (start >= end) {
        throw new Error("Start date must be before end date");
      }

      const conditions = [
        gte(analyticsEvents.createdAt, start),
        lte(analyticsEvents.createdAt, end)
      ];

      const funnelStages = {
        purchase: [
          { stage: 'Page View', eventType: 'PAGE_VIEW' },
          { stage: 'Button Click', eventType: 'BUTTON_CLICK' },
          { stage: 'Purchase', eventType: 'PURCHASE' }
        ],
        airdrop: [
          { stage: 'Page View', eventType: 'PAGE_VIEW' },
          { stage: 'Button Click', eventType: 'BUTTON_CLICK' },
          { stage: 'Airdrop Claim', eventType: 'AIRDROP_CLAIM' }
        ],
        guild_join: [
          { stage: 'Page View', eventType: 'PAGE_VIEW' },
          { stage: 'Button Click', eventType: 'BUTTON_CLICK' },
          { stage: 'Guild Action', eventType: 'GUILD_ACTION' }
        ]
      };

      const stages = funnelStages[funnelType];
      const stageResults = [];

      for (let i = 0; i < stages.length; i++) {
        const stage = stages[i];
        const stageConditions = [
          ...conditions,
          eq(analyticsEvents.eventType, stage.eventType)
        ];

        const [result] = await db
          .select({
            count: sql<number>`COUNT(DISTINCT COALESCE(${analyticsEvents.sessionId}, CAST(${analyticsEvents.userId} AS TEXT), ${analyticsEvents.ipAddress}))`
          })
          .from(analyticsEvents)
          .where(and(...stageConditions));

        const count: number = result?.count || 0;
        const previousCount: number = i > 0 ? stageResults[i - 1].count : count;
        const conversionRate: number = previousCount > 0 ? Math.round((count / previousCount) * 100 * 100) / 100 : 0;
        const dropoffRate: number = previousCount > 0 ? Math.round(((previousCount - count) / previousCount) * 100 * 100) / 100 : 0;

        stageResults.push({
          stage: stage.stage,
          eventType: stage.eventType as any,
          count,
          conversionRate: i === 0 ? 100 : conversionRate,
          dropoffRate: i === 0 ? 0 : dropoffRate
        });
      }

      const totalEntries = stageResults[0]?.count || 0;
      const finalStage = stageResults[stageResults.length - 1];
      const overallConversionRate = totalEntries > 0 
        ? Math.round((finalStage.count / totalEntries) * 100 * 100) / 100 
        : 0;

      return {
        funnelType,
        stages: stageResults,
        totalEntries,
        overallConversionRate,
        dateRange: {
          start: start.toISOString(),
          end: end.toISOString()
        }
      };
    } catch (error) {
      console.error("❌ Error getting conversion funnel:", error);
      throw error;
    }
  }

  async getRealtimeMetrics() {
    try {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);

      const [eventsLast5MinResult] = await db
        .select({ count: count() })
        .from(analyticsEvents)
        .where(gte(analyticsEvents.createdAt, fiveMinutesAgo));

      const [activeUsersResult] = await db
        .select({ count: sql<number>`COUNT(DISTINCT ${analyticsEvents.userId})` })
        .from(analyticsEvents)
        .where(and(
          gte(analyticsEvents.createdAt, tenMinutesAgo),
          sql`${analyticsEvents.userId} IS NOT NULL`
        ));

      const topEventTypesData = await db
        .select({
          eventType: analyticsEvents.eventType,
          count: count()
        })
        .from(analyticsEvents)
        .where(gte(analyticsEvents.createdAt, fiveMinutesAgo))
        .groupBy(analyticsEvents.eventType)
        .orderBy(desc(count()))
        .limit(5);

      const eventsLast5Minutes = eventsLast5MinResult?.count || 0;
      const eventRate = Math.round((eventsLast5Minutes / 5) * 100) / 100;

      return {
        eventsLast5Minutes,
        activeUsers: activeUsersResult?.count || 0,
        eventRate,
        topEventTypes: topEventTypesData.map(item => ({
          eventType: item.eventType as any,
          count: item.count
        })),
        timestamp: now.toISOString()
      };
    } catch (error) {
      console.error("❌ Error getting realtime metrics:", error);
      throw error;
    }
  }

  async shutdown(): Promise<void> {
    if (this.batchTimer) {
      clearTimeout(this.batchTimer);
      this.batchTimer = null;
    }
    await this.flush();
  }
}

export const analyticsService = new AnalyticsService();

process.on("SIGTERM", async () => {
  console.log("📊 Shutting down analytics service...");
  await analyticsService.shutdown();
});

process.on("SIGINT", async () => {
  console.log("📊 Shutting down analytics service...");
  await analyticsService.shutdown();
});
