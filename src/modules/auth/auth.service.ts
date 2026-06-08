import { prisma } from '../../lib/prisma'
import { hashPassword, comparePassword } from '../../utils/hash'
import { signToken } from '../../utils/jwt'
import { createError } from '../../middleware/error.middleware'
import { RegisterInput, LoginInput } from './auth.types'

export const authService = {
  /**
   * Create a new user account
   */
  async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } })
    if (existing) throw createError('Email already in use', 409)

    const hashed = await hashPassword(input.password)
    const user = await prisma.user.create({
      data: { name: input.name, email: input.email, password: hashed },
      select: { id: true, name: true, email: true, avatarUrl: true, createdAt: true },
    })

    const token = signToken({ userId: user.id, email: user.email })
    return { user, token }
  },

  /**
   * Authenticate an existing user
   */
  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: input.email } })
    if (!user) throw createError('Invalid credentials', 401)

    const valid = await comparePassword(input.password, user.password)
    if (!valid) throw createError('Invalid credentials', 401)

    const { password: _, ...safeUser } = user
    const token = signToken({ userId: user.id, email: user.email })
    return { user: safeUser, token }
  },

  /**
   * Get the currently authenticated user's profile
   */
  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, avatarUrl: true, createdAt: true },
    })
    if (!user) throw createError('User not found', 404)
    return user
  },
}
