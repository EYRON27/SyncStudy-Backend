import { Router } from 'express'
import { aiController } from './ai.controller'
import { authenticate } from '../../middleware/auth.middleware'

const router = Router()

router.use(authenticate)

router.get('/chats', aiController.getChats)
router.get('/chats/:chatId/messages', aiController.getChatMessages)
router.delete('/chats/:chatId', aiController.deleteChat)
router.post('/ask', aiController.askAI)

export default router
