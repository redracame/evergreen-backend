const express = require("express");
const {
  createPolicy,
  getPolicies,
  getPolicyById,
  updatePolicy,
  deletePolicy,
  // NEW:
  setPolicyStatus,
  getPoliciesWithMyStatus,
  acknowledgePolicy,
} = require("../controllers/policyController");

const verifyAdmin = require("../middleware/verifyAdmin");
const router = express.Router();

// Create / Update / Delete (Admin)
router.post("/", verifyAdmin, createPolicy);
router.put("/:policyId", verifyAdmin, updatePolicy);
router.delete("/:policyId", verifyAdmin, deletePolicy);

// ✅ NEW: publish/unpublish (Admin)
router.post("/:policyId/status", verifyAdmin, setPolicyStatus);

// Read
router.get("/", getPolicies);
router.get("/:policyId", getPolicyById);

// ✅ NEW: Policies with *my* ack status (Employee view)
router.get("/_me/with-status", getPoliciesWithMyStatus);

// ✅ NEW: Acknowledge current user for a policy
router.post("/:policyId/ack", acknowledgePolicy);

module.exports = router;
