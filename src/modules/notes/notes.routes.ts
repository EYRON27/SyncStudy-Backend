import { Router } from 'express'
import { notesController } from './notes.controller'
import { authenticate } from '../../middleware/auth.middleware'

const router = Router({ mergeParams: true }) // mergeParams allows access to :roomId from parent

// GET    /api/rooms/:roomId/notes
// POST   /api/rooms/:roomId/notes
router.get('/', authenticate, notesController.getNotes)
router.post('/', authenticate, notesController.createNote)

// PUT    /api/rooms/:roomId/notes/:noteId
// DELETE /api/rooms/:roomId/notes/:noteId
router.put('/:noteId', authenticate, notesController.updateNote)
router.delete('/:noteId', authenticate, notesController.deleteNote)

export default router
