import { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { fetchGithubRepos } from "../redux/slices/githubSlice"

export const useGithubImport = () => {
  const dispatch = useDispatch()
  const { repositories, isLoading: isFetchingRepos } = useSelector(
    (state) => state.github,
  )

  const [selectedRepo, setSelectedRepo] = useState(null)
  const [formData, setFormData] = useState({
    projectName: "",
    framework: "React",
    rootDirectory: "./",
    installCommand: "npm install",
    buildCommand: "npm run build",
    outputDirectory: "dist",
    projectType: "STATIC",
    internalPort: "",
    environmentVariables: [{ key: "", value: "" }],
  })

  useEffect(() => {
    dispatch(fetchGithubRepos())
  }, [dispatch])

  const selectRepo = (repo) => {
    setSelectedRepo(repo)
    setFormData((prev) => ({
      ...prev,
      projectName: repo.name,
    }))
  }

  const clearSelection = () => {
    setSelectedRepo(null)
  }

  const handleFormChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }))
  }

  return {
    repositories,
    isFetchingRepos,
    selectedRepo,
    selectRepo,
    clearSelection,
    formData,
    handleFormChange,
  }
}
