import { prisma } from '../../lib/prisma'
import { createError } from '../../middleware/error.middleware'

export const messagesService = {
  /**
   * Get paginated message history for a room.
   * Validates that the requesting user is a member of the room.
   */
  async getMessages(userId: string, roomId: string, page = 1, limit = 50) {
    // Verify user is a member
    const membership = await prisma.roomMember.findUnique({
      where: { userId_roomId: { userId, roomId } }
    })
    if (!membership) throw createError('Not a member of this room', 403)

    const skip = (page - 1) * limit

    const messages = await prisma.message.findMany({
      where: { roomId },
      orderBy: { createdAt: 'asc' },
      skip,
      take: limit,
      include: {
        sender: {
          select: { id: true, name: true, avatarUrl: true }
        }
      }
    })

    return messages
  }
}
