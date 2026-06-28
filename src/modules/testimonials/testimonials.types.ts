import { z } from 'zod'

export const createTestimonialSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.string().min(2, 'Role must be at least 2 characters'),
  text: z.string().min(10, 'Testimonial must be at least 10 characters').max(300, 'Testimonial too long'),
  rating: z.number().int().min(1).max(5).default(5),
})

export type CreateTestimonialInput = z.infer<typeof createTestimonialSchema>
