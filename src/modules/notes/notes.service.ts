import { prisma } from '../../lib/prisma'
import { createError } from '../../middleware/error.middleware'
import cloudinary from '../../config/cloudinary'
import type { CreateNoteInput, UpdateNoteInput } from './notes.types'

export const notesService = {
  /** Get all notes in a room */
  async getNotes(userId: string, roomId: string) {
    const member = await prisma.roomMember.findUnique({
      where: { userId_roomId: { userId, roomId } }
    })
    if (!member) throw createError('Not a member of this room', 403)

    return prisma.note.findMany({
      where: { roomId },
      include: { attachments: { orderBy: { createdAt: 'asc' } } },
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
      data: { title: input.title, content: input.content ?? '', roomId, authorId: userId },
      include: { attachments: true }
    })
  },

  /** Update a note's title or content */
  async updateNote(userId: string, noteId: string, input: UpdateNoteInput) {
    const note = await prisma.note.findUnique({ where: { id: noteId } })
    if (!note) throw createError('Note not found', 404)
    if (note.authorId !== userId) throw createError('Not authorized', 403)

    return prisma.note.update({
      where: { id: noteId },
      data: {
        ...(input.title !== undefined && { title: input.title }),
        ...(input.content !== undefined && { content: input.content })
      },
      include: { attachments: true }
    })
  },

  /** Delete a note (and clean up Cloudinary attachments) */
  async deleteNote(userId: string, noteId: string) {
    const note = await prisma.note.findUnique({
      where: { id: noteId },
      include: { attachments: true }
    })
    if (!note) throw createError('Note not found', 404)
    if (note.authorId !== userId) throw createError('Only the author can delete this note', 403)

    for (const att of note.attachments) {
      await cloudinary.uploader.destroy(att.publicId, {
        resource_type: att.fileType === 'pdf' ? 'raw' : 'image'
      }).catch(() => {})
    }

    await prisma.note.delete({ where: { id: noteId } })
    return { success: true }
  },

  /** Upload a file and attach it to a note */
  async uploadAttachment(userId: string, noteId: string, file: Express.Multer.File) {
    const note = await prisma.note.findUnique({ where: { id: noteId } })
    if (!note) throw createError('Note not found', 404)
    if (note.authorId !== userId) throw createError('Not authorized', 403)

    const isImage = file.mimetype.startsWith('image/')
    const fileType = isImage ? 'image' : 'pdf'
    const folder = `syncstudy/notes/${noteId}`

    // Upload buffer to Cloudinary
    const uploadResult = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: isImage ? 'image' : 'raw',
          format: isImage ? undefined : 'pdf'
        },
        (err, result) => {
          if (err || !result) return reject(err ?? new Error('Upload failed'))
          resolve({ secure_url: result.secure_url, public_id: result.public_id })
        }
      ).end(file.buffer)
    })

    return prisma.noteAttachment.create({
      data: {
        fileName: file.originalname,
        fileType,
        url: uploadResult.secure_url,
        publicId: uploadResult.public_id,
        size: file.size,
        noteId,
        uploaderId: userId
      }
    })
  },

  /** Delete a single attachment from DB + Cloudinary */
  async deleteAttachment(userId: string, attachmentId: string) {
    const att = await prisma.noteAttachment.findUnique({ where: { id: attachmentId } })
    if (!att) throw createError('Attachment not found', 404)
    if (att.uploaderId !== userId) throw createError('Not authorized', 403)

    await cloudinary.uploader.destroy(att.publicId, { resource_type: att.fileType === 'pdf' ? 'raw' : 'image' }).catch(() => {})
    await prisma.noteAttachment.delete({ where: { id: attachmentId } })
    return { success: true }
  }
}

