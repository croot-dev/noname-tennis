'use client'

import { useState, useCallback, useRef } from 'react'
import { authenticatedFetch } from '@/lib/api.client'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface StreamEvent {
  type: 'text' | 'tool_start' | 'tool_end' | 'done' | 'error'
  content?: string
  tool?: string
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [toolStatus, setToolStatus] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const sendMessage = useCallback(
    async (userMessage: string) => {
      if (!userMessage.trim() || isLoading) return

      const newUserMessage: ChatMessage = {
        role: 'user',
        content: userMessage,
      }
      const updatedMessages = [...messages, newUserMessage]
      setMessages([...updatedMessages, { role: 'assistant', content: '' }])
      setIsLoading(true)
      setToolStatus(null)

      try {
        abortControllerRef.current = new AbortController()

        const response = await authenticatedFetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: updatedMessages }),
          signal: abortControllerRef.current.signal,
        })

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }

        const reader = response.body?.getReader()
        if (!reader) throw new Error('스트림을 읽을 수 없습니다.')

        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })

          const lines = buffer.split('\n\n')
          buffer = lines.pop() ?? ''

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue
            const jsonStr = line.slice(6)

            try {
              const event: StreamEvent = JSON.parse(jsonStr)

              switch (event.type) {
                case 'text':
                  setMessages((prev) => {
                    const updated = [...prev]
                    const lastMsg = updated[updated.length - 1]
                    if (lastMsg?.role === 'assistant') {
                      lastMsg.content += event.content ?? ''
                    }
                    return updated
                  })
                  break

                case 'tool_start':
                  setToolStatus(
                    event.tool === 'create_event'
                      ? '일정을 생성하고 있습니다...'
                      : event.tool === 'get_events'
                        ? '일정을 조회하고 있습니다...'
                        : event.tool === 'get_courts'
                          ? '코트 정보를 조회하고 있습니다...'
                          : '처리 중...',
                  )
                  break

                case 'tool_end':
                  setToolStatus(null)
                  break

                case 'error':
                  setMessages((prev) => {
                    const updated = [...prev]
                    const lastMsg = updated[updated.length - 1]
                    if (lastMsg?.role === 'assistant') {
                      lastMsg.content =
                        event.content ?? '오류가 발생했습니다.'
                    }
                    return updated
                  })
                  break

                case 'done':
                  break
              }
            } catch {
              // JSON 파싱 실패 무시
            }
          }
        }
      } catch (error) {
        if ((error as Error).name === 'AbortError') return
        console.error('채팅 에러:', error)
        setMessages((prev) => {
          const updated = [...prev]
          const lastMsg = updated[updated.length - 1]
          if (lastMsg?.role === 'assistant') {
            lastMsg.content =
              '죄송합니다. 오류가 발생했습니다. 다시 시도해주세요.'
          }
          return updated
        })
      } finally {
        setIsLoading(false)
        setToolStatus(null)
        abortControllerRef.current = null
      }
    },
    [messages, isLoading],
  )

  const clearMessages = useCallback(() => {
    setMessages([])
  }, [])

  const cancelRequest = useCallback(() => {
    abortControllerRef.current?.abort()
    setIsLoading(false)
    setToolStatus(null)
  }, [])

  return {
    messages,
    isLoading,
    toolStatus,
    sendMessage,
    clearMessages,
    cancelRequest,
  }
}
