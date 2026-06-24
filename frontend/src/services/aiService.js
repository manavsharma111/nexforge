import axiosInstance from "../utils/axiosInstance"

const getAI = async (prompt) => {
    try {
        const response = await axiosInstance.post("/ai/AskAI", { prompt })
        return response.data
    }
    catch (error) {
        console.error(`Error getting AI response - ${error.message}`)
        throw error
    }
}

export { getAI }
