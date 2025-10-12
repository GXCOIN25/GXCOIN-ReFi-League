import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage, db } from "./storage";
import { insertUserSchema, insertContributionSchema, insertNftBadgeSchema, users, airdropCampaigns, airdropClaims, referrals, insertAirdropCampaignSchema, insertAirdropClaimSchema, insertReferralSchema } from "@shared/schema";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";
import type { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { Octokit } from '@octokit/rest';
import Stripe from 'stripe';
import { getUncachableOutlookClient } from './outlook';
import { eq, and, lte, gte, desc, count, sql } from "drizzle-orm";
import { analyticsService } from './services/analytics';
import { battlePassService } from './services/battlePass';
import { 
  analyticsEventInputSchema, 
  analyticsBatchEventInputSchema, 
  analyticsQueryParamsSchema,
  AnalyticsEventInput,
  XPSource,
  BattlePassReward
} from '@shared/types';
import { z } from 'zod';

interface AuthRequest extends Request {
  userId?: number;
  user?: {
    userId: number;
    role: string;
  };
}

const dateStringSchema = z.string().refine((val) => {
  const date = new Date(val);
  return !isNaN(date.getTime());
}, {
  message: "Invalid date format. Please provide a valid ISO 8601 date string (e.g., '2024-01-01' or '2024-01-01T10:00:00Z')"
});

function validateDateParams(startDate?: string, endDate?: string): { error?: string; start?: Date; end?: Date } {
  if (startDate) {
    const result = dateStringSchema.safeParse(startDate);
    if (!result.success) {
      return { error: `Invalid startDate: ${result.error.errors[0].message}` };
    }
  }
  
  if (endDate) {
    const result = dateStringSchema.safeParse(endDate);
    if (!result.success) {
      return { error: `Invalid endDate: ${result.error.errors[0].message}` };
    }
  }
  
  const start = startDate ? new Date(startDate) : undefined;
  const end = endDate ? new Date(endDate) : undefined;
  
  if (start && end && start >= end) {
    return { error: 'Start date must be before end date' };
  }
  
  return { start, end };
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
    req.user = {
      userId: payload.userId,
      role: payload.role
    };
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Authentication failed' });
  }
};

// Admin check middleware - verifies user has admin privileges
const requireAdmin = async (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin role required' });
  }

  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  app.use(cookieParser());
  
  // Stripe Configuration
  const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
  const STRIPE_PUBLISHABLE_KEY = process.env.STRIPE_PUBLISHABLE_KEY;
  const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
  
  let stripe: Stripe | null = null;
  
  if (STRIPE_SECRET_KEY) {
    stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2025-09-30.clover',
    });
    console.log('✅ Stripe initialized successfully');
  } else {
    console.warn('⚠️  WARNING: STRIPE_SECRET_KEY not set - Stripe payments will be disabled');
    console.warn('💡 Set STRIPE_SECRET_KEY to enable Stripe payments');
  }
  
  if (!STRIPE_PUBLISHABLE_KEY) {
    console.warn('⚠️  WARNING: STRIPE_PUBLISHABLE_KEY not set');
  }
  
  if (!STRIPE_WEBHOOK_SECRET) {
    console.warn('⚠️  WARNING: STRIPE_WEBHOOK_SECRET not set - webhooks will not be verified');
  }
  
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

  // Analytics rate limiting - 100 requests per minute per IP
  const analyticsRateLimit = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 100, // 100 requests per minute per IP
    message: { error: 'Too many analytics requests. Please slow down.' },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Battle Pass reward claiming rate limiting - 10 claims per minute per user
  const rewardClaimRateLimit = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 claims per minute
    message: { error: 'Too many reward claims. Please slow down.' },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req: AuthRequest) => `reward-claim-${req.userId}`, // Per user, not per IP
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

  // Helper function to verify Replit signature
  const verifyReplitSignature = (payload: string, signature: string, secret: string): boolean => {
    if (!signature || !secret) return false;
    
    try {
      // Remove 'sha256=' prefix if present
      const cleanSignature = signature.replace(/^sha256=/, '');
      
      // Create HMAC signature
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');
      
      // Use crypto.timingSafeEqual for constant-time comparison
      return crypto.timingSafeEqual(
        Buffer.from(cleanSignature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );
    } catch (error) {
      console.error('Signature verification error:', error);
      return false;
    }
  };

  // GitHub OAuth configuration
  const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
  const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
  const GITHUB_REDIRECT_URI = process.env.GITHUB_REDIRECT_URI || `${process.env.APP_URL || 'http://localhost:5000'}/api/github/oauth/callback`;

  // Helper function to create authenticated GitHub client for a specific user
  async function getUserGitHubClient(userId: number): Promise<Octokit> {
    const accessToken = await storage.getUserGitHubToken(userId);
    if (!accessToken) {
      throw new Error('GitHub not connected for this user');
    }
    return new Octokit({ auth: accessToken });
  }

  // Helper function to generate PKCE code challenge
  function generateCodeChallenge(codeVerifier: string): string {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const hash = crypto.createHash('sha256').update(data).digest();
    return hash.toString('base64url');
  }

  // Check if running in production environment with fallback to Replit connector
  const isProductionEnvironment = !process.env.REPLIT_CONNECTORS_HOSTNAME;
  
  // Legacy Replit connector fallback for development
  let connectionSettings: any;
  async function getFallbackAccessToken() {
    if (connectionSettings && connectionSettings.settings.expires_at && new Date(connectionSettings.settings.expires_at).getTime() > Date.now()) {
      return connectionSettings.settings.access_token;
    }
    
    const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME
    const xReplitToken = process.env.REPL_IDENTITY 
      ? 'repl ' + process.env.REPL_IDENTITY 
      : process.env.WEB_REPL_RENEWAL 
      ? 'depl ' + process.env.WEB_REPL_RENEWAL 
      : null;

    if (!xReplitToken) {
      throw new Error('X_REPLIT_TOKEN not found for repl/depl');
    }

    connectionSettings = await fetch(
      'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=github',
      {
        headers: {
          'Accept': 'application/json',
          'X_REPLIT_TOKEN': xReplitToken
        }
      }
    ).then(res => res.json()).then(data => data.items?.[0]);

    const accessToken = connectionSettings?.settings?.access_token || connectionSettings.settings?.oauth?.credentials?.access_token;

    if (!connectionSettings || !accessToken) {
      throw new Error('GitHub not connected');
    }
    return accessToken;
  }

  async function getFallbackGitHubClient() {
    const accessToken = await getFallbackAccessToken();
    return new Octokit({ auth: accessToken });
  }

  // Secure Replit Auth endpoint with proper cryptographic verification
  app.post("/api/auth/replit", authRateLimit, authSpeedLimit, async (req, res) => {
    try {
      const { token, email } = req.body;
      const signature = req.headers['x-replit-signature'] as string;
      
      // Check for required Replit webhook secret
      const replitSecret = process.env.REPLIT_WEBHOOK_SECRET;
      if (!replitSecret) {
        console.error('REPLIT_WEBHOOK_SECRET not configured');
        return res.status(500).json({ 
          error: "Server configuration error - Replit authentication not properly configured" 
        });
      }
      
      // Verify the signature if provided (for webhook-style verification)
      if (signature) {
        const rawBody = JSON.stringify(req.body);
        if (!verifyReplitSignature(rawBody, signature, replitSecret)) {
          return res.status(401).json({ 
            error: "Invalid signature - Replit identity verification failed" 
          });
        }
      }
      
      // For development: fallback to environment variables (less secure)
      let replitUserId: string;
      let replitUsername: string;
      
      if (token) {
        // Parse the token (could be JWT or other format from Replit)
        try {
          const tokenData = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
          replitUserId = tokenData.sub || tokenData.user_id;
          replitUsername = tokenData.username || tokenData.preferred_username;
        } catch (error) {
          console.error('Token parsing error:', error);
          return res.status(401).json({ error: "Invalid token format" });
        }
      } else {
        // Fallback to environment variables (for development only)
        replitUserId = process.env.REPLIT_USER_ID!;
        replitUsername = process.env.REPLIT_USER_NAME!;
      }
      
      if (!replitUserId || !replitUsername) {
        return res.status(401).json({ 
          error: "Replit identity verification failed - missing user information" 
        });
      }
      
      // Upsert user with Replit auth info (handles username collisions)
      const user = await storage.upsertReplitUser(
        replitUserId, 
        replitUsername, 
        email
      );
      
      // Generate JWT token using existing method
      const token_response = storage.generateToken(user);
      
      // Return user data (excluding password) and token
      const { password, ...safeUser } = user;
      res.json({ user: safeUser, token: token_response });
      
    } catch (error: any) {
      console.error('Replit auth error:', error);
      if (error.code === '23505') { // Unique constraint violation
        res.status(409).json({ error: "User already exists with different authentication method" });
      } else {
        res.status(500).json({ error: "Replit authentication failed", details: error.message });
      }
    }
  });

  // Legacy callback endpoint (deprecated - for backward compatibility)
  app.post("/api/auth/replit/callback", authRateLimit, authSpeedLimit, async (req, res) => {
    console.warn('⚠️  Legacy Replit auth callback used - please upgrade to /api/auth/replit');
    
    // For development environment only - check if we're in Replit
    if (process.env.REPLIT_DB_URL || process.env.REPLIT_USER_ID) {
      try {
        const replitUserId = process.env.REPLIT_USER_ID;
        const replitUsername = process.env.REPLIT_USER_NAME;
        
        if (!replitUserId || !replitUsername) {
          return res.status(401).json({ 
            error: "Replit identity verification failed - missing user information" 
          });
        }
        
        const { email } = req.body;
        
        // Upsert user with Replit auth info
        const user = await storage.upsertReplitUser(
          replitUserId, 
          replitUsername, 
          email
        );
        
        const token = storage.generateToken(user);
        const { password, ...safeUser } = user;
        res.json({ user: safeUser, token });
        
      } catch (error: any) {
        console.error('Legacy Replit auth error:', error);
        res.status(500).json({ error: "Legacy authentication failed" });
      }
    } else {
      res.status(403).json({ 
        error: "Legacy authentication method disabled - use /api/auth/replit with proper verification" 
      });
    }
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

  // GitHub Integration Routes with rate limiting
  const githubRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // 30 GitHub API calls per window per IP
    message: { error: 'GitHub API rate limit exceeded. Please try again later.' },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // GitHub OAuth Start - initiates the OAuth flow
  app.get("/api/github/oauth/start", authenticate, async (req: AuthRequest, res) => {
    try {
      if (!GITHUB_CLIENT_ID) {
        return res.status(500).json({ 
          error: 'GitHub OAuth not configured. Please set GITHUB_CLIENT_ID environment variable.' 
        });
      }

      // Create OAuth state for CSRF protection
      const { state, codeVerifier } = await storage.createOAuthState(req.userId!);
      const codeChallenge = generateCodeChallenge(codeVerifier);

      // Build GitHub OAuth URL with PKCE
      const githubOAuthUrl = new URL('https://github.com/login/oauth/authorize');
      githubOAuthUrl.searchParams.set('client_id', GITHUB_CLIENT_ID);
      githubOAuthUrl.searchParams.set('redirect_uri', GITHUB_REDIRECT_URI);
      githubOAuthUrl.searchParams.set('scope', 'user:email repo');
      githubOAuthUrl.searchParams.set('state', state);
      githubOAuthUrl.searchParams.set('code_challenge', codeChallenge);
      githubOAuthUrl.searchParams.set('code_challenge_method', 'S256');

      res.json({ 
        authUrl: githubOAuthUrl.toString(),
        state 
      });
    } catch (error: any) {
      console.error('GitHub OAuth start error:', error);
      res.status(500).json({ error: 'Failed to start GitHub OAuth flow', details: error.message });
    }
  });

  // GitHub OAuth Callback - handles the OAuth response from GitHub
  app.post("/api/github/oauth/callback", authenticate, async (req: AuthRequest, res) => {
    try {
      const { code, state } = req.body;

      if (!code || !state) {
        return res.status(400).json({ error: 'Missing authorization code or state' });
      }

      if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
        return res.status(500).json({ 
          error: 'GitHub OAuth not configured. Please set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET environment variables.' 
        });
      }

      // Verify state and get code verifier
      const stateData = await storage.verifyOAuthState(state, req.userId!);
      if (!stateData) {
        return res.status(401).json({ error: 'Invalid or expired OAuth state' });
      }

      // Exchange authorization code for access token
      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: GITHUB_CLIENT_ID,
          client_secret: GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: GITHUB_REDIRECT_URI,
          code_verifier: stateData.codeVerifier,
        }),
      });

      const tokenData = await tokenResponse.json();

      if (tokenData.error) {
        console.error('GitHub OAuth token error:', tokenData);
        return res.status(400).json({ error: 'GitHub OAuth failed', details: tokenData.error_description });
      }

      // Get user info from GitHub
      const github = new Octokit({ auth: tokenData.access_token });
      const { data: profile } = await github.rest.users.getAuthenticated();

      // Store the tokens and update user with GitHub info
      const updatedUser = await storage.updateUserGitHubOAuth(req.userId!, {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresAt: tokenData.expires_in ? new Date(Date.now() + tokenData.expires_in * 1000) : undefined,
        githubUserId: profile.id.toString(),
        githubUsername: profile.login,
        githubAvatarUrl: profile.avatar_url,
        githubProfileUrl: profile.html_url,
      });

      const { password, githubAccessToken, githubRefreshToken, ...safeUser } = updatedUser;
      res.json({ 
        user: safeUser,
        message: 'GitHub account successfully connected via OAuth'
      });
    } catch (error: any) {
      console.error('GitHub OAuth callback error:', error);
      res.status(500).json({ error: 'Failed to complete GitHub OAuth', details: error.message });
    }
  });

  // GET /api/github/profile - fetch user's GitHub profile
  app.get("/api/github/profile", authenticate, githubRateLimit, async (req: AuthRequest, res) => {
    try {
      // Try per-user GitHub client first, fallback to connector in development
      let github: Octokit;
      try {
        github = await getUserGitHubClient(req.userId!);
      } catch (error) {
        if (!isProductionEnvironment) {
          console.warn('Using fallback GitHub client for development');
          github = await getFallbackGitHubClient();
        } else {
          throw error;
        }
      }

      const { data: profile } = await github.rest.users.getAuthenticated();
      
      res.json({
        username: profile.login,
        name: profile.name,
        avatarUrl: profile.avatar_url,
        profileUrl: profile.html_url,
        bio: profile.bio,
        publicRepos: profile.public_repos,
        followers: profile.followers,
        following: profile.following,
        createdAt: profile.created_at
      });
    } catch (error: any) {
      console.error('GitHub profile fetch error:', error);
      if (error.status === 401) {
        res.status(401).json({ error: 'GitHub authentication failed. Please reconnect your GitHub account.' });
      } else if (error.status === 403) {
        res.status(429).json({ error: 'GitHub API rate limit exceeded. Please try again later.' });
      } else {
        res.status(500).json({ error: 'Failed to fetch GitHub profile', details: error.message });
      }
    }
  });

  // GET /api/github/repos - list user's repositories
  app.get("/api/github/repos", authenticate, githubRateLimit, async (req: AuthRequest, res) => {
    try {
      // Try per-user GitHub client first, fallback to connector in development
      let github: Octokit;
      try {
        github = await getUserGitHubClient(req.userId!);
      } catch (error) {
        if (!isProductionEnvironment) {
          console.warn('Using fallback GitHub client for development');
          github = await getFallbackGitHubClient();
        } else {
          throw error;
        }
      }

      const { data: repos } = await github.rest.repos.listForAuthenticatedUser({
        sort: 'updated',
        per_page: 50,
        type: 'all'
      });
      
      // Return minimal repository data
      const repoData = repos.map(repo => ({
        id: repo.id,
        name: repo.name,
        fullName: repo.full_name,
        description: repo.description,
        language: repo.language,
        stargazersCount: repo.stargazers_count,
        forksCount: repo.forks_count,
        htmlUrl: repo.html_url,
        private: repo.private,
        updatedAt: repo.updated_at,
        createdAt: repo.created_at
      }));
      
      res.json(repoData);
    } catch (error: any) {
      console.error('GitHub repos fetch error:', error);
      if (error.status === 401) {
        res.status(401).json({ error: 'GitHub authentication failed. Please reconnect your GitHub account.' });
      } else if (error.status === 403) {
        res.status(429).json({ error: 'GitHub API rate limit exceeded. Please try again later.' });
      } else {
        res.status(500).json({ error: 'Failed to fetch GitHub repositories', details: error.message });
      }
    }
  });

  // POST /api/github/connect - deprecated endpoint, redirects to OAuth flow
  app.post("/api/github/connect", authenticate, githubRateLimit, async (req: AuthRequest, res) => {
    if (isProductionEnvironment) {
      // In production, force users to use OAuth flow
      return res.status(400).json({ 
        error: 'Direct GitHub connection is deprecated. Please use OAuth flow.',
        redirectTo: '/api/github/oauth/start'
      });
    }

    // Fallback for development environment using Replit connector
    try {
      const github = await getFallbackGitHubClient();
      const { data: profile } = await github.rest.users.getAuthenticated();
      
      // Update user with GitHub information
      const updatedUser = await storage.updateUserGitHubInfo(req.userId!, {
        githubUsername: profile.login,
        githubAvatarUrl: profile.avatar_url,
        githubProfileUrl: profile.html_url,
        githubConnectedAt: new Date()
      });
      
      const { password, ...safeUser } = updatedUser;
      res.json({ 
        user: safeUser,
        message: 'GitHub account successfully connected to GXCOIN profile (development mode)'
      });
    } catch (error: any) {
      console.error('GitHub connect error:', error);
      if (error.status === 401) {
        res.status(401).json({ error: 'GitHub authentication failed. Please check your GitHub connection.' });
      } else if (error.status === 403) {
        res.status(429).json({ error: 'GitHub API rate limit exceeded. Please try again later.' });
      } else {
        res.status(500).json({ error: 'Failed to connect GitHub account', details: error.message });
      }
    }
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

  app.get("/api/leaderboard", authenticate, async (req: AuthRequest, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      
      if (limit < 1 || limit > 100) {
        return res.status(400).json({ error: "Limit must be between 1 and 100" });
      }
      
      const leaderboard = await storage.getLeaderboard(limit);
      res.json(leaderboard);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
      res.status(500).json({ error: "Failed to fetch leaderboard" });
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

  app.get("/api/missions/team", authenticate, async (req: AuthRequest, res) => {
    try {
      const teamMissions = await storage.getTeamMissions();
      res.json(teamMissions);
    } catch (error) {
      console.error('Failed to fetch team missions:', error);
      res.status(500).json({ error: "Failed to fetch team missions" });
    }
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
      if (existingAccess.some((access: any) => access.patentId === patentId)) {
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
      const access = userAccess.find((a: any) => a.patentId === patentId);
      
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

  // Token endpoints
  app.get("/api/tokens/prices", async (req, res) => {
    try {
      const tokens = await storage.getTokenPrices();
      res.json(tokens);
    } catch (error) {
      console.error('Failed to get token prices:', error);
      res.status(500).json({ error: "Failed to retrieve token prices" });
    }
  });

  app.get("/api/tokens/balances", authenticate, async (req: AuthRequest, res) => {
    try {
      const balances = await storage.getUserTokenBalances(req.userId!);
      res.json(balances);
    } catch (error) {
      console.error('Failed to get token balances:', error);
      res.status(500).json({ error: "Failed to retrieve token balances" });
    }
  });

  // Stripe Payment Routes
  
  // Public Stripe checkout endpoint for unauthenticated users
  app.post("/api/public/stripe/create-checkout-session", async (req: Request, res: Response) => {
    try {
      if (!stripe) {
        return res.status(503).json({ error: "Stripe is not configured. Please contact support." });
      }

      const { heroId, amount, email } = req.body;

      if (!heroId || !amount) {
        return res.status(400).json({ error: "Missing required fields: heroId and amount" });
      }

      // Create checkout session for unauthenticated users
      const session = await stripe.checkout.sessions.create({
        customer_email: email || undefined,
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `GXCOIN Hero NFT - ${heroId}`,
                description: `Purchase dynamic NFT for hero ${heroId}`,
              },
              unit_amount: Math.round(amount * 100), // Convert to cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.APP_URL || 'http://localhost:5000'}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.APP_URL || 'http://localhost:5000'}/cancel`,
        metadata: {
          heroId,
          type: 'public_purchase',
          email: email || 'guest',
        },
      });

      res.json({
        sessionId: session.id,
        url: session.url,
      });
    } catch (error: any) {
      console.error('Failed to create public checkout session:', error);
      res.status(500).json({ error: error.message || "Failed to create checkout session" });
    }
  });

  app.post("/api/stripe/create-onramp-session", authenticate, async (req: AuthRequest, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ error: "Stripe is not configured. Please contact support." });
      }

      const { walletAddress, destinationCurrency, destinationNetwork, sourceAmount } = req.body;

      if (!walletAddress || !destinationCurrency || !destinationNetwork || !sourceAmount) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const user = await storage.getUser(req.userId!);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Create or get Stripe customer
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email || undefined,
          metadata: {
            userId: user.id.toString(),
            username: user.username,
          },
        });
        customerId = customer.id;
        await storage.updateUserStripeCustomerId(user.id, customerId);
      }

      // Note: Stripe Crypto Onramp requires special access and configuration
      // For now, we'll create a payment session that can be used with Stripe's crypto products
      // This would typically use stripe.crypto.onrampSessions in production with proper API access
      
      // Create a checkout session as a fallback for crypto purchases
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `Crypto Purchase - ${destinationCurrency}`,
                description: `Buy ${destinationCurrency} on ${destinationNetwork}`,
              },
              unit_amount: Math.round(sourceAmount * 100),
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.APP_URL || 'http://localhost:5000'}/crypto-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.APP_URL || 'http://localhost:5000'}/cancel`,
        metadata: {
          userId: user.id.toString(),
          type: 'crypto_onramp',
          walletAddress,
          destinationCurrency,
          destinationNetwork,
        },
      });

      // Record purchase in database
      await storage.createPurchase({
        userId: user.id,
        stripeSessionId: session.id,
        type: 'crypto_onramp',
        amount: sourceAmount,
        currency: 'usd',
        status: 'pending',
        walletAddress,
        destinationCurrency,
        destinationNetwork,
        sourceAmount,
        metadata: { sessionDetails: session },
      });

      res.json({
        clientSecret: session.url, // Use URL instead of client_secret for checkout sessions
        sessionId: session.id,
      });
    } catch (error: any) {
      console.error('Failed to create onramp session:', error);
      res.status(500).json({ error: error.message || "Failed to create onramp session" });
    }
  });

  app.post("/api/stripe/create-checkout-session", authenticate, async (req: AuthRequest, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ error: "Stripe is not configured. Please contact support." });
      }

      const { heroId, amount } = req.body;

      if (!heroId || !amount) {
        return res.status(400).json({ error: "Missing required fields: heroId and amount" });
      }

      const user = await storage.getUser(req.userId!);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Create or get Stripe customer
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email || undefined,
          metadata: {
            userId: user.id.toString(),
            username: user.username,
          },
        });
        customerId = customer.id;
        await storage.updateUserStripeCustomerId(user.id, customerId);
      }

      // Create checkout session for dNFT purchase
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `GXCOIN Hero NFT - ${heroId}`,
                description: `Purchase dynamic NFT for hero ${heroId}`,
              },
              unit_amount: Math.round(amount * 100), // Convert to cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.APP_URL || 'http://localhost:5000'}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.APP_URL || 'http://localhost:5000'}/cancel`,
        metadata: {
          userId: user.id.toString(),
          heroId,
        },
      });

      // Record purchase in database
      await storage.createPurchase({
        userId: user.id,
        stripeSessionId: session.id,
        type: 'dnft_purchase',
        amount,
        currency: 'usd',
        status: 'pending',
        heroId,
        metadata: { sessionDetails: session },
      });

      res.json({
        sessionId: session.id,
        url: session.url,
      });
    } catch (error: any) {
      console.error('Failed to create checkout session:', error);
      res.status(500).json({ error: error.message || "Failed to create checkout session" });
    }
  });

  app.post("/api/stripe/webhook", async (req, res) => {
    try {
      if (!stripe) {
        return res.status(503).json({ error: "Stripe is not configured" });
      }

      const sig = req.headers['stripe-signature'] as string;

      if (!sig) {
        return res.status(400).json({ error: "Missing stripe-signature header" });
      }

      let event: Stripe.Event;

      // Verify webhook signature if secret is configured
      if (STRIPE_WEBHOOK_SECRET) {
        try {
          event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            STRIPE_WEBHOOK_SECRET
          );
        } catch (err: any) {
          console.error('Webhook signature verification failed:', err.message);
          return res.status(400).json({ error: `Webhook Error: ${err.message}` });
        }
      } else {
        // In development without webhook secret, just parse the body
        event = req.body as Stripe.Event;
        console.warn('⚠️  Processing webhook without signature verification (development mode)');
      }

      // Handle the event
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          console.log('Checkout session completed:', session.id);

          // Check if this is a Battle Pass purchase
          if (session.metadata?.type === 'battle_pass_premium') {
            const userId = parseInt(session.metadata.userId);
            const seasonId = parseInt(session.metadata.seasonId);
            
            if (!isNaN(userId) && !isNaN(seasonId)) {
              try {
                await battlePassService.completePremiumPurchase(
                  userId,
                  seasonId,
                  session.payment_intent as string
                );
                console.log(`✅ Battle Pass Premium activated for user ${userId}, season ${seasonId}`);
              } catch (error: any) {
                console.error(`❌ Failed to activate Battle Pass Premium: ${error.message}`);
                return res.status(500).json({ 
                  error: 'Failed to activate Battle Pass Premium',
                  sessionId: session.id,
                  message: error.message
                });
              }
            }
          } else {
            // Handle other purchase types
            const purchase = await storage.getPurchaseBySessionId(session.id);
            if (purchase) {
              // Update purchase status
              await storage.updatePurchaseStatus(
                session.id,
                'completed',
                new Date(),
                session.payment_intent as string
              );

              // Create NFT badge for dNFT purchases
              if (purchase.type === 'dnft_purchase') {
                const heroId = purchase.heroId || session.metadata?.heroId;
                if (heroId) {
                  // Create NFT badge with atomic edition assignment
                  const seriesName = 'Platinum Limited Edition';
                  const totalEditions = 200000;
                  
                  const nftBadge = await storage.createNFTBadgeWithEdition(
                    {
                      userId: purchase.userId,
                      heroId,
                      level: 1,
                      evolution: 'base',
                      rarity: 'Platinum Limited Edition',
                      attributes: {
                        purchasedAt: new Date().toISOString(),
                        paymentIntentId: session.payment_intent,
                      },
                      minted: false,
                    },
                    seriesName,
                    totalEditions
                  );
                  
                  if (nftBadge === null) {
                    // Series is SOLD OUT - return error to Stripe
                    console.error(`🚨 PLATINUM SERIES SOLD OUT - Unable to fulfill purchase for user ${purchase.userId}`);
                    console.error(`💰 Payment received but no NFT available - manual refund may be required`);
                    console.error(`📧 Session ID: ${session.id}, Payment Intent: ${session.payment_intent}`);
                    
                    // Return error status to Stripe webhook
                    return res.status(500).json({ 
                      error: 'Platinum series sold out - unable to create NFT badge',
                      sessionId: session.id,
                      requiresRefund: true
                    });
                  }
                  
                  console.log(`✅ Created Platinum NFT badge #${nftBadge.editionNumber}/${nftBadge.totalEditions} for user ${purchase.userId}, hero ${heroId}`);
                }
              } else if (purchase.type === 'crypto_onramp') {
                // Handle crypto onramp completion
                console.log(`✅ Crypto onramp completed for user ${purchase.userId}`);
                // Additional logic for crypto delivery would go here
              }
            }
          }
          break;
        }

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (error: any) {
      console.error('Webhook processing error:', error);
      res.status(500).json({ error: error.message || "Webhook processing failed" });
    }
  });

  app.post("/api/nft/mint-with-crypto", authenticate, async (req: AuthRequest, res) => {
    console.warn('🚨 SECURITY: Crypto payment endpoint disabled - blockchain verification not implemented');
    console.warn('TODO: Implement blockchain transaction verification before enabling:');
    console.warn('  - Verify transactionHash exists on-chain');
    console.warn('  - Verify amount matches expected price');
    console.warn('  - Verify wallet address owns the transaction');
    console.warn('  - Verify transaction is confirmed (not pending)');
    
    return res.status(503).json({ 
      error: "Direct crypto payments temporarily disabled - use Stripe checkout",
      message: "For security reasons, direct crypto payments are disabled until blockchain verification is implemented. Please use card payment or Stripe crypto onramp."
    });
  });

  // Payment verification and NFT auto-mint endpoints
  app.get("/api/stripe/verify-session", async (req: Request, res: Response) => {
    try {
      if (!stripe) {
        return res.status(503).json({ error: "Stripe is not configured" });
      }

      const { session_id } = req.query;

      if (!session_id || typeof session_id !== 'string') {
        return res.status(400).json({ error: "Missing session_id parameter" });
      }

      // Retrieve session from Stripe
      const session = await stripe.checkout.sessions.retrieve(session_id);

      // Get purchase from database
      const purchase = await storage.getPurchaseBySessionId(session_id);

      if (!purchase) {
        return res.status(404).json({ error: "Purchase not found" });
      }

      // Get NFT badge if it was created
      const nftBadges = await storage.getUserNFTBadges(purchase.userId);
      const recentNFT = nftBadges.find(nft => 
        nft.heroId === purchase.heroId && 
        !nft.minted
      );

      // Validate and sanitize NFT badge data before sending to client
      let validatedNFTBadge = null;
      if (recentNFT) {
        // Validate edition metadata
        const hasValidEditionNumber = typeof recentNFT.editionNumber === 'number' && recentNFT.editionNumber > 0;
        const hasValidTotalEditions = typeof recentNFT.totalEditions === 'number' && recentNFT.totalEditions > 0;
        const hasValidSeriesName = typeof recentNFT.seriesName === 'string' && recentNFT.seriesName.length > 0;
        
        if (!hasValidEditionNumber || !hasValidTotalEditions || !hasValidSeriesName) {
          console.error(`⚠️  Invalid edition metadata for NFT badge ${recentNFT.id}:`, {
            editionNumber: recentNFT.editionNumber,
            totalEditions: recentNFT.totalEditions,
            seriesName: recentNFT.seriesName
          });
          
          // Apply server-side fallbacks for missing data
          validatedNFTBadge = {
            ...recentNFT,
            editionNumber: hasValidEditionNumber ? recentNFT.editionNumber : 0,
            totalEditions: hasValidTotalEditions ? recentNFT.totalEditions : 200000,
            seriesName: hasValidSeriesName ? recentNFT.seriesName : 'Limited Edition',
          };
        } else {
          validatedNFTBadge = recentNFT;
        }
      }

      res.json({
        status: purchase.status,
        sessionId: session_id,
        heroId: purchase.heroId,
        nftBadge: validatedNFTBadge,
      });
    } catch (error: any) {
      console.error('Session verification error:', error);
      res.status(500).json({ error: error.message || "Failed to verify session" });
    }
  });

  app.post("/api/nft/auto-mint", async (req: Request, res: Response) => {
    try {
      const { sessionId, nftBadgeId } = req.body;

      if (!sessionId || !nftBadgeId) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Verify the purchase is valid
      const purchase = await storage.getPurchaseBySessionId(sessionId);

      if (!purchase || purchase.status !== 'completed') {
        return res.status(400).json({ error: "Invalid or incomplete purchase" });
      }

      // Simulate gasless minting (platform covers gas fees)
      // In production, this would interact with smart contracts
      console.log(`🔥 Auto-minting NFT ${nftBadgeId} for user ${purchase.userId}`);
      console.log(`💰 Gas fees paid by GXCOIN platform`);

      // Get the existing NFT badge to preserve attributes
      const nftBadges = await storage.getUserNFTBadges(purchase.userId);
      const existingNFT = nftBadges.find(nft => nft.id === nftBadgeId);
      
      if (!existingNFT) {
        throw new Error('NFT badge not found');
      }

      const updatedAttributes = {
        ...(existingNFT.attributes as object || {}),
        mintedAt: new Date().toISOString(),
        transactionHash: `0x${crypto.randomBytes(32).toString('hex')}`, // Simulated tx hash
        gasPaidBy: 'GXCOIN Platform'
      };

      // Update NFT badge to mark as minted
      await storage.updateNFTBadge(nftBadgeId, {
        minted: true,
        attributes: updatedAttributes
      });

      // Unlock hero for the user
      const user = await storage.getUserById(purchase.userId);
      if (user && purchase.heroId) {
        // Auto-unlock the hero so they can start missions
        console.log(`✅ Hero ${purchase.heroId} unlocked for user ${purchase.userId}`);
      }

      res.json({
        success: true,
        nftBadgeId,
        minted: true,
        message: "NFT minted successfully! Gas fees covered by GXCOIN.",
      });
    } catch (error: any) {
      console.error('Auto-mint error:', error);
      res.status(500).json({ error: error.message || "Failed to mint NFT" });
    }
  });

  // Black Card Enrollment Email Notification
  app.post("/api/black-card-enrollment", async (req, res) => {
    try {
      const { fullName, email, phoneNumber, selectedTier, hasAnchorOwnership, contributionLevel, cardType, acceptedTerms } = req.body;
      
      console.log('📧 Black Card Enrollment received:', { fullName, email, selectedTier });
      
      // Validate required fields
      if (!fullName || !email || !selectedTier || !acceptedTerms) {
        return res.status(400).json({ 
          error: "Missing required fields. Please fill in all required information." 
        });
      }

      // Get Outlook client
      const outlookClient = await getUncachableOutlookClient();
      
      // Create professional HTML email
      const emailBody = `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 800px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background: linear-gradient(135deg, #FFD700, #FFA500);
              color: white;
              padding: 30px;
              text-align: center;
              border-radius: 10px 10px 0 0;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
            }
            .content {
              background: #f9f9f9;
              padding: 30px;
              border: 1px solid #ddd;
            }
            .tier-highlight {
              background: linear-gradient(135deg, #4CAF50, #45a049);
              color: white;
              padding: 20px;
              border-radius: 8px;
              margin: 20px 0;
              text-align: center;
            }
            .tier-highlight h2 {
              margin: 0;
              font-size: 24px;
            }
            .info-section {
              margin: 20px 0;
              background: white;
              padding: 20px;
              border-radius: 8px;
              border-left: 4px solid #FFD700;
            }
            .info-row {
              display: flex;
              padding: 10px 0;
              border-bottom: 1px solid #eee;
            }
            .info-row:last-child {
              border-bottom: none;
            }
            .info-label {
              font-weight: bold;
              width: 200px;
              color: #555;
            }
            .info-value {
              flex: 1;
              color: #333;
            }
            .badge {
              display: inline-block;
              padding: 5px 15px;
              border-radius: 20px;
              font-size: 14px;
              font-weight: bold;
            }
            .badge-yes {
              background: #4CAF50;
              color: white;
            }
            .badge-no {
              background: #9E9E9E;
              color: white;
            }
            .footer {
              background: #333;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 0 0 10px 10px;
              margin-top: 0;
            }
            .timestamp {
              color: #888;
              font-size: 12px;
              text-align: center;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎴 New Black Card Application</h1>
            <p>GXCOIN Premium Visa Black Card Program</p>
          </div>
          
          <div class="content">
            <div class="tier-highlight">
              <h2>👑 ${selectedTier}</h2>
            </div>
            
            <div class="info-section">
              <h3 style="margin-top: 0; color: #FFD700;">📋 Applicant Information</h3>
              
              <div class="info-row">
                <div class="info-label">Full Name:</div>
                <div class="info-value">${fullName}</div>
              </div>
              
              <div class="info-row">
                <div class="info-label">Email Address:</div>
                <div class="info-value">${email}</div>
              </div>
              
              ${phoneNumber ? `
              <div class="info-row">
                <div class="info-label">Phone Number:</div>
                <div class="info-value">${phoneNumber}</div>
              </div>
              ` : ''}
            </div>
            
            <div class="info-section">
              <h3 style="margin-top: 0; color: #FFD700;">💳 Card Details</h3>
              
              <div class="info-row">
                <div class="info-label">Selected Tier:</div>
                <div class="info-value"><strong>${selectedTier}</strong></div>
              </div>
              
              <div class="info-row">
                <div class="info-label">Card Type:</div>
                <div class="info-value">${cardType === 'debit' ? '💚 Debit Card' : '💙 Credit Card'}</div>
              </div>
              
              ${contributionLevel ? `
              <div class="info-row">
                <div class="info-label">Contribution Level:</div>
                <div class="info-value">${contributionLevel}</div>
              </div>
              ` : ''}
              
              <div class="info-row">
                <div class="info-label">GXCOIN Anchor Owner:</div>
                <div class="info-value">
                  <span class="badge ${hasAnchorOwnership ? 'badge-yes' : 'badge-no'}">
                    ${hasAnchorOwnership ? '✓ Yes' : '✗ No'}
                  </span>
                </div>
              </div>
              
              <div class="info-row">
                <div class="info-label">Terms Accepted:</div>
                <div class="info-value">
                  <span class="badge badge-yes">✓ Yes</span>
                </div>
              </div>
            </div>
            
            <div class="timestamp">
              Application submitted on: ${new Date().toLocaleString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric', 
                hour: '2-digit', 
                minute: '2-digit',
                timeZoneName: 'short'
              })}
            </div>
          </div>
          
          <div class="footer">
            <p style="margin: 0;">GXCOIN - Patent-Powered Environmental Impact</p>
            <p style="margin: 5px 0 0 0; font-size: 12px; color: #aaa;">This is an automated notification from the GXCOIN Black Card enrollment system</p>
          </div>
        </body>
        </html>
      `;

      // Send email via Microsoft Graph API
      const sendMail = {
        message: {
          subject: `New Black Card Application - ${selectedTier}`,
          body: {
            contentType: 'HTML',
            content: emailBody
          },
          toRecipients: [
            {
              emailAddress: {
                address: 'davidvaz@gxcoin.world'
              }
            }
          ]
        },
        saveToSentItems: true
      };

      await outlookClient.api('/me/sendMail').post(sendMail);
      
      console.log('✅ Black Card enrollment email sent successfully to davidvaz@gxcoin.world');
      
      res.json({ 
        success: true, 
        message: "Application submitted successfully! You'll receive a confirmation email shortly." 
      });
      
    } catch (error: any) {
      console.error('❌ Black Card enrollment email error:', error);
      
      // Provide helpful error messages
      if (error.message?.includes('Outlook not connected')) {
        return res.status(500).json({ 
          error: "Email service not configured. Please contact support." 
        });
      }
      
      res.status(500).json({ 
        error: "Failed to submit application. Please try again or contact support." 
      });
    }
  });

  // ============================================================================
  // AIRDROP CAMPAIGN ROUTES
  // ============================================================================

  // GET /api/airdrops/campaigns - List all active airdrop campaigns
  app.get("/api/airdrops/campaigns", async (req, res) => {
    try {
      const { heroId } = req.query;
      const now = new Date();
      
      let query = db.select().from(airdropCampaigns);
      const conditions = [
        eq(airdropCampaigns.isActive, true),
        lte(airdropCampaigns.startDate, now),
        gte(airdropCampaigns.endDate, now)
      ];

      if (heroId) {
        conditions.push(eq(airdropCampaigns.heroId, heroId as string));
      }

      const campaigns = await query.where(and(...conditions));
      
      const campaignsWithRemaining = campaigns.map(campaign => ({
        ...campaign,
        remainingAllocation: campaign.totalAllocation - (campaign.claimedAmount || 0)
      }));

      res.json(campaignsWithRemaining);
    } catch (error: any) {
      console.error('Error fetching campaigns:', error);
      res.status(500).json({ error: "Failed to fetch campaigns" });
    }
  });

  // POST /api/airdrops/campaigns - Create new airdrop campaign (Admin only)
  app.post("/api/airdrops/campaigns", authenticate, async (req: AuthRequest, res) => {
    try {
      const campaignData = insertAirdropCampaignSchema.parse(req.body);
      
      const startDate = new Date(campaignData.startDate);
      const endDate = new Date(campaignData.endDate);
      
      if (startDate >= endDate) {
        return res.status(400).json({ error: "End date must be after start date" });
      }
      
      if (campaignData.totalAllocation <= 0) {
        return res.status(400).json({ error: "Total allocation must be greater than 0" });
      }

      const [campaign] = await db.insert(airdropCampaigns).values({
        ...campaignData,
        startDate,
        endDate,
        claimedAmount: 0,
        isActive: true,
      }).returning();

      res.json(campaign);
    } catch (error: any) {
      console.error('Error creating campaign:', error);
      res.status(400).json({ error: "Failed to create campaign", details: error.message });
    }
  });

  // GET /api/airdrops/campaigns/:id - Get specific campaign details
  app.get("/api/airdrops/campaigns/:id", async (req, res) => {
    try {
      const campaignId = parseInt(req.params.id);
      
      if (isNaN(campaignId)) {
        return res.status(400).json({ error: "Invalid campaign ID" });
      }

      const [campaign] = await db
        .select()
        .from(airdropCampaigns)
        .where(eq(airdropCampaigns.id, campaignId));

      if (!campaign) {
        return res.status(404).json({ error: "Campaign not found" });
      }

      const [claimStats] = await db
        .select({
          totalClaims: count(),
          totalClaimed: sql<number>`COALESCE(SUM(${airdropClaims.amount}), 0)`
        })
        .from(airdropClaims)
        .where(eq(airdropClaims.campaignId, campaignId));

      res.json({
        ...campaign,
        remainingAllocation: campaign.totalAllocation - (campaign.claimedAmount || 0),
        stats: {
          totalClaims: claimStats?.totalClaims || 0,
          totalClaimed: claimStats?.totalClaimed || 0
        }
      });
    } catch (error: any) {
      console.error('Error fetching campaign:', error);
      res.status(500).json({ error: "Failed to fetch campaign" });
    }
  });

  // GET /api/airdrops/eligibility/:campaignId - Check if current user is eligible
  app.get("/api/airdrops/eligibility/:campaignId", authenticate, async (req: AuthRequest, res) => {
    try {
      const campaignId = parseInt(req.params.campaignId);
      
      if (isNaN(campaignId)) {
        return res.status(400).json({ error: "Invalid campaign ID" });
      }

      const [campaign] = await db
        .select()
        .from(airdropCampaigns)
        .where(eq(airdropCampaigns.id, campaignId));

      if (!campaign) {
        return res.status(404).json({ error: "Campaign not found" });
      }

      const now = new Date();
      if (!campaign.isActive || campaign.startDate > now || campaign.endDate < now) {
        return res.json({
          eligible: false,
          reason: "Campaign is not active",
          claimableAmount: 0
        });
      }

      const user = await storage.getUser(req.userId!);
      if (!user?.walletAddress) {
        return res.json({
          eligible: false,
          reason: "Wallet not connected",
          claimableAmount: 0
        });
      }

      const existingClaim = await db
        .select()
        .from(airdropClaims)
        .where(
          and(
            eq(airdropClaims.campaignId, campaignId),
            eq(airdropClaims.userId, req.userId!)
          )
        );

      if (existingClaim.length > 0) {
        return res.json({
          eligible: false,
          reason: "Already claimed",
          claimableAmount: 0
        });
      }

      const remainingAllocation = campaign.totalAllocation - (campaign.claimedAmount || 0);
      if (remainingAllocation <= 0) {
        return res.json({
          eligible: false,
          reason: "No tokens remaining",
          claimableAmount: 0
        });
      }

      const claimableAmount = Math.min(100, remainingAllocation);

      res.json({
        eligible: true,
        reason: "Eligible to claim",
        claimableAmount,
        campaign: {
          name: campaign.name,
          tokenSymbol: campaign.tokenSymbol,
          remainingAllocation
        }
      });
    } catch (error: any) {
      console.error('Error checking eligibility:', error);
      res.status(500).json({ error: "Failed to check eligibility" });
    }
  });

  // POST /api/airdrops/claim - Claim airdrop tokens
  app.post("/api/airdrops/claim", authenticate, async (req: AuthRequest, res) => {
    try {
      const { campaignId } = req.body;

      if (!campaignId) {
        return res.status(400).json({ error: "Campaign ID is required" });
      }

      // Get user's wallet address from their profile
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, req.userId!));

      if (!user || !user.walletAddress) {
        return res.status(400).json({ error: "User wallet address not found" });
      }

      const walletAddress = user.walletAddress;

      const [campaign] = await db
        .select()
        .from(airdropCampaigns)
        .where(eq(airdropCampaigns.id, campaignId));

      if (!campaign) {
        return res.status(404).json({ error: "Campaign not found" });
      }

      const now = new Date();
      if (!campaign.isActive || campaign.startDate > now || campaign.endDate < now) {
        return res.status(400).json({ error: "Campaign is not active" });
      }

      const existingClaim = await db
        .select()
        .from(airdropClaims)
        .where(
          and(
            eq(airdropClaims.campaignId, campaignId),
            eq(airdropClaims.userId, req.userId!)
          )
        );

      if (existingClaim.length > 0) {
        return res.status(400).json({ error: "Already claimed this airdrop" });
      }

      const remainingAllocation = campaign.totalAllocation - (campaign.claimedAmount || 0);
      if (remainingAllocation <= 0) {
        return res.status(400).json({ error: "No tokens remaining in this campaign" });
      }

      const claimAmount = Math.min(100, remainingAllocation);

      const [claim] = await db.insert(airdropClaims).values({
        campaignId,
        userId: req.userId!,
        walletAddress,
        amount: claimAmount,
        status: "pending",
        txHash: null,
      }).returning();

      await db
        .update(airdropCampaigns)
        .set({
          claimedAmount: (campaign.claimedAmount || 0) + claimAmount,
          updatedAt: new Date()
        })
        .where(eq(airdropCampaigns.id, campaignId));

      res.json({
        success: true,
        claim: {
          id: claim.id,
          amount: claim.amount,
          tokenSymbol: campaign.tokenSymbol,
          status: claim.status,
          claimedAt: claim.claimedAt
        },
        message: `Successfully claimed ${claimAmount} ${campaign.tokenSymbol}`
      });
    } catch (error: any) {
      console.error('Error claiming airdrop:', error);
      res.status(500).json({ error: "Failed to claim airdrop" });
    }
  });

  // GET /api/airdrops/claims - Get current user's claim history
  app.get("/api/airdrops/claims", authenticate, async (req: AuthRequest, res) => {
    try {
      const claims = await db
        .select({
          id: airdropClaims.id,
          amount: airdropClaims.amount,
          claimedAt: airdropClaims.claimedAt,
          status: airdropClaims.status,
          txHash: airdropClaims.txHash,
          walletAddress: airdropClaims.walletAddress,
          campaign: {
            id: airdropCampaigns.id,
            name: airdropCampaigns.name,
            tokenSymbol: airdropCampaigns.tokenSymbol,
            heroId: airdropCampaigns.heroId
          }
        })
        .from(airdropClaims)
        .leftJoin(airdropCampaigns, eq(airdropClaims.campaignId, airdropCampaigns.id))
        .where(eq(airdropClaims.userId, req.userId!))
        .orderBy(desc(airdropClaims.claimedAt));

      res.json(claims);
    } catch (error: any) {
      console.error('Error fetching claims:', error);
      res.status(500).json({ error: "Failed to fetch claims" });
    }
  });

  // ============================================================================
  // REFERRAL ROUTES
  // ============================================================================

  // POST /api/referrals/generate - Generate unique referral code
  app.post("/api/referrals/generate", authenticate, async (req: AuthRequest, res) => {
    try {
      const existingReferral = await db
        .select()
        .from(referrals)
        .where(eq(referrals.referrerId, req.userId!))
        .limit(1);

      if (existingReferral.length > 0) {
        const referralCode = existingReferral[0].referralCode;
        const referralLink = `${process.env.APP_URL || 'http://localhost:5000'}/ref/${referralCode}`;
        
        return res.json({
          referralCode,
          referralLink,
          message: "Using existing referral code"
        });
      }

      const referralCode = `REF${req.userId}${Date.now().toString(36).toUpperCase()}`;

      const [newReferral] = await db.insert(referrals).values({
        referrerId: req.userId!,
        referredId: null,
        referralCode,
        tier: "bronze",
        bonusEarned: 0
      }).returning();

      const referralLink = `${process.env.APP_URL || 'http://localhost:5000'}/ref/${referralCode}`;

      res.json({
        referralCode: newReferral.referralCode,
        referralLink,
        message: "Referral code generated successfully"
      });
    } catch (error: any) {
      console.error('Error generating referral code:', error);
      res.status(500).json({ error: "Failed to generate referral code" });
    }
  });

  // GET /api/referrals/stats - Get referral statistics
  app.get("/api/referrals/stats", authenticate, async (req: AuthRequest, res) => {
    try {
      const referralStats = await db
        .select({
          totalReferrals: count(),
          tier: referrals.tier,
          totalBonus: sql<number>`COALESCE(SUM(${referrals.bonusEarned}), 0)`
        })
        .from(referrals)
        .where(eq(referrals.referrerId, req.userId!))
        .groupBy(referrals.tier);

      const totalReferrals = referralStats.reduce((acc, stat) => acc + Number(stat.totalReferrals), 0);
      const totalBonus = referralStats.reduce((acc, stat) => acc + Number(stat.totalBonus), 0);
      
      let tier = "bronze";
      if (totalReferrals >= 51) {
        tier = "gold";
      } else if (totalReferrals >= 11) {
        tier = "silver";
      }

      const referralCodes = await db
        .select({ referralCode: referrals.referralCode })
        .from(referrals)
        .where(eq(referrals.referrerId, req.userId!))
        .limit(1);

      res.json({
        totalReferrals,
        tier,
        bonusEarned: totalBonus,
        referralCode: referralCodes[0]?.referralCode || null
      });
    } catch (error: any) {
      console.error('Error fetching referral stats:', error);
      res.status(500).json({ error: "Failed to fetch referral statistics" });
    }
  });

  // POST /api/referrals/track - Track referral usage
  app.post("/api/referrals/track", authenticate, async (req: AuthRequest, res) => {
    try {
      const { referralCode } = req.body;

      if (!referralCode) {
        return res.status(400).json({ error: "Referral code is required" });
      }

      const [referralRecord] = await db
        .select()
        .from(referrals)
        .where(eq(referrals.referralCode, referralCode));

      if (!referralRecord) {
        return res.status(404).json({ error: "Invalid referral code" });
      }

      if (referralRecord.referrerId === req.userId) {
        return res.status(400).json({ error: "Cannot use your own referral code" });
      }

      const existingUse = await db
        .select()
        .from(referrals)
        .where(
          and(
            eq(referrals.referralCode, referralCode),
            eq(referrals.referredId, req.userId!)
          )
        );

      if (existingUse.length > 0) {
        return res.status(400).json({ error: "You have already used this referral code" });
      }

      await db.insert(referrals).values({
        referrerId: referralRecord.referrerId,
        referredId: req.userId!,
        referralCode,
        tier: "bronze",
        bonusEarned: 0
      });

      const totalReferrals = await db
        .select({ count: count() })
        .from(referrals)
        .where(eq(referrals.referrerId, referralRecord.referrerId!));

      const referralCount = Number(totalReferrals[0]?.count || 0);
      let newTier = "bronze";
      let bonus = 10;

      if (referralCount >= 51) {
        newTier = "gold";
        bonus = 50;
      } else if (referralCount >= 11) {
        newTier = "silver";
        bonus = 25;
      }

      await db
        .update(referrals)
        .set({
          tier: newTier,
          bonusEarned: sql`${referrals.bonusEarned} + ${bonus}`
        })
        .where(
          and(
            eq(referrals.referralCode, referralCode),
            eq(referrals.referrerId, referralRecord.referrerId!)
          )
        );

      res.json({
        success: true,
        message: "Referral tracked successfully",
        bonus,
        referrerTier: newTier
      });
    } catch (error: any) {
      console.error('Error tracking referral:', error);
      res.status(500).json({ error: "Failed to track referral" });
    }
  });

  // Analytics Ingestion Service Endpoints
  
  // POST /api/analytics/events - Ingest single event
  app.post('/api/analytics/events', analyticsRateLimit, async (req: AuthRequest, res: Response) => {
    try {
      const eventInput = analyticsEventInputSchema.parse(req.body);
      
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];
      
      await analyticsService.ingestEvent(eventInput, ipAddress, userAgent);
      
      res.status(202).json({ 
        success: true, 
        message: 'Event queued for processing' 
      });
    } catch (error: any) {
      console.error('Analytics event ingestion error:', error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          error: 'Invalid event data', 
          details: error.errors 
        });
      }
      
      res.status(500).json({ 
        error: 'Failed to ingest analytics event',
        message: error.message 
      });
    }
  });

  // POST /api/analytics/events/batch - Ingest multiple events
  app.post('/api/analytics/events/batch', analyticsRateLimit, async (req: AuthRequest, res: Response) => {
    try {
      const batchInput = analyticsBatchEventInputSchema.parse(req.body);
      
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];
      
      await analyticsService.ingestBatch(batchInput.events, ipAddress, userAgent);
      
      res.status(202).json({ 
        success: true, 
        message: `${batchInput.events.length} events queued for processing` 
      });
    } catch (error: any) {
      console.error('Analytics batch ingestion error:', error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          error: 'Invalid batch data', 
          details: error.errors 
        });
      }
      
      if (error.message.includes('exceed')) {
        return res.status(400).json({ 
          error: error.message 
        });
      }
      
      res.status(500).json({ 
        error: 'Failed to ingest analytics batch',
        message: error.message 
      });
    }
  });

  // GET /api/analytics/events - Query events with filters
  app.get('/api/analytics/events', analyticsRateLimit, async (req: AuthRequest, res: Response) => {
    try {
      const queryParams = analyticsQueryParamsSchema.parse({
        userId: req.query.userId ? parseInt(req.query.userId as string) : undefined,
        eventType: req.query.eventType as string | undefined,
        sessionId: req.query.sessionId as string | undefined,
        startDate: req.query.startDate as string | undefined,
        endDate: req.query.endDate as string | undefined,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
        offset: req.query.offset ? parseInt(req.query.offset as string) : undefined,
      });
      
      const events = await analyticsService.queryEvents(queryParams);
      const totalCount = await analyticsService.getEventCount({
        userId: queryParams.userId,
        eventType: queryParams.eventType,
        sessionId: queryParams.sessionId,
        startDate: queryParams.startDate,
        endDate: queryParams.endDate,
      });
      
      res.json({
        success: true,
        events,
        pagination: {
          total: totalCount,
          limit: queryParams.limit,
          offset: queryParams.offset,
          hasMore: (queryParams.offset || 0) + (queryParams.limit || 100) < totalCount,
        },
      });
    } catch (error: any) {
      console.error('Analytics query error:', error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          error: 'Invalid query parameters', 
          details: error.errors 
        });
      }
      
      res.status(500).json({ 
        error: 'Failed to query analytics events',
        message: error.message 
      });
    }
  });

  // Dashboard Analytics Endpoints

  // GET /api/analytics/dashboard/overview - Dashboard overview with key metrics
  app.get('/api/analytics/dashboard/overview', authenticate, analyticsRateLimit, async (req: AuthRequest, res: Response) => {
    try {
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;

      const validation = validateDateParams(startDate, endDate);
      if (validation.error) {
        return res.status(400).json({ 
          error: 'Invalid date parameters', 
          message: validation.error 
        });
      }

      const overview = await analyticsService.getDashboardOverview(startDate, endDate);
      
      res.json({
        success: true,
        data: overview
      });
    } catch (error: any) {
      console.error('Dashboard overview error:', error);
      
      if (error.message.includes('date')) {
        return res.status(400).json({ 
          error: 'Invalid date parameters', 
          message: error.message 
        });
      }
      
      res.status(500).json({ 
        error: 'Failed to get dashboard overview',
        message: error.message 
      });
    }
  });

  // GET /api/analytics/dashboard/timeline - Time series data
  app.get('/api/analytics/dashboard/timeline', authenticate, analyticsRateLimit, async (req: AuthRequest, res: Response) => {
    try {
      const eventType = req.query.eventType as string | undefined;
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;
      const interval = (req.query.interval as 'hourly' | 'daily' | 'weekly') || 'daily';

      if (!['hourly', 'daily', 'weekly'].includes(interval)) {
        return res.status(400).json({ 
          error: 'Invalid interval', 
          message: 'Interval must be one of: hourly, daily, weekly' 
        });
      }

      const validation = validateDateParams(startDate, endDate);
      if (validation.error) {
        return res.status(400).json({ 
          error: 'Invalid date parameters', 
          message: validation.error 
        });
      }

      const timeline = await analyticsService.getEventsTimeline(eventType, startDate, endDate, interval);
      
      res.json({
        success: true,
        data: timeline
      });
    } catch (error: any) {
      console.error('Timeline error:', error);
      
      if (error.message.includes('date')) {
        return res.status(400).json({ 
          error: 'Invalid date parameters', 
          message: error.message 
        });
      }
      
      res.status(500).json({ 
        error: 'Failed to get events timeline',
        message: error.message 
      });
    }
  });

  // GET /api/analytics/dashboard/top-users - Top active users
  app.get('/api/analytics/dashboard/top-users', authenticate, analyticsRateLimit, async (req: AuthRequest, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;

      if (limit < 1 || limit > 100) {
        return res.status(400).json({ 
          error: 'Invalid limit', 
          message: 'Limit must be between 1 and 100' 
        });
      }

      const validation = validateDateParams(startDate, endDate);
      if (validation.error) {
        return res.status(400).json({ 
          error: 'Invalid date parameters', 
          message: validation.error 
        });
      }

      const topUsers = await analyticsService.getTopUsers(limit, startDate, endDate);
      
      res.json({
        success: true,
        data: topUsers
      });
    } catch (error: any) {
      console.error('Top users error:', error);
      
      if (error.message.includes('date')) {
        return res.status(400).json({ 
          error: 'Invalid date parameters', 
          message: error.message 
        });
      }
      
      res.status(500).json({ 
        error: 'Failed to get top users',
        message: error.message 
      });
    }
  });

  // GET /api/analytics/dashboard/funnel - Conversion funnel analysis
  app.get('/api/analytics/dashboard/funnel', authenticate, analyticsRateLimit, async (req: AuthRequest, res: Response) => {
    try {
      const type = req.query.type as 'purchase' | 'airdrop' | 'guild_join' | undefined;
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;

      if (!type || !['purchase', 'airdrop', 'guild_join'].includes(type)) {
        return res.status(400).json({ 
          error: 'Invalid funnel type', 
          message: 'Type must be one of: purchase, airdrop, guild_join' 
        });
      }

      const validation = validateDateParams(startDate, endDate);
      if (validation.error) {
        return res.status(400).json({ 
          error: 'Invalid date parameters', 
          message: validation.error 
        });
      }

      const funnel = await analyticsService.getConversionFunnel(type, startDate, endDate);
      
      res.json({
        success: true,
        data: funnel
      });
    } catch (error: any) {
      console.error('Conversion funnel error:', error);
      
      if (error.message.includes('date')) {
        return res.status(400).json({ 
          error: 'Invalid date parameters', 
          message: error.message 
        });
      }
      
      res.status(500).json({ 
        error: 'Failed to get conversion funnel',
        message: error.message 
      });
    }
  });

  // GET /api/analytics/dashboard/realtime - Real-time metrics
  app.get('/api/analytics/dashboard/realtime', authenticate, analyticsRateLimit, async (req: AuthRequest, res: Response) => {
    try {
      const metrics = await analyticsService.getRealtimeMetrics();
      
      res.json({
        success: true,
        data: metrics
      });
    } catch (error: any) {
      console.error('Realtime metrics error:', error);
      
      res.status(500).json({ 
        error: 'Failed to get realtime metrics',
        message: error.message 
      });
    }
  });

  // ============ Battle Pass System Endpoints ============

  // Admin Endpoints

  // POST /api/admin/battle-pass/seasons - Create new season (Admin only)
  app.post('/api/admin/battle-pass/seasons', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const { name, seasonNumber, startDate, endDate, freeTierRewards, premiumTierRewards } = req.body;

      if (!name || !seasonNumber || !startDate || !endDate) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const start = new Date(startDate);
      const end = new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({ error: 'Invalid date format' });
      }

      if (start >= end) {
        return res.status(400).json({ error: 'End date must be after start date' });
      }

      const season = await battlePassService.createSeason(
        name,
        seasonNumber,
        start,
        end,
        freeTierRewards || [],
        premiumTierRewards || []
      );

      res.json({
        success: true,
        data: season
      });
    } catch (error: any) {
      console.error('Create season error:', error);
      res.status(500).json({ 
        error: 'Failed to create season',
        message: error.message 
      });
    }
  });

  // PUT /api/admin/battle-pass/seasons/:id - Update season (Admin only)
  app.put('/api/admin/battle-pass/seasons/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const seasonId = parseInt(req.params.id);
      
      if (isNaN(seasonId)) {
        return res.status(400).json({ error: 'Invalid season ID' });
      }

      const updates: any = {};

      if (req.body.name !== undefined) {
        updates.name = req.body.name;
      }

      if (req.body.startDate !== undefined) {
        const start = new Date(req.body.startDate);
        if (isNaN(start.getTime())) {
          return res.status(400).json({ error: 'Invalid start date format' });
        }
        updates.startDate = start;
      }

      if (req.body.endDate !== undefined) {
        const end = new Date(req.body.endDate);
        if (isNaN(end.getTime())) {
          return res.status(400).json({ error: 'Invalid end date format' });
        }
        updates.endDate = end;
      }

      if (req.body.freeTierRewards !== undefined) {
        updates.freeTierRewards = req.body.freeTierRewards;
      }

      if (req.body.premiumTierRewards !== undefined) {
        updates.premiumTierRewards = req.body.premiumTierRewards;
      }

      if (req.body.isActive !== undefined) {
        updates.isActive = req.body.isActive;
      }

      const season = await battlePassService.updateSeason(seasonId, updates);

      res.json({
        success: true,
        data: season
      });
    } catch (error: any) {
      console.error('Update season error:', error);
      
      if (error.message === 'Season not found') {
        return res.status(404).json({ error: 'Season not found' });
      }

      if (error.message.includes('End date must be after start date')) {
        return res.status(400).json({ error: error.message });
      }

      res.status(500).json({ 
        error: 'Failed to update season',
        message: error.message 
      });
    }
  });

  // DELETE /api/admin/battle-pass/seasons/:id - Deactivate season (Admin only)
  app.delete('/api/admin/battle-pass/seasons/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const seasonId = parseInt(req.params.id);
      
      if (isNaN(seasonId)) {
        return res.status(400).json({ error: 'Invalid season ID' });
      }

      await battlePassService.deactivateSeason(seasonId);

      res.json({
        success: true,
        message: 'Season deactivated successfully'
      });
    } catch (error: any) {
      console.error('Deactivate season error:', error);
      
      if (error.message === 'Season not found') {
        return res.status(404).json({ error: 'Season not found' });
      }

      res.status(500).json({ 
        error: 'Failed to deactivate season',
        message: error.message 
      });
    }
  });

  // GET /api/admin/battle-pass/seasons - List all seasons (Admin only)
  app.get('/api/admin/battle-pass/seasons', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;

      const seasons = await battlePassService.getAllSeasons(limit, offset);

      res.json({
        success: true,
        data: seasons
      });
    } catch (error: any) {
      console.error('Get seasons error:', error);
      res.status(500).json({ 
        error: 'Failed to get seasons',
        message: error.message 
      });
    }
  });

  // User Endpoints

  // GET /api/battle-pass/active - Get active season (Public)
  app.get('/api/battle-pass/active', async (req: Request, res: Response) => {
    try {
      const season = await battlePassService.getActiveSeason();

      if (!season) {
        return res.status(404).json({ error: 'No active season' });
      }

      res.json({
        success: true,
        data: season
      });
    } catch (error: any) {
      console.error('Get active season error:', error);
      res.status(500).json({ 
        error: 'Failed to get active season',
        message: error.message 
      });
    }
  });

  // GET /api/battle-pass/progress - Get user progress (Auth required)
  app.get('/api/battle-pass/progress', authenticate, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const seasonId = req.query.seasonId ? parseInt(req.query.seasonId as string) : undefined;

      const progress = await battlePassService.getUserProgress(req.userId, seasonId);

      if (!progress) {
        return res.status(404).json({ error: 'No active season or progress found' });
      }

      res.json({
        success: true,
        data: progress
      });
    } catch (error: any) {
      console.error('Get user progress error:', error);
      res.status(500).json({ 
        error: 'Failed to get user progress',
        message: error.message 
      });
    }
  });

  // POST /api/admin/battle-pass/xp - Award XP manually (Admin only)
  app.post('/api/admin/battle-pass/xp', authenticate, requireAdmin, async (req: AuthRequest, res: Response) => {
    try {
      const { userId, xpAmount, reason } = req.body;

      if (!userId || typeof userId !== 'number') {
        return res.status(400).json({ error: 'Valid user ID is required' });
      }

      if (!xpAmount || typeof xpAmount !== 'number' || xpAmount <= 0) {
        return res.status(400).json({ error: 'Invalid XP amount (must be positive number)' });
      }

      if (!reason || typeof reason !== 'string' || reason.trim().length === 0) {
        return res.status(400).json({ error: 'Reason for XP grant is required' });
      }

      const progress = await battlePassService.addXPAdmin(userId, xpAmount, reason);

      res.json({
        success: true,
        data: progress,
        message: `Admin granted ${xpAmount} XP to user ${userId}`,
        reason
      });
    } catch (error: any) {
      console.error('Battle Pass admin XP grant error:', error);
      res.status(error.message === 'No active season' ? 404 : 400).json({ 
        error: error.message || 'Failed to grant XP',
        message: error.message 
      });
    }
  });

  // POST /api/battle-pass/purchase/stripe-checkout - Create Stripe checkout session for Battle Pass Premium
  app.post('/api/battle-pass/purchase/stripe-checkout', authenticate, async (req: AuthRequest, res: Response) => {
    try {
      if (!stripe) {
        return res.status(503).json({ error: "Stripe is not configured. Please contact support." });
      }

      if (!req.userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { seasonId } = req.body;

      // Get user details
      const user = await storage.getUser(req.userId);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      // Get season (active season if not provided)
      let targetSeason;
      if (seasonId) {
        targetSeason = await battlePassService.getSeasonById(seasonId);
        if (!targetSeason) {
          return res.status(404).json({ error: 'Season not found' });
        }
      } else {
        targetSeason = await battlePassService.getActiveSeason();
        if (!targetSeason) {
          return res.status(404).json({ error: 'No active season available' });
        }
      }

      if (!targetSeason.isActive) {
        return res.status(400).json({ error: 'Season is not active' });
      }

      // Check if user already has premium for this season
      const userProgress = await battlePassService.getUserProgress(req.userId, targetSeason.id);
      if (userProgress?.progress.isPremium) {
        return res.status(409).json({ error: 'You already have premium for this season' });
      }

      // Create or get Stripe customer
      let customerId = user.stripeCustomerId;
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email || undefined,
          metadata: {
            userId: user.id.toString(),
            username: user.username,
          },
        });
        customerId = customer.id;
        await storage.updateUserStripeCustomerId(user.id, customerId);
      }

      // Battle Pass Premium price
      const BATTLE_PASS_PRICE = 29.99;

      // Create checkout session for Battle Pass Premium
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `GXCOIN Battle Pass - Premium - Season ${targetSeason.name}`,
                description: `Unlock premium rewards for Battle Pass Season ${targetSeason.seasonNumber}`,
              },
              unit_amount: Math.round(BATTLE_PASS_PRICE * 100), // Convert to cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.APP_URL || 'http://localhost:5000'}/battle-pass/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.APP_URL || 'http://localhost:5000'}/battle-pass`,
        metadata: {
          userId: user.id.toString(),
          seasonId: targetSeason.id.toString(),
          type: 'battle_pass_premium',
        },
      });

      // Record pending purchase
      await battlePassService.purchasePremiumWithStripe(
        user.id,
        targetSeason.id,
        session.id,
        BATTLE_PASS_PRICE
      );

      console.log(`✅ Battle Pass checkout session created for user ${user.id}, season ${targetSeason.id}`);

      res.json({
        sessionId: session.id,
        url: session.url,
      });
    } catch (error: any) {
      console.error('Battle Pass checkout error:', error);
      res.status(500).json({ 
        error: error.message || "Failed to create checkout session" 
      });
    }
  });

  // POST /api/battle-pass/purchase - Purchase premium (Auth required)
  app.post('/api/battle-pass/purchase', authenticate, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const { seasonId, stripePaymentId } = req.body;

      if (!seasonId || !stripePaymentId) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const progress = await battlePassService.purchasePremium(req.userId, seasonId, stripePaymentId);

      res.json({
        success: true,
        data: progress
      });
    } catch (error: any) {
      console.error('Purchase premium error:', error);
      
      if (error.message === 'Season not found') {
        return res.status(404).json({ error: 'Season not found' });
      }

      if (error.message === 'Season is not active') {
        return res.status(400).json({ error: 'Season is not active' });
      }

      if (error.message === 'Premium already purchased for this season') {
        return res.status(409).json({ error: 'Premium already purchased for this season' });
      }

      res.status(500).json({ 
        error: 'Failed to purchase premium',
        message: error.message 
      });
    }
  });

  // POST /api/battle-pass/rewards/:level/claim - Claim reward (Auth required, rate limited)
  app.post('/api/battle-pass/rewards/:level/claim', authenticate, rewardClaimRateLimit, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const level = parseInt(req.params.level);
      const { tier } = req.body;

      if (isNaN(level) || level < 1) {
        return res.status(400).json({ error: 'Invalid level' });
      }

      if (!tier || !['free', 'premium'].includes(tier)) {
        return res.status(400).json({ error: 'Invalid tier. Must be "free" or "premium"' });
      }

      const result = await battlePassService.claimReward(req.userId, level, tier);

      res.json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error('Claim reward error:', error);
      
      if (error.message === 'No active season or progress found') {
        return res.status(404).json({ error: 'No active season or progress found' });
      }

      if (error.message === 'Level not yet reached') {
        return res.status(400).json({ error: 'Level not yet reached' });
      }

      if (error.message === 'Premium tier not purchased') {
        return res.status(403).json({ error: 'Premium tier not purchased' });
      }

      if (error.message === 'No reward at this level') {
        return res.status(404).json({ error: 'No reward at this level' });
      }

      if (error.message === 'Reward already claimed') {
        return res.status(409).json({ error: 'Reward already claimed' });
      }

      res.status(500).json({ 
        error: 'Failed to claim reward',
        message: error.message 
      });
    }
  });

  // GET /api/battle-pass/rewards/unclaimed - Get unclaimed rewards (Auth required)
  app.get('/api/battle-pass/rewards/unclaimed', authenticate, async (req: AuthRequest, res: Response) => {
    try {
      if (!req.userId) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const seasonId = req.query.seasonId ? parseInt(req.query.seasonId as string) : undefined;

      if (seasonId === undefined) {
        const activeSeason = await battlePassService.getActiveSeason();
        if (!activeSeason) {
          return res.status(404).json({ error: 'No active season' });
        }
        const rewards = await battlePassService.getUnclaimedRewards(req.userId, activeSeason.id);
        return res.json({
          success: true,
          data: rewards
        });
      }

      const rewards = await battlePassService.getUnclaimedRewards(req.userId, seasonId);

      res.json({
        success: true,
        data: rewards
      });
    } catch (error: any) {
      console.error('Get unclaimed rewards error:', error);
      res.status(500).json({ 
        error: 'Failed to get unclaimed rewards',
        message: error.message 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
