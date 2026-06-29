import { Response, NextFunction } from 'express'
import { AuthRequest } from '../../types'
import { expensesService } from './expenses.service'
import { createExpenseSchema } from './expenses.types'
import { success } from '../../utils/response'

export const expensesController = {
  async getExpenses(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const data = await expensesService.getExpenses(userId)
      return success({ res, data })
    } catch (err) {
      next(err)
    }
  },

  async createExpense(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const input = createExpenseSchema.parse(req.body)
      const data = await expensesService.createExpense(userId, input)
      return success({ res, statusCode: 201, message: 'Expense added', data })
    } catch (err) {
      next(err)
    }
  },

  async deleteExpense(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const id = req.params.id as string
      await expensesService.deleteExpense(userId, id)
      return success({ res, message: 'Expense deleted' })
    } catch (err) {
      next(err)
    }
  }
}
