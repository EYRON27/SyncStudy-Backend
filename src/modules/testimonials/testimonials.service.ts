import { prisma } from '../../lib/prisma'
import { CreateTestimonialInput } from './testimonials.types'

export const testimonialsService = {
  async getAll() {
    return prisma.testimonial.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20
    })
  },

  async create(input: CreateTestimonialInput) {
    // Generate initials (e.g. "Sarah Chen" -> "SC")
    const words = input.name.split(' ').filter(Boolean)
    const initials = words.length > 1 
      ? words[0][0] + words[words.length - 1][0]
      : words[0].slice(0, 2)
    
    return prisma.testimonial.create({
      data: {
        ...input,
        initials: initials.toUpperCase()
      }
    })
  }
}
