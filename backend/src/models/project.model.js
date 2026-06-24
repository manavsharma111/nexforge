const mongoose = require("mongoose")

const projectSchema = new mongoose.Schema({
  projectName: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  subdomain: {
    type: String,
    unique: true,
    sparse: true,
  },
  // New fields for MERN / Full-Stack deployments
  projectType: {
    type: String,
    enum: ["STATIC", "NODE"],
    default: "STATIC",
  },
  internalPort: {
    type: Number,
    default: null,
  },
  description: {
    type: String,
    required: false,
    trim: true,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  collaborator: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
  ],
  githubRepoUrl: {
    type: String,
    required: false,
  },
  liveUrl: {
    type: String,
    default: "",
  },
  status: {
    type: String,
    enum: ["IDLE", "QUEUED", "INSTALLING", "BUILDING", "LIVE", "FAILED"],
    default: "IDLE",
  },
  buildCommand: {
    type: String,
    required: false, // Vercel often auto-detects this
  },
  installCommand: {
    type: String,
    required: false,
  },
  outputDirectory: {
    type: String,
    required: false,
  },
  rootDirectory: {
    type: String,
    default: "./",
  },
  framework: {
    type: String,
    required: true,
  },
  webhookSecret: {
    type: String,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model("project", projectSchema)
