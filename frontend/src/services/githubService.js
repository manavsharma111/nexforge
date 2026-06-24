import axiosInstance from "../utils/axiosInstance"

const getUserRepositories = async () => {
  const response = await axiosInstance.get("/github/repos")
  return response.data
}

const githubService = {
  getUserRepositories,
}

export default githubService
