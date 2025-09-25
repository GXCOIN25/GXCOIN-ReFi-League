import { drizzle } from "drizzle-orm/neon-serverless";
import { neon } from "@neondatabase/serverless";
import { users, contributions, nftBadges, missions, 
         type User, type InsertUser, 
         type Contribution, type InsertContribution,
         type NftBadge, type InsertNftBadge } from "@shared/schema";
import { eq, desc, sum } from "drizzle-orm";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  authenticateUser(username: string, password: string): Promise<User | null>;
  generateToken(user: User): string;
  verifyToken(token: string): { userId: number } | null;
  
  // Contribution methods
  getUserContributions(userId: number): Promise<Contribution[]>;
  addContribution(contribution: InsertContribution): Promise<Contribution>;
  getTotalContribution(userId: number): Promise<number>;
  
  // NFT Badge methods
  getUserNFTBadges(userId: number): Promise<NftBadge[]>;
  createNFTBadge(badge: InsertNftBadge): Promise<NftBadge>;
  
  // Mission methods
  getUserMissionProgress(userId: number): Promise<any[]>;
  updateMissionProgress(userId: number, missionId: string, progress: number): Promise<void>;
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

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const userData = { ...insertUser, password: hashedPassword };
    const result = await db.insert(users).values(userData).returning();
    return result[0];
  }

  async authenticateUser(username: string, password: string): Promise<User | null> {
    const user = await this.getUserByUsername(username);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  generateToken(user: User): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET environment variable is required');
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
      throw new Error('JWT_SECRET environment variable is required');
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
}

export const storage = new PostgresStorage();
