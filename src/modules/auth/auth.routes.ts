import { Router } from 'express'
import { authController } from './auth.controller'
import { authenticate } from '../../middleware/auth.middleware'

const router = Router()

// POST /api/auth/register
router.post('/register', authController.register)

// POST /api/auth/login
router.post('/login', authController.login)

// GET  /api/auth/me  (protected)
router.get('/me', authenticate, authController.getMe)

export default router
