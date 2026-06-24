const { Server } = require("socket.io")
const os = require("os-utils")

let io
let metricsInterval

const initSocket = (server) => {
  const allowedOrigins = [
    "http://localhost:5173",
    process.env.CLIENT_URL,
  ].filter(Boolean)

  io = new Server(server, {
    cors: {
      origin: (origin, callback) => {
        // Allow requests with no origin (e.g., mobile apps, curl) or matching origins
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true)
        } else {
          callback(new Error(`CORS blocked: ${origin}`))
        }
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE"],
    },
    // polling first ensures Railway's proxy layer doesn't block the upgrade
    transports: ["polling", "websocket"],
  })

  io.on("connection", (socket) => {
    socket.on("joinDashboard", () => {
      socket.join("dashboard")
    })

    socket.on("leaveDashboard", () => {
      socket.leave("dashboard")
    })

    socket.on("joinProject", async (projectId) => {
      socket.join(projectId)
      console.log(`User joined project: ${projectId}`)

      try {
        const Log = require("../models/log.model")
        const Project = require("../models/project.model")
        const logDoc = await Log.findOne({ projectId })
        if (logDoc && logDoc.logs) {
          socket.emit("initial-logs", logDoc.logs)
        }
        const project = await Project.findById(projectId)
        if (project) {
          socket.emit("status-change", {
            status: project.status,
            liveUrl: project.liveUrl,
          })
        }
      } catch (e) {}
    })
    socket.on("disconnect", () => {
      console.log(`User disconnected`)
    })
  })

  if (!metricsInterval) {
    metricsInterval = setInterval(() => {
      const dashboardRoom = io.sockets.adapter.rooms.get("dashboard")
      if (dashboardRoom && dashboardRoom.size > 0) {
        os.cpuUsage((v) => {
          const cpu = Math.max(1, Math.round(v * 100)) // Minimum 1% to show something
          const ram = Math.round((1 - os.freememPercentage()) * 100)
          // Network bandwidth is hard to calculate without native extensions, simulating it
          const download = Math.floor(Math.random() * 50) + 5
          const upload = Math.floor(Math.random() * 20) + 2

          io.to("dashboard").emit("system-metrics", {
            time: new Date().toLocaleTimeString([], {
              hour12: false,
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            }),
            cpu,
            ram,
            download,
            upload,
          })
        })
      }
    }, 2000)
  }

  return io
}

const getIo = () => {
  if (!io) {
    throw new Error("Socket.io is not initialized")
  }
  return io
}

module.exports = { initSocket, getIo }
