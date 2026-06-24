import React from "react"
import { Search } from "lucide-react"
import { cn } from "../../lib/utils"
import { motion } from "framer-motion"

export default function SearchInput({
  className,
  placeholder = "Search...",
  ...props
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn("relative group", className)}
    >
      <Search
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-white transition-colors"
      />
      <input
        type="text"
        placeholder={placeholder}
        className={cn(
          "w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white",
          "focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all",
          "placeholder:text-muted-foreground",
        )}
        {...props}
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
        <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/10 border border-white/10 text-[10px] font-medium text-muted-foreground font-mono">
          <span className="text-xs">⌘</span>K
        </kbd>
      </div>
    </motion.div>
  )
}
