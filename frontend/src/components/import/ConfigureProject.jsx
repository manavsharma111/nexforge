import React from "react"
import {
  Folder,
  Layout,
  Settings,
  Terminal,
  ArrowLeft,
  Plus,
  Trash2,
} from "lucide-react"
import { Card } from "../ui/Card"
import { Input } from "../ui/Input"
import { Button } from "../ui/Button"
import { motion } from "framer-motion"

const ConfigureProject = ({
  selectedRepo,
  formData,
  handleFormChange,
  onBack,
  onDeploy,
  isDeploying,
}) => {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-[#A1A1AA] hover:text-[#FFFFFF] transition-colors mb-6 text-sm font-medium"
      >
        <ArrowLeft size={16} /> Back to repositories
      </button>

      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-[#FFFFFF] mb-2">
          Configure Project
        </h1>
        <p className="text-[#A1A1AA] text-sm">
          You're importing{" "}
          <span className="text-[#FFFFFF] font-semibold">
            {selectedRepo.name}
          </span>
        </p>
      </div>

      <Card className="p-8">
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-semibold text-[#A1A1AA] mb-2 uppercase tracking-wider">
              Project Name
            </label>
            <Input
              icon={Folder}
              value={formData.projectName}
              onChange={(e) => handleFormChange("projectName", e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative">
              <label className=" text-xs font-semibold text-[#A1A1AA] mb-2 uppercase tracking-wider flex items-center gap-2">
                <Layout size={14} /> Framework Preset
              </label>
              <select
                className="w-full bg-[#09090B] border border-[rgba(255,255,255,0.08)] rounded-md px-3 py-2 h-10 text-sm text-[#FFFFFF] focus:outline-none focus:ring-2 focus:ring-[#6366F1] transition-all appearance-none"
                value={formData.framework}
                onChange={(e) => handleFormChange("framework", e.target.value)}
              >
                <option value="React">React / Vite</option>
                <option value="Node.js">Node.js / Express Backend</option>
                <option value="Next.js">Next.js Full-Stack</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className=" text-xs font-semibold text-[#A1A1AA] mb-2 uppercase tracking-wider flex items-center gap-2">
                Root Directory
              </label>
              <Input
                icon={Folder}
                value={formData.rootDirectory}
                onChange={(e) =>
                  handleFormChange("rootDirectory", e.target.value)
                }
              />
            </div>
          </div>

          <div className="pt-4 border-t border-[rgba(255,255,255,0.08)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-[#FFFFFF] flex items-center gap-2">
                <Settings size={16} /> Environment Variables
              </h3>
              <label className="cursor-pointer text-xs bg-[#18181B] border border-[rgba(255,255,255,0.08)] hover:bg-[#111827] text-[#FFFFFF] px-3 py-1.5 rounded-md transition-colors flex items-center gap-2">
                <Settings size={12} /> Upload .env File
                <input
                  type="file"
                  accept=".env,text/plain"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0]
                    if (!file) return
                    const reader = new FileReader()
                    reader.onload = (event) => {
                      const content = event.target.result
                      const lines = content.split("\n")
                      const parsedEnvs = []
                      lines.forEach((line) => {
                        const trimmed = line.trim()
                        if (trimmed && !trimmed.startsWith("#")) {
                          const separatorIdx = trimmed.indexOf("=")
                          if (separatorIdx !== -1) {
                            const key = trimmed
                              .substring(0, separatorIdx)
                              .trim()
                            let value = trimmed
                              .substring(separatorIdx + 1)
                              .trim()
                            if (value.startsWith('"') && value.endsWith('"'))
                              value = value.slice(1, -1)
                            else if (
                              value.startsWith("'") &&
                              value.endsWith("'")
                            )
                              value = value.slice(1, -1)
                            if (key) parsedEnvs.push({ key, value })
                          }
                        }
                      })
                      if (parsedEnvs.length > 0)
                        handleFormChange("environmentVariables", parsedEnvs)
                      e.target.value = null
                    }
                    reader.readAsText(file)
                  }}
                />
              </label>
            </div>

            <div className="space-y-3">
              {formData.environmentVariables.map((env, index) => (
                <div key={index} className="flex gap-4 items-center">
                  <div className="flex-1">
                    <Input
                      placeholder="KEY (e.g. DATABASE_URL)"
                      value={env.key}
                      onChange={(e) => {
                        const newEnvs = [...formData.environmentVariables]
                        newEnvs[index].key = e.target.value
                        handleFormChange("environmentVariables", newEnvs)
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      placeholder="VALUE"
                      value={env.value}
                      onChange={(e) => {
                        const newEnvs = [...formData.environmentVariables]
                        newEnvs[index].value = e.target.value
                        handleFormChange("environmentVariables", newEnvs)
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const newEnvs = formData.environmentVariables.filter(
                        (_, i) => i !== index,
                      )
                      handleFormChange("environmentVariables", newEnvs)
                    }}
                    className="flex-shrink-0 text-[#A1A1AA] hover:text-[#EF4444] hover:bg-[#EF4444]/10 p-2.5 rounded-md transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() =>
                  handleFormChange("environmentVariables", [
                    ...formData.environmentVariables,
                    { key: "", value: "" },
                  ])
                }
                className="w-full py-2.5 rounded-md border border-dashed border-[rgba(255,255,255,0.15)] flex items-center justify-center gap-2 text-sm text-[#A1A1AA] hover:text-[#FFFFFF] hover:bg-[#111827] hover:border-[rgba(255,255,255,0.3)] transition-all mt-2"
              >
                <Plus size={16} /> Add another variable
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-[rgba(255,255,255,0.08)]">
            <h3 className="text-sm font-semibold text-[#FFFFFF] mb-4 flex items-center gap-2">
              <Terminal size={16} /> Build and Output Settings
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-2 uppercase tracking-wider">
                  Build Command
                </label>
                <Input
                  icon={Terminal}
                  value={formData.buildCommand}
                  onChange={(e) =>
                    handleFormChange("buildCommand", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-2 uppercase tracking-wider">
                  Install Command
                </label>
                <Input
                  icon={Terminal}
                  value={formData.installCommand}
                  onChange={(e) =>
                    handleFormChange("installCommand", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#A1A1AA] mb-2 uppercase tracking-wider">
                  Output Directory
                </label>
                <Input
                  icon={Folder}
                  value={formData.outputDirectory}
                  onChange={(e) =>
                    handleFormChange("outputDirectory", e.target.value)
                  }
                />
              </div>
            </div>
          </div>

          <div className="pt-6 mt-2">
            <Button
              variant="accent"
              className="w-full py-5 text-[15px]"
              onClick={onDeploy}
              isLoading={isDeploying}
            >
              Deploy Project
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  )
}

export default ConfigureProject
