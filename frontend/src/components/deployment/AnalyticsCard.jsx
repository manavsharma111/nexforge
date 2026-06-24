import React from "react"
import { Activity, ArrowUpRight, Users, Server } from "lucide-react"
import { Card } from "../ui/Card"

export default function AnalyticsCard() {
  // Dummy analytics data for now to give that premium SaaS dashboard look
  const stats = [
    {
      label: "Total Requests",
      value: "1.2M",
      trend: "+14%",
      icon: Activity,
      color: "text-[#6366F1]",
    },
    {
      label: "Bandwidth",
      value: "45.2 GB",
      trend: "+5%",
      icon: Server,
      color: "text-[#22C55E]",
    },
    {
      label: "Unique Visitors",
      value: "84K",
      trend: "+22%",
      icon: Users,
      color: "text-[#F59E0B]",
    },
  ]

  return (
    <Card className="p-6 h-full flex flex-col group relative overflow-hidden">
      <div className="absolute top-0 right-0 p-12 bg-gradient-to-bl from-[#6366F1]/5 to-transparent rounded-bl-full pointer-events-none opacity-50" />

      <div className="flex items-center justify-between mb-6 relative z-10">
        <h3 className="text-sm font-medium text-[#A1A1AA]">Usage Analytics</h3>
        <span className="text-[10px] uppercase tracking-wider font-bold bg-[#111827] text-[#A1A1AA] px-2 py-0.5 rounded border border-[rgba(255,255,255,0.08)]">
          Last 30d
        </span>
      </div>

      <div className="space-y-4 relative z-10 flex-1">
        {stats.map((stat, idx) => (
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
              <p className="text-xs text-[#22C55E] flex items-center gap-0.5 justify-end mt-0.5">
                <ArrowUpRight size={10} /> {stat.trend}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
