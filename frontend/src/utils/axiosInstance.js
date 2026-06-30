import axios from "axios"

const API_URL = import.meta.env.VITE_BACKEND_URL

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
})

// request ke sath token bhej do agar available hai
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// agar token expire ho gaya toh chupke se refresh karke retry maar do
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // 401 aaye toh bas ek baar retry karna hai, warna loop lag jayega
    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true

      try {
        // normal axios use karo warna ye bhi interceptor me ghum jayega
        const response = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          {
            withCredentials: true,
          },
        )

        const newToken = response.data.accessToken

        if (newToken) {
          localStorage.setItem("accessToken", newToken)

          // naya token laga ke purani request wapas chala do
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return axiosInstance(originalRequest)
        }
      } catch (refreshError) {
        console.error("Session expired. Please log in again.")
        localStorage.removeItem("accessToken")
        
        // public routes list jahan redirect nahi karna chahiye
        const publicRoutes = ["/", "/login", "/home"]
        const currentPath = window.location.pathname
        
        // agar pehle se login page pe hain ya koi public route pe hain toh redirect mat karna
        if (!publicRoutes.includes(currentPath) && !currentPath.startsWith("/auth")) {
          window.location.href = "/login"
        }
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

export { API_URL }
export default axiosInstance
