import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import otpRoutes from "./routes/otpRoute.js";
import policyRoutes from "./routes/policyRoute.js";
import userRoute from "./routes/userRoute.js";
import courseRoute from "./routes/coursesRoute.js";
import complianceRoute from "./routes/complianceRoute.js";

import auditLogRoute from "./routes/auditLogRoute.js";
import auditRequestLogger from "./middleware/auditRequestLogger.js";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));


// attach req.user if token present
app.use((req, _res, next) => {
  const auth = req.headers?.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (token) {
    try {
      const p = jwt.verify(token, process.env.JWT_SECRET);
      req.user = {
        id: p.employeeId || p._id,
        firstName: p.firstName,
        lastName: p.lastName,
        email: p.email,
        role: p.role,
      };
    } catch (_) { /* ignore */ }
  }
  next();
});

// log only 4xx/5xx
app.use(auditRequestLogger);

// audit log routes
app.use("/api/audit-logs", auditLogRoute);

// API routes
app.use("/api/otp", otpRoutes);
app.use("/api/policies", policyRoutes);
app.use("/api/employees", userRoute);
app.use("/api/courses", courseRoute);
app.use("/api/compliance", complianceRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
