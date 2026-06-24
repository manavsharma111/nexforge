const mongoose = require("mongoose")

const metricSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "project",
      required: true,
      index: true,
    },
    metrics: {
      cpuUsage: {
        type: Number,
        default: 0,
        required: true,
      },

      ramUsage: {
        type: Number,
        default: 0,
        required: true,
      },
      latency: {
        type: Number,
        required: true,
      },
      status5xx: {
        type: Number,
        default: 0,
      },

      installDuration: {
        type: Number,
        default: 0,
      },
      buildDuration: {
        type: Number,
        default: 0,
      },
      deployDuration: {
        type: Number,
        default: 0,
      },
      totalDuration: {
        type: Number,
        default: 0,
      },
    },
    timeStamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timeseries: {
      timeField: "timeStamp",
      metaField: "projectId",
      granularity: "seconds",
    },
  },
)

module.exports = mongoose.model("metric", metricSchema)
