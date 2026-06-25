const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectsCommand,
  ListObjectsV2Command,
  HeadObjectCommand,
} = require("@aws-sdk/client-s3")
const fs = require("fs")
const path = require("path")

// ─── R2 Client (S3-compatible) ───────────────────────────────────────────────

const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_KEY,
  },
})

const BUCKET = process.env.CLOUDFLARE_R2_BUCKET

// ─── Upload a single file ─────────────────────────────────────────────────────
const uploadFile = async (localFilePath, r2Key) => {
  const fileStream = fs.createReadStream(localFilePath)
  const stat = fs.statSync(localFilePath)

  await r2Client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: r2Key,
      Body: fileStream,
      ContentLength: stat.size,
    })
  )
}

// ─── Upload entire local directory recursively ────────────────────────────────
const uploadDirectory = async (localDirPath, r2Prefix, onProgress = null) => {
  const getAllFiles = (dir, baseDir = dir) => {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    const files = []
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        files.push(...getAllFiles(fullPath, baseDir))
      } else {
        const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, "/")
        files.push({ fullPath, relativePath })
      }
    }
    return files
  }

  const files = getAllFiles(localDirPath)
  let uploaded = 0

  // Upload in batches of 10 for speed
  const BATCH_SIZE = 10
  for (let i = 0; i < files.length; i += BATCH_SIZE) {
    const batch = files.slice(i, i + BATCH_SIZE)
    await Promise.all(
      batch.map(async ({ fullPath, relativePath }) => {
        const r2Key = `${r2Prefix}/${relativePath}`
        await uploadFile(fullPath, r2Key)
        uploaded++
        if (onProgress) onProgress(uploaded, files.length)
      })
    )
  }

  return files.length
}

// ─── Download a single file from R2 ──────────────────────────────────────────
const downloadFile = async (r2Key, localFilePath) => {
  const response = await r2Client.send(
    new GetObjectCommand({ Bucket: BUCKET, Key: r2Key })
  )

  fs.mkdirSync(path.dirname(localFilePath), { recursive: true })
  const writeStream = fs.createWriteStream(localFilePath)

  await new Promise((resolve, reject) => {
    response.Body.pipe(writeStream)
    writeStream.on("finish", resolve)
    writeStream.on("error", reject)
  })
}

// ─── Download entire R2 prefix to local directory ─────────────────────────────
const downloadDirectory = async (r2Prefix, localDirPath, onProgress = null) => {
  // List all objects under prefix
  const objects = []
  let continuationToken = undefined

  do {
    const res = await r2Client.send(
      new ListObjectsV2Command({
        Bucket: BUCKET,
        Prefix: r2Prefix + "/",
        ContinuationToken: continuationToken,
      })
    )
    if (res.Contents) objects.push(...res.Contents)
    continuationToken = res.IsTruncated ? res.NextContinuationToken : undefined
  } while (continuationToken)

  let downloaded = 0
  const BATCH_SIZE = 10

  for (let i = 0; i < objects.length; i += BATCH_SIZE) {
    const batch = objects.slice(i, i + BATCH_SIZE)
    await Promise.all(
      batch.map(async (obj) => {
        const relativePath = obj.Key.slice(r2Prefix.length + 1) // strip prefix/
        const localFilePath = path.join(localDirPath, relativePath)
        await downloadFile(obj.Key, localFilePath)
        downloaded++
        if (onProgress) onProgress(downloaded, objects.length)
      })
    )
  }

  return objects.length
}

// ─── Delete all objects under a prefix ───────────────────────────────────────
const deletePrefix = async (r2Prefix) => {
  let continuationToken = undefined
  let totalDeleted = 0

  do {
    const listRes = await r2Client.send(
      new ListObjectsV2Command({
        Bucket: BUCKET,
        Prefix: r2Prefix + "/",
        ContinuationToken: continuationToken,
      })
    )

    const objects = listRes.Contents || []
    if (objects.length > 0) {
      await r2Client.send(
        new DeleteObjectsCommand({
          Bucket: BUCKET,
          Delete: { Objects: objects.map((o) => ({ Key: o.Key })) },
        })
      )
      totalDeleted += objects.length
    }

    continuationToken = listRes.IsTruncated ? listRes.NextContinuationToken : undefined
  } while (continuationToken)

  return totalDeleted
}

// ─── Check if a prefix/file exists in R2 ─────────────────────────────────────
const prefixExists = async (r2Prefix) => {
  try {
    const res = await r2Client.send(
      new ListObjectsV2Command({
        Bucket: BUCKET,
        Prefix: r2Prefix + "/",
        MaxKeys: 1,
      })
    )
    return (res.Contents && res.Contents.length > 0) || false
  } catch {
    return false
  }
}

// ─── Stream a single file directly to HTTP response ──────────────────────────
const streamFileToResponse = async (r2Key, res, contentType = null) => {
  const response = await r2Client.send(
    new GetObjectCommand({ Bucket: BUCKET, Key: r2Key })
  )

  if (contentType) res.setHeader("Content-Type", contentType)
  if (response.ContentLength) res.setHeader("Content-Length", response.ContentLength)
  if (response.ETag) res.setHeader("ETag", response.ETag)
  res.setHeader("Cache-Control", "public, max-age=31536000")

  response.Body.pipe(res)
}

module.exports = {
  r2Client,
  uploadFile,
  uploadDirectory,
  downloadFile,
  downloadDirectory,
  deletePrefix,
  prefixExists,
  streamFileToResponse,
}
