const Policy = require("../models/Policy");

// Create Policy
const createPolicy = async (req, res) => {
  try {
    const { title, subtitle, description } = req.body;

    if (!title || !subtitle || !description) {
      return res.status(400).json({ error: "Title, subtitle and description are required" });
    }

    const createdBy = req.user._id; // comes from verifyAdmin middleware

    const newPolicy = new Policy({ title, subtitle, description, createdBy });
    await newPolicy.save();

    res.status(201).json({ message: "✅ Policy created", policy: newPolicy });
  } catch (err) {
    res.status(500).json({ error: "❌ Failed to create policy", details: err.message });
  }
};

// Get All Policies
const getPolicies = async (req, res) => {
  try {
    const policies = await Policy.find().populate("createdBy", "email role");
    res.json(policies);
  } catch (err) {
    res.status(500).json({ error: "❌ Failed to fetch policies" });
  }
};

// Get Single Policy
const getPolicyById = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id).populate("createdBy", "email role");
    if (!policy) return res.status(404).json({ error: "Policy not found" });
    res.json(policy);
  } catch (err) {
    res.status(500).json({ error: "❌ Failed to fetch policy" });
  }
};

// Update Policy
const updatePolicy = async (req, res) => {
  try {
    const { title, subtitle, description } = req.body;
    const updatedPolicy = await Policy.findByIdAndUpdate(
      req.params.id,
      { title, subtitle, description },
      { new: true, runValidators: true }
    );
    if (!updatedPolicy) return res.status(404).json({ error: "Policy not found" });
    res.json({ message: "✅ Policy updated", policy: updatedPolicy });
  } catch (err) {
    res.status(500).json({ error: "❌ Failed to update policy", details: err.message });
  }
};

// Delete Policy
const deletePolicy = async (req, res) => {
  try {
    const deletedPolicy = await Policy.findByIdAndDelete(req.params.id);
    if (!deletedPolicy) return res.status(404).json({ error: "Policy not found" });
    res.json({ message: "🗑️ Policy deleted" });
  } catch (err) {
    res.status(500).json({ error: "❌ Failed to delete policy" });
  }
};

module.exports = {
  createPolicy,
  getPolicies,
  getPolicyById,
  updatePolicy,
  deletePolicy,
};
