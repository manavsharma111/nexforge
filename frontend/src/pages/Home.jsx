import React from "react"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import SmoothScroll from "../components/common/SmoothScroll"
import Hover from "../components/common/Hover"

// Section Components
import HeroSection from "../components/common/Section/HeroSection"
import TechMarquee from "../components/common/Section/TechMarquee"
import BentoGrid from "../components/common/Section/BentoGrid"
import AnalyticsSection from "../components/common/Section/AnalyticsSection"
import TrustSection from "../components/common/Section/TrustSection"
import CtaSection from "../components/common/Section/CtaSection"

const Home = () => {
  const navigate = useNavigate()

  return (
    <SmoothScroll>
      <motion.div
        initial={{ opacity: 0, filter: "blur(10px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="bg-[#040404] text-white font-sans overflow-x-hidden w-full relative"
      >
        {/* Global Background Grid */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div
            className="w-full h-full absolute top-0 left-0 opacity-[0.03]"
            style={{
              backgroundImage:
                "linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)",
              backgroundSize: "4rem 4rem",
              maskImage:
                "radial-gradient(ellipse 80% 50% at 50% 50%, #000 70%, transparent 100%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 80% 50% at 50% 50%, #000 70%, transparent 100%)",
            }}
          ></div>
        </div>
        {/* Navbar */}
        <nav className="flex items-center justify-between px-6 py-4 md:px-12 w-full z-50 fixed top-0 left-0 right-0 bg-[#040404]/60 backdrop-blur-xl border-b border-white/5">
          <div className="flex items-center gap-3">
            <img src="/NexForge.png" alt="NexForge Logo" className="w-8 h-8" />
            <span className="font-semibold text-lg tracking-tight">
              NexForge
            </span>
          </div>
          <div className="flex items-center gap-6">
            <button
              onClick={() =>
                window.lenis?.scrollTo("#features", { duration: 1.5 })
              }
              className="text-sm text-[#888] hover:text-white transition-colors hidden md:block cursor-pointer bg-transparent border-none outline-none"
            >
              Features
            </button>
            <button
              onClick={() =>
                window.lenis?.scrollTo("#analytics", { duration: 1.5 })
              }
              className="text-sm text-[#888] hover:text-white transition-colors hidden md:block cursor-pointer bg-transparent border-none outline-none"
            >
              Analytics
            </button>
            <Hover fillColor="#6366F1" className="rounded-md">
              <button
                onClick={() => navigate("/login")}
                className="bg-white text-black text-sm font-semibold px-5 py-2.5 outline-none border border-transparent transition-colors duration-[650ms] hover:duration-150 hover:bg-transparent hover:text-white hover:border-[#6366F1]"
              >
                Sign Up
              </button>
            </Hover>
          </div>
        </nav>

        {/* Sections */}
        <HeroSection />
        <TechMarquee />
        <div id="features">
          <BentoGrid />
        </div>
        <div id="analytics">
          <AnalyticsSection />
        </div>
        <TrustSection />
        <CtaSection />
      </motion.div>
    </SmoothScroll>
  )
}

export default Home
