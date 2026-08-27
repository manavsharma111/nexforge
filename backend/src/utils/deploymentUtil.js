const path = require("path")
const mime = require("mime-types")
const { GetObjectCommand } = require("@aws-sdk/client-s3")
const { r2Client } = require("../config/r2")
const { getCache, setCache } = require("../services/redis.service")
const Project = require("../models/project.model")
const mongoose = require("mongoose")

const getProjectIdFromReferer = (referer) => {
  if (!referer) return null
  try {
    const url = new URL(referer)
    const match = url.pathname.match(/^\/p\/([A-Za-z0-9]+)(?:\/|$)/)
    if (match) return match[1]
    return url.searchParams.get("projectId") || url.searchParams.get("p")
  } catch (e) {
    return null
  }
}

const resolveProject = async (req) => {
  let identifier =
    req.query?.projectId ||
    req.query?.p ||
    getProjectIdFromReferer(req.get ? req.get("referer") : null) ||
    req.cookies?.nexforge_project_id
  if (!identifier) return null

  const cacheKey = `route:${identifier}`
  let project = await getCache(cacheKey)
  if (!project) {
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      project = await Project.findById(identifier).lean()
    }
    if (!project) {
      project = await Project.findOne({ subdomain: identifier }).lean()
    }
    if (project) {
      await setCache(`route:${project.subdomain}`, project, 3600)
      await setCache(`route:${project._id.toString()}`, project, 3600)
    }
  }
  return project
    ? { projectId: project._id.toString(), slug: project.subdomain }
    : null
}

const getR2Object = async (projectId, assetPath) => {
  const BUCKET = process.env.CLOUDFLARE_R2_BUCKET
  const r2Key = `${projectId}/current/dist${assetPath}`
  const response = await r2Client.send(
    new GetObjectCommand({ Bucket: BUCKET, Key: r2Key }),
  )
  return { response, key: r2Key }
}

const injectProjectRoutingScript = (html, slug) => {
  const script = `<script>
;(function() {
  const slug = "${slug}";
  const originalPush = window.history.pushState;
  const originalReplace = window.history.replaceState;
  
  const appendSlug = (url) => {
    if (!url) return url;
    try {
      const urlObj = new URL(url, window.location.origin);
      if (urlObj.origin !== window.location.origin) return url;
      urlObj.searchParams.set('p', slug);
      return urlObj.pathname + urlObj.search + urlObj.hash;
    } catch(e) { return url; }
  };

  window.history.pushState = function(state, unused, url) {
    return originalPush.call(this, state, unused, appendSlug(url));
  };
  window.history.replaceState = function(state, unused, url) {
    return originalReplace.call(this, state, unused, appendSlug(url));
  };

  const currentUrl = new URL(window.location.href);
  if (currentUrl.pathname.startsWith('/p/')) {
    currentUrl.pathname = '/';
  }
  currentUrl.searchParams.set('p', slug);
  originalReplace.call(window.history, null, '', currentUrl.pathname + currentUrl.search + currentUrl.hash);
})();
</script>`
  return html.replace(/<head(.*?)>/i, (match) => `${match}\n${script}`)
}

const serveR2File = async (projectId, assetPath, res, options = {}) => {
  try {
    const { response, key } = await getR2Object(projectId, assetPath)
    const contentType = mime.lookup(key) || "application/octet-stream"
    res.setHeader("Content-Type", contentType)
    res.setHeader("Cache-Control", "public, max-age=86400")
    if (response.ContentLength)
      res.setHeader("Content-Length", response.ContentLength)

    if (options.injectProjectScript && contentType === "text/html") {
      const chunks = []
      for await (const chunk of response.Body) {
        chunks.push(chunk)
      }
      const html = Buffer.concat(chunks).toString("utf8")
      const injected = injectProjectRoutingScript(html, options.slug)
      return res.send(injected)
    }

    response.Body.pipe(res)
    return true
  } catch (err) {
    if (err.name === "NoSuchKey" || err.$metadata?.httpStatusCode === 404)
      return false
    throw err
  }
}

const serveProjectDist = async (projectId, reqPath, res, slug) => {
  const normalizedPath =
    reqPath === "/" || reqPath === "" ? "/index.html" : reqPath
  const hasExtension = path.extname(normalizedPath) !== ""

  const served = await serveR2File(projectId, normalizedPath, res, {
    injectProjectScript: normalizedPath === "/index.html",
    slug,
  })
  if (served) return true

  if (!hasExtension) {
    const fallbackServed = await serveR2File(projectId, "/index.html", res, {
      injectProjectScript: true,
      slug,
    })
    return fallbackServed
  }
  return false
}

module.exports = {
  getProjectIdFromReferer,
  resolveProject,
  getR2Object,
  injectProjectRoutingScript,
  serveR2File,
  serveProjectDist
}
