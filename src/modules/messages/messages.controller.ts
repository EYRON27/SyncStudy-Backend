import { Response, NextFunction } from 'express'
import { AuthRequest } from '../../types'
import { messagesService } from './messages.service'

export const messagesController = {
  async getMessages(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const roomId = req.params.roomId as string
      const page = parseInt(req.query.page as string) || 1
      const limit = parseInt(req.query.limit as string) || 50

      const messages = await messagesService.getMessages(userId, roomId, page, limit)
      res.json({ success: true, data: messages })
    } catch (err) {
      next(err)
    }
  }
}
