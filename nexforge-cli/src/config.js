const axios = require("axios")
const fs = require("fs")
const path = require("path")
const os = require("os")

const CONFIG_DIR = path.join(os.homedir(), ".nexforge")
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json")

const API_BASE_URL = "https://nexforge-lbxg.onrender.com/api"

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

module.exports = {
  CONFIG_DIR,
  CONFIG_FILE,
  API_BASE_URL,
  axios
}
