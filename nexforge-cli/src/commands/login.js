import fs from 'fs'
import readlineModule from 'readline'
import chalk from 'chalk'
import { CONFIG_DIR, CONFIG_FILE } from '../config.js'

export default (program) => {
  program
    .command("login")
    .description("Log in to your NexForge account")
    .action(async () => {
      const readline = readlineModule.createInterface({
        input: process.stdin,
        output: process.stdout,
      })

      console.log(chalk.cyan("🚀 Welcome to NexForge CLI!"))

      readline.question(
        "Please enter your personal CLI Token (Generate this from Dashboard Settings): ",
        (cliToken) => {
          if (!cliToken) {
            console.log(chalk.red("CLI Token cannot be empty!"))
            readline.close()
            return
          }

          readline.question("Please enter your Project ID: ", (projectId) => {
            if (!projectId) {
              console.log(chalk.red("Project ID cannot be empty!"))
              readline.close()
              return
            }

            if (!fs.existsSync(CONFIG_DIR)) {
              fs.mkdirSync(CONFIG_DIR, { recursive: true })
            }

            // Save both Token and Project ID
            fs.writeFileSync(CONFIG_FILE, JSON.stringify({ cliToken, projectId }))

            console.log(
              chalk.green(
                "✅ Successfully logged in! You can now run `nexforge deploy`",
              ),
            )
            readline.close()
          })
        },
      )
    })
}
