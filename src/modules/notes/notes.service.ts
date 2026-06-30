import { prisma } from '../../lib/prisma'
import { createError } from '../../middleware/error.middleware'
import type { CreateNoteInput, UpdateNoteInput } from './notes.types'

export const notesService = {
  /** Get all notes in a room */
  async getNotes(userId: string, roomId: string) {
    // Verify user is a member of this room
    const member = await prisma.roomMember.findUnique({
      where: { userId_roomId: { userId, roomId } }
    })
    if (!member) throw createError('Not a member of this room', 403)

    return prisma.note.findMany({
      where: { roomId },
      orderBy: { updatedAt: 'desc' }
    })
  },

  /** Create a new note in a room */
  async createNote(userId: string, roomId: string, input: CreateNoteInput) {
    const member = await prisma.roomMember.findUnique({
      where: { userId_roomId: { userId, roomId } }
    })
    if (!member) throw createError('Not a member of this room', 403)

    return prisma.note.create({
      data: {
        title: input.title,
        content: input.content ?? '',
        roomId,
        authorId: userId
      }
    })
  },

  /** Update a note's title or content */
  async updateNote(userId: string, noteId: string, input: UpdateNoteInput) {
    const note = await prisma.note.findUnique({ where: { id: noteId } })
    if (!note) throw createError('Note not found', 404)

    // Only the author can update
    if (note.authorId !== userId) throw createError('Not authorized to update this note', 403)

    return prisma.note.update({
      where: { id: noteId },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.content !== undefined && { content: input.content })
      }
    })
  },

  /** Delete a note */
  async deleteNote(userId: string, noteId: string) {
    const note = await prisma.note.findUnique({ where: { id: noteId } })
    if (!note) throw createError('Note not found', 404)
    if (note.authorId !== userId) throw createError('Only the author can delete this note', 403)

    await prisma.note.delete({ where: { id: noteId } })
    return { success: true }
  }
}
