import { prisma } from '../../lib/prisma'
import { hashPassword, comparePassword } from '../../utils/hash'
import { signToken } from '../../utils/jwt'
import { createError } from '../../middleware/error.middleware'
import { sendOtpEmail } from '../../utils/email'
import { RegisterInput, LoginInput, VerifyOtpInput, GoogleAuthInput } from './auth.types'
import { OAuth2Client } from 'google-auth-library'

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

/** Generate a random 6-digit OTP code */
function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export const authService = {
  /**
   * Create a new user account and send OTP verification email.
   * Does NOT return a token — user must verify OTP first.
   */
  async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } })
    if (existing) throw createError('Email already in use', 409)

    const hashed = await hashPassword(input.password)
    const user = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        password: hashed,
        provider: 'email',
        isVerified: false,
      },
      select: { id: true, name: true, email: true, avatarUrl: true, createdAt: true },
    })

    // Generate a 6-digit OTP, valid for 10 minutes
    const code = generateOtp()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 min
    await prisma.otpCode.create({
      data: { email: user.email, code, expiresAt, userId: user.id }
    })

    // Send email (non-blocking)
    await sendOtpEmail(user.email, code, user.name)

    return { email: user.email, message: 'OTP sent to your email. Please verify.' }
  },

  /**
   * Verify a 6-digit OTP and log the user in by returning a JWT token
   */
  async verifyOtp(input: VerifyOtpInput) {
    const user = await prisma.user.findUnique({ where: { email: input.email } })
    if (!user) throw createError('User not found', 404)

    const otp = await prisma.otpCode.findFirst({
      where: {
        email: input.email,
        code: input.code,
        used: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' }
    })

    if (!otp) throw createError('Invalid or expired OTP code', 401)

    // Mark OTP as used and verify user
    await prisma.otpCode.update({ where: { id: otp.id }, data: { used: true } })
    await prisma.user.update({ where: { id: user.id }, data: { isVerified: true } })

    const { password: _, ...safeUser } = user
    const token = signToken({ userId: user.id, email: user.email })
    return { user: { ...safeUser, isVerified: true }, token }
  },

  /**
   * Authenticate an existing user via email/password
   */
  async login(input: LoginInput) {
    const user = await prisma.user.findUnique({ where: { email: input.email } })
    if (!user) throw createError('Invalid credentials', 401)
    if (user.provider === 'google') throw createError('Please sign in with Google', 400)
    if (!user.password) throw createError('Invalid credentials', 401)

    const valid = await comparePassword(input.password, user.password)
    if (!valid) throw createError('Invalid credentials', 401)

    if (!user.isVerified) throw createError('Please verify your email before logging in', 403)

    const { password: _, ...safeUser } = user
    const token = signToken({ userId: user.id, email: user.email })
    return { user: safeUser, token }
  },

  /**
   * Sign in or register via Google OAuth token (from frontend)
   */
  async googleLogin(input: GoogleAuthInput) {
    // Verify the Google Access Token by fetching the user's profile
    const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${input.googleToken}` },
    })

    if (!response.ok) {
      throw createError('Invalid Google access token', 401)
    }

    const payload = await response.json() as any
    if (!payload || !payload.email) throw createError('Could not retrieve email from Google', 401)

    const { email, name, picture } = payload

    // Upsert: find existing user or create new one
    let user = await prisma.user.findUnique({ where: { email } })

    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name: name ?? 'Google User',
          avatarUrl: picture,
          provider: 'google',
          isVerified: true, // Google already verified their email
        }
      })
    } else if (user.provider === 'email') {
      // User signed up with email — link Google to their account
      user = await prisma.user.update({
        where: { id: user.id },
        data: { avatarUrl: picture ?? user.avatarUrl, isVerified: true }
      })
    }

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
      select: { id: true, name: true, email: true, avatarUrl: true, isVerified: true, provider: true, createdAt: true },
    })
    if (!user) throw createError('User not found', 404)
    return user
  },
}
