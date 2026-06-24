import React, { useRef, useLayoutEffect } from "react"
import { useNavigate } from "react-router-dom"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Hover from "../Hover"
import TerminalSimulator from "./TerminalSimulator"

gsap.registerPlugin(ScrollTrigger)

export default function HeroSection() {
  const navigate = useNavigate()
  const heroRef = useRef(null)
  const heroTextRef = useRef(null)
  const terminalRef = useRef(null)

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      // Hero text scale-down on scroll
      gsap.to(heroTextRef.current, {
        scale: 0.85,
        opacity: 0,
        y: 80,
        ease: "none",
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "bottom top",
          scrub: true,
        }
      })

      // Staggered entrance for hero children
      const children = heroTextRef.current.children
      gsap.fromTo(children,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.12,
        }
      )

      // Terminal entrance from right
      if (terminalRef.current) {
        gsap.fromTo(terminalRef.current,
          { opacity: 0, x: 60, rotateY: -8 },
          {
            opacity: 1,
            x: 0,
            rotateY: 0,
            duration: 1,
            ease: "power3.out",
            delay: 0.5,
          }
        )
      }
    }, heroRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={heroRef} className="relative w-full min-h-screen flex items-center justify-center pt-20 overflow-hidden border-b border-white/5">

      {/* Animated gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none animate-pulse" style={{ animationDelay: '1s' }}></div>

      {/* Content */}
      <div className="z-10 max-w-7xl mx-auto w-full px-6 md:px-12 flex flex-col lg:flex-row items-center gap-12 lg:gap-20">

        {/* Left — Text */}
        <div ref={heroTextRef} className="flex-1 flex flex-col items-start">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 border border-white/10 rounded-full mb-8 text-sm text-[#A1A1AA]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Now in public beta
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tighter leading-[0.95] mb-6">
            Deploy. <br />
            <span className="text-[#A855F7]">Scale.</span> <br />
            Conquer.
          </h1>

          <p className="text-lg md:text-xl text-[#A1A1AA] max-w-lg mb-10 leading-relaxed">
            Intuitive infrastructure to scale any app from your first user to your billionth. Push to GitHub, we handle the rest.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Hover fillColor="#A855F7" className="rounded-lg">
              <button
                onClick={() => navigate("/login")}
                className="bg-white text-black font-bold text-base px-8 py-4 flex items-center justify-center gap-3 outline-none border border-transparent transition-colors duration-[650ms] hover:duration-150 hover:bg-transparent hover:text-white hover:border-[#A855F7]"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/></svg>
                Start for free
              </button>
            </Hover>
            <Hover fillColor="#333" className="rounded-lg">
              <button
                onClick={() => navigate("/dashboard")}
                className="bg-transparent text-white font-semibold text-base px-8 py-4 border border-[#333] outline-none"
              >
                Dashboard
              </button>
            </Hover>
          </div>
        </div>

        {/* Right — Terminal */}
        <div ref={terminalRef} className="flex-1 w-full mt-8 lg:mt-0" style={{ perspective: "1000px" }}>
          <TerminalSimulator />
        </div>

      </div>
    </section>
  )
}
