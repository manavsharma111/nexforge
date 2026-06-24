import React from "react"
import { useLocation } from "react-router-dom"
import { Bell, Slash } from "lucide-react"
import { useSelector } from "react-redux"

export default function Header() {
  const location = useLocation()
  const { user } = useSelector((state) => state.auth)

  const getBreadcrumbs = () => {
    const paths = location.pathname.split("/").filter((p) => p)
    if (paths.length === 0)
      return [{ label: user?.username || "user" }, { label: "Overview" }]
    if (paths[0] === "new")
      return [{ label: user?.username || "user" }, { label: "Import Project" }]
    if (paths[0] === "project" && paths[1])
      return [
        { label: user?.username || "user" },
        { label: "Projects" },
        { label: paths[1] },
      ]
    return [{ label: user?.username || "user" }, { label: paths[0] }]
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <header className="h-14 border-b border-[rgba(255,255,255,0.08)] bg-[#09090B] flex items-center justify-between px-6 shrink-0 sticky top-0 z-40">
      <div className="flex items-center text-[14px] font-medium text-[#A1A1AA]">
        {breadcrumbs.map((crumb, idx) => (
          <React.Fragment key={idx}>
            <span
              className={
                idx === breadcrumbs.length - 1
                  ? "text-[#FFFFFF]"
                  : "hover:text-[#FFFFFF] cursor-pointer transition-colors"
              }
            >
              {crumb.label}
            </span>
            {idx < breadcrumbs.length - 1 && (
              <Slash size={14} className="mx-2 text-[rgba(255,255,255,0.2)]" />
            )}
          </React.Fragment>
        ))}
      </div>

      <div className="flex items-center gap-4">
        <button className="text-[#A1A1AA] hover:text-[#FFFFFF] transition-colors rounded-full p-1.5 hover:bg-[#18181B]">
          <Bell size={18} />
        </button>
      </div>
    </header>
  )
}
