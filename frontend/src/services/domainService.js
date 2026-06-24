import axiosInstance from "../utils/axiosInstance"

const createDomain = async (domainData) => {
  const response = await axiosInstance.post("/domains/create", domainData)
  return response.data
}

const getDomains = async () => {
  const response = await axiosInstance.get("/domains")
  return response.data
}

const getDomainById = async (id) => {
  const response = await axiosInstance.get(`/domains/${id}`)
  return response.data
}

const updateDomain = async (id, domainData) => {
  const response = await axiosInstance.put(`/domains/${id}`, domainData)
  return response.data
}

const deleteDomain = async (id) => {
  const response = await axiosInstance.delete(`/domains/${id}`)
  return response.data
}

const domainService = {
  createDomain,
  getDomains,
  getDomainById,
  updateDomain,
  deleteDomain,
}

export default domainService
