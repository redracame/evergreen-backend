import mongoose from "mongoose";
const { Schema } = mongoose;

const PolicyAckSchema = new Schema(
  {
    policyId: { type: String, required: true, index: true }, // your custom policyId
    userId:   { type: String, required: true, index: true }, // your custom employee id (e.g., EMP001)
    status:   { type: String, enum: ["Pending", "Acknowledged"], default: "Pending" },
    acknowledgedAt: { type: Date },
  },
  { timestamps: true }
);

// avoid duplicates per (policy,user)
PolicyAckSchema.index({ policyId: 1, userId: 1 }, { unique: true });

const PolicyAck = mongoose.model("PolicyAck", PolicyAckSchema);
export default PolicyAck;
