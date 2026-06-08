import { Request } from 'express'

// ─── Augmented Request with authenticated user ────────────────────────────────
export interface AuthRequest extends Request {
  user?: {
    userId: string
    email: string
  }
}

// ─── Standard API response shape ─────────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data?: T
}

// ─── Pagination ───────────────────────────────────────────────────────────────
export interface PaginationQuery {
  page?: string
  limit?: string
}

export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  limit: number
  hasNext: boolean
}
