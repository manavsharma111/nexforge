import React from "react"

const STATUS_CONFIG = {
  LIVE: {
    color: "text-green-400",
    bg: "bg-green-400/10",
    dot: "bg-green-400",
    label: "Live",
    pulse: true,
  },
  FAILED: {
    color: "text-red-400",
    bg: "bg-red-400/10",
    dot: "bg-red-400",
    label: "Failed",
    pulse: false,
  },
  BUILDING: {
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    dot: "bg-amber-400",
    label: "Building",
    pulse: true,
  },
  QUEUED: {
    color: "text-indigo-400",
    bg: "bg-indigo-400/10",
    dot: "bg-indigo-400",
    label: "Queued",
    pulse: true,
  },
  INSTALLING: {
    color: "text-blue-400",
    bg: "bg-blue-400/10",
    dot: "bg-blue-400",
    label: "Installing",
    pulse: true,
  },
  IDLE: {
    color: "text-zinc-400",
    bg: "bg-zinc-400/10",
    dot: "bg-zinc-600",
    label: "Idle",
    pulse: false,
  },
}

export default function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.IDLE
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color} ${cfg.bg}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${cfg.pulse ? "animate-pulse" : ""}`}
      />
      {cfg.label}
    </span>
  )
}
