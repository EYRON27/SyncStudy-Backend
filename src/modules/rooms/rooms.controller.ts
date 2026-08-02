import { Response, NextFunction } from 'express'
import { AuthRequest } from '../../types'
import { roomsService } from './rooms.service'
import { CreateRoomInput, JoinRoomInput } from './rooms.types'
import { RtcTokenBuilder, RtcRole } from 'agora-token'

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
  },

  async getAgoraToken(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const channelName = req.query.channelName as string
      if (!channelName) {
        return res.status(400).json({ success: false, message: 'channelName parameter is required' })
      }

      const appId = process.env.AGORA_APP_ID || ''
      const appCertificate = process.env.AGORA_APP_CERTIFICATE || ''

      if (!appId || !appCertificate) {
        return res.status(500).json({ success: false, message: 'Agora credentials are missing on backend server' })
      }

      const expirationTimeInSeconds = 3600 * 24 // 24 hours valid
      const currentTimestamp = Math.floor(Date.now() / 1000)
      const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds

      const token = RtcTokenBuilder.buildTokenWithUid(
        appId,
        appCertificate,
        channelName,
        0, // 0 allows Agora to auto-assign UID
        RtcRole.PUBLISHER,
        privilegeExpiredTs,
        privilegeExpiredTs
      )

      res.json({ success: true, token, appId })
    } catch (err) {
      next(err)
    }
  }
}
