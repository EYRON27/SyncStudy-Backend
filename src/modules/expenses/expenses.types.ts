import { z } from 'zod'

export const createExpenseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  category: z.string().min(1, 'Category is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  type: z.enum(['expense', 'income']),
})

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>
