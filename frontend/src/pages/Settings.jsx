import React, { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { motion } from "framer-motion"
import { LogOut, User, Shield, Bell } from "lucide-react"
import { Card } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { logoutUser } from "../redux/slices/authSlice"
import { useNavigate } from "react-router-dom"
import axios from "../utils/axiosInstance"
import { Copy, Check, UserLock } from "lucide-react"
import { GiToken } from "react-icons/gi"
    
export default function Settings() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector((state) => state.auth)

  const [cliToken, setCliToken] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState("general")

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await axios.get("/auth/cli/token")
        if (response.data.cliToken) {
          setCliToken(response.data.cliToken)
        }
      } catch (error) {
        console.error("Failed to fetch CLI token")
      }
    }
    fetchToken()
  }, [])

  const handleGenerateToken = async () => {
    try {
      setIsGenerating(true)
      const response = await axios.post("/auth/cli/token/generate")
      setCliToken(response.data.cliToken)
    } catch (error) {
      console.error("Failed to generate CLI token")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = () => {
    if (!cliToken) return
    navigator.clipboard.writeText(cliToken)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleLogout = () => {
    dispatch(logoutUser())
    navigate("/login")
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 max-w-4xl"
    >
      <div>
        <h1 className="text-2xl font-semibold text-[#FFFFFF] tracking-tight">
          Settings
        </h1>
        <p className="text-sm text-[#A1A1AA] mt-1">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="md:col-span-1 space-y-1">
          <button 
            onClick={() => setActiveTab("general")}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "general" ? "bg-[#18181B] text-[#FFFFFF]" : "text-[#A1A1AA] hover:text-[#FFFFFF] hover:bg-[#18181B]/50"}`}
          >
            <User size={16} /> General
          </button>
          <button 
            onClick={() => setActiveTab("security")}
            className={`w-full flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === "security" ? "bg-[#18181B] text-[#FFFFFF]" : "text-[#A1A1AA] hover:text-[#FFFFFF] hover:bg-[#18181B]/50"}`}
          >
            <GiToken size={16} /> CLI Tokens
            
          </button>
        </div>

        <div className="md:col-span-3 space-y-6">
          {activeTab === "general" && (
            <>
              <Card className="p-6">
                <h3 className="text-lg font-medium text-[#FFFFFF] mb-4">
                  Account Information
                </h3>

                <div className="flex items-center gap-6 mb-8">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#6366F1] to-purple-500 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
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
                  <div>
                    <p className="text-[#FFFFFF] font-medium text-lg">
                      {user?.username || "User"}
                    </p>
                    <p className="text-[#A1A1AA] text-sm">Personal Account</p>
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t border-[rgba(255,255,255,0.08)]">
                  <div>
                    <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-2">
                      Username
                    </label>
                    <div className="bg-[#09090B] border border-[rgba(255,255,255,0.08)] rounded-md px-4 py-2.5 text-[#FFFFFF] text-sm opacity-80 cursor-not-allowed">
                      {user?.username || "User"}
                    </div>
                  </div>

                  {user?.email && (
                    <div>
                      <label className="block text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider mb-2">
                        Email Address
                      </label>
                      <div className="bg-[#09090B] border border-[rgba(255,255,255,0.08)] rounded-md px-4 py-2.5 text-[#FFFFFF] text-sm opacity-80 cursor-not-allowed">
                        {user.email}
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              <Card className="p-6 border-[#EF4444]/20">
                <h3 className="text-lg font-medium text-[#FFFFFF] mb-2">
                  Danger Zone
                </h3>
                <p className="text-sm text-[#A1A1AA] mb-6">
                  Log out of your current session across all devices.
                </p>

                <Button
                  variant="destructive"
                  onClick={handleLogout}
                  className="gap-2"
                >
                  <LogOut size={16} />
                  Log Out
                </Button>
              </Card>
            </>
          )}

          {activeTab === "security" && (
            <Card className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-lg font-medium text-[#FFFFFF]">
                    CLI Authentication
                  </h3>
                  <p className="text-sm text-[#A1A1AA] mt-1">
                    Use this token to authenticate the NexForge CLI on your machine.
                  </p>
                </div>
                <Button onClick={handleGenerateToken} disabled={isGenerating}>
                  {isGenerating ? "Generating..." : "Generate New Token"}
                </Button>
              </div>

              {cliToken ? (
                <div className="p-4 bg-[#09090B] border border-[rgba(255,255,255,0.08)] rounded-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">
                      Your Personal Token
                    </span>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 text-xs text-[#A1A1AA] hover:text-[#FFFFFF] transition-colors"
                    >
                      {copied ? <Check size={14} className="text-[#10B981]" /> : <Copy size={14} />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                  <div className="font-mono text-sm text-[#FFFFFF] break-all">
                    {cliToken}
                  </div>
                  <p className="text-xs text-[#EF4444] mt-3">
                    Keep this token secret. Anyone with this token can deploy to your projects.
                  </p>
                </div>
              ) : (
                <div className="text-center p-6 border border-dashed border-[rgba(255,255,255,0.1)] rounded-md">
                  <p className="text-sm text-[#A1A1AA]">
                    You haven't generated a CLI token yet.
                  </p>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </motion.div>
  )
}
