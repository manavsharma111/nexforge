const fs = require("fs")
const path = require("path")
const chalk = require("chalk")
const ora = require("ora")
const { axios, API_BASE_URL, CONFIG_FILE } = require("../config")

module.exports = (program) => {
  const envCommand = program
    .command("env")
    .description("Manage your environment variables")

  envCommand
    .command("push")
    .description("Push local .env file to NexForge")
    .action(async () => {
      if (!fs.existsSync(CONFIG_FILE)) {
        console.log(
          chalk.red(
            "❌ You are not logged in. Please run `nexforge login` first.",
          ),
        )
        return
      }

      const envPath = path.join(process.cwd(), ".env")
      if (!fs.existsSync(envPath)) {
        console.log(chalk.red("❌ No .env file found in the current directory."))
        return
      }

      const config = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"))
      const projectId = config.projectId

      const spinner = ora("Pushing environment variables...").start()
      try {
        const dotenv = require("dotenv")
        const envConfig = dotenv.parse(fs.readFileSync(envPath))

        const envs = Object.keys(envConfig).map((key) => ({
          key,
          value: envConfig[key],
        }))

        await axios.post(`${API_BASE_URL}/cli/env/push/${projectId}`, { envs })

        spinner.succeed(
          chalk.green("🎉 Environment variables pushed successfully!"),
        )
      } catch (error) {
        spinner.fail(chalk.red("Failed to push environment variables!"))
        console.error(error.message)
      }
    })

  envCommand
    .command("pull")
    .description("Pull environment variables from NexForge to local .env")
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

      const spinner = ora("Pulling environment variables...").start()
      try {
        const response = await axios.get(
          `${API_BASE_URL}/cli/env/pull/${projectId}`,
        )
        const envs = response.data.envs

        if (!envs || envs.length === 0) {
          spinner.info(
            chalk.yellow("No environment variables found on the server."),
          )
          return
        }

        let envContent = ""
        envs.forEach((e) => {
          envContent += `${e.key}=${e.value}\n`
        })

        const envPath = path.join(process.cwd(), ".env")
        fs.writeFileSync(envPath, envContent)

        spinner.succeed(
          chalk.green("🎉 Environment variables pulled successfully!"),
        )
        console.log(chalk.cyan(`Saved to ${envPath}`))
      } catch (error) {
        spinner.fail(chalk.red("Failed to pull environment variables!"))
        console.error(error.message)
      }
    })
}
