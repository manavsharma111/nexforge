const { Router } = require("express")
const { authMiddleware } = require("../middlewares/authMiddleware")
const {
  createDomain,
  getDomain,
  getAllDomain,
  updateDomain,
  deleteDomain,
} = require("../controllers/domain.controller")

const router = Router()

// All domain routes should be protected
router.use(authMiddleware)

router.post("/create", createDomain)
router.get("/", getAllDomain)
router.get("/:id", getDomain)
router.put("/:id", updateDomain)
router.delete("/:id", deleteDomain)

module.exports = router
