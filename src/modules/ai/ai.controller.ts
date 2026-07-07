import { Response, NextFunction } from 'express'
import { AuthRequest } from '../../types'
import { aiService } from './ai.service'
import { success } from '../../utils/response'

export const aiController = {
  async askAI(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { prompt, subject } = req.body
      
      if (!prompt) {
        res.status(400).json({ success: false, message: 'Prompt is required' })
        return
      }

      const result = await aiService.askAI(req.user!.userId, prompt, subject)
      return success({ res, data: result })
    } catch (error) {
      next(error)
    }
  }
}
