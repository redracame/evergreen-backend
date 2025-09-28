import mongoose from "mongoose";

const { Schema } = mongoose;

const userSchema = new Schema({
  id: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  firstName: { type: String, required: true },
  lastName: { type: String, required: true },

  address: { type: String, required: true },
  phone: { type: String, required: true },

  role: {
    type: String,
    enum: ["Admin", "Employee", "Manager"],
    required: true,
  },

  otp: {
    type: String,
    default: "0",
  },

  otpExpires: {
    type: Date,
    default: "0",
  },
});

const User = mongoose.model("User", userSchema);
export default User;