import { Router } from 'express'
import { messagesController } from './messages.controller'
import { authenticate } from '../../middleware/auth.middleware'

const router = Router({ mergeParams: true })

router.use(authenticate)

// GET /api/rooms/:roomId/messages
router.get('/', messagesController.getMessages)

export default router
