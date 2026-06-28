import { Router } from 'express'
import { testimonialsController } from './testimonials.controller'

const router = Router()

router.get('/', testimonialsController.getAll)
router.post('/', testimonialsController.create)

export default router
