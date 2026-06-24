import { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchAllProjects } from "../redux/slices/projectSlice"
import { motion } from "framer-motion"
import { Button } from "../components/ui/Button"
import { Plus } from "lucide-react"
import { useNavigate } from "react-router-dom"

import StatsCards from "../components/dashboard/StatsCards"
import SystemMetrics from "../components/dashboard/SystemMetrics"

export default function Dashboard() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#FFFFFF] tracking-tight">
            Overview
          </h1>
          <p className="text-sm text-[#A1A1AA] mt-1">
            Monitor your infrastructure and recent deployments
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={() => navigate("/new")} className="gap-2">
            <Plus size={16} />
            New Project
          </Button>
        </div>
      </div>

      <div className="space-y-8">
        <StatsCards projects={projects || []} />
        <SystemMetrics />
      </div>
    </motion.div>
  )
}
