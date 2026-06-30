import cron from 'node-cron'
import { prisma } from '../../lib/prisma'
import { notificationsService } from '../notifications/notifications.service'

export const schedulerService = {
  startDailyJobs() {
    // Run at 8:00 AM every day
    cron.schedule('0 8 * * *', async () => {
      console.log('⏳ Running daily task scheduler...')
      await this.checkDueTasks()
    })
    console.log('⏰ Scheduler initialized (runs daily at 8:00 AM)')
  },

  async checkDueTasks() {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      const dueTasks = await prisma.task.findMany({
        where: {
          dueDate: {
            gte: today,
            lt: tomorrow
          },
          status: {
            not: 'done'
          }
        },
        include: {
          room: true
        }
      })

      for (const task of dueTasks) {
        const targetUserId = task.assigneeId || task.creatorId
        
        await notificationsService.createNotification({
          userId: targetUserId,
          title: 'Task Due Today!',
          desc: `"${task.title}" in ${task.room.name} is due today!`,
          type: 'task'
        })
      }
      
      console.log(`✅ Scheduler checked due tasks: Found ${dueTasks.length} tasks due today.`)
      return dueTasks.length
    } catch (err) {
      console.error('Error running checkDueTasks:', err)
      throw err
    }
  }
}
