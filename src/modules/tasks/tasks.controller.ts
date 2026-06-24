import { Response, NextFunction } from 'express'
import { AuthRequest } from '../../types'
import { tasksService } from './tasks.service'
import { CreateTaskInput, UpdateTaskInput } from './tasks.types'

export const tasksController = {
  async getTasks(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const tasks = await tasksService.getTasks(userId)
      res.json({ success: true, data: tasks })
    } catch (err) {
      next(err)
    }
  },

  async createTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const input: CreateTaskInput = req.body
      const task = await tasksService.createTask(userId, input)
      res.status(201).json({ success: true, data: task })
    } catch (err) {
      next(err)
    }
  },

  async updateTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const taskId = req.params.taskId as string
      const input: UpdateTaskInput = req.body
      const task = await tasksService.updateTask(userId, taskId, input)
      res.json({ success: true, data: task })
    } catch (err) {
      next(err)
    }
  },

  async deleteTask(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const taskId = req.params.taskId as string
      await tasksService.deleteTask(userId, taskId)
      res.json({ success: true })
    } catch (err) {
      next(err)
    }
  }
}
