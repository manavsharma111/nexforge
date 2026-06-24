const mongoose = require("mongoose")

const domainSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "project",
    required: true,
    index: true,
  },
  domainName: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  sslStatus: {
    type: String,
    enum: ["PENDING", "ACTIVE", "FAILED"],
    default: "PENDING",
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model("domain", domainSchema)
