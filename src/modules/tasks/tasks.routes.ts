import { Router } from 'express'
import { tasksController } from './tasks.controller'
import { authenticate } from '../../middleware/auth.middleware'

const router = Router()

router.use(authenticate)

router.get('/', tasksController.getTasks)
router.post('/', tasksController.createTask)
router.patch('/:taskId', tasksController.updateTask)
router.delete('/:taskId', tasksController.deleteTask)

export default router
