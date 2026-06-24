import React, { useRef, useLayoutEffect } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const FEATURES = [
  {
    title: "Instant Deployments",
    description: "Push to GitHub. We handle the rest. Your app goes live in seconds with zero-config builds.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
    ),
    color: "#A855F7",
    size: "large",
  },
  {
    title: "Global CDN",
    description: "Assets served from edge nodes worldwide for blazing-fast load times.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    ),
    color: "#3B82F6",
    size: "medium",
  },
  {
    title: "Real-Time Logs",
    description: "Stream build and runtime logs live to your browser.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
    ),
    color: "#22C55E",
    size: "medium",
  },
  {
    title: "GitHub Integration",
    description: "Connect repos, auto-deploy on push, and manage webhooks.",
    icon: (
      <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"/></svg>
    ),
    color: "#FFFFFF",
    size: "small",
  },
  {
    title: "Analytics Dashboard",
    description: "CPU, memory, bandwidth — all in real time.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
    ),
    color: "#6366F1",
    size: "small",
  },
  {
    title: "Environment Variables",
    description: "Securely manage secrets and config per project.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
    ),
    color: "#EAB308",
    size: "small",
  },
  {
    title: "Auto Scaling",
    description: "Handle traffic spikes without lifting a finger.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
    ),
    color: "#F43F5E",
    size: "small",
  },
  {
    title: "DDoS Protection",
    description: "Enterprise-grade mitigation built in by default.",
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
    ),
    color: "#10B981",
    size: "small",
  },
 {
  title: "Team Collaboration",
  description: "Invite teammates and manage project access.",
  icon: (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M17 20h5v-1a4 4 0 00-5-3.87M17 20H7m10 0v-1c0-.653-.084-1.287-.24-1.89M7 20H2v-1a4 4 0 015-3.87M7 20v-1c0-.653.084-1.287.24-1.89m0 0a5.002 5.002 0 019.52 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  ),
  color: "#06B6D4",
  size: "small",
},
{
  title: "Preview Environments",
  description: "Generate preview deployments for every pull request.",
  icon: (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M13.828 10.172a4 4 0 010 5.656l-2 2a4 4 0 01-5.656-5.656l1-1m9.656-1.656a4 4 0 00-5.656 0l-1 1m-2 4l6-6"
      />
    </svg>
  ),
  color: "#8B5CF6",
  size: "small",
},
{
  title: "Custom Domains",
  description: "Connect your own domain with automatic SSL.",
  icon: (
    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 6c1.657 0 3-2.686 3-6s-1.343-6-3-6-3 2.686-3 6 1.343 6 3 6zm0-12h.01"
      />
    </svg>
  ),
  color: "#F97316",
  size: "small",
},
]

export default function BentoGrid() {
  const gridRef = useRef(null)

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      const cards = gridRef.current.querySelectorAll("[data-bento-card]")
      gsap.fromTo(cards,
        { opacity: 0, y: 60, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse",
          },
        }
      )
    }, gridRef)
    return () => ctx.revert()
  }, [])

  return (
    <section className="py-28 px-6 md:px-12 max-w-7xl mx-auto border-b border-white/5">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6">
          Everything you need.
        </h2>
        <p className="text-xl text-[#A1A1AA]">
          A complete deployment platform with enterprise-grade features, all built in from day one.
        </p>
      </div>

      {/* Bento Grid */}
      <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[200px]">
        {FEATURES.map((feature, i) => {
          // Define grid spans based on size
          let sizeClass = ""
          if (feature.size === "large") sizeClass = "md:col-span-2 md:row-span-2"
          else if (feature.size === "medium") sizeClass = "md:col-span-2 lg:col-span-2"
          else sizeClass = "md:col-span-1"

          return (
            <div
              key={i}
              data-bento-card
              className={`${sizeClass} group relative bg-[#111] border border-[#222] rounded-2xl p-8 flex flex-col justify-end overflow-hidden hover:border-[#444] transition-all duration-500 cursor-default`}
            >
              {/* Subtle glow on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-2xl"
                style={{
                  background: `radial-gradient(600px circle at 50% 50%, ${feature.color}08, transparent 60%)`,
                }}
              ></div>

              {/* Icon */}
              <div
                className="mb-4 w-12 h-12 rounded-xl flex items-center justify-center relative z-10"
                style={{
                  backgroundColor: `${feature.color}15`,
                  color: feature.color,
                }}
              >
                {feature.icon}
              </div>

              {/* Text */}
              <h3 className="text-xl font-bold mb-2 text-white relative z-10 group-hover:translate-x-1 transition-transform duration-300">{feature.title}</h3>
              <p className="text-sm text-[#888] leading-relaxed relative z-10">{feature.description}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
