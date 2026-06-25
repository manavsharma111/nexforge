require("dotenv").config()

const express = require("express")
const http = require("http")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const app = express()
const server = http.createServer(app)

// Trust Railway's reverse proxy — required for express-rate-limit and correct IP detection
app.set("trust proxy", 1)
const connectDB = require("./config/db")
const { initSocket, getIo } = require("./services/socket.ioService")
const { errorHandler } = require("./middlewares/error.handling.middleware")
const rateLimit = require("express-rate-limit")
const authRoutes = require("./routes/auth.route")
const projectRoutes = require("./routes/project.route")
const githubRoutes = require("./routes/github.route")
const domainRoutes = require("./routes/domain.route")
const analyticsRoutes = require("./routes/analytics.route")
const cliRoutes = require("./routes/cli.route")
const AskAIRoutes = require("./routes/ai.route")
const { initRedis, getCache, setCache } = require("./services/redis.service")
const { streamFileToResponse, r2Client } = require("./config/r2")
const { GetObjectCommand, HeadObjectCommand, ListObjectsV2Command } = require("@aws-sdk/client-s3")
const mime = require("mime-types")

const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL,
].filter(Boolean)

const allowedPatterns = [/\.vercel\.app$/, /\.railway\.app$/]

app.use(
  cors({
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        allowedPatterns.some((p) => p.test(origin))
      ) {
        callback(null, true)
      } else {
        callback(new Error(`CORS blocked: ${origin}`))
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  }),
)

app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf.toString()
    },
  }),
)
app.use(cookieParser())

initSocket(server)

require("./controllers/metric.controller")

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50000, // Increased for development
  message: "Too many requests from this IP, please try again after 15 minutes",
})
app.use("/api", limiter)

const path = require("path")
const Project = require("./models/project.model")
const { createProxyMiddleware } = require("http-proxy-middleware")

const proxies = {}

const getProjectIdFromReferer = (referer) => {
  if (!referer) return null
  try {
    const url = new URL(referer)
    const match = url.pathname.match(/^\/p\/([A-Za-z0-9]+)(?:\/|$)/)
    if (match) return match[1]
    return url.searchParams.get('projectId') || url.searchParams.get('p')
  } catch (e) {
    return null
  }
}

const resolveProjectId = (req) => {
  if (req.query.projectId) return req.query.projectId
  if (req.query.p) return req.query.p
  return getProjectIdFromReferer(req.get('referer'))
}

const serveR2Asset = async (projectId, assetPath, res) => {
  const BUCKET = process.env.CLOUDFLARE_R2_BUCKET
  const r2Prefix = `${projectId}/current/dist`
  const r2Key = `${r2Prefix}${assetPath}`

  try {
    const response = await r2Client.send(
      new GetObjectCommand({ Bucket: BUCKET, Key: r2Key })
    )
    const contentType = mime.lookup(r2Key) || 'application/octet-stream'
    res.setHeader('Content-Type', contentType)
    res.setHeader('Cache-Control', 'public, max-age=86400')
    if (response.ContentLength) res.setHeader('Content-Length', response.ContentLength)
    response.Body.pipe(res)
    return true
  } catch (err) {
    if (err.name === 'NoSuchKey' || err.$metadata?.httpStatusCode === 404) return false
    throw err
  }
}

app.use('/assets', async (req, res, next) => {
  const projectId = resolveProjectId(req)
  if (!projectId) return next()

  const assetPath = req.originalUrl.split('?')[0]

  try {
    const served = await serveR2Asset(projectId, assetPath, res)
    if (served) return
    return next()
  } catch (error) {
    console.error('Asset serve error:', error)
    return res.status(500).send('Error loading asset from storage.')
  }
})

// --- Path-based public project route: /p/:projectId/*
app.use('/p/:projectId/*', async (req, res, next) => {
  try {
    const projectId = req.params.projectId
    const BUCKET = process.env.CLOUDFLARE_R2_BUCKET

    // For SPA routing, serve index.html for the main project path and rewrite the URL in the page.
    const r2Prefix = `${projectId}/current/dist`
    const filePath = '/index.html'
    const r2Key = `${r2Prefix}${filePath}`

    const tryServeR2File = async (key) => {
      try {
        const response = await r2Client.send(
          new GetObjectCommand({ Bucket: BUCKET, Key: key })
        )
        const contentType = mime.lookup(key) || 'application/octet-stream'
        res.setHeader('Content-Type', contentType)
        res.setHeader('Cache-Control', 'public, max-age=86400')
        if (response.ContentLength) res.setHeader('Content-Length', response.ContentLength)
        response.Body.pipe(res)
        return true
      } catch (err) {
        if (err.name === 'NoSuchKey' || err.$metadata?.httpStatusCode === 404) return false
        throw err
      }
    }

    const served = await tryServeR2File(r2Key)
    if (!served) {
      return res.status(404).send('<h1>404 - Deployment Not Found</h1><p>Build not found in storage. Please redeploy.</p>')
    }
    return
  } catch (e) {
    console.error('Path-based serve error:', e)
    return res.status(500).send('Error loading deployment from storage.')
  }
})

app.use(async (req, res, next) => {
  const host = req.hostname
  const baseDomain = process.env.BASE_DOMAIN || "localhost"

  if (host.endsWith("." + baseDomain) && host !== baseDomain) {
    // Parse slug and optional preview deployment ID (format: my-app--deployment123.baseDomain)
    const slugParts = host.split(".")[0].split("--")
    const slug = slugParts[0]
    const previewId = slugParts.length > 1 ? slugParts[1] : null

    try {
      const cacheKey = `route:${slug}`
      let project = await getCache(cacheKey)

      if (!project) {
        const mongoose = require("mongoose")
        if (mongoose.Types.ObjectId.isValid(slug)) {
          project = await Project.findById(slug).lean()
        }
        if (!project) {
          project = await Project.findOne({ subdomain: slug }).lean()
        }
        if (project) {
          await setCache(cacheKey, project, 3600) // cache for 1 hour
        }
      }

      if (!project) return res.status(404).send("Project not found")

      const projectId = project._id.toString()

      if (project.projectType === "NODE" && project.internalPort) {
        if (previewId) {
          return res.status(400).send("Preview URLs are currently only supported for Frontend/Static projects.")
        }
        if (!proxies[projectId]) {
          console.log(
            `[PROXY] Initializing proxy for PM2 Backend on port ${project.internalPort}`,
          )
          proxies[projectId] = createProxyMiddleware({
            target: `http://localhost:${project.internalPort}`,
            changeOrigin: true,
            ws: true,
          })
        }
        return proxies[projectId](req, res, next)
      }

      // ── STATIC: Serve from Cloudflare R2 ─────────────────────────────────
      const rootDir = project.rootDirectory || "./"
      const outDir = project.outputDirectory || "dist"
      const BUCKET = process.env.CLOUDFLARE_R2_BUCKET

      // Determine R2 prefix
      let r2Prefix
      if (previewId) {
        r2Prefix = `${projectId}/${previewId}/dist`
      } else {
        r2Prefix = `${projectId}/current/dist`
      }

      // File path inside the dist (e.g. /index.html, /assets/main.js)
      let filePath = req.path === "/" ? "/index.html" : req.path
      let r2Key = `${r2Prefix}${filePath}`

      const tryServeR2File = async (key) => {
        try {
          const response = await r2Client.send(
            new GetObjectCommand({ Bucket: BUCKET, Key: key })
          )
          const contentType = mime.lookup(key) || "application/octet-stream"
          res.setHeader("Content-Type", contentType)
          res.setHeader("Cache-Control", "public, max-age=86400")
          if (response.ContentLength) res.setHeader("Content-Length", response.ContentLength)
          response.Body.pipe(res)
          return true
        } catch (err) {
          if (err.name === "NoSuchKey" || err.$metadata?.httpStatusCode === 404) return false
          throw err
        }
      }

      // Try exact file first, then fall back to index.html (SPA routing)
      try {
        const served = await tryServeR2File(r2Key)
        if (!served) {
          const fallbackKey = `${r2Prefix}/index.html`
          const fallbackServed = await tryServeR2File(fallbackKey)
          if (!fallbackServed) {
            return res.status(404).send(
              previewId
                ? "<h1>404 - Preview Not Found</h1><p>The requested preview deployment does not exist.</p>"
                : "<h1>404 - Deployment Not Found</h1><p>Build not found in storage. Please redeploy.</p>"
            )
          }
        }
        return
      } catch (r2Err) {
        console.error("[R2 Serve Error]", r2Err)
        return res.status(500).send("Error loading deployment from storage.")
      }
    } catch (error) {
      console.error("Subdomain routing error:", error)
      return res.status(500).send("Internal Server Error")
    }
  }

  next()
})

connectDB()
  .then(async () => {
    await initRedis()
    server.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`)
    })
  })
  .catch((err) => {
    console.log(err)
  })

app.get("/", (req, res) => {
  res.send("yeahhhh......")
})
app.use("/api/auth", authRoutes)
app.use("/api/projects", projectRoutes)
app.use("/api/github", githubRoutes)
app.use("/api/domains", domainRoutes)
app.use("/api/analytics", analyticsRoutes)
app.use("/api/cli", cliRoutes)
app.use('/api/ai', AskAIRoutes)

app.use(errorHandler)
