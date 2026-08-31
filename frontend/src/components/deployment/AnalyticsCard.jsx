import React, { useState, useEffect } from "react"
import { Activity, ArrowUpRight, Users, Server, Loader2 } from "lucide-react"
import { Card } from "../ui/Card"
import axiosInstance from "../../utils/axiosInstance"

export default function AnalyticsCard({ projectId }) {
  const [data, setData] = useState({ requests: 0, bandwidth: 0, visitors: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!projectId) return
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        const res = await axiosInstance.get(`/analytics/${projectId}?range=30d`)
        if (res.data?.usage) {
          setData({
            requests: res.data.usage.totalRequests || 0,
            bandwidth: res.data.usage.totalBandwidth || 0,
            visitors: res.data.usage.uniqueVisitors || 0
          })
        }
      } catch (err) {
        console.error("Failed to load analytics", err)
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [projectId])

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M"
    if (num >= 1000) return (num / 1000).toFixed(1) + "K"
    return num.toString()
  }

  const formatBytes = (bytes) => {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i]
  }

  const stats = [
    {
      label: "Total Requests",
      value: formatNumber(data.requests),
      trend: "Live",
      icon: Activity,
      color: "text-[#6366F1]",
    },
    {
      label: "Bandwidth",
      value: formatBytes(data.bandwidth),
      trend: "Live",
      icon: Server,
      color: "text-[#22C55E]",
    },
    {
      label: "Unique Visitors",
      value: formatNumber(data.visitors),
      trend: "Live",
      icon: Users,
      color: "text-[#F59E0B]",
    },
  ]

  return (
    <Card className="p-6 h-full flex flex-col group relative overflow-hidden">
      <div className="absolute top-0 right-0 p-12 bg-[#6366F1]/5 rounded-bl-full pointer-events-none opacity-50" />

      <div className="flex items-center justify-between mb-6 relative z-10">
        <h3 className="text-sm font-medium text-[#A1A1AA]">Usage Analytics</h3>
        <span className="text-[10px] uppercase tracking-wider font-bold bg-[#111827] text-[#A1A1AA] px-2 py-0.5 rounded border border-[rgba(255,255,255,0.08)]">
          Last 30d
        </span>
      </div>

      <div className="space-y-4 relative z-10 flex-1">
        {loading ? (
          <div className="flex items-center justify-center h-full opacity-50">
            <Loader2 className="animate-spin text-[#A1A1AA]" size={24} />
          </div>
        ) : (
          stats.map((stat, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-[#111827] border border-[rgba(255,255,255,0.08)] flex items-center justify-center shrink-0">
                  <stat.icon size={14} className={stat.color} />
                </div>
                <p className="text-sm text-[#A1A1AA]">{stat.label}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-[#FFFFFF]">
                  {stat.value}
                </p>
                <p className="text-[10px] uppercase text-[#22C55E] flex items-center gap-0.5 justify-end mt-0.5 opacity-80">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse"></span> {stat.trend}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
