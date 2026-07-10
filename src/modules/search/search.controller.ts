import { Response, NextFunction } from 'express'
import { AuthRequest } from '../../types'
import { searchService } from './search.service'
import { success } from '../../utils/response'

export const searchController = {
  async search(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const { q } = req.query
      if (!q || typeof q !== 'string') {
        return success({ res, data: [] })
      }
      
      const results = await searchService.globalSearch(req.user!.userId, q)
      return success({ res, data: results })
    } catch (error) {
      next(error)
    }
  }
}
