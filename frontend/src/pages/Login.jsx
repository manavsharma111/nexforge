import React, { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import authService from "../services/authService"
import { motion } from "framer-motion"
import { LayoutTemplate, GitBranch, Settings, Zap } from "lucide-react"

const Login = () => {
  const { isAuthenticated } = useSelector((state) => state.auth)
  const navigate = useNavigate()
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  }

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard")
    }
  }, [isAuthenticated, navigate])

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center bg-[#040404] px-4 font-sans overflow-hidden">
      {/* Background Grid & Glow */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="w-full h-full absolute top-0 left-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)', backgroundSize: '4rem 4rem', maskImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, #000 70%, transparent 100%)', WebkitMaskImage: 'radial-gradient(ellipse 60% 50% at 50% 50%, #000 70%, transparent 100%)' }}></div>
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>

      {/* Back to Home Button */}
      <button 
        onClick={() => navigate("/")}
        className="absolute top-8 left-6 md:left-12 text-[#888] hover:text-white flex items-center gap-2 transition-colors z-20 outline-none"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
        <span className="text-sm font-medium">Back</span>
      </button>

 

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6">
  <div className="flex flex-col lg:flex-row items-center justify-between gap-20">

    {/* ================= Left Side ================= */}
    <motion.section
      initial="hidden"
      animate="visible"
      variants={{
        visible: { transition: { staggerChildren: 0.15 } }
      }}
      className="flex-1 max-w-2xl relative"
    >
      <motion.div variants={itemVariants} className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.2)]">
          <LayoutTemplate className="w-6 h-6 text-indigo-400" />
        </div>

        <h2 className="text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
          Deploying via Dashboard
        </h2>
      </motion.div>

      <div className="relative">
        {/* Timeline Glow */}
        <div className="absolute left-6 top-8 bottom-8 w-px bg-gradient-to-b from-indigo-500/50 via-purple-500/50 to-transparent hidden md:block" />

        <div className="space-y-6">
          {[
            {
              icon: LayoutTemplate,
              title: "Navigate to Projects",
              desc: "Open your personal dashboard and click on New Project to begin the deployment process.",
            },
            {
              icon: GitBranch,
              title: "Connect Repository",
              desc: "Link your GitHub account or manually upload your build files.",
            },
            {
              icon: Settings,
              title: "Configure Settings",
              desc: "Set build command, output directory and environment variables.",
            },
            {
              icon: Zap,
              title: "Deploy",
              desc: "Click Deploy and monitor live build logs until your app is live.",
            },
          ].map((step, idx) => (
            <motion.div
              key={idx}
              variants={itemVariants}
              className="flex gap-6 relative group items-start cursor-default"
            >
              <div className="relative z-10">
                <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="w-12 h-12 rounded-full bg-[#111] border border-white/10 flex items-center justify-center shrink-0 relative z-10 transition-all duration-300 group-hover:border-indigo-500/50 group-hover:bg-indigo-500/10 group-hover:scale-110">
                  <step.icon className="w-5 h-5 text-gray-500 group-hover:text-indigo-400 transition-colors duration-300" />
                </div>
              </div>

              <div className="flex-1 rounded-2xl border border-white/5 bg-white/[0.02] backdrop-blur-md p-6 transition-all duration-300 group-hover:bg-white/[0.04] group-hover:border-indigo-500/30 group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-indigo-500/10">
                <h3 className="text-white font-semibold mb-2 flex items-center gap-3 text-lg">
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

    {/*Right Side*/}
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
  className="w-full max-w-[420px] shrink-0 border border-white/10 rounded-3xl p-6 bg-white/5 backdrop-blur-md"

    >

      {/* Logo */}
      <div className="mb-10 flex flex-col items-center">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-indigo-500/20 backdrop-blur-md relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <img
            src="/NexForge.png"
            alt="NexForge Logo"
            className="w-10 h-10 relative z-10 drop-shadow-lg group-hover:scale-110 transition-transform duration-500"
          />
        </div>

        <h1 className="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2">
          Welcome to NexForge
        </h1>

        <p className="text-[#A1A1AA] text-center">
          Log in to deploy your next big idea.
        </p>
      </div>

      {/* Login Card */}
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/30 to-purple-500/30 rounded-2xl blur opacity-30 group-hover:opacity-60 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative w-full bg-[#09090B]/90 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">

          <button
            onClick={() => authService.GithubLogin()}
            className="relative w-full group/btn flex items-center justify-center gap-3 bg-white text-black font-semibold text-sm px-4 py-3.5 rounded-xl transition-all hover:scale-[1.02] active:scale-95 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-300 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
            <svg
              className="w-5 h-5 relative z-10"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
            <span className="relative z-10">Continue with GitHub</span>
          </button>

          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-[#888] font-medium">
            <span>Secured via OAuth 2.0</span>
            <div className="relative flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/10">
              <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping"></div>
              <svg
                className="w-3.5 h-3.5 text-emerald-500 relative z-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <p className="mt-10 text-xs text-[#666] text-center leading-relaxed">
        By continuing, you agree to NexForge's{" "}
        <a
          href="#"
          className="text-[#999] hover:text-white transition-colors underline underline-offset-4 decoration-white/20 hover:decoration-white/60"
        >
          Terms of Service
        </a>{" "}
        and{" "}
        <a
          href="#"
          className="text-[#999] hover:text-white transition-colors underline underline-offset-4 decoration-white/20 hover:decoration-white/60"
        >
          Privacy Policy
        </a>
        .
      </p>

    </motion.div>
    
  </div>
</div>
    </div>
  )
}

export default Login
