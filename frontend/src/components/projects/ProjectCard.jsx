import React from "react"
import { motion } from "framer-motion"
import { ExternalLink, GitBranch, RefreshCw, Trash2 } from "lucide-react"
import { Card } from "../ui/Card"
import { Badge } from "../ui/Badge"
import { useNavigate } from "react-router-dom"
import TiltCard from "../common/Tilt"

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000
  if (diff < 60) return "just now"
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function ProjectCard({ project, onRedeploy, onDelete }) {
  const navigate = useNavigate()

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "LIVE":
        return "success"
      case "FAILED":
        return "destructive"
      case "BUILDING":
      case "INSTALLING":
      case "QUEUED":
        return "accent"
      default:
        return "outline"
    }
  }

  return (
    <TiltCard
      onClick={() => navigate(`/project/${project._id}`)}
      className="cursor-pointer h-[260px]"
    >
      <Card className="p-5 h-full flex flex-col group hover:border-[rgba(255,255,255,0.15)] hover:shadow-md transition-all">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#111827] border border-[rgba(255,255,255,0.08)] rounded-xl flex items-center justify-center text-[#FFFFFF] text-lg font-bold">
              {project.projectName ? project.projectName[0].toUpperCase() : "?"}
            </div>
            <div>
              <h3 className="text-[#FFFFFF] font-medium text-base leading-tight group-hover:text-[#6366F1] transition-colors truncate max-w-[180px]">
                {project.projectName}
              </h3>
              <p className="text-xs text-[#A1A1AA] mt-0.5 truncate max-w-[200px]">
                {project.liveUrl
                  ? project.liveUrl.replace("https://", "")
                  : "Not deployed yet"}
              </p>
            </div>
          </div>
        </div>

        {project.description && (
          <p className="text-sm text-[#A1A1AA] mb-4 leading-relaxed line-clamp-2 flex-1">
            {project.description}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mb-6">
          <Badge variant="secondary">{project.framework || "react"}</Badge>
          <Badge variant={getStatusBadgeVariant(project.status)}>
            {project.status || "UNKNOWN"}
          </Badge>
        </div>

        <div className="pt-4 border-t border-[rgba(255,255,255,0.08)] flex items-center justify-between mt-auto">
          <div className="flex items-center gap-2 text-xs text-[#A1A1AA]">
            <GitBranch size={14} className="opacity-70" />
            <span className="truncate w-24 sm:w-32">
              {project.githubRepoUrl?.replace("https://github.com/", "")}
            </span>
            <span className="px-1 opacity-50">•</span>
            <span>{timeAgo(project.createdAt)}</span>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {project.liveUrl && project.status === "LIVE" && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="p-1.5 rounded-md text-[#A1A1AA] hover:text-[#FFFFFF] hover:bg-[#111827] transition-colors"
                title="Visit site"
              >
                <ExternalLink size={16} />
              </a>
            )}
            {onRedeploy && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onRedeploy(project._id)
                }}
                className="p-1.5 rounded-md text-[#A1A1AA] hover:text-[#FFFFFF] hover:bg-[#111827] transition-colors"
                title="Redeploy"
              >
                <RefreshCw size={16} />
              </button>
            )}
            {onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(project._id)
                }}
                className="p-1.5 rounded-md text-[#A1A1AA] hover:text-[#EF4444] hover:bg-[#EF4444]/10 transition-colors"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
      </Card>
    </TiltCard>
  )
}
