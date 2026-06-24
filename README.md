<div align="center">
  <img src="./frontend/public/NexForge.png" alt="NexForge Logo" width="150" />
  
  # NexForge 
  **Advanced Cloud Deployment Platform**

  <p>
    A robust, self-hosted Platform as a Service (PaaS) to seamlessly host, manage, and instantly rollback modern web applications with zero downtime.
  </p>

  <p>
    <a href="#features"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="#getting-started">View Demo</a>
    ·
    <a href="https://github.com/manavsharma111/nexforge/issues">Report Bug</a>
    ·
    <a href="https://github.com/manavsharma111/nexforge/issues">Request Feature</a>
  </p>
  
  ### Built With
  
  ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
  ![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
  ![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
  ![Redis](https://img.shields.io/badge/redis-%23DD0031.svg?style=for-the-badge&logo=redis&logoColor=white)
  ![Socket.io](https://img.shields.io/badge/Socket.io-black?style=for-the-badge&logo=socket.io&badgeColor=010101)
  ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
</div>

---

<details open>
  <summary><h2>📑 Table of Contents</h2></summary>
  <ol>
    <li><a href="#about-the-project">About The Project</a></li>
    <li><a href="#architecture-workflow">Architecture & Workflow</a></li>
    <li><a href="#key-features">Key Features</a></li>
    <li><a href="#technology-stack">Technology Stack</a></li>
    <li><a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#cli-usage">CLI Usage (`nexforge-cli`)</a></li>
    <li><a href="#academic-context">Academic Context</a></li>
  </ol>
</details>

---

## 🚀 About The Project

NexForge is a highly scalable, full-stack Cloud Deployment Platform developed to emulate industry-leading PaaS environments like Vercel or Netlify. It provides developers with a seamless experience to deploy code securely, either via a **stunning web dashboard** or directly from their terminal using the custom **NexForge CLI**.

Handling the entire CI/CD pipeline internally, NexForge securely packages source code, resolves dependencies, executes builds, and dynamically routes subdomains. It features a sophisticated zero-downtime rollback architecture and streams real-time terminal logs straight to your UI or CLI.

---

## 🏗️ Architecture & Workflow

The core functionality of NexForge is driven by the backend build service and the custom CLI interacting with a scalable queue system:

1. **Secure Trigger**: A user runs `nexforge deploy` from their local project directory. The CLI creates an optimized `.zip` archive (ignoring local `node_modules`) and securely uploads it via `multipart/form-data`.
2. **Job Queuing (BullMQ & Redis)**: The backend securely receives the artifact and pushes a build job onto a Redis-backed queue to prevent server exhaustion during concurrent deployments.
3. **Execution & Build**: A worker picks up the job, extracts the payload, and uses Node's `child_process` to natively execute the project's dependency installation and build commands.
4. **Real-time Log Streaming**: Build `stdout` and `stderr` streams are captured and emitted via **Socket.io**, broadcasting real-time logs back to the developer's CLI and the Web Dashboard simultaneously.
5. **Zero-Downtime Routing**: Upon a successful build, the system updates a `current` symbolic link to the new build directory. An Express-based reverse proxy immediately begins routing incoming traffic (e.g., `app.nexforge.com`) to the new deployment.

---

## ✨ Key Features

- **Custom CLI Tooling**: Deploy directly from the terminal with bank-level Personal Access Token (PAT) security.
- **Zero-Downtime Rollbacks**: Every build is uniquely identified. Rollback to a previous functional state instantly via symlink switching without waiting for a new build.
- **Dynamic Subdomain Routing**: Seamlessly resolves hosts (e.g., `project.nexforge.com`) to the correct deployment path dynamically.
- **Live Terminal Telemetry**: Watch your builds in real-time. Logs are streamed bi-directionally using WebSockets.
- **Message Broker Architecture**: Integrates `BullMQ` and `Redis` to queue deployments robustly.
- **Hardware Monitoring**: Real-time server metrics (CPU, RAM, Network utilization) rendered beautifully via `Recharts`.
- **Premium Glassmorphic UI**: High-end user interface built with Framer Motion, GSAP, and Tailwind CSS.

---

## 🛠️ Technology Stack

### Frontend (Dashboard)
* **Framework**: React.js (Vite)
* **Styling & UI**: Tailwind CSS, Framer Motion, GSAP, `clsx`, `tailwind-merge`
* **Icons & Visuals**: Lucide React, Heroicons
* **Data Visualization**: Recharts
* **Real-time**: Socket.io-client

### Backend (Core Server & Router)
* **Runtime**: Node.js & Express.js
* **Database**: MongoDB (Mongoose)
* **Queue & Cache**: Redis, BullMQ
* **WebSockets**: Socket.io
* **Process Management**: PM2, Child Process API
* **Security & Utility**: JWT, Express-Rate-Limit, HTTP-Proxy-Middleware, Multer
* **AI Integrations**: OpenAI, Groq SDK

### Command Line Interface (`nexforge-cli`)
* **Core Tooling**: Commander.js
* **Compression**: Archiver
* **Network**: Axios, Form-Data
* **Terminal UI**: Chalk, Ora

---

## ⚙️ Getting Started

Follow these instructions to set up NexForge locally.

### Prerequisites

* **Node.js** (v18.0.0 or higher)
* **MongoDB** (Local instance or MongoDB Atlas URI)
* **Redis** (Required for BullMQ task processing)

### Installation

**1. Clone the Repository**
```bash
git clone https://github.com/manavsharma111/nexforge.git
cd nexforge
```

**2. Backend Setup**
```bash
cd backend
npm install

# Create a .env file based on the required configurations
# Add MONGO_URI, REDIS_URL, JWT_SECRET, PORT (default: 8000)

# Start the development server
npm run dev
```

**3. Frontend Setup**
```bash
cd ../frontend
npm install

# Create a .env file
# Add VITE_API_BASE_URL (pointing to your backend, e.g., http://localhost:8000)

# Start the Vite development server
npm run dev
```

**4. CLI Setup (Optional but Recommended)**
```bash
cd ../nexforge-cli
npm install

# Symlink the CLI globally so you can use the 'nexforge' command anywhere
npm link
```

---

## 💻 CLI Usage

The `nexforge-cli` is the fastest way to interact with your PaaS. Ensure your backend is running before using the CLI.

```bash
# Authenticate your machine using a Personal Access Token (generated in the Dashboard)
$ nexforge login

# Initialize a NexForge configuration in an existing web project
$ nexforge init

# Package your project and deploy it to the cloud
$ nexforge deploy

# Stream live build logs directly in your terminal
$ nexforge logs

# Instantly rollback to a stable previous version in case of failure
$ nexforge rollback
```

---

## 🎓 Academic Context

This platform was engineered as a **Final Year B.Tech (ECE) Major Project**. It demonstrates a comprehensive understanding of modern full-stack web development, DevOps methodologies, WebSocket implementation, symbolic linking strategies, and robust distributed system architecture.

<br />

<div align="center">
  <p>Engineered with 💻 by <b>Manav Sharma</b></p>
</div>
