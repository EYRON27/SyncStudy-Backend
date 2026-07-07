import { GoogleGenerativeAI } from '@google/generative-ai'
import { createError } from '../../middleware/error.middleware'

// Initialize the Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export const aiService = {
  /**
   * Ask the AI a question based on a prompt and optional subject
   */
  async askAI(userId: string, prompt: string, subject?: string) {
    if (!process.env.GEMINI_API_KEY) {
      throw createError('Gemini API key is not configured. Please add GEMINI_API_KEY to your .env file.', 500)
    }

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
      
      const systemContext = `You are SyncStudy AI, a helpful, encouraging, and highly intelligent academic tutor. 
      Your goal is to help the user learn and understand concepts clearly. 
      ${subject ? `The user is currently studying: ${subject}. ` : ''}
      Keep your answers concise, well-formatted using markdown, and easy to read.`

      const finalPrompt = `${systemContext}\n\nUser Question:\n${prompt}`

      const result = await model.generateContent(finalPrompt)
      const response = await result.response
      const text = response.text()

      return { answer: text }
    } catch (error) {
      console.error('Gemini AI Error:', error)
      throw createError('Failed to generate AI response. Please try again later.', 500)
    }
  }
}
