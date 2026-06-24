import React from "react"

const AnimatedButton = ({
  children,
  variant = "primary",
  className = "",
  loading = false,
  ...props
}) => {
  const baseClasses =
    "flex items-center justify-center gap-2 tracking-wide rounded-xl border transition-all active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed"

  const variants = {
    primary:
      "bg-white text-black font-semibold border-gray-300 shadow-[4px_4px_0px_#333] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#333]",
    secondary:
      "bg-vercel-darkAccent text-white font-medium border-vercel-border shadow-[4px_4px_0px_#000] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#000]",
    blue: "bg-vercel-blue text-white font-semibold border-vercel-lightBlue shadow-[4px_4px_0px_#005bb5] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#005bb5]",
  }

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${className} px-5 py-2.5`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
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
    </button>
  )
}

export default AnimatedButton
