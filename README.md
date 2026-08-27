<div align="center">
  <img src="./frontend/public/NexForge.png" alt="NexForge Logo" width="150" />

# NexForge

**Advanced Cloud Deployment Platform**

  <p>
    A robust, self-hosted Platform as a Service (PaaS) to seamlessly host, manage, and instantly rollback modern web applications with zero downtime.
  </p>

  <p>
    <a href="https://nexforge-zeta.vercel.app/">Visit Nexforge</a>
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
5. **Zero-Downtime Routing**: Upon a successful build, the system uploads the static assets directly to a **Cloudflare R2 Bucket**. An Express-based reverse proxy intercepts incoming traffic (e.g., `app.nexforge.com`) and streams the deployment instantly from Cloudflare's edge, ensuring high availability and zero downtime.

---

## ✨ Key Features

### 🛡️ Authentication & Security
- **OAuth 2.0 Integration (Passport.js-style)**: Secure, robust GitHub OAuth integration for frictionless authentication.
- **Dual JWT Token Architecture**: Employs short-lived **Access Tokens** (15 mins) and long-lived **Refresh Tokens** (7 days) for optimal security.
- **Secure Storage**: Active session management utilizing HTTP-Only, Secure cookies to mitigate XSS attacks.
- **Personal Access Tokens (PAT)**: Dedicated token generation (`cliToken`) for authenticating terminal sessions.
- **Rate Limiting**: Defends endpoints against brute-force attacks via `express-rate-limit`.
- **CORS Management**: Strict Cross-Origin Resource Sharing policies to secure API traffic.

### 🏗️ Backend Core & Architecture
- **Message Broker Architecture**: Integrates **BullMQ** and **Redis** to queue deployment jobs robustly, preventing server exhaustion.
- **Native Process Execution**: Uses Node's `child_process` API and **PM2** to natively execute build commands and keep backend services alive.
- **Dynamic Subdomain & Domain Routing**: Express-based reverse proxy (`http-proxy-middleware`) dynamically maps requests (e.g., `app.nexforge.com`) to Cloudflare R2 paths or PM2 ports based on MongoDB cache.
- **Zero-Downtime Rollbacks**: Every build is uniquely identified. Rollback to a previous state instantly by shifting the live pointer without waiting for a new build.
- **Live Terminal Telemetry**: Watch builds in real-time. Logs stream bi-directionally directly from worker processes to clients using WebSockets (`Socket.io`).

### 🤖 AI, Analytics & Monitoring
- **AI Assistant Integration**: Context-aware AI queries leveraging **OpenAI** and **Groq SDK** endpoints.
- **Real-Time Hardware Monitoring**: Live streaming of server metrics (CPU load, RAM usage, Network I/O) rendered beautifully via `Recharts`.
- **Project Analytics**: Real-time deployment tracking, domains management, and usage metrics per user.

### 💻 Custom CLI Tooling (`nexforge-cli`)
- **Direct Deployment**: Deploy directly from the terminal authenticated via secure PAT.
- **Smart Archiving**: Packages projects into optimized `.zip` archives on the fly (ignoring large directories like `node_modules`).
- **Terminal UI**: Stylish real-time logs and build indicators rendered with `chalk` and `ora`.

### 🎨 Frontend Experience
- **Premium Glassmorphic UI**: High-end user interface engineered with Framer Motion, GSAP, `clsx`, and Tailwind CSS.
- **Responsive Dashboard**: Fully immersive and interactive dashboard for managing deployments, domains, and tokens.

---

## 🛠️ Technology Stack

### Frontend (Dashboard)

- **Framework**: React.js (Vite)
- **Styling & UI**: Tailwind CSS, Framer Motion, GSAP, `clsx`, `tailwind-merge`
- **Icons & Visuals**: Lucide React, Heroicons
- **Data Visualization**: Recharts
- **Real-time**: Socket.io-client

### Backend (Core Server & Router)

- **Runtime**: Node.js & Express.js
- **Database**: MongoDB (Mongoose)
- **Queue & Cache**: Redis, BullMQ
- **WebSockets**: Socket.io
- **Process Management**: PM2, Child Process API
- **Security & Utility**: JWT, Express-Rate-Limit, HTTP-Proxy-Middleware, Multer
- **AI Integrations**: OpenAI, Groq SDK

### Command Line Interface (`nexforge-cli`)

- **Core Tooling**: Commander.js
- **Compression**: Archiver
- **Network**: Axios, Form-Data
- **Terminal UI**: Chalk, Ora

---

## ⚙️ Getting Started

Follow these instructions to set up NexForge locally.

### Prerequisites

- **Node.js** (v18.0.0 or higher)
- **MongoDB** (Local instance or MongoDB Atlas URI)
- **Redis** (Required for BullMQ task processing)

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

# Scaffold a new NexForge ready project (React, Next.js, Express)
$ nexforge create

# Package your project and deploy it to the cloud
$ nexforge deploy

# Stream live build logs directly in your terminal
$ nexforge logs

# Instantly rollback to a stable previous version in case of failure
$ nexforge rollback

# Rename the subdomain of your project
$ nexforge rename

# View your current project's status, details, and live URL
$ nexforge info

# Manage custom domains linked to your project
$ nexforge domains add <your-domain.com>
$ nexforge domains ls

# Instantly open your live project in the default web browser
$ nexforge open
```

---

## 🎓 Academic Context

This platform was engineered as a **Final Year B.Tech (ECE) Major Project**. It demonstrates a comprehensive understanding of modern full-stack web development, DevOps methodologies, WebSocket implementation, symbolic linking strategies, and robust distributed system architecture.

<br />

<div align="center">
  <p>Engineered with 💻 by <b>Manav Sharma</b></p>
</div>
