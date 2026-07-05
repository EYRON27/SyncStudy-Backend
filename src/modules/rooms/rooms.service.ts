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
   * - Saves ALL members' notes to their Personal Notes (roomId = null)
   * - Sends a notification to every non-owner member
   * - Fully deletes the room (tasks, messages, and memberships cascade-delete)
   */
  async deleteRoom(userId: string, roomId: string) {
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: {
        members: {
          select: { userId: true, role: true }
        }
      }
    })

    if (!room) throw createError('Room not found', 404)
    if (room.ownerId !== userId) throw createError('Only the room owner can delete it', 403)

    // 1. Fully delete the room — tasks, messages, and memberships are cascade-deleted.
    //    Because of Prisma's `onDelete: SetNull` on the Note model, ALL notes in this room
    //    will automatically have their `roomId` set to `null`, which perfectly drops them
    //    into their respective author's Personal Notes!
    await prisma.room.delete({ where: { id: roomId } })

    // 2. Notify every non-owner member that the room was deleted.
    const nonOwnerMembers = room.members.filter(m => m.userId !== userId)
    if (nonOwnerMembers.length > 0) {
      await prisma.notification.createMany({
        data: nonOwnerMembers.map(m => ({
          userId: m.userId,
          title: 'Study Room Deleted',
          desc: `The room "${room.name}" was deleted by the owner. Your notes from this room have been saved to your Personal Notes.`,
          type: 'room',
          isRead: false,
        }))
      })
    }

    // 3. Fully delete the room — tasks, messages, and memberships are cascade-deleted.
    //    Notes are already detached (roomId = null) so they won't be cascade-deleted.
    await prisma.room.delete({ where: { id: roomId } })

    return { success: true }
  }
}
