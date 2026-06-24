const { Router } = require("express")
const {
  githubAuth,
  githubCallback,
  getMe,
  refreshAccessToken,
  logoutUser,
  generateCliToken,
  getCliToken,
} = require("../controllers/auth.controller")
const { authMiddleware } = require("../middlewares/authMiddleware")

const router = Router()

// Route to trigger GitHub Login
router.get("/github", githubAuth)

// Callback route for GitHub to redirect to
router.get("/github/callback", githubCallback)

// Route to get a new Access Token using Refresh Token
router.post("/refresh", refreshAccessToken)

// Protected route to fetch current user profile
router.get("/me", authMiddleware, getMe)

// Protected route to logout user
router.post("/logout", authMiddleware, logoutUser)

// CLI Token Management
router.post("/cli/token/generate", authMiddleware, generateCliToken)
router.get("/cli/token", authMiddleware, getCliToken)

module.exports = router
