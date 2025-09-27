const express = require("express");
const {
  createPolicy,
  getPolicies,
  getPolicyById,
  updatePolicy,
  deletePolicy,
} = require("../controllers/policyController");

const router = express.Router();

// Create Policy (Admin)
router.post("/", createPolicy);

// Get All Policies
router.get("/", getPolicies);

// Get Single Policy
router.get("/:id", getPolicyById);

// Update Policy (Admin)
router.put("/:id", updatePolicy);

// Delete Policy (Admin)
router.delete("/:id", deletePolicy);

module.exports = router;
