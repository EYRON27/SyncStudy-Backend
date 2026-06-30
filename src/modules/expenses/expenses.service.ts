import { prisma } from '../../lib/prisma'
import { CreateExpenseInput } from './expenses.types'
import { notificationsService } from '../notifications/notifications.service'

export const expensesService = {
  async getExpenses(userId: string) {
    return prisma.expense.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    })
  },

  async createExpense(userId: string, input: CreateExpenseInput) {
    const expense = await prisma.expense.create({
      data: {
        ...input,
        userId,
      },
    })
    
    // Trigger notification if expense is unusually large (e.g., over $1000)
    if (input.type === 'expense' && input.amount >= 1000) {
      await notificationsService.createNotification({
        userId,
        title: 'High Spending Alert',
        desc: `You just logged a high-value expense of $${input.amount} for ${input.category}. Keep an eye on your budget!`,
        type: 'alert'
      })
    }
    
    return expense
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
