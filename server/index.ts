import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { initializePatents, storage } from "./storage";

const app = express();
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
    const requiredEnvVars = ['DATABASE_URL'];
    const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.error('❌ CRITICAL CONFIGURATION ERROR: Missing required environment variables:');
      missingVars.forEach(varName => {
        console.error(`   - ${varName}`);
      });
      console.error('🚨 Application cannot start safely without these variables.');
      process.exit(1);
    }
    
    // JWT_SECRET validation with development fallback but production warning
    if (!process.env.JWT_SECRET) {
      if (process.env.NODE_ENV === 'production') {
        console.error('❌ CRITICAL SECURITY ERROR: JWT_SECRET is required in production');
        process.exit(1);
      } else {
        console.warn('⚠️  WARNING: JWT_SECRET not set - using development fallback');
        console.warn('🚨 NEVER deploy to production without setting JWT_SECRET!');
        process.env.JWT_SECRET = 'dev-gxcoin-jwt-secret-' + Date.now();
      }
    }
    
    console.log('✅ Production configuration validated successfully');
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
