const Domain = require("../models/domain.model")
const Project = require("../models/project.model")

// create domain
const createDomain = async (req, res) => {
  try {
    const { name, projectId } = req.body

    if (!name || !projectId) {
      return res
        .status(400)
        .json({ message: "Domain name and projectId are required" })
    }
    const project = await Project.findById(projectId)
    if (!project) {
      return res.status(404).json({ message: "Project not found" })
    }
    const domainExists = await Domain.findOne({
      name: name.toLowerCase().trim(),
    })
    if (domainExists) {
      return res.status(400).json({ message: "Domain already exists" })
    }

    const domain = await Domain.create({
      name: name.toLowerCase().trim(),
      projectId,
    })

    return res
      .status(201)
      .json({ message: "Domain created successfully", domain })
  } catch (error) {
    console.error("error creating domain:", error)
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message })
  }
}

// get single domain
const getDomain = async (req, res) => {
  try {
    const domain = await Domain.findById(req.params.id).populate("projectId")

    if (!domain) {
      return res.status(404).json({ message: "Domain not found" })
    }

    return res
      .status(200)
      .json({ message: "Domain fetched successfully", domain })
  } catch (error) {
    console.error("error getting domain:", error)
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message })
  }
}

// get all domains
const getAllDomain = async (req, res) => {
  try {
    const domains = await Domain.find().populate("projectId")
    return res
      .status(200)
      .json({ message: "Domains fetched successfully", domains })
  } catch (error) {
    console.error("error getting domains:", error)
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message })
  }
}

// update domain
const updateDomain = async (req, res) => {
  try {
    const { domainId, name, projectId } = req.body

    const domain = await Domain.findById(domainId)
    if (!domain) {
      return res.status(404).json({ message: "Domain not found" })
    }

    if (name) {
      const domainExists = await Domain.findOne({
        name: name.toLowerCase().trim(),
        _id: { $ne: domainId },
      })
      if (domainExists) {
        return res.status(400).json({ message: "Domain already exists" })
      }
      domain.name = name.toLowerCase().trim()
    }

    if (projectId) domain.projectId = projectId

    await domain.save()
    return res
      .status(200)
      .json({ message: "Domain updated successfully", domain })
  } catch (error) {
    console.error("error updating domain:", error)
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message })
  }
}

// delete domain
const deleteDomain = async (req, res) => {
  try {
    const domainId = req.params.id || req.body.domainId

    const domain = await Domain.findByIdAndDelete(domainId)
    if (!domain) {
      return res.status(404).json({ message: "Domain not found" })
    }

    return res.status(200).json({ message: "Domain deleted successfully" })
  } catch (error) {
    console.error("error deleting domain:", error)
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message })
  }
}

module.exports = {
  createDomain,
  getDomain,
  getAllDomain,
  updateDomain,
  deleteDomain,
}
