import { Request, Response, NextFunction } from 'express'
import { success } from '../../utils/response'
import { schedulerService } from './scheduler.service'

export const schedulerController = {
  async triggerDueTasks(req: Request, res: Response, next: NextFunction) {
    try {
      // Manually trigger the check for testing
      const count = await schedulerService.checkDueTasks()
      return success({ res, message: `Manual trigger successful. Sent ${count} notifications.` })
    } catch (err) {
      next(err)
    }
  }
}
