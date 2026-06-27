import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const verifyOtpSchema = z.object({
  email: z.string().email('Invalid email address'),
  code: z.string().length(6, 'OTP code must be 6 digits'),
})

export const googleAuthSchema = z.object({
  googleToken: z.string().min(1, 'Google token is required'),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>
export type GoogleAuthInput = z.infer<typeof googleAuthSchema>

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
  code: z.string().length(6, 'OTP code must be 6 digits'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
})

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
