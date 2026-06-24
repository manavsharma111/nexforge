import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Globe, Folder, Settings, User } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { cn } from "../../lib/utils"

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  const actions = [
    {
      id: "projects",
      title: "View Projects",
      icon: Folder,
      shortcut: "P",
      action: () => navigate("/"),
    },
    {
      id: "new",
      title: "New Deployment",
      icon: Globe,
      shortcut: "N",
      action: () => navigate("/new"),
    },
    {
      id: "settings",
      title: "Settings",
      icon: Settings,
      shortcut: "S",
      action: () => navigate("/settings"),
    },
    {
      id: "team",
      title: "Team Members",
      icon: User,
      shortcut: "T",
      action: () => navigate("/team"),
    },
  ]

  const filteredActions = actions.filter((a) =>
    a.title.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-full max-w-xl bg-card border border-white/10 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto"
            >
              <div className="flex items-center px-4 py-3 border-b border-white/10">
                <Search size={18} className="text-muted-foreground mr-3" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type a command or search..."
                  className="w-full bg-transparent text-white placeholder-muted-foreground focus:outline-none text-lg"
                />
                <kbd className="hidden sm:inline-flex px-1.5 py-0.5 rounded bg-white/10 border border-white/10 text-xs font-medium text-muted-foreground font-mono">
                  ESC
                </kbd>
              </div>

              <div className="p-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {filteredActions.length === 0 ? (
                  <div className="py-14 text-center text-sm text-muted-foreground">
                    No results found.
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredActions.map((action, i) => (
                      <button
                        key={action.id}
                        onClick={() => {
                          action.action()
                          setOpen(false)
                        }}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm transition-all",
                          "hover:bg-white/5 hover:text-white text-muted-foreground group",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <action.icon
                            size={16}
                            className="group-hover:text-primary transition-colors"
                          />
                          <span className="font-medium">{action.title}</span>
                        </div>
                        {action.shortcut && (
                          <span className="text-xs font-mono px-2 py-1 rounded-md bg-white/5 border border-white/5">
                            {action.shortcut}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
