import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import mongoose from "mongoose";
import session from "express-session";
import "./types";

// Load environment variables
dotenv.config();

// MongoDB Connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      log('⚠️  MONGODB_URI not found in environment variables. Running without database.');
      return;
    }

    await mongoose.connect(mongoURI);
    const dbName = mongoose.connection.db?.databaseName || 'unknown';
    log(`✅ MongoDB connected successfully to database: ${dbName}`);
    
    if (dbName === 'admin') {
      log('⚠️  WARNING: Connected to "admin" database. M0 Free Tier cannot write to this database!');
      log('⚠️  Fix: Add /salestrackr to your connection string before the ? character');
    }
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    log('⚠️  Server will continue running without database connection.');
    log('⚠️  To fix: Add 0.0.0.0/0 to Network Access in MongoDB Atlas.');
  }
};

// Connect to MongoDB (non-blocking)
connectDB();

const app = express();

// Security and CORS middleware
const isDev = app.get("env") === "development";
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        ...(isDev ? ["'unsafe-eval'", "'unsafe-inline'"] : [])
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'" // Required for CSS-in-JS and Vite HMR
      ],
      connectSrc: [
        "'self'",
        ...(isDev ? ["ws:", "wss:"] : []) // WebSocket for HMR
      ],
      imgSrc: ["'self'", "data:", "blob:"],
      fontSrc: ["'self'", "data:"],
    },
  },
}));
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true, // Allow cookies and session
}));

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

// Session middleware
// Note: In Replit, we're always on HTTPS (even in dev), so secure must be true
const isProduction = process.env.NODE_ENV === 'production';
const isReplit = process.env.REPL_ID !== undefined;
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction || isReplit, // Secure in production OR in Replit (which uses HTTPS)
    httpOnly: true,
    sameSite: isProduction ? 'strict' : 'lax', // 'lax' allows cookies in dev with CORS
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  },
  proxy: isReplit || isProduction, // Trust proxy in Replit/production
}));

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

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
