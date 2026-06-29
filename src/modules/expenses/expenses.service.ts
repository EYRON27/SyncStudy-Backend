import { prisma } from '../../lib/prisma'
import { CreateExpenseInput } from './expenses.types'

export const expensesService = {
  async getExpenses(userId: string) {
    return prisma.expense.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    })
  },

  async createExpense(userId: string, input: CreateExpenseInput) {
    return prisma.expense.create({
      data: {
        ...input,
        userId,
      },
    })
  },

  async deleteExpense(userId: string, expenseId: string) {
    const expense = await prisma.expense.findUnique({
      where: { id: expenseId }
    })
    
    if (!expense || expense.userId !== userId) {
      throw new Error('Expense not found or unauthorized')
    }

    return prisma.expense.delete({
      where: { id: expenseId },
    })
  }
}
