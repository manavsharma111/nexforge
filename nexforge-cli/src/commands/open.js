const fs = require("fs")
const path = require("path")
const axios = require("axios")
const chalk = require("chalk")
const ora = require("ora")
const { exec } = require("child_process")
const { getNexforgeConfig } = require("../config")

module.exports = (program) => {
  program
    .command("open")
    .description("Open the live project in your browser")
    .action(async () => {
      const spinner = ora("Opening project in browser...").start()
      try {
        const config = getNexforgeConfig()
        
        // Check if project is linked
        const projectFilePath = path.join(process.cwd(), ".nexforge")
        if (!fs.existsSync(projectFilePath)) {
          spinner.fail("No NexForge project found in this directory.")
          return
        }

        const { projectId } = JSON.parse(fs.readFileSync(projectFilePath, "utf8"))
        const API_BASE_URL = process.env.NEXFORGE_API_URL || "https://api.nexforge.me/api"

        const response = await axios.get(`${API_BASE_URL}/cli/info/${projectId}`, {
          headers: {
            Authorization: `Bearer ${config.token}`,
          },
        })

        const { project } = response.data
        const url = project.liveUrl

        spinner.succeed(`Opening ${chalk.blue.underline(url)}`)

        // Cross-platform open command
        const startCmd = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open'
        exec(`${startCmd} ${url}`, (err) => {
          if (err) {
            console.error(chalk.red(`Failed to open browser automatically. Please visit: ${url}`))
          }
        })

      } catch (error) {
        spinner.fail("Failed to open project")
        if (error.response) {
          console.error(chalk.red(`Error: ${error.response.data.error || error.response.statusText}`))
        } else {
          console.error(chalk.red(error.message))
        }
      }
    })
}
