import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import Client from "./models/Client";
import mongoose from "mongoose";

export async function registerRoutes(app: Express): Promise<Server> {
  // Root endpoint - API status
  app.get("/", (req, res) => {
    res.json({ message: "SalesTrackr API is running!" });
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
    res.json({ 
      status: "OK", 
      timestamp: new Date().toISOString(),
      database: dbStatus
    });
  });

  // Database test endpoint
  app.get("/api/test-db", async (req, res) => {
    try {
      // Create a test client
      const testClient = new Client({
        name: "Test Client Inc.",
        address: "123 Test Street, Test City",
        lat: 40.7128,
        lng: -74.0060,
        region: "North",
        hasComplaint: false,
        requestedVisit: true,
      });

      // Save to database
      const savedClient = await testClient.save();

      res.json({ 
        success: true, 
        message: "Database connection successful!",
        client: savedClient 
      });
    } catch (error: any) {
      console.error("Database test error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Database test failed",
        error: error.message 
      });
    }
  });

  // Additional API routes will go here
  // prefix all routes with /api

  // use storage to perform CRUD operations on the storage interface
  // e.g. storage.insertUser(user) or storage.getUserByUsername(username)

  const httpServer = createServer(app);

  return httpServer;
}
