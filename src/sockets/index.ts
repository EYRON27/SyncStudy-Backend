import { Server } from 'socket.io'
import http from 'http'
import { env } from '../config/env'
import { verifyToken } from '../utils/jwt'
import { registerChatHandlers } from './chat.handler'
import { registerKanbanHandlers } from './kanban.handler'

/**
 * Initialise the Socket.IO server on top of the HTTP server.
 * Attaches JWT authentication as a middleware so only valid users connect.
 */
export const initSocketServer = (httpServer: http.Server): Server => {
  const io = new Server(httpServer, {
    cors: {
      origin: env.ALLOWED_ORIGINS,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  })

  // ─── Socket.IO auth middleware ─────────────────────────────────────────────
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token as string | undefined
    if (!token) return next(new Error('Authentication required'))

    try {
      const payload = verifyToken(token)
      socket.data.userId = payload.userId
      socket.data.email = payload.email
      next()
    } catch {
      next(new Error('Invalid token'))
    }
  })

  // ─── Connection ────────────────────────────────────────────────────────────
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id} (user: ${socket.data.userId})`)

    registerChatHandlers(io, socket)
    registerKanbanHandlers(io, socket)

    socket.on('disconnect', (reason) => {
      console.log(`🔴 Socket disconnected: ${socket.id} — ${reason}`)
    })
  })

  return io
}
