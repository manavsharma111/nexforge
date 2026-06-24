import React, { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Terminal } from "lucide-react"
import { cn } from "../../lib/utils"
import { Card } from "../ui/Card"

export default function BuildLogs({ logs }) {
  const containerRef = useRef(null)

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }, [logs])

  return (
    <Card className="overflow-hidden flex flex-col h-[500px] p-0">
      <div className="bg-[#111827] border-b border-[rgba(255,255,255,0.08)] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-[#A1A1AA]" />
          <span className="text-xs font-mono text-[#A1A1AA]">
            build-output.log
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#EAB308]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#22C55E]" />
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto p-4 pb-28 custom-scrollbar bg-[#09090B]"
      >
        <div className="font-mono text-sm">
          {logs && logs.length > 0 ? (
            logs.map((log, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "py-0.5 whitespace-pre-wrap break-words leading-relaxed",
                  log.includes("error") || log.includes("ERR!")
                    ? "text-[#EF4444]"
                    : log.includes("warning") || log.includes("WARN")
                      ? "text-[#EAB308]"
                      : log.includes("success") || log.includes("Done")
                        ? "text-[#22C55E]"
                        : "text-[#FFFFFF] opacity-90",
                )}
              >
                <span className="text-[#A1A1AA] opacity-50 mr-3 select-none">
                  {String(i + 1).padStart(3, "0")}
                </span>
                {log}
              </motion.div>
            ))
          ) : (
            <div className="text-[#A1A1AA] italic flex items-center gap-2">
              <span className="cursor-blink">Waiting for build logs...</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
