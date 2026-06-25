const { GoogleGenAI } = require("@google/genai")
const OpenAI = require("openai")
const Groq = require("groq-sdk")
require('dotenv').config()

// ─── Individual model callers ───────────────────────────────────────────────

const callGemini = async (prompt) => {
    if (!process.env.GEMINI_API_KEY) throw new Error("GEMINI_API_KEY not set")
    const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
    const response = await genai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { temperature: 0.7, maxOutputTokens: 1024 }
    })
    return response.text
}

const callOpenAI = async (prompt) => {
    if (!process.env.OPENAI_API) throw new Error("OPENAI_API not set")
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API })
    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            { role: "system", content: "You are NexAI, an expert assistant for the NexForge deployment platform." },
            { role: "user", content: prompt }
        ]
    })
    return response.choices[0].message.content
}

const callGroq = async (prompt) => {
    if (!process.env.GROQ_API_KEY) throw new Error("GROQ_API_KEY not set")
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
    const response = await groq.chat.completions.create({
        model: "llama3-8b-8192",
        messages: [
            { role: "system", content: "You are NexAI, an expert assistant for the NexForge deployment platform." },
            { role: "user", content: prompt }
        ]
    })
    return response.choices[0].message.content
}

const callXAI = async (prompt) => {
    if (!process.env.GROK_API_KEY) throw new Error("GROK_API_KEY not set")
    const xai = new OpenAI({ apiKey: process.env.GROK_API_KEY, baseURL: "https://api.x.ai/v1" })
    const response = await xai.chat.completions.create({
        model: "grok-3-mini",
        messages: [
            { role: "system", content: "You are NexAI, an expert assistant for the NexForge deployment platform." },
            { role: "user", content: prompt }
        ]
    })
    return response.choices[0].message.content
}

// ─── Model registry ─────────────────────────────────────────────────────────

const MODEL_MAP = {
    GEMINI: callGemini,
    OPENAI: callOpenAI,
    GROQ:   callGroq,
    XAI:    callXAI,
}

// ─── Main: tries primary model, auto-falls back to others if it fails ────────
// Order: AI_MODEL env var (default GEMINI) → OPENAI → GROQ → XAI

const generateAIResponse = async (prompt) => {
    const primary = (process.env.AI_MODEL || "GEMINI").toUpperCase()

    // Primary first, then remaining models
    const allModels = Object.keys(MODEL_MAP)
    const orderedModels = [primary, ...allModels.filter(m => m !== primary)]

    const errors = []

    for (const modelName of orderedModels) {
        const caller = MODEL_MAP[modelName]
        if (!caller) continue
        try {
            console.log(`[AI] Trying model: ${modelName}`)
            const result = await caller(prompt)
            if (modelName !== primary) {
                console.log(`[AI] Fallback to ${modelName} succeeded`)
            }
            return result
        } catch (err) {
            console.warn(`[AI] ${modelName} failed: ${err.message}`)
            errors.push(`${modelName}: ${err.message}`)
        }
    }

    // All models failed
    throw new Error(`All AI models failed.\n${errors.join('\n')}`)
}

module.exports = { generateAIResponse }
