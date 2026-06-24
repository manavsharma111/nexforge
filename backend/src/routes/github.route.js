const { Router } = require("express")
const { authMiddleware } = require("../middlewares/authMiddleware")
const {
  getUserRepositories,
  githubWebhookHandler,
} = require("../controllers/github.controller")

const router = Router()

// Protected route
router.get("/repos", authMiddleware, getUserRepositories)

// Public Webhook Route for Auto Deploy
router.post("/webhook", githubWebhookHandler)

module.exports = router
