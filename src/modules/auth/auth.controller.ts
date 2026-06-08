import { Response, NextFunction } from 'express'
import { authService } from './auth.service'
import { registerSchema, loginSchema } from './auth.types'
import { success } from '../../utils/response'
import { AuthRequest } from '../../types'

export const authController = {
  async register(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const input = registerSchema.parse(req.body)
      const result = await authService.register(input)
      success({ res, statusCode: 201, message: 'Account created successfully', data: result })
    } catch (err) {
      next(err)
    }
  },

  async login(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const input = loginSchema.parse(req.body)
      const result = await authService.login(input)
      success({ res, message: 'Login successful', data: result })
    } catch (err) {
      next(err)
    }
  },

  async getMe(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const user = await authService.getMe(req.user!.userId)
      success({ res, data: user })
    } catch (err) {
      next(err)
    }
  },
}
