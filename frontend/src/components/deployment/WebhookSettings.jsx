import React, { useState } from "react"
import { Copy, Check, Eye, EyeOff, Info } from "lucide-react"
import { API_URL } from "../../utils/axiosInstance"
import { Card } from "../ui/Card"
import { Button } from "../ui/Button"

export default function WebhookSettings({ project }) {
  const [copiedUrl, setCopiedUrl] = useState(false)
  const [copiedSecret, setCopiedSecret] = useState(false)
  const [showSecret, setShowSecret] = useState(false)

  const webhookUrl = `${API_URL}/github/webhook`
  const secret =
    project?.webhookSecret || "No secret generated yet. Please contact support."

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text)
    if (type === "url") {
      setCopiedUrl(true)
      setTimeout(() => setCopiedUrl(false), 2000)
    } else {
      setCopiedSecret(true)
      setTimeout(() => setCopiedSecret(false), 2000)
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-start gap-4 mb-6">
        <div className="w-10 h-10 rounded-full bg-[#6366F1]/10 flex items-center justify-center text-[#6366F1] shrink-0 border border-[#6366F1]/20">
          <Info size={20} />
        </div>
        <div>
          <h3 className="text-lg font-medium text-[#FFFFFF]">
            GitHub Auto-Deployment
          </h3>
          <p className="text-sm text-[#A1A1AA] mt-1">
            Configure your GitHub repository to automatically trigger a
            deployment whenever you push to your branch.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium text-[#FFFFFF] mb-2">
            1. Go to your GitHub Repository
          </h4>
          <p className="text-sm text-[#A1A1AA]">
            Navigate to <strong className="text-[#FFFFFF]">Settings</strong>{" "}
            &gt; <strong className="text-[#FFFFFF]">Webhooks</strong> and click{" "}
            <strong className="text-[#FFFFFF]">Add webhook</strong>.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-medium text-[#FFFFFF] mb-2">
            2. Payload URL
          </h4>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-[#09090B] border border-[rgba(255,255,255,0.08)] rounded-md px-3 py-2.5 text-sm text-[#22C55E] font-mono break-all">
              {webhookUrl}
            </code>
            <Button
              variant="secondary"
              onClick={() => handleCopy(webhookUrl, "url")}
              className="px-3"
              title="Copy URL"
            >
              {copiedUrl ? (
                <Check size={16} className="text-[#22C55E]" />
              ) : (
                <Copy size={16} />
              )}
            </Button>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-[#FFFFFF] mb-2">
            3. Content type
          </h4>
          <p className="text-sm text-[#A1A1AA]">
            Select{" "}
            <code className="bg-[#111827] border border-[rgba(255,255,255,0.08)] px-1.5 py-0.5 rounded text-[#FFFFFF]">
              application/json
            </code>{" "}
            from the dropdown.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-medium text-[#FFFFFF] mb-2">4. Secret</h4>
          <p className="text-sm text-[#A1A1AA] mb-2">
            Paste the following secret to securely verify payloads.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-[#09090B] border border-[rgba(255,255,255,0.08)] rounded-md px-3 py-2.5 text-sm text-[#F59E0B] font-mono flex items-center justify-between">
              <span>{showSecret ? secret : "•".repeat(24)}</span>
              <button
                onClick={() => setShowSecret(!showSecret)}
                className="text-[#A1A1AA] hover:text-[#FFFFFF] transition-colors"
              >
                {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </code>
            <Button
              variant="secondary"
              onClick={() => handleCopy(secret, "secret")}
              className="px-3"
              title="Copy Secret"
            >
              {copiedSecret ? (
                <Check size={16} className="text-[#22C55E]" />
              ) : (
                <Copy size={16} />
              )}
            </Button>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-medium text-[#FFFFFF] mb-2">
            5. Which events would you like to trigger this webhook?
          </h4>
          <p className="text-sm text-[#A1A1AA]">
            Select{" "}
            <strong className="text-[#FFFFFF]">Just the push event.</strong>{" "}
            Then click <strong className="text-[#FFFFFF]">Add webhook</strong>{" "}
            to save.
          </p>
        </div>
      </div>
    </Card>
  )
}
