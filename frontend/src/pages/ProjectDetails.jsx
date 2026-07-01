import React, { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { io } from "socket.io-client"
import {
  ArrowLeft,
  RefreshCw,
  Trash2,
  Terminal,
  Settings,
  Webhook,
  Copy,
  Check,
} from "lucide-react"
import { fetchProjectById } from "../redux/slices/projectSlice"
import projectService from "../services/projectService"
import { API_URL } from "../utils/axiosInstance"

import { Card } from "../components/ui/Card"
import { Button } from "../components/ui/Button"
import { Badge } from "../components/ui/Badge"
import SkeletonLoader from "../components/common/SkeletonLoader"

import ProjectMetaCard from "../components/deployment/ProjectMetaCard"
import DomainCard from "../components/deployment/DomainCard"
import AnalyticsCard from "../components/deployment/AnalyticsCard"
import DeploymentTimeline from "../components/deployment/DeploymentTimeline"
import BuildLogs from "../components/deployment/BuildLogs"
import EnvironmentVariables from "../components/deployment/EnvironmentVariables"
import WebhookSettings from "../components/deployment/WebhookSettings"

const ACTIVE_STATUSES = ["QUEUED", "INSTALLING", "BUILDING"]

export default function ProjectDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const {
    currentProject: project,
    isLoading: loading,
    error,
  } = useSelector((state) => state.projects)
  const [localProjectState, setLocalProjectState] = useState(null)

  const [logs, setLogs] = useState([])
  const [tab, setTab] = useState("logs")
  const [deploying, setDeploying] = useState(false)
  const [copied, setCopied] = useState(false)
  const socketRef = useRef(null)

  const backendHost = API_URL.replace("/api", "")

  useEffect(() => {
    if (id) dispatch(fetchProjectById(id))
  }, [dispatch, id])

  useEffect(() => {
    if (project) setLocalProjectState(project)
  }, [project])

  useEffect(() => {
    if (!id) return
    let mounted = true

    const socket = io(backendHost, {
      withCredentials: true,
      transports: ["polling"],
    })
    socketRef.current = socket
    socket.emit("joinProject", id)

    socket.on("initial-logs", (initialLogs) => {
      if (mounted) setLogs(initialLogs.map((l) => l.message))
    })

    socket.on("new-log", (entry) => {
      if (mounted) setLogs((prev) => [...prev, entry.message])
    })

    socket.on("status-change", ({ status, liveUrl }) => {
      if (!mounted) return
      setLocalProjectState((prev) =>
        prev ? { ...prev, status, liveUrl: liveUrl || prev.liveUrl } : prev,
      )
      if (!ACTIVE_STATUSES.includes(status)) setDeploying(false)
    })

    return () => {
      mounted = false
      socket.disconnect()
    }
  }, [id, backendHost])

  const handleRedeploy = async () => {
    setDeploying(true)
    setLogs([])
    setTab("logs")
    try {
      await projectService.deployProject(id)
    } catch (err) {
      console.error("Redeploy failed", err)
      setDeploying(false)
    }
  }

  const handleDelete = async () => {
    try {
      await projectService.deleteProject(id)
      navigate("/dashboard")
    } catch (err) {
      console.error("Failed to delete project", err)
    }
  }

  if (loading && !localProjectState)
    return (
      <div className="w-full">
        <div className="space-y-6">
          <SkeletonLoader className="h-10 w-1/4" />
          <SkeletonLoader className="h-32 w-full" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <SkeletonLoader className="lg:col-span-2 h-96 w-full" />
            <SkeletonLoader className="h-96 w-full" />
          </div>
        </div>
      </div>
    )

  if (error)
    return (
      <div className="w-full text-center py-20">
        <div className="bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] p-6 rounded-xl inline-block max-w-md">
          <h2 className="text-lg font-semibold mb-2">Error Loading Project</h2>
          <p className="text-sm opacity-80">{error}</p>
          <Button
            onClick={() => navigate("/dashboard")}
            className="mt-6"
            variant="secondary"
          >
            Go back to Dashboard
          </Button>
        </div>
      </div>
    )

  if (!localProjectState) return null

  const isActive = ACTIVE_STATUSES.includes(localProjectState.status)

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
    <div className="w-full animate-[fadeIn_0.3s_ease]">
      <button
        onClick={() => navigate("/dashboard")}
        className="flex items-center gap-1.5 text-sm text-[#A1A1AA] hover:text-[#FFFFFF] transition-colors mb-6"
      >
        <ArrowLeft size={14} />
        Overview
      </button>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-semibold text-[#FFFFFF] tracking-tight flex items-center gap-3">
            {localProjectState.projectName}
            <Badge variant={getStatusBadgeVariant(localProjectState.status)}>
              {localProjectState.status}
            </Badge>
          </h1>
          {localProjectState.description && (
            <p className="text-[#A1A1AA] mt-2">
              {localProjectState.description}
            </p>
          )}
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-[#A1A1AA] font-mono bg-[#1E1E20] px-2 py-1 rounded border border-[rgba(255,255,255,0.05)]">
              Project ID: {localProjectState._id}
            </span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(localProjectState._id)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
              }}
              className="text-[#A1A1AA] hover:text-[#FFFFFF] transition-colors p-1 rounded hover:bg-[#1E1E20]"
              title="Copy Project ID"
            >
              {copied ? (
                <Check size={14} className="text-[#10B981]" />
              ) : (
                <Copy size={14} />
              )}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={handleRedeploy}
            disabled={deploying || isActive}
            variant="secondary"
            className="gap-2"
          >
            <RefreshCw
              size={14}
              className={deploying || isActive ? "animate-spin" : ""}
            />
            Redeploy
          </Button>
          <Button
            onClick={handleDelete}
            variant="destructive"
            className="gap-2"
          >
            <Trash2 size={14} />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <ProjectMetaCard project={localProjectState} />
        <DomainCard
          project={localProjectState}
          onUpdate={(updatedData) =>
            setLocalProjectState((prev) => ({ ...prev, ...updatedData }))
          }
        />
        <AnalyticsCard />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-2 border-b border-[rgba(255,255,255,0.08)]">
            {[
              { key: "logs", label: "Build Logs", icon: Terminal },
              {
                key: "variables",
                label: "Environment Variables",
                icon: Settings,
              },
              { key: "webhooks", label: "Webhooks", icon: Webhook },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  tab === key
                    ? "text-[#FFFFFF] border-[#FFFFFF]"
                    : "text-[#A1A1AA] border-transparent hover:text-[#FFFFFF]"
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>

          {tab === "logs" && <BuildLogs logs={logs} />}
          {tab === "variables" && (
            <EnvironmentVariables
              projectId={localProjectState._id}
              initialVars={localProjectState.environmentVariables}
            />
          )}
          {tab === "webhooks" && (
            <WebhookSettings project={localProjectState} />
          )}
        </div>

        <div>
          <DeploymentTimeline project={localProjectState} />
        </div>
      </div>
    </div>
  )
}
