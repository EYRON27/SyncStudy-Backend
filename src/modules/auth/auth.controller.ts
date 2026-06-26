import { Response, NextFunction } from 'express'
import { authService } from './auth.service'
import { registerSchema, loginSchema, verifyOtpSchema, googleAuthSchema } from './auth.types'
import { success } from '../../utils/response'
import { AuthRequest } from '../../types'

export const authController = {
  async register(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const input = registerSchema.parse(req.body)
      const result = await authService.register(input)
      // Returns { email, message } — NOT a token, user must verify OTP first
      success({ res, statusCode: 201, message: result.message, data: { email: result.email } })
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

  async verifyOtp(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const input = verifyOtpSchema.parse(req.body)
      const result = await authService.verifyOtp(input)
      success({ res, message: 'Email verified successfully', data: result })
    } catch (err) {
      next(err)
    }
  },

  async googleLogin(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const input = googleAuthSchema.parse(req.body)
      const result = await authService.googleLogin(input)
      success({ res, message: 'Google login successful', data: result })
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
