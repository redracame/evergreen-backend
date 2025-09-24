const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["Admin", "Employee", "Manager"],
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  otp: String,          // for storing OTP temporarily
  otpExpires: Date      // OTP expiration time
});

module.exports = mongoose.model("User", userSchema);
