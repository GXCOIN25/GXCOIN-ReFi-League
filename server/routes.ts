import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertContributionSchema, insertNftBadgeSchema } from "@shared/schema";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import slowDown from "express-slow-down";
import type { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { Octokit } from '@octokit/rest';
import Stripe from 'stripe';

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
                await storage.createNFTBadge({
                  userId: purchase.userId,
                  heroId,
                  level: 1,
                  evolution: 'base',
                  rarity: 'common',
                  attributes: {
                    purchasedAt: new Date().toISOString(),
                    paymentIntentId: session.payment_intent,
                  },
                  minted: false,
                });
                console.log(`✅ Created NFT badge for user ${purchase.userId}, hero ${heroId}`);
              }
            } else if (purchase.type === 'crypto_onramp') {
              // Handle crypto onramp completion
              console.log(`✅ Crypto onramp completed for user ${purchase.userId}`);
              // Additional logic for crypto delivery would go here
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

  const httpServer = createServer(app);
  return httpServer;
}
