require("dotenv").config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: "linukaauchithya@gmail.com",  // your email to test
  subject: "Test Mail",
  text: "Hello! Nodemailer is working with your app password."
})
.then(() => console.log("✅ Test email sent"))
.catch(err => console.error("❌ Test email failed:", err));
