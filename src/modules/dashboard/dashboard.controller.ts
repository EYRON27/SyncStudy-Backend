import { Response, NextFunction } from 'express'
import { AuthRequest } from '../../types'
import { dashboardService } from './dashboard.service'
import { success } from '../../utils/response'

export const dashboardController = {
  async getDashboard(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const data = await dashboardService.getDashboardData(req.user!.userId)
      return success({ res, data })
    } catch (error) {
      next(error)
    }
  }
}
