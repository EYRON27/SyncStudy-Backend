export interface CreateTaskInput {
  course: string
  title: string
  priority: string // "low" | "medium" | "high"
  status?: string
  dueDate?: string
}

export interface UpdateTaskInput {
  title?: string
  status?: string
  priority?: string
  course?: string
  dueDate?: string
}
