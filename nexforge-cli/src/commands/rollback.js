import readlineModule from 'readline'
import fs from 'fs'
import chalk from 'chalk'
import ora from 'ora'
import { axios, API_BASE_URL, CONFIG_FILE } from '../config.js'

export default (program) => {
  program
    .command("rollback")
    .description("Rollback your live website to a previous deployment")
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

      const spinner = ora("Fetching previous deployments...").start()
      try {
        const response = await axios.get(
          `${API_BASE_URL}/cli/deployments/${projectId}`,
        )
        const deployments = response.data.deployments

        spinner.stop()

        if (!deployments || deployments.length === 0) {
          console.log(chalk.yellow("No previous deployments found."))
          return
        }

        console.log(chalk.cyan("\nRecent Deployments:"))
        deployments.forEach((dep, index) => {
          const date = new Date(dep.createdAt).toLocaleString()
          const statusColor =
            dep.status === "LIVE"
              ? chalk.green
              : dep.status === "FAILED"
                ? chalk.red
                : chalk.yellow
          console.log(
            `[${index + 1}] ${dep._id} - ${statusColor(dep.status)} - ${date}`,
          )
        })

        const readline = readlineModule.createInterface({
          input: process.stdin,
          output: process.stdout,
        })

        readline.question(
          "\nEnter the number of the deployment you want to rollback to (or 'q' to cancel): ",
          async (answer) => {
            if (answer.toLowerCase() === "q") {
              readline.close()
              return
            }

            const index = parseInt(answer) - 1
            if (isNaN(index) || index < 0 || index >= deployments.length) {
              console.log(chalk.red("Invalid selection."))
              readline.close()
              return
            }

            const selectedDeployment = deployments[index]

            const rollbackSpinner = ora(
              `Rolling back to ${selectedDeployment._id}...`,
            ).start()
            try {
              await axios.post(`${API_BASE_URL}/cli/rollback/${projectId}`, {
                deploymentId: selectedDeployment._id,
              })
              rollbackSpinner.succeed(
                chalk.green(
                  `🎉 Successfully rolled back to deployment ${selectedDeployment._id}!`,
                ),
              )
              console.log(
                chalk.cyan(
                  "Your website has been instantly updated. No rebuild required.",
                ),
              )
            } catch (error) {
              rollbackSpinner.fail(chalk.red("Rollback failed!"))
              if (error.response && error.response.data) {
                console.log(chalk.red(`Error: ${error.response.data.error}`))
              } else {
                console.error(error.message)
              }
            } finally {
              readline.close()
            }
          },
        )
      } catch (error) {
        spinner.fail(chalk.red("Failed to fetch deployments!"))
        console.error(error.message)
      }
    })
}
