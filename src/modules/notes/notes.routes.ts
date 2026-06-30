import { Router } from 'express'
import { notesController } from './notes.controller'
import { authenticate } from '../../middleware/auth.middleware'
import { upload } from '../../middleware/upload.middleware'

const router = Router({ mergeParams: true })

// GET    /api/rooms/:roomId/notes
// POST   /api/rooms/:roomId/notes
router.get('/', authenticate, notesController.getNotes)
router.post('/', authenticate, notesController.createNote)

// PUT    /api/rooms/:roomId/notes/:noteId
// DELETE /api/rooms/:roomId/notes/:noteId
router.put('/:noteId', authenticate, notesController.updateNote)
router.delete('/:noteId', authenticate, notesController.deleteNote)

// POST   /api/rooms/:roomId/notes/:noteId/attachments
// DELETE /api/rooms/:roomId/notes/:noteId/attachments/:attachmentId
router.post('/:noteId/attachments', authenticate, upload.single('file'), notesController.uploadAttachment)
router.delete('/:noteId/attachments/:attachmentId', authenticate, notesController.deleteAttachment)

export default router

