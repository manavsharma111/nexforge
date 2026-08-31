const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")
const Project = require("../models/project.model")
const Deployment = require("../models/deployment.model")
const Log = require("../models/log.model")
const { getIo } = require("../services/socket.ioService")

const { executeSourceStage } = require("./pipeline/source.stage")
const { executeBuildStage } = require("./pipeline/build.stage")
const { executeDeployStage } = require("./pipeline/deploy.stage")

const DEPLOYMENTS_DIR = path.join(__dirname, "../../../deployments_storage")

const triggerDeploymentPipeline = async (
  projectId,
  branch = "main",
  options = {},
) => {
  try {
    const project = await Project.findById(projectId).populate("owner")
    if (!project) return console.log("Project not found!")

    const io = getIo()
    const roomId = projectId.toString()

    const deployment = await Deployment.create({
      projectId,
      branch,
      status: "QUEUED",
    })

    await Log.findOneAndUpdate(
      { projectId },
      { $set: { logs: [] } },
      { returnDocument: "after", upsert: true },
    )

    const token = project.owner && project.owner.githubToken ? project.owner.githubToken : null
    const logBatch = []
    let batchTimer = null

    const appendLog = (message, level = "INFO") => {
      let safeMessage = message
      if (token) safeMessage = safeMessage.split(token).join("***")
      const logEntry = { timestamp: new Date(), level, message: safeMessage }
      io.to(roomId).emit("new-log", logEntry)

      logBatch.push(logEntry)
      if (!batchTimer) {
        batchTimer = setTimeout(async () => {
          const logsToSave = [...logBatch]
          logBatch.length = 0
          batchTimer = null
          try {
            await Log.updateOne({ projectId }, { $push: { logs: { $each: logsToSave } } })
          } catch (e) {}
        }, 1000)
      }
    }

    const updateStatus = async (newStatus, url = null) => {
      const updateObj = { status: newStatus }
      if (url) updateObj.liveUrl = url
      await Project.findByIdAndUpdate(projectId, updateObj)
      await Deployment.findByIdAndUpdate(deployment._id, {
        status: newStatus,
        ...(url ? { previewUrl: url } : {}),
      })
      io.to(roomId).emit("status-change", { status: newStatus, liveUrl: url })
    }

    await updateStatus("QUEUED")
    await appendLog(`🚀 Initializing REAL deployment pipeline for ${project.projectName}...`)

    if (!fs.existsSync(DEPLOYMENTS_DIR)) fs.mkdirSync(DEPLOYMENTS_DIR, { recursive: true })
    const baseProjectDir = path.join(DEPLOYMENTS_DIR, projectId.toString())
    if (!fs.existsSync(baseProjectDir)) fs.mkdirSync(baseProjectDir, { recursive: true })

    const deploymentId = deployment._id.toString()
    const r2ProjectPrefix = projectId.toString()
    const r2DeploymentPrefix = `${r2ProjectPrefix}/${deploymentId}`
    const projectDir = path.join(baseProjectDir, deploymentId)

    await updateStatus("INSTALLING")

    const pm2Name = `proj_${projectId}`
    try {
      execSync(`${process.platform === "win32" ? "npx.cmd" : "npx"} pm2 delete ${pm2Name}`, { stdio: "ignore", cwd: DEPLOYMENTS_DIR })
    } catch (e) {}

    const cacheDir = path.join(baseProjectDir, "_cache")
    const currentSymlink = path.join(baseProjectDir, "current")

    let oldNodeModules = null
    if (fs.existsSync(currentSymlink)) {
      try {
        const realCurrentPath = fs.realpathSync(currentSymlink)
        oldNodeModules = path.join(realCurrentPath, project.rootDirectory || "./", "node_modules")
      } catch (e) {}
    }

    if (oldNodeModules && fs.existsSync(oldNodeModules)) {
      await appendLog(`📦 Backing up node_modules to cache from previous version...`)
      try {
        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true })
        const cacheNodeModules = path.join(cacheDir, "node_modules")
        if (fs.existsSync(cacheNodeModules)) await fs.promises.rm(cacheNodeModules, { recursive: true, force: true })
        await fs.promises.cp(oldNodeModules, cacheNodeModules, { recursive: true })
      } catch (e) {}
    }

    await updateStatus("INSTALLING")
    await appendLog("🚀 Deployment pipeline started (New Version: " + deployment._id.toString() + ")")

    const customEnv = { GIT_TERMINAL_PROMPT: "0", GCM_INTERACTIVE: "never" }
    const Environment = require("../models/environment.model")
    const envVars = await Environment.find({ projectId: project._id })
    if (envVars && Array.isArray(envVars)) {
      envVars.forEach((envVar) => {
        if (envVar.key && envVar.value) customEnv[envVar.key] = envVar.value
      })
    }

    // PIPELINE STAGES 
    const ctx = {
      projectId,
      deployment,
      project,
      options,
      branch,
      token,
      appendLog,
      updateStatus,
      customEnv,
      r2ProjectPrefix,
      r2DeploymentPrefix,
      baseProjectDir,
      projectDir,
      cacheDir
    }

    // Stage 1: Download & Extract
    const resolvedSrcDir = await executeSourceStage(ctx)

    // Stage 2: Install & Build
    await executeBuildStage(ctx, resolvedSrcDir)

    // Stage 3: Upload & Deploy
    await executeDeployStage(ctx, resolvedSrcDir)

    // FINALIZATION 
    const latestProj = await Project.findById(projectId)
    const finalSubdomain = latestProj?.subdomain || projectId.toString()
    const baseDomain = process.env.BASE_DOMAIN || "nexforge-sandy.vercel.app"
    const isLocal = baseDomain === "localhost"

    const liveUrl = isLocal
      ? "http://" + finalSubdomain + `.${baseDomain}:8000/p/${finalSubdomain}`
      : "https://" + baseDomain + `/p/${finalSubdomain}`
      
    await appendLog(`✅ Project will be served at path-based URL for stability.`)
    await updateStatus("LIVE", liveUrl)
    await appendLog(`🌐 Deployment is live! URL: ${liveUrl}`)
    await appendLog(`☁️ Files stored in R2 at prefix: ${r2DeploymentPrefix}`)

  } catch (error) {
    console.log("Error in pipeline:", error)
    await Project.findByIdAndUpdate(projectId, { status: "FAILED" })
    const io = getIo()
    io.to(projectId.toString()).emit("status-change", { status: "FAILED" })
    await Log.updateOne(
      { projectId },
      { $push: { logs: { timestamp: new Date(), level: "ERROR", message: `Pipeline crashed: ${error.message}` } } }
    )
  }
}

module.exports = { triggerDeploymentPipeline }
