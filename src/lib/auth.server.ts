import 'server-only'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser, verifyToken, TokenPayload } from '@/lib/jwt.server'

export interface AuthenticatedRequest extends NextRequest {
  user?: TokenPayload
}

/**
 * 인증 미들웨어
 * 요청에서 사용자 정보를 추출하고 검증
 * accessToken 만료 시 refreshToken으로 자동 갱신하고 응답에 새 쿠키 설정
 */
export async function withAuth(
  request: NextRequest,
  handler: (
    req: AuthenticatedRequest,
    user: TokenPayload,
  ) => Promise<NextResponse>,
): Promise<NextResponse> {
  const authResult = await getAuthUser(request)

  if (!authResult) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 })
  }

  const { payload: user, refreshedAccessToken } = authResult

  // request 객체에 user 정보 추가
  const authenticatedRequest = request as AuthenticatedRequest
  authenticatedRequest.user = user

  const response = await handler(authenticatedRequest, user)

  // 토큰이 갱신된 경우 응답에 새 쿠키 설정
  if (refreshedAccessToken) {
    response.cookies.set('accessToken', refreshedAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 15, // 15분
      path: '/',
    })
  }

  return response
}

/**
 * 선택적 인증 미들웨어
 * 인증되지 않은 경우에도 요청을 처리하지만, 인증 정보가 있으면 추가
 * accessToken 만료 시 refreshToken으로 자동 갱신
 */
export async function withOptionalAuth(
  request: NextRequest,
  handler: (
    req: AuthenticatedRequest,
    user: TokenPayload | null,
  ) => Promise<NextResponse>,
): Promise<NextResponse> {
  const authResult = await getAuthUser(request)

  const authenticatedRequest = request as AuthenticatedRequest
  const user = authResult?.payload ?? null
  const refreshedAccessToken = authResult?.refreshedAccessToken

  if (user) {
    authenticatedRequest.user = user
  }

  const response = await handler(authenticatedRequest, user)

  // 토큰이 갱신된 경우 응답에 새 쿠키 설정
  if (refreshedAccessToken) {
    response.cookies.set('accessToken', refreshedAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 15, // 15분
      path: '/',
    })
  }

  return response
}

/**
 * 페이지에서 현재 인증된 사용자 정보 가져오기
 * 쿠키의 accessToken을 검증하여 TokenPayload 반환
 * accessToken 만료 시 refreshToken이 유효하면 세션 유지 (쿠키 갱신은 API 호출 시 처리)
 */
export async function getAuthSession(): Promise<TokenPayload | null> {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('accessToken')?.value
  const refreshToken = cookieStore.get('refreshToken')?.value

  // accessToken이 있으면 먼저 검증
  if (accessToken) {
    const payload = await verifyToken(accessToken)
    if (payload) {
      return payload
    }
  }

  // accessToken이 없거나 만료된 경우, refreshToken 유효성만 확인
  // (서버 컴포넌트에서는 쿠키 수정 불가, 실제 갱신은 API 호출 시 withAuth에서 처리)
  if (refreshToken) {
    const refreshPayload = await verifyToken(refreshToken)
    if (refreshPayload) {
      return refreshPayload
    }
  }

  return null
}
