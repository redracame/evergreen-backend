import Course from "../models/courses.js";
import { isAdmin } from "./userController.js"; // reusing your helper

// return 401 if no token; 403 if not admin
function requireAdmin(req, res) {
  const hasToken = (req.headers?.authorization || "").startsWith("Bearer ");
  if (!hasToken) {
    res.status(401).json({ success: false, error: "Unauthenticated (missing token)" });
    return false;
  }
  if (!isAdmin(req)) {
    res.status(403).json({ success: false, error: "Admins only" });
    return false;
  }
  return true;
}

// Create new course (Admin only) — expects courseId in body
export const createCourse = async (req, res) => {
  if (!requireAdmin(req, res)) return;

  try {
    const { courseId } = req.body || {};
    if (!courseId) {
      return res.status(400).json({ success: false, error: "courseId is required" });
    }

    // optional: prevent duplicates early
    const exists = await Course.findOne({ courseId }).lean();
    if (exists) {
      return res.status(409).json({ success: false, error: "courseId already exists" });
    }

    const course = new Course(req.body);
    await course.save();
    res.status(201).json({ success: true, data: course });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Get all courses (public/read)
export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find().lean();
    res.status(200).json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get single course by custom courseId (public/read)
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findOne({ courseId: req.params.courseId });
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });
    res.status(200).json({ success: true, data: course });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Update course by courseId (Admin only)
// note: we keep courseId immutable; ignore any courseId in body
export const updateCourse = async (req, res) => {
  if (!requireAdmin(req, res)) return;

  try {
    const { courseId, ...updates } = req.body || {}; // ignore courseId changes
    const course = await Course.findOneAndUpdate(
      { courseId: req.params.courseId },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!course) return res.status(404).json({ success: false, message: "Course not found" });
    res.status(200).json({ success: true, data: course });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Delete course by courseId (Admin only)
export const deleteCourse = async (req, res) => {
  if (!requireAdmin(req, res)) return;

  try {
    const course = await Course.findOneAndDelete({ courseId: req.params.courseId });
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });
    res.status(200).json({ success: true, message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
