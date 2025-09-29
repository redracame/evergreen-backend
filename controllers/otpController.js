import User from "../models/User.js";
import { logEvent } from "../utils/audit.js";
import nodemailer from "nodemailer";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Request OTP
export const requestOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      logEvent(req, {
        action: "otp_request",
        resourceType: "OTP",
        status: "fail",
        message: "User not found",
        meta: { email }
      });
      return res.status(404).json({ error: "User not found" });
    }

    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

    user.otp = otp;
    user.otpExpires = otpExpires;
    await user.save();

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your OTP Code",
      text: `Your OTP for password reset is: ${otp}. It is valid for 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    return res.json({ message: "OTP sent successfully" });
  } catch (error) {
    console.error("OTP error:", error);
    return res.status(500).json({ error: "Failed to send OTP" });
  }
};

// Verify OTP
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });

    if (!user || user.otp !== otp || Date.now() > user.otpExpires) {
      logEvent(req, {
        action: "otp_verify",
        resourceType: "OTP",
        status: "fail",
        message: "Invalid or expired OTP",
        meta: { email }
      });
      return res.status(400).json({ error: "Invalid or expired OTP" });
    }

    user.otp = null;
    user.otpExpires = null;
    await user.save();

    return res.json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Verify OTP error:", error);
    logEvent(req, {
      action: "otp_verify",
      resourceType: "OTP",
      status: "fail",
      message: "Invalid or expired OTP",
      meta: { email }
    });
    return res.status(500).json({ error: "OTP verification failed" });
  }
};

