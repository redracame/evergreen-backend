import express from "express";
import {
  createCourse,
  getCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
} from "../controllers/courseController.js";

const router = express.Router();

router.post("/", createCourse);             // Create (Admin)
router.get("/", getCourses);                // Read all (Public)
router.get("/:courseId", getCourseById);    // Read one by courseId (Public)
router.put("/:courseId", updateCourse);     // Update by courseId (Admin)
router.delete("/:courseId", deleteCourse);  // Delete by courseId (Admin)

export default router;
