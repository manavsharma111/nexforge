// import React, { useRef, useLayoutEffect, useState, useEffect } from "react"
// import gsap from "gsap"
// import { ScrollTrigger } from "gsap/ScrollTrigger"

// gsap.registerPlugin(ScrollTrigger)

// const STATS = [
//   { label: "Deployments", target: 12847, suffix: "+", color: "#A855F7" },
//   { label: "Uptime", target: 99.9, suffix: "%", decimals: 1, color: "#22C55E" },
//   { label: "Avg Deploy Time", target: 1.2, suffix: "s", decimals: 1, color: "#3B82F6" },
//   { label: "Projects Hosted", target: 3420, suffix: "+", color: "#EAB308" },
// ]

// function AnimatedCounter({ target, suffix = "", decimals = 0, isVisible }) {
//   const [value, setValue] = useState(0)

//   useEffect(() => {
//     if (!isVisible) return
//     const duration = 2000
//     const steps = 60
//     const increment = target / steps
//     let current = 0
//     let step = 0

//     const timer = setInterval(() => {
//       step++
//       current = Math.min(target, increment * step)
//       // Ease out
//       const progress = step / steps
//       const easedProgress = 1 - Math.pow(1 - progress, 3)
//       setValue(target * easedProgress)

//       if (step >= steps) {
//         setValue(target)
//         clearInterval(timer)
//       }
//     }, duration / steps)

//     return () => clearInterval(timer)
//   }, [isVisible, target])

//   const displayValue = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString()

//   return (
//     <span>{displayValue}{suffix}</span>
//   )
// }

// export default function TrustSection() {
//   const sectionRef = useRef(null)
//   const [isVisible, setIsVisible] = useState(false)

//   useLayoutEffect(() => {
//     let ctx = gsap.context(() => {
//       ScrollTrigger.create({
//         trigger: sectionRef.current,
//         start: "top 75%",
//         onEnter: () => setIsVisible(true),
//         onLeaveBack: () => setIsVisible(false),
//       })
//     }, sectionRef)
//     return () => ctx.revert()
//   }, [])

//   return (
//     <section ref={sectionRef} className="py-28 px-6 md:px-12 max-w-7xl mx-auto border-b border-white/5">
//       <div className="text-center mb-16">
//         <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6">
//           Trusted at scale.
//         </h2>
//         <p className="text-xl text-[#A1A1AA]">
//           Numbers that speak for themselves.
//         </p>
//       </div>

//       <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
//         {STATS.map((stat, i) => (
//           <div
//             key={i}
//             className="text-center p-8 bg-[#111] border border-[#222] rounded-2xl hover:border-[#444] transition-colors duration-300"
//           >
//             <div
//               className="text-5xl md:text-6xl font-bold tracking-tight mb-3"
//               style={{ color: stat.color }}
//             >
//               <AnimatedCounter
//                 target={stat.target}
//                 suffix={stat.suffix}
//                 decimals={stat.decimals || 0}
//                 isVisible={isVisible}
//               />
//             </div>
//             <p className="text-sm text-[#888] font-medium uppercase tracking-wider">{stat.label}</p>
//           </div>
//         ))}
//       </div>
//     </section>
//   )
// }


import React, { useRef, useLayoutEffect, useState, useEffect } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

const STATS = [
  { label: "Deployments", target: 12847, suffix: "+", color: "#A855F7" },
  { label: "Uptime", target: 99.9, suffix: "%", decimals: 1, color: "#22C55E" },
  { label: "Avg Deploy Time", target: 1.2, suffix: "s", decimals: 1, color: "#3B82F6" },
  { label: "Projects Hosted", target: 3420, suffix: "+", color: "#EAB308" },
]

function AnimatedCounter({
  target,
  suffix = "",
  decimals = 0,
  isVisible,
}) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!isVisible) return

    const duration = 2000
    const steps = 60
    let step = 0

    const timer = setInterval(() => {
      step++

      const progress = step / steps
      const easedProgress = 1 - Math.pow(1 - progress, 3)

      setValue(target * easedProgress)

      if (step >= steps) {
        setValue(target)
        clearInterval(timer)
      }
    }, duration / steps)

    return () => clearInterval(timer)
  }, [isVisible, target])

  const displayValue =
    decimals > 0
      ? value.toFixed(decimals)
      : Math.round(value).toLocaleString()

  return (
    <span>
      {displayValue}
      {suffix}
    </span>
  )
}

export default function TrustSection() {
  const sectionRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: "top 75%",
        onEnter: () => setIsVisible(true),
        onLeaveBack: () => setIsVisible(false),
      })
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <section
      ref={sectionRef}
      className="
        py-16 sm:py-20 md:py-24 lg:py-28
        px-4 sm:px-6 md:px-12
        max-w-7xl mx-auto
        border-b border-white/5
      "
    >
      {/* Heading */}
      <div className="text-center mb-10 sm:mb-12 md:mb-16">
        <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold tracking-tighter mb-4 md:mb-6">
          Trusted at scale.
        </h2>

        <p className="text-base sm:text-lg md:text-xl text-[#A1A1AA] max-w-2xl mx-auto">
          Numbers that speak for themselves.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
        {STATS.map((stat, i) => (
          <div
            key={i}
            className="
              text-center
              p-5 sm:p-6 md:p-8
              bg-[#111]
              border border-[#222]
              rounded-xl sm:rounded-2xl
              hover:border-[#444]
              transition-all duration-300
              hover:-translate-y-1
            "
          >
            <div
              className="
                text-3xl
                sm:text-4xl
                md:text-5xl
                lg:text-6xl
                font-bold
                tracking-tight
                mb-2 sm:mb-3
              "
              style={{ color: stat.color }}
            >
              <AnimatedCounter
                target={stat.target}
                suffix={stat.suffix}
                decimals={stat.decimals || 0}
                isVisible={isVisible}
              />
            </div>

            <p className="text-[11px] sm:text-xs md:text-sm text-[#888] font-medium uppercase tracking-wider">
              {stat.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}