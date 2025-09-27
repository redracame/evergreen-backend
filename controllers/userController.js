// controllers/userController.js (CommonJS)
const { User } = require("../models/User");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL, pass: process.env.EMAIL_PASSWORD },
});

async function createEmployee(req, res) {
  try {
    const data = req.body || {};

    // basic validation
    const required = ["id","firstName","lastName","email","password","address","phone","role"];
    const missing = required.filter(k => !data[k]);
    if (missing.length) {
      return res.status(400).json({ message: `Missing fields: ${missing.join(", ")}` });
    }

    const plainPassword = String(data.password);
    data.password = bcrypt.hashSync(plainPassword, 10);

    const newUser = new User(data);
    await newUser.save();

    try {
      await transporter.sendMail({
        from: process.env.EMAIL,
        to: data.email,
        subject: "Welcome to Evergreen Group!",
        html: `<h2>Welcome ${data.firstName} ${data.lastName}!</h2>
               <p>Your login details:</p>
               <ul><li>ID: ${data.id}</li><li>Email: ${data.email}</li><li>Password: ${plainPassword}</li></ul>`
      });
      return res.status(200).json({ message: "Employee created successfully and email sent" });
    } catch (emailError) {
      console.error("Email send error:", emailError);
      return res.status(500).json({ message: "Employee created, but email sending failed" });
    }
  } catch (err) {
    console.error("Create employee error:", err);
    return res.status(500).json({ message: "Employee not created" });
  }
}

module.exports = { createEmployee };
