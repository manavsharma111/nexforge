import axiosInstance from "../utils/axiosInstance"

const getProjectAnalytics = async (projectId, range = "1h") => {
  const response = await axiosInstance.get(
    `/analytics/${projectId}?range=${range}`,
  )
  return response.data
}

const analyticsService = {
  getProjectAnalytics,
}

export default analyticsService
