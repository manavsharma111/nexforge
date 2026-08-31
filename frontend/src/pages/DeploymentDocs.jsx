import React from "react"
import { motion } from "framer-motion"
import {
  Server,
  LayoutTemplate,
  GitBranch,
  Settings,
  Zap,
  Shield,
  CheckCircle2,
  RefreshCw,
  Terminal,
} from "lucide-react"

export default function DeploymentDocs() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  }

  return (
    <div className="flex justify-center min-h-full w-full mx-auto relative overflow-hidden">
      {/* Background gradients for premium feel */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#6366F1]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex-1 px-4 md:px-8 pb-32 pt-12 w-full max-w-[900px] relative z-10"
      >
        <motion.div
          variants={itemVariants}
          className="mb-12 text-center md:text-left"
        >
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-4">
            Platform Deployment Guide
          </h1>
          <p className="text-lg text-[#A1A1AA] leading-relaxed max-w-2xl mx-auto md:mx-0">
            A comprehensive overview of NexForge's internal deployment
            architecture and dashboard-driven deployment workflows
          </p>
        </motion.div>

        {/* Architecture Section */}
        <motion.section variants={itemVariants} className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-[#6366F1]/10 border border-[#6366F1]/20 flex items-center justify-center">
              <Server className="w-5 h-5 text-[#6366F1]" />
            </div>
            <h2 className="text-2xl font-semibold text-white tracking-tight">
              Deployment Architecture
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#111111]/80 backdrop-blur-md border border-[rgba(255,255,255,0.06)] p-6 rounded-2xl hover:border-[rgba(255,255,255,0.1)] transition-colors">
              <Shield className="w-6 h-6 text-emerald-400 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                Secure Isolation
              </h3>
              <p className="text-[#A1A1AA] text-sm leading-relaxed">
                NexForge separates static assets from backend services, ensuring
                maximum security and optimal load balancing across our edge
                network
              </p>
            </div>
            <div className="bg-[#111111]/80 backdrop-blur-md border border-[rgba(255,255,255,0.06)] p-6 rounded-2xl hover:border-[rgba(255,255,255,0.1)] transition-colors">
              <RefreshCw className="w-6 h-6 text-blue-400 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">
                Instant Rollbacks
              </h3>
              <p className="text-[#A1A1AA] text-sm leading-relaxed">
                Every deployment is strictly versioned in isolated containers
                This allows for instantaneous, zero-downtime rollbacks if a new
                build fails
              </p>
            </div>
          </div>
        </motion.section>

        {/* Dashboard Deployment Section */}
        <motion.section variants={itemVariants} className="mb-16">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.2)]">
              <LayoutTemplate className="w-6 h-6 text-indigo-400" />
            </div>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Deploying via Dashboard
            </h2>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-8 bottom-8 w-px bg-gradient-to-b from-indigo-500/50 via-purple-500/50 to-transparent md:block hidden" />

            <div className="space-y-6">
              {[
                {
                  icon: LayoutTemplate,
                  title: "Navigate to Projects",
                  desc: "Open your personal dashboard and click on New Project to begin the process",
                },
                {
                  icon: GitBranch,
                  title: "Connect Repository",
                  desc: "Link your GitHub account and select the repository you want to deploy, or manually upload your build files",
                },
                {
                  icon: Settings,
                  title: "Configure Settings",
                  desc: "Set your build commands, output directory, and inject any required environment variables safely",
                },
                {
                  icon: Zap,
                  title: "Trigger Build",
                  desc: "Click Deploy and watch the live logs stream directly to your browser as NexForge builds your app",
                },
              ].map((step, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className="flex flex-col md:flex-row gap-6 relative group items-start cursor-default"
                >
                  <div className="relative z-10 mx-auto md:mx-0">
                    <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="w-12 h-12 rounded-full bg-[#111] border border-white/10 flex items-center justify-center shrink-0 relative z-10 group-hover:border-indigo-500/50 group-hover:bg-indigo-500/10 group-hover:scale-110 transition-all duration-300">
                      <step.icon className="w-5 h-5 text-gray-500 group-hover:text-indigo-400 transition-colors duration-300" />
                    </div>
                  </div>
                  <div className="bg-white/[0.02] backdrop-blur-md border border-[rgba(255,255,255,0.04)] p-6 rounded-2xl flex-1 transition-all duration-300 group-hover:bg-white/[0.04] group-hover:border-indigo-500/30 group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-indigo-500/10 text-center md:text-left">
                    <h3 className="text-white font-semibold mb-2 flex items-center justify-center md:justify-start gap-3 text-lg">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-white/10 text-gray-300 group-hover:bg-indigo-500/20 group-hover:text-indigo-300 transition-colors">
                        Step {idx + 1}
                      </span>
                      {step.title}
                    </h3>
                    <p className="text-[#A1A1AA] leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Large Frontend Deployment Section */}
        <motion.section variants={itemVariants} className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
              <Terminal className="w-5 h-5 text-orange-400" />
            </div>
            <h2 className="text-2xl font-semibold text-white tracking-tight">
              Bypassing Cloud Build Limits (Large Projects)
            </h2>
          </div>

          <div className="bg-[#18181b] border border-[rgba(255,255,255,0.08)] p-8 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 rounded-full blur-[80px] pointer-events-none" />
            <h3 className="text-xl font-medium text-white mb-4 relative z-10">
              Local Build & CLI Deploy Method
            </h3>
            <p className="text-[#A1A1AA] leading-relaxed relative z-10 mb-6">
              For heavy React/Vite projects that exhaust free-tier server memory (512MB RAM) during cloud builds, you can bypass the cloud pipeline entirely by building locally and tricking the backend.
            </p>
            
            <div className="space-y-4 relative z-10 text-sm">
              <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                <p className="text-gray-300 font-medium mb-2">1. Build your project locally</p>
                <code className="text-orange-300 font-mono text-xs">npm run build</code>
              </div>
              <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                <p className="text-gray-300 font-medium mb-2">2. Prepare the dist folder for backend bypass</p>
                <p className="text-gray-400 text-xs mb-2">Navigate into your dist folder, create a dummy package.json, and nest the files in a dist/dist folder so the backend validation succeeds.</p>
                <code className="text-orange-300 font-mono text-xs block">cd dist<br/>echo '&#123; "scripts": &#123; "build": "echo Done" &#125; &#125;' &gt; package.json<br/>mkdir dist && mv * dist/ (excluding package.json)</code>
              </div>
              <div className="bg-black/30 p-4 rounded-xl border border-white/5">
                <p className="text-gray-300 font-medium mb-2">3. Deploy via NexForge CLI</p>
                <code className="text-orange-300 font-mono text-xs">nexforge deploy</code>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Managing Deployments Section */}
        <motion.section variants={itemVariants}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-semibold text-white tracking-tight">
              Managing Deployments
            </h2>
          </div>

          <div className="bg-[#18181b] border border-[rgba(255,255,255,0.08)] p-8 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />
            <h3 className="text-xl font-medium text-white mb-4 relative z-10">
              High Availability Guarantee
            </h3>
            <p className="text-[#A1A1AA] leading-relaxed relative z-10">
              You can view all past deployments in the project's Deployments tab
              If a newly triggered deployment fails during the build step, your
              website will seamlessly remain online using the previous
              successful deployment state Zero downtime, absolute peace of mind
            </p>
          </div>
        </motion.section>
      </motion.div>
    </div>
  )
}
