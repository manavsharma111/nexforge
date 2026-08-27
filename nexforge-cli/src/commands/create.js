const fs = require("fs")
const path = require("path")
const chalk = require("chalk")
const ora = require("ora")
const inquirer = require("inquirer")
const { execSync } = require("child_process")

const BACKEND_DEPS = {
  "@aws-sdk/client-s3": "^3.1075.0",
  "@aws-sdk/lib-storage": "^3.1075.0",
  "@google/genai": "^2.10.0",
  "axios": "^1.18.0",
  "bullmq": "^5.79.1",
  "cookie-parser": "^1.4.7",
  "cors": "^2.8.6",
  "dotenv": "^17.4.2",
  "express": "^5.2.1",
  "express-rate-limit": "^8.5.2",
  "extract-zip": "^2.0.1",
  "groq-sdk": "^1.3.0",
  "http-proxy-middleware": "^4.1.1",
  "ioredis": "^5.11.1",
  "jsonwebtoken": "^9.0.3",
  "mime-types": "^3.0.2",
  "mongoose": "^9.7.1",
  "multer": "^2.2.0",
  "node-cron": "^4.5.0",
  "openai": "^6.44.0",
  "os-utils": "^0.0.14",
  "pm2": "^7.0.1",
  "portfinder": "^1.0.38",
  "redis": "^6.0.0",
  "socket.io": "^4.8.3"
}

const FRONTEND_DEPS = {
  "@heroicons/react": "^2.2.0",
  "axios": "^1.18.0",
  "clsx": "^2.1.1",
  "framer-motion": "^12.40.0",
  "gsap": "^3.15.0",
  "lenis": "^1.3.23",
  "lucide-react": "^1.21.0",
  "react-icons": "^5.6.0",
  "react-toastify": "^11.1.0",
  "recharts": "^3.8.1",
  "socket.io-client": "^4.8.3",
  "tailwind-merge": "^3.6.0"
}

const NEXTJS_DEPS = { ...FRONTEND_DEPS, ...BACKEND_DEPS }

const createFolderStructure = (baseDir, folders) => {
  folders.forEach((folder) => {
    fs.mkdirSync(path.join(baseDir, folder), { recursive: true })
  })
}

const runCommand = (command, cwd) => {
  try {
    execSync(command, { cwd, stdio: "inherit" })
  } catch (error) {
    console.error(chalk.red(`Failed to execute: ${command}`))
  }
}

const setupBackend = (targetDir) => {
  console.log(chalk.cyan("\n🚀 Scaffolding Backend (Express/Node)..."))
  fs.mkdirSync(targetDir, { recursive: true })
  createFolderStructure(path.join(targetDir, "src"), [
    "controllers",
    "models",
    "routes",
    "middlewares",
    "services",
    "utils",
    "config",
  ])

  const pkgJson = {
    name: "backend",
    version: "1.0.0",
    main: "src/server.js",
    scripts: {
      dev: "nodemon src/server.js",
      start: "node src/server.js",
    },
    dependencies: BACKEND_DEPS,
    devDependencies: {
      nodemon: "^3.1.14",
    },
  }

  fs.writeFileSync(path.join(targetDir, "package.json"), JSON.stringify(pkgJson, null, 2))
  fs.writeFileSync(path.join(targetDir, ".env"), "PORT=8000\nMONGO_URI=")
  fs.writeFileSync(path.join(targetDir, ".gitignore"), "node_modules\n.env\n")

  const serverJs = `const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send('NexForge Backend API is running!'));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(\`Server running on port \${PORT}\`));
`
  fs.writeFileSync(path.join(targetDir, "src", "server.js"), serverJs)
  
  console.log(chalk.yellow("📦 Installing backend dependencies (this may take a while)..."))
  runCommand("npm install", targetDir)
}

const setupFrontend = (targetDir) => {
  console.log(chalk.cyan("\n⚛️ Scaffolding Frontend (React + Vite)..."))
  runCommand(`npx create-vite@latest ${path.basename(targetDir)} --template react`, path.dirname(targetDir))

  createFolderStructure(path.join(targetDir, "src"), [
    "assets",
    "components",
    "hooks",
    "lib",
    "pages",
    "redux",
    "services",
    "utils",
  ])

  // Merge package.json
  const pkgPath = path.join(targetDir, "package.json")
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"))
    pkg.dependencies = { ...pkg.dependencies, ...FRONTEND_DEPS, "react-router-dom": "^7.18.0" }
    pkg.devDependencies = { ...pkg.devDependencies, tailwindcss: "^3.4.19", postcss: "^8.5.15", autoprefixer: "^10.5.0" }
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2))
  }

  // Tailwind config
  const twConfig = `/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
}`
  fs.writeFileSync(path.join(targetDir, "tailwind.config.js"), twConfig)
  fs.writeFileSync(path.join(targetDir, "postcss.config.js"), `export default { plugins: { tailwindcss: {}, autoprefixer: {} } }`)
  
  const css = `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n`
  fs.writeFileSync(path.join(targetDir, "src", "index.css"), css)
  
  // Utils
  const utilsJs = `import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
`
  fs.writeFileSync(path.join(targetDir, "src", "lib", "utils.js"), utilsJs)

  console.log(chalk.yellow("📦 Installing frontend dependencies..."))
  runCommand("npm install", targetDir)
}

const setupNextJs = (targetDir) => {
  console.log(chalk.cyan("\n🚀 Scaffolding Next.js App Router Project..."))
  // We use npx create-next-app
  const command = `npx create-next-app@latest ${path.basename(targetDir)} --js --tailwind --eslint --app --src-dir --import-alias "@/*"`
  runCommand(command, path.dirname(targetDir))

  // Create custom folders
  createFolderStructure(path.join(targetDir, "src"), [
    "app/api",
    "components",
    "hooks",
    "lib",
    "store",
    "services",
    "utils",
  ])

  // Merge package.json
  const pkgPath = path.join(targetDir, "package.json")
  if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"))
    pkg.dependencies = { ...pkg.dependencies, ...NEXTJS_DEPS }
    fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2))
  }

  const utilsJs = `import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
`
  fs.writeFileSync(path.join(targetDir, "src", "lib", "utils.js"), utilsJs)

  console.log(chalk.yellow("📦 Installing Next.js additional dependencies..."))
  runCommand("npm install", targetDir)
}

module.exports = (program) => {
  program
    .command("create")
    .description("Generate a standardized project with industry folders and NexForge libraries")
    .action(async () => {
      console.log(chalk.cyan("✨ Welcome to NexForge Project Generator!\n"))
      
      const answers = await inquirer.prompt([
        {
          type: "input",
          name: "projectName",
          message: "What is your project name?",
          validate: (input) => (input ? true : "Project name cannot be empty!"),
        },
        {
          type: "list",
          name: "template",
          message: "Which stack would you like to use?",
          choices: [
            "MERN Stack (Fullstack with /frontend and /backend)",
            "Next.js (App Router)",
            "Frontend Only (React + Vite)",
            "Backend Only (Node + Express)",
          ],
        },
      ])

      const { projectName, template } = answers
      const targetDir = path.join(process.cwd(), projectName)

      if (fs.existsSync(targetDir)) {
        console.log(chalk.red(`\n❌ Directory ${projectName} already exists. Please choose a different name.`))
        return
      }

      fs.mkdirSync(targetDir, { recursive: true })

      if (template.includes("Backend Only")) {
        setupBackend(targetDir)
      } else if (template.includes("Frontend Only")) {
        setupFrontend(targetDir)
      } else if (template.includes("Next.js")) {
        setupNextJs(targetDir)
      } else if (template.includes("MERN Stack")) {
        console.log(chalk.magenta("\n🔥 Generating MERN Stack..."))
        setupBackend(path.join(targetDir, "backend"))
        setupFrontend(path.join(targetDir, "frontend"))
      }

      console.log(chalk.green(`\n🎉 Project ${projectName} created successfully!`))
      console.log(chalk.white(`\n👉 Next steps:`))
      console.log(chalk.cyan(`   cd ${projectName}`))
      console.log(chalk.cyan(`   nexforge init (to link with NexForge Platform)`))
      console.log(chalk.cyan(`   nexforge deploy\n`))
    })
}
