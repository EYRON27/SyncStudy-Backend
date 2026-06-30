import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import { corsOptions } from './config/cors'
import { env } from './config/env'
import { errorHandler } from './middleware/error.middleware'

// ─── Route imports ─────────────────────────────────────────────────────────
import authRoutes from './modules/auth/auth.routes'
import tasksRoutes from './modules/tasks/tasks.routes'
// import usersRoutes from './modules/users/users.routes'      // TODO
import roomsRoutes from './modules/rooms/rooms.routes'
import testimonialsRoutes from './modules/testimonials/testimonials.routes'
import statsRoutes from './modules/stats/stats.routes'
import expensesRoutes from './modules/expenses/expenses.routes'
import notificationsRoutes from './modules/notifications/notifications.routes'
import schedulerRoutes from './modules/scheduler/scheduler.routes'
import notesRoutes from './modules/notes/notes.routes'

const app = express()

// ─── Global Middleware ──────────────────────────────────────────────────────
app.use(helmet())
app.use(cors(corsOptions))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'))

// ─── Health check ───────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ─── Routes ─────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes)
// app.use('/api/users', usersRoutes)
app.use('/api/rooms', roomsRoutes)
app.use('/api/tasks', tasksRoutes)
app.use('/api/testimonials', testimonialsRoutes)
app.use('/api/stats', statsRoutes)
app.use('/api/expenses', expensesRoutes)
app.use('/api/notifications', notificationsRoutes)
app.use('/api/scheduler', schedulerRoutes)
app.use('/api/rooms/:roomId/notes', notesRoutes)

// ─── 404 handler ───────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' })
})

// ─── Global error handler (MUST be last) ───────────────────────────────────
app.use(errorHandler)

export default app
// Trigger restart
