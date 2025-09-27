const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

// Routes
const otpRoutes = require("./routes/otpRoute");
const policyRoutes = require("./routes/policyRoute");
const authRoutes = require("./routes/authRoute");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB Connected"))
.catch((err) => console.error("❌ MongoDB Error:", err));

// Test route
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend connected successfully 🚀" });
});

// API routes
app.use("/api/otp", otpRoutes);
app.use("/api/policies", policyRoutes);
app.use("/api/auth", authRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
