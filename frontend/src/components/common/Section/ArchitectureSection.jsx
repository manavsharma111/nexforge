import React, { useRef, useLayoutEffect } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

gsap.registerPlugin(ScrollTrigger)

export default function ArchitectureSection() {
  const horizontalSectionRef = useRef(null)
  const horizontalScrollRef = useRef(null)

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      const getScrollAmount = () => {
        let horizontalWidth = horizontalScrollRef.current.scrollWidth
        return -(horizontalWidth - window.innerWidth)
      }

      const tween = gsap.to(horizontalScrollRef.current, {
        x: getScrollAmount,
        ease: "none"
      })

      ScrollTrigger.create({
        trigger: horizontalSectionRef.current,
        start: "top top",
        end: () => `+=${getScrollAmount() * -1}`,
        pin: true,
        animation: tween,
        scrub: 1,
        invalidateOnRefresh: true
      })
    }, horizontalSectionRef)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={horizontalSectionRef} className="h-screen w-full overflow-hidden bg-[#0a0a0a] border-b border-white/5 flex items-center">
      <div className="pl-6 md:pl-24 flex items-center h-full">
        <div ref={horizontalScrollRef} className="flex gap-16 md:gap-32 flex-nowrap items-center w-max pr-24">
          
          <div className="w-[80vw] md:w-[600px] shrink-0">
            <h2 className="text-6xl md:text-8xl font-bold tracking-tighter mb-4">Enterprise <br/> Grade <br/> Architecture.</h2>
            <p className="text-xl text-[#A1A1AA]">Scroll to explore how we keep your apps secure and available 24/7.</p>
          </div>

          {/* Cards */}
          <div className="w-[85vw] md:w-[500px] shrink-0 bg-[#111] border border-[#222] p-12 rounded-3xl">
            <div className="w-16 h-16 bg-[#6366F1]/20 text-[#6366F1] flex items-center justify-center rounded-2xl mb-8">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <h3 className="text-4xl font-bold mb-6">Secure Isolation</h3>
            <p className="text-xl text-[#A1A1AA] leading-relaxed">Every deployment runs in strictly isolated containers. Built with maximum security to host your most critical applications without compromise.</p>
          </div>

          <div className="w-[85vw] md:w-[500px] shrink-0 bg-[#111] border border-[#222] p-12 rounded-3xl">
            <div className="w-16 h-16 bg-[#A855F7]/20 text-[#A855F7] flex items-center justify-center rounded-2xl mb-8">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            </div>
            <h3 className="text-4xl font-bold mb-6">Instant Rollbacks</h3>
            <p className="text-xl text-[#A1A1AA] leading-relaxed">Versioned deployments allow for instantaneous, zero-downtime rollbacks. If a new build fails, you're always covered.</p>
          </div>

          <div className="w-[85vw] md:w-[500px] shrink-0 bg-[#111] border border-[#222] p-12 rounded-3xl">
            <div className="w-16 h-16 bg-[#F43F5E]/20 text-[#F43F5E] flex items-center justify-center rounded-2xl mb-8">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h3 className="text-4xl font-bold mb-6">Global Edge CDN</h3>
            <p className="text-xl text-[#A1A1AA] leading-relaxed">Serve your static assets from our lightning-fast global edge network. Experience millisecond latency for users anywhere in the world.</p>
          </div>

          <div className="w-[85vw] md:w-[500px] shrink-0 bg-[#111] border border-[#222] p-12 rounded-3xl">
            <div className="w-16 h-16 bg-[#10B981]/20 text-[#10B981] flex items-center justify-center rounded-2xl mb-8">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
            </div>
            <h3 className="text-4xl font-bold mb-6">Automated CI/CD</h3>
            <p className="text-xl text-[#A1A1AA] leading-relaxed">Just push to GitHub. We automatically detect changes, build your project, and deploy the new version without any manual configuration.</p>
          </div>

          <div className="w-[85vw] md:w-[500px] shrink-0 bg-[#111] border border-[#222] p-12 rounded-3xl">
            <div className="w-16 h-16 bg-[#3B82F6]/20 text-[#3B82F6] flex items-center justify-center rounded-2xl mb-8">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <h3 className="text-4xl font-bold mb-6">DDoS Protection</h3>
            <p className="text-xl text-[#A1A1AA] leading-relaxed">Enterprise-grade DDoS mitigation is built-in by default. Your applications stay online and responsive even during massive traffic spikes or attacks.</p>
          </div>

        </div>
      </div>
    </section>
  )
}
