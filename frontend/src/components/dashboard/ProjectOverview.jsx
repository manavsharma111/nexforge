import React, { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Filter, Globe, X } from "lucide-react"
import { Card } from "../ui/Card"
import { Input } from "../ui/Input"
import { Button } from "../ui/Button"
import ProjectCard from "../projects/ProjectCard"
import { useNavigate } from "react-router-dom"

export default function ProjectOverview({ projects, loading }) {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [visibleCount, setVisibleCount] = useState(3)

  const filteredProjects = useMemo(() => {
    if (!projects) return []
    return projects.filter((p) => {
      const matchesSearch =
        p.projectName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.githubRepoUrl?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === "ALL" || p.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [projects, searchQuery, statusFilter])

  const statuses = ["ALL", "LIVE", "BUILDING", "QUEUED", "FAILED"]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="flex flex-col"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-end gap-4 mb-6">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Input
              icon={Search}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search deployments..."
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-[#FFFFFF]"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <Button
            variant={showFilters ? "secondary" : "ghost"}
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className="shrink-0 border border-[rgba(255,255,255,0.08)]"
          >
            <Filter size={16} />
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginBottom: 0 }}
            animate={{ height: "auto", opacity: 1, marginBottom: 24 }}
            exit={{ height: 0, opacity: 0, marginBottom: 0 }}
            className="overflow-hidden"
          >
            <Card className="p-4 flex flex-wrap items-center gap-3">
              <span className="text-xs font-medium text-[#A1A1AA] uppercase tracking-wider">
                Status:
              </span>
              <div className="flex flex-wrap gap-2">
                {statuses.map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors border ${
                      statusFilter === s
                        ? "bg-[#6366F1]/20 text-[#6366F1] border-[#6366F1]/30"
                        : "bg-transparent text-[#A1A1AA] border-[rgba(255,255,255,0.08)] hover:text-[#FFFFFF] hover:bg-[#111827]"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card
              key={i}
              className="h-48 animate-pulse bg-[#111827] border-transparent"
            />
          ))}
        </div>
      ) : !projects || projects.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-24 border-dashed border-[rgba(255,255,255,0.15)] bg-transparent">
          <div className="w-12 h-12 rounded-xl bg-[#111827] border border-[rgba(255,255,255,0.08)] flex items-center justify-center mb-4 text-[#A1A1AA]">
            <Globe size={24} />
          </div>
          <h3 className="text-[#FFFFFF] font-medium mb-1">
            No deployments found
          </h3>
          <p className="text-sm text-[#A1A1AA] mb-6 max-w-sm text-center">
            You haven't deployed any projects yet. Connect a GitHub repository
            to get started.
          </p>
          <Button onClick={() => navigate("/new")}>New Project</Button>
        </Card>
      ) : filteredProjects.length === 0 ? (
        <Card className="py-20 text-center flex flex-col items-center justify-center bg-transparent border-dashed border-[rgba(255,255,255,0.15)]">
          <div className="w-12 h-12 rounded-xl bg-[#111827] border border-[rgba(255,255,255,0.08)] flex items-center justify-center mb-4 text-[#A1A1AA]">
            <Search size={20} />
          </div>
          <h3 className="text-[#FFFFFF] font-medium mb-1">No results found</h3>
          <p className="text-sm text-[#A1A1AA] mb-4">
            No deployments match your search for "{searchQuery}"{" "}
            {statusFilter !== "ALL" && `with status ${statusFilter}`}.
          </p>
          <Button
            variant="ghost"
            onClick={() => {
              setSearchQuery("")
              setStatusFilter("ALL")
            }}
          >
            Clear filters
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.slice(0, visibleCount).map((p) => (
              <ProjectCard key={p._id} project={p} />
            ))}
          </div>
          <div className="flex justify-center gap-4 mt-8">
            {filteredProjects.length > visibleCount && (
              <Button
                variant="secondary"
                onClick={() => setVisibleCount((prev) => prev + 3)}
              >
                Load More
              </Button>
            )}
            {visibleCount > 3 && (
              <Button
                variant="ghost"
                className="border border-[rgba(255,255,255,0.08)]"
                onClick={() => setVisibleCount(3)}
              >
                Load Less
              </Button>
            )}
          </div>
        </div>
      )}
    </motion.div>
  )
}
