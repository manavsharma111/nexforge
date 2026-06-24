import React from "react"
import { motion } from "framer-motion"
import { Check, Loader2, CircleDashed } from "lucide-react"
import { cn } from "../../lib/utils"
import { Card } from "../ui/Card"

export default function ProgressStages({ currentStage }) {
  const stages = [
    { id: "QUEUED", label: "Queued" },
    { id: "INSTALLING", label: "Installing" },
    { id: "BUILDING", label: "Building" },
    { id: "LIVE", label: "Deployed" },
  ]

  const getStageStatus = (stageId) => {
    const stageIndex = stages.findIndex((s) => s.id === stageId)
    const currentIndex = stages.findIndex((s) => s.id === currentStage)

    if (currentStage === "FAILED") {
      return stageIndex <= stages.findIndex((s) => s.id === "BUILDING")
        ? "error"
        : "pending"
    }

    if (stageIndex < currentIndex || currentStage === "LIVE") return "complete"
    if (stageIndex === currentIndex) return "active"
    return "pending"
  }

  return (
    <Card className="p-6 overflow-hidden relative">
      <h3 className="text-[#FFFFFF] font-medium mb-6">Deployment Progress</h3>

      <div className="relative">
        <div className="absolute top-4 left-4 right-4 h-[1px] bg-[rgba(255,255,255,0.08)]" />

        <div className="flex justify-between relative z-10">
          {stages.map((stage, idx) => {
            const status = getStageStatus(stage.id)

            return (
              <div key={stage.id} className="flex flex-col items-center gap-3">
                <motion.div
                  initial={false}
                  animate={{
                    backgroundColor:
                      status === "complete"
                        ? "#22C55E"
                        : status === "error"
                          ? "#EF4444"
                          : status === "active"
                            ? "#6366F1"
                            : "#111827",
                    borderColor:
                      status === "complete"
                        ? "#22C55E"
                        : status === "error"
                          ? "#EF4444"
                          : status === "active"
                            ? "#6366F1"
                            : "rgba(255, 255, 255, 0.1)",
                  }}
                  className={cn(
                    "w-8 h-8 rounded-full border flex items-center justify-center transition-colors",
                    status === "active" &&
                      "shadow-[0_0_15px_rgba(99,102,241,0.4)]",
                  )}
                >
                  {status === "complete" && (
                    <Check size={14} className="text-[#09090B] font-bold" />
                  )}
                  {status === "active" && (
                    <Loader2 size={14} className="text-white animate-spin" />
                  )}
                  {status === "pending" && (
                    <CircleDashed size={14} className="text-[#A1A1AA]" />
                  )}
                  {status === "error" && (
                    <span className="text-[#09090B] font-bold text-xs">!</span>
                  )}
                </motion.div>
                <span
                  className={cn(
                    "text-xs font-medium",
                    status === "complete"
                      ? "text-[#22C55E]"
                      : status === "active"
                        ? "text-[#FFFFFF]"
                        : status === "error"
                          ? "text-[#EF4444]"
                          : "text-[#A1A1AA]",
                  )}
                >
                  {stage.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
