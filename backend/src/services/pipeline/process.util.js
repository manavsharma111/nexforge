const { spawn } = require("child_process")

// Helper function to execute a shell command and stream logs
const executeCommand = (cmd, args, cwd, appendLog, customEnv = {}) => {
  return new Promise((resolve, reject) => {
    // Merge system env variables with user's custom env variables
    const env = { ...process.env, ...customEnv }

    const isWindows = process.platform === "win32"
    let child
    if (isWindows) {
      const fullCommand = `${cmd} ${args.join(" ")}`
      child = spawn(fullCommand, { cwd, shell: true, env })
    } else {
      child = spawn(cmd, args, { cwd, shell: false, env })
    }

    child.on("error", (err) => {
      reject(new Error(`Failed to start command "${cmd}": ${err.message}`))
    })

    child.stdout.on("data", (data) => {
      appendLog(data.toString())
    })

    child.stderr.on("data", (data) => {
      appendLog(data.toString(), "error")
    })

    child.on("close", (code) => {
      if (code === 0) resolve()
      else
        reject(
          new Error(
            `Command "${cmd} ${args.join(" ")}" failed with exit code ${code}`,
          ),
        )
    })
  })
}

module.exports = {
  executeCommand
}
