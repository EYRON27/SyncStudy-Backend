import { Router } from 'express'
import { roomsController } from './rooms.controller'
import { authenticate } from '../../middleware/auth.middleware'

const router = Router()

router.use(authenticate)

router.get('/', roomsController.getRooms)
router.post('/', roomsController.createRoom)
router.post('/join', roomsController.joinRoom)
router.get('/:roomId', roomsController.getRoomById)
router.delete('/:roomId', roomsController.deleteRoom)

export default router
