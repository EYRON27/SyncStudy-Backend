import { Response, NextFunction } from 'express'
import { verifyToken } from '../utils/jwt'
import { error } from '../utils/response'
import { AuthRequest } from '../types'

/**
 * Middleware: validate Bearer JWT and attach decoded user to req.user
 */
export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    error({ res, statusCode: 401, message: 'Authorization token required' })
    return
  }

  const token = authHeader.split(' ')[1]

  try {
    const payload = verifyToken(token)
    req.user = { userId: payload.userId, email: payload.email }
    next()
  } catch {
    error({ res, statusCode: 401, message: 'Invalid or expired token' })
  }
}
