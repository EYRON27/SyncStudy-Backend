import { Request, Response, NextFunction } from 'express'
import { env } from '../config/env'

export interface AppError extends Error {
  statusCode?: number
  isOperational?: boolean
}

/**
 * Global error handling middleware.
 * Must be registered LAST in the Express middleware chain.
 */
export const errorHandler = (
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const statusCode = err.statusCode ?? 500
  const message = err.isOperational ? err.message : 'Internal server error'

  if (env.NODE_ENV === 'development') {
    console.error('❌ Error:', err)
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}

/**
 * Convenience: create a typed operational error
 */
export const createError = (message: string, statusCode = 500): AppError => {
  const err: AppError = new Error(message)
  err.statusCode = statusCode
  err.isOperational = true
  return err
}
