import mongoose from "mongoose";

const { Schema } = mongoose;

const questionSchema = new Schema({
  question: { type: String, required: true, trim: true },
  // Exactly 3 answers
  answers: {
    type: [String],
    required: true,
    validate: {
      validator: (arr) => Array.isArray(arr) && arr.length === 3,
      message: "Exactly 3 answers are required.",
    },
  },
  // Must be one of the 3 answers
  correctAnswer: {
    type: String,
    required: true,
    validate: {
      validator: function (val) {
        return Array.isArray(this.answers) && this.answers.includes(val);
      },
      message: "correctAnswer must match one of the provided answers.",
    },
  },
});

const courseSchema = new Schema(
  {
    // 👇 custom identifier used across API/UI
    courseId: { type: String, required: true, unique: true, index: true, trim: true },

    title: { type: String, required: true, trim: true },
    subtitle: { type: String, trim: true },
    description: { type: String, trim: true },

    questions: {
      type: [questionSchema],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length >= 1,
        message: "At least one question is required.",
      },
    },

    createdBy: { type: Schema.Types.ObjectId, ref: "User" }, // optional
  },
  { timestamps: true }
);

const Course = mongoose.model("Course", courseSchema);
export default Course;
