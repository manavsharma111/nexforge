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
const { initRedis } = require("./services/redis.service")

const allowedOrigins = ["http://localhost:5173", "https://nexforge-sandy.vercel.app"].filter(
  Boolean,
)

const allowedPatterns = [/\.vercel\.app$/, /\.railway\.app$/, /\.onrender\.com$/]

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      // Also always allow our own base domain
      const baseDomain = process.env.BASE_DOMAIN || ""
      
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        allowedPatterns.some((p) => p.test(origin)) ||
        (baseDomain && origin.includes(baseDomain))
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

const { setupDeploymentRoutes } = require("./middlewares/deploymentMiddleware")

setupDeploymentRoutes(app)

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
app.use("/api/ai", AskAIRoutes)

app.use(errorHandler)
