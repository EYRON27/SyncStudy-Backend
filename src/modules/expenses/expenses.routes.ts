import { Router } from 'express'
import { expensesController } from './expenses.controller'
import { authenticate } from '../../middleware/auth.middleware'

const router = Router()

router.use(authenticate)

router.get('/', expensesController.getExpenses)
router.post('/', expensesController.createExpense)
router.delete('/:id', expensesController.deleteExpense)

export default router
