import React, { useState, useEffect } from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { Card } from "../ui/Card"
import { Cpu, Network, MemoryStick as Memory } from "lucide-react"
import { io } from "socket.io-client"
import { API_URL } from "../../utils/axiosInstance"

const generateData = () => {
  const data = []
  const now = new Date()
  for (let i = 20; i >= 0; i--) {
    data.push({
      time: new Date(now.getTime() - i * 2000).toLocaleTimeString([], {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      cpu: 0,
      ram: 0,
      download: 0,
      upload: 0,
    })
  }
  return data
}

export default function SystemMetrics() {
  const [data, setData] = useState(generateData())

  useEffect(() => {
    const backendHost = API_URL.replace("/api", "")
    const socket = io(backendHost, {
      withCredentials: true,
      transports: ["polling", "websocket"],
    })

    socket.emit("joinDashboard")

    socket.on("system-metrics", (metrics) => {
      setData((prev) => {
        return [...prev.slice(1), metrics]
      })
    })

    return () => {
      socket.emit("leaveDashboard")
      socket.disconnect()
    }
  }, [])

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#09090B] border border-[rgba(255,255,255,0.08)] p-3 rounded-lg shadow-xl">
          <p className="text-[#A1A1AA] text-xs mb-2">{label}</p>
          {payload.map((entry, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 text-sm font-medium"
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-[#FFFFFF]">
                {entry.name}: {entry.value}
                {entry.name.includes("CPU") || entry.name.includes("RAM")
                  ? "%"
                  : " Mbps"}
              </span>
            </div>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      {/* Compute Metrics Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-medium text-[#FFFFFF] flex items-center gap-2">
              <Cpu size={16} className="text-[#6366F1]" />
              Compute Resources
            </h3>
            <p className="text-xs text-[#A1A1AA] mt-1">
              Live CPU & RAM utilization
            </p>
          </div>
          <div className="flex gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5 text-[#6366F1]">
              <div className="w-2 h-2 rounded-full bg-[#6366F1]" /> CPU
            </div>
            <div className="flex items-center gap-1.5 text-[#8B5CF6]">
              <div className="w-2 h-2 rounded-full bg-[#8B5CF6]" /> RAM
            </div>
          </div>
        </div>

        <div className="h-[250px] w-full min-h-[250px]">
          <ResponsiveContainer width="99%" height="100%" minHeight={1}>
            <AreaChart
              data={data}
              margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorRam" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
                vertical={false}
              />
              <XAxis
                dataKey="time"
                stroke="#A1A1AA"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                minTickGap={30}
              />
              <YAxis
                stroke="#A1A1AA"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `${val}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                name="CPU"
                dataKey="cpu"
                stroke="#6366F1"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCpu)"
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                name="RAM"
                dataKey="ram"
                stroke="#8B5CF6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRam)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Network Metrics Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-sm font-medium text-[#FFFFFF] flex items-center gap-2">
              <Network size={16} className="text-[#22C55E]" />
              Network Traffic
            </h3>
            <p className="text-xs text-[#A1A1AA] mt-1">
              Incoming and outgoing bandwidth
            </p>
          </div>
          <div className="flex gap-4 text-xs font-medium">
            <div className="flex items-center gap-1.5 text-[#22C55E]">
              <div className="w-2 h-2 rounded-full bg-[#22C55E]" /> Download
            </div>
            <div className="flex items-center gap-1.5 text-[#EAB308]">
              <div className="w-2 h-2 rounded-full bg-[#EAB308]" /> Upload
            </div>
          </div>
        </div>

        <div className="h-[250px] w-full min-h-[250px]">
          <ResponsiveContainer width="99%" height="100%" minHeight={1}>
            <AreaChart
              data={data}
              margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorDl" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorUl" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EAB308" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#EAB308" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.05)"
                vertical={false}
              />
              <XAxis
                dataKey="time"
                stroke="#A1A1AA"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                minTickGap={30}
              />
              <YAxis
                stroke="#A1A1AA"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `${val}M`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                name="Download"
                dataKey="download"
                stroke="#22C55E"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorDl)"
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                name="Upload"
                dataKey="upload"
                stroke="#EAB308"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorUl)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}
