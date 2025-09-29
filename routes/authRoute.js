// routes/authRoute.js (ESM)
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { logEvent } from "../utils/audit.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      logEvent(req, {
        action: "login_fail",
        resourceType: "Auth",
        status: "fail",
        message: "Email and password are required",
        meta: { email }
      });
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      logEvent(req, {
        action: "login_fail",
        resourceType: "Auth",
        status: "fail",
        message: "Invalid credentials",
        meta: { email }
      });
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      logEvent(req, {
        action: "login_fail",
        resourceType: "Auth",
        status: "fail",
        message: "Invalid credentials",
        meta: { email: user.email }
      });
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { _id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    logEvent(req, {
      action: "login_success",
      resourceType: "Auth",
      status: "success",
      message: "Login successful",
      meta: { email: user.email }
    });

    res.json({ message: "Login successful ✅", token });
  } catch (err) {
    logEvent(req, {
      action: "http_error",
      resourceType: "HTTP",
      status: "fail",
      message: "Server error during login",
      meta: { error: String(err?.message || err) }
    });
    console.error("Login error:", err);
    res.status(500).json({ error: "Server error during login" });
  }
});

export default router;
