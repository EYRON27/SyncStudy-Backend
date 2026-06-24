import { Router } from 'express'
import { tasksController } from './tasks.controller'
import { requireAuth } from '../../middleware/auth.middleware'

const router = Router()

router.use(requireAuth)

router.get('/', tasksController.getTasks)
router.post('/', tasksController.createTask)
router.patch('/:taskId', tasksController.updateTask)
router.delete('/:taskId', tasksController.deleteTask)

export default router
