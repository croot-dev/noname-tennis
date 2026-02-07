export type ChatRole = 'user' | 'assistant'

export interface ChatMessage {
  role: ChatRole
  content: string
}

export interface ChatRequestDto {
  messages: ChatMessage[]
}

export interface CreateEventToolParams {
  title: string
  start_datetime: string
  end_datetime: string
  location_name?: string
  location_url?: string
  max_participants: number
  description?: string
}

export interface GetEventsToolParams {
  year: number
  month: number
}

export interface GetCourtsToolParams {
  page?: number
  limit?: number
}
