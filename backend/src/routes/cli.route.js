const express = require("express")
const router = express.Router()
const multer = require("multer")
const path = require("path")
const fs = require("fs")
const {
  handleCliDeploy,
  handleCliInit,
  handleCliEnvPush,
  handleCliEnvPull,
  handleCliGetDeployments,
  handleCliRollback,
  handleCliRename,
  handleCliInfo,
  handleCliAddDomain,
  handleCliGetDomains,
} = require("../controllers/cli.controller")
const { requireCliAuth } = require("../middlewares/cliAuthMiddleware")

// We use multer to handle the incoming zip file upload
const uploadDir = path.join(
  __dirname,
  "../../../deployments_storage/_temp_uploads",
)
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir)
  },
  filename: function (req, file, cb) {
    // Generate a unique name for the uploaded zip file
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, file.fieldname + "-" + uniqueSuffix + ".zip")
  },
})

const upload = multer({ storage: storage })

// We apply requireCliAuth to all routes here to ensure only authenticated users can deploy/init

// This route receives the zip file from the CLI and hands it to the controller
router.post(
  "/deploy/:projectId",
  requireCliAuth,
  upload.single("projectZip"),
  handleCliDeploy,
)

// This route initializes a new project from the CLI
router.post("/init", requireCliAuth, handleCliInit)

// Environment variable syncing
router.post("/env/push/:projectId", requireCliAuth, handleCliEnvPush)
router.get("/env/pull/:projectId", requireCliAuth, handleCliEnvPull)

// Versioning and Rollback
router.get("/deployments/:projectId", requireCliAuth, handleCliGetDeployments)
router.post("/rollback/:projectId", requireCliAuth, handleCliRollback)

// Renaming
router.post("/rename/:projectId", requireCliAuth, handleCliRename)

// Info and Domains
router.get("/info/:projectId", requireCliAuth, handleCliInfo)
router.post("/domains/:projectId", requireCliAuth, handleCliAddDomain)
router.get("/domains/:projectId", requireCliAuth, handleCliGetDomains)

module.exports = router
