const { enqueueDeployment } = require("../services/queue.service")
const Project = require("../models/project.model")
const Environment = require("../models/environment.model")
const Deployment = require("../models/deployment.model")
const fs = require("fs")
const path = require("path")

const handleCliDeploy = async (req, res) => {
  try {
    const { projectId } = req.params

    if (!req.file) {
      return res.status(400).json({ error: "No zip file provided" })
    }

    // pass the zip file path to the deployment queue
    const options = {
      source: "cli",
      zipPath: req.file.path
    }

    await enqueueDeployment(projectId, options)

    const project = await Project.findById(projectId)
    const liveUrl = "http://" + (project.subdomain || projectId) + ".localhost:8000"

    res.status(200).json({ message: "CLI deployment queued successfully", projectId, liveUrl })
  } catch (error) {
    console.error("Error handling CLI deploy:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

const handleCliInit = async (req, res) => {
  try {
    const { projectName, framework, projectType } = req.body

    if (!projectName || !framework) {
      return res.status(400).json({ error: "Project name and framework are required" })
    }

    // Check if project name is taken
    const existingProject = await Project.findOne({ projectName })
    if (existingProject) {
      return res.status(400).json({ error: "Project name already exists. Please choose a different name." })
    }

    // Generate a simple subdomain based on project name
    const subdomain = projectName.toLowerCase().replace(/[^a-z0-9]/g, "-")

    const newProject = new Project({
      projectName,
      framework,
      projectType: projectType || "STATIC",
      subdomain,
      status: "IDLE",
      owner: req.user._id,
    })

    await newProject.save()

    res.status(201).json({ 
      message: "Project created successfully", 
      projectId: newProject._id,
      subdomain: newProject.subdomain 
    })
  } catch (error) {
    console.error("Error handling CLI init:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

const handleCliEnvPush = async (req, res) => {
  try {
    const { projectId } = req.params
    const { envs } = req.body // Expecting an array of { key, value }

    if (!envs || !Array.isArray(envs)) {
      return res.status(400).json({ error: "Invalid environment variables format" })
    }

    // Delete existing envs and replace them to keep it simple, just like Vercel pull/push overrides
    await Environment.deleteMany({ projectId })

    const envDocs = envs.map(e => ({
      projectId,
      key: e.key,
      value: e.value,
      target: ["PRODUCTION", "PREVIEW", "DEVELOPMENT"]
    }))

    if (envDocs.length > 0) {
      await Environment.insertMany(envDocs)
    }

    res.status(200).json({ message: "Environment variables pushed successfully" })
  } catch (error) {
    console.error("Error pushing envs:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

const handleCliEnvPull = async (req, res) => {
  try {
    const { projectId } = req.params

    const envs = await Environment.find({ projectId }).select("key value -_id")
    
    res.status(200).json({ envs })
  } catch (error) {
    console.error("Error pulling envs:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

const handleCliGetDeployments = async (req, res) => {
  try {
    const { projectId } = req.params
    // Get the last 10 deployments
    const deployments = await Deployment.find({ projectId })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("_id status createdAt")
    
    res.status(200).json({ deployments })
  } catch (error) {
    console.error("Error fetching deployments:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

const handleCliRollback = async (req, res) => {
  try {
    const { projectId } = req.params
    const { deploymentId } = req.body

    if (!deploymentId) {
      return res.status(400).json({ error: "Deployment ID is required" })
    }

    const DEPLOYMENTS_DIR = path.join(__dirname, "../../../deployments_storage")
    const baseProjectDir = path.join(DEPLOYMENTS_DIR, projectId)
    const targetDeploymentDir = path.join(baseProjectDir, deploymentId)

    if (!fs.existsSync(targetDeploymentDir)) {
      return res.status(404).json({ error: "Target deployment build files not found. They may have been deleted or deployed before versioning was enabled." })
    }

    const currentSymlink = path.join(baseProjectDir, "current")
    if (fs.existsSync(currentSymlink)) {
      try { fs.unlinkSync(currentSymlink) } catch(e) {
        try { fs.rmdirSync(currentSymlink) } catch(e2) {}
      }
    }

    try {
      fs.symlinkSync(targetDeploymentDir, currentSymlink, "junction")
    } catch(e) {
      return res.status(500).json({ error: `Failed to create symlink: ${e.message}` })
    }

    res.status(200).json({ message: "Rollback successful" })
  } catch (error) {
    console.error("Error rolling back:", error)
    res.status(500).json({ error: "Internal server error" })
  }
}

module.exports = {
  handleCliDeploy,
  handleCliInit,
  handleCliEnvPush,
  handleCliEnvPull,
  handleCliGetDeployments,
  handleCliRollback
}
