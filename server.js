import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import otpRoutes from "./routes/otpRoute.js";
import policyRoutes from "./routes/policyRoute.js";
import userRoute from "./routes/userRoute.js";
import courseRoute from "./routes/coursesRoute.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI /* no need for old opts on Mongoose 7+ */)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend connected successfully 🚀" });
});

// API routes
app.use("/api/otp", otpRoutes);
app.use("/api/policies", policyRoutes);
app.use("/api/employees", userRoute);
app.use("/api/courses", courseRoute);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
