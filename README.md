<div align="center">
  <img src="./frontend/public/NexForge.png" alt="NexForge Logo" width="120" />
  <h1>NexForge - Advanced Cloud Deployment Platform</h1>
  <p>A self-hosted, Vercel-like PaaS (Platform as a Service) to host, manage, and instantly rollback modern web applications.</p>

  ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
  ![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
  ![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
  ![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)
  ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
  ![Commander.js](https://img.shields.io/badge/Commander.js-000000?style=for-the-badge&logo=npm&logoColor=white)
</div>

---

## 🚀 Overview

NexForge is a highly advanced, full-stack Cloud Deployment Platform designed as a final-year B.Tech engineering project. It acts as a "Mini Vercel", allowing developers to deploy code seamlessly either from a **Stunning Web Dashboard** or directly from their terminal using the custom **NexForge CLI**.

The platform handles the entire CI/CD pipeline internally: securely packaging source code, installing dependencies, building the project, and routing subdomains dynamically. It features a zero-downtime rollback architecture and streams real-time terminal logs directly to the frontend and CLI.

---

## ✨ Key Features

- **Custom CLI (`nexforge-cli`)**: Deploy directly from your terminal using `nexforge init` and `nexforge deploy`. The CLI zips your code (ignoring `node_modules`), uploads it securely, and streams live build logs back to your terminal.
- **Zero-Downtime Rollback Architecture**: Every deployment is saved with a unique ID. A `current` symlink points to the active build. If a deployment fails, you can instantly rollback via the dashboard or CLI with zero rebuilding required.
- **Bank-Level CLI Security**: The CLI is secured via a Personal Access Token generated from the dashboard. The backend verifies this token via JWT middlewares before allowing any deployments.
- **Dynamic Subdomain Routing**: The Express backend intercepts incoming requests, resolves the host subdomain (e.g., `app.nexforge.com`), and serves the correct static assets or routes traffic to the specific project.
- **Live Terminal Streaming**: Uses `Socket.io` to stream build and deployment logs from the backend server to both the frontend UI and the developer's CLI in real-time.
- **Message Queue System**: Integrates **BullMQ** and **Redis** to queue deployment jobs, preventing server exhaustion during parallel deployments.
- **Hardware Telemetry**: Streams real-time server CPU, RAM, and Network utilization metrics to the frontend Dashboard using Recharts.
- **Premium Glassmorphic UI**: High-end user interface built with TailwindCSS and Framer Motion, featuring 3D tilt cards, dark mode aesthetics, and skeleton loaders.

---

## 🏗️ System Architecture & Working

The core magic of NexForge happens in the backend `realBuilder.js` service and the custom CLI.

1. **Trigger via CLI or Web**: 
   When a user runs `nexforge deploy`, the CLI creates an optimized ZIP archive of the project and uploads it securely to the backend using `form-data`.
2. **Dependency Installation & Build**:
   The backend's Queue system picks up the job, extracts the ZIP, and executes the user-defined `Build Command` natively using `child_process.exec`.
3. **Real-time Log Streaming**:
   As the build progresses, `stdout` and `stderr` are captured and emitted via **Socket.io** back to the CLI and the Web Dashboard simultaneously.
4. **Symlink Routing**:
   Once the build is successful, the platform updates a `current` symbolic link to point to the new `dist` folder. The dynamic proxy server instantly starts routing traffic to the new version.

---

## 💻 The NexForge CLI

NexForge comes with its own powerful Command Line Interface, built with Node.js and `commander`.

```bash
# Log in securely using your Personal Access Token
$ nexforge login

# Initialize a new project in your current directory
$ nexforge init

# Deploy your code to the live servers
$ nexforge deploy

# View live streaming logs for your project
$ nexforge logs

# Instantly rollback to a previous version
$ nexforge rollback
```

---

## 🛠️ Technology Stack

### **Frontend (Client)**
- **React.js**: UI Component architecture.
- **Redux Toolkit**: Centralized state management for Auth and Projects.
- **Tailwind CSS & Framer Motion**: Utility-first styling and fluid layout animations.
- **Recharts**: For rendering server telemetry graphs.
- **Socket.io-client**: To receive real-time build logs from the backend.

### **Backend (Server)**
- **Node.js & Express**: Core REST API server and Dynamic Subdomain Router.
- **MongoDB & Mongoose**: NoSQL database for storing Users, Projects, and Deployment histories.
- **BullMQ & Redis**: Cloud message broker and job queue.
- **Socket.io**: WebSockets for real-time bidirectional event streaming.
- **Child Process API**: Native Node.js module to execute bash commands.
- **Passport.js**: Handling GitHub OAuth authentication strategies.

### **CLI App (`nexforge-cli`)**
- **Commander.js**: For parsing terminal commands and arguments.
- **Archiver**: For creating optimized ZIP packages of the user's workspace.
- **Axios & Form-Data**: For secure API communication and multipart file uploads.
- **Ora & Chalk**: For a beautiful, spinner-based, color-coded terminal UI.

---

## 🎓 Academic Context
This project was developed as a Final Year B.Tech (ECE) Major Project. It demonstrates a deep understanding of full-stack web development, DevOps pipelines, WebSockets, symbolic linking, and advanced system architecture.

<div align="center">
  <br/>
  <p>Built with ❤️ by Manav Sharma</p>
</div>
