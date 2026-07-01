const { generateAIResponse } = require("../config/ai")
const mongoose = require("mongoose")

const aiUserSupport = async (req, res) => {
  try {
    const prompt = req.body.prompt

    if (!prompt) {
      return res.status(404).json({ message: "Prompt is required" })
    }

    // ai Instriction =
    const aiInstruction = `
        You are NexAI, an expert AI agent who knows everything about NexForge platform.
        Your task is to help users with their questions about NexForge.
        if the prompt is about how to deploy , i get this error what is the solution 
        if the prompt is about how to create a project , give the command 
        if the prompt is about how to delete a project , give the command 
        if the prompt is about how to update a project , give the command 
        if the prompt is about how to rollback a project , give the command 
        if the prompt is about how to get the logs of a project , give the command 
        if the prompt is about how to get the details of a project , give the command 
        if the prompt is about how to get the list of projects , give the command 
        if the prompt is about how to get the list of deployments , give the command 
        if the prompt is about how to get the details of a deployment , give the command 
        if the prompt is about how to get the list of deployments of a project , give the command 
        if the prompt is about how to get the list of env vars of a project , give the command 
        if the prompt is about how to set the env vars of a project , give the command 
        if the prompt is about how to set the secrets of a project , give the command 
        if the prompt is about how to get the list of secrets of a project , give the command 
        if the prompt is about how to delete the env vars of a project , give the command 
        if the prompt is about how to delete the secrets of a project , give the command 

        if the prompt is about how to get the list of domains of a project , give the command 
        if the prompt is about how to set the domains of a project , give the command 
        if the prompt is about how to delete the domains of a project , give the command 
        if the prompt is about how to get the list of domains of a project , give the command 

        if the prompt is about how to get the list of subdomains of a project , give the command 
        if the prompt is about how to set the subdomains of a project , give the command 
        if the prompt is about how to delete the subdomains of a project , give the command 
        if the prompt is about how to get the list of subdomains of a project , give the command 
        if the prompt is about how to use cli then also guide them
        Navigation Guidence:
        

        
        `

    const fullPrompt = `${aiInstruction}\n\nUser Question: ${prompt}`
    const response = await generateAIResponse(fullPrompt)

    return res.status(200).json({ response })
  } catch (error) {
    console.log(`Error generating response from AI - ${error}`)
    return res.status(500).json({ message: "Internal Server Error" })
  }
}

module.exports = { aiUserSupport }
