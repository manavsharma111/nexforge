import React from "react"
import { motion } from "framer-motion"
import ProjectCard from "./ProjectCard"
import EmptyState from "../common/EmptyState"
import SkeletonLoader from "../common/SkeletonLoader"
import { FolderGit2 } from "lucide-react"

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function ProjectGrid({
  projects,
  loading,
  onRedeploy,
  onDelete,
  onCreateNew,
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="bg-surface border border-border rounded-2xl p-5 h-48 flex flex-col justify-between"
          >
            <div className="flex gap-4 items-center">
              <SkeletonLoader className="w-10 h-10 rounded-xl" />
              <div className="space-y-2 flex-1">
                <SkeletonLoader className="h-4 w-1/2" />
                <SkeletonLoader className="h-3 w-1/3" />
              </div>
            </div>
            <div className="space-y-2 mt-4">
              <SkeletonLoader className="h-3 w-full" />
              <SkeletonLoader className="h-3 w-4/5" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!projects || projects.length === 0) {
    return (
      <EmptyState
        icon={FolderGit2}
        title="No projects found"
        description="Get started by deploying your first project from a GitHub repository."
        actionLabel="Deploy Project"
        onAction={onCreateNew}
      />
    )
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {projects.map((project) => (
        <motion.div key={project._id} variants={itemVariants}>
          <ProjectCard
            project={project}
            onRedeploy={onRedeploy}
            onDelete={onDelete}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}
