const fs = require("fs")
const path = require("path")
const { executeCommand } = require("./process.util")
const { sanitizeLocalAssetUrls } = require("./file.util")

const executeBuildStage = async (ctx, resolvedSrcDir) => {
  const { project, options, projectDir, appendLog, customEnv } = ctx

  // 📁 Determine Working Directory
  const effectiveSrcDir = typeof resolvedSrcDir !== "undefined" ? resolvedSrcDir : projectDir
  let workingDir = path.join(effectiveSrcDir, project.rootDirectory || "./")

  // Auto-correct working directory for CLI deployments
  if (options.source === "cli" && !fs.existsSync(path.join(workingDir, "package.json"))) {
    if (fs.existsSync(path.join(effectiveSrcDir, "package.json"))) {
      workingDir = effectiveSrcDir
      await appendLog(`📂 CLI Deployment: Auto-corrected Working Directory to root (found package.json)`)
    }
  }

  await appendLog(`📂 Using Working Directory: ${workingDir === projectDir ? "./" : project.rootDirectory || "./"}`)

  await appendLog(`📥 Running npm install...`)
  await executeCommand(
    process.platform === "win32" ? "npm.cmd" : "npm",
    ["install"],
    workingDir,
    appendLog,
    customEnv
  )
  await appendLog(`✅ Packages installed successfully.`)

  let projectType = project.projectType || "STATIC"

  // Auto-detect NODE backend if it's currently STATIC
  if (projectType === "STATIC") {
    try {
      const packageJsonStr = fs.readFileSync(path.join(workingDir, "package.json"), "utf8")
      const packageJson = JSON.parse(packageJsonStr)
      if (
        packageJson.dependencies &&
        (packageJson.dependencies.express ||
          packageJson.dependencies.mongoose ||
          packageJson.main)
      ) {
        await appendLog(`✨ Auto-detected Node.js backend. Switching project type to NODE.`)
        projectType = "NODE"
        project.projectType = "NODE"
        await project.save()
      }
    } catch (e) {}
  }

  // Update context for the deploy stage
  ctx.projectType = projectType
  ctx.workingDir = workingDir

  if (projectType === "STATIC") {
    await appendLog(`🔨 Building static frontend...`)
    const buildCommand = project.buildCommand || "npm run build"
    const [cmd, ...args] = buildCommand.split(" ")
    await executeCommand(
      process.platform === "win32" ? `${cmd}.cmd` : cmd,
      args,
      workingDir,
      appendLog,
      customEnv
    )
    await appendLog(`🎉 Build finished successfully.`)

    const outDir = project.outputDirectory || "dist"
    const builtDistPath = path.join(workingDir, outDir)

    // Sanitize any accidentally embedded local file URLs before upload
    try {
      await sanitizeLocalAssetUrls(builtDistPath, workingDir)
      await appendLog(`🔧 Sanitized local file URLs in build output.`)
    } catch (sanitizationError) {
      await appendLog(`⚠️ Build sanitization failed: ${sanitizationError.message}`)
    }

    ctx.builtDistPath = builtDistPath
  } else if (projectType === "NODE") {
    await appendLog(`🚀 Node/Next.js Backend Detected!`)

    // If it's Next.js or requires a build step, build it first
    try {
      const packageJsonStr = fs.readFileSync(path.join(workingDir, "package.json"), "utf8")
      const packageJson = JSON.parse(packageJsonStr)
      if (packageJson.scripts && packageJson.scripts.build) {
        await appendLog(`🔨 Running backend build step...`)
        await executeCommand(
          process.platform === "win32" ? "npm.cmd" : "npm",
          ["run", "build"],
          workingDir,
          appendLog,
          customEnv
        )
      }
    } catch (e) {}
  }

  return ctx
}

module.exports = { executeBuildStage }
