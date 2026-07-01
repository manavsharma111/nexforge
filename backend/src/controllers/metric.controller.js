const cron = require("node-cron")
const os = require("os-utils")
const Project = require("../models/project.model")
const Metric = require("../models/metric.model")
const { getIo } = require("../services/socket.ioService")

// CRON SCHEDULE: Runs cleanly every 5 seconds
// Background telemetry tracking pattern
cron.schedule("*/5 * * * * *", async () => {
  try {
    const io = getIo()

    // Fetch only projects that are actively running live on our system network
    const activeProjects = await Project.find({ status: "LIVE" })

    if (activeProjects.length === 0) return

    const timestamp = new Date()

    // Get real CPU and RAM metrics
    os.cpuUsage(async (cpuPercent) => {
      const cpuUsage = parseFloat((cpuPercent * 100).toFixed(2))
      const ramUsage = parseFloat(
        ((1 - os.freememPercentage()) * 100).toFixed(2),
      )
      const latency = parseFloat((Math.random() * (80 - 45) + 45).toFixed(2)) // Keep latency mock for now as it depends on network
      const status5xx = 0

      const metricPayload = {
        cpuUsage,
        ramUsage,
        latency,
        status5xx,
      }

      // Iterate through each active server partition
      for (const project of activeProjects) {
        const roomId = project._id.toString()

        // Persist natively inside MongoDB Time-Series collection engine
        await Metric.create({
          projectId: project._id,
          timestamp,
          metrics: metricPayload,
        })

        // Stream metrics instantly to the frontend room space via WebSockets
        io.to(roomId).emit("realtime-metrics", {
          timestamp,
          ...metricPayload,
        })
      }

      // Also emit globally to the Dashboard room for the overall System Metrics view
      io.to("dashboard").emit("system-metrics", {
        time: timestamp.toLocaleTimeString([], {
          hour12: false,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
        cpu: cpuUsage,
        ram: ramUsage,
        download: parseFloat((Math.random() * 5 + 1).toFixed(1)), // Mock network
        upload: parseFloat((Math.random() * 2 + 0.5).toFixed(1)),
      })
    })
  } catch (error) {
    console.error(
      " Critical exception inside Telemetry Background Agent:",
      error.message,
    )
  }
})
