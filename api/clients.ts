// api/clients.ts
import express from "express";
import Client from "../shared/models/Client";
import { createClientSchema, updateClientSchema } from "../shared/schema";
import { requireAuth } from "./lib/auth";

const router = express.Router();
router.use(requireAuth);

// GET ALL
router.get("/", async (req, res) => {
  try {
    const { region, hasComplaint, requestedVisit } = req.query;
    const filter: any = {};
    if (region) filter.region = region;
    if (hasComplaint !== undefined) filter.hasComplaint = hasComplaint === "true";
    if (requestedVisit !== undefined) filter.requestedVisit = requestedVisit === "true";

    const clients = await Client.find(filter).sort({ name: 1 });
    res.json({ clients });
  } catch (err) {
    res.status(500).json({ error: "Failed to get clients" });
  }
});

// GET ONE
router.get("/:id", async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);
    if (!client) return res.status(404).json({ error: "Client not found" });
    res.json({ client });
  } catch (err) {
    res.status(500).json({ error: "Failed to get client" });
  }
});

// CREATE
router.post("/", async (req, res) => {
  try {
    const data = createClientSchema.parse(req.body);
    const client = new Client(data);
    await client.save();
    res.status(201).json({ client, message: "Client created" });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return res.status(400).json({ error: "Validation error", details: err.errors });
    }
    res.status(500).json({ error: "Failed to create client" });
  }
});

// UPDATE
router.patch("/:id", async (req, res) => {
  try {
    const data = updateClientSchema.parse(req.body);
    const client = await Client.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });
    if (!client) return res.status(404).json({ error: "Client not found" });
    res.json({ client, message: "Client updated" });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return res.status(400).json({ error: "Validation error", details: err.errors });
    }
    res.status(500).json({ error: "Failed to update client" });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    const client = await Client.findByIdAndDelete(req.params.id);
    if (!client) return res.status(404).json({ error: "Client not found" });
    res.json({ message: "Client deleted" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete client" });
  }
});

export default router;