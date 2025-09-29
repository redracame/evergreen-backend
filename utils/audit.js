import AuditLog from "../models/AuditLog.js";

function getClientIp(req) {
  const fwd = req.headers["x-forwarded-for"];
  return (
    (Array.isArray(fwd) ? fwd[0] : (fwd || ""))
      .split(",")[0]
      .trim() ||
    req.ip ||
    req.connection?.remoteAddress ||
    ""
  );
}

async function _write(doc) {
  try {
    await AuditLog.create(doc);
  } catch (e) {
    console.error("Audit write failed:", e.message);
  }
}

/** Fire-and-forget audit writer */
function logEvent(
  req,
  { action, resourceType, resourceId, status = "info", message, meta }
) {
  const ua = req.headers["user-agent"] || "";
  const actor = req.user || null;

  const base = {
    action,
    resourceType,
    resourceId,
    status,
    message,
    meta,
    ip: getClientIp(req),
    userAgent: ua,
    method: req.method,
    route: req.originalUrl,
    actorId: actor?.id,
    actorEmail: actor?.email,
    actorRole: actor?.role,
  };

  _write(base); // don't await
}

export { logEvent, getClientIp };
