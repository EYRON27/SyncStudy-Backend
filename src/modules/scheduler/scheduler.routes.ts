import { Router } from 'express'
import { schedulerController } from './scheduler.controller'

const router = Router()

// Bypassing authentication so we can easily test via cURL
router.post('/trigger-due-tasks', schedulerController.triggerDueTasks)

export default router
