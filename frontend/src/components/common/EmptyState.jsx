import React from "react"
import { motion } from "framer-motion"
import { cn } from "../../lib/utils"
import { Plus } from "lucide-react"

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  className,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "flex flex-col items-center justify-center p-12 text-center",
        "border border-dashed border-white/10 rounded-2xl bg-white/[0.02]",
        className,
      )}
    >
      {Icon && (
        <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-5 ring-1 ring-white/10 shadow-inner">
          <Icon size={26} className="text-muted-foreground" />
        </div>
      )}
      <h3 className="text-white font-medium mb-2 text-lg tracking-tight">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">
        {description}
      </p>

      {actionLabel && onAction && (
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onAction}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground text-sm font-medium px-5 py-2.5 rounded-lg shadow-lg shadow-white/10 transition-colors hover:bg-white/90"
        >
          <Plus size={16} />
          {actionLabel}
        </motion.button>
      )}
    </motion.div>
  )
}
