import React from "react"
import { cn } from "../../lib/utils"

const Badge = React.forwardRef(
  ({ className, variant = "default", ...props }, ref) => {
    const variants = {
      default:
        "border-transparent bg-[#FFFFFF] text-[#09090B] hover:bg-[#FFFFFF]/80",
      secondary:
        "border-transparent bg-[#18181B] text-[#FFFFFF] hover:bg-[#18181B]/80",
      destructive:
        "border-transparent bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]/20 hover:bg-[#EF4444]/30",
      success:
        "border-transparent bg-[#22C55E]/20 text-[#22C55E] border border-[#22C55E]/20 hover:bg-[#22C55E]/30",
      accent:
        "border-transparent bg-[#6366F1]/20 text-[#6366F1] border border-[#6366F1]/20 hover:bg-[#6366F1]/30",
      outline: "text-[#A1A1AA] border border-[rgba(255,255,255,0.08)]",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#6366F1] focus:ring-offset-2",
          variants[variant],
          className,
        )}
        {...props}
      />
    )
  },
)

Badge.displayName = "Badge"
export { Badge }
