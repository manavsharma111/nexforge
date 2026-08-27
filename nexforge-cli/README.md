# NexForge CLI 🚀

The official Command Line Interface for **NexForge** - Your custom Platform as a Service (PaaS).
Deploy, manage, and scale your applications directly from your terminal with zero friction!
<a href="https://nexforge-zeta.vercel.app/">Visit Nexforge</a>

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

**Description:** Scaffold a new project (Next.js, MERN, React, or Express) with industry-standard folder structures and NexForge's rich dependencies.
**Usage:**

```bash
nexforge create
```

**Details:**

- Interactively asks for your **Project Name** and **Tech Stack** (Next.js, MERN, Frontend, Backend).
- Generates a fully configured folder structure matching NexForge's custom standards.
- Pre-installs all necessary libraries (Tailwind, Framer Motion, AWS SDK, Mongoose, AI SDKs, Socket.io, etc.).
- Automatically sets up boilerplate code like `server.js` or `App.jsx` and configures TailwindCSS.

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

### Built With ❤️ by Manav Sharma
