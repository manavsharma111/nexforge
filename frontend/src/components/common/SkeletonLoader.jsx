import React from "react"
import { cn } from "../../lib/utils"
import { motion } from "framer-motion"

export default function SkeletonLoader({ className, ...props }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-[#18181B]",
        className,
      )}
      {...props}
    >
      <motion.div
        className="absolute inset-0 -translate-x-full bg-transparent"
        animate={{
          translateX: ["-100%", "100%"],
        }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: 1.5,
        }}
      />
    </div>
  )
}
