import React, { useEffect } from "react"
import { Routes, Route, useLocation } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { checkAuth } from "./redux/slices/authSlice"

import ProtectedRoute from "./components/layout/ProtectedRoute"
import Sidebar from "./components/layout/Sidebar"
import MobileNav from "./components/layout/MobileNav"

import Login from "./pages/Login"
import AuthCallback from "./pages/AuthCallback"
import Dashboard from "./pages/Dashboard"
import Projects from "./pages/Projects"
import ImportProject from "./pages/ImportProject"
import Settings from "./pages/Settings"
import ProjectDetails from "./pages/ProjectDetails"
import Docs from "./pages/Docs"

const App = () => {
  const dispatch = useDispatch()
  const location = useLocation()
  const { isAuthenticated } = useSelector((state) => state.auth)

  useEffect(() => {
    dispatch(checkAuth())
  }, [dispatch])

  const isAuthPage =
    location.pathname === "/login" || location.pathname.startsWith("/auth")

  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-[#09090B] text-[#FFFFFF] font-sans selection:bg-[#6366F1]/30 selection:text-white">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/auth/success" element={<AuthCallback />} />
        </Routes>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-[#09090B] text-[#FFFFFF] font-sans selection:bg-[#6366F1]/30 selection:text-white overflow-hidden">
      <div className="hidden md:flex">
        {isAuthenticated && <Sidebar />}
      </div>
      {isAuthenticated && <MobileNav />}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto custom-scrollbar relative">
          <div className="mx-auto w-full max-w-6xl p-4 md:p-6 lg:p-8 pb-32">
            <Routes>
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/projects" element={<Projects />} />
                <Route path="/new" element={<ImportProject />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/docs" element={<Docs />} />
                <Route path="/project/:id" element={<ProjectDetails />} />
              </Route>
            </Routes>
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
