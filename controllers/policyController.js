import Policy from "../models/Policy.js";
import { logEvent } from "../utils/audit.js";

// Create Policy
export const createPolicy = async (req, res) => {
  try {
    const { title, subtitle, description , policyId} = req.body;

    if (!title || !subtitle || !description || !policyId) {
      return res.status(400).json({ error: "Title, subtitle and description are required" });
    }

    const newPolicy = new Policy({ policyId, title, subtitle, description });
    await newPolicy.save();

    res.status(201).json({ message: "✅ Policy created", policy: newPolicy });

    logEvent(req, {
      action: "policy_create",
      resourceType: "Policy",
      resourceId: policyId,
      status: "success",
      message: `Policy created`
    });

  } catch (err) {
    res.status(500).json({ error: "Failed to create policy", details: err.message });
    logEvent(req, {
      action: "policy_create",
      resourceType: "Policy",
      resourceId: req.body?.policyId,
      status: "fail",
      message: "Failed to create policy",
      meta: { error: err.message }
    });
  }
};

// Get All Policies
export const getPolicies = async (req, res) => {
  try {
    const policies = await Policy.find().populate("createdBy", "email role");
    res.json(policies);
  } catch (err) {
    res.status(500).json({ error: "❌ Failed to fetch policies" });
  }
};

// Get Single Policy
export const getPolicyById = async (req, res) => {
  try {
    const policy = await Policy.findById(req.params.id).populate("createdBy", "email role");
    if (!policy) return res.status(404).json({ error: "Policy not found" });
    res.json(policy);
  } catch (err) {
    res.status(500).json({ error: "❌ Failed to fetch policy" });
  }
};

// Update Policy
export const updatePolicy = async (req, res) => {
  try {
    const { title, subtitle, description ,policyId} = req.body;
    const updatedPolicy = await Policy.findOneAndUpdate(
      { policyId: req.params.policyId },
      { title, subtitle, description, policyId },
      { new: true, runValidators: true }
    );
    if (!updatedPolicy) return res.status(404).json({ error: "Policy not found" });
    res.json({ message: "✅ Policy updated", policy: updatedPolicy });
    logEvent(req, {
      action: "policy_update",
      resourceType: "Policy",
      resourceId: req.params.policyId,
      status: "success",
      message: `Policy updated`
    });
  } catch (err) {
    res.status(500).json({ error: "❌ Failed to update policy", details: err.message });
    logEvent(req, {
      action: "policy_update",
      resourceType: "Policy",
      resourceId: req.params.policyId,
      status: "fail",
      message: "Failed to update policy",
      meta: { error: err.message }
    });
  }
};

// Delete Policy
export const deletePolicy = async (req, res) => {
  try {
    const deletedPolicy = await Policy.findOneAndDelete({ policyId: req.params.policyId });
    if (!deletedPolicy) return res.status(404).json({ error: "Policy not found" });
    res.json({ message: "🗑️ Policy deleted" });
    logEvent(req, {
      action: "policy_delete",
      resourceType: "Policy",
      resourceId: req.params.policyId,
      status: "success",
      message: `Policy deleted`
    });
  } catch (err) {
    res.status(500).json({ error: "❌ Failed to delete policy" });
    logEvent(req, {
      action: "policy_delete",
      resourceType: "Policy",
      resourceId: req.params.policyId,
      status: "fail",
      message: "Failed to delete policy",
      meta: { error: err.message }
    });
  }
};
