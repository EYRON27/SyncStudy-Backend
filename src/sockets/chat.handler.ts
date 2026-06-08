import { Server, Socket } from 'socket.io'
import { prisma } from '../../lib/prisma'

/**
 * Chat room Socket.IO event handler.
 *
 * Events (client → server):
 *   chat:join     { roomId }         — join a room channel
 *   chat:leave    { roomId }         — leave a room channel
 *   chat:message  { roomId, content, senderId } — send a message
 *
 * Events (server → client):
 *   chat:message  { message }        — broadcast new message to room
 *   chat:user_joined { userId }
 *   chat:user_left   { userId }
 */
export const registerChatHandlers = (io: Server, socket: Socket) => {
  socket.on('chat:join', ({ roomId }: { roomId: string }) => {
    socket.join(roomId)
    socket.to(roomId).emit('chat:user_joined', { userId: socket.data.userId })
    console.log(`🟢 Socket ${socket.id} joined room ${roomId}`)
  })

  socket.on('chat:leave', ({ roomId }: { roomId: string }) => {
    socket.leave(roomId)
    socket.to(roomId).emit('chat:user_left', { userId: socket.data.userId })
  })

  socket.on(
    'chat:message',
    async ({ roomId, content, senderId }: { roomId: string; content: string; senderId: string }) => {
      try {
        const message = await prisma.message.create({
          data: { content, roomId, senderId },
          include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
        })
        io.to(roomId).emit('chat:message', { message })
      } catch (err) {
        socket.emit('chat:error', { message: 'Failed to send message' })
      }
    },
  )
}
