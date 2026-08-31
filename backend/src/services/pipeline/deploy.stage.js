const fs = require("fs")
const path = require("path")
const { executeCommand } = require("./process.util")
const { uploadDirectory, deletePrefix } = require("../../config/r2")

const executeDeployStage = async (ctx, resolvedSrcDir) => {
  const {
    project,
    projectId,
    projectType,
    builtDistPath,
    projectDir,
    appendLog,
    customEnv,
    r2DeploymentPrefix,
    r2ProjectPrefix,
    workingDir
  } = ctx

  if (projectType === "STATIC") {
    // Upload dist to Cloudflare R2 
    await appendLog(`☁️ Uploading build to Cloudflare R2...`)
    const r2DistPrefix = `${r2DeploymentPrefix}/dist`

    // Delete old 'current' R2 prefix and upload new one
    try {
      await deletePrefix(`${r2ProjectPrefix}/current`)
    } catch (e) {}

    let uploadedCount = 0
    let lastLoggedPercent = 0
    const totalFiles = await uploadDirectory(
      builtDistPath,
      r2DistPrefix,
      (done, total) => { 
        uploadedCount = done 
        const percent = Math.floor((done / total) * 100)
        if (percent >= lastLoggedPercent + 10) {
          appendLog(`⏳ Uploading build: ${percent}% (${done}/${total} files)`)
          lastLoggedPercent = percent
        }
      }
    )
    await appendLog(`✅ Uploaded ${totalFiles} files to R2 at: ${r2DistPrefix}`)

    // Also write a 'current' pointer prefix (copy references) by uploading to current prefix
    await uploadDirectory(builtDistPath, `${r2ProjectPrefix}/current/dist`)
    await appendLog(`🔗 Updated 'current' pointer in R2.`)

    // Clean up local temp dirs
    try { await fs.promises.rm(builtDistPath, { recursive: true, force: true }) } catch (e) {}
    if (typeof resolvedSrcDir !== "undefined") {
      try { await fs.promises.rm(resolvedSrcDir, { recursive: true, force: true }) } catch (e) {}
    }
    try { await fs.promises.rm(projectDir, { recursive: true, force: true }) } catch (e) {}

  } else if (projectType === "NODE") {
    // Upload app to R2 
    const appSrcDir = typeof resolvedSrcDir !== "undefined" ? resolvedSrcDir : projectDir
    await appendLog(`☁️ Uploading app to Cloudflare R2...`)
    const r2AppPrefix = `${r2DeploymentPrefix}/app`
    
    let lastLoggedPercent = 0
    await uploadDirectory(appSrcDir, r2AppPrefix, (done, total) => {
      const percent = Math.floor((done / total) * 100)
      if (percent >= lastLoggedPercent + 10) {
        appendLog(`⏳ Uploading app source: ${percent}% (${done}/${total} files)`)
        lastLoggedPercent = percent
      }
    })
    await appendLog(`✅ App uploaded to R2.`)

    // Update 'current' pointer in R2
    try { await deletePrefix(`${r2ProjectPrefix}/current`) } catch (e) {}
    await uploadDirectory(appSrcDir, `${r2ProjectPrefix}/current/app`)

    // Prepare persistent directory for PM2 runtime 
    if (typeof resolvedSrcDir !== "undefined" && resolvedSrcDir !== projectDir) {
      await appendLog(`💾 Copying app from temporary build directory to persistent storage...`)
      if (fs.existsSync(projectDir)) {
        await fs.promises.rm(projectDir, { recursive: true, force: true })
      }
      await fs.promises.cp(resolvedSrcDir, projectDir, { recursive: true })
      await appendLog(`✅ App copied to: ${projectDir}`)
      try { await fs.promises.rm(resolvedSrcDir, { recursive: true, force: true }) } catch (e) {}
    }

    await appendLog(`📥 Using persistent app source for runtime at ${projectDir}`)

    const portfinder = require("portfinder")
    portfinder.basePort = 3001
    const internalPort = await portfinder.getPortPromise()

    project.internalPort = internalPort
    // Store R2 prefix so we can re-download on restart
    project.r2Prefix = r2AppPrefix
    await project.save()

    await appendLog(`🔌 Allocated internal port: ${internalPort}. Starting Process Manager...`)

    const pm2Name = `proj_${projectId}`
    customEnv.PORT = internalPort.toString()

    const pm2WorkDir = path.join(projectDir, project.rootDirectory || "./")

    await executeCommand(
      process.platform === "win32" ? "npx.cmd" : "npx",
      ["pm2", "start", "npm", "--name", pm2Name, "--", "start"],
      pm2WorkDir,
      appendLog,
      customEnv
    )
    await appendLog(`🎉 PM2 Backend Process is running!`)
  }
}

module.exports = { executeDeployStage }
