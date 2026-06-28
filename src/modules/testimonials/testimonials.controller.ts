import { Request, Response, NextFunction } from 'express'
import { testimonialsService } from './testimonials.service'
import { createTestimonialSchema } from './testimonials.types'
import { success } from '../../utils/response'

export const testimonialsController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await testimonialsService.getAll()
      return success({ res, data })
    } catch (err) {
      next(err)
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const input = createTestimonialSchema.parse(req.body)
      const data = await testimonialsService.create(input)
      return success({ res, statusCode: 201, message: 'Testimonial added successfully', data })
    } catch (err) {
      next(err)
    }
  }
}
