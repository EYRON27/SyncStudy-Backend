// Trigger restart
import http from 'http'
import app from './app'
import { env } from './config/env'
import { initSocketServer } from './sockets'
import { prisma } from './lib/prisma'

const httpServer = http.createServer(app)

// ─── Socket.IO ─────────────────────────────────────────────────────────────
initSocketServer(httpServer)

// ─── Start ──────────────────────────────────────────────────────────────────
const start = async () => {
  try {
    // Verify database connection on startup
    await prisma.$connect()
    console.log('✅ Database connected')

    httpServer.listen(env.PORT, () => {
      console.log(`🚀 Server running on port ${env.PORT} [${env.NODE_ENV}]`)
      console.log(`   REST  → http://localhost:${env.PORT}/api`)
      console.log(`   WS    → ws://localhost:${env.PORT}`)
    })
  } catch (err) {
    console.error('❌ Failed to start server:', err)
    await prisma.$disconnect()
    process.exit(1)
  }
}

// ─── Graceful shutdown ──────────────────────────────────────────────────────
const shutdown = async (signal: string) => {
  console.log(`\n⚠️  Received ${signal}. Shutting down gracefully...`)
  await prisma.$disconnect()
  httpServer.close(() => {
    console.log('🛑 Server closed')
    process.exit(0)
  })
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

start()
