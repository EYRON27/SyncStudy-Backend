import { prisma } from '../../lib/prisma'

export interface SearchResult {
  id: string
  type: 'task' | 'note' | 'room'
  title: string
  description?: string
  url: string
  metadata?: any
}

export const searchService = {
  async globalSearch(userId: string, query: string): Promise<SearchResult[]> {
    if (!query || query.trim().length === 0) return []

    const q = query.trim()
    const results: SearchResult[] = []

    // 1. Search Tasks
    const tasks = await prisma.task.findMany({
      where: {
        OR: [{ assigneeId: userId }, { creatorId: userId }],
        title: { contains: q, mode: 'insensitive' }
      },
      include: { room: true },
      take: 10
    })

    tasks.forEach(task => {
      results.push({
        id: task.id,
        type: 'task',
        title: task.title,
        description: `Status: ${task.status.replace('_', ' ')} • Priority: ${task.priority}`,
        url: '/tasks',
        metadata: { status: task.status, priority: task.priority }
      })
    })

    // 2. Search Notes
    const notes = await prisma.note.findMany({
      where: {
        AND: [
          {
            OR: [
              { authorId: userId },
              { room: { members: { some: { userId } } } }
            ]
          },
          {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { content: { contains: q, mode: 'insensitive' } }
            ]
          }
        ]
      },
      include: { room: true },
      take: 10
    })

    notes.forEach(note => {
      results.push({
        id: note.id,
        type: 'note',
        title: note.title,
        description: note.room ? `In room: ${note.room.name}` : 'Personal Note',
        url: note.roomId ? `/rooms/${note.roomId}/notes` : '/notes'
      })
    })

    // 3. Search Rooms
    const rooms = await prisma.room.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { userId } } }
        ],
        name: { contains: q, mode: 'insensitive' }
      },
      take: 10
    })

    rooms.forEach(room => {
      results.push({
        id: room.id,
        type: 'room',
        title: room.name,
        description: room.description || 'Study Room',
        url: `/rooms/${room.id}`
      })
    })

    // Sort or just return as is (grouped is fine)
    return results
  }
}
