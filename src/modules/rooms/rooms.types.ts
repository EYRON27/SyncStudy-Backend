export interface CreateRoomInput {
  name: string
  description?: string
  isPrivate?: boolean
}

export interface JoinRoomInput {
  code: string
}
