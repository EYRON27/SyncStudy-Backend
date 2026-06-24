import { Request, Response, NextFunction } from 'express'
import { tasksService } from './tasks.service'
import { CreateTaskInput, UpdateTaskInput } from './tasks.types'

export const tasksController = {
  async getTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const tasks = await tasksService.getTasks(userId)
      res.json({ success: true, data: tasks })
    } catch (err) {
      next(err)
    }
  },

  async createTask(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const input: CreateTaskInput = req.body
      const task = await tasksService.createTask(userId, input)
      res.status(201).json({ success: true, data: task })
    } catch (err) {
      next(err)
    }
  },

  async updateTask(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const { taskId } = req.params
      const input: UpdateTaskInput = req.body
      const task = await tasksService.updateTask(userId, taskId, input)
      res.json({ success: true, data: task })
    } catch (err) {
      next(err)
    }
  },

  async deleteTask(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const { taskId } = req.params
      await tasksService.deleteTask(userId, taskId)
      res.json({ success: true })
    } catch (err) {
      next(err)
    }
  }
}
