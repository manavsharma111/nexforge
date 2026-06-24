# NexForge CLI 🚀

Welcome to the NexForge Command Line Interface. This tool allows you to deploy your local projects directly to the NexForge platform without pushing to GitHub.

## Getting Started

If you are developing this CLI locally you can link it so it's available globally on your computer

```bash
npm link
```

Now you can use the `nexforge` command from anywhere!

## Commands

### 1. Login
Authenticate yourself with your NexForge Project ID.
```bash
nexforge login
```
This saves your configuration in your home directory `~/.nexforge/config.json`.

### 2. Deploy
Package your current directory and upload it to NexForge.
```bash
nexforge deploy
```
This command automatically zips your project (ignoring `node_modules` and `.env`) and sends it to the deployment queue.

### 3. Rollback
Revert your live site to the previous stable deployment.
```bash
nexforge rollback
```
*Note: This feature is currently in active development.*

---

## 📦 How to Publish to NPM

Once you are satisfied with this CLI and want to share it with the world you can publish it to the NPM registry. This allows anyone to install it by running `npm install -g nexforge-cli`.

### Step 1: Create an NPM Account
If you don't have one go to [npmjs.com](https://www.npmjs.com/) and create an account.

### Step 2: Login via Terminal
Run the following command in your terminal and enter your NPM credentials
```bash
npm login
```

### Step 3: Publish
Ensure your `package.json` has a unique name (e.g. `nexforge-cli`). Then simply run
```bash
npm publish
```

If everything is successful your package is now live on NPM!
Every time you make updates to the code you need to bump the version number in `package.json` (e.g. `"version": "1.0.1"`) before running `npm publish` again.
