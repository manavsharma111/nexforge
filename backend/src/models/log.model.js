const mongoose = require("mongoose")

const logSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "project",
    required: true,
    index: true,
  },
  logs: [
    {
      timestamp: {
        type: Date,
        default: Date.now,
      },
      level: {
        type: String,
        enum: ["INFO", "WARN", "ERROR"],
        default: "INFO",
      },
      message: {
        type: String,
        required: true,
      },
    },
  ],
  timestamp: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model("log", logSchema)
