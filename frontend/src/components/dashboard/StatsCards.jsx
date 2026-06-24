import React from "react"
import { motion } from "framer-motion"
import { Activity, Globe, CheckCircle2, ServerCrash } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card"
import TiltCard from "../common/Tilt"

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
}

export default function StatsCards({ projects }) {
  const totalProjects = projects.length
  const liveProjects = projects.filter((p) => p.status === "LIVE").length
  const failedProjects = projects.filter((p) => p.status === "FAILED").length
  const activeDeployments = projects.filter((p) =>
    ["QUEUED", "INSTALLING", "BUILDING"].includes(p.status),
  ).length

  const stats = [
    {
      title: "Total Projects",
      value: totalProjects.toString(),
      icon: Globe,
      trend: "neutral",
    },
    {
      title: "Live Deployments",
      value: liveProjects.toString(),
      icon: CheckCircle2,
      trend: "up",
      change: liveProjects > 0 ? "Active" : "",
    },
    {
      title: "In Progress",
      value: activeDeployments.toString(),
      icon: Activity,
      trend: "neutral",
      change: activeDeployments > 0 ? "Building" : "",
    },
    {
      title: "Failed",
      value: failedProjects.toString(),
      icon: ServerCrash,
      trend: failedProjects > 0 ? "down" : "neutral",
      change: failedProjects > 0 ? "Needs attention" : "",
    },
  ]

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {stats.map((stat, i) => (
        <motion.div key={i} variants={itemVariants} className="h-full">
          <TiltCard className="h-full">
            <Card className="h-full hover:border-[rgba(255,255,255,0.15)] transition-colors overflow-hidden relative group flex flex-col justify-between">
              <div className="absolute inset-0 bg-white/[0.02] opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-[#A1A1AA]">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-[#A1A1AA] group-hover:text-[#FFFFFF] transition-colors" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p
                  className={`text-xs mt-1 min-h-[16px] ${stat.trend === "up" ? "text-[#22C55E]" : stat.trend === "down" ? "text-[#EF4444]" : "text-[#6366F1]"}`}
                >
                  {stat.change || " "}
                </p>
              </CardContent>
            </Card>
          </TiltCard>
        </motion.div>
      ))}
    </motion.div>
  )
}
