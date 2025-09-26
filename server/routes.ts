import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertContributionSchema, insertNftBadgeSchema } from "@shared/schema";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";
import type { Request, Response, NextFunction } from "express";

interface AuthRequest extends Request {
  userId?: number;
}

// Authentication middleware - header-only for security
const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  
  try {
    const payload = storage.verifyToken(token);
    if (!payload) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    req.userId = payload.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(cookieParser());
  
  // Production-ready rate limiting for auth endpoints
  const authRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: { error: 'Too many authentication attempts. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
  });
  
  // Production-ready rate limiting for patent/economic endpoints
  const patentRateLimit = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 20, // 20 patent operations per window
    message: { error: 'Too many patent operations. Please wait before trying again.' },
    standardHeaders: true,
    legacyHeaders: false,
  });
  
  // Strict rate limiting for patent unlock operations
  const patentUnlockRateLimit = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 unlocks per hour per IP
    message: { error: 'Patent unlock limit exceeded. Please wait before unlocking more patents.' },
    standardHeaders: true,
    legacyHeaders: false,
  });
  
  const authSpeedLimit = slowDown({
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: 2, // Allow 2 requests at full speed
    delayMs: () => 500 // Add 500ms delay per request after
  });
  
  // Health check endpoint for production monitoring
  app.get('/api/health', (req, res) => {
    res.json({ 
      status: 'healthy', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: '1.0.0'
    });
  });
  
  // Authentication routes with rate limiting and brute-force protection
  app.post("/api/auth/register", authRateLimit, authSpeedLimit, async (req, res) => {
    try {
      // Clean the request body to handle undefined walletAddress
      const cleanedBody = {
        username: req.body.username,
        password: req.body.password,
        walletAddress: req.body.walletAddress || null
      };
      
      const userData = insertUserSchema.parse(cleanedBody);
      const user = await storage.createUser(userData);
      const token = storage.generateToken(user);
      
      const { password, ...safeUser } = user;
      res.json({ user: safeUser, token });
    } catch (error: any) {
      console.error('Registration error:', error);
      if (error.code === '23505') { // Unique constraint violation
        res.status(409).json({ error: "Username already exists" });
      } else {
        res.status(400).json({ error: "Invalid user data", details: error.message });
      }
    }
  });

  app.post("/api/auth/login", authRateLimit, authSpeedLimit, async (req, res) => {
    try {
      const { username, password } = req.body;
      const user = await storage.authenticateUser(username, password);
      
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      
      const token = storage.generateToken(user);
      
      const { password: _, ...safeUser } = user;
      res.json({ user: safeUser, token });
    } catch (error) {
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    res.json({ success: true });
  });
  
  // Protected user routes
  app.get("/api/users/me", authenticate, async (req: AuthRequest, res) => {
    const user = await storage.getUser(req.userId!);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const { password, ...safeUser } = user;
    res.json(safeUser);
  });

  // Protected contribution routes
  app.get("/api/contributions", authenticate, async (req: AuthRequest, res) => {
    const contributions = await storage.getUserContributions(req.userId!);
    res.json(contributions);
  });

  app.get("/api/contributions/total", authenticate, async (req: AuthRequest, res) => {
    const total = await storage.getTotalContribution(req.userId!);
    res.json({ total });
  });

  app.post("/api/contributions", authenticate, async (req: AuthRequest, res) => {
    try {
      const { amount, currentRankId, impactMetrics } = req.body;
      const contributionData = {
        userId: req.userId!,
        amount,
        currentRankId,
        impactMetrics
      };
      const contribution = await storage.addContribution(contributionData);
      res.json(contribution);
    } catch (error) {
      res.status(400).json({ error: "Invalid contribution data" });
    }
  });

  // Protected NFT Badge routes
  app.get("/api/nft-badges", authenticate, async (req: AuthRequest, res) => {
    const badges = await storage.getUserNFTBadges(req.userId!);
    res.json(badges);
  });

  app.post("/api/nft-badges", authenticate, async (req: AuthRequest, res) => {
    try {
      const { heroId, level, evolution, rarity, attributes, minted } = req.body;
      const badgeData = {
        userId: req.userId!,
        heroId,
        level,
        evolution,
        rarity,
        attributes,
        minted
      };
      const badge = await storage.createNFTBadge(badgeData);
      res.json(badge);
    } catch (error) {
      res.status(400).json({ error: "Invalid NFT badge data" });
    }
  });

  // Protected mission routes
  app.get("/api/missions", authenticate, async (req: AuthRequest, res) => {
    const missions = await storage.getUserMissionProgress(req.userId!);
    res.json(missions);
  });

  app.put("/api/missions/:missionId", authenticate, async (req: AuthRequest, res) => {
    const { missionId } = req.params;
    const { progress } = req.body;
    
    await storage.updateMissionProgress(req.userId!, missionId, progress);
    res.json({ success: true });
  });

  // Patent Registry routes with rate limiting
  app.get("/api/patents", authenticate, patentRateLimit, async (req: AuthRequest, res) => {
    try {
      const patents = await storage.getAllPatents();
      res.json(patents);
    } catch (error) {
      console.error('Failed to get patents:', error);
      res.status(500).json({ error: "Failed to retrieve patents" });
    }
  });

  app.get("/api/patents/:id", authenticate, patentRateLimit, async (req: AuthRequest, res) => {
    try {
      const patentId = parseInt(req.params.id);
      const patent = await storage.getPatentById(patentId);
      
      if (!patent) {
        return res.status(404).json({ error: "Patent not found" });
      }
      
      res.json(patent);
    } catch (error) {
      console.error('Failed to get patent:', error);
      res.status(500).json({ error: "Failed to retrieve patent" });
    }
  });

  app.get("/api/patents/user-access", authenticate, patentRateLimit, async (req: AuthRequest, res) => {
    try {
      const userAccess = await storage.getUserPatentAccess(req.userId!);
      res.json(userAccess);
    } catch (error) {
      console.error('Failed to get user patent access:', error);
      res.status(500).json({ error: "Failed to retrieve patent access" });
    }
  });

  app.post("/api/patents/:id/unlock", authenticate, patentUnlockRateLimit, async (req: AuthRequest, res) => {
    try {
      const patentId = parseInt(req.params.id);
      const patent = await storage.getPatentById(patentId);
      
      if (!patent) {
        return res.status(404).json({ error: "Patent not found" });
      }
      
      // Check if user already has access
      const existingAccess = await storage.getUserPatentAccess(req.userId!);
      if (existingAccess.some(access => access.patentId === patentId)) {
        return res.status(409).json({ error: "Patent already unlocked" });
      }
      
      const patentAccess = await storage.unlockPatentForUser(req.userId!, patentId);
      res.json(patentAccess);
    } catch (error) {
      console.error('Failed to unlock patent:', error);
      res.status(500).json({ error: "Failed to unlock patent" });
    }
  });

  app.post("/api/patents/:id/use", authenticate, patentRateLimit, async (req: AuthRequest, res) => {
    try {
      const patentId = parseInt(req.params.id);
      const { heroId, usageType, quantity = 1 } = req.body;
      
      // Verify user has access to this patent
      const userAccess = await storage.getUserPatentAccess(req.userId!);
      const access = userAccess.find(a => a.patentId === patentId);
      
      if (!access) {
        return res.status(403).json({ error: "Patent access required" });
      }
      
      const patent = await storage.getPatentById(patentId);
      if (!patent) {
        return res.status(404).json({ error: "Patent not found" });
      }
      
      // Calculate economic reward based on patent usage
      const economicValue = await storage.calculatePatentLicensingValue(patentId, access.usageCount || 0);
      
      // Create economic reward record
      const reward = await storage.addEconomicReward({
        userId: req.userId!,
        heroId,
        rewardType: 'patent_licensing',
        amount: economicValue * quantity,
        quantity,
        patentId,
        transactionData: {
          usageType,
          patentNumber: patent.patentNumber,
          environmentalImpact: patent.environmentalImpact
        }
      });
      
      // Update user patent access usage count
      await storage.updatePatentUsage(req.userId!, patentId, access.usageCount + quantity);
      
      res.json({
        reward,
        economicValue: economicValue * quantity,
        environmentalImpact: patent.environmentalImpact,
        newUsageCount: access.usageCount + quantity
      });
    } catch (error) {
      console.error('Failed to use patent:', error);
      res.status(500).json({ error: "Failed to use patent" });
    }
  });

  // Environmental Battle routes
  app.post("/api/battles", authenticate, async (req: AuthRequest, res) => {
    try {
      const { heroId, threatType, threatLevel, outcome, economicValue, environmentalImpact, duration, experienceGained } = req.body;
      
      const battle = await storage.recordEnvironmentalBattle({
        userId: req.userId!,
        heroId,
        threatType,
        threatLevel,
        outcome,
        economicValue,
        environmentalImpact,
        duration,
        experienceGained
      });
      
      // Update user economic stats if victory
      if (outcome === 'victory') {
        await storage.updateUserEconomicStats(req.userId!, {
          totalEconomicValue: economicValue,
          environmentalThreatsDefeated: 1
        });
      }
      
      res.json(battle);
    } catch (error) {
      console.error('Failed to record battle:', error);
      res.status(500).json({ error: "Failed to record battle" });
    }
  });

  app.get("/api/battles/history", authenticate, async (req: AuthRequest, res) => {
    try {
      const battles = await storage.getUserBattleHistory(req.userId!);
      res.json(battles);
    } catch (error) {
      console.error('Failed to get battle history:', error);
      res.status(500).json({ error: "Failed to retrieve battle history" });
    }
  });

  // Economic Rewards routes
  app.get("/api/rewards", authenticate, async (req: AuthRequest, res) => {
    try {
      const rewards = await storage.getUserEconomicRewards(req.userId!);
      res.json(rewards);
    } catch (error) {
      console.error('Failed to get economic rewards:', error);
      res.status(500).json({ error: "Failed to retrieve economic rewards" });
    }
  });

  app.post("/api/rewards", authenticate, async (req: AuthRequest, res) => {
    try {
      const { heroId, rewardType, amount, quantity, patentId, battleId, transactionData } = req.body;
      
      const reward = await storage.addEconomicReward({
        userId: req.userId!,
        heroId,
        rewardType,
        amount,
        quantity,
        patentId,
        battleId,
        transactionData
      });
      
      res.json(reward);
    } catch (error) {
      console.error('Failed to add economic reward:', error);
      res.status(500).json({ error: "Failed to add economic reward" });
    }
  });

  app.get("/api/stats/economic", authenticate, async (req: AuthRequest, res) => {
    try {
      const stats = await storage.getUserEconomicStats(req.userId!);
      if (!stats) {
        // Create initial stats if they don't exist
        const newStats = await storage.updateUserEconomicStats(req.userId!, {
          totalCarbonCredits: 0,
          totalPlasticConverted: 0,
          totalEnergyGenerated: 0,
          totalPatentLicensing: 0,
          totalEconomicValue: 0,
          carbonTonsSequestered: 0,
          environmentalThreatsDefeated: 0,
          patentsUnlocked: 0
        });
        return res.json(newStats);
      }
      res.json(stats);
    } catch (error) {
      console.error('Failed to get economic stats:', error);
      res.status(500).json({ error: "Failed to retrieve economic stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
