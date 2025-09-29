import AuditLog from "../models/AuditLog.js";

export async function listAuditLogs(req, res) {
  try {
    // Only Admin
    if (req.user?.role !== "Admin") {
      return res.status(403).json({ success: false, error: "Admins only" });
    }

    const {
      page = 1,
      limit = 20,
      action,
      resourceType,
      actorEmail,
      ip,
      status
    } = req.query;

    const q = {};
    if (action) q.action = action;
    if (resourceType) q.resourceType = resourceType;
    if (actorEmail) q.actorEmail = actorEmail;
    if (ip) q.ip = ip;
    if (status) q.status = status;

    const skip = (Number(page) - 1) * Number(limit);
    const [items, total] = await Promise.all([
      AuditLog.find(q).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
      AuditLog.countDocuments(q),
    ]);

    res.json({
      success: true,
      page: Number(page),
      pageSize: Number(limit),
      total,
      items
    });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
}

