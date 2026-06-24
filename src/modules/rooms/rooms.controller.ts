import { Response, NextFunction } from 'express'
import { AuthRequest } from '../../types'
import { roomsService } from './rooms.service'
import { CreateRoomInput, JoinRoomInput } from './rooms.types'

export const roomsController = {
  async getRooms(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const rooms = await roomsService.getRooms(userId)
      res.json({ success: true, data: rooms })
    } catch (err) {
      next(err)
    }
  },

  async getRoomById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const roomId = req.params.roomId as string
      const room = await roomsService.getRoomById(userId, roomId)
      res.json({ success: true, data: room })
    } catch (err) {
      next(err)
    }
  },

  async createRoom(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const input: CreateRoomInput = req.body
      const room = await roomsService.createRoom(userId, input)
      res.status(201).json({ success: true, data: room })
    } catch (err) {
      next(err)
    }
  },

  async joinRoom(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const input: JoinRoomInput = req.body
      const room = await roomsService.joinRoom(userId, input)
      res.json({ success: true, data: room })
    } catch (err) {
      next(err)
    }
  },

  async deleteRoom(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.userId
      const roomId = req.params.roomId as string
      await roomsService.deleteRoom(userId, roomId)
      res.json({ success: true })
    } catch (err) {
      next(err)
    }
  }
}
