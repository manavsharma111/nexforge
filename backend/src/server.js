require("dotenv").config()

const express = require("express")
const http = require("http")
const cors = require("cors")
const cookieParser = require("cookie-parser")
const app = express()
const server = http.createServer(app)
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

      const rootDir = project.rootDirectory || "./"
      const outDir = project.outputDirectory || "dist"
      
      const fs = require("fs")
      let distPath

      if (previewId) {
        // Preview Deployment Routing (serves exact deployment folder)
        distPath = path.join(
          __dirname,
          "../../deployments_storage",
          projectId,
          "_deployments",
          previewId,
          rootDir,
          outDir,
        )
      } else {
        // Production Deployment Routing (serves 'current' symlink)
        distPath = path.join(
          __dirname,
          "../../deployments_storage",
          projectId,
          "current",
          rootDir,
          outDir,
        )

        // Fallback for older projects deployed before the Versioning Architecture update
        if (!fs.existsSync(distPath)) {
          distPath = path.join(
            __dirname,
            "../../deployments_storage",
            projectId,
            rootDir,
            outDir,
          )
        }
      }

      return express.static(distPath)(req, res, () => {
        res.sendFile(path.join(distPath, "index.html"), (err) => {
          if (err) {
            if (previewId) {
               return res.status(404).send("<h1>404 - Preview Not Found</h1><p>The requested preview deployment does not exist.</p>")
            }
            return res
              .status(404)
              .send(
                "<h1>404 - Deployment Not Found</h1><p>The build directory could not be found or does not contain an index.html.</p>",
              )
          }
        })
      })
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
