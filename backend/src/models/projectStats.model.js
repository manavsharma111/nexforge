const mongoose = require("mongoose")

const projectStatsSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "project",
    required: true,
  },
  date: {
    type: String,
    required: true, // Format: YYYY-MM-DD
  },
  totalRequests: {
    type: Number,
    default: 0,
  },
  totalBandwidth: {
    type: Number,
    default: 0, // In bytes
  },
  uniqueVisitors: [
    {
      type: String, // Hashed IP addresses
    },
  ],
})

// Ensure unique index for quick lookups and upserts
projectStatsSchema.index({ projectId: 1, date: 1 }, { unique: true })

module.exports = mongoose.model("projectStats", projectStatsSchema)
