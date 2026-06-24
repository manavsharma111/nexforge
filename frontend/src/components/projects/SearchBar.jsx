import React from "react"
import { Search } from "lucide-react"
import { cn } from "../../lib/utils"
import { motion } from "framer-motion"

export default function SearchBar({
  value,
  onChange,
  placeholder = "Search projects...",
  className,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("relative group w-full max-w-md", className)}
    >
      <Search
        size={18}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full bg-surface border border-white/10 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white",
          "focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all",
          "placeholder:text-muted-foreground hover:border-white/20 shadow-sm",
        )}
      />
      {value && (
        <button
          onClick={() => onChange("")}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors text-xs"
        >
          Clear
        </button>
      )}
    </motion.div>
  )
}
