import { Router } from 'express'
import { statsController } from './stats.controller'

const router = Router()

router.get('/landing', statsController.getLandingStats)

export default router
