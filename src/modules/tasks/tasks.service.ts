import { prisma } from '../../lib/prisma'
import { createError } from '../../middleware/error.middleware'
import { CreateTaskInput, UpdateTaskInput } from './tasks.types'

export const tasksService = {
  /**
   * Get all tasks for the dashboard
   * Fetches tasks the user created or is assigned to.
   */
  async getTasks(userId: string) {
    return prisma.task.findMany({
      where: {
        OR: [
          { creatorId: userId },
          { assigneeId: userId },
        ]
      },
      include: {
        room: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })
  },

  /**
   * Create a new task
   */
  async createTask(userId: string, input: CreateTaskInput) {
    // 1. Find or create the room based on the 'course' name
    let room = await prisma.room.findFirst({
      where: { 
        name: input.course,
        ownerId: userId // For personal study spaces
      }
    })

    if (!room) {
      room = await prisma.room.create({
        data: {
          name: input.course,
          code: Math.random().toString(36).substring(2, 8).toUpperCase(),
          isPrivate: true,
          ownerId: userId,
          members: {
            create: {
              userId: userId,
              role: 'owner'
            }
          }
        }
      })
    } else {
      // Re-add the user to the room if they were previously removed (e.g., when the room was "deleted")
      const existingMember = await prisma.roomMember.findUnique({
        where: { userId_roomId: { userId, roomId: room.id } }
      })
      if (!existingMember) {
        await prisma.roomMember.create({
          data: { userId, roomId: room.id, role: 'owner' }
        })
      }
    }

    // 2. Create the task
    return prisma.task.create({
      data: {
        title: input.title,
        priority: input.priority.toUpperCase(),
        status: input.status || 'todo',
        dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
        roomId: room.id,
        creatorId: userId,
      },
      include: {
        room: { select: { name: true } }
      }
    })
  },

  /**
   * Update a task (e.g., drag and drop status)
   */
  async updateTask(userId: string, taskId: string, input: UpdateTaskInput) {
    const task = await prisma.task.findUnique({ where: { id: taskId } })
    if (!task) throw createError('Task not found', 404)

    if (task.creatorId !== userId && task.assigneeId !== userId) {
      throw createError('Not authorized to update this task', 403)
    }

    const updateData: any = {
      title: input.title,
      status: input.status,
      priority: input.priority ? input.priority.toUpperCase() : undefined,
      dueDate: input.dueDate ? new Date(input.dueDate) : undefined
    }

    // If they changed the course, find/create the new room
    if (input.course) {
      let room = await prisma.room.findFirst({
        where: { name: input.course, ownerId: userId }
      })
      if (!room) {
        room = await prisma.room.create({
          data: {
            name: input.course,
            code: Math.random().toString(36).substring(2, 8).toUpperCase(),
            isPrivate: true,
            ownerId: userId,
            members: { create: { userId: userId, role: 'owner' } }
          }
        })
      } else {
        const existingMember = await prisma.roomMember.findUnique({
          where: { userId_roomId: { userId, roomId: room.id } }
        })
        if (!existingMember) {
          await prisma.roomMember.create({
            data: { userId, roomId: room.id, role: 'owner' }
          })
        }
      }
      updateData.roomId = room.id
    }

    return prisma.task.update({
      where: { id: taskId },
      data: updateData,
      include: {
        room: { select: { name: true } }
      }
    })
  },

  /**
   * Delete a task
   */
  async deleteTask(userId: string, taskId: string) {
    const task = await prisma.task.findUnique({ where: { id: taskId } })
    if (!task) throw createError('Task not found', 404)

    if (task.creatorId !== userId) {
      throw createError('Only the creator can delete this task', 403)
    }

    await prisma.task.delete({ where: { id: taskId } })
    return { success: true }
  }
}
