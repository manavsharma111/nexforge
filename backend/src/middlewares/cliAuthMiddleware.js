const User = require("../models/user.model")
const Project = require("../models/project.model")

const requireCliAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized: Missing or invalid CLI token" })
    }

    const token = authHeader.split(" ")[1]
    
    // Find user by their CLI token
    const user = await User.findOne({ cliToken: token })
    if (!user) {
      return res.status(401).json({ error: "Unauthorized: Invalid CLI token" })
    }

    // Attach user to request
    req.user = user

    // For CLI routes that target a specific project, verify ownership
    const projectId = req.params.projectId || req.body.projectId
    
    // Note: /init route doesn't have a projectId yet, so we skip ownership check for it
    if (projectId) {
      const project = await Project.findById(projectId)
      if (!project) {
        return res.status(404).json({ error: "Project not found" })
      }
      
      // Check if the user is the owner or a collaborator
      const isOwner = project.owner.toString() === user._id.toString()
      const isCollaborator = project.collaborator && project.collaborator.some(c => c.toString() === user._id.toString())

      if (!isOwner && !isCollaborator) {
        return res.status(403).json({ error: "Forbidden: You do not have access to this project" })
      }
    }

    next()
  } catch (error) {
    console.error("CLI Auth Middleware Error:", error)
    res.status(500).json({ error: "Internal Server Error during CLI authentication" })
  }
}

module.exports = { requireCliAuth }
