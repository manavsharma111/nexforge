import fs from "fs"
import { fileURLToPath } from 'url'
import path from "path"
import { execSync } from "child_process"
import * as p from "@clack/prompts"
import pc from "picocolors"

const runCommand = (command, cwd) => {
  try {
    execSync(command, { cwd, stdio: "ignore" }) // use ignore to keep it silent since we'll use a spinner
  } catch (error) {
    throw new Error(`Failed to execute: ${command}`)
  }
}

const copyTemplate = (src, dest) => {
  fs.cpSync(src, dest, { recursive: true })
}

export default (program) => {
  program
    .command("create")
    .description("Generate a standardized project with industry folders and NexForge libraries")
    .action(async () => {
      p.intro(pc.bgCyan(pc.black(" ✨ NexForge Project Generator ")))

      const project = await p.group(
        {
          name: () =>
            p.text({
              message: "What is your project name?",
              placeholder: "my-awesome-app",
              validate: (value) => {
                if (!value) return "Please enter a project name."
                if (fs.existsSync(path.join(process.cwd(), value))) {
                  return `Directory ${value} already exists.`
                }
              },
            }),
          stackType: () =>
            p.select({
              message: "Which stack would you like to build?",
              initialValue: "frontend",
              options: [
                { value: "fullstack", label: "Fullstack (Frontend + Backend)" },
                { value: "frontend", label: "Frontend Only" },
                { value: "backend", label: "Backend Only" },
              ],
            }),
          frontendFramework: ({ results }) => {
            if (results.stackType === "backend") return
            return p.select({
              message: "Choose a Frontend framework",
              options: [
                { value: "react", label: "React + Vite" },
                { value: "nextjs", label: "Next.js" },
                { value: "vue", label: "Vue + Vite" },
              ],
            })
          },
          backendFramework: ({ results }) => {
            if (results.stackType === "frontend" || results.frontendFramework === "nextjs") return
            return p.select({
              message: "Choose a Backend stack",
              options: [
                { value: "express-mongodb", label: "Node.js + Express + MongoDB" },
                { value: "express-postgres", label: "Node.js + Express + PostgreSQL" },
                { value: "express-sql", label: "Node.js + Express + MySQL" },
              ],
            })
          },
        },
        {
          onCancel: () => {
            p.cancel("Operation cancelled.")
            process.exit(0)
          },
        }
      )

      const targetDir = path.join(process.cwd(), project.name)
      fs.mkdirSync(targetDir, { recursive: true })

      // Define dependency groups
      const OPTIONAL_DEPS = {
        frontend: {
          animations: { "framer-motion": "^12.40.0", "gsap": "^3.15.0", "lenis": "^1.3.23" },
          state: { "react-redux": "^9.1.1", "@reduxjs/toolkit": "^2.2.3" },
          websockets: { "socket.io-client": "^4.8.3" },
          charts: { "recharts": "^3.8.1" },
          ui: { "react-toastify": "^11.1.0", "react-icons": "^5.6.0", "@heroicons/react": "^2.2.0" }
        },
        backend: {
          ai: { "@google/genai": "^2.10.0", "openai": "^6.44.0", "groq-sdk": "^1.3.0" },
          redis: { "redis": "^6.0.0", "ioredis": "^5.11.1", "bullmq": "^5.79.1" },
          storage: { "@aws-sdk/client-s3": "^3.1075.0", "@aws-sdk/lib-storage": "^3.1075.0", "multer": "^2.2.0" },
          websockets: { "socket.io": "^4.8.3" }
        }
      }

      // Ask Yes/No questions based on stack
      const features = { frontend: {}, backend: {} }
      
      if (project.stackType === "frontend" || project.stackType === "fullstack") {
        p.note("Frontend Features")
        features.frontend.animations = await p.confirm({ message: "Add Animations? (Framer Motion, GSAP, Lenis)" })
        features.frontend.state = await p.confirm({ message: "Add State Management? (Redux Toolkit)" })
        features.frontend.ui = await p.confirm({ message: "Add UI Extras? (Toastify, React Icons)" })
        features.frontend.websockets = await p.confirm({ message: "Add Websockets? (Socket.io Client)" })
      }

      if (project.stackType === "backend" || project.stackType === "fullstack") {
        p.note("Backend Features")
        features.backend.ai = await p.confirm({ message: "Add AI SDKs? (OpenAI, Gemini, Groq)" })
        features.backend.redis = await p.confirm({ message: "Add Redis & Queues? (BullMQ, ioredis)" })
        features.backend.storage = await p.confirm({ message: "Add S3 Storage? (AWS SDK, Multer)" })
        features.backend.websockets = await p.confirm({ message: "Add Websockets? (Socket.io)" })
      }

      const s = p.spinner()
      s.start("Scaffolding your project...")

      const injectDependencies = (dir, stack) => {
        const pkgPath = path.join(dir, "package.json")
        if (!fs.existsSync(pkgPath)) return
        const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"))
        
        // Remove all optional deps first to make it a clean base
        Object.values(OPTIONAL_DEPS[stack]).forEach(group => {
           Object.keys(group).forEach(dep => {
             if (pkg.dependencies) delete pkg.dependencies[dep]
           })
        })

        // Inject only the selected ones
        Object.keys(features[stack]).forEach(feature => {
          if (features[stack][feature]) {
            pkg.dependencies = { ...pkg.dependencies, ...OPTIONAL_DEPS[stack][feature] }
          }
        })
        
        fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2))
      }

      try {
        const __filename = fileURLToPath(import.meta.url)
        const __dirname = path.dirname(__filename)
        const resolvedTemplatesDir = path.join(__dirname, '..', 'templates')

        if (project.stackType === "fullstack") {
          if (project.frontendFramework === "nextjs") {
            s.message("Bootstrapping Next.js... (this might take a minute)")
            runCommand(`npx create-next-app@latest ${project.name} --js --tailwind --eslint --app --src-dir --import-alias "@/*"`, process.cwd())
            injectDependencies(targetDir, "frontend")
            s.message("Installing selected NexForge dependencies for Next.js...")
            runCommand("npm install", targetDir)
          } else {
            // Fullstack dynamic routing
            const frontendTemplate = project.frontendFramework === "vue" ? "vue" : "react"
            const backendTemplate = project.backendFramework || "express-mongodb"
            
            copyTemplate(path.join(resolvedTemplatesDir, "frontend", frontendTemplate), path.join(targetDir, "frontend"))
            copyTemplate(path.join(resolvedTemplatesDir, "backend", backendTemplate), path.join(targetDir, "backend"))
            
            injectDependencies(path.join(targetDir, "frontend"), "frontend")
            injectDependencies(path.join(targetDir, "backend"), "backend")

            s.message("Installing frontend dependencies...")
            runCommand("npm install", path.join(targetDir, "frontend"))
            s.message("Installing backend dependencies...")
            runCommand("npm install", path.join(targetDir, "backend"))
          }
        } else if (project.stackType === "frontend") {
          if (project.frontendFramework === "nextjs") {
             s.message("Bootstrapping Next.js... (this might take a minute)")
             runCommand(`npx create-next-app@latest ${project.name} --js --tailwind --eslint --app --src-dir --import-alias "@/*"`, process.cwd())
             injectDependencies(targetDir, "frontend")
             s.message("Installing selected NexForge dependencies for Next.js...")
             runCommand("npm install", targetDir)
          } else if (project.frontendFramework === "react") {
             copyTemplate(path.join(resolvedTemplatesDir, "frontend", "react"), targetDir)
             injectDependencies(targetDir, "frontend")
             s.message("Installing dependencies...")
             runCommand("npm install", targetDir)
          } else if (project.frontendFramework === "vue") {
             copyTemplate(path.join(resolvedTemplatesDir, "frontend", "vue"), targetDir)
             injectDependencies(targetDir, "frontend")
             s.message("Installing dependencies...")
             runCommand("npm install", targetDir)
          } else {
            s.stop("Framework template not yet available.")
            return;
          }
        } else if (project.stackType === "backend") {
          const backendTemplate = project.backendFramework || "express-mongodb"
          copyTemplate(path.join(resolvedTemplatesDir, "backend", backendTemplate), targetDir)
          injectDependencies(targetDir, "backend")
          s.message("Installing dependencies...")
          runCommand("npm install", targetDir)
        }

        s.stop(pc.green("Project scaffolded successfully!"))

        let nextSteps = `cd ${project.name}\n`
        if (project.stackType === "fullstack" && project.frontendFramework !== "nextjs") {
          nextSteps += `cd frontend && npm run dev\n`
          nextSteps += `cd ../backend && npm run dev`
        } else {
          nextSteps += `npm run dev`
        }

        p.note(nextSteps, "Next steps")

        p.outro(pc.cyan("Ready to deploy? Run \`nexforge init\` and \`nexforge deploy\`!"))

      } catch (err) {
        s.stop(pc.red("An error occurred during scaffolding."))
        p.log.error(err.message)
        process.exit(1)
      }
    })
}
