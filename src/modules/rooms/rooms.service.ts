import { prisma } from '../../lib/prisma'
import { createError } from '../../middleware/error.middleware'
import { CreateRoomInput, JoinRoomInput } from './rooms.types'

export const roomsService = {
  /**
   * Get all rooms a user is a member of
   */
  async getRooms(userId: string) {
    const memberships = await prisma.roomMember.findMany({
      where: { userId },
      include: {
        room: {
          include: {
            _count: {
              select: { members: true }
            }
          }
        }
      },
      orderBy: { joinedAt: 'desc' }
    })

    return memberships.map(m => m.room)
  },

  /**
   * Get a specific room by ID
   */
  async getRoomById(userId: string, roomId: string) {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        members: {
          include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } }
        }
      }
    })

    if (!room) throw createError('Room not found', 404)

    // Check if user is a member
    const isMember = room.members.some(m => m.userId === userId)
    if (!isMember) throw createError('Not authorized to access this room', 403)

    return room
  },

  /**
   * Create a new room
   */
  async createRoom(userId: string, input: CreateRoomInput) {
    // Generate a 6-character alphanumeric invite code
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()

    const room = await prisma.room.create({
      data: {
        name: input.name,
        description: input.description,
        isPrivate: input.isPrivate ?? false,
        code,
        ownerId: userId,
        members: {
          create: {
            userId: userId,
            role: 'owner'
          }
        }
      },
      include: {
        _count: {
          select: { members: true }
        }
      }
    })

    return room
  },

  /**
   * Join a room via invite code
   */
  async joinRoom(userId: string, input: JoinRoomInput) {
    const room = await prisma.room.findUnique({
      where: { code: input.code.toUpperCase() }
    })

    if (!room) throw createError('Invalid invite code', 404)

    // Check if already a member
    const existingMember = await prisma.roomMember.findUnique({
      where: {
        userId_roomId: {
          userId,
          roomId: room.id
        }
      }
    })

    if (existingMember) {
      return room // Already joined
    }

    // Join the room
    await prisma.roomMember.create({
      data: {
        userId,
        roomId: room.id,
        role: 'member'
      }
    })

    return room
  },

  /**
   * Delete a room (Owner only)
   */
  async deleteRoom(userId: string, roomId: string) {
    const room = await prisma.room.findUnique({
      where: { id: roomId }
    })

    if (!room) throw createError('Room not found', 404)
    if (room.ownerId !== userId) throw createError('Only the room owner can delete it', 403)

    // Instead of deleting the room (which cascades and deletes the task),
    // we just remove the user's membership to hide it from their Study Rooms list,
    // and delete all messages in the room.
    await prisma.message.deleteMany({
      where: { roomId }
    })

    await prisma.roomMember.delete({
      where: {
        userId_roomId: { userId, roomId }
      }
    })

    return { success: true }
  }
}
