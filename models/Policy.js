const mongoose = require("mongoose");

const policySchema = new mongoose.Schema({
  policyId: { type: String , required: true },
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  description: { type: String, required: true },
  createdBy: { type: String, default: "Admin",required: false},
  createdAt: { type: Date, default: Date.now },
  status: { type: String, enum: ["Draft", "Published"], default: "Published" },
  version: { type: String, default: "1.0" },
  publishedAt: { type: Date },  // set when you publish (optional)
});

module.exports = mongoose.model("Policy", policySchema);
