import { Server, Socket } from 'socket.io'

/**
 * Kanban board Socket.IO event handler.
 * Syncs task moves and status changes in real-time across room members.
 *
 * Events (client → server):
 *   kanban:join         { roomId }              — subscribe to board updates
 *   kanban:task_moved   { roomId, taskId, newStatus, newPosition } — drag drop
 *   kanban:task_created { roomId, task }        — new card added
 *   kanban:task_updated { roomId, task }        — card edited
 *   kanban:task_deleted { roomId, taskId }      — card removed
 *
 * Events (server → client):
 *   kanban:task_moved   { taskId, newStatus, newPosition }
 *   kanban:task_created { task }
 *   kanban:task_updated { task }
 *   kanban:task_deleted { taskId }
 */
export const registerKanbanHandlers = (io: Server, socket: Socket) => {
  socket.on('kanban:join', ({ roomId }: { roomId: string }) => {
    socket.join(`kanban:${roomId}`)
  })

  socket.on(
    'kanban:task_moved',
    ({ roomId, taskId, newStatus, newPosition }: {
      roomId: string; taskId: string; newStatus: string; newPosition: number
    }) => {
      socket.to(`kanban:${roomId}`).emit('kanban:task_moved', { taskId, newStatus, newPosition })
    },
  )

  socket.on('kanban:task_created', ({ roomId, task }: { roomId: string; task: unknown }) => {
    socket.to(`kanban:${roomId}`).emit('kanban:task_created', { task })
  })

  socket.on('kanban:task_updated', ({ roomId, task }: { roomId: string; task: unknown }) => {
    socket.to(`kanban:${roomId}`).emit('kanban:task_updated', { task })
  })

  socket.on('kanban:task_deleted', ({ roomId, taskId }: { roomId: string; taskId: string }) => {
    socket.to(`kanban:${roomId}`).emit('kanban:task_deleted', { taskId })
  })
}
