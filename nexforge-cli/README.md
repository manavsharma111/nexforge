# NexForge CLI 🚀

The official Command Line Interface for **NexForge** - Your custom Platform as a Service (PaaS).
Deploy, manage, and scale your applications directly from your terminal with zero friction!
<a href="https://nexforge-sandy.vercel.app/">Visit Nexforge</a>

---
### 🌟 Special Feature: Project Folder Structure Generator
Try **`nexforge create`** to instantly scaffold Fullstack, React, Next.js, Vue, MongoDB, MySQL, and Postgres projects! It features an interactive UI and a **Zero-Bloat Dependency Selection** system that injects only the packages you want (Redux, GSAP, AI SDKs) for lightning-fast setups!

*(💡 **Note:** `nexforge create` is a standalone tool. You can use it to generate projects instantly without needing to log in with GitHub or connect to a NexForge account!)*
---

## Installation

You can install the CLI globally via NPM:

```bash
npm install -g nexforge-cli
```

## Available Commands

Here is the complete list of commands available in the NexForge CLI:

### 🔐 1. `nexforge login`

**Description:** Authenticate your local machine with your NexForge account.
**Usage:**

```bash
nexforge login
```

**Details:**

- Prompts you for your personal **CLI Token** (which you can generate from your NexForge Dashboard Settings).
- Prompts you for your **Project ID**.
- Saves your credentials securely in `~/.nexforge/config.json`.

---

### ✨ 2. `nexforge init`

**Description:** Initialize a new NexForge project right from your terminal without opening the browser.
**Usage:**

```bash
nexforge init
```

**Details:**

- Asks for your **Project Name**.
- Asks for the **Framework** you are using (e.g., React, Vue, Express, Node.js).
- Automatically registers the project on NexForge servers and links your current directory to the new Project ID.

---

### 🏗️ 3. `nexforge create`

**Description:** The ultimate project generator. Scaffold a fully configured project (React, Next.js, Vue, MERN, Postgres, MySQL) with an interactive UI, blazing fast copy, and **Zero Bloat** dependency selection!
**Usage:**

```bash
nexforge create
```

**How it works (Step-by-Step):**

1. **Run the Command:** Type `nexforge create` in your terminal. You'll be greeted by a beautiful, interactive CLI.
2. **Project Name:** Enter a name for your new app.
3. **Select your Stack:** Choose from 3 primary modes:
   - **Fullstack:** Automatically generates a combined frontend + backend repository.
   - **Frontend Only:** Choose between **React + Vite**, **Next.js**, or **Vue + Vite**.
   - **Backend Only:** Choose between **Express + MongoDB**, **Express + PostgreSQL**, or **Express + MySQL**.
4. **Zero-Bloat Dependency Selection:** Instead of downloading a massive, bloated template, the CLI asks you exactly what you need:
   - *Need Animations?* Select yes to inject GSAP & Framer Motion.
   - *Need State Management?* Select yes to inject Redux Toolkit.
   - *Need AI?* Select yes to inject OpenAI & Groq SDKs.
   - The CLI intelligently injects *only* the packages you selected into your `package.json` for a lightning-fast install.
5. **Ready to Deploy:** Once finished, simply `cd` into your new folder, run `nexforge init` to connect it to your account, and `nexforge deploy` to take it live!

---

### 🚀 4. `nexforge deploy`

**Description:** Package and deploy your current directory to NexForge.
**Usage:**

```bash
nexforge deploy
```

**Details:**

- Instantly zips your source code (ignoring `node_modules`, `.git`, and `.env`).
- Uploads the code to NexForge backend servers.
- Automatically connects to the live **WebSocket log stream** so you can watch your build progress in real-time.
- Returns your live deployment URL upon success.

---

### 🌐 5. `nexforge env`

**Description:** Manage your environment variables securely.

#### Push Variables

```bash
nexforge env push
```

- Reads your local `.env` file and securely pushes all variables to your NexForge project.

#### Pull Variables

```bash
nexforge env pull
```

- Fetches all environment variables from your live NexForge project and saves them into a local `.env` file.

---

### 📜 6. `nexforge logs`

**Description:** Stream live build and deployment logs for your project.
**Usage:**

```bash
nexforge logs
```

**Details:**

- Connects to the NexForge WebSocket server and streams real-time logs for any ongoing deployment pipelines.

---

### ⏪ 7. `nexforge rollback`

**Description:** Instantly revert your live website to a previous stable deployment.
**Usage:**

```bash
nexforge rollback
```

**Details:**

- Fetches a list of your recent successful and failed deployments.
- Prompts you to select a version.
- Instantly updates the symbolic links on the server to serve the older version with **zero downtime** and **no rebuild required**.

---

### ✏️ 8. `nexforge rename`

**Description:** Rename the subdomain of your project.
**Usage:**

```bash
nexforge rename
```

**Details:**

- Asks for your new preferred subdomain.
- Validates availability on the NexForge servers.
- Instantly updates your live URL to the new subdomain.

---

### ℹ️ 9. `nexforge info`

**Description:** View your current project's status and details.
**Usage:**

```bash
nexforge info
```

**Details:**

- Fetches and displays your project name, framework, custom domains, live URL, and latest deployment status directly in the terminal.

---

### 🌐 10. `nexforge domains`

**Description:** Manage custom domains for your project.
**Usage:**

```bash
nexforge domains add <your-domain.com>
nexforge domains ls
```

**Details:**

- `add`: Links a new custom domain to your project without opening the dashboard.
- `ls`: Lists all custom domains currently linked to your project.

---

### 🌍 11. `nexforge open`

**Description:** Opens your live project in your default web browser.
**Usage:**

```bash
nexforge open
```

**Details:**

- Fetches your project's live URL and instantly opens it in your host OS browser.

---

### Built With ❤️ by Manav Sharma
