import type { Express } from "express";
import { createServer, type Server } from "http";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import { requireAuth, requireAdmin } from "./middleware/auth";
import {
  registerSchema,
  loginSchema,
  createClientSchema,
  updateClientSchema,
  checkInSchema,
  checkOutSchema,
  createDepotSchema,
  updateDepotSchema,
  createMissedOrderSchema,
  createTrainingLogSchema,
  createProductComplaintSchema,
  updateProductComplaintSchema,
} from "../shared/schema";

// Import models
import User from "./models/User";
import Client from "./models/Client";
import Visit from "./models/Visit";
import Depot from "./models/Depot";
import MissedOrder from "./models/MissedOrder";
import TrainingLog from "./models/TrainingLog";
import ProductComplaint from "./models/ProductComplaint";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    const dbStatus = mongoose.connection.readyState === 1 ? "connected" : "disconnected";
    res.json({
      status: "OK",
      message: "SalesTrackr API is running!",
      timestamp: new Date().toISOString(),
      database: dbStatus
    });
  });

  // ===== AUTHENTICATION ENDPOINTS =====

  // Register new user
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = registerSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await User.findOne({ email: validatedData.email });
      if (existingUser) {
        return res.status(400).json({ error: "User already exists with this email" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);

      // Create user
      const user = new User({
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        role: validatedData.role || 'agent',
      });

      await user.save();

      // Set session to log user in immediately after registration
      req.session.userId = String(user._id);
      req.session.userRole = user.role;

      // Save the session before responding
      req.session.save((err) => {
        if (err) {
          console.error("Session save error during registration:", err);
          return res.status(500).json({ error: "Registration failed" });
        }

        // Return user without password
        const userResponse = {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        };

        res.status(201).json({ user: userResponse, message: "User registered successfully" });
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      console.error("Register error:", error);
      res.status(500).json({ error: "Registration failed" });
    }
  });

  // Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);

      // Find user
      const user = await User.findOne({ email: validatedData.email });
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(validatedData.password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Regenerate session to prevent session fixation attacks
      req.session.regenerate((err) => {
        if (err) {
          console.error("Session regeneration error:", err);
          return res.status(500).json({ error: "Login failed" });
        }

        // Store user in session
        req.session.userId = String(user._id);
        req.session.userRole = user.role;

        // Save the session before responding
        req.session.save((err) => {
          if (err) {
            console.error("Session save error:", err);
            return res.status(500).json({ error: "Login failed" });
          }

          // Return user without password
          const userResponse = {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
          };

          res.json({ user: userResponse, message: "Login successful" });
        });
      });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Logout
  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  // Get current user
  app.get("/api/auth/me", async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await User.findById(req.session.userId).select('-password');
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({ user });
    } catch (error: any) {
      console.error("Get user error:", error);
      res.status(500).json({ error: "Failed to get user" });
    }
  });

  // ===== CLIENT MANAGEMENT ENDPOINTS =====

  // Get all clients
  app.get("/api/clients", requireAuth, async (req, res) => {
    try {
      const { region, hasComplaint, requestedVisit } = req.query;
      const filter: any = {};

      if (region) filter.region = region;
      if (hasComplaint !== undefined) filter.hasComplaint = hasComplaint === 'true';
      if (requestedVisit !== undefined) filter.requestedVisit = requestedVisit === 'true';

      const clients = await Client.find(filter).sort({ name: 1 });
      res.json({ clients });
    } catch (error: any) {
      console.error("Get clients error:", error);
      res.status(500).json({ error: "Failed to get clients" });
    }
  });

  // Get single client
  app.get("/api/clients/:id", requireAuth, async (req, res) => {
    try {
      const client = await Client.findById(req.params.id);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
      res.json({ client });
    } catch (error: any) {
      console.error("Get client error:", error);
      res.status(500).json({ error: "Failed to get client" });
    }
  });

  // Create client
  app.post("/api/clients", requireAuth, async (req, res) => {
    try {
      const validatedData = createClientSchema.parse(req.body);
      const client = new Client(validatedData);
      await client.save();
      res.status(201).json({ client, message: "Client created successfully" });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      console.error("Create client error:", error);
      res.status(500).json({ error: "Failed to create client" });
    }
  });

  // Update client
  app.patch("/api/clients/:id", requireAuth, async (req, res) => {
    try {
      const validatedData = updateClientSchema.parse(req.body);
      const client = await Client.findByIdAndUpdate(
        req.params.id,
        validatedData,
        { new: true, runValidators: true }
      );

      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }

      res.json({ client, message: "Client updated successfully" });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      console.error("Update client error:", error);
      res.status(500).json({ error: "Failed to update client" });
    }
  });

  // Delete client
  app.delete("/api/clients/:id", requireAuth, async (req, res) => {
    try {
      const client = await Client.findByIdAndDelete(req.params.id);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
      res.json({ message: "Client deleted successfully" });
    } catch (error: any) {
      console.error("Delete client error:", error);
      res.status(500).json({ error: "Failed to delete client" });
    }
  });

  // ===== VISIT TRACKING ENDPOINTS =====

  // Get all visits
  app.get("/api/visits", requireAuth, async (req, res) => {
    try {
      const { agentId, clientId, active } = req.query;
      const filter: any = {};

      if (agentId) filter.agentId = agentId;
      if (clientId) filter.clientId = clientId;
      if (active === 'true') filter.checkOutTime = null;

      const visits = await Visit.find(filter)
        .populate('clientId', 'name address')
        .populate('agentId', 'name email')
        .sort({ checkInTime: -1 });

      res.json({ visits });
    } catch (error: any) {
      console.error("Get visits error:", error);
      res.status(500).json({ error: "Failed to get visits" });
    }
  });

  // Get active visit for current agent (must come before /:id route)
  app.get("/api/visits/active", requireAuth, async (req, res) => {
    try {
      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const visit = await Visit.findOne({
        agentId: req.session.userId,
        checkOutTime: null
      }).populate('clientId', 'name address');

      res.json({ visit: visit || null });
    } catch (error: any) {
      console.error("Get active visit error:", error);
      res.status(500).json({ error: "Failed to get active visit" });
    }
  });

  // Get single visit
  app.get("/api/visits/:id", requireAuth, async (req, res) => {
    try {
      const visit = await Visit.findById(req.params.id)
        .populate('clientId', 'name address')
        .populate('agentId', 'name email');

      if (!visit) {
        return res.status(404).json({ error: "Visit not found" });
      }

      res.json({ visit });
    } catch (error: any) {
      console.error("Get visit error:", error);
      res.status(500).json({ error: "Failed to get visit" });
    }
  });

  // Check in (start visit)
  app.post("/api/visits/check-in", requireAuth, async (req, res) => {
    try {
      const validatedData = checkInSchema.parse(req.body);

      if (!req.session.userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      // Check if client exists
      const client = await Client.findById(validatedData.clientId);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }

      // Check if there's already an active visit for this agent
      const activeVisit = await Visit.findOne({
        agentId: req.session.userId,
        checkOutTime: null
      });

      if (activeVisit) {
        return res.status(400).json({ error: "You have an active visit. Please check out first." });
      }

      // Create new visit
      const visit = new Visit({
        clientId: validatedData.clientId,
        agentId: req.session.userId,
        checkInTime: new Date(),
      });

      await visit.save();
      await visit.populate('clientId', 'name address');

      res.status(201).json({ visit, message: "Checked in successfully" });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      console.error("Check-in error:", error);
      res.status(500).json({ error: "Failed to check in" });
    }
  });

  // Check out (end visit)
  app.post("/api/visits/check-out", requireAuth, async (req, res) => {
    try {
      const validatedData = checkOutSchema.parse(req.body);

      const visit = await Visit.findById(validatedData.visitId);
      if (!visit) {
        return res.status(404).json({ error: "Visit not found" });
      }

      // Authorization check: ensure user owns this visit
      if (String(visit.agentId) !== req.session.userId) {
        return res.status(403).json({ error: "You can only check out your own visits" });
      }

      if (visit.checkOutTime) {
        return res.status(400).json({ error: "Visit already checked out" });
      }

      visit.checkOutTime = new Date();
      await visit.save();
      await visit.populate('clientId', 'name address');

      res.json({ visit, message: "Checked out successfully" });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      console.error("Check-out error:", error);
      res.status(500).json({ error: "Failed to check out" });
    }
  });

  // Get active visit for current user
  // ===== DEPOT MANAGEMENT ENDPOINTS =====

  // Get all depots
  app.get("/api/depots", requireAuth, async (req, res) => {
    try {
      const depots = await Depot.find().sort({ name: 1 });
      res.json({ depots });
    } catch (error: any) {
      console.error("Get depots error:", error);
      res.status(500).json({ error: "Failed to get depots" });
    }
  });

  // Get single depot
  app.get("/api/depots/:id", requireAuth, async (req, res) => {
    try {
      const depot = await Depot.findById(req.params.id);
      if (!depot) {
        return res.status(404).json({ error: "Depot not found" });
      }
      res.json({ depot });
    } catch (error: any) {
      console.error("Get depot error:", error);
      res.status(500).json({ error: "Failed to get depot" });
    }
  });

  // Create depot
  app.post("/api/depots", requireAuth, async (req, res) => {
    try {
      const validatedData = createDepotSchema.parse(req.body);
      const depot = new Depot(validatedData);
      await depot.save();
      res.status(201).json({ depot, message: "Depot created successfully" });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      console.error("Create depot error:", error);
      res.status(500).json({ error: "Failed to create depot" });
    }
  });

  // Update depot
  app.patch("/api/depots/:id", requireAuth, async (req, res) => {
    try {
      const validatedData = updateDepotSchema.parse(req.body);
      const depot = await Depot.findByIdAndUpdate(
        req.params.id,
        validatedData,
        { new: true, runValidators: true }
      );

      if (!depot) {
        return res.status(404).json({ error: "Depot not found" });
      }

      res.json({ depot, message: "Depot updated successfully" });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      console.error("Update depot error:", error);
      res.status(500).json({ error: "Failed to update depot" });
    }
  });

  // Delete depot
  app.delete("/api/depots/:id", requireAuth, async (req, res) => {
    try {
      const depot = await Depot.findByIdAndDelete(req.params.id);
      if (!depot) {
        return res.status(404).json({ error: "Depot not found" });
      }
      res.json({ message: "Depot deleted successfully" });
    } catch (error: any) {
      console.error("Delete depot error:", error);
      res.status(500).json({ error: "Failed to delete depot" });
    }
  });

  // ===== MISSED ORDERS ENDPOINTS =====

  // Get all missed orders
  app.get("/api/missed-orders", requireAuth, async (req, res) => {
    try {
      const { clientId } = req.query;
      const filter: any = {};
      if (clientId) filter.clientId = clientId;

      const missedOrders = await MissedOrder.find(filter)
        .populate('clientId', 'name address')
        .sort({ date: -1 });

      res.json({ missedOrders });
    } catch (error: any) {
      console.error("Get missed orders error:", error);
      res.status(500).json({ error: "Failed to get missed orders" });
    }
  });

  // Get single missed order
  app.get("/api/missed-orders/:id", requireAuth, async (req, res) => {
    try {
      const missedOrder = await MissedOrder.findById(req.params.id)
        .populate('clientId', 'name address');

      if (!missedOrder) {
        return res.status(404).json({ error: "Missed order not found" });
      }

      res.json({ missedOrder });
    } catch (error: any) {
      console.error("Get missed order error:", error);
      res.status(500).json({ error: "Failed to get missed order" });
    }
  });

  // Create missed order
  app.post("/api/missed-orders", requireAuth, async (req, res) => {
    try {
      const validatedData = createMissedOrderSchema.parse(req.body);
      const missedOrder = new MissedOrder({
        ...validatedData,
        date: validatedData.date ? new Date(validatedData.date) : new Date(),
      });
      await missedOrder.save();
      await missedOrder.populate('clientId', 'name address');

      res.status(201).json({ missedOrder, message: "Missed order created successfully" });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      console.error("Create missed order error:", error);
      res.status(500).json({ error: "Failed to create missed order" });
    }
  });

  // Delete missed order
  app.delete("/api/missed-orders/:id", requireAuth, async (req, res) => {
    try {
      const missedOrder = await MissedOrder.findByIdAndDelete(req.params.id);
      if (!missedOrder) {
        return res.status(404).json({ error: "Missed order not found" });
      }
      res.json({ message: "Missed order deleted successfully" });
    } catch (error: any) {
      console.error("Delete missed order error:", error);
      res.status(500).json({ error: "Failed to delete missed order" });
    }
  });

  // ===== TRAINING LOGS ENDPOINTS =====

  // Get all training logs
  app.get("/api/training-logs", requireAuth, async (req, res) => {
    try {
      const { agentId } = req.query;
      const filter: any = {};
      if (agentId) filter.agentId = agentId;

      const trainingLogs = await TrainingLog.find(filter)
        .populate('agentId', 'name email')
        .sort({ date: -1 });

      res.json({ trainingLogs });
    } catch (error: any) {
      console.error("Get training logs error:", error);
      res.status(500).json({ error: "Failed to get training logs" });
    }
  });

  // Get single training log
  app.get("/api/training-logs/:id", requireAuth, async (req, res) => {
    try {
      const trainingLog = await TrainingLog.findById(req.params.id)
        .populate('agentId', 'name email');

      if (!trainingLog) {
        return res.status(404).json({ error: "Training log not found" });
      }

      res.json({ trainingLog });
    } catch (error: any) {
      console.error("Get training log error:", error);
      res.status(500).json({ error: "Failed to get training log" });
    }
  });

  // Create training log
  app.post("/api/training-logs", requireAuth, async (req, res) => {
    try {
      const validatedData = createTrainingLogSchema.parse(req.body);
      const trainingLog = new TrainingLog({
        ...validatedData,
        date: validatedData.date ? new Date(validatedData.date) : new Date(),
      });
      await trainingLog.save();
      await trainingLog.populate('agentId', 'name email');

      res.status(201).json({ trainingLog, message: "Training log created successfully" });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      console.error("Create training log error:", error);
      res.status(500).json({ error: "Failed to create training log" });
    }
  });

  // Delete training log
  app.delete("/api/training-logs/:id", requireAuth, async (req, res) => {
    try {
      const trainingLog = await TrainingLog.findByIdAndDelete(req.params.id);
      if (!trainingLog) {
        return res.status(404).json({ error: "Training log not found" });
      }
      res.json({ message: "Training log deleted successfully" });
    } catch (error: any) {
      console.error("Delete training log error:", error);
      res.status(500).json({ error: "Failed to delete training log" });
    }
  });

  // ===== PRODUCT COMPLAINTS ENDPOINTS =====

  // Get all product complaints
  app.get("/api/product-complaints", requireAuth, async (req, res) => {
    try {
      const { clientId } = req.query;
      const filter: any = {};
      if (clientId) filter.clientId = clientId;

      const productComplaints = await ProductComplaint.find(filter)
        .populate('clientId', 'name address')
        .sort({ date: -1 });

      res.json({ productComplaints });
    } catch (error: any) {
      console.error("Get product complaints error:", error);
      res.status(500).json({ error: "Failed to get product complaints" });
    }
  });

  // Get single product complaint
  app.get("/api/product-complaints/:id", requireAuth, async (req, res) => {
    try {
      const productComplaint = await ProductComplaint.findById(req.params.id)
        .populate('clientId', 'name address');

      if (!productComplaint) {
        return res.status(404).json({ error: "Product complaint not found" });
      }

      res.json({ productComplaint });
    } catch (error: any) {
      console.error("Get product complaint error:", error);
      res.status(500).json({ error: "Failed to get product complaint" });
    }
  });

  // Create product complaint
  app.post("/api/product-complaints", requireAuth, async (req, res) => {
    try {
      const validatedData = createProductComplaintSchema.parse(req.body);
      const productComplaint = new ProductComplaint({
        ...validatedData,
        date: validatedData.date ? new Date(validatedData.date) : new Date(),
      });
      await productComplaint.save();
      await productComplaint.populate('clientId', 'name address');

      res.status(201).json({ productComplaint, message: "Product complaint created successfully" });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      console.error("Create product complaint error:", error);
      res.status(500).json({ error: "Failed to create product complaint" });
    }
  });

  // Update product complaint
  app.patch("/api/product-complaints/:id", requireAuth, async (req, res) => {
    try {
      const validatedData = updateProductComplaintSchema.parse(req.body);
      const productComplaint = await ProductComplaint.findByIdAndUpdate(
        req.params.id,
        validatedData,
        { new: true, runValidators: true }
      ).populate('clientId', 'name address');

      if (!productComplaint) {
        return res.status(404).json({ error: "Product complaint not found" });
      }

      res.json({ productComplaint, message: "Product complaint updated successfully" });
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return res.status(400).json({ error: "Validation error", details: error.errors });
      }
      console.error("Update product complaint error:", error);
      res.status(500).json({ error: "Failed to update product complaint" });
    }
  });

  // Delete product complaint
  app.delete("/api/product-complaints/:id", requireAuth, async (req, res) => {
    try {
      const productComplaint = await ProductComplaint.findByIdAndDelete(req.params.id);
      if (!productComplaint) {
        return res.status(404).json({ error: "Product complaint not found" });
      }
      res.json({ message: "Product complaint deleted successfully" });
    } catch (error: any) {
      console.error("Delete product complaint error:", error);
      res.status(500).json({ error: "Failed to delete product complaint" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
