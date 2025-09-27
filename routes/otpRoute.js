const express = require("express");
const { requestOtp, verifyOtp } = require("../controllers/otpController");

const router = express.Router();

console.log("✅ OTP routes loaded");

// Request OTP
router.post("/request", requestOtp);

// Verify OTP
router.post("/verify", verifyOtp);

module.exports = router;
