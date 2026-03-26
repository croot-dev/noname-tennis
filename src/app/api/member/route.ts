import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth.server'
import { handleApiError } from '@/lib/api.error'
import { getMemberList } from '@/domains/member'
import { register } from '@/domains/auth'
import { createAccessToken, createRefreshToken } from '@/lib/jwt.server'
import { parsePaginationParams } from '@/lib/query.utils'

// 멤버 목록 조회 API
export async function GET(req: NextRequest) {
  return withAuth(req, async (authenticatedReq) => {
    try {
      const { searchParams } = new URL(authenticatedReq.url)
      const { page, limit } = parsePaginationParams(
        searchParams.get('page'),
        searchParams.get('limit'),
      )

      const result = await getMemberList(page, limit)

      return NextResponse.json({
        ...result,
        page,
        limit,
      })
    } catch (error) {
      console.error('게시글 목록 조회 에러:', error)
      return handleApiError(error, '게시글 목록 조회 중 오류가 발생했습니다.')
    }
  })
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { member_id, email, name, birthdate, gender, nickname, ntrp, phone } =
      body

    const user = await register({
      member_id,
      email,
      name,
      birthdate,
      gender,
      nickname,
      ntrp,
      ...(phone && { phone }),
    })

    // JWT 토큰 생성
    const accessToken = await createAccessToken({
      memberId: user.member_id,
      memberSeq: Number(user.seq),
      email: user.email,
      roleName: user.role_name,
      roleCode: user.role_code,
    })

    const refreshToken = await createRefreshToken({
      memberId: user.member_id,
      memberSeq: Number(user.seq),
      email: user.email,
      roleName: user.role_name,
      roleCode: user.role_code,
    })

    // 쿠키 설정
    const response = NextResponse.json(
      {
        success: true,
        user: {
          member_id: user.member_id,
          email: user.email,
          name: user.name,
          birthdate: user.birthdate,
          nickname: user.nickname,
          ntrp: user.ntrp,
          gender: user.gender,
          phone: user.phone,
        },
        accessToken,
      },
      { status: 201 },
    )

    // HttpOnly 쿠키로 JWT 토큰 설정
    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 15, // 15분
      path: '/',
    })

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7일
      path: '/',
    })

    return response
  } catch (error) {
    console.error('회원가입 에러:', error)
    return handleApiError(error, '회원가입 처리 중 오류가 발생했습니다.')
  }
}
