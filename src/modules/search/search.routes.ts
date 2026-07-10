import { Router } from 'express'
import { searchController } from './search.controller'
import { authenticate } from '../../middleware/auth.middleware'

const router = Router()

router.get('/', authenticate, searchController.search)

export default router
