import { db } from "../storage";
import { analyticsEvents } from "@shared/schema";
import { 
  AnalyticsEventInput, 
  analyticsEventInputSchema,
  EventData 
} from "@shared/types";
import { z } from "zod";
import { eq, gte, lte, desc, count, and } from "drizzle-orm";

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
