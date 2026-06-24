import React from "react"
import { motion } from "framer-motion"
import { Server, LayoutTemplate, GitBranch, Settings, Zap, Shield, CheckCircle2, RefreshCw } from "lucide-react"

export default function DeploymentDocs() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
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
        <motion.div variants={itemVariants} className="mb-12 text-center md:text-left">
          <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight mb-4">
            Platform Deployment Guide
          </h1>
          <p className="text-lg text-[#A1A1AA] leading-relaxed max-w-2xl mx-auto md:mx-0">
            A comprehensive overview of NexForge's internal deployment architecture and dashboard-driven deployment workflows
          </p>
        </motion.div>

        {/* Architecture Section */}
        <motion.section variants={itemVariants} className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-[#6366F1]/10 border border-[#6366F1]/20 flex items-center justify-center">
              <Server className="w-5 h-5 text-[#6366F1]" />
            </div>
            <h2 className="text-2xl font-semibold text-white tracking-tight">Deployment Architecture</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#111111]/80 backdrop-blur-md border border-[rgba(255,255,255,0.06)] p-6 rounded-2xl hover:border-[rgba(255,255,255,0.1)] transition-colors">
              <Shield className="w-6 h-6 text-emerald-400 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Secure Isolation</h3>
              <p className="text-[#A1A1AA] text-sm leading-relaxed">
                NexForge separates static assets from backend services, ensuring maximum security and optimal load balancing across our edge network
              </p>
            </div>
            <div className="bg-[#111111]/80 backdrop-blur-md border border-[rgba(255,255,255,0.06)] p-6 rounded-2xl hover:border-[rgba(255,255,255,0.1)] transition-colors">
              <RefreshCw className="w-6 h-6 text-blue-400 mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">Instant Rollbacks</h3>
              <p className="text-[#A1A1AA] text-sm leading-relaxed">
                Every deployment is strictly versioned in isolated containers This allows for instantaneous, zero-downtime rollbacks if a new build fails
              </p>
            </div>
          </div>
        </motion.section>

        {/* Dashboard Deployment Section */}
        <motion.section variants={itemVariants} className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <LayoutTemplate className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-2xl font-semibold text-white tracking-tight">Deploying via Dashboard</h2>
          </div>
          
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-6 bottom-6 w-px bg-[#6366F1]/50 md:block hidden" />
            
            <div className="space-y-6">
              {[
                { icon: LayoutTemplate, title: "Navigate to Projects", desc: "Open your personal dashboard and click on New Project to begin the process" },
                { icon: GitBranch, title: "Connect Repository", desc: "Link your GitHub account and select the repository you want to deploy, or manually upload your build files" },
                { icon: Settings, title: "Configure Settings", desc: "Set your build commands, output directory, and inject any required environment variables safely" },
                { icon: Zap, title: "Trigger Build", desc: "Click Deploy and watch the live logs stream directly to your browser as NexForge builds your app" }
              ].map((step, idx) => (
                <div key={idx} className="flex flex-col md:flex-row gap-6 relative group">
                  <div className="w-12 h-12 rounded-full bg-[#18181B] border border-[rgba(255,255,255,0.1)] flex items-center justify-center shrink-0 z-10 group-hover:border-[#6366F1] group-hover:bg-[#6366F1]/10 transition-colors mx-auto md:mx-0">
                    <step.icon className="w-5 h-5 text-gray-400 group-hover:text-[#6366F1] transition-colors" />
                  </div>
                  <div className="bg-[#111111]/60 backdrop-blur-sm border border-[rgba(255,255,255,0.04)] p-5 rounded-2xl flex-1 hover:bg-[#111111]/80 transition-colors text-center md:text-left">
                    <h3 className="text-white font-medium mb-1">Step {idx + 1} - {step.title}</h3>
                    <p className="text-[#A1A1AA] text-sm">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Managing Deployments Section */}
        <motion.section variants={itemVariants}>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-semibold text-white tracking-tight">Managing Deployments</h2>
          </div>
          
          <div className="bg-[#18181b] border border-[rgba(255,255,255,0.08)] p-8 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none" />
            <h3 className="text-xl font-medium text-white mb-4 relative z-10">High Availability Guarantee</h3>
            <p className="text-[#A1A1AA] leading-relaxed relative z-10">
              You can view all past deployments in the project's Deployments tab If a newly triggered deployment fails during the build step, your website will seamlessly remain online using the previous successful deployment state Zero downtime, absolute peace of mind
            </p>
          </div>
        </motion.section>

      </motion.div>
    </div>
  )
}
