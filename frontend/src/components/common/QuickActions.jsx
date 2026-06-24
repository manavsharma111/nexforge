import React from "react"
import { motion } from "framer-motion"
import { Plus } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function QuickActions() {
  const navigate = useNavigate()

  return (
    <div className="flex items-center gap-3">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate("/new")}
        className="flex items-center gap-2 bg-primary text-primary-foreground text-sm font-medium px-4 py-2 rounded-lg shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all"
      >
        <Plus size={16} />
        <span className="hidden sm:inline">New Project</span>
      </motion.button>
    </div>
  )
}
