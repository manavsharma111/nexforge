const fs = require("fs")
const path = require("path")

const getAllFiles = (dir, baseDir = dir) => {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...getAllFiles(fullPath, baseDir))
    } else {
      files.push({
        fullPath,
        relativePath: path.relative(baseDir, fullPath).replace(/\\/g, "/"),
      })
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
  const replacerRegex =
    /url\((['"]?)(?:file:\/\/\/)?([A-Za-z]:[\\\\/][^"')]+)\1\)/g

  for (const file of assetFiles) {
    const ext = path.extname(file.fullPath).toLowerCase()
    if (![".css", ".html", ".js", ".svg"].includes(ext)) continue

    let content = await fs.promises.readFile(file.fullPath, "utf8")
    let updated = content.replace(
      replacerRegex,
      (match, quote, windowsPath) => {
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

        const relative = path
          .relative(path.dirname(file.fullPath), candidate.fullPath)
          .replace(/\\/g, "/")
        const safeRelative = relative.startsWith(".")
          ? relative
          : `./${relative}`
        return `url("${safeRelative}")`
      },
    )

    if (updated !== content) {
      await fs.promises.writeFile(file.fullPath, updated, "utf8")
    }
  }
}

module.exports = {
  getAllFiles,
  findAssetByFilename,
  sanitizeLocalAssetUrls
}
