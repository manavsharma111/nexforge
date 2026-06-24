import React from "react"
import { useNavigate } from "react-router-dom"
import { useDispatch, useSelector } from "react-redux"
import { createNewProject } from "../redux/slices/projectSlice"
import { useGithubImport } from "../hooks/useGithubImport"

import RepoList from "../components/import/RepoList"
import ConfigureProject from "../components/import/ConfigureProject"

export default function ImportProject() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { isLoading: submitting } = useSelector((state) => state.projects)

  const {
    repositories: repos,
    isFetchingRepos: reposLoading,
    selectedRepo,
    selectRepo,
    clearSelection,
    formData,
    handleFormChange,
  } = useGithubImport()

  const handleRepoSelect = (repo) => {
    selectRepo({
      ...repo,
      htmlUrl:
        repo.htmlUrl ||
        repo.html_url ||
        repo.url ||
        `https://github.com/${repo.fullName || repo.full_name}`,
    })
  }

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (!selectedRepo) return alert("Please select a repository")

    const projectData = {
      ...formData,
      githubRepoUrl: selectedRepo.htmlUrl || selectedRepo.html_url,
      environmentVariables: formData.environmentVariables.filter(
        (env) => env.key && env.value,
      ),
    }

    try {
      const resultAction = await dispatch(createNewProject(projectData))
      if (createNewProject.fulfilled.match(resultAction)) {
        navigate(`/project/${resultAction.payload._id}`)
      } else {
        alert(resultAction.payload || "Failed to create project")
      }
    } catch (err) {
      alert("Failed to create project")
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto pt-8">
      {!selectedRepo ? (
        <>
          <h1 className="text-3xl font-semibold mb-8 tracking-tight text-[#FFFFFF]">
            Import Git Repository
          </h1>
          <RepoList
            repositories={repos}
            isLoading={reposLoading}
            onSelectRepo={handleRepoSelect}
          />
        </>
      ) : (
        <ConfigureProject
          selectedRepo={selectedRepo}
          formData={formData}
          handleFormChange={handleFormChange}
          onBack={clearSelection}
          onDeploy={handleSubmit}
          isDeploying={submitting}
        />
      )}
    </div>
  )
}
