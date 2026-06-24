const axios = require("axios")
const Project = require("../models/project.model")
const { enqueueDeployment } = require("../services/queue.service")

// Get all repositories for the logged-in user
const getUserRepositories = async (req, res) => {
  try {
    const user = req.user

    if (!user.githubToken) {
      return res
        .status(400)
        .json({
          message: "GitHub token not found. Please log in with GitHub again.",
        })
    }

    // Fetch user's repos, sorted by recently updated
    const response = await axios.get(
      "https://api.github.com/user/repos?sort=updated&per_page=100",
      {
        headers: {
          Authorization: `Bearer ${user.githubToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      },
    )

    // Filter and map data to only send what the frontend needs
    const repositories = response.data.map((repo) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      private: repo.private,
      htmlUrl: repo.html_url,
      cloneUrl: repo.clone_url,
      language: repo.language,
      updatedAt: repo.updated_at,
      defaultBranch: repo.default_branch,
    }))

    res.status(200).json({ repositories })
  } catch (error) {
    console.error("Error fetching GitHub repositories:", error.message)
    // Handle token expiration or invalid token from GitHub
    if (error.response && error.response.status === 401) {
      return res
        .status(401)
        .json({
          message: "GitHub token expired or invalid. Please re-authenticate.",
        })
    }
    res
      .status(500)
      .json({
        message: "Failed to fetch repositories from GitHub",
        error: error.message,
      })
  }
}

// GitHub Webhook Handler for Auto Deploy
const githubWebhookHandler = async (req, res) => {
  try {
    const event = req.headers["x-github-event"]
    if (event !== "push") {
      return res.status(200).send("Not a push event, ignored.")
    }

    const payload = req.body
    const repoHtmlUrl = payload.repository && payload.repository.html_url
    const branchRef = payload.ref

    if (!repoHtmlUrl) {
      return res.status(400).send("Invalid payload: repository url missing")
    }

    const projects = await Project.find({
      githubRepoUrl: { $regex: new RegExp(`^${repoHtmlUrl}(\\.git)?$`, "i") },
    })

    if (projects.length === 0) {
      return res.status(200).send("No projects linked to this repository.")
    }

    const branchName = branchRef ? branchRef.split("/").pop() : "main"

    const crypto = require("crypto")
    const signatureHeader = req.headers["x-hub-signature-256"]

    let validBuilds = 0

    for (const project of projects) {
      // Verify HMAC Signature if a secret is configured and header is present
      if (project.webhookSecret && signatureHeader) {
        const expectedSignature =
          "sha256=" +
          crypto
            .createHmac("sha256", project.webhookSecret)
            .update(req.rawBody || JSON.stringify(payload))
            .digest("hex")

        if (signatureHeader !== expectedSignature) {
          console.log(
            `[WEBHOOK] Signature mismatch for project ${project._id}. Ignoring.`,
          )
          continue // Skip this project
        }
      } else if (project.webhookSecret && !signatureHeader) {
        console.log(
          `[WEBHOOK] Missing signature header for project ${project._id} but secret is configured. Ignoring.`,
        )
        continue
      }

      console.log(
        `[WEBHOOK] Push detected for ${repoHtmlUrl}. Triggering build for project ${project._id}`,
      )
      enqueueDeployment(project._id).catch((err) =>
        console.error("Queue execution error:", err),
      )
      validBuilds++
    }

    res.status(200).send(`Webhook received. Triggered ${validBuilds} builds.`)
  } catch (error) {
    console.error("Error in github webhook handler:", error)
    res.status(500).send("Webhook processing failed")
  }
}

module.exports = {
  getUserRepositories,
  githubWebhookHandler,
}
