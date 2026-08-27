const fs = require("fs")
const path = require("path")
const chalk = require("chalk")
const ora = require("ora")
const archiver = require("archiver")
const FormData = require("form-data")
const { axios, API_BASE_URL, CONFIG_FILE } = require("../config")

module.exports = (program) => {
  program
    .command("deploy")
    .description("Deploy the current directory to NexForge")
    .action(async () => {
      // First we check if they are logged in by reading the config file
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

      const spinner = ora("Packaging your project...").start()
      const zipPath = path.join(process.cwd(), "nexforge-build.zip")

      try {
        // We create a write stream to zip the contents of the current folder
        const output = fs.createWriteStream(zipPath)
        const archive = archiver("zip", { zlib: { level: 9 } }) // Maximum compression

        // We need to wait for the archive to finish writing
        const archivePromise = new Promise((resolve, reject) => {
          output.on("close", resolve)
          archive.on("error", reject)
        })

        archive.pipe(output)

        // We grab everything in the current directory EXCEPT node_modules and hidden files
        // Skipping node_modules is super important otherwise the upload would take forever
        archive.glob("**/*", {
          cwd: process.cwd(),
          ignore: ["node_modules/**", ".git/**", "nexforge-build.zip", ".env"],
        })

        await archive.finalize()
        await archivePromise

        spinner.text = "Uploading to NexForge servers..."

        // Now we prepare the multipart form-data request to send the zip file
        const formData = new FormData()
        formData.append("projectZip", fs.createReadStream(zipPath))

        const response = await axios.post(
          `${API_BASE_URL}/cli/deploy/${projectId}`,
          formData,
          {
            headers: {
              ...formData.getHeaders(),
            },
          },
        )

        spinner.succeed(chalk.green("🎉 Deployment queued successfully!"))
        console.log(chalk.cyan(`Live URL: ${response.data.liveUrl}`))
        console.log(chalk.gray(`Streaming live build logs...\n`))

        // Automatically stream logs after deployment
        const io = require("socket.io-client")
        const socket = io(API_BASE_URL.replace("/api", ""), {
          transports: ["websocket", "polling"],
        })

        socket.emit("joinProject", projectId)

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
          if (data.status === "LIVE") {
            console.log(chalk.green(`\n✅ Deployment successful and Live!`))
            socket.disconnect()
            process.exit(0)
          } else if (data.status === "FAILED") {
            console.log(chalk.red(`\n❌ Deployment failed!`))
            socket.disconnect()
            process.exit(1)
          }
        })
      } catch (error) {
        spinner.fail(chalk.red("Deployment failed!"))

        // If our API returned a specific error message we want to show that to the user
        if (error.response && error.response.data) {
          console.log(
            chalk.red(`Server Error: ${JSON.stringify(error.response.data)}`),
          )
        } else {
          console.error(error.message)
        }
      } finally {
        // Clean up the temporary zip file so we don't leave trash on the user's PC
        if (fs.existsSync(zipPath)) {
          fs.unlinkSync(zipPath)
        }
      }
    })
}
