#!/usr/bin/env node

const { program } = require("commander")
const axios = require("axios")
const FormData = require("form-data")
const archiver = require("archiver")
const fs = require("fs")
const path = require("path")
const chalk = require("chalk")
const ora = require("ora")

// store user config to our home directory
const os = require("os")
const CONFIG_DIR = path.join(os.homedir(), ".nexforge")
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json")

const API_BASE_URL = "https://nexforge-backend.up.railway.app/api" // Make sure this points to your deployed backend URL in production

// Intercept axios requests to attach the CLI Token if it exists
axios.interceptors.request.use((config) => {
  if (fs.existsSync(CONFIG_FILE)) {
    const userConfig = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"))
    if (userConfig.cliToken) {
      config.headers.Authorization = `Bearer ${userConfig.cliToken}`
    }
  }
  return config
})

program
  .name("nexforge")
  .description("CLI to some next-level deployment magic for NexForge")
  .version("1.0.0")

// LOGIN COMMAND

program
  .command("login")
  .description("Log in to your NexForge account")
  .action(async () => {
    const readline = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout
    })

    console.log(chalk.cyan("🚀 Welcome to NexForge CLI!"))
    
    readline.question("Please enter your personal CLI Token (Generate this from Dashboard Settings): ", (cliToken) => {
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
        
        console.log(chalk.green("✅ Successfully logged in! You can now run `nexforge deploy`"))
        readline.close()
      })
    })
  })

// INIT COMMAND
// This allows a user to create a brand new NexForge project without leaving the terminal
program
  .command("init")
  .description("Initialize a new NexForge project in the current directory")
  .action(async () => {
    const readline = require("readline").createInterface({
      input: process.stdin,
      output: process.stdout
    })

    console.log(chalk.cyan("✨ Let's set up a new NexForge project!"))
    
    readline.question("What is your project name? (e.g. my-app): ", async (projectName) => {
      if (!projectName) {
        console.log(chalk.red("Project name cannot be empty!"))
        readline.close()
        return
      }

      readline.question("What framework are you using? (React, Vue, Express, Node, Next.js): ", async (framework) => {
        if (!framework) {
          console.log(chalk.red("Framework cannot be empty!"))
          readline.close()
          return
        }

        const spinner = ora("Creating project on NexForge servers...").start()
        
        try {
          const response = await axios.post(`${API_BASE_URL}/cli/init`, {
            projectName,
            framework,
            projectType: ["express", "node"].includes(framework.toLowerCase()) ? "NODE" : "STATIC"
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

          fs.writeFileSync(CONFIG_FILE, JSON.stringify({ ...currentConfig, projectId }))

          spinner.succeed(chalk.green("🎉 Project created successfully!"))
          console.log(chalk.cyan(`Project ID: ${projectId} has been saved locally.`))
          console.log(chalk.yellow(`You can now run \`nexforge deploy\` to push your code.`))

        } catch (error) {
          spinner.fail(chalk.red("Failed to create project!"))
          if (error.response && error.response.data) {
            console.log(chalk.red(`Server Error: ${JSON.stringify(error.response.data)}`))
          } else {
            console.error(error.message)
          }
        } finally {
          readline.close()
        }
      })
    })
  })


// DEPLOY COMMAND
// This is where the magic happens. We package the current folder and fire it up to our backend servers.

program
  .command("deploy")
  .description("Deploy the current directory to NexForge")
  .action(async () => {
    // First we check if they are logged in by reading the config file
    if (!fs.existsSync(CONFIG_FILE)) {
      console.log(chalk.red("❌ You are not logged in. Please run `nexforge login` first."))
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
        ignore: ["node_modules/**", ".git/**", "nexforge-build.zip", ".env"]
      })

      await archive.finalize()
      await archivePromise

      spinner.text = "Uploading to NexForge servers..."

      // Now we prepare the multipart form-data request to send the zip file
      const formData = new FormData()
      formData.append("projectZip", fs.createReadStream(zipPath))

      const response = await axios.post(`${API_BASE_URL}/cli/deploy/${projectId}`, formData, {
        headers: {
          ...formData.getHeaders()
        }
      })

      spinner.succeed(chalk.green("🎉 Deployment queued successfully!"))
      console.log(chalk.cyan(`Live URL: ${response.data.liveUrl}`))
      console.log(chalk.gray(`Streaming live build logs...\n`))

      // Automatically stream logs after deployment
      const io = require("socket.io-client")
      const socket = io(API_BASE_URL.replace("/api", ""), {
        transports: ["websocket", "polling"]
      })

      socket.emit("joinProject", projectId)

      socket.on("new-log", (entry) => {
        const color = entry.level === "ERROR" ? chalk.red : entry.level === "WARN" ? chalk.yellow : chalk.white
        console.log(color(`[${new Date(entry.timestamp).toLocaleTimeString()}] ${entry.message}`))
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
        console.log(chalk.red(`Server Error: ${JSON.stringify(error.response.data)}`))
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

// ROLLBACK COMMAND

program
  .command("rollback")
  .description("Rollback to the previous stable deployment")
  .action(async () => {
    console.log(chalk.yellow("🚧 Rollback command is under construction."))
    console.log(chalk.cyan("Wait for the backend versioning architecture to be finalized before using this."))
  })

// ENV COMMANDS
// Allows user to push and pull environment variables
const envCommand = program
  .command("env")
  .description("Manage your environment variables")

envCommand
  .command("push")
  .description("Push local .env file to NexForge")
  .action(async () => {
    if (!fs.existsSync(CONFIG_FILE)) {
      console.log(chalk.red("❌ You are not logged in. Please run `nexforge login` first."))
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
      
      const envs = Object.keys(envConfig).map(key => ({
        key,
        value: envConfig[key]
      }))

      await axios.post(`${API_BASE_URL}/cli/env/push/${projectId}`, { envs })
      
      spinner.succeed(chalk.green("🎉 Environment variables pushed successfully!"))
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
      console.log(chalk.red("❌ You are not logged in. Please run `nexforge login` first."))
      return
    }

    const config = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"))
    const projectId = config.projectId

    const spinner = ora("Pulling environment variables...").start()
    try {
      const response = await axios.get(`${API_BASE_URL}/cli/env/pull/${projectId}`)
      const envs = response.data.envs

      if (!envs || envs.length === 0) {
        spinner.info(chalk.yellow("No environment variables found on the server."))
        return
      }

      let envContent = ""
      envs.forEach(e => {
        envContent += `${e.key}=${e.value}\n`
      })

      const envPath = path.join(process.cwd(), ".env")
      fs.writeFileSync(envPath, envContent)

      spinner.succeed(chalk.green("🎉 Environment variables pulled successfully!"))
      console.log(chalk.cyan(`Saved to ${envPath}`))
    } catch (error) {
      spinner.fail(chalk.red("Failed to pull environment variables!"))
      console.error(error.message)
    }
  })

// LOGS COMMAND
// Allows user to view live build logs for their project
program
  .command("logs")
  .description("Stream live build logs for your NexForge project")
  .action(async () => {
    if (!fs.existsSync(CONFIG_FILE)) {
      console.log(chalk.red("❌ You are not logged in. Please run `nexforge login` first."))
      return
    }

    const config = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"))
    const projectId = config.projectId

    console.log(chalk.cyan(`🔌 Connecting to live log stream for project ${projectId}...`))

    const io = require("socket.io-client")
    const socket = io(API_BASE_URL.replace("/api", ""), {
      transports: ["websocket", "polling"]
    })

    socket.emit("joinProject", projectId)

    socket.on("initial-logs", (initialLogs) => {
      initialLogs.forEach(entry => {
        const color = entry.level === "ERROR" ? chalk.red : entry.level === "WARN" ? chalk.yellow : chalk.white
        console.log(color(`[${new Date(entry.timestamp).toLocaleTimeString()}] ${entry.message}`))
      })
    })

    socket.on("new-log", (entry) => {
      const color = entry.level === "ERROR" ? chalk.red : entry.level === "WARN" ? chalk.yellow : chalk.white
      console.log(color(`[${new Date(entry.timestamp).toLocaleTimeString()}] ${entry.message}`))
    })

    socket.on("status-change", (data) => {
      if (data.status === "LIVE" || data.status === "FAILED") {
        console.log(chalk.gray(`\nPipeline finished with status: ${data.status}`))
        process.exit(0)
      }
    })
  })

// ROLLBACK COMMAND
// Revert to a previous deployment version instantly
program
  .command("rollback")
  .description("Rollback your live website to a previous deployment")
  .action(async () => {
    if (!fs.existsSync(CONFIG_FILE)) {
      console.log(chalk.red("❌ You are not logged in. Please run `nexforge login` first."))
      return
    }

    const config = JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"))
    const projectId = config.projectId

    const spinner = ora("Fetching previous deployments...").start()
    try {
      const response = await axios.get(`${API_BASE_URL}/cli/deployments/${projectId}`)
      const deployments = response.data.deployments

      spinner.stop()

      if (!deployments || deployments.length === 0) {
        console.log(chalk.yellow("No previous deployments found."))
        return
      }

      console.log(chalk.cyan("\nRecent Deployments:"))
      deployments.forEach((dep, index) => {
        const date = new Date(dep.createdAt).toLocaleString()
        const statusColor = dep.status === "LIVE" ? chalk.green : dep.status === "FAILED" ? chalk.red : chalk.yellow
        console.log(`[${index + 1}] ${dep._id} - ${statusColor(dep.status)} - ${date}`)
      })

      const readline = require("readline").createInterface({
        input: process.stdin,
        output: process.stdout
      })

      readline.question("\nEnter the number of the deployment you want to rollback to (or 'q' to cancel): ", async (answer) => {
        if (answer.toLowerCase() === 'q') {
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
        
        const rollbackSpinner = ora(`Rolling back to ${selectedDeployment._id}...`).start()
        try {
          await axios.post(`${API_BASE_URL}/cli/rollback/${projectId}`, {
            deploymentId: selectedDeployment._id
          })
          rollbackSpinner.succeed(chalk.green(`🎉 Successfully rolled back to deployment ${selectedDeployment._id}!`))
          console.log(chalk.cyan("Your website has been instantly updated. No rebuild required."))
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
      })
    } catch (error) {
      spinner.fail(chalk.red("Failed to fetch deployments!"))
      console.error(error.message)
    }
  })

// Parse the arguments passed by the user in the terminal
program.parse(process.argv)
