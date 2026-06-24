import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bell, CheckCircle2, AlertCircle, Clock } from "lucide-react"
import { cn } from "../../lib/utils"

export default function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false)

  // Mock notifications, in reality connected to Redux / Socket
  const notifications = [
    {
      id: 1,
      type: "success",
      title: "Deployment Successful",
      desc: "project-alpha deployed to production",
      time: "2m ago",
    },
    {
      id: 2,
      type: "error",
      title: "Build Failed",
      desc: "project-beta failed during install phase",
      time: "1h ago",
    },
    {
      id: 3,
      type: "info",
      title: "Domain verified",
      desc: "api.example.com has been verified",
      time: "3h ago",
    },
  ]

  const unreadCount = notifications.length

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg bg-white/5 border border-white/10 text-muted-foreground hover:text-white transition-colors"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1.5 w-2 h-2 bg-primary rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-80 bg-popover/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h4 className="font-medium text-sm text-white">
                  Notifications
                </h4>
                <button className="text-xs text-muted-foreground hover:text-white transition-colors">
                  Mark all read
                </button>
              </div>

              <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    No new notifications
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {notifications.map((n, i) => (
                      <div
                        key={n.id}
                        className={cn(
                          "p-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer",
                          i === notifications.length - 1 && "border-0",
                        )}
                      >
                        <div className="flex gap-3">
                          <div className="mt-0.5">
                            {n.type === "success" && (
                              <CheckCircle2
                                size={16}
                                className="text-green-500"
                              />
                            )}
                            {n.type === "error" && (
                              <AlertCircle size={16} className="text-red-500" />
                            )}
                            {n.type === "info" && (
                              <Clock size={16} className="text-blue-500" />
                            )}
                          </div>
                          <div>
                            <h5 className="text-sm font-medium text-white mb-0.5">
                              {n.title}
                            </h5>
                            <p className="text-xs text-muted-foreground mb-1 leading-relaxed">
                              {n.desc}
                            </p>
                            <span className="text-[10px] text-muted-foreground/60 font-medium">
                              {n.time}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}
