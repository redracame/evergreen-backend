import { logEvent } from "../utils/audit.js";

export default function auditRequestLogger(req, res, next) {
  const start = Date.now();
  res.on("finish", () => {
    if (res.statusCode >= 400) {
      logEvent(req, {
        action: "http_error",
        resourceType: "HTTP",
        status: "fail",
        message: `${req.method} ${req.originalUrl} -> ${res.statusCode}`,
        meta: { durationMs: Date.now() - start },
      });
    }
  });
  next();
}
