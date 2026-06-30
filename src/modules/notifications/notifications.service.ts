import { prisma } from '../../lib/prisma'
import { getIO } from '../../sockets/socketStore'

export const notificationsService = {
  async getNotifications(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50
    })
  },

  async markAsRead(userId: string, notificationId: string) {
    return prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true }
    })
  },

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    })
  },

  async createNotification(data: { userId: string, title: string, desc: string, type: string }) {
    const notification = await prisma.notification.create({
      data
    })
    
    // Broadcast instantly to the user if they are online!
    getIO().to(data.userId).emit('notification', notification)
    
    return notification
  }
}
