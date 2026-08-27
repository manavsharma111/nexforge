const fs = require("fs")
const path = require("path")
const axios = require("axios")
const chalk = require("chalk")
const ora = require("ora")
const { getNexforgeConfig } = require("../config")

module.exports = (program) => {
  program
    .command("domains <action> [domainName]")
    .description("Manage custom domains (actions: add, ls)")
    .action(async (action, domainName) => {
      if (action !== "add" && action !== "ls") {
        console.error(chalk.red("Invalid action. Use 'nexforge domains add <domain>' or 'nexforge domains ls'"))
        return
      }

      const spinner = ora(action === "add" ? "Adding domain..." : "Fetching domains...").start()
      
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

        if (action === "ls") {
          const response = await axios.get(`${API_BASE_URL}/cli/domains/${projectId}`, {
            headers: { Authorization: `Bearer ${config.token}` },
          })
          spinner.stop()
          
          const { domains } = response.data
          if (!domains || domains.length === 0) {
            console.log(chalk.gray("No custom domains linked to this project."))
            return
          }

          console.log(chalk.bold.cyan("\n🌐 Linked Domains\n"))
          domains.forEach(d => {
            console.log(`  - ${chalk.white(d.name)}`)
          })
          console.log("\n")
        }

        if (action === "add") {
          if (!domainName) {
            spinner.fail("Please specify a domain name. Example: nexforge domains add myapp.com")
            return
          }

          const response = await axios.post(`${API_BASE_URL}/cli/domains/${projectId}`, 
            { domain: domainName },
            { headers: { Authorization: `Bearer ${config.token}` } }
          )
          
          spinner.succeed(chalk.green(`Domain ${chalk.bold(response.data.domain)} added successfully!`))
          console.log(chalk.gray("Note: Ensure you point your DNS A Record to NexForge servers."))
        }

      } catch (error) {
        spinner.fail("Failed to process domains command")
        if (error.response) {
          console.error(chalk.red(`Error: ${error.response.data.error || error.response.data.message || error.response.statusText}`))
        } else {
          console.error(chalk.red(error.message))
        }
      }
    })
}
