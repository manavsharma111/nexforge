const mongoose = require("mongoose")

const deploymentSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "project",
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: ["QUEUED", "INSTALLING", "BUILDING", "LIVE", "FAILED"],
    default: "QUEUED",
  },
  commitHash: {
    type: String,
  },
  commitMessage: {
    type: String,
  },
  branch: {
    type: String,
    default: "main",
  },
  previewUrl: {
    type: String,
  },
  startedAt: {
    type: Date,
    default: Date.now,
  },
  completedAt: {
    type: Date,
  },
})

module.exports = mongoose.model("deployment", deploymentSchema)
