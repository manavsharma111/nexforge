import React from "react"
import { GitBranch, GitCommit, Box, Clock } from "lucide-react"
import { Card } from "../ui/Card"
import { Badge } from "../ui/Badge"

export default function ProjectMetaCard({ project }) {
  if (!project) return null

  return (
    <Card className="p-6 h-full flex flex-col justify-between group">
      <div>
        <h3 className="text-sm font-medium text-[#A1A1AA] mb-4">
          Project Information
        </h3>

        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm">
            <div className="w-8 h-8 rounded bg-[#111827] border border-[rgba(255,255,255,0.08)] flex items-center justify-center shrink-0">
              <GitCommit size={16} className="text-[#FFFFFF]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[#A1A1AA] text-xs mb-0.5">
                Connected Repository
              </p>
              <a
                href={project.githubRepoUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[#FFFFFF] font-medium hover:text-[#6366F1] transition-colors truncate block"
              >
                {project.githubRepoUrl?.replace("https://github.com/", "")}
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div>
              <p className="text-xs text-[#A1A1AA] mb-1.5 flex items-center gap-1.5">
                <GitBranch size={12} /> Branch
              </p>
              <p className="text-sm text-[#FFFFFF] font-mono bg-[#09090B] px-2 py-1 rounded inline-block border border-[rgba(255,255,255,0.08)]">
                main
              </p>
            </div>

            <div>
              <p className="text-xs text-[#A1A1AA] mb-1.5 flex items-center gap-1.5">
                <Box size={12} /> Framework
              </p>
              <Badge variant="secondary" className="capitalize">
                {project.framework || "React"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-[rgba(255,255,255,0.08)] flex items-center text-xs text-[#A1A1AA] gap-1.5">
        <Clock size={12} />
        Created{" "}
        {new Date(project.createdAt).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })}
      </div>
    </Card>
  )
}
