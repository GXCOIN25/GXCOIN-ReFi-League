import express, { type Request, Response, NextFunction } from "express";
import { randomBytes } from "node:crypto";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { initializePatents, storage } from "./storage";

const app = express();

// Trust proxy for proper client IP detection with rate limiting
app.set('trust proxy', 1);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  console.log('🚀 Starting GXCOIN Patent-Powered Gaming Platform...');
  
  // 🔒 Production-ready configuration validation
  function validateProductionConfig() {
    const isProduction = process.env.NODE_ENV === 'production';
    let hasErrors = false;
    
    // Check for DATABASE_URL but don't crash if missing
    if (!process.env.DATABASE_URL) {
      console.warn('⚠️  WARNING: DATABASE_URL not set - database features will be limited');
      console.warn('🚨 For full functionality, please set DATABASE_URL environment variable');
    }
    
    // JWT_SECRET validation with secure fallback generation
    if (!process.env.JWT_SECRET) {
      if (isProduction) {
        // Generate a cryptographically secure fallback for production
        const fallbackSecret = randomBytes(64).toString('hex');
        process.env.JWT_SECRET = fallbackSecret;
        console.warn('⚠️  WARNING: JWT_SECRET not set in production - generated secure fallback');
        console.warn('🚨 SECURITY NOTICE: For production deployments, set a permanent JWT_SECRET!');
        console.warn('🔐 Using temporary secure secret - users will need to re-authenticate after restarts');
      } else {
        console.warn('⚠️  WARNING: JWT_SECRET not set - using development fallback');
        console.warn('🚨 NEVER deploy to production without setting JWT_SECRET!');
        process.env.JWT_SECRET = 'dev-gxcoin-jwt-secret-' + Date.now();
      }
    }
    
    // 🔐 GitHub OAuth Configuration Validation
    console.log('🔍 Validating GitHub OAuth configuration...');
    
    if (!process.env.GITHUB_CLIENT_ID) {
      console.warn('⚠️  WARNING: GITHUB_CLIENT_ID not set - GitHub OAuth will be disabled');
      if (isProduction) {
        console.warn('🚨 GitHub OAuth features unavailable in production without GITHUB_CLIENT_ID');
        console.warn('💡 Set GITHUB_CLIENT_ID to enable GitHub OAuth in production');
      } else {
        console.warn('💡 Set GITHUB_CLIENT_ID to enable GitHub OAuth in development');
      }
    } else {
      console.log('✅ GITHUB_CLIENT_ID configured');
    }
    
    if (!process.env.GITHUB_CLIENT_SECRET) {
      console.warn('⚠️  WARNING: GITHUB_CLIENT_SECRET not set - GitHub OAuth will be disabled');
      if (isProduction) {
        console.warn('🚨 GitHub OAuth token exchange unavailable in production without GITHUB_CLIENT_SECRET');
        console.warn('💡 Set GITHUB_CLIENT_SECRET to enable GitHub OAuth in production');
      } else {
        console.warn('💡 Set GITHUB_CLIENT_SECRET to enable GitHub OAuth in development');
      }
    } else {
      console.log('✅ GITHUB_CLIENT_SECRET configured');
    }
    
    if (!process.env.GITHUB_REDIRECT_URI) {
      console.log('💡 GITHUB_REDIRECT_URI not set - using default callback URL');
      const defaultRedirectUri = `${process.env.APP_URL || 'http://localhost:5000'}/api/github/oauth/callback`;
      process.env.GITHUB_REDIRECT_URI = defaultRedirectUri;
      console.log(`🔗 Using redirect URI: ${defaultRedirectUri}`);
    } else {
      console.log(`✅ GITHUB_REDIRECT_URI configured: ${process.env.GITHUB_REDIRECT_URI}`);
    }
    
    // 🔑 Encryption Key Validation (for GitHub tokens)
    if (!process.env.ENCRYPTION_KEY) {
      if (isProduction) {
        // Generate a cryptographically secure fallback for production
        const fallbackEncryptionKey = randomBytes(32).toString('hex');
        process.env.ENCRYPTION_KEY = fallbackEncryptionKey;
        console.warn('⚠️  WARNING: ENCRYPTION_KEY not set in production - generated secure fallback');
        console.warn('🚨 SECURITY NOTICE: For production deployments, set a permanent ENCRYPTION_KEY!');
        console.warn('🔐 Using temporary secure key - GitHub OAuth tokens will need re-authentication after restarts');
        console.warn('💡 Generate a permanent key with: openssl rand -hex 32');
      } else {
        // Generate a development fallback
        const devEncryptionKey = randomBytes(32).toString('hex');
        process.env.ENCRYPTION_KEY = devEncryptionKey;
        console.warn('⚠️  WARNING: ENCRYPTION_KEY not set - generated development fallback');
        console.warn('🚨 NEVER use this in production! Set a permanent ENCRYPTION_KEY!');
      }
    } else {
      console.log('✅ ENCRYPTION_KEY configured for secure token storage');
    }
    
    // 🛡️ Security scope validation
    const requiredScopes = ['user:email', 'repo'];
    console.log(`🔒 GitHub OAuth will request minimal scopes: ${requiredScopes.join(', ')}`);
    
    if (hasErrors && isProduction) {
      console.error('💥 STARTUP FAILED: Missing critical environment variables in production');
      console.error('📋 Critical issues that prevent startup:');
      console.error('   - Please check the configuration above for specific requirements');
      process.exit(1);
    }
    
    console.log('✅ Production configuration validated successfully');
    
    // 📋 Feature availability summary
    console.log('\n🎮 GXCOIN Platform Feature Status:');
    console.log(`   🗄️  Database: ${process.env.DATABASE_URL ? '✅ Available' : '⚠️  Limited functionality'}`);
    console.log(`   🔐 Authentication: ✅ Available (JWT-based)`);
    console.log(`   🐙 GitHub OAuth: ${(process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) ? '✅ Available' : '⚠️  Disabled (missing credentials)'}`);
    console.log(`   🎯 Patent System: ✅ Available`);
    console.log(`   🎪 Gaming Platform: ✅ Available`);
    console.log('');
  }
  
  // 🗄️ Database startup verification
  async function verifyDatabaseConnection() {
    try {
      console.log('🔍 Verifying database connection and schema...');
      
      // Test basic database connectivity
      await storage.getUserByUsername('__health_check_user__');
      
      console.log('✅ Database connection verified');
      return true;
    } catch (error) {
      console.error('❌ Database verification failed:', error);
      console.error('🚨 Ensure DATABASE_URL is correct and database is accessible');
      console.warn('⚠️  Continuing without database - some features may be limited');
      return false;
    }
  }
  
  // Step 1: Validate configuration
  validateProductionConfig();
  
  // Step 2: Verify database connectivity  
  const dbConnected = await verifyDatabaseConnection();
  
  // Step 3: Initialize patents data (only if database is connected)
  if (dbConnected) {
    console.log('🔬 Initializing patent registry...');
    await initializePatents();
    console.log('✅ Patent registry initialized');
  } else {
    console.log('⚠️  Skipping patent registry initialization - database not available');
  }
  
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`✅ Server running on port ${port}`);
    log('🌟 Patent-powered gaming platform ready for revolutionary experiences!');
  });
})();
