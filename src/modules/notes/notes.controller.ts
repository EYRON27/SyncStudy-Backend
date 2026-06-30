import { Response, NextFunction } from 'express'
import { AuthRequest } from '../../types'
import { notesService } from './notes.service'
import { success } from '../../utils/response'

export const notesController = {
  async getNotes(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const roomId = req.params.roomId as string
      const data = await notesService.getNotes(userId, roomId)
      return success({ res, data })
    } catch (err) {
      next(err)
    }
  },

  async createNote(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const roomId = req.params.roomId as string
      const data = await notesService.createNote(userId, roomId, req.body)
      return success({ res, statusCode: 201, message: 'Note created', data })
    } catch (err) {
      next(err)
    }
  },

  async updateNote(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const noteId = req.params.noteId as string
      const data = await notesService.updateNote(userId, noteId, req.body)
      return success({ res, message: 'Note updated', data })
    } catch (err) {
      next(err)
    }
  },

  async deleteNote(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const noteId = req.params.noteId as string
      await notesService.deleteNote(userId, noteId)
      return success({ res, message: 'Note deleted' })
    } catch (err) {
      next(err)
    }
  }
}
