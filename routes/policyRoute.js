const express = require("express");
const {
  createPolicy,
  getPolicies,
  getPolicyById,
  updatePolicy,
  deletePolicy,
} = require("../controllers/policyController");

const verifyAdmin = require("../middleware/verifyAdmin");

const router = express.Router();

// Create Policy (Admin only)
router.post("/", verifyAdmin, createPolicy);

// Update Policy (Admin only)
router.put("/:id", verifyAdmin, updatePolicy);

// Delete Policy (Admin only)
router.delete("/:id", verifyAdmin, deletePolicy);

// Get All Policies (Public)
router.get("/", getPolicies);

// Get Single Policy (Public)
router.get("/:id", getPolicyById);

module.exports = router;
