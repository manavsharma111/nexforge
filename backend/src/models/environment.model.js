const mongoose = require("mongoose")

const environmentSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "project",
    required: true,
    index: true,
  },
  key: {
    type: String,
    required: true,
    trim: true,
  },
  value: {
    type: String,
    required: true,
    // Note: In a real production environment, you should use a package like 'crypto'
    // or a KMS to encrypt this value before saving to the database.
  },
  target: [
    {
      type: String,
      enum: ["PRODUCTION", "PREVIEW", "DEVELOPMENT"],
      default: ["PRODUCTION", "PREVIEW", "DEVELOPMENT"],
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model("environment", environmentSchema)
