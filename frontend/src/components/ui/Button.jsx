import React from "react"
import { cn } from "../../lib/utils"
import { motion } from "framer-motion"

const Button = React.forwardRef(
  (
    {
      className,
      variant = "primary",
      size = "default",
      isLoading,
      children,
      ...props
    },
    ref,
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-[#09090B] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#6366F1] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"

    const variants = {
      primary: "bg-[#FFFFFF] text-[#09090B] hover:bg-[#A1A1AA]/90",
      secondary:
        "bg-[#18181B] text-[#FFFFFF] border border-[rgba(255,255,255,0.08)] hover:bg-[#111827]",
      accent: "bg-[#6366F1] text-white hover:bg-[#6366F1]/90",
      ghost: "text-[#A1A1AA] hover:bg-[#18181B] hover:text-[#FFFFFF]",
      destructive: "bg-[#EF4444] text-white hover:bg-[#EF4444]/90",
    }

    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-9 rounded-md px-3",
      lg: "h-11 rounded-md px-8",
      icon: "h-10 w-10",
    }

    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <svg
            className="mr-2 h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        ) : null}
        {children}
      </motion.button>
    )
  },
)

Button.displayName = "Button"
export { Button }
