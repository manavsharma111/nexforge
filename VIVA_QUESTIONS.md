# 🎓 NexForge: Viva & Interview Questions

This document contains the most important technical questions an examiner might ask during your B.Tech Final Year Viva about your Deployment Platform, along with simple, confident answers.

---

### Q1. What is the core problem your project solves?
**Answer:** "Developers usually have to buy a VPS (like AWS EC2), manually install Node.js, clone their code, run npm install, and configure a proxy to host their app. NexForge automates this entire pipeline. A user just logs in, selects their GitHub repo, and clicks deploy. My platform handles cloning, installing dependencies, building, hosting, and even live log streaming automatically."

### Q2. How did you implement parallel deployment safety? What happens if 5 users deploy at the same time?
**Answer:** "A single `npm install` consumes a lot of CPU and RAM. If 5 builds run parallelly, the server will crash (Out of Memory). To solve this, I implemented a **Message Queue System using BullMQ and Redis**. When users deploy, their requests go into a line (QUEUED state). My BullMQ Worker processes exactly one build at a time (Concurrency: 1), ensuring the server's CPU remains stable."

### Q3. Why did you use PM2 instead of just running `node server.js`?
**Answer:** "Normal `node server.js` runs in the foreground and stops if the terminal closes. Also, if the user's code has a bug and crashes, their website goes offline permanently. **PM2 is a Process Manager** that runs the user's app as a background daemon and features **Auto-Restart**. If an app crashes, PM2 restarts it in under 1 second, ensuring zero downtime."

### Q4. How are you showing the live "Hacker-style" terminal logs on the frontend?
**Answer:** "I use the native Node.js `child_process.exec` to run bash commands like `git clone` and `npm run build`. I attached event listeners to the `stdout` and `stderr` streams of that child process. As the terminal outputs text, my backend captures it and emits it to the frontend in real-time using **Socket.io WebSockets**."

### Q5. How does the subdomain routing work? (e.g., `project-name.localhost`)
**Answer:** "I used the `http-proxy-middleware` package inside Express. My Express server catches all incoming requests. It checks the hostname, extracts the subdomain (the project name or ID), and acts as a **Reverse Proxy**. If it's a Node.js project, it routes the traffic to the specific internal port PM2 is running on. If it's a static React project, it simply serves the `dist/index.html` file."

### Q6. Are the Dashboard System Metrics real or fake?
**Answer:** "They are 100% real. I used the `os-utils` Node.js package in my backend. I have a `node-cron` job that runs every 5 seconds, calls `os.cpuUsage()` and `os.freememPercentage()`, and pushes those real hardware metrics to the frontend via WebSockets."

### Q7. How does the GitHub Auto-Deploy (Webhook) feature work?
**Answer:** "I built a dedicated `/api/github/webhook` endpoint. The user pastes this URL into their GitHub repo settings. Whenever they do a `git push`, GitHub sends an HTTP POST request to my endpoint. My backend verifies the payload, finds the associated project in MongoDB, and adds it to the BullMQ deployment queue automatically."

### Q8. Why did you choose MongoDB over a SQL database like MySQL?
**Answer:** "My platform handles a lot of unstructured and rapidly changing data, particularly the **Deployment Logs**. A single deployment can generate 500+ lines of terminal logs. MongoDB's document-based structure allows me to store these massive log arrays directly inside the Deployment document very efficiently, which would be complicated to map in SQL tables."

### Q9. How do you handle Environment Variables (like Database URIs) for the deployed apps?
**Answer:** "Users can input their secret Environment Variables securely through the NexForge dashboard frontend. The backend stores them in MongoDB. During deployment, my system passes these variables directly into the application environment via PM2's configuration file or by generating a temporary `.env` file inside the project directory right before running the build."

### Q10. What happens if a user uploads malicious code that tries to delete your server files?
**Answer:** "In this prototype, apps are run via PM2. However, I have restricted the Node.js process user permissions. Ideally, in a full production system, I would transition from PM2 to **Docker Containers**. Docker provides process isolation, meaning user code would run in a sandbox and wouldn't be able to access the host server's root file system."

### Q11. What happens if the NexForge main server itself crashes during a deployment?
**Answer:** "The NexForge main server is also managed by PM2, so it will auto-restart immediately. More importantly, because I used **BullMQ with Redis** for the deployment queue, the queue state is persistent in Redis memory. When the server comes back online, BullMQ will automatically resume the interrupted deployments from where they left off."

### Q12. What was the biggest challenge you faced while building this project?
**Answer:** "The biggest challenge was handling the live terminal logs. Attaching WebSocket emitters to the `child_process` streams required careful error handling. When `npm install` runs, it can output thousands of lines per second. I had to implement buffer management so the WebSocket connection wouldn't get overwhelmed or cause memory leaks."

### Q13. How do you differentiate between a Node.js API project and a React static project during deployment?
**Answer:** "My backend inspects the user's repository, specifically the `package.json` file. If it finds dependencies like `react` or `vue` and a `build` script, it builds the app and statically serves the output folder (e.g., `dist` or `build`). If it's a standard Node.js app, it runs the `start` script via PM2 and proxies the traffic to its internal port."

### Q14. What happens if two different deployed Node.js projects try to use the same internal port (like 8080)?
**Answer:** "I built a **Dynamic Port Allocation System**. Before starting a new Node.js process, my backend checks which ports are currently in use and assigns the next available port (e.g., 8001, 8002, 8003) to the new project. This dynamic port is then saved in MongoDB and mapped to the user's subdomain by the reverse proxy, ensuring zero port conflicts."

### Q15. Why did you choose React for the dashboard frontend?
**Answer:** "A deployment dashboard must be highly reactive. For features like **real-time build logs streaming** and **live CPU/RAM metrics**, the UI needs to update multiple times a second. React's state management and Virtual DOM allow me to seamlessly render WebSocket events without reloading the page, which would be very clunky in vanilla HTML/JS."

### Q16. How would you handle scaling if NexForge gets 10,000 users tomorrow? (Future Scope)
**Answer:** "Currently, it's a single-node architecture. To scale, I would introduce a **Load Balancer (like Nginx or AWS ALB)** and distribute the traffic across multiple EC2 instances. The MongoDB database would be moved to a managed cluster. The BullMQ worker can also be separated onto a dedicated 'Builder Server' so that the main API server never takes the CPU hit during a heavy deployment."

---

### 💡 Pro-Tip for Viva:
If the examiner asks something you don't know, don't panic. Say:
*"Sir/Ma'am, my current focus for this prototype was optimizing the core CI/CD pipeline and process management. However, what you suggested is a great feature, and in V2 of this architecture, I would definitely research and implement it."*
