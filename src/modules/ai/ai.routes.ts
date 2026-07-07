import { Router } from 'express'
import { aiController } from './ai.controller'
import { authenticate } from '../../middleware/auth.middleware'

const router = Router()

router.use(authenticate)

router.post('/ask', aiController.askAI)

export default router
