const { createClient } = require("redis")

let redisClient
let isRedisConnected = false

// initailize redis client
const initRedis = async () => {
  try {
    redisClient = createClient({
      url:
        process.env.REDIS_URI ||
        process.env.REDIS_URL ||
        "redis://localhost:6379",
      socket: {
        reconnectStrategy: false,
      },
    })

    redisClient.on("error", () => {
      isRedisConnected = false
    })

    redisClient.on("connect", () => {
      console.log("connected to redis")
      isRedisConnected = true
    })

    await redisClient.connect()
  } catch (error) {
    isRedisConnected = false
  }
}

const getCache = async (key) => {
  if (!isRedisConnected || !redisClient) return null
  try {
    const data = await redisClient.get(key)
    if (data) {
      return JSON.parse(data)
    }
    return null
  } catch (error) {
    console.error("error reading cache", error.message)
    return null
  }
}

const setCache = async (key, value, ttl = 3600) => {
  if (!isRedisConnected || !redisClient) return
  try {
    const stringifiedValue = JSON.stringify(value)
    await redisClient.setEx(key, ttl, stringifiedValue)
  } catch (error) {
    console.error("error setting cache", error.message)
  }
}

const delCache = async (key) => {
  if (!isRedisConnected || !redisClient) return
  try {
    await redisClient.del(key)
  } catch (error) {
    console.error("error deleting cache", error.message)
  }
}

module.exports = {
  initRedis,
  getCache,
  setCache,
  delCache,
  getIsRedisConnected: () => isRedisConnected,
}
