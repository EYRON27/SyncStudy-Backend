import { GoogleGenerativeAI } from '@google/generative-ai'
import { createError } from '../../middleware/error.middleware'
import { prisma } from '../../lib/prisma'

// Initialize the Gemini client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export const aiService = {
  /**
   * Ask the AI a question based on a prompt and optional subject
   */
  async askAI(userId: string, prompt: string, subject?: string, chatId?: string) {
    if (!process.env.GEMINI_API_KEY) {
      throw createError('Gemini API key is not configured. Please add GEMINI_API_KEY to your .env file.', 500)
    }

    try {
      const systemContext = `You are SyncStudy AI, a helpful, encouraging, and highly intelligent academic tutor. 
      Your goal is to help the user learn and understand concepts clearly. 
      ${subject ? `The user is currently studying: ${subject}. ` : ''}
      Keep your answers concise, well-formatted using markdown, and easy to read.`

      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.5-flash',
        systemInstruction: systemContext 
      })
      
      // If no chatId, create a new chat
      let activeChatId = chatId
      let isNewChat = false
      if (!activeChatId) {
        isNewChat = true
        // Generate a title based on prompt (max 30 chars)
        const title = prompt.length > 30 ? prompt.substring(0, 30) + '...' : prompt
        const newChat = await prisma.aiChat.create({
          data: {
            title,
            userId
          }
        })
        activeChatId = newChat.id
      } else {
        // verify chat belongs to user
        const chat = await prisma.aiChat.findFirst({ where: { id: activeChatId, userId } })
        if (!chat) throw createError('Chat not found', 404)
      }

      // Save user prompt
      await prisma.aiMessage.create({
        data: {
          role: 'user',
          content: prompt,
          chatId: activeChatId
        }
      })

      // Fetch previous messages for context
      const prevMessages = await prisma.aiMessage.findMany({
        where: { chatId: activeChatId },
        orderBy: { createdAt: 'asc' },
        take: 20 // limit context size
      })

      // Build the chat history for Gemini
      const chatHistory = prevMessages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }]
      }))

      // The last message is the current prompt, so we don't need to add it again
      // We'll initialize a chat session
      const chatSession = model.startChat({
        history: chatHistory.slice(0, -1) // all but the latest we just inserted
      })

      const result = await chatSession.sendMessage(prompt)
      const text = await result.response.text()

      // Save AI response
      await prisma.aiMessage.create({
        data: {
          role: 'ai',
          content: text,
          chatId: activeChatId
        }
      })

      // return updated chat title if new
      let chatTitle = undefined
      if (isNewChat) {
         const c = await prisma.aiChat.findUnique({ where: { id: activeChatId }})
         chatTitle = c?.title
      }

      return { answer: text, chatId: activeChatId, chatTitle }
    } catch (error) {
      console.error('Gemini AI Error:', error)
      throw createError('Failed to generate AI response. Please try again later.', 500)
    }
  },

  async getChats(userId: string) {
    return prisma.aiChat.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' }
    })
  },

  async getChatMessages(userId: string, chatId: string) {
    const chat = await prisma.aiChat.findFirst({
      where: { id: chatId, userId }
    })
    if (!chat) throw createError('Chat not found', 404)

    return prisma.aiMessage.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' }
    })
  },

  async deleteChat(userId: string, chatId: string) {
    const chat = await prisma.aiChat.findFirst({
      where: { id: chatId, userId }
    })
    if (!chat) throw createError('Chat not found', 404)

    await prisma.aiChat.delete({
      where: { id: chatId }
    })
    return { success: true }
  }
}
