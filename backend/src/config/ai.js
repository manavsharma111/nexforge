const { GoogleGenAI } = require("@google/genai")
const OpenAI = require("openai")
const Groq = require("groq-sdk")
const dotenv = require('dotenv').config()


const generateAIResponse = async (req, res) => {
    // Gemini
    if (process.env.AI_MODEL === "GEMINI") {
        const genai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

        try {
            const response = await genai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: req.body.prompt,
                config: {
                    temperature: 0.5,
                    maxOutputTokens: 100,
                }
            })

            return response.text
        }
        catch (error) {
            console.log(`Error generating content from Gemini - ${error.message}`);
            return res.status(500).json({ message: "Failed to generate content from Gemini" })
        }
    }
    // Open AI 

    else if(process.env.AI_MODEL === "OPENAI") {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

        try {
            const response = await openai.chat.completions.create({
                model: "gpt-4.1",
                messages: [
                    { role: "system", content: "You are a helpful assistant." },
                    { role: "user", content: req.body.prompt }
                ]
            })

            return response.choices[0].message.content
        }
        catch (error) {
            console.log(`Error generating content from Open AI - ${error.message}`);
            return res.status(500).json({ message: "Failed to generate content from Open AI" })
        }
    }
    // Groq
    else if(process.env.AI_MODEL === "GROQ") {
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

        try {
            const response = await groq.chat.completions.create({
                model: "llama3-8b-8192",
                messages: [
                    { role: "system", content: "You are a helpful assistant." },
                    { role: "user", content: req.body.prompt }
                ]
            })

            return response.choices[0].message.content
        }
        catch (error) {
            console.log(`Error generating content from Groq - ${error.message}`);
            return res.status(500).json({ message: "Failed to generate content from Groq" })
        }
    }
    // xAI
    else if(process.env.AI_MODEL === "XAI") {
        const xai = new OpenAI({ apiKey: process.env.XAI_API_KEY, baseURL: "https://api.x.ai/v1" })

        try {
            const response = await xai.chat.completions.create({
                model: "gpt-4.1",
                messages: [
                    { role: "system", content: "You are a helpful assistant." },
                    { role: "user", content: req.body.prompt }
                ]
            })

            return response.choices[0].message.content
        }
        catch (error) {
            console.log(`Error generating content from xAI - ${error.message}`);
            return res.status(500).json({ message: "Failed to generate content from xAI" })
        }
    }
    // Invalid AI Model
    else {
        return res.status(500).json({ message: "Invalid AI Model" })
    }
}

module.exports = { generateAIResponse }
