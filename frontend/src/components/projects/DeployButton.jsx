import React from "react"
import { motion } from "framer-motion"
import { Rocket, Loader2 } from "lucide-react"
import { cn } from "../../lib/utils"

export default function DeployButton({
  onClick,
  isLoading,
  label = "Deploy",
  className,
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={isLoading}
      className={cn(
        "relative group overflow-hidden flex items-center justify-center gap-2",
        "bg-white text-black font-semibold text-sm px-5 py-2.5 rounded-lg shadow-lg shadow-white/10 transition-all",
        "hover:bg-white/90 disabled:opacity-70 disabled:cursor-not-allowed",
        className,
      )}
    >
      {/* Glossy overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      {isLoading ? (
        <Loader2 size={16} className="animate-spin" />
      ) : (
        <Rocket
          size={16}
          className="group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform"
        />
      )}
      <span>{isLoading ? "Deploying..." : label}</span>
    </motion.button>
  )
}
