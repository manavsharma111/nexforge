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

