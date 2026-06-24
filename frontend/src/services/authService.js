import axiosInstance, { API_URL } from "../utils/axiosInstance"

// login with github
const GithubLogin = () => {
  window.location.href = `${API_URL}/auth/github`
}
// get current logged in user profile
const getMe = async () => {
  const response = await axiosInstance.get("/auth/me")
  return response.data
}

// logout user
const logoutUser = async () => {
  const response = await axiosInstance.post("/auth/logout")
  return response.data
}

// refresh access token
const refreshAccessToken = async () => {
  const response = await axiosInstance.post("/auth/refresh")
  return response.data
}

const authService = {
  GithubLogin,
  getMe,
  logoutUser,
  refreshAccessToken,
}

export default authService
