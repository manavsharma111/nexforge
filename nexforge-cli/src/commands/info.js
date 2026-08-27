import fs from 'fs'
import path from 'path'
import axios from 'axios'
import chalk from 'chalk'
import ora from 'ora'
import { getNexforgeConfig } from '../config.js'

export default (program) => {
  program
    .command("info")
    .description("View project info and status")
    .action(async () => {
      const spinner = ora("Fetching project info...").start()
      try {
        const config = getNexforgeConfig()
        
        // Check if project is linked
        const projectFilePath = path.join(process.cwd(), ".nexforge")
        if (!fs.existsSync(projectFilePath)) {
          spinner.fail("No NexForge project found in this directory.")
          console.log(chalk.yellow("Hint: Run 'nexforge init' to link or create a project."))
          return
        }

        const { projectId } = JSON.parse(fs.readFileSync(projectFilePath, "utf8"))

        const API_BASE_URL = process.env.NEXFORGE_API_URL || "https://api.nexforge.me/api"

        const response = await axios.get(`${API_BASE_URL}/cli/info/${projectId}`, {
          headers: {
            Authorization: `Bearer ${config.token}`,
          },
        })

        spinner.stop()
        const { project } = response.data

        console.log(chalk.bold.cyan("\n📊 NexForge Project Info\n"))
        console.log(`${chalk.gray("Name:")}         ${chalk.white(project.projectName)}`)
        console.log(`${chalk.gray("Framework:")}    ${chalk.white(project.framework)}`)
        console.log(`${chalk.gray("ID:")}           ${chalk.white(project._id)}`)
        console.log(`${chalk.gray("Status:")}       ${project.latestDeploymentStatus === "SUCCESS" ? chalk.green("● Online") : chalk.yellow("● " + project.latestDeploymentStatus)}`)
        console.log(`${chalk.gray("Live URL:")}     ${chalk.blue.underline(project.liveUrl)}`)
        
        if (project.domains && project.domains.length > 0) {
          console.log(`\n${chalk.gray("Custom Domains:")}`)
          project.domains.forEach(d => console.log(`  - ${chalk.blue.underline("https://" + d)}`))
        }
        console.log("\n")

      } catch (error) {
        spinner.fail("Failed to fetch project info")
        if (error.response) {
          console.error(chalk.red(`Error: ${error.response.data.error || error.response.statusText}`))
        } else {
          console.error(chalk.red(error.message))
        }
      }
    })
}
