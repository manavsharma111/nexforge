const Project = require("../models/project.model")
const { enqueueDeployment } = require("../services/queue.service")
const Deployment = require("../models/deployment.model")
const crypto = require("crypto")
const { delCache } = require("../services/redis.service")

const generateUniqueSubdomain = async (projectName) => {
  let baseSlug = projectName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
  if (!baseSlug) baseSlug = "project"

  let isUnique = false
  let currentSlug = baseSlug

  while (!isUnique) {
    const existing = await Project.findOne({ subdomain: currentSlug })
    if (!existing) {
      isUnique = true
    } else {
      const randomSuffix = crypto.randomBytes(2).toString("hex")
      currentSlug = `${baseSlug}-${randomSuffix}`
    }
  }
  return currentSlug
}

// create project
const createProject = async (req, res) => {
  try {
    // Extract project configuration fields
    const {
      projectName,
      description,
      githubRepoUrl,
      framework,
      rootDirectory,
      installCommand,
      buildCommand,
      outputDirectory,
      projectType,
      internalPort,
      environmentVariables, // Array of { key, value }
      collaborator,
    } = req.body

    if (!projectName || !githubRepoUrl) {
      return res
        .status(400)
        .json({ message: "Project name and github repo URL are required" })
    }

    // Clean up environment variables to remove any empty rows
    const cleanedEnvVars = environmentVariables
      ? environmentVariables.filter(
          (env) =>
            env.key &&
            env.key.trim() !== "" &&
            env.value &&
            env.value.trim() !== "",
        )
      : []

    const generatedSubdomain = await generateUniqueSubdomain(projectName)

    // 1. Create the Project
    const project = await Project.create({
      projectName,
      description,
      githubRepoUrl,
      framework: framework || "Other",
      rootDirectory: rootDirectory || "./",
      installCommand,
      buildCommand,
      outputDirectory,
      projectType: projectType || "STATIC",
      internalPort: internalPort || null,
      environmentVariables: cleanedEnvVars,
      subdomain: generatedSubdomain,
      webhookSecret: crypto.randomBytes(16).toString("hex"),
      owner: req.user ? req.user._id : null,
      collaborator,
    })

    // 2. Save Environment Variables if provided
    if (cleanedEnvVars && cleanedEnvVars.length > 0) {
      const Environment = require("../models/environment.model")
      const envDocs = cleanedEnvVars.map((env) => ({
        projectId: project._id,
        key: env.key,
        value: env.value,
      }))
      await Environment.insertMany(envDocs)
    }

    // Trigger asynchronous build via BullMQ Queue
    enqueueDeployment(project._id).catch((err) =>
      console.error("Queue execution error:", err),
    )

    res
      .status(201)
      .json({ message: "Project configured successfully", project })
  } catch (error) {
    console.log("error in creating project", error)
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message })
  }
}

// deploy project
const deployProject = async (req, res) => {
  try {
    const { projectId, branch } = req.body
    const project = await Project.findById(projectId)
    if (!project) {
      return res.status(404).json({ message: "Project not found" })
    }
    // Trigger the deployment
    enqueueDeployment(projectId).catch((err) =>
      console.error("Queue execution error:", err),
    )

    res.status(201).json({ message: "Deployment started successfully" })
  } catch (error) {
    console.error("error in deploying project", error)
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message })
  }
}

// get project by id
const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate(
      "owner collaborator",
    )
    if (!project) {
      return res.status(404).json({ message: "Project not found" })
    }

    if (!project.webhookSecret) {
      project.webhookSecret = crypto.randomBytes(16).toString("hex")
      await project.save()
    }

    if (!project.subdomain) {
      project.subdomain = await generateUniqueSubdomain(project.projectName)
      await project.save()
    }

    // Fetch Environment variables
    const Environment = require("../models/environment.model")
    const envVars = await Environment.find({ projectId: project._id })

    // Convert to plain object and attach env vars
    const projectObj = project.toObject()
    projectObj.environmentVariables = envVars || []

    res
      .status(200)
      .json({ message: "Project fetched successfully", project: projectObj })
  } catch (error) {
    console.log("error in getting project", error)
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message })
  }
}

//  get all projects
const getAllProject = async (req, res) => {
  try {
    const projects = await Project.find().populate("owner collaborator")
    res.status(200).json({ message: "Projects fetched successfully", projects })
  } catch (error) {
    console.log("error in getting projects", error)
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message })
  }
}

// update project
const updateProject = async (req, res) => {
  try {
    const {
      projectId,
      projectName,
      description,
      githubRepoUrl,
      framework,
      rootDirectory,
      installCommand,
      buildCommand,
      outputDirectory,
      collaborator,
      environmentVariables,
      subdomain,
    } = req.body
    const idToUpdate = projectId || req.params.id
    const project = await Project.findById(idToUpdate)
    if (!project) {
      return res.status(404).json({ message: "Project not found" })
    }

    // Only update fields if they are provided in the request
    if (projectName) project.projectName = projectName
    if (description) project.description = description
    if (githubRepoUrl) project.githubRepoUrl = githubRepoUrl
    if (framework) project.framework = framework
    if (rootDirectory) project.rootDirectory = rootDirectory
    if (installCommand) project.installCommand = installCommand
    if (buildCommand) project.buildCommand = buildCommand
    if (outputDirectory) project.outputDirectory = outputDirectory
    if (collaborator) project.collaborator = collaborator

    let oldSubdomain = null
    if (subdomain) {
      const formattedSubdomain = subdomain
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, "")
      oldSubdomain = project.subdomain
      const existing = await Project.findOne({
        subdomain: formattedSubdomain,
        _id: { $ne: project._id },
      })
      if (existing) {
        return res.status(400).json({ message: "Subdomain already taken" })
      }
      project.subdomain = formattedSubdomain
      // Regenerate liveUrl to ensure it's correct and avoid parsing errors
      if (project.liveUrl) {
        try {
          const baseDomain = process.env.BASE_DOMAIN || "localhost"
          const isLocal = baseDomain === "localhost"
          const projectId = project._id.toString()

          if (project.projectType === "STATIC") {
            // For static sites, the primary live URL is path-based and doesn't change with subdomain on production.
            project.liveUrl = isLocal
              ? `http://${formattedSubdomain}.${baseDomain}:8000/p/${projectId}`
              : `https://${baseDomain}/p/${projectId}`
          } else {
            // For NODE projects, the URL is subdomain-based.
            project.liveUrl = isLocal
              ? `http://${formattedSubdomain}.${baseDomain}:8000`
              : `https://${formattedSubdomain}.${baseDomain}`
          }
        } catch (e) {
          console.error("Failed to regenerate liveUrl during update", e)
        }
      }
    }

    await project.save()
    if (oldSubdomain) await delCache(`route:${oldSubdomain}`)
    await delCache(`route:${project.subdomain}`)
    if (project._id) await delCache(`route:${project._id.toString()}`)

    // Handle Environment Variables update
    if (environmentVariables && Array.isArray(environmentVariables)) {
      const Environment = require("../models/environment.model")
      // Delete old variables
      await Environment.deleteMany({ projectId: project._id })

      // Insert new ones
      const cleanedEnvVars = environmentVariables.filter(
        (env) =>
          env.key &&
          env.key.trim() !== "" &&
          env.value &&
          env.value.trim() !== "",
      )
      if (cleanedEnvVars.length > 0) {
        const envDocs = cleanedEnvVars.map((env) => ({
          projectId: project._id,
          key: env.key,
          value: env.value,
        }))
        await Environment.insertMany(envDocs)
      }
    }

    res.status(200).json({ message: "Project updated successfully", project })
  } catch (error) {
    console.log("error in updating project", error)
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message })
  }
}

// delete project
const deleteProject = async (req, res) => {
  try {
    const projectId = req.params.id || req.body.projectId
    const project = await Project.findById(projectId)
    if (!project) {
      return res.status(404).json({ message: "Project not found" })
    }

    await Project.findByIdAndDelete(projectId)
    await delCache(`route:${project.subdomain}`)
    await delCache(`route:${project._id.toString()}`)
    res.status(200).json({ message: "Project deleted successfully" })
  } catch (error) {
    console.log("error in deleting project", error)
    res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message })
  }
}

module.exports = {
  createProject,
  deployProject,
  getProject,
  getAllProject,
  updateProject,
  deleteProject,
}
