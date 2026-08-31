import React, { useState, useRef } from "react"
import { motion } from "framer-motion"
import { Eye, EyeOff, Plus, Trash2, Save, RefreshCw, Upload } from "lucide-react"
import projectService from "../../services/projectService"
import { Card } from "../ui/Card"
import { Button } from "../ui/Button"
import { Input } from "../ui/Input"

export default function EnvironmentVariables({ projectId, initialVars = [] }) {
  const [vars, setVars] = useState(
    initialVars.length > 0
      ? initialVars.map((v, i) => ({
          id: i,
          key: v.key,
          value: v.value,
          hidden: true,
        }))
      : [{ id: Date.now(), key: "", value: "", hidden: false }],
  )
  const [saving, setSaving] = useState(false)
  const fileInputRef = useRef(null)

  const toggleVisibility = (id) => {
    setVars(vars.map((v) => (v.id === id ? { ...v, hidden: !v.hidden } : v)))
  }

  const removeVar = (id) => {
    setVars(vars.filter((v) => v.id !== id))
  }

  const updateVar = (id, field, val) => {
    setVars(vars.map((v) => (v.id === id ? { ...v, [field]: val } : v)))
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target.result
      const lines = content.split('\n')
      const newVars = []
      
      lines.forEach((line) => {
        const trimmedLine = line.trim()
        if (trimmedLine && !trimmedLine.startsWith('#')) {
          const separatorIndex = trimmedLine.indexOf('=')
          if (separatorIndex !== -1) {
            const key = trimmedLine.substring(0, separatorIndex).trim()
            let value = trimmedLine.substring(separatorIndex + 1).trim()
            
            // Remove wrapping quotes if present
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
              value = value.substring(1, value.length - 1)
            }
            
            if (key) {
              newVars.push({
                id: Date.now() + Math.random(),
                key,
                value,
                hidden: true
              })
            }
          }
        }
      })

      if (newVars.length > 0) {
        // Filter out existing empty vars, then append new ones
        const existingVars = vars.filter(v => v.key.trim() !== "" || v.value.trim() !== "")
        setVars([...existingVars, ...newVars])
      }
    }
    reader.readAsText(file)
    
    // Reset input so the same file can be uploaded again if needed
    e.target.value = null
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const cleanVars = vars
        .filter((v) => v.key.trim() !== "" && v.value.trim() !== "")
        .map((v) => ({ key: v.key, value: v.value }))

      await projectService.updateProject(projectId, {
        environmentVariables: cleanVars,
      })
      // Trigger a redeploy since env vars changed
      await projectService.deployProject(projectId)
    } catch (err) {
      console.error("Failed to save variables:", err)
      alert("Failed to save environment variables.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="p-6 animate-[fadeIn_0.3s_ease] overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-[rgba(255,255,255,0.08)] pb-6">
        <div>
          <h3 className="text-[#FFFFFF] text-lg font-medium">
            Environment Variables
          </h3>
          <p className="text-sm text-[#A1A1AA] mt-1">
            Configure environment variables for your next deployment.
          </p>
        </div>
        <div className="flex gap-2">
          <input 
            type="file" 
            accept=".env" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
          />
          <Button
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            className="gap-2 shrink-0"
          >
            <Upload size={16} />
            Upload .env
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="gap-2 shrink-0"
          >
            {saving ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {saving ? "Saving & Redeploying..." : "Save & Redeploy"}
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        {vars.length === 0 && (
          <div className="text-center py-8 border border-dashed border-[rgba(255,255,255,0.15)] rounded-xl bg-transparent">
            <p className="text-sm text-[#A1A1AA] mb-4">
              No environment variables configured.
            </p>
            <Button
              variant="secondary"
              onClick={() =>
                setVars([{ id: Date.now(), key: "", value: "", hidden: false }])
              }
              className="gap-2"
            >
              <Plus size={16} /> Add First Variable
            </Button>
          </div>
        )}

        {vars.map((v) => (
          <motion.div
            key={v.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full"
          >
            <div className="w-full sm:w-1/3">
              <Input
                type="text"
                value={v.key}
                onChange={(e) => updateVar(v.id, "key", e.target.value)}
                placeholder="VARIABLE_NAME"
                className="font-mono"
              />
            </div>

            <div className="hidden sm:block w-px h-6 bg-[rgba(255,255,255,0.08)] mx-1" />

            <div className="relative flex-1 w-full">
              <Input
                type={v.hidden ? "password" : "text"}
                value={v.value}
                onChange={(e) => updateVar(v.id, "value", e.target.value)}
                placeholder="value"
                className="font-mono pr-10"
              />
              <button
                onClick={() => toggleVisibility(v.id)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A1A1AA] hover:text-[#FFFFFF] transition-colors"
              >
                {v.hidden ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
            </div>

            <button
              onClick={() => removeVar(v.id)}
              className="p-2.5 text-[#A1A1AA] hover:text-[#EF4444] hover:bg-[#EF4444]/10 rounded-md transition-colors shrink-0"
              title="Remove Variable"
            >
              <Trash2 size={16} />
            </button>
          </motion.div>
        ))}

        {vars.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="pt-4"
          >
            <button
              onClick={() =>
                setVars([
                  ...vars,
                  { id: Date.now(), key: "", value: "", hidden: false },
                ])
              }
              className="flex items-center gap-2 text-sm font-medium text-[#6366F1] hover:underline transition-colors py-2 px-1"
            >
              + Add Another Variable
            </button>
          </motion.div>
        )}
      </div>
    </Card>
  )
}
