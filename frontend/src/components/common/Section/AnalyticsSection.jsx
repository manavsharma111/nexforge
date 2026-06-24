import React, { useRef, useLayoutEffect } from "react"
import { motion } from "framer-motion"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export default function AnalyticsSection() {
  const analyticsRef = useRef(null)
  const dashboardCardRef = useRef(null)

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      gsap.fromTo(dashboardCardRef.current,
        {
          opacity: 0,
          y: 150,
          rotateX: 20,
          scale: 0.92
        },
        {
          opacity: 1,
          y: 0,
          rotateX: 0,
          scale: 1,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: analyticsRef.current,
            start: "top 75%",
            toggleActions: "play none none reverse"
          }
        }
      )
    }, analyticsRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={analyticsRef} className="py-32 px-6 md:px-12 max-w-7xl mx-auto border-b border-white/5 relative" style={{ perspective: "1200px" }}>
      <div className="flex flex-col lg:flex-row items-center gap-16 lg:gap-20">
        {/* Left text */}
        <div className="flex-1 max-w-xl">
          <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6">Monitor Everything.</h2>
          <p className="text-xl text-[#A1A1AA] mb-10 leading-relaxed">
            Deep insights into your infrastructure. Live streaming logs, historical deployment tracking, and system-level analytics — all in one view.
          </p>
          <ul className="space-y-4">
            {[
              "Live CPU & RAM monitoring via WebSocket",
              "Network bandwidth tracking in real time",
              "Historical deployment timeline per project",
            ].map((item, i) => (
              <li key={i} className="flex items-center gap-3 text-[#ccc]">
                <span className="w-6 h-6 bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center shrink-0">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Right dashboard mockup */}
        <div className="flex-1 w-full" ref={dashboardCardRef}>
          <div className="bg-[#111] border border-[#333] rounded-2xl p-6 md:p-8 shadow-[0_30px_100px_-20px_rgba(168,85,247,0.2)] relative z-10">
            <div className="flex items-center justify-between mb-6 border-b border-[#222] pb-4">
              <span className="font-mono text-xs tracking-widest text-[#555] uppercase">System Metrics — Live</span>
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#333]"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#333]"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#333]"></span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* CPU Card */}
              <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    <span className="font-medium text-sm">api-backend</span>
                  </div>
                  <span className="text-[10px] text-blue-400 font-mono bg-blue-400/10 px-2 py-0.5 rounded">Deploying</span>
                </div>
                <span className="text-[10px] text-[#555] uppercase font-mono block mb-2">Memory Usage</span>
                <div className="h-28 w-full flex items-end gap-1">
                  {[4, 6, 5, 8, 7, 9, 6, 8, 5, 7, 6, 8].map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: "10%" }}
                      animate={{ height: `${h * 10}%` }}
                      transition={{ duration: 1.2, delay: i * 0.08, repeat: Infinity, repeatType: 'reverse' }}
                      className="flex-1 bg-purple-500/70 rounded-t-sm"
                    />
                  ))}
                </div>
              </div>

              {/* Bandwidth Card */}
              <div className="bg-[#0a0a0a] border border-[#1a1a1a] p-5 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                    <span className="font-medium text-sm">web-frontend</span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-mono bg-emerald-400/10 px-2 py-0.5 rounded">Live</span>
                </div>
                <span className="text-[10px] text-[#555] uppercase font-mono block mb-2">Bandwidth</span>
                <div className="h-28 w-full flex items-end gap-1">
                  {[3, 5, 4, 6, 3, 5, 4, 7, 3, 4, 5, 6].map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: "10%" }}
                      animate={{ height: `${h * 10}%` }}
                      transition={{ duration: 1.2, delay: 0.3 + i * 0.08, repeat: Infinity, repeatType: 'reverse' }}
                      className="flex-1 bg-blue-500/70 rounded-t-sm"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-purple-500/8 rounded-full blur-[120px] pointer-events-none z-0"></div>
    </section>
  )
}
