import React, { useState } from "react"
import { Terminal, Copy, Check, ChevronRight, Hash } from "lucide-react"

const CodeSnippet = ({ code, shell = "SHELL" }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mb-8 mt-4 rounded-md overflow-hidden border border-[rgba(255,255,255,0.08)] bg-[#0C0C0E]">
      <div className="flex items-center justify-between px-4 py-2 border-b border-[rgba(255,255,255,0.08)] bg-[#121214]">
        <span className="text-xs font-semibold tracking-wider text-[#A1A1AA]">
          {shell}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-[#A1A1AA] hover:text-[#FFFFFF] transition-colors"
        >
          {copied ? (
            <Check size={14} className="text-[#10B981]" />
          ) : (
            <Copy size={14} />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="text-[13px] font-mono text-[#E4E4E7] leading-relaxed">
          <code>
            <span className="text-[#6366F1] select-none">$ </span>
            {code}
          </code>
        </pre>
      </div>
    </div>
  )
}

const StepBadge = ({ number }) => (
  <div className="w-6 h-6 shrink-0 rounded bg-[#6366F1] flex items-center justify-center text-white text-xs font-bold mr-3 mt-0.5">
    {number}
  </div>
)

export default function Docs() {
  const [activeTab, setActiveTab] = useState("npm")

  const tocItems = [
    { id: "setup", label: "Setup" },
    { id: "install", label: "1. Install", indent: true },
    { id: "login", label: "2. Log in", indent: true },
    { id: "create", label: "3. Create Project", indent: true },
    { id: "common-commands", label: "Common Commands" },
    { id: "init", label: "Initialize Project", indent: true },
    { id: "deploy", label: "Deploy Code", indent: true },
    { id: "rollback", label: "Rollback Version", indent: true },
    { id: "env", label: "Environment Sync", indent: true },
    { id: "logs", label: "Stream Logs", indent: true },
    { id: "rename", label: "Rename Project", indent: true },
  ]

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }

  return (
    <div className="flex justify-center h-full w-full max-w-[800px] mx-auto animate-[fadeIn_0.3s_ease]">
      {/* Main Content Area */}
      <div className="flex-1 px-4 md:px-8 pb-32 pt-8 w-full">
        <h1 className="text-4xl font-semibold text-[#FFFFFF] tracking-tight mb-8">
          The NexForge CLI
        </h1>

        <section id="setup" className="scroll-mt-8">
          <p className="text-[#E4E4E7] leading-relaxed mb-10">
            The NexForge CLI brings the power of the dashboard directly to your
            terminal. Create projects, deploy code, and stream live logs without
            ever leaving your editor.
          </p>

          <h2
            id="install"
            className="text-2xl font-semibold text-[#FFFFFF] mb-6 flex items-center gap-2 group scroll-mt-8"
          >
            <Hash
              size={20}
              className="text-[#A1A1AA] opacity-0 group-hover:opacity-100 transition-opacity"
            />
            1. Install or Upgrade
          </h2>
          <div className="flex items-start mb-4">
            <p className="text-[#E4E4E7] leading-relaxed">
              Run the following command to install the CLI globally on your
              system.
            </p>
          </div>

          <CodeSnippet code="npm install -g nexforge-cli" />

          <p className="text-[#E4E4E7] leading-relaxed mb-12">
            After installation completes, open a new terminal tab and run{" "}
            <code className="bg-[#1E1E20] px-1.5 py-0.5 rounded text-[#E4E4E7] border border-[rgba(255,255,255,0.1)] text-[13px]">
              nexforge
            </code>{" "}
            with no arguments to confirm it installed correctly.
          </p>

          <h2
            id="login"
            className="text-2xl font-semibold text-[#FFFFFF] mb-6 flex items-center gap-2 group scroll-mt-8 mt-12"
          >
            <Hash
              size={20}
              className="text-[#A1A1AA] opacity-0 group-hover:opacity-100 transition-opacity"
            />
            2. Log in
          </h2>
          <p className="text-[#E4E4E7] leading-relaxed mb-6">
            The NexForge CLI uses a <strong>Secret CLI Token</strong> to
            authenticate with the NexForge platform. Authenticate with the
            following steps:
          </p>

          <div className="flex items-start mb-2">
            <StepBadge number="1" />
            <p className="text-[#E4E4E7] leading-relaxed">
              Navigate to your <strong>Settings</strong> dashboard and click{" "}
              <strong>Generate New Token</strong>.
            </p>
          </div>
          <div className="flex items-start mb-2 mt-4">
            <StepBadge number="2" />
            <p className="text-[#E4E4E7] leading-relaxed">
              Run the following command:
            </p>
          </div>
          <CodeSnippet code="nexforge login" />

          <div className="flex items-start mb-12">
            <StepBadge number="3" />
            <p className="text-[#E4E4E7] leading-relaxed">
              When prompted, paste your <strong>CLI Token</strong> and{" "}
              <strong>Project ID</strong>. The CLI saves these securely to your
              local machine.
            </p>
          </div>

          <h2
            id="create"
            className="text-2xl font-semibold text-[#FFFFFF] mb-6 flex items-center gap-2 group scroll-mt-8 mt-12"
          >
            <Hash
              size={20}
              className="text-[#A1A1AA] opacity-0 group-hover:opacity-100 transition-opacity"
            />
            3. Create a Project
          </h2>
          <p className="text-[#E4E4E7] leading-relaxed mb-6">
            Scaffold a new Next.js, MERN, React, or Express project with industry-standard folder structures and pre-installed NexForge dependencies.
          </p>
          <CodeSnippet code="nexforge create" />
        </section>

        <section
          id="common-commands"
          className="pt-8 border-t border-[rgba(255,255,255,0.08)] scroll-mt-8"
        >
          <h2 className="text-2xl font-semibold text-[#FFFFFF] mb-8">
            Common Commands
          </h2>

          <h3
            id="init"
            className="text-xl font-medium text-[#FFFFFF] mb-4 scroll-mt-8"
          >
            Initialize a New Project
          </h3>
          <p className="text-[#E4E4E7] leading-relaxed">
            Run this in an empty directory or existing project folder to create
            a new NexForge project without visiting the dashboard.
          </p>
          <CodeSnippet code="nexforge init" />

          <h3
            id="deploy"
            className="text-xl font-medium text-[#FFFFFF] mb-4 mt-12 scroll-mt-8"
          >
            Deploy Code
          </h3>
          <p className="text-[#E4E4E7] leading-relaxed">
            Packages your current directory, uploads it, and streams the live
            build logs directly in your terminal.
          </p>
          <CodeSnippet code="nexforge deploy" />

          <h3
            id="rename-subdomain"
            className="text-xl font-medium text-[#FFFFFF] mb-4 mt-12 scroll-mt-8"
          >
            Rename Subdomain
          </h3>
          <p className="text-[#E4E4E7] leading-relaxed">
            Rename the subdomain of your project.
          </p>
          <CodeSnippet code="nexforge rename" />

          <h3
            id="rollback"
            className="text-xl font-medium text-[#FFFFFF] mb-4 mt-12 scroll-mt-8"
          >
            Rollback Version
          </h3>
          <p className="text-[#E4E4E7] leading-relaxed">
            View your recent deployment history and instantly revert your live
            website to a previous version without rebuilding.
          </p>
          <CodeSnippet code="nexforge rollback" />

          <h3
            id="env"
            className="text-xl font-medium text-[#FFFFFF] mb-4 mt-12 scroll-mt-8"
          >
            Manage Environment Variables
          </h3>
          <p className="text-[#E4E4E7] leading-relaxed">
            Uploads your local{" "}
            <code className="bg-[#1E1E20] px-1.5 py-0.5 rounded text-[#E4E4E7] text-[13px] border border-[rgba(255,255,255,0.1)]">
              .env
            </code>{" "}
            file securely to NexForge servers, or downloads them to your local
            machine.
          </p>
          <CodeSnippet code="nexforge env push" />
          <CodeSnippet code="nexforge env pull" />

          <h3
            id="logs"
            className="text-xl font-medium text-[#FFFFFF] mb-4 mt-12 scroll-mt-8"
          >
            Stream Live Logs
          </h3>
          <p className="text-[#E4E4E7] leading-relaxed">
            Connects to the NexForge servers and streams real-time build logs
            for the currently deploying project.
          </p>
          <CodeSnippet code="nexforge logs" />
        </section>
      </div>
    </div>
  )
}
