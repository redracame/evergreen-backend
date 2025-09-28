// controllers/userController.js (ESM, no middleware)
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

// ---------- helpers ----------
function getAuthUser(req) {
  const auth = req.headers?.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return null;
  try {
    const p = jwt.verify(token, process.env.JWT_SECRET);
    return {
      id: p.employeeId,
      firstName: p.firstName,
      lastName:  p.lastName,
      email:     p.email,
      role:      p.role,
    };
  } catch {
    return null;
  }
}

export function isAdmin(req) {
  const u = getAuthUser(req);
  return u?.role === "Admin";
}

export function isEmployee(req) {
  const u = getAuthUser(req);
  return !!u && u.role !== "Admin";
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

export async function createEmployee(req, res) {
  try {
    const data = req.body || {};
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
        from: process.env.EMAIL_USER,
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

export function getEmployee(req, res) {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: "Unauthenticated" });

  if (user.role === "Admin") {
    return User.find()
      .then(users => res.json(users))
      .catch(() => res.status(500).json({ message: "Users not found" }));
  }

  // employee -> return own profile
  return User.findOne({ email: user.email })
    .then(detail => {
      if (!detail) return res.status(404).json({ message: "User not found" });
      res.json(detail);
    })
    .catch(() => res.status(500).json({ message: "Lookup failed" }));
}

export async function updateEmployee(req, res) {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: "Unauthenticated" });

  const id = req.params.id;
  const data = req.body || {};

  try {
    if (user.role === "Admin") {
      await User.findOneAndUpdate({ id }, data, { new: true });
      return res.json({ message: "Employee updated successfully" });
    }

    // If employee, allow only limited self-update (example: status)
    const found = await User.findOne({ id });
    if (!found) return res.status(404).json({ message: "Employee not found" });
    if (found.email !== user.email) {
      return res.status(403).json({ message: "You are not authorized to do it" });
    }

    await User.updateOne({ id }, { status: data.status });
    return res.json({ message: "Updated successfully" });
  } catch (e) {
    return res.status(500).json({ message: "Update failed" });
  }
}

export function deleteEmployee(req, res) {
  const user = getAuthUser(req);
  if (!user) return res.status(401).json({ error: "Unauthenticated" });
  if (user.role !== "Admin") return res.status(403).json({ error: "Admins only" });

  const id = req.params.id;
  return User.deleteOne({ id })
    .then(() => res.json({ message: "Employee deleted successfully" }))
    .catch(() => res.status(500).json({ message: "Employee delete is failed" }));
}

export function loginEmployee(req, res) {
  const data = req.body || {};
  User.findOne({ email: data.email }).then(user => {
    if (!user) return res.status(404).json({ error: "Employee not found" });

    const ok = bcrypt.compareSync(data.password, user.password);
    if (!ok) return res.status(401).json({ error: "Incorrect password", email: user.email });

    const token = jwt.sign(
      {
        employeeId: user.id,
        firstName: user.firstName,
        lastName:  user.lastName,
        role:      user.role,
        email:     user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.json({ message: "Login Successful", token, user });
  });
}
