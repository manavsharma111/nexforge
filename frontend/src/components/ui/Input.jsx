import React from "react"
import { cn } from "../../lib/utils"

const Input = React.forwardRef(
  ({ className, type, icon: Icon, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A1A1AA]">
            <Icon size={16} />
          </div>
        )}
        <input
          type={type}
          className={cn(
            "flex h-10 w-full rounded-md border border-[rgba(255,255,255,0.08)] bg-[#09090B] px-3 py-2 text-sm text-[#FFFFFF] ring-offset-[#09090B] file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-[#A1A1AA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
            Icon && "pl-10",
            className,
          )}
          ref={ref}
          {...props}
        />
      </div>
    )
  },
)

Input.displayName = "Input"
export { Input }
