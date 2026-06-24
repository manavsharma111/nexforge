import React, { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchAllProjects } from "../redux/slices/projectSlice"
import { motion } from "framer-motion"

import ProjectOverview from "../components/dashboard/ProjectOverview"

export default function Projects() {
  const dispatch = useDispatch()
  const { projectsList: projects, isLoading: loading } = useSelector(
    (state) => state.projects,
  )

  useEffect(() => {
    dispatch(fetchAllProjects())
  }, [dispatch])

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      <div>
        <h1 className="text-2xl font-semibold text-[#FFFFFF] tracking-tight">
          All Projects
        </h1>
        <p className="text-sm text-[#A1A1AA] mt-1">
          Manage all your infrastructure deployments in one place
        </p>
      </div>

      <ProjectOverview projects={projects} loading={loading} limit={false} />
    </motion.div>
  )
}
