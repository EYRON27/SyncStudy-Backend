import { Response, NextFunction } from 'express'
import { AuthRequest } from '../../types'
import { aiService } from './ai.service'
import { success } from '../../utils/response'

export const aiController = {
  async askAI(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { prompt, subject, chatId } = req.body
      
      if (!prompt) {
        res.status(400).json({ success: false, message: 'Prompt is required' })
        return
      }

      const result = await aiService.askAI(req.user!.userId, prompt, subject, chatId)
      return success({ res, data: result })
    } catch (error) {
      next(error)
    }
  },

  async getChats(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const result = await aiService.getChats(req.user!.userId)
      return success({ res, data: result })
    } catch (error) {
      next(error)
    }
  },

  async getChatMessages(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const chatId = req.params.chatId as string
      const result = await aiService.getChatMessages(req.user!.userId, chatId)
      return success({ res, data: result })
    } catch (error) {
      next(error)
    }
  },

  async deleteChat(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const chatId = req.params.chatId as string
      const result = await aiService.deleteChat(req.user!.userId, chatId)
      return success({ res, data: result })
    } catch (error) {
      next(error)
    }
  }
}
