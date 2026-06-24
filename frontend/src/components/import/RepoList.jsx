import React from "react"
import { GitBranch } from "lucide-react"
import { Card } from "../ui/Card"
import { Button } from "../ui/Button"

const RepoList = ({ repositories, isLoading, onSelectRepo }) => {
  if (isLoading) {
    return (
      <Card className="overflow-hidden p-8 flex justify-center items-center">
        <svg
          className="animate-spin h-8 w-8 text-[#A1A1AA]"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      </Card>
    )
  }

  if (repositories?.length === 0) {
    return (
      <Card className="overflow-hidden p-8 text-center text-[#A1A1AA]">
        No repositories found in your GitHub account.
      </Card>
    )
  }

  return (
    <Card className="overflow-hidden bg-[#18181B] border-[rgba(255,255,255,0.08)]">
      <div className="divide-y divide-[rgba(255,255,255,0.08)]">
        {repositories?.map((repo) => (
          <div
            key={repo.id}
            className="p-4 flex items-center justify-between hover:bg-[#111827] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[rgba(255,255,255,0.04)] rounded-md border border-[rgba(255,255,255,0.08)]">
                <GitBranch size={16} className="text-[#A1A1AA]" />
              </div>
              <div>
                <h4 className="text-[#FFFFFF] font-medium">{repo.name}</h4>
                <p className="text-[#A1A1AA] text-xs">
                  {repo.private ? "Private" : "Public"} •{" "}
                  {repo.updatedAt
                    ? new Date(repo.updatedAt).toLocaleDateString()
                    : ""}
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onSelectRepo(repo)}
            >
              Import
            </Button>
          </div>
        ))}
      </div>
    </Card>
  )
}

export default RepoList
