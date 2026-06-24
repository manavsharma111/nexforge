import React from "react"
import {
  CheckCircle2,
  Clock,
  GitCommit,
  PlayCircle,
  Loader2,
} from "lucide-react"
import { Card } from "../ui/Card"

export default function DeploymentTimeline({ project }) {
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
      time: "12s",
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
      time: "45s",
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
      </div>
    </Card>
  )
}
