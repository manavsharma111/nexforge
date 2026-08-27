import readlineModule from 'readline'
import fs from 'fs'
import chalk from 'chalk'
import ora from 'ora'
import { axios, API_BASE_URL, CONFIG_DIR, CONFIG_FILE } from '../config.js'

export default (program) => {
  program
    .command("rename")
    .description("Rename the subdomain of your project")
    .action(async () => {
      const readline = readlineModule.createInterface({
        input: process.stdin,
        output: process.stdout,
      })

      console.log(chalk.cyan("✨ Let's rename your project subdomain!"))

      let defaultProjectId = ""
      if (fs.existsSync(CONFIG_FILE)) {
        const config = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"))
        defaultProjectId = config.projectId || ""
      }

      const promptText = defaultProjectId
        ? `What is your project ID? (${defaultProjectId}) `
        : "What is your project ID? "

      readline.question(promptText, async (inputProjectId) => {
        const projectId = inputProjectId.trim() || defaultProjectId

        if (!projectId) {
          console.log(chalk.red("Project ID cannot be empty!"))
          readline.close()
          return
        }

        readline.question(
          "What is your new subdomain? ",
          async (newSubdomain) => {
            if (!newSubdomain) {
              console.log(chalk.red("Subdomain cannot be empty!"))
              readline.close()
              return
            }

            const spinner = ora("Renaming project subdomain...").start()

            try {
              const response = await axios.post(
                `${API_BASE_URL}/cli/rename/${projectId}`,
                {
                  newSubdomain,
                },
              )

              const { projectId: returnedProjectId } = response.data

              // Ensure the config directory exists before saving
              if (!fs.existsSync(CONFIG_DIR)) {
                fs.mkdirSync(CONFIG_DIR, { recursive: true })
              }

              // We preserve the existing CLI Token if it exists, and just update the projectId
              let currentConfig = {}
              if (fs.existsSync(CONFIG_FILE)) {
                currentConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"))
              }

              fs.writeFileSync(
                CONFIG_FILE,
                JSON.stringify({ ...currentConfig, projectId: returnedProjectId }),
              )

              spinner.succeed(
                chalk.green("🎉 Project subdomain renamed successfully!"),
              )
              console.log(
                chalk.cyan(`Project ID: ${returnedProjectId} has been saved locally.`),
              )
              console.log(
                chalk.yellow(
                  `You can now run \`nexforge deploy\` to push your code.`,
                ),
              )
            } catch (error) {
              spinner.fail(chalk.red("Failed to rename project subdomain!"))
              if (error.response && error.response.data) {
                console.log(
                  chalk.red(
                    `Server Error: ${JSON.stringify(error.response.data)}`,
                  ),
                )
              } else {
                console.error(error.message)
              }
            } finally {
              readline.close()
            }
          },
        )
      })
    })
}
