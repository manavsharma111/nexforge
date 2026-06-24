import React from "react"
import { cn } from "../../lib/utils"

const frameworkColors = {
  react: "text-[#61DAFB] bg-[#61DAFB]/10 border-[#61DAFB]/20",
  nextjs: "text-white bg-white/10 border-white/20",
  vue: "text-[#4FC08D] bg-[#4FC08D]/10 border-[#4FC08D]/20",
  angular: "text-[#DD0031] bg-[#DD0031]/10 border-[#DD0031]/20",
  svelte: "text-[#FF3E00] bg-[#FF3E00]/10 border-[#FF3E00]/20",
  node: "text-[#339933] bg-[#339933]/10 border-[#339933]/20",
  default: "text-muted-foreground bg-white/5 border-white/10",
}

export default function FrameworkBadge({ framework, className }) {
  const normalized = framework?.toLowerCase().replace(".", "") || "default"
  const colorClass = frameworkColors[normalized] || frameworkColors.default

  return (
    <div
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border uppercase tracking-wider",
        colorClass,
        className,
      )}
    >
      {framework || "Unknown"}
    </div>
  )
}
