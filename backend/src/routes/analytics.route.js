const { Router } = require("express")
const { authMiddleware } = require("../middlewares/authMiddleware")
const { getProjectAnalytics } = require("../controllers/analytics.controller")

const router = Router()

// Protected route to fetch metrics
router.get("/:id", authMiddleware, getProjectAnalytics)

module.exports = router
