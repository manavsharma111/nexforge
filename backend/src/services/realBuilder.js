const { spawn, execSync } = require("child_process")
const path = require("path")
const fs = require("fs")
const extractZip = require("extract-zip")
const Project = require("../models/project.model")
const Deployment = require("../models/deployment.model")
const Log = require("../models/log.model")
const { getIo } = require("../services/socket.ioService")

const DEPLOYMENTS_DIR = path.join(__dirname, "../../../deployments_storage")

// Helper function to execute a shell command and stream logs
const executeCommand = (cmd, args, cwd, appendLog, customEnv = {}) => {
  return new Promise((resolve, reject) => {
    // Merge system env variables with user's custom env variables
    const env = { ...process.env, ...customEnv }

    const isWindows = process.platform === "win32"
    let child
    if (isWindows) {
      // For Windows, pass a single string to spawn when using shell: true to avoid deprecation warnings,
      // while allowing .cmd scripts (like npm.cmd) to execute properly without throwing EINVAL.
      const fullCommand = `${cmd} ${args.join(" ")}`
      child = spawn(fullCommand, { cwd, shell: true, env })
    } else {
      child = spawn(cmd, args, { cwd, shell: false, env })
    }

    // Handle spawn errors (e.g. ENOENT when git/npm is not installed)
    // Without this, Node.js throws an unhandled 'error' event and crashes the process
    child.on("error", (err) => {
      reject(new Error(`Failed to start command "${cmd}": ${err.message}`))
    })

    child.stdout.on("data", (data) => {
      appendLog(data.toString())
    })

    child.stderr.on("data", (data) => {
      // Also log stderr (it's often used for progress bars in npm/git)
      appendLog(data.toString(), "error")
    })

    child.on("close", (code) => {
      if (code === 0) resolve()
      else
        reject(
          new Error(
            `Command "${cmd} ${args.join(" ")}" failed with exit code ${code}`,
          ),
        )
    })
  })
}

const triggerDeploymentPipeline = async (projectId, branch = "main", options = {}) => {
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

    const token =
      project.owner && project.owner.githubToken
        ? project.owner.githubToken
        : null

    const logBatch = []
    let batchTimer = null

    const appendLog = (message, level = "INFO") => {
      let safeMessage = message
      if (token) {
        safeMessage = safeMessage.split(token).join("***")
      }
      const logEntry = { timestamp: new Date(), level, message: safeMessage }
      io.to(roomId).emit("new-log", logEntry)

      logBatch.push(logEntry)
      if (!batchTimer) {
        batchTimer = setTimeout(async () => {
          const logsToSave = [...logBatch]
          logBatch.length = 0
          batchTimer = null
          try {
            await Log.updateOne(
              { projectId },
              { $push: { logs: { $each: logsToSave } } },
            )
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

    // Set initial pipeline status to QUEUED
    await updateStatus("QUEUED")
    await appendLog(
      `🚀 Initializing REAL deployment pipeline for ${project.projectName}...`,
    )

    // Ensure deployments directory exists
    if (!fs.existsSync(DEPLOYMENTS_DIR)) {
      fs.mkdirSync(DEPLOYMENTS_DIR, { recursive: true })
    }

    const baseProjectDir = path.join(DEPLOYMENTS_DIR, projectId.toString())
    if (!fs.existsSync(baseProjectDir)) {
      fs.mkdirSync(baseProjectDir, { recursive: true })
    }
    
    // VERSIONING ARCHITECTURE: Each deployment gets its own folder
    const projectDir = path.join(baseProjectDir, deployment._id.toString())

    // Update pipeline status to INSTALLING
    await updateStatus("INSTALLING")

    const pm2Name = `proj_${projectId}`

    // Stop existing PM2 process before cleaning/building to release file locks
    try {
      execSync(
        `${process.platform === "win32" ? "npx.cmd" : "npx"} pm2 delete ${pm2Name}`,
        { stdio: "ignore", cwd: DEPLOYMENTS_DIR },
      )
    } catch (e) {}

    const cacheDir = path.join(baseProjectDir, "_cache")
    const currentSymlink = path.join(baseProjectDir, "current")
    
    // Back up node_modules from the PREVIOUS current deployment (if it exists)
    let oldNodeModules = null
    if (fs.existsSync(currentSymlink)) {
      try {
        const realCurrentPath = fs.realpathSync(currentSymlink)
        oldNodeModules = path.join(
          realCurrentPath,
          project.rootDirectory || "./",
          "node_modules",
        )
      } catch (e) {}
    }

    if (oldNodeModules && fs.existsSync(oldNodeModules)) {
      await appendLog(`📦 Backing up node_modules to cache from previous version...`)
      try {
        if (!fs.existsSync(cacheDir))
          fs.mkdirSync(cacheDir, { recursive: true })
        const cacheNodeModules = path.join(cacheDir, "node_modules")
        if (fs.existsSync(cacheNodeModules))
          await fs.promises.rm(cacheNodeModules, {
            recursive: true,
            force: true,
          })
        // Copy instead of rename because we want to keep the old version intact for fast rollbacks!
        await fs.promises.cp(oldNodeModules, cacheNodeModules, { recursive: true })
      } catch (e) {}
    }

    await updateStatus("INSTALLING")
    await appendLog("🚀 Deployment pipeline started (New Version: " + deployment._id.toString() + ")")

    // Prepare Environment Variables map
    const customEnv = {
      GIT_TERMINAL_PROMPT: "0",
      GCM_INTERACTIVE: "never",
    }
    const Environment = require("../models/environment.model")
    const envVars = await Environment.find({ projectId: project._id })
    if (envVars && Array.isArray(envVars)) {
      envVars.forEach((envVar) => {
        if (envVar.key && envVar.value) customEnv[envVar.key] = envVar.value
      })
    }

    if (options.source === "cli" && options.zipPath) {
      // CLI deployment: Extract the uploaded zip file instead of cloning
      await appendLog(`📦 Extracting uploaded CLI build...`)
      
      // Ensure the project directory exists before extracting
      if (!fs.existsSync(projectDir)) {
        fs.mkdirSync(projectDir, { recursive: true })
      }
      
      try {
        await extractZip(options.zipPath, { dir: projectDir })
        await appendLog(`✅ Extraction complete.`)
      } catch (err) {
        throw new Error("Failed to extract CLI zip file: " + err.message)
      }
    } else {
      // Standard GitHub deployment: Clone the repository
      await appendLog(`🔍 Cloning repository: ${project.githubRepoUrl}...`)

      let cloneUrl = project.githubRepoUrl
      if (token) {
        if (cloneUrl.startsWith("https://github.com")) {
          cloneUrl = cloneUrl.replace(
            "https://github.com",
            `https://oauth2:${token}@github.com`,
          )
        }
      }
      await executeCommand(
        process.platform === "win32" ? "git.exe" : "git",
        ["clone", "--progress", cloneUrl, projectDir],
        DEPLOYMENTS_DIR,
        appendLog,
        customEnv,
      )
    }

    // 📁 Determine Working Directory based on user's Root Directory setting
    let workingDir = path.join(projectDir, project.rootDirectory || "./")
    
    // Auto-correct working directory for CLI deployments
    // (User might have run 'nexforge deploy' inside the 'frontend' folder, making the zip root the frontend)
    if (options.source === "cli" && !fs.existsSync(path.join(workingDir, "package.json"))) {
      if (fs.existsSync(path.join(projectDir, "package.json"))) {
        workingDir = projectDir
        await appendLog(`📂 CLI Deployment: Auto-corrected Working Directory to root (found package.json)`)
      }
    }
    
    await appendLog(
      `📂 Using Working Directory: ${workingDir === projectDir ? "./" : (project.rootDirectory || "./")}`,
    )

    const cacheNodeModules = path.join(cacheDir, "node_modules")
    const targetNodeModules = path.join(workingDir, "node_modules")
    if (fs.existsSync(cacheNodeModules)) {
      await appendLog(`⚡ Restoring node_modules from cache...`)
      try {
        if (!fs.existsSync(workingDir))
          fs.mkdirSync(workingDir, { recursive: true })
        // Copy back from cache
        await fs.promises.cp(cacheNodeModules, targetNodeModules, { recursive: true })
      } catch (e) {}
    }

    await appendLog(`📥 Running npm install...`)
    await executeCommand(
      process.platform === "win32" ? "npm.cmd" : "npm",
      ["install"],
      workingDir,
      appendLog,
      customEnv,
    )
    await appendLog(`✅ Packages installed successfully.`)

    let projectType = project.projectType || "STATIC"
    let internalPort = project.internalPort

    // Auto-detect NODE backend if it's currently STATIC
    if (projectType === "STATIC") {
      try {
        const packageJsonStr = fs.readFileSync(
          path.join(workingDir, "package.json"),
          "utf8",
        )
        const packageJson = JSON.parse(packageJsonStr)
        if (
          packageJson.dependencies &&
          (packageJson.dependencies.express ||
            packageJson.dependencies.mongoose ||
            packageJson.main)
        ) {
          await appendLog(
            `✨ Auto-detected Node.js backend. Switching project type to NODE.`,
          )
          projectType = "NODE"
          project.projectType = "NODE"
          await project.save()
        }
      } catch (e) {}
    }

    if (projectType === "STATIC") {
      await appendLog(`🔨 Building static frontend...`)
      const buildCommand = project.buildCommand || "npm run build"
      const [cmd, ...args] = buildCommand.split(" ")
      await executeCommand(
        process.platform === "win32" ? `${cmd}.cmd` : cmd,
        args,
        workingDir,
        appendLog,
        customEnv,
      )
      await appendLog(`🎉 Build finished successfully.`)
    } else if (projectType === "NODE") {
      await appendLog(`🚀 Node/Next.js Backend Detected! Starting via PM2...`)

      // If it's Next.js or requires a build step, build it first
      try {
        const packageJsonStr = fs.readFileSync(
          path.join(workingDir, "package.json"),
          "utf8",
        )
        const packageJson = JSON.parse(packageJsonStr)
        if (packageJson.scripts && packageJson.scripts.build) {
          await appendLog(`🔨 Running backend build step...`)
          await executeCommand(
            process.platform === "win32" ? "npm.cmd" : "npm",
            ["run", "build"],
            workingDir,
            appendLog,
            customEnv,
          )
        }
      } catch (e) {}

      const portfinder = require("portfinder")
      portfinder.basePort = 3001
      internalPort = await portfinder.getPortPromise()

      project.internalPort = internalPort
      await project.save()

      await appendLog(
        `🔌 Allocated internal port: ${internalPort}. Starting Process Manager...`,
      )

      // Start using PM2 programmatically via CLI
      const pm2Name = `proj_${projectId}`

      // Pass the port and user env variables
      customEnv.PORT = internalPort.toString()

      await executeCommand(
        process.platform === "win32" ? "npx.cmd" : "npx",
        ["pm2", "start", "npm", "--name", pm2Name, "--", "start"],
        projectDir, // NOTE: this starts it from the new version's folder
        appendLog,
        customEnv,
      )
      await appendLog(`🎉 PM2 Backend Process is running!`)
    }

    // UPDATE SYMLINK TO POINT TO THIS NEW DEPLOYMENT
    if (fs.existsSync(currentSymlink)) {
      // In windows, we must use rimraf or fs.unlinkSync for symlinks
      try { fs.unlinkSync(currentSymlink) } catch(e) {
        try { fs.rmdirSync(currentSymlink) } catch(e2) {}
      }
    }
    
    // Create junction on windows or symlink on unix
    try {
      fs.symlinkSync(projectDir, currentSymlink, "junction")
    } catch(e) {
      await appendLog(`⚠️ Failed to create symlink: ${e.message}`)
    }

    // Re-fetch to ensure we use the latest subdomain if user changed it during build
    const latestProj = await Project.findById(projectId)
    const finalSubdomain = latestProj?.subdomain || projectId.toString()
    const baseDomain = process.env.BASE_DOMAIN || "localhost"
    const isLocal = baseDomain === "localhost"
    const liveUrl = isLocal ? `http://${finalSubdomain}.${baseDomain}:8000` : `https://${finalSubdomain}.${baseDomain}`
    await updateStatus("LIVE", liveUrl)
    await appendLog(`🌐 Deployment is live! URL: ${liveUrl}`)
  } catch (error) {
    console.log("Error in pipeline:", error)
    await Project.findByIdAndUpdate(projectId, { status: "FAILED" })
    const io = getIo()
    io.to(projectId.toString()).emit("status-change", { status: "FAILED" })
    await Log.updateOne(
      { projectId },
      {
        $push: {
          logs: {
            timestamp: new Date(),
            level: "ERROR",
            message: `Pipeline crashed: ${error.message}`,
          },
        },
      },
    )
  }
}

module.exports = { triggerDeploymentPipeline }
