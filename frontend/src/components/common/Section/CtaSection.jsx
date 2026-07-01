import React, { useRef, useLayoutEffect } from "react"
import { useNavigate } from "react-router-dom"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import Hover from "../Hover"

gsap.registerPlugin(ScrollTrigger)

export default function CtaSection() {
  const navigate = useNavigate()
  const ctaRef = useRef(null)

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      gsap.fromTo(
        ctaRef.current.children,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.15,
          scrollTrigger: {
            trigger: ctaRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        },
      )
    }, ctaRef)
    return () => ctx.revert()
  }, [])

  return (
    <footer className="py-40 px-6 bg-[#040404] text-center relative overflow-hidden z-0">
      {/* Background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/15 rounded-t-full blur-[100px] pointer-events-none"></div>

      <div ref={ctaRef} className="relative z-10 flex flex-col items-center">
        <p className="text-sm text-[#555] uppercase tracking-[0.2em] font-semibold mb-6">
          Get started today
        </p>

        <h2 className="text-6xl md:text-[7rem] font-bold tracking-tighter mb-6 leading-[0.95]">
          Ready to <span className="text-[#6366F1]">Deploy?</span>
        </h2>

        <p className="text-xl text-[#A1A1AA] max-w-xl mb-12">
          Join thousands of developers shipping faster with NexForge. No credit
          card required.
        </p>

        <Hover fillColor="#6366F1" className="rounded-xl">
          <button
            onClick={() => navigate("/login")}
            className="bg-white text-black font-bold text-lg px-12 py-5 flex items-center justify-center gap-3 outline-none border border-transparent transition-colors duration-[650ms] hover:duration-150 hover:bg-transparent hover:text-white hover:border-[#6366F1]"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path
                fillRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                clipRule="evenodd"
              />
            </svg>
            Sign Up with GitHub
          </button>
        </Hover>
      </div>
    </footer>
  )
}
