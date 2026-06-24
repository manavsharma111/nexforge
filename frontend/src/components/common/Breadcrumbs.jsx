import React from "react"
import { ChevronRight, Home } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { cn } from "../../lib/utils"

export default function Breadcrumbs({ className }) {
  const location = useLocation()
  const pathnames = location.pathname.split("/").filter((x) => x)

  if (pathnames.length === 0) return null

  return (
    <nav
      className={cn(
        "flex items-center text-sm text-muted-foreground",
        className,
      )}
    >
      <Link
        to="/"
        className="hover:text-white transition-colors flex items-center gap-1.5"
      >
        <Home size={14} />
      </Link>

      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join("/")}`
        const isLast = index === pathnames.length - 1

        return (
          <React.Fragment key={to}>
            <ChevronRight size={14} className="mx-2 opacity-50" />
            {isLast ? (
              <span className="text-white font-medium capitalize">
                {value.replace(/-/g, " ")}
              </span>
            ) : (
              <Link
                to={to}
                className="hover:text-white transition-colors capitalize"
              >
                {value.replace(/-/g, " ")}
              </Link>
            )}
          </React.Fragment>
        )
      })}
    </nav>
  )
}
