import { prisma } from '../../lib/prisma'

export const dashboardService = {
  async getDashboardData(userId: string) {
    const now = new Date()
    
    // Dates for this week
    const thisWeekStart = new Date(now)
    thisWeekStart.setDate(now.getDate() - now.getDay())
    thisWeekStart.setHours(0, 0, 0, 0)
    
    // Dates for last week
    const lastWeekStart = new Date(thisWeekStart)
    lastWeekStart.setDate(thisWeekStart.getDate() - 7)
    const lastWeekEnd = new Date(thisWeekStart)
    
    // 1. Tasks Completed
    const thisWeekTasks = await prisma.task.count({
      where: {
        OR: [{ assigneeId: userId }, { creatorId: userId }],
        status: 'done',
        updatedAt: { gte: thisWeekStart }
      }
    })
    const lastWeekTasks = await prisma.task.count({
      where: {
        OR: [{ assigneeId: userId }, { creatorId: userId }],
        status: 'done',
        updatedAt: { gte: lastWeekStart, lt: lastWeekEnd }
      }
    })
    
    const tasksCompleted = {
      value: thisWeekTasks,
      percentageChange: lastWeekTasks === 0 ? 100 : Math.round(((thisWeekTasks - lastWeekTasks) / lastWeekTasks) * 100)
    }

    // 2. Study Hours
    const thisWeekSessions = await prisma.studySession.findMany({
      where: {
        organizerId: userId,
        startTime: { gte: thisWeekStart }
      }
    })
    const lastWeekSessions = await prisma.studySession.findMany({
      where: {
        organizerId: userId,
        startTime: { gte: lastWeekStart, lt: lastWeekEnd }
      }
    })
    
    const calculateHours = (sessions: any[]) => {
      return sessions.reduce((acc, s) => {
        const diff = new Date(s.endTime).getTime() - new Date(s.startTime).getTime()
        return acc + diff / (1000 * 60 * 60)
      }, 0)
    }
    
    const thisWeekHours = calculateHours(thisWeekSessions)
    const lastWeekHours = calculateHours(lastWeekSessions)
    
    const studyHours = {
      value: Number(thisWeekHours.toFixed(1)),
      absoluteChange: Number((thisWeekHours - lastWeekHours).toFixed(1))
    }

    // 3. AI Interactions
    const thisWeekAi = await prisma.aiMessage.count({
      where: {
        role: 'user',
        createdAt: { gte: thisWeekStart },
        chat: { userId }
      }
    })
    const aiInteractions = {
      value: thisWeekAi
    }

    // 4. Budget Status
    const expenses = await prisma.expense.findMany({
      where: { userId }
    })
    const balance = expenses.reduce((acc, e) => {
      return e.type === 'income' ? acc + e.amount : acc - e.amount
    }, 0)
    
    const budgetStatus = {
      value: balance
    }

    // 5. Activity Data (Last 7 days study hours per day)
    const activityData = []
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now)
      dayStart.setDate(now.getDate() - i)
      dayStart.setHours(0, 0, 0, 0)
      
      const dayEnd = new Date(dayStart)
      dayEnd.setDate(dayStart.getDate() + 1)
      
      const daySessions = await prisma.studySession.findMany({
        where: {
          organizerId: userId,
          startTime: { gte: dayStart, lt: dayEnd }
        }
      })
      
      activityData.push({
        name: dayStart.toLocaleDateString('en-US', { weekday: 'short' }),
        hours: Number(calculateHours(daySessions).toFixed(1))
      })
    }

    // 6. Priority Tasks
    const priorityTasksRaw = await prisma.task.findMany({
      where: {
        OR: [{ assigneeId: userId }, { creatorId: userId }],
        status: { not: 'done' }
      },
      include: {
        room: { select: { name: true } }
      },
      orderBy: [
        { dueDate: 'asc' },
        { priority: 'desc' }
      ],
      take: 4
    })
    
    const priorityTasks = priorityTasksRaw.map(t => {
      let daysUntilDue = null
      if (t.dueDate) {
        const diffTime = new Date(t.dueDate).getTime() - now.getTime()
        daysUntilDue = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      }
      
      let dueStr = 'No due date'
      if (daysUntilDue !== null) {
        if (daysUntilDue < 0) dueStr = `Overdue by ${Math.abs(daysUntilDue)} days`
        else if (daysUntilDue === 0) dueStr = 'Due today'
        else dueStr = `Due in ${daysUntilDue} days`
      }
      
      return {
        id: t.id,
        course: t.room?.name || 'Personal',
        title: t.title,
        due: dueStr,
        status: t.status === 'in_progress' ? 'In Progress' : 'Todo',
        priority: t.priority.toUpperCase()
      }
    })

    return {
      tasksCompleted,
      studyHours,
      aiInteractions,
      budgetStatus,
      activityData,
      priorityTasks
    }
  }
}
