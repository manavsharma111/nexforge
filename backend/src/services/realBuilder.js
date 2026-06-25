const { spawn, execSync } = require("child_process")
const path = require("path")
const fs = require("fs")
const axios = require("axios")
const extractZip = require("extract-zip")
const Project = require("../models/project.model")
const Deployment = require("../models/deployment.model")
const Log = require("../models/log.model")
const { getIo } = require("../services/socket.ioService")
const { uploadDirectory, deletePrefix } = require("../config/r2")

// Local temp dir for build processes only (cleaned up after upload to R2)
const DEPLOYMENTS_DIR = path.join(__dirname, "../../../deployments_storage")

const getAllFiles = (dir, baseDir = dir) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...getAllFiles(fullPath, baseDir))
    } else {
      files.push({ fullPath, relativePath: path.relative(baseDir, fullPath).replace(/\\/g, "/") })
    }
  }
  return files
}

const findAssetByFilename = (rootDir, fileName) => {
  const files = getAllFiles(rootDir)
  return files.find((file) => path.basename(file.fullPath) === fileName)
}

const sanitizeLocalAssetUrls = async (builtDistPath, sourceDir) => {
  const assetFiles = getAllFiles(builtDistPath)
  const replacerRegex = /url\((['"]?)(?:file:\/\/\/)?([A-Za-z]:[\\\\/][^"')]+)\1\)/g

  for (const file of assetFiles) {
    const ext = path.extname(file.fullPath).toLowerCase()
    if (![".css", ".html", ".js", ".svg"].includes(ext)) continue

    let content = await fs.promises.readFile(file.fullPath, "utf8")
    let updated = content.replace(replacerRegex, (match, quote, windowsPath) => {
      const filename = path.basename(windowsPath)
      let candidate = findAssetByFilename(builtDistPath, filename)

      if (!candidate) {
        const sourceCandidate = findAssetByFilename(sourceDir, filename)
        if (sourceCandidate) {
          const targetFolder = path.join(builtDistPath, "fonts")
          fs.mkdirSync(targetFolder, { recursive: true })
          const targetPath = path.join(targetFolder, filename)
          if (!fs.existsSync(targetPath)) {
            fs.copyFileSync(sourceCandidate.fullPath, targetPath)
          }
          candidate = { fullPath: targetPath }
        }
      }

      if (!candidate) return match

      const relative = path.relative(path.dirname(file.fullPath), candidate.fullPath).replace(/\\/g, "/")
      const safeRelative = relative.startsWith(".") ? relative : `./${relative}`
      return `url("${safeRelative}")`
    })

    if (updated !== content) {
      await fs.promises.writeFile(file.fullPath, updated, "utf8")
    }
  }
}

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
    
    // Each deployment gets its own R2 prefix: {projectId}/{deploymentId}/
    const deploymentId = deployment._id.toString()
    const r2ProjectPrefix = projectId.toString()
    const r2DeploymentPrefix = `${r2ProjectPrefix}/${deploymentId}`

    // Local temp dir for build (will be cleaned up after upload to R2)
    const projectDir = path.join(baseProjectDir, deploymentId)

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
      // Standard GitHub deployment: Download to /tmp (large ephemeral disk)
      // to avoid filling up the small Railway volume during build
      await appendLog(`📥 Downloading repository: ${project.githubRepoUrl}...`)

      const repoMatch = project.githubRepoUrl.match(
        /github\.com\/([^\/]+)\/([^\/]+?)(?:\.git)?(?:\/)?$/
      )
      if (!repoMatch) throw new Error(`Invalid GitHub URL: ${project.githubRepoUrl}`)

      const [, repoOwner, repoName] = repoMatch
      const altBranch = branch === "main" ? "master" : "main"

      await appendLog(`🔗 Repo: ${repoOwner}/${repoName} | Branch: ${branch} | Token: ${token ? "✅ present" : "❌ missing"}`)

      // Try downloading with multiple fallback strategies
      const tryDownload = async (branchName, useToken) => {
        const url = `https://api.github.com/repos/${repoOwner}/${repoName}/zipball/${branchName}`
        const hdrs = { "User-Agent": "NexForge-Platform" }
        if (useToken && token) hdrs["Authorization"] = `Bearer ${token}`
        const res = await axios({ method: "get", url, responseType: "arraybuffer", headers: hdrs, maxRedirects: 10, timeout: 60000 })
        return { data: res.data, branch: branchName }
      }

      let zipData
      const strategies = [
        { branchName: branch,    useToken: true,  label: `${branch} (with token)` },
        { branchName: branch,    useToken: false, label: `${branch} (public)` },
        { branchName: altBranch, useToken: true,  label: `${altBranch} (with token)` },
        { branchName: altBranch, useToken: false, label: `${altBranch} (public)` },
      ]

      let succeeded = false
      for (const strategy of strategies) {
        try {
          const result = await tryDownload(strategy.branchName, strategy.useToken)
          zipData = result.data
          // Update branch if we fell back to alt
          if (result.branch !== branch) {
            await appendLog(`✅ Downloaded using branch: ${result.branch} (auto-detected)`)
            branch = result.branch
          } else {
            await appendLog(`✅ Download complete.`)
          }
          succeeded = true
          break
        } catch (e) {
          const s = e.response ? e.response.status : "network error"
          await appendLog(`⚠️ Strategy "${strategy.label}" failed (${s}), trying next...`, "error")
        }
      }

      if (!succeeded) {
        throw new Error(
          `Failed to download repository after all attempts. ` +
          `Repo: ${repoOwner}/${repoName}. ` +
          `Please verify the repo exists and reconnect GitHub in Settings (token may be expired).`
        )
      }

      // Use /tmp for source + build (large disk), volume only for final artifacts
      const tmpSrcDir = `/tmp/nexforge_build_${deployment._id.toString()}`
      const tmpZipPath = `${tmpSrcDir}.zip`
      const tmpExtractPath = `${tmpSrcDir}_extract`

      fs.writeFileSync(tmpZipPath, zipData)
      await appendLog(`✅ Download complete. Extracting to /tmp...`)

      fs.mkdirSync(tmpExtractPath, { recursive: true })
      await extractZip(tmpZipPath, { dir: tmpExtractPath })

      // GitHub zipball wraps content in a root folder: {owner}-{repo}-{sha}/
      const innerFolders = fs.readdirSync(tmpExtractPath)
      if (innerFolders.length === 0) throw new Error("Downloaded archive is empty")

      const innerPath = path.join(tmpExtractPath, innerFolders[0])
      fs.mkdirSync(tmpSrcDir, { recursive: true })

      // Move all files from the inner folder to tmpSrcDir
      for (const file of fs.readdirSync(innerPath)) {
        fs.renameSync(path.join(innerPath, file), path.join(tmpSrcDir, file))
      }

      // Cleanup zip and extract temp
      try { fs.rmSync(tmpZipPath) } catch (e) {}
      try { fs.rmSync(tmpExtractPath, { recursive: true, force: true }) } catch (e) {}

      await appendLog(`✅ Repository extracted to /tmp.`)

      // Point projectDir to tmpSrcDir for the build phase
      // After build, we'll copy only what's needed to the volume
      Object.defineProperty(this, '_tmpSrcDir', { value: tmpSrcDir, writable: true })
      // Store tmpSrcDir reference via a local variable for use below
      // eslint-disable-next-line no-var
      var resolvedSrcDir = tmpSrcDir
    }

    // 📁 Determine Working Directory
    // For GitHub deploys: work in /tmp src dir; for CLI: work in volume projectDir
    const effectiveSrcDir = (typeof resolvedSrcDir !== 'undefined') ? resolvedSrcDir : projectDir
    let workingDir = path.join(effectiveSrcDir, project.rootDirectory || "./")
    
    // Auto-correct working directory for CLI deployments
    if (options.source === "cli" && !fs.existsSync(path.join(workingDir, "package.json"))) {
      if (fs.existsSync(path.join(effectiveSrcDir, "package.json"))) {
        workingDir = effectiveSrcDir
        await appendLog(`📂 CLI Deployment: Auto-corrected Working Directory to root (found package.json)`)
      }
    }
    
    await appendLog(
      `📂 Using Working Directory: ${workingDir === projectDir ? "./" : (project.rootDirectory || "./")}`,
    )

    const cacheNodeModules = path.join(cacheDir, "node_modules")
    const targetNodeModules = path.join(workingDir, "node_modules")
    // NOTE: node_modules cache disabled to conserve disk space on Railway (0.5 GB volume)
    // node_modules are deleted after frontend builds anyway (only dist is served)

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

      // Sanitize any accidentally embedded local file URLs before upload
      try {
        await sanitizeLocalAssetUrls(builtDistPath, workingDir)
        await appendLog(`🔧 Sanitized local file URLs in build output.`)
      } catch (sanitizationError) {
        await appendLog(`⚠️ Build sanitization failed: ${sanitizationError.message}`)
      }

      // Copy ONLY the built dist to the volume (saves volume space)
      const outDir = project.outputDirectory || "dist"
      const builtDistPath = path.join(workingDir, outDir)
      const volumeDistPath = path.join(projectDir, project.rootDirectory || "./", outDir)

      // ── Upload dist to Cloudflare R2 ──────────────────────────────────────
      await appendLog(`☁️ Uploading build to Cloudflare R2...`)
      const r2DistPrefix = `${r2DeploymentPrefix}/dist`

      // Delete old 'current' R2 prefix and upload new one
      try { await deletePrefix(`${r2ProjectPrefix}/current`) } catch(e) {}

      let uploadedCount = 0
      const totalFiles = await uploadDirectory(
        builtDistPath,
        r2DistPrefix,
        (done, total) => { uploadedCount = done }
      )
      await appendLog(`✅ Uploaded ${totalFiles} files to R2 at: ${r2DistPrefix}`)

      // Also write a 'current' pointer prefix (copy references) by uploading to current prefix
      await uploadDirectory(builtDistPath, `${r2ProjectPrefix}/current/dist`)
      await appendLog(`🔗 Updated 'current' pointer in R2.`)

      // Clean up local temp dirs
      try { await fs.promises.rm(builtDistPath, { recursive: true, force: true }) } catch(e) {}
      if (typeof resolvedSrcDir !== 'undefined') {
        try { await fs.promises.rm(resolvedSrcDir, { recursive: true, force: true }) } catch(e) {}
      }
      try { await fs.promises.rm(projectDir, { recursive: true, force: true }) } catch(e) {}

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

      // ── Upload app to R2 ─────────────────────────────────────────────────
      const appSrcDir = typeof resolvedSrcDir !== 'undefined' ? resolvedSrcDir : projectDir
      await appendLog(`☁️ Uploading app to Cloudflare R2...`)
      const r2AppPrefix = `${r2DeploymentPrefix}/app`
      await uploadDirectory(appSrcDir, r2AppPrefix)
      await appendLog(`✅ App uploaded to R2.`)

      // Update 'current' pointer in R2
      try { await deletePrefix(`${r2ProjectPrefix}/current`) } catch(e) {}
      await uploadDirectory(appSrcDir, `${r2ProjectPrefix}/current/app`)

      // ── Use the local app source directly for PM2 runtime
      const pm2AppDir = appSrcDir
      await appendLog(`📥 Using local app source for runtime at ${pm2AppDir}`)

      const portfinder = require("portfinder")
      portfinder.basePort = 3001
      internalPort = await portfinder.getPortPromise()

      project.internalPort = internalPort
      // Store R2 prefix so we can re-download on restart
      project.r2Prefix = r2AppPrefix
      await project.save()

      await appendLog(
        `🔌 Allocated internal port: ${internalPort}. Starting Process Manager...`,
      )

      const pm2Name = `proj_${projectId}`
      customEnv.PORT = internalPort.toString()

      const pm2WorkDir = path.join(pm2AppDir, project.rootDirectory || "./")

      await executeCommand(
        process.platform === "win32" ? "npx.cmd" : "npx",
        ["pm2", "start", "npm", "--name", pm2Name, "--", "start"],
        pm2WorkDir,
        appendLog,
        customEnv,
      )
      await appendLog(`🎉 PM2 Backend Process is running!`)
    }

    // Re-fetch to ensure we use the latest subdomain if user changed it during build
    const latestProj = await Project.findById(projectId)
    const finalSubdomain = latestProj?.subdomain || projectId.toString()
    const baseDomain = process.env.BASE_DOMAIN || "localhost"
    const isLocal = baseDomain === "localhost"
    const isRailway = baseDomain.includes("railway.app")

    let liveUrl
    const r2PublicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL

    if (projectType === "STATIC") {
      // Serve static sites via path-based URL (secure, works on Railway without cert issues)
      liveUrl = isLocal
        ? `http://${finalSubdomain}.${baseDomain}:8000/p/${projectId}`
        : `https://${baseDomain}/p/${projectId}`
      await appendLog(`✅ Static site served via path-based platform route`)
    } else {
      // NODE/backend → proxy through Railway subdomain
      liveUrl = isLocal
        ? `http://${finalSubdomain}.${baseDomain}:8000`
        : isRailway
          ? `http://${finalSubdomain}.${baseDomain}`
          : `https://${finalSubdomain}.${baseDomain}`
    }

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
