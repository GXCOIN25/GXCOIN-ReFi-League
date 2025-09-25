import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertContributionSchema, insertNftBadgeSchema } from "@shared/schema";
import cookieParser from "cookie-parser";
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
  
  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
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

  app.post("/api/auth/login", async (req, res) => {
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

  const httpServer = createServer(app);
  return httpServer;
}
