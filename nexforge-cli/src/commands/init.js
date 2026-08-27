import readlineModule from 'readline'
import fs from 'fs'
import chalk from 'chalk'
import ora from 'ora'
import { axios, API_BASE_URL, CONFIG_DIR, CONFIG_FILE } from '../config.js'

export default (program) => {
  program
    .command("init")
    .description("Initialize a new NexForge project in the current directory")
    .action(async () => {
      const readline = readlineModule.createInterface({
        input: process.stdin,
        output: process.stdout,
      })

      console.log(chalk.cyan("✨ Let's set up a new NexForge project!"))

      readline.question(
        "What is your project name? (e.g. my-app): ",
        async (projectName) => {
          if (!projectName) {
            console.log(chalk.red("Project name cannot be empty!"))
            readline.close()
            return
          }

          readline.question(
            "What framework are you using? (React, Vue, Express, Node, Next.js): ",
            async (framework) => {
              if (!framework) {
                console.log(chalk.red("Framework cannot be empty!"))
                readline.close()
                return
              }

              const spinner = ora(
                "Creating project on NexForge servers...",
              ).start()

              try {
                const response = await axios.post(`${API_BASE_URL}/cli/init`, {
                  projectName,
                  framework,
                  projectType: ["express", "node"].includes(
                    framework.toLowerCase(),
                  )
                    ? "NODE"
                    : "STATIC",
                })

                const { projectId } = response.data

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
                  JSON.stringify({ ...currentConfig, projectId }),
                )

                spinner.succeed(chalk.green("🎉 Project created successfully!"))
                console.log(
                  chalk.cyan(`Project ID: ${projectId} has been saved locally.`),
                )
                console.log(
                  chalk.yellow(
                    `You can now run \`nexforge deploy\` to push your code.`,
                  ),
                )
              } catch (error) {
                spinner.fail(chalk.red("Failed to create project!"))
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
        },
      )
    })
}
