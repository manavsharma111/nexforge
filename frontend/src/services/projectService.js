import axiosInstance from "../utils/axiosInstance"

const createProject = async (projectData) => {
  const response = await axiosInstance.post("/projects/create", projectData)
  return response.data
}

const deployProject = async (projectId) => {
  const response = await axiosInstance.post("/projects/deploy", { projectId })
  return response.data
}

const getAllProjects = async () => {
  const response = await axiosInstance.get("/projects")
  return response.data
}

const getProjectById = async (id) => {
  const response = await axiosInstance.get(`/projects/${id}`)
  return response.data
}

const updateProject = async (id, projectData) => {
  const response = await axiosInstance.put(`/projects/${id}`, projectData)
  return response.data
}

const deleteProject = async (id) => {
  const response = await axiosInstance.delete(`/projects/${id}`)
  return response.data
}

const projectService = {
  createProject,
  deployProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
}

export default projectService
