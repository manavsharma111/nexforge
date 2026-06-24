import React, { useEffect } from "react"
import { Routes, Route, useLocation } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { checkAuth } from "./redux/slices/authSlice"
import { AnimatePresence, motion } from "framer-motion"

import ProtectedRoute from "./components/layout/ProtectedRoute"
import Sidebar from "./components/layout/Sidebar"
import MobileNav from "./components/layout/MobileNav"

import Login from "./pages/Login"
import Home from "./pages/Home"
import AuthCallback from "./pages/AuthCallback"
import Dashboard from "./pages/Dashboard"
import Projects from "./pages/Projects"
import ImportProject from "./pages/ImportProject"
import Settings from "./pages/Settings"
import ProjectDetails from "./pages/ProjectDetails"
import Docs from "./pages/Docs"
import DeploymentDocs from "./pages/DeploymentDocs"
import FloatingChatbot from "./components/common/FloatingChatbot"

const App = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const { isAuthenticated } = useSelector((state) => state.auth)

  useEffect(() => {
    dispatch(checkAuth())
  }, [dispatch])

  const isPublicLayout =
    location.pathname === "/" || location.pathname === "/login" || location.pathname.startsWith("/auth") || location.pathname === "/home"

  // Define transition variants
  const pageVariants = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
  }

  return (
    <AnimatePresence mode="wait">
      {isPublicLayout ? (
        <motion.div
          key="public-layout"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="min-h-screen bg-[#09090B] text-[#FFFFFF] font-sans selection:bg-[#6366F1]/30 selection:text-white"
        >
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<Home />} />
            <Route path="/home" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/auth/success" element={<AuthCallback />} />
          </Routes>
        </motion.div>
      ) : (
        <motion.div
          key="protected-layout"
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="flex h-screen bg-[#09090B] text-[#FFFFFF] font-sans selection:bg-[#6366F1]/30 selection:text-white overflow-hidden"
        >
          <div className="hidden md:flex">
            {isAuthenticated && <Sidebar />}
          </div>
          {isAuthenticated && <MobileNav />}

          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            <main className="flex-1 overflow-y-auto custom-scrollbar relative">
              <div className="mx-auto w-full max-w-6xl p-4 md:p-6 lg:p-8 pb-32">
                <Routes location={location} key={location.pathname}>
                  <Route element={<ProtectedRoute />}>
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/new" element={<ImportProject />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/docs" element={<Docs />} />
                    <Route path="/deployment-docs" element={<DeploymentDocs />} />
                    <Route path="/project/:id" element={<ProjectDetails />} />
                  </Route>
                </Routes>
              </div>
              {isAuthenticated && <FloatingChatbot />}
            </main>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default App
