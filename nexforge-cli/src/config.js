import axios from 'axios'
import fs from 'fs'
import path from 'path'
import os from 'os'

export const CONFIG_DIR = path.join(os.homedir(), ".nexforge")
export const CONFIG_FILE = path.join(CONFIG_DIR, "config.json")

export const API_BASE_URL = "https://nexforge-lbxg.onrender.com/api"

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

export { axios }

export const getNexforgeConfig = () => {
  if (fs.existsSync(CONFIG_FILE)) {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, "utf8"))
  }
  return {}
}
