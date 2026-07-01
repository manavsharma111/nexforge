import React, { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  Folder,
  Globe,
  Settings,
  Terminal,
  FileText,
} from "lucide-react"

const navItems = [
  {
    id: "dashboard",
    label: "Overview",
    icon: LayoutDashboard,
    path: "/dashboard",
  },
  { id: "projects", label: "Projects", icon: Folder, path: "/projects" },
  { id: "deploy", label: "New Project", icon: Globe, path: "/new" },
  {
    id: "deployment-docs",
    label: "Guide",
    icon: FileText,
    path: "/deployment-docs",
  },
  { id: "docs", label: "CLI Docs", icon: Terminal, path: "/docs" },
  { id: "settings", label: "Settings", icon: Settings, path: "/settings" },
]

export default function MobileNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("dashboard")

  // Sync active tab with current route
  useEffect(() => {
    const match = navItems.find(
      (i) =>
        location.pathname === i.path ||
        (i.path !== "/" && location.pathname.startsWith(i.path)),
    )
    if (match) {
      setActiveTab(match.id)
    }
  }, [location.pathname])

  const handleTap = (item) => {
    navigate(item.path)
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex justify-center select-none md:hidden w-full max-w-[90vw]">
      <nav className="flex items-center p-2 gap-1 bg-[#18181B]/80 backdrop-blur-2xl rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.6)] border border-[rgba(255,255,255,0.08)]">
        {navItems.map((item) => {
          const isLit = activeTab === item.id
          const Icon = item.icon

          return (
            <button
              key={item.id}
              type="button"
              onPointerDown={() => handleTap(item)}
              className="relative flex items-center justify-center px-4 py-3 rounded-full outline-none"
              style={{
                WebkitTapHighlightColor: "transparent",
                touchAction: "manipulation",
              }}
            >
              {/* Pill glow */}
              <AnimatePresence>
                {isLit && (
                  <motion.span
                    layoutId="mobile-nav-pill"
                    className="absolute inset-0 rounded-full bg-white/10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
                  />
                )}
              </AnimatePresence>

              <span
                className={`relative z-10 flex items-center gap-2 transition-colors duration-200 ${
                  isLit ? "text-white" : "text-[#A1A1AA]"
                }`}
              >
                <Icon size={20} strokeWidth={isLit ? 2.5 : 2} />
              </span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
