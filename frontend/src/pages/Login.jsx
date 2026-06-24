import React, { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useSelector } from "react-redux"
import authService from "../services/authService"

const Login = () => {
  const { isAuthenticated } = useSelector((state) => state.auth)
  const navigate = useNavigate()

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

      <div className="relative z-10 w-full max-w-[420px] flex flex-col items-center">
        {/* Logo */}
        <div className="mb-10 flex flex-col items-center">
          <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-indigo-500/20 backdrop-blur-sm">
            <img src="/NexForge.png" alt="NexForge Logo" className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Welcome to NexForge</h1>
          <p className="text-[#A1A1AA] text-center">Log in to deploy your next big idea.</p>
        </div>

        {/* Auth Card */}
        <div className="w-full bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <button
            onClick={() => authService.GithubLogin()}
            className="w-full group relative flex items-center justify-center gap-3 bg-white text-black font-semibold text-sm px-4 py-3.5 rounded-xl transition-all hover:bg-gray-200 hover:scale-[1.02] active:scale-95 outline-none"
          >
            <svg className="w-5 h-5 transition-transform group-hover:-translate-y-0.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"></path>
            </svg>
            Continue with GitHub
          </button>

          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-[#666]">
            <span>Secured via OAuth 2.0</span>
            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-xs text-[#555] text-center max-w-[300px]">
          By continuing, you agree to NexForge's <a href="#" className="text-[#888] hover:text-white transition-colors underline decoration-white/20 underline-offset-2">Terms of Service</a> and <a href="#" className="text-[#888] hover:text-white transition-colors underline decoration-white/20 underline-offset-2">Privacy Policy</a>.
        </p>
      </div>
    </div>
  )
}

export default Login
