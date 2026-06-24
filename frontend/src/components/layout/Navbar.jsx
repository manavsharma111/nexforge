import React, { useState, useEffect, useRef } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { Home, Plus, User, ChevronUp } from "lucide-react"
import { useSelector, useDispatch } from "react-redux"
import { logoutUser } from "../../redux/slices/authSlice"
import Button from "../common/Button"

const navItems = [
  { id: "home", label: "Dashboard", icon: Home, path: "/" },
  { id: "new", label: "Import", icon: Plus, path: "/new" },
  { id: "user", label: "Account", icon: User, path: null },
]

export default function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user, isAuthenticated } = useSelector((state) => state.auth)

  const [activeTab, setActiveTab] = useState("home")
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const prevTab = useRef("home")

  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 768 : false,
  )
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener("resize", handler)
    return () => window.removeEventListener("resize", handler)
  }, [])

  const [hoveredTab, setHoveredTab] = useState(null)

  const openT = useRef(null)
  const closeT = useRef(null)
  const clearT = () => {
    clearTimeout(openT.current)
    clearTimeout(closeT.current)
  }

  useEffect(() => {
    const m = navItems.find((i) => i.path && i.path === location.pathname)
    if (m) {
      setActiveTab(m.id)
      prevTab.current = m.id
    }
  }, [location.pathname])

  useEffect(() => {
    setDropdownOpen(false)
  }, [location.pathname])

  const desktopMouseEnter = (id) => {
    clearT()
    setHoveredTab(id)
    if (id === "user") {
      openT.current = setTimeout(() => setDropdownOpen(true), 300)
    } else {
      closeT.current = setTimeout(() => setDropdownOpen(false), 100)
    }
  }

  const desktopMouseLeave = () => {
    clearT()
    closeT.current = setTimeout(() => {
      setHoveredTab(null)
      setDropdownOpen(false)
    }, 250)
  }

  const dropdownMouseEnter = () => {
    clearT()
  }

  const dropdownMouseLeave = () => {
    clearT()
    closeT.current = setTimeout(() => {
      setHoveredTab(null)
      setDropdownOpen(false)
    }, 150)
  }

  const handleMobileTap = (item) => {
    if (item.id === "user") {
      setDropdownOpen((p) => !p)
    } else {
      setDropdownOpen(false)
      navigate(item.path)
    }
  }

  const handleDesktopClick = (item) => {
    if (item.id === "user") {
      clearT()
      setDropdownOpen((p) => !p)
    } else {
      setDropdownOpen(false)
      navigate(item.path)
    }
  }

  const getPillActive = (id) => {
    if (isMobile) {
      if (dropdownOpen) return id === "user"
      return activeTab === id
    } else {
      if (dropdownOpen) return id === "user"
      if (hoveredTab) return hoveredTab === id
      return activeTab === id
    }
  }

  if (!isAuthenticated) return null

  return (
    <>
      <AnimatePresence>
        {dropdownOpen && isMobile && (
          <motion.div
            key="mob-backdrop"
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onPointerDown={() => {
              setActiveTab(prevTab.current)
              setDropdownOpen(false)
            }}
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-6 md:bottom-auto md:top-8 left-1/2 -translate-x-1/2 z-50 flex justify-center select-none">
        <nav
          onMouseLeave={isMobile ? undefined : desktopMouseLeave}
          className="flex items-center p-2 gap-0.5 bg-black/60 backdrop-blur-2xl rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.6)] border border-white/10"
        >
          {navItems.map((item) => {
            const isLit = getPillActive(item.id)
            const Icon = item.icon

            return (
              <button
                key={item.id}
                type="button"
                onPointerDown={
                  isMobile ? () => handleMobileTap(item) : undefined
                }
                onClick={!isMobile ? () => handleDesktopClick(item) : undefined}
                onMouseEnter={
                  !isMobile ? () => desktopMouseEnter(item.id) : undefined
                }
                className="relative flex items-center justify-center px-3 py-2.5 md:px-4 rounded-full outline-none"
                style={{
                  WebkitTapHighlightColor: "transparent",
                  touchAction: "manipulation",
                }}
              >
                <AnimatePresence>
                  {isLit && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-white/15"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        type: "spring",
                        bounce: 0.1,
                        duration: 0.4,
                      }}
                    />
                  )}
                </AnimatePresence>

                <span
                  className={`relative z-10 flex items-center gap-2 transition-colors duration-200 ${isLit ? "text-white" : "text-gray-400"}`}
                >
                  {item.id === "user" && (user?.avatar || user?.avatarUrl) ? (
                    <img
                      src={user?.avatar || user?.avatarUrl}
                      alt="Avatar"
                      className={`w-5 h-5 rounded-full object-cover transition-all ${isLit ? "ring-2 ring-white/50" : ""}`}
                    />
                  ) : (
                    <Icon size={19} strokeWidth={isLit ? 2.5 : 1.8} />
                  )}

                  <motion.span
                    initial={false}
                    animate={{
                      width: isLit ? "auto" : 0,
                      opacity: isLit ? 1 : 0,
                    }}
                    transition={{ type: "spring", bounce: 0.1, duration: 0.35 }}
                    className="hidden md:block overflow-hidden whitespace-nowrap text-sm font-semibold tracking-wide"
                  >
                    {item.label}
                  </motion.span>

                  {item.id === "user" && (
                    <motion.span
                      animate={{ rotate: dropdownOpen ? 0 : 180 }}
                      transition={{
                        type: "spring",
                        bounce: 0.2,
                        duration: 0.35,
                      }}
                      className="hidden md:block"
                    >
                      <ChevronUp size={13} strokeWidth={2} />
                    </motion.span>
                  )}
                </span>
              </button>
            )
          })}
        </nav>

        <AnimatePresence>
          {dropdownOpen && (
            <motion.div
              key="auth-card"
              onMouseEnter={!isMobile ? dropdownMouseEnter : undefined}
              onMouseLeave={!isMobile ? dropdownMouseLeave : undefined}
              initial={
                isMobile
                  ? { opacity: 0, y: 50, scale: 0.9 }
                  : { opacity: 0, y: 10, scale: 0.96 }
              }
              animate={
                isMobile
                  ? { opacity: 1, y: 0, scale: 1 }
                  : { opacity: 1, y: 0, scale: 1 }
              }
              exit={
                isMobile
                  ? { opacity: 0, y: 50, scale: 0.9 }
                  : { opacity: 0, y: 10, scale: 0.96 }
              }
              transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
              className={[
                "z-50 bg-[#0c0c0d] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden",
                "fixed bottom-[80px] left-1/2 -translate-x-1/2 w-[calc(100vw-32px)] max-w-[320px] rounded-3xl",
                "md:absolute md:rounded-2xl md:bottom-auto md:left-auto md:translate-x-0 md:right-0 md:top-full md:mt-3 md:w-[250px]",
              ].join(" ")}
            >
              <div className="p-5 flex flex-col items-center border-b border-white/10 bg-white/[0.02]">
                <img
                  src={user?.avatar || user?.avatarUrl}
                  alt="Avatar"
                  className="w-16 h-16 md:w-12 md:h-12 rounded-full border border-white/20 object-cover mb-3 md:mb-2 shadow-lg"
                />
                <h3 className="text-white font-medium text-base md:text-sm">
                  {user?.username || user?.githubUsername || "Developer"}
                </h3>
              </div>
              <div className="p-3">
                <button
                  onClick={() => dispatch(logoutUser())}
                  className="w-full text-center md:text-left px-4 py-3 md:py-2 text-sm text-red-500 hover:bg-white/5 rounded-xl md:rounded-md transition-colors font-semibold md:font-medium"
                >
                  Sign Out
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}
