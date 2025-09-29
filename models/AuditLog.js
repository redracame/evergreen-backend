const mongoose = require("mongoose");

const AuditLogSchema = new mongoose.Schema(
  {
    // who
    actorId: { type: String },                 // your custom user.id (e.g., "EMP001")
    actorEmail: { type: String },
    actorRole: { type: String },

    // what
    action: { type: String, required: true },  // e.g., "login_success", "login_fail", "policy_create"
    resourceType: { type: String },            // "Policy" | "Course" | "User" | "Auth" | "OTP" | "HTTP"
    resourceId: { type: String },              // e.g., policyId / courseId / user.id

    // result
    status: { type: String, enum: ["success", "fail", "info"], default: "info" },
    message: { type: String },

    // request context
    ip: { type: String },
    userAgent: { type: String },
    method: { type: String },
    route: { type: String },

    // extra
    meta: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

AuditLogSchema.index({ createdAt: -1 });
AuditLogSchema.index({ action: 1, createdAt: -1 });
AuditLogSchema.index({ resourceType: 1, resourceId: 1, createdAt: -1 });
AuditLogSchema.index({ actorEmail: 1, createdAt: -1 });

module.exports = mongoose.model("AuditLog", AuditLogSchema);
