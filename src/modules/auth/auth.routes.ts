import { Router } from 'express'
import { authController } from './auth.controller'
import { authenticate } from '../../middleware/auth.middleware'

const router = Router()

// POST /api/auth/register — creates account, sends OTP email
router.post('/register', authController.register)

// POST /api/auth/login — email/password login
router.post('/login', authController.login)

// POST /api/auth/verify-otp — verifies the 6-digit code, returns JWT
router.post('/verify-otp', authController.verifyOtp)

// POST /api/auth/google — Google OAuth one-click login/register
router.post('/google', authController.googleLogin)

// GET  /api/auth/me (protected)
router.get('/me', authenticate, authController.getMe)

export default router
