const mongoose = require("mongoose")
const Metric = require("../models/metric.model")
const Project = require("../models/project.model")
const { getCache, setCache } = require("../services/redis.service")

const getProjectAnalytics = async (req, res) => {
  try {
    const { id } = req.params
    const { range } = req.query // Query format constraints: '1h', '24h', '7d'

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project query parameter layout.",
      })
    }

    const cacheKey = `analytics:${id}:${range || "1h"}`
    const cachedData = await getCache(cacheKey)
    if (cachedData) {
      return res.status(200).json(cachedData)
    }

    // check if project exists
    const project = await Project.findById(id)
    if (!project) {
      return res.status(404).json({ message: "Project not found" })
    }

    let timeWindow = new Date()
    let groupingFormat = "%Y-%m-%d %H:%M" // Default time format: minute-by-minute

    // calculate time window and grouping based on range
    if (range === "24h") {
      timeWindow.setHours(timeWindow.getHours() - 24)
      groupingFormat = "%Y-%m-%d %H:00" // group by hour
    } else if (range === "7d") {
      timeWindow.setDate(timeWindow.getDate() - 7)
      groupingFormat = "%Y-%m-%d" // Daily grouping maps
    } else {
      // Default: Last 1 Hour
      timeWindow.setHours(timeWindow.getHours() - 1)
    }

    // get metrics using aggregation pipeline
    const performanceMatrixStack = await Metric.aggregate([
      {
        $match: {
          projectId: new mongoose.Types.ObjectId(id),
          timestamp: { $gte: timeWindow },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: groupingFormat, date: "$timestamp" },
          },
          avgCpu: { $avg: "$metrics.cpuUsage" },
          avgRam: { $avg: "$metrics.ramUsage" },
          avgLatency: { $avg: "$metrics.latency" },
          totalErrors: { $sum: "$metrics.status5xx" },
        },
      },
      { $sort: { _id: 1 } }, // sort chronologically
    ])

    const responseData = {
      success: true,
      timeWindowRequested: range || "1h",
      dataCount: performanceMatrixStack.length,
      metricsTimeline: performanceMatrixStack,
    }

    // Cache the analytics result for 5 minutes
    await setCache(cacheKey, responseData, 300)

    return res.status(200).json(responseData)
  } catch (error) {
    console.error("error getting analytics:", error)
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message })
  }
}

module.exports = {
  getProjectAnalytics,
}
