import fs from 'fs'
import chalk from 'chalk'
import { API_BASE_URL, CONFIG_FILE } from '../config.js'

export default (program) => {
  program
    .command("logs")
    .description("Stream live build logs for your NexForge project")
    .action(async () => {
      if (!fs.existsSync(CONFIG_FILE)) {
        console.log(
          chalk.red(
            "❌ You are not logged in. Please run `nexforge login` first.",
          ),
        )
        return
      }

      const config = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"))
      const projectId = config.projectId

      console.log(
        chalk.cyan(
          `🔌 Connecting to live log stream for project ${projectId}...`,
        ),
      )

      const { default: io } = await import('socket.io-client')
      const socket = io(API_BASE_URL.replace("/api", ""), {
        transports: ["websocket", "polling"],
      })

      socket.emit("joinProject", projectId)

      socket.on("initial-logs", (initialLogs) => {
        initialLogs.forEach((entry) => {
          const color =
            entry.level === "ERROR"
              ? chalk.red
              : entry.level === "WARN"
                ? chalk.yellow
                : chalk.white
          console.log(
            color(
              `[${new Date(entry.timestamp).toLocaleTimeString()}] ${entry.message}`,
            ),
          )
        })
      })

      socket.on("new-log", (entry) => {
        const color =
          entry.level === "ERROR"
            ? chalk.red
            : entry.level === "WARN"
              ? chalk.yellow
              : chalk.white
        console.log(
          color(
            `[${new Date(entry.timestamp).toLocaleTimeString()}] ${entry.message}`,
          ),
        )
      })

      socket.on("status-change", (data) => {
        if (data.status === "LIVE" || data.status === "FAILED") {
          console.log(
            chalk.gray(`\nPipeline finished with status: ${data.status}`),
          )
          process.exit(0)
        }
      })
    })
}
