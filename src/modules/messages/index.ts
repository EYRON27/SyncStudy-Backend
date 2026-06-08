// Module: Messages (Chat history)
// REST endpoints for fetching paginated chat history per room.
// Real-time delivery is handled via Socket.IO (see src/sockets/chat.handler.ts).
//
// Files to implement:
//   messages.routes.ts  — GET /api/rooms/:roomId/messages?page=1&limit=50
//                         DELETE /api/rooms/:roomId/messages/:messageId
//   messages.controller.ts
//   messages.service.ts
//   messages.types.ts
