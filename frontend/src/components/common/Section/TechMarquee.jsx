import React from "react"

const TECHS = [
  { name: "React", color: "#61DAFB" },
  { name: "Next.js", color: "#FFFFFF" },
  { name: "Node.js", color: "#339933" },
  { name: "Express", color: "#FFFFFF" },
  { name: "MongoDB", color: "#47A248" },
  { name: "Docker", color: "#2496ED" },
  { name: "Redis", color: "#DC382D" },
  { name: "PostgreSQL", color: "#4169E1" },
  { name: "Tailwind CSS", color: "#06B6D4" },
  { name: "Vite", color: "#646CFF" },
  { name: "GitHub", color: "#FFFFFF" },
  { name: "Nginx", color: "#009639" },
  { name: "AWS", color: "#FF9900" },
]

// We duplicate the list to create a seamless infinite loop
const DOUBLE_TECHS = [...TECHS, ...TECHS]

export default function TechMarquee() {
  return (
    <section className="py-20 border-b border-white/5 overflow-hidden relative">
      <p className="text-center text-sm text-[#555] uppercase tracking-[0.2em] font-semibold mb-12">
        Built for the modern stack
      </p>

      {/* Row 1 — scrolls left */}
      <div className="relative group mb-6">
        <div
          className="flex gap-8 w-max hover:[animation-play-state:paused]"
          style={{
            animation: "marqueeLeft 40s linear infinite",
          }}
        >
          {DOUBLE_TECHS.map((tech, i) => (
            <div
              key={`r1-${i}`}
              className="flex items-center gap-3 px-6 py-3 bg-[#111] border border-[#222] rounded-full shrink-0 hover:border-[#444] hover:bg-[#1a1a1a] transition-all duration-300 cursor-default"
            >
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: tech.color, boxShadow: `0 0 8px ${tech.color}40` }}
              ></div>
              <span className="text-sm font-medium text-[#ccc] whitespace-nowrap">{tech.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Row 2 — scrolls right */}
      <div className="relative group">
        <div
          className="flex gap-8 w-max hover:[animation-play-state:paused]"
          style={{
            animation: "marqueeRight 45s linear infinite",
          }}
        >
          {[...DOUBLE_TECHS].reverse().map((tech, i) => (
            <div
              key={`r2-${i}`}
              className="flex items-center gap-3 px-6 py-3 bg-[#111] border border-[#222] rounded-full shrink-0 hover:border-[#444] hover:bg-[#1a1a1a] transition-all duration-300 cursor-default"
            >
              <div
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: tech.color, boxShadow: `0 0 8px ${tech.color}40` }}
              ></div>
              <span className="text-sm font-medium text-[#ccc] whitespace-nowrap">{tech.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Edge fades using Tailwind */}
      <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-[#040404] to-transparent z-10 pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-[#040404] to-transparent z-10 pointer-events-none"></div>

      {/* Inline keyframes via style tag — Tailwind has no built-in marquee */}
      <style>{`
        @keyframes marqueeLeft {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marqueeRight {
          0% { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
      `}</style>
    </section>
  )
}
