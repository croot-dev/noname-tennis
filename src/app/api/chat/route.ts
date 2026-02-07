import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth.server'
import { handleApiError } from '@/lib/api.error'
import { getMemberById } from '@/domains/member'
import { processChatStream } from '@/domains/chat'
import type { ChatRequestDto } from '@/domains/chat'

export async function POST(req: NextRequest) {
  return withAuth(req, async (authenticatedReq, user) => {
    try {
      const body: ChatRequestDto = await authenticatedReq.json()

      if (
        !body.messages ||
        !Array.isArray(body.messages) ||
        body.messages.length === 0
      ) {
        return NextResponse.json(
          { error: '메시지가 필요합니다.' },
          { status: 400 },
        )
      }

      const member = await getMemberById(user.memberId)
      if (!member) {
        return NextResponse.json(
          { error: '회원 정보를 찾을 수 없습니다.' },
          { status: 404 },
        )
      }

      const stream = await processChatStream(body.messages, member.seq)

      return new NextResponse(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      })
    } catch (error) {
      return handleApiError(error, '챗봇 처리 중 오류가 발생했습니다.')
    }
  })
}
