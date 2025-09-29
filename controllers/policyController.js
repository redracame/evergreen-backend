import Policy from "../models/Policy.js";
import PolicyAck from "../models/PolicyAck.js";
import User from "../models/User.js";
import { logEvent } from "../utils/audit.js";

// helper: list non-admin employees
async function listEmployees() {
  return User.find({ role: { $in: ["Employee", "Manager"] } }, "id email").lean();
}

// Create Policy (Admin via middleware)
export const createPolicy = async (req, res) => {
  try {
    const { title, subtitle, description, policyId, status = "Published", version = "1.0" } = req.body;

    if (!title || !subtitle || !description || !policyId) {
      return res.status(400).json({ error: "Title, subtitle, description, policyId are required" });
    }

    const newPolicy = new Policy({
      policyId, title, subtitle, description,
      status, version,
      publishedAt: status === "Published" ? new Date() : undefined,
    });
    await newPolicy.save();

    // 🔸 create Pending acks for all employees if policy is Published
    if (newPolicy.status === "Published") {
      const emps = await listEmployees();
      const docs = emps.map((u) => ({ policyId, userId: u.id, status: "Pending" }));
      if (docs.length) {
        // ignore duplicates if re-run
        await PolicyAck.bulkWrite(
          docs.map((d) => ({ updateOne: { filter: { policyId: d.policyId, userId: d.userId }, update: { $setOnInsert: d }, upsert: true } }))
        );
      }
    }

    res.status(201).json({ message: "✅ Policy created", policy: newPolicy });

    logEvent(req, {
      action: "policy_create",
      resourceType: "Policy",
      resourceId: policyId,
      status: "success",
      message: `Policy created`,
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to create policy", details: err.message });
    logEvent(req, {
      action: "policy_create",
      resourceType: "Policy",
      resourceId: req.body?.policyId,
      status: "fail",
      message: "Failed to create policy",
      meta: { error: err.message },
    });
  }
};

// Publish/Unpublish (Admin)
export const setPolicyStatus = async (req, res) => {
  try {
    const { status } = req.body; // "Draft" | "Published"
    if (!["Draft", "Published"].includes(status)) {
      return res.status(400).json({ error: "status must be Draft or Published" });
    }
    const policy = await Policy.findOneAndUpdate(
      { policyId: req.params.policyId },
      { status, publishedAt: status === "Published" ? new Date() : null },
      { new: true }
    );
    if (!policy) return res.status(404).json({ error: "Policy not found" });

    // when (re)publishing, ensure Pending acks exist for all employees
    if (status === "Published") {
      const emps = await listEmployees();
      const ops = emps.map((u) => ({
        updateOne: {
          filter: { policyId: policy.policyId, userId: u.id },
          update: { $setOnInsert: { policyId: policy.policyId, userId: u.id, status: "Pending" } },
          upsert: true,
        },
      }));
      if (ops.length) await PolicyAck.bulkWrite(ops);
    }

    logEvent(req, {
      action: "policy_status",
      resourceType: "Policy",
      resourceId: req.params.policyId,
      status: "success",
      message: `Policy set to ${status}`,
    });

    res.json({ message: "✅ Status updated", policy });
  } catch (err) {
    logEvent(req, { action: "policy_status", resourceType: "Policy", resourceId: req.params.policyId, status: "fail", message: err.message });
    res.status(500).json({ error: "❌ Failed to update status", details: err.message });
  }
};

// Get All Policies (unchanged)
export const getPolicies = async (_req, res) => {
  try {
    const policies = await Policy.find().lean();
    res.json(policies);
  } catch {
    res.status(500).json({ error: "❌ Failed to fetch policies" });
  }
};

// Get policy by policyId (fix from _id to policyId)
export const getPolicyById = async (req, res) => {
  try {
    const policy = await Policy.findOne({ policyId: req.params.policyId }).lean();
    if (!policy) return res.status(404).json({ error: "Policy not found" });
    res.json(policy);
  } catch {
    res.status(500).json({ error: "❌ Failed to fetch policy" });
  }
};

// Update Policy (keep your logic)
export const updatePolicy = async (req, res) => {
  try {
    const { title, subtitle, description, policyId } = req.body;
    const updatedPolicy = await Policy.findOneAndUpdate(
      { policyId: req.params.policyId },
      { title, subtitle, description, policyId },
      { new: true, runValidators: true }
    );
    if (!updatedPolicy) return res.status(404).json({ error: "Policy not found" });

    logEvent(req, { action: "policy_update", resourceType: "Policy", resourceId: req.params.policyId, status: "success", message: "Policy updated" });
    res.json({ message: "✅ Policy updated", policy: updatedPolicy });
  } catch (err) {
    logEvent(req, { action: "policy_update", resourceType: "Policy", resourceId: req.params.policyId, status: "fail", message: err.message });
    res.status(500).json({ error: "❌ Failed to update policy", details: err.message });
  }
};

// Delete Policy (unchanged)
export const deletePolicy = async (req, res) => {
  try {
    const deletedPolicy = await Policy.findOneAndDelete({ policyId: req.params.policyId });
    if (!deletedPolicy) return res.status(404).json({ error: "Policy not found" });

    await PolicyAck.deleteMany({ policyId: req.params.policyId }); // clean up acks

    logEvent(req, { action: "policy_delete", resourceType: "Policy", resourceId: req.params.policyId, status: "success", message: "Policy deleted" });
    res.json({ message: "🗑️ Policy deleted" });
  } catch (err) {
    logEvent(req, { action: "policy_delete", resourceType: "Policy", resourceId: req.params.policyId, status: "fail", message: err.message });
    res.status(500).json({ error: "❌ Failed to delete policy" });
  }
};

/* ---------- NEW: endpoints used by UI ---------- */

// return all published policies + THIS USER'S ack status
export const getPoliciesWithMyStatus = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthenticated" });

    const [policies, acks] = await Promise.all([
      Policy.find({ status: "Published" }).lean(),
      PolicyAck.find({ userId: req.user.id }).lean(),
    ]);

    const ackMap = new Map(acks.map(a => [a.policyId, a]));
    const result = policies.map(p => ({
      ...p,
      myAckStatus: ackMap.get(p.policyId)?.status || "Pending",
      myAcknowledgedAt: ackMap.get(p.policyId)?.acknowledgedAt || null,
    }));

    res.json(result);
  } catch (e) {
    res.status(500).json({ error: "Failed to load policy statuses", details: e.message });
  }
};

// mark current user's ack for a policy
export const acknowledgePolicy = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthenticated" });

    const policy = await Policy.findOne({ policyId: req.params.policyId }).lean();
    if (!policy || policy.status !== "Published") {
      return res.status(404).json({ error: "Policy not found or not published" });
    }

    const doc = await PolicyAck.findOneAndUpdate(
      { policyId: req.params.policyId, userId: req.user.id },
      { $set: { status: "Acknowledged", acknowledgedAt: new Date() } },
      { new: true, upsert: true }
    );

    logEvent(req, {
      action: "policy_acknowledge",
      resourceType: "Policy",
      resourceId: req.params.policyId,
      status: "success",
      message: `Policy acknowledged by ${req.user.email}`,
    });

    res.json({ message: "✅ Acknowledged", ack: doc });
  } catch (e) {
    logEvent(req, { action: "policy_acknowledge", resourceType: "Policy", resourceId: req.params.policyId, status: "fail", message: e.message });
    res.status(500).json({ error: "Failed to acknowledge", details: e.message });
  }
};
