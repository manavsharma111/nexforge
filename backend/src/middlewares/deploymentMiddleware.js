const { createProxyMiddleware } = require("http-proxy-middleware")
const { GetObjectCommand } = require("@aws-sdk/client-s3")
const mime = require("mime-types")
const { r2Client } = require("../config/r2")
const { getCache, setCache } = require("../services/redis.service")
const Project = require("../models/project.model")
const { resolveProject, serveProjectDist } = require("../utils/deploymentUtil")

const proxies = {}

const setupDeploymentRoutes = (app) => {
  app.use("/assets", async (req, res, next) => {
    const projectInfo = await resolveProject(req)
    if (!projectInfo) return next()

    const assetPath = req.originalUrl.split("?")[0]

    try {
      const served = await serveProjectDist(
        projectInfo.projectId,
        assetPath,
        res,
        projectInfo.slug,
      )
      if (served) return
      return next()
    } catch (error) {
      console.error("Asset serve error:", error)
      return res.status(500).send("Error loading asset from storage.")
    }
  })

  // Path-based public project route: /p/:slug
  app.use("/p/:slug", async (req, res, next) => {
    try {
      const slug = req.params.slug
      const projectInfo = await resolveProject({ query: { p: slug } })
      if (!projectInfo) {
        return res
          .status(404)
          .send(
            "<h1>404 - Deployment Not Found</h1><p>Build not found in storage. Please redeploy.</p>",
          )
      }

      res.cookie("nexforge_project_id", projectInfo.projectId, {
        path: "/",
        sameSite: "Lax",
        secure: process.env.NODE_ENV === "production",
      })

      const projectPath = req.path.replace(`/p/${slug}`, "") || "/"
      const served = await serveProjectDist(
        projectInfo.projectId,
        projectPath,
        res,
        projectInfo.slug,
      )
      if (served) return

      return res
        .status(404)
        .send(
          "<h1>404 - Deployment Not Found</h1><p>Build not found in storage. Please redeploy.</p>",
        )
    } catch (e) {
      console.error("Path-based serve error:", e)
      return res.status(500).send("Error loading deployment from storage.")
    }
  })

  app.use(async (req, res, next) => {
    if (req.path.startsWith("/api")) return next()
    if (req.path.startsWith("/p/")) return next()
    const projectInfo = await resolveProject(req)
    if (!projectInfo) return next()

    try {
      const served = await serveProjectDist(
        projectInfo.projectId,
        req.path,
        res,
        projectInfo.slug,
      )
      if (served) return
    } catch (err) {
      console.error("Root project routing error:", err)
      return res.status(500).send("Error loading deployment from storage.")
    }

    return next()
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
      // Reverse Proxy
        if (project.projectType === "NODE" && project.internalPort) {
          if (previewId) {
            return res
              .status(400)
              .send(
                "Preview URLs are currently only supported for Frontend/Static projects.",
              )
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

        // STATIC: Serve from Cloudflare R2
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
              new GetObjectCommand({ Bucket: BUCKET, Key: key }),
            )
            const contentType = mime.lookup(key) || "application/octet-stream"
            res.setHeader("Content-Type", contentType)
            res.setHeader("Cache-Control", "public, max-age=86400")
            if (response.ContentLength)
              res.setHeader("Content-Length", response.ContentLength)
            response.Body.pipe(res)
            return true
          } catch (err) {
            if (err.name === "NoSuchKey" || err.$metadata?.httpStatusCode === 404)
              return false
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
              return res
                .status(404)
                .send(
                  previewId
                    ? "<h1>404 - Preview Not Found</h1><p>The requested preview deployment does not exist.</p>"
                    : "<h1>404 - Deployment Not Found</h1><p>Build not found in storage. Please redeploy.</p>",
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
}

module.exports = {
  setupDeploymentRoutes
}
