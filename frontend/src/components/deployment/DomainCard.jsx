import React, { useEffect, useState } from "react"
import {
  Globe,
  ExternalLink,
  ShieldCheck,
  Edit2,
  Check,
  X,
  Copy,
} from "lucide-react"
import { toast } from "react-toastify"
import projectService from "../../services/projectService"
import { Card } from "../ui/Card"
import { Button } from "../ui/Button"

export default function DomainCard({ project, onUpdate }) {
  if (!project || !project.liveUrl) return null

  const [isEditing, setIsEditing] = useState(false)
  const [subdomain, setSubdomain] = useState(project.subdomain || "")
  const [liveUrl, setLiveUrl] = useState(project.liveUrl || "")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setSubdomain(project.subdomain || "")
    setLiveUrl(project.liveUrl || "")
  }, [project.subdomain, project.liveUrl])

  const url = liveUrl
  let parsedUrl
  let baseHost = ""
  let domain = url

  try {
    parsedUrl = new URL(url)
    baseHost = `.${parsedUrl.hostname.split(".").slice(1).join(".")}`
    domain = parsedUrl.hostname
  } catch (err) {
    parsedUrl = null
    const stripped = url.replace("https://", "").replace("http://", "")
    baseHost = stripped
    domain = stripped
  }

  const handleSave = async () => {
    if (!subdomain.trim()) return
    setIsLoading(true)
    setError("")

    try {
      const response = await projectService.updateProject(project._id, {
        subdomain,
      })
      const updatedProject = response.project || {}

      onUpdate(updatedProject)
      setSubdomain(updatedProject.subdomain || subdomain)
      setLiveUrl(updatedProject.liveUrl || liveUrl)
      toast.success("Subdomain updated successfully")
      setIsEditing(false)
    } catch (err) {
      const message = err.response?.data?.message || "Failed to update subdomain"
      setError(message)
      toast.error(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Card className="p-6 relative overflow-hidden group h-full flex flex-col justify-between">
      <div className="absolute top-0 right-0 p-8 bg-[#6366F1]/10 rounded-bl-full pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity" />

      <div className="flex flex-col relative z-10 h-full justify-between gap-8">
        <div className="flex items-start justify-between gap-4 w-full">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-[#111827] rounded-xl border border-[rgba(255,255,255,0.08)] flex items-center justify-center shrink-0">
              <Globe className="text-[#A1A1AA]" size={20} />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm text-[#A1A1AA] font-medium truncate">
                Production Domain
              </h4>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20 text-[#22C55E] text-[10px] font-medium">
                  <ShieldCheck size={10} />
                  SSL Active
                </div>
              </div>
            </div>
          </div>
          {!isEditing && (
            <button
              onClick={() => {
                setSubdomain(project.subdomain || "")
                setIsEditing(true)
              }}
              className="text-xs text-[#A1A1AA] hover:text-[#FFFFFF] flex items-center gap-1 transition-colors shrink-0 mt-1"
            >
              <Edit2 size={12} /> Edit
            </button>
          )}
        </div>

        <div className="w-full flex flex-col justify-end">
          {isEditing ? (
            <div className="flex flex-col gap-2 mt-2">
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-[#09090B] border border-[rgba(255,255,255,0.08)] rounded-md overflow-hidden flex-1 focus-within:border-[#6366F1]/50 transition-colors">
                  <input
                    type="text"
                    value={subdomain}
                    onChange={(e) =>
                      setSubdomain(
                        e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                      )
                    }
                    className="bg-transparent border-none outline-none text-[#FFFFFF] text-sm px-3 py-2 w-full min-w-[100px]"
                    placeholder="my-app"
                  />
                  <span className="text-[#A1A1AA] text-sm pr-3 whitespace-nowrap">
                    {baseHost}
                  </span>
                </div>
                <Button
                  variant="secondary"
                  onClick={handleSave}
                  disabled={isLoading || !subdomain.trim()}
                  className="px-3"
                >
                  <Check size={16} />
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsEditing(false)
                    setError("")
                  }}
                  className="px-3 border border-[rgba(255,255,255,0.08)]"
                >
                  <X size={16} />
                </Button>
              </div>
              {error && <span className="text-xs text-[#EF4444]">{error}</span>}
            </div>
          ) : (
            <div className="flex flex-col gap-3 min-w-0 w-full">
              <div className="flex items-center justify-between bg-[#09090B] border border-[rgba(255,255,255,0.08)] rounded-md px-3 py-2 w-full">
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  title={url}
                  className="text-sm font-medium text-[#FFFFFF] hover:text-[#6366F1] transition-colors truncate block flex-1 mr-2"
                >
                  {url}
                </a>
                <button
                  onClick={handleCopy}
                  className="text-[#A1A1AA] hover:text-[#FFFFFF] transition-colors shrink-0"
                  title="Copy URL"
                >
                  {copied ? (
                    <Check size={14} className="text-[#22C55E]" />
                  ) : (
                    <Copy size={14} />
                  )}
                </button>
              </div>
              <Button
                onClick={() => window.open(url, "_blank")}
                className="w-full gap-2 bg-[#FFFFFF] text-[#09090B] hover:bg-[#F4F4F5] justify-center"
              >
                Visit Site
                <ExternalLink size={14} />
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
