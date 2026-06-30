import { Response, NextFunction } from 'express'
import { AuthRequest } from '../../types'
import { notificationsService } from './notifications.service'
import { success } from '../../utils/response'

export const notificationsController = {
  async getNotifications(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const data = await notificationsService.getNotifications(userId)
      return success({ res, data })
    } catch (err) {
      next(err)
    }
  },

  async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const id = req.params.id as string
      await notificationsService.markAsRead(userId, id)
      return success({ res, message: 'Notification marked as read' })
    } catch (err) {
      next(err)
    }
  },

  async markAllAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      await notificationsService.markAllAsRead(userId)
      return success({ res, message: 'All notifications marked as read' })
    } catch (err) {
      next(err)
    }
  }
}
