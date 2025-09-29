import User from "../models/User.js";
import Policy from "../models/Policy.js";
import PolicyAck from "../models/PolicyAck.js";

export async function getComplianceSummary(_req, res) {
  try {
    const [employees, policies] = await Promise.all([
      User.countDocuments({ role: { $in: ["Employee", "Manager"] } }),
      Policy.find({ status: "Published" }, "policyId").lean(),
    ]);

    const totalRequiredAcks = employees * policies.length;

    const [ackCounts] = await PolicyAck.aggregate([
      { $match: { status: "Acknowledged" } },
      { $group: { _id: null, count: { $sum: 1 } } },
    ]);

    const acknowledged = ackCounts?.count || 0;
    const pending = Math.max(totalRequiredAcks - acknowledged, 0);

    const overallCompliance = totalRequiredAcks > 0 ? Math.round((acknowledged / totalRequiredAcks) * 100) : 0;

    res.json({
      employeesTracked: employees,
      publishedPolicies: policies.length,
      pendingPolicyAcknowledgments: pending,
      acknowledgedPolicyAcknowledgments: acknowledged,
      overallCompliance, // %
      alerts: [
        // UI can render these chips; you can add training alerts later
        ...(pending > 0 ? [{ severity: "Medium", text: `${pending} pending policy acknowledgments` }] : []),
      ],
    });
  } catch (e) {
    res.status(500).json({ error: "Failed to compute compliance", details: e.message });
  }
}
