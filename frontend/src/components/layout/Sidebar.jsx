import React from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { useSelector, useDispatch } from "react-redux"
import {
  LayoutDashboard,
  Globe,
  Settings,
  LogOut,
  ChevronUp,
  Folder,
  Terminal,
  FileText,
} from "lucide-react"
import { cn } from "../../lib/utils"
import { logoutUser } from "../../redux/slices/authSlice"
import { motion } from "framer-motion"

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { projectsList } = useSelector((state) => state.projects)

  const navGroups = [
    {
      title: "Platform",
      items: [
        {
          id: "dashboard",
          icon: LayoutDashboard,
          label: "Overview",
          path: "/dashboard",
        },
        { id: "projects", icon: Folder, label: "Projects", path: "/projects" },
        { id: "deploy", icon: Globe, label: "New Project", path: "/new" },
      ],
    },
    {
      title: "Documentation",
      items: [
        { id: "deployment-docs", icon: FileText, label: "Platform Guide", path: "/deployment-docs" },
        { id: "docs", icon: Terminal, label: "CLI Docs", path: "/docs" },
      ],
    },
    {
      title: "Settings",
      items: [
        {
          id: "settings",
          icon: Settings,
          label: "Settings",
          path: "/settings",
        },
      ],
    },
  ]
  const hoverNavi = () => navigate("/settings")
  const landNavi = () => navigate("/")
  return (
    <aside className="w-64 bg-[#09090B] border-r border-[rgba(255,255,255,0.08)] h-screen flex flex-col shrink-0">
      <div className="p-5 flex items-center gap-3 border-b border-[rgba(255,255,255,0.04)]">
        <div className="w-7 h-7 flex items-center justify-center">
          <img
            src="/NexForge.png"
            alt="Logo"
            className="w-10 h-10 cursor-pointer"
            onClick={landNavi}
          />
        </div>
        <span className="text-[15px] font-semibold text-[#FFFFFF] tracking-tight">
          NexForge
        </span>
      </div>

      <div className="flex-1 overflow-y-auto py-5 px-3 custom-scrollbar">
        {navGroups.map((group, i) => (
          <div key={i} className="mb-6">
            <h3 className="px-3 mb-2 text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">
              {group.title}
            </h3>
            <nav className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  location.pathname === item.path ||
                  (item.path !== "/" && location.pathname.startsWith(item.path))
                return (
                  <button
                    key={item.id}
                    onClick={() => navigate(item.path)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2 rounded-md text-[14px] font-medium transition-colors group relative",
                      isActive
                        ? "bg-[#18181B] text-[#FFFFFF]"
                        : "text-[#A1A1AA] hover:bg-[#111827] hover:text-[#FFFFFF]",
                    )}
                  >
                    <item.icon
                      size={16}
                      className={cn(
                        isActive
                          ? "text-[#FFFFFF]"
                          : "text-[#A1A1AA] group-hover:text-[#FFFFFF]",
                      )}
                    />
                    {item.label}
                  </button>
                )
              })}
            </nav>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-[rgba(255,255,255,0.08)]">
        <button
          className="w-full flex items-center justify-between p-2 rounded-md hover:bg-[#18181B] transition-colors group"
          onClick={hoverNavi}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#6366F1] flex items-center justify-center text-white text-xs font-semibold shrink-0 overflow-hidden">
              {user?.avatar || user?.avatarUrl ? (
                <img
                  src={user.avatar || user.avatarUrl}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : user?.username ? (
                user.username[0].toUpperCase()
              ) : (
                "U"
              )}
            </div>
            <div className="flex flex-col items-start min-w-0">
              <span className="text-[14px] font-medium text-[#FFFFFF] truncate max-w-[120px]">
                {user?.username || "User"}
              </span>
              <span className="text-[12px] text-[#A1A1AA] truncate max-w-[120px]">
                Personal Account
              </span>
            </div>
          </div>
          {/* <ChevronUp size={16} className="text-[#A1A1AA] group-hover:text-[#FFFFFF]" /> */}
        </button>
      </div>
    </aside>
  )
}
