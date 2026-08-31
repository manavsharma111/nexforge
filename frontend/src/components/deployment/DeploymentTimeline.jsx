import React, { useState, useEffect } from "react"
import {
  CheckCircle2,
  Clock,
  GitCommit,
  PlayCircle,
  Loader2,
} from "lucide-react"
import { Card } from "../ui/Card"

export default function DeploymentTimeline({ project }) {
  const [activeTime, setActiveTime] = useState(0)
  const [hasWarned, setHasWarned] = useState(false)

  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}s`
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}m ${s}s`
  }

  // Reset timer when status changes
  useEffect(() => {
    setActiveTime(0)
  }, [project?.status])

  // Increment timer every second if active
  useEffect(() => {
    let interval
    const isActive = ["QUEUED", "INSTALLING", "BUILDING"].includes(project?.status)
    
    if (isActive) {
      interval = setInterval(() => {
        setActiveTime((prev) => {
          const newTime = prev + 1
          
          // If build takes more than 4 minutes (240 seconds), warn the user
          if (newTime === 240 && project?.status === "BUILDING" && !hasWarned) {
            console.error("⚠️ Build is taking unusually long. It might be stuck due to insufficient RAM (GC Thrashing) on the free server. Please consider bypassing cloud build or upgrading server memory.")
            setHasWarned(true)
          }
          
          return newTime
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [project?.status, hasWarned])
  const steps = [
    {
      id: 1,
      label: "Repository Cloned",
      desc: `Fetched ${project?.githubRepoUrl || "repo"}`,
      status: "complete",
      time: "0s",
      icon: GitCommit,
    },
    {
      id: 2,
      label: "Dependencies Installed",
      desc: "npm install completed",
      status:
        project?.status === "QUEUED" || project?.status === "INSTALLING"
          ? "active"
          : "complete",
      time: project?.status === "QUEUED" || project?.status === "INSTALLING" ? formatTime(activeTime) : "12s",
      icon: Loader2,
    },
    {
      id: 3,
      label: "Build Finished",
      desc: "npm run build generated outputs",
      status:
        project?.status === "BUILDING"
          ? "active"
          : project?.status === "LIVE" || project?.status === "FAILED"
            ? "complete"
            : "pending",
      time: project?.status === "BUILDING" ? formatTime(activeTime) : "45s",
      icon: PlayCircle,
    },
    {
      id: 4,
      label: "Deployed to Edge",
      desc: "Global CDN distribution complete",
      status: project?.status === "LIVE" ? "complete" : "pending",
      time: "2s",
      icon: CheckCircle2,
    },
  ]

  if (project?.status === "FAILED") {
    steps[2].status = "error"
    steps[2].desc = "Build process exited with code 1"
  }

  return (
    <Card className="p-6">
      <h3 className="text-[#FFFFFF] font-medium mb-6">Deployment Steps</h3>

      <div className="relative">
        <div className="absolute left-[15px] top-4 bottom-4 w-px bg-[rgba(255,255,255,0.08)]" />

        <div className="space-y-6">
          {steps.map((step) => (
            <div key={step.id} className="relative flex items-start gap-4">
              <div
                className={`relative z-10 w-8 h-8 rounded-full border flex items-center justify-center bg-[#09090B]
                ${
                  step.status === "complete"
                    ? "border-[#22C55E] text-[#22C55E]"
                    : step.status === "active"
                      ? "border-[#6366F1] text-[#6366F1] shadow-[0_0_10px_rgba(99,102,241,0.2)]"
                      : step.status === "error"
                        ? "border-[#EF4444] text-[#EF4444]"
                        : "border-[rgba(255,255,255,0.08)] text-[#A1A1AA]"
                }`}
              >
                {step.status === "active" ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <step.icon size={14} />
                )}
              </div>
              <div className="flex-1 pt-1.5">
                <div className="flex items-center justify-between">
                  <h4
                    className={`text-sm font-medium ${step.status === "pending" ? "text-[#A1A1AA]" : "text-[#FFFFFF]"}`}
                  >
                    {step.label}
                  </h4>
                  {step.status !== "pending" && (
                    <span className="text-xs text-[#A1A1AA] flex items-center gap-1">
                      <Clock size={12} />
                      {step.time}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#A1A1AA] mt-1 break-all pr-2">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
        
        {hasWarned && project?.status === "BUILDING" && (
          <div className="mt-6 p-4 bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-lg animate-[fadeIn_0.5s_ease]">
            <p className="text-sm text-[#EF4444] flex items-start gap-2">
              <span className="text-base leading-none">⚠️</span>
              <span>
                <strong>Build is taking unusually long.</strong> It might be stuck due to insufficient RAM on the free server (Vite is likely freezing). Check the browser console for details.
              </span>
            </p>
          </div>
        )}
      </div>
    </Card>
  )
}
