const { GoogleGenAI } = require("@google/genai")
const OpenAI = require("openai")
const Groq = require("groq-sdk")
require("dotenv").config()

// Timeout wrapper thatprevents silent hangs
const withTimeout = (promise, ms, modelName) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error(`${modelName} timed out after ${ms}ms`)),
        ms,
      ),
    ),
  ])


const callGemini = async (prompt) => {
  if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not set")
  const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

  const response = await withTimeout(
    genai.models.generateContent({
      model: "gemini-3.6-flash",
      contents: prompt,
      config: { temperature: 0.7, maxOutputTokens: 1024 },
    }),
    8000,
    "GEMINI",
  )

  // response
  const text =
    typeof response.text === "function" ? response.text() : response.text
  if (!text) throw new Error("Gemini returned empty response")
  return text
}

const callOpenAI = async (prompt) => {
  if (!process.env.OPENAI_API) throw new Error("OPENAI_API not set")
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API })

  const response = await withTimeout(
    openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are NexAI, an expert assistant for the NexForge deployment platform.",
        },
        { role: "user", content: prompt },
      ],
    }),
    8000,
    "OPENAI",
  )
  return response.choices[0].message.content
}

const callGroq = async (prompt) => {
  if (!process.env.GROQ_API_KEY) throw new Error("GROQ_API_KEY not set")
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

  const response = await withTimeout(
    groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "You are NexAI, an expert assistant for the NexForge deployment platform.",
        },
        { role: "user", content: prompt },
      ],
    }),
    8000,
    "GROQ",
  )
  return response.choices[0].message.content
}

const callXAI = async (prompt) => {
  if (!process.env.GROK_API_KEY) throw new Error("GROK_API_KEY not set")
  const xai = new OpenAI({
    apiKey: process.env.GROK_API_KEY,
    baseURL: "https://api.x.ai/v1",
  })

  const response = await withTimeout(
    xai.chat.completions.create({
      model: "grok-3-mini",
      messages: [
        {
          role: "system",
          content:
            "You are NexAI, an expert assistant for the NexForge deployment platform.",
        },
        { role: "user", content: prompt },
      ],
    }),
    8000,
    "XAI",
  )
  return response.choices[0].message.content
}

// Model Dictionary

const MODEL_MAP = {
  GROQ: callGroq,
  GEMINI: callGemini,
  OPENAI: callOpenAI,
  XAI: callXAI,
}


const generateAIResponse = async (prompt) => {
  const primary = (process.env.AI_MODEL || "GROQ").toUpperCase()


  const allModels = Object.keys(MODEL_MAP)
  const orderedModels = [primary, ...allModels.filter((m) => m !== primary)]

  const errors = []

  for (const modelName of orderedModels) {
    const caller = MODEL_MAP[modelName]
    if (!caller) continue
    try {
      console.log(`[AI] Trying model: ${modelName}`)
      const result = await caller(prompt)
      if (modelName !== primary) {
        console.log(`[AI] Fallback to ${modelName} succeeded`)
      } else {
        console.log(`[AI] ${modelName} responded successfully`)
      }
      return result
    } catch (err) {
      console.warn(`[AI] ${modelName} failed: ${err.message}`)
      errors.push(`${modelName}: ${err.message}`)
    }
  }

  // All models failed
  throw new Error(`All AI models failed.\n${errors.join("\n")}`)
}

module.exports = { generateAIResponse }
