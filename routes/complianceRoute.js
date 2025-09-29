import express from "express";
import { getComplianceSummary } from "../controllers/complianceController.js";
const router = express.Router();

router.get("/summary", getComplianceSummary);

export default router;
