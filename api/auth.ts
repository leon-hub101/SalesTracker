// api/auth.ts
import express from "express";
import bcrypt from "bcrypt";
import User from "./../shared/models/User";
import { registerSchema, loginSchema } from "./../shared/schema";
import { signToken } from "./lib/auth";

const router = express.Router();

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);
    const existing = await User.findOne({ email: data.email });
    if (existing) return res.status(400).json({ error: "User already exists" });

    const hashed = await bcrypt.hash(data.password, 10);
    const user = new User({
      name: data.name,
      email: data.email,
      password: hashed,
      role: data.role || "agent",
    });
    await user.save();

    const token = signToken({ userId: user._id.toString(), role: user.role });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
      message: "Registered",
    });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return res.status(400).json({ error: "Validation error", details: err.errors });
    }
    res.status(500).json({ error: "Registration failed" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);
    const user = await User.findOne({ email: data.email });
    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = signToken({ userId: user._id.toString(), role: user.role });
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
      message: "Login successful",
    });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return res.status(400).json({ error: "Validation error", details: err.errors });
    }
    res.status(500).json({ error: "Login failed" });
  }
});

// LOGOUT
router.post("/logout", (_req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  res.json({ message: "Logged out" });
});

// ME
router.get("/me", (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Not authenticated" });
  res.json({ user: req.user });
});

export default router;