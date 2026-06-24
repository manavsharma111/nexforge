import React from "react"
import { motion } from "framer-motion"
import { useLocation, useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import { LayoutDashboard, Globe, Hexagon, LogOut } from "lucide-react"
import { cn } from "../../lib/utils"
import { logoutUser } from "../../redux/slices/authSlice"

export default function Sidebar({ className }) {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)

  const navItems = [
    { id: "dashboard", icon: LayoutDashboard, label: "Overview", path: "/" },
    { id: "deploy", icon: Globe, label: "New Project", path: "/new" },
  ]

  return (
    <aside
      className={cn(
        "w-64 border-r border-border bg-surface/50 backdrop-blur-xl h-screen flex flex-col transition-all",
        className,
      )}
    >
      <div className="p-6">
        <div
          className="flex items-center gap-3 mb-8 cursor-pointer"
          onClick={() => navigate("/")}
        >
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.4)]">
            <Hexagon size={18} className="text-white fill-white/20" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            NexForge
          </span>
        </div>

        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== "/" && location.pathname.startsWith(item.path))
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative",
                  isActive
                    ? "text-white bg-white/10"
                    : "text-muted-foreground hover:text-white hover:bg-white/5",
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="active-nav"
                    className="absolute left-0 w-1 h-5 bg-primary rounded-r-full"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
                <item.icon
                  size={16}
                  className={
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-white transition-colors"
                  }
                />
                {item.label}
              </button>
            )
          })}
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt="Avatar"
              className="w-9 h-9 rounded-full border border-white/10"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-medium border border-white/10 shadow-inner shrink-0">
              {user?.username ? user.username[0].toUpperCase() : "U"}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-white truncate">
              {user?.username || "User"}
            </h4>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email || "Loading..."}
            </p>
          </div>
          <button
            onClick={() => dispatch(logoutUser())}
            className="p-2 text-muted-foreground hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors shrink-0"
            title="Log out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  )
}
