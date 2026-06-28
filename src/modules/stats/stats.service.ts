import { prisma } from '../../lib/prisma'

export const statsService = {
  async getLandingStats() {
    const [usersCount, roomsCount, avgRatingResult] = await Promise.all([
      prisma.user.count(),
      prisma.room.count(),
      prisma.testimonial.aggregate({
        _avg: {
          rating: true
        }
      })
    ])

    // If avg rating is null (no testimonials), default to 5.0
    const rawAvg = avgRatingResult._avg.rating || 5
    const avgRating = Number(rawAvg.toFixed(1))

    return {
      usersCount,
      roomsCount,
      avgRating
    }
  }
}
