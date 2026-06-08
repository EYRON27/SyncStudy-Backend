import { Response } from 'express'

interface SuccessPayload<T> {
  res: Response
  statusCode?: number
  message?: string
  data?: T
}

interface ErrorPayload {
  res: Response
  statusCode?: number
  message: string
}

/**
 * Send a standardised success response.
 *
 * @example
 * success({ res, data: user, message: 'User created' })
 */
export const success = <T>({ res, statusCode = 200, message = 'Success', data }: SuccessPayload<T>) => {
  return res.status(statusCode).json({ success: true, message, data })
}

/**
 * Send a standardised error response.
 *
 * @example
 * error({ res, statusCode: 404, message: 'User not found' })
 */
export const error = ({ res, statusCode = 500, message }: ErrorPayload) => {
  return res.status(statusCode).json({ success: false, message })
}
