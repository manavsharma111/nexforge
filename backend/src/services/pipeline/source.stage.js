const fs = require("fs")
const path = require("path")
const axios = require("axios")
const extractZip = require("extract-zip")

const executeSourceStage = async (ctx) => {
  const {
    options,
    project,
    deployment,
    branch,
    token,
    appendLog,
    projectDir,
  } = ctx

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
      return projectDir // For CLI, resolvedSrcDir is just projectDir
    } catch (err) {
      throw new Error("Failed to extract CLI zip file: " + err.message)
    }
  } else {
    // Standard GitHub deployment: Download to /tmp (large ephemeral disk)
    await appendLog(`📥 Downloading repository: ${project.githubRepoUrl}...`)

    const repoMatch = project.githubRepoUrl.match(
      /github\.com\/([^\/]+)\/([^\/]+?)(?:\.git)?(?:\/)?$/,
    )
    if (!repoMatch)
      throw new Error(`Invalid GitHub URL: ${project.githubRepoUrl}`)

    const [, repoOwner, repoName] = repoMatch
    const altBranch = branch === "main" ? "master" : "main"

    await appendLog(
      `🔗 Repo: ${repoOwner}/${repoName} | Branch: ${branch} | Token: ${token ? "✅ present" : "❌ missing"}`,
    )

    // Try downloading with multiple fallback strategies
    const tryDownload = async (branchName, useToken) => {
      const url = `https://api.github.com/repos/${repoOwner}/${repoName}/zipball/${branchName}`
      const hdrs = { "User-Agent": "NexForge-Platform" }
      if (useToken && token) hdrs["Authorization"] = `Bearer ${token}`
      const res = await axios({
        method: "get",
        url,
        responseType: "arraybuffer",
        headers: hdrs,
        maxRedirects: 10,
        timeout: 60000,
      })
      return { data: res.data, branch: branchName }
    }

    let zipData
    let activeBranch = branch
    const strategies = [
      { branchName: activeBranch, useToken: true, label: `${activeBranch} (with token)` },
      { branchName: activeBranch, useToken: false, label: `${activeBranch} (public)` },
      { branchName: altBranch, useToken: true, label: `${altBranch} (with token)` },
      { branchName: altBranch, useToken: false, label: `${altBranch} (public)` },
    ]

    let succeeded = false
    for (const strategy of strategies) {
      try {
        const result = await tryDownload(strategy.branchName, strategy.useToken)
        zipData = result.data
        if (result.branch !== activeBranch) {
          await appendLog(`✅ Downloaded using branch: ${result.branch} (auto-detected)`)
          activeBranch = result.branch
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
        `Failed to download repository after all attempts. Repo: ${repoOwner}/${repoName}. Please verify the repo exists and reconnect GitHub in Settings.`
      )
    }

    const tmpSrcDir = `/tmp/nexforge_build_${deployment._id.toString()}`
    const tmpZipPath = `${tmpSrcDir}.zip`
    const tmpExtractPath = `${tmpSrcDir}_extract`

    fs.writeFileSync(tmpZipPath, zipData)
    await appendLog(`✅ Download complete. Extracting to /tmp...`)

    fs.mkdirSync(tmpExtractPath, { recursive: true })
    await extractZip(tmpZipPath, { dir: tmpExtractPath })

    const innerFolders = fs.readdirSync(tmpExtractPath)
    if (innerFolders.length === 0) throw new Error("Downloaded archive is empty")

    const innerPath = path.join(tmpExtractPath, innerFolders[0])
    fs.mkdirSync(tmpSrcDir, { recursive: true })

    for (const file of fs.readdirSync(innerPath)) {
      fs.renameSync(path.join(innerPath, file), path.join(tmpSrcDir, file))
    }

    try { fs.rmSync(tmpZipPath) } catch (e) {}
    try { fs.rmSync(tmpExtractPath, { recursive: true, force: true }) } catch (e) {}

    await appendLog(`✅ Repository extracted to /tmp.`)
    
    // Update branch in context if we auto-switched
    ctx.branch = activeBranch
    return tmpSrcDir
  }
}

module.exports = { executeSourceStage }
