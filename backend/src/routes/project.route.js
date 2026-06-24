const { Router } = require("express")
const { authMiddleware } = require("../middlewares/authMiddleware")
const {
  createProject,
  deployProject,
  getProject,
  getAllProject,
  updateProject,
  deleteProject,
} = require("../controllers/project.controller")

const router = Router()

router.post("/create", authMiddleware, createProject)
router.post("/deploy", authMiddleware, deployProject)
router.get("/:id", authMiddleware, getProject)
router.get("/", authMiddleware, getAllProject)
router.put("/:id", authMiddleware, updateProject)
router.delete("/:id", authMiddleware, deleteProject)

module.exports = router
