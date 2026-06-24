# 🎓 NexForge: Distributed System Interview Questions

Here are the most critical interview questions specifically focused on the **Distributed System architecture, scaling, and messaging** of your NexForge platform, along with professional answers.

---

### Q1. You mentioned NexForge follows a distributed architecture. What makes it a "Distributed System"?
**Answer:** "A distributed system separates concerns across multiple independent nodes that communicate over a network. In NexForge, the architecture is heavily decoupled. The **CLI and Web UI** act as remote clients. The **Express API Server** acts as the API Gateway and Router. The heavy lifting (building the project) is offloaded to a **Background Worker** via a **Redis/BullMQ Queue**. Even if they currently run on a single host, they are architecturally separate and communicate via WebSockets and HTTP, which is the foundational blueprint of a distributed PaaS."

### Q2. Why did you use a Message Queue (Redis & BullMQ) instead of just running the build directly on the Express server?
**Answer:** "Running an `npm install` and build process consumes significant CPU and RAM. If I ran this directly on the Express API server, just 3 or 4 concurrent deployments would freeze the event loop and crash the server, taking the entire platform offline. By using BullMQ and Redis, the Express server simply 'queues' the job and immediately responds to the user. A separate worker process pulls jobs from the queue one by one, ensuring the main API server remains fast and responsive."

### Q3. How does real-time log streaming work when the Build Process and the API Server are decoupled?
**Answer:** "When the Builder worker picks up a job from Redis, it executes the build using Node's `child_process`. I attached event listeners to the `stdout` and `stderr` streams of that process. As logs are generated, they are sent back to the main server, which then broadcasts them using **Socket.io**. Because Socket.io supports rooms, the logs are streamed simultaneously to both the developer's CLI and the web Dashboard in real-time."

### Q4. What happens if a Builder node crashes or the server restarts mid-deployment?
**Answer:** "Because I used Redis to back the BullMQ queue, the state of the queue is persistent. If the server or worker crashes, the job isn't lost. When the system comes back online, BullMQ detects that the active job was interrupted and can retry or resume it. This provides fault tolerance, which is critical in distributed systems."

### Q5. How does your Zero-Downtime routing work?
**Answer:** "When a new deployment is built, it is stored in a uniquely named folder (using a Deployment ID). The server maintains a `current` symbolic link (symlink) that points to the active build directory. Once a new build is 100% successful, I atomically update the symlink to point to the new folder. The dynamic reverse proxy (`http-proxy-middleware`) reads this symlink. This means users visiting the site never experience downtime during the switch."

### Q6. How would you scale NexForge to handle 10,000 concurrent users?
**Answer:** "To scale to enterprise levels:
1. I would place a **Load Balancer (e.g., Nginx or AWS ALB)** in front of multiple Express API instances.
2. I would move **Redis and MongoDB** to dedicated, managed cloud clusters.
3. Most importantly, I would spin up dedicated **Builder Servers (EC2 instances)** whose sole job is to listen to the Redis queue and execute builds. This way, the API servers handle web traffic, and the Builder servers handle compilation."

### Q7. What is the role of your custom CLI in this distributed environment?
**Answer:** "The NexForge CLI acts as an edge client. Instead of the server pulling code from GitHub, the CLI packages the code locally (ignoring `node_modules` to save bandwidth) and pushes the artifact directly to the API via multipart upload. It is authenticated securely using Personal Access Tokens (JWT), proving that distributed clients can securely execute remote cloud functions."

### Q8. What is the most difficult challenge in building a distributed PaaS like this?
**Answer:** "State synchronization and streaming. Keeping the UI, the Database, the CLI, and the Builder worker in perfect sync is challenging. If a build fails, the database must be updated, the queue must be cleared, the Socket.io connection must emit an error event to the frontend, and the CLI must gracefully exit. Coordinating these async events across different processes was the biggest technical hurdle I solved."

---

> [!TIP]
> **Pro-Tip for Interviews:** Interviewers love when you use industry standard terms correctly. Make sure to emphasize words like **"Decoupled"**, **"Fault-Tolerant"**, **"Message Broker"**, and **"Zero-Downtime"** during your explanations.
