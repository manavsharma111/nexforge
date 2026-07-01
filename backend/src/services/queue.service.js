const { Queue, Worker } = require("bullmq")
const IORedis = require("ioredis")
const { triggerDeploymentPipeline } = require("./realBuilder")
const Project = require("../models/project.model")
const { getIo } = require("./socket.ioService")

const connection = new IORedis(
  process.env.REDIS_URI || "redis://127.0.0.1:6379",
  {
    maxRetriesPerRequest: null,
  },
)

const deployQueue = new Queue("deployments", { connection })

const worker = new Worker(
  "deployments",
  async (job) => {
    const { projectId, options } = job.data
    console.log(`[Queue] Processing deployment for Project ID: ${projectId}`)

    try {
      await triggerDeploymentPipeline(projectId, "main", options)
    } catch (error) {
      console.error(`[Queue] Build Failed for ${projectId}`, error)
    }
  },
  {
    connection,
    concurrency: 1,
  },
)

worker.on("completed", (job) => {
  console.log(`[Queue] Job ${job.id} completed successfully`)
})

worker.on("failed", (job, err) => {
  console.error(`[Queue] Job ${job.id} failed with error: ${err.message}`)
})

const enqueueDeployment = async (projectId, options = {}) => {
  console.log(`[Queue] Adding Project ID: ${projectId} to deployment queue`)

  await Project.findByIdAndUpdate(projectId, { status: "QUEUED" })

  const io = getIo()
  io.to(projectId.toString()).emit("status-change", { status: "QUEUED" })
  io.to(projectId.toString()).emit("new-log", {
    timestamp: new Date(),
    level: "INFO",
    message:
      "⏳ Deployment added to queue. Waiting for an available worker slot...",
  })

  await deployQueue.add("deploy", { projectId, options })
}

module.exports = { deployQueue, enqueueDeployment }
