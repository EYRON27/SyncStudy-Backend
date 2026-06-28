import { Request, Response } from 'express'
import { statsService } from './stats.service'

export const statsController = {
  getLandingStats: async (req: Request, res: Response) => {
    try {
      const stats = await statsService.getLandingStats()
      res.json({ success: true, data: stats })
    } catch (error) {
      console.error('[statsController] getLandingStats error:', error)
      res.status(500).json({ success: false, message: 'Internal server error' })
    }
  }
}
