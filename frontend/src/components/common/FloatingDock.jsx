import React from "react"
import { motion } from "framer-motion"
import {
  LayoutDashboard,
  Globe,
  Settings,
  TerminalSquare,
  GitBranch,
} from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import { cn } from "../../lib/utils"

export default function FloatingDock({ className }) {
  const navigate = useNavigate()
  const location = useLocation()

  const dockItems = [
    { id: "dashboard", icon: LayoutDashboard, path: "/", label: "Dashboard" },
    { id: "new", icon: Globe, path: "/new", label: "Deploy" },
  ]

  return (
    <div
      className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-xs sm:w-auto",
        className,
      )}
    >
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="glass-panel p-2 rounded-2xl flex items-center gap-2"
      >
        {dockItems.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path !== "/" && location.pathname.startsWith(item.path))

          return (
            <motion.button
              key={item.id}
              onClick={() => navigate(item.path)}
              whileHover={{ scale: 1.15, y: -4 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                "relative group p-3 rounded-xl transition-colors",
                isActive
                  ? "text-white bg-white/10"
                  : "text-muted-foreground hover:text-white hover:bg-white/5",
              )}
            >
              <item.icon size={20} />

              {/* Tooltip */}
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-popover border border-white/10 rounded text-[11px] font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl">
                {item.label}
              </div>

              {/* Active Dot */}
              {isActive && (
                <motion.div
                  layoutId="dock-indicator"
                  className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 bg-primary rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                />
              )}
            </motion.button>
          )
        })}
      </motion.div>
    </div>
  )
}
